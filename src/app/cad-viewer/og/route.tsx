import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';

export function GET() {
  return new ImageResponse(
    <div style={{
      display: 'flex', alignItems: 'center', width: '100%', height: '100%', padding: '72px 85px',
      backgroundImage: 'linear-gradient(125deg, #111c24 0%, #314b59 100%)',
      color: '#edf4f6', fontFamily: 'sans-serif',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', width: 470 }}>
        <span style={{ color: '#ffc56e', fontSize: 38, fontWeight: 700 }}>Tooldur</span>
        <span style={{ fontSize: 71, fontWeight: 800, marginTop: 25 }}>DWG / STEP</span>
        <span style={{ color: '#9fe4eb', fontSize: 45 }}>CAD Viewer</span>
      </div>
      <svg viewBox="0 0 500 340" width="550" height="374">
        <rect x="7" y="9" width="486" height="322" rx="19" fill="#142731" stroke="#779da9" strokeWidth="2" />
        <path d="M63 82H435M63 142H435M63 202H435M63 262H435M124 48V287M185 48V287M246 48V287M307 48V287M368 48V287" fill="none" stroke="#33505d" strokeWidth="1" />
        <path d="m102 195 104-62 179 43-104 63z" fill="#9db6c0" stroke="#c5d8de" strokeWidth="2" />
        <path d="m102 195 179 44v30l-179-44zm179 44 104-63v30l-104 63z" fill="#4e7181" stroke="#a2c3cc" strokeWidth="2" />
        <path d="m175 184 56-33 54 12-57 35z" fill="#163642" stroke="#84dce2" strokeWidth="3" />
        <path d="m154 167 104-62 87 21-103 63v35l-88-21zm88 22 103-63v36l-103 62z" fill="#7898a6" stroke="#d8e7e9" strokeWidth="2" />
        <path d="M105 268l175 43m-171-52-5 17m179 27-5 17m19-14 108-65m-117 58 12 15m99-80 12 15" stroke="#ffc56e" strokeWidth="3" fill="none" />
        <path d="M358 95h65m-33-32v64" stroke="#88dce3" strokeWidth="2" />
        <circle cx="390" cy="95" r="17" fill="none" stroke="#88dce3" strokeWidth="2" />
      </svg>
    </div>,
    { width: 1200, height: 630 },
  );
}
