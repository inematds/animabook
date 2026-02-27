'use client';
import { useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { StoryData } from '@/lib/types';
import { SceneView } from './SceneView';
import { HalftoneBackground } from './HalftoneBackground';
import { ProgressDots } from '../ui/ProgressDots';
import { useSceneState } from '@/hooks/useSceneState';
import { useSwipe } from '@/hooks/useSwipe';

interface PublicationMeta {
  author: string;
  bookId: string;
  publicationId: string;
}

interface BookReaderProps {
  story: StoryData;
  isDevMode: boolean;
  isLoggedIn?: boolean;
  publicationMeta?: PublicationMeta;
}

export function BookReader({ story, isDevMode, isLoggedIn = false, publicationMeta }: BookReaderProps) {
  const { index, isTransitioning, isFirst, isLast, goNext, goPrev, goTo } =
    useSceneState(story.scenes.length);

  useSwipe(
    useCallback(() => { if (!isLast) goNext(); }, [isLast, goNext]),
    useCallback(() => { if (!isFirst) goPrev(); }, [isFirst, goPrev])
  );

  const scene = story.scenes[index];
  const isEmpty = scene && !scene.narrator && scene.bubbles.length === 0;

  return (
    <div
      className="flex flex-col items-center justify-start relative overflow-hidden no-select"
      style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #0f1a3d 50%, #1a0a2e 100%)' }}
    >
      <HalftoneBackground />

      {/* Conteúdo centralizado e compacto */}
      <div className="relative z-10 flex flex-col w-full" style={{ maxWidth: '840px' }}>

        {/* Subtítulo de publicação (autor) */}
        {publicationMeta && (
          <div className="flex items-center gap-2 px-3 pt-2" style={{ flexWrap: 'wrap' }}>
            <Link
              href={`/book/${publicationMeta.bookId}`}
              style={{
                fontFamily: 'var(--font-bangers)',
                fontSize: '12px',
                letterSpacing: '0.05em',
                color: '#e8c84a',
                textDecoration: 'none',
                padding: '3px 8px',
                borderRadius: '20px',
                background: 'rgba(232,200,74,0.12)',
                border: '1px solid rgba(232,200,74,0.35)',
              }}
            >
              ← {publicationMeta.bookId}
            </Link>
            <span style={{ fontFamily: 'var(--font-nunito)', fontSize: '12px', color: 'rgba(245,240,232,0.5)' }}>
              por <strong style={{ color: '#e8c84a' }}>{publicationMeta.author}</strong>
            </span>
          </div>
        )}

        {/* Header — sticky no topo */}
        <header
          className="flex items-center gap-2 px-3 py-2"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            background: 'rgba(10,6,18,0.9)',
            borderBottom: '1.5px solid rgba(232,200,74,0.2)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Botão Livros */}
          <Link
            href="/"
            className="flex items-center gap-1.5 flex-shrink-0"
            style={{
              fontFamily: 'var(--font-bangers)',
              fontSize: '15px',
              letterSpacing: '0.05em',
              color: '#e8c84a',
              textDecoration: 'none',
              padding: '5px 12px',
              borderRadius: '20px',
              background: 'rgba(232,200,74,0.14)',
              border: '1.5px solid rgba(232,200,74,0.5)',
              whiteSpace: 'nowrap',
            }}
          >
            🏠 Livros
          </Link>

          {/* Título grande */}
          <h1
            className="text-amber-300 truncate flex-1"
            style={{
              fontFamily: 'var(--font-bangers)',
              fontSize: 'clamp(18px, 5vw, 28px)',
              letterSpacing: '0.05em',
              textShadow: '2px 2px 0 #c8a420',
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            {story.title}
          </h1>

          {/* Contador + editar */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-amber-300/60" style={{ fontFamily: 'var(--font-bangers)', fontSize: '13px' }}>
              {index + 1}/{story.scenes.length}
            </span>
            {isLoggedIn && !publicationMeta && (
              <Link
                href={`/editor/${story.bookId}`}
                className="flex items-center justify-center rounded-full"
                title="Editar história"
                style={{
                  width: '28px', height: '28px',
                  background: 'rgba(232,200,74,0.2)',
                  border: '1.5px solid rgba(232,200,74,0.5)',
                  fontSize: '14px',
                }}
              >
                ✏️
              </Link>
            )}
          </div>
        </header>

        {/* Cena */}
        {scene && (
          <div className="relative">
            <SceneView scene={scene} isTransitioning={isTransitioning} />

            {/* Estado vazio — mostra apenas em dev */}
            {isEmpty && isDevMode && (
              <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                style={{ background: 'rgba(26,10,46,0.55)' }}>
                <Link
                  href={`/editor/${story.bookId}`}
                  className="pointer-events-auto flex flex-col items-center gap-1 px-4 py-3 rounded-xl"
                  style={{
                    background: 'rgba(232,200,74,0.15)',
                    border: '2px dashed rgba(232,200,74,0.6)',
                    textDecoration: 'none',
                  }}
                >
                  <span style={{ fontSize: '24px' }}>✏️</span>
                  <span style={{ fontFamily: 'var(--font-bangers)', fontSize: '15px', color: '#e8c84a', letterSpacing: '0.05em' }}>
                    Escrever história
                  </span>
                  <span style={{ fontFamily: 'var(--font-nunito)', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                    Clique para abrir o editor
                  </span>
                </Link>
              </div>
            )}

            {/* Setas de navegação */}
            <motion.button
              onClick={goPrev}
              disabled={isFirst || isTransitioning}
              whileHover={{ scale: 1.08, x: -2 }}
              whileTap={{ scale: 0.93 }}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center justify-center gap-0.5 disabled:opacity-0 disabled:pointer-events-none transition-opacity"
              style={{
                width: '44px', height: '72px',
                background: 'linear-gradient(135deg, rgba(232,200,74,0.22), rgba(180,140,20,0.12))',
                borderRadius: '0 16px 16px 0',
                border: '2px solid rgba(232,200,74,0.45)',
                borderLeft: 'none',
                backdropFilter: 'blur(8px)',
                boxShadow: '4px 0 16px rgba(0,0,0,0.4)',
              }}
            >
              <span style={{ color: '#e8c84a', fontSize: '28px', lineHeight: 1, textShadow: '0 0 8px rgba(232,200,74,0.6)' }}>❮</span>
              <span style={{ color: 'rgba(232,200,74,0.6)', fontSize: '9px', fontFamily: 'var(--font-bangers)', letterSpacing: '0.05em' }}>ANT</span>
            </motion.button>

            <motion.button
              onClick={goNext}
              disabled={isLast || isTransitioning}
              whileHover={{ scale: 1.08, x: 2 }}
              whileTap={{ scale: 0.93 }}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center justify-center gap-0.5 disabled:opacity-0 disabled:pointer-events-none transition-opacity"
              style={{
                width: '44px', height: '72px',
                background: 'linear-gradient(225deg, rgba(232,200,74,0.22), rgba(180,140,20,0.12))',
                borderRadius: '16px 0 0 16px',
                border: '2px solid rgba(232,200,74,0.45)',
                borderRight: 'none',
                backdropFilter: 'blur(8px)',
                boxShadow: '-4px 0 16px rgba(0,0,0,0.4)',
              }}
            >
              <span style={{ color: '#e8c84a', fontSize: '28px', lineHeight: 1, textShadow: '0 0 8px rgba(232,200,74,0.6)' }}>❯</span>
              <span style={{ color: 'rgba(232,200,74,0.6)', fontSize: '9px', fontFamily: 'var(--font-bangers)', letterSpacing: '0.05em' }}>PRX</span>
            </motion.button>
          </div>
        )}

        {/* Progress dots */}
        <ProgressDots total={story.scenes.length} current={index} onDotClick={goTo} />

        {/* Botão voltar ao início — só aparece quando não está na cena 1 */}
        {!isFirst && (
          <div
            className="flex items-center justify-center px-4 py-4"
            style={{ borderTop: '1px solid rgba(232,200,74,0.12)', marginTop: '4px' }}
          >
            <motion.button
              onClick={() => goTo(0)}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2"
              style={{
                fontFamily: 'var(--font-bangers)',
                fontSize: '18px',
                letterSpacing: '0.06em',
                color: 'rgba(245,240,232,0.8)',
                padding: '10px 22px',
                borderRadius: '28px',
                background: 'rgba(255,255,255,0.07)',
                border: '2px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
              }}
            >
              ⏮ Início
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
