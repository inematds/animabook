import { parseStoryMd } from '@/lib/parseStory';
import { getBooks } from '@/lib/getBooks';
import { StoryEditor } from '@/components/editor/StoryEditor';
import { notFound } from 'next/navigation';

// This page is for local development only. In production it shows a message.
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ bookId: string }>;
}

export default async function EditorPage({ params }: Props) {
  if (process.env.NODE_ENV !== 'development') {
    return (
      <div
        className="min-h-dvh flex items-center justify-center"
        style={{ background: '#1a0a2e', color: '#e8c84a', fontFamily: 'var(--font-bangers)', fontSize: '24px' }}
      >
        Editor disponível apenas em desenvolvimento local.
      </div>
    );
  }

  const { bookId } = await params;

  const books = getBooks();
  const book = books.find(b => b.id === bookId);
  if (!book) notFound();

  const story = parseStoryMd(bookId);

  // If no story.md yet, create default scenes from images
  if (story.scenes.length === 0) {
    const fs = await import('fs');
    const path = await import('path');
    const bookDir = path.join(process.cwd(), 'books', bookId);
    const images = fs.readdirSync(bookDir)
      .filter((f: string) => f.toLowerCase().endsWith('.png'))
      .sort();

    story.scenes = images.map((file: string, index: number) => ({
      imageFile: file,
      imageUrl: `/books/${bookId}/${file}`,
      narrator: '',
      bubbles: [],
      index,
    }));
  }

  return <StoryEditor initialStory={story} />;
}
