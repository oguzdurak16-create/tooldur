export { LocalizedRoutePage as default, localizedRouteMetadata as generateMetadata } from '@/components/LocalizedRoute';

export const revalidate = false;
export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}
