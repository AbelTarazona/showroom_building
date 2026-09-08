import { VISTA_LABEL, type Unidad, type Vista } from '../../lib/types'

export interface TopUnidad {
  id: string
  valor: number
}

/** Top N unidades por métrica (solo con valor > 0). */
export function topUnidades(porUnidad: Record<string, number>, n = 5): TopUnidad[] {
  return Object.entries(porUnidad)
    .filter(([, valor]) => valor > 0)
    .map(([id, valor]) => ({ id, valor }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, n)
}

export interface Barra {
  clave: string
  etiqueta: string
  valor: number
  pct: number
}

/** % de interés por piso (1..totalPisos), incluyendo pisos en 0 para que la barra tenga contexto. */
export function porPiso(porUnidad: Record<string, number>, unidades: Record<string, Unidad>, totalPisos: number): Barra[] {
  const suma = new Map<number, number>()
  let total = 0
  for (const [id, valor] of Object.entries(porUnidad)) {
    const u = unidades[id]
    if (!u) continue
    suma.set(u.piso, (suma.get(u.piso) ?? 0) + valor)
    total += valor
  }
  const filas: Barra[] = []
  for (let piso = 1; piso <= totalPisos; piso++) {
    const valor = suma.get(piso) ?? 0
    filas.push({ clave: String(piso), etiqueta: `P${piso}`, valor, pct: total ? (valor / total) * 100 : 0 })
  }
  return filas
}

/** % de interés por vista (parque/avenida/ciudad/cerros), de mayor a menor. */
export function porVista(porUnidad: Record<string, number>, unidades: Record<string, Unidad>): Barra[] {
  const suma = new Map<Vista, number>()
  let total = 0
  for (const [id, valor] of Object.entries(porUnidad)) {
    const u = unidades[id]
    if (!u) continue
    suma.set(u.vista, (suma.get(u.vista) ?? 0) + valor)
    total += valor
  }
  return [...suma.entries()]
    .map(([vista, valor]) => ({ clave: vista, etiqueta: VISTA_LABEL[vista], valor, pct: total ? (valor / total) * 100 : 0 }))
    .sort((a, b) => b.valor - a.valor)
}

export interface RangoPisos {
  inicio: number
  fin: number
  valor: number
}

/** Ventana contigua de `ancho` pisos con más interés (barrido simple sobre 1..totalPisos). */
export function mejorRangoPisos(filasPorPiso: Barra[], ancho = 4): RangoPisos | null {
  if (filasPorPiso.length === 0) return null
  const valores = new Map(filasPorPiso.map(f => [Number(f.clave), f.valor]))
  const pisos = [...valores.keys()].sort((a, b) => a - b)
  const min = pisos[0]
  const max = pisos[pisos.length - 1]
  let mejor: RangoPisos = { inicio: min, fin: Math.min(min + ancho - 1, max), valor: -1 }
  for (let inicio = min; inicio <= max; inicio++) {
    let suma = 0
    for (let p = inicio; p < inicio + ancho; p++) suma += valores.get(p) ?? 0
    if (suma > mejor.valor) mejor = { inicio, fin: Math.min(inicio + ancho - 1, max), valor: suma }
  }
  return mejor
}

/** Frase automática: "Los pisos 6-9 con vista al parque concentran el 42% de las vistas." */
export function resumenAutomatico(
  porUnidad: Record<string, number>,
  unidades: Record<string, Unidad>,
  totalPisos: number,
  fraseMetrica: string,
): string | null {
  const total = Object.values(porUnidad).reduce((a, b) => a + b, 0)
  if (total <= 0) return null

  const filas = porPiso(porUnidad, unidades, totalPisos)
  const rango = mejorRangoPisos(filas)
  if (!rango || rango.valor <= 0) return null

  const porVistaEnRango = new Map<Vista, number>()
  for (const [id, valor] of Object.entries(porUnidad)) {
    const u = unidades[id]
    if (!u || u.piso < rango.inicio || u.piso > rango.fin) continue
    porVistaEnRango.set(u.vista, (porVistaEnRango.get(u.vista) ?? 0) + valor)
  }
  let vistaTop: Vista | null = null
  let vistaValor = -1
  for (const [vista, valor] of porVistaEnRango) {
    if (valor > vistaValor) { vistaTop = vista; vistaValor = valor }
  }

  const pct = Math.round((rango.valor / total) * 100)
  const etiquetaVista = vistaTop ? VISTA_LABEL[vistaTop].toLowerCase() : null
  const rangoTxt = rango.inicio === rango.fin ? `El piso ${rango.inicio}` : `Los pisos ${rango.inicio}–${rango.fin}`
  return `${rangoTxt}${etiquetaVista ? ` con ${etiquetaVista}` : ''} concentran el ${pct}% de ${fraseMetrica}.`
}
