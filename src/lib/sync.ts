import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { db, ensureSeed, topUpLibrary } from '../db/db'
import { buildExport, importBundle, type ExportBundle } from './export'

// De quem são os dados atualmente no IndexedDB deste navegador.
const OWNER_KEY = 'peptrack:ownerId'
function getOwner(): string | null {
  try {
    return localStorage.getItem(OWNER_KEY)
  } catch {
    return null
  }
}
function setOwner(id: string) {
  try {
    localStorage.setItem(OWNER_KEY, id)
  } catch {
    /* ignore */
  }
}

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error'

let status: SyncStatus = 'idle'
let lastSyncedAt: number | null = null
const listeners = new Set<() => void>()

// Snapshot cacheado (referência estável) para useSyncExternalStore.
let snapshot: { status: SyncStatus; lastSyncedAt: number | null } = {
  status,
  lastSyncedAt
}

export function subscribeSync(l: () => void): () => void {
  listeners.add(l)
  return () => listeners.delete(l)
}
export function getSyncState(): { status: SyncStatus; lastSyncedAt: number | null } {
  return snapshot
}
function notify() {
  snapshot = { status, lastSyncedAt }
  listeners.forEach((l) => l())
}
function setStatus(s: SyncStatus) {
  status = s
  notify()
}

let userId: string | null = null
let applyingRemote = false
let pushTimer: ReturnType<typeof setTimeout> | null = null
let lastRemoteUpdatedAt: string | null = null
let channel: RealtimeChannel | null = null

const dataTables = () => [
  db.compounds,
  db.protocolItems,
  db.doseLogs,
  db.measurements,
  db.vials,
  db.settings
]

let hooksRegistered = false
function registerHooks() {
  if (hooksRegistered) return
  hooksRegistered = true
  const trigger = () => {
    if (userId && !applyingRemote) schedulePush()
  }
  for (const table of dataTables()) {
    table.hook('creating', () => trigger())
    table.hook('updating', () => trigger())
    table.hook('deleting', () => trigger())
  }
}

/** Zera o estado local e re-semeia (usado ao entrar com outra conta nova). */
async function resetLocalToFresh() {
  applyingRemote = true
  try {
    await db.transaction('rw', dataTables(), async () => {
      await Promise.all(dataTables().map((t) => t.clear()))
    })
    await ensureSeed()
  } finally {
    applyingRemote = false
  }
}

/** Estimativa de "quão recente" o estado local está (max timestamp). */
async function computeLocalStamp(): Promise<number> {
  const [lastLog, lastMeas, vials, items] = await Promise.all([
    db.doseLogs.orderBy('loggedAt').last(),
    db.measurements.orderBy('measuredAt').last(),
    db.vials.toArray(),
    db.protocolItems.toArray()
  ])
  let m = 0
  if (lastLog) m = Math.max(m, lastLog.loggedAt)
  if (lastMeas) m = Math.max(m, lastMeas.measuredAt)
  for (const v of vials) m = Math.max(m, v.reconstitutedAt)
  for (const it of items) m = Math.max(m, it.startDate, it.endDate ?? 0)
  return m
}

function schedulePush() {
  setStatus('syncing')
  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = setTimeout(() => {
    void pushNow()
  }, 1500)
}

async function pushNow() {
  if (!supabase || !userId) return
  try {
    setStatus('syncing')
    const bundle = await buildExport()
    const updatedAt = new Date().toISOString()
    const { error } = await supabase
      .from('app_state')
      .upsert({ user_id: userId, data: bundle, updated_at: updatedAt })
    if (error) throw error
    lastRemoteUpdatedAt = updatedAt
    lastSyncedAt = Date.now()
    setStatus('synced')
  } catch (e) {
    console.error('[sync] push falhou', e)
    setStatus('error')
  }
}

async function applyRemote(bundle: ExportBundle, updatedAt: string) {
  applyingRemote = true
  try {
    await importBundle(bundle)
    lastRemoteUpdatedAt = updatedAt
    lastSyncedAt = Date.now()
    setStatus('synced')
  } catch (e) {
    console.error('[sync] apply falhou', e)
    setStatus('error')
  } finally {
    applyingRemote = false
  }
}

function subscribeRealtime(uid: string) {
  if (!supabase) return
  if (channel) {
    void supabase.removeChannel(channel)
    channel = null
  }
  channel = supabase
    .channel(`app_state_${uid}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'app_state',
        filter: `user_id=eq.${uid}`
      },
      (payload) => {
        const row = payload.new as { data?: ExportBundle; updated_at?: string }
        if (!row?.updated_at || !row.data) return
        if (row.updated_at === lastRemoteUpdatedAt) return // eco do nosso próprio push
        const incoming = Date.parse(row.updated_at)
        const known = lastRemoteUpdatedAt ? Date.parse(lastRemoteUpdatedAt) : 0
        if (incoming > known) void applyRemote(row.data, row.updated_at)
      }
    )
    .subscribe()
}

/** Puxa o estado da nuvem se estiver mais recente que o local. */
export async function resyncFromRemote() {
  if (!supabase || !userId) return
  try {
    const { data: remote, error } = await supabase
      .from('app_state')
      .select('data, updated_at')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) throw error
    if (!remote?.data || !remote.updated_at) return
    if (remote.updated_at === lastRemoteUpdatedAt) return
    const incoming = Date.parse(remote.updated_at as string)
    const known = lastRemoteUpdatedAt ? Date.parse(lastRemoteUpdatedAt) : 0
    if (incoming > known) {
      await applyRemote(remote.data as ExportBundle, remote.updated_at as string)
    }
  } catch (e) {
    console.error('[sync] resync falhou', e)
  }
}

/** Dispara imediatamente um push pendente (ao sair/minimizar o app). */
export function flushPush() {
  if (pushTimer) {
    clearTimeout(pushTimer)
    pushTimer = null
    void pushNow()
  }
}

/** Ação manual: envia pendências e puxa o mais recente. */
export async function resyncNow() {
  flushPush()
  await resyncFromRemote()
}

let lifecycleBound = false
function bindLifecycle() {
  if (lifecycleBound || typeof document === 'undefined') return
  lifecycleBound = true
  document.addEventListener('visibilitychange', () => {
    if (!userId) return
    if (document.visibilityState === 'visible') void resyncFromRemote()
    else flushPush()
  })
  window.addEventListener('pagehide', () => flushPush())
  window.addEventListener('online', () => {
    if (userId) void resyncFromRemote()
  })
}

/** Inicia a sincronização para um usuário autenticado. */
export async function startSync(uid: string) {
  if (!supabase) return
  registerHooks()
  bindLifecycle()
  userId = uid
  setStatus('syncing')
  try {
    const { data: remote, error } = await supabase
      .from('app_state')
      .select('data, updated_at')
      .eq('user_id', uid)
      .maybeSingle()
    if (error) throw error

    const ownsLocal = getOwner() === uid

    if (remote && remote.data) {
      if (ownsLocal) {
        // Mesma conta: quem tiver o estado mais recente vence.
        const remoteStamp = Date.parse(remote.updated_at as string)
        const localStamp = await computeLocalStamp()
        if (remoteStamp >= localStamp) {
          await applyRemote(remote.data as ExportBundle, remote.updated_at as string)
        } else {
          await pushNow()
        }
      } else {
        // Conta diferente: a nuvem daquela conta manda; substitui o local.
        await applyRemote(remote.data as ExportBundle, remote.updated_at as string)
      }
    } else {
      // Sem estado remoto para esta conta.
      if (!ownsLocal) {
        // Local pertence a outra conta (ou desconhecido): começa limpo.
        await resetLocalToFresh()
      }
      await pushNow()
    }
    setOwner(uid)
    // Garante que novos peptídeos do seed apareçam também para contas antigas.
    const added = await topUpLibrary()
    if (added) await pushNow()
    subscribeRealtime(uid)
  } catch (e) {
    console.error('[sync] start falhou', e)
    setStatus('error')
  }
}

export async function stopSync() {
  userId = null
  if (pushTimer) {
    clearTimeout(pushTimer)
    pushTimer = null
  }
  if (channel && supabase) {
    void supabase.removeChannel(channel)
    channel = null
  }
  lastRemoteUpdatedAt = null
  lastSyncedAt = null
  setStatus('idle')
}
