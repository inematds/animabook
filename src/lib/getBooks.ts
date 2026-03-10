import fs from 'fs';
import path from 'path';
import { BookInfo } from './types';
import { parseStoryMd } from './parseStory';
import { getPublishedBooksFromDb } from './getBooksFromDb';

/** Livros do filesystem (legado) */
export function getBooksFromFilesystem(): BookInfo[] {
  const booksDir = path.join(process.cwd(), 'books');

  if (!fs.existsSync(booksDir)) return [];

  const dirs = fs.readdirSync(booksDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();

  return dirs.map(id => {
    const story = parseStoryMd(id);
    const displayTitle = story.title !== id ? story.title : formatBookId(id);

    const coverImage = story.scenes.length > 0 ? story.scenes[0].imageUrl : '';
    const sceneCount = story.scenes.length;

    return {
      id,
      title: displayTitle,
      coverImage,
      sceneCount,
    };
  });
}

/** Retorna livros do filesystem + livros publicados no banco (sem duplicatas) */
export async function getBooks(): Promise<BookInfo[]> {
  const fsBooks = getBooksFromFilesystem();

  let dbBooks: BookInfo[] = [];
  try {
    dbBooks = await getPublishedBooksFromDb();
  } catch {
    // Se banco não tiver as tabelas ainda, ignora
  }

  // Mesclar: DB tem prioridade sobre filesystem para mesmo slug
  const seen = new Set<string>();
  const merged: BookInfo[] = [];

  for (const book of dbBooks) {
    seen.add(book.id);
    merged.push(book);
  }

  for (const book of fsBooks) {
    if (!seen.has(book.id)) {
      merged.push(book);
    }
  }

  return merged;
}

function formatBookId(id: string): string {
  return id
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}
