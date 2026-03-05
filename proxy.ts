import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_COOKIE = 'admin_access_ok'

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone()
  const { pathname } = url
  const isAdminPage = pathname.startsWith('/admin')
  const isProductsApi = pathname.startsWith('/api/products')
  const isSiteConfigApi = pathname.startsWith('/api/site-config')

  // Permitir GET públicos de productos para la tienda
  if (isProductsApi && request.method === 'GET') return NextResponse.next()

  const isProtected = isAdminPage || isProductsApi || isSiteConfigApi
  if (!isProtected) return NextResponse.next()

  const hasAccessCookie = request.cookies.get(ADMIN_COOKIE)?.value === '1'
  const secret = process.env.ADMIN_ACCESS_KEY
  const keyFromUrl = url.searchParams.get('access')

  if (hasAccessCookie) {
    return NextResponse.next()
  }

  if (secret && keyFromUrl === secret) {
    url.searchParams.delete('access')
    const response = NextResponse.redirect(url)
    response.cookies.set(ADMIN_COOKIE, '1', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 12,
    })
    return response
  }

  return NextResponse.redirect(new URL('/', request.url))
}

export const config = {
  matcher: ['/admin/:path*', '/api/products/:path*', '/api/site-config/:path*'],
}
