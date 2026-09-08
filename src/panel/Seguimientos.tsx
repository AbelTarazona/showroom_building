import { marcarSeguimientoEnviado, useLeadsPorId, useSeguimientos } from './datos'
import { formatoFechaHora, tiempoRelativo } from './formato'
import { telefonoWhatsapp } from '../lib/scoring'

export default function Seguimientos() {
  const { seguimientos, cargando } = useSeguimientos()
  const leadsPorId = useLeadsPorId()

  function enviar(id: string, telefono: string | null, mensaje: string) {
    if (telefono) window.open(`https://wa.me/${telefonoWhatsapp(telefono)}?text=${encodeURIComponent(mensaje)}`, '_blank')
    void marcarSeguimientoEnviado(id)
  }

  if (cargando) return <div className="p-6 text-sm text-slate-400">Cargando seguimientos...</div>

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold">Seguimientos</h1>
        <p className="text-sm text-slate-500">Cola de mensajes programados por lead.</p>
      </div>

      {seguimientos.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-10 text-center text-sm text-slate-400">No hay seguimientos programados.</div>
      )}

      <div className="bg-white rounded-2xl shadow-sm divide-y divide-slate-100">
        {seguimientos.map(s => {
          const lead = leadsPorId[s.lead_id]
          const vencido = s.estado === 'pendiente' && new Date(s.programado_para).getTime() < Date.now()
          return (
            <div key={s.id} className={`p-4 flex flex-col gap-2 ${vencido ? 'bg-red-50/60' : ''}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-slate-800">
                    {lead?.nombre ?? 'Lead'} <span className="text-xs font-normal text-slate-400">· {s.canal}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {s.plantilla} · programado {formatoFechaHora(s.programado_para)} ({tiempoRelativo(s.programado_para)})
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {vencido && <span className="rounded-full bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5">Vencido</span>}
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.estado === 'enviado' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {s.estado === 'enviado' ? 'Enviado' : 'Pendiente'}
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-600">{s.mensaje}</p>
              {s.estado !== 'enviado' && (
                <button
                  onClick={() => enviar(s.id, lead?.telefono ?? null, s.mensaje)}
                  disabled={!lead?.telefono}
                  className="self-start rounded-lg bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Enviar ahora
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
