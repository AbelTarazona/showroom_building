import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../../store'
import { soles } from '../../lib/types'
import { simular, type Simulacion } from '../../lib/finanzas'
import { track } from '../../lib/tracking'
import { leadActual, leerPrecalificacionLocal, guardarSimulacionLocal, leerSimulacionLocal } from '../../lib/leads'
import { useUI } from '../ui'
import config from '../../data/config.json'

const f = config.financiamiento

interface SemaforoInfo {
  label: string
  clases: string
}

function semaforo(ratio: number | null): SemaforoInfo | null {
  if (ratio === null) return null
  if (ratio <= f.ratio_cuota_ingreso_max) return { label: '✅ Te alcanza', clases: 'bg-emerald-50 text-emerald-700 border-emerald-300' }
  if (ratio <= 0.45) return { label: '⚠️ Ajustado', clases: 'bg-amber-50 text-amber-700 border-amber-300' }
  return { label: '✕ No alcanza', clases: 'bg-rose-50 text-rose-700 border-rose-300' }
}

export default function Simulador() {
  const seleccion = useStore(s => s.seleccion)
  const unidad = useStore(s => (seleccion ? s.unidades[seleccion] : null))
  const abrir = useUI(s => s.abrir)

  const precalLocal = leerPrecalificacionLocal()
  const simLocal = leerSimulacionLocal<{ ingreso?: number | null; cuotaInicialPct?: number; plazoAnios?: number; aplicarBono?: boolean }>()
  const bonoDisponible = precalLocal?.resultado?.bono_recomendado ?? 0

  const [cuotaInicialPct, setCuotaInicialPct] = useState(simLocal?.cuotaInicialPct ?? f.cuota_inicial_default_pct)
  const [plazoAnios, setPlazoAnios] = useState(simLocal?.plazoAnios ?? f.plazo_default_anios)
  const [ingreso, setIngreso] = useState<number | ''>(
    simLocal?.ingreso ?? precalLocal?.input?.ingreso ?? '',
  )
  const [aplicarBono, setAplicarBono] = useState(bonoDisponible > 0 ? (simLocal?.aplicarBono ?? true) : false)

  useEffect(() => {
    // Si no había ingreso guardado, intenta prellenar desde el lead ya capturado.
    if (ingreso !== '') return
    let activo = true
    leadActual().then(lead => {
      if (activo && lead?.ingreso_familiar) setIngreso(lead.ingreso_familiar)
    })
    return () => { activo = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sim: Simulacion | null = useMemo(() => {
    if (!unidad) return null
    return simular({
      precio: unidad.precio,
      bono: aplicarBono ? bonoDisponible : 0,
      cuotaInicialPct,
      plazoAnios,
      ingreso: ingreso === '' ? null : ingreso,
    })
  }, [unidad, aplicarBono, bonoDisponible, cuotaInicialPct, plazoAnios, ingreso])

  const simRef = useRef(sim)
  useEffect(() => { simRef.current = sim }, [sim])

  // Una simulación se registra una sola vez por firma (StrictMode y cierres repetidos no duplican).
  const ultimaFirma = useRef<string | null>(null)
  const registrar = (s: Simulacion) => {
    if (!unidad) return
    const datos = { cuota: s.cuota, plazo: s.plazoAnios, inicial_pct: cuotaInicialPct, ingreso: ingreso === '' ? null : ingreso, bono: s.bono, alcanza: s.alcanza }
    const firma = `${unidad.id}|${JSON.stringify(datos)}`
    if (firma === ultimaFirma.current) return
    ultimaFirma.current = firma
    track('simular_cuota', unidad.id, datos)
    guardarSimulacionLocal({ ...datos, unidadId: unidad.id, cuotaInicialPct, plazoAnios, aplicarBono })
  }

  // Debounce: registra el evento 600ms después del último cambio.
  useEffect(() => {
    if (!sim) return
    const t = setTimeout(() => registrar(sim), 600)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cuotaInicialPct, plazoAnios, ingreso, aplicarBono])

  // Al cerrar el modal, registra el último estado si quedó pendiente (solo si el usuario tocó algo).
  const tocado = useRef(false)
  useEffect(() => { tocado.current = true }, [cuotaInicialPct, plazoAnios, ingreso, aplicarBono])
  useEffect(() => {
    tocado.current = false
    return () => {
      if (tocado.current && simRef.current) registrar(simRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!unidad || !sim) {
    return <p className="text-slate-600 text-sm">Primero selecciona un departamento en el edificio para simular su cuota.</p>
  }

  const sem = semaforo(sim.ratio)
  const minPct = f.cuota_inicial_min_pct
  const maxPct = 0.4

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-600">Depa <span className="font-semibold text-slate-900">{unidad.id}</span> · {soles(unidad.precio)}</div>

      <div>
        <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
          <span>Cuota inicial</span>
          <span>{Math.round(cuotaInicialPct * 100)}% · {soles(unidad.precio * cuotaInicialPct)}</span>
        </div>
        <input
          type="range"
          min={minPct}
          max={maxPct}
          step={0.025}
          value={cuotaInicialPct}
          onChange={e => setCuotaInicialPct(Number(e.target.value))}
          className="w-full accent-emerald-600"
        />
      </div>

      <div>
        <div className="text-xs font-semibold text-slate-700 mb-1">Plazo</div>
        <div className="flex gap-2">
          {f.plazos_anios.map(p => (
            <button
              key={p}
              onClick={() => setPlazoAnios(p)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold border ${plazoAnios === p ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-200 text-slate-700'}`}
            >
              {p} años
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-700 mb-1 block">Ingreso familiar mensual (S/)</label>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          placeholder="Ej. 3500"
          value={ingreso}
          onChange={e => setIngreso(e.target.value === '' ? '' : Number(e.target.value))}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {bonoDisponible > 0 && (
        <label className="flex items-center gap-2 text-sm text-slate-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          <input type="checkbox" checked={aplicarBono} onChange={e => setAplicarBono(e.target.checked)} className="accent-emerald-600" />
          Aplicar bono referencial de {soles(bonoDisponible)}
        </label>
      )}

      <div className="bg-slate-900 text-white rounded-xl p-4 text-center">
        <div className="text-[10px] uppercase tracking-wide text-slate-300">Cuota mensual estimada</div>
        <div className="text-3xl font-extrabold">{soles(sim.cuota)}</div>
        {sem && <div className={`inline-block mt-2 text-xs font-semibold border rounded-full px-3 py-1 ${sem.clases}`}>{sem.label}</div>}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
        <div className="bg-slate-50 rounded-lg p-2"><div className="text-slate-400">Inicial</div><div className="font-semibold text-slate-900">{soles(sim.cuotaInicial)}</div></div>
        <div className="bg-slate-50 rounded-lg p-2"><div className="text-slate-400">Financiado</div><div className="font-semibold text-slate-900">{soles(sim.financiado)}</div></div>
        <div className="bg-slate-50 rounded-lg p-2"><div className="text-slate-400">TEA</div><div className="font-semibold text-slate-900">{(sim.tea * 100).toFixed(1)}%</div></div>
        <div className="bg-slate-50 rounded-lg p-2"><div className="text-slate-400">Bono aplicado</div><div className="font-semibold text-slate-900">{soles(sim.bono)}</div></div>
      </div>

      <div className="text-[10px] text-slate-400">*Cifras referenciales según config del proyecto. No sustituyen la evaluación del banco.</div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <button onClick={() => abrir('precalificar')} className="bg-slate-100 text-slate-800 text-sm font-semibold py-2.5 rounded-xl hover:bg-slate-200">¿Califico a un bono?</button>
        <button onClick={() => abrir('lead')} className="bg-amber-400 text-slate-900 text-sm font-bold py-2.5 rounded-xl hover:bg-amber-300">Quiero que me contacten</button>
      </div>
    </div>
  )
}
