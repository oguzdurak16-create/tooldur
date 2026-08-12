'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Bell, ChevronDown, ExternalLink, Plus, RefreshCw, Search, Settings2, SlidersHorizontal, Sparkles, Store, Tag, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import styles from './Indirim.module.css';

const OWNER='m.egedurak@gmail.com';
const ALLOWED=new Set(['m.egedurak@gmail.com','oguzdurak16@gmail.com']);
type Section='merve'|'oguzhan'|'ege';
type Category={id:string;name:string;enabled:boolean;min_discount_percent:number};
type Site={id:string;name:string;base_url:string;enabled:boolean};
type Rule={id:string;category_id:string;site_id:string;category_url:string|null;min_discount_percent:number;notify:boolean;enabled:boolean};
type Meta={profile?:Section;interest?:string;source?:string;category_verified?:boolean;profile_verified?:boolean};
type Product={id:string;title:string;brand:string|null;image_url:string|null;site_id:string;category_id:string;current_price:number|null;original_price:number|null;discount_percent:number|null;in_stock:boolean|null;url:string;metadata?:Meta|null};
type Settings={min_discount_percent:number;notifications_enabled:boolean;digest_mode:boolean;scan_interval_minutes:number};
type ScanLog={id:number;status:string;scanned_count:number;changed_count:number;notified_count:number;started_at:string;error_message:string|null};

const sectionTitle:Record<Section,string>={merve:'Merve',oguzhan:'Oğuzhan',ege:'Ege'};
const sectionDefaultCategory:Record<Section,string>={merve:'kadin-giyim',oguzhan:'erkek-giyim',ege:'cocuk'};
const sectionCategoryIds:Record<Section,string[]>={
  merve:['kadin-giyim','kozmetik','ayakkabi','canta','ev-yasam','merve-bakim','merve-ev','merve-ayakkabi-canta'],
  oguzhan:['erkek-giyim','oguzhan-elektronik','oguzhan-pc-telefon','oguzhan-el-aletleri','oguzhan-arac','oguzhan-bakim'],
  ege:['cocuk','ege-bakim','ege-oyuncak','ege-beslenme','ege-kitap'],
};
const profileFromCategory=(id:string):Section|null=>{
  if(sectionCategoryIds.ege.includes(id)||id.startsWith('ege-'))return'ege';
  if(sectionCategoryIds.oguzhan.includes(id)||id.startsWith('oguzhan-'))return'oguzhan';
  if(sectionCategoryIds.merve.includes(id)||id.startsWith('merve-'))return'merve';
  return null;
};
const productProfile=(p:Product)=>p.metadata?.profile||profileFromCategory(p.category_id);
const isFamily=(p:Product)=>String(p.metadata?.source||'').startsWith('family-smart:');
const productKey=(p:Product)=>{
  try{const u=new URL(p.url);return `${p.site_id}|${u.origin}${u.pathname}`.toLocaleLowerCase('tr-TR').replace(/\/$/,'')}
  catch{return `${p.site_id}|${p.title}`.toLocaleLowerCase('tr-TR').replace(/\s+/g,' ').trim()}
};
const uniqueProducts=(rows:Product[])=>{const seen=new Set<string>();return rows.filter(p=>{const k=productKey(p);if(seen.has(k))return false;seen.add(k);return true})};

export default function IndirimPage(){
  const router=useRouter();
  const[authReady,setAuthReady]=useState(false);const[allowed,setAllowed]=useState(false);const[loading,setLoading]=useState(true);const[refreshing,setRefreshing]=useState(false);
  const[section,setSection]=useState<Section>('merve');const[categories,setCategories]=useState<Category[]>([]);const[sites,setSites]=useState<Site[]>([]);const[rules,setRules]=useState<Rule[]>([]);const[products,setProducts]=useState<Product[]>([]);const[logs,setLogs]=useState<ScanLog[]>([]);
  const[seenBefore,setSeenBefore]=useState<Set<string>>(new Set());const[sessionShown,setSessionShown]=useState<Set<string>>(new Set());
  const[settings,setSettings]=useState<Settings>({min_discount_percent:20,notifications_enabled:true,digest_mode:true,scan_interval_minutes:60});
  const[categoryId,setCategoryId]=useState('kadin-giyim');const[siteId,setSiteId]=useState('trendyol');const[categoryUrl,setCategoryUrl]=useState('');const[minDiscount,setMinDiscount]=useState(20);const[saving,setSaving]=useState(false);const[message,setMessage]=useState('');const[error,setError]=useState('');
  const[productLimit,setProductLimit]=useState(24);const[storeFilter,setStoreFilter]=useState('all');const[categoryFilter,setCategoryFilter]=useState('all');const[dropsOnly,setDropsOnly]=useState(false);const[search,setSearch]=useState('');

  const siteMap=useMemo(()=>Object.fromEntries(sites.map(s=>[s.id,s.name])),[sites]);
  const categoryMap=useMemo(()=>Object.fromEntries(categories.map(c=>[c.id,c.name])),[categories]);
  const sectionCategories=useMemo(()=>categories.filter(c=>sectionCategoryIds[section].includes(c.id)||c.id.startsWith(`${section}-`)),[categories,section]);
  const visibleRules=useMemo(()=>rules.filter(r=>sectionCategoryIds[section].includes(r.category_id)||r.category_id.startsWith(`${section}-`)),[rules,section]);
  const sectionProducts=useMemo(()=>uniqueProducts(products.filter(p=>productProfile(p)===section)),[products,section]);
  const unseenSectionProducts=useMemo(()=>sectionProducts.filter(p=>!seenBefore.has(productKey(p))||sessionShown.has(productKey(p))),[sectionProducts,seenBefore,sessionShown]);
  const familyProducts=useMemo(()=>unseenSectionProducts.filter(isFamily).sort((a,b)=>Number(b.discount_percent||0)-Number(a.discount_percent||0)||Number(a.current_price||99999999)-Number(b.current_price||99999999)),[unseenSectionProducts]);
  const coreProducts=useMemo(()=>unseenSectionProducts.filter(p=>!isFamily(p)),[unseenSectionProducts]);
  const interests=useMemo(()=>Array.from(new Set(familyProducts.map(p=>p.metadata?.interest).filter(Boolean) as string[])),[familyProducts]);
  const availableSiteIds=useMemo(()=>Array.from(new Set(coreProducts.map(p=>p.site_id))).sort((a,b)=>(siteMap[a]||a).localeCompare(siteMap[b]||b,'tr')),[coreProducts,siteMap]);
  const availableCategoryIds=useMemo(()=>Array.from(new Set(coreProducts.map(p=>p.category_id))).sort((a,b)=>(categoryMap[a]||a).localeCompare(categoryMap[b]||b,'tr')),[coreProducts,categoryMap]);
  const sortedProducts=useMemo(()=>{const q=search.trim().toLocaleLowerCase('tr-TR');return coreProducts.filter(p=>storeFilter==='all'||p.site_id===storeFilter).filter(p=>categoryFilter==='all'||p.category_id===categoryFilter).filter(p=>!dropsOnly||Number(p.discount_percent||0)>0).filter(p=>!q||`${p.title} ${p.brand||''} ${siteMap[p.site_id]||p.site_id} ${categoryMap[p.category_id]||''}`.toLocaleLowerCase('tr-TR').includes(q)).sort((a,b)=>Number(b.discount_percent||0)-Number(a.discount_percent||0)||Number(a.current_price||Number.MAX_SAFE_INTEGER)-Number(b.current_price||Number.MAX_SAFE_INTEGER))},[coreProducts,storeFilter,categoryFilter,dropsOnly,search,siteMap,categoryMap]);
  const visibleProducts=useMemo(()=>sortedProducts.slice(0,productLimit),[sortedProducts,productLimit]);
  const visibleFamily=useMemo(()=>familyProducts.slice(0,40),[familyProducts]);

  useEffect(()=>{let mounted=true;supabase.auth.getSession().then(({data:{session}}:any)=>{if(!mounted)return;const email=(session?.user?.email||'').toLowerCase();if(!email){router.replace('/giris?redirect=/indirim');return}setAllowed(ALLOWED.has(email));setAuthReady(true)}).catch(()=>setAuthReady(true));return()=>{mounted=false}},[router]);

  const load=async(silent=false)=>{
    if(!silent){setLoading(true);setError('')}
    const productQueries=(Object.keys(sectionCategoryIds) as Section[]).map(sec=>supabase.from('merve_products').select('id,title,brand,image_url,site_id,category_id,current_price,original_price,discount_percent,in_stock,url,metadata').in('category_id',sectionCategoryIds[sec]).order('discount_percent',{ascending:false,nullsFirst:false}).order('current_price',{ascending:true,nullsFirst:false}).limit(1000));
    const[c,s,r,st,l,seen,...pq]=await Promise.all([
      supabase.from('merve_categories').select('id,name,enabled,min_discount_percent').order('name'),
      supabase.from('merve_sites').select('id,name,base_url,enabled').order('name'),
      supabase.from('merve_tracking_rules').select('id,category_id,site_id,category_url,min_discount_percent,notify,enabled').order('created_at',{ascending:false}),
      supabase.from('merve_app_settings').select('min_discount_percent,notifications_enabled,digest_mode,scan_interval_minutes').eq('owner_email',OWNER).maybeSingle(),
      supabase.from('merve_scan_logs').select('id,status,scanned_count,changed_count,notified_count,started_at,error_message').order('started_at',{ascending:false}).limit(18),
      supabase.from('merve_seen_products').select('product_key').eq('owner_email',OWNER).limit(10000),
      ...productQueries,
    ] as any);
    const all=[c,s,r,st,l,seen,...pq];const firstError=all.find((x:any)=>x?.error)?.error;if(firstError)setError(firstError.message||'Veriler alınamadı.');
    const merged=new Map<string,Product>();for(const q of pq){for(const p of(q?.data||[]))merged.set(p.id,p as Product)}
    setCategories((c.data||[])as Category[]);setSites((s.data||[])as Site[]);setRules((r.data||[])as Rule[]);setProducts(Array.from(merged.values()));setSeenBefore(new Set((seen.data||[]).map((x:any)=>String(x.product_key))));setLogs((l.data||[])as ScanLog[]);if(st.data)setSettings(st.data as Settings);if(!silent)setLoading(false);
  };
  const refreshNow=async()=>{setRefreshing(true);setSessionShown(new Set());await load(true);setRefreshing(false)};
  useEffect(()=>{if(!authReady||!allowed)return;void load();const refresh=()=>void load(true);const timer=window.setInterval(refresh,30000);const onVisibility=()=>{if(document.visibilityState==='visible')refresh()};window.addEventListener('focus',refresh);document.addEventListener('visibilitychange',onVisibility);return()=>{window.clearInterval(timer);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',onVisibility)}},[authReady,allowed]);

  useEffect(()=>{
    if(!allowed||loading)return;
    const shown=uniqueProducts([...visibleFamily,...visibleProducts]);
    const fresh=shown.filter(p=>!seenBefore.has(productKey(p))&&!sessionShown.has(productKey(p)));
    if(!fresh.length)return;
    const keys=fresh.map(productKey);setSessionShown(prev=>new Set([...prev,...keys]));
    void supabase.from('merve_seen_products').upsert(fresh.map(p=>({owner_email:OWNER,product_key:productKey(p),product_id:p.id,profile:productProfile(p)||section})),{onConflict:'owner_email,product_key'});
  },[allowed,loading,section,visibleFamily,visibleProducts,seenBefore,sessionShown]);

  const changeSection=(next:Section)=>{setSection(next);setCategoryId(sectionDefaultCategory[next]);setMinDiscount(20);setMessage('');setError('');setProductLimit(24);setStoreFilter('all');setCategoryFilter('all');setDropsOnly(false);setSearch('');window.scrollTo({top:0,behavior:'smooth'})};
  const addRule=async()=>{setMessage('');setError('');if(!categoryUrl.trim()){setError('Kategori sayfası bağlantısını yapıştır.');return}setSaving(true);const{error:e}=await supabase.from('merve_tracking_rules').insert({owner_email:OWNER,category_id:categoryId,site_id:siteId,category_url:categoryUrl.trim(),min_discount_percent:minDiscount,notify:true,enabled:true});setSaving(false);if(e){setError(e.message);return}setCategoryUrl('');setMessage('Takip kuralı eklendi.');await load()};
  const toggleRule=async(rule:Rule)=>{const{error:e}=await supabase.from('merve_tracking_rules').update({enabled:!rule.enabled,updated_at:new Date().toISOString()}).eq('id',rule.id);if(e){setError(e.message);return}await load()};
  const removeRule=async(id:string)=>{const{error:e}=await supabase.from('merve_tracking_rules').delete().eq('id',id);if(e){setError(e.message);return}await load()};
  const updateSettings=async(patch:Partial<Settings>)=>{const next={...settings,...patch};setSettings(next);const{error:e}=await supabase.from('merve_app_settings').update({...patch,updated_at:new Date().toISOString()}).eq('owner_email',OWNER);if(e){setError(e.message);await load()}};

  if(!authReady)return <main className={styles.page}><div className={styles.shell}><div className={styles.empty}>Giriş kontrol ediliyor…</div></div></main>;
  if(!allowed)return <main className={`${styles.page} ${styles.denied}`}><div className={styles.deniedCard}><Tag size={28}/><h1>Erişim yok</h1><p className={styles.muted}>Bu alan yalnızca yetkilendirilmiş hesaplara açık.</p></div></main>;

  const realDrops=unseenSectionProducts.filter(p=>Number(p.discount_percent||0)>0).length;const lastScan=logs[0];const lastScanText=lastScan?new Date(lastScan.started_at).toLocaleString('tr-TR',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'}):'—';
  const heroText=section==='oguzhan'?'XL giyim · elektronik · PC/telefon · el aletleri · Megane 2':section==='ege'?'4+ erkek çocuk · oyuncak · kitap · banyo · beslenme':'L/XL giyim · ayakkabı/çanta · kişisel bakım · ev ihtiyaçları';
  const renderProduct=(p:Product)=>{const hasDrop=Number(p.discount_percent||0)>0,previous=Number(p.original_price||0),current=Number(p.current_price||0),label=p.metadata?.interest||categoryMap[p.category_id]||p.category_id;return <a key={productKey(p)} href={p.url} target='_blank' rel='noreferrer' className={styles.product}><div className={styles.productImageWrap}>{p.image_url?<img src={p.image_url} alt='' loading='lazy' className={styles.productImage}/>:<span className={styles.imageFallback}><Store size={18}/></span>}</div><div className={styles.productMain}><div className={styles.productBadges}><span className={styles.storeBadge}>{siteMap[p.site_id]||p.site_id}</span><span className={styles.interestBadge}>{label}</span>{p.brand&&<span className={styles.brandBadge}>{p.brand}</span>}</div><div className={styles.productTitle}>{p.title}</div><div className={styles.priceRow}><strong>{current?`${current.toLocaleString('tr-TR')} TL`:'Fiyat yok'}</strong>{hasDrop&&previous>current&&<span>{previous.toLocaleString('tr-TR')} TL</span>}</div></div><div className={`${styles.discount} ${hasDrop?styles.discountActive:''}`}>{hasDrop?`-%${Math.round(Number(p.discount_percent))}`:<ExternalLink size={16}/>}</div></a>};

  return <main className={styles.page}><div className={styles.shell}>
    <section className={styles.hero}><div><div className={styles.eyebrow}>{sectionTitle[section]} İndirim</div><h1 className={styles.title}>İndirim Takip</h1><p className={styles.subtitle}>{heroText}</p></div><div className={styles.status}><span className={styles.dot}/><span>{settings.scan_interval_minutes} dk · son {lastScanText}</span></div></section>
    <nav className={styles.profileTabs}>{(['merve','oguzhan','ege']as Section[]).map(x=><button key={x} onClick={()=>changeSection(x)} className={`${styles.profileTab} ${section===x?styles.profileTabActive:''}`}>{sectionTitle[x]}</button>)}</nav>
    <section className={styles.compactStats}><div><span>Yeni ürün</span><strong>{unseenSectionProducts.length}</strong></div><div><span>Düşüş</span><strong>{realDrops}</strong></div><div><span>Yeni fırsat</span><strong>{familyProducts.length}</strong></div><div><span>Son tarama</span><strong>{lastScan?new Date(lastScan.started_at).toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'}):'—'}</strong></div></section>

    <section className={`${styles.card} ${styles.smartCard}`}><div className={styles.cardHead}><div><div className={styles.cardTitle}><Sparkles size={16}/> Yeni fırsatlar</div><div className={styles.muted}>Gösterilen ürün kaydedilir ve sonraki girişte bir daha gösterilmez.</div></div><button className={styles.refreshButton} onClick={refreshNow} disabled={refreshing}><RefreshCw size={16} className={refreshing?styles.spin:''}/></button></div><div className={styles.smartChips}>{interests.map(x=><span key={x}>{x}</span>)}</div><div className={styles.productList}>{familyProducts.length===0?<div className={styles.empty}>Yeni doğrulanmış fırsat yok.</div>:visibleFamily.map(renderProduct)}</div></section>

    <section className={`${styles.card} ${styles.productsCard}`}><div className={styles.cardHead}><div><div className={styles.cardTitle}><Store size={16}/> Yeni ürünler</div><div className={styles.muted}>Tekrarsız · kategori + profil doğrulamalı · {sortedProducts.length} yeni sonuç</div></div><button className={styles.refreshButton} onClick={refreshNow} disabled={refreshing}><RefreshCw size={16} className={refreshing?styles.spin:''}/></button></div><div className={styles.filterBar}><label className={styles.searchBox}><Search size={15}/><input value={search} onChange={e=>{setSearch(e.target.value);setProductLimit(24)}} placeholder='Ürün ara'/></label><select className={styles.storeSelect} value={storeFilter} onChange={e=>{setStoreFilter(e.target.value);setProductLimit(24)}}><option value='all'>Tüm mağazalar</option>{availableSiteIds.map(id=><option key={id} value={id}>{siteMap[id]||id}</option>)}</select><select className={styles.storeSelect} value={categoryFilter} onChange={e=>{setCategoryFilter(e.target.value);setProductLimit(24)}}><option value='all'>Tüm kategoriler</option>{availableCategoryIds.map(id=><option key={id} value={id}>{categoryMap[id]||id}</option>)}</select><button className={`${styles.dropToggle} ${dropsOnly?styles.dropToggleActive:''}`} onClick={()=>{setDropsOnly(v=>!v);setProductLimit(24)}}><SlidersHorizontal size={14}/> {dropsOnly?'Ucuzlayanlar':'Tümü'}</button></div><div className={styles.productList}>{sortedProducts.length===0?<div className={styles.empty}>Bu filtrede yeni ürün yok.</div>:visibleProducts.map(renderProduct)}</div>{productLimit<sortedProducts.length&&<button className={styles.moreButton} onClick={()=>setProductLimit(v=>Math.min(v+24,sortedProducts.length))}>24 yeni ürün daha göster</button>}</section>

    <div className={styles.toolsGrid}>
      <details className={styles.collapse}><summary><span><Settings2 size={16}/> Yönetim</span><span className={styles.summaryMeta}>{visibleRules.length} kural <ChevronDown size={16}/></span></summary><div className={styles.collapseBody}><div className={styles.sectionLabel}><Plus size={15}/> Yeni takip kuralı</div><div className={styles.formGrid}><label className={styles.field}><span className={styles.label}>Kategori</span><select className={styles.select} value={categoryId} onChange={e=>{setCategoryId(e.target.value);const c=categories.find(x=>x.id===e.target.value);if(c)setMinDiscount(Number(c.min_discount_percent))}}>{sectionCategories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label className={styles.field}><span className={styles.label}>Mağaza</span><select className={styles.select} value={siteId} onChange={e=>setSiteId(e.target.value)}>{sites.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><label className={`${styles.field} ${styles.fieldFull}`}><span className={styles.label}>Kategori URL</span><input className={styles.input} value={categoryUrl} onChange={e=>setCategoryUrl(e.target.value)} placeholder='https://...'/></label><label className={styles.field}><span className={styles.label}>Gerçek düşüş eşiği (%)</span><input className={styles.input} type='number' min={1} max={95} value={minDiscount} onChange={e=>setMinDiscount(Number(e.target.value)||1)}/></label><div className={styles.field}><button className={styles.button} onClick={addRule} disabled={saving}>{saving?'Ekleniyor…':'Takibe Ekle'}</button></div></div>{error&&<div className={styles.error}>{error}</div>}{message&&<div className={styles.success}>{message}</div>}<div className={styles.rules}>{visibleRules.map(rule=><div className={styles.rule} key={rule.id}><div className={styles.ruleTop}><div><div className={styles.ruleName}>{categoryMap[rule.category_id]||rule.category_id} · {siteMap[rule.site_id]||rule.site_id}</div><div className={styles.ruleMeta}>%{rule.min_discount_percent} gerçek düşüş ve üzeri</div></div><button className={`${styles.switch} ${rule.enabled?styles.switchOn:''}`} onClick={()=>toggleRule(rule)}><span className={styles.switchKnob}/></button></div><div className={styles.ruleUrl}>{rule.category_url}</div><button className={`${styles.ghost} ${styles.danger}`} onClick={()=>removeRule(rule.id)}><Trash2 size={12}/> Sil</button></div>)}</div></div></details>
      <details className={styles.collapse}><summary><span><Bell size={16}/> Bildirim ayarları</span><ChevronDown size={16}/></summary><div className={styles.collapseBody}><div className={styles.settingsRow}><div><div className={styles.settingsName}>Bildirimler</div><div className={styles.muted}>Yalnız gerçek fiyat düşüşlerini bildir</div></div><button className={`${styles.switch} ${settings.notifications_enabled?styles.switchOn:''}`} onClick={()=>updateSettings({notifications_enabled:!settings.notifications_enabled})}><span className={styles.switchKnob}/></button></div></div></details>
      <details className={styles.collapse}><summary><span><Activity size={16}/> Tarama geçmişi</span><ChevronDown size={16}/></summary><div className={styles.collapseBody}><div className={styles.notice}>Saatlik tarama aktif. Profil ve kategori doğrulanmayan veya daha önce gösterilen ürün ekrana alınmaz.</div><div className={styles.rules}>{logs.map(log=><div className={styles.rule} key={log.id}><div className={styles.ruleName}>{log.status} · {log.scanned_count} ürün</div>{log.error_message&&<div className={styles.error}>{log.error_message}</div>}</div>)}</div></div></details>
    </div>
  </div></main>;
}
