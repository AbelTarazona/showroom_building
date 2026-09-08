// Fase 5: vista desde la ventana de la unidad seleccionada.
// Se renderiza dentro del <Canvas> cuando modoVista === 'ventana'. No es una panorámica falsa:
// la cámara se planta en la fachada real de la unidad, con el edificio y el entorno de verdad.
import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'
import type { Unidad } from '../lib/types'
import { VISTA_LABEL } from '../lib/types'
import Entorno from './Entorno'
import Cajas from './interior/Cajas'
import EdificioSimple from './interior/EdificioSimple'
import Overlay from './interior/Overlay'
import EntornoLejano from './vistas/EntornoLejano'
import { ALTO_PARED, MITAD, ladosExterioresMundo, type Caja, type Lado } from './interior/planos'

const VECTOR: Record<Lado, [number, number]> = { '+x': [1, 0], '-x': [-1, 0], '+z': [0, 1], '-z': [0, -1] }
const NOMBRE_LADO: Record<Lado, string> = { '+z': 'norte', '-z': 'sur', '+x': 'este', '-x': 'oeste' }

const GIRO = (70 * Math.PI) / 180
// tope real: más abajo la mirada choca con el piso del propio depa y el encuadre se pierde
const PITCH_MIN = (-26 * Math.PI) / 180
const PITCH_MAX = (25 * Math.PI) / 180
const ANCHO_VANO = 3.4
const ALFEIZAR = 0.06
const DINTEL = 2.35
const CARA = MITAD - 0.08 // plano interior del muro de fachada
const RETIRO = 2.9 // a esta distancia del vano la jamba y el dintel entran en cuadro

export default function VistaExterior() {
  const seleccion = useStore(s => s.seleccion)
  const unidades = useStore(s => s.unidades)
  const u = seleccion ? unidades[seleccion] : null
  if (!u) return null
  return <Ventana key={u.id} u={u} />
}

function Ventana({ u }: { u: Unidad }) {
  const edificio = useStore(s => s.edificio)
  const setModoVista = useStore(s => s.setModoVista)
  const slot = edificio.layout.slot

  const { lados, nx, nz, cajas, sol, lejos } = useMemo(() => {
    const lados = ladosExterioresMundo(u, slot)
    // en esquina la cámara arranca por la bisectriz de las dos fachadas
    let vx = 0
    let vz = 0
    for (const l of lados) {
      vx += VECTOR[l][0]
      vz += VECTOR[l][1]
    }
    const len = Math.hypot(vx, vz) || 1
    const nx = vx / len
    const nz = vz / len

    const y0 = u.y + 0.14
    const cajas: Caja[] = [
      { p: [u.x, y0 - 0.03, u.z], s: [7.4, 0.06, 7.4], c: '#c39a68' },
      { p: [u.x, y0 + ALTO_PARED + 0.07, u.z], s: [7.4, 0.14, 7.4], c: '#fbfaf7' },
    ]
    const TODOS: Lado[] = ['+x', '-x', '+z', '-z']
    const L = 7.4
    for (const l of TODOS) {
      const [dx, dz] = VECTOR[l]
      const eje: 'x' | 'z' = dx !== 0 ? 'x' : 'z'
      const cx = u.x + dx * CARA
      const cz = u.z + dz * CARA
      /** empuja una caja del paño: `t` es el centro sobre el eje tangente del muro */
      const paño = (t: number, largo: number, y: number, alto: number, c: string, grosor = 0.16) => {
        cajas.push({
          p: eje === 'x' ? [cx, y, cz + t] : [cx + t, y, cz],
          s: eje === 'x' ? [grosor, alto, largo] : [largo, alto, grosor],
          c,
        })
      }
      if (!lados.includes(l)) {
        paño(0, L, y0 + ALTO_PARED / 2, ALTO_PARED, '#efeae1') // medianera ciega
        continue
      }
      // en esquina el vano se corre hacia el encuentro de las dos fachadas: así, mirando por la
      // bisectriz, se ve por las dos ventanas y no contra el machón del rincón
      const otro = lados.find(o => o !== l)
      const signo = otro ? (eje === 'x' ? VECTOR[otro][1] : VECTOR[otro][0]) : 0
      const ancho = signo ? 4.6 : ANCHO_VANO
      const borde = signo ? signo * (L / 2 - 0.28 - ancho / 2) : 0
      const t0 = borde - ancho / 2
      const t1 = borde + ancho / 2
      for (const [a, b] of [[-L / 2, t0], [t1, L / 2]] as [number, number][]) {
        if (b - a > 0.02) paño((a + b) / 2, b - a, y0 + ALTO_PARED / 2, ALTO_PARED, '#efeae1')
      }
      paño(borde, ancho, y0 + ALFEIZAR / 2, ALFEIZAR, '#e3ddd2')
      paño(borde, ancho, y0 + (DINTEL + ALTO_PARED) / 2, ALTO_PARED - DINTEL, '#efeae1')
      // alféizar que vuela hacia afuera y montante central: dan escala y sensación de estar dentro
      cajas.push({
        p: eje === 'x' ? [cx + dx * 0.16, y0 + 0.03, cz + borde] : [cx + dx * 0.16, y0 + 0.03, cz],
        s: eje === 'x' ? [0.4, 0.08, ancho + 0.5] : [ancho + 0.5, 0.08, 0.4],
        c: '#cfc7b8',
      })
      if (eje === 'z') {
        const ult = cajas[cajas.length - 1]
        ult.p = [cx + borde, y0 + 0.03, cz + dz * 0.16]
      }
      paño(borde, 0.08, y0 + (ALFEIZAR + DINTEL) / 2, DINTEL - ALFEIZAR, '#d5cec2', 0.07)
    }

    // sol a la espalda del observador: la fachada mirada nunca queda a contraluz
    const sol: [number, number, number] = [-nx * 70 + 25, 85, -nz * 70 + 18]
    // cerros y ciudad son motivos lejanos: allí no conviene picar la cámara hacia el suelo
    const lejos = lados.includes('-x') || lados.includes('+x')
    return { lados, nx, nz, cajas, sol, lejos }
  }, [u, slot])

  const camara = useMemo(
    () => ({
      pos: [u.x + nx * (CARA - RETIRO), u.y + 0.14 + 1.5, u.z + nz * (CARA - RETIRO)] as [number, number, number],
      yaw: Math.atan2(-nx, -nz),
      // hacia el parque o la avenida se mira abajo; hacia cerros y ciudad, casi al horizonte
      pitch: lejos
        ? -0.05 - Math.min(0.14, u.piso * 0.01)
        : -0.09 - Math.min(0.24, u.piso * 0.016),
    }),
    [u, nx, nz, lejos],
  )

  useControlesVentana(camara)

  return (
    <>
      <fog attach="fog" args={['#cfe3f5', 130, 560]} />
      <Entorno sol={sol} cerros={!lados.includes('-x')} />
      <EntornoLejano lados={lados} />
      <EdificioSimple excluir={u.id} />

      <ambientLight intensity={0.3} color="#fff4e2" />
      <pointLight position={[u.x, u.y + 2.4, u.z]} intensity={4} distance={9} decay={2} color="#ffeed8" />
      <Cajas items={cajas} sombras={false} roughness={0.85} />

      <Overlay>
        <div className="absolute inset-x-0 top-[206px] sm:top-[120px] flex justify-center px-4">
          <div className="rounded-xl bg-slate-900/75 backdrop-blur px-4 py-2 text-center text-slate-100 shadow-xl">
            <div className="text-sm font-semibold">
              Piso {u.piso} · {VISTA_LABEL[u.vista]} · orientación {lados.map(l => NOMBRE_LADO[l]).join(' y ')}
            </div>
            <div className="text-[11px] text-slate-300">
              {u.piso >= 8
                ? `Desde el piso ${u.piso} ves más cielo y menos avenida: el parque entra completo en la ventana.`
                : u.piso >= 4
                  ? `En el piso ${u.piso} la vista ya pasa por encima de las casas vecinas.`
                  : `En el piso ${u.piso} la vista es más cercana: veredas, árboles y calle.`}
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-4 flex flex-col items-center gap-2">
          <button
            onClick={() => setModoVista('interior')}
            style={{ pointerEvents: 'auto' }}
            className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm px-5 py-2.5 rounded-full shadow-xl"
          >
            ← Entrar al depa
          </button>
          <div className="bg-slate-900/75 backdrop-blur text-[11px] text-slate-200 px-3 py-1.5 rounded-full">
            Arrastra para girar la cabeza · rueda para acercar
          </div>
        </div>
      </Overlay>
    </>
  )
}

/** Mirada desde la ventana: giro limitado a la fachada, sin desplazamiento. */
function useControlesVentana(c: { pos: [number, number, number]; yaw: number; pitch: number }) {
  const { camera, gl } = useThree()
  const est = useRef({ yaw: c.yaw, pitch: c.pitch })

  useEffect(() => {
    est.current.yaw = c.yaw
    est.current.pitch = c.pitch
  }, [c.yaw, c.pitch])

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera
    const previo = { fov: cam.fov, near: cam.near, orden: cam.rotation.order }
    cam.fov = 58
    cam.near = 0.05
    cam.rotation.order = 'YXZ'
    cam.updateProjectionMatrix()
    return () => {
      cam.fov = previo.fov
      cam.near = previo.near
      cam.rotation.order = previo.orden
      cam.updateProjectionMatrix()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera])

  useEffect(() => {
    const el = gl.domElement
    const touchPrevio = el.style.touchAction
    const cursorPrevio = el.style.cursor
    el.style.touchAction = 'none'
    el.style.cursor = 'grab'

    let activo = -1
    let px = 0
    let py = 0

    const down = (e: PointerEvent) => {
      if (activo !== -1) return
      activo = e.pointerId
      px = e.clientX
      py = e.clientY
      el.setPointerCapture(e.pointerId)
      el.style.cursor = 'grabbing'
    }
    const move = (e: PointerEvent) => {
      if (e.pointerId !== activo) return
      const dx = e.clientX - px
      const dy = e.clientY - py
      px = e.clientX
      py = e.clientY
      est.current.yaw = THREE.MathUtils.clamp(est.current.yaw - dx * 0.0032, c.yaw - GIRO, c.yaw + GIRO)
      est.current.pitch = THREE.MathUtils.clamp(est.current.pitch - dy * 0.0028, PITCH_MIN, PITCH_MAX)
    }
    const up = (e: PointerEvent) => {
      if (e.pointerId !== activo) return
      activo = -1
      el.style.cursor = 'grab'
      try {
        el.releasePointerCapture(e.pointerId)
      } catch {
        /* el puntero ya se liberó */
      }
    }
    const rueda = (e: WheelEvent) => {
      e.preventDefault()
      const cam = camera as THREE.PerspectiveCamera
      cam.fov = THREE.MathUtils.clamp(cam.fov + Math.sign(e.deltaY) * 3, 30, 66)
      cam.updateProjectionMatrix()
    }

    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    el.addEventListener('wheel', rueda, { passive: false })
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
      el.removeEventListener('wheel', rueda)
      el.style.touchAction = touchPrevio
      el.style.cursor = cursorPrevio
    }
  }, [camera, gl, c.yaw])

  useFrame(() => {
    camera.position.set(c.pos[0], c.pos[1], c.pos[2])
    camera.rotation.order = 'YXZ'
    camera.rotation.set(est.current.pitch, est.current.yaw, 0)
  })
}
