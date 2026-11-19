# 016 · Arquitectura curricular y rediseño total

**Estado:** hecho
**Origen:** el dueño pidió rediseñar toda la página y reorganizar temas y cursos el 2026-11-18.

## Objetivo

Sustituir la biblioteca plana por una secuencia académica explícita, conservar URLs y progreso, y aplicar
la misma jerarquía a catálogo, portada de ruta, módulos, navegación y lector. La organización debe explicar
qué estudiar antes, por qué y cuál es la siguiente etapa sin presentar una marca de progreso como dominio.

## Decisiones

- Los identificadores de track y módulo no cambian; son contratos de URL, progreso y referencias editoriales.
- Los cursos se agrupan en base común, lenguajes, aplicaciones, sistemas, integración y especialización.
- Las dependencias se registran como datos verificables y siempre aparecen antes que el curso dependiente.
- Dentro de cada curso se muestra fundamento → práctica guiada → integración → diagnóstico profesional.
- Los 1.432 temas conservan su fuente editorial; esta reorganización no afirma que todos sean practicables.

## Criterios

- **U1** `hecho` — Los 16 cursos aparecen una sola vez en una etapa académica.
  Verificación: `cd web && npm test -- --watch=false`
- **U2** `hecho` — Todo prerrequisito aparece antes que el curso que depende de él.
  Verificación: `grep -q "places prerequisites before" web/src/app/learning-paths.spec.ts`
- **U3** `hecho` — El catálogo presenta etapas, propósito y prerrequisitos, no una lista plana.
  Verificación: `grep -q "group.description" web/src/app/catalog/course-catalog.html`
- **U4** `hecho` — La portada de cada ruta enlaza las bases recomendadas.
  Verificación: `grep -q "prerequisites()" web/src/app/course/track-overview.html`
- **U5** `hecho` — Los módulos muestran las cuatro etapas pedagógicas con nombres reales.
  Verificación: `grep -q "Diagnóstico y decisión profesional" web/src/app/course-module.model.ts`
- **U6** `hecho` — Build, pruebas, validación estructural y navegador pasan después de reorganizar.
  Verificación: `./scripts/validate.sh`
