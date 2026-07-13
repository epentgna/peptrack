export type DoseUnit = 'mcg' | 'mg' | 'g'

export const DOSE_FACTOR: Record<DoseUnit, number> = {
  mcg: 1,
  mg: 1000,
  g: 1_000_000
}

/** Unidade mais legível para um valor em mcg. */
export function pickDoseUnit(mcg: number | null | undefined): DoseUnit {
  if (mcg == null || mcg <= 0) return 'mcg'
  if (mcg >= 1_000_000) return 'g'
  if (mcg >= 1000) return 'mg'
  return 'mcg'
}

export function trimNum(n: number): string {
  return String(Number(n.toFixed(4)))
}

/** Formata um valor em mcg na unidade mais legível (ex.: 5000 → "5 mg"). */
export function formatDose(mcg: number): string {
  const u = pickDoseUnit(mcg)
  return `${trimNum(mcg / DOSE_FACTOR[u])} ${u}`
}
