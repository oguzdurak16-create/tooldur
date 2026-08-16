'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FlaskConical,
  GitCommitHorizontal,
  Minus,
  MousePointerClick,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Site = 'Tooldur' | 'Hesaplas' | 'Troublio' | 'Odyomuh'
type Verdict = 'pending' | 'winning' | 'neutral' | 'losing' | 'insufficient_data'

type Metrics = {
  periodStart?: string
  periodEnd?: string
  impressions?: number
  clicks?: number
  ctr?: number
  position?: number
}

type Experiment = {
  id: string
  owner_id: string
  site: Site
  page_url: string
  change_type: string
  summary: string
  commit_sha?: string | null
  deployment_id?: string | null
  started_at: string
  baseline?: Metrics | null
  day7?: Metrics | null
  day14?: Metrics | null
  day28?: Metrics | null
  latest?: Metrics | null
  verdict: Verdict
  status: string
  notes?: string | null
  updated_at: string
}

const SITE_ORDER: Site[] = ['Tooldur', 'Hesaplas', 'Troublio', 'Odyomuh']
const SITE_COLORS: Record<Site, string> = {
  Tooldur: '#f6b90b',
  Hesaplas: '#60a5fa',
  Troublio: '#34d399',
  Odyomuh: '#c084fc',
}
const REPOS: Record<Site, string> = {
  Tooldur: 'oguzdurak16-create/tooldur',
  Hesaplas: 'oguzdurak16-create/hesaplas',
  Troublio: 'oguzdurak16-create/troubliox',
  Odyomuh: 'oguzdurak16-create/odyomuh',
}

function number(value: unknown, digits = 0) {
  return new Intl.NumberFormat('tr-TR', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(Number(value || 0))
}

function pct(value: unknown, digits = 1) {
  return `${number(Number(value || 0) * 100, digits)}%`
}

function shortPath(url = '') {
  try { return new URL(url).pathname || '/' } catch { return url || '/' }
}

function ageDays(value: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000))
}

function formatDate(value?: string) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  }).format(new Date(value))
}

function relative(current: number, baseline: number) {
  if (!baseline) return current ? 100 : 0
  return ((current - baseline) / baseline) * 100
}

function Delta({ current, baseline, inverse = false, percentValue = false }: { current: number; baseline: number; inverse?: boolean; percentValue?: boolean }) {
  const raw = percentValue ? (current - baseline) * 100 : relative(current, baseline)
  if (!Number.isFinite(raw) || Math.abs(raw) < 0.1) return <span className="se-delta neutral"><Minus size={11} /> aynı</span>
  const good = inverse ? raw < 0 : raw > 0
  return <span className={`se-delta ${good ? 'good' : 'bad'}`}>{good ? <TrendingUp size={11} /> : <TrendingDown size={11} />}{raw > 0 ? '+' : ''}{number(raw, percentValue ? 1 : 0)}{percentValue ? ' puan' : '%'}</span>
}

function verdictLabel(verdict: Verdict) {
  if (verdict === 'winning') return 'KAZANDI'
  if (verdict === 'losing') return 'KAYBETTİ'
  if (verdict === 'neutral') return 'NÖTR'
  if (verdict === 'insufficient_data') return 'VERİ YETERSİZ'
  return 'ÖLÇÜLÜYOR'
}

function Checkpoint({ label, metrics }: { label: string; metrics?: Metrics | null }) {
  return (
    <div className={`se-checkpoint ${metrics ? 'filled' : ''}`}>
      <span>{metrics ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}{label}</span>
      {metrics ? <strong>{number(metrics.impressions)} gös. · {number(metrics.clicks)} tık</strong> : <strong>bekleniyor</strong>}
    </div>
  )
}

export default function SeoExperimentsClient() {
  const [rows, setRows] = useState<Experiment[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [site, setSite] = useState<'all' | Site>('all')

  const load = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true)
    setError('')
    try {
      const { data: userData, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError
      const user = userData?.user
      if (!user) return
      const { data, error: queryError } = await supabase
        .from('seo_experiments')
        .select('*')
        .eq('owner_id', user.id)
        .order('started_at', { ascending: false })
        .limit(50)
      if (queryError) throw queryError
      setRows((data || []) as Experiment[])
    } catch (reason: any) {
      setError(reason?.message || 'SEO deneyleri yüklenemedi.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const timer = window.setInterval(() => load().catch(() => undefined), 60_000)
    return () => window.clearInterval(timer)
  }, [load])

  const visible = useMemo(() => rows.filter((row) => site === 'all' || row.site === site), [rows, site])
  const counts = useMemo(() => ({
    measuring: visible.filter((x) => x.verdict === 'pending').length,
    winning: visible.filter((x) => x.verdict === 'winning').length,
    neutral: visible.filter((x) => x.verdict === 'neutral').length,
    losing: visible.filter((x) => x.verdict === 'losing').length,
  }), [visible])

  return (
    <section className="se-shell">
      <div className="se-head">
        <div>
          <span>ÖLÇÜLEBİLİR SEO</span>
          <h2><FlaskConical size={22} /> SEO Deneyleri</h2>
          <p>Her müdahalenin öncesini kaydeder, 7/14/28 gün sonra gerçekten işe yarayıp yaramadığını ölçer.</p>
        </div>
        <button onClick={() => load(true)} disabled={refreshing}><RefreshCw className={refreshing ? 'se-spin' : ''} size={16} /> Yenile</button>
      </div>

      <div className="se-filters">
        <button className={site === 'all' ? 'active' : ''} onClick={() => setSite('all')}>Tümü</button>
        {SITE_ORDER.map((name) => <button key={name} className={site === name ? 'active' : ''} style={{ '--site': SITE_COLORS[name] } as any} onClick={() => setSite(name)}>{name}</button>)}
      </div>

      <div className="se-summary">
        <article><Activity size={17} /><div><small>Ölçülüyor</small><strong>{counts.measuring}</strong></div></article>
        <article className="win"><TrendingUp size={17} /><div><small>Kazandı</small><strong>{counts.winning}</strong></div></article>
        <article><Minus size={17} /><div><small>Nötr</small><strong>{counts.neutral}</strong></div></article>
        <article className="lose"><TrendingDown size={17} /><div><small>Kaybetti</small><strong>{counts.losing}</strong></div></article>
      </div>

      {error ? <div className="se-warning"><TriangleAlert size={15} /> {error}</div> : null}

      {loading ? (
        <div className="se-empty"><RefreshCw className="se-spin" size={22} /><strong>Deneyler yükleniyor…</strong></div>
      ) : visible.length === 0 ? (
        <div className="se-empty">
          <FlaskConical size={30} />
          <strong>Henüz ölçülen SEO deneyi yok</strong>
          <p>Bir sonraki otomatik SEO müdahalesinde değişiklik öncesi 7 günlük baseline kaydedilecek ve deney burada başlayacak.</p>
        </div>
      ) : (
        <div className="se-list">
          {visible.map((row) => {
            const baseline = row.baseline || {}
            const current = row.latest || row.day28 || row.day14 || row.day7 || {}
            const hasComparison = Number(baseline.impressions || 0) > 0 || Number(current.impressions || 0) > 0
            const commitUrl = row.commit_sha ? `https://github.com/${REPOS[row.site]}/commit/${row.commit_sha}` : ''
            return (
              <article className="se-card" key={row.id} style={{ '--site': SITE_COLORS[row.site] } as any}>
                <div className="se-card-top">
                  <div className="se-site"><span>{row.site.slice(0, 1)}</span><div><b>{row.site}</b><small>{ageDays(row.started_at)} gündür ölçülüyor</small></div></div>
                  <span className={`se-verdict ${row.verdict}`}>{verdictLabel(row.verdict)}</span>
                </div>

                <a className="se-page" href={row.page_url} target="_blank" rel="noreferrer"><strong>{shortPath(row.page_url)}</strong><ExternalLink size={13} /></a>
                <p className="se-summary-text">{row.summary}</p>

                <div className="se-metrics">
                  <div><span><Search size={13} /> Gösterim</span><strong>{number(current.impressions)}</strong>{hasComparison ? <Delta current={Number(current.impressions || 0)} baseline={Number(baseline.impressions || 0)} /> : <small>baseline bekleniyor</small>}</div>
                  <div><span><MousePointerClick size={13} /> Tıklama</span><strong>{number(current.clicks)}</strong>{hasComparison ? <Delta current={Number(current.clicks || 0)} baseline={Number(baseline.clicks || 0)} /> : <small>baseline bekleniyor</small>}</div>
                  <div><span><Activity size={13} /> CTR</span><strong>{pct(current.ctr)}</strong>{hasComparison ? <Delta current={Number(current.ctr || 0)} baseline={Number(baseline.ctr || 0)} percentValue /> : <small>baseline bekleniyor</small>}</div>
                  <div><span><BarChart3 size={13} /> Sıra</span><strong>{number(current.position, 1)}</strong>{hasComparison ? <Delta current={Number(current.position || 0)} baseline={Number(baseline.position || 0)} inverse /> : <small>baseline bekleniyor</small>}</div>
                </div>

                <div className="se-baseline">
                  <span>Başlangıç</span>
                  <b>{number(baseline.impressions)} gös. · {number(baseline.clicks)} tık · {pct(baseline.ctr)} CTR · {number(baseline.position, 1)} sıra</b>
                </div>

                <div className="se-checkpoints">
                  <Checkpoint label="7 gün" metrics={row.day7} />
                  <Checkpoint label="14 gün" metrics={row.day14} />
                  <Checkpoint label="28 gün" metrics={row.day28} />
                </div>

                <div className="se-meta">
                  <span><Clock3 size={12} /> {formatDate(row.started_at)}</span>
                  {commitUrl ? <a href={commitUrl} target="_blank" rel="noreferrer"><GitCommitHorizontal size={12} /> {row.commit_sha?.slice(0, 7)}</a> : null}
                  {row.deployment_id ? <span>Deploy {row.deployment_id.slice(0, 10)}</span> : null}
                </div>
              </article>
            )
          })}
        </div>
      )}

      <div className="se-rule">
        <strong>Karar mantığı</strong>
        <p>Yeterli veri olmadan sonuç verilmez. Tıklama/CTR artışı, görünürlük ve sıra birlikte değerlendirilir; tek günlük oynama “başarı” sayılmaz.</p>
      </div>
    </section>
  )
}
