import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarPlus, CheckCircle2, Clock3, PieChart, ShieldBan, Vote } from 'lucide-react'
import { ROOT_DEV_EMAIL } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import type { OpcionVoto, Perfil, RolUsuario, Votacion, Voto } from '@/lib/types'
import { ROLES_FINANCIERO } from '@/lib/constants'
import ModuleShell from '../components/ModuleShell'
import { formatLocalDate } from '../components/dashboard.utils'
import VoteActionPanel from './VoteActionPanel'
import VetoPanel from './VetoPanel'
import { triggerSecondRounds } from './actions'

export const metadata: Metadata = { title: 'Votaciones' }

type PerfilCurso = Pick<Perfil, 'id' | 'curso_id' | 'rol'>
type VotacionResumen = Pick<
  Votacion,
  'id' | 'tipo' | 'vuelta' | 'fecha_fin' | 'total_votantes_habilitados' | 'estado'
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

type UserRoleInfo = { rol: RolUsuario | null; esProfesorJefe: boolean }

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

  // Auto-trigger second rounds for expired first-round votes
  await triggerSecondRounds()

  let votaciones: VoteCardData[] = []
  let votingBlockedMessage: string | null = null
  let roleInfo: UserRoleInfo = { rol: null, esProfesorJefe: false }

  const { data: perfilData } = await supabase
    .from('perfiles')
    .select('id, curso_id, rol')
    .eq('id', user.id)
    .maybeSingle()

  const perfil = perfilData as PerfilCurso | null

  if (!perfil && user.email?.toLowerCase() === ROOT_DEV_EMAIL) {
    votingBlockedMessage =
      'El usuario root de desarrollo puede revisar el modulo, pero para votar necesita un perfil persistido en la base.'
    roleInfo = { rol: 'profesor_jefe', esProfesorJefe: true }
    votaciones = [
      {
        id: 'root-vote-1',
        tipo: 'gasto',
        vuelta: 1,
        estado: 'primera_vuelta',
        fecha_fin: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
        total_votantes_habilitados: 24,
        counts: { si: 12, no: 3, abstencion: 1 },
        myVote: null,
      },
      {
        id: 'root-vote-2',
        tipo: 'cierre_evento',
        vuelta: 1,
        estado: 'aprobada',
        fecha_fin: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        total_votantes_habilitados: 24,
        counts: { si: 14, no: 3, abstencion: 2 },
        myVote: 'si',
      },
    ]
  } else if (perfil?.curso_id) {
    roleInfo = { rol: perfil.rol as RolUsuario, esProfesorJefe: perfil.rol === 'profesor_jefe' }

    const { data } = await supabase
      .from('votaciones')
      .select('id, tipo, vuelta, fecha_fin, total_votantes_habilitados, estado')
      .eq('curso_id', perfil.curso_id)
      .in('estado', ['primera_vuelta', 'segunda_vuelta', 'aprobada'])
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
                      {votacion.vuelta === 2 && (
                        <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] text-amber-700">
                          Sin quórum mínimo
                        </span>
                      )}
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-slate-900">
                      {getVoteLabel(votacion.tipo)}
                    </h2>
                  </div>
                  <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
                    <Vote className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Cierre</p>
                    <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Clock3 className="h-4 w-4 text-brand-600" />
                      {votacion.fecha_fin ? formatLocalDate(votacion.fecha_fin) : 'Sin fecha'}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-slate-400">Participación</p>
                    <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <PieChart className="h-4 w-4 text-success-600" />
                      {participation}% del padrón
                    </p>
                  </div>
                </div>

                {/* Barra de participación */}
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all duration-500"
                    style={{ width: `${participation}%` }}
                  />
                </div>

                {/* Conteos */}
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-2xl border border-success-100 bg-success-50 px-3 py-2.5 text-center">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-success-600">Sí</p>
                    <p className="mt-1 text-xl font-bold text-success-700">{votacion.counts.si}</p>
                  </div>
                  <div className="rounded-2xl border border-danger-100 bg-danger-50 px-3 py-2.5 text-center">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-danger-600">No</p>
                    <p className="mt-1 text-xl font-bold text-danger-700">{votacion.counts.no}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-center">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Abst.</p>
                    <p className="mt-1 text-xl font-bold text-slate-600">{votacion.counts.abstencion}</p>
                  </div>
                </div>

                {votacion.estado === 'aprobada' ? (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center gap-2 rounded-2xl border border-success-200 bg-success-50 px-4 py-3 text-xs font-semibold text-success-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Votación aprobada
                    </div>
                    {roleInfo.esProfesorJefe && (
                      <VetoPanel
                        votacionId={votacion.id}
                        disabled={Boolean(votingBlockedMessage)}
                      />
                    )}
                  </div>
                ) : (
                  <VoteActionPanel
                    votacionId={votacion.id}
                    initialOption={votacion.myVote}
                    disabled={Boolean(votingBlockedMessage)}
                    disabledMessage={votingBlockedMessage}
                  />
                )}
              </article>
            )
          })
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-[1.75rem] border border-slate-200 bg-white px-6 py-16 text-center lg:col-span-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">
              <Vote className="h-6 w-6 text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-500">Sin votaciones abiertas</p>
            <p className="text-xs text-slate-400">Cuando se propongan eventos o gastos, las votaciones aparecerán aquí.</p>
          </div>
        )}
      </div>
    </ModuleShell>
  )
}
