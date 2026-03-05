import { Product } from '@/lib/data'

const CATEGORY_TO_BRAND: Record<string, string> = {
  ordeño: 'Melasty',
  ordeno: 'Melasty',
  reproducción: 'CRV',
  criogenia: 'CRV',
  'identificacion animal': 'Lister',
  identificacion: 'Lister',
  instrumental: 'Sunway',
  repuestos: 'Melasty',
  equipos: 'Sunway',
  insumos: 'Lister',
}

export function normalizeBrandName(input: string) {
  const value = input.trim().toLowerCase()
  if (!value) return ''
  if (value === 'crv') return 'CRV'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function getProductBrand(product: Product) {
  const fromProduct = normalizeBrandName((product as Product & { brand?: string }).brand || '')
  if (fromProduct) return fromProduct

  const categoryKey = (product.category || '').trim().toLowerCase()
  return CATEGORY_TO_BRAND[categoryKey] || 'Lister'
}

export function productMatchesBrand(product: Product, brand: string) {
  return getProductBrand(product).toLowerCase() === normalizeBrandName(brand).toLowerCase()
}
