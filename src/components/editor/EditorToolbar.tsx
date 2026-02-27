'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

interface EditorToolbarProps {
  bookId: string;
  currentScene: number;
  totalScenes: number;
  saveStatus: SaveStatus;
  publishing: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSave: () => void;
  onPublish: () => void;
  onReset: () => void;
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
  publishing,
  onPrev,
  onNext,
  onSave,
  onPublish,
  onReset,
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
      {/* Sair + Book ID */}
      <div className="flex items-center gap-2">
        <Link
          href={`/book/${bookId}`}
          style={{
            fontFamily: 'var(--font-bangers)',
            fontSize: '14px',
            letterSpacing: '0.05em',
            color: 'rgba(245,240,232,0.7)',
            textDecoration: 'none',
            padding: '4px 10px',
            borderRadius: '8px',
            border: '1.5px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.05)',
          }}
        >
          ← Sair
        </Link>
        <span
          className="text-amber-300 font-bold"
          style={{ fontFamily: 'var(--font-bangers)', fontSize: '18px', letterSpacing: '0.05em' }}
        >
          {bookId}
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

      {/* Reset + Save + Publish buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (confirm('Descartar seu rascunho e recarregar do original?')) onReset();
          }}
          title="Reiniciar do original"
          style={{
            fontFamily: 'var(--font-bangers)',
            fontSize: '13px',
            letterSpacing: '0.05em',
            color: 'rgba(248,113,113,0.8)',
            background: 'rgba(248,113,113,0.1)',
            border: '1.5px solid rgba(248,113,113,0.3)',
            borderRadius: '8px',
            padding: '4px 10px',
            cursor: 'pointer',
          }}
        >
          ↺ Original
        </button>
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

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onPublish}
          disabled={publishing || saveStatus === 'saving'}
          className="px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50"
          style={{
            background: publishing ? 'rgba(74,222,128,0.3)' : '#4ade80',
            color: '#1a1a2e',
            fontFamily: 'var(--font-bangers)',
            fontSize: '15px',
            letterSpacing: '0.05em',
            border: '2px solid #16a34a',
          }}
        >
          {publishing ? '⏳' : '🚀 Publicar'}
        </motion.button>
      </div>
    </div>
  );
}
