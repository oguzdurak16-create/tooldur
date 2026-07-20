import type { Metadata } from 'next'
import './globals.css'
import ClientChrome from '@/components/ClientChrome'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#070b12' },
    { media: '(prefers-color-scheme: dark)', color: '#070b12' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.tooldur.com'),
  title: {
    default: 'Tooldur | Ücretsiz Mühendislik Hesaplama Araçları',
    template: '%s | Tooldur',
  },
  description:
    'Mil-delik toleransı, kama kanalı, sac ağırlık, cıvata torku, segman kanalı ve teknik çizim yardımcıları için ücretsiz mühendislik hesaplama araçları.',
  keywords: [
    'mühendislik hesaplama', 'mekanik tasarım araçları', 'mil delik tolerans',
    'iso geçme toleransı', 'kama kanalı hesaplama', 'segman kanalı',
    'cıvata torku hesaplama', 'sac ağırlık hesaplama', 'sac büküm açınım',
    'yüzey pürüzlülüğü', 'metrik diş tablosu', 'kılavuz matkap çapları',
    'torna derece hesaplama', 'dalgıç pompa hesaplama', 'donatı ağırlıkları',
    'teknik resim', 'tooldur',
  ],
  authors: [{ name: 'Tooldur', url: 'https://www.tooldur.com' }],
  creator: 'Tooldur',
  publisher: 'Tooldur',
  category: 'technology',
  applicationName: 'Tooldur',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Tooldur',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: { email: false, address: false, telephone: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://www.tooldur.com',
    siteName: 'Tooldur',
    title: 'Tooldur | Ücretsiz Mühendislik Hesaplama Araçları',
    description:
      'Mil-delik toleransı, kama kanalı, sac ağırlık, cıvata torku ve teknik çizim yardımcıları için ücretsiz mühendislik araçları.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Tooldur mühendislik hesaplama araçları' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tooldur | Ücretsiz Mühendislik Hesaplama Araçları',
    description: 'Ücretsiz mekanik tasarım ve mühendislik hesaplama araçları.',
    images: ['/og-image.png'],
  },
  verification: { google: 'B7PJnCYqkyg80sMJaDxlPLGbOo1MBUQUMdfHtoM3HAE' },
}

const siteIdentityJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://www.tooldur.com/#organization',
      name: 'Tooldur',
      url: 'https://www.tooldur.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.tooldur.com/icon-512.png',
        width: 512,
        height: 512,
      },
      description: 'Ücretsiz mühendislik hesaplama araçları ve teknik tasarım yardımcıları.',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.tooldur.com/#website',
      url: 'https://www.tooldur.com',
      name: 'Tooldur',
      alternateName: 'Tooldur Mühendislik Araçları',
      inLanguage: 'tr-TR',
      publisher: { '@id': 'https://www.tooldur.com/#organization' },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://www.tooldur.com/araclar?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteIdentityJsonLd) }}
        />
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          id="tooldur-service-worker-guard"
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                if (!('serviceWorker' in navigator)) return;
                var controller = navigator.serviceWorker.controller;
                if (!controller || controller.scriptURL.indexOf('runtime=v6') !== -1) return;
                var reloadKey = 'tooldur_old_sw_cleanup_v6';
                if (sessionStorage.getItem(reloadKey)) return;
                sessionStorage.setItem(reloadKey, '1');
                Promise.all([
                  navigator.serviceWorker.getRegistrations().then(function (items) {
                    return Promise.all(items.map(function (item) { return item.unregister(); }));
                  }),
                  'caches' in window
                    ? caches.keys().then(function (keys) {
                        return Promise.all(keys.map(function (key) { return caches.delete(key); }));
                      })
                    : Promise.resolve()
                ]).then(function () {
                  window.location.reload();
                }).catch(function () {});
              })();
            `,
          }}
        />
        <script
          id="tooldur-consent-default"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                analytics_storage: 'denied',
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                functionality_storage: 'granted',
                security_storage: 'granted'
              });
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col td-app-shell" suppressHydrationWarning>
        <a className="td-skip-link" href="#td-main-content">İçeriğe geç</a>
        <ClientChrome area="top" />
        <div id="td-main-content" className="flex-1">{children}</div>
        <ClientChrome area="bottom" />
      </body>
    </html>
  )
}
