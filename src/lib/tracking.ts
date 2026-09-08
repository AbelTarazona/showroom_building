import { supabase, supabaseDisponible } from './supabase'
import type { TipoEvento } from './types'

const KEY = 'showroom.sesion'
const KEY_VISITAS = 'showroom.visitas'

// localStorage puede estar bloqueado (incógnito estricto): degradamos a memoria sin romper la app.
const memoria = new Map<string, string>()
function leer(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return memoria.get(key) ?? null }
}
function escribir(key: string, valor: string) {
  memoria.set(key, valor)
  try { localStorage.setItem(key, valor) } catch { /* sin persistencia */ }
}

/** Sesión anónima persistente en el dispositivo. Detecta revisitas. */
export function getSesionId(): string {
  let id = leer(KEY)
  if (!id) {
    id = crypto.randomUUID()
    escribir(KEY, id)
  }
  return id
}

export function getLeadId(): string | null {
  return leer('showroom.lead')
}
export function setLeadId(id: string) {
  escribir('showroom.lead', id)
}
export function limpiarLeadId() {
  memoria.delete('showroom.lead')
  try { localStorage.removeItem('showroom.lead') } catch { /* sin persistencia */ }
}

export function esRevisita(): boolean {
  return Number(leer(KEY_VISITAS) || 0) > 1
}

let sesionAsegurada: Promise<void> | null = null
function asegurarSesion() {
  if (!sesionAsegurada) {
    sesionAsegurada = (async () => {
      const id = getSesionId()
      const visitas = Number(leer(KEY_VISITAS) || 0) + 1
      escribir(KEY_VISITAS, String(visitas))
      if (!supabaseDisponible) return
      const device = /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
      await supabase.from('sesiones').upsert({ id, device }, { onConflict: 'id', ignoreDuplicates: true })
    })()
  }
  return sesionAsegurada
}

const cola: { tipo: TipoEvento; unidad_id: string | null; payload: Record<string, unknown> }[] = []
let flushing = false

async function flush() {
  if (flushing || !supabaseDisponible) return
  flushing = true
  try {
    await asegurarSesion()
    while (cola.length) {
      const lote = cola.splice(0, 20).map(e => ({
        ...e,
        sesion_id: getSesionId(),
        lead_id: getLeadId(),
      }))
      let { error } = await supabase.from('eventos').insert(lote)
      // 23503: el lead guardado en este dispositivo ya no existe (p.ej. tras un db:reset). Se olvida y se reintenta.
      if (error?.code === '23503' && getLeadId()) {
        limpiarLeadId()
        ;({ error } = await supabase.from('eventos').insert(lote.map(e => ({ ...e, lead_id: null }))))
      }
      if (error) console.warn('[tracking]', error.message)
    }
  } finally {
    flushing = false
  }
}

/** Registra una interacción del visitante. No bloquea la UI. */
export function track(tipo: TipoEvento, unidad_id: string | null = null, payload: Record<string, unknown> = {}) {
  cola.push({ tipo, unidad_id, payload })
  void flush()
}

/** Lista local de eventos de esta sesión (para el score en cliente). */
export async function eventosDeSesion() {
  if (!supabaseDisponible) return []
  const { data } = await supabase
    .from('eventos')
    .select('*')
    .eq('sesion_id', getSesionId())
    .order('created_at', { ascending: true })
  return data ?? []
}
