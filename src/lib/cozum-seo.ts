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

export function cozumKategorileriniFiltrele<T extends CozumKategoriKaydi>(kategoriler: T[]): T[] {
  const izinli = new Set<string>(COZUM_KATEGORI_SLUGLARI);
  const cozumKategorileri = kategoriler.filter((kategori) => kategori.slug && izinli.has(kategori.slug));

  // Bootstrap henüz uygulanmadıysa mevcut forum kategorileriyle MVP çalışmaya devam etsin.
  return cozumKategorileri.length > 0 ? cozumKategorileri : kategoriler;
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
