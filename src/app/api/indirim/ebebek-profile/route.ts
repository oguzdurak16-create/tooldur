import { NextResponse } from 'next/server';

export const runtime='nodejs';
export const dynamic='force-dynamic';

const H={'user-agent':'Mozilla/5.0 AppleWebKit/537.36 Chrome/127 Safari/537.36','accept':'text/html,application/xhtml+xml','accept-language':'tr-TR,tr;q=0.9,en;q=0.7','cache-control':'no-cache'};

type Candidate={external_id?:string|null;title:string;url:string;image_url?:string|null;brand?:string|null;current_price?:number|null;original_price?:number|null;discount_percent?:number|null;in_stock?:boolean|null};

function age4plus(label:string){
  const s=label.replace(/\s+/g,' ').trim();
  if(/ay/i.test(s))return false;
  const m=s.match(/(\d+(?:[.,]\d+)?)\s*(?:-|–|—)?\s*(\d+(?:[.,]\d+)?)?\s*yaş/i);
  return !!m&&Number(m[1].replace(',','.'))>=4;
}

function liveSizes(html:string){
  const out:{code:string;size:string}[]=[];
  const re=/<input\b[^>]*name=["']size["'][^>]*value=["']([^"']+)["'][^>]*>\s*<label\b([^>]*)>[\s\S]{0,1000}?<span\b[^>]*>\s*([^<]+?)\s*<\/span>/gi;
  let m:RegExpExecArray|null;
  while((m=re.exec(html))){
    const attrs=m[2]||'',size=(m[3]||'').replace(/&nbsp;/gi,' ').trim();
    if(/disabledVariant/i.test(attrs)||!age4plus(size))continue;
    out.push({code:m[1],size});
  }
  return out;
}

function liveSellingPrice(html:string,c:Candidate){
  // Product-state prices are public TRY prices. Prefer current discounted/sale price; fall back to verified listing price.
  const sliceIndex=html.indexOf('"discountedPrice"');
  if(sliceIndex>=0){
    const block=html.slice(Math.max(0,sliceIndex-1000),Math.min(html.length,sliceIndex+4500));
    const currency=(block.match(/"currencyIso":"([^"]+)"/)||[])[1];
    const p=Number((block.match(/"discountedPrice":\{[^{}]{0,500}?"value":([0-9.]+)/)||[])[1]||0);
    if(currency==='TRY'&&Number.isFinite(p)&&p>0)return p;
  }
  const p=Number(c.current_price);return Number.isFinite(p)&&p>0?p:null;
}

async function verify(c:Candidate){
  const title=(c.title||'').toLocaleLowerCase('tr-TR'),url=(c.url||'').toLocaleLowerCase('tr-TR');
  if(!(title.includes('erkek')||url.includes('erkek'))||title.includes('kız')||url.includes('kiz'))return null;
  const r=await fetch(c.url,{cache:'no-store',redirect:'follow',headers:H});
  if(!r.ok)return null;
  const html=await r.text();
  const sizes=liveSizes(html);
  if(!sizes.length)return null;
  const current=liveSellingPrice(html,c);
  if(current===null)return null;
  const listedOriginal=Number(c.original_price);
  const original=Number.isFinite(listedOriginal)&&listedOriginal>current?listedOriginal:null;
  return {
    external_id:c.external_id||sizes[0].code||null,
    title:c.title,
    url:c.url,
    image_url:c.image_url||null,
    current_price:current,
    original_price:original,
    discount_percent:original?Math.round((1-current/original)*10000)/100:0,
    in_stock:true,
    brand:c.brand||'ebebek',
    source:'ebebek-live-4plus-size',
    profile_verified:true,
    matched_sizes:[...new Set(sizes.map(s=>s.size))]
  };
}

export async function GET(){
  try{
    const base=await fetch('https://www.tooldur.com/api/indirim/store/ebebek',{cache:'no-store',headers:{accept:'application/json'}});
    if(!base.ok)return NextResponse.json({ok:false,error:`ebebek liste HTTP ${base.status}`,products:[]},{status:502});
    const j=await base.json();
    const candidates=(Array.isArray(j?.products)?j.products:[]).slice(0,24) as Candidate[];
    const products:any[]=[];
    for(let i=0;i<candidates.length;i+=4){
      const batch=await Promise.all(candidates.slice(i,i+4).map(verify));
      for(const p of batch)if(p)products.push(p);
    }
    products.sort((a,b)=>a.current_price-b.current_price);
    return NextResponse.json({ok:true,profile:'ege',source:'ebebek-live-4plus-size',candidate_count:candidates.length,count:products.length,products,at:new Date().toISOString()},{headers:{'Cache-Control':'no-store'}});
  }catch(e:any){return NextResponse.json({ok:false,error:String(e?.message||e),products:[]},{status:500})}
}
