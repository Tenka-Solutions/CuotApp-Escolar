import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { ROOT_DEV_EMAIL, RUTA_DENEGADO, RUTA_PENDIENTE, RUTAS_PUBLICAS } from '@/lib/constants'
import type { Database } from '@/lib/types/database.types'
import type { EstadoUsuario } from '@/lib/types'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Usar getUser() — no getSession() — para validar contra el servidor de Supabase
  // y prevenir ataques de session spoofing.
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const esPublica     = RUTAS_PUBLICAS.some(ruta => pathname.startsWith(ruta))
  const esRutaEstado  = pathname.startsWith(RUTA_PENDIENTE) || pathname.startsWith(RUTA_DENEGADO)

  function redirigir(destino: string) {
    const url = request.nextUrl.clone()
    url.pathname = destino
    url.search = ''
    return NextResponse.redirect(url)
  }

  // Sin sesión → login
  if (!user) {
    if (esPublica || esRutaEstado) return supabaseResponse
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Con sesión + ruta pública (login/registro) → dashboard
  if (esPublica) return redirigir('/')

  // Root dev: sin perfil en DB, acceso total
  if (user.email?.toLowerCase() === ROOT_DEV_EMAIL) return supabaseResponse

  // Verificar estado del perfil
  const { data: perfilRaw } = await supabase
    .from('perfiles')
    .select('estado')
    .eq('id', user.id)
    .single()
  const perfil = perfilRaw as { estado: EstadoUsuario } | null

  const estado = perfil?.estado

  if (estado === 'pendiente') {
    return esRutaEstado ? supabaseResponse : redirigir(RUTA_PENDIENTE)
  }

  if (estado === 'rechazado' || estado === 'suspendido') {
    return esRutaEstado ? supabaseResponse : redirigir(RUTA_DENEGADO)
  }

  // Usuario activo intentando acceder a rutas de estado → dashboard
  if (esRutaEstado) return redirigir('/')

  return supabaseResponse
}

export const config = {
  matcher: [
    // Excluir archivos estáticos y rutas internas de Next.js
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
