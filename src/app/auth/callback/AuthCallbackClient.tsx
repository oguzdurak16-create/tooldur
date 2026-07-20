'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function safeRedirectFromUrl() {
  if (typeof window === 'undefined') return '/dashboard';
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get('redirect') || window.localStorage.getItem('tooldur-auth-redirect');
  window.localStorage.removeItem('tooldur-auth-redirect');
  if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) return redirect;
  return '/dashboard';
}

export default function AuthCallbackClient() {
  const router = useRouter();
  const [message, setMessage] = useState('Google girişi tamamlanıyor...');

  useEffect(() => {
    let cancelled = false;

    async function finishAuth() {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');

        const errorDescription = params.get('error_description') || params.get('error');
        if (errorDescription) throw new Error(errorDescription);

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!cancelled) {
          if (data.session) {
            router.replace(safeRedirectFromUrl());
          } else {
            setMessage('Oturum alınamadı. Giriş sayfasına yönlendiriliyorsunuz...');
            setTimeout(() => router.replace('/giris'), 1200);
          }
        }
      } catch (error) {
        if (!cancelled) {
          setMessage('Google girişi tamamlanamadı. Giriş sayfasına yönlendiriliyorsunuz...');
          setTimeout(() => router.replace('/giris'), 1400);
        }
      }
    }

    finishAuth();
    return () => { cancelled = true; };
  }, [router]);

  return (
    <main style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ maxWidth: 420, border: '1px solid rgba(255,255,255,.1)', borderRadius: 18, padding: 28, background: 'rgba(17,24,39,.72)', color: '#e5e7eb', textAlign: 'center' }}>
        <h1 style={{ fontSize: 20, marginBottom: 10 }}>Tooldur</h1>
        <p style={{ color: '#9ca3af' }}>{message}</p>
      </div>
    </main>
  );
}
