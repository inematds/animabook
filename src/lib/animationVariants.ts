import { Variants } from 'framer-motion';

export const narratorVariants: Variants = {
  hidden: { opacity: 0, y: -24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.2 },
  },
};

export const bubbleVariants: Variants = {
  hidden: { opacity: 0, scale: 0, originX: '10%', originY: '90%' },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 420,
      damping: 16,
      delay: 0.5 + i * 0.2,
    },
  }),
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.15 },
  },
};

export const sceneVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

export const progressDotVariants: Variants = {
  inactive: { scale: 1, opacity: 0.4 },
  active: {
    scale: 1.3,
    opacity: 1,
    transition: { type: 'spring', stiffness: 500, damping: 20 },
  },
};

export const bookCoverVariants: Variants = {
  idle: { scale: 1, y: 0, boxShadow: '4px 8px 20px rgba(0,0,0,0.5)' },
  hover: {
    scale: 1.04,
    y: -6,
    boxShadow: '8px 16px 32px rgba(0,0,0,0.7)',
    transition: { type: 'spring', stiffness: 400, damping: 20 },
  },
  tap: { scale: 0.97 },
};
