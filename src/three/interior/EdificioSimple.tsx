import { useMemo } from 'react'
import { useStore } from '../../store'
import { ladosExterioresMundo, type Caja } from './planos'
import Cajas from './Cajas'

/**
 * El resto del edificio, simplificado y en dos llamadas de dibujo: volúmenes de las demás
 * unidades, losas, núcleo y zócalo (opaco) + paños de vidrio de fachada (reflejante).
 * Se usa desde el interior y desde la vista de ventana para que lo que se ve fuera sea el
 * edificio real, no un decorado.
 */
export default function EdificioSimple({ excluir }: { excluir?: string | null }) {
  const edificio = useStore(s => s.edificio)
  // Geometría fija (posiciones del JSON): no se rehace por cambios de estado/precio vía Realtime
  const unidades = edificio.unidades

  const { solidos, vidrios } = useMemo(() => {
    const { slot, pisos, alturaPiso, alturaBase, nucleo } = edificio.layout
    const solidos: Caja[] = []
    const vidrios: Caja[] = []
    const ancho = slot - 0.54           // algo menor que la unidad real: evita z-fighting con los muros
    const alto = alturaPiso - 0.35
    const total = slot * 3

    for (const u of unidades) {
      if (u.id === excluir) continue
      const cy = u.y + alto / 2 + 0.15
      solidos.push({ p: [u.x, cy, u.z], s: [ancho, alto, ancho], c: u.piso % 2 ? '#e8e4de' : '#ded9d2' })
      for (const lado of ladosExterioresMundo(u, slot)) {
        const d = ancho / 2 + 0.03
        const p: [number, number, number] =
          lado === '+x' ? [u.x + d, cy + 0.1, u.z]
          : lado === '-x' ? [u.x - d, cy + 0.1, u.z]
          : lado === '+z' ? [u.x, cy + 0.1, u.z + d]
          : [u.x, cy + 0.1, u.z - d]
        const s: [number, number, number] =
          lado === '+x' || lado === '-x' ? [0.06, alto * 0.62, ancho * 0.82] : [ancho * 0.82, alto * 0.62, 0.06]
        vidrios.push({ p, s, c: '#9fc4e8' })
      }
    }

    // losas entre pisos (incluye la de azotea)
    for (let i = 0; i <= pisos; i++) {
      solidos.push({ p: [0, alturaBase + i * alturaPiso + 0.06, 0], s: [total + 0.8, 0.14, total + 0.8], c: '#cfcac2' })
    }
    // núcleo de circulación y zócalo
    solidos.push({
      p: [nucleo.x, alturaBase + (pisos * alturaPiso) / 2, nucleo.z],
      s: [nucleo.w, pisos * alturaPiso, nucleo.d],
      c: '#c9c4bc',
    })
    solidos.push({ p: [0, alturaBase / 2, 0], s: [total + 0.6, alturaBase, total + 0.6], c: '#b8b3ab' })

    return { solidos, vidrios }
  }, [edificio, unidades, excluir])

  return (
    <>
      <Cajas items={solidos} roughness={0.9} sombras={false} />
      <Cajas items={vidrios} roughness={0.15} metalness={0.75} sombras={false} />
    </>
  )
}
