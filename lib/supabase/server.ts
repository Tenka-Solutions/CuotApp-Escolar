import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/types/database.types'

/**
 * Cliente Supabase para Server Components, Route Handlers y Server Actions.
 * Lee y escribe cookies de sesión a través del cookie store de Next.js.
 *
 * IMPORTANTE: llamar siempre con `await` ya que cookies() es async en Next.js 15.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Los Server Components no pueden mutar cookies directamente.
            // El middleware se encarga de refrescar la sesión.
          }
        },
      },
    }
  )
}
