import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../store'
import { useUI } from '../ui'
import { getLeadId } from '../../lib/tracking'
import { leadActual } from '../../lib/leads'
import { separarUnidad } from '../../lib/separacion'
import { programarSeguimientos } from '../../lib/seguimientos'
import { cuotaRapida } from '../../lib/finanzas'
import { soles } from '../../lib/types'
import type { Lead as LeadType } from '../../lib/types'
import { DatosLeadMinimos } from './Lead'

type Paso = 'cargando' | 'datos' | 'confirmar' | 'separando' | 'exito' | 'error'

export default function Separar() {
  const seleccion = useStore(s => s.seleccion)
  const unidad = useStore(s => (seleccion ? s.unidades[seleccion] : null))
  const tip = useStore(s => (seleccion ? s.edificio.tipologias.find(t => t.id === s.unidades[seleccion]?.tipologia_id) : null))
  const abrir = useUI(s => s.abrir)
  const cerrar = useUI(s => s.cerrar)
  const setFiltros = useStore(s => s.setFiltros)

  const [paso, setPaso] = useState<Paso>('cargando')
  const [lead, setLead] = useState<LeadType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const confirmado = useRef(false)

  useEffect(() => {
    let activo = true
    const id = getLeadId()
    if (!id) { setPaso('datos'); return }
    leadActual().then(l => {
      if (!activo) return
      if (l) { setLead(l); setPaso('confirmar') }
      else setPaso('datos')
    })
    return () => { activo = false }
  }, [])

  // Si el usuario cierra el modal sin confirmar y ya había un lead, se programa el
  // recordatorio de abandono de separación.
  useEffect(() => {
    return () => {
      if (!confirmado.current && lead) {
        void programarSeguimientos(lead, { unidad, motivo: 'abandono_separacion' })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead])

  if (!unidad || !tip) {
    return <p className="text-slate-600 text-sm">No hay una unidad seleccionada.</p>
  }

  const cuota = cuotaRapida(unidad.precio)

  const onDatosListos = (l: LeadType) => {
    setLead(l)
    setPaso('confirmar')
  }

  const confirmar = async () => {
    if (!lead) return
    setPaso('separando')
    setError(null)
    try {
      await separarUnidad(unidad.id, lead.id)
      confirmado.current = true
      setPaso('exito')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo completar la separación.'
      setError(msg)
      setPaso('error')
    }
  }

  const verOtras = () => {
    cerrar()
    setFiltros({ soloDisponibles: true })
  }

  if (paso === 'cargando') {
    return <p className="text-slate-500 text-sm">Cargando...</p>
  }

  if (paso === 'error') {
    const esNoDisponible = error?.includes('ya no está disponible')
    return (
      <div className="space-y-3">
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-800">{error}</div>
        {esNoDisponible ? (
          <button onClick={verOtras} className="w-full bg-slate-900 text-white font-semibold py-2.5 rounded-xl">Ver otras unidades disponibles</button>
        ) : (
          <button onClick={() => setPaso('confirmar')} className="w-full bg-slate-900 text-white font-semibold py-2.5 rounded-xl">Reintentar</button>
        )}
      </div>
    )
  }

  if (paso === 'exito') {
    return (
      <div className="space-y-3 text-center">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-800">
          <div className="text-2xl mb-1">🎉</div>
          <div className="font-bold">¡Depa {unidad.id} separado a tu nombre!</div>
          <div className="text-xs mt-1">Un asesor te confirmará en 24 h.</div>
        </div>
        <button onClick={() => abrir('agendar')} className="w-full bg-amber-400 text-slate-900 font-bold py-3 rounded-xl hover:bg-amber-300">
          Agendar visita a la caseta
        </button>
        <button onClick={cerrar} className="w-full text-sm font-semibold text-slate-700 underline py-1">Listo</button>
      </div>
    )
  }

  if (paso === 'datos') {
    return <DatosLeadMinimos unidadId={unidad.id} onListo={onDatosListos} />
  }

  // paso === 'confirmar' | 'separando'
  return (
    <div className="space-y-3">
      <div className="bg-slate-50 rounded-xl p-4">
        <div className="font-bold text-slate-900">Depa {unidad.id}</div>
        <div className="text-sm text-slate-600">{tip.nombre} · Piso {unidad.piso}</div>
        <div className="mt-2 flex items-end justify-between">
          <div className="text-xl font-extrabold text-slate-900">{soles(unidad.precio)}</div>
          <div className="text-xs text-slate-500">desde <span className="font-semibold text-slate-700">{soles(cuota)}</span>/mes*</div>
        </div>
      </div>
      {lead && (
        <div className="text-xs text-slate-500">A nombre de <span className="font-semibold text-slate-700">{lead.nombre}</span>.</div>
      )}
      <p className="text-xs text-slate-500 bg-amber-50 border border-amber-200 rounded-lg p-3">
        Separar no tiene costo en esta demo; un asesor te confirmará en 24 h.
      </p>
      <button
        onClick={confirmar}
        disabled={paso === 'separando'}
        className="w-full bg-amber-400 disabled:bg-slate-300 text-slate-900 font-bold py-3 rounded-xl hover:bg-amber-300 disabled:cursor-not-allowed"
      >
        {paso === 'separando' ? 'Separando...' : 'Confirmar separación'}
      </button>
    </div>
  )
}
