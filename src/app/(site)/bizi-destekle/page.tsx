import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Calculator,
  ClipboardList,
  Database,
  ExternalLink,
  HeartHandshake,
  Rocket,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { KREOSUS_SUPPORT_URL } from '@/lib/support';

export const metadata: Metadata = {
  title: 'Bizi Destekle',
  description:
    'Tooldur ücretsiz mühendislik araçları, TooldurCAD ve proje yönetimi özelliklerinin gelişimini destekleyin.',
  alternates: { canonical: 'https://www.tooldur.com/bizi-destekle' },
  openGraph: {
    title: 'Bizi Destekle',
    description:
      'Ücretsiz mühendislik araçları, TooldurCAD ve proje yönetimi özelliklerinin gelişimine katkı sağlayın.',
    url: 'https://www.tooldur.com/bizi-destekle',
    images: [{ url: '/support/tooldur-support-cover.png', width: 1920, height: 1080, alt: 'Tooldur destek sayfası' }],
  },
};

const supportReasons = [
  {
    icon: Calculator,
    title: 'Ücretsiz mühendislik araçları',
    text: 'Kama kanalı, tolerans, birim dönüşümü, ağırlık, tork ve benzeri hesaplama araçlarının geliştirilmesine katkı sağlar.',
  },
  {
    icon: Wrench,
    title: 'TooldurCAD geliştirmeleri',
    text: 'Masaüstü uygulama ve CAD destek panelindeki yeni modüllerin, teknik çağrı metinlerinin ve arayüz iyileştirmelerinin devamını destekler.',
  },
  {
    icon: ClipboardList,
    title: 'Proje yönetimi sistemi',
    text: 'Üyelerin projelerini kaydedip görevlerini, durumlarını ve ilerlemelerini tek ekranda takip edebilmesi için altyapının gelişmesine destek olur.',
  },
];

const tiers = [
  {
    name: 'Destekçi',
    price: '₺50',
    text: 'Tooldur’un ücretsiz araçlarının daha iyi hale gelmesine küçük ama değerli katkı.',
  },
  {
    name: 'Mühendis Destekçi',
    price: '₺100',
    text: 'TooldurCAD ve yeni hesaplama araçlarının geliştirilmesine daha güçlü destek.',
  },
  {
    name: 'Ana Destekçi',
    price: '₺250',
    text: 'Proje yönetimi, hesaplama araçları ve masaüstü uygulama geliştirmelerine doğrudan katkı.',
  },
];

const roadmap = [
  'Yeni mekanik hesaplama araçları',
  'TooldurCAD için yeni modüller',
  'Proje kaydetme ve görev takibi geliştirmeleri',
  'Daha hızlı, sade ve mobil uyumlu arayüz',
  'Standartlara uygun teknik not ve çağrı metinleri',
];

export default function BiziDesteklePage() {
  return (
    <main className="support-page">
      <style>{`
        .support-page {
          min-height: 80vh;
          background:
            radial-gradient(circle at 15% 8%, rgba(255,177,27,.12), transparent 32%),
            radial-gradient(circle at 86% 20%, rgba(233,149,0,.08), transparent 35%),
            var(--bg);
          color: var(--ink);
          padding: 56px 16px 82px;
        }
        .support-shell { max-width: 1180px; margin: 0 auto; }
        .support-hero {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 30px;
          background:
            linear-gradient(90deg, rgba(7,11,20,.98) 0%, rgba(8,13,23,.93) 46%, rgba(8,13,23,.72) 100%),
            url('/support/tooldur-support-cover.png') center / cover no-repeat;
          box-shadow: 0 32px 90px rgba(0,0,0,.32);
          padding: clamp(28px, 5vw, 58px);
          min-height: 470px;
          display: grid;
          align-items: center;
        }
        .support-badge {
          display: inline-flex;
          width: fit-content;
          align-items: center;
          gap: 9px;
          padding: 9px 14px;
          border-radius: 999px;
          background: rgba(255,177,27,.12);
          border: 1px solid rgba(255,177,27,.24);
          color: var(--amber);
          font-weight: 900;
          font-size: 12px;
          letter-spacing: .08em;
          text-transform: uppercase;
          margin-bottom: 18px;
        }
        .support-title {
          max-width: 720px;
          margin: 0 0 16px;
          font-size: clamp(42px, 7vw, 82px);
          line-height: .96;
          letter-spacing: -.065em;
          font-weight: 950;
        }
        .support-title span { color: var(--amber); }
        .support-lead {
          max-width: 720px;
          margin: 0 0 28px;
          color: var(--ink-2);
          font-size: clamp(16px, 2vw, 20px);
          line-height: 1.72;
        }
        .support-actions { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
        .support-btn {
          min-height: 52px;
          padding: 0 22px;
          border-radius: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          text-decoration: none;
          font-weight: 900;
          border: 1px solid rgba(255,255,255,.09);
          transition: transform .18s ease, border-color .18s ease, background .18s ease;
        }
        .support-btn:hover { transform: translateY(-2px); }
        .support-btn-primary {
          color: #07101d;
          background: linear-gradient(180deg, #ffd47a, #ffb11b);
          border-color: rgba(255,177,27,.3);
          box-shadow: 0 20px 46px rgba(255,177,27,.26);
        }
        .support-btn-secondary {
          color: var(--ink-2);
          background: rgba(255,255,255,.04);
        }
        .support-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-top: 28px; }
        .support-card {
          border: 1px solid rgba(255,255,255,.08);
          background: linear-gradient(180deg, rgba(17,24,39,.78), rgba(10,15,25,.94));
          border-radius: 24px;
          padding: 22px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.03);
        }
        .support-card-icon {
          width: 48px;
          height: 48px;
          border-radius: 17px;
          display: grid;
          place-items: center;
          background: rgba(255,177,27,.12);
          color: var(--amber);
          margin-bottom: 16px;
        }
        .support-card h2,
        .support-card h3 { margin: 0 0 9px; color: var(--ink); letter-spacing: -.04em; }
        .support-card p { margin: 0; color: var(--ink-3); line-height: 1.65; font-size: 14.5px; }
        .support-section { margin-top: 42px; }
        .support-section-head { margin-bottom: 18px; max-width: 760px; }
        .support-kicker { color: var(--amber); font-size: 12px; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; margin-bottom: 8px; }
        .support-section h2 { margin: 0; font-size: clamp(28px, 4vw, 44px); letter-spacing: -.055em; }
        .support-section-head p { margin: 10px 0 0; color: var(--ink-3); line-height: 1.7; }
        .support-tiers { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
        .support-tier { position: relative; overflow: hidden; }
        .support-tier::before {
          content: '';
          position: absolute;
          inset: 0 0 auto 0;
          height: 4px;
          background: linear-gradient(90deg, transparent, var(--amber), transparent);
          opacity: .85;
        }
        .support-price { color: var(--amber); font-size: 34px; font-weight: 950; letter-spacing: -.04em; margin: 6px 0 12px; }
        .support-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
        .support-list li { display: flex; gap: 9px; align-items: flex-start; color: var(--ink-2); line-height: 1.55; font-size: 14.5px; }
        .support-note {
          border: 1px solid rgba(255,255,255,.08);
          background: rgba(255,255,255,.035);
          border-radius: 22px;
          padding: 18px;
          color: var(--ink-3);
          line-height: 1.65;
          font-size: 13.5px;
        }
        .support-kreosus {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(280px, 390px);
          gap: 20px;
          align-items: stretch;
          border: 1px solid rgba(255,177,27,.16);
          background: linear-gradient(135deg, rgba(255,177,27,.10), rgba(255,255,255,.035));
          border-radius: 28px;
          padding: 24px;
        }
        .support-kreosus-panel {
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,.08);
          background: rgba(7,11,20,.66);
          padding: 20px;
        }
        @media (max-width: 900px) {
          .support-grid, .support-tiers, .support-kreosus { grid-template-columns: 1fr; }
          .support-hero { min-height: auto; }
        }
      `}</style>

      <section className="support-shell">
        <div className="support-hero">
          <div>
            <div className="support-badge">
              <HeartHandshake size={16} /> Bağımsız mühendislik platformu
            </div>
            <h1 className="support-title">
              Hesapla. <span>Kaydet.</span> Takip Et.
            </h1>
            <p className="support-lead">
              Tooldur; ücretsiz mühendislik hesaplama araçları, TooldurCAD ve üye olarak kullanılabilen proje kaydetme/takip özellikleriyle gelişiyor. Desteğiniz yeni araçların ve proje yönetimi altyapısının sürdürülebilir şekilde büyümesine katkı sağlar.
            </p>
            <div className="support-actions">
              <a className="support-btn support-btn-primary" href={KREOSUS_SUPPORT_URL} target="_blank" rel="noopener noreferrer">
                Kreosus üzerinden destek ol <ExternalLink size={18} />
              </a>
              <Link className="support-btn support-btn-secondary" href="/proje-yonetimi">
                Proje yönetimini incele <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>

        <div className="support-grid">
          {supportReasons.map((item) => {
            const Icon = item.icon;
            return (
              <article className="support-card" key={item.title}>
                <div className="support-card-icon"><Icon size={23} /></div>
                <h2>{item.title}</h2>
                <p>{item.text}</p>
              </article>
            );
          })}
        </div>

        <section className="support-section support-kreosus" id="kreosus">
          <div>
            <div className="support-kicker">Bizi destekleyin</div>
            <h2>Desteğiniz Tooldur’un gelişmesine katkı sağlar.</h2>
            <p style={{ color: 'var(--ink-3)', lineHeight: 1.72, marginTop: 12, maxWidth: 720 }}>
              Tooldur’u ücretsiz mühendislik araçları, TooldurCAD ve proje yönetimi özellikleriyle daha güçlü hale getirmek için gönüllü destek verebilirsiniz. Destek işlemleri güvenli şekilde Kreosus üzerinden tamamlanır.
            </p>
            <div className="support-actions" style={{ marginTop: 20 }}>
              <a className="support-btn support-btn-primary" href={KREOSUS_SUPPORT_URL} target="_blank" rel="noopener noreferrer">
                Kreosus üzerinden destek ol <ExternalLink size={18} />
              </a>
            </div>
          </div>
          <div className="support-kreosus-panel">
            <ShieldCheck size={26} color="var(--amber)" />
            <h3 style={{ margin: '12px 0 8px', color: 'var(--ink)', fontSize: 22 }}>Destek neleri güçlendirir?</h3>
            <ul className="support-list">
              <li><BadgeCheck size={17} color="#35f0b6" /> Yeni mühendislik hesaplama araçları</li>
              <li><BadgeCheck size={17} color="#35f0b6" /> TooldurCAD modülleri ve teknik çağrı metinleri</li>
              <li><BadgeCheck size={17} color="#35f0b6" /> Üyelikli proje kaydetme ve takip sistemi</li>
            </ul>
          </div>
        </section>

        <section className="support-section">
          <div className="support-section-head">
            <div className="support-kicker">Destek katmanları</div>
            <h2>Küçük destekler doğrudan geliştirmeye gider.</h2>
            <p>
              Katmanlar gönüllü destek içindir. Tooldur araçlarının ücretsiz kalmasına, TooldurCAD’in gelişmesine ve proje yönetimi tarafındaki üyelikli takip yapısının güçlenmesine katkı sağlar.
            </p>
          </div>
          <div className="support-tiers">
            {tiers.map((tier) => (
              <article className="support-card support-tier" key={tier.name}>
                <h3>{tier.name}</h3>
                <div className="support-price">{tier.price}</div>
                <p>{tier.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="support-section">
          <div className="support-section-head">
            <div className="support-kicker">Gelişim hedefi</div>
            <h2>Tooldur’u mühendislik iş merkezi haline getirmek.</h2>
            <p>
              Hesaplama, teknik bilgi, CAD destek aracı ve proje takibi aynı çatı altında toplanacak. Üyeler projelerini kaydedip işlerini düzenli takip edebilecek.
            </p>
          </div>
          <div className="support-card">
            <ul className="support-list">
              {roadmap.map((item) => (
                <li key={item}><Rocket size={17} color="var(--amber)" /> {item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="support-section support-note">
          <strong style={{ color: 'var(--ink)' }}>Not:</strong> Tooldur bağımsız bir mühendislik platformudur. Destek ödemeleri gönüllüdür; zorunlu üyelik, lisans satışı veya teknik danışmanlık hizmeti anlamına gelmez. TooldurCAD; Dassault Systèmes veya SOLIDWORKS tarafından geliştirilmiş, desteklenmiş, onaylanmış ya da sertifikalandırılmış resmi bir ürün değildir.
        </section>
      </section>
    </main>
  );
}
