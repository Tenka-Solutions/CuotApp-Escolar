import { Rocket } from 'lucide-react'
import { REGLAS } from '@/lib/constants'

interface ModoEnMarchaBannerProps {
  fechaInicio: string
  esFundador: boolean
}

export default function ModoEnMarchaBanner({ fechaInicio, esFundador }: ModoEnMarchaBannerProps) {
  const inicio = new Date(fechaInicio)
  const finModo = new Date(inicio.getTime() + REGLAS.MODO_EN_MARCHA_DIAS * 24 * 60 * 60 * 1000)
  const diasRestantes = Math.max(0, Math.ceil((finModo.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))

  return (
    <div className="flex shrink-0 items-start gap-3 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 mx-3 mt-2 lg:mt-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
        <Rocket className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-violet-800">
          Modo En Marcha — {diasRestantes} día{diasRestantes !== 1 ? 's' : ''} restante{diasRestantes !== 1 ? 's' : ''}
        </p>
        <p className="mt-0.5 text-[11px] text-violet-600">
          {esFundador
            ? 'Como fundador, debes aprobar manualmente las operaciones durante este período.'
            : 'El curso está en período de puesta en marcha. El fundador supervisa las operaciones.'}
        </p>
      </div>
    </div>
  )
}
