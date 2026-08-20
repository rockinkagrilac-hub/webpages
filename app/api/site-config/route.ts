import { NextResponse } from 'next/server'
import { getSiteConfig, updateSiteConfig } from '@/lib/site-config-repo'
import { SiteConfig } from '@/lib/site-config-db'
import { isAuthorized } from '@/lib/admin-auth'
import { siteConfigSchema } from '@/lib/validators'

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
    const config = await getSiteConfig()
    return jsonNoStore(config)
  } catch {
    return jsonNoStore({ message: 'Error al leer configuracion' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await isAuthorized(request))) {
      return jsonNoStore({ message: 'Unauthorized' }, { status: 401 })
    }

    const patch = (await request.json()) as Partial<SiteConfig>
    const parsed = siteConfigSchema.safeParse(patch)
    if (!parsed.success) {
      return jsonNoStore({ message: 'Configuracion invalida' }, { status: 400 })
    }

    const updated = await updateSiteConfig(parsed.data)
    return jsonNoStore(updated)
  } catch (error) {
    // El aviso de "falta aplicar la migración" es accionable: hay que dejarlo
    // llegar al panel en vez de sustituirlo por un error genérico.
    const message =
      error instanceof Error && error.message.includes('site_config')
        ? error.message
        : 'Error al guardar configuracion'
    return jsonNoStore({ message }, { status: 500 })
  }
}
