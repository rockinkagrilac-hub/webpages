import { NextResponse } from 'next/server'
import { createProduct, getProducts } from '@/lib/products-repo'
import { Product, ProductsPageResponse } from '@/lib/data'
import { isAuthorized } from '@/lib/admin-auth'
import { productSchema } from '@/lib/validators'
import { getSiteConfig } from '@/lib/site-config-repo'
import { getProductBrand, productMatchesBrand } from '@/lib/product-brand'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

function jsonResponse(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      ...(init?.headers || {}),
    },
  })
}

function jsonNoStore(data: unknown, init?: ResponseInit) {
  return jsonResponse(data, {
    ...init,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      Pragma: 'no-cache',
      Expires: '0',
      ...(init?.headers || {}),
    },
  })
}

function jsonPublicCache(data: unknown, init?: ResponseInit) {
  return jsonResponse(data, {
    ...init,
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900',
      ...(init?.headers || {}),
    },
  })
}

function isPajillaToroProduct(product: Product) {
  const text = `${product.name} ${product.description} ${product.category}`.toLowerCase()
  return /\bpajillas?\b|\bsemen\b|\btoros?\b|\binseminaci[oó]n\b|\bia\b/.test(text)
}

function sortProducts(products: Product[], sortBy: string) {
  if (sortBy === 'name_asc') return [...products].sort((a, b) => a.name.localeCompare(b.name, 'es'))
  if (sortBy === 'name_desc') return [...products].sort((a, b) => b.name.localeCompare(a.name, 'es'))
  return products
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const wantsPagination = url.searchParams.get('paginated') === '1'
    const search = url.searchParams.get('search')?.trim().toLowerCase() || ''
    const category = url.searchParams.get('category')?.trim() || ''
    const brand = url.searchParams.get('brand')?.trim() || ''
    const sortBy = url.searchParams.get('sortBy') || 'relevance'
    const onlyOffers = url.searchParams.get('onlyOffers') === '1'
    const pajillasView = url.searchParams.get('pajillas') === '1'
    const treeFilters = url.searchParams
      .getAll('tree')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
    const page = Math.max(1, Number(url.searchParams.get('page') || '1') || 1)
    const perPage = Math.min(48, Math.max(1, Number(url.searchParams.get('perPage') || '16') || 16))

    const products = await getProducts()
    let offersProducts: string[] = []
    try {
      const siteConfig = await getSiteConfig()
      offersProducts = Array.isArray(siteConfig.offersProducts) ? siteConfig.offersProducts : []
    } catch {
      offersProducts = []
    }

    const normalizedProducts = products.map((product) => ({
      ...product,
      inOffer: offersProducts.includes(product.id),
    }))

    if (!wantsPagination) {
      return jsonPublicCache(normalizedProducts)
    }

    const categories = Array.from(
      new Set(
        normalizedProducts
          .map((product) => String(product.category || '').trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b, 'es'))

    const brands = Array.from(
      new Set(normalizedProducts.map((product) => getProductBrand(product)).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b, 'es'))

    const categoryPreviewMap = new Map<string, string>()
    for (const product of normalizedProducts) {
      if (!product.category || categoryPreviewMap.has(product.category)) continue
      if (product.image) categoryPreviewMap.set(product.category, product.image)
    }

    const filteredProducts = sortProducts(
      normalizedProducts.filter((product) => {
        const text = `${product.name} ${product.description} ${product.category}`.toLowerCase()
        if (pajillasView && !isPajillaToroProduct(product)) return false
        if (category && product.category !== category) return false
        if (brand && !productMatchesBrand(product, brand)) return false
        if (onlyOffers && !product.inOffer) return false
        if (treeFilters.length > 0 && !treeFilters.some((token) => text.includes(token))) return false
        if (!search) return true
        return text.includes(search)
      }),
      sortBy
    )

    const total = filteredProducts.length
    const totalPages = Math.max(1, Math.ceil(total / perPage))
    const safePage = Math.min(page, totalPages)
    const start = (safePage - 1) * perPage

    const payload: ProductsPageResponse = {
      items: filteredProducts.slice(start, start + perPage),
      total,
      totalPages,
      page: safePage,
      perPage,
      catalogTotal: normalizedProducts.length,
      categories,
      brands,
      categoryPreviews: categories.map((itemCategory) => ({
        category: itemCategory,
        image: categoryPreviewMap.get(itemCategory) || '/placeholder.svg',
      })),
    }

    return jsonPublicCache(payload)
  } catch {
    return jsonNoStore({ message: 'Error al leer productos' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return jsonNoStore({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as Product
    const parsed = productSchema.safeParse(body)
    if (!parsed.success) {
      return jsonNoStore({ message: 'Datos de producto invalidos' }, { status: 400 })
    }

    const created = await createProduct(parsed.data as Product)
    return jsonNoStore(created, { status: 201 })
  } catch (error) {
    return jsonNoStore({ message: 'Error al crear producto' }, { status: 500 })
  }
}
