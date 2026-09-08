import config from '../data/config.json'
import { supabase, supabaseDisponible } from './supabase'
import { leerSimulacionLocal, leerPrecalificacionLocal } from './leads'
import type { Lead, Unidad } from './types'
import { soles } from './types'
import type { Simulacion } from './finanzas'
import { telefonoWhatsapp } from './scoring'

export type MotivoSeguimiento = 'lead_sin_cita' | 'separacion' | 'abandono_separacion'

const ASESOR = config.asesor
const SECUENCIA: number[] = config.seguimientos.secuencia_minutos
const CANAL = config.seguimientos.canal_default || 'whatsapp'

/** Primer nombre, para un tono cercano en los mensajes. */
function primerNombre(nombre: string): string {
  return (nombre || '').trim().split(/\s+/)[0] || nombre
}

function descripcionUnidad(unidad?: Unidad | null): string {
  if (!unidad) return ''
  return `${unidad.id} (piso ${unidad.piso})`
}

function cuotaTexto(): string | null {
  const sim = leerSimulacionLocal<Simulacion>()
  if (sim && typeof sim.cuota === 'number' && sim.cuota > 0) {
    return soles(sim.cuota)
  }
  return null
}

function bonoTexto(): string | null {
  const precal = leerPrecalificacionLocal()
  if (precal?.resultado?.bono_recomendado) {
    return soles(precal.resultado.bono_recomendado)
  }
  return null
}

/** Arma el texto de cada mensaje de la secuencia según el motivo y el paso (0-indexado). */
function mensajePara(motivo: MotivoSeguimiento, paso: number, lead: Lead, unidad?: Unidad | null): string {
  const nombre = primerNombre(lead.nombre)
  const uid = descripcionUnidad(unidad)
  const cuota = cuotaTexto()
  const bono = bonoTexto()
  const cuotaFrase = cuota ? (bono ? ` Con el bono referencial tu cuota quedaría en ${cuota}.` : ` Tu cuota referencial quedaría en ${cuota}.`) : ''

  if (motivo === 'lead_sin_cita') {
    if (paso === 0) {
      return `Hola ${nombre}, soy ${ASESOR.nombre} de Constructora Demo.${uid ? ` Vi que te interesó el depa ${uid}.` : ' Vi tu interés en el proyecto.'}${cuotaFrase} ¿Te llamo hoy?`
    }
    if (paso === 1) {
      return `Hola ${nombre}, ¿pudiste ver mi mensaje de ayer? Te invito a visitar la caseta de ventas${uid ? ` y conocer el depa ${uid}` : ''} sin compromiso. ¿Qué día te acomoda?`
    }
    return `${nombre}, última coordinación de mi parte por aquí: si quieres, te agendo una visita a la caseta o una llamada rápida esta semana. Cualquier duda me escribes. - ${ASESOR.nombre}`
  }

  if (motivo === 'separacion') {
    if (paso === 0) {
      return `¡Hola ${nombre}! Soy ${ASESOR.nombre}. Confirmamos la separación de tu depa${uid ? ` ${uid}` : ''}.${cuotaFrase} Te confirmo los siguientes pasos en breve.`
    }
    if (paso === 1) {
      return `Hola ${nombre}, recuerda que tienes separado el depa${uid ? ` ${uid}` : ''}. Te invito a visitar la caseta para firmar los siguientes documentos. ¿Coordinamos un día?`
    }
    return `${nombre}, para no perder tu separación${uid ? ` del depa ${uid}` : ''}, coordinemos una visita a la caseta esta semana. Quedo atenta. - ${ASESOR.nombre}`
  }

  // abandono_separacion
  if (paso === 0) {
    return `Hola ${nombre}, soy ${ASESOR.nombre}. Vi que empezaste a separar el depa${uid ? ` ${uid}` : ''} pero no llegaste a confirmar.${cuotaFrase} ¿Te ayudo a terminarlo o tienes alguna duda?`
  }
  if (paso === 1) {
    return `Hola ${nombre}, el depa${uid ? ` ${uid}` : ''} que estabas separando sigue disponible. Te invito a visitar la caseta y resolver cualquier duda en persona. ¿Qué día te acomoda?`
  }
  return `${nombre}, última coordinación: si aún te interesa el depa${uid ? ` ${uid}` : ''}, avísame y te ayudo a separarlo hoy mismo. - ${ASESOR.nombre}`
}

/**
 * Programa la secuencia de seguimientos de WhatsApp para un lead según config.seguimientos.
 * No duplica: si ya hay seguimientos 'pendiente' del mismo lead y motivo (por la plantilla
 * `${motivo}_N`), no vuelve a insertar.
 */
export async function programarSeguimientos(
  lead: Lead,
  opciones: { unidad?: Unidad | null; motivo: MotivoSeguimiento }
): Promise<void> {
  if (!supabaseDisponible) return
  const { unidad, motivo } = opciones

  const { data: existentes, error: errLectura } = await supabase
    .from('seguimientos')
    .select('plantilla')
    .eq('lead_id', lead.id)
    .eq('estado', 'pendiente')
    .like('plantilla', `${motivo}_%`)
  if (errLectura) {
    console.warn('[seguimientos]', errLectura.message)
    return
  }
  if (existentes && existentes.length > 0) return

  const ahora = Date.now()
  const filas = SECUENCIA.map((minutos, i) => ({
    lead_id: lead.id,
    canal: CANAL,
    plantilla: `${motivo}_${i}`,
    mensaje: mensajePara(motivo, i, lead, unidad),
    programado_para: new Date(ahora + minutos * 60_000).toISOString(),
    estado: 'pendiente',
  }))

  // Índice único (lead_id, plantilla): dos llamadas concurrentes no duplican la secuencia.
  const { error } = await supabase.from('seguimientos').upsert(filas, { onConflict: 'lead_id,plantilla', ignoreDuplicates: true })
  if (error) console.warn('[seguimientos]', error.message)
}

/** Enlace directo a WhatsApp Web/app con el mensaje precargado. */
export function linkWhatsapp(telefono: string, mensaje: string): string {
  return `https://wa.me/${telefonoWhatsapp(telefono)}?text=${encodeURIComponent(mensaje)}`
}
