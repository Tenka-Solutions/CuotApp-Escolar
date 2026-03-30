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
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState<string>(ROOT_DEV_EMAIL)
  const [password, setPassword] = useState<string>(ROOT_DEV_PASSWORD)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_24px_60px_-34px_rgba(15,23,42,0.38)]">
      <div className="border-b border-brand-100 bg-[linear-gradient(135deg,rgba(37,99,235,0.08),rgba(240,253,244,0.9))] px-6 py-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">
          Acceso seguro
        </p>
        <h2 className="mt-2 text-xl font-semibold text-slate-900">Iniciar sesión</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          Entra con tu correo registrado para revisar pagos, votaciones y movimientos del curso.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Correo electrónico</span>
          <span className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-brand-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-100">
            <Mail className="h-[18px] w-[18px] text-slate-400" />
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="tu-correo@colegio.cl"
              required
            />
          </span>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Contraseña</span>
          <span className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-brand-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-100">
            <LockKeyhole className="h-[18px] w-[18px] text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              placeholder="Tu contraseña"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 active:scale-95"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
            </button>
          </span>
        </label>

        {error ? (
          <div className="rounded-2xl border border-danger-100 bg-danger-50 px-4 py-3 text-sm text-danger-600">
            {error}
          </div>
        ) : (
          <div className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700">
            Acceso de desarrollo precargado: <span className="font-semibold">{ROOT_DEV_EMAIL}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_-20px_rgba(37,99,235,0.9)] transition hover:bg-brand-700 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle className="h-[18px] w-[18px] animate-spin" />
              Ingresando...
            </>
          ) : (
            <>
              Entrar al dashboard
              <ArrowRight className="h-[18px] w-[18px]" />
            </>
          )}
        </button>
      </form>

      <div className="border-t border-slate-100 px-6 py-4 text-center text-sm text-slate-500">
        ¿Tienes un código de invitación?{' '}
        <Link href="/registro" className="font-medium text-brand-600 transition hover:text-brand-700 hover:underline">
          Regístrate aquí
        </Link>
      </div>
    </div>
  )
}
