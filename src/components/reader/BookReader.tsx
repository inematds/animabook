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

interface BookReaderProps {
  story: StoryData;
  isDevMode: boolean;
}

export function BookReader({ story, isDevMode }: BookReaderProps) {
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
      className="min-h-dvh flex flex-col items-center justify-center relative overflow-hidden no-select"
      style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #0f1a3d 50%, #1a0a2e 100%)' }}
    >
      <HalftoneBackground />

      {/* Conteúdo centralizado e compacto */}
      <div className="relative z-10 flex flex-col w-full" style={{ maxWidth: '546px' }}>

        {/* Header */}
        <header className="flex items-center justify-between px-3 py-2">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{
              background: 'rgba(232,200,74,0.18)',
              border: '1.5px solid rgba(232,200,74,0.55)',
              textDecoration: 'none',
            }}
          >
            <span style={{ fontSize: '13px' }}>🏠</span>
            <span style={{ fontFamily: 'var(--font-bangers)', fontSize: '13px', letterSpacing: '0.05em', color: '#e8c84a' }}>Livros</span>
          </Link>

          <h1
            className="text-amber-300 truncate max-w-[50%] text-center"
            style={{ fontFamily: 'var(--font-bangers)', fontSize: '14px', letterSpacing: '0.05em', textShadow: '1px 1px 0 #c8a420' }}
          >
            {story.title}
          </h1>

          <div className="flex items-center gap-2">
            <span className="text-amber-300/60" style={{ fontFamily: 'var(--font-bangers)', fontSize: '12px' }}>
              {index + 1}/{story.scenes.length}
            </span>
            {isDevMode && (
              <Link
                href={`/editor/${story.bookId}`}
                className="flex items-center justify-center rounded-full"
                title="Editar história"
                style={{
                  width: '26px', height: '26px',
                  background: 'rgba(232,200,74,0.2)',
                  border: '1.5px solid rgba(232,200,74,0.5)',
                  fontSize: '13px',
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
            {!isFirst && (
              <motion.button whileTap={{ scale: 0.9 }} onClick={goPrev} disabled={isTransitioning}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-40 flex items-center justify-center disabled:opacity-30"
                style={{ width: '32px', height: '48px', background: 'rgba(26,10,46,0.6)', borderRadius: '0 8px 8px 0', color: '#e8c84a', fontSize: '20px', backdropFilter: 'blur(4px)' }}>
                ‹
              </motion.button>
            )}
            {!isLast && (
              <motion.button whileTap={{ scale: 0.9 }} onClick={goNext} disabled={isTransitioning}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-40 flex items-center justify-center disabled:opacity-30"
                style={{ width: '32px', height: '48px', background: 'rgba(26,10,46,0.6)', borderRadius: '8px 0 0 8px', color: '#e8c84a', fontSize: '20px', backdropFilter: 'blur(4px)' }}>
                ›
              </motion.button>
            )}
          </div>
        )}

        {/* Progress dots */}
        <ProgressDots total={story.scenes.length} current={index} onDotClick={goTo} />
      </div>
    </div>
  );
}
