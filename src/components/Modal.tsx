import { useEffect } from 'react'
import { IconClose } from './icons'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: React.ReactNode
  eyebrow?: string
  children: React.ReactNode
}

export function Modal({ open, onClose, title, eyebrow, children }: ModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-app card p-5 animate-[pop_200ms_ease]"
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            {eyebrow && <div className="eyebrow mb-1">{eyebrow}</div>}
            {title && <h2 className="text-xl font-semibold text-ink">{title}</h2>}
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
      <style>{`@keyframes pop { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  )
}
