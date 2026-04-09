import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import ThemeProvider from './components/ThemeProvider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s | CuotApp',
    default:  'CuotApp Escolar',
  },
  description: 'Gobernanza, votación y transparencia financiera para cursos escolares en Chile.',
  applicationName: 'CuotApp',
  appleWebApp: {
    capable:        true,
    statusBarStyle: 'black-translucent',
    title:          'CuotApp',
  },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  width:        'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit:  'cover',
  themeColor:   '#9333ea',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
