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
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.85)]">
        <div className="space-y-3">
          {boletas.length > 0 ? (
            boletas.map((boleta) => (
              <article
                key={boleta.id}
                className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50/75 p-4"
              >
                <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{boleta.descripcion}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {boleta.numero_boleta ?? 'Sin numero'} |{' '}
                    {formatLocalDate(boleta.fecha_registro)}
                  </p>
                  {boleta.url_comprobante ? (
                    <a
                      href={boleta.url_comprobante}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 transition hover:text-brand-800 hover:underline"
                    >
                      Ver comprobante
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : null}
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{formatearMonto(boleta.monto)}</p>
                  <span
                    className={cn(
                      'mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold',
                      getStatusClass(boleta.estado)
                    )}
                  >
                    {boleta.estado}
                  </span>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center text-slate-500">
              Todavia no hay boletas registradas.
            </div>
          )}
        </div>
      </div>
    </ModuleShell>
  )
}
