import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'İnsanlık Testi — İnsanları gerçekten okuyabiliyor musun?';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#070807', color: '#f4f6ec', padding: 64, fontFamily: 'Arial, sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: '#d8ff48', fontSize: 22, letterSpacing: 5, fontWeight: 800 }}>
          <div style={{ width: 48, height: 48, border: '2px solid #d8ff48', borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>H</div>
          HUMAN SIGNAL LAB
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#9ca091', fontSize: 24, letterSpacing: 4, marginBottom: 18 }}>8 KARAR · 90 SANİYE</div>
          <div style={{ fontSize: 72, lineHeight: 1.02, letterSpacing: -4, fontWeight: 900 }}>İnsanları gerçekten<br /><span style={{ color: '#d8ff48' }}>okuyabiliyor musun?</span></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8b8f82', fontSize: 20 }}>
          <span>Cevap vermeden sonucu göremezsin.</span><span>PILOT 01</span>
        </div>
      </div>
    ),
    size,
  );
}
