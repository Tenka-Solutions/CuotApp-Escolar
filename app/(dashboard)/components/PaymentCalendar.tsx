'use client'

import { useState } from 'react'
import { AlertCircle, CalendarRange, CheckCircle2, Flag } from 'lucide-react'
import { Badge } from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers'
import { PickersDay, type PickersDayProps } from '@mui/x-date-pickers/PickersDay'
import dayjs, { type Dayjs } from 'dayjs'
import 'dayjs/locale/es'
import { formatearMonto } from '@/lib/utils'
import type { EventoActivo, PaymentMilestone } from './dashboard.types'
import { formatLocalDate, formatMonthLabel, toDateKey } from './dashboard.utils'

dayjs.locale('es')

interface PaymentCalendarProps {
  activeEvent: EventoActivo | null
  milestones: PaymentMilestone[]
  referenceDate: string
}

interface CalendarDayProps extends PickersDayProps {
  deadlineKey?: string
  milestoneMap?: Record<string, PaymentMilestone>
}

function CalendarDay({
  day,
  outsideCurrentMonth,
  deadlineKey,
  milestoneMap = {},
  ...other
}: CalendarDayProps) {
  const key = day.format('YYYY-MM-DD')
  const milestone = milestoneMap[key]
  const isDeadline = key === deadlineKey
  const tone = (milestone?.status ?? 'none') as 'none' | 'success' | 'critical'
  const badgeColor = tone === 'critical' ? '#ef4444' : tone === 'success' ? '#22c55e' : '#cbd5e1'
  const dayBackground =
    tone === 'critical'
      ? 'rgba(254,242,242,0.95)'
      : tone === 'success'
        ? 'rgba(240,253,244,0.98)'
        : outsideCurrentMonth
          ? 'transparent'
          : 'rgba(248,250,252,0.92)'

  return (
    <Badge
      overlap="circular"
      variant="dot"
      invisible={!milestone}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{
        '& .MuiBadge-badge': {
          backgroundColor: badgeColor,
          boxShadow: '0 0 0 2px white',
          height: 8,
          minWidth: 8,
        },
      }}
    >
      <PickersDay
        day={day}
        outsideCurrentMonth={outsideCurrentMonth}
        disableMargin
        {...other}
        sx={{
          fontSize: { xs: '0.72rem', lg: '0.82rem' },
          fontWeight: 600,
          color: outsideCurrentMonth ? '#94a3b8' : '#475569',
          backgroundColor: dayBackground,
          border: isDeadline ? '1px solid #93c5fd' : '1px solid transparent',
          borderRadius: '18px',
          mx: 0,
          width: { xs: 34, lg: 42 },
          height: { xs: 34, lg: 42 },
          opacity: outsideCurrentMonth ? 0.35 : 1,
          '&:hover': {
            backgroundColor:
              tone === 'critical'
                ? 'rgba(254,226,226,1)'
                : tone === 'success'
                  ? 'rgba(220,252,231,1)'
                  : 'rgba(239,246,255,1)',
          },
          '&.MuiPickersDay-today': {
            border: '1px solid #60a5fa',
            backgroundColor: tone === 'none' ? 'rgba(219,234,254,0.92)' : dayBackground,
          },
          '&.Mui-selected': {
            color: '#0f172a',
            backgroundColor: '#dbeafe',
            border: '1px solid #60a5fa',
          },
          '&.Mui-selected:hover': {
            backgroundColor: '#bfdbfe',
          },
        }}
      />
    </Badge>
  )
}

export default function PaymentCalendar({
  activeEvent,
  milestones,
  referenceDate,
}: PaymentCalendarProps) {
  const deadlineKey = activeEvent ? toDateKey(activeEvent.fechaLimitePago) : undefined
  const milestoneMap = Object.fromEntries(
    milestones.map((milestone) => [milestone.date, milestone])
  ) as Record<string, PaymentMilestone>
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs(referenceDate))

  const progress = Math.round((activeEvent?.porcentajeRecaudacion ?? 0) * 100)
  const successfulMilestones = milestones.filter((milestone) => milestone.status === 'success')
  const criticalMilestones = milestones.filter((milestone) => milestone.status === 'critical')
  const selectedMilestone = milestoneMap[selectedDate.format('YYYY-MM-DD')] ?? null
  const CalendarDaySlot = (dayProps: PickersDayProps) => (
    <CalendarDay
      {...dayProps}
      deadlineKey={deadlineKey}
      milestoneMap={milestoneMap}
    />
  )

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

          <div className="mt-4 rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-2 lg:p-3">
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
              <DateCalendar
                value={selectedDate}
                onChange={(value) => value && setSelectedDate(value)}
                showDaysOutsideCurrentMonth
                reduceAnimations
                views={['day']}
                slots={{ day: CalendarDaySlot }}
                sx={{
                  width: '100%',
                  maxWidth: '100%',
                  backgroundColor: 'transparent',
                  '& .MuiPickersCalendarHeader-root': {
                    paddingLeft: 1,
                    paddingRight: 1,
                    marginBottom: 1,
                  },
                  '& .MuiPickersCalendarHeader-label': {
                    fontFamily: 'inherit',
                    fontSize: { xs: '0.9rem', lg: '1rem' },
                    fontWeight: 700,
                    color: '#0f172a',
                    textTransform: 'capitalize',
                  },
                  '& .MuiDayCalendar-weekDayLabel': {
                    fontFamily: 'inherit',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    color: '#94a3b8',
                  },
                  '& .MuiPickersArrowSwitcher-button': {
                    color: '#2563eb',
                  },
                  '& .MuiDayCalendar-header': {
                    justifyContent: 'space-between',
                  },
                  '& .MuiDayCalendar-slideTransition': {
                    minHeight: { xs: 235, lg: 290 },
                  },
                  '& .MuiDayCalendar-monthContainer': {
                    rowGap: { xs: 3, lg: 6 },
                  },
                }}
              />
            </LocalizationProvider>
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
              <p className="text-[10px] uppercase tracking-[0.12em] text-slate-400">Seleccion</p>
              <p className="mt-1 text-xs font-semibold text-slate-800 lg:text-sm">
                {formatLocalDate(selectedDate.toDate())}
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
            <p className="mt-1 text-xs text-slate-500">dias con pagos registrados</p>
          </div>
          <div className="mt-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Riesgo</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{criticalMilestones.length}</p>
            <p className="mt-1 text-xs text-slate-500">hitos criticos detectados</p>
          </div>
          <div className="mt-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Dia seleccionado</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {selectedMilestone?.label ?? 'Sin hitos registrados'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {selectedMilestone
                ? `${selectedMilestone.count} movimientos por ${formatearMonto(selectedMilestone.amount)}`
                : 'Selecciona un dia del calendario para revisar su detalle.'}
            </p>
          </div>
          <div className="mt-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Meta activa</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {activeEvent?.nombre ?? 'Sin evento vigente'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {activeEvent
                ? `${activeEvent.cuotasPagadas} cuotas pagadas y ${activeEvent.cuotasPendientes} pendientes`
                : 'Aqui veras el resumen del evento mas antiguo vigente.'}
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
