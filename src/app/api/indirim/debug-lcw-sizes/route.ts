import { NextResponse } from 'next/server';
export const runtime='nodejs';
export const dynamic='force-dynamic';

const SOURCES={
  women:'https://www.lcw.com/kampanyalar/kadin-urunleri-sepette-yuzde-50-ye-varan-indirimli',
  men:'https://www.lcw.com/kampanyalar/erkek-urunleri-sepette-yuzde-50-ye-varan-indirimli',
  boy:'https://www.lcw.com/erkek-cocuk-giyim-t-200046',
} as const;
const headers={'user-agent':'Mozilla/5.0 AppleWebKit/537.36 Chrome/127 Safari/537.36','accept':'text/html,application/xhtml+xml','accept-language':'tr-TR,tr;q=0.9'};
function balancedArray(text:string,start:number){let depth=0,inString=false,escaped=false;for(let i=start;i<text.length;i++){const c=text[i];if(inString){if(escaped){escaped=false;continue}if(c==='\\'){escaped=true;continue}if(c==='"')inString=false;continue}if(c==='"'){inString=true;continue}if(c==='[')depth++;else if(c===']'){depth--;if(depth===0)return text.slice(start,i+1)}}return null}
function findItems(html:string){for(const text of [html,html.replace(/\\"/g,'"')]){const marker=text.indexOf('"CatalogList"');if(marker<0)continue;const itemsPos=text.indexOf('"Items"',marker);const start=text.indexOf('[',itemsPos);if(start<0)continue;const raw=balancedArray(text,start);if(!raw)continue;try{const p=JSON.parse(raw);if(Array.isArray(p))return p}catch{}}return[]}
export async function GET(){const out:any={};for(const [name,url] of Object.entries(SOURCES)){const r=await fetch(url,{cache:'no-store',headers,redirect:'follow'});const html=await r.text();const items=findItems(html);out[name]={status:r.status,count:items.length,samples:items.slice(0,3).map((x:any)=>Object.fromEntries(Object.entries(x).filter(([k])=>/size|beden|option|variant|age|yas|stock/i.test(k)).slice(0,40)))};}return NextResponse.json(out,{headers:{'Cache-Control':'no-store'}})}
