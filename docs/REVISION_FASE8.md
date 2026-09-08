# Revisión Fase 8 — Showroom 3D · Los Jardines de Carabayllo

Revisor: agente de Fase 8 (solo lectura, no se modificó ningún archivo del producto).
Fecha: 2026-09-07 · Demo con jurado: 2026-09-10.
Alcance: `docs/PLAN.md`, `README.md`, todo `src/`, `supabase/migrations/0001_schema.sql`,
`supabase/seed.sql`, `scripts/generar-edificio.mjs`, `src/data/*.json`, `vite.config.ts`,
`index.html`, `LICENSES.md`.
Método: lectura de código + verificación en navegador (pestaña propia `tab-7`) + `curl` a
REST local (`http://127.0.0.1:54421`, solo lecturas y un cambio revertido) + `tsc`, `vitest`,
`vite build`.

> Los números de línea corresponden al estado del repo al momento de la revisión. Varios
> archivos fueron tocados por HMR durante la sesión (`Camara.tsx`, `Visor.tsx`, `Escena.tsx`,
> `index.css`); si otro agente sigue editando, revalidar las líneas antes de aplicar.

---

## Críticos (rompen la demo)

### C1. La cámara se resetea sola cada vez que llega un cambio por Realtime — rompe el paso §8.5 del guion
**Archivo:** `src/three/Camara.tsx:54` (array de dependencias del `useEffect` de la línea 25).

```ts
}, [seleccion, pisoSel, modoVista, unidades, layout, lejos, aspecto])
```

**Qué pasa.** `unidades` es el objeto completo del store. `store.ts:92-96` (`setEstadoLocal`)
crea un objeto nuevo (`{ ...get().unidades, [id]: {...} }`) en **cada** UPDATE que llega por
Realtime. Eso reejecuta el efecto y vuelve a llamar `c.setLookAt(..., true)`, es decir, la
cámara vuela de vuelta al encuadre canónico. Si en ese momento no hay selección ni piso, se
va al encuadre inicial (`CAMARA_INICIAL`); si hay selección, salta al plano canónico de esa
unidad. El usuario pierde el giro/zoom que estaba haciendo.

**Cómo reproducir (verificado en vivo).**
1. Abrir `http://localhost:5173/`, arrastrar para orbitar hasta un encuadre cualquiera.
2. En otra pestaña/terminal cambiar el estado de una unidad:
   `curl -X PATCH ".../rest/v1/unidades?id=eq.P01-E" -d '{"estado":"bloqueado"}'`
3. A los ~2 s el 3D repinta la unidad **y la cámara salta al encuadre por defecto.**

Esto es exactamente el momento estelar del guion (§8.5, pantalla partida: el panel separa un
depa y el visor se repinta en vivo). Hoy, además de repintar, el visor "se sacude".

**Corrección sugerida.** Depender solo de lo que define el encuadre, no del diccionario entero:

```ts
const u = seleccion ? unidades[seleccion] : null
const claveVuelo = u ? `${u.id}:${u.x}:${u.y}:${u.z}` : `piso:${pisoSel}`
// ...
}, [claveVuelo, modoVista, layout, lejos, aspecto])
```

(o extraer `ux/uy/uz` con un selector y ponerlos como deps escalares). El color/estado ya lo
repinta `Edificio` por su cuenta; la cámara no necesita enterarse.

---

### C2. No hay ningún error boundary ni ruta de fallback: una sola excepción deja la demo en pantalla de error
**Archivos:** `src/main.tsx:8-18` (router sin `errorElement` y sin ruta `*`),
`src/panel/Panel.tsx:13-23` (`<Routes>` anidado sin `path="*"`).
Búsqueda de `ErrorBoundary|componentDidCatch|errorElement` en `src/`: **cero resultados**.

**Qué pasa.** Cualquier `throw` durante el render (ver I8: `score_detalle` nulo,
`payload` nulo, una tipología que no matchea, un `unidades[id]` inesperado) desmonta el árbol
completo y deja la pantalla de error de React Router ("Unexpected Application Error"). En una
demo en vivo no hay forma de recuperarse salvo recargar y perder el estado.
Además, una URL mal tecleada (`/panel/leads`, `/panelx`, `/u/`) no cae en ninguna ruta:
`/panel/*` sin `path="*"` interno renderiza **página en blanco**, y una ruta fuera de las tres
declaradas muestra el 404 crudo del router.

**Cómo reproducir.** Navegar a `http://localhost:5173/panel/leads` (sin id) → área de
contenido vacía. Navegar a `http://localhost:5173/cualquiera` → pantalla de error del router.

**Corrección sugerida.** Barato y de alto retorno para el día de la demo:

```tsx
// main.tsx
const router = createBrowserRouter([
  { path: '/', element: <Visor />, errorElement: <Fallback /> },
  { path: '/u/:unidadId', element: <Visor />, errorElement: <Fallback /> },
  { path: '/panel/*', element: <Panel />, errorElement: <Fallback /> },
  { path: '*', element: <Visor /> },        // cualquier URL rara cae al visor
])
```
y en `Panel.tsx` añadir `<Route path="*" element={<Leads />} />` dentro del `<Route element={<Layout/>}>`.
`<Fallback />` puede ser un div con "Algo falló, recarga la página" + botón que llame a
`window.location.assign('/')`.

---

### C3. `JSON.parse` sin protección a nivel de módulo: un localStorage corrupto impide que la app arranque
**Archivo:** `src/store.ts:45`

```ts
const favsIniciales = new Set<string>(JSON.parse(localStorage.getItem('showroom.favs') || '[]'))
```

**Qué pasa.** Se ejecuta al **importar** el módulo, antes de que React monte nada y fuera de
cualquier boundary (que además no existe, ver C2). Si el valor guardado está corrupto (una
sesión anterior interrumpida, otra app en el mismo `localhost:5173`, alguien tocando devtools)
o si el navegador del jurado tiene el almacenamiento bloqueado (modo incógnito estricto,
`SecurityError` al leer `localStorage`), la app queda en **pantalla blanca total**, sin
consola útil para el presentador.

**Cómo reproducir.** En la consola del navegador: `localStorage.setItem('showroom.favs','{')`
y recargar → pantalla en blanco.

**Corrección sugerida.**

```ts
function leerFavs(): Set<string> {
  try {
    const raw = localStorage.getItem('showroom.favs')
    const arr = raw ? JSON.parse(raw) : []
    return new Set<string>(Array.isArray(arr) ? arr.filter(x => typeof x === 'string') : [])
  } catch { return new Set<string>() }
}
const favsIniciales = leerFavs()
```
Aplicar el mismo blindaje a la escritura de `store.ts:82` y revisar los otros accesos a
`localStorage` de `src/lib/tracking.ts` y `src/lib/leads.ts`.

---

## Importantes (datos incorrectos o UX mala)

### I1. StrictMode duplica los eventos de analítica: cada carga escribe `ver_edificio` ×2 y `ver_unidad` ×2
**Archivos:** `src/main.tsx:15` (`<React.StrictMode>`), `src/visor/Visor.tsx:34-38`
(efecto de montaje) y `src/visor/Visor.tsx:40-46` (efecto de `/u/:id`).

**Qué pasa.** La demo corre sobre `pnpm dev` (README línea 13), o sea con StrictMode activo,
donde React 18 invoca los efectos dos veces al montar. Los dos efectos son **no idempotentes**:
`track('ver_edificio')`, `seleccionar(unidadId,'url')` (que a su vez hace `track('ver_unidad')`)
y `notificar(...)` se disparan dos veces.

**Verificado en la BD.** Tras una sola carga de `/u/P07-N2`:

```
id 581 ver_unidad  P07-N2
id 580 ver_edificio
id 579 ver_unidad  P07-N2   <-- duplicado
id 578 ver_edificio         <-- duplicado
```
(mismo `sesion_id`, mismo `created_at`).

**Impacto.** El KPI "Visitantes" y el mapa de calor de `/panel/mapa` muestran el doble de
tráfico del real; el timeline del lead muestra "Entró al showroom" y "Vio P07-N2" repetidos
delante del jurado. Además el toast "Te compartieron el depa …" se emite dos veces (ver I5).

**Corrección sugerida.** Guardar la última clave enviada, en vez de confiar en que el efecto
corre una sola vez:

```ts
const yaTrackeado = useRef<string | null>(null)
useEffect(() => {
  if (yaTrackeado.current === 'edificio') return
  yaTrackeado.current = 'edificio'
  track('ver_edificio')
  void cargarUnidades()
  return suscribirUnidades()
}, [cargarUnidades])
```
y lo mismo con `unidadId` como clave en el efecto de `/u/:id`. Alternativa global: deduplicar
en `src/lib/tracking.ts` descartando eventos idénticos (`tipo`+`unidad_id`) emitidos dentro de
la misma tick o en menos de ~300 ms.

---

### I2. El simulador escribe un evento espurio al abrirse y uno por cada pausa del slider
**Archivo:** `src/visor/modales/Simulador.tsx:71-77` (debounce de 600 ms) y `79-82`
(registro en el `cleanup` de un efecto con deps `[]`).

```ts
useEffect(() => () => {
  if (simRef.current) registrar(simRef.current)
}, [])
```

**Qué pasa.**
1. Bajo StrictMode ese efecto se monta, se **desmonta** y se vuelve a montar → el `cleanup`
   corre inmediatamente al abrir el modal y ya inserta un `simular_cuota` con los valores por
   defecto, aunque el visitante no haya tocado nada.
2. Cada vez que el usuario mueve inicial/plazo/ingreso y hace una pausa de 600 ms se inserta
   otro `simular_cuota`. Mover el slider "explorando" produce fácilmente 8-10 eventos.
3. Al cerrar se inserta uno más.

**Impacto.** El timeline del lead en `/panel/leads/:id` se llena de "Simuló la cuota de …"
repetidos, y el mapa de calor por "simulaciones" queda inflado en la unidad que se estuvo
manipulando.

**Corrección sugerida.** Deduplicar por firma de la simulación y no registrar en el primer
`cleanup`:

```ts
const ultimaFirma = useRef<string | null>(null)
const registrar = (s: Simulacion) => {
  const firma = `${unidad?.id}|${s.cuota}|${s.plazoAnios}|${cuotaInicialPct}|${s.bono}|${ingreso}`
  if (firma === ultimaFirma.current) return
  ultimaFirma.current = firma
  // ...
}
```
y montar el registro de cierre con un `useRef` de "ya montado" para saltar la primera limpieza.

---

### I3. `setEstadoLocal` ignora el `precio` que llega por Realtime: los cambios de precio no se propagan
**Archivos:** `src/store.ts:92-96` y `src/store.ts:115-116`.

```ts
const row = payload.new as { id: string; estado: Estado; lead_separacion_id: string | null }
useStore.getState().setEstadoLocal(row.id, row.estado, row.lead_separacion_id)
```

**Qué pasa.** La tabla tiene `replica identity full` (migración línea 141), así que el payload
trae la fila completa, incluido `precio`. Pero el handler solo lee tres campos y
`setEstadoLocal` reconstruye la unidad copiando `...u` (el precio anterior). Como
`src/panel/importarCsv.ts` hace `update(cambios)` fila a fila y **sí puede cambiar `precio`**,
un ajuste de precios desde el panel se ve en el panel pero **no** en el visor abierto en la
otra pantalla: sigue mostrando el precio viejo en la ficha, en la cuota "desde S/ …" y en el
modo Color: precio, hasta que alguien recargue.

**Cómo reproducir.** Visor abierto en una pantalla; en la otra, `/panel/inventario` →
importar CSV con un precio distinto para esa unidad → el visor no cambia el precio.

**Corrección sugerida.** Ampliar el contrato del callback y del setter:

```ts
const row = payload.new as { id: string; estado: Estado; precio: number; lead_separacion_id: string | null }
useStore.getState().aplicarFila(row)   // set({ unidades: { ...u, [row.id]: { ...prev, ...row } } })
```
Nombrar el setter `aplicarFila`/`mergeUnidad` deja claro que fusiona la fila completa, no solo
el estado.

---

### I4. El canal de Realtime usa un topic fijo y se suscribe dos veces (StrictMode) y desde dos módulos
**Archivos:** `src/store.ts:112-119` (`supabase.channel('unidades-visor')`),
`src/visor/Visor.tsx:37` y `src/panel/Layout.tsx:17-20` (ambos llaman `suscribirUnidades()`).

**Qué pasa.** El topic `'unidades-visor'` es constante. Bajo StrictMode la secuencia real es
`subscribe → removeChannel → subscribe` **sobre el mismo topic**, y supabase-js indexa los
canales por topic: es una carrera entre el `removeChannel` del primer montaje y el `subscribe`
del segundo. Hoy funciona (verificado: los cambios llegan), pero es frágil y no hay ningún
manejo de `CHANNEL_ERROR` / `TIMED_OUT` que lo detecte ni lo reintente. Si el visor y el panel
llegaran a convivir en la misma pestaña (no ocurre hoy, son rutas distintas) se pisarían el
canal.

**Corrección sugerida.** Topic único por suscripción y logueo del estado:

```ts
export function suscribirUnidades() {
  const canal = supabase.channel(`unidades-${crypto.randomUUID()}`)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'unidades' }, /* ... */)
    .subscribe(estado => { if (estado !== 'SUBSCRIBED') console.warn('[realtime] unidades:', estado) })
  return () => { void supabase.removeChannel(canal) }
}
```

---

### I5. El toast se pisa a sí mismo: un temporizador viejo borra el mensaje nuevo
**Archivo:** `src/visor/ui.ts:28-31`

```ts
notificar: (toast) => {
  set({ toast })
  setTimeout(() => set({ toast: null }), 2800)
},
```

**Qué pasa.** El `setTimeout` nunca se cancela. Dos toasts seguidos (frecuentísimo: los dos
toasts duplicados de I1, o "Guardado en favoritos" + "Se agregaron N depas") comparten el
primer temporizador: el segundo mensaje desaparece a los ~200 ms en lugar de a los 2,8 s. En
el escenario de `?favs=` con StrictMode, el jurado puede no llegar a leer el mensaje.

**Corrección sugerida.**

```ts
let temporizador: ReturnType<typeof setTimeout> | null = null
// ...
notificar: (toast) => {
  set({ toast })
  if (temporizador) clearTimeout(temporizador)
  temporizador = setTimeout(() => { set({ toast: null }); temporizador = null }, 2800)
},
```

---

### I6. El seed genera eventos con `payload '{}'`: si se recalcula el score de un lead sembrado, **baja**
**Archivos:** `scripts/generar-edificio.mjs:119` (y 116-117, 136-137),
`supabase/seed.sql:112,125,136,148,161,185,197,209,220`, contra `src/lib/scoring.ts:35`.

```js
// generar-edificio.mjs:119 — todos los eventos derivados salen con payload '{}'
if (mapEvento[d.regla]) { /* ... */ `,'{}',now() - interval ...` }
```
```ts
// scoring.ts:35 — la regla exige el flag dentro del payload
const simulacionQueAlcanza = eventos.find(e => e.tipo === 'simular_cuota' && (e.payload as ...)?.alcanza === true)
```

**Qué pasa.** El `score_detalle` sembrado en `leads` **sí** incluye
`{"regla":"simulo_y_alcanza","puntos":15,...}`, pero los eventos `simular_cuota` sembrados no
llevan `alcanza`. En cuanto algo dispare `recalcularScore` sobre un lead sembrado —agendar una
cita (`src/lib/citas.ts:34`) o separar (`src/lib/separacion.ts:40`)— el score se recalcula
desde los eventos y **pierde 15 puntos**. `src/lib/leads.ts:204` protege la *etapa* (nunca
retrocede), pero el **número** sí baja y el "Score explicado" pierde una línea a la vista del
jurado.
La app real sí manda `alcanza` (`Simulador.tsx:67`), así que el problema es exclusivo de los
datos sembrados.

**Cómo reproducir.** `/panel/leads/<Víctor Rojas>` muestra 75 con "+15 Simuló cuota de P04-N1
y le alcanza". Agendar una cita para ese lead desde el visor → el score cae a 60 y desaparece
la línea.

**Corrección sugerida.** En `scripts/generar-edificio.mjs:119`, emitir un payload coherente por
tipo de evento:

```js
const payloadDe = (regla) => regla === 'simulo_y_alcanza'
  ? JSON.stringify({ alcanza: true, plazo: 20, inicial_pct: 0.1 })
  : '{}'
```
y regenerar (`pnpm gen`).

---

### I7. La precalificación sembrada no trae `programas`: la tarjeta del panel sale vacía
**Archivos:** `scripts/generar-edificio.mjs:105` (`precalificacion: { veredicto: ... }`),
`supabase/seed.sql:104,117,128,…` contra `src/panel/LeadDetalle.tsx:302-319`.

**Qué pasa.** El resultado real de `src/lib/precalificacion.ts` es un objeto con `veredicto`,
`programas[]` y `bono_recomendado`; el seed guarda solo `{"veredicto":"alta"}`. La tarjeta
"Precalificación" del detalle de lead renderiza el veredicto y **una lista de programas vacía**
para los 10 leads sembrados.

**Verificado en el navegador**: `/panel/leads/<Víctor Rojas>` → "Precalificación · Veredicto:
Alta probabilidad" y nada más; no aparecen Techo Propio / Mivivienda + BBP ni el monto del bono.

**Corrección sugerida.** En el generador, reutilizar la función real de precalificación (o
replicar su salida) para sembrar el objeto completo:

```js
precalificacion: {
  veredicto,
  programas: [{ id: 'mivivienda', nombre: 'Nuevo Crédito Mivivienda + BBP', elegible: true, motivo: '…' }],
  bono_recomendado: 25700,
}
```
Y en `LeadDetalle.tsx`, mostrar "Sin detalle de programas" cuando el array venga vacío, para
que nunca se vea un hueco.

---

### I8. Dos `render` que asumen columnas no nulas: `score_detalle` y `payload`
**Archivos:** `src/panel/LeadDetalle.tsx:333` y `src/panel/LeadDetalle.tsx:137`, contra
`supabase/migrations/0001_schema.sql:63` (`score_detalle jsonb default '[]'` — **nullable**) y
`:80` (`payload jsonb default '{}'` — **nullable**).

```tsx
{lead.score_detalle.map((d, i) => ( /* ... */ ))}              // 333: revienta si la columna es null
return `Vio el piso ${String(ev.payload.piso ?? '')}`.trim()   // 137: revienta si payload es null
```

**Qué pasa.** El `default` solo aplica cuando el INSERT omite la columna; un
`insert(... score_detalle: null)` o un `update` manual dejan `null` y el `.map`/`.piso` lanza
`TypeError: Cannot read properties of null`. Combinado con C2 (sin boundary) eso tumba toda la
página del panel en plena demo.
Consultado por REST hoy: `eventos?payload=is.null` devuelve `[]` y todos los leads tienen
`score_detalle` poblado, así que **no está ocurriendo**, pero el blindaje cuesta dos caracteres.

**Corrección sugerida.** `(lead.score_detalle ?? []).map(...)` y `String(ev.payload?.piso ?? '')`.
Opcionalmente endurecer la migración: `score_detalle jsonb not null default '[]'::jsonb` y
`payload jsonb not null default '{}'::jsonb`.

---

### I9. `favoritos` no está en la publicación de Realtime: el mapa de calor no reacciona en vivo a favoritos
**Archivos:** `src/panel/Mapa.tsx:88` contra `supabase/migrations/0001_schema.sql:139`.

```sql
alter publication supabase_realtime add table leads, unidades, eventos, citas, seguimientos, incidencias;
-- falta: favoritos  (y consultas)
```
```ts
.on('postgres_changes', { event: '*', schema: 'public', table: 'favoritos' }, () => void cargar())
```

**Qué pasa.** La suscripción se registra sin error pero **nunca se dispara**. La métrica
"favoritos" del mapa de calor solo se refresca por el `setInterval` de respaldo
(`Mapa.tsx:81`), no al instante. Tampoco hay `replica identity full` para `favoritos`.
Si el guion contempla "guardo un favorito en el visor y aparece en el mapa de calor", con la
pantalla partida se verá con retraso.

**Corrección sugerida.** Añadir a la migración:

```sql
alter publication supabase_realtime add table favoritos;
alter table favoritos replica identity full;
```
(y `consultas` si el panel llegara a mostrarlas en vivo). Si no se quiere tocar la BD antes de
la demo, al menos bajar el intervalo de refresco del mapa.

---

### I10. `favoritos` no tiene `lead_id`: se aparta del contrato de PLAN §4
**Archivo:** `supabase/migrations/0001_schema.sql:86-91`

```sql
create table favoritos (
  sesion_id uuid ...,
  unidad_id text ...,
  created_at ...,
  primary key (sesion_id, unidad_id)
);
```

**Qué pasa.** PLAN §4 define `favoritos (lead_id|sesion_id, unidad_id)`. Al no existir la
columna, los favoritos que un visitante guardó **antes** de dejar sus datos nunca se pueden
atribuir al lead: `src/lib/leads.ts:158` hace el backfill de `eventos.lead_id` pero no puede
hacer lo mismo con `favoritos`. En el detalle de lead no hay sección de favoritos, y el score
solo cuenta el evento `favorito`, no la tabla.

**Corrección sugerida.** `alter table favoritos add column lead_id uuid references leads(id);`
y añadir un tercer backfill junto al de `eventos` en `guardarLead`:

```ts
await supabase.from('favoritos').update({ lead_id: lead.id }).eq('sesion_id', sesionId).is('lead_id', null)
```
Si no da tiempo, corregir PLAN §4 para que documento y esquema digan lo mismo (el jurado puede
leer el PLAN).

---

### I11. Teléfono sin normalizar cuando no valida → enlaces `wa.me` rotos
**Archivos:** `src/lib/leads.ts:102` y `:127`

```ts
telefono: telefonoValido(datos.telefono) ? normalizarTelefono(datos.telefono) : datos.telefono,
```
Consumidores: `src/lib/seguimientos.ts:117` (`linkWhatsapp`), `src/panel/Seguimientos.tsx:9`,
`src/panel/LeadDetalle.tsx:119,247,407`.

**Qué pasa.** Si el visitante escribe "987 654 321" con un dígito de más, un `+51 1 …` fijo, o
lo que sea que no case con `/^(?:\+?51)?9\d{8}$/`, el valor se guarda **tal cual** (con
espacios, guiones, `+`). Los enlaces se construyen concatenando sin sanear:
`https://wa.me/${lead.telefono}?text=...`. El `text` sí va con `encodeURIComponent` (correcto),
pero el número no: `wa.me/+51 987…` abre una página de error de WhatsApp. Si eso ocurre en la
demo del panel, es un clic muerto delante del jurado.

**Corrección sugerida.** Una función única en `scoring.ts`/`types.ts` y usarla en los cinco
sitios:

```ts
export const telefonoWhatsapp = (t?: string | null) => (t ?? '').replace(/\D/g, '')
// JSX: href={tel ? `https://wa.me/${telefonoWhatsapp(tel)}?text=${encodeURIComponent(msg)}` : undefined}
```
Y deshabilitar el botón de WhatsApp cuando `telefonoValido(lead.telefono) === false`.

---

### I12. Los seguimientos se pueden duplicar (lectura y escritura no atómicas)
**Archivo:** `src/lib/seguimientos.ts:88-109`

**Qué pasa.** El anti-duplicado es un `select ... where estado='pendiente' and plantilla like 'motivo_%'`
seguido de un `insert` de 3 filas. No es atómico: dos llamadas concurrentes (doble clic rápido
en "Separar", o separar + agendar disparándose casi a la vez) pueden leer ambas "no hay nada" e
insertar 3+3 = 6 seguimientos. El botón de separar sí tiene `disabled` (`Separar.tsx:139`), lo
que reduce el riesgo, pero no hay barrera en la BD.

**Corrección sugerida.** Índice único parcial en la migración:

```sql
create unique index seguimientos_unicos_pendientes
  on seguimientos (lead_id, plantilla) where estado = 'pendiente';
```
y en el `insert`, tolerar el conflicto
(`.upsert(filas, { onConflict: 'lead_id,plantilla', ignoreDuplicates: true })`).

---

### I13. En móvil (375 px), la ficha tapa por completo el selector de pisos
**Archivos:** `src/visor/Visor.tsx:144` (`nav ... bottom-3 sm:bottom-auto sm:top-[140px]`) y
`src/visor/FichaUnidad.tsx` (panel anclado abajo en móvil).

**Qué pasa.** Verificado a 375×812: con una unidad seleccionada, la ficha ocupa toda la mitad
inferior y el carrusel de pisos (que en móvil vive en `bottom-3`) queda debajo, **inaccesible**.
Para cambiar de piso hay que cerrar la ficha primero, cosa que no está señalizada.
También verificado: **no hay desbordamiento horizontal de la página**
(`scrollWidth == clientWidth == 375`); el carrusel de pisos desborda solo dentro de su propio
contenedor `overflow-x-auto`, que es lo correcto.

**Corrección sugerida.** En móvil, mover el `nav` de pisos justo encima de la ficha
(`bottom-[calc(var(--alto-ficha)+0.75rem)]`) o esconderlo con `hidden` cuando hay selección y
ofrecer el cambio de piso dentro de la propia ficha.

---

## Menores

### M1. `alert()` bloqueante mezclado con el sistema de toasts
`src/visor/modales/Incidencia.tsx:46,68` y `src/visor/modales/Lead.tsx:23,25,45`.
El mismo archivo `Lead.tsx` usa `notificar()` en su otro componente (líneas 126,128,146,152).
Un `alert()` en pleno escenario congela la página, sale con el chrome del navegador y rompe la
estética. Reemplazar los cinco por `notificar(...)`.

### M2. `<a href="/panel">` fuerza recarga completa
`src/visor/Visor.tsx:97`. Al ir al panel se recarga toda la app (se pierde el store, se
reinicializa three.js, se vuelven a emitir los eventos de I1). Usar `<Link to="/panel">` de
react-router. Además el enlace es `text-slate-200/70` sobre el canvas claro: **ilegible** en la
mayoría de encuadres (verificado en móvil, queda encima del cielo blanco).

### M3. `import()` dinámico redundante de `tracking`
`src/lib/ia.ts:437`: `const { track } = await import('./tracking')`, cuando `getSesionId` del
mismo módulo ya se importa estáticamente en `ia.ts:23`. `vite build` lo reporta:
`tracking.ts is dynamically imported by ia.ts but also statically imported by … dynamic import will not move module into another chunk`.
Cambiar a import estático y quitar la advertencia.

### M4. `Overlay` desmonta con `setTimeout` y quitaría el div de la capa nueva
`src/three/interior/Overlay.tsx:22-28`. La limpieza pone `raiz.current = null` y difiere
`r.unmount()` + `div.remove()` a un macrotask. Si el efecto se re-ejecutara (montaje doble),
ese `div.remove()` diferido desengancharía el contenedor recién re-añadido y el HUD quedaría
invisible. **Hoy no ocurre** (verificado en navegador: el mini-plano, la etiqueta de ambiente
"Hall" y el botón "Mirar por la ventana" se ven perfectamente) porque R3F v8 no propaga
StrictMode a su propia raíz. Es deuda para una futura migración a R3F 9 / React 19. Fix:
desmontar de forma síncrona guardando el `div` en el mismo `useRef` que la raíz.

### M5. El título del documento no cambia en el panel
`index.html:7` fija `Showroom 3D · Los Jardines de Carabayllo` y nada lo actualiza. Con visor y
panel abiertos en dos pestañas (que es el montaje del guion §8.5), ambas pestañas se llaman
igual y el presentador puede equivocarse de pestaña en vivo. Añadir un
`useEffect(() => { document.title = 'Panel · …' }, [])` en `src/panel/Layout.tsx`.

### M6. `user-scalable=no` en el viewport
`index.html:5`: `maximum-scale=1, user-scalable=no` impide el zoom con pellizco. Antipatrón de
accesibilidad; si un miembro del jurado abre la demo en su móvil no podrá ampliar el texto de
la ficha (que usa tamaños de 10-11 px). Quitar `maximum-scale` y `user-scalable`.

### M7. Un lead de prueba visible en el panel
`supabase/seed.sql` incluye `Prueba Demo` / `51987654321`, que aparece en la tabla de leads de
`/panel` entre nombres verosímiles. Renombrarlo con un nombre ficticio coherente o excluirlo
del seed de presentación.

### M8. `useLeadsPorId()` abre un canal `panel-leads` extra por pantalla
`src/panel/datos.ts:278-281` llama internamente a `useLeads()`, así que `Citas.tsx`,
`Seguimientos.tsx` e `Incidencias.tsx` mantienen dos suscripciones cada una (la de su tabla más
`panel-leads`), y `useKpis` (`datos.ts:227-275`) añade `panel-kpis` más un `setInterval` de
30 s. Funciona, pero son 2-3 websockets simultáneos por pantalla del panel. Extraer un
`useLeadsCompartido()` cacheado a nivel de módulo, o resolver los nombres de lead con un
`select` puntual sin suscripción.

### M9. `vite.config.ts:8` usa `test: { environment: 'node' }` y un `as any`
Suficiente para los 22 tests actuales (funciones puras), pero cualquier test de componente
necesitará `jsdom`. El `as any` está ahí para silenciar que `defineConfig` de `vite` no conoce
la clave `test`; lo correcto es `import { defineConfig } from 'vitest/config'`.

### M10. `EdificioSimple` reconstruye ~1.000 cajas en cada UPDATE de Realtime
`src/three/interior/EdificioSimple.tsx:54` — `useMemo(..., [edificio, unidades, excluir])`.
Estando en modo interior o ventana, cualquier cambio de estado de cualquier unidad rehace el
array completo y vuelve a escribir las matrices de instancia. El color de esas cajas ni siquiera
depende del estado (línea 27: solo del piso). Depender de `Object.keys(unidades).length` o de
una lista memoizada de posiciones.

---

## Legal / licencias

- **L1 (OK).** `.env.local` está en `.gitignore` y contiene únicamente la URL local
  (`127.0.0.1:54421`) y la clave *publishable* de Supabase local (46 caracteres, no es una key
  de producción). `VITE_OPENAI_API_KEY` está **vacía**, como corresponde. No hay claves reales
  en el repo.
- **L2 (OK).** Nombres de personas ficticios (Rosa Huamán, Luis Ccahuana, Víctor Rojas…),
  constructora ficticia `Constructora Demo S.A.C. (ficticia)` en `seed.sql`, asesora ficticia
  `Carla Quispe` en `src/data/config.json`. No aparece ninguna marca real de constructora.
- **L3 (OK).** `LICENSES.md` declara explícitamente que todo el código es original del equipo y
  que no se copió código de ningún visor. No se detectó ningún fragmento proveniente de
  SILO/DwellTwin ni de ningún visor comercial: todo el 3D se construye con primitivas propias
  (`InstancedMesh` de cajas) y generadores deterministas propios.
- **L4 (a corregir).** `LICENSES.md` lista como assets `public/tipologias/*` y `public/vistas/*`,
  pero **ambos directorios están vacíos** (`public/` solo contiene `favicon.svg`). Un jurado que
  revise licencias encontrará entradas fantasma. Ajustar el texto a "no se usan assets binarios
  externos; todo el 3D se genera en tiempo de ejecución", que es lo que realmente ocurre.
- **L5 (menor).** Los emojis de la UI (🚪 🪟 💰 ✅ ♥ 🔥) los aporta la fuente del sistema, no son
  assets embebidos: no requieren licencia. Vale la pena decirlo en `LICENSES.md` para cerrar la
  pregunta antes de que la hagan.
- **L6 (redacción, OK).** El disclaimer "referencial" está presente donde debe:
  `src/visor/FichaUnidad.tsx:66` ("*Referencial: 10% inicial, 20 años, sin bono. Simula tu caso
  real.") y los motivos del score dicen "Precalificación **referencial**"
  (`src/lib/scoring.ts:30,32`). Revisar que el modal de precalificación repita la palabra
  "referencial" junto al veredicto grande, no solo en la letra chica.

---

## Rendimiento

- **R1.** `src/store.ts:123` — `export const selUnidadesLista = (s: State) => Object.values(s.unidades)`
  devuelve un **array nuevo en cada llamada**. Cualquier componente que lo use como selector de
  Zustand se re-renderiza en cada cambio del store, sea o no de unidades. Sustituir por un
  selector memoizado (`useShallow`) o derivar la lista con `useMemo` sobre `s.unidades`.
- **R2.** `vite build` genera **un solo chunk de 1.545,84 kB (gzip 427,49 kB)** y avisa
  *"Some chunks are larger than 500 kB"*. Para la demo local es irrelevante (todo se sirve desde
  `localhost`), pero si se enseña el build o se despliega, conviene un
  `build.rollupOptions.output.manualChunks` separando `three`/`drei` del resto, y cargar el
  panel con `React.lazy`.
- **R3.** `src/three/vistas/EntornoLejano.tsx:301-316` construye tres `THREE.PlaneGeometry`
  (18×26 segmentos) dentro de un `useMemo` con deps `[]` y no las libera explícitamente. R3F v8
  suele disponer la geometría al desmontar la malla, así que **probablemente no hay fuga**, pero
  entrar y salir de la vista de ventana muchas veces durante una demo larga es justo el caso que
  no se ha medido. Fix defensivo: `useEffect(() => () => geos.forEach(g => g.dispose()), [geos])`.
- **R4.** `src/three/interior/EdificioSimple.tsx:54` — ver M10: recomputo del edificio completo
  ante cualquier UPDATE de Realtime mientras se está en interior/ventana.
- **R5.** `src/three/interior/InteriorUI.tsx:128-151` (`EtiquetasAmbientes`) monta un `Html` de
  drei por ambiente (4-6 por unidad) con `occlude`, que hace un raycast por frame por etiqueta.
  Es asumible con 6 etiquetas; **no** replicar el patrón en la vista de edificio con las 96
  unidades.
- **R6 (OK).** El edificio principal y todo el interior se dibujan con `InstancedMesh` +
  `instanceColor` (`src/three/interior/Cajas.tsx`, `src/three/vistas/Instancias.tsx`): una sola
  llamada de dibujo por conjunto. Las matrices se escriben en `useLayoutEffect`, no por frame, y
  los materiales no se recrean en `useFrame`. Esta parte está bien resuelta.

---

## Verificado OK (no hace falta repetirlo)

**Herramientas**
- `npx tsc --noEmit` → **exit 0, cero errores**.
- `npx vitest run` → **22/22 tests en verde** (`finanzas.test.ts` 6, `scoring.test.ts` 9,
  `precalificacion.test.ts` 7). Vitest 2.1.9, 733 ms.
- `npx vite build` → **éxito en 11,73 s** (801 módulos). Solo dos avisos, ambos recogidos
  arriba (M3 y R2). No hay errores de tipos ni imports rotos.

**Navegador (pestaña propia `tab-7`; nunca se tocó `tab-1`)**
- La app arranca en `http://localhost:5173/` con la consola limpia: solo trazas de HMR de Vite,
  el aviso de *future flag* `v7_startTransition` de React Router y una nota de Fast Refresh
  sobre el export `CAMARA_INICIAL` de `Camara.tsx`. **Cero errores de JavaScript** en todo el
  recorrido.
- Ruta `/u/P07-N2`: selecciona la unidad, abre la ficha y muestra el toast de "te compartieron".
- **Modo interior funciona**: "🚪 Ver interior" entra en primera persona y el HUD del `Overlay`
  se monta correctamente (mini-plano orientado al norte, etiqueta de ambiente "Hall", botón
  "Mirar por la ventana", ayuda de controles). El caso que se sospechaba crítico **no** lo es
  (ver M4).
- `/panel` y el detalle de lead renderizan bien, sin errores. El "Score explicado" muestra las
  7 reglas con sus puntos; el timeline de eventos se ordena correctamente; las tarjetas vacías
  de Citas y Seguimientos muestran su texto de vacío.
- **Móvil 375×812**: **no hay desbordamiento horizontal** de la página
  (`documentElement.scrollWidth == clientWidth == 375`, `body.scrollWidth == 375`). El único
  desborde es interno al carrusel de pisos, que tiene su propio `overflow-x-auto`.

**Realtime y base de datos (REST `http://127.0.0.1:54421`, lecturas y un cambio revertido)**
- El pipeline de Realtime **funciona**: `PATCH unidades?id=eq.P01-E {"estado":"bloqueado"}`
  repintó la unidad en el visor abierto en ~2 s. **El cambio se revirtió** a `disponible`
  inmediatamente después; la BD quedó como estaba.
- Inventario actual: 96 unidades → 47 disponible / 9 separado / 38 vendido / 2 bloqueado.
- `eventos?payload=is.null` → `[]`: hoy no hay payloads nulos (por eso I8 es preventivo).
- Todos los eventos consultados llevan `sesion_id` no nulo; el backfill de `lead_id`
  (`src/lib/leads.ts:158`) está implementado y ordenado antes de `recalcularScore`.
- Los 10 leads sembrados tienen `score_detalle` poblado y coherente con su `score`.

**Contratos entre fases**
- `src/data/config.json` contiene **todas** las claves que el código consume: `financiamiento`
  (`tea_anual`, `plazos_anios`, `plazo_default_anios`, `cuota_inicial_min_pct`,
  `cuota_inicial_default_pct`, `ratio_cuota_ingreso_max`), `programas`, las 12 claves de `score`
  usadas por `scoring.ts`, `seguimientos.secuencia_minutos` / `canal_default`,
  `openai.modelo` / `modelo_chat`, `asesor.nombre` / `telefono`. Ninguna clave faltante.
- Las tablas usadas por el código (`unidades`, `leads`, `sesiones`, `eventos`, `favoritos`,
  `citas`, `seguimientos`, `incidencias`, `consultas`) **existen todas** en `0001_schema.sql`.
  La única discrepancia de columnas es la de I10 (`favoritos.lead_id`).

**Lógica de negocio (§5)**
- Amortización francesa correcta y cubierta por `finanzas.test.ts` (6 casos, incluido el borde
  de tasa 0).
- Precalificación Techo Propio / Mivivienda + BBP parametrizada desde `config.programas`,
  cubierta por `precalificacion.test.ts` (7 casos), con el veredicto redactado como
  "referencial".
- Score explicable regla a regla, con motivos legibles; `etapaPorScore` + `RANGO_ETAPA`
  (`leads.ts:34-41,204`) garantizan que **la etapa nunca retrocede** aunque el score baje.
- Normalización de teléfono peruano correcta para números válidos
  (`scoring.ts:83-93`: `/^(?:\+?51)?9\d{8}$/` → `51XXXXXXXXX`). El problema es solo el camino
  del número inválido (I11).
- El texto de los `wa.me` **sí** va con `encodeURIComponent` en los cuatro sitios.

**Concurrencia y UX de formularios**
- `separarUnidad` (`src/lib/separacion.ts:18-28`) usa bloqueo optimista real
  (`.eq('id', unidadId).eq('estado','disponible')` y comprueba `data.length === 0`): dos
  personas no pueden separar la misma unidad. **Bien resuelto.**
- Todos los botones que lanzan una petición tienen `disabled` mientras esperan:
  `Separar.tsx:139`, `Agendar.tsx:217`, `Lead.tsx:73,205`, `Incidencia.tsx:147`,
  `Chat.tsx:102,128`. El doble clic no dispara dos veces.
- Los controles de primera persona (`src/three/interior/controlesFP.ts:185-196`) y de la vista
  de ventana (`src/three/VistaExterior.tsx:247-255`) **quitan todos sus listeners** al
  desmontar y **restauran** `fov`, `near`, `rotation.order`, `touchAction` y `cursor` de la
  cámara y del canvas. No hay fugas de listeners entre modos.
- `Mapa.tsx:70-97` limpia su `setInterval`, su canal y su bandera `activo`. El resto de hooks de
  `src/panel/datos.ts` hacen `removeChannel` en la limpieza.

---

**Nota operativa.** Esta revisión generó tráfico real en la BD local: los eventos
`ver_edificio`, `ver_unidad` e `ver_interior` de las sesiones `b02a5391-…` y `4f0258b4-…`
(ids ~557-581) son míos. Si el KPI de "Visitantes" quiere salir limpio en la demo, conviene un
`pnpm db:reset` antes del 10 de septiembre (no lo ejecuté, según lo indicado).

---

## Estado de las correcciones (Fase 8, aplicadas el 2026-09-07 con Fable 5.1)

| Hallazgo | Estado | Dónde |
|---|---|---|
| C1 cámara se resetea por Realtime | Corregido | `src/three/Camara.tsx`: el efecto depende de la unidad seleccionada (id), no del diccionario completo |
| C2 sin error boundary ni rutas comodín | Corregido | `src/main.tsx` (`Fallback` + `errorElement` + `*`), `src/panel/Panel.tsx` (`*` → Leads) |
| C3 `JSON.parse`/localStorage sin proteger | Corregido | `src/store.ts` (`leerFavs`), `src/lib/tracking.ts` (helpers con fallback en memoria), `src/lib/leads.ts` |
| I1 StrictMode duplica eventos | Corregido | `src/visor/Visor.tsx`: `useRef` de eventos ya registrados |
| I2 simulador con eventos espurios | Corregido | `src/visor/modales/Simulador.tsx`: firma única + solo registra si el usuario tocó algo |
| I3 precio no se propaga | Corregido | `src/store.ts`: `aplicarFila` fusiona estado, precio y lead de separación (verificado en vivo) |
| I4 topic fijo de Realtime | Corregido | `src/store.ts`: topic único por suscripción + aviso de error de canal |
| I5 toast se pisa | Corregido | `src/visor/ui.ts`: limpia el temporizador anterior |
| I6 seed sin `alcanza` | Corregido | `scripts/generar-edificio.mjs`: payloads coherentes con `scoring.ts` |
| I7 precalificación sembrada sin programas | Corregido | `scripts/generar-edificio.mjs` (`precalificacionSeed`) + fallback de texto en `LeadDetalle.tsx` |
| I8 columnas asumidas no nulas | Corregido | `src/panel/LeadDetalle.tsx` |
| I9 `favoritos`/`consultas` fuera de la publicación | Corregido | `supabase/migrations/0001_schema.sql` |
| I10 `favoritos.lead_id` | Corregido | migración + backfill al guardar lead en `src/lib/leads.ts` |
| I11 teléfono en `wa.me` | Corregido | `telefonoWhatsapp` en `src/lib/scoring.ts`, usado en `LeadDetalle`, `Seguimientos` y `lib/seguimientos` |
| I12 seguimientos duplicados | Corregido | índice único `(lead_id, plantilla)` + `upsert` con `ignoreDuplicates` |
| I13 ficha móvil tapa pisos | Corregido | `Visor.tsx`: la barra de pisos se oculta en móvil mientras hay ficha (verificado a 375 px) |
| M1 `alert()` | Corregido | `Incidencia.tsx`, `Lead.tsx` usan `notificar` |
| M2 `<a href>` al panel | Corregido | `Link` de react-router |
| M3 `import()` dinámico | Corregido | `src/lib/ia.ts` |
| M4 Overlay | No aplicado | no se reproduce; riesgo bajo |
| M5 título del panel | Corregido | `src/panel/Layout.tsx` |
| M6 `user-scalable=no` | Corregido | `index.html` |
| M7 lead de prueba | Resuelto | eliminado por `pnpm db:reset` |
| M8 canal extra en `useLeadsPorId` | No aplicado | coste despreciable en local |
| M9 `as any` en `vite.config.ts` | Corregido | tipado explícito (`vitest/config` choca con vite 6, se evitó) |
| M10 `EdificioSimple` se reconstruye | Corregido | usa la geometría del JSON base, no el estado vivo |
| L4/L5 LICENSES fantasma | Corregido | `LICENSES.md` declara que no hay assets binarios externos |
| R1 selector muerto | Corregido | eliminado `selUnidadesLista` |
| R3 geometrías de cerros | Corregido | `dispose` al desmontar |

**Hallazgo extra al verificar:** tras un `pnpm db:reset`, un dispositivo con un `showroom.lead` viejo en
localStorage recibía 409 (clave foránea) en todos los eventos. Ahora `tracking.ts` detecta el código
`23503`, olvida el lead y reintenta sin él (verificado: 409 → 201).

Verificación final: `tsc` limpio, `vitest` 22/22, `vite build` OK, `pnpm gen` + `pnpm db:reset` aplicados.
