import { NextResponse } from 'next/server';

export const runtime='nodejs';
export const dynamic='force-dynamic';

const H={'user-agent':'Mozilla/5.0 AppleWebKit/537.36 Chrome/127 Safari/537.36','accept':'text/html,application/xhtml+xml','accept-language':'tr-TR,tr;q=0.9,en;q=0.7','cache-control':'no-cache'};

type Candidate={external_id?:string|null;title:string;url:string;image_url?:string|null;brand?:string|null};
type Variant={code:string;size:string;stock:number;current:number;original:number|null;url:string};

function normalize(html:string){return html.replace(/\\u002F/g,'/').replace(/\\u0026/g,'&').replace(/\\"/g,'"')}
function age4plus(label:string){const s=label.replace(/\s+/g,' ').trim();if(/ay/i.test(s))return false;const m=s.match(/(\d+(?:[.,]\d+)?)\s*(?:-|–|—)?\s*(\d+(?:[.,]\d+)?)?\s*yaş/i);if(!m)return false;return Number(m[1].replace(',','.'))>=4}
function balancedObject(text:string,start:number){let depth=0,inString=false,escaped=false;for(let i=start;i<text.length;i++){const c=text[i];if(inString){if(escaped){escaped=false;continue}if(c==='\\'){escaped=true;continue}if(c==='"')inString=false;continue}if(c==='"'){inString=true;continue}if(c==='{')depth++;else if(c==='}'){depth--;if(depth===0)return text.slice(start,i+1)}}return null}
function parseVariants(html:string):Variant[]{
  const text=normalize(html);const out:Variant[]=[];const re=/\{"code":"[^"]+","discountRate":/g;let m:RegExpExecArray|null;
  while((m=re.exec(text))){const raw=balancedObject(text,m.index);if(!raw)continue;let o:any;try{o=JSON.parse(raw)}catch{continue}
    const qualifier=(Array.isArray(o?.variantOptionQualifiers)?o.variantOptionQualifiers:[]).find((q:any)=>q?.qualifier==='size'||q?.name==='Size');const size=String(qualifier?.value||'');if(!age4plus(size))continue;
    const stock=Number(o?.stock?.stockLevel||0),status=String(o?.stock?.stockLevelStatus||'');if(stock<=0||status.toLowerCase()!=='instock')continue;
    const current=Number(o?.discountedPrice?.value??o?.priceData?.value),normal=Number(o?.priceData?.value);const path=String(o?.url||'');if(!Number.isFinite(current)||current<=0||!path)continue;
    out.push({code:String(o?.code||''),size,stock,current,original:Number.isFinite(normal)&&normal>current?normal:null,url:new URL(path,'https://www.e-bebek.com').toString()});
  }
  return out;
}

async function verify(c:Candidate){
  const title=(c.title||'').toLocaleLowerCase('tr-TR'),url=(c.url||'').toLocaleLowerCase('tr-TR');if(!(title.includes('erkek')||url.includes('erkek'))||title.includes('kız')||url.includes('kiz'))return null;
  const r=await fetch(c.url,{cache:'no-store',redirect:'follow',headers:H});if(!r.ok)return null;const variants=parseVariants(await r.text());if(!variants.length)return null;
  const best=variants.slice().sort((a,b)=>a.current-b.current)[0];const sizes=[...new Set(variants.map(v=>v.size))];const originals=variants.map(v=>v.original).filter((x):x is number=>x!==null&&x>best.current);const original=originals.length?Math.max(...originals):null;
  return {external_id:best.code||c.external_id||null,title:c.title,url:best.url,image_url:c.image_url||null,current_price:best.current,original_price:original,discount_percent:original?Math.round((1-best.current/original)*10000)/100:0,in_stock:true,brand:c.brand||'ebebek',source:'ebebek-variant-stock',profile_verified:true,matched_sizes:sizes};
}

export async function GET(){try{const base=await fetch('https://www.tooldur.com/api/indirim/store/ebebek',{cache:'no-store',headers:{accept:'application/json'}});if(!base.ok)return NextResponse.json({ok:false,error:`ebebek liste HTTP ${base.status}`,products:[]},{status:502});const j=await base.json();const candidates=(Array.isArray(j?.products)?j.products:[]).slice(0,24) as Candidate[];const products:any[]=[];for(let i=0;i<candidates.length;i+=4){const batch=await Promise.all(candidates.slice(i,i+4).map(verify));for(const p of batch)if(p)products.push(p)}products.sort((a,b)=>b.discount_percent-a.discount_percent||a.current_price-b.current_price);return NextResponse.json({ok:true,profile:'ege',source:'ebebek-variant-stock',count:products.length,products,at:new Date().toISOString()},{headers:{'Cache-Control':'no-store'}})}catch(e:any){return NextResponse.json({ok:false,error:String(e?.message||e),products:[]},{status:500})}}
