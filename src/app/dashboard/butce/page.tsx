'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Camera,
  CalendarDays,
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

type Expense = {
  id: string;
  user_id: string;
  amount: number | string;
  category: string;
  merchant: string | null;
  note: string | null;
  spent_at: string;
  payment_method: string | null;
  receipt_path: string | null;
  created_at: string;
};

type BudgetRow = {
  id?: string;
  user_id: string;
  month_start: string;
  total_limit: number | string;
  category_limits: Record<string, number> | null;
};

type ExpenseForm = {
  amount: string;
  category: string;
  merchant: string;
  spent_at: string;
  payment_method: string;
  note: string;
};

const CATEGORY_META = [
  { key: 'Market / Gıda', short: 'Market', icon: ShoppingCart },
  { key: 'Yakıt / Ulaşım', short: 'Yakıt', icon: Fuel },
  { key: 'Dışarıda Yeme', short: 'Yeme', icon: Utensils },
  { key: 'Fatura / İletişim', short: 'Fatura', icon: Wifi },
  { key: 'Sağlık', short: 'Sağlık', icon: HeartPulse },
  { key: 'Ev / Kişisel', short: 'Ev', icon: Home },
  { key: 'Diğer', short: 'Diğer', icon: MoreHorizontal },
] as const;

const DEFAULT_CATEGORY_LIMITS: Record<string, number> = {
  'Market / Gıda': 11000,
  'Yakıt / Ulaşım': 11000,
  'Dışarıda Yeme': 4000,
  'Fatura / İletişim': 4500,
  Sağlık: 2000,
  'Ev / Kişisel': 2000,
  Diğer: 1500,
};

const DEFAULT_TOTAL_LIMIT = 36000;
const PAYMENT_METHODS = ['Banka Kartı', 'Kredi Kartı', 'Nakit', 'Havale / EFT'];

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function localMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

function monthBounds(month: string) {
  const [year, monthNumber] = month.split('-').map(Number);
  const next = monthNumber === 12 ? `${year + 1}-01-01` : `${year}-${pad(monthNumber + 1)}-01`;
  return { start: `${month}-01`, next };
}

function daysInSelectedMonth(month: string) {
  const [year, monthNumber] = month.split('-').map(Number);
  return new Date(year, monthNumber, 0).getDate();
}

function money(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function dateLabel(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short' }).format(
    new Date(year, month - 1, day)
  );
}

function percent(part: number, whole: number) {
  if (whole <= 0) return 0;
  return Math.min(100, Math.max(0, (part / whole) * 100));
}

function parseAmount(value: string) {
  const cleaned = value.replace(/\s/g, '').replace(',', '.');
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function statusForRatio(ratio: number) {
  if (ratio >= 1) return 'danger';
  if (ratio >= 0.8) return 'warn';
  return 'ok';
}

export default function BudgetTrackerPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [authReady, setAuthReady] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(localMonthKey());
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [totalLimit, setTotalLimit] = useState(DEFAULT_TOTAL_LIMIT);
  const [categoryLimits, setCategoryLimits] = useState<Record<string, number>>(DEFAULT_CATEGORY_LIMITS);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState('');
  const [plannedAmount, setPlannedAmount] = useState('');
  const [plannedCategory, setPlannedCategory] = useState(CATEGORY_META[0].key);
  const [form, setForm] = useState<ExpenseForm>({
    amount: '',
    category: CATEGORY_META[0].key,
    merchant: '',
    spent_at: localDateKey(),
    payment_method: 'Banka Kartı',
    note: '',
  });

  useEffect(() => {
    let mounted = true;
    supabase.auth
      .getSession()
      .then(({ data: { session } }: { data: { session: any } }) => {
        if (!mounted) return;
        if (!session) {
          router.replace('/giris?next=/dashboard/butce');
          return;
        }
        setUser(session.user);
        setAuthReady(true);
      })
      .catch(() => setAuthReady(true));
    return () => {
      mounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (!receiptFile) {
      setReceiptPreview('');
      return;
    }
    const url = URL.createObjectURL(receiptFile);
    setReceiptPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [receiptFile]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      setMessage('');
      const { start, next } = monthBounds(selectedMonth);
      const [expenseResult, budgetResult] = await Promise.all([
        supabase
          .from('personal_expenses')
          .select('*')
          .eq('user_id', user.id)
          .gte('spent_at', start)
          .lt('spent_at', next)
          .order('spent_at', { ascending: false })
          .order('created_at', { ascending: false }),
        supabase
          .from('personal_monthly_budgets')
          .select('*')
          .eq('user_id', user.id)
          .eq('month_start', start)
          .maybeSingle(),
      ]);

      if (expenseResult.error) setMessage(expenseResult.error.message || 'Harcamalar alınamadı.');
      setExpenses((expenseResult.data || []) as Expense[]);

      const row = budgetResult.data as BudgetRow | null;
      if (row) {
        setTotalLimit(Number(row.total_limit) || DEFAULT_TOTAL_LIMIT);
        setCategoryLimits({ ...DEFAULT_CATEGORY_LIMITS, ...(row.category_limits || {}) });
      } else {
        setTotalLimit(DEFAULT_TOTAL_LIMIT);
        setCategoryLimits(DEFAULT_CATEGORY_LIMITS);
      }
      setLoading(false);
    };
    load();
  }, [selectedMonth, user]);

  const totalSpent = useMemo(
    () => expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [expenses]
  );

  const categorySpent = useMemo(() => {
    const map: Record<string, number> = {};
    for (const category of CATEGORY_META) map[category.key] = 0;
    for (const item of expenses) map[item.category] = (map[item.category] || 0) + Number(item.amount || 0);
    return map;
  }, [expenses]);

  const todayKey = localDateKey();
  const currentMonth = localMonthKey();
  const isCurrentMonth = selectedMonth === currentMonth;
  const todaySpent = isCurrentMonth
    ? expenses.filter((item) => item.spent_at === todayKey).reduce((sum, item) => sum + Number(item.amount || 0), 0)
    : 0;
  const spentBeforeToday = isCurrentMonth
    ? expenses.filter((item) => item.spent_at < todayKey).reduce((sum, item) => sum + Number(item.amount || 0), 0)
    : totalSpent;
  const today = new Date();
  const remainingDays = isCurrentMonth
    ? Math.max(1, daysInSelectedMonth(selectedMonth) - today.getDate() + 1)
    : Math.max(1, daysInSelectedMonth(selectedMonth));
  const dailyTarget = isCurrentMonth ? Math.max(0, (totalLimit - spentBeforeToday) / remainingDays) : 0;
  const todayRemaining = isCurrentMonth ? Math.max(0, dailyTarget - todaySpent) : 0;
  const overallRemaining = Math.max(0, totalLimit - totalSpent);
  const overallOver = Math.max(0, totalSpent - totalLimit);
  const overallRatio = totalLimit > 0 ? totalSpent / totalLimit : 0;
  const overallStatus = statusForRatio(overallRatio);

  const planned = parseAmount(plannedAmount);
  const plannedCategoryRemaining = Math.max(
    0,
    Number(categoryLimits[plannedCategory] || 0) - Number(categorySpent[plannedCategory] || 0)
  );
  const planDailyFits = !isCurrentMonth || planned <= todayRemaining;
  const planCategoryFits = planned <= plannedCategoryRemaining || !categoryLimits[plannedCategory];
  const planFits = planned > 0 && planDailyFits && planCategoryFits && planned <= overallRemaining;

  const resetForm = () => {
    setForm({
      amount: '',
      category: CATEGORY_META[0].key,
      merchant: '',
      spent_at: localDateKey(),
      payment_method: 'Banka Kartı',
      note: '',
    });
    setReceiptFile(null);
    setAddOpen(false);
  };

  const saveBudget = async () => {
    if (!user) return;
    if (totalLimit <= 0) {
      setMessage('Aylık limit 0 TL’den büyük olmalı.');
      return;
    }
    setSaving(true);
    setMessage('');
    const { start } = monthBounds(selectedMonth);
    const payload = {
      user_id: user.id,
      month_start: start,
      total_limit: totalLimit,
      category_limits: categoryLimits,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase
      .from('personal_monthly_budgets')
      .upsert(payload, { onConflict: 'user_id,month_start' });
    setSaving(false);
    if (error) {
      setMessage(error.message || 'Bütçe kaydedilemedi.');
      return;
    }
    setSettingsOpen(false);
    setMessage('Bütçe limitleri kaydedildi.');
  };

  const handleReceipt = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setMessage('Fiş fotoğrafı en fazla 10 MB olabilir.');
      event.target.value = '';
      return;
    }
    setReceiptFile(file);
  };

  const addExpense = async () => {
    if (!user || saving) return;
    const amount = parseAmount(form.amount);
    if (amount <= 0) {
      setMessage('Geçerli bir harcama tutarı gir.');
      return;
    }

    setSaving(true);
    setMessage('');
    let receiptPath: string | null = null;

    try {
      if (receiptFile) {
        const rawExt = receiptFile.name.split('.').pop()?.toLowerCase() || '';
        const mimeExt = receiptFile.type.split('/').pop()?.replace('jpeg', 'jpg') || 'jpg';
        const ext = /^[a-z0-9]{2,5}$/.test(rawExt) ? rawExt : mimeExt;
        receiptPath = `${user.id}/${form.spent_at.slice(0, 7)}/${crypto.randomUUID()}.${ext}`;
        const upload = await supabase.storage.from('expense-receipts').upload(receiptPath, receiptFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: receiptFile.type || undefined,
        });
        if (upload.error) throw upload.error;
      }

      const insert = await supabase
        .from('personal_expenses')
        .insert({
          user_id: user.id,
          amount,
          category: form.category,
          merchant: form.merchant.trim() || null,
          spent_at: form.spent_at,
          payment_method: form.payment_method || null,
          note: form.note.trim() || null,
          receipt_path: receiptPath,
        })
        .select('*')
        .single();

      if (insert.error) throw insert.error;
      setExpenses((current) => [insert.data as Expense, ...current]);
      resetForm();
      setMessage('Harcama kaydedildi.');
    } catch (error: any) {
      if (receiptPath) await supabase.storage.from('expense-receipts').remove([receiptPath]);
      setMessage(error?.message || 'Harcama kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  const removeExpense = async (expense: Expense) => {
    if (!user || !window.confirm(`${money(Number(expense.amount))} harcamayı silmek istiyor musun?`)) return;
    const { error } = await supabase
      .from('personal_expenses')
      .delete()
      .eq('id', expense.id)
      .eq('user_id', user.id);
    if (error) {
      setMessage(error.message || 'Harcama silinemedi.');
      return;
    }
    if (expense.receipt_path) await supabase.storage.from('expense-receipts').remove([expense.receipt_path]);
    setExpenses((current) => current.filter((item) => item.id !== expense.id));
  };

  const openReceipt = async (path: string) => {
    const { data, error } = await supabase.storage.from('expense-receipts').createSignedUrl(path, 120);
    if (error || !data?.signedUrl) {
      setMessage(error?.message || 'Fiş açılamadı.');
      return;
    }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  };

  if (!authReady || loading) {
    return (
      <main className="budget-page budget-loading">
        <div className="budget-spinner" />
        <span>Bütçen hazırlanıyor...</span>
        <style>{PAGE_CSS}</style>
      </main>
    );
  }

  return (
    <main className="budget-page">
      <style>{PAGE_CSS}</style>
      <div className="budget-shell">
        <div className="budget-topbar">
          <div className="budget-title-wrap">
            <Link href="/dashboard" className="budget-back" aria-label="Panele dön"><ArrowLeft size={18} /></Link>
            <div>
              <div className="budget-kicker"><WalletCards size={14} /> Kişisel bütçe</div>
              <h1>Harcama kontrolü</h1>
              <p>Fişini çek, harcamanı kaydet ve ay sonunu görerek harca.</p>
            </div>
          </div>
          <div className="budget-top-actions">
            <label className="budget-month-picker">
              <CalendarDays size={15} />
              <input type="month" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} />
            </label>
            <button className="budget-icon-btn" type="button" onClick={() => setSettingsOpen(true)} aria-label="Bütçe ayarları"><Settings2 size={18} /></button>
          </div>
        </div>

        {message && <div className="budget-message" onClick={() => setMessage('')}>{message}<X size={15} /></div>}

        <section className="budget-summary-grid">
          <article className={`budget-card budget-hero budget-${overallStatus}`}>
            <div className="budget-card-head"><span>Aylık bütçe</span><Gauge size={18} /></div>
            <div className="budget-hero-numbers">
              <strong>{money(totalSpent)}</strong>
              <span>/ {money(totalLimit)}</span>
            </div>
            <div className="budget-progress"><i style={{ width: `${percent(totalSpent, totalLimit)}%` }} /></div>
            <div className="budget-hero-foot">
              {overallOver > 0 ? <b>{money(overallOver)} limit üstü</b> : <b>{money(overallRemaining)} kaldı</b>}
              <span>%{Math.round(percent(totalSpent, totalLimit))} kullanıldı</span>
            </div>
          </article>

          <article className="budget-card budget-daily">
            <div className="budget-card-head"><span>Bugün harcayabilirsin</span><CircleDollarSign size={18} /></div>
            {isCurrentMonth ? (
              <>
                <strong>{money(todayRemaining)}</strong>
                <p>Şu andan ay sonuna kadar planı bozmadan kullanabileceğin tutar.</p>
                <div className="budget-mini-row"><span>Bugün harcanan</span><b>{money(todaySpent)}</b></div>
                <div className="budget-mini-row"><span>Günlük hedef</span><b>{money(dailyTarget)}</b></div>
              </>
            ) : (
              <>
                <strong>{money(overallRemaining)}</strong>
                <p>Seçili ayın kalan bütçesi.</p>
                <div className="budget-mini-row"><span>Toplam harcama</span><b>{money(totalSpent)}</b></div>
              </>
            )}
          </article>

          <article className="budget-card budget-check">
            <div className="budget-card-head"><span>Almadan önce kontrol et</span><CheckCircle2 size={18} /></div>
            <div className="budget-check-inputs">
              <label><span>Tutar</span><div className="budget-money-input"><input inputMode="decimal" placeholder="0" value={plannedAmount} onChange={(event) => setPlannedAmount(event.target.value)} /><b>TL</b></div></label>
              <label><span>Kategori</span><div className="budget-select"><select value={plannedCategory} onChange={(event) => setPlannedCategory(event.target.value)}>{CATEGORY_META.map((item) => <option key={item.key}>{item.key}</option>)}</select><ChevronDown size={14} /></div></label>
            </div>
            {planned > 0 && (
              <div className={`budget-plan-result ${planFits ? 'fits' : 'nope'}`}>
                {planFits ? (
                  <><CheckCircle2 size={16} /><span>Bu harcama plana sığıyor. Sonrasında toplam {money(Math.max(0, overallRemaining - planned))} kalır.</span></>
                ) : (
                  <><Gauge size={16} /><span>{!planCategoryFits ? `${plannedCategory} kategorisinde yalnızca ${money(plannedCategoryRemaining)} kaldı.` : !planDailyFits ? `Bugün için önerilen kalan tutar ${money(todayRemaining)}.` : `Aylık bütçede yalnızca ${money(overallRemaining)} kaldı.`}</span></>
                )}
              </div>
            )}
          </article>
        </section>

        <section className="budget-content-grid">
          <div className="budget-main-col">
            <div className="budget-section-head">
              <div><span>KATEGORİLER</span><h2>Nereye gidiyor?</h2></div>
              <button type="button" className="budget-primary" onClick={() => setAddOpen(true)}><Plus size={17} /> Harcama ekle</button>
            </div>

            <div className="budget-category-grid">
              {CATEGORY_META.map((category) => {
                const Icon = category.icon;
                const spent = Number(categorySpent[category.key] || 0);
                const limit = Number(categoryLimits[category.key] || 0);
                const ratio = limit > 0 ? spent / limit : 0;
                const state = statusForRatio(ratio);
                return (
                  <article className={`budget-category budget-${state}`} key={category.key}>
                    <div className="budget-category-top"><div className="budget-category-icon"><Icon size={18} /></div><span>{category.short}</span><b>{money(spent)}</b></div>
                    <div className="budget-category-progress"><i style={{ width: `${percent(spent, limit)}%` }} /></div>
                    <div className="budget-category-foot"><span>Limit {money(limit)}</span><strong>{spent > limit ? `${money(spent - limit)} aşıldı` : `${money(Math.max(0, limit - spent))} kaldı`}</strong></div>
                  </article>
                );
              })}
            </div>

            <div className="budget-section-head budget-history-head">
              <div><span>HAREKETLER</span><h2>Son harcamalar</h2></div>
              <b>{expenses.length} kayıt</b>
            </div>

            <div className="budget-history">
              {expenses.length === 0 ? (
                <div className="budget-empty"><ReceiptText size={28} /><strong>Bu ay kayıt yok</strong><span>İlk harcamayı elle gir veya fiş fotoğrafıyla kaydet.</span><button type="button" className="budget-primary" onClick={() => setAddOpen(true)}><Plus size={16} /> İlk harcamayı ekle</button></div>
              ) : expenses.map((expense) => {
                const category = CATEGORY_META.find((item) => item.key === expense.category) || CATEGORY_META[CATEGORY_META.length - 1];
                const Icon = category.icon;
                return (
                  <article className="budget-history-row" key={expense.id}>
                    <div className="budget-history-icon"><Icon size={18} /></div>
                    <div className="budget-history-copy">
                      <strong>{expense.merchant || expense.category}</strong>
                      <span>{dateLabel(expense.spent_at)} · {expense.category}{expense.payment_method ? ` · ${expense.payment_method}` : ''}</span>
                      {expense.note && <small>{expense.note}</small>}
                    </div>
                    <div className="budget-history-side"><b>{money(Number(expense.amount))}</b><div>{expense.receipt_path && <button type="button" onClick={() => openReceipt(expense.receipt_path!)} title="Fişi aç"><FileImage size={16} /></button>}<button type="button" onClick={() => removeExpense(expense)} title="Sil"><Trash2 size={15} /></button></div></div>
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="budget-side-col">
            <article className="budget-card budget-rule-card">
              <span className="budget-side-kicker">BU AYIN KURALI</span>
              <h3>Küçük harcama = bedava değil</h3>
              <p>500 TL altındaki işlemleri de kaydet. En görünmez kaçaklar küçük ama sık ödemelerden oluşuyor.</p>
              <div className="budget-rule-stat"><span>Kalan gün</span><b>{isCurrentMonth ? remainingDays : daysInSelectedMonth(selectedMonth)}</b></div>
              <div className="budget-rule-stat"><span>Kalan bütçe</span><b>{money(overallRemaining)}</b></div>
            </article>

            <article className="budget-card budget-guide-card">
              <span className="budget-side-kicker">HEDEF DAĞILIM</span>
              <h3>{money(totalLimit)} tavan</h3>
              <p>Bu limitleri istediğin zaman düzenleyebilirsin.</p>
              <div className="budget-guide-list">
                {CATEGORY_META.map((category) => <div key={category.key}><span>{category.short}</span><b>{money(Number(categoryLimits[category.key] || 0))}</b></div>)}
              </div>
              <button type="button" className="budget-secondary" onClick={() => setSettingsOpen(true)}><Settings2 size={15} /> Limitleri düzenle</button>
            </article>
          </aside>
        </section>
      </div>

      <button type="button" className="budget-fab" onClick={() => setAddOpen(true)} aria-label="Harcama ekle"><Plus size={24} /></button>

      {addOpen && (
        <div className="budget-modal-backdrop" onClick={resetForm}>
          <div className="budget-modal" onClick={(event) => event.stopPropagation()}>
            <div className="budget-modal-head"><div><span>YENİ HARCAMA</span><h2>Harcama kaydet</h2></div><button type="button" onClick={resetForm}><X size={20} /></button></div>

            <label className="budget-receipt-drop">
              {receiptPreview ? <img src={receiptPreview} alt="Fiş önizleme" /> : <div><Camera size={26} /><strong>Fişin fotoğrafını çek</strong><span>Kamera açılır; istersen galeriden de seçebilirsin.</span></div>}
              <input type="file" accept="image/*" capture="environment" onChange={handleReceipt} />
              {receiptPreview && <span className="budget-receipt-change">Fotoğrafı değiştir</span>}
            </label>

            <div className="budget-form-grid">
              <label className="budget-field budget-amount-field"><span>Tutar *</span><div className="budget-money-input"><input autoFocus inputMode="decimal" placeholder="0,00" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} /><b>TL</b></div></label>
              <label className="budget-field"><span>Kategori *</span><div className="budget-select"><select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>{CATEGORY_META.map((item) => <option key={item.key}>{item.key}</option>)}</select><ChevronDown size={14} /></div></label>
              <label className="budget-field"><span>İşyeri / açıklama</span><input placeholder="ŞOK, akaryakıt, kahve..." value={form.merchant} onChange={(event) => setForm((current) => ({ ...current, merchant: event.target.value }))} /></label>
              <label className="budget-field"><span>Tarih</span><input type="date" value={form.spent_at} onChange={(event) => setForm((current) => ({ ...current, spent_at: event.target.value }))} /></label>
              <label className="budget-field"><span>Ödeme yöntemi</span><div className="budget-select"><select value={form.payment_method} onChange={(event) => setForm((current) => ({ ...current, payment_method: event.target.value }))}>{PAYMENT_METHODS.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></div></label>
              <label className="budget-field budget-note-field"><span>Not</span><input placeholder="İstersen kısa not ekle" value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} /></label>
            </div>

            <div className="budget-modal-actions"><button type="button" className="budget-secondary" onClick={resetForm}>Vazgeç</button><button type="button" className="budget-primary" disabled={saving} onClick={addExpense}><Save size={16} /> {saving ? 'Kaydediliyor...' : 'Kaydet'}</button></div>
          </div>
        </div>
      )}

      {settingsOpen && (
        <div className="budget-modal-backdrop" onClick={() => setSettingsOpen(false)}>
          <div className="budget-modal budget-settings" onClick={(event) => event.stopPropagation()}>
            <div className="budget-modal-head"><div><span>BÜTÇE AYARLARI</span><h2>Aylık limitleri belirle</h2></div><button type="button" onClick={() => setSettingsOpen(false)}><X size={20} /></button></div>
            <label className="budget-field budget-total-setting"><span>Toplam aylık harcama tavanı</span><div className="budget-money-input"><input inputMode="decimal" value={String(totalLimit)} onChange={(event) => setTotalLimit(parseAmount(event.target.value))} /><b>TL</b></div></label>
            <div className="budget-settings-list">
              {CATEGORY_META.map((category) => {
                const Icon = category.icon;
                return <label key={category.key}><span><Icon size={16} />{category.key}</span><div className="budget-money-input"><input inputMode="decimal" value={String(categoryLimits[category.key] || 0)} onChange={(event) => setCategoryLimits((current) => ({ ...current, [category.key]: parseAmount(event.target.value) }))} /><b>TL</b></div></label>;
              })}
            </div>
            <div className="budget-settings-total"><span>Kategori limitleri toplamı</span><b>{money(Object.values(categoryLimits).reduce((sum, item) => sum + Number(item || 0), 0))}</b></div>
            <p className="budget-settings-note">Başlangıç hedefi 36.000 TL olarak ayarlandı. Gerçek yaşam düzenine göre limitleri değiştirebilirsin.</p>
            <div className="budget-modal-actions"><button type="button" className="budget-secondary" onClick={() => { setTotalLimit(DEFAULT_TOTAL_LIMIT); setCategoryLimits(DEFAULT_CATEGORY_LIMITS); }}>36.000 TL hedefini yükle</button><button type="button" className="budget-primary" disabled={saving} onClick={saveBudget}><Save size={16} /> {saving ? 'Kaydediliyor...' : 'Limitleri kaydet'}</button></div>
          </div>
        </div>
      )}
    </main>
  );
}

const PAGE_CSS = `
  .budget-page{min-height:calc(100vh - 56px);background:var(--bg);color:var(--ink);padding:22px 18px 96px}.budget-shell{max-width:1320px;margin:0 auto}.budget-loading{display:grid;place-items:center;align-content:center;gap:12px;color:var(--ink-4)}.budget-spinner{width:34px;height:34px;border:2px solid var(--border);border-top-color:var(--amber);border-radius:50%;animation:budget-spin .8s linear infinite}@keyframes budget-spin{to{transform:rotate(360deg)}}
  .budget-topbar{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:18px}.budget-title-wrap{display:flex;gap:12px;align-items:flex-start}.budget-back,.budget-icon-btn{width:40px;height:40px;border:1px solid var(--border);background:var(--bg-card);border-radius:12px;color:var(--ink-2);display:grid;place-items:center;text-decoration:none;cursor:pointer}.budget-title-wrap h1{font-size:clamp(25px,4vw,38px);line-height:1.05;margin:3px 0 6px;letter-spacing:-.035em}.budget-title-wrap p{margin:0;color:var(--ink-4);font-size:13px}.budget-kicker,.budget-side-kicker,.budget-modal-head span,.budget-section-head>div>span{display:flex;align-items:center;gap:6px;color:var(--amber);font-size:10px;font-weight:850;letter-spacing:.1em;text-transform:uppercase}.budget-top-actions{display:flex;gap:8px}.budget-month-picker{height:40px;padding:0 12px;border:1px solid var(--border);background:var(--bg-card);border-radius:12px;display:flex;align-items:center;gap:8px;color:var(--ink-3)}.budget-month-picker input{border:0;background:transparent;color:var(--ink);font:inherit;outline:0;color-scheme:dark}
  .budget-message{max-width:700px;margin:0 0 14px;padding:10px 12px;border:1px solid rgba(229,149,0,.35);background:rgba(229,149,0,.08);color:var(--ink-2);border-radius:11px;display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:12px;cursor:pointer}
  .budget-summary-grid{display:grid;grid-template-columns:1.05fr .85fr 1.25fr;gap:12px;margin-bottom:22px}.budget-card{background:var(--bg-card);border:1px solid var(--border);border-radius:18px;padding:18px;box-shadow:0 14px 36px rgba(0,0,0,.08)}.budget-card-head{display:flex;align-items:center;justify-content:space-between;color:var(--ink-4);font-size:11px;font-weight:750;text-transform:uppercase;letter-spacing:.06em}.budget-hero-numbers{display:flex;align-items:baseline;gap:7px;margin:12px 0 13px}.budget-hero-numbers strong{font-size:32px;letter-spacing:-.04em}.budget-hero-numbers span{font-size:13px;color:var(--ink-4)}.budget-progress,.budget-category-progress{height:7px;background:rgba(148,163,184,.12);border-radius:999px;overflow:hidden}.budget-progress i,.budget-category-progress i{display:block;height:100%;background:var(--amber);border-radius:999px}.budget-warn .budget-progress i,.budget-warn .budget-category-progress i{background:#f59e0b}.budget-danger .budget-progress i,.budget-danger .budget-category-progress i{background:#ef4444}.budget-hero-foot{margin-top:10px;display:flex;justify-content:space-between;gap:8px;font-size:11px}.budget-hero-foot span{color:var(--ink-4)}.budget-danger .budget-hero-foot b{color:#f87171}.budget-daily strong{display:block;font-size:31px;letter-spacing:-.04em;margin:10px 0 2px;color:#35d39a}.budget-daily p{font-size:11px;line-height:1.5;color:var(--ink-4);margin:0 0 12px}.budget-mini-row{display:flex;justify-content:space-between;border-top:1px solid var(--border);padding:7px 0 0;margin-top:7px;font-size:11px}.budget-mini-row span{color:var(--ink-4)}
  .budget-check-inputs{display:grid;grid-template-columns:.75fr 1.25fr;gap:8px;margin-top:11px}.budget-check-inputs label>span,.budget-field>span{display:block;font-size:10px;color:var(--ink-4);margin-bottom:5px}.budget-money-input,.budget-select{height:40px;border:1px solid var(--border);background:rgba(255,255,255,.025);border-radius:10px;display:flex;align-items:center;overflow:hidden}.budget-money-input input,.budget-select select{min-width:0;flex:1;height:100%;border:0;outline:0;background:transparent;color:var(--ink);padding:0 10px;font:inherit;font-size:13px}.budget-money-input b{font-size:10px;color:var(--ink-4);padding-right:10px}.budget-select{position:relative}.budget-select select{appearance:none;padding-right:28px}.budget-select svg{position:absolute;right:9px;pointer-events:none;color:var(--ink-4)}.budget-select option{background:#0d131d;color:#fff}.budget-plan-result{display:flex;align-items:flex-start;gap:7px;margin-top:9px;padding:8px 9px;border-radius:9px;font-size:10px;line-height:1.45}.budget-plan-result.fits{background:rgba(53,211,154,.09);color:#6ee7b7;border:1px solid rgba(53,211,154,.18)}.budget-plan-result.nope{background:rgba(239,68,68,.08);color:#fca5a5;border:1px solid rgba(239,68,68,.16)}
  .budget-content-grid{display:grid;grid-template-columns:minmax(0,1fr) 292px;gap:16px;align-items:start}.budget-main-col{min-width:0}.budget-section-head{display:flex;align-items:end;justify-content:space-between;gap:12px;margin-bottom:11px}.budget-section-head h2{font-size:18px;margin:3px 0 0;letter-spacing:-.02em}.budget-section-head>b{font-size:11px;color:var(--ink-4)}.budget-primary,.budget-secondary{min-height:38px;border-radius:11px;padding:0 13px;border:1px solid var(--border);font:inherit;font-size:11px;font-weight:800;display:inline-flex;align-items:center;justify-content:center;gap:7px;cursor:pointer}.budget-primary{background:var(--amber);color:#080b10;border-color:var(--amber)}.budget-secondary{background:var(--bg-card);color:var(--ink-2)}.budget-primary:disabled{opacity:.6;cursor:wait}.budget-category-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.budget-category{border:1px solid var(--border);background:var(--bg-card);border-radius:14px;padding:12px}.budget-category-top{display:grid;grid-template-columns:32px 1fr auto;align-items:center;gap:8px}.budget-category-icon{width:30px;height:30px;border-radius:9px;background:rgba(229,149,0,.08);color:var(--amber);display:grid;place-items:center}.budget-category-top span{font-size:11px;color:var(--ink-3);font-weight:700}.budget-category-top b{font-size:12px}.budget-category-progress{height:5px;margin:10px 0 7px}.budget-category-foot{display:flex;justify-content:space-between;gap:10px;font-size:9px;color:var(--ink-4)}.budget-category-foot strong{color:var(--ink-3)}.budget-category.budget-danger .budget-category-foot strong{color:#f87171}
  .budget-history-head{margin-top:22px}.budget-history{border:1px solid var(--border);border-radius:16px;background:var(--bg-card);overflow:hidden}.budget-history-row{display:grid;grid-template-columns:38px minmax(0,1fr) auto;gap:10px;align-items:center;padding:11px 12px;border-bottom:1px solid var(--border)}.budget-history-row:last-child{border-bottom:0}.budget-history-icon{width:36px;height:36px;border-radius:11px;background:rgba(148,163,184,.08);display:grid;place-items:center;color:var(--ink-3)}.budget-history-copy{min-width:0;display:flex;flex-direction:column;gap:2px}.budget-history-copy strong{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.budget-history-copy span,.budget-history-copy small{font-size:9px;color:var(--ink-4);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.budget-history-side{text-align:right}.budget-history-side>b{display:block;font-size:12px}.budget-history-side>div{display:flex;justify-content:flex-end;gap:4px;margin-top:4px}.budget-history-side button{width:27px;height:25px;border:1px solid var(--border);background:transparent;color:var(--ink-4);border-radius:7px;display:grid;place-items:center;cursor:pointer}.budget-empty{padding:42px 20px;display:flex;flex-direction:column;align-items:center;text-align:center;color:var(--ink-4);gap:7px}.budget-empty strong{color:var(--ink-2);font-size:13px}.budget-empty span{font-size:10px;max-width:320px;line-height:1.5}.budget-empty .budget-primary{margin-top:6px}
  .budget-side-col{display:flex;flex-direction:column;gap:10px;position:sticky;top:72px}.budget-rule-card h3,.budget-guide-card h3{font-size:17px;letter-spacing:-.02em;margin:7px 0}.budget-rule-card p,.budget-guide-card p{font-size:10px;line-height:1.55;color:var(--ink-4);margin:0 0 12px}.budget-rule-stat{display:flex;justify-content:space-between;padding:8px 0;border-top:1px solid var(--border);font-size:10px}.budget-rule-stat span{color:var(--ink-4)}.budget-guide-list{border-top:1px solid var(--border);margin-top:7px}.budget-guide-list>div{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid var(--border);font-size:9px}.budget-guide-list span{color:var(--ink-4)}.budget-guide-card .budget-secondary{width:100%;margin-top:11px}
  .budget-fab{display:none;position:fixed;right:18px;bottom:82px;width:54px;height:54px;border-radius:17px;background:var(--amber);border:0;color:#090c10;box-shadow:0 12px 30px rgba(229,149,0,.35);z-index:30;place-items:center}
  .budget-modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.72);backdrop-filter:blur(5px);z-index:90;display:grid;place-items:center;padding:18px}.budget-modal{width:min(640px,100%);max-height:calc(100vh - 36px);overflow:auto;background:#0b111a;border:1px solid var(--border);border-radius:20px;padding:18px;box-shadow:0 30px 90px rgba(0,0,0,.45)}.budget-modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:13px}.budget-modal-head h2{font-size:20px;margin:4px 0 0}.budget-modal-head>button{width:34px;height:34px;border:1px solid var(--border);background:transparent;color:var(--ink-3);border-radius:10px;display:grid;place-items:center}.budget-receipt-drop{position:relative;min-height:132px;border:1px dashed rgba(229,149,0,.45);background:rgba(229,149,0,.035);border-radius:15px;display:grid;place-items:center;overflow:hidden;cursor:pointer;margin-bottom:12px}.budget-receipt-drop input{position:absolute;inset:0;opacity:0;cursor:pointer}.budget-receipt-drop>div{display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center;color:var(--ink-3)}.budget-receipt-drop>div strong{font-size:12px}.budget-receipt-drop>div span{font-size:9px;color:var(--ink-4)}.budget-receipt-drop img{width:100%;height:180px;object-fit:cover}.budget-receipt-change{position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,.72);padding:5px 8px;border-radius:7px;font-size:9px;color:#fff}.budget-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.budget-field>input{width:100%;height:40px;border:1px solid var(--border);background:rgba(255,255,255,.025);border-radius:10px;color:var(--ink);padding:0 10px;font:inherit;font-size:12px;outline:0;color-scheme:dark}.budget-amount-field .budget-money-input input{font-size:19px;font-weight:800}.budget-note-field{grid-column:1/-1}.budget-modal-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:15px;padding-top:13px;border-top:1px solid var(--border)}
  .budget-settings{width:min(560px,100%)}.budget-total-setting{margin-bottom:13px}.budget-total-setting .budget-money-input{height:48px}.budget-total-setting input{font-size:20px;font-weight:800}.budget-settings-list{border:1px solid var(--border);border-radius:14px;overflow:hidden}.budget-settings-list>label{display:grid;grid-template-columns:1fr 145px;align-items:center;gap:10px;padding:8px 10px;border-bottom:1px solid var(--border)}.budget-settings-list>label:last-child{border-bottom:0}.budget-settings-list>label>span{display:flex;align-items:center;gap:7px;font-size:10px;color:var(--ink-3)}.budget-settings-list .budget-money-input{height:34px}.budget-settings-total{display:flex;justify-content:space-between;font-size:10px;padding:10px 2px 0;color:var(--ink-4)}.budget-settings-total b{color:var(--ink-2)}.budget-settings-note{font-size:9px;color:var(--ink-4);line-height:1.5;margin:10px 0 0}
  @media(max-width:980px){.budget-summary-grid{grid-template-columns:1fr 1fr}.budget-check{grid-column:1/-1}.budget-content-grid{grid-template-columns:1fr}.budget-side-col{position:static;display:grid;grid-template-columns:1fr 1fr}}
  @media(max-width:680px){.budget-page{padding:14px 10px 112px}.budget-topbar{align-items:flex-start}.budget-title-wrap{gap:8px}.budget-back{width:36px;height:36px}.budget-title-wrap h1{font-size:24px}.budget-title-wrap p{font-size:10px;max-width:240px}.budget-top-actions{flex-direction:column;align-items:flex-end}.budget-month-picker{height:36px;padding:0 8px}.budget-month-picker input{width:112px;font-size:11px}.budget-icon-btn{width:36px;height:36px}.budget-summary-grid{grid-template-columns:1fr;gap:8px;margin-bottom:17px}.budget-card{padding:14px;border-radius:15px}.budget-check{grid-column:auto}.budget-hero-numbers strong,.budget-daily strong{font-size:27px}.budget-check-inputs{grid-template-columns:1fr 1fr}.budget-content-grid{display:block}.budget-side-col{display:none}.budget-category-grid{grid-template-columns:1fr 1fr;gap:7px}.budget-category{padding:10px}.budget-category-top{grid-template-columns:28px 1fr;gap:6px}.budget-category-icon{width:27px;height:27px}.budget-category-top b{grid-column:1/-1;font-size:13px;margin-top:2px}.budget-category-foot{display:block}.budget-category-foot strong{display:block;margin-top:2px}.budget-section-head .budget-primary{display:none}.budget-fab{display:grid}.budget-history-row{grid-template-columns:34px minmax(0,1fr) auto;padding:9px}.budget-history-icon{width:32px;height:32px}.budget-history-copy span{max-width:190px}.budget-modal-backdrop{place-items:end center;padding:0}.budget-modal{width:100%;max-height:92vh;border-radius:20px 20px 0 0;padding:15px 12px calc(18px + env(safe-area-inset-bottom))}.budget-form-grid{grid-template-columns:1fr 1fr;gap:8px}.budget-amount-field,.budget-note-field{grid-column:1/-1}.budget-receipt-drop{min-height:105px}.budget-receipt-drop img{height:145px}.budget-modal-actions{position:sticky;bottom:0;background:#0b111a;padding-bottom:2px}.budget-settings-list>label{grid-template-columns:1fr 125px}.budget-settings .budget-modal-actions{flex-direction:column-reverse}.budget-settings .budget-modal-actions button{width:100%}}
  @media(max-width:390px){.budget-category-grid{grid-template-columns:1fr}.budget-check-inputs{grid-template-columns:1fr}.budget-history-copy span{max-width:150px}.budget-form-grid{grid-template-columns:1fr}.budget-field{grid-column:1/-1}}
`;
