import type { Metadata } from 'next'
import AnalyzerClient from './AnalyzerClient'
import './analyzer.css'

export const metadata: Metadata = {
  title: 'GSC Analyzer',
  description: 'Özel Google Search Console ve GA4 mobil analiz paneli.',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
}

export default function GscAnalyzerPage() {
  return <AnalyzerClient />
}
