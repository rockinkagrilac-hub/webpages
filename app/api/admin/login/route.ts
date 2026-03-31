import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabase } from '@/lib/supabase'
import { adminLoginSchema } from '@/lib/validators'
import { setAdminCookie } from '@/lib/admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_ATTEMPTS = 5
const WINDOW_MS = 10 * 60 * 1000
const loginAttempts = new Map<string, { count: number; resetAt: number }>()

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

export async function POST(request: Request) {
  try {
    const forwardedFor = request.headers.get('x-forwarded-for') || ''
    const ip = forwardedFor.split(',')[0]?.trim() || 'unknown'
    const now = Date.now()
    const currentWindow = loginAttempts.get(ip)

    if (currentWindow && currentWindow.resetAt > now && currentWindow.count >= MAX_ATTEMPTS) {
      return jsonNoStore({ message: 'Demasiados intentos. Intenta mas tarde.' }, { status: 429 })
    }

    const body = await request.json()
    const parsed = adminLoginSchema.safeParse(body)
    if (!parsed.success) {
      return jsonNoStore({ message: 'Credenciales incompletas' }, { status: 400 })
    }

    const { username, password } = parsed.data

    const { data, error } = await supabase
      .from('admin_users')
      .select('id, username, password_hash, is_active')
      .eq('username', username)
      .limit(1)
      .maybeSingle()

    if (error) {
      return jsonNoStore({ message: 'Error al validar acceso' }, { status: 500 })
    }

    if (!data || data.is_active === false) {
      registerFailedAttempt(ip, now)
      return jsonNoStore({ message: 'Unauthorized' }, { status: 401 })
    }

    const stored = data.password_hash || ''
    let ok = false
    if (stored.startsWith('$2')) {
      ok = await bcrypt.compare(password, stored)
    } else {
      ok = password === stored
    }

    if (!ok) {
      registerFailedAttempt(ip, now)
      return jsonNoStore({ message: 'Unauthorized' }, { status: 401 })
    }

    loginAttempts.delete(ip)
    const response = jsonNoStore({ ok: true })
    return setAdminCookie(response)
  } catch {
    return jsonNoStore({ message: 'Error al validar acceso' }, { status: 500 })
  }
}

function registerFailedAttempt(ip: string, now: number) {
  const entry = loginAttempts.get(ip)
  if (!entry || entry.resetAt <= now) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return
  }

  loginAttempts.set(ip, {
    count: entry.count + 1,
    resetAt: entry.resetAt,
  })
}
