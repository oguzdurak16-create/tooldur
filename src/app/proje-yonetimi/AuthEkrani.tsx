'use client';
import Link from 'next/link';

export default function AuthEkrani() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)', padding: 16,
    }}>
      <div style={{ textAlign: 'center', maxWidth: 360 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--ink)', marginBottom: 10 }}>
          Giriş Gerekli
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.7, marginBottom: 28 }}>
          Proje yönetimini kullanmak için hesabınıza giriş yapmanız gerekiyor.
        </p>
        <Link href="/giris" className="btn-primary" style={{ textDecoration: 'none', padding: '12px 28px', fontSize: 13 }}>
          Giriş Yap / Üye Ol
        </Link>
        <p style={{ marginTop: 16, fontSize: 12, color: 'var(--ink-4)' }}>
          Giriş yaptıktan sonra otomatik olarak bu sayfaya yönlendirilirsiniz.
        </p>
      </div>
    </div>
  );
}