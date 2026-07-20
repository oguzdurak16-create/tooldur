'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HeartHandshake, Mail, Settings } from 'lucide-react';
import { categories } from '@/data/tools';
import { getCopy } from '@/lib/localizedContent';
import { UI_TEXT, getLocaleFromPathname, getLocalizedPath } from '@/lib/siteLanguage';
import { getIndexableCategories } from '@/lib/seoFocus';
import styles from './Footer.module.css';

export default function Footer() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const copy = getCopy(locale);
  const footer = UI_TEXT[locale].footer;
  const seoCategories = getIndexableCategories(categories).slice(0, 8);

  const links = [
    { label: footer.about, href: getLocalizedPath(locale, 'about') },
    { label: footer.contact, href: getLocalizedPath(locale, 'contact') },
    { label: 'Blog', href: getLocalizedPath(locale, 'blog') },
    { label: footer.technical, href: getLocalizedPath(locale, 'technical-call-library') },
    { label: footer.releaseNotes, href: getLocalizedPath(locale, 'release-notes') },
    { label: footer.roadmap, href: getLocalizedPath(locale, 'roadmap') },
    { label: footer.privacy, href: getLocalizedPath(locale, 'privacy') },
    { label: footer.terms, href: getLocalizedPath(locale, 'terms') },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.main}>
        <div className={styles.brandBlock}>
          <Link href={getLocalizedPath(locale, 'home')} className={styles.brand}>
            <span className={styles.mark}>T</span>
            <span className={styles.name}>tool<span>dur</span></span>
          </Link>
          <p className={styles.description}>{footer.description}</p>
          <div className={styles.statusRow}>
            <span className={styles.status}><i /> {footer.active}</span>
            <Link href={getLocalizedPath(locale, 'support')} className={styles.support}><HeartHandshake size={13} /> {footer.support}</Link>
          </div>
        </div>

        <div>
          <div className={styles.columnTitle}>{footer.categories}</div>
          <ul className={styles.links}>
            {seoCategories.map((category) => (
              <li key={category.id}>
                <Link href={getLocalizedPath(locale, 'category', category.slug)}>{copy.categoryNames[category.id] || category.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className={styles.columnTitle}>{footer.links}</div>
          <ul className={styles.links}>
            {links.map((item) => <li key={item.href}><Link href={item.href}>{item.label}</Link></li>)}
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <span>© 2026 Tooldur · {footer.rights}</span>
          <div className={styles.bottomActions}>
            <button type="button" onClick={() => window.dispatchEvent(new Event('tooldur:cookie-settings'))}><Settings size={12} /> {footer.cookieSettings}</button>
            <a href="mailto:tooldur@gmail.com"><Mail size={12} /> tooldur@gmail.com</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
