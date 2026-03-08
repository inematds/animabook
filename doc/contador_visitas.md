# Contador de Visitas — Como Foi Implementado

## O que aparece na tela

Na home (BookShelf), logo abaixo do título ANIMABOOK, há três chips:

```
👁 1.234   🔑 89   👤 345
```

| Chip | Significado |
|------|-------------|
| 👁 | Total de acessos (pageviews) |
| 🔑 | Usuários únicos **logados** |
| 👤 | Visitantes únicos **anônimos** |

---

## Arquitetura

```
Browser (BookShelf.tsx)
  └─ useEffect → POST /api/visit { session_id, Authorization? }
                          │
                    src/app/api/visit/route.ts
                          │
                    Supabase: INSERT INTO visits
                          │
src/app/page.tsx (SSR)
  └─ admin.from('visits').select('user_id, session_id')
  └─ calcula total / uniqueLogged / uniqueAnon
  └─ passa visitStats → <BookShelf />
```

---

## Banco de dados (Supabase)

Tabela criada manualmente no SQL Editor do Supabase:

```sql
create table visits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,  -- null se anônimo
  session_id text not null,             -- UUID gerado no browser
  created_at timestamptz default now()
);

alter table visits enable row level security;

-- Qualquer um pode inserir (anon key)
create policy "visits insert public" on visits for insert with check (true);
-- Leitura só via service role (a contagem é feita server-side)
```

---

## Arquivos modificados/criados

### `src/app/api/visit/route.ts` (novo)

Recebe `POST { session_id }`. Extrai `user_id` do Bearer token JWT se presente (usuário logado), caso contrário `user_id = null`. Insere na tabela `visits` usando o admin client (service role key).

### `src/app/page.tsx`

Adicionado ao `Promise.all`:
```typescript
admin.from('visits').select('user_id, session_id')
```

Calcula as contagens:
```typescript
const total = visits.length;
const uniqueLogged = new Set(visits.filter(v => v.user_id).map(v => v.user_id)).size;
const uniqueAnon   = new Set(visits.filter(v => !v.user_id).map(v => v.session_id)).size;
const visitStats = { total, uniqueLogged, uniqueAnon };
```

Passa para `<BookShelf visitStats={visitStats} />`.

### `src/components/ui/BookShelf.tsx`

**Props adicionadas:**
```typescript
interface VisitStats {
  total: number;
  uniqueLogged: number;
  uniqueAnon: number;
}
```

**useEffect no mount** — registra a visita:
```typescript
useEffect(() => {
  async function trackVisit() {
    let sid = localStorage.getItem('animabook_sid');
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem('animabook_sid', sid);
    }
    const headers = { 'Content-Type': 'application/json' };
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;
    await fetch('/api/visit', { method: 'POST', headers, body: JSON.stringify({ session_id: sid }) });
  }
  trackVisit();
}, []);
```

**Display dos chips:**
```typescript
{ label: `👁 ${visitStats.total}`,       title: 'acessos'  },
{ label: `🔑 ${visitStats.uniqueLogged}`, title: 'logados'  },
{ label: `👤 ${visitStats.uniqueAnon}`,   title: 'anônimos' },
```

---

## Comportamento

- **Mesmo usuário, vários reloads** → `total` sobe, `uniqueAnon` não (mesmo `session_id` no localStorage)
- **Usuário faz login** → próxima visita aparece em `uniqueLogged`
- **Aba anônima / novo dispositivo** → novo `session_id` → `uniqueAnon` sobe
- **Contagem SSR** → os chips já chegam com valores do servidor; a visita atual é registrada no cliente após o mount

---

## Segurança

- Leitura da tabela `visits` só via **service role** (server-side, nunca exposta ao browser)
- RLS bloqueia SELECT para anon key — ninguém pode consultar quem visitou
- INSERT é público por design (queremos registrar visitantes sem autenticação)
- Não há proteção contra múltiplos inserts por reload (é intencional: `total` = pageviews)
