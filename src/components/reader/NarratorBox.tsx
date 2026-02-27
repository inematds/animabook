'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useTypewriter } from '@/hooks/useTypewriter';
import { narratorVariants } from '@/lib/animationVariants';

interface NarratorBoxProps {
  text: string;
  sceneKey: number;
}

export function NarratorBox({ text, sceneKey }: NarratorBoxProps) {
  const displayed = useTypewriter(text, 20);

  if (!text) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={sceneKey}
        variants={narratorVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="narrator-box mx-2 mb-2 px-3 py-2 relative z-10"
      >
        <div className="flex items-start gap-1.5">
          <span className="text-base flex-shrink-0">📖</span>
          <p
            className="text-[#1a1a2e] leading-snug"
            style={{
              fontFamily: 'var(--font-nunito)',
              fontSize: 'clamp(12px, 3vw, 14px)',
              minHeight: '1.2em',
            }}
          >
            {displayed}
            <span className="inline-block w-0.5 h-3.5 bg-amber-700 ml-0.5 animate-pulse align-middle opacity-60" />
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
