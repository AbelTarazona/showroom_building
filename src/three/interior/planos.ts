/**
 * Planos procedurales por tipología (fase 5).
 *
 * Convención local: el departamento es un cuadrado de 7.5 × 7.5 m centrado en el origen
 * (x, z ∈ [-3.75, 3.75]).  El eje local **+Z es siempre la fachada principal** (la mejor vista)
 * y **-Z es la cara del ingreso** (hacia el núcleo de circulación).  En las esquinas, la segunda
 * fachada canónica es **+X**; si en el mundo cae al otro lado, el plano se espeja en X.
 *
 * El grupo 3D se rota luego `theta` sobre Y y se traslada a (u.x, piso, u.z), de modo que el
 * interior queda en su posición real del mundo y por las ventanas se ve el entorno verdadero.
 */
import type { Unidad } from '../../lib/types'

export const MITAD = 3.75
export const ALTO_PARED = 2.55
export const GROSOR = 0.12
export const ALTO_PUERTA = 2.05
export const ANCHO_PUERTA_MAX = 0.95
export const ALFEIZAR = 0.95
export const ALFEIZAR_MAMPARA = 0.12
export const DINTEL_VENTANA = 2.25

export type Lado = '+x' | '-x' | '+z' | '-z'
export type TipoAmbiente = 'sala' | 'dormitorio' | 'cocina' | 'bano' | 'pasillo' | 'servicio'

export interface Ambiente {
  id: string
  nombre: string
  tipo: TipoAmbiente
  x0: number
  x1: number
  z0: number
  z1: number
  /** lados (locales) con ventana, si esa cara resulta exterior en el mundo */
  ventanas?: Lado[]
  /** pared contra la que se apoya el mueble principal */
  apoyo?: Lado
}

export interface Plano {
  ambientes: Ambiente[]
  /** pares de ambientes conectados por puerta (se calcula el vano compartido) */
  puertas: [string, string][]
  /** puerta de ingreso, siempre en la cara -Z */
  ingreso: { ambiente: string; x: number }
}

export interface Caja {
  p: [number, number, number]
  s: [number, number, number]
  c: string
  ry?: number
}

/** segmento de pared alineado a ejes: `eje` es la coordenada constante */
export interface Seg {
  eje: 'x' | 'z'
  c: number
  a: number
  b: number
}

export interface Vano extends Seg {
  tipo: 'puerta' | 'ventana'
  y0: number
  y1: number
}

export const COLOR_PISO: Record<TipoAmbiente, string> = {
  sala: '#c39a67',
  dormitorio: '#b5895f',
  cocina: '#e0dbd3',
  bano: '#ccd6da',
  pasillo: '#d8d1c6',
  servicio: '#d3ccc2',
}

export const COLOR_PARED = '#f4f0e9'
export const COLOR_TECHO = '#fbfaf7'
export const COLOR_ZOCALO = '#e6dfd3'
export const COLOR_MARCO = '#9d7550'

const flip = (l: Lado): Lado => (l === '+x' ? '-x' : l === '-x' ? '+x' : l)

/* ------------------------------------------------------------------ planos */

/** A · 2 dormitorios · esquina (fachadas +Z principal y +X secundaria) */
const PLANO_A: Plano = {
  ambientes: [
    { id: 'sala', nombre: 'Sala-comedor', tipo: 'sala', x0: -0.3, x1: 3.75, z0: 0.5, z1: 3.75, ventanas: ['+z', '+x'], apoyo: '+z' },
    { id: 'dorm1', nombre: 'Dormitorio principal', tipo: 'dormitorio', x0: -3.75, x1: -0.3, z0: 0.5, z1: 3.75, ventanas: ['+z'], apoyo: '-x' },
    { id: 'dorm2', nombre: 'Dormitorio 2', tipo: 'dormitorio', x0: 0.9, x1: 3.75, z0: -3.75, z1: 0.5, ventanas: ['+x'], apoyo: '-z' },
    { id: 'pasillo', nombre: 'Hall', tipo: 'pasillo', x0: -1.3, x1: 0.9, z0: -3.75, z1: 0.5 },
    { id: 'cocina', nombre: 'Cocina', tipo: 'cocina', x0: -3.75, x1: -1.3, z0: -3.75, z1: -1.2, apoyo: '-x' },
    { id: 'bano', nombre: 'Baño', tipo: 'bano', x0: -3.75, x1: -1.3, z0: -1.2, z1: 0.5, apoyo: '-x' },
  ],
  puertas: [
    ['sala', 'pasillo'],
    ['dorm1', 'pasillo'],
    ['dorm2', 'pasillo'],
    ['cocina', 'pasillo'],
    ['bano', 'pasillo'],
  ],
  ingreso: { ambiente: 'pasillo', x: -0.2 },
}

/** B · 3 dormitorios · una sola fachada (+Z) */
const PLANO_B: Plano = {
  ambientes: [
    { id: 'sala', nombre: 'Sala-comedor', tipo: 'sala', x0: -3.75, x1: 0.1, z0: 0.5, z1: 3.75, ventanas: ['+z'], apoyo: '+z' },
    { id: 'dorm1', nombre: 'Dormitorio principal', tipo: 'dormitorio', x0: 0.1, x1: 3.75, z0: 0.5, z1: 3.75, ventanas: ['+z'], apoyo: '+x' },
    { id: 'pasillo', nombre: 'Hall', tipo: 'pasillo', x0: -0.8, x1: 1.2, z0: -3.75, z1: 0.5 },
    { id: 'cocina', nombre: 'Cocina', tipo: 'cocina', x0: -3.75, x1: -0.8, z0: -1.4, z1: 0.5, apoyo: '-x' },
    { id: 'bano1', nombre: 'Baño 1', tipo: 'bano', x0: -2.3, x1: -0.8, z0: -3.75, z1: -1.4, apoyo: '-z' },
    { id: 'bano2', nombre: 'Baño 2 · servicio', tipo: 'bano', x0: -3.75, x1: -2.3, z0: -3.75, z1: -1.4, apoyo: '-z' },
    { id: 'dorm2', nombre: 'Dormitorio 2', tipo: 'dormitorio', x0: 1.2, x1: 3.75, z0: -1.8, z1: 0.5, apoyo: '+x' },
    { id: 'dorm3', nombre: 'Dormitorio 3', tipo: 'dormitorio', x0: 1.2, x1: 3.75, z0: -3.75, z1: -1.8, apoyo: '+x' },
  ],
  puertas: [
    ['sala', 'pasillo'],
    ['dorm1', 'pasillo'],
    ['cocina', 'pasillo'],
    ['bano1', 'pasillo'],
    ['bano2', 'cocina'],
    ['dorm2', 'pasillo'],
    ['dorm3', 'pasillo'],
  ],
  ingreso: { ambiente: 'pasillo', x: 0.2 },
}

/** C · 1 dormitorio · una sola fachada (+Z) */
const PLANO_C: Plano = {
  ambientes: [
    { id: 'sala', nombre: 'Sala-comedor', tipo: 'sala', x0: -0.4, x1: 3.75, z0: 0.4, z1: 3.75, ventanas: ['+z'], apoyo: '+z' },
    { id: 'dorm1', nombre: 'Dormitorio', tipo: 'dormitorio', x0: -3.75, x1: -0.4, z0: 0.4, z1: 3.75, ventanas: ['+z'], apoyo: '-x' },
    { id: 'cocina', nombre: 'Cocina', tipo: 'cocina', x0: 0.8, x1: 3.75, z0: -3.75, z1: 0.4, apoyo: '+x' },
    { id: 'bano', nombre: 'Baño', tipo: 'bano', x0: -3.75, x1: -1.5, z0: -1.7, z1: 0.4, apoyo: '-x' },
    { id: 'pasillo', nombre: 'Hall', tipo: 'pasillo', x0: -1.5, x1: 0.8, z0: -3.75, z1: 0.4 },
    { id: 'lavanderia', nombre: 'Lavandería', tipo: 'servicio', x0: -3.75, x1: -1.5, z0: -3.75, z1: -1.7, apoyo: '-z' },
  ],
  puertas: [
    ['sala', 'pasillo'],
    ['sala', 'cocina'],
    ['sala', 'dorm1'],
    ['bano', 'pasillo'],
    ['cocina', 'pasillo'],
    ['lavanderia', 'pasillo'],
  ],
  ingreso: { ambiente: 'pasillo', x: -0.35 },
}

const PLANOS: Record<string, Plano> = { A: PLANO_A, B: PLANO_B, C: PLANO_C }

/* ------------------------------------------------------- ubicación en mundo */

const LADO_DE_ORIENTACION: Record<string, Lado> = { norte: '+z', sur: '-z', este: '+x', oeste: '-x' }
const THETA_DE_LADO: Record<Lado, number> = { '+z': 0, '-z': Math.PI, '+x': Math.PI / 2, '-x': -Math.PI / 2 }
const VECTOR_DE_LADO: Record<Lado, [number, number]> = { '+x': [1, 0], '-x': [-1, 0], '+z': [0, 1], '-z': [0, -1] }

/** caras exteriores de la unidad en coordenadas del mundo */
export function ladosExterioresMundo(u: Unidad, slot: number): Lado[] {
  const l: Lado[] = []
  if (u.x >= slot) l.push('+x')
  if (u.x <= -slot) l.push('-x')
  if (u.z >= slot) l.push('+z')
  if (u.z <= -slot) l.push('-z')
  return l.length ? l : ['+z']
}

function ladoAMundoLocal(lado: Lado, theta: number): Lado {
  const [wx, wz] = VECTOR_DE_LADO[lado]
  const cos = Math.cos(theta), sin = Math.sin(theta)
  const lx = wx * cos - wz * sin
  const lz = wx * sin + wz * cos
  if (Math.abs(lx) > Math.abs(lz)) return lx > 0 ? '+x' : '-x'
  return lz > 0 ? '+z' : '-z'
}

function espejar(p: Plano): Plano {
  return {
    ambientes: p.ambientes.map(a => ({
      ...a,
      x0: -a.x1,
      x1: -a.x0,
      ventanas: a.ventanas?.map(flip),
      apoyo: a.apoyo ? flip(a.apoyo) : undefined,
    })),
    puertas: p.puertas,
    ingreso: { ...p.ingreso, x: -p.ingreso.x },
  }
}

export interface PlanoUbicado {
  plano: Plano
  /** rotación del grupo sobre Y para llevar el local +Z a la fachada principal */
  theta: number
  /** origen del grupo en el mundo (y = piso terminado) */
  origen: [number, number, number]
  /** lados locales que son fachada exterior real */
  exteriores: Lado[]
  /** factor para pasar de m² del plano a los m² comerciales de la tipología */
  escalaArea: number
}

export function planoDeUnidad(u: Unidad, slot: number, areaTipologia: number): PlanoUbicado {
  const principal = LADO_DE_ORIENTACION[u.orientacion] ?? '+z'
  const theta = THETA_DE_LADO[principal]
  const mundo = ladosExterioresMundo(u, slot)
  const locales = mundo.map(l => ladoAMundoLocal(l, theta))
  const espejo = locales.includes('-x')
  const base = PLANOS[u.tipologia_id] ?? PLANO_A
  const plano = espejo ? espejar(base) : base
  // el espejo mueve los ambientes dentro del mismo marco local: las caras exteriores no cambian
  const exteriores = locales
  return {
    plano,
    theta,
    origen: [u.x, u.y + 0.14, u.z],
    exteriores,
    escalaArea: areaTipologia / (MITAD * 2) ** 2,
  }
}

/* ----------------------------------------------------- geometría de muros */

const clave = (eje: 'x' | 'z', c: number) => `${eje}:${c.toFixed(2)}`

function unir(intervalos: [number, number][]): [number, number][] {
  const ord = [...intervalos].sort((p, q) => p[0] - q[0])
  const out: [number, number][] = []
  for (const iv of ord) {
    const last = out[out.length - 1]
    if (last && iv[0] <= last[1] + 1e-4) last[1] = Math.max(last[1], iv[1])
    else out.push([iv[0], iv[1]])
  }
  return out
}

/** vano compartido entre dos ambientes contiguos, o null si no se tocan */
export function vanoEntre(a: Ambiente, b: Ambiente): Seg | null {
  const eps = 1e-3
  const solapaZ = [Math.max(a.z0, b.z0), Math.min(a.z1, b.z1)] as [number, number]
  const solapaX = [Math.max(a.x0, b.x0), Math.min(a.x1, b.x1)] as [number, number]
  if (solapaZ[1] - solapaZ[0] > 0.35) {
    if (Math.abs(a.x1 - b.x0) < eps) return { eje: 'x', c: a.x1, a: solapaZ[0], b: solapaZ[1] }
    if (Math.abs(a.x0 - b.x1) < eps) return { eje: 'x', c: a.x0, a: solapaZ[0], b: solapaZ[1] }
  }
  if (solapaX[1] - solapaX[0] > 0.35) {
    if (Math.abs(a.z1 - b.z0) < eps) return { eje: 'z', c: a.z1, a: solapaX[0], b: solapaX[1] }
    if (Math.abs(a.z0 - b.z1) < eps) return { eje: 'z', c: a.z0, a: solapaX[0], b: solapaX[1] }
  }
  return null
}

export interface GeometriaInterior {
  muros: Caja[]
  /** segmentos sólidos a la altura de los ojos (para colisión y para el mini-plano) */
  colisiones: Seg[]
  ventanas: Vano[]
  puertas: { seg: Seg; a: string; b: string; centro: [number, number] }[]
  ingreso: { seg: Seg; centro: [number, number] }
}

export function construirMuros(pu: PlanoUbicado): GeometriaInterior {
  const { plano, exteriores } = pu
  const ext = new Set(exteriores)
  const porId = new Map(plano.ambientes.map(a => [a.id, a]))

  // 1. aristas de todos los ambientes → segmentos fusionados
  const grupos = new Map<string, { eje: 'x' | 'z'; c: number; iv: [number, number][] }>()
  const agrega = (eje: 'x' | 'z', c: number, a: number, b: number) => {
    const k = clave(eje, c)
    if (!grupos.has(k)) grupos.set(k, { eje, c: Number(c.toFixed(2)), iv: [] })
    grupos.get(k)!.iv.push([a, b])
  }
  for (const a of plano.ambientes) {
    agrega('x', a.x0, a.z0, a.z1)
    agrega('x', a.x1, a.z0, a.z1)
    agrega('z', a.z0, a.x0, a.x1)
    agrega('z', a.z1, a.x0, a.x1)
  }

  // 2. vanos: puertas interiores, ingreso y ventanas
  const puertas: GeometriaInterior['puertas'] = []
  const vanos: Vano[] = []
  for (const [ida, idb] of plano.puertas) {
    const A = porId.get(ida), B = porId.get(idb)
    if (!A || !B) continue
    const v = vanoEntre(A, B)
    if (!v) continue
    const ancho = Math.min(ANCHO_PUERTA_MAX, v.b - v.a - 0.12)
    const m = (v.a + v.b) / 2
    const seg: Seg = { eje: v.eje, c: v.c, a: m - ancho / 2, b: m + ancho / 2 }
    vanos.push({ ...seg, tipo: 'puerta', y0: 0, y1: ALTO_PUERTA })
    puertas.push({ seg, a: ida, b: idb, centro: v.eje === 'x' ? [v.c, m] : [m, v.c] })
  }

  // ingreso en la cara -Z
  const anchoIng = 0.95
  const segIng: Seg = { eje: 'z', c: -MITAD, a: plano.ingreso.x - anchoIng / 2, b: plano.ingreso.x + anchoIng / 2 }
  vanos.push({ ...segIng, tipo: 'puerta', y0: 0, y1: ALTO_PUERTA })
  const ingreso = { seg: segIng, centro: [plano.ingreso.x, -MITAD] as [number, number] }

  const ventanas: Vano[] = []
  for (const a of plano.ambientes) {
    for (const lado of a.ventanas ?? []) {
      if (!ext.has(lado)) continue
      const horizontal = lado === '+z' || lado === '-z'
      const eje: 'x' | 'z' = horizontal ? 'z' : 'x'
      const c = lado === '+z' ? a.z1 : lado === '-z' ? a.z0 : lado === '+x' ? a.x1 : a.x0
      const [p0, p1] = horizontal ? [a.x0, a.x1] : [a.z0, a.z1]
      const largo = p1 - p0
      const ancho = a.tipo === 'sala' ? Math.min(3.2, Math.max(1.4, largo - 0.7)) : Math.min(2.4, Math.max(1.1, largo - 1.0))
      const m = (p0 + p1) / 2
      // la sala lleva mampara de piso a techo: desde el piso 9 así sí se ve el parque, no sólo cielo
      const y0 = a.tipo === 'sala' ? ALFEIZAR_MAMPARA : ALFEIZAR
      const v: Vano = { eje, c: Number(c.toFixed(2)), a: m - ancho / 2, b: m + ancho / 2, tipo: 'ventana', y0, y1: DINTEL_VENTANA }
      ventanas.push(v)
      vanos.push(v)
    }
  }

  // 3. emitir cajas de muro restando los vanos
  const muros: Caja[] = []
  const colisiones: Seg[] = []
  const caja = (eje: 'x' | 'z', c: number, a: number, b: number, y0: number, y1: number, color: string) => {
    const largo = b - a
    if (largo < 0.02 || y1 - y0 < 0.02) return
    const m = (a + b) / 2
    const p: [number, number, number] = eje === 'x' ? [c, (y0 + y1) / 2, m] : [m, (y0 + y1) / 2, c]
    const s: [number, number, number] = eje === 'x' ? [GROSOR, y1 - y0, largo] : [largo, y1 - y0, GROSOR]
    muros.push({ p, s, c: color })
  }

  for (const g of grupos.values()) {
    const tramos = unir(g.iv)
    const propios = vanos
      .filter(v => v.eje === g.eje && Math.abs(v.c - g.c) < 1e-2)
      .sort((p, q) => p.a - q.a)
    for (const [t0, t1] of tramos) {
      let cursor = t0
      for (const v of propios) {
        const a = Math.max(v.a, t0), b = Math.min(v.b, t1)
        if (b - a < 0.02) continue
        caja(g.eje, g.c, cursor, a, 0, ALTO_PARED, COLOR_PARED)
        if (cursor < a - 0.02) colisiones.push({ eje: g.eje, c: g.c, a: cursor, b: a })
        // antepecho y dintel del vano
        if (v.y0 > 0.02) caja(g.eje, g.c, a, b, 0, v.y0, COLOR_PARED)
        if (v.y1 < ALTO_PARED - 0.02) caja(g.eje, g.c, a, b, v.y1, ALTO_PARED, COLOR_PARED)
        // la ventana sigue bloqueando el paso; la puerta no
        if (v.tipo === 'ventana') colisiones.push({ eje: g.eje, c: g.c, a, b })
        cursor = b
      }
      caja(g.eje, g.c, cursor, t1, 0, ALTO_PARED, COLOR_PARED)
      if (cursor < t1 - 0.02) colisiones.push({ eje: g.eje, c: g.c, a: cursor, b: t1 })
    }
  }

  // marcos de puerta
  for (const v of vanos.filter(v => v.tipo === 'puerta')) {
    for (const p of [v.a, v.b]) {
      const pos: [number, number, number] = v.eje === 'x' ? [v.c, ALTO_PUERTA / 2, p] : [p, ALTO_PUERTA / 2, v.c]
      const s: [number, number, number] = v.eje === 'x' ? [GROSOR + 0.03, ALTO_PUERTA, 0.06] : [0.06, ALTO_PUERTA, GROSOR + 0.03]
      muros.push({ p: pos, s, c: COLOR_MARCO })
    }
    const m = (v.a + v.b) / 2
    const pos: [number, number, number] = v.eje === 'x' ? [v.c, ALTO_PUERTA, m] : [m, ALTO_PUERTA, v.c]
    const s: [number, number, number] = v.eje === 'x' ? [GROSOR + 0.03, 0.06, v.b - v.a] : [v.b - v.a, 0.06, GROSOR + 0.03]
    muros.push({ p: pos, s, c: COLOR_MARCO })
  }

  // marcos de ventana (alféizar y jambas)
  for (const v of ventanas) {
    const m = (v.a + v.b) / 2
    const largo = v.b - v.a
    const posA: [number, number, number] = v.eje === 'x' ? [v.c, v.y0, m] : [m, v.y0, v.c]
    muros.push({ p: posA, s: v.eje === 'x' ? [GROSOR + 0.12, 0.06, largo + 0.1] : [largo + 0.1, 0.06, GROSOR + 0.12], c: '#e8e2d7' })
    for (const j of [v.a, v.b]) {
      const pos: [number, number, number] = v.eje === 'x' ? [v.c, (v.y0 + v.y1) / 2, j] : [j, (v.y0 + v.y1) / 2, v.c]
      muros.push({ p: pos, s: v.eje === 'x' ? [GROSOR + 0.04, v.y1 - v.y0, 0.07] : [0.07, v.y1 - v.y0, GROSOR + 0.04], c: '#cfc9bd' })
    }
    // parteluz central
    const pos: [number, number, number] = v.eje === 'x' ? [v.c, (v.y0 + v.y1) / 2, m] : [m, (v.y0 + v.y1) / 2, v.c]
    muros.push({ p: pos, s: v.eje === 'x' ? [GROSOR + 0.02, v.y1 - v.y0, 0.05] : [0.05, v.y1 - v.y0, GROSOR + 0.02], c: '#cfc9bd' })
  }

  return { muros, colisiones, ventanas, puertas, ingreso }
}

/* --------------------------------------------------------------- utilidades */

export const areaDe = (a: Ambiente) => (a.x1 - a.x0) * (a.z1 - a.z0)
export const centroDe = (a: Ambiente): [number, number] => [(a.x0 + a.x1) / 2, (a.z0 + a.z1) / 2]

export function ambienteEn(plano: Plano, x: number, z: number): Ambiente | null {
  for (const a of plano.ambientes) if (x >= a.x0 && x <= a.x1 && z >= a.z0 && z <= a.z1) return a
  return null
}

/** ruta de ambientes entre dos puntos, pasando por los centros de las puertas */
export function ruta(
  plano: Plano,
  puertas: GeometriaInterior['puertas'],
  desde: [number, number],
  hasta: [number, number],
): [number, number][] {
  const a0 = ambienteEn(plano, desde[0], desde[1])
  const a1 = ambienteEn(plano, hasta[0], hasta[1])
  if (!a0 || !a1) return []
  if (a0.id === a1.id) return [hasta]
  const vecinos = new Map<string, { id: string; centro: [number, number] }[]>()
  for (const p of puertas) {
    if (!vecinos.has(p.a)) vecinos.set(p.a, [])
    if (!vecinos.has(p.b)) vecinos.set(p.b, [])
    vecinos.get(p.a)!.push({ id: p.b, centro: p.centro })
    vecinos.get(p.b)!.push({ id: p.a, centro: p.centro })
  }
  const previo = new Map<string, { id: string; centro: [number, number] }>()
  const cola = [a0.id]
  const visto = new Set([a0.id])
  while (cola.length) {
    const cur = cola.shift()!
    if (cur === a1.id) break
    for (const v of vecinos.get(cur) ?? []) {
      if (visto.has(v.id)) continue
      visto.add(v.id)
      previo.set(v.id, { id: cur, centro: v.centro })
      cola.push(v.id)
    }
  }
  if (!visto.has(a1.id)) return []
  const pasos: [number, number][] = []
  let cur = a1.id
  while (cur !== a0.id) {
    const p = previo.get(cur)!
    pasos.unshift(p.centro)
    cur = p.id
  }
  pasos.push(hasta)
  return pasos
}
