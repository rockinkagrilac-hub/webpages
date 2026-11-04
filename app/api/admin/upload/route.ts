import { NextResponse } from 'next/server'
import { isAuthorized } from '@/lib/admin-auth'
import { uploadBufferToR2, uploadDataUrlIfNeeded } from '@/lib/storage-upload'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10 MB

export async function POST(request: Request) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json(
      { message: 'No autorizado. Inicia sesión como administrador.' },
      { status: 401 }
    )
  }

  try {
    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file')
      const folder =
        String(formData.get('folder') || 'productos').replace(/[^a-zA-Z0-9_-]/g, '') || 'productos'
      const productName = String(formData.get('productName') || '').trim() || undefined
      const indexRaw = formData.get('index')
      const index = indexRaw !== null ? Number(indexRaw) : undefined

      if (!(file instanceof File)) {
        return NextResponse.json(
          { message: 'No se recibió ningún archivo de imagen' },
          { status: 400 }
        )
      }

      if (!file.type.startsWith('image/')) {
        return NextResponse.json(
          { message: 'El archivo debe ser una imagen válida' },
          { status: 400 }
        )
      }

      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json(
          { message: 'La imagen supera el límite de 10 MB' },
          { status: 400 }
        )
      }

      const arrayBuffer = await file.arrayBuffer()
      const url = await uploadBufferToR2(new Uint8Array(arrayBuffer), file.type, {
        folder,
        productName,
        index,
      })
      return NextResponse.json({ url }, { status: 201 })
    }

    const body = (await request.json()) as {
      dataUrl?: string
      folder?: string
      productName?: string
      index?: number
    }
    const dataUrl = body?.dataUrl?.trim() || ''
    const folder = (body?.folder || 'productos').replace(/[^a-zA-Z0-9_-]/g, '') || 'productos'

    if (!dataUrl.startsWith('data:image/')) {
      return NextResponse.json({ message: 'Formato de imagen inválido' }, { status: 400 })
    }

    const url = await uploadDataUrlIfNeeded(dataUrl, {
      folder,
      productName: body?.productName,
      index: body?.index,
    })
    return NextResponse.json({ url }, { status: 201 })
  } catch (error) {
    console.error('Error al subir imagen a Cloudflare R2:', error)
    return NextResponse.json(
      { message: 'No se pudo subir la imagen a Cloudflare R2' },
      { status: 500 }
    )
  }
}
