interface SyringeSVGProps {
  /** Unidades U-100 a preencher (0-100). */
  units: number
}

/** Ilustração de seringa U-100 com escala 0-100 e nível preenchido. */
export function SyringeSVG({ units }: SyringeSVGProps) {
  const clamped = Math.max(0, Math.min(100, units))
  // Corpo do cilindro: x de 40 a 250 (210 de largura = 100 unidades).
  const bodyX = 40
  const bodyW = 210
  const fillW = (clamped / 100) * bodyW

  const ticks = []
  for (let i = 0; i <= 100; i += 10) {
    const x = bodyX + (i / 100) * bodyW
    ticks.push(
      <g key={i}>
        <line x1={x} y1={20} x2={x} y2={i % 50 === 0 ? 34 : 28} stroke="#1B2A3F" strokeWidth={1.2} />
        {i % 50 === 0 && (
          <text
            x={x}
            y={14}
            fill="#8A97A8"
            fontSize={9}
            fontFamily="'JetBrains Mono', monospace"
            textAnchor="middle"
          >
            {i}
          </text>
        )}
      </g>
    )
  }

  return (
    <svg viewBox="0 0 300 80" className="w-full h-auto" role="img" aria-label={`Seringa com ${clamped.toFixed(1)} unidades`}>
      {ticks}
      {/* Corpo */}
      <rect x={bodyX} y={34} width={bodyW} height={22} rx={4} fill="#0B1220" stroke="#1B2A3F" strokeWidth={1.5} />
      {/* Nível preenchido */}
      <rect
        x={bodyX}
        y={34}
        width={fillW}
        height={22}
        rx={4}
        fill="#22D3EE"
        opacity={0.35}
        style={{ transition: 'width 400ms ease' }}
      />
      <rect
        x={bodyX}
        y={34}
        width={fillW}
        height={22}
        rx={4}
        fill="none"
        stroke="#22D3EE"
        strokeWidth={1.2}
        style={{ transition: 'width 400ms ease' }}
      />
      {/* Êmbolo (à direita) */}
      <rect x={bodyX + bodyW} y={30} width={8} height={30} rx={2} fill="#1B2A3F" />
      <line x1={bodyX + bodyW + 8} y1={45} x2={295} y2={45} stroke="#1B2A3F" strokeWidth={3} />
      <rect x={292} y={36} width={4} height={18} rx={2} fill="#1B2A3F" />
      {/* Agulha (à esquerda) */}
      <line x1={bodyX} y1={45} x2={6} y2={45} stroke="#8A97A8" strokeWidth={2} />
      <line x1={6} y1={45} x2={0} y2={45} stroke="#22D3EE" strokeWidth={2} />
    </svg>
  )
}
