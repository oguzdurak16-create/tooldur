import { NextResponse } from 'next/server';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const URL='https://www.amazon.com.tr/b?node=21034466031';
const headers={'user-agent':'Mozilla/5.0 AppleWebKit/537.36 Chrome/127 Safari/537.36','accept':'text/html,application/xhtml+xml','accept-language':'tr-TR,tr;q=0.9'};
export async function GET(){const r=await fetch(URL,{cache:'no-store',headers,redirect:'follow'});const h=await r.text();const links:[string,string][]=[];const re=/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]{0,500}?)<\/a>/gi;let m:RegExpExecArray|null;while((m=re.exec(h))&&links.length<30){const text=m[2].replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();if(/kadın giyim|kız çocuk|erkek çocuk|bebek/i.test(text))links.push([text,m[1]]);}return NextResponse.json({status:r.status,links},{headers:{'Cache-Control':'no-store'}})}