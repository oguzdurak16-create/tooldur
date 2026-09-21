import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.resolve(__dirname, '../src/data/cozumStarterDrafts.json');
const SOURCE_PATH = path.resolve(__dirname, '../src/data/cozumStarterSources.json');
const publish = process.argv.includes('--publish');

const raw = JSON.parse(await fs.readFile(DATA_PATH, 'utf8'));
const sourceRaw = JSON.parse(await fs.readFile(SOURCE_PATH, 'utf8'));
const items = Array.isArray(raw.items) ? raw.items : [];
const sourceEntries = Array.isArray(sourceRaw.items) ? sourceRaw.items : [];

function validSourceUrl(value) {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function duplicateKeys(list) {
  const seen = new Set();
  const duplicates = new Set();
  for (const item of list) {
    const key = String(item?.key || '').trim();
    if (!key) continue;
    if (seen.has(key)) duplicates.add(key);
    seen.add(key);
  }
  return [...duplicates];
}

function publishedSolutionText(item, sourceEntry) {
  const solutionBase = String(item.solution_draft || '').trim();
  const sources = Array.isArray(sourceEntry?.sources) ? sourceEntry.sources : [];
  const sourceBlock = sources.map((source, index) => `${index + 1}. ${source}`).join('\n');
  return `${solutionBase}\n\nKaynaklar (editoryal doğrulama):\n${sourceBlock}`;
}

function publishedTags(item) {
  const reserved = new Set(['editoryal', 'kaynakli']);
  const baseTags = [...new Set((item.tags || []).map((tag) => String(tag).trim()).filter(Boolean))]
    .filter((tag) => !reserved.has(tag.toLocaleLowerCase('tr-TR')))
    .slice(0, 6);
  return [...baseTags, 'editoryal', 'kaynakli'];
}

const sourceErrors = [];
const duplicateDraftKeys = duplicateKeys(items);
const duplicateSourceKeys = duplicateKeys(sourceEntries);

if (duplicateDraftKeys.length) {
  sourceErrors.push(`Tekrarlanan taslak key: ${duplicateDraftKeys.join(', ')}`);
}
if (duplicateSourceKeys.length) {
  sourceErrors.push(`Tekrarlanan kaynak key: ${duplicateSourceKeys.join(', ')}`);
}

const sourceMap = new Map();
for (const entry of sourceEntries) {
  const key = String(entry?.key || '').trim();
  if (!key) {
    sourceErrors.push('Kaynak kaydında key eksik');
    continue;
  }
  if (!['strong', 'partial'].includes(entry.coverage)) {
    sourceErrors.push(`${key}: coverage strong veya partial olmalı`);
  }
  if (typeof entry.human_reviewed !== 'boolean') {
    sourceErrors.push(`${key}: human_reviewed boolean olmalı`);
  }
  if (!Array.isArray(entry.sources) || entry.sources.length === 0) {
    sourceErrors.push(`${key}: en az 1 resmi/teknik kaynak zorunlu`);
  } else {
    if (entry.sources.length > 5) sourceErrors.push(`${key}: en fazla 5 kaynak kullanılabilir`);
    if (!entry.sources.every(validSourceUrl)) sourceErrors.push(`${key}: tüm kaynaklar geçerli http/https URL olmalı`);
    if (entry.sources.some((source) => String(source).length > 1000)) sourceErrors.push(`${key}: kaynak URL 1000 karakterden uzun olamaz`);
  }
  sourceMap.set(key, entry);
}

const draftKeySet = new Set(items.map((item) => String(item?.key || '').trim()).filter(Boolean));
for (const item of items) {
  const key = String(item?.key || '').trim();
  if (key && !sourceMap.has(key)) sourceErrors.push(`${key}: kaynak haritasında kayıt yok`);
}
for (const key of sourceMap.keys()) {
  if (!draftKeySet.has(key)) sourceErrors.push(`${key}: kaynak haritasında var ancak taslaklarda yok`);
}

function validate(item) {
  const errors = [];
  const key = String(item?.key || '').trim();
  const sourceEntry = sourceMap.get(key);

  if (!key) errors.push('key eksik');
  if (!item.category_slug) errors.push('category_slug eksik');
  if (String(item.title || '').trim().length < 12) errors.push('başlık 12 karakterden kısa');
  if (String(item.problem || '').trim().length < 80) errors.push('problem 80 karakterden kısa');
  if (String(item.solution_draft || '').trim().length < 20) errors.push('çözüm 20 karakterden kısa');
  if (!Array.isArray(item.tags) || item.tags.length > 6) errors.push('editoryal taslakta en fazla 6 özel etiket kullanılabilir');
  if (!sourceEntry) errors.push('kaynak haritası kaydı eksik');
  if (sourceEntry && publishedSolutionText(item, sourceEntry).length > 5000) {
    errors.push('kaynaklar eklendiğinde yayınlanacak çözüm 5000 karakteri aşıyor');
  }
  if (publishedTags(item).length > 8) errors.push('yayın etiketleri 8 sınırını aşıyor');

  if (item.verified === true) {
    if (!String(item.reviewed_by || '').trim()) {
      errors.push('verified kayıt için reviewed_by zorunlu');
    }
    if (!sourceEntry) {
      errors.push('verified kayıt için kaynak haritası zorunlu');
    } else {
      if (sourceEntry.coverage !== 'strong') {
        errors.push('verified kayıt için kaynak kapsamı strong olmalı');
      }
      if (sourceEntry.human_reviewed !== true) {
        errors.push('verified kayıt için source human_reviewed=true olmalı');
      }
      if (!Array.isArray(sourceEntry.sources) || sourceEntry.sources.length === 0 || !sourceEntry.sources.every(validSourceUrl)) {
        errors.push('verified kayıt için geçerli resmi/teknik kaynak URL gerekli');
      }
    }
  }

  return errors;
}

let invalidItems = 0;
for (const item of items) {
  const errors = validate(item);
  if (errors.length) {
    invalidItems += 1;
    console.error(`[GEÇERSİZ] ${item.key || '(key yok)'}: ${errors.join(', ')}`);
  }
}

for (const error of sourceErrors) console.error(`[KAYNAK HATASI] ${error}`);

const verified = items.filter((item) => item.verified === true && validate(item).length === 0);
const drafts = items.filter((item) => item.verified !== true);
const mappedCount = items.filter((item) => sourceMap.has(String(item?.key || '').trim())).length;
const strongCount = sourceEntries.filter((entry) => entry.coverage === 'strong').length;
const partialCount = sourceEntries.filter((entry) => entry.coverage === 'partial').length;
const humanReviewedCount = sourceEntries.filter((entry) => entry.human_reviewed === true).length;
const invalid = invalidItems + sourceErrors.length;

console.log(`Toplam taslak: ${items.length}`);
console.log(`Resmi kaynak haritası: ${mappedCount}/${items.length}`);
console.log(`Kaynak kapsamı strong: ${strongCount}`);
console.log(`Kaynak kapsamı partial: ${partialCount}`);
console.log(`İnsan kaynak incelemesi tamamlanan: ${humanReviewedCount}`);
console.log(`Doğrulanmamış: ${drafts.length}`);
console.log(`Yayınlanabilir doğrulanmış: ${verified.length}`);
console.log(`Geçersiz: ${invalid}`);

if (!publish) {
  console.log('\nDry-run tamamlandı. DB değişmedi. Kaynak bulunması otomatik doğrulama değildir; yayın için ayrıca insan incelemesi ve --publish gerekir.');
  process.exit(invalid ? 1 : 0);
}

if (invalid) {
  throw new Error('Geçersiz seed/kaynak kayıtları varken yayın yapılamaz.');
}
if (verified.length === 0) {
  throw new Error('Yayınlanabilir verified kayıt yok. Önce insan doğrulaması tamamlanmalı.');
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const editorUserId = process.env.COZUM_EDITOR_USER_ID;
const editorName = process.env.COZUM_EDITOR_NAME || 'Tooldur Editör';

if (!url || !serviceRole || !editorUserId) {
  throw new Error('Publish için NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY ve COZUM_EDITOR_USER_ID zorunlu.');
}

const supabase = createClient(url, serviceRole, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let insertedTopics = 0;
let insertedAnswers = 0;
let skipped = 0;

for (const item of verified) {
  const sourceEntry = sourceMap.get(item.key);
  if (!sourceEntry || sourceEntry.coverage !== 'strong' || sourceEntry.human_reviewed !== true) {
    throw new Error(`Yayın güvenlik kontrolü başarısız: ${item.key}`);
  }

  const { data: category, error: categoryError } = await supabase
    .from('forum_kategoriler')
    .select('id,slug')
    .eq('slug', item.category_slug)
    .maybeSingle();

  if (categoryError) throw categoryError;
  if (!category) throw new Error(`Kategori bulunamadı: ${item.category_slug}`);

  const title = String(item.title).trim();
  const problem = String(item.problem).trim();
  const solution = publishedSolutionText(item, sourceEntry);
  const tags = publishedTags(item);

  const { data: existing, error: existingError } = await supabase
    .from('forum_konular')
    .select('id')
    .eq('kategori_id', category.id)
    .eq('baslik', title)
    .maybeSingle();

  if (existingError) throw existingError;

  let topicId = existing?.id;
  if (!topicId) {
    const { data: topic, error: topicError } = await supabase
      .from('forum_konular')
      .insert({
        kategori_id: category.id,
        baslik: title,
        icerik: problem,
        etiketler: tags,
        yazar_uid: editorUserId,
        yazar_ad: editorName,
        yazar_foto: null,
      })
      .select('id')
      .single();

    if (topicError) throw topicError;
    topicId = topic.id;
    insertedTopics += 1;
  } else {
    skipped += 1;
  }

  const { data: existingAnswer, error: answerLookupError } = await supabase
    .from('forum_yorumlar')
    .select('id')
    .eq('konu_id', topicId)
    .eq('yazar_uid', editorUserId)
    .eq('icerik', solution)
    .maybeSingle();

  if (answerLookupError) throw answerLookupError;

  if (!existingAnswer) {
    const { error: answerError } = await supabase.from('forum_yorumlar').insert({
      konu_id: topicId,
      yazar_uid: editorUserId,
      yazar_ad: editorName,
      yazar_foto: null,
      icerik: solution,
      ust_id: null,
    });
    if (answerError) throw answerError;
    insertedAnswers += 1;
  }
}

console.log(`\nYayın tamamlandı.`);
console.log(`Yeni konu: ${insertedTopics}`);
console.log(`Yeni çözüm: ${insertedAnswers}`);
console.log(`Mevcut olduğu için atlanan konu: ${skipped}`);
