# Deuda editorial verificable

Este inventario se genera desde el Markdown real mediante detectores heurísticos de presencia. Las ayudas visuales, el glosario y los mensajes generados por la interfaz no cuentan como explicación editorial. Un criterio detectado no demuestra que la explicación sea correcta o suficiente ni que el código se haya ejecutado.

El estado «completo» de este reporte solo significa que aparecen los criterios de esta auditoría; no equivale a completar los siete pasos editoriales. La auditoría independiente de siete pasos evalúa otros 17 marcadores y registra su propio resultado en `seven-step-methodology.md`.

## Estado global

| Criterio | Cubierto | Pendiente |
|---|---:|---:|
| Explicación | 1185 | 0 |
| Código | 1141 | 44 |
| Ruta | 1185 | 0 |
| Ejecución | 1119 | 66 |
| Resultado | 1183 | 2 |
| Modificación | 1131 | 54 |
| Conexión con un proyecto | 1097 | 88 |
| Modelo mental | 1185 | 0 |
| Límites | 1126 | 59 |
| **Perfil de criterios detectado** | **1081** | **104** |

## Prioridad por track

| Track | Temas | Sin código | Sin ruta | Sin ejecución | Sin resultado | Sin modificación | Sin proyecto | Sin límites |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| android | 58 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| angular | 71 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| cloud | 156 | 0 | 0 | 0 | 2 | 0 | 0 | 1 |
| devops | 113 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| flutter | 106 | 0 | 0 | 0 | 0 | 0 | 1 | 1 |
| foundations | 99 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| ios | 56 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| java | 101 | 39 | 0 | 58 | 0 | 47 | 60 | 39 |
| javascript | 88 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| kotlin-multiplatform | 56 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| node | 83 | 0 | 0 | 0 | 0 | 1 | 2 | 1 |
| react | 58 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| rutaflow | 29 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| spring-boot | 111 | 5 | 0 | 8 | 0 | 6 | 25 | 17 |

## Pendientes por tema

- [cloud · módulo 0](../web/public/content/cloud/modulo-0.md) · Tema 4: Qué es Floci — definición, propósito y comparativa con LocalStack: resultado.
- [cloud · módulo 0](../web/public/content/cloud/modulo-0.md) · Tema 5: Servicios que emula Floci — AWS, Azure y GCP: resultado, límites.
- [flutter · módulo 19](../web/public/content/flutter/modulo-19.md) · Tema 1: estado de la jornada con Riverpod: conexión con un proyecto, límites.
- [java · módulo 0](../web/public/content/java/modulo-0.md) · Tema 1: Del código fuente a la JVM: conexión con un proyecto, límites.
- [java · módulo 0](../web/public/content/java/modulo-0.md) · Tema 2: public static void main — qué significa cada palabra: modificación, conexión con un proyecto, límites.
- [java · módulo 1](../web/public/content/java/modulo-1.md) · Tema 1: Clases, objetos, constructores y encapsulación: modificación, conexión con un proyecto.
- [java · módulo 1](../web/public/content/java/modulo-1.md) · Tema 2: Herencia y sobreescritura: modificación, límites.
- [java · módulo 1](../web/public/content/java/modulo-1.md) · Tema 3: Interfaces, clases abstractas y cuándo usar cada una: modificación.
- [java · módulo 10](../web/public/content/java/modulo-10.md) · Tema 1: module-info.java y encapsulación fuerte: código, ejecución, modificación, conexión con un proyecto, límites.
- [java · módulo 10](../web/public/content/java/modulo-10.md) · Tema 2: Migración incremental y cuándo JPMS aporta valor: código, ejecución, modificación, conexión con un proyecto.
- [java · módulo 10](../web/public/content/java/modulo-10.md) · Tema 3: opens para acceso reflexivo controlado de frameworks: código, ejecución, modificación, conexión con un proyecto.
- [java · módulo 11](../web/public/content/java/modulo-11.md) · Tema 1: Generaciones de memoria y recolectores: código, ejecución, modificación, conexión con un proyecto, límites.
- [java · módulo 11](../web/public/content/java/modulo-11.md) · Tema 2: Java Flight Recorder y JIT compilation: código, ejecución, modificación, conexión con un proyecto.
- [java · módulo 11](../web/public/content/java/modulo-11.md) · Tema 3: Referencias especiales y heap dumps: código, ejecución, modificación, conexión con un proyecto.
- [java · módulo 11](../web/public/content/java/modulo-11.md) · Tema 4: Foreign Function & Memory API (Java 22): ejecución, modificación, conexión con un proyecto.
- [java · módulo 12](../web/public/content/java/modulo-12.md) · Tema 1: Builder — configuración paso a paso y validación: código, ejecución, conexión con un proyecto, límites.
- [java · módulo 12](../web/public/content/java/modulo-12.md) · Tema 2: Factory Method y Strategy: código, ejecución, modificación, conexión con un proyecto, límites.
- [java · módulo 12](../web/public/content/java/modulo-12.md) · Tema 3: Abstract Factory y familias de productos compatibles: código, ejecución, modificación, conexión con un proyecto, límites.
- [java · módulo 12](../web/public/content/java/modulo-12.md) · Tema 4: SOLID y cuándo NO aplicar un patrón: código, ejecución, modificación, conexión con un proyecto.
- [java · módulo 12](../web/public/content/java/modulo-12.md) · Tema 5: Prototype: copiar un objeto sin compartir sus datos: código, ejecución, conexión con un proyecto, límites.
- [java · módulo 12](../web/public/content/java/modulo-12.md) · Tema 6: Patrones estructurales para conectar piezas existentes: código, ejecución, conexión con un proyecto, límites.
- [java · módulo 13](../web/public/content/java/modulo-13.md) · Tema 1: Arquitectura por capas del proyecto integrador: código, ejecución, modificación, límites.
- [java · módulo 13](../web/public/content/java/modulo-13.md) · Tema 2: Integrando concurrencia, modelado y testing: código, ejecución, modificación, conexión con un proyecto.
- [java · módulo 13](../web/public/content/java/modulo-13.md) · Tema 3: Build reproducible y cierre del track: código, ejecución, modificación, conexión con un proyecto, límites.
- [java · módulo 14](../web/public/content/java/modulo-14.md) · Tema 1: Compartir memoria requiere orden y visibilidad: código, ejecución, modificación, conexión con un proyecto, límites.
- [java · módulo 14](../web/public/content/java/modulo-14.md) · Tema 2: La JVM optimiza y puede invalidar un cronómetro ingenuo: código, ejecución, modificación, conexión con un proyecto.
- [java · módulo 14](../web/public/content/java/modulo-14.md) · Tema 3: Deserializar es permitir construcción y comportamiento: código, ejecución, conexión con un proyecto.
- [java · módulo 14](../web/public/content/java/modulo-14.md) · Tema 4: El runtime es parte del artefacto y necesita ciclo de vida: código, ejecución, conexión con un proyecto, límites.
- [java · módulo 15](../web/public/content/java/modulo-15.md) · Tema 1: Maven avanzado: código, ejecución, modificación, conexión con un proyecto, límites.
- [java · módulo 15](../web/public/content/java/modulo-15.md) · Tema 2: Gradle y builds reproducibles: código, ejecución, modificación, conexión con un proyecto, límites.
- [java · módulo 15](../web/public/content/java/modulo-15.md) · Tema 3: Proyectos multi-módulo sin ciclos: código, ejecución, modificación, conexión con un proyecto.
- [java · módulo 15](../web/public/content/java/modulo-15.md) · Tema 4: JUnit 5, Mockito y assertions expresivas: código, ejecución, modificación, conexión con un proyecto.
- [java · módulo 15](../web/public/content/java/modulo-15.md) · Tema 5: Pruebas de integración reproducibles: ejecución, modificación, conexión con un proyecto.
- [java · módulo 15](../web/public/content/java/modulo-15.md) · Tema 6: SLF4J, Logback, MDC y logging estructurado: código, ejecución, modificación, conexión con un proyecto.
- [java · módulo 16](../web/public/content/java/modulo-16.md) · Tema 1: Entidades y relaciones JPA: código, modificación, conexión con un proyecto, límites.
- [java · módulo 16](../web/public/content/java/modulo-16.md) · Tema 2: FetchType.LAZY, EAGER y el problema N+1: código, ejecución, modificación, conexión con un proyecto, límites.
- [java · módulo 16](../web/public/content/java/modulo-16.md) · Tema 3: Relaciones uno a uno, muchos a muchos y herencia: código, ejecución, modificación, conexión con un proyecto, límites.
- [java · módulo 16](../web/public/content/java/modulo-16.md) · Tema 4: Ciclo de vida, EntityManager y consultas tipadas: código, ejecución, conexión con un proyecto, límites.
- [java · módulo 16](../web/public/content/java/modulo-16.md) · Tema 5: Búsquedas dinámicas con Criteria y Querydsl: código, ejecución, modificación, conexión con un proyecto, límites.
- [java · módulo 16](../web/public/content/java/modulo-16.md) · Tema 6: EntityGraph y cachés de persistencia: código, ejecución, modificación, conexión con un proyecto, límites.
- [java · módulo 16](../web/public/content/java/modulo-16.md) · Tema 7: Concurrencia, transacciones y propagación: código, ejecución, modificación, conexión con un proyecto.
- [java · módulo 16](../web/public/content/java/modulo-16.md) · Tema 8: Migraciones y pruebas JPA con Testcontainers: código, ejecución, conexión con un proyecto, límites.
- [java · módulo 2](../web/public/content/java/modulo-2.md) · Tema 1: List, Set, Map y sus implementaciones: modificación, límites.
- [java · módulo 2](../web/public/content/java/modulo-2.md) · Tema 2: Genéricos, wildcards y type erasure: modificación.
- [java · módulo 2](../web/public/content/java/modulo-2.md) · Tema 3: Comparable vs Comparator, e iteración: límites.
- [java · módulo 20](../web/public/content/java/modulo-20.md) · Tema 4: Function y BiFunction: transformar uno o dos datos: ejecución, conexión con un proyecto.
- [java · módulo 20](../web/public/content/java/modulo-20.md) · Tema 5: UnaryOperator y BinaryOperator: la salida conserva el tipo: ejecución, conexión con un proyecto, límites.
- [java · módulo 20](../web/public/content/java/modulo-20.md) · Tema 6: Referencias a métodos: escribir la operación sin repetirla: ejecución, conexión con un proyecto, límites.
- [java · módulo 20](../web/public/content/java/modulo-20.md) · Tema 7: Optional: buscar un envío que puede no existir: ejecución, conexión con un proyecto.
- [java · módulo 20](../web/public/content/java/modulo-20.md) · Tema 8: Streams intermedios: filtrar, transformar, aplanar y ordenar: ejecución, conexión con un proyecto, límites.
- [java · módulo 20](../web/public/content/java/modulo-20.md) · Tema 9: Streams terminales: encontrar, contar y combinar resultados: ejecución, conexión con un proyecto.
- [java · módulo 20](../web/public/content/java/modulo-20.md) · Tema 10: Collectors: formar listas, mapas, grupos y texto: ejecución, conexión con un proyecto.
- [java · módulo 20](../web/public/content/java/modulo-20.md) · Tema 11: Streams paralelos: comparar antes de acelerarlos: ejecución, conexión con un proyecto, límites.
- [java · módulo 20](../web/public/content/java/modulo-20.md) · Tema 12: Pureza y efectos: calcular separado de guardar o imprimir: ejecución, conexión con un proyecto, límites.
- [java · módulo 20](../web/public/content/java/modulo-20.md) · Tema 13: Flow API: publicar datos con demanda y cierre: ejecución, conexión con un proyecto.
- [java · módulo 5](../web/public/content/java/modulo-5.md) · Tema 5: Structured Concurrency (StructuredTaskScope, Java 25): modificación, conexión con un proyecto, límites.
- [java · módulo 5](../web/public/content/java/modulo-5.md) · Tema 6: Scoped Values frente a ThreadLocal (Java 25): ejecución, modificación, conexión con un proyecto.
- [java · módulo 5](../web/public/content/java/modulo-5.md) · Tema 7: Timeouts y cancelación cooperativa sin abandonar recursos: ejecución, modificación.
- [java · módulo 6](../web/public/content/java/modulo-6.md) · Tema 1: NIO.2 — Path y Files: ejecución, modificación.
- [java · módulo 6](../web/public/content/java/modulo-6.md) · Tema 2: Serialización con Jackson: ejecución, modificación, conexión con un proyecto.
- [java · módulo 6](../web/public/content/java/modulo-6.md) · Tema 3: Archivos grandes y recursos del classpath: ejecución, modificación, límites.
- [java · módulo 7](../web/public/content/java/modulo-7.md) · Tema 1: record — modelos inmutables sin boilerplate: ejecución, conexión con un proyecto, límites.
- [java · módulo 7](../web/public/content/java/modulo-7.md) · Tema 2: sealed — jerarquías cerradas y exhaustividad: ejecución, modificación, conexión con un proyecto.
- [java · módulo 7](../web/public/content/java/modulo-7.md) · Tema 3: Pattern matching exhaustivo y para instanceof: ejecución, modificación, conexión con un proyecto, límites.
- [java · módulo 7](../web/public/content/java/modulo-7.md) · Tema 4: Unnamed variables y patterns (_, Java 22): ejecución, modificación, conexión con un proyecto, límites.
- [java · módulo 8](../web/public/content/java/modulo-8.md) · Tema 1: pom.xml vs build.gradle.kts: código, modificación, conexión con un proyecto, límites.
- [java · módulo 8](../web/public/content/java/modulo-8.md) · Tema 2: Ciclo de vida de build y scopes: código, ejecución, modificación, conexión con un proyecto.
- [java · módulo 8](../web/public/content/java/modulo-8.md) · Tema 3: Proyectos multi-módulo: código, ejecución, conexión con un proyecto, límites.
- [java · módulo 8](../web/public/content/java/modulo-8.md) · Tema 4: Maven y Gradle lado a lado — el mismo proyecto en dos herramientas: código, ejecución, modificación, conexión con un proyecto.
- [java · módulo 9](../web/public/content/java/modulo-9.md) · Tema 1: JUnit 5 — anotaciones y ciclo de vida: código, ejecución, conexión con un proyecto, límites.
- [java · módulo 9](../web/public/content/java/modulo-9.md) · Tema 2: Mockito — aislar dependencias: código, ejecución, modificación, conexión con un proyecto, límites.
- [java · módulo 9](../web/public/content/java/modulo-9.md) · Tema 3: Tests parametrizados y cobertura: código, ejecución, modificación, conexión con un proyecto.
- [node · módulo 14](../web/public/content/node/modulo-14.md) · Tema 7: Kafka desde Node: clave, grupo consumidor y offset: conexión con un proyecto, límites.
- [node · módulo 14](../web/public/content/node/modulo-14.md) · Tema 8: RabbitMQ desde Node: exchange, cola y confirmaciones: modificación, conexión con un proyecto.
- [spring-boot · módulo 10](../web/public/content/spring-boot/modulo-10.md) · Tema 1: Config Server y service discovery: límites.
- [spring-boot · módulo 10](../web/public/content/spring-boot/modulo-10.md) · Tema 2: Spring Cloud Gateway: conexión con un proyecto.
- [spring-boot · módulo 10](../web/public/content/spring-boot/modulo-10.md) · Tema 4: OAuth2/OIDC, Keycloak y Token Relay sin perder la frontera de autorización: conexión con un proyecto, límites.
- [spring-boot · módulo 10](../web/public/content/spring-boot/modulo-10.md) · Tema 10: Spring Cloud Bus para propagar cambios de configuración: conexión con un proyecto.
- [spring-boot · módulo 10](../web/public/content/spring-boot/modulo-10.md) · Tema 11: Micrometer Tracing entre servicios: conexión con un proyecto, límites.
- [spring-boot · módulo 10](../web/public/content/spring-boot/modulo-10.md) · Tema 12: Contract testing entre productor y consumidor: conexión con un proyecto, límites.
- [spring-boot · módulo 12](../web/public/content/spring-boot/modulo-12.md) · Tema 1: Arquitectura del microservicio integrador: ejecución, conexión con un proyecto, límites.
- [spring-boot · módulo 12](../web/public/content/spring-boot/modulo-12.md) · Tema 2: Integra seguridad JWT y observabilidad: ejecución, conexión con un proyecto.
- [spring-boot · módulo 21](../web/public/content/spring-boot/modulo-21.md) · Tema 1: Productor, tópico, key y consumidor: conexión con un proyecto, límites.
- [spring-boot · módulo 21](../web/public/content/spring-boot/modulo-21.md) · Tema 2: Reintentos, DLT, entrega al menos una vez e idempotencia: conexión con un proyecto.
- [spring-boot · módulo 21](../web/public/content/spring-boot/modulo-21.md) · Tema 3: Outbox transaccional y flujo de negocio: conexión con un proyecto.
- [spring-boot · módulo 25](../web/public/content/spring-boot/modulo-25.md) · Tema 1: bindings y destinations: conexión con un proyecto, límites.
- [spring-boot · módulo 25](../web/public/content/spring-boot/modulo-25.md) · Tema 2: binder Kafka y binder RabbitMQ: modificación, conexión con un proyecto, límites.
- [spring-boot · módulo 25](../web/public/content/spring-boot/modulo-25.md) · Tema 3: reintentos, error handler y dead-letter: modificación, conexión con un proyecto, límites.
- [spring-boot · módulo 25](../web/public/content/spring-boot/modulo-25.md) · Tema 4: test binder y límites de la prueba: modificación, conexión con un proyecto.
- [spring-boot · módulo 4](../web/public/content/spring-boot/modulo-4.md) · Tema 4: Reducir SSRF en clientes HTTP con InetAddressFilter: conexión con un proyecto.
- [spring-boot · módulo 4](../web/public/content/spring-boot/modulo-4.md) · Tema 5: Flujo de login completo — de `/api/auth/login` a una ruta protegida: límites.
- [spring-boot · módulo 6](../web/public/content/spring-boot/modulo-6.md) · Tema 1: Probar un controller con `@WebMvcTest`: modificación, conexión con un proyecto, límites.
- [spring-boot · módulo 6](../web/public/content/spring-boot/modulo-6.md) · Tema 2: Probar el repositorio contra PostgreSQL con `@DataJpaTest`: modificación, conexión con un proyecto, límites.
- [spring-boot · módulo 6](../web/public/content/spring-boot/modulo-6.md) · Tema 3: Integrar el flujo con `@SpringBootTest`: modificación, conexión con un proyecto, límites.
- [spring-boot · módulo 7](../web/public/content/spring-boot/modulo-7.md) · Tema 1: Actuator y health checks personalizados: conexión con un proyecto.
- [spring-boot · módulo 7](../web/public/content/spring-boot/modulo-7.md) · Tema 2: Contar operaciones de negocio con Micrometer: conexión con un proyecto, límites.
- [spring-boot · módulo 7](../web/public/content/spring-boot/modulo-7.md) · Tema 3: Liveness y readiness sin reinicios en cadena: conexión con un proyecto, límites.
- [spring-boot · módulo 8](../web/public/content/spring-boot/modulo-8.md) · Tema 6: Spring Cloud Stream y binders de Kafka/RabbitMQ: límites.
- [spring-boot · módulo 8](../web/public/content/spring-boot/modulo-8.md) · Tema 7: Kafka Streams con Spring para transformar eventos: código, ejecución, límites.
- [spring-boot · módulo 8](../web/public/content/spring-boot/modulo-8.md) · Tema 8: Avro y Schema Registry para contratos de eventos: código, ejecución.
- [spring-boot · módulo 8](../web/public/content/spring-boot/modulo-8.md) · Tema 9: RabbitMQ con Spring AMQP: routing, ack y prefetch: código, ejecución, conexión con un proyecto.
- [spring-boot · módulo 9](../web/public/content/spring-boot/modulo-9.md) · Tema 1: Mono y Flux: código, ejecución, conexión con un proyecto.
- [spring-boot · módulo 9](../web/public/content/spring-boot/modulo-9.md) · Tema 2: WebClient y composición no bloqueante: código, ejecución, conexión con un proyecto.
- [spring-boot · módulo 9](../web/public/content/spring-boot/modulo-9.md) · Tema 3: Cuándo WebFlux vale la complejidad, y R2DBC: ejecución, conexión con un proyecto.

## Regla de cierre

Un pendiente solo se cierra cuando el tema específico incluye archivo, código explicado, comando, salida, fallo diagnosticable, modificación y conexión con un proyecto propio. No se acepta texto generado o el mismo ejemplo repetido entre temas. El resultado de esta comprobación debe complementarse con la auditoría de siete pasos y una revisión humana; los indicadores de presencia no certifican calidad, aprendizaje ni ejecución.
