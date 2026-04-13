import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { ClipboardCheck } from 'lucide-react'
import { ROOT_DEV_EMAIL, ROLES_FINANCIERO } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import type { Perfil, RolUsuario, Transaccion } from '@/lib/types'
import ModuleShell from '../../components/ModuleShell'
import TransaccionCard from './TransaccionCard'

export const metadata: Metadata = { title: 'Validar transacciones' }

type PerfilAdmin = Pick<Perfil, 'id' | 'rol' | 'curso_id'>
type TxPendiente = Pick<
  Transaccion,
  'id' | 'descripcion' | 'monto' | 'tipo' | 'estado' | 'numero_boleta' | 'url_comprobante' | 'fecha_registro'
>

export default async function TransaccionesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  if (user.email?.toLowerCase() === ROOT_DEV_EMAIL) redirect('/')

  const { data: adminRaw } = await supabase
    .from('perfiles')
    .select('id, rol, curso_id')
    .eq('id', user.id)
    .single()
  const admin = adminRaw as PerfilAdmin | null

  if (!admin || !ROLES_FINANCIERO.includes(admin.rol as RolUsuario)) redirect('/')

  const { data } = await supabase
    .from('transacciones')
    .select('id, descripcion, monto, tipo, estado, numero_boleta, url_comprobante, fecha_registro')
    .eq('curso_id', admin.curso_id)
    .in('estado', ['pendiente_aprobacion', 'pendiente_validacion'])
    .order('fecha_registro', { ascending: true })

  const pendientes = (data ?? []) as TxPendiente[]

  return (
    <ModuleShell
      title="Validar transacciones"
      description="Revisa los pagos y gastos pendientes de aprobación o validación del curso."
      badge={pendientes.length > 0 ? `${pendientes.length} pendiente${pendientes.length > 1 ? 's' : ''}` : undefined}
    >
      {pendientes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-[1.75rem] border border-slate-200 bg-white px-6 py-16 text-center shadow-[0_18px_36px_-30px_rgba(15,23,42,0.85)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">
            <ClipboardCheck className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Sin transacciones pendientes</p>
          <p className="text-xs text-slate-400">Cuando se registren pagos o gastos aparecerán aquí para validación.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pendientes.map((tx) => (
            <TransaccionCard key={tx.id} tx={tx} />
          ))}
        </div>
      )}
    </ModuleShell>
  )
}
