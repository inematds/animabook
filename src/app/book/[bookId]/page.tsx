import { parseStoryContent, parseStoryMd } from '@/lib/parseStory';
import { getBooks } from '@/lib/getBooks';
import { BookReader } from '@/components/reader/BookReader';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { Publication } from '@/lib/types';
import { PublicationList } from '@/components/ui/PublicationList';

export const dynamic = 'force-dynamic';

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface Props {
  params: Promise<{ bookId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { bookId } = await params;
  const story = parseStoryMd(bookId);
  return {
    title: `${story.title} | Animabook`,
  };
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

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: pubs } = await adminSupabase
    .from('publications')
    .select('id, user_id, book_id, published_at')
    .eq('book_id', bookId)
    .order('published_at', { ascending: false });

  const pubList = pubs ?? [];

  // Busca profiles e contagens em paralelo
  const pubUserIds = [...new Set(pubList.map(p => p.user_id))];
  const [profilesResult, ...counts] = await Promise.all([
    pubUserIds.length > 0
      ? adminSupabase.from('profiles').select('id, username').in('id', pubUserIds)
      : Promise.resolve({ data: [] }),
    ...pubList.flatMap(pub => [
      adminSupabase.from('likes').select('*', { count: 'exact', head: true }).eq('publication_id', pub.id),
      adminSupabase.from('comments').select('*', { count: 'exact', head: true }).eq('publication_id', pub.id),
    ]),
  ]);

  const profileMap = Object.fromEntries(
    ((profilesResult as { data: { id: string; username: string }[] | null }).data ?? []).map(p => [p.id, p.username])
  );

  const publications: Publication[] = pubList.map((pub, i) => ({
    ...pub,
    content: '',
    likes_count: (counts[i * 2] as { count: number | null }).count ?? 0,
    comments_count: (counts[i * 2 + 1] as { count: number | null }).count ?? 0,
    profiles: { username: profileMap[pub.user_id] ?? 'Usuário' },
  }));

  return (
    <>
      <BookReader story={story} isDevMode={process.env.NODE_ENV === 'development'} isLoggedIn={!!user} />
      {publications.length > 0 && (
        <div style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #0f1a3d 100%)' }}>
          <PublicationList publications={publications} bookId={bookId} />
        </div>
      )}
    </>
  );
}
