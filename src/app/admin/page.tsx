'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

interface Book {
  id: string;
  slug: string;
  title: string;
  status: string;
  published_at: string | null;
  created_at: string;
  created_by: string;
  assets_count: number;
}

async function getAuthHeaders() {
  const supabase = createSupabaseBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Authorization': `Bearer ${session?.access_token}`,
    'Content-Type': 'application/json',
  };
}

async function getUserRole(): Promise<string> {
  const supabase = createSupabaseBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 'user';
  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  return data?.role ?? 'user';
}

export default function AdminDashboard() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('user');

  useEffect(() => {
    Promise.all([loadBooks(), getUserRole().then(setRole)]);
  }, []);

  async function loadBooks() {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/admin/books', { headers });
    if (res.ok) {
      setBooks(await res.json());
    }
    setLoading(false);
  }

  async function handleDelete(bookId: string, title: string) {
    if (!confirm(`Excluir "${title}"? Esta ação não pode ser desfeita.`)) return;
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/admin/books/${bookId}`, { method: 'DELETE', headers });
    if (res.ok) {
      setBooks(prev => prev.filter(b => b.id !== bookId));
    } else {
      const data = await res.json();
      alert(data.error || 'Erro ao excluir');
    }
  }

  const canDelete = role === 'admin';

  const statusColors: Record<string, string> = {
    draft: '#fbbf24',
    ready: '#60a5fa',
    published: '#34d399',
    archived: '#9ca3af',
  };

  const statusLabels: Record<string, string> = {
    draft: 'Rascunho',
    ready: 'Pronto',
    published: 'Publicado',
    archived: 'Arquivado',
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 style={{ fontFamily: 'var(--font-bangers)', fontSize: '28px', color: '#e8c84a', letterSpacing: '0.04em' }}>
          Livros
        </h2>
        <Link
          href="/admin/books/new"
          style={{
            fontFamily: 'var(--font-bangers)',
            fontSize: '14px',
            color: '#1a0a2e',
            background: 'linear-gradient(135deg, #e8c84a, #f5a623)',
            borderRadius: '20px',
            padding: '8px 18px',
            textDecoration: 'none',
            letterSpacing: '0.04em',
          }}
        >
          + Novo Livro
        </Link>
      </div>

      {loading ? (
        <p style={{ fontFamily: 'var(--font-nunito)', color: 'rgba(255,255,255,0.5)' }}>Carregando...</p>
      ) : books.length === 0 ? (
        <p style={{ fontFamily: 'var(--font-nunito)', color: 'rgba(255,255,255,0.5)' }}>
          Nenhum livro ainda. Crie o primeiro!
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {books.map(book => (
            <div
              key={book.id}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(232,200,74,0.15)',
                borderRadius: '12px',
                padding: '14px 16px',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <Link
                    href={`/admin/books/${book.id}`}
                    style={{
                      fontFamily: 'var(--font-bangers)',
                      fontSize: '18px',
                      color: '#fff',
                      textDecoration: 'none',
                      letterSpacing: '0.03em',
                    }}
                  >
                    {book.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <span style={{
                      fontFamily: 'var(--font-nunito)',
                      fontSize: '11px',
                      color: statusColors[book.status] ?? '#9ca3af',
                      background: `${statusColors[book.status] ?? '#9ca3af'}20`,
                      border: `1px solid ${statusColors[book.status] ?? '#9ca3af'}40`,
                      borderRadius: '10px',
                      padding: '1px 8px',
                    }}>
                      {statusLabels[book.status] ?? book.status}
                    </span>
                    <span style={{ fontFamily: 'var(--font-nunito)', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                      {book.slug}
                    </span>
                    <span style={{ fontFamily: 'var(--font-nunito)', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                      {book.assets_count} imagens
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/books/${book.id}`}
                    style={{
                      fontFamily: 'var(--font-nunito)',
                      fontSize: '12px',
                      color: '#e8c84a',
                      background: 'rgba(232,200,74,0.1)',
                      border: '1px solid rgba(232,200,74,0.3)',
                      borderRadius: '8px',
                      padding: '4px 12px',
                      textDecoration: 'none',
                    }}
                  >
                    Editar
                  </Link>
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(book.id, book.title)}
                      style={{
                        fontFamily: 'var(--font-nunito)',
                        fontSize: '12px',
                        color: 'rgba(248,113,113,0.8)',
                        background: 'rgba(248,113,113,0.1)',
                        border: '1px solid rgba(248,113,113,0.3)',
                        borderRadius: '8px',
                        padding: '4px 12px',
                        cursor: 'pointer',
                      }}
                    >
                      Excluir
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
