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

### Pendiente (próximos lotes)
ALTA: auto-configuración propia (@Conditional/AutoConfiguration.imports); tracing distribuido
(Micrometer Tracing); testing slices (@JsonTest/@RestClientTest/@TestConfiguration); RabbitMQ real;
serialización mensajería (Avro/Protobuf + Schema Registry).
MEDIA y BAJA: según lista de huecos arriba.
Solapamientos: pendientes de resolver (N+1, SecurityFilterChain, Kafka núcleo, transacciones,
hexagonal/DDD, saga/coreografía).
