import { REGLAS } from '@/lib/constants'

// ── RUT chileno ───────────────────────────────────────────────────────────────

/**
 * Valida un RUT chileno.
 * Acepta formatos: "12345678-9", "12.345.678-9", "12345678K".
 */
export function validarRut(rut: string): boolean {
  const cleaned = rut.replace(/[^0-9kK]/g, '').toUpperCase()
  if (cleaned.length < 2) return false

  const body = cleaned.slice(0, -1)
  const dv   = cleaned.slice(-1)

  let sum = 0
  let mul = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * mul
    mul  = mul === 7 ? 2 : mul + 1
  }

  const rem      = 11 - (sum % 11)
  const expected = rem === 11 ? '0' : rem === 10 ? 'K' : String(rem)

  return dv === expected
}

/**
 * Formatea a "12.345.678-9".
 */
export function formatearRut(rut: string): string {
  const cleaned = rut.replace(/[^0-9kK]/g, '').toUpperCase()
  if (cleaned.length < 2) return rut
  const body      = cleaned.slice(0, -1)
  const dv        = cleaned.slice(-1)
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${formatted}-${dv}`
}

// ── Moneda y fechas ───────────────────────────────────────────────────────────

/**
 * Formatea a pesos chilenos: "$12.345".
 */
export function formatearMonto(monto: number): string {
  return new Intl.NumberFormat('es-CL', {
    style:                 'currency',
    currency:              'CLP',
    minimumFractionDigits: 0,
  }).format(monto)
}

/**
 * Formatea fecha en español (Chile). Ej: "12 ene. 2026".
 */
export function formatearFecha(
  fecha:    string | Date,
  opciones?: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat('es-CL', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
    ...opciones,
  }).format(new Date(fecha))
}

/**
 * Retorna "hace X minutos/horas/días" en español.
 */
export function tiempoRelativo(fecha: string | Date): string {
  const diff = Date.now() - new Date(fecha).getTime()
  const rtf  = new Intl.RelativeTimeFormat('es-CL', { numeric: 'auto' })

  const minutos = Math.round(diff / 60_000)
  if (Math.abs(minutos) < 60)  return rtf.format(-minutos, 'minute')

  const horas = Math.round(diff / 3_600_000)
  if (Math.abs(horas) < 24)    return rtf.format(-horas, 'hour')

  const dias = Math.round(diff / 86_400_000)
  return rtf.format(-dias, 'day')
}

// ── Lógica de negocio ─────────────────────────────────────────────────────────

/**
 * Calcula el porcentaje transcurrido del plazo de un evento [0, 1].
 */
export function calcularPorcentajePlazo(
  fechaInicio: string | Date,
  fechaLimite: string | Date,
  ahora: Date = new Date()
): number {
  const inicio  = new Date(fechaInicio).getTime()
  const limite  = new Date(fechaLimite).getTime()
  const ahoraMs = ahora.getTime()

  if (limite <= inicio) return 1
  return Math.min(1, Math.max(0, (ahoraMs - inicio) / (limite - inicio)))
}

/**
 * Determina si el curso sigue en Modo En Marcha (primeros 30 días).
 */
export function modoEnMarchaActivo(
  fechaInicio: string | Date,
  ahora: Date = new Date()
): boolean {
  const inicio = new Date(fechaInicio).getTime()
  const limite = inicio + REGLAS.MODO_EN_MARCHA_DIAS * 24 * 60 * 60 * 1000
  return ahora.getTime() < limite
}

/**
 * Determina si se cumplió la Regla del 70% (revelar identidad de deudores).
 */
export function deudorRevelado(
  fechaInicio: string | Date,
  fechaLimite: string | Date
): boolean {
  return calcularPorcentajePlazo(fechaInicio, fechaLimite) >= REGLAS.UMBRAL_DEUDORES_PCT
}

/**
 * Calcula el quórum requerido para la 1ª vuelta: ⌈N/2⌉ + 1.
 */
export function calcularQuorum(totalVotantes: number): number {
  return Math.ceil(totalVotantes / 2) + 1
}

/**
 * Evalúa el resultado de una votación según la vuelta.
 */
export function evaluarVotacion(params: {
  votosSi:         number
  votosNo:         number
  votosAbstencion: number
  quorumRequerido: number | null
  vuelta:          1 | 2
}): 'aprobada' | 'rechazada' | 'sin_quorum' {
  const { votosSi, votosNo, votosAbstencion, quorumRequerido, vuelta } = params
  const totalEmitidos = votosSi + votosNo + votosAbstencion

  if (vuelta === 1 && quorumRequerido !== null) {
    if (totalEmitidos < quorumRequerido) return 'sin_quorum'
  }

  const votosValidos = votosSi + votosNo
  if (votosValidos === 0) return vuelta === 1 ? 'sin_quorum' : 'rechazada'

  return votosSi > votosNo ? 'aprobada' : 'rechazada'
}

// ── UI helpers ────────────────────────────────────────────────────────────────

/**
 * Genera iniciales para avatares: "Juan Pérez" → "JP".
 */
export function obtenerIniciales(nombreCompleto: string): string {
  return nombreCompleto
    .split(' ')
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase() ?? '')
    .join('')
}

/**
 * Combina clases CSS (alternativa mínima a clsx para este proyecto).
 */
export function cn(...clases: (string | undefined | null | false)[]): string {
  return clases.filter(Boolean).join(' ')
}
