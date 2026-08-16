import type { Metadata } from 'next'
import SiteRadarClient from './SiteRadarClient'
import './site-radar.css'

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
  return <SiteRadarClient />
}
