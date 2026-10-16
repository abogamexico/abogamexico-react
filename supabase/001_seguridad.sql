-- ════════════════════════════════════════════════════════════════
--  AbogaMéxico · 001 · Seguridad de la base de datos
--  Cómo usarlo: Supabase → SQL Editor → New query → pega TODO → Run.
--  Es seguro correrlo más de una vez.
-- ════════════════════════════════════════════════════════════════

-- 1) Columnas nuevas en consultas -----------------------------------
--    cliente_id / abogado_id: de quién es cada consulta
--    meet_link / google_event_id: para Google Meet (fase 3)
--    stripe_session_id: para confirmar el pago con Stripe (fase 2)
alter table public.consultas add column if not exists cliente_id uuid references auth.users(id) on delete set null;
alter table public.consultas add column if not exists abogado_id uuid references auth.users(id) on delete set null;
alter table public.consultas add column if not exists descripcion text;
alter table public.consultas add column if not exists meet_link text;
alter table public.consultas add column if not exists google_event_id text;
alter table public.consultas add column if not exists stripe_session_id text;
create unique index if not exists consultas_stripe_session_id_key on public.consultas (stripe_session_id);
create index if not exists consultas_cliente_id_idx on public.consultas (cliente_id);
create index if not exists consultas_abogado_id_idx on public.consultas (abogado_id);

-- 2) Activar RLS (nadie ve nada salvo lo que permitan las reglas) -----
alter table public.usuarios  enable row level security;
alter table public.abogados  enable row level security;
alter table public.casos     enable row level security;
alter table public.consultas enable row level security;

-- Borrar reglas anteriores de estas 4 tablas para empezar limpio
do $$
declare r record;
begin
  for r in select policyname, tablename from pg_policies
           where schemaname = 'public' and tablename in ('usuarios','abogados','casos','consultas')
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- 3) Reglas ------------------------------------------------------------
-- usuarios (clientes): cada quien ve y edita solo su perfil;
-- el abogado puede ver los datos básicos de sus propios clientes.
create policy "usuarios_ver_propio" on public.usuarios for select to authenticated
  using (id = auth.uid());
create policy "usuarios_abogado_ve_sus_clientes" on public.usuarios for select to authenticated
  using (exists (select 1 from public.casos c where c.cliente_id = usuarios.id and c.abogado_id = auth.uid())
      or exists (select 1 from public.consultas q where q.cliente_id = usuarios.id and q.abogado_id = auth.uid()));
create policy "usuarios_crear_propio" on public.usuarios for insert to authenticated
  with check (id = auth.uid());
create policy "usuarios_editar_propio" on public.usuarios for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- abogados: cada abogado ve y edita solo su perfil
create policy "abogados_ver_propio" on public.abogados for select to authenticated
  using (id = auth.uid());
create policy "abogados_crear_propio" on public.abogados for insert to authenticated
  with check (id = auth.uid());
create policy "abogados_editar_propio" on public.abogados for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- casos: el cliente ve los suyos; el abogado ve y actualiza los asignados
create policy "casos_cliente_ve_suyos" on public.casos for select to authenticated
  using (cliente_id = auth.uid());
create policy "casos_abogado_ve_asignados" on public.casos for select to authenticated
  using (abogado_id = auth.uid());
create policy "casos_abogado_actualiza_asignados" on public.casos for update to authenticated
  using (abogado_id = auth.uid()) with check (abogado_id = auth.uid());

-- consultas: solo lectura para el cliente y el abogado de esa consulta.
-- Crear consultas y marcarlas como pagadas lo hace SOLO el servidor
-- (webhook de Stripe con la llave service_role), nunca el navegador.
create policy "consultas_ver_propias" on public.consultas for select to authenticated
  using (cliente_id = auth.uid() or abogado_id = auth.uid());

-- 4) Un abogado no puede marcarse a sí mismo como "verificado" ---------
--    Solo tú, desde el panel de Supabase, puedes cambiar verificado.
create or replace function public.proteger_verificado() returns trigger
language plpgsql as $$
begin
  if current_user in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then
      new.verificado := false;
    else
      new.verificado := old.verificado;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists proteger_verificado on public.abogados;
create trigger proteger_verificado before insert or update on public.abogados
  for each row execute function public.proteger_verificado();

-- 5) Crear el perfil automáticamente al registrarse -------------------
--    Así el registro funciona aunque el correo aún no esté confirmado.
create or replace function public.crear_perfil_nuevo_usuario() returns trigger
language plpgsql security definer set search_path = public as $$
declare m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  begin
    if m->>'tipo' = 'abogado' then
      insert into public.abogados (id, email, nombre, apellido, telefono, cedula, especialidad, estado, ciudad, bio, verificado)
      values (new.id, new.email, m->>'nombre', m->>'apellido', m->>'telefono', m->>'cedula',
              m->>'especialidad', m->>'estado', m->>'ciudad', m->>'bio', false)
      on conflict (id) do nothing;
    else
      insert into public.usuarios (id, email, nombre, apellido, telefono, pais, ciudad)
      values (new.id, new.email, m->>'nombre', m->>'apellido', m->>'telefono', m->>'pais', m->>'ciudad')
      on conflict (id) do nothing;
    end if;
  exception when others then
    -- Nunca bloquear un registro por un problema con el perfil
    raise warning 'crear_perfil_nuevo_usuario: %', sqlerrm;
  end;
  return new;
end $$;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario after insert on auth.users
  for each row execute function public.crear_perfil_nuevo_usuario();

-- 6) Comprobación: debe mostrar rls_activo = true en las 4 tablas -----
select tablename, rowsecurity as rls_activo
from pg_tables
where schemaname = 'public' and tablename in ('usuarios','abogados','casos','consultas');
