import { useLayoutEffect, useState, useRef, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { useThree } from '@react-three/fiber'

/**
 * Capa HTML a pantalla completa sobre el canvas. `Html fullscreen` de drei ancla el div a la
 * posición en pantalla de un objeto 3D (y lo oculta si queda detrás de la cámara), que es justo
 * lo que no queremos para un HUD en primera persona: aquí montamos un div propio encima del
 * canvas en su propia raíz de React y lo desmontamos al salir.
 */
export default function Overlay({ children, z = 10 }: { children: ReactNode; z?: number }) {
  const gl = useThree(s => s.gl)
  const [div] = useState(() => document.createElement('div'))
  const raiz = useRef<Root | null>(null)

  useLayoutEffect(() => {
    div.style.cssText = `position:absolute;inset:0;pointer-events:none;z-index:${z}`
    const padre = gl.domElement.parentElement
    padre?.appendChild(div)
    const r = createRoot(div)
    raiz.current = r
    return () => {
      raiz.current = null
      setTimeout(() => {
        r.unmount()
        div.remove()
      }, 0)
    }
  }, [gl, div, z])

  useLayoutEffect(() => {
    raiz.current?.render(<>{children}</>)
  })

  return null
}
