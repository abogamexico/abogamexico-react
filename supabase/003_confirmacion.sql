-- AbogaMéxico · 003 · Marca para no mandar dos veces el correo de confirmación
alter table public.consultas add column if not exists confirmacion_enviada boolean not null default false;
select 'listo' as resultado;
