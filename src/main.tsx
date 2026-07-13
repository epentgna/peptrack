import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './auth/AuthProvider'
import { ensureSeed } from './db/db'
import './index.css'

/**
 * Força o service worker a checar por nova versão quando o app volta ao
 * primeiro plano (essencial no PWA instalado no iOS, que não recarrega
 * sozinho). Com registerType 'autoUpdate', ao encontrar nova versão o app
 * recarrega automaticamente.
 */
function setupUpdateChecks() {
  if (!('serviceWorker' in navigator)) return
  const check = () =>
    navigator.serviceWorker
      .getRegistration()
      .then((r) => r?.update())
      .catch(() => {})
  window.setInterval(check, 30 * 60 * 1000)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') check()
  })
  window.addEventListener('online', check)
}

async function bootstrap() {
  setupUpdateChecks()
  await ensureSeed()
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '')
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <BrowserRouter basename={basename}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  )
}

bootstrap()
