'use server'

import { revalidatePath } from 'next/cache'
import { ROOT_DEV_EMAIL } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import type { Perfil } from '@/lib/types'
import { formatearRut, validarRut } from '@/lib/utils'

export interface ProfileActionState {
  status: 'idle' | 'success' | 'error'
  message: string | null
}

type PerfilContext = Pick<Perfil, 'id'>

interface MutationResult {
  error: { message?: string } | null
}

interface ProfileTableMutations {
  update: (values: { nombre_completo: string; rut: string; telefono: string }) => {
    eq: (column: string, value: string) => Promise<MutationResult>
  }
}

export async function updateProfile(
  previousState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const nombreCompleto = String(formData.get('nombreCompleto') ?? '').trim()
  const telefono = String(formData.get('telefono') ?? '').trim()
  const rutInput = String(formData.get('rut') ?? '').trim()

  if (nombreCompleto.length < 3) {
    return {
      ...previousState,
      status: 'error',
      message: 'Ingresa un nombre completo valido.',
    }
  }

  if (telefono.length < 8) {
    return {
      ...previousState,
      status: 'error',
      message: 'Ingresa un telefono valido.',
    }
  }

  if (!validarRut(rutInput)) {
    return {
      ...previousState,
      status: 'error',
      message: 'El RUT ingresado no es valido.',
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      ...previousState,
      status: 'error',
      message: 'Tu sesion expiro. Vuelve a iniciar sesion.',
    }
  }

  const { data: perfilData } = await supabase
    .from('perfiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()
  const perfil = perfilData as PerfilContext | null

  if (!perfil) {
    return {
      ...previousState,
      status: 'error',
      message:
        user.email?.toLowerCase() === ROOT_DEV_EMAIL
          ? 'El usuario root de desarrollo puede revisar el perfil, pero no guardarlo sin un perfil persistido.'
          : 'Tu perfil aun no esta listo para ser editado.',
    }
  }

  const profilesTable = supabase.from('perfiles') as unknown as ProfileTableMutations
  const { error } = await profilesTable
    .update({
      nombre_completo: nombreCompleto,
      rut: formatearRut(rutInput),
      telefono,
    })
    .eq('id', user.id)

  if (error) {
    return {
      ...previousState,
      status: 'error',
      message: 'No pudimos guardar tus cambios en este momento.',
    }
  }

  revalidatePath('/')
  revalidatePath('/perfil')

  return {
    status: 'success',
    message: 'Perfil actualizado correctamente.',
  }
}
