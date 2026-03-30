import type {
  EstadoTransaccion,
  TipoBilletera,
  TipoTransaccion,
  TipoVotacion,
} from '@/lib/types'

export interface SaldoTotal {
  total: number
  apoderados: number
  alumnos: number
}

export interface EventoActivo {
  id: string
  nombre: string
  fechaLimitePago: string
  montoObjetivo: number
  montoRecaudado: number
  montoPendiente: number
  porcentajeRecaudacion: number
  cuotasPagadas: number
  cuotasPendientes: number
  tipoBilletera: TipoBilletera
}

export interface PaymentMilestone {
  date: string
  status: 'success' | 'critical'
  count: number
  amount: number
  label: string
}

export interface DashboardMovement {
  id: string
  descripcion: string
  monto: number
  fechaRegistro: string
  estado: EstadoTransaccion
  tipo: TipoTransaccion
}

export interface PendingVote {
  id: string
  tipo: TipoVotacion
  fechaFin: string | null
  vuelta: number
  votosEmitidos: number
  totalVotantes: number
}
