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
      className="px-4 pb-3 pt-4 md:px-6 lg:h-full lg:px-0 lg:pb-4 lg:pt-6"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}
    >
      <div className="flex gap-3 lg:h-full lg:gap-5">

        {/* Left card — total balance */}
        <section className="flex-[65] overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 p-4 text-white shadow-[0_18px_36px_-24px_rgba(37,99,235,0.85)] lg:rounded-[2rem] lg:p-6 xl:p-7">
          <div className="flex flex-col gap-3 lg:h-full lg:justify-between lg:gap-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-100/80">
                  Estado general
                </p>
                <p className="mt-0.5 truncate text-xs font-medium text-brand-50 lg:text-base">
                  {courseName}
                </p>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/14 backdrop-blur-sm lg:h-14 lg:w-14 lg:rounded-2xl">
                <ShieldCheck className="h-4 w-4 lg:h-6 lg:w-6" />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-medium text-brand-100/85 lg:text-sm">
                Saldo Total del Curso
              </p>
              <p className="mt-0.5 text-[clamp(1.25rem,5vw,1.7rem)] font-bold tracking-tight lg:mt-2 lg:text-[clamp(2.4rem,4vw,3.6rem)]">
                {formatearMonto(balance.total)}
              </p>
              <p className="mt-1 text-[10px] leading-5 text-brand-50/88 lg:text-sm">
                Apod: {formatearMonto(balance.apoderados)} | Alum: {formatearMonto(balance.alumnos)}
              </p>
            </div>

            <div className="flex items-end justify-between gap-2">
              <div className="min-w-0">
                <span className="truncate text-[10px] text-brand-100/80 lg:text-sm">
                  {courseSubtitle}
                </span>
                <div className="mt-3 hidden grid-cols-3 gap-2 lg:grid">
                  <div className="rounded-2xl border border-white/12 bg-white/8 px-3 py-2 backdrop-blur-sm">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-brand-100/80">Apoderados</p>
                    <p className="mt-1 text-sm font-semibold text-white">{formatearMonto(balance.apoderados)}</p>
                  </div>
                  <div className="rounded-2xl border border-white/12 bg-white/8 px-3 py-2 backdrop-blur-sm">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-brand-100/80">Alumnos</p>
                    <p className="mt-1 text-sm font-semibold text-white">{formatearMonto(balance.alumnos)}</p>
                  </div>
                  <div className="rounded-2xl border border-white/12 bg-white/8 px-3 py-2 backdrop-blur-sm">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-brand-100/80">Evento</p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {activeEvent ? `${eventProgress}%` : 'Sin meta'}
                    </p>
                  </div>
                </div>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success-500/18 px-2 py-1 text-[10px] font-semibold text-emerald-50 lg:px-3 lg:py-1.5 lg:text-sm">
                <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4" />
                <span className="hidden sm:inline">Flujo </span>saludable
              </span>
            </div>
          </div>
        </section>

        {/* Right card — active event */}
        <section className="flex-[35] overflow-hidden rounded-3xl border border-brand-100 bg-white p-3 shadow-[0_16px_36px_-30px_rgba(15,23,42,0.8)] lg:rounded-[2rem] lg:p-6">
          <div className="flex flex-col gap-3 lg:h-full lg:justify-between lg:gap-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Recaudacion
                </p>
                <p className="mt-0.5 text-[10px] font-medium text-slate-600 lg:text-sm">
                  Evento Activo
                </p>
              </div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 lg:h-11 lg:w-11 lg:rounded-2xl">
                <CalendarDays className="h-4 w-4 lg:h-5 lg:w-5" />
              </div>
            </div>

            {activeEvent ? (
              <>
                <div>
                  <p className="text-lg font-bold tracking-tight text-slate-900 lg:text-3xl">
                    {formatearMonto(activeEvent.montoRecaudado)}
                  </p>
                  <p className="mt-0.5 truncate text-[10px] font-medium text-slate-600 lg:text-sm">
                    {activeEvent.nombre}
                  </p>
                  <p className="text-[10px] text-slate-500 lg:text-xs">
                    Meta {formatearMonto(activeEvent.montoObjetivo)}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn(
                        'h-full rounded-full bg-gradient-to-r from-success-500 to-success-600',
                        activeEvent.porcentajeRecaudacion === 0 && 'min-w-2'
                      )}
                      style={{ width: progressWidth }}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-[10px] leading-4 text-slate-500">
                      {formatLocalDate(activeEvent.fechaLimitePago, { month: 'short' })}
                    </p>
                    <p className="text-[10px] font-semibold text-brand-700">
                      {eventProgress}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[10px] text-slate-500">
                  <span><span className="font-semibold text-slate-800">{activeEvent.cuotasPagadas}</span> pagadas</span>
                  <span className="text-slate-300">·</span>
                  <span><span className="font-semibold text-slate-800">{activeEvent.cuotasPendientes}</span> pendientes</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-1">
                <p className="text-base font-semibold text-slate-900 lg:text-2xl">
                  {formatearMonto(0)}
                </p>
                <p className="text-[10px] leading-5 text-slate-500">
                  Sin evento vigente.
                </p>
              </div>
            )}
          </div>
        </section>

      </div>
    </header>
  )
}
