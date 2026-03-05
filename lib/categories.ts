export const DEFAULT_CATEGORIES = [
  'Ordeño',
  'Instrumental',
  'Inseminación Artificial',
  'Esquila',
  'Identificación Animal',
  'Complementos',
  'Limpieza',
  'Conservación',
  'Fumigación',
  'Seguridad',
  'Criogenia',
  'Iluminación',
  'Otros',
]

const CATEGORY_ALIASES: Record<string, string> = {
  ordeno: 'Ordeño',
  ordeño: 'Ordeño',
  instrumental: 'Instrumental',
  ia: 'Inseminación Artificial',
  'inseminacion artificial': 'Inseminación Artificial',
  'inseminación artificial': 'Inseminación Artificial',
  esquila: 'Esquila',
  identificacion: 'Identificación Animal',
  identificación: 'Identificación Animal',
  'identificacion animal': 'Identificación Animal',
  'identificación animal': 'Identificación Animal',
  complementos: 'Complementos',
  limpieza: 'Limpieza',
  conservacion: 'Conservación',
  conservación: 'Conservación',
  fumigacion: 'Fumigación',
  fumigación: 'Fumigación',
  seguridad: 'Seguridad',
  criogenia: 'Criogenia',
  iluminacion: 'Iluminación',
  iluminación: 'Iluminación',
  otros: 'Otros',
}

function stripDiacritics(input: string) {
  return input.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function normalizeCategory(category: string) {
  const compact = category.trim().replace(/\s+/g, ' ')
  if (!compact) return ''

  const key = stripDiacritics(compact).toLowerCase()
  if (CATEGORY_ALIASES[key]) return CATEGORY_ALIASES[key]

  return compact
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function uniqueNormalized(categories: string[]) {
  const seen = new Set<string>()
  const out: string[] = []

  for (const raw of categories) {
    const normalized = normalizeCategory(raw)
    if (!normalized) continue
    const key = normalized.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(normalized)
  }

  return out
}

function sortByDefaultPriority(categories: string[]) {
  const defaults = DEFAULT_CATEGORIES.map((c) => normalizeCategory(c))
  const defaultSet = new Set(defaults.map((c) => stripDiacritics(c).toLowerCase()))

  const fixed = defaults.filter((c) =>
    categories.some((x) => stripDiacritics(x).toLowerCase() === stripDiacritics(c).toLowerCase())
  )
  const extras = categories
    .filter((c) => !defaultSet.has(stripDiacritics(c).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, 'es'))

  return [...fixed, ...extras]
}

export function mergeCategoriesWithProducts(
  productCategories: string[],
  storedCategories: string[] = []
) {
  const merged = uniqueNormalized([
    ...DEFAULT_CATEGORIES,
    ...storedCategories,
    ...productCategories,
  ])
  return sortByDefaultPriority(merged)
}

export function getCategories(): string[] {
  if (typeof window === 'undefined') return mergeCategoriesWithProducts([])
  const stored = localStorage.getItem('agro_categories')
  if (!stored) return mergeCategoriesWithProducts([])
  try {
    const parsed = JSON.parse(stored) as string[]
    return mergeCategoriesWithProducts([], parsed)
  } catch {
    return mergeCategoriesWithProducts([])
  }
}

export function addCategory(category: string): string[] {
  if (typeof window === 'undefined') return mergeCategoriesWithProducts([])
  const current = getCategories()
  const next = mergeCategoriesWithProducts([], [...current, category])
  localStorage.setItem('agro_categories', JSON.stringify(next))
  return next
}

export function removeCategory(category: string): string[] {
  if (typeof window === 'undefined') return mergeCategoriesWithProducts([])
  const normalized = stripDiacritics(normalizeCategory(category)).toLowerCase()
  const defaultSet = new Set(
    DEFAULT_CATEGORIES.map((c) => stripDiacritics(normalizeCategory(c)).toLowerCase())
  )
  const current = getCategories().filter((c) => {
    const key = stripDiacritics(c).toLowerCase()
    return !defaultSet.has(key) && key !== normalized
  })
  const filtered = mergeCategoriesWithProducts([], current)
  localStorage.setItem('agro_categories', JSON.stringify(filtered))
  return filtered
}
