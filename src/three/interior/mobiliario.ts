/**
 * Mobiliario procedural con primitivas (cajas).  Todo se genera desde el plano, sin assets.
 *
 * Cada mueble se apoya en una pared del ambiente.  `t` es la coordenada absoluta a lo largo de
 * la pared (x para paredes ±Z, z para paredes ±X) y `v` la distancia desde la pared hasta la
 * cara más cercana del mueble.  Los vanos de puerta se respetan: antes de apoyar algo grande se
 * busca el tramo de pared libre más ancho.
 */
import type { Ambiente, Caja, Lado, Plano, Seg } from './planos'

const RY: Record<Lado, number> = { '-z': 0, '+z': Math.PI, '-x': Math.PI / 2, '+x': -Math.PI / 2 }
const opuesto: Record<Lado, Lado> = { '+x': '-x', '-x': '+x', '+z': '-z', '-z': '+z' }
const esZ = (l: Lado) => l === '+z' || l === '-z'
const coordPared = (a: Ambiente, l: Lado) => (l === '+z' ? a.z1 : l === '-z' ? a.z0 : l === '+x' ? a.x1 : a.x0)
const rango = (a: Ambiente, l: Lado): [number, number] => (esZ(l) ? [a.x0, a.x1] : [a.z0, a.z1])
const largoPared = (a: Ambiente, l: Lado) => { const [p, q] = rango(a, l); return q - p }
const fondo = (a: Ambiente, l: Lado) => (esZ(l) ? a.z1 - a.z0 : a.x1 - a.x0)
const sub = (a: Ambiente, x0: number, x1: number, z0: number, z1: number): Ambiente => ({ ...a, x0, x1, z0, z1 })

/** caja apoyada en la pared `lado`, centrada en la coordenada `t` de esa pared */
function mt(a: Ambiente, lado: Lado, t: number, v: number, w: number, d: number, h: number, y: number, c: string): Caja {
  const vc = v + d / 2
  let x = 0, z = 0
  if (lado === '-z') { x = t; z = a.z0 + vc }
  else if (lado === '+z') { x = t; z = a.z1 - vc }
  else if (lado === '-x') { x = a.x0 + vc; z = t }
  else { x = a.x1 - vc; z = t }
  return { p: [x, y + h / 2, z], s: [w, h, d], c, ry: RY[lado] }
}

/** caja en coordenadas absolutas del plano */
const abs = (x: number, z: number, w: number, d: number, h: number, y: number, c: string): Caja =>
  ({ p: [x, y + h / 2, z], s: [w, h, d], c })

/** tramo de pared libre de puertas más ancho; devuelve el centro y el ancho utilizable */
function tramo(a: Ambiente, lado: Lado, vanos: Seg[], deseado: number): { t: number; w: number } | null {
  const eje: 'x' | 'z' = esZ(lado) ? 'z' : 'x'
  const c = coordPared(a, lado)
  const [p0, p1] = rango(a, lado)
  const bloques = vanos
    .filter(s => s.eje === eje && Math.abs(s.c - c) < 1.5e-2)
    .map(s => [Math.max(s.a - 0.14, p0), Math.min(s.b + 0.14, p1)] as [number, number])
    .filter(iv => iv[1] > iv[0] + 1e-3)
    .sort((u, v) => u[0] - v[0])
  let cursor = p0
  let mejor: [number, number] = [p0, p0]
  for (const [b0, b1] of bloques) {
    if (b0 - cursor > mejor[1] - mejor[0]) mejor = [cursor, b0]
    cursor = Math.max(cursor, b1)
  }
  if (p1 - cursor > mejor[1] - mejor[0]) mejor = [cursor, p1]
  const largo = mejor[1] - mejor[0]
  if (largo < 0.75) return null
  return { t: (mejor[0] + mejor[1]) / 2, w: Math.min(deseado, largo - 0.08) }
}

const MADERA = '#8b5e3c'
const MADERA_CLARA = '#c79f70'
const TELA = '#7c8b98'
const TELA2 = '#5f6d7a'
const BLANCO = '#f2f2ef'
const ACERO = '#b9bec4'
const TEXTIL = '#eadfcd'

function cama(a: Ambiente, lado: Lado, vanos: Seg[], doble: boolean): Caja[] {
  const w = doble ? 1.5 : 1.0
  const largo = doble ? 2.0 : 1.9
  const t0 = tramo(a, lado, vanos, w + 1.6)
  if (!t0) return []
  const t = t0.t
  const disp = t0.w
  const out: Caja[] = [
    mt(a, lado, t, 0.06, w + 0.12, 0.09, 0.95, 0, MADERA),
    mt(a, lado, t, 0.15, w, largo, 0.3, 0.1, MADERA_CLARA),
    mt(a, lado, t, 0.19, w - 0.06, largo - 0.2, 0.16, 0.4, TEXTIL),
    mt(a, lado, t, 0.28, w - 0.14, 0.4, 0.11, 0.56, '#dfe6ea'),
    mt(a, lado, t, largo * 0.58, w - 0.04, 0.6, 0.04, 0.56, '#93a7b4'),
  ]
  const [p0, p1] = rango(a, lado)
  for (const s of [1, -1]) {
    const tv = t + s * (w / 2 + 0.34)
    if (disp < w + 1.0 || tv - 0.24 < p0 + 0.06 || tv + 0.24 > p1 - 0.06) continue
    out.push(mt(a, lado, tv, 0.1, 0.44, 0.4, 0.5, 0, MADERA))
    out.push(mt(a, lado, tv, 0.16, 0.15, 0.15, 0.24, 0.5, '#f7e7bb'))
    if (disp < w + 1.9) break
  }
  if (fondo(a, lado) > 2.85) {
    const op = opuesto[lado]
    const tc = tramo(a, op, vanos, 1.9)
    if (tc && tc.w > 0.9) {
      out.push(mt(a, op, tc.t, 0.05, tc.w, 0.58, 2.15, 0, '#ad8f6c'))
      out.push(mt(a, op, tc.t, 0.62, Math.max(0.4, tc.w - 0.5), 0.03, 2.0, 0.06, '#7d6549'))
    }
  }
  return out
}

/** sofá + mesa de centro + TV en la pared opuesta */
function estar(s: Ambiente, lado: Lado, vanos: Seg[]): Caja[] {
  const op = opuesto[lado]
  const sofa = tramo(s, lado, vanos, Math.min(2.0, largoPared(s, lado) - 0.45))
  if (!sofa || sofa.w < 1.1) return []
  const w = sofa.w
  const t = sofa.t
  const out: Caja[] = [
    mt(s, lado, t, 0.4, w + 0.5, 1.7, 0.015, 0.004, '#b6a795'),
    mt(s, lado, t, 0.16, w, 0.85, 0.36, 0, TELA),
    mt(s, lado, t, 0.16, w, 0.22, 0.48, 0.36, TELA2),
    mt(s, lado, t + w / 2 - 0.09, 0.18, 0.18, 0.8, 0.22, 0.36, TELA2),
    mt(s, lado, t - (w / 2 - 0.09), 0.18, 0.18, 0.8, 0.22, 0.36, TELA2),
    mt(s, lado, t - w * 0.26, 0.36, 0.4, 0.14, 0.4, 0.36, '#cbb8a2'),
    mt(s, lado, t + w * 0.26, 0.36, 0.4, 0.14, 0.4, 0.36, '#cbb8a2'),
    mt(s, lado, t, 1.3, 0.95, 0.5, 0.05, 0.36, MADERA_CLARA),
    mt(s, lado, t - 0.36, 1.45, 0.06, 0.06, 0.36, 0, MADERA),
    mt(s, lado, t + 0.36, 1.45, 0.06, 0.06, 0.36, 0, MADERA),
  ]
  const tv = tramo(s, op, vanos, Math.min(1.5, largoPared(s, op) - 0.45))
  if (tv && tv.w > 0.85) {
    out.push(mt(s, op, tv.t, 0.12, tv.w, 0.38, 0.42, 0, '#715b46'))
    out.push(mt(s, op, tv.t, 0.14, tv.w - 0.32, 0.05, 0.62, 0.92, '#20252b'))
    out.push(mt(s, op, tv.t, 0.165, tv.w - 0.42, 0.02, 0.54, 0.96, '#41505f'))
  }
  return out
}

/** mesa + 4 sillas centradas en el sub-rectángulo `s` */
function comedor(s: Ambiente): Caja[] {
  const cx = (s.x0 + s.x1) / 2
  const cz = (s.z0 + s.z1) / 2
  const w = Math.min(1.05, s.x1 - s.x0 - 1.1)
  const d = Math.min(0.8, s.z1 - s.z0 - 1.1)
  if (w < 0.65 || d < 0.55) return []
  const out: Caja[] = [abs(cx, cz, w, d, 0.05, 0.73, MADERA_CLARA)]
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]] as [number, number][]) {
    out.push(abs(cx + dx * (w / 2 - 0.08), cz + dz * (d / 2 - 0.08), 0.06, 0.06, 0.73, 0, MADERA))
  }
  const sillas: [number, number, boolean][] = [
    [-w / 2 - 0.26, 0, false], [w / 2 + 0.26, 0, false],
    [0, -d / 2 - 0.26, true], [0, d / 2 + 0.26, true],
  ]
  for (const [dx, dz, frontal] of sillas) {
    const x = cx + dx, z = cz + dz
    out.push(abs(x, z, 0.4, 0.4, 0.05, 0.44, '#9d7d5b'))
    out.push(abs(x + (frontal ? 0 : Math.sign(dx) * 0.18), z + (frontal ? Math.sign(dz) * 0.18 : 0),
      frontal ? 0.4 : 0.05, frontal ? 0.05 : 0.4, 0.44, 0.49, '#9d7d5b'))
    for (const [px, pz] of [[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]] as [number, number][]) {
      out.push(abs(x + px, z + pz, 0.045, 0.045, 0.44, 0, '#8b6a4a'))
    }
  }
  return out
}

function salaComedor(a: Ambiente, lado: Lado, vanos: Seg[]): Caja[] {
  const partirEnX = a.x1 - a.x0 >= a.z1 - a.z0
  const mx = (a.x0 + a.x1) / 2
  const mz = (a.z0 + a.z1) / 2
  const s1 = partirEnX ? sub(a, a.x0, mx, a.z0, a.z1) : sub(a, a.x0, a.x1, mz, a.z1)
  const s2 = partirEnX ? sub(a, mx, a.x1, a.z0, a.z1) : sub(a, a.x0, a.x1, a.z0, mz)
  // el estar va en la mitad con más pared libre frente al sofá
  const puntaje = (s: Ambiente) => (tramo(s, opuesto[lado], vanos, 1.5)?.w ?? 0) + (tramo(s, lado, vanos, 2)?.w ?? 0)
  const usarS1 = puntaje(s1) >= puntaje(s2)
  const A = usarS1 ? s1 : s2
  const B = usarS1 ? s2 : s1
  return [...estar(A, lado, vanos), ...comedor(B)]
}

function cocina(a: Ambiente, lado: Lado, vanos: Seg[]): Caja[] {
  const t0 = tramo(a, lado, vanos, 2.6)
  if (!t0) return []
  const { t, w } = t0
  const out: Caja[] = [
    mt(a, lado, t, 0.04, w, 0.6, 0.86, 0, '#d2c9bb'),
    mt(a, lado, t, 0.02, w + 0.04, 0.64, 0.05, 0.86, '#4e5155'),
    mt(a, lado, t - w * 0.27, 0.16, 0.52, 0.4, 0.02, 0.91, ACERO),
    mt(a, lado, t + w * 0.25, 0.16, 0.5, 0.42, 0.02, 0.92, '#2f3438'),
    mt(a, lado, t, 0.05, w, 0.34, 0.68, 1.5, '#e5ddd0'),
    mt(a, lado, t + w * 0.25, 0.08, 0.56, 0.4, 0.12, 2.06, ACERO),
  ]
  if (fondo(a, lado) > 1.9) {
    const tf = tramo(a, opuesto[lado], vanos, 0.66)
    if (tf && tf.w > 0.6) {
      out.push(mt(a, opuesto[lado], tf.t, 0.08, 0.66, 0.66, 1.75, 0, '#e2e6e9'))
      out.push(mt(a, opuesto[lado], tf.t, 0.05, 0.04, 0.03, 1.0, 0.55, '#8e979d'))
    }
  }
  return out
}

function bano(a: Ambiente, lado: Lado, vanos: Seg[]): Caja[] {
  const t0 = tramo(a, lado, vanos, largoPared(a, lado))
  if (!t0) return []
  const { t, w } = t0
  const out: Caja[] = [
    mt(a, lado, t - w / 2 + 0.3, 0.08, 0.4, 0.58, 0.4, 0, BLANCO),
    mt(a, lado, t - w / 2 + 0.3, 0.06, 0.4, 0.16, 0.42, 0.4, BLANCO),
    mt(a, lado, t - w / 2 + 0.3, 0.14, 0.36, 0.4, 0.05, 0.4, BLANCO),
  ]
  if (w > 1.25) {
    out.push(mt(a, lado, t + w / 2 - 0.36, 0.05, 0.56, 0.4, 0.14, 0.78, BLANCO))
    out.push(mt(a, lado, t + w / 2 - 0.36, 0.07, 0.46, 0.03, 0.56, 1.08, '#e2edf3'))
  }
  if (fondo(a, lado) > 1.7) {
    const td = tramo(a, opuesto[lado], vanos, 0.95)
    if (td && td.w > 0.7) {
      out.push(mt(a, opuesto[lado], td.t, 0.02, td.w, 0.88, 0.06, 0, '#e9eef1'))
      out.push(mt(a, opuesto[lado], td.t + td.w / 2, 0.02, 0.05, 0.88, 1.95, 0.06, '#d4dde2'))
      out.push(mt(a, opuesto[lado], td.t, 0.86, td.w, 0.06, 0.06, 2.05, '#cfd8dc'))
    }
  }
  return out
}

function servicio(a: Ambiente, lado: Lado, vanos: Seg[]): Caja[] {
  const t0 = tramo(a, lado, vanos, 1.6)
  if (!t0 || t0.w < 0.9) return []
  const { t, w } = t0
  return [
    mt(a, lado, t - w / 4, 0.06, 0.6, 0.6, 0.85, 0, '#e4e7e9'),
    mt(a, lado, t - w / 4, 0.14, 0.4, 0.4, 0.03, 0.86, '#9aa3a9'),
    mt(a, lado, t + w / 4, 0.05, Math.min(0.7, w / 2), 0.5, 1.9, 0, '#d2c9bb'),
  ]
}

/** genera todas las cajas de mobiliario del plano (los vanos evitan bloquear puertas) */
export function mobiliario(plano: Plano, vanos: Seg[]): Caja[] {
  const out: Caja[] = []
  for (const a of plano.ambientes) {
    const apoyo = a.apoyo ?? '-z'
    if (a.tipo === 'dormitorio') out.push(...cama(a, apoyo, vanos, a.id === 'dorm1'))
    else if (a.tipo === 'sala') out.push(...salaComedor(a, apoyo, vanos))
    else if (a.tipo === 'cocina') out.push(...cocina(a, apoyo, vanos))
    else if (a.tipo === 'bano') out.push(...bano(a, apoyo, vanos))
    else if (a.tipo === 'servicio') out.push(...servicio(a, apoyo, vanos))
  }
  return out
}
