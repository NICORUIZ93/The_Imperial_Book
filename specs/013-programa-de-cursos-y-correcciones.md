# 013 · Programa de cursos y correcciones

**Estado:** en curso
**Origen:** pedido del dueño el 2026-11-18: «agrega todo y soluciona lo malo que descubriste, deja todo
perfecto», después de validar las 38 capturas académicas contra el temario, y su prompt de auditoría
editorial con el «estado final» del libro (Parte 2).

## Decisiones del dueño

- Se conservan los 16 cursos actuales.
- Se completa **Microservicios** (hoy 2 módulos): entran Strangler, BFF y CQRS, que faltaban.
- Se agregan temas a cursos existentes: despliegue *ramped* (DevOps) y cumplimiento legal de una app
  con la Ley 1581 de 2012 (Fundamentos).
- Cursos nuevos: **Docker**, **Kubernetes**, **Diseño de sistemas**, **IA aplicada al desarrollo** y
  **Blockchain**. Cada temario se aprueba antes de escribir temas (regla de `CLAUDE.md`).
- El estándar de cierre es la Parte 2 del prompt de auditoría del dueño.

## Lo malo que se descubrió y su corrección

| Problema | Corrección |
|---|---|
| La limpieza de specs/011 sacó 61 laboratorios que 38 lecciones sí usan | Se devolvieron desde el archivo; un validador exige que `examples/` tenga exactamente los laboratorios citados |
| La página Temario se quedó sin generador | `scripts/build_curriculum_catalog.py` la genera desde el índice de temas real |
| La app guardaba preferencias con el nombre «academia-floci» | Claves nuevas `imperial-book-*`; se siguen leyendo las anteriores para no perder el progreso ni las preferencias |

## Criterios

- **P1** `hecho` — Ninguna lección cita un laboratorio inexistente y `examples/` no guarda nada sin uso.
  Verificación: `! test -e examples && ! grep -rIl "examples/" web/public/content web/src/app --include="*.md" --include="*.ts" --include="*.html"`
- **P2** `hecho` — La página Temario se genera desde el índice real y está al día.
  Verificación: `python3 scripts/build_curriculum_catalog.py --check`
- **P3** `hecho` — La app ya no escribe claves con «floci» y sigue leyendo las anteriores.
  Verificación: `! grep -rq "STORAGE_KEY = 'academia-floci" web/src/app && grep -q LEGACY_KEY web/src/app/theme.service.ts`
- **P4** `hecho` — Auditoría editorial independiente con la rúbrica del dueño, guardada en `docs/`.
  Verificación: `ls docs | grep -q auditoria-editorial`
- **P5** `pendiente` — La plantilla de tema de la Parte 2 queda en la metodología y un script la valida.
  Verificación: `grep -q "Plantilla obligatoria del tema" docs/METODOLOGIA-DE-APRENDIZAJE.md`
- **P6** `pendiente` — Temas nuevos: Strangler, BFF, CQRS, despliegue *ramped* y cumplimiento legal, con la
  plantilla nueva y código ejecutado.
  Verificación: `grep -rq "Strangler" web/public/content/microservices && grep -rq "Ley 1581" web/public/content/foundations`
- **P7** `hecho` — Temarios de los cursos nuevos y de Microservicios completo, aprobados por el dueño.
  Verificación: `grep -q "Temarios aprobados por el dueño" specs/013-programa-de-cursos-y-correcciones.md`


## Hallazgo de la auditoría que corrige la limpieza 011

Cloud M0–M1 usan el `docker-compose.yml` de la raíz; la limpieza 011 lo borró. Vuelve a la raíz como laboratorio citado (criterio C2 de specs/011 actualizado).

## Temarios aprobados por el dueño

El 2026-11-18 el dueño aprobó los temarios de [Docker](../docs/temarios/docker.md), [Kubernetes](../docs/temarios/kubernetes.md), [Diseño de sistemas](../docs/temarios/diseno-de-sistemas.md) y [Microservicios completo](../docs/temarios/microservicios.md). Los de **IA aplicada** y **Blockchain** quedan sin aprobar: no se escriben lecciones de esos cursos. Las lecciones se escriben en specs/017.
