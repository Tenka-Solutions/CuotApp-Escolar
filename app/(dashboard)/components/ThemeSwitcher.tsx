'use client'

import { useRef, useState, useEffect } from 'react'
import { Palette } from 'lucide-react'
import { THEMES, applyTheme, type ThemeId } from '@/lib/themes'

export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

  useEffect(() => {
    if (open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 6, left: r.right })
    }
  }, [open])

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
          {/* transparent backdrop to close on click-away */}
          <div
            className="fixed inset-0 z-[999]"
            onClick={() => setOpen(false)}
          />

          {/* dropdown anchored to button */}
          {pos && (
            <div
              className="fixed z-[1000] w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
              style={{ top: pos.top, left: pos.left, transform: 'translateX(-100%)' }}
            >
              <p className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Tema de color
              </p>
              <div className="pb-1.5">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => { applyTheme(theme.id as ThemeId); setOpen(false) }}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
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
          )}
        </>
      )}
    </div>
  )
}
