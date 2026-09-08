import config from '../data/config.json'

/** Cuota mensual (sistema francés). TEA anual → tasa mensual efectiva. */
export function cuotaMensual(monto: number, teaAnual: number, plazoAnios: number): number {
  const i = Math.pow(1 + teaAnual, 1 / 12) - 1
  const n = plazoAnios * 12
  if (monto <= 0) return 0
  if (i === 0) return monto / n
  return (monto * i) / (1 - Math.pow(1 + i, -n))
}

/** Cuota referencial para la ficha: inicial por defecto, plazo por defecto, sin bono. */
export function cuotaRapida(precio: number): number {
  const f = config.financiamiento
  const financiado = precio * (1 - f.cuota_inicial_default_pct)
  return cuotaMensual(financiado, f.tea_anual, f.plazo_default_anios)
}

export interface Simulacion {
  precio: number
  bono: number
  cuotaInicial: number
  financiado: number
  plazoAnios: number
  tea: number
  cuota: number
  /** ratio cuota / ingreso, null si no hay ingreso */
  ratio: number | null
  alcanza: boolean | null
}

export function simular(params: { precio: number; bono?: number; cuotaInicialPct: number; plazoAnios: number; ingreso?: number | null; tea?: number }): Simulacion {
  const f = config.financiamiento
  const tea = params.tea ?? f.tea_anual
  const bono = params.bono ?? 0
  const cuotaInicial = params.precio * params.cuotaInicialPct
  const financiado = Math.max(0, params.precio - bono - cuotaInicial)
  const cuota = cuotaMensual(financiado, tea, params.plazoAnios)
  const ratio = params.ingreso ? cuota / params.ingreso : null
  return {
    precio: params.precio, bono, cuotaInicial, financiado, plazoAnios: params.plazoAnios, tea, cuota,
    ratio, alcanza: ratio === null ? null : ratio <= f.ratio_cuota_ingreso_max,
  }
}
