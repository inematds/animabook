import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?next=/admin');

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = profile?.role as string;

  // Precisa ser pelo menos creator para acessar /admin
  if (!role || !['creator', 'editor', 'admin'].includes(role)) {
    redirect('/');
  }

  return (
    <div
      className="min-h-dvh"
      style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #0f1a3d 50%, #1a0a2e 100%)' }}
    >
      <header
        style={{
          background: 'rgba(10,6,18,0.88)',
          borderBottom: '1.5px solid rgba(232,200,74,0.2)',
          backdropFilter: 'blur(12px)',
          padding: '10px 16px',
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1
              style={{
                fontFamily: 'var(--font-bangers)',
                fontSize: '24px',
                color: 'var(--comic-yellow)',
                textShadow: '2px 2px 0 var(--comic-shadow)',
                letterSpacing: '0.06em',
              }}
            >
              ADMIN
            </h1>
            <span style={{
              fontFamily: 'var(--font-nunito)',
              fontSize: '10px',
              color: role === 'admin' ? '#34d399' : role === 'editor' ? '#60a5fa' : '#fbbf24',
              background: role === 'admin' ? 'rgba(52,211,153,0.15)' : role === 'editor' ? 'rgba(96,165,250,0.15)' : 'rgba(251,191,36,0.15)',
              border: `1px solid ${role === 'admin' ? 'rgba(52,211,153,0.4)' : role === 'editor' ? 'rgba(96,165,250,0.4)' : 'rgba(251,191,36,0.4)'}`,
              borderRadius: '10px',
              padding: '1px 8px',
            }}>
              {role}
            </span>
          </div>
          <nav className="flex gap-3">
            <a href="/admin" style={{ fontFamily: 'var(--font-nunito)', fontSize: '13px', color: 'rgba(232,200,74,0.7)', textDecoration: 'none' }}>
              Livros
            </a>
            <a href="/admin/books/new" style={{ fontFamily: 'var(--font-nunito)', fontSize: '13px', color: 'rgba(232,200,74,0.7)', textDecoration: 'none' }}>
              + Novo
            </a>
            {role === 'admin' && (
              <a href="/admin/users" style={{ fontFamily: 'var(--font-nunito)', fontSize: '13px', color: 'rgba(52,211,153,0.7)', textDecoration: 'none' }}>
                Usuários
              </a>
            )}
            <a href="/" style={{ fontFamily: 'var(--font-nunito)', fontSize: '13px', color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
              Voltar
            </a>
          </nav>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
