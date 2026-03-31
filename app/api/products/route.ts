import { NextResponse } from 'next/server'
import { createProduct, getProducts } from '@/lib/products-repo'
import { Product } from '@/lib/data'
import { isAuthorized } from '@/lib/admin-auth'
import { productSchema } from '@/lib/validators'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

function jsonNoStore(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, {
    ...init,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      Pragma: 'no-cache',
      Expires: '0',
      ...(init?.headers || {}),
    },
  })
}

export async function GET() {
  try {
    const products = await getProducts()
    return jsonNoStore(products)
  } catch (error) {
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
