'use client';

import { useEffect, useState, useRef, use } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

interface BookData {
  id: string;
  slug: string;
  title: string;
  synopsis: string | null;
  story_content: string | null;
  cover_asset_id: string | null;
  status: string;
  published_at: string | null;
}

interface Asset {
  id: string;
  filename: string;
  storage_path: string;
  sort_order: number;
  kind: string;
}

interface Ingest {
  id: string;
  upload_type: string;
  status: string;
  error_message: string | null;
  created_at: string;
}

async function getAuthHeaders(contentType?: string) {
  const supabase = createSupabaseBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${session?.access_token}`,
  };
  if (contentType) headers['Content-Type'] = contentType;
  return headers;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export default function BookEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: bookId } = use(params);
  const [book, setBook] = useState<BookData | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [ingests, setIngests] = useState<Ingest[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [storyContent, setStoryContent] = useState('');
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [userRole, setUserRole] = useState('creator');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadBook();
  }, [bookId]);

  async function loadBook() {
    const headers = await getAuthHeaders('application/json');
    const res = await fetch(`/api/admin/books/${bookId}`, { headers });
    if (res.ok) {
      const data = await res.json();
      setBook(data.book);
      setAssets(data.assets);
      setIngests(data.ingests);
      setStoryContent(data.book.story_content || '');
      setTitle(data.book.title);
      setSynopsis(data.book.synopsis || '');
      if (data.userRole) setUserRole(data.userRole);
    }
    setLoading(false);
  }

  async function handleUpload() {
    const files = fileInputRef.current?.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadMessage('');

    const formData = new FormData();
    for (const file of Array.from(files)) {
      formData.append('images', file);
    }

    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();

    const res = await fetch(`/api/admin/books/${bookId}/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${session?.access_token}` },
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      setUploadMessage(`${data.uploaded} imagens enviadas${data.errors?.length ? `. Erros: ${data.errors.join(', ')}` : ''}`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await loadBook();
    } else {
      setUploadMessage(data.error || 'Erro no upload');
    }
    setUploading(false);
  }

  async function handleSave() {
    setSaving(true);
    const headers = await getAuthHeaders('application/json');
    await fetch(`/api/admin/books/${bookId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ title, synopsis, story_content: storyContent }),
    });
    setSaving(false);
    await loadBook();
  }

  async function handlePublish() {
    setPublishing(true);
    const headers = await getAuthHeaders('application/json');
    const res = await fetch(`/api/admin/books/${bookId}/publish`, {
      method: 'POST',
      headers,
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || 'Erro ao publicar');
    }
    setPublishing(false);
    await loadBook();
  }

  async function handleUnpublish() {
    if (!confirm('Despublicar este livro?')) return;
    const headers = await getAuthHeaders('application/json');
    await fetch(`/api/admin/books/${bookId}/publish`, {
      method: 'DELETE',
      headers,
    });
    await loadBook();
  }

  async function handleSetCover(assetId: string) {
    const headers = await getAuthHeaders('application/json');
    await fetch(`/api/admin/books/${bookId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ cover_asset_id: assetId }),
    });
    await loadBook();
  }

  async function handleDeleteAsset(assetId: string) {
    if (!confirm('Excluir esta imagem?')) return;
    const headers = await getAuthHeaders('application/json');
    // Usar a API de patch para remover - aqui simplificamos deletando via supabase direto
    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();

    // Por ora, recarregar. Implementar delete de asset individual depois.
    await loadBook();
  }

  if (loading) {
    return <p style={{ fontFamily: 'var(--font-nunito)', color: 'rgba(255,255,255,0.5)' }}>Carregando...</p>;
  }

  if (!book) {
    return <p style={{ fontFamily: 'var(--font-nunito)', color: '#f87171' }}>Livro não encontrado.</p>;
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

  const sectionStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(232,200,74,0.12)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
  };

  const statusColors: Record<string, string> = {
    draft: '#fbbf24',
    ready: '#60a5fa',
    published: '#34d399',
    archived: '#9ca3af',
  };

  return (
    <div>
      {/* Header com status */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 style={{ fontFamily: 'var(--font-bangers)', fontSize: '28px', color: '#e8c84a', letterSpacing: '0.04em' }}>
            {book.title}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span style={{
              fontFamily: 'var(--font-nunito)', fontSize: '11px',
              color: statusColors[book.status] ?? '#9ca3af',
              background: `${statusColors[book.status] ?? '#9ca3af'}20`,
              border: `1px solid ${statusColors[book.status] ?? '#9ca3af'}40`,
              borderRadius: '10px', padding: '1px 8px',
            }}>
              {book.status}
            </span>
            <span style={{ fontFamily: 'var(--font-nunito)', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
              {book.slug}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {/* Publicar/Despublicar — só editor+ */}
          {(userRole === 'editor' || userRole === 'admin') && (
            book.status !== 'published' ? (
              <button onClick={handlePublish} disabled={publishing} style={{
                fontFamily: 'var(--font-bangers)', fontSize: '14px', color: '#1a0a2e',
                background: publishing ? 'rgba(52,211,153,0.4)' : 'linear-gradient(135deg, #34d399, #10b981)',
                borderRadius: '20px', padding: '8px 18px', border: 'none',
                cursor: publishing ? 'not-allowed' : 'pointer', letterSpacing: '0.04em',
              }}>
                {publishing ? 'Publicando...' : 'Publicar'}
              </button>
            ) : (
              <button onClick={handleUnpublish} style={{
                fontFamily: 'var(--font-bangers)', fontSize: '14px', color: '#fbbf24',
                background: 'rgba(251,191,36,0.1)', borderRadius: '20px',
                padding: '8px 18px', border: '1px solid rgba(251,191,36,0.4)',
                cursor: 'pointer', letterSpacing: '0.04em',
              }}>
                Despublicar
              </button>
            )
          )}
          {book.status === 'published' && (
            <a
              href={`/book/${book.slug}`}
              target="_blank"
              style={{
                fontFamily: 'var(--font-nunito)', fontSize: '13px', color: '#60a5fa',
                background: 'rgba(96,165,250,0.1)', borderRadius: '20px',
                padding: '8px 14px', border: '1px solid rgba(96,165,250,0.3)',
                textDecoration: 'none',
              }}
            >
              Ver no site
            </a>
          )}
        </div>
      </div>

      {/* Metadados */}
      <div style={sectionStyle}>
        <h3 style={{ fontFamily: 'var(--font-bangers)', fontSize: '16px', color: 'rgba(232,200,74,0.8)', marginBottom: '12px' }}>
          Metadados
        </h3>
        <div className="flex flex-col gap-3">
          <div>
            <label style={labelStyle}>Título</label>
            <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Sinopse</label>
            <textarea style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' as const }}
              value={synopsis} onChange={e => setSynopsis(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Upload de imagens */}
      <div style={sectionStyle}>
        <h3 style={{ fontFamily: 'var(--font-bangers)', fontSize: '16px', color: 'rgba(232,200,74,0.8)', marginBottom: '12px' }}>
          Imagens ({assets.length} cenas)
        </h3>

        <div className="flex items-center gap-3 mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            style={{ fontFamily: 'var(--font-nunito)', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}
          />
          <button
            onClick={handleUpload}
            disabled={uploading}
            style={{
              fontFamily: 'var(--font-bangers)', fontSize: '13px', color: '#1a0a2e',
              background: uploading ? 'rgba(232,200,74,0.4)' : 'linear-gradient(135deg, #e8c84a, #f5a623)',
              borderRadius: '16px', padding: '6px 14px', border: 'none',
              cursor: uploading ? 'not-allowed' : 'pointer', letterSpacing: '0.04em', whiteSpace: 'nowrap' as const,
            }}
          >
            {uploading ? 'Enviando...' : 'Upload'}
          </button>
        </div>

        {uploadMessage && (
          <p style={{ fontFamily: 'var(--font-nunito)', fontSize: '12px', color: uploadMessage.includes('Erro') ? '#f87171' : '#34d399', marginBottom: '10px' }}>
            {uploadMessage}
          </p>
        )}

        {/* Grid de assets */}
        {assets.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {assets.map(asset => (
              <div key={asset.id} className="relative group">
                <img
                  src={`${SUPABASE_URL}/storage/v1/object/public/book-assets/${asset.storage_path}`}
                  alt={asset.filename}
                  style={{
                    width: '100%',
                    aspectRatio: '7/4',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    border: asset.id === book.cover_asset_id
                      ? '2px solid #e8c84a'
                      : '1px solid rgba(255,255,255,0.1)',
                  }}
                />
                <div style={{
                  fontFamily: 'var(--font-nunito)', fontSize: '9px',
                  color: 'rgba(255,255,255,0.5)', marginTop: '2px', textAlign: 'center',
                }}>
                  {asset.filename}
                  {asset.id === book.cover_asset_id && (
                    <span style={{ color: '#e8c84a', marginLeft: '4px' }}>CAPA</span>
                  )}
                </div>
                <button
                  onClick={() => handleSetCover(asset.id)}
                  style={{
                    position: 'absolute', top: '4px', left: '4px',
                    fontFamily: 'var(--font-nunito)', fontSize: '9px',
                    color: '#e8c84a', background: 'rgba(0,0,0,0.7)',
                    borderRadius: '4px', padding: '2px 6px', border: 'none',
                    cursor: 'pointer', opacity: 0,
                    transition: 'opacity 0.2s',
                  }}
                  className="group-hover:!opacity-100"
                >
                  Capa
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor de story_content */}
      <div style={sectionStyle}>
        <h3 style={{ fontFamily: 'var(--font-bangers)', fontSize: '16px', color: 'rgba(232,200,74,0.8)', marginBottom: '12px' }}>
          Story Content
        </h3>
        <textarea
          style={{
            ...inputStyle,
            minHeight: '300px',
            fontFamily: 'monospace',
            fontSize: '13px',
            lineHeight: '1.5',
            resize: 'vertical' as const,
          }}
          value={storyContent}
          onChange={e => setStoryContent(e.target.value)}
        />
        <p style={{ fontFamily: 'var(--font-nunito)', fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '6px' }}>
          Formato: {'<!-- scene: arquivo.png -->'} para cena, {'>'} para narrador, [Personagem]: para diálogo
        </p>
      </div>

      {/* Botão salvar */}
      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          fontFamily: 'var(--font-bangers)', fontSize: '16px', color: '#1a0a2e',
          background: saving ? 'rgba(232,200,74,0.4)' : 'linear-gradient(135deg, #e8c84a, #f5a623)',
          borderRadius: '20px', padding: '10px 28px', border: 'none',
          cursor: saving ? 'not-allowed' : 'pointer', letterSpacing: '0.04em', marginBottom: '20px',
        }}
      >
        {saving ? 'Salvando...' : 'Salvar Alterações'}
      </button>

      {/* Histórico de ingests */}
      {ingests.length > 0 && (
        <div style={{ ...sectionStyle, marginTop: '8px' }}>
          <h3 style={{ fontFamily: 'var(--font-bangers)', fontSize: '14px', color: 'rgba(232,200,74,0.6)', marginBottom: '8px' }}>
            Histórico de Uploads
          </h3>
          {ingests.map(ingest => (
            <div key={ingest.id} className="flex items-center gap-3 mb-2" style={{ fontFamily: 'var(--font-nunito)', fontSize: '11px' }}>
              <span style={{ color: ingest.status === 'done' ? '#34d399' : ingest.status === 'failed' ? '#f87171' : '#fbbf24' }}>
                {ingest.status}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>{ingest.upload_type}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>
                {new Date(ingest.created_at).toLocaleString('pt-BR')}
              </span>
              {ingest.error_message && (
                <span style={{ color: '#f87171' }}>{ingest.error_message}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
