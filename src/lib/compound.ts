/**
 * Decide se um composto é injetável a partir da via de administração.
 * Compostos orais/intranasais/tópicos não usam seringa nem frasco
 * reconstituído, então a calculadora e o rastreamento de frasco somem.
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
