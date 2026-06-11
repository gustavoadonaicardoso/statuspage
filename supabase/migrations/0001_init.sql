-- =============================================================
-- Vórtice Status — Schema inicial
-- Execute este script no SQL Editor do seu projeto Supabase.
-- =============================================================

-- -------------------------------------------------------------
-- Tabelas
-- -------------------------------------------------------------

-- Status global do sistema (apenas 1 linha, id=1)
create table if not exists public.system_status (
  id int primary key default 1,
  status text not null default 'operational'
    check (status in ('operational', 'instability', 'outage', 'maintenance')),
  updated_at timestamptz default now(),
  constraint system_status_single_row check (id = 1)
);

-- Linha única inicial
insert into public.system_status (id, status)
values (1, 'operational')
on conflict (id) do nothing;

-- Feed de atualizações
create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('update', 'fix', 'instability')),
  title text not null,
  description text not null,
  created_at timestamptz default now()
);

-- Demandas enviadas por usuários
create table if not exists public.demands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  description text not null,
  file_url text not null,
  file_name text not null,
  status text not null default 'open'
    check (status in ('open', 'analyzing', 'resolved', 'wontfix')),
  created_at timestamptz default now()
);

-- -------------------------------------------------------------
-- Row Level Security
-- -------------------------------------------------------------

alter table public.system_status enable row level security;
alter table public.entries enable row level security;
alter table public.demands enable row level security;

-- system_status: leitura pública, escrita apenas autenticados
create policy "system_status_public_read"
  on public.system_status for select
  using (true);

create policy "system_status_auth_update"
  on public.system_status for update
  to authenticated
  using (true)
  with check (true);

create policy "system_status_auth_insert"
  on public.system_status for insert
  to authenticated
  with check (true);

-- entries: leitura pública, inserção/edição apenas autenticados
create policy "entries_public_read"
  on public.entries for select
  using (true);

create policy "entries_auth_insert"
  on public.entries for insert
  to authenticated
  with check (true);

create policy "entries_auth_update"
  on public.entries for update
  to authenticated
  using (true)
  with check (true);

-- demands: inserção pública, leitura e atualização apenas autenticados
create policy "demands_public_insert"
  on public.demands for insert
  with check (true);

create policy "demands_auth_read"
  on public.demands for select
  to authenticated
  using (true);

create policy "demands_auth_update"
  on public.demands for update
  to authenticated
  using (true)
  with check (true);

-- -------------------------------------------------------------
-- Storage: bucket demand-files
-- -------------------------------------------------------------

-- Bucket público de leitura, limitado a 50MB e a imagens/vídeos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'demand-files',
  'demand-files',
  true,
  52428800, -- 50MB
  array['image/*', 'video/*']
)
on conflict (id) do nothing;

-- Leitura pública dos arquivos do bucket
create policy "demand_files_public_read"
  on storage.objects for select
  using (bucket_id = 'demand-files');

-- Upload sem autenticação (necessário para o formulário público)
create policy "demand_files_public_insert"
  on storage.objects for insert
  with check (bucket_id = 'demand-files');
