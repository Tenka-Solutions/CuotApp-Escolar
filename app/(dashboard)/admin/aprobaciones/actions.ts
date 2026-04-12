'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ROLES_JERARQUIA } from '@/lib/constants'
import type { EstadoUsuario, Perfil, RolUsuario } from '@/lib/types'

async function getAdminPerfil() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase: null, perfil: null, error: 'No autenticado' as const }

  const { data } = await supabase
    .from('perfiles')
    .select('id, rol, curso_id')
    .eq('id', user.id)
    .single()
  const perfil = data as { id: string; rol: RolUsuario; curso_id: string } | null

  if (!perfil || !ROLES_JERARQUIA.includes(perfil.rol)) {
    return { supabase: null, perfil: null, error: 'Sin permiso' as const }
  }

  return { supabase, perfil, error: null }
}

export async function aprobarPerfil(perfilId: string) {
  const { supabase, perfil, error } = await getAdminPerfil()
  if (error || !supabase || !perfil) return { error }

  const payload: Partial<Perfil> = {
    estado:           'activo'      satisfies EstadoUsuario,
    aprobado_por:     perfil.id,
    fecha_aprobacion: new Date().toISOString(),
  }
  const { error: updateErr } = await (supabase
    .from('perfiles') as ReturnType<typeof supabase.from>)
    .update(payload)
    .eq('id', perfilId)
    .eq('curso_id', perfil.curso_id)

  if (updateErr) return { error: updateErr.message }

  revalidatePath('/admin/aprobaciones')
  return { error: null }
}

export async function rechazarPerfil(perfilId: string) {
  const { supabase, perfil, error } = await getAdminPerfil()
  if (error || !supabase || !perfil) return { error }

  const payload: Partial<Perfil> = { estado: 'rechazado' satisfies EstadoUsuario }
  const { error: updateErr } = await (supabase
    .from('perfiles') as ReturnType<typeof supabase.from>)
    .update(payload)
    .eq('id', perfilId)
    .eq('curso_id', perfil.curso_id)

  if (updateErr) return { error: updateErr.message }

  revalidatePath('/admin/aprobaciones')
  return { error: null }
}
