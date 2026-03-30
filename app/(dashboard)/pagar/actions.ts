'use server'

import { revalidatePath } from 'next/cache'
import { ROOT_DEV_EMAIL } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'
import type { Evento, Perfil, TablesInsert } from '@/lib/types'

export interface PaymentActionState {
  status: 'idle' | 'success' | 'error'
  message: string | null
}

type PerfilContext = Pick<Perfil, 'id' | 'curso_id' | 'nombre_completo'>
type EventoContext = Pick<Evento, 'id' | 'curso_id' | 'nombre' | 'estado'>

interface MutationResult {
  error: { message?: string } | null
}

interface TransactionTableMutations {
  insert: (values: TablesInsert<'transacciones'>) => Promise<MutationResult>
}

function parseCurrencyInput(value: string): number {
  const normalized = value.replace(/[^\d]/g, '')
  return normalized ? Number(normalized) : 0
}

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export async function registerPayment(
  previousState: PaymentActionState,
  formData: FormData
): Promise<PaymentActionState> {
  const eventoId = String(formData.get('eventoId') ?? '').trim()
  const amount = parseCurrencyInput(String(formData.get('monto') ?? ''))
  const description = String(formData.get('descripcion') ?? '').trim()
  const receiptNumber = String(formData.get('numeroBoleta') ?? '').trim()
  const receiptUrl = String(formData.get('urlComprobante') ?? '').trim()

  if (!eventoId) {
    return {
      ...previousState,
      status: 'error',
      message: 'No encontramos el evento activo para registrar este pago.',
    }
  }

  if (!amount || amount <= 0) {
    return {
      ...previousState,
      status: 'error',
      message: 'Ingresa un monto valido antes de enviar el pago.',
    }
  }

  if (receiptUrl && !isValidHttpUrl(receiptUrl)) {
    return {
      ...previousState,
      status: 'error',
      message: 'El enlace del comprobante debe comenzar con http:// o https://.',
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
    .select('id, curso_id, nombre_completo')
    .eq('id', user.id)
    .maybeSingle()
  const perfil = perfilData as PerfilContext | null

  if (!perfil) {
    return {
      ...previousState,
      status: 'error',
      message:
        user.email?.toLowerCase() === ROOT_DEV_EMAIL
          ? 'El usuario root de desarrollo puede navegar, pero no registrar pagos sin un perfil real.'
          : 'Tu perfil aun no esta listo para registrar pagos.',
    }
  }

  const { data: eventoData } = await supabase
    .from('eventos')
    .select('id, curso_id, nombre, estado')
    .eq('id', eventoId)
    .maybeSingle()
  const evento = eventoData as EventoContext | null

  if (!evento || evento.curso_id !== perfil.curso_id || evento.estado !== 'activo') {
    return {
      ...previousState,
      status: 'error',
      message: 'El evento activo ya no esta disponible para registrar pagos.',
    }
  }

  const payload: TablesInsert<'transacciones'> = {
    curso_id: perfil.curso_id,
    descripcion: description || `Pago reportado - ${evento.nombre}`,
    estado: 'pendiente_validacion',
    evento_id: evento.id,
    monto: amount,
    numero_boleta: receiptNumber || null,
    registrado_por: perfil.id,
    tipo: 'cuota_ingreso',
    url_comprobante: receiptUrl || null,
  }

  const transactionsTable = supabase.from('transacciones') as unknown as TransactionTableMutations
  const { error } = await transactionsTable.insert(payload)

  if (error) {
    return {
      ...previousState,
      status: 'error',
      message: 'No pudimos registrar el pago en este momento.',
    }
  }

  revalidatePath('/')
  revalidatePath('/pagar')
  revalidatePath('/boletas')

  return {
    status: 'success',
    message: 'Pago enviado. Quedo registrado para su validacion.',
  }
}
