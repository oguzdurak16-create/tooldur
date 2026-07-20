'use client';

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { Tool } from '@/data/tools';
import type { Locale } from '@/lib/siteLanguage';
import LocalizedTextRuntime from '@/components/LocalizedTextRuntime';

const CalcLoading = () => (
  <div style={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ width: 28, height: 28, border: '3px solid var(--border)', borderTopColor: 'var(--amber)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const dyn = (path: string) => dynamic(() => import(`@/components/calculators/${path}`), {
  loading: CalcLoading,
  ssr: false,
});

const calculatorComponents: Record<string, ComponentType<any>> = {
  'iso-gecme-tolerans-hesaplama': dyn('IsoToleransCalculator'),
  'civata-sikma-torku-hesaplama': dyn('CivataTorkCalculator'),
  'sac-bukum-acinim-hesaplama': dyn('SacBukumAcinimCalculator'),
  'sac-bukum-kesim-hesaplayici': dyn('SacBukumKesimCalculator'),
  'pazaryeri-fiyat-hesaplama': dyn('PazaryeriFiyatHesaplamaCalculator'),
  'baklavali-sac-agirlik-hesaplama': dyn('BaklavaliSacAgirlikCalculator'),
  'voltaj-dusumu-hesaplama': dyn('VoltajDusumuCalculator'),
  'kama-kanali-hesaplama': dyn('KamaKanaliCalculator'),
  'kablo-kesiti-hesaplama': dyn('KabloKesitiCalculator'),
  'beton-miktari-hesaplama': dyn('BetonHesaplamaCalculator'),
  'celik-profil-agirligi': dyn('CelikProfilCalculator'),
  'uzunluk-birimi-cevirici': dyn('UzunlukCeviriciCalculator'),
  'elektrik-fatura-hesaplama': dyn('ElektrikFaturaCalculator'),
  'ohm-kanunu-hesaplama': dyn('OhmKanunuCalculator'),
  'led-direnc-hesaplama': dyn('LedDirencCalculator'),
  'guc-faktoru-duzeltme': dyn('GucFaktoruCalculator'),
  'demir-agirligi-hesaplama': dyn('DemirHesaplamaCalculator'),
  'tugla-hesaplama': dyn('TuglaHesaplamaCalculator'),
  'merdiven-hesaplama': dyn('MerdivenHesaplamaCalculator'),
  'levha-agirlik-hesaplama': dyn('LevhaAgirlikCalculator'),
  'tork-hesaplama': dyn('TorkHesaplamaCalculator'),
  'basinc-hesaplama': dyn('BasincHesaplamaCalculator'),
  'agirlik-birimi-cevirici': dyn('AgirlikCeviriciCalculator'),
  'alan-birimi-cevirici': dyn('AlanCeviriciCalculator'),
  'hacim-birimi-cevirici': dyn('HacimCeviriciCalculator'),
  'sicaklik-birimi-cevirici': dyn('SicaklikCeviriciCalculator'),
  'basinc-birimi-cevirici': dyn('BasincCeviriciCalculator'),
  'yuzde-hesaplama': dyn('YuzdeHesaplamaCalculator'),
  'hiz-hesaplama': dyn('HizHesaplamaCalculator'),
  'alan-hesaplama': dyn('AlanHesaplamaCalculator'),
  'hacim-hesaplama': dyn('HacimHesaplamaCalculator'),
  'pisagor-teoremi': dyn('PisagorCalculator'),
  'mil-mukavemet-hesaplama': dyn('MilMukavemetCalculator'),
  'disli-carki-hesaplama': dyn('DisliCarkiCalculator'),
  'yay-hesaplama': dyn('YayHesaplamaCalculator'),
  'rulman-omru-hesaplama': dyn('RulmanOmuruCalculator'),
  'viskozite-donusumu': dyn('ViskoziteCalculator'),
  'guc-verim-hesaplama': dyn('GucVerimCalculator'),
  'termal-iletim-hesaplama': dyn('TermalIletimCalculator'),
  'devir-frekans-donusumu': dyn('FrekansDevirCalculator'),
  'proje-yonetimi': dyn('ProjeYonetimiCalculator'),
  'boru-eti-hesaplama': dyn('BoruHesaplamaCalculator'),
  'kdv-hesaplama': dyn('KdvHesaplamaCalculator'),
  'bmi-hesaplama': dyn('BmiHesaplamaCalculator'),
  'kira-artis-hesaplama': dyn('KiraArtisHesaplamaCalculator'),
  'kredi-hesaplama': dyn('KrediHesaplamaCalculator'),
  'kayis-kasnak-hesaplama': dyn('KayisKasnakHesaplamaCalculator'),
  'pompa-guc-hesaplama': dyn('PompaGucHesaplamaCalculator'),
  'kaynak-dikisi-hesaplama': dyn('KaynakDikisiHesaplamaCalculator'),
  'o-ring-kanali-hesaplama': dyn('ORingKanaliCalculator'),
  'isil-genlesme-hesaplama': dyn('IsilGenlesmeCalculator'),
  'reynolds-sayisi-hesaplama': dyn('ReynoldsSayisiCalculator'),
  'basincli-kap-cidar-kalinligi': dyn('BasincliKapCidarCalculator'),
  'oee-uretim-verimliligi-hesaplama': dyn('OeeUretimCalculator'),
  'takt-suresi-kapasite-hesaplama': dyn('TaktSuresiCalculator'),
  'molarite-seyreltme-hesaplama': dyn('MolariteSeyreltmeCalculator'),
  'karbon-emisyonu-hesaplama': dyn('KarbonEmisyonuCalculator'),
  'gunes-paneli-enerji-hesaplama': dyn('GunesPaneliEnerjiCalculator'),
  'api-sla-uptime-hesaplama': dyn('ApiSlaUptimeCalculator'),
  'kilavuz-matkap-hesaplama': dyn('KilavuzMatkapCalculator'),
  'konik-hesaplama': dyn('KonikHesaplamaCalculator'),
  'yuzey-puruzlulugu-rehberi': dyn('YuzeyPuruzluluguCalculator'),
  'teknik-resim-cagri-olusturucu': dyn('TeknikCagriCalculator'),
};

const GenericCalculator = dynamic(() => import('@/components/calculators/GenericCalculator'), {
  loading: CalcLoading,
  ssr: false,
});

type Props = {
  slug: string;
  tool: Tool;
  locale?: Locale;
};

export default function CalculatorClientLoader({ slug, tool, locale = 'tr' }: Props) {
  const CalculatorComponent = calculatorComponents[slug] || GenericCalculator;
  return (
    <LocalizedTextRuntime locale={locale}>
      <CalculatorComponent tool={tool} locale={locale} />
    </LocalizedTextRuntime>
  );
}
