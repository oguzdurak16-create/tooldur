import { createHmac } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const browserId = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const istanbulDate = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Istanbul' });

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!host || (origin !== `https://${host}` && origin !== `http://${host}`) ||
      request.headers.get('sec-fetch-site') !== 'same-origin' ||
      !request.headers.get('content-type')?.startsWith('text/plain')) {
    return new Response(null, { status: 403 });
  }

  if (/bot|crawler|spider|headless|preview/i.test(request.headers.get('user-agent') ?? '')) {
    return new Response(null, { status: 204 });
  }

  const id = await request.text();
  if (!browserId.test(id)) return new Response(null, { status: 400 });

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return new Response(null, { status: 503 });

  const day = istanbulDate.format(new Date());
  const hash = createHmac('sha256', key).update(`tooldur-traffic/${day}/${id.toLowerCase()}`).digest('hex');
  const server = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await server.rpc('record_traffic_visit', { p_day: day, p_visitor_hash: hash });
  return new Response(null, { status: error ? 503 : 204 });
}
