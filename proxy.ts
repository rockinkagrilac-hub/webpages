import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_COOKIE = 'admin_access_ok'

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone()
  const { pathname } = url
  const isAdminPage = pathname.startsWith('/admin')
  const isAdminLoginPage = pathname === '/admin/login'
  const isProductsApi = pathname.startsWith('/api/products')
  const isSiteConfigApi = pathname.startsWith('/api/site-config')

  // Permitir GET públicos de productos (tienda) y de la configuración del sitio
  // (marcas y slides del hero que muestra la portada). La escritura sigue
  // protegida: el PUT de cada ruta valida la sesión de admin.
  if ((isProductsApi || isSiteConfigApi) && request.method === 'GET') {
    return NextResponse.next()
  }
  if (isAdminLoginPage) return NextResponse.next()

  const isProtected = isAdminPage || isProductsApi || isSiteConfigApi
  if (!isProtected) return NextResponse.next()

  const hasAccessCookie = request.cookies.get(ADMIN_COOKIE)?.value === '1'

  if (hasAccessCookie) {
    return NextResponse.next()
  }

  return NextResponse.redirect(new URL('/', request.url))
}

export const config = {
  matcher: ['/admin/:path*', '/api/products/:path*', '/api/site-config/:path*'],
}
