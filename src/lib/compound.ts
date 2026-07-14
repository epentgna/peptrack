export type AdminRoute = 'Subcutânea' | 'Intramuscular' | 'Oral' | 'Intranasal'

export const ADMIN_ROUTES: { value: AdminRoute; label: string }[] = [
  { value: 'Subcutânea', label: 'Subcutânea (injeção)' },
  { value: 'Intramuscular', label: 'Intramuscular (injeção)' },
  { value: 'Oral', label: 'Cápsula / Oral' },
  { value: 'Intranasal', label: 'Intranasal (inalar)' }
]

/** Via padrão inferida da ficha do composto. */
export function defaultRoute(route?: string): AdminRoute {
  const r = (route || '').toLowerCase()
  if (/subcut/.test(r)) return 'Subcutânea'
  if (/intramus/.test(r)) return 'Intramuscular'
  if (/oral|c[áa]psula|comprimido/.test(r)) return 'Oral'
  if (/intranasal|nasal/.test(r)) return 'Intranasal'
  return 'Subcutânea'
}

/**
 * Decide se uma via é injetável (usa seringa/frasco). Orais/intranasais/
 * tópicos não usam reconstituição nem local de injeção.
 */
export function isInjectable(route?: string): boolean {
  const r = (route || '').toLowerCase()
  const hasInjection = /subcut|intramus|deltoid|\bsc\b|\bim\b/.test(r)
  if (hasInjection) return true
  const nonInjection = /oral|c[áa]psula|comprimido|intranasal|nasal|t[óo]pic|sublingual/.test(r)
  if (nonInjection) return false
  // Via desconhecida: assume injetável (maioria dos peptídeos).
  return true
}
