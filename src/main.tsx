import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider, useRouteError } from 'react-router-dom'
import './index.css'
import Visor from './visor/Visor'
import Panel from './panel/Panel'

/** Pantalla de rescate: si algo revienta en plena demo, se recarga desde el visor sin perder la sesión. */
function Fallback() {
  const error = useRouteError() as { message?: string } | null
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-6">
      <div className="max-w-md text-center space-y-4">
        <div className="text-4xl">🏗️</div>
        <h1 className="text-lg font-bold">Algo falló en el showroom</h1>
        <p className="text-sm text-slate-400">{error?.message ?? 'Error inesperado'}</p>
        <button
          onClick={() => window.location.assign('/')}
          className="rounded-xl bg-emerald-500 text-white font-semibold px-4 py-2"
        >
          Volver al edificio
        </button>
      </div>
    </div>
  )
}

const router = createBrowserRouter([
  { path: '/', element: <Visor />, errorElement: <Fallback /> },
  { path: '/u/:unidadId', element: <Visor />, errorElement: <Fallback /> },
  { path: '/panel/*', element: <Panel />, errorElement: <Fallback /> },
  { path: '*', element: <Visor />, errorElement: <Fallback /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
