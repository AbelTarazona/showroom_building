import { describe, it, expect } from 'vitest'
import { cuotaMensual, simular } from './finanzas'

describe('cuotaMensual', () => {
  it('calcula la cuota francesa para S/ 100,000 a 10.5% TEA en 20 años', () => {
    // Verificado a mano: i_mensual = (1.105)^(1/12) - 1 ≈ 0.0083552, n = 240
    // cuota = 100000 * i / (1 - (1+i)^-240) ≈ 966.76
    const cuota = cuotaMensual(100000, 0.105, 20)
    expect(cuota).toBeCloseTo(966.76, 1)
  })

  it('reparte el monto en partes iguales si la tasa es 0', () => {
    expect(cuotaMensual(120000, 0, 10)).toBeCloseTo(1000, 6)
  })

  it('devuelve 0 si no hay monto a financiar', () => {
    expect(cuotaMensual(0, 0.105, 20)).toBe(0)
  })
})

describe('simular', () => {
  it('calcula ratio y alcanza=true cuando la cuota es cómoda para el ingreso', () => {
    const s = simular({ precio: 129000, bono: 44000, cuotaInicialPct: 0.10, plazoAnios: 20, ingreso: 3700 })
    // financiado = 129000 - 44000 - 12900 = 72100 -> cuota ≈ 696.99 (72.1% de la cuota de 100k)
    expect(s.financiado).toBeCloseTo(72100, 2)
    expect(s.cuota).toBeCloseTo(696.99, 0)
    expect(s.ratio).not.toBeNull()
    expect(s.ratio!).toBeLessThan(0.35)
    expect(s.alcanza).toBe(true)
  })

  it('marca alcanza=false cuando la cuota supera el ratio máximo configurado', () => {
    const s = simular({ precio: 129000, bono: 44000, cuotaInicialPct: 0.10, plazoAnios: 20, ingreso: 1200 })
    expect(s.ratio!).toBeGreaterThan(0.35)
    expect(s.alcanza).toBe(false)
  })

  it('devuelve alcanza=null si no se declaró ingreso', () => {
    const s = simular({ precio: 129000, cuotaInicialPct: 0.10, plazoAnios: 20 })
    expect(s.ratio).toBeNull()
    expect(s.alcanza).toBeNull()
  })
})
