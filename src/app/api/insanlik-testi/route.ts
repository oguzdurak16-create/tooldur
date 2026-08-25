import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const TEST_ID = 'pilot-v1';
const QUESTION_IDS = new Set(['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8']);

type Vote = { questionId: string; answerId: number };

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url, key };
}

function headers(key: string, extra?: Record<string, string>) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

export async function GET() {
  const config = getSupabaseConfig();
  if (!config) return NextResponse.json({ totals: {}, participants: 0, available: false });

  const response = await fetch(
    `${config.url}/rest/v1/humanity_test_votes?test_id=eq.${TEST_ID}&select=question_id,answer_id&limit=10000`,
    { headers: headers(config.key), cache: 'no-store' },
  );

  if (!response.ok) return NextResponse.json({ totals: {}, participants: 0, available: false });

  const rows = (await response.json()) as Array<{ question_id: string; answer_id: number }>;
  const totals: Record<string, [number, number]> = {};
  for (const row of rows) {
    if (!totals[row.question_id]) totals[row.question_id] = [0, 0];
    if (row.answer_id === 0 || row.answer_id === 1) totals[row.question_id][row.answer_id] += 1;
  }

  return NextResponse.json({ totals, participants: totals.q1?.[0] + totals.q1?.[1] || 0, available: true });
}

export async function POST(request: NextRequest) {
  const config = getSupabaseConfig();
  if (!config) return NextResponse.json({ ok: false, message: 'Veri bağlantısı hazır değil.' }, { status: 503 });

  let body: { sessionId?: string; votes?: Vote[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const sessionId = body.sessionId;
  const votes = body.votes;
  const validSession = typeof sessionId === 'string' && /^[0-9a-f-]{36}$/i.test(sessionId);
  const validVotes = Array.isArray(votes)
    && votes.length === QUESTION_IDS.size
    && new Set(votes.map((vote) => vote.questionId)).size === QUESTION_IDS.size
    && votes.every((vote) => QUESTION_IDS.has(vote.questionId) && (vote.answerId === 0 || vote.answerId === 1));

  if (!validSession || !validVotes) return NextResponse.json({ ok: false }, { status: 400 });

  const payload = votes.map((vote) => ({
    test_id: TEST_ID,
    question_id: vote.questionId,
    answer_id: vote.answerId,
    session_id: sessionId,
  }));

  const response = await fetch(`${config.url}/rest/v1/humanity_test_votes`, {
    method: 'POST',
    headers: headers(config.key, { Prefer: 'return=minimal' }),
    body: JSON.stringify(payload),
  });

  if (!response.ok) return NextResponse.json({ ok: false, message: 'Oylar kaydedilemedi.' }, { status: 502 });
  return NextResponse.json({ ok: true });
}
