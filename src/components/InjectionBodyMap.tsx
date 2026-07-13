import { INJECTION_SITES, type InjectionSite } from '../types'

interface SiteStat {
  count7d: number
  last: number | null
}

interface Zone {
  site: InjectionSite
  kind: 'ellipse' | 'rect'
  cx: number
  cy: number
  r?: number
  x?: number
  y?: number
  w?: number
  h?: number
}

// Vista frontal em espelho: lado esquerdo (E) do usuário à esquerda da tela.
const ZONES: Zone[] = [
  { site: 'Deltoide E', kind: 'ellipse', cx: 72, cy: 66, r: 13 },
  { site: 'Deltoide D', kind: 'ellipse', cx: 128, cy: 66, r: 13 },
  { site: 'Abdômen E', kind: 'rect', x: 76, y: 104, w: 22, h: 34, cx: 87, cy: 121 },
  { site: 'Abdômen D', kind: 'rect', x: 102, y: 104, w: 22, h: 34, cx: 113, cy: 121 },
  { site: 'Coxa E', kind: 'rect', x: 78, y: 184, w: 17, h: 58, cx: 86, cy: 213 },
  { site: 'Coxa D', kind: 'rect', x: 105, y: 184, w: 17, h: 58, cx: 113, cy: 213 }
]

export function InjectionBodyMap({
  selected,
  onSelect,
  stats,
  suggested
}: {
  selected: InjectionSite
  onSelect: (s: InjectionSite) => void
  stats: Map<InjectionSite, SiteStat>
  suggested: Set<InjectionSite>
}) {
  function style(site: InjectionSite) {
    const count = stats.get(site)?.count7d ?? 0
    if (site === selected) {
      return { fill: 'rgba(34,211,238,0.40)', stroke: '#22D3EE', sw: 2, dash: undefined }
    }
    if (suggested.has(site)) {
      return {
        fill: 'rgba(34,211,238,0.12)',
        stroke: 'rgba(34,211,238,0.6)',
        sw: 1.6,
        dash: '4 3'
      }
    }
    if (count > 0) {
      const a = Math.min(0.34, 0.14 + count * 0.08)
      return { fill: `rgba(244,63,94,${a})`, stroke: '#3a4a63', sw: 1, dash: undefined }
    }
    return { fill: 'rgba(255,255,255,0.03)', stroke: '#26364f', sw: 1, dash: undefined }
  }

  return (
    <div>
      <svg
        viewBox="0 0 200 290"
        className="w-full h-auto max-h-[250px]"
        role="group"
        aria-label="Mapa de locais de aplicação"
      >
        <defs>
          <linearGradient id="bodyfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16223a" />
            <stop offset="100%" stopColor="#0e1626" />
          </linearGradient>
        </defs>

        {/* Silhueta preenchida */}
        <g fill="url(#bodyfill)" stroke="#26364f" strokeWidth={1}>
          <circle cx="100" cy="30" r="17" />
          <rect x="94" y="44" width="12" height="12" rx="4" />
          <path d="M70 60 Q100 52 130 60 L126 150 Q100 158 74 150 Z" />
          <circle cx="72" cy="66" r="14" />
          <circle cx="128" cy="66" r="14" />
          <rect x="52" y="66" width="15" height="82" rx="7" />
          <rect x="133" y="66" width="15" height="82" rx="7" />
          <path d="M74 146 L126 146 L124 178 L76 178 Z" />
          <rect x="76" y="172" width="21" height="104" rx="10" />
          <rect x="103" y="172" width="21" height="104" rx="10" />
        </g>

        {/* Zonas interativas */}
        {ZONES.map((z) => {
          const s = style(z.site)
          const count = stats.get(z.site)?.count7d ?? 0
          const common = {
            fill: s.fill,
            stroke: s.stroke,
            strokeWidth: s.sw,
            strokeDasharray: s.dash,
            style: {
              cursor: 'pointer',
              transition: 'fill 200ms ease, stroke 200ms ease',
              filter:
                z.site === selected
                  ? 'drop-shadow(0 0 5px rgba(34,211,238,0.5))'
                  : undefined
            },
            onClick: () => onSelect(z.site)
          }
          return (
            <g key={z.site}>
              {z.kind === 'ellipse' ? (
                <circle cx={z.cx} cy={z.cy} r={z.r} {...common} />
              ) : (
                <rect x={z.x} y={z.y} width={z.w} height={z.h} rx={7} {...common} />
              )}
              <text
                x={z.cx}
                y={z.cy + 3.5}
                textAnchor="middle"
                fontSize="10"
                fontFamily="'JetBrains Mono', monospace"
                fill={z.site === selected ? '#E8EEF6' : '#8A97A8'}
                style={{ pointerEvents: 'none' }}
              >
                {count > 0 ? `${count}×` : '·'}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Legenda */}
      <div className="flex items-center justify-center gap-4 mt-1">
        <LegendDot className="border-cyan/60 bg-cyan/10" label="sugerido" />
        <LegendDot className="border-danger/50 bg-danger/25" label="usado (7d)" />
      </div>

      {/* Botões-texto (toque preciso / acessibilidade) */}
      <div className="grid grid-cols-3 gap-1.5 mt-3">
        {INJECTION_SITES.map((s) => (
          <button
            key={s}
            onClick={() => onSelect(s)}
            className={`rounded-lg border py-1.5 font-mono text-[9px] tracking-wide uppercase ${
              s === selected
                ? 'border-cyan/70 bg-cyan/15 text-cyan'
                : suggested.has(s)
                  ? 'border-cyan/30 text-ink'
                  : 'border-border text-muted'
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[10px] text-muted">
      <span className={`h-2.5 w-2.5 rounded-full border ${className}`} />
      {label}
    </span>
  )
}
