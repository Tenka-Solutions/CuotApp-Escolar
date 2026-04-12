'use client'

import { useTransition, useState } from 'react'
import { Check, Hash, LoaderCircle, Phone, UserRound, X } from 'lucide-react'
import { aprobarPerfil, rechazarPerfil } from './actions'

interface PerfilPendiente {
  id:              string
  nombre_completo: string
  rut:             string
  telefono:        string
  rol:             string
  created_at:      string
}

interface Props {
  perfil: PerfilPendiente
}

export default function AprobacionCard({ perfil }: Props) {
  const [isPending, startTransition] = useTransition()
  const [accion, setAccion]          = useState<'aprobar' | 'rechazar' | null>(null)
  const [done, setDone]              = useState<'aprobado' | 'rechazado' | null>(null)
  const [err, setErr]                = useState<string | null>(null)

  function ejecutar(tipo: 'aprobar' | 'rechazar') {
    setAccion(tipo)
    setErr(null)
    startTransition(async () => {
      const res = tipo === 'aprobar'
        ? await aprobarPerfil(perfil.id)
        : await rechazarPerfil(perfil.id)

      if (res.error) {
        setErr(String(res.error))
        setAccion(null)
      } else {
        setDone(tipo === 'aprobar' ? 'aprobado' : 'rechazado')
      }
    })
  }

  const fecha = new Date(perfil.created_at).toLocaleDateString('es-CL', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

  if (done) {
    return (
      <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium ${
        done === 'aprobado'
          ? 'border-success-200 bg-success-50 text-success-700'
          : 'border-red-200 bg-red-50 text-red-700'
      }`}>
        {done === 'aprobado'
          ? <Check className="h-4 w-4 shrink-0" />
          : <X    className="h-4 w-4 shrink-0" />}
        <span>{perfil.nombre_completo} — {done === 'aprobado' ? 'Aprobado' : 'Rechazado'}</span>
      </div>
    )
  }

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.85)]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50">
            <UserRound className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">{perfil.nombre_completo}</p>
            <p className="text-[11px] text-slate-400 capitalize">{perfil.rol} · Solicitud {fecha}</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-600">
          Pendiente
        </span>
      </div>

      {/* Datos */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
          <Hash  className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate text-xs text-slate-600">{perfil.rut}</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
          <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate text-xs text-slate-600">{perfil.telefono}</span>
        </div>
      </div>

      {/* Error */}
      {err && (
        <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{err}</p>
      )}

      {/* Acciones */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => ejecutar('aprobar')}
          disabled={isPending}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-success-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-success-700 active:scale-[0.98] disabled:opacity-60"
        >
          {isPending && accion === 'aprobar'
            ? <LoaderCircle className="h-4 w-4 animate-spin" />
            : <Check className="h-4 w-4" />}
          Aprobar
        </button>
        <button
          onClick={() => ejecutar('rechazar')}
          disabled={isPending}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 active:scale-[0.98] disabled:opacity-60"
        >
          {isPending && accion === 'rechazar'
            ? <LoaderCircle className="h-4 w-4 animate-spin" />
            : <X className="h-4 w-4" />}
          Rechazar
        </button>
      </div>
    </div>
  )
}
