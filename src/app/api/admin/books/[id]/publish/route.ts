import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireRole, isErrorResponse } from '@/lib/requireAdmin';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// POST /api/admin/books/:id/publish — publica o livro (editor+)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, 'editor');
  if (isErrorResponse(auth)) return auth;

  const { id } = await params;
  const supabase = getAdminClient();

  const { data: assets } = await supabase
    .from('book_assets')
    .select('id')
    .eq('book_id', id);

  if (!assets || assets.length === 0) {
    return NextResponse.json({ error: 'Livro não tem imagens. Envie imagens antes de publicar.' }, { status: 400 });
  }

  const { data: book } = await supabase
    .from('books')
    .select('story_content')
    .eq('id', id)
    .single();

  if (!book?.story_content || book.story_content.trim().length < 10) {
    return NextResponse.json({ error: 'Livro precisa de story_content antes de publicar.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('books')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/admin/books/:id/publish — despublica o livro (editor+)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, 'editor');
  if (isErrorResponse(auth)) return auth;

  const { id } = await params;
  const supabase = getAdminClient();

  const { data, error } = await supabase
    .from('books')
    .update({
      status: 'draft',
      published_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
