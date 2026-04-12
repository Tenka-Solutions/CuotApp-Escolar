import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { Users } from 'lucide-react'
import { ROOT_DEV_EMAIL, ROLES_JERARQUIA } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import type { Perfil, RolUsuario } from '@/lib/types'
import ModuleShell from '../../components/ModuleShell'
import AprobacionCard from './AprobacionCard'

export const metadata: Metadata = { title: 'Aprobaciones' }

type PerfilAdmin   = Pick<Perfil, 'id' | 'rol' | 'curso_id'>
type PerfilPending = Pick<Perfil, 'id' | 'nombre_completo' | 'rut' | 'telefono' | 'rol' | 'created_at'>

export default async function AprobacionesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const isRootDev = user.email?.toLowerCase() === ROOT_DEV_EMAIL

  const { data: adminRaw } = await supabase
    .from('perfiles')
    .select('id, rol, curso_id')
    .eq('id', user.id)
    .single()
  const admin = adminRaw as PerfilAdmin | null

  if (!admin && !isRootDev) redirect('/')
  if (admin && !ROLES_JERARQUIA.includes(admin.rol as RolUsuario)) redirect('/')

  const pendientes: PerfilPending[] = []

  if (admin) {
    const { data } = await supabase
      .from('perfiles')
      .select('id, nombre_completo, rut, telefono, rol, created_at')
      .eq('curso_id', admin.curso_id)
      .eq('estado', 'pendiente')
      .order('created_at', { ascending: true })

    pendientes.push(...((data ?? []) as PerfilPending[]))
  }

  return (
    <ModuleShell
      title="Aprobaciones"
      description="Revisa las solicitudes de acceso pendientes y aprueba o rechaza cada perfil."
      badge={pendientes.length > 0 ? `${pendientes.length} pendiente${pendientes.length > 1 ? 's' : ''}` : undefined}
    >
      {pendientes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-[1.75rem] border border-slate-200 bg-white px-6 py-16 text-center shadow-[0_18px_36px_-30px_rgba(15,23,42,0.85)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">
            <Users className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Sin solicitudes pendientes</p>
          <p className="text-xs text-slate-400">Cuando alguien se registre aparecerá aquí para aprobación.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pendientes.map((p) => (
            <AprobacionCard key={p.id} perfil={p} />
          ))}
        </div>
      )}
    </ModuleShell>
  )
}
