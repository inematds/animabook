import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireRole, isErrorResponse } from '@/lib/requireAdmin';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET /api/admin/books/:id — detalhes do livro (creator+)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, 'creator');
  if (isErrorResponse(auth)) return auth;

  const { id } = await params;
  const supabase = getAdminClient();

  const [bookResult, assetsResult, ingestsResult] = await Promise.all([
    supabase.from('books').select('*').eq('id', id).single(),
    supabase.from('book_assets').select('*').eq('book_id', id).order('sort_order'),
    supabase.from('book_ingests').select('*').eq('book_id', id).order('created_at', { ascending: false }).limit(10),
  ]);

  if (bookResult.error) {
    return NextResponse.json({ error: 'Livro não encontrado' }, { status: 404 });
  }

  // Creator só pode ver seus próprios livros
  if (auth.role === 'creator' && bookResult.data.created_by !== auth.userId) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  return NextResponse.json({
    book: bookResult.data,
    assets: assetsResult.data ?? [],
    ingests: ingestsResult.data ?? [],
    userRole: auth.role,
  });
}

// PATCH /api/admin/books/:id — atualiza metadados (creator+ para próprios, editor+ para qualquer)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, 'creator');
  if (isErrorResponse(auth)) return auth;

  const { id } = await params;
  const supabase = getAdminClient();

  // Verificar propriedade se creator
  if (auth.role === 'creator') {
    const { data: book } = await supabase.from('books').select('created_by').eq('id', id).single();
    if (book?.created_by !== auth.userId) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }
  }

  const body = await request.json();

  // Creator não pode mudar status
  const allowedFields = auth.role === 'creator'
    ? ['title', 'synopsis', 'story_content', 'cover_asset_id']
    : ['title', 'synopsis', 'story_content', 'cover_asset_id', 'status'];

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) updates[field] = body[field];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 });
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('books')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/admin/books/:id — exclui livro (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, 'admin');
  if (isErrorResponse(auth)) return auth;

  const { id } = await params;
  const supabase = getAdminClient();

  const { data: assets } = await supabase
    .from('book_assets')
    .select('storage_path')
    .eq('book_id', id);

  if (assets && assets.length > 0) {
    const paths = assets.map(a => a.storage_path);
    await supabase.storage.from('book-assets').remove(paths);
  }

  const { error } = await supabase.from('books').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
