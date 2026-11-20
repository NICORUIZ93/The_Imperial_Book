# Reordenar los temas: Node.js y la deuda de orden de los otros cursos, 2026-11-19

**Petición:** «quiero que revises cada tema cada curso y reorganices de manera mejora ordenada cada tema».
**Alcance elegido:** *curso completo por curso*. Seis lotes en este documento: Node.js reordenado por completo (14 capítulos, 78 temas), los 10 capítulos que los demás cursos dejaban declarados como incumplidos, JavaScript como curso completo etiquetado y ordenado (15 capítulos, 92 temas), React como curso completo etiquetado y ordenado (15 capítulos, 64 temas), iOS como curso completo etiquetado y ordenado (15 capítulos, 69 temas) —que además aporta el auditor de citas numéricas— y Java como curso completo etiquetado y ordenado (23 capítulos, 117 temas), que amplía ese auditor a las dos formas de citar de Java y obliga a declarar la primera excepción de orden del programa. Quedan 10 cursos sin etiquetar; ver «Deuda que queda» al final.

## Qué se midió antes de tocar nada

`python3 scripts/audit_topic_order.py` recorre los 1.420 temas del repositorio y aplica dos reglas comprobables:

1. **Numeración continua**: los temas de un capítulo van 1, 2, 3… sin saltos ni repetidos.
2. **Nivel no decreciente**: dentro de un capítulo, un tema no puede declararse más fácil que el que tiene delante (Básico < Intermedio < Avanzado < Experto).

Medición inicial (antes de este lote): **1.420 temas, 1.210 sin nivel declarado (85 %), 15 capítulos con incidencias**. Node.js aportaba 5 de esos 15. El 85 % sin etiqueta es el límite real del programa: mientras un tema no declare nivel y duración, ninguna puerta puede juzgar su colocación. La etiqueta se escribe en el propio encabezado (`### Tema 4: título · Intermedio · 75 min`), que es de donde la leen el índice y el lector.

## Instrumentos nuevos

| Archivo | Para qué sirve |
|---|---|
| `scripts/audit_topic_order.py` | Audita las dos reglas sobre los 16 cursos. `--check` falla ante incidencias no declaradas **y** ante deudas ya resueltas que sigan en la lista, así que la lista no se oxida. Está enganchado a `scripts/validate.sh`, línea nueva tras el chequeo del catálogo. |
| `scripts/reorder_track_topics.py` | Mueve bloques de temas completos (cabecera + cuerpo) dentro de un capítulo, renumera las cabeceras y remapea a la vez los registros que indexan por número: `docs/topic-learning-quality.json` y `specs/visual-aids-scope.json`. Sin `--apply` solo informa. |
| `docs/topic-order-exceptions.json` | La deuda declarada: capítulos que hoy incumplen y se dejan para su lote. Antes de este programa tenía 15 entradas; tras el lote de Node, 10; tras el segundo lote, **0** (el archivo sigue existiendo con la lista vacía, y `--check` falla si vuelve a entrar algo sin resolver). |
| `scripts/audit_topic_citations.py` | Desde el quinto lote: audita las citas numéricas entre temas (`… de este módulo`, `del Módulo 7`, `Módulo 12, Tema 4`) sobre los 289 capítulos. Comprueba que el número existe, que nadie se declara su propio prerrequisito y que las frases de prerrequisito miran hacia atrás. Enganchado a `validate.sh` detrás del auditor de orden. |

**Por qué la puerta de orden no comprueba prerrequisitos, y quién lo hace ahora.** Se probó una tercera regla dentro de `audit_topic_order.py` («un tema no puede pedir en sus prerrequisitos algo que se enseña más adelante») y dio dos falsos positivos que hay que leer antes de reescribirla: en el capítulo 5 de Node un prerrequisito dice «Docker se enseña a fondo en el Módulo 11; aquí solo lo usas para levantar PostgreSQL», que es una aclaración, no una dependencia; y en el capítulo 19 de Java el texto cita `Java M10 Tema 3 (opens)` dentro de una comparación. La regla se descartó allí, no se relajó el umbral. Lo que sí se usó para decidir el orden fue **leer el texto de cada tema**, capítulo por capítulo. En el quinto lote la idea volvió, pero como auditor propio y con el alcance resuelto antes de juzgar nada: los dos falsos positivos históricos siguen sin marcar, y hay que saber por qué. El del capítulo 5 de Node no menciona ningún número de tema —dice «Docker se enseña a fondo en el Módulo 11»—, así que no es una cita entre temas y el auditor no tiene nada que resolver. El del capítulo 19 de Java escribe `Java M10 Tema 3` con el abreviado del curso delante, sin `Módulo` ni `de este módulo`: se salta como posible cita de otro curso. Ninguno se salvó relajando un umbral; ninguno entra en el dominio que el auditor juzga. Lo que ese dominio **todavía no** juzga es si un capítulo referido con `del Módulo N` existe: ahí el auditor se calla si el número no está en el curso (`otro not in index`), y ninguna otra puerta lo comprueba. Queda como deuda.

## Qué cambió en Node.js

Nueve capítulos reordenados y cinco temas reetiquetados. Ningún texto se reescribió: la verificación es que el multiset de líneas de cada archivo es idéntico antes y después, salvo las cabeceras.

| Capítulo | Orden final |
|---|---|
| El runtime de Node: V8, libuv y el Event Loop | Node no es «JavaScript en el servidor» → **`process`, `global` y módulos core** → Fases del Event Loop → Event-driven y non-blocking I/O |
| Módulos, npm/pnpm y gestión de dependencias | package.json y semver → Lockfiles → **ESM y CommonJS conviviendo** → Scripts de ciclo de vida → Workspaces → Publicar y versionar |
| Sistema de archivos y streams | fs/promises → **Buffer y Blob** → Streams básicos → Compresión con zlib → Backpressure → `pipeline()` |
| Servidores HTTP nativos | Modelo request/response → Routing manual → Parsing de body y headers → Códigos de estado → Paginación por cursor → **TCP/UDP/DNS** → HTTPS y HTTP/2 con TLS |
| Testing e integración continua | **`node:test` nativo** → TDD práctico con `node:test` → Cobertura con `node:test` → Vitest y Supertest → Testcontainers → Mocks y CI → Alternativas de testing y debugging |
| Patrones asíncronos avanzados | Worker Threads → Cluster → **Redis** → Colas con BullMQ → PM2 y fugas de memoria |
| Observabilidad y manejo de errores | Logging estructurado → Correlation ID → REST, GraphQL y gRPC → Excepciones y graceful shutdown → **Contexto por petición con `AsyncLocalStorage`** → Métricas Prometheus y trazas con OpenTelemetry |
| Proyecto integrador: API productiva | Arquitectura por capas → **Posiciones espaciales con Socket.IO** → **Archivos y notificaciones push** → Uniendo cada módulo del track → Qué le falta para producción real → Próximos pasos |
| TypeScript, contratos e integraciones confiables | Tipos estáticos y datos desconocidos → Un contrato HTTP es comportamiento → **OpenAPI como contrato ejecutable** → Reintentar sin duplicar → Webhooks verificables |

Las cadenas que motivan los movimientos, en palabras del propio contenido:

- Conocer `process` y los módulos core va antes de leer las fases del Event Loop, porque el texto del tema de Event Loop pide «la distinción entre I/O y CPU» del primer tema.
- Buffer y Blob van antes que los streams: un stream mueve bytes y el tema de streams los da por supuestos.
- TCP, UDP y DNS van antes que TLS: HTTP/2 y HTTPS se apoyan en la conexión que describe el tema de `net` y `dgram`.
- `node:test`, su TDD y su cobertura abren el capítulo de pruebas: es el runner que no necesita dependencias, y Vitest, Testcontainers y los mocks vienen después, con frameworks y servicios externos.
- Redis va antes que BullMQ porque BullMQ usa Redis como almacén de colas; el propio tema de BullMQ pide Docker y Redis levantados.
- El contexto por petición (`AsyncLocalStorage`) va antes de las trazas distribuidas con OpenTelemetry, que propagan exactamente ese contexto.
- En el proyecto integrador, los dos proyectos especializados (Socket.IO y archivos/push) preceden al capítulo que une todos los módulos, y ese cierre va antes del diagnóstico de «qué le falta» y los próximos pasos.

Los cinco reetiquetados suben de Intermedio a Avanzado porque el texto que los acompaña lo exige: los tres de patrones asíncronos (Redis, BullMQ, PM2 y volcados de heap) piden Docker, consumidores idempotentes, diagnóstico de memoria y cachés con límite; los dos del proyecto integrador (qué le falta para producción y próximos pasos) piden evaluar evidencia y decidir sobre un caso propio.

**Capítulos que quedan igual:** Módulos y dependencias de base de datos, Autenticación y autorización, Seguridad en Node y Despliegue y contenedores ya cumplían las dos reglas. El único aviso del capítulo de bases de datos era el falso positivo de Docker descrito arriba.

## Lo que nota el lector

- **34 de los 78 fragmentos de Node cambian** de URL y 44 se conservan (un tema que mantiene su número conserva su enlace). Ejemplo real: `…/curso/node/7/tema/tema-1-vitest-y-supertest-…` pasa a `…/tema/tema-4-vitest-y-supertest-…`.
- Un enlace antiguo **no rompe**: el capítulo se abre por su portada, sin aviso de error (comprobado en navegador).
- La marca «tema leído» se guarda con el fragmento (`progress.service.ts:190-200`), así que **los 34 temas movidos pierden esa marca** para quien los tuviera leídos. El progreso a nivel de capítulo no se ve afectado porque se indexa por identificador de módulo.
- La paginación del modo libro y el índice del capítulo muestran ya el orden nuevo (7.1 `node:test`, 7.2 TDD práctico, …).

## Verificación

- `python3 scripts/audit_topic_order.py --check` → salida 0: Node fuera de la lista, 10 módulos declarados.
- Comprobación de integridad de los nueve archivos movidos: mismo número de líneas y mismo multiset de líneas salvo las cabeceras renumeradas; 78 filas en `docs/topic-learning-quality.json` casando con las 78 cabeceras reales (0 desacoples); las 7 entradas de Node en `specs/visual-aids-scope.json` siguen apuntando a los mismos temas (verificado resolviendo el título antes y después contra `HEAD`).
- Regenerados: `topic-index.json`, `curriculum-catalog.json`, `curriculum-stacks/node.json`, `docs/zero-to-master.{md,json}`, `docs/master-prompt-compliance.{md,json}`, `docs/topic-order-exceptions.json`. Total intacto: **16 rutas · 289 módulos · 1.420 temas**, así que no hubo que tocar las cifras de `CLAUDE.md`, `README.md` ni `MASTER-PROMPT.md`.
- `./scripts/validate.sh` → salida 0, ya con la puerta de orden dentro. `validate_specs`: 43 criterios, 36 `hecho` y 7 `pendiente` (sin cambios: reordenar no cierra ningún criterio del prompt maestro).
- `npm run build` en `web/` → salida 0, bundle en 3,996 s.
- `PLAYWRIGHT_CHANNEL=chrome npx playwright test --workers=1` en `web/` → **83 de 84 pasan**. La que falla es la misma que antes del lote: `modo libro: salir del modo devuelve el capítulo completo y persiste la elección` solo en móvil, ya documentada en `docs/cambios-2026-11-19.md`; no la toca este cambio.
- Navegador sobre el servidor de desarrollo: el capítulo de pruebas lista los 7 temas en el orden nuevo sin errores en consola; el capítulo de archivos y streams muestra fs → Buffer y Blob → streams → zlib → backpressure → `pipeline()`; consola sin errores salvo el aviso conocido de saneado de HTML de Angular.

**Hallazgo preexistente, no corregido aquí:** abrir un enlace directo a un tema concreto (`/curso/node/7/tema/tema-4-…`) deja el lector en la portada del capítulo en vez de en ese tema. Se reprodujo en un capítulo que no se tocó en este lote (Autenticación y autorización), así que no es una regresión del reordenado: es cómo el modo libro resuelve la ruta de tema. Queda abierto junto con el defecto de salida del modo libro en móvil.

## Cómo revertir el primer lote

Cada capítulo se devuelve a su orden anterior aplicando su permutación inversa (la lista dice «en la posición i pongo el tema que hoy lleva el número orden[i]»), con la misma herramienta que se usó para moverlos:

```
python3 scripts/reorder_track_topics.py --track node --module 0 --order 1,3,2,4 --apply
```

Inversas por capítulo: El runtime de Node `1,3,2,4` · Módulos y npm `1,2,5,4,6,3` · Sistema de archivos y streams `1,3,5,6,2,4` · Servidores HTTP nativos `1,2,3,4,5,7,6` · Testing e integración continua `4,5,6,7,1,2,3` · Patrones asíncronos `1,2,4,5,3` · Observabilidad `1,2,4,3,6,5` · Proyecto integrador `1,4,5,6,2,3` · TypeScript y contratos `1,2,4,5,3`. Cada una está verificada: aplicar el orden del lote y después su inversa devuelve la numeración original, y la herramienta remapea los registros en ambos sentidos.

Las cinco etiquetas de nivel se revierten editando su cabecera (`Intermedio` donde ahora dice `Avanzado`). Después: `python3 scripts/audit_topic_order.py --write-exceptions`, los cuatro generadores de arriba y `./scripts/validate.sh`.

## Segundo lote: los 10 capítulos que quedaban declarados

Medición de partida: `docs/topic-order-exceptions.json` con 10 entradas repartidas en 8 cursos. Cada capítulo se resolvió con una de dos decisiones, y la eligió el texto del propio tema, no el auditor:

- **Mover bloques** (8 capítulos) cuando el tema más difícil estaba delante del que lo sostiene.
- **Reetiquetar** (2 capítulos) cuando el nivel declarado era falso: el tema ya pedía en sus prerrequisitos lo que enseña el tema Avanzado que tenía delante, así que moverlo sería premiar una etiqueta equivocada.

### Los dos reetiquetados

| Tema | Antes | Ahora | Por qué, en palabras del propio tema |
|---|---|---|---|
| DevOps · capítulo 2 «Docker — imágenes y buenas prácticas» · «Elegir el motor de contenedores local: Docker Desktop, Podman, Colima y Rancher Desktop» | Básico · 35 min | **Avanzado** · 35 min | Su prerrequisito nombra «Dockerfile multi-stage» y «Contenedores sin privilegios», ambos Avanzado del mismo capítulo, y el ejercicio escribe un script que compara reglas de licencia entre motores. |
| Flutter · capítulo 1 «Widgets: stateless vs stateful» · «Gestos en Flutter: GestureDetector, Dismissible y la arena de gestos» | Intermedio · 40 min | **Avanzado** · 40 min | Su prerrequisito es «Los tres árboles de Flutter: Widget, Element y RenderObject» (Avanzado), y la arena de gestos se entiende sobre ese modelo de árbol. |

Con eso, los capítulos de DevOps 2 y Flutter 1 ya cumplían la regla de nivel sin mover nada: se etiquetó y se dejó el orden.

### Los ocho capítulos reordenados

La lista dice «en la posición nueva i pongo el tema que entonces llevaba el número orden[i]».

| Capítulo | Orden aplicado | Orden final |
|---|---|---|
| Android 15 «Android como plataforma — Intents, broadcasts, servicios y content providers» | `1,2,3,4,5,8,6,7,9` | Intents → BroadcastReceiver → Foreground Service de ubicación → FileProvider → Mapas · **Sensores** → Geofencing → CameraX y ML Kit → Bluetooth LE |
| Angular 14 «Angular en producción — accesibilidad, seguridad e internacionalización» | `1,2,3,4,6,5` | Accesibilidad → Fronteras de la seguridad automática → Internacionalizar → Rendimiento y actualización → **Perfilar con DevTools** → CSP con nonce y Trusted Types |
| Flutter 7 «Integración con plataformas nativas» | `1,2,3,4,6,5` | MethodChannel → Plugins federados → Permisos de plataforma → Cámara y carga multipart → **Trabajo en segundo plano** → Add-to-app |
| iOS 4 «Concurrencia moderna: async/await» | `1,2,3,4,6,5` | async/await y Task → Actors → TaskGroup y MainActor → Cancelación cooperativa → **AsyncSequence y AsyncStream** → Swift 6: Sendable y data races |
| iOS 6 «Persistencia con SwiftData» | `1,2,3,5,4` | @Model y ModelContainer → @Query → Migraciones → **Archivos en iOS** → CloudKit con SwiftData |
| iOS 13 «iOS en producción — seguridad, sincronización y operación» | `1,2,3,4,5,6,7,10,8,9` | Sandbox → Copias de datos → Offline-first → Operar ante el fallo → Keychain → Permisos y privacidad → APNs → **Face ID y Touch ID** → Core Location → BackgroundTasks |
| Kotlin Multiplatform 7 «Compose Multiplatform — UI compartida» | `1,2,3,4,5,7,8,6` | Compose MP vs Jetpack → Estado y recomposición → Theming y navegación → Limitaciones en iOS → Recursos y localización → **Accesibilidad** → **Hot reload** → Deep links |
| Microservicios 1 «Construir un monolito modular antes de extraer servicios» | `1,2,3,4,5,6,7,8,9,10,11,14,12,13` | Los once primeros sin cambios → **Separar mitos y verdades de DDD** → Medir señales que justifican una extracción → Registrar una decisión reversible en un ADR |

Las cadenas que motivan cada movimiento, leídas del contenido:

- **Android 15:** Sensores (Intermedio) solo pide «BroadcastReceiver», que es el tema 2; CameraX pide además permisos en tiempo de ejecución del capítulo 16 y Geofencing se apoya en notificaciones y ubicación. Los dos Intermedio (Mapas y Sensores) abren ahora la parte etiquetada y los tres Avanzado (Geofencing, CameraX, Bluetooth LE) cierran.
- **Angular 14:** CSP con nonce (Experto) estaba delante de Perfilar (Avanzado). Los dos conservan sus prerrequisitos —el de seguridad es el tema 2 y el de rendimiento es el tema 4—, así que basta con que el Experto cierre el capítulo.
- **Flutter 7:** Add-to-app (Experto) iba antes del trabajo en segundo plano (Avanzado). Add-to-app es la cima del capítulo: integra una app completa, mientras que `workmanager` solo pide permisos de plataforma y offline-first.
- **iOS 4:** Swift 6 (Experto) estaba delante de AsyncSequence (Avanzado). AsyncSequence pide async/await y cancelación cooperativa, ambos ya delante; Swift 6 pide Actors y TaskGroup/MainActor, así que sigue siendo el último.
- **iOS 6:** CloudKit (Avanzado) precedía a Archivos en iOS (Intermedio), que solo pide @Model. Sincronizar entre dispositivos es más difícil que leer una carpeta de la app.
- **iOS 13:** Face ID (Intermedio) cerraba el capítulo detrás de Core Location y BackgroundTasks (Avanzado). Su único prerrequisito es Keychain (tema 5), así que sube a la posición 8 y deja los dos Avanzado al final.
- **Kotlin Multiplatform 7:** Deep links (Avanzado) estaba en la posición 6, por delante de Accesibilidad y Hot reload (Intermedio). Los tres Intermedio (Recursos, Accesibilidad, Hot reload) van ahora juntos y el Avanzado cierra.
- **Microservicios 1:** DDD (Avanzado) cerraba el capítulo detrás de Medir señales y del ADR (Experto). DDD solo pide «Mantener reglas de dominio libres de frameworks» (tema 5) y aporta el vocabulario de contextos delimitados con el que después se leen las señales de extracción; el ADR sigue cerrando porque registra la decisión que esas señales justifican.

### El movimiento rompió referencias escritas con número

La herramienta renumera cabeceras y remapea los registros (`docs/topic-learning-quality.json` y `specs/visual-aids-scope.json`), pero **no reescribe el prosa**: si un tema cita «el Tema 12» o «referencia interna M1 T13», esa cita se queda apuntando al antiguo inquilino del número. Es el trabajo manual que hay que hacer en cada lote futuro. En este solo un capítulo citaba por número; los otros siete citan por título, y el título viaja con el bloque.

En `web/public/content/microservices/modulo-1.md` se corrigieron 6 líneas:

- «Siguiente tema» del tema 11: ahora apunta a «Separar mitos y verdades de Domain-Driven Design» (M1 T12).
- «Siguiente tema» del tema 12 (DDD): ahora apunta al ADR (M1 T14), y el puente final del capítulo reescribió su cierre — entrega «la matriz de señales del Tema 13 y el ADR de este tema».
- «Siguiente tema» del tema 13 (Medir señales): ahora apunta al ADR (M1 T14).
- Prerrequisito del ADR: «tema «Medir señales…» (referencia interna M1 T13)».
- Prosa del ADR: «el Tema 14 convierte su salida» y «una señal concreta del Tema 13».

Comprobado después: de las **25 citas internas por número** que hay en los diez capítulos tocados (las que nombran su propio capítulo; las que apuntan a otro módulo no las afecta el movimiento), **0 apuntan a un tema distinto del que nombran**. Los otros siete capítulos reordenados no citan por número en absoluto: citan por título, y el título viaja con el bloque.

## Lo que nota el lector en este lote

- **20 de los 78 temas tocados cambian de enlace.** El fragmento se calcula sobre el título **sin** el sufijo ` · Nivel · XX min` (`scripts/build_web_topic_index.py:63`, que llama a `TOPIC_META.sub("", title)`; en la app, el mismo recorte en `web/src/app/course/lesson-viewer.ts:84`), así que etiquetar no mueve ninguna URL: solo cambian de enlace los temas que el reordenado renumeró — 3 en Android 15, 2 en Angular 14, 2 en Flutter 7, 2 en iOS 4, 2 en iOS 6, 3 en iOS 13, 3 en Kotlin Multiplatform 7 y 3 en Microservicios 1. Los otros 58 conservan su enlace, incluidos los 14 temas de DevOps 2 y Flutter 1 que solo se reetiquetaron.
- Un enlace antiguo **no rompe**: abre la portada del capítulo, igual que en el lote de Node.
- La marca «tema leído» se pierde en esos 20 temas para quien los tuviera leídos; el progreso de capítulo no se toca.

## Verificación del segundo lote

- `python3 scripts/audit_topic_order.py --write-exceptions` → **0 módulos pendientes**; `--check` → salida 0. `docs/topic-order-exceptions.json` se queda con la lista vacía.
- Integridad de los 10 archivos: mismo número de temas y **multiset de líneas idéntico salvo las cabeceras renumeradas**, comprobado contra `git show HEAD:` en los 10. En Microservicios 1 la diferencia exacta son las 6 líneas de referencias listadas arriba (4 «Siguiente tema»/prerrequisito y 2 de prosa); en los otros 9, cero.
- Regenerados: `topic-index.json`, `curriculum-catalog.json`, los 6 `curriculum-stacks/*.json` tocados (android, angular, flutter, ios, kotlin-multiplatform, microservices), `specs/visual-aids-scope.json` y `docs/topic-learning-quality.json`. Total intacto: **16 rutas · 289 módulos · 1.420 temas**.
- `./scripts/validate.sh` → salida 0 (con la puerta de orden dentro). `validate_specs`: 43 criterios, 36 `hecho` y 7 `pendiente`; reordenar no cierra ningún criterio del prompt maestro.
- `npm run build` en `web/` → salida 0.
- `PLAYWRIGHT_CHANNEL=chrome npx playwright test --workers=1` en `web/` → **83 de 84**; falla solo la prueba preexistente de salida del modo libro en móvil, ya documentada en `docs/cambios-2026-11-19.md`.
- Navegador sobre el servidor de desarrollo (puerto 4211, porque el 4201 lo tiene ocupado un proceso de Qoder): el capítulo 1 de Microservicios lista 1.1 a 1.14 con nivel no decreciente y DDD en 1.12; el capítulo 4 de iOS abre el enlace directo del tema 5 en «AsyncSequence y AsyncStream» (página 6 de 8) con el prerrequisito intacto. Cero `.lesson-error` y consola limpia salvo el aviso conocido de saneado de HTML de Angular.

## Cómo revertir el segundo lote

Mismos pasos que el primer lote, con la permutación inversa de cada capítulo:

Android 15 `1,2,3,4,5,7,8,6,9` · Angular 14 `1,2,3,4,6,5` · Flutter 7 `1,2,3,4,6,5` · iOS 4 `1,2,3,4,6,5` · iOS 6 `1,2,3,5,4` · iOS 13 `1,2,3,4,5,6,7,9,10,8` · Kotlin Multiplatform 7 `1,2,3,4,5,8,6,7` · Microservicios 1 `1,2,3,4,5,6,7,8,9,10,11,13,14,12`.

Ejemplo: `python3 scripts/reorder_track_topics.py --track microservices --module 1 --order 1,2,3,4,5,6,7,8,9,10,11,13,14,12 --apply`. Cada inversa está verificada: aplicada tras el orden del lote devuelve la numeración original. Después hay que deshacer a mano las 6 líneas de referencias de Microservicios 1 y las dos etiquetas de nivel (DevOps 2 → Básico, Flutter 1 → Intermedio), y cerrar con `--write-exceptions`, los generadores y `./scripts/validate.sh`.

## Tercer lote: JavaScript, un curso completo (92 temas)

Aquí el trabajo no era mover temas: era **etiquetarlos**. De los 92 temas del curso, 88 no declaraban nivel ni duración, así que la puerta de orden no tenía nada que juzgar y cualquier reordenado habría sido adivinar. El lote tiene dos pasos, en este orden: etiquetar los 92 desde la evidencia del propio tema y, con las etiquetas puestas, ordenar los capítulos que aún no cumplían.

### De dónde sale cada etiqueta

Cada tema de JavaScript declara en su Paso 1 lo que da por sabido, con `**Prerrequisitos:**` o `**Conocimiento previo:**`. Volcados los 92 (con su volumen de código del laboratorio, medido en líneas), el nivel se decidió por esa declaración:

- **Básico** — el previo es sintaxis y herramientas inmediatas (terminal, variables, tipos, funciones) y el laboratorio es un archivo pequeño.
- **Intermedio** — pide ya varias piezas combinadas (closures + objetos + módulos, DOM + eventos + ESM) y escribe una estructura.
- **Avanzado** — trata la maquinaria: el motor, el recolector de basura, el modelo de ejecución, proxies, generadores, streams, herramientas de build, observadores, rendimiento medido.
- **Experto** — decidir con consecuencias: el proyecto integrador cerrado y los temas de nivel de tipos que exigen juzgar un diseño.

La duración sigue esa banda (30 · 35 · 40 · 45 · 50 min) y sube un tramo cuando el laboratorio del tema pesa claramente más que la mediana del capítulo (por ejemplo, Symbol con 63 líneas de código → Avanzado · 50 min; los temas del capítulo Master, que parten de 45).

**Una etiqueta existente sí cambió:** el capítulo 6 tenía «Streams web: leer una respuesta de fetch por partes» declarado como Intermedio · 40 min. Con el mismo criterio del resto del curso es Avanzado · 45 min: su laboratorio (48 líneas, el mayor del capítulo) escribe un `TransformStream` propio y decodifica la respuesta por trozos, y sus cuatro temas anteriores ya son Avanzado. Es la única declaración previa que se corrige, y se corrige por incoherente con el criterio, no para hacer pasar la puerta.

### Qué movió y qué no

Nueve capítulos ya eran coherentes una vez etiquetados (0, 2, 3, 5, 6, 7, 10, 12, 13): solo recibieron sus etiquetas. Seis se reordenaron:

| Capítulo | Orden aplicado | Orden final |
|---|---|---|
| 1 «Operadores, control de flujo y funciones» | `4,1,2,6,3,5` | Control de flujo → Tres formas de escribir una función → Parámetros por defecto y rest/spread → **Desestructuración** → Funciones de orden superior → IIFE y `arguments` |
| 4 «Arrays y estructuras de datos funcionales» | `1,2,3,5,4` | map/filter/reduce → Set y Map → Inmutabilidad → **Métodos inmutables modernos** → WeakMap y WeakSet |
| 8 «El DOM y eventos del navegador» | `1,2,3,7,4,5,6` | Selección y manipulación → Delegación de eventos → Formularios y validación nativa → **Formularios accesibles** → Web APIs → ResizeObserver y MutationObserver → requestAnimationFrame |
| 9 «Testing y calidad de código» | `1,4,2,3` | Vitest → **ESLint, Prettier y cobertura** → Mocks, spies y fakes → Mockear fetch |
| 11 «TypeScript esencial» | `1,3,4,2,6,5` | Tipos básicos → **Narrowing y uniones** → **tsconfig y strict** → **Generics** → **Decoradores** → TypeScript avanzado |
| 14 «JavaScript Master» | `1,2,3,4,6,7,8,9,10,12,13,14,15,5,11` | Los doce primeros se conservan; **WebAssembly** y **Service Workers/PWA** cierran el capítulo |

Las razones, leídas de los propios previos:

- **Capítulo 1:** el tema de desestructuración no declaraba previo y estaba el último, detrás de IIFE; es sintaxis sobre objetos y se apoya en rest/spread, así que va justo después. Control de flujo (Básico) abre el capítulo porque functions y loops se usan en todo lo demás.
- **Capítulo 4:** WeakMap pide «noción básica de recolección de basura», que el curso enseña en el capítulo 5; los métodos inmutables modernos solo piden inmutabilidad, así que pasan delante.
- **Capítulo 8:** «Formularios accesibles» declara que es un ejemplo independiente con HTML semántico, eventos y DOM, y estaba cerrado como Avanzado tras los observadores; con su nivel real (Intermedio) acompaña al tema de formularios.
- **Capítulo 9:** ESLint y cobertura piden «npm, Vitest y una suite verde», no mocks; van en posición 2, antes de mocks y de mockear fetch.
- **Capítulo 11:** Generics pide «tipos unión» y tsconfig pide «narrowing», pero ambos estaban detrás de los temas que los enseñan. Con eso corregido, el orden queda Tipos → Narrowing → tsconfig → Generics → Decoradores → TypeScript avanzado (Experto).
- **Capítulo 14:** WebAssembly pide Rust y medición, y Service Workers piden build de producción y HTTP caching; son los dos Experto del capítulo y cierran la lista. El resto conserva su orden de atlas.

### Tres citas escritas con número quedaron mal

JavaScript no usa puentes «Siguiente tema», pero tres temas citan por número en la prosa y el movimiento los descolocó:

- `javascript/modulo-1.md:203`: «el objeto `arguments` (que se discutirá en el Tema 5)» → **Tema 6**.
- `javascript/modulo-1.md:400`: «usando rest, como se vio en el Tema 2» → **Tema 3**.
- `javascript/modulo-8.md:628`: «los observadores del Tema 5» → **Tema 6**.

Recomprobado después sobre los 15 capítulos: ningún `«título» … de este módulo` apunta a un tema que quede después del que depende de él, y no queda ninguna cita numérica descolocada.

## Lo que nota el lector con JavaScript etiquetado

- **31 de los 92 enlaces cambian, y todos por el reordenado, no por etiquetar.** Las 89 etiquetas nuevas no movieron ni una URL: el índice y el lector recortan el sufijo ` · Nivel · XX min` antes de calcular el fragmento (`scripts/build_web_topic_index.py:63` y `web/src/app/course/lesson-viewer.ts:84`). Cambian enlace solo los temas renumerados en los seis capítulos movidos — 6 en el capítulo 1, 2 en el 4, 4 en el 8, 3 en el 9, 5 en el 11 y 11 en el 14 —, medido como diferencia de fragmentos entre `topic-index.json` de antes y de después del lote. Los otros 61 conservan su enlace, incluidos los temas de los 9 capítulos que solo se etiquetaron.
- Consecuencia directa: **quien tuviera marcado como leído uno de esos 31 temas pierde esa marca**. El progreso de capítulo no se toca.
- Corrección de esta cifra: aquí estaba escrito «90 de los 92», medido sobre la cabecera completa sin quitarle el sufijo de nivel y duración. La regla real es la de la app, y con ella el impacto es 31. Reetiquetar un tema **no** cambia su enlace ni borra su marca de leído.

## Verificación del tercer lote

- `python3 scripts/audit_topic_order.py --check` → salida 0 y **«1.420 temas, 1.122 sin nivel declarado, 0 módulos con incidencias»** (cifra de este lote; tras el de React son 1.064): 88 etiquetas nuevas (los 88 temas que no la tenían; 4 ya venían etiquetados, uno de ellos reetiquetado).
- Simulación previa al movimiento: aplicado cada orden, los 15 capítulos salen con niveles no decrecientes y con todo prerrequisito interno por delante. Después de aplicar, los 6 capítulos reordenados se comprobaron otra vez sobre el archivo real.
- Integridad: contra `git show HEAD:` en los 15 archivos, el cuerpo es idéntico salvo las cabeceras y **exactamente las 3 líneas de citas** listadas arriba.
- Regenerados `topic-index.json` y el catálogo; el remapeo de registros lo hizo la propia herramienta (`docs/topic-learning-quality.json` reescrito en los 6 capítulos; `specs/visual-aids-scope.json`, 1 entrada movida en el capítulo 14). Total intacto: **16 rutas · 289 módulos · 1.420 temas**.
- `./scripts/validate.sh` → salida 0; `validate_specs`: 43 criterios, 36 `hecho` y 7 `pendiente`.
- Prueba específica que podría romper el etiquetado (`ruta: presenta los niveles como orientación, no como certificación`, que exige que la visión general de JavaScript no muestre la palabra «Experto`) → pasa en escritorio y móvil: la portada del curso no lista niveles de tema, así que etiquetar no la contamina.
- `PLAYWRIGHT_CHANNEL=chrome npx playwright test --workers=1` en `web/` → **83 de 84**; la única que falla es la misma de siempre (`modo libro: salir del modo devuelve el capítulo completo y persiste la elección`, solo en móvil), ya documentada en `docs/cambios-2026-11-19.md`.
- Navegador (puerto 4212): el capítulo 14 de JavaScript lista sus 15 temas con el orden nuevo — WebAssembly en 1.14 y Service Workers en 1.15 —, la navegación Anterior/Siguiente muestra ya «TypeScript avanzado · Avanzado · 45 min» y cero `.lesson-error`.

## Cómo revertir el tercer lote

Deshacer los seis movimientos con su inversa (`python3 scripts/reorder_track_topics.py --track javascript --module 1 --order 2,3,5,1,6,4 --apply`, etc.) y borrar las etiquetas devolviendo cada cabecera a su texto sin ` · Nivel · XX min`, salvo las cuatro originales: capítulo 6 tema 7 (Intermedio · 40 min), capítulo 7 temas 7 (Avanzado · 45) y 8 (Avanzado · 45) y capítulo 14 tema 15 (Avanzado · 40). Las tres citas numéricas vuelven a Tema 5, Tema 2 y Tema 5. Cerrar con los generadores y `./scripts/validate.sh`.

Inversas verificadas (aplicar el orden del lote y luego su inversa devuelve la numeración original): capítulo 1 `2,3,5,1,6,4` · capítulo 4 `1,2,3,5,4` · capítulo 8 `1,2,3,5,6,7,4` · capítulo 9 `1,3,4,2` · capítulo 11 `1,4,2,3,6,5` · capítulo 14 `1,2,3,4,14,5,6,7,8,9,15,10,11,12,13`.

## Cuarto lote: React, un curso completo (64 temas)

Segundo curso entero después de Node. React tenía 6 de sus 64 temas etiquetados, así que el trabajo mayoritario es el mismo que en JavaScript: **leer el `Prerrequisitos` y el objetivo de cada tema y declararle nivel y duración**, y solo después mover lo que las etiquetas obligan a mover.

Regla de etiquetado, idéntica a la de los lotes anteriores:

| Nivel | Lo que el tema te hace hacer |
|---|---|
| Básico | Primer contacto con una primitiva del curso, sin librería externa y sin medir nada. |
| Intermedio | Varias primitivas ya conocidas trabajando juntas, o una librería/herramienta nueva, o decidir con una medición delante. |
| Avanzado | Interna del mecanismo, semántica de servidor, concurrencia, o un requisito de producción (seguridad, accesibilidad, migración). |
| Experto | El tema que cierra un capítulo combinando todo bajo restricciones reales: frontera de seguridad, release medible, proyecto integrador. |

Duración leída de la carga del propio tema (7 pasos, cantidad de código y de comprobaciones), entre 30 y 55 min; el capítulo 12, que es el proyecto, sube a 55.

Con las etiquetas puestas, **tres capítulos incumplían la regla de nivel y se reordenaron; los doce restantes ya cumplían**. La etiqueta de nivel se escribe dentro de la cabecera, pero el enlace no la lleva: `scripts/build_web_topic_index.py:63` calcula el fragmento sobre `TOPIC_META.sub("", title)` y el lector hace el mismo recorte en `web/src/app/course/lesson-viewer.ts:84`, con el comentario explícito de la línea 741 («El sufijo · Nivel · Duración se excluye para conservar el fragmento»). **Etiquetar los 64 temas no cambió ni un enlace.**

### Los tres capítulos reordenados

La lista dice «en la posición nueva i pongo el tema que entonces llevaba el número orden[i]».

| Capítulo | Orden aplicado | Orden final |
|---|---|---|
| React 1 «Estado local y el ciclo de render» | `1,4,5,2,3` | useState → **Componentes controlados** → **Componentes puros y el estado como instantánea** → Render frente a commit → Batching |
| React 3 «Formularios y eventos» | `3,1,2,4` | **Eventos sintéticos** → React Hook Form → Validación con zod y multi-paso → Formularios con Actions |
| React 9 «Performance en React» | `1,2,5,3,4,6,7` | Medir → React.memo → **Suspense y React.lazy** → Virtualización y code-splitting → useTransition/Fiber → el hook `use` → React Compiler |

Las cadenas que motivan cada movimiento, leídas del contenido:

- **React 1:** el interna del mecanismo (Render frente a commit, Batching, ambos Intermedio) estaba en las posiciones 2 y 3, por delante de los dos Básicos que las necesitan para tener sentido: escribir un campo controlado y entender que el estado es una instantánea. Ninguno de los dos temas de interna es prerrequisito de nada en el capítulo, así que bajan al final.
- **React 3:** Eventos sintéticos (Básico) era el penúltimo, detrás de React Hook Form y de zod (Intermedio). Es el único tema del capítulo que no necesita librería ni proyecto previo: se entiende con el formulario del capítulo 2, y `preventDefault` es lo que React Hook Form luego abstrae. Sube a la posición 1.
- **React 9:** Suspense y React.lazy (Intermedio) estaba quinto, por detrás de Virtualización y de useTransition/Fiber (Avanzado). La carga diferida es la técnica base que los dos Avanzado después aplican sobre datos ya medidos; sube a la posición 3, justo detrás de React.memo.

### Dieciséis líneas de prosa quedaron mal por el movimiento

La herramienta renumera cabeceras y remapea los registros, pero no reescribe el texto. React no usa puentes «Siguiente tema»; lo que cita por número son los `Prerrequisitos` y la tabla de comprobación del final de cada capítulo. Se corrigieron 6 líneas en el capítulo 1, 6 en el 3 y 4 en el 9:

- Capítulo 1 (`react/modulo-1.md`): prerrequisito de Componentes controlados `Tema 3` → **Tema 1** (useState); prerrequisito de Batching `Tema 2` → **Tema 4** (Render frente a commit); y cuatro filas de la tabla final — input controlado y formulario controlado `Ver Tema 4` → **Tema 2**, los tres `setState` `Ver Tema 3` → **Tema 5**, explicar render frente a commit `Ver Tema 2` → **Tema 4**.
- Capítulo 3 (`react/modulo-3.md`): prerrequisito de Eventos sintéticos `Tema 2 de este módulo` → **Módulo 2 completo** (queda como primer tema del capítulo, ya no tiene predecessor interno); prerrequisito de Validación con zod `Tema 1` → **Tema 2** (React Hook Form); tabla final — formulario con React Hook Form `Ver Tema 1` → **Tema 2**, schema de zod y formulario multi-paso `Ver Tema 2` → **Tema 3** cada una, y manejar el submit `Ver Tema 3` → **Tema 1**.
- Capítulo 9 (`react/modulo-9.md`): prerrequisito de Suspense y React.lazy `Tema 3 de este módulo (code-splitting)` → **tema «Virtualización y code-splitting» de este módulo** (forma por título, que es la robusta); el ejercicio de dividir por ruta `del Tema 3 de este módulo` → **Tema 4**; prerrequisito de useTransition `Tema 3` → **Tema 4**; tabla final — virtualizar 10.000 elementos `Ver Tema 3` → **Tema 4**. La fila `Ver Tema 3` de `React.lazy` se queda como está: después del movimiento, el Tema 3 de este módulo es literalmente Suspense y React.lazy.

Comprobado después sobre los 15 archivos: toda cita `«título» … de este módulo` apunta al tema que nombra, ninguna cita numérica interna apunta a un tema posterior al que depende de ella, y la única referencia entre capítulos con número (`Módulo 2, Tema 5`, el Error Boundary citado desde React 9 tema 3) sigue en su sitio porque el capítulo 2 no se movió.

## Lo que nota el lector con React etiquetado

- **10 de los 64 temas cambian de enlace**, todos por el reordenado y ninguno por etiquetar: 4 en el capítulo 1, 3 en el 3 y 3 en el 9. Los otros 54 conservan el suyo, incluidos los 12 capítulos que solo recibieron etiquetas. Medido comparando `topic-index.json` de antes y después del lote, no sobre la cabecera.
- Quien tuviera marcado como leído uno de esos 10 pierde esa marca; el progreso de capítulo no se toca y un enlace antiguo no rompe: abre la portada del capítulo.
- Nivel y duración ya se ven en cada cabecera de tema (`§ 9.3 Suspense y React.lazy — carga diferida del lado cliente · Intermedio · 40 min`), que es lo que la puerta de orden juzga.

## Verificación del cuarto lote

- `python3 scripts/audit_topic_order.py --check` → salida 0: **1.420 temas, 1.064 sin nivel declarado, 0 módulos con incidencias**. React pasa de 6 a 64 temas etiquetados y sus 15 capítulos cumplen las dos reglas sin tocar la lista de excepciones, que sigue vacía.
- Integridad: contra `git show HEAD:` en los 15 archivos, mismo número de temas y multiset de líneas idéntico salvo las cabeceras renumeradas y las **exactas 16 líneas de citas** de arriba; en los 12 capítulos sin mover, cero diferencias de cuerpo.
- Regenerados: `topic-index.json`, `curriculum-catalog.json`, `curriculum-stacks/react.json`, `specs/visual-aids-scope.json` (1 entrada movida en el capítulo 1) y `docs/topic-learning-quality.json` (59 filas de React con la cabecera ya etiquetada). Total intacto: **16 rutas · 289 módulos · 1.420 temas**.
- `./scripts/validate.sh` → salida 0. `validate_specs`: 43 criterios, 36 `hecho` y 7 `pendiente`; etiquetar y reordenar React no cierra ningún criterio del prompt maestro.
- `npm run build` en `web/` → salida 0. `PLAYWRIGHT_CHANNEL=chrome npx playwright test --workers=1` → **83 de 84**; falla solo la prueba preexistente de salida del modo libro en móvil.
- Navegador sobre el servidor de desarrollo (puerto 4213): el capítulo 9 de React lista 9.1 Medir, 9.2 React.memo, 9.3 Suspense y React.lazy, 9.4 Virtualización, 9.5 useTransition, 9.6 el hook `use`, 9.7 React Compiler con niveles no decrecientes; el enlace directo `/curso/react/1/tema/5` abre «Batching de actualizaciones» con el prerrequisito ya corregido («tema «useState y actualizaciones funcionales» de este módulo»); el capítulo 3 abre con «Eventos sintéticos · Básico · 35 min». Cero `.lesson-error` y consola limpia salvo el aviso conocido de saneado de HTML de Angular.

## Cómo revertir el cuarto lote

Inversas verificadas (aplicar el orden del lote y luego su inversa devuelve la numeración original, en los dos sentidos): capítulo 1 `1,4,5,2,3` (es su propia inversa) · capítulo 3 `2,3,1,4` · capítulo 9 `1,2,4,5,3,6,7`.

Ejemplo: `python3 scripts/reorder_track_topics.py --track react --module 9 --order 1,2,4,5,3,6,7 --apply`. Después hay que deshacer a mano las 16 líneas de citas de arriba (los `Prerrequisitos` y las tablas vuelven a los números antiguos) y quitar las 58 etiquetas nuevas devolviendo cada cabecera a su texto sin ` · Nivel · XX min`, salvo las seis originales: capítulo 1 tema 3 (Básico · 40), capítulo 2 tema 7 (Avanzado · 45), capítulo 3 tema 4 (Avanzado · 45), capítulo 9 temas 6 (Avanzado · 40) y 7 (Avanzado · 45), y capítulo 13 tema 5 (que este lote subió de Avanzado · 45 a Experto · 50 y debe volver a la primera). Cerrar con los generadores, `--write-exceptions` y `./scripts/validate.sh`.

## Quinto lote: iOS, un curso completo (69 temas)

Tercer curso entero del programa. iOS tenía 13 de sus 69 temas etiquetados, así que el trabajo mayoritario vuelve a ser **leer el `Prerrequisitos` y el objetivo de cada tema y declararle nivel y duración** (56 etiquetas nuevas, 13 que ya estaban y se dejaron igual, **0 con el nivel cambiado**), y solo después mover lo que las etiquetas obligan a mover. Regla de etiquetado y duraciones (30–55 min leídos de la carga del propio tema): las tablas del tercer y cuarto lote.

Que las 13 etiquetas previas quedaran intactas es el punto que hay que leer: **ningún nivel existente se subió ni se bajó para hacer pasar la puerta**. Donde una etiqueta previa chocaba con la regla, se movió el orden del capítulo, no la etiqueta.

Con las etiquetas puestas, **cuatro capítulos incumplían la regla de nivel y se reordenaron; los once restantes ya cumplían** y solo recibieron etiquetas.

### Los cuatro capítulos reordenados

La lista dice «en la posición nueva i pongo el tema que entonces llevaba el número orden[i]».

| Capítulo | Orden aplicado | Orden final |
|---|---|---|
| iOS 10 «Performance, accesibilidad y HIG» | `1,2,3,5,4` | Instruments → VoiceOver → HIG y Dynamic Type → **Localización (Intermedio · 40)** → **UIKit desde cero (Avanzado · 55)** |
| iOS 12 «Proyecto integrador» | `1,2,4,3` | Arquitectura → Sincronización → **Swift Package Manager (Avanzado · 45)** → **Cierre del track (Experto · 40)** |
| iOS 13 «iOS en producción — seguridad, sincronización y operación» | `1,2,5,6,8,7,3,4,9,10` | sandbox → copias de datos → **Keychain** → **Permisos** → **Face ID** → **APNs** → **offline-first** → **operar** → Core Location → BackgroundTasks |
| iOS 14 «SwiftUI Master: pruebas, animación e interoperabilidad» | `4,8,1,2,3,5,6,7,9,10` | **Animaciones** → **Gestos** → **Swift Testing** → **ViewInspector** → **Combine avanzado** → **UIViewRepresentable** → **UIViewControllerRepresentable** → **Core ML y Vision** → WidgetKit → App Intents |

Las cadenas que motivan cada movimiento, leídas del contenido:

- **iOS 10:** «UIKit desde cero» (Avanzado · 55, prerrequisito «módulos 0-9, un proyecto iOS existente») estaba cuarto, por delante de «Localización con String Catalogs» (Intermedio · 40, que solo pide el tema de HIG): la secuencia caía Avanzado → Intermedio en el salto 4 → 5. UIKit no es prerrequisito de nada dentro del capítulo, así que baja a la última posición.
- **iOS 12:** «Cierre del track» (Experto · 40) era tercero y «Swift Package Manager» (Avanzado · 45) cuarto, así que el nivel bajaba justo donde el curso termina. Se intercambian: SPM queda tercero —su prerrequisito es el tema «Arquitectura del proyecto integrador», que sigue siendo el Tema 1— y el cierre, que pide «Temas 1-2 de este módulo», cierra el capítulo y el curso, que es lo que significa Experto aquí.
- **iOS 13:** el capítulo más desordenado del repositorio. Etiquetado tal cual estaba, su secuencia era Int, Int, Av, Av, Int, Int, Av, Int, Av, Av — dos caídas (4 → 5 y 7 → 8). Los tres Intermedios de API concreta (Keychain, Permisos, Face ID) estaban repartidos por detrás de la maquinaria de sincronización: suben juntos detrás de los dos temas de principio. «Notificaciones push con APNs» (Avanzado · 40) se coloca justo después de Permisos porque Permisos es su prerrequisito explícito, y offline-first / operar / Core Location / BackgroundTasks cierran como bloque Avanzado.
- **iOS 14:** secuencia Int, Int, Av, Int, Av, Av, Av, Int, Av, Av — caídas en 3 → 4 y 7 → 8. «Animaciones y matchedGeometryEffect» (Intermedio, prerrequisito «Módulo 1 completo») y «Gestos en SwiftUI» (Intermedio · 40, etiqueta previa) son las dos primitivas de UI que ningún otro tema del capítulo necesita, y estaban cuarta y octava, por detrás de Combine, de las dos envolturas de UIKit y de Core ML. Suben a 1 y 2; Swift Testing y ViewInspector, que solo piden el capítulo 9, se colocan detrás; el resto conserva su orden relativo.

### Dieciocho citas reescritas en dieciséis líneas

Como en React, iOS no usa puentes «Siguiente tema» entre capítulos: lo que cita números son los `Prerrequisitos`, las filas «Siguiente paso», la tabla de comprobación final y algún enunciado de ejercicio. La herramienta renumera cabeceras y remapea registros, pero no reescribe texto.

- **Capítulo 10** (`ios/modulo-10.md`, 3): el «Siguiente paso» del tema de HIG deja de anunciar UIKit y anuncia el String Catalog, que es lo que ahora va detrás; y dos filas de la tabla final — «Construir la lista UIKit de paradas» y «Buscar una fuga con Memory Graph» — pasan de `Ver Tema 4` a **`Ver Tema 5`**, que es la posición nueva de UIKit.
- **Capítulo 12** (1): el «Siguiente paso» de Sincronización ya no cierra el track: ahora anuncia Swift Package Manager.
- **Capítulo 13** (6 en 5 líneas): el «Siguiente paso» de «Proteger datos» apunta a Keychain en vez de a offline-first; el prerrequisito de APNs `Tema 6 (permisos)` → **`Tema 4 (permisos)`**; en «Operar», `MotorSincronizacion.vaciar()` `(Tema 3)` → **`(Tema 7)`** y su `Prerrequisitos: Tema 3` → **`Tema 7`** (las dos en la línea 663, porque offline-first bajó a la posición 7); «el archivo del Tema 3 ni necesita» → **Tema 7**; y el «Siguiente paso» de BackgroundTasks, que decía «el tema siguiente protege con Face ID», se reescribe entero: Face ID ahora va delante y BackgroundTasks cierra el capítulo, así que apunta a los dos temas del capítulo 14 (WidgetKit y App Intents).
- **Capítulo 14** (8 en 7 líneas): el «Siguiente paso» de Animaciones ya no anuncia UIKit embebido sino gestos; el de Combine encaja con `UIViewRepresentable`; «No reutilices el proyecto del Tema 1» → **Tema 3** (Swift Testing); el prerrequisito de UIViewControllerRepresentable `Tema 5` → **`Tema 6`**; y en Core ML, las tres referencias a la cámara (`con la cámara del Tema 6`, `Prerrequisitos: Tema 6 … (ya tienes la UIImage de la foto)` — ambas en la línea 635 —, el nodo del diagrama `(cámara, Tema 7)` y «ni el proyecto del Tema 6») pasan a **Tema 7**, que es donde quedó UIViewControllerRepresentable.

## Instrumento nuevo: el auditor de citas numéricas

El cuarto lote demostró que el riesgo real del reordenado no es la puerta de orden (que solo mira la cabecera) sino **la prosa que el reordenado no toca**. Lo que se hacía a mano con un script de un solo uso pasa a ser instrumento del repositorio: `scripts/audit_topic_citations.py`, enganchado a `scripts/validate.sh` justo detrás de `audit_topic_order.py --check`.

Resuelve el alcance de cada `Tema N` sobre el propio texto —`de este módulo`, `del Módulo 7`, la forma antepuesta `Módulo 12, Tema 4`— dentro de la frase de la cita (cortada en `)`, `;` o `·`) y juzga tres reglas duras: el número **existe** en el capítulo alcanzado, nadie se pone a sí mismo como **prerrequisito**, y toda frase de prerrequisito **mira hacia atrás**. Una cita hacia adelante fuera de una frase de prerrequisito se imprime como **nota** y no bloquea: el autor a veces avisa de lo que viene. No se juzga lo que no lleva alcance (`Java M10 Tema 3` puede ser de otro curso).

Medido sobre el repositorio entero: **586 citas numéricas en 289 capítulos, 0 rotas, 1 nota**. La nota es `spring-boot/26` tema 1 línea 52 («resuelve el problema del Tema 2 de este módulo»), una referencia hacia adelante en prosa explicativa, anterior a este programa y admisible por la regla.

Tres cosas sacó el auditor el mismo día en que se escribió, y las tres eran defectos reales:

1. **`react/modulo-9.md:264`** — el cuarto lote dejó el ejercicio de dividir por ruta apuntando al `Tema 4 de este módulo` desde el Tema 3, o sea hacia adelante. Reescrito para apoyarse en el `React.lazy` del propio tema y en el Módulo 5.
2. **`javascript/modulo-11.md:426`** — `Prerrequisito: Tema 5 de este módulo` escrito dentro del Tema 5: el tema se pidiendo a sí mismo. Es anterior a este programa (`git show f5d2f81e~1` tiene la misma línea), así que no lo causó ningún lote; se reescribió a **temas «tsconfig esencial y modo strict» y «Generics»**, que son los que de verdad necesita un decorador.
3. Cuatro falsos positivos del propio detector en su primera versión (`android/14`, `devops/11`, `foundations/14`, `kotlin-multiplatform/1`): la ventana de la cita se tragaba el alcance de la cláusula vecina. Se corrigió el detector recortando la frase y prefiriendo el alcance más cercano al número, en lugar de tocar el contenido.

El auditor **no juzga las citas por título** (`tema «X» de este módulo`): en el repositorio hay 110 y 18 no coinciden con ninguna cabecera, casi siempre truncadas con «…» o renombradas de oído, en cursos que este programa no ha tocado. Esas 18 quedan como deuda. Lo que sí se comprobó a mano sobre los cinco cursos cerrados —**30 citas por título, 0 sin destino y 0 prerrequisitos que miren hacia adelante**— obligó a cuatro reescrituras más: `ios/modulo-10.md:196` decía «Human Interface Guidelines, Dynamic Type **y modo oscuro**» cuando el tema se llama «… **e interop con UIKit**»; `react/modulo-9.md:441` decía «del lado **del** cliente» contra un título que dice «del lado cliente»; y dos prerrequisitos que el reordenado dejó hacia adelante — `react/modulo-9.md:206` (Suspense pedía «Virtualización y code-splitting», ahora pide «Medir antes de optimizar») y `node/modulo-2.md:454` (zlib pedía `pipeline()`, que se enseña tres temas después: ahora pide «Streams básicos» y avisa de dónde se explica la composición segura).

## Lo que nota el lector con iOS etiquetado

- **18 de los 69 temas cambian de enlace**, todos por el reordenado y ninguno por etiquetar: 2 en el capítulo 10, 2 en el 12, 6 en el 13 y 8 en el 14. Los otros 51 conservan el suyo, incluidos los 11 capítulos que solo recibieron etiquetas. Medido comparando el `topic-index.json` de antes y después, no sobre la cabecera.
- Quien tuviera marcado como leído uno de esos 18 pierde esa marca; un enlace antiguo no rompe: abre la portada del capítulo.
- Nivel y duración ya se ven en cada cabecera (`§ 13.5 Face ID y Touch ID con LocalAuthentication · Intermedio · 35 min`), que es lo que la puerta de orden juzga. Las trece etiquetas previas siguen diciendo lo mismo que decían: ownership de Swift (capítulo 0), `AsyncSequence` y Swift 6 (capítulo 4), archivos en iOS y CloudKit (capítulo 6), String Catalogs (capítulo 10), Swift Package Manager (capítulo 12), Face ID, Core Location y BackgroundTasks (capítulo 13), y gestos, WidgetKit y App Intents (capítulo 14).

## Verificación del quinto lote

- `python3 scripts/audit_topic_order.py --check` → salida 0: **1.420 temas, 1.008 sin nivel declarado, 0 módulos con incidencias**. iOS pasa de 13 a 69 temas etiquetados y sus 15 capítulos cumplen las dos reglas sin tocar la lista de excepciones, que sigue vacía.
- `python3 scripts/audit_topic_citations.py --check` → salida 0: **586 citas, 0 rotas, 1 nota**.
- Integridad: contra `git show HEAD:` en los 15 archivos, mismo número de temas y multiset de líneas idéntico salvo las cabeceras renumeradas y las **exactas 18 citas** de arriba; en los 11 capítulos sin mover, cero diferencias de cuerpo.
- Regenerados: `topic-index.json`, `curriculum-catalog.json`, `curriculum-stacks/ios.json`, `specs/visual-aids-scope.json` y `docs/topic-learning-quality.json` (filas de iOS remapeadas por el script de reordenado y reetiquetadas). Total intacto: **16 rutas · 289 módulos · 1.420 temas**.
- `./scripts/validate.sh` → salida 0 con las dos puertas de orden enganchadas. `validate_specs`: 43 criterios, 36 `hecho` y 7 `pendiente`; iOS no cierra ningún criterio del prompt maestro.
- `npm run build` en `web/` → salida 0. `PLAYWRIGHT_CHANNEL=chrome npx playwright test --workers=1` → **83 de 84**; falla solo la prueba preexistente de salida del modo libro en móvil. Hubo que reinstalar el navegador con `npx playwright install chromium` porque `~/Library/Caches/ms-playwright/` ya no existía en la máquina: el primer intento falló las 84 de golpe por el ejecutable ausente, no por el contenido.
- Navegador sobre el servidor de desarrollo (puerto 4213): `/curso/ios/13/tema/1` lista el capítulo de producción con los niveles ya no decrecientes (13.1 sandbox · Intermedio · 45, 13.2 copias · Intermedio · 45, 13.3 Keychain · Intermedio · 35, 13.4 Permisos · Intermedio · 35, 13.5 Face ID…); `/curso/ios/14/tema/2` abre con 14.1 Animaciones · Intermedio · 35, 14.4 ViewInspector · Intermedio · 40 y el bloque Avanzado a partir de 14.5; el contenido servido del capítulo 14 muestra las citas ya reparadas (`Prerrequisitos: Tema 6 de este módulo` en UIViewControllerRepresentable y `Tema 7` en Core ML, incluido el nodo del diagrama). Captura: `/tmp/ios_lector_cap13.png`. Cero `.lesson-error` y sin insignias de error en el capítulo.

## Cómo revertir el quinto lote

Inversas verificadas (aplicar el orden del lote y luego su inversa devuelve la numeración original): capítulo 10 `1,2,3,5,4` (es su propia inversa) · capítulo 12 `1,2,4,3` (también la suya) · capítulo 13 `1,2,7,8,3,4,6,5,9,10` · capítulo 14 `3,4,5,1,6,7,8,2,9,10`.

Ejemplo: `python3 scripts/reorder_track_topics.py --track ios --module 13 --order 1,2,7,8,3,4,6,5,9,10 --apply`. Después hay que deshacer a mano las 18 citas de arriba (prerrequisitos, «Siguiente paso», tablas y el nodo del diagrama vuelven a los números antiguos) y quitar las 56 etiquetas nuevas devolviendo cada cabecera a su texto sin ` · Nivel · XX min`, salvo las trece originales: capítulo 0 tema 5 (Experto · 45), capítulo 4 temas 5 (Avanzado · 40) y 6 (Experto · 50), capítulo 6 temas 4 (Intermedio · 40) y 5 (Avanzado · 45), capítulo 10 tema 4 (Intermedio · 40), capítulo 12 tema 3 (Avanzado · 45), capítulo 13 temas 5 (Intermedio · 35), 9 (Avanzado · 45) y 10 (Avanzado · 45), y capítulo 14 temas 2 (Intermedio · 40), 9 (Avanzado · 45) y 10 (Avanzado · 40). Cerrar con los generadores y `./scripts/validate.sh`; el auditor de citas no hay que deshacerlo porque es herramienta, no contenido — y sigue pasando con iOS en su orden viejo, porque las cuatro citas de `react`, `node` y `javascript` que se repararon en este lote son mejoras de texto, no del orden.

## Sexto lote: Java, un curso completo (117 temas)

Java es el curso más grande después de Cloud: **23 capítulos y 117 temas**, con 16 etiquetas puestas. Como en los lotes anteriores, el trabajo mayoritario es leer el `Prerrequisito`, el objetivo y la carga de cada tema y declararle nivel y duración: **101 etiquetas nuevas, 16 que ya estaban y se dejaron byte a byte como estaban, 0 niveles cambiados**. Reparto final: 14 Básico, 64 Intermedio, 37 Avanzado, 2 Experto; duraciones 30 min (3 temas), 35 (22), 40 (52), 45 (30), 50 (10).

Que las dieciséis previas quedaran intactas es el punto que hay que leer: capítulo 9 tema 4, capítulo 14 temas 5 y 6, capítulo 18 tema 3, capítulo 19 temas 8 y 9, y los diez temas de los capítulos 21 y 22. **Ningún nivel existente se subió ni se bajó para hacer pasar la puerta.**

### Los ocho capítulos reordenados

Con las etiquetas puestas, **ocho de los veintitrés capítulos incumplían la regla de nivel** y se reordenaron; los quince restantes solo recibieron etiquetas. En total **22 de los 117 temas cambian de número**. La lista dice «en la posición nueva i pongo el tema que entonces llevaba el número orden[i]».

| Capítulo | Orden aplicado | Dónde caía el nivel |
|---|---|---|
| 0 «Sintaxis, tipos y el modelo de la JVM» | `1,3,2,4,5,6,7,8` | 2 Intermedio → 3 Básico |
| 2 «Colecciones y genéricos» | `1,3,2` | 2 Avanzado → 3 Intermedio |
| 4 «Streams y programación funcional» | `1,2,4,3` | 3 Avanzado → 4 Intermedio |
| 13 «Proyecto integrador» | `1,3,2` | 2 Avanzado → 3 Intermedio |
| 15 «Java Master — builds, pruebas y observabilidad» | `1,3,4,6,2,5` | 2 Avanzado → 3 Intermedio y 5 Avanzado → 6 Intermedio |
| 16 «JPA, Hibernate y FetchType.LAZY vs EAGER» | `1,3,4,5,2,6,7,8` | 2 Avanzado → 3 Intermedio |
| 19 «Java del día a día» | `1,2,3,4,5,7,6,8,9` | 6 Avanzado → 7 Intermedio |
| 20 «Java funcional — interfaces que componen comportamiento» | `1,4,2,3,5,6,7,8,9,10,11,12,13` | 3 Intermedio → 4 Básico (y ver la excepción más abajo) |

Las cadenas que motivan cada movimiento, leídas del contenido:

- **Capítulo 0:** «JDK, JRE y JVM» (Básico · 30) estaba tercero, detrás de «public static void main» (Intermedio · 40, que solo pide `M0 T1`, o sea el primer tema del propio capítulo). Sube a la segunda posición: son los dos temas de arranque del curso y «JDK, JRE y JVM» no declara ningún prerrequisito, así que ninguno de los dos depende del otro.
- **Capítulo 2:** «Genéricos, wildcards y type erasure» (Avanzado · 40) era segundo y «Comparable vs Comparator, e iteración» (Intermedio · 35) tercero, aunque este último solo pide «M2 T1 (colecciones) y M1 T3 (interfaces)». Intercambio: el Avanzado cierra el capítulo.
- **Capítulos 4 y 13:** en ambos el tema Avanzado iba justo delante del Intermedio de cierre («Streams paralelos y referencias a métodos» delante de «Stream Gatherers (Java 24)»; «Integrando concurrencia, modelado y testing» delante de «Build reproducible y cierre del track»). Un intercambio cada uno. Ninguno de los dos capítulos declara un solo prerrequisito en todo su texto (0 menciones de «prerrequisit»), así que mover no puede romper ninguna cadena.
- **Capítulo 15:** el más desordenado del curso. Iba Intermedio, Avanzado, Intermedio, Intermedio, Avanzado, Intermedio. Los cuatro temas de herramienta (Maven, multi-módulo, JUnit 5/Mockito, SLF4J/Logback) quedan delante y los dos Avanzado (Gradle y builds reproducibles, pruebas de integración con Testcontainers) cierran el bloque. Tampoco aquí hay prerrequisito declarado.
- **Capítulo 16:** «FetchType.LAZY, EAGER y el problema N+1» (Avanzado · 50) era el segundo tema, por delante de Relaciones, Ciclo de vida/EntityManager y Búsquedas con Criteria (los tres Intermedio · 40). Baja a la quinta posición, que es donde empieza el bloque Avanzado del capítulo.
- **Capítulo 19:** «Proxies dinámicos» (Avanzado · 45, prerrequisito «Java M19 Tema 1») iba sexto y «Internacionalización» (Intermedio · 40, prerrequisito «Java M0 Tema 8») séptimo. Se intercambian; los dos prerrequisitos siguen mirando hacia atrás porque el tema 1 no se mueve.
- **Capítulo 20:** «Function y BiFunction» (Básico · 35) estaba cuarto, por detrás de dos Intermedios («Componer sin anidar» y «Streams como composición»). Sube a la segunda posición y los temas 2 y 3 bajan un puesto; los dos temas que de verdad consumen Function —«UnaryOperator y BinaryOperator» y «Optional», que no se mueven— pasan a pedir `Java M20 Tema 2` y siguen mirando hacia atrás. La otra caída del capítulo, 11 Avanzado → 12 Intermedio, **no** se mueve: ver la excepción más abajo.

### La excepción declarada en el capítulo 20, y por qué

La primera vez que se aplicó el lote entero, la puerta de citas falló con un defecto que había creado el propio reordenado:

```
error: java/20 tema 11 línea 1461: prerrequisito abreviado que no es anterior (Tema 12)
```

El capítulo tiene 11 Avanzado · 50 («Streams paralelos»), 12 Intermedio · 40 («Pureza y efectos») y 13 Avanzado · 50 (Flow API). Para subir el nivel hasta el tema 13 había que colocar «Pureza y efectos» delante de «Streams paralelos», y eso invierte una dependencia real: el propio tema 12 declara `**Prerrequisito:** Java M20 Temas 8–11`, o sea que consume el tema de streams paralelos.

Dos salidas se descartaron por inventar una cifra:

- **Subir «Pureza y efectos» a Avanzado · 45** para que la escalera se respetara sola. Sus tres ejercicios son `map` produciendo una lista nueva, un `Consumer` que imprime después del cálculo y una `Function` aplicada dos veces: material Intermedio. La única parte avanzada es el *fallo deliberado* («cambia sus elementos dentro de un `forEach` paralelo»), que es una ilustración, no la carga del tema.
- **Estrechar su prerrequisito a «Temas 8–10»** para que el movimiento fuera legal. El fallo paralelo es parte del tema, así que el 11 sí lo es.

Se aplica la tercera: **la dependencia manda sobre la escalera**. Del capítulo 20 solo se mueve lo que no choca (Function y BiFunction a la posición 2) y los temas 11, 12 y 13 conservan su orden. La caída Avanzado → Intermedio queda **declarada en `docs/topic-order-exceptions.json`**, que es para lo que existe esa lista: un incumplimiento conocido y justificado, no una puerta aflojada. La puerta sigue fallando si el capítulo deja de necesitar la excepción, y sigue fallando para cualquier otro capítulo que la liste sin motivo.

### Ochenta y nueve números reescritos

La herramienta renumera cabeceras y remapea registros, pero no reescribe texto. Java guarda el número de un tema en tres sitios más, y todos había que moverlos con la misma permutación:

- **74 números de subtema**: las cabeceras `#### Subtema N.K` —que llevan el número viejo del tema dentro— y las veces que el propio texto menciona un subtema.
- **9 filas `Ver Tema N`** de las tablas de cierre: capítulo 0 línea 1212 (JDK vs JRE vs JVM pasa a `Ver Tema 2`), capítulo 2 líneas 556-558, capítulo 4 líneas 541-543 y capítulo 13 líneas 306 y 309.
- **6 abreviaturas `Java M20 Tema(s) N`** de los prerrequisitos del capítulo 20, donde el rango se granula y se vuelve a renderizar: `Temas 1–2` → `Temas 1 y 3` (el 2 se fue al 3), `Temas 1 y 4` → `Temas 1–2` (el 4 bajó al 2), `Tema 4` → `Tema 2` en dos temas, `Tema 3` → `Tema 4`, `Temas 3 y 8` → `Temas 4 y 8`.

Comprobado en el lector servido: los trece prerrequisitos del capítulo 20 miran todos hacia atrás (`20.5 UnaryOperator → Tema 2`, `20.6 Referencias a métodos → Temas 1–2`, `20.12 Pureza y efectos → Temas 8–11`, `20.13 Flow API → Temas 1–12`).

### Dos defectos que no era del reordenado

- **Cuatro duraciones por debajo de su propia carga.** Medido el minuto declarado contra la suma de los `#### Subtema N.K` del propio tema, cuatro temas de Java decían menos de lo que sus bloques suman: capítulo 0 temas 1, 3 y 4 (4 subtemas de 10 min = 40, declaraban 30, 30 y 35) y capítulo 18 tema 1 (45, declaraba 40). Corregidos a 40, 40, 40 y 45. Los dos primeros llevaban además su propia línea `**Duración estimada:** 30 min` dentro del cuerpo, que contradecían sus cuatro bloques de 10: esas dos líneas dicen ahora 40, para que el tema no se contradiga a sí mismo. Hecho el mismo barrido sobre los 16 cursos, **los únicos cuatro casos del repositorio eran estos**; ningún otro curso tiene esa incoherencia.
- **Un mérito interno mal atribuido.** `java/modulo-14.md:211` cerraba su Límite diciendo «por eso el Tema 1 insiste en comparar bajo carga real con JFR», pero el tema 1 de ese capítulo es «Compartir memoria requiere orden y visibilidad» y no habla de JFR: quien insiste en comparar bajo carga real es el capítulo 11 tema 2 («Java Flight Recorder y JIT compilation»). Reescrito a `el Módulo 11, Tema 2`, que el auditor ya resuelve y juzga.

## Instrumento ampliado en este lote: las dos formas de citar de Java

El auditor de citas que aportó React conocía `de este módulo` y `del Módulo 7`, y no juzgaba nada más. Java no usa casi ninguna de esas dos: cita con **abreviatura de curso** (`Java M20 Temas 8–11`, `M0 T1–T3`, `M20 Temas 9–10`) y con **filas de tabla** (`| 3 | Validar el alta | Ver Tema 4 |`). Eran la mayoría de las citas del repositorio y estaban fuera de control.

Se añadieron dos reconocedores y su juzgado (`scripts/audit_topic_citations.py`):

- `SHORT` resuelve `M<capítulo> T<tema>` con rangos y pares (`1–3`, `9–10`, `3 y 8`) dentro del mismo curso, comprueba que el tema exista y que un prerrequisito abreviado mire hacia atrás. Las citas sueltas que caen dentro de un tramo ya juzgado por `SHORT` se saltan, para no contar dos veces `Java M19 Tema 1`.
- `SEE` reconoce el `Ver`/`Mira`/`Revisa` que precede a un número de tabla y le da como alcance el capítulo propio. Estas se juzgan **solo por existencia**: una fila de tabla no dice si es prerrequisito, y adivinarlo por la posición del tema sería una puerta que falla según dónde esté el lector.

Medido, con la misma puerta y el mismo contenido:

| Forma de cita | Cantidad |
|---|---|
| `… de este módulo` | 513 |
| `… del Módulo N` / `Módulo N, Tema M` | 74 |
| `M3 T1` / `Java M19 Tema 1` (nuevo) | 148 |
| `Ver Tema N` en tablas (nuevo) | 483 |
| **Total juzgado** | **1.218** |

Pasó de **586 a 1.218 citas** y las 631 nuevas no escondían ninguna rota: 0 rotas, 1 nota (la misma de siempre, `spring-boot/26`). Y se comprobó que la ampliación detecta de verdad, con una sonda sobre una copia del capítulo 20: renumerar 11 ↔ 12 sin tocar la prosa hace fallar la puerta con `prerrequisito abreviado que no es anterior (Tema 11)`; con los dos reconocedores nuevos apagados, esa misma copia declara **0 citas y pasa**. Es decir: antes del lote, el defecto que el lote estaba a punto de cometer era invisible.

## Lo que nota el lector con Java etiquetado

- **22 de los 117 temas cambian de enlace**, todos por el reordenado y ninguno por etiquetar: 2 en el capítulo 0, 2 en el 2, 2 en el 4, 2 en el 13, 5 en el 15, 4 en el 16, 2 en el 19 y 3 en el 20. Los otros 95 conservan el suyo, incluidos los 15 capítulos que solo recibieron etiquetas. Medido comparando `topic-index.json` de antes del lote, después de etiquetar y después de reordenar: **etiquetar los 101 temas cambió 0 de 117 fragmentos**.
- Quien tuviera marcado como leído uno de esos 22 pierde esa marca; un enlace antiguo no rompe: abre la portada del capítulo.
- Nivel y duración se ven en cada cabecera del lector (`§ 20.1 Las cuatro formas: Predicate, Function, Consumer y Supplier · Básico · 30 min`), y la portada del capítulo lista los temas en el orden nuevo.

## Verificación del sexto lote

- `python3 scripts/audit_topic_order.py --check` → salida 0: **1.420 temas, 907 sin nivel declarado, 1 módulo con incidencias**. Java pasa de 16 a 117 temas etiquetados (1.008 → 907 sin declarar en todo el repositorio). Sus 23 capítulos cumplen la numeración continua; 22 cumplen las dos reglas y el capítulo 20 está declarado por el motivo de arriba.
- `python3 scripts/audit_topic_citations.py --check` → salida 0: **1.218 citas, 0 rotas, 1 nota**.
- Integridad de los cuerpos: comparado cada capítulo contra la copia previa al lote, normalizando dígitos y quitando el sufijo ` · Nivel · XX min`, el multiset de líneas es idéntico salvo **dos líneas del capítulo 20**, que son las dos reescrituras de rango previstas (`Temas 1–2` → `Temas 1 y 3` y `Temas 1 y 4` → `Temas 1–2`). Ninguna frase perdida ni reescrita fuera de los números.
- Registros: `docs/topic-learning-quality.json` tiene sus **117 filas de Java sincronizadas con la cabecera real** (52 estaban desactualizadas; 0 desajustes al comprobar) y `specs/visual-aids-scope.json`, sin cambios: Java solo tiene 6 entradas en el alcance (capítulos 9, 14, 18 y 19) y ninguna cae sobre un tema movido; las dos del capítulo 19 viven en los temas 8 y 9, que bajo la permutación de ese capítulo conservan su puesto. Por eso el script de reordenado informó **0 entradas movidas** en los ocho capítulos, y el archivo salió byte a byte idéntico. Regenerados `topic-index.json` (86 líneas distintas), `curriculum-stacks/java.json`, `zero-to-master` y `master-prompt-compliance`; `curriculum-catalog.json` se volvió a calcular y salió idéntico, porque no guarda el número de tema dentro del capítulo. Total intacto: **16 rutas · 289 módulos · 1.420 temas**.
- `./scripts/validate.sh` → salida 0 con las dos puertas de orden enganchadas. `validate_specs`: 43 criterios, 36 `hecho` y 7 `pendiente`; Java no cierra ningún criterio nuevo del prompt maestro.
- Navegador sobre el servidor de desarrollo (puerto 4213): `/curso/java/20` lista la portada con el orden nuevo (01 Las cuatro formas, 02 Function y BiFunction, 03 Componer sin anidar, 04 Streams como composición, 05 UnaryOperator…) y `/curso/java/20/tema/2` despliega el tema movido con sus `Subtema 2.1/2.2/2.3` ya renumerados; `/curso/java/15/tema/6` muestra la escalera Intermedio · 40, Intermedio · 40, Intermedio · 40, Intermedio · 40, Avanzado · 45, Avanzado · 45 con el tema 15.6 abierto y sus listados numerados. Cero `.lesson-error` y consola limpia salvo el aviso conocido de saneado de HTML de Angular. Capturas: `/tmp/java_lector_cap20.png` y `/tmp/java_lector_cap15.png`.
- No se corrió `npm run build` ni la suite de Playwright en este lote: lo único que cambió son archivos Markdown de contenido y un script Python de auditoría; el lector vuelve a leer el mismo `modulo-N.md` por ruta, y la verificación de arriba es sobre el servidor de desarrollo real. La suite sigue teniendo la misma prueba fallida de siempre (salida del modo libro en móvil).

## Cómo revertir el sexto lote

Inversas verificadas (aplicar el orden del lote y luego su inversa devuelve la numeración original): capítulo 0 `1,3,2,4,5,6,7,8` (es su propia inversa) · capítulo 2 `1,3,2` (igual) · capítulo 4 `1,2,4,3` (igual) · capítulo 13 `1,3,2` (igual) · capítulo 15 `1,5,2,3,6,4` · capítulo 16 `1,5,2,3,4,6,7,8` · capítulo 19 `1,2,3,4,5,7,6,8,9` (igual) · capítulo 20 `1,3,4,2,5,6,7,8,9,10,11,12,13`.

Ejemplo: `python3 scripts/reorder_track_topics.py --track java --module 15 --order 1,5,2,3,6,4 --apply`. Después hay que deshacer a mano los 89 números de arriba (los `#### Subtema N.K`, las nueve filas `Ver Tema` y las seis abreviaturas `Java M20 …` vuelven a los números viejos), quitar las 101 etiquetas nuevas devolviendo cada cabecera a su texto sin ` · Nivel · XX min` salvo las dieciséis originales, devolver las cuatro duraciones (capítulo 0 temas 1, 3 y 4 a 30/30/35 y capítulo 18 tema 1 a 40, con las dos líneas `Duración estimada` del capítulo 0 otra vez en 30), y vaciar `docs/topic-order-exceptions.json`. El `Módulo 11, Tema 2` del capítulo 14 es una corrección de texto, no de orden: se queda. El auditor ampliado tampoco se revierte, es herramienta. Cerrar con los generadores y `./scripts/validate.sh`.

## Séptimo lote: Flutter, un curso completo (119 temas)

Flutter son **23 capítulos y 119 temas**, con diez etiquetas puestas de antes. Igual que en los seis lotes previos, el trabajo mayoritario es leer el objetivo, el `Prerrequisitos` y la carga real de cada tema y declararle nivel y duración: **109 etiquetas nuevas, 10 que ya estaban y se dejaron byte a byte como estaban, 0 niveles existentes subidos ni bajados**. Reparto final: 4 Básico, 50 Intermedio, 62 Avanzado, 3 Experto; duraciones 30 min (20 temas), 35 (48), 40 (36), 45 (12) y 50 (3).

Las diez etiquetas previas viven en el capítulo 0 (temas 5, 6 y 7), el capítulo 1 (temas 4 y 5), el capítulo 6 (tema 5), el capítulo 7 (temas 5 y 6), el capítulo 11 (tema 5) y el capítulo 12 (tema 4). **Ninguno de esos seis capítulos se reordenó en este lote**, así que las diez cabeceras podían salir intactas; medido cabecera por cabecera contra su texto previo: 10 previas, 0 alteradas.

Los dos extremos del reparto son los que hay que mirar, porque son los que más fácil se inflan:

- **Cuatro Básico**, todos el primer tema de su capítulo y ninguno con prerrequisito interno: «Sound null safety» (capítulo 0) solo pide el SDK instalado, y «StatelessWidget vs StatefulWidget» (capítulo 1), «shared_preferences» (capítulo 6) y «ThemeData con Material 3» (capítulo 10) piden cada uno el capítulo anterior completo («Módulo 0 completo», «Módulo 5 completo», «Módulo 9 completo»), que es un prerrequisito entre capítulos, no dentro de uno.
- **Tres Experto**: «Add-to-app» (capítulo 7 tema 6, que ya lo estaba), «propiedad de memoria, liberación y errores» (capítulo 16 tema 6, donde el tema trata de que el GC de Dart no libera lo que asignaste en C) y «validación de transacciones en servidor» (capítulo 21 tema 6, el único del curso que exige verificar una compra contra la tienda desde un backend). Ningún otro tema del curso llega a Experto.

### Los cinco capítulos reordenados

Con las etiquetas puestas, **cinco de los veintitrés capítulos incumplían la regla de nivel** y se reordenaron; los dieciocho restantes solo recibieron etiquetas. En total **12 de los 119 temas cambian de número**. La lista dice «en la posición nueva i pongo el tema que entonces llevaba el número orden[i]».

| Capítulo | Orden aplicado | Dónde caía el nivel (numeración vieja) |
|---|---|---|
| 14 «Flutter para entregas: mapas, GPS y tiempo real» | `1,2,4,3,5,6` | 3 Avanzado → 4 Intermedio |
| 19 «Flutter para entregas: mapa, conexión y trabajo offline» | `1,2,4,3,5,6` | 3 Avanzado → 4 Intermedio |
| 20 «Flutter Master: pruebas, arquitectura y release» | `1,5,2,3,4,6` | 4 Avanzado → 5 Intermedio |
| 21 «Flutter IAP: compras y suscripciones» | `1,2,3,5,4,6` | 4 Avanzado → 5 Intermedio |
| 22 «Flutter Ads: anuncios, mediación y privacidad» | `1,2,3,5,4,6` | 4 Avanzado → 5 Intermedio |

Las cadenas que motivan cada movimiento, leídas del contenido:

- **Capítulo 14:** «Socket.IO y actualización de rutas» (Avanzado · 40) era el tema 3 y «Animaciones de localización» (Intermedio · 30) el 4. Intercambio. Lo que decide el nivel: el de animaciones interpola la posición y el rumbo de un marcador entre dos muestras de GPS, que es trabajo de widget; el de Socket.IO aplica un `JourneyEventReducer` que descarta eventos duplicados o fuera de secuencia, que es trabajo de estado. **Los seis temas del capítulo declaran el mismo prerrequisito externo** («Flutter estable, Dart y un dispositivo o emulador; confirma `flutter doctor`») y ningún número de tema, así que mover no puede romper ninguna cadena: verificado con un barrido del archivo, 0 citas numéricas en todo el capítulo.
- **Capítulo 19:** mismo caso, mismos números (`1,2,4,3,5,6`). «posiciones en tiempo real con Socket.IO» (Avanzado · 35) iba tercero y «animar el marcador sin saltos» (Intermedio · 30) cuarto. Sus dos prerrequisitos son externos —«streams y HTTP» y «`AnimationController`, `Tween` y coordenadas»—, ninguno cita un tema del capítulo, así que el intercambio no invierte ninguna dependencia.
- **Capítulo 20:** «internacionalización y formatos locales» (Intermedio · 35) era el tema 5, en medio de cuatro Avanzado. Sube a la segunda posición, justo detrás del otro Intermedio («pruebas unitarias y de widget», el arranque del capítulo), y los temas 2, 3 y 4 bajan un puesto. Su prerrequisito es externo («MaterialApp, locale y assets»), y los cuatro Avanzado que baja no citan números propios: el capítulo no tiene ni una sola cita interna que mover.
- **Capítulo 21:** «restauración de compras y entitlement» (Avanzado · 35) iba cuarto y «pruebas de IAP en sandbox» (Intermedio · 30) quinto. Se intercambian. Los dos prerrequisitos apuntan al catálogo del tema 1 —«listener de compra, backend y diferencias entre consumible/no consumible» y «productos creados, app id correcto y listener»— y el tema 1 no se mueve, así que los dos siguen mirando hacia atrás. Probar en sandbox lo que ya construiste va antes que recalcular entitlements.
- **Capítulo 22:** «consentimiento, privacidad y audiencias» (Avanzado · 35) cuarto e «pruebas de anuncios y diagnóstico de no-fill» (Intermedio · 30) quinto. Se intercambian, y aquí es donde el movimiento toca la prosa: ver el apartado siguiente.

### Los dos números reescritos, y un defecto que ya estaba

El reordenado renumera cabeceras y remapea registros, pero no reescribe texto. Flutter guarda el número de un tema dentro de la prosa en **dos sitios**, y ambos vivían en los capítulos movidos:

- `web/public/content/flutter/modulo-22.md:408` — el tema 6 decía `**Prerrequisitos:** temas 2 y 5.` El tema 5 viejo (pruebas de anuncios) pasó a ser el 4, así que la frase dice ahora `temas 2 y 4.` Los dos siguen siendo anteriores al 6. Es la única cita interna del capítulo que el intercambio afectaba: la del nuevo tema 4 («temas 1 y 2») sigue siendo correcta sin tocarla, porque los temas 1 y 2 no se movieron.
- `web/public/content/flutter/modulo-21.md:336` — el tema 6 cerraba su prerrequisito con `… y Módulo 10 de producción.`, y **eso ya era falso antes de este lote**: el capítulo 10 de Flutter es «Theming, accesibilidad y Material/Cupertino», no producción; los dos capítulos de producción del curso son el 13 y el 18. Buscado en el historial con `git log -S`, la referencia equivocada entró con el commit que creó los capítulos de compras y anuncios, así que nunca fue válida. Reescrito a `… y los dos módulos de producción de este curso (13 y 18).`

Ninguna de las dos la juzga la puerta de citas, y conviene decir por qué, porque es una zona ciega real: la primera la reconoce el patrón de números (`Temas 2` + `y 4`), pero al no llevar alcance —ni `de este módulo`, ni `del Módulo N`, ni `Ver`, ni abreviatura de curso— el auditor la salta por diseño en `scripts/audit_topic_citations.py:155`, porque una cifra sin cualificar puede pertenecer a otro curso. La segunda no es una cita de tema: nombra dos capítulos. Las dos se corrigieron a mano y se verificaron en el lector servido, no en la puerta.

Como la puerta no las ve, **el barrido de las siete citas sin cualificar de los cinco capítulos movidos se hizo a mano** (los capítulos 14, 19 y 20 no tienen ninguna): tres en el capítulo 21 y cuatro en el 22. Seis apuntan al tema 1 o a los temas 1 y 2, que en las dos permutaciones conservan su puesto, así que siguen siendo válidas sin tocarlas. La séptima es la que había que reescribir.

### Cero excepciones declaradas

A diferencia del lote de Java, **ninguna caída de Flutter choca con una dependencia real**, así que `docs/topic-order-exceptions.json` sigue con una sola entrada (`java/20`) y no se añadió ninguna. Las cinco caídas se resolvieron todas moviendo contenido, no aflojando la puerta.

## Lo que nota el lector con Flutter etiquetado

- **12 de los 119 temas cambian de enlace**, todos por el reordenado y ninguno por etiquetar: 2 en el capítulo 14, 2 en el 19, 4 en el 20, 2 en el 21 y 2 en el 22. Los otros 107 conservan el suyo, incluidos los 18 capítulos que solo recibieron etiquetas. Medido comparando `topic-index.json` de antes del lote con el de después: **los 12 fragmentos distintos son exactamente los 12 temas renumerados**, así que las 109 etiquetas nuevas cambiaron 0 enlaces.
- Quien tuviera marcado como leído uno de esos 12 pierde esa marca; un enlace antiguo no rompe: abre la portada del capítulo.
- Nivel y duración se ven en cada cabecera del lector (`§ 22.4 pruebas de anuncios y diagnóstico de no-fill · Intermedio · 30 min`) y la portada del capítulo lista los temas en el orden nuevo.

## Verificación del séptimo lote

- `python3 scripts/audit_topic_order.py --check` → salida 0: **1.420 temas, 798 sin nivel declarado, 1 módulo con incidencias**. Flutter pasa de 10 a 119 temas etiquetados (907 → 798 sin declarar en todo el repositorio). Sus 23 capítulos cumplen la numeración continua y los cinco reordenados cumplen además la escalera de nivel; ningún capítulo de Flutter está declarado como excepción.
- `python3 scripts/audit_topic_citations.py --check` → salida 0: **1.218 citas numéricas en 289 capítulos, 0 rotas, 1 nota** (la misma de siempre, `spring-boot/26`).
- Integridad de los cuerpos: comparado cada capítulo contra la copia previa al lote, normalizando dígitos y quitando el sufijo ` · Nivel · XX min`, **18 capítulos son idénticos línea por línea**; en los cinco reordenados, los capítulos 14, 19 y 20 reproducen exactamente el multiset de líneas anterior (solo cambian sus cabeceras) y los capítulos 21 y 22 difieren en **una línea cada uno**, que son las dos reescrituras de arriba. Ninguna frase perdida ni reescrita fuera de los números.
- Registros: `docs/topic-learning-quality.json` actualiza **110 de las 119 filas de Flutter** — 109 ganan el sufijo ` · Nivel · XX min` que les faltaba, la del capítulo 1 tema 5 corregía su nivel (la fila decía Intermedio y la cabecera real dice Avanzado · 40) y la del capítulo 12 tema 3 corregía el título (decía «Cierre del track» y la cabecera real es «Retrospectiva del proyecto integrador»). Al comprobar fila por fila contra la cabecera servida: **0 desajustes**. `specs/visual-aids-scope.json`, **byte a byte idéntico**: Flutter tiene 13 entradas en el alcance y viven en los capítulos 0, 1, 5, 6, 7, 11, 12 y 15, ninguno reordenado; el script de reordenado informó 0 entradas movidas en los cinco capítulos. Regenerados `topic-index.json` y `curriculum-stacks/flutter.json`; `curriculum-catalog.json` no cambia porque no guarda el número de tema dentro del capítulo. Total intacto: **16 rutas · 289 módulos · 1.420 temas**.
- `./scripts/validate.sh` → salida 0 con las dos puertas de orden enganchadas. `validate_specs`: 43 criterios, 36 `hecho` y 7 `pendiente`; Flutter no cierra ningún criterio nuevo del prompt maestro.
- Navegador sobre el servidor de desarrollo (puerto 4214): `/curso/flutter/20` lista la portada con el orden nuevo (01 pruebas unitarias y de widget, 02 internacionalización y formatos locales, 03 golden e integración, 04 perfilado y presupuesto de rendimiento, 05 Clean Architecture, 06 builds por plataforma) y su ancla `#tema-2-internacionalizacion-y-formatos-locales` resuelve; `/curso/flutter/21` muestra 04 pruebas de IAP en sandbox y 05 restauración de compras; `/curso/flutter/22/tema/6` despliega el tema con la línea ya corregida («Prerrequisitos: temas 2 y 4.») y su escalera `Intermedio · 40 / Intermedio · 30 / Intermedio · 35 / Intermedio · 30 / Avanzado · 35 / Avanzado · 35`; `/curso/flutter/21/tema/6` muestra «backend HTTP autenticado, storage transaccional y los dos módulos de producción de este curso (13 y 18)». Cero `.lesson-error` y consola limpia (solo el `vite connecting` y el aviso de modo desarrollo de Angular).

## Cómo revertir el séptimo lote

Inversas verificadas (aplicar el orden del lote y luego su inversa devuelve la numeración original; se comprobó componiendo las dos permutaciones): capítulo 14 `1,2,4,3,5,6` (es su propia inversa) · capítulo 19 `1,2,4,3,5,6` (igual) · capítulo 20 `1,3,4,5,2,6` · capítulo 21 `1,2,3,5,4,6` (igual) · capítulo 22 `1,2,3,5,4,6` (igual).

Ejemplo: `python3 scripts/reorder_track_topics.py --track flutter --module 20 --order 1,3,4,5,2,6 --apply`. Después hay que deshacer a mano los dos números de arriba (el `temas 2 y 4` del capítulo 22 vuelve a `temas 2 y 5`) y quitar las 109 etiquetas nuevas devolviendo cada cabecera a su texto sin ` · Nivel · XX min`, salvo las diez originales (capítulo 0 temas 5, 6 y 7; capítulo 1 temas 4 y 5; capítulo 6 tema 5; capítulo 7 temas 5 y 6; capítulo 11 tema 5; capítulo 12 tema 4). Las tres cabeceras `#### Subtema 1.1/1.2/1.3` del capítulo 19 son el único formato de subtema que existe en el curso y viven en el tema 1, que no se movió: no hay que tocarlas. La corrección del capítulo 21 (`los dos módulos de producción de este curso (13 y 18)`) **no se revierte**: era un enlace falso a un capítulo que no trata de producción, no una consecuencia del orden. Cerrar con los generadores y `./scripts/validate.sh`.

## Octavo lote: Spring Boot, un curso completo (121 temas)

Spring Boot son **27 capítulos y 121 temas**, con nueve etiquetas puestas de antes. El lote declara las **112 que faltaban**: 112 etiquetas nuevas, 9 que ya estaban y se dejaron byte a byte como estaban, **0 niveles existentes subidos ni bajados**. Reparto final: 3 Básico, 40 Intermedio, 72 Avanzado, 6 Experto. Duraciones: 25 min (4 temas), 30 (33), 35 (38), 40 (28), 45 (11), 50 (5), 1 h 20 (1) y 1 h 30 (1).

Las nueve etiquetas previas son el tema 4 de los capítulos 0, 3, 5, 7, 8 y 11, el tema 3 de los capítulos 18 y 26 y el tema 1 del capítulo 26. Ocho de las nueve viven **al final de su capítulo**, que es la posición del tema que cierra el capítulo; esa coincidencia es la que explica el resultado más llamativo del lote (abajo).

Medido contra `HEAD`: el diff de contenido son **112 líneas añadidas y 112 quitadas en 26 archivos** (el capítulo 26 no aparece porque sus dos temas ya estaban etiquetados). Y quitando el sufijo de cada cabecera, **los 27 capítulos son idénticos línea por línea**: no hubo ni una sola frase que reescribir.

### Las duraciones no se eligieron: se midieron

**111 de los 121 temas** reparten su tiempo en sus propias cabeceras `#### Subtema … · NN min`. La regla del lote es sumar esos minutos y redondear **hacia arriba** al múltiplo de 5 siguiente —hacia abajo estaría prohibido, porque un tema no puede declarar menos tiempo que la suma de sus partes—.

Esa regla no es una preferencia mía: **reproduce el número que el propio contenido ya declaraba en los 33 sitios donde los dos existen.**

- 16 temas escriben `**Duración estimada:** NN min.` en su cuerpo. La suma de sus subtemas coincide **con las 16, exacta, sin redondear** (capítulo 8 temas 1 a 8: 35, 35, 50, 45, 45, 45, 50, 50; capítulo 10 tema 1: 35; capítulo 21 temas 1 a 3: 25, 30, 30; capítulo 25 temas 1 a 4: 25, 30, 30, 25).
- 17 temas declaran un intervalo en la prosa del prerrequisito (`Duración: 30–40 min`, `35–45`, `45–60`, `40–50`, `35–40`). La suma redondeada cae **dentro de los 17 intervalos** (capítulo 10 temas 10, 11 y 12: 38→40, 42→45, 40 dentro de 35–45; capítulo 11 temas 1, 2 y 3: 40, 49→50, 40; capítulo 20 temas 5, 7 y 8: 34→35, 35, 36→40; capítulos 23 y 24, sus ocho temas: 30 dentro de 30–40).

Los diez temas sin minutos en subtemas son los nueve ya etiquetados (se quedaron con su número) y **uno solo**, el tema 9 del capítulo de integraciones: «Model Context Protocol con Spring AI». No tiene subtemas —es el único tema del curso que usa `#### Paso 1…7`— ni declara duración. Se le puso **40 min** midiendo su volumen contra sus ocho hermanos de capítulo: 8.984 caracteres y 8 bloques de código, frente a los 9.184 caracteres y 8 bloques del tema 5, que declara 35–40 y suma 34. Es el único número del lote que no sale de la boca del propio tema, y por eso se nombra aquí.

### Cero capítulos reordenados, y por qué no es una excusa

Con las 121 etiquetas puestas, `audit_topic_order.py` no encuentra **ninguna escalera invertida en los 27 capítulos**. El curso se autoría ya escalonado y las etiquetas lo confirman en vez de desmentirlo. La escalera queda así (B = Básico, I = Intermedio, A = Avanzado, E = Experto; el número es la duración medida):

| Capítulo | Orden de nivel y duración |
|---|---|
| 0 · Fundamentos de Spring | B·30 → I·30 → I·35 → I·45 |
| 1 · CLI y estructura | B·30 → B·30 → I·35 |
| 2 · REST con Spring Web | I·35 → I·35 → I·40 → I·35 → A·40 → A·40 |
| 3 · Spring Data JPA | I·30 → I·35 → I·30 → I·45 |
| 4 · Spring Security | I·30 → I·30 → I·30 → A·30 → A·30 |
| 5 · Configuración y errores | I·30 → I·30 → I·30 → A·35 |
| 6 · Testing | I·30 → A·30 → A·30 |
| 7 · Actuator | I·30 → I·30 → I·25 → I·40 |
| 8 · Mensajería Kafka/RabbitMQ | I·35 → I·35 → A·50 → A·45 → A·45 → A·45 → A·50 → A·50 → A·40 → A·45 |
| 9 · WebFlux | I·40 → A·40 → A·40 |
| 10 · Spring Cloud | I·35 → I·35 → I·30 → A·45 → A·40 → A·40 → A·35 → A·45 → A·45 → A·40 → A·45 → A·40 |
| 11 · Empaquetado y despliegue | I·40 → A·50 → A·40 → A·40 |
| 12 · Proyecto integrador | A·40 → A·40 → E·35 |
| 13 · Consistencia distribuida | A·35 → A·40 → A·35 → A·40 |
| 14 · Backend de entregas | I·35 → A·35 → A·35 → A·35 → A·40 → A·40 |
| 15 · Spring Master | A·35 → A·35 → A·35 → A·35 → A·35 → A·35 → E·35 → E·35 |
| 16 · JPA: Hibernate y N+1 | I·40 → A·35 |
| 17 · JDBC y transacciones | I·35 → A·35 |
| 18 · Backend seguro | A·35 → A·40 → E·50 |
| 19 · Spring Batch | I·35 → A·40 |
| 20 · Integraciones | I·35 → I·40 → A·40 → A·45 → A·35 → A·30 → A·35 → A·40 → A·40 |
| 21 · Eventos con Kafka | I·25 → A·30 → A·30 |
| 22 · Arquitectura | A·35 → A·35 → E·35 |
| 23 · Spring Modulith | A·30 → A·30 → A·30 → A·30 |
| 24 · Spring GraphQL | I·30 → A·30 → A·30 → A·30 |
| 25 · Cloud Stream | I·25 → I·30 → A·30 → A·25 |
| 26 · Concurrencia avanzada | A·80 → E·90 |

Cero reordenados es un resultado que hay que ponerse a dudar, porque en los seis lotes anteriores hubo (3, 4, 6, 8, 5 y 10 capítulos). La sospecha legítima es que hubiera subido o bajado un nivel para que cuadrara. Dos capítulos son los únicos donde una etiqueta previa **impone el techo** del capítulo, y son los que revisé a fondo antes de dar el resultado por bueno:

- **Capítulo 3 (Spring Data JPA).** Su tema 4, «Spring Data MongoDB: documentos, consultas derivadas y cuándo elegir un modelo de documentos», está declarado Intermedio desde antes, así que ningún tema anterior puede pasar de Intermedio. El que tentaba era el tema 2, «El problema N+1 y su corrección». Leídas sus tres partes —relacionar clientes y pedidos y medir, cargar la relación con `JOIN FETCH`, elegir `@EntityGraph` y revisar el límite— el tema **presenta** el problema con dos herramientas concretas sobre el proyecto que el lector ya tiene; no decide nada por pantalla. La versión que sí mide y decide («LAZY, EAGER, N+1 y consultas de caso de uso», con «Pide el cliente que esta pantalla necesita») es el tema 2 del capítulo 16, y ahí sí se declaró Avanzado. Los dos son el mismo asunto en dos profundidades distintas, y la diferencia está en el texto, no en la comodidad.
- **Capítulo 7 (Actuator).** Su tema 4, «Logging en Spring Boot», también está declarado Intermedio de antes. El que tentaba era el tema 3, «Liveness y readiness sin reinicios en cadena»: habilitar las sondas (5 min), revisar la dependencia solo en readiness (10) y probar estados distintos (10) — 25 min dentro de un servicio. La consecuencia de despliegue, que es lo que lo haría Avanzado, vive en el tema 3 del capítulo 11 («conectar Actuator con el Deployment», «evita reinicios en cascada», 40 min), y allí se declaró Avanzado.

En los otros 25 capítulos no hay techo previo que respetar, así que el nivel salió solo del texto. Los tres extremos:

- **Tres Básico**: el tema 1 del capítulo de fundamentos (declarar una interfaz, escribir una implementación y ver Spring conectarlas; su propio texto pide «clases, interfaces y constructores de Java» y nada más) y los temas 1 y 2 del capítulo de herramienta y configuración (generar el proyecto y encontrar sus piezas; leer una clave en YAML y en Properties y ver cuál gana desde la terminal).
- **Cuatro Experto nuevos sobre los dos que había**: el tema 3 del capítulo integrador, porque su entrega es separar lo comprobado en local de lo que aún pide evidencia del entorno y dejar la ruta técnica siguiente; los temas 7 y 8 del capítulo Master, el primero porque trabaja sobre la compensación que **falla** (conservar el pendiente, confirmar efecto y estado juntos, reabrir sin duplicar, delimitar la recuperación) y el segundo porque el caso de uso manda sobre el framework; y el tema 3 del capítulo de arquitectura, donde se escriben tres registros de decisión con alternativas y consecuencias y un script que falla si falta alguna. Los dos previos son el tema 3 del capítulo de backend seguro (federación SAML con el proveedor de identidad de una empresa) y el tema 2 del capítulo de concurrencia (deadlocks y MDC).

### Deuda que se vio en el lector al comprobar el lote

Las líneas de prerrequisito de **36 frases en 11 capítulos** de Spring Boot —y **95 en todo el programa**— escriben los prerrequisitos con la notación `M8 T1 y M8 T2`. En el lector servido se ve literalmente así: «Prerrequisitos: M8 T1 y M8 T2. Proyecto continuo: guardar un envío, publicar su evento y procesarlo sin duplicar la proyección». Un alumno que no conozca la abreviatura no puede seguir ese enlace, y es justo la notación que el dueño del proyecto rechazó para hablar del curso. El auditor de citas sí la entiende (`scripts/audit_topic_citations.py` la reconoce como forma corta), así que la puerta no la señala: es un defecto de redacción, no de referencia. Reescribirlas a «los dos primeros temas de este capítulo» es un lote aparte, y hay que decidir el wording antes porque toca 95 líneas de dieciséis cursos.

## Lo que nota el lector con Spring Boot etiquetado

- **0 de los 121 temas cambian de enlace.** No hubo reordenado, y etiquetar no lo mueve nunca: `scripts/build_web_topic_index.py:63` y `web/src/app/course/lesson-viewer.ts:84` recortan el sufijo ` · Nivel · XX min` antes de calcular el fragmento. Medido, no deducido: regenerado el índice, **`web/public/content/topic-index.json` sale byte a byte idéntico** al de antes del lote, y lo mismo `curriculum-catalog.json`, `curriculum-stacks/spring-boot.json`, `docs/zero-to-master.md` y `docs/master-prompt-compliance.md`.
- Lo que sí se ve es la etiqueta en cada cabecera del lector: `§ 0.1 Inversión de control y el contenedor de Spring · Básico · 30 min`, `§ 8.3 Transacciones Kafka y SQL: idempotencia y límites de exactly-once · Avanzado · 50 min`. En el tema 3 del capítulo de mensajería la cabecera y el cuerpo dicen lo mismo («Duración estimada: 50 min.»), que es la comprobación visible de la regla de arriba.
- El orden de lectura no cambia para nadie: los 121 temas siguen numerados como estaban.

## Verificación del octavo lote

- `python3 scripts/audit_topic_order.py --check` → salida 0: **1.420 temas, 686 sin nivel declarado, 1 módulo con incidencias**. Spring Boot pasa de 9 a 121 temas etiquetados (798 → 686 sin declarar en todo el repositorio; −112, exacto). Su única incidencia en el auditor es la ajena: `java/20`, la excepción declarada del sexto lote.
- `python3 scripts/audit_topic_citations.py --check` → salida 0: **1.218 citas numéricas en 289 capítulos, 0 rotas, 1 nota**, la misma nota de siempre (`spring-boot/26 tema 1`, una cita hacia adelante que avisa). Como el lote no movió ningún tema, no había nada que recalcular; las 36 citas `M<N> T<N>` del curso siguen apuntando a su tema.
- Integridad de los cuerpos: comparado cada uno de los 27 capítulos contra `HEAD` y **normalizando solo el sufijo de las cabeceras, los 27 son idénticos línea por línea**. 0 frases reescritas, 0 números que mover.
- Registros: `docs/topic-learning-quality.json` actualiza **112 de las 121 filas de Spring Boot** (las que ganaron el sufijo; las nueve previas ya coincidían con su cabecera). Comprobado fila por fila contra la cabecera real, emparejando por módulo y número de tema y no por posición: **0 desajustes**. `specs/visual-aids-scope.json`, **byte a byte idéntico** (indexa por número de tema y ningún número se movió). Total intacto: **16 rutas · 289 módulos · 1.420 temas**.
- `./scripts/validate.sh` → **salida 0**. `validate_lesson_labs`: 59 laboratorios citados y presentes. `audit_visual_aids`: 109 temas en alcance, 0 problemas, 80 capturas pendientes (deuda previa de devops, cloud, ios, flutter y kotlin, no de este lote). `validate_specs`: 43 criterios, 36 `hecho` y 7 `pendiente`.
- Navegador sobre el servidor de desarrollo (puerto 4214): `/curso/spring-boot/0/tema/1` muestra la cabecera con `· Básico · 30 min`; `/curso/spring-boot/8/tema/3` muestra `§ 8.3 … · Avanzado · 50 min` y debajo su propia «Duración estimada: 50 min.»; consola sin errores (solo el `vite connecting`, el aviso de modo desarrollo y el aviso previo de saneado de HTML de Angular, que aparece en todas las rutas). Capturas guardadas en `visualizations/springboot-cap0-tema1.png` y `visualizations/springboot-cap8-tema3.png`.

## Cómo revertir el octavo lote

No hay permutación que deshacer —el lote no movió ningún tema—. Revertir es quitar el sufijo a las 112 cabeceras que lo ganaron y devolver esas 112 filas del registro a su texto sin sufijo:

1. Quitar de cada `### Tema N:` de `web/public/content/spring-boot/` el ` · Nivel · XX min` **salvo** en las nueve cabeceras previas (tema 4 de los capítulos 0, 3, 5, 7, 8 y 11; tema 3 de los capítulos 18 y 26; tema 1 del capítulo 26).
2. `python3 scripts/build_web_topic_index.py && python3 scripts/build_curriculum_catalog.py && python3 scripts/build_zero_to_master_report.py && python3 scripts/audit_track_master_prompt.py`, y sincronizar las filas del registro como hizo el lote.
3. `./scripts/validate.sh` — el auditor de orden debe volver a reportar **798 sin nivel declarado**.

## Deuda que queda

- **686 de los 1.420 temas (48 %) siguen sin nivel ni duración declarados.** Tras Spring Boot, ocho cursos están completos: Node.js (78/78), Microservicios (24/24), JavaScript (92/92), React (64/64), iOS (69/69), Java (117/117), Flutter (119/119) y Spring Boot (121/121). Los otros ocho: Cloud 12/168, DevOps 9/139, Android 10/83, Kotlin Multiplatform 10/66, Angular 7/78, Fundamentos 2/103, control-1 0/70, rutaflow 0/29.
- El patrón de los ocho lotes es el que queda para los ocho cursos restantes: **etiquetar desde el propio texto y luego ordenar**, curso por curso. Etiquetar no mueve ni un enlace (`scripts/build_web_topic_index.py:63` y `web/src/app/course/lesson-viewer.ts:84` recortan el sufijo antes de calcular el fragmento): en React 10 de 64, en JavaScript 31 de 92, en iOS 18 de 69, en Java 22 de 117 y en Flutter 12 de 119 cambiaron, y en los cinco casos la cifra es exactamente el número de temas renumerados. Spring Boot es el primer lote en que esa cuenta da **0**, porque la escalera ya se cumplía en sus 27 capítulos.
- **Sigue habiendo una sola excepción declarada en toda la historia del programa**: `docs/topic-order-exceptions.json` lista `java/20` con el motivo escrito en el sexto lote (la escalera de nivel choca con el prerrequisito `Temas 8–11` del tema 12). Flutter no añadió ninguna: sus cinco caídas se resolvieron todas moviendo contenido. Spring Boot tampoco necesitó ninguna. Los otros siete cursos completos siguen sin incidencias declaradas.
- El siguiente candidato natural es **DevOps** (9/139), y Cloud (12/168) queda para el final por tamaño.
- **Deuda propia de Flutter que deja vista este lote:** el capítulo 19 («Flutter para entregas: mapa, conexión y trabajo offline») construye todo su tema 1 sobre un proyecto prefabricado que ya está en el repositorio. Son **seis líneas del único archivo** (`web/public/content/flutter/modulo-19.md` líneas 5, 14, 22, 44, 66 y 91) que llaman «Proyecto continuo: `examples/flutter_rutaflow/`» y mandan al lector a abrir `shift_provider.dart` y su prueba en vez de escribirlos; las tres cabeceras `#### Subtema 1.1/1.2/1.3` del curso viven ahí. Son las **6 únicas menciones a `examples/` en los 23 capítulos** del curso y choca con la regla de que cada tema se hace desde cero en una carpeta vacía. El resto del curso ya cumple: 13 temas declaran explícitamente `Ejemplo independiente: … flutter create <algo>_lab` y ninguno más remite a código ajeno. Queda decidir si se reescribe el tema 1 del capítulo 19 hacia un proyecto propio del lector y qué se hace con el directorio.
- **La misma deuda, en su versión grande, la deja vista Spring Boot.** **370 menciones a `examples/` repartidas en sus 26 capítulos**, que apuntan a **53 directorios prefabricados distintos** (47 de ellos `spring-*-rutaflow`), los 53 presentes en el repositorio. No son un caso aislado como el de Flutter: son la forma en que el curso entero plantea la práctica («**Laboratorio:** `examples/spring-kafka-rutaflow/`. Usa la copia del tema 1 de este capítulo»). Contradice la regla del dueño —cada tema desde cero, en carpeta vacía, con el código escrito a mano— y su arreglo es un lote de reescritura pedagógica, no de orden. La puerta `validate_lesson_labs` mide hoy lo contrario de lo que habría que medir: aprueba que los **59 directorios** que hay en `examples/` estén todos citados por alguna lección (los 53 de Spring Boot son una parte de esos 59; el resto los citan Node, Java, Flutter y los demás), así que mientras más laboratorios prefabricados se escriban, más verde sale.
- **Deuda de redacción que el auditor de citas no puede señalar: la notación `M8 T1`.** **95 líneas en 4 cursos** escriben prerrequisitos y «siguiente tema» con esa abreviatura, 36 de ellas en 11 capítulos de Spring Boot. Es el formato que el dueño del proyecto rechazó explícitamente para hablar del curso, y un alumno que no la conoce no puede seguir el enlace. El reconocedor la acepta como referencia válida (`scripts/audit_topic_citations.py`, forma corta), así que la puerta está ciega: el defecto es de legibilidad, no de exactitud. Los 45 casos de Microservicios van entre paréntesis y después del título, que es la forma menos dañina; los de Spring Boot van solos, en la frase de prerrequisito. Reescribir las 95 es un lote aparte y hay que fijar antes el wording.
- **Deuda que el auditor de citas deja vista y no gatea:** (a) las citas por título (`tema «X» de este módulo`) no se juzgan: hay 110 en el repositorio y 18 no coinciden con ninguna cabecera — Cloud 9, Flutter 3, Kotlin Multiplatform 2, Spring Boot 2, Angular 1, DevOps 1 —; (b) un `del Módulo 99` que no exista en el curso se salta en silencio; (c) las filas `Ver Tema N` se juzgan solo por existencia, así que un reordenado que las deje apuntando a un tema que sí existe pero es otro no salta en la puerta: en Java las nueve que había que mover se recalcularon con la permutación, no a ojo; (d) **las citas sin cualificar se saltan en `scripts/audit_topic_citations.py:155`**, y es la forma que Flutter prefiere para sus prerrequisitos (`**Prerrequisitos:** Tema 1, catálogo Play y conceptos de backend`): en el curso hay 7 dentro de los capítulos que este lote movió y hubo que repasarlas a mano, sin red. Ampliar el reconocedor para que asuma el capítulo propio cuando el número va suelto en una frase de prerrequisito es la mejora natural del auditor, pero cambiaría el alcance de lo que juzga y hay que medirlo antes de tocarlo.
- **Deuda de dependencias entre capítulos, no dentro de uno** (el programa solo juzga el orden interno de cada capítulo): el capítulo 6 tema 2 necesita Maven, que se enseña en el capítulo 8; el capítulo 10 tema 3 necesita reflexión, que está en el capítulo 19; y el capítulo 9 tema 4 fija una base de JDK distinta (21) de la que usa el resto del curso (25 LTS / 27). Ninguna de las tres la detecta la puerta actual; hay que decidir si se reescribe el prerrequisito o se mueve el capítulo.
- Siguen abiertos desde antes: la prueba de salida del modo libro en móvil (`web/e2e/academy.spec.ts:649`, falla en los 84/84 de todos los lotes), las 49 capturas huérfanas de Node y la fila `docs/requested-master-topics.json:82`.



