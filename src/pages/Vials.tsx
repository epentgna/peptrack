import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { Modal } from '../components/Modal'
import { Disclaimer } from '../components/Eyebrow'
import {
  IconChevron,
  IconVial,
  IconAlert,
  IconTrash,
  IconPlus
} from '../components/icons'
import { computeVialStatus, vialExpiryTs, startVial } from '../lib/vials'
import { totalMcgForVial } from '../lib/calc'
import { formatDose } from '../lib/dose'
import { monthDay } from '../lib/dates'
import type { Compound, Vial } from '../types'

export default function Vials() {
  const navigate = useNavigate()
  const vials = useLiveQuery(() => db.vials.toArray(), [])
  const compounds = useLiveQuery(() => db.compounds.orderBy('name').toArray(), [])
  const [adding, setAdding] = useState(false)

  const nameById = useMemo(() => {
    const m = new Map<number, string>()
    ;(compounds ?? []).forEach((c) => c.id != null && m.set(c.id, c.name))
    return m
  }, [compounds])

  const sorted = useMemo(() => {
    return (vials ?? [])
      .map((v) => ({ v, s: computeVialStatus(v) }))
      .sort((a, b) => {
        // Ativos primeiro; entre ativos, os com alerta antes; depois por vencimento.
        if (a.v.active !== b.v.active) return a.v.active ? -1 : 1
        if (a.s.alert !== b.s.alert) return a.s.alert ? -1 : 1
        return a.s.daysLeft - b.s.daysLeft
      })
  }, [vials])

  if (!vials || !compounds) {
    return <div className="p-6 eyebrow">CARREGANDO…</div>
  }

  async function remove(id?: number) {
    if (id != null) await db.vials.delete(id)
  }
  async function toggleActive(v: Vial) {
    await db.vials.update(v.id!, { active: !v.active })
  }

  return (
    <div className="mx-auto w-full max-w-app min-h-full px-5 py-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-muted mb-4 font-mono text-[11px] tracking-widest uppercase"
      >
        <IconChevron width={16} height={16} className="rotate-180" /> Voltar
      </button>

      <div className="eyebrow mb-1.5">SYS.VIALS // FRASCOS</div>
      <h1 className="text-2xl font-semibold text-ink mb-5">Frascos</h1>

      <button className="btn-primary mb-6" onClick={() => setAdding(true)}>
        <IconPlus width={18} height={18} /> Iniciar novo frasco
      </button>

      {sorted.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="mx-auto mb-4 h-14 w-14 rounded-2xl border border-border flex items-center justify-center">
            <IconVial width={26} height={26} className="text-cyan" />
          </div>
          <h2 className="text-lg font-semibold text-ink mb-1">Nenhum frasco</h2>
          <p className="text-sm text-muted">
            Ao iniciar um frasco, o app calcula o total em mcg e desconta a cada
            dose registrada do composto.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(({ v, s }) => (
            <div
              key={v.id}
              className={`card p-4 ${
                v.active && s.alert ? 'border-danger/40 bg-danger/[0.05]' : ''
              } ${!v.active ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <div className="font-medium text-ink truncate">
                    {nameById.get(v.compoundId) ?? 'Composto'}
                  </div>
                  <div className="text-[12px] text-muted">
                    {v.vialMg} mg + {v.bacMl} ml · reconstituído {monthDay(v.reconstitutedAt)}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {v.active && s.alert && (
                    <IconAlert width={16} height={16} className="text-danger" />
                  )}
                  <button
                    aria-label="Excluir frasco"
                    onClick={() => remove(v.id)}
                    className="h-8 w-8 flex items-center justify-center text-muted"
                  >
                    <IconTrash width={15} height={15} />
                  </button>
                </div>
              </div>

              <div className="flex items-end justify-between mb-2">
                <div>
                  <span className="stat-number text-2xl text-ink">
                    {s.balancePct.toFixed(0)}%
                  </span>
                  <span className="text-xs text-muted ml-1">
                    · {formatDose(v.remainingMcg)} de {formatDose(v.totalMcg)}
                  </span>
                </div>
                <div className="text-right">
                  <div className="stat-number text-lg text-ink">{s.daysLeft}</div>
                  <div className="text-[10px] text-muted">
                    {s.daysLeft === 1 ? 'dia p/ vencer' : 'dias p/ vencer'}
                  </div>
                </div>
              </div>

              <div className="h-1.5 rounded-full bg-border overflow-hidden mb-3">
                <div
                  className={`h-full transition-[width] duration-500 ${
                    s.alert ? 'bg-danger' : 'bg-cyan'
                  }`}
                  style={{ width: `${Math.max(2, s.balancePct)}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted">
                  Vence em {monthDay(vialExpiryTs(v))}
                </span>
                <button
                  onClick={() => toggleActive(v)}
                  className={`font-mono text-[10px] tracking-widest uppercase rounded-lg border px-3 py-1.5 ${
                    v.active ? 'border-cyan/50 text-cyan' : 'border-border text-muted'
                  }`}
                >
                  {v.active ? 'Ativo' : 'Inativo'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Disclaimer className="mt-6" />

      {adding && (
        <StartVialModal
          compounds={compounds}
          onClose={() => setAdding(false)}
          onDone={() => setAdding(false)}
        />
      )}
    </div>
  )
}

function StartVialModal({
  compounds,
  onClose,
  onDone
}: {
  compounds: Compound[]
  onClose: () => void
  onDone: () => void
}) {
  const [compoundId, setCompoundId] = useState(compounds[0]?.id ?? 0)
  const [vialMg, setVialMg] = useState('')
  const [bacMl, setBacMl] = useState('')
  const [days, setDays] = useState('28')

  const mg = parseFloat(vialMg)
  const total = mg > 0 ? totalMcgForVial(mg) : 0
  const valid = compoundId > 0 && mg > 0 && parseFloat(bacMl) > 0

  async function save() {
    if (!valid) return
    await startVial(compoundId, mg, parseFloat(bacMl), parseInt(days, 10) || 28)
    onDone()
  }

  return (
    <Modal open onClose={onClose} eyebrow="NEW.VIAL" title="Iniciar frasco">
      <div className="space-y-4">
        <div>
          <label className="field-label">Composto</label>
          <select
            className="field"
            value={compoundId}
            onChange={(e) => setCompoundId(Number(e.target.value))}
          >
            {compounds.map((c) => (
              <option key={c.id} value={c.id} className="bg-card">
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          <div>
            <label className="field-label">Frasco (mg)</label>
            <input
              inputMode="decimal"
              className="field !px-3"
              value={vialMg}
              onChange={(e) => setVialMg(e.target.value)}
              placeholder="10"
            />
          </div>
          <div>
            <label className="field-label">Água (ml)</label>
            <input
              inputMode="decimal"
              className="field !px-3"
              value={bacMl}
              onChange={(e) => setBacMl(e.target.value)}
              placeholder="2"
            />
          </div>
          <div>
            <label className="field-label">Validade (d)</label>
            <input
              inputMode="numeric"
              className="field !px-3"
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </div>
        </div>

        {total > 0 && (
          <div className="rounded-xl border border-border bg-white/[0.02] p-3 text-sm text-muted">
            Total do frasco:{' '}
            <span className="text-cyan stat-number">{formatDose(total)}</span> — o
            app desconta a cada dose registrada deste composto.
          </div>
        )}

        <button className="btn-primary" disabled={!valid} onClick={save}>
          <IconVial width={18} height={18} /> Iniciar frasco
        </button>
      </div>
    </Modal>
  )
}
