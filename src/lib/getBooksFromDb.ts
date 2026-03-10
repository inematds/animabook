import { createClient } from '@supabase/supabase-js';
import { BookInfo } from './types';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Retorna livros publicados do banco (substituto do getBooks baseado em filesystem).
 */
export async function getPublishedBooksFromDb(): Promise<BookInfo[]> {
  const supabase = getAdminClient();

  const { data: books, error } = await supabase
    .from('books')
    .select(`
      id, slug, title,
      cover_asset:book_assets!books_cover_asset_id_fkey(storage_path),
      assets_count:book_assets(count)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (error || !books) return [];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  return books.map((b: Record<string, unknown>) => {
    const cover = b.cover_asset as { storage_path: string } | null;
    const coverImage = cover?.storage_path
      ? `${supabaseUrl}/storage/v1/object/public/book-assets/${cover.storage_path}`
      : '';

    const countArr = b.assets_count as Array<{ count: number }>;
    const sceneCount = countArr && countArr.length > 0 ? countArr[0].count : 0;

    return {
      id: b.slug as string,
      title: b.title as string,
      coverImage,
      sceneCount,
    };
  });
}

/**
 * Retorna dados de um livro publicado para leitura (reader).
 */
export async function getPublishedBookBySlug(slug: string) {
  const supabase = getAdminClient();

  const { data: book } = await supabase
    .from('books')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!book) return null;

  const { data: assets } = await supabase
    .from('book_assets')
    .select('*')
    .eq('book_id', book.id)
    .order('sort_order');

  return { book, assets: assets ?? [] };
}
