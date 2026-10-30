-- ════════════════════════════════════════════════════════════════
--  AbogaMéxico · 005 · El abogado acepta la cita
--  Supabase → SQL Editor → New query → pega TODO → Run.
-- ════════════════════════════════════════════════════════════════
alter table public.consultas add column if not exists aceptada_at timestamptz;
alter table public.consultas add column if not exists abogado_nombre text;

-- Llenar el nombre del abogado en las consultas que ya tienen abogado
update public.consultas q
   set abogado_nombre = trim(coalesce(a.nombre, '') || ' ' || coalesce(a.apellido, ''))
  from public.abogados a
 where a.id = q.abogado_id and q.abogado_nombre is null;

select 'listo' as resultado;
