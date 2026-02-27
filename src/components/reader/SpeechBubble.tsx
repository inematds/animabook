'use client';
import { motion } from 'framer-motion';
import { SpeechBubble as SpeechBubbleType } from '@/lib/types';
import { bubbleVariants } from '@/lib/animationVariants';

interface SpeechBubbleProps {
  bubble: SpeechBubbleType;
  index: number;
}

export function SpeechBubble({ bubble, index }: SpeechBubbleProps) {
  const isRight = bubble.position === 'dir';

  return (
    <motion.div
      custom={index}
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`absolute z-20 max-w-[48%] ${
        isRight ? 'right-2' : 'left-2'
      }`}
      style={{ top: `${12 + index * 26}%` }}
    >
      {/* Floating bubble - rounded pill style, no tail */}
      <div
        className="px-2.5 py-1.5"
        style={{
          background: 'rgba(254,254,254,0.96)',
          border: '2px solid #1a1a2e',
          borderRadius: '14px',
          boxShadow: '2px 3px 0 rgba(0,0,0,0.35)',
        }}
      >
        <p
          className="font-bold leading-none mb-1"
          style={{
            fontFamily: 'var(--font-bangers)',
            fontSize: 'clamp(9px, 2.2vw, 12px)',
            color: '#1a0a2e',
            letterSpacing: '0.06em',
          }}
        >
          {bubble.character}
        </p>
        <p
          className="leading-tight text-[#1a1a2e]"
          style={{
            fontFamily: 'var(--font-nunito)',
            fontSize: 'clamp(10px, 2.5vw, 13px)',
          }}
        >
          {bubble.text}
        </p>
      </div>
    </motion.div>
  );
}
