# Plano Admin de Ingestao de Livros

## Objetivo

Criar um fluxo admin no proprio aplicativo para cadastrar um novo livro, enviar imagens ou ZIP, processar o material, revisar e publicar na biblioteca sem depender de git nem de intervencao manual.

## Arquitetura

O fluxo deve separar tres responsabilidades:

- metadados do livro no banco
- arquivos do livro em storage
- publicacao e controle de fluxo via API admin

Hoje a biblioteca depende de `books/` no filesystem. Para o fluxo admin funcionar de verdade, o ideal e migrar a origem da biblioteca para banco + storage. O filesystem pode continuar existindo apenas como legado durante a transicao.

## Fase 1

Adicionar autorizacao de admin.

### Banco

- `profiles.role text not null default 'user'`
- valores permitidos: `user`, `admin`

### Backend

Criar helper server-side, por exemplo `src/lib/requireAdmin.ts`.

Esse helper deve:

- ler Bearer token ou sessao
- identificar o usuario
- consultar `profiles.role`
- retornar 401 se nao autenticado
- retornar 403 se nao for admin

### Aplicacao

- proteger todas as rotas `/api/admin/*`
- esconder UI admin para usuarios comuns

## Fase 2

Criar o modelo de dados para livros gerenciaveis.

### Tabelas

- `books`
- `book_assets`
- `book_ingests`

### Schema sugerido

#### `books`

- `id uuid primary key`
- `slug text unique not null` ex. `livro12`
- `title text not null`
- `synopsis text`
- `story_content text`
- `cover_asset_id uuid null`
- `status text not null default 'draft'`
- `created_by uuid not null`
- `published_at timestamptz null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

#### `book_assets`

- `id uuid primary key`
- `book_id uuid not null`
- `filename text not null`
- `storage_path text not null`
- `mime_type text`
- `width int null`
- `height int null`
- `sort_order int not null`
- `kind text not null default 'scene'`
- `created_at timestamptz not null default now()`

#### `book_ingests`

- `id uuid primary key`
- `book_id uuid not null`
- `upload_type text not null`
- `status text not null default 'pending'`
- `source_path text`
- `error_message text`
- `created_by uuid not null`
- `created_at timestamptz not null default now()`
- `processed_at timestamptz null`

### Status

- `books.status`: `draft`, `ready`, `published`, `archived`
- `book_ingests.status`: `pending`, `processing`, `done`, `failed`

## Fase 3

Criar storage para uploads.

### Buckets sugeridos

- `book-uploads-private`
  - ZIP original e uploads brutos
  - privado
- `book-assets-public`
  - imagens finais das cenas
  - publico

### Regras

- ZIP vai para bucket privado
- imagens processadas vao para bucket publico
- guardar sempre o caminho no banco, nunca depender de nome solto

## Fase 4

Criar as APIs admin.

### Rotas

- `POST /api/admin/books`
  - cria livro
- `GET /api/admin/books`
  - lista livros e status
- `GET /api/admin/books/:id`
  - retorna detalhes, assets e ingestoes
- `PATCH /api/admin/books/:id`
  - atualiza titulo, sinopse, texto base
- `POST /api/admin/books/:id/upload`
  - aceita `multipart/form-data`
  - `zip` ou `images[]`
- `POST /api/admin/books/:id/process`
  - processa o ultimo upload
- `POST /api/admin/books/:id/publish`
  - publica livro
- `POST /api/admin/books/:id/unpublish`
  - remove da biblioteca sem apagar dados
- `DELETE /api/admin/books/:id/assets/:assetId`
  - remove imagem especifica

### Contratos

O upload deve aceitar:

- multiplas imagens
- ou 1 ZIP

A resposta deve devolver:

- `bookId`
- `ingestId`
- `status`

## Fase 5

Implementar o processamento.

### Se o upload for imagens

- validar MIME
- ordenar por nome
- normalizar nomes
- coletar dimensoes
- criar registros em `book_assets`

### Se o upload for ZIP

- salvar ZIP
- extrair em area temporaria
- filtrar so extensoes permitidas
- ignorar lixo tipo `__MACOSX`
- ordenar e normalizar
- subir imagens finais para bucket publico
- registrar `book_assets`

### Validacoes

- extensoes permitidas: `png`, `jpg`, `jpeg`, `webp`
- tamanho maximo por arquivo
- limite total por upload
- rejeitar ZIP com arquivos perigosos ou paths relativos

### Resultado do processamento

- escolher `sort_order`
- definir capa inicial como primeiro asset
- opcionalmente gerar `story_content` inicial com cenas vazias

### Exemplo de `story_content` inicial

```md
# Titulo do Livro

<!-- scene: cena-01.png -->
> Cena 1

<!-- scene: cena-02.png -->
> Cena 2
```

## Fase 6

Criar a interface admin.

### Paginas

- `/admin`
- `/admin/books`
- `/admin/books/new`
- `/admin/books/[id]`

### Tela `/admin/books/new`

- slug
- titulo
- sinopse
- textarea do texto base
- upload de ZIP ou imagens
- botao `Criar e processar`

### Tela `/admin/books/[id]`

- status do livro
- lista de assets
- drag-and-drop para reordenar
- selecao de capa
- editor de `story_content`
- preview do livro
- botao `Publicar`

### UX importante

- barra de progresso
- mensagens de erro por arquivo
- preview imediato
- reprocessar upload
- substituir assets sem apagar o livro inteiro

## Fase 7

Fazer a biblioteca ler do banco.

Hoje a home usa `src/lib/getBooks.ts` e varre diretorios locais. Isso nao serve para livros enviados pelo app.

### Novo fluxo

- `GET books where status = 'published' order by created_at desc`
- `coverImage` vem de `book_assets` ou campo derivado
- `sceneCount` vem de contagem dos assets
- leitura do livro usa `story_content` + assets do banco/storage

### Transicao

- manter `getBooks()` antigo temporariamente
- criar `getPublishedBooksFromDb()`
- depois desligar a dependencia do filesystem

## Fase 8

Auditoria e seguranca.

Adicionar:

- `created_by` em tudo
- logs de upload/processamento/publicacao
- limitacao de tamanho de ZIP
- limitacao de quantidade de arquivos
- checagem real de MIME
- bucket privado para material bruto
- rotas admin sempre com `requireAdmin`

## Entrega recomendada

1. `role=admin` + helper de autorizacao
2. schema `books`, `book_assets`, `book_ingests`
3. APIs admin de criar livro e upload
4. processamento de imagens soltas
5. processamento de ZIP
6. UI admin
7. biblioteca lendo do banco
8. desligar fluxo antigo baseado em pasta

## Recomendacao pratica

Primeiro release:

- aceitar multiplas imagens
- deixar ZIP para a segunda etapa
- publicar livro so quando estiver `ready`
- manter preview e edicao do `story_content`

Isso reduz bastante a complexidade inicial.
