'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Bell, ExternalLink, Plus, Store, Tag, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './Indirim.module.css';

const OWNER = 'm.egedurak@gmail.com';
const ALLOWED = new Set(['m.egedurak@gmail.com', 'oguzdurak16@gmail.com']);
type Section='merve'|'oguzhan'|'ege';

type Category = { id:string; name:string; enabled:boolean; min_discount_percent:number };
type Site = { id:string; name:string; base_url:string; enabled:boolean };
type Rule = { id:string; category_id:string; site_id:string; category_url:string|null; min_discount_percent:number; notify:boolean; enabled:boolean };
type Product = { id:string; title:string; site_id:string; category_id:string; current_price:number|null; original_price:number|null; discount_percent:number|null; url:string };
type Settings = { min_discount_percent:number; notifications_enabled:boolean; digest_mode:boolean; scan_interval_minutes:number };
type ScanLog = { id:number; status:string; scanned_count:number; changed_count:number; notified_count:number; started_at:string; error_message:string|null };

const sectionTitle:Record<Section,string>={merve:'Merve',oguzhan:'Oğuzhan',ege:'Ege'};
const sectionDefaultCategory:Record<Section,string>={merve:'kadin-giyim',oguzhan:'erkek-giyim',ege:'cocuk'};
const belongs=(categoryId:string,section:Section)=>section==='oguzhan'?categoryId==='erkek-giyim':section==='ege'?categoryId==='cocuk':categoryId!=='erkek-giyim'&&categoryId!=='cocuk';

export default function IndirimPage(){
  const router = useRouter();
  const [authReady,setAuthReady]=useState(false);
  const [allowed,setAllowed]=useState(false);
  const [loading,setLoading]=useState(true);
  const [section,setSection]=useState<Section>('merve');
  const [categories,setCategories]=useState<Category[]>([]);
  const [sites,setSites]=useState<Site[]>([]);
  const [rules,setRules]=useState<Rule[]>([]);
  const [products,setProducts]=useState<Product[]>([]);
  const [logs,setLogs]=useState<ScanLog[]>([]);
  const [settings,setSettings]=useState<Settings>({min_discount_percent:20,notifications_enabled:true,digest_mode:true,scan_interval_minutes:60});
  const [categoryId,setCategoryId]=useState('kadin-giyim');
  const [siteId,setSiteId]=useState('trendyol');
  const [categoryUrl,setCategoryUrl]=useState('');
  const [minDiscount,setMinDiscount]=useState(20);
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');

  const siteMap=useMemo(()=>Object.fromEntries(sites.map(s=>[s.id,s.name])),[sites]);
  const categoryMap=useMemo(()=>Object.fromEntries(categories.map(c=>[c.id,c.name])),[categories]);
  const sectionCategories=useMemo(()=>categories.filter(c=>belongs(c.id,section)),[categories,section]);
  const visibleRules=useMemo(()=>rules.filter(r=>belongs(r.category_id,section)),[rules,section]);
  const sortedProducts=useMemo(()=>products.filter(p=>belongs(p.category_id,section)).sort((a,b)=>{
    const discountDiff=Number(b.discount_percent||0)-Number(a.discount_percent||0);
    if(discountDiff!==0)return discountDiff;
    return Number(a.current_price||Number.MAX_SAFE_INTEGER)-Number(b.current_price||Number.MAX_SAFE_INTEGER);
  }),[products,section]);
  const visibleLogs=useMemo(()=>logs,[logs]);

  useEffect(()=>{
    let mounted=true;
    supabase.auth.getSession().then(({data:{session}}:any)=>{
      if(!mounted)return;
      const email=(session?.user?.email||'').toLowerCase();
      if(!email){ router.replace('/giris?redirect=/indirim'); return; }
      setAllowed(ALLOWED.has(email));
      setAuthReady(true);
    }).catch(()=>setAuthReady(true));
    return()=>{mounted=false};
  },[router]);

  const load=async(silent=false)=>{
    if(!silent){ setLoading(true); setError(''); }
    const [c,s,r,p,st,l]=await Promise.all([
      supabase.from('merve_categories').select('id,name,enabled,min_discount_percent').order('name'),
      supabase.from('merve_sites').select('id,name,base_url,enabled').order('name'),
      supabase.from('merve_tracking_rules').select('id,category_id,site_id,category_url,min_discount_percent,notify,enabled').order('created_at',{ascending:false}),
      supabase.from('merve_products').select('id,title,site_id,category_id,current_price,original_price,discount_percent,url').order('discount_percent',{ascending:false,nullsFirst:false}).order('current_price',{ascending:true,nullsFirst:false}).limit(500),
      supabase.from('merve_app_settings').select('min_discount_percent,notifications_enabled,digest_mode,scan_interval_minutes').eq('owner_email',OWNER).maybeSingle(),
      supabase.from('merve_scan_logs').select('id,status,scanned_count,changed_count,notified_count,started_at,error_message').order('started_at',{ascending:false}).limit(18),
    ]);
    const firstError=[c,s,r,p,st,l].find((x:any)=>x.error)?.error;
    if(firstError) setError(firstError.message||'Veriler alınamadı.');
    setCategories((c.data||[]) as Category[]); setSites((s.data||[]) as Site[]); setRules((r.data||[]) as Rule[]);
    setProducts((p.data||[]) as Product[]); setLogs((l.data||[]) as ScanLog[]);
    if(st.data) setSettings(st.data as Settings);
    if(!silent) setLoading(false);
  };

  useEffect(()=>{
    if(!authReady||!allowed) return;
    void load();
    const refresh=()=>{ void load(true); };
    const timer=window.setInterval(refresh,30000);
    const onVisibility=()=>{ if(document.visibilityState==='visible') refresh(); };
    window.addEventListener('focus',refresh);
    document.addEventListener('visibilitychange',onVisibility);
    return()=>{
      window.clearInterval(timer);
      window.removeEventListener('focus',refresh);
      document.removeEventListener('visibilitychange',onVisibility);
    };
  },[authReady,allowed]);

  const changeSection=(next:Section)=>{
    setSection(next);setCategoryId(sectionDefaultCategory[next]);setMinDiscount(20);setMessage('');setError('');
  };

  const addRule=async()=>{
    setMessage('');setError('');
    if(!categoryUrl.trim()){setError('Kategori sayfası bağlantısını yapıştır.');return;}
    setSaving(true);
    const {error:e}=await supabase.from('merve_tracking_rules').insert({owner_email:OWNER,category_id:categoryId,site_id:siteId,category_url:categoryUrl.trim(),min_discount_percent:minDiscount,notify:true,enabled:true});
    setSaving(false);
    if(e){setError(e.message);return;}
    setCategoryUrl('');setMessage('Takip kuralı eklendi.');await load();
  };

  const toggleRule=async(rule:Rule)=>{
    const {error:e}=await supabase.from('merve_tracking_rules').update({enabled:!rule.enabled,updated_at:new Date().toISOString()}).eq('id',rule.id);
    if(e){setError(e.message);return;} await load();
  };
  const removeRule=async(id:string)=>{
    const {error:e}=await supabase.from('merve_tracking_rules').delete().eq('id',id);
    if(e){setError(e.message);return;} await load();
  };
  const updateSettings=async(patch:Partial<Settings>)=>{
    const next={...settings,...patch}; setSettings(next);
    const {error:e}=await supabase.from('merve_app_settings').update({...patch,updated_at:new Date().toISOString()}).eq('owner_email',OWNER);
    if(e){setError(e.message);await load();}
  };

  if(!authReady) return <main className={styles.page}><div className={styles.shell}><div className={styles.empty}>Giriş kontrol ediliyor…</div></div></main>;
  if(!allowed) return <main className={`${styles.page} ${styles.denied}`}><div className={styles.deniedCard}><Tag size={28}/><h1>Erişim yok</h1><p className={styles.muted}>Bu alan yalnızca yetkilendirilmiş hesaplara açık.</p></div></main>;

  const activeRules=visibleRules.filter(r=>r.enabled).length;
  const realDrops=sortedProducts.filter(p=>Number(p.discount_percent||0)>0).length;
  const lastScan=visibleLogs[0];
  const heroText=section==='oguzhan'?'Erkek giyim fiyatlarını saatlik izle; mağaza indirim etiketine değil gerçek fiyat düşüşüne göre fırsatları gör.':section==='ege'?'Ege için yalnız erkek çocuk/bebek ürünlerini izle; kız ürünleri dışarıda kalır ve yalnız gerçek fiyat düşüşleri fırsat sayılır.':'Kadın giyim ve kozmetik ürünlerini izle; yalnız gerçekten ucuzlayan ürünleri öne çıkar.';

  return <main className={styles.page}><div className={styles.shell}>
    <section className={styles.hero}>
      <div><div className={styles.eyebrow}>{sectionTitle[section]} İndirim</div><h1 className={styles.title}>İndirim Takip</h1><p className={styles.subtitle}>{heroText}</p></div>
      <div className={styles.status}><span className={styles.dot}/><span>Tarama aralığı: {settings.scan_interval_minutes} dk</span></div>
    </section>

    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,margin:'0 0 16px'}}>
      {(['merve','oguzhan','ege'] as Section[]).map(x=><button key={x} onClick={()=>changeSection(x)} style={{border:'1px solid rgba(255,255,255,.12)',borderRadius:12,padding:'12px 10px',fontWeight:800,cursor:'pointer',background:section===x?'#f6c90e':'rgba(255,255,255,.04)',color:section===x?'#111':'inherit'}}>{sectionTitle[x]}</button>)}
    </div>

    <section className={styles.gridStats}>
      <div className={styles.stat}><div className={styles.statLabel}>Aktif kural</div><div className={styles.statValue}>{activeRules}</div></div>
      <div className={styles.stat}><div className={styles.statLabel}>Ürün</div><div className={styles.statValue}>{sortedProducts.length}</div></div>
      <div className={styles.stat}><div className={styles.statLabel}>Gerçek düşüş</div><div className={styles.statValue}>{realDrops}</div></div>
      <div className={styles.stat}><div className={styles.statLabel}>Son tarama</div><div className={styles.statValue} style={{fontSize:16}}>{lastScan?new Date(lastScan.started_at).toLocaleString('tr-TR',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'}):'—'}</div></div>
    </section>

    <div className={styles.layout}>
      <div>
        <section className={styles.card}>
          <div className={styles.cardHead}><div><div className={styles.cardTitle}><Plus size={16} style={{verticalAlign:'-3px',marginRight:7}}/>Yeni takip kuralı</div><div className={styles.muted}>{sectionTitle[section]} sekmesine yeni mağaza/kategori kaynağı ekle.</div></div></div>
          <div className={styles.formGrid}>
            <label className={styles.field}><span className={styles.label}>Kategori</span><select className={styles.select} value={categoryId} onChange={e=>{setCategoryId(e.target.value);const c=categories.find(x=>x.id===e.target.value);if(c)setMinDiscount(Number(c.min_discount_percent));}}>{sectionCategories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
            <label className={styles.field}><span className={styles.label}>Mağaza</span><select className={styles.select} value={siteId} onChange={e=>setSiteId(e.target.value)}>{sites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
            <label className={`${styles.field} ${styles.fieldFull}`}><span className={styles.label}>Kategori URL</span><input className={styles.input} type='url' value={categoryUrl} onChange={e=>setCategoryUrl(e.target.value)} placeholder='https://www.site.com/kategori/...'/></label>
            <label className={styles.field}><span className={styles.label}>Gerçek düşüş eşiği (%)</span><input className={styles.input} type='number' min={1} max={95} value={minDiscount} onChange={e=>setMinDiscount(Number(e.target.value)||1)}/></label>
            <div className={styles.field} style={{justifyContent:'flex-end'}}><button className={styles.button} onClick={addRule} disabled={saving}>{saving?'Ekleniyor…':'Takibe Ekle'}</button></div>
          </div>
          {error&&<div className={styles.error}>{error}</div>}{message&&<div className={styles.success}>{message}</div>}
        </section>

        <section className={styles.card}>
          <div className={styles.cardHead}><div><div className={styles.cardTitle}><Tag size={16} style={{verticalAlign:'-3px',marginRight:7}}/>Takip kuralları</div><div className={styles.muted}>{visibleRules.length} kural</div></div></div>
          <div className={styles.rules}>{loading?<div className={styles.empty}>Yükleniyor…</div>:visibleRules.length===0?<div className={styles.empty}>Bu sekmede henüz takip kuralı yok.</div>:visibleRules.map(rule=><div className={styles.rule} key={rule.id}>
            <div className={styles.ruleTop}><div style={{minWidth:0}}><div className={styles.ruleName}>{categoryMap[rule.category_id]||rule.category_id} · {siteMap[rule.site_id]||rule.site_id}</div><div className={styles.ruleMeta}>%{Number(rule.min_discount_percent)} gerçek fiyat düşüşü ve üzeri</div></div><button aria-label='Kuralı aç/kapat' className={`${styles.switch} ${rule.enabled?styles.switchOn:''}`} onClick={()=>toggleRule(rule)}><span className={styles.switchKnob}/></button></div>
            <div className={styles.ruleUrl}>{rule.category_url||'Kategori URL eklenmemiş'}</div>
            <div className={styles.chips}><span className={`${styles.chip} ${rule.notify?styles.chipOn:''}`}>{rule.notify?'Bildirim açık':'Bildirim kapalı'}</span><button className={`${styles.ghost} ${styles.danger}`} onClick={()=>removeRule(rule.id)}><Trash2 size={12} style={{verticalAlign:'-2px'}}/> Sil</button></div>
          </div>)}</div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHead}><div><div className={styles.cardTitle}><Store size={16} style={{verticalAlign:'-3px',marginRight:7}}/>En yüksek gerçek düşüşler</div><div className={styles.muted}>Önceki gördüğümüz fiyata göre yüksekten düşüğe</div></div></div>
          <div className={styles.productList}>{sortedProducts.length===0?<div className={styles.empty}>Tarama sonrası ürünler burada görünecek.</div>:sortedProducts.map(p=><a key={p.id} href={p.url} target='_blank' rel='noreferrer' className={styles.product} style={{textDecoration:'none',color:'inherit'}}><div style={{minWidth:0}}><div className={styles.productTitle}>{p.title}</div><div className={styles.productMeta}>{siteMap[p.site_id]||p.site_id} · {categoryMap[p.category_id]||p.category_id} · {p.current_price?`${Number(p.current_price).toLocaleString('tr-TR')} TL`:'Fiyat yok'}{p.original_price?` · Önce ${Number(p.original_price).toLocaleString('tr-TR')} TL`:''}</div></div><div className={styles.discount}>{Number(p.discount_percent||0)>0?`-%${Math.round(Number(p.discount_percent))}`:<ExternalLink size={15}/>}</div></a>)}</div>
        </section>
      </div>

      <aside>
        <section className={styles.card}>
          <div className={styles.cardHead}><div className={styles.cardTitle}><Bell size={16} style={{verticalAlign:'-3px',marginRight:7}}/>Bildirim ayarları</div></div>
          <div className={styles.settingsRow}><div><div className={styles.settingsName}>Bildirimler</div><div className={styles.muted}>Gerçek fiyat düşüşlerini bildir</div></div><button className={`${styles.switch} ${settings.notifications_enabled?styles.switchOn:''}`} onClick={()=>updateSettings({notifications_enabled:!settings.notifications_enabled})}><span className={styles.switchKnob}/></button></div>
          <div className={styles.settingsRow}><div><div className={styles.settingsName}>Toplu bildirim</div><div className={styles.muted}>Aynı taramadaki fırsatları grupla</div></div><button className={`${styles.switch} ${settings.digest_mode?styles.switchOn:''}`} onClick={()=>updateSettings({digest_mode:!settings.digest_mode})}><span className={styles.switchKnob}/></button></div>
          <div className={styles.settingsRow}><div><div className={styles.settingsName}>Genel eşik</div><div className={styles.muted}>Varsayılan gerçek düşüş</div></div><div className={styles.row}><input className={styles.input} style={{width:72}} type='number' min={1} max={95} value={settings.min_discount_percent} onChange={e=>setSettings({...settings,min_discount_percent:Number(e.target.value)||1})} onBlur={()=>updateSettings({min_discount_percent:settings.min_discount_percent})}/><span className={styles.muted}>%</span></div></div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHead}><div className={styles.cardTitle}><Activity size={16} style={{verticalAlign:'-3px',marginRight:7}}/>Tarama geçmişi</div></div>
          <div className={styles.notice}>Saatlik tarama aktif. Mağazanın kendi indirim etiketi bildirim sebebi değildir; yalnız bizim gözlemlediğimiz fiyatın düşmesi fırsat sayılır.</div>
          <div className={styles.rules}>{visibleLogs.length===0?<div className={styles.empty}>Henüz tarama kaydı yok.</div>:visibleLogs.map(log=><div className={styles.rule} key={log.id}><div className={styles.ruleName}>{log.status}</div><div className={styles.ruleMeta}>{new Date(log.started_at).toLocaleString('tr-TR')} · {log.scanned_count} ürün · {log.changed_count} değişim · {log.notified_count} bildirim</div>{log.error_message&&<div className={styles.error}>{log.error_message}</div>}</div>)}</div>
        </section>
      </aside>
    </div>
  </div></main>;
}