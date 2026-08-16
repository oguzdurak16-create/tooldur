import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SITES = {
  Tooldur: { url: 'https://www.tooldur.com', repo: 'oguzdurak16-create/tooldur' },
  Hesaplas: { url: 'https://www.hesaplas.com', repo: 'oguzdurak16-create/hesaplas' },
  Troublio: { url: 'https://www.troublio.com', repo: 'oguzdurak16-create/troubliox' },
  Odyomuh: { url: 'https://www.odyomuh.net', repo: 'oguzdurak16-create/odyomuh' },
} as const

const SEO_PATTERN = /(seo|gsc|search console|ctr|metadata|meta\b|title|description|sitemap|robots|index|canonical|schema|structured data|internal link|dahili link|search intent|organic)/i
const GITHUB_REVALIDATE_SECONDS = 600

async function probe(url: string) {
  const started = Date.now()
  try {
    const response = await fetch(url, {
      cache: 'no-store',
      redirect: 'follow',
      headers: { 'user-agent': 'Tooldur-Site-Radar/2.0' },
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

async function githubJson(url: string) {
  const response = await fetch(url, {
    headers: {
      accept: 'application/vnd.github+json',
      'user-agent': 'Tooldur-Site-Radar/2.0',
    },
    next: { revalidate: GITHUB_REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) throw new Error(`GitHub ${response.status}`)
  return response.json()
}

function commitInfo(row: any) {
  return {
    sha: String(row?.sha || '').slice(0, 7),
    fullSha: String(row?.sha || ''),
    message: String(row?.commit?.message || '').split('\n')[0],
    date: row?.commit?.committer?.date || row?.commit?.author?.date || null,
    url: row?.html_url || null,
  }
}

async function githubBundle(repo: string) {
  try {
    const rows = await githubJson(`https://api.github.com/repos/${repo}/commits?per_page=20`)
    const latest = rows?.[0]
    if (!latest) return { github: { ok: false, status: 404 }, deploy: { status: 'UNKNOWN' }, seoHistory: [] }

    const latestInfo = commitInfo(latest)
    let deploy: any = { status: 'UNKNOWN' }

    try {
      const statusPayload = await githubJson(`https://api.github.com/repos/${repo}/commits/${latestInfo.fullSha}/status`)
      const vercel = (statusPayload?.statuses || []).find((item: any) => String(item?.context || '').toLowerCase().includes('vercel'))
      const state = String(vercel?.state || statusPayload?.state || '').toLowerCase()
      const targetUrl = vercel?.target_url || null
      const deploymentId = targetUrl ? String(targetUrl).split('/').filter(Boolean).pop() : null
      const mapped = state === 'success'
        ? 'READY'
        : state === 'pending'
          ? 'BUILDING'
          : state === 'failure' || state === 'error'
            ? 'ERROR'
            : 'UNKNOWN'
      deploy = { status: mapped, state: state || null, deploymentId }
    } catch {
      deploy = { status: 'UNKNOWN' }
    }

    const seoHistory = (rows || [])
      .map(commitInfo)
      .filter((item: any) => SEO_PATTERN.test(item.message))
      .slice(0, 6)
      .map(({ fullSha, ...item }: any) => item)

    const { fullSha, ...publicLatest } = latestInfo
    return {
      github: { ok: true, ...publicLatest },
      deploy,
      seoHistory,
    }
  } catch (error: any) {
    return {
      github: { ok: false, status: 0, error: error?.message || 'github failed' },
      deploy: { status: 'UNKNOWN' },
      seoHistory: [],
    }
  }
}

export async function GET() {
  const entries = await Promise.all(
    Object.entries(SITES).map(async ([name, config]) => {
      const [http, robots, sitemap, git] = await Promise.all([
        probe(config.url),
        probe(`${config.url}/robots.txt`),
        probe(`${config.url}/sitemap.xml`),
        githubBundle(config.repo),
      ])
      return [name, { ...config, http, robots, sitemap, ...git }]
    }),
  )

  return NextResponse.json(
    { checkedAt: new Date().toISOString(), sites: Object.fromEntries(entries) },
    { headers: { 'Cache-Control': 'private, no-store, max-age=0' } },
  )
}
