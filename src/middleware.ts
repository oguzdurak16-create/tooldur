import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';

  // Tek kanonik domain: https://www.tooldur.com
  // Domain property içinde non-www URL'ler görülürse Google bunları ayrı kopya olarak sayabilir.
  if (host === 'tooldur.com') {
    const url = request.nextUrl.clone();
    url.hostname = 'www.tooldur.com';
    url.protocol = 'https';
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon-192.png|icon-512.png|apple-touch-icon.png|og-image.png|manifest.json|ads.txt).*)'],
};
