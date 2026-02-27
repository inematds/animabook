import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';

interface RouteParams {
  params: Promise<{ bookId: string }>;
}

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { bookId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: draft } = await admin
      .from('drafts')
      .select('content')
      .eq('user_id', user.id)
      .eq('book_id', bookId)
      .single();

    if (draft?.content) {
      return NextResponse.json({ content: draft.content });
    }
  }

  // Fallback: arquivo local
  const fs = await import('fs');
  const path = await import('path');
  const filePath = path.join(process.cwd(), 'books', bookId, 'story.md');
  const content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
  return NextResponse.json({ content });
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { bookId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const { content } = await req.json();

  if (typeof content !== 'string') {
    return NextResponse.json({ error: 'Conteúdo inválido' }, { status: 400 });
  }

  const { error } = await admin
    .from('drafts')
    .upsert(
      { user_id: user.id, book_id: bookId, content, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,book_id' }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
