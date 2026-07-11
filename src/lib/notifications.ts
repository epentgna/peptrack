import { db } from '../db/db'
import { combineDayAndTime, startOfDay } from './dates'

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!notificationsSupported()) return false
  if (Notification.permission === 'granted') return true
  const result = await Notification.requestPermission()
  return result === 'granted'
}

const timers: number[] = []

function clearTimers() {
  while (timers.length) {
    const t = timers.pop()
    if (t != null) window.clearTimeout(t)
  }
}

/**
 * Agenda lembretes locais (setTimeout) para as doses previstas de hoje que
 * ainda não passaram. Lembretes locais funcionam enquanto o app está aberto;
 * é a abordagem possível para um PWA offline no iOS via Safari.
 */
export async function scheduleTodayReminders(): Promise<void> {
  clearTimers()
  if (!notificationsSupported() || Notification.permission !== 'granted') return

  const settings = await db.settings.get(1)
  if (!settings?.notificationsEnabled) return

  const items = await db.protocolItems.filter((i) => i.active).toArray()
  const compounds = await db.compounds.toArray()
  const nameById = new Map(compounds.map((c) => [c.id!, c.name]))

  const today = startOfDay()
  const weekday = new Date(today).getDay()
  const now = Date.now()

  for (const item of items) {
    if (!item.daysOfWeek.includes(weekday)) continue
    const fireAt = combineDayAndTime(today, item.timeOfDay)
    if (fireAt <= now) continue
    const delay = fireAt - now
    if (delay > 2 ** 31 - 1) continue
    const name = nameById.get(item.compoundId) ?? 'Peptídeo'
    const t = window.setTimeout(() => {
      try {
        new Notification('PepTrack — hora da dose', {
          body: `${name} · ${item.doseMcg} mcg às ${item.timeOfDay}`,
          icon: '/icon-192.png',
          tag: `dose-${item.id}-${today}`
        })
      } catch {
        /* silencioso */
      }
    }, delay)
    timers.push(t)
  }
}
