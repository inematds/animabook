import { parseStoryContent, parseStoryMd } from '@/lib/parseStory';
import { getBooks } from '@/lib/getBooks';
import { StoryEditor } from '@/components/editor/StoryEditor';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { notFound, redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ bookId: string }>;
}

export default async function EditorPage({ params }: Props) {
  const { bookId } = await params;

  const books = getBooks();
  const book = books.find(b => b.id === bookId);
  if (!book) notFound();

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/editor/${bookId}`);
  }

  // Carrega rascunho do usuário
  const { data: draft } = await supabase
    .from('drafts')
    .select('content')
    .eq('user_id', user.id)
    .eq('book_id', bookId)
    .single();

  const originalStory = parseStoryMd(bookId);

  // Cenas limpas: só as imagens, sem narrador nem diálogos
  const emptyScenes = originalStory.scenes.map(s => ({ ...s, narrator: '', bubbles: [] as typeof s.bubbles }));

  let story = { ...originalStory, scenes: emptyScenes };

  if (draft?.content) {
    const draftStory = parseStoryContent(bookId, draft.content);
    // Só usa o rascunho se tiver o mesmo número de cenas que o original
    if (draftStory.scenes.length >= originalStory.scenes.length) {
      story = draftStory;
    }
  }

  // Sem cenas: gera a partir das imagens PNG
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

  return <StoryEditor initialStory={story} userId={user.id} />;
}
