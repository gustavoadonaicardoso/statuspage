# Vórtice Status

Portal de status, changelog e gestão de demandas da **Vórtice Tecnologia Estratégia Comercial Ltda**.

- **Página pública (`/`)** — status global do sistema, feed de atualizações/correções/instabilidades e formulário de registro de demandas com upload de evidência (imagem ou vídeo).
- **Painel admin (`/admin`)** — alteração do status global, publicação de entradas no feed e gestão das demandas recebidas. Protegido por login (`/admin/login`).

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Supabase](https://supabase.com) — banco de dados (Postgres + RLS), autenticação e storage
- [Tailwind CSS](https://tailwindcss.com) v4
- Componentes no padrão [shadcn/ui](https://ui.shadcn.com) (Radix UI + CVA)
- `next-themes` — tema escuro por padrão, com light mode

## Setup

### 1. Criar o projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto.
2. Anote a **Project URL** e a **anon/public key** (Settings → API).

### 2. Rodar a migration SQL

No painel do Supabase, abra **SQL Editor** e execute o conteúdo de:

```
supabase/migrations/0001_init.sql
supabase/migrations/0002_entries_delete_policy.sql
```

O script cria:

- As tabelas `system_status` (linha única `id=1`), `entries` e `demands`, com `CHECK` constraints nos campos de status/tipo;
- As políticas de RLS:
  - `system_status`: leitura pública, escrita apenas autenticados;
  - `entries`: leitura pública, inserção/edição apenas autenticados;
  - `demands`: inserção pública, leitura/atualização apenas autenticados;
- O bucket de storage `demand-files` (leitura pública, upload sem autenticação, limite de 50MB, apenas `image/*` e `video/*`).

> Se preferir usar a [Supabase CLI](https://supabase.com/docs/guides/cli), rode `supabase db push` com este repositório vinculado ao projeto.

### 3. Criar o usuário admin

No painel do Supabase, vá em **Authentication → Users → Add user** e crie um usuário com e-mail e senha (marque *Auto Confirm User*). Essas credenciais serão usadas em `/admin/login`.

### 4. Configurar as variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Preencha com os valores do seu projeto:

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

### 5. Instalar dependências e rodar

```bash
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

Para gerar o build de produção:

```bash
npm run build
npm start
```

## Estrutura do projeto

```
/app
  /page.tsx                  ← página pública (feed + formulário de demanda)
  /admin
    /login/page.tsx          ← login do admin (Supabase Auth)
    /page.tsx                ← painel do admin (rota protegida)
  /api
    /demands/route.ts        ← POST público (criar demanda) / PATCH autenticado (alterar status)
    /entries/route.ts        ← GET público / POST autenticado
    /system-status/route.ts  ← GET público / PATCH autenticado
/components
  /StatusBadge.tsx           ← barra de status global (pulsa em instabilidade/indisponibilidade)
  /EntryTimeline.tsx         ← timeline do feed
  /DemandForm.tsx            ← formulário público com drag-and-drop e upload ao Storage
  /AdminDemandCard.tsx       ← card de demanda com select de status
  /Admin*.tsx                ← seções do painel admin
  /ui/                       ← componentes shadcn/ui
/lib
  /supabase
    /client.ts               ← cliente browser
    /server.ts               ← cliente server (cookies)
  /types.ts                  ← tipos e labels compartilhados
/middleware.ts               ← proteção das rotas /admin/*
/supabase/migrations         ← schema SQL + RLS + bucket
```

## Como funciona

- **Upload de evidência**: o arquivo é enviado **client-side** diretamente ao bucket `demand-files` do Supabase Storage (com a anon key), evitando o limite de tamanho de body das API Routes. Em seguida, os metadados (incluindo a URL pública do arquivo) são enviados via `POST /api/demands`, com validação server-side de todos os campos.
- **Autenticação**: o `middleware.ts` valida a sessão do Supabase em todas as rotas `/admin/*`, redirecionando para `/admin/login` quando não autenticado (e de volta para `/admin` quando já logado). Todas as mutações administrativas passam por API Routes que verificam `supabase.auth.getUser()` antes de gravar — além do RLS no banco como segunda camada.
- **Status do sistema**: valores possíveis `operational | instability | outage | maintenance`. O indicador pulsa quando há instabilidade ou indisponibilidade.
- **Demandas**: status `open | analyzing | resolved | wontfix` (Em aberto / Analisando / Resolvido / Não replicado).
