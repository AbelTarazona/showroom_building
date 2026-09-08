import { Sky } from '@react-three/drei'

/**
 * Entorno mínimo: pavimento, parque al norte, avenida al sur, vecinos bajos, cielo. Sin mapas reales.
 * `sol` permite moverlo desde la vista de ventana para que la fachada mirada no quede a contraluz y
 * `cerros` apaga los conos genéricos del oeste cuando `vistas/EntornoLejano` dibuja los cerros buenos.
 */
export default function Entorno({
  sol = [60, 80, -30],
  cerros = true,
}: {
  sol?: [number, number, number]
  cerros?: boolean
} = {}) {
  return (
    <group>
      <Sky sunPosition={[sol[0], sol[1] * 0.5, sol[2]]} turbidity={6} rayleigh={1.5} mieCoefficient={0.004} mieDirectionalG={0.8} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#dbeafe', '#a8a29e', 0.5]} />
      <directionalLight
        position={sol}
        intensity={1.6}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-90}
        shadow-camera-right={90}
        shadow-camera-top={90}
        shadow-camera-bottom={-90}
        shadow-camera-near={10}
        shadow-camera-far={220}
        shadow-bias={-0.0004}
      />

      {/* pavimento */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#d6d3d1" />
      </mesh>

      {/* lote del proyecto */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 36]} />
        <meshStandardMaterial color="#c4c0bb" />
      </mesh>

      {/* parque zonal al norte */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 52]} receiveShadow>
        <planeGeometry args={[140, 60]} />
        <meshStandardMaterial color="#65a30d" />
      </mesh>
      {Array.from({ length: 22 }).map((_, i) => {
        const x = -60 + (i * 137) % 120
        const z = 26 + (i * 53) % 52
        const h = 4 + (i % 3)
        return (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, h / 2, 0]} castShadow>
              <cylinderGeometry args={[0.3, 0.4, h, 6]} />
              <meshStandardMaterial color="#78350f" />
            </mesh>
            <mesh position={[0, h + 1.5, 0]} castShadow>
              <sphereGeometry args={[2.4 + (i % 2), 8, 6]} />
              <meshStandardMaterial color={i % 2 ? '#4d7c0f' : '#3f6212'} />
            </mesh>
          </group>
        )
      })}

      {/* avenida al sur */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -26]} receiveShadow>
        <planeGeometry args={[400, 14]} />
        <meshStandardMaterial color="#3f3f46" />
      </mesh>
      {Array.from({ length: 40 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[-195 + i * 10, 0.02, -26]}>
          <planeGeometry args={[4, 0.4]} />
          <meshStandardMaterial color="#f5f5f4" />
        </mesh>
      ))}

      {/* vecinos: manzanas bajas al este y oeste, y al otro lado de la avenida */}
      {[
        [-42, 3, 4, 20, 16], [-46, 2, 0, 22, 12], [-40, 4, -12, 18, 10],
        [42, 2, 6, 20, 14], [46, 3, -8, 22, 14],
        [-30, 2, -46, 26, 14], [0, 3, -48, 30, 16], [32, 2, -46, 24, 14],
      ].map(([x, pisos, z, w, d], i) => (
        <mesh key={i} position={[x, pisos * 1.5, z]} castShadow receiveShadow>
          <boxGeometry args={[w, pisos * 3, d]} />
          <meshStandardMaterial color={i % 2 ? '#e7e5e4' : '#d9d4ce'} />
        </mesh>
      ))}

      {/* cerros al oeste, a lo lejos */}
      {cerros && [[-150, 30, 40, 90], [-170, 40, -30, 120], [-140, 22, -90, 70]].map(([x, h, z, r], i) => (
        <mesh key={i} position={[x, 0, z]}>
          <coneGeometry args={[r, h, 7]} />
          <meshStandardMaterial color="#a8a29e" flatShading />
        </mesh>
      ))}
    </group>
  )
}
