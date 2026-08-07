'use client';

import { useEffect, useState } from 'react';
import { Bell, BellRing, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const OWNER='m.egedurak@gmail.com';
const ALLOWED=new Set(['m.egedurak@gmail.com','oguzdurak16@gmail.com']);
const VAPID_PUBLIC='BI4RCVAhtBQzXhKl0v8f1iWDsBFqAyBRdSL_XWC0zTOyf13aySVdlYCAZjX_2T8kmbiosS5ktKYlIlzB_Pm9F_Y';

function toUint8Array(base64:string){
  const padding='='.repeat((4-base64.length%4)%4);
  const raw=atob((base64+padding).replace(/-/g,'+').replace(/_/g,'/'));
  return Uint8Array.from([...raw].map(ch=>ch.charCodeAt(0)));
}

export default function MervePushSetup(){
  const pathname=usePathname();
  const [visible,setVisible]=useState(false);
  const [enabled,setEnabled]=useState(false);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');

  useEffect(()=>{
    if(pathname!=='/indirim'){setVisible(false);return;}
    supabase.auth.getSession().then(async({data:{session}}:any)=>{
      const email=(session?.user?.email||'').toLowerCase();
      if(!ALLOWED.has(email))return;
      setVisible(true);
      try{
        if('serviceWorker'in navigator){
          const reg=await navigator.serviceWorker.ready;
          const sub=await reg.pushManager?.getSubscription();
          setEnabled(Boolean(sub));
        }
      }catch{}
    });
  },[pathname]);

  const enable=async()=>{
    setBusy(true);setMessage('');
    try{
      if(!('serviceWorker'in navigator)||!('PushManager'in window)||!('Notification'in window)) throw new Error('Bu tarayıcı web push bildirimini desteklemiyor.');
      const permission=await Notification.requestPermission();
      if(permission!=='granted') throw new Error('Bildirim izni verilmedi.');
      const reg=await navigator.serviceWorker.ready;
      let sub=await reg.pushManager.getSubscription();
      if(!sub) sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:toUint8Array(VAPID_PUBLIC)});
      const json=sub.toJSON(); const keys=json.keys;
      if(!keys?.p256dh||!keys?.auth) throw new Error('Push anahtarları alınamadı.');
      await supabase.from('merve_push_subscriptions').delete().eq('endpoint',sub.endpoint);
      const {error}=await supabase.from('merve_push_subscriptions').insert({owner_email:OWNER,endpoint:sub.endpoint,p256dh:keys.p256dh,auth:keys.auth,user_agent:navigator.userAgent,last_used_at:new Date().toISOString()});
      if(error)throw error;
      setEnabled(true);setMessage('Bu cihazda bildirimler açıldı.');
    }catch(e:any){
      const ios=/iPad|iPhone|iPod/.test(navigator.userAgent);
      const standalone=window.matchMedia('(display-mode: standalone)').matches||Boolean((navigator as any).standalone);
      if(ios&&!standalone) setMessage('iPhone’da önce Paylaş → Ana Ekrana Ekle ile Tooldur’u uygulama olarak aç, sonra bildirimleri etkinleştir.');
      else setMessage(e?.message||'Bildirim açılamadı.');
    }finally{setBusy(false)}
  };

  if(!visible)return null;
  return <aside style={{position:'fixed',zIndex:1085,right:14,bottom:82,width:'min(360px,calc(100% - 28px))',padding:12,borderRadius:15,border:'1px solid rgba(255,177,27,.28)',background:'rgba(9,18,31,.97)',boxShadow:'0 20px 55px rgba(0,0,0,.35)',color:'#f8fafc',display:'grid',gridTemplateColumns:'auto 1fr auto',gap:10,alignItems:'center'}}>
    <div style={{width:38,height:38,borderRadius:11,display:'flex',alignItems:'center',justifyContent:'center',background:enabled?'rgba(34,197,94,.12)':'rgba(255,177,27,.12)',color:enabled?'#86efac':'#ffb11b'}}>{enabled?<BellRing size={19}/>:<Bell size={19}/>}</div>
    <div style={{minWidth:0}}><strong style={{fontSize:12.5,display:'block'}}>{enabled?'Bildirimler açık':'İndirim bildirimi'}</strong><span style={{display:'block',fontSize:10.5,lineHeight:1.45,color:'#9fb0c7',marginTop:2}}>{message|| (enabled?'Bu cihaz fırsat bildirimlerini alacak.':'Fiyat düşünce bu telefona bildirim gelsin.')}</span></div>
    {enabled?<button onClick={()=>setVisible(false)} aria-label='Kapat' style={{width:30,height:30,borderRadius:8,border:'1px solid rgba(148,163,184,.18)',background:'transparent',color:'#94a3b8',display:'flex',alignItems:'center',justifyContent:'center'}}><X size={15}/></button>:<button disabled={busy} onClick={enable} style={{minHeight:34,padding:'0 10px',border:0,borderRadius:9,background:'#ffb11b',color:'#07111f',fontSize:10.5,fontWeight:850,cursor:'pointer'}}>{busy?'Açılıyor…':'Aç'}</button>}
  </aside>;
}
