import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, BookOpen, CalendarDays, Clock, Wrench } from 'lucide-react';
import { blogPosts, getBlogPost } from '@/data/blogPosts';
import { getBlogVisual } from '@/lib/visualAssets';
export const revalidate = 86400;

const BASE = 'https://www.tooldur.com';

type PageProps = { params: { slug: string } };

export function generateStaticParams() {
  return [];
}

export function generateMetadata({ params }: PageProps): Metadata {
  const post = getBlogPost(params.slug);
  if (!post) return {};
  const visual = getBlogVisual(post);

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `${BASE}/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${BASE}/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.date,
      authors: ['Tooldur'],
      siteName: 'Tooldur',
      images: [{ url: visual.og, width: 1200, height: 630, alt: `${post.title} – ${visual.alt}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [visual.og],
    },
  };
}

export default function BlogDetailPage({ params }: PageProps) {
  const post = getBlogPost(params.slug);
  if (!post) notFound();

  const visual = getBlogVisual(post);
  const postTerms = new Set([post.category, ...post.keywords].map((item) => item.toLocaleLowerCase('tr-TR')));
  const relatedArticles = blogPosts
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => {
      let score = candidate.category === post.category ? 4 : 0;
      for (const keyword of candidate.keywords) {
        const normalized = keyword.toLocaleLowerCase('tr-TR');
        if (postTerms.has(normalized)) score += 2;
        else if (Array.from(postTerms).some((term) => term.includes(normalized) || normalized.includes(term))) score += 1;
      }
      if (candidate.relatedTools.some((tool) => post.relatedTools.some((current) => current.href === tool.href))) score += 4;
      return { candidate, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => item.candidate);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${BASE}/blog/${post.slug}#article`,
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.date,
        inLanguage: 'tr-TR',
        image: `${BASE}${visual.og}`,
        author: { '@type': 'Organization', '@id': `${BASE}/#organization`, name: 'Tooldur', url: BASE },
        publisher: { '@type': 'Organization', '@id': `${BASE}/#organization`, name: 'Tooldur', url: BASE, logo: { '@type': 'ImageObject', url: `${BASE}/icon-512.png` } },
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE}/blog/${post.slug}` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: BASE },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE}/blog` },
          { '@type': 'ListItem', position: 3, name: post.title, item: `${BASE}/blog/${post.slug}` },
        ],
      },
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return (
    <article className="td-post-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <style>{`
        .td-post-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(255,177,27,.14), transparent 32%),
            radial-gradient(circle at top right, rgba(36,214,164,.08), transparent 30%),
            var(--bg);
          color: var(--ink);
          padding: clamp(28px, 4vw, 56px) 18px 78px;
        }
        .td-post-shell { max-width: 1120px; margin: 0 auto; display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 24px; align-items: start; }
        .td-post-main,
        .td-post-side {
          border: 1px solid rgba(255,255,255,.08);
          background: linear-gradient(180deg, rgba(17,24,39,.92), rgba(10,15,25,.96));
          border-radius: 28px;
          box-shadow: 0 28px 70px rgba(0,0,0,.28);
        }
        .td-post-main { padding: clamp(24px, 4vw, 46px); }
        .td-post-back { color: var(--amber); text-decoration: none; font-weight: 900; display: inline-flex; align-items: center; gap: 8px; margin-bottom: 22px; }
        .td-post-badge { display: inline-flex; align-items: center; gap: 8px; color: var(--amber); font-family: var(--font-mono); font-size: 12px; font-weight: 900; letter-spacing: .14em; text-transform: uppercase; margin-bottom: 16px; }
        .td-post-main h1 { margin: 0; font-size: clamp(32px, 4.7vw, 58px); line-height: 1.02; letter-spacing: -.06em; max-width: 850px; }
        .td-post-desc { color: var(--ink-3); font-size: 17px; line-height: 1.75; margin: 20px 0 0; }
        .td-post-meta { display: flex; flex-wrap: wrap; gap: 12px; margin: 22px 0 26px; color: var(--ink-4); font-size: 13px; font-weight: 800; }
        .td-post-meta span { display: inline-flex; align-items: center; gap: 7px; }

        .td-post-cover {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          max-height: 440px;
          margin: 0 0 28px;
          border-radius: 24px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.1);
          background: #07101d;
          box-shadow: 0 24px 64px rgba(0,0,0,.3);
        }
        .td-post-cover img { object-fit: cover; }
        .td-post-cover:after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(180deg, transparent 62%, rgba(4,9,17,.45));
        }
        .td-post-cover figcaption {
          position: absolute;
          z-index: 2;
          left: 16px;
          bottom: 14px;
          color: #d8e3f0;
          background: rgba(5,10,20,.72);
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 999px;
          padding: 7px 11px;
          font-size: 11px;
          font-weight: 800;
          backdrop-filter: blur(12px);
        }

        .td-post-intro { padding: 20px; border-radius: 22px; background: rgba(255,177,27,.08); border: 1px solid rgba(255,177,27,.16); margin-bottom: 28px; }
        .td-post-intro p, .td-post-section p { color: var(--ink-3); line-height: 1.82; font-size: 16px; margin: 0 0 14px; }
        .td-post-intro p:last-child, .td-post-section p:last-child { margin-bottom: 0; }
        .td-post-section { margin-top: 34px; }
        .td-post-section h2 { font-size: 28px; letter-spacing: -.04em; margin: 0 0 14px; }
        .td-post-list { margin: 16px 0 0; padding: 0; list-style: none; display: grid; gap: 10px; }
        .td-post-list li { color: var(--ink-2); line-height: 1.6; padding: 12px 14px; border-radius: 16px; border: 1px solid rgba(255,255,255,.07); background: rgba(255,255,255,.035); }
        .td-post-faq { margin-top: 36px; }
        .td-post-faq h2 { font-size: 28px; letter-spacing: -.04em; margin-bottom: 14px; }
        .td-post-faq details { border: 1px solid rgba(255,255,255,.08); border-radius: 18px; background: rgba(255,255,255,.035); padding: 16px 18px; margin-bottom: 10px; }
        .td-post-faq summary { cursor: pointer; font-weight: 900; color: var(--ink); }
        .td-post-faq p { color: var(--ink-3); line-height: 1.7; margin: 12px 0 0; }
        .td-post-side { padding: 20px; position: sticky; top: 92px; }
        .td-side-title { font-size: 18px; font-weight: 950; letter-spacing: -.03em; margin-bottom: 14px; }
        .td-tool-link, .td-other-link { display: flex; align-items: center; justify-content: space-between; gap: 12px; text-decoration: none; color: var(--ink); padding: 14px; border-radius: 16px; border: 1px solid rgba(255,255,255,.07); background: rgba(255,255,255,.035); margin-bottom: 10px; font-weight: 850; }
        .td-tool-link { color: #0b0f18; background: linear-gradient(180deg, #ffd47a, #ffb11b); border-color: rgba(255,177,27,.28); }
        .td-other-link span { color: var(--ink-4); font-size: 12px; display: block; margin-top: 4px; font-weight: 700; }
        .td-keywords { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
        .td-keywords span { font-size: 11px; font-weight: 900; color: var(--amber); border: 1px solid rgba(255,177,27,.16); background: rgba(255,177,27,.08); border-radius: 999px; padding: 6px 9px; }
        @media (max-width: 980px) {
          .td-post-shell { grid-template-columns: 1fr; }
          .td-post-side { position: static; }
        }
      `}</style>

      <div className="td-post-shell">
        <div className="td-post-main">
          <Link href="/blog" className="td-post-back">← Bloga dön</Link>
          <div className="td-post-badge"><BookOpen size={16} /> {post.category}</div>
          <h1>{post.title}</h1>
          <p className="td-post-desc">{post.description}</p>
          <div className="td-post-meta">
            <span><CalendarDays size={15} /> {post.date}</span>
            <span><Clock size={15} /> {post.readTime}</span>
          </div>

          <figure className="td-post-cover">
            <Image
              src={visual.src}
              alt={`${post.title} – ${visual.alt}`}
              fill
              priority
              sizes="(max-width: 980px) 100vw, 760px"
            />
            <figcaption>{visual.caption}</figcaption>
          </figure>

          <div className="td-post-intro">
            {post.intro.map((p) => <p key={p}>{p}</p>)}
          </div>

          {post.sections.map((section) => (
            <section key={section.heading} className="td-post-section">
              <h2>{section.heading}</h2>
              {section.body.map((p) => <p key={p}>{p}</p>)}
              {section.list && (
                <ul className="td-post-list">
                  {section.list.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
            </section>
          ))}

          <section className="td-post-faq">
            <h2>Sık sorulan sorular</h2>
            {post.faq.map((item) => (
              <details key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </section>
        </div>

        <aside className="td-post-side">
          <div className="td-side-title">İlgili araçlar</div>
          {post.relatedTools.map((tool) => (
            <Link key={tool.href} href={tool.href} className="td-tool-link">
              <span>{tool.label}</span>
              <Wrench size={16} />
            </Link>
          ))}

          <div className="td-side-title" style={{ marginTop: 24 }}>Diğer yazılar</div>
          {relatedArticles.map((other) => (
            <Link key={other.slug} href={`/blog/${other.slug}`} className="td-other-link">
              <div>{other.title}<span>{other.category}</span></div>
              <ArrowRight size={16} />
            </Link>
          ))}

          <div className="td-side-title" style={{ marginTop: 24 }}>Arama terimleri</div>
          <div className="td-keywords">
            {post.keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}
          </div>
        </aside>
      </div>
    </article>
  );
}
