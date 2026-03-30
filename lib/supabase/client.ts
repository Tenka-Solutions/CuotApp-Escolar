import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database.types'

/**
 * Cliente Supabase para Client Components ('use client').
 * Reutiliza la instancia dentro del mismo render para evitar
 * múltiples conexiones WebSocket en componentes con Realtime.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
