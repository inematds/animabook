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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + index * 0.1, duration: 0.35 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className="flex items-center gap-2.5 rounded-lg overflow-hidden cursor-pointer"
      style={{
        border: '1.5px solid rgba(255,60,60,0.35)',
        background: 'rgba(20,8,40,0.8)',
        textDecoration: 'none',
        padding: '6px',
      }}
    >
      {/* Thumbnail compacta */}
      <div
        className="relative flex-shrink-0 rounded overflow-hidden"
        style={{ width: '90px', aspectRatio: '16/9' }}
      >
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          className="object-cover"
          sizes="90px"
          unoptimized
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,0,0,0.9)' }}
          >
            <svg width="7" height="7" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 mb-0.5">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="#ff4444">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          <span style={{ fontFamily: 'var(--font-bangers)', fontSize: '11px', color: '#ff6b6b', letterSpacing: '0.03em' }}>
            {video.channelName}
          </span>
          {video.published && (
            <span className="ml-auto flex-shrink-0" style={{ fontFamily: 'var(--font-nunito)', fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>
              {video.published}
            </span>
          )}
        </div>
        <p
          className="leading-tight line-clamp-2"
          style={{ fontFamily: 'var(--font-nunito)', fontSize: '11px', color: 'rgba(255,255,255,0.82)' }}
        >
          {video.title}
        </p>
      </div>
    </motion.a>
  );
}
