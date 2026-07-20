'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CookieConsent from '@/components/CookieConsent';
import MobileTabBar from '@/components/MobileTabBar';
import ToastBridge from '@/components/ToastBridge';
import PwaManager from '@/components/PwaManager';

type Props = {
  area: 'top' | 'bottom';
};

/**
 * Üst ve alt uygulama kabuğunu sunucuda da aynı HTML ile üretir.
 * İlk render'ı useEffect sonrasına bırakmak, büyük DOM bloklarını hydration
 * sürerken sonradan ekleyerek seçici hydration sırasını bozabiliyordu.
 */
export default function ClientChrome({ area }: Props) {
  if (area === 'top') return <Header />;

  return (
    <>
      <Footer />
      <CookieConsent />
      <MobileTabBar />
      <ToastBridge />
      <PwaManager />
    </>
  );
}
