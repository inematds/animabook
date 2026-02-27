import { AuthForm } from '@/components/auth/AuthForm';
import { HalftoneBackground } from '@/components/reader/HalftoneBackground';
import Link from 'next/link';

interface Props {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center relative"
      style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #0f1a3d 100%)' }}
    >
      <HalftoneBackground />

      <div className="relative z-10 w-full" style={{ maxWidth: 440, padding: '0 16px' }}>
        <div className="text-center mb-8">
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h1
              style={{
                fontFamily: 'var(--font-bangers)',
                fontSize: '42px',
                letterSpacing: '0.08em',
                color: '#e8c84a',
                textShadow: '3px 3px 0 #c8a420',
                margin: 0,
              }}
            >
              Animabook
            </h1>
          </Link>
          <p style={{ fontFamily: 'var(--font-nunito)', color: 'rgba(245,240,232,0.6)', fontSize: '14px', marginTop: '4px' }}>
            Entre para criar e publicar histórias
          </p>
        </div>

        <AuthForm next={next ?? '/'} />
      </div>
    </div>
  );
}
