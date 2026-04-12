'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { REGLAS, ROLES_FINANCIERO } from '@/lib/constants'
import type { Evento, RolUsuario, TablesInsert } from '@/lib/types'

type PerfilAdmin = {
  id:                      string
  rol:                     RolUsuario
  curso_id:                string
  ultimo_evento_propuesto: string | null
}

// Supabase typed client infiere 'never' en insert/update sin cast explícito
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTable = any

export type PropuestaState = {
  error: string | null
}

export async function proponerEvento(
  _prev: PropuestaState,
  formData: FormData
): Promise<PropuestaState> {
  const nombre          = String(formData.get('nombre') ?? '').trim()
  const descripcion     = String(formData.get('descripcion') ?? '').trim() || null
  const montoPorAlumno  = Number(formData.get('monto_por_alumno'))
  const fechaLimitePago = String(formData.get('fecha_limite_pago') ?? '').trim()
  const tipoBilletera   = String(formData.get('tipo_billetera') ?? '').trim()

  if (!nombre || !montoPorAlumno || !fechaLimitePago || !tipoBilletera) {
    return { error: 'Completa todos los campos obligatorios.' }
  }
  if (montoPorAlumno <= 0) {
    return { error: 'El monto por alumno debe ser mayor a cero.' }
  }
  if (tipoBilletera !== 'alumnos' && tipoBilletera !== 'apoderados') {
    return { error: 'Tipo de billetera inválido.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sesión expirada.' }

  // Gate de rol
  const { data: perfilRaw } = await supabase
    .from('perfiles')
    .select('id, rol, curso_id, ultimo_evento_propuesto')
    .eq('id', user.id)
    .single()
  const perfil = perfilRaw as PerfilAdmin | null

  if (!perfil || !ROLES_FINANCIERO.includes(perfil.rol)) {
    return { error: 'No tienes permiso para proponer eventos.' }
  }

  // Rate limiting: MAX_EVENTOS_POR_DIA
  if (perfil.ultimo_evento_propuesto) {
    const hoy       = new Date().toISOString().slice(0, 10)
    const ultimoDia = perfil.ultimo_evento_propuesto.slice(0, 10)
    if (ultimoDia === hoy) {
      return { error: `Solo puedes proponer ${REGLAS.MAX_EVENTOS_POR_DIA} evento por día.` }
    }
  }

  // Contar alumnos del curso para calcular monto_objetivo
  const { count: alumnosCount } = await supabase
    .from('alumnos')
    .select('id', { count: 'exact', head: true })
    .eq('curso_id', perfil.curso_id)

  const montoObjetivo = montoPorAlumno * (alumnosCount ?? 1)

  // Insertar evento en borrador
  const eventoPayload: TablesInsert<'eventos'> = {
    nombre,
    descripcion,
    monto_por_alumno:  montoPorAlumno,
    monto_objetivo:    montoObjetivo,
    fecha_limite_pago: fechaLimitePago,
    tipo_billetera:    tipoBilletera as Evento['tipo_billetera'],
    estado:            'borrador',
    curso_id:          perfil.curso_id,
    creado_por:        perfil.id,
  }

  const { data: eventoData, error: eventoErr } = await (supabase.from('eventos') as AnyTable)
    .insert(eventoPayload)
    .select('id')
    .single()

  if (eventoErr || !eventoData) {
    return { error: 'No pudimos crear el evento. Intenta de nuevo.' }
  }

  const eventoId = (eventoData as { id: string }).id

  // Contar votantes habilitados (perfiles activos del curso)
  const { count: votantesCount } = await supabase
    .from('perfiles')
    .select('id', { count: 'exact', head: true })
    .eq('curso_id', perfil.curso_id)
    .eq('estado', 'activo')

  const ahora   = new Date()
  const fechaFin = new Date(ahora.getTime() + REGLAS.VOTACION_1ERA_VUELTA_HORAS * 60 * 60 * 1000)

  // Crear votación ligada al evento
  const votacionPayload: TablesInsert<'votaciones'> = {
    tipo:                       'gasto',
    estado:                     'primera_vuelta',
    vuelta:                     1,
    evento_id:                  eventoId,
    curso_id:                   perfil.curso_id,
    creado_por:                 perfil.id,
    fecha_inicio:               ahora.toISOString(),
    fecha_fin:                  fechaFin.toISOString(),
    total_votantes_habilitados: votantesCount ?? 0,
  }

  const { error: votErr } = await (supabase.from('votaciones') as AnyTable).insert(votacionPayload)

  if (votErr) {
    // El evento quedó en borrador sin votación — igualmente redirigimos
    // y el admin puede verlo; no es un estado terminal de error.
    console.error('Votación no creada:', votErr.message)
  }

  // Registrar fecha de propuesta para rate limiting
  await (supabase.from('perfiles') as AnyTable)
    .update({ ultimo_evento_propuesto: ahora.toISOString().slice(0, 10) })
    .eq('id', perfil.id)

  redirect('/votaciones')
}
