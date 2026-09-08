import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { ETAPAS, ETAPA_COLOR, ETAPA_LABEL, useLeads } from './datos'
import { tiempoRelativo, unidadLabel } from './formato'
import Kpis from './Kpis'
import type { Lead, Tipologia, Unidad } from '../lib/types'

function csvCampo(valor: unknown): string {
  const s = valor == null ? '' : String(valor)
  return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function exportarLeadsCsv(leads: Lead[], unidades: Record<string, Unidad>, tipologias: Tipologia[]) {
  const encabezado = ['nombre', 'telefono', 'email', 'distrito', 'ingreso', 'ahorro', 'veredicto', 'score', 'etapa', 'unidad', 'fecha']
  const filas = leads.map(l => {
    const u = l.unidad_interes_id ? unidades[l.unidad_interes_id] : undefined
    const t = u ? tipologias.find(x => x.id === u.tipologia_id) : undefined
    const veredicto = ((l.precalificacion as unknown) as { veredicto?: string } | null)?.veredicto ?? ''
    return [
      l.nombre,
      l.telefono ?? '',
      l.email ?? '',
      l.distrito ?? '',
      l.ingreso_familiar ?? '',
      l.ahorro ?? '',
      veredicto,
      l.score,
      l.etapa,
      u ? unidadLabel(u, t) : '',
      l.created_at,
    ]
  })
  const csv = [encabezado, ...filas].map(fila => fila.map(csvCampo).join(',')).join('\r\n')
  // BOM UTF-8 para que Excel reconozca tildes correctamente.
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

interface Precalificacion {
  veredicto?: string
}

function ScoreBar({ score }: { score: number }) {
  const color = score < 40 ? 'bg-red-500' : score < 70 ? 'bg-amber-500' : 'bg-emerald-500'
  return (
    <div className="flex items-center gap-2 w-28">
      <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${Math.min(100, Math.max(0, score))}%` }} />
      </div>
      <span className="text-xs font-semibold text-slate-600 w-6 text-right">{score}</span>
    </div>
  )
}

export default function Leads() {
  const { leads, cargando, nuevoId } = useLeads()
  const unidades = useStore(s => s.unidades)
  const tipologias = useStore(s => s.edificio.tipologias)
  const navigate = useNavigate()
  const [etapa, setEtapa] = useState('')
  const [busqueda, setBusqueda] = useState('')

  const unidadDe = (lead: Lead) => {
    if (!lead.unidad_interes_id) return '—'
    const u = unidades[lead.unidad_interes_id]
    const t = u ? tipologias.find(x => x.id === u.tipologia_id) : undefined
    return unidadLabel(u, t)
  }

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return leads.filter(l => {
      if (etapa && l.etapa !== etapa) return false
      if (q && !(l.nombre.toLowerCase().includes(q) || (l.telefono ?? '').includes(q))) return false
      return true
    })
  }, [leads, etapa, busqueda])

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Leads</h1>
          <p className="text-sm text-slate-500">Visitantes que dejaron sus datos, ordenados por score.</p>
        </div>
        <button
          onClick={() => exportarLeadsCsv(filtrados, unidades, tipologias)}
          disabled={filtrados.length === 0}
          className="rounded-lg bg-slate-900 text-white text-sm font-semibold px-3 py-2 disabled:bg-slate-300 shrink-0"
        >
          Exportar CSV
        </button>
      </div>

      <Kpis />

      <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-3">
        <div className="flex flex-wrap gap-2 items-center">
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o teléfono..."
            className="flex-1 min-w-[180px] rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
          <select
            value={etapa}
            onChange={e => setEtapa(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">Todas las etapas</option>
            {ETAPAS.map(e => (
              <option key={e} value={e}>
                {ETAPA_LABEL[e]}
              </option>
            ))}
          </select>
        </div>

        {cargando ? (
          <div className="py-10 text-center text-sm text-slate-400">Cargando leads...</div>
        ) : filtrados.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-400">No hay leads con estos filtros.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-separate border-spacing-y-1">
              <thead>
                <tr className="text-left text-xs text-slate-400">
                  <th className="px-3 py-2">Lead</th>
                  <th className="px-3 py-2">Etapa</th>
                  <th className="px-3 py-2">Score</th>
                  <th className="px-3 py-2">Unidad de interés</th>
                  <th className="px-3 py-2">Precalificación</th>
                  <th className="px-3 py-2">Distrito</th>
                  <th className="px-3 py-2">Última actividad</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map(lead => {
                  const veredicto = ((lead.precalificacion as unknown) as Precalificacion | null)?.veredicto
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => navigate(`/panel/leads/${lead.id}`)}
                      className={`bg-slate-50 hover:bg-slate-100 cursor-pointer transition ${
                        lead.id === nuevoId ? 'animate-pulse ring-2 ring-emerald-400' : ''
                      }`}
                    >
                      <td className="px-3 py-2 rounded-l-xl">
                        <div className="font-semibold text-slate-800">{lead.nombre}</div>
                        <div className="text-xs text-slate-400">{lead.telefono ?? 'sin teléfono'}</div>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${ETAPA_COLOR[lead.etapa] ?? 'bg-slate-100 text-slate-600'}`}>
                          {ETAPA_LABEL[lead.etapa] ?? lead.etapa}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <ScoreBar score={lead.score} />
                      </td>
                      <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{unidadDe(lead)}</td>
                      <td className="px-3 py-2 text-slate-600 capitalize">{veredicto ?? '—'}</td>
                      <td className="px-3 py-2 text-slate-600">{lead.distrito ?? '—'}</td>
                      <td className="px-3 py-2 rounded-r-xl text-slate-400 whitespace-nowrap">{tiempoRelativo(lead.updated_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
