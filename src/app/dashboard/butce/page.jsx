'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  FileImage,
  Fuel,
  Gauge,
  HeartPulse,
  Home,
  MoreHorizontal,
  Plus,
  ReceiptText,
  Save,
  Settings2,
  ShoppingCart,
  Trash2,
  Utensils,
  WalletCards,
  Wifi,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const CATEGORIES = [
  { key: 'Market / Gıda', short: 'Market', icon: ShoppingCart },
  { key: 'Yakıt / Ulaşım', short: 'Yakıt', icon: Fuel },
  { key: 'Dışarıda Yeme', short: 'Yeme', icon: Utensils },
  { key: 'Fatura / İletişim', short: 'Fatura', icon: Wifi },
  { key: 'Sağlık', short: 'Sağlık', icon: HeartPulse },
  { key: 'Ev / Kişisel', short: 'Ev', icon: Home },
  { key: 'Diğer', short: 'Diğer', icon: MoreHorizontal },
];

const DEFAULT_LIMITS = {
  'Market / Gıda': 11000,
  'Yakıt / Ulaşım': 11000,
  'Dışarıda Yeme': 4000,
  'Fatura / İletişim': 4500,
  Sağlık: 2000,
  'Ev / Kişisel': 2000,
  Diğer: 1500,
};

const DEFAULT_TOTAL = 36000;
const PAYMENT_METHODS = ['Banka Kartı', 'Kredi Kartı', 'Nakit', 'Havale / EFT'];

const pad = (n) => String(n).padStart(2, '0');
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const monthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};
const monthBounds = (month) => {
  const [y, m] = month.split('-').map(Number);
  const next = m === 12 ? `${y + 1}-01-01` : `${y}-${pad(m + 1)}-01`;
  return { start: `${month}-01`, next };
};
const daysInMonth = (month) => {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m, 0).getDate();
};
const money = (n) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(Number(n) || 0);
const pct = (a, b) => (b > 0 ? Math.min(100, Math.max(0, (a / b) * 100)) : 0);
const amountOf = (value) => {
  const n = Number.parseFloat(String(value || '').replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};
const dateLabel = (value) => {
  const [y, m, d] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short' }).format(new Date(y, m - 1, d));
};
const stateOf = (spent, limit) => {
  if (!limit) return 'ok';
  if (spent >= limit) return 'danger';
  if (spent >= limit * 0.8) return 'warn';
  return 'ok';
};

export default function BudgetPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [month, setMonth] = useState(monthKey());
  const [expenses, setExpenses] = useState([]);
  const [totalLimit, setTotalLimit] = useState(DEFAULT_TOTAL);
  const [limits, setLimits] = useState(DEFAULT_LIMITS);
  const [message, setMessage] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [preview, setPreview] = useState('');
  const [checkAmount, setCheckAmount] = useState('');
  const [checkCategory, setCheckCategory] = useState(CATEGORIES[0].key);
  const [form, setForm] = useState({
    amount: '', category: CATEGORIES[0].key, merchant: '', spent_at: todayKey(), payment_method: PAYMENT_METHODS[0], note: '',
  });

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return;
      if (!session) {
        router.replace('/giris?next=/dashboard/butce');
        return;
      }
      setUser(session.user);
      setReady(true);
    }).catch(() => setReady(true));
    return () => { active = false; };
  }, [router]);

  useEffect(() => {
    if (!receipt) { setPreview(''); return; }
    const url = URL.createObjectURL(receipt);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [receipt]);

  const loadMonth = async () => {
    if (!user || !month) return;
    setLoading(true);
    const { start, next } = monthBounds(month);
    const [er, br] = await Promise.all([
      supabase.from('personal_expenses').select('*').eq('user_id', user.id).gte('spent_at', start).lt('spent_at', next).order('spent_at', { ascending: false }).order('created_at', { ascending: false }),
      supabase.from('personal_monthly_budgets').select('*').eq('user_id', user.id).eq('month_start', start).maybeSingle(),
    ]);
    if (er.error) setMessage(er.error.message || 'Harcamalar alınamadı.');
    setExpenses(er.data || []);
    if (br.data) {
      setTotalLimit(Number(br.data.total_limit) || DEFAULT_TOTAL);
      setLimits({ ...DEFAULT_LIMITS, ...(br.data.category_limits || {}) });
    } else {
      setTotalLimit(DEFAULT_TOTAL);
      setLimits(DEFAULT_LIMITS);
    }
    setLoading(false);
  };

  useEffect(() => { loadMonth(); }, [user, month]);

  const spent = useMemo(() => expenses.reduce((s, x) => s + Number(x.amount || 0), 0), [expenses]);
  const byCategory = useMemo(() => {
    const map = Object.fromEntries(CATEGORIES.map((c) => [c.key, 0]));
    expenses.forEach((x) => { map[x.category] = (map[x.category] || 0) + Number(x.amount || 0); });
    return map;
  }, [expenses]);

  const isCurrent = month === monthKey();
  const today = todayKey();
  const todaySpent = isCurrent ? expenses.filter((x) => x.spent_at === today).reduce((s, x) => s + Number(x.amount || 0), 0) : 0;
  const beforeToday = isCurrent ? expenses.filter((x) => x.spent_at < today).reduce((s, x) => s + Number(x.amount || 0), 0) : spent;
  const remainDays = isCurrent ? Math.max(1, daysInMonth(month) - new Date().getDate() + 1) : daysInMonth(month);
  const dailyTarget = isCurrent ? Math.max(0, (totalLimit - beforeToday) / remainDays) : 0;
  const todayRemaining = isCurrent ? Math.max(0, dailyTarget - todaySpent) : 0;
  const remaining = Math.max(0, totalLimit - spent);
  const over = Math.max(0, spent - totalLimit);
  const checked = amountOf(checkAmount);
  const catRemaining = Math.max(0, Number(limits[checkCategory] || 0) - Number(byCategory[checkCategory] || 0));
  const fits = checked > 0 && checked <= remaining && checked <= catRemaining && (!isCurrent || checked <= todayRemaining);

  const resetForm = () => {
    setForm({ amount: '', category: CATEGORIES[0].key, merchant: '', spent_at: todayKey(), payment_method: PAYMENT_METHODS[0], note: '' });
    setReceipt(null);
    setShowAdd(false);
  };

  const saveBudget = async () => {
    if (!user || totalLimit <= 0) return;
    setSaving(true); setMessage('');
    const { start } = monthBounds(month);
    const { error } = await supabase.from('personal_monthly_budgets').upsert({
      user_id: user.id, month_start: start, total_limit: totalLimit, category_limits: limits, updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,month_start' });
    setSaving(false);
    if (error) return setMessage(error.message || 'Limitler kaydedilemedi.');
    setShowSettings(false); setMessage('Limitler kaydedildi.');
  };

  const addExpense = async () => {
    if (!user || saving) return;
    const amount = amountOf(form.amount);
    if (amount <= 0) return setMessage('Geçerli bir tutar gir.');
    setSaving(true); setMessage('');
    let path = null;
    try {
      if (receipt) {
        if (receipt.size > 10 * 1024 * 1024) throw new Error('Fiş fotoğrafı en fazla 10 MB olabilir.');
        const ext = (receipt.name.split('.').pop() || receipt.type.split('/').pop() || 'jpg').replace('jpeg', 'jpg').toLowerCase();
        path = `${user.id}/${form.spent_at.slice(0, 7)}/${crypto.randomUUID()}.${ext}`;
        const up = await supabase.storage.from('expense-receipts').upload(path, receipt, { upsert: false, contentType: receipt.type || undefined });
        if (up.error) throw up.error;
      }
      const ins = await supabase.from('personal_expenses').insert({
        user_id: user.id, amount, category: form.category, merchant: form.merchant.trim() || null, spent_at: form.spent_at,
        payment_method: form.payment_method || null, note: form.note.trim() || null, receipt_path: path,
      }).select('*').single();
      if (ins.error) throw ins.error;
      setExpenses((list) => [ins.data, ...list]);
      resetForm(); setMessage('Harcama kaydedildi.');
    } catch (e) {
      if (path) await supabase.storage.from('expense-receipts').remove([path]);
      setMessage(e?.message || 'Harcama kaydedilemedi.');
    } finally { setSaving(false); }
  };

  const deleteExpense = async (item) => {
    if (!user || !window.confirm(`${money(item.amount)} harcamayı silmek istiyor musun?`)) return;
    const { error } = await supabase.from('personal_expenses').delete().eq('id', item.id).eq('user_id', user.id);
    if (error) return setMessage(error.message || 'Silinemedi.');
    if (item.receipt_path) await supabase.storage.from('expense-receipts').remove([item.receipt_path]);
    setExpenses((list) => list.filter((x) => x.id !== item.id));
  };

  const openReceipt = async (path) => {
    const { data, error } = await supabase.storage.from('expense-receipts').createSignedUrl(path, 120);
    if (error || !data?.signedUrl) return setMessage(error?.message || 'Fiş açılamadı.');
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  };

  if (!ready || loading) return <main className="bt loading"><div className="spin"/><span>Bütçe hazırlanıyor...</span><style>{CSS}</style></main>;

  return (
    <main className="bt">
      <style>{CSS}</style>
      <div className="wrap">
        <header className="top">
          <div className="title"><Link href="/dashboard" className="icon"><ArrowLeft size={18}/></Link><div><span className="kicker"><WalletCards size={14}/> Kişisel bütçe</span><h1>Harcama kontrolü</h1><p>Fişini çek, kaydet ve ay sonunu görerek harca.</p></div></div>
          <div className="topActions"><input type="month" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)}/><button className="icon" onClick={() => setShowSettings(true)}><Settings2 size={18}/></button></div>
        </header>

        {message && <button className="msg" onClick={() => setMessage('')}>{message}<X size={14}/></button>}

        <section className="summary">
          <article className={`card hero ${stateOf(spent, totalLimit)}`}><div className="head"><span>Aylık bütçe</span><Gauge size={17}/></div><div className="big"><strong>{money(spent)}</strong><small>/ {money(totalLimit)}</small></div><div className="bar"><i style={{width:`${pct(spent,totalLimit)}%`}}/></div><footer>{over ? <b>{money(over)} aşıldı</b> : <b>{money(remaining)} kaldı</b>}<span>%{Math.round(pct(spent,totalLimit))}</span></footer></article>
          <article className="card daily"><div className="head"><span>Bugün harcayabilirsin</span><CircleDollarSign size={17}/></div><strong>{money(isCurrent ? todayRemaining : remaining)}</strong><p>{isCurrent ? 'Şu andan ay sonuna kadar planı bozmadan kullanabileceğin tutar.' : 'Seçili ayın kalan bütçesi.'}</p>{isCurrent && <><div className="mini"><span>Bugün harcanan</span><b>{money(todaySpent)}</b></div><div className="mini"><span>Günlük hedef</span><b>{money(dailyTarget)}</b></div></>}</article>
          <article className="card checker"><div className="head"><span>Almadan önce kontrol et</span><CheckCircle2 size={17}/></div><div className="checkInputs"><label><span>Tutar</span><div className="moneyInput"><input inputMode="decimal" placeholder="0" value={checkAmount} onChange={(e)=>setCheckAmount(e.target.value)}/><b>TL</b></div></label><label><span>Kategori</span><div className="select"><select value={checkCategory} onChange={(e)=>setCheckCategory(e.target.value)}>{CATEGORIES.map(c=><option key={c.key}>{c.key}</option>)}</select><ChevronDown size={14}/></div></label></div>{checked>0 && <div className={`result ${fits?'fit':'no'}`}>{fits?<><CheckCircle2 size={15}/><span>Bu harcama plana sığıyor. Sonra {money(Math.max(0,remaining-checked))} kalır.</span></>:<><Gauge size={15}/><span>{checked>catRemaining?`${checkCategory} için ${money(catRemaining)} kaldı.`:isCurrent&&checked>todayRemaining?`Bugün için ${money(todayRemaining)} kaldı.`:`Aylık bütçede ${money(remaining)} kaldı.`}</span></>}</div>}</article>
        </section>

        <div className="sectionHead"><div><span>KATEGORİLER</span><h2>Nereye gidiyor?</h2></div><button className="primary desktopAdd" onClick={()=>setShowAdd(true)}><Plus size={16}/> Harcama ekle</button></div>
        <section className="cats">{CATEGORIES.map(c=>{const Icon=c.icon;const s=Number(byCategory[c.key]||0);const l=Number(limits[c.key]||0);return <article className={`cat ${stateOf(s,l)}`} key={c.key}><div className="catTop"><span className="catIcon"><Icon size={17}/></span><b>{c.short}</b><strong>{money(s)}</strong></div><div className="catBar"><i style={{width:`${pct(s,l)}%`}}/></div><footer><span>Limit {money(l)}</span><b>{s>l?`${money(s-l)} aşıldı`:`${money(l-s)} kaldı`}</b></footer></article>})}</section>

        <div className="sectionHead historyHead"><div><span>HAREKETLER</span><h2>Son harcamalar</h2></div><b>{expenses.length} kayıt</b></div>
        <section className="history">{expenses.length===0?<div className="empty"><ReceiptText size={28}/><strong>Bu ay kayıt yok</strong><span>İlk harcamayı elle gir veya fiş fotoğrafıyla kaydet.</span><button className="primary" onClick={()=>setShowAdd(true)}><Plus size={16}/> İlk harcamayı ekle</button></div>:expenses.map(item=>{const c=CATEGORIES.find(x=>x.key===item.category)||CATEGORIES.at(-1);const Icon=c.icon;return <article className="row" key={item.id}><span className="rowIcon"><Icon size={17}/></span><div className="rowCopy"><strong>{item.merchant||item.category}</strong><span>{dateLabel(item.spent_at)} · {item.category}{item.payment_method?` · ${item.payment_method}`:''}</span>{item.note&&<small>{item.note}</small>}</div><div className="rowSide"><b>{money(item.amount)}</b><div>{item.receipt_path&&<button onClick={()=>openReceipt(item.receipt_path)}><FileImage size={15}/></button>}<button onClick={()=>deleteExpense(item)}><Trash2 size={14}/></button></div></div></article>})}</section>
      </div>

      <button className="fab" onClick={()=>setShowAdd(true)}><Plus size={23}/></button>

      {showAdd && <div className="backdrop" onClick={resetForm}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modalHead"><div><span>YENİ HARCAMA</span><h2>Harcama kaydet</h2></div><button onClick={resetForm}><X size={20}/></button></div><label className="receipt">{preview?<img src={preview} alt="Fiş önizleme"/>:<div><Camera size={26}/><strong>Fişin fotoğrafını çek</strong><span>Kamera açılır; galeriden de seçebilirsin.</span></div>}<input type="file" accept="image/*" capture="environment" onChange={e=>setReceipt(e.target.files?.[0]||null)}/>{preview&&<i>Fotoğrafı değiştir</i>}</label><div className="form"><label className="amount"><span>Tutar *</span><div className="moneyInput"><input inputMode="decimal" placeholder="0,00" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/><b>TL</b></div></label><label><span>Kategori</span><div className="select"><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{CATEGORIES.map(c=><option key={c.key}>{c.key}</option>)}</select><ChevronDown size={14}/></div></label><label><span>İşyeri / açıklama</span><input placeholder="ŞOK, akaryakıt, kahve..." value={form.merchant} onChange={e=>setForm({...form,merchant:e.target.value})}/></label><label><span>Tarih</span><input type="date" value={form.spent_at} onChange={e=>setForm({...form,spent_at:e.target.value})}/></label><label><span>Ödeme</span><div className="select"><select value={form.payment_method} onChange={e=>setForm({...form,payment_method:e.target.value})}>{PAYMENT_METHODS.map(x=><option key={x}>{x}</option>)}</select><ChevronDown size={14}/></div></label><label><span>Not</span><input placeholder="İsteğe bağlı" value={form.note} onChange={e=>setForm({...form,note:e.target.value})}/></label></div><div className="actions"><button className="secondary" onClick={resetForm}>Vazgeç</button><button className="primary" disabled={saving} onClick={addExpense}><Save size={16}/>{saving?'Kaydediliyor...':'Kaydet'}</button></div></div></div>}

      {showSettings && <div className="backdrop" onClick={()=>setShowSettings(false)}><div className="modal settings" onClick={e=>e.stopPropagation()}><div className="modalHead"><div><span>BÜTÇE AYARLARI</span><h2>Aylık limitler</h2></div><button onClick={()=>setShowSettings(false)}><X size={20}/></button></div><label className="totalField"><span>Toplam aylık tavan</span><div className="moneyInput"><input inputMode="decimal" value={totalLimit} onChange={e=>setTotalLimit(amountOf(e.target.value))}/><b>TL</b></div></label><div className="limitList">{CATEGORIES.map(c=>{const Icon=c.icon;return <label key={c.key}><span><Icon size={15}/>{c.key}</span><div className="moneyInput"><input inputMode="decimal" value={limits[c.key]||0} onChange={e=>setLimits({...limits,[c.key]:amountOf(e.target.value)})}/><b>TL</b></div></label>})}</div><div className="limitTotal"><span>Kategori toplamı</span><b>{money(Object.values(limits).reduce((s,x)=>s+Number(x||0),0))}</b></div><div className="actions"><button className="secondary" onClick={()=>{setTotalLimit(DEFAULT_TOTAL);setLimits(DEFAULT_LIMITS)}}>36.000 TL hedefi</button><button className="primary" disabled={saving} onClick={saveBudget}><Save size={16}/>{saving?'Kaydediliyor...':'Kaydet'}</button></div></div></div>}
    </main>
  );
}

const CSS = `
.bt{min-height:calc(100vh - 56px);background:var(--bg);color:var(--ink);padding:20px 16px 105px}.wrap{max-width:1180px;margin:auto}.loading{display:grid;place-items:center;align-content:center;gap:12px;color:var(--ink-4)}.spin{width:34px;height:34px;border:2px solid var(--border);border-top-color:var(--amber);border-radius:50%;animation:sp .8s linear infinite}@keyframes sp{to{transform:rotate(360deg)}}
.top{display:flex;justify-content:space-between;gap:14px;margin-bottom:16px}.title{display:flex;gap:10px}.icon{width:38px;height:38px;border:1px solid var(--border);background:var(--bg-card);border-radius:11px;color:var(--ink-2);display:grid;place-items:center;text-decoration:none}.kicker,.sectionHead>div>span,.modalHead span{display:flex;align-items:center;gap:6px;color:var(--amber);font-size:10px;font-weight:850;letter-spacing:.09em;text-transform:uppercase}.title h1{margin:3px 0 5px;font-size:clamp(25px,4vw,36px);letter-spacing:-.035em}.title p{margin:0;color:var(--ink-4);font-size:12px}.topActions{display:flex;gap:8px}.topActions input{height:38px;border:1px solid var(--border);background:var(--bg-card);color:var(--ink);border-radius:11px;padding:0 9px;color-scheme:dark}.topActions button{cursor:pointer}.msg{width:100%;margin:0 0 12px;padding:9px 11px;border:1px solid rgba(229,149,0,.3);background:rgba(229,149,0,.07);color:var(--ink-2);border-radius:10px;display:flex;justify-content:space-between;align-items:center;font-size:11px}
.summary{display:grid;grid-template-columns:1fr .82fr 1.18fr;gap:10px;margin-bottom:22px}.card{background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:15px}.head{display:flex;justify-content:space-between;color:var(--ink-4);font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.05em}.big{display:flex;align-items:baseline;gap:6px;margin:11px 0}.big strong,.daily>strong{font-size:28px;letter-spacing:-.04em}.big small{color:var(--ink-4)}.bar,.catBar{height:6px;background:rgba(148,163,184,.12);border-radius:99px;overflow:hidden}.bar i,.catBar i{display:block;height:100%;background:var(--amber)}.warn .bar i,.warn .catBar i{background:#f59e0b}.danger .bar i,.danger .catBar i{background:#ef4444}.hero footer,.cat footer{display:flex;justify-content:space-between;margin-top:8px;font-size:9px;color:var(--ink-4)}.hero footer b{color:var(--ink-2)}.danger footer b{color:#f87171}.daily>strong{display:block;margin:10px 0 2px;color:#35d39a}.daily p{font-size:10px;color:var(--ink-4);line-height:1.5;margin:0 0 10px}.mini{display:flex;justify-content:space-between;border-top:1px solid var(--border);padding-top:7px;margin-top:7px;font-size:10px}.mini span{color:var(--ink-4)}
.checkInputs{display:grid;grid-template-columns:.7fr 1.3fr;gap:7px;margin-top:10px}.checkInputs label>span,.form label>span,.totalField>span{display:block;font-size:9px;color:var(--ink-4);margin-bottom:4px}.moneyInput,.select{height:38px;border:1px solid var(--border);background:rgba(255,255,255,.02);border-radius:9px;display:flex;align-items:center;position:relative;overflow:hidden}.moneyInput input,.select select{min-width:0;flex:1;height:100%;border:0;outline:0;background:transparent;color:var(--ink);padding:0 9px;font:inherit;font-size:12px}.moneyInput b{padding-right:9px;color:var(--ink-4);font-size:9px}.select select{appearance:none;padding-right:27px}.select svg{position:absolute;right:8px;color:var(--ink-4);pointer-events:none}.select option{background:#0b111a;color:#fff}.result{display:flex;gap:7px;align-items:flex-start;margin-top:8px;padding:8px;border-radius:9px;font-size:9px;line-height:1.45}.fit{color:#6ee7b7;background:rgba(53,211,154,.08);border:1px solid rgba(53,211,154,.16)}.no{color:#fca5a5;background:rgba(239,68,68,.07);border:1px solid rgba(239,68,68,.14)}
.sectionHead{display:flex;justify-content:space-between;align-items:end;gap:10px;margin:0 0 10px}.sectionHead h2{font-size:18px;margin:3px 0 0}.sectionHead>b{font-size:10px;color:var(--ink-4)}.primary,.secondary{min-height:37px;border-radius:10px;padding:0 12px;border:1px solid var(--border);display:inline-flex;align-items:center;justify-content:center;gap:6px;font:inherit;font-size:10px;font-weight:800;cursor:pointer}.primary{background:var(--amber);border-color:var(--amber);color:#080b10}.secondary{background:var(--bg-card);color:var(--ink-2)}.primary:disabled{opacity:.55}.cats{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.cat{background:var(--bg-card);border:1px solid var(--border);border-radius:13px;padding:11px}.catTop{display:grid;grid-template-columns:30px 1fr auto;gap:7px;align-items:center}.catIcon{width:29px;height:29px;display:grid;place-items:center;border-radius:9px;background:rgba(229,149,0,.08);color:var(--amber)}.catTop>b{font-size:10px;color:var(--ink-3)}.catTop>strong{font-size:12px}.catBar{height:5px;margin-top:9px}.historyHead{margin-top:22px}.history{background:var(--bg-card);border:1px solid var(--border);border-radius:15px;overflow:hidden}.row{display:grid;grid-template-columns:36px 1fr auto;gap:9px;align-items:center;padding:10px 11px;border-bottom:1px solid var(--border)}.row:last-child{border-bottom:0}.rowIcon{width:34px;height:34px;border-radius:10px;background:rgba(148,163,184,.08);color:var(--ink-3);display:grid;place-items:center}.rowCopy{min-width:0;display:flex;flex-direction:column;gap:2px}.rowCopy strong{font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.rowCopy span,.rowCopy small{font-size:8px;color:var(--ink-4);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.rowSide{text-align:right}.rowSide>b{font-size:11px}.rowSide>div{display:flex;justify-content:flex-end;gap:4px;margin-top:3px}.rowSide button{width:25px;height:24px;border:1px solid var(--border);background:transparent;color:var(--ink-4);border-radius:7px;display:grid;place-items:center}.empty{padding:38px 15px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:6px;color:var(--ink-4)}.empty strong{color:var(--ink-2);font-size:12px}.empty span{font-size:9px}.empty .primary{margin-top:5px}
.fab{display:none;position:fixed;right:16px;bottom:82px;width:53px;height:53px;border:0;border-radius:17px;background:var(--amber);color:#080b10;box-shadow:0 12px 28px rgba(229,149,0,.35);z-index:30}.backdrop{position:fixed;inset:0;z-index:90;background:rgba(0,0,0,.74);backdrop-filter:blur(5px);display:grid;place-items:center;padding:16px}.modal{width:min(620px,100%);max-height:calc(100vh - 32px);overflow:auto;background:#0b111a;border:1px solid var(--border);border-radius:19px;padding:16px}.modalHead{display:flex;justify-content:space-between;margin-bottom:12px}.modalHead h2{margin:3px 0 0;font-size:19px}.modalHead>button{width:32px;height:32px;border:1px solid var(--border);background:transparent;color:var(--ink-3);border-radius:9px}.receipt{position:relative;min-height:120px;border:1px dashed rgba(229,149,0,.45);background:rgba(229,149,0,.035);border-radius:14px;display:grid;place-items:center;overflow:hidden;margin-bottom:11px}.receipt input{position:absolute;inset:0;opacity:0}.receipt>div{display:flex;flex-direction:column;align-items:center;gap:4px;color:var(--ink-3)}.receipt>div strong{font-size:11px}.receipt>div span{font-size:8px;color:var(--ink-4)}.receipt img{width:100%;height:165px;object-fit:cover}.receipt i{position:absolute;right:8px;bottom:8px;background:rgba(0,0,0,.7);padding:5px 7px;border-radius:6px;font-size:8px;color:#fff}.form{display:grid;grid-template-columns:1fr 1fr;gap:8px}.form>label>input{width:100%;height:38px;border:1px solid var(--border);background:rgba(255,255,255,.02);color:var(--ink);border-radius:9px;padding:0 9px;font:inherit;font-size:11px;outline:0;color-scheme:dark}.amount{grid-column:1/-1}.amount .moneyInput input{font-size:18px;font-weight:800}.actions{display:flex;justify-content:flex-end;gap:7px;margin-top:13px;padding-top:12px;border-top:1px solid var(--border)}.settings{width:min(540px,100%)}.totalField{display:block;margin-bottom:11px}.totalField .moneyInput{height:46px}.totalField input{font-size:19px;font-weight:800}.limitList{border:1px solid var(--border);border-radius:13px;overflow:hidden}.limitList>label{display:grid;grid-template-columns:1fr 135px;gap:8px;align-items:center;padding:7px 9px;border-bottom:1px solid var(--border)}.limitList>label:last-child{border-bottom:0}.limitList>label>span{display:flex;align-items:center;gap:6px;font-size:9px;color:var(--ink-3)}.limitList .moneyInput{height:32px}.limitTotal{display:flex;justify-content:space-between;padding:9px 2px 0;font-size:9px;color:var(--ink-4)}.limitTotal b{color:var(--ink-2)}
@media(max-width:880px){.summary{grid-template-columns:1fr 1fr}.checker{grid-column:1/-1}}
@media(max-width:650px){.bt{padding:13px 9px 112px}.top{align-items:flex-start}.title h1{font-size:23px}.title p{font-size:9px}.topActions{flex-direction:column;align-items:flex-end}.topActions input{width:126px;height:35px;font-size:10px}.topActions .icon{width:35px;height:35px}.summary{grid-template-columns:1fr;gap:7px;margin-bottom:17px}.checker{grid-column:auto}.card{padding:13px;border-radius:14px}.big strong,.daily>strong{font-size:25px}.cats{gap:6px}.cat{padding:9px}.catTop{grid-template-columns:27px 1fr}.catIcon{width:27px;height:27px}.catTop>strong{grid-column:1/-1}.cat footer{display:block}.cat footer b{display:block;margin-top:2px}.desktopAdd{display:none}.fab{display:block}.row{grid-template-columns:32px 1fr auto;padding:9px}.rowIcon{width:31px;height:31px}.rowCopy span{max-width:190px}.backdrop{place-items:end center;padding:0}.modal{width:100%;max-height:92vh;border-radius:19px 19px 0 0;padding:14px 11px calc(17px + env(safe-area-inset-bottom))}.form{gap:7px}.actions{position:sticky;bottom:0;background:#0b111a;padding-bottom:2px}.settings .actions{flex-direction:column-reverse}.settings .actions button{width:100%}}
@media(max-width:390px){.cats{grid-template-columns:1fr}.checkInputs{grid-template-columns:1fr}.form{grid-template-columns:1fr}.form label{grid-column:1/-1}.rowCopy span{max-width:145px}}
`;
