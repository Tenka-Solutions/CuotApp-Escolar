import type { Metadata } from 'next'
import { BarChart3, CalendarCheck, FileText, Wallet } from 'lucide-react'
import { ROOT_DEV_EMAIL, ROLES_JERARQUIA } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import type { Evento, Perfil, RolUsuario, Transaccion } from '@/lib/types'
import { formatearMonto } from '@/lib/utils'
import ModuleShell from '../../components/ModuleShell'
import CierreActions from './CierreActions'
import CerrarEventoButton from '../../eventos/CerrarEventoButton'

export const metadata: Metadata = { title: 'Cierre Anual' }

type PerfilCurso = Pick<Perfil, 'id' | 'curso_id' | 'rol'> & {
  cursos: { nombre: string; colegio: string; anio_escolar: number } | null
}
type EventoResumen = Pick<Evento, 'id' | 'nombre' | 'estado' | 'monto_objetivo' | 'fecha_limite_pago'>
type TxResumen = Pick<Transaccion, 'id' | 'monto' | 'tipo' | 'estado'>

export default async function CierreAnualPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const isRootDev = user.email?.toLowerCase() === ROOT_DEV_EMAIL
  const { data: perfilRaw } = await supabase
    .from('perfiles')
    .select('id, curso_id, rol, cursos(nombre, colegio, anio_escolar)')
    .eq('id', user.id)
    .single()
  const perfil = perfilRaw as PerfilCurso | null

  if (!perfil && !isRootDev) return null
  if (perfil && !ROLES_JERARQUIA.includes(perfil.rol as RolUsuario)) {
    return (
      <ModuleShell title="Cierre Anual" description="No tienes permiso para acceder a esta sección.">
        <p className="text-sm text-slate-500">Solo roles de jerarquía pueden ejecutar el cierre anual.</p>
      </ModuleShell>
    )
  }

  // Fetch summary data
  let cursoNombre = 'Curso'
  let anioEscolar = new Date().getFullYear()
  let cursoId = ''
  let eventos: EventoResumen[] = []
  let totalIngresos = 0
  let totalEgresos = 0
  let totalAprobadas = 0
  let totalPendientes = 0
  let hasActiveEvents = false
  let disabledMessage: string | null = null

  if (!perfil && isRootDev) {
    cursoNombre = 'Curso de Prueba'
    anioEscolar = 2026
    cursoId = 'root-curso'
    eventos = [
      { id: 'e1', nombre: 'Salida pedagógica', estado: 'cerrado', monto_objetivo: 240000, fecha_limite_pago: '2026-06-15' },
      { id: 'e2', nombre: 'Compra materiales', estado: 'cerrado', monto_objetivo: 80000, fecha_limite_pago: '2026-09-01' },
    ]
    totalIngresos = 320000
    totalEgresos = 45000
    totalAprobadas = 28
    totalPendientes = 0
    disabledMessage = 'Root dev: cierre simulado, no se ejecutará en la base.'
  } else if (perfil?.curso_id) {
    cursoId = perfil.curso_id
    cursoNombre = perfil.cursos?.nombre ?? 'Curso'
    anioEscolar = perfil.cursos?.anio_escolar ?? new Date().getFullYear()

    const [{ data: eventosData }, { data: txData }, { count: activeCount }] = await Promise.all([
      supabase.from('eventos')
        .select('id, nombre, estado, monto_objetivo, fecha_limite_pago')
        .eq('curso_id', cursoId)
        .order('fecha_limite_pago', { ascending: true }),
      supabase.from('transacciones')
        .select('id, monto, tipo, estado')
        .eq('curso_id', cursoId),
      supabase.from('eventos')
        .select('id', { count: 'exact', head: true })
        .eq('curso_id', cursoId)
        .eq('estado', 'activo'),
    ])

    eventos = (eventosData ?? []) as EventoResumen[]
    hasActiveEvents = (activeCount ?? 0) > 0

    const txs = (txData ?? []) as TxResumen[]
    for (const tx of txs) {
      if (tx.estado === 'aprobada') {
        totalAprobadas++
        if (tx.tipo === 'cuota_ingreso' || tx.tipo === 'sobrante_a_reserva' || tx.tipo === 'sobrante_a_saldo_favor') {
          totalIngresos += tx.monto
        } else if (tx.tipo === 'gasto_egreso') {
          totalEgresos += tx.monto
        }
      } else if (tx.estado === 'pendiente_aprobacion' || tx.estado === 'pendiente_validacion') {
        totalPendientes++
      }
    }

    if (hasActiveEvents) {
      disabledMessage = 'Hay eventos activos. Ciérralos antes de ejecutar el cierre anual.'
    }
  }

  const balanceFinal = totalIngresos - totalEgresos

  return (
    <ModuleShell
      title="Cierre Anual"
      description={`Resumen financiero del año escolar ${anioEscolar} — ${cursoNombre}`}
      badge={`${eventos.length} eventos`}
    >
      {/* Print-friendly header */}
      <div className="hidden print:block print:mb-6">
        <h1 className="text-xl font-bold">Reporte de Cierre Anual — {cursoNombre}</h1>
        <p className="text-sm text-slate-500">Año escolar {anioEscolar} · Generado el {new Date().toLocaleDateString('es-CL')}</p>
      </div>

      <div className="space-y-4">
        {/* Summary cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.85)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-success-50 text-success-600">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Ingresos</p>
                <p className="text-lg font-bold text-success-700">{formatearMonto(totalIngresos)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.85)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-danger-50 text-danger-600">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Egresos</p>
                <p className="text-lg font-bold text-danger-700">{formatearMonto(totalEgresos)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.85)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Balance</p>
                <p className="text-lg font-bold text-slate-900">{formatearMonto(balanceFinal)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.85)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Transacciones</p>
                <p className="text-lg font-bold text-slate-900">
                  {totalAprobadas}
                  {totalPendientes > 0 && (
                    <span className="ml-1 text-sm font-medium text-amber-600">+{totalPendientes} pend.</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Events table */}
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.85)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Eventos del período
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">Detalle por evento</h2>
            </div>
            <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
              <CalendarCheck className="h-5 w-5" />
            </div>
          </div>

          {eventos.length > 0 ? (
            <div className="mt-4 divide-y divide-slate-100">
              {eventos.map((ev) => {
                const estadoClass =
                  ev.estado === 'cerrado' ? 'bg-slate-100 text-slate-600'
                  : ev.estado === 'activo' ? 'bg-success-50 text-success-600'
                  : ev.estado === 'cancelado' ? 'bg-danger-50 text-danger-600'
                  : 'bg-amber-50 text-amber-600'
                const estadoLabel =
                  ev.estado === 'cerrado' ? 'Cerrado'
                  : ev.estado === 'activo' ? 'Activo'
                  : ev.estado === 'cancelado' ? 'Cancelado'
                  : 'Borrador'

                return (
                  <div key={ev.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900">{ev.nombre}</p>
                      <p className="mt-0.5 text-xs text-slate-400">Límite: {ev.fecha_limite_pago}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-bold text-slate-900">{formatearMonto(ev.monto_objetivo)}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${estadoClass}`}>
                        {estadoLabel}
                      </span>
                      {ev.estado === 'activo' && (
                        <CerrarEventoButton eventoId={ev.id} eventoNombre={ev.nombre} />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">No hay eventos registrados en este período.</p>
          )}
        </section>

        {/* Cierre actions — hidden in print */}
        <div className="print:hidden">
          <CierreActions
            cursoId={cursoId}
            disabled={hasActiveEvents || Boolean(disabledMessage && !hasActiveEvents && isRootDev)}
            disabledMessage={disabledMessage}
          />
        </div>
      </div>
    </ModuleShell>
  )
}
