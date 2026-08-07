import { NextResponse } from 'next/server';

export const runtime='nodejs';
export const dynamic='force-dynamic';

const H={'user-agent':'Mozilla/5.0 AppleWebKit/537.36 Chrome/127 Safari/537.36','accept':'text/html,application/xhtml+xml','accept-language':'tr-TR,tr;q=0.9,en;q=0.7','cache-control':'no-cache'};

type Candidate={external_id?:string|null;title:string;url:string;image_url?:string|null;brand?:string|null};
type Variant={code:string;size:string;stock:number;current:number;original:number|null;url:string};

function normalize(html:string){return html.replace(/\\u002F/g,'/').replace(/\\u0026/g,'&').replace(/\\"/g,'"')}
function age4plus(label:string){const s=label.replace(/\s+/g,' ').trim();if(/ay/i.test(s))return false;const m=s.match(/(\d+(?:[.,]\d+)?)\s*(?:-|–|—)?\s*(\d+(?:[.,]\d+)?)?\s*yaş/i);if(!m)return false;const start=Number(m[1].replace(',','.'));return Number.isFinite(start)&&start>=4}
function variantBlocks(text:string){const out:string[]=[];let pos=0;while(true){const i=text.indexOf('{"code":"',pos);if(i<0)break;const j=text.indexOf('},{"code":"',i+10);out.push(text.slice(i,j<0?Math.min(text.length,i+18000):j+1));pos=j<0?text.length:j+2;if(out.length>400)break}return out}
function parseVariants(html:string):Variant[]{
  const text=normalize(html);const out:Variant[]=[];
  for(const block of variantBlocks(text)){
    if(!block.includes('"variantOptionQualifiers"'))continue;
    const code=(block.match(/^\{"code":"([^"]+)"/)||[])[1]||'';
    const size=(block.match(/"qualifier":"size","value":"([^"]+)"/)||[])[1]||'';
    if(!code||!age4plus(size))continue;
    const stock=Number((block.match(/"stockLevel":([0-9.]+)/)||[])[1]||0);
    const status=(block.match(/"stockLevelStatus":"([^"]+)"/)||[])[1]||'';
    if(stock<=0||status.toLowerCase()!=='instock')continue;
    const discountedMatch=block.match(/"discountedPrice":\{[^{}]{0,300}?"value":([0-9.]+)/);
    const normalMatch=block.match(/"priceData":\{[^{}]{0,300}?"value":([0-9.]+)/);
    const current=Number(discountedMatch?.[1]||normalMatch?.[1]||0);
    const originalNum=Number(normalMatch?.[1]||0);
    const path=(block.match(/"url":"([^"]+)"/)||[])[1]||'';
    if(!current||!path)continue;
    out.push({code,size,stock,current,original:originalNum>current?originalNum:null,url:new URL(path,'https://www.e-bebek.com').toString()});
  }
  return out;
}

async function verify(c:Candidate){
  const title=(c.title||'').toLocaleLowerCase('tr-TR'),url=(c.url||'').toLocaleLowerCase('tr-TR');
  if(!(title.includes('erkek')||url.includes('erkek'))||title.includes('kız')||url.includes('kiz'))return null;
  const r=await fetch(c.url,{cache:'no-store',redirect:'follow',headers:H});if(!r.ok)return null;
  const variants=parseVariants(await r.text());if(!variants.length)return null;
  const best=variants.slice().sort((a,b)=>a.current-b.current)[0];
  const sizes=[...new Set(variants.map(v=>v.size))];
  const originalCandidates=variants.map(v=>v.original).filter((x):x is number=>x!==null&&x>best.current);
  const original=originalCandidates.length?Math.max(...originalCandidates):null;
  return {external_id:c.external_id||best.code,title:c.title,url:best.url,image_url:c.image_url||null,current_price:best.current,original_price:original,discount_percent:original?Math.round((1-best.current/original)*10000)/100:0,in_stock:true,brand:c.brand||'ebebek',source:'ebebek-variant-stock',profile_verified:true,matched_sizes:sizes};
}

export async function GET(){
 try{
  const base=await fetch('https://www.tooldur.com/api/indirim/store/ebebek',{cache:'no-store',headers:{accept:'application/json'}});if(!base.ok)return NextResponse.json({ok:false,error:`ebebek liste HTTP ${base.status}`,products:[]},{status:502});
  const j=await base.json();const candidates=(Array.isArray(j?.products)?j.products:[]).slice(0,24) as Candidate[];
  const products:any[]=[];
  for(let i=0;i<candidates.length;i+=4){const batch=await Promise.all(candidates.slice(i,i+4).map(verify));for(const p of batch)if(p)products.push(p)}
  products.sort((a,b)=>b.discount_percent-a.discount_percent||a.current_price-b.current_price);
  return NextResponse.json({ok:true,profile:'ege',source:'ebebek-variant-stock',count:products.length,products,at:new Date().toISOString()},{headers:{'Cache-Control':'no-store'}})
 }catch(e:any){return NextResponse.json({ok:false,error:String(e?.message||e),products:[]},{status:500})}
}
