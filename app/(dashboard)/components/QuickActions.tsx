import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { FileText, ShieldCheck, UserRound, Vote, Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROLES_JERARQUIA } from '@/lib/constants'
import type { RolUsuario } from '@/lib/types'

interface ActionItem {
  id: string
  label: string
  href: string
  Icon: LucideIcon
  iconClass: string
  bgClass: string
  badge?: number
}

interface QuickActionsProps {
  userRole?: RolUsuario | string
  pendingCount?: number
}

export default function QuickActions({ userRole, pendingCount = 0 }: QuickActionsProps) {
  const esAdmin = userRole && ROLES_JERARQUIA.includes(userRole as RolUsuario)

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
    ...(esAdmin ? [{
      id: 'aprobaciones',
      label: 'Aprobar',
      href: '/admin/aprobaciones',
      Icon: ShieldCheck,
      iconClass: 'text-amber-600',
      bgClass: 'bg-amber-50 group-hover:bg-amber-100',
      badge: pendingCount > 0 ? pendingCount : undefined,
    }] : []),
  ]

  const cols = esAdmin ? 'grid-cols-5 lg:grid-cols-2' : 'grid-cols-4 lg:grid-cols-2'

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:shrink-0 lg:rounded-[2rem]">
      <p className="border-b border-slate-100 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        Acciones rápidas
      </p>
      <div className={cn('grid', cols)}>
        {ACTIONS.map(({ id, label, href, Icon, iconClass, bgClass, badge }) => (
          <Link
            key={id}
            href={href}
            className="group relative flex flex-col items-center gap-2 px-2 py-4 transition hover:bg-slate-50/80 active:scale-[0.97] lg:flex-row lg:gap-3 lg:px-4 lg:py-3.5"
          >
            <span
              className={cn(
                'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors',
                bgClass,
                iconClass
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              {badge != null && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </span>
            <span className="text-[11px] font-semibold text-slate-700 lg:text-xs">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
