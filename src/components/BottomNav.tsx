import { NavLink } from 'react-router-dom'
import {
  IconProtocol,
  IconProgress,
  IconLibrary,
  IconUser
} from './icons'

const tabs = [
  { to: '/', label: 'PROTOCOLO', Icon: IconProtocol, end: true },
  { to: '/progresso', label: 'PROGRESSO', Icon: IconProgress, end: false },
  { to: '/biblioteca', label: 'BIBLIOTECA', Icon: IconLibrary, end: false },
  { to: '/voce', label: 'VOCÊ', Icon: IconUser, end: false }
]

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app z-40
        bg-card/95 backdrop-blur border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-4">
        {tabs.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="relative flex flex-col items-center gap-1 py-2.5 min-h-[56px]"
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute top-0 h-0.5 w-8 rounded-full bg-cyan shadow-glow-sm" />
                )}
                <Icon
                  width={22}
                  height={22}
                  className={isActive ? 'text-cyan' : 'text-muted'}
                />
                <span
                  className={`font-mono text-[9px] tracking-[0.15em] ${
                    isActive ? 'text-cyan' : 'text-muted'
                  }`}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
