import type { Category, Tool } from '@/data/tools';

/**
 * Tooldur'un organik aramada tek bir teknik uzmanlık alanı olarak anlaşılması
 * için yardımcı/genel araçları ana SEO yüzeyinden ayırır. Bu araçlar silinmez;
 * kullanıcılar doğrudan URL ile veya site içi aramayla kullanmaya devam eder.
 */
export const NON_INDEXABLE_CATEGORY_IDS = new Set<string>(['genel']);

export const NON_INDEXABLE_TOOL_SLUGS = new Set<string>([
  'proje-yonetimi',
  'yuzde-hesaplama',
  'alan-hesaplama',
  'hacim-hesaplama',
  'pisagor-teoremi',
  'pazaryeri-fiyat-hesaplama',
  'kdv-hesaplama',
  'bmi-hesaplama',
  'kira-artis-hesaplama',
  'kredi-hesaplama',
]);

export function isIndexableTool(tool: Pick<Tool, 'slug' | 'category'>): boolean {
  return !NON_INDEXABLE_CATEGORY_IDS.has(tool.category) && !NON_INDEXABLE_TOOL_SLUGS.has(tool.slug);
}

export function isIndexableCategory(category: Pick<Category, 'id'>): boolean {
  return !NON_INDEXABLE_CATEGORY_IDS.has(category.id);
}

export function getIndexableTools<T extends Pick<Tool, 'slug' | 'category'>>(items: T[]): T[] {
  return items.filter(isIndexableTool);
}

export function getIndexableCategories<T extends Pick<Category, 'id'>>(items: T[]): T[] {
  return items.filter(isIndexableCategory);
}

export function getToolPublicHref(tool: Pick<Tool, 'slug'>): string {
  return tool.slug === 'proje-yonetimi' ? '/proje-yonetimi' : `/arac/${tool.slug}`;
}
