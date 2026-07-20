import type { Metadata } from 'next';
import AllToolsClient from '@/components/AllToolsClient';
import { languageAlternates } from '@/lib/siteLanguage';
import { getToolsPageCopy } from '@/lib/toolLocalization';

const copy = getToolsPageCopy('en');

export const metadata: Metadata = {
  title: copy.title,
  description: copy.description,
  alternates: { canonical: '/en/tools', languages: languageAlternates('tools') },
};

export default function EnglishToolsPage() {
  return <AllToolsClient locale="en" />;
}
