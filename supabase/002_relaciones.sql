-- ════════════════════════════════════════════════════════════════
--  AbogaMéxico · 002 · Relaciones entre tablas
--  Para que el panel del abogado muestre el nombre de cada cliente
--  en sus casos. Correr DESPUÉS de 001_seguridad.sql.
--  Supabase → SQL Editor → New query → pega TODO → Run.
-- ════════════════════════════════════════════════════════════════

-- 0) Asegurar que usuarios.id y abogados.id sean únicos (llave primaria).
--    Sin esto no se pueden crear relaciones ni guardar perfiles al registrarse.
do $$
declare t text;
begin
  foreach t in array array['usuarios','abogados'] loop
    -- quitar filas sin id o repetidas (las tablas deberían estar vacías)
    execute format('delete from public.%I where id is null', t);
    execute format('delete from public.%I a using public.%I b where a.ctid < b.ctid and a.id = b.id', t, t);
    execute format('alter table public.%I alter column id set not null', t);
    if not exists (
      select 1 from pg_index i
      join pg_attribute att on att.attrelid = i.indrelid and att.attnum = any(i.indkey)
      where i.indrelid = ('public.' || t)::regclass and (i.indisprimary or i.indisunique)
        and i.indnatts = 1 and att.attname = 'id'
    ) then
      if exists (select 1 from pg_index where indrelid = ('public.' || t)::regclass and indisprimary) then
        execute format('alter table public.%I add constraint %I unique (id)', t, t || '_id_key');
      else
        execute format('alter table public.%I add primary key (id)', t);
      end if;
    end if;
  end loop;
end $$;

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
