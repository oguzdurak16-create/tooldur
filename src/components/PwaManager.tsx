'use client';

import { useEffect, useState } from 'react';
import { Download, WifiOff, X } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const DISMISS_KEY = 'tooldur_pwa_install_dismissed_at';
const VISIT_KEY = 'tooldur_pwa_visit_count';
const SW_RELOAD_KEY = 'tooldur_sw_runtime_v6_reloaded';
const DISMISS_DAYS = 14;

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
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
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
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
      <style>{`
        .td-offline-status{position:fixed;z-index:1100;left:50%;bottom:74px;transform:translateX(-50%);display:flex;align-items:center;gap:8px;width:max-content;max-width:calc(100% - 24px);padding:10px 14px;border:1px solid rgba(251,191,36,.32);border-radius:12px;background:#111827;color:#fde68a;box-shadow:0 20px 45px rgba(0,0,0,.28);font-size:12px;font-weight:750}
        .td-pwa-install{position:fixed;z-index:1090;right:18px;bottom:18px;width:min(430px,calc(100% - 24px));display:grid;grid-template-columns:auto minmax(0,1fr) auto auto;align-items:center;gap:11px;padding:12px;border:1px solid rgba(255,177,27,.28);border-radius:16px;background:rgba(9,18,31,.96);color:#f8fafc;box-shadow:0 24px 70px rgba(0,0,0,.38);backdrop-filter:blur(16px)}.td-pwa-install-icon{width:42px;height:42px;display:flex;align-items:center;justify-content:center;border-radius:12px;background:rgba(255,177,27,.12);color:#ffb11b}.td-pwa-install>div:nth-child(2){min-width:0;display:flex;flex-direction:column;gap:3px}.td-pwa-install strong{font-size:13px}.td-pwa-install span{color:#9fb0c7;font-size:11px}.td-pwa-install button{cursor:pointer}.td-pwa-install-primary{min-height:36px;padding:0 13px;border:0;border-radius:10px;background:#ffb11b;color:#07111f;font-size:11.5px;font-weight:850}.td-pwa-install-close{width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:1px solid rgba(148,163,184,.18);border-radius:9px;background:transparent;color:#94a3b8}
        @media(max-width:620px){.td-pwa-install{right:12px;bottom:74px;grid-template-columns:auto minmax(0,1fr) auto}.td-pwa-install-primary{grid-column:2/3;width:fit-content}.td-pwa-install-close{grid-column:3;grid-row:1}.td-offline-status{bottom:74px}}
      `}</style>
    </>
  );
}
