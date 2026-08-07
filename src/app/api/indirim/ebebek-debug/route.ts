import { NextResponse } from 'next/server';
export const runtime='nodejs';
export const dynamic='force-dynamic';
function snippets(text:string,patterns:string[]){const out:any={};for(const p of patterns){const i=text.toLocaleLowerCase('tr-TR').indexOf(p.toLocaleLowerCase('tr-TR'));out[p]=i>=0?text.slice(Math.max(0,i-1200),Math.min(text.length,i+5000)):''}return out}
export async function GET(){
 const base=await fetch('https://www.tooldur.com/api/indirim/store/ebebek',{cache:'no-store'});const j=await base.json();const out:any=[];
 for(const p of (j.products||[]).slice(0,4)){
  try{const r=await fetch(p.url,{cache:'no-store',headers:{'user-agent':'Mozilla/5.0 AppleWebKit/537.36 Chrome/127 Safari/537.36','accept-language':'tr-TR,tr;q=0.9'}});const html=await r.text();out.push({title:p.title,url:p.url,status:r.status,len:html.length,snippets:snippets(html,['4 Yaş','4-5 Yaş','variantOptions','stockLevel','stockStatus','baseOptions','selected'])});}catch(e:any){out.push({title:p.title,url:p.url,error:String(e?.message||e)})}
 }
 return NextResponse.json({count:j.count,source:j.source,out},{headers:{'Cache-Control':'no-store'}})
}