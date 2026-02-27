import fs from 'fs';
import path from 'path';
import { StoryData, Scene, SpeechBubble } from './types';

function readPngDimensions(filePath: string): { width: number; height: number } | null {
  try {
    const buf = Buffer.alloc(24);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buf, 0, 24, 0);
    fs.closeSync(fd);
    // PNG IHDR: bytes 16-19 = width, bytes 20-23 = height (big-endian uint32)
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    if (width > 0 && width < 65536 && height > 0 && height < 65536) {
      return { width, height };
    }
    return null;
  } catch {
    return null;
  }
}

export function parseStoryContent(bookId: string, raw: string): StoryData {
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
        width: currentScene.width,
        height: currentScene.height,
      });
    }
    narratorLines = [];
    currentBubbles = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('# ') && scenes.length === 0 && !currentScene) {
      title = trimmed.slice(2).trim();
      continue;
    }

    // Match: <!-- scene: file.png --> or <!-- scene: file.png 1024x1536 -->
    const sceneMatch = trimmed.match(/^<!--\s*scene:\s*(\S+\.png)(?:\s+(\d+)x(\d+))?\s*-->$/);
    if (sceneMatch) {
      flushScene();
      currentScene = {
        imageFile: sceneMatch[1],
        width: sceneMatch[2] ? parseInt(sceneMatch[2]) : undefined,
        height: sceneMatch[3] ? parseInt(sceneMatch[3]) : undefined,
      };
      continue;
    }

    if (!currentScene) continue;

    if (trimmed.startsWith('> ')) {
      narratorLines.push(trimmed.slice(2));
      continue;
    }

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

export function parseStoryMd(bookId: string): StoryData {
  const mdPath = path.join(process.cwd(), 'books', bookId, 'story.md');
  const raw = fs.existsSync(mdPath) ? fs.readFileSync(mdPath, 'utf-8') : '';
  const story = parseStoryContent(bookId, raw);

  // Enhance scenes with actual PNG dimensions from filesystem
  for (const scene of story.scenes) {
    if (!scene.width || !scene.height) {
      const imgPath = path.join(process.cwd(), 'books', bookId, scene.imageFile);
      const dims = readPngDimensions(imgPath);
      if (dims) {
        scene.width = dims.width;
        scene.height = dims.height;
      }
    }
  }

  return story;
}
