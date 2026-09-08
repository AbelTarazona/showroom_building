import { useKpis } from './datos'

function Tarjeta({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <span className={`text-2xl font-bold ${accent ?? 'text-slate-900'}`}>{value}</span>
    </div>
  )
}

export default function Kpis() {
  const { kpis, cargando } = useKpis()

  if (cargando) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm p-4 h-[68px] animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      <Tarjeta label="Visitantes" value={String(kpis.visitantes)} />
      <Tarjeta label="Leads" value={String(kpis.leads)} />
      <Tarjeta label="Conversión" value={`${kpis.conversion}%`} accent="text-sky-600" />
      <Tarjeta label="Calificados" value={String(kpis.calificados)} accent="text-emerald-600" />
      <Tarjeta label="Separaciones" value={String(kpis.separaciones)} accent="text-amber-600" />
    </div>
  )
}
