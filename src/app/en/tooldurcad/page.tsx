import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Download, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'TooldurCAD Download | English',
  description: 'Download TooldurCAD v1.0.3 SolidWorks helper and Universal Lite setup files. Independent engineering helper for machine designers.',
  alternates: { canonical: 'https://www.tooldur.com/en/tooldurcad' },
  openGraph: { images: [{ url: '/visuals/topics/tool-software-og.webp', width: 1200, height: 630, alt: 'TooldurCAD engineering workspace' }] },
};

export default function EnglishTooldurCadPage() {
  return (
    <main style={{ maxWidth: 1120, margin: '0 auto', padding: '76px 20px' }}>
      <p style={{ color: 'var(--amber)', fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', fontSize: 12 }}>TooldurCAD</p>
      <h1 style={{ color: 'var(--ink)', fontSize: 'clamp(34px,5vw,58px)', letterSpacing: '-.05em', margin: '0 0 14px' }}>CAD helper for machine design workflows</h1>
      <p style={{ color: 'var(--ink-3)', lineHeight: 1.75, maxWidth: 780, fontSize: 17 }}>TooldurCAD brings keyway, internal/external retaining ring, tap drill and technical drawing helper functions into a compact engineering workflow.</p>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16 / 9', maxHeight: 500, marginTop: 26, borderRadius: 24, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 24px 64px rgba(0,0,0,.28)' }}>
        <Image src="/visuals/topics/tool-software.webp" alt="TooldurCAD engineering workspace with CAD screen and mechanical parts" fill priority sizes="(max-width: 1120px) 100vw, 1120px" style={{ objectFit: 'cover' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, marginTop: 30 }}>
        <Link href="/kurulum-indir" style={{ textDecoration: 'none', border: '1px solid rgba(255,177,27,.24)', background: 'rgba(255,177,27,.08)', borderRadius: 22, padding: 22, display: 'grid', gap: 10, color: 'var(--ink)' }}>
          <Download color="var(--amber)" />
          <strong>TooldurCAD SolidWorks Setup</strong>
          <span style={{ color: 'var(--ink-4)' }}>TooldurCAD-SolidWorks-Setup-v1.0.3.exe</span>
        </Link>
        <Link href="/kurulum-indir" style={{ textDecoration: 'none', border: '1px solid var(--border)', background: 'rgba(12,18,31,.72)', borderRadius: 22, padding: 22, display: 'grid', gap: 10, color: 'var(--ink)' }}>
          <Download color="var(--amber)" />
          <strong>TooldurCAD Universal Lite</strong>
          <span style={{ color: 'var(--ink-4)' }}>TooldurCAD-Universal-Lite-Setup-v1.0.3.exe</span>
        </Link>
      </div>
      <div style={{ marginTop: 24, border: '1px solid var(--border)', borderRadius: 20, padding: 18, color: 'var(--ink-4)', lineHeight: 1.65, display: 'flex', gap: 12 }}>
        <ShieldCheck color="var(--amber)" /> TooldurCAD is an independent engineering helper. It is not an official, certified or endorsed product of Dassault Systèmes or SOLIDWORKS.
      </div>
      <Link href="/kurulum-indir" style={{ display: 'inline-block', marginTop: 18, color: 'var(--amber)' }}>Open full Turkish download page</Link>
    </main>
  );
}
