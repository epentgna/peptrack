import { INJECTION_SITES, type InjectionSite } from '../types'

interface SiteStat {
  count7d: number
  last: number | null
}

interface Zone {
  site: InjectionSite
  kind: 'ellipse' | 'rect'
  // centro para o texto
  cx: number
  cy: number
  // ellipse
  rx?: number
  ry?: number
  // rect
  x?: number
  y?: number
  w?: number
  h?: number
}

// Vista frontal em espelho: lado esquerdo (E) do usuário à esquerda da tela.
const ZONES: Zone[] = [
  { site: 'Deltoide E', kind: 'ellipse', cx: 55, cy: 78, rx: 16, ry: 20 },
  { site: 'Deltoide D', kind: 'ellipse', cx: 165, cy: 78, rx: 16, ry: 20 },
  { site: 'Abdômen E', kind: 'rect', x: 79, y: 116, w: 28, h: 46, cx: 93, cy: 139 },
  { site: 'Abdômen D', kind: 'rect', x: 113, y: 116, w: 28, h: 46, cx: 127, cy: 139 },
  { site: 'Coxa E', kind: 'rect', x: 76, y: 188, w: 30, h: 84, cx: 91, cy: 230 },
  { site: 'Coxa D', kind: 'rect', x: 114, y: 188, w: 30, h: 84, cx: 129, cy: 230 }
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
      return { fill: 'rgba(34,211,238,0.38)', stroke: '#22D3EE', sw: 2.2, dash: undefined }
    }
    if (suggested.has(site)) {
      return {
        fill: 'rgba(34,211,238,0.10)',
        stroke: 'rgba(34,211,238,0.6)',
        sw: 1.6,
        dash: '4 3'
      }
    }
    if (count > 0) {
      const a = Math.min(0.34, 0.12 + count * 0.08)
      return { fill: `rgba(244,63,94,${a})`, stroke: '#33405A', sw: 1, dash: undefined }
    }
    return { fill: '#0B1220', stroke: '#1B2A3F', sw: 1, dash: undefined }
  }

  return (
    <div>
      <svg
        viewBox="0 0 220 300"
        className="w-full h-auto max-h-[260px]"
        role="group"
        aria-label="Mapa de locais de aplicação"
      >
        {/* Silhueta decorativa */}
        <g fill="none" stroke="#1B2A3F" strokeWidth={1.5}>
          <circle cx="110" cy="34" r="19" />
          <path d="M96 52 h28 v6 q24 4 24 26 v70 q0 10 -6 18 l-6 60 M110 52 v0 M124 52 q-24 4 -24 26 v70 q0 10 6 18 l6 60" />
          <path d="M83 88 l-14 46 M137 88 l14 46" />
          <path d="M96 190 l-6 96 M124 190 l6 96" />
        </g>

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
              filter: z.site === selected ? 'drop-shadow(0 0 5px rgba(34,211,238,0.5))' : undefined
            },
            onClick: () => onSelect(z.site)
          }
          return (
            <g key={z.site}>
              {z.kind === 'ellipse' ? (
                <ellipse cx={z.cx} cy={z.cy} rx={z.rx} ry={z.ry} {...common} />
              ) : (
                <rect x={z.x} y={z.y} width={z.w} height={z.h} rx={8} {...common} />
              )}
              <text
                x={z.cx}
                y={z.cy + 4}
                textAnchor="middle"
                fontSize="11"
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

      {/* Botões-texto de apoio (acessibilidade / toque preciso) */}
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
