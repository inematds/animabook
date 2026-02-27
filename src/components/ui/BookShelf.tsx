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
  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center relative overflow-hidden px-4 py-8"
      style={{
        background: 'linear-gradient(135deg, #1a0a2e 0%, #0f1a3d 50%, #1a0a2e 100%)',
      }}
    >
      {/* Decorative circles */}
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #e8c84a, transparent)', transform: 'translate(30%, -30%)' }}
      />
      <div
        className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6b48ff, transparent)', transform: 'translate(-30%, 30%)' }}
      />

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center mb-8"
      >
        <h1
          className="text-5xl sm:text-6xl md:text-7xl"
          style={{
            fontFamily: 'var(--font-bangers)',
            color: 'var(--comic-yellow)',
            textShadow: '4px 4px 0 var(--comic-shadow), 6px 6px 0 rgba(0,0,0,0.3)',
            letterSpacing: '0.08em',
          }}
        >
          ANIMABOOK
        </h1>
        <p
          className="text-amber-300/70 mt-2"
          style={{
            fontFamily: 'var(--font-nunito)',
            fontSize: 'clamp(14px, 3vw, 18px)',
          }}
        >
          Escolha um livro para começar a história!
        </p>
      </motion.div>

      {/* Book grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
        {books.map((book, i) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.15, ease: 'easeOut' }}
          >
            <Link href={`/book/${book.id}`}>
              <motion.div
                variants={bookCoverVariants}
                initial="idle"
                whileHover="hover"
                whileTap="tap"
                className="relative overflow-hidden cursor-pointer"
                style={{
                  borderRadius: '12px',
                  border: '3px solid var(--comic-yellow)',
                  boxShadow: '4px 8px 20px rgba(0,0,0,0.5)',
                }}
              >
                {/* Cover image */}
                <div className="relative w-full" style={{ aspectRatio: '7/4' }}>
                  {book.coverImage ? (
                    <Image
                      src={book.coverImage}
                      alt={book.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-4xl"
                      style={{ background: '#0f1a3d' }}
                    >
                      📚
                    </div>
                  )}

                  {/* Overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(to top, rgba(26,10,46,0.9) 0%, rgba(26,10,46,0.2) 50%, transparent 100%)',
                    }}
                  />

                  {/* Book info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h2
                      className="text-white leading-tight"
                      style={{
                        fontFamily: 'var(--font-bangers)',
                        fontSize: 'clamp(16px, 4vw, 22px)',
                        textShadow: '2px 2px 0 rgba(0,0,0,0.8)',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {book.title}
                    </h2>
                    <p
                      className="text-amber-300/80 mt-0.5"
                      style={{
                        fontFamily: 'var(--font-nunito)',
                        fontSize: '12px',
                      }}
                    >
                      {book.sceneCount} cenas
                    </p>
                  </div>

                  {/* Play badge */}
                  <div
                    className="absolute top-2 right-2 w-9 h-9 rounded-full flex items-center justify-center text-sm"
                    style={{
                      background: 'var(--comic-yellow)',
                      border: '2px solid var(--comic-border)',
                      boxShadow: '2px 2px 0 rgba(0,0,0,0.4)',
                    }}
                  >
                    ▶
                  </div>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>

      {books.length === 0 && (
        <div className="text-center text-white/50 mt-8">
          <p className="text-4xl mb-3">📚</p>
          <p style={{ fontFamily: 'var(--font-nunito)' }}>
            Nenhum livro encontrado ainda.
          </p>
        </div>
      )}

      {/* Latest videos */}
      {videos.some(v => v !== null) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 w-full max-w-4xl"
        >
          <p
            className="text-center mb-4"
            style={{
              fontFamily: 'var(--font-bangers)',
              fontSize: '18px',
              color: 'rgba(255,255,255,0.5)',
              letterSpacing: '0.06em',
            }}
          >
            Últimos vídeos
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {videos.map((video, i) =>
              video ? <YouTubeCard key={video.videoId} video={video} index={i} /> : null
            )}
          </div>
        </motion.div>
      )}

      {/* YouTube links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="mt-10 flex flex-col sm:flex-row items-center gap-3"
      >
        <p
          className="text-white/40 text-xs mb-1 sm:mb-0 sm:mr-2"
          style={{ fontFamily: 'var(--font-nunito)' }}
        >
          Nossos canais:
        </p>
        {[
          { href: 'https://www.youtube.com/@inemagamer', label: '@inemagamer' },
          { href: 'https://www.youtube.com/@inematdsx', label: '@inematdsx' },
        ].map((channel, i) => (
          <motion.a
            key={channel.href}
            href={channel.href}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + i * 0.1 }}
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: 'rgba(255,0,0,0.15)',
              border: '2px solid rgba(255,60,60,0.5)',
              color: '#ff6b6b',
              fontFamily: 'var(--font-bangers)',
              fontSize: '15px',
              letterSpacing: '0.04em',
              textDecoration: 'none',
              boxShadow: '0 2px 12px rgba(255,0,0,0.15)',
            }}
          >
            {/* YouTube icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            {channel.label}
          </motion.a>
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-4 text-xs text-white/20"
        style={{ fontFamily: 'var(--font-nunito)' }}
      >
        Deslize ← → para navegar entre as cenas
      </motion.p>
    </div>
  );
}
