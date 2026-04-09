import {
  ArrowDownRight,
  ArrowUpRight,
  Clock3,
  ReceiptText,
  Vote,
} from 'lucide-react'
import { cn, formatearMonto, tiempoRelativo } from '@/lib/utils'
import type { DashboardMovement, PendingVote } from './dashboard.types'
import { formatLocalDate } from './dashboard.utils'

interface ActivityFeedProps {
  transacciones: DashboardMovement[]
  votaciones: PendingVote[]
}

function statusLabel(estado: DashboardMovement['estado']): string {
  switch (estado) {
    case 'aprobada':            return 'Aprobada'
    case 'rechazada':           return 'Rechazada'
    case 'pendiente_aprobacion': return 'Pend. aprob.'
    default:                    return 'Pend. valid.'
  }
}

function statusClass(estado: DashboardMovement['estado']): string {
  if (estado === 'aprobada')  return 'bg-success-50 text-success-700'
  if (estado === 'rechazada') return 'bg-danger-50 text-danger-600'
  return 'bg-warning-50 text-warning-600'
}

function voteLabel(tipo: PendingVote['tipo']): string {
  switch (tipo) {
    case 'gasto':             return 'Votación de gasto'
    case 'cierre_evento':     return 'Cierre de evento'
    case 'destino_sobrante':  return 'Destino de sobrante'
    default:                  return tipo
  }
}

export default function ActivityFeed({ transacciones, votaciones }: ActivityFeedProps) {
  const empty = transacciones.length === 0 && votaciones.length === 0

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:rounded-[2rem]">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Actividad reciente
        </p>
        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-600">
          {transacciones.length + votaciones.length} items
        </span>
      </div>

      {/* Scrollable body */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {empty ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
            <ReceiptText className="h-8 w-8 text-slate-200" />
            <p className="text-sm font-semibold text-slate-400">Todo al día</p>
            <p className="text-xs text-slate-400">Los movimientos y votaciones aparecerán aquí.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {/* Transactions */}
            {transacciones.map((tx) => {
              const isExpense = tx.tipo === 'gasto_egreso'
              return (
                <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                      isExpense ? 'bg-danger-50 text-danger-600' : 'bg-success-50 text-success-600'
                    )}
                  >
                    {isExpense
                      ? <ArrowDownRight className="h-4 w-4" />
                      : <ArrowUpRight className="h-4 w-4" />
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-slate-800">{tx.descripcion}</p>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-400">
                      <Clock3 className="h-3 w-3" />
                      <span>{tiempoRelativo(tx.fechaRegistro)}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={cn('text-xs font-bold', isExpense ? 'text-danger-600' : 'text-success-600')}>
                      {isExpense ? '−' : '+'}{formatearMonto(tx.monto)}
                    </p>
                    <span className={cn('mt-0.5 inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-semibold', statusClass(tx.estado))}>
                      {statusLabel(tx.estado)}
                    </span>
                  </div>
                </div>
              )
            })}

            {/* Votes */}
            {votaciones.map((votacion) => {
              const participation = votacion.totalVotantes > 0
                ? Math.round((votacion.votosEmitidos / votacion.totalVotantes) * 100)
                : 0

              return (
                <div key={votacion.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Vote className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-slate-800">{voteLabel(votacion.tipo)}</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      Vuelta {votacion.vuelta}
                      {votacion.fechaFin
                        ? ` · Cierra ${formatLocalDate(votacion.fechaFin, { month: 'short', day: 'numeric' })}`
                        : ''}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-bold text-brand-600">{participation}%</p>
                    <span className="mt-0.5 inline-flex rounded-full bg-brand-50 px-1.5 py-0.5 text-[9px] font-semibold text-brand-600">
                      Particip.
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
