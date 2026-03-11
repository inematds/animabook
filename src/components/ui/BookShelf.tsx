'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BookInfo } from '@/lib/types';
import { LatestVideo } from '@/lib/youtube';
import { bookCoverVariants } from '@/lib/animationVariants';
import { YouTubeCard } from './YouTubeCard';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

interface VisitStats {
  total: number;
  uniqueLogged: number;
  uniqueAnon: number;
}

interface BookShelfProps {
  books: BookInfo[];
  videos: (LatestVideo | null)[];
  isLoggedIn: boolean;
  username: string | null;
  visitStats: VisitStats;
}

export function BookShelf({ books, videos, isLoggedIn, username, visitStats }: BookShelfProps) {
  const hasVideos = videos.some(v => v !== null);
  const router = useRouter();

  useEffect(() => {
    async function trackVisit() {
      let sid = localStorage.getItem('animabook_sid');
      if (!sid) {
        sid = crypto.randomUUID();
        localStorage.setItem('animabook_sid', sid);
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const supabase = createSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      await fetch('/api/visit', {
        method: 'POST',
        headers,
        body: JSON.stringify({ session_id: sid }),
      });
    }
    trackVisit();
  }, []);

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  async function handleDeleteAccount() {
    if (!confirm('Tem certeza que quer excluir sua conta? Esta ação não pode ser desfeita.')) return;
    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;
    await fetch('/api/user', {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <div
      className="min-h-dvh flex flex-col relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #0f1a3d 50%, #1a0a2e 100%)' }}
    >
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #e8c84a, transparent)', transform: 'translate(30%, -30%)' }} />
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6b48ff, transparent)', transform: 'translate(-30%, 30%)' }} />

      {/* ── Topo fixo: título + stats + auth ── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(10,6,18,0.88)',
          borderBottom: '1.5px solid rgba(232,200,74,0.2)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '8px 14px' }}>

          {/* Linha 1: título + auth */}
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1
                style={{
                  fontFamily: 'var(--font-bangers)',
                  fontSize: 'clamp(28px, 8vw, 42px)',
                  color: 'var(--comic-yellow)',
                  textShadow: '3px 3px 0 var(--comic-shadow)',
                  letterSpacing: '0.08em',
                  lineHeight: 1,
                  margin: 0,
                }}
              >
                ANIMABOOK
              </h1>
              <span style={{
                fontFamily: 'var(--font-nunito)',
                fontSize: '10px',
                color: 'rgba(232,200,74,0.4)',
                letterSpacing: '0.04em',
              }}>
                v3.2.0
              </span>
            </motion.div>

            {/* Auth */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <span style={{ fontFamily: 'var(--font-nunito)', fontSize: '12px', color: 'rgba(232,200,74,0.7)' }}>
                  {username}
                </span>
                <button
                  onClick={handleLogout}
                  style={{
                    fontFamily: 'var(--font-bangers)',
                    fontSize: '12px',
                    letterSpacing: '0.05em',
                    color: 'rgba(248,113,113,0.8)',
                    background: 'rgba(248,113,113,0.1)',
                    border: '1px solid rgba(248,113,113,0.3)',
                    borderRadius: '20px',
                    padding: '3px 10px',
                    cursor: 'pointer',
                  }}
                >
                  Sair
                </button>
                <button
                  onClick={handleDeleteAccount}
                  title="Excluir minha conta"
                  style={{
                    fontFamily: 'var(--font-bangers)',
                    fontSize: '11px',
                    letterSpacing: '0.05em',
                    color: 'rgba(248,113,113,0.4)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '3px 4px',
                  }}
                >
                  🗑
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                style={{
                  fontFamily: 'var(--font-bangers)',
                  fontSize: '13px',
                  letterSpacing: '0.05em',
                  color: '#e8c84a',
                  textDecoration: 'none',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  background: 'rgba(232,200,74,0.12)',
                  border: '1.5px solid rgba(232,200,74,0.4)',
                }}
              >
                Entrar / Criar conta
              </Link>
            )}
          </div>

          {/* Linha 2: stats + subtítulo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 flex-wrap mt-1"
          >
            <span style={{ fontFamily: 'var(--font-nunito)', fontSize: '11px', color: 'rgba(255,200,100,0.45)', marginRight: '2px' }}>
              Escolha um livro:
            </span>
            {[
              { label: `👁 ${visitStats.total.toLocaleString('pt-BR')}`, bg: 'rgba(232,200,74,0.1)', border: 'rgba(232,200,74,0.3)', color: '#e8c84a', title: 'acessos' },
              { label: `🔑 ${visitStats.uniqueLogged.toLocaleString('pt-BR')}`, bg: 'rgba(107,72,255,0.12)', border: 'rgba(107,72,255,0.35)', color: '#a78bfa', title: 'logados' },
              { label: `👤 ${visitStats.uniqueAnon.toLocaleString('pt-BR')}`, bg: 'rgba(56,189,248,0.1)', border: 'rgba(56,189,248,0.3)', color: '#7dd3fc', title: 'anônimos' },
            ].map(chip => (
              <span
                key={chip.label}
                title={chip.title}
                style={{
                  fontFamily: 'var(--font-bangers)',
                  fontSize: '11px',
                  letterSpacing: '0.05em',
                  color: chip.color,
                  background: chip.bg,
                  border: `1px solid ${chip.border}`,
                  borderRadius: '20px',
                  padding: '1px 8px',
                }}
              >
                {chip.label}
              </span>
            ))}
          </motion.div>

        </div>
      </div>

      {/* ── Conteúdo principal ── */}
      <div className="w-full max-w-lg mx-auto px-3 py-5 flex-1 relative z-10">

        {/* ── Painel de marketing — só para visitantes não logados ── */}
        {!isLoggedIn && <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-3"
          style={{
            background: 'linear-gradient(135deg, rgba(107,72,255,0.18) 0%, rgba(232,200,74,0.08) 100%)',
            border: '1.5px solid rgba(107,72,255,0.35)',
            borderRadius: '14px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          {/* Texto + bullets */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontFamily: 'var(--font-bangers)',
              fontSize: 'clamp(18px, 5vw, 24px)',
              color: '#e8c84a',
              letterSpacing: '0.06em',
              lineHeight: 1.1,
              textShadow: '2px 2px 0 rgba(0,0,0,0.5)',
              margin: '0 0 4px',
            }}>
              CRIE SUA HISTÓRIA!
            </p>
            <p style={{
              fontFamily: 'var(--font-nunito)',
              fontSize: 'clamp(11px, 2.8vw, 13px)',
              color: 'rgba(255,255,255,0.78)',
              lineHeight: 1.45,
              margin: '0 0 6px',
            }}>
              Agora você pode criar e publicar suas próprias aventuras com personagens animados e diálogos.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['✏️ Edite', '🚀 Publique', '❤️ Curtidas'].map(item => (
                <span key={item} style={{
                  fontFamily: 'var(--font-nunito)',
                  fontSize: 'clamp(10px, 2.5vw, 12px)',
                  color: 'rgba(232,200,74,0.85)',
                }}>{item}</span>
              ))}
            </div>
          </div>
          {/* CTA */}
          <Link
            href="/login"
            style={{
              fontFamily: 'var(--font-bangers)',
              fontSize: 'clamp(13px, 3.5vw, 16px)',
              letterSpacing: '0.06em',
              color: '#1a0a2e',
              background: 'linear-gradient(135deg, #e8c84a 0%, #f5a623 100%)',
              borderRadius: '20px',
              padding: '8px 14px',
              textAlign: 'center',
              textDecoration: 'none',
              flexShrink: 0,
              boxShadow: '0 3px 12px rgba(232,200,74,0.35)',
              whiteSpace: 'nowrap',
            }}
          >
            Começar →
          </Link>
        </motion.div>}

        {/* ── Book grid — 3 colunas ── */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {books.map((book, i) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className="relative">
                <Link href={`/book/${book.id}`}>
                  <motion.div
                    variants={bookCoverVariants}
                    initial="idle"
                    whileHover="hover"
                    whileTap="tap"
                    className="relative overflow-hidden cursor-pointer"
                    style={{ borderRadius: '10px', border: '2px solid var(--comic-yellow)', boxShadow: '3px 5px 14px rgba(0,0,0,0.5)' }}
                  >
                    <div className="relative w-full" style={{ aspectRatio: '7/4' }}>
                      {book.coverImage ? (
                        <Image src={book.coverImage} alt={book.title} fill className="object-cover"
                          sizes="(max-width: 640px) 33vw, 180px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl" style={{ background: '#0f1a3d' }}>📚</div>
                      )}
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--comic-yellow)', border: '1.5px solid #1a1a2e', fontSize: '8px' }}>
                        ▶
                      </div>
                    </div>
                  </motion.div>
                </Link>
                <div className="mt-1 px-0.5">
                  <h2 className="text-white leading-tight truncate"
                    style={{ fontFamily: 'var(--font-bangers)', fontSize: 'clamp(11px, 3vw, 14px)', textShadow: '1px 1px 0 rgba(0,0,0,0.8)', letterSpacing: '0.03em' }}>
                    {book.title}
                  </h2>
                  <p style={{ fontFamily: 'var(--font-nunito)', fontSize: '10px', color: 'rgba(232,200,74,0.6)' }}>
                    {book.sceneCount} cenas
                  </p>
                </div>
                {/* Botão editar — só para usuários logados */}
                {isLoggedIn && (
                  <Link
                    href={`/editor/${book.id}`}
                    className="absolute bottom-8 right-1.5 flex items-center justify-center rounded-full z-10"
                    style={{
                      width: '24px', height: '24px',
                      background: 'rgba(10,6,18,0.85)',
                      border: '1.5px solid rgba(232,200,74,0.6)',
                      fontSize: '12px',
                    }}
                    title="Editar"
                  >
                    ✏️
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>{/* end book grid */}

        {/* Latest videos */}
        {hasVideos && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mb-4">
            <p style={{ fontFamily: 'var(--font-bangers)', fontSize: '13px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em', marginBottom: '6px' }}>
              ÚLTIMOS VÍDEOS
            </p>
            <div className="flex flex-col gap-2">
              {videos.map((video, i) =>
                video ? <YouTubeCard key={video.videoId} video={video} index={i} /> : null
              )}
            </div>
          </motion.div>
        )}

        {/* Channel links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-2 flex-wrap"
        >
          <span style={{ fontFamily: 'var(--font-nunito)', fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
            Canais:
          </span>
          {[
            { href: 'https://www.youtube.com/@inemagamer', label: '@inemagamer' },
            { href: 'https://www.youtube.com/@inematdsx', label: '@inematdsx' },
          ].map(ch => (
            <motion.a
              key={ch.href}
              href={ch.href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full"
              style={{
                background: 'rgba(255,0,0,0.12)',
                border: '1.5px solid rgba(255,60,60,0.4)',
                color: '#ff6b6b',
                fontFamily: 'var(--font-bangers)',
                fontSize: '12px',
                letterSpacing: '0.03em',
                textDecoration: 'none',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              {ch.label}
            </motion.a>
          ))}
        </motion.div>

        <p className="text-center mt-3" style={{ fontFamily: 'var(--font-nunito)', fontSize: '10px', color: 'rgba(255,255,255,0.15)' }}>
          Deslize ← → para navegar entre as cenas
        </p>

        <div className="flex justify-center mt-4 mb-2">
          <Link
            href="/sobre"
            style={{
              fontFamily: 'var(--font-bangers)',
              fontSize: '18px',
              letterSpacing: '0.06em',
              color: '#e8c84a',
              textDecoration: 'none',
              padding: '10px 28px',
              borderRadius: '28px',
              background: 'rgba(232,200,74,0.12)',
              border: '2px solid rgba(232,200,74,0.45)',
              display: 'inline-block',
            }}
          >
            Como funciona? →
          </Link>
        </div>
      </div>
    </div>
  );
}
