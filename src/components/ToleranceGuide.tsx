import { AlertTriangle, Ruler } from 'lucide-react';
import type { ToleranceGuide as ToleranceGuideType } from '@/data/toleranceGuides';

interface Props {
  guide: ToleranceGuideType;
}

export default function ToleranceGuide({ guide }: Props) {
  return (
    <section style={{ background: 'var(--bg)', padding: '0 0 24px' }} aria-labelledby="tolerance-guide-title">
      <div className="td-container">
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '16px 18px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(255,177,27,0.12)',
                color: 'var(--amber)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Ruler className="w-4 h-4" />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>
                Toleranslar
              </div>
              <h2 id="tolerance-guide-title" style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>
                {guide.title}
              </h2>
            </div>
          </div>

          <div style={{ padding: '16px 18px 18px' }}>
            {guide.fitCards?.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                {guide.fitCards.map((fit) => (
                  <div
                    key={`${fit.label}-${fit.value}`}
                    style={{
                      padding: '12px 13px',
                      background: 'var(--bg-soft)',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                    }}
                  >
                    <div style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 6 }}>{fit.label}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--amber)', marginBottom: 4 }}>{fit.value}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.55 }}>{fit.use}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '10px 8px', color: 'var(--ink-4)', fontWeight: 600 }}>Bölge</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', color: 'var(--ink-4)', fontWeight: 600 }}>Tolerans</th>
                    <th style={{ textAlign: 'left', padding: '10px 8px', color: 'var(--ink-4)', fontWeight: 600 }}>Kullanım</th>
                  </tr>
                </thead>
                <tbody>
                  {guide.rows.map((row) => (
                    <tr key={`${row.item}-${row.tolerance}`} style={{ borderBottom: '1px solid var(--border-dim)' }}>
                      <td style={{ padding: '11px 8px', color: 'var(--ink)', fontWeight: 600 }}>{row.item}</td>
                      <td style={{ padding: '11px 8px', color: 'var(--amber)', fontWeight: 700 }}>{row.tolerance}</td>
                      <td style={{ padding: '11px 8px', color: 'var(--ink-3)', lineHeight: 1.55 }}>{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              style={{
                marginTop: 14,
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start',
                padding: '12px 13px',
                borderRadius: 12,
                background: 'rgba(255,177,27,0.08)',
                border: '1px solid rgba(255,177,27,0.18)',
              }}
            >
              <AlertTriangle className="w-4 h-4" style={{ color: 'var(--amber)', flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.55 }}>
                Bilgiler özet referanstır. Kesin teknik resim ve imalat kararı için güncel standart, katalog ve proje şartları esas alınmalıdır.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
