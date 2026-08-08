'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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

async function compressReceipt(file: File): Promise<File> {
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Fiş fotoğrafı işlenemedi.'));
      img.src = url;
    });

    const maxSide = 1800;
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height));
    const width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale));
    const height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Fiş fotoğrafı hazırlanamadı.');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.78));
    if (!blob) throw new Error('Fiş fotoğrafı sıkıştırılamadı.');
    return new File([blob], 'receipt.jpg', { type: 'image/jpeg', lastModified: Date.now() });
  } finally {
    URL.revokeObjectURL(url);
  }
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
      status.textContent = 'Fiş hazırlanıyor…';
      status.style.color = '#f4bf4f';

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error('Oturum bulunamadı.');

        const uploadFile = await compressReceipt(file);
        status.textContent = 'Fiş sunucuda okunuyor… Tutar, işyeri, tarih ve kategori otomatik doldurulacak.';

        const body = new FormData();
        body.append('receipt', uploadFile);
        const response = await fetch('/api/butce/receipt', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
          body,
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data?.error || (response.status === 413 ? 'Fiş fotoğrafı sunucu sınırını aştı.' : 'Fiş okunamadı.'));
        if (!data?.amount) throw new Error('Fişte genel toplam okunamadı.');

        await applyData(modal, data);
        const confidence = Math.round((Number(data.confidence) || 0) * 100);
        status.textContent = `Fiş okundu. Alanlar otomatik dolduruldu${confidence ? ` · güven %${confidence}` : ''}. Kaydetmeden önce kontrol et.`;
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
