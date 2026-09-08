import config from '../data/config.json'
import { simular } from './finanzas'
import { soles } from './types'

interface ProgramaConfig {
  id: string
  nombre: string
  ingreso_familiar_max?: number
  ahorro_min_pct?: number
  precio_vivienda_max?: number
  precio_vivienda_min?: number
  cuota_inicial_min_pct?: number
  requiere_no_tener_vivienda?: boolean
  bono?: number
  bono_por_tramo?: { hasta: number; bono: number }[]
}

export interface ProgramaResultado {
  id: string
  nombre: string
  elegible: boolean
  bono_estimado: number
  motivos: string[]
}

export type Veredicto = 'alta' | 'media' | 'baja'

export interface PrecalificacionInput {
  ingreso: number
  ahorro: number
  tieneVivienda: boolean
  precio: number
  numFamilia?: number
}

export interface PrecalificacionResultado {
  programas: ProgramaResultado[]
  veredicto: Veredicto
  bono_recomendado: number
  resumen: string
}

function bonoDeTramo(precio: number, tramos: { hasta: number; bono: number }[]): number | null {
  const tramo = tramos.find(t => precio <= t.hasta)
  return tramo ? tramo.bono : null
}

/**
 * Evalúa un programa contra el input. Además del resultado, indica si el ÚNICO
 * requisito no cumplido fue el ahorro (útil para el veredicto "media" cuando
 * al postulante le falta poco) y qué porcentaje de ahorro le falta.
 */
function evaluarPrograma(p: ProgramaConfig, input: PrecalificacionInput) {
  const { ingreso, ahorro, tieneVivienda, precio } = input
  const motivos: string[] = []
  let elegible = true
  let bono_estimado = 0
  let soloPodriaFallarPorAhorro = true
  let faltantePct = 0

  if (p.requiere_no_tener_vivienda) {
    if (tieneVivienda) {
      elegible = false
      soloPodriaFallarPorAhorro = false
      motivos.push('Ya cuentas con una vivienda propia; este programa es solo para primera vivienda.')
    } else {
      motivos.push('Cumples no tener vivienda propia.')
    }
  }

  if (typeof p.ingreso_familiar_max === 'number') {
    if (ingreso > p.ingreso_familiar_max) {
      elegible = false
      soloPodriaFallarPorAhorro = false
      motivos.push(`Tu ingreso familiar supera el tope referencial de ${soles(p.ingreso_familiar_max)}.`)
    } else {
      motivos.push(`Tu ingreso familiar está dentro del tope referencial de ${soles(p.ingreso_familiar_max)}.`)
    }
  }

  if (typeof p.precio_vivienda_min === 'number') {
    if (precio < p.precio_vivienda_min) {
      elegible = false
      soloPodriaFallarPorAhorro = false
      motivos.push(`El precio de esta vivienda está por debajo del mínimo referencial de ${soles(p.precio_vivienda_min)} para este programa.`)
    } else {
      motivos.push(`El precio cumple el mínimo referencial de ${soles(p.precio_vivienda_min)}.`)
    }
  }

  if (typeof p.precio_vivienda_max === 'number') {
    if (precio > p.precio_vivienda_max) {
      elegible = false
      soloPodriaFallarPorAhorro = false
      motivos.push(`El precio de esta vivienda supera el tope referencial de ${soles(p.precio_vivienda_max)} para este programa.`)
    } else {
      motivos.push(`El precio está dentro del tope referencial de ${soles(p.precio_vivienda_max)}.`)
    }
  }

  const pctAhorro = p.ahorro_min_pct ?? p.cuota_inicial_min_pct
  if (typeof pctAhorro === 'number') {
    const requerido = precio * pctAhorro
    if (ahorro < requerido) {
      elegible = false
      faltantePct = requerido > 0 ? (requerido - ahorro) / requerido : 0
      motivos.push(`Te falta ahorro: se requiere ${soles(requerido)} (${Math.round(pctAhorro * 100)}% del precio) y declaraste ${soles(ahorro)}.`)
    } else {
      motivos.push(`Cumples el ahorro mínimo (${soles(requerido)}).`)
    }
  } else {
    soloPodriaFallarPorAhorro = false
  }

  if (elegible) {
    if (typeof p.bono === 'number') bono_estimado = p.bono
    if (p.bono_por_tramo) {
      const b = bonoDeTramo(precio, p.bono_por_tramo)
      if (b === null) {
        elegible = false
        soloPodriaFallarPorAhorro = false
        motivos.push('No hay un tramo de bono aplicable para este precio.')
      } else {
        bono_estimado = b
      }
    }
  }

  const resultado: ProgramaResultado = {
    id: p.id,
    nombre: p.nombre,
    elegible,
    bono_estimado: elegible ? bono_estimado : 0,
    motivos,
  }
  return { resultado, soloFallaPorAhorro: soloPodriaFallarPorAhorro && !elegible, faltantePct }
}

/** Precalificación referencial a bonos estatales, parametrizada por config.json → programas. */
export function precalificar(input: PrecalificacionInput): PrecalificacionResultado {
  const programas: ProgramaResultado[] = []
  let algunaFaltaPocoAhorro = false

  for (const p of config.programas as ProgramaConfig[]) {
    const { resultado, soloFallaPorAhorro, faltantePct } = evaluarPrograma(p, input)
    programas.push(resultado)
    if (soloFallaPorAhorro && faltantePct < 0.5) algunaFaltaPocoAhorro = true
  }

  const elegibles = programas.filter(p => p.elegible)
  const bono_recomendado = elegibles.reduce((max, p) => Math.max(max, p.bono_estimado), 0)

  let veredicto: Veredicto
  if (elegibles.length > 0) {
    const f = config.financiamiento
    const sim = simular({
      precio: input.precio,
      bono: bono_recomendado,
      cuotaInicialPct: f.cuota_inicial_default_pct,
      plazoAnios: f.plazo_default_anios,
      ingreso: input.ingreso,
    })
    veredicto = sim.alcanza === true ? 'alta' : 'media'
  } else if (algunaFaltaPocoAhorro) {
    veredicto = 'media'
  } else {
    veredicto = 'baja'
  }

  const nombresElegibles = elegibles.map(p => p.nombre).join(' y ')
  let resumen: string
  if (veredicto === 'alta') {
    resumen = `Perfil con alta probabilidad referencial de acceder a ${nombresElegibles}, con un bono estimado de ${soles(bono_recomendado)}. La entidad financiera confirma el resultado final.`
  } else if (veredicto === 'media' && elegibles.length > 0) {
    resumen = `Podrías calificar a ${nombresElegibles} (bono referencial de ${soles(bono_recomendado)}), pero la cuota estimada está ajustada para tu ingreso declarado. La entidad financiera confirma el resultado final.`
  } else if (veredicto === 'media') {
    resumen = 'Estás cerca de calificar a un programa de bono: te falta poco ahorro. Cálculo referencial, la entidad financiera confirma el resultado final.'
  } else {
    resumen = 'Con los datos declarados, la probabilidad referencial de acceder a un bono estatal es baja para esta vivienda. Cálculo referencial, la entidad financiera confirma el resultado final.'
  }

  return { programas, veredicto, bono_recomendado, resumen }
}
