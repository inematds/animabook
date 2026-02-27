# Animabook

[![Animabook — estante de livros](doc/preview.jpg)](https://animabook.vercel.app)

**[animabook.vercel.app](https://animabook.vercel.app)**

Plataforma web mobile-first para criar e visualizar histórias em quadrinhos animadas. O autor escreve os textos (narrador + diálogos) diretamente no browser e o resultado é um livro digital animado com balões de fala posicionáveis.

## Funcionalidades

- **Reader animado** — balões de fala com spring animation, narrador com efeito typewriter, transições entre cenas
- **Editor no browser** — escreva narrações e diálogos por cena sem sair do localhost
- **Balões arrastáveis** — posicione cada balão livremente sobre a imagem; a posição é salva automaticamente
- **Mobile-first** — swipe para navegar entre cenas, layout responsivo
- **Deploy estático** — gerado como HTML estático via Next.js SSG, hospedado no Vercel

## Stack

| Tecnologia | Uso |
|---|---|
| Next.js 16 (App Router) | Framework, SSG, API routes |
| React 19 + TypeScript | UI |
| Framer Motion 12 | Animações, drag & drop |
| Tailwind CSS 4 | Estilização |
| Google Fonts | Fredoka, Bangers, Nunito |
| Canvas RAF | Background halftone animado |

## Estrutura

```
animabook/
├── books/                     # Fonte da verdade — não commitar public/books/
│   ├── livro1/
│   │   ├── Cena_01_...png
│   │   └── story.md
│   └── livro2/...
│
├── scripts/
│   └── copyBooks.mjs          # Copia books/ → public/books/ antes do build
│
└── src/
    ├── app/
    │   ├── page.tsx            # Home: estante de livros
    │   ├── book/[bookId]/      # Reader (SSG)
    │   ├── editor/[bookId]/    # Editor (dev only)
    │   └── api/story/[bookId]/ # GET + POST do story.md
    ├── components/
    │   ├── reader/             # BookReader, SceneView, SpeechBubble, NarratorBox
    │   ├── editor/             # StoryEditor, SceneEditorPanel, EditorToolbar
    │   └── ui/                 # BookShelf, ProgressDots, YouTubeCard
    ├── lib/
    │   ├── types.ts
    │   ├── parseStory.ts       # Parser do story.md
    │   ├── getBooks.ts
    │   └── animationVariants.ts
    └── hooks/
        ├── useTypewriter.ts
        ├── useSwipe.ts
        └── useSceneState.ts
```

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
- `x=0.5 y=0.3` → posição do balão (fração 0–1 do container); opcional, tem padrões

## Rodando localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:3000/editor/livro1` para escrever a história.
O reader fica em `http://localhost:3000/book/livro1`.

Salvar: **Ctrl+S** no editor ou clique no botão salvar.

## Deploy

O projeto usa SSG (`output: 'export'`). As imagens ficam em `books/` e são copiadas para `public/books/` no build.

```bash
# .gitignore já exclui public/books/ e out/
git add books/livro1/story.md
git commit -m "conteúdo livro1"
git push   # Vercel faz o build e deploy automaticamente (~90s)
```

**Importante:** nunca commitar `public/books/` (imagens grandes geradas no build).

## Fluxo de autoria

1. `npm run dev`
2. Acesse `/editor/livro1`
3. Escreva narrador e diálogos por cena
4. Arraste os balões para a posição desejada
5. Ctrl+S para salvar
6. `git commit books/livro1/story.md && git push`
7. Vercel publica em ~90s
