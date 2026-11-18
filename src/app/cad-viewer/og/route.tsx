import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';

export function GET() {
  return new ImageResponse(
    <div style={{
      display: 'flex', width: '100%', height: '100%', flexDirection: 'column', justifyContent: 'center',
      background: '#111d2c', color: '#edf5ff', padding: '70px 88px', fontFamily: 'sans-serif',
    }}>
      <span style={{ display: 'flex', color: '#f3b443', fontSize: 40, fontWeight: 700 }}>Tooldur</span>
      <span style={{ display: 'flex', fontSize: 90, fontWeight: 800, marginTop: 20 }}>DWG / STEP</span>
      <span style={{ display: 'flex', color: '#9fc7ef', fontSize: 60, marginTop: 4 }}>CAD Viewer</span>
      <div style={{ display: 'flex', marginTop: 42, alignItems: 'center' }}>
        <div style={{ display: 'flex', width: 16, height: 16, borderRadius: 8, background: '#f3b443' }} />
        <div style={{ display: 'flex', width: 430, height: 3, background: '#f3b443' }} />
        <div style={{ display: 'flex', width: 16, height: 16, borderRadius: 8, background: '#f3b443' }} />
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}
