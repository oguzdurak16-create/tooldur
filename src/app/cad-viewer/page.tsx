import CadLanding, { cadMetadata } from './CadLanding';

export const metadata = cadMetadata('tr');

export default function TurkishCadPage() {
  return <CadLanding locale="tr" />;
}
