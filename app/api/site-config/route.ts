import { NextResponse } from 'next/server'
import { getSiteConfig, updateSiteConfig } from '@/lib/site-config-repo'
import { SiteConfig } from '@/lib/site-config-db'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const config = await getSiteConfig()
    return NextResponse.json(config)
  } catch (error) {
    return NextResponse.json({ message: 'Error al leer configuración' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const adminKey = process.env.ADMIN_ACCESS_KEY
    const headerKey = request.headers.get('x-admin')
    if (!adminKey || headerKey !== adminKey) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const patch = (await request.json()) as Partial<SiteConfig>
    const updated = await updateSiteConfig(patch)
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ message: 'Error al guardar configuración' }, { status: 500 })
  }
}
