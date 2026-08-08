import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: anonKey,
    },
    cache: 'no-store',
  });
  return response.ok;
}

function extractOutputText(data: any) {
  if (typeof data?.output_text === 'string') return data.output_text;
  const parts = Array.isArray(data?.output) ? data.output : [];
  for (const item of parts) {
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

export async function POST(req: NextRequest) {
  try {
    if (!(await verifyUser(req))) {
      return NextResponse.json({ error: 'Oturum doğrulanamadı.' }, { status: 401 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Fiş okuma servisi henüz yapılandırılmamış.' }, { status: 503 });
    }

    const formData = await req.formData();
    const file = formData.get('receipt');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Fiş fotoğrafı bulunamadı.' }, { status: 400 });
    }
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Yalnızca fiş fotoğrafı yüklenebilir.' }, { status: 400 });
    }
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fiş fotoğrafı en fazla 8 MB olabilir.' }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const dataUrl = `data:${file.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;
    const model = process.env.RECEIPT_VISION_MODEL || 'gpt-4.1-mini';

    const aiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_output_tokens: 350,
        input: [{
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: `Bu bir Türkiye alışveriş fişi/faturası. Sadece fişte açıkça görülen bilgilerle TEK bir JSON nesnesi döndür. Markdown kullanma. Alanlar: amount (number, ödenen genel toplam; ara toplam değil), merchant (string|null, işyeri adı), date (YYYY-MM-DD|null), category (aşağıdaki seçeneklerden tam biri), payment_method (aşağıdaki seçeneklerden biri veya null), confidence (0-1). Kategoriler: ${CATEGORIES.join(', ')}. Ödeme yöntemleri: ${PAYMENT_METHODS.join(', ')}. Emin olmadığın metin alanını null bırak. Genel toplamı TOTAL/TOPLAM/ÖDENECEK/GENEL TOPLAM gibi nihai tutardan seç.`,
            },
            { type: 'input_image', image_url: dataUrl },
          ],
        }],
      }),
      cache: 'no-store',
    });

    if (!aiResponse.ok) {
      const detail = await aiResponse.text().catch(() => '');
      console.error('receipt-ai-error', aiResponse.status, detail.slice(0, 500));
      return NextResponse.json({ error: 'Fiş şu anda okunamadı. Elle girebilirsin.' }, { status: 502 });
    }

    const aiData = await aiResponse.json();
    const raw = extractOutputText(aiData).trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: 'Fiş bilgileri güvenilir biçimde çözülemedi.' }, { status: 422 });
    }

    const amount = Number(parsed?.amount);
    const category = CATEGORIES.includes(parsed?.category) ? parsed.category : 'Diğer';
    const paymentMethod = PAYMENT_METHODS.includes(parsed?.payment_method) ? parsed.payment_method : null;
    const confidence = Math.max(0, Math.min(1, Number(parsed?.confidence) || 0));

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Fişte genel toplam okunamadı.' }, { status: 422 });
    }

    return NextResponse.json({
      amount: Math.round(amount * 100) / 100,
      merchant: typeof parsed?.merchant === 'string' ? parsed.merchant.trim().slice(0, 120) : null,
      date: normalizeDate(parsed?.date),
      category,
      payment_method: paymentMethod,
      confidence,
    });
  } catch (error) {
    console.error('receipt-parse-failed', error);
    return NextResponse.json({ error: 'Fiş okunurken bir hata oluştu.' }, { status: 500 });
  }
}
