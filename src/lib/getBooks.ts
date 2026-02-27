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
    const bookDir = path.join(booksDir, id);
    const images = fs.readdirSync(bookDir)
      .filter(f => f.toLowerCase().endsWith('.png'))
      .sort();

    const story = parseStoryMd(id);
    const coverImage = images.length > 0 ? `/books/${id}/${images[0]}` : '';
    const displayTitle = story.title !== id ? story.title : formatBookId(id);

    return {
      id,
      title: displayTitle,
      coverImage,
      sceneCount: images.length,
    };
  });
}

function formatBookId(id: string): string {
  return id
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}
