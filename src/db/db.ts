import Dexie, { type Table } from 'dexie'
import type {
  Compound,
  ProtocolItem,
  DoseLog,
  Measurement,
  Vial,
  Settings
} from '../types'
import { SEED_COMPOUNDS } from './seed'

export class PepTrackDB extends Dexie {
  compounds!: Table<Compound, number>
  protocolItems!: Table<ProtocolItem, number>
  doseLogs!: Table<DoseLog, number>
  measurements!: Table<Measurement, number>
  vials!: Table<Vial, number>
  settings!: Table<Settings, number>

  constructor() {
    super('peptrack')
    this.version(1).stores({
      compounds: '++id, name, category',
      protocolItems: '++id, compoundId, active',
      doseLogs: '++id, compoundId, protocolItemId, scheduledFor, loggedAt, status',
      measurements: '++id, type, measuredAt',
      vials: '++id, compoundId, active',
      settings: '++id'
    })
  }
}

export const db = new PepTrackDB()

const SETTINGS_ID = 1

export const DEFAULT_SETTINGS: Settings = {
  id: SETTINGS_ID,
  userName: '',
  units: 'metric',
  notificationsEnabled: false,
  onboarded: false
}

/**
 * Pré-popula a biblioteca no primeiro carregamento e garante um registro
 * de configurações. Idempotente: só semeia se as tabelas estiverem vazias.
 */
export async function ensureSeed(): Promise<void> {
  await db.transaction(
    'rw',
    db.compounds,
    db.settings,
    async () => {
      const compoundCount = await db.compounds.count()
      if (compoundCount === 0) {
        await db.compounds.bulkAdd(SEED_COMPOUNDS as Compound[])
      }
      const settings = await db.settings.get(SETTINGS_ID)
      if (!settings) {
        await db.settings.add(DEFAULT_SETTINGS)
      }
    }
  )
}

export async function getSettings(): Promise<Settings> {
  const s = await db.settings.get(SETTINGS_ID)
  return s ?? DEFAULT_SETTINGS
}

export async function updateSettings(patch: Partial<Settings>): Promise<void> {
  const current = await getSettings()
  await db.settings.put({ ...current, ...patch, id: SETTINGS_ID })
}

/** Apaga todo o banco de dados (IndexedDB). */
export async function wipeDatabase(): Promise<void> {
  await db.delete()
  await db.open()
  await ensureSeed()
}
