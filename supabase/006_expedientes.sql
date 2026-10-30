-- ════════════════════════════════════════════════════════════════
--  AbogaMéxico · 006 · Expedientes de consulta
--  Supabase → SQL Editor → New query → pega TODO → Run.
-- ════════════════════════════════════════════════════════════════

-- 1) Tabla de expedientes (lo que llena el abogado durante la consulta)
create table if not exists public.expedientes (
  id uuid primary key default gen_random_uuid(),
  consulta_id bigint not null unique references public.consultas(id) on delete cascade,
  abogado_id uuid references auth.users(id) on delete set null,
  cliente_id uuid,
  especialidad text,
  formulario text,
  datos jsonb not null default '{}'::jsonb,
  notas_privadas text,
  resumen_cliente text,
  estado text not null default 'borrador',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Resumen que ve el cliente
alter table public.consultas add column if not exists resumen_cliente text;
alter table public.consultas add column if not exists resumen_enviado_at timestamptz;

-- 3) Seguridad: solo el abogado asignado a la consulta ve y edita su expediente.
--    El cliente NO tiene acceso (las notas privadas quedan protegidas).
alter table public.expedientes enable row level security;
drop policy if exists "expedientes_abogado_ver" on public.expedientes;
drop policy if exists "expedientes_abogado_crear" on public.expedientes;
drop policy if exists "expedientes_abogado_editar" on public.expedientes;
create policy "expedientes_abogado_ver" on public.expedientes for select to authenticated
  using (abogado_id = auth.uid());
create policy "expedientes_abogado_crear" on public.expedientes for insert to authenticated
  with check (abogado_id = auth.uid()
    and exists (select 1 from public.consultas q where q.id = consulta_id and q.abogado_id = auth.uid()));
create policy "expedientes_abogado_editar" on public.expedientes for update to authenticated
  using (abogado_id = auth.uid())
  with check (abogado_id = auth.uid()
    and exists (select 1 from public.consultas q where q.id = consulta_id and q.abogado_id = auth.uid()));

select 'listo' as resultado;
