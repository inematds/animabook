import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface RouteParams {
  params: Promise<{ bookId: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { bookId } = await params;
  const filePath = path.join(process.cwd(), 'books', bookId, 'story.md');

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ content: '' });
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  return NextResponse.json({ content });
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Disponível apenas em desenvolvimento' }, { status: 403 });
  }

  const { bookId } = await params;
  const filePath = path.join(process.cwd(), 'books', bookId, 'story.md');

  // Safety check: only allow books/ directory
  const booksDir = path.join(process.cwd(), 'books');
  if (!filePath.startsWith(booksDir)) {
    return NextResponse.json({ error: 'Caminho inválido' }, { status: 400 });
  }

  const { content } = await req.json();

  if (typeof content !== 'string') {
    return NextResponse.json({ error: 'Conteúdo inválido' }, { status: 400 });
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf-8');

  return NextResponse.json({ ok: true });
}
