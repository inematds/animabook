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
    .select('id, user_id, book_id, published_at, profiles(username)')
    .eq('book_id', bookId)
    .order('published_at', { ascending: false });

  const publications: Publication[] = await Promise.all(
    (pubs ?? []).map(async (pub) => {
      const [{ count: likes }, { count: comments }] = await Promise.all([
        adminSupabase.from('likes').select('*', { count: 'exact', head: true }).eq('publication_id', pub.id),
        adminSupabase.from('comments').select('*', { count: 'exact', head: true }).eq('publication_id', pub.id),
      ]);
      return {
        ...pub,
        content: '',
        likes_count: likes ?? 0,
        comments_count: comments ?? 0,
        profiles: Array.isArray(pub.profiles) ? pub.profiles[0] : pub.profiles,
      } as Publication;
    })
  );

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
