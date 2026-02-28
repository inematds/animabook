import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface RouteParams {
  params: Promise<{ bookId: string }>;
}

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { bookId } = await params;

  // Auth via JWT token no header
  const auth = req.headers.get('Authorization');
  const token = auth?.replace('Bearer ', '').trim();
  if (!token) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const { data: { user } } = await admin.auth.getUser(token);
  if (!user) {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }

  // Conteúdo vem direto no body
  const { content } = await req.json();
  if (!content || typeof content !== 'string') {
    return NextResponse.json({ error: 'Conteúdo inválido' }, { status: 400 });
  }

  // Remove publicação anterior do mesmo usuário neste livro (1 por pessoa)
  const { data: existing } = await admin
    .from('publications')
    .select('id')
    .eq('user_id', user.id)
    .eq('book_id', bookId)
    .single();

  if (existing) {
    await admin.from('likes').delete().eq('publication_id', existing.id);
    await admin.from('comments').delete().eq('publication_id', existing.id);
    await admin.from('publications').delete().eq('id', existing.id);
  }

  // Salva rascunho e publica
  const [, pubResult] = await Promise.all([
    admin.from('drafts').upsert(
      { user_id: user.id, book_id: bookId, content, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,book_id' }
    ),
    admin.from('publications')
      .insert({ user_id: user.id, book_id: bookId, content })
      .select('id')
      .single(),
  ]);

  if (pubResult.error) {
    return NextResponse.json({ error: pubResult.error.message }, { status: 500 });
  }

  return NextResponse.json({ id: pubResult.data.id });
}
