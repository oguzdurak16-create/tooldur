import type { Metadata } from 'next';
import CozumDetayClient from './CozumDetayClient';

export const metadata: Metadata = {
  title: 'Teknik Sorun ve Çözümler | Tooldur Çözüm Ağı',
  description: 'Gerçek kullanıcıların paylaştığı teknik sorun, çözüm ve deneyimler.',
};

export default function CozumDetayPage({ params }: { params: { id: string } }) {
  return <CozumDetayClient id={params.id} />;
}
