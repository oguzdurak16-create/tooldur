'use client';

import { useEffect } from 'react';

function unlockReceiptPicker(root: ParentNode = document) {
  root.querySelectorAll<HTMLInputElement>('.bt .receipt input[type="file"]').forEach((input) => {
    input.removeAttribute('capture');
    input.setAttribute('accept', 'image/*');
    input.setAttribute('aria-label', 'Fiş fotoğrafı çek veya fotoğraf arşivinden seç');
  });
}

export default function ReceiptLibraryPicker() {
  useEffect(() => {
    unlockReceiptPicker();

    const observer = new MutationObserver(() => unlockReceiptPicker());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
