'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Bell, ChevronDown, ExternalLink, Plus, Settings2, Store, Tag, Trash2 } from 'lucide-react';
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
  const [productLimit,setProductLimit]=useState(24);

  const siteMap=useMemo(()=>Object.fromEntries(sites.map(s=>[s.id,s.name])),[sites]);
  const categoryMap=useMemo(()=>Object.fromEntries(categories.map(c=>[c.id,c.name])),[categories]);
  const sectionCategories=useMemo(()=>categories.filter(c=>belongs(c.id,section)),[categories,section]);
  const visibleRules=useMemo(()=>rules.filter(r=>belongs(r.category_id,section)),[rules,section]);
  const sortedProducts=useMemo(()=>products.filter(p=>belongs(p.category_id,section)).sort((a,b)=>{
    const discountDiff=Number(b.discount_percent||0)-Number(a.discount_percent||0);
    if(discountDiff!==0)return discountDiff;
    return Number(a.current_price||Number.MAX_SAFE_INTEGER)-Number(b.current_price||Number.MAX_SAFE_INTEGER);
  }),[products,section]);
  const visibleProducts=useMemo(()=>sortedProducts.slice(0,productLimit),[sortedProducts,productLimit]);
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
    setSection(next);setCategoryId(sectionDefaultCategory[next]);setMinDiscount(20);setMessage('');setError('');setProductLimit(24);
    window.scrollTo({top:0,behavior:'smooth'});
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
  const lastScanText=lastScan?new Date(lastScan.started_at).toLocaleString('tr-TR',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'}):'—';
  const heroText=section==='oguzhan'?'Erkek giyim · XL · gerçek fiyat düşüşü':section==='ege'?'Erkek çocuk · 4+ yaş · gerçek fiyat düşüşü':'Kadın giyim L/XL + kozmetik · gerçek fiyat düşüşü';

  return <main className={styles.page}><div className={styles.shell}>
    <section className={styles.hero}>
      <div><div className={styles.eyebrow}>{sectionTitle[section]} İndirim</div><h1 className={styles.title}>İndirim Takip</h1><p className={styles.subtitle}>{heroText}</p></div>
      <div className={styles.status}><span className={styles.dot}/><span>{settings.scan_interval_minutes} dk · son {lastScanText}</span></div>
    </section>

    <nav className={styles.profileTabs}>
      {(['merve','oguzhan','ege'] as Section[]).map(x=><button key={x} onClick={()=>changeSection(x)} className={`${styles.profileTab} ${section===x?styles.profileTabActive:''}`}>{sectionTitle[x]}</button>)}
    </nav>

    <section className={styles.compactStats}>
      <div><span>Ürün</span><strong>{sortedProducts.length}</strong></div>
      <div><span>Düşüş</span><strong>{realDrops}</strong></div>
      <div><span>Kural</span><strong>{activeRules}</strong></div>
      <div><span>Son tarama</span><strong>{lastScan?new Date(lastScan.started_at).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'}):'—'}</strong></div>
    </section>

    <section className={`${styles.card} ${styles.productsCard}`}>
      <div className={styles.cardHead}><div><div className={styles.cardTitle}><Store size={16}/> Fiyat takibi</div><div className={styles.muted}>Gerçek düşüş yüksekten düşüğe · ilk {Math.min(productLimit,sortedProducts.length)} / {sortedProducts.length}</div></div></div>
      <div className={styles.productList}>{sortedProducts.length===0?<div className={styles.empty}>Tarama sonrası ürünler burada görünecek.</div>:visibleProducts.map(p=><a key={p.id} href={p.url} target='_blank' rel='noreferrer' className={styles.product}><div className={styles.productMain}><div className={styles.productTitle}>{p.title}</div><div className={styles.productMeta}>{siteMap[p.site_id]||p.site_id} · {p.current_price?`${Number(p.current_price).toLocaleString('tr-TR')} TL`:'Fiyat yok'}{p.original_price?` · önce ${Number(p.original_price).toLocaleString('tr-TR')} TL`:''}</div></div><div className={styles.discount}>{Number(p.discount_percent||0)>0?`-%${Math.round(Number(p.discount_percent))}`:<ExternalLink size={15}/>}</div></a>)}</div>
      {productLimit<sortedProducts.length&&<button className={styles.moreButton} onClick={()=>setProductLimit(v=>Math.min(v+24,sortedProducts.length))}>24 ürün daha göster</button>}
    </section>

    <div className={styles.toolsGrid}>
      <details className={styles.collapse}>
        <summary><span><Settings2 size={16}/> Yönetim</span><span className={styles.summaryMeta}>{visibleRules.length} kural <ChevronDown size={16}/></span></summary>
        <div className={styles.collapseBody}>
          <div className={styles.sectionLabel}><Plus size={15}/> Yeni takip kuralı</div>
          <div className={styles.formGrid}>
            <label className={styles.field}><span className={styles.label}>Kategori</span><select className={styles.select} value={categoryId} onChange={e=>{setCategoryId(e.target.value);const c=categories.find(x=>x.id===e.target.value);if(c)setMinDiscount(Number(c.min_discount_percent));}}>{sectionCategories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
            <label className={styles.field}><span className={styles.label}>Mağaza</span><select className={styles.select} value={siteId} onChange={e=>setSiteId(e.target.value)}>{sites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
            <label className={`${styles.field} ${styles.fieldFull}`}><span className={styles.label}>Kategori URL</span><input className={styles.input} type='url' value={categoryUrl} onChange={e=>setCategoryUrl(e.target.value)} placeholder='https://www.site.com/kategori/...'/></label>
            <label className={styles.field}><span className={styles.label}>Gerçek düşüş eşiği (%)</span><input className={styles.input} type='number' min={1} max={95} value={minDiscount} onChange={e=>setMinDiscount(Number(e.target.value)||1)}/></label>
            <div className={styles.field}><button className={styles.button} onClick={addRule} disabled={saving}>{saving?'Ekleniyor…':'Takibe Ekle'}</button></div>
          </div>
          {error&&<div className={styles.error}>{error}</div>}{message&&<div className={styles.success}>{message}</div>}
          <div className={styles.sectionLabel}><Tag size={15}/> Takip kuralları</div>
          <div className={styles.rules}>{loading?<div className={styles.empty}>Yükleniyor…</div>:visibleRules.length===0?<div className={styles.empty}>Bu sekmede takip kuralı yok.</div>:visibleRules.map(rule=><div className={styles.rule} key={rule.id}>
            <div className={styles.ruleTop}><div><div className={styles.ruleName}>{categoryMap[rule.category_id]||rule.category_id} · {siteMap[rule.site_id]||rule.site_id}</div><div className={styles.ruleMeta}>%{Number(rule.min_discount_percent)} gerçek düşüş ve üzeri</div></div><button aria-label='Kuralı aç/kapat' className={`${styles.switch} ${rule.enabled?styles.switchOn:''}`} onClick={()=>toggleRule(rule)}><span className={styles.switchKnob}/></button></div>
            <div className={styles.ruleUrl}>{rule.category_url||'Kategori URL yok'}</div><div className={styles.chips}><span className={`${styles.chip} ${rule.notify?styles.chipOn:''}`}>{rule.notify?'Bildirim açık':'Bildirim kapalı'}</span><button className={`${styles.ghost} ${styles.danger}`} onClick={()=>removeRule(rule.id)}><Trash2 size={12}/> Sil</button></div>
          </div>)}</div>
        </div>
      </details>

      <details className={styles.collapse}>
        <summary><span><Bell size={16}/> Bildirim ayarları</span><span className={styles.summaryMeta}>{settings.notifications_enabled?'Açık':'Kapalı'} <ChevronDown size={16}/></span></summary>
        <div className={styles.collapseBody}>
          <div className={styles.settingsRow}><div><div className={styles.settingsName}>Bildirimler</div><div className={styles.muted}>Gerçek fiyat düşüşlerini bildir</div></div><button className={`${styles.switch} ${settings.notifications_enabled?styles.switchOn:''}`} onClick={()=>updateSettings({notifications_enabled:!settings.notifications_enabled})}><span className={styles.switchKnob}/></button></div>
          <div className={styles.settingsRow}><div><div className={styles.settingsName}>Toplu bildirim</div><div className={styles.muted}>Aynı taramadaki fırsatları grupla</div></div><button className={`${styles.switch} ${settings.digest_mode?styles.switchOn:''}`} onClick={()=>updateSettings({digest_mode:!settings.digest_mode})}><span className={styles.switchKnob}/></button></div>
          <div className={styles.settingsRow}><div><div className={styles.settingsName}>Genel eşik</div><div className={styles.muted}>Varsayılan gerçek düşüş</div></div><div className={styles.row}><input className={styles.input} style={{width:72}} type='number' min={1} max={95} value={settings.min_discount_percent} onChange={e=>setSettings({...settings,min_discount_percent:Number(e.target.value)||1})} onBlur={()=>updateSettings({min_discount_percent:settings.min_discount_percent})}/><span className={styles.muted}>%</span></div></div>
        </div>
      </details>

      <details className={styles.collapse}>
        <summary><span><Activity size={16}/> Tarama geçmişi</span><span className={styles.summaryMeta}>{lastScan?.status||'—'} <ChevronDown size={16}/></span></summary>
        <div className={styles.collapseBody}>
          <div className={styles.notice}>Saatlik tarama aktif. Yalnız bizim gördüğümüz fiyatın gerçekten düşmesi fırsat sayılır.</div>
          <div className={styles.rules}>{visibleLogs.length===0?<div className={styles.empty}>Henüz tarama kaydı yok.</div>:visibleLogs.map(log=><div className={styles.rule} key={log.id}><div className={styles.ruleTop}><div className={styles.ruleName}>{log.status}</div><div className={styles.ruleMeta}>{new Date(log.started_at).toLocaleString('tr-TR')}</div></div><div className={styles.ruleMeta}>{log.scanned_count} ürün · {log.changed_count} değişim · {log.notified_count} bildirim</div>{log.error_message&&<div className={styles.error}>{log.error_message}</div>}</div>)}</div>
        </div>
      </details>
    </div>
  </div></main>;
}