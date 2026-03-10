import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin, isErrorResponse } from '@/lib/requireAdmin';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET /api/admin/books — lista todos os livros (admin)
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  const supabase = getAdminClient();

  const { data: books, error } = await supabase
    .from('books')
    .select(`
      id, slug, title, synopsis, status, published_at, created_at, updated_at,
      cover_asset:book_assets!books_cover_asset_id_fkey(id, storage_path),
      assets_count:book_assets(count)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const result = (books ?? []).map((b: Record<string, unknown>) => ({
    ...b,
    assets_count: Array.isArray(b.assets_count) && b.assets_count.length > 0
      ? (b.assets_count[0] as Record<string, number>).count
      : 0,
  }));

  return NextResponse.json(result);
}

// POST /api/admin/books — cria novo livro
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (isErrorResponse(auth)) return auth;

  const body = await request.json();
  const { slug, title, synopsis } = body;

  if (!slug || !title) {
    return NextResponse.json({ error: 'slug e title são obrigatórios' }, { status: 400 });
  }

  // Validar slug: só letras minúsculas, números e hífens
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'slug deve conter apenas letras minúsculas, números e hífens' }, { status: 400 });
  }

  const supabase = getAdminClient();

  const { data: book, error } = await supabase
    .from('books')
    .insert({
      slug,
      title,
      synopsis: synopsis || null,
      story_content: `# ${title}\n`,
      created_by: auth.userId,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Slug já existe' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(book, { status: 201 });
}
