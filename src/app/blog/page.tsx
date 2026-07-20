import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, Clock, Search, Wrench } from 'lucide-react';
import { blogPosts } from '@/data/blogPosts';
import { getBlogVisual, siteVisuals } from '@/lib/visualAssets';

export const metadata: Metadata = {
  title: 'Mühendislik Blogu – Makine Tasarımı ve Teknik Resim',
  description:
    'Makine tasarımı, mil delik toleransı, kama kanalı, kılavuz matkap çapı ve teknik resim konularında pratik mühendislik blog yazıları.',
  alternates: { canonical: 'https://www.tooldur.com/blog' },
  openGraph: {
    title: 'Tooldur Blog - Mühendislik Rehberleri',
    description: 'Makine tasarımı, tolerans, teknik resim ve TooldurCAD odaklı pratik mühendislik içerikleri.',
    url: 'https://www.tooldur.com/blog',
    type: 'website',
    siteName: 'Tooldur',
    images: [{ url: siteVisuals.guides.og, width: 1200, height: 630, alt: siteVisuals.guides.alt }],
  },
};

export default function BlogPage() {
  const orderedPosts = [...blogPosts].sort((a, b) => b.date.localeCompare(a.date));
  const featured = orderedPosts.find((post) => post.slug === 'sac-kalinligina-gore-v-kalip-nasil-secilir') || orderedPosts[0];
  const blogJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': 'https://www.tooldur.com/blog#blog',
    name: 'Tooldur Mühendislik Blogu',
    description: 'Makine tasarımı, tolerans ve teknik resim odaklı mühendislik rehberleri.',
    url: 'https://www.tooldur.com/blog',
    inLanguage: 'tr-TR',
    publisher: { '@id': 'https://www.tooldur.com/#organization' },
    blogPost: orderedPosts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: `https://www.tooldur.com/blog/${post.slug}`,
      datePublished: post.date,
      description: post.description,
      image: `https://www.tooldur.com${getBlogVisual(post).og}`,
    })),
  };

  return (
    <div className="td-blog-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }} />
      <style>{`
        .td-blog-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(255,177,27,.16), transparent 34%),
            radial-gradient(circle at top right, rgba(36,214,164,.09), transparent 32%),
            var(--bg);
          color: var(--ink);
          padding: clamp(28px, 4vw, 56px) 18px 72px;
        }
        .td-blog-shell { max-width: 1220px; margin: 0 auto; }
        .td-blog-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.08fr) minmax(320px, .92fr);
          gap: 22px;
          align-items: stretch;
          margin-bottom: 26px;
        }
        .td-blog-hero-card,
        .td-blog-side,
        .td-blog-card,
        .td-blog-seo-box {
          border: 1px solid rgba(255,255,255,.08);
          background: linear-gradient(180deg, rgba(17,24,39,.92), rgba(10,15,25,.96));
          border-radius: 28px;
          box-shadow: 0 28px 70px rgba(0,0,0,.28);
        }
        .td-blog-hero-card { padding: clamp(26px, 4vw, 46px); position: relative; overflow: hidden; display: flex; flex-direction: column; }
        .td-blog-hero-card:before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, rgba(255,177,27,.18), transparent 34%, rgba(36,214,164,.08));
          pointer-events: none;
        }
        .td-blog-kicker {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--amber);
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .16em;
          text-transform: uppercase;
          margin-bottom: 18px;
        }
        .td-blog-hero h1 {
          position: relative;
          margin: 0;
          font-size: clamp(34px, 5vw, 68px);
          line-height: .98;
          letter-spacing: -.06em;
          max-width: 760px;
        }
        .td-blog-hero p {
          position: relative;
          color: var(--ink-3);
          font-size: clamp(15px, 1.8vw, 18px);
          line-height: 1.78;
          max-width: 760px;
          margin: 20px 0 0;
        }
        .td-blog-actions { position: relative; display: flex; gap: 12px; flex-wrap: wrap; margin-top: 24px; }
        .td-blog-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          min-height: 48px;
          padding: 0 18px;
          border-radius: 16px;
          text-decoration: none;
          font-weight: 900;
          font-size: 14px;
          border: 1px solid rgba(255,177,27,.28);
          color: #0b0f18;
          background: linear-gradient(180deg, #ffd47a, #ffb11b);
          box-shadow: 0 18px 40px rgba(255,177,27,.24);
        }
        .td-blog-btn.secondary { color: var(--ink); background: rgba(255,255,255,.04); box-shadow: none; border-color: rgba(255,255,255,.08); }

        .td-blog-hero-image {
          position: relative;
          min-height: 245px;
          margin-top: 28px;
          border-radius: 22px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.1);
          background: #07101d;
          box-shadow: 0 22px 54px rgba(0,0,0,.28);
        }
        .td-blog-hero-image img,
        .td-blog-card-image img {
          object-fit: cover;
        }
        .td-blog-hero-image:after,
        .td-blog-card-image:after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(180deg, transparent 58%, rgba(5,10,18,.48));
        }
        .td-blog-card-image {
          position: relative;
          height: 165px;
          margin: -10px -10px 18px;
          border-radius: 19px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.08);
          background: #07101d;
        }

        .td-blog-side { padding: 24px; display: flex; flex-direction: column; gap: 14px; }
        .td-blog-side-title { font-size: 22px; font-weight: 950; letter-spacing: -.04em; margin-bottom: 4px; }
        .td-blog-mini {
          display: block;
          text-decoration: none;
          padding: 16px;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,.07);
          background: rgba(255,255,255,.03);
        }
        .td-blog-mini strong { display: block; color: var(--ink); font-size: 15px; line-height: 1.35; margin-bottom: 8px; }
        .td-blog-mini span { color: var(--ink-4); font-size: 12px; font-weight: 800; }
        .td-blog-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; margin-top: 22px; }
        .td-blog-card { padding: 22px; display: flex; flex-direction: column; min-height: 510px; overflow: hidden; }
        .td-blog-badge {
          width: max-content;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(255,177,27,.1);
          border: 1px solid rgba(255,177,27,.18);
          color: var(--amber);
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 900;
          margin-bottom: 16px;
        }
        .td-blog-card h2 { margin: 0 0 12px; font-size: 22px; line-height: 1.15; letter-spacing: -.04em; }
        .td-blog-card p { margin: 0; color: var(--ink-3); line-height: 1.68; font-size: 14px; }
        .td-blog-meta { display: flex; flex-wrap: wrap; gap: 10px; margin: 18px 0; color: var(--ink-4); font-size: 12px; font-weight: 800; }
        .td-blog-meta span { display: inline-flex; align-items: center; gap: 6px; }
        .td-blog-read { margin-top: auto; color: var(--amber); text-decoration: none; font-weight: 950; display: inline-flex; align-items: center; gap: 8px; }
        .td-blog-seo-box { margin-top: 24px; padding: 24px; }
        .td-blog-seo-box h2 { margin: 0 0 10px; font-size: 24px; letter-spacing: -.04em; }
        .td-blog-seo-box p { margin: 0; color: var(--ink-3); line-height: 1.75; }
        @media (max-width: 960px) {
          .td-blog-hero { grid-template-columns: 1fr; }
          .td-blog-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="td-blog-shell">
        <section className="td-blog-hero">
          <div className="td-blog-hero-card">
            <div className="td-blog-kicker"><BookOpen size={16} /> Tooldur Blog</div>
            <h1>Makine tasarımı için pratik mühendislik rehberleri</h1>
            <p>
              Tolerans, kama kanalı, kılavuz matkap, teknik resim ve TooldurCAD odaklı içerikler.
              Amaç; aranan teknik bilgileri sade, uygulanabilir ve hesaplama araçlarıyla bağlantılı şekilde sunmak.
            </p>
            <div className="td-blog-actions">
              <Link href={`/blog/${featured.slug}`} className="td-blog-btn">
                Öne çıkan yazıyı oku <ArrowRight size={17} />
              </Link>
              <Link href="/araclar" className="td-blog-btn secondary">
                Hesaplama araçlarına git <Wrench size={17} />
              </Link>
            </div>
            <div className="td-blog-hero-image">
              <Image
                src={siteVisuals.guides.src}
                alt={siteVisuals.guides.alt}
                fill
                priority
                sizes="(max-width: 960px) 100vw, 58vw"
              />
            </div>
          </div>

          <aside className="td-blog-side">
            <div className="td-blog-side-title">Çok aranan başlıklar</div>
            {orderedPosts.slice(0, 8).map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="td-blog-mini">
                <strong>{post.title}</strong>
                <span>{post.category} · {post.readTime}</span>
              </Link>
            ))}
          </aside>
        </section>

        <section className="td-blog-grid" aria-label="Blog yazıları">
          {orderedPosts.map((post) => {
            const visual = getBlogVisual(post);
            return (
            <article key={post.slug} className="td-blog-card">
              <Link href={`/blog/${post.slug}`} className="td-blog-card-image" aria-label={`${post.title} yazısını aç`}>
                <Image src={visual.src} alt={`${post.title} için ${visual.alt.toLocaleLowerCase('tr-TR')}`} fill sizes="(max-width: 960px) 100vw, 33vw" />
              </Link>
              <div className="td-blog-badge">{post.category}</div>
              <h2>{post.title}</h2>
              <p>{post.description}</p>
              <div className="td-blog-meta">
                <span><Clock size={14} /> {post.readTime}</span>
                <span><Search size={14} /> SEO rehberi</span>
              </div>
              <Link href={`/blog/${post.slug}`} className="td-blog-read">
                Yazıyı oku <ArrowRight size={16} />
              </Link>
            </article>
            );
          })}
        </section>

        <section className="td-blog-seo-box">
          <h2>Tooldur blog neden eklendi?</h2>
          <p>
            Google aramalarında sadece hesaplayıcı sayfaları değil, bu hesapların nasıl seçileceğini anlatan rehber içerikler de önemlidir.
            Blog yapısı; “H7 tolerans nedir”, “kama kanalı nasıl hesaplanır”, “kılavuz matkap çapı kaç olmalı” gibi niyet odaklı aramalardan trafik çekmek için hazırlandı.
          </p>
        </section>
      </div>
    </div>
  );
}
