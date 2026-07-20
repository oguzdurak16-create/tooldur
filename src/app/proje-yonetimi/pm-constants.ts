import type { Durum, Oncelik } from './pm-types';

export const KOLONLAR: { id: Durum; label: string; renk: string }[] = [
  { id: 'yapilacak',  label: 'Yapılacak',    renk: '#9c9890' },
  { id: 'devam',      label: 'Devam Ediyor', renk: '#2d5282' },
  { id: 'inceleme',   label: 'İncelemede',   renk: '#b45309' },
  { id: 'tamamlandi', label: 'Tamamlandı',   renk: '#166534' },
];

export const ONCELIK_MAP: Record<Oncelik, { label: string; bg: string; color: string }> = {
  dusuk:  { label: 'Düşük',  bg: '#dcfce7', color: '#166534' },
  orta:   { label: 'Orta',   bg: '#fef3c7', color: '#b45309' },
  yuksek: { label: 'Yüksek', bg: '#fee2e2', color: '#991b1b' },
};

export const PROJE_RENKLERI = ['#1e3a5f','#166534','#991b1b','#b45309','#6d28d9','#0e7490','#be185d','#065f46'];
export const PROJE_EMOJILER = ['📁','🏗','⚡','🔧','🏢','🌿','🎯','🚀','📐','💡'];