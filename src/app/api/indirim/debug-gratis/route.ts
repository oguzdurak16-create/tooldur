import { NextResponse } from 'next/server';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const URL='https://www.gratis.com/makyaj-/makyaj-c-501';
const headers={'user-agent':'Mozilla/5.0 AppleWebKit/537.36 Chrome/127 Safari/537.36','accept':'text/html,application/xhtml+xml','accept-language':'tr-TR,tr;q=0.9'};
function snippets(html:string,key:string,radius=1200){const out:string[]=[];let pos=0;while(out.length<6){const i=html.toLowerCase().indexOf(key.toLowerCase(),pos);if(i<0)break;out.push(html.slice(Math.max(0,i-radius),Math.min(html.length,i+radius)));pos=i+key.length;}return out;}
export async function GET(){const r=await fetch(URL,{cache:'no-store',headers,redirect:'follow'});const html=await r.text();return NextResponse.json({status:r.status,length:html.length,id10202517:snippets(html,'10202517',2400),slug:snippets(html,'slug'),productUrl:snippets(html,'productUrl'),urlKey:snippets(html,'urlKey'),seo:snippets(html,'seo'),href:snippets(html,'href')},{headers:{'Cache-Control':'no-store'}})}