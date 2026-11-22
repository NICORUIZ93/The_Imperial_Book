# Spec 028 — Diseño instruccional de 3 cursos independientes

## Objetivo

Convertir el prompt de diseño instruccional en un plan ejecutable dentro del repositorio: un documento maestro verificable, plantillas/contratos reutilizables y una primera base de fichas 15/15 que permita producir los tres cursos por lotes sin declarar cobertura falsa.

## Contexto

- El prompt exige tres cursos independientes (Java, Spring Boot microservicios, Node.js microservicios), cada tema con 15 puntos obligatorios, labs desde cero, verify.sh, y criterio de aceptación del 100%.
- En este repo, “cubierto” solo puede marcarse con evidencia ejecutada. Este spec no marca los cursos completos; define y verifica la base de producción.

## Criterios

- **C1** `hecho` — Existe un documento maestro en `docs/diseno-instruccional-3-cursos.md` con: contexto del estudiante, regla de oro, plantilla 15/15, matriz por tema de los 3 cursos, plantillas ADR/rúbrica/diario, checklist de herramientas, guía de entorno/costos/accesibilidad, y estado honesto de completitud.
  Verificación: `test -f docs/diseno-instruccional-3-cursos.md && grep -nE "FICHA DE TEMA|Matriz maestra por tema|Casos obligatorios .NO usar X.|Estado de este entregable" docs/diseno-instruccional-3-cursos.md`

- **C2** `pendiente` — Existe estructura base de producción por curso (`docs/cursos/java-desde-cero/`, `docs/cursos/springboot-microservicios-desde-cero/`, `docs/cursos/node-microservicios-desde-cero/`) con README, plantilla de ficha, contrato de verify.sh y backlog por módulos.
  Verificación: `test -f docs/cursos/java-desde-cero/README.md && test -f docs/cursos/springboot-microservicios-desde-cero/README.md && test -f docs/cursos/node-microservicios-desde-cero/README.md && test -f docs/cursos/_templates/ficha-15-puntos.md`

- **C3** `pendiente` — Primer lote de fichas 15/15 creadas y validadas por script (al menos 1 ficha por curso, incluyendo las 3 de muestra), sin secciones vacías ni placeholders.
  Verificación: `python3 scripts/validate_course_design.py --check`

- **C4** `pendiente` — Cada ficha del lote tiene laboratorio asociado con README, código/referencia o esqueleto ejecutable y `verify.sh` con criterio pass/fail.
  Verificación: `python3 scripts/validate_course_design.py --check-labs`

- **C5** `pendiente` — Los tres cursos alcanzan 100% de fichas 15/15, labs ejecutables y verify.sh verde en CI. **No marcar hecho sin evidencia completa.**
  Verificación: `python3 scripts/validate_course_design.py --check --strict-all`
