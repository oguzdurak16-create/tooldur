'use client';

import { useEffect, useState } from 'react';

export default function ToastBridge() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      setMessage(detail || 'İşlem tamamlandı.');
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setMessage(''), 2200);
    };

    window.addEventListener('tooldur-toast', handler as EventListener);
    return () => {
      window.removeEventListener('tooldur-toast', handler as EventListener);
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!message) return null;
  return <div className="td-toast" role="status">{message}</div>;
}
