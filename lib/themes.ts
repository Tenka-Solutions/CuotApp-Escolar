export type ThemeId = 'purple-gold' | 'blue-emerald' | 'rose-amber' | 'teal-violet' | 'slate-orange'

export interface ThemeColors {
  'brand-50': string
  'brand-100': string
  'brand-200': string
  'brand-300': string
  'brand-500': string
  'brand-600': string
  'brand-700': string
  'brand-900': string
}

export interface Theme {
  id: ThemeId
  name: string
  preview: [string, string]
  colors: ThemeColors
}

export const THEMES: Theme[] = [
  {
    id: 'purple-gold',
    name: 'Púrpura & Dorado',
    preview: ['#9333ea', '#f59e0b'],
    colors: {
      'brand-50':  '#faf5ff',
      'brand-100': '#f3e8ff',
      'brand-200': '#e9d5ff',
      'brand-300': '#d8b4fe',
      'brand-500': '#a855f7',
      'brand-600': '#9333ea',
      'brand-700': '#7e22ce',
      'brand-900': '#581c87',
    },
  },
  {
    id: 'blue-emerald',
    name: 'Azul & Esmeralda',
    preview: ['#2563eb', '#10b981'],
    colors: {
      'brand-50':  '#eff6ff',
      'brand-100': '#dbeafe',
      'brand-200': '#bfdbfe',
      'brand-300': '#93c5fd',
      'brand-500': '#3b82f6',
      'brand-600': '#2563eb',
      'brand-700': '#1d4ed8',
      'brand-900': '#1e3a8a',
    },
  },
  {
    id: 'rose-amber',
    name: 'Rosa & Ámbar',
    preview: ['#e11d48', '#f59e0b'],
    colors: {
      'brand-50':  '#fff1f2',
      'brand-100': '#ffe4e6',
      'brand-200': '#fecdd3',
      'brand-300': '#fda4af',
      'brand-500': '#f43f5e',
      'brand-600': '#e11d48',
      'brand-700': '#be123c',
      'brand-900': '#881337',
    },
  },
  {
    id: 'teal-violet',
    name: 'Teal & Violeta',
    preview: ['#0d9488', '#7c3aed'],
    colors: {
      'brand-50':  '#f0fdfa',
      'brand-100': '#ccfbf1',
      'brand-200': '#99f6e4',
      'brand-300': '#5eead4',
      'brand-500': '#14b8a6',
      'brand-600': '#0d9488',
      'brand-700': '#0f766e',
      'brand-900': '#134e4a',
    },
  },
  {
    id: 'slate-orange',
    name: 'Pizarra & Naranja',
    preview: ['#334155', '#f97316'],
    colors: {
      'brand-50':  '#f8fafc',
      'brand-100': '#f1f5f9',
      'brand-200': '#e2e8f0',
      'brand-300': '#cbd5e1',
      'brand-500': '#64748b',
      'brand-600': '#334155',
      'brand-700': '#1e293b',
      'brand-900': '#0f172a',
    },
  },
]

export const DEFAULT_THEME: ThemeId = 'purple-gold'
export const THEME_STORAGE_KEY = 'cuotapp-theme'

/** Applies a theme by setting CSS custom properties on <html>. Safe to call from client only. */
export function applyTheme(themeId: ThemeId): void {
  if (typeof document === 'undefined') return
  const theme = THEMES.find((t) => t.id === themeId)
  if (!theme) return
  const root = document.documentElement
  for (const [key, value] of Object.entries(theme.colors)) {
    root.style.setProperty(`--color-${key}`, value)
  }
  try { localStorage.setItem(THEME_STORAGE_KEY, themeId) } catch { /* ignore */ }
}
