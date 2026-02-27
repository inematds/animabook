'use client';
import { motion } from 'framer-motion';

type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

interface EditorToolbarProps {
  bookId: string;
  currentScene: number;
  totalScenes: number;
  saveStatus: SaveStatus;
  onPrev: () => void;
  onNext: () => void;
  onSave: () => void;
}

const statusConfig: Record<SaveStatus, { label: string; color: string }> = {
  saved: { label: '✅ Salvo', color: '#4ade80' },
  saving: { label: '⏳ Salvando...', color: '#fbbf24' },
  unsaved: { label: '● Não salvo', color: '#f87171' },
  error: { label: '❌ Erro ao salvar', color: '#f87171' },
};

export function EditorToolbar({
  bookId,
  currentScene,
  totalScenes,
  saveStatus,
  onPrev,
  onNext,
  onSave,
}: EditorToolbarProps) {
  const status = statusConfig[saveStatus];

  return (
    <div
      className="flex items-center justify-between px-4 py-3 gap-3 flex-wrap"
      style={{
        background: 'rgba(26,10,46,0.95)',
        borderBottom: '2px solid rgba(232,200,74,0.3)',
      }}
    >
      {/* Book ID */}
      <div>
        <span
          className="text-amber-300 font-bold"
          style={{ fontFamily: 'var(--font-bangers)', fontSize: '18px', letterSpacing: '0.05em' }}
        >
          Editor: {bookId}
        </span>
      </div>

      {/* Scene navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={currentScene === 0}
          className="px-3 py-1.5 rounded-lg text-sm font-bold disabled:opacity-30 hover:bg-white/10 transition-colors"
          style={{
            border: '1.5px solid rgba(255,255,255,0.2)',
            color: '#f5f0e8',
            fontFamily: 'var(--font-bangers)',
          }}
        >
          ←
        </button>

        <span
          className="text-amber-300 min-w-[80px] text-center"
          style={{ fontFamily: 'var(--font-bangers)', fontSize: '16px' }}
        >
          {currentScene + 1} / {totalScenes}
        </span>

        <button
          onClick={onNext}
          disabled={currentScene === totalScenes - 1}
          className="px-3 py-1.5 rounded-lg text-sm font-bold disabled:opacity-30 hover:bg-white/10 transition-colors"
          style={{
            border: '1.5px solid rgba(255,255,255,0.2)',
            color: '#f5f0e8',
            fontFamily: 'var(--font-bangers)',
          }}
        >
          →
        </button>
      </div>

      {/* Save button + status */}
      <div className="flex items-center gap-3">
        <span
          className="text-xs"
          style={{ color: status.color, fontFamily: 'var(--font-nunito)' }}
        >
          {status.label}
        </span>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onSave}
          disabled={saveStatus === 'saving'}
          className="px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50"
          style={{
            background: 'var(--comic-yellow)',
            color: '#1a1a2e',
            fontFamily: 'var(--font-bangers)',
            fontSize: '15px',
            letterSpacing: '0.05em',
            border: '2px solid var(--comic-shadow)',
          }}
        >
          Salvar
        </motion.button>
      </div>
    </div>
  );
}
