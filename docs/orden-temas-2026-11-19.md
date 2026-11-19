# Reordenar los temas: primer curso completo (Node.js), 2026-11-19

**Petición:** «quiero que revises cada tema cada curso y reorganices de manera mejora ordenada cada tema».
**Alcance elegido:** *curso completo por curso*. Este documento cierra el primero: Node.js, 14 capítulos y 78 temas. Los otros 15 cursos quedan para lotes siguientes.

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
| `docs/topic-order-exceptions.json` | La deuda declarada: capítulos que hoy incumplen y se dejan para su lote. Antes de este lote tenía 15 entradas; ahora **10**. |

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

## Deuda para los siguientes cursos

- 10 capítulos declarados incumpliendo la regla de nivel: Android 15, Angular 14, DevOps 2, Flutter 1 y 7, iOS 4, 6 y 13, Kotlin Multiplatform 7 y Microservices 1.
- 1.210 temas sin nivel ni duración declarados. Es el trabajo previo en cada curso: sin etiqueta no hay orden auditable.

## Cómo revertir este lote

Cada capítulo se devuelve a su orden anterior aplicando su permutación inversa (la lista dice «en la posición i pongo el tema que hoy lleva el número orden[i]»), con la misma herramienta que se usó para moverlos:

```
python3 scripts/reorder_track_topics.py --track node --module 0 --order 1,3,2,4 --apply
```

Inversas por capítulo: El runtime de Node `1,3,2,4` · Módulos y npm `1,2,5,4,6,3` · Sistema de archivos y streams `1,3,5,6,2,4` · Servidores HTTP nativos `1,2,3,4,5,7,6` · Testing e integración continua `4,5,6,7,1,2,3` · Patrones asíncronos `1,2,4,5,3` · Observabilidad `1,2,4,3,6,5` · Proyecto integrador `1,4,5,6,2,3` · TypeScript y contratos `1,2,4,5,3`. Cada una está verificada: aplicar el orden del lote y después su inversa devuelve la numeración original, y la herramienta remapea los registros en ambos sentidos.

Las cinco etiquetas de nivel se revierten editando su cabecera (`Intermedio` donde ahora dice `Avanzado`). Después: `python3 scripts/audit_topic_order.py --write-exceptions`, los cuatro generadores de arriba y `./scripts/validate.sh`.

