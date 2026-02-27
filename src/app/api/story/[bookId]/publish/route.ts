import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

interface RouteParams {
  params: Promise<{ bookId: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { bookId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  // Busca o rascunho do usuário
  const { data: draft } = await supabase
    .from('drafts')
    .select('content')
    .eq('user_id', user.id)
    .eq('book_id', bookId)
    .single();

  if (!draft?.content) {
    return NextResponse.json({ error: 'Nenhum rascunho encontrado' }, { status: 404 });
  }

  const { data: publication, error } = await supabase
    .from('publications')
    .insert({ user_id: user.id, book_id: bookId, content: draft.content })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: publication.id });
}
