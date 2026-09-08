import { supabase, supabaseDisponible } from './supabase'
import { track } from './tracking'
import { recalcularScore } from './leads'
import { programarSeguimientos } from './seguimientos'
import { useStore } from '../store'
import type { Unidad } from './types'

/**
 * Marca la unidad como 'separado' a nombre del lead (solo si seguía 'disponible'),
 * actualiza el store local al instante, avanza la etapa del lead y programa
 * el seguimiento de post-separación.
 */
export async function separarUnidad(unidadId: string, leadId: string): Promise<void> {
  if (!supabaseDisponible) {
    throw new Error('No se pudo separar: backend no disponible en esta demo.')
  }

  const { data, error } = await supabase
    .from('unidades')
    .update({ estado: 'separado', lead_separacion_id: leadId })
    .eq('id', unidadId)
    .eq('estado', 'disponible')
    .select()

  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error('Esta unidad ya no está disponible')
  }
  const unidad = data[0] as Unidad

  useStore.getState().aplicarFila({ id: unidadId, estado: 'separado', lead_separacion_id: leadId })

  const { error: errLead } = await supabase
    .from('leads')
    .update({ etapa: 'separado', unidad_interes_id: unidadId })
    .eq('id', leadId)
  if (errLead) console.warn('[separacion]', errLead.message)

  track('separar', unidadId)
  await recalcularScore(leadId)

  const { data: leadRow } = await supabase.from('leads').select('*').eq('id', leadId).maybeSingle()
  if (leadRow) {
    await programarSeguimientos(leadRow, { unidad, motivo: 'separacion' })
  }
}
