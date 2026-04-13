import type { Metadata } from 'next'
import { CreditCard, EyeOff, ReceiptText, UserRound } from 'lucide-react'
import { ROOT_DEV_EMAIL } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import type { Evento, Perfil, Transaccion } from '@/lib/types'
import { formatearMonto } from '@/lib/utils'
import ModuleShell from '../components/ModuleShell'
import { formatLocalDate } from '../components/dashboard.utils'
import PaymentSubmissionForm from './PaymentSubmissionForm'

export const metadata: Metadata = { title: 'Pagar' }

type PerfilCurso = Pick<Perfil, 'id' | 'curso_id' | 'nombre_completo'>
type EventoPago = Pick<Evento, 'id' | 'nombre' | 'fecha_limite_pago' | 'monto_objetivo'>
type PaymentRecord = Pick<
  Transaccion,
  'id' | 'descripcion' | 'monto' | 'estado' | 'numero_boleta' | 'fecha_registro'
>

interface DeudorRow {
  id: string
  monto_total: number
  identidad_revelada: boolean
  nombre: string | null
}

function getStatusCopy(status: PaymentRecord['estado']): string {
  if (status === 'aprobada') return 'Aprobada'
  if (status === 'rechazada') return 'Rechazada'
  if (status === 'pendiente_aprobacion') return 'Pend. aprob.'
  return 'Pend. valid.'
}

function getStatusClass(status: PaymentRecord['estado']): string {
  if (status === 'aprobada') return 'bg-success-50 text-success-700'
  if (status === 'rechazada') return 'bg-danger-50 text-danger-700'
  return 'bg-warning-50 text-warning-700'
}

export default async function PagarPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const isRootDev = user.email?.toLowerCase() === ROOT_DEV_EMAIL
  const { data: perfilData } = await supabase
    .from('perfiles')
    .select('id, curso_id, nombre_completo')
    .eq('id', user.id)
    .maybeSingle()

  const perfil = perfilData as PerfilCurso | null

  let evento: EventoPago | null = null
  let montoRecaudado = 0
  let cuotasPendientes = 0
  let recentPayments: PaymentRecord[] = []
  let disabledMessage: string | null = null
  let deudores: DeudorRow[] = []

  if (!perfil && isRootDev) {
    evento = {
      id: 'root-pay-1',
      nombre: 'Salida pedagogica de prueba',
      fecha_limite_pago: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
      monto_objetivo: 240000,
    }
    montoRecaudado = 168000
    cuotasPendientes = 6
    recentPayments = [
      {
        id: 'root-payment-1',
        descripcion: 'Pago reportado por apoderado',
        monto: 28000,
        estado: 'pendiente_validacion',
        numero_boleta: 'B-1024',
        fecha_registro: new Date().toISOString(),
      },
    ]
    deudores = [
      { id: 'root-d-1', monto_total: 28000, identidad_revelada: true, nombre: 'María González' },
      { id: 'root-d-2', monto_total: 28000, identidad_revelada: true, nombre: 'Carlos Muñoz' },
      { id: 'root-d-3', monto_total: 28000, identidad_revelada: false, nombre: null },
      { id: 'root-d-4', monto_total: 28000, identidad_revelada: false, nombre: null },
    ]
    disabledMessage =
      'El usuario root de desarrollo puede recorrer el modulo, pero para registrar pagos necesita un perfil persistido.'
  } else if (perfil?.curso_id) {
    const { data: eventoData } = await supabase
      .from('eventos')
      .select('id, nombre, fecha_limite_pago, monto_objetivo')
      .eq('curso_id', perfil.curso_id)
      .eq('estado', 'activo')
      .order('fecha_limite_pago', { ascending: true })
      .limit(1)

    evento = ((eventoData ?? [])[0] ?? null) as EventoPago | null

    if (evento) {
      const [{ data: cuotasData }, { data: paymentsData }] = await Promise.all([
        supabase
          .from('cuotas')
          .select('monto_total, pagado')
          .eq('curso_id', perfil.curso_id)
          .eq('evento_id', evento.id),
        supabase
          .from('transacciones')
          .select('id, descripcion, monto, estado, numero_boleta, fecha_registro')
          .eq('curso_id', perfil.curso_id)
          .eq('tipo', 'cuota_ingreso')
          .order('fecha_registro', { ascending: false })
          .limit(6),
      ])

      const cuotas = (cuotasData ?? []) as Array<{ monto_total: number; pagado: boolean }>
      montoRecaudado = cuotas
        .filter((cuota) => cuota.pagado)
        .reduce((sum, cuota) => sum + cuota.monto_total, 0)
      cuotasPendientes = cuotas.filter((cuota) => !cuota.pagado).length
      recentPayments = (paymentsData ?? []) as PaymentRecord[]

      // Deudores: cuotas impagas del evento activo (vista censura identidad)
      const { data: deudoresRaw } = await supabase
        .from('cuotas_vista' as 'cuotas')
        .select('id, monto_total, identidad_revelada, apoderado_id')
        .eq('evento_id', evento.id)
        .eq('pagado', false)

      const cuotasImpagas = (deudoresRaw ?? []) as Array<{
        id: string; monto_total: number; identidad_revelada: boolean; apoderado_id: string | null
      }>

      if (cuotasImpagas.length > 0) {
        const revealedIds = cuotasImpagas
          .filter((c) => c.identidad_revelada && c.apoderado_id)
          .map((c) => c.apoderado_id!)

        const nameMap = new Map<string, string>()
        if (revealedIds.length > 0) {
          const { data: nombresData } = await supabase
            .from('perfiles')
            .select('id, nombre_completo')
            .in('id', revealedIds)
          for (const p of (nombresData ?? []) as Array<{ id: string; nombre_completo: string }>) {
            nameMap.set(p.id, p.nombre_completo)
          }
        }

        deudores = cuotasImpagas.map((c) => ({
          id: c.id ?? '',
          monto_total: c.monto_total ?? 0,
          identidad_revelada: c.identidad_revelada ?? false,
          nombre: c.apoderado_id ? nameMap.get(c.apoderado_id) ?? null : null,
        }))
      }
    } else {
      disabledMessage = 'No hay un evento activo para registrar pagos en este momento.'
    }
  } else {
    disabledMessage = 'Tu perfil aun no esta listo para registrar pagos.'
  }

  const suggestedDescription = evento
    ? `Pago asociado a ${evento.nombre}`
    : 'Pago reportado por apoderado'

  return (
    <ModuleShell
      title="Centro de Pago"
      description="Consulta el evento activo, registra pagos y sigue el estado de cada envio desde el mismo flujo."
      badge={evento ? 'Evento activo' : 'Sin evento'}
    >
      <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1fr)_21rem]">
        {/* ── Left column ── */}
        <div className="space-y-3">
          {/* Evento + stats inline */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.85)]">
            {evento ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Evento a pagar
                    </p>
                    <h2 className="mt-1 text-base font-semibold text-slate-900">{evento.nombre}</h2>
                  </div>
                  <div className="rounded-xl bg-success-50 p-2 text-success-600">
                    <CreditCard className="h-4 w-4" />
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-4 gap-2">
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-[9px] uppercase tracking-[0.14em] text-slate-400">Meta</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900">
                      {formatearMonto(evento.monto_objetivo)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-[9px] uppercase tracking-[0.14em] text-slate-400">Recaudado</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900">
                      {formatearMonto(montoRecaudado)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-[9px] uppercase tracking-[0.14em] text-slate-400">Pendientes</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900">
                      {cuotasPendientes} cuotas
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-[9px] uppercase tracking-[0.14em] text-slate-400">Cierre</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-900">
                      {formatLocalDate(evento.fecha_limite_pago)}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">No hay eventos activos para pagar por ahora.</p>
            )}
          </section>

          {/* Últimos pagos */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.85)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Ultimos pagos
              </p>
              <div className="rounded-xl bg-brand-50 p-2 text-brand-700">
                <ReceiptText className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-3 divide-y divide-slate-100">
              {recentPayments.length > 0 ? (
                recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {payment.descripcion}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {payment.numero_boleta ?? 'Sin número'} · {formatLocalDate(payment.fecha_registro)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-slate-900">
                        {formatearMonto(payment.monto)}
                      </p>
                      <span
                        className={`inline-flex rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${getStatusClass(payment.estado)}`}
                      >
                        {getStatusCopy(payment.estado)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center gap-1.5 py-8 text-center">
                  <ReceiptText className="h-6 w-6 text-slate-200" />
                  <p className="text-xs font-semibold text-slate-400">Sin pagos registrados</p>
                </div>
              )}
            </div>
          </section>

          {/* Deudores (below payments on left if present) */}
          {deudores.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.85)]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    Cuotas pendientes
                  </p>
                  <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
                    {deudores.length}
                  </span>
                </div>
                {!deudores[0].identidad_revelada && (
                  <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <EyeOff className="h-3 w-3" /> Protegido
                  </span>
                )}
              </div>

              <div className="mt-2.5 grid gap-1.5 sm:grid-cols-2">
                {deudores.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      {d.identidad_revelada ? (
                        <UserRound className="h-3 w-3 shrink-0 text-slate-400" />
                      ) : (
                        <EyeOff className="h-3 w-3 shrink-0 text-slate-300" />
                      )}
                      <p className="truncate text-[11px] font-medium text-slate-600">
                        {d.identidad_revelada && d.nombre ? d.nombre : 'Anónimo'}
                      </p>
                    </div>
                    <p className="shrink-0 text-[11px] font-bold text-slate-800">
                      {formatearMonto(d.monto_total)}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Right aside: form only ── */}
        <aside>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.85)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Registrar pago
              </p>
              <div className="rounded-xl bg-success-50 p-2 text-success-600">
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <PaymentSubmissionForm
                eventoId={evento?.id ?? null}
                suggestedDescription={suggestedDescription}
                disabled={!evento || Boolean(disabledMessage)}
                disabledMessage={disabledMessage}
              />
            </div>
          </section>
        </aside>
      </div>
    </ModuleShell>
  )
}
