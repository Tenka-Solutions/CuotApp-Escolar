'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, CheckCircle2, LoaderCircle, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function RecuperarForm() {
  const supabase = createClient()

  const [email, setEmail]             = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sent, setSent]               = useState(false)
  const [error, setError]             = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${window.location.origin}/nueva-contrasena` }
    )

    setIsSubmitting(false)

    if (resetErr) {
      setError('No pudimos enviar el correo. Verifica la dirección e intenta de nuevo.')
      return
    }

    setSent(true)
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-white/10 ring-1 ring-white/20 backdrop-blur-md">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">Recuperación</p>
        <h2 className="mt-1 text-lg font-semibold text-white">Restablecer contraseña</h2>
      </div>

      {sent ? (
        <div className="px-6 py-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-success-500/20 ring-1 ring-success-400/30">
            <CheckCircle2 className="h-7 w-7 text-success-300" />
          </div>
          <p className="text-sm text-white/80">
            Te enviamos un enlace de recuperación a <span className="font-semibold text-white">{email}</span>.
          </p>
          <p className="mt-2 text-xs text-white/50">
            Revisa tu bandeja de entrada y haz clic en el enlace para crear una nueva contraseña.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 px-6 py-5">
          <p className="text-xs leading-5 text-white/50">
            Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.
          </p>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-white/70">Correo electrónico</span>
            <span className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15 focus-within:bg-white/15 focus-within:ring-white/30">
              <Mail className="h-4 w-4 shrink-0 text-white/50" />
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-0 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                placeholder="tu-correo@colegio.cl"
                required
              />
            </span>
          </label>

          {error && (
            <div className="rounded-2xl bg-red-500/20 px-4 py-3 text-sm text-red-200 ring-1 ring-red-400/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-brand-700 shadow-lg transition hover:bg-white/90 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <><LoaderCircle className="h-4 w-4 animate-spin" /> Enviando...</>
            ) : (
              'Enviar enlace de recuperación'
            )}
          </button>
        </form>
      )}

      {/* Footer */}
      <div className="border-t border-white/10 px-6 py-4 text-center text-xs text-white/50">
        <Link href="/login" className="inline-flex items-center gap-1 font-medium text-white/80 transition hover:text-white">
          <ArrowLeft className="h-3 w-3" /> Volver al login
        </Link>
      </div>
    </div>
  )
}
