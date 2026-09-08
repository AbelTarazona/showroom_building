import { useMemo, useRef, useState } from 'react'
import { useStore } from '../store'
import { actualizarEstadoUnidad } from './datos'
import { precioCorto } from './formato'
import { ESTADO_COLOR, ESTADO_LABEL, soles, type Estado, type Tipologia, type Unidad } from '../lib/types'
import {
  aplicarCambiosCsv,
  calcularDiferencias,
  descargarTexto,
  generarPlantillaCsv,
  parsearCsvUnidades,
  type DiferenciaUnidad,
  type FilaCsv,
} from './importarCsv'

const POSICIONES = ['N1', 'N2', 'N3', 'E', 'S3', 'S2', 'S1', 'W']
const ESTADOS: Estado[] = ['disponible', 'separado', 'vendido', 'bloqueado']

function Celda({
  unidad,
  tipologia,
  abierta,
  onToggle,
  onCambiar,
}: {
  unidad: Unidad
  tipologia: Tipologia | undefined
  abierta: boolean
  onToggle: () => void
  onCambiar: (estado: Estado) => void
}) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="w-full rounded-lg p-1.5 text-left text-white text-[10px] leading-tight shadow-sm hover:opacity-90 transition"
        style={{ backgroundColor: ESTADO_COLOR[unidad.estado] }}
      >
        <div className="font-bold">{unidad.posicion}</div>
        <div className="opacity-90">{tipologia?.codigo ?? '?'}</div>
        <div className="opacity-90">{precioCorto(unidad.precio)}</div>
      </button>
      {abierta && (
        <div className="absolute z-30 top-full left-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200 p-2 text-slate-700">
          <div className="text-xs font-semibold mb-1 px-1">{unidad.id}</div>
          <div className="flex flex-col gap-0.5">
            {ESTADOS.map(e => (
              <button
                key={e}
                onClick={() => onCambiar(e)}
                className={`flex items-center text-left text-xs rounded-lg px-2 py-1.5 hover:bg-slate-100 ${
                  unidad.estado === e ? 'font-bold bg-slate-50' : ''
                }`}
              >
                <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: ESTADO_COLOR[e] }} />
                {ESTADO_LABEL[e]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ImportarInventario() {
  const unidades = useStore(s => s.unidades)
  const cargarUnidades = useStore(s => s.cargarUnidades)
  const inputRef = useRef<HTMLInputElement>(null)

  const [filas, setFilas] = useState<FilaCsv[] | null>(null)
  const [diferencias, setDiferencias] = useState<DiferenciaUnidad[] | null>(null)
  const [errores, setErrores] = useState<string[]>([])
  const [aplicando, setAplicando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)

  function descargarPlantilla() {
    const csv = generarPlantillaCsv(Object.values(unidades))
    descargarTexto(`inventario-${new Date().toISOString().slice(0, 10)}.csv`, csv)
  }

  function onArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    setMensaje(null)
    const lector = new FileReader()
    lector.onload = () => {
      const texto = String(lector.result ?? '')
      const { filas: f, errores: errs } = parsearCsvUnidades(texto)
      setFilas(f)
      setErrores(errs)
      setDiferencias(calcularDiferencias(f, unidades))
    }
    lector.readAsText(archivo, 'utf-8')
    e.target.value = ''
  }

  function cancelar() {
    setFilas(null)
    setDiferencias(null)
    setErrores([])
  }

  async function aplicar() {
    if (!filas) return
    setAplicando(true)
    try {
      const { ok, error } = await aplicarCambiosCsv(filas)
      if (error) {
        setMensaje(`Error al aplicar: ${error}`)
      } else {
        setMensaje(`Se actualizaron ${ok} unidad(es).`)
        await cargarUnidades()
        cancelar()
      }
    } finally {
      setAplicando(false)
    }
  }

  const cambios = diferencias?.filter(d => d.cambia) ?? []
  const sinCoincidencia = diferencias?.filter(d => !d.existe) ?? []

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Cuadro de unidades (CSV)</h3>
          <p className="text-xs text-slate-400">Columnas: id, estado, precio. Acepta separador , o ;.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={descargarPlantilla} className="rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-2 hover:bg-slate-200">
            Descargar plantilla
          </button>
          <button
            onClick={() => inputRef.current?.click()}
            className="rounded-lg bg-slate-900 text-white text-xs font-semibold px-3 py-2 hover:bg-slate-800"
          >
            Importar CSV
          </button>
          <input ref={inputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={onArchivo} />
        </div>
      </div>

      {mensaje && <p className="text-xs text-emerald-700">{mensaje}</p>}

      {errores.length > 0 && (
        <div className="rounded-xl bg-amber-50 text-amber-700 text-xs p-2.5 space-y-0.5">
          {errores.map((e, i) => (
            <div key={i}>{e}</div>
          ))}
        </div>
      )}

      {diferencias && (
        <div className="border border-slate-200 rounded-xl p-3">
          <div className="text-sm font-semibold text-slate-700 mb-2">
            Vista previa: {diferencias.length} unidad(es) en el archivo, {cambios.length} con cambios
            {sinCoincidencia.length > 0 && `, ${sinCoincidencia.length} sin coincidencia en el inventario`}
          </div>
          <div className="max-h-56 overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-slate-400">
                  <th className="py-1 pr-2">Unidad</th>
                  <th className="py-1 pr-2">Estado</th>
                  <th className="py-1 pr-2">Precio</th>
                </tr>
              </thead>
              <tbody>
                {diferencias.map(d => (
                  <tr key={d.id} className={d.cambia ? 'bg-amber-50' : ''}>
                    <td className="py-1 pr-2 font-medium text-slate-700">
                      {d.id} {!d.existe && <span className="text-rose-500">(no existe)</span>}
                    </td>
                    <td className="py-1 pr-2 text-slate-600">
                      {d.estadoActual !== d.estadoNuevo && d.estadoActual ? (
                        <>
                          <span className="line-through text-slate-400">{d.estadoActual}</span> → {d.estadoNuevo}
                        </>
                      ) : (
                        d.estadoNuevo ?? '—'
                      )}
                    </td>
                    <td className="py-1 pr-2 text-slate-600">
                      {d.precioActual !== d.precioNuevo && d.precioActual != null ? (
                        <>
                          <span className="line-through text-slate-400">{soles(d.precioActual)}</span> → {d.precioNuevo != null ? soles(d.precioNuevo) : '—'}
                        </>
                      ) : d.precioNuevo != null ? (
                        soles(d.precioNuevo)
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => void aplicar()}
              disabled={aplicando || cambios.length === 0}
              className="rounded-lg bg-emerald-600 text-white text-xs font-semibold px-3 py-2 disabled:bg-slate-300"
            >
              {aplicando ? 'Aplicando...' : `Aplicar ${cambios.length} cambio(s)`}
            </button>
            <button onClick={cancelar} className="rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-2">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Inventario() {
  const edificio = useStore(s => s.edificio)
  const unidades = useStore(s => s.unidades)
  const [abierta, setAbierta] = useState<string | null>(null)

  const tipologiaDe = (id: string) => edificio.tipologias.find(t => t.id === id)

  const pisos = useMemo(
    () => Array.from({ length: edificio.layout.pisos }, (_, i) => edificio.layout.pisos - i),
    [edificio.layout.pisos],
  )

  const porPosicion = useMemo(() => {
    const m = new Map<string, Unidad>()
    for (const u of Object.values(unidades)) m.set(`${u.piso}-${u.posicion}`, u)
    return m
  }, [unidades])

  const conteos = useMemo(() => {
    const c: Record<Estado, number> = { disponible: 0, separado: 0, vendido: 0, bloqueado: 0 }
    for (const u of Object.values(unidades)) c[u.estado]++
    return c
  }, [unidades])

  async function cambiar(id: string, estado: Estado) {
    setAbierta(null)
    await actualizarEstadoUnidad(id, estado)
  }

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold">Inventario</h1>
        <p className="text-sm text-slate-500">
          {edificio.proyecto.nombre} · {Object.keys(unidades).length} unidades
        </p>
      </div>

      <ImportarInventario />

      <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-wrap gap-4 text-xs">
        {ESTADOS.map(e => (
          <div key={e} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ESTADO_COLOR[e] }} />
            <span className="font-medium text-slate-600">{ESTADO_LABEL[e]}</span>
            <span className="text-slate-400">({conteos[e]})</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: `44px repeat(${POSICIONES.length}, 1fr)` }}>
            <div />
            {POSICIONES.map(p => (
              <div key={p} className="text-center text-[11px] font-semibold text-slate-400">
                {p}
              </div>
            ))}
          </div>
          {pisos.map(piso => (
            <div key={piso} className="grid gap-1 mb-1" style={{ gridTemplateColumns: `44px repeat(${POSICIONES.length}, 1fr)` }}>
              <div className="flex items-center justify-center text-xs font-semibold text-slate-400">P{piso}</div>
              {POSICIONES.map(pos => {
                const u = porPosicion.get(`${piso}-${pos}`)
                if (!u) return <div key={pos} />
                return (
                  <Celda
                    key={u.id}
                    unidad={u}
                    tipologia={tipologiaDe(u.tipologia_id)}
                    abierta={abierta === u.id}
                    onToggle={() => setAbierta(prev => (prev === u.id ? null : u.id))}
                    onCambiar={estado => void cambiar(u.id, estado)}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
