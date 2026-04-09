import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { FileText, UserRound, Vote, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActionItem {
  id: string
  label: string
  href: string
  Icon: LucideIcon
  iconClass: string
  bgClass: string
}

const ACTIONS: ActionItem[] = [
  {
    id: 'votar',
    label: 'Votar',
    href: '/votaciones',
    Icon: Vote,
    iconClass: 'text-brand-600',
    bgClass: 'bg-brand-50 group-hover:bg-brand-100',
  },
  {
    id: 'pagar',
    label: 'Pagar',
    href: '/pagar',
    Icon: Wallet,
    iconClass: 'text-success-600',
    bgClass: 'bg-success-50 group-hover:bg-success-100',
  },
  {
    id: 'boletas',
    label: 'Boletas',
    href: '/boletas',
    Icon: FileText,
    iconClass: 'text-slate-600',
    bgClass: 'bg-slate-100 group-hover:bg-slate-200',
  },
  {
    id: 'perfil',
    label: 'Perfil',
    href: '/perfil',
    Icon: UserRound,
    iconClass: 'text-accent-600',
    bgClass: 'bg-accent-50 group-hover:bg-accent-100',
  },
]

export default function QuickActions() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:shrink-0 lg:rounded-[2rem]">
      <p className="border-b border-slate-100 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        Acciones rápidas
      </p>
      {/* Mobile: 4-col row | Desktop: 2×2 */}
      <div className="grid grid-cols-4 lg:grid-cols-2">
        {ACTIONS.map(({ id, label, href, Icon, iconClass, bgClass }) => (
          <Link
            key={id}
            href={href}
            className="group flex flex-col items-center gap-2 px-2 py-4 transition hover:bg-slate-50/80 active:scale-[0.97] lg:flex-row lg:gap-3 lg:px-4 lg:py-3.5"
          >
            <span
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors',
                bgClass,
                iconClass
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <span className="text-[11px] font-semibold text-slate-700 lg:text-xs">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
