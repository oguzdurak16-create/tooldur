export type StoredField = {
  key: string;
  label: string;
  value: string;
  type: string;
  checked?: boolean;
};

export type CalculationDraft = {
  toolSlug: string;
  fields: StoredField[];
  updatedAt: number;
};

export type CalculationSnapshot = {
  id: string;
  toolSlug: string;
  toolName: string;
  pathname: string;
  createdAt: number;
  fields: StoredField[];
  results: string[];
};

const DRAFT_PREFIX = 'tooldur_calculation_draft_v1:';
const SNAPSHOT_KEY = 'tooldur_calculation_snapshots_v1';
const MAX_SNAPSHOTS = 30;

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function getCalculationDraft(toolSlug: string): CalculationDraft | null {
  if (typeof window === 'undefined') return null;
  const value = safeParse<CalculationDraft | null>(
    window.localStorage.getItem(`${DRAFT_PREFIX}${toolSlug}`),
    null
  );
  if (!value || value.toolSlug !== toolSlug || !Array.isArray(value.fields)) return null;
  return value;
}

export function saveCalculationDraft(draft: CalculationDraft) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(`${DRAFT_PREFIX}${draft.toolSlug}`, JSON.stringify(draft));
    window.dispatchEvent(new CustomEvent('tooldur:calculation-workspace'));
  } catch {
    // localStorage dolu veya devre dışı olabilir; hesaplama akışını bozma.
  }
}

export function clearCalculationDraft(toolSlug: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(`${DRAFT_PREFIX}${toolSlug}`);
  window.dispatchEvent(new CustomEvent('tooldur:calculation-workspace'));
}

export function getCalculationSnapshots(toolSlug?: string): CalculationSnapshot[] {
  if (typeof window === 'undefined') return [];
  const snapshots = safeParse<CalculationSnapshot[]>(window.localStorage.getItem(SNAPSHOT_KEY), []);
  if (!Array.isArray(snapshots)) return [];
  const valid = snapshots.filter((item) => item && typeof item.id === 'string' && typeof item.toolSlug === 'string');
  return toolSlug ? valid.filter((item) => item.toolSlug === toolSlug) : valid;
}

export function saveCalculationSnapshot(snapshot: CalculationSnapshot) {
  if (typeof window === 'undefined') return;
  const current = getCalculationSnapshots();
  const next = [snapshot, ...current.filter((item) => item.id !== snapshot.id)].slice(0, MAX_SNAPSHOTS);
  try {
    window.localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('tooldur:calculation-workspace'));
  } catch {
    // Sessizce geç; sonuç ekranı çalışmaya devam etmeli.
  }
}

export function deleteCalculationSnapshot(id: string) {
  if (typeof window === 'undefined') return;
  const next = getCalculationSnapshots().filter((item) => item.id !== id);
  window.localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('tooldur:calculation-workspace'));
}

export function createSnapshotId(toolSlug: string) {
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
  return `${toolSlug}-${Date.now()}-${random}`;
}
