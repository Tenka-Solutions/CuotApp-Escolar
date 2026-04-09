import { redirect } from 'next/navigation'
import { ROOT_DEV_EMAIL } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import type { Perfil } from '@/lib/types'

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

  if (!perfil && !isRootDev) redirect('/registro')
  if (perfil?.estado === 'pendiente') redirect('/pendiente-aprobacion')
  if (perfil?.estado === 'rechazado' || perfil?.estado === 'suspendido') redirect('/acceso-denegado')

  return (
    <div className="min-h-dvh bg-[#f5f3ff] lg:h-dvh lg:overflow-hidden">
      <div className="mx-auto flex h-full max-w-[1600px] flex-col">
        {children}
      </div>
    </div>
  )
}
