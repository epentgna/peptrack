import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { Modal } from '../components/Modal'
import { ReconCalculator } from '../components/ReconCalculator'
import { CompoundForm } from './Library'
import { Disclaimer } from '../components/Eyebrow'
import {
  IconChevron,
  IconEdit,
  IconPlus,
  IconVial,
  IconAlert
} from '../components/icons'
import { weekdayShort, startOfDay } from '../lib/dates'
import { computeVialStatus, activeVialForCompound } from '../lib/vials'
import { isInjectable } from '../lib/compound'
import type { Compound } from '../types'

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]

export default function CompoundDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const compoundId = Number(id)

  const compound = useLiveQuery(() => db.compounds.get(compoundId), [compoundId])
  const allCompounds = useLiveQuery(() => db.compounds.toArray(), [])
  const vial = useLiveQuery(() => activeVialForCompound(compoundId), [compoundId])
  const myItems = useLiveQuery(
    () =>
      db.protocolItems
        .where('compoundId')
        .equals(compoundId)
        .and((i) => i.active)
        .toArray(),
    [compoundId]
  )

  const [editing, setEditing] = useState(false)
  const [addToProtocol, setAddToProtocol] = useState(false)

  const stackLinks = useMemo(() => {
    if (!compound?.stackWith || !allCompounds) return []
    return compound.stackWith.map((name) => ({
      name,
      target: allCompounds.find((c) => c.name === name)
    }))
  }, [compound, allCompounds])

  if (compound === undefined) {
    return <div className="eyebrow animate-pulse py-10">CARREGANDO…</div>
  }
  if (!compound) {
    return (
      <div className="py-10 text-center text-muted">
        Composto não encontrado.
      </div>
    )
  }

  const injectable = isInjectable(compound.route)
  const vialStatus = injectable && vial ? computeVialStatus(vial) : null

  return (
    <>
      <button
        onClick={() => navigate('/biblioteca')}
        className="flex items-center gap-1 text-muted mb-4 font-mono text-[11px] tracking-widest uppercase"
      >
        <IconChevron width={16} height={16} className="rotate-180" /> Biblioteca
      </button>

      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="eyebrow mb-1.5">DB.COMPOUND</div>
          <h1 className="text-3xl font-semibold text-ink">{compound.name}</h1>
        </div>
        <button
          aria-label="Editar composto"
          onClick={() => setEditing(true)}
          className="h-11 w-11 flex items-center justify-center rounded-xl border border-border text-muted shrink-0"
        >
          <IconEdit width={18} height={18} />
        </button>
      </div>

      {/* Metadados */}
      <div className="flex flex-wrap gap-2 mb-5">
        <span className="chip chip-active !text-cyan">{compound.category}</span>
        {compound.halfLife && <span className="chip">t½ {compound.halfLife}</span>}
        {compound.route && <span className="chip">{compound.route}</span>}
      </div>

      {compound.cycleNote && (
        <div className="card p-4 mb-4">
          <div className="sys-label text-cyan mb-1.5">CICLO</div>
          <p className="text-sm text-ink/90">{compound.cycleNote}</p>
        </div>
      )}

      {compound.description && (
        <p className="text-[15px] leading-relaxed text-ink/85 mb-5">
          {compound.description}
        </p>
      )}

      {/* Frasco ativo */}
      {vialStatus && (
        <div
          className={`card p-4 mb-4 ${
            vialStatus.alert ? 'border-danger/40 bg-danger/[0.05]' : ''
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="sys-label text-cyan flex items-center gap-1.5">
              <IconVial width={13} height={13} /> FRASCO ATIVO
            </div>
            {vialStatus.alert && (
              <IconAlert width={16} height={16} className="text-danger" />
            )}
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="stat-number text-2xl text-ink">
                {vialStatus.balancePct.toFixed(0)}%
              </div>
              <div className="text-xs text-muted">saldo restante</div>
            </div>
            <div className="text-right">
              <div className="stat-number text-2xl text-ink">{vialStatus.daysLeft}</div>
              <div className="text-xs text-muted">
                {vialStatus.daysLeft === 1 ? 'dia p/ vencer' : 'dias p/ vencer'}
              </div>
            </div>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-border overflow-hidden">
            <div
              className="h-full bg-cyan transition-[width] duration-500"
              style={{ width: `${Math.max(2, vialStatus.balancePct)}%` }}
            />
          </div>
        </div>
      )}

      {/* Sua dose (do seu protocolo) — some quando não há dose definida. */}
      {(myItems && myItems.length > 0) || compound.defaultDoseMcg != null ? (
        <div className="card p-4 mb-4">
          <div className="sys-label text-cyan mb-2">SUA DOSE</div>
          {myItems && myItems.length > 0 ? (
            <div className="space-y-2">
              {myItems
                .slice()
                .sort((a, b) => a.timeOfDay.localeCompare(b.timeOfDay))
                .map((it) => (
                  <div key={it.id} className="flex items-baseline justify-between">
                    <span className="text-lg text-ink">
                      <span className="stat-number">{it.doseMcg}</span> mcg
                    </span>
                    <span className="font-mono text-sm text-muted tabular-nums">
                      {it.timeOfDay}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-lg text-ink">
              <span className="stat-number">{compound.defaultDoseMcg}</span> mcg
            </p>
          )}
        </div>
      ) : null}

      {/* Notas */}
      {compound.notes && (
        <div className="card p-4 mb-4">
          <div className="sys-label text-cyan mb-1.5">NOTAS</div>
          <p className="text-sm text-ink/90 leading-relaxed">{compound.notes}</p>
        </div>
      )}

      {/* Stack */}
      {stackLinks.length > 0 && (
        <div className="mb-4">
          <div className="sys-label text-cyan mb-2">COMMON.STACK</div>
          <div className="flex flex-wrap gap-2">
            {stackLinks.map((s) => (
              <button
                key={s.name}
                disabled={!s.target}
                onClick={() => s.target && navigate(`/biblioteca/${s.target.id}`)}
                className={`chip ${s.target ? 'text-ink border-cyan/40' : 'opacity-60'}`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reconstituição — só para injetáveis (orais não usam seringa/frasco). */}
      {injectable ? (
        <div className="mb-4">
          <div className="sys-label text-cyan mb-3">UTIL.RECONSTITUTION</div>
          <ReconCalculator
            compoundId={compoundId}
            defaultDoseMcg={compound.defaultDoseMcg ?? undefined}
          />
        </div>
      ) : (
        <div className="card p-4 mb-4">
          <div className="sys-label text-cyan mb-1.5">ADMINISTRAÇÃO</div>
          <p className="text-sm text-muted">
            Via {compound.route?.toLowerCase() || 'oral'} — sem reconstituição ou
            cálculo de seringa.
          </p>
        </div>
      )}

      <button className="btn-primary mt-2" onClick={() => setAddToProtocol(true)}>
        <IconPlus width={18} height={18} /> ADICIONAR AO PROTOCOLO
      </button>

      <Disclaimer className="mt-6" />

      {editing && allCompounds && (
        <CompoundForm
          initial={compound}
          onClose={() => setEditing(false)}
          onSaved={(id) => {
            setEditing(false)
            if (id !== compoundId) navigate(`/biblioteca/${id}`)
          }}
        />
      )}

      {addToProtocol && (
        <AddToProtocolModal
          compound={compound}
          onClose={() => setAddToProtocol(false)}
          onDone={() => {
            setAddToProtocol(false)
            navigate('/')
          }}
        />
      )}
    </>
  )
}

function AddToProtocolModal({
  compound,
  onClose,
  onDone
}: {
  compound: Compound
  onClose: () => void
  onDone: () => void
}) {
  const [dose, setDose] = useState(
    compound.defaultDoseMcg != null ? String(compound.defaultDoseMcg) : ''
  )
  const [time, setTime] = useState('08:00')
  const [days, setDays] = useState<number[]>([...ALL_DAYS])

  function toggleDay(d: number) {
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()
    )
  }

  async function save() {
    if (!(parseFloat(dose) > 0)) return
    await db.protocolItems.add({
      compoundId: compound.id!,
      doseMcg: parseFloat(dose),
      timeOfDay: time,
      daysOfWeek: days.length ? days : [...ALL_DAYS],
      active: true,
      startDate: startOfDay()
    })
    onDone()
  }

  return (
    <Modal
      open
      onClose={onClose}
      eyebrow="ADD.PROTOCOL"
      title={`Adicionar ${compound.name}`}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Dose (mcg)</label>
            <input
              inputMode="decimal"
              className="field"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              placeholder="ex.: 250"
              autoFocus
            />
          </div>
          <div>
            <label className="field-label">Horário</label>
            <input
              type="time"
              className="field"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="field-label">Dias da semana</label>
          <div className="flex gap-1.5 mt-1">
            {ALL_DAYS.map((day) => (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={`flex-1 h-10 rounded-lg border font-mono text-[10px] uppercase ${
                  days.includes(day)
                    ? 'border-cyan/70 bg-cyan/15 text-cyan'
                    : 'border-border text-muted'
                }`}
              >
                {weekdayShort(day).slice(0, 1)}
              </button>
            ))}
          </div>
        </div>
        <button className="btn-primary" disabled={!(parseFloat(dose) > 0)} onClick={save}>
          Adicionar ao protocolo
        </button>
      </div>
    </Modal>
  )
}
