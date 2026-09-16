import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sorun veya Çözüm Ekle | Tooldur',
  description: 'Tooldur Çözüm Ağına gerçek bir teknik sorun, çözüm veya deneyim ekle.',
  robots: { index: false, follow: true },
};

export default function YeniCozumLayout({ children }: { children: React.ReactNode }) {
  return children;
}
