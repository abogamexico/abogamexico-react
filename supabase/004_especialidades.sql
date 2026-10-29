-- ════════════════════════════════════════════════════════════════
--  AbogaMéxico · 004 · Varias especialidades por abogado
--  Supabase → SQL Editor → New query → pega TODO → Run.
-- ════════════════════════════════════════════════════════════════

-- 1) Nueva columna con la lista de especialidades
alter table public.abogados add column if not exists especialidades text[] not null default '{}';

-- 2) Pasar la especialidad que ya tenían a la lista
update public.abogados
   set especialidades = array[especialidad]
 where especialidad is not null and coalesce(array_length(especialidades, 1), 0) = 0;

-- 3) Al registrarse, guardar todas las especialidades que marque
create or replace function public.crear_perfil_nuevo_usuario() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  esp text[];
begin
  begin
    if m->>'tipo' = 'abogado' then
      esp := case when jsonb_typeof(m->'especialidades') = 'array'
                  then array(select jsonb_array_elements_text(m->'especialidades'))
                  when m->>'especialidad' is not null then array[m->>'especialidad']
                  else '{}' end;
      insert into public.abogados (id, email, nombre, apellido, telefono, cedula, especialidad, especialidades, estado, ciudad, bio, verificado)
      values (new.id, new.email, m->>'nombre', m->>'apellido', m->>'telefono', m->>'cedula',
              coalesce(esp[1], m->>'especialidad'), esp, m->>'estado', m->>'ciudad', m->>'bio', false)
      on conflict (id) do update set especialidades = excluded.especialidades
        where coalesce(array_length(public.abogados.especialidades, 1), 0) = 0;
    else
      insert into public.usuarios (id, email, nombre, apellido, telefono, pais, ciudad)
      values (new.id, new.email, m->>'nombre', m->>'apellido', m->>'telefono', m->>'pais', m->>'ciudad')
      on conflict (id) do nothing;
    end if;
  exception when others then
    raise warning 'crear_perfil_nuevo_usuario: %', sqlerrm;
  end;
  return new;
end $$;

-- 4) Comprobación
select nombre, email, especialidades, verificado from public.abogados;
