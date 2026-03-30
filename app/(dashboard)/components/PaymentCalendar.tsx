import { AlertCircle, CalendarRange, CheckCircle2, Flag } from 'lucide-react'
import { cn, formatearMonto } from '@/lib/utils'
import type { EventoActivo, PaymentMilestone } from './dashboard.types'
import { formatLocalDate, formatMonthLabel, parseLocalDate, toDateKey } from './dashboard.utils'

interface PaymentCalendarProps {
  activeEvent: EventoActivo | null
  milestones: PaymentMilestone[]
  referenceDate: string
}

interface CalendarCell {
  key: string
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  isDeadline: boolean
  tone: 'none' | 'success' | 'critical'
  label: string | null
  count: number
}

const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

function buildCalendar(referenceDate: string, milestones: PaymentMilestone[], deadline?: string): CalendarCell[] {
  const baseDate = parseLocalDate(referenceDate)
  const firstDay = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1)
  const lastDay = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0)
  const firstWeekday = (firstDay.getDay() + 6) % 7
  const totalDays = lastDay.getDate()
  const totalCells = Math.ceil((firstWeekday + totalDays) / 7) * 7
  const milestoneMap = new Map(milestones.map((item) => [item.date, item]))
  const todayKey = toDateKey(new Date())

  return Array.from({ length: totalCells }, (_, index) => {
    const dayNumber = index - firstWeekday + 1
    const date = new Date(baseDate.getFullYear(), baseDate.getMonth(), dayNumber, 12)
    const key = toDateKey(date)
    const milestone = milestoneMap.get(key)

    return {
      key,
      day: date.getDate(),
      isCurrentMonth: dayNumber >= 1 && dayNumber <= totalDays,
      isToday: key === todayKey,
      isDeadline: Boolean(deadline && key === deadline),
      tone: milestone?.status ?? 'none',
      label: milestone?.label ?? null,
      count: milestone?.count ?? 0,
    }
  })
}

export default function PaymentCalendar({
  activeEvent,
  milestones,
  referenceDate,
}: PaymentCalendarProps) {
  const deadlineKey = activeEvent ? toDateKey(activeEvent.fechaLimitePago) : undefined
  const calendarCells = buildCalendar(referenceDate, milestones, deadlineKey)
  const progress = Math.round((activeEvent?.porcentajeRecaudacion ?? 0) * 100)
  const successfulMilestones = milestones.filter((milestone) => milestone.status === 'success')
  const criticalMilestones = milestones.filter((milestone) => milestone.status === 'critical')

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.85)] lg:rounded-[2rem] lg:p-5 xl:p-6">
      <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-5">
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Seguimiento
              </p>
              <div className="mt-1 flex items-center gap-2">
                <CalendarRange className="h-4 w-4 text-brand-600" />
                <h2 className="text-sm font-semibold text-slate-900 lg:text-base">
                  Calendario de Pagos
                </h2>
              </div>
              <p className="mt-1 text-xs capitalize text-slate-500 lg:text-sm">
                {formatMonthLabel(referenceDate)}
              </p>
            </div>

            {activeEvent ? (
              <div className="rounded-full bg-success-50 px-2.5 py-1 text-[11px] font-semibold text-success-600 lg:px-3 lg:py-1.5 lg:text-xs">
                {progress}% cumplido
              </div>
            ) : (
              <div className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500 lg:px-3 lg:py-1.5 lg:text-xs">
                Sin evento
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 lg:gap-2">
            {weekDays.map((day, index) => (
              <span key={`${day}-${index}`}>{day}</span>
            ))}
          </div>

          <div className="mt-2 grid min-h-0 flex-1 grid-cols-7 gap-1 lg:gap-2">
            {calendarCells.map((cell) => (
              <div
                key={cell.key}
                className={cn(
                  'flex min-h-[2.65rem] flex-col justify-between rounded-2xl border border-transparent px-1.5 py-1 transition-colors lg:min-h-[3.15rem] lg:px-2 lg:py-1.5',
                  !cell.isCurrentMonth && 'opacity-30',
                  cell.isCurrentMonth && 'bg-slate-50/75',
                  cell.isToday && 'border-brand-300 bg-brand-50/90',
                  cell.tone === 'success' && 'border-success-100 bg-success-50',
                  cell.tone === 'critical' && 'border-danger-100 bg-danger-50',
                  cell.isDeadline && 'ring-1 ring-brand-200'
                )}
                title={cell.label ?? undefined}
              >
                <span className="text-[10px] font-semibold text-slate-500 lg:text-xs">
                  {cell.day}
                </span>
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full bg-slate-200 lg:h-2.5 lg:w-2.5',
                      cell.tone === 'success' && 'bg-success-500',
                      cell.tone === 'critical' && 'bg-danger-500'
                    )}
                  />
                  {cell.count > 0 ? (
                    <span className="text-[9px] font-semibold text-slate-500 lg:text-[10px]">
                      {cell.count}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 lg:mt-4 lg:gap-3">
            <div className="rounded-2xl bg-slate-50 px-3 py-2 lg:p-3">
              <p className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Recaudado</p>
              <p className="mt-1 text-xs font-semibold text-slate-800 lg:text-sm">
                {formatearMonto(activeEvent?.montoRecaudado ?? 0)}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-3 py-2 lg:p-3">
              <p className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Pendiente</p>
              <p className="mt-1 text-xs font-semibold text-slate-800 lg:text-sm">
                {formatearMonto(activeEvent?.montoPendiente ?? 0)}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-3 py-2 lg:p-3">
              <p className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Cierre</p>
              <p className="mt-1 text-xs font-semibold text-slate-800 lg:text-sm">
                {activeEvent ? formatLocalDate(activeEvent.fechaLimitePago) : 'Por definir'}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 lg:hidden">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-success-600" />
              Pago registrado
            </span>
            <span className="inline-flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-danger-600" />
              Hito critico
            </span>
            {activeEvent ? (
              <span className="inline-flex items-center gap-1.5">
                <Flag className="h-3.5 w-3.5 text-brand-600" />
                Meta: {activeEvent.nombre}
              </span>
            ) : null}
          </div>
        </div>

        <aside className="mt-4 hidden min-h-0 flex-col rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-4 lg:mt-0 lg:flex">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Vista ejecutiva
          </p>
          <div className="mt-4 rounded-2xl bg-white px-4 py-3 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Actividad</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{successfulMilestones.length}</p>
            <p className="mt-1 text-xs text-slate-500">días con pagos registrados</p>
          </div>
          <div className="mt-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Riesgo</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{criticalMilestones.length}</p>
            <p className="mt-1 text-xs text-slate-500">hitos críticos detectados</p>
          </div>
          <div className="mt-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Meta activa</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {activeEvent?.nombre ?? 'Sin evento vigente'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {activeEvent
                ? `${activeEvent.cuotasPagadas} cuotas pagadas y ${activeEvent.cuotasPendientes} pendientes`
                : 'Aquí verás el resumen del evento más antiguo vigente.'}
            </p>
          </div>
          <div className="mt-auto flex flex-col gap-2 pt-4 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-success-600" />
              Pago registrado
            </span>
            <span className="inline-flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-danger-600" />
              Hito critico
            </span>
            {activeEvent ? (
              <span className="inline-flex items-center gap-1.5">
                <Flag className="h-3.5 w-3.5 text-brand-600" />
                Meta: {activeEvent.nombre}
              </span>
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  )
}
