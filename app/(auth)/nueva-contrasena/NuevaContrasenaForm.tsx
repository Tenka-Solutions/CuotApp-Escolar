'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { startTransition, useState } from 'react'
import { CheckCircle2, Eye, EyeOff, LoaderCircle, LockKeyhole } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function NuevaContrasenaForm() {
  const router   = useRouter()
  const supabase = createClient()

  const [password, setPassword]         = useState('')
  const [confirm, setConfirm]           = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [done, setDone]                 = useState(false)
  const [error, setError]               = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    setIsSubmitting(true)

    const { error: updateErr } = await supabase.auth.updateUser({ password })

    setIsSubmitting(false)

    if (updateErr) {
      setError('No pudimos actualizar tu contraseña. El enlace puede haber expirado.')
      return
    }

    setDone(true)
    setTimeout(() => {
      startTransition(() => router.replace('/'))
    }, 2000)
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-white/10 ring-1 ring-white/20 backdrop-blur-md">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">Seguridad</p>
        <h2 className="mt-1 text-lg font-semibold text-white">Nueva contraseña</h2>
      </div>

      {done ? (
        <div className="px-6 py-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-success-500/20 ring-1 ring-success-400/30">
            <CheckCircle2 className="h-7 w-7 text-success-300" />
          </div>
          <p className="text-sm text-white/80">Contraseña actualizada correctamente.</p>
          <p className="mt-2 text-xs text-white/50">Redirigiendo al dashboard...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 px-6 py-5">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-white/70">Nueva contraseña</span>
            <span className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15 focus-within:bg-white/15 focus-within:ring-white/30">
              <LockKeyhole className="h-4 w-4 shrink-0 text-white/50" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border-0 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="rounded-full p-1 text-white/40 transition hover:text-white/70"
                aria-label={showPassword ? 'Ocultar' : 'Mostrar'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </span>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-white/70">Confirmar contraseña</span>
            <span className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15 focus-within:bg-white/15 focus-within:ring-white/30">
              <LockKeyhole className="h-4 w-4 shrink-0 text-white/50" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full border-0 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                placeholder="Repite la contraseña"
                minLength={8}
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
              <><LoaderCircle className="h-4 w-4 animate-spin" /> Guardando...</>
            ) : (
              'Guardar nueva contraseña'
            )}
          </button>
        </form>
      )}

      {/* Footer */}
      <div className="border-t border-white/10 px-6 py-4 text-center text-xs text-white/50">
        <Link href="/login" className="font-medium text-white/80 transition hover:text-white">
          Ir al login
        </Link>
      </div>
    </div>
  )
}
