import { reconstitution } from '../lib/calc'
import { parseNum } from '../lib/dose'
import { SyringeSVG } from './SyringeSVG'

/**
 * Campos de reconstituição do frasco (mg + água BAC) que calculam e mostram
 * quantas unidades (UI) puxar na seringa U-100 para a dose informada.
 * Usado na criação/edição de itens de protocolo.
 */
export function ReconUnitsField({
  doseMcg,
  vialMg,
  bacMl,
  onVialMg,
  onBacMl,
  compact
}: {
  doseMcg: number
  vialMg: string
  bacMl: string
  onVialMg: (v: string) => void
  onBacMl: (v: string) => void
  compact?: boolean
}) {
  const result = reconstitution(
    parseNum(vialMg) || 0,
    parseNum(bacMl) || 0,
    doseMcg
  )

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="field-label">Frasco (mg)</label>
          <input
            inputMode="decimal"
            className="field"
            value={vialMg}
            onChange={(e) => onVialMg(e.target.value)}
            placeholder="ex.: 10"
          />
        </div>
        <div>
          <label className="field-label">Água BAC (ml)</label>
          <input
            inputMode="decimal"
            className="field"
            value={bacMl}
            onChange={(e) => onBacMl(e.target.value)}
            placeholder="ex.: 2"
          />
        </div>
      </div>

      {result.valid ? (
        <div className="mt-3 rounded-xl border border-cyan/40 bg-cyan/[0.06] p-3">
          <div className="flex items-baseline justify-between">
            <span className="sys-label text-cyan">PUXAR ATÉ</span>
            <span>
              <span className="stat-number text-2xl text-cyan">
                {result.units.toFixed(1)}
              </span>
              <span className="text-muted text-sm ml-1">UI</span>
            </span>
          </div>
          <div className="text-[11px] text-muted mt-0.5">
            {result.volumeMl.toFixed(3)} ml · {Math.round(result.concentration)} mcg/ml
          </div>
          {!compact && (
            <div className="mt-2">
              <SyringeSVG units={result.units} />
            </div>
          )}
        </div>
      ) : (
        <p className="mt-2 text-[11px] text-muted/80">
          Informe o frasco (mg) e a água BAC (ml) para calcular quantas UI puxar.
        </p>
      )}
    </div>
  )
}
