import { Brand, DEFAULT_BRANDS, DEFAULT_HERO_SLIDES, HeroSlide } from '@/lib/data';
import { supabase } from '@/lib/supabase';

export interface SiteConfig {
  offersProducts: string[];
  brands: Brand[];
  heroSlides: HeroSlide[];
}

/**
 * La configuración vive en Supabase, en la tabla `site_config`, en una única
 * fila (id = 1).
 *
 * Antes se guardaba en data/site-config.json con fs.writeFile. En Vercel el
 * disco es efímero y de solo lectura, así que lo que se guardaba desde el panel
 * de administración se perdía en el siguiente despliegue.
 *
 * Ver supabase/migrations/0001_site_config_y_seguridad.sql
 */
const TABLE = 'site_config';
const ROW_ID = 1;

const DEFAULT_SITE_CONFIG: SiteConfig = {
  offersProducts: [],
  brands: DEFAULT_BRANDS,
  heroSlides: DEFAULT_HERO_SLIDES,
};

type SiteConfigRow = {
  id: number;
  offers_products: unknown;
  brands: unknown;
  hero_slides: unknown;
};

/** La tabla todavía no existe (migración sin aplicar). */
function isMissingTable(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  // 42P01 = undefined_table en Postgres; PGRST205 = PostgREST no la encuentra.
  return (
    error.code === '42P01' ||
    error.code === 'PGRST205' ||
    /relation .* does not exist|could not find the table/i.test(error.message || '')
  );
}

function asArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) && value.length > 0 ? (value as T[]) : fallback;
}

function rowToConfig(row: SiteConfigRow): SiteConfig {
  return {
    // Las ofertas sí pueden estar legítimamente vacías, por eso no usan asArray.
    offersProducts: Array.isArray(row.offers_products) ? (row.offers_products as string[]) : [],
    brands: asArray<Brand>(row.brands, DEFAULT_BRANDS),
    heroSlides: asArray<HeroSlide>(row.hero_slides, DEFAULT_HERO_SLIDES),
  };
}

export function getDefaultSiteConfig(): SiteConfig {
  return DEFAULT_SITE_CONFIG;
}

export async function readSiteConfig(): Promise<SiteConfig> {
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, offers_products, brands, hero_slides')
    .eq('id', ROW_ID)
    .maybeSingle();

  // Sin la migración aplicada la portada debe seguir funcionando con los
  // valores por defecto en vez de romperse.
  if (isMissingTable(error)) return DEFAULT_SITE_CONFIG;
  if (error) throw error;
  if (!data) return DEFAULT_SITE_CONFIG;

  return rowToConfig(data as SiteConfigRow);
}

export async function writeSiteConfig(config: SiteConfig) {
  const { error } = await supabase.from(TABLE).upsert(
    {
      id: ROW_ID,
      offers_products: config.offersProducts,
      brands: config.brands,
      hero_slides: config.heroSlides,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  if (isMissingTable(error)) {
    // Aquí sí hay que fallar con un mensaje claro: guardar en silencio sin
    // persistir es exactamente el bug que esta migración viene a corregir.
    throw new Error(
      'La tabla site_config no existe. Aplica supabase/migrations/0001_site_config_y_seguridad.sql en el SQL Editor de Supabase.'
    );
  }
  if (error) throw error;
}
