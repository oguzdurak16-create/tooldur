import { NextResponse } from 'next/server';

export const runtime='nodejs';
export const dynamic='force-dynamic';

type Profile='merve'|'oguzhan';
type HmSize={label?:string;stock?:number};
type HmPrice={price?:number;priceType?:string};
const API='https://api.hm.com/search-services/v1/tr_tr/search/resultpage';
const H={'user-agent':'Mozilla/5.0 AppleWebKit/537.36 Chrome/127 Safari/537.36','accept':'application/json','accept-language':'tr-TR,tr;q=0.9,en;q=0.7','cache-control':'no-cache'};

function wantedProfile(p:any,profile:Profile){
  const cat=String(p?.mainCatCode||'').toLocaleLowerCase('tr-TR');
  const sizes=(Array.isArray(p?.sizes)?p.sizes:[]) as HmSize[];
  const inStock=sizes.filter(s=>Number(s.stock||0)>0).map(s=>String(s.label||'').trim().toUpperCase());
  if(profile==='merve'){
    const adultWomen=cat.startsWith('ladies_')||cat.startsWith('sportswear_women_');
    return adultWomen&&(inStock.includes('L')||inStock.includes('XL'));
  }
  const adultMen=cat.startsWith('men_')||cat.startsWith('sportswear_men_');
  return adultMen&&inStock.includes('XL');
}

function mapProduct(p:any,profile:Profile){
  if(!wantedProfile(p,profile))return null;
  const priceValues=((Array.isArray(p?.prices)?p.prices:[]) as HmPrice[]).map(x=>Number(x.price)).filter(x=>Number.isFinite(x)&&x>0);
  if(!priceValues.length)return null;
  const current=Math.min(...priceValues), original=Math.max(...priceValues);
  const sizes=((Array.isArray(p?.sizes)?p.sizes:[]) as HmSize[]).filter(s=>Number(s.stock||0)>0).map(s=>String(s.label||'').trim());
  const relevant=profile==='merve'?sizes.filter(s=>['L','XL'].includes(s.toUpperCase())):sizes.filter(s=>s.toUpperCase()==='XL');
  if(!relevant.length)return null;
  const url=new URL(String(p?.url||''),'https://www2.hm.com').toString();
  const discount=original>current?Math.round((1-current/original)*10000)/100:0;
  return {
    external_id:String(p?.id||'')||null,
    title:String(p?.productName||'H&M ürünü'),
    url,
    image_url:p?.productImage||p?.modelImage||null,
    current_price:current,
    original_price:original>current?original:null,
    discount_percent:discount,
    in_stock:String(p?.availability?.stockState||'').toLowerCase()!=='soldout',
    brand:p?.brandName||'H&M',
    source:`hm-public-api-${profile}`,
    profile_verified:true,
    matched_sizes:relevant,
    main_category:String(p?.mainCatCode||'')
  };
}

export async function GET(req:Request){
  const profile=(new URL(req.url).searchParams.get('profile')||'merve') as Profile;
  if(profile!=='merve'&&profile!=='oguzhan')return NextResponse.json({ok:false,error:'Geçersiz profil'},{status:400});
  const query=profile==='merve'?'kadin':'erkek';
  try{
    const products:any[]=[];const seen=new Set<string>();
    for(const page of [1,2]){
      const u=new URL(API);u.searchParams.set('query',query);u.searchParams.set('touchPoint','DESKTOP');u.searchParams.set('hideStockMarket','true');u.searchParams.set('pageSource','PLP');u.searchParams.set('page',String(page));u.searchParams.set('pageSize','48');
      const r=await fetch(u,{cache:'no-store',headers:H,redirect:'follow'});if(!r.ok)return NextResponse.json({ok:false,error:`H&M API HTTP ${r.status}`,products:[]},{status:502});
      const j=await r.json();const list=Array.isArray(j?.searchHits?.productList)?j.searchHits.productList:[];
      for(const raw of list){const p=mapProduct(raw,profile);if(!p||seen.has(p.url))continue;seen.add(p.url);products.push(p);if(products.length>=100)break}
      if(products.length>=100)break;
    }
    return NextResponse.json({ok:true,profile,source:'hm-public-api',count:products.length,products,at:new Date().toISOString()},{headers:{'Cache-Control':'no-store'}});
  }catch(e:any){return NextResponse.json({ok:false,error:String(e?.message||e),products:[]},{status:500})}
}
