import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import { parseStoryContent } from '@/lib/parseStory';
import { BookReader } from '@/components/reader/BookReader';
import { LikeButton } from '@/components/ui/LikeButton';
import { CommentSection } from '@/components/ui/CommentSection';
import { Comment } from '@/lib/types';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function PublicationPage({ params }: Props) {
  const { id } = await params;

  const { data: pub } = await adminSupabase
    .from('publications')
    .select('*, profiles(username)')
    .eq('id', id)
    .single();

  if (!pub) notFound();

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { count: likesCount } = await adminSupabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('publication_id', id);

  let userLiked = false;
  if (user) {
    const { data: likeRow } = await adminSupabase
      .from('likes')
      .select('user_id')
      .eq('user_id', user.id)
      .eq('publication_id', id)
      .single();
    userLiked = !!likeRow;
  }

  const { data: commentsRaw } = await adminSupabase
    .from('comments')
    .select('*, profiles(username)')
    .eq('publication_id', id)
    .order('created_at', { ascending: true });

  const comments = (commentsRaw ?? []) as Comment[];

  let username: string | null = null;
  if (user) {
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();
    username = profile?.username ?? null;
  }

  const story = parseStoryContent(pub.book_id, pub.content);
  if (story.scenes.length === 0) notFound();

  const authorName = (pub.profiles as { username: string } | null)?.username ?? 'Usuário';

  return (
    <>
      {/* BookReader com fundo próprio */}
      <BookReader story={story} isDevMode={false} isLoggedIn={!!user} publicationMeta={{ author: authorName, bookId: pub.book_id, publicationId: id }} />

      {/* Likes + Comentários abaixo do fold */}
      <div style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #0f1a3d 100%)', padding: '24px 16px 48px' }}>
        <div style={{ maxWidth: '840px', margin: '0 auto' }}>
          <div style={{ marginBottom: '24px' }}>
            <LikeButton
              publicationId={id}
              initialCount={likesCount ?? 0}
              initialLiked={userLiked}
              userId={user?.id ?? null}
            />
            {!user && (
              <p style={{ fontFamily: 'var(--font-nunito)', fontSize: '12px', color: 'rgba(245,240,232,0.4)', marginTop: '6px' }}>
                <Link href={`/login?next=/publication/${id}`} style={{ color: '#e8c84a' }}>Entre</Link> para curtir.
              </p>
            )}
          </div>

          <CommentSection
            publicationId={id}
            initialComments={comments}
            userId={user?.id ?? null}
            username={username}
          />
        </div>
      </div>
    </>
  );
}
