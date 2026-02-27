import { getBooks } from '@/lib/getBooks';
import { fetchLatestVideos } from '@/lib/youtube';
import { BookShelf } from '@/components/ui/BookShelf';

export const revalidate = 3600; // revalida a página a cada 1h

export default async function HomePage() {
  const [books, videos] = await Promise.all([
    Promise.resolve(getBooks()),
    fetchLatestVideos(),
  ]);

  return <BookShelf books={books} videos={videos} />;
}
