-- ============================================================================
-- Rockink IMM — migración 0001: tablas nuevas e índices
--
-- ESTA MIGRACIÓN NO BORRA NADA.
--
-- Solo AÑADE:
--   · 2 tablas nuevas (site_config, login_attempts) que hoy no existen
--   · 1 fila en site_config, con la configuración que ya tenías
--   · 6 índices sobre tablas existentes
--
-- No hay ningún DROP TABLE, DELETE, TRUNCATE ni ALTER COLUMN.
-- Tus 35 productos, 96 imágenes y 1 usuario administrador quedan intactos:
-- un índice es una estructura de búsqueda aparte, no modifica las filas.
--
-- Todo va dentro de una transacción: si algo falla, no se aplica nada.
-- Es idempotente: se puede ejecutar varias veces sin efecto adicional.
--
-- Cómo aplicarla: Supabase -> SQL Editor -> pegar todo -> Run.
-- ============================================================================

begin;


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Configuración de la portada (marcas, slides del hero, ofertas)
--
-- Antes vivía en data/site-config.json. En Vercel el disco es efímero, así que
-- lo que guardabas desde el panel se perdía en el siguiente despliegue.
--
-- Una sola fila, garantizada por el CHECK sobre la clave primaria.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.site_config (
  id              smallint    primary key default 1,
  offers_products jsonb       not null default '[]'::jsonb,
  brands          jsonb       not null default '[]'::jsonb,
  hero_slides     jsonb       not null default '[]'::jsonb,
  updated_at      timestamptz not null default now(),
  constraint site_config_fila_unica check (id = 1)
);

comment on table public.site_config is
  'Configuración editable de la portada. Siempre una única fila (id = 1).';


-- Siembra con la configuración que ya tenías.
-- ON CONFLICT DO NOTHING: si la fila existe, NO la pisa. Volver a ejecutar
-- esta migración nunca sobrescribe lo que hayas guardado desde el panel.
insert into public.site_config (id, offers_products, brands, hero_slides)
values (
  1,
  '["d08deec5-0969-4fe1-bfb6-8b68da3fdd11","3f10887b-1b11-4e3c-81cd-5c9077bf7167"]'::jsonb,
  '[
    {"id":"1","name":"Lister","logo":"https://static1.squarespace.com/static/5e8c3085abdf3f0f0c45b6dc/t/639093e981ece801a7d9c4c6/1775725499595/"},
    {"id":"2","name":"CRV","logo":"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJeb9hGt6c4-BhPAl6p34PivNItvfAQ2NP4g&s"},
    {"id":"3","name":"Melasty","logo":"https://pbs.twimg.com/profile_images/1354803880580706310/k9_Ijr_K_400x400.jpg"}
  ]'::jsonb,
  '[
    {"id":"hero-1","url":"/1.png","badge":"Rockink IMM","title":"Innovación que impulsa tu ganadería","description":"Tecnología inteligente para el campo moderno."},
    {"id":"hero-2","url":"/2.png","badge":"Ganadería de precisión","title":"Resultados reales","description":"Transformamos datos en productividad ganadera."},
    {"id":"hero-3","url":"/3.png","badge":"Del campo a la nube","title":"Control total desde cualquier lugar","description":"Datos, control y productividad en una sola plataforma."}
  ]'::jsonb
)
on conflict (id) do nothing;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Control de intentos de acceso al panel
--
-- Antes vivía en un Map en memoria; en serverless cada instancia tenía el suyo,
-- así que el límite de 5 intentos se evadía cayendo en otra instancia.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.login_attempts (
  ip         text        primary key,
  intentos   integer     not null default 0,
  reset_at   timestamptz not null,
  updated_at timestamptz not null default now()
);

comment on table public.login_attempts is
  'Intentos fallidos de acceso al panel, por IP. Caduca sola al expirar la ventana.';

create index if not exists idx_login_attempts_reset_at
  on public.login_attempts (reset_at);


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Índices sobre las tablas que ya existen
--
-- Un índice NO cambia ni una sola fila: es una estructura auxiliar que hace
-- rápidas las búsquedas. El más importante es el de product_images.product_id:
-- sin él, cada consulta de imágenes recorre las 96 filas enteras.
-- ─────────────────────────────────────────────────────────────────────────────

create index if not exists idx_product_images_product_id
  on public.product_images (product_id);

create index if not exists idx_product_images_orden
  on public.product_images (product_id, sort_order);

create index if not exists idx_products_categoria
  on public.products (categoria);

create index if not exists idx_products_marca
  on public.products (marca);

create index if not exists idx_products_nombre
  on public.products (nombre);

-- Impide que en el futuro se creen dos administradores con el mismo usuario
-- escrito distinto ("Admin" y "admin"). Comprobado: hoy solo existe "juadmin",
-- así que este índice se crea sin conflicto.
create unique index if not exists idx_admin_users_username
  on public.admin_users (lower(username));


commit;


-- ============================================================================
-- Comprobación posterior (opcional). Debe devolver los mismos números de antes:
--
--   select
--     (select count(*) from public.products)       as productos,       -- 35
--     (select count(*) from public.product_images) as imagenes,        -- 96
--     (select count(*) from public.admin_users)    as administradores, --  1
--     (select count(*) from public.site_config)    as configuracion;   --  1 (nueva)
-- ============================================================================
