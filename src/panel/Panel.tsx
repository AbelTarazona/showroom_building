import { Route, Routes } from 'react-router-dom'
import Layout from './Layout'
import Leads from './Leads'
import LeadDetalle from './LeadDetalle'
import Inventario from './Inventario'
import Citas from './Citas'
import Seguimientos from './Seguimientos'
import Mapa from './Mapa'
import Incidencias from './Incidencias'

export default function Panel() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Leads />} />
        <Route path="leads/:id" element={<LeadDetalle />} />
        <Route path="inventario" element={<Inventario />} />
        <Route path="citas" element={<Citas />} />
        <Route path="seguimientos" element={<Seguimientos />} />
        <Route path="mapa" element={<Mapa />} />
        <Route path="incidencias" element={<Incidencias />} />
        <Route path="*" element={<Leads />} />
      </Route>
    </Routes>
  )
}
