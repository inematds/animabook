'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StoryData, Comment } from '@/lib/types';
import { BookReader } from '@/components/reader/BookReader';
import { LikeButton } from './LikeButton';
import { CommentSection } from './CommentSection';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

export interface PubSummary {
  id: string;
  authorName: string;
  publishedAt: string;
  likesCount: number;
}

interface PubData {
  story: StoryData;
  likesCount: number;
  userLiked: boolean;
  comments: Comment[];
}

interface Props {
  baseStory: StoryData;
  synopsis: string;
  publications: PubSummary[];
  isLoggedIn: boolean;
  userId: string | null;
  username: string | null;
  isDevMode: boolean;
}

function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

function relativeDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return 'hoje';
  if (diff === 1) return 'ontem';
  if (diff < 7) return `${diff}d`;
  if (diff < 30) return `${Math.floor(diff / 7)}sem`;
  return `${Math.floor(diff / 30)}m`;
}

const COLORS = ['#e8c84a', '#a78bfa', '#4ade80', '#f43f5e', '#60a5fa', '#fb923c'];

export function BookPageClient({ baseStory, synopsis, publications, isLoggedIn, userId, username, isDevMode }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pubData, setPubData] = useState<PubData | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const socialRef = useRef<HTMLDivElement>(null);

  // Abre sidebar automaticamente em desktop
  useEffect(() => {
    if (publications.length > 0 && window.innerWidth >= 768) setOpen(true);
  }, [publications.length]);

  async function selectPub(pubId: string | null) {
    if (pubId === null) {
      setSelectedId(null);
      setPubData(null);
      return;
    }
    if (pubId === selectedId) {
      socialRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setSelectedId(pubId);
    setPubData(null);
    setLoading(true);

    const sb = createSupabaseBrowserClient();
    const { data: { session } } = await sb.auth.getSession();
    const headers: Record<string, string> = {};
    if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;

    const res = await fetch(`/api/publication/${pubId}`, { headers });
    if (res.ok) setPubData(await res.json());
    setLoading(false);

    // Scroll para a área social após carregar
    setTimeout(() => socialRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);
  }

  const story = pubData?.story ?? baseStory;
  const selectedPub = publications.find(p => p.id === selectedId);

  return (
    <div style={{ position: 'relative' }}>

      {/* ───── Sidebar ───── */}
      {publications.length > 0 && (
        <>
          {/* Botão toggle — sempre visível na borda esquerda */}
          <button
            onClick={() => setOpen(v => !v)}
            title={open ? 'Fechar lista' : `${publications.length} publicação(ões)`}
            style={{
              position: 'fixed',
              left: open ? 176 : 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 110,
              width: '22px',
              height: '64px',
              background: 'rgba(232,200,74,0.18)',
              border: '1.5px solid rgba(232,200,74,0.5)',
              borderLeft: open ? '1.5px solid rgba(232,200,74,0.5)' : 'none',
              borderRadius: open ? '0 8px 8px 0' : '0 8px 8px 0',
              color: '#e8c84a',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'left 0.25s ease',
              backdropFilter: 'blur(8px)',
            }}
          >
            {open ? '‹' : '›'}
          </button>

          {/* Painel lateral */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ x: -200, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -200, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{
                  position: 'fixed',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '176px',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'rgba(10,6,18,0.93)',
                  borderRight: '1.5px solid rgba(232,200,74,0.25)',
                  backdropFilter: 'blur(16px)',
                  overflowY: 'auto',
                }}
              >
                {/* Header */}
                <div style={{
                  padding: '16px 12px 10px',
                  borderBottom: '1px solid rgba(232,200,74,0.15)',
                  flexShrink: 0,
                }}>
                  <p style={{
                    fontFamily: 'var(--font-bangers)',
                    fontSize: '13px',
                    letterSpacing: '0.1em',
                    color: 'rgba(232,200,74,0.5)',
                    margin: '0 0 6px',
                  }}>
                    PUBLICAÇÕES
                  </p>
                  {/* Original */}
                  <button
                    onClick={() => selectPub(null)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '6px 8px',
                      borderRadius: '8px',
                      border: `1.5px solid ${selectedId === null ? 'rgba(232,200,74,0.6)' : 'transparent'}`,
                      background: selectedId === null ? 'rgba(232,200,74,0.12)' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>📖</span>
                    <span style={{
                      fontFamily: 'var(--font-nunito)',
                      fontSize: '12px',
                      color: selectedId === null ? '#e8c84a' : 'rgba(245,240,232,0.55)',
                      fontWeight: selectedId === null ? 700 : 400,
                    }}>
                      Original
                    </span>
                  </button>
                </div>

                {/* Lista de publicações */}
                <div style={{ flex: 1, padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {publications.map((pub, i) => {
                    const color = COLORS[i % COLORS.length];
                    const isSelected = selectedId === pub.id;
                    return (
                      <button
                        key={pub.id}
                        onClick={() => selectPub(pub.id)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '8px',
                          borderRadius: '10px',
                          border: `1.5px solid ${isSelected ? color : 'transparent'}`,
                          background: isSelected ? `rgba(${hexRgb(color)},0.12)` : 'rgba(255,255,255,0.03)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          transition: 'all 0.15s',
                        }}
                      >
                        {/* Avatar */}
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: `rgba(${hexRgb(color)},0.2)`,
                          border: `1.5px solid ${color}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-bangers)',
                          fontSize: '11px',
                          color,
                          flexShrink: 0,
                        }}>
                          {initials(pub.authorName)}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontFamily: 'var(--font-nunito)',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: isSelected ? color : '#f5f0e8',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>
                            {pub.authorName}
                          </div>
                          <div style={{
                            display: 'flex',
                            gap: '6px',
                            alignItems: 'center',
                            marginTop: '2px',
                          }}>
                            <span style={{ fontFamily: 'var(--font-nunito)', fontSize: '10px', color: 'rgba(245,240,232,0.4)' }}>
                              {relativeDate(pub.publishedAt)}
                            </span>
                            {pub.likesCount > 0 && (
                              <span style={{ fontFamily: 'var(--font-nunito)', fontSize: '10px', color: 'rgba(244,63,94,0.7)' }}>
                                ❤️ {pub.likesCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* ───── Reader ───── */}
      <BookReader
        story={story}
        isDevMode={isDevMode}
        isLoggedIn={isLoggedIn}
        publicationMeta={selectedPub
          ? { author: selectedPub.authorName, bookId: baseStory.bookId, publicationId: selectedPub.id }
          : undefined}
      />

      {/* ───── Social (likes + comentários) ou Sinopse do Original ───── */}
      <AnimatePresence mode="wait">
        {!selectedId && synopsis ? (
          <motion.div
            key="synopsis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              background: 'linear-gradient(135deg, #1a0a2e 0%, #0f1a3d 100%)',
              padding: '28px 16px 52px',
              borderTop: '1px solid rgba(232,200,74,0.15)',
            }}
          >
            <div style={{ maxWidth: '840px', margin: '0 auto' }}>
              <p style={{
                fontFamily: 'var(--font-bangers)',
                fontSize: '13px',
                letterSpacing: '0.1em',
                color: 'rgba(232,200,74,0.5)',
                margin: '0 0 10px',
              }}>
                SOBRE ESTE EPISÓDIO
              </p>
              <p style={{
                fontFamily: 'var(--font-nunito)',
                fontSize: '15px',
                lineHeight: 1.7,
                color: 'rgba(245,240,232,0.75)',
                margin: 0,
                whiteSpace: 'pre-wrap',
              }}>
                {synopsis}
              </p>
            </div>
          </motion.div>
        ) : selectedId ? (
          <motion.div
            key="social"
            ref={socialRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              background: 'linear-gradient(135deg, #1a0a2e 0%, #0f1a3d 100%)',
              padding: '28px 16px 52px',
            }}
          >
            <div style={{ maxWidth: '840px', margin: '0 auto' }}>
              {loading ? (
                <p style={{ fontFamily: 'var(--font-nunito)', color: 'rgba(245,240,232,0.4)', fontSize: '14px' }}>
                  Carregando…
                </p>
              ) : pubData ? (
                <>
                  <div style={{ marginBottom: '24px' }}>
                    <LikeButton
                      publicationId={selectedId}
                      initialCount={pubData.likesCount}
                      initialLiked={pubData.userLiked}
                      userId={userId}
                    />
                    {!isLoggedIn && (
                      <p style={{ fontFamily: 'var(--font-nunito)', fontSize: '12px', color: 'rgba(245,240,232,0.4)', marginTop: '6px' }}>
                        <a href={`/login?next=/book/${baseStory.bookId}`} style={{ color: '#e8c84a' }}>Entre</a> para curtir.
                      </p>
                    )}
                  </div>
                  <CommentSection
                    publicationId={selectedId}
                    initialComments={pubData.comments}
                    userId={userId}
                    username={username}
                  />
                </>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function hexRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
