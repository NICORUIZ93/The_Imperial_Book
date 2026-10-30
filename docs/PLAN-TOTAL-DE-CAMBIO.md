# Plan total de cambio

Fecha: 2026-10-30. Alcance: contenido, medición y estructura de la academia.
Este documento reemplaza la estrategia de crecer por lotes y marcadores.

## Diagnóstico

La aplicación no falla por falta de contenido: tiene 1.084 temas y 1,1 millones
de palabras. Falla porque el sistema que produce ese contenido mide presencia de
marcadores, no aprendizaje. Los datos medidos sobre el repositorio:

| Síntoma | Dato |
|---|---|
| Uniformidad artificial | 1098/1098 temas con bloque `bash`, «resultado esperado» y URL; 97,8% con «fallo deliberado» |
| Repetición interna | 240 temas con una sección editorial duplicada; 362 repiten «¿Por qué es importante?» |
| Cola editorial | 382 temas con más de 500 palabras después del cierre |
| Apéndices heredados | 184/245 módulos con «Errores comunes y soluciones», ruta de proyecto o laboratorio pegados al final |
| Profundidad plana | «Experto»: 972 palabras/tema; «Fundamentos»: 1.029 |
| Sin evaluación | 33 ejercicios verificables en 1.098 temas; `completedExercises` no se escribe desde la interfaz |
| Sin proyecto acumulativo | 12/245 módulos con ruta de proyecto progresivo |
| Andamiaje genérico | 128 temas con frases plantilla que prometen independencia sin demostrarla |
| Dos fuentes de verdad | `cloud` vive en `course-data.ts`; los otros 13 tracks en `tracks/*.ts` |

## Definición operativa de «de cero a profesional»

- **Cero**: carpeta vacía, sin cuenta cloud pagada, en Windows, macOS y Linux.
- **Profesional**: entrega un artefacto que corre, explica sus decisiones,
  diagnostica fallos y otra persona puede reproducirlo.
- **Niveles**: `Base` (reproduce) → `Aplicación` (adapta) → `Integración`
  (compone) → `Especialización` (decide, mide y defiende).
- **Regla dura**: un tema solo se declara completo si tiene un checkpoint
  ejecutable que falla sin el trabajo del alumno y pasa con él.

## Fases

### Fase 0 — Instrumento y verdad (implementada)

- `scripts/audit_lesson_substance.py`: mide repetición, cola tras el cierre,
  andamiaje genérico, párrafos repetidos, ausencia de fuente y brevedad.
- `docs/lesson-substance.json` / `.md`: línea base honesta.
- `docs/lesson-substance-baseline.json`: deuda histórica aceptada. El modo
  `--strict` impide que un tema nuevo nazca con defectos y que uno existente
  empeore. Está conectado a `./scripts/validate.sh`.
- Pruebas: `scripts/tests/test_lesson_substance.py`.

### Fase 1 — Cirugía estructural (iniciada)

- [x] Repo graph independiente del nombre de la carpeta (`Root` ya no rompe la
  validación entre CI y una máquina local).
- [x] Artefactos `.class` fuera de Git y `build/` ignorado.
- [x] Documento de continuación actualizado a los números reales.
- [x] Limpieza con guarda: 132 recortes en dos pasadas sin perder criterios
  ni romper fences (`scripts/clean_legacy_tails.py`).
- [ ] Resto de apéndices y secciones duplicadas (**497 temas**): requiere
  revisión editorial, no un script ciego.
- [ ] Unificar `cloud` en `tracks/cloud.track.ts`.
- [ ] Sustituir «Experto» por los cuatro niveles operativos y retirar la
  etiqueta donde no haya evidencia.

### Fase 2 — Núcleo profesional (en curso)

- Nuevos módulos escritos con el estándar nuevo (sin apéndices, sin repetición,
  con fallo deliberado y evidencia):
  - `devops/modulo-17`: diseño de sistemas distribuidos (borde, datos, CAP,
    capacidad).
  - `devops/modulo-18`: servidor propio (VPS, TLS, systemd, restic).
  - `spring-boot/modulo-22`: arquitectura (hexagonal, C4, ADR).
  - `java/modulo-20`: interfaces funcionales y composición (Predicate,
    Function, Consumer, Supplier y Streams).
- [ ] Ruta piloto completa (Fundamentos + Java) reconstruida con checkpoints
  ejecutables por módulo.
- [ ] Reducir el núcleo a ~112 módulos y degradar el resto a biblioteca de
  referencia.

### Fase 3 — Réplica por ruta (pendiente)

- Dos rutas por ciclo, empezando por cloud y spring-boot.
- Cada módulo: proyecto incremental + `check.sh` + criterio de salida.

### Fase 4 — Aplicación y evaluación (pendiente)

- [ ] Ruta por tema `/tema/:slug` (los fragmentos `#tema-…` ya dan enlace por tema).
- [x] Progreso por evidencia: textarea por tema, huella guardada y copia de
  seguridad. «Leído» ya no es la única señal.
- [ ] Checkpoints que el alumno ejecuta y cuya salida se registra.
- [x] «Marcar capítulo como leído» reemplaza a «completado».

### Fase 5 — Validación humana (pendiente)

- Probar entrada, ruta y módulo con tres personas que no conozcan el repositorio.
- Registrar por separado: estructura, ejecución, navegador y revisión
  pedagógica.

## Temas del PDF de referencia y dónde viven

El PDF es una recopilación de publicaciones técnicas. Sus temas se mapearon así:

| Tema del PDF | Destino |
|---|---|
| Clean Architecture, DDD táctico, hexagonal, puertos/adaptadores | `spring-boot/modulo-15` T8 y `spring-boot/modulo-22` (nuevo) |
| C4 y ADR | `spring-boot/modulo-22` (nuevo) |
| Sagas, compensación, orquestación/coreografía | `rutaflow/modulo-5`, `spring-boot/modulo-21`, `rutaflow-material/sagas` |
| Kubernetes: rolling, recreate, blue/green, canary, A/B, shadow | `devops/modulo-5` y `devops/modulo-7` |
| Kafka y RabbitMQ | `spring-boot/modulo-21`, `devops/modulo-5` |
| Spring Boot en 9 capas (API, datos, seguridad, integración, observabilidad) | `spring-boot/modulos 2-21` |
| Spring AI, agentes, RAG, vector store | `spring-boot/modulo-20` |
| Java funcional: Predicate, Function, Consumer, Supplier | `java/modulo-20` (nuevo) |
| C# records, igualdad por valor | `foundations/modulo-7` |
| Git: tres árboles, merge, rebase, recuperación | `foundations/modulo-11` y `devops` |
| Diseño de sistemas: LB, CDN, caché, colas, CAP, idempotencia, líder | `devops/modulo-17` (nuevo) |
| Servidor propio: VPS, Let's Encrypt, Cloudflare, nginx | `devops/modulo-18` (nuevo) |
| Tokenización de pagos | `rutaflow/modulo-6` (ya existía) |
| OSRM y rutas | `rutaflow/modulo-5` |
| Angular Native / Expo / virtual lists | `angular/modulo-16` (ya existía) |
| App Flutter + backend Spring en tiempo real | `flutter/modulo-14`, `spring-boot/modulo-21` |
| SoC, memoria, térmica y arranque móvil | `android/modulo-13` (ya existía) |
| Versiones del ecosistema Spring 2026 | `spring-boot/modulo-22` y notas de versión |

## Reglas de gobernanza

1. **No se añade, se reescribe.** Ningún cambio agrega texto al final de un tema.
2. **Un defecto nuevo bloquea CI.** `--strict` compara contra el baseline.
3. **La cobertura declarada debe ser la medida.** Un «completo» sin checkpoint
   ejecutable no se publica.
4. **Cada cifra se mide o se cita.** Nada de latencias o capacidades inventadas.
5. **La revisión humana no se sustituye por un detector.** Los reportes lo dicen
   y el producto debe decirlo también.

## Criterios de aceptación del plan

- 0 párrafos duplicados dentro de un tema.
- 100% de módulos núcleo con checkpoint ejecutable y proyecto incremental.
- Cada ruta con un proyecto clonable que corre, verificado en CI.
- Profundidad creciente real: «Especialización» con decisiones de arquitectura y
  mediciones.
- Cobertura declarada = cobertura medida.
- Validación con personas, no solo con auditorías.

## Estado y riesgo

La deuda histórica (497 temas con defectos) no se elimina en una sesión. El plan
la convierte en una deuda **medida y decreciente** en lugar de una promesa
implícita de calidad. Reescribir 1.098 temas a mano requiere 2.000–4.000 horas:
por eso el núcleo se reduce y el resto se declara biblioteca de referencia.

## Verificación de esta entrega (2026-10-30)

| Comprobación | Resultado |
|---|---|
| `./scripts/validate.sh` | Código 0: 21 pruebas Python, pedagogía, currículo, fuentes, fences, índices y grafos |
| Build Angular | Correcto; aviso de bundle inicial 625,24 kB frente al presupuesto de 600 kB (no se amplió) |
| Pruebas unitarias Angular | 17 correctas (incluye evidencia por tema) |
| Metodología de siete pasos | 1098/1098 completos |
| Criterios editoriales | 1092/1098 practicables; deuda de 6 |
| Sustancia | 497 temas con defectos históricos; 102 menos que al inicio; **0 defectos nuevos** |
| Módulos nuevos | 4 (`devops` 17 y 18, `java` 20, `spring-boot` 22) con 14 temas; el repositorio queda con 163 laboratorios |

Los módulos nuevos se escribieron con el estándar que el plan exige: siete pasos,
fallo deliberado diagnosticado, fuente oficial, límites de uso, diagrama y
mención al proyecto integrador. Sus ejemplos Java se compilaron y ejecutaron; los
validadores Node de C4 y ADR se probaron con el resultado documentado.

### Lo que sigue pendiente

1. Los 497 temas con repetición o cola heredada: se reducen por tandas y el
   baseline solo puede bajar.
2. La ruta piloto completa (Fundamentos + Java) con checkpoints por módulo.
3. `cloud` fuera de `course-data.ts` y una sola fuente de verdad por track.
4. Ruta por tema y progreso por evidencia en la aplicación.
5. Validación con personas reales.
