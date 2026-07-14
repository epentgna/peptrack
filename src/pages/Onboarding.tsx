import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, updateSettings } from '../db/db'
import { Disclaimer } from '../components/Eyebrow'
import {
  IconCheck,
  IconChevron,
  IconProtocol,
  IconProgress,
  IconVial,
  IconCalculator,
  IconScale,
  IconUser,
  IconAlert,
  IconBell
} from '../components/icons'
import { weekdayShort, startOfDay } from '../lib/dates'
import { DoseInput } from '../components/DoseInput'
import { ReconUnitsField } from '../components/ReconUnitsField'
import type { Compound } from '../types'

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]

interface DraftItem {
  doseMcg: string
  timeOfDay: string
  daysOfWeek: number[]
  vialMg: string
  bacMl: string
}

const GOALS = [
  { label: 'Anti-idade', Icon: IconProgress },
  { label: 'Perda de gordura', Icon: IconScale },
  { label: 'Ganho muscular', Icon: IconProtocol },
  { label: 'Recuperação / lesão', Icon: IconVial },
  { label: 'Cognição / foco', Icon: IconProgress },
  { label: 'Sono', Icon: IconBell },
  { label: 'Pele / cabelo', Icon: IconUser },
  { label: 'Longevidade', Icon: IconProgress }
]

const EXPERIENCE = [
  {
    label: 'Primeira vez',
    tag: 'INICIANTE',
    desc: 'Nunca usei peptídeos. Preciso de orientação em tudo.',
    Icon: IconUser
  },
  {
    label: 'Alguma experiência',
    tag: 'INTERMEDIÁRIO',
    desc: 'Já usei 1–3 peptídeos. Confortável com o básico, quero otimizar.',
    Icon: IconProgress
  },
  {
    label: 'Avançado',
    tag: 'VETERANO',
    desc: 'Experiência com vários protocolos e stacks. Quero rastrear e ter insights.',
    Icon: IconVial
  }
]

const FRUSTRATIONS = [
  'A matemática da reconstituição me estressa',
  'Esqueço de aplicar as doses',
  'Perco o controle da validade dos frascos',
  'Não sei se está funcionando',
  'Informação espalhada em notas, prints e grupos'
]

const VALUE_SLIDES = [
  {
    eyebrow: 'SYS.VALUE // PROTOCOL',
    Icon: IconProtocol,
    title: 'Tudo em um só protocolo.',
    body: 'Acompanhe o que planejou, o que realmente aplicou e o que vem a seguir — sem vasculhar notas, prints ou grupos.'
  },
  {
    eyebrow: 'SYS.VALUE // PRECISION',
    Icon: IconCalculator,
    title: 'Chega de conta de cabeça.',
    body: 'A reconstituição é calculada pra você: quantas unidades puxar na seringa, com ilustração e rastreamento de frascos.'
  },
  {
    eyebrow: 'SYS.VALUE // PRIVACY',
    Icon: IconAlert,
    title: 'Seus dados, no seu aparelho.',
    body: 'Registro pessoal, offline. Nada sai do dispositivo sem você mandar. Apenas para referência educacional.'
  }
]

export default function Onboarding() {
  const navigate = useNavigate()
  const compounds = useLiveQuery(() => db.compounds.orderBy('name').toArray(), [])
  const existingSettings = useLiveQuery(() => db.settings.get(1), [])

  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [goals, setGoals] = useState<Set<string>>(new Set())
  const [experience, setExperience] = useState<string>('')
  const [frustrations, setFrustrations] = useState<Set<string>>(new Set())
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [drafts, setDrafts] = useState<Record<number, DraftItem>>({})
  const [saving, setSaving] = useState(false)

  // Sequência de passos.
  const STEPS = [
    'welcome',
    'value0',
    'value1',
    'value2',
    'goals',
    'experience',
    'frustrations',
    'compounds',
    'doses',
    'summary'
  ] as const
  type StepKey = (typeof STEPS)[number]
  const current: StepKey = STEPS[step]
  const total = STEPS.length

  const selectedCompounds = (compounds ?? []).filter(
    (c) => c.id != null && selected.has(c.id)
  )

  const dosesPerDay = useMemo(() => {
    // Média de doses por dia com base nos dias marcados de cada peptídeo.
    let sum = 0
    for (const c of selectedCompounds) {
      const d = drafts[c.id!]
      if (d) sum += d.daysOfWeek.length / 7
    }
    return Math.max(selectedCompounds.length ? 1 : 0, Math.round(sum))
  }, [selectedCompounds, drafts])

  if (!compounds) {
    return (
      <div className="min-h-full flex items-center justify-center eyebrow">
        CARREGANDO…
      </div>
    )
  }

  function next() {
    setStep((s) => Math.min(total - 1, s + 1))
  }
  function back() {
    setStep((s) => Math.max(0, s - 1))
  }

  function toggleSet<T>(
    set: Set<T>,
    value: T,
    setter: (s: Set<T>) => void
  ) {
    const nextSet = new Set(set)
    if (nextSet.has(value)) nextSet.delete(value)
    else nextSet.add(value)
    setter(nextSet)
  }

  function toggleCompound(id: number) {
    const nextSet = new Set(selected)
    if (nextSet.has(id)) nextSet.delete(id)
    else {
      nextSet.add(id)
      setDrafts((d) =>
        d[id]
          ? d
          : {
              ...d,
              [id]: {
                doseMcg: '',
                timeOfDay: '08:00',
                daysOfWeek: [...ALL_DAYS],
                vialMg: '',
                bacMl: ''
              }
            }
      )
    }
    setSelected(nextSet)
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
        startDate: start,
        vialMg: parseFloat(draft.vialMg) || undefined,
        bacMl: parseFloat(draft.bacMl) || undefined
      }
    })
    if (toAdd.length) await db.protocolItems.bulkAdd(toAdd)
    await updateSettings({
      userName: name.trim() || existingSettings?.userName || 'Você',
      onboarded: true,
      goals: [...goals],
      experienceLevel: experience,
      frustrations: [...frustrations]
    })
    navigate('/', { replace: true })
  }

  async function skip() {
    await updateSettings({ onboarded: true })
    navigate('/', { replace: true })
  }

  // Validação por passo.
  const canContinue = (() => {
    switch (current) {
      case 'goals':
        return goals.size > 0
      case 'experience':
        return experience !== ''
      case 'compounds':
        return selected.size > 0
      case 'doses':
        return selectedCompounds.every((c) => {
          const d = drafts[c.id!]
          return d && parseFloat(d.doseMcg) > 0 && d.timeOfDay
        })
      default:
        return true
    }
  })()

  const isLast = current === 'summary'

  return (
    <div className="mx-auto w-full max-w-app min-h-full px-5 flex flex-col">
      {/* Cabeçalho: voltar + barra de progresso tracejada */}
      <div className="flex items-center gap-3 pt-4 pb-6">
        <button
          onClick={step === 0 ? skip : back}
          aria-label="Voltar"
          className="h-11 w-11 shrink-0 flex items-center justify-center rounded-xl border border-border text-ink"
        >
          <IconChevron width={18} height={18} className="rotate-180" />
        </button>
        <div className="flex-1 flex gap-1">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-[3px] flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-cyan shadow-glow-sm' : 'bg-border'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1">
        {current === 'welcome' && (
          <Fade key="welcome">
            <div className="mx-auto mb-6 mt-4 h-20 w-20 rounded-3xl border border-cyan/40 bg-cyan/10 flex items-center justify-center shadow-glow">
              <IconProtocol width={38} height={38} className="text-cyan" />
            </div>
            <div className="eyebrow mb-2 text-center">SYS.SETUP // WELCOME</div>
            <h1 className="text-3xl font-semibold text-ink text-center mb-2">
              Bem-vindo ao PepTrack
            </h1>
            <p className="text-muted text-center mb-8 px-2">
              Um registro pessoal e offline do seu protocolo. Vamos montar o seu em
              menos de um minuto.
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
          </Fade>
        )}

        {(current === 'value0' ||
          current === 'value1' ||
          current === 'value2') && (
          <ValueSlide
            key={current}
            slide={
              VALUE_SLIDES[
                current === 'value0' ? 0 : current === 'value1' ? 1 : 2
              ]
            }
          />
        )}

        {current === 'goals' && (
          <Fade key="goals">
            <StepHead
              eyebrow="SYS.PROFILE // GOALS"
              title="Quais são seus objetivos?"
              hint="Selecione um ou mais."
            />
            <div className="grid grid-cols-2 gap-2.5">
              {GOALS.map(({ label, Icon }) => {
                const active = goals.has(label)
                return (
                  <button
                    key={label}
                    onClick={() => toggleSet(goals, label, setGoals)}
                    className={`card p-4 text-left flex flex-col gap-3 min-h-[104px] ${
                      active ? 'border-cyan/60 bg-cyan/[0.07] shadow-glow-sm' : ''
                    }`}
                  >
                    <span
                      className={`h-9 w-9 rounded-xl flex items-center justify-center border ${
                        active
                          ? 'border-cyan/50 bg-cyan/15 text-cyan'
                          : 'border-border text-muted'
                      }`}
                    >
                      <Icon width={18} height={18} />
                    </span>
                    <span
                      className={`text-sm font-medium ${active ? 'text-ink' : 'text-muted'}`}
                    >
                      {label}
                    </span>
                  </button>
                )
              })}
            </div>
          </Fade>
        )}

        {current === 'experience' && (
          <Fade key="experience">
            <StepHead
              eyebrow="SYS.PROFILE // EXPERIENCE"
              title="Qual sua experiência?"
            />
            <div className="space-y-2.5">
              {EXPERIENCE.map(({ label, tag, desc, Icon }) => {
                const active = experience === label
                return (
                  <button
                    key={label}
                    onClick={() => setExperience(label)}
                    className={`card w-full p-4 flex items-center gap-3.5 text-left ${
                      active ? 'border-cyan/60 bg-cyan/[0.07] shadow-glow-sm' : ''
                    }`}
                  >
                    <span
                      className={`h-11 w-11 shrink-0 rounded-xl flex items-center justify-center border ${
                        active
                          ? 'border-cyan/50 bg-cyan/15 text-cyan'
                          : 'border-border text-muted'
                      }`}
                    >
                      <Icon width={20} height={20} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink">{label}</span>
                        <span className="font-mono text-[9px] tracking-[0.15em] text-muted">
                          {tag}
                        </span>
                      </div>
                      <p className="text-[13px] text-muted mt-0.5">{desc}</p>
                    </div>
                    <span
                      className={`h-5 w-5 shrink-0 rounded-full border flex items-center justify-center ${
                        active ? 'border-cyan bg-cyan text-base' : 'border-border'
                      }`}
                    >
                      {active && <IconCheck width={12} height={12} />}
                    </span>
                  </button>
                )
              })}
            </div>
          </Fade>
        )}

        {current === 'frustrations' && (
          <Fade key="frustrations">
            <StepHead
              eyebrow="SYS.PROFILE // FRICTION"
              title="O que mais te incomoda hoje?"
              hint="Opcional — nos ajuda a destacar o que importa pra você."
            />
            <div className="space-y-2.5">
              {FRUSTRATIONS.map((f) => {
                const active = frustrations.has(f)
                return (
                  <button
                    key={f}
                    onClick={() => toggleSet(frustrations, f, setFrustrations)}
                    className={`card w-full p-3.5 flex items-center gap-3 text-left ${
                      active ? 'border-cyan/60 bg-cyan/[0.07]' : ''
                    }`}
                  >
                    <span
                      className={`h-6 w-6 shrink-0 rounded-md border flex items-center justify-center ${
                        active ? 'border-cyan bg-cyan text-base' : 'border-border text-transparent'
                      }`}
                    >
                      <IconCheck width={14} height={14} />
                    </span>
                    <span className={active ? 'text-ink' : 'text-muted'}>{f}</span>
                  </button>
                )
              })}
            </div>
          </Fade>
        )}

        {current === 'compounds' && (
          <Fade key="compounds">
            <StepHead
              eyebrow="SYS.PROTOCOL // COMPOUNDS"
              title="Seu protocolo"
              hint="Selecione os peptídeos que fazem parte do seu protocolo."
            />
            <div className="space-y-2">
              {compounds.map((c) => (
                <CompoundToggle
                  key={c.id}
                  compound={c}
                  checked={selected.has(c.id!)}
                  onToggle={() => toggleCompound(c.id!)}
                />
              ))}
            </div>
          </Fade>
        )}

        {current === 'doses' && (
          <Fade key="doses">
            <StepHead
              eyebrow="SYS.PROTOCOL // DOSING"
              title="Suas doses"
              hint="Informe a sua dose, horário e dias. O app não sugere valores."
            />
            <div className="space-y-4">
              {selectedCompounds.map((c) => {
                const d = drafts[c.id!]
                return (
                  <div key={c.id} className="card p-4">
                    <div className="font-medium text-ink mb-3">{c.name}</div>
                    <div className="grid grid-cols-2 gap-3 mb-3 items-start">
                      <DoseInput
                        label="Dose"
                        initialMcg={parseFloat(d.doseMcg) || null}
                        onChangeMcg={(mcg) =>
                          updateDraft(c.id!, { doseMcg: String(mcg) })
                        }
                      />
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
                    <div className="mt-3">
                      <div className="sys-label text-cyan mb-2">FRASCO // UI (opcional)</div>
                      <ReconUnitsField
                        doseMcg={parseFloat(d.doseMcg) || 0}
                        vialMg={d.vialMg}
                        bacMl={d.bacMl}
                        onVialMg={(v) => updateDraft(c.id!, { vialMg: v })}
                        onBacMl={(v) => updateDraft(c.id!, { bacMl: v })}
                        compact
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </Fade>
        )}

        {current === 'summary' && (
          <Fade key="summary">
            <div className="mx-auto mb-5 mt-2 h-16 w-16 rounded-2xl border border-cyan/40 bg-cyan/10 flex items-center justify-center shadow-glow">
              <IconCheck width={30} height={30} className="text-cyan" />
            </div>
            <div className="eyebrow mb-2">SYS.PROFILE // COMPILED</div>
            <h1 className="text-3xl font-semibold text-ink mb-1 leading-tight">
              Seu protocolo está pronto
            </h1>
            <p className="eyebrow !text-muted mb-5">Com base nas suas escolhas //</p>

            <div className="card p-4 mb-4 divide-y divide-border">
              <SummaryRow label="Nome" value={name.trim() || 'Você'} />
              {goals.size > 0 && (
                <SummaryRow label="Objetivos" value={[...goals].join(', ')} />
              )}
              {experience && <SummaryRow label="Experiência" value={experience} />}
              <SummaryRow
                label="Peptídeos"
                value={selectedCompounds.map((c) => c.name).join(', ') || '—'}
              />
            </div>

            <div className="card p-4">
              <div className="sys-label text-cyan mb-3">SEU PROTOCOLO INCLUI //</div>
              <div className="grid grid-cols-3 gap-2.5">
                <SummaryStat value={String(dosesPerDay)} label="DOSES/DIA" />
                <SummaryStat value={String(selectedCompounds.length)} label="PEPTÍDEOS" />
                <SummaryStat value="∞" label="OFFLINE" />
              </div>
            </div>

            <p className="text-[15px] leading-relaxed text-muted mt-5">
              Vamos rastrear cada dose, calcular a reconstituição exata e mostrar sua
              evolução conforme os dados crescem.
            </p>
          </Fade>
        )}
      </div>

      {/* Rodapé de ações */}
      <div
        className="pt-6 pb-6 space-y-3"
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
      >
        {isLast ? (
          <button className="btn-primary" disabled={saving} onClick={finish}>
            VER O QUE TEM DENTRO
          </button>
        ) : (
          <button className="btn-primary" disabled={!canContinue} onClick={next}>
            Continuar
          </button>
        )}
        {step === 0 && (
          <button className="w-full text-sm text-muted py-1" onClick={skip}>
            Pular por agora
          </button>
        )}
        {current !== 'summary' && <Disclaimer className="text-center pt-1" />}
      </div>
    </div>
  )
}

function Fade({ children }: { children: React.ReactNode }) {
  return (
    <div className="animate-[obFade_260ms_ease]">
      {children}
      <style>{`@keyframes obFade { from { opacity: 0; transform: translateY(8px);} to {opacity:1; transform:none;} }`}</style>
    </div>
  )
}

function StepHead({
  eyebrow,
  title,
  hint
}: {
  eyebrow: string
  title: string
  hint?: string
}) {
  return (
    <div className="mb-5">
      <div className="eyebrow mb-1.5">{eyebrow}</div>
      <h1 className="text-[26px] leading-tight font-semibold text-ink">{title}</h1>
      {hint && <p className="text-muted mt-2 text-sm">{hint}</p>}
    </div>
  )
}

function ValueSlide({
  slide
}: {
  slide: { eyebrow: string; Icon: typeof IconProtocol; title: string; body: string }
}) {
  const { eyebrow, Icon, title, body } = slide
  return (
    <Fade>
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-2">
        <div className="mb-8 h-24 w-24 rounded-full border border-cyan/30 bg-cyan/[0.06] flex items-center justify-center shadow-glow">
          <Icon width={40} height={40} className="text-cyan" />
        </div>
        <div className="eyebrow mb-3">{eyebrow}</div>
        <h1 className="text-[32px] leading-[1.1] font-semibold text-ink mb-4">
          {title}
        </h1>
        <p className="text-muted text-[15px] leading-relaxed max-w-[20rem]">{body}</p>
      </div>
    </Fade>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
      <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-muted w-24 shrink-0 pt-1">
        {label}
      </span>
      <span className="text-cyan font-medium flex-1">{value}</span>
    </div>
  )
}

function SummaryStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-white/[0.02] p-3 text-center">
      <div className="stat-number text-3xl text-cyan leading-none">{value}</div>
      <div className="font-mono text-[9px] tracking-[0.12em] text-muted uppercase mt-1.5">
        {label}
      </div>
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
