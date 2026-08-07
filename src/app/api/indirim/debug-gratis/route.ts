import { NextResponse } from 'next/server';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const URL='https://www.gratis.com/makyaj-/makyaj-c-501';
const headers={'user-agent':'Mozilla/5.0 AppleWebKit/537.36 Chrome/127 Safari/537.36','accept':'text/html,application/xhtml+xml','accept-language':'tr-TR,tr;q=0.9'};
function snippets(html:string,key:string){const out:string[]=[];let pos=0;while(out.length<4){const i=html.toLowerCase().indexOf(key.toLowerCase(),pos);if(i<0)break;out.push(html.slice(Math.max(0,i-280),Math.min(html.length,i+700)));pos=i+key.length;}return out;}
export async function GET(){const r=await fetch(URL,{cache:'no-store',headers,redirect:'follow'});const html=await r.text();return NextResponse.json({status:r.status,length:html.length,product:snippets(html,'product'),price:snippets(html,'price'),currentPrice:snippets(html,'currentPrice'),productList:snippets(html,'productList'),api:snippets(html,'/api/'),tl:snippets(html,'TL')},{headers:{'Cache-Control':'no-store'}})}