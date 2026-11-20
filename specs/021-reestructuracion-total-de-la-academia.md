# 021 · Reestructuración total de la academia: un tema, un lugar, una forma

**Estado:** en curso
**Origen:** el 2026-11-20 el dueño pidió revisar todos los cursos, temas y subtemas porque hay duplicidad
de títulos, redundancia, temas dentro de otros módulos, explicaciones y ejemplos desiguales, estructura de
página inconsistente, temas faltantes, falta de imágenes y de código, y falta de linealidad. Pidió un plan
de acción, autorizó reestructurar todo si hace falta y fijó **Floci** como la nube local de la academia
(«tampoco está bien explicado y el README está súper mal»).

## Diagnóstico medido (2026-11-20, 16 cursos, 1.608 temas)

| Problema | Medida |
|---|---|
| El mismo asunto enseñado desde cero en varios cursos | Docker: 31 temas en 6 cursos · Kubernetes: 15 en 5 · CI/CD: 16 en 8 · Observabilidad: 39 en 11 · Terraform/IaC: 20 en 12 · JWT/OAuth: 12 en 4 · Kafka/colas: 18 en 3 · Testing: 85 en 15 |
| Títulos idénticos repetidos | 14 (7 dentro de Microservicios, 7 entre cursos) |
| Forma de explicar distinta en cada tema | Java: 106 estructuras distintas en 134 temas · Spring Boot: 116 en 137 (JavaScript y Flutter: 5 · Microservicios: 1) |
| Temas sin ninguna imagen | 1.556 de 1.608 |
| Temas sin imagen ni diagrama | 665 (Java 96/120, Control 73/88, Spring Boot 76/123) |
| Temas sin nivel ni duración declarados | 1.298 |
| Código verificado en una máquina real | solo Microservicios (37 laboratorios) e iOS |
| Nube local | Floci explicado a trozos en 35 módulos de Cloud y 7 de DevOps; 10 archivos mezclan LocalStack; el README no lo menciona |

La medición es por scripts sobre títulos y contenido. La lectura tema por tema es la Fase 1.

## Decisiones

- **Un concepto, un curso dueño.** Cada concepto se enseña una sola vez, en el curso que le corresponde.
  Los demás cursos lo *usan* y enlazan a esa lección; no lo vuelven a explicar desde cero.
- **Nada se pierde.** Antes de fusionar, mover o retirar un tema, queda escrito su destino. Lo retirado
  va a la rama `archivo` con su referencia, no se borra.
- **Una sola plantilla de tema** para toda la academia (la ficha de Microservicios, adaptada): ubicación y
  prerrequisitos → objetivo → analogía → diagrama con texto alternativo → explicación en tres niveles →
  código completo con versiones → salida esperada real → mini-laboratorio → verificación → error común →
  pregunta con respuesta modelo → anti-patrón.
- **Linealidad obligatoria.** Cada tema declara nivel y minutos; dentro de un capítulo el nivel no baja;
  ningún tema usa algo que no se haya enseñado antes en la ruta (o enlaza al prerrequisito).
- **Floci es la nube local de la academia** (AWS `floci/floci`, Azure `floci-az`, GCP `floci-gcp`, con el
  `docker-compose.yml` de la raíz). LocalStack solo aparece como comparación. Todo laboratorio de nube
  dice qué emula Floci y qué cambia en la nube real.
- **Exactitud.** Ningún dato técnico sin ejecutarlo o verificarlo en fuente primaria (CLAUDE.md). El
  código de cada curso se ejecuta en el Mac del dueño antes de darlo por terminado.
- **El dueño aprueba** el mapa de conceptos (Fase 1) y cada temario (Fase 2) antes de reescribir temas.
- Se trabaja **un curso a la vez**, en `main`, sin ramas paralelas largas (la causa del choque del
  2026-11-20 entre dos líneas de trabajo sobre los mismos cursos).

## Plan por fases

### Fase 0 · Cerrar lo abierto
Fusionar sin pérdida el trabajo local del dueño (etiquetas y orden) con la rama de Microservicios y dejar
todo en `main`. Reescribir el README con el arranque real de la app y de Floci.

### Fase 1 · Mapa único de conceptos (documento, no toca lecciones)
`docs/reestructuracion/mapa-de-conceptos.md`: los 1.608 temas clasificados por concepto, con su curso
dueño propuesto y la acción de cada tema: **queda**, **se fusiona con X**, **se mueve a Y**, **se
convierte en enlace**, **se retira (archivo)**. Incluye la lista de duplicados reales (leídos, no solo por
título) y los temas que están en el curso equivocado.

Reparto inicial propuesto de conceptos transversales:

| Concepto | Curso dueño | Los demás cursos |
|---|---|---|
| Docker y contenedores | Docker (nuevo, specs/017) | usan una imagen ya hecha y enlazan |
| Kubernetes, Helm, GitOps | Kubernetes (nuevo, specs/017) | despliegan con manifiestos dados |
| CI/CD, IaC, observabilidad de plataforma | DevOps | cada stack añade solo lo propio (p. ej. Micrometer en Spring) |
| Nube (AWS/Azure/GCP) y Floci | Cloud | usan Floci con la lección de entrada |
| HTTP, Git, terminal, SQL básico, pruebas básicas | Fundamentos | no lo repiten |
| Seguridad web (OWASP, JWT, OAuth) | Fundamentos (concepto) + cada stack (implementación) | — |
| Sistemas distribuidos, mensajería, sagas | Microservicios | — |

### Fase 2 · Temario objetivo por curso (documento, lo aprueba el dueño)
Por curso: comparar con una referencia externa (documentación oficial y rutas públicas tipo roadmap.sh),
listar los **temas que faltan**, fijar el **orden lineal** (prerrequisitos, nivel, minutos) y el número de
módulos. Sale un `docs/temarios/<curso>.md` por curso con el antes y el después.

### Fase 3 · Plantilla y validador únicos
Generalizar `scripts/validate_fichas.py` a todos los cursos: secciones obligatorias, diagrama con texto
alternativo, código con versiones, salida esperada, práctica, nivel y minutos, y título único en toda la
academia. Actualizar `docs/METODOLOGIA-DE-APRENDIZAJE.md` con la plantilla.

### Fase 4 · Reescritura curso por curso
Orden por dependencia: Fundamentos → Java → Spring Boot → JavaScript → Node → React → Angular → Docker →
Kubernetes → DevOps → Cloud (con Floci) → Android → Kotlin Multiplatform → iOS → Flutter → Control.
Microservicios ya cumple la plantilla: solo se le quitan las repeticiones que el mapa señale.
En cada curso: aplicar mapa y temario, pasar cada tema a la plantilla, añadir el diagrama o la imagen,
ejecutar el código, dejar un laboratorio por módulo y la redirección de progreso
(`web/src/app/module-renumbering.ts`) para que nadie pierda lo que ya leyó.

### Fase 5 · Floci: una entrada, bien explicada
Una lección de entrada «Nube en local con Floci» (qué es, cómo se levanta, cómo se comprueba, qué no
emula, cómo pasar a la nube real), el README con ese arranque, y todos los laboratorios de nube
verificados contra Floci en el Mac del dueño. Se hace junto con el curso de Cloud.

### Fase 6 · Verificación y cierre por curso
Cada curso se cierra cuando pasa el validador, sus laboratorios pasan en el Mac y la revisión de la página
real en el navegador (skill `academy-flow-inspector`) no deja hallazgos.

## Criterios

- **Z0** `pendiente` — `main` contiene Microservicios completo y el trabajo local del dueño, sin temas
  perdidos, y el README explica cómo arrancar la app y Floci.
  Verificación: `grep -qi "floci" README.md && ./scripts/validate.sh`
- **Z1** `pendiente` — Existe el mapa de conceptos con la acción de cada tema y el dueño lo aprobó.
  Verificación: `grep -q "Aprobado por el dueño" docs/reestructuracion/mapa-de-conceptos.md`
- **Z2** `pendiente` — Cada curso tiene su temario objetivo (temas faltantes y orden lineal) aprobado.
  Verificación: `python3 scripts/validate_temarios_aprobados.py`
- **Z3** `pendiente` — Un validador único comprueba la plantilla en todos los cursos y los títulos no se
  repiten en toda la academia.
  Verificación: `python3 scripts/validate_plantilla_unica.py`
- **Z4** `pendiente` — Todos los temas declaran nivel y minutos, y ningún capítulo incumple el orden.
  Verificación: `python3 scripts/audit_topic_order.py --check --require-labels`
- **Z5** `pendiente` — Todo tema tiene diagrama o imagen con texto alternativo.
  Verificación: `python3 scripts/validate_plantilla_unica.py --visuales`
- **Z6** `pendiente` — Floci tiene una lección de entrada, LocalStack no aparece fuera de comparaciones y
  los laboratorios de nube pasan contra Floci en el Mac.
  Verificación: `python3 scripts/validate_floci.py`
- **Z7** `pendiente` — Los laboratorios de todos los cursos pasan en el Mac del dueño.
  Verificación: `! grep -rh "	FAIL	" verificacion/*/resultados.tsv`
