export type Category =
  | 'Cicatrização'
  | 'GH'
  | 'Cognitivo'
  | 'Metabólico'
  | 'Outro'

export const CATEGORIES: Category[] = [
  'Cicatrização',
  'GH',
  'Cognitivo',
  'Metabólico',
  'Outro'
]

export type InjectionSite =
  | 'Abdômen SE'
  | 'Abdômen SD'
  | 'Abdômen IE'
  | 'Abdômen ID'
  | 'Flanco E'
  | 'Flanco D'
  | 'Coxa E'
  | 'Coxa D'
  | 'Braço E'
  | 'Braço D'
  | 'Glúteo E'
  | 'Glúteo D'

export const INJECTION_SITES: InjectionSite[] = [
  'Abdômen SE',
  'Abdômen SD',
  'Abdômen IE',
  'Abdômen ID',
  'Flanco E',
  'Flanco D',
  'Coxa E',
  'Coxa D',
  'Braço E',
  'Braço D',
  'Glúteo E',
  'Glúteo D'
]

/** Locais mostrados na silhueta frontal (glúteos ficam só nos botões). */
export const BODY_MAP_SITES: InjectionSite[] = [
  'Abdômen SE',
  'Abdômen SD',
  'Abdômen IE',
  'Abdômen ID',
  'Flanco E',
  'Flanco D',
  'Coxa E',
  'Coxa D',
  'Braço E',
  'Braço D'
]

export type DoseStatus = 'taken' | 'skipped'

export interface Compound {
  id?: number
  name: string
  category: Category
  halfLife?: string
  cycleNote?: string
  description?: string
  notes?: string
  route?: string
  defaultDoseMcg: number | null
  stackWith?: string[]
}

export interface ProtocolItem {
  id?: number
  compoundId: number
  doseMcg: number
  timeOfDay: string // "08:00"
  daysOfWeek: number[] // 0=Dom..6=Sáb
  active: boolean
  startDate: number
  endDate?: number
  // Reconstituição do frasco usada para calcular as unidades (UI) da seringa.
  vialMg?: number
  bacMl?: number
}

export interface DoseLog {
  id?: number
  protocolItemId?: number
  compoundId: number
  doseMcg: number
  loggedAt: number
  scheduledFor: number // timestamp início do dia
  site?: InjectionSite // ausente para compostos orais/não injetáveis
  status: DoseStatus
  notes?: string
}

export interface Measurement {
  id?: number
  type: 'weight'
  value: number
  unit: 'kg'
  measuredAt: number
}

export interface Vial {
  id?: number
  compoundId: number
  vialMg: number
  bacMl: number
  reconstitutedAt: number
  beyondUseDays: number // padrão 28
  totalMcg: number
  remainingMcg: number
  active: boolean
}

export interface Settings {
  id?: number
  userName: string
  units: 'metric'
  notificationsEnabled: boolean
  onboarded: boolean
  goals?: string[]
  experienceLevel?: string
  frustrations?: string[]
}
