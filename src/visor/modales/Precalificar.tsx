import { useState } from 'react'
import { useStore } from '../../store'
import { soles } from '../../lib/types'
import { precalificar, type PrecalificacionResultado } from '../../lib/precalificacion'
import { track } from '../../lib/tracking'
import { guardarPrecalificacionLocal } from '../../lib/leads'
import { useUI } from '../ui'

const DISTRITOS_LIMA_NORTE = [
  'Comas', 'Carabayllo', 'Puente Piedra', 'Los Olivos', 'San Martín de Porres', 'Independencia', 'Ancón', 'Otro',
]

const VEREDICTO_UI: Record<PrecalificacionResultado['veredicto'], { label: string; clases: string }> = {
  alta: { label: 'Probabilidad alta', clases: 'bg-emerald-600 text-white' },
  media: { label: 'Probabilidad media', clases: 'bg-amber-400 text-slate-900' },
  baja: { label: 'Probabilidad baja', clases: 'bg-slate-300 text-slate-800' },
}

export default function Precalificar() {
  const seleccion = useStore(s => s.seleccion)
  const unidad = useStore(s => (seleccion ? s.unidades[seleccion] : null))
  const abrir = useUI(s => s.abrir)

  const [ingreso, setIngreso] = useState<number | ''>('')
  const [ahorro, setAhorro] = useState<number | ''>('')
  const [tieneVivienda, setTieneVivienda] = useState<boolean | null>(null)
  const [numFamilia, setNumFamilia] = useState<number | ''>('')
  const [distrito, setDistrito] = useState('')
  const [resultado, setResultado] = useState<PrecalificacionResultado | null>(null)

  if (!unidad) {
    return <p className="text-slate-600 text-sm">Primero selecciona un departamento en el edificio para calcular tu precalificación.</p>
  }

  const formValido = ingreso !== '' && ahorro !== '' && tieneVivienda !== null

  const calcular = () => {
    if (!formValido) return
    const input = { ingreso: Number(ingreso), ahorro: Number(ahorro), tieneVivienda: Boolean(tieneVivienda), precio: unidad.precio, numFamilia: numFamilia === '' ? undefined : Number(numFamilia) }
    const r = precalificar(input)
    setResultado(r)
    track('precalificar', unidad.id, { veredicto: r.veredicto, bono_recomendado: r.bono_recomendado })
    guardarPrecalificacionLocal({ input, resultado: r, distrito: distrito || undefined })
  }

  if (resultado) {
    const v = VEREDICTO_UI[resultado.veredicto]
    return (
      <div className="space-y-3">
        <div className={`rounded-xl px-3 py-2.5 text-sm font-bold text-center ${v.clases}`}>{v.label}</div>
        <p className="text-sm text-slate-700">{resultado.resumen}</p>

        <div className="space-y-2">
          {resultado.programas.map(p => (
            <div key={p.id} className={`border rounded-xl p-3 ${p.elegible ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center justify-between">
                <div className="font-semibold text-sm text-slate-900">{p.elegible ? '✅' : '❌'} {p.nombre}</div>
                {p.elegible && <div className="text-sm font-bold text-emerald-700">{soles(p.bono_estimado)}</div>}
              </div>
              <ul className="mt-1.5 space-y-0.5 text-xs text-slate-600">
                {p.motivos.map((m, i) => <li key={i}>· {m}</li>)}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-[10px] text-slate-400">Cálculo referencial; la entidad financiera confirma el resultado final.</div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button onClick={() => abrir('simulador')} className="bg-emerald-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-emerald-500">Simular con este bono</button>
          <button onClick={() => abrir('lead')} className="bg-amber-400 text-slate-900 text-sm font-bold py-2.5 rounded-xl hover:bg-amber-300">Guardar y que me contacten</button>
        </div>
        <button onClick={() => setResultado(null)} className="w-full text-xs text-slate-500 underline pt-1">Volver a calcular</button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">Para {unidad.id} · {soles(unidad.precio)}. Todo lo declarado aquí es referencial.</p>

      <div>
        <label className="text-xs font-semibold text-slate-700 mb-1 block">Ingreso familiar mensual (S/)</label>
        <input type="number" inputMode="numeric" min={0} value={ingreso} onChange={e => setIngreso(e.target.value === '' ? '' : Number(e.target.value))}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Ej. 3200" />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-700 mb-1 block">Ahorro disponible (S/)</label>
        <input type="number" inputMode="numeric" min={0} value={ahorro} onChange={e => setAhorro(e.target.value === '' ? '' : Number(e.target.value))}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Ej. 8000" />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-700 mb-1 block">¿Tienes vivienda propia?</label>
        <div className="flex gap-2">
          <button onClick={() => setTieneVivienda(false)} className={`flex-1 py-2 rounded-lg text-sm font-semibold border ${tieneVivienda === false ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-200 text-slate-700'}`}>No</button>
          <button onClick={() => setTieneVivienda(true)} className={`flex-1 py-2 rounded-lg text-sm font-semibold border ${tieneVivienda === true ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-200 text-slate-700'}`}>Sí</button>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-700 mb-1 block">Personas en tu familia</label>
        <input type="number" inputMode="numeric" min={1} value={numFamilia} onChange={e => setNumFamilia(e.target.value === '' ? '' : Number(e.target.value))}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Ej. 4" />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-700 mb-1 block">Distrito donde vives</label>
        <select value={distrito} onChange={e => setDistrito(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white">
          <option value="">Selecciona...</option>
          {DISTRITOS_LIMA_NORTE.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <button disabled={!formValido} onClick={calcular} className="w-full bg-emerald-600 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl hover:bg-emerald-500 disabled:cursor-not-allowed">
        Ver si califico
      </button>
    </div>
  )
}
