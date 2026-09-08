import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store'
import { telefonoWhatsapp } from '../lib/scoring'
import {
  actualizarCita,
  actualizarEtapa,
  ETAPAS,
  ETAPA_COLOR,
  ETAPA_LABEL,
  marcarSeguimientoEnviado,
  useCitas,
  useLead,
  useSeguimientos,
} from './datos'
import { formatoFechaHora, tiempoRelativo, unidadLabel } from './formato'
import { soles, type Evento, type Lead as LeadType } from '../lib/types'
import config from '../data/config.json'
import { guardarResumen, iaDisponible, resumirLead, type ResumenLead } from '../lib/ia'

const ICONO_EVENTO: Record<string, string> = {
  ver_edificio: '🏢',
  ver_piso: '🏙',
  ver_unidad: '👁',
  ver_interior: '🚪',
  ver_vista: '🪟',
  simular_cuota: '💰',
  precalificar: '✅',
  favorito: '♥',
  comparar: '⇄',
  compartir: '↗',
  iniciar_separacion: '🔒',
  separar: '🔒',
  agendar: '📅',
  consulta: '💬',
  abandonar: '👋',
}

const VEREDICTO_COLOR: Record<string, string> = {
  alta: 'text-emerald-600',
  media: 'text-amber-600',
  baja: 'text-red-500',
}

interface ProgramaPrecal {
  programa?: string
  nombre?: string
  elegible?: boolean
  bono_estimado?: number
  bono?: number
  motivo?: string
  motivos?: string[]
}
interface Precalificacion {
  veredicto?: string
  programas?: ProgramaPrecal[]
}

function ResumenIA({ lead, eventos }: { lead: LeadType; eventos: Evento[] }) {
  const unidades = useStore(s => s.unidades)
  const [generando, setGenerando] = useState(false)
  const [resultado, setResultado] = useState<ResumenLead | null>(null)
  const [error, setError] = useState<string | null>(null)

  const resumen = resultado?.resumen ?? lead.resumen_ia
  const siguienteAccion = resultado?.siguiente_accion ?? lead.siguiente_accion
  const origen = resultado?.origen ?? (lead.resumen_ia ? (iaDisponible() ? 'openai' : 'plantilla') : null)

  async function generar() {
    setGenerando(true)
    setError(null)
    try {
      const r = await resumirLead(lead, eventos, unidades)
      setResultado(r)
      await guardarResumen(lead.id, r)
    } catch (e) {
      console.warn('[resumen-ia]', e)
      setError('No se pudo generar el resumen. Intenta de nuevo.')
    } finally {
      setGenerando(false)
    }
  }

  const mensajeWhatsApp = resultado?.mensaje_whatsapp ?? null

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-700">Resumen IA</h3>
        {origen && (
          <span
            className={`text-[11px] font-semibold rounded-full px-2 py-0.5 ${
              origen === 'openai' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
            }`}
          >
            {origen === 'openai' ? 'OpenAI' : 'Plantilla'}
          </span>
        )}
      </div>

      {!resumen && !generando && <p className="text-sm text-slate-400 mb-3">Aún sin resumen para este lead.</p>}
      {generando && <p className="text-sm text-slate-400 mb-3">Generando resumen...</p>}
      {resumen && !generando && <p className="text-sm text-slate-600 whitespace-pre-line mb-2">{resumen}</p>}
      {siguienteAccion && !generando && (
        <div className="mt-1 mb-3 rounded-xl bg-sky-50 text-sky-700 text-sm font-medium px-3 py-2">
          Siguiente acción: {siguienteAccion}
        </div>
      )}
      {error && <p className="text-xs text-rose-600 mb-2">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => void generar()}
          disabled={generando}
          className="rounded-lg bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 disabled:bg-slate-300"
        >
          {generando ? 'Generando...' : resumen ? 'Regenerar' : 'Generar con IA'}
        </button>
        {mensajeWhatsApp && lead.telefono && (
          <a
            href={`https://wa.me/${telefonoWhatsapp(lead.telefono)}?text=${encodeURIComponent(mensajeWhatsApp)}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 hover:bg-emerald-700"
          >
            Enviar por WhatsApp
          </a>
        )}
      </div>
    </div>
  )
}

function textoEvento(ev: Evento, labelUnidad: (id: string | null) => string): string {
  switch (ev.tipo) {
    case 'ver_edificio':
      return 'Entró al showroom'
    case 'ver_piso':
      return `Vio el piso ${String(ev.payload?.piso ?? '')}`.trim()
    case 'ver_unidad':
      return `Vio ${labelUnidad(ev.unidad_id)}`
    case 'ver_interior':
      return `Recorrió el interior de ${labelUnidad(ev.unidad_id)}`
    case 'ver_vista':
      return `Miró la vista desde ${labelUnidad(ev.unidad_id)}`
    case 'simular_cuota':
      return `Simuló la cuota de ${labelUnidad(ev.unidad_id)}`
    case 'precalificar':
      return 'Completó la precalificación'
    case 'favorito':
      return `Guardó ${labelUnidad(ev.unidad_id)} como favorito`
    case 'comparar':
      return 'Comparó unidades'
    case 'compartir':
      return `Compartió ${labelUnidad(ev.unidad_id)}`
    case 'iniciar_separacion':
      return `Inició la separación de ${labelUnidad(ev.unidad_id)}`
    case 'separar':
      return `Separó ${labelUnidad(ev.unidad_id)}`
    case 'agendar':
      return 'Agendó una cita'
    case 'consulta':
      return 'Hizo una consulta'
    case 'abandonar':
      return 'Abandonó la sesión'
    default:
      return ev.tipo
  }
}

export default function LeadDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { lead, eventos, cargando } = useLead(id)
  const unidades = useStore(s => s.unidades)
  const tipologias = useStore(s => s.edificio.tipologias)
  const proyectoNombre = useStore(s => s.edificio.proyecto.nombre)
  const { citas } = useCitas()
  const { seguimientos } = useSeguimientos()

  const labelUnidadId = (uid: string | null) => {
    if (!uid) return 'una unidad'
    const u = unidades[uid]
    if (!u) return uid
    const t = tipologias.find(x => x.id === u.tipologia_id)
    return unidadLabel(u, t)
  }

  const unidadInteres = lead?.unidad_interes_id ? unidades[lead.unidad_interes_id] : null
  const tipologiaInteres = unidadInteres ? tipologias.find(t => t.id === unidadInteres.tipologia_id) : null

  const citasLead = useMemo(() => citas.filter(c => c.lead_id === id), [citas, id])
  const seguimientosLead = useMemo(() => seguimientos.filter(s => s.lead_id === id), [seguimientos, id])

  if (cargando) return <div className="p-6 text-sm text-slate-400">Cargando lead...</div>
  if (!lead) {
    return (
      <div className="p-6 text-sm text-slate-400">
        No se encontró el lead.{' '}
        <Link to="/panel" className="text-sky-600 underline">
          Volver
        </Link>
      </div>
    )
  }

  const mensajeWhatsApp = `Hola ${lead.nombre}, soy ${config.asesor.nombre} de ${proyectoNombre}. Vi que te interesó ${
    unidadInteres ? unidadLabel(unidadInteres, tipologiaInteres) : 'un departamento del proyecto'
  }. ¿Coordinamos una visita a la caseta?`

  const precal = ((lead.precalificacion as unknown) as Precalificacion | null) ?? null

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-4 max-w-5xl">
      <Link to="/panel" className="text-xs text-slate-400 hover:text-slate-600 w-fit">
        ← Volver a leads
      </Link>

      <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{lead.nombre}</h1>
            <p className="text-sm text-slate-500">
              {lead.telefono ?? 'sin teléfono'} {lead.distrito ? `· ${lead.distrito}` : ''}
            </p>
          </div>
          <select
            value={lead.etapa}
            onChange={e => void actualizarEtapa(lead.id, e.target.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold border-0 ${ETAPA_COLOR[lead.etapa] ?? 'bg-slate-100 text-slate-600'}`}
          >
            {ETAPAS.map(et => (
              <option key={et} value={et}>
                {ETAPA_LABEL[et]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={lead.telefono ? `tel:${lead.telefono}` : undefined}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              lead.telefono ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-300 pointer-events-none'
            }`}
          >
            Llamar
          </a>
          <a
            href={lead.telefono ? `https://wa.me/${telefonoWhatsapp(lead.telefono)}?text=${encodeURIComponent(mensajeWhatsApp)}` : undefined}
            target="_blank"
            rel="noreferrer"
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${
              lead.telefono ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-100 text-slate-300 pointer-events-none'
            }`}
          >
            WhatsApp
          </a>
          <button
            onClick={() => navigate('/panel/citas')}
            className="rounded-lg px-3 py-2 text-sm font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100"
          >
            Agendar
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Datos</h3>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-slate-400">Ingreso familiar</dt>
            <dd className="text-slate-700">{lead.ingreso_familiar != null ? soles(lead.ingreso_familiar) : '—'}</dd>
            <dt className="text-slate-400">Ahorro</dt>
            <dd className="text-slate-700">{lead.ahorro != null ? soles(lead.ahorro) : '—'}</dd>
            <dt className="text-slate-400">Familia</dt>
            <dd className="text-slate-700">{lead.num_familia ?? '—'} personas</dd>
            <dt className="text-slate-400">Vivienda propia</dt>
            <dd className="text-slate-700">{lead.tiene_vivienda == null ? '—' : lead.tiene_vivienda ? 'Sí' : 'No'}</dd>
            <dt className="text-slate-400">Distrito</dt>
            <dd className="text-slate-700">{lead.distrito ?? '—'}</dd>
            <dt className="text-slate-400">Consentimiento</dt>
            <dd className="text-slate-700">{lead.consentimiento ? 'Otorgado' : 'No otorgado'}</dd>
          </dl>
          {unidadInteres && (
            <div className="mt-3 pt-3 border-t border-slate-100 text-sm text-slate-600">
              Unidad de interés: <span className="font-semibold text-slate-800">{unidadLabel(unidadInteres, tipologiaInteres)}</span> ·{' '}
              {soles(unidadInteres.precio)}
              {tipologiaInteres && <> · {tipologiaInteres.nombre}</>}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Precalificación</h3>
          {precal?.veredicto ? (
            <p className="text-sm mb-2">
              Veredicto:{' '}
              <span className={`font-bold capitalize ${VEREDICTO_COLOR[precal.veredicto] ?? 'text-slate-600'}`}>{precal.veredicto}</span>{' '}
              probabilidad
            </p>
          ) : (
            <p className="text-sm text-slate-400 mb-2">Sin precalificación registrada.</p>
          )}
          {precal?.programas && precal.programas.length > 0 && (
            <ul className="flex flex-col gap-2 mt-2">
              {precal.programas.map((p, i) => (
                <li key={i} className="rounded-xl bg-slate-50 p-2.5 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-700">{p.nombre ?? p.programa}</span>
                    <span className={`text-xs font-semibold shrink-0 ${p.elegible ? 'text-emerald-600' : 'text-red-500'}`}>
                      {p.elegible ? 'Elegible' : 'No elegible'}
                    </span>
                  </div>
                  {(p.bono_estimado ?? p.bono) != null && (
                    <div className="text-xs text-slate-500">Bono estimado: {soles(p.bono_estimado ?? p.bono ?? 0)}</div>
                  )}
                  {(p.motivo || (p.motivos && p.motivos.length > 0)) && (
                    <div className="text-xs text-slate-400 mt-0.5">{p.motivo ?? p.motivos?.join(' ')}</div>
                  )}
                </li>
              ))}
            </ul>
          )}
          {precal?.veredicto && (!precal.programas || precal.programas.length === 0) && (
            <p className="text-xs text-slate-400">Sin detalle de programas para este lead.</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Score explicado</h3>
          <div className="flex items-center gap-3 mb-3">
            <div className={`text-4xl font-black ${lead.score < 40 ? 'text-red-500' : lead.score < 70 ? 'text-amber-500' : 'text-emerald-600'}`}>
              {lead.score}
            </div>
            <div className="text-xs text-slate-400">de 100 puntos</div>
          </div>
          <ul className="flex flex-col gap-1.5">
            {(lead.score_detalle ?? []).map((d, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="shrink-0 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold px-1.5 py-0.5">+{d.puntos}</span>
                <span className="text-slate-600">{d.motivo}</span>
              </li>
            ))}
            {(lead.score_detalle ?? []).length === 0 && <li className="text-sm text-slate-400">Sin señales registradas aún.</li>}
          </ul>
        </div>

        <ResumenIA lead={lead} eventos={eventos} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Timeline de eventos</h3>
        {eventos.length === 0 ? (
          <p className="text-sm text-slate-400">Sin actividad registrada.</p>
        ) : (
          <ol className="flex flex-col gap-2.5">
            {eventos.map(ev => (
              <li key={ev.id} className="flex items-start gap-3 text-sm">
                <span className="text-lg leading-none" aria-hidden>
                  {ICONO_EVENTO[ev.tipo] ?? '•'}
                </span>
                <span className="flex-1 text-slate-600">{textoEvento(ev, labelUnidadId)}</span>
                <span className="text-xs text-slate-400 whitespace-nowrap">{tiempoRelativo(ev.created_at)}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Citas</h3>
          {citasLead.length === 0 ? (
            <p className="text-sm text-slate-400">Sin citas agendadas.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {citasLead.map(c => (
                <li key={c.id} className="flex items-center justify-between gap-2 text-sm rounded-xl bg-slate-50 p-2.5">
                  <span className="text-slate-600 capitalize">
                    {c.tipo} · {formatoFechaHora(c.fecha)}
                  </span>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => void actualizarCita(c.id, 'confirmada')} className="text-xs font-semibold text-emerald-700 hover:underline">
                      Confirmar
                    </button>
                    <button onClick={() => void actualizarCita(c.id, 'cancelada')} className="text-xs font-semibold text-red-500 hover:underline">
                      Cancelar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Seguimientos</h3>
          {seguimientosLead.length === 0 ? (
            <p className="text-sm text-slate-400">Sin seguimientos programados.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {seguimientosLead.map(s => (
                <li key={s.id} className="rounded-xl bg-slate-50 p-2.5 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-600">
                      {s.canal} · {formatoFechaHora(s.programado_para)}
                    </span>
                    <span className={`text-xs font-semibold ${s.estado === 'enviado' ? 'text-emerald-600' : 'text-amber-600'}`}>{s.estado}</span>
                  </div>
                  {s.estado !== 'enviado' && lead.telefono && (
                    <button
                      onClick={() => {
                        window.open(`https://wa.me/${telefonoWhatsapp(lead.telefono)}?text=${encodeURIComponent(s.mensaje)}`, '_blank')
                        void marcarSeguimientoEnviado(s.id)
                      }}
                      className="mt-1 text-xs font-semibold text-emerald-700 hover:underline"
                    >
                      Enviar ahora
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
