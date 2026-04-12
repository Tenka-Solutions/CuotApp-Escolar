import { BadgeCheck, CalendarDays, CircleDot, Users } from 'lucide-react'
import { cn, formatearMonto } from '@/lib/utils'
import type { EventoActivo, MiCuota } from './dashboard.types'
import { formatLocalDate } from './dashboard.utils'

interface MiCuotaCardProps {
  cuota:       MiCuota | null
  activeEvent: EventoActivo | null
}

export default function MiCuotaCard({ cuota, activeEvent }: MiCuotaCardProps) {
  const pagado = cuota?.pagado ?? false

  return (
    <div
      className={cn(
        'flex flex-col justify-between overflow-hidden rounded-3xl p-5 shadow-[0_24px_60px_-16px_rgba(0,0,0,0.18)] lg:min-h-0 lg:flex-1 lg:rounded-[2rem]',
        pagado
          ? 'bg-gradient-to-br from-success-700 via-success-600 to-emerald-500 text-white'
          : 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 text-white'
      )}
    >
      {/* Top */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
            Mi estado de pago
          </p>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
          {pagado
            ? <BadgeCheck className="h-5 w-5 text-white/90" />
            : <CircleDot  className="h-5 w-5 text-white/80" />
          }
        </div>
      </div>

      {/* Center */}
      {cuota && activeEvent ? (
        <div>
          <p className="text-[11px] font-medium text-white/60">
            {pagado ? 'Pagado al curso' : 'Pendiente de pago'}
          </p>
          <p className="mt-1 text-[clamp(2rem,5vw,3rem)] font-bold tracking-tight leading-none text-white">
            {formatearMonto(cuota.montoTotal)}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-white/10 px-3 py-2">
              <p className="text-[9px] uppercase tracking-wider text-white/50">Por alumno</p>
              <p className="mt-0.5 text-sm font-semibold text-white">
                {formatearMonto(cuota.montoUnitario)}
              </p>
            </div>
            <div className="rounded-xl bg-white/10 px-3 py-2">
              <p className="text-[9px] uppercase tracking-wider text-white/50">
                <Users className="mb-0.5 inline h-3 w-3" /> Alumnos
              </p>
              <p className="mt-0.5 text-sm font-semibold text-white">{cuota.cantidadAlumnos}</p>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-[11px] font-medium text-white/60">Sin cuota asignada</p>
          <p className="mt-1 text-[clamp(2rem,5vw,3rem)] font-bold tracking-tight leading-none text-white/40">
            —
          </p>
        </div>
      )}

      {/* Bottom */}
      <div className="flex items-center justify-between">
        {activeEvent ? (
          <p className="truncate text-[10px] font-medium text-white/50">{activeEvent.nombre}</p>
        ) : (
          <p className="text-[10px] text-white/40">Sin evento activo</p>
        )}
        {cuota && (
          <span
            className={cn(
              'shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold',
              pagado
                ? 'bg-white/20 text-white'
                : 'bg-amber-400/20 text-amber-200'
            )}
          >
            <CalendarDays className="h-3 w-3" />
            {pagado && cuota.fechaPago
              ? formatLocalDate(cuota.fechaPago, { month: 'short', day: 'numeric' })
              : activeEvent
                ? `Vence ${formatLocalDate(activeEvent.fechaLimitePago, { month: 'short', day: 'numeric' })}`
                : 'Sin fecha'
            }
          </span>
        )}
      </div>
    </div>
  )
}
