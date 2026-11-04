# Temario completo de Spring Boot — índice de expansión

> Documento vivo de cobertura. Los archivos de lección enlazados son el contenido canónico. El índice conserva todos los temas existentes; un tema sin subtemas 4-pasos sigue pendiente aunque ya tenga explicación anterior.

**Proyecto continuo:** RutaFlow: plataforma de entregas basada en servicios.
**Prerrequisito de entrada:** Java, HTTP, SQL y pruebas; los módulos iniciales vuelven a presentar cada herramienta..
**Duración objetivo:** temas de 20–45 minutos; cada tema se divide en 3–6 acciones de 5–15 minutos.
**Estado estructural:** 26/111 temas migrados; auditoría estructural actualizada el 2026-11-03.

## Índice de módulos y temas

Los enlaces abren el Markdown de lección que la aplicación publica. La etiqueta `[4 pasos]` refleja solo criterios estructurales detectados; no significa que el ejemplo se haya ejecutado ni que una revisión pedagógica humana lo haya aprobado.

### Módulo 0: Fundamentos de Spring — IoC y DI

[Abrir lección completa](../web/public/content/spring-boot/modulo-0.md)

- [4 pasos] Tema 1: Inversión de control y el contenedor de Spring
  - ✓ Subtema 1.1: Declara el contrato y la primera implementación · 10 min
  - ✓ Subtema 1.2: Deja que Spring conecte el servicio · 10 min
  - ✓ Subtema 1.3: Observa el cableado con una petición HTTP · 10 min
- [4 pasos] Tema 2: Inyección por constructor vs por campo
  - ✓ Subtema 2.1: Prueba la regla sin iniciar Spring · 10 min
  - ✓ Subtema 2.2: Observa la inyección de campo con el contexto · 10 min
  - ✓ Subtema 2.3: Elige la prueba que responde tu pregunta · 10 min
- [4 pasos] Tema 3: Estereotipos, autoconfiguración y scopes
  - ✓ Subtema 3.1: Asigna a cada estereotipo un papel claro · 10 min
  - ✓ Subtema 3.2: Inspecciona lo que aporta una dependencia · 10 min
  - ✓ Subtema 3.3: Pide un bean nuevo cuando de verdad lo necesitas · 15 min

### Módulo 1: Spring Boot CLI y estructura de proyecto

[Abrir lección completa](../web/public/content/spring-boot/modulo-1.md)

- [4 pasos] Tema 1: Spring Initializr y starters
  - ✓ Subtema 1.1: Genera el proyecto y encuentra sus piezas · 10 min
  - ✓ Subtema 1.2: Conecta el starter web con una ruta · 10 min
  - ✓ Subtema 1.3: Revisa qué agrupa el starter y quién fija versiones · 10 min
- [4 pasos] Tema 2: application.yml vs application.properties
  - ✓ Subtema 2.1: Lee una clave desde YAML · 10 min
  - ✓ Subtema 2.2: Escribe la misma clave en Properties y observa prioridad · 10 min
  - ✓ Subtema 2.3: Sobrescribe el archivo desde la terminal · 10 min
- [4 pasos] Tema 3: Perfiles y estructura por capas
  - ✓ Subtema 3.1: Combina una configuración base con un perfil · 10 min
  - ✓ Subtema 3.2: Activa el perfil y comprueba el valor aplicado · 10 min
  - ✓ Subtema 3.3: Separa HTTP, regla y acceso a datos · 15 min

### Módulo 2: REST APIs con Spring Web

[Abrir lección completa](../web/public/content/spring-boot/modulo-2.md)

- [pendiente de migrar] Tema 1: Por qué DTOs en vez de entidades directamente
  - ✓ Subtema 1.1: Crea una entidad y guárdala en H2 · 10 min
  - ✓ Subtema 1.2: Devuelve solo el contrato público · 15 min
  - pendiente Subtema 1.3: Cambia el modelo interno sin cambiar la API · 10 min
- [4 pasos] Tema 2: Validación con Bean Validation y ResponseEntity
  - ✓ Subtema 2.1: Rechaza datos inválidos antes de guardar · 10 min
  - ✓ Subtema 2.2: Devuelve 200 o 404 según exista la tarea · 15 min
  - ✓ Subtema 2.3: Comprueba las reglas con casos límite · 10 min
- [4 pasos] Tema 3: Manejo centralizado de errores con @ControllerAdvice
  - ✓ Subtema 3.1: Da un formato útil al error de validación · 15 min
  - ✓ Subtema 3.2: Convierte un ID ausente en 404 con el mismo formato · 15 min
  - ✓ Subtema 3.3: Sigue el error desde la petición hasta la respuesta · 10 min
- [4 pasos] Tema 4: Lombok y MapStruct sin exponer datos internos
  - ✓ Subtema 4.1: Genera getters durante la compilación · 10 min
  - ✓ Subtema 4.2: Genera el mapeo con MapStruct · 15 min
  - ✓ Subtema 4.3: Haz que cada campo interno nuevo exija una decisión · 10 min
- [4 pasos] Tema 5: OpenAPI con springdoc: el contrato como prueba
  - ✓ Subtema 5.1: Publica el contrato de tu API · 10 min
  - ✓ Subtema 5.2: Describe éxito y errores en cada endpoint · 15 min
  - ✓ Subtema 5.3: Evita cambios silenciosos con una prueba · 15 min
- [4 pasos] Tema 6: Paginación HTTP con validación y un límite de recursos explícito
  - ✓ Subtema 6.1: Devuelve una página desde JPA · 15 min
  - ✓ Subtema 6.2: Rechaza tamaños fuera del contrato · 15 min
  - ✓ Subtema 6.3: Comprueba el límite y el costo del paginado · 10 min

### Módulo 3: Persistencia con Spring Data JPA

[Abrir lección completa](../web/public/content/spring-boot/modulo-3.md)

- [4 pasos] Tema 1: Entidades y repositorios derivados
  - ✓ Subtema 3.1 · Guardar y recuperar una entidad · 8 min
  - ✓ Subtema 3.2 · Filtrar con el nombre del método · 10 min
  - ✓ Subtema 3.3 · Escribir JPQL cuando ayuda a leer · 10 min
- [pendiente de migrar] Tema 2: El problema N+1 y su corrección
- [pendiente de migrar] Tema 3: Migraciones con Flyway

### Módulo 4: Spring Security

[Abrir lección completa](../web/public/content/spring-boot/modulo-4.md)

- [pendiente de migrar] Tema 1: SecurityFilterChain moderno
- [pendiente de migrar] Tema 2: Filtro JWT y autorización por rol
- [pendiente de migrar] Tema 3: CORS y CSRF
- [pendiente de migrar] Tema 4: Protección SSRF con InetAddressFilter (Spring Boot 4.1)
- [pendiente de migrar] Tema 5: Flujo de login completo — de `/api/auth/login` a una ruta protegida

### Módulo 5: Configuración, perfiles y manejo de errores

[Abrir lección completa](../web/public/content/spring-boot/modulo-5.md)

- [pendiente de migrar] Tema 1: @ConfigurationProperties tipado
- [pendiente de migrar] Tema 2: Fallar rápido al arranque
- [pendiente de migrar] Tema 3: Manejo global de excepciones consistente entre entornos

### Módulo 6: Testing en Spring Boot

[Abrir lección completa](../web/public/content/spring-boot/modulo-6.md)

- [pendiente de migrar] Tema 1: Slices de testing — @WebMvcTest
- [pendiente de migrar] Tema 2: @DataJpaTest con Testcontainers
- [pendiente de migrar] Tema 3: @SpringBootTest completo y estrategia de pirámide de tests

### Módulo 7: Observabilidad con Actuator

[Abrir lección completa](../web/public/content/spring-boot/modulo-7.md)

- [pendiente de migrar] Tema 1: Actuator y health checks personalizados
- [pendiente de migrar] Tema 2: Métricas de negocio con Micrometer
- [pendiente de migrar] Tema 3: Liveness vs readiness

### Módulo 8: Mensajería — Kafka/RabbitMQ

[Abrir lección completa](../web/public/content/spring-boot/modulo-8.md)

- [4 pasos] Tema 1: Producers y consumers con Spring Kafka
  - ✓ Subtema 1.1: Publica el evento con la clave del envío · 10 min
  - ✓ Subtema 1.2: Conecta dos grupos consumidores · 10 min
  - ✓ Subtema 1.3: Comprueba orden y entrega con un broker · 15 min
- [4 pasos] Tema 2: Dead-letter queue
  - ✓ Subtema 2.1: Configura reintentos limitados y DLT · 10 min
  - ✓ Subtema 2.2: Provoca un mensaje inválido y comprueba los intentos · 10 min
  - ✓ Subtema 2.3: Ajusta la política y atiende los mensajes recuperados · 15 min
- [4 pasos] Tema 3: Productor idempotente y transacciones (exactly-once)
  - ✓ Subtema 3.1: Configura idempotencia del productor · 10 min
  - ✓ Subtema 3.2: Guarda el envío y el evento con outbox · 15 min
  - ✓ Subtema 3.3: Deduplica el efecto con inbox y delimita exactly-once · 15 min
- [pendiente de migrar] Tema 4: Rebalanceo de consumer groups y partition assignment
- [pendiente de migrar] Tema 5: Kafka frente a RabbitMQ
- [pendiente de migrar] Tema 6: Spring Cloud Stream y binders de Kafka/RabbitMQ
- [pendiente de migrar] Tema 7: Kafka Streams con Spring para transformar eventos
- [pendiente de migrar] Tema 8: Avro y Schema Registry para contratos de eventos
- [pendiente de migrar] Tema 9: RabbitMQ con Spring AMQP: routing, ack y prefetch

### Módulo 9: Programación reactiva con WebFlux

[Abrir lección completa](../web/public/content/spring-boot/modulo-9.md)

- [pendiente de migrar] Tema 1: Mono y Flux
- [pendiente de migrar] Tema 2: WebClient y composición no bloqueante
- [pendiente de migrar] Tema 3: Cuándo WebFlux vale la complejidad, y R2DBC

### Módulo 10: Microservicios con Spring Cloud

[Abrir lección completa](../web/public/content/spring-boot/modulo-10.md)

- [4 pasos] Tema 1: Config Server y service discovery
  - ✓ Subtema 1.1: Sirve configuración desde archivos · 15 min
  - ✓ Subtema 1.2: Separa configuración por perfil y diagnostica una app desconocida · 10 min
  - ✓ Subtema 1.3: Resuelve una instancia por nombre lógico · 10 min
- [4 pasos] Tema 2: Spring Cloud Gateway
  - ✓ Subtema 2.1: Crea una ruta para pedidos · 15 min
  - ✓ Subtema 2.2: Cambia el path que recibe el servicio · 10 min
  - ✓ Subtema 2.3: Diagnostica una ruta que no coincide · 10 min
- [4 pasos] Tema 3: Circuit breaker con Resilience4j
  - ✓ Subtema 3.1: Abre el circuito después de cuatro fallos · 10 min
  - ✓ Subtema 3.2: Comprueba que OPEN detiene llamadas reales · 10 min
  - ✓ Subtema 3.3: Prueba recuperación en HALF_OPEN · 10 min
- [4 pasos] Tema 4: OAuth2/OIDC, Keycloak y Token Relay sin perder la frontera de autorización
  - ✓ Subtema 4.1: Protege la API con el emisor de Keycloak · 15 min
  - ✓ Subtema 4.2: Distingue autenticación de permiso · 10 min
  - ✓ Subtema 4.3: Comprueba que el recurso pertenece a la persona · 10 min
- [pendiente de migrar] Tema 5: HTTP Interfaces, deadlines y descubrimiento según el entorno
- [pendiente de migrar] Tema 6: Spring gRPC para comunicación interna de alta frecuencia (Spring Boot 4.1)
- [pendiente de migrar] Tema 7: DDD para decidir límites y propiedad de datos
- [pendiente de migrar] Tema 8: Orquestación de microservicios con Temporal y Spring Boot
- [pendiente de migrar] Tema 9: Spring Modulith para comprobar fronteras antes de separar servicios
- [pendiente de migrar] Tema 10: Spring Cloud Bus para propagar cambios de configuración
- [pendiente de migrar] Tema 11: Micrometer Tracing entre servicios
- [pendiente de migrar] Tema 12: Contract testing entre productor y consumidor

### Módulo 11: Empaquetado y despliegue

[Abrir lección completa](../web/public/content/spring-boot/modulo-11.md)

- [pendiente de migrar] Tema 1: Fat JAR vs capas de Docker
- [pendiente de migrar] Tema 2: GraalVM native image
- [pendiente de migrar] Tema 3: Health checks para Kubernetes

### Módulo 12: Proyecto integrador — microservicio productivo

[Abrir lección completa](../web/public/content/spring-boot/modulo-12.md)

- [pendiente de migrar] Tema 1: Arquitectura del microservicio integrador
- [pendiente de migrar] Tema 2: Integrando seguridad, persistencia y observabilidad
- [pendiente de migrar] Tema 3: Cierre del track y próximos pasos

### Módulo 13: Consistencia, contratos y operación distribuida

[Abrir lección completa](../web/public/content/spring-boot/modulo-13.md)

- [pendiente de migrar] Tema 1: `@Transactional` funciona en una frontera, no como encantamiento
- [pendiente de migrar] Tema 2: Recuperación implica duplicación segura
- [pendiente de migrar] Tema 3: Contratos ejecutables protegen despliegues independientes
- [pendiente de migrar] Tema 4: Observabilidad sirve a un objetivo y a una decisión

### Módulo 14: Backend de entregas: MySQL espacial, archivos y tiempo real

[Abrir lección completa](../web/public/content/spring-boot/modulo-14.md)

- [pendiente de migrar] Tema 1: CRUD API y contratos
- [pendiente de migrar] Tema 2: MySQL y datos espaciales
- [pendiente de migrar] Tema 3: JPA e Hibernate Spatial
- [pendiente de migrar] Tema 4: JWT Bearer y autorización por roles
- [pendiente de migrar] Tema 5: Tiempo real con STOMP
- [pendiente de migrar] Tema 6: Archivos y notificaciones push

### Módulo 15: Spring Master: hexagonal, reactivo y microservicios

[Abrir lección completa](../web/public/content/spring-boot/modulo-15.md)

- [pendiente de migrar] Tema 1: Backpressure real en WebFlux con reactor-test
- [pendiente de migrar] Tema 2: Contenedores Testcontainers reutilizados entre clases
- [pendiente de migrar] Tema 3: Arquitectura hexagonal verificada con ArchUnit
- [pendiente de migrar] Tema 4: Bulkhead y RateLimiter de Resilience4j
- [pendiente de migrar] Tema 5: Saga con compensación real
- [pendiente de migrar] Tema 6: Event Sourcing con replay real
- [pendiente de migrar] Tema 7: Compensación que falla: conservar trabajo pendiente y reintentar sin duplicar
- [pendiente de migrar] Tema 8: Clean Architecture y DDD táctico: caso de uso antes que framework

### Módulo 16: JPA de Spring Boot — Hibernate, Lazy vs Eager y N+1

[Abrir lección completa](../web/public/content/spring-boot/modulo-16.md)

- [pendiente de migrar] Tema 1: Relaciones, lado propietario y ciclo de vida
- [pendiente de migrar] Tema 2: LAZY, EAGER, N+1 y consultas de caso de uso

### Módulo 17: JDBC, DAO y transacciones en Spring Boot

[Abrir lección completa](../web/public/content/spring-boot/modulo-17.md)

- [pendiente de migrar] Tema 1: DataSource, JdbcTemplate y DAO
- [pendiente de migrar] Tema 2: `@Transactional`, rollback y límites de transacción

### Módulo 18: Autenticación y backend seguro con Spring Security

[Abrir lección completa](../web/public/content/spring-boot/modulo-18.md)

- [pendiente de migrar] Tema 1: SecurityFilterChain y autorización
- [pendiente de migrar] Tema 2: DTO validation, CORS, JWT/OIDC y clientes HTTP

### Módulo 19: Spring Batch — jobs, chunks y procesamiento masivo

[Abrir lección completa](../web/public/content/spring-boot/modulo-19.md)

- [pendiente de migrar] Tema 1: Job, Step, Tasklet y chunk processing
- [pendiente de migrar] Tema 2: Reinicio, JobParameters, retry, skip y listeners

### Módulo 20: Integraciones Spring — scheduling, eventos, correo y caché

[Abrir lección completa](../web/public/content/spring-boot/modulo-20.md)

- [pendiente de migrar] Tema 1: Scheduling y tareas periódicas
- [pendiente de migrar] Tema 2: Eventos locales, eventos transaccionales y mensajería
- [pendiente de migrar] Tema 3: Correo con Spring Mail y entrega recuperable
- [pendiente de migrar] Tema 4: Caché con Spring Cache, Caffeine y Redis
- [pendiente de migrar] Tema 5: @Async y ejecutores: trabajo en segundo plano con límites
- [pendiente de migrar] Tema complementario: Integraciones empresariales, SOAP y fronteras de protocolo
- [pendiente de migrar] Tema 6: Spring AI: ChatClient y herramientas con autorización fuera del modelo
- [pendiente de migrar] Tema 7: RAG desde la frontera de datos: recuperar evidencia autorizada antes de generar

### Módulo 21: Eventos con Spring Kafka

[Abrir lección completa](../web/public/content/spring-boot/modulo-21.md)

- [4 pasos] Tema 1: Productor, tópico, key y consumidor
  - ✓ Subtema 1.1 · Publica el evento con la key del envío · 8 min
  - ✓ Subtema 1.2 · Recibe el evento en dos grupos · 8 min
  - ✓ Subtema 1.3 · Comprueba partición y orden · 9 min
- [4 pasos] Tema 2: Reintentos, DLT, entrega al menos una vez e idempotencia
  - ✓ Subtema 2.1 · Limita reintentos y guarda en DLT · 10 min
  - ✓ Subtema 2.2 · Evita aplicar el mismo evento dos veces · 10 min
  - ✓ Subtema 2.3 · Revierte inbox y proyección juntas · 10 min
- [4 pasos] Tema 3: Outbox transaccional y flujo de negocio
  - ✓ Subtema 3.1 · Guarda envío y evento en una transacción · 10 min
  - ✓ Subtema 3.2 · Publica y marca después del ack · 10 min
  - ✓ Subtema 3.3 · Reproduce el envío y comprueba deduplicación · 10 min

### Módulo 22: Arquitectura: puertos, C4 y decisiones

[Abrir lección completa](../web/public/content/spring-boot/modulo-22.md)

- [pendiente de migrar] Tema 1: Hexagonal: puertos que hablan el idioma del dominio
- [pendiente de migrar] Tema 2: C4: contexto, contenedores, componentes y código
- [pendiente de migrar] Tema 3: ADR: decisiones con contexto, alternativas y consecuencias

### Módulo 23: Spring Modulith y límites del monolito modular

[Abrir lección completa](../web/public/content/spring-boot/modulo-23.md)

- [pendiente de migrar] Tema 1: módulos y límites entre paquetes
- [pendiente de migrar] Tema 2: eventos entre módulos sin importar implementación
- [pendiente de migrar] Tema 3: documentación generada y mapa de dependencias
- [pendiente de migrar] Tema 4: pruebas de integración por módulo

### Módulo 24: Spring GraphQL para pedidos y entregas

[Abrir lección completa](../web/public/content/spring-boot/modulo-24.md)

- [pendiente de migrar] Tema 1: schema-first con tipos y consultas
- [pendiente de migrar] Tema 2: data fetchers, relaciones y problema N+1
- [pendiente de migrar] Tema 3: mutations y subscriptions
- [pendiente de migrar] Tema 4: pruebas GraphQL con GraphQlTester

### Módulo 25: La misma función con Kafka y RabbitMQ

[Abrir lección completa](../web/public/content/spring-boot/modulo-25.md)

- [4 pasos] Tema 1: bindings y destinations
  - ✓ Subtema 1.1: Transforma un envío en una ruta · 8 min
  - ✓ Subtema 1.2: Conecta la función a destinos · 8 min
  - ✓ Subtema 1.3: Rechaza una entrada incompleta · 9 min
- [4 pasos] Tema 2: binder Kafka y binder RabbitMQ
  - ✓ Subtema 2.1: Publica y consume con Kafka · 10 min
  - ✓ Subtema 2.2: Publica y consume con RabbitMQ · 10 min
  - ✓ Subtema 2.3: Compara lo que realmente cambia · 10 min
- [4 pasos] Tema 3: reintentos, error handler y dead-letter
  - ✓ Subtema 3.1: Limita los reintentos en Kafka · 10 min
  - ✓ Subtema 3.2: Declara DLQ en RabbitMQ · 10 min
  - ✓ Subtema 3.3: Distingue fallo transitorio de dato inválido · 10 min
- [4 pasos] Tema 4: test binder y límites de la prueba
  - ✓ Subtema 4.1: Verifica mapping en memoria · 8 min
  - ✓ Subtema 4.2: Comprueba una entrada inválida · 8 min
  - ✓ Subtema 4.3: Separa prueba local y broker real · 9 min

## Comparación de cobertura con fuentes de referencia

La tabla registra presencia de áreas en el inventario del track, no profundidad profesional. La columna de migración usa la auditoría automática de estructura; los temas pendientes requieren revisión de contenidos, ejemplos y fuentes antes de declarar el curso exhaustivo.

| Área de referencia | Módulos del inventario | Estado de contenido | Estado de cuatro pasos |
|---|---|---|---|
| IoC, beans, configuración, AOP y starters | M0–M1, M5 | Inventariada; revisión temática manual pendiente | Migración parcial |
| REST, MVC, validación y documentación | M2, M17 | Inventariada; revisión temática manual pendiente | Migración parcial |
| JDBC, JPA, transacciones y migraciones | M3, M13, M16–M17 | Inventariada; revisión temática manual pendiente | Migración parcial |
| Seguridad, autenticación y autorización | M4, M18 | Inventariada; revisión temática manual pendiente | Migración parcial |
| Pruebas, observabilidad y Actuator | M6–M7 | Inventariada; revisión temática manual pendiente | Migración parcial |
| Kafka, eventos, entrega e idempotencia | M8, M13–M15, M21 | Inventariada; revisión temática manual pendiente | Migración parcial |
| Microservicios, Spring Cloud y resiliencia | M10, M20–M22, M25 | Inventariada; revisión temática manual pendiente | Migración parcial |
| Batch, GraphQL, Modulith y empaquetado | M9, M11–M12, M19, M23–M24 | Inventariada; revisión temática manual pendiente | Migración parcial |

### Fuentes consultadas

- [roadmap.sh Spring Boot](https://roadmap.sh/spring-boot)
- [Spring Boot Reference](https://docs.spring.io/spring-boot/reference/)
- [Spring Cloud Stream Reference](https://docs.spring.io/spring-cloud-stream/reference/)

### Huecos y límites reportados

- El repositorio contiene 111 temas en 26 módulos; 26 cumplen hoy los marcadores estructurales de 3–6 subtemas y cuatro pasos.
- No hay base para afirmar que el track esté completo: la comparación con la fuente de referencia está pendiente de revisión humana módulo por módulo.
- Los elementos de la fuente que todavía deben verificarse de forma explícita están enumerados en la tabla anterior; cualquier técnica crítica que no tenga tema propio debe añadirse conservando el currículo base.
- La ejecución de ejemplos, el comportamiento con brokers/plataformas reales y la calidad pedagógica humana se registran por separado.

## Proyecto integrador y hito final

Evoluciona el proyecto **RutaFlow: plataforma de entregas basada en servicios** a través de los módulos. Al cerrar cada módulo, conserva el código, salida esperada, fallo diagnosticado y evidencia de la decisión técnica. El capstone queda pendiente hasta que el índice completo y sus huecos de referencia hayan sido revisados.
