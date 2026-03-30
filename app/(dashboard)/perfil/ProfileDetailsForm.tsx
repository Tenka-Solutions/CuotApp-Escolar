'use client'

import { useActionState } from 'react'
import { CheckCircle2, LoaderCircle, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import { updateProfile, type ProfileActionState } from './actions'

interface ProfileDetailsFormProps {
  initialName: string
  initialRut: string
  initialPhone: string
  disabled?: boolean
  disabledMessage?: string | null
}

const INITIAL_STATE: ProfileActionState = {
  status: 'idle',
  message: null,
}

export default function ProfileDetailsForm({
  initialName,
  initialRut,
  initialPhone,
  disabled = false,
  disabledMessage,
}: ProfileDetailsFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfile, INITIAL_STATE)

  return (
    <form action={formAction} className="mt-5 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-medium text-slate-700">Nombre completo</span>
          <input
            type="text"
            name="nombreCompleto"
            defaultValue={initialName}
            disabled={disabled || isPending}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-60"
            required
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">RUT</span>
          <input
            type="text"
            name="rut"
            defaultValue={initialRut}
            disabled={disabled || isPending}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-60"
            required
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Telefono</span>
          <input
            type="text"
            name="telefono"
            defaultValue={initialPhone}
            disabled={disabled || isPending}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-300 focus:bg-white focus:ring-2 focus:ring-brand-100 disabled:cursor-not-allowed disabled:opacity-60"
            required
          />
        </label>
      </div>

      {disabledMessage ? (
        <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-500">
          {disabledMessage}
        </p>
      ) : (
        <p className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm leading-6 text-brand-700">
          Los cambios se guardan en tu perfil y se reflejan de inmediato en el dashboard.
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
            Guardando cambios
          </>
        ) : (
          <>
            Guardar perfil
            <Save className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  )
}
