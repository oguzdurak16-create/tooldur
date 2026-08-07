import { NextResponse } from 'next/server';
export const runtime='nodejs';
export const dynamic='force-dynamic';

const SOURCES={
  women:'https://www.lcw.com/kampanyalar/kadin-urunleri-sepette-yuzde-50-ye-varan-indirimli',
  men:'https://www.lcw.com/kampanyalar/erkek-urunleri-sepette-yuzde-50-ye-varan-indirimli',
  boy:'https://www.lcw.com/erkek-cocuk-giyim-t-200046',
} as const;
const headers={'user-agent':'Mozilla/5.0 AppleWebKit/537.36 Chrome/127 Safari/537.36','accept':'text/html,application/xhtml+xml','accept-language':'tr-TR,tr;q=0.9'};
function snippets(html:string,needle:string){const out:string[]=[];let pos=0;while(out.length<8){const i=html.indexOf(needle,pos);if(i<0)break;out.push(html.slice(Math.max(0,i-500),Math.min(html.length,i+700)));pos=i+needle.length}return out}
export async function GET(){const out:any={};for(const [name,url] of Object.entries(SOURCES)){const r=await fetch(url,{cache:'no-store',headers,redirect:'follow'});const html=await r.text();out[name]={status:r.status,length:html.length,xl:snippets(html,'XL'),lSize:snippets(html,'"L"'),age45:snippets(html,'4-5 Yaş'),filter:snippets(html,'Beden')};}return NextResponse.json(out,{headers:{'Cache-Control':'no-store'}})}
