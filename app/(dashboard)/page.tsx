import type { Metadata } from 'next'
import { ROOT_DEV_EMAIL, ROLES_FINANCIERO, ROLES_JERARQUIA } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import type { Billetera, Cuota, Evento, Perfil, Transaccion, Votacion, Voto } from '@/lib/types'
import { modoEnMarchaActivo } from '@/lib/utils'
import { toDateKey } from './components/dashboard.utils'
import type {
  AdminStats,
  DashboardMovement,
  EventoActivo,
  MiCuota,
  PaymentMilestone,
  PendingVote,
  SaldoTotal,
} from './components/dashboard.types'

import TopBar          from './components/TopBar'
import BalanceCard     from './components/BalanceCard'
import MiCuotaCard    from './components/MiCuotaCard'
import AdminStatsStrip from './components/AdminStatsStrip'
import EventCard       from './components/EventCard'
import QuickActions    from './components/QuickActions'
import ActivityFeed    from './components/ActivityFeed'
import ModoEnMarchaBanner from './components/ModoEnMarchaBanner'
import PaymentCalendar from './components/PaymentCalendar'

export const metadata: Metadata = { title: 'Dashboard' }

/* ── Local types ─────────────────────────────────────────────────────────── */
type PerfilConCurso = Pick<Perfil, 'id' | 'nombre_completo' | 'rol' | 'curso_id'> & {
  cursos: { nombre: string; colegio: string; nivel: string | null; modo_en_marcha: boolean; fecha_inicio: string } | null
}
type CursoWallet   = Pick<Billetera, 'tipo' | 'saldo'>
type DashboardEvento = Pick<Evento, 'id' | 'nombre' | 'fecha_limite_pago' | 'monto_objetivo' | 'tipo_billetera'>
type DashboardCuota  = Pick<Cuota, 'id' | 'monto_total' | 'pagado' | 'fecha_pago'>
type DashboardTx     = Pick<Transaccion, 'id' | 'descripcion' | 'monto' | 'tipo' | 'estado' | 'fecha_registro'>
type DashboardVote   = Pick<Votacion, 'id' | 'tipo' | 'fecha_fin' | 'vuelta' | 'votos_si' | 'votos_no' | 'votos_abstencion' | 'total_votantes_habilitados'>
type DashboardVoteRow = Pick<Voto, 'id' | 'opcion' | 'votacion_id'>
interface VoteCounts { si: number; no: number; abstencion: number }

/* ── Pure helpers ────────────────────────────────────────────────────────── */
function buildBalance(billeteras: CursoWallet[]): SaldoTotal {
  const apoderados = billeteras.find((w) => w.tipo === 'apoderados')?.saldo ?? 0
  const alumnos    = billeteras.find((w) => w.tipo === 'alumnos')?.saldo ?? 0
  return { total: apoderados + alumnos, apoderados, alumnos }
}

function buildActiveEvent(evento: DashboardEvento | null, cuotas: DashboardCuota[]): EventoActivo | null {
  if (!evento) return null
  const pagadas = cuotas.filter((c) => c.pagado)
  const montoRecaudado = pagadas.reduce((sum, c) => sum + c.monto_total, 0)
  const montoPendiente = Math.max(evento.monto_objetivo - montoRecaudado, 0)
  return {
    id: evento.id,
    nombre: evento.nombre,
    fechaLimitePago: evento.fecha_limite_pago,
    montoObjetivo: evento.monto_objetivo,
    montoRecaudado,
    montoPendiente,
    porcentajeRecaudacion: evento.monto_objetivo > 0 ? montoRecaudado / evento.monto_objetivo : 0,
    cuotasPagadas: pagadas.length,
    cuotasPendientes: cuotas.length - pagadas.length,
    tipoBilletera: evento.tipo_billetera,
  }
}

function buildMilestones(
  activeEvent: EventoActivo | null,
  cuotas: DashboardCuota[],
  movimientos: DashboardMovement[],
): PaymentMilestone[] {
  const map = new Map<string, PaymentMilestone>()
  const add = (m: PaymentMilestone) => {
    const cur = map.get(m.date)
    if (!cur) { map.set(m.date, m); return }
    map.set(m.date, {
      date: m.date,
      status: cur.status === 'critical' ? 'critical' : m.status,
      count: cur.count + m.count,
      amount: cur.amount + m.amount,
      label: cur.status === 'critical' ? cur.label : m.label,
    })
  }

  cuotas.filter((c) => c.pagado && c.fecha_pago).forEach((c) =>
    add({ date: toDateKey(c.fecha_pago!), status: 'success', count: 1, amount: c.monto_total, label: 'Pago registrado' })
  )
  if (activeEvent?.cuotasPendientes) {
    add({
      date: toDateKey(activeEvent.fechaLimitePago),
      status: 'critical',
      count: activeEvent.cuotasPendientes,
      amount: activeEvent.montoPendiente,
      label: `${activeEvent.cuotasPendientes} cuotas pendientes al cierre`,
    })
  }
  if (!map.size) {
    movimientos.filter((m) => m.tipo === 'cuota_ingreso').slice(0, 6).forEach((m) =>
      add({ date: toDateKey(m.fechaRegistro), status: 'success', count: 1, amount: m.monto, label: 'Ingreso confirmado' })
    )
  }
  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date))
}

function buildVoteCountMap(votes: DashboardVoteRow[]): Map<string, VoteCounts> {
  const counts = new Map<string, VoteCounts>()
  for (const v of votes) {
    const cur = counts.get(v.votacion_id) ?? { si: 0, no: 0, abstencion: 0 }
    if (v.opcion === 'si')         cur.si += 1
    if (v.opcion === 'no')         cur.no += 1
    if (v.opcion === 'abstencion') cur.abstencion += 1
    counts.set(v.votacion_id, cur)
  }
  return counts
}

function getRootFallbackData() {
  const today    = new Date()
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
  const twoDaysAgo = new Date(today); twoDaysAgo.setDate(today.getDate() - 2)
  const deadline   = new Date(today); deadline.setDate(today.getDate() + 5)

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
    { id: 'root-dev-tx-1', descripcion: 'Pago apoderado aprobado',      monto: 28000, fechaRegistro: today.toISOString(),      estado: 'aprobada',            tipo: 'cuota_ingreso' },
    { id: 'root-dev-tx-2', descripcion: 'Compra de materiales validada', monto: 12000, fechaRegistro: yesterday.toISOString(),  estado: 'aprobada',            tipo: 'gasto_egreso'  },
    { id: 'root-dev-tx-3', descripcion: 'Segundo ingreso registrado',    monto: 35000, fechaRegistro: twoDaysAgo.toISOString(), estado: 'pendiente_validacion', tipo: 'cuota_ingreso' },
  ]
  const milestones: PaymentMilestone[] = [
    { date: toDateKey(twoDaysAgo), status: 'success',  count: 2, amount: 35000,              label: 'Ingreso confirmado' },
    { date: toDateKey(yesterday),  status: 'success',  count: 1, amount: 28000,              label: 'Pago registrado'    },
    { date: toDateKey(deadline),   status: 'critical', count: 6, amount: activeEvent.montoPendiente, label: '6 cuotas pendientes al cierre' },
  ]
  return {
    balance: { total: 185000, apoderados: 132000, alumnos: 53000 } satisfies SaldoTotal,
    activeEvent,
    milestones,
    transacciones,
    votaciones: [] as PendingVote[],
    courseName: 'Panel Root',
    courseSubtitle: 'Modo desarrollo',
    userName: 'Admin',
    userRole: 'fundador',
  }
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const isRootDev = user.email?.toLowerCase() === ROOT_DEV_EMAIL

  const { data: perfilData } = await supabase
    .from('perfiles')
    .select('id, nombre_completo, rol, curso_id, cursos(nombre, colegio, nivel, modo_en_marcha, fecha_inicio)')
    .eq('id', user.id)
    .single()
  const perfil = perfilData as PerfilConCurso | null
  if (!perfil && !isRootDev) return null

  /* ── Data ── */
  let balance:        SaldoTotal
  let activeEvent:    EventoActivo | null
  let milestones:     PaymentMilestone[]
  let transacciones:  DashboardMovement[]
  let votaciones:     PendingVote[]
  let courseName:     string
  let courseSubtitle: string
  let userName:       string
  let userRole:       string
  let pendingCount:   number
  let miCuota:        MiCuota | null
  let adminStats:     AdminStats | null
  let modoEnMarcha:   { activo: boolean; fechaInicio: string } | null

  if (!perfil && isRootDev) {
    const fb = getRootFallbackData()
    ;({ balance, activeEvent, milestones, transacciones, votaciones, courseName, courseSubtitle, userName, userRole } = fb)
    pendingCount = 0
    miCuota      = null
    adminStats   = { pendingApprovals: 0, pendingTransactions: 3 }
    modoEnMarcha = { activo: true, fechaInicio: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() }
  } else {
    const [
      { data: billeterasData },
      { data: eventosData },
      { data: transaccionesData },
      { data: votacionesData },
    ] = await Promise.all([
      supabase.from('billeteras').select('tipo, saldo').eq('curso_id', perfil!.curso_id),
      supabase.from('eventos').select('id, nombre, fecha_limite_pago, monto_objetivo, tipo_billetera')
        .eq('curso_id', perfil!.curso_id).eq('estado', 'activo')
        .order('fecha_limite_pago', { ascending: true }).limit(1),
      supabase.from('transacciones').select('id, descripcion, monto, tipo, estado, fecha_registro')
        .eq('curso_id', perfil!.curso_id).order('fecha_registro', { ascending: false }).limit(6),
      supabase.from('votaciones')
        .select('id, tipo, fecha_fin, vuelta, votos_si, votos_no, votos_abstencion, total_votantes_habilitados')
        .eq('curso_id', perfil!.curso_id).in('estado', ['primera_vuelta', 'segunda_vuelta'])
        .order('fecha_fin', { ascending: true }).limit(4),
    ])

    const evento = ((eventosData ?? [])[0] ?? null) as DashboardEvento | null
    const { data: cuotasData } = evento
      ? await supabase.from('cuotas').select('id, monto_total, pagado, fecha_pago')
          .eq('curso_id', perfil!.curso_id).eq('evento_id', evento.id)
      : { data: [] as DashboardCuota[] }

    const billeteras    = (billeterasData ?? []) as CursoWallet[]
    const cuotas        = (cuotasData ?? []) as DashboardCuota[]
    const dashboardVotes = (votacionesData ?? []) as DashboardVote[]
    const { data: voteRowsData } = dashboardVotes.length > 0
      ? await supabase.from('votos').select('id, opcion, votacion_id').in('votacion_id', dashboardVotes.map((v) => v.id))
      : { data: [] as DashboardVoteRow[] }
    const voteCountMap = buildVoteCountMap((voteRowsData ?? []) as DashboardVoteRow[])

    transacciones = ((transaccionesData ?? []) as DashboardTx[]).map((tx) => ({
      id: tx.id, descripcion: tx.descripcion, monto: tx.monto,
      fechaRegistro: tx.fecha_registro, estado: tx.estado, tipo: tx.tipo,
    }))
    votaciones = dashboardVotes.map((v) => {
      const live = voteCountMap.get(v.id)
      return {
        id: v.id, tipo: v.tipo, fechaFin: v.fecha_fin, vuelta: v.vuelta,
        votosEmitidos: live ? live.si + live.no + live.abstencion : v.votos_si + v.votos_no + v.votos_abstencion,
        totalVotantes: v.total_votantes_habilitados,
      }
    })
    balance        = buildBalance(billeteras)
    activeEvent    = buildActiveEvent(evento, cuotas)
    milestones     = buildMilestones(activeEvent, cuotas, transacciones)
    courseName     = perfil!.cursos?.nombre ?? 'Curso sin nombre'
    courseSubtitle = [perfil!.cursos?.nivel, perfil!.cursos?.colegio].filter(Boolean).join(' · ')
    userName       = perfil!.nombre_completo ?? user.email ?? '—'
    userRole       = perfil!.rol ?? 'alumno'

    // Conteo de pendientes sólo para roles con permiso de aprobación
    if (ROLES_JERARQUIA.includes(perfil!.rol)) {
      const { count } = await supabase
        .from('perfiles')
        .select('id', { count: 'exact', head: true })
        .eq('curso_id', perfil!.curso_id)
        .eq('estado', 'pendiente')
      pendingCount = count ?? 0
    } else {
      pendingCount = 0
    }

    // Cuota personal (sólo apoderado)
    if (perfil!.rol === 'apoderado' && activeEvent) {
      const { data: cuotaRaw } = await supabase
        .from('cuotas')
        .select('monto_total, monto_unitario, cantidad_alumnos, pagado, fecha_pago')
        .eq('apoderado_id', perfil!.id)
        .eq('evento_id', activeEvent.id)
        .maybeSingle()
      const c = cuotaRaw as { monto_total: number; monto_unitario: number; cantidad_alumnos: number; pagado: boolean; fecha_pago: string | null } | null
      miCuota = c
        ? { montoTotal: c.monto_total, montoUnitario: c.monto_unitario, cantidadAlumnos: c.cantidad_alumnos, pagado: c.pagado, fechaPago: c.fecha_pago }
        : null
    } else {
      miCuota = null
    }

    // Stats admin (roles financieros)
    if (ROLES_FINANCIERO.includes(perfil!.rol)) {
      const { count: txCount } = await supabase
        .from('transacciones')
        .select('id', { count: 'exact', head: true })
        .eq('curso_id', perfil!.curso_id)
        .in('estado', ['pendiente_validacion', 'pendiente_aprobacion'])
      adminStats = { pendingApprovals: pendingCount, pendingTransactions: txCount ?? 0 }
    } else {
      adminStats = null
    }

    // Modo En Marcha: activo si el campo está encendido Y no han pasado 30 días
    if (perfil!.cursos?.modo_en_marcha) {
      const fechaInicio = perfil!.cursos.fecha_inicio
      modoEnMarcha = { activo: modoEnMarchaActivo(fechaInicio), fechaInicio }
    } else {
      modoEnMarcha = null
    }
  }

  const referenceDate = activeEvent?.fechaLimitePago ?? toDateKey(new Date())

  /* ── Render ── */
  const esApoderado = userRole === 'apoderado'

  return (
    <>
      <TopBar
        courseName={courseName}
        courseSubtitle={courseSubtitle}
        userName={userName}
        userRole={userRole}
      />

      {adminStats && (
        <AdminStatsStrip stats={adminStats} userRole={userRole} />
      )}

      {modoEnMarcha?.activo && (
        <ModoEnMarchaBanner
          fechaInicio={modoEnMarcha.fechaInicio}
          esFundador={userRole === 'fundador'}
        />
      )}

      {/* ── Desktop: 3-column grid ─────────────────────────── */}
      <div className="hidden flex-1 gap-3 overflow-hidden p-3 lg:grid lg:grid-cols-[26%_1fr_26%]">

        {/* Left column: balance + event */}
        <div className="flex min-h-0 flex-col gap-3">
          {esApoderado
            ? <MiCuotaCard cuota={miCuota} activeEvent={activeEvent} />
            : <BalanceCard balance={balance} />
          }
          <EventCard activeEvent={activeEvent} />
        </div>

        {/* Center: calendar */}
        <div className="min-h-0">
          <PaymentCalendar
            activeEvent={activeEvent}
            milestones={milestones}
            referenceDate={referenceDate}
          />
        </div>

        {/* Right column: actions + feed */}
        <div className="flex min-h-0 flex-col gap-3">
          <QuickActions userRole={userRole} pendingCount={pendingCount} />
          <ActivityFeed transacciones={transacciones} votaciones={votaciones} />
        </div>

      </div>

      {/* ── Mobile: single scrollable column ──────────────── */}
      <div
        className="flex flex-col gap-3 overflow-y-auto p-3 lg:hidden"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1.5rem)' }}
      >
        <QuickActions />
        <BalanceCard balance={balance} />
        <EventCard activeEvent={activeEvent} />
        <PaymentCalendar
          activeEvent={activeEvent}
          milestones={milestones}
          referenceDate={referenceDate}
        />
        <ActivityFeed transacciones={transacciones} votaciones={votaciones} />
      </div>
    </>
  )
}
