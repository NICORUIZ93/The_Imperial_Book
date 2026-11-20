# CLAUDE.md

Guía para Claude Code en este repositorio.

## Qué es

The_Imperial_Book es una academia en español: una app Angular (`web/`) que renderiza lecciones Markdown
de `web/public/content/<curso>/modulo-N.md`. Los módulos de cada curso se definen en
`web/src/app/tracks/<curso>.track.ts` y se agregan en `web/src/app/course-data.ts`. El progreso vive en
`localStorage`. The app renders 16 curriculum tracks (324 modules, 1421 topics); la cifra la mide
`scripts/build_web_topic_index.py` sobre `web/public/content/topic-index.json` y
`scripts/audit_lesson_assets.py --docs-counts` exige que este archivo la declare.

## Cómo se trabaja

- **Specs primero (SDD).** Antes de cambiar algo, lee `specs/README.md`. Si el trabajo es nuevo, crea
  `specs/NNN-*.md` con criterios numerados y su `Verificación:`, y después implementa.
- **Formato único.** Todo tema nuevo o reescrito sigue `docs/reestructuracion/FORMATO-UNICO.md` (12 secciones
  fijas, nivel y minutos; lo mide `scripts/validate_formato.py`) y `docs/METODOLOGIA-DE-APRENDIZAJE.md`; su
  código sigue `docs/ESTANDAR-DE-CODIGO.md`. El plan vigente es `specs/021`.
- **Exactitud.** Ningún dato técnico se escribe sin ejecutarlo o verificarlo en una fuente primaria.
- **El dueño aprueba** los temarios antes de escribir temas.
- Lo retirado del repo está en las etiquetas `retirado/archivo`, `retirado/archivo-2026-11-18` y
  `retirado/archivo-docker-piloto` (el repositorio solo tiene la rama `main`); no se vuelve a traer sin spec.

## Comandos

```bash
cd web && npm ci && npm start        # http://localhost:4200
cd web && npm test -- --watch=false  # pruebas unitarias (Vitest)
cd web && npm run e2e                # Playwright
./scripts/validate.sh                # paridad de módulos, índice de temas y specs
python3 scripts/build_web_topic_index.py   # regenera el índice tras editar lecciones
python3 scripts/render_terminal_capture.py # captura real de terminal en SVG
```
