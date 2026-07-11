import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, updateSettings } from '../db/db'
import { Disclaimer } from '../components/Eyebrow'
import { IconCheck, IconChevron } from '../components/icons'
import { weekdayShort } from '../lib/dates'
import { startOfDay } from '../lib/dates'
import type { Compound } from '../types'

interface DraftItem {
  doseMcg: string
  timeOfDay: string
  daysOfWeek: number[]
}

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]

export default function Onboarding() {
  const navigate = useNavigate()
  const compounds = useLiveQuery(() => db.compounds.orderBy('name').toArray(), [])
  const existingSettings = useLiveQuery(() => db.settings.get(1), [])

  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [drafts, setDrafts] = useState<Record<number, DraftItem>>({})
  const [saving, setSaving] = useState(false)

  if (!compounds) {
    return <div className="min-h-full flex items-center justify-center eyebrow">CARREGANDO…</div>
  }

  const selectedCompounds = compounds.filter((c) => c.id != null && selected.has(c.id))

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else {
        next.add(id)
        setDrafts((d) =>
          d[id]
            ? d
            : { ...d, [id]: { doseMcg: '', timeOfDay: '08:00', daysOfWeek: [...ALL_DAYS] } }
        )
      }
      return next
    })
  }

  function updateDraft(id: number, patch: Partial<DraftItem>) {
    setDrafts((d) => ({ ...d, [id]: { ...d[id], ...patch } }))
  }

  function toggleDay(id: number, day: number) {
    setDrafts((d) => {
      const cur = d[id]
      const has = cur.daysOfWeek.includes(day)
      return {
        ...d,
        [id]: {
          ...cur,
          daysOfWeek: has
            ? cur.daysOfWeek.filter((x) => x !== day)
            : [...cur.daysOfWeek, day].sort()
        }
      }
    })
  }

  async function finish() {
    setSaving(true)
    const start = startOfDay()
    const toAdd = selectedCompounds.map((c) => {
      const draft = drafts[c.id!]
      return {
        compoundId: c.id!,
        doseMcg: parseFloat(draft.doseMcg) || 0,
        timeOfDay: draft.timeOfDay,
        daysOfWeek: draft.daysOfWeek.length ? draft.daysOfWeek : [...ALL_DAYS],
        active: true,
        startDate: start
      }
    })
    if (toAdd.length) await db.protocolItems.bulkAdd(toAdd)
    await updateSettings({
      userName: name.trim() || existingSettings?.userName || 'Você',
      onboarded: true
    })
    navigate('/', { replace: true })
  }

  async function skip() {
    await updateSettings({ onboarded: true })
    navigate('/', { replace: true })
  }

  const canNext1 = true
  const canNext2 = selected.size > 0
  const canFinish = selectedCompounds.every((c) => {
    const d = drafts[c.id!]
    return d && parseFloat(d.doseMcg) > 0 && d.timeOfDay
  })

  return (
    <div className="mx-auto w-full max-w-app min-h-full px-5 py-8 flex flex-col">
      <div className="eyebrow mb-2">SYS.SETUP // ONBOARDING</div>
      <StepDots step={step} total={3} />

      <div className="flex-1">
        {step === 0 && (
          <section className="animate-[fadeIn_200ms_ease]">
            <h1 className="text-3xl font-semibold text-ink mb-2">Bem-vindo ao PepTrack</h1>
            <p className="text-muted mb-6">
              Um registro pessoal e offline do seu protocolo. Nada sai do seu dispositivo.
            </p>
            <label className="field-label" htmlFor="name">
              Como podemos te chamar?
            </label>
            <input
              id="name"
              className="field text-lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              autoFocus
            />
          </section>
        )}

        {step === 1 && (
          <section className="animate-[fadeIn_200ms_ease]">
            <h1 className="text-2xl font-semibold text-ink mb-1">Seu protocolo</h1>
            <p className="text-muted mb-5">
              Selecione os compostos que fazem parte do seu protocolo.
            </p>
            <div className="space-y-2">
              {compounds.map((c) => (
                <CompoundToggle
                  key={c.id}
                  compound={c}
                  checked={selected.has(c.id!)}
                  onToggle={() => toggle(c.id!)}
                />
              ))}
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="animate-[fadeIn_200ms_ease]">
            <h1 className="text-2xl font-semibold text-ink mb-1">Suas doses</h1>
            <p className="text-muted mb-5">
              Informe a <strong>sua</strong> dose, horário e dias. O app não sugere valores.
            </p>
            <div className="space-y-4">
              {selectedCompounds.map((c) => {
                const d = drafts[c.id!]
                return (
                  <div key={c.id} className="card p-4">
                    <div className="font-medium text-ink mb-3">{c.name}</div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="field-label">Dose (mcg)</label>
                        <input
                          inputMode="decimal"
                          className="field"
                          value={d.doseMcg}
                          onChange={(e) => updateDraft(c.id!, { doseMcg: e.target.value })}
                          placeholder="ex.: 250"
                        />
                      </div>
                      <div>
                        <label className="field-label">Horário</label>
                        <input
                          type="time"
                          className="field"
                          value={d.timeOfDay}
                          onChange={(e) => updateDraft(c.id!, { timeOfDay: e.target.value })}
                        />
                      </div>
                    </div>
                    <label className="field-label">Dias da semana</label>
                    <div className="flex gap-1.5 mt-1">
                      {ALL_DAYS.map((day) => (
                        <button
                          key={day}
                          onClick={() => toggleDay(c.id!, day)}
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
                )
              })}
            </div>
          </section>
        )}
      </div>

      <div className="pt-6 space-y-3">
        {step === 0 && (
          <>
            <button
              className="btn-primary"
              disabled={!canNext1}
              onClick={() => setStep(1)}
            >
              Continuar
            </button>
            <button className="w-full text-sm text-muted py-2" onClick={skip}>
              Pular por agora
            </button>
          </>
        )}
        {step === 1 && (
          <div className="flex gap-3">
            <button className="btn-ghost flex-1" onClick={() => setStep(0)}>
              Voltar
            </button>
            <button
              className="btn-primary flex-1"
              disabled={!canNext2}
              onClick={() => setStep(2)}
            >
              Continuar
            </button>
          </div>
        )}
        {step === 2 && (
          <div className="flex gap-3">
            <button className="btn-ghost flex-1" onClick={() => setStep(1)}>
              Voltar
            </button>
            <button
              className="btn-primary flex-1"
              disabled={!canFinish || saving}
              onClick={finish}
            >
              Criar protocolo
            </button>
          </div>
        )}
      </div>

      <Disclaimer className="mt-6" />
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(6px);} to {opacity:1; transform:none;} }`}</style>
    </div>
  )
}

function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-1.5 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-1 flex-1 rounded-full transition-colors ${
            i <= step ? 'bg-cyan' : 'bg-border'
          }`}
        />
      ))}
    </div>
  )
}

function CompoundToggle({
  compound,
  checked,
  onToggle
}: {
  compound: Compound
  checked: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className={`card w-full p-3.5 flex items-center gap-3 text-left ${
        checked ? 'border-cyan/60 bg-cyan/[0.06]' : ''
      }`}
    >
      <span
        className={`flex items-center justify-center h-6 w-6 rounded-md border shrink-0 ${
          checked ? 'bg-cyan border-cyan text-base' : 'border-border text-transparent'
        }`}
      >
        <IconCheck width={14} height={14} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-ink">{compound.name}</div>
        <div className="font-mono text-[10px] tracking-wider uppercase text-cyan">
          {compound.category}
        </div>
      </div>
      <IconChevron width={16} height={16} className="text-muted" />
    </button>
  )
}
