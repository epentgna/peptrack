import type { DoseLog, ProtocolItem } from '../types'
import { startOfDay, addDays, DAY_MS } from './dates'

/**
 * Doses previstas para um dia específico, a partir dos itens de protocolo
 * ativos. Um item conta no dia se está ativo, dentro da janela
 * start/endDate e o dia da semana está em daysOfWeek.
 */
export function scheduledItemsForDay(
  items: ProtocolItem[],
  dayStart: number
): ProtocolItem[] {
  const weekday = new Date(dayStart).getDay()
  return items.filter((it) => {
    if (!it.active) return false
    if (startOfDay(it.startDate) > dayStart) return false
    if (it.endDate != null && startOfDay(it.endDate) < dayStart) return false
    return it.daysOfWeek.includes(weekday)
  })
}

/** Existe algum protocolo ativo aplicável ao dia? */
export function hasActiveProtocolForDay(
  items: ProtocolItem[],
  dayStart: number
): boolean {
  return scheduledItemsForDay(items, dayStart).length > 0
}

/**
 * Aderência do dia = doses "taken" / doses previstas do dia.
 * Retorna 0 previstas quando não há protocolo (para o chamador tratar).
 */
export function dayAdherence(
  items: ProtocolItem[],
  logs: DoseLog[],
  dayStart: number
): { taken: number; scheduled: number; ratio: number } {
  const scheduled = scheduledItemsForDay(items, dayStart)
  const scheduledCount = scheduled.length
  if (scheduledCount === 0) {
    return { taken: 0, scheduled: 0, ratio: 0 }
  }
  const dayEnd = dayStart + DAY_MS
  const takenIds = new Set<number>()
  for (const log of logs) {
    if (log.status !== 'taken') continue
    if (log.scheduledFor < dayStart || log.scheduledFor >= dayEnd) continue
    if (log.protocolItemId != null) takenIds.add(log.protocolItemId)
  }
  // Conta itens previstos que foram tomados (evita dupla contagem).
  let taken = 0
  for (const it of scheduled) {
    if (it.id != null && takenIds.has(it.id)) taken++
  }
  // Doses tomadas sem vínculo de item ainda contam, limitado ao previsto.
  const unlinked = logs.filter(
    (l) =>
      l.status === 'taken' &&
      l.protocolItemId == null &&
      l.scheduledFor >= dayStart &&
      l.scheduledFor < dayEnd
  ).length
  taken = Math.min(scheduledCount, taken + unlinked)
  return {
    taken,
    scheduled: scheduledCount,
    ratio: scheduledCount === 0 ? 0 : taken / scheduledCount
  }
}

/**
 * Aderência dos últimos N dias = média das aderências diárias.
 * Dias sem protocolo ativo NÃO contam.
 */
export function windowAdherence(
  items: ProtocolItem[],
  logs: DoseLog[],
  days: number,
  today: number = startOfDay()
): number {
  let sum = 0
  let counted = 0
  for (let i = 0; i < days; i++) {
    const dayStart = addDays(today, -i)
    const { scheduled, ratio } = dayAdherence(items, logs, dayStart)
    if (scheduled === 0) continue
    sum += ratio
    counted++
  }
  return counted === 0 ? 0 : sum / counted
}

/** Série diária de aderência (0-100) para gráfico, do mais antigo ao mais recente. */
export function adherenceSeries(
  items: ProtocolItem[],
  logs: DoseLog[],
  days: number,
  today: number = startOfDay()
): { label: string; value: number | null; dayStart: number }[] {
  const out: { label: string; value: number | null; dayStart: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const dayStart = addDays(today, -i)
    const { scheduled, ratio } = dayAdherence(items, logs, dayStart)
    out.push({
      label: i === 0 ? 'hoje' : i === days - 1 ? `${days}d atrás` : '',
      value: scheduled === 0 ? null : Math.round(ratio * 100),
      dayStart
    })
  }
  return out
}

/**
 * Streak = dias consecutivos com 100% de aderência, terminando em hoje
 * (se hoje já está 100%) ou ontem. Dias sem protocolo são ignorados
 * (não quebram nem incrementam a sequência).
 */
export function currentStreak(
  items: ProtocolItem[],
  logs: DoseLog[],
  today: number = startOfDay()
): number {
  let streak = 0
  // Se hoje ainda não está 100%, começa a contar de ontem.
  const todayStat = dayAdherence(items, logs, today)
  let start = today
  if (todayStat.scheduled > 0 && todayStat.ratio < 1) {
    start = addDays(today, -1)
  }
  for (let i = 0; i < 400; i++) {
    const dayStart = addDays(start, -i)
    const { scheduled, ratio } = dayAdherence(items, logs, dayStart)
    if (scheduled === 0) continue // dia sem protocolo: ignora
    if (ratio >= 1) {
      streak++
    } else {
      break
    }
  }
  return streak
}

export function totalDosesTaken(logs: DoseLog[]): number {
  return logs.filter((l) => l.status === 'taken').length
}
