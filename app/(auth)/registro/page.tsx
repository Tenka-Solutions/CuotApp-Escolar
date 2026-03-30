import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Registro' }

export default function RegistroPage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-1">Unirse a un curso</h2>
      <p className="text-sm text-slate-500 mb-6">
        Ingresa el código de invitación que te compartió el Fundador del curso.
      </p>

      {/* Formulario — Capa 2 (UI) */}
      <div className="space-y-4">
        <div className="h-11 rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-11 rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-11 rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-11 rounded-xl bg-slate-100 animate-pulse" />
        <div className="h-11 rounded-xl bg-brand-600 animate-pulse" />
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        ¿Ya tienes cuenta?{' '}
        <a href="/login" className="font-medium text-brand-600 hover:underline">
          Inicia sesión
        </a>
      </p>
    </div>
  )
}
