# Reordenar los temas: Node.js y la deuda de orden de los otros cursos, 2026-11-19

**Petición:** «quiero que revises cada tema cada curso y reorganices de manera mejora ordenada cada tema».
**Alcance elegido:** *curso completo por curso*. El primer lote cierra Node.js (14 capítulos, 78 temas). El segundo lote cierra los 10 capítulos que los demás cursos dejaban declarados como incumplidos. Los otros 15 cursos siguen esperando su lote completo: ese trabajo no es mover temas, es **etiquetarlos** (ver «Deuda que queda» al final).

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

- **22 de los 78 temas tocados cambian de enlace** (el fragmento lleva el número y el nivel, así que reetiquetar también cambia la URL: 1 en DevOps 2 y 1 en Flutter 1 vienen de la etiqueta, no del movimiento). Los otros 56 conservan su enlace.
- Un enlace antiguo **no rompe**: abre la portada del capítulo, igual que en el lote de Node.
- La marca «tema leído» se pierde en esos 22 temas para quien los tuviera leídos; el progreso de capítulo no se toca.

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

## Deuda que queda

- **1.210 de los 1.420 temas (85 %) no declaran nivel ni duración.** Es el trabajo previo en cada curso: sin etiqueta la puerta de nivel no tiene nada que juzgar y reordenar sería adivinar. Medido tema a tema, solo dos cursos están completos: Node.js (78/78) y Microservicios (24/24); el resto anda entre 0 y 16 etiquetas por curso (JavaScript 4/92, React 6/64, control-1 0/70, rutaflow 0/29).
- Por eso los 15 cursos restantes necesitan primero una pasada editorial de etiquetado —nivel y minutos leídos del propio texto de cada tema— y después su reordenado. El siguiente candidato natural es **JavaScript**: es la base de Node y comparte su vocabulario.
- Lo cerrado aquí son solo las incidencias que el auditor ya podía ver gracias a los temas etiquetados sueltos. Un curso completo reorganizado, en el sentido estricto, es Node.js.


