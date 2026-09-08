// Única fuente de verdad del edificio demo.
// Genera: src/data/edificio.json (geometría + unidades) y supabase/seed.sql (datos + leads ficticios).
import { writeFileSync } from 'node:fs'

// PRNG determinista
let seed = 20260910
const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296 }
const pick = (arr) => arr[Math.floor(rnd() * arr.length)]

const proyecto = {
  id: 'jardines-carabayllo',
  nombre: 'Residencial Los Jardines de Carabayllo',
  distrito: 'Carabayllo, Lima',
  descripcion: 'Condominio de vivienda social de 12 pisos con 96 departamentos, áreas verdes, lobby y locales comerciales en el primer nivel. Frente al parque zonal y a dos cuadras de la Av. Túpac Amaru.',
  entrega_estimada: '2027-12',
  meta: { constructora: 'Constructora Demo S.A.C. (ficticia)', direccion: 'Av. Los Jardines 1200, Carabayllo' },
}

const tipologias = [
  { id: 'A', codigo: 'A', nombre: 'Tipología A · 2 dormitorios', dormitorios: 2, banos: 1, area_m2: 55, precio_base: 165000 },
  { id: 'B', codigo: 'B', nombre: 'Tipología B · 3 dormitorios', dormitorios: 3, banos: 2, area_m2: 68, precio_base: 198000 },
  { id: 'C', codigo: 'C', nombre: 'Tipología C · 1 dormitorio', dormitorios: 1, banos: 1, area_m2: 42, precio_base: 129000 },
]

// Geometría: grilla 3x3 de 8x8 m, núcleo al centro. y = altura.
const layout = {
  slot: 8, pisos: 12, alturaPiso: 2.9, alturaBase: 4.2,
  nucleo: { x: 0, z: 0, w: 8, d: 8 },
  posiciones: {
    N1: { x: -8, z: 8, orientacion: 'norte', vista: 'parque', tipologia: 'A' },
    N2: { x: 0, z: 8, orientacion: 'norte', vista: 'parque', tipologia: 'B' },
    N3: { x: 8, z: 8, orientacion: 'norte', vista: 'parque', tipologia: 'A' },
    E: { x: 8, z: 0, orientacion: 'este', vista: 'ciudad', tipologia: 'C' },
    S3: { x: 8, z: -8, orientacion: 'sur', vista: 'avenida', tipologia: 'A' },
    S2: { x: 0, z: -8, orientacion: 'sur', vista: 'avenida', tipologia: 'B' },
    S1: { x: -8, z: -8, orientacion: 'sur', vista: 'avenida', tipologia: 'A' },
    W: { x: -8, z: 0, orientacion: 'oeste', vista: 'cerros', tipologia: 'C' },
  },
}
const primaPiso = 900
const primaVista = { parque: 6000, avenida: 0, ciudad: 2500, cerros: 1500 }

const unidades = []
for (let piso = 1; piso <= layout.pisos; piso++) {
  for (const [pos, p] of Object.entries(layout.posiciones)) {
    const tip = tipologias.find(t => t.id === p.tipologia)
    const precio = Math.round((tip.precio_base + (piso - 1) * primaPiso + primaVista[p.vista]) / 100) * 100
    const r = rnd()
    const pVendido = 0.55 - piso * 0.035
    let estado = r < pVendido ? 'vendido' : r < pVendido + 0.15 ? 'separado' : r < pVendido + 0.19 ? 'bloqueado' : 'disponible'
    if (piso === layout.pisos && (pos === 'E' || pos === 'W')) estado = 'bloqueado' // reservadas por la constructora
    unidades.push({
      id: `P${String(piso).padStart(2, '0')}-${pos}`,
      piso, posicion: pos, tipologia_id: p.tipologia,
      orientacion: p.orientacion, vista: p.vista, precio, estado,
      x: p.x, z: p.z, y: layout.alturaBase + (piso - 1) * layout.alturaPiso,
    })
  }
}

const edificio = { proyecto, tipologias, layout, unidades, generado: new Date().toISOString() }
writeFileSync('src/data/edificio.json', JSON.stringify(edificio, null, 2))

// ---------- seed.sql ----------
const q = (s) => s == null ? 'null' : `'${String(s).replace(/'/g, "''")}'`
const j = (o) => `${q(JSON.stringify(o))}::jsonb`
const lines = []
lines.push('-- Generado por scripts/generar-edificio.mjs. No editar a mano.')
lines.push(`insert into proyectos (id,nombre,distrito,descripcion,entrega_estimada,meta) values (${q(proyecto.id)},${q(proyecto.nombre)},${q(proyecto.distrito)},${q(proyecto.descripcion)},${q(proyecto.entrega_estimada)},${j(proyecto.meta)});`)
for (const t of tipologias)
  lines.push(`insert into tipologias (id,proyecto_id,codigo,nombre,dormitorios,banos,area_m2,precio_base,asset_interior) values (${q(t.id)},${q(proyecto.id)},${q(t.codigo)},${q(t.nombre)},${t.dormitorios},${t.banos},${t.area_m2},${t.precio_base},${q('/tipologias/' + t.id + '.json')});`)
lines.push('insert into unidades (id,proyecto_id,tipologia_id,piso,posicion,orientacion,vista,precio,estado) values')
lines.push(unidades.map(u => `(${q(u.id)},${q(proyecto.id)},${q(u.tipologia_id)},${u.piso},${q(u.posicion)},${q(u.orientacion)},${q(u.vista)},${u.precio},${q(u.estado)})`).join(',\n') + ';')

// Leads ficticios con historial para que el panel se vea vivo
const disponibles = unidades.filter(u => u.estado === 'disponible')
const nombres = ['Rosa Huamán', 'Luis Ccahuana', 'María Quispe', 'Jorge Mamani', 'Ana Torres', 'Pedro Chávez', 'Carmen Flores', 'Víctor Rojas', 'Lucía Paredes', 'Miguel Sánchez']
const distritos = ['Carabayllo', 'Comas', 'Puente Piedra', 'Los Olivos', 'San Martín de Porres', 'Independencia']
// Misma forma que src/lib/precalificacion.ts → PrecalificacionResultado (veredicto, programas, bono_recomendado)
function precalificacionSeed(veredicto, ingreso) {
  const techo = ingreso <= 3715
  const programas = [
    {
      id: 'techo_propio', nombre: 'Techo Propio (Bono Familiar Habitacional)',
      elegible: veredicto === 'alta' && techo, bono_estimado: veredicto === 'alta' && techo ? 44100 : 0,
      motivos: techo ? ['Ingreso familiar dentro del tope del programa.'] : ['Ingreso familiar por encima del tope del programa.'],
    },
    {
      id: 'mivivienda', nombre: 'Nuevo Crédito Mivivienda + Bono del Buen Pagador',
      elegible: veredicto !== 'baja', bono_estimado: veredicto === 'alta' ? 25700 : veredicto === 'media' ? 25700 : 0,
      motivos: veredicto === 'baja' ? ['El ahorro declarado no cubre la cuota inicial mínima.'] : ['Cumple ingreso y no tiene vivienda propia.'],
    },
  ]
  const bono_recomendado = programas.filter(p => p.elegible).reduce((m, p) => Math.max(m, p.bono_estimado), 0)
  return { veredicto, programas, bono_recomendado, referencial: true }
}
const leads = nombres.map((nombre, i) => {
  const u = pick(disponibles)
  const ingreso = 2200 + Math.round(rnd() * 3500 / 100) * 100
  const alta = ingreso >= 3000 && rnd() > 0.3
  const media = !alta && rnd() > 0.4
  const detalle = []
  let score = 0
  const add = (k, p, why) => { score += p; detalle.push({ regla: k, puntos: p, motivo: why }) }
  if (alta) add('precalificacion_alta', 30, 'Precalifica a Mivivienda + BBP')
  else if (media) add('precalificacion_media', 15, 'Precalificación media: ahorro insuficiente')
  if (rnd() > 0.35) add('simulo_y_alcanza', 15, `Simuló cuota de ${u.id} y le alcanza`)
  add('vio_3_unidades', 5, 'Vio 3 o más unidades')
  if (rnd() > 0.4) add('vio_interior', 5, 'Recorrió el interior')
  if (rnd() > 0.5) add('vio_vista', 5, 'Miró la vista desde la ventana')
  if (rnd() > 0.5) add('favorito', 5, 'Guardó favoritos')
  if (rnd() > 0.6) add('revisita', 10, 'Volvió a entrar otro día')
  if (rnd() > 0.7) add('inicio_separacion', 15, 'Inició separación')
  add('telefono_valido', 5, 'Dejó teléfono válido')
  const etapa = score >= 70 ? 'calificado' : score >= 40 ? 'contactar' : 'nuevo'
  const hace = Math.floor(rnd() * 5 * 24 * 60) // minutos
  return {
    id: `00000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`,
    sesion_id: `10000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`,
    nombre, telefono: `5199${String(1000000 + i * 12345).slice(0, 7)}`, email: null,
    ingreso_familiar: ingreso, ahorro: Math.round(rnd() * 25000 / 500) * 500, tiene_vivienda: false,
    num_familia: 2 + Math.floor(rnd() * 4), distrito: pick(distritos), unidad: u,
    precalificacion: precalificacionSeed(alta ? 'alta' : media ? 'media' : 'baja', ingreso),
    score: Math.min(100, score), detalle, etapa, hace,
  }
})
const mapEvento = { vio_interior: 'ver_interior', vio_vista: 'ver_vista', favorito: 'favorito', simulo_y_alcanza: 'simular_cuota', inicio_separacion: 'iniciar_separacion', precalificacion_alta: 'precalificar', precalificacion_media: 'precalificar' }
for (const l of leads) {
  lines.push(`insert into sesiones (id,created_at,device) values (${q(l.sesion_id)}, now() - interval '${l.hace} minutes', 'mobile');`)
  lines.push(`insert into leads (id,sesion_id,nombre,telefono,ingreso_familiar,ahorro,tiene_vivienda,num_familia,distrito,consentimiento,precalificacion,score,score_detalle,etapa,unidad_interes_id,created_at,updated_at) values (${q(l.id)},${q(l.sesion_id)},${q(l.nombre)},${q(l.telefono)},${l.ingreso_familiar},${l.ahorro},false,${l.num_familia},${q(l.distrito)},true,${j(l.precalificacion)},${l.score},${j(l.detalle)},${q(l.etapa)},${q(l.unidad.id)}, now() - interval '${l.hace} minutes', now() - interval '${Math.max(0, l.hace - 30)} minutes');`)
  lines.push(`update sesiones set lead_id=${q(l.id)} where id=${q(l.sesion_id)};`)
  const vistas = [l.unidad, pick(disponibles), pick(disponibles), pick(disponibles)]
  let t = l.hace + 20
  lines.push(`insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values (${q(l.sesion_id)},${q(l.id)},'ver_edificio',null,'{}',now() - interval '${t} minutes');`)
  for (const v of vistas) { t -= 3; lines.push(`insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values (${q(l.sesion_id)},${q(l.id)},'ver_unidad',${q(v.id)},'{}',now() - interval '${t} minutes');`) }
  for (const d of l.detalle) {
    if (mapEvento[d.regla]) {
      t -= 2
      // payload coherente con src/lib/scoring.ts: la regla simulo_y_alcanza exige alcanza=true
      const payload = d.regla === 'simulo_y_alcanza'
        ? j({ alcanza: true, plazo: 20, inicial_pct: 0.1, cuota: Math.round(l.unidad.precio * 0.9 * 0.0089), ingreso: l.ingreso_familiar })
        : d.regla.startsWith('precalificacion') ? j({ veredicto: l.precalificacion.veredicto }) : "'{}'"
      lines.push(`insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values (${q(l.sesion_id)},${q(l.id)},${q(mapEvento[d.regla])},${q(l.unidad.id)},${payload},now() - interval '${t} minutes');`)
    }
  }
  if (l.etapa === 'calificado' && rnd() > 0.4)
    lines.push(`insert into citas (lead_id,unidad_id,tipo,fecha,estado) values (${q(l.id)},${q(l.unidad.id)},'visita', now() + interval '${1 + Math.floor(rnd() * 4)} days', 'programada');`)
  if (l.etapa !== 'calificado') {
    const msg = `Hola ${l.nombre.split(' ')[0]}, soy Carla de Los Jardines de Carabayllo. Vi que te interesó el depa ${l.unidad.id} (tipología ${l.unidad.tipologia_id}, piso ${l.unidad.piso}). ¿Te ayudo con la simulación de tu cuota o coordinamos una visita a la caseta?`
    lines.push(`insert into seguimientos (lead_id,canal,plantilla,mensaje,programado_para,estado) values (${q(l.id)},'whatsapp','recordatorio_24h',${q(msg)}, now() + interval '${Math.floor(rnd() * 600)} minutes', 'pendiente');`)
  }
}
// Historias de demo: dos familias que ya separaron, un lead contactado, incidencias postventa y consultas al chat
const separadas = unidades.filter(u => u.estado === 'separado')
const vendidas = unidades.filter(u => u.estado === 'vendido')
const historias = [[leads[8], separadas[0]], [leads[9], separadas[1]]]
for (const [l, u] of historias) {
  const nombre = l.nombre.split(' ')[0]
  lines.push(`update leads set etapa='separado', unidad_interes_id=${q(u.id)}, score=least(100, score+20), score_detalle = score_detalle || ${j([{ regla: 'separo', puntos: 20, motivo: `Separó ${u.id}` }])} where id=${q(l.id)};`)
  lines.push(`update unidades set lead_separacion_id=${q(l.id)} where id=${q(u.id)};`)
  lines.push(`insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values (${q(l.sesion_id)},${q(l.id)},'iniciar_separacion',${q(u.id)},'{}',now() - interval '${Math.max(2, l.hace - 38)} minutes');`)
  lines.push(`insert into eventos (sesion_id,lead_id,tipo,unidad_id,payload,created_at) values (${q(l.sesion_id)},${q(l.id)},'separar',${q(u.id)},'{}',now() - interval '${Math.max(1, l.hace - 40)} minutes');`)
  lines.push(`delete from seguimientos where lead_id=${q(l.id)};`)
  lines.push(`insert into seguimientos (lead_id,canal,plantilla,mensaje,programado_para,estado) values (${q(l.id)},'whatsapp','separacion_0',${q(`Hola ${nombre}, ¡felicitaciones por separar el depa ${u.id}! Soy Carla, tu asesora. Te escribo para coordinar la firma de la separación y los documentos para el banco.`)}, now() - interval '${Math.max(1, l.hace - 45)} minutes', 'enviado');`)
  lines.push(`insert into seguimientos (lead_id,canal,plantilla,mensaje,programado_para,estado) values (${q(l.id)},'whatsapp','separacion_1',${q(`Hola ${nombre}, ¿pudiste reunir los documentos para la evaluación crediticia del depa ${u.id}? Cualquier duda me avisas y lo vemos juntos.`)}, now() + interval '${60 + Math.floor(rnd() * 600)} minutes', 'pendiente');`)
}
// Un lead ya contactado por el asesor (seguimiento enviado, cita programada)
const contactado = leads[3]
lines.push(`update leads set etapa='contactado' where id=${q(contactado.id)};`)
lines.push(`update seguimientos set estado='enviado' where lead_id=${q(contactado.id)};`)
lines.push(`insert into citas (lead_id,unidad_id,tipo,fecha,estado) values (${q(contactado.id)},${q(contactado.unidad.id)},'videollamada', now() + interval '2 days', 'programada');`)
// Incidencias postventa de familias que ya recibieron su depa (etapa anterior del proyecto)
const incidencias = [
  [leads[1], vendidas[3], 'filtracion', 'Aparece humedad en la pared del dormitorio principal cuando llueve. La mancha crece cada semana.', 'abierta', 3 * 24 * 60],
  [leads[5], vendidas[10], 'acabados', 'La puerta del baño no cierra bien y la cerámica de la cocina tiene dos piezas sueltas.', 'en_proceso', 9 * 24 * 60],
  [leads[6], vendidas[17], 'instalaciones', 'El tomacorriente de la sala no tiene energía desde la entrega.', 'resuelta', 20 * 24 * 60],
]
for (const [l, u, cat, desc, estado, hace] of incidencias)
  lines.push(`insert into incidencias (lead_id,unidad_id,categoria,descripcion,estado,created_at) values (${q(l.id)},${q(u.id)},${q(cat)},${q(desc)},${q(estado)},now() - interval '${hace} minutes');`)
// Consultas al asistente (para mostrar qué pregunta la gente)
const consultas = [
  ['¿Cuánto es la cuota de un 2 dorm?', 'Un depa de 2 dorm desde S/ 165,000 tendría una cuota referencial de S/ 1,436 al mes (10% de inicial, 20 años, sin bono).'],
  ['¿Puedo usar Techo Propio?', 'Este proyecto podría calificar para Techo Propio y Nuevo Crédito Mivivienda, con bonos referenciales que dependen de tu ingreso, ahorro y si ya tienes vivienda.'],
  ['¿Cuándo entregan?', `La entrega estimada del proyecto es ${proyecto.entrega_estimada}. Es una fecha referencial sujeta al avance de obra.`],
  ['¿Qué depas quedan con vista al parque?', 'Quedan departamentos disponibles con vista al parque (norte) desde S/ 173,700.'],
  ['¿Tiene estacionamiento?', 'La disponibilidad de estacionamientos varía según la unidad; pregúntale al asesor por el departamento que te interesa.'],
  ['¿Aceptan pago con AFP?', 'No tengo esa información a la mano. Un asesor puede resolverte esa duda directamente.'],
]
consultas.forEach(([pregunta, respuesta], i) => {
  const l = leads[i % leads.length]
  lines.push(`insert into consultas (sesion_id,pregunta,respuesta,fuente,created_at) values (${q(l.sesion_id)},${q(pregunta)},${q(respuesta)},'plantilla',now() - interval '${Math.max(1, l.hace - 10 - i)} minutes');`)
})
// eventos anónimos extra para el mapa de calor (sesgo hacia pisos 6-9 orientación parque)
for (let i = 0; i < 60; i++) {
  const sid = `20000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`
  lines.push(`insert into sesiones (id,created_at,device) values (${q(sid)}, now() - interval '${Math.floor(rnd() * 7 * 24 * 60)} minutes', ${q(rnd() > 0.3 ? 'mobile' : 'desktop')});`)
  const n = 2 + Math.floor(rnd() * 5)
  for (let k = 0; k < n; k++) {
    const pool = rnd() < 0.5 ? unidades.filter(u => u.piso >= 6 && u.piso <= 9 && u.vista === 'parque') : unidades
    const u = pick(pool)
    lines.push(`insert into eventos (sesion_id,tipo,unidad_id,payload,created_at) values (${q(sid)},'ver_unidad',${q(u.id)},'{}',now() - interval '${Math.floor(rnd() * 7 * 24 * 60)} minutes');`)
    if (rnd() < 0.3) lines.push(`insert into favoritos (sesion_id,unidad_id) values (${q(sid)},${q(u.id)}) on conflict do nothing;`)
  }
}
writeFileSync('supabase/seed.sql', lines.join('\n') + '\n')
const resumen = unidades.reduce((a, u) => (a[u.estado] = (a[u.estado] || 0) + 1, a), {})
console.log('unidades:', unidades.length, resumen, '| leads:', leads.length)
