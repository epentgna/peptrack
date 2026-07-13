import { useEffect, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { INJECTION_SITES, type InjectionSite, type Compound } from '../types'
import { BottomSheet } from './BottomSheet'
import { InjectionBodyMap } from './InjectionBodyMap'
import { DoseInput } from './DoseInput'
import { IconCheck } from './icons'
import { formatTime, DAY_MS, combineDayAndTime } from '../lib/dates'
import { deductDoseFromVial } from '../lib/vials'
import { scheduleTodayReminders } from '../lib/notifications'
import { isInjectable } from '../lib/compound'

export interface DoseTarget {
  compound: Compound
  protocolItemId?: number
  doseMcg: number
  timeOfDay: string
  scheduledFor: number // início do dia
}

const lastSiteKey = (compoundId: number) => `peptrack:lastSite:${compoundId}`

interface SiteStat {
  count7d: number
  last: number | null
}

/** Uso por local: contagem nos últimos 7 dias e última aplicação. */
function computeSiteStats(
  logs: { site?: InjectionSite; loggedAt: number }[]
): Map<InjectionSite, SiteStat> {
  const since = Date.now() - 7 * DAY_MS
  const map = new Map<InjectionSite, SiteStat>()
  INJECTION_SITES.forEach((s) => map.set(s, { count7d: 0, last: null }))
  for (const l of logs) {
    if (!l.site) continue
    const st = map.get(l.site)
    if (!st) continue
    if (l.loggedAt >= since) st.count7d++
    if (st.last == null || l.loggedAt > st.last) st.last = l.loggedAt
  }
  return map
}

/** Locais menos usados nos últimos 7 dias (sugestão de rotação). */
function suggestedFrom(stats: Map<InjectionSite, SiteStat>): Set<InjectionSite> {
  let min = Infinity
  stats.forEach((s) => (min = Math.min(min, s.count7d)))
  const set = new Set<InjectionSite>()
  stats.forEach((s, site) => {
    if (s.count7d === min) set.add(site)
  })
  return set
}

function lastUsedLabel(ts: number | null): string {
  if (ts == null) return 'nunca usado'
  const d = Math.floor((Date.now() - ts) / DAY_MS)
  return d <= 0 ? 'usado hoje' : d === 1 ? 'usado ontem' : `há ${d} dias`
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

  const siteStats = useMemo(
    () => computeSiteStats(recentLogs ?? []),
    [recentLogs]
  )
  const suggested = useMemo(() => suggestedFrom(siteStats), [siteStats])
  const injectable = isInjectable(target?.compound.route)

  const [doseMcg, setDoseMcg] = useState(0)
  const [time, setTime] = useState('')
  const [site, setSite] = useState<InjectionSite>('Abdômen SE')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!target) return
    setDoseMcg(target.doseMcg)
    setTime(target.timeOfDay || formatTime(Date.now()))
    setNotes('')
    // último local usado deste composto, ou o primeiro sugerido.
    const stored = localStorage.getItem(lastSiteKey(compoundId)) as InjectionSite | null
    if (stored && INJECTION_SITES.includes(stored)) {
      setSite(stored)
    } else {
      setSite('Abdômen SE')
    }
    setSaving(false)
  }, [target, compoundId])

  async function save(status: 'taken' | 'skipped') {
    if (!target || saving) return
    setSaving(true)
    const finalMcg = doseMcg || target.doseMcg
    const loggedAt =
      status === 'taken'
        ? combineDayAndTime(target.scheduledFor, time || formatTime(Date.now()))
        : Date.now()
    await db.doseLogs.add({
      protocolItemId: target.protocolItemId,
      compoundId: target.compound.id!,
      doseMcg: finalMcg,
      loggedAt,
      scheduledFor: target.scheduledFor,
      site: injectable ? site : undefined,
      status,
      notes: notes.trim() || undefined
    })
    if (status === 'taken') {
      if (injectable) localStorage.setItem(lastSiteKey(compoundId), site)
      await deductDoseFromVial(target.compound.id!, finalMcg)
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
        <div className="grid grid-cols-2 gap-3 items-start">
          <DoseInput
            id="dose-qty"
            label="Quantidade"
            initialMcg={target?.doseMcg}
            resetKey={target}
            onChangeMcg={setDoseMcg}
          />
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

        {injectable && (
          <div>
            <div className="field-label">Local da injeção</div>
            <div className="card bg-white/[0.02] p-3">
              <InjectionBodyMap
                selected={site}
                onSelect={setSite}
                stats={siteStats}
                suggested={suggested}
              />
            </div>
            <p className="mt-2 text-[11px] text-muted/80 leading-relaxed">
              Toque no local aplicado. Os pontos em <span className="text-cyan">ciano</span>{' '}
              são os menos usados nos últimos 7 dias (rotação sugerida). Em{' '}
              <span className="text-ink">{site}</span>: {lastUsedLabel(siteStats.get(site)!.last)}.
              <br />
              Rotacione entre regiões a cada aplicação e afaste ~2&nbsp;cm do ponto
              anterior — evita nódulos (lipo-hipertrofia). No abdômen, mantenha ~5&nbsp;cm
              de distância do umbigo.
            </p>
          </div>
        )}

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
