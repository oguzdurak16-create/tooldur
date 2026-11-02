'use client';

import { useViewportMetrics } from '@/hooks/useViewportMetrics';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Globe, LayoutDashboard, LogIn, Menu, Search, WalletCards } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ThemeToggle from '@/components/ThemeToggle';
import GlobalToolSearch from '@/components/GlobalToolSearch';
import { ALL_LOCALES, LANGUAGE_META, UI_TEXT, getLocaleFromPathname, getLocalizedPath, localizeCurrentPath, type Locale } from '@/lib/siteLanguage';
import styles from './Header.module.css';

const LANGUAGES = ALL_LOCALES.map((locale) => ({ code: locale, label: LANGUAGE_META[locale].label, short: LANGUAGE_META[locale].short })) as Array<{ code: Locale; label: string; short: string }>;

export default function Header() {
  useViewportMetrics();
  const pathname = usePathname();
  const languageRef = useRef<HTMLDivElement>(null);
  const languageButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);
  const previousPathnameRef = useRef(pathname);
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
    ...(locale === 'tr' ? [{ href: '/muhendis-gozuyle', label: 'Mühendis Gözüyle' }] : []),
  ];


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

  useEffect(() => {
    setLangOpen(false);
    if (previousPathnameRef.current !== pathname && mobileMenuRef.current) mobileMenuRef.current.open = false;
    previousPathnameRef.current = pathname;
  }, [pathname]);
  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) mobileMenuRef.current.open = false;
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && mobileMenuRef.current?.open) {
        mobileMenuRef.current.open = false;
        mobileMenuRef.current.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, []);
  useEffect(() => {
    if (!langOpen) return;
    const dismiss = (event: PointerEvent) => {
      if (!languageRef.current?.contains(event.target as Node)) setLangOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setLangOpen(false); languageButtonRef.current?.focus(); }
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('keydown', escape);
    };
  }, [langOpen]);

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
  const openSearch = () => {
    setLangOpen(false);
    if (mobileMenuRef.current) mobileMenuRef.current.open = false;
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

          <div className={`${styles.center} ${pathname === homeHref ? styles.homeCenter : ''}`}>
            <nav className={styles.nav} aria-label="Ana menü">
              {primaryLinks.map((item) => <Link key={item.href} href={item.href} className={`${styles.navLink} ${isActive(item.href) ? styles.active : ''}`}>{item.label}</Link>)}
            </nav>
            <button type="button" className={styles.search} onClick={openSearch} aria-label="Araç ara"><Search size={16} /><span>Araç ara</span><kbd>Ctrl K</kbd></button>
          </div>

          <div className={styles.actions}>
            <Link href="/dashboard" className={styles.mobileAccount} aria-current={isActive('/dashboard') ? 'page' : undefined}>{nav.panel}</Link>
            <div className={styles.inlineTheme}><ThemeToggle /></div>
            <details className={styles.mobileMenu} ref={mobileMenuRef}>
              <summary aria-label="Menü"><Menu size={20} aria-hidden="true" /></summary>
              <nav aria-label="Mobil menü" className={styles.mobileNav}>
                <Link href="/dashboard" className={styles.mobilePanelEntry} onClick={() => { if (mobileMenuRef.current) mobileMenuRef.current.open = false; }}><LayoutDashboard size={18} aria-hidden="true" />{authReady && !user ? (locale === 'tr' ? 'Panele giriş' : nav.login) : nav.panel}</Link>
                <Link href={getLocalizedPath(locale, 'project-management')}>{nav.projects}</Link>
                {primaryLinks.map((item) => <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? 'page' : undefined} onClick={() => { if (mobileMenuRef.current) mobileMenuRef.current.open = false; }}>{item.label}</Link>)}
                <div className={styles.menuTheme}><span>{locale === 'tr' ? 'Görünüm' : 'Theme'}</span><ThemeToggle /></div>
                <div className={styles.mobileLanguages} aria-label="Dil seç">
                  {LANGUAGES.map((item) => <button key={item.code} type="button" lang={item.code} aria-label={item.label} aria-pressed={locale === item.code} onClick={() => changeLanguage(item.code)}>{item.short}</button>)}
                </div>
              </nav>
            </details>
            {authReady && user ? (
              <>
                <Link href="/dashboard/butce" className={`${styles.action} ${styles.desktopAction}`} title="Harcama ve bütçe takibi"><WalletCards size={15} /> Bütçe</Link>
                <Link href="/dashboard" className={`${styles.action} ${styles.actionPrimary} ${styles.desktopAction}`}><LayoutDashboard size={15} /> {nav.panel}</Link>
              </>
            ) : (
              <Link href="/giris" className={`${styles.action} ${styles.actionPrimary} ${styles.desktopAction}`}><LogIn size={15} /> {nav.login}</Link>
            )}

            <div ref={languageRef} className={styles.lang}>
              <button ref={languageButtonRef} className={styles.iconButton} type="button" onClick={() => setLangOpen((value) => !value)} aria-controls="header-languages" aria-expanded={langOpen} aria-label="Dil seç"><Globe size={16} /><ChevronDown size={13} /></button>
              {langOpen && <div id="header-languages" className={styles.langMenu}>{LANGUAGES.map((item) => <button className={styles.langOption} type="button" key={item.code} onClick={() => changeLanguage(item.code)}><span>{item.label}</span><strong>{item.short}</strong></button>)}</div>}
            </div>
          </div>
        </div>
      </header>

      <GlobalToolSearch locale={locale} />
    </>
  );
}
