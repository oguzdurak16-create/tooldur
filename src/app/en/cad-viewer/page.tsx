import CadLanding, { cadMetadata } from '@/app/(site)/cad-viewer/CadLanding';

export const metadata = cadMetadata('en');

export default function EnglishCadPage() {
  return <CadLanding locale="en" />;
}
