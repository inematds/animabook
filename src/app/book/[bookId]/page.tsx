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

  // Sem story.md: gera cenas a partir das imagens PNG do livro
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

  return <BookReader story={story} isDevMode={process.env.NODE_ENV === 'development'} />;
}
