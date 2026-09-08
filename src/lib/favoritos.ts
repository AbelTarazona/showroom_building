import { supabase, supabaseDisponible } from './supabase'
import { getSesionId } from './tracking'

/** Asegura la fila de sesión (FK de favoritos) antes de escribir. Idempotente y silenciosa. */
async function asegurarSesion(sesionId: string) {
  const device = /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
  const { error } = await supabase.from('sesiones').upsert({ id: sesionId, device }, { onConflict: 'id', ignoreDuplicates: true })
  if (error) console.warn('[favoritos:sesion]', error.message)
}

/**
 * Persiste (o retira) un favorito en Supabase para la sesión anónima actual. Fire-and-forget:
 * el store ya actualizó el estado local/localStorage antes de llamar a esto.
 */
export async function guardarFavoritoRemoto(unidadId: string, activo: boolean): Promise<void> {
  if (!supabaseDisponible) return
  const sesion_id = getSesionId()
  try {
    await asegurarSesion(sesion_id)
    if (activo) {
      const { error } = await supabase
        .from('favoritos')
        .upsert({ sesion_id, unidad_id: unidadId }, { onConflict: 'sesion_id,unidad_id', ignoreDuplicates: true })
      if (error) console.warn('[favoritos:guardar]', error.message)
    } else {
      const { error } = await supabase.from('favoritos').delete().eq('sesion_id', sesion_id).eq('unidad_id', unidadId)
      if (error) console.warn('[favoritos:quitar]', error.message)
    }
  } catch (e) {
    console.warn('[favoritos]', e)
  }
}
