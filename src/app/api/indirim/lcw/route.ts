import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LCW_URL = 'https://www.lcw.com/kampanyalar/kadin-urunleri-sepette-yuzde-50-ye-varan-indirimli';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36';

type Product = { external_id:string|null; title:string; url:string; image_url:string|null; current_price:number|null; original_price:number|null; discount_percent:number; in_stock:boolean|null };

function n(v:any): number|null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v !== 'string') return null;
  let x = v.replace(/\s/g,'').replace(/[^0-9,.-]/g,'');
  if (x.includes(',') && x.includes('.')) {
    x = x.lastIndexOf(',') > x.lastIndexOf('.') ? x.replace(/\./g,'').replace(',','.') : x.replace(/,/g,'');
  } else if (x.includes(',')) x = x.replace(',','.');
  const z = Number(x); return Number.isFinite(z) ? z : null;
}
function abs(v:any){ try { return v ? new globalThis.URL(String(v),LCW_URL).toString() : '' } catch { return '' } }
function one(v:any){ return Array.isArray(v) ? v[0] : v }
function img(v:any):string|null { const x=one(v); return typeof x==='string'?x:(x?.url||x?.contentUrl||null) }
function slugTitle(url:string){
  try {
    const raw = new globalThis.URL(url).pathname.split('/').filter(Boolean).pop() || 'LC Waikiki Ürünü';
    return raw.replace(/-o-\d+.*$/,'').replace(/-\d+.*$/,'').replace(/-/g,' ').replace(/\b\w/g,c=>c.toLocaleUpperCase('tr-TR'));
  } catch { return 'LC Waikiki Ürünü'; }
}

function balancedArray(text:string,start:number):string|null {
  let depth=0,inString=false,escaped=false;
  for(let i=start;i<text.length;i++){
    const c=text[i];
    if(inString){ if(escaped){escaped=false;continue} if(c==='\\'){escaped=true;continue} if(c==='"')inString=false; continue }
    if(c==='"'){inString=true;continue}
    if(c==='[')depth++;
    else if(c===']'){ depth--; if(depth===0)return text.slice(start,i+1) }
  }
  return null;
}

function findCatalogItems(html:string):any[]{
  const variants=[html, html.replace(/\\"/g,'"')];
  for(const text of variants){
    const markers=['"CatalogList":{"Items":[','"CatalogList": {"Items": [','"Items":[{"HasCampaignBanners"'];
    for(const marker of markers){
      const markerPos=text.indexOf(marker); if(markerPos<0)continue;
      const itemsPos=text.indexOf('"Items"',markerPos);
      const start=text.indexOf('[',itemsPos>=0?itemsPos:markerPos);
      if(start<0)continue;
      const raw=balancedArray(text,start); if(!raw)continue;
      try { const parsed=JSON.parse(raw); if(Array.isArray(parsed)&&parsed.length)return parsed; } catch {}
    }
  }
  return [];
}

function value(o:any,keys:string[]){for(const k of keys)if(o?.[k]!=null&&o[k]!=='')return o[k];return null}
function mapCatalogItem(item:any):Product|null {
  const url=abs(value(item,['ModelUrl','ProductUrl','Url','URL']));
  if(!url)return null;

  let current=n(value(item,['OptionSalePrice','SalePrice','CurrentPrice','DiscountedPrice','CampaignPrice','OptionPrice','Price','PriceText','ConvertedPrice']));
  let original=n(value(item,['OldPrice','OriginalPrice','ListPrice','MarketPrice']));
  const priceCandidates=Object.entries(item||{}).map(([k,v])=>({key:k.toLowerCase(),val:n(v)})).filter(x=>x.val!==null&&x.val!>1&&x.val!<1000000&&x.key.includes('price'));
  if(current===null){
    const normal=priceCandidates.filter(x=>!/(old|original|list|market|converted)/.test(x.key)).map(x=>x.val as number);
    if(normal.length) current=Math.min(...normal);
  }
  if(original===null){
    const olds=priceCandidates.filter(x=>/(old|original|list|market)/.test(x.key)).map(x=>x.val as number);
    if(olds.length) original=Math.max(...olds);
  }
  if(original!==null&&current!==null&&original<=current)original=null;

  const ratio=n(value(item,['DiscountRatio','DiscountRate','DiscountPercent']));
  const discount=ratio!==null&&ratio>0?ratio:(current&&original&&original>current?Math.round((1-current/original)*10000)/100:0);
  const title=String(value(item,['ProductName','ModelName','Title','Name','ProductDescription','Description','SubTitleDescription'])||slugTitle(url)).trim();
  const imageUrl=value(item,['DefaultOptionImageUrl','DefaultOptionImage','ImageUrl','ImageURL']) || one(item?.OptionImageUrlList);
  const stock=n(value(item,['AvailableStock','Stock','StockQuantity']));
  return {
    external_id:String(value(item,['ModelId','ProductId','Id','OzelKodRenkKod'])||'')||null,
    title,
    url,
    image_url:imageUrl?abs(imageUrl):null,
    current_price:current,
    original_price:original,
    discount_percent:discount,
    in_stock:stock===null?null:stock>0,
  };
}

function catalogProducts(html:string){
  const items=findCatalogItems(html);
  const seen=new Set<string>();
  const products:Product[]=[];
  for(const item of items){const p=mapCatalogItem(item);if(!p||p.current_price===null||seen.has(p.url))continue;seen.add(p.url);products.push(p);if(products.length>=100)break}
  return {items,products};
}

function pushProduct(node:any,out:Product[],seen:Set<string>) {
  const type=node?.['@type']; const isP=type==='Product'||(Array.isArray(type)&&type.includes('Product'));
  if(!isP) return;
  const offer:any=one(node.offers)||{}; const ps:any=one(offer.priceSpecification)||{};
  const price=n(offer.price??offer.lowPrice??ps.price);
  let original=n(offer.highPrice??ps.listPrice??ps.referencePrice??node.originalPrice);
  if(original!==null&&price!==null&&original<=price) original=null;
  const url=abs(node.url||offer.url); const title=String(node.name||'').trim();
  if(!title||!url||price===null||seen.has(url)) return;
  seen.add(url);
  const discount=price&&original&&original>price?Math.round((1-price/original)*10000)/100:0;
  const availability=String(offer.availability||'').toLowerCase();
  out.push({external_id:node.sku?String(node.sku):(node.productID?String(node.productID):null),title,url,image_url:img(node.image),current_price:price,original_price:original,discount_percent:discount,in_stock:availability?(!availability.includes('outofstock')&&!availability.includes('soldout')):null});
}
function walk(node:any,out:Product[],seen:Set<string>){if(!node||out.length>=100)return;if(Array.isArray(node)){for(const x of node)walk(x,out,seen);return}if(typeof node!=='object')return;pushProduct(node,out,seen);for(const v of Object.values(node))walk(v,out,seen)}
function jsonLd(html:string){const out:Product[]=[];const seen=new Set<string>();const re=/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;let m:RegExpExecArray|null;while((m=re.exec(html))&&out.length<100){try{walk(JSON.parse(m[1].trim()),out,seen)}catch{}}return out}

export async function GET(){
  try{
    const res=await fetch(LCW_URL,{cache:'no-store',redirect:'follow',headers:{'user-agent':UA,'accept':'text/html,application/xhtml+xml','accept-language':'tr-TR,tr;q=0.9,en;q=0.7'}});
    const html=await res.text(); if(!res.ok)return NextResponse.json({ok:false,status:res.status,products:[]},{status:502});
    const catalog=catalogProducts(html);
    let products=catalog.products; let source='catalog';
    if(products.length===0){products=jsonLd(html);source='jsonld'}
    return NextResponse.json({ok:true,status:res.status,source,count:products.length,products:products.slice(0,80),diagnostics:products.length?undefined:{catalogItems:catalog.items.length,firstKeys:catalog.items[0]?Object.keys(catalog.items[0]).filter(k=>/price|name|model|url|description/i.test(k)).slice(0,30):[]},at:new Date().toISOString()},{headers:{'Cache-Control':'no-store'}});
  }catch(e:any){return NextResponse.json({ok:false,error:String(e?.message||e),products:[]},{status:500})}
}
