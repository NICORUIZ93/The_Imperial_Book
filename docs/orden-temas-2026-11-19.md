# Reordenar los temas: Node.js y la deuda de orden de los otros cursos, 2026-11-19

**Petición:** «quiero que revises cada tema cada curso y reorganices de manera mejora ordenada cada tema».
**Alcance elegido:** *curso completo por curso*. Cuatro lotes en este documento: Node.js reordenado por completo (14 capítulos, 78 temas), los 10 capítulos que los demás cursos dejaban declarados como incumplidos, JavaScript como curso completo etiquetado y ordenado (15 capítulos, 92 temas) y React como curso completo etiquetado y ordenado (15 capítulos, 64 temas). Quedan 12 cursos sin etiquetar; ver «Deuda que queda» al final.

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

**Por qué la puerta no comprueba prerrequisitos.** Se probó una tercera regla («un tema no puede pedir en sus prerrequisitos algo que se enseña más adelante») y dio dos falsos positivos que hay que leer antes de reescribirla: en el capítulo 5 de Node un prerrequisito dice «Docker se enseña a fondo en el Módulo 11; aquí solo lo usas para levantar PostgreSQL», que es una aclaración, no una dependencia; y en el capítulo 19 de Java el texto cita `Java M10 Tema 3 (opens)` dentro de una comparación. La regla se descartó en el propio docstring del auditor en lugar de relajar el umbral. Lo que sí se usó para decidir el orden fue **leer el texto de cada tema**, capítulo por capítulo.

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

## Deuda que queda

- **1.064 de los 1.420 temas (75 %) siguen sin nivel ni duración declarados.** Tras React, cuatro cursos están completos: Node.js (78/78), Microservicios (24/24), JavaScript (92/92) y React (64/64). Los otros doce andan entre 0 y 16 etiquetas: Java 16/117, Kotlin Multiplatform 10/66, iOS 13/69, control-1 0/70, rutaflow 0/29, Angular 7/78, Android 10/83, Fundamentos 2/103, Flutter 10/119, Spring Boot 9/121, DevOps 9/139, Cloud 12/168.
- El patrón de los cuatro lotes es el que queda para los doce cursos restantes: **etiquetar desde el propio texto y luego ordenar**, curso por curso. No hay ninguna decisión pendiente sobre los enlaces: como el fragmento se calcula sin el sufijo de nivel y duración (`scripts/build_web_topic_index.py:63` y `web/src/app/course/lesson-viewer.ts:84`), **etiquetar un curso entero no cambia ni un enlace ni borra ninguna marca de leído**. Lo único que mueve URLs es renumerar, y eso pasa solo en los capítulos que de verdad hace falta reordenar: en React, 10 de 64; en JavaScript, 31 de 92.
- El siguiente candidato natural es **Java**: es el curso con más etiquetas parciales puestas (16/117) y el más grande sin cerrar después de Cloud, así que su deuda de orden es la que más temas afecta.
- Los cuatro cursos ya completos (Node, Microservicios, JavaScript y React) no tienen incidencias declaradas: sus capítulos cumplen las dos reglas, y la lista de excepciones sigue vacía.



