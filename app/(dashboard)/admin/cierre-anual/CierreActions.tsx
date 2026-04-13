'use client'

import { useActionState } from 'react'
import { AlertTriangle, CheckCircle2, Download, LoaderCircle } from 'lucide-react'
import { ejecutarCierreAnual, type CierreState } from './actions'

interface CierreActionsProps {
  cursoId: string
  disabled?: boolean
  disabledMessage?: string | null
}

const INITIAL: CierreState = { status: 'idle', message: null }

export default function CierreActions({ cursoId, disabled, disabledMessage }: CierreActionsProps) {
  const [state, formAction, isPending] = useActionState(ejecutarCierreAnual, INITIAL)

  return (
    <div className="space-y-4">
      {/* Print / PDF button */}
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-100 active:scale-[0.98]"
      >
        <Download className="h-3.5 w-3.5" />
        Descargar reporte (PDF)
      </button>

      {/* Cierre action */}
      <form action={formAction}>
        <input type="hidden" name="cursoId" value={cursoId} />

        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
            <AlertTriangle className="h-3.5 w-3.5" />
            Cierre anual del curso
          </div>
          <p className="mt-1.5 text-[11px] text-amber-600">
            Esta acción desactiva el curso y cierra todos los eventos en borrador. No se puede deshacer.
          </p>

          {disabledMessage && (
            <p className="mt-2 text-[11px] text-amber-600 font-medium">{disabledMessage}</p>
          )}

          <button
            type="submit"
            disabled={disabled || isPending || state.status === 'success'}
            className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-amber-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <><LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Ejecutando...</>
            ) : (
              'Ejecutar cierre anual'
            )}
          </button>
        </div>
      </form>

      {state.status === 'success' && (
        <div className="flex items-center gap-2 rounded-2xl border border-success-200 bg-success-50 px-4 py-3 text-xs font-semibold text-success-700 print:hidden">
          <CheckCircle2 className="h-4 w-4" />
          {state.message}
        </div>
      )}

      {state.status === 'error' && state.message && (
        <p className="rounded-2xl border border-danger-100 bg-danger-50 px-3 py-2 text-xs text-danger-700 print:hidden">
          {state.message}
        </p>
      )}
    </div>
  )
}
