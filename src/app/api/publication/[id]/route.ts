import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parseStoryContent } from '@/lib/parseStory';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const auth = req.headers.get('Authorization');
  const token = auth?.replace('Bearer ', '').trim();
  let userId: string | null = null;
  if (token) {
    const { data: { user } } = await admin.auth.getUser(token);
    userId = user?.id ?? null;
  }

  const { data: pub } = await admin
    .from('publications')
    .select('id, user_id, book_id, content')
    .eq('id', id)
    .single();

  if (!pub) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const story = parseStoryContent(pub.book_id, pub.content ?? '');

  const { count: likesCount } = await admin
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('publication_id', id);

  let userLiked = false;
  if (userId) {
    const { data: likeRow } = await admin
      .from('likes')
      .select('user_id')
      .eq('user_id', userId)
      .eq('publication_id', id)
      .maybeSingle();
    userLiked = !!likeRow;
  }

  const { data: commentsRaw } = await admin
    .from('comments')
    .select('id, user_id, publication_id, text, created_at')
    .eq('publication_id', id)
    .order('created_at', { ascending: true });

  const commentUserIds = [...new Set((commentsRaw ?? []).map(c => c.user_id))];
  const { data: commentProfiles } = commentUserIds.length > 0
    ? await admin.from('profiles').select('id, username').in('id', commentUserIds)
    : { data: [] };

  const profileMap = Object.fromEntries((commentProfiles ?? []).map(p => [p.id, p.username]));

  const comments = (commentsRaw ?? []).map(c => ({
    ...c,
    profiles: { username: profileMap[c.user_id] ?? 'Usuário' },
  }));

  return NextResponse.json({ story, likesCount: likesCount ?? 0, userLiked, comments });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const auth = req.headers.get('Authorization');
  const token = auth?.replace('Bearer ', '').trim();
  if (!token) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const { data: { user } } = await admin.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

  const { data: pub } = await admin.from('publications').select('user_id').eq('id', id).single();
  if (!pub || pub.user_id !== user.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 });
  }

  await admin.from('likes').delete().eq('publication_id', id);
  await admin.from('comments').delete().eq('publication_id', id);
  await admin.from('publications').delete().eq('id', id);

  return NextResponse.json({ ok: true });
}
