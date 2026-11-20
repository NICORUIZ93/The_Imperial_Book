# 011 · Limpieza total del repositorio

**Estado:** hecho
**Origen:** pedido del dueño el 2026-11-18 («en el repo hay mucha basura, hagamos una limpieza primero»),
aprobado el mismo día.

## Qué se retiró

Todo pasó a la rama `archivo-2026-11-18` (copia exacta de `main` antes de esta limpieza). El piloto de
Docker descartado quedó en `archivo-docker-piloto`.

| Grupo | Qué era |
|---|---|
| `docs/` | unos 120 informes generados por auditorías de contenido viejo, temarios, planes y revisiones |
| `scripts/` | 53 auditores, validadores y generadores de esos informes |
| `specs/` 001–010 | specs de procesos anteriores que se contradecían entre sí |
| `examples/` | 1572 archivos: laboratorios sueltos (`spring-*-rutaflow`, manim, archify, electronics…) |
| Restos de Floci | `docker-compose.yml`, `install.sh`, `.env.example`, `floci-landing.html`, `LICENSE-FLOCI.txt` |
| Raíz y agentes | `MASTER-PROMPT.md`, `CHANGELOG.md`, `AGENTS.md`, `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `.agents/`, skill `academy-flow-inspector` |

## Qué queda

La app Angular (`web/`), el contenido actual de los cursos (hasta que el proceso de cursos decida qué
se conserva), `docs/METODOLOGIA-DE-APRENDIZAJE.md`, `docs/ESTANDAR-DE-CODIGO.md`, la skill `archify` y
cuatro scripts: `validate.sh`, `validate_specs.py`, `build_web_topic_index.py` y
`render_terminal_capture.py`.

Efecto conocido: varias lecciones citan rutas de `examples/` o `docs/` que ya no están en `main`. Se
resuelve al rehacer cada curso.

## Criterios

- **C1** `hecho` — Existen las ramas de archivo con todo lo retirado (viven en `origin`, no en refs locales).
  Verificación: `git rev-parse --verify origin/archivo-2026-11-18 && git rev-parse --verify origin/archivo-docker-piloto`
- **C2** `hecho` — `examples/` solo guarda laboratorios que citan las lecciones (specs/013), y los informes de `docs/` y los restos de Floci ya no están en `main`, salvo `docker-compose.yml`, que vuelve porque Cloud M0–M1 lo usan (specs/013).
  Verificación: `python3 scripts/validate_lesson_labs.py && test -f docker-compose.yml`
- **C3** `hecho` — La validación mínima pasa.
  Verificación: `./scripts/validate.sh`
