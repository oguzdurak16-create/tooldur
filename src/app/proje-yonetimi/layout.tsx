import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Proje Yönetimi',
  description:
    'Ücretsiz online proje ve görev yönetimi. Üye olarak projelerinizi kaydedin, görevlerinizi takip edin ve mühendislik süreçlerinizi tek ekrandan yönetin.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/proje-yonetimi' },
  openGraph: {
    title: 'Proje Yönetimi',
    description: 'Üye olarak projelerinizi kaydedin, görevlerinizi takip edin ve mühendislik süreçlerinizi tek ekrandan yönetin.',
    type: 'website',
  },
};

export default function ProjeYonetimiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}