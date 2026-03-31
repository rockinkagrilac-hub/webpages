import { z } from 'zod'

const imageUrlSchema = z.string().trim().min(1).max(2048)

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1).max(120),
  password: z.string().min(1).max(200),
})

export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(240),
  description: z.string().trim().min(1).max(5000),
  category: z.string().trim().min(1).max(240),
  brand: z.string().trim().max(240).optional().or(z.literal('')),
  images: z.array(imageUrlSchema).max(5).optional(),
  image: imageUrlSchema.optional().or(z.literal('')),
  model3dEmbedUrl: z.string().trim().max(2048).optional().or(z.literal('')),
  specifications: z.array(z.string().trim().max(500)).max(50).optional(),
  youtubeId: z.string().trim().max(120).optional(),
  inStock: z.boolean().optional(),
  stockQuantity: z.number().int().min(0).max(100000).optional(),
  inOffer: z.boolean().optional(),
})

export const productPatchSchema = productSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: 'Patch vacio',
})

export const brandSchema = z.object({
  id: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(240),
  logo: imageUrlSchema,
  url: z.string().trim().max(2048).optional(),
})

export const heroSlideSchema = z.object({
  id: z.string().trim().min(1).max(120),
  url: imageUrlSchema,
  badge: z.string().trim().min(1).max(240),
  title: z.string().trim().min(1).max(240),
  description: z.string().trim().min(1).max(2000),
})

export const siteConfigSchema = z
  .object({
    offersProducts: z.array(z.string().trim().min(1)).max(50).optional(),
    brands: z.array(brandSchema).max(50).optional(),
    heroSlides: z.array(heroSlideSchema).max(10).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, { message: 'Configuracion vacia' })
