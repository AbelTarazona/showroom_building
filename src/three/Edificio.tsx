import { useMemo } from 'react'
import { Html, Edges } from '@react-three/drei'
import * as THREE from 'three'
import { useStore, pasaFiltros, type ModoColor } from '../store'
import { ESTADO_COLOR, type Unidad } from '../lib/types'

const COLOR_TIPOLOGIA: Record<string, string> = { A: '#3b82f6', B: '#a855f7', C: '#14b8a6' }

export function colorDeUnidad(u: Unidad, modo: ModoColor, rangoPrecio: [number, number]) {
  if (modo === 'estado') return ESTADO_COLOR[u.estado]
  if (modo === 'tipologia') return COLOR_TIPOLOGIA[u.tipologia_id] ?? '#94a3b8'
  const t = (u.precio - rangoPrecio[0]) / Math.max(1, rangoPrecio[1] - rangoPrecio[0])
  return new THREE.Color().setHSL(0.33 - 0.33 * t, 0.75, 0.5).getStyle()
}

/** Normal exterior de la unidad (para cámara y ventanas). Esquinas promedian sus dos caras. */
export function normalExterior(u: Unidad, slot: number): THREE.Vector3 {
  const n = new THREE.Vector3()
  if (u.x >= slot) n.x += 1
  if (u.x <= -slot) n.x -= 1
  if (u.z >= slot) n.z += 1
  if (u.z <= -slot) n.z -= 1
  return n.lengthSq() ? n.normalize() : new THREE.Vector3(0, 0, 1)
}

function Ventanas({ u, slot, ancho, alto }: { u: Unidad; slot: number; ancho: number; alto: number }) {
  const caras: { pos: [number, number, number]; rot: [number, number, number] }[] = []
  const off = ancho / 2 + 0.02
  if (u.x >= slot) caras.push({ pos: [off, 0, 0], rot: [0, Math.PI / 2, 0] })
  if (u.x <= -slot) caras.push({ pos: [-off, 0, 0], rot: [0, -Math.PI / 2, 0] })
  if (u.z >= slot) caras.push({ pos: [0, 0, off], rot: [0, 0, 0] })
  if (u.z <= -slot) caras.push({ pos: [0, 0, -off], rot: [0, Math.PI, 0] })
  return (
    <>
      {caras.map((c, i) => (
        <group key={i} position={c.pos} rotation={c.rot}>
          <mesh position={[-ancho * 0.22, 0.1, 0]}>
            <planeGeometry args={[ancho * 0.32, alto * 0.5]} />
            <meshStandardMaterial color="#bfdbfe" metalness={0.6} roughness={0.2} />
          </mesh>
          <mesh position={[ancho * 0.22, 0.1, 0]}>
            <planeGeometry args={[ancho * 0.32, alto * 0.5]} />
            <meshStandardMaterial color="#bfdbfe" metalness={0.6} roughness={0.2} />
          </mesh>
        </group>
      ))}
    </>
  )
}

function UnidadMesh({ u, color, opacidad, seleccionada, hovered, interactivo, onSeleccion }: {
  u: Unidad; color: string; opacidad: number; seleccionada: boolean; hovered: boolean
  interactivo: boolean; onSeleccion?: (id: string) => void
}) {
  const { layout } = useStore(s => s.edificio)
  const seleccionar = useStore(s => s.seleccionar)
  const setHover = useStore(s => s.setHover)
  const ancho = layout.slot - 0.5
  const alto = layout.alturaPiso - 0.35
  const visible = opacidad > 0.05
  const activa = seleccionada || hovered
  return (
    <group position={[u.x, u.y + alto / 2 + 0.15, u.z]}>
      <mesh
        castShadow={opacidad > 0.5}
        receiveShadow
        onClick={(e) => {
          e.stopPropagation()
          if (!visible) return
          if (interactivo) seleccionar(u.id)
          onSeleccion?.(u.id)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          if (!visible) return
          if (interactivo) { setHover(u.id); document.body.style.cursor = 'pointer' }
          else if (onSeleccion) document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          if (interactivo) setHover(null)
          document.body.style.cursor = 'auto'
        }}
        scale={seleccionada ? 1.04 : 1}
      >
        <boxGeometry args={[ancho, alto, ancho]} />
        {/* key: three.js compila OPAQUE en el shader; al cambiar `transparent` hay que recrear el material */}
        <meshStandardMaterial
          key={opacidad < 1 ? 'transp' : 'opaco'}
          color={color}
          transparent={opacidad < 1}
          opacity={opacidad}
          emissive={activa ? color : '#000000'}
          emissiveIntensity={seleccionada ? 0.55 : hovered ? 0.3 : 0}
          roughness={0.7}
          depthWrite={opacidad >= 0.5}
        />
        {opacidad >= 0.5 && <Edges color={seleccionada ? '#ffffff' : '#0f172a'} threshold={15} />}
      </mesh>
      {opacidad >= 0.5 && <Ventanas u={u} slot={layout.slot} ancho={ancho} alto={alto} />}
      {seleccionada && (
        <Html center distanceFactor={40} position={[0, alto / 2 + 1.2, 0]} zIndexRange={[25, 0]}>
          <div className="px-2 py-1 rounded-md bg-slate-900/90 text-white text-xs font-semibold whitespace-nowrap shadow-lg">
            {u.id}
          </div>
        </Html>
      )}
    </group>
  )
}

export default function Edificio({ colores, interactivo = true, onSeleccion }: {
  /** color por unidad; si existe para un id, reemplaza a colorDeUnidad (usado por el mapa de calor) */
  colores?: Record<string, string>
  /** false: sin hover/click de store ni etiquetas de piso clicables; onSeleccion sigue disponible para tooltip */
  interactivo?: boolean
  onSeleccion?: (id: string) => void
} = {}) {
  const edificio = useStore(s => s.edificio)
  const unidades = useStore(s => s.unidades)
  const seleccion = useStore(s => s.seleccion)
  const pisoSel = useStore(s => s.pisoSeleccionado)
  const hover = useStore(s => s.hover)
  const modoColor = useStore(s => s.modoColor)
  const filtros = useStore(s => s.filtros)
  const seleccionarPiso = useStore(s => s.seleccionarPiso)
  const { layout, tipologias } = edificio

  const lista = useMemo(() => Object.values(unidades), [unidades])
  const rangoPrecio = useMemo<[number, number]>(() => {
    const p = lista.map(u => u.precio)
    return [Math.min(...p), Math.max(...p)]
  }, [lista])
  const dormitoriosDe = (tid: string) => tipologias.find(t => t.id === tid)?.dormitorios ?? 0

  const alturaTotal = layout.alturaBase + layout.pisos * layout.alturaPiso
  const anchoTotal = layout.slot * 3

  return (
    <group>
      {/* zócalo: lobby y locales */}
      <mesh position={[0, layout.alturaBase / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[anchoTotal + 1.5, layout.alturaBase, anchoTotal + 1.5]} />
        <meshStandardMaterial color="#e7e5e4" />
      </mesh>
      <mesh position={[0, layout.alturaBase * 0.45, (anchoTotal + 1.5) / 2 + 0.02]}>
        <planeGeometry args={[anchoTotal - 2, layout.alturaBase * 0.6]} />
        <meshStandardMaterial color="#93c5fd" metalness={0.6} roughness={0.15} />
      </mesh>
      <Html center distanceFactor={60} position={[0, layout.alturaBase * 0.5, (anchoTotal + 1.5) / 2 + 0.3]} zIndexRange={[10, 0]}>
        <div className="text-[10px] uppercase tracking-widest text-slate-700 font-bold bg-white/80 px-2 py-0.5 rounded">Lobby · locales</div>
      </Html>

      {/* núcleo de circulación (ascensores + escalera) */}
      <mesh position={[layout.nucleo.x, layout.alturaBase + (alturaTotal - layout.alturaBase) / 2 + 0.3, layout.nucleo.z]} castShadow receiveShadow>
        <boxGeometry args={[layout.nucleo.w - 0.6, alturaTotal - layout.alturaBase + 0.6, layout.nucleo.d - 0.6]} />
        <meshStandardMaterial color="#a8a29e" />
      </mesh>

      {/* losas por piso */}
      {Array.from({ length: layout.pisos + 1 }).map((_, i) => {
        const y = layout.alturaBase + i * layout.alturaPiso
        const activo = pisoSel === i + 1
        const atenuado = pisoSel !== null && !activo && i !== layout.pisos
        return (
          <mesh key={i} position={[0, y + 0.06, 0]} receiveShadow>
            <boxGeometry args={[anchoTotal + 0.8, 0.14, anchoTotal + 0.8]} />
            <meshStandardMaterial key={atenuado ? 't' : 'o'} color={activo ? '#fde68a' : '#f5f5f4'} transparent={atenuado} opacity={atenuado ? 0.25 : 1} />
          </mesh>
        )
      })}

      {/* unidades */}
      {lista.map(u => {
        const pasa = pasaFiltros(u, filtros, dormitoriosDe)
        const enPiso = pisoSel === null || u.piso === pisoSel
        const opacidad = !pasa ? 0.08 : !enPiso ? 0.14 : 1
        return (
          <UnidadMesh
            key={u.id}
            u={u}
            color={colores?.[u.id] ?? colorDeUnidad(u, modoColor, rangoPrecio)}
            opacidad={opacidad}
            seleccionada={seleccion === u.id}
            hovered={hover === u.id}
            interactivo={interactivo}
            onSeleccion={onSeleccion}
          />
        )
      })}

      {/* etiquetas de piso (clicables) en la esquina noroeste; se ocultan al enfocar una unidad */}
      {interactivo && seleccion === null && Array.from({ length: layout.pisos }).map((_, i) => {
        const piso = i + 1
        const y = layout.alturaBase + i * layout.alturaPiso + layout.alturaPiso / 2
        const activo = pisoSel === piso
        return (
          <Html key={piso} center distanceFactor={55} position={[-anchoTotal / 2 - 1.6, y, anchoTotal / 2 + 0.5]} zIndexRange={[20, 0]}>
            <button
              onClick={() => seleccionarPiso(activo ? null : piso)}
              className={`text-[11px] font-bold px-1.5 py-0.5 rounded shadow ${activo ? 'bg-amber-400 text-slate-900' : 'bg-slate-900/80 text-white hover:bg-slate-700'}`}
            >
              P{piso}
            </button>
          </Html>
        )
      })}
    </group>
  )
}
