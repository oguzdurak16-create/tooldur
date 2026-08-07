'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChevronDown, Globe, LayoutDashboard, LogIn, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import GlobalToolSearch from '@/components/GlobalToolSearch';
import { ALL_LOCALES, LANGUAGE_META, UI_TEXT, getLocaleFromPathname, getLocalizedPath, localizeCurrentPath, type Locale } from '@/lib/siteLanguage';
import styles from './Header.module.css';

const LANGUAGES = ALL_LOCALES.map((locale) => ({ code: locale, label: LANGUAGE_META[locale].label, short: LANGUAGE_META[locale].short })) as Array<{ code: Locale; label: string; short: string }>;

export default function Header() {
  const pathname = usePathname();
  const [langOpen, setLangOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authReady, setAuthReady] = useState(false);

  const locale = getLocaleFromPathname(pathname);
  const nav = UI_TEXT[locale].nav;
  const homeHref = getLocalizedPath(locale, 'home');
  const toolsHref = getLocalizedPath(locale, 'tools');
  const blogHref = getLocalizedPath(locale, 'blog');
  const cadHref = getLocalizedPath(locale, 'tooldurcad');

  const primaryLinks = [
    { href: toolsHref, label: nav.tools },
    { href: cadHref, label: nav.cad },
    { href: blogHref, label: nav.blog },
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
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  useEffect(() => { setLangOpen(false); }, [pathname]);

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);
  const openSearch = () => {
    setLangOpen(false);
    window.dispatchEvent(new Event('tooldur:open-search'));
  };
  const changeLanguage = (code: Locale) => {
    setLangOpen(false);
    window.location.href = localizeCurrentPath(pathname, code);
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link href={homeHref} className={styles.brand} aria-label="Tooldur ana sayfa">
            <span className={styles.mark}>T</span>
            <span className={styles.brandText}><span className={styles.brandName}>tool<span>dur</span></span><span className={styles.brandTag}>engineering tools</span></span>
          </Link>

          <div className={styles.center}>
            <nav className={styles.nav} aria-label="Ana menü">
              {primaryLinks.map((item) => <Link key={item.href} href={item.href} className={`${styles.navLink} ${isActive(item.href) ? styles.active : ''}`}>{item.label}</Link>)}
            </nav>
            <button type="button" className={styles.search} onClick={openSearch} aria-label="Araç ara"><Search size={16} /><span>Araç ara</span><kbd>Ctrl K</kbd></button>
          </div>

          <div className={styles.actions}>
            {authReady && user ? (
              <Link href="/dashboard" className={`${styles.action} ${styles.actionPrimary} ${styles.desktopAction}`}><LayoutDashboard size={15} /> {nav.panel}</Link>
            ) : (
              <Link href="/giris" className={`${styles.action} ${styles.actionPrimary} ${styles.desktopAction}`}><LogIn size={15} /> {nav.login}</Link>
            )}

            <div className={styles.lang}>
              <button className={styles.iconButton} type="button" onClick={() => setLangOpen((value) => !value)} aria-expanded={langOpen} aria-label="Dil seç"><Globe size={16} /><ChevronDown size={13} /></button>
              {langOpen && <div className={styles.langMenu}>{LANGUAGES.map((item) => <button className={styles.langOption} type="button" key={item.code} onClick={() => changeLanguage(item.code)}><span>{item.label}</span><strong>{item.short}</strong></button>)}</div>}
            </div>
          </div>
        </div>
      </header>

      <GlobalToolSearch locale={locale} />
    </>
  );
}
