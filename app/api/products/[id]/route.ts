import { NextResponse, type NextRequest } from 'next/server'
import { getProductById, updateProduct, deleteProduct } from '@/lib/products-repo'
import { Product } from '@/lib/data'

export const runtime = 'nodejs'

function isAuthorized(request: Request) {
  const adminKey = process.env.ADMIN_ACCESS_KEY
  const headerKey = request.headers.get('x-admin')
  return Boolean(adminKey && headerKey === adminKey)
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await getProductById(id)
    if (!product) {
      return NextResponse.json({ message: 'Producto no encontrado' }, { status: 404 })
    }
    return NextResponse.json(product)
  } catch {
    return NextResponse.json({ message: 'Error al leer producto' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const patch = (await request.json()) as Partial<Product>
    const updated = await updateProduct(id, patch)
    if (!updated) {
      return NextResponse.json({ message: 'Producto no encontrado' }, { status: 404 })
    }
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ message: 'Error al actualizar producto' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const ok = await deleteProduct(id)
    if (!ok) {
      return NextResponse.json({ message: 'Producto no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ message: 'Error al eliminar producto' }, { status: 500 })
  }
}
