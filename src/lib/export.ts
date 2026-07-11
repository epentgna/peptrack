import { db } from '../db/db'

export interface ExportBundle {
  app: 'peptrack'
  version: number
  exportedAt: number
  data: {
    compounds: unknown[]
    protocolItems: unknown[]
    doseLogs: unknown[]
    measurements: unknown[]
    vials: unknown[]
    settings: unknown[]
  }
}

export async function buildExport(): Promise<ExportBundle> {
  const [compounds, protocolItems, doseLogs, measurements, vials, settings] =
    await Promise.all([
      db.compounds.toArray(),
      db.protocolItems.toArray(),
      db.doseLogs.toArray(),
      db.measurements.toArray(),
      db.vials.toArray(),
      db.settings.toArray()
    ])
  return {
    app: 'peptrack',
    version: 1,
    exportedAt: Date.now(),
    data: { compounds, protocolItems, doseLogs, measurements, vials, settings }
  }
}

export async function downloadExport(): Promise<void> {
  const bundle = await buildExport()
  const blob = new Blob([JSON.stringify(bundle, null, 2)], {
    type: 'application/json'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const d = new Date(bundle.exportedAt)
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  a.href = url
  a.download = `peptrack-backup-${stamp}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** Restaura um backup, substituindo todo o conteúdo das tabelas. */
export async function importBundle(bundle: ExportBundle): Promise<void> {
  if (bundle.app !== 'peptrack' || !bundle.data) {
    throw new Error('Arquivo de backup inválido.')
  }
  const { data } = bundle
  await db.transaction(
    'rw',
    [db.compounds, db.protocolItems, db.doseLogs, db.measurements, db.vials, db.settings],
    async () => {
      await Promise.all([
        db.compounds.clear(),
        db.protocolItems.clear(),
        db.doseLogs.clear(),
        db.measurements.clear(),
        db.vials.clear(),
        db.settings.clear()
      ])
      if (data.compounds?.length) await db.compounds.bulkAdd(data.compounds as never)
      if (data.protocolItems?.length)
        await db.protocolItems.bulkAdd(data.protocolItems as never)
      if (data.doseLogs?.length) await db.doseLogs.bulkAdd(data.doseLogs as never)
      if (data.measurements?.length)
        await db.measurements.bulkAdd(data.measurements as never)
      if (data.vials?.length) await db.vials.bulkAdd(data.vials as never)
      if (data.settings?.length) await db.settings.bulkAdd(data.settings as never)
    }
  )
}

export async function importFromFile(file: File): Promise<void> {
  const text = await file.text()
  const bundle = JSON.parse(text) as ExportBundle
  await importBundle(bundle)
}
