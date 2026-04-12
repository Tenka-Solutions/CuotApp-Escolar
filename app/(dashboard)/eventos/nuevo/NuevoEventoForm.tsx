'use client'

import { useActionState } from 'react'
import { CalendarDays, FileText, Hash, LoaderCircle, Wallet } from 'lucide-react'
import { proponerEvento, type PropuestaState } from './actions'

const INITIAL: PropuestaState = { error: null }

export default function NuevoEventoForm() {
  const [state, action, isPending] = useActionState(proponerEvento, INITIAL)

  return (
    <form action={action} className="space-y-4">
      {/* Nombre */}
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-[0.12em]">Nombre del evento</span>
        <span className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-brand-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-100">
          <FileText className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            type="text"
            name="nombre"
            required
            maxLength={120}
            placeholder="Ej. Salida pedagógica Cajón del Maipo"
            className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-300"
          />
        </span>
      </label>

      {/* Descripción */}
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-[0.12em]">
          Descripción <span className="font-normal normal-case text-slate-400">(opcional)</span>
        </span>
        <textarea
          name="descripcion"
          rows={3}
          maxLength={500}
          placeholder="Detalla el propósito, actividades o consideraciones del evento…"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-300 focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-100 resize-none"
        />
      </label>

      {/* Monto + Billetera */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-[0.12em]">Monto por alumno (CLP)</span>
          <span className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-brand-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-100">
            <Hash className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              type="number"
              name="monto_por_alumno"
              required
              min={1}
              step={100}
              placeholder="15000"
              className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-300"
            />
          </span>
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-[0.12em]">Fondo destino</span>
          <span className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-brand-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-100">
            <Wallet className="h-4 w-4 shrink-0 text-slate-400" />
            <select
              name="tipo_billetera"
              required
              defaultValue="apoderados"
              className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none"
            >
              <option value="apoderados">Fondo Apoderados</option>
              <option value="alumnos">Fondo Alumnos</option>
            </select>
          </span>
        </label>
      </div>

      {/* Fecha límite */}
      <label className="block space-y-1.5">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-[0.12em]">Fecha límite de pago</span>
        <span className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-brand-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-100">
          <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            type="date"
            name="fecha_limite_pago"
            required
            min={new Date().toISOString().slice(0, 10)}
            className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none"
          />
        </span>
      </label>

      {/* Error */}
      {state.error && (
        <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {state.error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? (
          <><LoaderCircle className="h-4 w-4 animate-spin" /> Proponiendo evento…</>
        ) : (
          'Proponer evento y abrir votación'
        )}
      </button>

      <p className="text-center text-xs text-slate-400">
        Al confirmar se abrirá una votación de 24 h para que el curso apruebe el evento.
      </p>
    </form>
  )
}
