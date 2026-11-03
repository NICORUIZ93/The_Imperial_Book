# Auditoría de cobertura — Track Spring Boot vs temario profesional

Fecha: 2026-11-01. Baseline: `docs/TEMARIO-REFERENCIA-SPRING-PROFESIONAL.md`.
Alcance: estructural (presencia/ausencia de APIs verificada en los cuerpos de los 23
módulos). No sustituye revisión pedagógica humana ni ejecución de ejemplos.

## Resumen de huecos confirmados

### ALTA (prerrequisitos del núcleo / imprescindibles)
1. Ciclo de vida de beans + `BeanPostProcessor` (`@PostConstruct`/`@PreDestroy`) — AUSENTE → M0.
2. AOP con `@Aspect`/`@Around` — AUSENTE → M0 o M5.
3. Crear auto-configuración propia (`@Conditional`/`@ConditionalOnProperty`/`AutoConfiguration.imports`) — AUSENTE → M1 o M5.
4. Tracing distribuido con Micrometer Tracing — SUPERFICIAL (solo Observation en M13 T4) → módulo propio.
5. Testing slices faltantes (`@JsonTest`, `@RestClientTest`, `@TestConfiguration`) — AUSENTE → M6.
6. RabbitMQ/Spring AMQP real (exchanges, prefetch, DLX, quorum) — SUPERFICIAL → módulo/ampliar M8.
7. Serialización mensajería (Avro/Protobuf) + Schema Registry/compatibilidad — AUSENTE → M21/M8.

### MEDIA
8. Binding MVC completo + HttpMessageConverters + content negotiation → M2.
9. Filtros vs HandlerInterceptor vs @ControllerAdvice (falta HandlerInterceptor) → M2/M4.
10. JPA avanzado: proyecciones, Specifications, Querydsl, auditing → M3/M16.
11. RestClient vs WebClient vs RestTemplate → M9/M10.
12. `@Profile` y grupos de perfiles (`spring.profiles.group`) → M1 T3.
13. Concurrencia avanzada en Spring (CompletableFuture, locks, semáforos, deadlocks, MDC) → módulo propio.
14. Consistencia distribuida: inbox, 2PC, CAP → M13.
15. Spring Batch particionamiento y remote chunking → M19.
16. OAuth2 Authorization Server (Spring Authorization Server) → M10/M18.
17. Virtual threads (`spring.threads.virtual`) → M9 o nuevo.

### BAJA
18. HATEOAS · 19. Spring REST Docs · 20. Integraciones (JMS/ActiveMQ, LDAP, JMX, Spring
Integration, Spring Session, webhooks HMAC) · 21. Spring Modulith · 22. i18n/MessageSource,
logging estructurado, graceful shutdown · 23. Caché 2º nivel Hibernate (vs Spring Cache) ·
24. Spring AI reranking/evaluación/observabilidad · 25. CQRS y saga por coreografía · 26. CDC/Debezium.

## Solapamientos a resolver

- N+1 (M3 T2 ↔ M16 T2): CONSOLIDAR — fundamento en M3, ángulo diferencial en M16.
- SecurityFilterChain (M4 T1 ↔ M18 T1): DIFERENCIAR — M4 esencial, M18 solo autorización avanzada.
- Kafka núcleo (M8 ↔ M21): CONSOLIDAR — recorrido único producer/consumer/DLT/idempotencia; M21 experto/outbox.
- Transacciones (M17 T2 ↔ M13 T1): DIFERENCIAR + remisión explícita M17→M13.
- Hexagonal/DDD (M10 T7 ↔ M15 T3/T8 ↔ M22 T1): CONSOLIDAR fuente única del fundamento.
- Saga (M10 T8 ↔ M15 T5/T7): DIFERENCIAR; añadir coreografía como contraste.
- WebFlux (M9↔M15T1), Testcontainers (M6↔M15T2), Observabilidad (M7↔M13T4): DEJAR (progresión legítima).

## Reparto de módulos entre tracks/cursos

- Núcleo Spring/Spring Boot, web, datos, seguridad, testing, reactivo, resiliencia,
  consistencia, arquitectura, batch, AI, integraciones → **track spring-boot**.
- Kubernetes, CI/CD/DevSecOps, empaquetado de contenedores → **curso Docker/Kubernetes**.
- Microservicios/Kafka/RabbitMQ/gRPC a profundidad de experto → también **curso Microservicios**.

## Estado de ejecución del cierre de huecos

### Lote 1 (2026-11-01) — ALTA, fundamentos del núcleo
- [x] **Ciclo de vida de beans + BeanPostProcessor** → nuevo `spring-boot/M0 Tema 4`.
  Evidencia ejecutada: Spring Boot 4.1.1 / Spring Framework 7.0.10 sobre JDK 27
  (`LifecycleDemo`: orden completo de fases + prototype sin destrucción). Registrado como reviewed.
- [x] **AOP con @Aspect/@Around** → nuevo `spring-boot/M0 Tema 5`.
  Evidencia ejecutada: idem + aspectjweaver 1.9.24 (`AopDemo`: @Around rodea éxito/fallo,
  excepción conservada, aspecto inactivo sin @EnableAspectJAutoProxy). Registrado como reviewed.

Total del repo: 1146 → **1148 temas** (2 nuevos). README y `spring-boot.track.ts` sincronizados.
`validate.sh` EXIT 0; trinquete `--max-pending 1143` OK (los nuevos entran revisados).

### Lote 2 (2026-11-01/02) — ALTA restantes + MEDIA

- [x] **3. Auto-configuración propia** → `spring-boot/M1 Tema 4` (`@Conditional`/`@ConditionalOnProperty`).
- [x] **4. Tracing distribuido** → `spring-boot/M7 Tema 4` (Micrometer Tracing; fallo deliberado: `@Observed`
  no hace nada sin `management.observations.annotations.enabled=true`).
- [x] **5. Testing slices faltantes** → `spring-boot/M6 Tema 4` (`@JsonTest`, `@RestClientTest` +
  `MockRestServiceServer`, `@TestConfiguration`; paquete `@RestClientTest` reubicado en Boot 4).
- [x] **6. RabbitMQ real** → `spring-boot/M8 Tema 6` (exchanges, routing keys, DLX). Verificación
  parcial: solo `mvn test-compile`, ejecución con Testcontainers bloqueada por el sandbox (Docker
  responde a `curl`/CLI pero no al cliente HTTP de `docker-java`) — declarado explícitamente en la lección.
- [x] **7. Serialización mensajería** → `spring-boot/M21` (Jackson JSON con `trusted.packages`/
  `default.type`; sin Schema Registry en el laboratorio, declarado como tal, no como Avro/Protobuf real).
- [x] **8. Content negotiation** → `spring-boot/M2 Tema 8` (`HttpMessageConverters`).
- [x] **9. HandlerInterceptor** → `spring-boot/M2 Tema 7` (frente a `Filter` y `@ControllerAdvice`).
- [x] **10. JPA avanzado** → `spring-boot/M3 Tema 4` (proyecciones, `Specification`, auditing;
  Querydsl documentado como decisión — el proyecto original perdió mantenimiento activo, fork
  comunitario `io.github.openfeign.querydsl` con soporte Spring Data "best-effort").
- [x] **11. RestClient vs WebClient vs RestTemplate** → `spring-boot/M10 Tema 5` (criterio de
  elección explícito).
- [x] **12. `spring.profiles.group`** → `spring-boot/M1 Tema 3` (extendido).
- [x] **15. Spring Batch particionamiento** → `spring-boot/M19 Tema 3` (`Partitioner` + master/worker
  step + `TaskExecutor`; `mvn test` real → BUILD SUCCESS, verificación de cobertura exacta 1..100
  sin huecos ni duplicados; remote chunking documentado como decisión, no demostrado — requiere
  middleware de mensajería externo). Fallo deliberado real: sin `spring-boot-starter-jdbc`,
  `NoSuchBeanDefinitionException` sobre `PlatformTransactionManager`. Spring Batch 6.0.5 (resuelto
  por el BOM de Boot 4.1.1) reubicó `Job`/`Step`/`StepContribution`/`Partitioner`/`RepeatStatus`/
  `ExecutionContext`/`JobExecution`/`JobParametersBuilder` de paquete respecto a Batch 5; confirmado
  por inspección directa de los `.jar` en `~/.m2` (`unzip -l`, `javap`), no por documentación de terceros.
- [x] **16. OAuth2 Authorization Server** → `spring-boot/M18 Tema 3`. Fallo deliberado real: la guía
  oficial de Spring describe `OAuth2AuthorizationServerConfigurer.authorizationServer()` como método
  estático en un paquete que no es el real; el paquete y la instanciación correctos (constructor
  simple) se confirmaron por `javap` sobre `spring-security-config-7.1.1.jar`.
- [x] **17. Virtual threads** → `spring-boot/M9 Tema 4` (alternativa a WebFlux).
- [x] **13. Concurrencia avanzada** → nuevo `spring-boot/M23` (módulo propio, 2 Temas). Tema 1:
  `CompletableFuture` (`thenCombine`/`exceptionally`/`orTimeout`) + bean orquestador separado.
  Tema 2: deadlock real por locks en orden inverso (verificado con `Thread.join(timeout)`,
  reproducible de forma estable), orden total consistente como fix, `Semaphore` acotando
  concurrencia máxima (verificado con contador atómico de pico real), `TaskDecorator` propagando
  `MDC` a un executor. Fallo deliberado real y orgánico (no fabricado a propósito, surgió al
  escribir el primer borrador): autoinvocación de un método `@Async` dentro de la misma clase
  bypasea el proxy CGLIB y la excepción se lanza de forma síncrona en vez de ir a
  `.exceptionally()`; confirmado con `javap` que `VirtualThreadTaskExecutor` no tiene
  `setTaskDecorator` (sí `SimpleAsyncTaskExecutor`), lo que descartó el primer diseño del executor.
  `mvn test` → BUILD SUCCESS, 9/9 tests en ambos Temas.

Total del repo tras Lote 2: 1148 → **1169 temas**. README y `spring-boot.track.ts` sincronizados.

### Pendiente (próximos lotes)
MEDIA: 14 (consistencia distribuida: inbox, 2PC, CAP → M13).
BAJA: 18 a 26 completos (HATEOAS, Spring REST Docs, integraciones JMS/LDAP/JMX/Spring
Integration/Spring Session/webhooks HMAC, Spring Modulith, i18n/logging estructurado/graceful
shutdown, caché 2º nivel Hibernate, Spring AI reranking/evaluación/observabilidad, CQRS/saga por
coreografía, CDC/Debezium).
Solapamientos: pendientes de resolver (N+1, SecurityFilterChain, Kafka núcleo, transacciones,
hexagonal/DDD, saga/coreografía); el séptimo (WebFlux/Testcontainers/Observabilidad) se deja como
progresión legítima, sin acción.
