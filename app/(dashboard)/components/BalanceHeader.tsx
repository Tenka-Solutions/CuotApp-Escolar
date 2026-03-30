import { CalendarDays, ShieldCheck, TrendingUp } from 'lucide-react'
import { cn, formatearMonto } from '@/lib/utils'
import type { EventoActivo, SaldoTotal } from './dashboard.types'
import { formatLocalDate } from './dashboard.utils'

interface BalanceHeaderProps {
  balance: SaldoTotal
  activeEvent: EventoActivo | null
  courseName: string
  courseSubtitle: string
}

export default function BalanceHeader({
  balance,
  activeEvent,
  courseName,
  courseSubtitle,
}: BalanceHeaderProps) {
  const progressWidth = `${Math.min(activeEvent?.porcentajeRecaudacion ?? 0, 1) * 100}%`
  const eventProgress = Math.round((activeEvent?.porcentajeRecaudacion ?? 0) * 100)

  return (
    <header
      className="h-full px-4 pb-3 pt-4 md:px-6 lg:px-0 lg:pb-4 lg:pt-6"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}
    >
      <div className="flex h-full gap-3 lg:gap-5">
        <section className="flex-[65] overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 p-4 text-white shadow-[0_18px_36px_-24px_rgba(37,99,235,0.85)] lg:rounded-[2rem] lg:p-6 xl:p-7">
          <div className="flex h-full flex-col justify-between">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-100/80">
                  Estado general
                </p>
                <p className="mt-1 truncate text-sm font-medium text-brand-50 lg:text-base">
                  {courseName}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/14 backdrop-blur-sm lg:h-14 lg:w-14">
                <ShieldCheck className="h-5 w-5 lg:h-6 lg:w-6" />
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-brand-100/85 lg:text-sm">
                Saldo Total del Curso
              </p>
              <p className="mt-1 text-[clamp(1.9rem,6vw,2.6rem)] font-bold tracking-tight lg:mt-2 lg:text-[clamp(2.4rem,4vw,3.6rem)]">
                {formatearMonto(balance.total)}
              </p>
              <p className="mt-2 text-[11px] leading-5 text-brand-50/88 lg:text-sm">
                Apoderados: {formatearMonto(balance.apoderados)} | Alumnos:{' '}
                {formatearMonto(balance.alumnos)}
              </p>
            </div>

            <div className="flex items-end justify-between gap-4">
              <div className="min-w-0">
                <span className="truncate text-[11px] text-brand-100/80 lg:text-sm">
                  {courseSubtitle}
                </span>
                <div className="mt-3 hidden grid-cols-3 gap-2 lg:grid">
                  <div className="rounded-2xl border border-white/12 bg-white/8 px-3 py-2 backdrop-blur-sm">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-brand-100/80">
                      Apoderados
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {formatearMonto(balance.apoderados)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/12 bg-white/8 px-3 py-2 backdrop-blur-sm">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-brand-100/80">
                      Alumnos
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {formatearMonto(balance.alumnos)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/12 bg-white/8 px-3 py-2 backdrop-blur-sm">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-brand-100/80">
                      Evento
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {activeEvent ? `${eventProgress}%` : 'Sin meta'}
                    </p>
                  </div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-success-500/18 px-2 py-1 font-semibold text-emerald-50 lg:px-3 lg:py-1.5 lg:text-sm">
                <TrendingUp className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                Flujo saludable
              </span>
            </div>
          </div>
        </section>

        <section className="flex-[35] overflow-hidden rounded-3xl border border-brand-100 bg-white p-4 shadow-[0_16px_36px_-30px_rgba(15,23,42,0.8)] lg:rounded-[2rem] lg:p-6">
          <div className="flex h-full flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Recaudacion
                </p>
                <p className="mt-1 text-xs font-medium text-slate-600 lg:text-sm">
                  Saldo Evento Activo
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 lg:h-11 lg:w-11">
                <CalendarDays className="h-[18px] w-[18px] lg:h-5 lg:w-5" />
              </div>
            </div>

            {activeEvent ? (
              <>
                <div className="mt-2">
                  <p className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
                    {formatearMonto(activeEvent.montoRecaudado)}
                  </p>
                  <p className="mt-1 truncate text-xs font-medium text-slate-600 lg:text-sm">
                    {activeEvent.nombre}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500 lg:text-xs">
                    Meta {formatearMonto(activeEvent.montoObjetivo)}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn(
                        'h-full rounded-full bg-gradient-to-r from-success-500 to-success-600',
                        activeEvent.porcentajeRecaudacion === 0 && 'min-w-2'
                      )}
                      style={{ width: progressWidth }}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] leading-4 text-slate-500 lg:text-xs">
                      Cierre {formatLocalDate(activeEvent.fechaLimitePago, { month: 'short' })}
                    </p>
                    <p className="text-[11px] font-semibold text-brand-700 lg:text-xs">
                      {eventProgress}% meta
                    </p>
                  </div>
                </div>

                <div className="mt-3 hidden grid-cols-2 gap-2 lg:grid">
                  <div className="rounded-2xl bg-slate-50 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                      Pagadas
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {activeEvent.cuotasPagadas}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                      Pendientes
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {activeEvent.cuotasPendientes}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col justify-center">
                <p className="text-lg font-semibold text-slate-900 lg:text-2xl">
                  {formatearMonto(0)}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500 lg:max-w-[18rem] lg:text-sm">
                  Aun no hay un evento vigente para mostrar aqui.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </header>
  )
}
