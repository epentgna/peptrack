import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { IconChevron, IconCheck, IconClose, IconTrash } from '../components/icons'
import { formatTime, monthDay, weekdayLong, startOfDay } from '../lib/dates'
import { formatDose } from '../lib/dose'
import { refundDoseToVial } from '../lib/vials'
import type { Compound, DoseLog } from '../types'

export default function History() {
  const navigate = useNavigate()
  const logs = useLiveQuery(
    () => db.doseLogs.orderBy('loggedAt').reverse().toArray(),
    []
  )
  const compounds = useLiveQuery(() => db.compounds.toArray(), [])

  const compoundById = useMemo(() => {
    const m = new Map<number, Compound>()
    ;(compounds ?? []).forEach((c) => c.id != null && m.set(c.id, c))
    return m
  }, [compounds])

  const grouped = useMemo(() => {
    const map = new Map<number, DoseLog[]>()
    ;(logs ?? []).forEach((l) => {
      const day = startOfDay(l.scheduledFor)
      if (!map.has(day)) map.set(day, [])
      map.get(day)!.push(l)
    })
    return [...map.entries()].sort((a, b) => b[0] - a[0])
  }, [logs])

  async function removeLog(log: DoseLog) {
    if (log.id == null) return
    await db.doseLogs.delete(log.id)
    if (log.status === 'taken') {
      await refundDoseToVial(log.compoundId, log.doseMcg)
    }
  }

  if (!logs || !compounds) {
    return <div className="p-6 eyebrow">CARREGANDO…</div>
  }

  return (
    <div className="mx-auto w-full max-w-app min-h-full px-5 py-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-muted mb-4 font-mono text-[11px] tracking-widest uppercase"
      >
        <IconChevron width={16} height={16} className="rotate-180" /> Voltar
      </button>

      <div className="eyebrow mb-1.5">SYS.PROTOCOL // HISTÓRICO</div>
      <h1 className="text-2xl font-semibold text-ink mb-5">Histórico de doses</h1>

      {grouped.length === 0 ? (
        <p className="text-sm text-muted text-center py-10">
          Nenhuma dose registrada ainda.
        </p>
      ) : (
        <div className="space-y-6">
          {grouped.map(([day, dayLogs]) => (
            <div key={day}>
              <div className="sys-label text-cyan mb-2">
                {weekdayLong(day)} · {monthDay(day)}
              </div>
              <div className="space-y-2">
                {dayLogs
                  .sort((a, b) => b.loggedAt - a.loggedAt)
                  .map((log) => {
                    const c = compoundById.get(log.compoundId)
                    const taken = log.status === 'taken'
                    return (
                      <div key={log.id} className="card p-3.5 flex items-center gap-3">
                        <span
                          className={`flex items-center justify-center h-8 w-8 rounded-full border shrink-0 ${
                            taken
                              ? 'bg-cyan/15 border-cyan text-cyan'
                              : 'border-border text-muted'
                          }`}
                        >
                          {taken ? (
                            <IconCheck width={15} height={15} />
                          ) : (
                            <IconClose width={15} height={15} />
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-ink truncate">
                            {c?.name ?? 'Composto'}
                          </div>
                          <div className="text-sm text-muted">
                            {taken
                              ? [
                                  formatDose(log.doseMcg),
                                  log.site,
                                  formatTime(log.loggedAt)
                                ]
                                  .filter(Boolean)
                                  .join(' · ')
                              : 'Pulada'}
                          </div>
                          {log.notes && (
                            <div className="text-[12px] text-muted/80 mt-0.5 italic">
                              {log.notes}
                            </div>
                          )}
                        </div>
                        <button
                          aria-label="Excluir registro"
                          onClick={() => removeLog(log)}
                          className="h-9 w-9 flex items-center justify-center text-muted"
                        >
                          <IconTrash width={16} height={16} />
                        </button>
                      </div>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
