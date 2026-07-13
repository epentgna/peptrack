import { useEffect, useState } from 'react'
import { DOSE_FACTOR, pickDoseUnit, trimNum, type DoseUnit } from '../lib/dose'

/**
 * Campo de dose com seletor de unidade (mcg / mg / g). Emite sempre o valor
 * convertido para mcg via onChangeMcg. Trocar a unidade preserva o valor real
 * (converte o texto). `resetKey` re-inicializa a partir de initialMcg.
 */
export function DoseInput({
  id,
  label = 'Dose',
  placeholder = 'ex.: 250',
  initialMcg,
  resetKey,
  onChangeMcg
}: {
  id?: string
  label?: string | null
  placeholder?: string
  initialMcg?: number | null
  resetKey?: unknown
  onChangeMcg: (mcg: number) => void
}) {
  const [unit, setUnit] = useState<DoseUnit>(() => pickDoseUnit(initialMcg))
  const [text, setText] = useState(() =>
    initialMcg && initialMcg > 0
      ? trimNum(initialMcg / DOSE_FACTOR[pickDoseUnit(initialMcg)])
      : ''
  )

  useEffect(() => {
    const u = pickDoseUnit(initialMcg)
    setUnit(u)
    setText(initialMcg && initialMcg > 0 ? trimNum(initialMcg / DOSE_FACTOR[u]) : '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey])

  function toMcg(t: string, u: DoseUnit): number {
    const n = parseFloat(t.replace(',', '.'))
    return isFinite(n) ? n * DOSE_FACTOR[u] : 0
  }

  function onText(t: string) {
    setText(t)
    onChangeMcg(toMcg(t, unit))
  }

  function onUnit(nu: DoseUnit) {
    // Mantém o valor real; converte o texto exibido.
    const mcg = toMcg(text, unit)
    const nt = mcg > 0 ? trimNum(mcg / DOSE_FACTOR[nu]) : text
    setUnit(nu)
    setText(nt)
    onChangeMcg(mcg)
  }

  return (
    <div>
      {label != null && (
        <label className="field-label" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="flex gap-2">
        <input
          id={id}
          inputMode="decimal"
          className="field flex-1"
          value={text}
          placeholder={placeholder}
          onChange={(e) => onText(e.target.value)}
        />
        <select
          aria-label="Unidade"
          className="field !w-[74px] px-2 text-center"
          value={unit}
          onChange={(e) => onUnit(e.target.value as DoseUnit)}
        >
          <option value="mcg" className="bg-card">
            mcg
          </option>
          <option value="mg" className="bg-card">
            mg
          </option>
          <option value="g" className="bg-card">
            g
          </option>
        </select>
      </div>
    </div>
  )
}
