'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

async function getAuthHeaders() {
  const supabase = createSupabaseBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Authorization': `Bearer ${session?.access_token}`,
    'Content-Type': 'application/json',
  };
}

export default function NewBookPage() {
  const router = useRouter();
  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const headers = await getAuthHeaders();
    const res = await fetch('/api/admin/books', {
      method: 'POST',
      headers,
      body: JSON.stringify({ slug, title, synopsis }),
    });

    if (res.ok) {
      const book = await res.json();
      router.push(`/admin/books/${book.id}`);
    } else {
      const data = await res.json();
      setError(data.error || 'Erro ao criar livro');
      setSaving(false);
    }
  }

  const inputStyle = {
    fontFamily: 'var(--font-nunito)',
    fontSize: '14px',
    color: '#fff',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(232,200,74,0.25)',
    borderRadius: '8px',
    padding: '10px 12px',
    width: '100%',
    outline: 'none',
  };

  const labelStyle = {
    fontFamily: 'var(--font-nunito)',
    fontSize: '12px',
    color: 'rgba(232,200,74,0.7)',
    marginBottom: '4px',
    display: 'block' as const,
  };

  return (
    <div style={{ maxWidth: '500px' }}>
      <h2 style={{ fontFamily: 'var(--font-bangers)', fontSize: '28px', color: '#e8c84a', letterSpacing: '0.04em', marginBottom: '20px' }}>
        Novo Livro
      </h2>

      <form onSubmit={handleCreate} className="flex flex-col gap-4">
        <div>
          <label style={labelStyle}>Slug (identificador único, ex: livro12)</label>
          <input
            style={inputStyle}
            value={slug}
            onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            placeholder="meu-livro"
            required
          />
        </div>

        <div>
          <label style={labelStyle}>Título</label>
          <input
            style={inputStyle}
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="A Grande Aventura"
            required
          />
        </div>

        <div>
          <label style={labelStyle}>Sinopse (opcional)</label>
          <textarea
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' as const }}
            value={synopsis}
            onChange={e => setSynopsis(e.target.value)}
            placeholder="Uma breve descrição do livro..."
          />
        </div>

        {error && (
          <p style={{ fontFamily: 'var(--font-nunito)', fontSize: '13px', color: '#f87171' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          style={{
            fontFamily: 'var(--font-bangers)',
            fontSize: '16px',
            color: '#1a0a2e',
            background: saving ? 'rgba(232,200,74,0.4)' : 'linear-gradient(135deg, #e8c84a, #f5a623)',
            borderRadius: '20px',
            padding: '10px 24px',
            border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer',
            letterSpacing: '0.04em',
          }}
        >
          {saving ? 'Criando...' : 'Criar Livro'}
        </button>
      </form>
    </div>
  );
}
