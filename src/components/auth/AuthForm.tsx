'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { motion } from 'framer-motion';

interface AuthFormProps {
  next?: string;
}

export function AuthForm({ next = '/' }: AuthFormProps) {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const supabase = createSupabaseBrowserClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push(next);
      router.refresh();
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: data.user.id, username });

      if (profileError) {
        setLoading(false);
        setError(profileError.message);
        return;
      }
    }

    setLoading(false);
    setMessage('Conta criada! Verifique seu email para confirmar.');
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1.5px solid rgba(232,200,74,0.3)',
    background: 'rgba(255,255,255,0.05)',
    color: '#f5f0e8',
    fontFamily: 'var(--font-nunito)',
    fontSize: '15px',
    outline: 'none',
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '10px',
    fontFamily: 'var(--font-bangers)',
    fontSize: '18px',
    letterSpacing: '0.05em',
    cursor: 'pointer',
    background: active ? 'var(--comic-yellow)' : 'transparent',
    color: active ? '#1a1a2e' : 'rgba(232,200,74,0.6)',
    border: 'none',
    borderBottom: active ? 'none' : '2px solid rgba(232,200,74,0.2)',
    transition: 'all 0.2s',
  });

  return (
    <div
      style={{
        maxWidth: 400,
        margin: '0 auto',
        padding: '0 16px',
      }}
    >
      <div style={{ display: 'flex', borderRadius: '12px 12px 0 0', overflow: 'hidden', border: '1.5px solid rgba(232,200,74,0.3)', borderBottom: 'none' }}>
        <button style={tabStyle(tab === 'login')} onClick={() => { setTab('login'); setError(''); setMessage(''); }}>
          Entrar
        </button>
        <button style={tabStyle(tab === 'register')} onClick={() => { setTab('register'); setError(''); setMessage(''); }}>
          Criar Conta
        </button>
      </div>

      <div
        style={{
          background: 'rgba(10,6,18,0.95)',
          border: '1.5px solid rgba(232,200,74,0.3)',
          borderTop: 'none',
          borderRadius: '0 0 16px 16px',
          padding: '28px 24px',
        }}
      >
        {tab === 'login' ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
            {error && (
              <p style={{ color: '#f87171', fontFamily: 'var(--font-nunito)', fontSize: '13px', margin: 0 }}>
                {error}
              </p>
            )}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: 'var(--comic-yellow)',
                color: '#1a1a2e',
                border: '2px solid var(--comic-shadow)',
                borderRadius: '10px',
                padding: '12px',
                fontFamily: 'var(--font-bangers)',
                fontSize: '18px',
                letterSpacing: '0.05em',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </motion.button>
          </form>
        ) : (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="text"
              placeholder="Nome de usuário"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              minLength={3}
              style={inputStyle}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Senha (mín. 6 caracteres)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              style={inputStyle}
            />
            {error && (
              <p style={{ color: '#f87171', fontFamily: 'var(--font-nunito)', fontSize: '13px', margin: 0 }}>
                {error}
              </p>
            )}
            {message && (
              <p style={{ color: '#4ade80', fontFamily: 'var(--font-nunito)', fontSize: '13px', margin: 0 }}>
                {message}
              </p>
            )}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: 'var(--comic-yellow)',
                color: '#1a1a2e',
                border: '2px solid var(--comic-shadow)',
                borderRadius: '10px',
                padding: '12px',
                fontFamily: 'var(--font-bangers)',
                fontSize: '18px',
                letterSpacing: '0.05em',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Criando...' : 'Criar Conta'}
            </motion.button>
          </form>
        )}
      </div>
    </div>
  );
}
