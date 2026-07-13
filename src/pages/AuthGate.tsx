import { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { GoogleGlyph } from '../components/GoogleGlyph'
import { Disclaimer } from '../components/Eyebrow'
import { IconCheck, IconClose } from '../components/icons'

/** Porta de entrada obrigatória: sem sessão, o app não é acessível. */
export default function AuthGate() {
  const { signInGoogle, signInEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onGoogle() {
    setBusy(true)
    setError(null)
    const { error } = await signInGoogle()
    if (error) {
      setError(error)
      setBusy(false)
    }
    // Em caso de sucesso, o navegador redireciona para o Google.
  }

  async function onEmail() {
    const value = email.trim()
    if (!value) return
    setBusy(true)
    setError(null)
    const { error } = await signInEmail(value)
    setBusy(false)
    if (error) setError(error)
    else setSent(value)
  }

  return (
    <div className="mx-auto w-full max-w-app min-h-full px-6 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {/* Ícone de cadeado com brilho */}
        <div className="mb-8 h-24 w-24 rounded-full border border-cyan/30 bg-cyan/[0.06] flex items-center justify-center shadow-glow">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#22D3EE"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="4" y="10" width="16" height="10" rx="2.5" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            <circle cx="12" cy="15" r="1.4" fill="#22D3EE" stroke="none" />
          </svg>
        </div>

        {sent ? (
          <div className="w-full animate-[obFade_240ms_ease]">
            <div className="mx-auto mb-4 h-12 w-12 rounded-2xl border border-cyan/40 bg-cyan/10 flex items-center justify-center">
              <IconCheck width={22} height={22} className="text-cyan" />
            </div>
            <h1 className="text-2xl font-semibold text-ink mb-2">Link enviado</h1>
            <p className="text-muted mb-6">
              Abra o e‑mail em <span className="text-ink">{sent}</span> e toque no link
              para entrar. Depois volte para o app.
            </p>
            <button
              onClick={() => setSent(null)}
              className="text-sm text-muted underline"
            >
              Usar outro e‑mail
            </button>
          </div>
        ) : (
          <div className="w-full animate-[obFade_240ms_ease]">
            <div className="eyebrow mb-3">SYS.AUTH // REQUIRED</div>
            <h1 className="text-[30px] leading-tight font-semibold text-ink mb-3">
              Proteja seu protocolo
            </h1>
            <p className="text-muted text-[15px] leading-relaxed mb-8 px-2">
              Entre para salvar seu protocolo na sua conta e sincronizar entre
              aparelhos — nada se perde.
            </p>

            <button
              onClick={onGoogle}
              disabled={busy}
              className="btn-ghost w-full mb-4 !bg-white/[0.04] !py-3.5"
            >
              <GoogleGlyph /> Entrar com Google
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="h-px flex-1 bg-border" />
              <span className="font-mono text-[9px] tracking-widest text-muted uppercase">
                ou por e‑mail
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <input
              type="email"
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              className="field mb-2 text-center"
              placeholder="voce@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              onClick={onEmail}
              disabled={busy || !email.trim()}
              className="btn-primary"
            >
              Enviar link de acesso
            </button>

            {error && (
              <div className="mt-4 flex items-start gap-2 text-sm text-danger text-left">
                <IconClose width={16} height={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div
        className="pb-8 pt-4"
        style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
      >
        <Disclaimer className="text-center" />
      </div>

      <style>{`@keyframes obFade { from { opacity: 0; transform: translateY(8px);} to {opacity:1; transform:none;} }`}</style>
    </div>
  )
}
