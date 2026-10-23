export type StoredField = {
  key: string;
  label: string;
  value: string;
  type: string;
  checked?: boolean;
  displayValue?: string;
};

export type CalculationDraft = { toolSlug: string; fields: StoredField[]; updatedAt: number };
export type CalculationSnapshot = {
  id: string; toolSlug: string; toolName: string; pathname: string;
  createdAt: number; fields: StoredField[]; results: string[];
};

const DRAFT_PREFIX = 'tooldur_calculation_draft_v1:';
const SNAPSHOT_KEY = 'tooldur_calculation_snapshots_v1';
const MAX_SNAPSHOTS = 30;

function read(key: string): unknown {
  if (typeof window === 'undefined') return null;
  try { const value = window.localStorage.getItem(key); return value ? JSON.parse(value) : null; }
  catch { return null; }
}
function write(key: string, value?: unknown): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (value === undefined) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('tooldur:calculation-workspace'));
    return true;
  } catch { return false; }
}
function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}
function validDate(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 8.64e15;
}
function validFields(value: unknown): value is StoredField[] {
  return Array.isArray(value) && value.every((field) => record(field)
    && ['key', 'label', 'value', 'type'].every((key) => typeof field[key] === 'string')
    && (field.checked === undefined || typeof field.checked === 'boolean')
    && (field.displayValue === undefined || typeof field.displayValue === 'string'));
}

export function getCalculationDraft(toolSlug: string): CalculationDraft | null {
  const value = read(`${DRAFT_PREFIX}${toolSlug}`);
  if (!record(value) || value.toolSlug !== toolSlug || !validFields(value.fields) || !validDate(value.updatedAt)) return null;
  return value as CalculationDraft;
}
export function saveCalculationDraft(draft: CalculationDraft): boolean {
  return write(`${DRAFT_PREFIX}${draft.toolSlug}`, draft);
}
export function clearCalculationDraft(toolSlug: string): boolean {
  return write(`${DRAFT_PREFIX}${toolSlug}`);
}
export function getCalculationSnapshots(toolSlug?: string): CalculationSnapshot[] {
  const snapshots = read(SNAPSHOT_KEY);
  if (!Array.isArray(snapshots)) return [];
  const valid = snapshots.filter((item): item is CalculationSnapshot => record(item)
    && ['id', 'toolSlug', 'toolName', 'pathname'].every((key) => typeof item[key] === 'string')
    && validDate(item.createdAt) && validFields(item.fields)
    && Array.isArray(item.results) && item.results.every((result) => typeof result === 'string'));
  return toolSlug ? valid.filter((item) => item.toolSlug === toolSlug) : valid;
}
export function saveCalculationSnapshot(snapshot: CalculationSnapshot): boolean {
  const next = [snapshot, ...getCalculationSnapshots().filter((item) => item.id !== snapshot.id)].slice(0, MAX_SNAPSHOTS);
  return write(SNAPSHOT_KEY, next);
}
export function deleteCalculationSnapshot(id: string): boolean {
  return write(SNAPSHOT_KEY, getCalculationSnapshots().filter((item) => item.id !== id));
}
export function createSnapshotId(toolSlug: string) {
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  return `${toolSlug}-${Date.now()}-${random}`;
}
