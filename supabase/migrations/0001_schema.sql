-- Showroom 3D · esquema (demo local, sin RLS)
create extension if not exists "pgcrypto";

create table proyectos (
  id text primary key,
  nombre text not null,
  distrito text not null,
  descripcion text,
  entrega_estimada text,
  meta jsonb default '{}'::jsonb
);

create table tipologias (
  id text primary key,
  proyecto_id text not null references proyectos(id),
  codigo text not null,
  nombre text not null,
  dormitorios int not null,
  banos int not null,
  area_m2 numeric not null,
  precio_base numeric not null,
  asset_interior text
);

create type estado_unidad as enum ('disponible','separado','vendido','bloqueado');

create table unidades (
  id text primary key,
  proyecto_id text not null references proyectos(id),
  tipologia_id text not null references tipologias(id),
  piso int not null,
  posicion text not null,
  orientacion text not null,
  vista text not null,
  precio numeric not null,
  estado estado_unidad not null default 'disponible',
  lead_separacion_id uuid,
  updated_at timestamptz not null default now()
);
create index on unidades (proyecto_id, piso);

create table sesiones (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  device text,
  lead_id uuid
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  sesion_id uuid references sesiones(id),
  nombre text not null,
  telefono text,
  email text,
  ingreso_familiar numeric,
  ahorro numeric,
  tiene_vivienda boolean,
  num_familia int,
  distrito text,
  consentimiento boolean not null default false,
  precalificacion jsonb,
  score int not null default 0,
  score_detalle jsonb default '[]'::jsonb,
  resumen_ia text,
  siguiente_accion text,
  etapa text not null default 'nuevo',
  unidad_interes_id text references unidades(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table sesiones add constraint sesiones_lead_fk foreign key (lead_id) references leads(id);
alter table unidades add constraint unidades_lead_fk foreign key (lead_separacion_id) references leads(id);

create table eventos (
  id bigserial primary key,
  sesion_id uuid references sesiones(id),
  lead_id uuid references leads(id),
  tipo text not null,
  unidad_id text references unidades(id),
  payload jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index on eventos (sesion_id, created_at);
create index on eventos (unidad_id);

create table favoritos (
  sesion_id uuid references sesiones(id),
  unidad_id text references unidades(id),
  lead_id uuid references leads(id),
  created_at timestamptz not null default now(),
  primary key (sesion_id, unidad_id)
);

create table citas (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id),
  unidad_id text references unidades(id),
  tipo text not null default 'visita',
  fecha timestamptz not null,
  estado text not null default 'programada',
  notas text,
  created_at timestamptz not null default now()
);

create table seguimientos (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id),
  canal text not null default 'whatsapp',
  plantilla text not null,
  mensaje text not null,
  programado_para timestamptz not null,
  estado text not null default 'pendiente',
  created_at timestamptz not null default now()
);

create table incidencias (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id),
  unidad_id text references unidades(id),
  categoria text not null,
  descripcion text not null,
  estado text not null default 'abierta',
  created_at timestamptz not null default now()
);

create table consultas (
  id uuid primary key default gen_random_uuid(),
  sesion_id uuid references sesiones(id),
  pregunta text not null,
  respuesta text,
  fuente text default 'ia',
  created_at timestamptz not null default now()
);

create or replace function set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger unidades_updated before update on unidades for each row execute function set_updated_at();
create trigger leads_updated before update on leads for each row execute function set_updated_at();

create unique index seguimientos_lead_plantilla on seguimientos (lead_id, plantilla);

alter publication supabase_realtime add table leads, unidades, eventos, citas, seguimientos, incidencias, favoritos, consultas;
alter table favoritos replica identity full;
alter table consultas replica identity full;
alter table leads replica identity full;
alter table unidades replica identity full;
alter table eventos replica identity full;
alter table citas replica identity full;
alter table seguimientos replica identity full;
alter table incidencias replica identity full;

grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
