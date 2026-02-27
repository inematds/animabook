import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';

interface RouteParams {
  params: Promise<{ bookId: string }>;
}

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { bookId } = await params;

  // Verifica autenticação via cookie
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  // Lê rascunho via admin (sem RLS)
  const { data: draft } = await admin
    .from('drafts')
    .select('content')
    .eq('user_id', user.id)
    .eq('book_id', bookId)
    .single();

  // Fallback: story.md do livro
  let content = draft?.content ?? '';
  if (!content) {
    const mdPath = path.join(process.cwd(), 'books', bookId, 'story.md');
    content = fs.existsSync(mdPath) ? fs.readFileSync(mdPath, 'utf-8') : '';
  }

  if (!content) {
    return NextResponse.json({ error: 'Nenhum conteúdo para publicar' }, { status: 404 });
  }

  // Insere publicação via admin (sem RLS)
  const { data: publication, error } = await admin
    .from('publications')
    .insert({ user_id: user.id, book_id: bookId, content })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: publication.id });
}
