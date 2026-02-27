'use client';
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { SpeechBubble as SpeechBubbleType } from '@/lib/types';
import { bubbleVariants } from '@/lib/animationVariants';

// Posições padrão quando x/y não estão definidos
const DEFAULTS = [
  { x: 0.08, y: 0.08 },
  { x: 0.55, y: 0.18 },
  { x: 0.06, y: 0.55 },
  { x: 0.52, y: 0.62 },
];

interface SpeechBubbleProps {
  bubble: SpeechBubbleType;
  index: number;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  onMove?: (index: number, x: number, y: number) => void;
}

export function SpeechBubble({ bubble, index, containerRef, onMove }: SpeechBubbleProps) {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const isDraggable = !!onMove;

  const def = DEFAULTS[index % DEFAULTS.length];
  const bx = bubble.x ?? def.x;
  const by = bubble.y ?? def.y;

  const handleDragEnd = () => {
    if (!bubbleRef.current || !containerRef?.current || !onMove) return;
    const bRect = bubbleRef.current.getBoundingClientRect();
    const cRect = containerRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(1, (bRect.left + bRect.width / 2 - cRect.left) / cRect.width));
    const newY = Math.max(0, Math.min(1, (bRect.top + bRect.height / 2 - cRect.top) / cRect.height));
    onMove(index, newX, newY);
  };

  return (
    <motion.div
      ref={bubbleRef}
      custom={index}
      variants={isDraggable ? undefined : bubbleVariants}
      initial={isDraggable ? { opacity: 0, scale: 0.8 } : 'hidden'}
      animate={isDraggable ? { opacity: 1, scale: 1 } : 'visible'}
      exit="exit"
      drag={isDraggable}
      dragMomentum={false}
      dragConstraints={containerRef ?? undefined}
      onDragEnd={handleDragEnd}
      className="absolute z-20"
      style={{
        left: `${bx * 100}%`,
        top: `${by * 100}%`,
        transform: 'translate(-50%, -50%)',
        maxWidth: '52%',
        cursor: isDraggable ? 'grab' : 'default',
        touchAction: isDraggable ? 'none' : 'auto',
      }}
      whileDrag={{ cursor: 'grabbing', scale: 1.04, zIndex: 50 }}
    >
      <div
        className="px-2.5 py-1.5 select-none relative"
        style={{
          background: 'rgba(254,254,254,0.96)',
          border: isDraggable ? '2px dashed #e8c84a' : '2px solid #1a1a2e',
          borderRadius: '14px',
          boxShadow: isDraggable
            ? '0 0 0 1px rgba(232,200,74,0.4), 2px 3px 8px rgba(0,0,0,0.4)'
            : '2px 3px 0 rgba(0,0,0,0.35)',
        }}
      >
        {/* Cauda do balão (V) — só no reader, não no editor arrastável */}
        {!isDraggable && (
          <>
            {/* borda da cauda */}
            <div style={{
              position: 'absolute',
              bottom: '-13px',
              [bubble.position === 'dir' ? 'right' : 'left']: '14px',
              width: 0, height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '12px solid #1a1a2e',
            }} />
            {/* preenchimento da cauda */}
            <div style={{
              position: 'absolute',
              bottom: '-10px',
              [bubble.position === 'dir' ? 'right' : 'left']: '16px',
              width: 0, height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '10px solid rgba(254,254,254,0.96)',
            }} />
          </>
        )}
        {isDraggable && (
          <div className="flex items-center justify-between mb-0.5">
            <p style={{ fontFamily: 'var(--font-bangers)', fontSize: 'clamp(11px, 3vw, 14px)', color: '#1a0a2e', letterSpacing: '0.06em' }}>
              {bubble.character || '…'}
            </p>
            <span style={{ fontSize: '9px', color: '#b0a000', marginLeft: '4px' }}>⠿</span>
          </div>
        )}
        {!isDraggable && bubble.character && (
          <p style={{ fontFamily: 'var(--font-bangers)', fontSize: 'clamp(11px, 3vw, 14px)', color: '#1a0a2e', letterSpacing: '0.06em', marginBottom: '2px' }}>
            {bubble.character}
          </p>
        )}
        <p className="leading-tight text-[#1a1a2e]" style={{ fontFamily: 'var(--font-nunito)', fontSize: 'clamp(13px, 3.5vw, 16px)' }}>
          {bubble.text}
        </p>
      </div>
    </motion.div>
  );
}
