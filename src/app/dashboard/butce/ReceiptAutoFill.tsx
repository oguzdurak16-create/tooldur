'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

declare global {
  interface Window { Tesseract?: any; }
}

const waitFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

function setInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

function setSelectValue(select: HTMLSelectElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set;
  setter?.call(select, value);
  select.dispatchEvent(new Event('change', { bubbles: true }));
}

function fieldByLabel(modal: Element, labelText: string) {
  const labels = Array.from(modal.querySelectorAll('.form label'));
  return labels.find((label) => label.querySelector('span')?.textContent?.trim().startsWith(labelText));
}

function statusNode(receiptLabel: Element) {
  let node = receiptLabel.parentElement?.querySelector<HTMLElement>('[data-receipt-ai-status]');
  if (!node) {
    node = document.createElement('div');
    node.dataset.receiptAiStatus = '1';
    node.style.cssText = 'margin:-2px 12px 10px;padding:9px 11px;border:1px solid rgba(255,177,27,.22);border-radius:10px;background:rgba(255,177,27,.06);color:#9fb0c7;font-size:11px;line-height:1.35';
    receiptLabel.insertAdjacentElement('afterend', node);
  }
  return node;
}

function normalizeDate(raw: string) {
  const m = raw.match(/(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{2,4})/);
  if (!m) return null;
  const y = m[3].length === 2 ? `20${m[3]}` : m[3];
  return `${y}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}

function parseAmount(text: string) {
  const lines = text.split(/\n+/).map((x) => x.trim()).filter(Boolean);
  const preferred = lines.filter((line) => /(GENEL\s*TOPLAM|ÖDENECEK|ODENECEK|TOPLAM|TOTAL)/i.test(line));
  const pool = preferred.length ? preferred : lines.slice(-18);
  const amounts: number[] = [];
  for (const line of pool) {
    const found = line.match(/\d{1,6}[.,]\d{2}/g) || [];
    for (const token of found) {
      const n = Number(token.replace(/\./g, '').replace(',', '.'));
      if (Number.isFinite(n) && n > 0 && n < 1000000) amounts.push(n);
    }
  }
  return amounts.length ? Math.max(...amounts) : null;
}

function parseMerchant(text: string) {
  const lines = text.split(/\n+/).map((x) => x.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const ignore = /(VERGİ|VERGI|TARİH|TARIH|SAAT|FİŞ|FIS|MERSİS|MERSIS|TEL|V\.D|TOPLAM|TOTAL|KDV|NO:|www\.|http)/i;
  return lines.find((line) => line.length >= 5 && line.length <= 90 && !ignore.test(line)) || null;
}

function inferCategory(text: string) {
  const t = text.toLocaleUpperCase('tr-TR');
  if (/(AKARYAKIT|PETROL|BENZİN|BENZIN|MOTORİN|MOTORIN|OPET|SHELL|BP |TOTALENERGIES)/.test(t)) return 'Yakıt / Ulaşım';
  if (/(ECZANE|HASTANE|SAĞLIK|SAGLIK|MEDİKAL|MEDIKAL)/.test(t)) return 'Sağlık';
  if (/(CAFE|KAFE|KAHVE|RESTAURANT|RESTORAN|DÖNER|DONER|PİZZA|PIZZA|KÖFTE|KOFTE|YEMEK)/.test(t)) return 'Dışarıda Yeme';
  if (/(TURKCELL|VODAFONE|TÜRK TELEKOM|TURK TELEKOM|ELEKTRİK|ELEKTRIK|SU FATURA|DOĞALGAZ|DOGALGAZ|İNTERNET|INTERNET)/.test(t)) return 'Fatura / İletişim';
  if (/(MARKET|ŞOK|SOK |BİM|BIM |A101|MİGROS|MIGROS|CARREFOUR|SEYHAN|GIDA|PEYNİR|PEYNIR|SÜT|SUT |EKMEK)/.test(t)) return 'Market / Gıda';
  return 'Diğer';
}

function loadTesseract() {
  if (window.Tesseract) return Promise.resolve(window.Tesseract);
  return new Promise<any>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-tesseract]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.Tesseract), { once: true });
      existing.addEventListener('error', () => reject(new Error('Yerel fiş okuma yüklenemedi.')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@6/dist/tesseract.min.js';
    script.async = true;
    script.dataset.tesseract = '1';
    script.onload = () => window.Tesseract ? resolve(window.Tesseract) : reject(new Error('Yerel fiş okuma başlatılamadı.'));
    script.onerror = () => reject(new Error('Yerel fiş okuma yüklenemedi.'));
    document.head.appendChild(script);
  });
}

async function localOcr(file: File) {
  const Tesseract = await loadTesseract();
  const result = await Tesseract.recognize(file, 'tur+eng');
  const text = result?.data?.text || '';
  return {
    amount: parseAmount(text),
    merchant: parseMerchant(text),
    date: normalizeDate(text),
    category: inferCategory(text),
    payment_method: null,
    confidence: Math.max(0, Math.min(1, (Number(result?.data?.confidence) || 0) / 100)),
    local: true,
  };
}

async function applyData(modal: Element, data: any) {
  const amountInput = fieldByLabel(modal, 'Tutar')?.querySelector<HTMLInputElement>('input');
  const categorySelect = fieldByLabel(modal, 'Kategori')?.querySelector<HTMLSelectElement>('select');
  const merchantInput = fieldByLabel(modal, 'İşyeri')?.querySelector<HTMLInputElement>('input');
  const dateInput = fieldByLabel(modal, 'Tarih')?.querySelector<HTMLInputElement>('input');
  const paymentSelect = fieldByLabel(modal, 'Ödeme')?.querySelector<HTMLSelectElement>('select');

  if (amountInput && data.amount) { setInputValue(amountInput, String(data.amount).replace('.', ',')); await waitFrame(); await waitFrame(); }
  if (categorySelect && data.category) { setSelectValue(categorySelect, data.category); await waitFrame(); await waitFrame(); }
  if (merchantInput && data.merchant) { setInputValue(merchantInput, data.merchant); await waitFrame(); await waitFrame(); }
  if (dateInput && data.date) { setInputValue(dateInput, data.date); await waitFrame(); await waitFrame(); }
  if (paymentSelect && data.payment_method) { setSelectValue(paymentSelect, data.payment_method); await waitFrame(); await waitFrame(); }
}

export default function ReceiptAutoFill() {
  useEffect(() => {
    const onChange = async (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (target.type !== 'file' || !target.closest('.bt .receipt')) return;
      const file = target.files?.[0];
      if (!file) return;

      const receiptLabel = target.closest('.receipt');
      const modal = target.closest('.modal');
      if (!receiptLabel || !modal) return;
      const status = statusNode(receiptLabel);
      status.textContent = 'Fiş okunuyor… Tutar, işyeri, tarih ve kategori otomatik doldurulacak.';
      status.style.color = '#f4bf4f';

      let data: any = null;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          const body = new FormData();
          body.append('receipt', file);
          const response = await fetch('/api/butce/receipt', {
            method: 'POST',
            headers: { Authorization: `Bearer ${session.access_token}` },
            body,
          });
          const payload = await response.json().catch(() => ({}));
          if (response.ok) data = payload;
        }

        if (!data) {
          status.textContent = 'Fiş cihazda okunuyor… İlk kullanım birkaç saniye sürebilir.';
          data = await localOcr(file);
        }

        if (!data?.amount) throw new Error('Fişte genel toplam güvenilir biçimde okunamadı.');
        await applyData(modal, data);

        const confidence = Math.round((Number(data.confidence) || 0) * 100);
        status.textContent = `Fiş okundu. Alanlar otomatik dolduruldu${data.local ? ' · cihazda işlendi' : ''}${confidence ? ` · güven %${confidence}` : ''}. Kaydetmeden önce kontrol et.`;
        status.style.color = '#6ee7b7';
      } catch (error: any) {
        status.textContent = error?.message || 'Fiş otomatik okunamadı. Elle giriş yapabilirsin.';
        status.style.color = '#fca5a5';
      }
    };

    document.addEventListener('change', onChange, true);
    return () => document.removeEventListener('change', onChange, true);
  }, []);

  return null;
}
