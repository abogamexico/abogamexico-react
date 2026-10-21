-- ════════════════════════════════════════════════════════════════
--  AbogaMéxico · 002 · Relaciones entre tablas
--  Para que el panel del abogado muestre el nombre de cada cliente
--  en sus casos. Correr DESPUÉS de 001_seguridad.sql.
--  Supabase → SQL Editor → New query → pega TODO → Run.
-- ════════════════════════════════════════════════════════════════

do $$
begin
  -- casos.cliente_id → usuarios.id
  if not exists (select 1 from pg_constraint where conname = 'casos_cliente_id_usuarios_fkey') then
    update public.casos c set cliente_id = null
      where cliente_id is not null and not exists (select 1 from public.usuarios u where u.id = c.cliente_id);
    alter table public.casos add constraint casos_cliente_id_usuarios_fkey
      foreign key (cliente_id) references public.usuarios(id) on delete set null;
  end if;
  -- casos.abogado_id → abogados.id
  if not exists (select 1 from pg_constraint where conname = 'casos_abogado_id_abogados_fkey') then
    update public.casos c set abogado_id = null
      where abogado_id is not null and not exists (select 1 from public.abogados a where a.id = c.abogado_id);
    alter table public.casos add constraint casos_abogado_id_abogados_fkey
      foreign key (abogado_id) references public.abogados(id) on delete set null;
  end if;
end $$;

-- Comprobación: deben salir las 2 relaciones
select conname as relacion from pg_constraint
where conname in ('casos_cliente_id_usuarios_fkey', 'casos_abogado_id_abogados_fkey');
