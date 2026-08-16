'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Activity,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock3,
  Code2,
  ExternalLink,
  Eye,
  FileSearch,
  Gauge,
  GitCommitHorizontal,
  Globe2,
  History,
  ListChecks,
  MousePointerClick,
  RefreshCw,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Users,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Site = 'Tooldur' | 'Hesaplas' | 'Troublio' | 'Odyomuh'
type DeployStatus = 'READY' | 'BUILDING' | 'ERROR' | 'UNKNOWN'

type SeoCommit = { sha: string; message: string; date?: string; url?: string }
type LiveSite = {
  url: string
  repo: string
  http: { ok: boolean; status: number; ms: number; finalUrl?: string; error?: string }
  robots: { ok: boolean; status: number; ms: number; error?: string }
  sitemap: { ok: boolean; status: number; ms: number; error?: string }
  github: { ok: boolean; status?: number; sha?: string; message?: string; date?: string; url?: string; error?: string }
  deploy?: { status: DeployStatus; state?: string; deploymentId?: string }
  seoHistory?: SeoCommit[]
}

type LivePayload = { checkedAt: string; sites: Partial<Record<Site, LiveSite>> }
type ActionItem = { score: number; level: 'critical' | 'high' | 'watch'; site?: Site; title: string; text: string; page?: string }

const SITE_ORDER: Site[] = ['Tooldur', 'Hesaplas', 'Troublio', 'Odyomuh']
const SITE_COLORS: Record<Site, string> = {
  Tooldur: '#f6b90b',
  Hesaplas: '#60a5fa',
  Troublio: '#34d399',
  Odyomuh: '#c084fc',
}

function num(value: unknown, digits = 0) {
  return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(Number(value || 0))
}

function pct(value: unknown, digits = 1) {
  return `${num(Number(value || 0) * 100, digits)}%`
}

function formatDate(value?: string) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

function ageText(value?: string) {
  if (!value) return 'veri yok'
  const hours = Math.max(0, (Date.now() - new Date(value).getTime()) / 3_600_000)
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} dk önce`
  if (hours < 48) return `${Math.round(hours)} sa önce`
  return `${Math.round(hours / 24)} gün önce`
}

function shortPath(url = '') {
  try { return new URL(url).pathname || '/' } catch { return url || '/' }
}

async function decodePayload(payload: any) {
  if (!payload || payload.encoding !== 'gzip-base64') return payload
  const Decoder = (globalThis as any).DecompressionStream
  if (!Decoder) throw new Error('Tarayıcı sıkıştırılmış panel verisini açamıyor.')
  const bytes = Uint8Array.from(atob(payload.data), (c) => c.charCodeAt(0))
  const stream = new Blob([bytes]).stream().pipeThrough(new Decoder('gzip'))
  return JSON.parse(await new Response(stream).text())
}

function change(current: number, previous: number) {
  if (!previous) return current ? 100 : 0
  return ((current - previous) / previous) * 100
}

function Trend({ current, previous, inverse = false }: { current: number; previous: number; inverse?: boolean }) {
  const delta = change(current, previous)
  if (Math.abs(delta) < 0.5) return <span className="sr-trend neutral">≈ aynı</span>
  const good = inverse ? delta < 0 : delta > 0
  return <span className={`sr-trend ${good ? 'good' : 'bad'}`}>{delta > 0 ? '+' : ''}{num(delta, 0)}%</span>
}

function StatusPill({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return <span className={`sr-status-pill ${ok ? 'ok' : 'bad'}`}>{ok ? <CheckCircle2 size={13} /> : <TriangleAlert size={13} />}{children}</span>
}

function DeployPill({ status = 'UNKNOWN', id }: { status?: DeployStatus; id?: string }) {
  const label = status === 'READY' ? 'Vercel READY' : status === 'BUILDING' ? 'Vercel BUILDING' : status === 'ERROR' ? 'Vercel ERROR' : 'Vercel ?'
  return <span className={`sr-deploy-pill ${status.toLowerCase()}`}><Rocket size={13} />{label}{id ? <code>{id.slice(0, 7)}</code> : null}</span>
}

export default function SiteRadarClient() {
  const router = useRouter()
  const [snapshot, setSnapshot] = useState<any>(null)
  const [capturedAt, setCapturedAt] = useState('')
  const [live, setLive] = useState<LivePayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<'all' | Site>('all')

  const loadSnapshot = useCallback(async () => {
    const { data: userData, error: authError } = await supabase.auth.getUser()
    if (authError) throw authError
    const user = userData?.user
    if (!user) {
      router.replace('/giris?redirect=/site-radar')
      return false
    }
    const { data, error: queryError } = await supabase
      .from('gsc_analyzer_snapshots')
      .select('captured_at,payload')
      .eq('owner_id', user.id)
      .maybeSingle()
    if (queryError) throw queryError
    if (!data) throw new Error('Henüz GSC/GA4 snapshot verisi bulunmuyor.')
    setSnapshot(await decodePayload(data.payload))
    setCapturedAt(data.captured_at)
    return true
  }, [router])

  const loadLive = useCallback(async () => {
    const response = await fetch('/api/site-radar/live', { cache: 'no-store' })
    if (!response.ok) throw new Error('Canlı site sağlık verisi alınamadı.')
    setLive(await response.json())
  }, [])

  const refresh = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true)
    setError('')
    try {
      const ok = await loadSnapshot()
      if (ok !== false) await loadLive()
    } catch (reason: any) {
      setError(reason?.message || 'Site Radar yüklenemedi.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [loadSnapshot, loadLive])

  useEffect(() => { refresh() }, [refresh])
  useEffect(() => {
    const timer = window.setInterval(() => loadLive().catch(() => undefined), 60_000)
    return () => window.clearInterval(timer)
  }, [loadLive])

  const visibleSites = useMemo<Site[]>(() => selected === 'all' ? SITE_ORDER : [selected], [selected])

  const aggregate = useMemo(() => {
    const result = {
      impressions: 0, previousImpressions: 0, clicks: 0, previousClicks: 0,
      sessions: 0, previousSessions: 0, views: 0, previousViews: 0, users: 0,
      organic: 0, weightedPosition: 0, positionWeight: 0, engagementWeighted: 0,
    }
    visibleSites.forEach((site) => {
      const gsc = snapshot?.siteStats?.[site]
      const current = gsc?.last7 || {}
      const previous = gsc?.previous7 || {}
      result.impressions += Number(current.impressions || 0)
      result.previousImpressions += Number(previous.impressions || 0)
      result.clicks += Number(current.clicks || 0)
      result.previousClicks += Number(previous.clicks || 0)
      result.weightedPosition += Number(current.position || 0) * Number(current.impressions || 0)
      result.positionWeight += Number(current.impressions || 0)
      const ga = snapshot?.ga4Comparison?.[site]
      result.sessions += Number(ga?.current?.sessions || 0)
      result.previousSessions += Number(ga?.previous?.sessions || 0)
      result.views += Number(ga?.current?.views || 0)
      result.previousViews += Number(ga?.previous?.views || 0)
      result.users += Number(ga?.current?.users || 0)
      result.engagementWeighted += Number(ga?.current?.engagement || 0) * Number(ga?.current?.sessions || 0)
      result.organic += Number(snapshot?.organic?.[site]?.sessions || 0)
    })
    return {
      ...result,
      ctr: result.impressions ? result.clicks / result.impressions : 0,
      position: result.positionWeight ? result.weightedPosition / result.positionWeight : 0,
      engagement: result.sessions ? result.engagementWeighted / result.sessions : 0,
    }
  }, [snapshot, visibleSites])

  const freshHours = capturedAt ? (Date.now() - new Date(capturedAt).getTime()) / 3_600_000 : 999
  const opportunityCount = useMemo(() => (snapshot?.opportunities || []).filter((x: any) => selected === 'all' || x.site === selected).length, [snapshot, selected])
  const healthyCount = SITE_ORDER.filter((name) => {
    const item = live?.sites?.[name]
    return Boolean(item?.http?.ok && item?.robots?.ok && item?.sitemap?.ok)
  }).length
  const deployReadyCount = SITE_ORDER.filter((name) => live?.sites?.[name]?.deploy?.status === 'READY').length

  const seoHistory = useMemo(() => {
    return visibleSites
      .flatMap((site) => (live?.sites?.[site]?.seoHistory || []).map((item) => ({ ...item, site })))
      .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')))
      .slice(0, 14)
  }, [live, visibleSites])

  const actions = useMemo<ActionItem[]>(() => {
    const rows: ActionItem[] = []

    visibleSites.forEach((site) => {
      const health = live?.sites?.[site]
      if (health && (!health.http?.ok || !health.robots?.ok || !health.sitemap?.ok)) {
        rows.push({ score: 100, level: 'critical', site, title: 'Teknik sağlık sorunu', text: 'Site, robots.txt veya sitemap.xml kontrolü başarısız. Önce crawl erişimini düzelt.' })
      }
      if (health?.deploy?.status === 'ERROR') {
        rows.push({ score: 98, level: 'critical', site, title: 'Production deployment hata verdi', text: 'Son GitHub commit’inin Vercel durumu ERROR. Build logu incelenmeli.' })
      } else if (health?.deploy?.status === 'BUILDING') {
        rows.push({ score: 72, level: 'watch', site, title: 'Deployment devam ediyor', text: 'Son commit henüz production READY değil. Yayın tamamlanana kadar sonucu canlı kabul etme.' })
      }
    })

    if (freshHours > 36) {
      rows.push({ score: 90, level: 'high', title: 'GSC/GA4 snapshot gecikmiş', text: `Panel verisi ${ageText(capturedAt)}. Senkronizasyon hattını kontrol et.` })
    }

    ;(snapshot?.actions || [])
      .filter((item: any) => selected === 'all' || item.site === selected)
      .slice(0, 10)
      .forEach((item: any, index: number) => rows.push({
        score: 80 - index,
        level: index < 3 ? 'high' : 'watch',
        site: item.site,
        title: item.title || 'SEO aksiyonu',
        text: item.text || 'GSC/GA4 sinyaline göre sayfayı incele.',
        page: item.page,
      }))

    ;(snapshot?.opportunities || [])
      .filter((item: any) => selected === 'all' || item.site === selected)
      .filter((item: any) => Number(item.impressions || 0) >= 5 && Number(item.position || 99) <= 20)
      .slice(0, 8)
      .forEach((item: any) => {
        const ctr = Number(item.ctr || 0)
        rows.push({
          score: ctr === 0 ? 76 : 64,
          level: ctr === 0 ? 'high' : 'watch',
          site: item.site,
          title: ctr === 0 ? 'Gösterim var, tıklama yok' : 'CTR güçlendirme fırsatı',
          text: `${num(item.impressions)} gösterim · ${num(item.position, 1)} sıra · ${pct(ctr)} CTR. Mevcut sayfanın title/meta ve ilk cevabı incelenmeli.`,
          page: item.page,
        })
      })

    const seen = new Set<string>()
    return rows
      .sort((a, b) => b.score - a.score)
      .filter((item) => {
        const key = `${item.site || 'all'}|${item.page || ''}|${item.title}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .slice(0, 12)
  }, [snapshot, selected, visibleSites, live, freshHours, capturedAt])

  if (loading) {
    return <main className="sr-shell sr-state"><RefreshCw className="sr-spin" size={30} /><strong>Site Radar açılıyor…</strong></main>
  }

  if (error && !snapshot) {
    return <main className="sr-shell sr-state"><TriangleAlert size={32} /><h1>Panel açılamadı</h1><p>{error}</p><button onClick={() => refresh(true)}>Tekrar dene</button></main>
  }

  return (
    <main className="sr-shell">
      <header className="sr-header">
        <div>
          <Link href="/dashboard" className="sr-back"><ArrowLeft size={16} /> Tooldur</Link>
          <div className="sr-title"><span><Activity size={21} /></span><div><h1>Site Radar</h1><p>Tooldur · Hesaplas · Troublio · Odyomuh</p></div></div>
        </div>
        <button className="sr-refresh" onClick={() => refresh(true)} disabled={refreshing}><RefreshCw className={refreshing ? 'sr-spin' : ''} size={18} /> <span>Yenile</span></button>
      </header>

      <section className="sr-livebar">
        <span><i className="sr-dot" /> Canlı sağlık: {live ? formatDate(live.checkedAt) : 'bekleniyor'}</span>
        <span>GSC/GA4: {formatDate(capturedAt)} · {ageText(capturedAt)}</span>
        <span className={freshHours <= 36 ? 'fresh' : 'stale'}>{freshHours <= 36 ? 'Veri güncel' : 'Snapshot gecikmiş'}</span>
      </section>

      {error ? <div className="sr-warning"><TriangleAlert size={16} /> {error}</div> : null}

      <section className="sr-filter">
        <button className={selected === 'all' ? 'active' : ''} onClick={() => setSelected('all')}>Tümü</button>
        {SITE_ORDER.map((name) => <button key={name} className={selected === name ? 'active' : ''} style={{ '--site': SITE_COLORS[name] } as any} onClick={() => setSelected(name)}>{name}</button>)}
      </section>

      <section className="sr-overview-grid">
        <article className="sr-overview-card"><div><ShieldCheck size={18} /><span>Site sağlığı</span></div><strong>{healthyCount}/4</strong><small>HTTP + robots + sitemap</small></article>
        <article className="sr-overview-card"><div><Rocket size={18} /><span>Deploy READY</span></div><strong>{deployReadyCount}/4</strong><small>Son commit Vercel durumu</small></article>
        <article className="sr-overview-card"><div><Eye size={18} /><span>7g gösterim</span></div><strong>{num(aggregate.impressions)}</strong><Trend current={aggregate.impressions} previous={aggregate.previousImpressions} /></article>
        <article className="sr-overview-card"><div><MousePointerClick size={18} /><span>7g tıklama</span></div><strong>{num(aggregate.clicks)}</strong><Trend current={aggregate.clicks} previous={aggregate.previousClicks} /></article>
        <article className="sr-overview-card"><div><Gauge size={18} /><span>CTR</span></div><strong>{pct(aggregate.ctr)}</strong><small>Ort. konum {num(aggregate.position, 1)}</small></article>
        <article className="sr-overview-card"><div><Activity size={18} /><span>GA4 oturum</span></div><strong>{num(aggregate.sessions)}</strong><Trend current={aggregate.sessions} previous={aggregate.previousSessions} /></article>
        <article className="sr-overview-card"><div><Search size={18} /><span>Organik oturum</span></div><strong>{num(aggregate.organic)}</strong><small>Etkileşim {pct(aggregate.engagement)}</small></article>
        <article className="sr-overview-card"><div><Sparkles size={18} /><span>SEO fırsatı</span></div><strong>{num(opportunityCount)}</strong><small>GSC sinyalinden</small></article>
        <article className="sr-overview-card"><div><Users size={18} /><span>Kullanıcı</span></div><strong>{num(aggregate.users)}</strong><small>{num(aggregate.views)} görüntüleme</small></article>
        <article className="sr-overview-card"><div><History size={18} /><span>SEO müdahalesi</span></div><strong>{num(seoHistory.length)}</strong><small>Yakın commit geçmişi</small></article>
      </section>

      <section className="sr-section-head"><div><span>AKILLI AKSİYON MERKEZİ</span><h2>Şu an ne yapmalıyız?</h2></div><span className="sr-engine-label"><Sparkles size={14} /> AI + kural motoru</span></section>
      <section className="sr-action-center">
        {actions.length ? actions.map((item, index) => (
          <article className={`sr-action-item ${item.level}`} key={`${item.site || 'all'}-${item.title}-${item.page || index}`}>
            <span className="sr-action-rank">{index + 1}</span>
            <div className="sr-action-copy">
              <div><span className={`sr-action-level ${item.level}`}>{item.level === 'critical' ? 'ACİL' : item.level === 'high' ? 'ÖNCELİKLİ' : 'İZLE'}</span>{item.site ? <b style={{ color: SITE_COLORS[item.site] }}>{item.site}</b> : null}</div>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </div>
            {item.page ? <a href={item.page} target="_blank" rel="noreferrer" aria-label="Sayfayı aç"><ExternalLink size={16} /></a> : <ListChecks size={17} />}
          </article>
        )) : <div className="sr-empty"><CheckCircle2 size={20} /> Şu an acil veya belirgin aksiyon yok.</div>}
      </section>

      <section className="sr-section-head"><div><span>CANLI DURUM</span><h2>Dört site tek ekranda</h2></div><Link href="/gsc-analyzer">Detaylı GSC/GA4 <ExternalLink size={14} /></Link></section>

      <section className="sr-sites">
        {visibleSites.map((name) => {
          const health = live?.sites?.[name]
          const stats = snapshot?.siteStats?.[name]
          const gsc = stats?.last7 || {}
          const previous = stats?.previous7 || {}
          const ga = snapshot?.ga4Comparison?.[name]?.current || {}
          const organic = snapshot?.organic?.[name]?.sessions || 0
          const opps = (snapshot?.opportunities || []).filter((x: any) => x.site === name)
          const top = opps[0]
          const allHealthy = Boolean(health?.http?.ok && health?.robots?.ok && health?.sitemap?.ok)

          return (
            <article className="sr-site-card" key={name} style={{ '--site': SITE_COLORS[name] } as any}>
              <div className="sr-site-top">
                <div className="sr-site-name"><span>{name.slice(0, 1)}</span><div><h3>{name}</h3><a href={health?.url || '#'} target="_blank" rel="noreferrer">{health?.url?.replace('https://www.', '') || '—'} <ExternalLink size={12} /></a></div></div>
                <span className={`sr-health ${allHealthy ? 'ok' : 'bad'}`}>{allHealthy ? 'SAĞLIKLI' : 'KONTROL'}</span>
              </div>

              <div className="sr-probes">
                <StatusPill ok={Boolean(health?.http?.ok)}>Site {health?.http?.status || '—'} · {health?.http?.ms ?? '—'}ms</StatusPill>
                <StatusPill ok={Boolean(health?.robots?.ok)}>robots</StatusPill>
                <StatusPill ok={Boolean(health?.sitemap?.ok)}>sitemap</StatusPill>
                <DeployPill status={health?.deploy?.status} id={health?.deploy?.deploymentId} />
              </div>

              <div className="sr-kpis">
                <div><small>7g gösterim</small><strong>{num(gsc.impressions)}</strong><Trend current={Number(gsc.impressions || 0)} previous={Number(previous.impressions || 0)} /></div>
                <div><small>7g tıklama</small><strong>{num(gsc.clicks)}</strong><span>{pct(gsc.ctr)}</span></div>
                <div><small>Konum</small><strong>{num(gsc.position, 1)}</strong><Trend current={Number(gsc.position || 0)} previous={Number(previous.position || 0)} inverse /></div>
                <div><small>GA4 oturum</small><strong>{num(ga.sessions)}</strong><span>{num(organic)} organik</span></div>
              </div>

              <div className="sr-github">
                <div><GitCommitHorizontal size={16} /><span>Son GitHub commit</span></div>
                {health?.github?.ok ? <>
                  <a href={health.github.url || '#'} target="_blank" rel="noreferrer"><code>{health.github.sha}</code> {health.github.message}</a>
                  <small><Clock3 size={12} /> {formatDate(health.github.date)}</small>
                </> : <p>GitHub bilgisi alınamadı.</p>}
              </div>

              <div className="sr-opportunity">
                <div><Sparkles size={16} /><span>SEO fırsatı</span><b>{opps.length}</b></div>
                {top ? <a href={top.page} target="_blank" rel="noreferrer"><strong>{shortPath(top.page)}</strong><small>{num(top.impressions)} gösterim · {num(top.position, 1)} sıra · {pct(top.ctr)} CTR</small></a> : <p>Şu an belirgin fırsat yok.</p>}
              </div>
            </article>
          )
        })}
      </section>

      <section className="sr-section-head"><div><span>SEO MÜDAHALE GEÇMİŞİ</span><h2>Yakın zamanda ne değişti?</h2></div><History size={19} /></section>
      <section className="sr-history">
        {seoHistory.length ? seoHistory.map((item, index) => (
          <a className="sr-history-item" href={item.url || '#'} target="_blank" rel="noreferrer" key={`${item.site}-${item.sha}-${index}`}>
            <span className="sr-history-site" style={{ '--site': SITE_COLORS[item.site] } as any}>{item.site}</span>
            <code>{item.sha}</code>
            <strong>{item.message}</strong>
            <time>{formatDate(item.date)}</time>
            <ExternalLink size={14} />
          </a>
        )) : <div className="sr-empty">Yakın commitlerde SEO etiketli müdahale bulunamadı.</div>}
      </section>

      <section className="sr-info-grid">
        <article><Globe2 size={19} /><div><strong>Canlı site sağlığı</strong><p>HTTP, robots.txt ve sitemap.xml her 60 saniyede yeniden kontrol edilir.</p></div></article>
        <article><Rocket size={19} /><div><strong>Vercel</strong><p>Son GitHub commit’inin Vercel status sinyali READY, BUILDING veya ERROR olarak izlenir.</p></div></article>
        <article><Code2 size={19} /><div><strong>GitHub</strong><p>Son commit ve SEO müdahale geçmişi public repo API’sinden, güvenli cache ile alınır.</p></div></article>
        <article><BarChart3 size={19} /><div><strong>GSC / GA4</strong><p>Supabase’teki en son analiz snapshot’ı kullanılır; Google’ın veri gecikmesi gizlenmez.</p></div></article>
        <article><FileSearch size={19} /><div><strong>SEO radar</strong><p>Mevcut GSC fırsatları, sayfa performansı ve organik trafik aynı kartta görünür.</p></div></article>
        <article><ListChecks size={19} /><div><strong>Aksiyon motoru</strong><p>Teknik sağlık, deploy, GSC fırsatı ve mevcut otomasyon aksiyonlarını tek öncelik listesinde birleştirir.</p></div></article>
      </section>

      <footer className="sr-footer"><span>Site Radar v2</span><span>Sağlık + Vercel + GSC/GA4 + GitHub + SEO geçmişi</span></footer>
    </main>
  )
}
