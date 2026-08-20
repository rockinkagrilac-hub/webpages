-- ============================================================================
-- Rockink IMM — migración 0001
--
-- Qué resuelve:
--   1. site_config vivía en el sistema de archivos (data/site-config.json).
--      En Vercel el disco es efímero, así que lo que se guardaba desde el panel
--      de administración se perdía en el siguiente despliegue. Pasa a Supabase.
--   2. El control de intentos de login estaba en memoria del proceso. En
--      serverless cada instancia tiene la suya, así que el límite se evadía
--      solo. Pasa a una tabla compartida.
--   3. Faltaban índices en las columnas por las que más se consulta.
--
-- Cómo aplicarla:
--   Supabase -> SQL Editor -> pegar este archivo -> Run.
--   Es idempotente: se puede ejecutar más de una vez sin romper nada.
--
-- No cambia ninguna credencial ni toca las tablas existentes de productos.
-- ============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Configuración del sitio (marcas, slides del hero, ofertas)
--
-- Una sola fila, forzada por el CHECK sobre la clave primaria: así nunca puede
-- haber dos configuraciones distintas compitiendo.
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


-- Siembra con la configuración que había en data/site-config.json.
-- Si la fila ya existe no se toca: no pisa cambios hechos desde el panel.
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
-- 2. Control de intentos de acceso
--
-- Compartido entre todas las instancias serverless, que es justamente lo que
-- el Map en memoria no podía ser.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.login_attempts (
  ip       text        primary key,
  intentos integer     not null default 0,
  reset_at timestamptz not null,
  updated_at timestamptz not null default now()
);

comment on table public.login_attempts is
  'Intentos fallidos de acceso al panel, por IP. Se limpia sola al expirar la ventana.';

create index if not exists idx_login_attempts_reset_at
  on public.login_attempts (reset_at);


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Índices sobre las tablas que ya existían
--
-- product_images.product_id es el más importante: sin él, cada consulta de
-- imágenes recorre la tabla entera.
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

-- Dos administradores no pueden compartir usuario.
create unique index if not exists idx_admin_users_username
  on public.admin_users (lower(username));


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Row Level Security
--
-- El servidor usa la service_role key, que ignora RLS, así que esto no cambia
-- el funcionamiento actual. Es una segunda barrera: si algún día se filtra la
-- clave anónima o un endpoint queda mal protegido, estas tablas siguen cerradas.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.site_config    enable row level security;
alter table public.login_attempts enable row level security;
alter table public.admin_users    enable row level security;
alter table public.products       enable row level security;
alter table public.product_images enable row level security;

-- Lectura pública del catálogo y de la configuración de portada: es lo que la
-- web muestra a cualquier visitante.
drop policy if exists lectura_publica_products on public.products;
create policy lectura_publica_products
  on public.products for select using (true);

drop policy if exists lectura_publica_product_images on public.product_images;
create policy lectura_publica_product_images
  on public.product_images for select using (true);

drop policy if exists lectura_publica_site_config on public.site_config;
create policy lectura_publica_site_config
  on public.site_config for select using (true);

-- admin_users y login_attempts no llevan ninguna política: sin política y con
-- RLS activo, nadie que no sea service_role puede leerlas ni escribirlas.
-- Las escrituras de todas las tablas quedan igual: solo service_role.
