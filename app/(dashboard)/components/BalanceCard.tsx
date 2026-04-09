import { ShieldCheck, TrendingUp } from 'lucide-react'
import { formatearMonto } from '@/lib/utils'
import type { SaldoTotal } from './dashboard.types'

interface BalanceCardProps {
  balance: SaldoTotal
}

export default function BalanceCard({ balance }: BalanceCardProps) {
  return (
    <div className="flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-brand-700 to-brand-600 p-5 text-white shadow-[0_24px_60px_-16px_rgba(147,51,234,0.45)] lg:min-h-0 lg:flex-1 lg:rounded-[2rem]">
      {/* Top */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
            Saldo del curso
          </p>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
          <ShieldCheck className="h-5 w-5 text-white/80" />
        </div>
      </div>

      {/* Center — big number */}
      <div>
        <p className="text-[11px] font-medium text-white/60">Total consolidado</p>
        <p className="mt-1 text-[clamp(2rem,5vw,3rem)] font-bold tracking-tight text-accent-400 leading-none">
          {formatearMonto(balance.total)}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-white/8 px-3 py-2">
            <p className="text-[9px] uppercase tracking-wider text-white/50">Apoderados</p>
            <p className="mt-0.5 text-sm font-semibold text-white">{formatearMonto(balance.apoderados)}</p>
          </div>
          <div className="rounded-xl bg-white/8 px-3 py-2">
            <p className="text-[9px] uppercase tracking-wider text-white/50">Alumnos</p>
            <p className="mt-0.5 text-sm font-semibold text-white">{formatearMonto(balance.alumnos)}</p>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="flex items-center justify-end">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success-500/20 px-3 py-1 text-[10px] font-semibold text-emerald-200">
          <TrendingUp className="h-3 w-3" />
          Flujo saludable
        </span>
      </div>
    </div>
  )
}
