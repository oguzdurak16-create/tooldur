'use client';

import { useEffect } from 'react';
import Link from 'next/link';

const PUBLISHER_ID = 'ca-pub-4491868887846507';

type AdWindow = Window & { adsbygoogle?: Array<Record<string, unknown>> };

export default function SiteMonetization() {
  const slot = process.env.NEXT_PUBLIC_ADSENSE_CONTENT_SLOT?.trim();

  useEffect(() => {
    if (!slot) return;
    try {
      const adWindow = window as AdWindow;
      (adWindow.adsbygoogle = adWindow.adsbygoogle || []).push({});
    } catch {
      // Ad blockers and delayed consent can prevent initialization safely.
    }
  }, [slot]);

  return (
    <section aria-label="Tooldur destek ve reklam alanı" style={{ padding: '22px 16px 34px' }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gap: 14 }}>
        {slot ? (
          <aside
            aria-label="Reklam"
            style={{
              minHeight: 120,
              padding: 12,
              border: '1px solid rgba(255,255,255,.08)',
              borderRadius: 18,
              background: 'rgba(255,255,255,.025)',
              overflow: 'hidden',
            }}
          >
            <span style={{ display: 'block', marginBottom: 8, fontSize: 10, letterSpacing: '.12em', opacity: 0.55 }}>REKLAM</span>
            <ins
              className="adsbygoogle"
              style={{ display: 'block', minHeight: 90 }}
              data-ad-client={PUBLISHER_ID}
              data-ad-slot={slot}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </aside>
        ) : null}

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
            padding: '18px 20px',
            border: '1px solid rgba(255,177,27,.22)',
            borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(255,177,27,.10), rgba(255,255,255,.025))',
          }}
        >
          <div>
            <strong style={{ display: 'block', marginBottom: 5 }}>Tooldur işine yarıyorsa gelişimini destekle.</strong>
            <span style={{ fontSize: 14, opacity: 0.72 }}>Yeni mühendislik araçları ve TooldurCAD geliştirmeleri ücretsiz kalmaya devam etsin.</span>
          </div>
          <Link
            href="/bizi-destekle"
            style={{
              minHeight: 44,
              padding: '0 18px',
              borderRadius: 13,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#ffb11b',
              color: '#07101d',
              textDecoration: 'none',
              fontWeight: 900,
            }}
          >
            Destek seçenekleri
          </Link>
        </div>
      </div>
    </section>
  );
}
