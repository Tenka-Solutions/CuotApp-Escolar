import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Iniciar sesión' }

export default function LoginPage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-1">Iniciar sesión</h2>
      <p className="text-sm text-slate-500 mb-6">Ingresa con tu correo registrado en el curso.</p>

      {/* Formulario — Capa 2 (UI) */}
      <div className="space-y-4">
        <div className="h-11 rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-11 rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-11 rounded-xl bg-brand-600 animate-pulse" />
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        ¿Tienes un código de invitación?{' '}
        <a href="/registro" className="font-medium text-brand-600 hover:underline">
          Regístrate aquí
        </a>
      </p>
    </div>
  )
}
