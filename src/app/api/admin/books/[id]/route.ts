import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin, isErrorResponse } from '@/lib/requireAdmin';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET /api/admin/books/:id — detalhes do livro + assets
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
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

  return NextResponse.json({
    book: bookResult.data,
    assets: assetsResult.data ?? [],
    ingests: ingestsResult.data ?? [],
  });
}

// PATCH /api/admin/books/:id — atualiza metadados
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  const { id } = await params;
  const body = await request.json();

  const allowedFields = ['title', 'synopsis', 'story_content', 'cover_asset_id', 'status'];
  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) updates[field] = body[field];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 });
  }

  updates.updated_at = new Date().toISOString();

  const supabase = getAdminClient();

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

// DELETE /api/admin/books/:id — exclui livro e assets
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  const { id } = await params;
  const supabase = getAdminClient();

  // Buscar assets para limpar storage
  const { data: assets } = await supabase
    .from('book_assets')
    .select('storage_path')
    .eq('book_id', id);

  if (assets && assets.length > 0) {
    const paths = assets.map(a => a.storage_path);
    await supabase.storage.from('book-assets').remove(paths);
  }

  // CASCADE deleta book_assets e book_ingests
  const { error } = await supabase.from('books').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
