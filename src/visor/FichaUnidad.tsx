import { useStore } from '../store'
import { ESTADO_COLOR, ESTADO_LABEL, VISTA_LABEL, soles, type Unidad } from '../lib/types'
import { track } from '../lib/tracking'
import { useUI } from './ui'
import { cuotaRapida } from '../lib/finanzas'

/**
 * Ficha de la unidad seleccionada. Bottom sheet en móvil, tarjeta lateral en desktop.
 * Los botones abren modales que implementan fases posteriores (ver src/visor/ui.ts).
 */
export default function FichaUnidad({ unidad: u }: { unidad: Unidad }) {
  const tip = useStore(s => s.edificio.tipologias.find(t => t.id === u.tipologia_id)!)
  const seleccionar = useStore(s => s.seleccionar)
  const setModoVista = useStore(s => s.setModoVista)
  const favoritos = useStore(s => s.favoritos)
  const toggleFavorito = useStore(s => s.toggleFavorito)
  const comparar = useStore(s => s.comparar)
  const toggleComparar = useStore(s => s.toggleComparar)
  const abrir = useUI(s => s.abrir)
  const notificar = useUI(s => s.notificar)
  const esFav = favoritos.has(u.id)
  const enComparar = comparar.includes(u.id)
  const cuota = cuotaRapida(u.precio)

  const compartir = async () => {
    const url = `${location.origin}/u/${u.id}`
    track('compartir', u.id)
    try {
      if (navigator.share) await navigator.share({ title: `Depa ${u.id}`, text: `Mira este departamento: ${tip.nombre}, piso ${u.piso}`, url })
      else { await navigator.clipboard.writeText(url); notificar('Enlace copiado') }
    } catch { /* cancelado */ }
  }

  return (
    <aside className="absolute z-30 inset-x-0 bottom-0 sm:inset-x-auto sm:right-4 sm:top-24 sm:bottom-auto sm:w-[340px]">
      <div className="bg-white text-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[62vh] sm:max-h-[calc(100vh-130px)] overflow-y-auto">
        <div className="sticky top-0 bg-white px-4 pt-3 pb-2 border-b border-slate-100 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full" style={{ background: ESTADO_COLOR[u.estado] }}>{ESTADO_LABEL[u.estado]}</span>
              <span className="text-xs text-slate-500">Piso {u.piso} · {u.posicion}</span>
            </div>
            <h2 className="text-lg font-bold leading-tight mt-1">Depa {u.id}</h2>
            <div className="text-sm text-slate-600">{tip.nombre}</div>
          </div>
          <button onClick={() => seleccionar(null)} className="text-slate-400 hover:text-slate-900 text-2xl leading-none px-1">×</button>
        </div>

        <div className="px-4 py-3 grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-50 rounded-lg py-2"><div className="text-lg font-bold">{tip.dormitorios}</div><div className="text-[10px] text-slate-500 uppercase">dorm.</div></div>
          <div className="bg-slate-50 rounded-lg py-2"><div className="text-lg font-bold">{tip.banos}</div><div className="text-[10px] text-slate-500 uppercase">baños</div></div>
          <div className="bg-slate-50 rounded-lg py-2"><div className="text-lg font-bold">{tip.area_m2}</div><div className="text-[10px] text-slate-500 uppercase">m²</div></div>
        </div>

        <div className="px-4 pb-3">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-extrabold text-slate-900">{soles(u.precio)}</div>
              <div className="text-xs text-slate-500">desde <span className="font-semibold text-slate-700">{soles(cuota)}</span> al mes*</div>
            </div>
            <div className="text-right text-xs text-slate-600">
              <div>🧭 Orientación {u.orientacion}</div>
              <div>🌳 {VISTA_LABEL[u.vista]}</div>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">*Referencial: 10% inicial, 20 años, sin bono. Simula tu caso real.</div>
        </div>

        <div className="px-4 pb-3 grid grid-cols-2 gap-2">
          <button onClick={() => setModoVista('interior')} className="bg-slate-900 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-slate-700">🚪 Ver interior</button>
          <button onClick={() => setModoVista('ventana')} className="bg-slate-900 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-slate-700">🪟 Ver la vista</button>
          <button onClick={() => abrir('simulador')} className="bg-emerald-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-emerald-500">💰 Simular cuota</button>
          <button onClick={() => abrir('precalificar')} className="bg-emerald-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-emerald-500">✅ ¿Califico al bono?</button>
        </div>

        <div className="px-4 pb-3 flex gap-2 text-xs">
          <button onClick={() => toggleFavorito(u.id)} className={`flex-1 py-2 rounded-lg border ${esFav ? 'bg-rose-50 border-rose-300 text-rose-700' : 'border-slate-200 text-slate-700'}`}>{esFav ? '♥ Guardado' : '♡ Guardar'}</button>
          <button onClick={() => toggleComparar(u.id)} className={`flex-1 py-2 rounded-lg border ${enComparar ? 'bg-sky-50 border-sky-300 text-sky-700' : 'border-slate-200 text-slate-700'}`}>{enComparar ? '⇄ En comparación' : '⇄ Comparar'}</button>
          <button onClick={compartir} className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-700">↗ Compartir</button>
        </div>

        <div className="px-4 pb-4">
          {u.estado === 'disponible' ? (
            <button onClick={() => { track('iniciar_separacion', u.id); abrir('separar') }} className="w-full bg-amber-400 text-slate-900 font-bold py-3 rounded-xl hover:bg-amber-300">
              Separar este depa
            </button>
          ) : (
            <button onClick={() => abrir('lead')} className="w-full bg-slate-100 text-slate-700 font-semibold py-3 rounded-xl">
              Avisarme si se libera
            </button>
          )}
          {comparar.length >= 2 && (
            <button onClick={() => abrir('comparar')} className="w-full mt-2 text-sky-700 text-sm font-semibold underline">Comparar {comparar.length} unidades</button>
          )}
        </div>
      </div>
    </aside>
  )
}
