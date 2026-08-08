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

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error('Oturum bulunamadı.');

        const body = new FormData();
        body.append('receipt', file);
        const response = await fetch('/api/butce/receipt', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
          body,
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data?.error || 'Fiş okunamadı.');

        const amountInput = fieldByLabel(modal, 'Tutar')?.querySelector<HTMLInputElement>('input');
        const categorySelect = fieldByLabel(modal, 'Kategori')?.querySelector<HTMLSelectElement>('select');
        const merchantInput = fieldByLabel(modal, 'İşyeri')?.querySelector<HTMLInputElement>('input');
        const dateInput = fieldByLabel(modal, 'Tarih')?.querySelector<HTMLInputElement>('input');
        const paymentSelect = fieldByLabel(modal, 'Ödeme')?.querySelector<HTMLSelectElement>('select');

        if (amountInput && data.amount) {
          setInputValue(amountInput, String(data.amount).replace('.', ','));
          await waitFrame(); await waitFrame();
        }
        if (categorySelect && data.category) {
          setSelectValue(categorySelect, data.category);
          await waitFrame(); await waitFrame();
        }
        if (merchantInput && data.merchant) {
          setInputValue(merchantInput, data.merchant);
          await waitFrame(); await waitFrame();
        }
        if (dateInput && data.date) {
          setInputValue(dateInput, data.date);
          await waitFrame(); await waitFrame();
        }
        if (paymentSelect && data.payment_method) {
          setSelectValue(paymentSelect, data.payment_method);
          await waitFrame(); await waitFrame();
        }

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
