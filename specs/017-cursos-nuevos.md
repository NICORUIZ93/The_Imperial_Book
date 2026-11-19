# 017 · Cursos nuevos: Docker, Kubernetes, Diseño de sistemas y Microservicios completo

**Estado:** en curso
**Origen:** temarios aprobados por el dueño el 2026-11-18 (specs/013, sección «Temarios aprobados por el
dueño»). IA aplicada y Blockchain no están aprobados y no se escriben.

## Reglas

- Cada curso sigue su temario de `docs/temarios/` y la metodología: temas de 20–45 min, 3–6 subtemas,
  ejercicios con solución plegada, código ejecutado y versiones de `docs/VERSIONES.md`.
- El contenido que llega de otros cursos (reparto de specs/016) se reescribe en el curso nuevo; en el curso de
  origen se deja un enlace al tema nuevo y se retira el duplicado solo cuando el tema nuevo existe.
- Lo que requiere Docker con registros, kind o Kubernetes se verifica en el Mac del dueño con
  `verificacion/cloud-devops/` (specs/015).

## Criterios

- **N1** `pendiente` — Docker publicado con sus 14 módulos.
  Verificación: `test $(ls web/public/content/docker/modulo-*.md | wc -l) -ge 14`
- **N2** `pendiente` — Kubernetes publicado con sus 16 módulos.
  Verificación: `test $(ls web/public/content/kubernetes/modulo-*.md | wc -l) -ge 16`
- **N3** `pendiente` — Diseño de sistemas publicado con sus 10 módulos.
  Verificación: `test $(ls web/public/content/system-design/modulo-*.md | wc -l) -ge 10`
- **N4** `pendiente` — Microservicios completo (12 módulos, con Strangler Fig, BFF y CQRS).
  Verificación: `test $(ls web/public/content/microservices/modulo-*.md | wc -l) -ge 12 && grep -rq "Strangler" web/public/content/microservices && grep -rq "CQRS" web/public/content/microservices`
