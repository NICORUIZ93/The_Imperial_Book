# Plan total de mejora de profundidad

Fecha: 2026-10-30. Alcance: contenido, medición y estructura de la academia.
Este documento reemplaza la estrategia de crecer por lotes y marcadores.

## Diagnóstico

La percepción de que los temas son básicos y superficiales tiene fundamento. El
inventario actual contiene 1.100 temas, pero volumen, rutas y marcadores no
demuestran profundidad ni preparación profesional. La auditoría disponible
detecta señales de sustancia en 273 temas, bloques editoriales repetidos en 172,
andamiaje genérico en 99 y secciones heredadas en 184 de 245 módulos. Son
señales estáticas que requieren revisión; no equivalen a 273 errores confirmados.
Consulta [la revisión integral](./full-review.md) para cobertura y límites.

Los datos siguientes describen la deuda medida:

| Síntoma | Dato |
|---|---|
| Estructura editorial repetida | 172 temas con bloques repetidos |
| Cola editorial | 1 tema con señal de cola tras el cierre |
| Apéndices heredados | 184/245 módulos con «Errores comunes y soluciones», ruta de proyecto o laboratorio pegados al final |
| Sin proyecto acumulativo | 12/245 módulos con ruta de proyecto progresivo |
| Andamiaje genérico | 99 temas con frases plantilla que prometen independencia sin demostrarla |
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
  con fallo deliberado y práctica verificable):
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
- [x] Ruta por tema y copia de seguridad del progreso. El textarea de
  evidencia por tema se retiró el 2026-10-30: pedía un artefacto sin comprobar
  que el tema lo explicara.
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

## Tercer lote piloto (2026-10-30)

Se reescribieron diez temas en cuatro módulos: `foundations` 6/1–4, `devops`
13/1–3, `flutter` 11/1–2 y `kotlin-multiplatform` 8/1. La selección agrupó los
temas que combinaban andamiaje genérico y bloques repetidos, para corregir la
repetición dentro de su propio módulo. El resultado medido es 283 → 273 temas
con señales (172 con bloques repetidos y 99 con andamiaje genérico); siete pasos
sigue en 1100/1100 y criterios editoriales en 1094/1100 con la misma deuda de 6.
La deuda aceptada en `lesson-substance-baseline.json` bajó de 283 a 273 entradas
sin añadir ninguna.

| Tema | Artefacto y salida observada |
|---|---|
| foundations 6/1 | `amenazas.json` + `riesgos.py`: `amenazas: 3`, `mayor riesgo: T-01 (15)`; una amenaza sin dueño produce `fallo: amenazas sin propietario: R-01` y código 1 |
| foundations 6/2 | `acceso.py` con PBKDF2, salt por usuario y revocación de sesión: `salts distintos: True`, `c-891 confirmó RF-4471`, `denegado: c-999 no está asignado a RF-4471` |
| foundations 6/3 | `comando.json` + `firma.py` con HMAC-SHA256 sobre JSON canónico: `íntegro: True`, `manipulado: False`; la variante con hash simple imprime `manipulado con hash simple: True` |
| foundations 6/4 | `nota.txt` + `validar.py` con `html.escape` y SQL parametrizado frente a concatenación: `html escapado: dejado con el portero`, `filas parametrizadas: 0`, `filas concatenadas: 2` |
| devops 13/1 | `.github/workflows/pipeline.yml` + `verificar_pipeline.py`: `jobs: test -> build -> scan -> deploy`, `gate de seguridad: bloqueante (exit-code 1, severity CRITICAL)`; con `exit-code: "0"` falla con «el escaneo no bloquea ante una vulnerabilidad CRITICAL» |
| devops 13/2 | `eventos.jsonl` + `trazabilidad.py`: `etapas: commit -> build -> scan -> deploy`, `cadena completa: True`; etiquetar con `:latest` produce «la imagen no es trazable por digest» |
| devops 13/3 | `checklist.md` + `evaluar_checklist.py`: `preguntas respondidas: 3`, `respuestas ancladas a una decisión: True`; una respuesta genérica devuelve tres motivos y código 1 |
| flutter 11/1 | `flutter create flujo_release` y `flutter build appbundle --release` reales; `verificar_release.py`: `aab: ... (44248888 bytes)`, `version: 1.0.0+1`, estructura y `Release.xcconfig` presentes. El build terminó con código 1 en el paso de strip porque `flutter doctor` reporta `cmdline-tools` ausente: el `.aab` se generó y verificó, pero no se declara build limpio |
| flutter 11/2 | `generar_png.py` + `flutter_launcher_icons.yaml` + `verificar_iconos.py`: `fuente: assets/icon_1024.png (1024x1024)`; la fuente de 48×48 produce «la fuente debe ser al menos 1024x1024». `flutter_launcher_icons` no se ejecutó |
| kotlin-multiplatform 8/1 | Fixture `Shared.framework` + `verificar_framework.py`: `paquete: FMWK`, `modulemap: umbrella header "Shared.h"`, `clase pública: SharedTarea`; una cabecera fuera del modulemap produce «cabeceras no exportadas: Interna.h» |

Límites explícitos: Gradle no está instalado, así que el tema de KMP valida la
estructura que un build real debe producir, no un framework compilado. No se
generó ningún `.ipa`: la firma y el provisioning de iOS no se configuraron. La
generación de íconos se validó por su precondición (fuente y configuración), no
ejecutando el generador. El `.aab` de Flutter existe y se abrió con `zipfile`,
pero el toolchain Android quedó incompleto (`cmdline-tools`), por lo que el
build no terminó limpio. El lote sustituyó dos diagramas ASCII por Mermaid en
`devops` y añadió uno en `kotlin-multiplatform`: los visuales ASCII pendientes
pasan de 213 a 211 y Mermaid de 583 a 586 temas.

## Módulo de profundidad de muestra (2026-10-30)

Los lotes anteriores redujeron señales sin cambiar la unidad de trabajo: un tema
por página. Para probar el estándar que el plan persigue se reescribió completo
`foundations/modulo-6.md` (Seguridad, privacidad y modelado de amenazas) con una
unidad mayor: 5 temas, 15.300 palabras frente a 4.768, entre 2.704 y 3.654
palabras por tema, 3–4 demostraciones ejecutadas por tema y un proyecto
acumulativo, «auditoría de seguridad de RutaFlow», cuyos entregables se suman de
un tema al siguiente. No se añadieron temas: se profundizó el mismo inventario.

| Tema | Palabras | Artefactos y salida observada |
|---|---:|---|
| 1. Activos, amenazas y límites | 3.092 | `riesgos.py` + `amenazas.json`: 8 amenazas STRIDE, `prioridad: S-02 (residual 12)`; el control de dominio rechaza `probabilidad 7` y una amenaza sin propietario |
| 2. Identidad y autorización | 2.704 | `acceso.py` (PBKDF2, bloqueo, caducidad) imprime `otro conductor: c-999 confirmó RF-4471`; `eventos.py` detecta `corte en 2` y `corte en 3` y muestra que un atacante con la clave puede recalcular la cadena |
| 3. Criptografía, TLS y secretos | 2.971 | `firma.py`: acepta el comando válido y rechaza PIN alterado, replay por nonce, timestamp fuera de ventana y `kid` desconocido; `tls_demo.py` contra una CA local: `localhost` pasa, `127.0.0.1` falla por nombre y sin la CA falla por emisor; `escanear.py` encuentra 2 secretos en el historial tras borrarlos del árbol |
| 4. Validación, web y privacidad | 2.817 | `validar.py`, `inyeccion.py` (0 filas parametrizadas frente a 2 concatenadas y una fila fabricada por `UNION`), `salida.py` (HTML, atributo, JavaScript y URL) y `privacidad.py` (`tel [TEL] email [EMAIL] direccion [DIRECCION]`, 3→2 eventos retenidos) |
| 5. Ingeniería social y phishing | 3.654 | `analizar.py` detecta userinfo, punycode, texto distinto del destino y urgencia; `urls.py` clasifica por dominio registrable; `autenticacion.py` distingue `dmarc=pass` de `spf=pass` con `dmarc=fail`; `campana.py` calcula tasas sobre enviados (`clic=29.2%`, `reporte=29.2%`, `credencial=12.5%`) |

Límites declarados: los ejemplos se ejecutaron con el Python 3 del sistema y
SQLite en memoria; TLS se probó contra una CA local creada con OpenSSL. Los
scripts se extrajeron del Markdown final y se volvieron a ejecutar, incluidos
`tls_demo.py` y `escanear.py` con los pasos de OpenSSL y Git que el propio tema
indica. **No** se envió correo real ni se consultó DNS: las cabeceras
`Authentication-Results` son sintéticas y sirven para interpretar la lógica, no
para certificar un remitente.
No se ejecutó revisión de navegador ni revisión pedagógica humana sobre el
módulo. Las auditorías estructurales miden marcadores, no profundidad: el
módulo pasa siete pasos y criterios editoriales, y sus cinco temas no tienen
señales de sustancia, pero eso no demuestra que enseñe mejor.

El baseline de sustancia permanece en 273 temas porque los cinco temas del
módulo ya estaban limpios; no se añadió deuda nueva. La muestra sirve como
referencia de estándar para la Fase 3, no como resultado del repositorio
completo: los otros 1.095 temas conservan su profundidad actual.

Verificación ejecutada para este cambio:

| Comprobación | Resultado |
|---|---|
| `./scripts/validate.sh` | Código 0: 21 pruebas Python y todos los validadores de contenido, fuentes, fences, índices y grafos |
| Metodología de siete pasos | 1100/1100 completos; los 5 temas de la muestra pasan los 16 marcadores |
| Criterios editoriales | 1094/1100 practicables sin cambios; los 5 temas de la muestra pasan los 9 criterios |
| Sustancia | 273/1100 sin cambios; `--strict` en 0 y ningún tema del módulo con señales |
| Visuales | 586 temas con Mermaid, 18 enlaces Archify y 211 con ASCII pendiente |
| Build Angular | Correcto; aviso de bundle inicial 625,49 kB frente al presupuesto de 600 kB (no se amplió) |
| Pruebas unitarias Angular | 19 correctas |
| E2E Chrome | 48 correctas (24 escenarios en escritorio y móvil) |

Los temas se contrastaron con los auditores, no con una revisión pedagógica
humana: el módulo sigue pendiente de lectura completa y de revisión de
navegador tema por tema.

## Verificación de la entrega (2026-10-30)

| Comprobación | Resultado |
|---|---|
| `./scripts/validate.sh` | Código 0: 21 pruebas Python, pedagogía, currículo, fuentes, fences, índices y grafos |
| Build Angular | Correcto; aviso de bundle inicial 625,49 kB frente al presupuesto de 600 kB (no se amplió) |
| Pruebas unitarias Angular | 16 correctas |
| E2E Chrome | 48 correctas (24 escenarios en escritorio y móvil) |
| Metodología de siete pasos | 1100/1100 completos |
| Criterios editoriales | 1094/1100 practicables; deuda de 6 |
| Sustancia | 273 temas con señales (30 menos que antes del primer piloto); `--strict` no registra defectos nuevos |
| Módulos nuevos | 4 (`devops` 17 y 18, `java` 20, `spring-boot` 22) con 14 temas; el repositorio queda con 163 laboratorios |

Los módulos nuevos se escribieron con el estándar que el plan exige: siete pasos,
fallo deliberado diagnosticado, fuente oficial, límites de uso, diagrama y
mención al proyecto integrador. Sus ejemplos Java se compilaron y ejecutaron; los
validadores Node de C4 y ADR se probaron con el resultado documentado.

### Lo que sigue pendiente

1. Los temas con repetición o cola heredada: se reducen por tandas y el
   baseline solo puede bajar; la muestra de `foundations/modulo-6.md` fija el
   estándar de profundidad que la Fase 3 debe replicar.
2. Reescribir el siguiente módulo con el estándar de la muestra y medir el
   costo real en horas antes de comprometer un track completo.
3. La ruta piloto completa (Fundamentos + Java) con checkpoints por módulo.
4. `cloud` fuera de `course-data.ts` y una sola fuente de verdad por track.
5. Ruta por tema y progreso por módulo en la aplicación.
6. Validación con personas reales: revisión pedagógica humana y de navegador
   sobre la muestra antes de generalizarla.

## Retiro de la evidencia por tema (2026-10-30)

Se eliminó el mecanismo «Evidencia del tema» en todo el repositorio por decisión
del mantenedor: pedía un artefacto al final de cada tema sin que el contenido
garantizara que ese artefacto fuera verificable, y el estado «verificado» no
demostraba aprendizaje.

| Superficie | Cambio |
|---|---|
| Lector Angular | Se retiraron el bloque de textarea, el botón de registro, el estado `topic-verified` y su estilo. |
| Progreso | Se retiraron `verifiedTopics`, `topicEvidence` y `verifyTopic`; la copia de seguridad v1 ya no acepta ni produce esos campos. |
| Contenido | 385 párrafos «Evidencia de aprendizaje», 389 coletillas «**Evidencia:**», 54 frases repetidas, 1.041 encabezados de Paso 7 y 23 celdas de tabla. Se conservaron las transiciones y los usos técnicos de «evidencia» (respuesta a incidentes, informes, ADR). |
| Auditoría | `learningEvidence` salió de `audit_seven_step_methodology.py`; el reporte mide 16 marcadores. |
| Temas vacíos | Se quitaron 4 encabezados `### Fallo Deliberado:` sin cuerpo en `cloud` y se corrigió la jerarquía del proyecto final de `cloud/modulo-9.md`. |

Verificación ejecutada:

| Comprobación | Resultado |
|---|---|
| `./scripts/validate.sh` | Código 0: 21 pruebas Python y todos los validadores |
| Metodología de siete pasos | 1100/1100 completos con 16 marcadores |
| Criterios editoriales | 1094/1100 practicables; deuda de 6, igual que antes del retiro |
| Sustancia | 273 temas con señales, sin defectos nuevos; `--strict` en 0 |
| Build Angular | Correcto; se mantiene el aviso de presupuesto del bundle inicial |
| Pruebas unitarias Angular | 16 correctas; cobertura global por encima de los umbrales de CI |

El retiro no convierte los temas en completos ni sustituye la revisión
pedagógica humana: solo elimina una exigencia que el contenido no respaldaba.
