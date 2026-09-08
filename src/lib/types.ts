export type Estado = 'disponible' | 'separado' | 'vendido' | 'bloqueado'
export type Orientacion = 'norte' | 'sur' | 'este' | 'oeste'
export type Vista = 'parque' | 'avenida' | 'ciudad' | 'cerros'

export interface Proyecto {
  id: string
  nombre: string
  distrito: string
  descripcion: string
  entrega_estimada: string
  meta: Record<string, string>
}

export interface Tipologia {
  id: string
  codigo: string
  nombre: string
  dormitorios: number
  banos: number
  area_m2: number
  precio_base: number
}

export interface Unidad {
  id: string
  piso: number
  posicion: string
  tipologia_id: string
  orientacion: Orientacion
  vista: Vista
  precio: number
  estado: Estado
  /** centro de la caja en metros (y = base del piso) */
  x: number
  y: number
  z: number
  lead_separacion_id?: string | null
}

export interface Layout {
  slot: number
  pisos: number
  alturaPiso: number
  alturaBase: number
  nucleo: { x: number; z: number; w: number; d: number }
  posiciones: Record<string, { x: number; z: number; orientacion: Orientacion; vista: Vista; tipologia: string }>
}

export interface Edificio {
  proyecto: Proyecto
  tipologias: Tipologia[]
  layout: Layout
  unidades: Unidad[]
}

export type TipoEvento =
  | 'ver_edificio' | 'ver_piso' | 'ver_unidad' | 'ver_interior' | 'ver_vista'
  | 'simular_cuota' | 'favorito' | 'comparar' | 'compartir' | 'precalificar'
  | 'iniciar_separacion' | 'separar' | 'agendar' | 'abandonar' | 'consulta'

export interface Lead {
  id: string
  sesion_id: string | null
  nombre: string
  telefono: string | null
  email: string | null
  ingreso_familiar: number | null
  ahorro: number | null
  tiene_vivienda: boolean | null
  num_familia: number | null
  distrito: string | null
  consentimiento: boolean
  precalificacion: Record<string, unknown> | null
  score: number
  score_detalle: { regla: string; puntos: number; motivo: string }[]
  resumen_ia: string | null
  siguiente_accion: string | null
  etapa: string
  unidad_interes_id: string | null
  created_at: string
  updated_at: string
}

export interface Evento {
  id: number
  sesion_id: string | null
  lead_id: string | null
  tipo: TipoEvento
  unidad_id: string | null
  payload: Record<string, unknown>
  created_at: string
}

export interface Cita {
  id: string
  lead_id: string
  unidad_id: string | null
  tipo: string
  fecha: string
  estado: string
  notas: string | null
  created_at: string
}

export interface Seguimiento {
  id: string
  lead_id: string
  canal: string
  plantilla: string
  mensaje: string
  programado_para: string
  estado: string
  created_at: string
}

export const ESTADO_LABEL: Record<Estado, string> = {
  disponible: 'Disponible',
  separado: 'Separado',
  vendido: 'Vendido',
  bloqueado: 'No disponible',
}

export const ESTADO_COLOR: Record<Estado, string> = {
  disponible: '#22c55e',
  separado: '#f59e0b',
  vendido: '#64748b',
  bloqueado: '#7c3aed',
}

export const VISTA_LABEL: Record<Vista, string> = {
  parque: 'Vista al parque',
  avenida: 'Vista a la avenida',
  ciudad: 'Vista a la ciudad',
  cerros: 'Vista a los cerros',
}

export const soles = (n: number) =>
  'S/ ' + Math.round(n).toLocaleString('es-PE')
