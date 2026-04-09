'use client'

import { useEffect } from 'react'
import { applyTheme, DEFAULT_THEME, THEME_STORAGE_KEY, type ThemeId } from '@/lib/themes'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const stored = (localStorage.getItem(THEME_STORAGE_KEY) ?? DEFAULT_THEME) as ThemeId
    applyTheme(stored)
  }, [])

  return <>{children}</>
}
