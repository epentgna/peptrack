import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid
} from 'recharts'
import { db } from '../db/db'
import { Header, IconButton } from '../components/Layout'
import { Modal } from '../components/Modal'
import { Disclaimer } from '../components/Eyebrow'
import { IconPlus, IconScale, IconTrash } from '../components/icons'
import {
  windowAdherence,
  currentStreak,
  totalDosesTaken,
  adherenceSeries
} from '../lib/adherence'
import {
  monthDay,
  toLocalInputValue,
  fromLocalInputValue,
  formatDateTime,
  DAY_MS
} from '../lib/dates'
import type { Measurement } from '../types'

export default function Progress() {
  const items = useLiveQuery(() => db.protocolItems.toArray(), [])
  const logs = useLiveQuery(() => db.doseLogs.toArray(), [])
  const measurements = useLiveQuery(
    () => db.measurements.orderBy('measuredAt').toArray(),
    []
  )
  const [showMeasure, setShowMeasure] = useState(false)

  const stats = useMemo(() => {
    if (!items || !logs) return null
    return {
      adherence30: Math.round(windowAdherence(items, logs, 30) * 100),
      streak: currentStreak(items, logs),
      total: totalDosesTaken(logs)
    }
  }, [items, logs])

  const series = useMemo(() => {
    if (!items || !logs) return []
    return adherenceSeries(items, logs, 30).map((d) => ({
      ...d,
      value: d.value ?? 0
    }))
  }, [items, logs])

  const weightSeries = useMemo(
    () =>
      (measurements ?? []).map((m) => ({
        t: m.measuredAt,
        label: monthDay(m.measuredAt),
        value: m.value
      })),
    [measurements]
  )

  const lastWeight = weightSeries[weightSeries.length - 1]
  const weightDelta = useMemo(() => {
    if (!measurements || measurements.length === 0) return null
    const now = measurements[measurements.length - 1]
    const cutoff = now.measuredAt - 30 * DAY_MS
    const past = measurements.find((m) => m.measuredAt >= cutoff) ?? measurements[0]
    return now.value - past.value
  }, [measurements])

  if (!stats) {
    return <div className="eyebrow animate-pulse py-10">CARREGANDO…</div>
  }

  return (
    <>
      <Header
        eyebrow="SYS.PROGRESS // BIOMETRICS"
        title="Progresso"
        right={
          <IconButton
            label="Registrar medição"
            variant="cyan"
            onClick={() => setShowMeasure(true)}
          >
            <IconPlus width={20} height={20} />
          </IconButton>
        }
      />

      <div className="grid grid-cols-3 gap-2.5 mb-5">
        <StatCard label="30 DIAS" value={`${stats.adherence30}%`} sub="aderência" />
        <StatCard label="STREAK" value={String(stats.streak)} sub="dias 100%" />
        <StatCard label="TOTAL" value={String(stats.total)} sub="doses" />
      </div>

      <div className="card p-4 mb-5">
        <div className="sys-label text-cyan mb-3">ADERÊNCIA // 30 DIAS</div>
        <div className="h-40 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 6, right: 6, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="adh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22D3EE" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#22D3EE" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1B2A3F" strokeDasharray="2 4" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: '#8A97A8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 50, 100]}
                tick={{ fill: '#8A97A8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                contentStyle={{
                  background: '#0B1220',
                  border: '1px solid #1B2A3F',
                  borderRadius: 12,
                  fontSize: 12
                }}
                labelStyle={{ color: '#8A97A8' }}
                formatter={(v: number) => [`${v}%`, 'Aderência']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#22D3EE"
                strokeWidth={2}
                fill="url(#adh)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Peso */}
      <div className="card p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="sys-label text-cyan">PESO // KG</div>
          {lastWeight && (
            <div className="text-right">
              <span className="stat-number text-xl text-ink">
                {lastWeight.value.toFixed(1)}
              </span>
              <span className="text-sm text-muted ml-1">kg</span>
              {weightDelta != null && weightSeries.length > 1 && (
                <span
                  className={`ml-2 text-xs font-mono ${
                    weightDelta <= 0 ? 'text-cyan' : 'text-muted'
                  }`}
                >
                  {weightDelta > 0 ? '+' : ''}
                  {weightDelta.toFixed(1)} 30d
                </span>
              )}
            </div>
          )}
        </div>

        {weightSeries.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-3 h-12 w-12 rounded-2xl border border-border flex items-center justify-center">
              <IconScale width={24} height={24} className="text-muted" />
            </div>
            <div className="font-medium text-ink mb-1">Sem dados de peso</div>
            <p className="text-sm text-muted mb-4">
              Registre suas medições para acompanhar a evolução.
            </p>
            <button className="btn-primary" onClick={() => setShowMeasure(true)}>
              Registrar medição
            </button>
          </div>
        ) : (
          <div className="h-40 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightSeries} margin={{ top: 6, right: 6, bottom: 0, left: -16 }}>
                <CartesianGrid stroke="#1B2A3F" strokeDasharray="2 4" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#8A97A8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tick={{ fill: '#8A97A8', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                />
                <Tooltip
                  contentStyle={{
                    background: '#0B1220',
                    border: '1px solid #1B2A3F',
                    borderRadius: 12,
                    fontSize: 12
                  }}
                  labelStyle={{ color: '#8A97A8' }}
                  formatter={(v: number) => [`${v} kg`, 'Peso']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#22D3EE"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#22D3EE' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {measurements && measurements.length > 0 && (
        <MeasurementList measurements={measurements} />
      )}

      <Disclaimer className="mt-6" />

      {showMeasure && <MeasureModal onClose={() => setShowMeasure(false)} />}
    </>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="card p-3.5 text-center">
      <div className="font-mono text-[9px] tracking-[0.15em] text-cyan uppercase mb-1">
        {label}
      </div>
      <div className="stat-number text-2xl text-ink leading-none">{value}</div>
      <div className="text-[10px] text-muted mt-1">{sub}</div>
    </div>
  )
}

function MeasurementList({ measurements }: { measurements: Measurement[] }) {
  async function remove(id?: number) {
    if (id != null) await db.measurements.delete(id)
  }
  return (
    <div className="mb-6">
      <div className="sys-label text-cyan mb-2">MEDIÇÕES</div>
      <div className="space-y-2">
        {[...measurements]
          .sort((a, b) => b.measuredAt - a.measuredAt)
          .map((m) => (
            <div key={m.id} className="card p-3 flex items-center gap-3">
              <IconScale width={18} height={18} className="text-muted" />
              <div className="flex-1">
                <span className="stat-number text-ink">{m.value.toFixed(1)}</span>
                <span className="text-sm text-muted ml-1">kg</span>
              </div>
              <div className="text-xs text-muted font-mono">
                {formatDateTime(m.measuredAt)}
              </div>
              <button
                aria-label="Excluir"
                onClick={() => remove(m.id)}
                className="h-8 w-8 flex items-center justify-center text-muted"
              >
                <IconTrash width={15} height={15} />
              </button>
            </div>
          ))}
      </div>
    </div>
  )
}

function MeasureModal({ onClose }: { onClose: () => void }) {
  const [value, setValue] = useState('')
  const [when, setWhen] = useState(toLocalInputValue(Date.now()))

  async function save() {
    const v = parseFloat(value)
    if (!(v > 0)) return
    await db.measurements.add({
      type: 'weight',
      value: v,
      unit: 'kg',
      measuredAt: fromLocalInputValue(when)
    })
    onClose()
  }

  return (
    <Modal open onClose={onClose} eyebrow="LOG.WEIGHT // MEDIÇÃO" title="Registrar peso">
      <div className="space-y-4">
        <div>
          <label className="field-label">Peso (kg)</label>
          <input
            inputMode="decimal"
            className="field text-lg"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="ex.: 82.5"
            autoFocus
          />
        </div>
        <div>
          <label className="field-label">Data e hora</label>
          <input
            type="datetime-local"
            className="field"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
          />
        </div>
        <button className="btn-primary" disabled={!(parseFloat(value) > 0)} onClick={save}>
          Salvar medição
        </button>
      </div>
    </Modal>
  )
}
