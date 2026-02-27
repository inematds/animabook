'use client';
import { useState, useCallback, useEffect } from 'react';
import { StoryData, Scene, SpeechBubble } from '@/lib/types';
import { SceneEditorPanel } from './SceneEditorPanel';
import { EditorToolbar } from './EditorToolbar';
import { SceneView } from '../reader/SceneView';
import { HalftoneBackground } from '../reader/HalftoneBackground';

type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

interface StoryEditorProps {
  initialStory: StoryData;
}

function storyToMarkdown(story: StoryData): string {
  const lines: string[] = [`# ${story.title}`, ''];

  for (const scene of story.scenes) {
    lines.push(`<!-- scene: ${scene.imageFile} -->`);
    lines.push('');

    if (scene.narrator) {
      lines.push(`> ${scene.narrator}`);
      lines.push('');
    }

    for (const bubble of scene.bubbles) {
      const pos = bubble.position ?? 'esq';
      const xPart = bubble.x !== undefined ? ` x=${bubble.x.toFixed(3)}` : '';
      const yPart = bubble.y !== undefined ? ` y=${bubble.y.toFixed(3)}` : '';
      lines.push(`[${bubble.character}@${pos}${xPart}${yPart}]: ${bubble.text}`);
    }

    if (scene.bubbles.length > 0) lines.push('');
  }

  return lines.join('\n');
}

export function StoryEditor({ initialStory }: StoryEditorProps) {
  const [story, setStory] = useState<StoryData>(initialStory);
  const [currentScene, setCurrentScene] = useState(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');

  const scene = story.scenes[currentScene];

  const updateScene = useCallback((updater: (scene: Scene) => Scene) => {
    setStory(prev => ({
      ...prev,
      scenes: prev.scenes.map((s, i) => (i === currentScene ? updater(s) : s)),
    }));
    setSaveStatus('unsaved');
  }, [currentScene]);

  const handleNarratorChange = useCallback(
    (text: string) => updateScene(s => ({ ...s, narrator: text })),
    [updateScene]
  );

  const handleBubbleChange = useCallback(
    (index: number, field: 'character' | 'text', value: string) =>
      updateScene(s => ({
        ...s,
        bubbles: s.bubbles.map((b, i) => (i === index ? { ...b, [field]: value } : b)),
      })),
    [updateScene]
  );

  const handleBubblePosition = useCallback(
    (index: number, position: 'esq' | 'dir') =>
      updateScene(s => ({
        ...s,
        bubbles: s.bubbles.map((b, i) => (i === index ? { ...b, position } : b)),
      })),
    [updateScene]
  );

  const handleBubbleMove = useCallback(
    (index: number, x: number, y: number) =>
      updateScene(s => ({
        ...s,
        bubbles: s.bubbles.map((b, i) => (i === index ? { ...b, x, y } : b)),
      })),
    [updateScene]
  );

  const handleAddBubble = useCallback(
    () =>
      updateScene(s => ({
        ...s,
        bubbles: [...s.bubbles, { character: '', text: '', position: 'esq' as const }],
      })),
    [updateScene]
  );

  const handleRemoveBubble = useCallback(
    (index: number) =>
      updateScene(s => ({
        ...s,
        bubbles: s.bubbles.filter((_, i) => i !== index),
      })),
    [updateScene]
  );

  const handleSave = useCallback(async () => {
    setSaveStatus('saving');
    try {
      const content = storyToMarkdown(story);
      const res = await fetch(`/api/story/${story.bookId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error('Falha ao salvar');
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  }, [story]);

  // Auto-save on Ctrl+S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave]);

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: '#0a0612' }}>
      <HalftoneBackground />

      <div className="relative z-10 flex flex-col min-h-dvh">
        <EditorToolbar
          bookId={story.bookId}
          currentScene={currentScene}
          totalScenes={story.scenes.length}
          saveStatus={saveStatus}
          onPrev={() => setCurrentScene(p => Math.max(0, p - 1))}
          onNext={() => setCurrentScene(p => Math.min(story.scenes.length - 1, p + 1))}
          onSave={handleSave}
        />

        <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
          {/* Preview */}
          <div
            className="flex-1 overflow-y-auto p-2"
            style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #0f1a3d 100%)' }}
          >
            {scene && (
              <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <SceneView scene={scene} isTransitioning={false} onBubbleMove={handleBubbleMove} />
              </div>
            )}
          </div>

          {/* Editor panel */}
          <div
            className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l overflow-y-auto"
            style={{
              borderColor: 'rgba(232,200,74,0.2)',
              background: 'rgba(10,6,18,0.95)',
              maxHeight: '55dvh',
              minHeight: '200px',
            }}
          >
            {scene && (
              <SceneEditorPanel
                scene={scene}
                onNarratorChange={handleNarratorChange}
                onBubbleChange={handleBubbleChange}
                onBubblePosition={handleBubblePosition}
                onAddBubble={handleAddBubble}
                onRemoveBubble={handleRemoveBubble}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
