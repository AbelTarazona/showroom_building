import { supabase, supabaseDisponible } from '../../lib/supabase'

export type Metrica = 'vistas' | 'favoritos' | 'leads' | 'simulaciones'

export const METRICAS: Metrica[] = ['vistas', 'favoritos', 'leads', 'simulaciones']

export const METRICA_LABEL: Record<Metrica, string> = {
  vistas: 'Vistas',
  favoritos: 'Favoritos',
  leads: 'Leads',
  simulaciones: 'Simulaciones',
}

/** Para armar la frase automática: "concentran el X% de <frase>". */
export const METRICA_FRASE: Record<Metrica, string> = {
  vistas: 'las vistas',
  favoritos: 'los favoritos',
  leads: 'los leads',
  simulaciones: 'las simulaciones',
}

function contarPor(rows: { key: string | null }[]): Record<string, number> {
  const m: Record<string, number> = {}
  for (const row of rows) {
    if (!row.key) continue
    m[row.key] = (m[row.key] ?? 0) + 1
  }
  return m
}

async function contarEventos(tipo: string): Promise<Record<string, number>> {
  const { data, error } = await supabase.from('eventos').select('unidad_id').eq('tipo', tipo).not('unidad_id', 'is', null)
  if (error) { console.warn('[mapa:eventos]', error.message); return {} }
  return contarPor((data ?? []).map(r => ({ key: (r as { unidad_id: string | null }).unidad_id })))
}

async function contarFavoritos(): Promise<Record<string, number>> {
  const [tabla, eventos] = await Promise.all([
    supabase.from('favoritos').select('unidad_id'),
    supabase.from('eventos').select('unidad_id').eq('tipo', 'favorito').not('unidad_id', 'is', null),
  ])
  if (tabla.error) console.warn('[mapa:favoritos]', tabla.error.message)
  if (eventos.error) console.warn('[mapa:favoritos-eventos]', eventos.error.message)
  const m = contarPor((tabla.data ?? []).map(r => ({ key: (r as { unidad_id: string | null }).unidad_id })))
  for (const row of eventos.data ?? []) {
    const id = (row as { unidad_id: string | null }).unidad_id
    if (id) m[id] = (m[id] ?? 0) + 1
  }
  return m
}

async function contarLeads(): Promise<Record<string, number>> {
  const { data, error } = await supabase.from('leads').select('unidad_interes_id').not('unidad_interes_id', 'is', null)
  if (error) { console.warn('[mapa:leads]', error.message); return {} }
  return contarPor((data ?? []).map(r => ({ key: (r as { unidad_interes_id: string | null }).unidad_interes_id })))
}

export async function cargarMetrica(metrica: Metrica): Promise<Record<string, number>> {
  if (!supabaseDisponible) return {}
  if (metrica === 'vistas') return contarEventos('ver_unidad')
  if (metrica === 'favoritos') return contarFavoritos()
  if (metrica === 'leads') return contarLeads()
  return contarEventos('simular_cuota')
}

export type TodasLasMetricas = Record<Metrica, Record<string, number>>

const VACIAS: TodasLasMetricas = { vistas: {}, favoritos: {}, leads: {}, simulaciones: {} }

/** Carga las 4 métricas en paralelo: la seleccionada colorea el edificio, las demás alimentan el tooltip. */
export async function cargarTodasLasMetricas(): Promise<TodasLasMetricas> {
  if (!supabaseDisponible) return VACIAS
  const [vistas, favoritos, leads, simulaciones] = await Promise.all([
    contarEventos('ver_unidad'),
    contarFavoritos(),
    contarLeads(),
    contarEventos('simular_cuota'),
  ])
  return { vistas, favoritos, leads, simulaciones }
}
