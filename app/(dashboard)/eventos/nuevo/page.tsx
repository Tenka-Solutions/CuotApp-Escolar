import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { ROOT_DEV_EMAIL, ROLES_FINANCIERO } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import type { Perfil, RolUsuario } from '@/lib/types'
import ModuleShell from '../../components/ModuleShell'
import NuevoEventoForm from './NuevoEventoForm'

export const metadata: Metadata = { title: 'Proponer evento' }

type PerfilAdmin = Pick<Perfil, 'rol' | 'curso_id'>

export default async function NuevoEventoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  if (user.email?.toLowerCase() === ROOT_DEV_EMAIL) redirect('/')

  const { data: perfilRaw } = await supabase
    .from('perfiles')
    .select('rol, curso_id')
    .eq('id', user.id)
    .single()
  const perfil = perfilRaw as PerfilAdmin | null

  if (!perfil || !ROLES_FINANCIERO.includes(perfil.rol as RolUsuario)) redirect('/')

  return (
    <ModuleShell
      title="Proponer evento"
      description="Define los datos del evento. Al confirmar se abrirá automáticamente una votación de 24 h para que el curso lo apruebe."
      badge="Nueva propuesta"
    >
      <div className="max-w-xl">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.85)]">
          <NuevoEventoForm />
        </div>
      </div>
    </ModuleShell>
  )
}
