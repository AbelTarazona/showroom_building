import { useStore } from '../store'
import { ESTADO_COLOR, ESTADO_LABEL, soles } from '../lib/types'
import { cuotaRapida } from '../lib/finanzas'
import { useUI } from './ui'

/** Drawer con la lista de favoritos: acceso rápido, comparar y compartir enlace. */
export default function Favoritos({ onClose }: { onClose: () => void }) {
  const favoritos = useStore(s => s.favoritos)
  const unidades = useStore(s => s.unidades)
  const tipologias = useStore(s => s.edificio.tipologias)
  const seleccionar = useStore(s => s.seleccionar)
  const toggleFavorito = useStore(s => s.toggleFavorito)
  const comparar = useStore(s => s.comparar)
  const toggleComparar = useStore(s => s.toggleComparar)
  const abrir = useUI(s => s.abrir)
  const notificar = useUI(s => s.notificar)

  const lista = [...favoritos].map(id => unidades[id]).filter((u): u is NonNullable<typeof u> => Boolean(u))
  const tipologiaDe = (tid: string) => tipologias.find(t => t.id === tid)

  function irA(id: string) {
    seleccionar(id, 'lista')
    onClose()
  }

  function compararEstos() {
    const deseados = lista.slice(0, 3).map(u => u.id)
    // limpiamos lo que no queremos y agregamos lo que falta, respetando la API de toggle del store
    comparar.filter(id => !deseados.includes(id)).forEach(id => toggleComparar(id))
    deseados.filter(id => !comparar.includes(id)).forEach(id => toggleComparar(id))
    abrir('comparar')
    onClose()
  }

  async function compartirLista() {
    if (lista.length === 0) return
    const url = `${location.origin}/?favs=${lista.map(u => u.id).join(',')}`
    try {
      await navigator.clipboard.writeText(url)
      notificar('Enlace de tu lista copiado')
    } catch {
      notificar(url)
    }
  }

  return (
    <div className="fixed inset-0 z-[55] flex items-end sm:items-stretch sm:justify-end bg-black/40" onClick={onClose}>
      <div
        className="w-full sm:w-[380px] bg-white text-slate-900 rounded-t-2xl sm:rounded-none shadow-2xl max-h-[82vh] sm:max-h-none sm:h-full flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="shrink-0 bg-white px-5 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold">♥ Mis favoritos ({lista.length})</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 text-xl leading-none px-2">×</button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {lista.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">
              Aún no guardaste departamentos. Toca ♡ Guardar en la ficha de una unidad.
            </div>
          ) : (
            <div className="p-4 flex flex-col gap-2">
              {lista.map(u => {
                const tip = tipologiaDe(u.tipologia_id)
                return (
                  <div key={u.id} className="border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                    <button onClick={() => irA(u.id)} className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded-full shrink-0" style={{ background: ESTADO_COLOR[u.estado] }}>
                          {ESTADO_LABEL[u.estado]}
                        </span>
                        <span className="font-bold truncate">{u.id}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 truncate">{tip?.nombre} · piso {u.piso}</div>
                      <div className="text-sm font-bold mt-1">
                        {soles(u.precio)} <span className="text-xs font-normal text-slate-500">· {soles(cuotaRapida(u.precio))}/mes</span>
                      </div>
                    </button>
                    <button
                      onClick={() => toggleFavorito(u.id)}
                      className="text-xs text-rose-600 font-semibold px-2 py-1.5 rounded-lg hover:bg-rose-50 shrink-0"
                    >
                      Quitar
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {lista.length > 0 && (
          <div className="shrink-0 p-4 border-t border-slate-100 flex flex-col gap-2">
            {lista.length >= 2 && (
              <button onClick={compararEstos} className="w-full bg-sky-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-sky-500">
                ⇄ Comparar estos
              </button>
            )}
            <button onClick={compartirLista} className="w-full border border-slate-200 text-slate-700 text-sm font-semibold py-2.5 rounded-xl hover:bg-slate-50">
              ↗ Compartir mi lista
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
