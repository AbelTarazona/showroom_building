import { useEffect, useState } from 'react'
import { useStore } from '../../store'
import { telefonoValido } from '../../lib/scoring'
import { guardarLead, leadActual, leerPrecalificacionLocal } from '../../lib/leads'
import { getLeadId } from '../../lib/tracking'
import { useUI } from '../ui'
import type { Lead as LeadType } from '../../lib/types'
import { programarSeguimientos } from '../../lib/seguimientos'
import { supabase, supabaseDisponible } from '../../lib/supabase'

/**
 * Formulario mínimo (nombre + celular + consentimiento) reutilizado por los modales de
 * Fase 4 (Separar/Agendar) cuando aún no existe un lead. Guarda el lead y avisa con `onListo`.
 */
export function DatosLeadMinimos({ unidadId, onListo }: { unidadId?: string | null; onListo: (lead: LeadType) => void }) {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [consiente, setConsiente] = useState(false)
  const [errorTelefono, setErrorTelefono] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const notificar = useUI(s => s.notificar)

  const enviar = async () => {
    if (!nombre.trim()) { setErrorTelefono(null); notificar('Escribe tu nombre'); return }
    if (!telefonoValido(telefono)) { setErrorTelefono('Ingresa un celular peruano válido (9 dígitos, empieza en 9).'); return }
    if (!consiente) { notificar('Debes aceptar que te contactemos'); return }
    setErrorTelefono(null)
    setEnviando(true)
    try {
      const precalLocal = leerPrecalificacionLocal()
      const lead = await guardarLead({
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        ingreso_familiar: precalLocal?.input?.ingreso ?? null,
        ahorro: precalLocal?.input?.ahorro ?? null,
        tiene_vivienda: precalLocal?.input?.tieneVivienda ?? null,
        num_familia: precalLocal?.input?.numFamilia ?? null,
        distrito: precalLocal?.distrito ?? null,
        consentimiento: true,
        precalificacion: precalLocal?.resultado ?? null,
        unidad_interes_id: unidadId ?? null,
      })
      onListo(lead)
    } catch (e) {
      console.warn('[lead]', e)
      notificar('No se pudo guardar. Intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">Primero necesitamos tus datos para continuar.</p>
      <div>
        <label className="text-xs font-semibold text-slate-700 mb-1 block">Nombre</label>
        <input value={nombre} onChange={e => setNombre(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Tu nombre" />
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-700 mb-1 block">Celular</label>
        <input
          value={telefono}
          onChange={e => { setTelefono(e.target.value); setErrorTelefono(null) }}
          inputMode="tel"
          className={`w-full border rounded-lg px-3 py-2 text-sm ${errorTelefono ? 'border-rose-400' : 'border-slate-300'}`}
          placeholder="Ej. 987 654 321"
        />
        {errorTelefono && <div className="text-xs text-rose-600 mt-1">{errorTelefono}</div>}
      </div>
      <label className="flex items-start gap-2 text-xs text-slate-600">
        <input type="checkbox" checked={consiente} onChange={e => setConsiente(e.target.checked)} className="mt-0.5 accent-emerald-600" />
        <span>Acepto que Constructora Demo me contacte por WhatsApp/llamada sobre este proyecto. Demo: no se comparten datos reales.</span>
      </label>
      <button onClick={enviar} disabled={enviando} className="w-full bg-amber-400 disabled:bg-slate-300 text-slate-900 font-bold py-3 rounded-xl hover:bg-amber-300 disabled:cursor-not-allowed">
        {enviando ? 'Guardando...' : 'Continuar'}
      </button>
    </div>
  )
}

/** Si el lead aún no tiene ninguna cita, programa la secuencia de seguimiento 'lead_sin_cita'. */
async function programarSeguimientoSinCita(lead: LeadType) {
  if (!supabaseDisponible) return
  try {
    const { data: citas } = await supabase.from('citas').select('id').eq('lead_id', lead.id).limit(1)
    if (citas && citas.length > 0) return
    const unidad = lead.unidad_interes_id ? useStore.getState().unidades[lead.unidad_interes_id] : null
    await programarSeguimientos(lead, { unidad, motivo: 'lead_sin_cita' })
  } catch (e) {
    console.warn('[lead]', e)
  }
}

export default function Lead() {
  const seleccion = useStore(s => s.seleccion)
  const cerrar = useUI(s => s.cerrar)
  const notificar = useUI(s => s.notificar)

  const [cargando, setCargando] = useState(true)
  const [leadExistente, setLeadExistente] = useState<LeadType | null>(null)
  const [editar, setEditar] = useState(false)

  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [consiente, setConsiente] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [errorTelefono, setErrorTelefono] = useState<string | null>(null)

  useEffect(() => {
    let activo = true
    if (!getLeadId()) { setCargando(false); return }
    leadActual().then(lead => {
      if (!activo) return
      setLeadExistente(lead)
      if (lead) {
        setNombre(lead.nombre ?? '')
        setTelefono(lead.telefono ?? '')
        setEmail(lead.email ?? '')
      }
      setCargando(false)
    })
    return () => { activo = false }
  }, [])

  const validarYEnviar = async () => {
    if (!nombre.trim()) { notificar('Escribe tu nombre'); return }
    if (!telefonoValido(telefono)) { setErrorTelefono('Ingresa un celular peruano válido (9 dígitos, empieza en 9).'); return }
    if (!consiente) { notificar('Debes aceptar que te contactemos'); return }
    setErrorTelefono(null)
    setEnviando(true)
    try {
      const precalLocal = leerPrecalificacionLocal()
      const lead = await guardarLead({
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        email: email.trim() || null,
        ingreso_familiar: precalLocal?.input?.ingreso ?? null,
        ahorro: precalLocal?.input?.ahorro ?? null,
        tiene_vivienda: precalLocal?.input?.tieneVivienda ?? null,
        num_familia: precalLocal?.input?.numFamilia ?? null,
        distrito: precalLocal?.distrito ?? null,
        consentimiento: true,
        precalificacion: precalLocal?.resultado ?? null,
        unidad_interes_id: seleccion,
      })
      notificar('¡Listo! Un asesor te contactará')
      cerrar()
      // No bloquea el cierre del modal: si el lead no tiene citas aún, se programa su seguimiento.
      void programarSeguimientoSinCita(lead)
    } catch (e) {
      console.warn('[lead]', e)
      notificar('No se pudo guardar. Intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  if (cargando) {
    return <p className="text-slate-500 text-sm">Cargando...</p>
  }

  if (leadExistente && !editar) {
    return (
      <div className="space-y-3">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800">
          Ya tenemos tus datos, <span className="font-bold">{leadExistente.nombre}</span>. Un asesor te contactará al {leadExistente.telefono ?? 'número que registraste'}.
        </div>
        <button onClick={() => setEditar(true)} className="w-full text-sm font-semibold text-slate-700 underline">Actualizar mi celular</button>
        <button onClick={cerrar} className="w-full bg-slate-900 text-white font-semibold py-2.5 rounded-xl">Cerrar</button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">Déjanos tus datos y un asesor te escribe por WhatsApp o te llama.</p>

      <div>
        <label className="text-xs font-semibold text-slate-700 mb-1 block">Nombre</label>
        <input value={nombre} onChange={e => setNombre(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Tu nombre" />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-700 mb-1 block">Celular</label>
        <input
          value={telefono}
          onChange={e => { setTelefono(e.target.value); setErrorTelefono(null) }}
          inputMode="tel"
          className={`w-full border rounded-lg px-3 py-2 text-sm ${errorTelefono ? 'border-rose-400' : 'border-slate-300'}`}
          placeholder="Ej. 987 654 321"
        />
        {errorTelefono && <div className="text-xs text-rose-600 mt-1">{errorTelefono}</div>}
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-700 mb-1 block">Correo (opcional)</label>
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="tucorreo@ejemplo.com" />
      </div>

      <label className="flex items-start gap-2 text-xs text-slate-600">
        <input type="checkbox" checked={consiente} onChange={e => setConsiente(e.target.checked)} className="mt-0.5 accent-emerald-600" />
        <span>Acepto que Constructora Demo me contacte por WhatsApp/llamada sobre este proyecto. Demo: no se comparten datos reales.</span>
      </label>

      <button onClick={validarYEnviar} disabled={enviando} className="w-full bg-amber-400 disabled:bg-slate-300 text-slate-900 font-bold py-3 rounded-xl hover:bg-amber-300 disabled:cursor-not-allowed">
        {enviando ? 'Guardando...' : 'Quiero que me contacten'}
      </button>
    </div>
  )
}
