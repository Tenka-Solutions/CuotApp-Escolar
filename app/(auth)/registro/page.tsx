import type { Metadata } from 'next'
import RegistroForm from './RegistroForm'

export const metadata: Metadata = { title: 'Registro' }

export default function RegistroPage() {
  return <RegistroForm />
}
