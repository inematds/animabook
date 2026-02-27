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
}

export function BookReader({ story }: BookReaderProps) {
  const { index, isTransitioning, isFirst, isLast, goNext, goPrev, goTo } =
    useSceneState(story.scenes.length);

  useSwipe(
    useCallback(() => { if (!isLast) goNext(); }, [isLast, goNext]),
    useCallback(() => { if (!isFirst) goPrev(); }, [isFirst, goPrev])
  );

  const scene = story.scenes[index];

  return (
    <div
      className="min-h-dvh flex flex-col relative overflow-hidden no-select"
      style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #0f1a3d 50%, #1a0a2e 100%)' }}
    >
      <HalftoneBackground />

      {/* Header compacto */}
      <header className="relative z-10 flex items-center justify-between px-3 pt-2 pb-1">
        <Link
          href="/"
          className="text-amber-300 hover:text-amber-200 transition-colors flex items-center gap-1"
        >
          <span className="text-base">←</span>
          <span style={{ fontFamily: 'var(--font-bangers)', fontSize: '13px', letterSpacing: '0.05em' }}>
            Voltar
          </span>
        </Link>

        <h1
          className="text-center text-amber-300 truncate max-w-[55%]"
          style={{
            fontFamily: 'var(--font-bangers)',
            fontSize: 'clamp(13px, 3.5vw, 17px)',
            letterSpacing: '0.05em',
            textShadow: '1px 1px 0 #c8a420',
          }}
        >
          {story.title}
        </h1>

        <span
          className="text-amber-300/60"
          style={{ fontFamily: 'var(--font-bangers)', fontSize: '12px' }}
        >
          {index + 1}/{story.scenes.length}
        </span>
      </header>

      {/* Conteúdo principal */}
      <main className="relative z-10 flex-1 flex flex-col justify-center">
        {scene && (
          <div className="relative">
            <SceneView scene={scene} isTransitioning={isTransitioning} />

            {/* Setas de navegação sobrepostas nas bordas da imagem */}
            {!isFirst && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={goPrev}
                disabled={isTransitioning}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-40 flex items-center justify-center disabled:opacity-30"
                style={{
                  width: '36px',
                  height: '52px',
                  background: 'rgba(26,10,46,0.6)',
                  borderRadius: '0 8px 8px 0',
                  color: '#e8c84a',
                  fontSize: '18px',
                  backdropFilter: 'blur(4px)',
                }}
              >
                ‹
              </motion.button>
            )}

            {!isLast && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={goNext}
                disabled={isTransitioning}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-40 flex items-center justify-center disabled:opacity-30"
                style={{
                  width: '36px',
                  height: '52px',
                  background: 'rgba(26,10,46,0.6)',
                  borderRadius: '8px 0 0 8px',
                  color: '#e8c84a',
                  fontSize: '18px',
                  backdropFilter: 'blur(4px)',
                }}
              >
                ›
              </motion.button>
            )}
          </div>
        )}
      </main>

      {/* Pontos de progresso compactos */}
      <footer className="relative z-10 py-1">
        <ProgressDots
          total={story.scenes.length}
          current={index}
          onDotClick={goTo}
        />
      </footer>
    </div>
  );
}
