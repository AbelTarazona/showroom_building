# Guion de demo (3 minutos) · ensayo

Unidad protagonista: **P07-N2** (tipología B, 3 dorm, 68 m², vista al parque, S/ 209,400, disponible).
Alternativas si alguien la separó en un ensayo: P08-N2 o P09-N2 (mismas características, pisos 8 y 9).

## Antes de subir al escenario (10 min)
1. `pnpm db:reset` → estado limpio: 47 disponibles, 9 separados, 38 vendidos, 10 leads con historial.
2. `pnpm dev` y abrir dos ventanas lado a lado:
   - Izquierda (celular o ventana angosta): `http://localhost:5173/`
   - Derecha (panel): `http://localhost:5173/panel`
3. Opcional: `VITE_OPENAI_API_KEY` en `.env.local` para resúmenes y chat con IA. Sin key, todo funciona con plantillas (el badge dice "Modo sin conexión").
4. Probar una vez: separar P09-N3 desde el visor y ver que se pinta ámbar en el panel. Luego `pnpm db:reset` de nuevo.

## Minuto 0:00 – 0:45 · La familia explora
- Girar el edificio, tocar **3 dorm** en los filtros. Quedan iluminadas solo las tipología B.
- Tocar **P7** en la lista de pisos → la cámara vuela al piso 7. Tocar **P07-N2**.
- Leer la ficha: "S/ 209,400, desde S/ 1,822 al mes, orientación norte, vista al parque, disponible".
- Frase: *"Esto es lo que hoy no tiene una familia de Carabayllo: ver su depa antes de que exista."*

## Minuto 0:45 – 1:20 · Adentro y por la ventana
- **Ver interior** → recorrido en primera persona (WASD / arrastrar en móvil). Señalar la sala, la cocina, el dormitorio principal.
- **Ver la vista** → asomarse por la ventana: parque con laguna al norte.
- Volver al edificio.

## Minuto 1:20 – 2:00 · Cuota, bono y lead
- **Simular cuota**: ingreso familiar S/ 3,800, ahorro S/ 15,000 → cuota y bono referencial.
- **¿Califico al bono?** → "Perfil con alta probabilidad referencial de acceder a Nuevo Crédito Mivivienda…" con bono estimado.
- Dejar nombre y teléfono (ficticios: "Familia Quispe", 999 000 111) con consentimiento.
- En la ventana derecha: el lead aparece **en vivo** en `/panel` con su score. Abrirlo y tocar **Generar con IA**:
  score, unidades vistas, precalificación y siguiente acción con botón de WhatsApp.

## Minuto 2:00 – 2:30 · Separación en vivo
- Volver al celular: **Separar este depa** → confirmar.
- En el panel: P07-N2 se pinta ámbar al instante (Realtime), el lead pasa a etapa "separado" y se programan los seguimientos.
- **Agenda tu visita** → cita sábado en caseta. Aparece en `/panel/citas`.

## Minuto 2:30 – 3:00 · Lo que ve la constructora
- `/panel/mapa`: el interés se concentra en pisos 6–9 orientación parque; los pisos altos sur casi no se miran → oportunidad de promoción.
- `/panel/inventario`: importar precios por CSV; `/panel/incidencias`: postventa con 3 casos.
- Cierre: *"El 3D vende, el motor califica, el asesor solo llama a quien está listo. Todo corre local, con datos ficticios y código original."*

## Preguntas probables del jurado
- **¿Es real el bono?** Cifras referenciales de `src/data/config.json`; el simulador lo dice en pantalla. La entidad financiera decide.
- **¿Y sin internet?** Supabase corre en Docker local; la IA (OpenAI) tiene fallback por plantillas.
- **¿Cuánto cuesta modelar otro edificio?** El edificio se genera desde `scripts/generar-edificio.mjs` (pisos, tipologías, precios). Un GLB real se puede montar encima sin cambiar el flujo.
- **¿Privacidad?** Consentimiento explícito en el formulario, sesiones anónimas hasta que la persona deja sus datos.
