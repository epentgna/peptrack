import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db/db'
import { Layout } from './components/Layout'
import { useAuth } from './auth/AuthProvider'
import { scheduleTodayReminders } from './lib/notifications'
import AuthGate from './pages/AuthGate'
import Protocol from './pages/Protocol'
import ManageProtocol from './pages/ManageProtocol'
import History from './pages/History'
import Progress from './pages/Progress'
import Library from './pages/Library'
import CompoundDetail from './pages/CompoundDetail'
import Calculator from './pages/Calculator'
import You from './pages/You'
import Onboarding from './pages/Onboarding'

export default function App() {
  const { configured, ready: authReady, user } = useAuth()
  const settings = useLiveQuery(() => db.settings.get(1), [])
  const protocolCount = useLiveQuery(() => db.protocolItems.count(), [])

  useEffect(() => {
    // (re)agenda lembretes quando protocolo/config mudam ou app abre.
    scheduleTodayReminders()
  }, [protocolCount, settings?.notificationsEnabled])

  // Aguarda o carregamento inicial dos dados e da sessão.
  if (
    settings === undefined ||
    protocolCount === undefined ||
    (configured && !authReady)
  ) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="eyebrow animate-pulse">SYS.BOOT // CARREGANDO</div>
      </div>
    )
  }

  // Login obrigatório: sem sessão, mostra a porta de entrada.
  if (configured && !user) {
    return <AuthGate />
  }

  const needsOnboarding = !settings.onboarded && protocolCount === 0

  if (needsOnboarding) {
    return (
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />

      <Route element={<Layout />}>
        <Route path="/" element={<Protocol />} />
        <Route path="/progresso" element={<Progress />} />
        <Route path="/biblioteca" element={<Library />} />
        <Route path="/biblioteca/calculadora" element={<Calculator />} />
        <Route path="/biblioteca/:id" element={<CompoundDetail />} />
        <Route path="/voce" element={<You />} />
      </Route>

      {/* Telas de tela cheia (sem navegação de rodapé). */}
      <Route path="/protocolo/gerenciar" element={<ManageProtocol />} />
      <Route path="/historico" element={<History />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
