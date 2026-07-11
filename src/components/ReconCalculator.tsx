import { useMemo, useState } from 'react'
import { db } from '../db/db'
import { reconstitution, totalMcgForVial } from '../lib/calc'
import { SyringeSVG } from './SyringeSVG'
import { IconVial } from './icons'

interface ReconCalculatorProps {
  /** Se informado, permite "Iniciar frasco" vinculado a este composto. */
  compoundId?: number
  defaultDoseMcg?: number
}

export function ReconCalculator({ compoundId, defaultDoseMcg }: ReconCalculatorProps) {
  const [vialMg, setVialMg] = useState('')
  const [bacMl, setBacMl] = useState('')
  const [doseMcg, setDoseMcg] = useState(defaultDoseMcg ? String(defaultDoseMcg) : '')
  const [beyondUseDays, setBeyondUseDays] = useState('28')
  const [started, setStarted] = useState<string | null>(null)

  const result = useMemo(
    () =>
      reconstitution(
        parseFloat(vialMg) || 0,
        parseFloat(bacMl) || 0,
        parseFloat(doseMcg) || 0
      ),
    [vialMg, bacMl, doseMcg]
  )

  async function startVial() {
    const mg = parseFloat(vialMg)
    const ml = parseFloat(bacMl)
    const days = parseInt(beyondUseDays, 10) || 28
    if (!(mg > 0) || !(ml > 0) || compoundId == null) return
    const total = totalMcgForVial(mg)
    // Desativa frascos anteriores do mesmo composto.
    const prev = await db.vials.where('compoundId').equals(compoundId).toArray()
    await Promise.all(
      prev.filter((v) => v.active).map((v) => db.vials.update(v.id!, { active: false }))
    )
    await db.vials.add({
      compoundId,
      vialMg: mg,
      bacMl: ml,
      reconstitutedAt: Date.now(),
      beyondUseDays: days,
      totalMcg: total,
      remainingMcg: total,
      active: true
    })
    setStarted(`Frasco iniciado · validade ${days} dias`)
    setTimeout(() => setStarted(null), 3000)
  }

  return (
    <div className="space-y-4">
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
          <label className="field-label">Água bac (ml)</label>
          <input
            inputMode="decimal"
            className="field !px-3"
            value={bacMl}
            onChange={(e) => setBacMl(e.target.value)}
            placeholder="2"
          />
        </div>
        <div>
          <label className="field-label">Dose (mcg)</label>
          <input
            inputMode="decimal"
            className="field !px-3"
            value={doseMcg}
            onChange={(e) => setDoseMcg(e.target.value)}
            placeholder="250"
          />
        </div>
      </div>

      <div className="card bg-white/[0.02] p-4">
        {result.valid ? (
          <>
            <div className="text-center mb-3">
              <div className="sys-label text-cyan mb-1">PUXAR ATÉ</div>
              <div className="flex items-end justify-center gap-1.5">
                <span className="stat-number text-4xl text-cyan">
                  {result.units.toFixed(1)}
                </span>
                <span className="text-muted mb-1.5">unidades</span>
              </div>
              <div className="text-sm text-muted mt-1">
                {result.volumeMl.toFixed(3)} ml ·{' '}
                {Math.round(result.concentration)} mcg/ml
              </div>
            </div>
            <SyringeSVG units={result.units} />
          </>
        ) : (
          <div className="text-center py-4">
            <SyringeSVG units={0} />
            <p className="text-sm text-muted mt-2">
              Informe frasco, água e dose para calcular.
            </p>
          </div>
        )}
      </div>

      {compoundId != null && (
        <div className="card p-4">
          <div className="sys-label text-cyan mb-3">UTIL.VIAL // RASTREAR FRASCO</div>
          <div className="flex items-end gap-3 mb-3">
            <div className="flex-1">
              <label className="field-label">Validade (dias)</label>
              <input
                inputMode="numeric"
                className="field"
                value={beyondUseDays}
                onChange={(e) => setBeyondUseDays(e.target.value)}
              />
            </div>
            <button
              className="btn-primary !w-auto px-5"
              disabled={!(parseFloat(vialMg) > 0 && parseFloat(bacMl) > 0)}
              onClick={startVial}
            >
              <IconVial width={18} height={18} /> Iniciar frasco
            </button>
          </div>
          {started && <div className="text-sm text-cyan">{started}</div>}
          <p className="text-[11px] text-muted/80">
            O app calcula o total em mcg e desconta a cada dose registrada deste composto.
          </p>
        </div>
      )}
    </div>
  )
}
