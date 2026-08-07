'use client';

import { useEffect, useState } from 'react';
import { Download, WifiOff, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const DISMISS_KEY = 'tooldur_pwa_install_dismissed_at';
const IOS_DISMISS_KEY = 'tooldur_budget_ios_install_dismissed_at';
const VISIT_KEY = 'tooldur_pwa_visit_count';
const SW_RELOAD_KEY = 'tooldur_sw_runtime_v6_reloaded';
const DISMISS_DAYS = 14;

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
}

function isIosDevice() {
  const ua = window.navigator.userAgent;
  const touchMac = window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1;
  return /iPhone|iPad|iPod/i.test(ua) || touchMac;
}

async function registerSafeServiceWorker() {
  if (!('serviceWorker' in navigator) || process.env.NODE_ENV !== 'production') return;

  const hadController = Boolean(navigator.serviceWorker.controller);
  const registration = await navigator.serviceWorker.register('/sw.js?runtime=v6', {
    updateViaCache: 'none',
  });

  await registration.update().catch(() => undefined);

  registration.waiting?.postMessage('SKIP_WAITING');
  registration.addEventListener('updatefound', () => {
    const worker = registration.installing;
    if (!worker) return;
    worker.addEventListener('statechange', () => {
      if (worker.state === 'installed') worker.postMessage('SKIP_WAITING');
    });
  });

  const onControllerChange = () => {
    if (!hadController || window.sessionStorage.getItem(SW_RELOAD_KEY)) return;
    window.sessionStorage.setItem(SW_RELOAD_KEY, '1');
    window.location.reload();
  };
  navigator.serviceWorker.addEventListener('controllerchange', onControllerChange, { once: true });
}

export default function PwaManager() {
  const pathname = usePathname();
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showIosInstall, setShowIosInstall] = useState(false);
  const [showIosSteps, setShowIosSteps] = useState(false);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    registerSafeServiceWorker().catch(() => undefined);

    const visitCount = Number(window.localStorage.getItem(VISIT_KEY) || '0') + 1;
    window.localStorage.setItem(VISIT_KEY, String(Math.min(visitCount, 50)));

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      const promptEvent = event as InstallPromptEvent;
      setInstallPrompt(promptEvent);
      const dismissedAt = Number(window.localStorage.getItem(DISMISS_KEY) || '0');
      const dismissExpired = Date.now() - dismissedAt > DISMISS_DAYS * 86400000;
      if (!isStandalone() && visitCount >= 2 && dismissExpired) setShowInstall(true);
    };

    const updateConnection = () => setOffline(!navigator.onLine);
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('online', updateConnection);
    window.addEventListener('offline', updateConnection);
    updateConnection();

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('online', updateConnection);
      window.removeEventListener('offline', updateConnection);
    };
  }, []);

  useEffect(() => {
    if (pathname !== '/dashboard/butce' || !isIosDevice() || isStandalone()) {
      setShowIosInstall(false);
      setShowIosSteps(false);
      return;
    }
    const dismissedAt = Number(window.localStorage.getItem(IOS_DISMISS_KEY) || '0');
    const dismissExpired = Date.now() - dismissedAt > DISMISS_DAYS * 86400000;
    setShowIosInstall(dismissExpired);
  }, [pathname]);

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    trackEvent('pwa_install_prompt', { outcome: choice.outcome });
    setShowInstall(false);
    setInstallPrompt(null);
  };

  const dismiss = () => {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setShowInstall(false);
    trackEvent('pwa_install_dismiss');
  };

  const dismissIos = () => {
    window.localStorage.setItem(IOS_DISMISS_KEY, String(Date.now()));
    setShowIosInstall(false);
    setShowIosSteps(false);
    trackEvent('budget_ios_install_dismiss');
  };

  return (
    <>
      {offline && (
        <div className="td-offline-status" role="status">
          <WifiOff size={15} /> İnternet bağlantısı yok. Çevrim içi özellikler geçici olarak kullanılamaz.
        </div>
      )}

      {showInstall && installPrompt && (
        <aside className="td-pwa-install" aria-label="Tooldur uygulamasını yükle">
          <div className="td-pwa-install-icon"><Download size={20} /></div>
          <div><strong>Tooldur’u cihaza ekle</strong><span>Araçlara tam ekran ve daha hızlı eriş.</span></div>
          <button type="button" className="td-pwa-install-primary" onClick={install}>Yükle</button>
          <button type="button" className="td-pwa-install-close" onClick={dismiss} aria-label="Kapat"><X size={16} /></button>
        </aside>
      )}

      {showIosInstall && (
        <aside className="td-pwa-install" aria-label="Bütçe uygulamasını ana ekrana ekle">
          <div className="td-pwa-install-icon"><Download size={20} /></div>
          <div><strong>Bütçeyi ana ekrana ekle</strong><span>Tek dokunuşla uygulama gibi aç.</span></div>
          <button type="button" className="td-pwa-install-primary" onClick={() => setShowIosSteps(true)}>Nasıl?</button>
          <button type="button" className="td-pwa-install-close" onClick={dismissIos} aria-label="Kapat"><X size={16} /></button>
        </aside>
      )}

      {showIosSteps && (
        <div className="td-pwa-guide-backdrop" role="presentation" onClick={() => setShowIosSteps(false)}>
          <section className="td-pwa-guide" role="dialog" aria-modal="true" aria-label="Ana ekrana ekleme adımları" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="td-pwa-guide-close" onClick={() => setShowIosSteps(false)} aria-label="Kapat"><X size={17} /></button>
            <div className="td-pwa-install-icon"><Download size={21} /></div>
            <h3>Bütçeyi iPhone ana ekranına ekle</h3>
            <ol>
              <li>Bu sayfayı Safari’de aç.</li>
              <li>Safari’de <b>Paylaş</b> düğmesine dokun.</li>
              <li><b>Ana Ekrana Ekle</b> seçeneğini seç.</li>
              <li>Sağ üstten <b>Ekle</b> düğmesine dokun.</li>
            </ol>
            <p>İkon adı “Bütçe” olur ve açıldığında doğrudan harcama ekranına gider.</p>
            <button type="button" className="td-pwa-guide-ok" onClick={() => setShowIosSteps(false)}>Tamam</button>
          </section>
        </div>
      )}

      <style>{`
        .td-offline-status{position:fixed;z-index:1100;left:50%;bottom:74px;transform:translateX(-50%);display:flex;align-items:center;gap:8px;width:max-content;max-width:calc(100% - 24px);padding:10px 14px;border:1px solid rgba(251,191,36,.32);border-radius:12px;background:#111827;color:#fde68a;box-shadow:0 20px 45px rgba(0,0,0,.28);font-size:12px;font-weight:750}
        .td-pwa-install{position:fixed;z-index:1090;right:18px;bottom:18px;width:min(430px,calc(100% - 24px));display:grid;grid-template-columns:auto minmax(0,1fr) auto auto;align-items:center;gap:11px;padding:12px;border:1px solid rgba(255,177,27,.28);border-radius:16px;background:rgba(9,18,31,.96);color:#f8fafc;box-shadow:0 24px 70px rgba(0,0,0,.38);backdrop-filter:blur(16px)}.td-pwa-install-icon{width:42px;height:42px;display:flex;align-items:center;justify-content:center;border-radius:12px;background:rgba(255,177,27,.12);color:#ffb11b;flex:0 0 auto}.td-pwa-install>div:nth-child(2){min-width:0;display:flex;flex-direction:column;gap:3px}.td-pwa-install strong{font-size:13px}.td-pwa-install span{color:#9fb0c7;font-size:11px}.td-pwa-install button{cursor:pointer}.td-pwa-install-primary{min-height:36px;padding:0 13px;border:0;border-radius:10px;background:#ffb11b;color:#07111f;font-size:11.5px;font-weight:850}.td-pwa-install-close{width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(148,163,184,.18);border-radius:9px;background:transparent;color:#94a3b8}
        .td-pwa-guide-backdrop{position:fixed;inset:0;z-index:1200;display:grid;place-items:center;padding:18px;background:rgba(0,0,0,.72);backdrop-filter:blur(8px)}.td-pwa-guide{position:relative;width:min(420px,100%);padding:20px;border:1px solid rgba(255,177,27,.26);border-radius:20px;background:#0b111a;color:#f8fafc;box-shadow:0 30px 90px rgba(0,0,0,.5)}.td-pwa-guide-close{position:absolute;right:12px;top:12px;width:34px;height:34px;display:grid;place-items:center;border:1px solid rgba(148,163,184,.18);border-radius:10px;background:transparent;color:#94a3b8}.td-pwa-guide h3{margin:14px 0 12px;font-size:19px}.td-pwa-guide ol{margin:0;padding-left:21px;color:#d8e1ec;font-size:13px;line-height:1.65}.td-pwa-guide li+li{margin-top:5px}.td-pwa-guide p{margin:14px 0 0;color:#9fb0c7;font-size:11px;line-height:1.5}.td-pwa-guide-ok{width:100%;min-height:42px;margin-top:16px;border:0;border-radius:11px;background:#ffb11b;color:#07111f;font-weight:850}
        @media(max-width:620px){.td-pwa-install{right:12px;bottom:74px;grid-template-columns:auto minmax(0,1fr) auto}.td-pwa-install-primary{grid-column:2/3;width:fit-content}.td-pwa-install-close{grid-column:3;grid-row:1}.td-offline-status{bottom:74px}.td-pwa-guide-backdrop{place-items:end center;padding:0}.td-pwa-guide{width:100%;border-radius:20px 20px 0 0;padding:20px 18px calc(20px + env(safe-area-inset-bottom))}}
      `}</style>
    </>
  );
}
