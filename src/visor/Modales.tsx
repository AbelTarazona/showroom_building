// Fases 2, 4, 6, 7 implementan aquí cada modal (ver src/visor/ui.ts para la lista).
// Cada modal recibe la unidad seleccionada desde el store y cierra con useUI().cerrar().
import { useUI } from './ui'
import Simulador from './modales/Simulador'
import Precalificar from './modales/Precalificar'
import Lead from './modales/Lead'
import Separar from './modales/Separar'
import Agendar from './modales/Agendar'
import Comparar from './modales/Comparar'
import Chat from './modales/Chat'
import Incidencia from './modales/Incidencia'

export function ModalBase({ titulo, children, onClose }: { titulo: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full sm:max-w-md bg-white text-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h2 className="text-lg font-bold">{titulo}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 text-xl leading-none px-2">×</button>
        </div>
        <div className="px-5 pb-5">{children}</div>
      </div>
    </div>
  )
}

export default function Modales() {
  const modal = useUI(s => s.modal)
  const cerrar = useUI(s => s.cerrar)
  if (!modal) return null

  if (modal === 'simulador') return <ModalBase titulo="Simula tu cuota" onClose={cerrar}><Simulador /></ModalBase>
  if (modal === 'precalificar') return <ModalBase titulo="¿Califico a un bono?" onClose={cerrar}><Precalificar /></ModalBase>
  if (modal === 'lead') return <ModalBase titulo="Que me contacten" onClose={cerrar}><Lead /></ModalBase>
  if (modal === 'separar') return <ModalBase titulo="Separar este depa" onClose={cerrar}><Separar /></ModalBase>
  if (modal === 'agendar') return <ModalBase titulo="Agenda tu visita" onClose={cerrar}><Agendar /></ModalBase>
  if (modal === 'comparar') return <ModalBase titulo="Comparar unidades" onClose={cerrar}><Comparar /></ModalBase>
  if (modal === 'chat') return <ModalBase titulo="Pregunta sobre el proyecto" onClose={cerrar}><Chat /></ModalBase>
  if (modal === 'incidencia') return <ModalBase titulo="Reportar incidencia" onClose={cerrar}><Incidencia /></ModalBase>
  return null
}
