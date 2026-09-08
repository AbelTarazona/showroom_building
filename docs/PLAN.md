# Plan — "Showroom 3D que califica leads"
Hackathon Innova Vivienda · Reto 1 (Comercial) · UTEC, jueves 10 sep 2026, 12:00–20:00

## 0. Lo que dicen las bases y cómo nos afecta

| Regla (sección) | Implicación para nosotros |
|---|---|
| Cronograma real (5): 12:15–13:00 trabajo, 13–14 break, 14–15 mentorías, 15–18 trabajo, 18–19 pitches | **Solo ~3 h 45 min de desarrollo efectivo**, no 8 h. Es imposible construir esto desde cero en el evento. Hay que llegar con la base hecha y usar el evento para adaptar y pulir. |
| Los desafíos los presentan las constructoras al inicio y la solución debe "cumplir con los componentes indicados por los organizadores" (3.3, 7) | No sabremos los requerimientos exactos hasta el jueves. El producto debe ser **parametrizable** (edificio desde JSON, reglas en config) y tener piezas listas para conectar rápido según lo que pidan. |
| No hay lista explícita de criterios de evaluación; el jurado es UTEC Ventures + CTIV + constructoras (5) | Evaluarán como inversionistas y como clientes: problema real, demo que funciona, viabilidad de piloto. El pitch va dirigido a la constructora como cliente. |
| Ganador cede derechos del código "desarrollado durante la Hackathon" y debe dar facilidades para implementar (6) | No prohíben código previo, pero lo esperan hecho en el evento. Estrategia: la base previa es un "motor genérico"; lo específico del reto se construye en vivo. Confirmar por correo con los organizadores si aceptan base previa. |
| Contenido original, sin infringir derechos de terceros; responsables de la legalidad del software (6) | **No copiar código de SILO ni de DwellTwin**, solo la mecánica. Assets (GLB, panorámicas, íconos) con licencia CC0/MIT documentada en `LICENSES.md`. No usar marcas ni logos de constructoras reales. |
| Descalificación por "datos protegidos" (7) | Todo dato de personas es ficticio (leads, teléfonos, ingresos). Ninguna persona real en la demo. |
| No haber comercializado ni premiado antes (6) | La solución es nueva. OK. |
| Una sola solución (7) | Un solo repo, un solo pitch, un solo reto. |
| Equipos de 2 a 4, al menos un estudiante o egresado UTEC; prioridad a perfiles complementarios (3.1, 3.4) | Inscribirse con roles claros: dev 3D, dev backend/datos, negocio/pitch, diseño. |
| Hay wifi e internet en el evento (3.2) | La llamada al LLM es viable, pero se mantiene el fallback por plantilla. |
| Premio: USD 300 + Cena con constructoras para validar y buscar pilotos (4) | El verdadero premio es el piloto. La demo debe verse implementable con datos de una constructora real en días, no meses. |
| Inscripción hasta el 8 de septiembre 11:59 p.m.; luego formulario de compromiso por correo (3.5) | Inscribirse ya. Revisar el correo para el formulario. |

## 1. Tesis del producto

> Un edificio 3D interactivo donde la familia explora, simula su cuota, se precalifica al bono
> y separa su departamento. Cada interacción alimenta un motor que puntúa y prioriza leads
> para la constructora, con seguimiento automático y agendamiento con el asesor.

El 3D es el **sensor**; el producto comercial es el **funnel + panel de leads**. Cubre los 5
ejemplos del reto: seguimiento automático, priorización con IA, agendamiento, comunicación
centralizada y atención de consultas.

Dos usuarios, dos pantallas:

| Usuario | Pantalla | Qué hace |
|---|---|---|
| Familia compradora (móvil) | **Visor 3D** `/` | Explora el edificio, abre departamentos, ve interior y vista exterior, simula cuota, se precalifica, guarda favoritos, comparte, separa, agenda |
| Asesor / gerente comercial (desktop) | **Panel constructora** `/panel` | Ve leads en vivo con score, mapa de calor de interés por unidad, inventario, citas, mensajes de seguimiento generados, resumen IA por lead |

Todo corre local. Sin auth, sin seguridad, sin despliegue.

## 2. Stack

| Capa | Elección | Por qué |
|---|---|---|
| Frontend | Vite + React + TypeScript | Rápido de arrancar, un solo bundle |
| 3D | three.js vía `@react-three/fiber` + `@react-three/drei` | Cámara animada, raycast por clic, `Html` para etiquetas, `CameraControls` para vuelos tipo SILO |
| Estado UI | Zustand | Unidad seleccionada, filtros, sesión anónima |
| Estilos | Tailwind | Velocidad |
| Backend / DB | **Supabase local** (`supabase start`, Docker ya corre) | Postgres + Realtime (el lead aparece en el panel al instante = momento clave de la demo) + Studio para ver datos |
| Acceso a datos | `@supabase/supabase-js` directo desde el front, RLS desactivado | Sin servidor propio |
| IA en producto | **OpenAI** (SDK oficial `openai`, Responses API, modelo `gpt-5-mini` configurable en `config.json`) para resumen de lead, siguiente mejor acción, mensajes de seguimiento y chat de consultas; **fallback por plantilla** si no hay key / internet | Única dependencia externa; la demo no puede depender de ella |
| Datos demo | `seed.sql` + un JSON del edificio | Reproducible con `supabase db reset` |

Estructura de carpetas prevista:

```
hacka_utec/
├── docs/            # PLAN.md, GUION_DEMO.md, REVISION_FASE8.md
├── supabase/
│   ├── config.toml
│   ├── migrations/0001_schema.sql
│   └── seed.sql
├── src/
│   ├── data/edificio.json          # cuadro de unidades → edificio paramétrico
│   ├── lib/supabase.ts, scoring.ts, precalificacion.ts, tracking.ts
│   ├── three/Edificio.tsx, Unidad.tsx, Interior.tsx, VistaExterior.tsx, Camara.tsx
│   ├── visor/   (App comprador: Visor, FichaUnidad, Simulador, Precalificacion, Separar, Favoritos)
│   ├── panel/   (App constructora: Leads, DetalleLead, MapaCalor, Inventario, Citas, Seguimientos)
│   └── main.tsx (router: / y /panel)
└── public/
    ├── tipologias/A.glb | A.jpg ...   # interior por tipología (render o GLB simple)
    └── vistas/norte.jpg | sur.jpg ...  # panorámica por orientación
```

## 3. Edificio demo

Un solo proyecto ficticio, realista para vivienda social en Lima:

- **Residencial Los Jardines de Carabayllo** — 12 pisos, 8 departamentos por piso (96 unidades) en 4 orientaciones (norte/parque, sur/avenida, este/ciudad, oeste/cerros), núcleo central de ascensores, 1er piso con lobby y locales. Generado por `scripts/generar-edificio.mjs` (única fuente de verdad: `src/data/edificio.json` + `supabase/seed.sql`).
- **Tipologías** (repetidas, como en vivienda social real):
  - A · 2 dorm · 55 m² · S/ 165 000 aprox.
  - B · 3 dorm · 68 m² · S/ 198 000 aprox.
  - C · 1 dorm · 42 m² · S/ 129 000 aprox.
- Precio = base de tipología + prima por piso + prima por orientación (parque / avenida / interior).
- Orientaciones: norte (parque), sur (avenida), este, oeste.
- Estados: `disponible`, `separado`, `vendido`, `bloqueado`. Seed con ~55% disponible, 25% vendido, 15% separado, 5% bloqueado, distribuidos de forma verosímil (pisos bajos más vendidos).

El edificio se **genera desde `edificio.json`** (piso, posición, tipología, orientación, precio, estado). El mensaje para el jurado: *"cualquier constructora sube su cuadro de unidades y sale su edificio"*.

### Cómo se ve el 3D

- Torre de cajas por unidad, agrupadas por piso, con corte tipo SILO (fachada frontal semi-transparente para ver adentro).
- Color por estado (verde disponible, ámbar separado, gris vendido, rayado bloqueado) con toggle a color por tipología o por precio.
- Lista lateral de pisos (como SILO): clic en piso → la cámara vuela y el piso se resalta; clic en unidad → cámara a la unidad y se abre la ficha.
- Entorno mínimo: piso plano, parque al norte, avenida al sur, sol con sombras, cielo. Nada de mapas reales.
- Vista **interior**: al pulsar "Ver interior" la cámara entra a la unidad y muestra el GLB simple de la tipología (o, si no da tiempo, un render en modal). Modo primera persona con `PointerLockControls` o simplemente órbita interna.
- Vista **exterior desde la ventana**: panorámica equirectangular por orientación (foto libre o generada), con leve cambio por altura (más cielo en pisos altos). Se implementa como esfera con textura alrededor de la cámara.
- Mobile-first: botones grandes, gestos de órbita, la ficha sube desde abajo (bottom sheet).

## 4. Modelo de datos (Supabase)

```sql
proyectos      (id, nombre, distrito, descripcion, entrega_estimada)
tipologias     (id, proyecto_id, codigo, dormitorios, banos, area_m2, precio_base, asset_interior)
unidades       (id, proyecto_id, tipologia_id, piso, posicion, orientacion, precio, estado,
                lead_separacion_id null, updated_at)
sesiones       (id uuid, created_at, device, lead_id null)         -- visitante anónimo
eventos        (id, sesion_id, tipo, unidad_id null, payload jsonb, created_at)
leads          (id, sesion_id, nombre, telefono, email, ingreso_familiar, ahorro, tiene_vivienda,
                num_familia, distrito, consentimiento bool, precalificacion jsonb,
                score int, score_detalle jsonb, resumen_ia text, etapa, created_at, updated_at)
favoritos      (sesion_id, unidad_id, lead_id nullable — se rellena al guardar el lead)
citas          (id, lead_id, unidad_id, tipo [visita|llamada|videollamada], fecha, estado)
seguimientos   (id, lead_id, canal [whatsapp|email], plantilla, mensaje, programado_para, estado)
```

Tipos de `eventos.tipo`: `ver_edificio`, `ver_piso`, `ver_unidad`, `ver_interior`, `ver_vista`,
`simular_cuota`, `favorito`, `comparar`, `compartir`, `precalificar`, `iniciar_separacion`,
`separar`, `agendar`, `abandonar`.

Realtime activado en `leads`, `unidades`, `eventos`, `citas`.

## 5. Lógica de negocio

### 5.1 Tracking
Cada visitante recibe un `sesion_id` (localStorage). Todo clic relevante inserta un evento. Al capturar el lead se enlaza la sesión → el historial anónimo previo se convierte en señal de score.

### 5.2 Simulador de cuota
Entrada: precio, cuota inicial (%), plazo (años), TEA configurable, bono aplicable (según precalificación). Salida: cuota mensual y "¿te alcanza?" comparado con ingreso declarado (regla: cuota ≤ 30–35% del ingreso). Cifras en un `config.json` para no discutir tasas durante la demo.

### 5.3 Precalificación (bonos del Estado)
Reglas simplificadas y **parametrizadas en `config.json`** (no se hardcodean montos oficiales; se muestran como "referenciales"):
- Techo Propio / Bono Familiar Habitacional: ingreso familiar por debajo de un tope, no tener vivienda, aporte mínimo de ahorro.
- Nuevo Crédito Mivivienda + Bono del Buen Pagador: precio del inmueble dentro de rango, primera vivienda, cuota inicial mínima.
- Resultado: `{programa, elegible, bono_estimado, motivo}` por programa + veredicto general (alta / media / baja probabilidad).

### 5.4 Score del lead (0–100, por reglas, explicable)
| Señal | Puntos |
|---|---|
| Precalificación alta / media | +30 / +15 |
| Simuló cuota y le alcanza | +15 |
| Vio ≥3 unidades / vio interior / vio vista | +5 / +5 / +5 |
| Guardó favorito / comparó | +5 / +5 |
| Revisita (sesión previa) | +10 |
| Inició separación / agendó | +15 / +10 |
| Dejó teléfono válido | +5 |
Guardado en `score_detalle` para mostrar el "por qué" en el panel (esto convence más que una caja negra).

### 5.5 Resumen IA del lead
Al crear/actualizar un lead, se genera un párrafo para el asesor: quién es, qué vio, qué le alcanza, siguiente mejor acción. Implementación: llamada a **OpenAI** (`gpt-5-mini`, salida estructurada JSON: `resumen`, `siguiente_accion`, `mensaje_whatsapp`) con el historial de eventos y la precalificación; **si falla o no hay key, plantilla determinista** con los mismos datos. La key va en `.env.local` como `VITE_OPENAI_API_KEY` y se llama desde el front (demo local, sin preocuparse por seguridad).

### 5.6 Seguimiento automático
Al capturar lead sin agendar, o al abandonar tras iniciar separación, se crean `seguimientos` programados (ej. WhatsApp +5 min, +24 h, +72 h) con mensaje personalizado (unidad, cuota, bono). En la demo: se listan en el panel y el botón "Enviar" abre `wa.me/<telefono>?text=...`. No se integra API real de WhatsApp.

### 5.7 Separación y agendamiento
"Separar" pide datos mínimos (si no hay lead aún), marca la unidad `separado` (Realtime la pinta ámbar en todos los visores abiertos) y ofrece agendar visita a caseta / llamada. La cita aparece en el panel.

## 6. Panel constructora (`/panel`)

1. **Leads en vivo**: tabla ordenada por score, badge de etapa, última actividad; se actualiza con Realtime. Clic → detalle con timeline de eventos, precalificación, score explicado, resumen IA, botones "Llamar", "WhatsApp", "Agendar".
2. **Mapa de calor**: el mismo edificio 3D (componente reutilizado) coloreado por número de vistas / favoritos / leads por unidad. Toggle por métrica. Insight rápido: "los pisos 6–9 orientación parque concentran el 40% del interés".
3. **Inventario**: grid pisos × posiciones con estado, cambiar estado a mano (vendido/bloqueado).
4. **Citas**: lista por día.
5. **Seguimientos**: cola de mensajes programados con "Enviar ahora".
6. **KPIs arriba**: visitantes, leads, tasa de conversión visitante→lead, leads calificados, separaciones.

## 7. Orden de construcción y modelo de IA por fase

Modelos de desarrollo: **Claude Fable 5.1** (orquestación, arquitectura, 3D), **Claude Opus 5** (3D avanzado y revisión), **Claude Sonnet 5** (módulos bien especificados). Esfuerzo = nivel de razonamiento pedido al modelo.

| Fase | Entregable | Modelo de desarrollo | Esfuerzo | Por qué |
|---|---|---|---|---|
| 0 | Scaffold Vite+React+TS+Tailwind, `supabase init/start`, migración + seed, cliente supabase, router `/` y `/panel`, `LICENSES.md` | Fable 5.1 (directo) | Bajo | Tareas mecánicas; la sesión principal fija las convenciones que heredan las demás fases |
| 1 | Edificio paramétrico desde JSON, color por estado, lista de pisos, clic en unidad, vuelo de cámara, ficha básica | Fable 5.1 (directo) | Alto | Es el núcleo visual y de arquitectura; cámara, raycast y estado compartido requieren decisiones que condicionan todo lo demás |
| 2 | Tracking de eventos, simulador de cuota, precalificación, captura de lead con consentimiento, score explicado | Sonnet 5 (subagente) | Medio | Lógica de negocio pura, bien especificada en §5, testeable con unit tests |
| 3 | Panel: leads en vivo (Realtime), detalle con timeline y score, KPIs | Sonnet 5 (subagente) | Medio | CRUD + suscripciones Realtime, patrón repetitivo |
| 4 | Separar + agendar + Realtime en unidades; seguimientos programados con wa.me | Sonnet 5 (subagente) | Medio | Flujos de formulario y estados; depende de 2 y 3 |
| 5 | Interior por tipología y vista exterior por orientación | Opus 5 (subagente) | Alto | Transiciones de cámara, carga de GLB, esfera panorámica y controles en primera persona son lo más delicado del 3D |
| 6 | Mapa de calor en el panel, favoritos, comparar, compartir enlace por unidad | Sonnet 5 (subagente) | Medio | Reutiliza el componente de edificio con otro esquema de color; features de UI |
| 7 | Integración **OpenAI** (resumen de lead, siguiente acción, mensajes, chat de consultas) con fallback; importador CSV; exportar leads; incidencias postventa | Sonnet 5 (subagente) | Medio | Integración de API con contrato claro (JSON estructurado) |
| 8 | Revisión de código, pulido móvil, leads seed con historial, ensayo del guion | Opus 5 (revisión) + Fable 5.1 (correcciones) | Alto | Cazar bugs de integración entre fases y asegurar que la demo no falle en vivo |

IA dentro del producto: **solo OpenAI**. Modelo por defecto `gpt-5-mini` (barato y rápido para resúmenes); `gpt-5` disponible por config si el jurado pide más calidad en el chat de consultas.

### El día del evento

Escuchar los desafíos de las constructoras, ajustar `edificio.json` y `config.json` a lo que cuenten, activar las piezas que exijan, congelar código a las 17:15, ensayar el pitch con cronómetro y tener un video de respaldo.

## 8. Guion de demo (3 min)

1. Celular en pantalla: la familia abre el enlace, gira el edificio, filtra "3 dormitorios", toca el 7B orientación parque. Ve la ficha: precio, cuota estimada, "disponible".
2. Entra al interior, mira por la ventana hacia el parque.
3. Simula cuota, se precalifica → "Alta probabilidad: Nuevo Crédito Mivivienda + Bono del Buen Pagador". Deja nombre y teléfono.
4. Pantalla partida: en el panel aparece el lead **en vivo** con score 85 y el resumen: *"Familia de 4, ingreso S/ 3 800, precalifica a BBP, vio 4 unidades del 6.º al 9.º piso orientación parque, le alcanza la cuota del 7B. Siguiente acción: llamar y ofrecer visita a caseta el sábado."*
5. La familia toca "Separar" → el 7B se pinta ámbar en el panel al instante; agenda visita.
6. Mapa de calor: "el interés se concentra en pisos 6–9 orientación parque; los pisos altos sur casi no se miran → oportunidad de promoción". Cierre: el 3D vende, el motor califica, el asesor solo llama a quien está listo.

## 9. Riesgos y pendientes

- **Código previo**: las bases no lo prohíben pero hablan de código "desarrollado durante la Hackathon". Escribir hoy a los organizadores preguntando si se acepta llegar con una base propia. Si dicen que no, el plan B es llegar con el diseño, el esquema SQL, los assets y el JSON del edificio, y programar en el evento solo el visor básico + captura de lead + panel simple.
- **Requerimientos del reto se anuncian en el evento**: mitigado con motor parametrizable y piezas en reserva. Si piden algo fuera de lo previsto, se hace mock visual y se declara como "siguiente iteración" en el pitch.
- **Inscripción**: cierra el 8 de septiembre a las 11:59 p.m. Luego llega un formulario de compromiso por correo que hay que devolver a tiempo.
- **Wifi del evento**: hay internet, pero la demo corre 100% local; OpenAI es lo único externo y tiene fallback. Grabar un video de la demo como respaldo.
- **Propiedad intelectual**: nada de código copiado de SILO ni DwellTwin; assets CC0 listados en `LICENSES.md`; sin marcas reales.
- **Assets de interior**: conseguir 1–3 GLB libres de departamento o hacerlos con cajas texturizadas; plan B = imágenes render.
- **Panorámicas**: fotos equirectangulares libres (o generadas); plan B = gradiente de cielo + silueta.
- **Datos personales**: checkbox de consentimiento visible en el formulario (Ley 29733); no se muestra a compradores quién más está interesado, solo "alta demanda".
- **Cifras de bonos y tasas**: todas en `config.json`, etiquetadas como referenciales.
