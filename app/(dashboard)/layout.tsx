import { redirect } from 'next/navigation'
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

  const { data } = await supabase
    .from('perfiles')
    .select('id, nombre_completo, rol, estado, curso_id')
    .eq('id', user.id)
    .single()

  const perfil = data as Pick<Perfil, 'id' | 'nombre_completo' | 'rol' | 'estado' | 'curso_id'> | null

  if (!perfil)                                              redirect('/registro')
  if (perfil.estado === 'pendiente')                        redirect('/pendiente-aprobacion')
  if (perfil.estado === 'rechazado' || perfil.estado === 'suspendido') redirect('/acceso-denegado')

  return (
    // Shell mobile-first: altura completa del viewport dinámico
    <div className="flex flex-col h-dvh bg-slate-50 max-w-lg mx-auto">
      {children}
    </div>
  )
}
