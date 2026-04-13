'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { ROLES_FINANCIERO } from '@/lib/constants'
import type { EstadoTransaccion, RolUsuario } from '@/lib/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTable = any

async function getFinancieroPerfil() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase: null, perfil: null, error: 'No autenticado' as const }

  const { data } = await supabase
    .from('perfiles')
    .select('id, rol, curso_id')
    .eq('id', user.id)
    .single()
  const perfil = data as { id: string; rol: RolUsuario; curso_id: string } | null

  if (!perfil || !ROLES_FINANCIERO.includes(perfil.rol)) {
    return { supabase: null, perfil: null, error: 'Sin permiso' as const }
  }

  return { supabase, perfil, error: null }
}

export async function aprobarTransaccion(txId: string) {
  const { supabase, perfil, error } = await getFinancieroPerfil()
  if (error || !supabase || !perfil) return { error }

  const { error: updateErr } = await (supabase.from('transacciones') as AnyTable)
    .update({
      estado:           'aprobada'        satisfies EstadoTransaccion,
      aprobado_por:     perfil.id,
      fecha_aprobacion: new Date().toISOString(),
    })
    .eq('id', txId)
    .eq('curso_id', perfil.curso_id)

  if (updateErr) return { error: updateErr.message }

  revalidatePath('/admin/transacciones')
  revalidatePath('/')
  return { error: null }
}

export async function rechazarTransaccion(txId: string) {
  const { supabase, perfil, error } = await getFinancieroPerfil()
  if (error || !supabase || !perfil) return { error }

  const { error: updateErr } = await (supabase.from('transacciones') as AnyTable)
    .update({ estado: 'rechazada' satisfies EstadoTransaccion })
    .eq('id', txId)
    .eq('curso_id', perfil.curso_id)

  if (updateErr) return { error: updateErr.message }

  revalidatePath('/admin/transacciones')
  revalidatePath('/')
  return { error: null }
}
