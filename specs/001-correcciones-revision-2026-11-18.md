# 001 · Correcciones de la revisión completa del 2026-11-18

**Estado:** hecho
**Origen:** revisión con `academy-flow-inspector` (barrido de 291 páginas con Chrome real, auditorías
editoriales y pruebas unitarias). Las 26 páginas "sin temas" del barrido fueron falsos positivos por
carga del servidor de desarrollo y se descartaron al reabrirlas una por una.

## Contexto y límites

- Solo se tocan los archivos que cada criterio nombra; no se reescriben lecciones fuera del alcance.
- Ningún criterio cambia el número de rutas, módulos ni temas.
- Los enlaces al código del repositorio se publican como URL absolutas de GitHub, porque la app solo
  sirve `web/public/`.

## Criterios

- **C1** `hecho` — Cada ruta, salvo `rutaflow` (que usa marca tipográfica), tiene su logo en
  `web/public/brands/<id>.svg`; la ruta `microservices` deja de pedir un archivo que da 404.
  Verificación: `python3 scripts/audit_lesson_assets.py --logos`
- **C2** `hecho` — Ninguna lección enlaza con rutas relativas que salen de `web/public/content`
  (`](../…)`); los 13 enlaces a `examples/`, `docker-compose.yml`, `web/` y `.claude/` apuntan a
  `https://github.com/NICORUIZ93/The_Imperial_Book/(tree|blob)/main/…` y el destino existe en el repo.
  Verificación: `python3 scripts/audit_lesson_assets.py --links`
- **C3** `hecho` — Un título de tema con comillas invertidas (14 casos, p. ej. "Variables,
  conversiones y \`String\`") se muestra con `<code>` en la tira de temas, el aviso de tema enfocado
  y el encabezado del tema; en búsqueda y textos planos aparece sin comillas invertidas.
  Verificación: `cd web && npx ng test --watch=false --include='**/topic-title.spec.ts'`
- **C4** `hecho` — La prueba "marca temas leídos, los conserva y continúa…" pasa de forma estable:
  el helper `settle()` cede macrotareas porque, al volver a un capítulo en caché, la mejora del DOM
  llega en una macrotarea posterior. El comportamiento real ya era correcto en Chrome.
  Verificación: `cd web && npm test -- --watch=false`
- **C5** `hecho` — `CLAUDE.md` declara los mismos conteos de rutas, módulos y temas que
  `web/public/content/topic-index.json`.
  Verificación: `python3 scripts/audit_lesson_assets.py --docs-counts`
- **C6** `hecho` — `cloud/modulo-0.md` Tema 7 integra su teoría dentro de los pasos 1–7 y no deja
  texto después del cierre; el baseline de sustancia queda en cero defectos y `--strict` impide que
  reaparezcan.
  Verificación: `python3 scripts/audit_lesson_substance.py --strict`

## Fuera de alcance (registrado para no repetir el análisis)

- Formato de 7 pasos incompleto en `spring-boot`, `control-1`, `java`, `node` y `microservices`: esas
  rutas usan el formato migrado; no es contenido faltante. Se trata en una spec propia si se decide
  unificar formato.
- 510 temas sin ayuda visual y 65 sin transferencia al proyecto integrador: se cubren de forma
  incremental con la spec [002](002-estandar-temas-con-capturas-y-ayudas.md) al crear o editar temas.
