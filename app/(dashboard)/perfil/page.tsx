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

        <div className="space-y-4">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.85)]">
            <Mail className="h-5 w-5 text-brand-700" />
            <p className="mt-3 text-sm font-semibold text-slate-900">Estado de acceso</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {profileView?.estado === 'activo'
                ? 'Tu cuenta esta activa y con acceso normal al dashboard.'
                : 'Tu perfil aun necesita revision o activacion.'}
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.85)]">
            <BadgeCheck className="h-5 w-5 text-success-600" />
            <p className="mt-3 text-sm font-semibold text-slate-900">Identidad visible</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Rol, correo y datos de contacto visibles para el seguimiento del curso.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.85)]">
            <Phone className="h-5 w-5 text-slate-700" />
            <p className="mt-3 text-sm font-semibold text-slate-900">Contacto rapido</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Mantener estos datos al dia ayuda a la gestion y validacion del curso.
            </p>
          </div>
        </div>
      </div>
    </ModuleShell>
  )
}
