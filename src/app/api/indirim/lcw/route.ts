import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const URL = 'https://www.lcw.com/kampanyalar/kadin-urunleri-sepette-yuzde-50-ye-varan-indirimli';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36';

type Product = { external_id:string|null; title:string; url:string; image_url:string|null; current_price:number|null; original_price:number|null; discount_percent:number; in_stock:boolean|null };

function n(v:any): number|null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v !== 'string') return null;
  const x = v.replace(/[^0-9,.-]/g,'').replace(/\.(?=\d{3}(\D|$))/g,'').replace(',','.');
  const z = Number(x); return Number.isFinite(z) ? z : null;
}
function abs(v:any){ try { return v ? new URL(String(v),URL).toString() : '' } catch { return '' } }
function one(v:any){ return Array.isArray(v) ? v[0] : v }
function img(v:any):string|null { const x=one(v); return typeof x==='string'?x:(x?.url||x?.contentUrl||null) }
function pushProduct(node:any,out:Product[],seen:Set<string>) {
  const type=node?.['@type']; const isP=type==='Product'||(Array.isArray(type)&&type.includes('Product'));
  if(!isP) return;
  const offer:any=one(node.offers)||{}; const ps:any=one(offer.priceSpecification)||{};
  const price=n(offer.price??offer.lowPrice??ps.price);
  let original=n(offer.highPrice??ps.listPrice??ps.referencePrice??node.originalPrice);
  if(original!==null&&price!==null&&original<=price) original=null;
  const url=abs(node.url||offer.url); const title=String(node.name||'').trim();
  if(!title||!url||seen.has(url)) return;
  seen.add(url);
  const discount=price&&original&&original>price?Math.round((1-price/original)*10000)/100:0;
  const availability=String(offer.availability||'').toLowerCase();
  out.push({external_id:node.sku?String(node.sku):(node.productID?String(node.productID):null),title,url,image_url:img(node.image),current_price:price,original_price:original,discount_percent:discount,in_stock:availability?(!availability.includes('outofstock')&&!availability.includes('soldout')):null});
}
function walk(node:any,out:Product[],seen:Set<string>){
  if(!node||out.length>=120)return;
  if(Array.isArray(node)){for(const x of node)walk(x,out,seen);return}
  if(typeof node!=='object')return;
  pushProduct(node,out,seen);
  for(const v of Object.values(node)) walk(v,out,seen);
}
function jsonLd(html:string){
  const out:Product[]=[]; const seen=new Set<string>();
  const re=/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi; let m:RegExpExecArray|null;
  while((m=re.exec(html))&&out.length<120){ try{walk(JSON.parse(m[1].trim()),out,seen)}catch{} }
  return out;
}
function htmlFallback(html:string){
  const out:Product[]=[]; const seen=new Set<string>();
  const linkRe=/<a[^>]+href=["']([^"']*(?:urun|product)[^"']*)["'][^>]*>([\s\S]{0,5000}?)<\/a>/gi; let m:RegExpExecArray|null;
  while((m=linkRe.exec(html))&&out.length<80){
    const url=abs(m[1]); if(!url||seen.has(url))continue; const block=m[0];
    const title=((block.match(/(?:title|aria-label)=["']([^"']{3,160})["']/i)||[])[1]||block.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,140)).trim();
    const prices=[...block.matchAll(/(?:₺|TL)?\s*([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{1,2})?)\s*(?:₺|TL)/gi)].map(x=>n(x[1])).filter((x):x is number=>x!==null&&x>1&&x<1000000);
    if(!title||prices.length===0)continue; const current=Math.min(...prices); const original=prices.length>1?Math.max(...prices):null; const discount=original&&original>current?Math.round((1-current/original)*10000)/100:0;
    const image=(block.match(/<img[^>]+(?:src|data-src)=["']([^"']+)["']/i)||[])[1]||null;
    seen.add(url); out.push({external_id:(url.match(/-(\d+)(?:\?|$)/)||[])[1]||null,title,url,image_url:image?abs(image):null,current_price:current,original_price:original,discount_percent:discount,in_stock:true});
  }
  return out;
}

export async function GET(){
  try{
    const res=await fetch(URL,{cache:'no-store',redirect:'follow',headers:{'user-agent':UA,'accept':'text/html,application/xhtml+xml','accept-language':'tr-TR,tr;q=0.9,en;q=0.7'}});
    const html=await res.text(); if(!res.ok)return NextResponse.json({ok:false,status:res.status,products:[]},{status:502});
    let products=jsonLd(html); let source='jsonld'; if(products.length===0){products=htmlFallback(html);source='html'}
    return NextResponse.json({ok:true,status:res.status,source,count:products.length,products:products.slice(0,80),at:new Date().toISOString()},{headers:{'Cache-Control':'no-store'}});
  }catch(e:any){return NextResponse.json({ok:false,error:String(e?.message||e),products:[]},{status:500})}
}
