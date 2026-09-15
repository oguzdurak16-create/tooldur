export type CozumSeoKaydi = {
  baslik?: string | null;
  icerik?: string | null;
};

export const COZUM_MIN_BASLIK = 12;
export const COZUM_MIN_ICERIK = 80;

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
