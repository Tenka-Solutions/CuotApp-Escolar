import type { Metadata } from 'next'
import NuevaContrasenaForm from './NuevaContrasenaForm'

export const metadata: Metadata = { title: 'Nueva contraseña' }

export default function NuevaContrasenaPage() {
  return <NuevaContrasenaForm />
}
