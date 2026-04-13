import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface ModuleShellProps {
  title: string
  description: string
  badge?: string
  children: React.ReactNode
}

export default function ModuleShell({
  title,
  description,
  badge,
  children,
}: ModuleShellProps) {
  return (
    <div
      className="flex flex-col overflow-y-auto px-4 py-4 pb-8 md:px-6 lg:h-full lg:min-h-0 lg:px-0 lg:py-6 lg:pb-6"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}
    >
      <div className="shrink-0 rounded-2xl border border-slate-200 bg-white/95 px-5 py-4 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.85)]">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 transition hover:text-brand-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver al dashboard
            </Link>
            <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 lg:text-2xl">
              {title}
            </h1>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 lg:text-sm">
              {description}
            </p>
          </div>
          {badge ? (
            <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
              {badge}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-3 min-h-0 flex-1">{children}</div>
    </div>
  )
}
