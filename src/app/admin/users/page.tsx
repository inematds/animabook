'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

interface User {
  id: string;
  username: string;
  role: string;
  created_at: string;
}

async function getAuthHeaders() {
  const supabase = createSupabaseBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Authorization': `Bearer ${session?.access_token}`,
    'Content-Type': 'application/json',
  };
}

const ROLES = ['user', 'creator', 'editor', 'admin'] as const;

const roleColors: Record<string, string> = {
  user: '#9ca3af',
  creator: '#fbbf24',
  editor: '#60a5fa',
  admin: '#34d399',
};

const roleLabels: Record<string, string> = {
  user: 'Usuário',
  creator: 'Criador',
  editor: 'Editor',
  admin: 'Admin',
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/admin/users', { headers });
    if (res.ok) {
      setUsers(await res.json());
    }
    setLoading(false);
  }

  async function handleRoleChange(userId: string, newRole: string) {
    setUpdating(userId);
    const headers = await getAuthHeaders();
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ userId, role: newRole }),
    });

    if (res.ok) {
      const updated = await res.json();
      setUsers(prev => prev.map(u => u.id === updated.id ? { ...u, role: updated.role } : u));
    } else {
      const data = await res.json();
      alert(data.error || 'Erro ao atualizar');
    }
    setUpdating(null);
  }

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-bangers)', fontSize: '28px', color: '#e8c84a', letterSpacing: '0.04em', marginBottom: '8px' }}>
        Gerenciar Usuários
      </h2>
      <p style={{ fontFamily: 'var(--font-nunito)', fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '20px' }}>
        Defina quem pode criar livros (Criador), editar e publicar (Editor) ou gerenciar tudo (Admin).
      </p>

      {/* Legenda */}
      <div className="flex gap-3 mb-4 flex-wrap">
        {ROLES.map(role => (
          <span key={role} style={{
            fontFamily: 'var(--font-nunito)', fontSize: '11px',
            color: roleColors[role],
            background: `${roleColors[role]}15`,
            border: `1px solid ${roleColors[role]}40`,
            borderRadius: '10px', padding: '2px 10px',
          }}>
            {roleLabels[role]}
            {role === 'creator' && ' — cria livros, upload'}
            {role === 'editor' && ' — edita qualquer livro, publica'}
            {role === 'admin' && ' — tudo + gerencia usuários'}
          </span>
        ))}
      </div>

      {loading ? (
        <p style={{ fontFamily: 'var(--font-nunito)', color: 'rgba(255,255,255,0.5)' }}>Carregando...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {users.map(user => (
            <div
              key={user.id}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(232,200,74,0.12)',
                borderRadius: '10px',
                padding: '10px 14px',
              }}
              className="flex items-center justify-between"
            >
              <div>
                <span style={{ fontFamily: 'var(--font-bangers)', fontSize: '15px', color: '#fff', letterSpacing: '0.03em' }}>
                  {user.username}
                </span>
                <span style={{
                  fontFamily: 'var(--font-nunito)', fontSize: '10px',
                  color: 'rgba(255,255,255,0.3)', marginLeft: '8px',
                }}>
                  {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>

              <div className="flex gap-1">
                {ROLES.map(role => (
                  <button
                    key={role}
                    onClick={() => handleRoleChange(user.id, role)}
                    disabled={updating === user.id || user.role === role}
                    style={{
                      fontFamily: 'var(--font-nunito)',
                      fontSize: '11px',
                      color: user.role === role ? '#1a0a2e' : roleColors[role],
                      background: user.role === role ? roleColors[role] : `${roleColors[role]}15`,
                      border: `1px solid ${roleColors[role]}${user.role === role ? '' : '40'}`,
                      borderRadius: '8px',
                      padding: '3px 10px',
                      cursor: updating === user.id || user.role === role ? 'default' : 'pointer',
                      opacity: updating === user.id ? 0.5 : 1,
                    }}
                  >
                    {roleLabels[role]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
