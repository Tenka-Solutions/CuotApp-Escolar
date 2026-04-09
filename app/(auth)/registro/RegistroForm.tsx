'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { startTransition, useState } from 'react'
import { ArrowRight, Eye, EyeOff, Hash, LoaderCircle, LockKeyhole, Mail, Phone, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { TablesInsert } from '@/lib/types'

interface PerfilTableMutations {
  insert: (values: TablesInsert<'perfiles'>) => Promise<{ error: { message?: string } | null }>
}

export default function RegistroForm() {
  const router   = useRouter()
  const supabase = createClient()

  const [nombre,       setNombre]       = useState('')
  const [rut,          setRut]          = useState('')
  const [telefono,     setTelefono]     = useState('')
  const [email,        setEmail]        = useState('')
  const [password,     setPassword]     = useState('')
  const [codigoInv,    setCodigoInv]    = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error,        setError]        = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    // 1. Look up invitation code
    const { data: cursoRaw, error: cursoErr } = await supabase
      .from('cursos')
      .select('id')
      .eq('codigo_invitacion', codigoInv.trim().toUpperCase())
      .single()
    const curso = cursoRaw as { id: string } | null

    if (cursoErr || !curso) {
      setIsSubmitting(false)
      setError('Código de invitación inválido. Verifica con el administrador del curso.')
      return
    }

    // 2. Sign up with Supabase Auth
    const { data: authData, error: signUpErr } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { nombre_completo: nombre.trim() } },
    })

    if (signUpErr || !authData.user) {
      setIsSubmitting(false)
      setError(signUpErr?.message ?? 'No pudimos crear tu cuenta. Intenta de nuevo.')
      return
    }

    // 3. Insert perfil (estado pendiente — awaiting approval)
    const perfilPayload: TablesInsert<'perfiles'> = {
      id:              authData.user.id,
      nombre_completo: nombre.trim(),
      rut:             rut.trim(),
      telefono:        telefono.trim(),
      rol:             'apoderado',
      estado:          'pendiente',
      curso_id:        curso.id,
    }
    const perfilesTable = supabase.from('perfiles') as unknown as PerfilTableMutations
    const { error: perfilErr } = await perfilesTable.insert(perfilPayload)

    if (perfilErr) {
      setIsSubmitting(false)
      setError('Cuenta creada, pero no pudimos vincularla al curso. Contacta al administrador.')
      return
    }

    startTransition(() => {
      router.replace('/pendiente-aprobacion')
    })
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-white/10 ring-1 ring-white/20 backdrop-blur-md">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">Nuevo acceso</p>
        <h2 className="mt-1 text-lg font-semibold text-white">Crear cuenta</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 px-6 py-5">
        {/* Nombre */}
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-white/70">Nombre completo</span>
          <span className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15 focus-within:bg-white/15 focus-within:ring-white/30">
            <User className="h-4 w-4 shrink-0 text-white/50" />
            <input
              type="text"
              autoComplete="name"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border-0 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
              placeholder="Tu nombre completo"
              required
            />
          </span>
        </label>

        {/* RUT */}
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-white/70">RUT</span>
          <span className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15 focus-within:bg-white/15 focus-within:ring-white/30">
            <Hash className="h-4 w-4 shrink-0 text-white/50" />
            <input
              type="text"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              className="w-full border-0 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
              placeholder="12.345.678-9"
              required
            />
          </span>
        </label>

        {/* Teléfono */}
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-white/70">Teléfono</span>
          <span className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15 focus-within:bg-white/15 focus-within:ring-white/30">
            <Phone className="h-4 w-4 shrink-0 text-white/50" />
            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full border-0 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
              placeholder="+56 9 1234 5678"
              required
            />
          </span>
        </label>

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
              placeholder="tu-correo@ejemplo.cl"
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

        {/* Código de invitación */}
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-white/70">Código de invitación</span>
          <span className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15 focus-within:bg-white/15 focus-within:ring-white/30">
            <Hash className="h-4 w-4 shrink-0 text-white/50" />
            <input
              type="text"
              value={codigoInv}
              onChange={(e) => setCodigoInv(e.target.value)}
              className="w-full border-0 bg-transparent font-mono text-sm uppercase text-white outline-none placeholder:text-white/30 placeholder:normal-case"
              placeholder="Ej. ABC123"
              required
            />
          </span>
        </label>

        {/* Error */}
        {error && (
          <div className="rounded-2xl bg-red-500/20 px-4 py-3 text-sm text-red-200 ring-1 ring-red-400/20">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-brand-700 shadow-lg transition hover:bg-white/90 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <><LoaderCircle className="h-4 w-4 animate-spin" /> Creando cuenta...</>
          ) : (
            <>Unirse al curso <ArrowRight className="h-4 w-4" /></>
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="border-t border-white/10 px-6 py-4 text-center text-xs text-white/50">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-medium text-white/80 transition hover:text-white">
          Inicia sesión
        </Link>
      </div>
    </div>
  )
}
