import { getBooks } from '@/lib/getBooks';
import { fetchLatestVideos } from '@/lib/youtube';
import { BookShelf } from '@/components/ui/BookShelf';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const [books, videos, supabase, visitsResult] = await Promise.all([
    getBooks(),
    fetchLatestVideos(),
    createSupabaseServerClient(),
    admin.from('visits').select('user_id, session_id'),
  ]);

  const { data: { user } } = await supabase.auth.getUser();

  let username: string | null = null;
  if (user) {
    const { data: profile } = await admin.from('profiles').select('username').eq('id', user.id).single();
    username = profile?.username ?? null;
  }

  const visits = visitsResult.data ?? [];
  const total = visits.length;
  const uniqueLogged = new Set(visits.filter(v => v.user_id).map(v => v.user_id)).size;
  const uniqueAnon = new Set(visits.filter(v => !v.user_id).map(v => v.session_id)).size;
  const visitStats = { total, uniqueLogged, uniqueAnon };

  return <BookShelf books={books} videos={videos} isLoggedIn={!!user} username={username} visitStats={visitStats} />;
}
