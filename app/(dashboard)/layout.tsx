import { redirect } from 'next/navigation'
import { ROOT_DEV_EMAIL } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import type { Perfil } from '@/lib/types'

/**
 * Layout protegido del dashboard.
 * Verifica sesión y estado del perfil antes de renderizar.
 * El middleware bloquea no-autenticados; aquí validamos perfiles pendientes/suspendidos.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const isRootDev = user.email?.toLowerCase() === ROOT_DEV_EMAIL

  const { data } = await supabase
    .from('perfiles')
    .select('id, nombre_completo, rol, estado, curso_id')
    .eq('id', user.id)
    .single()

  const perfil = data as Pick<Perfil, 'id' | 'nombre_completo' | 'rol' | 'estado' | 'curso_id'> | null

  const shell = (
    <div className="min-h-dvh bg-[linear-gradient(180deg,#eef5ff_0%,#f8fafc_24%,#f8fafc_100%)]">
      <div className="mx-auto flex h-dvh w-full max-w-[1500px] flex-col px-0 md:px-4 xl:px-6">
        {children}
      </div>
    </div>
  )

  if (!perfil && isRootDev) {
    return shell
  }

  if (!perfil)                                              redirect('/registro')
  if (perfil.estado === 'pendiente')                        redirect('/pendiente-aprobacion')
  if (perfil.estado === 'rechazado' || perfil.estado === 'suspendido') redirect('/acceso-denegado')

  return (
    // Shell mobile-first, expandido para escritorio
    shell
  )
}
