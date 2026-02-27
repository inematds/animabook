# Animabook

[![Animabook — estante de livros](doc/preview.jpg)](https://animabook.vercel.app)

**[animabook.vercel.app](https://animabook.vercel.app)**

Plataforma web mobile-first para criar, publicar e interagir com histórias em quadrinhos animadas. Qualquer pessoa lê os livros; usuários logados escrevem seu próprio rascunho e publicam versões autorais que outros podem curtir e comentar.

---

## Funcionalidades

- **Reader animado** — balões de fala com spring animation, narrador com efeito typewriter, transições entre cenas, swipe para navegar
- **Editor por usuário** — cada usuário tem seu próprio rascunho por livro; salvo no Supabase com Ctrl+S
- **Balões arrastáveis** — posicione cada balão livremente sobre a imagem
- **Publicações** — botão "Publicar 🚀" cria versão pública; múltiplas publicações por livro, uma por autor
- **Likes e comentários** — interações sociais nas publicações (requer login)
- **Auth completo** — login/registro com email + senha via Supabase Auth
- **Mobile-first** — layout responsivo, swipe para navegar entre cenas

---

## Stack

| Tecnologia | Uso |
|---|---|
| Next.js 16 (App Router) | Framework, SSR, API routes, Proxy (middleware) |
| React 19 + TypeScript | UI |
| Framer Motion 12 | Animações, drag & drop |
| Tailwind CSS 4 | Estilização (sem config file) |
| Supabase | Auth, banco de dados (drafts, publications, likes, comments) |
| `@supabase/ssr` | Sessão em cookies para SSR |
| Google Fonts | Fredoka, Bangers, Nunito |

---

## Estrutura

```
animabook/
├── books/                         # Imagens PNG + story.md por livro
│   ├── livro1/
│   │   ├── Cena_01_...png
│   │   └── story.md
│   └── livro2/...
│
├── scripts/
│   └── copyBooks.mjs              # Copia books/ → public/books/ antes do build
│
└── src/
    ├── proxy.ts                   # Protege /editor/* (redireciona para /login)
    ├── app/
    │   ├── page.tsx               # Home: estante de livros
    │   ├── sobre/                 # Página "Como funciona"
    │   ├── login/                 # Login / registro
    │   ├── book/[bookId]/         # Reader + lista de publicações
    │   ├── editor/[bookId]/       # Editor (requer login)
    │   ├── publication/[id]/      # Visualiza publicação + likes + comentários
    │   └── api/story/[bookId]/
    │       ├── route.ts           # GET/POST rascunho
    │       └── publish/route.ts   # POST cria publicação
    ├── components/
    │   ├── reader/                # BookReader, SceneView, SpeechBubble, NarratorBox
    │   ├── editor/                # StoryEditor, SceneEditorPanel, EditorToolbar
    │   ├── auth/                  # AuthForm
    │   └── ui/                   # BookShelf, ProgressDots, LikeButton, CommentSection, PublicationList
    ├── lib/
    │   ├── types.ts               # Scene, StoryData, Publication, Comment, UserProfile
    │   ├── parseStory.ts
    │   ├── getBooks.ts
    │   ├── supabase-browser.ts    # Cliente browser (anon key)
    │   ├── supabase-server.ts     # Cliente server (cookies)
    │   └── supabase.ts            # Cliente admin (service role — server only)
    └── hooks/
        ├── useTypewriter.ts
        ├── useSwipe.ts
        └── useSceneState.ts
```

---

## Banco de dados (Supabase)

```sql
profiles      -- id, username
drafts        -- user_id, book_id, content   (unique user+book)
publications  -- user_id, book_id, content, published_at
likes         -- user_id, publication_id     (PK composta)
comments      -- user_id, publication_id, text, created_at
```

Todas as tabelas têm RLS habilitada. Leitura de publicações/likes/comentários é pública; escrita requer autenticação.

---

## Variáveis de ambiente

```env
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...          # chave pública (anon)
SUPABASE_SERVICE_ROLE_KEY=eyJ...              # chave secreta (server only)
```

---

## Formato do story.md

```markdown
# Título do Livro

<!-- scene: Cena_01_arquivo.png -->

> Texto do narrador aparece acima da imagem com efeito typewriter.

[Personagem@esq x=0.12 y=0.25]: Fala do personagem da esquerda.
[Personagem@dir x=0.65 y=0.40]: Fala do personagem da direita.

<!-- scene: Cena_02_arquivo.png -->

> Próxima cena...
```

**Regras:**
- `<!-- scene: arquivo.png -->` → nova cena
- `> texto` → narrador
- `[Nome@esq]` ou `[Nome@dir]` → balão esquerdo ou direito
- `x=0.5 y=0.3` → posição do balão (fração 0–1 do container); opcional

---

## Rodando localmente

```bash
npm install
npm run dev
# abre em http://localhost:3000
```

| URL | O que faz |
|---|---|
| `/` | Estante de livros |
| `/sobre` | Como funciona |
| `/login` | Login / registro |
| `/book/livro1` | Lê o livro 1 |
| `/editor/livro1` | Editor (requer login) |
| `/publication/[id]` | Visualiza publicação com likes/comentários |

---

## Fluxo de autoria

```
1. npm run dev
2. Acesse /login → crie sua conta
3. Acesse /editor/livro1
4. Escreva narrador e diálogos por cena
5. Arraste os balões para a posição desejada
6. Ctrl+S para salvar rascunho no Supabase
7. Clique em "🚀 Publicar" → redirecionado para /publication/[id]
8. Outros usuários podem curtir e comentar
```

---

## Deploy

```bash
# Apenas o story.md base fica no git (sem public/books/)
git add books/livro1/story.md
git commit -m "conteúdo livro1"
git push   # Vercel faz build + deploy automaticamente (~90s)
```

**Vercel:** configurar as três variáveis de ambiente em Settings → Environment Variables.

**Importante:** nunca commitar `public/books/` (gerado no build).
