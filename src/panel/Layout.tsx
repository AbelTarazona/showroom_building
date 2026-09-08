import { useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useStore, suscribirUnidades } from '../store'

const LINKS: { to: string; label: string; icon: string; end?: boolean }[] = [
  { to: '/panel', label: 'Leads', icon: '👥', end: true },
  { to: '/panel/inventario', label: 'Inventario', icon: '🏢' },
  { to: '/panel/citas', label: 'Citas', icon: '📅' },
  { to: '/panel/seguimientos', label: 'Seguimientos', icon: '💬' },
  { to: '/panel/mapa', label: 'Mapa de calor', icon: '🔥' },
  { to: '/panel/incidencias', label: 'Incidencias', icon: '🛠' },
]

export default function Layout() {
  const cargarUnidades = useStore(s => s.cargarUnidades)

  useEffect(() => {
    const previo = document.title
    document.title = 'Panel constructora · Los Jardines de Carabayllo'
    void cargarUnidades()
    const baja = suscribirUnidades()
    return () => { document.title = previo; baja() }
  }, [cargarUnidades])

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col md:flex-row">
      <aside className="hidden md:flex md:flex-col md:w-56 md:shrink-0 bg-white border-r border-slate-200 p-4 gap-1">
        <div className="mb-4 px-1">
          <div className="text-sm font-bold leading-tight">Panel</div>
          <div className="text-xs text-slate-500">Constructora Demo</div>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {LINKS.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200/60'
                }`
              }
            >
              <span aria-hidden>{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <a href="/" target="_blank" rel="noreferrer" className="mt-4 px-1 text-xs font-medium text-sky-600 hover:underline">
          Abrir showroom ↗
        </a>
      </aside>

      <header className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="text-sm font-bold leading-tight">Panel · Constructora Demo</div>
        <a href="/" target="_blank" rel="noreferrer" className="text-xs font-medium text-sky-600">
          Showroom ↗
        </a>
      </header>

      <main className="flex-1 min-w-0 pb-16 md:pb-0">
        <Outlet />
      </main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200 flex justify-around py-1">
        {LINKS.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1.5 text-[10px] font-medium rounded-lg ${
                isActive ? 'text-slate-900' : 'text-slate-400'
              }`
            }
          >
            <span className="text-base leading-none" aria-hidden>{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
