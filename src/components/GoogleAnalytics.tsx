'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

const MEASUREMENT_ID = 'G-J5SC4H2SQE'

const SENSITIVE_QUERY_KEYS = new Set([
  'access_token',
  'refresh_token',
  'id_token',
  'token',
  'code',
  'provider_token',
  'provider_refresh_token',
])

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

function ensureAnalytics() {
  window.dataLayer = window.dataLayer || []
  window.gtag = window.gtag || function gtag(...args: unknown[]) {
    window.dataLayer?.push(args)
  }

  if (!document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}"]`)) {
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`
    document.head.appendChild(script)
  }

  window.gtag('js', new Date())
  window.gtag('config', MEASUREMENT_ID, {
    send_page_view: false,
    anonymize_ip: true,
  })
}

function getSafeAnalyticsUrl() {
  const url = new URL(window.location.href)

  // URL fragments can contain Supabase/OAuth access and refresh tokens.
  // Fragments are never needed for analytics attribution, so never send them.
  url.hash = ''

  // Auth callbacks may also use sensitive query parameters (PKCE/OAuth code).
  // Never persist any callback query string in analytics.
  if (url.pathname === '/auth/callback') {
    url.search = ''
  } else {
    for (const key of Array.from(url.searchParams.keys())) {
      if (SENSITIVE_QUERY_KEYS.has(key.toLowerCase())) {
        url.searchParams.delete(key)
      }
    }
  }

  return {
    location: `${url.origin}${url.pathname}${url.search}`,
    path: `${url.pathname}${url.search}`,
  }
}

function sendPageView() {
  const safeUrl = getSafeAnalyticsUrl()

  window.gtag?.('event', 'page_view', {
    page_title: document.title,
    page_location: safeUrl.location,
    page_path: safeUrl.path,
  })
}

export default function GoogleAnalytics() {
  const pathname = usePathname()
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      ensureAnalytics()
      initialized.current = true
    }

    const timer = window.setTimeout(sendPageView, 250)
    return () => window.clearTimeout(timer)
  }, [pathname])

  return null
}
