'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  FolderKanban,
  Globe,
  HeartHandshake,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  User,
  Wrench,
  X,
} from 'lucide-react';
import { categories } from '@/data/tools';
import { supabase } from '@/lib/supabase';
import { getCopy } from '@/lib/localizedContent';
import { ALL_LOCALES, LANGUAGE_META, UI_TEXT, getLocaleFromPathname, getLocalizedPath, localizeCurrentPath, type Locale } from '@/lib/siteLanguage';
import { getIndexableCategories } from '@/lib/seoFocus';
import styles from './MobileTabBar.module.css';

const LANG_OPTIONS = ALL_LOCALES.map((locale) => ({ locale, label: LANGUAGE_META[locale].label, short: LANGUAGE_META[locale].short })) as Array<{ locale: Locale; label: string; short: string }>;
const SEO_CATEGORIES = getIndexableCategories(categories).slice(0, 6);

export default function MobileTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authReady, setAuthReady] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.documentElement.dataset.theme = 'dark';
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: any } }) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
    }).catch(() => setAuthReady(true));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => setMenuOpen(false), [pathname]);
  if (!mounted) return null;

  const locale = getLocaleFromPathname(pathname);
  const nav = UI_TEXT[locale].nav;
  const copy = getCopy(locale);
  const homeHref = getLocalizedPath(locale, 'home');
  const toolsHref = getLocalizedPath(locale, 'tools');
  const blogHref = getLocalizedPath(locale, 'blog');
  const cadHref = getLocalizedPath(locale, 'tooldurcad');
  const supportHref = getLocalizedPath(locale, 'support');
  const projectHref = getLocalizedPath(locale, 'project-management');
  const forumHref = '/forum';
  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);
  const openSearch = () => window.dispatchEvent(new Event('tooldur:open-search'));
  const logout = async () => { await supabase.auth.signOut(); setMenuOpen(false); router.push('/'); };

  return (
    <div className={styles.root}>
      <nav className={styles.bar} aria-label="Mobil hızlı menü">
        <div className={styles.inner}>
          <Link href={homeHref} className={`${styles.item} ${isActive(homeHref) ? styles.active : ''}`}><Home size={18} /><span>{nav.home}</span></Link>
          <Link href={toolsHref} className={`${styles.item} ${isActive(toolsHref) ? styles.active : ''}`}><Wrench size={18} /><span>{nav.tools}</span></Link>
          <button type="button" className={`${styles.item} ${styles.searchItem}`} onClick={openSearch}><Search size={19} /><span>{nav.search}</span></button>
          <Link href={projectHref} className={`${styles.item} ${isActive(projectHref) ? styles.active : ''}`}><FolderKanban size={18} /><span>{nav.projects}</span></Link>
          <button type="button" className={`${styles.item} ${menuOpen ? styles.active : ''}`} onClick={() => setMenuOpen((value) => !value)}>{menuOpen ? <X size={18} /> : <Menu size={18} />}<span>{nav.menu}</span></button>
        </div>
      </nav>

      {menuOpen && (
        <div className={styles.overlay} onClick={() => setMenuOpen(false)}>
          <div className={styles.sheet} onClick={(event) => event.stopPropagation()}>
            <div className={styles.handle} />
            <div className={styles.head}><strong>{nav.quick}</strong><button type="button" className={styles.close} onClick={() => setMenuOpen(false)} aria-label={nav.closeMenu}><X size={19} /></button></div>

            <Link href={authReady && user ? '/dashboard' : '/giris'} className={styles.account}>
              <span>{!authReady ? nav.accountCheck : user ? nav.panel : nav.login}</span>
              {user ? <LayoutDashboard size={18} /> : <User size={18} />}
            </Link>

            <div className={styles.block}>
              <div className={styles.blockTitle}>{nav.quick}</div>
              <div className={styles.grid}>
                <Link href={cadHref} className={`${styles.link} ${isActive(cadHref) ? styles.active : ''}`}>{nav.downloadCad}<ArrowRight size={15} /></Link>
                <Link href={blogHref} className={`${styles.link} ${isActive(blogHref) ? styles.active : ''}`}>{nav.blog}<BookOpen size={15} /></Link>
                <Link href={forumHref} className={`${styles.link} ${isActive(forumHref) ? styles.active : ''}`}>{nav.forum}<MessageSquare size={15} /></Link>
                <Link href={supportHref} className={`${styles.link} ${isActive(supportHref) ? styles.active : ''}`}>{nav.support}<HeartHandshake size={15} /></Link>
              </div>
            </div>

            <div className={styles.block}>
              <div className={styles.blockTitle}>{nav.categories}</div>
              <div className={styles.categories}>
                {SEO_CATEGORIES.map((category) => (
                  <Link key={category.id} href={getLocalizedPath(locale, 'category', category.slug)} className={styles.category}>
                    <strong>{copy.categoryNames[category.id] || category.name}</strong>
                    <span>{copy.categoryDescriptions[category.id] || category.description}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className={styles.block}>
              <div className={styles.blockTitle}>{nav.language}</div>
              <div className={styles.grid}>
                {LANG_OPTIONS.map((item) => (
                  <button key={item.locale} type="button" className={`${styles.lang} ${locale === item.locale ? styles.active : ''}`} onClick={() => { setMenuOpen(false); window.location.href = localizeCurrentPath(pathname, item.locale); }}>
                    <span>{item.label}</span><span>{item.short} <Globe size={14} /></span>
                  </button>
                ))}
              </div>
            </div>

            {user && (
              <div className={styles.block}>
                <button type="button" className={styles.link} onClick={logout}><span>{nav.logout}</span><LogOut size={15} /></button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
