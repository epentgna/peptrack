import { useEffect, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { INJECTION_SITES, type InjectionSite, type Compound } from '../types'
import { BottomSheet } from './BottomSheet'
import { IconCheck } from './icons'
import { formatTime, DAY_MS, combineDayAndTime } from '../lib/dates'
import { deductDoseFromVial } from '../lib/vials'
import { scheduleTodayReminders } from '../lib/notifications'

export interface DoseTarget {
  compound: Compound
  protocolItemId?: number
  doseMcg: number
  timeOfDay: string
  scheduledFor: number // início do dia
}

const lastSiteKey = (compoundId: number) => `peptrack:lastSite:${compoundId}`

/** Locais menos usados nos últimos 7 dias (para sugerir rotação). */
function leastUsedSites(logs: { site: InjectionSite; loggedAt: number }[]): Set<InjectionSite> {
  const since = Date.now() - 7 * DAY_MS
  const counts = new Map<InjectionSite, number>()
  INJECTION_SITES.forEach((s) => counts.set(s, 0))
  for (const l of logs) {
    if (l.loggedAt >= since) counts.set(l.site, (counts.get(l.site) ?? 0) + 1)
  }
  let min = Infinity
  counts.forEach((c) => (min = Math.min(min, c)))
  const result = new Set<InjectionSite>()
  counts.forEach((c, s) => {
    if (c === min) result.add(s)
  })
  return result
}

export function DoseSheet({
  target,
  onClose
}: {
  target: DoseTarget | null
  onClose: () => void
}) {
  const open = target != null
  const compoundId = target?.compound.id ?? -1

  const recentLogs = useLiveQuery(
    () =>
      db.doseLogs
        .where('compoundId')
        .equals(compoundId)
        .and((l) => l.status === 'taken')
        .toArray(),
    [compoundId]
  )

  const suggested = useMemo(
    () => leastUsedSites(recentLogs ?? []),
    [recentLogs]
  )

  const [dose, setDose] = useState('')
  const [time, setTime] = useState('')
  const [site, setSite] = useState<InjectionSite>('Abdômen E')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!target) return
    setDose(String(target.doseMcg))
    setTime(target.timeOfDay || formatTime(Date.now()))
    setNotes('')
    // último local usado deste composto, ou o primeiro sugerido.
    const stored = localStorage.getItem(lastSiteKey(compoundId)) as InjectionSite | null
    if (stored && INJECTION_SITES.includes(stored)) {
      setSite(stored)
    } else {
      setSite('Abdômen E')
    }
    setSaving(false)
  }, [target, compoundId])

  async function save(status: 'taken' | 'skipped') {
    if (!target || saving) return
    setSaving(true)
    const doseMcg = parseFloat(dose) || target.doseMcg
    const loggedAt =
      status === 'taken'
        ? combineDayAndTime(target.scheduledFor, time || formatTime(Date.now()))
        : Date.now()
    await db.doseLogs.add({
      protocolItemId: target.protocolItemId,
      compoundId: target.compound.id!,
      doseMcg,
      loggedAt,
      scheduledFor: target.scheduledFor,
      site,
      status,
      notes: notes.trim() || undefined
    })
    if (status === 'taken') {
      localStorage.setItem(lastSiteKey(compoundId), site)
      await deductDoseFromVial(target.compound.id!, doseMcg)
    }
    await scheduleTodayReminders()
    setSaving(false)
    onClose()
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      eyebrow="LOG.DOSE // REGISTRO"
      title={target?.compound.name}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label" htmlFor="dose-qty">
              Quantidade (mcg)
            </label>
            <input
              id="dose-qty"
              inputMode="decimal"
              className="field"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label" htmlFor="dose-time">
              Horário
            </label>
            <input
              id="dose-time"
              type="time"
              className="field"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <div>
          <div className="field-label">Injection.site</div>
          <div className="grid grid-cols-3 gap-2">
            {INJECTION_SITES.map((s) => {
              const active = s === site
              const isSuggested = suggested.has(s) && !active
              return (
                <button
                  key={s}
                  onClick={() => setSite(s)}
                  className={`chip !justify-center relative ${active ? 'chip-active' : ''} ${
                    isSuggested ? 'border-cyan/30 text-ink' : ''
                  }`}
                >
                  {s}
                  {isSuggested && (
                    <span className="absolute -top-1 -right-1 h-1.5 w-1.5 rounded-full bg-cyan" />
                  )}
                </button>
              )
            })}
          </div>
          <p className="mt-2 text-[11px] text-muted/80">
            Pontos com marca de rotação são os menos usados nos últimos 7 dias.
          </p>
        </div>

        <div>
          <label className="field-label" htmlFor="dose-notes">
            Notas (opcional)
          </label>
          <textarea
            id="dose-notes"
            className="field min-h-[64px] resize-none"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Como se sentiu, observações…"
          />
        </div>

        <button
          className="btn-primary"
          disabled={saving}
          onClick={() => save('taken')}
        >
          <IconCheck width={18} height={18} /> REGISTRAR DOSE
        </button>
        <button
          className="w-full text-center text-sm text-muted py-2"
          disabled={saving}
          onClick={() => save('skipped')}
        >
          Pular esta dose
        </button>
      </div>
    </BottomSheet>
  )
}
