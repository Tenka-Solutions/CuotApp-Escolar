'use client'

import { useActionState } from 'react'
import { CheckCircle2, LoaderCircle, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { registerPayment, type PaymentActionState } from './actions'

interface PaymentSubmissionFormProps {
  eventoId: string | null
  suggestedDescription: string
  disabled?: boolean
  disabledMessage?: string | null
}

const INITIAL_STATE: PaymentActionState = {
  status: 'idle',
  message: null,
}

export default function PaymentSubmissionForm({
  eventoId,
  suggestedDescription,
  disabled = false,
  disabledMessage,
}: PaymentSubmissionFormProps) {
  const [state, formAction, isPending] = useActionState(registerPayment, INITIAL_STATE)

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="eventoId" value={eventoId ?? ''} />

      <div className="grid gap-3">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Monto reportado</span>
          <input
            type="text"
            name="monto"
            inputMode="numeric"
            placeholder="28000"
            disabled={disabled || isPending}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-60"
            required
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Descripción</span>
          <input
            type="text"
            name="descripcion"
            defaultValue={suggestedDescription}
            disabled={disabled || isPending}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">N° boleta</span>
            <input
              type="text"
              name="numeroBoleta"
              placeholder="B-1024"
              disabled={disabled || isPending}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">URL comprobante</span>
            <input
              type="url"
              name="urlComprobante"
              placeholder="https://..."
              disabled={disabled || isPending}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>
        </div>
      </div>

      {disabledMessage ? (
        <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-500">
          {disabledMessage}
        </p>
      ) : (
        <p className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm leading-6 text-brand-700">
          El registro crea una transaccion real y luego la veras en Boletas y en el dashboard.
        </p>
      )}

      {state.message ? (
        <p
          className={cn(
            'rounded-2xl px-4 py-3 text-sm',
            state.status === 'success'
              ? 'border border-success-100 bg-success-50 text-success-700'
              : 'border border-danger-100 bg-danger-50 text-danger-700'
          )}
        >
          <span className="inline-flex items-center gap-2">
            {state.status === 'success' ? <CheckCircle2 className="h-4 w-4" /> : null}
            {state.message}
          </span>
        </p>
      ) : null}

      <button
        type="submit"
        disabled={disabled || isPending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_-20px_rgba(37,99,235,0.9)] transition hover:bg-brand-700 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Enviando pago
          </>
        ) : (
          <>
            Registrar pago
            <Send className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  )
}
