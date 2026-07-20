'use client';

import { useEffect } from 'react';
import type { Gorev } from '../app/proje-yonetimi/pm-types';

// Chrome Notification kaldırıldı - sadece in-app bildirim
export function useBildirimler(_gorevler: Gorev[]) {}

export interface InAppBildirim {
  id:    string;
  tip:   'gecikme' | 'bugun' | 'yarin' | 'tamamlandi' | 'yorum';
  metin: string;
  tarih: Date;
  okundu: boolean;
}

export function gorevBildirimleriniHesapla(gorevler: Gorev[]): InAppBildirim[] {
  const bugun = new Date();
  bugun.setHours(0, 0, 0, 0);
  const bildirimler: InAppBildirim[] = [];

  gorevler.forEach(g => {
    if (!g.termin || g.durum === 'tamamlandi') return;
    const termin = new Date(g.termin);
    termin.setHours(0, 0, 0, 0);
    const fark = Math.round((termin.getTime() - bugun.getTime()) / 86400000);

    if (fark < 0) {
      bildirimler.push({ id: `overdue-${g.id}`, tip: 'gecikme', metin: `"${g.baslik}" ${Math.abs(fark)} gün gecikti`, tarih: new Date(), okundu: false });
    } else if (fark === 0) {
      bildirimler.push({ id: `today-${g.id}`, tip: 'bugun', metin: `"${g.baslik}" bugün bitiyor`, tarih: new Date(), okundu: false });
    } else if (fark === 1) {
      bildirimler.push({ id: `tomorrow-${g.id}`, tip: 'yarin', metin: `"${g.baslik}" yarın bitiyor`, tarih: new Date(), okundu: false });
    }
  });

  return bildirimler;
}