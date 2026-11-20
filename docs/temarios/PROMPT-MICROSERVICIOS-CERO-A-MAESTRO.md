Actúa como un equipo de diseño instruccional de élite compuesto por:

1. Un arquitecto de software con 15+ años operando sistemas distribuidos en 
   producción (Spring Boot, Node.js, Kubernetes, Kafka, Temporal.io, gRPC, GraphQL)
2. Un diseñador instruccional experto en aprendizaje visual, andragogía 
   y diseño de cursos desde cero absoluto hasta nivel maestro
3. Un especialista en accesibilidad y UX educativa
4. Un ilustrador técnico capaz de especificar diagramas, infografías, 
   animaciones y ayudas visuales para cada concepto

OBJETIVO:
Diseñar un curso profesional completo titulado 
"Microservicios de Cero a Maestro: Spring Boot y Node.js por Separado"
con una duración estimada de 28-32 semanas (7-8 meses), que lleve a una persona 
SIN CONOCIMIENTOS PREVIOS de programación hasta un nivel de MAESTRÍA en 
microservicios, capaz de diseñar, construir, desplegar y operar sistemas 
distribuidos en producción.

REGLA DE ORO DEL CURSO (NO NEGOCIABLE):
NINGÚN TEMA SE DA POR CUBIERTO SOLO PORQUE APARECE EN EL TEMARIO.
Cada tema listado debe tener, de forma individual y explícita:
  1. Explicación conceptual progresiva (nivel 0 → intermedio → maestro)
  2. Al menos un ejemplo visual (diagrama, analogía o infografía)
  3. Al menos un snippet de código ejecutable y completo (no pseudocódigo)
  4. Un mini-laboratorio reproducible con instrucciones paso a paso
  5. Un criterio de verificación: cómo sabe el estudiante que entendió el tema
  6. Un error común documentado con su diagnóstico

Si un tema no puede cumplir estos 6 puntos, no se incluye en el curso.

FILOSOFÍA DEL CURSO:
- Progresión visual: cada concepto abstracto se explica con una imagen, 
  diagrama, analogía visual o animación ANTES de tocar código.
- Aprendizaje por capas: cada módulo tiene un "nivel 0" (explicación visual 
  para principiantes absolutos) y un "nivel maestro" (profundidad de arquitecto).
- El fracaso controlado es parte del aprendizaje: laboratorios donde el 
  estudiante rompe el sistema a propósito y aprende a diagnosticarlo.
- Todo concepto tiene 4 representaciones: analogía visual del mundo real, 
  diagrama técnico, código ejecutable, pregunta de entrevista.

INVENTARIO TÉCNICO OBLIGATORIO (TODOS los temas deben aparecer, 
distribuidos en los módulos correspondientes, y cada uno debe cumplir 
la REGLA DE ORO):

FASE 0: FUNDAMENTOS ABSOLUTOS (4 semanas)
  Módulo 0.1: Qué es un programa, un servidor y una API (analogías visuales)
  Módulo 0.2: Lógica de programación y pensamiento computacional
  Módulo 0.3: Introducción a Java y Node.js lado a lado (comparativa visual)
  Módulo 0.4: Git, terminal, HTTP, JSON, YAML, variables de entorno
  Módulo 0.5: Primer "Hola Mundo" en ambos stacks + Docker básico

FASE 1: SPRING BOOT DE CERO A EXPERTO (12 semanas)
  Módulo 1: Java moderno y Spring Boot esencial
    - Java 21: Streams, Lambdas, Optional, Records, Pattern Matching
    - Virtual Threads (Project Loom)
    - Spring IoC, DI, Bean Lifecycle, ApplicationContext
    - Auto-configuración condicional, @Conditional, starters
    - Multi-module Spring Boot projects
    - Perfiles y configuración externalizada
    - CRaC (Coordinated Restore at Checkpoint)
    - GraalVM Native Image

  Módulo 2: APIs REST y persistencia
    - Spring MVC: DispatcherServlet, Controllers, Validación
    - DTOs, @JsonProperty, Jackson
    - Manejo global de excepciones (@ControllerAdvice)
    - Spring Data JPA, Hibernate, entidades, relaciones, transacciones
    - Criteria API y Specifications
    - Flyway/Liquibase
    - PostgreSQL y MySQL

  Módulo 3: Testing y calidad
    - JUnit 5, Mockito, MockMvc
    - Testcontainers
    - Contract Testing con Pact y Pact Broker
    - ArchUnit
    - SonarQube

  Módulo 4: Caching y rendimiento
    - Caching con Redis: @Cacheable, @CacheEvict, TTL
    - Patrones: Read-Through, Write-Behind, Write-Through
    - Distributed Locking con Redlock y Fencing Tokens
    - Cache stampede y solución con locks

  Módulo 5: Introducción a microservicios y DDD
    - Monolito vs Microservicios vs SOA
    - DDD: Bounded Contexts, Agregados, Eventos de Dominio
    - Spring Modulith
    - 12-Factor App
    - Strangler Fig Pattern
    - Database-per-service

  Módulo 6: Comunicación entre servicios
    - REST síncrono: RestTemplate, WebClient, OpenFeign
    - gRPC: Protocol Buffers, servicios, streaming
    - GraphQL con Spring for GraphQL
    - Mensajería asíncrona: RabbitMQ y Kafka (introducción)
    - Sync vs async: criterios de decisión

  Módulo 7: Spring Cloud e infraestructura
    - Service Discovery: Eureka, Consul
    - API Gateway: Spring Cloud Gateway
    - Config Server: configuración centralizada
    - Load Balancing: Spring Cloud LoadBalancer
    - BFF pattern

  Módulo 8: Resiliencia
    - Resilience4j: Circuit Breaker, Retry, RateLimiter, Bulkhead, TimeLimiter
    - Timeouts en cascada y presupuesto de latencia
    - Fallback strategies
    - Chaos Engineering con Toxiproxy

  Módulo 9: Seguridad
    - Spring Security: filter chain
    - JWT: firmas simétricas vs asimétricas
    - OAuth2 y OIDC
    - Keycloak
    - RBAC y Scopes
    - Token Exchange (RFC 8693)
    - mTLS con Service Mesh
    - HashiCorp Vault
    - Escaneo de vulnerabilidades: Trivy, Snyk

  Módulo 10: Observabilidad
    - Micrometer + Prometheus
    - OpenTelemetry + Zipkin/Jaeger
    - Logging estructurado
    - Grafana: dashboards
    - Alerting basado en p99

  Módulo 11: Mensajería avanzada
    - Kafka profundo: particionamiento, consumer groups
    - Exactly-Once Semantics (EOS)
    - Schema Registry y Avro
    - Dead Letter Topics
    - RabbitMQ: publisher confirms, DLQ
    - NATS

  Módulo 12: Docker, Kubernetes y despliegue
    - Dockerfile multi-stage, distroless
    - Docker Compose
    - Kubernetes: Deployments, Services, ConfigMaps, Secrets
    - Readiness/Liveness Probes
    - HPA
    - Helm
    - Blue-Green y Canary
    - GitOps con ArgoCD

FASE 2: NODE.JS DE CERO A EXPERTO (12 semanas)
  Módulo 13: JavaScript/TypeScript moderno y Node.js esencial
    - ES6+: async/await, Promises, destructuring, modules
    - TypeScript: tipos, interfaces, generics, strict mode
    - Event Loop: fases, microtasks, macrotasks
    - perf_hooks y clinic.js
    - Worker Threads vs Child Processes
    - Backpressure en Streams
    - Graceful shutdown

  Módulo 14: APIs REST con Express y NestJS
    - Express: routing, middleware, error handling
    - NestJS: módulos, controllers, providers, interceptors, guards
    - Validación con Zod o class-validator
    - DTOs
    - OpenAPI/Swagger

  Módulo 15: Persistencia
    - MongoDB + Mongoose
    - PostgreSQL + Prisma/Sequelize
    - Database-per-service
    - Connection pooling y transacciones

  Módulo 16: Testing
    - Jest
    - Supertest
    - Contract Testing con Pact
    - Testcontainers para Node

  Módulo 17: Introducción a microservicios en Node
    - Estructura de carpetas escalable
    - dotenv
    - Service Discovery con Consul
    - Configuración centralizada

  Módulo 18: Comunicación
    - REST con Axios/Fetch
    - gRPC con @grpc/grpc-js
    - GraphQL con Apollo Server
    - KafkaJS, amqplib
    - NATS
    - Sync vs async

  Módulo 19: Resiliencia
    - Circuit Breaker con opossum o cockatiel
    - Retry con jitter
    - Rate Limiting con Redis
    - Timeouts
    - Fallback strategies

  Módulo 20: Seguridad
    - JWT con jsonwebtoken
    - Passport.js
    - Helmet, CORS
    - Prevención de inyecciones NoSQL
    - OWASP Top 10
    - Secretos: AWS Secrets Manager, Vault, Azure Key Vault

  Módulo 21: Observabilidad
    - OpenTelemetry para Node
    - Propagación de traceparent en AMQP/Kafka
    - Pino/Winston
    - ELK o Grafana Loki
    - Prometheus client

  Módulo 22: Mensajería y patrones de datos
    - RabbitMQ: publisher confirms, consumer acknowledgments
    - Deduplicación con Redis
    - Sagas con NestJS CQRS
    - Compensaciones idempotentes
    - Event Sourcing con EventStoreDB o MongoDB
    - Proyecciones materializadas
    - CQRS

  Módulo 23: Docker, Kubernetes y CI/CD
    - Dockerfile multi-stage
    - Kubernetes
    - HPA
    - GitHub Actions
    - Blue-Green y Canary
    - GitOps con ArgoCD

FASE 3: NIVEL MAESTRO — ARQUITECTURA AVANZADA (8 semanas)
  Módulo 24: Gobernanza arquitectónica
    - ADRs
    - Modelo C4
    - ATAM ligero
    - Fitness functions en producción

  Módulo 25: Consistencia distribuida
    - Outbox Pattern + CDC con Debezium
    - Sagas orquestadas con Temporal.io
    - Idempotencia real en consumidores Kafka
    - Exactly-once semantics en la práctica
    - Two-Phase Commit: por qué no usar

  Módulo 26: Mensajería avanzada y event-driven
    - Kafka profundo: transacciones, EOS, Schema Registry
    - RabbitMQ avanzado
    - NATS
    - Event Notification vs Event-Carried State Transfer

  Módulo 27: Seguridad Zero-Trust
    - mTLS con Istio/Linkerd
    - Token Exchange (RFC 8693)
    - Vault
    - Service Mesh

  Módulo 28: FinOps y costo de arquitectura
    - Modelo de costo cloud
    - Right-sizing
    - Break-even Serverless vs Contenedores
    - Observability tax

  Módulo 29: Team Topologies y organización
    - Ley de Conway
    - Stream-aligned, Platform, Enabling teams
    - Carga cognitiva
    - Dimensionamiento de equipos

  Módulo 30: Anti-patrones y cuándo NO usar microservicios
    - Monolito distribuido
    - Sobre-descomposición
    - Sagas innecesarias
    - Fitness functions

  Módulo 31: Migración desde monolito real
    - Strangler Fig
    - Coexistencia monolito + servicios
    - Métricas de éxito
    - Deuda técnica

  Módulo 32: Proyecto Final y Comité de Arquitectura
    - Sistema de reservas con pago externo
    - Saga orquestada con Temporal.io
    - API Gateway con rate limiting
    - Test de carga con Gatling
    - Restricción sobrevenida
    - Rediseño documentado en ADR
    - Defensa ante Architecture Review Board

ESTRUCTURA OBLIGATORIA DE CADA TEMA (aplica a CADA bullet del inventario):

Para cada tema individual, entrega una ficha con esta estructura exacta:

┌─────────────────────────────────────────────────────────────┐
│ FICHA DE TEMA: [nombre exacto del tema]                      │
├─────────────────────────────────────────────────────────────┤
│ 1. UBICACIÓN: Módulo X, Lección Y                            │
│ 2. PRERREQUISITOS: qué debe saber el estudiante antes        │
│ 3. OBJETIVO DE APRENDIZAJE: verbo Bloom + resultado medible  │
│ 4. ANALOGÍA VISUAL: descripción de la imagen del mundo real  │
│ 5. DIAGRAMA TÉCNICO: descripción del diagrama (Mermaid/      │
│    Excalidraw) con texto alternativo                         │
│ 6. EXPLICACIÓN NIVEL 0: para quien nunca programó            │
│ 7. EXPLICACIÓN INTERMEDIA: profundidad técnica               │
│ 8. EXPLICACIÓN MAESTRA: trade-offs, alternativas, cuándo NO  │
│ 9. CÓDIGO EJECUTABLE: snippet completo con comentarios,      │
│    dependencias y versión. Debe correr tal cual.             │
│ 10. MINI-LABORATORIO: pasos reproducibles con comandos       │
│     exactos, output esperado y captura comentada             │
│ 11. VERIFICACIÓN: cómo comprueba el estudiante que entendió  │
│     (test que debe pasar, output esperado, pregunta)         │
│ 12. ERROR COMÚN: qué suele fallar + cómo diagnosticarlo      │
│     visualmente                                              │
│ 13. PREGUNTA DE ENTREVISTA: con respuesta modelo             │
│ 14. ANTI-PATRÓN RELACIONADO: qué evitar y cómo se ve         │
└─────────────────────────────────────────────────────────────┘

REGLAS ADICIONALES DE CALIDAD:

- Cada snippet de código debe ser autónomo: incluir imports, 
  dependencias (pom.xml o package.json mínimo), y configuración.
- Cada laboratorio debe especificar el output esperado exacto 
  (texto de consola, respuesta HTTP, captura descrita).
- Cada tema debe tener al menos un test que el estudiante pueda 
  ejecutar para verificar su comprensión (no solo "leer y entender").
- Los temas que dependen de infraestructura (Kafka, Redis, 
  PostgreSQL) deben usar Docker Compose reproducible.
- Los temas de seguridad deben incluir el "antes" (vulnerable) 
  y el "después" (seguro) con código de ambos.
- Los temas de resiliencia deben incluir un script que simule 
  el fallo (ej. Toxiproxy) y demuestre el comportamiento.
- Ningún tema puede remitir a "ver documentación oficial" como 
  única explicación. La explicación debe estar en el curso.

FORMATO DE ENTREGA FINAL:

1. Portada visual del curso (paleta, tipografía, estilo gráfico)
2. Mapa visual del curso completo (3 fases, progresión, conexiones)
3. Tabla de contenidos con duración, dificultad y dependencias
4. Índice de fichas: una ficha por CADA tema del inventario 
   (esto es obligatorio, no opcional)
5. Glosario visual: 120 términos con definición corta e ícono
6. Cheat sheets descargables por fase
7. Plantillas: ADR, rúbrica del Comité, diario de aprendizaje
8. Checklist de herramientas con versiones mínimas:
   Java 21, Spring Boot 3.3+, Node 20 LTS, NestJS 10+, Kafka 3.6+,
   Temporal 1.22+, Kubernetes 1.28+, Keycloak 24+, Testcontainers 1.19+
9. Estimación de costo de infraestructura con precios reales
   y alternativas gratuitas
10. Guía de accesibilidad

CRITERIO DE ACEPTACIÓN DEL CURSO:
El curso se considera completo solo si:
- El 100% de los temas del inventario tiene su ficha completa (14 puntos)
- El 100% de los snippets de código son ejecutables sin modificaciones
- El 100% de los laboratorios tiene output esperado documentado
- El 100% de los temas tiene al menos un test de verificación
- Existe un repositorio Git con todos los laboratorios organizados 
  por módulo y ejecutables con Docker Compose

RESTRICCIONES:
- Comprensible para quien NUNCA ha programado. La Fase 0 no asume nada.
- Cada concepto técnico se presenta primero con imagen o analogía, LUEGO con código.
- Cada decisión técnica con al menos 2 alternativas y trade-off explícito.
- Al menos 3 ejercicios donde la respuesta correcta sea "NO usar microservicios".
- Herramientas visuales gratuitas o de bajo costo.
- Tono motivador y cercano, español neutro, sin condescendencia.

ENTREGA EN MARKDOWN estructurado, con una ficha por tema, tablas para 
comparativas y rúbricas, bloques de código con sintaxis resaltada, y 
descripciones detalladas de cada ayuda visual.