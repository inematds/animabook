import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { session_id } = await req.json();

  if (!session_id || typeof session_id !== 'string') {
    return NextResponse.json({ error: 'session_id obrigatório' }, { status: 400 });
  }

  // Extrai user_id do token JWT se presente (opcional)
  let user_id: string | null = null;
  const auth = req.headers.get('Authorization');
  const token = auth?.replace('Bearer ', '').trim();
  if (token) {
    const { data: { user } } = await admin.auth.getUser(token);
    user_id = user?.id ?? null;
  }

  const { error } = await admin.from('visits').insert({ session_id, user_id });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
