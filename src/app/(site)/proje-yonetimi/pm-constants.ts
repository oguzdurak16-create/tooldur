import type { Durum, Oncelik } from './pm-types';

export const KOLONLAR: { id: Durum; label: string; renk: string }[] = [
  { id: 'yapilacak',  label: 'Yapılacak',    renk: '#8d949d' },
  { id: 'devam',      label: 'Devam Ediyor', renk: '#f5b400' },
  { id: 'inceleme',   label: 'İncelemede',   renk: '#5b8def' },
  { id: 'tamamlandi', label: 'Tamamlandı',   renk: '#36a269' },
];

export const ONCELIK_MAP: Record<Oncelik, { label: string; bg: string; color: string }> = {
  dusuk:  { label: 'Düşük',  bg: '#dcfce7', color: '#166534' },
  orta:   { label: 'Orta',   bg: '#fef3c7', color: '#b45309' },
  yuksek: { label: 'Yüksek', bg: '#fee2e2', color: '#991b1b' },
};

export const PROJE_RENKLERI = ['#f5b400','#d99028','#8d949d','#5b8def','#36a269','#ef5350','#8b5cf6','#0e7490'];
export const PROJE_EMOJILER = ['📁','🏗','⚡','🔧','🏢','🌿','🎯','🚀','📐','💡'];