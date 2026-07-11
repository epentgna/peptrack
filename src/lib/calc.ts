export interface ReconResult {
  /** Concentração em mcg/ml. */
  concentration: number
  /** Volume a puxar, em ml. */
  volumeMl: number
  /** Unidades na seringa U-100. */
  units: number
  valid: boolean
}

/**
 * Cálculo de reconstituição para seringa U-100.
 *   concentração (mcg/ml) = (frasco_mg × 1000) / bac_ml
 *   volume_ml              = dose_mcg / concentração
 *   unidades (U-100)       = volume_ml × 100
 */
export function reconstitution(
  vialMg: number,
  bacMl: number,
  doseMcg: number
): ReconResult {
  const valid = vialMg > 0 && bacMl > 0 && doseMcg > 0
  if (!valid) {
    return { concentration: 0, volumeMl: 0, units: 0, valid: false }
  }
  const concentration = (vialMg * 1000) / bacMl
  const volumeMl = doseMcg / concentration
  const units = volumeMl * 100
  return { concentration, volumeMl, units, valid: true }
}

/** Total de mcg em um frasco reconstituído. */
export function totalMcgForVial(vialMg: number): number {
  return vialMg * 1000
}
