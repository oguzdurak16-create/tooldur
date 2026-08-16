import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SITES = {
  Tooldur: { url: 'https://www.tooldur.com', repo: 'oguzdurak16-create/tooldur' },
  Hesaplas: { url: 'https://www.hesaplas.com', repo: 'oguzdurak16-create/hesaplas' },
  Troublio: { url: 'https://www.troublio.com', repo: 'oguzdurak16-create/troubliox' },
  Odyomuh: { url: 'https://www.odyomuh.net', repo: 'oguzdurak16-create/odyomuh' },
} as const

async function probe(url: string) {
  const started = Date.now()
  try {
    const response = await fetch(url, {
      cache: 'no-store',
      redirect: 'follow',
      headers: { 'user-agent': 'Tooldur-Site-Radar/1.0' },
      signal: AbortSignal.timeout(8000),
    })
    return {
      ok: response.ok,
      status: response.status,
      ms: Date.now() - started,
      finalUrl: response.url,
    }
  } catch (error: any) {
    return { ok: false, status: 0, ms: Date.now() - started, error: error?.message || 'request failed' }
  }
}

async function latestCommit(repo: string) {
  try {
    const response = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=1`, {
      headers: {
        accept: 'application/vnd.github+json',
        'user-agent': 'Tooldur-Site-Radar/1.0',
      },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) return { ok: false, status: response.status }
    const rows = await response.json()
    const row = rows?.[0]
    if (!row) return { ok: false, status: 404 }
    return {
      ok: true,
      sha: String(row.sha || '').slice(0, 7),
      message: String(row.commit?.message || '').split('\n')[0],
      date: row.commit?.committer?.date || row.commit?.author?.date || null,
      url: row.html_url || null,
    }
  } catch (error: any) {
    return { ok: false, status: 0, error: error?.message || 'github failed' }
  }
}

export async function GET() {
  const entries = await Promise.all(
    Object.entries(SITES).map(async ([name, config]) => {
      const [http, robots, sitemap, github] = await Promise.all([
        probe(config.url),
        probe(`${config.url}/robots.txt`),
        probe(`${config.url}/sitemap.xml`),
        latestCommit(config.repo),
      ])
      return [name, { ...config, http, robots, sitemap, github }]
    }),
  )

  return NextResponse.json(
    { checkedAt: new Date().toISOString(), sites: Object.fromEntries(entries) },
    { headers: { 'Cache-Control': 'private, no-store, max-age=0' } },
  )
}
