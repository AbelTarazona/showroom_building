import config from '../data/config.json'
import type { Evento } from './types'
import type { PrecalificacionResultado } from './precalificacion'

export interface DetalleScore {
  regla: string
  puntos: number
  motivo: string
}

export interface ResultadoScore {
  score: number
  detalle: DetalleScore[]
}

export type EventoScoring = Pick<Evento, 'tipo' | 'unidad_id' | 'payload'>

/** Score de lead 0–100, por reglas explicables (PLAN §5.4). */
export function calcularScore(params: {
  eventos: EventoScoring[]
  precalificacion?: Pick<PrecalificacionResultado, 'veredicto'> | null
  telefonoValido?: boolean
  revisita?: boolean
}): ResultadoScore {
  const { eventos, precalificacion, telefonoValido: telOk, revisita } = params
  const pesos = config.score
  const detalle: DetalleScore[] = []

  if (precalificacion?.veredicto === 'alta') {
    detalle.push({ regla: 'precalificacion_alta', puntos: pesos.precalificacion_alta, motivo: 'Precalificación referencial con probabilidad alta a un bono.' })
  } else if (precalificacion?.veredicto === 'media') {
    detalle.push({ regla: 'precalificacion_media', puntos: pesos.precalificacion_media, motivo: 'Precalificación referencial con probabilidad media a un bono.' })
  }

  const simulacionQueAlcanza = eventos.find(e => e.tipo === 'simular_cuota' && (e.payload as Record<string, unknown> | null)?.alcanza === true)
  if (simulacionQueAlcanza) {
    const uid = simulacionQueAlcanza.unidad_id
    detalle.push({ regla: 'simulo_y_alcanza', puntos: pesos.simulo_y_alcanza, motivo: `Simuló cuota${uid ? ` de ${uid}` : ''} y le alcanza.` })
  }

  const unidadesVistas = new Set(eventos.filter(e => e.tipo === 'ver_unidad' && e.unidad_id).map(e => e.unidad_id))
  if (unidadesVistas.size >= 3) {
    detalle.push({ regla: 'vio_3_unidades', puntos: pesos.vio_3_unidades, motivo: `Vio ${unidadesVistas.size} unidades distintas.` })
  }

  if (eventos.some(e => e.tipo === 'ver_interior')) {
    detalle.push({ regla: 'vio_interior', puntos: pesos.vio_interior, motivo: 'Vio el interior de una unidad.' })
  }
  if (eventos.some(e => e.tipo === 'ver_vista')) {
    detalle.push({ regla: 'vio_vista', puntos: pesos.vio_vista, motivo: 'Vio la vista desde la ventana de una unidad.' })
  }
  if (eventos.some(e => e.tipo === 'favorito')) {
    detalle.push({ regla: 'favorito', puntos: pesos.favorito, motivo: 'Guardó una unidad como favorita.' })
  }
  if (eventos.some(e => e.tipo === 'comparar')) {
    detalle.push({ regla: 'comparo', puntos: pesos.comparo, motivo: 'Comparó varias unidades.' })
  }
  if (revisita) {
    detalle.push({ regla: 'revisita', puntos: pesos.revisita, motivo: 'Volvió a visitar el showroom (revisita).' })
  }
  if (eventos.some(e => e.tipo === 'iniciar_separacion' || e.tipo === 'separar')) {
    detalle.push({ regla: 'inicio_separacion', puntos: pesos.inicio_separacion, motivo: 'Inició o completó la separación de una unidad.' })
  }
  if (eventos.some(e => e.tipo === 'agendar')) {
    detalle.push({ regla: 'agendo', puntos: pesos.agendo, motivo: 'Agendó una visita o llamada.' })
  }
  if (telOk) {
    detalle.push({ regla: 'telefono_valido', puntos: pesos.telefono_valido, motivo: 'Dejó un teléfono válido de contacto.' })
  }

  const score = Math.min(100, detalle.reduce((s, d) => s + d.puntos, 0))
  return { score, detalle }
}

/** Etapa sugerida del lead según su score. */
export function etapaPorScore(score: number): 'calificado' | 'contactar' | 'nuevo' {
  if (score >= 70) return 'calificado'
  if (score >= 40) return 'contactar'
  return 'nuevo'
}

/** Celular peruano: 9 dígitos empezando en 9. Acepta prefijo +51/51 y espacios/guiones. */
/** Solo dígitos, con prefijo 51 si viene un celular peruano de 9 dígitos: lo que espera wa.me. */
export function telefonoWhatsapp(telefono?: string | null): string {
  const digitos = (telefono ?? '').replace(/\D/g, '')
  return /^9\d{8}$/.test(digitos) ? `51${digitos}` : digitos
}

export function telefonoValido(t: string | null | undefined): boolean {
  if (!t) return false
  const limpio = t.replace(/[\s-]/g, '')
  return /^(?:\+?51)?9\d{8}$/.test(limpio)
}

/** Normaliza un celular peruano válido a formato 51XXXXXXXXX. */
export function normalizarTelefono(t: string): string {
  const limpio = t.replace(/[\s-]/g, '').replace(/^\+?51/, '')
  return '51' + limpio
}
