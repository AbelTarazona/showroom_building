// Fase 6: modal 'comparar'. Se monta dentro de ModalBase desde src/visor/Modales.tsx.
import type { Unidad } from '../../lib/types'
import { ESTADO_COLOR, ESTADO_LABEL, VISTA_LABEL, soles } from '../../lib/types'
import { useStore } from '../../store'
import { cuotaRapida } from '../../lib/finanzas'
import { useUI } from '../ui'

interface Fila {
  label: string
  celda: (u: Unidad) => string
  mejor?: (u: Unidad) => boolean
}

export default function Comparar() {
  const comparar = useStore(s => s.comparar)
  const unidades = useStore(s => s.unidades)
  const tipologias = useStore(s => s.edificio.tipologias)
  const seleccionar = useStore(s => s.seleccionar)
  const toggleComparar = useStore(s => s.toggleComparar)
  const abrir = useUI(s => s.abrir)
  const cerrar = useUI(s => s.cerrar)

  const cols = comparar.map(id => unidades[id]).filter((u): u is Unidad => Boolean(u))
  const tipologiaDe = (tid: string) => tipologias.find(t => t.id === tid)
  const areaDe = (u: Unidad) => tipologiaDe(u.tipologia_id)?.area_m2 ?? 0

  if (cols.length === 0) {
    return (
      <p className="text-slate-600 text-sm">
        No tienes unidades para comparar. Marca "⇄ Comparar" en 2 o 3 departamentos desde su ficha.
      </p>
    )
  }

  const precioMin = Math.min(...cols.map(u => u.precio))
  const areaMax = Math.max(...cols.map(areaDe))
  const pisoMax = Math.max(...cols.map(u => u.piso))
  const masBarata = cols.reduce((a, b) => (a.precio <= b.precio ? a : b))

  const filas: Fila[] = [
    { label: 'Piso', celda: u => `Piso ${u.piso}`, mejor: u => u.piso === pisoMax },
    { label: 'Tipología', celda: u => tipologiaDe(u.tipologia_id)?.nombre ?? '—' },
    {
      label: 'Dorm. / baños',
      celda: u => `${tipologiaDe(u.tipologia_id)?.dormitorios ?? '—'} dorm · ${tipologiaDe(u.tipologia_id)?.banos ?? '—'} baños`,
    },
    { label: 'Área', celda: u => `${areaDe(u)} m²`, mejor: u => areaDe(u) === areaMax },
    { label: 'Orientación / vista', celda: u => `${u.orientacion} · ${VISTA_LABEL[u.vista]}` },
    { label: 'Precio', celda: u => soles(u.precio), mejor: u => u.precio === precioMin },
    { label: 'Precio / m²', celda: u => soles(u.precio / (areaDe(u) || 1)) },
    { label: 'Cuota estimada*', celda: u => `${soles(cuotaRapida(u.precio))}/mes` },
    { label: 'Estado', celda: u => ESTADO_LABEL[u.estado] },
  ]

  function ver(id: string) {
    seleccionar(id, 'lista')
    cerrar()
  }

  function simularMasBarata() {
    seleccionar(masBarata.id, 'lista')
    abrir('simulador')
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="border-collapse text-xs min-w-[520px] w-full">
          <thead>
            <tr>
              <th className="w-24" />
              {cols.map(u => (
                <th key={u.id} className="text-left px-2 pb-2 align-bottom min-w-[130px]">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm">{u.id}</span>
                    <span className="w-2 h-2 rounded-full" style={{ background: ESTADO_COLOR[u.estado] }} />
                  </div>
                  <div className="flex gap-1 mt-1">
                    <button onClick={() => ver(u.id)} className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full hover:bg-sky-100">
                      Ver
                    </button>
                    <button onClick={() => toggleComparar(u.id)} className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full hover:bg-rose-100">
                      Quitar
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.map(f => (
              <tr key={f.label} className="border-t border-slate-100">
                <td className="py-1.5 pr-2 text-slate-500 font-medium whitespace-nowrap align-top">{f.label}</td>
                {cols.map(u => {
                  const esMejor = f.mejor?.(u) ?? false
                  return (
                    <td key={u.id} className={`py-1.5 px-2 align-top ${esMejor ? 'bg-emerald-50 text-emerald-800 font-bold rounded-lg' : 'text-slate-700'}`}>
                      {f.celda(u)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-[10px] text-slate-400">*Referencial: 10% inicial, 20 años, sin bono. Verde = mejor valor.</div>

      <button onClick={simularMasBarata} className="w-full bg-emerald-600 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-emerald-500">
        💰 Simular la más barata ({masBarata.id})
      </button>
    </div>
  )
}
