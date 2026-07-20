import Link from 'next/link';
import { ArrowRight, BookOpen, Download, FolderKanban, Grid2X2, Hammer, Wrench } from 'lucide-react';
import { blogPosts } from '@/data/blogPosts';
import { categories, tools } from '@/data/tools';
import { getCopy, type LocalizedPageKey } from '@/lib/localizedContent';
import { getLocalizedPath, LANGUAGE_META, type Locale, type RouteKey } from '@/lib/siteLanguage';

type Props = {
  locale: Locale;
  route: RouteKey;
  slug?: string;
};

const pageRouteMap: Partial<Record<RouteKey, LocalizedPageKey>> = {
  home: 'home',
  tools: 'tools',
  blog: 'blog',
  tooldurcad: 'tooldurcad',
  support: 'support',
  'technical-call-library': 'technical-call-library',
  roadmap: 'roadmap',
  'release-notes': 'release-notes',
  'project-management': 'project-management',
  about: 'about',
  contact: 'contact',
  privacy: 'privacy',
  terms: 'terms',
  cookies: 'cookies',
};

function Shell({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const meta = LANGUAGE_META[locale];
  return (
    <div lang={meta.htmlLang} dir={meta.dir} className="i18n-page">
      <style>{`
        .i18n-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(255,177,27,.14), transparent 34%),
            radial-gradient(circle at top right, rgba(233,149,0,.08), transparent 30%),
            var(--bg);
          color: var(--ink);
          padding: clamp(28px, 5vw, 72px) 18px 82px;
        }
        .i18n-shell { max-width: 1180px; margin: 0 auto; }
        .i18n-hero {
          border: 1px solid rgba(255,255,255,.08);
          background: linear-gradient(180deg, rgba(17,24,39,.92), rgba(10,15,25,.96));
          border-radius: 30px;
          padding: clamp(26px, 5vw, 54px);
          box-shadow: 0 28px 70px rgba(0,0,0,.28);
          overflow: hidden;
          position: relative;
        }
        .i18n-hero:before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, rgba(255,177,27,.16), transparent 38%, rgba(233,149,0,.08));
          pointer-events: none;
        }
        .i18n-hero > * { position: relative; }
        .i18n-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          width: max-content;
          max-width: 100%;
          padding: 8px 12px;
          border-radius: 999px;
          border: 1px solid rgba(255,177,27,.22);
          background: rgba(255,177,27,.08);
          color: var(--amber);
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .08em;
          text-transform: uppercase;
          margin-bottom: 18px;
        }
        .i18n-title {
          margin: 0;
          max-width: 900px;
          color: var(--ink);
          font-size: clamp(34px, 5.5vw, 72px);
          line-height: .98;
          letter-spacing: -.055em;
          font-weight: 950;
        }
        .i18n-lead {
          margin: 20px 0 0;
          max-width: 780px;
          color: var(--ink-3);
          font-size: clamp(15px, 1.8vw, 18px);
          line-height: 1.78;
        }
        .i18n-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 26px; }
        .i18n-btn {
          min-height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          padding: 0 18px;
          border-radius: 16px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 900;
          border: 1px solid rgba(255,177,27,.26);
          background: linear-gradient(180deg, #ffd47a, #ffb11b);
          color: #0b0f18;
          box-shadow: 0 16px 34px rgba(255,177,27,.22);
        }
        .i18n-btn.secondary {
          background: rgba(255,255,255,.04);
          color: var(--ink);
          box-shadow: none;
          border-color: rgba(255,255,255,.08);
        }
        .i18n-section { margin-top: 24px; }
        .i18n-section-title { margin: 0 0 10px; font-size: 26px; letter-spacing: -.04em; font-weight: 950; }
        .i18n-section-text { margin: 0; color: var(--ink-3); line-height: 1.75; max-width: 820px; }
        .i18n-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(235px, 1fr)); gap: 14px; margin-top: 18px; }
        .i18n-card {
          border: 1px solid rgba(255,255,255,.08);
          background: rgba(12,18,31,.74);
          border-radius: 22px;
          padding: 20px;
          text-decoration: none;
          color: inherit;
          display: grid;
          gap: 10px;
        }
        .i18n-card strong { color: var(--ink); font-size: 18px; letter-spacing: -.02em; }
        .i18n-card span, .i18n-card p { color: var(--ink-4); line-height: 1.6; font-size: 14px; margin: 0; }
        .i18n-chip-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
        .i18n-chip { border: 1px solid rgba(255,255,255,.08); border-radius: 999px; padding: 8px 12px; color: var(--ink-3); background: rgba(255,255,255,.03); font-size: 13px; font-weight: 800; text-decoration: none; }
        .i18n-tool-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(255px, 1fr)); gap: 14px; margin-top: 20px; }
        .i18n-tool { border: 1px solid rgba(255,255,255,.08); background: rgba(12,18,31,.74); border-radius: 20px; padding: 18px; text-decoration: none; display: grid; gap: 10px; }
        .i18n-tool strong { color: var(--ink); font-size: 17px; }
        .i18n-tool span { color: var(--ink-4); font-size: 13px; line-height: 1.55; }
        .i18n-note { margin-top: 16px; color: var(--ink-4); font-size: 13px; line-height: 1.6; }
      `}</style>
      <div className="i18n-shell">{children}</div>
    </div>
  );
}

function GenericPage({ locale, pageKey }: { locale: Locale; pageKey: LocalizedPageKey }) {
  const copy = getCopy(locale);
  const page = copy.pages[pageKey];
  const primaryRoute: RouteKey = pageKey === 'tooldurcad' ? 'tooldurcad' : pageKey === 'project-management' ? 'project-management' : pageKey === 'cookies' ? 'cookies' : 'tools';
  const secondaryRoute: RouteKey = pageKey === 'tooldurcad' || pageKey === 'roadmap' ? 'release-notes' : pageKey === 'privacy' || pageKey === 'terms' ? 'privacy' : 'tooldurcad';

  return (
    <Shell locale={locale}>
      <section className="i18n-hero">
        <div className="i18n-badge">{page.badge}</div>
        <h1 className="i18n-title">{page.title}</h1>
        <p className="i18n-lead">{page.description}</p>
        <div className="i18n-actions">
          <Link href={getLocalizedPath(locale, primaryRoute)} className="i18n-btn">
            {page.primary} <ArrowRight size={17} />
          </Link>
          <Link href={getLocalizedPath(locale, secondaryRoute)} className="i18n-btn secondary">
            {page.secondary}
          </Link>
        </div>
      </section>

      <section className="i18n-section">
        <h2 className="i18n-section-title">{page.sectionTitle}</h2>
        <p className="i18n-section-text">{page.sectionText}</p>
        <div className="i18n-grid">
          {page.cards.map((card) => (
            <div className="i18n-card" key={card.title}>
              <strong>{card.title}</strong>
              <span>{card.text}</span>
            </div>
          ))}
        </div>
      </section>
    </Shell>
  );
}

function ToolsPage({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);
  const page = copy.pages.tools;
  const popular = tools.filter((tool) => tool.popular || tool.featured).slice(0, 24);
  return (
    <Shell locale={locale}>
      <section className="i18n-hero">
        <div className="i18n-badge"><Hammer size={14} /> {page.badge}</div>
        <h1 className="i18n-title">{page.title}</h1>
        <p className="i18n-lead">{page.description}</p>
        <div className="i18n-chip-row">
          {categories.map((cat) => (
            <Link key={cat.id} href={getLocalizedPath(locale, 'category', cat.slug)} className="i18n-chip">
              {copy.categoryNames[cat.id] || cat.name}
            </Link>
          ))}
        </div>
      </section>
      <section className="i18n-section">
        <h2 className="i18n-section-title">{copy.labels.popularTools}</h2>
        <div className="i18n-tool-list">
          {popular.map((tool) => (
            <Link key={tool.id} href={getLocalizedPath(locale, 'tool', tool.slug)} className="i18n-tool">
              <strong>{tool.name}</strong>
              <span>{tool.description}</span>
              <span style={{ color: 'var(--amber)', fontWeight: 900 }}>{copy.labels.openTool} <ArrowRight size={13} /></span>
            </Link>
          ))}
        </div>
      </section>
    </Shell>
  );
}

function ToolPage({ locale, slug }: { locale: Locale; slug?: string }) {
  const copy = getCopy(locale);
  const tool = tools.find((item) => item.slug === slug) || tools[0];
  const category = categories.find((cat) => cat.id === tool.category);
  return (
    <Shell locale={locale}>
      <section className="i18n-hero">
        <div className="i18n-badge"><Wrench size={14} /> {copy.labels.free}</div>
        <h1 className="i18n-title">{tool.name}</h1>
        <p className="i18n-lead">{copy.toolIntro} {tool.description}</p>
        <div className="i18n-actions">
          <Link href={`/arac/${tool.slug}`} className="i18n-btn">
            {copy.labels.openTool} <ArrowRight size={17} />
          </Link>
          <Link href={getLocalizedPath(locale, 'tools')} className="i18n-btn secondary">
            {copy.labels.relatedTools}
          </Link>
        </div>
        <p className="i18n-note">{copy.labels.originalToolNote}</p>
      </section>
      <section className="i18n-section">
        <h2 className="i18n-section-title">{category ? (copy.categoryNames[category.id] || category.name) : copy.labels.categories}</h2>
        <p className="i18n-section-text">{category ? (copy.categoryDescriptions[category.id] || category.description) : tool.description}</p>
        <div className="i18n-tool-list">
          {tools.filter((item) => item.category === tool.category && item.slug !== tool.slug).slice(0, 6).map((item) => (
            <Link key={item.id} href={getLocalizedPath(locale, 'tool', item.slug)} className="i18n-tool">
              <strong>{item.name}</strong>
              <span>{item.description}</span>
            </Link>
          ))}
        </div>
      </section>
    </Shell>
  );
}

function CategoryPage({ locale, slug }: { locale: Locale; slug?: string }) {
  const copy = getCopy(locale);
  const category = categories.find((item) => item.slug === slug) || categories[0];
  const list = tools.filter((tool) => tool.category === category.id);
  return (
    <Shell locale={locale}>
      <section className="i18n-hero">
        <div className="i18n-badge"><Grid2X2 size={14} /> {copy.labels.categories}</div>
        <h1 className="i18n-title">{copy.categoryNames[category.id] || category.name}</h1>
        <p className="i18n-lead">{copy.categoryDescriptions[category.id] || category.description}</p>
      </section>
      <section className="i18n-section">
        <h2 className="i18n-section-title">{copy.labels.categoryTools}</h2>
        <div className="i18n-tool-list">
          {list.map((tool) => (
            <Link key={tool.id} href={getLocalizedPath(locale, 'tool', tool.slug)} className="i18n-tool">
              <strong>{tool.name}</strong>
              <span>{tool.description}</span>
            </Link>
          ))}
        </div>
      </section>
    </Shell>
  );
}

function BlogPage({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);
  const page = copy.pages.blog;
  return (
    <Shell locale={locale}>
      <section className="i18n-hero">
        <div className="i18n-badge"><BookOpen size={14} /> {page.badge}</div>
        <h1 className="i18n-title">{page.title}</h1>
        <p className="i18n-lead">{page.description}</p>
      </section>
      <section className="i18n-section">
        <h2 className="i18n-section-title">{copy.labels.readArticle}</h2>
        <p className="i18n-section-text">{copy.blogIntro}</p>
        <div className="i18n-tool-list">
          {blogPosts.map((post) => (
            <Link key={post.slug} href={getLocalizedPath(locale, 'blog-post', post.slug)} className="i18n-tool">
              <strong>{post.title}</strong>
              <span>{post.description}</span>
              <span>{post.category} · {post.readTime}</span>
            </Link>
          ))}
        </div>
      </section>
    </Shell>
  );
}

function BlogPostPage({ locale, slug }: { locale: Locale; slug?: string }) {
  const copy = getCopy(locale);
  const post = blogPosts.find((item) => item.slug === slug) || blogPosts[0];
  return (
    <Shell locale={locale}>
      <section className="i18n-hero">
        <div className="i18n-badge"><BookOpen size={14} /> {post.category}</div>
        <h1 className="i18n-title">{post.title}</h1>
        <p className="i18n-lead">{copy.blogIntro} {post.description}</p>
        <div className="i18n-actions">
          <Link href={`/blog/${post.slug}`} className="i18n-btn">
            {copy.labels.readArticle} <ArrowRight size={17} />
          </Link>
          <Link href={getLocalizedPath(locale, 'blog')} className="i18n-btn secondary">
            Blog
          </Link>
        </div>
        <p className="i18n-note">{copy.labels.blogNote}</p>
      </section>
      <section className="i18n-section">
        <h2 className="i18n-section-title">{copy.labels.relatedTools}</h2>
        <div className="i18n-tool-list">
          {post.relatedTools.slice(0, 4).map((tool) => (
            <Link key={tool.href} href={tool.href} className="i18n-tool">
              <strong>{tool.label}</strong>
              <span>{copy.labels.openTool}</span>
            </Link>
          ))}
        </div>
      </section>
    </Shell>
  );
}

function TooldurCadPage({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);
  const page = copy.pages.tooldurcad;
  const downloads = [
    { title: 'TooldurCAD-SolidWorks-Setup-v1.0.3.exe', size: '2.46 MB' },
    { title: 'TooldurCAD-Universal-Lite-Setup-v1.0.3.exe', size: '2.05 MB' },
  ];
  return (
    <Shell locale={locale}>
      <section className="i18n-hero">
        <div className="i18n-badge"><Download size={14} /> {page.badge}</div>
        <h1 className="i18n-title">{page.title}</h1>
        <p className="i18n-lead">{page.description}</p>
        <div className="i18n-actions">
          <Link href="/kurulum-indir" className="i18n-btn">
            {page.primary} <ArrowRight size={17} />
          </Link>
          <Link href={getLocalizedPath(locale, 'release-notes')} className="i18n-btn secondary">
            {page.secondary}
          </Link>
        </div>
      </section>
      <section className="i18n-section">
        <h2 className="i18n-section-title">{page.sectionTitle}</h2>
        <p className="i18n-section-text">{page.sectionText}</p>
        <div className="i18n-tool-list">
          {downloads.map((item) => (
            <div className="i18n-tool" key={item.title}>
              <strong>{item.title}</strong>
              <span>{copy.labels.version} v1.0.3 · {item.size}</span>
            </div>
          ))}
        </div>
      </section>
    </Shell>
  );
}

function ProjectPage({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);
  const page = copy.pages['project-management'];
  return (
    <Shell locale={locale}>
      <section className="i18n-hero">
        <div className="i18n-badge"><FolderKanban size={14} /> {page.badge}</div>
        <h1 className="i18n-title">{page.title}</h1>
        <p className="i18n-lead">{page.description}</p>
        <div className="i18n-actions">
          <Link href="/proje-yonetimi" className="i18n-btn">
            {page.primary} <ArrowRight size={17} />
          </Link>
          <Link href="/giris" className="i18n-btn secondary">{page.secondary}</Link>
        </div>
      </section>
      <section className="i18n-section">
        <h2 className="i18n-section-title">{page.sectionTitle}</h2>
        <p className="i18n-section-text">{page.sectionText}</p>
      </section>
    </Shell>
  );
}

export default function LocalizedSeoPage({ locale, route, slug }: Props) {
  if (route === 'tools') return <ToolsPage locale={locale} />;
  if (route === 'tool') return <ToolPage locale={locale} slug={slug} />;
  if (route === 'category') return <CategoryPage locale={locale} slug={slug} />;
  if (route === 'blog') return <BlogPage locale={locale} />;
  if (route === 'blog-post') return <BlogPostPage locale={locale} slug={slug} />;
  if (route === 'tooldurcad') return <TooldurCadPage locale={locale} />;
  if (route === 'project-management') return <ProjectPage locale={locale} />;

  return <GenericPage locale={locale} pageKey={pageRouteMap[route] || 'home'} />;
}
