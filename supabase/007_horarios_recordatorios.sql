-- 007 · Horarios sin choques + recordatorios automáticos
-- Se puede correr más de una vez sin problema.

-- 1) Columnas para marcar los recordatorios ya enviados
alter table public.consultas add column if not exists recordatorio_24h_at timestamptz;
alter table public.consultas add column if not exists recordatorio_1h_at  timestamptz;

-- 2) Si ya hubiera dos citas pagadas del mismo abogado a la misma hora,
--    la más nueva se queda "sin abogado" para reasignarla desde /admin.
update public.consultas c
   set abogado_id = null, abogado_nombre = null, aceptada_at = null
  from (
    select id, row_number() over (partition by abogado_id, fecha, hora order by created_at, id) as n
      from public.consultas
     where pagado and abogado_id is not null
  ) d
 where c.id = d.id and d.n > 1;

-- 3) Candado: un abogado no puede tener dos citas pagadas a la misma hora
create unique index if not exists consultas_abogado_horario_unico
  on public.consultas (abogado_id, fecha, hora)
  where pagado and abogado_id is not null;

-- 4) Reloj: cada 15 minutos Supabase llama a la página para mandar recordatorios
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'abogamexico-recordatorios') then
    perform cron.unschedule('abogamexico-recordatorios');
  end if;
end $$;

select cron.schedule(
  'abogamexico-recordatorios',
  '*/15 * * * *',
  $$ select net.http_get(url := 'https://www.abogamexico.com/api/recordatorios', timeout_milliseconds := 20000) $$
);
