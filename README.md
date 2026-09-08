# Showroom 3D · Residencial Los Jardines de Carabayllo

Demo local para el **Hackathon Innova Vivienda** (Reto 1 · Comercial). Visor 3D interactivo de un edificio de
vivienda social que captura y califica leads para la constructora. Ver [docs/PLAN.md](docs/PLAN.md) para el diseño completo.

## Requisitos
- Node 20+, pnpm, Docker Desktop, Supabase CLI.

## Arranque
```bash
pnpm install
pnpm db:start        # Supabase local (puertos 544xx) con esquema + seed
pnpm dev             # http://localhost:5173  (visor) · /panel (constructora)
```

- `pnpm gen` regenera `src/data/edificio.json` y `supabase/seed.sql` desde `scripts/generar-edificio.mjs`; luego `pnpm db:reset`.
- `pnpm test` corre los tests de lógica de negocio (vitest).
- [docs/GUION_DEMO.md](docs/GUION_DEMO.md) tiene el guion de 3 minutos y la lista de chequeo previa.
- IA dentro del producto: OpenAI. Pon `VITE_OPENAI_API_KEY` en `.env.local`; sin key se usan plantillas deterministas.

## Estructura
```
src/three     escena 3D (edificio, cámara, entorno, interior, vista exterior)
src/visor     UI del visitante (ficha, filtros, modales)
src/panel     panel de la constructora
src/lib       lógica pura (finanzas, precalificación, score) + acceso a datos
src/data      edificio.json (generado) y config.json (parámetros referenciales)
supabase      config, migración y seed
```

Todos los datos de personas son ficticios. Constructora y proyecto son inventados. Cifras de bonos y tasas son referenciales.
