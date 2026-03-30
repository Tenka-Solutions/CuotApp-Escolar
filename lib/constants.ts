import type { RolUsuario, EstadoUsuario, EstadoEvento, EstadoVotacion, EstadoTransaccion } from '@/lib/types'

// ── Roles ────────────────────────────────────────────────────────────────────
export const ROLES = {
  FUNDADOR:      'fundador',
  PRESIDENTE:    'presidente',
  TESORERO:      'tesorero',
  SECRETARIO:    'secretario',
  PROFESOR_JEFE: 'profesor_jefe',
  ALUMNO:        'alumno',
  APODERADO:     'apoderado',
} as const satisfies Record<string, RolUsuario>

/** Roles con autoridad de gobernanza (veto, aprobaciones de estado). */
export const ROLES_JERARQUIA: RolUsuario[] = [
  'fundador', 'presidente', 'profesor_jefe',
]

/** Roles con acceso al flujo financiero (registrar, aprobar, validar). */
export const ROLES_FINANCIERO: RolUsuario[] = [
  'fundador', 'presidente', 'tesorero', 'profesor_jefe',
]

/** Roles que pueden leer el registro de auditoría. */
export const ROLES_AUDITORIA: RolUsuario[] = [
  'fundador', 'presidente', 'profesor_jefe', 'secretario',
]

// ── Estados de usuario ────────────────────────────────────────────────────────
export const ESTADO_USUARIO = {
  PENDIENTE:  'pendiente',
  ACTIVO:     'activo',
  RECHAZADO:  'rechazado',
  SUSPENDIDO: 'suspendido',
} as const satisfies Record<string, EstadoUsuario>

// ── Estados de evento ─────────────────────────────────────────────────────────
export const ESTADO_EVENTO = {
  BORRADOR:  'borrador',
  ACTIVO:    'activo',
  CERRADO:   'cerrado',
  CANCELADO: 'cancelado',
} as const satisfies Record<string, EstadoEvento>

// ── Estados de votación ───────────────────────────────────────────────────────
export const ESTADO_VOTACION = {
  PRIMERA_VUELTA: 'primera_vuelta',
  SEGUNDA_VUELTA: 'segunda_vuelta',
  APROBADA:       'aprobada',
  RECHAZADA:      'rechazada',
  VETADA:         'vetada',
  EXPIRADA:       'expirada',
} as const satisfies Record<string, EstadoVotacion>

// ── Estados de transacción ────────────────────────────────────────────────────
export const ESTADO_TRANSACCION = {
  PENDIENTE_APROBACION:  'pendiente_aprobacion',
  PENDIENTE_VALIDACION:  'pendiente_validacion',
  APROBADA:              'aprobada',
  RECHAZADA:             'rechazada',
} as const satisfies Record<string, EstadoTransaccion>

// ── Reglas de negocio ─────────────────────────────────────────────────────────
export const REGLAS = {
  /** Duración (días) del Modo En Marcha; el Fundador aprueba manualmente. */
  MODO_EN_MARCHA_DIAS: 30,

  /** Porcentaje del plazo transcurrido para revelar identidad de deudores. */
  UMBRAL_DEUDORES_PCT: 0.70,

  /** Días que tiene el Profesor Jefe para validar antes de auto-aprobación. */
  AUTO_VALIDACION_DIAS: 7,

  /** Duración en horas de la primera vuelta de votación (quórum 50%+1). */
  VOTACION_1ERA_VUELTA_HORAS: 24,

  /** Duración en horas de la segunda vuelta de votación (sin quórum mínimo). */
  VOTACION_2DA_VUELTA_HORAS: 48,

  /** Máximas propuestas de evento que un usuario puede hacer por día. */
  MAX_EVENTOS_POR_DIA: 1,
} as const

// ── Rutas públicas (sin autenticación requerida) ──────────────────────────────
export const RUTAS_PUBLICAS = ['/login', '/registro'] as const
