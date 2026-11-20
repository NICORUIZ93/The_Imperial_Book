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
- **Metodología.** Todo tema sigue `docs/METODOLOGIA-DE-APRENDIZAJE.md` (temas de 20–45 min, 3–6
  subtemas con Contexto → Hazlo tú → Entiende → Cierra) y su código sigue `docs/ESTANDAR-DE-CODIGO.md`.
- **Exactitud.** Ningún dato técnico se escribe sin ejecutarlo o verificarlo en una fuente primaria.
- **El dueño aprueba** los temarios antes de escribir temas.
- Lo retirado del repo está en las ramas `archivo` y `archivo-2026-11-18`; no se vuelve a traer sin spec.

## Comandos

```bash
cd web && npm ci && npm start        # http://localhost:4200
cd web && npm test -- --watch=false  # pruebas unitarias (Vitest)
cd web && npm run e2e                # Playwright
./scripts/validate.sh                # paridad de módulos, índice de temas y specs
python3 scripts/build_web_topic_index.py   # regenera el índice tras editar lecciones
python3 scripts/render_terminal_capture.py # captura real de terminal en SVG
```
