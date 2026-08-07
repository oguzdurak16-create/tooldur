import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SOURCES: Record<string,{url:string;brand:string}> = {
  'amazon-tr': { url:'https://www.amazon.com.tr/b?node=21034466031', brand:'Amazon Türkiye' },
  'gratis': { url:'https://www.gratis.com/makyaj-/makyaj-c-501', brand:'Gratis' },
  'ebebek': { url:'https://www.e-bebek.com/bebek-giyim-c4050', brand:'ebebek' },
};

const headers={
  'user-agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
  'accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'accept-language':'tr-TR,tr;q=0.9,en-US;q=0.7,en;q=0.6',
  'cache-control':'no-cache',
};

type Product={external_id:string|null;title:string;url:string;image_url:string|null;current_price:number|null;original_price:number|null;discount_percent:number;in_stock:boolean|null;brand:string|null;source:string};

function price(v:any):number|null{
  if(typeof v==='number'&&Number.isFinite(v))return v;
  if(typeof v!=='string')return null;
  let s=v.replace(/\s/g,'').replace(/[^0-9,.-]/g,'');
  if(!s)return null;
  if(s.includes(',')&&s.includes('.')){
    if(s.lastIndexOf(',')>s.lastIndexOf('.'))s=s.replace(/\./g,'').replace(',','.');
    else s=s.replace(/,/g,'');
  }else if(s.includes(','))s=s.replace(',','.');
  const n=Number(s);return Number.isFinite(n)&&n>0?n:null;
}
function abs(v:any,base:string){try{return v?new URL(String(v),base).toString():''}catch{return''}}
function first(v:any){return Array.isArray(v)?v[0]:v}
function pct(current:number|null,original:number|null,explicit?:any){
  const e=price(explicit); if(e!==null&&e>=0&&e<=100)return e;
  return current&&original&&original>current?Math.round((1-current/original)*10000)/100:0;
}

function structured(html:string,base:string,defaultBrand:string):Product[]{
  const out:Product[]=[]; const seen=new Set<string>();
  const add=(obj:any,source:string)=>{
    if(!obj||typeof obj!=='object'||out.length>=160)return;
    const offer:any=first(obj.offers)||obj.offer||{};
    const title=String(obj.name??obj.productName??obj.title??obj.displayName??'').trim();
    const rawUrl=obj.url??obj.productUrl??obj.link??obj.seoUrl??offer.url;
    const url=abs(rawUrl,base);
    const current=price(offer.price??offer.lowPrice??obj.currentPrice??obj.salePrice??obj.discountedPrice??obj.price?.value??obj.price);
    let original=price(offer.highPrice??offer.listPrice??obj.originalPrice??obj.oldPrice??obj.regularPrice??obj.listPrice);
    if(original!==null&&current!==null&&original<=current)original=null;
    const looksProduct=Boolean(title&&url&&current!==null&&(/product/i.test(String(obj['@type']||''))||obj.productName||obj.productId||obj.productID||obj.sku||obj.code||obj.modelId||obj.currentPrice||obj.salePrice||offer.price));
    if(looksProduct&&!seen.has(url)){
      seen.add(url);
      const image=first(obj.image??obj.images??obj.imageUrl??obj.thumbnail??obj.media);
      const imageUrl=typeof image==='string'?abs(image,base):abs(image?.url??image?.src??image?.imageUrl,base)||null;
      const brandObj=obj.brand; const brand=typeof brandObj==='string'?brandObj:(brandObj?.name||obj.brandName||defaultBrand);
      const explicit=obj.discountPercent??obj.discountPercentage??obj.discountRate??obj.discountRatio??obj.discount;
      out.push({external_id:String(obj.sku??obj.productID??obj.productId??obj.code??obj.modelId??'')||null,title,url,image_url:imageUrl,current_price:current,original_price:original,discount_percent:pct(current,original,explicit),in_stock:obj.inStock===false?false:null,brand,source});
    }
    for(const value of Object.values(obj)){if(out.length>=160)break;if(value&&typeof value==='object')walk(value,source)}
  };
  const walk=(node:any,source:string)=>{if(!node||out.length>=160)return;if(Array.isArray(node)){for(const x of node)walk(x,source);return}if(typeof node==='object')add(node,source)};
  const ld=/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi; let m:RegExpExecArray|null;
  while((m=ld.exec(html))&&out.length<160){try{walk(JSON.parse(m[1].trim()),'jsonld')}catch{}}
  return out;
}

function itemUrls(html:string){
  const map=new Map<string,string>();
  const re=/https:\/\/www\.gratis\.com\/[^"'\\\s<>]+-p-(\d+)/g; let m:RegExpExecArray|null;
  while((m=re.exec(html)))if(!map.has(m[1]))map.set(m[1],m[0].replace(/\\u0026/g,'&'));
  return map;
}
function gratis(html:string):Product[]{
  const flat=html.replace(/\\+"/g,'"');
  const start=flat.indexOf('"products":['); if(start<0)return[];
  const end=flat.indexOf('],"params"',start); const section=flat.slice(start,end>start?end:Math.min(flat.length,start+500000));
  const markers=[...section.matchAll(/\{"id":"(\d+)","stockStatus":"([^"]+)","prices":\{/g)];
  const urls=itemUrls(html); const out:Product[]=[];
  for(let i=0;i<markers.length&&out.length<100;i++){
    const id=markers[i][1],stock=markers[i][2]; const from=markers[i].index||0; const to=i+1<markers.length?(markers[i+1].index||section.length):section.length; const block=section.slice(from,to);
    const discount=Number((block.match(/"discountRate":([0-9.]+)/)||[])[1]||0);
    const discounted=Number((block.match(/"discountedPrice":([0-9]+)/)||[])[1]||0)/100;
    const normal=Number((block.match(/"normalPrice":([0-9]+)/)||[])[1]||0)/100;
    const brand=(block.match(/"brand":"([^"]+)"/)||[])[1]||'Gratis';
    const title=(block.match(/"displayName":"([^"]+)"/)||[])[1]||'';
    const share=(block.match(/"shareLink":"(https?:[^"\\]+)"/)||[])[1];
    const url=share||urls.get(id)||'';
    const img=(html.match(new RegExp(`https://api\\.gratis\\.retter\\.io/[^"'\\s<>]*${id}[^"'\\s<>]*\\.(?:jpg|jpeg|png|webp)`,'i'))||[])[0]||null;
    if(!title||!url||!discounted)continue;
    out.push({external_id:id,title:urlDecode(title),url,image_url:img,current_price:discounted,original_price:normal>discounted?normal:null,discount_percent:discount||pct(discounted,normal),in_stock:stock!=='OUT_OF_STOCK',brand:urlDecode(brand),source:'gratis-rsc'});
  }
  return out;
}
function urlDecode(s:string){return s.replace(/\\u0026/g,'&').replace(/\\u0027/g,"'").replace(/\\u003cbr\\u003e/g,' ')}

function ebebek(html:string,products:Product[]):Product[]{
  const flat=html.split('\\\\u002F').join('/').split('\\u002F').join('/').replace(/\\+"/g,'"');
  return products.map(p=>{
    let path='';try{path=new URL(p.url).pathname}catch{return p}
    const needle=`"url":"${path}"`;let pos=flat.indexOf(needle);let enriched:Product|null=null;
    while(pos>=0){
      const block=flat.slice(pos,Math.min(flat.length,pos+18000));
      const old=Number((block.match(/"oldPrice":\{[^{}]{0,500}?"value":([0-9.]+)/)||[])[1]||0);
      const current=Number((block.match(/"currentPrice":\{[^{}]{0,500}?"value":([0-9.]+)/)||[])[1]||0);
      if(old>0&&current>0&&old>current){
        enriched={...p,current_price:current,original_price:old,discount_percent:pct(current,old),source:'ebebek-state'};break;
      }
      pos=flat.indexOf(needle,pos+needle.length);
    }
    return enriched||p;
  });
}

function amazon(html:string,base:string):Product[]{
  const out:Product[]=[]; const seen=new Set<string>();
  const blocks=html.split(/data-component-type=["']s-search-result["']/i).slice(1);
  for(const raw of blocks.slice(0,100)){
    const block=raw.slice(0,30000);
    const href=(block.match(/<a[^>]+href=["']([^"']+)["'][^>]*class=["'][^"']*(?:a-link-normal|s-no-outline)[^"']*["']/i)||block.match(/<a[^>]+class=["'][^"']*(?:a-link-normal|s-no-outline)[^"']*["'][^>]+href=["']([^"']+)["']/i)||[])[1];
    const url=abs(href,base); if(!url||seen.has(url))continue;
    const title=((block.match(/<h2[^>]*>[\s\S]*?<span[^>]*>([^<]+)<\/span>/i)||[])[1]||'').replace(/&amp;/g,'&').trim();
    const current=price((block.match(/<span[^>]+class=["']a-offscreen["'][^>]*>([^<]+)<\/span>/i)||[])[1]);
    const vals=[...block.matchAll(/<span[^>]+class=["'][^"']*a-offscreen[^"']*["'][^>]*>([^<]+)<\/span>/gi)].map(x=>price(x[1])).filter((x):x is number=>x!==null);
    const original=vals.filter(x=>current!==null&&x>current).sort((a,b)=>b-a)[0]||null;
    if(!title||current===null)continue;seen.add(url);
    out.push({external_id:(block.match(/data-asin=["']([^"']+)/i)||[])[1]||null,title,url,image_url:abs((block.match(/<img[^>]+src=["']([^"']+)/i)||[])[1],base)||null,current_price:current,original_price:original,discount_percent:pct(current,original),in_stock:true,brand:'Amazon Türkiye',source:'amazon-html'});
  }
  return out;
}

function anchorCards(html:string,base:string,brand:string):Product[]{
  const out:Product[]=[];const seen=new Set<string>();
  const re=/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]{80,16000}?)<\/a>/gi;let m:RegExpExecArray|null;
  while((m=re.exec(html))&&out.length<160){
    const block=m[0]; if(!/(TL|₺|price|fiyat|indirim|discount)/i.test(block))continue;
    const url=abs(m[1],base); if(!url||seen.has(url)||url===base)continue;
    const text=block.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#xA0;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
    const nums=[...text.matchAll(/([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]{1,2})?)\s*TL/gi)].map(x=>price(x[1])).filter((x):x is number=>x!==null&&x<1_000_000);
    if(!nums.length)continue;const current=Math.min(...nums);const original=nums.length>1?Math.max(...nums):null;
    const explicit=price((text.match(/%\s*([0-9]{1,2}(?:,[0-9]+)?)/)||[])[1]);
    const title=((block.match(/(?:title|aria-label)=["']([^"']{4,220})["']/i)||[])[1]||text.replace(/(?:%\s*\d+|[0-9.,]+\s*TL).*$/,'').trim()).slice(0,220);
    if(title.length<4)continue;seen.add(url);
    out.push({external_id:null,title,url,image_url:abs((block.match(/<img[^>]+(?:src|data-src)=["']([^"']+)/i)||[])[1],base)||null,current_price:current,original_price:original&&original>current?original:null,discount_percent:pct(current,original,explicit),in_stock:!/tükendi|stokta yok/i.test(text),brand,source:'anchor-html'});
  }
  return out;
}

export async function GET(_req:Request,{params}:{params:{site:string}}){
  const cfg=SOURCES[params.site]; if(!cfg)return NextResponse.json({ok:false,error:'Bilinmeyen mağaza'},{status:404});
  try{
    const res=await fetch(cfg.url,{cache:'no-store',redirect:'follow',headers});const html=await res.text();
    if(!res.ok)return NextResponse.json({ok:false,status:res.status,count:0,products:[]},{status:502});
    let products:Product[]=[];let source='structured';
    if(params.site==='gratis'){products=gratis(html);source='gratis-rsc'}
    else if(params.site==='amazon-tr'){products=amazon(html,cfg.url);source='amazon-html'}
    else {
      products=structured(html,cfg.url,cfg.brand).filter(p=>p.current_price!==null);
      if(params.site==='ebebek'){products=ebebek(html,products);source='ebebek-state'}
      if(products.length<5){const fallback=anchorCards(html,cfg.url,cfg.brand);if(fallback.length>products.length){products=fallback;source='anchor-html'}}
    }
    products=products.filter((p,i,a)=>p.url&&a.findIndex(x=>x.url===p.url)===i).sort((a,b)=>b.discount_percent-a.discount_percent).slice(0,100);
    return NextResponse.json({ok:true,status:res.status,site:params.site,source,count:products.length,products,at:new Date().toISOString()},{headers:{'Cache-Control':'no-store'}});
  }catch(e:any){return NextResponse.json({ok:false,error:String(e?.message||e),count:0,products:[]},{status:500})}
}
