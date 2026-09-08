import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import Instancias, { rng, type Inst } from './Instancias'
import type { Lado } from '../interior/planos'

/**
 * Entorno lejano por dirección: sólo se arma lo que la unidad realmente mira.
 *   +z norte → parque zonal, laguna y canchas
 *   -z sur   → avenida con autos, paraderos y edificios de media altura al frente
 *   +x este  → skyline de la ciudad con ventanas emisivas
 *   -x oeste → cerros (planos desplazados por ruido) con casitas en la ladera
 * Todo es procedural e instanciado; una unidad de esquina renderiza dos direcciones.
 */
export default function EntornoLejano({ lados }: { lados: Lado[] }) {
  return (
    <group>
      {lados.includes('+z') && <Parque />}
      {lados.includes('-z') && <Avenida />}
      {lados.includes('+x') && <Ciudad />}
      {lados.includes('-x') && <Cerros />}
    </group>
  )
}

/* ------------------------------------------------------------------ norte */

function Parque() {
  const { troncos, copas, bancas, lejanos } = useMemo(() => {
    const r = rng(20260907)
    const troncos: Inst[] = []
    const copas: Inst[] = []
    const bancas: Inst[] = []
    for (let i = 0; i < 76; i++) {
      const x = -130 + r() * 260
      const z = 24 + r() * 160
      // no plantamos árboles dentro de la laguna ni en las canchas
      if (Math.hypot((x + 34) / 1.75, z - 96) < 24) continue
      if (x > 24 && x < 84 && z > 52 && z < 96) continue
      const h = 4.5 + r() * 4
      const rc = 2 + r() * 1.8
      troncos.push({ p: [x, h / 2, z], s: [0.42, h, 0.42], c: '#6b4423' })
      copas.push({ p: [x, h + rc * 0.6, z], s: [rc, rc * 0.85, rc], c: r() > 0.5 ? '#4d7c0f' : '#3f6212' })
    }
    for (let i = 0; i < 14; i++) {
      const x = -90 + r() * 180
      bancas.push({ p: [x, 0.45, 30 + r() * 40], s: [1.8, 0.12, 0.6], c: '#92400e' })
    }
    // manzanas lejanas al fondo del parque: el horizonte no puede ser una línea recta
    const lejanos: Inst[] = []
    for (let i = 0; i < 26; i++) {
      const h = 6 + r() * 16
      lejanos.push({
        p: [-200 + i * 16 + r() * 8, h / 2, 225 + r() * 55],
        s: [12 + r() * 10, h, 12 + r() * 10],
        c: r() > 0.5 ? '#b6c3d2' : '#a9b7c8',
      })
    }
    return { troncos, copas, bancas, lejanos }
  }, [])

  return (
    <group>
      {/* césped del parque, más allá del que ya pone Entorno */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 150]} receiveShadow>
        <planeGeometry args={[440, 300]} />
        <meshStandardMaterial color="#6ba32f" />
      </mesh>
      {/* alameda central */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4, 0.02, 90]}>
        <planeGeometry args={[6, 150]} />
        <meshStandardMaterial color="#d7cdb8" />
      </mesh>

      {/* laguna */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-34, 0.03, 96]} scale={[1.75, 1, 1]}>
        <circleGeometry args={[24, 24]} />
        <meshStandardMaterial color="#2e7fb8" roughness={0.42} metalness={0.12} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-34, 0.025, 96]} scale={[1.78, 1, 1]}>
        <circleGeometry args={[25.6, 24]} />
        <meshStandardMaterial color="#b8ae8a" />
      </mesh>

      {/* canchas deportivas */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[40, 0.03, 62]}>
        <planeGeometry args={[26, 16]} />
        <meshStandardMaterial color="#b45309" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[40, 0.04, 62]}>
        <planeGeometry args={[0.25, 16]} />
        <meshStandardMaterial color="#fafaf9" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[70, 0.03, 84]}>
        <planeGeometry args={[30, 18]} />
        <meshStandardMaterial color="#15803d" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[70, 0.04, 84]}>
        <planeGeometry args={[0.25, 18]} />
        <meshStandardMaterial color="#fafaf9" />
      </mesh>

      <Instancias items={troncos}>
        <cylinderGeometry args={[0.5, 0.6, 1, 6]} />
        <meshStandardMaterial roughness={0.95} />
      </Instancias>
      <Instancias items={copas}>
        <sphereGeometry args={[1, 6, 4]} />
        <meshStandardMaterial roughness={0.9} flatShading />
      </Instancias>
      <Instancias items={[...bancas, ...lejanos]}>
        <boxGeometry />
        <meshStandardMaterial roughness={0.9} />
      </Instancias>
    </group>
  )
}

/* -------------------------------------------------------------------- sur */

const PINTURA = ['#dc2626', '#f8fafc', '#1e3a8a', '#334155', '#eab308', '#0f766e']

function Avenida() {
  const { carrocerias, cabinas, bloques, paraderos, techos } = useMemo(() => {
    const r = rng(77123)
    const carrocerias: Inst[] = []
    const cabinas: Inst[] = []
    for (let i = 0; i < 22; i++) {
      const carril = i % 2 === 0 ? -23.2 : -29
      const x = -110 + r() * 220
      const largo = 3.9 + r() * 1.4
      const c = PINTURA[Math.floor(r() * PINTURA.length)]
      carrocerias.push({ p: [x, 0.65, carril], s: [largo, 1.05, 1.8], c })
      cabinas.push({ p: [x - 0.2, 1.42, carril], s: [largo * 0.5, 0.7, 1.62], c: '#1e293b' })
    }
    // dos buses
    for (let i = 0; i < 2; i++) {
      carrocerias.push({ p: [-40 + i * 70, 1.5, i ? -29 : -23.2], s: [11, 3, 2.5], c: '#0369a1' })
    }

    // frente de la avenida y varias manzanas detrás: el sur no puede ser un plano gris vacío
    const TONOS = ['#ded8d0', '#cbc3ba', '#d8c3a5', '#c2ab90', '#cfd6d9', '#bfae9c']
    const bloques: Inst[] = []
    for (let i = 0; i < 18; i++) {
      const h = 6 + r() * 10
      bloques.push({
        p: [-136 + i * 16 + r() * 5, h / 2, -74 - r() * 16],
        s: [11 + r() * 5, h, 12 + r() * 8],
        c: TONOS[Math.floor(r() * TONOS.length)],
      })
    }
    // primera fila baja pegada a la vereda de enfrente: tapa el descampado gris
    for (let i = 0; i < 34; i++) {
      const h = 3 + r() * 4.5
      bloques.push({
        p: [-160 + i * 10 + r() * 5, h / 2, -50 - r() * 20],
        s: [8 + r() * 5, h, 8 + r() * 5],
        c: TONOS[Math.floor(r() * TONOS.length)],
      })
    }
    for (let i = 0; i < 46; i++) {
      const h = 4 + r() * 13
      bloques.push({
        p: [-170 + r() * 340, h / 2, -95 - r() * 150],
        s: [10 + r() * 14, h, 10 + r() * 14],
        c: TONOS[Math.floor(r() * TONOS.length)],
        ry: r() * 0.3 - 0.15,
      })
    }

    // azoteas de los bloques que Entorno pone al frente: desde el depa se ven los techos, y un
    // techo liso enorme mata la escena. Parapeto + tanques de agua + caja de escalera.
    const AZOTEAS: [number, number, number, number, number][] = [
      [-30, 6, -46, 26, 14],
      [0, 9, -48, 30, 16],
      [32, 6, -46, 24, 14],
    ]
    for (const [bx, bh, bz, bw, bd] of AZOTEAS) {
      bloques.push({ p: [bx, bh + 0.35, bz + bd / 2], s: [bw, 0.7, 0.3], c: '#a89f92' })
      bloques.push({ p: [bx, bh + 0.35, bz - bd / 2], s: [bw, 0.7, 0.3], c: '#a89f92' })
      bloques.push({ p: [bx + bw / 2, bh + 0.35, bz], s: [0.3, 0.7, bd], c: '#a89f92' })
      bloques.push({ p: [bx - bw / 2, bh + 0.35, bz], s: [0.3, 0.7, bd], c: '#a89f92' })
      for (let i = 0; i < 7; i++) {
        const h = 1 + r() * 1.6
        bloques.push({
          p: [bx + (r() - 0.5) * (bw - 5), bh + h / 2, bz + (r() - 0.5) * (bd - 4)],
          s: [1.2 + r() * 2.2, h, 1.2 + r() * 2.2],
          c: r() > 0.5 ? '#4b5563' : '#93a3b3',
          ry: r() * 0.8,
        })
      }
      bloques.push({ p: [bx + bw / 4, bh + 1.3, bz - bd / 4], s: [3, 2.6, 3], c: '#c4bcb0' })
    }

    const paraderos: Inst[] = []
    const techos: Inst[] = []
    for (const x of [-38, 14, 62]) {
      paraderos.push({ p: [x, 1.2, -33.6], s: [4.6, 0.12, 0.16], c: '#475569' })
      techos.push({ p: [x, 2.5, -33.2], s: [5, 0.14, 1.6], c: '#0ea5e9' })
    }
    return { carrocerias, cabinas, bloques, paraderos, techos }
  }, [])

  return (
    <group>
      {/* suelo urbano al otro lado de la avenida */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, -140]} receiveShadow>
        <planeGeometry args={[440, 230]} />
        <meshStandardMaterial color="#c9c1b4" />
      </mesh>
      {/* vereda y berma al otro lado de la avenida */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, -35]} receiveShadow>
        <planeGeometry args={[400, 8]} />
        <meshStandardMaterial color="#c8c3bc" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.014, -26]}>
        <planeGeometry args={[400, 0.5]} />
        <meshStandardMaterial color="#facc15" />
      </mesh>
      <Instancias items={[...carrocerias, ...cabinas, ...bloques, ...paraderos, ...techos]}>
        <boxGeometry />
        <meshStandardMaterial roughness={0.6} />
      </Instancias>
    </group>
  )
}

/* ------------------------------------------------------------------- este */

function Ciudad() {
  const { torres, ventanas } = useMemo(() => {
    const r = rng(31415)
    const torres: Inst[] = []
    const ventanas: Inst[] = []
    for (let i = 0; i < 48; i++) {
      const x = 88 + r() * 200
      const z = -150 + r() * 300
      const h = 10 + r() * 58 * (0.4 + (x - 88) / 200)
      const w = 10 + r() * 12
      const d = 10 + r() * 12
      const gris = 0.72 + r() * 0.2
      const col = new THREE.Color(gris * 0.96, gris * 0.95, gris)
      torres.push({ p: [x, h / 2, z], s: [w, h, d], c: `#${col.getHexString()}` })
      // ventanas emisivas sólo en la cara que mira al edificio (-x)
      const filas = Math.max(2, Math.floor(h / 4))
      const cols = Math.max(2, Math.floor(d / 4.5))
      for (let f = 0; f < filas; f++) {
        for (let c = 0; c < cols; c++) {
          if (r() > 0.45) continue
          const vy = 3 + f * 4
          if (vy > h - 1.5) continue
          ventanas.push({
            p: [x - w / 2 - 0.1, vy, z - d / 2 + 2.2 + c * 4.5],
            s: [0.12, 1.6, 2.2],
            c: r() > 0.6 ? '#fde68a' : '#bae6fd',
          })
        }
      }
    }
    return { torres, ventanas: ventanas.slice(0, 480) }
  }, [])

  return (
    <group>
      <Instancias items={torres}>
        <boxGeometry />
        <meshStandardMaterial roughness={0.8} />
      </Instancias>
      <Instancias items={ventanas}>
        <boxGeometry />
        <meshStandardMaterial roughness={0.3} emissive="#ffffff" emissiveIntensity={0.25} toneMapped={false} />
      </Instancias>
    </group>
  )
}

/* ------------------------------------------------------------------ oeste */

/** ruido suave y determinista para la silueta de los cerros */
function ruido(x: number, z: number) {
  return (
    Math.sin(x * 0.031) * Math.cos(z * 0.024) +
    0.55 * Math.sin(x * 0.071 + 1.7) * Math.cos(z * 0.058 + 0.4) +
    0.28 * Math.sin(x * 0.13 + 3.1) * Math.cos(z * 0.11 + 2.2)
  )
}

/** altura de la ladera en (x,z) para una capa dada */
function alturaCerro(x: number, z: number, cx: number, ancho: number, alto: number) {
  const t = 1 - Math.min(1, Math.abs(x - cx) / (ancho / 2))
  const n = (ruido(x, z) + 1.85) / 3.7
  return Math.max(0, alto * (0.35 + 0.65 * n) * (0.25 + 0.75 * t))
}

const CAPAS: { cx: number; ancho: number; alto: number; color: string }[] = [
  { cx: -132, ancho: 130, alto: 26, color: '#8a8459' },
  { cx: -205, ancho: 170, alto: 52, color: '#7d7f5c' },
  { cx: -300, ancho: 220, alto: 88, color: '#8d8b7a' },
]

function Cerros() {
  const geos = useMemo(
    () =>
      CAPAS.map(capa => {
        const g = new THREE.PlaneGeometry(capa.ancho, 420, 18, 26)
        g.rotateX(-Math.PI / 2)
        const pos = g.attributes.position as THREE.BufferAttribute
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i) + capa.cx
          const z = pos.getZ(i)
          pos.setY(i, alturaCerro(x, z, capa.cx, capa.ancho, capa.alto))
        }
        pos.needsUpdate = true
        g.computeVertexNormals()
        return g
      }),
    [],
  )
  useEffect(() => () => geos.forEach(g => g.dispose()), [geos])

  const casas = useMemo(() => {
    const r = rng(9001)
    const out: Inst[] = []
    // barrio bajo entre el edificio y la ladera: sin él el primer plano es un techo gris enorme
    const TONOS = ['#d6bfa4', '#c98f6a', '#b4785a', '#cdb894', '#a8674f', '#dcc7a8']
    for (let i = 0; i < 54; i++) {
      const h = 2.8 + r() * 4.5
      out.push({
        p: [-56 - r() * 62, h / 2, -150 + r() * 300],
        s: [7 + r() * 7, h, 7 + r() * 7],
        c: TONOS[Math.floor(r() * TONOS.length)],
        ry: r() * 0.5 - 0.25,
      })
    }
    const capa = CAPAS[0]
    for (let i = 0; i < 46; i++) {
      const x = capa.cx - capa.ancho / 2 + 12 + r() * (capa.ancho - 30)
      const z = -160 + r() * 320
      const y = alturaCerro(x, z, capa.cx, capa.ancho, capa.alto)
      const h = 2.4 + r() * 1.4
      out.push({
        p: [x, y + h / 2, z],
        s: [4 + r() * 2.5, h, 4 + r() * 2.5],
        c: r() > 0.5 ? '#d6bfa4' : '#c98f6a',
        ry: r() * 0.6 - 0.3,
      })
    }
    return out
  }, [])

  return (
    <group>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g} position={[CAPAS[i].cx, 0, 0]} receiveShadow>
          <meshStandardMaterial color={CAPAS[i].color} roughness={1} flatShading />
        </mesh>
      ))}
      <Instancias items={casas}>
        <boxGeometry />
        <meshStandardMaterial roughness={0.95} />
      </Instancias>
    </group>
  )
}
