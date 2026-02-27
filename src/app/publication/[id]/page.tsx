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

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function PublicationPage({ params }: Props) {
  const { id } = await params;

  // Busca publicação (sem join)
  const { data: pub, error: pubError } = await admin
    .from('publications')
    .select('id, user_id, book_id, content, published_at')
    .eq('id', id)
    .single();

  if (pubError || !pub) notFound();

  // Busca profile separado
  const { data: profile } = await admin
    .from('profiles')
    .select('username')
    .eq('id', pub.user_id)
    .single();

  const authorName = profile?.username ?? 'Usuário';

  // Sessão do usuário
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Likes
  const { count: likesCount } = await admin
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('publication_id', id);

  let userLiked = false;
  if (user) {
    const { data: likeRow } = await admin
      .from('likes')
      .select('user_id')
      .eq('user_id', user.id)
      .eq('publication_id', id)
      .maybeSingle();
    userLiked = !!likeRow;
  }

  // Comentários (busca profile separado em vez de join)
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

  const comments: Comment[] = (commentsRaw ?? []).map(c => ({
    ...c,
    profiles: { username: profileMap[c.user_id] ?? 'Usuário' },
  }));

  // Username do usuário logado
  let username: string | null = null;
  if (user) {
    const { data: myProfile } = await admin
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();
    username = myProfile?.username ?? null;
  }

  // Parse story
  const story = parseStoryContent(pub.book_id, pub.content ?? '');
  if (story.scenes.length === 0) notFound();

  return (
    <>
      <BookReader
        story={story}
        isDevMode={false}
        isLoggedIn={!!user}
        publicationMeta={{ author: authorName, bookId: pub.book_id, publicationId: id }}
      />

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
