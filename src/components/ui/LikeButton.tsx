'use client';
import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { motion } from 'framer-motion';

interface LikeButtonProps {
  publicationId: string;
  initialCount: number;
  initialLiked: boolean;
  userId: string | null;
}

export function LikeButton({ publicationId, initialCount, initialLiked, userId }: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    if (!userId) return;
    setLoading(true);
    const supabase = createSupabaseBrowserClient();

    if (liked) {
      await supabase
        .from('likes')
        .delete()
        .eq('user_id', userId)
        .eq('publication_id', publicationId);
      setLiked(false);
      setCount(c => c - 1);
    } else {
      await supabase
        .from('likes')
        .insert({ user_id: userId, publication_id: publicationId });
      setLiked(true);
      setCount(c => c + 1);
    }
    setLoading(false);
  }

  return (
    <motion.button
      whileHover={userId ? { scale: 1.08 } : {}}
      whileTap={userId ? { scale: 0.92 } : {}}
      onClick={handleToggle}
      disabled={loading || !userId}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        borderRadius: '20px',
        border: `2px solid ${liked ? '#f43f5e' : 'rgba(244,63,94,0.4)'}`,
        background: liked ? 'rgba(244,63,94,0.2)' : 'rgba(244,63,94,0.05)',
        color: liked ? '#f43f5e' : 'rgba(244,63,94,0.6)',
        fontFamily: 'var(--font-bangers)',
        fontSize: '16px',
        letterSpacing: '0.05em',
        cursor: userId ? 'pointer' : 'default',
        opacity: loading ? 0.6 : 1,
        transition: 'all 0.2s',
      }}
      title={userId ? undefined : 'Entre para curtir'}
    >
      <span>{liked ? '❤️' : '🤍'}</span>
      <span>{count}</span>
    </motion.button>
  );
}
