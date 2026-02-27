'use client';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

interface Result {
  session: string;
  token: string;
  apiDebug: unknown;
  saveDraft: unknown;
  publish: unknown;
}

export default function DebugPage() {
  const [result, setResult] = useState<Partial<Result>>({});
  const [loading, setLoading] = useState(false);

  async function runTests() {
    setLoading(true);
    const out: Partial<Result> = {};

    try {
      // 1. Sessão
      const sb = createSupabaseBrowserClient();
      const { data: { session } } = await sb.auth.getSession();
      out.session = session ? `✅ ${session.user.email}` : '❌ Sem sessão';
      out.token = session?.access_token ? `✅ ${session.access_token.slice(0, 30)}...` : '❌ Sem token';

      // 2. Debug API
      const token = session?.access_token;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const debugRes = await fetch('/api/debug', { headers });
      out.apiDebug = await debugRes.json();

      // 3. Salvar rascunho
      const saveRes = await fetch('/api/story/livro1', {
        method: 'POST',
        headers,
        body: JSON.stringify({ content: '# Teste\n\n<!-- scene: teste.png -->\n' }),
      });
      out.saveDraft = { status: saveRes.status, body: await saveRes.json() };

      // 4. Publicar
      const pubRes = await fetch('/api/story/livro1/publish', {
        method: 'POST',
        headers,
        body: JSON.stringify({ content: '# Teste\n\n<!-- scene: teste.png -->\n' }),
      });
      out.publish = { status: pubRes.status, body: await pubRes.json() };

    } catch (e) {
      out.publish = { error: String(e) };
    }

    setResult(out);
    setLoading(false);
  }

  return (
    <div style={{ background: '#0a0612', minHeight: '100dvh', padding: '32px 16px', color: '#f5f0e8', fontFamily: 'monospace' }}>
      <h1 style={{ color: '#e8c84a', marginBottom: '16px' }}>Debug de Autenticação</h1>
      <button
        onClick={runTests}
        disabled={loading}
        style={{ background: '#e8c84a', color: '#1a1a2e', padding: '10px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '24px' }}
      >
        {loading ? 'Testando...' : 'Rodar testes'}
      </button>

      <pre style={{ background: '#1a0a2e', padding: '20px', borderRadius: '12px', overflowX: 'auto', fontSize: '13px', lineHeight: 1.6 }}>
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}
