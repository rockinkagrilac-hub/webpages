import { NextResponse } from 'next/server'

export const ADMIN_COOKIE = 'admin_access_ok'

export function isAuthorized(request: Request) {
  const adminKey = process.env.ADMIN_ACCESS_KEY
  const headerKey = request.headers.get('x-admin')
  if (adminKey && headerKey === adminKey) return true

  const cookieHeader = request.headers.get('cookie') || ''
  return cookieHeader.split(/; */).some((pair) => pair.startsWith(`${ADMIN_COOKIE}=1`))
}

export function setAdminCookie(response: NextResponse) {
  response.cookies.set(ADMIN_COOKIE, '1', {
    path: '/',
    maxAge: 43200,
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  })
  return response
}

export function clearAdminCookie(response: NextResponse) {
  response.cookies.set(ADMIN_COOKIE, '', {
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  })
  return response
}
