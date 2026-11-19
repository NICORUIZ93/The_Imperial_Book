# 016 · Reestructuración de temarios aprobada por el dueño

**Estado:** en curso
**Origen:** el 2026-11-18 el dueño aprobó las cuatro propuestas de
[docs/auditoria/PROPUESTAS-TEMARIO.md](../docs/auditoria/PROPUESTAS-TEMARIO.md): versiones de referencia,
fusión de duplicados, reparto de DevOps hacia los cursos nuevos y temas faltantes. Eligió **Spring Boot**
como backend de referencia de RutaFlow.

## Reglas

- La línea de versiones vive en `docs/VERSIONES.md` y las lecciones la siguen; cada versión se comprueba en
  la fuente oficial o ejecutándola en el Mac del dueño (specs/015).
- Al fusionar o mover módulos, el progreso guardado del estudiante no se pierde: la app traduce los
  identificadores antiguos (`web/src/app/module-renumbering.ts`).
- Los temas nuevos y reescritos siguen la plantilla de la metodología y traen ejercicios con solución
  plegada (`<details>`).
- El reparto hacia Docker, Kubernetes, Diseño de sistemas y Microservicios se hace cuando el dueño apruebe el
  temario de cada curso nuevo (specs/013 P7); hasta entonces el contenido no se borra de su curso actual.

## Criterios

- **R1** `pendiente` — Existe la línea de versiones y las lecciones no citan versiones retiradas.
  Verificación: `test -f docs/VERSIONES.md && ! grep -rqE "Python 3\.9|typescript@5|Node(\.js)? 18|ingress-nginx|Promtail" web/public/content`
- **R2** `pendiente` — Flutter sin módulos duplicados (13/18, 14/19, 15/20 fusionados).
  Verificación: `test $(ls web/public/content/flutter/modulo-*.md | wc -l) -le 20`
- **R3** `pendiente` — Spring Boot fusionado a 21 módulos o menos.
  Verificación: `test $(ls web/public/content/spring-boot/modulo-*.md | wc -l) -le 21`
- **R4** `pendiente` — Temas faltantes agregados en los cursos existentes.
  Verificación: `grep -rqi "programación orientada a objetos" web/public/content/foundations && grep -rq "try/catch" web/public/content/javascript && grep -rq "Navigation 3" web/public/content/android && grep -rq "Signal Forms" web/public/content/angular && grep -rq "Nyquist" web/public/content/control-1`
- **R5** `pendiente` — El backend de referencia de RutaFlow es Spring Boot.
  Verificación: `grep -rq "Spring Boot" web/public/content/rutaflow/modulo-0.md`
- **R6** `pendiente` — El progreso de módulos renumerados se conserva.
  Verificación: `test -f web/src/app/module-renumbering.ts`
