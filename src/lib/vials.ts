import { db } from '../db/db'
import type { Vial } from '../types'
import { DAY_MS, startOfDay } from './dates'

export interface VialStatus {
  vial: Vial
  daysLeft: number
  balancePct: number
  expiring: boolean // vence em <= 3 dias
  lowBalance: boolean // saldo < 10%
  alert: boolean
}

export function vialExpiryTs(vial: Vial): number {
  return vial.reconstitutedAt + vial.beyondUseDays * DAY_MS
}

export function computeVialStatus(vial: Vial, now: number = Date.now()): VialStatus {
  const expiry = vialExpiryTs(vial)
  const daysLeft = Math.max(
    0,
    Math.ceil((startOfDay(expiry) - startOfDay(now)) / DAY_MS)
  )
  const balancePct = vial.totalMcg > 0 ? (vial.remainingMcg / vial.totalMcg) * 100 : 0
  const expiring = daysLeft <= 3
  const lowBalance = balancePct < 10
  return {
    vial,
    daysLeft,
    balancePct,
    expiring,
    lowBalance,
    alert: expiring || lowBalance
  }
}

/** Frasco ativo (mais recente) de um composto, se houver. */
export async function activeVialForCompound(
  compoundId: number
): Promise<Vial | undefined> {
  const vials = await db.vials
    .where('compoundId')
    .equals(compoundId)
    .and((v) => v.active)
    .toArray()
  vials.sort((a, b) => b.reconstitutedAt - a.reconstitutedAt)
  return vials[0]
}

/**
 * Desconta uma dose do frasco ativo do composto. Marca inativo ao zerar.
 * Também desativa frascos vencidos ao passar por aqui.
 */
export async function deductDoseFromVial(
  compoundId: number,
  doseMcg: number
): Promise<void> {
  const vial = await activeVialForCompound(compoundId)
  if (!vial || vial.id == null) return
  const now = Date.now()
  if (vialExpiryTs(vial) < now) {
    await db.vials.update(vial.id, { active: false })
    return
  }
  const remaining = Math.max(0, vial.remainingMcg - doseMcg)
  await db.vials.update(vial.id, {
    remainingMcg: remaining,
    active: remaining > 0
  })
}

/** Reverte o desconto ao apagar/pular um log já contabilizado. */
export async function refundDoseToVial(
  compoundId: number,
  doseMcg: number
): Promise<void> {
  const vial = await activeVialForCompound(compoundId)
  if (!vial || vial.id == null) return
  const remaining = Math.min(vial.totalMcg, vial.remainingMcg + doseMcg)
  await db.vials.update(vial.id, { remainingMcg: remaining, active: remaining > 0 })
}

/** Todos os frascos ativos com alerta, para exibir na home. */
export async function alertingVials(): Promise<VialStatus[]> {
  const vials = await db.vials.filter((v) => v.active).toArray()
  return vials
    .map((v) => computeVialStatus(v))
    .filter((s) => s.alert)
    .sort((a, b) => a.daysLeft - b.daysLeft)
}
