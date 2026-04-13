'use client'

import { useTransition, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, Check, Hash, LoaderCircle, ReceiptText, X } from 'lucide-react'
import { cn, formatearMonto } from '@/lib/utils'
import { aprobarTransaccion, rechazarTransaccion } from './actions'

interface TxPendiente {
  id:              string
  descripcion:     string
  monto:           number
  tipo:            string
  estado:          string
  numero_boleta:   string | null
  url_comprobante: string | null
  fecha_registro:  string
}

interface Props {
  tx: TxPendiente
}

export default function TransaccionCard({ tx }: Props) {
  const [isPending, startTransition] = useTransition()
  const [accion, setAccion]          = useState<'aprobar' | 'rechazar' | null>(null)
  const [done, setDone]              = useState<'aprobada' | 'rechazada' | null>(null)
  const [err, setErr]                = useState<string | null>(null)

  const isExpense = tx.tipo === 'gasto_egreso'

  function ejecutar(tipo: 'aprobar' | 'rechazar') {
    setAccion(tipo)
    setErr(null)
    startTransition(async () => {
      const res = tipo === 'aprobar'
        ? await aprobarTransaccion(tx.id)
        : await rechazarTransaccion(tx.id)

      if (res.error) {
        setErr(String(res.error))
        setAccion(null)
      } else {
        setDone(tipo === 'aprobar' ? 'aprobada' : 'rechazada')
      }
    })
  }

  const fecha = new Date(tx.fecha_registro).toLocaleDateString('es-CL', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

  const estadoLabel = tx.estado === 'pendiente_aprobacion' ? 'Pend. aprobación' : 'Pend. validación'

  if (done) {
    return (
      <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium ${
        done === 'aprobada'
          ? 'border-success-200 bg-success-50 text-success-700'
          : 'border-red-200 bg-red-50 text-red-700'
      }`}>
        {done === 'aprobada'
          ? <Check className="h-4 w-4 shrink-0" />
          : <X    className="h-4 w-4 shrink-0" />}
        <span>{tx.descripcion} — {done === 'aprobada' ? 'Aprobada' : 'Rechazada'}</span>
      </div>
    )
  }

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.85)]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl',
            isExpense ? 'bg-danger-50 text-danger-600' : 'bg-success-50 text-success-600'
          )}>
            {isExpense ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{tx.descripcion}</p>
            <p className="text-[11px] text-slate-400">{fecha} · {tx.numero_boleta ?? 'Sin boleta'}</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-600">
          {estadoLabel}
        </span>
      </div>

      {/* Monto */}
      <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <ReceiptText className="h-4 w-4 text-slate-400" />
          <span className="text-xs text-slate-500">Monto reportado</span>
        </div>
        <span className={cn('text-lg font-bold', isExpense ? 'text-danger-600' : 'text-success-600')}>
          {isExpense ? '−' : '+'}{formatearMonto(tx.monto)}
        </span>
      </div>

      {/* Comprobante */}
      {tx.url_comprobante && (
        <div className="mt-2 flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-2.5">
          <Hash className="h-3.5 w-3.5 text-slate-400" />
          <a
            href={tx.url_comprobante}
            target="_blank"
            rel="noreferrer"
            className="truncate text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            Ver comprobante adjunto
          </a>
        </div>
      )}

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
