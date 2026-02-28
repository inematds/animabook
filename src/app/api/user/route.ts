import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(req: NextRequest) {
  const auth = req.headers.get('Authorization');
  const token = auth?.replace('Bearer ', '').trim();
  if (!token) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { data: { user } } = await admin.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

  // Deleta dados relacionados antes de deletar o usuário
  await admin.from('drafts').delete().eq('user_id', user.id);
  await admin.from('likes').delete().eq('user_id', user.id);
  await admin.from('comments').delete().eq('user_id', user.id);
  await admin.from('publications').delete().eq('user_id', user.id);
  await admin.from('profiles').delete().eq('id', user.id);

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
