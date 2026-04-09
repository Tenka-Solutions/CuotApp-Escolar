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
  milestones:  PaymentMilestone[]
  referenceDate: string
}

interface CalendarDayProps extends PickersDayProps {
  deadlineKey?: string
  milestoneMap?: Record<string, PaymentMilestone>
}

function CalendarDay({ day, outsideCurrentMonth, deadlineKey, milestoneMap = {}, ...other }: CalendarDayProps) {
  const key       = day.format('YYYY-MM-DD')
  const milestone = milestoneMap[key]
  const isDeadline = key === deadlineKey
  const tone = (milestone?.status ?? 'none') as 'none' | 'success' | 'critical'

  const badgeColor = tone === 'critical' ? '#ef4444' : tone === 'success' ? '#22c55e' : 'transparent'
  const bg =
    tone === 'critical' ? 'rgba(254,242,242,0.95)' :
    tone === 'success'  ? 'rgba(240,253,244,0.98)' :
    outsideCurrentMonth ? 'transparent'             : 'rgba(248,250,252,0.85)'

  return (
    <Badge
      overlap="circular"
      variant="dot"
      invisible={!milestone}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{ '& .MuiBadge-badge': { backgroundColor: badgeColor, boxShadow: '0 0 0 2px white', height: 6, minWidth: 6 } }}
    >
      <PickersDay
        day={day}
        outsideCurrentMonth={outsideCurrentMonth}
        disableMargin
        {...other}
        sx={{
          fontSize: { xs: '0.65rem', lg: '0.72rem' },
          fontWeight: 600,
          color: outsideCurrentMonth ? '#94a3b8' : '#334155',
          backgroundColor: bg,
          border: isDeadline ? '1.5px solid var(--color-brand-300)' : '1px solid transparent',
          borderRadius: '10px',
          mx: 0,
          width:  { xs: 32, lg: 36 },
          height: { xs: 30, lg: 34 },
          opacity: outsideCurrentMonth ? 0.3 : 1,
          '&:hover': {
            backgroundColor:
              tone === 'critical' ? 'rgba(254,226,226,1)' :
              tone === 'success'  ? 'rgba(220,252,231,1)' : 'rgba(237,233,254,0.8)',
          },
          '&.MuiPickersDay-today': {
            border: '1.5px solid var(--color-brand-400)',
            backgroundColor: tone === 'none' ? 'rgba(233,213,255,0.5)' : bg,
          },
          '&.Mui-selected': { color: '#1e1b4b', backgroundColor: 'var(--color-brand-100)', border: '1.5px solid var(--color-brand-300)' },
          '&.Mui-selected:hover': { backgroundColor: 'var(--color-brand-200)' },
        }}
      />
    </Badge>
  )
}

export default function PaymentCalendar({ activeEvent, milestones, referenceDate }: PaymentCalendarProps) {
  const deadlineKey  = activeEvent ? toDateKey(activeEvent.fechaLimitePago) : undefined
  const milestoneMap = Object.fromEntries(milestones.map((m) => [m.date, m])) as Record<string, PaymentMilestone>
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs(referenceDate))

  const progress           = Math.round((activeEvent?.porcentajeRecaudacion ?? 0) * 100)
  const successMilestones  = milestones.filter((m) => m.status === 'success')
  const criticalMilestones = milestones.filter((m) => m.status === 'critical')
  const selectedMilestone  = milestoneMap[selectedDate.format('YYYY-MM-DD')] ?? null

  const CalendarDaySlot = (p: PickersDayProps) => (
    <CalendarDay {...p} deadlineKey={deadlineKey} milestoneMap={milestoneMap} />
  )

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-sm lg:rounded-[2rem]">
      {/* Header */}
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Seguimiento</p>
          <div className="mt-1 flex items-center gap-2">
            <CalendarRange className="h-4 w-4 text-brand-600" />
            <h2 className="text-sm font-semibold text-slate-900">Calendario de Pagos</h2>
          </div>
          <p className="mt-0.5 text-xs capitalize text-slate-400">{formatMonthLabel(referenceDate)}</p>
        </div>
        {activeEvent ? (
          <div className="shrink-0 rounded-full bg-success-50 px-3 py-1 text-xs font-semibold text-success-600">
            {progress}% cumplido
          </div>
        ) : (
          <div className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-400">
            Sin evento
          </div>
        )}
      </div>

      {/* Body: calendar + sidebar */}
      <div className="flex min-h-0 flex-1 overflow-hidden">

        {/* Calendar column */}
        <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-hidden p-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-1">
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
              <DateCalendar
                value={selectedDate}
                onChange={(v) => v && setSelectedDate(v)}
                showDaysOutsideCurrentMonth
                reduceAnimations
                views={['day']}
                slots={{ day: CalendarDaySlot }}
                sx={{
                  width: '100%',
                  maxWidth: 380,
                  height: 'auto',
                  mx: 'auto',
                  backgroundColor: 'transparent',
                  '& .MuiPickersCalendarHeader-root': { paddingLeft: 1, paddingRight: 1, marginTop: 0, marginBottom: 0, minHeight: 40 },
                  '& .MuiPickersCalendarHeader-label': { fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', textTransform: 'capitalize' },
                  '& .MuiDayCalendar-weekDayLabel': { fontFamily: 'inherit', fontSize: '0.6rem', fontWeight: 700, color: '#94a3b8', width: { xs: 32, lg: 36 }, height: { xs: 20, lg: 22 } },
                  '& .MuiPickersArrowSwitcher-button': { color: 'var(--color-brand-600)', padding: '4px' },
                  '& .MuiDayCalendar-slideTransition': { minHeight: { xs: 190, lg: 220 } },
                  '& .MuiDayCalendar-monthContainer': { rowGap: { xs: 2, lg: 4 } },
                }}
              />
            </LocalizationProvider>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Recaudado', value: formatearMonto(activeEvent?.montoRecaudado ?? 0) },
              { label: 'Pendiente', value: formatearMonto(activeEvent?.montoPendiente ?? 0) },
              { label: 'Selección', value: formatLocalDate(selectedDate.toDate()) },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-[9px] uppercase tracking-wider text-slate-400">{label}</p>
                <p className="mt-0.5 text-xs font-semibold text-slate-700">{value}</p>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400">
            <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-success-500" /> Pago</span>
            <span className="inline-flex items-center gap-1"><AlertCircle  className="h-3 w-3 text-danger-500"  /> Crítico</span>
            {activeEvent && <span className="inline-flex items-center gap-1"><Flag className="h-3 w-3 text-brand-500" /> {activeEvent.nombre}</span>}
          </div>
        </div>

        {/* Sidebar — desktop only */}
        <aside className="hidden w-52 shrink-0 flex-col gap-2 overflow-y-auto border-l border-slate-100 bg-slate-50/40 p-4 lg:flex">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Vista ejecutiva</p>

          {[
            { label: 'Actividad',      value: String(successMilestones.length),  sub: 'días con pagos'    },
            { label: 'Riesgo',         value: String(criticalMilestones.length), sub: 'hitos críticos'   },
          ].map(({ label, value, sub }) => (
            <div key={label} className="rounded-xl bg-white px-3 py-2.5 shadow-sm">
              <p className="text-[9px] uppercase tracking-wider text-slate-400">{label}</p>
              <p className="mt-0.5 text-xl font-bold text-slate-900">{value}</p>
              <p className="text-[10px] text-slate-400">{sub}</p>
            </div>
          ))}

          <div className="rounded-xl bg-white px-3 py-2.5 shadow-sm">
            <p className="text-[9px] uppercase tracking-wider text-slate-400">Día seleccionado</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-800">{selectedMilestone?.label ?? 'Sin hitos'}</p>
            <p className="text-[10px] text-slate-400">
              {selectedMilestone
                ? `${selectedMilestone.count} mov · ${formatearMonto(selectedMilestone.amount)}`
                : 'Selecciona un día'}
            </p>
          </div>

          <div className="rounded-xl bg-white px-3 py-2.5 shadow-sm">
            <p className="text-[9px] uppercase tracking-wider text-slate-400">Meta activa</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-800">{activeEvent?.nombre ?? 'Sin evento'}</p>
            <p className="text-[10px] text-slate-400">
              {activeEvent
                ? `${activeEvent.cuotasPagadas} pagadas · ${activeEvent.cuotasPendientes} pendientes`
                : 'El próximo evento aparecerá aquí.'}
            </p>
          </div>

          <div className="mt-auto flex flex-col gap-1.5 border-t border-slate-200 pt-3 text-[10px] text-slate-400">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-success-500" /> Pago registrado</span>
            <span className="inline-flex items-center gap-1.5"><AlertCircle  className="h-3 w-3 text-danger-500"  /> Hito crítico</span>
            {activeEvent && <span className="inline-flex items-center gap-1.5"><Flag className="h-3 w-3 text-brand-500" /> {activeEvent.nombre}</span>}
          </div>
        </aside>
      </div>
    </section>
  )
}
