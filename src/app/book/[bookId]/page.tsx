import { parseStoryContent, parseStoryMd } from '@/lib/parseStory';
import { getBooks } from '@/lib/getBooks';
import { BookReader } from '@/components/reader/BookReader';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

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

  // Tenta Supabase primeiro
  const { data } = await supabase
    .from('stories')
    .select('content')
    .eq('book_id', bookId)
    .single();

  let story = data?.content
    ? parseStoryContent(bookId, data.content)
    : parseStoryMd(bookId);

  // Sem cenas: gera a partir das imagens PNG
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
