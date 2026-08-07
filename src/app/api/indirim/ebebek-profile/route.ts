import { NextResponse } from 'next/server';

export const runtime='nodejs';
export const dynamic='force-dynamic';

const H={'user-agent':'Mozilla/5.0 AppleWebKit/537.36 Chrome/127 Safari/537.36','accept':'text/html,application/xhtml+xml','accept-language':'tr-TR,tr;q=0.9,en;q=0.7','cache-control':'no-cache'};
const LIST='https://www.e-bebek.com/erkek-bebek-giyim-c4996?q=:relevance:allCategories:4996:size:4%20-%205%20Ya%C5%9F';

type Candidate={external_id?:string|null;title:string;url:string;image_url?:string|null;brand?:string|null;current_price?:number|null;original_price?:number|null};

function age4plus(label:string){const s=label.replace(/\s+/g,' ').trim();if(/ay/i.test(s))return false;const m=s.match(/(\d+(?:[.,]\d+)?)\s*(?:-|–|—)?\s*(\d+(?:[.,]\d+)?)?\s*yaş/i);return !!m&&Number(m[1].replace(',','.'))>=4}
function n(v:any){const x=Number(String(v??'').replace(',','.'));return Number.isFinite(x)&&x>0?x:null}
function listingCandidates(html:string){
  const out:Candidate[]=[];const seen=new Set<string>();
  const add=(x:any)=>{if(!x||typeof x!=='object'||out.length>=40)return;const t=x['@type'];if(t==='Product'||(Array.isArray(t)&&t.includes('Product'))){const offer=Array.isArray(x.offers)?x.offers[0]:x.offers||{};const title=String(x.name||'').trim();let url='';try{url=new URL(String(x.url||offer.url||''),'https://www.e-bebek.com').toString()}catch{}const lower=(title+' '+url).toLocaleLowerCase('tr-TR');const current=n(offer.price??offer.lowPrice);const original=n(offer.highPrice);if(title&&url&&current&&lower.includes('erkek')&&!lower.includes('kız')&&!seen.has(url)){seen.add(url);out.push({external_id:x.sku?String(x.sku):null,title,url,image_url:Array.isArray(x.image)?x.image[0]:x.image||null,brand:typeof x.brand==='string'?x.brand:x.brand?.name||'ebebek',current_price:current,original_price:original&&original>current?original:null})}}for(const v of Object.values(x))if(v&&typeof v==='object')walk(v)};
  const walk=(x:any)=>{if(Array.isArray(x)){for(const y of x)add(y)}else add(x)};
  const re=/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;let m:RegExpExecArray|null;while((m=re.exec(html))&&out.length<40){try{walk(JSON.parse(m[1].trim()))}catch{}}
  return out;
}
function liveSizes(html:string){
  const out:{code:string;size:string}[]=[];
  const re=/<input\b[^>]*name=["']size["'][^>]*value=["']([^"']+)["'][^>]*>\s*<label\b([^>]*)>[\s\S]{0,1200}?<span\b[^>]*>\s*([^<]+?)\s*<\/span>/gi;let m:RegExpExecArray|null;
  while((m=re.exec(html))){const attrs=m[2]||'',size=(m[3]||'').replace(/&nbsp;/gi,' ').trim();if(/disabledVariant/i.test(attrs)||!age4plus(size))continue;out.push({code:m[1],size})}
  return out;
}
function liveSellingPrice(html:string,c:Candidate){
  const pos=html.indexOf('"discountedPrice"');if(pos>=0){const block=html.slice(Math.max(0,pos-1200),Math.min(html.length,pos+5000));const currency=(block.match(/"currencyIso":"([^"]+)"/)||[])[1];const p=Number((block.match(/"discountedPrice":\{[^{}]{0,600}?"value":([0-9.]+)/)||[])[1]||0);if(currency==='TRY'&&p>0)return p}
  return n(c.current_price);
}
async function verify(c:Candidate){
  const lower=(c.title+' '+c.url).toLocaleLowerCase('tr-TR');if(!lower.includes('erkek')||lower.includes('kız'))return null;
  const r=await fetch(c.url,{cache:'no-store',redirect:'follow',headers:H});if(!r.ok)return null;const html=await r.text();const sizes=liveSizes(html);if(!sizes.length)return null;const current=liveSellingPrice(html,c);if(!current)return null;const op=n(c.original_price);const original=op&&op>current?op:null;
  return {external_id:c.external_id||sizes[0].code||null,title:c.title,url:c.url,image_url:c.image_url||null,current_price:current,original_price:original,discount_percent:original?Math.round((1-current/original)*10000)/100:0,in_stock:true,brand:c.brand||'ebebek',source:'ebebek-male-4plus-live-stock',profile_verified:true,matched_sizes:[...new Set(sizes.map(s=>s.size))]};
}

export async function GET(){try{
  const lr=await fetch(LIST,{cache:'no-store',redirect:'follow',headers:H});if(!lr.ok)return NextResponse.json({ok:false,error:`ebebek kategori HTTP ${lr.status}`,products:[]},{status:502});const candidates=listingCandidates(await lr.text()).slice(0,24);const products:any[]=[];
  for(let i=0;i<candidates.length;i+=4){const rows=await Promise.all(candidates.slice(i,i+4).map(verify));for(const p of rows)if(p)products.push(p)}
  products.sort((a,b)=>a.current_price-b.current_price);return NextResponse.json({ok:true,profile:'ege',source:'ebebek-male-4plus-live-stock',candidate_count:candidates.length,count:products.length,products,at:new Date().toISOString()},{headers:{'Cache-Control':'no-store'}})
}catch(e:any){return NextResponse.json({ok:false,error:String(e?.message||e),products:[]},{status:500})}}
