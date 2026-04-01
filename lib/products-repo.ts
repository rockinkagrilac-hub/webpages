import { Product } from '@/lib/data'
import { supabase } from '@/lib/supabase'

type ProductRow = {
  id: string
  id_aux: string | null
  nombre: string
  marca: string | null
  descripcion: string | null
  categoria: string | null
  stock: number | null
  youtube_url: string | null
  modelo_3d_url: string | null
  created_at: string
}

type ProductImageRow = {
  id: string
  product_id: string
  image_url: string
  sort_order: number | null
  created_at: string
}

const DEFAULT_YOUTUBE = 'dQw4w9WgXcQ'
const PLACEHOLDER_IMAGE = '/placeholder.svg'

function normalizeImages(rows: ProductImageRow[]) {
  return rows
    .slice()
    .sort((a, b) => {
      const left = a.sort_order ?? 0
      const right = b.sort_order ?? 0
      if (left !== right) return left - right
      return a.created_at.localeCompare(b.created_at)
    })
    .map((row) => row.image_url)
    .filter(Boolean)
}

function mapRowToProduct(row: ProductRow, imageRows: ProductImageRow[]): Product {
  const images = normalizeImages(imageRows)
  const stockQuantity = Math.max(0, Number(row.stock ?? 0) || 0)
  const description = row.descripcion?.trim() || row.nombre
  const youtubeId = row.youtube_url?.trim() || DEFAULT_YOUTUBE

  return {
    id: row.id,
    name: row.nombre,
    description,
    category: row.categoria?.trim() || 'Otros',
    brand: row.marca?.trim() || '',
    image: images[0] || PLACEHOLDER_IMAGE,
    images,
    model3dEmbedUrl: row.modelo_3d_url?.trim() || undefined,
    specifications: [],
    youtubeId,
    inStock: stockQuantity > 0,
    stockQuantity,
    inOffer: false,
  }
}

async function getImagesByProductIds(productIds: string[]) {
  if (productIds.length === 0) return new Map<string, ProductImageRow[]>()

  const { data, error } = await supabase
    .from('product_images')
    .select('id, product_id, image_url, sort_order, created_at')
    .in('product_id', productIds)

  if (error) throw error

  const map = new Map<string, ProductImageRow[]>()
  for (const row of (data || []) as ProductImageRow[]) {
    const current = map.get(row.product_id) || []
    current.push(row)
    map.set(row.product_id, current)
  }
  return map
}

function buildProductPayload(input: Product | Partial<Product>) {
  const name = input.name?.trim() || input.description?.trim() || ''
  const description = input.description?.trim() || input.name?.trim() || null
  const category = input.category?.trim() || null
  const brand = input.brand?.trim() || null
  const stockQuantity =
    typeof input.stockQuantity === 'number'
      ? Math.max(0, Math.floor(input.stockQuantity))
      : Number(input.stockQuantity ?? 0) > 0
      ? Math.max(0, Math.floor(Number(input.stockQuantity)))
      : 0
  const youtubeUrl = input.youtubeId?.trim() || null
  const model3dUrl = input.model3dEmbedUrl?.trim() || null

  return {
    nombre: name,
    descripcion: description,
    marca: brand,
    categoria: category,
    stock: stockQuantity,
    youtube_url: youtubeUrl,
    modelo_3d_url: model3dUrl,
  }
}

function buildProductImages(input: Product | Partial<Product>) {
  const rawImages =
    input.images && input.images.length > 0
      ? input.images
      : input.image
      ? [input.image]
      : []

  return rawImages
    .map((image) => image.trim())
    .filter(Boolean)
    .map((imageUrl, index) => ({
      image_url: imageUrl,
      sort_order: index,
    }))
}

async function replaceProductImages(productId: string, input: Product | Partial<Product>) {
  const { error: deleteError } = await supabase.from('product_images').delete().eq('product_id', productId)
  if (deleteError) throw deleteError

  const images = buildProductImages(input)
  if (images.length === 0) return

  const payload = images.map((image) => ({
    product_id: productId,
    image_url: image.image_url,
    sort_order: image.sort_order,
  }))

  const { error: insertError } = await supabase.from('product_images').insert(payload)
  if (insertError) throw insertError
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, id_aux, nombre, marca, descripcion, categoria, stock, youtube_url, modelo_3d_url, created_at')
    .order('nombre', { ascending: true })

  if (error) throw error

  const rows = (data || []) as ProductRow[]
  const imageMap = await getImagesByProductIds(rows.map((row) => row.id))
  return rows.map((row) => mapRowToProduct(row, imageMap.get(row.id) || []))
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('id, id_aux, nombre, marca, descripcion, categoria, stock, youtube_url, modelo_3d_url, created_at')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const imageMap = await getImagesByProductIds([id])
  return mapRowToProduct(data as ProductRow, imageMap.get(id) || [])
}

export async function createProduct(input: Product): Promise<Product> {
  const payload = buildProductPayload(input)
  const { data, error } = await supabase
    .from('products')
    .insert(payload)
    .select('id, id_aux, nombre, marca, descripcion, categoria, stock, youtube_url, modelo_3d_url, created_at')
    .single()

  if (error) throw error

  const row = data as ProductRow
  await replaceProductImages(row.id, input)
  const imageMap = await getImagesByProductIds([row.id])
  return mapRowToProduct(row, imageMap.get(row.id) || [])
}

export async function updateProduct(id: string, input: Partial<Product>): Promise<Product | null> {
  const current = await getProductById(id)
  if (!current) return null

  const merged: Product = {
    ...current,
    ...input,
    image:
      input.image ||
      (input.images && input.images[0]) ||
      current.image ||
      PLACEHOLDER_IMAGE,
    images:
      input.images && input.images.length > 0
        ? input.images
        : input.image
        ? [input.image]
        : current.images,
  }

  const payload = buildProductPayload(merged)
  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select('id, id_aux, nombre, marca, descripcion, categoria, stock, youtube_url, modelo_3d_url, created_at')
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  await replaceProductImages(id, merged)
  const imageMap = await getImagesByProductIds([id])
  return mapRowToProduct(data as ProductRow, imageMap.get(id) || [])
}

export async function deleteProduct(id: string): Promise<boolean> {
  const { data, error } = await supabase.from('products').delete().eq('id', id).select('id').maybeSingle()
  if (error) throw error
  return Boolean(data)
}
