'use client';
import { motion } from 'framer-motion';
import { progressDotVariants } from '@/lib/animationVariants';

interface ProgressDotsProps {
  total: number;
  current: number;
  onDotClick: (i: number) => void;
}

export function ProgressDots({ total, current, onDotClick }: ProgressDotsProps) {
  return (
    <div className="flex items-center justify-center gap-1 py-1.5 flex-wrap max-w-xs mx-auto px-2">
      {Array.from({ length: total }).map((_, i) => (
        <motion.button
          key={i}
          variants={progressDotVariants}
          animate={i === current ? 'active' : 'inactive'}
          onClick={() => onDotClick(i)}
          className="rounded-full transition-colors duration-200 focus:outline-none"
          style={{
            width: i === current ? '16px' : '8px',
            height: '8px',
            background: i === current ? 'var(--comic-yellow)' : 'rgba(255,255,255,0.3)',
            border: '2px solid',
            borderColor: i === current ? 'var(--comic-shadow)' : 'rgba(255,255,255,0.2)',
          }}
          aria-label={`Ir para cena ${i + 1}`}
        />
      ))}
    </div>
  );
}
