'use client'

import { useActionState, useState } from 'react'
import { AlertTriangle, LoaderCircle, ShieldBan } from 'lucide-react'
import { cn } from '@/lib/utils'
import { vetarVotacion, type VetoActionState } from './actions'

interface VetoPanelProps {
  votacionId: string
  disabled?: boolean
}

const INITIAL: VetoActionState = { status: 'idle', message: null }

export default function VetoPanel({ votacionId, disabled }: VetoPanelProps) {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(vetarVotacion, INITIAL)

  if (state.status === 'success') {
    return (
      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-700">
        <span className="inline-flex items-center gap-2">
          <ShieldBan className="h-4 w-4" />
          {state.message}
        </span>
      </div>
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <ShieldBan className="h-3.5 w-3.5" />
        Vetar esta votación
      </button>
    )
  }

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <input type="hidden" name="votacionId" value={votacionId} />

      <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
          <AlertTriangle className="h-3.5 w-3.5" />
          Veto de Profesor Jefe
        </div>
        <p className="mt-1.5 text-[11px] text-amber-600">
          Esta acción es irreversible. La votación quedará marcada como vetada con tu justificación.
        </p>

        <textarea
          name="justificacion"
          required
          minLength={10}
          placeholder="Escribe la justificación del veto (mínimo 10 caracteres)..."
          className="mt-3 w-full resize-none rounded-xl border border-amber-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-amber-300 focus:ring-1 focus:ring-amber-300"
          rows={3}
        />

        <div className="mt-3 flex items-center gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-700 active:scale-[0.98] disabled:opacity-60"
          >
            {isPending ? (
              <><LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Procesando...</>
            ) : (
              <><ShieldBan className="h-3.5 w-3.5" /> Confirmar veto</>
            )}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={isPending}
            className="rounded-2xl px-4 py-2 text-xs font-semibold text-slate-500 transition hover:text-slate-700"
          >
            Cancelar
          </button>
        </div>
      </div>

      {state.status === 'error' && state.message && (
        <p className="rounded-2xl border border-danger-100 bg-danger-50 px-3 py-2 text-xs text-danger-700">
          {state.message}
        </p>
      )}
    </form>
  )
}
