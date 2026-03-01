import fs from 'fs';
import path from 'path';
import { BookInfo } from './types';
import { parseStoryMd } from './parseStory';

export function getBooks(): BookInfo[] {
  const booksDir = path.join(process.cwd(), 'books');

  if (!fs.existsSync(booksDir)) return [];

  const dirs = fs.readdirSync(booksDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();

  return dirs.map(id => {
    const story = parseStoryMd(id);
    const displayTitle = story.title !== id ? story.title : formatBookId(id);

    // Usa o story.md como fonte de verdade (evita incluir PNGs no bundle serverless)
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

function formatBookId(id: string): string {
  return id
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}
