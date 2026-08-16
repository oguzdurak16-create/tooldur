import type { Metadata } from 'next'
import SiteRadarClient from './SiteRadarClient'
import SeoExperimentsClient from './SeoExperimentsClient'
import './site-radar.css'
import './seo-experiments.css'

export const metadata: Metadata = {
  title: 'Site Radar',
  description: 'Tooldur, Hesaplas, Troublio ve Odyomuh için özel canlı site sağlık, GSC, GA4 ve GitHub analiz paneli.',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
}

export default function SiteRadarPage() {
  return (
    <>
      <SiteRadarClient />
      <SeoExperimentsClient />
    </>
  )
}
