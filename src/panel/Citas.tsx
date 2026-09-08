import { useMemo } from 'react'
import { useStore } from '../store'
import { actualizarCita, useCitas, useLeadsPorId } from './datos'
import { esHoy, esManana, formatoFecha, formatoHora, unidadLabel } from './formato'
import type { Cita } from '../lib/types'

const ESTADO_CITA_LABEL: Record<string, string> = {
  programada: 'Programada',
  confirmada: 'Confirmada',
  realizada: 'Realizada',
  cancelada: 'Cancelada',
}
const ESTADO_CITA_COLOR: Record<string, string> = {
  programada: 'bg-sky-100 text-sky-700',
  confirmada: 'bg-emerald-100 text-emerald-700',
  realizada: 'bg-slate-200 text-slate-600',
  cancelada: 'bg-red-100 text-red-700',
}

function grupoDe(fechaIso: string): string {
  if (esHoy(fechaIso)) return 'Hoy'
  if (esManana(fechaIso)) return 'Mañana'
  return formatoFecha(fechaIso)
}

export default function Citas() {
  const { citas, cargando } = useCitas()
  const leadsPorId = useLeadsPorId()
  const unidades = useStore(s => s.unidades)
  const tipologias = useStore(s => s.edificio.tipologias)

  function labelUnidad(id: string | null) {
    if (!id) return '—'
    const u = unidades[id]
    const t = u ? tipologias.find(x => x.id === u.tipologia_id) : undefined
    return unidadLabel(u, t)
  }

  const grupos = useMemo(() => {
    const m = new Map<string, Cita[]>()
    for (const c of citas) {
      const g = grupoDe(c.fecha)
      if (!m.has(g)) m.set(g, [])
      m.get(g)!.push(c)
    }
    return m
  }, [citas])

  if (cargando) return <div className="p-6 text-sm text-slate-400">Cargando citas...</div>

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold">Citas</h1>
        <p className="text-sm text-slate-500">Visitas, llamadas y videollamadas agendadas.</p>
      </div>

      {citas.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-sm text-slate-400">No hay citas agendadas.</div>
      )}

      {[...grupos.entries()].map(([grupo, items]) => (
        <div key={grupo} className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-slate-500">{grupo}</h2>
          <div className="bg-white rounded-2xl shadow-sm divide-y divide-slate-100">
            {items.map(c => {
              const lead = leadsPorId[c.lead_id]
              return (
                <div key={c.id} className="p-4 flex flex-wrap items-center gap-3 justify-between">
                  <div className="min-w-[160px]">
                    <div className="font-semibold text-slate-800">{lead?.nombre ?? 'Lead'}</div>
                    <div className="text-xs text-slate-400">
                      {lead?.telefono ?? 'sin teléfono'} · {labelUnidad(c.unidad_id)}
                    </div>
                  </div>
                  <div className="text-sm text-slate-600 whitespace-nowrap">
                    {formatoHora(c.fecha)} · <span className="capitalize">{c.tipo}</span>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${ESTADO_CITA_COLOR[c.estado] ?? 'bg-slate-100 text-slate-600'}`}>
                    {ESTADO_CITA_LABEL[c.estado] ?? c.estado}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => void actualizarCita(c.id, 'confirmada')}
                      className="rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium px-2.5 py-1.5 hover:bg-emerald-100"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => void actualizarCita(c.id, 'realizada')}
                      className="rounded-lg bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1.5 hover:bg-slate-200"
                    >
                      Realizada
                    </button>
                    <button
                      onClick={() => void actualizarCita(c.id, 'cancelada')}
                      className="rounded-lg bg-red-50 text-red-600 text-xs font-medium px-2.5 py-1.5 hover:bg-red-100"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
