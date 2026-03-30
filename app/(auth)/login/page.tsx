import type { Metadata } from 'next'
import LoginForm from './LoginForm'

export const metadata: Metadata = { title: 'Iniciar sesión' }

interface LoginPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams
  const rawRedirect = resolvedSearchParams?.redirect
  const redirectTo = Array.isArray(rawRedirect) ? rawRedirect[0] : rawRedirect

  return <LoginForm redirectTo={redirectTo?.startsWith('/') ? redirectTo : '/'} />
}
