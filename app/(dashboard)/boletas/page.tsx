import type { Metadata } from 'next'
import { ExternalLink, FileText } from 'lucide-react'
import { ROOT_DEV_EMAIL } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import type { Perfil, Transaccion } from '@/lib/types'
import { cn, formatearMonto } from '@/lib/utils'
import ModuleShell from '../components/ModuleShell'
import { formatLocalDate } from '../components/dashboard.utils'

export const metadata: Metadata = { title: 'Boletas' }

type PerfilCurso = Pick<Perfil, 'id' | 'curso_id'>
type BoletaRow = Pick<
  Transaccion,
  'id' | 'descripcion' | 'monto' | 'estado' | 'numero_boleta' | 'fecha_registro' | 'url_comprobante'
>

function getStatusClass(estado: BoletaRow['estado']) {
  return estado === 'aprobada'
    ? 'bg-success-50 text-success-600'
    : estado === 'rechazada'
      ? 'bg-danger-50 text-danger-600'
      : 'bg-warning-50 text-warning-600'
}

function getStatusLabel(estado: BoletaRow['estado']): string {
  switch (estado) {
    case 'aprobada':             return 'Aprobada'
    case 'rechazada':            return 'Rechazada'
    case 'pendiente_aprobacion': return 'Pend. aprobación'
    case 'pendiente_validacion': return 'Pend. validación'
    default:                     return estado
  }
}

export default async function BoletasPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  let boletas: BoletaRow[] = []

  if (user.email?.toLowerCase() === ROOT_DEV_EMAIL) {
    boletas = [
      {
        id: 'root-ticket-1',
        descripcion: 'Pago de cuota marzo',
        monto: 28000,
        estado: 'aprobada',
        numero_boleta: 'B-1024',
        fecha_registro: new Date().toISOString(),
        url_comprobante: 'https://example.com/comprobante-1024',
      },
      {
        id: 'root-ticket-2',
        descripcion: 'Compra de materiales',
        monto: 12000,
        estado: 'aprobada',
        numero_boleta: 'B-1021',
        fecha_registro: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        url_comprobante: null,
      },
    ]
  } else {
    const { data: perfilData } = await supabase
      .from('perfiles')
      .select('id, curso_id')
      .eq('id', user.id)
      .single()

    const perfil = perfilData as PerfilCurso | null

    if (perfil?.curso_id) {
      const { data } = await supabase
        .from('transacciones')
        .select('id, descripcion, monto, estado, numero_boleta, fecha_registro, url_comprobante')
        .eq('curso_id', perfil.curso_id)
        .order('fecha_registro', { ascending: false })
        .limit(12)

      boletas = (data ?? []) as BoletaRow[]
    }
  }

  return (
    <ModuleShell
      title="Boletas"
      description="Consulta el historial de comprobantes, su estado de validacion y accede al enlace del respaldo cuando exista."
      badge={`${boletas.length} registros`}
    >
      <div className="rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_36px_-30px_rgba(15,23,42,0.85)]">
        {boletas.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {boletas.map((boleta) => (
              <article key={boleta.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{boleta.descripcion}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
                    <span>{boleta.numero_boleta ?? 'Sin número'}</span>
                    <span>·</span>
                    <span>{formatLocalDate(boleta.fecha_registro)}</span>
                    {boleta.url_comprobante && (
                      <>
                        <span>·</span>
                        <a
                          href={boleta.url_comprobante}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-medium text-brand-600 transition hover:text-brand-700"
                        >
                          Comprobante <ExternalLink className="h-3 w-3" />
                        </a>
                      </>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-slate-900">{formatearMonto(boleta.monto)}</p>
                  <span className={cn('mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold', getStatusClass(boleta.estado))}>
                    {getStatusLabel(boleta.estado)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">
              <FileText className="h-6 w-6 text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-500">Sin boletas registradas</p>
            <p className="text-xs text-slate-400">Los comprobantes aparecerán aquí una vez que se registren pagos.</p>
          </div>
        )}
      </div>
    </ModuleShell>
  )
}
