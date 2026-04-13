'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { REGLAS, ROLES_FINANCIERO } from '@/lib/constants'
import type { EstadoEvento, RolUsuario, TablesInsert } from '@/lib/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTable = any

export interface CierreEventoState {
  status: 'idle' | 'success' | 'error'
  message: string | null
}

export async function cerrarEvento(
  _prev: CierreEventoState,
  formData: FormData
): Promise<CierreEventoState> {
  const eventoId = String(formData.get('eventoId') ?? '').trim()
  if (!eventoId) return { status: 'error', message: 'Evento no identificado.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { status: 'error', message: 'Sesión expirada.' }

  const { data: perfilRaw } = await supabase
    .from('perfiles')
    .select('id, curso_id, rol')
    .eq('id', user.id)
    .single()
  const perfil = perfilRaw as { id: string; curso_id: string; rol: RolUsuario } | null

  if (!perfil || !ROLES_FINANCIERO.includes(perfil.rol)) {
    return { status: 'error', message: 'No tienes permiso para cerrar eventos.' }
  }

  // Fetch event
  const { data: eventoRaw } = await supabase
    .from('eventos')
    .select('id, curso_id, estado, monto_objetivo, nombre')
    .eq('id', eventoId)
    .single()
  const evento = eventoRaw as { id: string; curso_id: string; estado: string; monto_objetivo: number; nombre: string } | null

  if (!evento || evento.curso_id !== perfil.curso_id) {
    return { status: 'error', message: 'Evento no encontrado.' }
  }
  if (evento.estado !== 'activo') {
    return { status: 'error', message: 'Solo se pueden cerrar eventos activos.' }
  }

  // Calculate recaudado
  const { data: cuotasData } = await supabase
    .from('cuotas')
    .select('monto_total, pagado')
    .eq('evento_id', eventoId)
  const cuotas = (cuotasData ?? []) as Array<{ monto_total: number; pagado: boolean }>
  const recaudado = cuotas.filter((c) => c.pagado).reduce((sum, c) => sum + c.monto_total, 0)
  const sobrante = recaudado - evento.monto_objetivo

  // Close event
  await (supabase.from('eventos') as AnyTable)
    .update({ estado: 'cerrado' satisfies EstadoEvento })
    .eq('id', eventoId)

  // If surplus, create destino_sobrante votación
  if (sobrante > 0) {
    const { count: votantesCount } = await supabase
      .from('perfiles')
      .select('id', { count: 'exact', head: true })
      .eq('curso_id', perfil.curso_id)
      .eq('estado', 'activo')

    const ahora = new Date()
    const fechaFin = new Date(ahora.getTime() + REGLAS.VOTACION_1ERA_VUELTA_HORAS * 60 * 60 * 1000)

    const votacionPayload: TablesInsert<'votaciones'> = {
      tipo:                       'destino_sobrante',
      estado:                     'primera_vuelta',
      vuelta:                     1,
      evento_id:                  eventoId,
      curso_id:                   perfil.curso_id,
      creado_por:                 perfil.id,
      fecha_inicio:               ahora.toISOString(),
      fecha_fin:                  fechaFin.toISOString(),
      total_votantes_habilitados: votantesCount ?? 0,
    }

    await (supabase.from('votaciones') as AnyTable).insert(votacionPayload)

    revalidatePath('/')
    revalidatePath('/votaciones')
    return {
      status: 'success',
      message: `Evento cerrado. Hay un sobrante de ${sobrante.toLocaleString('es-CL')} CLP — se abrió votación para decidir su destino.`,
    }
  }

  revalidatePath('/')
  return { status: 'success', message: 'Evento cerrado correctamente.' }
}
