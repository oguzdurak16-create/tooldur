const SAFE_URL_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

export function sanitizeUrl(url: string): string {
  const trimmed = (url ?? '').trim();
  if (!trimmed) return '#';

  if (trimmed.startsWith('#') || trimmed.startsWith('/')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed, 'https://tooldur.local');
    if (SAFE_URL_PROTOCOLS.has(parsed.protocol)) {
      return trimmed;
    }
  } catch {}

  return '#';
}

export function sanitizeSvgContent(svg: string): string {
  if (!svg) return '';

  return svg
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<foreignObject[\s\S]*?>[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s(?:href|xlink:href)\s*=\s*("|')\s*javascript:[\s\S]*?\1/gi, '')
    .replace(/\s(?:href|xlink:href)\s*=\s*javascript:[^\s>]*/gi, '');
}
