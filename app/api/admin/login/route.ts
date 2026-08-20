import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabase } from '@/lib/supabase'
import { adminLoginSchema } from '@/lib/validators'
import { setAdminCookie } from '@/lib/admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_ATTEMPTS = 5
const WINDOW_MS = 10 * 60 * 1000

/**
 * Hash descartable con el que se compara cuando el usuario no existe, para que
 * un usuario inexistente y una contraseña incorrecta tarden lo mismo y no se
 * pueda deducir cuáles existen midiendo el tiempo de respuesta.
 */
const DUMMY_HASH = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'

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

/**
 * El control de intentos vive en Supabase, no en memoria: en serverless cada
 * instancia tenía su propio Map, así que el límite se evadía solo cambiando de
 * instancia.
 *
 * Si la tabla todavía no existe (migración sin aplicar) se deja pasar en vez de
 * bloquear: quedarse fuera del panel es peor que perder temporalmente el límite.
 */
async function isRateLimited(ip: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('login_attempts')
      .select('intentos, reset_at')
      .eq('ip', ip)
      .maybeSingle()

    if (error || !data) return false
    return data.intentos >= MAX_ATTEMPTS && new Date(data.reset_at).getTime() > Date.now()
  } catch {
    return false
  }
}

async function registerFailedAttempt(ip: string) {
  try {
    const { data } = await supabase
      .from('login_attempts')
      .select('intentos, reset_at')
      .eq('ip', ip)
      .maybeSingle()

    const now = Date.now()
    const windowActive = data && new Date(data.reset_at).getTime() > now

    await supabase.from('login_attempts').upsert(
      {
        ip,
        intentos: windowActive ? (data?.intentos ?? 0) + 1 : 1,
        reset_at: windowActive
          ? new Date(data!.reset_at).toISOString()
          : new Date(now + WINDOW_MS).toISOString(),
        updated_at: new Date(now).toISOString(),
      },
      { onConflict: 'ip' }
    )
  } catch {
    // Que no se pueda registrar el intento no debe tumbar el login.
  }
}

async function clearAttempts(ip: string) {
  try {
    await supabase.from('login_attempts').delete().eq('ip', ip)
  } catch {
    // sin consecuencias
  }
}

export async function POST(request: Request) {
  try {
    const forwardedFor = request.headers.get('x-forwarded-for') || ''
    const ip = forwardedFor.split(',')[0]?.trim() || 'unknown'

    if (await isRateLimited(ip)) {
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
      return jsonNoStore(
        {
          message:
            process.env.NODE_ENV === 'development'
              ? `Error Supabase: ${error.message}`
              : 'Error al validar acceso',
        },
        { status: 500 }
      )
    }

    const stored = data?.password_hash || ''
    const activo = Boolean(data) && data?.is_active !== false

    // Solo se acepta bcrypt. Antes, si el hash guardado no empezaba por "$2",
    // se comparaba en texto plano: un usuario con la contraseña sin hashear
    // entraba igual. Ahora eso falla cerrado.
    const esBcrypt = stored.startsWith('$2')

    // Se compara siempre, incluso sin usuario, para no filtrar por tiempo.
    const passwordOk = await bcrypt.compare(password, esBcrypt ? stored : DUMMY_HASH)
    const ok = Boolean(data) && activo && esBcrypt && passwordOk

    if (!ok) {
      await registerFailedAttempt(ip)

      let motivo = 'Credenciales invalidas'
      if (!data) motivo = 'Usuario no encontrado'
      else if (!activo) motivo = 'Usuario inactivo'
      else if (!esBcrypt) motivo = 'La contrasena guardada no esta hasheada con bcrypt'

      return jsonNoStore(
        { message: process.env.NODE_ENV === 'development' ? motivo : 'Unauthorized' },
        { status: 401 }
      )
    }

    await clearAttempts(ip)
    // La sesión queda firmada y con caducidad, y registra qué usuario entró.
    return setAdminCookie(jsonNoStore({ ok: true }), data!.username)
  } catch {
    return jsonNoStore({ message: 'Error al validar acceso' }, { status: 500 })
  }
}
