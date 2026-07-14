import { ADMIN_ROUTES, type AdminRoute } from '../lib/compound'

export function RouteSelect({
  value,
  onChange,
  label = 'Via de administração'
}: {
  value: AdminRoute
  onChange: (r: AdminRoute) => void
  label?: string | null
}) {
  return (
    <div>
      {label != null && <label className="field-label">{label}</label>}
      <select
        className="field"
        value={value}
        onChange={(e) => onChange(e.target.value as AdminRoute)}
      >
        {ADMIN_ROUTES.map((r) => (
          <option key={r.value} value={r.value} className="bg-card">
            {r.label}
          </option>
        ))}
      </select>
    </div>
  )
}
