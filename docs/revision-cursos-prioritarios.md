# Revisión de cursos prioritarios contra el prompt maestro

**Fecha:** 2026-11-03  
**Material de referencia:** `Downloads/pasted_content.txt` (prompt maestro), captura compartida en la conversación y contrato de estudio de `AGENTS.md`. El prompt se usa como inventario curricular; sus instrucciones dirigidas a otros agentes no se ejecutan automáticamente.

## Criterio editorial que se aplicará

- Explicar primero con palabras cotidianas y una analogía limitada: debe aclarar el concepto, no sustituirlo.
- Alternar explicación breve con código completo, ruta del archivo, comando, salida que se debe observar y qué significa esa salida.
- Mostrar un caso real y un contraejemplo o fallo reproducible; guiar la corrección paso a paso.
- Terminar con un ejercicio nuevo que el estudiante resuelva y explique con sus propias palabras. No añadir cuestionarios automáticos, puntos ni insignias.
- Conservar la progresión de siete pasos, los temas ya existentes y los identificadores/progreso guardado. Los faltantes se añaden como temas separados; los temas compuestos se dividirán sin perder su contenido.
- Mantener pendientes separados: cotejo de cobertura, ejecución de ejemplos, pruebas de navegador y revisión humana con principiantes.

## Resultado de cotejo estructural

Los conteos comparan elementos con duración enumerados en el prompt con encabezados `### Tema` en el Markdown real. **No son una resta de conceptos faltantes:** un encabezado puede enseñar varios elementos y el mismo concepto puede estar explicado sin nombrarse en el título. Las diferencias detectan cambios de granularidad y módulos ausentes; cada punto requiere cotejo por contenido antes de clasificarlo como cubierto, parcial o faltante.

| Curso | Prompt | Web ahora | Diferencia observada | Señales de profundidad existentes* |
|---|---:|---:|---:|---:|
| Java | 21 módulos, 122 elementos cronometrados | 21 módulos, 91 temas | La granularidad difiere en M12, M16, M17, M19 y M20; M16 se amplió de 2 a 8 lecciones | 46 al iniciar la revisión |
| Node.js | 16 módulos, 75 elementos cronometrados | 16 módulos, 83 temas | M15 ya existe; M14 separa saga, Kafka y RabbitMQ en lecciones diferentes | 15 |
| Spring Boot | 26 módulos, 161 elementos cronometrados | 26 módulos, 111 temas | M8 se amplió de 5 a 9 y M10 de 8 a 12 lecciones; M23–M25 ya tienen cuatro temas cada uno; otros módulos requieren cotejo por contenido | 8 |
| Flutter | 23 módulos, 155 elementos cronometrados | 23 módulos, 106 temas | M16/M17 añadidos con seis lecciones cada uno, M18 con siete, M19–M22 con seis; M0–M15 aún requieren cotejo manual completo | 6 |

**Detalle de diferencias por módulo según cantidad de elementos cronometrados:**

- **Java:** las diferencias de elementos por encabezados son M12 (+2 elementos), M16 (+15), M17 (+10), M19 (+5) y M20 (+10). El cotejo de contenido definirá cuáles son subtemas cubiertos dentro de una lección compuesta y cuáles requieren una lección propia.
- **Node:** se añadió M15 con Deno, Bun, migración desde Node y criterio de elección. M14 separa saga, Kafka y RabbitMQ para comprobar clave/grupo/offset de Kafka y exchange/cola/ack/prefetch de RabbitMQ por separado; falta ejecutar los labs contra brokers reales.
- **Spring Boot:** hay diferencias de granularidad que se revisarán por contenido en M2 (2), M3 (5), M4 (5), M6 (5), M7 (3), M8 (ahora 9 temas frente a 8 elementos del prompt), M9 (3), M10 (ahora 12 temas para 12 elementos del prompt), M11 (1), M16 (6), M17 (6), M18 (5), M19 (6), M20 (2), M21 (3), M22 (2). M23 Modulith, M24 GraphQL y M25 Cloud Stream tienen cuatro temas cada uno, en el orden indicado por el prompt; cotejo humano y ejecución real siguen pendientes.
- **Flutter:** hay diferencias de granularidad por cotejar en M0 (6), M1 (5), M2 (2), M3 (3), M4 (5), M5 (2), M6 (2), M7 (4), M8 (3), M9 (7), M10 (9), M11 (4), M12 (3), M13 (4), M14 (1), M15 (1). M16 cubre FFI, bindings C, Rust, empaquetado, rendimiento y memoria; M17 generación y AST; M18 producción; M19 entrega/realtime/offline; M20 pruebas, arquitectura y release; M21 compras/suscripciones; M22 anuncios, mediación y privacidad. M0–M15 requieren cotejo manual.

### Lectura manual de Java M16 (JPA)

| Elemento del prompt | Estado en el módulo actual | Evidencia/pendiente |
|---|---|---|
| Entidad, clave y relaciones `ManyToOne`/`OneToMany` | Cubierto | Las dos entidades tienen clave foránea y el ejercicio comprueba el lado propietario. |
| `ManyToMany` y `OneToOne` | Parcial | Se añadió relación uno-a-uno con restricción única y se propone entidad intermedia; falta completar ambas asociaciones como tests en el laboratorio. |
| Estrategias de herencia | Parcial | Se comparan `SINGLE_TABLE` y `JOINED` como práctica; falta salida observada de `TABLE_PER_CLASS` y su costo. |
| Callbacks del ciclo de vida | Parcial | Se incorporan `@PrePersist` y `@PostLoad` en prácticas; falta el test completo con implementación entregada. |
| `EntityManager`, contexto de persistencia y `flush` | Cubierto a nivel de lección | Se distinguen `persist`, `flush`, `clear`, commit y entidad administrada; ejecutar la prueba queda pendiente. |
| JPQL | Cubierto a nivel de lección | Hay consulta tipada y filtros parametrizados; la consulta de ejemplo aún necesita implementarse en el laboratorio. |
| Criteria API y Querydsl | Parcial | Criteria API ahora se ejecuta en `examples/java-jpa-lab`; Querydsl sigue como práctica sin configuración ni salida ejecutable. |
| `LAZY`, `EAGER` y N+1 | Cubierto con alcance acotado | El laboratorio mide N+1 y lo compara con `@EntityGraph` en H2; no cubre todas las estrategias ni bases reales. |
| `@EntityGraph` | Cubierto en el laboratorio | Repositorio y test ejecutables en H2; caché de segundo nivel sigue pendiente. |
| Caché de primer y segundo nivel | Parcial | Se explica el contexto L1 y los límites de L2; no se incluye configuración concreta de proveedor ni test L2. |
| Bloqueo optimista y pesimista | Parcial | Se propone `@Version`, `@Lock` y diagnóstico de conflicto; la prueba concurrente está descrita pero no implementada en el repositorio. |
| Transacciones y propagación | Parcial | Se explica `REQUIRED`/`REQUIRES_NEW` y límite del proxy; falta una prueba ejecutada de rollback/commit. |
| Migraciones Flyway o Liquibase | Parcial | Se añadió SQL de Flyway y estrategia incremental; falta el proyecto Maven completo con versiones verificadas. |
| Pruebas JPA con Testcontainers | Parcial | Se define PostgreSQL temporal y el comando de test; las dependencias y prueba completa aún deben incorporarse al ejemplo real. |

Esta lectura demuestra por qué un módulo con dos encabezados puede cubrir partes de varios elementos y dejar otros ausentes. M16 ahora tiene ocho lecciones y el inventario queda representado; no lo considero completamente cerrado hasta que dependencias, repositorio de ejemplo y pruebas de las filas parciales estén presentes y ejecutadas.

### Lectura manual de Spring Boot M8 (Kafka y RabbitMQ)

| Elemento del prompt | Estado actual | Evidencia/pendiente |
|---|---|---|
| Producer y consumer Spring Kafka | Cubierto en lección y tests existentes | `KafkaTemplate`, `@KafkaListener`, tópico, clave y consumer group. |
| Dead-letter queue | Cubierto en lección y laboratorio | Falla repetida con ruta a DLT; falta ejecución en broker en este turno. |
| Productor idempotente/transacciones | Cubierto a nivel de lección | Se explican retries, transacción y los límites de exactly-once; ejecución pendiente. |
| Rebalanceo | Cubierto a nivel de lección | Consumer groups, asignación y static membership; medición real pendiente. |
| Kafka frente a RabbitMQ | Cubierto | El Tema 5 compara retención/offsets con colas/ack. |
| Spring Cloud Stream | Añadido en Tema 6 | Bean funcional, destinos y binders Kafka/Rabbit; requiere probar ambos perfiles. |
| Kafka Streams | Añadido en Tema 7 | Topología filtro y salida, y ejercicio de estado/recuperación; no ejecutado aquí. |
| Schema Registry y Avro | Añadido en Tema 8 | Esquemas v1/v2, compatibilidad y fallo por campo requerido; integración pendiente. |
| RabbitMQ nativo Spring AMQP | Añadido en Tema 9 | Exchange, routing key, confirms/returns, ack manual, prefetch, DLX e idempotencia. El test con RabbitMQContainer no se ejecutó. |

La estructura ahora contempla los requisitos del módulo; la matriz distingue las lecciones añadidas de evidencia de broker ejecutada. Los labs de Kafka y RabbitMQ necesitan contenedores disponibles para considerarse validados en ejecución.

### Lectura manual de Spring Boot M10 (microservicios)

| Elemento del prompt | Estado actual | Evidencia/pendiente |
|---|---|---|
| Config Server y service discovery | Cubierto en tema existente | Configuración y resolución por nombre lógico; comprobarlo con dos procesos en ejecución. |
| Spring Cloud Gateway | Cubierto en tema existente | Enrutamiento como entrada; aún requiere ejecución del ejemplo integrado. |
| Resilience4j circuit breaker | Cubierto en tema existente | Falla y fallback explicados; falta evidencia de recuperación y métricas en runtime. |
| OAuth2/OIDC, Keycloak y Token Relay | Parcial | El tema cubre identidad y relay; levantar Keycloak y comprobar scopes/roles queda pendiente. |
| HTTP Interfaces, deadlines y discovery | Parcial | Hay interfaz y resolución; falta medir deadline con servicio lento y cancelación real. |
| Spring gRPC | Cubierto a nivel de lección | Contrato `.proto`, generación y evolución de campos; ejecución entre dos servicios pendiente. |
| DDD: límites y propiedad de datos | Cubierto | La lección separa capacidades, dueño de datos y dependencias entre contextos. |
| Temporal: workflows y orquestación | Cubierto a nivel de lección | Workflow, activities y saga descritos; el worker no se ejecutó con Temporal Server. |
| Spring Modulith | Añadido como Tema 9 | `ApplicationModules.verify()`, dependencia interna deliberada, evento y prueba de módulo; ejecución pendiente. |
| Spring Cloud Bus | Añadido como Tema 10 | Refresh en dos instancias, identidad Bus, broker, autorización y rollback; requiere broker real. |
| Micrometer Tracing | Añadido como Tema 11 | Propagación de trace/span, builder HTTP auto-configurado, fallo manual y cardinalidad; exportación pendiente. |
| Contract testing | Añadido como Tema 12 | Contrato, validación del proveedor y stub del consumidor; configuración de plugin y pruebas pendientes. |

M10 ya tiene un encabezado separado por cada elemento del inventario del prompt. Esta cobertura estructural no acredita que dependencias, broker, Keycloak, Temporal, exporter o pruebas de contrato hayan corrido. La validación de fuentes y del código escrito es un paso distinto de la ejecución del laboratorio.

### Lectura manual de Java M17 (JDBC)

Los dos temas actuales explican conexiones, `PreparedStatement`, `ResultSet`, DAO, prevención de inyección SQL, `commit`/`rollback`, ACID, aislamiento y bloqueo optimista. `examples/java-jpa-lab` ahora incluye Maven Wrapper, H2 y seis pruebas ejecutables; comprueban datos hostiles como valores y el rollback cuando falla la segunda escritura. Aún faltan ejemplos de pool de conexiones, procesamiento por lotes, `JdbcTemplate`, diferencia DAO/Repository, `Savepoint` y XA/2PC. El test de concurrencia y niveles de aislamiento requiere pruebas dedicadas.

\* Las señales de `course-depth-review.json` son banderas estructurales que requieren lectura; no equivalen a defectos confirmados. De igual forma, que el auditor de practicabilidad dé todos los temas visibles por correctos no prueba que el alumno pueda ejecutarlos ni comprenderlos. Los conteos de señales son la línea base anterior a esta corrección y se regenerarán al cerrar el lote.

## Verificación de versiones

El prompt fija Java 21 y Spring Boot 3.4.1 como ejemplos. Para una revisión con fecha actual se debe verificar cada baseline antes de consolidar ejemplos. La documentación oficial consultada lista JDK 25 y 27 como versiones actuales; Spring Boot 4.1.2 declara compatibilidad con Java 17–27; Node.js 24 y 26 figuran en LTS; Flutter publica la rama estable 3.47. Las lecciones indicarán la versión que realmente requieren, sin presentar una versión antigua como la última.

Fuentes primarias: [Oracle Java SE](https://docs.oracle.com/en/java/javase/), [Spring Boot: requisitos del sistema](https://docs.spring.io/spring-boot/system-requirements.html), [Node.js: calendario de versiones](https://nodejs.org/en/about/previous-releases) y [Flutter: versiones estables](https://docs.flutter.dev/release/release-notes).

## Orden de trabajo

1. **Java:** completar el cotejo de JPA/Hibernate, JDBC/transacciones, patrones y Java funcional; revisar que cada lección tenga código entendible, salida, fallo y práctica propia.
2. **Node.js:** revisar M0–M15, añadir lo que falta y separar microservicios, Kafka, RabbitMQ y sagas en competencias comprobables.
3. **Spring Boot y microservicios:** completar temas y módulos; distinguir HTTP síncrono de mensajería, Kafka de RabbitMQ, consistencia local de distribuida y contratos de despliegue.
4. **Kafka y RabbitMQ:** comprobar productores, consumidores, particiones/claves o colas/ruteo, confirmaciones, reintentos, DLQ, orden, duplicados, idempotencia, esquemas, observabilidad y pruebas reproducibles.
5. **Flutter:** cotejar cada módulo, recuperar web/desktop/FFI/producción/entregas/master/IAP/ads donde el prompt lo requiere, manteniendo Android/iOS por separado donde las instrucciones difieren.
6. **Otros cursos:** repetir el mismo cotejo contra el prompt fuente una vez cerradas estas prioridades.

El cierre de cada curso requerirá conteo de títulos preservados, matriz de requisitos, ejemplos ejecutados con evidencia, validación automatizada y revisión humana pendiente o realizada, nombrada sin exagerar cobertura.

## Avance de esta revisión

- **Java M12:** se añadieron las lecciones separadas de Prototype y patrones estructurales; el módulo pasa de 4 a 6 temas. Se amplió el ejemplo estructural para incluir Flyweight. Siguen pendientes las brechas de M19 y M20.
- **Java M16:** se expandió de 2 a 8 lecciones con el mapa completo de temas del prompt; los puntos que requieren laboratorio de integración real quedan identificados como parciales en la matriz. La cobertura de títulos/estructura no se presenta como ejecución completada.
- **Java M16–M17:** se añadió `examples/java-jpa-lab` con Boot 4.1.2, Java 25, H2 y Maven Wrapper. Seis pruebas pasan: asociaciones/JPQL, Criteria, `@EntityGraph`, N+1 frente a carga agrupada (4 frente a 1 consultas), `PreparedStatement`, confirmación y rollback de transacción JDBC. M16 sigue parcial en Querydsl, caché de segundo nivel, bloqueos, transacciones avanzadas, migraciones y Testcontainers; M17, en pools, lotes, `JdbcTemplate`, savepoints y XA.
- **Node M14:** la saga tiene objetivo, analogía, fallo y salida comprobable. Kafka y RabbitMQ tienen laboratorios separados en `examples/node-messaging`, con clave/grupo/offset, exchange/routing, ack/confirm, prefetch y DLQ. Dos pruebas locales y análisis de sintaxis pasan; Kafka/RabbitMQ no se ejecutaron porque no hay Docker ni broker en este entorno. El Set de idempotencia de Rabbit es didáctico y no sobrevive reinicios; el texto lo identifica como tal. Se corrigieron la configuración KafkaJS de Confluent y la consulta curl de Federation. La prueba de Federation y la consulta contra el gateway local pasan. `npm audit fix` corrigió la alerta alta del árbol Federation; quedan 22 moderadas, principalmente por dependencias transitivas de Apollo Gateway 2.14.4 y OpenTelemetry. La solución automática restante propone Gateway 2.13.4; no se aplicó esa bajada sin pruebas de compatibilidad.
- **Node M14 Tema 1:** el comando ahora ejecuta `src/asignar.ts`, crea `package.json` como módulo y coincide con el código; se ejecutó en Node 24.14.1 y mostró la salida esperada.
- **Node M15:** se creó la ruta de cuatro temas para Deno, Bun, migración y elección, basada en la documentación primaria actual. La matriz cubre estructura curricular; los ejemplos Deno/Bun aún no se ejecutaron en esos runtimes.
- **Spring Boot M8:** se amplió de 5 a 9 lecciones con Spring Cloud Stream, Kafka Streams, Avro/Schema Registry y RabbitMQ/Spring AMQP en prácticas separadas. La build valida el catálogo; faltan pruebas reales con Kafka y RabbitMQ.
- **Spring Boot M10:** se amplió de 8 a 12 lecciones para cubrir Spring Modulith, Spring Cloud Bus, Micrometer Tracing y contract testing por separado. El catálogo incluye cuatro prácticas nuevas; brokers, Keycloak, Temporal, exporter y generación de stubs no se ejecutaron en este entorno.
- **Flutter M16:** se añadió el módulo FFI con seis lecciones de decisión, bindings C, Rust mediante ABI C, empaquetado por plataforma, benchmarks y propiedad de memoria. Se usaron los flujos actuales de `package_ffi` y build hooks; el paquete y sus tests Dart se ejecutaron, pero el APK no se generó al quedar Gradle sin salida.
- **Flutter M17:** se añadió generación avanzada con seis lecciones. Se corrigió el prompt de macros: el trabajo experimental se detuvo y el módulo enseña `build_runner`; cubre reflexión limitada, analyzer AST, un builder propio y paquetes. Pasaron los ejemplos Dart de serialización, registro tipado, AST, builder, tests, documentación y `dart pub publish --dry-run`; el dry run avisó que falta completar `repository` o `homepage` antes de una publicación real. El cotejo manual de M0–M15 sigue pendiente.
- **Flutter M18:** se añadieron siete lecciones prácticas de frontera nativa, secretos, frames, telemetría, Crashlytics/Sentry, Analytics con consentimiento y monitoreo. Se contrastaron con documentación primaria de Flutter y Firebase; los reportes remotos y builds de dispositivo requieren proyectos/credenciales y siguen pendientes de ejecución.
- **Flutter M19:** se creó el proyecto de entrega en seis temas: Riverpod, mapa y permisos, Socket.IO con orden/idempotencia, animaciones, outbox offline y carga de evidencia/push. Los seis fragmentos Dart pasaron `flutter analyze` en proyecto temporal con sus dependencias. La interacción con dispositivo, Maps, gateway, FCM y API siguen pendientes.
- **Flutter M20:** se añadió el módulo Master con seis temas de pruebas unitarias/widget, golden e integración, performance, Clean Architecture, i18n y builds. La prueba de política de entrega pasó `flutter test` en un proyecto limpio; la suite Angular también pasó 17/17. Los flujos Android/iOS/web y firmas requieren toolchains/certificados disponibles.
- **Flutter M21:** se añadió al catálogo el módulo de seis temas IAP: `in_app_purchase`, suscripciones Play y StoreKit, restauración, pruebas sandbox y verificación de servidor. Cada lección contiene siete pasos; fake/sandbox y verificación con stores reales requieren cuentas, backend y dispositivos autorizados.
- **Flutter M22:** se añadió el módulo de seis temas de AdMob, mediación (bidding/waterfall y LevelPlay/AppLovin), formatos, consentimiento UMP, privacidad y pruebas. Usa App IDs/unidades de prueba y declara los targets Android/iOS. Falta ejecutar con dispositivos, cuentas y adapters reales.
- **Spring Boot M23–M25:** se añadieron cuatro temas por módulo según el prompt: Spring Modulith, Spring GraphQL y Spring Cloud Stream. Se fijaron para el laboratorio Boot 4.0.9/Java 21, Modulith 2.0.8, GraphQL 2.0.6 y Cloud 2025.1.4/Stream 5.0.4, contrastados con documentación primaria. Los doce temas pasan marcadores de siete pasos; sus pruebas contra stores, websockets y brokers deben ejecutarse por separado.
- La auditoría de Java, Spring Boot, Flutter y Node no está cerrada. En particular, Flutter y Spring todavía no alcanzan el inventario modular del prompt.
