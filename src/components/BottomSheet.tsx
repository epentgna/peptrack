import { useEffect } from 'react'
import { IconClose } from './icons'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title?: React.ReactNode
  eyebrow?: string
  children: React.ReactNode
}

export function BottomSheet({
  open,
  onClose,
  title,
  eyebrow,
  children
}: BottomSheetProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_180ms_ease]"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-app bg-card border-t border-x border-border
          rounded-t-3xl px-5 pt-3 pb-8 animate-[slideUp_260ms_cubic-bezier(0.16,1,0.3,1)]
          max-h-[90vh] overflow-y-auto"
        style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            {eyebrow && <div className="eyebrow mb-1">{eyebrow}</div>}
            {title && (
              <h2 className="text-xl font-semibold text-ink">{title}</h2>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="text-muted p-2 -mr-2 -mt-1"
          >
            <IconClose width={20} height={20} />
          </button>
        </div>
        {children}
      </div>
      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  )
}
