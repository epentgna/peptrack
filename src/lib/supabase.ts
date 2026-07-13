import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Valores públicos por design (a "publishable key" é feita para ficar no
// cliente). A proteção real vem das políticas RLS no banco.
const SUPABASE_URL = 'https://infgemqgrcbwzqtatrpk.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_mPVAcG3RPEYqJA8Vr7CSFQ_YYTZjiag'

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY)

export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    })
  : null

/** URL de retorno para os fluxos de login (Pages usa /peptrack/). */
export const APP_URL =
  typeof window !== 'undefined'
    ? window.location.origin + import.meta.env.BASE_URL
    : '/'
