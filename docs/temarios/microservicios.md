# Temario propuesto · Microservicios (curso completo)

**Estado:** propuesta para aprobación del dueño. M0 y M1 ya existen y se conservan. M2–M11 son nuevos y no
tienen lecciones escritas.
**Fecha de revisión de fuentes:** 2026-11-18.
**Identificador de ruta:** `microservices` (existente).
**Base:** la propuesta de 12 módulos de `docs/auditoria/calidad-java-spring-microservicios-rutaflow.md` (§3.2),
corregida así:
- Se incorpora el reparto aprobado de DevOps M19–M21.
- Las horas se calculan con la regla de la metodología (temas de 20–45 min), no con la cifra estimada de 111 h.
- Strangler Fig, BFF y CQRS quedan en temas propios, como pidió el dueño (specs/013).

## 1. Público y prerrequisitos

Para desarrolladores backend que ya construyen una API y necesitan decidir si conviene distribuirla, y cómo
hacerlo sin perder consistencia, observabilidad ni capacidad de cambio.

**Regla de reparto con Spring Boot** (auditoría, §3.1): este curso enseña el patrón, sus decisiones y sus
fallos con Java, HTTP y PostgreSQL. Spring Boot enseña la implementación con Spring y remite aquí para la teoría.

| Prerrequisito | Módulos | Para qué |
|---|---|---|
| Java | M0–M3, M5 (concurrencia), M8 (build) y M9 (pruebas) | Lo que usan M0 y M1 (auditoría, §3.1) |
| Fundamentos | M3 (HTTP), M4 (SQL) y M10 (sistemas distribuidos) | Base conceptual |
| Docker | M7 (Compose) antes de M7 de este curso; M4 y M8 antes de M9 | Pruebas con dependencias reales y despliegue |
| Diseño de sistemas | M4 (consistencia), recomendado antes de M5 | Modelos de consistencia |

Kubernetes es opcional. M9 lo usa si la persona ya lo cursó; si no, despliega con Compose.

## 2. Resultado final medible

Sobre el RutaFlow modular de M1:
1. **Strangler Fig:** Cotización se extrae a un servicio propio. Un proxy enruta `/cotizaciones` al servicio
   nuevo y el resto al monolito. Hay una ejecución en paralelo con comparación de respuestas, y la reversión se
   demuestra.
2. **BFF:** un backend para la app del conductor y otro para la consola web, cada uno con su contrato y
   respuesta degradada ante un fallo parcial.
3. **CQRS:** el tracking público se lee desde una vista materializada que se alimenta de eventos, y la demora
   entre escritura y lectura queda medida y visible para el cliente.
4. **Saga** de asignación de conductor con una compensación que falla y se recupera.
5. **Outbox transaccional** con consumidor idempotente: un mensaje duplicado no produce efectos dobles.
6. **Pruebas de contrato** entre consumidor y proveedor que bloquean un cambio incompatible.
7. **Trazas** W3C de extremo a extremo, un SLO con su burn rate y un runbook ejecutado ante un fallo parcial.

## 3. Versiones de referencia

| Pieza | Versión | Fuente y fecha |
|---|---|---|
| Java | JDK 25 LTS. M0–M1 fijan hoy 27.0.1, y la auditoría pide alinearlos a 25 | `docs/VERSIONES.md`; auditoría §5.2 |
| Spring Boot | 4.1.x, solo en las columnas «Spring» (enlaces) | `docs/VERSIONES.md` |
| Spring Cloud | 2025.1.x (Oakwood), compatible con Boot 4.1.x desde 2025.1.2. La versión actual es 2025.1.4 | [spring.io/projects/spring-cloud](https://spring.io/projects/spring-cloud), 2026-11-18 |
| Docker Engine / Kubernetes | 29 / 1.37 | `docs/VERSIONES.md` |
| Broker y PostgreSQL | Se fijan al escribir M4. El patrón se enseña primero con PostgreSQL | — |

## 4. Qué se incorpora desde otros cursos (reparto aprobado en specs/016)

| Origen | Contenido | Destino | Tratamiento |
|---|---|---|---|
| DevOps M19 T1 | Límites, acoplamiento y monolito modular | M1 T1–T2 (existentes) | Se fusiona. No se crea un tema nuevo |
| DevOps M19 T2 | Lenguaje ubicuo y contextos delimitados | M2 T1 | — |
| DevOps M19 T3 | Agregados, invariantes y eventos de dominio | M2 T1 y M4 T1 | — |
| DevOps M19 T4 | ADR y fitness functions | M1 T9–T11 y T13 (existentes) | Se fusiona |
| DevOps M20 T1 | Eventos de dominio y de integración | M4 T1 | — |
| DevOps M20 T2 | Outbox transaccional | M4 T2 | — |
| DevOps M20 T3 | Idempotencia y orden | M4 T4–T5 | Amplía M0 T5 y T7 sin repetirlos |
| DevOps M20 T4 | Sagas y compensaciones | M5 T2–T3 | — |
| DevOps M21 T1 | Descomponer por capacidad: dos servicios, un contrato | M2 T2 | — |
| DevOps M21 T2 | Datos por servicio: propiedad, composición y réplicas | M5 T1 | — |
| DevOps M21 T3 | Timeouts, reintentos y cortacircuitos | M6 T1–T2 | Amplía M0 T2–T4 |
| DevOps M21 T4 | Trazas, correlación y SLO | M8 T1 y M8 T5 | — |

Temas de Spring Boot que implementan los patrones y remiten aquí:
- M10 T2 y T4 (gateway): desde M3.
- M8 y M13 T2 (mensajería y outbox): desde M4.
- M15 T5–T7 y M10 T8 (saga, Event Sourcing y CQRS): desde M5.
- M10 T3 y M15 T4 (resiliencia): desde M6.
- M10 T12 y M13 T3 (contratos): desde M7.
- M7 y M10 T11 (observabilidad): desde M8.
- M11: desde M9.
- M18: desde M10.

Los números de módulo de Spring Boot cambiarán con la fusión a 21 módulos (specs/016 R3); los enlaces se
actualizan entonces.

## 5. Módulos

### M0 · Antes de distribuir: proceso, red y falacias (existente, se conserva)
**Objetivo:** reproducir los fallos que aparecen al separar procesos, antes de elegir frameworks.
- T1 · Ejecutar dos procesos Java y comprobar su socket HTTP · 45 min
- T2 · Imponer un presupuesto temporal a una solicitud HTTP · 45 min
- T3 · Propagar un deadline absoluto entre servicios HTTP · 45 min
- T4 · Clasificar un resultado desconocido antes de reintentar · 45 min
- T5 · Evitar efectos duplicados con una clave idempotente · 45 min
- T6 · Seleccionar un reloj según la evidencia temporal · 40 min
- T7 · Preservar el orden de eventos por versión del agregado · 45 min
- T8 · Evolucionar un contrato JSON sin romper consumidores · 45 min
- T9 · Rechazar un frame excesivo antes de reservar memoria · 35 min
- T10 · Refutar falacias distribuidas mediante evidencia reproducible · 45 min

Este módulo tiene 10 temas y supera el máximo de 6. Es contenido existente y aprobado; se propone, como
cambio opcional, dividirlo en «M0a Red y tiempo» (T1–T6) y «M0b Orden, contratos y falacias» (T7–T10).
**Duración:** 7 h 15 min

### M1 · Construir un monolito modular antes de extraer servicios (existente, se conserva)
**Objetivo:** organizar RutaFlow por capacidades y decidir una extracción con evidencia.
- T1 · Distinguir estructura lógica de unidad de despliegue · 40 min
- T2 · Evaluar autonomía antes de extraer un proceso · 45 min
- T3 · Agrupar código por capacidad de negocio · 40 min
- T4 · Proteger la API pública de un módulo · 45 min
- T5 · Mantener reglas de dominio libres de frameworks · 40 min
- T6 · Sustituir adaptadores mediante puertos · 45 min
- T7 · Representar dependencias de módulos como un grafo · 35 min
- T8 · Romper ciclos según el tipo de acoplamiento · 45 min
- T9 · Bloquear accesos a internals con ArchUnit · 40 min
- T10 · Detectar ciclos de paquetes con ArchUnit · 35 min
- T11 · Evitar falsos verdes en fitness functions · 35 min
- T12 · Medir señales que justifican una extracción · 40 min
- T13 · Registrar una decisión reversible en un ADR · 40 min
- T14 · Separar mitos y verdades de Domain-Driven Design · 40 min

Cambio opcional, ya señalado por la auditoría: mover T14 a la posición 3 y dividir el módulo en «M1a
Capacidades y puertos» (T1–T6, T14) y «M1b Fronteras verificadas y decisión» (T7–T13).
**Duración:** 9 h 25 min

### M2 · Migrar sin reescribir: Strangler Fig y capa anticorrupción
**Objetivo:** extraer el primer servicio sin apagar el monolito y con vuelta atrás.
**Origen:** DevOps M19 T2–T3 y M21 T1.
- T1 · Contextos delimitados y mapa de contextos antes de cortar · 40 min
- T2 · Elegir la primera costura: Cotización, con las señales de M1 T12 · 35 min
- T3 · **Strangler Fig:** proxy de enrutamiento con `/cotizaciones` al servicio nuevo y el resto al monolito · 45 min
- T4 · **Capa anticorrupción:** traducir el modelo heredado sin contaminar el nuevo · 45 min
- T5 · Ejecución en paralelo y comparación de respuestas antes del corte · 40 min
- T6 · Revertir el enrutamiento y retirar el código heredado · 35 min

**Hito RutaFlow:** Cotización sirve tráfico real detrás del proxy y una reversión queda demostrada.
**Duración:** 4 h

### M3 · APIs hacia clientes: gateway, BFF y composición
**Objetivo:** dar a cada cliente la API que necesita sin acoplarlo a los servicios internos.
**Origen:** nuevo.
- T1 · Gateway: enrutamiento y descarga de responsabilidades (autenticación, límite de tasa) sin lógica de negocio · 40 min
- T2 · **BFF:** un backend para la app del conductor y otro para la consola web, según la regla «one experience, one BFF» · 45 min
- T3 · Composición de API con presupuesto de deadline (reutiliza M0 T3) · 40 min
- T4 · Respuesta degradada ante un fallo parcial · 40 min
- T5 · Versionado y deprecación de la API pública (cabeceras `Deprecation` y `Sunset`) · 35 min

**Hito RutaFlow:** dos BFF con contratos distintos. Al caer Cotización, la app sigue mostrando envíos.
**Duración:** 3 h 20 min

### M4 · Mensajería fiable entre servicios
**Objetivo:** publicar y consumir eventos sin perderlos ni duplicar efectos.
**Origen:** DevOps M20 T1–T3 y M19 T3.
- T1 · Eventos de dominio y de integración; mensaje frente a llamada · 40 min
- T2 · Outbox transaccional con polling publisher en PostgreSQL · 45 min
- T3 · Transaction log tailing (CDC): qué cambia y qué cuesta · 40 min
- T4 · Consumidor idempotente con tabla inbox · 40 min
- T5 · Orden por clave, reintentos y cola de mensajes muertos · 40 min
- T6 · Evolución de esquemas de eventos (amplía M0 T8) · 35 min

**Hito RutaFlow:** `EnvioCreado` sale por outbox. Un duplicado inyectado no produce dos efectos.
**Duración:** 4 h

### M5 · Datos distribuidos: saga, CQRS y Event Sourcing
**Objetivo:** mantener la consistencia de negocio sin transacciones distribuidas.
**Origen:** DevOps M21 T2 y M20 T4.
- T1 · Base de datos por servicio y consultas que cruzan servicios · 40 min
- T2 · Saga coreografiada · 45 min
- T3 · Saga orquestada y compensación que falla · 45 min
- T4 · **CQRS:** modelo de escritura frente a vista materializada para el tracking público · 45 min
- T5 · Consistencia eventual visible: leer lo propio escrito y versión en la respuesta · 35 min
- T6 · Event Sourcing: cuándo sí y cuándo no; replay y snapshots · 45 min

**Hito RutaFlow:** asignación por saga y tracking servido desde la vista CQRS, con la demora medida.
**Duración:** 4 h 15 min

### M6 · Resiliencia y control de carga
**Objetivo:** que un servicio lento no tumbe a los demás.
**Origen:** DevOps M21 T3.
- T1 · Reintento con backoff, jitter y presupuesto de reintentos · 40 min
- T2 · Circuit breaker · 40 min
- T3 · Bulkhead y límite de concurrencia · 35 min
- T4 · Límite de tasa y descarte de carga · 35 min
- T5 · Nivelación de carga con cola · 35 min
- T6 · Probar la resiliencia inyectando fallos · 45 min

**Hito RutaFlow:** con Cotización degradada, la API de envíos mantiene su p95.
**Duración:** 3 h 50 min

### M7 · Pruebas de un sistema distribuido
**Objetivo:** detectar incompatibilidades antes de desplegar.
**Origen:** nuevo.
- T1 · Pirámide adaptada: unidad, componente y contrato · 35 min
- T2 · Prueba de componente del servicio con dependencias reales en contenedor · 45 min
- T3 · Contratos guiados por el consumidor · 45 min
- T4 · Probar el broker: duplicados y desorden · 40 min
- T5 · Entorno efímero por rama y datos de prueba · 40 min

**Hito RutaFlow:** un cambio incompatible en Cotización rompe el pipeline del BFF.
**Duración:** 3 h 25 min

### M8 · Observabilidad y operación
**Objetivo:** encontrar la causa de un fallo parcial en minutos.
**Origen:** DevOps M21 T4.
- T1 · Propagación de traza W3C `traceparent` con OpenTelemetry · 40 min
- T2 · Métricas RED y cardinalidad · 35 min
- T3 · Logs correlacionados y de auditoría · 35 min
- T4 · Health Check API y dependencias · 35 min
- T5 · SLI, SLO y burn rate · 40 min
- T6 · Runbook y postmortem de un fallo parcial · 40 min

**Hito RutaFlow:** traza completa de crear envío → saga → tracking, y un postmortem escrito.
**Duración:** 3 h 45 min

### M9 · Despliegue y plataforma
**Objetivo:** desplegar servicios de forma independiente y segura.
**Origen:** nuevo; implementación en los cursos Docker y Kubernetes.
- T1 · Un servicio por contenedor y configuración externalizada · 35 min
- T2 · Descubrimiento del lado del cliente frente al del servidor · 35 min
- T3 · Estrategias: rolling/ramped, blue-green, canary y feature flags (enlaza el tema ramped de DevOps, specs/013) · 45 min
- T4 · Sidecar y service mesh: cuándo compensan (implementación en Kubernetes M13 T3) · 35 min
- T5 · Despliegue independiente con contrato verificado · 40 min

**Hito RutaFlow:** Cotización v2 en canary, sin desplegar el resto.
**Duración:** 3 h 10 min

### M10 · Seguridad entre servicios
**Objetivo:** que cada servicio solo pueda hacer lo que necesita.
**Origen:** nuevo.
- T1 · Access token y propagación de identidad · 40 min
- T2 · Autorización por servicio con mínimo privilegio · 40 min
- T3 · mTLS y confianza cero · 40 min
- T4 · Secretos y rotación · 35 min

**Hito RutaFlow:** el BFF del conductor no puede llamar a la liquidación.
**Duración:** 2 h 35 min

### M11 · Proyecto integrador
**Objetivo:** reunir las siete evidencias del apartado 2.
- T1 · Hito 1: Cotización extraída con Strangler Fig y capa anticorrupción (M2) · 45 min
- T2 · Hito 2: BFF del conductor y de la consola (M3) · 45 min
- T3 · Hito 3: outbox, saga de asignación y tracking con CQRS (M4 y M5) · 45 min
- T4 · Hito 4: resiliencia, contratos, trazas y SLO (M6–M8) · 45 min
- T5 · Hito 5: despliegue canary y defensa de las decisiones con ADR (M9 y M10) · 45 min

Trabajo autónomo del proyecto: 10 h.
**Duración:** 3 h 45 min de temas + 10 h de proyecto.

## 6. Proyecto integrador sobre RutaFlow

Sistema: el RutaFlow modular de M1 en Java. Al final tiene el monolito reducido y los servicios Cotización y
Tracking (lectura CQRS), dos BFF y PostgreSQL por servicio, levantados con Compose. Como el backend de
referencia es Spring Boot (specs/016 R5), cada hito trae una variante de implementación en Spring que enlaza al
tema de Spring Boot correspondiente. La rúbrica son las siete evidencias del apartado 2.

## 7. Horas estimadas

Fórmula: suma de las duraciones de los temas más las horas de proyecto. Total: **52 h 45 min de temas + 10 h de proyecto = 62 h 45 min (≈ 63 h)**.

Este total es menor que las «≈ 111 h» de la propuesta de la auditoría. Aquí cada hora sale de temas de 20–45 min
según la metodología, y la auditoría estimaba 8–12 h por módulo sin desglosar los temas.

En M0 y M1 se usan las duraciones que declaran los encabezados de sus temas: 7 h 15 min y 9 h 25 min, que
suman 16 h 40 min. Coincide con las 16,7 h que midió la auditoría (§5.1). El track declara 11 h y 12 h (23 h),
porque incluye 6 h de proyectos. Al registrar el curso, el track debe mostrar los temas y el proyecto por
separado.

## 8. Cobertura frente a fuentes primarias

**[microservices.io](https://microservices.io/patterns/index.html)** (Chris Richardson):

| Categoría | Patrones | Dónde |
|---|---|---|
| Architectural style | Monolithic architecture, Microservice architecture | M0 y M1 |
| Service boundaries | Decompose by business capability / by subdomain, Service per team | M1 T3, M2 T1–T2 |
| Refactoring to services | **Strangler Application**, **Anti-corruption layer** | M2 T3, M2 T4 |
| Service collaboration | Database per Service, Saga, API Composition, **CQRS**, Domain event, Event sourcing, Command-side replica | M5 T1–T4, M3 T3, M4 T1, M5 T6 |
| Transactional messaging | Transactional outbox, Transaction log tailing, Polling publisher | M4 T2–T3 |
| Testing | Consumer-driven contract test, Service component test | M7 T2–T3 |
| Deployment | Service instance per Container, Service deployment platform | M9 T1 |
| Cross-cutting concerns | Externalized configuration | M9 T1 |
| Communication styles | Messaging, Remote Procedure Invocation, Idempotent Consumer | M4 T1, M0, M4 T4 |
| External API | API gateway, **Backend for front-end** | M3 T1, M3 T2 |
| Service discovery | Client-side y Server-side discovery, Service registry | M9 T2 |
| Reliability | Circuit Breaker | M6 T2 |
| Security | Access Token | M10 T1 |
| Observability | Log aggregation, Application metrics, Audit logging, Distributed tracing, Health check API, Log deployments and changes | M8 T1–T4 |
| Fuera de alcance | Shared database (antipatrón; se menciona en M5 T1), Serverless deployment, Microservice chassis, Service Template, UI composition | — |

**[Azure Architecture Center: patrones](https://learn.microsoft.com/en-us/azure/architecture/patterns/)**:
- Strangler Fig y Anti-Corruption Layer: M2.
- Backends for Frontends, Gateway Routing, Gateway Offloading y Gateway Aggregation: M3.
- Publisher-Subscriber, Idempotent Consumer y Competing Consumers: M4.
- Saga, Choreography, Compensating Transaction, CQRS, Materialized View y Event Sourcing: M5.
- Retry, Circuit Breaker, Bulkhead, Rate Limiting y Queue-Based Load Leveling: M6.
- Health Endpoint Monitoring: M8 T4.
- Sidecar y Ambassador: M9 T4.
- External Configuration Store: M9 T1.
- Federated Identity: M10 T1.

**Martin Fowler**, [Strangler Fig](https://martinfowler.com/bliki/StranglerFigApplication.html) (versión del
2024-08-22): reemplazo gradual con arquitectura de transición. Es la base de M2 T3 y T5–T6.

**Sam Newman**:
- [Backends For Frontends](https://samnewman.io/patterns/architectural/bff/): un BFF por experiencia de usuario,
  propiedad del equipo de la interfaz. Es la base de M3 T2.
- *Building Microservices*, 2.ª ed. (2021) y *Monolith to Microservices* ([samnewman.io/books](https://samnewman.io/books/)):
  base de M1, M2 y M9.

## 9. Fuera de alcance, con motivo

- Implementaciones con frameworks concretos: se quedan en Spring Boot y se enlazan.
- Plataformas serverless: están en el curso Cloud.

## Fuentes consultadas (2026-11-18)

- https://microservices.io/patterns/index.html
- https://learn.microsoft.com/en-us/azure/architecture/patterns/
- https://martinfowler.com/bliki/StranglerFigApplication.html
- https://samnewman.io/patterns/architectural/bff/
- https://samnewman.io/books/
- https://spring.io/projects/spring-cloud
- `docs/auditoria/calidad-java-spring-microservicios-rutaflow.md` (§3, §5.2)
