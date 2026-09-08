// Fase 7: importar/exportar el cuadro de unidades como CSV, sin librerías externas.
// Formato esperado: encabezado obligatorio `id,estado,precio` (acepta `;` o `,` como separador).
// Columnas no reconocidas se ignoran; una fila puede omitir `estado` o `precio` (queda vacío).
import { supabase } from '../lib/supabase'
import type { Estado, Unidad } from '../lib/types'

export const ESTADOS_VALIDOS: Estado[] = ['disponible', 'separado', 'vendido', 'bloqueado']

export interface FilaCsv {
  id: string
  estado?: Estado
  precio?: number
}

export interface DiferenciaUnidad {
  id: string
  existe: boolean
  estadoActual?: Estado
  estadoNuevo?: Estado
  precioActual?: number
  precioNuevo?: number
  cambia: boolean
}

function detectarSeparador(linea: string): string {
  return linea.includes(';') && !linea.includes(',') ? ';' : ','
}

/** Parser simple de una línea CSV (sin comillas embebidas, suficiente para id/estado/precio). */
function partirLinea(linea: string, sep: string): string[] {
  return linea.split(sep).map(c => c.trim().replace(/^"|"$/g, ''))
}

export interface ResultadoParseoCsv {
  filas: FilaCsv[]
  errores: string[]
}

/** Parsea el texto de un CSV de unidades. Encabezado obligatorio con al menos la columna `id`. */
export function parsearCsvUnidades(texto: string): ResultadoParseoCsv {
  const lineas = texto.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0)
  const errores: string[] = []
  if (lineas.length === 0) return { filas: [], errores: ['El archivo está vacío.'] }

  const sep = detectarSeparador(lineas[0])
  const encabezado = partirLinea(lineas[0], sep).map(h => h.toLowerCase())
  const idxId = encabezado.indexOf('id')
  const idxEstado = encabezado.indexOf('estado')
  const idxPrecio = encabezado.indexOf('precio')

  if (idxId === -1) {
    return { filas: [], errores: ['El encabezado debe incluir la columna "id" (ej. id,estado,precio).'] }
  }

  const filas: FilaCsv[] = []
  for (let i = 1; i < lineas.length; i++) {
    const cols = partirLinea(lineas[i], sep)
    const id = cols[idxId]?.trim().toUpperCase()
    if (!id) {
      errores.push(`Fila ${i + 1}: sin id, se ignora.`)
      continue
    }
    const fila: FilaCsv = { id }

    if (idxEstado !== -1 && cols[idxEstado]) {
      const estado = cols[idxEstado].trim().toLowerCase() as Estado
      if (!ESTADOS_VALIDOS.includes(estado)) {
        errores.push(`Fila ${i + 1} (${id}): estado "${cols[idxEstado]}" no reconocido, se ignora esa columna.`)
      } else {
        fila.estado = estado
      }
    }

    if (idxPrecio !== -1 && cols[idxPrecio]) {
      const precio = Number(cols[idxPrecio].replace(/[^\d.-]/g, ''))
      if (!Number.isFinite(precio) || precio <= 0) {
        errores.push(`Fila ${i + 1} (${id}): precio "${cols[idxPrecio]}" inválido, se ignora esa columna.`)
      } else {
        fila.precio = precio
      }
    }

    filas.push(fila)
  }

  return { filas, errores }
}

/** Compara las filas del CSV contra el inventario actual para mostrar una vista previa de cambios. */
export function calcularDiferencias(filas: FilaCsv[], unidades: Record<string, Unidad>): DiferenciaUnidad[] {
  return filas.map(f => {
    const actual = unidades[f.id]
    const estadoNuevo = f.estado ?? actual?.estado
    const precioNuevo = f.precio ?? actual?.precio
    const cambia = !actual || estadoNuevo !== actual.estado || precioNuevo !== actual.precio
    return {
      id: f.id,
      existe: Boolean(actual),
      estadoActual: actual?.estado,
      estadoNuevo,
      precioActual: actual?.precio,
      precioNuevo,
      cambia,
    }
  })
}

/**
 * Aplica los cambios a Supabase. La tabla `unidades` tiene varias columnas NOT NULL sin
 * default (proyecto_id, tipologia_id, piso, posicion, orientacion, vista), así que un
 * `upsert` con solo id/estado/precio falla la restricción NOT NULL al construir la fila a
 * insertar (Postgres la valida antes de resolver el conflicto). El import es solo para
 * unidades ya existentes, así que actualizamos por id en vez de upsertear.
 */
export async function aplicarCambiosCsv(filas: FilaCsv[]): Promise<{ ok: number; error: string | null }> {
  const filasConCambio = filas.filter(f => f.estado !== undefined || f.precio !== undefined)
  if (filasConCambio.length === 0) return { ok: 0, error: null }

  let ok = 0
  const errores: string[] = []
  for (const f of filasConCambio) {
    const cambios: { estado?: Estado; precio?: number } = {}
    if (f.estado !== undefined) cambios.estado = f.estado
    if (f.precio !== undefined) cambios.precio = f.precio
    const { error } = await supabase.from('unidades').update(cambios).eq('id', f.id)
    if (error) errores.push(`${f.id}: ${error.message}`)
    else ok++
  }

  return { ok, error: errores.length > 0 ? errores.join(' · ') : null }
}

/** Genera el CSV de plantilla con el inventario actual (para editar y volver a importar). */
export function generarPlantillaCsv(unidades: Unidad[]): string {
  const encabezado = 'id,estado,precio'
  const filas = unidades
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(u => `${u.id},${u.estado},${Math.round(u.precio)}`)
  return '﻿' + [encabezado, ...filas].join('\r\n')
}

export function descargarTexto(nombre: string, contenido: string, tipo = 'text/csv;charset=utf-8;') {
  const blob = new Blob([contenido], { type: tipo })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
