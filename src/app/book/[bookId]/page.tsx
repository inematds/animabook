import { parseStoryMd } from '@/lib/parseStory';
import { getBooks } from '@/lib/getBooks';
import { BookReader } from '@/components/reader/BookReader';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ bookId: string }>;
}

export async function generateStaticParams() {
  const books = getBooks();
  return books.map(b => ({ bookId: b.id }));
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
  const story = parseStoryMd(bookId);

  if (!story.scenes.length) {
    notFound();
  }

  return <BookReader story={story} />;
}
