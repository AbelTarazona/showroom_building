import { useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'
import type { Caja } from './planos'

const UP = new THREE.Vector3(0, 1, 0)

/**
 * Dibuja un montón de cajas de colores en UNA sola llamada de dibujo (InstancedMesh con
 * `instanceColor`).  Es la primitiva con la que se construye todo el interior: muros, pisos,
 * mobiliario y el resto del edificio.
 */
export default function Cajas({
  items,
  roughness = 0.85,
  metalness = 0,
  sombras = true,
}: {
  items: Caja[]
  roughness?: number
  metalness?: number
  sombras?: boolean
}) {
  const ref = useRef<THREE.InstancedMesh>(null)

  useLayoutEffect(() => {
    const malla = ref.current
    if (!malla) return
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const p = new THREE.Vector3()
    const s = new THREE.Vector3()
    const col = new THREE.Color()
    items.forEach((it, i) => {
      q.setFromAxisAngle(UP, it.ry ?? 0)
      p.set(it.p[0], it.p[1], it.p[2])
      s.set(Math.max(it.s[0], 0.001), Math.max(it.s[1], 0.001), Math.max(it.s[2], 0.001))
      m.compose(p, q, s)
      malla.setMatrixAt(i, m)
      malla.setColorAt(i, col.set(it.c))
    })
    malla.count = items.length
    malla.instanceMatrix.needsUpdate = true
    if (malla.instanceColor) malla.instanceColor.needsUpdate = true
    malla.computeBoundingSphere()
  }, [items])

  if (!items.length) return null
  return (
    <instancedMesh
      key={items.length}
      ref={ref}
      args={[undefined as unknown as THREE.BufferGeometry, undefined as unknown as THREE.Material, items.length]}
      castShadow={sombras}
      receiveShadow={sombras}
      frustumCulled={false}
    >
      <boxGeometry />
      <meshStandardMaterial roughness={roughness} metalness={metalness} />
    </instancedMesh>
  )
}
