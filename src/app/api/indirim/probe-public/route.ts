import { NextResponse } from 'next/server';
export const runtime='nodejs';
export const dynamic='force-dynamic';

const H={
  'user-agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
  'accept':'application/json,text/plain,*/*',
  'accept-language':'tr-TR,tr;q=0.9,en;q=0.7',
  'cache-control':'no-cache'
};
const tests:[string,string][]=[
 ['hm-api','https://api.hm.com/search-services/v1/tr_tr/search/resultpage?query=erkek&touchPoint=DESKTOP&hideStockMarket=true&pageSource=PLP&page=0&pageSize=5'],
 ['hm-api-q','https://api.hm.com/search-services/v1/tr_tr/search/resultpage?q=erkek&touchPoint=DESKTOP&hideStockMarket=true&pageSource=PLP&page=0&pageSize=5'],
 ['hm-page','https://www2.hm.com/tr_tr/erkek/deals/deal.html'],
 ['ty-mobile-women','https://m.trendyol.com/kadin-giyim-x-g1-c82'],
 ['ty-mobile-kids','https://m.trendyol.com/cocuk-giyim-x-g3-c82'],
 ['ty-gw','https://public-sdc.trendyol.com/discovery-web-browsinggw-service/v2/filter-products?culture=tr-TR&storefrontId=1&categoryId=82&page=1'],
 ['hb-mobile','https://m.hepsiburada.com/ara?q=kad%C4%B1n%20giyim'],
 ['hb-page','https://www.hepsiburada.com/ara?q=kad%C4%B1n%20giyim'],
 ['zara-page','https://www.zara.com/tr/tr/kadin-alt-giyim-ezel-fiyatlar-l1059.html'],
 ['zara-ajax','https://www.zara.com/tr/tr/category/1059/products?ajax=true'],
 ['watsons-page','https://www.watsons.com.tr/makyaj/makyaj-cok-satanlar/c/100070'],
 ['ebebek-page','https://www.e-bebek.com/erkek-bebek-giyim-c4996']
];
function signals(t:string){
 const s=t.slice(0,250000);
 return {
   json:s.trim().startsWith('{')||s.trim().startsWith('['),
   product:/product|urun|ürün/i.test(s),
   price:/price|fiyat|currentPrice|oldPrice|discountedPrice/i.test(s),
   size:/size|beden|variant/i.test(s),
   next:/__NEXT_DATA__|self\.__next_f|application\/ld\+json/i.test(s)
 };
}
export async function GET(){
 const out:any={};
 for(const [name,url] of tests){
   const t0=Date.now();
   try{
     const r=await fetch(url,{headers:H,redirect:'follow',cache:'no-store'});
     const text=await r.text();
     out[name]={status:r.status,url:r.url,type:r.headers.get('content-type'),len:text.length,ms:Date.now()-t0,signals:signals(text),sample:text.slice(0,1200)};
   }catch(e:any){out[name]={error:String(e?.message||e),ms:Date.now()-t0}}
 }
 return NextResponse.json(out,{headers:{'Cache-Control':'no-store'}});
}
