'use client';
import { Scene } from '@/lib/types';

interface SceneEditorPanelProps {
  scene: Scene;
  onNarratorChange: (text: string) => void;
  onBubbleChange: (index: number, field: 'character' | 'text', value: string) => void;
  onBubblePosition: (index: number, position: 'esq' | 'dir') => void;
  onAddBubble: () => void;
  onRemoveBubble: (index: number) => void;
}

export function SceneEditorPanel({
  scene,
  onNarratorChange,
  onBubbleChange,
  onBubblePosition,
  onAddBubble,
  onRemoveBubble,
}: SceneEditorPanelProps) {
  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto p-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
          Imagem
        </p>
        <p className="text-sm text-white/60 truncate font-mono bg-white/5 px-2 py-1 rounded">
          {scene.imageFile}
        </p>
      </div>

      {/* Narrator */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
          📖 Narrador
        </label>
        <textarea
          value={scene.narrator}
          onChange={e => onNarratorChange(e.target.value)}
          placeholder="Escreva o texto do narrador aqui..."
          rows={3}
          className="w-full px-3 py-2 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
          style={{
            background: 'rgba(255,252,220,0.1)',
            border: '2px solid rgba(232,200,74,0.3)',
            color: '#f5f0e8',
            fontFamily: 'var(--font-nunito)',
          }}
        />
      </div>

      {/* Bubbles */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
          💬 Diálogos
        </label>

        {scene.bubbles.map((bubble, i) => (
          <div
            key={i}
            className="mb-3 p-3 rounded-lg relative"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <button
              onClick={() => onRemoveBubble(i)}
              className="absolute top-2 right-2 text-red-400 hover:text-red-300 text-xs font-bold"
            >
              ✕
            </button>

            <input
              value={bubble.character}
              onChange={e => onBubbleChange(i, 'character', e.target.value)}
              placeholder="Nome do personagem"
              className="w-full px-2 py-1.5 rounded mb-2 text-xs font-bold uppercase tracking-wide focus:outline-none focus:ring-1 focus:ring-amber-400"
              style={{
                background: 'rgba(232,200,74,0.15)',
                border: '1.5px solid rgba(232,200,74,0.4)',
                color: '#e8c84a',
                fontFamily: 'var(--font-bangers)',
                letterSpacing: '0.05em',
              }}
            />

            {/* Position toggle */}
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => onBubblePosition(i, 'esq')}
                className="flex-1 py-1 rounded text-xs font-bold transition-all"
                style={{
                  background: bubble.position === 'esq'
                    ? 'rgba(232,200,74,0.3)'
                    : 'rgba(255,255,255,0.05)',
                  border: '1.5px solid',
                  borderColor: bubble.position === 'esq'
                    ? 'rgba(232,200,74,0.7)'
                    : 'rgba(255,255,255,0.1)',
                  color: bubble.position === 'esq' ? '#e8c84a' : 'rgba(255,255,255,0.4)',
                  fontFamily: 'var(--font-bangers)',
                }}
              >
                ← Esquerda
              </button>
              <button
                onClick={() => onBubblePosition(i, 'dir')}
                className="flex-1 py-1 rounded text-xs font-bold transition-all"
                style={{
                  background: bubble.position === 'dir'
                    ? 'rgba(232,200,74,0.3)'
                    : 'rgba(255,255,255,0.05)',
                  border: '1.5px solid',
                  borderColor: bubble.position === 'dir'
                    ? 'rgba(232,200,74,0.7)'
                    : 'rgba(255,255,255,0.1)',
                  color: bubble.position === 'dir' ? '#e8c84a' : 'rgba(255,255,255,0.4)',
                  fontFamily: 'var(--font-bangers)',
                }}
              >
                Direita →
              </button>
            </div>

            <textarea
              value={bubble.text}
              onChange={e => onBubbleChange(i, 'text', e.target.value)}
              placeholder="Fala do personagem..."
              rows={2}
              className="w-full px-2 py-1.5 rounded text-sm resize-none focus:outline-none focus:ring-1 focus:ring-white/40"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#f5f0e8',
                fontFamily: 'var(--font-nunito)',
              }}
            />
          </div>
        ))}

        <button
          onClick={onAddBubble}
          className="w-full py-2 rounded-lg text-sm font-bold transition-all hover:bg-amber-400/20"
          style={{
            border: '2px dashed rgba(232,200,74,0.4)',
            color: 'rgba(232,200,74,0.7)',
            fontFamily: 'var(--font-bangers)',
            letterSpacing: '0.05em',
          }}
        >
          + Adicionar Diálogo
        </button>
      </div>
    </div>
  );
}
