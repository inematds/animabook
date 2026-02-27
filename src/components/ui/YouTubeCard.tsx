'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { LatestVideo } from '@/lib/youtube';

interface YouTubeCardProps {
  video: LatestVideo;
  index: number;
}

export function YouTubeCard({ video, index }: YouTubeCardProps) {
  return (
    <motion.a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 + index * 0.15, duration: 0.4 }}
      whileHover={{ scale: 1.03, y: -3 }}
      whileTap={{ scale: 0.97 }}
      className="block rounded-xl overflow-hidden cursor-pointer"
      style={{
        border: '2px solid rgba(255,60,60,0.45)',
        background: 'rgba(20,8,40,0.85)',
        boxShadow: '0 4px 20px rgba(255,0,0,0.12)',
        textDecoration: 'none',
      }}
    >
      {/* Thumbnail */}
      <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 320px"
          unoptimized
        />
        {/* Play overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.25)' }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(255,0,0,0.9)',
              boxShadow: '0 2px 12px rgba(255,0,0,0.5)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="px-3 py-2.5">
        {/* Channel badge */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#ff4444">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          <span
            style={{
              fontFamily: 'var(--font-bangers)',
              fontSize: '12px',
              color: '#ff6b6b',
              letterSpacing: '0.04em',
            }}
          >
            {video.channelName}
          </span>
          {video.published && (
            <span
              className="ml-auto"
              style={{ fontFamily: 'var(--font-nunito)', fontSize: '10px', color: 'rgba(255,255,255,0.35)' }}
            >
              {video.published}
            </span>
          )}
        </div>

        {/* Title */}
        <p
          className="leading-snug line-clamp-2"
          style={{
            fontFamily: 'var(--font-nunito)',
            fontSize: 'clamp(11px, 2.8vw, 13px)',
            color: 'rgba(255,255,255,0.88)',
          }}
        >
          {video.title}
        </p>
      </div>
    </motion.a>
  );
}

export function YouTubeCardSkeleton() {
  return (
    <div
      className="rounded-xl overflow-hidden animate-pulse"
      style={{ border: '2px solid rgba(255,60,60,0.2)', background: 'rgba(20,8,40,0.6)' }}
    >
      <div className="w-full bg-white/5" style={{ aspectRatio: '16/9' }} />
      <div className="px-3 py-2.5 space-y-2">
        <div className="h-3 bg-white/5 rounded w-1/3" />
        <div className="h-3 bg-white/5 rounded w-full" />
        <div className="h-3 bg-white/5 rounded w-3/4" />
      </div>
    </div>
  );
}
