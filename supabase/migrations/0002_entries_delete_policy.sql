-- =============================================================
-- Vórtice Status — Política de exclusão de entradas do feed
-- Execute este script no SQL Editor do seu projeto Supabase.
-- =============================================================

-- Permite que usuários autenticados (admin) excluam entradas do feed
create policy "entries_auth_delete"
  on public.entries for delete
  to authenticated
  using (true);
