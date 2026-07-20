import { Metadata } from 'next';
import { Mail, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'İletişim',
  description: 'Tooldur ile iletişime geçin. Sorularınız, önerileriniz ve geri bildirimleriniz için bize ulaşın.',
  keywords: ['tooldur iletişim', 'destek', 'geri bildirim'],
  openGraph: { title: 'İletişim', description: 'Sorularınız için bize ulaşın.', url: 'https://www.tooldur.com/iletisim' },
  alternates: { canonical: 'https://www.tooldur.com/iletisim' },
};

export default function IletisimPage() {
  const contacts = [
    { icon: Mail, color: 'var(--amber)', title: 'E-POSTA', value: 'tooldur@gmail.com', href: 'mailto:tooldur@gmail.com', note: '24 saat içinde yanıt' },
    { icon: MessageSquare, color: '#22c55e', title: 'GERİ BİLDİRİM', value: 'Öneri & Hata', href: 'mailto:tooldur@gmail.com?subject=Geri%20Bildirim', note: 'Yeni araç önerileri, hata bildirimleri' },
    { icon: Clock, color: '#60a5fa', title: 'DESTEK SAATLERİ', value: '7/24 Erişim', href: null, note: 'Platform her zaman açık' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 16px 80px' }}>

        <div style={{ marginBottom: 48, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
          <div className="section-label" style={{ marginBottom: 14 }}>İletişim</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 40px)', color: 'var(--ink)', marginBottom: 12 }}>Bize Ulaşın</h1>
          <p style={{ fontSize: 15, color: 'var(--ink-3)', lineHeight: 1.8 }}>
            Sorularınız, önerileriniz veya geri bildirimleriniz için aşağıdaki kanallardan bize ulaşabilirsiniz. Her mesaj titizlikle incelenmektedir.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 48 }}>
          {contacts.map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '24px 22px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: c.color }} />
                <div style={{ width: 42, height: 42, borderRadius: 10, background: `${c.color}12`, border: `1px solid ${c.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Icon size={18} style={{ color: c.color }} />
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--ink-4)', marginBottom: 8 }}>{c.title}</div>
                {c.href ? (
                  <a href={c.href} style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: c.color, textDecoration: 'none', display: 'block', marginBottom: 6 }}>{c.value}</a>
                ) : (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: c.color, marginBottom: 6 }}>{c.value}</div>
                )}
                <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>{c.note}</div>
              </div>
            );
          })}
        </div>

        {/* Hangi konularda ulaşabilirsiniz */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 32px', marginBottom: 14 }}>
          <h2 style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', color: 'var(--amber)', marginBottom: 16, textTransform: 'uppercase' }}>// Size Nasıl Yardımcı Olabiliriz?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { emoji: '🐛', label: 'Hata Bildirimi', desc: 'Hesaplama hatası veya teknik sorunları bildirin' },
              { emoji: '💡', label: 'Yeni Araç Önerisi', desc: 'İhtiyacınız olan hesaplama aracını önerin' },
              { emoji: '🔒', label: 'KVKK Talepleri', desc: 'Kişisel veri erişim, düzeltme veya silme talepleri' },
              { emoji: '🤝', label: 'İş Birliği', desc: 'Sponsorluk, reklam veya teknik iş birliği teklifleri' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '14px 16px', background: 'var(--bg-muted)', border: '1px solid var(--border)', borderRadius: 10 }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{item.emoji}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-4)', lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 16, padding: '28px 32px', borderLeft: '3px solid var(--amber)' }}>
          <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.8, margin: '0 0 16px' }}>
            Tooldur sürekli gelişen bir platform olarak kullanıcı geri bildirimlerine büyük değer vermektedir. Yeni araç önerileri, hata bildirimleri ve özellik istekleriniz doğrudan geliştirme sürecimizi şekillendirir.
          </p>
          <a href="mailto:tooldur@gmail.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 22px', background: 'var(--amber)', color: '#0a0a0f', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, borderRadius: 8, textDecoration: 'none' }}>
            E-posta Gönder <ArrowRight size={13} />
          </a>
        </div>

      </div>
    </div>
  );
}
