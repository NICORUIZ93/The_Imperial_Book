# 012 · Limpieza a fondo (segunda pasada)

**Estado:** hecho
**Origen:** pedido del dueño el 2026-11-18 («revisa más a fondo para limpiar»). Sigue a specs/011.

## Hallazgos y decisiones

| Hallazgo | Decisión |
|---|---|
| 4 figuras de Control 1 (`parcial1-*`, `parcial2-*`) y 8 visuales de Java y Spring Boot que ninguna lección ni la app usan | Retirados |
| Bloque «Documentación y versiones de referencia» del catálogo (`official-updates.ts`): versiones que ya nadie verifica (por ejemplo «Angular v22» con la app en Angular 21) | Retirado; cada curso declarará su versión en su spec |
| 8 pruebas e2e que comprobaban textos de lecciones viejas (Java m0 y m20, Spring Master, prototipo, inicio desde cero, renovación, modo libro ×2) y fallaban antes de la limpieza | Retiradas; las pruebas de recorrido quedan |
| `web/README.md` hablaba de «Floci Academy» | Reescrito |
| Control 1 usa el laboratorio `examples/control-1-tanque` (5 menciones y el proyecto integrador) | Devuelto desde el archivo |

## Se conserva a propósito

- La página **Temario** (`/temario`): lista los temas con lección real. Sus datos
  (`curriculum-catalog.json`, `curriculum-stacks/`) ya no tienen generador; se rehace en el rediseño web.
- `learning-activities.ts`, `project-bootstrap.ts`, `track-guides.ts`, `technical-glossary.ts` y
  `official-learning-paths.ts`: metadatos de cada curso que se redefinen en el proceso de cursos.
- La skill `archify` (18 MB): herramienta de diagramas para los cursos nuevos.
- 38 lecciones que citan laboratorios de `examples/` retirados (485 menciones; los más citados:
  `java-jpa-lab`, `spring-stream-rutaflow`, `spring-kafka-rutaflow`). Se resuelve curso por curso.

## Criterios

- **F1** `hecho` — Ningún archivo de `web/public/figures`, `visuals` o `brands` queda sin uso.
  Verificación: `! git ls-files web/public | grep -qE 'parcial[12]-|modulo-0-tema-1-bytecode|login-jwt'`
- **F2** `hecho` — El catálogo ya no muestra versiones sin verificar.
  Verificación: `! git ls-files web/src | grep -q official-updates && ! grep -q officialUpdates web/src/app/catalog/course-catalog.html`
- **F3** `hecho` — Control 1 tiene de vuelta su laboratorio.
  Verificación: `test -f examples/control-1-tanque/simular.py`
