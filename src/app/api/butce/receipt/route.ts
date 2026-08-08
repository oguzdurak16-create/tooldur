import { NextRequest, NextResponse } from 'next/server';
import { createWorker } from 'tesseract.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const CATEGORIES = [
  'Market / Gıda',
  'Yakıt / Ulaşım',
  'Dışarıda Yeme',
  'Fatura / İletişim',
  'Sağlık',
  'Ev / Kişisel',
  'Diğer',
] as const;

const PAYMENT_METHODS = ['Banka Kartı', 'Kredi Kartı', 'Nakit', 'Havale / EFT'] as const;

async function verifyUser(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!token || !supabaseUrl || !anonKey) return false;
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: anonKey },
    cache: 'no-store',
  });
  return response.ok;
}

function extractOutputText(data: any) {
  if (typeof data?.output_text === 'string') return data.output_text;
  for (const item of Array.isArray(data?.output) ? data.output : []) {
    for (const content of item?.content || []) {
      if (content?.type === 'output_text' && typeof content?.text === 'string') return content.text;
    }
  }
  return '';
}

function normalizeDate(value: unknown) {
  const raw = String(value || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const match = raw.match(/(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{2,4})/);
  if (!match) return null;
  const year = match[3].length === 2 ? `20${match[3]}` : match[3];
  return `${year}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
}

function parseAmount(text: string) {
  const lines = text.split(/\n+/).map((x) => x.trim()).filter(Boolean);
  const preferred = lines.filter((line) => /(GENEL\s*TOPLAM|ÖDENECEK|ODENECEK|TOPLAM|TOTAL|TUTAR)/i.test(line));
  const pool = preferred.length ? preferred : lines.slice(-24);
  const values: number[] = [];
  for (const line of pool) {
    for (const token of line.match(/\d{1,6}[.,]\d{2}/g) || []) {
      const n = Number(token.replace(/\./g, '').replace(',', '.'));
      if (Number.isFinite(n) && n > 0 && n < 1000000) values.push(n);
    }
  }
  return values.length ? Math.max(...values) : null;
}

function parseMerchant(text: string) {
  const lines = text.split(/\n+/).map((x) => x.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const ignore = /(VERGİ|VERGI|TARİH|TARIH|SAAT|FİŞ|FIS|MERSİS|MERSIS|TEL|V\.D|TOPLAM|TOTAL|KDV|NO:|www\.|http)/i;
  return lines.find((line) => line.length >= 5 && line.length <= 100 && !ignore.test(line)) || null;
}

function inferCategory(text: string) {
  const t = text.toLocaleUpperCase('tr-TR');
  if (/(AKARYAKIT|PETROL|BENZİN|BENZIN|MOTORİN|MOTORIN|OPET|SHELL|BP |TOTALENERGIES)/.test(t)) return 'Yakıt / Ulaşım';
  if (/(ECZANE|HASTANE|SAĞLIK|SAGLIK|MEDİKAL|MEDIKAL)/.test(t)) return 'Sağlık';
  if (/(CAFE|KAFE|KAHVE|RESTAURANT|RESTORAN|DÖNER|DONER|PİZZA|PIZZA|KÖFTE|KOFTE|YEMEK)/.test(t)) return 'Dışarıda Yeme';
  if (/(TURKCELL|VODAFONE|TÜRK TELEKOM|TURK TELEKOM|ELEKTRİK|ELEKTRIK|SU FATURA|DOĞALGAZ|DOGALGAZ|İNTERNET|INTERNET)/.test(t)) return 'Fatura / İletişim';
  if (/(MARKET|ŞOK|SOK |BİM|BIM |A101|MİGROS|MIGROS|CARREFOUR|SEYHAN|GIDA|PEYNİR|PEYNIR|SÜT|SUT |EKMEK|YUMURTA|MANAV)/.test(t)) return 'Market / Gıda';
  return 'Diğer';
}

function inferPayment(text: string) {
  const t = text.toLocaleUpperCase('tr-TR');
  if (/(BANKA\/KREDİ KARTI|BANKA\/KREDI KARTI|KREDİ KARTI|KREDI KARTI)/.test(t)) return 'Kredi Kartı';
  if (/(BANKA KARTI|DEBİT|DEBIT)/.test(t)) return 'Banka Kartı';
  if (/NAKİT|NAKIT/.test(t)) return 'Nakit';
  return null;
}

async function parseWithOpenAI(file: File, apiKey: string) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUrl = `data:${file.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;
  const model = process.env.RECEIPT_VISION_MODEL || 'gpt-4.1-mini';
  const aiResponse = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      max_output_tokens: 350,
      input: [{ role: 'user', content: [
        { type: 'input_text', text: `Bu bir Türkiye alışveriş fişi/faturası. Sadece fişte açıkça görülen bilgilerle TEK bir JSON nesnesi döndür. Markdown kullanma. Alanlar: amount (number, ödenen genel toplam; ara toplam değil), merchant (string|null, işyeri adı), date (YYYY-MM-DD|null), category (aşağıdaki seçeneklerden tam biri), payment_method (aşağıdaki seçeneklerden biri veya null), confidence (0-1). Kategoriler: ${CATEGORIES.join(', ')}. Ödeme yöntemleri: ${PAYMENT_METHODS.join(', ')}. Emin olmadığın metin alanını null bırak. Genel toplamı TOTAL/TOPLAM/ÖDENECEK/GENEL TOPLAM gibi nihai tutardan seç.` },
        { type: 'input_image', image_url: dataUrl },
      ] }],
    }),
    cache: 'no-store',
  });
  if (!aiResponse.ok) return null;
  const aiData = await aiResponse.json();
  const raw = extractOutputText(aiData).trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  try { return JSON.parse(raw); } catch { return null; }
}

async function parseWithTesseract(file: File) {
  let worker: any;
  try {
    worker = await createWorker(['tur', 'eng']);
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await worker.recognize(buffer);
    const text = String(result?.data?.text || '').trim();
    if (!text) return null;
    return {
      amount: parseAmount(text),
      merchant: parseMerchant(text),
      date: normalizeDate(text),
      category: inferCategory(text),
      payment_method: inferPayment(text),
      confidence: Math.max(0, Math.min(1, (Number(result?.data?.confidence) || 0) / 100)),
      source: 'tesseract-server',
    };
  } catch (error) {
    console.error('receipt-tesseract-error', error);
    return null;
  } finally {
    try { await worker?.terminate(); } catch {}
  }
}

async function parseWithOcrSpace(file: File) {
  const form = new FormData();
  form.append('apikey', process.env.OCR_SPACE_API_KEY || 'helloworld');
  form.append('language', 'tur');
  form.append('isOverlayRequired', 'false');
  form.append('OCREngine', '2');
  form.append('scale', 'true');
  form.append('file', file, file.name || 'receipt.jpg');
  const response = await fetch('https://api.ocr.space/parse/image', { method: 'POST', body: form, cache: 'no-store' });
  if (!response.ok) return null;
  const json: any = await response.json();
  const text = (json?.ParsedResults || []).map((x: any) => x?.ParsedText || '').join('\n').trim();
  if (!text) return null;
  return {
    amount: parseAmount(text),
    merchant: parseMerchant(text),
    date: normalizeDate(text),
    category: inferCategory(text),
    payment_method: inferPayment(text),
    confidence: 0.65,
    source: 'ocr-space',
  };
}

export async function POST(req: NextRequest) {
  try {
    if (!(await verifyUser(req))) return NextResponse.json({ error: 'Oturum doğrulanamadı.' }, { status: 401 });
    const formData = await req.formData();
    const file = formData.get('receipt');
    if (!(file instanceof File)) return NextResponse.json({ error: 'Fiş fotoğrafı bulunamadı.' }, { status: 400 });
    if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Yalnızca fiş fotoğrafı yüklenebilir.' }, { status: 400 });
    if (file.size > 12 * 1024 * 1024) return NextResponse.json({ error: 'Fiş fotoğrafı en fazla 12 MB olabilir.' }, { status: 413 });

    let parsed: any = null;
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) parsed = await parseWithOpenAI(file, apiKey);
    if (!parsed?.amount) parsed = await parseWithTesseract(file);
    if (!parsed?.amount) parsed = await parseWithOcrSpace(file);
    if (!parsed?.amount) return NextResponse.json({ error: 'Fiş okunamadı. Fotoğrafı mümkünse fişin tamamı görünecek şekilde seçip tekrar dene.' }, { status: 422 });

    const amount = Number(parsed.amount);
    const category = CATEGORIES.includes(parsed.category) ? parsed.category : 'Diğer';
    const paymentMethod = PAYMENT_METHODS.includes(parsed.payment_method) ? parsed.payment_method : null;
    const confidence = Math.max(0, Math.min(1, Number(parsed.confidence) || 0));

    return NextResponse.json({
      amount: Math.round(amount * 100) / 100,
      merchant: typeof parsed.merchant === 'string' ? parsed.merchant.trim().slice(0, 120) : null,
      date: normalizeDate(parsed.date),
      category,
      payment_method: paymentMethod,
      confidence,
      source: parsed.source || 'ai',
    });
  } catch (error) {
    console.error('receipt-parse-failed', error);
    return NextResponse.json({ error: 'Fiş okunurken bir hata oluştu.' }, { status: 500 });
  }
}
