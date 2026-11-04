import crypto from 'node:crypto'

const R2_ENDPOINT =
  process.env.R2_ENDPOINT || 'https://9652f1170a222f5f8cb5d4940857ab2a.r2.cloudflarestorage.com'
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || 'ef71fd80539bf77e93a8f34b886b858a'
const R2_SECRET_ACCESS_KEY =
  process.env.R2_SECRET_ACCESS_KEY ||
  '808ad9b0e2b0eeba199e3ac663db0ee58b090ad34754d3a62ccbe5c0eb61c570'
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'imagenes-productos'
const R2_PUBLIC_URL = (
  process.env.R2_PUBLIC_URL || 'https://pub-c673dc170a9a4dcda52c514785042c8b.r2.dev'
).replace(/\/+$/, '')

const MIME_TO_EXT: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'image/avif': 'avif',
}

export function normalizarNombreR2(texto: string): string {
  if (!texto) return 'producto'
  return (
    texto
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase() || 'producto'
  )
}

function sha256Hex(data: Buffer | Uint8Array | string): string {
  return crypto.createHash('sha256').update(data).digest('hex')
}

function hmacSha256(key: Buffer | string, data: string): Buffer {
  return crypto.createHmac('sha256', key).update(data, 'utf8').digest()
}

/**
 * Sube un buffer directamente a Cloudflare R2 usando firma AWS Signature V4
 * y devuelve el enlace público de Cloudflare R2 (`https://pub-...r2.dev/productos/...`).
 */
export async function uploadBufferToR2(
  buffer: Buffer | Uint8Array,
  mimeType: string,
  options: {
    folder?: string
    productName?: string
    index?: number
  } = {}
): Promise<string> {
  const folder = options.folder || 'productos'
  const cleanMime = mimeType.toLowerCase().split(';')[0].trim() || 'image/webp'
  const ext = MIME_TO_EXT[cleanMime] || 'webp'

  const baseSlug = options.productName
    ? normalizarNombreR2(options.productName)
    : `${Date.now()}${Math.random().toString(36).slice(2, 6)}`
  const suffix = typeof options.index === 'number' ? `-${options.index}` : `-${Date.now().toString(36)}`
  const objectKey = `${folder}/${baseSlug}${suffix}.${ext}`

  const endpointUrl = new URL(R2_ENDPOINT)
  const host = endpointUrl.host
  const canonicalUri = `/${R2_BUCKET_NAME}/${objectKey}`
  const targetUrl = `${R2_ENDPOINT.replace(/\/+$/, '')}${canonicalUri}`

  const now = new Date()
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
  const dateStamp = amzDate.slice(0, 8)
  const region = 'auto'
  const service = 's3'

  const payloadHash = sha256Hex(buffer)

  const canonicalHeaders =
    `content-type:${cleanMime}\n` +
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`
  const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date'

  const canonicalRequest = [
    'PUT',
    canonicalUri,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n')

  const algorithm = 'AWS4-HMAC-SHA256'
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join('\n')

  const kDate = hmacSha256(`AWS4${R2_SECRET_ACCESS_KEY}`, dateStamp)
  const kRegion = hmacSha256(kDate, region)
  const kService = hmacSha256(kRegion, service)
  const kSigning = hmacSha256(kService, 'aws4_request')
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign, 'utf8').digest('hex')

  const authorization =
    `${algorithm} Credential=${R2_ACCESS_KEY_ID}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`

  const bodyBytes = new Uint8Array(buffer.byteLength)
  bodyBytes.set(buffer)

  const response = await fetch(targetUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': cleanMime,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
      Authorization: authorization,
    },
    body: bodyBytes,
  })

  if (!response.ok) {
    const errText = await response.text().catch(() => '')
    throw new Error(`Error subiendo a Cloudflare R2 (${response.status}): ${errText}`)
  }

  return `${R2_PUBLIC_URL}/${objectKey}`
}

export async function uploadDataUrlIfNeeded(
  urlOrData: string,
  options: {
    folder?: string
    productName?: string
    index?: number
  } = {}
): Promise<string> {
  const trimmed = urlOrData.trim()
  if (!trimmed.startsWith('data:image/')) {
    return trimmed
  }

  const match = trimmed.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/)
  if (!match) {
    return trimmed
  }

  const [, mimeType, base64Data] = match
  const buffer = Buffer.from(base64Data, 'base64')
  return uploadBufferToR2(buffer, mimeType, options)
}
