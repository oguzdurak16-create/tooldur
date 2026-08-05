'use client';

import { BadgeCheck, BookOpenCheck, Database, TriangleAlert } from 'lucide-react';
import type { Locale } from '@/lib/siteLanguage';

type Status = 'basic' | 'preliminary' | 'standard' | 'data';

const BASIC = new Set([
  'levha-agirlik-hesaplama', 'tork-hesaplama', 'basinc-hesaplama',
  'uzunluk-birimi-cevirici', 'agirlik-birimi-cevirici', 'alan-birimi-cevirici',
  'hacim-birimi-cevirici', 'sicaklik-birimi-cevirici', 'basinc-birimi-cevirici',
  'yuzde-hesaplama', 'hiz-hesaplama', 'alan-hesaplama', 'hacim-hesaplama',
  'pisagor-teoremi', 'ohm-kanunu-hesaplama', 'guc-verim-hesaplama',
  'termal-iletim-hesaplama', 'devir-frekans-donusumu', 'isil-genlesme-hesaplama',
  'molarite-seyreltme-hesaplama', 'oee-uretim-verimliligi-hesaplama',
  'takt-suresi-kapasite-hesaplama', 'api-sla-uptime-hesaplama', 'konik-hesaplama',
]);

const STANDARD_DEPENDENT = new Set([
  'iso-gecme-tolerans-hesaplama', 'civata-sikma-torku-hesaplama',
  'sac-bukum-acinim-hesaplama', 'sac-bukum-kesim-hesaplayici',
  'baklavali-sac-agirlik-hesaplama', 'kama-kanali-hesaplama',
  'kablo-kesiti-hesaplama', 'celik-profil-agirligi', 'demir-agirligi-hesaplama',
  'mil-mukavemet-hesaplama', 'disli-carki-hesaplama', 'yay-hesaplama',
  'rulman-omru-hesaplama', 'viskozite-donusumu', 'boru-eti-hesaplama',
  'kayis-kasnak-hesaplama', 'pompa-guc-hesaplama', 'kaynak-dikisi-hesaplama',
  'o-ring-kanali-hesaplama', 'basincli-kap-cidar-kalinligi',
  'kilavuz-matkap-hesaplama', 'yuzey-puruzlulugu-rehberi',
]);

const DATA_DEPENDENT = new Set([
  'pazaryeri-fiyat-hesaplama', 'elektrik-fatura-hesaplama', 'kdv-hesaplama',
  'kira-artis-hesaplama', 'karbon-emisyonu-hesaplama', 'gunes-paneli-enerji-hesaplama',
]);

const COPY = {
  tr: {
    basic: ['Temel formül doğrulandı', 'Sonuç, girilen değerler ve gösterilen varsayımlar için geçerlidir.'],
    preliminary: ['Ön boyutlandırma', 'Nihai tasarımda yükler, toleranslar, çevre ve güvenlik koşulları ayrıca doğrulanmalıdır.'],
    standard: ['Standart / katalog kontrolü gerekli', 'Son seçim üretici kataloğu veya güncel teknik standartla doğrulanmalıdır.'],
    data: ['Güncel veri kontrolü gerekli', 'Tarife, katsayı veya mevzuat zamanla değişebilir; güncel resmi kaynağı kontrol edin.'],
  },
  en: {
    basic: ['Core formula verified', 'The result is valid for the entered values and stated assumptions.'],
    preliminary: ['Preliminary sizing', 'Loads, tolerances, environment and safety conditions require final verification.'],
    standard: ['Standard / catalog check required', 'Verify the final selection against the current standard or manufacturer catalog.'],
    data: ['Current data check required', 'Tariffs, factors or regulations can change; verify the current official source.'],
  },
} as const;

function getStatus(slug: string): Status {
  if (BASIC.has(slug)) return 'basic';
  if (STANDARD_DEPENDENT.has(slug)) return 'standard';
  if (DATA_DEPENDENT.has(slug)) return 'data';
  return 'preliminary';
}

export default function CalculatorVerificationNotice({ slug, locale = 'tr' }: { slug: string; locale?: Locale }) {
  const status = getStatus(slug);
  const language = locale === 'tr' ? 'tr' : 'en';
  const [title, description] = COPY[language][status];
  const Icon = status === 'basic' ? BadgeCheck : status === 'standard' ? BookOpenCheck : status === 'data' ? Database : TriangleAlert;

  return (
    <div className="calc-panel mb-4 flex items-start gap-3 rounded-xl border border-[var(--border)] px-4 py-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
      <div><p className="text-xs font-bold text-[var(--foreground)]">{title}</p><p className="calc-muted mt-1 text-xs leading-5">{description}</p></div>
    </div>
  );
}
