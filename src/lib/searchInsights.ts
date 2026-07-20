export type ZeroSearchRecord = {
  id: string;
  query: string;
  normalized: string;
  source: string;
  path: string;
  count: number;
  firstAt: string;
  lastAt: string;
};

export const ZERO_SEARCH_STORAGE_KEY = "tooldur_zero_searches";

export function normalizeSearchTerm(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/ğ/g, "g")
    .replace(/Ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/Ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/Ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/Ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "c")
    .replace(/\s+/g, " ")
    .trim();
}

function readRecords(): ZeroSearchRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(ZERO_SEARCH_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is ZeroSearchRecord => {
      return !!item && typeof item.query === "string" && typeof item.normalized === "string";
    });
  } catch {
    return [];
  }
}

function writeRecords(records: ZeroSearchRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ZERO_SEARCH_STORAGE_KEY, JSON.stringify(records.slice(0, 80)));
}

export function getZeroSearches() {
  return readRecords().sort((a, b) => {
    const bTime = new Date(b.lastAt).getTime();
    const aTime = new Date(a.lastAt).getTime();
    return bTime - aTime;
  });
}

export function clearZeroSearches() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ZERO_SEARCH_STORAGE_KEY);
}

export function recordZeroSearch(query: string, source = "search") {
  if (typeof window === "undefined") return null;

  const cleanQuery = query.trim().replace(/\s+/g, " ").slice(0, 90);
  const normalized = normalizeSearchTerm(cleanQuery);
  if (normalized.length < 3) return null;

  const now = new Date().toISOString();
  const path = window.location.pathname || "/";
  const records = readRecords();
  const existing = records.find((item) => item.normalized === normalized);

  if (existing) {
    existing.query = cleanQuery;
    existing.count += 1;
    existing.lastAt = now;
    existing.source = source;
    existing.path = path;
  } else {
    records.unshift({
      id: `${normalized}-${Date.now()}`,
      query: cleanQuery,
      normalized,
      source,
      path,
      count: 1,
      firstAt: now,
      lastAt: now,
    });
  }

  const nextRecords = records.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime();
  });

  writeRecords(nextRecords);
  return existing || nextRecords[0];
}
