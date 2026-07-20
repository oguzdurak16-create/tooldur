import type { Tool } from '@/data/tools';

export type SearchableTool = Tool & {
  keywords?: string[];
  tags?: string[];
};

const aliasGroups: Array<{ terms: string[]; slugs: string[] }> = [
  {
    terms: ['metrik dis', 'metrik dis tablosu', 'kilavuz tablosu', 'kilavuz matkap caplari', 'dis dibi', 'm8 kilavuz', 'm6 kilavuz'],
    slugs: ['kilavuz-matkap-hesaplama'],
  },
  {
    terms: ['dalgic pompa', 'pompa hesaplama programi', 'pompa kw', 'pompa motor gucu', 'hidrolik guc'],
    slugs: ['pompa-guc-hesaplama'],
  },
  {
    terms: ['torna derece', 'konik derece', 'konik torna', '1 n koniklik', 'taper'],
    slugs: ['konik-hesaplama'],
  },
  {
    terms: ['donati agirliklari', 'demir agirlik tablosu', 'insaat demiri kg', 'nervurlu demir', 'demir tonaj'],
    slugs: ['demir-agirligi-hesaplama'],
  },
  {
    terms: ['sac agirlik', 'levha agirlik', 'plaka agirlik', 'metal agirlik'],
    slugs: ['levha-agirlik-hesaplama'],
  },
  {
    terms: ['baklavali sac', 'goz yasli sac', 'desenli sac agirlik'],
    slugs: ['baklavali-sac-agirlik-hesaplama'],
  },
  {
    terms: ['sac bukum', 'bukum tonaji', 'v kalip', 'minimum flans', 'bukum kuvveti'],
    slugs: ['sac-bukum-kesim-hesaplayici', 'sac-bukum-acinim-hesaplama'],
  },
  {
    terms: ['h7', 'h8', 'g6', 'mil delik', 'gecme toleransi', 'iso tolerans', 'siki gecme'],
    slugs: ['iso-gecme-tolerans-hesaplama'],
  },
  {
    terms: ['civata torku', 'sikma torku', 'bolt torque', 'vida torku'],
    slugs: ['civata-sikma-torku-hesaplama'],
  },
  {
    terms: ['kablo capi', 'kablo kesiti', 'akima gore kablo', 'gerilim dusumu'],
    slugs: ['kablo-kesiti-hesaplama', 'voltaj-dusumu-hesaplama'],
  },
  {
    terms: ['rulman hesabi', 'rulman omru', 'l10 omru', 'bearing life'],
    slugs: ['rulman-omru-hesaplama'],
  },
  {
    terms: ['kama tablosu', 'kama kanali', 'mil kama', 'din 6885'],
    slugs: ['kama-kanali-hesaplama'],
  },
  {
    terms: ['oring', 'o ring', 'oring kanali', 'sizdirmazlik kanali'],
    slugs: ['o-ring-kanali-hesaplama'],
  },
  {
    terms: ['kaynak hesabi', 'kaynak dikisi', 'kose kaynak', 'kaynak mukavemeti'],
    slugs: ['kaynak-dikisi-hesaplama'],
  },
  {
    terms: ['boru et kalinligi', 'basincli boru', 'pipe thickness'],
    slugs: ['boru-eti-hesaplama'],
  },
  {
    terms: ['basincli kap', 'cidar kalinligi', 'tank et kalinligi'],
    slugs: ['basincli-kap-cidar-kalinligi'],
  },
  {
    terms: ['oee', 'uretim verimliligi', 'makine verimliligi'],
    slugs: ['oee-uretim-verimliligi-hesaplama'],
  },
  {
    terms: ['takt', 'takt suresi', 'uretim kapasitesi', 'cevrim suresi'],
    slugs: ['takt-suresi-kapasite-hesaplama'],
  },
];

const slugAliases = aliasGroups.reduce<Record<string, string[]>>((acc, group) => {
  group.slugs.forEach((slug) => {
    acc[slug] = [...(acc[slug] || []), ...group.terms];
  });
  return acc;
}, {});

export const discoveryQuickQueries = [
  'metrik diş tablosu',
  'dalgıç pompa',
  'torna derece',
  'donatı ağırlıkları',
  'sac büküm tonajı',
  'H7 g6 tolerans',
];

export function normalizeToolQuery(value: string) {
  return value
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/ø/g, 'o')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreText(field: string, query: string, weight: number) {
  if (!field || !query) return 0;
  if (field === query) return weight * 1.6;
  if (field.startsWith(query)) return weight * 1.3;
  if (field.includes(query)) return weight;
  return 0;
}

export function scoreTool(tool: SearchableTool, rawQuery: string) {
  const query = normalizeToolQuery(rawQuery);
  if (!query) {
    return (tool.popular ? 50 : 0) + (tool.featured ? 32 : 0) + (tool.new ? 12 : 0);
  }

  const name = normalizeToolQuery(tool.name);
  const shortName = normalizeToolQuery(tool.shortName || '');
  const slug = normalizeToolQuery(tool.slug.replace(/-/g, ' '));
  const description = normalizeToolQuery(tool.description || '');
  const keywords = normalizeToolQuery([...(tool.keywords || []), ...(tool.tags || [])].join(' '));
  const aliases = normalizeToolQuery((slugAliases[tool.slug] || []).join(' '));
  const tokens = query.split(' ').filter((token) => token.length > 1);
  const genericTokens = new Set(['hesaplama', 'hesapla', 'hesaplayici', 'programi', 'program', 'online', 'ucretsiz', 'araci', 'tablosu', 'tablo']);
  const meaningfulTokens = tokens.filter((token) => !genericTokens.has(token));
  const combined = `${name} ${shortName} ${slug} ${keywords} ${aliases} ${description}`;

  let score = 0;
  score += scoreText(name, query, 110);
  score += scoreText(shortName, query, 100);
  score += scoreText(slug, query, 72);
  score += scoreText(keywords, query, 66);
  score += scoreText(aliases, query, 86);
  score += scoreText(description, query, 32);

  let matchedTokens = 0;
  let matchedMeaningfulTokens = 0;
  for (const token of tokens) {
    if (combined.includes(token)) {
      matchedTokens += 1;
      if (meaningfulTokens.includes(token)) matchedMeaningfulTokens += 1;
      score += name.includes(token) || shortName.includes(token) ? 18 : aliases.includes(token) ? 16 : 8;
    }
  }

  if (meaningfulTokens.length > 0 && matchedMeaningfulTokens === 0) return 0;
  if (tokens.length > 0 && matchedTokens === tokens.length) score += 34;
  if (tool.popular) score += 5;
  if (tool.featured) score += 3;

  return score;
}

export function rankTools<T extends SearchableTool>(items: T[], query: string): T[] {
  const normalized = normalizeToolQuery(query);
  if (!normalized) {
    return [...items].sort((a, b) => {
      const scoreDiff = scoreTool(b, '') - scoreTool(a, '');
      return scoreDiff || a.name.localeCompare(b.name, 'tr');
    });
  }

  return items
    .map((tool) => ({ tool, score: scoreTool(tool, normalized) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name, 'tr'))
    .map((item) => item.tool);
}
