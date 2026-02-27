'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BookInfo } from '@/lib/types';
import { LatestVideo } from '@/lib/youtube';
import { bookCoverVariants } from '@/lib/animationVariants';
import { YouTubeCard } from './YouTubeCard';

interface BookShelfProps {
  books: BookInfo[];
  videos: (LatestVideo | null)[];
}

export function BookShelf({ books, videos }: BookShelfProps) {
  const hasVideos = videos.some(v => v !== null);

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center relative overflow-hidden px-3 py-5"
      style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #0f1a3d 50%, #1a0a2e 100%)' }}
    >
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #e8c84a, transparent)', transform: 'translate(30%, -30%)' }} />
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6b48ff, transparent)', transform: 'translate(-30%, 30%)' }} />

      <div className="w-full max-w-lg">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-4"
        >
          <h1
            style={{
              fontFamily: 'var(--font-bangers)',
              fontSize: 'clamp(36px, 10vw, 52px)',
              color: 'var(--comic-yellow)',
              textShadow: '3px 3px 0 var(--comic-shadow)',
              letterSpacing: '0.08em',
              lineHeight: 1,
            }}
          >
            ANIMABOOK
          </h1>
          <p style={{ fontFamily: 'var(--font-nunito)', fontSize: '12px', color: 'rgba(255,200,100,0.6)', marginTop: '4px' }}>
            Escolha um livro para começar!
          </p>
        </motion.div>

        {/* Book grid — 2 colunas sempre */}
        <div className="grid grid-cols-2 gap-3 mb-4">
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
                          sizes="(max-width: 640px) 50vw, 240px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl" style={{ background: '#0f1a3d' }}>📚</div>
                      )}
                      <div className="absolute inset-0"
                        style={{ background: 'linear-gradient(to top, rgba(26,10,46,0.88) 0%, transparent 55%)' }} />
                      <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5">
                        <h2 className="text-white leading-tight truncate"
                          style={{ fontFamily: 'var(--font-bangers)', fontSize: 'clamp(13px, 3.5vw, 17px)', textShadow: '1px 1px 0 rgba(0,0,0,0.8)', letterSpacing: '0.03em' }}>
                          {book.title}
                        </h2>
                        <p style={{ fontFamily: 'var(--font-nunito)', fontSize: '10px', color: 'rgba(232,200,74,0.7)' }}>
                          {book.sceneCount} cenas
                        </p>
                      </div>
                      <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                        style={{ background: 'var(--comic-yellow)', border: '1.5px solid #1a1a2e', fontSize: '9px' }}>
                        ▶
                      </div>
                    </div>
                  </motion.div>
                </Link>
                {/* Botão editar */}
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
              </div>
            </motion.div>
          ))}
        </div>

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
      </div>
    </div>
  );
}
