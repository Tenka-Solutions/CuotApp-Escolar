'use server'

import { revalidatePath } from 'next/cache'
import { ROOT_DEV_EMAIL, REGLAS } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import type { EstadoVotacion, OpcionVoto, Perfil, RolUsuario, TablesInsert, Votacion, Voto } from '@/lib/types'
import { evaluarVotacion, calcularQuorum } from '@/lib/utils'

export interface VoteActionState {
  status: 'idle' | 'success' | 'error'
  message: string | null
  selectedOption: OpcionVoto | null
}

const VALID_OPTIONS = new Set<OpcionVoto>(['si', 'no', 'abstencion'])
const OPEN_STATES = new Set(['primera_vuelta', 'segunda_vuelta'])

type PerfilContext = Pick<Perfil, 'id' | 'curso_id'>
type VotacionContext = Pick<Votacion, 'id' | 'curso_id' | 'estado'>
type ExistingVote = Pick<Voto, 'id'>

interface MutationResult {
  error: { message?: string } | null
}

interface VoteTableMutations {
  insert: (values: TablesInsert<'votos'>) => Promise<MutationResult>
  update: (values: { opcion: OpcionVoto }) => {
    eq: (column: string, value: string) => Promise<MutationResult>
  }
}

export async function submitVote(
  previousState: VoteActionState,
  formData: FormData
): Promise<VoteActionState> {
  const votacionId = String(formData.get('votacionId') ?? '').trim()
  const rawOption = String(formData.get('opcion') ?? '').trim()
  const option = VALID_OPTIONS.has(rawOption as OpcionVoto)
    ? (rawOption as OpcionVoto)
    : null

  if (!votacionId || !option) {
    return {
      ...previousState,
      status: 'error',
      message: 'No pudimos identificar tu voto. Intenta nuevamente.',
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      ...previousState,
      status: 'error',
      message: 'Tu sesion expiro. Vuelve a iniciar sesion.',
    }
  }

  const { data: perfilData } = await supabase
    .from('perfiles')
    .select('id, curso_id')
    .eq('id', user.id)
    .maybeSingle()
  const perfil = perfilData as PerfilContext | null

  if (!perfil) {
    return {
      ...previousState,
      status: 'error',
      message:
        user.email?.toLowerCase() === ROOT_DEV_EMAIL
          ? 'El usuario root de desarrollo navega en modo lectura hasta tener un perfil real.'
          : 'Tu perfil aun no esta listo para votar.',
    }
  }

  const { data: votacionData } = await supabase
    .from('votaciones')
    .select('id, curso_id, estado')
    .eq('id', votacionId)
    .maybeSingle()
  const votacion = votacionData as VotacionContext | null

  if (!votacion || votacion.curso_id !== perfil.curso_id || !OPEN_STATES.has(votacion.estado)) {
    return {
      ...previousState,
      status: 'error',
      message: 'La votacion ya no esta disponible para este usuario.',
    }
  }

  const { data: existingVoteData, error: existingVoteError } = await supabase
    .from('votos')
    .select('id')
    .eq('votacion_id', votacionId)
    .eq('usuario_id', user.id)
    .maybeSingle()
  const existingVote = existingVoteData as ExistingVote | null

  if (existingVoteError) {
    return {
      ...previousState,
      status: 'error',
      message: 'No pudimos revisar tu voto anterior. Intenta nuevamente.',
    }
  }

  const votePayload: TablesInsert<'votos'> = {
    opcion: option,
    usuario_id: user.id,
    votacion_id: votacionId,
  }
  const votesTable = supabase.from('votos') as unknown as VoteTableMutations

  const voteMutation = existingVote
    ? votesTable.update({ opcion: option }).eq('id', existingVote.id)
    : votesTable.insert(votePayload)

  const { error: voteError } = await voteMutation

  if (voteError) {
    return {
      ...previousState,
      status: 'error',
      message: 'No pudimos registrar tu voto en este momento.',
    }
  }

  revalidatePath('/')
  revalidatePath('/votaciones')

  return {
    status: 'success',
    message: 'Tu voto fue registrado correctamente.',
    selectedOption: option,
  }
}

// ── Veto ──────────────────────────────────────────────────────────────────────

export interface VetoActionState {
  status: 'idle' | 'success' | 'error'
  message: string | null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTable = any

export async function vetarVotacion(
  _prev: VetoActionState,
  formData: FormData
): Promise<VetoActionState> {
  const votacionId    = String(formData.get('votacionId') ?? '').trim()
  const justificacion = String(formData.get('justificacion') ?? '').trim()

  if (!votacionId || !justificacion) {
    return { status: 'error', message: 'Debes indicar una justificación para el veto.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { status: 'error', message: 'Sesión expirada.' }

  const { data: perfilRaw } = await supabase
    .from('perfiles')
    .select('id, curso_id, rol')
    .eq('id', user.id)
    .single()
  const perfil = perfilRaw as Pick<Perfil, 'id' | 'curso_id' | 'rol'> | null

  if (!perfil || perfil.rol !== 'profesor_jefe') {
    return { status: 'error', message: 'Solo el Profesor Jefe puede vetar votaciones.' }
  }

  const { data: votacionRaw } = await supabase
    .from('votaciones')
    .select('id, curso_id, estado')
    .eq('id', votacionId)
    .single()
  const votacion = votacionRaw as Pick<Votacion, 'id' | 'curso_id' | 'estado'> | null

  if (!votacion || votacion.curso_id !== perfil.curso_id) {
    return { status: 'error', message: 'Votación no encontrada.' }
  }
  if (votacion.estado !== 'aprobada') {
    return { status: 'error', message: 'Solo se pueden vetar votaciones aprobadas.' }
  }

  const { error: updateErr } = await (supabase.from('votaciones') as AnyTable)
    .update({
      estado:               'vetada' satisfies EstadoVotacion,
      vetada_por:           perfil.id,
      justificacion_veto:   justificacion,
      fecha_veto:           new Date().toISOString(),
    })
    .eq('id', votacionId)
    .eq('curso_id', perfil.curso_id)

  if (updateErr) {
    return { status: 'error', message: 'No pudimos registrar el veto.' }
  }

  revalidatePath('/')
  revalidatePath('/votaciones')
  return { status: 'success', message: 'Votación vetada correctamente.' }
}

// ── Second-round auto-trigger ─────────────────────────────────────────────────

type ExpiredFirstRound = Pick<
  Votacion,
  'id' | 'curso_id' | 'tipo' | 'evento_id' | 'creado_por' | 'total_votantes_habilitados' | 'votos_si' | 'votos_no' | 'votos_abstencion'
>

export async function triggerSecondRounds(): Promise<number> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  const now = new Date().toISOString()

  const { data: expiredData } = await supabase
    .from('votaciones')
    .select('id, curso_id, tipo, evento_id, creado_por, total_votantes_habilitados, votos_si, votos_no, votos_abstencion')
    .eq('estado', 'primera_vuelta')
    .lt('fecha_fin', now)

  const expired = (expiredData ?? []) as ExpiredFirstRound[]
  let triggered = 0

  for (const v of expired) {
    const quorum = calcularQuorum(v.total_votantes_habilitados)
    const result = evaluarVotacion({
      votosSi: v.votos_si,
      votosNo: v.votos_no,
      votosAbstencion: v.votos_abstencion,
      quorumRequerido: quorum,
      vuelta: 1,
    })

    if (result === 'sin_quorum') {
      // Close first round as expired, create second round
      await (supabase.from('votaciones') as AnyTable)
        .update({ estado: 'expirada' satisfies EstadoVotacion })
        .eq('id', v.id)

      const ahora = new Date()
      const fechaFin = new Date(ahora.getTime() + REGLAS.VOTACION_2DA_VUELTA_HORAS * 60 * 60 * 1000)

      const payload: TablesInsert<'votaciones'> = {
        tipo:                       v.tipo,
        estado:                     'segunda_vuelta',
        vuelta:                     2,
        evento_id:                  v.evento_id,
        curso_id:                   v.curso_id,
        creado_por:                 v.creado_por,
        fecha_inicio:               ahora.toISOString(),
        fecha_fin:                  fechaFin.toISOString(),
        total_votantes_habilitados: v.total_votantes_habilitados,
        votacion_anterior_id:       v.id,
      }

      await (supabase.from('votaciones') as AnyTable).insert(payload)
      triggered++
    } else {
      // Quorum met — close with final result
      await (supabase.from('votaciones') as AnyTable)
        .update({ estado: result satisfies EstadoVotacion })
        .eq('id', v.id)
    }
  }

  if (triggered > 0) {
    revalidatePath('/')
    revalidatePath('/votaciones')
  }

  return triggered
}
