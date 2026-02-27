'use client';
import { useState, useCallback } from 'react';

export function useSceneState(total: number) {
  const [index, setIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const navigate = useCallback(
    (direction: 'next' | 'prev') => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setIndex(prev => {
          if (direction === 'next') return Math.min(prev + 1, total - 1);
          return Math.max(prev - 1, 0);
        });
        setIsTransitioning(false);
      }, 300);
    },
    [isTransitioning, total]
  );

  const goNext = useCallback(() => navigate('next'), [navigate]);
  const goPrev = useCallback(() => navigate('prev'), [navigate]);
  const goTo = useCallback(
    (i: number) => {
      if (isTransitioning || i === index) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setIndex(Math.max(0, Math.min(i, total - 1)));
        setIsTransitioning(false);
      }, 300);
    },
    [isTransitioning, index, total]
  );

  return {
    index,
    isTransitioning,
    isFirst: index === 0,
    isLast: index === total - 1,
    goNext,
    goPrev,
    goTo,
  };
}
