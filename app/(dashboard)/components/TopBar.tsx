import { ShieldCheck } from 'lucide-react'
import ThemeSwitcher from './ThemeSwitcher'

interface TopBarProps {
  courseName: string
  courseSubtitle: string
  userName: string
  userRole: string
}

export default function TopBar({ courseName, courseSubtitle, userName, userRole }: TopBarProps) {
  return (
    <header className="flex h-[52px] shrink-0 items-center justify-between border-b border-brand-100/60 bg-white/80 px-4 backdrop-blur-md lg:px-6">
      {/* Left: logo + course */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-600">
          <span className="text-sm font-bold text-white">C</span>
        </div>
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-sm font-semibold text-slate-800">{courseName}</p>
          {courseSubtitle && (
            <p className="truncate text-[10px] text-slate-400">{courseSubtitle}</p>
          )}
        </div>
      </div>

      {/* Right: theme + user */}
      <div className="flex items-center gap-2">
        <ThemeSwitcher />
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-100">
            <ShieldCheck className="h-3 w-3 text-brand-600" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-slate-700 leading-none">{userName}</p>
            <p className="text-[10px] text-slate-400 leading-none mt-0.5 capitalize">{userRole}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
