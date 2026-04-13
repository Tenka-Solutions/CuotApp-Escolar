'use client'

import { useState } from 'react'
import { Palette } from 'lucide-react'
import { THEMES, applyTheme, type ThemeId } from '@/lib/themes'

export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-brand-50 hover:text-brand-600 active:scale-95"
        aria-label="Cambiar tema de color"
      >
        <Palette className="h-4 w-4" />
      </button>

      {open && (
        <>
          {/* backdrop — dims content so menu is clearly on top */}
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />

          {/* centered menu */}
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={() => setOpen(false)}>
            <div
              className="w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Tema de color
              </p>
              <div className="pb-2">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => { applyTheme(theme.id as ThemeId); setOpen(false) }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
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
          </div>
        </>
      )}
    </div>
  )
}
