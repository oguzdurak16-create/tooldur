'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { useModalDialog } from '@/hooks/useModalDialog';
import styles from './CookieConsent.module.css';
import { UI_TEXT, getLocaleFromPathname, getLocalizedPath } from '@/lib/siteLanguage';

const COOKIE_CONSENT_KEY = 'tooldur_cookie_consent';
const CONSENT_VERSION = 3;
const GA_ID = 'G-J5SC4H2SQE';
const ADS_ID = 'AW-877286241';
const ADSENSE_CLIENT = 'ca-pub-4491868887846507';

type ConsentType = {
  necessary: true;
  analytics: boolean;
  advertising: boolean;
  timestamp: number;
  version: number;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const defaultConsent: ConsentType = {
  necessary: true,
  analytics: false,
  advertising: false,
  timestamp: 0,
  version: CONSENT_VERSION,
};

function readSavedConsent() {
  try { return localStorage.getItem(COOKIE_CONSENT_KEY); }
  catch { return null; }
}

function normalizeConsent(value: Partial<ConsentType> | null | undefined): ConsentType {
  return {
    necessary: true,
    analytics: !!value?.analytics,
    advertising: !!value?.advertising,
    timestamp: value?.timestamp || Date.now(),
    version: value?.version || 1,
  };
}

function initGtag() {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
}

function updateGoogleConsent(consent: ConsentType) {
  if (typeof window === 'undefined') return;
  initGtag();
  window.gtag?.('consent', 'update', {
    analytics_storage: consent.analytics ? 'granted' : 'denied',
    ad_storage: consent.advertising ? 'granted' : 'denied',
    ad_user_data: consent.advertising ? 'granted' : 'denied',
    ad_personalization: consent.advertising ? 'granted' : 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
  });
}

function setDefaultDeniedConsent() {
  if (typeof window === 'undefined') return;
  initGtag();
  window.gtag?.('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
  });
}

function removeGoogleCookies() {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  const names = document.cookie
    .split(';')
    .map((cookie) => cookie.split('=')[0]?.trim())
    .filter(Boolean)
    .filter((name) =>
      name.startsWith('_ga') ||
      name.startsWith('_gid') ||
      name.startsWith('_gat') ||
      name.startsWith('_gcl') ||
      name.startsWith('__gads') ||
      name.startsWith('__gpi') ||
      name.startsWith('IDE') ||
      name.startsWith('DSID')
    );

  const host = window.location.hostname;
  const rootDomain = host.includes('.') ? `.${host.split('.').slice(-2).join('.')}` : host;
  const domains = ['', host, `.${host}`, rootDomain, '.tooldur.com'];

  names.forEach((name) => {
    domains.forEach((domain) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain ? `; domain=${domain}` : ''}`;
    });
  });
}

function injectScript(id: string, src: string, onload?: () => void) {
  if (typeof document === 'undefined') return;
  const existing = document.getElementById(id) as HTMLScriptElement | null;
  if (existing) {
    onload?.();
    return;
  }
  const script = document.createElement('script');
  script.id = id;
  script.src = src;
  script.async = true;
  if (onload) script.onload = onload;
  document.head.appendChild(script);
}

function loadGoogleTags(consent: ConsentType) {
  if (typeof window === 'undefined') return;
  if (!consent.analytics && !consent.advertising) return;

  initGtag();
  updateGoogleConsent(consent);

  injectScript('tooldur-gtag-script', `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`, () => {
    window.gtag?.('js', new Date());
    if (consent.analytics) {
      window.gtag?.('config', GA_ID, {
        anonymize_ip: true,
        // GoogleAnalytics.tsx owns page_view events so consent changes do not
        // create duplicate automatic page views.
        send_page_view: false,
      });
    }
    if (consent.advertising) {
      window.gtag?.('config', ADS_ID);
    }
  });

  if (consent.advertising) {
    injectScript(
      'tooldur-adsense-script',
      `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`
    );
  }
}

function removeOptionalStorageAndAds() {
  if (typeof document === 'undefined') return;
  // Keep the GA loader in place. With analytics_storage denied it can emit
  // Consent Mode cookieless pings without writing analytics cookies.
  document.getElementById('tooldur-adsense-script')?.remove();
  removeGoogleCookies();
}

export default function CookieConsent() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const t = UI_TEXT[locale].cookie;
  const [isVisible, setIsVisible] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState<ConsentType>(defaultConsent);
  const settingsRef = useRef<HTMLDivElement>(null);
  const closeSettings = useCallback(() => setShowSettings(false), []);
  useModalDialog(isVisible && showSettings, settingsRef, closeSettings);

  useEffect(() => {
    setDefaultDeniedConsent();

    const openSettings = () => {
      const saved = readSavedConsent();
      if (saved) {
        try {
          setConsent(normalizeConsent(JSON.parse(saved) as Partial<ConsentType>));
        } catch {
          setConsent(defaultConsent);
        }
      }
      setShowSettings(true);
      setIsVisible(true);
    };

    window.addEventListener('tooldur:cookie-settings', openSettings);

    const savedConsent = readSavedConsent();
    if (savedConsent) {
      try {
        const parsed = normalizeConsent(JSON.parse(savedConsent) as Partial<ConsentType>);
        setConsent(parsed);
        setIsVisible(false);
        updateGoogleConsent(parsed);
        if (parsed.analytics || parsed.advertising) loadGoogleTags(parsed);
        if (!parsed.analytics && !parsed.advertising) removeOptionalStorageAndAds();
      } catch {
        setIsVisible(true);
      }
    }

    return () => window.removeEventListener('tooldur:cookie-settings', openSettings);
  }, []);

  const saveConsent = (newConsent: ConsentType) => {
    const nextConsent: ConsentType = {
      necessary: true,
      analytics: !!newConsent.analytics,
      advertising: !!newConsent.advertising,
      timestamp: Date.now(),
      version: CONSENT_VERSION,
    };

    try { localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(nextConsent)); }
    catch { /* Apply this visit's choice even when persistent storage is blocked. */ }
    setConsent(nextConsent);
    updateGoogleConsent(nextConsent);

    if (nextConsent.analytics || nextConsent.advertising) {
      loadGoogleTags(nextConsent);
    } else {
      removeOptionalStorageAndAds();
    }

    document.documentElement.dataset.tdConsentKnown = 'true';
    setIsVisible(false);
    setShowSettings(false);
  };

  const acceptAll = () => saveConsent({ necessary: true, analytics: true, advertising: true, timestamp: Date.now(), version: CONSENT_VERSION });
  const rejectOptional = () => saveConsent({ necessary: true, analytics: false, advertising: false, timestamp: Date.now(), version: CONSENT_VERSION });
  const saveSettings = () => saveConsent(consent);

  if (!isVisible) return null;
  if (!showSettings) return <section className={`td-consent-notice ${styles.notice}`} role="region" aria-label={t.title}>
    <p>{t.settingsNote} <Link href={getLocalizedPath(locale, 'cookies')}>{t.policy}</Link></p>
    <div className={styles.actions}>
      <button type="button" onClick={rejectOptional}>{t.reject}</button>
      <button type="button" onClick={() => setShowSettings(true)}>{t.manage}</button>
      <button type="button" onClick={acceptAll}>{t.accept}</button>
    </div>
  </section>;

  return <div className={styles.backdrop} onMouseDown={closeSettings}>
    <div ref={settingsRef} className={styles.settings} role="dialog" aria-modal="true" aria-label={t.settingsTitle} tabIndex={-1} onMouseDown={(event) => event.stopPropagation()}>
<div className="p-4 sm:p-6">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-secondary-900">{t.settingsTitle}</h3>
                <p className="text-xs text-secondary-500 mt-1">{t.settingsNote}</p>
              </div>
              <button onClick={closeSettings} className="text-secondary-400 hover:text-secondary-600" aria-label={t.close}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <div className="p-4 bg-secondary-50 rounded-xl border border-secondary-100">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-secondary-900">{t.necessaryTitle}</h4>
                    <p className="text-sm text-secondary-600 mt-1">{t.necessaryText}</p>
                  </div>
                  <div className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">{t.alwaysActive}</div>
                </div>
              </div>

              <div className="p-4 bg-secondary-50 rounded-xl border border-secondary-100">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-secondary-900">{t.analyticsTitle}</h4>
                    <p className="text-sm text-secondary-600 mt-1">{t.analyticsText}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer" aria-label={t.analyticsTitle}>
                    <input type="checkbox" checked={consent.analytics} onChange={(e) => setConsent({ ...consent, analytics: e.target.checked })} className="sr-only peer" />
                    <div className="w-11 h-6 bg-secondary-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
                  </label>
                </div>
              </div>

              <div className="p-4 bg-secondary-50 rounded-xl border border-secondary-100">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-secondary-900">{t.adsTitle}</h4>
                    <p className="text-sm text-secondary-600 mt-1">{t.adsText}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer" aria-label={t.adsTitle}>
                    <input type="checkbox" checked={consent.advertising} onChange={(e) => setConsent({ ...consent, advertising: e.target.checked })} className="sr-only peer" />
                    <div className="w-11 h-6 bg-secondary-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button onClick={rejectOptional} className="border border-secondary-200 text-secondary-800 hover:bg-secondary-50 font-semibold py-2.5 px-4 rounded-xl transition-colors">{t.reject}</button>
              <button onClick={saveSettings} className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors">{t.save}</button>
              <button onClick={acceptAll} className="border border-secondary-200 text-secondary-800 hover:bg-secondary-50 font-semibold py-2.5 px-4 rounded-xl transition-colors">{t.accept}</button>
            </div>
          </div>
    </div>
  </div>;
}
