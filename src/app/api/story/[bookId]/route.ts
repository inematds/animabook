import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabase } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ bookId: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { bookId } = await params;

  // Tenta Supabase primeiro
  const { data } = await supabase
    .from('stories')
    .select('content')
    .eq('book_id', bookId)
    .single();

  if (data?.content) {
    return NextResponse.json({ content: data.content });
  }

  // Fallback: arquivo local
  const filePath = path.join(process.cwd(), 'books', bookId, 'story.md');
  const content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';
  return NextResponse.json({ content });
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { bookId } = await params;
  const { content } = await req.json();

  if (typeof content !== 'string') {
    return NextResponse.json({ error: 'Conteúdo inválido' }, { status: 400 });
  }

  const { error } = await supabase
    .from('stories')
    .upsert({ book_id: bookId, content });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
