# Temario de referencia profesional — Spring / Spring Boot

Fecha de registro: 2026-11-01. Fuente: temario provisto por el usuario (dueño del
proyecto) como **baseline de cobertura obligatoria** para el track Spring/Spring Boot
y sus cursos separados. Este documento NO es la lección: es la vara contra la que se
mide la cobertura de temas y subtemas (puerta de calidad de `AGENTS.md`).

Regla de uso: ningún tema de este temario puede quedar "de refilón". Cada concepto
listado debe existir como tema propio con mapa de subtemas y explicación individual,
o estar insertado antes como prerrequisito completo si solo aparece dentro de una API
más avanzada. Reportar por separado cobertura de tema y de subtemas críticos.

---

## Fundamentos y núcleo

- Java moderno (track Java — ya cerrado con minuciosidad).
- Fundamentos de Spring: IoC y DI.
- **Spring Core avanzado:** ciclo de vida de beans, `BeanPostProcessor`,
  `@PostConstruct`/`@PreDestroy`, eventos de aplicación, AOP (`@Aspect`/`@Around`), SpEL.
- Spring Boot esencial: autoconfiguración, starters, `@Conditional`, crear
  auto-configuración propia, `AutoConfiguration.imports`.
- Configuración externa y perfiles: `@ConfigurationProperties`, binding, validación,
  `@Profile`, grupos de perfiles.

## Web

- REST con Spring MVC: `@RestController`, binding (`@RequestParam`/`@PathVariable`/
  `@RequestBody`), `HttpMessageConverters`, content negotiation.
- DTOs, validación (`@Valid`/`@Validated`, grupos), manejo global de errores,
  ProblemDetail / RFC 7807.
- Filtros vs `HandlerInterceptor` vs `@ControllerAdvice`.
- OpenAPI y clientes HTTP: RestClient (Spring 6.1) vs WebClient vs RestTemplate,
  HTTP Interfaces.
- HATEOAS, Spring REST Docs (integraciones).

## Datos

- JDBC y SQL (curso separado JDBC — plan existente).
- Spring Data JPA esencial: entidades, repos derivados, `@Query` JPQL/nativo, `Pageable`/`Sort`.
- **JPA avanzado y rendimiento:** N+1, fetch, `@EntityGraph`, proyecciones (interface/DTO),
  Specifications/Querydsl, auditing (`@CreatedDate`), caché de segundo nivel.
- Flyway y migraciones.
- **Transacciones (módulo propio):** propagación (`REQUIRES_NEW`, nested), aislamiento,
  `readOnly`, rollback checked/unchecked, self-invocation del proxy.

## Seguridad

- Spring Security esencial: `SecurityFilterChain`, cadena de filtros.
- JWT, OAuth2 y OIDC: resource server, authorization server, token relay, Keycloak.
- Seguridad web y hardening: CORS, CSRF, headers, SSRF, method security.

## Calidad / Observabilidad

- Testing unitario y con Mockito; `@MockBean`/`@MockitoBean`, `@TestConfiguration`.
- Slice tests (`@WebMvcTest`, `@DataJpaTest`, `@JsonTest`, `@RestClientTest`) y Testcontainers.
- Contratos y calidad.
- Logs (Logback, structured logging), métricas y Actuator.
- **Tracing distribuido (módulo propio):** Micrometer Tracing, propagación de contexto.

## Mensajería

- Fundamentos de mensajería: poison messages, DLQ, backpressure,
  serialización (JSON/Avro/Protobuf), Schema Registry y compatibilidad.
- **Kafka (Módulo 24):** topics/particiones/offsets/réplicas; producer (acks, retries,
  idempotencia, compresión); consumer (groups, rebalanceo, offsets, commit manual);
  orden por key/partición; lag/throughput/monitoreo; DLT y reintentos; transacciones Kafka;
  exactly-once (límites reales); Spring Kafka (`@KafkaListener`, `KafkaTemplate`, error handlers);
  Outbox y Debezium/CDC.
- **RabbitMQ y Spring AMQP (Módulo 25):** exchanges (direct/topic/fanout/headers); colas,
  bindings, routing keys; acks manuales; prefetch y fair dispatch; dead-letter exchange;
  TTL/prioridades/quorum queues; Spring AMQP (`@RabbitListener`, `RabbitTemplate`); patrones
  de reintento; Kafka vs RabbitMQ.
- **Event-driven architecture (Módulo 26):** eventos de dominio; event notification vs
  event-carried state transfer; CQRS; event sourcing; projections y replay; sagas por
  coreografía; sagas por orquestación; compensaciones y reconciliación; Temporal/workflows.

## Reactivo y concurrencia

- **Programación reactiva (Módulo 27):** modelo reactivo/non-blocking; Mono/Flux; operadores
  (map/flatMap/concatMap/filter/zip/merge); backpressure (buffer/drop/latest/error); errores
  (onErrorResume/onErrorMap/retry); schedulers/threading; Project Reactor.
- **WebFlux y R2DBC (Módulo 28):** WebFlux; controllers funcionales y anotados; WebClient
  avanzado; R2DBC (conexiones/transacciones/pooling); Reactor Netty; cuándo usar/cuándo no;
  WebFlux vs MVC + virtual threads; pruebas con StepVerifier.
- **Concurrencia avanzada (Módulo 29):** virtual threads; pools/colas/límites; ThreadLocal/
  MDC/contexto de seguridad; CompletableFuture; locks/semáforos/estructuras concurrentes;
  race conditions/deadlocks; bulkheads.

## Resiliencia y consistencia

- **Resiliencia (Módulo 30):** fallos transitorios vs permanentes; timeout; retry con
  backoff/jitter; circuit breaker; bulkhead; rate limiter; time limiter; fallback/graceful
  degradation; Resilience4j con Spring Boot; chaos engineering básico.
- **Consistencia distribuida (Módulo 31):** CAP práctico; fuerte vs eventual; idempotencia;
  idempotency keys; deduplicación; outbox transaccional; inbox pattern; sagas; compensaciones;
  reconciliación/reparación; 2PC (por qué se evita).

## Arquitectura

- **Arquitectura de aplicaciones (Módulo 32):** monolito modular; microservicios; SOA; EDA;
  clean/hexagonal/onion; DDD (bounded context, aggregate, entity, value object, domain event);
  puertos y adaptadores; anti-corruption layer; modular monolith y **Spring Modulith**.
- **Microservicios con Spring Cloud (Módulo 33):** Config Server; service discovery
  (Eureka/Consul/Kubernetes); API Gateway; load balancing; Spring Cloud Gateway; Resilience4j;
  distributed tracing; centralized logging; service mesh (conceptos); OAuth2 en microservicios;
  síncrona vs asíncrona.
- **Documentación de arquitectura (Módulo 34):** C4; ADR; diagramas de secuencia; diagramas de
  despliegue; documentación viva; decisiones técnicas y deuda técnica.

## Integraciones

- **Integraciones empresariales (Módulo 35):** email (JavaMailSender, plantillas, async);
  SOAP (WSDL, JAXB, WS-Security); JMS y ActiveMQ; LDAP; JMX; Spring Integration; webhooks
  (HMAC, verificación, reintentos); APIs externas (timeouts/retries/circuit breakers/contratos);
  Spring Session; Spring HATEOAS; Spring REST Docs.
- **Spring Batch (Módulo 36):** Job/Step/Chunk; reader/processor/writer; JobRepository;
  restart/retry/skip; listeners; particionamiento; remote chunking; grandes volúmenes;
  idempotencia y trazabilidad.
- **Spring AI y RAG (Módulo 37):** modelos/proveedores; chat client y prompts; embeddings;
  vector stores; RAG (chunking/retrieval/reranking/generación); function/tool calling;
  evaluación; seguridad (prompt injection/filtrado/costos); observabilidad de IA.

## Producción y despliegue

- **Empaquetado (Módulo 38):** fat JAR; layered JAR; Docker multi-stage; imágenes ligeras;
  GraalVM native image; AOT; perfiles de build; versionado semántico; artefactos reproducibles.
- **Kubernetes (Módulo 39):** pods/deployments/services/ingress; configmaps/secrets; probes
  liveness/readiness/startup; requests/limits; HPA/VPA; rolling updates; PDB; NetworkPolicies;
  RBAC/ServiceAccounts; observabilidad.
- **CI/CD y DevSecOps (Módulo 40):** GitHub Actions/GitLab CI/Jenkins; build/test/lint/SAST/SCA;
  escaneo de imágenes/dependencias; firma de artefactos; entornos; blue-green/canary; feature
  flags; rollback automatizado; GitOps.

## Proyecto integrador

- **Módulo 41 — Proyecto final profesional:** servicio completo (pedidos/reservas/entregas) con
  OpenAPI, JWT/OAuth2+roles, JPA+Flyway, validación/DTOs/errores, caché (Redis/Caffeine),
  eventos (Kafka/RabbitMQ), outbox, idempotencia/reintentos, Resilience4j, observabilidad
  (logs/métricas/tracing), Testcontainers + pruebas unitarias/slice/integración, Docker/K8s/CI/CD,
  documentación C4 y ADRs.

## Orden recomendado de estudio

Java moderno → IoC/DI → Spring Core avanzado (beans, eventos, AOP, SpEL) → Spring Boot esencial →
configuración externa y perfiles → REST con MVC → DTOs/validación/errores → OpenAPI y clientes
HTTP → JDBC y SQL → Spring Data JPA esencial → JPA avanzado y rendimiento → Flyway → transacciones
→ Spring Security esencial → JWT/OAuth2/OIDC → seguridad web y hardening → testing unitario y
Mockito → slice tests y Testcontainers → contratos y calidad → logs/métricas/Actuator → tracing
distribuido → fundamentos de mensajería → Kafka → RabbitMQ → EDA → programación reactiva →
WebFlux y R2DBC → concurrencia avanzada → resiliencia → consistencia distribuida → clean/hexagonal/
DDD → Spring Cloud y microservicios → documentación C4 y ADRs → integraciones empresariales →
Spring Batch → Spring AI y RAG → empaquetado y Docker → Kubernetes → CI/CD y DevSecOps → proyecto
integrador.

---

## Delimitación de alcance (decidido con el usuario)

El track **Spring Boot** del repo (`web/public/content/spring-boot/`) cubre fundamentos →
experto de Spring/Spring Boot. Los bloques de **Kubernetes (M39)**, **CI/CD/DevSecOps (M40)** y
la parte de orquestación de contenedores pertenecen al **curso separado Docker/Kubernetes**
(`docs/PLAN-CURSO-DOCKER-KUBERNETES.md`). Microservicios/Kafka/RabbitMQ/gRPC pueden vivir en el
**curso separado de Microservicios** (`docs/PLAN-CURSO-MICROSERVICIOS.md`) además de su
tratamiento dentro del track. La asignación módulo→track se define en el plan de cierre.
