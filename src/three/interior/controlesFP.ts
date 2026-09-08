import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { MITAD, ruta, ambienteEn, type GeometriaInterior, type Plano, type Seg } from './planos'

export interface EstadoFP {
  /** posición en coordenadas locales del plano */
  x: number
  z: number
  /** rumbo de la cámara en el mundo (camera.rotation.y) */
  yaw: number
  /** ambiente en el que está parado */
  ambiente: string | null
  /** el usuario está caminando hacia un punto */
  caminando: boolean
}

export interface OpcionesFP {
  plano: Plano
  puertas: GeometriaInterior['puertas']
  colisiones: Seg[]
  /** origen del grupo del departamento en el mundo (y = piso terminado) */
  origen: [number, number, number]
  /** rotación del grupo sobre Y */
  theta: number
  /** punto y rumbo inicial en coordenadas locales (rumbo local: 0 = mirando a +Z) */
  inicio: { x: number; z: number; rumbo: number }
  altura?: number
  fov?: number
  /** se llama en cada frame con el estado actual (para el HUD) */
  onTick?: (e: EstadoFP) => void
}

const RADIO = 0.27
const VELOCIDAD = 2.3
const LIMITE = MITAD - 0.32

function libre(cols: Seg[], x: number, z: number) {
  if (Math.abs(x) > LIMITE || Math.abs(z) > LIMITE) return false
  for (const s of cols) {
    if (s.eje === 'x') {
      if (Math.abs(x - s.c) < RADIO && z > s.a - 0.12 && z < s.b + 0.12) return false
    } else if (Math.abs(z - s.c) < RADIO && x > s.a - 0.12 && x < s.b + 0.12) return false
  }
  return true
}

/**
 * Cámara en primera persona sin dependencias: arrastrar para mirar, tocar el piso para
 * caminar (ruta por las puertas), WASD/flechas y rueda para un zoom suave de FOV.
 * Todos los listeners se registran sobre el canvas y se limpian al desmontar.
 */
export function useControlesFP(op: OpcionesFP) {
  const { camera, gl } = useThree()
  const estado = useRef<EstadoFP>({
    x: op.inicio.x,
    z: op.inicio.z,
    yaw: op.inicio.rumbo + op.theta + Math.PI,
    ambiente: null,
    caminando: false,
  })
  const pitch = useRef(0)
  const destino = useRef<[number, number][]>([])
  const teclas = useRef<Record<string, boolean>>({})
  const opRef = useRef(op)
  opRef.current = op

  // reiniciar cuando cambia la unidad
  useEffect(() => {
    estado.current.x = op.inicio.x
    estado.current.z = op.inicio.z
    estado.current.yaw = op.inicio.rumbo + op.theta + Math.PI
    pitch.current = 0
    destino.current = []
  }, [op.inicio.x, op.inicio.z, op.inicio.rumbo, op.theta])

  // cámara: fov de interior y plano cercano corto; se restaura al salir
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera
    const previo = { fov: cam.fov, near: cam.near, orden: cam.rotation.order }
    cam.fov = op.fov ?? 70
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
    let recorrido = 0
    const rc = new THREE.Raycaster()
    const plano = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const punto = new THREE.Vector3()

    const down = (e: PointerEvent) => {
      if (activo !== -1) return
      activo = e.pointerId
      px = e.clientX
      py = e.clientY
      recorrido = 0
      el.setPointerCapture(e.pointerId)
      el.style.cursor = 'grabbing'
    }

    const move = (e: PointerEvent) => {
      if (e.pointerId !== activo) return
      const dx = e.clientX - px
      const dy = e.clientY - py
      px = e.clientX
      py = e.clientY
      recorrido += Math.abs(dx) + Math.abs(dy)
      estado.current.yaw -= dx * 0.0035
      pitch.current = THREE.MathUtils.clamp(pitch.current - dy * 0.003, -0.85, 0.75)
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
      if (recorrido > 7) return
      const o = opRef.current
      const r = el.getBoundingClientRect()
      const ndc = new THREE.Vector2(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        -((e.clientY - r.top) / r.height) * 2 + 1,
      )
      rc.setFromCamera(ndc, camera)
      plano.constant = -o.origen[1]
      if (!rc.ray.intersectPlane(plano, punto)) return
      const wx = punto.x - o.origen[0]
      const wz = punto.z - o.origen[2]
      const cos = Math.cos(o.theta)
      const sin = Math.sin(o.theta)
      const lx = wx * cos - wz * sin
      const lz = wx * sin + wz * cos
      if (!ambienteEn(o.plano, lx, lz)) return
      const pasos = ruta(o.plano, o.puertas, [estado.current.x, estado.current.z], [lx, lz])
      destino.current = pasos.length ? pasos : [[lx, lz]]
    }

    const rueda = (e: WheelEvent) => {
      e.preventDefault()
      const cam = camera as THREE.PerspectiveCamera
      cam.fov = THREE.MathUtils.clamp(cam.fov + Math.sign(e.deltaY) * 3, 48, 82)
      cam.updateProjectionMatrix()
    }

    const kd = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && /input|textarea|select/i.test(t.tagName)) return
      teclas.current[e.key.toLowerCase()] = true
      destino.current = []
    }
    const ku = (e: KeyboardEvent) => {
      teclas.current[e.key.toLowerCase()] = false
    }

    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    el.addEventListener('wheel', rueda, { passive: false })
    window.addEventListener('keydown', kd)
    window.addEventListener('keyup', ku)

    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
      el.removeEventListener('wheel', rueda)
      window.removeEventListener('keydown', kd)
      window.removeEventListener('keyup', ku)
      el.style.touchAction = touchPrevio
      el.style.cursor = cursorPrevio
      teclas.current = {}
    }
  }, [camera, gl])

  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05)
    const o = opRef.current
    const e = estado.current
    const k = teclas.current
    const adelante = (k['w'] || k['arrowup'] ? 1 : 0) - (k['s'] || k['arrowdown'] ? 1 : 0)
    const lateral = (k['d'] || k['arrowright'] ? 1 : 0) - (k['a'] || k['arrowleft'] ? 1 : 0)

    let dxl = 0
    let dzl = 0
    const cos = Math.cos(o.theta)
    const sin = Math.sin(o.theta)

    if (adelante || lateral) {
      const fx = -Math.sin(e.yaw)
      const fz = -Math.cos(e.yaw)
      const rx = Math.cos(e.yaw)
      const rz = -Math.sin(e.yaw)
      let wx = fx * adelante + rx * lateral
      let wz = fz * adelante + rz * lateral
      const len = Math.hypot(wx, wz) || 1
      wx = (wx / len) * VELOCIDAD * dt
      wz = (wz / len) * VELOCIDAD * dt
      dxl = wx * cos - wz * sin
      dzl = wx * sin + wz * cos
      destino.current = []
    } else if (destino.current.length) {
      const [tx, tz] = destino.current[0]
      const vx = tx - e.x
      const vz = tz - e.z
      const d = Math.hypot(vx, vz)
      if (d < 0.14) {
        destino.current.shift()
      } else {
        const paso = Math.min(VELOCIDAD * dt, d)
        dxl = (vx / d) * paso
        dzl = (vz / d) * paso
        // girar suavemente hacia donde camina (dirección local → rumbo de cámara en mundo)
        const wvx = vx * cos + vz * sin
        const wvz = -vx * sin + vz * cos
        const objetivo = Math.atan2(-wvx, -wvz)
        let dif = objetivo - e.yaw
        while (dif > Math.PI) dif -= Math.PI * 2
        while (dif < -Math.PI) dif += Math.PI * 2
        e.yaw += dif * Math.min(1, dt * 3)
      }
    }
    e.caminando = destino.current.length > 0

    if (dxl || dzl) {
      if (libre(o.colisiones, e.x + dxl, e.z)) e.x += dxl
      if (libre(o.colisiones, e.x, e.z + dzl)) e.z += dzl
    }

    const amb = ambienteEn(o.plano, e.x, e.z)
    e.ambiente = amb ? amb.id : null

    camera.position.set(
      o.origen[0] + e.x * cos + e.z * sin,
      o.origen[1] + (o.altura ?? 1.6),
      o.origen[2] - e.x * sin + e.z * cos,
    )
    camera.rotation.order = 'YXZ'
    camera.rotation.set(pitch.current, e.yaw, 0)
    o.onTick?.(e)
  })

  return estado
}
