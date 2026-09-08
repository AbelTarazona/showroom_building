// Fase 7 · IA del showroom (solo OpenAI, con fallback determinista por plantilla).
//
// Todo lo que "piensa" en el producto pasa por este archivo. Si `VITE_OPENAI_API_KEY`
// está vacía o la llamada falla (red, cuota, parseo), cada función degrada a una
// plantilla que compone el mismo resultado a partir de datos reales — nunca se rompe
// la demo por depender de un servicio externo.
//
// La llamada se hace directo desde el navegador (`dangerouslyAllowBrowser: true`):
// es una demo local de hackathon, no una app en producción.
//
// Contrato JSON esperado de `resumirLead` (response_format: json_schema, strict):
//   {
//     "resumen": string,            // párrafo para el asesor: quién es, qué vio, qué le alcanza
//     "siguiente_accion": string,   // una frase accionable ("Llamar y ofrecer visita el sábado")
//     "mensaje_whatsapp": string    // mensaje breve y cercano, listo para pegar en WhatsApp
//   }
//
// `responderConsulta` no usa JSON estructurado: devuelve texto plano (máx. ~4 frases).

import OpenAI from 'openai'
import config from '../data/config.json'
import { supabase, supabaseDisponible } from './supabase'
import { getSesionId, track } from './tracking'
import type { Edificio, Evento, Lead, Unidad } from './types'
import { soles } from './types'
import { cuotaRapida } from './finanzas'

const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined

let cliente: OpenAI | null = null
function getCliente(): OpenAI | null {
  if (!apiKey) return null
  if (!cliente) cliente = new OpenAI({ apiKey, dangerouslyAllowBrowser: true })
  return cliente
}

/** true si hay una API key de OpenAI configurada (no valida que funcione). */
export function iaDisponible(): boolean {
  return Boolean(apiKey)
}

// ---------------------------------------------------------------------------
// Resumen de lead
// ---------------------------------------------------------------------------

export interface ResumenLead {
  resumen: string
  siguiente_accion: string
  mensaje_whatsapp: string
  /** 'openai' si vino del modelo, 'plantilla' si fue el fallback determinista. */
  origen: 'openai' | 'plantilla'
}

interface ContextoUnidad {
  id: string
  piso: number
  tipologia: string
  precio: number
  cuota?: number | null
}

function eventosResumen(eventos: Evento[], unidades: Record<string, Unidad>): string {
  const porTipo = new Map<string, number>()
  const unidadesVistas = new Set<string>()
  let simuloAlcanza: boolean | null = null
  for (const e of eventos) {
    porTipo.set(e.tipo, (porTipo.get(e.tipo) ?? 0) + 1)
    if (e.unidad_id) unidadesVistas.add(e.unidad_id)
    if (e.tipo === 'simular_cuota') {
      const alcanza = (e.payload as Record<string, unknown> | null)?.alcanza
      if (typeof alcanza === 'boolean') simuloAlcanza = alcanza
    }
  }
  const pisos = [...unidadesVistas].map(id => unidades[id]?.piso).filter((p): p is number => p != null)
  const partes: string[] = []
  if (unidadesVistas.size > 0) {
    const rango = pisos.length ? ` (pisos ${Math.min(...pisos)}–${Math.max(...pisos)})` : ''
    partes.push(`vio ${unidadesVistas.size} unidad(es)${rango}`)
  }
  if (porTipo.has('ver_interior')) partes.push('recorrió un interior')
  if (porTipo.has('ver_vista')) partes.push('miró la vista desde la ventana')
  if (porTipo.has('favorito')) partes.push('guardó favoritos')
  if (porTipo.has('comparar')) partes.push('comparó unidades')
  if (simuloAlcanza === true) partes.push('simuló su cuota y le alcanza')
  else if (simuloAlcanza === false) partes.push('simuló su cuota pero está ajustada a su ingreso')
  if (porTipo.has('iniciar_separacion')) partes.push('inició la separación de una unidad')
  if (porTipo.has('agendar')) partes.push('agendó una visita')
  return partes.length ? partes.join(', ') : 'aún no interactuó con unidades específicas'
}

function unidadInteresDe(lead: Lead, unidades: Record<string, Unidad>): ContextoUnidad | null {
  const u = lead.unidad_interes_id ? unidades[lead.unidad_interes_id] : null
  if (!u) return null
  return { id: u.id, piso: u.piso, tipologia: u.tipologia_id, precio: u.precio }
}

function precalificacionTexto(lead: Lead): string {
  const p = lead.precalificacion as { veredicto?: string; resumen?: string; bono_recomendado?: number } | null
  if (!p) return 'no se precalificó todavía'
  const bono = p.bono_recomendado ? ` (bono referencial ${soles(p.bono_recomendado)})` : ''
  return `veredicto ${p.veredicto ?? 'desconocido'}${bono}`
}

/** Plantilla determinista: mismo contenido que generaría el modelo, sin depender de red. */
function resumenPlantilla(lead: Lead, eventos: Evento[], unidades: Record<string, Unidad>): ResumenLead {
  const familia = lead.num_familia ? `Familia de ${lead.num_familia}` : 'Visitante'
  const ingreso = lead.ingreso_familiar ? `, ingreso declarado ${soles(lead.ingreso_familiar)}` : ''
  const actividad = eventosResumen(eventos, unidades)
  const precal = precalificacionTexto(lead)
  const unidad = unidadInteresDe(lead, unidades)
  const unidadTxt = unidad ? ` Unidad de interés: ${unidad.id} (piso ${unidad.piso}), ${soles(unidad.precio)}.` : ''

  const resumen =
    `${familia}${ingreso}. Precalificación: ${precal}. Actividad en el showroom: ${actividad}.${unidadTxt}`

  let siguiente_accion: string
  const v = (lead.precalificacion as { veredicto?: string } | null)?.veredicto
  if (v === 'alta' || lead.score >= 70) {
    siguiente_accion = 'Llamar hoy y ofrecer una visita a la caseta o videollamada para cerrar la separación.'
  } else if (v === 'media' || lead.score >= 40) {
    siguiente_accion = 'Contactar por WhatsApp para resolver dudas de financiamiento y ofrecer agendar una visita.'
  } else {
    siguiente_accion = 'Enviar información general del proyecto y hacer seguimiento en unos días.'
  }

  const nombre = lead.nombre?.split(' ')[0] || 'estimado(a)'
  const asesor = config.asesor.nombre
  const mensaje_whatsapp =
    `Hola ${nombre}, soy ${asesor} de ${lead.distrito ? 'tu zona de interés' : 'la constructora'}. ` +
    `Vi que ${unidad ? `te interesó el depa ${unidad.id}` : 'estuviste explorando el proyecto'}. ` +
    `¿Te ayudo a resolver dudas de financiamiento o coordinamos una visita a la caseta?`

  return { resumen, siguiente_accion, mensaje_whatsapp, origen: 'plantilla' }
}

/**
 * Genera el resumen de un lead para el asesor: quién es, qué vio, qué le alcanza y la
 * siguiente mejor acción, más un mensaje de WhatsApp listo para enviar. Usa OpenAI si
 * hay key configurada; si no, o si la llamada falla, cae a una plantilla determinista.
 */
export async function resumirLead(lead: Lead, eventos: Evento[], unidades: Record<string, Unidad>): Promise<ResumenLead> {
  const cli = getCliente()
  if (!cli) return resumenPlantilla(lead, eventos, unidades)

  try {
    const unidad = unidadInteresDe(lead, unidades)
    const input = {
      nombre: lead.nombre,
      distrito: lead.distrito,
      ingreso_familiar: lead.ingreso_familiar,
      ahorro: lead.ahorro,
      tiene_vivienda: lead.tiene_vivienda,
      num_familia: lead.num_familia,
      score: lead.score,
      score_detalle: lead.score_detalle,
      precalificacion: lead.precalificacion,
      unidad_interes: unidad,
      actividad: eventosResumen(eventos, unidades),
      total_eventos: eventos.length,
    }

    const respuesta = await cli.chat.completions.create({
      model: config.openai.modelo,
      messages: [
        {
          role: 'system',
          content:
            'Eres un asistente para un asesor comercial de vivienda social en Lima Norte (Perú). ' +
            'Con los datos de un lead (visitante de un showroom 3D), escribe un resumen breve y accionable ' +
            'para el asesor. Tono cercano, profesional, en español de Perú. Nunca prometas un bono como ' +
            'confirmado: usa siempre la palabra "referencial" o "estimado". No inventes datos que no te dieron. ' +
            'El mensaje de WhatsApp debe ser corto (2-3 frases), cercano, y terminar invitando a coordinar ' +
            'una llamada o visita, sin sonar a spam.',
        },
        { role: 'user', content: JSON.stringify(input) },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'resumen_lead',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              resumen: { type: 'string' },
              siguiente_accion: { type: 'string' },
              mensaje_whatsapp: { type: 'string' },
            },
            required: ['resumen', 'siguiente_accion', 'mensaje_whatsapp'],
            additionalProperties: false,
          },
        },
      },
    })

    const contenido = respuesta.choices[0]?.message?.content
    if (!contenido) throw new Error('respuesta vacía de OpenAI')
    const json = JSON.parse(contenido) as { resumen: string; siguiente_accion: string; mensaje_whatsapp: string }
    return { ...json, origen: 'openai' }
  } catch (err) {
    console.warn('[ia] resumirLead: fallback a plantilla', err)
    return resumenPlantilla(lead, eventos, unidades)
  }
}

/** Persiste resumen + siguiente acción en `leads`. */
export async function guardarResumen(leadId: string, r: ResumenLead): Promise<void> {
  if (!supabaseDisponible) return
  const { error } = await supabase
    .from('leads')
    .update({ resumen_ia: r.resumen, siguiente_accion: r.siguiente_accion })
    .eq('id', leadId)
  if (error) console.warn('[ia] guardarResumen', error.message)
}

// ---------------------------------------------------------------------------
// Chat de consultas
// ---------------------------------------------------------------------------

export interface MensajeChat {
  rol: 'usuario' | 'asistente'
  texto: string
}

export interface ContextoConsulta {
  unidadSeleccionada?: Unidad | null
  sesion?: string
}

function contarPorEstado(unidades: Record<string, Unidad>): Record<string, number> {
  const c: Record<string, number> = { disponible: 0, separado: 0, vendido: 0, bloqueado: 0 }
  for (const u of Object.values(unidades)) c[u.estado] = (c[u.estado] ?? 0) + 1
  return c
}

function rangoPreciosPorTipologia(edificio: Edificio, unidades: Record<string, Unidad>) {
  const rangos: Record<string, { min: number; max: number; label: string; area: number; dorm: number }> = {}
  for (const t of edificio.tipologias) {
    const precios = Object.values(unidades).filter(u => u.tipologia_id === t.id).map(u => u.precio)
    if (precios.length === 0) continue
    rangos[t.id] = { min: Math.min(...precios), max: Math.max(...precios), label: t.nombre, area: t.area_m2, dorm: t.dormitorios }
  }
  return rangos
}

function contextoProyectoTexto(edificio: Edificio, unidades: Record<string, Unidad>): string {
  const rangos = rangoPreciosPorTipologia(edificio, unidades)
  const estados = contarPorEstado(unidades)
  const tipologiasTxt = Object.values(rangos)
    .map(r => `${r.label} (${r.area} m², ${r.dorm} dorm): ${soles(r.min)} – ${soles(r.max)}`)
    .join('; ')
  return (
    `Proyecto: ${edificio.proyecto.nombre}, ${edificio.proyecto.distrito}. ${edificio.proyecto.descripcion} ` +
    `Entrega estimada: ${edificio.proyecto.entrega_estimada}. Tipologías y rango de precio por piso/orientación: ${tipologiasTxt}. ` +
    `Unidades disponibles ahora: ${estados.disponible} de ${Object.keys(unidades).length}. ` +
    `Bonos referenciales: ${(config.programas as { nombre: string; bono?: number }[]).map(p => p.nombre).join(', ')}.`
  )
}

/** Preguntas frecuentes por palabra clave, con datos reales del edificio (sin IA). */
function respuestaPorReglas(pregunta: string, edificio: Edificio, unidades: Record<string, Unidad>, unidadSel?: Unidad | null): string {
  const q = pregunta.toLowerCase()
  const rangos = rangoPreciosPorTipologia(edificio, unidades)
  const estados = contarPorEstado(unidades)
  const lista = Object.values(unidades)
  const disponibles = lista.filter(u => u.estado === 'disponible')

  const contiene = (...palabras: string[]) => palabras.some(p => q.includes(p))

  // Tipología mencionada por número de dormitorios ("1 dorm", "dos dormitorios", "tres habitaciones")
  const numDorm = (() => {
    const m = q.match(/(\d)\s*(dorm|hab)/)
    if (m) return Number(m[1])
    if (/\b(un|uno|una)\s+(dorm|hab)/.test(q)) return 1
    if (/\bdos\s+(dorm|hab)/.test(q)) return 2
    if (/\btres\s+(dorm|hab)/.test(q)) return 3
    return null
  })()
  const tipoDorm = numDorm !== null ? edificio.tipologias.find(t => t.dormitorios === numDorm) : undefined
  const rangoDorm = tipoDorm ? rangos[tipoDorm.id] : undefined
  const describeTipo = (t: (typeof edificio.tipologias)[number]) => {
    const r = rangos[t.id]
    const disp = disponibles.filter(u => u.tipologia_id === t.id).length
    return `${t.dormitorios} dorm (${t.area_m2} m²)${r ? ` desde ${soles(r.min)} hasta ${soles(r.max)}` : ''}, ${disp} disponibles`
  }

  // Vista / orientación (antes que "quedan/disponibles" para no responder genérico)
  const vistas: { clave: string[]; vista: Unidad['vista']; texto: string }[] = [
    { clave: ['parque'], vista: 'parque', texto: 'al parque (norte)' },
    { clave: ['avenida'], vista: 'avenida', texto: 'a la avenida (sur)' },
    { clave: ['ciudad'], vista: 'ciudad', texto: 'a la ciudad (este)' },
    { clave: ['cerro'], vista: 'cerros', texto: 'a los cerros (oeste)' },
  ]
  const vistaPedida = vistas.find(v => contiene(...v.clave))
  if (vistaPedida) {
    const conVista = disponibles.filter(u => u.vista === vistaPedida.vista && (!tipoDorm || u.tipologia_id === tipoDorm.id))
    if (conVista.length === 0) return `Por ahora no quedan departamentos disponibles con vista ${vistaPedida.texto}. Puedes revisar las otras orientaciones en el visor.`
    const ordenados = [...conVista].sort((a, b) => a.precio - b.precio)
    const ejemplos = ordenados.slice(0, 3).map(u => `${u.id} (piso ${u.piso}, ${soles(u.precio)})`).join(', ')
    return (
      `Quedan ${conVista.length} departamentos disponibles con vista ${vistaPedida.texto}` +
      `${tipoDorm ? ` de ${tipoDorm.dormitorios} dorm` : ''}, desde ${soles(ordenados[0].precio)}. ` +
      `Por ejemplo: ${ejemplos}. Haz clic en cualquiera en el edificio para ver su ficha.`
    )
  }
  if (contiene('vista')) {
    if (unidadSel) {
      const v = vistas.find(x => x.vista === unidadSel.vista)
      return `La unidad ${unidadSel.id} tiene vista ${v?.texto ?? unidadSel.vista}. Usa "Ver la vista" en su ficha para asomarte por la ventana.`
    }
    return `Hay vista al parque (norte), a la avenida (sur), a la ciudad (este) y a los cerros (oeste). La vista al parque suele tener una prima de precio.`
  }

  if (contiene('cuota', 'mensualidad', 'financiamiento', 'crédito', 'credito', 'al mes')) {
    const r = rangoDorm ?? Object.values(rangos).sort((a, b) => a.min - b.min)[0]
    const cuota = r ? cuotaRapida(r.min) : null
    return (
      `${r ? `Un depa de ${r.dorm} dorm desde ${soles(r.min)}` : 'Un depa'} tendría una cuota referencial de ` +
      `${cuota ? soles(Math.round(cuota)) : '—'} al mes (10% de inicial, 20 años, sin bono). ` +
      `Con un bono la cuota baja bastante: usa "Simular cuota" en la ficha para ver tu número exacto.`
    )
  }

  if (contiene('bono', 'techo propio', 'mivivienda', 'buen pagador', 'subsidio')) {
    const programas = (config.programas as { nombre: string }[]).map(p => p.nombre).join(' y ')
    return (
      `Este proyecto podría calificar para ${programas}, con bonos referenciales que dependen de tu ingreso, ahorro y si ya tienes vivienda. ` +
      `No están confirmados hasta que la entidad financiera evalúe tu caso. ¿Quieres usar "¿Califico al bono?" para revisar tu perfil?`
    )
  }

  if (tipoDorm) {
    return `Los departamentos de ${describeTipo(tipoDorm)}. El precio sube con la altura del piso y con la vista al parque. Filtra "${tipoDorm.dormitorios} dorm" en el visor para verlos.`
  }

  if (contiene('precio', 'cuesta', 'cuánto', 'cuanto', 'vale', 'costo', 'dormitorio', 'dorm', 'habitacion', 'habitación', 'tipologia', 'tipología')) {
    if (unidadSel && contiene('este', 'esta', 'ese')) {
      return `El depa ${unidadSel.id} cuesta ${soles(unidadSel.precio)}, con una cuota referencial de ${soles(Math.round(cuotaRapida(unidadSel.precio)))} al mes. Usa "Simular cuota" para tu caso.`
    }
    const tipos = [...edificio.tipologias].sort((a, b) => a.dormitorios - b.dormitorios).map(describeTipo).join('; ')
    return `Tenemos tres tipologías: ${tipos}. El precio sube con la altura del piso y con la vista al parque.`
  }

  if (contiene('entrega', 'entregan', 'fecha', 'mudar')) {
    return `La entrega estimada del proyecto es ${edificio.proyecto.entrega_estimada}. Es una fecha referencial sujeta al avance de obra.`
  }

  if (contiene('ubicacion', 'ubicación', 'donde', 'dónde', 'direccion', 'dirección', 'distrito', 'queda')) {
    return `El proyecto está en ${edificio.proyecto.distrito}, ${edificio.proyecto.meta?.direccion ?? ''}. ${edificio.proyecto.descripcion}`.trim()
  }

  if (contiene('estacionamiento', 'cochera', 'auto')) {
    return `La disponibilidad de estacionamientos varía según la unidad; pregúntale al asesor por el departamento que te interesa y te confirma si incluye cochera.`
  }

  if (contiene('area comun', 'área común', 'areas comunes', 'áreas comunes', 'lobby', 'local', 'gimnasio', 'piscina')) {
    return `El primer piso tiene lobby y locales comerciales, además de áreas verdes en el condominio. No incluimos gimnasio ni piscina en este proyecto.`
  }

  if (contiene('disponible', 'quedan', 'separado', 'vendido')) {
    return `Ahora mismo hay ${estados.disponible} departamentos disponibles de ${Object.keys(unidades).length} en total (${estados.separado} separados y ${estados.vendido} vendidos). El estado cambia en vivo mientras otras familias separan unidades.`
  }

  if (contiene('piso', 'planta', 'altura')) {
    return `El edificio tiene ${edificio.layout.pisos} pisos, 8 departamentos por piso. Los precios suben ligeramente con la altura del piso.`
  }

  if (contiene('separar', 'reservar', 'reserva')) {
    return `Puedes separar un departamento desde su ficha con el botón "Separar este depa": queda bloqueado para ti y un asesor te contacta para los siguientes pasos.`
  }

  if (contiene('visita', 'cita', 'agendar', 'ver en persona')) {
    return `Puedes agendar una visita a la caseta o una videollamada desde la ficha de cualquier departamento con "Agenda tu visita".`
  }

  return '__sin_match__'
}

/** Respuesta de reglas cuando no hay match de palabra clave: invita a dejar datos. */
function respuestaSinMatch(): string {
  return 'No tengo esa información a la mano. Un asesor puede resolverte esa duda directamente — ¿quieres dejar tus datos para que te contacten?'
}

/**
 * Responde una pregunta libre sobre el proyecto. Usa OpenAI con contexto del edificio si
 * hay key; si no, responde con reglas por palabra clave usando datos reales. Cada consulta
 * se registra en `consultas` y genera un evento `consulta`.
 */
export async function responderConsulta(
  pregunta: string,
  historial: MensajeChat[],
  edificio: Edificio,
  unidades: Record<string, Unidad>,
  contexto: ContextoConsulta = {},
): Promise<{ texto: string; origen: 'openai' | 'plantilla' }> {
  const cli = getCliente()
  let texto: string
  let origen: 'openai' | 'plantilla'

  if (cli) {
    try {
      const sistema =
        `Eres el asistente virtual de un showroom 3D inmobiliario en Perú. Responde en español, en máximo 4 frases. ` +
        `No inventes datos que no estén en el contexto. No confirmes nunca un bono como aprobado (usa "referencial"/"estimado"). ` +
        `Si aplica, sugiere usar "Simular cuota" o "¿Califico al bono?". Contexto del proyecto: ${contextoProyectoTexto(edificio, unidades)}` +
        (contexto.unidadSeleccionada
          ? ` Unidad que el visitante está viendo ahora: ${contexto.unidadSeleccionada.id}, piso ${contexto.unidadSeleccionada.piso}, ${soles(contexto.unidadSeleccionada.precio)}, vista ${contexto.unidadSeleccionada.vista}.`
          : '')

      const respuesta = await cli.chat.completions.create({
        model: config.openai.modelo_chat,
        messages: [
          { role: 'system', content: sistema },
          ...historial.slice(-6).map(m => ({ role: m.rol === 'usuario' ? ('user' as const) : ('assistant' as const), content: m.texto })),
          { role: 'user', content: pregunta },
        ],
      })
      texto = respuesta.choices[0]?.message?.content?.trim() || respuestaSinMatch()
      origen = 'openai'
    } catch (err) {
      console.warn('[ia] responderConsulta: fallback a reglas', err)
      const r = respuestaPorReglas(pregunta, edificio, unidades, contexto.unidadSeleccionada)
      texto = r === '__sin_match__' ? respuestaSinMatch() : r
      origen = 'plantilla'
    }
  } else {
    const r = respuestaPorReglas(pregunta, edificio, unidades, contexto.unidadSeleccionada)
    texto = r === '__sin_match__' ? respuestaSinMatch() : r
    origen = 'plantilla'
  }

  await registrarConsulta(pregunta, texto, origen, contexto)
  return { texto, origen }
}

async function registrarConsulta(pregunta: string, respuesta: string, origen: 'openai' | 'plantilla', contexto: ContextoConsulta) {
  track('consulta', contexto.unidadSeleccionada?.id ?? null, { pregunta })
  if (!supabaseDisponible) return
  const { error } = await supabase.from('consultas').insert({
    sesion_id: contexto.sesion ?? getSesionId(),
    pregunta,
    respuesta,
    fuente: origen === 'openai' ? 'ia' : 'plantilla',
  })
  if (error) console.warn('[ia] registrarConsulta', error.message)
}
