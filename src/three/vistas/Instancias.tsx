import { useLayoutEffect, useRef, type ReactNode } from 'react'
import * as THREE from 'three'

export interface Inst {
  p: [number, number, number]
  s: [number, number, number]
  c: string
  ry?: number
}

const UP = new THREE.Vector3(0, 1, 0)

/**
 * Igual que `interior/Cajas`, pero con la geometría y el material como hijos: sirve para
 * árboles (cilindro + esfera), autos, ventanas emisivas del skyline, etc. Una sola llamada de
 * dibujo por conjunto, que es lo que permite tener cientos de elementos en el entorno lejano.
 */
export default function Instancias({ items, children }: { items: Inst[]; children: ReactNode }) {
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
      frustumCulled={false}
    >
      {children}
    </instancedMesh>
  )
}

/** generador pseudoaleatorio determinista: el entorno debe verse igual en cada render */
export function rng(semilla: number) {
  let s = semilla >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}
