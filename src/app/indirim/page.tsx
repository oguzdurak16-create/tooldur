'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Bell, ChevronDown, ExternalLink, Plus, RefreshCw, Search, Settings2, SlidersHorizontal, Sparkles, Store, Tag, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './Indirim.module.css';

const OWNER = 'm.egedurak@gmail.com';
const ALLOWED = new Set(['m.egedurak@gmail.com', 'oguzdurak16@gmail.com']);
type Section='merve'|'oguzhan'|'ege';

type Category = { id:string; name:string; enabled:boolean; min_discount_percent:number };
type Site = { id:string; name:string; base_url:string; enabled:boolean };
type Rule = { id:string; category_id:string; site_id:string; category_url:string|null; min_discount_percent:number; notify:boolean; enabled:boolean };
type Product = { id:string; title:string; brand:string|null; image_url:string|null; site_id:string; category_id:string; current_price:number|null; original_price:number|null; discount_percent:number|null; in_stock:boolean|null; url:string };
type SmartProduct = Product & { interest:string; smart:boolean };
type Settings = { min_discount_percent:number; notifications_enabled:boolean; digest_mode:boolean; scan_interval_minutes:number };
type ScanLog = { id:number; status:string; scanned_count:number; changed_count:number; notified_count:number; started_at:string; error_message:string|null };

const sectionTitle:Record<Section,string>={merve:'Merve',oguzhan:'Oğuzhan',ege:'Ege'};
const sectionDefaultCategory:Record<Section,string>={merve:'kadin-giyim',oguzhan:'erkek-giyim',ege:'cocuk'};
const belongs=(categoryId:string,section:Section)=>section==='oguzhan'?categoryId==='erkek-giyim':section==='ege'?categoryId==='cocuk':categoryId!=='erkek-giyim'&&categoryId!=='cocuk';
const smartSources:Record<Section,{key:string;interest:string;site:string;category:string}[]>={
  merve:[
    {key:'gratis-bakim',interest:'Kişisel bakım',site:'gratis',category:'kozmetik'},
    {key:'amazon-ev-bakim',interest:'Ev & temizlik',site:'amazon-tr',category:'kozmetik'},
  ],
  oguzhan:[
    {key:'amazon-elektronik',interest:'Elektronik',site:'amazon-tr',category:'erkek-giyim'},
    {key:'amazon-arac',interest:'Araç bakım & aksesuar',site:'amazon-tr',category:'erkek-giyim'},
    {key:'gratis-erkek-bakim',interest:'Erkek bakım',site:'gratis',category:'erkek-giyim'},
  ],
  ege:[
    {key:'ebebek-bakim',interest:'Banyo & hijyen',site:'ebebek',category:'cocuk'},
  ],
};

export default function IndirimPage(){
  const router = useRouter();
  const [authReady,setAuthReady]=useState(false);
  const [allowed,setAllowed]=useState(false);
  const [loading,setLoading]=useState(true);
  const [refreshing,setRefreshing]=useState(false);
  const [section,setSection]=useState<Section>('merve');
  const [categories,setCategories]=useState<Category[]>([]);
  const [sites,setSites]=useState<Site[]>([]);
  const [rules,setRules]=useState<Rule[]>([]);
  const [products,setProducts]=useState<Product[]>([]);
  const [smartProducts,setSmartProducts]=useState<SmartProduct[]>([]);
  const [smartLoading,setSmartLoading]=useState(false);
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
  const [storeFilter,setStoreFilter]=useState('all');
  const [dropsOnly,setDropsOnly]=useState(false);
  const [search,setSearch]=useState('');

  const siteMap=useMemo(()=>Object.fromEntries(sites.map(s=>[s.id,s.name])),[sites]);
  const categoryMap=useMemo(()=>Object.fromEntries(categories.map(c=>[c.id,c.name])),[categories]);
  const sectionCategories=useMemo(()=>categories.filter(c=>belongs(c.id,section)),[categories,section]);
  const visibleRules=useMemo(()=>rules.filter(r=>belongs(r.category_id,section)),[rules,section]);
  const sectionProducts=useMemo(()=>products.filter(p=>belongs(p.category_id,section)),[products,section]);
  const availableSiteIds=useMemo(()=>Array.from(new Set(sectionProducts.map(p=>p.site_id))).sort((a,b)=>(siteMap[a]||a).localeCompare(siteMap[b]||b,'tr')),[sectionProducts,siteMap]);
  const sortedProducts=useMemo(()=>{
    const q=search.trim().toLocaleLowerCase('tr-TR');
    return sectionProducts.filter(p=>storeFilter==='all'||p.site_id===storeFilter).filter(p=>!dropsOnly||Number(p.discount_percent||0)>0).filter(p=>!q||`${p.title} ${p.brand||''} ${siteMap[p.site_id]||p.site_id}`.toLocaleLowerCase('tr-TR').includes(q)).sort((a,b)=>Number(b.discount_percent||0)-Number(a.discount_percent||0)||Number(a.current_price||Number.MAX_SAFE_INTEGER)-Number(b.current_price||Number.MAX_SAFE_INTEGER));
  },[sectionProducts,storeFilter,dropsOnly,search,siteMap]);
  const visibleProducts=useMemo(()=>sortedProducts.slice(0,productLimit),[sortedProducts,productLimit]);
  const visibleSmart=useMemo(()=>smartProducts.filter(p=>p.category_id===sectionDefaultCategory[section]).sort((a,b)=>Number(b.discount_percent||0)-Number(a.discount_percent||0)||Number(a.current_price||99999999)-Number(b.current_price||99999999)).slice(0,30),[smartProducts,section]);
  const visibleLogs=useMemo(()=>logs,[logs]);

  useEffect(()=>{
    let mounted=true;
    supabase.auth.getSession().then(({data:{session}}:any)=>{
      if(!mounted)return;
      const email=(session?.user?.email||'').toLowerCase();
      if(!email){ router.replace('/giris?redirect=/indirim'); return; }
      setAllowed(ALLOWED.has(email));setAuthReady(true);
    }).catch(()=>setAuthReady(true));
    return()=>{mounted=false};
  },[router]);

  const load=async(silent=false)=>{
    if(!silent){setLoading(true);setError('');}
    const [c,s,r,p,st,l]=await Promise.all([
      supabase.from('merve_categories').select('id,name,enabled,min_discount_percent').order('name'),
      supabase.from('merve_sites').select('id,name,base_url,enabled').order('name'),
      supabase.from('merve_tracking_rules').select('id,category_id,site_id,category_url,min_discount_percent,notify,enabled').order('created_at',{ascending:false}),
      supabase.from('merve_products').select('id,title,brand,image_url,site_id,category_id,current_price,original_price,discount_percent,in_stock,url').order('discount_percent',{ascending:false,nullsFirst:false}).order('current_price',{ascending:true,nullsFirst:false}).limit(500),
      supabase.from('merve_app_settings').select('min_discount_percent,notifications_enabled,digest_mode,scan_interval_minutes').eq('owner_email',OWNER).maybeSingle(),
      supabase.from('merve_scan_logs').select('id,status,scanned_count,changed_count,notified_count,started_at,error_message').order('started_at',{ascending:false}).limit(18),
    ]);
    const firstError=[c,s,r,p,st,l].find((x:any)=>x.error)?.error;if(firstError)setError(firstError.message||'Veriler alınamadı.');
    setCategories((c.data||[]) as Category[]);setSites((s.data||[]) as Site[]);setRules((r.data||[]) as Rule[]);setProducts((p.data||[]) as Product[]);setLogs((l.data||[]) as ScanLog[]);if(st.data)setSettings(st.data as Settings);if(!silent)setLoading(false);
  };

  const loadSmart=async()=>{
    setSmartLoading(true);
    const snapshotKey='tooldur-indirim-smart-price-v1';
    let snapshots:Record<string,number>={};
    try{snapshots=JSON.parse(localStorage.getItem(snapshotKey)||'{}')}catch{}
    const nextSnapshots={...snapshots};
    const rows:SmartProduct[]=[];
    await Promise.all((Object.keys(smartSources) as Section[]).flatMap(sec=>smartSources[sec].map(async src=>{
      try{
        const res=await fetch(`/api/indirim/store/${src.key}`,{cache:'no-store'});const data=await res.json();
        if(!data?.ok||!Array.isArray(data.products))return;
        data.products.slice(0,40).forEach((raw:any,i:number)=>{
          const current=Number(raw.current_price||0);if(!current||!raw.url)return;
          const old=Number(snapshots[raw.url]||0);const realDrop=old>current?Math.round((1-current/old)*10000)/100:0;
          nextSnapshots[raw.url]=current;
          rows.push({id:`smart-${src.key}-${raw.external_id||i}`,title:String(raw.title||''),brand:raw.brand||null,image_url:raw.image_url||null,site_id:src.site,category_id:src.category,current_price:current,original_price:old>current?old:null,discount_percent:realDrop,in_stock:raw.in_stock??null,url:String(raw.url),interest:src.interest,smart:true});
        });
      }catch{}
    })));
    try{localStorage.setItem(snapshotKey,JSON.stringify(nextSnapshots))}catch{}
    setSmartProducts(rows);setSmartLoading(false);
  };

  const refreshNow=async()=>{setRefreshing(true);await Promise.all([load(true),loadSmart()]);setRefreshing(false);};

  useEffect(()=>{
    if(!authReady||!allowed)return;
    void load();void loadSmart();
    const refresh=()=>{void load(true);void loadSmart();};
    const timer=window.setInterval(refresh,30000);
    const onVisibility=()=>{if(document.visibilityState==='visible')refresh();};
    window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',onVisibility);
    return()=>{window.clearInterval(timer);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',onVisibility);};
  },[authReady,allowed]);

  const changeSection=(next:Section)=>{setSection(next);setCategoryId(sectionDefaultCategory[next]);setMinDiscount(20);setMessage('');setError('');setProductLimit(24);setStoreFilter('all');setDropsOnly(false);setSearch('');window.scrollTo({top:0,behavior:'smooth'});};
  const addRule=async()=>{setMessage('');setError('');if(!categoryUrl.trim()){setError('Kategori sayfası bağlantısını yapıştır.');return;}setSaving(true);const {error:e}=await supabase.from('merve_tracking_rules').insert({owner_email:OWNER,category_id:categoryId,site_id:siteId,category_url:categoryUrl.trim(),min_discount_percent:minDiscount,notify:true,enabled:true});setSaving(false);if(e){setError(e.message);return;}setCategoryUrl('');setMessage('Takip kuralı eklendi.');await load();};
  const toggleRule=async(rule:Rule)=>{const {error:e}=await supabase.from('merve_tracking_rules').update({enabled:!rule.enabled,updated_at:new Date().toISOString()}).eq('id',rule.id);if(e){setError(e.message);return;}await load();};
  const removeRule=async(id:string)=>{const {error:e}=await supabase.from('merve_tracking_rules').delete().eq('id',id);if(e){setError(e.message);return;}await load();};
  const updateSettings=async(patch:Partial<Settings>)=>{const next={...settings,...patch};setSettings(next);const {error:e}=await supabase.from('merve_app_settings').update({...patch,updated_at:new Date().toISOString()}).eq('owner_email',OWNER);if(e){setError(e.message);await load();}};

  if(!authReady)return <main className={styles.page}><div className={styles.shell}><div className={styles.empty}>Giriş kontrol ediliyor…</div></div></main>;
  if(!allowed)return <main className={`${styles.page} ${styles.denied}`}><div className={styles.deniedCard}><Tag size={28}/><h1>Erişim yok</h1><p className={styles.muted}>Bu alan yalnızca yetkilendirilmiş hesaplara açık.</p></div></main>;

  const activeRules=visibleRules.filter(r=>r.enabled).length;const realDrops=sectionProducts.filter(p=>Number(p.discount_percent||0)>0).length;const lastScan=visibleLogs[0];const lastScanText=lastScan?new Date(lastScan.started_at).toLocaleString('tr-TR',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'}):'—';
  const heroText=section==='oguzhan'?'XL giyim · elektronik · araç bakım · erkek bakım':section==='ege'?'4+ erkek çocuk · banyo · hijyen · bakım':'L/XL giyim · kişisel bakım · kozmetik · ev bakım';
  const renderProduct=(p:Product&{interest?:string})=>{const hasDrop=Number(p.discount_percent||0)>0;const previous=Number(p.original_price||0);const current=Number(p.current_price||0);return <a key={p.id} href={p.url} target='_blank' rel='noreferrer' className={styles.product}><div className={styles.productImageWrap}>{p.image_url?<img src={p.image_url} alt='' loading='lazy' className={styles.productImage} onError={e=>{e.currentTarget.style.visibility='hidden'}}/>:<span className={styles.imageFallback}><Store size={18}/></span>}</div><div className={styles.productMain}><div className={styles.productBadges}><span className={styles.storeBadge}>{siteMap[p.site_id]||p.site_id}</span>{p.interest&&<span className={styles.interestBadge}>{p.interest}</span>}{p.brand&&<span className={styles.brandBadge}>{p.brand}</span>}{p.in_stock===false&&<span className={styles.outBadge}>Stok yok</span>}</div><div className={styles.productTitle}>{p.title}</div><div className={styles.priceRow}><strong>{current?`${current.toLocaleString('tr-TR')} TL`:'Fiyat yok'}</strong>{hasDrop&&previous>current&&<span>{previous.toLocaleString('tr-TR')} TL</span>}</div></div><div className={`${styles.discount} ${hasDrop?styles.discountActive:''}`}>{hasDrop?`-%${Math.round(Number(p.discount_percent))}`:<ExternalLink size={16}/>}</div></a>};

  return <main className={styles.page}><div className={styles.shell}>
    <section className={styles.hero}><div><div className={styles.eyebrow}>{sectionTitle[section]} İndirim</div><h1 className={styles.title}>İndirim Takip</h1><p className={styles.subtitle}>{heroText}</p></div><div className={styles.status}><span className={styles.dot}/><span>{settings.scan_interval_minutes} dk · son {lastScanText}</span></div></section>
    <nav className={styles.profileTabs}>{(['merve','oguzhan','ege'] as Section[]).map(x=><button key={x} onClick={()=>changeSection(x)} className={`${styles.profileTab} ${section===x?styles.profileTabActive:''}`}>{sectionTitle[x]}</button>)}</nav>
    <section className={styles.compactStats}><div><span>Takip</span><strong>{sectionProducts.length}</strong></div><div><span>Düşüş</span><strong>{realDrops}</strong></div><div><span>Günlük ihtiyaç</span><strong>{visibleSmart.length}</strong></div><div><span>Son tarama</span><strong>{lastScan?new Date(lastScan.started_at).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'}):'—'}</strong></div></section>

    <section className={`${styles.card} ${styles.smartCard}`}><div className={styles.cardHead}><div><div className={styles.cardTitle}><Sparkles size={16}/> Mantıklı fırsatlar</div><div className={styles.muted}>Tekstil dışı · ilk fiyat referans, sonraki gerçek düşüşler yeşil görünür</div></div><button className={styles.refreshButton} onClick={refreshNow} disabled={refreshing||smartLoading}><RefreshCw size={16} className={(refreshing||smartLoading)?styles.spin:''}/></button></div><div className={styles.smartChips}>{smartSources[section].map(x=><span key={x.key}>{x.interest}</span>)}</div><div className={styles.productList}>{smartLoading&&visibleSmart.length===0?<div className={styles.empty}>Günlük ihtiyaçlar taranıyor…</div>:visibleSmart.length===0?<div className={styles.empty}>Bu kaynaklardan ürün alınamadı.</div>:visibleSmart.map(renderProduct)}</div></section>

    <section className={`${styles.card} ${styles.productsCard}`}><div className={styles.cardHead}><div><div className={styles.cardTitle}><Store size={16}/> Ana fiyat takibi</div><div className={styles.muted}>Gerçek düşüş yüksekten düşüğe · {sortedProducts.length} sonuç</div></div><button className={styles.refreshButton} onClick={refreshNow} disabled={refreshing}><RefreshCw size={16} className={refreshing?styles.spin:''}/></button></div><div className={styles.filterBar}><label className={styles.searchBox}><Search size={15}/><input value={search} onChange={e=>{setSearch(e.target.value);setProductLimit(24)}} placeholder='Ürün ara'/></label><select className={styles.storeSelect} value={storeFilter} onChange={e=>{setStoreFilter(e.target.value);setProductLimit(24)}}><option value='all'>Tüm mağazalar</option>{availableSiteIds.map(id=><option key={id} value={id}>{siteMap[id]||id}</option>)}</select><button className={`${styles.dropToggle} ${dropsOnly?styles.dropToggleActive:''}`} onClick={()=>{setDropsOnly(v=>!v);setProductLimit(24)}}><SlidersHorizontal size={14}/> {dropsOnly?'Ucuzlayanlar':'Tümü'}</button></div><div className={styles.productList}>{sortedProducts.length===0?<div className={styles.empty}>Bu filtrede ürün yok.</div>:visibleProducts.map(renderProduct)}</div>{productLimit<sortedProducts.length&&<button className={styles.moreButton} onClick={()=>setProductLimit(v=>Math.min(v+24,sortedProducts.length))}>24 ürün daha göster</button>}</section>

    <div className={styles.toolsGrid}>
      <details className={styles.collapse}><summary><span><Settings2 size={16}/> Yönetim</span><span className={styles.summaryMeta}>{visibleRules.length} kural <ChevronDown size={16}/></span></summary><div className={styles.collapseBody}><div className={styles.sectionLabel}><Plus size={15}/> Yeni takip kuralı</div><div className={styles.formGrid}><label className={styles.field}><span className={styles.label}>Kategori</span><select className={styles.select} value={categoryId} onChange={e=>{setCategoryId(e.target.value);const c=categories.find(x=>x.id===e.target.value);if(c)setMinDiscount(Number(c.min_discount_percent));}}>{sectionCategories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label className={styles.field}><span className={styles.label}>Mağaza</span><select className={styles.select} value={siteId} onChange={e=>setSiteId(e.target.value)}>{sites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><label className={`${styles.field} ${styles.fieldFull}`}><span className={styles.label}>Kategori URL</span><input className={styles.input} type='url' value={categoryUrl} onChange={e=>setCategoryUrl(e.target.value)} placeholder='https://www.site.com/kategori/...'/></label><label className={styles.field}><span className={styles.label}>Gerçek düşüş eşiği (%)</span><input className={styles.input} type='number' min={1} max={95} value={minDiscount} onChange={e=>setMinDiscount(Number(e.target.value)||1)}/></label><div className={styles.field}><button className={styles.button} onClick={addRule} disabled={saving}>{saving?'Ekleniyor…':'Takibe Ekle'}</button></div></div>{error&&<div className={styles.error}>{error}</div>}{message&&<div className={styles.success}>{message}</div>}<div className={styles.sectionLabel}><Tag size={15}/> Takip kuralları</div><div className={styles.rules}>{loading?<div className={styles.empty}>Yükleniyor…</div>:visibleRules.length===0?<div className={styles.empty}>Bu sekmede takip kuralı yok.</div>:visibleRules.map(rule=><div className={styles.rule} key={rule.id}><div className={styles.ruleTop}><div><div className={styles.ruleName}>{categoryMap[rule.category_id]||rule.category_id} · {siteMap[rule.site_id]||rule.site_id}</div><div className={styles.ruleMeta}>%{Number(rule.min_discount_percent)} gerçek düşüş ve üzeri</div></div><button className={`${styles.switch} ${rule.enabled?styles.switchOn:''}`} onClick={()=>toggleRule(rule)}><span className={styles.switchKnob}/></button></div><div className={styles.ruleUrl}>{rule.category_url||'Kategori URL yok'}</div><div className={styles.chips}><span className={`${styles.chip} ${rule.notify?styles.chipOn:''}`}>{rule.notify?'Bildirim açık':'Bildirim kapalı'}</span><button className={`${styles.ghost} ${styles.danger}`} onClick={()=>removeRule(rule.id)}><Trash2 size={12}/> Sil</button></div></div>)}</div></div></details>
      <details className={styles.collapse}><summary><span><Bell size={16}/> Bildirim ayarları</span><span className={styles.summaryMeta}>{settings.notifications_enabled?'Açık':'Kapalı'} <ChevronDown size={16}/></span></summary><div className={styles.collapseBody}><div className={styles.settingsRow}><div><div className={styles.settingsName}>Bildirimler</div><div className={styles.muted}>Gerçek fiyat düşüşlerini bildir</div></div><button className={`${styles.switch} ${settings.notifications_enabled?styles.switchOn:''}`} onClick={()=>updateSettings({notifications_enabled:!settings.notifications_enabled})}><span className={styles.switchKnob}/></button></div><div className={styles.settingsRow}><div><div className={styles.settingsName}>Toplu bildirim</div><div className={styles.muted}>Aynı taramadaki fırsatları grupla</div></div><button className={`${styles.switch} ${settings.digest_mode?styles.switchOn:''}`} onClick={()=>updateSettings({digest_mode:!settings.digest_mode})}><span className={styles.switchKnob}/></button></div><div className={styles.settingsRow}><div><div className={styles.settingsName}>Genel eşik</div><div className={styles.muted}>Varsayılan gerçek düşüş</div></div><div className={styles.row}><input className={styles.input} style={{width:72}} type='number' min={1} max={95} value={settings.min_discount_percent} onChange={e=>setSettings({...settings,min_discount_percent:Number(e.target.value)||1})} onBlur={()=>updateSettings({min_discount_percent:settings.min_discount_percent})}/><span className={styles.muted}>%</span></div></div></div></details>
      <details className={styles.collapse}><summary><span><Activity size={16}/> Tarama geçmişi</span><span className={styles.summaryMeta}>{lastScan?.status||'—'} <ChevronDown size={16}/></span></summary><div className={styles.collapseBody}><div className={styles.notice}>Saatlik ana tarama aktif. Mantıklı fırsatlar da uygulama açıkken güncellenir; ilk görülen fiyat referans alınır.</div><div className={styles.rules}>{visibleLogs.length===0?<div className={styles.empty}>Henüz tarama kaydı yok.</div>:visibleLogs.map(log=><div className={styles.rule} key={log.id}><div className={styles.ruleTop}><div className={styles.ruleName}>{log.status}</div><div className={styles.ruleMeta}>{new Date(log.started_at).toLocaleString('tr-TR')}</div></div><div className={styles.ruleMeta}>{log.scanned_count} ürün · {log.changed_count} değişim · {log.notified_count} bildirim</div>{log.error_message&&<div className={styles.error}>{log.error_message}</div>}</div>)}</div></div></details>
    </div>
  </div></main>;
}
