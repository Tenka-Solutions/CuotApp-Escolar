'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ROLES_JERARQUIA } from '@/lib/constants'
import type { EstadoEvento, RolUsuario } from '@/lib/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTable = any

export interface CierreState {
  status: 'idle' | 'success' | 'error'
  message: string | null
}

export async function ejecutarCierreAnual(
  _prev: CierreState,
  formData: FormData
): Promise<CierreState> {
  const cursoId = String(formData.get('cursoId') ?? '').trim()
  if (!cursoId) return { status: 'error', message: 'Curso no identificado.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { status: 'error', message: 'Sesión expirada.' }

  const { data: perfilRaw } = await supabase
    .from('perfiles')
    .select('id, curso_id, rol')
    .eq('id', user.id)
    .single()
  const perfil = perfilRaw as { id: string; curso_id: string; rol: RolUsuario } | null

  if (!perfil || perfil.curso_id !== cursoId || !ROLES_JERARQUIA.includes(perfil.rol)) {
    return { status: 'error', message: 'No tienes permiso para ejecutar el cierre anual.' }
  }

  // Check no active events remain
  const { count: activeEvents } = await supabase
    .from('eventos')
    .select('id', { count: 'exact', head: true })
    .eq('curso_id', cursoId)
    .eq('estado', 'activo')

  if ((activeEvents ?? 0) > 0) {
    return { status: 'error', message: 'Hay eventos activos sin cerrar. Ciérralos antes de ejecutar el cierre anual.' }
  }

  // Close all non-closed events as cerrado
  await (supabase.from('eventos') as AnyTable)
    .update({ estado: 'cerrado' satisfies EstadoEvento })
    .eq('curso_id', cursoId)
    .in('estado', ['borrador'])

  // Deactivate curso
  await (supabase.from('cursos') as AnyTable)
    .update({ activo: false })
    .eq('id', cursoId)

  revalidatePath('/')
  return { status: 'success', message: 'Cierre anual ejecutado. El curso ha sido desactivado.' }
}
