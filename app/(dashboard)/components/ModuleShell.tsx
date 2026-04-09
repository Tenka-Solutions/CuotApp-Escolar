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
      className="flex flex-col px-4 py-4 pb-8 md:px-6 lg:h-full lg:min-h-0 lg:px-0 lg:py-6 lg:pb-0"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}
    >
      <div className="rounded-[2rem] border border-slate-200 bg-white/95 p-5 shadow-[0_18px_36px_-30px_rgba(15,23,42,0.85)]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-700 transition hover:text-brand-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al dashboard
            </Link>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 lg:text-3xl">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 lg:text-base">
              {description}
            </p>
          </div>
          {badge ? (
            <span className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700">
              {badge}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-4 min-h-0 flex-1">{children}</div>
    </div>
  )
}
