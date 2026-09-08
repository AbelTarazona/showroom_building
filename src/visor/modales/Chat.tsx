// Fase 7: chat de consultas con IA (OpenAI) sobre el proyecto, con fallback por reglas.
import { useEffect, useRef, useState } from 'react'
import { create } from 'zustand'
import { useStore } from '../../store'
import { useUI } from '../ui'
import { iaDisponible, responderConsulta, type MensajeChat } from '../../lib/ia'

const SUGERENCIAS = [
  '¿Cuánto es la cuota de un 2 dorm?',
  '¿Puedo usar Techo Propio?',
  '¿Cuándo entregan?',
  '¿Qué depas quedan con vista al parque?',
]

/** Historial en memoria de la sesión (se pierde al recargar, se conserva al cerrar/abrir el modal). */
const useChatStore = create<{ mensajes: MensajeChat[]; agregar: (m: MensajeChat) => void }>((set, get) => ({
  mensajes: [
    {
      rol: 'asistente',
      texto: 'Hola, soy el asistente virtual del proyecto. Pregúntame por precios, cuotas, bonos, entrega o disponibilidad.',
    },
  ],
  agregar: (m) => set({ mensajes: [...get().mensajes, m] }),
}))

export default function Chat() {
  const { mensajes, agregar } = useChatStore()
  const edificio = useStore(s => s.edificio)
  const unidades = useStore(s => s.unidades)
  const seleccion = useStore(s => s.seleccion)
  const unidadSel = seleccion ? unidades[seleccion] : null
  const abrir = useUI(s => s.abrir)

  const [texto, setTexto] = useState('')
  const [escribiendo, setEscribiendo] = useState(false)
  const finRef = useRef<HTMLDivElement>(null)
  const conIa = iaDisponible()

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [mensajes, escribiendo])

  async function enviar(pregunta: string) {
    const q = pregunta.trim()
    if (!q || escribiendo) return
    agregar({ rol: 'usuario', texto: q })
    setTexto('')
    setEscribiendo(true)
    try {
      const historialActual = useChatStore.getState().mensajes
      const { texto: respuesta } = await responderConsulta(q, historialActual, edificio, unidades, {
        unidadSeleccionada: unidadSel,
      })
      agregar({ rol: 'asistente', texto: respuesta })
    } catch (e) {
      console.warn('[chat]', e)
      agregar({ rol: 'asistente', texto: 'Tuve un problema respondiendo. Intenta de nuevo o deja tus datos para que te contacte un asesor.' })
    } finally {
      setEscribiendo(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
            conIa ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${conIa ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          {conIa ? 'IA (OpenAI)' : 'Modo sin conexión'}
        </span>
        {unidadSel && <span className="text-xs text-slate-400">Viendo {unidadSel.id}</span>}
      </div>

      <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto pr-1">
        {mensajes.map((m, i) => (
          <div key={i} className={`flex ${m.rol === 'usuario' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-line ${
                m.rol === 'usuario' ? 'bg-slate-900 text-white rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm'
              }`}
            >
              {m.texto}
            </div>
          </div>
        ))}
        {escribiendo && (
          <div className="flex justify-start">
            <div className="bg-slate-100 text-slate-400 rounded-2xl rounded-bl-sm px-3.5 py-2 text-sm">Escribiendo…</div>
          </div>
        )}
        <div ref={finRef} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {SUGERENCIAS.map(s => (
          <button
            key={s}
            onClick={() => void enviar(s)}
            disabled={escribiendo}
            className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            {s}
          </button>
        ))}
        <button
          onClick={() => abrir('incidencia')}
          className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs text-amber-700 hover:bg-amber-100"
        >
          🛠 Reportar incidencia
        </button>
      </div>

      <div className="flex gap-2">
        <input
          value={texto}
          onChange={e => setTexto(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') void enviar(texto)
          }}
          placeholder="Escribe tu pregunta..."
          className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
        />
        <button
          onClick={() => void enviar(texto)}
          disabled={escribiendo || !texto.trim()}
          className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-semibold disabled:bg-slate-300"
        >
          Enviar
        </button>
      </div>

      <button
        onClick={() => abrir('lead')}
        className="text-sm font-semibold text-sky-600 hover:underline text-center"
      >
        Que me contacte un asesor
      </button>
    </div>
  )
}
