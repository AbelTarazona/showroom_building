import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import Escena from '../three/Escena'
import { useStore, suscribirUnidades } from '../store'
import { track } from '../lib/tracking'
import { ESTADO_COLOR, ESTADO_LABEL, VISTA_LABEL, soles, type Unidad } from '../lib/types'
import { useUI } from './ui'
import Modales from './Modales'
import FichaUnidad from './FichaUnidad'
import Favoritos from './Favoritos'

export default function Visor() {
  const { unidadId } = useParams()
  const [searchParams] = useSearchParams()
  const edificio = useStore(s => s.edificio)
  const unidades = useStore(s => s.unidades)
  const seleccion = useStore(s => s.seleccion)
  const seleccionar = useStore(s => s.seleccionar)
  const pisoSel = useStore(s => s.pisoSeleccionado)
  const seleccionarPiso = useStore(s => s.seleccionarPiso)
  const modoVista = useStore(s => s.modoVista)
  const setModoVista = useStore(s => s.setModoVista)
  const modoColor = useStore(s => s.modoColor)
  const setModoColor = useStore(s => s.setModoColor)
  const filtros = useStore(s => s.filtros)
  const setFiltros = useStore(s => s.setFiltros)
  const cargarUnidades = useStore(s => s.cargarUnidades)
  const favoritos = useStore(s => s.favoritos)
  const toast = useUI(s => s.toast)
  const abrir = useUI(s => s.abrir)
  const notificar = useUI(s => s.notificar)
  const [favoritosAbierto, setFavoritosAbierto] = useState(false)

  // StrictMode monta los efectos dos veces en dev: recordamos qué ya se registró para no duplicar eventos.
  const yaRegistrado = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!yaRegistrado.current.has('edificio')) {
      yaRegistrado.current.add('edificio')
      track('ver_edificio')
    }
    void cargarUnidades()
    return suscribirUnidades()
  }, [cargarUnidades])

  useEffect(() => {
    if (unidadId && unidades[unidadId] && !yaRegistrado.current.has(`url:${unidadId}`)) {
      yaRegistrado.current.add(`url:${unidadId}`)
      seleccionar(unidadId, 'url')
      notificar(`Te compartieron el depa ${unidadId}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unidadId])

  // Enlace de lista compartida: ?favs=P07-N2,P08-N1 agrega esas unidades a favoritos al cargar.
  useEffect(() => {
    const favsParam = searchParams.get('favs')
    if (!favsParam) return
    const estado = useStore.getState()
    const ids = favsParam.split(',').map(s => s.trim()).filter(Boolean)
    const nuevos = ids.filter(id => estado.unidades[id] && !estado.favoritos.has(id))
    nuevos.forEach(id => estado.toggleFavorito(id))
    if (nuevos.length > 0) notificar(`Se agregaron ${nuevos.length} depa${nuevos.length > 1 ? 's' : ''} a tus favoritos`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const unidad: Unidad | null = seleccion ? unidades[seleccion] : null
  const { layout } = edificio

  const porPiso = useMemo(() => {
    const m: Record<number, { total: number; disponibles: number }> = {}
    for (const u of Object.values(unidades)) {
      m[u.piso] ??= { total: 0, disponibles: 0 }
      m[u.piso].total++
      if (u.estado === 'disponible') m[u.piso].disponibles++
    }
    return m
  }, [unidades])

  const totalDisponibles = Object.values(unidades).filter(u => u.estado === 'disponible').length

  return (
    <div className="relative h-full w-full overflow-hidden select-none">
      <Escena />

      {/* Barra superior */}
      {/* En flujo (no offsets fijos): en móvil el título ocupa 2-3 líneas y los filtros bajan con él */}
      <header className="absolute top-0 inset-x-0 z-20 p-3 sm:p-4 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-start justify-between gap-3">
        <div className="pointer-events-auto bg-slate-900/85 backdrop-blur rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 shadow-lg max-w-[62%] sm:max-w-[70%]">
          <div className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold hidden sm:block">Showroom 3D · venta en planos</div>
          <h1 className="text-sm sm:text-base font-bold leading-tight">{edificio.proyecto.nombre}</h1>
          <div className="text-[11px] sm:text-xs text-slate-300"><span className="hidden sm:inline">{edificio.proyecto.distrito} · </span>entrega {edificio.proyecto.entrega_estimada} · <span className="text-emerald-300 font-semibold">{totalDisponibles} disponibles</span></div>
        </div>
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <button onClick={() => setFavoritosAbierto(true)} className="bg-white text-slate-900 text-xs font-semibold px-3 py-2 rounded-xl shadow-lg hover:bg-slate-100">
              ♥ {favoritos.size}
            </button>
            <button onClick={() => abrir('chat')} className="bg-white text-slate-900 text-xs font-semibold px-3 py-2 rounded-xl shadow-lg hover:bg-slate-100">
              💬 Preguntar
            </button>
          </div>
          <Link to="/panel" className="text-[10px] font-semibold text-slate-900 bg-white/80 rounded-md px-1.5 py-0.5 hover:bg-white">panel constructora</Link>
        </div>
        </div>

        {modoVista === 'edificio' && (
          /* Filtros */
          <div className="pointer-events-auto flex flex-wrap gap-1.5 max-w-[80vw]">
            {[null, 1, 2, 3].map(d => (
              <button
                key={String(d)}
                onClick={() => setFiltros({ dormitorios: d })}
                className={`text-xs px-2.5 py-1 rounded-full shadow ${filtros.dormitorios === d ? 'bg-emerald-500 text-white' : 'bg-white/90 text-slate-800'}`}
              >
                {d === null ? 'Todos' : `${d} dorm`}
              </button>
            ))}
            <button
              onClick={() => setFiltros({ soloDisponibles: !filtros.soloDisponibles })}
              className={`text-xs px-2.5 py-1 rounded-full shadow ${filtros.soloDisponibles ? 'bg-emerald-500 text-white' : 'bg-white/90 text-slate-800'}`}
            >
              Solo disponibles
            </button>
            <select
              value={modoColor}
              onChange={e => setModoColor(e.target.value as typeof modoColor)}
              className="text-xs px-2 py-1 rounded-full shadow bg-white/90 text-slate-800"
            >
              <option value="estado">Color: estado</option>
              <option value="tipologia">Color: tipología</option>
              <option value="precio">Color: precio</option>
            </select>
          </div>
        )}
      </header>

      {modoVista !== 'edificio' && (
        <div className="absolute top-20 sm:top-24 left-1/2 -translate-x-1/2 z-30">
          <button onClick={() => setModoVista('edificio')} className="bg-white text-slate-900 font-semibold text-sm px-4 py-2 rounded-full shadow-xl">
            ← Volver al edificio
          </button>
        </div>
      )}

      {modoVista === 'edificio' && (
        <>

          {/* Lista de pisos (izquierda en desktop, abajo en móvil) */}
          <nav className={`absolute z-20 left-3 sm:left-4 bottom-3 sm:bottom-auto sm:top-[140px] right-3 sm:right-auto ${unidad ? 'hidden sm:block' : ''}`}>
            <div className="bg-slate-900/85 backdrop-blur rounded-xl shadow-lg p-1.5 flex sm:flex-col-reverse gap-1 overflow-x-auto sm:overflow-visible">
              {Array.from({ length: layout.pisos }).map((_, i) => {
                const piso = i + 1
                const activo = pisoSel === piso
                const info = porPiso[piso]
                return (
                  <button
                    key={piso}
                    onClick={() => seleccionarPiso(activo ? null : piso)}
                    className={`shrink-0 text-left px-2 py-1 rounded-lg text-xs flex items-center gap-2 ${activo ? 'bg-amber-400 text-slate-900' : 'text-slate-200 hover:bg-white/10'}`}
                  >
                    <span className="font-bold w-7">P{piso}</span>
                    <span className={`text-[10px] ${activo ? 'text-slate-800' : 'text-emerald-300'}`}>{info?.disponibles ?? 0} disp.</span>
                  </button>
                )
              })}
              <button onClick={() => seleccionarPiso(null)} className="shrink-0 px-2 py-1 rounded-lg text-[10px] text-slate-400 hover:bg-white/10">Ver todo</button>
            </div>
          </nav>

          {/* Leyenda */}
          <div className="absolute z-10 right-3 sm:right-4 bottom-3 sm:bottom-4 bg-slate-900/75 backdrop-blur rounded-lg px-3 py-2 text-[10px] text-slate-200 hidden sm:flex flex-col gap-1">
            {modoColor === 'estado' && (Object.keys(ESTADO_LABEL) as (keyof typeof ESTADO_LABEL)[]).map(k => (
              <div key={k} className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm" style={{ background: ESTADO_COLOR[k] }} />{ESTADO_LABEL[k]}</div>
            ))}
            {modoColor === 'tipologia' && edificio.tipologias.map(t => (
              <div key={t.id} className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm" style={{ background: { A: '#3b82f6', B: '#a855f7', C: '#14b8a6' }[t.id] }} />{t.nombre} · {t.area_m2} m²</div>
            ))}
            {modoColor === 'precio' && <div>Verde = menor precio · Rojo = mayor precio</div>}
            <div className="text-slate-400 mt-1">Arrastra para girar · rueda/pellizco para acercar</div>
          </div>
        </>
      )}

      {/* Ficha de unidad */}
      {unidad && modoVista === 'edificio' && <FichaUnidad unidad={unidad} />}

      {/* Toast */}
      {toast && (
        <div className="absolute bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-sm px-4 py-2 rounded-full shadow-xl">
          {toast}
        </div>
      )}

      {favoritosAbierto && <Favoritos onClose={() => setFavoritosAbierto(false)} />}

      <Modales />
    </div>
  )
}

export { VISTA_LABEL, soles }
