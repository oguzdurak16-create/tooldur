'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

const MEASUREMENT_ID = 'G-J5SC4H2SQE'

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

function sendPageView() {
  window.gtag?.('event', 'page_view', {
    page_title: document.title,
    page_location: window.location.href,
    page_path: `${window.location.pathname}${window.location.search}`,
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
