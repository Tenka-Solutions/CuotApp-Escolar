'use client'

import { useActionState } from 'react'
import { CheckCircle2, LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OpcionVoto } from '@/lib/types'
import { submitVote, type VoteActionState } from './actions'

interface VoteActionPanelProps {
  votacionId: string
  initialOption: OpcionVoto | null
  disabled?: boolean
  disabledMessage?: string | null
}

const INITIAL_STATE: VoteActionState = {
  status: 'idle',
  message: null,
  selectedOption: null,
}

const OPTION_COPY: Array<{ value: OpcionVoto; label: string; tone: string }> = [
  { value: 'si', label: 'Si', tone: 'bg-success-50 text-success-700 border-success-200' },
  { value: 'no', label: 'No', tone: 'bg-danger-50 text-danger-700 border-danger-200' },
  {
    value: 'abstencion',
    label: 'Abstencion',
    tone: 'bg-slate-100 text-slate-700 border-slate-200',
  },
]

export default function VoteActionPanel({
  votacionId,
  initialOption,
  disabled = false,
  disabledMessage,
}: VoteActionPanelProps) {
  const [state, formAction, isPending] = useActionState(submitVote, {
    ...INITIAL_STATE,
    selectedOption: initialOption,
  })

  const currentOption = state.selectedOption ?? initialOption

  return (
    <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-slate-50/85 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        Tu decision
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-900">
        {currentOption ? `Voto actual: ${currentOption}` : 'Aun no has emitido tu voto'}
      </p>

      <form action={formAction} className="mt-4 space-y-3">
        <input type="hidden" name="votacionId" value={votacionId} />

        <div className="grid gap-2 sm:grid-cols-3">
          {OPTION_COPY.map((option) => {
            const isSelected = currentOption === option.value

            return (
              <button
                key={option.value}
                type="submit"
                name="opcion"
                value={option.value}
                disabled={disabled || isPending}
                className={cn(
                  'rounded-2xl border px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60',
                  isSelected
                    ? option.tone
                    : 'border-slate-200 bg-white text-slate-700 hover:border-brand-200 hover:bg-brand-50/70'
                )}
              >
                {isPending && isSelected ? (
                  <span className="inline-flex items-center gap-2">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Guardando
                  </span>
                ) : (
                  option.label
                )}
              </button>
            )
          })}
        </div>

        {disabledMessage ? (
          <p className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs leading-5 text-slate-500">
            {disabledMessage}
          </p>
        ) : null}

        {state.message ? (
          <p
            className={cn(
              'rounded-2xl px-3 py-2 text-xs leading-5',
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
      </form>
    </div>
  )
}
