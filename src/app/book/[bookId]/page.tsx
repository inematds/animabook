import { parseStoryMd } from '@/lib/parseStory';
import { BookPageClient, PubSummary } from '@/components/ui/BookPageClient';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

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
    story.scenes = images.map((file: string, index: number) => ({
      imageFile: file,
      imageUrl: `/books/${bookId}/${file}`,
      narrator: '',
      bubbles: [],
      index,
    }));
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

  const [profilesResult, ...likeCounts] = await Promise.all([
    pubUserIds.length > 0
      ? admin.from('profiles').select('id, username').in('id', pubUserIds)
      : Promise.resolve({ data: [] as { id: string; username: string }[] }),
    ...pubList.map(pub =>
      admin.from('likes').select('*', { count: 'exact', head: true }).eq('publication_id', pub.id)
    ),
  ]);

  const profileMap = Object.fromEntries(
    (profilesResult.data ?? []).map(p => [p.id, p.username])
  );

  const publications: PubSummary[] = pubList.map((pub, i) => ({
    id: pub.id,
    authorName: profileMap[pub.user_id] ?? 'Usuário',
    publishedAt: pub.published_at,
    likesCount: (likeCounts[i] as { count: number | null }).count ?? 0,
  }));

  return (
    <BookPageClient
      baseStory={story}
      publications={publications}
      isLoggedIn={!!user}
      userId={user?.id ?? null}
      username={username}
      isDevMode={process.env.NODE_ENV === 'development'}
    />
  );
}
