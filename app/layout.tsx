import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    template: '%s | CuotApp',
    default:  'CuotApp Escolar',
  },
  description: 'Gobernanza, votación y transparencia financiera para cursos escolares en Chile.',
  applicationName: 'CuotApp',
  appleWebApp: {
    capable:         true,
    statusBarStyle:  'black-translucent',
    title:           'CuotApp',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width:          'device-width',
  initialScale:   1,
  maximumScale:   1,
  userScalable:   false,
  viewportFit:    'cover',       // Respeta el notch en iPhone
  themeColor:     '#2563eb',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full">
        {children}
      </body>
    </html>
  )
}
