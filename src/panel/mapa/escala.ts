// Escala de color continua para el mapa de calor: frío (sin mucho interés) -> caliente (mucho interés).
type RGB = [number, number, number]

const PARADAS: [number, RGB][] = [
  [0, [203, 213, 225]], // slate-300
  [0.55, [245, 158, 11]], // amber-500
  [1, [220, 38, 38]], // red-600
]

function mezclar(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
}

/** t en [0,1] -> color rgb() interpolado en la escala frío->caliente. */
export function colorEscala(t: number): string {
  const c = Math.max(0, Math.min(1, t))
  for (let i = 0; i < PARADAS.length - 1; i++) {
    const [t0, c0] = PARADAS[i]
    const [t1, c1] = PARADAS[i + 1]
    if (c >= t0 && c <= t1) {
      const local = t1 === t0 ? 0 : (c - t0) / (t1 - t0)
      const [r, g, b] = mezclar(c0, c1, local)
      return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
    }
  }
  const [, ultimo] = PARADAS[PARADAS.length - 1]
  return `rgb(${ultimo.join(', ')})`
}

/** Color para unidades sin datos en la métrica activa. */
export const SIN_DATOS = '#e2e8f0' // slate-200
