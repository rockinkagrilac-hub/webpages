import { NextResponse } from 'next/server'

/**
 * Sesión de administrador.
 *
 * Antes la cookie era el valor fijo `admin_access_ok=1`: no estaba firmada, no
 * caducaba del lado del servidor y no decía QUÉ administrador había entrado, así
 * que no había forma de auditar quién cambió qué.
 *
 * Ahora la cookie lleva un token firmado con HMAC-SHA256:
 *
 *     base64url({"u":"usuario","exp":1234567890}) . base64url(firma)
 *
 * Se usa Web Crypto (no el módulo `crypto` de Node) porque este archivo lo
 * comparten las rutas API (runtime nodejs) y el middleware (runtime edge), y
 * Web Crypto es el único disponible en ambos.
 */

export const ADMIN_COOKIE = 'admin_session'
const SESSION_HOURS = 12

/**
 * Clave de firma. Usa ADMIN_SESSION_SECRET si está definida; si no, la deriva
 * de la service role key, que ya existe y solo vive en el servidor. Así no hace
 * falta dar de alta ninguna credencial nueva.
 */
function getSecret(): string {
  const explicit = process.env.ADMIN_SESSION_SECRET
  if (explicit && explicit.length >= 16) return explicit

  const derived = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (derived && derived.length >= 16) return `rockink-admin:${derived}`

  return ''
}

/**
 * Web Crypto espera BufferSource. Se construyen ArrayBuffer explícitos porque
 * TypeScript ya no acepta `Uint8Array<ArrayBufferLike>` donde se pide uno.
 */
function textToBuffer(text: string): ArrayBuffer {
  const bytes = new TextEncoder().encode(text)
  const buffer = new ArrayBuffer(bytes.length)
  new Uint8Array(buffer).set(bytes)
  return buffer
}

function b64urlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i])
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlDecode(value: string): ArrayBuffer {
  const padding = value.length % 4 ? '='.repeat(4 - (value.length % 4)) : ''
  const binary = atob(value.replace(/-/g, '+').replace(/_/g, '/') + padding)
  const buffer = new ArrayBuffer(binary.length)
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return buffer
}

async function importKey(secret: string) {
  return crypto.subtle.importKey(
    'raw',
    textToBuffer(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

export async function createAdminToken(username: string): Promise<string> {
  const secret = getSecret()
  if (!secret) throw new Error('No hay secreto para firmar la sesion de administrador')

  const payload = b64urlEncode(
    textToBuffer(
      JSON.stringify({ u: username, exp: Date.now() + SESSION_HOURS * 60 * 60 * 1000 })
    )
  )

  const key = await importKey(secret)
  const signature = await crypto.subtle.sign('HMAC', key, textToBuffer(payload))

  return `${payload}.${b64urlEncode(signature)}`
}

/** Devuelve el usuario si el token es válido y no ha caducado; si no, null. */
export async function verifyAdminToken(token: string): Promise<string | null> {
  const secret = getSecret()
  if (!secret || !token) return null

  const dot = token.indexOf('.')
  if (dot <= 0) return null

  const payload = token.slice(0, dot)
  const signature = token.slice(dot + 1)
  if (!payload || !signature) return null

  try {
    const key = await importKey(secret)
    // crypto.subtle.verify compara en tiempo constante.
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      b64urlDecode(signature),
      textToBuffer(payload)
    )
    if (!valid) return null

    const claims = JSON.parse(new TextDecoder().decode(b64urlDecode(payload))) as {
      u?: string
      exp?: number
    }
    if (!claims.u || typeof claims.exp !== 'number') return null
    if (claims.exp <= Date.now()) return null

    return claims.u
  } catch {
    return null
  }
}

function readCookie(cookieHeader: string, name: string): string {
  for (const pair of cookieHeader.split(/; */)) {
    const eq = pair.indexOf('=')
    if (eq > 0 && pair.slice(0, eq) === name) return decodeURIComponent(pair.slice(eq + 1))
  }
  return ''
}

/** Usuario administrador de la petición, o null si no hay sesión válida. */
export async function getAdminUser(request: Request): Promise<string | null> {
  // Acceso por clave de servicio, para integraciones y scripts.
  const adminKey = process.env.ADMIN_ACCESS_KEY
  const headerKey = request.headers.get('x-admin')
  if (adminKey && adminKey.length >= 16 && headerKey === adminKey) return 'service'

  const token = readCookie(request.headers.get('cookie') || '', ADMIN_COOKIE)
  return verifyAdminToken(token)
}

export async function isAuthorized(request: Request): Promise<boolean> {
  return (await getAdminUser(request)) !== null
}

export async function setAdminCookie(response: NextResponse, username: string) {
  response.cookies.set(ADMIN_COOKIE, await createAdminToken(username), {
    path: '/',
    maxAge: SESSION_HOURS * 60 * 60,
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
