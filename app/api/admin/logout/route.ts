import { NextResponse } from 'next/server'
import { clearAdminCookie } from '@/lib/admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL('/', request.url))
  return clearAdminCookie(response)
}

export async function POST() {
  const response = NextResponse.json({ ok: true })
  return clearAdminCookie(response)
}
