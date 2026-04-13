import Link from 'next/link'
import { CalendarCheck, ClipboardCheck, ShieldAlert } from 'lucide-react'
import type { AdminStats } from './dashboard.types'
import type { RolUsuario } from '@/lib/types'
import { ROLES_JERARQUIA } from '@/lib/constants'

interface AdminStatsStripProps {
  stats:    AdminStats
  userRole: string
}

export default function AdminStatsStrip({ stats, userRole }: AdminStatsStripProps) {
  const esJerarquia = ROLES_JERARQUIA.includes(userRole as RolUsuario)
  const showApprovals = esJerarquia && stats.pendingApprovals > 0
  const showTx        = stats.pendingTransactions > 0

  if (!showApprovals && !showTx && !esJerarquia) return null

  return (
    <div className="flex shrink-0 flex-wrap gap-2 px-3 pb-0 pt-2 lg:px-3 lg:pt-3">
      {showApprovals && (
        <Link
          href="/admin/aprobaciones"
          className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-100 active:scale-[0.98]"
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          {stats.pendingApprovals} solicitud{stats.pendingApprovals > 1 ? 'es' : ''} pendiente{stats.pendingApprovals > 1 ? 's' : ''} de aprobación
        </Link>
      )}
      {showTx && (
        <Link
          href="/admin/transacciones"
          className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 active:scale-[0.98]"
        >
          <ClipboardCheck className="h-3.5 w-3.5" />
          {stats.pendingTransactions} transacción{stats.pendingTransactions > 1 ? 'es' : ''} por validar
        </Link>
      )}
      {esJerarquia && (
        <Link
          href="/admin/cierre-anual"
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 active:scale-[0.98]"
        >
          <CalendarCheck className="h-3.5 w-3.5" />
          Cierre anual
        </Link>
      )}
    </div>
  )
}
