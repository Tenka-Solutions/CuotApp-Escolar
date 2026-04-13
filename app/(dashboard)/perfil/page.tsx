import type { Metadata } from 'next'
import { BadgeCheck, Mail, Phone, ShieldCheck } from 'lucide-react'
import { ROOT_DEV_EMAIL } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import type { Perfil } from '@/lib/types'
import ModuleShell from '../components/ModuleShell'
import ProfileDetailsForm from './ProfileDetailsForm'

export const metadata: Metadata = { title: 'Perfil' }

type PerfilDetalle = Pick<Perfil, 'nombre_completo' | 'rol' | 'estado' | 'rut' | 'telefono'>

export default async function PerfilPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const isRootDev = user.email?.toLowerCase() === ROOT_DEV_EMAIL
  const { data } = await supabase
    .from('perfiles')
    .select('nombre_completo, rol, estado, rut, telefono')
    .eq('id', user.id)
    .maybeSingle()

  const perfil = (data ?? null) as PerfilDetalle | null
  const fallbackProfile: PerfilDetalle = {
    nombre_completo: 'Administrador Root',
    rol: 'fundador',
    estado: 'activo',
    rut: '11.111.111-1',
    telefono: '+56 9 1111 1111',
  }

  const profileView = perfil ?? (isRootDev ? fallbackProfile : null)
  const disabledMessage =
    !perfil && isRootDev
      ? 'El root de desarrollo puede revisar este panel, pero para guardar datos necesita un perfil persistido en la base.'
      : !perfil
        ? 'Tu perfil aun no esta listo para editarse.'
        : null

  return (
    <ModuleShell
      title="Perfil"
      description="Administra la informacion principal de tu cuenta y actualiza tus datos de contacto desde este modulo."
      badge={profileView?.rol ?? 'Sin perfil'}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_20rem]">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.85)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Cuenta principal
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">
                {profileView?.nombre_completo ?? 'Perfil pendiente'}
              </h2>
            </div>
            <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Correo</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{user.email}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Rol</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {profileView?.rol ?? 'Sin asignar'}
              </p>
            </div>
          </div>

          <ProfileDetailsForm
            initialName={profileView?.nombre_completo ?? ''}
            initialRut={profileView?.rut ?? ''}
            initialPhone={profileView?.telefono ?? ''}
            disabled={Boolean(disabledMessage)}
            disabledMessage={disabledMessage}
          />
        </div>

        <div className="space-y-3">
          {/* Estado de cuenta */}
          <div className={`rounded-[1.75rem] border p-5 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.85)] ${profileView?.estado === 'activo' ? 'border-success-200 bg-success-50' : 'border-slate-200 bg-white'}`}>
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${profileView?.estado === 'activo' ? 'bg-success-100' : 'bg-slate-100'}`}>
                <BadgeCheck className={`h-4 w-4 ${profileView?.estado === 'activo' ? 'text-success-600' : 'text-slate-400'}`} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Estado de cuenta</p>
                <p className={`text-sm font-semibold ${profileView?.estado === 'activo' ? 'text-success-700' : 'text-slate-700'}`}>
                  {profileView?.estado === 'activo' ? 'Activa' : 'Pendiente de activación'}
                </p>
              </div>
            </div>
          </div>

          {/* Correo */}
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.85)]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50">
                <Mail className="h-4 w-4 text-brand-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Correo</p>
                <p className="truncate text-sm font-semibold text-slate-800">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Teléfono */}
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.85)]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                <Phone className="h-4 w-4 text-slate-500" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Teléfono</p>
                <p className="text-sm font-semibold text-slate-800">{profileView?.telefono ?? '—'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModuleShell>
  )
}
