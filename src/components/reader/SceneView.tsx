'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Scene } from '@/lib/types';
import { NarratorBox } from './NarratorBox';
import { SpeechBubble } from './SpeechBubble';
import { sceneVariants } from '@/lib/animationVariants';

interface SceneViewProps {
  scene: Scene;
  isTransitioning: boolean;
}

export function SceneView({ scene, isTransitioning }: SceneViewProps) {
  return (
    <motion.div
      key={scene.index}
      variants={sceneVariants}
      initial="hidden"
      animate={isTransitioning ? 'exit' : 'visible'}
      className="flex flex-col w-full"
    >
      {/* Narrator box above image */}
      {scene.narrator && (
        <NarratorBox text={scene.narrator} sceneKey={scene.index} />
      )}

      {/* Image container with speech bubbles overlaid */}
      <div className="relative w-full mx-auto" style={{ maxWidth: '1344px' }}>
        <div className="relative w-full" style={{ aspectRatio: '7/4' }}>
          <Image
            src={scene.imageUrl}
            alt={`Cena ${scene.index + 1}`}
            fill
            className="object-cover select-none"
            draggable={false}
            priority={scene.index < 2}
            sizes="100vw"
          />

          {/* Subtle vignette overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center, transparent 60%, rgba(26,10,46,0.4) 100%)',
            }}
          />

          {/* Speech bubbles */}
          <AnimatePresence>
            {!isTransitioning &&
              scene.bubbles.map((bubble, i) => (
                <SpeechBubble key={`${scene.index}-${i}`} bubble={bubble} index={i} />
              ))}
          </AnimatePresence>
        </div>

        {/* Scene number badge */}
        <div
          className="absolute top-2 right-2 z-30 px-2 py-0.5 rounded-full text-xs font-bold"
          style={{
            background: 'rgba(232,200,74,0.9)',
            color: '#1a1a2e',
            fontFamily: 'var(--font-bangers)',
            fontSize: '13px',
            letterSpacing: '0.05em',
            border: '2px solid #1a1a2e',
          }}
        >
          {scene.index + 1}
        </div>
      </div>
    </motion.div>
  );
}
