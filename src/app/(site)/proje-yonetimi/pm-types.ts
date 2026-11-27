export type Oncelik = 'dusuk' | 'orta' | 'yuksek';
export type Durum   = 'yapilacak' | 'devam' | 'inceleme' | 'tamamlandi';

export interface UyeRef {
  uid:         string;
  email:       string;
  displayName: string;
  photoURL?:   string;
  rol?:        'sahip' | 'uye';
}

export interface CheckItem {
  id:         string;
  metin:      string;
  tamamlandi: boolean;
}

export interface Ek {
  id:          string;
  ad:          string;
  url:         string;
  boyut:       number;
  tip:         string;
  yukleyenUid: string;
  tarih:       string;
}

export interface Yorum {
  id:        string;
  metin:     string;
  yazarUid:  string;
  yazarAd:   string;
  yazarFoto?: string;
  tarih:     string;
}

export interface Gorev {
  id:               string;
  baslik:           string;
  aciklama:         string;
  durum:            Durum;
  oncelik:          Oncelik;
  termin:           string;
  atananlar:        UyeRef[];
  checklistler:     CheckItem[];
  ekler:            Ek[];
  yorumlar:         Yorum[];
  etiketler:        string[];
  olusturanUid:     string;
  olusturmaTarih:   string;
  guncellenmeTarih: string;
}

export interface Proje {
  id:             string;
  ad:             string;
  aciklama:       string;
  renk:           string;
  emoji:          string;
  sahipUid:       string;
  uyeler:         UyeRef[];
  davetliler:     string[];
  olusturmaTarih: string;
}
export type PmAktiviteTipi =
  | 'gorev_olusturuldu'
  | 'gorev_guncellendi'
  | 'durum_degisti'
  | 'yorum_eklendi'
  | 'ek_yuklendi'
  | 'ek_silindi'
  | 'checklist_degisti';

export interface PmAktivite {
  id: string;
  projeId: string;
  gorevId: string;
  tip: PmAktiviteTipi;
  aciklama: string;
  actorUid: string;
  actorAd: string;
  actorFoto?: string;
  createdAt: string;
}