import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.resolve(__dirname, '../src/data/cozumStarterDrafts.json');
const publish = process.argv.includes('--publish');

const raw = JSON.parse(await fs.readFile(DATA_PATH, 'utf8'));
const items = Array.isArray(raw.items) ? raw.items : [];

function validate(item) {
  const errors = [];
  if (!item.key) errors.push('key eksik');
  if (!item.category_slug) errors.push('category_slug eksik');
  if (String(item.title || '').trim().length < 12) errors.push('başlık 12 karakterden kısa');
  if (String(item.problem || '').trim().length < 80) errors.push('problem 80 karakterden kısa');
  if (String(item.solution_draft || '').trim().length < 20) errors.push('çözüm 20 karakterden kısa');
  if (!Array.isArray(item.tags) || item.tags.length > 8) errors.push('etiket listesi geçersiz');

  if (item.verified === true) {
    if (!String(item.reviewed_by || '').trim()) errors.push('verified kayıt için reviewed_by zorunlu');
    if (!Array.isArray(item.sources) || item.sources.length === 0) errors.push('verified kayıt için en az 1 kaynak zorunlu');
  }

  return errors;
}

let invalid = 0;
for (const item of items) {
  const errors = validate(item);
  if (errors.length) {
    invalid += 1;
    console.error(`[GEÇERSİZ] ${item.key || '(key yok)'}: ${errors.join(', ')}`);
  }
}

const verified = items.filter((item) => item.verified === true && validate(item).length === 0);
const drafts = items.filter((item) => item.verified !== true);

console.log(`Toplam taslak: ${items.length}`);
console.log(`Doğrulanmamış: ${drafts.length}`);
console.log(`Yayınlanabilir doğrulanmış: ${verified.length}`);
console.log(`Geçersiz: ${invalid}`);

if (!publish) {
  console.log('\nDry-run tamamlandı. DB değişmedi. Yayın için --publish gerekir.');
  process.exit(invalid ? 1 : 0);
}

if (invalid) {
  throw new Error('Geçersiz seed kayıtları varken yayın yapılamaz.');
}
if (verified.length === 0) {
  throw new Error('Yayınlanabilir verified kayıt yok. Önce insan doğrulaması ve kaynak ekleyin.');
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
  const { data: category, error: categoryError } = await supabase
    .from('forum_kategoriler')
    .select('id,slug')
    .eq('slug', item.category_slug)
    .maybeSingle();

  if (categoryError) throw categoryError;
  if (!category) throw new Error(`Kategori bulunamadı: ${item.category_slug}`);

  const title = String(item.title).trim();
  const problem = String(item.problem).trim();
  const solution = String(item.solution_draft).trim();
  const tags = [...new Set([...(item.tags || []), 'editoryal', 'kaynakli'])].slice(0, 8);

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
