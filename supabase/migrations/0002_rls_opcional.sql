-- ============================================================================
-- Rockink IMM — migración 0002: Row Level Security  (OPCIONAL)
--
-- ESTA MIGRACIÓN TAMPOCO BORRA DATOS. Pero, a diferencia de la 0001, sí CAMBIA
-- QUIÉN PUEDE LEER LAS TABLAS. Léelo antes de ejecutarla.
--
-- ── Qué hace ────────────────────────────────────────────────────────────────
-- Activa RLS (Row Level Security) en las cinco tablas. Con RLS activo, Postgres
-- deja de responder a quien no tenga una política que se lo permita.
--
-- Tu web NO se ve afectada: el servidor se conecta con la service_role key, que
-- ignora RLS por diseño. Tampoco afecta al editor de tablas del panel de
-- Supabase, que usa una conexión privilegiada.
--
-- ── El único riesgo real ────────────────────────────────────────────────────
-- Si tienes CUALQUIER OTRA COSA conectada a esta base con la clave anónima
-- (NEXT_PUBLIC_SUPABASE_ANON_KEY) —otra web, una app móvil, un flujo de n8n o
-- Zapier, un script— dejaría de leer las tablas sin política.
--
-- En el código de esta web comprobé que la clave anónima NO se usa en ningún
-- sitio. Pero no puedo saber qué tienes conectado fuera de este repositorio.
--
--   → Si no tienes nada más conectado: ejecútala, gana seguridad.
--   → Si no estás seguro: NO la ejecutes todavía. La 0001 sola ya resuelve
--     los problemas de funcionamiento. Esto es solo una barrera extra.
--
-- Al final del archivo está el bloque para deshacerla.
-- ============================================================================

begin;


-- Con RLS activo y sin política, una tabla queda cerrada salvo para
-- service_role. Ese es justo el comportamiento que se quiere para las tablas
-- sensibles (admin_users, login_attempts).
alter table public.site_config    enable row level security;
alter table public.login_attempts enable row level security;
alter table public.admin_users    enable row level security;
alter table public.products       enable row level security;
alter table public.product_images enable row level security;


-- Lectura pública del catálogo y de la configuración de portada: es lo que la
-- web enseña a cualquier visitante, así que no hay nada que ocultar ahí.
--
-- El "drop policy if exists" de cada bloque solo retira una política con ese
-- nombre exacto, que hoy no existe. Está para que la migración se pueda
-- reejecutar sin error. No toca datos.

drop policy if exists lectura_publica_products on public.products;
create policy lectura_publica_products
  on public.products for select using (true);

drop policy if exists lectura_publica_product_images on public.product_images;
create policy lectura_publica_product_images
  on public.product_images for select using (true);

drop policy if exists lectura_publica_site_config on public.site_config;
create policy lectura_publica_site_config
  on public.site_config for select using (true);

-- admin_users y login_attempts se quedan SIN política a propósito: así solo
-- service_role las alcanza.
--
-- La ESCRITURA de las cinco tablas también queda solo en service_role, que es
-- como funciona hoy: todo pasa por las rutas API del servidor.


commit;


-- ============================================================================
-- PARA DESHACER (si algo que tenías conectado deja de leer):
--
--   begin;
--   alter table public.site_config    disable row level security;
--   alter table public.login_attempts disable row level security;
--   alter table public.admin_users    disable row level security;
--   alter table public.products       disable row level security;
--   alter table public.product_images disable row level security;
--   commit;
--
-- Desactivar RLS devuelve las tablas a como están hoy. Tampoco borra datos.
-- ============================================================================
