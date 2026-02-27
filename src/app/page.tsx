import { getBooks } from '@/lib/getBooks';
import { BookShelf } from '@/components/ui/BookShelf';

export default function HomePage() {
  const books = getBooks();
  return <BookShelf books={books} />;
}
