import { parseStoryMd } from '@/lib/parseStory';
import { BookPageClient, PubSummary } from '@/components/ui/BookPageClient';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Props {
  params: Promise<{ bookId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { bookId } = await params;
  const story = parseStoryMd(bookId);
  return { title: `${story.title} | Animabook` };
}

export default async function BookPage({ params }: Props) {
  const { bookId } = await params;

  const synopsisPath = path.join(process.cwd(), 'books', bookId, 'synopsis.md');
  const synopsis = fs.existsSync(synopsisPath) ? fs.readFileSync(synopsisPath, 'utf-8').trim() : '';

  let story = parseStoryMd(bookId);

  if (story.scenes.length === 0) {
    const fs = await import('fs');
    const path = await import('path');
    const bookDir = path.join(process.cwd(), 'books', bookId);
    if (!fs.existsSync(bookDir)) notFound();
    const images = fs.readdirSync(bookDir)
      .filter((f: string) => f.toLowerCase().endsWith('.png'))
      .sort();
    if (images.length === 0) notFound();
    story.scenes = images.map((file: string, index: number) => {
      let width: number | undefined;
      let height: number | undefined;
      try {
        const buf = Buffer.alloc(24);
        const imgPath = path.join(bookDir, file);
        const fd = fs.openSync(imgPath, 'r');
        fs.readSync(fd, buf, 0, 24, 0);
        fs.closeSync(fd);
        const w = buf.readUInt32BE(16);
        const h = buf.readUInt32BE(20);
        if (w > 0 && w < 65536 && h > 0 && h < 65536) { width = w; height = h; }
      } catch { /* ignore */ }
      return { imageFile: file, imageUrl: `/books/${bookId}/${file}`, narrator: '', bubbles: [], index, width, height };
    });
  }

  // Sessão
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Username do usuário logado
  let username: string | null = null;
  if (user) {
    const { data: profile } = await admin
      .from('profiles').select('username').eq('id', user.id).single();
    username = profile?.username ?? null;
  }

  // Publicações — sem join, separado
  const { data: pubs } = await admin
    .from('publications')
    .select('id, user_id, published_at')
    .eq('book_id', bookId)
    .order('published_at', { ascending: false });

  const pubList = pubs ?? [];
  const pubUserIds = [...new Set(pubList.map(p => p.user_id))];

  const [profilesResult, authUsersResult, ...likeCounts] = await Promise.all([
    pubUserIds.length > 0
      ? admin.from('profiles').select('id, username').in('id', pubUserIds)
      : Promise.resolve({ data: [] as { id: string; username: string }[] }),
    // Fallback: busca username do user_metadata quando profile não existe
    pubUserIds.length > 0
      ? admin.auth.admin.listUsers({ perPage: 1000 })
      : Promise.resolve({ data: { users: [] } }),
    ...pubList.map(pub =>
      admin.from('likes').select('*', { count: 'exact', head: true }).eq('publication_id', pub.id)
    ),
  ]);

  const profileMap: Record<string, string> = Object.fromEntries(
    (profilesResult.data ?? []).map(p => [p.id, p.username])
  );

  // Preenche com user_metadata para quem não tem profile
  const authUsers = (authUsersResult as { data: { users: { id: string; user_metadata?: { username?: string } }[] } }).data?.users ?? [];
  for (const au of authUsers) {
    if (!profileMap[au.id] && au.user_metadata?.username) {
      profileMap[au.id] = au.user_metadata.username;
    }
  }

  const publications: PubSummary[] = pubList.map((pub, i) => ({
    id: pub.id,
    authorId: pub.user_id,
    authorName: profileMap[pub.user_id] ?? 'Anônimo',
    publishedAt: pub.published_at,
    likesCount: (likeCounts[i] as { count: number | null }).count ?? 0,
  }));

  return (
    <BookPageClient
      baseStory={story}
      synopsis={synopsis}
      publications={publications}
      isLoggedIn={!!user}
      userId={user?.id ?? null}
      username={username}
      isDevMode={process.env.NODE_ENV === 'development'}
    />
  );
}
