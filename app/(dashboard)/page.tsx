import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { Perfil, Billetera, Evento } from '@/lib/types'
import { formatearMonto } from '@/lib/utils'

export const metadata: Metadata = { title: 'Dashboard' }

type PerfilConCurso = Pick<Perfil, 'id' | 'nombre_completo' | 'rol' | 'curso_id'> & {
  cursos: { nombre: string; colegio: string; nivel: string | null; modo_en_marcha: boolean } | null
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: perfilData } = await supabase
    .from('perfiles')
    .select('id, nombre_completo, rol, curso_id, cursos(nombre, colegio, nivel, modo_en_marcha)')
    .eq('id', user!.id)
    .single()

  const perfil = perfilData as PerfilConCurso | null
  if (!perfil) return null

  const { data: billerasData } = await supabase
    .from('billeteras')
    .select('tipo, saldo')
    .eq('curso_id', perfil.curso_id)

  const billeteras = (billerasData ?? []) as Pick<Billetera, 'tipo' | 'saldo'>[]
  const saldoTotal = billeteras.reduce((acc, b) => acc + b.saldo, 0)

  const { data: eventosData } = await supabase
    .from('eventos')
    .select('id, nombre, fecha_limite_pago, monto_objetivo')
    .eq('curso_id', perfil.curso_id)
    .eq('estado', 'activo')
    .order('fecha_limite_pago', { ascending: true })
    .limit(1)

  const eventoVigente = (eventosData?.[0] ?? null) as Pick<
    Evento, 'id' | 'nombre' | 'fecha_limite_pago' | 'monto_objetivo'
  > | null

  const curso = perfil.cursos

  return (
    <>
      {/* ── HEADER (20% altura) ─────────────────────────────────────── */}
      <header
        className="flex-none h-[20dvh] bg-brand-600 text-white flex items-center px-4 gap-3"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        {/* Saldo total — 65% del ancho */}
        <div className="flex-[65] flex flex-col justify-center">
          <p className="text-xs font-medium text-brand-200 uppercase tracking-wide">Saldo Total</p>
          <p className="text-3xl font-bold tabular-nums">{formatearMonto(saldoTotal)}</p>
          <p className="text-xs text-brand-300 mt-0.5">
            {curso?.nombre ?? ''} · {curso?.nivel ?? ''}
          </p>
        </div>

        {/* Saldo evento vigente — 35% del ancho */}
        <div className="flex-[35] flex flex-col justify-center items-end">
          <p className="text-xs font-medium text-brand-200 uppercase tracking-wide">Evento</p>
          {eventoVigente ? (
            <>
              <p className="text-lg font-bold tabular-nums text-right">
                {formatearMonto(eventoVigente.monto_objetivo)}
              </p>
              <p className="text-xs text-brand-300 text-right line-clamp-1">
                {eventoVigente.nombre}
              </p>
            </>
          ) : (
            <p className="text-sm text-brand-300">Sin evento</p>
          )}
        </div>
      </header>

      {/* ── MAIN BODY (45% altura) ──────────────────────────────────── */}
      <main className="flex-none h-[45dvh] flex gap-3 p-4">
        {/* Calendario Heatmap — 70% ancho — Capa 2 (UI) */}
        <div className="flex-[70] bg-white rounded-2xl border border-slate-200 flex items-center justify-center">
          <p className="text-xs text-slate-400">Calendario próximamente</p>
        </div>

        {/* 4 botones de acción rápida — 30% ancho */}
        <div className="flex-[30] grid grid-rows-4 gap-2">
          {[
            { label: 'Pagar',    icon: '💳', href: '/pagar'      },
            { label: 'Votar',    icon: '🗳️', href: '/votaciones' },
            { label: 'Eventos',  icon: '📋', href: '/eventos'    },
            { label: 'Finanzas', icon: '📊', href: '/finanzas'   },
          ].map(({ label, icon, href }) => (
            <a
              key={href}
              href={href}
              className="flex flex-col items-center justify-center bg-white rounded-xl border
                         border-slate-200 active:bg-slate-50 transition-colors"
            >
              <span className="text-xl leading-none">{icon}</span>
              <span className="text-[10px] font-medium text-slate-600 mt-1">{label}</span>
            </a>
          ))}
        </div>
      </main>

      {/* ── ÁREA INFERIOR — scroll libre (35% restante) ────────────── */}
      <section
        className="flex-1 overflow-y-auto px-4"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Actividad reciente</h2>
        {/* Feed — Capa 2 (UI) */}
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      </section>
    </>
  )
}
