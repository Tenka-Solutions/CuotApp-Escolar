import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarPlus, Clock3, PieChart, Vote } from 'lucide-react'
import { ROOT_DEV_EMAIL } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import type { OpcionVoto, Perfil, RolUsuario, Votacion, Voto } from '@/lib/types'
import { ROLES_FINANCIERO } from '@/lib/constants'
import ModuleShell from '../components/ModuleShell'
import { formatLocalDate } from '../components/dashboard.utils'
import VoteActionPanel from './VoteActionPanel'

export const metadata: Metadata = { title: 'Votaciones' }

type PerfilCurso = Pick<Perfil, 'id' | 'curso_id' | 'rol'>
type VotacionResumen = Pick<
  Votacion,
  'id' | 'tipo' | 'vuelta' | 'fecha_fin' | 'total_votantes_habilitados'
>
type VoteRow = Pick<Voto, 'id' | 'opcion' | 'usuario_id' | 'votacion_id'>

interface VoteCounts {
  si: number
  no: number
  abstencion: number
}

interface VoteCardData extends VotacionResumen {
  counts: VoteCounts
  myVote: OpcionVoto | null
}

function getVoteLabel(tipo: VotacionResumen['tipo']): string {
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

function buildVoteCountMap(votes: VoteRow[]): Map<string, VoteCounts> {
  const counts = new Map<string, VoteCounts>()

  for (const vote of votes) {
    const current = counts.get(vote.votacion_id) ?? { si: 0, no: 0, abstencion: 0 }

    if (vote.opcion === 'si') current.si += 1
    if (vote.opcion === 'no') current.no += 1
    if (vote.opcion === 'abstencion') current.abstencion += 1

    counts.set(vote.votacion_id, current)
  }

  return counts
}

export default async function VotacionesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  let votaciones: VoteCardData[] = []
  let votingBlockedMessage: string | null = null

  const { data: perfilData } = await supabase
    .from('perfiles')
    .select('id, curso_id, rol')
    .eq('id', user.id)
    .maybeSingle()

  const perfil = perfilData as PerfilCurso | null

  if (!perfil && user.email?.toLowerCase() === ROOT_DEV_EMAIL) {
    votingBlockedMessage =
      'El usuario root de desarrollo puede revisar el modulo, pero para votar necesita un perfil persistido en la base.'
    votaciones = [
      {
        id: 'root-vote-1',
        tipo: 'gasto',
        vuelta: 1,
        fecha_fin: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
        total_votantes_habilitados: 24,
        counts: { si: 12, no: 3, abstencion: 1 },
        myVote: null,
      },
      {
        id: 'root-vote-2',
        tipo: 'cierre_evento',
        vuelta: 2,
        fecha_fin: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
        total_votantes_habilitados: 24,
        counts: { si: 8, no: 2, abstencion: 0 },
        myVote: null,
      },
    ]
  } else if (perfil?.curso_id) {
    const { data } = await supabase
      .from('votaciones')
      .select('id, tipo, vuelta, fecha_fin, total_votantes_habilitados')
      .eq('curso_id', perfil.curso_id)
      .in('estado', ['primera_vuelta', 'segunda_vuelta'])
      .order('fecha_fin', { ascending: true })

    const votingRows = (data ?? []) as VotacionResumen[]
    const votingIds = votingRows.map((row) => row.id)
    const { data: votesData } =
      votingIds.length > 0
        ? await supabase
            .from('votos')
            .select('id, opcion, usuario_id, votacion_id')
            .in('votacion_id', votingIds)
        : { data: [] as VoteRow[] }

    const votes = (votesData ?? []) as VoteRow[]
    const voteCountMap = buildVoteCountMap(votes)

    votaciones = votingRows.map((votacion) => ({
      ...votacion,
      counts: voteCountMap.get(votacion.id) ?? { si: 0, no: 0, abstencion: 0 },
      myVote:
        votes.find(
          (vote) => vote.votacion_id === votacion.id && vote.usuario_id === user.id
        )?.opcion ?? null,
    }))
  }

  const puedeProponerEvento = perfil && ROLES_FINANCIERO.includes(perfil.rol as RolUsuario)

  return (
    <ModuleShell
      title="Votaciones"
      description="Revisa las votaciones abiertas del curso, su participacion actual y emite tu voto desde el mismo panel."
      badge={`${votaciones.length} abiertas`}
    >
      {puedeProponerEvento && (
        <div className="mb-4">
          <Link
            href="/eventos/nuevo"
            className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 active:scale-[0.98]"
          >
            <CalendarPlus className="h-4 w-4" />
            Proponer nuevo evento
          </Link>
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        {votaciones.length > 0 ? (
          votaciones.map((votacion) => {
            const totalVotes =
              votacion.counts.si + votacion.counts.no + votacion.counts.abstencion
            const participation =
              votacion.total_votantes_habilitados > 0
                ? Math.round((totalVotes / votacion.total_votantes_habilitados) * 100)
                : 0

            return (
              <article
                key={votacion.id}
                className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.85)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Vuelta {votacion.vuelta}
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-slate-900">
                      {getVoteLabel(votacion.tipo)}
                    </h2>
                  </div>
                  <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
                    <Vote className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                      Cierre
                    </p>
                    <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Clock3 className="h-4 w-4 text-brand-600" />
                      {votacion.fecha_fin ? formatLocalDate(votacion.fecha_fin) : 'Sin fecha'}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
                      Participacion
                    </p>
                    <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <PieChart className="h-4 w-4 text-success-600" />
                      {participation}% del padron
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-2xl border border-success-100 bg-success-50 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-success-700/80">
                      Si
                    </p>
                    <p className="mt-1 text-lg font-bold text-success-700">{votacion.counts.si}</p>
                  </div>
                  <div className="rounded-2xl border border-danger-100 bg-danger-50 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-danger-700/80">
                      No
                    </p>
                    <p className="mt-1 text-lg font-bold text-danger-700">{votacion.counts.no}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">
                      Abstencion
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-700">
                      {votacion.counts.abstencion}
                    </p>
                  </div>
                </div>

                <VoteActionPanel
                  votacionId={votacion.id}
                  initialOption={votacion.myVote}
                  disabled={Boolean(votingBlockedMessage)}
                  disabledMessage={votingBlockedMessage}
                />
              </article>
            )
          })
        ) : (
          <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-white px-6 py-10 text-center text-slate-500 lg:col-span-2">
            No hay votaciones abiertas por ahora.
          </div>
        )}
      </div>
    </ModuleShell>
  )
}
