import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { Header, IconButton } from '../components/Layout'
import { ProgressRing } from '../components/ProgressRing'
import { DoseSheet, type DoseTarget } from '../components/DoseSheet'
import { Disclaimer } from '../components/Eyebrow'
import { IconHistory, IconPlus, IconCheck, IconAlert, IconVial } from '../components/icons'
import { longDateHeadline, startOfDay, DAY_MS } from '../lib/dates'
import { formatDose } from '../lib/dose'
import { scheduledItemsForDay } from '../lib/adherence'
import { alertingVials, type VialStatus } from '../lib/vials'
import type { Compound, DoseLog, ProtocolItem } from '../types'

interface PlannedDose {
  item: ProtocolItem
  compound: Compound
  takenLog?: DoseLog
  skippedLog?: DoseLog
}

export default function Protocol() {
  const navigate = useNavigate()
  const today = startOfDay()
  const [target, setTarget] = useState<DoseTarget | null>(null)

  const items = useLiveQuery(() => db.protocolItems.toArray(), [])
  const compounds = useLiveQuery(() => db.compounds.toArray(), [])
  const todayLogs = useLiveQuery(
    () =>
      db.doseLogs
        .where('scheduledFor')
        .between(today, today + DAY_MS, true, false)
        .toArray(),
    [today]
  )
  const vialAlerts = useLiveQuery(() => alertingVials(), [])

  const compoundById = useMemo(() => {
    const m = new Map<number, Compound>()
    ;(compounds ?? []).forEach((c) => c.id != null && m.set(c.id, c))
    return m
  }, [compounds])

  const planned: PlannedDose[] = useMemo(() => {
    if (!items || !compounds) return []
    const scheduled = scheduledItemsForDay(items, today)
    return scheduled
      .map((item): PlannedDose | null => {
        const compound = compoundById.get(item.compoundId)
        if (!compound) return null
        const logs = (todayLogs ?? []).filter((l) => l.protocolItemId === item.id)
        return {
          item,
          compound,
          takenLog: logs.find((l) => l.status === 'taken'),
          skippedLog: logs.find((l) => l.status === 'skipped')
        }
      })
      .filter((x): x is PlannedDose => x !== null)
      .sort((a, b) => a.item.timeOfDay.localeCompare(b.item.timeOfDay))
  }, [items, compounds, todayLogs, today, compoundById])

  const totalPlanned = planned.length
  const takenCount = planned.filter((p) => p.takenLog).length
  const pct = totalPlanned === 0 ? 0 : Math.round((takenCount / totalPlanned) * 100)

  if (!items || !compounds) {
    return <div className="eyebrow animate-pulse py-10">CARREGANDO…</div>
  }

  const empty = totalPlanned === 0

  return (
    <>
      <Header
        eyebrow="SYS.PROTOCOL // HOJE"
        title={longDateHeadline(today)}
        right={
          <>
            <IconButton label="Frascos" onClick={() => navigate('/frascos')}>
              <IconVial width={20} height={20} />
            </IconButton>
            <IconButton label="Histórico" onClick={() => navigate('/historico')}>
              <IconHistory width={20} height={20} />
            </IconButton>
            <IconButton
              label="Gerenciar protocolo"
              variant="cyan"
              onClick={() => navigate('/protocolo/gerenciar')}
            >
              <IconPlus width={20} height={20} />
            </IconButton>
          </>
        }
      />

      {(vialAlerts ?? []).length > 0 && (
        <div className="space-y-2 mb-4">
          {(vialAlerts ?? []).map((v) => (
            <VialAlertCard
              key={v.vial.id}
              status={v}
              name={compoundById.get(v.vial.compoundId)?.name ?? 'Frasco'}
              onClick={() => navigate('/frascos')}
            />
          ))}
        </div>
      )}

      {empty ? (
        <EmptyProtocol onStart={() => navigate('/protocolo/gerenciar')} onOnboard={() => navigate('/onboarding')} />
      ) : (
        <>
          {/* Card de aderência do dia */}
          <div className="card p-5 mb-5 flex items-center justify-between">
            <div>
              <div className="sys-label mb-1 text-cyan">ADERÊNCIA // HOJE</div>
              <div className="flex items-end gap-1">
                <span className="stat-number text-6xl text-ink">{pct}</span>
                <span className="text-2xl text-muted mb-1.5">%</span>
              </div>
              <div className="text-sm text-muted mt-1">
                {takenCount} de {totalPlanned} doses aplicadas
              </div>
            </div>
            <ProgressRing progress={totalPlanned === 0 ? 0 : takenCount / totalPlanned} size={96} stroke={9}>
              <IconCheck
                width={26}
                height={26}
                className={pct === 100 ? 'text-cyan' : 'text-muted'}
              />
            </ProgressRing>
          </div>

          {/* Schedule */}
          <div className="flex items-center justify-between mb-3">
            <div className="sys-label text-cyan">SCHEDULE // HOJE</div>
            <Link to="/protocolo/gerenciar" className="font-mono text-[10px] tracking-[0.18em] text-muted uppercase">
              Gerenciar
            </Link>
          </div>

          <div className="space-y-2.5">
            {planned.map((p) => (
              <ScheduleCard
                key={p.item.id}
                planned={p}
                onOpen={() =>
                  setTarget({
                    compound: p.compound,
                    protocolItemId: p.item.id,
                    doseMcg: p.item.doseMcg,
                    timeOfDay: p.item.timeOfDay,
                    scheduledFor: today
                  })
                }
              />
            ))}
          </div>
        </>
      )}

      <Disclaimer className="mt-8" />

      <DoseSheet target={target} onClose={() => setTarget(null)} />
    </>
  )
}

function ScheduleCard({
  planned,
  onOpen
}: {
  planned: PlannedDose
  onOpen: () => void
}) {
  const { compound, item, takenLog, skippedLog } = planned
  const done = !!takenLog
  const skipped = !!skippedLog && !done
  return (
    <button
      onClick={onOpen}
      className={`card w-full p-4 flex items-center gap-3.5 text-left transition-opacity ${
        done || skipped ? 'opacity-55' : ''
      }`}
    >
      <span
        className={`flex items-center justify-center h-9 w-9 rounded-full border shrink-0 ${
          done
            ? 'bg-cyan/20 border-cyan text-cyan shadow-glow-sm'
            : skipped
              ? 'border-border text-muted'
              : 'border-border text-transparent'
        }`}
      >
        <IconCheck width={18} height={18} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-ink truncate">{compound.name}</div>
        <div className="text-sm text-muted">
          {formatDose(item.doseMcg)}{skipped ? ' · pulada' : ''}
        </div>
      </div>
      <div className="font-mono text-sm text-muted tabular-nums">{item.timeOfDay}</div>
    </button>
  )
}

function VialAlertCard({
  status,
  name,
  onClick
}: {
  status: VialStatus
  name: string
  onClick: () => void
}) {
  const msg = status.expiring
    ? `Frasco de ${name} vence em ${status.daysLeft} ${status.daysLeft === 1 ? 'dia' : 'dias'}`
    : `${name}: saldo baixo — prepare novo frasco`
  return (
    <button
      onClick={onClick}
      className="card w-full border-danger/40 bg-danger/[0.06] p-3.5 flex items-center gap-3 text-left"
    >
      <IconAlert width={20} height={20} className="text-danger shrink-0" />
      <div className="flex-1 text-sm text-ink">{msg}</div>
      <IconVial width={18} height={18} className="text-muted" />
    </button>
  )
}

function EmptyProtocol({
  onStart,
  onOnboard
}: {
  onStart: () => void
  onOnboard: () => void
}) {
  return (
    <div className="card p-8 text-center mt-4">
      <div className="mx-auto mb-4 h-14 w-14 rounded-2xl border border-border flex items-center justify-center">
        <IconPlus width={26} height={26} className="text-cyan" />
      </div>
      <h2 className="text-lg font-semibold text-ink mb-1">Nenhuma dose hoje</h2>
      <p className="text-sm text-muted mb-5">
        Monte seu protocolo para ver a agenda do dia e registrar doses.
      </p>
      <button className="btn-primary mb-2" onClick={onOnboard}>
        Montar meu protocolo
      </button>
      <button className="btn-ghost w-full" onClick={onStart}>
        Adicionar manualmente
      </button>
    </div>
  )
}
