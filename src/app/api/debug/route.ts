import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const auth = req.headers.get('Authorization');
  const token = auth?.replace('Bearer ', '').trim();

  if (!token) {
    return NextResponse.json({ status: 'no_token', cookies: req.cookies.getAll().map(c => c.name) });
  }

  const { data: { user }, error } = await admin.auth.getUser(token);
  return NextResponse.json({
    status: user ? 'ok' : 'invalid_token',
    userId: user?.id,
    email: user?.email,
    error: error?.message,
  });
}
