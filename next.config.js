/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'tooldur.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{ kebabCase member }}',
      preventFullImport: true,
    },
  },

  async redirects() {
    return [
      // Eski indirme adresleri
      { source: '/download', destination: '/kurulum-indir', permanent: true },
      { source: '/downloads', destination: '/kurulum-indir', permanent: true },
      { source: '/indir', destination: '/kurulum-indir', permanent: true },
      { source: '/kurulum', destination: '/kurulum-indir', permanent: true },
      { source: '/setup', destination: '/kurulum-indir', permanent: true },
      { source: '/tooldurcad', destination: '/kurulum-indir', permanent: true },
  
      // Eski setup dosyaları
      { source: '/TooldurCAD-Universal-Setup-v4.9.0.exe', destination: '/kurulum-indir', permanent: true },
      { source: '/TooldurCAD-SolidWorks-Setup-v4.9.0.exe', destination: '/kurulum-indir', permanent: true },
      { source: '/TooldurCAD-Universal-Lite-Setup-v5.8.0.exe', destination: '/kurulum-indir', permanent: true },
      { source: '/TooldurCAD-SolidWorks-Setup-v5.8.0.exe', destination: '/kurulum-indir', permanent: true },
      { source: '/TooldurCAD-Universal-Lite-Setup-v1.0.3.exe', destination: '/kurulum-indir', permanent: true },
      { source: '/TooldurCAD-SolidWorks-Setup-v1.0.3.exe', destination: '/kurulum-indir', permanent: true },
  
      // Eski İngilizce sayfalar
      { source: '/privacy', destination: '/gizlilik', permanent: true },
      { source: '/about', destination: '/hakkimizda', permanent: true },
      { source: '/contact', destination: '/iletisim', permanent: true },
  
      // Eski veya önceki sürümlerde kullanılan araç adresleri
      { source: '/arac/mil-delik-toleransi-hesaplama', destination: '/arac/iso-gecme-tolerans-hesaplama', permanent: true },
      { source: '/arac/gecme-toleransi-hesaplama', destination: '/arac/iso-gecme-tolerans-hesaplama', permanent: true },
      { source: '/arac/tolerans-rehberi', destination: '/arac/iso-gecme-tolerans-hesaplama', permanent: true },
      { source: '/arac/civata-torku-hesaplama', destination: '/arac/civata-sikma-torku-hesaplama', permanent: true },
      { source: '/arac/sac-agirlik-hesaplama', destination: '/arac/levha-agirlik-hesaplama', permanent: true },

      // Eski /tools sayfaları
      { source: '/tools/password-generator', destination: '/araclar', permanent: true },
      { source: '/tools/qr-generator', destination: '/araclar', permanent: true },
      { source: '/tools/color-picker', destination: '/araclar', permanent: true },
      { source: '/tools/text-counter', destination: '/araclar', permanent: true },
      { source: '/tools/image-compressor', destination: '/araclar', permanent: true },
      { source: '/tools/base64-encoder', destination: '/araclar', permanent: true },
      { source: '/tools/lorem-ipsum', destination: '/araclar', permanent: true },
      { source: '/tools/pdf-merge', destination: '/araclar', permanent: true },
  
      // Eski Blogger /p/ sayfaları
      { source: '/p/hakkimizda.html', destination: '/hakkimizda', permanent: true },
      { source: '/p/kullanim-kosullari.html', destination: '/kullanim-sartlari', permanent: true },
      { source: '/p/gizlilik-politikasi.html', destination: '/gizlilik', permanent: true },
      { source: '/p/iletisim.html', destination: '/iletisim', permanent: true },
  
      // Eski görsel araç sayfaları
      { source: '/p/gorsel-islemleri.html', destination: '/araclar', permanent: true },
      { source: '/p/gorsel-sikistirma.html', destination: '/araclar', permanent: true },
      { source: '/p/gorsel-donusturme.html', destination: '/araclar', permanent: true },
      { source: '/p/gorsel-boyutlandirma.html', destination: '/araclar', permanent: true },
      { source: '/p/qr-kod-olusturucu.html', destination: '/araclar', permanent: true },
      { source: '/p/kelime-sayaci.html', destination: '/araclar', permanent: true },
    ];
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "worker-src 'self' blob:",

              "script-src 'self' 'unsafe-inline' 'unsafe-eval' " +
                "https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com " +
                "https://*.google.com https://*.google.com.tr https://www.googleadservices.com " +
                "https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com " +
                "https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google " +
                "https://fundingchoicesmessages.google.com",

              "script-src-elem 'self' 'unsafe-inline' " +
                "https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com " +
                "https://*.google.com https://*.google.com.tr https://www.googleadservices.com " +
                "https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://tpc.googlesyndication.com " +
                "https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google " +
                "https://fundingchoicesmessages.google.com",

              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com",
              "font-src 'self' data: https://fonts.gstatic.com https://www.gstatic.com",

              "img-src 'self' data: blob: https: " +
                "https://*.google.com https://*.google.com.tr https://www.google-analytics.com " +
                "https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com " +
                "https://tpc.googlesyndication.com https://www.gstatic.com " +
                "https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google",

              "connect-src 'self' " +
                "https://*.supabase.co wss://*.supabase.co " +
                "https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com " +
                "https://www.googletagmanager.com " +
                "https://*.google.com https://*.google.com.tr https://www.googleadservices.com " +
                "https://googleads.g.doubleclick.net https://ad.doubleclick.net https://*.doubleclick.net https://stats.g.doubleclick.net https://csi.gstatic.com https://pagead2.googlesyndication.com https://tpc.googlesyndication.com " +
                "https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google " +
                "https://fundingchoicesmessages.google.com",

              "frame-src 'self' " +
                "https://googleads.g.doubleclick.net https://tpc.googlesyndication.com " +
                "https://*.google.com https://*.google.com.tr " +
                "https://ep1.adtrafficquality.google https://ep2.adtrafficquality.google " +
                "https://fundingchoicesmessages.google.com",

              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/manifest.json',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=3600, must-revalidate' }],
      },
      {
        source: '/_next/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

module.exports = nextConfig;