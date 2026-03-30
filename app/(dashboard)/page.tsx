import type { Metadata } from 'next'
import {
  ArrowDownRight,
  ArrowUpRight,
  Clock3,
  ReceiptText,
  Vote,
} from 'lucide-react'
import { ROOT_DEV_EMAIL } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import type {
  Billetera,
  Cuota,
  Evento,
  Perfil,
  Transaccion,
  Votacion,
} from '@/lib/types'
import { cn, formatearMonto, tiempoRelativo } from '@/lib/utils'
import ActionButtonGrid from './components/ActionButtonGrid'
import BalanceHeader from './components/BalanceHeader'
import PaymentCalendar from './components/PaymentCalendar'
import type {
  DashboardMovement,
  EventoActivo,
  PaymentMilestone,
  PendingVote,
  SaldoTotal,
} from './components/dashboard.types'
import { formatLocalDate, toDateKey } from './components/dashboard.utils'

export const metadata: Metadata = { title: 'Dashboard' }

type PerfilConCurso = Pick<Perfil, 'id' | 'nombre_completo' | 'rol' | 'curso_id'> & {
  cursos: {
    nombre: string
    colegio: string
    nivel: string | null
    modo_en_marcha: boolean
  } | null
}

type CursoWallet = Pick<Billetera, 'tipo' | 'saldo'>
type DashboardEvento = Pick<
  Evento,
  'id' | 'nombre' | 'fecha_limite_pago' | 'monto_objetivo' | 'tipo_billetera'
>
type DashboardCuota = Pick<Cuota, 'id' | 'monto_total' | 'pagado' | 'fecha_pago'>
type DashboardTx = Pick<
  Transaccion,
  'id' | 'descripcion' | 'monto' | 'tipo' | 'estado' | 'fecha_registro'
>
type DashboardVote = Pick<
  Votacion,
  'id' | 'tipo' | 'fecha_fin' | 'vuelta' | 'votos_si' | 'votos_no' | 'votos_abstencion' | 'total_votantes_habilitados'
>

function buildBalance(billeteras: CursoWallet[]): SaldoTotal {
  const apoderados = billeteras.find((wallet) => wallet.tipo === 'apoderados')?.saldo ?? 0
  const alumnos = billeteras.find((wallet) => wallet.tipo === 'alumnos')?.saldo ?? 0

  return {
    total: apoderados + alumnos,
    apoderados,
    alumnos,
  }
}

function buildActiveEvent(
  evento: DashboardEvento | null,
  cuotas: DashboardCuota[]
): EventoActivo | null {
  if (!evento) return null

  const pagadas = cuotas.filter((cuota) => cuota.pagado)
  const montoRecaudado = pagadas.reduce((total, cuota) => total + cuota.monto_total, 0)
  const montoPendiente = Math.max(evento.monto_objetivo - montoRecaudado, 0)
  const cuotasPendientes = cuotas.length - pagadas.length

  return {
    id: evento.id,
    nombre: evento.nombre,
    fechaLimitePago: evento.fecha_limite_pago,
    montoObjetivo: evento.monto_objetivo,
    montoRecaudado,
    montoPendiente,
    porcentajeRecaudacion: evento.monto_objetivo > 0 ? montoRecaudado / evento.monto_objetivo : 0,
    cuotasPagadas: pagadas.length,
    cuotasPendientes,
    tipoBilletera: evento.tipo_billetera,
  }
}

function buildMilestones(
  activeEvent: EventoActivo | null,
  cuotas: DashboardCuota[],
  movimientos: DashboardMovement[]
): PaymentMilestone[] {
  const groupedMilestones = new Map<string, PaymentMilestone>()

  const registerMilestone = (milestone: PaymentMilestone) => {
    const current = groupedMilestones.get(milestone.date)
    if (!current) {
      groupedMilestones.set(milestone.date, milestone)
      return
    }

    groupedMilestones.set(milestone.date, {
      date: milestone.date,
      status: current.status === 'critical' ? 'critical' : milestone.status,
      count: current.count + milestone.count,
      amount: current.amount + milestone.amount,
      label: current.status === 'critical' ? current.label : milestone.label,
    })
  }

  cuotas
    .filter((cuota) => cuota.pagado && cuota.fecha_pago)
    .forEach((cuota) => {
      registerMilestone({
        date: toDateKey(cuota.fecha_pago!),
        status: 'success',
        count: 1,
        amount: cuota.monto_total,
        label: 'Pago registrado',
      })
    })

  if (activeEvent?.cuotasPendientes) {
    registerMilestone({
      date: toDateKey(activeEvent.fechaLimitePago),
      status: 'critical',
      count: activeEvent.cuotasPendientes,
      amount: activeEvent.montoPendiente,
      label: `${activeEvent.cuotasPendientes} cuotas pendientes al cierre`,
    })
  }

  if (!groupedMilestones.size) {
    movimientos
      .filter((movimiento) => movimiento.tipo === 'cuota_ingreso')
      .slice(0, 6)
      .forEach((movimiento) => {
        registerMilestone({
          date: toDateKey(movimiento.fechaRegistro),
          status: 'success',
          count: 1,
          amount: movimiento.monto,
          label: 'Ingreso confirmado',
        })
      })
  }

  return [...groupedMilestones.values()].sort((a, b) => a.date.localeCompare(b.date))
}

function transactionTone(tipo: DashboardMovement['tipo']): 'success' | 'danger' {
  return tipo === 'gasto_egreso' ? 'danger' : 'success'
}

function transactionStatusLabel(estado: DashboardMovement['estado']): string {
  switch (estado) {
    case 'aprobada':
      return 'Aprobada'
    case 'pendiente_aprobacion':
      return 'Pend. aprob.'
    case 'pendiente_validacion':
      return 'Pend. valid.'
    case 'rechazada':
      return 'Rechazada'
    default:
      return estado
  }
}

function voteTypeLabel(tipo: PendingVote['tipo']): string {
  switch (tipo) {
    case 'gasto':
      return 'Votacion de gasto'
    case 'cierre_evento':
      return 'Cierre de evento'
    case 'destino_sobrante':
      return 'Destino de sobrante'
    default:
      return tipo
  }
}

function getRootFallbackData() {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const twoDaysAgo = new Date(today)
  twoDaysAgo.setDate(today.getDate() - 2)
  const deadline = new Date(today)
  deadline.setDate(today.getDate() + 5)

  const activeEvent: EventoActivo = {
    id: 'root-dev-event',
    nombre: 'Salida pedagógica de prueba',
    fechaLimitePago: toDateKey(deadline),
    montoObjetivo: 240000,
    montoRecaudado: 168000,
    montoPendiente: 72000,
    porcentajeRecaudacion: 0.7,
    cuotasPagadas: 14,
    cuotasPendientes: 6,
    tipoBilletera: 'apoderados',
  }

  const transacciones: DashboardMovement[] = [
    {
      id: 'root-dev-tx-1',
      descripcion: 'Pago apoderado aprobado',
      monto: 28000,
      fechaRegistro: today.toISOString(),
      estado: 'aprobada',
      tipo: 'cuota_ingreso',
    },
    {
      id: 'root-dev-tx-2',
      descripcion: 'Compra de materiales validada',
      monto: 12000,
      fechaRegistro: yesterday.toISOString(),
      estado: 'aprobada',
      tipo: 'gasto_egreso',
    },
    {
      id: 'root-dev-tx-3',
      descripcion: 'Segundo ingreso registrado',
      monto: 35000,
      fechaRegistro: twoDaysAgo.toISOString(),
      estado: 'pendiente_validacion',
      tipo: 'cuota_ingreso',
    },
  ]

  const milestones: PaymentMilestone[] = [
    {
      date: toDateKey(twoDaysAgo),
      status: 'success',
      count: 2,
      amount: 35000,
      label: 'Ingreso confirmado',
    },
    {
      date: toDateKey(yesterday),
      status: 'success',
      count: 1,
      amount: 28000,
      label: 'Pago registrado',
    },
    {
      date: toDateKey(deadline),
      status: 'critical',
      count: activeEvent.cuotasPendientes,
      amount: activeEvent.montoPendiente,
      label: `${activeEvent.cuotasPendientes} cuotas pendientes al cierre`,
    },
  ]

  return {
    balance: {
      total: 185000,
      apoderados: 132000,
      alumnos: 53000,
    } satisfies SaldoTotal,
    activeEvent,
    milestones,
    transacciones,
    votaciones: [] as PendingVote[],
    courseName: 'Panel Root',
    courseSubtitle: 'Modo desarrollo | Supabase Auth conectado',
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null
  const isRootDev = user.email?.toLowerCase() === ROOT_DEV_EMAIL

  const { data: perfilData } = await supabase
    .from('perfiles')
    .select('id, nombre_completo, rol, curso_id, cursos(nombre, colegio, nivel, modo_en_marcha)')
    .eq('id', user.id)
    .single()

  const perfil = perfilData as PerfilConCurso | null
  if (!perfil && !isRootDev) return null

  let balance: SaldoTotal
  let activeEvent: EventoActivo | null
  let milestones: PaymentMilestone[]
  let transacciones: DashboardMovement[]
  let votaciones: PendingVote[]
  let courseName: string
  let courseSubtitle: string

  if (!perfil && isRootDev) {
    const rootFallback = getRootFallbackData()
    balance = rootFallback.balance
    activeEvent = rootFallback.activeEvent
    milestones = rootFallback.milestones
    transacciones = rootFallback.transacciones
    votaciones = rootFallback.votaciones
    courseName = rootFallback.courseName
    courseSubtitle = rootFallback.courseSubtitle
  } else {
    const [
      { data: billeterasData },
      { data: eventosData },
      { data: transaccionesData },
      { data: votacionesData },
    ] = await Promise.all([
      supabase
        .from('billeteras')
        .select('tipo, saldo')
        .eq('curso_id', perfil!.curso_id),
      supabase
        .from('eventos')
        .select('id, nombre, fecha_limite_pago, monto_objetivo, tipo_billetera')
        .eq('curso_id', perfil!.curso_id)
        .eq('estado', 'activo')
        .order('fecha_limite_pago', { ascending: true })
        .limit(1),
      supabase
        .from('transacciones')
        .select('id, descripcion, monto, tipo, estado, fecha_registro')
        .eq('curso_id', perfil!.curso_id)
        .order('fecha_registro', { ascending: false })
        .limit(4),
      supabase
        .from('votaciones')
        .select('id, tipo, fecha_fin, vuelta, votos_si, votos_no, votos_abstencion, total_votantes_habilitados')
        .eq('curso_id', perfil!.curso_id)
        .in('estado', ['primera_vuelta', 'segunda_vuelta'])
        .order('fecha_fin', { ascending: true })
        .limit(4),
    ])

    const evento = ((eventosData ?? [])[0] ?? null) as DashboardEvento | null

    const { data: cuotasData } = evento
      ? await supabase
          .from('cuotas')
          .select('id, monto_total, pagado, fecha_pago')
          .eq('curso_id', perfil!.curso_id)
          .eq('evento_id', evento.id)
      : { data: [] as DashboardCuota[] }

    const billeteras = (billeterasData ?? []) as CursoWallet[]
    const cuotas = (cuotasData ?? []) as DashboardCuota[]
    transacciones = ((transaccionesData ?? []) as DashboardTx[]).map((tx) => ({
      id: tx.id,
      descripcion: tx.descripcion,
      monto: tx.monto,
      fechaRegistro: tx.fecha_registro,
      estado: tx.estado,
      tipo: tx.tipo,
    }))
    votaciones = ((votacionesData ?? []) as DashboardVote[]).map((vote) => ({
      id: vote.id,
      tipo: vote.tipo,
      fechaFin: vote.fecha_fin,
      vuelta: vote.vuelta,
      votosEmitidos: vote.votos_si + vote.votos_no + vote.votos_abstencion,
      totalVotantes: vote.total_votantes_habilitados,
    }))

    balance = buildBalance(billeteras)
    activeEvent = buildActiveEvent(evento, cuotas)
    milestones = buildMilestones(activeEvent, cuotas, transacciones)
    courseName = perfil!.cursos?.nombre ?? 'Curso sin nombre'
    courseSubtitle = [perfil!.cursos?.nivel, perfil!.cursos?.colegio].filter(Boolean).join(' | ')
  }

  const referenceDate = activeEvent?.fechaLimitePago ?? toDateKey(new Date())
  const showMovements = transacciones.length > 0
  const upcomingVote = votaciones[0] ?? null
  const completionCopy = activeEvent
    ? `${Math.round(activeEvent.porcentajeRecaudacion * 100)}% de la meta completada`
    : 'Aún no hay un evento activo para medir recaudación.'
  const pendingFocusCopy = activeEvent
    ? `${activeEvent.cuotasPendientes} cuotas pendientes y cierre ${formatLocalDate(activeEvent.fechaLimitePago)}`
    : 'El próximo evento activo aparecerá aquí automáticamente.'

  return (
    <div className="grid h-full min-h-0 grid-rows-[20%_45%_minmax(0,1fr)] overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.10),_transparent_45%),linear-gradient(180deg,_#f8fbff_0%,_#f8fafc_100%)] lg:grid-rows-[minmax(14rem,24%)_minmax(24rem,43%)_minmax(20rem,1fr)]">
      <BalanceHeader
        balance={balance}
        activeEvent={activeEvent}
        courseName={courseName}
        courseSubtitle={courseSubtitle || 'Gobernanza y finanzas escolares'}
      />

      <main className="h-full px-4 py-3 md:px-6 lg:px-0 lg:py-4">
        <div className="flex h-full gap-3 lg:gap-5">
          <div className="min-w-[6rem] flex-[30] lg:min-w-[18rem] lg:max-w-[22rem]">
            <ActionButtonGrid />
          </div>
          <div className="min-w-0 flex-[70]">
            <PaymentCalendar
              activeEvent={activeEvent}
              milestones={milestones}
              referenceDate={referenceDate}
            />
          </div>
        </div>
      </main>

      <section
        className="min-h-0 px-4 pt-1 md:px-6 lg:px-0"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)' }}
      >
        <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[minmax(0,1.5fr)_22rem] lg:gap-5">
          <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white/95 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.85)] lg:rounded-[2rem]">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 lg:px-5 lg:py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Seguimiento diario
                </p>
                <h2 className="mt-1 text-sm font-semibold text-slate-900 lg:text-base">
                  {showMovements ? 'Ultimos Movimientos' : 'Votaciones Pendientes'}
                </h2>
              </div>
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700 lg:px-3 lg:py-1.5 lg:text-xs">
                {showMovements ? `${transacciones.length} registros` : `${votaciones.length} abiertas`}
              </span>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 lg:px-5 lg:py-4">
              {showMovements ? (
                <div className="space-y-3 lg:space-y-4">
                  {transacciones.map((movimiento) => {
                    const tone = transactionTone(movimiento.tipo)
                    const isExpense = tone === 'danger'

                    return (
                      <article
                        key={movimiento.id}
                        className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/75 p-3 lg:items-center lg:gap-4 lg:p-4"
                      >
                        <div
                          className={cn(
                            'mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl lg:mt-0 lg:h-12 lg:w-12',
                            isExpense ? 'bg-danger-50 text-danger-600' : 'bg-success-50 text-success-600'
                          )}
                        >
                          {isExpense ? (
                            <ArrowDownRight className="h-5 w-5" />
                          ) : (
                            <ArrowUpRight className="h-5 w-5" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900 lg:text-base">
                            {movimiento.descripcion}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 lg:text-sm">
                            <Clock3 className="h-3.5 w-3.5" />
                            <span>{tiempoRelativo(movimiento.fechaRegistro)}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p
                            className={cn(
                              'text-sm font-bold lg:text-base',
                              isExpense ? 'text-danger-600' : 'text-success-600'
                            )}
                          >
                            {isExpense ? '-' : '+'}
                            {formatearMonto(movimiento.monto).replace('$', '$ ')}
                          </p>
                          <span
                            className={cn(
                              'mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold lg:text-[11px]',
                              movimiento.estado === 'aprobada'
                                ? 'bg-success-50 text-success-600'
                                : 'bg-warning-50 text-warning-600'
                            )}
                          >
                            {transactionStatusLabel(movimiento.estado)}
                          </span>
                        </div>
                      </article>
                    )
                  })}
                </div>
              ) : votaciones.length > 0 ? (
                <div className="space-y-3 lg:space-y-4">
                  {votaciones.map((votacion) => {
                    const participation =
                      votacion.totalVotantes > 0
                        ? Math.round((votacion.votosEmitidos / votacion.totalVotantes) * 100)
                        : 0

                    return (
                      <article
                        key={votacion.id}
                        className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/75 p-3 lg:items-center lg:gap-4 lg:p-4"
                      >
                        <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 lg:mt-0 lg:h-12 lg:w-12">
                          <Vote className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900 lg:text-base">
                            {voteTypeLabel(votacion.tipo)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500 lg:text-sm">
                            Vuelta {votacion.vuelta}
                            {votacion.fechaFin
                              ? ` | Cierra ${formatLocalDate(votacion.fechaFin, {
                                  month: 'short',
                                  day: 'numeric',
                                })}`
                              : ' | Sin cierre informado'}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-bold text-brand-700 lg:text-base">
                            {participation}%
                          </p>
                          <span className="mt-1 inline-flex rounded-full bg-brand-50 px-2 py-1 text-[10px] font-semibold text-brand-700 lg:text-[11px]">
                            Participacion
                          </span>
                        </div>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 text-center">
                  <ReceiptText className="h-8 w-8 text-slate-300" />
                  <p className="mt-3 text-sm font-semibold text-slate-700 lg:text-base">Todo al dia</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500 lg:max-w-md lg:text-sm">
                    Cuando existan movimientos o votaciones abiertas apareceran aqui.
                  </p>
                </div>
              )}
            </div>
          </div>

          <aside className="hidden h-full min-h-0 flex-col rounded-[2rem] border border-slate-200 bg-white/95 p-5 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.85)] lg:flex">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              Resumen ejecutivo
            </p>
            <div className="mt-4 rounded-2xl bg-brand-50 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-brand-700/70">
                Recaudacion
              </p>
              <p className="mt-2 text-base font-semibold text-brand-900">{completionCopy}</p>
              <p className="mt-1 text-xs leading-5 text-brand-700/80">{pendingFocusCopy}</p>
            </div>

            <div className="mt-3 rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                Proxima votacion
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {upcomingVote ? voteTypeLabel(upcomingVote.tipo) : 'Sin votaciones pendientes'}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {upcomingVote?.fechaFin
                  ? `Cierra ${formatLocalDate(upcomingVote.fechaFin, { month: 'short', day: 'numeric' })}`
                  : 'Cuando haya una votación abierta aparecerá aquí.'}
              </p>
            </div>

            <div className="mt-3 rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                Proximo foco
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {activeEvent ? 'Cerrar brecha de recaudacion' : 'Activar primer evento'}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {activeEvent
                  ? `Faltan ${formatearMonto(activeEvent.montoPendiente)} para completar la meta activa.`
                  : 'Una vez exista un evento activo verás aquí su próximo objetivo.'}
              </p>
            </div>

            <div className="mt-auto grid grid-cols-2 gap-3 pt-4">
              <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Movimientos</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{transacciones.length}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Votaciones</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{votaciones.length}</p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
