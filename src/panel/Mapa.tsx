import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei'
import { useStore } from '../store'
import { supabase, supabaseDisponible } from '../lib/supabase'
import Entorno from '../three/Entorno'
import Edificio from '../three/Edificio'
import { cargarTodasLasMetricas, METRICAS, METRICA_LABEL, METRICA_FRASE, type Metrica, type TodasLasMetricas } from './mapa/metricas'
import { colorEscala, SIN_DATOS } from './mapa/escala'
import { topUnidades, porPiso, porVista, resumenAutomatico, type Barra } from './mapa/insights'

const REFRESH_MS = 20000
const CAMARA_MAPA = { pos: [52, 36, 62] as const, target: [0, 18, 0] as const }
const METRICAS_VACIAS: TodasLasMetricas = { vistas: {}, favoritos: {}, leads: {}, simulaciones: {} }

function CanvasMapa({ colores, onSeleccion }: { colores: Record<string, string>; onSeleccion: (id: string) => void }) {
  const ref = useRef<CameraControls>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      void ref.current?.setLookAt(...CAMARA_MAPA.pos, ...CAMARA_MAPA.target, false)
    }, 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <Canvas shadows dpr={[1, 1.75]} camera={{ position: [...CAMARA_MAPA.pos], fov: 42, near: 0.5, far: 900 }} gl={{ antialias: true }}>
      <color attach="background" args={['#e2e8f0']} />
      <fog attach="fog" args={['#e2e8f0', 140, 420]} />
      <Suspense fallback={null}>
        <Entorno />
        <Edificio colores={colores} interactivo={false} onSeleccion={onSeleccion} />
        <CameraControls ref={ref} makeDefault minDistance={8} maxDistance={170} maxPolarAngle={Math.PI / 2 - 0.03} smoothTime={0.4} />
      </Suspense>
    </Canvas>
  )
}

function BarraLista({ titulo, filas, max }: { titulo: string; filas: Barra[]; max?: number }) {
  const tope = max ?? Math.max(1, ...filas.map(f => f.valor))
  return (
    <div>
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{titulo}</div>
      <div className="flex flex-col gap-1.5">
        {filas.map(f => (
          <div key={f.clave} className="flex items-center gap-2 text-xs">
            <span className="w-16 shrink-0 text-slate-500 font-medium">{f.etiqueta}</span>
            <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500"
                style={{ width: `${tope ? Math.min(100, (f.valor / tope) * 100) : 0}%` }}
              />
            </div>
            <span className="w-16 shrink-0 text-right text-slate-600 font-semibold">{f.pct.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Mapa() {
  const unidades = useStore(s => s.unidades)
  const totalPisos = useStore(s => s.edificio.layout.pisos)
  const [metrica, setMetrica] = useState<Metrica>('vistas')
  const [todas, setTodas] = useState<TodasLasMetricas>(METRICAS_VACIAS)
  const [cargando, setCargando] = useState(true)
  const [actualizado, setActualizado] = useState<Date | null>(null)
  const [seleccion, setSeleccion] = useState<string | null>(null)

  useEffect(() => {
    let activo = true
    async function cargar() {
      const d = await cargarTodasLasMetricas()
      if (!activo) return
      setTodas(d)
      setCargando(false)
      setActualizado(new Date())
    }
    void cargar()
    const intervalo = setInterval(() => void cargar(), REFRESH_MS)

    if (!supabaseDisponible) return () => { activo = false; clearInterval(intervalo) }

    const canal = supabase
      .channel('mapa-calor')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'eventos' }, () => void cargar())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'favoritos' }, () => void cargar())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => void cargar())
      .subscribe()

    return () => {
      activo = false
      clearInterval(intervalo)
      void supabase.removeChannel(canal)
    }
  }, [])

  const datos = todas[metrica]

  const { min, max } = useMemo(() => {
    const valores = Object.values(datos)
    if (valores.length === 0) return { min: 0, max: 0 }
    return { min: Math.min(...valores), max: Math.max(...valores) }
  }, [datos])

  const colores = useMemo(() => {
    const m: Record<string, string> = {}
    for (const u of Object.values(unidades)) {
      const v = datos[u.id]
      if (v === undefined) { m[u.id] = SIN_DATOS; continue }
      const t = max > min ? (v - min) / (max - min) : v > 0 ? 1 : 0
      m[u.id] = colorEscala(t)
    }
    return m
  }, [unidades, datos, min, max])

  const top5 = useMemo(() => topUnidades(datos, 5), [datos])
  const filasPiso = useMemo(() => porPiso(datos, unidades, totalPisos), [datos, unidades, totalPisos])
  const filasVista = useMemo(() => porVista(datos, unidades), [datos, unidades])
  const frase = useMemo(() => resumenAutomatico(datos, unidades, totalPisos, METRICA_FRASE[metrica]), [datos, unidades, totalPisos, metrica])

  const unidadSel = seleccion ? unidades[seleccion] : null

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Mapa de calor</h1>
          <p className="text-sm text-slate-500">Dónde se concentra el interés de los visitantes, por unidad.</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {METRICAS.map(m => (
            <button
              key={m}
              onClick={() => setMetrica(m)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm transition ${
                metrica === m ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {METRICA_LABEL[m]}
            </button>
          ))}
        </div>
      </div>

      {frase && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 text-sm rounded-2xl px-4 py-3 font-medium">
          🔥 {frase}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 min-w-0 bg-slate-200 rounded-2xl overflow-hidden shadow-sm" style={{ height: 520 }}>
          <CanvasMapa colores={colores} onSeleccion={setSeleccion} />

          {/* Leyenda */}
          <div className="absolute left-3 bottom-3 bg-white/90 backdrop-blur rounded-xl px-3 py-2 text-[11px] text-slate-700 shadow">
            <div className="font-semibold mb-1">{METRICA_LABEL[metrica]}</div>
            <div className="flex items-center gap-2">
              <span>{min}</span>
              <div className="w-24 h-2.5 rounded-full" style={{ background: 'linear-gradient(90deg, #cbd5e1, #f59e0b, #dc2626)' }} />
              <span>{max}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-slate-500">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: SIN_DATOS }} />
              Sin datos
            </div>
          </div>

          {cargando && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/40 text-sm text-slate-600 font-medium">
              Cargando métricas…
            </div>
          )}

          {actualizado && (
            <div className="absolute right-3 top-3 bg-white/90 rounded-full px-3 py-1 text-[10px] text-slate-500 shadow">
              Actualizado {actualizado.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}

          {/* Tooltip de la unidad seleccionada */}
          {unidadSel && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-3 sm:bottom-auto sm:top-3 bg-slate-900 text-white text-xs rounded-xl px-4 py-2.5 shadow-xl flex items-center gap-3">
              <button onClick={() => setSeleccion(null)} className="text-slate-400 hover:text-white text-sm leading-none">×</button>
              <div>
                <span className="font-bold">{unidadSel.id}</span>
                <span className="text-slate-300"> · piso {unidadSel.piso} · </span>
                <span>{todas.vistas[unidadSel.id] ?? 0} vistas</span>
                <span> · {todas.favoritos[unidadSel.id] ?? 0} favoritos</span>
                <span> · {todas.leads[unidadSel.id] ?? 0} leads</span>
                {(todas.simulaciones[unidadSel.id] ?? 0) > 0 && <span> · {todas.simulaciones[unidadSel.id]} simulaciones</span>}
              </div>
            </div>
          )}
        </div>

        <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Top 5 · {METRICA_LABEL[metrica]}
            </div>
            {top5.length === 0 ? (
              <div className="text-xs text-slate-400">Sin datos todavía.</div>
            ) : (
              <ol className="flex flex-col gap-1.5">
                {top5.map((t, i) => {
                  const u = unidades[t.id]
                  return (
                    <li key={t.id} className="flex items-center justify-between text-sm">
                      <button onClick={() => setSeleccion(t.id)} className="flex items-center gap-2 hover:underline text-left">
                        <span className="text-slate-400 text-xs w-4">{i + 1}.</span>
                        <span className="font-semibold">{t.id}</span>
                        {u && <span className="text-slate-400 text-xs">piso {u.piso}</span>}
                      </button>
                      <span className="font-bold text-slate-700">{t.valor}</span>
                    </li>
                  )
                })}
              </ol>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4">
            <BarraLista titulo="% de interés por piso" filas={filasPiso} />
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4">
            <BarraLista titulo="% de interés por vista" filas={filasVista} />
          </div>
        </aside>
      </div>
    </div>
  )
}
