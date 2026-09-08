import { useEffect, useRef } from 'react'
import { CameraControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'
import { normalExterior } from './Edificio'

export const CAMARA_INICIAL = { pos: [52, 36, 62] as const, target: [0, 18, 0] as const }

/**
 * Cámara tipo "visor de maqueta": órbita libre, y vuelos suaves cuando se selecciona
 * un piso o una unidad. Mantiene el azimut actual al cambiar de piso para no marear.
 */
export default function Camara() {
  const ref = useRef<CameraControls>(null)
  const seleccion = useStore(s => s.seleccion)
  const pisoSel = useStore(s => s.pisoSeleccionado)
  const modoVista = useStore(s => s.modoVista)
  // Solo la unidad seleccionada (no el diccionario entero): un UPDATE por Realtime no debe mover la cámara
  const unidadSel = useStore(s => (s.seleccion ? s.unidades[s.seleccion] ?? null : null))
  const layout = useStore(s => s.edificio.layout)
  const aspecto = useThree(s => s.size.width / Math.max(1, s.size.height))
  // En pantallas verticales (móvil) la torre no entra: alejamos la cámara en proporción
  const lejos = aspecto < 1 ? Math.min(1.9, 1 / aspecto) : 1

  useEffect(() => {
    // pequeño retraso: al montar (selección por URL) CameraControls aún no sincronizó la cámara
    const t = setTimeout(volar, 60)
    return () => clearTimeout(t)
    function volar() {
    const c = ref.current
    if (!c || modoVista !== 'edificio') return
    if (seleccion && unidadSel) {
      const u = unidadSel
      const n = normalExterior(u, layout.slot)
      // En vertical la ficha tapa la mitad inferior: bajamos cámara y objetivo para que el depa quede arriba
      const bajar = aspecto < 1 ? 9 : 0
      const target = new THREE.Vector3(u.x, u.y + layout.alturaPiso / 2 - bajar, u.z)
      const pos = target.clone().add(n.clone().multiplyScalar(27 * lejos)).add(new THREE.Vector3(0, 7, 0))
      void c.setLookAt(pos.x, pos.y, pos.z, target.x, target.y, target.z, true)
      return
    }
    if (pisoSel) {
      const y = layout.alturaBase + (pisoSel - 1) * layout.alturaPiso + layout.alturaPiso / 2
      const az = c.azimuthAngle
      const r = 46 * lejos
      const elev = 0.45
      const pos = new THREE.Vector3(Math.sin(az) * r * Math.cos(elev), y + r * Math.sin(elev), Math.cos(az) * r * Math.cos(elev))
      void c.setLookAt(pos.x, pos.y, pos.z, 0, y, 0, true)
      return
    }
    const [px, py, pz] = CAMARA_INICIAL.pos
    void c.setLookAt(px * lejos, py * lejos, pz * lejos, ...CAMARA_INICIAL.target, true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seleccion, unidadSel?.id, pisoSel, modoVista, layout, lejos, aspecto])

  return (
    <CameraControls
      ref={ref}
      makeDefault
      minDistance={8}
      maxDistance={260}
      maxPolarAngle={Math.PI / 2 - 0.03}
      smoothTime={0.55}
      draggingSmoothTime={0.12}
      dollyToCursor
    />
  )
}
