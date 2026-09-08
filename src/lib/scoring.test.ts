import { describe, it, expect } from 'vitest'
import { calcularScore, etapaPorScore, telefonoValido, normalizarTelefono, type EventoScoring } from './scoring'

const evt = (tipo: EventoScoring['tipo'], unidad_id: string | null = null, payload: Record<string, unknown> = {}): EventoScoring => ({ tipo, unidad_id, payload })

describe('calcularScore', () => {
  it('suma puntos por cada señal presente, con motivos concretos', () => {
    const eventos: EventoScoring[] = [
      evt('ver_unidad', 'P07-N2'),
      evt('ver_unidad', 'P07-N3'),
      evt('ver_unidad', 'P07-N4'),
      evt('ver_interior', 'P07-N2'),
      evt('simular_cuota', 'P07-N2', { alcanza: true }),
      evt('favorito', 'P07-N2'),
    ]
    const { score, detalle } = calcularScore({ eventos, precalificacion: { veredicto: 'alta' }, telefonoValido: true })
    // 30 (precal alta) + 15 (simulo y alcanza) + 5 (vio 3 unidades) + 5 (vio interior) + 5 (favorito) + 5 (telefono) = 65
    expect(score).toBe(65)
    expect(detalle.find(d => d.regla === 'simulo_y_alcanza')?.motivo).toContain('P07-N2')
    expect(detalle.map(d => d.regla)).toEqual(
      expect.arrayContaining(['precalificacion_alta', 'simulo_y_alcanza', 'vio_3_unidades', 'vio_interior', 'favorito', 'telefono_valido']),
    )
  })

  it('no otorga puntos por simular si la cuota no alcanza', () => {
    const eventos: EventoScoring[] = [evt('simular_cuota', 'P07-N2', { alcanza: false })]
    const { detalle } = calcularScore({ eventos })
    expect(detalle.find(d => d.regla === 'simulo_y_alcanza')).toBeUndefined()
  })

  it('no otorga puntos por "vio 3 unidades" con menos de 3 unidades distintas', () => {
    const eventos: EventoScoring[] = [evt('ver_unidad', 'A'), evt('ver_unidad', 'A'), evt('ver_unidad', 'B')]
    const { detalle } = calcularScore({ eventos })
    expect(detalle.find(d => d.regla === 'vio_3_unidades')).toBeUndefined()
  })

  it('da un score bajo (perfil "baja") cuando casi no hay señales', () => {
    const { score } = calcularScore({ eventos: [] })
    expect(score).toBe(0)
  })

  it('topa el score en 100 aunque la suma de reglas supere ese valor', () => {
    const eventos: EventoScoring[] = [
      evt('ver_unidad', 'A'), evt('ver_unidad', 'B'), evt('ver_unidad', 'C'),
      evt('ver_interior'), evt('ver_vista'), evt('favorito'), evt('comparar'),
      evt('simular_cuota', 'A', { alcanza: true }),
      evt('iniciar_separacion'), evt('agendar'),
    ]
    const { score } = calcularScore({ eventos, precalificacion: { veredicto: 'alta' }, telefonoValido: true, revisita: true })
    expect(score).toBe(100)
  })
})

describe('etapaPorScore', () => {
  it('clasifica calificado, contactar y nuevo según umbrales', () => {
    expect(etapaPorScore(70)).toBe('calificado')
    expect(etapaPorScore(85)).toBe('calificado')
    expect(etapaPorScore(69)).toBe('contactar')
    expect(etapaPorScore(40)).toBe('contactar')
    expect(etapaPorScore(39)).toBe('nuevo')
    expect(etapaPorScore(0)).toBe('nuevo')
  })
})

describe('telefonoValido', () => {
  it('acepta celulares peruanos de 9 dígitos que empiezan en 9, con o sin prefijo', () => {
    expect(telefonoValido('987654321')).toBe(true)
    expect(telefonoValido('51987654321')).toBe(true)
    expect(telefonoValido('+51 987 654 321')).toBe(true)
    expect(telefonoValido('+51987654321')).toBe(true)
  })

  it('rechaza números inválidos', () => {
    expect(telefonoValido('123456789')).toBe(false) // no empieza en 9
    expect(telefonoValido('98765432')).toBe(false) // 8 dígitos
    expect(telefonoValido('9876543210')).toBe(false) // 10 dígitos
    expect(telefonoValido(null)).toBe(false)
    expect(telefonoValido('')).toBe(false)
  })
})

describe('normalizarTelefono', () => {
  it('normaliza a formato 51XXXXXXXXX', () => {
    expect(normalizarTelefono('987654321')).toBe('51987654321')
    expect(normalizarTelefono('+51 987 654 321')).toBe('51987654321')
    expect(normalizarTelefono('51987654321')).toBe('51987654321')
  })
})
