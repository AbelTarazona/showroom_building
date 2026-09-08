import { useEffect, useState } from 'react'
import { useStore } from '../../store'
import { useUI } from '../ui'
import { getLeadId } from '../../lib/tracking'
import { leadActual } from '../../lib/leads'
import { crearCita } from '../../lib/citas'
import { linkWhatsapp } from '../../lib/seguimientos'
import type { Lead as LeadType } from '../../lib/types'
import config from '../../data/config.json'
import { DatosLeadMinimos } from './Lead'

type TipoCita = 'visita' | 'llamada' | 'videollamada'
type Paso = 'cargando' | 'datos' | 'form' | 'agendando' | 'exito' | 'error'

const TIPOS: { id: TipoCita; label: string; icono: string }[] = [
  { id: 'visita', label: 'Visita a la caseta', icono: '🏠' },
  { id: 'llamada', label: 'Llamada', icono: '📞' },
  { id: 'videollamada', label: 'Videollamada', icono: '🎥' },
]

const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const HORAS = Array.from({ length: 10 }, (_, i) => 9 + i) // 9..18

function proximosDias(n: number): Date[] {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(hoy)
    d.setDate(hoy.getDate() + i)
    return d
  })
}

function etiquetaDia(d: Date, i: number): string {
  const base = `${DIAS[d.getDay()]} ${d.getDate()}`
  if (i === 0) return `Hoy ${base}`
  if (i === 1) return `Mañana ${base}`
  return base
}

function formateaFechaLarga(d: Date, hora: number): string {
  return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}, ${hora}:00`
}

export default function Agendar() {
  const seleccion = useStore(s => s.seleccion)
  const unidad = useStore(s => (seleccion ? s.unidades[seleccion] : null))
  const tip = useStore(s => (seleccion ? s.edificio.tipologias.find(t => t.id === s.unidades[seleccion]?.tipologia_id) : null))
  const cerrar = useUI(s => s.cerrar)
  const notificar = useUI(s => s.notificar)

  const [paso, setPaso] = useState<Paso>('cargando')
  const [lead, setLead] = useState<LeadType | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [tipo, setTipo] = useState<TipoCita>('visita')
  const [diaIdx, setDiaIdx] = useState(0)
  const [hora, setHora] = useState<number | null>(null)
  const [notas, setNotas] = useState('')
  const [citaFecha, setCitaFecha] = useState<{ dia: Date; hora: number } | null>(null)

  const dias = proximosDias(7)

  useEffect(() => {
    let activo = true
    const id = getLeadId()
    if (!id) { setPaso('datos'); return }
    leadActual().then(l => {
      if (!activo) return
      if (l) { setLead(l); setPaso('form') }
      else setPaso('datos')
    })
    return () => { activo = false }
  }, [])

  const onDatosListos = (l: LeadType) => {
    setLead(l)
    setPaso('form')
  }

  const confirmar = async () => {
    if (!lead || hora === null) return
    const dia = dias[diaIdx]
    const fecha = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(), hora, 0, 0)
    setPaso('agendando')
    setError(null)
    try {
      await crearCita({
        lead_id: lead.id,
        unidad_id: unidad?.id ?? null,
        tipo,
        fecha: fecha.toISOString(),
        notas: notas.trim() || null,
      })
      setCitaFecha({ dia, hora })
      notificar('Cita agendada')
      setPaso('exito')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'No se pudo agendar. Intenta de nuevo.'
      setError(msg)
      setPaso('error')
    }
  }

  if (paso === 'cargando') {
    return <p className="text-slate-500 text-sm">Cargando...</p>
  }

  if (paso === 'datos') {
    return <DatosLeadMinimos unidadId={unidad?.id ?? null} onListo={onDatosListos} />
  }

  if (paso === 'error') {
    return (
      <div className="space-y-3">
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-800">{error}</div>
        <button onClick={() => setPaso('form')} className="w-full bg-slate-900 text-white font-semibold py-2.5 rounded-xl">Reintentar</button>
      </div>
    )
  }

  if (paso === 'exito' && citaFecha) {
    const tipoLabel = TIPOS.find(t => t.id === tipo)?.label ?? tipo
    const asesor = config.asesor
    const mensaje = `Hola ${asesor.nombre}, confirmo mi cita de ${tipoLabel.toLowerCase()}${unidad ? ` por el depa ${unidad.id}` : ''} el ${formateaFechaLarga(citaFecha.dia, citaFecha.hora)}.`
    return (
      <div className="space-y-3 text-center">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-800">
          <div className="text-2xl mb-1">📅</div>
          <div className="font-bold">¡Cita agendada!</div>
          <div className="text-xs mt-1">{tipoLabel} · {formateaFechaLarga(citaFecha.dia, citaFecha.hora)}</div>
          {unidad && <div className="text-xs">Depa {unidad.id}</div>}
        </div>
        <a
          href={linkWhatsapp(asesor.telefono, mensaje)}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full bg-emerald-600 text-white font-semibold py-2.5 rounded-xl hover:bg-emerald-500"
        >
          Agregar recordatorio por WhatsApp
        </a>
        <button onClick={cerrar} className="w-full text-sm font-semibold text-slate-700 underline py-1">Listo</button>
      </div>
    )
  }

  // paso === 'form' | 'agendando'
  return (
    <div className="space-y-4">
      {unidad && tip && (
        <div className="bg-slate-50 rounded-xl p-3 text-sm">
          <span className="font-bold text-slate-900">Depa {unidad.id}</span>
          <span className="text-slate-500"> · {tip.nombre} · Piso {unidad.piso}</span>
        </div>
      )}

      <div>
        <div className="text-xs font-semibold text-slate-700 mb-1.5">Tipo de cita</div>
        <div className="grid grid-cols-3 gap-2">
          {TIPOS.map(t => (
            <button
              key={t.id}
              onClick={() => setTipo(t.id)}
              className={`text-xs font-semibold py-2 rounded-lg border ${tipo === t.id ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-700'}`}
            >
              <div>{t.icono}</div>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold text-slate-700 mb-1.5">Día</div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {dias.map((d, i) => (
            <button
              key={i}
              onClick={() => setDiaIdx(i)}
              className={`shrink-0 text-xs font-semibold px-3 py-2 rounded-lg border whitespace-nowrap ${diaIdx === i ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-700'}`}
            >
              {etiquetaDia(d, i)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold text-slate-700 mb-1.5">Hora</div>
        <div className="grid grid-cols-5 gap-2">
          {HORAS.map(h => (
            <button
              key={h}
              onClick={() => setHora(h)}
              className={`text-xs font-semibold py-2 rounded-lg border ${hora === h ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-200 text-slate-700'}`}
            >
              {h}:00
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-700 mb-1 block">Notas (opcional)</label>
        <textarea
          value={notas}
          onChange={e => setNotas(e.target.value)}
          rows={2}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          placeholder="Ej. Vamos en familia, preferimos por la tarde."
        />
      </div>

      <button
        onClick={confirmar}
        disabled={hora === null || paso === 'agendando'}
        className="w-full bg-amber-400 disabled:bg-slate-300 text-slate-900 font-bold py-3 rounded-xl hover:bg-amber-300 disabled:cursor-not-allowed"
      >
        {paso === 'agendando' ? 'Agendando...' : 'Confirmar cita'}
      </button>
    </div>
  )
}
