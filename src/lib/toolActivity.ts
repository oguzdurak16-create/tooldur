const RECENT_KEY = 'tooldur_recent_tools_v2';
const FAVORITES_KEY = 'tooldur_favorite_tools_v2';
const MAX_RECENT = 10;

function readArray(key: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function writeArray(key: string, value: string[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent('tooldur:tool-activity'));
}

export function getRecentToolSlugs() {
  return readArray(RECENT_KEY);
}

export function getFavoriteToolSlugs() {
  return readArray(FAVORITES_KEY);
}

export function recordToolVisit(slug: string) {
  if (!slug || typeof window === 'undefined') return;
  const next = [slug, ...getRecentToolSlugs().filter((item) => item !== slug)].slice(0, MAX_RECENT);
  writeArray(RECENT_KEY, next);
}

export function isFavoriteTool(slug: string) {
  return getFavoriteToolSlugs().includes(slug);
}

export function toggleFavoriteTool(slug: string) {
  const current = getFavoriteToolSlugs();
  const next = current.includes(slug)
    ? current.filter((item) => item !== slug)
    : [slug, ...current].slice(0, 30);
  writeArray(FAVORITES_KEY, next);
  return next.includes(slug);
}
