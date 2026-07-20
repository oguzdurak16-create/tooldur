export type AnalyticsParams = Record<string, string | number | boolean | undefined>;

export function trackEvent(eventName: string, params: AnalyticsParams = {}) {
  if (typeof window === 'undefined' || !eventName) return;

  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined)
  );

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, cleanParams);
  } else {
    window.dataLayer.push({ event: eventName, ...cleanParams });
  }
}
