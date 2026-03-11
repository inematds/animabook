import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { requireRole, isErrorResponse } from '@/lib/requireAdmin';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Aumentar timeout para uploads (Vercel Pro: até 300s, Free: 10s)
export const maxDuration = 60;

const ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB por arquivo
const MAX_WIDTH = 1344; // largura padrão do projeto
const WEBP_QUALITY = 82; // boa qualidade, arquivo pequeno

// POST /api/admin/books/:id/upload — upload de imagens (creator+)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, 'creator');
  if (isErrorResponse(auth)) return auth;

  const { id: bookId } = await params;
  const supabase = getAdminClient();

  const { data: book, error: bookError } = await supabase
    .from('books')
    .select('id, slug, created_by')
    .eq('id', bookId)
    .single();

  if (bookError || !book) {
    return NextResponse.json({ error: 'Livro não encontrado' }, { status: 404 });
  }

  // Creator só pode fazer upload nos seus próprios livros
  if (auth.role === 'creator' && book.created_by !== auth.userId) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  const formData = await request.formData();
  const files = formData.getAll('images') as File[];

  if (files.length === 0) {
    return NextResponse.json({ error: 'Nenhuma imagem enviada' }, { status: 400 });
  }

  const { data: ingest } = await supabase
    .from('book_ingests')
    .insert({
      book_id: bookId,
      upload_type: 'images',
      status: 'processing',
      created_by: auth.userId,
    })
    .select()
    .single();

  const { data: existingAssets } = await supabase
    .from('book_assets')
    .select('sort_order')
    .eq('book_id', bookId)
    .order('sort_order', { ascending: false })
    .limit(1);

  let sortOrder = existingAssets && existingAssets.length > 0
    ? existingAssets[0].sort_order + 1
    : 0;

  const uploaded: Array<{ id: string; filename: string; storage_path: string }> = [];
  const errors: string[] = [];

  const sortedFiles = files.sort((a, b) => a.name.localeCompare(b.name));

  for (const file of sortedFiles) {
    if (!ALLOWED_MIME.includes(file.type)) {
      errors.push(`${file.name}: tipo não permitido (${file.type})`);
      continue;
    }

    if (file.size > MAX_FILE_SIZE) {
      errors.push(`${file.name}: excede 10MB`);
      continue;
    }

    const normalizedName = `cena-${String(sortOrder + 1).padStart(2, '0')}.webp`;
    const storagePath = `${book.slug}/${normalizedName}`;

    // Otimizar imagem: redimensionar + converter para WebP
    const rawBuffer = Buffer.from(await file.arrayBuffer());
    let optimized: Buffer;
    let width: number | undefined;
    let height: number | undefined;
    try {
      const img = sharp(rawBuffer);
      const meta = await img.metadata();
      width = meta.width;
      height = meta.height;

      let pipeline = img;
      if (meta.width && meta.width > MAX_WIDTH) {
        pipeline = pipeline.resize(MAX_WIDTH, undefined, { withoutEnlargement: true });
        if (meta.width && meta.height) {
          height = Math.round(meta.height * (MAX_WIDTH / meta.width));
          width = MAX_WIDTH;
        }
      }
      optimized = await pipeline.webp({ quality: WEBP_QUALITY }).toBuffer();
    } catch {
      errors.push(`${file.name}: falha ao processar imagem`);
      continue;
    }

    const { error: uploadError } = await supabase.storage
      .from('book-assets')
      .upload(storagePath, optimized, {
        contentType: 'image/webp',
        upsert: true,
      });

    if (uploadError) {
      errors.push(`${file.name}: falha no upload — ${uploadError.message}`);
      continue;
    }

    const { data: asset } = await supabase
      .from('book_assets')
      .insert({
        book_id: bookId,
        filename: normalizedName,
        storage_path: storagePath,
        mime_type: 'image/webp',
        width: width ?? null,
        height: height ?? null,
        sort_order: sortOrder,
        kind: 'scene',
      })
      .select()
      .single();

    if (asset) {
      uploaded.push({ id: asset.id, filename: normalizedName, storage_path: storagePath });
    }

    sortOrder++;
  }

  if (uploaded.length > 0) {
    const { data: allAssets } = await supabase
      .from('book_assets')
      .select('id, filename')
      .eq('book_id', bookId)
      .order('sort_order');

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    const { data: currentBook } = await supabase
      .from('books')
      .select('cover_asset_id, story_content, title')
      .eq('id', bookId)
      .single();

    if (!currentBook?.cover_asset_id && allAssets && allAssets.length > 0) {
      updates.cover_asset_id = allAssets[0].id;
    }

    if (!currentBook?.story_content || currentBook.story_content.trim() === `# ${currentBook.title}`) {
      let story = `# ${currentBook?.title ?? book.slug}\n`;
      for (const asset of allAssets ?? []) {
        story += `\n<!-- scene: ${asset.filename} -->\n> Cena ${asset.filename.replace(/\.[^.]+$/, '')}\n`;
      }
      updates.story_content = story;
    }

    await supabase.from('books').update(updates).eq('id', bookId);
  }

  if (ingest) {
    await supabase
      .from('book_ingests')
      .update({
        status: errors.length === 0 ? 'done' : (uploaded.length > 0 ? 'done' : 'failed'),
        error_message: errors.length > 0 ? errors.join('; ') : null,
        processed_at: new Date().toISOString(),
      })
      .eq('id', ingest.id);
  }

  return NextResponse.json({
    bookId,
    ingestId: ingest?.id,
    uploaded: uploaded.length,
    errors,
  });
}
