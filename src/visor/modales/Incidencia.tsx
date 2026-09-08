// Fase 7: modal 'incidencia' — reporte postventa (filtración, acabados, instalaciones, etc.).
import { useEffect, useState } from 'react'
import { useStore } from '../../store'
import { supabase, supabaseDisponible } from '../../lib/supabase'
import { leadActual } from '../../lib/leads'
import { useUI } from '../ui'
import type { Lead } from '../../lib/types'
import { DatosLeadMinimos } from './Lead'

const CATEGORIAS = [
  { id: 'filtracion', label: 'Filtración' },
  { id: 'acabados', label: 'Acabados' },
  { id: 'instalaciones', label: 'Instalaciones' },
  { id: 'areas_comunes', label: 'Áreas comunes' },
  { id: 'otro', label: 'Otro' },
]

export default function Incidencia() {
  const seleccion = useStore(s => s.seleccion)
  const cerrar = useUI(s => s.cerrar)
  const notificar = useUI(s => s.notificar)

  const [lead, setLead] = useState<Lead | null>(null)
  const [cargandoLead, setCargandoLead] = useState(true)
  const [categoria, setCategoria] = useState(CATEGORIAS[0].id)
  const [unidadId, setUnidadId] = useState(seleccion ?? '')
  const [descripcion, setDescripcion] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  useEffect(() => {
    let activo = true
    leadActual().then(l => {
      if (activo) {
        setLead(l)
        setCargandoLead(false)
      }
    })
    return () => {
      activo = false
    }
  }, [])

  async function enviar() {
    if (!descripcion.trim()) {
      notificar('Describe brevemente la incidencia')
      return
    }
    setEnviando(true)
    try {
      if (!supabaseDisponible) {
        setEnviado(true)
        return
      }
      // El formulario solo llega hasta aquí cuando ya hay `lead` (ver render de abajo):
      // si no había uno, primero se captura con DatosLeadMinimos.
      const { error } = await supabase.from('incidencias').insert({
        lead_id: lead?.id ?? null,
        unidad_id: unidadId || null,
        categoria,
        descripcion: descripcion.trim(),
      })
      if (error) throw error
      setEnviado(true)
      notificar('Incidencia registrada. Un asesor la revisará pronto.')
    } catch (e) {
      console.warn('[incidencia]', e)
      notificar('No se pudo registrar la incidencia. Intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  if (enviado) {
    return (
      <div className="space-y-3 text-center py-4">
        <div className="text-3xl">✅</div>
        <p className="text-sm text-slate-700 font-semibold">Incidencia registrada</p>
        <p className="text-xs text-slate-500">Un asesor de postventa la revisará y te contactará.</p>
        <button onClick={cerrar} className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold">
          Cerrar
        </button>
      </div>
    )
  }

  if (cargandoLead) {
    return <p className="text-sm text-slate-400">Cargando...</p>
  }

  if (!lead) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-slate-500">
          Para registrar una incidencia postventa necesitamos tus datos de contacto.
        </p>
        <DatosLeadMinimos unidadId={unidadId || null} onListo={l => setLead(l)} />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        Reportando como <span className="font-semibold text-slate-700">{lead.nombre}</span>
        {lead.telefono ? ` · ${lead.telefono}` : ''}
      </p>

      <div>
        <label className="text-xs font-semibold text-slate-700 mb-1 block">Categoría</label>
        <select
          value={categoria}
          onChange={e => setCategoria(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
        >
          {CATEGORIAS.map(c => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-700 mb-1 block">Unidad (opcional)</label>
        <input
          value={unidadId}
          onChange={e => setUnidadId(e.target.value.toUpperCase())}
          placeholder="Ej. P07-N2"
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-700 mb-1 block">Descripción</label>
        <textarea
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          rows={4}
          placeholder="Cuéntanos qué pasó..."
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <button
        onClick={() => void enviar()}
        disabled={enviando}
        className="w-full bg-amber-400 disabled:bg-slate-300 text-slate-900 font-bold py-3 rounded-xl hover:bg-amber-300"
      >
        {enviando ? 'Enviando...' : 'Enviar reporte'}
      </button>
    </div>
  )
}
