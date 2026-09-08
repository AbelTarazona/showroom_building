import { create } from 'zustand'
import edificioJson from './data/edificio.json'
import type { Edificio, Estado, Unidad } from './lib/types'
import { supabase, supabaseDisponible } from './lib/supabase'
import { track } from './lib/tracking'
import { guardarFavoritoRemoto } from './lib/favoritos'

const base = edificioJson as unknown as Edificio

export type ModoColor = 'estado' | 'tipologia' | 'precio'
export type ModoVista = 'edificio' | 'interior' | 'ventana'

export interface Filtros {
  dormitorios: number | null
  soloDisponibles: boolean
  precioMax: number | null
}

interface State {
  edificio: Edificio
  unidades: Record<string, Unidad>
  /** ids de unidades cuya carga desde Supabase ya sincronizó estado */
  sincronizado: boolean
  seleccion: string | null
  pisoSeleccionado: number | null
  hover: string | null
  modoColor: ModoColor
  modoVista: ModoVista
  filtros: Filtros
  favoritos: Set<string>
  comparar: string[]

  seleccionar: (id: string | null, origen?: 'click' | 'lista' | 'url') => void
  seleccionarPiso: (piso: number | null) => void
  setHover: (id: string | null) => void
  setModoColor: (m: ModoColor) => void
  setModoVista: (m: ModoVista) => void
  setFiltros: (f: Partial<Filtros>) => void
  toggleFavorito: (id: string) => void
  toggleComparar: (id: string) => void
  /** Fusiona una fila de `unidades` recibida por Realtime (estado, precio, lead de separación). */
  aplicarFila: (fila: { id: string; estado?: Estado; precio?: number | string | null; lead_separacion_id?: string | null }) => void
  cargarUnidades: () => Promise<void>
}

function leerFavs(): Set<string> {
  try {
    const raw = localStorage.getItem('showroom.favs')
    const arr: unknown = raw ? JSON.parse(raw) : []
    return new Set<string>(Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : [])
  } catch {
    return new Set<string>()
  }
}
const favsIniciales = leerFavs()

export const useStore = create<State>((set, get) => ({
  edificio: base,
  unidades: Object.fromEntries(base.unidades.map(u => [u.id, u])),
  sincronizado: false,
  seleccion: null,
  pisoSeleccionado: null,
  hover: null,
  modoColor: 'estado',
  modoVista: 'edificio',
  filtros: { dormitorios: null, soloDisponibles: false, precioMax: null },
  favoritos: favsIniciales,
  comparar: [],

  seleccionar: (id, origen = 'click') => {
    const u = id ? get().unidades[id] : null
    set({ seleccion: id, pisoSeleccionado: u ? u.piso : get().pisoSeleccionado, modoVista: 'edificio' })
    if (u) track('ver_unidad', u.id, { origen, piso: u.piso, precio: u.precio })
  },
  seleccionarPiso: (piso) => {
    set({ pisoSeleccionado: piso, seleccion: null, modoVista: 'edificio' })
    if (piso) track('ver_piso', null, { piso })
  },
  setHover: (id) => set({ hover: id }),
  setModoColor: (modoColor) => set({ modoColor }),
  setModoVista: (modoVista) => {
    set({ modoVista })
    const sel = get().seleccion
    if (modoVista === 'interior') track('ver_interior', sel)
    if (modoVista === 'ventana') track('ver_vista', sel)
  },
  setFiltros: (f) => set({ filtros: { ...get().filtros, ...f } }),
  toggleFavorito: (id) => {
    const favs = new Set(get().favoritos)
    const activo = !favs.has(id)
    activo ? favs.add(id) : favs.delete(id)
    try { localStorage.setItem('showroom.favs', JSON.stringify([...favs])) } catch { /* almacenamiento bloqueado */ }
    set({ favoritos: favs })
    if (activo) track('favorito', id)
    void guardarFavoritoRemoto(id, activo)
  },
  toggleComparar: (id) => {
    const c = get().comparar.includes(id) ? get().comparar.filter(x => x !== id) : [...get().comparar, id].slice(-3)
    set({ comparar: c })
    if (c.length >= 2) track('comparar', id, { ids: c })
  },
  aplicarFila: (fila) => {
    const u = get().unidades[fila.id]
    if (!u) return
    const nueva: Unidad = {
      ...u,
      estado: fila.estado ?? u.estado,
      precio: fila.precio != null ? Number(fila.precio) : u.precio,
      lead_separacion_id: fila.lead_separacion_id === undefined ? u.lead_separacion_id : fila.lead_separacion_id,
    }
    if (nueva.estado === u.estado && nueva.precio === u.precio && nueva.lead_separacion_id === u.lead_separacion_id) return
    set({ unidades: { ...get().unidades, [fila.id]: nueva } })
  },
  cargarUnidades: async () => {
    if (!supabaseDisponible) return
    const { data, error } = await supabase.from('unidades').select('id,estado,precio,lead_separacion_id')
    if (error || !data) { console.warn('[unidades]', error?.message); return }
    const unidades = { ...get().unidades }
    for (const row of data) {
      if (unidades[row.id]) unidades[row.id] = { ...unidades[row.id], estado: row.estado, precio: Number(row.precio), lead_separacion_id: row.lead_separacion_id }
    }
    set({ unidades, sincronizado: true })
  },
}))

/** Suscripción Realtime: cambios de estado de unidades se reflejan en todos los visores abiertos. */
export function suscribirUnidades() {
  if (!supabaseDisponible) return () => {}
  // Topic único por suscripción: StrictMode y varias pantallas no se pisan el canal.
  const canal = supabase
    .channel(`unidades-${crypto.randomUUID().slice(0, 8)}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'unidades' }, (payload) => {
      const row = payload.new as { id: string; estado: Estado; precio: number | string | null; lead_separacion_id: string | null }
      useStore.getState().aplicarFila(row)
    })
    .subscribe(estado => {
      if (estado === 'CHANNEL_ERROR' || estado === 'TIMED_OUT') console.warn('[realtime] unidades:', estado)
    })
  return () => { void supabase.removeChannel(canal) }
}

/** Selectores útiles */
export const selTipologia = (s: State, id: string) => s.edificio.tipologias.find(t => t.id === id)!
export function pasaFiltros(u: Unidad, f: Filtros, dormitoriosDe: (tid: string) => number) {
  if (f.soloDisponibles && u.estado !== 'disponible') return false
  if (f.dormitorios && dormitoriosDe(u.tipologia_id) !== f.dormitorios) return false
  if (f.precioMax && u.precio > f.precioMax) return false
  return true
}
