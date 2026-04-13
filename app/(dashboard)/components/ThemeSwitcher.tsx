'use client'

import { useRef, useState } from 'react'
import { Palette } from 'lucide-react'
import { THEMES, applyTheme, type ThemeId } from '@/lib/themes'

export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)

  const getMenuStyle = (): React.CSSProperties => {
    if (!btnRef.current) return {}
    const rect = btnRef.current.getBoundingClientRect()
    return {
      position: 'fixed',
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    }
  }

  return (
    <div>
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-brand-50 hover:text-brand-600 active:scale-95"
        aria-label="Cambiar tema de color"
      >
        <Palette className="h-4 w-4" />
      </button>

      {open && (
        <>
          {/* backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div
            className="z-50 min-w-[180px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
            style={getMenuStyle()}
          >
            <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Tema de color
            </p>
            <div className="pb-2">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => { applyTheme(theme.id as ThemeId); setOpen(false) }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <span className="flex shrink-0 gap-1">
                    <span
                      className="h-4 w-4 rounded-full ring-1 ring-black/10"
                      style={{ backgroundColor: theme.preview[0] }}
                    />
                    <span
                      className="h-4 w-4 rounded-full ring-1 ring-black/10"
                      style={{ backgroundColor: theme.preview[1] }}
                    />
                  </span>
                  <span className="truncate text-xs">{theme.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
