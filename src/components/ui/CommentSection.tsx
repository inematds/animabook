'use client';
import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { Comment } from '@/lib/types';
import { motion } from 'framer-motion';

interface CommentSectionProps {
  publicationId: string;
  initialComments: Comment[];
  userId: string | null;
  username: string | null;
}

export function CommentSection({ publicationId, initialComments, userId, username }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !text.trim()) return;
    setLoading(true);
    const supabase = createSupabaseBrowserClient();

    const { data, error } = await supabase
      .from('comments')
      .insert({ user_id: userId, publication_id: publicationId, text: text.trim() })
      .select('*, profiles(username)')
      .single();

    if (!error && data) {
      setComments(prev => [...prev, data as Comment]);
      setText('');
    }
    setLoading(false);
  }

  async function handleDelete(commentId: string) {
    const supabase = createSupabaseBrowserClient();
    await supabase.from('comments').delete().eq('id', commentId);
    setComments(prev => prev.filter(c => c.id !== commentId));
  }

  return (
    <div style={{ marginTop: '24px' }}>
      <h3
        style={{
          fontFamily: 'var(--font-bangers)',
          fontSize: '22px',
          letterSpacing: '0.05em',
          color: '#e8c84a',
          marginBottom: '16px',
        }}
      >
        Comentários ({comments.length})
      </h3>

      {comments.length === 0 && (
        <p style={{ fontFamily: 'var(--font-nunito)', color: 'rgba(245,240,232,0.4)', fontSize: '16px', marginBottom: '16px' }}>
          Nenhum comentário ainda.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        {comments.map(c => (
          <div
            key={c.id}
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(232,200,74,0.15)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
              <div>
                <span style={{ fontFamily: 'var(--font-bangers)', fontSize: '16px', color: '#e8c84a', letterSpacing: '0.05em' }}>
                  {c.profiles?.username ?? 'Usuário'}
                </span>
                <span style={{ fontFamily: 'var(--font-nunito)', fontSize: '13px', color: 'rgba(245,240,232,0.4)', marginLeft: '8px' }}>
                  {new Date(c.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              {userId === c.user_id && (
                <button
                  onClick={() => handleDelete(c.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'rgba(248,113,113,0.6)',
                    fontSize: '14px',
                    padding: '0',
                  }}
                  title="Excluir"
                >
                  ✕
                </button>
              )}
            </div>
            <p style={{ fontFamily: 'var(--font-nunito)', fontSize: '16px', lineHeight: 1.5, color: '#f5f0e8', margin: '6px 0 0' }}>
              {c.text}
            </p>
          </div>
        ))}
      </div>

      {userId ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder={`Comentar como ${username}...`}
            value={text}
            onChange={e => setText(e.target.value)}
            maxLength={500}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1.5px solid rgba(232,200,74,0.3)',
              background: 'rgba(255,255,255,0.05)',
              color: '#f5f0e8',
              fontFamily: 'var(--font-nunito)',
              fontSize: '16px',
              outline: 'none',
            }}
          />
          <motion.button
            type="submit"
            disabled={loading || !text.trim()}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: 'var(--comic-yellow)',
              color: '#1a1a2e',
              border: '2px solid var(--comic-shadow)',
              borderRadius: '10px',
              padding: '10px 18px',
              fontFamily: 'var(--font-bangers)',
              fontSize: '15px',
              letterSpacing: '0.05em',
              cursor: loading || !text.trim() ? 'not-allowed' : 'pointer',
              opacity: loading || !text.trim() ? 0.6 : 1,
            }}
          >
            Enviar
          </motion.button>
        </form>
      ) : (
        <p style={{ fontFamily: 'var(--font-nunito)', color: 'rgba(245,240,232,0.5)', fontSize: '16px' }}>
          <a href="/login" style={{ color: '#e8c84a' }}>Entre</a> para comentar.
        </p>
      )}
    </div>
  );
}
