# Temario completo de Node.js — índice de expansión

> Documento vivo de cobertura. Los archivos de lección enlazados son el contenido canónico. El índice conserva todos los temas existentes; un tema sin subtemas 4-pasos sigue pendiente aunque ya tenga explicación anterior.

**Proyecto continuo:** API operativa de entregas y workers RutaFlow.
**Prerrequisito de entrada:** JavaScript, terminal y HTTP; el módulo 0 comienza por el runtime..
**Duración objetivo:** temas de 20–45 minutos; cada tema se divide en 3–6 acciones de 5–15 minutos.
**Estado estructural:** 2/83 temas migrados; auditoría estructural actualizada el 2026-11-03.

## Índice de módulos y temas

Los enlaces abren el Markdown de lección que la aplicación publica. La etiqueta `[4 pasos]` refleja solo criterios estructurales detectados; no significa que el ejemplo se haya ejecutado ni que una revisión pedagógica humana lo haya aprobado.

### Módulo 0: El runtime de Node — V8, libuv y el Event Loop

[Abrir lección completa](../web/public/content/node/modulo-0.md)

- [pendiente de migrar] Tema 1: Node no es "JavaScript en el servidor" sin más
- [pendiente de migrar] Tema 2: Fases del Event Loop de Node
- [pendiente de migrar] Tema 3: process, global y módulos core
- [pendiente de migrar] Tema 4: Event-driven architecture y non-blocking I/O

### Módulo 1: Módulos, npm/pnpm y gestión de dependencias

[Abrir lección completa](../web/public/content/node/modulo-1.md)

- [pendiente de migrar] Tema 1: package.json y semver
- [pendiente de migrar] Tema 2: Lockfiles e instalación reproducible
- [pendiente de migrar] Tema 3: Workspaces — monorepos con npm/pnpm
- [pendiente de migrar] Tema 4: Scripts de ciclo de vida
- [pendiente de migrar] Tema 5: Publicar y versionar un paquete npm (público o privado)
- [pendiente de migrar] Tema 6: ESM y CommonJS en el mismo proyecto

### Módulo 2: Sistema de archivos y streams

[Abrir lección completa](../web/public/content/node/modulo-2.md)

- [pendiente de migrar] Tema 1: fs/promises frente a callbacks
- [pendiente de migrar] Tema 2: Streams básicos: Readable, Writable y Transform
- [pendiente de migrar] Tema 3: Backpressure: write() y el evento drain
- [pendiente de migrar] Tema 4: pipeline() para componer streams de forma segura

### Módulo 3: Servidores HTTP nativos

[Abrir lección completa](../web/public/content/node/modulo-3.md)

- [pendiente de migrar] Tema 1: El modelo request/response
- [pendiente de migrar] Tema 2: Routing manual
- [pendiente de migrar] Tema 3: Parsing de body y headers
- [pendiente de migrar] Tema 4: Códigos de estado y content negotiation
- [pendiente de migrar] Tema 5: Paginación por cursor y límites de entrada comprobables

### Módulo 4: Express/Fastify — routing y middleware

[Abrir lección completa](../web/public/content/node/modulo-4.md)

- [pendiente de migrar] Tema 1: Middleware — orden de ejecución y next()
- [pendiente de migrar] Tema 2: Routers anidados
- [pendiente de migrar] Tema 3: Validación de entrada con Zod y manejo centralizado de errores
- [pendiente de migrar] Tema 4: Express frente a Fastify
- [pendiente de migrar] Tema 5: WebSocket — comunicación en tiempo real bidireccional
- [pendiente de migrar] Tema 6: Subida de archivos — multipart y validación segura

### Módulo 5: Bases de datos — drivers y ORMs

[Abrir lección completa](../web/public/content/node/modulo-5.md)

- [pendiente de migrar] Tema 1: PostgreSQL desde Node con el driver puro
- [pendiente de migrar] Tema 2: Prisma — schema, migraciones y queries tipadas
- [pendiente de migrar] Tema 3: Pool de conexiones y transacciones
- [pendiente de migrar] Tema 4: MongoDB con Mongoose y otras alternativas de ORM

### Módulo 6: Autenticación y autorización

[Abrir lección completa](../web/public/content/node/modulo-6.md)

- [pendiente de migrar] Tema 1: Hashing de contraseñas
- [pendiente de migrar] Tema 2: JWT — access y refresh tokens
- [pendiente de migrar] Tema 3: Middleware de autenticación y control de roles
- [pendiente de migrar] Tema 4: OAuth 2.0 y Passport.js
- [pendiente de migrar] Tema 5: Sesiones, cookies seguras y protección CSRF
- [pendiente de migrar] Tema 6: Flujo de login completo — de `/api/auth/login` a una ruta protegida

### Módulo 7: Testing e integración continua

[Abrir lección completa](../web/public/content/node/modulo-7.md)

- [pendiente de migrar] Tema 1: Vitest y Supertest — pruebas de integración HTTP reales
- [pendiente de migrar] Tema 2: Testcontainers — bases de datos de prueba reales y efímeras
- [pendiente de migrar] Tema 3: Mocks de servicios externos y CI
- [pendiente de migrar] Tema 4: Alternativas de testing y debugging
- [pendiente de migrar] Tema 5: node:test — test runner nativo sin dependencias
- [pendiente de migrar] Tema 6: TDD práctico: rojo, verde y refactor con node:test

### Módulo 8: Patrones asíncronos avanzados

[Abrir lección completa](../web/public/content/node/modulo-8.md)

- [pendiente de migrar] Tema 1: Worker Threads para trabajo CPU-bound
- [pendiente de migrar] Tema 2: Cluster module y balanceo entre procesos
- [pendiente de migrar] Tema 3: Colas de trabajo con BullMQ
- [pendiente de migrar] Tema 4: PM2, memory leaks y heap snapshots
- [pendiente de migrar] Tema 5: Redis para caché, idempotencia y Pub/Sub

### Módulo 9: Observabilidad y manejo de errores en producción

[Abrir lección completa](../web/public/content/node/modulo-9.md)

- [pendiente de migrar] Tema 1: Logging estructurado
- [pendiente de migrar] Tema 2: Correlation ID por request
- [pendiente de migrar] Tema 3: Excepciones no capturadas y graceful shutdown
- [pendiente de migrar] Tema 4: REST, GraphQL y gRPC
- [pendiente de migrar] Tema 5: Métricas Prometheus y trazas distribuidas con OpenTelemetry

### Módulo 10: Seguridad en Node

[Abrir lección completa](../web/public/content/node/modulo-10.md)

- [pendiente de migrar] Tema 1: Cabeceras seguras con helmet
- [pendiente de migrar] Tema 2: Rate limiting
- [pendiente de migrar] Tema 3: Inyección SQL y sanitización contra XSS
- [pendiente de migrar] Tema 4: OWASP API Security Top 10 y auditoría de dependencias
- [pendiente de migrar] Tema 5: CVE, CWE y npm audit en el pipeline

### Módulo 11: Despliegue y contenedores

[Abrir lección completa](../web/public/content/node/modulo-11.md)

- [pendiente de migrar] Tema 1: Dockerfile multi-stage para Node
- [pendiente de migrar] Tema 2: Variables de entorno por ambiente y healthchecks
- [pendiente de migrar] Tema 3: PM2, contenedores y zero-downtime deploys
- [pendiente de migrar] Tema 4: Nginx como reverse proxy y serverless

### Módulo 12: Proyecto integrador — API productiva

[Abrir lección completa](../web/public/content/node/modulo-12.md)

- [pendiente de migrar] Tema 1: Arquitectura por capas
- [pendiente de migrar] Tema 2: Uniendo cada módulo del track
- [pendiente de migrar] Tema 3: Qué le falta a esta API para producción real
- [pendiente de migrar] Tema 4: Próximos pasos — microservicios, colas de mensajes y TypeScript
- [pendiente de migrar] Tema 5: Posiciones espaciales y Socket.IO con orden recuperable
- [pendiente de migrar] Tema 6: Archivos y notificaciones push sin convertirlos en autorización

### Módulo 13: TypeScript, contratos e integraciones confiables

[Abrir lección completa](../web/public/content/node/modulo-13.md)

- [pendiente de migrar] Tema 1: Tipos estáticos dentro, datos desconocidos en la frontera
- [pendiente de migrar] Tema 2: Un contrato HTTP es comportamiento, no solo documentación
- [pendiente de migrar] Tema 3: Reintentar sin duplicar el efecto
- [pendiente de migrar] Tema 4: Webhooks verificables y recuperación por reconciliación
- [pendiente de migrar] Tema 5: OpenAPI como contrato ejecutable

### Módulo 14: Node.js avanzado

[Abrir lección completa](../web/public/content/node/modulo-14.md)

- [pendiente de migrar] Tema 1: TypeScript en Node.js
- [pendiente de migrar] Tema 2: GraphQL avanzado y Federation
- [pendiente de migrar] Tema 3: Compensar una entrega cuando falla un paso
- [pendiente de migrar] Tema 4: Serverless multi-cloud
- [pendiente de migrar] Tema 5: Docker productivo con Node
- [pendiente de migrar] Tema 6: CI/CD y promoción de artefactos
- [4 pasos] Tema 7: Kafka desde Node: clave, grupo consumidor y offset
  - ✓ Subtema 7.1: Envía un evento con la clave del pedido · 10 min
  - ✓ Subtema 7.2: Reparte particiones con un grupo · 10 min
  - ✓ Subtema 7.3: Reconoce redelivery e idempotencia · 15 min
- [4 pasos] Tema 8: RabbitMQ desde Node: exchange, cola y confirmaciones
  - ✓ Subtema 8.1: Enruta una etiqueta con exchange y binding · 10 min
  - ✓ Subtema 8.2: Confirma una publicación y un procesamiento · 10 min
  - ✓ Subtema 8.3: Rechaza y enruta un mensaje inválido a la DLQ · 15 min

### Módulo 15: Deno y Bun

[Abrir lección completa](../web/public/content/node/modulo-15.md)

- [pendiente de migrar] Tema 1: Deno y permisos explícitos
- [pendiente de migrar] Tema 2: Bun reúne runtime, paquetes, pruebas y bundler
- [pendiente de migrar] Tema 3: Migrar un proyecto Node a Bun sin perder reproducibilidad
- [pendiente de migrar] Tema 4: Elegir entre Node, Deno y Bun

## Comparación de cobertura con fuentes de referencia

La tabla registra presencia de áreas en el inventario del track, no profundidad profesional. La columna de migración usa la auditoría automática de estructura; los temas pendientes requieren revisión de contenidos, ejemplos y fuentes antes de declarar el curso exhaustivo.

| Área de referencia | Módulos del inventario | Estado de contenido | Estado de cuatro pasos |
|---|---|---|---|
| Runtime, Event Loop, módulos y paquetes | M0–M1 | Inventariada; revisión temática manual pendiente | Migración parcial |
| Filesystem, streams, backpressure y HTTP | M2–M3 | Inventariada; revisión temática manual pendiente | Migración parcial |
| Express/Fastify, validación y WebSocket | M4 | Inventariada; revisión temática manual pendiente | Migración parcial |
| PostgreSQL, MongoDB, auth y pruebas | M5–M7 | Inventariada; revisión temática manual pendiente | Migración parcial |
| Workers, colas, Redis y event-driven | M8, M14 | Inventariada; revisión temática manual pendiente | Migración parcial |
| Logging, métricas, trazas y seguridad | M9–M10 | Inventariada; revisión temática manual pendiente | Migración parcial |
| Docker, despliegue, CI/CD y proyecto | M11–M12, M14 | Inventariada; revisión temática manual pendiente | Migración parcial |
| TypeScript, Kafka, RabbitMQ, Deno y Bun | M13–M15 | Inventariada; revisión temática manual pendiente | Migración parcial |

### Fuentes consultadas

- [roadmap.sh Node.js](https://roadmap.sh/nodejs)
- [Node.js Learn](https://nodejs.org/en/learn)
- [Kafka JavaScript client](https://docs.confluent.io/kafka-clients/javascript/current/overview.html)
- [RabbitMQ tutorials and confirms](https://www.rabbitmq.com/tutorials/tutorial-one-javascript)

### Huecos y límites reportados

- El repositorio contiene 83 temas en 16 módulos; 2 cumplen hoy los marcadores estructurales de 3–6 subtemas y cuatro pasos.
- No hay base para afirmar que el track esté completo: la comparación con la fuente de referencia está pendiente de revisión humana módulo por módulo.
- Los elementos de la fuente que todavía deben verificarse de forma explícita están enumerados en la tabla anterior; cualquier técnica crítica que no tenga tema propio debe añadirse conservando el currículo base.
- La ejecución de ejemplos, el comportamiento con brokers/plataformas reales y la calidad pedagógica humana se registran por separado.

## Proyecto integrador y hito final

Evoluciona el proyecto **API operativa de entregas y workers RutaFlow** a través de los módulos. Al cerrar cada módulo, conserva el código, salida esperada, fallo diagnosticado y evidencia de la decisión técnica. El capstone queda pendiente hasta que el índice completo y sus huecos de referencia hayan sido revisados.
