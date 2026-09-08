import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useStore } from '../store'
import Entorno from './Entorno'
import Edificio from './Edificio'
import Camara, { CAMARA_INICIAL } from './Camara'
import Interior from './Interior'
import VistaExterior from './VistaExterior'

// Objeto estable: si cambia la identidad, R3F recrea la cámara y CameraControls pierde el vuelo en curso.
const CAMERA_PROPS = { position: [...CAMARA_INICIAL.pos] as [number, number, number], fov: 42, near: 0.5, far: 900 }

/** Canvas principal del visor. El modo de vista decide qué se renderiza. */
export default function Escena() {
  const modoVista = useStore(s => s.modoVista)
  const seleccionar = useStore(s => s.seleccionar)
  const seleccion = useStore(s => s.seleccion)

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={CAMERA_PROPS}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onPointerMissed={() => { if (modoVista === 'edificio' && seleccion) seleccionar(null) }}
    >
      <color attach="background" args={['#cfe3f5']} />
      <fog attach="fog" args={['#cfe3f5', 140, 420]} />
      <Suspense fallback={null}>
        {modoVista === 'edificio' && (
          <>
            <Entorno />
            <Edificio />
            <Camara />
          </>
        )}
        {modoVista === 'interior' && <Interior />}
        {modoVista === 'ventana' && <VistaExterior />}
      </Suspense>
    </Canvas>
  )
}
