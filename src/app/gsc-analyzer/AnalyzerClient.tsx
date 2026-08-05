'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Activity,
  ArrowLeft,
  BarChart3,
  ExternalLink,
  Eye,
  FileText,
  Gauge,
  LockKeyhole,
  MousePointerClick,
  RefreshCw,
  Search,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Site = 'Tooldur' | 'Hesaplas' | 'Troublio' | 'Odyomuh'
type Tab = 'overview' | 'opportunities' | 'pages' | 'queries' | 'ga4'
type RangeKey = 'latest' | 'last7' | 'last28'

const SITE_ORDER: Site[] = ['Tooldur', 'Hesaplas', 'Troublio', 'Odyomuh']
const SITE_COLORS: Record<Site, string> = {
  Tooldur: '#ffb11b',
  Hesaplas: '#60a5fa',
  Troublio: '#34d399',
  Odyomuh: '#c084fc',
}

const TABS: Array<{ id: Tab; label: string; icon: typeof BarChart3 }> = [
  { id: 'overview', label: 'Özet', icon: BarChart3 },
  { id: 'opportunities', label: 'Fırsatlar', icon: Sparkles },
  { id: 'pages', label: 'Sayfalar', icon: FileText },
  { id: 'queries', label: 'Sorgular', icon: Search },
  { id: 'ga4', label: 'GA4', icon: Activity },
]

const RANGE_LABELS: Record<RangeKey, string> = {
  latest: '1 gün',
  last7: '7 gün',
  last28: '28 gün',
}

function number(value: unknown, digits = 0) {
  return new Intl.NumberFormat('tr-TR', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(Number(value || 0))
}

function percent(value: unknown, digits = 1) {
  return `${number(Number(value || 0) * 100, digits)}%`
}

function signed(value: unknown, digits = 0) {
  const n = Number(value || 0)
  return `${n > 0 ? '+' : ''}${number(n, digits)}`
}

function shortPath(url = '') {
  try {
    const parsed = new URL(url)
    return `${parsed.pathname}${parsed.search}`
  } catch {
    return url || '/'
  }
}

function formatDate(value?: string) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

async function decodePayload(payload: any) {
  if (!payload || payload.encoding !== 'gzip-base64') return payload
  const Decoder = (globalThis as any).DecompressionStream
  if (!Decoder) throw new Error('Bu tarayıcı sıkıştırılmış panel verisini açamıyor. iOS/Safari güncellemesi gerekebilir.')
  const bytes = Uint8Array.from(atob(payload.data), (character) => character.charCodeAt(0))
  const stream = new Blob([bytes]).stream().pipeThrough(new Decoder('gzip'))
  const text = await new Response(stream).text()
  return JSON.parse(text)
}

function metricDelta(current: number, previous?: number) {
  if (previous === undefined || previous === null) return null
  const diff = current - previous
  const ratio = previous ? (diff / previous) * 100 : current ? 100 : 0
  return { diff, ratio }
}

function Delta({ current, previous, inverse = false }: { current: number; previous?: number; inverse?: boolean }) {
  const delta = metricDelta(current, previous)
  if (!delta || delta.diff === 0) return <span className="gsca-delta neutral">Değişmedi</span>
  const good = inverse ? delta.diff < 0 : delta.diff > 0
  return (
    <span className={`gsca-delta ${good ? 'good' : 'bad'}`}>
      {good ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {signed(delta.ratio, 0)}%
    </span>
  )
}

function Sparkline({ rows, color = '#ffb11b' }: { rows: any[]; color?: string }) {
  const values = (rows || []).map((row) => Number(row.i || 0))
  if (values.length < 2) return <div className="gsca-empty-chart">Grafik için veri bekleniyor</div>
  const width = 600
  const height = 150
  const max = Math.max(...values, 1)
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width
      const y = height - 12 - (value / max) * (height - 28)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  return (
    <div className="gsca-chart-wrap" aria-label="Günlük gösterim grafiği">
      <svg viewBox={`0 0 ${width} ${height}`} role="img">
        <defs>
          <linearGradient id="gsca-chart-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0.26" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline points={`0,${height} ${points} ${width},${height}`} fill="url(#gsca-chart-fill)" stroke="none" />
        <polyline points={points} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="gsca-chart-labels">
        <span>{rows[0]?.d?.slice(5)}</span>
        <span>{rows[rows.length - 1]?.d?.slice(5)}</span>
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  current,
  previous,
  inverse,
}: {
  label: string
  value: string
  hint?: string
  icon: typeof Eye
  current?: number
  previous?: number
  inverse?: boolean
}) {
  return (
    <article className="gsca-metric-card">
      <div className="gsca-metric-head"><span>{label}</span><Icon size={17} /></div>
      <strong>{value}</strong>
      <div className="gsca-metric-foot">
        {current !== undefined && previous !== undefined ? <Delta current={current} previous={previous} inverse={inverse} /> : <span>{hint || 'Güncel değer'}</span>}
      </div>
    </article>
  )
}

export default function AnalyzerClient() {
  const router = useRouter()
  const [snapshot, setSnapshot] = useState<any>(null)
  const [capturedAt, setCapturedAt] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [denied, setDenied] = useState(false)
  const [site, setSite] = useState<'all' | Site>('all')
  const [tab, setTab] = useState<Tab>('overview')
  const [range, setRange] = useState<RangeKey>('last7')

  const loadSnapshot = useCallback(async (manual = false) => {
    manual ? setRefreshing(true) : setLoading(true)
    setError('')
    try {
      const { data: userData, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      const user = userData?.user
      if (!user) {
        router.replace('/giris?redirect=/gsc-analyzer')
        return
      }
      const { data, error: queryError } = await supabase
        .from('gsc_analyzer_snapshots')
        .select('captured_at,payload')
        .eq('owner_id', user.id)
        .maybeSingle()
      if (queryError) throw queryError
      if (!data) {
        setDenied(true)
        return
      }
      setDenied(false)
      setSnapshot(await decodePayload(data.payload))
      setCapturedAt(data.captured_at)
    } catch (reason: any) {
      setError(reason?.message || 'Panel verisi yüklenemedi.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [router])

  useEffect(() => {
    loadSnapshot()
  }, [loadSnapshot])

  const selectedSites = useMemo<Site[]>(() => site === 'all' ? SITE_ORDER : [site], [site])

  const gsc = useMemo(() => {
    if (!snapshot) return { current: { clicks: 0, impressions: 0, ctr: 0, position: 0 }, previous: undefined as any }
    const rows = selectedSites.map((name) => snapshot.siteStats?.[name]).filter(Boolean)
    const aggregate = (key: RangeKey | 'previous' | 'previous7') => {
      let clicks = 0
      let impressions = 0
      let weightedPosition = 0
      rows.forEach((row: any) => {
        const item = row[key] || {}
        clicks += Number(item.clicks || 0)
        impressions += Number(item.impressions || 0)
        weightedPosition += Number(item.position || 0) * Number(item.impressions || 0)
      })
      return {
        clicks,
        impressions,
        ctr: impressions ? clicks / impressions : 0,
        position: impressions ? weightedPosition / impressions : 0,
      }
    }
    const previousKey = range === 'latest' ? 'previous' : range === 'last7' ? 'previous7' : null
    return { current: aggregate(range), previous: previousKey ? aggregate(previousKey) : undefined }
  }, [snapshot, selectedSites, range])

  const ga4 = useMemo(() => {
    const total = { users: 0, sessions: 0, views: 0, engagementWeighted: 0, previousSessions: 0, previousViews: 0, previousUsers: 0 }
    selectedSites.forEach((name) => {
      const row = snapshot?.ga4Comparison?.[name]
      if (!row) return
      const current = row.current || {}
      const previous = row.previous || {}
      total.users += Number(current.users || 0)
      total.sessions += Number(current.sessions || 0)
      total.views += Number(current.views || 0)
      total.engagementWeighted += Number(current.engagement || 0) * Number(current.sessions || 0)
      total.previousUsers += Number(previous.users || 0)
      total.previousSessions += Number(previous.sessions || 0)
      total.previousViews += Number(previous.views || 0)
    })
    return {
      ...total,
      engagement: total.sessions ? total.engagementWeighted / total.sessions : 0,
    }
  }, [snapshot, selectedSites])

  const organic = useMemo(() => selectedSites.reduce((sum, name) => sum + Number(snapshot?.organic?.[name]?.sessions || 0), 0), [snapshot, selectedSites])

  const series = useMemo(() => {
    const dateMap = new Map<string, { d: string; i: number; c: number }>()
    selectedSites.forEach((name) => {
      ;(snapshot?.dailySeries?.[name] || []).forEach((row: any) => {
        const current = dateMap.get(row.d) || { d: row.d, i: 0, c: 0 }
        current.i += Number(row.i || 0)
        current.c += Number(row.c || 0)
        dateMap.set(row.d, current)
      })
    })
    return [...dateMap.values()].sort((a, b) => a.d.localeCompare(b.d))
  }, [snapshot, selectedSites])

  const opportunities = useMemo(() => (snapshot?.opportunities || []).filter((item: any) => site === 'all' || item.site === site), [snapshot, site])
  const pages = useMemo(() => selectedSites.flatMap((name) => (snapshot?.pageStats?.[name] || []).map((row: any) => ({ ...row, site: name }))), [snapshot, selectedSites])
  const queries = useMemo(() => selectedSites.flatMap((name) => (snapshot?.queries?.[name] || []).map((row: any) => ({ ...row, site: name }))), [snapshot, selectedSites])
  const ga4Pages = useMemo(() => selectedSites.flatMap((name) => (snapshot?.ga4Pages?.[name] || []).map((row: any) => ({ ...row, site: name }))), [snapshot, selectedSites])
  const ga4Sources = useMemo(() => (snapshot?.ga4Sources || []).filter((row: any) => site === 'all' || row.s === site), [snapshot, site])

  if (loading) {
    return <main className="gsca-shell gsca-state"><RefreshCw className="gsca-spin" size={28} /><strong>Özel panel açılıyor…</strong></main>
  }

  if (denied) {
    return (
      <main className="gsca-shell gsca-state">
        <LockKeyhole size={34} />
        <h1>Bu panel için yetkin yok</h1>
        <p>GSC Analyzer yalnızca panel sahibinin hesabına açıktır.</p>
        <Link className="gsca-button" href="/dashboard"><ArrowLeft size={16} /> Dashboard</Link>
      </main>
    )
  }

  if (error || !snapshot) {
    return (
      <main className="gsca-shell gsca-state">
        <Activity size={34} />
        <h1>Panel yüklenemedi</h1>
        <p>{error || 'Henüz veri paketi bulunmuyor.'}</p>
        <button className="gsca-button" onClick={() => loadSnapshot()}><RefreshCw size={16} /> Tekrar dene</button>
      </main>
    )
  }

  const color = site === 'all' ? '#ffb11b' : SITE_COLORS[site]

  return (
    <main className="gsca-shell">
      <header className="gsca-header">
        <div>
          <Link href="/dashboard" className="gsca-back"><ArrowLeft size={16} /> Tooldur</Link>
          <div className="gsca-title-row"><span className="gsca-logo"><BarChart3 size={19} /></span><div><h1>GSC Analyzer</h1><p>4 sitenin arama ve trafik merkezi</p></div></div>
        </div>
        <button className="gsca-refresh" onClick={() => loadSnapshot(true)} disabled={refreshing} aria-label="Paneli yenile">
          <RefreshCw className={refreshing ? 'gsca-spin' : ''} size={18} />
        </button>
      </header>

      <section className="gsca-filters">
        <div className="gsca-site-chips">
          <button className={site === 'all' ? 'active' : ''} onClick={() => setSite('all')}>Tümü</button>
          {SITE_ORDER.map((name) => <button key={name} className={site === name ? 'active' : ''} style={{ '--site-color': SITE_COLORS[name] } as any} onClick={() => setSite(name)}>{name}</button>)}
        </div>
        <div className="gsca-range">
          {(Object.keys(RANGE_LABELS) as RangeKey[]).map((key) => <button key={key} className={range === key ? 'active' : ''} onClick={() => setRange(key)}>{RANGE_LABELS[key]}</button>)}
        </div>
      </section>

      <section className="gsca-status-line">
        <span><span className="gsca-live-dot" /> Özel ve güncel</span>
        <span>Veri: {formatDate(capturedAt)}</span>
      </section>

      {tab === 'overview' && (
        <>
          <section className="gsca-metrics">
            <MetricCard label="Gösterim" value={number(gsc.current.impressions)} icon={Eye} current={gsc.current.impressions} previous={gsc.previous?.impressions} />
            <MetricCard label="Tıklama" value={number(gsc.current.clicks)} icon={MousePointerClick} current={gsc.current.clicks} previous={gsc.previous?.clicks} />
            <MetricCard label="CTR" value={percent(gsc.current.ctr, 1)} icon={Gauge} hint="Arama tıklama oranı" />
            <MetricCard label="Ort. konum" value={number(gsc.current.position, 1)} icon={BarChart3} current={gsc.current.position} previous={gsc.previous?.position} inverse />
            <MetricCard label="GA4 kullanıcı" value={number(ga4.users)} icon={Users} current={ga4.users} previous={ga4.previousUsers} />
            <MetricCard label="Oturum" value={number(ga4.sessions)} icon={Activity} current={ga4.sessions} previous={ga4.previousSessions} />
            <MetricCard label="Görüntüleme" value={number(ga4.views)} icon={FileText} current={ga4.views} previous={ga4.previousViews} />
            <MetricCard label="Organik oturum" value={number(organic)} icon={Search} hint={`Etkileşim ${percent(ga4.engagement)}`} />
          </section>

          <section className="gsca-panel gsca-chart-panel">
            <div className="gsca-section-head"><div><span>ARAMA GÖRÜNÜRLÜĞÜ</span><h2>Son 14 günün gösterimleri</h2></div><strong style={{ color }}>{number(series.reduce((sum, row) => sum + row.i, 0))}</strong></div>
            <Sparkline rows={series} color={color} />
          </section>

          <section className="gsca-panel">
            <div className="gsca-section-head"><div><span>BUGÜN NE YAPMALI?</span><h2>Öncelikli aksiyonlar</h2></div><Sparkles size={20} /></div>
            <div className="gsca-action-list">
              {(snapshot.actions || []).filter((item: any) => site === 'all' || item.site === site).slice(0, 6).map((item: any, index: number) => (
                <a href={item.page} target="_blank" rel="noreferrer" key={`${item.page}-${index}`} className="gsca-action">
                  <span className="gsca-action-rank">{index + 1}</span>
                  <div><strong>{item.site} · {item.title}</strong><p>{item.text}</p><small>{shortPath(item.page)}</small></div>
                  <ExternalLink size={15} />
                </a>
              ))}
            </div>
          </section>

          <section className="gsca-site-grid">
            {SITE_ORDER.map((name) => {
              const stats = snapshot.siteStats?.[name]
              const analytics = snapshot.ga4Comparison?.[name]?.current || {}
              const period = stats?.[range] || {}
              return (
                <button key={name} className="gsca-site-card" onClick={() => setSite(name)} style={{ '--site-color': SITE_COLORS[name] } as any}>
                  <div className="gsca-site-card-head"><span>{name.slice(0, 1)}</span><strong>{name}</strong><ExternalLink size={14} /></div>
                  <div className="gsca-site-kpis"><div><small>Gösterim</small><b>{number(period.impressions)}</b></div><div><small>Konum</small><b>{number(period.position, 1)}</b></div><div><small>Oturum</small><b>{number(analytics.sessions)}</b></div></div>
                </button>
              )
            })}
          </section>
        </>
      )}

      {tab === 'opportunities' && (
        <section className="gsca-panel">
          <div className="gsca-section-head"><div><span>GELİR POTANSİYELİ</span><h2>Gösterim var, tıklama yok</h2></div><strong>{opportunities.length}</strong></div>
          <div className="gsca-card-list">
            {opportunities.map((item: any, index: number) => (
              <a className="gsca-row-card" href={item.page} target="_blank" rel="noreferrer" key={`${item.page}-${index}`}>
                <div className="gsca-row-top"><span className="gsca-site-pill" style={{ '--site-color': SITE_COLORS[item.site as Site] } as any}>{item.site}</span><span>#{index + 1}</span></div>
                <strong>{shortPath(item.page)}</strong>
                <div className="gsca-row-kpis"><span><b>{number(item.impressions)}</b> gösterim</span><span><b>{number(item.position, 1)}</b> konum</span><span><b>{percent(item.ctr)}</b> CTR</span></div>
                <p>Başlık/açıklama ve ilk paragraf CTR açısından incelenmeli.</p>
              </a>
            ))}
          </div>
        </section>
      )}

      {tab === 'pages' && (
        <section className="gsca-panel">
          <div className="gsca-section-head"><div><span>SAYFA PERFORMANSI</span><h2>Son 7 gün karşılaştırması</h2></div><FileText size={20} /></div>
          <div className="gsca-card-list">
            {pages.sort((a, b) => Number(b.current?.impressions || 0) - Number(a.current?.impressions || 0)).map((item: any, index: number) => (
              <a className="gsca-row-card" href={item.page} target="_blank" rel="noreferrer" key={`${item.site}-${item.page}-${index}`}>
                <div className="gsca-row-top"><span className="gsca-site-pill" style={{ '--site-color': SITE_COLORS[item.site as Site] } as any}>{item.site}</span><span className={item.impressionDelta >= 0 ? 'gsca-up' : 'gsca-down'}>{signed(item.impressionDelta)} gösterim</span></div>
                <strong>{shortPath(item.page)}</strong>
                <div className="gsca-row-kpis"><span><b>{number(item.current?.impressions)}</b> gösterim</span><span><b>{number(item.current?.clicks)}</b> tık</span><span><b>{number(item.current?.position, 1)}</b> konum</span></div>
              </a>
            ))}
          </div>
        </section>
      )}

      {tab === 'queries' && (
        <section className="gsca-panel">
          <div className="gsca-section-head"><div><span>ARAMA SORGULARI</span><h2>En çok gösterim alan sorgular</h2></div><Search size={20} /></div>
          <div className="gsca-card-list">
            {queries.sort((a, b) => Number(b.i || 0) - Number(a.i || 0)).map((item: any, index: number) => (
              <article className="gsca-row-card" key={`${item.site}-${item.q}-${index}`}>
                <div className="gsca-row-top"><span className="gsca-site-pill" style={{ '--site-color': SITE_COLORS[item.site as Site] } as any}>{item.site}</span><span>#{index + 1}</span></div>
                <strong>{item.q || '(sorgu bilgisi yok)'}</strong>
                <div className="gsca-row-kpis"><span><b>{number(item.i)}</b> gösterim</span><span><b>{number(item.c)}</b> tık</span><span><b>{number(item.o, 1)}</b> konum</span></div>
              </article>
            ))}
          </div>
        </section>
      )}

      {tab === 'ga4' && (
        <>
          <section className="gsca-metrics gsca-ga4-metrics">
            <MetricCard label="Kullanıcı" value={number(ga4.users)} icon={Users} current={ga4.users} previous={ga4.previousUsers} />
            <MetricCard label="Oturum" value={number(ga4.sessions)} icon={Activity} current={ga4.sessions} previous={ga4.previousSessions} />
            <MetricCard label="Görüntüleme" value={number(ga4.views)} icon={Eye} current={ga4.views} previous={ga4.previousViews} />
            <MetricCard label="Etkileşim" value={percent(ga4.engagement)} icon={Gauge} hint="Oturum ağırlıklı" />
          </section>
          <section className="gsca-panel">
            <div className="gsca-section-head"><div><span>TRAFİK KANALLARI</span><h2>Kaynak performansı</h2></div><Activity size={20} /></div>
            <div className="gsca-source-grid">
              {ga4Sources.map((row: any, index: number) => <article key={`${row.s}-${row.channel}-${index}`}><span>{row.s}</span><strong>{row.channel}</strong><div><b>{number(row.sessions)}</b> oturum · {percent(row.engagement)} etkileşim</div></article>)}
            </div>
          </section>
          <section className="gsca-panel">
            <div className="gsca-section-head"><div><span>LANDING PAGE</span><h2>En çok görüntülenen sayfalar</h2></div><FileText size={20} /></div>
            <div className="gsca-card-list">
              {ga4Pages.sort((a, b) => Number(b.views || 0) - Number(a.views || 0)).map((row: any, index: number) => (
                <article className="gsca-row-card" key={`${row.site}-${row.p}-${index}`}>
                  <div className="gsca-row-top"><span className="gsca-site-pill" style={{ '--site-color': SITE_COLORS[row.site as Site] } as any}>{row.site}</span><span>#{index + 1}</span></div>
                  <strong>{row.p}</strong>
                  <div className="gsca-row-kpis"><span><b>{number(row.views)}</b> görüntüleme</span><span><b>{number(row.sessions)}</b> oturum</span><span><b>{percent(row.engagement)}</b> etkileşim</span></div>
                </article>
              ))}
            </div>
          </section>
          <p className="gsca-note">GA4 karşılaştırmaları günlük trafik toplamı değil, panelde saklanan kayan 28 günlük özetlerin karşılaştırmasıdır.</p>
        </>
      )}

      <div className="gsca-bottom-space" />
      <nav className="gsca-bottom-nav" aria-label="Panel bölümleri">
        {TABS.map(({ id, label, icon: Icon }) => <button key={id} className={tab === id ? 'active' : ''} onClick={() => { setTab(id); window.scrollTo({ top: 0, behavior: 'smooth' }) }}><Icon size={19} /><span>{label}</span></button>)}
      </nav>
    </main>
  )
}
