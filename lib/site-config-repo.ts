import { Brand, HeroSlide } from '@/lib/data';
import {
  getDefaultSiteConfig,
  readSiteConfig,
  SiteConfig,
  writeSiteConfig,
} from '@/lib/site-config-db';
import { uploadDataUrlIfNeeded } from '@/lib/storage-upload';

function normalizeConfig(input: Partial<SiteConfig>): SiteConfig {
  const defaults = getDefaultSiteConfig();
  return {
    offersProducts: Array.isArray(input.offersProducts) ? input.offersProducts : defaults.offersProducts,
    brands:
      Array.isArray(input.brands) && input.brands.length > 0
        ? (input.brands as Brand[])
        : defaults.brands,
    heroSlides:
      Array.isArray(input.heroSlides) && input.heroSlides.length > 0
        ? (input.heroSlides as HeroSlide[])
        : defaults.heroSlides,
  };
}

export async function getSiteConfig(): Promise<SiteConfig> {
  return readSiteConfig();
}

export async function updateSiteConfig(patch: Partial<SiteConfig>): Promise<SiteConfig> {
  const current = await readSiteConfig();

  let brands = patch.brands;
  if (Array.isArray(brands)) {
    brands = await Promise.all(
      brands.map(async (brand, idx) => {
        if (!brand.logo?.startsWith('data:image/')) return brand;
        try {
          const url = await uploadDataUrlIfNeeded(brand.logo, {
            folder: 'marcas',
            productName: brand.name,
            index: idx,
          });
          return { ...brand, logo: url };
        } catch {
          return brand;
        }
      })
    );
  }

  const next = normalizeConfig({
    ...current,
    ...patch,
    ...(brands ? { brands } : {}),
  });
  await writeSiteConfig(next);
  return next;
}
