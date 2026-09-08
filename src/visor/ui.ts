import { create } from 'zustand'

/** Modales del visor. Las fases 2 y 4 implementan su contenido en Modales.tsx. */
export type Modal =
  | null
  | 'simulador'      // fase 2: simulador de cuota para la unidad seleccionada
  | 'precalificar'   // fase 2: precalificación a bonos + captura de lead
  | 'lead'           // fase 2: captura de lead simple (nombre + teléfono + consentimiento)
  | 'separar'        // fase 4: separar unidad (crea/usa lead, marca unidad, ofrece agendar)
  | 'agendar'        // fase 4: agendar visita / llamada
  | 'comparar'       // fase 6: comparar unidades marcadas
  | 'chat'           // fase 7: consultas con IA (OpenAI) sobre el proyecto
  | 'incidencia'     // fase 7: registro de incidencia postventa

interface UIState {
  modal: Modal
  abrir: (m: Modal) => void
  cerrar: () => void
  toast: string | null
  notificar: (msg: string) => void
}

let temporizadorToast: ReturnType<typeof setTimeout> | null = null

export const useUI = create<UIState>((set) => ({
  modal: null,
  abrir: (modal) => set({ modal }),
  cerrar: () => set({ modal: null }),
  toast: null,
  notificar: (toast) => {
    set({ toast })
    if (temporizadorToast) clearTimeout(temporizadorToast)
    temporizadorToast = setTimeout(() => { set({ toast: null }); temporizadorToast = null }, 2800)
  },
}))
