import fs from 'fs';
import path from 'path';
import { StoryData, Scene, SpeechBubble } from './types';

export function parseStoryMd(bookId: string): StoryData {
  const mdPath = path.join(process.cwd(), 'books', bookId, 'story.md');
  const raw = fs.existsSync(mdPath) ? fs.readFileSync(mdPath, 'utf-8') : '';
  const lines = raw.split('\n');

  let title = bookId;
  const scenes: Scene[] = [];
  let currentScene: Partial<Scene> | null = null;
  let narratorLines: string[] = [];
  let currentBubbles: SpeechBubble[] = [];

  const flushScene = () => {
    if (currentScene?.imageFile) {
      scenes.push({
        imageFile: currentScene.imageFile,
        imageUrl: `/books/${bookId}/${currentScene.imageFile}`,
        narrator: narratorLines.join(' ').trim(),
        bubbles: currentBubbles,
        index: scenes.length,
      });
    }
    narratorLines = [];
    currentBubbles = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // Book title (first H1)
    if (trimmed.startsWith('# ') && scenes.length === 0 && !currentScene) {
      title = trimmed.slice(2).trim();
      continue;
    }

    // Scene boundary: <!-- scene: filename.png -->
    const sceneMatch = trimmed.match(/^<!--\s*scene:\s*(.+\.png)\s*-->$/);
    if (sceneMatch) {
      flushScene();
      currentScene = { imageFile: sceneMatch[1] };
      continue;
    }

    if (!currentScene) continue;

    // Narrator blockquote: > text
    if (trimmed.startsWith('> ')) {
      narratorLines.push(trimmed.slice(2));
      continue;
    }

    // Speech bubble: [Character@esq x=0.1 y=0.2]: text
    const bubbleMatch = trimmed.match(/^\[(.+?)(?:@(esq|dir))?(?:\s+x=([\d.]+))?(?:\s+y=([\d.]+))?\]:\s*(.+)$/);
    if (bubbleMatch) {
      currentBubbles.push({
        character: bubbleMatch[1],
        position: (bubbleMatch[2] as 'esq' | 'dir') ?? 'esq',
        x: bubbleMatch[3] !== undefined ? parseFloat(bubbleMatch[3]) : undefined,
        y: bubbleMatch[4] !== undefined ? parseFloat(bubbleMatch[4]) : undefined,
        text: bubbleMatch[5],
      });
      continue;
    }
  }

  flushScene();

  return { bookId, title, scenes };
}
