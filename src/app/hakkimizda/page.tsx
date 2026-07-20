import { Metadata } from 'next';
import { Calculator, Users, Clock, Zap, CheckCircle, Globe, Heart, Shield, Cpu, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { tools } from '@/data/tools';

export const metadata: Metadata = {
  title: 'Hakkımızda – Ücretsiz Mühendislik Hesaplama Araçları',
  description: 'Tooldur, mühendisler ve teknik profesyoneller için ücretsiz online hesaplama araçları sunar. Hızlı, mobil uyumlu ve kayıt gerektirmeyen teknik çalışma alanı.',
  keywords: ['tooldur hakkında', 'mühendislik hesaplama araçları', 'ücretsiz hesaplama'],
  openGraph: { title: 'Hakkımızda - Tooldur', description: 'Mühendisler için ücretsiz online hesaplama araçları platformu.', url: 'https://www.tooldur.com/hakkimizda', images: [{ url: '/og-image.png' }] },
  alternates: { canonical: 'https://www.tooldur.com/hakkimizda' },
};

export default function AboutPage() {
  const stats = [
    { icon: Calculator, value: `${tools.length}+`, label: 'Hesaplama Aracı' },
    { icon: Clock, value: '7/24', label: 'Erişim' },
    { icon: Users, value: '%100', label: 'Ücretsiz' },
    { icon: Globe, value: '5+', label: 'Kategori' },
  ];

  const features = [
    { icon: Zap, title: 'Hızlı ve Anlık', desc: 'Kayıt gerektirmez, bekletmez. Tüm hesaplamalar tarayıcınızda gerçek zamanlı yapılır.', color: '#f59e0b' },
    { icon: CheckCircle, title: 'Doğru ve Güvenilir', desc: 'DIN, ISO ve TS EN standartlarına uygun formüllerle geliştirilmiş hesaplamalar.', color: '#22c55e' },
    { icon: Shield, title: 'Güvenli', desc: 'HTTPS bağlantısı, kontrollü oturum yönetimi ve kullanıcı verisini azaltan yerel depolama yaklaşımı.', color: '#60a5fa' },
    { icon: Cpu, title: 'Modern Teknoloji', desc: 'Next.js, React ve Supabase ile inşa edilmiş performans odaklı modern mimari.', color: '#a78bfa' },
    { icon: Globe, title: 'Her Cihazda', desc: 'Masaüstü, tablet ve mobilde sorunsuz çalışan responsive tasarım.', color: '#fb923c' },
    { icon: Heart, title: 'Kullanıcı Odaklı', desc: 'Sade arayüz, karanlık tema ve mühendislere özel iş akışları.', color: '#ec4899' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '48px 16px 80px' }}>

        <div style={{ marginBottom: 48, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
          <div className="section-label" style={{ marginBottom: 14 }}>Hakkımızda</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 44px)', color: 'var(--ink)', marginBottom: 16, lineHeight: 1.15 }}>
            Mühendisliği Herkes İçin<br/>Erişilebilir Kılıyoruz
          </h1>
          <p style={{ fontSize: 16, color: 'var(--ink-3)', lineHeight: 1.8, maxWidth: 640 }}>
            Tooldur, mühendislerin ve teknik profesyonellerin günlük hesaplamalarını hızlı, doğru ve ücretsiz yapabilmeleri için tasarlanmış kapsamlı bir online araç platformudur.
          </p>
        </div>

        {/* İstatistikler */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, marginBottom: 48, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} style={{ padding: '26px 20px', borderRight: i < 3 ? '1px solid var(--border)' : 'none', textAlign: 'center' }}>
                <Icon size={18} style={{ color: 'var(--amber)', margin: '0 auto 10px', display: 'block' }} />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: 'var(--amber)', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--ink-4)', marginTop: 8, textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Misyon & Vizyon */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 48 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 28px', borderLeft: '3px solid var(--amber)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--amber)', marginBottom: 14 }}>// MİSYONUMUZ</div>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.85 }}>
              Mühendislik hesaplamalarını demokratikleştirmek. Pahalı yazılımlara veya karmaşık hesap tablolarına bağımlı kalmadan, herkesin kaliteli teknik hesaplamalar yapabilmesini sağlamak.
            </p>
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 28px', borderLeft: '3px solid #60a5fa' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: '#60a5fa', marginBottom: 14 }}>// VİZYONUMUZ</div>
            <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.85 }}>
              Türkiye'nin ve Türkçe konuşan dünyanın en kapsamlı ücretsiz mühendislik hesaplama platformu olmak. Her mühendislik dalı için araçlar geliştirerek teknik bilgiyi erişilebilir kılmak.
            </p>
          </div>
        </div>

        {/* Özellikler */}
        <div style={{ marginBottom: 48 }}>
          <div className="section-label" style={{ marginBottom: 20 }}>Neden Tooldur?</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${f.color}, transparent)` }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 9, background: `${f.color}12`, border: `1px solid ${f.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={16} style={{ color: f.color }} />
                    </div>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{f.title}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--ink-4)', lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Teknoloji Stack */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 32px', marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--amber)', marginBottom: 16, textTransform: 'uppercase' }}>// Teknoloji Altyapısı</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['Next.js 14', 'React 18', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Vercel', 'Resend', 'Google Analytics', 'Lucide Icons', 'SVG Engine'].map(tech => (
              <span key={tech} style={{ padding: '6px 14px', background: 'var(--bg-muted)', border: '1px solid var(--border-mid)', borderRadius: 20, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)', fontWeight: 600 }}>{tech}</span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 16, padding: '36px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>Araçları Kullanmaya Başlayın</div>
          <p style={{ fontSize: 14, color: 'var(--ink-4)', marginBottom: 24 }}>Ücretsiz hesaplama araçları, kayıt gerektirmez</p>
          <Link href="/araclar" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: 'var(--amber)', color: '#0a0a0f', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, borderRadius: 10, textDecoration: 'none', boxShadow: '0 4px 20px rgba(245,158,11,0.3)' }}>
            Tüm Araçları Gör <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
}
