'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Site = 'Tooldur' | 'Hesaplas' | 'Troublio' | 'Odyomuh'

type GscRow = {
  keys?: string[]
  clicks?: number
  impressions?: number
  ctr?: number
  position?: number
}

type Metric = {
  clicks: number
  impressions: number
  ctr: number
  position: number
}

const SITE_ORDER: Site[] = ['Tooldur', 'Hesaplas', 'Troublio', 'Odyomuh']
const SITE_DOMAINS: Record<Site, string> = {
  Tooldur: 'tooldur.com',
  Hesaplas: 'hesaplas.com',
  Troublio: 'troublio.com',
  Odyomuh: 'odyomuh.net',
}

const GSC_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly'
const OAUTH_ATTEMPT_KEY = 'tooldur-gsc-oauth-attempted'
const RETURN_PATH = '/gsc-analyzer?gsc_sync=1'

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function shiftDate(value: string, days: number) {
  const date = new Date(`${value}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return isoDate(date)
}

function metricFromRows(rows: GscRow[], startDate: string, endDate: string): Metric {
  let clicks = 0
  let impressions = 0
  let weightedPosition = 0

  for (const row of rows) {
    const date = row.keys?.[0] || ''
    if (date < startDate || date > endDate) continue
    const rowImpressions = Number(row.impressions || 0)
    clicks += Number(row.clicks || 0)
    impressions += rowImpressions
    weightedPosition += Number(row.position || 0) * rowImpressions
  }

  return {
    clicks,
    impressions,
    ctr: impressions ? clicks / impressions : 0,
    position: impressions ? weightedPosition / impressions : 0,
  }
}

function aggregatePageRows(rows: GscRow[], startDate: string, endDate: string) {
  const pages = new Map<string, { clicks: number; impressions: number; weightedPosition: number }>()

  for (const row of rows) {
    const page = row.keys?.[0] || ''
    const date = row.keys?.[1] || ''
    if (!page || date < startDate || date > endDate) continue
    const impressions = Number(row.impressions || 0)
    const current = pages.get(page) || { clicks: 0, impressions: 0, weightedPosition: 0 }
    current.clicks += Number(row.clicks || 0)
    current.impressions += impressions
    current.weightedPosition += Number(row.position || 0) * impressions
    pages.set(page, current)
  }

  return new Map(
    [...pages.entries()].map(([page, value]) => [
      page,
      {
        clicks: value.clicks,
        impressions: value.impressions,
        ctr: value.impressions ? value.clicks / value.impressions : 0,
        position: value.impressions ? value.weightedPosition / value.impressions : 0,
      } satisfies Metric,
    ]),
  )
}

async function decodePayload(payload: any) {
  if (!payload || payload.encoding !== 'gzip-base64') return payload || {}
  const Decoder = (globalThis as any).DecompressionStream
  if (!Decoder) throw new Error('Tarayıcı mevcut sıkıştırılmış snapshot verisini açamıyor.')
  const bytes = Uint8Array.from(atob(payload.data), (character) => character.charCodeAt(0))
  const stream = new Blob([bytes]).stream().pipeThrough(new Decoder('gzip'))
  return JSON.parse(await new Response(stream).text())
}

async function encodePayload(payload: any) {
  const Encoder = (globalThis as any).CompressionStream
  if (!Encoder) return payload

  const stream = new Blob([JSON.stringify(payload)])
    .stream()
    .pipeThrough(new Encoder('gzip'))
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer())

  let binary = ''
  const chunkSize = 0x8000
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize))
  }

  return { encoding: 'gzip-base64', data: btoa(binary) }
}

async function googleRequest(url: string, token: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  })

  if (!response.ok) {
    let detail = ''
    try {
      const body = await response.json()
      detail = body?.error?.message || ''
    } catch {
      detail = await response.text().catch(() => '')
    }
    const error = new Error(detail || `Google Search Console isteği başarısız (${response.status}).`) as Error & { status?: number }
    error.status = response.status
    throw error
  }

  return response.json()
}

async function listProperties(token: string) {
  const body = await googleRequest('https://www.googleapis.com/webmasters/v3/sites', token)
  return (body?.siteEntry || []) as Array<{ siteUrl: string; permissionLevel?: string }>
}

function propertyForDomain(
  entries: Array<{ siteUrl: string; permissionLevel?: string }>,
  domain: string,
) {
  const target = domain.toLowerCase().replace(/^www\./, '')
  const candidates = entries
    .filter((entry) => entry.permissionLevel !== 'siteUnverifiedUser')
    .map((entry) => {
      const siteUrl = String(entry.siteUrl || '')
      let host = ''
      if (siteUrl.startsWith('sc-domain:')) {
        host = siteUrl.slice('sc-domain:'.length)
      } else {
        try {
          host = new URL(siteUrl).hostname
        } catch {
          host = ''
        }
      }
      host = host.toLowerCase().replace(/^www\./, '')
      const score = host === target
        ? siteUrl === `sc-domain:${target}` ? 3 : siteUrl.startsWith('https://') ? 2 : 1
        : 0
      return { ...entry, score }
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)

  return candidates[0]?.siteUrl || ''
}

async function searchAnalytics(
  token: string,
  property: string,
  body: {
    startDate: string
    endDate: string
    dimensions?: string[]
    rowLimit?: number
  },
) {
  return googleRequest(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property)}/searchAnalytics/query`,
    token,
    {
      method: 'POST',
      body: JSON.stringify({
        ...body,
        type: 'web',
        dataState: 'all',
      }),
    },
  )
}

async function buildSiteGsc(token: string, property: string) {
  const today = isoDate(new Date())
  const discoveryStart = shiftDate(today, -40)
  const dateData = await searchAnalytics(token, property, {
    startDate: discoveryStart,
    endDate: today,
    dimensions: ['date'],
    rowLimit: 1000,
  })

  const dateRows = (dateData?.rows || []) as GscRow[]
  const availableDates = dateRows
    .map((row) => row.keys?.[0] || '')
    .filter(Boolean)
    .sort()
  const latestDate = availableDates.at(-1)
  if (!latestDate) throw new Error('Search Console bu mülk için son 40 günde veri döndürmedi.')

  const previousDate = shiftDate(latestDate, -1)
  const last7Start = shiftDate(latestDate, -6)
  const previous7Start = shiftDate(latestDate, -13)
  const previous7End = shiftDate(latestDate, -7)
  const last28Start = shiftDate(latestDate, -27)
  const last14Start = shiftDate(latestDate, -13)

  const [pageData, queryData] = await Promise.all([
    searchAnalytics(token, property, {
      startDate: last28Start,
      endDate: latestDate,
      dimensions: ['page', 'date'],
      rowLimit: 25000,
    }),
    searchAnalytics(token, property, {
      startDate: last7Start,
      endDate: latestDate,
      dimensions: ['query'],
      rowLimit: 500,
    }),
  ])

  const pageRows = (pageData?.rows || []) as GscRow[]
  const currentPages = aggregatePageRows(pageRows, last7Start, latestDate)
  const previousPages = aggregatePageRows(pageRows, previous7Start, previous7End)
  const last28Pages = aggregatePageRows(pageRows, last28Start, latestDate)

  const pageStats = [...new Set([...currentPages.keys(), ...previousPages.keys()])]
    .map((page) => {
      const current = currentPages.get(page) || { clicks: 0, impressions: 0, ctr: 0, position: 0 }
      const previous = previousPages.get(page) || { clicks: 0, impressions: 0, ctr: 0, position: 0 }
      return {
        page,
        current,
        previous,
        impressionDelta: current.impressions - previous.impressions,
      }
    })
    .sort((a, b) => b.current.impressions - a.current.impressions)
    .slice(0, 100)

  const opportunities = [...last28Pages.entries()]
    .map(([page, metric]) => ({
      page,
      impressions: metric.impressions,
      clicks: metric.clicks,
      ctr: metric.ctr,
      position: metric.position,
      score: metric.impressions * Math.max(0, 0.06 - metric.ctr),
    }))
    .filter((item) => item.impressions >= 20 && item.position <= 20 && item.ctr < 0.06)
    .sort((a, b) => b.score - a.score)
    .slice(0, 30)
    .map(({ score: _score, ...item }) => item)

  const queries = ((queryData?.rows || []) as GscRow[])
    .map((row) => ({
      q: row.keys?.[0] || '',
      i: Number(row.impressions || 0),
      c: Number(row.clicks || 0),
      o: Number(row.position || 0),
    }))
    .filter((row) => row.q)
    .sort((a, b) => b.i - a.i)
    .slice(0, 100)

  const dailySeries = dateRows
    .filter((row) => {
      const date = row.keys?.[0] || ''
      return date >= last14Start && date <= latestDate
    })
    .map((row) => ({
      d: row.keys?.[0],
      i: Number(row.impressions || 0),
      c: Number(row.clicks || 0),
    }))
    .sort((a, b) => String(a.d).localeCompare(String(b.d)))

  return {
    latestDate,
    firstIncompleteDate: dateData?.metadata?.first_incomplete_date || null,
    siteStats: {
      latest: metricFromRows(dateRows, latestDate, latestDate),
      previous: metricFromRows(dateRows, previousDate, previousDate),
      last7: metricFromRows(dateRows, last7Start, latestDate),
      previous7: metricFromRows(dateRows, previous7Start, previous7End),
      last28: metricFromRows(dateRows, last28Start, latestDate),
    },
    dailySeries,
    pageStats,
    queries,
    opportunities,
  }
}

async function beginGoogleConsent() {
  window.localStorage.setItem('tooldur-auth-redirect', RETURN_PATH)
  window.sessionStorage.setItem(OAUTH_ATTEMPT_KEY, '1')
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      scopes: GSC_SCOPE,
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent select_account',
      },
    },
  })
  if (error) throw error
}

export default function GscLiveSync() {
  const [header, setHeader] = useState<Element | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const style = document.createElement('style')
    style.dataset.gscLiveSync = '1'
    style.textContent = '.gsca-header > .gsca-refresh:not(.gsca-live-refresh){display:none!important}.gsca-sync-toast{position:fixed;z-index:9999;left:50%;top:16px;transform:translateX(-50%);max-width:min(92vw,520px);padding:10px 14px;border-radius:10px;background:#111827;color:#e5e7eb;border:1px solid rgba(255,177,27,.35);box-shadow:0 16px 48px rgba(0,0,0,.35);font:600 12px/1.45 system-ui,sans-serif}'
    document.head.appendChild(style)

    const findHeader = () => setHeader(document.querySelector('.gsca-header'))
    findHeader()
    const observer = new MutationObserver(findHeader)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      style.remove()
    }
  }, [])

  const syncNow = useCallback(async (fromOAuthReturn = false) => {
    if (syncing) return
    setSyncing(true)
    setMessage('Google Search Console canlı verisi alınıyor…')

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      const session = sessionData?.session
      if (!session?.user) throw new Error('Oturum bulunamadı. Yeniden giriş yapın.')

      const providerToken = session.provider_token
      if (!providerToken) {
        await beginGoogleConsent()
        return
      }

      let properties: Array<{ siteUrl: string; permissionLevel?: string }>
      try {
        properties = await listProperties(providerToken)
      } catch (error: any) {
        const alreadyAttempted = window.sessionStorage.getItem(OAUTH_ATTEMPT_KEY) === '1'
        if ((error?.status === 401 || error?.status === 403) && !alreadyAttempted) {
          await beginGoogleConsent()
          return
        }
        throw error
      }

      const { data: stored, error: readError } = await supabase
        .from('gsc_analyzer_snapshots')
        .select('payload')
        .eq('owner_id', session.user.id)
        .maybeSingle()
      if (readError) throw readError

      const snapshot = await decodePayload(stored?.payload)
      const next = { ...(snapshot || {}) }
      next.siteStats = { ...(next.siteStats || {}) }
      next.dailySeries = { ...(next.dailySeries || {}) }
      next.pageStats = { ...(next.pageStats || {}) }
      next.queries = { ...(next.queries || {}) }
      next.gscLatestBySite = { ...(next.gscLatestBySite || {}) }
      next.gscIncompleteFrom = { ...(next.gscIncompleteFrom || {}) }
      next.gscSyncErrors = {}

      const allOpportunities: any[] = []
      const allActions: any[] = []

      for (const site of SITE_ORDER) {
        const property = propertyForDomain(properties, SITE_DOMAINS[site])
        if (!property) {
          next.gscSyncErrors[site] = `Search Console mülkü bulunamadı: ${SITE_DOMAINS[site]}`
          continue
        }

        try {
          setMessage(`${site} canlı GSC verisi alınıyor…`)
          const result = await buildSiteGsc(providerToken, property)
          next.siteStats[site] = result.siteStats
          next.dailySeries[site] = result.dailySeries
          next.pageStats[site] = result.pageStats
          next.queries[site] = result.queries
          next.gscLatestBySite[site] = result.latestDate
          next.gscIncompleteFrom[site] = result.firstIncompleteDate

          for (const item of result.opportunities) {
            allOpportunities.push({ site, ...item })
          }
          for (const item of result.opportunities.slice(0, 2)) {
            allActions.push({
              site,
              page: item.page,
              title: 'CTR fırsatı',
              text: `${Math.round(item.impressions)} gösterim · ${(item.ctr * 100).toFixed(1)}% CTR · ${item.position.toFixed(1)} ort. konum`,
            })
          }
        } catch (error: any) {
          next.gscSyncErrors[site] = error?.message || 'GSC verisi alınamadı.'
        }
      }

      if (!Object.keys(next.gscLatestBySite || {}).length) {
        throw new Error('Hiçbir Search Console mülkünden veri alınamadı.')
      }

      next.opportunities = allOpportunities
        .sort((a, b) => Number(b.impressions || 0) - Number(a.impressions || 0))
        .slice(0, 80)
      next.actions = allActions
        .sort((a, b) => Number(b.impressions || 0) - Number(a.impressions || 0))
        .slice(0, 12)
      next.gscSyncedAt = new Date().toISOString()
      next.gscSyncSource = 'google-search-console-api'

      setMessage('Snapshot kaydediliyor…')
      const payload = await encodePayload(next)
      const { error: writeError } = await supabase
        .from('gsc_analyzer_snapshots')
        .upsert(
          {
            owner_id: session.user.id,
            captured_at: new Date().toISOString(),
            payload,
          },
          { onConflict: 'owner_id' },
        )
      if (writeError) throw writeError

      window.sessionStorage.removeItem(OAUTH_ATTEMPT_KEY)
      setMessage('GSC verisi güncellendi. Panel yenileniyor…')
      if (fromOAuthReturn || new URLSearchParams(window.location.search).has('gsc_sync')) {
        window.history.replaceState(null, '', '/gsc-analyzer')
      }
      window.setTimeout(() => window.location.reload(), 350)
    } catch (error: any) {
      setMessage(error?.message || 'GSC canlı yenileme başarısız.')
      window.setTimeout(() => setMessage(''), 7000)
    } finally {
      setSyncing(false)
    }
  }, [syncing])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('gsc_sync') === '1') syncNow(true)
  }, [syncNow])

  return (
    <>
      {header ? createPortal(
        <button
          className="gsca-refresh gsca-live-refresh"
          onClick={() => syncNow(false)}
          disabled={syncing}
          aria-label="Google Search Console verisini canlı yenile"
          title="Google Search Console verisini canlı yenile"
        >
          <RefreshCw className={syncing ? 'gsca-spin' : ''} size={18} />
        </button>,
        header,
      ) : null}
      {message && typeof document !== 'undefined'
        ? createPortal(<div className="gsca-sync-toast" role="status">{message}</div>, document.body)
        : null}
    </>
  )
}
