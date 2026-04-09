import { CalendarDays } from 'lucide-react'
import { cn, formatearMonto } from '@/lib/utils'
import type { EventoActivo } from './dashboard.types'
import { formatLocalDate } from './dashboard.utils'

interface EventCardProps {
  activeEvent: EventoActivo | null
}

export default function EventCard({ activeEvent }: EventCardProps) {
  const progress = Math.round((activeEvent?.porcentajeRecaudacion ?? 0) * 100)
  const progressWidth = `${Math.min(activeEvent?.porcentajeRecaudacion ?? 0, 1) * 100}%`

  return (
    <div className="flex flex-col justify-between overflow-hidden rounded-3xl border border-brand-100 bg-white p-5 shadow-sm lg:min-h-0 lg:flex-1 lg:rounded-[2rem]">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Recaudación
          </p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">Evento activo</p>
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <CalendarDays className="h-4 w-4" />
        </div>
      </div>

      {activeEvent ? (
        <>
          {/* Amount */}
          <div>
            <p className="text-2xl font-bold tracking-tight text-slate-900">
              {formatearMonto(activeEvent.montoRecaudado)}
            </p>
            <p className="mt-0.5 truncate text-xs font-medium text-slate-600">
              {activeEvent.nombre}
            </p>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-slate-400">Meta {formatearMonto(activeEvent.montoObjetivo)}</span>
              <span className="font-bold text-brand-600">{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn(
                  'h-full rounded-full bg-gradient-to-r from-success-500 to-success-600 transition-all duration-500',
                  activeEvent.porcentajeRecaudacion === 0 && 'min-w-[4px]'
                )}
                style={{ width: progressWidth }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>{activeEvent.cuotasPagadas} pagadas · {activeEvent.cuotasPendientes} pendientes</span>
              <span>Cierre {formatLocalDate(activeEvent.fechaLimitePago, { month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-2xl font-bold text-slate-200">{formatearMonto(0)}</p>
          <p className="mt-1 text-xs text-slate-400">Sin evento vigente por ahora.</p>
        </div>
      )}
    </div>
  )
}
