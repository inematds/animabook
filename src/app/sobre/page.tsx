import Link from 'next/link';
import { HalftoneBackground } from '@/components/reader/HalftoneBackground';

export const metadata = {
  title: 'Como funciona | Animabook',
  description: 'Entenda como ler, criar e publicar histórias animadas no Animabook',
};

const steps = [
  {
    icon: '📖',
    title: 'Leia',
    color: '#e8c84a',
    shadow: '#c8a420',
    border: 'rgba(232,200,74,0.35)',
    bg: 'rgba(232,200,74,0.07)',
    items: [
      'Acesse qualquer livro sem precisar de conta',
      'Navegue pelas cenas deslizando ← → ou usando as setas',
      'Cada cena tem imagens, narrador e balões de diálogo animados',
      'Os textos aparecem com efeito typewriter (letra por letra)',
    ],
  },
  {
    icon: '✏️',
    title: 'Escreva',
    color: '#a78bfa',
    shadow: '#7c3aed',
    border: 'rgba(167,139,250,0.35)',
    bg: 'rgba(167,139,250,0.07)',
    items: [
      'Crie uma conta gratuita com email e senha',
      'Cada usuário tem seu próprio rascunho por livro',
      'Use o editor visual para adicionar narrador e balões de fala',
      'Posicione os balões arrastando diretamente na imagem',
      'Salve com Ctrl+S a qualquer momento',
    ],
  },
  {
    icon: '🚀',
    title: 'Publique',
    color: '#4ade80',
    shadow: '#16a34a',
    border: 'rgba(74,222,128,0.35)',
    bg: 'rgba(74,222,128,0.07)',
    items: [
      'Clique em "Publicar" para criar uma versão pública do seu rascunho',
      'Sua publicação aparece na página do livro para todos verem',
      'Você pode ter múltiplas publicações do mesmo livro',
      'Cada publicação é independente — edite o rascunho sem afetar versões anteriores',
    ],
  },
  {
    icon: '❤️',
    title: 'Interaja',
    color: '#f43f5e',
    shadow: '#be123c',
    border: 'rgba(244,63,94,0.35)',
    bg: 'rgba(244,63,94,0.07)',
    items: [
      'Curta publicações de outros usuários com o botão ❤️',
      'Deixe comentários nas histórias que você gostou',
      'Exclua seus próprios comentários a qualquer hora',
      'Visualize quantos likes e comentários cada publicação tem',
    ],
  },
];

const formats = [
  {
    label: 'Título',
    example: '# Meu Livro',
    desc: 'Primeira linha do story.md',
    color: '#e8c84a',
  },
  {
    label: 'Nova cena',
    example: '<!-- scene: Imagem.png -->',
    desc: 'Troca a imagem de fundo',
    color: '#a78bfa',
  },
  {
    label: 'Narrador',
    example: '> Era uma noite escura...',
    desc: 'Blockquote vira caixa de narrador',
    color: '#60a5fa',
  },
  {
    label: 'Diálogo',
    example: '[Herói@esq]: Vamos lá!',
    desc: 'Balão de fala com personagem e posição',
    color: '#4ade80',
  },
];

export default function SobrePage() {
  return (
    <div
      className="min-h-dvh relative"
      style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #0f1a3d 100%)' }}
    >
      <HalftoneBackground />

      <div className="relative z-10" style={{ maxWidth: '720px', margin: '0 auto', padding: '0 16px 60px' }}>

        {/* Nav */}
        <div className="flex items-center justify-between py-4">
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-bangers)',
              fontSize: '13px',
              letterSpacing: '0.05em',
              color: '#e8c84a',
              textDecoration: 'none',
              padding: '5px 14px',
              borderRadius: '20px',
              background: 'rgba(232,200,74,0.12)',
              border: '1.5px solid rgba(232,200,74,0.4)',
            }}
          >
            ← Livros
          </Link>
          <Link
            href="/login"
            style={{
              fontFamily: 'var(--font-bangers)',
              fontSize: '13px',
              letterSpacing: '0.05em',
              color: '#f5f0e8',
              textDecoration: 'none',
              padding: '5px 14px',
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.08)',
              border: '1.5px solid rgba(255,255,255,0.15)',
            }}
          >
            Entrar
          </Link>
        </div>

        {/* Hero */}
        <div className="text-center" style={{ padding: '32px 0 40px' }}>
          <div style={{ fontSize: '52px', lineHeight: 1, marginBottom: '12px' }}>📚</div>
          <h1
            style={{
              fontFamily: 'var(--font-bangers)',
              fontSize: 'clamp(34px, 9vw, 52px)',
              letterSpacing: '0.06em',
              color: '#e8c84a',
              textShadow: '3px 3px 0 #c8a420',
              margin: '0 0 10px',
            }}
          >
            Como funciona o Animabook
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-nunito)',
              fontSize: '16px',
              color: 'rgba(245,240,232,0.65)',
              maxWidth: '480px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Uma plataforma de quadrinhos animados onde qualquer pessoa pode ler, escrever e publicar histórias em cima das imagens dos livros.
          </p>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '48px' }}>
          {steps.map((step, i) => (
            <div
              key={step.title}
              style={{
                borderRadius: '16px',
                border: `1.5px solid ${step.border}`,
                background: step.bg,
                padding: '22px 24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: `rgba(${hexToRgb(step.color)},0.15)`,
                    border: `2px solid ${step.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    flexShrink: 0,
                  }}
                >
                  {step.icon}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-bangers)',
                      fontSize: '11px',
                      letterSpacing: '0.1em',
                      color: step.color,
                      background: `rgba(${hexToRgb(step.color)},0.15)`,
                      padding: '2px 8px',
                      borderRadius: '20px',
                      border: `1px solid ${step.border}`,
                    }}
                  >
                    PASSO {i + 1}
                  </span>
                  <h2
                    style={{
                      fontFamily: 'var(--font-bangers)',
                      fontSize: '24px',
                      letterSpacing: '0.05em',
                      color: step.color,
                      textShadow: `1px 1px 0 ${step.shadow}`,
                      margin: 0,
                    }}
                  >
                    {step.title}
                  </h2>
                </div>
              </div>

              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {step.items.map((item) => (
                  <li
                    key={item}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      fontFamily: 'var(--font-nunito)',
                      fontSize: '14px',
                      color: 'rgba(245,240,232,0.8)',
                      lineHeight: 1.5,
                    }}
                  >
                    <span style={{ color: step.color, fontSize: '16px', flexShrink: 0, marginTop: '1px' }}>▸</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Formato story.md */}
        <div style={{ marginBottom: '48px' }}>
          <h2
            style={{
              fontFamily: 'var(--font-bangers)',
              fontSize: '28px',
              letterSpacing: '0.05em',
              color: '#e8c84a',
              textShadow: '2px 2px 0 #c8a420',
              marginBottom: '6px',
            }}
          >
            Formato das histórias
          </h2>
          <p style={{ fontFamily: 'var(--font-nunito)', fontSize: '13px', color: 'rgba(245,240,232,0.5)', marginBottom: '20px' }}>
            As histórias são escritas em Markdown com sintaxe especial. O editor visual gera esse formato automaticamente.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {formats.map(f => (
              <div
                key={f.label}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '90px 1fr',
                  gap: '14px',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-bangers)',
                    fontSize: '12px',
                    letterSpacing: '0.06em',
                    color: f.color,
                    opacity: 0.9,
                  }}
                >
                  {f.label.toUpperCase()}
                </span>
                <div>
                  <code
                    style={{
                      display: 'block',
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      color: f.color,
                      background: 'rgba(0,0,0,0.3)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      marginBottom: '4px',
                      border: `1px solid rgba(${hexToRgb(f.color)},0.2)`,
                    }}
                  >
                    {f.example}
                  </code>
                  <span style={{ fontFamily: 'var(--font-nunito)', fontSize: '12px', color: 'rgba(245,240,232,0.45)' }}>
                    {f.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Exemplo completo */}
          <div
            style={{
              borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(0,0,0,0.35)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '8px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.07)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f87171' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fbbf24' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#4ade80' }} />
              <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginLeft: '6px' }}>
                story.md
              </span>
            </div>
            <pre
              style={{
                margin: 0,
                padding: '18px 20px',
                fontFamily: 'monospace',
                fontSize: '13px',
                lineHeight: 1.7,
                color: '#f5f0e8',
                overflowX: 'auto',
              }}
            >
              <span style={{ color: '#e8c84a' }}>{'# Minha História'}</span>
              {'\n\n'}
              <span style={{ color: '#6b7280' }}>{'<!-- scene: cena01.png -->'}</span>
              {'\n\n'}
              <span style={{ color: '#60a5fa' }}>{'> Era uma vez, numa floresta encantada...'}</span>
              {'\n\n'}
              <span style={{ color: '#4ade80' }}>{'[Elfo@esq]: Quem és tu, estranho?'}</span>
              {'\n'}
              <span style={{ color: '#4ade80' }}>{'[Herói@dir]: Sou apenas um viajante.'}</span>
              {'\n\n'}
              <span style={{ color: '#6b7280' }}>{'<!-- scene: cena02.png -->'}</span>
              {'\n\n'}
              <span style={{ color: '#60a5fa' }}>{'> O herói avançou com cuidado.'}</span>
            </pre>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginBottom: '48px' }}>
          <h2
            style={{
              fontFamily: 'var(--font-bangers)',
              fontSize: '28px',
              letterSpacing: '0.05em',
              color: '#e8c84a',
              textShadow: '2px 2px 0 #c8a420',
              marginBottom: '16px',
            }}
          >
            Perguntas frequentes
          </h2>

          {[
            {
              q: 'Preciso de conta para ler?',
              a: 'Não. Todos os livros e publicações são públicos e podem ser lidos sem login.',
            },
            {
              q: 'Posso editar a história principal do livro?',
              a: 'Não diretamente. Cada usuário edita seu próprio rascunho privado. Ao publicar, você cria uma versão pública autoral — o livro original não é alterado.',
            },
            {
              q: 'As imagens são minhas?',
              a: 'As imagens dos livros pertencem ao Animabook. Você contribui com os textos, narração e diálogos.',
            },
            {
              q: 'Posso apagar uma publicação?',
              a: 'Ainda não há essa funcionalidade na interface, mas está planejada.',
            },
            {
              q: 'O editor funciona no celular?',
              a: 'Funciona, mas a experiência é melhor em telas maiores. O leitor foi otimizado para mobile.',
            },
          ].map(({ q, a }) => (
            <div
              key={q}
              style={{
                padding: '16px 20px',
                borderRadius: '12px',
                border: '1px solid rgba(232,200,74,0.15)',
                background: 'rgba(232,200,74,0.04)',
                marginBottom: '10px',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-bangers)',
                  fontSize: '16px',
                  letterSpacing: '0.03em',
                  color: '#e8c84a',
                  margin: '0 0 6px',
                }}
              >
                {q}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-nunito)',
                  fontSize: '14px',
                  color: 'rgba(245,240,232,0.7)',
                  margin: 0,
                  lineHeight: 1.55,
                }}
              >
                {a}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          style={{
            textAlign: 'center',
            padding: '36px 24px',
            borderRadius: '20px',
            border: '2px solid rgba(232,200,74,0.35)',
            background: 'rgba(232,200,74,0.06)',
          }}
        >
          <div style={{ fontSize: '36px', marginBottom: '10px' }}>🚀</div>
          <h2
            style={{
              fontFamily: 'var(--font-bangers)',
              fontSize: '28px',
              letterSpacing: '0.06em',
              color: '#e8c84a',
              textShadow: '2px 2px 0 #c8a420',
              margin: '0 0 8px',
            }}
          >
            Pronto para começar?
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-nunito)',
              fontSize: '14px',
              color: 'rgba(245,240,232,0.6)',
              margin: '0 0 24px',
            }}
          >
            Crie sua conta e escreva sua versão da história.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/"
              style={{
                fontFamily: 'var(--font-bangers)',
                fontSize: '17px',
                letterSpacing: '0.05em',
                color: '#1a1a2e',
                textDecoration: 'none',
                padding: '12px 28px',
                borderRadius: '12px',
                background: 'var(--comic-yellow)',
                border: '2px solid var(--comic-shadow)',
                boxShadow: '3px 3px 0 #c8a420',
              }}
            >
              Ver livros
            </Link>
            <Link
              href="/login"
              style={{
                fontFamily: 'var(--font-bangers)',
                fontSize: '17px',
                letterSpacing: '0.05em',
                color: '#e8c84a',
                textDecoration: 'none',
                padding: '12px 28px',
                borderRadius: '12px',
                background: 'transparent',
                border: '2px solid rgba(232,200,74,0.5)',
              }}
            >
              Criar conta
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

// helper — converte #rrggbb → "r,g,b" para uso em rgba()
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
