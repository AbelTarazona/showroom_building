import type { Tipologia, Unidad } from '../lib/types'

/** Tiempo relativo en español, soporta fechas pasadas ("hace 12 min") y futuras ("en 3 h"). */
export function tiempoRelativo(fechaIso: string): string {
  const ms = Date.now() - new Date(fechaIso).getTime()
  const futuro = ms < 0
  const s = Math.round(Math.abs(ms) / 1000)
  const pre = futuro ? 'en ' : 'hace '

  if (s < 30) return futuro ? 'en instantes' : 'justo ahora'
  if (s < 3600) return `${pre}${Math.round(s / 60)} min`
  if (s < 86400) return `${pre}${Math.round(s / 3600)} h`
  if (s < 2592000) return `${pre}${Math.round(s / 86400)} d`
  if (s < 31536000) {
    const mes = Math.round(s / 2592000)
    return `${pre}${mes} ${mes === 1 ? 'mes' : 'meses'}`
  }
  const anio = Math.round(s / 31536000)
  return `${pre}${anio} ${anio === 1 ? 'año' : 'años'}`
}

export function formatoFecha(fechaIso: string): string {
  return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(fechaIso))
}

export function formatoHora(fechaIso: string): string {
  return new Intl.DateTimeFormat('es-PE', { hour: '2-digit', minute: '2-digit' }).format(new Date(fechaIso))
}

export function formatoFechaHora(fechaIso: string): string {
  return `${formatoFecha(fechaIso)} · ${formatoHora(fechaIso)}`
}

export function esHoy(fechaIso: string): boolean {
  const d = new Date(fechaIso)
  const h = new Date()
  return d.toDateString() === h.toDateString()
}

export function esManana(fechaIso: string): boolean {
  const d = new Date(fechaIso)
  const m = new Date()
  m.setDate(m.getDate() + 1)
  return d.toDateString() === m.toDateString()
}

/** Precio corto para celdas de grilla, ej. "S/ 171k". */
export function precioCorto(n: number): string {
  return `S/ ${Math.round(n / 1000)}k`
}

/** Etiqueta legible de una unidad: "P07-N2 · 3 dorm · piso 7". */
export function unidadLabel(unidad?: Unidad | null, tipologia?: Tipologia | null): string {
  if (!unidad) return '—'
  return `${unidad.id}${tipologia ? ` · ${tipologia.dormitorios} dorm` : ''} · piso ${unidad.piso}`
}
