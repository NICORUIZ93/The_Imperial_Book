# Auditoría editorial y pedagógica — The_Imperial_Book

**Fecha:** 2026-11-18 · **Rol:** auditor externo (no autor del contenido) · **Rúbrica:** `docs/auditoria/PROMPT-AUDITORIA.md` (prompt del dueño, partes 1 y 2).
**Estado auditado:** árbol de trabajo de `main` hacia las 17:25 del 2026-11-18. Durante la auditoría el repositorio cambió en paralelo: `scripts/validate.sh` pasó de 3 a 5 comprobaciones, aparecieron `specs/013-…`, `scripts/audit_plantilla.py`, `docs/auditoria/` y `examples/` (archivos en *staging*, sin commit). Los seis módulos auditados **no** cambiaron respecto de `HEAD` (verificado con `git status` y `md5sum`). Las evidencias de `validate.sh` corresponden a la versión de 5 comprobaciones.

**Muestra auditada (lectura completa, línea por línea):**

| Nivel | Módulo | Track |
|---|---|---|
| Básico (módulo 0 de entorno) | `web/public/content/foundations/modulo-0.md` (461 líneas) | `web/src/app/tracks/foundations.track.ts` |
| Básico | `web/public/content/javascript/modulo-1.md` (577) | `javascript.track.ts` |
| Intermedio | `web/public/content/java/modulo-16.md` (814) | `java.track.ts` |
| Intermedio | `web/public/content/angular/modulo-2.md` (814) | `angular.track.ts` |
| Avanzado | `web/public/content/spring-boot/modulo-15.md` (965) | `spring-boot.track.ts` |
| Avanzado | `web/public/content/devops/modulo-20.md` (642) | `devops.track.ts` |

Además: `docs/METODOLOGIA-DE-APRENDIZAJE.md`, `docs/ESTANDAR-DE-CODIGO.md`, `scripts/validate.sh` y los scripts que invoca, `course-data.ts`, `track-guides.ts`, `technical-glossary.ts`, `learning-activities.ts`, `.github/workflows/ci.yml` y los laboratorios de `examples/` que citan los módulos.

**Ejecución real (C1/E1), en `/tmp/audit`:**

| Qué | Resultado |
|---|---|
| JavaScript M1: 6 programas (Node 22.23.5) + 3 fallos deliberados | 6/6 producen exactamente la salida esperada; los 3 fallos dan el error anunciado |
| Fundamentos M0: `entorno.py`, fallos de `getpid(1)`, archivo inexistente, opción inexistente, comilla sin cerrar (Python 3.13.18) | Funcionan; los mensajes reales no aparecen en la lección |
| Angular M2: comando literal `npx -y @angular/cli@22 new . …` (CLI 22.2.8) | **Falla**: `Data path "/name" must match pattern …` |
| Angular M2: `npx vitest run src/app/estado-pedido.spec.ts` (comando literal del Tema 1) | **Falla**: `ReferenceError: describe is not defined` |
| Angular M2: specs de los Temas 1–4 con `ng test` | 8 tests pasan |
| Angular M2: `conductor-panel.spec.ts` (Tema 6) | **No compila**: `TS2532: Object is possibly 'undefined'` en `conductor.value().id` |
| Angular M2: afirmación «`set()` siempre notifica» con primitivos | **Falsa**: `s.set(1)` sobre un signal que ya vale `1` no recalcula el `computed` (test propio, pasa) |
| DevOps M20: Temas 1, 3 y 4 con `node --test` | Pasan (2+2+1), pero hay que inventar nombres de archivo que la lección no da |
| Spring Boot M15: material Python y `Main.java` de referencia | Pasan |
| Labs Maven (Java M16, Spring M15) | **No ejecutables aquí**: Maven Central bloqueado (`CONNECT tunnel failed, response 403`) y el JDK local es 21 frente a `<java.version>25` del `pom.xml` |
| `./scripts/validate.sh` | `validate.sh: ok` (exit 0) con todos los defectos de este informe presentes |
| `python3 scripts/audit_plantilla.py` (script del propio repo, medición por marcadores) | **98 de 1432 temas** tienen los 8 elementos de la plantilla de la Parte 2 |

---

## 1. Veredicto ejecutivo

**No.** El libro no cumple hoy el objetivo de que «cualquier persona aprenda fácil». Hay buen material suelto: los ejemplos de JavaScript se ejecutan tal cual, y el módulo 0 de Fundamentos tiene fallos deliberados y analogías con límites. Pero ninguno de los seis módulos auditados tiene **una sola solución de ejercicio**. Hay tres plantillas distintas. Los prerrequisitos apuntan a módulos posteriores (Angular M2 → M6 y M11; DevOps M20 → instalación de Floci en M22). Hay comandos literales que fallan (`ng new .`, `npx vitest run`) y archivos «reales» que no existen en el laboratorio. `validate.sh` aprueba todo esto porque no inspecciona el contenido. Con 1432 temas sin revisar y sin un flujo de revisión documentado, publicar el conjunto expondría a principiantes a bloqueos que no pueden diagnosticar solos.

---

## 2. Tabla de puntuaciones (0 = ausente, 1 = deficiente, 2 = aceptable, 3 = ejemplar)

| Crit. | Nota | Evidencia citada (archivo:línea + frase) |
|---|---|---|
| **A1** Ejemplo antes que teoría | **1** | `javascript/modulo-1.md:22-30`: cuatro párrafos de teoría («JavaScript ofrece tres sintaxis distintas…», «La function expression…», «Las arrow functions…», «Elegir entre las tres formas…») antes del primer código ejecutable en la línea 52. El mismo patrón aparece en `angular/modulo-2.md:24-28` (teoría) frente a 63 (demo) y en `devops/modulo-20.md:17-21` frente a 65. Excepción positiva: `java/modulo-16.md:24-30` empieza con «Hazlo tú», aunque sin explicar antes qué es una entidad. |
| **A2** Analogías correctas | **1** | Buenas, con límite declarado: `foundations/modulo-0.md:98` «el programa es una partitura guardada… La analogía no describe memoria virtual»; `:182` receta con límite. Engañosas: `javascript/modulo-1.md:288` presenta el `switch` como un empleado «revisando mentalmente cada caso uno por uno» frente a «casilleros», lo que sugiere un coste lineal que el motor no está obligado a tener. `angular/modulo-2.md:444` compara Zone.js con un sistema que «revisa cada habitación completa de un edificio» y `:519` afirma que el test de dos `effect()` demuestra «la precisión real que Zone.js, por diseño, no podía ofrecer»; ese test pasaría igual en una app con Zone.js, porque mide el seguimiento de dependencias de signals, no la detección de cambios. `devops/modulo-20.md:13`: «el cliente que llama para preguntar por su pedido recibe una nueva orden de cocina» no explica la diferencia entre comando y evento. `java/modulo-16.md`: **0 analogías** en 8 temas (`audit_plantilla.py`: falta `analogia` 8/8). |
| **A3** Errores comunes reales | **1** | Hay secciones «Errores comunes» en Fundamentos, JS, Angular y DevOps, casi siempre como lista genérica sin mensaje literal: `foundations/modulo-0.md:223` dice «El error indica que no puede abrir ese archivo», pero el mensaje real es `can't open file '…': [Errno 2] No such file or directory`. Excepción buena: `javascript/modulo-1.md:543` cita el mensaje exacto `TypeError: Cannot destructure property 'kilos' of 'undefined' as it is undefined.` (verificado). `java/modulo-16.md` y `spring-boot/modulo-15.md` no tienen ninguna sección «Errores comunes». Java M16 no nombra ninguna excepción real: `grep LazyInitializationException\|OptimisticLock…` = 0, aunque el Subtema 2.1 provoca precisamente una `LazyInitializationException`. |
| **A4** Ejercicios progresivos + solución con ideas | **0** | Hay ejercicios (Paso 5 «Práctica guiada», Paso 6 «Práctica independiente», «Practica» en Java), pero **0 bloques `<details>` y 0 soluciones** en los seis módulos (`grep -c '<details'` = 0 en cada uno). En todo el repositorio, solo 26 de 291 módulos contienen `<details>`. La metodología lo exige (`METODOLOGIA…md:91` «Las soluciones permanecen plegadas»). |
| **A5** Proyecto integrador pequeño (30–60 min) | **1** | Los «proyectos integradores» son módulos de 6–8 h (`javascript.track.ts` M12 «6 h», `java.track.ts` M13 «6 h», `devops.track.ts` M13 «8 h»). Los temas solo añaden párrafos «Transferencia al proyecto integrador…» sin código ni verificación (`javascript/modulo-1.md:89`). Fundamentos no tiene proyecto propio en `learning-activities.ts`, y su módulo 0 alterna «gestor de tareas» (`:28`) y «RutaFlow» (`:74`, `:405`). No hay un proyecto de 30–60 min por parte. |
| **A6** Progresión coherente | **0** | Prerrequisitos que apuntan hacia delante: `angular/modulo-2.md:291` «Conocimiento previo: Módulo 6 de este track (RxJS)» y `:428` «Módulo 11 de este track (SSR y zoneless)», en un módulo marcado «Fundamentos» en `angular.track.ts`. `devops/modulo-20.md:289` usa `floci start` y `eval $(floci env)`, pero la instalación de Floci está en `devops/modulo-22.md:50-52`. `javascript/modulo-1.md:10` pide elegir sintaxis «según hoisting y `this`», que se enseñan en `javascript/modulo-2.md` (Tema 2 «Hoisting y Temporal Dead Zone», Tema 4 «this según el modo de invocación»). `:362` exige «configuración `type: module`», que es tema del Módulo 7. `foundations/modulo-0.md:66` abre con un tema de **90 min** y 11 subtemas (CPU, PID, memoria virtual, planificación…) que usa `import` y f-strings **antes** del «Hola, mundo» del Tema 2. `java.track.ts`: el M16 («Integración») va después del M15 «Java Master» («Experto») y usa `JpaRepository` y Spring Boot 4.1.2, que el track de Java no enseña. |
| **B1** Misma plantilla | **0** | Conviven tres plantillas. (a) «Paso 1…Paso 7» en Fundamentos, JS, Angular y DevOps. (b) «Subtema N · Contexto / Hazlo tú / Entiende / Cierra» en Java M16 y Spring M15. (c) Encabezados libres en `foundations/modulo-0.md:170-229` (Tema 2: «El primer resultado que puedes repetir», «Crea y ejecuta `saludo.py`»…). Hay secciones ad hoc: «Fragmento real» y «Practica» (Java), «Trazabilidad de la auditoría original» (`spring-boot/modulo-15.md:614`), «Construcción guiada del capítulo» (JS), «Laboratorio práctico» (Angular). Con la plantilla de la Parte 2 cumplen 98 de 1432 temas (6,8 %). Detalle por módulo en el §2.1. |
| **B2** Texto sin código / código sin explicación | **1** | Solo texto: `java/modulo-16.md:255` «Crea **LineaPedido.java** con asociaciones ManyToOne…», `:657` «Crea **CrearPedido.java**…», `:679` «Crea **InventarioRepository.java**…»: piden código sin mostrarlo. `spring-boot/modulo-15.md:222` «Lee el README del laboratorio y la guía oficial». Solo código: `angular/modulo-2.md:591` es una línea suelta (`cantidad = linkedSignal(...)`) sin clase, imports ni test. Párrafos de más de 150 palabras sin código: `javascript/modulo-1.md:22,24,26,107,109`. |
| **B3** Objetivos y resumen | **1** | Hay objetivos con «Al finalizar podrás…» en los módulos de 7 pasos. Faltan en los 8 temas de Java M16 y en los Temas 4–8 de Spring M15 (`audit_plantilla.py`). **Ningún** módulo tiene una sección «Resumen»: `grep -i resumen` solo encuentra una función llamada `resumen` en `javascript/modulo-1.md:546`. El «Paso 7 · Cierre» del Tema 6 de JS está **vacío** (`javascript/modulo-1.md:551-553`). |
| **B4** Módulo 0 de entorno | **2** | Existe y cubre la instalación (`foundations/modulo-0.md:11` VS Code + Python), la comprobación por sistema operativo (`:16-20`), el «Hola, mundo» (`:192-215`) y errores (`:24`, `:231`). Le faltan: capturas de pantalla (0 imágenes `![`); ejecución en Windows y Linux, que el propio texto admite (`:26` «no se ejecutaron en esos sistemas»); y evidencia (`:168` «Registro de ejecución: pendiente»). Además cita un PDF que el lector no tiene (`:415` «Ampliación de la página 50 del PDF», `:420` «La captura del PDF mezcla atajos…»). |
| **C1** Código completo y ejecutable | **1** | Bien: los 6 programas de JS M1 dan la salida documentada. Mal: (1) `angular/modulo-2.md:58` `ng new .` falla con Angular CLI 22. (2) `:110` `npx vitest run …` falla con `describe is not defined`. (3) `:750` no compila (`TS2532`). (4) Los Temas 5 y 6 de Angular son fragmentos más `ng new ejemplo` (`:584`, `:675`). (5) `java/modulo-16.md` cita archivos que **no existen** en el laboratorio: `PerfilEntrega.java` (`:298`, presentado como «Fragmento real»), `db/migration/V2__agregar_estado_pedido.sql` (`:798`) y `PedidoPostgresTest`; el `pom.xml` no incluye Flyway, Testcontainers ni Querydsl. (6) El «Fragmento real» de `Pedido.java` (`:94-106`, `@ManyToOne` sin `fetch` ni `nullable`) no coincide con el archivo, que tiene `@ManyToOne(fetch = FetchType.LAZY, optional = false)`; `:706` muestra `private Long version` y el archivo tiene `private long version`. (7) `devops/modulo-20.md:254` menciona `scripts/crear-tablas.mjs` y `scripts/registrar.mjs` pero **no los da**; `:308` `node src/relay.mjs` no hace nada, porque el archivo solo exporta una función. (8) `:452` importa `../src/almacen.js`, un nombre que el texto nunca da. |
| **C2** Respeta `ESTANDAR-DE-CODIGO.md` | **1** | `ESTANDAR…:22` «Evita… números sin unidad» frente a `javascript/modulo-1.md:54` `pesoKg * 7.4`, `:234` `total * 1.1` y `:508` `5000 : 9000) + kilos * 1200 + (express ? 3000 : 0)`. `ESTANDAR…:10` «Dependencias visibles: …red… no aparecen como magia global» frente a `devops/modulo-20.md:220-224`, un cliente DynamoDB global con endpoint y credenciales fijos, mientras que `relay` sí recibe sus dependencias (incoherencia en el mismo tema). `ESTANDAR…:11` «Errores explícitos» frente a `spring-boot/modulo-15.md:930`, `.findFirst().orElse(null)`. `ESTANDAR…:20` «Sustituye comentarios que narran la sintaxis» frente a `foundations/modulo-0.md:193` `# Muestra un mensaje en la terminal.` (aceptable en nivel 0, pero el estándar no prevé esa excepción). |
| **C3** APIs/versiones obsoletas | **1** | `foundations/modulo-0.md:26` declara como verificado «`Python 3.9.6` en macOS», una rama sin soporte desde octubre de 2025. `java/modulo-16.md:194,593` enlaza la documentación de Hibernate **6.6**, pero el laboratorio usa Spring Boot 4.1.2, cuya línea 4.0 adopta [Hibernate 7.2](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Release-Notes). El Tema 4 de `angular/modulo-2.md` («Hacia zoneless…», `:438-442`) presenta zoneless como meta, pero el proyecto que el propio módulo genera con CLI 22 ya no incluye `zone.js` (verificado en `package.json` y `app.config.ts`). `--standalone` es redundante en CLI 22. Las versiones fijadas en Java M16 (`postgres:17.11-alpine3.24`, `postgresql:42.7.14`, Testcontainers 2.0.5) no se pudieron verificar offline. |
| **C4** Ejercicios con solución | **0** | Igual que A4: 0 soluciones en los 6 módulos. Los ejercicios «Completa el código» de Angular (`:131`, `:270`, `:407`, `:537`, `:623`, `:771`) no tienen respuesta. |
| **D1** Segunda persona consistente | **1** | Predomina el «tú» imperativo («Crea», «Ejecuta»), pero el Tema 5 de Angular cambia al voseo: `angular/modulo-2.md:608` «reemplazá», `:613` «Documentá», `:616` «necesitás», `:630` «usás», `:703` «reemplazá… Simulá… cambiá». En el mismo módulo, `:614` vuelve a «Escribe de memoria». `javascript/modulo-0.md:411` usa «acá». La teoría de JS está en impersonal: `javascript/modulo-1.md:22` «se puede invocar», `:28` «es la práctica más común». |
| **D2** Jerga sin explicar o sin glosario | **1** | `technical-glossary.ts` no tiene entradas para `javascript`, `foundations`, `node` ni `java`-JPA, y tiene 8 términos compartidos. Términos sin definir en el texto: «hoisting», «Temporal Dead Zone», «receptor de `this`», «ESM», «ciudadanos de primera clase» (`javascript/modulo-1.md:16,24,194,362`); «lado propietario», `mappedBy`, «fetch plan», «proyección DTO», «Q-types», «BOM» (`java/modulo-16.md:16,39,184,10,478,759`); «memoiza», «contexto de inyección», «microtask» (`angular/modulo-2.md:12,400,530`); «Ryuk rootless», «forks paralelos», «bytecode» (`spring-boot/modulo-15.md:142,231,293`); «backoff», «relay», «consistencia fuerte» (`devops/modulo-20.md:156,158,197`). |
| **D3** Asume conocimiento no enseñado | **1** | `javascript/modulo-1.md:450` «la sintaxis que verás en cada componente de React, cada handler de Express» (no enseñados). `:432` pide «estado privado mediante closure», y closures es el Módulo 2. `angular/modulo-2.md:26` «memoización manual estudiada en el Módulo 10 del track de JavaScript». `devops/modulo-20.md:7` «Conocimiento previo: … Node.js», pero el track DevOps no enseña Node; `:179` «AWS SDK v3». `java/modulo-16.md:180` `findAllWithClienteByOrderByReferenciaAsc` (derivación de consultas de Spring Data, no enseñada en el track Java). `foundations/modulo-0.md:142` `echo $?` / `$LASTEXITCODE` en el primer tema de un principiante absoluto. |
| **E1** Qué detecta `validate.sh` | **1** | Detecta: que cada curso tenga al menos un `modulo-N.md` (líneas 7-21), que `topic-index.json` y el catálogo estén al día (24, 27), que existan las *carpetas* de laboratorio citadas (30) y el formato de las specs (33). No detecta: archivos inexistentes *dentro* de un laboratorio (`validate_lesson_labs.py:6` «Los archivos dentro de un laboratorio pueden no existir»), por eso pasan `PerfilEntrega.java` y la migración `V2`; que los fragmentos «reales» coincidan con el laboratorio; secciones obligatorias; soluciones; enlaces internos; jerga; prerrequisitos hacia delante; duración del tema (20–45 min); cuadro de paridad entre track y título del `.md` (Java M16: track «JPA, Hibernate, consultas y persistencia en producción» frente a H1 «JPA, Hibernate y FetchType.LAZY vs EAGER»). `examples/README.md` describe carpetas `python/`, `node/`, `go/` y `rust/` que no existen. La CI (`ci.yml`) no compila ni prueba ningún laboratorio de `examples/`. |
| **E2** ¿Ejecuta código / plantilla / jerga? | **0** | Ninguna de las tres cosas. `audit_plantilla.py` existe, pero **no** está en `validate.sh`, mide por palabras clave y su propio docstring admite «Es una medición de presencia por marcadores, no de calidad». Además da falsos positivos: marca `ejercicios_con_solucion` como cumplido en `javascript/modulo-1.md` Tema 6 y `devops/modulo-20.md` Temas 2 y 4 solo porque aparece la palabra «solución», aunque no hay solución. |
| **E3** Flujo autor → revisor pedagógico → técnico → publicación | **0** | No está documentado. `CLAUDE.md` solo dice «El dueño aprueba los temarios antes de escribir temas». `grep -ri revisor docs CLAUDE.md README.md specs` solo encuentra el propio prompt de auditoría. La metodología no menciona revisión. |
| **F1** Riesgo con 1432 temas sin revisión | **0** | `README.md`: «1432 temas, pendientes de revisión». Solo 98 cumplen la plantilla por marcadores. En la muestra (6 de 291 módulos, ~2 %) hay 3 comandos literales que fallan, al menos 5 archivos citados que no existen y 0 soluciones. Extrapolando, el defecto es sistémico, no puntual. El tema de Fundamentos que reconoce `«Registro de ejecución: pendiente»` muestra que ni el módulo de entrada tiene evidencia de ejecución. |
| **F2** Ruta priorizada (core) | **1** | Hay un punto de entrada: `track-guides.ts` dice para foundations «Empieza aquí» y da prerrequisitos para cada curso. Pero los 16 cursos se publican a la vez en `course-data.ts:872-887`, sin bandera core/avanzado/borrador, e incluyen «Control 1 — Sistemas de control» (ingeniería de control, no programación) y «Microservicios» con 2 módulos. |
| **F3** Glosario y apéndices | **1** | `technical-glossary.ts`: unos 55 términos, ninguno de JS ni de Fundamentos, y con errores («computed… Valor derivado y **memorizado**»). No hay tablas de sintaxis ni de atajos globales. El único apéndice es `angular.track.ts` M12, «Apéndice: qué cambió entre versiones mayores». |

### 2.1 Secciones presentes y ausentes por módulo (B1)

Fuente: lectura más `audit_plantilla.py`. ✓ = presente en todos los temas · ~ = en algunos · ✗ = ausente.

| Módulo | Objetivos | Motivación | Analogía | Código + resultado | Análisis paso a paso | Errores comunes | Resumen | Ejercicios + solución |
|---|---|---|---|---|---|---|---|---|
| foundations/0 | ~ (Tema 2 sin «Paso 1») | ✓ | ✓ | ✓ | ~ (Tema 1 «Explicación causal»; resto no) | ~ (sin mensajes literales) | ✗ (solo «Cierre») | ✗ |
| javascript/1 | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ lista; ~ mensajes | ✗ (T6 «Cierre» vacío) | ✗ |
| java/16 | ✗ (0/8) | ~ (frase de una línea) | ✗ (0/8) | ~ (referencias a tests, archivos que faltan) | ✗ | ✗ | ✗ | ✗ |
| angular/2 | ✓ | ✓ | ✓ | ~ (T5–T6 fragmentos) | ✗ | ✓ lista | ✗ | ✗ |
| spring-boot/15 | ~ (T1–T3) | ~ | ✗ (0/8 marcadas) | ✓ (vía laboratorio, no ejecutado aquí) | ✗ | ✗ | ✗ | ✗ |
| devops/20 | ✓ | ✓ | ✓ | ~ (T2 incompleto) | ✗ | ✓ lista | ✗ | ✗ |

---

## 3. Defectos bloqueantes (impiden publicar), por gravedad

1. **Ningún ejercicio tiene solución.** *Archivos:* los 6 módulos (0 `<details>`); en todo el repo, 26 de 291 módulos tienen alguno. *Evidencia:* `METODOLOGIA…:67` «La solución se consulta después de un intento verificable», que hoy es imposible. *Corrección:* añadir en cada «Práctica guiada/independiente» un `<details><summary>Solución comentada</summary>` con (a) idea de resolución en 2–4 frases, (b) código completo, (c) salida esperada y (d) el error típico. Hacerlo obligatorio en el validador (ver paso 2 del plan).

2. **Comandos y archivos que no funcionan o no existen.** *Archivos y corrección:*
   - `angular/modulo-2.md:58`: sustituir `ng new .` por `ng new demo-signals` y `cd demo-signals`.
   - `:110`: sustituir `npx vitest run …` por `npx ng test --watch=false --include=src/app/estado-pedido.spec.ts`.
   - `:750`: usar `conductor.value()?.id` o comprobar `hasValue()` antes.
   - `java/modulo-16.md:298,798` y Subtemas 8.2–8.3: crear en `examples/java-jpa-lab` `PerfilEntrega.java`, `db/migration/V1/V2`, `PedidoPostgresTest` y las dependencias de Flyway y Testcontainers, o reescribir el texto como «crea tú» sin la etiqueta «Fragmento real».
   - `:94-106,706`: copiar los fragmentos del archivo real, generados por script.
   - `devops/modulo-20.md:254,307-308`: incluir el código completo de `crear-tablas.mjs`, `registrar.mjs` y un `main` en `relay.mjs` que lea `SQS_QUEUE_URL`.
   - `:401,452`: nombrar `src/almacen.js` y `test/consumidor.test.js`.

3. **Progresión rota: prerrequisitos hacia delante.** *Archivos y corrección:*
   - `angular/modulo-2.md:291,428`: mover el Tema 3 detrás de RxJS (M6) y el Tema 4 a M11, o enseñar en M2 el mínimo de Observable necesario.
   - `devops/modulo-20.md:289`: mover la instalación de Floci (`modulo-22.md:50-52`) antes de M19, o añadir aquí el procedimiento de instalación.
   - `javascript/modulo-1.md:10,24-26,362,432`: reordenar para que hoisting/TDZ, `this` y closures (M2) precedan a M1 Tema 1 y Tema 5, o quitar esos objetivos de M1.
   - `foundations/modulo-0.md:66-168`: el Tema 1 (90 min, 11 subtemas) debe ir **después** de «Hola, mundo» y dividirse en 2–3 temas de ≤45 min (`METODOLOGIA…:9` «Si introduce más de tres conceptos nuevos, se separa»).
   - `java.track.ts` M16: moverlo al track Spring Boot (ya existe `spring-boot` M16 «JPA de Spring Boot…», un duplicado) o reescribirlo con JPA puro sin Spring Data.

4. **Afirmaciones técnicas falsas o contradictorias** (enseñan una idea equivocada).
   - `angular/modulo-2.md:281`: «los primitivos siempre se comparan por valor, `set()` siempre notifica correctamente». Es falso: `set()` con el mismo valor **no** notifica (verificado). *Corrección:* «`set()` con un valor igual según `Object.is` no notifica».
   - `angular/modulo-2.md:486,519`: el test no compara con Zone.js. *Corrección:* reformular como «demuestra el seguimiento de dependencias de signals» y quitar la comparación.
   - `java/modulo-16.md:237` («la anotación Java no reemplaza la restricción del esquema») frente a `:319` («`unique = true` … evita el segundo perfil a nivel de base de datos»). *Corrección:* aclarar que `unique = true` solo genera la restricción si Hibernate genera el DDL; con Flyway (Tema 8) debe ir en la migración.
   - `devops/modulo-20.md:197` «El relay lee el outbox con consistencia fuerte», frente a `:262-267`, un `ScanCommand` sin `ConsistentRead`. Además, `Limit` se aplica **antes** de `FilterExpression`, así que el relay puede devolver 0 pendientes aunque existan. *Corrección:* usar `ConsistentRead: true` con un GSI de `estado` y `QueryCommand`, y paginar.
   - `devops/modulo-20.md:322` pide comprobar «`intentos=1`» tras un fallo, pero el código solo incrementa `intentos` al publicar con éxito (`:278`).
   - `devops/modulo-20.md:593` «una prueba con tres pasos», pero la prueba tiene dos (`:603-606`).

5. **No existe una plantilla única ni se valida.** *Evidencia:* tres plantillas (§2.1); 98 de 1432 temas cumplen; `javascript/modulo-1.md:551-553`, un Cierre vacío que el validador no detecta. *Corrección:* fijar una plantilla única en `METODOLOGIA…` (encabezados exactos: Objetivos, Por qué importa, Concepto y analogía, Código completo, Salida esperada, Análisis línea a línea, Errores comunes, Resumen, Ejercicios, Soluciones) e incorporar a `validate.sh` un validador **estricto por encabezado** (no por palabra clave) que falle con un cierre o una sección vacíos.

6. **No hay proceso de revisión ni evidencia de ejecución.** *Evidencia:* §E3; `foundations/modulo-0.md:168` «Registro de ejecución: pendiente»; la CI no ejecuta `examples/`. *Corrección:* crear `docs/REVISION.md` con el flujo autor → revisor pedagógico → revisor técnico → publicación, una checklist en la plantilla de PR y un campo `revisado: {pedagogico, tecnico, fecha}` por módulo, que la UI muestre y el validador exija para cursos publicados.

7. **Se publica todo a la vez, sin ruta core.** *Evidencia:* `course-data.ts:872-887`, 16 cursos sin estado. *Corrección:* añadir `estado: 'core' | 'avanzado' | 'borrador'` y ocultar o marcar en la UI lo que no sea core hasta que pase los pasos 1–6.

---

## 4. Defectos mayores (degradan el aprendizaje)

| # | Defecto | Evidencia | Corrección |
|---|---|---|---|
| M1 | El módulo 0 cita un PDF inexistente | `foundations/modulo-0.md:415` «Ampliación de la página 50 del PDF»; `:420` «La captura del PDF…» | Quitar la referencia y titular el tema por su contenido |
| M2 | El módulo 0 no tiene capturas ni ejecución en Windows/Linux | `:26` «no se ejecutaron en esos sistemas»; 0 imágenes | Capturas reales por SO (usar `scripts/render_terminal_capture.py`) y prueba en los tres SO |
| M3 | Python de referencia sin soporte | `:26` «`Python 3.9.6`» | Verificar con la versión estable vigente y declararla |
| M4 | Voseo mezclado con tuteo | `angular/modulo-2.md:608,613,616,630,703`; `javascript/modulo-0.md:411` | Normalizar a «tú» y añadir la regla a la guía de estilo |
| M5 | Jerga sin definir y glosario sin JS ni Fundamentos | §D2; `technical-glossary.ts` sin `javascript` ni `foundations` | Glosario por curso, generado desde marcas en el texto y validado |
| M6 | Analogías engañosas | `javascript/modulo-1.md:288`; `angular/modulo-2.md:444`; `devops/modulo-20.md:13` | Reescribirlas con su límite explícito, como `foundations/modulo-0.md:98` |
| M7 | Varios «cierres de módulo» contradictorios | `angular/modulo-2.md:414` «El siguiente y último tema de este módulo» (quedan 3 temas), `:544` «Esto cierra el módulo… continúa con el módulo 3», `:778` «Esto cierra el módulo…» | Un único cierre al final |
| M8 | El título del track no coincide con el H1 del `.md` | `java.track.ts` M16 frente a `java/modulo-16.md:1`; `angular.track.ts` M2 «Signals: reactividad, linkedSignal y resource()» frente a `angular/modulo-2.md:1` | Validar la igualdad en `validate.sh` |
| M9 | Duraciones irreales frente a la metodología | `foundations/modulo-0.md:66` «90 min» (máx. 45); `javascript.track.ts` M1 «2 h» para 6 temas de más de 85 líneas | Medir con lectores reales y validar el rango 20–45 min por tema |
| M10 | Texto de relleno generado | `spring-boot/modulo-15.md`: 12 repeticiones de «Para comprobar «…», consulta: … repite la comprobación: `./mvnw -q test`» (`:41,73,94…`) | Quitarlo y dejar un comando concreto por subtema |
| M11 | Metadatos editoriales visibles para el lector | `spring-boot/modulo-15.md:614-620` «Trazabilidad de la auditoría original»; `:623` «Aplicación del material de referencia» | Sacarlos del contenido y llevarlos a las specs |
| M12 | Instrucciones de carpeta incoherentes | `javascript/modulo-1.md:127` crea `ejemplo-parametros`, pero `:152` dice «Ejecuta desde `academia-javascript/`» | Corregir la ruta |
| M13 | Ejercicio de Java contradictorio | `java/modulo-16.md:460` «omite el predicado si ese filtro no se solicitó» frente a `:521` «tratar una cadena vacía como "sin filtro"… en vez de omitir el predicado solo cuando el valor es `null`»; `BusquedaPedido.java` no tiene filtros opcionales | Reescribir con un enunciado único y una prueba |
| M14 | Inconsistencias de Testcontainers | `spring-boot/modulo-15.md:156` `postgres:16-alpine`, clase no genérica (`org.testcontainers.postgresql`), frente a `java/modulo-16.md:759` `PostgreSQLContainer<>("postgres:17.11-alpine3.24")`, genérica y sin import | Una versión y una clase, iguales al laboratorio |
| M15 | Estándar de código incumplido en ejemplos | §C2 (números mágicos, cliente global, `orElse(null)`) | Revisión con la checklist de `ESTANDAR…:43-49` |
| M16 | El texto de la metodología está desfasado | `METODOLOGIA…:71` «hoy solo 11 de 252 módulos la tienen» frente a 291 módulos en `README.md` | Actualizar o generar la cifra |
| M17 | `examples/README.md` describe carpetas que no existen | «`python/demo.py`», «`node/demo.mjs`», tabla Node/Python/Java/Go/Rust | Reescribirlo según el contenido real |
| M18 | El orden de secciones cambia dentro del mismo módulo | `javascript/modulo-1.md:468-475`: «¿Por qué es importante?», «Errores comunes» y «Transferencia» van dentro del Paso 3, **antes** de la demo | Aplicar la plantilla única |

## 5. Defectos menores (estilo y forma)

- `java/modulo-16.md:120,217,321,519,619,721`: «Practica» sin tilde (debe ser «Práctica»).
- `java/modulo-16.md:89,194,291,395,492,593`: «Fuente: https://…» como URL cruda; en el resto del libro se usan enlaces con texto.
- Sin tildes en diagramas y comentarios: `angular/modulo-2.md:37` «leido», `:449` «historico», «peticion»; `:90` «invocacion».
- `foundations/modulo-0.md:420` «el programa `saludo.py` del primer tema»: se crea en el Tema 2.
- `foundations/modulo-0.md:11` «Git se usará más adelante; no hace falta», pero `foundations.track.ts` M0 lista `'Git'` entre las herramientas.
- `spring-boot/modulo-15.md`: identificadores en inglés (`Delivery`, `OrderSaga`, `OrderCancelled`) frente a identificadores en español en los demás módulos (`Pedido`, `calcularTarifa`).
- `spring-boot/modulo-15.md:244-246`: bloque `./mvnw -q -Dtest=FirstRepositoryTest test` huérfano entre la sección de fuentes y el Tema 3.
- `technical-glossary.ts`: «memorizado» en lugar de «memoizado».
- `devops/modulo-20.md:401` dice que el almacén ofrece «`reservar(clave)` y `liberar(clave)`», pero el código usa también `completar`.
- `angular/modulo-2.md:138,277`: «Fuentes oficiales:» seguido de un único enlace.

---

## 6. Plan de corrección priorizado (5 pasos)

| Paso | Qué | Entregable verificable | Esfuerzo estimado |
|---|---|---|---|
| 1 | **Congelar y priorizar.** Añadir `estado` a cada curso en `course-data.ts` y ocultar o marcar lo no core. Ruta core propuesta: Fundamentos M0–M3 → JavaScript M0–M4 → un curso de backend (Node o Java básico). | Spec 014; la UI muestra solo el core como «publicado» | 1–2 días |
| 2 | **Plantilla única y validador estricto.** Encabezados exactos en `METODOLOGIA…`; integrar en `validate.sh` un `validate_template.py` que falle por: sección ausente o vacía, ejercicio sin `<details>` de solución, título del track distinto del H1, duración fuera de 20–45 min, prerrequisito que cite un módulo posterior, término sin glosario. | `validate.sh` en rojo sobre el estado actual y en verde sobre las lecciones modelo | 4–6 días |
| 3 | **Ejecución automática.** Marcar los bloques con archivo destino (por ejemplo ```` ```js file=src/funciones.js ````) y un job de CI por lenguaje que los materialice y ejecute (Node, Python, `ng test`); job Maven con caché para `examples/`; generar los «Fragmento real» desde el archivo. | CI en verde con 0 bloques sin ejecutar en cursos core | 1,5–2 semanas |
| 4 | **10 lecciones modelo y flujo de revisión.** Reescribir con la plantilla: Fundamentos M0 T2–T5, Fundamentos M1 (2 temas), JS M1 T1–T4. Crear `docs/REVISION.md` (autor → revisor pedagógico → revisor técnico → publicación) con checklist de PR y metadatos `revisado`. | 10 lecciones aprobadas por dos revisores, con registro | 2–3 semanas |
| 5 | **Completar la ruta core y probarla con un principiante.** Soluciones, glosario por curso, capturas reales por SO y un proyecto de 30–60 min por parte; sesión observada con una persona sin base que haga el primer proyecto sin ayuda. | Informe de la sesión y defectos cerrados | 4–6 semanas para el core. El resto (≈1300 temas) a 1–2 h por tema ≈ 1300–2600 h, solo después de cerrar el core |

---

## 7. Qué no se pudo auditar y por qué

| Elemento | Motivo | Riesgo |
|---|---|---|
| Ejecución de los laboratorios Maven de Java M16 y Spring M15 (`java-jpa-lab`, `spring-reactor-rutaflow`, `testcontainers-singleton-rutaflow`, `archunit-hexagonal-rutaflow`, `spring-resilience-rutaflow`, `spring-saga*-rutaflow`, `spring-eventsourcing-rutaflow`, `spring-clean-architecture-rutaflow`) | Maven Central bloqueado (`CONNECT tunnel failed, response 403`); JDK local 21 frente a `<java.version>25` | **Bloqueante:** no hay evidencia de que estos 8 laboratorios compilen. Los resultados esperados de M15 (p. ej. `[2, 2, 2, 2, 2, 2]` en `:124`) quedan sin verificar |
| Integración de DevOps M20 Tema 2 contra Floci (DynamoDB/SQS) | La CLI `floci` no está instalada, sin red, y faltan `crear-tablas.mjs` y `registrar.mjs` | **Bloqueante:** el tema no es reproducible ni con red |
| Versiones fijadas (`postgres:17.11-alpine3.24`, `postgresql 42.7.14`, Testcontainers 2.0.5, Resilience4j 2.4.0, ArchUnit 1.5.1, Spring Boot 4.1.2) | Sin acceso a Maven Central ni a Docker Hub | Mayor: pueden ser inexistentes o incompatibles |
| Comportamiento en Windows y macOS (módulo 0) | Entorno Linux | El propio autor declara que no se ejecutó |
| `ng serve` de los Temas 5–6 de Angular en navegador | Sin navegador; solo se compilaron con `ng test` | Menor |
| Los otros 285 módulos | Fuera de la muestra; solo la medición mecánica (`audit_plantilla.py`, 98/1432) | El riesgo se extrapola, no se demuestra módulo a módulo |
| Ramas `archivo` y `archivo-2026-11-18`, y el PDF citado en `foundations/modulo-0.md:415` | El PDF no está en el repositorio; las ramas no forman parte del alcance | Menor |

No faltó ninguno de los archivos obligatorios del prompt.

---

## 8. Cierre: comparación con la «PARTE 2 — estado final», punto por punto

### 1. Estructura macro

| Requisito | Estado | Evidencia |
|---|---|---|
| Prefacio con expectativas (para quién es, qué no incluye) | **No cumple** | No existe prefacio. Lo más cercano son las frases de entrada de `track-guides.ts` («Empieza aquí…») y el `README.md`, dirigido al desarrollador |
| Módulo 0 transversal «Primeros pasos» con instalación, entorno, Hello World, errores y capturas | **Parcial** | `foundations/modulo-0.md` cubre todo salvo capturas (0), ejecución en Windows/Linux, y empieza por un tema de 90 min antes del Hello World |
| Ruta priorizada: 3–4 cursos core publicados primero, el resto marcado avanzado | **No cumple** | 16 cursos publicados a la vez (`course-data.ts:872-887`) sin estado |
| Cada curso: Parte I Fundamentos → II Herramientas → III Proyecto → Apéndice | **Parcial** | Los tracks tienen niveles (Fundamentos/Aplicación/Integración/Experto) y un módulo de proyecto, pero sin partes ni apéndice por curso. Hay niveles desordenados (Java M16 «Integración» tras M15 «Experto»; Fundamentos M12 «Aplicación» tras M11 «Experto») |
| Apéndices globales: glosario, tablas de sintaxis, atajos | **Parcial** | Hay glosario mínimo (`technical-glossary.ts`); no hay tablas de sintaxis ni de atajos |

### 2. Plantilla obligatoria de cada `modulo-N.md` (validada por script)

| Elemento | Estado | Evidencia |
|---|---|---|
| Objetivos | **Parcial** | Presentes con «Al finalizar podrás» en 4 de 6 módulos; ausentes en Java M16 (0/8) y Spring M15 T4–T8 |
| Introducción motivadora | **Parcial** | «¿Por qué es importante?» casi siempre, pero en Java M16 es una línea (`:16` «el mapeo conecta objetos con filas…») |
| Concepto con analogía cotidiana correcta | **Parcial** | Ausente en Java M16 y Spring M15; engañosa en JS `:288` y Angular `:444` |
| Código completo y ejecutable + resultado esperado | **Parcial** | Correcto en JS M1 (verificado); fallos en Angular (`:58`, `:110`, `:750`), Java M16 (archivos inexistentes) y DevOps M20 T2 |
| Análisis paso a paso de líneas clave | **No cumple** | Falta en 36 de 38 temas de la muestra (`audit_plantilla.py`); solo `foundations/modulo-0.md:138` «Explicación causal» y `:197` «Explicación de cada línea» |
| Errores comunes con mensaje real y solución | **Parcial** | Listas genéricas; un solo mensaje literal verificado (`javascript/modulo-1.md:543`); ninguno en Java M16 y Spring M15 |
| Resumen | **No cumple** | 0 secciones «Resumen» en 6 módulos |
| Ejercicios progresivos + soluciones con ideas | **No cumple** | Hay ejercicios, 0 soluciones |
| Validado por script | **No cumple** | `validate.sh` no valida la plantilla; `audit_plantilla.py` está fuera de `validate.sh` y mide por palabras clave |

### 3. Estándares de contenido

| Requisito | Estado | Evidencia |
|---|---|---|
| Código completo, nunca fragmentos | **No cumple** | `angular/modulo-2.md:591`, `:679-686`; `java/modulo-16.md:401-409` (fragmento de test); `devops/modulo-20.md:254` (scripts no dados) |
| Versión de lenguaje y SO declarados | **Parcial** | Fundamentos M0 declara SO y versión (`:16-26`, versión obsoleta); JS M1 y DevOps M20 no declaran versión de Node; Angular fija `@angular/cli@22`; Java en el `pom.xml` (25), no en el texto de M16 |
| Segunda persona consistente | **Parcial** | Tuteo dominante; voseo en Angular T5–T6 |
| Jerga explicada o en glosario | **No cumple** | §D2 |
| Un diagrama o captura por lección cuando aplique | **Parcial** | Mermaid en casi todos los temas de 4 módulos; ninguno en Java M16; 0 capturas de pantalla |
| Proyecto pequeño (30–60 min) por parte/curso | **No cumple** | Los proyectos son módulos de 6–8 h; no hay mini-proyectos por parte |

### 4. Proceso y automatización

| Requisito | Estado | Evidencia |
|---|---|---|
| `validate.sh` verifica secciones obligatorias | **No cumple** | Líneas 7-33: paridad, índice, catálogo, carpetas de laboratorio, specs |
| … bloques de código completos | **No cumple** | — |
| … ejecución de ejemplos | **No cumple** | Ni `validate.sh` ni `ci.yml` ejecutan bloques ni `examples/` |
| … jerga/glosario | **No cumple** | — |
| … enlaces internos | **No cumple** | Solo existencia de carpetas de laboratorio; no se validan enlaces `/curso/...` ni archivos dentro del laboratorio |
| Flujo de revisión autor → pedagógico → técnico → publicación | **No cumple** | Sin documento; solo «El dueño aprueba los temarios» (`CLAUDE.md`) |
| Specs (SDD) para cada cambio editorial | **Cumple** | `specs/011–013` con criterios y `Verificación:`; `validate_specs.py --run` ejecuta 9/9 criterios `hecho` en verde. Matiz: las specs no se han aplicado aún al contenido de los temas |

### 5. Criterio de «terminado»

| Requisito | Estado | Evidencia |
|---|---|---|
| Cada curso publicado cumple la plantilla al 100 % (validado por script) | **No cumple** | 98/1432 temas (6,8 %) por marcadores, con falsos positivos; ningún curso llega al 100 % (máx. android 17/83) |
| Cada lección con evidencia de revisión pedagógica y técnica | **No cumple** | No hay metadatos ni registro; `foundations/modulo-0.md:168` «Registro de ejecución: pendiente» |
| Muestra de 10 lecciones modelo aprobadas | **No cumple** | No existe ninguna lección marcada como modelo |
| Ruta core completa y probada con un principiante real | **No cumple** | No hay ruta core definida ni registro de prueba con usuarios |

**Balance de la Parte 2:** 1 cumple, 11 parciales y 19 no cumplen, sobre 31 puntos verificables. El proyecto está en la fase de «infraestructura y contenido abundante», no en la de «libro publicable para principiantes».
