'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { startTransition, useState } from 'react'
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from 'lucide-react'
import { ROOT_DEV_EMAIL, ROOT_DEV_PASSWORD } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'

interface LoginFormProps {
  redirectTo: string
}

export default function LoginForm({ redirectTo }: LoginFormProps) {
  const router   = useRouter()
  const supabase = createClient()

  const [email,        setEmail]        = useState<string>(ROOT_DEV_EMAIL)
  const [password,     setPassword]     = useState<string>(ROOT_DEV_PASSWORD)
  const [showPassword, setShowPassword] = useState(false)
  const [error,        setError]        = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (signInError) {
      setIsSubmitting(false)
      setError('No pudimos iniciar sesión. Revisa tu correo y contraseña.')
      return
    }

    startTransition(() => {
      router.replace(redirectTo)
      router.refresh()
    })
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-white/10 ring-1 ring-white/20 backdrop-blur-md">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
          Acceso seguro
        </p>
        <h2 className="mt-1 text-lg font-semibold text-white">Iniciar sesión</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 px-6 py-5">
        {/* Email */}
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

        {/* Password */}
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-white/70">Contraseña</span>
          <span className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15 focus-within:bg-white/15 focus-within:ring-white/30">
            <LockKeyhole className="h-4 w-4 shrink-0 text-white/50" />
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-0 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
              placeholder="Tu contraseña"
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

        {/* Info / Error */}
        {error ? (
          <div className="rounded-2xl bg-red-500/20 px-4 py-3 text-sm text-red-200 ring-1 ring-red-400/20">
            {error}
          </div>
        ) : (
          <div className="rounded-2xl bg-white/8 px-4 py-2.5 text-xs text-white/50 ring-1 ring-white/10">
            Dev: <span className="font-medium text-white/70">{ROOT_DEV_EMAIL}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-brand-700 shadow-lg transition hover:bg-white/90 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <><LoaderCircle className="h-4 w-4 animate-spin" /> Ingresando...</>
          ) : (
            <>Entrar al dashboard <ArrowRight className="h-4 w-4" /></>
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="border-t border-white/10 px-6 py-4 text-center text-xs text-white/50">
        ¿Tienes un código de invitación?{' '}
        <Link href="/registro" className="font-medium text-white/80 transition hover:text-white">
          Regístrate aquí
        </Link>
      </div>
    </div>
  )
}
