import { useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, updateSettings, wipeDatabase } from '../db/db'
import { Header } from '../components/Layout'
import { Modal } from '../components/Modal'
import { Disclaimer } from '../components/Eyebrow'
import {
  IconUser,
  IconEdit,
  IconDownload,
  IconUpload,
  IconTrash,
  IconBell,
  IconCheck,
  IconClose
} from '../components/icons'
import { downloadExport, importFromFile } from '../lib/export'
import {
  requestNotificationPermission,
  notificationsSupported,
  scheduleTodayReminders
} from '../lib/notifications'
import { useAuth } from '../auth/AuthProvider'
import { useSyncState } from '../hooks/useSyncState'
import { resyncNow } from '../lib/sync'
import { GoogleGlyph } from '../components/GoogleGlyph'
import { formatTime } from '../lib/dates'

const APP_VERSION = '1.1.0'

export default function You() {
  const settings = useLiveQuery(() => db.settings.get(1), [])
  const [editName, setEditName] = useState(false)
  const [confirmWipe, setConfirmWipe] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function flash(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2600)
  }

  async function toggleNotifications() {
    if (!settings) return
    const next = !settings.notificationsEnabled
    if (next) {
      const granted = await requestNotificationPermission()
      if (!granted) {
        flash('Permissão de notificação negada')
        return
      }
    }
    await updateSettings({ notificationsEnabled: next })
    await scheduleTodayReminders()
    flash(next ? 'Notificações ativadas' : 'Notificações desativadas')
  }

  async function onExport() {
    await downloadExport()
    flash('Backup exportado')
  }

  async function onImportFile(file: File) {
    try {
      await importFromFile(file)
      flash('Backup restaurado')
    } catch {
      flash('Arquivo inválido')
    }
  }

  if (!settings) {
    return <div className="eyebrow animate-pulse py-10">CARREGANDO…</div>
  }

  return (
    <>
      <Header eyebrow="SYS.USER // PROFILE" title="Você" />

      {/* Perfil */}
      <div className="card p-5 mb-5 flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl border border-cyan/40 bg-cyan/10 flex items-center justify-center shadow-glow-sm">
          <IconUser width={26} height={26} className="text-cyan" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-ink truncate">
              {settings.userName || 'Você'}
            </span>
            <button
              aria-label="Editar nome"
              onClick={() => setEditName(true)}
              className="text-muted"
            >
              <IconEdit width={15} height={15} />
            </button>
          </div>
          <span className="inline-block mt-1 font-mono text-[9px] tracking-[0.2em] uppercase text-cyan border border-cyan/40 rounded px-1.5 py-0.5">
            FREE
          </span>
        </div>
      </div>

      {/* Conta / Sincronização */}
      <AccountSection />

      {/* Preferências */}
      <SectionLabel>PREFERÊNCIAS</SectionLabel>
      <div className="card divide-y divide-border mb-5">
        <Row label="Unidades" value="Métrico" />
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <IconBell width={18} height={18} className="text-muted" />
            <div>
              <div className="text-ink">Notificações</div>
              <div className="text-[11px] text-muted">
                Lembrete no horário de cada dose
              </div>
            </div>
          </div>
          <Toggle
            on={settings.notificationsEnabled}
            disabled={!notificationsSupported()}
            onClick={toggleNotifications}
          />
        </div>
      </div>

      {/* Dados */}
      <SectionLabel>DADOS</SectionLabel>
      <div className="card divide-y divide-border mb-5">
        <ActionRow icon={<IconDownload width={18} height={18} />} label="Exportar dados" onClick={onExport} />
        <ActionRow
          icon={<IconUpload width={18} height={18} />}
          label="Importar backup"
          onClick={() => fileRef.current?.click()}
        />
        <ActionRow
          icon={<IconTrash width={18} height={18} />}
          label="Limpar todos os dados"
          danger
          onClick={() => setConfirmWipe(true)}
        />
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onImportFile(f)
          e.target.value = ''
        }}
      />

      {/* Sobre */}
      <SectionLabel>SOBRE</SectionLabel>
      <div className="card mb-6">
        <Row label="Versão" value={APP_VERSION} />
      </div>

      <p className="text-center text-[11px] text-muted/70 mb-2">
        Registro pessoal apenas. Não constitui orientação médica.
      </p>
      <Disclaimer className="text-center" />

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-card border border-cyan/40 text-ink text-sm px-4 py-2.5 rounded-xl shadow-glow-sm">
          {toast}
        </div>
      )}

      {editName && (
        <NameModal
          initial={settings.userName}
          onClose={() => setEditName(false)}
          onSave={async (name) => {
            await updateSettings({ userName: name })
            setEditName(false)
          }}
        />
      )}

      {confirmWipe && (
        <WipeModal
          onClose={() => setConfirmWipe(false)}
          onDone={async () => {
            await wipeDatabase()
            setConfirmWipe(false)
            flash('Dados apagados')
          }}
        />
      )}
    </>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="sys-label text-cyan mb-2">{children}</div>
}

function AccountSection() {
  const { configured, ready, user, signInGoogle, signInEmail, signOut } = useAuth()
  const { status, lastSyncedAt } = useSyncState()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!configured) return null

  const statusLabel =
    status === 'syncing'
      ? 'Sincronizando…'
      : status === 'error'
        ? 'Erro ao sincronizar'
        : lastSyncedAt
          ? `Sincronizado às ${formatTime(lastSyncedAt)}`
          : 'Sincronizado'

  async function onGoogle() {
    setBusy(true)
    setError(null)
    const { error } = await signInGoogle()
    if (error) setError(error)
    setBusy(false)
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
    <>
      <SectionLabel>CONTA // SYNC</SectionLabel>
      <div className="card p-4 mb-5">
        {!ready ? (
          <div className="text-sm text-muted py-2">Verificando sessão…</div>
        ) : user ? (
          <div>
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-xl border border-cyan/40 bg-cyan/10 flex items-center justify-center shadow-glow-sm">
                <IconUser width={18} height={18} className="text-cyan" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-ink truncate">{user.email}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      status === 'error'
                        ? 'bg-danger'
                        : status === 'syncing'
                          ? 'bg-cyan animate-pulse'
                          : 'bg-cyan'
                    }`}
                  />
                  <span className="text-[11px] text-muted">{statusLabel}</span>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="font-mono text-[10px] tracking-widest uppercase text-muted border border-border rounded-lg px-3 py-2"
              >
                Sair
              </button>
            </div>
            <button
              onClick={() => resyncNow()}
              className="btn-ghost w-full mt-3"
            >
              Sincronizar agora
            </button>
            <p className="text-[11px] text-muted/80 mt-3">
              Seu protocolo, doses e medições sincronizam automaticamente entre seus
              aparelhos. O app puxa o mais recente ao ser reaberto.
            </p>
          </div>
        ) : sent ? (
          <div className="text-center py-2">
            <div className="mx-auto mb-3 h-11 w-11 rounded-2xl border border-cyan/40 bg-cyan/10 flex items-center justify-center">
              <IconCheck width={20} height={20} className="text-cyan" />
            </div>
            <div className="text-ink font-medium mb-1">Link enviado</div>
            <p className="text-sm text-muted">
              Abra o e-mail em <span className="text-ink">{sent}</span> e toque no link
              para entrar. Pode fechar esta tela.
            </p>
            <button
              onClick={() => setSent(null)}
              className="mt-3 text-[12px] text-muted underline"
            >
              Usar outro e-mail
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="eyebrow">SYS.AUTH // OPCIONAL</span>
            </div>
            <p className="text-sm text-muted mb-4">
              Entre para sincronizar entre aparelhos. Se preferir, deixe em branco — o
              app funciona 100% offline sem conta.
            </p>

            <button
              onClick={onGoogle}
              disabled={busy}
              className="btn-ghost w-full mb-3 !bg-white/[0.04]"
            >
              <GoogleGlyph /> Entrar com Google
            </button>

            <div className="flex items-center gap-3 my-3">
              <span className="h-px flex-1 bg-border" />
              <span className="font-mono text-[9px] tracking-widest text-muted uppercase">
                ou por e-mail
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <input
              type="email"
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              className="field mb-2"
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
              <div className="mt-3 flex items-start gap-2 text-sm text-danger">
                <IconClose width={16} height={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-4">
      <span className="text-ink">{label}</span>
      <span className="text-muted font-mono text-sm">{value}</span>
    </div>
  )
}

function ActionRow({
  icon,
  label,
  onClick,
  danger
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 text-left active:bg-white/[0.03]"
    >
      <span className={danger ? 'text-danger' : 'text-muted'}>{icon}</span>
      <span className={danger ? 'text-danger' : 'text-ink'}>{label}</span>
    </button>
  )
}

function Toggle({
  on,
  onClick,
  disabled
}: {
  on: boolean
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onClick}
      className={`relative h-7 w-12 rounded-full border transition-colors disabled:opacity-40 ${
        on ? 'bg-cyan/25 border-cyan/70' : 'bg-white/[0.03] border-border'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full transition-all ${
          on ? 'left-[22px] bg-cyan shadow-glow-sm' : 'left-0.5 bg-muted'
        }`}
      />
    </button>
  )
}

function NameModal({
  initial,
  onClose,
  onSave
}: {
  initial: string
  onClose: () => void
  onSave: (name: string) => void
}) {
  const [name, setName] = useState(initial)
  return (
    <Modal open onClose={onClose} eyebrow="EDIT.PROFILE" title="Editar nome">
      <div className="space-y-4">
        <input
          className="field text-lg"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <button className="btn-primary" onClick={() => onSave(name.trim())}>
          Salvar
        </button>
      </div>
    </Modal>
  )
}

function WipeModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [step, setStep] = useState(1)
  return (
    <Modal open onClose={onClose} eyebrow="DANGER.ZONE" title="Limpar todos os dados">
      <div className="space-y-4">
        {step === 1 ? (
          <>
            <p className="text-sm text-muted">
              Isto apaga permanentemente todo o seu histórico, protocolo, medições e
              frascos deste dispositivo. A biblioteca padrão será restaurada.
            </p>
            <button className="btn-ghost w-full border-danger/50 text-danger" onClick={() => setStep(2)}>
              Continuar
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-danger font-medium">
              Tem certeza? Esta ação não pode ser desfeita.
            </p>
            <button
              className="w-full rounded-xl border border-danger bg-danger/15 text-danger py-3.5 font-medium min-h-[48px]"
              onClick={onDone}
            >
              Sim, apagar tudo
            </button>
            <button className="w-full text-sm text-muted py-2" onClick={onClose}>
              Cancelar
            </button>
          </>
        )}
      </div>
    </Modal>
  )
}
