export type { Database, Tables, TablesInsert, TablesUpdate, Enums } from './database.types'

import type { Tables, Enums } from './database.types'

// ── Row types (alias convenientes) ───────────────────────────────────────────
export type Curso          = Tables<'cursos'>
export type Perfil         = Tables<'perfiles'>
export type Alumno         = Tables<'alumnos'>
export type ApoderadoAlumno = Tables<'apoderado_alumno'>
export type Billetera      = Tables<'billeteras'>
export type FondoReserva   = Tables<'fondo_reserva'>
export type Evento         = Tables<'eventos'>
export type Votacion       = Tables<'votaciones'>
export type Voto           = Tables<'votos'>
export type Cuota          = Tables<'cuotas'>
export type Transaccion    = Tables<'transacciones'>
export type SaldoFavor     = Tables<'saldo_favor'>
export type Auditoria      = Tables<'auditoria'>
export type CuotaVista     = Tables<'cuotas_vista'>

// ── Enum types ────────────────────────────────────────────────────────────────
export type RolUsuario        = Enums<'rol_usuario'>
export type EstadoUsuario     = Enums<'estado_usuario'>
export type TipoBilletera     = Enums<'tipo_billetera'>
export type EstadoEvento      = Enums<'estado_evento'>
export type TipoTransaccion   = Enums<'tipo_transaccion'>
export type EstadoTransaccion = Enums<'estado_transaccion'>
export type TipoVotacion      = Enums<'tipo_votacion'>
export type EstadoVotacion    = Enums<'estado_votacion'>
export type OpcionVoto        = Enums<'opcion_voto'>
export type DestinoSobrante   = Enums<'destino_sobrante'>

// ── Tipos compuestos frecuentes en la UI ──────────────────────────────────────
export type PerfilConAlumnos = Perfil & {
  alumnos: Alumno[]
  cantidad_alumnos: number
}

export type EventoConResumen = Evento & {
  cuotas_pagadas:  number
  cuotas_total:    number
  monto_recaudado: number
  porcentaje_pago: number
}

export type VotacionConMiVoto = Votacion & {
  mi_voto: Voto | null
}

// ── Guards de rol ─────────────────────────────────────────────────────────────
export function esJerarquia(rol: RolUsuario): boolean {
  return ['fundador', 'presidente', 'profesor_jefe'].includes(rol)
}

export function esFinanciero(rol: RolUsuario): boolean {
  return ['fundador', 'presidente', 'tesorero', 'profesor_jefe'].includes(rol)
}
