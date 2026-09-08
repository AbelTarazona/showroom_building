import { useEffect, useMemo, useRef } from 'react'
import { Html } from '@react-three/drei'
import Overlay from './Overlay'
import { useStore } from '../../store'
import type { Unidad, Tipologia } from '../../lib/types'
import { VISTA_LABEL } from '../../lib/types'
import type { EstadoFP } from './controlesFP'
import { areaDe, COLOR_PISO, type GeometriaInterior, type PlanoUbicado } from './planos'

export interface HudApi {
  tick: (e: EstadoFP) => void
}

const S = 17 // px por metro en el mini-plano
const R = 76 // centro del mini-plano

/**
 * Capa HTML del recorrido: mini-plano orientado al norte con la posición de la cámara,
 * nombre del ambiente, botón para asomarse a la ventana y la ayuda de controles.
 * Se dibuja en una capa propia sobre el canvas; el contenedor no captura punteros salvo en
 * los botones, para que el canvas siga recibiendo el arrastre.
 */
export default function InteriorUI({
  pu,
  geo,
  unidad,
  tipologia,
  hud,
}: {
  pu: PlanoUbicado
  geo: GeometriaInterior
  unidad: Unidad
  tipologia: Tipologia | undefined
  hud: React.MutableRefObject<HudApi | null>
}) {
  const setModoVista = useStore(s => s.setModoVista)
  const marca = useRef<SVGGElement>(null)
  const etiqueta = useRef<HTMLSpanElement>(null)

  const nombres = useMemo(
    () => Object.fromEntries(pu.plano.ambientes.map(a => [a.id, a.nombre])),
    [pu],
  )

  useEffect(() => {
    hud.current = {
      tick: (e: EstadoFP) => {
        const cos = Math.cos(pu.theta)
        const sen = Math.sin(pu.theta)
        const sx = R + S * (e.x * cos + e.z * sen)
        const sy = R + S * (e.x * sen - e.z * cos)
        const ang = (e.yaw * 180) / Math.PI + 180
        marca.current?.setAttribute('transform', `translate(${sx.toFixed(1)} ${sy.toFixed(1)}) rotate(${ang.toFixed(1)})`)
        const n = e.ambiente ? nombres[e.ambiente] : null
        if (etiqueta.current && etiqueta.current.textContent !== n) etiqueta.current.textContent = n ?? '—'
      },
    }
    return () => {
      hud.current = null
    }
  }, [hud, pu, nombres])

  const deg = (pu.theta * 180) / Math.PI

  return (
    <Overlay>
      {/* mini-plano */}
      <div className="absolute right-3 sm:right-4 top-[96px] sm:top-[104px] w-[152px] rounded-xl bg-slate-900/80 backdrop-blur p-2 shadow-xl text-slate-100">
        <div className="flex items-baseline justify-between px-0.5 pb-1">
          <span ref={etiqueta} className="text-[11px] font-semibold text-emerald-300">—</span>
          <span className="text-[9px] text-slate-400">N ↑</span>
        </div>
        <svg viewBox="0 0 152 152" className="w-full h-[152px] rounded-lg bg-slate-800/70">
          <g transform={`translate(${R} ${R}) rotate(${deg.toFixed(2)}) scale(${S})`}>
            {pu.plano.ambientes.map(a => (
              <rect
                key={a.id}
                x={a.x0}
                y={-a.z1}
                width={a.x1 - a.x0}
                height={a.z1 - a.z0}
                fill={COLOR_PISO[a.tipo]}
                fillOpacity={0.85}
                stroke="#0f172a"
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {geo.ventanas.map((v, i) =>
              v.eje === 'x' ? (
                <line key={i} x1={v.c} y1={-v.a} x2={v.c} y2={-v.b} stroke="#38bdf8" strokeWidth={3} vectorEffect="non-scaling-stroke" />
              ) : (
                <line key={i} x1={v.a} y1={-v.c} x2={v.b} y2={-v.c} stroke="#38bdf8" strokeWidth={3} vectorEffect="non-scaling-stroke" />
              ),
            )}
          </g>
          <g ref={marca}>
            <circle r={4.5} fill="#f59e0b" stroke="#0f172a" strokeWidth={1} />
            <path d="M0,-13 L5,-5 L-5,-5 Z" fill="#f59e0b" fillOpacity={0.9} />
          </g>
        </svg>
        <div className="pt-1 text-[9px] leading-tight text-slate-400">
          {tipologia?.nombre ?? `Tipo ${unidad.tipologia_id}`} · {tipologia?.area_m2 ?? '—'} m² · piso {unidad.piso}
        </div>
      </div>

      {/* acciones + ayuda */}
      <div className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-2">
        <button
          onClick={() => setModoVista('ventana')}
          style={{ pointerEvents: 'auto' }}
          className="bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm px-5 py-2.5 rounded-full shadow-xl"
        >
          Mirar por la ventana →
        </button>
        <div className="bg-slate-900/75 backdrop-blur text-[11px] text-slate-200 px-3 py-1.5 rounded-full">
          Arrastra para mirar · toca el piso para caminar · WASD
        </div>
        <div className="text-[10px] text-slate-100/80 bg-slate-900/60 px-2.5 py-1 rounded-full">
          {unidad.id} · {VISTA_LABEL[unidad.vista]} · orientación {unidad.orientacion}
        </div>
      </div>
    </Overlay>
  )
}

/** Etiquetas flotantes con el nombre y el área aproximada de cada ambiente. */
export function EtiquetasAmbientes({ pu }: { pu: PlanoUbicado }) {
  return (
    <>
      {pu.plano.ambientes.map(a => {
        const m2 = areaDe(a) * pu.escalaArea
        if (m2 < 2.2) return null
        return (
          <Html
            key={a.id}
            position={[(a.x0 + a.x1) / 2, 2.15, (a.z0 + a.z1) / 2]}
            center
            distanceFactor={3.2}
            zIndexRange={[8, 0]}
            style={{ pointerEvents: 'none' }}
            occlude
          >
            <div className="whitespace-nowrap rounded-md bg-slate-900/70 px-2 py-0.5 text-[11px] font-medium text-white shadow">
              {a.nombre}{a.tipo === 'pasillo' ? '' : ` · ${m2.toFixed(1)} m²`}
            </div>
          </Html>
        )
      })}
    </>
  )
}
