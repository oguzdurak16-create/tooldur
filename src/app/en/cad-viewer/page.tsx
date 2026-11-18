import CadLanding, { cadMetadata } from '../../cad-viewer/CadLanding';

export const metadata = cadMetadata('en');

export default function EnglishCadPage() {
  return <CadLanding locale="en" />;
}
