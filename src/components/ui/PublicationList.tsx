import Link from 'next/link';
import { Publication } from '@/lib/types';

interface PublicationListProps {
  publications: Publication[];
  bookId: string;
}

export function PublicationList({ publications, bookId }: PublicationListProps) {
  if (publications.length === 0) return null;

  return (
    <div
      style={{
        maxWidth: '840px',
        margin: '0 auto',
        padding: '24px 16px',
        borderTop: '1px solid rgba(232,200,74,0.2)',
      }}
    >
      <h2
        style={{
          fontFamily: 'var(--font-bangers)',
          fontSize: '24px',
          letterSpacing: '0.05em',
          color: '#e8c84a',
          textShadow: '2px 2px 0 #c8a420',
          marginBottom: '16px',
        }}
      >
        Versões publicadas de {bookId}
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {publications.map(pub => (
          <Link
            key={pub.id}
            href={`/publication/${pub.id}`}
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                padding: '14px 18px',
                borderRadius: '14px',
                background: 'rgba(232,200,74,0.08)',
                border: '1.5px solid rgba(232,200,74,0.25)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                transition: 'background 0.2s',
              }}
            >
              <div>
                <span style={{ fontFamily: 'var(--font-bangers)', fontSize: '17px', letterSpacing: '0.05em', color: '#e8c84a' }}>
                  {pub.profiles?.username ?? 'Usuário'}
                </span>
                <span style={{ fontFamily: 'var(--font-nunito)', fontSize: '12px', color: 'rgba(245,240,232,0.45)', marginLeft: '10px' }}>
                  {new Date(pub.published_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-nunito)', fontSize: '13px', color: 'rgba(244,63,94,0.8)' }}>
                  ❤️ {pub.likes_count ?? 0}
                </span>
                <span style={{ fontFamily: 'var(--font-nunito)', fontSize: '13px', color: 'rgba(245,240,232,0.5)' }}>
                  💬 {pub.comments_count ?? 0}
                </span>
                <span style={{ color: 'rgba(232,200,74,0.6)', fontSize: '16px' }}>→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
