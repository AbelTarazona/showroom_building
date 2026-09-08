// Fase 7: panel de incidencias postventa. Ruta /panel/incidencias.
import { useEffect, useMemo, useState } from 'react'
import { supabase, supabaseDisponible } from '../lib/supabase'
import { tiempoRelativo } from './formato'
import { useLeadsPorId } from './datos'

interface Incidencia {
  id: string
  lead_id: string | null
  unidad_id: string | null
  categoria: string
  descripcion: string
  estado: string
  created_at: string
}

const CATEGORIA_LABEL: Record<string, string> = {
  filtracion: 'Filtración',
  acabados: 'Acabados',
  instalaciones: 'Instalaciones',
  areas_comunes: 'Áreas comunes',
  otro: 'Otro',
}

const ESTADOS: { id: string; label: string; clases: string }[] = [
  { id: 'abierta', label: 'Abierta', clases: 'bg-rose-100 text-rose-700' },
  { id: 'en_proceso', label: 'En proceso', clases: 'bg-amber-100 text-amber-700' },
  { id: 'resuelta', label: 'Resuelta', clases: 'bg-emerald-100 text-emerald-700' },
]

function estadoUi(estado: string) {
  return ESTADOS.find(e => e.id === estado) ?? { id: estado, label: estado, clases: 'bg-slate-100 text-slate-600' }
}

function useIncidencias() {
  const [incidencias, setIncidencias] = useState<Incidencia[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let activo = true
    async function cargar() {
      const { data, error } = await supabase.from('incidencias').select('*').order('created_at', { ascending: false })
      if (error) console.warn('[incidencias]', error.message)
      if (activo) {
        setIncidencias((data as Incidencia[]) ?? [])
        setCargando(false)
      }
    }
    void cargar()
    if (!supabaseDisponible) return () => { activo = false }
    const canal = supabase
      .channel('panel-incidencias')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidencias' }, () => void cargar())
      .subscribe()
    return () => {
      activo = false
      void supabase.removeChannel(canal)
    }
  }, [])

  return { incidencias, cargando, setIncidencias }
}

async function cambiarEstado(id: string, estado: string) {
  const { error } = await supabase.from('incidencias').update({ estado }).eq('id', id)
  if (error) console.warn('[incidencias]', error.message)
}

export default function Incidencias() {
  const { incidencias, cargando } = useIncidencias()
  const leadsPorId = useLeadsPorId()
  const [categoria, setCategoria] = useState('')

  const filtradas = useMemo(
    () => (categoria ? incidencias.filter(i => i.categoria === categoria) : incidencias),
    [incidencias, categoria],
  )

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold">Incidencias</h1>
        <p className="text-sm text-slate-500">Reportes postventa de familias que ya viven o separaron su unidad.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-3">
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={categoria}
            onChange={e => setCategoria(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Todas las categorías</option>
            {Object.entries(CATEGORIA_LABEL).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {cargando ? (
          <div className="py-10 text-center text-sm text-slate-400">Cargando incidencias...</div>
        ) : filtradas.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400">No hay incidencias registradas.</div>
        ) : (
          <ul className="flex flex-col gap-2">
            {filtradas.map(inc => {
              const lead = inc.lead_id ? leadsPorId[inc.lead_id] : undefined
              return (
                <li key={inc.id} className="rounded-xl bg-slate-50 p-3 flex flex-col gap-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold rounded-full bg-slate-200 text-slate-700 px-2 py-0.5">
                        {CATEGORIA_LABEL[inc.categoria] ?? inc.categoria}
                      </span>
                      {inc.unidad_id && <span className="text-xs text-slate-500">{inc.unidad_id}</span>}
                    </div>
                    <span className="text-xs text-slate-400">{tiempoRelativo(inc.created_at)}</span>
                  </div>
                  <p className="text-sm text-slate-700">{inc.descripcion}</p>
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
                    <span className="text-xs text-slate-500">
                      {lead ? `${lead.nombre}${lead.telefono ? ` · ${lead.telefono}` : ''}` : 'Sin lead asociado'}
                    </span>
                    <select
                      value={inc.estado}
                      onChange={e => void cambiarEstado(inc.id, e.target.value)}
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold border-0 ${estadoUi(inc.estado).clases}`}
                    >
                      {ESTADOS.map(e => (
                        <option key={e.id} value={e.id}>
                          {e.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
