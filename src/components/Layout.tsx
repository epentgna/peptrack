import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'

export function Layout() {
  return (
    <div className="mx-auto w-full max-w-app min-h-full relative">
      <main
        className="px-5 pt-6"
        style={{ paddingBottom: 'calc(84px + env(safe-area-inset-bottom))' }}
      >
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

export function Header({
  eyebrow,
  title,
  right
}: {
  eyebrow: string
  title: React.ReactNode
  right?: React.ReactNode
}) {
  return (
    <header className="flex items-start justify-between gap-3 mb-5">
      <div className="min-w-0">
        <div className="eyebrow mb-1.5">{eyebrow}</div>
        <h1 className="text-[26px] leading-tight font-semibold text-ink">
          {title}
        </h1>
      </div>
      {right && <div className="flex items-center gap-2 shrink-0">{right}</div>}
    </header>
  )
}

export function IconButton({
  onClick,
  label,
  children,
  variant = 'ghost'
}: {
  onClick?: () => void
  label: string
  children: React.ReactNode
  variant?: 'ghost' | 'cyan'
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`flex items-center justify-center h-11 w-11 rounded-xl border transition-colors ${
        variant === 'cyan'
          ? 'border-cyan/70 bg-cyan/15 text-cyan shadow-glow-sm'
          : 'border-border bg-white/[0.02] text-ink active:bg-white/[0.05]'
      }`}
    >
      {children}
    </button>
  )
}
