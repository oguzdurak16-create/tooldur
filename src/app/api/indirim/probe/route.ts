import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TARGETS = [
  ['trendyol','https://www.trendyol.com/kadin-giyim-x-g1-c82'],
  ['hm','https://www2.hm.com/tr_tr/ladies/sale/view-all.html'],
  ['zara','https://www.zara.com/tr/tr/kadin-alt-giyim-ezel-fiyatlar-l1059.html'],
  ['lcwaikiki','https://www.lcw.com/kampanyalar/kadin-urunleri-sepette-yuzde-50-ye-varan-indirimli'],
  ['watsons','https://www.watsons.com.tr/makyaj/makyaj-cok-satanlar/c/100070'],
  ['amazon-tr','https://www.amazon.com.tr/b?node=21034466031'],
  ['gratis','https://www.gratis.com/'],
  ['hepsiburada','https://www.hepsiburada.com/'],
] as const;

const headers = {
  'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
  'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'accept-language': 'tr-TR,tr;q=0.9,en-US;q=0.7,en;q=0.6',
  'cache-control': 'no-cache',
  'pragma': 'no-cache',
};

export async function GET() {
  const results = [] as any[];
  for (const [site,url] of TARGETS) {
    try {
      const res = await fetch(url, { cache:'no-store', redirect:'follow', headers });
      const text = await res.text();
      results.push({
        site,
        status: res.status,
        length: text.length,
        hasProduct: /product|price|fiyat|TL|₺/i.test(text),
        hasJsonLd: /application\/ld\+json/i.test(text),
      });
    } catch (e:any) {
      results.push({ site, status: 0, error: String(e?.message || e) });
    }
  }
  return NextResponse.json({ ok:true, results, at:new Date().toISOString() }, { headers:{'Cache-Control':'no-store'} });
}
