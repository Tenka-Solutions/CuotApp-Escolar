'use client'

import { useActionState, useState } from 'react'
import { AlertTriangle, CheckCircle2, LoaderCircle, XCircle } from 'lucide-react'
import { cerrarEvento, type CierreEventoState } from './actions'

interface CerrarEventoButtonProps {
  eventoId: string
  eventoNombre: string
  disabled?: boolean
}

const INITIAL: CierreEventoState = { status: 'idle', message: null }

export default function CerrarEventoButton({ eventoId, eventoNombre, disabled }: CerrarEventoButtonProps) {
  const [confirming, setConfirming] = useState(false)
  const [state, formAction, isPending] = useActionState(cerrarEvento, INITIAL)

  if (state.status === 'success') {
    return (
      <div className="flex items-start gap-2 rounded-2xl border border-success-200 bg-success-50 px-4 py-3 text-xs text-success-700">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{state.message}</span>
      </div>
    )
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <XCircle className="h-3 w-3" />
        Cerrar evento
      </button>
    )
  }

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="eventoId" value={eventoId} />
      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 px-3 py-2.5">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-amber-700">
          <AlertTriangle className="h-3 w-3" />
          ¿Cerrar &quot;{eventoNombre}&quot;?
        </div>
        <p className="mt-1 text-[10px] text-amber-600">
          Si hay sobrante, se abrirá votación para decidir su destino.
        </p>
        <div className="mt-2 flex gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60"
          >
            {isPending ? <LoaderCircle className="h-3 w-3 animate-spin" /> : null}
            Confirmar cierre
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={isPending}
            className="rounded-xl px-3 py-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-700"
          >
            Cancelar
          </button>
        </div>
      </div>
      {state.status === 'error' && state.message && (
        <p className="text-[11px] text-danger-700">{state.message}</p>
      )}
    </form>
  )
}
