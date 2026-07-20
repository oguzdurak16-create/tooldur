'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Check, Cookie, Settings, X } from 'lucide-react';
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
        send_page_view: true,
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

function removeOptionalScripts() {
  if (typeof document === 'undefined') return;
  ['tooldur-gtag-script', 'tooldur-adsense-script'].forEach((id) => {
    document.getElementById(id)?.remove();
  });
  removeGoogleCookies();
}

export default function CookieConsent() {
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const t = UI_TEXT[locale].cookie;
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState<ConsentType>(defaultConsent);

  useEffect(() => {
    setDefaultDeniedConsent();

    const openSettings = () => {
      const saved = localStorage.getItem(COOKIE_CONSENT_KEY);
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

    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (savedConsent) {
      try {
        const parsed = normalizeConsent(JSON.parse(savedConsent) as Partial<ConsentType>);
        setConsent(parsed);
        updateGoogleConsent(parsed);
        if (parsed.analytics || parsed.advertising) loadGoogleTags(parsed);
        if (!parsed.analytics && !parsed.advertising) removeOptionalScripts();
      } catch {
        setIsVisible(true);
      }
    } else {
      const timer = window.setTimeout(() => setIsVisible(true), 600);
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener('tooldur:cookie-settings', openSettings);
      };
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

    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(nextConsent));
    setConsent(nextConsent);
    updateGoogleConsent(nextConsent);

    if (nextConsent.analytics || nextConsent.advertising) {
      loadGoogleTags(nextConsent);
    } else {
      removeOptionalScripts();
    }

    setIsVisible(false);
    setShowSettings(false);
  };

  const acceptAll = () => saveConsent({ necessary: true, analytics: true, advertising: true, timestamp: Date.now(), version: CONSENT_VERSION });
  const rejectOptional = () => saveConsent({ necessary: true, analytics: false, advertising: false, timestamp: Date.now(), version: CONSENT_VERSION });
  const saveSettings = () => saveConsent(consent);

  if (!isVisible) return null;

  return (
    <div className="cookie-consent fixed left-3 right-3 sm:left-4 sm:right-4 z-[100000] pointer-events-none bottom-[calc(92px_+_env(safe-area-inset-bottom))] sm:bottom-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl border border-secondary-200 overflow-hidden pointer-events-auto max-h-[calc(100vh_-_120px_-_env(safe-area-inset-bottom))] sm:max-h-none overflow-y-auto">
        {!showSettings ? (
          <div className="p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="hidden sm:flex w-11 h-11 bg-primary-100 rounded-xl items-center justify-center flex-shrink-0">
                <Cookie className="w-5 h-5 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-secondary-900 mb-2">{t.title}</h3>
                <p className="text-secondary-600 text-sm leading-6 mb-4">
                  {t.text}{' '}
                  <Link href={getLocalizedPath(locale, 'cookies')} className="text-primary-600 hover:underline font-semibold">{t.policy}</Link>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button onClick={rejectOptional} className="border border-secondary-200 text-secondary-800 hover:bg-secondary-50 font-semibold py-2.5 px-4 rounded-xl transition-colors">
                    {t.reject}
                  </button>
                  <button onClick={() => setShowSettings(true)} className="border border-secondary-200 text-secondary-800 hover:bg-secondary-50 font-semibold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                    <Settings className="w-4 h-4" /> {t.manage}
                  </button>
                  <button onClick={acceptAll} className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" /> {t.accept}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="text-lg font-bold text-secondary-900">{t.settingsTitle}</h3>
                <p className="text-xs text-secondary-500 mt-1">{t.settingsNote}</p>
              </div>
              <button onClick={() => setShowSettings(false)} className="text-secondary-400 hover:text-secondary-600" aria-label={t.close}>
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
        )}
      </div>
    </div>
  );
}
