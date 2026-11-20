# Temario objetivo · Microservicios de Cero a Maestro (Spring Boot con Gradle y Node.js por separado)

**Estado:** Aprobado por el dueño el 2026-11-20, con la opción recomendada en cada decisión (specs/021, Fase 3, criterios Z2 y Z11). Este documento no cambia
ninguna lección ni ningún laboratorio: solo fija qué temas tendrá el curso, en qué orden y de dónde sale cada uno.
**Fecha de revisión de fuentes:** 2026-11-20.
**Identificador de ruta:** `microservices` (el actual).
**Base:** las 187 fichas en 37 módulos de `docs/microservicios/03-tabla-de-contenidos.md`,
`docs/microservicios/04-indice-de-fichas.md` y `docs/temarios/microservicios-inventario.json`, que desarrollan el prompt
del dueño (`docs/temarios/PROMPT-MICROSERVICIOS-CERO-A-MAESTRO.md`).
**Sustituye a:** `docs/temarios/microservicios.md` (propuesta del 2026-11-18, 12 módulos y 78 temas, anterior a las 187
fichas). Su cobertura de microservices.io y de los patrones de Azure se recoge aquí.
**Reglas aplicadas:** specs/021 regla 4 (de cero a experto: al menos la mitad en Integración o Experto), regla 5
(cobertura contra fuentes), regla 7 (Gradle por defecto en la JVM) y regla 10 (siempre la versión extendida).

## 1. Resumen

### 1.1 El curso hoy

| Medida | Valor |
|---|---:|
| Fases | 4 (Fundamentos, Spring Boot, Node.js, Maestro) |
| Módulos | 37 |
| Fichas | 187 (16 + 72 + 59 + 40) |
| Palabras en las lecciones (`web/public/content/microservices/`) | 563.625 |
| Laboratorios | 37 carpetas en `examples/microservicios/`, una por módulo |
| Módulos fuera del rango de 3 a 7 temas | 5 (0.2 y 0.3 con 2; 1 y 12 con 8; 9 con 9) |
| Títulos de ficha idénticos dentro del curso | ver el apartado 3.1 |
| Semanas declaradas | 32 |

El curso es sólido donde el prompt del dueño lo pedía: cada módulo tiene su laboratorio, y la pista Spring, la
pista Node y la Fase 3 cubren los patrones de microservices.io casi enteros. Lo que este temario corrige:

1. **La teoría de sistemas distribuidos no se enseña.** Raft aparece 28 veces como propiedad de una herramienta («usa
   Raft») y nunca se explica; PACELC, relojes de Lamport, relojes vectoriales, linealizabilidad, CRDT y hash consistente
   tienen 0 menciones. Sin eso no se puede razonar por qué una saga o un quórum se comportan como lo hacen.
2. **No hay recuperación ante desastres ni multi-región.** RPO y RTO tienen 0 menciones; multi-región, 2.
3. **No hay multi-tenencia** (0 menciones), **ni micro frontends** (0), **ni data mesh** (0), **ni postmortems** (0).
4. **La operación se queda en el p99.** El presupuesto de error tiene 2 menciones; no hay descarte de carga (0) ni
   planificación de capacidad; Gatling solo aparece en el proyecto final y k6 una vez.
5. **Kafka, RabbitMQ y NATS se repiten en vez de profundizar.** NATS tiene tres fichas con el mismo título; Kafka
   Streams (4 menciones), Kafka Connect (13), almacenamiento por niveles (0), réplica entre clústeres (0) y Flink (0)
   no tienen ficha.
6. **Temporal y Debezium tienen una ficha cada uno.** Faltan el modelo de ejecución, el versionado de workflows,
   `continue-as-new` (0 menciones), las señales y los snapshots incrementales de Debezium (0).
7. **La evolución de datos sin corte no existe como tema:** expand/contract tiene 11 menciones sueltas, backfill 0,
   y descomponer la base de datos del monolito 0.
8. **El diseño de APIs no tiene módulo:** versionado (43 menciones en 17 módulos), idempotencia del lado de la API,
   paginación, ETag y contract-first quedan repartidos o ausentes en la pista Spring.
9. **Las dos pistas no son simétricas.** La pista Node no tiene caché, ni gateway/BFF, ni OAuth2 con Keycloak, ni Kafka a
   fondo; la pista Spring no tiene pipeline de CI ni OWASP. Quien haga una sola pista se queda sin esos conceptos.
10. **Los laboratorios de Spring nacieron en Maven.** La migración a Gradle (Kotlin DSL, wrapper y catálogo de versiones)
    está en curso en `examples/microservicios/`; este temario ya da Gradle por la vía principal.

Las cifras de menciones salen de `grep` sobre `web/public/content/microservices/modulo-*.md` el 2026-11-20. Indican
presencia del término, no calidad: un tema con 0 menciones falta seguro; uno con muchas menciones puede estar bien cubierto
dentro de otra ficha, y por eso se marca «está pero básico» y no «falta».

### 1.2 El curso objetivo

| Fase | Módulos hoy | Módulos objetivo | Temas hoy | Temas objetivo | Ya está | Está pero básico (la ficha) | Está pero básico (tema nuevo que hoy es un apartado) | Falta | Semanas estimadas |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Fase 0 · Fundamentos absolutos | 5 | 6 | 16 | 25 | 15 | 1 | 0 | 9 | 4 → 4 |
| Fase 1 · Spring Boot de cero a experto (Gradle) | 12 | 18 | 72 | 121 | 63 | 9 | 16 | 33 | 10 → 21 |
| Fase 2 · Node.js de cero a experto | 11 | 13 | 59 | 83 | 57 | 2 | 7 | 17 | 10 → 14 |
| Fase 3 · Nivel maestro | 9 | 25 | 40 | 166 | 38 | 2 | 35 | 91 | 8 → 28 |
| **Total** | **37** | **62** | **187** | **395** | **173** | **14** | **58** | **150** | **32 → 68** |

- **395 temas en 62 módulos**: los 187 actuales (ninguno se pierde ni cambia de identificador) más **208 temas nuevos**. De los nuevos, 150 no existen en el curso y 58 existen solo como apartado o mención dentro de otra ficha.
- De las 187 fichas actuales, **173 quedan como «ya está»** y **14 como «está pero básico»** (se dice qué les falta).
- **21 módulos nuevos** y **6 módulos que salen de dividir** los que pasaban de 7 temas (Módulos 1, 9 y 12) o pasarían de 7 al añadir lo que falta (Módulo 20). Todos los módulos objetivo tienen de 3 a 7 temas.
- **Por nivel:** Fundamentos 25 · Aplicación 45 · Integración 154 · Experto 171. Integración + Experto = 325 de 395 (**82,3 %**): cumple la regla 4 de specs/021 (al menos la mitad).
- **Temas espejo:** 62 filas quedan marcadas como dueña o como espejo; 19 de ellas son temas nuevos que completan la pista que no tenía el concepto (apartado 3).
- **Semanas:** estimación proporcional al ritmo actual (187 fichas en 32 semanas a 10–12 h por semana). Cada tema fija sus minutos al escribirse (regla 6).
- Los números de este apartado los calcula un script a partir de las tablas del apartado 2; no se escribieron a mano. El mismo script comprueba que F001–F187 aparecen una sola vez, que ningún título se repite, que cada módulo tiene de 3 a 7 temas y que el nivel no baja dentro de un módulo.

### 1.3 Lo que falta, en una página

| Bloque que pide specs/021 | Dónde queda en el objetivo | Estado de partida |
|---|---|---|
| Consenso y teoría (CAP, PACELC, relojes, Raft) | Módulo 24B | falta casi entero |
| Replicación, particionado, aislamiento, identificadores | Módulo 24C | falta |
| Diseño de APIs, versionado e idempotencia | Módulos 2B y 14 | básico y repartido |
| Contratos (HTTP, gRPC, eventos) | Módulos 3, 6B, 26 y 31E | Pact está; `.proto`, AsyncAPI y CloudEvents no |
| Multi-tenencia | Módulo 27C | falta |
| Caché distribuida | Módulos 4 y 15 | Spring está; Redis en clúster y la pista Node faltan |
| Búsqueda | Módulo 25C T5 | falta |
| CDC | Módulos 25 y 25C | una ficha; faltan señales, snapshots e inbox |
| Streaming | Módulos 26B y 26C | falta |
| Workflows y ejecución duradera | Módulos 25 y 25B | una ficha; falta el modelo de ejecución |
| Service mesh | Módulos 27 y 27B | mTLS y ambient están; tráfico, canario y multi-clúster no |
| Seguridad avanzada | Módulos 9, 9B, 27 y 27C | OAuth2, Vault y SPIFFE están; política, cifrado por campo y auditoría no |
| Multi-región y recuperación ante desastres | Módulo 31D | falta |
| Capacidad y pruebas de carga | Módulo 31C | Gatling solo en el proyecto final |
| Chaos engineering | Módulos 8 y 31B | Toxiproxy está; caos en Kubernetes y game days, básico |
| SLO y presupuesto de error | Módulos 10 y 31B | básico |
| Plataforma interna | Módulo 29B | falta |
| Migraciones de datos sin corte | Módulos 12B, 25D y 31 | falta como tema |
| Feature flags y entrega progresiva | Módulo 12B | Blue-Green y Canary están; flags y análisis automático no |
| Pruebas de un sistema distribuido | Módulos 3, 16 y 31E | Pact y Testcontainers están; componente, producción y verificación no |

### 1.4 Versiones vistas en las fuentes el 2026-11-20

`docs/microservicios/08-herramientas-y-versiones.md` (consultado el 2026-11-19) sigue siendo la referencia de versiones
del curso. Aquí solo se anota lo que mostraban las fuentes al revisar el temario:

| Pieza | Lo que mostraba la fuente | Fuente |
|---|---|---|
| Spring Boot | la referencia publicada es la de 4.2.0; el curso fija 4.1.3 | `SBR` |
| Spring Cloud | tren 2025.1.4, 15 proyectos (Gateway 5.0.4, Config 5.0.6, Kubernetes 5.0.4, Vault 5.0.3…). La página dice «supports Spring Boot 4.0.9» | `SC` |
| Micrometer | 1.18.0 | `MIC` |
| Apache Kafka | 4.4 es la versión más nueva del menú; su apartado de operación incluye KRaft, Tiered Storage, Consumer Rebalance Protocol, Transaction Protocol y Eligible Leader Replicas | `KAF` |
| RabbitMQ | 4.4.1 | `RMQ` |
| Kubernetes | la documentación es la de v1.37; CKA y CKAD se examinan sobre v1.37 | `K8S`, `CKA`, `CKAD` |
| Istio | 1.32, con el modo ambient como sección propia | `ISTIO` |
| Linkerd | el menú llega a 2.20 y hay una rama «edge» | `LNK` |
| Debezium | 3.7 es la estable más reciente | `DBZ` |
| Libros | *Designing Data-Intensive Applications* 2.ª ed. (O'Reilly, febrero de 2026) · *Fundamentals of Software Architecture* 2.ª ed. (marzo de 2025) · *Building Event-Driven Microservices* 2.ª ed. (septiembre de 2025) · *Team Topologies* 2.ª ed. (23 de septiembre de 2025) · *Microservices Patterns* 2.ª ed. en acceso anticipado (12 de 25 capítulos) | `DDIA2`, `FSA2`, `BEDM2`, `TTK`, `MP` |
| Certificaciones | AWS SAP-C02 (4 dominios) · AZ-305 (habilidades al 17 de abril de 2026) · Google Professional Cloud Architect (6 secciones) · Spring 2V0-72.22 | `SAP`, `AZ305`, `PCA`, `SPRC` |
| Sílabo | MIT 6.5840, primavera de 2026 · Cambridge, Concurrent and Distributed Systems 2025–26 | `MIT`, `CAM` |

## 2. Temario objetivo completo y lineal

**Cómo leer las tablas.** Una fila por tema, en el orden en que se estudia.

- **Módulo:** se conservan las etiquetas actuales (0.1–0.5 y 1–32) y sus archivos `modulo-N.md`. Un módulo nuevo se
  intercala donde toca con una letra (2B, 5B, 24B…) para no renumerar ahora; la renumeración final es la decisión D5.
- **Nivel:** el tramo de specs/021 (Fundamentos, Aplicación, Integración, Experto). No baja dentro de un módulo ni a lo
  largo de una fase. La Fase 2 vuelve a Aplicación porque es una pista paralela a la Fase 1, no su continuación.
- **Estado:**
  - **ya está · F…** — la ficha existe con el alcance pedido.
  - **está pero básico · F…: …** — la ficha existe y se dice qué le falta.
  - **está pero básico · hoy dentro de F…** — es un tema nuevo cuyo contenido hoy es un apartado o una mención dentro
    de esa ficha; hay que darle ficha propia.
  - **falta** — no existe en el curso (o solo como mención suelta, con su recuento).
- **«dueña; espejo en F…» / «espejo de F…»:** par de fichas que enseñan el mismo concepto en las dos pistas (apartado 3).
  **«repetido con F…»:** misma materia a dos profundidades (apartado 3.2).
- **Título:** cuando una ficha actual tenía un título repetido, la tabla muestra el título propuesto; el original está
  en el apartado 3.5.
- **Fuentes:** claves del apartado «Fuentes consultadas». «c.» es el capítulo del libro.

### Fase 0 · Fundamentos absolutos — 6 módulos, 25 temas

Para quien nunca programó. Se añade un módulo (0.6) con lo mínimo de redes, SQL, concurrencia y pruebas que las Fases 1 y 2 dan por sabido. El dueño de esos conceptos es Fundamentos: ver la decisión D8.

#### Módulo 0.1 · Qué es un programa, un servidor y una API (`modulo-0.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Qué es un programa | Fundamentos | ya está · F001 | PROMPT, RBE |
| T2 | Qué es un servidor | Fundamentos | ya está · F002 | PROMPT, RBE |
| T3 | Qué es una API | Fundamentos | ya está · F003 | PROMPT, RBE |

#### Módulo 0.2 · Lógica de programación y pensamiento computacional (`modulo-1.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Lógica de programación | Fundamentos | ya está · F004 | PROMPT |
| T2 | Pensamiento computacional | Fundamentos | ya está · F005 | PROMPT |
| T3 | Estructuras de datos que aparecen en todo el curso: lista, mapa, cola y árbol | Fundamentos | falta · el módulo tiene 2 temas y la regla pide 3 a 7 | REG, RSA |

#### Módulo 0.3 · Java y Node.js lado a lado (`modulo-2.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Java y Node.js lado a lado: sintaxis y ejecución | Fundamentos | ya está · F006 | PROMPT, RBE |
| T2 | Java y Node.js lado a lado: tipos, errores y concurrencia | Fundamentos | ya está · F007 | PROMPT, NODE |
| T3 | Build y dependencias lado a lado: Gradle (wrapper y Kotlin DSL) frente a npm | Fundamentos | falta · regla 7: Gradle es la herramienta por defecto | REG, SBR, NODE |

#### Módulo 0.4 · Git, terminal, HTTP, JSON, YAML y variables de entorno (`modulo-3.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Git | Fundamentos | ya está · F008 | PROMPT, RBE |
| T2 | Terminal | Fundamentos | ya está · F009 | PROMPT |
| T3 | HTTP | Fundamentos | ya está · F010 | PROMPT, RBE, RSD |
| T4 | JSON | Fundamentos | ya está · F011 | PROMPT, RBE |
| T5 | YAML | Fundamentos | ya está · F012 | PROMPT |
| T6 | Variables de entorno | Fundamentos | ya está · F013 | PROMPT, NODE, UNAM |

#### Módulo 0.5 · Primer «Hola Mundo» en ambos stacks y Docker básico (`modulo-4.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Primer «Hola Mundo» en Java | Fundamentos | está pero básico · F014: el módulo nombra Gradle una sola vez: falta construirlo con el wrapper de Gradle | PROMPT, REG, SBR |
| T2 | Primer «Hola Mundo» en Node.js | Fundamentos | ya está · F015 | PROMPT, NODE |
| T3 | Docker básico | Fundamentos | ya está · F016 | PROMPT, UNAM, CEZ |

#### Módulo 0.6 · Redes, datos y pruebas: lo mínimo antes de distribuir (**módulo nuevo**)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | TCP/IP, puertos y DNS: cómo llega una petición a tu servicio | Fundamentos | falta | RBE, RSD, RI2 c.9, RSA |
| T2 | TLS y certificados: qué ocurre en un `https://` | Fundamentos | falta | RBE, RSA |
| T3 | Bases de datos relacionales y SQL mínimo: tablas, claves, JOIN y transacción | Fundamentos | falta | RBE, RSD |
| T4 | Procesos, hilos y concurrencia: qué cambia cuando dos cosas ocurren a la vez | Fundamentos | falta | MIT, CAM, NODE |
| T5 | REST como estilo: recursos, verbos, códigos de estado e idempotencia | Fundamentos | falta | RBE, RSD, UNAM, MP c.3 |
| T6 | Tu primera prueba automatizada en Java y en Node | Fundamentos | falta | RBE, NODE, SBR |
| T7 | Las ocho falacias de la computación distribuida | Fundamentos | falta · hoy 1 sola mención en todo el curso | FSA2 c.9, DDIA2 c.9, CAM |

### Fase 1 · Spring Boot de cero a experto (Gradle) — 18 módulos, 121 temas

Pista Spring Boot. Todos los laboratorios se construyen con Gradle (Kotlin DSL, wrapper y catálogo de versiones); Maven queda como nota de equivalencia. Las fichas marcadas «espejo de Spring M…» repasan un mecanismo cuyo dueño es el curso Spring y enlazan a él.

#### Módulo 1 · Java moderno y Spring Boot esencial (`modulo-5.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Java 21+: Streams, Lambdas, Optional, Records, Pattern Matching | Aplicación | ya está · F017 · repaso; dueño: Java | PROMPT, SPRC |
| T2 | Virtual Threads (Project Loom) | Aplicación | ya está · F018 · repaso; dueño: Java | PROMPT, SBR |
| T3 | Proyecto Spring Boot con Gradle Kotlin DSL: wrapper, plugin de Boot, BOM y catálogo de versiones | Aplicación | está pero básico · hoy dentro de F021: el laboratorio ya se migró a Gradle; falta la ficha que lo explique como vía principal (hoy es parte de F021) | REG, SBR, UNAM |
| T4 | Spring IoC, DI, Bean Lifecycle, ApplicationContext | Aplicación | ya está · F019 · espejo de Spring M1 | SPRC, SBR, PMAP c.7 |
| T5 | Auto-configuración condicional, @Conditional, starters | Aplicación | ya está · F020 · espejo de Spring M37 | SPRC, SBR |
| T6 | Proyectos Spring Boot de varios módulos (multi-proyecto Gradle) | Aplicación | ya está · F021 · espejo de Spring y de Gradle M8 | SBR, REG |
| T7 | Perfiles y configuración externalizada | Aplicación | ya está · F022 · espejo de Spring M2 | SPRC, SBR, UNAM, CEZ, MSIO |

#### Módulo 2 · APIs REST y persistencia (`modulo-6.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Spring MVC: DispatcherServlet, Controllers, Validación | Aplicación | ya está · F025 · espejo de Spring M3 | SPRC, SBR, UNAM, CED |
| T2 | DTOs, @JsonProperty, Jackson | Aplicación | ya está · F026 · espejo de Spring M3 | SBR, CED |
| T3 | Manejo global de excepciones (@ControllerAdvice) | Aplicación | ya está · F027 · espejo de Spring M3 | SPRC, CED |
| T4 | Spring Data JPA, Hibernate, entidades, relaciones, transacciones | Aplicación | ya está · F028 · espejo de Spring M10 y M13 | SPRC, SBR, RBE |
| T5 | Criteria API y Specifications | Aplicación | ya está · F029 · espejo de Spring M11 | SBR |
| T6 | Flyway/Liquibase | Aplicación | ya está · F030 · espejo de Spring M4 | SBR, RBE |
| T7 | PostgreSQL y MySQL | Aplicación | ya está · F031 | RBE, SBR |

#### Módulo 2B · Diseño y evolución de APIs (**módulo nuevo**)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Diseño de recursos REST: nombres, relaciones, códigos de estado y madurez | Aplicación | falta | UNAM, MP c.3, AZM, RBE, ETS |
| T2 | Contract-first con OpenAPI: generar servidor y cliente desde el contrato con Gradle | Aplicación | falta · OpenAPI solo existe en la pista Node (F100) | UNAM, CEZ, CED, RBE, BM2 c.5 |
| T3 | Errores como contrato entre servicios: Problem Details (RFC 9457) y catálogo de errores | Aplicación | está pero básico · hoy dentro de F027: 9 menciones en 3 módulos; falta como contrato entre servicios | CED, SBR, MP c.3 |
| T4 | Paginación, filtrado y ordenación: offset frente a cursor | Aplicación | falta | RBE, AZM, ETS |
| T5 | Idempotencia en APIs: `Idempotency-Key`, reintentos seguros y PUT frente a POST | Integración | está pero básico · hoy dentro de F154: 46 menciones en 4 módulos, sin ficha propia del lado de la API | RSD, EST, GCPM, MP c.3 |
| T6 | Versionado y compatibilidad: cambios que rompen, deprecación y retirada | Integración | está pero básico · hoy dentro de F100: 43 menciones repartidas en 17 módulos, sin ficha propia | BM2 c.5, MP c.3, RI2 c.15, HP c.13, EST |
| T7 | Concurrencia optimista en HTTP: ETag, `If-Match` y respuestas condicionales | Integración | falta | RBE, MP c.6, MIT |

#### Módulo 3 · Testing y calidad (`modulo-7.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Estrategia de pruebas para microservicios: qué prueba cada nivel y cuánto cuesta | Aplicación | falta | BM2 c.9, MP c.9, ETS, BEDM2 c.20 |
| T2 | JUnit, Mockito, MockMvc | Aplicación | ya está · F032 · espejo de Spring M5 | SPRC, SBR, RBE |
| T3 | Testcontainers | Aplicación | ya está · F033 · espejo de Spring M5 y M15 | SBR, DBZ, BM2 c.9 |
| T4 | Pruebas de componente: el servicio entero con dobles de sus vecinos (WireMock) | Aplicación | falta · 0 menciones de WireMock en el módulo | MSIO, MP c.10, BM2 c.9 |
| T5 | Contract Testing con Pact y Pact Broker | Integración | está pero básico · F034: faltan estados del proveedor, contratos de mensajes y contratos bidireccionales (0 menciones) | MSIO, BM2 c.9, MP c.10, ETS |
| T6 | ArchUnit | Integración | ya está · F035 | FSA2 c.6, HP c.1 |
| T7 | SonarQube | Integración | ya está · F036 | PROMPT, BM2 c.7 |

#### Módulo 4 · Caching y rendimiento (`modulo-8.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Caching con Redis: @Cacheable, @CacheEvict, TTL | Aplicación | ya está · F037 · espejo de Spring M17 | SBR, RBE, RSD, CNP c.12 |
| T2 | Patrones: Cache-Aside, Read-Through, Write-Through, Write-Behind | Aplicación | ya está · F038 | RSD, AZP, BM2 c.13 |
| T3 | Distributed Locking con Redlock y Fencing Tokens | Integración | ya está · F039 | DDIA2 c.9, MIT, AZP |
| T4 | Cache stampede y solución con locks | Integración | ya está · F040 | RI2 c.4, MIT, RSD |
| T5 | Caché en dos niveles: Caffeine local más Redis, e invalidación por eventos | Integración | falta · 4 menciones, sin ficha | BM2 c.13, HP c.10, AZ305 |
| T6 | Redis en producción: persistencia, réplicas, Sentinel y Cluster con hash slots | Integración | falta · 0 menciones de Sentinel o Cluster | RBE, AZ305, MIT |
| T7 | Claves calientes, expiración escalonada y política de expulsión medida | Integración | está pero básico · hoy dentro de F040: la expulsión está (34 menciones); las claves calientes no (0) | DDIA2 c.7, EST, MIT |

#### Módulo 5 · Introducción a microservicios y DDD (`modulo-9.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Monolito vs Microservicios vs SOA | Integración | ya está · F041 | MSIO, BM2 c.1, MP c.1, FSA2 c.17–18, UNAM, CEZ, RBE |
| T2 | DDD: Bounded Contexts, Agregados, Eventos de Dominio | Integración | está pero básico · F042: se reparte en los cuatro temas del Módulo 5B; aquí queda la visión general | BM2 c.2, MP c.5, AZM, M2M c.1, RSA |
| T3 | Descomponer por capacidad de negocio y por subdominio: del mapa a los servicios candidatos | Integración | falta | MSIO, MP c.2, AZM, HP c.4 |
| T4 | Spring Modulith | Integración | ya está · F043 · espejo de Spring M34 | FSA2 c.11, SBR |
| T5 | 12-Factor App | Integración | está pero básico · F044: faltan los factores añadidos de la lista de 15 (0 menciones) | UNAM, CEZ, RBE, CNP c.6 |
| T6 | Strangler Fig Pattern: primera extracción guiada | Integración | ya está · F045 · repetido con F177: ver 3.2 | MSIO, AZP, AWSP, M2M c.3, CEZ |
| T7 | Database-per-service | Integración | ya está · F046 · dueña; espejo en F103 | MSIO, MP c.1, HP c.6, CSG |

#### Módulo 5B · Modelado de dominio para servicios (**módulo nuevo**)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Event Storming: de los eventos del negocio al mapa de contextos | Integración | falta · 1 mención en el curso | BM2 c.2 |
| T2 | Mapa de contextos: cliente-proveedor, conformista, capa anticorrupción y núcleo compartido | Integración | está pero básico · hoy dentro de F042: la capa anticorrupción está (25 menciones); el resto de relaciones tiene 1 | MSIO, AZP, AWSP, AZM |
| T3 | Agregados e invariantes: tamaño, referencias por identificador y consistencia transaccional | Integración | está pero básico · hoy dentro de F042: falta el criterio de tamaño y las reglas del agregado | MP c.5, BM2 c.2, AZM |
| T4 | Eventos de dominio frente a eventos de integración: publicar sin filtrar el modelo interno | Integración | falta | MSIO, MP c.5, BEDM2 c.5 |
| T5 | Tipos de acoplamiento entre servicios y connascencia | Integración | falta · 0 menciones de connascencia | BM2 c.2, FSA2 c.3, HP c.2 |
| T6 | Granularidad: fuerzas que dividen y fuerzas que unen un servicio | Integración | falta | HP c.7, BEDM2 c.3, CEZ |

#### Módulo 6 · Comunicación entre servicios (`modulo-10.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Estilos de interacción: petición-respuesta, notificación, petición asíncrona y publicar-suscribir | Integración | falta | MP c.3, BM2 c.4, AZP |
| T2 | REST síncrono: RestClient, WebClient, clientes declarativos y OpenFeign | Integración | ya está · F047 | SBR, SC, UNAM, CED |
| T3 | gRPC: Protocol Buffers, servicios, streaming | Integración | está pero básico · F048: deadlines sí (7 menciones); interceptores y keepalive no (0): pasan al Módulo 6B | GRPC, SBR, MP c.3, RSD, RBE |
| T4 | GraphQL con Spring for GraphQL | Integración | ya está · F049 · espejo de Spring M24 | SBR, BM2 c.14, RBE |
| T5 | Mensajería asíncrona: RabbitMQ y Kafka (introducción) | Integración | ya está · F050 | KAF, RMQ, RBE, CEZ, CYT |
| T6 | Formatos y evolución de esquemas comparados: JSON, Protobuf y Avro | Integración | falta | BM2 c.5, DDIA2 c.5, MP c.3, BEDM2 c.4 |
| T7 | Síncrono frente a asíncrono: criterios de decisión | Integración | ya está · F051 · dueña; espejo en F118 | BM2 c.4, MP c.3, FSA2 c.15 |

#### Módulo 6B · gRPC, GraphQL federado y tiempo real (**módulo nuevo**)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | gRPC en producción: deadlines, cancelación, reintentos y service config | Integración | está pero básico · hoy dentro de F048: amplía F048 | GRPC |
| T2 | gRPC: balanceo en el cliente, resolución de nombres, health checking y keepalive | Integración | falta | GRPC, K8S |
| T3 | Gobierno de `.proto`: compatibilidad, lint y detección de cambios que rompen | Integración | está pero básico · hoy dentro de F048: 5 menciones en el módulo, sin laboratorio que bloquee un cambio | GRPC, BM2 c.5, HP c.13 |
| T4 | gRPC hacia fuera del clúster: gRPC-Web, transcodificación a JSON y reflexión | Integración | falta | GRPC |
| T5 | Petición-respuesta asíncrona: 202 Accepted, sondeo y webhooks firmados | Integración | falta · 14 menciones de webhook, sin ficha | AZP, RSD, BEDM2 c.17 |
| T6 | Tiempo real hacia el cliente detrás del gateway: SSE y WebSocket | Integración | falta · la API de Spring es de Spring M23 | RBE, SBR, NEST |
| T7 | GraphQL entre servicios: federación de esquemas, N+1 y cuándo no usarlo | Integración | está pero básico · hoy dentro de F049: 2 menciones de federación | BM2 c.14, MP c.8, RSA |

#### Módulo 7 · Spring Cloud e infraestructura (`modulo-11.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Service Discovery: Eureka, Consul | Integración | ya está · F052 · dueña; espejo en F111 | SC, MSIO, UNAM, CEZ, CYT, BM2 c.5, CNP c.8 |
| T2 | Descubrimiento en Kubernetes: DNS del clúster frente a un registro, y Spring Cloud Kubernetes | Integración | falta · 0 menciones de Spring Cloud Kubernetes | SC, K8S, MSIO, CNP c.8, RI2 c.9 |
| T3 | API Gateway: Spring Cloud Gateway | Integración | está pero básico · F053: falta Token Relay (0 menciones) | SC, MSIO, AZP, UNAM, CEZ, MP c.8 |
| T4 | Composición de APIs en el gateway: agregación, fallo parcial y presupuesto de tiempo | Integración | falta · 2 menciones de composición de API | MSIO, MP c.7, AZP, AWSP |
| T5 | Config Server: configuración centralizada | Integración | ya está · F054 · dueña; espejo en F112 | SC, MSIO, AZP, UNAM, CEZ, MP c.11 |
| T6 | Load Balancing: Spring Cloud LoadBalancer | Integración | ya está · F055 | SC, UNAM, CYT, RSD |
| T7 | BFF pattern | Integración | ya está · F056 | MSIO, AZP, BM2 c.14 |

#### Módulo 8 · Resiliencia (`modulo-12.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Antipatrones de estabilidad: puntos de integración, fallos en cascada, hilos bloqueados y respuestas lentas | Integración | falta | RI2 c.4, SRE c.22, CEZ |
| T2 | Resilience4j: Circuit Breaker, Retry, RateLimiter, Bulkhead, TimeLimiter | Integración | ya está · F057 | SC, MSIO, AZP, AWSP, UNAM, CEZ, CED, RI2 c.5 |
| T3 | Timeouts en cascada y presupuesto de latencia | Integración | ya está · F058 | RI2 c.5, GRPC, CED |
| T4 | Estrategias de fallback | Integración | ya está · F059 · dueña; espejo en F123 | UNAM, CED, CNP c.9 |
| T5 | Tormentas de reintentos: presupuesto de reintentos, jitter y reintento en un solo nivel | Integración | está pero básico · hoy dentro de F057: jitter sí (11 menciones); tormenta de reintentos, 1 | RSD, SRE c.22, EPH, AWSP |
| T6 | Descarte de carga y contrapresión: rechazar pronto para seguir en pie | Integración | falta · 0 menciones en el módulo | RI2 c.5, SRE c.21, RBE, RSD |
| T7 | Chaos Engineering con Toxiproxy | Integración | ya está · F060 | CHAOS, RI2 c.17, BM2 c.12 |

#### Módulo 9 · Seguridad: identidad y tokens (**sale de dividir** `modulo-13.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Spring Security: filter chain | Integración | ya está · F061 · espejo de Spring M14 | SPRC, SBR |
| T2 | JWT: firmas simétricas vs asimétricas | Integración | ya está · F062 · dueña; espejo en F124 | BM2 c.11, MSIO, RBE |
| T3 | OAuth2 y OIDC | Integración | ya está · F063 | SBR, CEZ, RBE, BM2 c.11, AZP |
| T4 | Keycloak | Integración | ya está · F064 | CEZ, PROMPT |
| T5 | Ciclo de vida del token: refresh, rotación, revocación e introspección | Integración | falta · 1 mención de refresh token y 3 de introspección | BM2 c.11, RBE, AZ305 |
| T6 | RBAC y Scopes | Integración | ya está · F065 | CKA, BM2 c.11, SPRC |
| T7 | Token Exchange (RFC 8693): delegar la identidad del usuario | Integración | ya está · F066 · repetido con F162: ver 3.2 | PROMPT, BM2 c.11 |

#### Módulo 9B · Seguridad: red, secretos y cadena de suministro (**sale de dividir** `modulo-13.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Modelado de amenazas de un sistema de servicios | Integración | falta · 0 menciones en el módulo | BM2 c.11, RI2 c.11, FSA2 c.22 |
| T2 | OWASP API Security aplicado a un servicio Spring | Integración | falta · OWASP solo tiene ficha en la pista Node (F128) | RBE, RSA, RI2 c.11 |
| T3 | mTLS con Service Mesh: primer contacto | Integración | ya está · F067 · repetido con F161: ver 3.2 | ISTIO, LNK, BM2 c.11 |
| T4 | HashiCorp Vault: leer un secreto desde el servicio | Integración | ya está · F068 · repetido con F163 y F129: ver 3.2 | SC, CNCFP, AZ305 |
| T5 | Escaneo de vulnerabilidades: Trivy, Snyk | Integración | ya está · F069 | PROMPT, CNCFP |
| T6 | Cadena de suministro del servicio: SBOM, firma de imágenes y verificación | Integración | está pero básico · hoy dentro de F069: 5 menciones; el mecanismo es de Docker M8, aquí el caso del servicio | CNCFP, K8S |

#### Módulo 10 · Observabilidad (`modulo-14.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Micrometer + Prometheus | Integración | ya está · F070 · la instrumentación es de Spring M16 y M32 | MIC, SBR, MSIO, CEZ |
| T2 | OpenTelemetry + Zipkin/Jaeger | Integración | está pero básico · F071: falta baggage (0 menciones) | OTEL, MIC, MSIO, CYT, MP c.11 |
| T3 | Logging estructurado | Integración | ya está · F072 | MSIO, SBR, CED, BM2 c.10 |
| T4 | Correlación entre señales: exemplars, identificador de traza en los logs y baggage | Integración | falta · 0 menciones de exemplars | OTEL, MIC, BM2 c.10 |
| T5 | Propagación de contexto en mensajería: la traza a través de Kafka y RabbitMQ (pista Spring) | Integración | está pero básico · hoy dentro de F071: `traceparent` aparece 25 veces; el caso de mensajería solo tiene ficha en Node (F131) | OTEL, MIC, DBZ |
| T6 | Grafana: dashboards | Integración | ya está · F073 | CEZ, RSD |
| T7 | Alertas: del p99 al SLO con presupuesto de error | Integración | está pero básico · F074: el presupuesto de error tiene 2 menciones en todo el curso | SRE c.4, SREW c.5, BM2 c.10, EST |

#### Módulo 11 · Mensajería avanzada (`modulo-15.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Kafka profundo: particionamiento, consumer groups | Integración | está pero básico · F075: `min.insync.replicas` tiene 1 mención y el almacenamiento por niveles 0: van al Módulo 26B | KAF, CCDAK, BEDM2 c.2, RBE |
| T2 | Exactly-Once Semantics (EOS): productor idempotente y transacciones | Integración | ya está · F076 · repetido con F155 y F157: ver 3.2 | KAF, DDIA2 c.8, BEDM2 c.8 |
| T3 | Schema Registry y Avro | Integración | ya está · F077 · repetido con F157: ver 3.2 | BEDM2 c.4, DBZ, DDIA2 c.5 |
| T4 | Dead Letter Topics | Integración | ya está · F078 | BEDM2 c.18, FSA2 c.15 |
| T5 | Orden y reintentos sin bloquear la partición: retry topics y back-off | Integración | falta | MP c.3, AZP, BEDM2 c.18 |
| T6 | RabbitMQ: publisher confirms, DLQ | Integración | ya está · F079 · dueña; espejo en F135 | RMQ, PMAP c.6 |
| T7 | NATS: primer contacto con publicar-suscribir y JetStream | Integración | ya está · F080 · repetido con F117 y F159: ver 3.2 | NATS, NEST |

#### Módulo 12 · Contenedores y Kubernetes para servicios Spring (**sale de dividir** `modulo-16.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Dockerfile multi-stage, distroless | Integración | ya está · F081 · dueña; espejo en F142. El mecanismo es de Docker M4 | SBR, CKAD, UNAM, CEZ |
| T2 | Docker Compose | Integración | ya está · F082 · el mecanismo es de Docker M7 | CEZ, SBR, CPL |
| T3 | Kubernetes: Deployments, Services, ConfigMaps, Secrets | Integración | está pero básico · F083: faltan NetworkPolicy y PodDisruptionBudget (0 menciones) | K8S, CKAD, CKA, CEZ, CYT, MP c.12 |
| T4 | Readiness/Liveness Probes | Integración | ya está · F084 | K8S, CKAD, MSIO, AZP, SBR |
| T5 | Apagado ordenado y despliegue sin cortes: preStop, readiness y PodDisruptionBudget | Integración | está pero básico · hoy dentro de F084: el apagado está (11 menciones); PodDisruptionBudget no | K8S, SBR, GRPC, RI2 c.14, MP c.12 |
| T6 | HPA | Integración | ya está · F085 · dueña; espejo en F144 | K8S, CKA, BM2 c.13 |
| T7 | Helm | Integración | ya está · F086 | CKAD, CKA, CEZ |

#### Módulo 12B · Entrega continua y progresiva (pista Spring) (**sale de dividir** `modulo-16.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Pipeline de CI para un servicio Spring con Gradle: caché, pruebas, imagen y escaneo | Integración | falta · 0 menciones de GitHub Actions en el módulo; solo hay ficha en Node (F145) | BM2 c.7, AZM, PCA, BEDM2 c.21 |
| T2 | Migraciones de base de datos durante el despliegue: expand/contract con Flyway | Integración | está pero básico · hoy dentro de F030: 11 menciones en 4 módulos, sin ficha ni laboratorio | RI2 c.14–15, BEDM2 c.21 |
| T3 | Blue-Green y Canary | Integración | ya está · F087 · dueña; espejo en F146 | CKAD, BM2 c.8, BEDM2 c.21, SREW c.16 |
| T4 | Entrega progresiva automatizada: Argo Rollouts con análisis de métricas | Integración | está pero básico · hoy dentro de F087: 3 menciones en el módulo | BM2 c.8, SREW c.16, LNK |
| T5 | Feature flags: separar despliegue de lanzamiento | Integración | falta · 11 menciones en 6 módulos, sin ficha | BM2 c.8, MP c.12, SRE c.27 |
| T6 | GitOps con ArgoCD | Integración | ya está · F088 · dueña; espejo en F147. El mecanismo es de Kubernetes M13 | PROMPT, PCA |

#### Módulo 12C · Arranque, huella y costo de runtime (**sale de dividir** `modulo-5.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | La JVM dentro de un contenedor: memoria, límites de CPU y recolector | Experto | falta · el recolector es de Java; aquí el contenedor | SBR, RI2 c.8, K8S |
| T2 | AOT cache y CDS: arrancar rápido sin imagen nativa | Experto | falta · espejo de Spring M40 | SBR |
| T3 | GraalVM Native Image | Experto | ya está · F024 · hoy en el Módulo 1; se propone moverla aquí (decisión D4) | SBR, PROMPT |
| T4 | CRaC (Coordinated Restore at Checkpoint) | Experto | ya está · F023 · hoy en el Módulo 1; se propone moverla aquí (decisión D4) | SBR, PROMPT |
| T5 | Elegir runtime con números: JVM, AOT cache, nativo o CRaC frente a costo por petición | Experto | falta | SBR, SAP, EST |

### Fase 2 · Node.js de cero a experto — 13 módulos, 83 temas

Pista Node.js, independiente de la Fase 1. Los temas nuevos marcados «espejo de F…» existen para que quien haga solo esta pista no se quede sin el concepto.

#### Módulo 13 · JavaScript/TypeScript moderno y Node.js esencial (`modulo-17.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | ES6+: async/await, Promises, destructuring, modules | Aplicación | ya está · F089 | NODE, RBE |
| T2 | TypeScript: tipos, interfaces, generics, strict mode | Aplicación | ya está · F090 | NODE, NEST |
| T3 | Event Loop: fases, microtasks, macrotasks | Aplicación | ya está · F091 | NODE |
| T4 | perf_hooks y clinic.js | Aplicación | ya está · F092 | NODE |
| T5 | Worker Threads vs Child Processes | Aplicación | ya está · F093 | NODE |
| T6 | Backpressure en Streams | Aplicación | ya está · F094 | NODE, RBE |
| T7 | Graceful shutdown | Aplicación | ya está · F095 | NODE, GRPC, K8S |

#### Módulo 14 · APIs REST con Express y NestJS (`modulo-18.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Express: routing, middleware, error handling | Aplicación | ya está · F096 | NODE, CSG |
| T2 | NestJS: módulos, controllers, providers, interceptors, guards | Aplicación | está pero básico · F097: Fastify como adaptador tiene 8 menciones y ninguna medición | NEST |
| T3 | Validación con Zod o class-validator | Aplicación | ya está · F098 | NEST |
| T4 | DTOs en NestJS | Aplicación | ya está · F099 · título repetido con F026: ver 3.2 | NEST |
| T5 | OpenAPI/Swagger | Aplicación | ya está · F100 | NEST, RBE, UNAM |
| T6 | Paginación, versionado e idempotencia de la API en NestJS | Aplicación | falta · espejo del Módulo 2B | NEST, RBE |

#### Módulo 15 · Persistencia y caché (`modulo-19.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | MongoDB + Mongoose | Aplicación | ya está · F101 | RBE, CSG, NEST |
| T2 | PostgreSQL + Prisma/Sequelize | Aplicación | está pero básico · F102: las migraciones están (6 menciones); falta el cambio de esquema sin corte | RBE, NEST |
| T3 | Database-per-service en Node | Aplicación | ya está · F103 · espejo de F046 | MSIO, CSG |
| T4 | Connection pooling y transacciones | Aplicación | ya está · F104 | RBE, DDIA2 c.8 |
| T5 | Caché con Redis en Node: TTL, invalidación y estampida | Integración | falta · la pista Node no tiene ficha de caché (1 mención de Redis en el módulo); espejo de F037 y F040 | RBE, RSD, NEST |
| T6 | Bloqueo distribuido y fencing tokens en Node | Integración | falta · espejo de F039 | DDIA2 c.9, AZP |

#### Módulo 16 · Testing y calidad (`modulo-20.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Jest | Aplicación | ya está · F105 | NEST, RBE |
| T2 | El runner de pruebas nativo de Node frente a Jest | Aplicación | falta · 1 mención de `node:test` | NODE |
| T3 | Supertest | Aplicación | ya está · F106 | NEST, CSG |
| T4 | Pruebas de componente en Node con dobles HTTP | Aplicación | falta · 0 menciones de nock o MSW; espejo del Módulo 3 | MP c.10, BM2 c.9 |
| T5 | Contract Testing con Pact en Node | Integración | ya está · F107 · espejo de F034 | MSIO, BM2 c.9 |
| T6 | Testcontainers para Node | Integración | ya está · F108 · espejo de F033 | DBZ, BM2 c.9 |
| T7 | Reglas de arquitectura y calidad en Node: dependencias entre módulos, lint y SonarQube | Integración | falta · 0 menciones; espejo de F035 y F036 | FSA2 c.6, HP c.1 |

#### Módulo 17 · Introducción a microservicios en Node (`modulo-21.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Estructura de carpetas escalable | Integración | ya está · F109 | NEST, CSG |
| T2 | Límites de dominio en Node: módulos de NestJS como contextos delimitados | Integración | falta · espejo de F042 y F043 | BM2 c.2, NEST |
| T3 | Monorepo de servicios Node: workspaces, librerías compartidas y sus riesgos | Integración | está pero básico · hoy dentro de F109: 3 menciones de monorepo o workspaces | CSG, HP c.8, BM2 c.7, CPL |
| T4 | dotenv y configuración por entorno | Integración | ya está · F110 | NODE, UNAM |
| T5 | Service Discovery con Consul en Node | Integración | ya está · F111 · espejo de F052 | MSIO, SC |
| T6 | Configuración centralizada en Node | Integración | ya está · F112 · espejo de F054 | MSIO, AZP |
| T7 | API Gateway y BFF en la pista Node | Integración | falta · 0 menciones de gateway o BFF en el módulo; espejo de F053 y F056 | MSIO, AZP, BM2 c.14, NEST |

#### Módulo 18 · Comunicación (`modulo-22.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | REST con Axios/Fetch | Integración | ya está · F113 | NODE, CSG |
| T2 | gRPC con @grpc/grpc-js | Integración | ya está · F114 | GRPC, NEST |
| T3 | GraphQL con Apollo Server | Integración | ya está · F115 | NEST, RBE |
| T4 | KafkaJS, amqplib | Integración | ya está · F116 · comprobar el cliente de Kafka: ver «Pendientes de verificar» | KAF, RMQ, NEST |
| T5 | Microservicios de NestJS: transportes, patrones de mensaje y de evento, y aplicaciones híbridas | Integración | falta · 0 menciones de `ClientProxy` o `@MessagePattern` | NEST |
| T6 | NATS con el cliente de Node | Integración | ya está · F117 · espejo de F080 | NATS, NEST, CSG |
| T7 | Síncrono frente a asíncrono en Node | Integración | ya está · F118 · espejo de F051 | BM2 c.4, CSG |

#### Módulo 19 · Resiliencia (`modulo-23.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Circuit Breaker con opossum o cockatiel | Integración | ya está · F119 | MSIO, AZP, RBE |
| T2 | Retry con jitter | Integración | ya está · F120 | AZP, AWSP, GRPC |
| T3 | Rate Limiting con Redis | Integración | ya está · F121 | AZP, RBE, RSD |
| T4 | Timeouts en Node | Integración | ya está · F122 · espejo de F058 | RI2 c.5, GRPC |
| T5 | Estrategias de fallback en Node | Integración | ya está · F123 · espejo de F059 | CNP c.9 |
| T6 | Bulkhead y límite de concurrencia en Node: colas acotadas y el event loop | Integración | está pero básico · hoy dentro de F119: 3 menciones de bulkhead, sin ficha | AZP, RI2 c.5, NODE |
| T7 | Contrapresión y descarte de carga en un servicio Node | Integración | falta · espejo del Módulo 8 | RI2 c.5, SRE c.21, RBE, NODE |

#### Módulo 20 · Seguridad (`modulo-24.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | JWT con jsonwebtoken | Integración | ya está · F124 · espejo de F062 | NEST, RBE |
| T2 | Passport.js | Integración | ya está · F125 | NEST |
| T3 | OAuth2 y OIDC con Keycloak en NestJS: servidor de recursos, JWKS y scopes | Integración | falta · 3 menciones de Keycloak y 2 de OIDC; espejo de F063 y F064 | NEST, RBE, BM2 c.11 |
| T4 | Autorización en NestJS: guards, roles y scopes | Integración | está pero básico · hoy dentro de F097: 3 menciones de roles en el módulo; espejo de F065 | NEST, BM2 c.11 |
| T5 | Helmet, CORS | Integración | ya está · F126 | NEST, RBE |
| T6 | Prevención de inyecciones NoSQL | Integración | ya está · F127 | RBE, NODE |
| T7 | OWASP Top 10 | Integración | ya está · F128 | RBE, RSA, RI2 c.11 |

#### Módulo 20B · Secretos y seguridad entre servicios en Node (**sale de dividir** `modulo-24.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Secretos: AWS Secrets Manager, Vault, Azure Key Vault | Integración | ya está · F129 · repetido con F068: ver 3.2. Único tema del curso que hoy usa Floci | AZ305, CNCFP, SC |
| T2 | Token Exchange y propagación de identidad desde Node | Integración | falta · espejo de F066 | BM2 c.11 |
| T3 | Escaneo de dependencias e imágenes en Node: `npm audit`, Trivy y SBOM | Integración | falta · espejo de F069 | NODE, CNCFP |

#### Módulo 21 · Observabilidad (`modulo-25.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | OpenTelemetry para Node | Integración | ya está · F130 | OTEL, NEST |
| T2 | Propagación de traceparent en AMQP/Kafka | Integración | ya está · F131 | OTEL, MSIO |
| T3 | Pino/Winston | Integración | ya está · F132 | MSIO, NEST |
| T4 | ELK o Grafana Loki | Integración | ya está · F133 | MSIO, CEZ |
| T5 | Prometheus client | Integración | ya está · F134 | MSIO, NEST |
| T6 | Alertas y SLO del servicio Node | Integración | está pero básico · hoy dentro de F134: Grafana está (47 menciones); alertas, 8; espejo de F074 | SRE c.4, SREW c.5 |
| T7 | Diagnóstico del event loop en producción: retraso, utilización y perfiles | Integración | está pero básico · hoy dentro de F092: 2 menciones del retraso del event loop en el módulo | NODE, OTEL |

#### Módulo 22 · Mensajería y patrones de datos (`modulo-26.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | RabbitMQ en Node: publisher confirms, consumer acknowledgments | Integración | ya está · F135 · espejo de F079 | RMQ, NEST |
| T2 | Deduplicación con Redis | Integración | ya está · F136 | MSIO, AZP, MP c.3 |
| T3 | Sagas con NestJS CQRS | Integración | ya está · F137 | NEST, MSIO, AZP, AWSP, MP c.4 |
| T4 | Compensaciones idempotentes | Integración | ya está · F138 | AZP, BEDM2 c.10, HP c.12 |
| T5 | Event Sourcing con EventStoreDB o MongoDB | Integración | ya está · F139 | MSIO, AZP, AWSP, MP c.6, DDIA2 c.3 |
| T6 | Proyecciones materializadas | Integración | ya está · F140 | AZP, MP c.7, BEDM2 c.2 |
| T7 | CQRS | Integración | ya está · F141 | MSIO, AZP, MP c.7, FSA2 c.20, RSA |

#### Módulo 22B · Kafka a fondo desde Node (**módulo nuevo**)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Productor y consumidor en Node: grupos, offsets y rebalanceo | Integración | falta · 8 menciones de Kafka en el Módulo 22; espejo de F075 | KAF, NEST, CCDAK |
| T2 | Idempotencia y transacciones de Kafka desde Node: qué soporta el cliente | Integración | falta · espejo de F076 | KAF, BEDM2 c.8 |
| T3 | Schema Registry con Avro o Protobuf en Node | Integración | falta · espejo de F077 | BEDM2 c.4, DBZ |
| T4 | Reintentos y dead letter topics en Node | Integración | falta · espejo de F078 | BEDM2 c.18, AZP |
| T5 | Outbox en Node: tabla, publicador y Debezium | Integración | está pero básico · hoy dentro de F152: 5 menciones de outbox en el Módulo 22, sin ficha en la pista | MSIO, AWSP, DBZ, BEDM2 c.6 |

#### Módulo 23 · Docker, Kubernetes y CI/CD (`modulo-27.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Dockerfile multi-stage para Node | Integración | ya está · F142 · espejo de F081 | CKAD, CSG |
| T2 | Kubernetes para un servicio Node: sondas, configuración y recursos | Integración | ya está · F143 · espejo de F083 y F084 | K8S, CKAD, CSG |
| T3 | Empaquetar el servicio Node con Helm y valores por entorno | Integración | está pero básico · hoy dentro de F143: 4 menciones de Helm; espejo de F086 | CKAD, CKA |
| T4 | HPA para Node: escalar con un solo hilo | Integración | ya está · F144 · espejo de F085 | K8S, CKA |
| T5 | GitHub Actions | Integración | ya está · F145 | BM2 c.7, AZM, CPL |
| T6 | Blue-Green y Canary con un servicio Node | Integración | ya está · F146 · espejo de F087 | CKAD, BM2 c.8 |
| T7 | GitOps con ArgoCD para la pista Node | Integración | ya está · F147 · espejo de F088 | PROMPT |

### Fase 3 · Nivel maestro — 25 módulos, 166 temas

Común a las dos pistas. Aquí se concentra lo que faltaba: teoría, datos a escala, ejecución duradera, streaming, malla, multi-tenencia, confiabilidad, capacidad, multi-región, plataforma y pruebas del sistema entero.

#### Módulo 24 · Gobernanza arquitectónica (`modulo-28.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Características de arquitectura: identificarlas, priorizarlas y medirlas | Experto | está pero básico · hoy dentro de F150: 4 menciones en el módulo, dentro de ATAM | FSA2 c.4–7, DDIA2 c.2, PCA |
| T2 | ADRs | Experto | ya está · F148 | FSA2 c.21, HP c.1, BM2 c.16 |
| T3 | Modelo C4 | Experto | ya está · F149 · la notación es de Diseño de sistemas | FSA2 c.23 |
| T4 | ATAM ligero | Experto | ya está · F150 | FSA2 c.22, HP c.15 |
| T5 | Fitness functions en producción | Experto | ya está · F151 · repetido con F176: ver 3.2 | FSA2 c.6, HP c.1 |
| T6 | RFC y documentos de diseño: decidir por escrito y conseguir acuerdo | Experto | falta · 3 menciones | EST, BM2 c.16, FSA2 c.25 |
| T7 | Análisis de trade-offs propio: dimensiones acopladas y casos del dominio | Experto | falta | HP c.15, FSA2 c.2, FSA2 c.19 |

#### Módulo 24B · Teoría de sistemas distribuidos para arquitectos (**módulo nuevo**)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Modelos de sistema y de fallo: red, proceso y tiempo; caída, omisión y bizantino | Experto | falta | CAM, DDIA2 c.9, MIT |
| T2 | Tiempo físico: NTP, deriva, relojes monotónicos y por qué no ordenar por marca de tiempo | Experto | falta | CAM, DDIA2 c.9, EPH, EST |
| T3 | Relojes lógicos: Lamport, vectoriales e híbridos | Experto | falta · 0 menciones de Lamport o de reloj vectorial | CAM, DDIA2 c.10 |
| T4 | CAP y PACELC: qué se elige de verdad, operación por operación | Experto | está pero básico · hoy dentro de F156: CAP tiene 9 menciones en el Módulo 25; PACELC, 0 en el curso | BM2 c.12, RSD, RSA, RBE, EST, EPH |
| T5 | Modelos de consistencia: linealizable, secuencial, causal, eventual y garantías de sesión | Experto | falta · 0 menciones de linealizabilidad | MIT, DDIA2 c.10, CAM, RSD, EPH |
| T6 | Consenso con Raft: elección de líder, réplica del log y cambio de miembros | Experto | falta · 28 menciones de Raft como propiedad de una herramienta, nunca explicado; Paxos, 1 | MIT, DDIA2 c.10, CAM, SRE c.23, EPH |
| T7 | Servicios de coordinación: etcd, ZooKeeper y Consul; elección de líder, leases y locks | Experto | está pero básico · hoy dentro de F039: los fencing tokens están; elección de líder, 0 menciones | MIT, DDIA2 c.10, AZP, K8S |

#### Módulo 24C · Replicación, particionado y transacciones a escala (**módulo nuevo**)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Replicación con un líder: síncrona, asíncrona, retraso de réplica y leer tus propias escrituras | Experto | falta | DDIA2 c.6, RBE, RSD, EPH, MIT |
| T2 | Multi-líder y sin líder: quórums, reparación en lectura y resolución de conflictos | Experto | falta | DDIA2 c.6, EPH |
| T3 | CRDT: converger sin coordinación | Experto | falta · 0 menciones | DDIA2 c.6, CAM |
| T4 | Particionado: por rango, por hash y hash consistente; rebalanceo y claves calientes | Experto | está pero básico · hoy dentro de F075: 22 menciones de particionado, todas sobre Kafka; hash consistente, 0 | DDIA2 c.7, RSD, RBE, AZP, MIT, EST |
| T5 | Índices secundarios y enrutado de peticiones sobre datos particionados | Experto | falta | DDIA2 c.7, AZP |
| T6 | Aislamiento a fondo: snapshot, escritura sesgada (write skew) y serializable | Experto | falta | DDIA2 c.8, MIT, RBE |
| T7 | Identificadores en un sistema distribuido: UUIDv7, Snowflake y secuencias por servicio | Experto | falta · 1 mención | DDIA2 c.10 |

#### Módulo 25 · Consistencia distribuida (`modulo-29.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Two-Phase Commit, XA y TCC: por qué casi nunca | Experto | está pero básico · F156: XA está (72 menciones); TCC, 0 | DDIA2 c.8, MIT, MP c.4, BM2 c.6, PMAP c.13–15 |
| T2 | Saga coreografiada frente a orquestada: máquina de estados y compensación que falla | Experto | está pero básico · hoy dentro de F137: solo tiene ficha en Node (F137, F138); en la pista Spring se salta directo a Temporal | MSIO, AZP, AWSP, HP c.11–12, BM2 c.6, BEDM2 c.10 |
| T3 | Anomalías por falta de aislamiento en una saga y sus contramedidas | Experto | falta · 0 menciones de bloqueo semántico o contramedidas | MP c.4, HP c.12 |
| T4 | Sagas orquestadas con Temporal.io | Experto | ya está · F153 · dueña; F182 la aplica en el proyecto final | TMP, BEDM2 c.10, DDIA2 c.5 |
| T5 | Outbox Pattern + CDC con Debezium | Experto | ya está · F152 | MSIO, AWSP, DBZ, M2M c.3, BEDM2 c.6 |
| T6 | Idempotencia real en consumidores Kafka | Experto | ya está · F154 | MSIO, AZP, MP c.3, EST |
| T7 | Exactly-once en la práctica: qué garantiza de extremo a extremo | Experto | ya está · F155 · repetido con F076 y F157: ver 3.2 | KAF, DDIA2 c.8, DBZ, BEDM2 c.8 |

#### Módulo 25B · Ejecución duradera con Temporal a fondo (**módulo nuevo**)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Modelo de ejecución: historial de eventos, replay y determinismo | Experto | falta | TMP, DDIA2 c.5, BEDM2 c.10 |
| T2 | Actividades: timeouts, heartbeats, reintentos e idempotencia | Experto | falta | TMP |
| T3 | Señales, consultas y updates: hablar con un workflow en marcha | Experto | falta | TMP |
| T4 | Versionar workflows: patching y despliegue de workers sin romper ejecuciones vivas | Experto | está pero básico · hoy dentro de F153: 5 menciones en el Módulo 25 | TMP |
| T5 | Workflows largos: continue-as-new, hijos, timers y schedules | Experto | falta · 0 menciones de continue-as-new | TMP |
| T6 | Operar Temporal: namespaces, task queues, visibilidad y dimensionar workers | Experto | falta | TMP |
| T7 | Temporal frente a las alternativas: funciones duraderas, motores BPM y saga a mano | Experto | falta · Step Functions es de Cloud M16 | HP c.11, BEDM2 c.15, RSA, AZP |

#### Módulo 25C · CDC, proyecciones y datos derivados (**módulo nuevo**)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Debezium por dentro: log de transacciones, snapshot inicial e incremental y señales | Experto | está pero básico · hoy dentro de F152: 0 menciones de señales o de snapshot incremental | DBZ, MSIO, DDIA2 c.12 |
| T2 | Outbox con Debezium: Outbox Event Router, orden y limpieza de la tabla | Experto | está pero básico · hoy dentro de F152: amplía F152 | DBZ, MSIO, AWSP, BEDM2 c.6–7 |
| T3 | Inbox: deduplicar con la base de datos del consumidor | Experto | está pero básico · hoy dentro de F154: 0 menciones de inbox en el Módulo 25 | MSIO, AZP |
| T4 | Reconstruir una proyección: replay, proyección en paralelo y cambio atómico | Experto | está pero básico · hoy dentro de F140: F140 es de la pista Node | BEDM2 c.18, MP c.7, DDIA2 c.13 |
| T5 | Búsqueda como proyección: indexar en OpenSearch desde eventos | Experto | falta · 20 menciones de Elasticsearch, sin ficha. El servicio gestionado es de Cloud M28 | RBE, AZP, RSD, MP c.7 |
| T6 | Consultas entre servicios: composición de API frente a CQRS y réplica de datos | Experto | está pero básico · hoy dentro de F141: F141 es de la pista Node | MSIO, MP c.7, HP c.10 |
| T7 | Informes y analítica sobre microservicios: del volcado al data mesh | Experto | falta · 0 menciones de data mesh | M2M c.5, HP c.14, DDIA2 c.1 |

#### Módulo 25D · Evolución de datos sin corte (**módulo nuevo**)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Expand/contract en un esquema relacional: columnas, índices y restricciones en caliente | Experto | está pero básico · hoy dentro de F030: 11 menciones, sin ficha | RI2 c.14, BEDM2 c.21, AZ305 |
| T2 | Backfill y migración por lotes con verificación | Experto | falta · 0 menciones de backfill | M2M c.4, SRE c.26 |
| T3 | Doble escritura controlada, lectura en sombra y corte | Experto | está pero básico · hoy dentro de F178: 6 menciones de doble escritura en el Módulo 31 | M2M c.4, BEDM2 c.6 |
| T4 | Cambiar de base de datos o de broker con el sistema en marcha | Experto | falta | AZ305, SAP, PCA, HP c.6 |
| T5 | Evolución de esquemas de eventos: compatibilidad, upcasting y reprocesado | Experto | está pero básico · hoy dentro de F077: la compatibilidad está (24 menciones en el Módulo 26); el reprocesado no | BEDM2 c.4, BEDM2 c.21, MP c.6, DDIA2 c.5, EST |
| T6 | Borrado y privacidad con eventos inmutables: derecho al olvido y cifrado por sujeto | Experto | falta · 2 menciones | BEDM2 c.5, DDIA2 c.14, PCA |

#### Módulo 26 · Mensajería avanzada y event-driven (`modulo-30.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Event Notification vs Event-Carried State Transfer | Experto | ya está · F160 | BEDM2 c.5, FSA2 c.15 |
| T2 | Diseño de eventos: estado, delta, notificación y medida; tamaño y claim check | Experto | está pero básico · hoy dentro de F160: amplía F160 | BEDM2 c.5, AZP, FSA2 c.15 |
| T3 | Contratos de eventos: AsyncAPI y CloudEvents | Experto | falta · AsyncAPI, 1 mención; CloudEvents, 0 | MP c.3, DBZ, BEDM2 c.4 |
| T4 | Orden y entrega: claves, convoy secuencial y consumidores en competencia | Experto | falta | AZP, MP c.3, RSD |
| T5 | Kafka profundo: transacciones, EOS, Schema Registry | Experto | ya está · F157 · repetido con F075–F077: ver 3.2 | KAF, CCDAK, BEDM2 c.8 |
| T6 | RabbitMQ avanzado | Experto | está pero básico · F158: 0 menciones de colas quorum, streams, federación o shovel en el módulo: van al Módulo 26D | RMQ |
| T7 | NATS en producción: JetStream | Experto | ya está · F159 · repetido con F080 y F117: ver 3.2 | NATS |

#### Módulo 26B · Kafka por dentro y en operación (**módulo nuevo**)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | El log por dentro: segmentos, índices, caché de páginas y zero-copy | Experto | falta | KAF, DDIA2 c.12 |
| T2 | Réplica en Kafka: ISR, acks, `min.insync.replicas`, elección de líder y KRaft | Experto | está pero básico · hoy dentro de F075: KRaft, 16 menciones; `min.insync.replicas`, 1 | KAF, CCDAK |
| T3 | Grupos de consumidores a fondo: el protocolo de rebalanceo nuevo | Experto | está pero básico · hoy dentro de F075: 3 menciones | KAF |
| T4 | Colas sobre Kafka: share groups | Experto | falta · 2 menciones. Comprobar estado en 4.4: ver «Pendientes de verificar» | KAF |
| T5 | Retención, compactación y almacenamiento por niveles | Experto | falta · 0 menciones de almacenamiento por niveles | KAF, BEDM2 c.2 |
| T6 | Kafka Connect: conectores, transformaciones y entrega exactamente una vez | Experto | falta · 13 menciones, sin ficha | KAF, DBZ, CCDAK |
| T7 | Operar Kafka: lag, cuotas, multi-tenencia y número de particiones | Experto | falta | KAF, BEDM2 c.19, AZ305 |

#### Módulo 26C · Procesamiento de streams (**módulo nuevo**)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Streams y tablas: dualidad, estado local y changelog | Experto | falta | BEDM2 c.2, BEDM2 c.8, DDIA2 c.12 |
| T2 | Kafka Streams: topología, KStream, KTable y almacenes de estado | Experto | falta · 4 menciones en el curso | KAF, CCDAK, BEDM2 c.13 |
| T3 | El tiempo en un stream: tiempo del evento, ventanas, marcas de agua y eventos tardíos | Experto | falta | BEDM2 c.9, DDIA2 c.12 |
| T4 | Joins de streams y enriquecimiento | Experto | falta | DDIA2 c.12, BEDM2 c.2 |
| T5 | Streaming SQL y Flink: cuándo hace falta un framework pesado | Experto | falta · 0 menciones de Flink | BEDM2 c.12, BEDM2 c.14 |
| T6 | Datos malos en el stream: validar, apartar y rebobinar para reconstruir | Experto | falta | BEDM2 c.18, AZP |
| T7 | Réplica entre clústeres y regiones: MirrorMaker 2 y topologías | Experto | falta · 0 menciones | KAF, BEDM2 c.19 |

#### Módulo 26D · RabbitMQ y NATS en producción (**módulo nuevo**)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | RabbitMQ: colas quorum, entrega al menos una vez y límite de reentregas | Experto | está pero básico · hoy dentro de F079: 10 menciones en el Módulo 11, 0 en el Módulo 26 | RMQ |
| T2 | RabbitMQ Streams y super streams | Experto | está pero básico · hoy dentro de F158: 3 menciones en el curso | RMQ |
| T3 | RabbitMQ en clúster: particiones de red, federación y shovel | Experto | falta | RMQ, PMAP c.21 |
| T4 | Protocolos en RabbitMQ: AMQP 0-9-1, AMQP 1.0 y MQTT | Experto | falta | RMQ, NEST |
| T5 | NATS JetStream: streams, consumidores, retención y deduplicación | Experto | está pero básico · hoy dentro de F159: amplía F159 | NATS |
| T6 | NATS: clústeres, superclústeres, leaf nodes y seguridad por cuentas | Experto | falta · 1 mención | NATS |
| T7 | Elegir broker con criterios: Kafka, RabbitMQ, NATS o un servicio gestionado | Experto | falta · los servicios gestionados son de Cloud M3, M11 y M17 | RMQ, AZ305, BEDM2 c.19, RBE |

#### Módulo 27 · Seguridad Zero-Trust (`modulo-31.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Zero-Trust entre servicios: mTLS con Istio/Linkerd e identidad SPIFFE | Experto | ya está · F161 · dueña; F067 es el primer contacto | ISTIO, LNK, BM2 c.11, CEZ |
| T2 | Token Exchange en una cadena de servicios: audiencia, alcance y actor | Experto | ya está · F162 · repetido con F066: ver 3.2 | BM2 c.11 |
| T3 | Vault en producción: secretos dinámicos y rotación | Experto | ya está · F163 · repetido con F068: ver 3.2 | SC, CNCFP, AZ305 |
| T4 | Service Mesh: sidecar, ambient y política de autorización | Experto | ya está · F164 | ISTIO, LNK, HP c.8, RBE, RSA |
| T5 | Autorización como política: OPA en el gateway y en el servicio | Experto | falta · 2 menciones en el módulo | BM2 c.11, AZP |
| T6 | Autorización por relaciones (ReBAC) y por atributos (ABAC) | Experto | falta · 9 menciones en 3 módulos, sin ficha | BM2 c.11 |
| T7 | Control de salida y perímetro: NetworkPolicy más malla | Experto | falta · 0 menciones de egress ni de NetworkPolicy | K8S, LNK, CKA, CKAD |

#### Módulo 27B · Service mesh a fondo (**módulo nuevo**)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Tráfico en la malla: reintentos, timeouts y expulsión de instancias, sin duplicar Resilience4j | Experto | falta | ISTIO, LNK, HP c.8, CNP c.10 |
| T2 | Canario con la malla: división de tráfico y Gateway API | Experto | falta | LNK, ISTIO, MP c.12, K8S |
| T3 | Inyección de fallos desde la malla | Experto | falta | LNK, ISTIO, CHAOS |
| T4 | Observabilidad de la malla: métricas doradas y trazas sin tocar el código | Experto | falta | ISTIO, LNK |
| T5 | Malla entre clústeres y cargas fuera de Kubernetes | Experto | falta · 0 menciones | LNK, ISTIO |
| T6 | Ambient frente a sidecar: costo, latencia y migración | Experto | está pero básico · hoy dentro de F164: ambient y waypoint están (60 menciones); falta medir y migrar | ISTIO, LNK |
| T7 | Cuándo no usar una malla: costo operativo y alternativas en la librería | Experto | falta | MP c.11, HP c.8, BM2 c.5 |

#### Módulo 27C · Seguridad avanzada de datos y multi-tenencia (**módulo nuevo**)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Cifrado como servicio y cifrado por campo: Vault Transit y envelope encryption | Experto | falta · 0 menciones de Transit | BM2 c.11, BEDM2 c.4 |
| T2 | Seguridad del broker: TLS, autenticación y ACL por servicio en Kafka | Experto | falta | KAF, BEDM2 c.19, NATS |
| T3 | Multi-tenencia: aislar por fila, por esquema o por base de datos | Experto | falta · 0 menciones de multi-tenencia | DDIA2 c.7, K8S, KAF, AZP |
| T4 | Vecino ruidoso: cuotas, límites y prioridad por inquilino | Experto | falta | RSD, AZP, KAF, K8S |
| T5 | Auditoría: registro inalterable de quién hizo qué | Experto | falta | MSIO, MP c.11, SBR |
| T6 | Cumplimiento en una arquitectura de servicios: clasificar, retener y ubicar los datos | Experto | falta | PCA, AZ305, DDIA2 c.14 |

#### Módulo 28 · FinOps y costo de arquitectura (`modulo-32.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Modelo de costo cloud | Experto | ya está · F165 | SAP, PCA, EST |
| T2 | Right-sizing | Experto | ya está · F166 | SAP, AZ305, K8S |
| T3 | Break-even Serverless vs Contenedores | Experto | ya está · F167 | MSIO, MP c.12, BEDM2 c.15, RBE |
| T4 | Observability tax | Experto | ya está · F168 | BEDM2 c.3, OTEL |
| T5 | Costo por petición y por inquilino: etiquetar, repartir y enseñárselo al equipo | Experto | falta · 1 mención. Las herramientas de la nube son de Cloud M29 | SAP, AZ305, EST |
| T6 | El costo de la red y de los datos entre zonas y regiones | Experto | falta | SAP, PCA, HP c.13 |

#### Módulo 29 · Team Topologies y organización (`modulo-33.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Ley de Conway | Experto | ya está · F169 | BM2 c.15, BEDM2 c.1, TTK |
| T2 | Stream-aligned, Platform, Enabling teams | Experto | ya está · F170 | TTK, BM2 c.15, FSA2 c.9 |
| T3 | Carga cognitiva | Experto | ya está · F171 | TTK |
| T4 | Dimensionamiento de equipos | Experto | ya está · F172 | TTK, MSIO |
| T5 | Propiedad de servicios: fuerte o colectiva, servicios huérfanos y código abierto interno | Experto | está pero básico · hoy dentro de F172: 4 menciones en el módulo | BM2 c.15, M2M c.5 |

#### Módulo 29B · Plataforma interna de desarrollo (**módulo nuevo**)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | La plataforma como producto: capacidades, camino pavimentado y cómo se mide | Experto | falta · 1 mención en el curso | CNCFP, BM2 c.15–16, TTK, RI2 c.10, CNP c.3 |
| T2 | Plantilla de servicio y chassis: convention plugins de Gradle y un servicio listo para producción | Experto | falta | MSIO, MP c.11, CNCFP, REG |
| T3 | Catálogo de servicios: propiedad, dependencias y documentación viva | Experto | falta | CNCFP, BM2 c.5, BEDM2 c.19 |
| T4 | Entornos efímeros y experiencia local con muchos servicios | Experto | falta | BM2 c.9, M2M c.5, CNCFP |
| T5 | Preparación para producción: la lista que un servicio debe cumplir antes de salir | Experto | falta | SRE c.27, SRE c.32, RI2 c.10 |
| T6 | Métricas de entrega y de plataforma | Experto | está pero básico · hoy dentro de F179: DORA aparece 15 veces en 1 módulo | CNCFP, BM2 c.15 |

#### Módulo 30 · Anti-patrones y cuándo NO usar microservicios (`modulo-34.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Monolito distribuido | Experto | ya está · F173 | AZM, BM2 c.1, M2M c.2 |
| T2 | Sobre-descomposición | Experto | ya está · F174 | HP c.7, BEDM2 c.3, M2M c.5 |
| T3 | Sagas innecesarias | Experto | ya está · F175 | HP c.12, MP c.4 |
| T4 | Fitness functions contra los anti-patrones | Experto | ya está · F176 · repetido con F151: ver 3.2 | FSA2 c.6, HP c.1 |
| T5 | Antipatrones de datos: base de datos compartida, consultas en cadena y servicios-entidad | Experto | está pero básico · hoy dentro de F173: 4 menciones de base de datos compartida | MSIO, RSD, AZM, HP c.6 |
| T6 | Antipatrones de eventos: enjambre de eventos diminutos y RPC disfrazado | Experto | falta | FSA2 c.15, BEDM2 c.5 |
| T7 | Volver atrás: fusionar servicios y regresar al monolito modular | Experto | falta | HP c.7, M2M c.2, FSA2 c.11 |

#### Módulo 31 · Migración desde monolito real (`modulo-35.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Strangler Fig sobre un monolito real: plan y orden de extracción | Experto | ya está · F177 · repetido con F045: ver 3.2 | MSIO, AZP, AWSP, M2M c.3, MP c.13 |
| T2 | Patrones de extracción: branch by abstraction, ejecución en paralelo y colaborador decorador | Experto | falta · 1 y 0 menciones | M2M c.3 |
| T3 | Descomposición por componentes y bifurcación táctica | Experto | falta | HP c.4–5 |
| T4 | Descomponer la base de datos del monolito: vista, servicio envoltorio, partir tablas y claves foráneas al código | Experto | falta · 0 menciones | M2M c.4, HP c.6, HP c.9 |
| T5 | Coexistencia monolito + servicios | Experto | ya está · F178 | MP c.13, M2M c.3, AZP |
| T6 | Métricas de éxito | Experto | ya está · F179 | M2M c.2 |
| T7 | Deuda técnica | Experto | ya está · F180 | BM2 c.16 |

#### Módulo 31B · Confiabilidad: SLO, incidentes y caos (**módulo nuevo**)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | El SLO de un recorrido que cruza servicios: disponibilidad compuesta | Experto | falta · el método es de DevOps M14; aquí el sistema de servicios | SRE c.4, SREW c.2, BM2 c.10, EST |
| T2 | Política de presupuesto de error: qué se congela y quién decide | Experto | falta · 2 menciones en el curso | SRE c.3, SREW c.2 |
| T3 | Alertas por burn rate en varias ventanas y guardia sostenible | Experto | está pero básico · hoy dentro de F074: 7 menciones de burn rate en 2 módulos | SREW c.5, SRE c.11 |
| T4 | Respuesta a incidentes: roles, comunicación y runbooks | Experto | falta · runbook: 7 menciones en 1 módulo | SRE c.14, SREW c.9 |
| T5 | Postmortem sin culpa y acciones que se cierran | Experto | falta · 0 menciones | SRE c.15, SREW c.10 |
| T6 | Caos sobre Kubernetes: hipótesis, radio de explosión y experimentos continuos | Experto | está pero básico · hoy dentro de F060: Chaos Mesh o Litmus: 4 menciones | CHAOS, RI2 c.17, BM2 c.12 |
| T7 | Game days y simulacros de recuperación | Experto | está pero básico · hoy dentro de F060: 2 menciones | RI2 c.17, SRE c.13 |

#### Módulo 31C · Capacidad, sobrecarga y pruebas de carga (**módulo nuevo**)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Pruebas de carga con Gatling: modelo abierto o cerrado, rampa y omisión coordinada | Experto | está pero básico · hoy dentro de F184: Gatling solo aparece en el proyecto final | PROMPT, RI2 c.16, GRPC |
| T2 | k6 para la pista Node y para el pipeline | Experto | falta · 1 mención | RI2 c.16 |
| T3 | Planificar capacidad: de la prueba al número de réplicas y al costo | Experto | falta · la estimación es de Diseño de sistemas M0 y M6 | SREW c.11, SAP, DDIA2 c.2 |
| T4 | Control de sobrecarga: concurrencia adaptativa, colas acotadas y prioridad | Experto | falta · 0 menciones | SRE c.21, SREW c.17, RI2 c.5, AZP |
| T5 | Latencia de cola: p99, peticiones de respaldo (hedging) y cancelación | Experto | falta · 2 menciones de hedging | GRPC, DDIA2 c.2 |
| T6 | Autoescalar por eventos y por métricas propias: KEDA y métricas externas | Experto | está pero básico · hoy dentro de F085: 7 menciones de KEDA | K8S, CKA, BM2 c.13 |
| T7 | Rendimiento de extremo a extremo: perfilado continuo y regresiones en el pipeline | Experto | falta | OTEL, NODE, PMAP c.10 |

#### Módulo 31D · Multi-región y recuperación ante desastres (**módulo nuevo**)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | RPO y RTO por servicio y estrategias de recuperación | Experto | falta · 0 menciones de RPO o RTO en el curso | AZ305, SAP, PCA |
| T2 | Copias de seguridad y restauración probada cuando los datos están repartidos | Experto | falta | AZ305, SRE c.26, SAP |
| T3 | Activo-pasivo entre regiones: réplica, conmutación y vuelta atrás | Experto | falta | DDIA2 c.6, RSD, AZ305 |
| T4 | Activo-activo: enrutado global, afinidad de datos y conflictos | Experto | falta · 2 menciones de multi-región | AZP, DDIA2 c.6, EST, MIT |
| T5 | Mensajería entre regiones: réplica de topics, orden y duplicados | Experto | falta | KAF, BEDM2 c.19 |
| T6 | Aislar fallos: zonas, celdas y radio de explosión | Experto | falta | RI2 c.5, BM2 c.12, AZP, EST |
| T7 | Simulacro de pérdida de una región | Experto | falta · los servicios de la nube son de Cloud M32 | RI2 c.17, SRE c.13 |

#### Módulo 31E · Pruebas de un sistema distribuido (**módulo nuevo**)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Contratos a escala: `can-i-deploy`, entornos y contratos de mensajes | Experto | está pero básico · hoy dentro de F034: `can-i-deploy` está (12 menciones); contratos de mensajes, 0 | MSIO, BM2 c.9, MP c.10 |
| T2 | Pruebas de extremo a extremo: cuántas, de quién son y por qué fallan | Experto | falta | BM2 c.9, M2M c.5, MP c.10 |
| T3 | Pruebas en producción: tráfico sintético, sombra y canarios | Experto | falta | BM2 c.9, SRE c.17, SREW c.16 |
| T4 | Probar la compatibilidad de esquemas y una topología de eventos entera | Experto | falta | BEDM2 c.20 |
| T5 | Resiliencia en el pipeline: Toxiproxy con Testcontainers | Experto | está pero básico · hoy dentro de F060: amplía F060 | RI2 c.5, CHAOS |
| T6 | Verificar sistemas distribuidos: simulación determinista, pruebas tipo Jepsen y modelos formales | Experto | falta | MIT, DDIA2 c.9 |

#### Módulo 31F · Estilos vecinos y frontera con el cliente (**módulo nuevo**)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Estilos comparados: monolito modular, basada en servicios, dirigida por eventos y microservicios | Experto | está pero básico · hoy dentro de F041: F041 compara tres; falta la arquitectura basada en servicios | FSA2 c.9–19, RSA |
| T2 | Funciones como servicios: cuándo un servicio es una función | Experto | está pero básico · hoy dentro de F167: F167 da el punto de equilibrio de costo; falta el diseño | MSIO, MP c.12, BEDM2 c.15, MIT, AZ305 |
| T3 | Micro frontends y composición de la interfaz | Experto | falta · 0 menciones | MSIO, BM2 c.14, M2M c.3, BEDM2 c.17, RSA |
| T4 | BFF a fondo: uno por experiencia, propiedad y agregación | Experto | está pero básico · hoy dentro de F056: amplía F056 | BM2 c.14, MSIO, AZP |
| T5 | Sidecar, ambassador y runtimes de aplicación distribuida | Experto | está pero básico · hoy dentro de F164: 17 menciones de Dapr, sin ficha | AZP, BEDM2 c.11, CKAD, K8S |

#### Módulo 32 · Proyecto Final y Comité de Arquitectura (`modulo-36.md`)

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Sistema de reservas con pago externo | Experto | ya está · F181 | PROMPT, FSA2 c.16 |
| T2 | Saga orquestada con Temporal.io en el proyecto | Experto | ya está · F182 · aplica F153: ver 3.2 | PROMPT, TMP |
| T3 | API Gateway con rate limiting | Experto | ya está · F183 · aplica F053 | PROMPT, AZP, MSIO |
| T4 | Test de carga con Gatling | Experto | ya está · F184 | PROMPT, RI2 c.16 |
| T5 | Restricción sobrevenida | Experto | ya está · F185 | PROMPT |
| T6 | Rediseño documentado en ADR | Experto | ya está · F186 | PROMPT, FSA2 c.21 |
| T7 | Defensa ante Architecture Review Board | Experto | ya está · F187 | PROMPT, FSA2 c.25 |

## 3. Repeticiones internas y temas espejo

### 3.1 Qué se midió

Sobre `microservicios-inventario.json`: **7 títulos idénticos** que suman 15 fichas:

| Título idéntico | Fichas |
|---|---|
| Blue-Green y Canary | F087, F146 |
| Database-per-service | F046, F103 |
| Fallback strategies | F059, F123 |
| GitOps con ArgoCD | F088, F147 |
| HPA | F085, F144 |
| NATS | F080, F117, F159 |
| Token Exchange (RFC 8693) | F066, F162 |

### 3.2 Repeticiones detectadas y qué se hace con cada una

Hay tres clases de repetición. No se borra ninguna ficha: se le da un papel distinto a cada una.

**A. Espejos de pista (Spring ↔ Node).** El mismo concepto con distinta librería. Es intencionado, porque las pistas se
pueden cursar por separado, pero hoy cada ficha vuelve a explicar el concepto desde cero.

| Concepto | Ficha dueña (Fase 1) | Ficha espejo (Fase 2) | Qué queda en el espejo |
|---|---|---|---|
| Database-per-service | F046 | F103 | cómo se aplica con Prisma/Mongoose y sus migraciones |
| Síncrono frente a asíncrono | F051 | F118 | el mismo criterio con el event loop de por medio |
| Service discovery con Consul | F052 | F111 | registro y salud desde Node |
| Configuración centralizada | F054 | F112 | lectura y recarga en NestJS |
| Timeouts y presupuesto de latencia | F058 | F122 | `AbortSignal` y timeouts de `fetch`/undici |
| Fallback | F059 | F123 | la implementación con cockatiel u opossum |
| JWT | F062 | F124 | la librería de Node y sus errores típicos |
| RabbitMQ: confirms y acks | F079 | F135 | `amqplib` y el canal de confirmación |
| NATS | F080 | F117 | el cliente de Node |
| Dockerfile multi-stage | F081 | F142 | la imagen de Node y `npm ci` |
| Kubernetes y sondas | F083, F084 | F143 | sondas y recursos de un proceso de un hilo |
| HPA | F085 | F144 | qué métrica escalar cuando la CPU engaña |
| Blue-Green y Canary | F087 | F146 | el mismo despliegue con la imagen de Node |
| GitOps con ArgoCD | F088 | F147 | el repositorio de manifiestos de la pista Node |
| Contract testing con Pact | F034 | F107 | Pact JS |
| Testcontainers | F033 | F108 | el módulo de Node |
| DTOs y validación | F026 | F099 | DTOs con class-validator o Zod |
| gRPC · GraphQL | F048 · F049 | F114 · F115 | títulos ya distintos; se enlazan como espejo |

**B. Repeticiones de profundidad (una fase de stack → Fase 3).** La Fase 3 vuelve a un tema con el mismo título.

| Materia | Primer contacto | Vuelta en la Fase 3 | Reparto propuesto |
|---|---|---|---|
| NATS | F080 (y F117) | F159 | F080: publicar-suscribir y primer stream; F159: JetStream en producción. El resto pasa al Módulo 26D |
| Token Exchange (RFC 8693) | F066 | F162 | F066: delegar la identidad con Keycloak; F162: la cadena entera (audiencia, alcance, actor) |
| mTLS y service mesh | F067 | F161, F164 | F067: activar mTLS y verlo; F161: identidad SPIFFE y política; F164: sidecar frente a ambient |
| Vault | F068 (y F129) | F163 | F068: leer un secreto; F163: secretos dinámicos y rotación; F129: los gestores de la nube |
| Exactly-once | F076 | F155, F157 | F076: productor idempotente y transacciones; F155: qué garantiza de extremo a extremo; F157: no vuelve a explicarlo |
| Kafka profundo · Schema Registry | F075, F077 | F157 | F157 pasa a ser la ficha de integración (transacciones + esquemas juntos) y enlaza a F075–F077 |
| RabbitMQ | F079 | F158 | F158 deja de repetir confirms y DLQ; lo nuevo va al Módulo 26D |
| Strangler Fig | F045 | F177 | F045: una extracción guiada; F177: plan y orden sobre un monolito real |
| Saga con Temporal | F153 | F182 | F153 enseña; F182 la aplica en el proyecto final sin volver a explicar |
| API Gateway | F053 | F183 | F053 enseña; F183 añade rate limiting en el proyecto final |

**C. Repetición en el mismo nivel.**

| Materia | Fichas | Reparto propuesto |
|---|---|---|
| Fitness functions | F151 y F176 | F151: fitness functions en producción (medir características); F176: las que detectan los anti-patrones del Módulo 30. Si al escribir no dan para dos fichas, se funden en F151 y F176 queda como espejo de una página |

### 3.3 Cómo se marca un «tema espejo»

Un tema espejo no es un duplicado: es una ficha corta que enlaza a su dueña y solo enseña lo que cambia.

1. **En el inventario** (`microservicios-inventario.json`): dos campos nuevos por ficha, `"espejo_de": "F085"` en el
   espejo y `"espejos": ["F144"]` en la dueña. Para la clase B, `"continua": "F159"` y `"continua_de": "F080"`.
2. **En la lección:** la primera línea bajo el encabezado es un aviso fijo, por ejemplo
   `> **Tema espejo de F085 · HPA.** El concepto se explica allí. Aquí: lo que cambia en Node.js.`
3. **Qué contiene la dueña:** los puntos conceptuales de la ficha (por qué importa, analogía, diagrama, explicación en
   tres niveles, cuándo usarlo y cuándo no) escritos **sin depender del stack**, para que alguien de la otra pista pueda
   leerlos.
4. **Qué contiene el espejo:** ubicación, un resumen del concepto de cinco líneas como máximo con el enlace, y completos
   solo los puntos que dependen del stack: código ejecutable, mini-laboratorio, verificación y error común.
5. **Título único:** el espejo lleva el stack o el matiz en el título («HPA para Node: escalar con un solo hilo»), que es
   lo que exige el criterio Z3.
6. **Validador:** `scripts/validate_formato.py` aceptaría un espejo con los puntos conceptuales reducidos solo si declara
   `espejo_de` y la dueña existe; un título repetido sin esa marca sigue siendo un fallo. Esto es una propuesta: el
   validador no se toca en esta fase.
7. **En la página:** una etiqueta «Espejo de …» junto al título y un enlace de vuelta en la dueña («También en Node.js»).

Con specs/021 (formato de 12 secciones; Microservicios conserva su ficha de 14 puntos, según
`docs/reestructuracion/ESTADO.md`) el espejo sigue teniendo todos los encabezados: los conceptuales se rellenan con el
resumen y el enlace.

### 3.4 Lo que una pista tiene y la otra no

La comparación de las dos pistas deja huecos que hoy obligarían a cursar la otra pista para aprender el concepto. El
temario los cierra con temas nuevos marcados como espejo:

| Concepto | Tiene ficha en | Falta en | Fila que lo cierra |
|---|---|---|---|
| Caché, estampida y bloqueo distribuido | Spring (F037–F040) | Node | Módulo 15 T5 y T6 |
| API Gateway y BFF | Spring (F053, F056) | Node | Módulo 17 T7 |
| DDD y monolito modular | Spring (F042, F043) | Node | Módulo 17 T2 |
| OAuth2/OIDC con Keycloak, RBAC | Spring (F063–F065) | Node | Módulo 20 T3 y T4 |
| Token Exchange · escaneo de vulnerabilidades | Spring (F066, F069) | Node | Módulo 20B T2 y T3 |
| Kafka a fondo, EOS, Schema Registry, DLT | Spring (F075–F078) | Node | Módulo 22B |
| ArchUnit y SonarQube | Spring (F035, F036) | Node | Módulo 16 T7 |
| Helm | Spring (F086) | Node | Módulo 23 T3 |
| Alertas | Spring (F074) | Node | Módulo 21 T6 |
| OpenAPI | Node (F100) | Spring | Módulo 2B T2 |
| OWASP | Node (F128) | Spring | Módulo 9B T2 |
| Pipeline de CI | Node (F145) | Spring | Módulo 12B T1 |
| Propagación de la traza en mensajería | Node (F131) | Spring | Módulo 10 T5 |
| Saga a mano, Event Sourcing, CQRS y proyecciones | Node (F137–F141) | Spring | Módulo 25 T2 y Módulo 25C T4 y T6 (en la Fase 3, comunes a las dos pistas) |

### 3.5 Títulos que cambian para que ninguno se repita (criterio Z3)

El criterio Z3 de specs/021 exige que ningún título se repita en toda la academia. Estas 40 fichas conservan su identificador y su contenido; solo cambia el título:

| Ficha | Módulo | Título hoy | Título propuesto |
|---|---|---|---|
| F017 | 1 | Java 21: Streams, Lambdas, Optional, Records, Pattern Matching | Java 21+: Streams, Lambdas, Optional, Records, Pattern Matching |
| F021 | 1 | Multi-module Spring Boot projects | Proyectos Spring Boot de varios módulos (multi-proyecto Gradle) |
| F032 | 3 | JUnit 5, Mockito, MockMvc | JUnit, Mockito, MockMvc |
| F038 | 4 | Patrones: Read-Through, Write-Behind, Write-Through | Patrones: Cache-Aside, Read-Through, Write-Through, Write-Behind |
| F045 | 5 | Strangler Fig Pattern | Strangler Fig Pattern: primera extracción guiada |
| F047 | 6 | REST síncrono: RestTemplate, WebClient, OpenFeign | REST síncrono: RestClient, WebClient, clientes declarativos y OpenFeign |
| F051 | 6 | Sync vs async: criterios de decisión | Síncrono frente a asíncrono: criterios de decisión |
| F059 | 8 | Fallback strategies | Estrategias de fallback |
| F066 | 9 | Token Exchange (RFC 8693) | Token Exchange (RFC 8693): delegar la identidad del usuario |
| F067 | 9B | mTLS con Service Mesh | mTLS con Service Mesh: primer contacto |
| F068 | 9B | HashiCorp Vault | HashiCorp Vault: leer un secreto desde el servicio |
| F074 | 10 | Alerting basado en p99 | Alertas: del p99 al SLO con presupuesto de error |
| F076 | 11 | Exactly-Once Semantics (EOS) | Exactly-Once Semantics (EOS): productor idempotente y transacciones |
| F080 | 11 | NATS | NATS: primer contacto con publicar-suscribir y JetStream |
| F099 | 14 | DTOs | DTOs en NestJS |
| F103 | 15 | Database-per-service | Database-per-service en Node |
| F107 | 16 | Contract Testing con Pact | Contract Testing con Pact en Node |
| F110 | 17 | dotenv | dotenv y configuración por entorno |
| F111 | 17 | Service Discovery con Consul | Service Discovery con Consul en Node |
| F112 | 17 | Configuración centralizada | Configuración centralizada en Node |
| F117 | 18 | NATS | NATS con el cliente de Node |
| F118 | 18 | Sync vs async | Síncrono frente a asíncrono en Node |
| F122 | 19 | Timeouts | Timeouts en Node |
| F123 | 19 | Fallback strategies | Estrategias de fallback en Node |
| F135 | 22 | RabbitMQ: publisher confirms, consumer acknowledgments | RabbitMQ en Node: publisher confirms, consumer acknowledgments |
| F142 | 23 | Dockerfile multi-stage | Dockerfile multi-stage para Node |
| F143 | 23 | Kubernetes | Kubernetes para un servicio Node: sondas, configuración y recursos |
| F144 | 23 | HPA | HPA para Node: escalar con un solo hilo |
| F146 | 23 | Blue-Green y Canary | Blue-Green y Canary con un servicio Node |
| F147 | 23 | GitOps con ArgoCD | GitOps con ArgoCD para la pista Node |
| F155 | 25 | Exactly-once semantics en la práctica | Exactly-once en la práctica: qué garantiza de extremo a extremo |
| F156 | 25 | Two-Phase Commit: por qué no usar | Two-Phase Commit, XA y TCC: por qué casi nunca |
| F159 | 26 | NATS | NATS en producción: JetStream |
| F161 | 27 | mTLS con Istio/Linkerd | Zero-Trust entre servicios: mTLS con Istio/Linkerd e identidad SPIFFE |
| F162 | 27 | Token Exchange (RFC 8693) | Token Exchange en una cadena de servicios: audiencia, alcance y actor |
| F163 | 27 | Vault | Vault en producción: secretos dinámicos y rotación |
| F164 | 27 | Service Mesh | Service Mesh: sidecar, ambient y política de autorización |
| F176 | 30 | Fitness functions | Fitness functions contra los anti-patrones |
| F177 | 31 | Strangler Fig | Strangler Fig sobre un monolito real: plan y orden de extracción |
| F182 | 32 | Saga orquestada con Temporal.io | Saga orquestada con Temporal.io en el proyecto |

## 4. Reparto con Spring, Gradle, Docker, Kubernetes, DevOps, Cloud y Diseño de sistemas

Regla 1 de specs/021: un concepto, un curso dueño. Microservicios es dueño de **los patrones entre servicios, sus fallos
y sus decisiones**; no es dueño de las herramientas con las que se construye o despliega un servicio.

### 4.1 De qué es dueño Microservicios

| Concepto | Módulos | Quién lo usa y enlaza |
|---|---|---|
| Límites de servicio, DDD estratégico, acoplamiento y granularidad | 5, 5B, 30 | Spring M34 (Modulith), Diseño de sistemas |
| Spring Cloud: discovery, Config Server, Gateway, LoadBalancer, BFF | 7 | Spring (no los enseña) |
| Resiliencia entre servicios: Resilience4j, presupuestos, descarte de carga | 8, 19, 31C | Spring M8 (reintentos del núcleo), Diseño de sistemas M6 |
| Seguridad entre servicios: Token Exchange, mTLS, Vault, Zero-Trust, política | 9, 9B, 20, 27, 27C | Spring M18–M19 y M42 (un solo servicio), Kubernetes M9 |
| Sagas, 2PC, outbox, CDC, Event Sourcing, CQRS, ejecución duradera | 22, 25, 25B, 25C | Spring M27 T3 (outbox en un servicio) |
| Conceptos de broker y arquitectura de eventos (Kafka, RabbitMQ, NATS, streaming) | 11, 22B, 26, 26B, 26C, 26D | Spring M26–M29 (la API de Spring), Cloud M3, M11 y M17 (servicios gestionados) |
| Contratos entre servicios: Pact, `.proto`, AsyncAPI | 3, 6B, 16, 26, 31E | Spring M43 |
| Service mesh | 9B, 27, 27B | Kubernetes M13 T3 (decisión D11) |
| Migración desde un monolito y evolución de datos sin corte | 5, 25D, 31 | RutaFlow |
| Gobernanza, organización, plataforma y FinOps de una arquitectura de servicios | 24, 28, 29, 29B | DevOps, Cloud M29 y M33 |
| Teoría de sistemas distribuidos aplicada (consenso, relojes, consistencia, réplica, particionado) | 24B, 24C | Diseño de sistemas M2 y M4 (decisión D2) |

### 4.2 Lo que Microservicios usa y no vuelve a explicar

| Concepto | Curso dueño | Qué hace Microservicios | Filas afectadas |
|---|---|---|---|
| Lenguaje Java, hilos virtuales, JVM, GC, JFR | Java | repaso corto y enlace; el caso del servicio en contenedor | F017, F018, Módulo 12C T1 |
| Modelo de Gradle, catálogos, multi-proyecto, convention plugins, build cache | Gradle (M8, M9, M11, M14) | los usa en todos los laboratorios de la Fase 1 | Módulo 0.3 T3, Módulo 1 T3 y T6, Módulo 29B T2 |
| IoC, autoconfiguración, perfiles, MVC, Jackson, JPA, Flyway, pruebas, `@Cacheable`, Modulith, filter chain, Micrometer, AOT, nativo y CRaC | Spring (M1–M5, M10–M17, M32, M34, M37, M40) | fichas espejo que enlazan (ya previsto en `spring-objetivo.md`, 3.2) | F019–F030, F032, F033, F037, F043, F061, F070, F023, F024 |
| Dockerfile, capas, multi-stage, Compose, registros, firma y SBOM | Docker (M3, M4, M7, M8) | el Dockerfile del servicio y su Compose de laboratorio | F016, F081, F082, F142, Módulo 9B T6 |
| Objetos de Kubernetes, Helm, Gateway API, HPA, NetworkPolicy, RBAC del clúster, kubeadm | Kubernetes (M1–M9, M11) | lo que el servicio necesita para desplegarse y apagarse bien | F083–F086, F143, F144, Módulo 12 T5, Módulo 27 T7 |
| GitOps con Argo CD | Kubernetes (M13 T1–T2) | el repositorio de manifiestos del curso | F088, F147 |
| CI/CD como disciplina, Terraform, logging central | DevOps (M4, M5, M8, M10) | el pipeline concreto de un servicio | F145, Módulo 12B T1 |
| SRE como método: SLI, SLO, guardias, incidentes, postmortem | DevOps (M14) | aplicarlo a un recorrido que cruza servicios | Módulo 10 T7, Módulo 21 T6, Módulo 31B (decisión D3) |
| Servicios gestionados (SQS, SNS, EventBridge, MSK, Step Functions, ElastiCache, OpenSearch, Lambda), Floci y recuperación en la nube | Cloud (M3, M5, M11, M16, M17, M23, M28, M32) | el patrón; el laboratorio de nube corre contra Floci | F129, F167, Módulo 25B T7, 25C T5, 26D T7, 31D |
| Coste en la nube: herramientas y gobierno de cuenta | Cloud (M29) | el costo como propiedad de la arquitectura | Módulo 28 |
| Método de diseño, estimación, borde y tráfico (CDN, balanceo), casos de diseño | Diseño de sistemas (M0, M1, M6, M8) | lo usa en el proyecto final | Módulo 31C T3 |
| Notación C4 y plantilla de ADR | Diseño de sistemas | las usa en gobernanza y en el Comité | F148, F149 |
| HTTP, SQL, Git, terminal | Fundamentos | repaso de la Fase 0 (decisión D8) | Módulos 0.4 y 0.6 |
| LLM, RAG y agentes | IA aplicada | fuera de alcance; un modelo es una dependencia lenta y cara más | — |

### 4.3 Lo que llega a Microservicios desde otros cursos

| Origen | Contenido | Destino en este temario |
|---|---|---|
| Spring M16 T1–T2, T6 | Config Server, discovery, Spring Cloud Gateway | Módulo 7 (F052–F055) |
| Spring M16 T3–T4 | Circuit breaker, Bulkhead y RateLimiter de Resilience4j | Módulo 8 (F057) |
| Spring M16 T5 | Token Relay | Módulo 7 T3 (lo que le falta a F053) |
| Spring M16 T8 | DDD para decidir límites | Módulos 5 y 5B |
| Spring M16 T9 | Orquestar con Temporal | Módulos 25 y 25B |
| Spring M16 T10 | Spring Cloud Bus | Módulo 7 T5 (F054). El tren 2025.1.4 lo lista en 5.0.4; `spring-objetivo.md` avisa de que no figura en 2026.0: comprobar |
| Spring M17 T2, T5–T7 | Recuperación con duplicación segura, saga, Event Sourcing, compensación que falla | Módulos 25 y 25C |
| Spring M17 T4 | Observabilidad al servicio de un objetivo | Módulo 10 T7 y Módulo 31B |
| DevOps M19 (4 temas) | Arquitectura moderna y DDD | Módulos 5 y 5B |
| DevOps M20 (4 temas) | Eventos de dominio y consistencia eventual | Módulos 5B T4, 25 y 26 |
| DevOps M21 (4 temas) | Contratos, datos y operación de microservicios | Módulos 3, 25C, 10 y 31B |
| DevOps M15 (parte de service mesh) | Service mesh | Módulos 27 y 27B |

El reparto tema por tema de DevOps M19–M21 estaba escrito contra la propuesta de 12 módulos de
`docs/temarios/microservicios.md`; al aprobar este temario hay que rehacer esa tabla contra las etiquetas de aquí
(specs/020: el contenido de origen no se borra antes de que el destino exista).

## 5. Proyecto guía y laboratorios

### 5.1 Proyecto guía: «Reservas con pago externo»

El curso ya termina en un sistema de reservas con pago externo (F181–F187, `examples/microservicios/modulo-36/`). La
propuesta es que ese sistema sea el **proyecto guía desde el Módulo 1**, de modo que cada módulo le añada una pieza y
ningún laboratorio sea un ejemplo suelto (specs/021, sección 3). Ver la decisión D9 sobre RutaFlow.

| Tramo | Qué gana el sistema de reservas |
|---|---|
| Fase 0 | un «hola» en Java (Gradle) y otro en Node que responden por HTTP dentro de Docker |
| Módulos 1–4 y 2B | `reservas` como API REST con PostgreSQL, contrato OpenAPI, pruebas y caché de disponibilidad |
| Módulos 5–6B | se separan `pagos` y `notificaciones`; REST, gRPC y eventos entre ellos |
| Módulos 7–9B | gateway, discovery, configuración central, Resilience4j frente al pago externo lento, Keycloak y Vault |
| Módulos 10–12C | trazas de extremo a extremo, Kafka entre servicios, despliegue en Kubernetes con canario, flags y pipeline |
| Fase 2 | el mismo sistema en Node.js con NestJS, con los mismos contratos (los Pact de una pista validan a la otra) |
| Módulos 24–25D | la reserva como saga con Temporal, outbox con Debezium, proyección de búsqueda y un cambio de esquema sin corte |
| Módulos 26–27C | topología de eventos con esquema gobernado, malla con mTLS y política, y un segundo inquilino |
| Módulos 28–31F | costo por reserva, SLO del recorrido «reservar y pagar», prueba de carga, caída de una región y postmortem |
| Módulo 32 | proyecto final y Comité: lo actual, más los requisitos nuevos de 5.4 |

### 5.2 Reglas de los laboratorios

- **Pista Spring con Gradle (regla 7).** Cada `examples/microservicios/modulo-N/` es un build de Gradle con
  `settings.gradle.kts`, `build.gradle.kts`, `gradle/libs.versions.toml` (catálogo de versiones), `gradlew` y
  `verificar.sh`. Así está ya el Módulo 1 en el árbol de trabajo (`examples/microservicios/modulo-5/`), con Spring Boot
  4.1.3 en el catálogo y las librerías sin versión fijadas por el BOM de Spring Boot.
- Las versiones de Spring Cloud entran por su BOM en el mismo catálogo; ninguna versión se escribe en un `build.gradle.kts`.
- Desde el Módulo 5, los servicios del proyecto guía comparten su configuración de build con **convention plugins**
  (`build-logic/`), que es además el material del Módulo 29B T2 (plantilla de servicio). El curso Gradle (M9) es el dueño
  del mecanismo.
- **Maven** queda como una nota «Equivalencia en Maven» en el README de cada laboratorio, sin `pom.xml` mantenido.
- **Pista Node:** `package.json` con `engines`, `package-lock.json` y `npm ci`; desde el Módulo 17, workspaces de npm.
- **Infraestructura:** `docker-compose.yml` por laboratorio con imágenes fijadas por versión; Kubernetes en kind.
- **Nube (regla 8):** lo que toque un servicio de nube corre contra Floci con el `docker-compose.yml` de la raíz, y el
  README dice qué emula Floci y qué cambia en la nube real. Hoy solo el módulo de F129 nombra Floci.
- **Fracaso controlado** (prompt del dueño): cada laboratorio nuevo rompe algo a propósito y `verificar.sh` comprueba
  tanto el fallo como la recuperación.
- **Exactitud (regla 9):** ningún laboratorio de la tabla 5.3 está escrito ni ejecutado. Se verifican en el Mac del
  dueño antes de cerrar el curso (criterio Z11).

### 5.4 Proyecto final (Módulo 32): lo que se añade a la rúbrica

Se conservan las siete fichas (F181–F187) y la rúbrica de `docs/microservicios/07-plantillas.md`. Con el temario nuevo, la
defensa ante el Comité añade:

1. Un SLO del recorrido principal con su política de presupuesto de error (Módulo 31B).
2. La prueba de carga con el punto de ruptura y el plan de capacidad (Módulo 31C).
3. RPO y RTO declarados y un simulacro que los mida (Módulo 31D).
4. Un cambio de esquema sin corte durante la prueba de carga (Módulo 25D).
5. La justificación del modelo de consistencia de cada operación crítica (Módulos 24B y 25).
6. El costo por reserva (Módulo 28).

La pista Spring del proyecto final se construye con Gradle; hoy `modulo-36` está en migración.

### 5.3 Laboratorio de cada módulo nuevo o dividido

Cada uno vive en `examples/microservicios/<carpeta>/` con README, versiones fijadas y `verificar.sh` que termina en «RESULTADO: OK».

| Módulo | Laboratorio (qué se rompe y qué se comprueba) | Stack |
|---|---|---|
| 0.6 · Redes, datos y pruebas: lo mínimo antes de distribuir | Capturar con `curl -v` y `dig` el camino de una petición; dos procesos que escriben el mismo archivo y se pisan | Java (Gradle) y Node |
| 2B · Diseño y evolución de APIs | El contrato OpenAPI genera servidor y cliente; un cambio incompatible hace fallar el build; un POST repetido con `Idempotency-Key` no duplica | Spring + Gradle |
| 5B · Modelado de dominio para servicios | Event Storming del sistema de reservas en papel → mapa de contextos → dos módulos con un evento de integración que no expone el modelo interno | Spring + Gradle |
| 6B · gRPC, GraphQL federado y tiempo real | Un deadline que se propaga por tres servicios gRPC y corta la cadena; un `.proto` roto que el pipeline rechaza; webhook firmado con reintento | Spring + Gradle |
| 9 · Seguridad: identidad y tokens | Laboratorio actual de `modulo-13` (identidad y tokens), más un token revocado que deja de valer | Spring + Gradle |
| 9B · Seguridad: red, secretos y cadena de suministro | Laboratorio actual de `modulo-13` (mTLS, Vault, Trivy), más un modelo de amenazas del sistema y una imagen sin firma que se rechaza | Spring + Gradle |
| 12 · Contenedores y Kubernetes para servicios Spring | Laboratorio actual de `modulo-16`, más un despliegue que no pierde peticiones gracias a preStop, readiness y PodDisruptionBudget | Spring + Gradle + kind |
| 12B · Entrega continua y progresiva (pista Spring) | Pipeline que construye con Gradle, prueba, escanea y publica; una migración expand/contract desplegada sin corte; un canario que se revierte solo | Spring + Gradle + kind |
| 12C · Arranque, huella y costo de runtime | El mismo servicio como JAR, con AOT cache, nativo y con CRaC: arranque, memoria y costo por petición medidos | Spring + Gradle |
| 20B · Secretos y seguridad entre servicios en Node | Secretos desde Floci y Vault; identidad del usuario propagada por dos servicios Node | Node + Floci |
| 22B · Kafka a fondo desde Node | Un consumidor que se cae a mitad de lote y no duplica; un mensaje envenenado que acaba en el dead letter topic | Node |
| 24B · Teoría de sistemas distribuidos para arquitectos | Un clúster de etcd de tres nodos: se mata al líder y se parte la red; dos relojes desajustados que ordenan mal dos eventos | Docker Compose |
| 24C · Replicación, particionado y transacciones a escala | PostgreSQL con réplica: leer un dato viejo y arreglarlo; reproducir una escritura sesgada y evitarla con serializable | Docker Compose + Spring |
| 25B · Ejecución duradera con Temporal a fondo | Desplegar una versión nueva de un workflow con ejecuciones vivas sin romperlas; un workflow que no revienta su historial | Spring + Gradle y Node |
| 25C · CDC, proyecciones y datos derivados | Outbox → Debezium → Kafka → OpenSearch; se borra el índice y se reconstruye con una proyección en paralelo | Spring + Gradle |
| 25D · Evolución de datos sin corte | Renombrar una columna con tráfico: expandir, backfill verificado, doble escritura, corte y contraer, con cero errores en la prueba de carga | Spring + Gradle |
| 26B · Kafka por dentro y en operación | Tres brokers: se apaga uno y `min.insync.replicas` decide si se escribe; un conector de Connect; lag y cuotas en Grafana | Docker Compose |
| 26C · Procesamiento de streams | Una topología de Kafka Streams con ventana y eventos tardíos; se rebobina para corregir un dato malo | Spring + Gradle |
| 26D · RabbitMQ y NATS en producción | Una partición de red en un clúster de RabbitMQ con colas quorum; un leaf node de NATS que se desconecta y vuelve | Docker Compose |
| 27B · Service mesh a fondo | Canario al 10 % con la malla y Gateway API; un fallo inyectado desde la malla; el mismo reintento hecho dos veces y por qué es un error | kind + Istio o Linkerd |
| 27C · Seguridad avanzada de datos y multi-tenencia | Segundo inquilino en el sistema de reservas: aislamiento por fila que una consulta mal escrita no puede saltarse; un campo cifrado con Transit | Spring + Gradle |
| 29B · Plataforma interna de desarrollo | Crear un servicio nuevo desde la plantilla en minutos y que nazca con pruebas, métricas, sondas y pipeline | Gradle + Node |
| 31B · Confiabilidad: SLO, incidentes y caos | SLO del recorrido «reservar y pagar», alerta por burn rate, un incidente provocado y su postmortem escrito | kind + Prometheus |
| 31C · Capacidad, sobrecarga y pruebas de carga | Prueba de carga con rampa hasta romper el sistema; después, con descarte de carga, se degrada sin caer | Gatling (Gradle) y k6 |
| 31D · Multi-región y recuperación ante desastres | Dos clústeres kind como dos regiones: se pierde una y se mide el RPO y el RTO reales frente a los declarados | kind + Floci |
| 31E · Pruebas de un sistema distribuido | Un contrato de mensaje que bloquea un despliegue; una prueba de resiliencia con Toxiproxy dentro del pipeline | Spring + Gradle y Node |
| 31F · Estilos vecinos y frontera con el cliente | La pantalla de reservas compuesta desde dos servicios; una función que sustituye a un servicio y su costo | Node + Floci |

## 6. Decisiones para el dueño

| # | Decisión | Opciones | Recomendación |
|---|---|---|---|
| D1 | **Tamaño.** Pasar de 187 a 395 temas (208 nuevos) y de 37 a 62 módulos | aprobar entero · aprobar por fases | Aprobar entero: la regla 10 pide la versión extendida. Escribir primero la Fase 3 nueva, que es donde está casi todo lo que falta |
| D2 | **Dueño de la teoría distribuida** (consenso, relojes, modelos de consistencia, réplica, particionado: Módulos 24B y 24C). `diseno-de-sistemas.md` ya prevé «Datos que crecen» (M2) y «Consistencia y coordinación» (M4) | A: dueño Microservicios y Diseño de sistemas enlaza · B: dueño Diseño de sistemas y aquí solo espejos | A. Microservicios va 4.º en el orden de specs/021 y Diseño de sistemas casi al final; las sagas y el CDC necesitan esa teoría antes. Diseño de sistemas se queda con el método, la estimación y los casos |
| D3 | **SLO, incidentes, capacidad y recuperación** (Módulos 31B, 31C y 31D) tocan DevOps M14, Diseño de sistemas M6–M7 y Cloud M32 | A: el método en su dueño y aquí la aplicación a varios servicios · B: todo aquí | A, tal como están escritas las filas. Hay que confirmar con los temarios de DevOps y Cloud cuando existan |
| D4 | **Mover F023 (CRaC) y F024 (GraalVM)** del Módulo 1 al Módulo 12C | mover · dejar | Mover: hoy se enseñan antes que Docker y que el primer endpoint, y su dueño es Spring M40. Los laboratorios no cambian de carpeta hasta la renumeración |
| D5 | **Dividir los módulos que pasan de 7 temas** (1, 9 y 12 hoy; 20 al añadir lo que falta) y **numeración** | letras ahora y renumerar al final con `module-renumbering.ts` · renumerar ya | Letras ahora. Renumerar una sola vez, cuando el temario esté aprobado, para conservar el progreso de lectura |
| D6 | **Convención de tema espejo** (3.3) y **cambio de títulos** (3.5) para cumplir Z3 | aprobar · ajustar | Aprobar. Afecta a los títulos y al inventario, no al contenido verificado |
| D7 | **Simetría de las pistas:** añadir los 19 temas nuevos marcados como espejo para que cada pista sea completa por sí sola | añadirlos · declarar que la pista Node presupone la Spring | Añadirlos: el curso promete «por separado» y la ruta de un solo stack existe en `03-tabla-de-contenidos.md` |
| D8 | **Fase 0:** el Módulo 0.6 (redes, SQL, concurrencia, REST, pruebas, falacias) repite conceptos de Fundamentos | A: fichas espejo cortas que enlazan a Fundamentos · B: fichas completas · C: no añadirlo y exigir Fundamentos | A. El prompt pide llevar a alguien sin conocimientos previos, pero el dueño de HTTP y SQL es Fundamentos |
| D9 | **Proyecto guía:** «Reservas con pago externo» durante todo el curso | Reservas · RutaFlow | Reservas: ya está construido en el Módulo 32. RutaFlow sigue siendo el integrador de la academia |
| D10 | **Duración:** 32 semanas pasan a unas 68 al ritmo actual | una ruta larga · rutas | Publicar tres rutas: un solo stack, las dos pistas y «solo Fase 3» para quien ya trabaja con microservicios |
| D11 | **Service mesh:** `kubernetes.md` M13 T3 también lo enseña | dueño Microservicios · dueño Kubernetes | Microservicios (ya tiene F067, F161 y F164, y el Módulo 27B). Kubernetes M13 T3 queda como enlace |
| D12 | **`docs/temarios/microservicios.md`** (12 módulos, 78 temas) | archivarlo · mantener los dos | Marcarlo como sustituido por este documento y actualizar la fila de `docs/temarios/README.md` |
| D13 | **Kafka en la pista Node:** F116 se llama «KafkaJS, amqplib» | mantener KafkaJS · cambiar de cliente | No decidir hasta comprobar el estado de mantenimiento de los clientes (ver pendientes) |
| D14 | **Orden de escritura** | por fases · por huecos | 1.º Módulos 24B–25D (teoría y datos) · 2.º 31B–31E (operación) · 3.º 26B–27C · 4.º módulos nuevos de las Fases 1 y 2 · 5.º espejos y títulos |

Ningún tema «falta» queda sin decidir: todos tienen módulo y nivel asignados. Lo que este temario deja fuera a propósito
está en el apartado 4.2 (tiene otro dueño) y en esta lista:

- Lenguajes y frameworks distintos de Spring Boot y Node.js (Quarkus, Micronaut, Go, .NET): el prompt fija dos pistas.
- Axon Framework (que `PMAP` usa para CQRS): el curso usa NestJS CQRS, EventStoreDB y Temporal.
- Tolerancia a fallos bizantinos y redes entre pares (`MIT`): se nombran en el Módulo 24B T1; su curso es Blockchain.
- Procesamiento por lotes a gran escala (`DDIA2` c.11): es de un curso de datos, no de este.

## Pendientes de verificar antes de escribir

Datos que no se confirmaron en una fuente primaria. No se presentan como hechos.

1. **Share groups de Kafka** (Módulo 26B T4): no se abrió la página que dice si están disponibles para producción
   en 4.4.
2. **Spring Cloud y Spring Boot:** la referencia del tren 2025.1.4 dice «supports Spring Boot 4.0.9»; el curso fija Boot
   4.1.3 con ese tren (`08-herramientas-y-versiones.md`: compatible desde 2025.1.2). Confirmar la matriz en
   spring.io antes de tocar el catálogo de versiones.
3. **Spring Cloud Bus** (Módulo 7 T5): figura en 2025.1.4; `spring-objetivo.md` anota que no aparece en 2026.0.
4. **Cliente de Kafka para Node** (F116, Módulo 22B): no se comprobó el estado de mantenimiento de KafkaJS ni qué
   cliente soporta transacciones hoy.
5. **Linkerd:** la página de funciones muestra «Linkerd 2.20» y una rama edge; `08-herramientas-y-versiones.md` dice que
   el proyecto ya no publica artefactos estables. Decidir con qué se hace el laboratorio del Módulo 27B.
6. **CCDAK:** la página oficial no lista los dominios del examen; solo se usó su descripción general.
7. ***Microservices Patterns* 2.ª edición:** está en acceso anticipado y su índice no se pudo leer; las filas citan la 1.ª.
8. ***Team Topologies* 2.ª edición:** no se pudo abrir el índice; se usó la página de conceptos clave del sitio.
9. **Certificación de Spring (2V0-72.22):** según `spring-objetivo.md` se basa en Framework 5.3 y Boot 2.5; sirve como
   lista de temas, no como referencia de versiones. No cubre Spring Cloud.
10. **Estado «ya está» de las fichas:** se asignó por inventario y por recuento de términos, no leyendo cada ficha.
    La Fase 5 (formato único) debe confirmar ficha por ficha el ejemplo realista, el error real y el criterio de uso.
11. **Capítulos citados de los libros («c.»):** se numeraron a partir del orden del índice leído; `RI2` no muestra
    números de capítulo en su página, así que los suyos son aproximados y hay que comprobarlos con el libro.

## Fuentes consultadas

Consultadas el 2026-11-20. De cada una se tomó solo la lista de temas (títulos de capítulos, patrones, dominios de
examen o lecciones); no se copió texto.

### 1. Documentación oficial y guías de arquitectura

| Clave | Fuente | Qué se tomó |
|---|---|---|
| `MSIO` | [microservices.io · patrones](https://microservices.io/patterns/index.html) (Chris Richardson) | las 16 categorías y sus patrones |
| `AZP` | [Azure Architecture Center · Cloud design patterns](https://learn.microsoft.com/en-us/azure/architecture/patterns/) | los 44 patrones del catálogo |
| `AZM` | [Azure · estilo de arquitectura de microservicios](https://learn.microsoft.com/en-us/azure/architecture/guide/architecture-styles/microservices) | secciones y artículos de la guía de diseño |
| `AWSP` | [AWS Prescriptive Guidance · Cloud design patterns](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/introduction.html) | los 11 patrones |
| `GCPM` | [Google Cloud · arquitectura de microservicios](https://cloud.google.com/architecture/microservices-architecture-introduction) | apartados (la URL lleva a un artículo general: ver «no abiertas») |
| `SC` | [Spring Cloud · tren de versiones](https://docs.spring.io/spring-cloud-release/reference/index.html) | los 15 proyectos del tren 2025.1.4 |
| `SBR` | [Spring Boot · referencia](https://docs.spring.io/spring-boot/reference/index.html) | secciones de la referencia |
| `MIC` | [Micrometer · referencia](https://docs.micrometer.io/micrometer/reference/) | secciones (Observation, Tracing, Context Propagation) |
| `OTEL` | [OpenTelemetry · conceptos](https://opentelemetry.io/docs/concepts/) | señales, propagación, muestreo y secciones del Collector |
| `KAF` | [Apache Kafka · documentación](https://kafka.apache.org/documentation/) y [operación 4.4](https://kafka.apache.org/44/operations/) | secciones de la documentación y los 12 apartados de operación |
| `RMQ` | [RabbitMQ · documentación](https://www.rabbitmq.com/docs) y [cómo usar RabbitMQ](https://www.rabbitmq.com/docs/use-rabbitmq) | secciones y guías de uso |
| `NATS` | [NATS · conceptos](https://docs.nats.io/nats-concepts/overview) | conceptos básicos, JetStream, topologías y seguridad |
| `GRPC` | [gRPC · guías](https://grpc.io/docs/guides/) | las 24 guías |
| `K8S` | [Kubernetes · conceptos](https://kubernetes.io/docs/concepts/) | secciones y páginas de conceptos |
| `ISTIO` | [Istio · conceptos](https://istio.io/latest/docs/concepts/) | las cuatro áreas y la sección de ambient |
| `LNK` | [Linkerd · funciones](https://linkerd.io/2-edge/features/) | las 27 funciones |
| `TMP` | [Temporal · enciclopedia](https://docs.temporal.io/encyclopedia) y [workflows](https://docs.temporal.io/workflows) | conceptos y navegación de workflows |
| `DBZ` | [Debezium · referencia estable](https://debezium.io/documentation/reference/stable/index.html) | navegación completa (conectores, transformaciones, integraciones, operación) |
| `NEST` | [NestJS · microservicios](https://docs.nestjs.com/microservices/basics) | transportes y secciones de la documentación |
| `NODE` | [Node.js · Learn](https://nodejs.org/en/learn/getting-started/introduction-to-nodejs) | secciones y páginas de aprendizaje |
| `CHAOS` | [Principles of Chaos Engineering](https://principlesofchaos.org/) | pasos del experimento y principios avanzados |
| `CNCFP` | [CNCF · Platforms White Paper](https://tag-app-delivery.cncf.io/whitepapers/platforms/) | secciones y las 13 capacidades de una plataforma |
| `TTK` | [Team Topologies · conceptos clave](https://teamtopologies.com/key-concepts) | tipos de equipo, modos de interacción y conceptos |

### 2. Libros (índices)

| Clave | Libro | Índice leído en |
|---|---|---|
| `BM2` | Sam Newman, *Building Microservices*, 2.ª ed. (O'Reilly) | [oreilly.com](https://www.oreilly.com/library/view/building-microservices-2nd/9781492034018/) |
| `M2M` | Sam Newman, *Monolith to Microservices* (O'Reilly) | [oreilly.com](https://www.oreilly.com/library/view/monolith-to-microservices/9781492047834/) |
| `MP` | Chris Richardson, *Microservices Patterns*, 1.ª ed. (Manning) | [oreilly.com](https://www.oreilly.com/library/view/microservices-patterns/9781617294549/) |
| `DDIA2` | Kleppmann y Riccomini, *Designing Data-Intensive Applications*, 2.ª ed. (O'Reilly, 2026) | [oreilly.com](https://www.oreilly.com/library/view/designing-data-intensive-applications/9781098119058/) |
| `RI2` | Michael Nygard, *Release It!*, 2.ª ed. (Pragmatic Bookshelf) | [pragprog.com](https://pragprog.com/titles/mnee2/release-it-second-edition/) |
| `FSA2` | Richards y Ford, *Fundamentals of Software Architecture*, 2.ª ed. (O'Reilly, 2025) | [oreilly.com](https://www.oreilly.com/library/view/fundamentals-of-software/9781098175504/) |
| `HP` | Ford, Richards, Sadalage y Dehghani, *Software Architecture: The Hard Parts* (O'Reilly) | [oreilly.com](https://www.oreilly.com/library/view/software-architecture-the/9781492086888/) |
| `BEDM2` | Adam Bellemare, *Building Event-Driven Microservices*, 2.ª ed. (O'Reilly, 2025) | [oreilly.com](https://www.oreilly.com/library/view/building-event-driven-microservices/9798341622180/) |
| `PMAP` | Binildas Christudas, *Practical Microservices Architectural Patterns* (Apress) | [oreilly.com](https://www.oreilly.com/library/view/practical-microservices-architectural/9781484245019/) |
| `CNP` | Cornelia Davis, *Cloud Native Patterns* (Manning) | [oreilly.com](https://www.oreilly.com/library/view/cloud-native-patterns/9781617294297/) |
| `SRE` | *Site Reliability Engineering* (Google) | [sre.google](https://sre.google/sre-book/table-of-contents/) |
| `SREW` | *The Site Reliability Workbook* (Google) | [sre.google](https://sre.google/workbook/table-of-contents/) |

### 3. Certificaciones

| Clave | Certificación | Qué se tomó |
|---|---|---|
| `CKA` | [Certified Kubernetes Administrator](https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/) | 5 dominios con sus competencias (v1.37) |
| `CKAD` | [Certified Kubernetes Application Developer](https://training.linuxfoundation.org/certification/certified-kubernetes-application-developer-ckad/) | 5 dominios con sus competencias (v1.37) |
| `SAP` | [AWS Certified Solutions Architect – Professional (SAP-C02)](https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-professional-02/solutions-architect-professional-02.html) | 4 dominios y las tareas del [dominio 2](https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-professional-02/solutions-architect-professional-02-domain2.html) |
| `AZ305` | [Azure Solutions Architect (AZ-305), guía de estudio](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-305) | 4 áreas con sus habilidades |
| `PCA` | [Google Professional Cloud Architect, guía del examen](https://services.google.com/fh/files/misc/professional_cloud_architect_exam_guide_english.pdf) | 6 secciones con sus apartados |
| `SPRC` | [Spring Professional Develop (2V0-72.22)](https://docs.broadcom.com/doc/vmw-spring-professional-develop-exam-guide) | 6 secciones con sus objetivos |
| `CCDAK` | [Confluent · certificaciones](https://www.confluent.io/certification/) | solo la descripción de CCDAK, CCAAK y CCAC (sin dominios) |

### 4. Sílabos de universidades y formación reglada

| Clave | Sílabo | Qué se tomó |
|---|---|---|
| `MIT` | [MIT 6.5840 Distributed Systems, primavera de 2026](https://pdos.csail.mit.edu/6.824/schedule.html) | 22 clases y 5 laboratorios |
| `CAM` | [Cambridge · Concurrent and Distributed Systems 2025–26](https://www.cl.cam.ac.uk/teaching/2526/ConcDisSys/) (Martin Kleppmann) | las 8 clases de sistemas distribuidos |
| `UNAM` | [«Desarrollo de microservicios con Spring Cloud», 40 h](https://docencia.tic.unam.mx/wordpress/wp-content/uploads/2026/08/Desarrollo-de-microservicios-con-spring-cloud.pdf) (docencia.tic.unam.mx; el PDF no nombra la institución) | 9 unidades y sus temas |

### 5. Cursos largos en vídeo y plataformas

| Clave | Curso | Idioma | Qué se tomó |
|---|---|---|---|
| `CEZ` | [«Master Microservices with Spring Boot, Docker, Kubernetes» (Udemy)](https://www.udemy.com/course/master-microservices-with-spring-docker-kubernetes/) | inglés | secciones visibles y lista de aprendizajes |
| `CSG` | [«Microservices with Node JS and React» (Udemy, Stephen Grider, 54 h)](https://www.udemy.com/course/microservices-with-node-js-and-react) | inglés | lecciones visibles y lista de aprendizajes |
| `CYT` | [«Java and Spring Boot Microservices – Full Course» (YouTube, Amigoscode)](https://classcentral.com/classroom/youtube-java-and-spring-boot-microservices-10-hour-full-course-105223) | inglés | los 9 capítulos, leídos en Class Central |
| `CED` | [«Microservicios con Java y Spring Boot» (EDteam, 5 h)](https://ed.team/cursos/microservicios-java) | español | 6 módulos y sus clases |
| `CPL` | [«Curso de Introducción a los Microservicios» (Platzi)](https://platzi.com/cursos/microservicios/) | español | 6 secciones y 24 clases (stack .NET; solo la estructura) |

### 6. Rutas públicas y entrevistas de nivel sénior

| Clave | Fuente | Qué se tomó |
|---|---|---|
| `RBE` | [roadmap.sh · Backend](https://roadmap.sh/backend) (leído en `backend.json`) | nodos de la ruta |
| `RSD` | [roadmap.sh · System Design](https://roadmap.sh/system-design) (leído en `system-design.json`) | nodos de la ruta |
| `RSA` | [roadmap.sh · Software Architect](https://roadmap.sh/software-architect) (leído en `software-architect.json`) | nodos de la ruta |
| `EPH` | [PracHub · preguntas de sistemas distribuidos para sénior](https://prachub.com/resources/distributed-systems-interview-questions-for-senior-engineers-consistency-replication-and-failure) | bloques de preguntas |
| `EST` | [Guía de entrevista de diseño para Staff (L6)](https://spawn08.github.io/system-design-interview/software_system_design/staff_engineer_expectations) | pilares y lista de profundización |
| `ETS` | [ThirstySprout · preguntas de microservicios para sénior](https://www.thirstysprout.com/post/microservices-interview-questions) | las 7 áreas |

### 7. Fuentes internas

| Clave | Fuente |
|---|---|
| `PROMPT` | `docs/temarios/PROMPT-MICROSERVICIOS-CERO-A-MAESTRO.md` (prompt del dueño) |
| `REG` | `specs/021-reestructuracion-total-de-la-academia.md` (reglas 6, 7 y 10; formato de módulo de 3 a 7 temas) |

También se leyeron `docs/temarios/spring-objetivo.md`, `gradle-objetivo.md`, `docker.md`, `kubernetes.md`,
`diseno-de-sistemas.md`, `microservicios.md` y `docs/reestructuracion/listado-de-temas.csv` para el apartado 4.

### 8. Fuentes que no se pudieron abrir o que no dieron lo buscado

| Fuente | Qué pasó |
|---|---|
| [manning.com · Microservices Patterns](https://www.manning.com/books/microservices-patterns) y [2.ª edición](https://www.manning.com/books/microservices-patterns-second-edition) | las páginas no muestran el índice. La 2.ª edición figura en acceso anticipado con 12 de 25 capítulos. Se usó el índice de la 1.ª en O'Reilly |
| [teamtopologies.com/book](https://teamtopologies.com/book) e [itrevolution.com](https://itrevolution.com/product/team-topologies-second-edition/) | sin índice; solo confirman la 2.ª edición (23 de septiembre de 2025). Una URL de O'Reilly probada para este libro devolvió otro libro y se descartó |
| roadmap.sh (`/backend`, `/system-design`, `/software-architect`) | las páginas HTML no traen los nodos; se leyeron los `.json` de cada ruta. El de system-design llegó truncado (se leyeron 100.000 de 111.385 caracteres); del de backend se leyó también el final |
| Repositorio de roadmap.sh en GitHub (API y `raw.githubusercontent.com`) | acceso no disponible en esta sesión |
| [AWS Well-Architected · pilar de fiabilidad](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html) | la página no trae el índice; no se usó como fuente |
| [cloud.google.com/architecture/microservices-architecture-introduction](https://cloud.google.com/architecture/microservices-architecture-introduction) | lleva a un artículo general, no a la serie de arquitectura; solo se tomaron sus apartados |
| [Guía de Google Professional Cloud Architect (página)](https://cloud.google.com/learn/certification/guides/professional-cloud-architect) | sin detalle; se leyó el PDF del examen |
| [confluent.io/certification](https://www.confluent.io/certification/) y [aguidetocloud.com (CCDAK)](https://www.aguidetocloud.com/cert-tracker/confluent-ccdak/) | ninguna de las dos mostró los dominios del examen |
| [kafka.apache.org/documentation](https://kafka.apache.org/documentation/) | es una página de redirección: solo dio la navegación. Diseño, implementación, seguridad, Connect y Streams no se abrieron apartado por apartado |
| [rabbitmq.com/docs](https://www.rabbitmq.com/docs) | solo secciones de primer nivel y las guías de «How to Use»; no se abrieron las guías de colas quorum, streams, federación ni shovel |
| [istio.io · conceptos](https://istio.io/latest/docs/concepts/) y [docs.temporal.io](https://docs.temporal.io/encyclopedia) | navegación de primer nivel; faltan los subapartados (en Temporal: reintentos, señales, `continue-as-new`, versionado de workers) |
| [docs.nats.io](https://docs.nats.io/nats-concepts/overview) | solo los conceptos de primer nivel; clústeres, leaf nodes y cuentas no se abrieron |
| [kubernetes.io · conceptos](https://kubernetes.io/docs/concepts/) | se leyeron 100.000 de 110.588 caracteres |
| [github.com/cncf/curriculum](https://raw.githubusercontent.com/cncf/curriculum/master/README.md) | el README no indica la versión de cada currículo; se usaron las páginas de la Linux Foundation |
| [Udemy · Microservices: Clean Architecture, DDD, SAGA, Outbox & Kafka](https://www.udemy.com/course/microservices-clean-architecture-ddd-saga-outbox-kafka-kubernetes/) | error del sitio |
| [comidoc · «Construye Microservicios con Spring Boot 3 y Spring Cloud»](https://comidoc.com/udemy/construye-microservicios-con-spring-boot-3-y-spring-cloud) | sin temario; solo duración (15 h 53 min) y etiquetas. No se usó |
| [Class Central · «Spring Boot Microservices» (YouTube)](https://www.classcentral.com/classroom/youtube-spring-boot-microservices-53287) | resultó ser un curso en portugués de 11 vídeos; se descartó |
| Cursos largos de YouTube **en español** | dos búsquedas no devolvieron una lista de reproducción con temario legible. En español solo se usaron EDteam, Platzi y el curso de docencia.tic.unam.mx: queda como hueco de la fuente 5 |
