'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  FolderKanban,
  Globe,
  LayoutDashboard,
  LogIn,
  Menu,
  Search,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import GlobalToolSearch from '@/components/GlobalToolSearch';
import {
  ALL_LOCALES,
  LANGUAGE_META,
  UI_TEXT,
  getLocaleFromPathname,
  getLocalizedPath,
  localizeCurrentPath,
  type Locale,
} from '@/lib/siteLanguage';
import styles from './Header.module.css';

const LANGUAGES = ALL_LOCALES.map((locale) => ({
  code: locale,
  label: LANGUAGE_META[locale].label,
  short: LANGUAGE_META[locale].short,
})) as Array<{ code: Locale; label: string; short: string }>;

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authReady, setAuthReady] = useState(false);

  const locale = getLocaleFromPathname(pathname);
  const nav = UI_TEXT[locale].nav;
  const homeHref = getLocalizedPath(locale, 'home');
  const toolsHref = getLocalizedPath(locale, 'tools');
  const blogHref = getLocalizedPath(locale, 'blog');
  const projectHref = getLocalizedPath(locale, 'project-management');
  const cadHref = getLocalizedPath(locale, 'tooldurcad');
  const supportHref = getLocalizedPath(locale, 'support');
  const forumHref = '/forum';

  const mainLinks = [
    { href: toolsHref, label: nav.tools },
    { href: blogHref, label: nav.blog },
    { href: forumHref, label: nav.forum },
    { href: cadHref, label: nav.cad },
    { href: supportHref, label: nav.support },
  ];

  const drawerLinks = [
    { href: homeHref, label: nav.home },
    { href: toolsHref, label: nav.tools },
    { href: blogHref, label: nav.blog },
    { href: forumHref, label: nav.forum },
    { href: projectHref, label: nav.projects },
    { href: cadHref, label: nav.cad },
    { href: supportHref, label: nav.support },
  ];

  useEffect(() => {
    document.documentElement.dataset.theme = 'dark';
    localStorage.setItem('td-theme', 'dark');
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: any } }) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      setAuthReady(true);
    }).catch(() => mounted && setAuthReady(true));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setLangOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);
  const openSearch = () => {
    setMenuOpen(false);
    setLangOpen(false);
    window.dispatchEvent(new Event('tooldur:open-search'));
  };
  const changeLanguage = (code: Locale) => {
    setLangOpen(false);
    setMenuOpen(false);
    window.location.href = localizeCurrentPath(pathname, code);
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link href={homeHref} className={styles.brand} aria-label="Tooldur ana sayfa">
            <span className={styles.mark}>T</span>
            <span className={styles.brandText}>
              <span className={styles.brandName}>tool<span>dur</span></span>
              <span className={styles.brandTag}>engineering workspace</span>
            </span>
          </Link>

          <div className={styles.center}>
            <nav className={styles.nav} aria-label="Ana menü">
              {mainLinks.map((item) => (
                <Link key={item.href} href={item.href} className={`${styles.navLink} ${isActive(item.href) ? styles.active : ''}`}>
                  {item.label}
                </Link>
              ))}
            </nav>
            <button type="button" className={styles.search} onClick={openSearch} aria-label="Araç veya hesap ara">
              <Search size={16} />
              <span>Araç veya hesap ara</span>
              <kbd>Ctrl K</kbd>
            </button>
          </div>

          <div className={styles.actions}>
            <Link href={projectHref} className={`${styles.action} ${styles.desktopAction} ${styles.desktopSecondary}`}>
              <FolderKanban size={15} />
              {nav.projects}
            </Link>

            {authReady && user ? (
              <Link href="/dashboard" className={`${styles.action} ${styles.actionPrimary} ${styles.desktopAction}`}>
                <LayoutDashboard size={15} /> {nav.panel}
              </Link>
            ) : (
              <Link href="/giris" className={`${styles.action} ${styles.actionPrimary} ${styles.desktopAction}`}>
                <LogIn size={15} /> {nav.login}
              </Link>
            )}

            <div className={styles.lang}>
              <button className={styles.iconButton} type="button" onClick={() => setLangOpen((value) => !value)} aria-expanded={langOpen} aria-label="Dil seç">
                <Globe size={16} />
                <ChevronDown size={13} />
              </button>
              {langOpen && (
                <div className={styles.langMenu}>
                  {LANGUAGES.map((item) => (
                    <button className={styles.langOption} type="button" key={item.code} onClick={() => changeLanguage(item.code)}>
                      <span>{item.label}</span><strong>{item.short}</strong>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className={`${styles.iconButton} ${styles.mobileButton}`} type="button" onClick={() => setMenuOpen(true)} aria-label={nav.menu}>
              <Menu size={19} />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && <div className={styles.backdrop} onClick={() => setMenuOpen(false)} />}
      <aside className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ''}`} aria-hidden={!menuOpen}>
        <div className={styles.drawerTop}>
          <Link href={homeHref} className={styles.brand} aria-label="Tooldur ana sayfa">
            <span className={styles.mark}>T</span>
            <span className={styles.brandText}><span className={styles.brandName}>tool<span>dur</span></span><span className={styles.brandTag}>engineering workspace</span></span>
          </Link>
          <button className={styles.iconButton} type="button" onClick={() => setMenuOpen(false)} aria-label={nav.closeMenu}><X size={19} /></button>
        </div>

        <button className={styles.drawerSearch} type="button" onClick={openSearch}>
          <Search size={18} /><span>Araç veya hesap ara</span><kbd>/</kbd>
        </button>

        <nav className={styles.drawerNav} aria-label="Mobil menü">
          {drawerLinks.map((item) => (
            <Link key={item.href} href={item.href} className={`${styles.drawerLink} ${isActive(item.href) ? styles.active : ''}`}>
              {item.label}<ChevronRight size={16} />
            </Link>
          ))}
        </nav>

        <div className={styles.drawerBottom}>
          {authReady && user ? (
            <Link href="/dashboard" className={`${styles.drawerLink} ${styles.active}`}>{nav.panel}<LayoutDashboard size={16} /></Link>
          ) : (
            <Link href="/giris" className={`${styles.drawerLink} ${styles.active}`}>{nav.login}<LogIn size={16} /></Link>
          )}
          <div className={styles.languageGrid}>
            {LANGUAGES.slice(0, 6).map((item) => <button key={item.code} type="button" onClick={() => changeLanguage(item.code)}>{item.short}</button>)}
          </div>
        </div>
      </aside>

      <GlobalToolSearch locale={locale} />
    </>
  );
}
