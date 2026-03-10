'use client';
import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Scene } from '@/lib/types';
import { NarratorBox } from './NarratorBox';
import { SpeechBubble } from './SpeechBubble';
import { sceneVariants } from '@/lib/animationVariants';

interface SceneViewProps {
  scene: Scene;
  isTransitioning: boolean;
  isOriginal?: boolean;
  synopsis?: string;
  onBubbleMove?: (bubbleIndex: number, x: number, y: number) => void;
}

export function SceneView({ scene, isTransitioning, isOriginal, synopsis, onBubbleMove }: SceneViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const w = scene.width ?? 1344;
  const h = scene.height ?? 768;
  const isPortrait = h > w;
  // For portrait images, cap width so height stays manageable (~850px)
  const maxWidth = isPortrait ? `${Math.round(850 * w / h)}px` : '1344px';
  const aspectRatio = `${w}/${h}`;

  return (
    <motion.div
      key={scene.index}
      variants={sceneVariants}
      initial="hidden"
      animate={isTransitioning ? 'exit' : 'visible'}
      className="flex flex-col w-full"
    >
      {/* NarratorBox clássico (acima da imagem) para publicações */}
      {!isOriginal && scene.narrator && (
        <NarratorBox text={scene.narrator} sceneKey={scene.index} />
      )}


      <div className="relative w-full mx-auto" style={{ maxWidth }}>
        <div ref={containerRef} className="relative w-full" style={{ aspectRatio }}>
          <Image
            src={scene.imageUrl}
            alt={`Cena ${scene.index + 1}`}
            fill
            className="object-cover select-none"
            draggable={false}
            priority={scene.index < 2}
            sizes="100vw"
          />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, transparent 60%, rgba(26,10,46,0.4) 100%)' }}
          />

          {/* Capa do original: synopsis sobreposta na imagem */}
          {isOriginal && synopsis && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(10,6,18,0.97) 0%, rgba(10,6,18,0.82) 55%, rgba(10,6,18,0.45) 100%)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '20px 18px 24px',
              overflowY: 'auto',
            }}>
              <p style={{
                fontFamily: 'var(--font-nunito)',
                fontSize: 'clamp(13px, 3.5vw, 16px)',
                lineHeight: 1.75,
                color: 'rgba(245,240,232,0.92)',
                margin: 0,
                whiteSpace: 'pre-wrap',
              }}>
                {synopsis}
              </p>
            </div>
          )}

          {/* Narrador sobreposto na imagem (original, cenas 1+) */}
          {isOriginal && !synopsis && scene.narrator && (
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(10,6,18,0.92) 0%, rgba(10,6,18,0.6) 60%, transparent 100%)',
              padding: '48px 16px 14px',
            }}>
              <p style={{
                fontFamily: 'var(--font-nunito)',
                fontSize: 'clamp(13px, 3.5vw, 16px)',
                lineHeight: 1.65,
                color: 'rgba(245,240,232,0.92)',
                margin: 0,
                fontStyle: 'italic',
              }}>
                {scene.narrator}
              </p>
            </div>
          )}

          {/* Balões de diálogo — todos os modos */}
          <AnimatePresence>
            {!isTransitioning &&
              scene.bubbles.map((bubble, i) => (
                <SpeechBubble
                  key={`${scene.index}-${i}`}
                  bubble={bubble}
                  index={i}
                  containerRef={onBubbleMove ? containerRef : undefined}
                  onMove={onBubbleMove}
                />
              ))}
          </AnimatePresence>
        </div>

        <div
          className="absolute top-2 right-2 z-30 px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(232,200,74,0.9)', color: '#1a1a2e', fontFamily: 'var(--font-bangers)', fontSize: '13px', letterSpacing: '0.05em', border: '2px solid #1a1a2e' }}
        >
          {scene.index + 1}
        </div>
      </div>
    </motion.div>
  );
}
