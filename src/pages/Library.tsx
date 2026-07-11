import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { Header, IconButton } from '../components/Layout'
import { Modal } from '../components/Modal'
import { Disclaimer } from '../components/Eyebrow'
import { IconCalculator, IconChevron, IconVial, IconPlus } from '../components/icons'
import { CATEGORIES, type Category, type Compound } from '../types'

const FILTERS: (Category | 'Todos')[] = ['Todos', ...CATEGORIES]

export default function Library() {
  const navigate = useNavigate()
  const compounds = useLiveQuery(() => db.compounds.orderBy('name').toArray(), [])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Category | 'Todos'>('Todos')
  const [adding, setAdding] = useState(false)

  const filtered = useMemo(() => {
    return (compounds ?? []).filter((c) => {
      if (filter !== 'Todos' && c.category !== filter) return false
      if (query && !c.name.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
  }, [compounds, filter, query])

  if (!compounds) {
    return <div className="eyebrow animate-pulse py-10">CARREGANDO…</div>
  }

  return (
    <>
      <Header
        eyebrow="SYS.DATABASE // COMPOUNDS"
        title="Biblioteca"
        right={
          <IconButton
            label="Calculadora"
            onClick={() => navigate('/biblioteca/calculadora')}
          >
            <IconCalculator width={20} height={20} />
          </IconButton>
        }
      />

      <input
        className="field mb-3"
        placeholder="Buscar composto…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-5 px-5 scrollbar-none">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`chip whitespace-nowrap shrink-0 ${filter === f ? 'chip-active' : ''}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-2.5">
        {filtered.map((c) => (
          <button
            key={c.id}
            onClick={() => navigate(`/biblioteca/${c.id}`)}
            className="card w-full p-4 flex items-center gap-3.5 text-left"
          >
            <span className="flex items-center justify-center h-10 w-10 rounded-xl border border-border shrink-0">
              <IconVial width={20} height={20} className="text-cyan" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-ink truncate">{c.name}</div>
              <div className="font-mono text-[10px] tracking-wider uppercase text-cyan">
                {c.category}
              </div>
              {c.route && (
                <div className="text-[12px] text-muted truncate mt-0.5">{c.route}</div>
              )}
            </div>
            <IconChevron width={18} height={18} className="text-muted shrink-0" />
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted text-center py-8">
            Nenhum composto encontrado.
          </p>
        )}
      </div>

      <button className="btn-ghost w-full mt-5" onClick={() => setAdding(true)}>
        <IconPlus width={18} height={18} /> Adicionar composto
      </button>

      <Disclaimer className="mt-6" />

      {adding && (
        <AddCompoundModal
          onClose={() => setAdding(false)}
          onDone={(id) => {
            setAdding(false)
            navigate(`/biblioteca/${id}`)
          }}
        />
      )}
    </>
  )
}

/**
 * Modal de "Adicionar composto" com duas abas:
 * - Da biblioteca: escolher um dos compostos já existentes.
 * - Criar novo: cadastrar um composto do zero.
 */
function AddCompoundModal({
  onClose,
  onDone
}: {
  onClose: () => void
  onDone: (id: number) => void
}) {
  const compounds = useLiveQuery(() => db.compounds.orderBy('name').toArray(), [])
  const [tab, setTab] = useState<'pick' | 'create'>('pick')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    return (compounds ?? []).filter(
      (c) => !query || c.name.toLowerCase().includes(query.toLowerCase())
    )
  }, [compounds, query])

  return (
    <Modal open onClose={onClose} eyebrow="ADD.COMPOUND" title="Adicionar composto">
      {/* Abas */}
      <div className="grid grid-cols-2 gap-1 p-1 rounded-xl border border-border bg-white/[0.02] mb-4">
        {(
          [
            ['pick', 'Da biblioteca'],
            ['create', 'Criar novo']
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`py-2 rounded-lg font-mono text-[11px] tracking-wider uppercase transition-colors ${
              tab === key ? 'bg-cyan/15 text-cyan border border-cyan/50' : 'text-muted'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'pick' ? (
        <div>
          <input
            className="field mb-3"
            placeholder="Buscar na biblioteca…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <div className="space-y-2 max-h-[46vh] overflow-y-auto -mx-1 px-1">
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => c.id != null && onDone(c.id)}
                className="card w-full p-3.5 flex items-center gap-3 text-left"
              >
                <span className="flex items-center justify-center h-9 w-9 rounded-lg border border-border shrink-0">
                  <IconVial width={18} height={18} className="text-cyan" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-ink truncate">{c.name}</div>
                  <div className="font-mono text-[10px] tracking-wider uppercase text-cyan">
                    {c.category}
                  </div>
                </div>
                <IconChevron width={16} height={16} className="text-muted shrink-0" />
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-muted text-center py-6">
                Nenhum composto encontrado.
              </p>
            )}
          </div>
          <p className="mt-3 text-[11px] text-muted/80">
            Toque em um composto para ver a ficha e adicioná-lo ao seu protocolo.
          </p>
        </div>
      ) : (
        <CompoundFormFields onSaved={onDone} />
      )}
    </Modal>
  )
}

interface FormState {
  name: string
  category: Category
  route: string
  halfLife: string
  cycleNote: string
  description: string
  notes: string
  stackWith: string
}

export function CompoundForm({
  onClose,
  onSaved,
  initial
}: {
  onClose: () => void
  onSaved: (id: number) => void
  initial?: Compound
}) {
  return (
    <Modal
      open
      onClose={onClose}
      eyebrow={initial ? 'EDIT.COMPOUND' : 'NEW.COMPOUND'}
      title={initial ? 'Editar composto' : 'Novo composto'}
    >
      <CompoundFormFields onSaved={onSaved} initial={initial} />
    </Modal>
  )
}

/** Campos do formulário de composto (sem o wrapper de modal). */
export function CompoundFormFields({
  onSaved,
  initial
}: {
  onSaved: (id: number) => void
  initial?: Compound
}) {
  const [f, setF] = useState<FormState>({
    name: initial?.name ?? '',
    category: initial?.category ?? 'Outro',
    route: initial?.route ?? '',
    halfLife: initial?.halfLife ?? '',
    cycleNote: initial?.cycleNote ?? '',
    description: initial?.description ?? '',
    notes: initial?.notes ?? '',
    stackWith: (initial?.stackWith ?? []).join(', ')
  })

  async function save() {
    if (!f.name.trim()) return
    const payload = {
      name: f.name.trim(),
      category: f.category,
      route: f.route.trim() || undefined,
      halfLife: f.halfLife.trim() || undefined,
      cycleNote: f.cycleNote.trim() || undefined,
      description: f.description.trim() || undefined,
      notes: f.notes.trim() || undefined,
      defaultDoseMcg: initial?.defaultDoseMcg ?? null,
      stackWith: f.stackWith
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    }
    if (initial?.id != null) {
      await db.compounds.update(initial.id, payload)
      onSaved(initial.id)
    } else {
      const id = await db.compounds.add(payload as Compound)
      onSaved(id as number)
    }
  }

  return (
    <div className="space-y-3.5">
        <div>
          <label className="field-label">Nome</label>
          <input
            className="field"
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Categoria</label>
            <select
              className="field"
              value={f.category}
              onChange={(e) => setF({ ...f, category: e.target.value as Category })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-card">
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Via</label>
            <input
              className="field"
              value={f.route}
              onChange={(e) => setF({ ...f, route: e.target.value })}
              placeholder="Subcutânea"
            />
          </div>
        </div>
        <div>
          <label className="field-label">Meia-vida</label>
          <input
            className="field"
            value={f.halfLife}
            onChange={(e) => setF({ ...f, halfLife: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Ciclo</label>
          <input
            className="field"
            value={f.cycleNote}
            onChange={(e) => setF({ ...f, cycleNote: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Descrição</label>
          <textarea
            className="field min-h-[70px] resize-none"
            value={f.description}
            onChange={(e) => setF({ ...f, description: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Notas de reconstituição</label>
          <textarea
            className="field min-h-[60px] resize-none"
            value={f.notes}
            onChange={(e) => setF({ ...f, notes: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Stack sugerido (separado por vírgula)</label>
          <input
            className="field"
            value={f.stackWith}
            onChange={(e) => setF({ ...f, stackWith: e.target.value })}
            placeholder="BPC-157, TB-500"
          />
        </div>
        <button className="btn-primary" disabled={!f.name.trim()} onClick={save}>
          Salvar composto
        </button>
    </div>
  )
}
