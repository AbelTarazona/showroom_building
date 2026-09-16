# Licencias de dependencias y assets

Todo el código de este repositorio es original del equipo y se licencia bajo PolyForm Noncommercial 1.0.0 (ver [LICENSE.md](LICENSE.md)). La mecánica de "edificio en corte con lista de niveles"
está inspirada en visores 3D públicos, pero no se copió código de ninguno.

## Librerías (npm)
| Paquete | Licencia |
|---|---|
| react, react-dom, react-router-dom | MIT |
| three, @react-three/fiber, @react-three/drei | MIT |
| zustand | MIT |
| @supabase/supabase-js | MIT |
| openai (SDK) | Apache-2.0 |
| tailwindcss, vite, typescript, vitest | MIT / Apache-2.0 |

## Assets
No se usa ningún asset binario externo (sin GLB, texturas, fotos ni fuentes descargadas).

| Asset | Origen | Licencia |
|---|---|---|
| Edificio, entorno, interiores por tipología y vistas exteriores | Generados en tiempo de ejecución con primitivas de three.js (`src/three/**`) a partir de `src/data/edificio.json` | Original |
| `public/favicon.svg` | Dibujado por el equipo | Original |
| Emojis de la interfaz (🚪 🪟 💰 ✅ ♥ 🔥) | Fuente de emojis del sistema operativo del visitante; no se embebe ninguna | No aplica |

Si se añade cualquier archivo externo (GLB, foto, ícono), registrarlo aquí con su URL y licencia (solo CC0, MIT o equivalente).
