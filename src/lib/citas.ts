import { supabase, supabaseDisponible } from './supabase'
import { track } from './tracking'
import { recalcularScore } from './leads'
import type { Cita } from './types'

export interface DatosCita {
  lead_id: string
  unidad_id: string | null
  tipo: 'visita' | 'llamada' | 'videollamada'
  fecha: string
  notas?: string | null
}

/** Crea una cita, registra el evento de tracking y recalcula el score del lead. */
export async function crearCita(datos: DatosCita): Promise<Cita> {
  if (!supabaseDisponible) {
    throw new Error('No se pudo agendar: backend no disponible en esta demo.')
  }

  const { data, error } = await supabase
    .from('citas')
    .insert({
      lead_id: datos.lead_id,
      unidad_id: datos.unidad_id,
      tipo: datos.tipo,
      fecha: datos.fecha,
      notas: datos.notas ?? null,
    })
    .select()
    .single()
  if (error) throw error

  track('agendar', datos.unidad_id, { tipo: datos.tipo, fecha: datos.fecha })
  await recalcularScore(datos.lead_id)

  return data as Cita
}
