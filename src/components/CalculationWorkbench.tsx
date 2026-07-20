'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  ClipboardCopy,
  Download,
  HardDrive,
  RotateCcw,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import {
  clearCalculationDraft,
  createSnapshotId,
  deleteCalculationSnapshot,
  getCalculationDraft,
  getCalculationSnapshots,
  saveCalculationDraft,
  saveCalculationSnapshot,
  type CalculationSnapshot,
  type StoredField,
} from '@/lib/calculationWorkspace';
import { trackEvent } from '@/lib/analytics';

type Props = {
  toolSlug: string;
  toolName: string;
};

type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const MAX_FIELDS = 40;
const MAX_RESULTS = 14;

function getRoot() {
  return document.querySelector<HTMLElement>('#hesaplama .tool-compact-calculator');
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function getFieldLabel(element: FieldElement, index: number) {
  if (element.id) {
    const linked = document.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(element.id)}"]`);
    if (linked?.textContent) return normalizeText(linked.textContent);
  }

  const wrappingLabel = element.closest('label');
  if (wrappingLabel?.textContent) {
    const cloned = wrappingLabel.cloneNode(true) as HTMLElement;
    cloned.querySelectorAll('input,select,textarea,button').forEach((node) => node.remove());
    const text = normalizeText(cloned.textContent || '');
    if (text) return text;
  }

  const container = element.parentElement;
  if (container) {
    const nearby = container.querySelector<HTMLElement>('label, .calc-title, [class*="label"]');
    const text = normalizeText(nearby?.textContent || '');
    if (text) return text;
  }

  return element.getAttribute('aria-label')
    || element.getAttribute('placeholder')
    || element.getAttribute('name')
    || `Alan ${index + 1}`;
}

function getFieldKey(element: FieldElement, index: number) {
  return element.getAttribute('name')
    || element.id
    || element.getAttribute('aria-label')
    || element.getAttribute('placeholder')
    || `${element.tagName.toLowerCase()}-${index}`;
}

function captureFields(root: HTMLElement): StoredField[] {
  const elements = Array.from(root.querySelectorAll<FieldElement>('input, select, textarea'))
    .filter((element) => {
      if (element.disabled) return false;
      if (element instanceof HTMLInputElement && ['file', 'hidden', 'submit', 'button'].includes(element.type)) return false;
      return true;
    })
    .slice(0, MAX_FIELDS);

  return elements.map((element, index) => {
    const checked = element instanceof HTMLInputElement && ['checkbox', 'radio'].includes(element.type)
      ? element.checked
      : undefined;
    return {
      key: getFieldKey(element, index),
      label: getFieldLabel(element, index),
      value: element.value,
      type: element instanceof HTMLInputElement ? element.type : element.tagName.toLowerCase(),
      checked,
    };
  });
}

function isVisible(element: HTMLElement) {
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && style.visibility !== 'hidden' && element.getClientRects().length > 0;
}

function captureResults(root: HTMLElement): string[] {
  const selectors = [
    '.calc-result',
    '[data-result]',
    '[class*="result-card"]',
    '[class*="ResultCard"]',
    '[class*="result"]',
    '.calc-box-accent',
    '.calc-soft',
    '.bg-gradient-to-br',
  ].join(',');

  const values: string[] = [];
  const seen = new Set<string>();
  const candidates = Array.from(root.querySelectorAll<HTMLElement>(selectors));

  for (const element of candidates) {
    if (!isVisible(element)) continue;
    if (element.querySelector('input, select, textarea')) continue;
    const text = normalizeText(element.innerText || element.textContent || '');
    if (text.length < 3 || text.length > 260 || seen.has(text)) continue;
    if (/^(hesapla|temizle|seçiniz|sonuçlar?)$/i.test(text)) continue;
    seen.add(text);
    values.push(text);
    if (values.length >= MAX_RESULTS) break;
  }

  return values;
}

function setNativeValue(element: FieldElement, value: string, checked?: boolean) {
  if (element instanceof HTMLInputElement && ['checkbox', 'radio'].includes(element.type)) {
    const checkedSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'checked')?.set;
    checkedSetter?.call(element, Boolean(checked));
  } else {
    const prototype = element instanceof HTMLInputElement
      ? HTMLInputElement.prototype
      : element instanceof HTMLSelectElement
        ? HTMLSelectElement.prototype
        : HTMLTextAreaElement.prototype;
    const valueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
    valueSetter?.call(element, value);
  }
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

function restoreFields(root: HTMLElement, fields: StoredField[]) {
  const elements = Array.from(root.querySelectorAll<FieldElement>('input, select, textarea'))
    .filter((element) => !(element instanceof HTMLInputElement && ['file', 'hidden', 'submit', 'button'].includes(element.type)));

  fields.forEach((field, index) => {
    const matching = elements.find((element, elementIndex) => getFieldKey(element, elementIndex) === field.key)
      || elements[index];
    if (matching) setNativeValue(matching, field.value, field.checked);
  });
}

function formatDate(value: number) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function snapshotText(snapshot: CalculationSnapshot) {
  const lines = [snapshot.toolName, formatDate(snapshot.createdAt), ''];
  if (snapshot.fields.length) {
    lines.push('Girdiler');
    snapshot.fields.forEach((field) => lines.push(`${field.label}: ${field.checked === undefined ? field.value : field.checked ? 'Evet' : 'Hayır'}`));
  }
  if (snapshot.results.length) {
    lines.push('', 'Sonuçlar');
    snapshot.results.forEach((result) => lines.push(result));
  }
  return lines.join('\n');
}

function csvEscape(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export default function CalculationWorkbench({ toolSlug, toolName }: Props) {
  const [snapshots, setSnapshots] = useState<CalculationSnapshot[]>([]);
  const [open, setOpen] = useState(false);
  const [restored, setRestored] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [status, setStatus] = useState('');
  const saveTimer = useRef<number | null>(null);
  const restoredRef = useRef(false);

  const syncSnapshots = useCallback(() => {
    setSnapshots(getCalculationSnapshots(toolSlug));
  }, [toolSlug]);

  const flash = useCallback((message: string) => {
    setStatus(message);
    window.setTimeout(() => setStatus(''), 2200);
  }, []);

  const persistDraft = useCallback(() => {
    const root = getRoot();
    if (!root) return;
    const fields = captureFields(root);
    if (!fields.length) return;
    const updatedAt = Date.now();
    saveCalculationDraft({ toolSlug, fields, updatedAt });
    setLastSavedAt(updatedAt);
  }, [toolSlug]);

  useEffect(() => {
    syncSnapshots();
    const sync = () => syncSnapshots();
    window.addEventListener('tooldur:calculation-workspace', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('tooldur:calculation-workspace', sync);
      window.removeEventListener('storage', sync);
    };
  }, [syncSnapshots]);

  useEffect(() => {
    const draft = getCalculationDraft(toolSlug);
    if (draft) setLastSavedAt(draft.updatedAt);

    const tryRestore = () => {
      if (restoredRef.current) return true;
      const root = getRoot();
      if (!root) return false;
      if (draft?.fields.length && root.querySelectorAll('input, select, textarea').length === 0) return false;
      if (draft?.fields.length) restoreFields(root, draft.fields);
      restoredRef.current = true;
      setRestored(Boolean(draft?.fields.length));
      return true;
    };

    const timers = [120, 450, 1000, 1800].map((delay) => window.setTimeout(tryRestore, delay));
    const observer = new MutationObserver(() => {
      if (tryRestore()) observer.disconnect();
    });
    const section = document.getElementById('hesaplama');
    if (section) observer.observe(section, { childList: true, subtree: true });

    return () => {
      timers.forEach(window.clearTimeout);
      observer.disconnect();
    };
  }, [toolSlug]);

  useEffect(() => {
    const root = getRoot();
    if (!root) return;

    const onChange = () => {
      if (saveTimer.current !== null) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(persistDraft, 550);
    };

    root.addEventListener('input', onChange);
    root.addEventListener('change', onChange);
    return () => {
      root.removeEventListener('input', onChange);
      root.removeEventListener('change', onChange);
      if (saveTimer.current !== null) {
        window.clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
    };
  }, [persistDraft]);

  const currentSnapshot = useCallback(() => {
    const root = getRoot();
    if (!root) return null;
    return {
      id: createSnapshotId(toolSlug),
      toolSlug,
      toolName,
      pathname: window.location.pathname,
      createdAt: Date.now(),
      fields: captureFields(root),
      results: captureResults(root),
    } satisfies CalculationSnapshot;
  }, [toolName, toolSlug]);

  const saveSnapshot = () => {
    const snapshot = currentSnapshot();
    if (!snapshot || (!snapshot.fields.length && !snapshot.results.length)) {
      flash('Kaydedilecek hesap bilgisi bulunamadı.');
      return;
    }
    saveCalculationSnapshot(snapshot);
    persistDraft();
    setOpen(true);
    flash('Hesap cihazına kaydedildi.');
    trackEvent('calculation_snapshot_save', { tool_slug: toolSlug, result_count: snapshot.results.length });
  };

  const copyCurrent = async () => {
    const snapshot = currentSnapshot();
    if (!snapshot) return;
    try {
      await navigator.clipboard.writeText(snapshotText(snapshot));
      flash('Hesap özeti kopyalandı.');
      trackEvent('calculation_summary_copy', { tool_slug: toolSlug });
    } catch {
      window.prompt('Hesap özetini kopyala:', snapshotText(snapshot));
    }
  };

  const downloadCurrent = () => {
    const snapshot = currentSnapshot();
    if (!snapshot) return;
    const rows = [
      ['Bölüm', 'Alan', 'Değer'],
      ...snapshot.fields.map((field) => ['Girdi', field.label, field.checked === undefined ? field.value : field.checked ? 'Evet' : 'Hayır']),
      ...snapshot.results.map((result, index) => ['Sonuç', `Sonuç ${index + 1}`, result]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map(csvEscape).join(';')).join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${toolSlug}-hesap-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    flash('CSV dosyası hazırlandı.');
    trackEvent('calculation_csv_export', { tool_slug: toolSlug });
  };

  const resetDraft = () => {
    if (!window.confirm('Bu araç için otomatik kaydedilen girişler temizlensin mi?')) return;
    clearCalculationDraft(toolSlug);
    setLastSavedAt(null);
    flash('Otomatik kayıt temizlendi. Varsayılan değerler yükleniyor.');
    window.setTimeout(() => window.location.reload(), 250);
  };

  const statusText = useMemo(() => {
    if (status) return status;
    if (lastSavedAt) return `Girdiler cihazda otomatik saklanıyor · ${formatDate(lastSavedAt)}`;
    return 'Girdiler değiştikçe bu cihazda otomatik saklanır.';
  }, [lastSavedAt, status]);

  return (
    <section className="td-calculation-workbench" aria-label="Hesap çalışma alanı">
      <div className="td-workbench-main">
        <div className="td-workbench-copy">
          <span><HardDrive size={14} /> YEREL ÇALIŞMA ALANI</span>
          <strong>{statusText}</strong>
          {restored && <small><Check size={13} /> Önceki girişler geri yüklendi.</small>}
        </div>
        <div className="td-workbench-actions">
          <button type="button" className="primary" onClick={saveSnapshot}><Save size={16} /> Hesabı kaydet</button>
          <button type="button" onClick={copyCurrent}><ClipboardCopy size={16} /> Özeti kopyala</button>
          <button type="button" onClick={downloadCurrent}><Download size={16} /> CSV</button>
          <button type="button" onClick={resetDraft} aria-label="Otomatik kaydı temizle"><RotateCcw size={16} /></button>
          <button type="button" className={open ? 'active' : ''} onClick={() => setOpen((value) => !value)}>
            Kayıtlar {snapshots.length > 0 && <em>{snapshots.length}</em>} <ChevronDown size={15} />
          </button>
        </div>
      </div>

      {open && (
        <div className="td-workbench-drawer">
          <div className="td-workbench-drawer-head">
            <div><strong>Bu araçtaki kayıtlar</strong><span>Yalnızca kullandığın tarayıcıda saklanır.</span></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Kayıtları kapat"><X size={17} /></button>
          </div>

          {snapshots.length === 0 ? (
            <div className="td-workbench-empty">Henüz kaydedilmiş hesap yok.</div>
          ) : (
            <div className="td-workbench-list">
              {snapshots.map((snapshot) => (
                <article key={snapshot.id}>
                  <div>
                    <strong>{formatDate(snapshot.createdAt)}</strong>
                    <span>{snapshot.fields.slice(0, 3).map((field) => `${field.label}: ${field.value}`).join(' · ') || 'Hesap özeti'}</span>
                    {snapshot.results[0] && <small>{snapshot.results[0]}</small>}
                  </div>
                  <div className="td-workbench-item-actions">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(snapshotText(snapshot));
                          flash('Kayıt kopyalandı.');
                        } catch {
                          window.prompt('Kaydı kopyala:', snapshotText(snapshot));
                        }
                      }}
                      aria-label="Kaydı kopyala"
                    >
                      <ClipboardCopy size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deleteCalculationSnapshot(snapshot.id);
                        flash('Kayıt silindi.');
                      }}
                      aria-label="Kaydı sil"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        .td-calculation-workbench{margin-top:14px;border:1px solid var(--border);border-radius:16px;background:linear-gradient(135deg,rgba(255,177,27,.055),rgba(77,159,255,.035)),var(--bg-card);overflow:hidden}
        .td-workbench-main{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:13px 14px}.td-workbench-copy{display:flex;min-width:0;flex-direction:column;gap:4px}.td-workbench-copy>span{display:inline-flex;align-items:center;gap:6px;color:var(--amber);font:800 9.5px/1 var(--font-mono);letter-spacing:.12em}.td-workbench-copy>strong{color:var(--ink-2);font-size:12.5px;line-height:1.45}.td-workbench-copy>small{display:inline-flex;align-items:center;gap:5px;color:var(--green);font-size:10.5px;font-weight:750}
        .td-workbench-actions{display:flex;align-items:center;justify-content:flex-end;gap:7px;flex-wrap:wrap}.td-workbench-actions button,.td-workbench-drawer button{min-height:38px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:0 11px;border:1px solid var(--border-mid);border-radius:10px;background:var(--bg-surface);color:var(--ink-2);font-size:11.5px;font-weight:800;cursor:pointer}.td-workbench-actions button:hover,.td-workbench-actions button.active{border-color:rgba(255,177,27,.38);color:var(--amber)}.td-workbench-actions button.primary{background:var(--amber);border-color:transparent;color:#07111f}.td-workbench-actions em{min-width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;background:rgba(255,177,27,.14);font-style:normal;font-size:10px}
        .td-workbench-drawer{border-top:1px solid var(--border);padding:13px 14px 14px;background:rgba(0,0,0,.035)}.td-workbench-drawer-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px}.td-workbench-drawer-head>div{display:flex;flex-direction:column;gap:3px}.td-workbench-drawer-head strong{color:var(--ink);font-size:13px}.td-workbench-drawer-head span{color:var(--ink-4);font-size:10.5px}.td-workbench-drawer-head button{width:34px;min-height:34px;padding:0}
        .td-workbench-empty{padding:18px;border:1px dashed var(--border-mid);border-radius:12px;color:var(--ink-4);font-size:12px;text-align:center}.td-workbench-list{display:grid;gap:8px;max-height:330px;overflow:auto}.td-workbench-list article{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px;border:1px solid var(--border-dim);border-radius:12px;background:var(--bg-card)}.td-workbench-list article>div:first-child{min-width:0;display:flex;flex-direction:column;gap:4px}.td-workbench-list article strong{color:var(--ink);font-size:11.5px}.td-workbench-list article span,.td-workbench-list article small{max-width:700px;color:var(--ink-4);font-size:10.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.td-workbench-list article small{color:var(--ink-2)}.td-workbench-item-actions{display:flex;gap:6px}.td-workbench-item-actions button{width:34px;min-height:34px;padding:0}.td-workbench-item-actions button:last-child:hover{color:#fb7185;border-color:rgba(251,113,133,.35)}
        @media(max-width:900px){.td-workbench-main{align-items:flex-start;flex-direction:column}.td-workbench-actions{width:100%;justify-content:flex-start}}
        @media(max-width:620px){.td-workbench-main{padding:12px}.td-workbench-actions{display:grid;grid-template-columns:1fr 1fr}.td-workbench-actions button{width:100%;padding:0 8px}.td-workbench-actions button:nth-child(4){display:none}.td-workbench-list article{align-items:flex-start}.td-workbench-list article span{max-width:220px}}
        @media print{.td-calculation-workbench{display:none!important}}
      `}</style>
    </section>
  );
}
