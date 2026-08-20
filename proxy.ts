import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isAuthorized } from '@/lib/admin-auth'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAdminPage = pathname.startsWith('/admin')
  const isAdminLoginPage = pathname === '/admin/login'
  const isProductsApi = pathname.startsWith('/api/products')
  const isSiteConfigApi = pathname.startsWith('/api/site-config')

  // Lectura pública: el catálogo de la tienda y la configuración de portada
  // (marcas y slides del hero). La escritura de ambas rutas sigue protegida,
  // y cada handler valida la sesión por su cuenta.
  if ((isProductsApi || isSiteConfigApi) && request.method === 'GET') {
    return NextResponse.next()
  }

  if (isAdminLoginPage) return NextResponse.next()

  const isProtected = isAdminPage || isProductsApi || isSiteConfigApi
  if (!isProtected) return NextResponse.next()

  // La cookie ahora es un token firmado con caducidad, no un valor fijo.
  if (await isAuthorized(request)) {
    return NextResponse.next()
  }

  // Las rutas de API responden 401 en vez de redirigir: una redirección a HTML
  // hace que el cliente falle al interpretar la respuesta como JSON.
  if (isProductsApi || isSiteConfigApi) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.redirect(new URL('/admin/login', request.url))
}

export const config = {
  matcher: ['/admin/:path*', '/api/products/:path*', '/api/site-config/:path*'],
}
