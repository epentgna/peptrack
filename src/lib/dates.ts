const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const WEEKDAYS_LONG = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado'
]
const MONTHS_SHORT = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez'
]

export const DAY_MS = 24 * 60 * 60 * 1000

/** Timestamp do início do dia (00:00 local) de uma data. */
export function startOfDay(d: number | Date = new Date()): number {
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

export function addDays(ts: number, days: number): number {
  return startOfDay(new Date(ts + days * DAY_MS))
}

export function weekdayLong(d: number | Date): string {
  return WEEKDAYS_LONG[new Date(d).getDay()]
}

export function weekdayShort(index: number): string {
  return WEEKDAYS_SHORT[index]
}

/** Ex.: "Jul 11" */
export function monthDay(d: number | Date): string {
  const date = new Date(d)
  return `${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}`
}

/** Ex.: "Sábado / Jul 11" */
export function longDateHeadline(d: number | Date = new Date()): string {
  return `${weekdayLong(d)} / ${monthDay(d)}`
}

export function formatTime(d: number | Date): string {
  const date = new Date(d)
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

export function formatDateTime(d: number | Date): string {
  const date = new Date(d)
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${formatTime(date)}`
}

/** Combina o início de um dia com um horário "HH:MM" -> timestamp. */
export function combineDayAndTime(dayStart: number, time: string): number {
  const [h, m] = time.split(':').map((n) => parseInt(n, 10))
  return dayStart + h * 60 * 60 * 1000 + m * 60 * 1000
}

/** Para inputs datetime-local. */
export function toLocalInputValue(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function fromLocalInputValue(value: string): number {
  return new Date(value).getTime()
}

export function daysBetween(a: number, b: number): number {
  return Math.round((startOfDay(b) - startOfDay(a)) / DAY_MS)
}
