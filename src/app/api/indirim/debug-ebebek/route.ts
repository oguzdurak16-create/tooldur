import { NextResponse } from 'next/server';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const URL='https://www.e-bebek.com/bebek-giyim-c4050';
const headers={'user-agent':'Mozilla/5.0 AppleWebKit/537.36 Chrome/127 Safari/537.36','accept':'text/html,application/xhtml+xml','accept-language':'tr-TR,tr;q=0.9'};
function around(h:string,k:string,r=2200){const i=h.indexOf(k);return i<0?'':h.slice(Math.max(0,i-r),Math.min(h.length,i+r));}
export async function GET(){const r=await fetch(URL,{cache:'no-store',headers,redirect:'follow'});const h=await r.text();return NextResponse.json({status:r.status,length:h.length,sku:around(h,'24KHLBKELB009'),discountRate:around(h,'discountRate'),oldPrice:around(h,'oldPrice'),discount:around(h,'discount'),percent:around(h,'%25')},{headers:{'Cache-Control':'no-store'}})}