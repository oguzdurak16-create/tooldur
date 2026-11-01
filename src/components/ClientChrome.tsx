'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CookieConsent from '@/components/CookieConsent';
import ToastBridge from '@/components/ToastBridge';
import PwaManager from '@/components/PwaManager';
import MervePushSetup from '@/components/MervePushSetup';
import GoogleAnalytics from '@/components/GoogleAnalytics';

type Props = {
  area: 'top' | 'bottom';
};

/**
 * Üst ve alt uygulama kabuğunu sunucuda da aynı HTML ile üretir.
 * İlk render'ı useEffect sonrasına bırakmak, büyük DOM bloklarını hydration
 * sürerken sonradan ekleyerek seçici hydration sırasını bozabiliyordu.
 */
export default function ClientChrome({ area }: Props) {
  const pathname = usePathname();
  const isHumanityTest = pathname === '/insanlik-testi';

  if (area === 'top') {
    return (
      <>
        <GoogleAnalytics />
        {!isHumanityTest && <Header />}
        <CookieConsent />
      </>
    );
  }

  if (isHumanityTest) {
    return (
      <>
        <ToastBridge />
      </>
    );
  }

  return (
    <>
      <Footer />
      <ToastBridge />
      <PwaManager />
      <MervePushSetup />
    </>
  );
}
