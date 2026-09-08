import { supabase, supabaseDisponible } from './supabase'
import { getLeadId, setLeadId, getSesionId, esRevisita } from './tracking'
import { calcularScore, etapaPorScore, telefonoValido, normalizarTelefono } from './scoring'
import type { Lead, Evento } from './types'
import type { PrecalificacionInput, PrecalificacionResultado } from './precalificacion'

const KEY_LEAD_LOCAL = 'showroom.lead_local'
const KEY_SIMULACION = 'showroom.simulacion'
const KEY_PRECALIFICACION = 'showroom.precalificacion'

/** Combina el input declarado por el usuario y el resultado de precalificar(). */
export interface PrecalificacionLocal {
  input: PrecalificacionInput
  resultado: PrecalificacionResultado
  /** Distrito declarado en el formulario de precalificación (no forma parte del cálculo). */
  distrito?: string
}

export interface DatosLead {
  nombre: string
  telefono: string
  email?: string | null
  ingreso_familiar?: number | null
  ahorro?: number | null
  tiene_vivienda?: boolean | null
  num_familia?: number | null
  distrito?: string | null
  consentimiento: true
  precalificacion?: PrecalificacionResultado | null
  unidad_interes_id?: string | null
}

/** Etapas que un asesor ya gestionó manualmente: el score nunca las hace retroceder. */
const RANGO_ETAPA: Record<string, number> = {
  nuevo: 0,
  contactar: 1,
  calificado: 2,
  contactado: 3,
  separado: 4,
  descartado: 4,
}

function leerLocal<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function guardarLocal(key: string, valor: unknown) {
  try { localStorage.setItem(key, JSON.stringify(valor)) } catch { /* almacenamiento bloqueado */ }
}

export function guardarSimulacionLocal(sim: unknown) {
  guardarLocal(KEY_SIMULACION, sim)
}
export function leerSimulacionLocal<T = unknown>(): T | null {
  return leerLocal<T>(KEY_SIMULACION)
}

export function guardarPrecalificacionLocal(p: PrecalificacionLocal) {
  guardarLocal(KEY_PRECALIFICACION, p)
}
export function leerPrecalificacionLocal(): PrecalificacionLocal | null {
  return leerLocal<PrecalificacionLocal>(KEY_PRECALIFICACION)
}

/** Trae el lead actual (por getLeadId()) desde Supabase, o desde localStorage si no hay backend. */
export async function leadActual(): Promise<Lead | null> {
  const id = getLeadId()
  if (!id) return null

  if (!supabaseDisponible) {
    return leerLocal<Lead>(KEY_LEAD_LOCAL)
  }

  const { data, error } = await supabase.from('leads').select('*').eq('id', id).maybeSingle()
  if (error) {
    console.warn('[leads]', error.message)
    return null
  }
  return (data as Lead) ?? null
}

/**
 * Crea o actualiza el lead de la sesión actual. Enlaza la sesión, hace backfill del
 * historial de eventos anónimo y recalcula el score. Si no hay Supabase disponible,
 * degrada a localStorage para que la UI de la demo no se rompa.
 */
export async function guardarLead(datos: DatosLead): Promise<Lead> {
  const leadIdPrevio = getLeadId()

  if (!supabaseDisponible) {
    const existente = leerLocal<Lead>(KEY_LEAD_LOCAL)
    const ahora = new Date().toISOString()
    const lead: Lead = {
      id: leadIdPrevio || existente?.id || `local-${crypto.randomUUID()}`,
      sesion_id: getSesionId(),
      nombre: datos.nombre,
      telefono: telefonoValido(datos.telefono) ? normalizarTelefono(datos.telefono) : datos.telefono,
      email: datos.email ?? existente?.email ?? null,
      ingreso_familiar: datos.ingreso_familiar ?? existente?.ingreso_familiar ?? null,
      ahorro: datos.ahorro ?? existente?.ahorro ?? null,
      tiene_vivienda: datos.tiene_vivienda ?? existente?.tiene_vivienda ?? null,
      num_familia: datos.num_familia ?? existente?.num_familia ?? null,
      distrito: datos.distrito ?? existente?.distrito ?? null,
      consentimiento: true,
      precalificacion: (datos.precalificacion as unknown as Record<string, unknown>) ?? existente?.precalificacion ?? null,
      score: existente?.score ?? 0,
      score_detalle: existente?.score_detalle ?? [],
      resumen_ia: existente?.resumen_ia ?? null,
      siguiente_accion: existente?.siguiente_accion ?? null,
      etapa: existente?.etapa ?? 'nuevo',
      unidad_interes_id: datos.unidad_interes_id ?? existente?.unidad_interes_id ?? null,
      created_at: existente?.created_at ?? ahora,
      updated_at: ahora,
    }
    guardarLocal(KEY_LEAD_LOCAL, lead)
    setLeadId(lead.id)
    return lead
  }

  const payload = {
    nombre: datos.nombre,
    telefono: telefonoValido(datos.telefono) ? normalizarTelefono(datos.telefono) : datos.telefono,
    email: datos.email ?? null,
    ingreso_familiar: datos.ingreso_familiar ?? null,
    ahorro: datos.ahorro ?? null,
    tiene_vivienda: datos.tiene_vivienda ?? null,
    num_familia: datos.num_familia ?? null,
    distrito: datos.distrito ?? null,
    consentimiento: true,
    precalificacion: datos.precalificacion ?? null,
    unidad_interes_id: datos.unidad_interes_id ?? null,
  }

  let lead: Lead
  if (leadIdPrevio) {
    const { data, error } = await supabase.from('leads').update(payload).eq('id', leadIdPrevio).select().single()
    if (error) throw error
    lead = data as Lead
  } else {
    const { data, error } = await supabase
      .from('leads')
      .insert({ ...payload, sesion_id: getSesionId() })
      .select()
      .single()
    if (error) throw error
    lead = data as Lead
    setLeadId(lead.id)
  }

  const sesionId = getSesionId()
  await supabase.from('sesiones').update({ lead_id: lead.id }).eq('id', sesionId)
  // Backfill: el historial anónimo de esta sesión pasa a contar para el score del lead.
  await supabase.from('eventos').update({ lead_id: lead.id }).eq('sesion_id', sesionId).is('lead_id', null)
  await supabase.from('favoritos').update({ lead_id: lead.id }).eq('sesion_id', sesionId).is('lead_id', null)

  await recalcularScore(lead.id)
  const actualizado = await leadActual()
  return actualizado ?? lead
}

/**
 * Recalcula score/etapa de un lead a partir de sus eventos (por lead_id o por la sesión
 * actual, para no perder señal si el backfill aún no corrió). Nunca hace retroceder una
 * etapa ya gestionada manualmente (contactado/separado/descartado).
 */
export async function recalcularScore(leadId: string): Promise<void> {
  if (!supabaseDisponible) return

  const { data: leadRow, error: errLead } = await supabase.from('leads').select('*').eq('id', leadId).maybeSingle()
  if (errLead || !leadRow) {
    if (errLead) console.warn('[leads]', errLead.message)
    return
  }
  const lead = leadRow as Lead

  const eventos: Evento[] = []
  const vistos = new Set<number>()

  const { data: porLead } = await supabase.from('eventos').select('*').eq('lead_id', leadId).order('created_at', { ascending: true })
  for (const e of (porLead as Evento[] | null) ?? []) {
    if (!vistos.has(e.id)) { vistos.add(e.id); eventos.push(e) }
  }

  const sesionId = lead.sesion_id ?? getSesionId()
  const { data: porSesion } = await supabase.from('eventos').select('*').eq('sesion_id', sesionId).order('created_at', { ascending: true })
  for (const e of (porSesion as Evento[] | null) ?? []) {
    if (!vistos.has(e.id)) { vistos.add(e.id); eventos.push(e) }
  }

  const precal = (lead.precalificacion as unknown as PrecalificacionResultado | null) ?? null
  const { score, detalle } = calcularScore({
    eventos,
    precalificacion: precal,
    telefonoValido: telefonoValido(lead.telefono),
    revisita: esRevisita(),
  })

  const etapaCalculada = etapaPorScore(score)
  const etapaActual = lead.etapa || 'nuevo'
  const etapa = (RANGO_ETAPA[etapaCalculada] ?? 0) > (RANGO_ETAPA[etapaActual] ?? 0) ? etapaCalculada : etapaActual

  const { error } = await supabase.from('leads').update({ score, score_detalle: detalle, etapa }).eq('id', leadId)
  if (error) console.warn('[leads]', error.message)
}
