import { describe, it, expect } from 'vitest'
import { precalificar } from './precalificacion'

describe('precalificar', () => {
  it('da veredicto alta cuando es elegible y la cuota le alcanza', () => {
    const r = precalificar({ ingreso: 3700, ahorro: 10000, tieneVivienda: false, precio: 129000 })
    expect(r.veredicto).toBe('alta')
    expect(r.bono_recomendado).toBe(44000)
    const techoPropio = r.programas.find(p => p.id === 'techo_propio')!
    expect(techoPropio.elegible).toBe(true)
    expect(techoPropio.bono_estimado).toBe(44000)
  })

  it('da veredicto media cuando es elegible pero la cuota no le alcanza con su ingreso', () => {
    const r = precalificar({ ingreso: 1200, ahorro: 10000, tieneVivienda: false, precio: 129000 })
    expect(r.veredicto).toBe('media')
    expect(r.programas.some(p => p.elegible)).toBe(true)
  })

  it('da veredicto media cuando a ningún programa alcanza pero falta poco ahorro (< 50% de lo requerido)', () => {
    // Techo Propio requiere 3% de 129000 = 3870; declara 3000 (falta 22.5%, < 50%)
    const r = precalificar({ ingreso: 3700, ahorro: 3000, tieneVivienda: false, precio: 129000 })
    expect(r.programas.every(p => !p.elegible)).toBe(true)
    expect(r.veredicto).toBe('media')
    const techoPropio = r.programas.find(p => p.id === 'techo_propio')!
    expect(techoPropio.motivos.some(m => m.includes('ahorro'))).toBe(true)
  })

  it('da veredicto baja cuando ya tiene vivienda (no elegible a ningún programa y no es solo por ahorro)', () => {
    const r = precalificar({ ingreso: 3000, ahorro: 20000, tieneVivienda: true, precio: 129000 })
    expect(r.programas.every(p => !p.elegible)).toBe(true)
    expect(r.veredicto).toBe('baja')
    expect(r.bono_recomendado).toBe(0)
  })

  it('da veredicto baja cuando el ingreso supera el tope y el precio no cae en mivivienda', () => {
    const r = precalificar({ ingreso: 20000, ahorro: 1000, tieneVivienda: false, precio: 500000 })
    expect(r.programas.every(p => !p.elegible)).toBe(true)
    expect(r.veredicto).toBe('baja')
  })

  it('elige el bono más alto entre los programas elegibles', () => {
    // precio 90000: Mivivienda tramo <=100000 -> bono 27400; Techo Propio (precio<=143000) -> bono 44000
    const r = precalificar({ ingreso: 3600, ahorro: 20000, tieneVivienda: false, precio: 90000 })
    const elegibles = r.programas.filter(p => p.elegible)
    expect(elegibles.length).toBeGreaterThanOrEqual(1)
    expect(r.bono_recomendado).toBe(Math.max(...elegibles.map(p => p.bono_estimado)))
  })

  it('incluye motivos legibles tanto para requisitos cumplidos como no cumplidos', () => {
    const r = precalificar({ ingreso: 5000, ahorro: 100, tieneVivienda: false, precio: 129000 })
    const techoPropio = r.programas.find(p => p.id === 'techo_propio')!
    expect(techoPropio.elegible).toBe(false)
    expect(techoPropio.motivos.some(m => /ingreso/i.test(m))).toBe(true)
  })
})
