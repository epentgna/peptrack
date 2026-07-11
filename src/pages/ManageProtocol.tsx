import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { Modal } from '../components/Modal'
import { IconChevron, IconEdit, IconTrash, IconPlus } from '../components/icons'
import { weekdayShort, startOfDay } from '../lib/dates'
import type { Compound, ProtocolItem } from '../types'

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]

interface Draft {
  id?: number
  compoundId: number
  doseMcg: string
  timeOfDay: string
  daysOfWeek: number[]
  active: boolean
}

export default function ManageProtocol() {
  const navigate = useNavigate()
  const items = useLiveQuery(() => db.protocolItems.toArray(), [])
  const compounds = useLiveQuery(() => db.compounds.orderBy('name').toArray(), [])
  const [editing, setEditing] = useState<Draft | null>(null)

  const compoundById = useMemo(() => {
    const m = new Map<number, Compound>()
    ;(compounds ?? []).forEach((c) => c.id != null && m.set(c.id, c))
    return m
  }, [compounds])

  if (!items || !compounds) {
    return <div className="p-6 eyebrow">CARREGANDO…</div>
  }

  function newDraft(): Draft {
    return {
      compoundId: compounds![0]?.id ?? 0,
      doseMcg: '',
      timeOfDay: '08:00',
      daysOfWeek: [...ALL_DAYS],
      active: true
    }
  }

  function editDraft(item: ProtocolItem): Draft {
    return {
      id: item.id,
      compoundId: item.compoundId,
      doseMcg: String(item.doseMcg),
      timeOfDay: item.timeOfDay,
      daysOfWeek: item.daysOfWeek,
      active: item.active
    }
  }

  async function toggleActive(item: ProtocolItem) {
    await db.protocolItems.update(item.id!, { active: !item.active })
  }

  async function remove(id: number) {
    await db.protocolItems.delete(id)
  }

  return (
    <div className="mx-auto w-full max-w-app min-h-full px-5 py-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-muted mb-4 font-mono text-[11px] tracking-widest uppercase"
      >
        <IconChevron width={16} height={16} className="rotate-180" /> Voltar
      </button>

      <div className="eyebrow mb-1.5">SYS.PROTOCOL // GERENCIAR</div>
      <h1 className="text-2xl font-semibold text-ink mb-5">Gerenciar protocolo</h1>

      <button className="btn-primary mb-3" onClick={() => setEditing(newDraft())}>
        <IconPlus width={18} height={18} /> Adicionar item
      </button>
      <button
        className="btn-ghost w-full mb-6"
        onClick={() => navigate('/onboarding')}
      >
        Refazer onboarding
      </button>

      {items.length === 0 ? (
        <p className="text-sm text-muted text-center py-8">
          Nenhum item ainda. Adicione o primeiro composto do seu protocolo.
        </p>
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => {
            const c = compoundById.get(item.compoundId)
            return (
              <div key={item.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-ink truncate">
                      {c?.name ?? 'Composto'}
                    </div>
                    <div className="text-sm text-muted">
                      {item.doseMcg} mcg · {item.timeOfDay}
                    </div>
                    <div className="flex gap-1 mt-2">
                      {ALL_DAYS.map((d) => (
                        <span
                          key={d}
                          className={`font-mono text-[9px] px-1 py-0.5 rounded ${
                            item.daysOfWeek.includes(d)
                              ? 'text-cyan'
                              : 'text-muted/40'
                          }`}
                        >
                          {weekdayShort(d).slice(0, 1)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      aria-label="Editar"
                      onClick={() => setEditing(editDraft(item))}
                      className="h-9 w-9 flex items-center justify-center text-muted"
                    >
                      <IconEdit width={17} height={17} />
                    </button>
                    <button
                      aria-label="Excluir"
                      onClick={() => item.id != null && remove(item.id)}
                      className="h-9 w-9 flex items-center justify-center text-danger"
                    >
                      <IconTrash width={17} height={17} />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => toggleActive(item)}
                  className={`mt-3 w-full rounded-lg border py-2 font-mono text-[10px] tracking-widest uppercase ${
                    item.active
                      ? 'border-cyan/50 text-cyan'
                      : 'border-border text-muted'
                  }`}
                >
                  {item.active ? 'Ativo' : 'Inativo'}
                </button>
              </div>
            )
          })}
        </div>
      )}

      {editing && (
        <ItemEditor
          draft={editing}
          compounds={compounds}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

function ItemEditor({
  draft,
  compounds,
  onClose
}: {
  draft: Draft
  compounds: Compound[]
  onClose: () => void
}) {
  const [d, setD] = useState<Draft>(draft)

  function toggleDay(day: number) {
    setD((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((x) => x !== day)
        : [...prev.daysOfWeek, day].sort()
    }))
  }

  async function save() {
    const payload = {
      compoundId: d.compoundId,
      doseMcg: parseFloat(d.doseMcg) || 0,
      timeOfDay: d.timeOfDay,
      daysOfWeek: d.daysOfWeek.length ? d.daysOfWeek : [...ALL_DAYS],
      active: d.active
    }
    if (d.id != null) {
      await db.protocolItems.update(d.id, payload)
    } else {
      await db.protocolItems.add({ ...payload, startDate: startOfDay() })
    }
    onClose()
  }

  const valid = d.compoundId > 0 && parseFloat(d.doseMcg) > 0 && !!d.timeOfDay

  return (
    <Modal
      open
      onClose={onClose}
      eyebrow={d.id != null ? 'EDIT.ITEM' : 'NEW.ITEM'}
      title={d.id != null ? 'Editar item' : 'Novo item'}
    >
      <div className="space-y-4">
        <div>
          <label className="field-label">Composto</label>
          <select
            className="field"
            value={d.compoundId}
            onChange={(e) => setD({ ...d, compoundId: Number(e.target.value) })}
          >
            {compounds.map((c) => (
              <option key={c.id} value={c.id} className="bg-card">
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Dose (mcg)</label>
            <input
              inputMode="decimal"
              className="field"
              value={d.doseMcg}
              onChange={(e) => setD({ ...d, doseMcg: e.target.value })}
              placeholder="ex.: 250"
            />
          </div>
          <div>
            <label className="field-label">Horário</label>
            <input
              type="time"
              className="field"
              value={d.timeOfDay}
              onChange={(e) => setD({ ...d, timeOfDay: e.target.value })}
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
                  d.daysOfWeek.includes(day)
                    ? 'border-cyan/70 bg-cyan/15 text-cyan'
                    : 'border-border text-muted'
                }`}
              >
                {weekdayShort(day).slice(0, 1)}
              </button>
            ))}
          </div>
        </div>
        <button className="btn-primary" disabled={!valid} onClick={save}>
          Salvar
        </button>
      </div>
    </Modal>
  )
}
