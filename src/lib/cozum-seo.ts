export type CozumSeoKaydi = {
  baslik?: string | null;
  icerik?: string | null;
};

export type CozumKategoriKaydi = {
  slug?: string | null;
};

export const COZUM_MIN_BASLIK = 12;
export const COZUM_MIN_ICERIK = 80;

export const COZUM_KATEGORI_SLUGLARI = [
  'cad-teknik-cizim',
  'makine-uretim',
  'elektrik-otomasyon',
  'arac-mekanik',
  'yazilim-bilgisayar',
  'ev-teknik-cihazlar',
] as const;

export function cozumKategorisiMi(slug?: string | null): boolean {
  return Boolean(slug && (COZUM_KATEGORI_SLUGLARI as readonly string[]).includes(slug));
}

export function cozumKategorileriniFiltrele<T extends CozumKategoriKaydi>(kategoriler: T[]): T[] {
  // Çözüm Ağı ile eski forum kesin olarak ayrıdır. Bootstrap migration henüz
  // uygulanmadıysa boş liste dönmek, eski forum kategorilerini fallback olarak
  // göstermekten daha güvenlidir.
  return kategoriler.filter((kategori) => cozumKategorisiMi(kategori.slug));
}

export function cozumIndexlenebilir(konu: CozumSeoKaydi): boolean {
  const baslik = String(konu.baslik || '').replace(/\s+/g, ' ').trim();
  const icerik = String(konu.icerik || '').replace(/\s+/g, ' ').trim();

  return baslik.length >= COZUM_MIN_BASLIK && icerik.length >= COZUM_MIN_ICERIK;
}

export function cozumAciklamasi(icerik?: string | null): string {
  const temiz = String(icerik || '').replace(/\s+/g, ' ').trim();
  if (!temiz) return 'Gerçek kullanıcı deneyimleri ve teknik çözümler.';
  return temiz.slice(0, 155);
}
