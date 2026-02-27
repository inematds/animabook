import { getBooks } from '@/lib/getBooks';
import { fetchLatestVideos } from '@/lib/youtube';
import { BookShelf } from '@/components/ui/BookShelf';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [books, videos, supabase] = await Promise.all([
    Promise.resolve(getBooks()),
    fetchLatestVideos(),
    createSupabaseServerClient(),
  ]);

  const { data: { user } } = await supabase.auth.getUser();

  let username: string | null = null;
  if (user) {
    const { createClient } = await import('@supabase/supabase-js');
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: profile } = await admin.from('profiles').select('username').eq('id', user.id).single();
    username = profile?.username ?? null;
  }

  return <BookShelf books={books} videos={videos} isLoggedIn={!!user} username={username} />;
}
