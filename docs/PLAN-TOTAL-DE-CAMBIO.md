# Plan total de mejora de profundidad

Fecha: 2026-10-30. Alcance: contenido, medición y estructura de la academia.
Este documento reemplaza la estrategia de crecer por lotes y marcadores.

## Diagnóstico

La percepción de que los temas son básicos y superficiales tiene fundamento. El
inventario actual contiene 1.100 temas, pero volumen, rutas y marcadores no
demuestran profundidad ni preparación profesional. La auditoría disponible
detecta señales de sustancia en 283 temas, bloques editoriales repetidos en 182,
andamiaje genérico en 109 y secciones heredadas en 184 de 245 módulos. Son
señales estáticas que requieren revisión; no equivalen a 283 errores confirmados.
Consulta [la revisión integral](./full-review.md) para cobertura y límites.

Los datos siguientes describen la deuda medida:

| Síntoma | Dato |
|---|---|
| Estructura editorial repetida | 182 temas con bloques repetidos |
| Cola editorial | 1 tema con señal de cola tras el cierre |
| Apéndices heredados | 184/245 módulos con «Errores comunes y soluciones», ruta de proyecto o laboratorio pegados al final |
| Sin proyecto acumulativo | 12/245 módulos con ruta de proyecto progresivo |
| Andamiaje genérico | 109 temas con frases plantilla que prometen independencia sin demostrarla |
| Dos fuentes de verdad | `cloud` vive en `course-data.ts`; los otros 13 tracks en `tracks/*.ts` |

## Objetivo de salida — todavía no acreditado

- **Cero**: carpeta vacía, sin cuenta cloud pagada, en Windows, macOS y Linux.
- **Profesional**: entrega un artefacto que corre, explica sus decisiones,
  diagnostica fallos y otra persona puede reproducirlo.
- **Niveles**: `Base` (reproduce) → `Aplicación` (adapta) → `Integración`
  (compone) → `Especialización` (decide, mide y defiende).
- **Regla dura**: un tema solo se declara completo si tiene un checkpoint
  ejecutable que falla sin el trabajo del alumno y pasa con él.

Este contrato expresa la meta de rediseño, no el estado actual de los 1.100
temas. La auditoría de marcadores y la etiqueta «Experto» no son evidencia de que
un estudiante alcance dominio profesional. Para afirmar ese resultado se
requieren proyectos acumulativos ejecutados, criterios de salida observables,
revisión técnica y validación humana; esas capas siguen incompletas.

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
- [x] Limpieza con guarda: 154 recortes en tres pasadas sin perder criterios
  ni romper fences (`scripts/clean_legacy_tails.py`).
- [ ] Resto de apéndices y secciones duplicadas (medido en `lesson-substance.md`): requiere
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

- [x] Ruta por tema: `/curso/:trackId/:moduleId/tema/:n` enfoca un solo tema y
  enlaza de vuelta al capítulo. Sustituye a `/tema/:slug` conservando los
  fragmentos históricos.
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

La deuda editorial medida no se elimina en una sesión. El plan
la convierte en una deuda **medida y decreciente** en lugar de una promesa
implícita de calidad. Reescribir 1.100 temas a mano requiere 2.000–4.000 horas:
por eso el núcleo se reduce y el resto se declara biblioteca de referencia.

## Piloto de reducción de sustancia (2026-10-30)

Se reescribieron los 10 temas con más señales del corte anterior. El resultado
medido es 303 → 293 temas con señales, sin cambios en 1094/1100 practicables ni
en 1100/1100 de siete pasos. La deuda aceptada en
`lesson-substance-baseline.json` bajó de 476 a 293 entradas y no se añadió
ninguna.

Estándar aplicado a cada tema:

1. Cada sección editorial aparece una sola vez. Si había dos «¿Por qué es
   importante?», se conserva la que aporta evidencia y se borra la otra.
2. El contenido posterior al Paso 7 se elimina o se integra en los pasos que lo
   necesitan; el cierre no se alarga para compensar.
3. El ejemplo arranca en una carpeta vacía con archivos completos. Se
   reemplazaron `bash ejemplo.sh`, `python3 ejemplo.py` y otras llamadas a
   artefactos inexistentes por comandos reproducibles.
4. El fallo deliberado se observa en la salida del ejemplo y se corrige.
5. Cuando fue posible, el ejemplo se ejecutó: SQLite (`SCAN` → `SEARCH`), Python
   (rollback y `historial` vacío), Dart (`token=null cache=false session=false
   sync=false`) y Java 26 con `--enable-preview` (cancelación de la subtarea
   hermana). Las tareas de ABI se contrastaron con la documentación oficial
   (`updateKotlinAbi` y `checkKotlinAbi`, no `apiCheck`).

Temas corregidos: `foundations` 4/3, 4/4 y 7/4; `devops` 14/1 y 14/4; `flutter`
13/2; `java` 5/5; `kotlin-multiplatform` 12/1, 12/2 y 12/3. El ejemplo de KMP
quedó verificado por lectura y documentación primaria, no ejecutado en este
entorno (Gradle no está instalado); no se declara como probado.

## Segundo lote piloto (2026-10-30)

Se reescribieron diez temas en cinco módulos: `foundations` 7/1–3, 8/1 y 8/3,
9/2–3; `node` 13/4; y `devops` 14/2–3. El criterio de selección fue agrupar
temas con señales de repetición y andamiaje genérico para corregirlos en
contexto, no por cifra aislada. El resultado medido es 293 → 283 temas con
señales; siete pasos sigue en 1100/1100 y criterios editoriales en 1094/1100
con la misma deuda de 6. La deuda aceptada en `lesson-substance-baseline.json`
bajó de 293 a 283 entradas sin añadir ninguna.

Cada tema recibió un ejemplo reproducible en `ejemplo/`, ejecutado en este
entorno salvo las excepciones declaradas:

| Tema | Artefacto y salida observada |
|---|---|
| foundations 7/1 | `criterios.md` + `verificar_criterios.py`: `criterios: 3 / verificables: 3`; un criterio vago produce «adjetivo sin medida numérica» y código 1 |
| foundations 7/2 | `escenario.txt` + `escenario.py` con SQLite en memoria: `campos del escenario: 6/6`, `filas sin restricción: 2`, `filas con UNIQUE(command_id): 1` |
| foundations 7/3 | `cp examples/rutaflow/node/confirm-delivery.ts ejemplo/` + `verificar_puerto.py`: `métodos esperados: True`, `referencias de infraestructura: 0` |
| foundations 8/1 | `lento.py` sobre `domain.py`: proceso visto con `ps` (PID 75497), terminación 137 con `SIGKILL` frente a 143 con `SIGTERM` |
| foundations 8/3 | `python3 -m http.server 8765`, `lsof -nP -iTCP:8765 -sTCP:LISTEN` y `curl --fail`: `ok / sano`, línea LISTEN y código 7 tras `kill -9` |
| foundations 9/2 | `relacion.py` sobre `domain.py`: `pares: 3`, `simétrica: False`, `antisimétrica: True`; el Paso 5 invierte la última a `False` |
| foundations 9/3 | `grafo.py` sobre `domain.py`: `nodos: 4`, `tiene ciclo: False`; con la arista de vuelta en el Paso 5, `True` |
| node 13/4 | `firma.mjs`: `firma válida: true`, `cuerpo alterado: false`, `timestamp alterado: false`; el fallo deliberado sustituye `timingSafeEqual` por comparación de strings |
| devops 14/2 | `alerta.yaml` + `verificar_alerta.py`: `alertas: 1`, `labels: service, severity`, `annotations: runbook, summary`; `request_id` como label produce «labels de alta cardinalidad» y código 1 |
| devops 14/3 | `politica.yaml` + `verificar_politica.py`: la política con subject de `rutaflow/api` pasa; sin subject falla con «sin subject que limite el repositorio firmante» |

Límites explícitos: `syft` y `cosign` no están instalados en este entorno y no
se ejecutaron; el ejemplo de devops 14/3 valida la estructura de la política,
no una firma real. La sonda de procesos y la de red se ejecutaron en macOS, por
lo que `lsof` es el comando principal y `ss` queda como alternativa Linux. Las
tres sustituiciones de diagramas ASCII por Mermaid redujeron los visuales ASCII
pendientes de 216 a 213 (Mermaid pasó de 581 a 583 temas).

## Verificación de esta entrega (2026-10-30)

| Comprobación | Resultado |
|---|---|
| `./scripts/validate.sh` | Código 0: 21 pruebas Python, pedagogía, currículo, fuentes, fences, índices y grafos |
| Build Angular | Correcto; aviso de bundle inicial 625,49 kB frente al presupuesto de 600 kB (no se amplió) |
| Pruebas unitarias Angular | 19 correctas (incluye evidencia por tema) |
| E2E Chrome | 48 correctas (24 escenarios en escritorio y móvil) |
| Metodología de siete pasos | 1100/1100 completos |
| Criterios editoriales | 1094/1100 practicables; deuda de 6 |
| Sustancia | 283 temas con señales (20 menos que antes del primer piloto); `--strict` no registra defectos nuevos |
| Módulos nuevos | 4 (`devops` 17 y 18, `java` 20, `spring-boot` 22) con 14 temas; el repositorio queda con 163 laboratorios |

Los módulos nuevos se escribieron con el estándar que el plan exige: siete pasos,
fallo deliberado diagnosticado, fuente oficial, límites de uso, diagrama y
mención al proyecto integrador. Sus ejemplos Java se compilaron y ejecutaron; los
validadores Node de C4 y ADR se probaron con el resultado documentado.

### Lo que sigue pendiente

1. Los temas con repetición o cola heredada: se reducen por tandas y el
   baseline solo puede bajar.
2. La ruta piloto completa (Fundamentos + Java) con checkpoints por módulo.
3. `cloud` fuera de `course-data.ts` y una sola fuente de verdad por track.
4. Ruta por tema y progreso por evidencia en la aplicación.
5. Validación con personas reales.
