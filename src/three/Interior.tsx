import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useStore } from '../store'
import type { Unidad } from '../lib/types'
import Entorno from './Entorno'
import Cajas from './interior/Cajas'
import EdificioSimple from './interior/EdificioSimple'
import InteriorUI, { EtiquetasAmbientes, type HudApi } from './interior/InteriorUI'
import { useControlesFP } from './interior/controlesFP'
import { mobiliario } from './interior/mobiliario'
import {
  ALTO_PARED,
  COLOR_PISO,
  COLOR_TECHO,
  MITAD,
  construirMuros,
  planoDeUnidad,
  type Caja,
} from './interior/planos'

/** Recorrido interior en primera persona de la unidad seleccionada. */
export default function Interior() {
  const seleccion = useStore(s => s.seleccion)
  const unidades = useStore(s => s.unidades)
  const u = seleccion ? unidades[seleccion] : null
  if (!u) return null
  return <Recorrido key={u.id} u={u} />
}

function Recorrido({ u }: { u: Unidad }) {
  const edificio = useStore(s => s.edificio)
  const hud = useRef<HudApi | null>(null)

  const tipologia = edificio.tipologias.find(t => t.id === u.tipologia_id)

  const { pu, geo, items, vidrios } = useMemo(() => {
    const pu = planoDeUnidad(u, edificio.layout.slot, tipologia?.area_m2 ?? 55)
    const geo = construirMuros(pu)
    const vanosPuerta = [...geo.puertas.map(p => p.seg), geo.ingreso.seg]
    const muebles = mobiliario(pu.plano, vanosPuerta)

    const pisos: Caja[] = pu.plano.ambientes.map(a => ({
      p: [(a.x0 + a.x1) / 2, -0.02, (a.z0 + a.z1) / 2],
      s: [a.x1 - a.x0, 0.05, a.z1 - a.z0],
      c: COLOR_PISO[a.tipo],
    }))
    // cielo raso y una losa de piso continua debajo (evita ver el vacío en las juntas)
    pisos.push({ p: [0, ALTO_PARED + 0.07, 0], s: [MITAD * 2, 0.14, MITAD * 2], c: COLOR_TECHO })
    pisos.push({ p: [0, -0.09, 0], s: [MITAD * 2, 0.1, MITAD * 2], c: '#9c968c' })

    return { pu, geo, items: [...pisos, ...geo.muros, ...muebles], vidrios: geo.ventanas }
  }, [u, edificio.layout.slot, tipologia?.area_m2])

  const inicio = useMemo(
    () => ({ x: pu.plano.ingreso.x, z: -MITAD + 0.75, rumbo: 0 }),
    [pu],
  )

  useControlesFP({
    plano: pu.plano,
    puertas: geo.puertas,
    colisiones: geo.colisiones,
    origen: pu.origen,
    theta: pu.theta,
    inicio,
    altura: 1.6,
    fov: 70,
    onTick: e => hud.current?.tick(e),
  })

  // luz cálida por ambiente, sin sombras (el interior ya está cerrado)
  const luces = useMemo(
    () =>
      pu.plano.ambientes.map(a => ({
        id: a.id,
        p: [(a.x0 + a.x1) / 2, 2.3, (a.z0 + a.z1) / 2] as [number, number, number],
        i: a.tipo === 'pasillo' || a.tipo === 'servicio' ? 3.5 : 6.5,
      })),
    [pu],
  )

  return (
    <>
      <Entorno />
      <EdificioSimple excluir={u.id} />

      <group position={pu.origen} rotation={[0, pu.theta, 0]}>
        <ambientLight intensity={0.45} color="#fff6e8" />
        {luces.map(l => (
          <pointLight key={l.id} position={l.p} intensity={l.i} distance={7.5} decay={2} color="#ffeed8" />
        ))}

        <Cajas items={items} sombras={false} roughness={0.82} />

        {/* cristales de las ventanas */}
        {vidrios.map((v, i) => {
          const m = (v.a + v.b) / 2
          const h = v.y1 - v.y0
          const p: [number, number, number] = v.eje === 'x' ? [v.c, (v.y0 + v.y1) / 2, m] : [m, (v.y0 + v.y1) / 2, v.c]
          return (
            <mesh key={i} position={p} rotation={[0, v.eje === 'x' ? Math.PI / 2 : 0, 0]} renderOrder={2}>
              <planeGeometry args={[v.b - v.a, h]} />
              <meshStandardMaterial
                color="#dbeafe"
                transparent
                opacity={0.16}
                roughness={0.08}
                metalness={0.35}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
          )
        })}

        <EtiquetasAmbientes pu={pu} />
      </group>

      <InteriorUI pu={pu} geo={geo} unidad={u} tipologia={tipologia} hud={hud} />
    </>
  )
}
