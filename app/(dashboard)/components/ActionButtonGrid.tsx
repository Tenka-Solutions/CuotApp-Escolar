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
    <section className="h-full rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_16px_36px_-30px_rgba(15,23,42,0.9)] lg:rounded-[2rem] lg:p-4">
      <div className="mb-3 lg:mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Acciones
        </p>
        <p className="mt-1 text-xs text-slate-500 lg:text-sm">Acceso rapido</p>
        <p className="mt-2 hidden text-xs leading-5 text-slate-500 lg:block">
          Atajos para las tareas clave del curso y tu seguimiento financiero diario.
        </p>
      </div>

      <div className="grid h-[calc(100%-2.25rem)] grid-cols-2 gap-2 lg:h-[calc(100%-4rem)] lg:gap-3">
        {actionItems.map(({ id, label, href, Icon, accentClassName }) => (
          <Link
            key={id}
            href={href}
            aria-label={label}
            className="group flex min-h-[5rem] flex-col items-start justify-between rounded-2xl border border-slate-200 bg-slate-50/85 p-3 text-left transition duration-150 hover:-translate-y-0.5 hover:border-brand-200 hover:bg-white active:translate-y-0 active:scale-[0.97] active:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 lg:min-h-[6.75rem] lg:p-4"
          >
            <span
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-2xl transition-transform duration-150 group-hover:scale-105 lg:h-11 lg:w-11',
                accentClassName
              )}
            >
              <Icon className="h-[18px] w-[18px] lg:h-5 lg:w-5" />
            </span>
            <span className="text-xs font-semibold text-slate-800 lg:text-sm">{label}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
