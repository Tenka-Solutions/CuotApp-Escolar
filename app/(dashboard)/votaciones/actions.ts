'use server'

import { revalidatePath } from 'next/cache'
import { ROOT_DEV_EMAIL } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import type { OpcionVoto, Perfil, TablesInsert, Votacion, Voto } from '@/lib/types'

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
