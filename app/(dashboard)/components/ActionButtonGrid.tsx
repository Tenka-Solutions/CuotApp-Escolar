import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { FileText, UserRound, Vote, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActionButtonItem {
  id: string
  label: string
  href: string
  Icon: LucideIcon
  accentClassName: string
}

const actionItems: ActionButtonItem[] = [
  {
    id: 'votar',
    label: 'Votar',
    href: '/votaciones',
    Icon: Vote,
    accentClassName: 'bg-brand-50 text-brand-700',
  },
  {
    id: 'pagar',
    label: 'Pagar',
    href: '/pagar',
    Icon: Wallet,
    accentClassName: 'bg-success-50 text-success-600',
  },
  {
    id: 'boletas',
    label: 'Boletas',
    href: '/boletas',
    Icon: FileText,
    accentClassName: 'bg-slate-100 text-slate-700',
  },
  {
    id: 'perfil',
    label: 'Perfil',
    href: '/perfil',
    Icon: UserRound,
    accentClassName: 'bg-brand-100 text-brand-800',
  },
]

export default function ActionButtonGrid() {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_16px_36px_-30px_rgba(15,23,42,0.9)] lg:flex lg:h-full lg:flex-col lg:rounded-[2rem] lg:p-4">

      {/* Desktop-only label */}
      <div className="mb-3 hidden lg:block">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Acciones
        </p>
      </div>

      {/* Mobile: 4-col row | Desktop: 2×2 grid filling remaining height */}
      <div className="grid grid-cols-4 gap-2 lg:flex-1 lg:grid-cols-2 lg:gap-3">
        {actionItems.map(({ id, label, href, Icon, accentClassName }) => (
          <Link
            key={id}
            href={href}
            aria-label={label}
            className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/85 py-3 text-center transition duration-150 hover:-translate-y-0.5 hover:border-brand-200 hover:bg-white active:translate-y-0 active:scale-[0.97] active:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 lg:items-start lg:justify-between lg:rounded-2xl lg:p-4 lg:text-left"
          >
            <span
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-150 group-hover:scale-105 lg:h-10 lg:w-10 lg:rounded-2xl',
                accentClassName
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <span className="text-[11px] font-semibold text-slate-800 lg:text-sm">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
