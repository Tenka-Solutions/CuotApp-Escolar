import type { Metadata } from 'next'
import { ShieldX } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Acceso denegado' }

export default function AccesoDenegadoPage() {
  return (
    <div className="overflow-hidden rounded-3xl bg-white/10 ring-1 ring-white/20 backdrop-blur-md">
      <div className="border-b border-white/10 px-6 py-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">Estado de cuenta</p>
        <h2 className="mt-1 text-lg font-semibold text-white">Acceso restringido</h2>
      </div>

      <div className="px-6 py-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/20 ring-1 ring-red-400/30">
          <ShieldX className="h-7 w-7 text-red-300" />
        </div>
        <p className="text-sm text-white/80">
          Tu cuenta ha sido rechazada o suspendida. No tienes acceso a esta plataforma.
        </p>
        <p className="mt-2 text-xs text-white/50">
          Si crees que esto es un error, contacta al administrador del curso.
        </p>
      </div>

      <div className="border-t border-white/10 px-6 py-4 text-center text-xs text-white/50">
        ¿Ingresaste con otra cuenta?{' '}
        <Link href="/login" className="font-medium text-white/80 transition hover:text-white">
          Volver al login
        </Link>
      </div>
    </div>
  )
}
