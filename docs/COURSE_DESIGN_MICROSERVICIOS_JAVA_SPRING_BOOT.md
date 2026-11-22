# Diseño de curso: Microservicios con Java y Spring Boot

**Título:** *Microservicios con Java y Spring Boot: de Desarrollador a Arquitecto*  
**Duración:** 22 semanas (132 horas guiadas + 88 horas de laboratorio autónomo)  
**Formato:** 2 sesiones semanales de 90 minutos + laboratorio guiado + retrospectiva.  
**Proyecto integrador:** **Tienda Aurora**, una tienda de productos que evoluciona desde monolito modular hasta sistema distribuido operado en producción.  
**Repositorio de referencia:** `tienda-aurora/` con un directorio por módulo (`m01-java`, `m02-spring`, ..., `m10-capstone`), cada uno con `README.md`, `docker-compose.yml`, `pom.xml`, código de referencia y script de verificación `./verify.sh`.

## Principio rector

Ningún concepto nuevo aparece sin que el estudiante haya sentido el dolor que lo justifica. El curso no enseña herramientas; enseña a resolver dolores con herramientas.

## Contexto del estudiante

- Ya sabe programar (variables, control de flujo, funciones, clases).
- No sabe Java, Spring, microservicios ni arquitectura distribuida.
- Construye cada tema desde cero, guiado paso a paso.
- Sabe usar terminal, Git y un editor de código.

## Patrón de 5 pasos por tema

| Paso | Peso | Propósito | Evidencia |
|---|---:|---|---|
| 1. El dolor | 10% | Ver el problema en Tienda Aurora. | Síntoma observable, comando/log/métrica. |
| 2. La intuición | 20% | Entender por qué existe la solución. | Una analogía + diagrama, sin código. |
| 3. La construcción | 40% | Construir la solución desde cero. | Código ejecutable, archivo por bloque, propósito. |
| 4. El experimento | 20% | Romper, medir y observar. | Parámetro cambiado, output esperado (máx. 3 líneas). |
| 5. El cierre | 10% | Consolidar decisión y transferencia. | Analogía retomada, trade-offs, error común, entrevista, 3 transferencias. |

## 1. Tabla de contenidos completa

### Mapa del curso

| Fase | Semanas | Módulo | Objetivo del estudiante | Resultado en Tienda Aurora |
|---|---:|---|---|---|
| 1 | 1-3 | Fundamentos Java y Java 25 LTS | Escribir Java moderno, claro y testeable | Monolito modular: catálogo y pedidos en memoria |
| 2 | 4-6 | Spring Boot 4.x y calidad | Construir APIs y persistencia con calidad de producción | Monolito modular con REST, BD y tests |
| 3 | 7-10 | Arquitectura de microservicios y Floci | Separar dominios y comunicar servicios | Catálogo, pedidos y gateway como servicios |
| 4 | 11-14 | Resiliencia y consistencia de datos | Diseñar ante fallos, duplicados y lentitud | Pago resiliente, eventos, caché y consistencia eventual |
| 5 | 15-18 | Rendimiento, observabilidad y seguridad | Operar con eficiencia, visibilidad y Zero-Trust | Sistema observable, seguro y optimizado |
| 6 | 19-22 | Arquitectura y decisiones | Justificar decisiones y defender arquitectura | Rediseño bajo restricción + Comité de Arquitectura |

**Convención de evaluación:** cada tema incluye laboratorio verificable, error común, trade-offs y pregunta de entrevista. Los ejercicios marcados con **[NO-USAR-X]** tienen como respuesta correcta *no usar* la herramienta.

### Fase 1 · Fundamentos de Java y Java 25 LTS (Semanas 1-3)

| Sem. | Tema | Dolor detonante | Construcción clave | Entregable verificable |
|---:|---|---|---|---|
| 1 | ¿Por qué Java sigue importando en sistemas críticos? | El script rápido se vuelve frágil al crecer | JDK 25, Maven, estructura de proyecto, tipos, control de flujo | `./mvnw test` pasa en proyecto base |
| 1 | ¿Cómo modelar un producto sin crear una clase frágil? | Datos sueltos generan bugs de estado | Clases, encapsulación, records, value objects | `Producto` y `Dinero` con invariantes |
| 1 | ¿Por qué la herencia mal usada te persigue? | Cambiar una regla rompe subclases | Composición sobre herencia, interfaces, SOLID | Refactor de descuento con composición |
| 2 | ¿Cómo manejar colecciones sin perder claridad? | Listas y mapas se vuelven ilegibles | Collections, generics, Streams, Optional | Búsqueda y filtrado de catálogo |
| 2 | ¿Qué haces cuando algo falla? | Excepciones ocultas corrompen el flujo | Excepciones checked/unchecked, errores de dominio | Errores de dominio con pruebas |
| 2 | ¿Cómo probar que tu código hace lo que promete? | “Funciona en mi máquina” no alcanza | JUnit 6, AssertJ, AAA, tests de invariantes | Suite de tests verde |
| 3 | ¿Cómo manejar tiempo y archivos sin sorpresas? | Fechas y rutas rompen en producción | `java.time`, `java.nio.file`, formato ISO-8601 | Importación CSV de productos |
| 3 | ¿Cómo llamar otro servicio sin una librería pesada? | Integraciones externas con mucho boilerplate | `HttpClient`, JSON, timeouts | Cliente HTTP con timeout y test |
| 3 | ¿Qué trae Java 25 LTS para sistemas modernos? | Concurrencia y arranque cuestan caro | Virtual Threads, Scoped Values, Pattern Matching, Sealed Classes, Flexible Constructor Bodies, AOT cache | Benchmark simple y ADR de adopción |

**Ejercicio [NO-USAR-X] #1 (Semana 1):** “El catálogo tiene 3 tipos de descuento. ¿Usas herencia profunda para cada variante?” Respuesta correcta: **No usar herencia profunda**; usar composición/estrategia.

### Fase 2 · Spring Boot 4.x y calidad (Semanas 4-6)

| Sem. | Tema | Dolor detonante | Construcción clave | Entregable verificable |
|---:|---|---|---|---|
| 4 | ¿Quién crea los objetos en tu aplicación? | `new` por todos lados impide probar | IoC, DI, ApplicationContext, ciclo de vida | Beans conectados por constructor |
| 4 | ¿Cómo exponer un catálogo por HTTP? | La lógica existe, pero nadie puede usarla | Spring MVC, `@RestController`, DTOs, validación | `GET/POST /productos` con validación |
| 4 | ¿Cómo responder errores sin devolver caos? | Cada endpoint falla distinto | `@ControllerAdvice`, Problem Details, errores consistentes | Contrato de error probado |
| 5 | ¿Cómo guardar productos sin escribir SQL a mano en todos lados? | Persistencia manual no escala | JPA/Hibernate, Spring Data, transacciones | CRUD persistido en PostgreSQL |
| 5 | ¿Por qué tu endpoint hace 101 consultas? | La lista de productos se vuelve lenta | Problema N+1, fetch strategies, EntityGraph, Spring Data JDBC | Consulta optimizada con evidencia |
| 5 | ¿Cómo configurar sin hardcodear secretos? | Configuración distinta por entorno rompe deploys | `application.yml`, profiles, config externa | Perfiles `dev/test` funcionando |
| 6 | ¿Cómo probar una API sin levantar todo el mundo? | Tests lentos frenan el equipo | `@WebMvcTest`, `@SpringBootTest`, MockMvc, Testcontainers | Pirámide de tests mínima |
| 6 | ¿Cómo consumir otra API sin acoplar tu código? | Clientes HTTP manuales se duplican | HTTP Service Clients, timeouts, mapeo de errores | Cliente declarativo probado |
| 6 | ¿Cómo saber si tu app está viva? | La app “corre” pero nadie sabe su estado | Actuator, health, metrics, Micrometer | `/actuator/health` y métrica custom |

**Ejercicio [NO-USAR-X] #2 (Semana 5):** “Tienes 2 tablas con una consulta simple de reporte. ¿Usas JPA con entidades complejas y lazy loading por defecto?” Respuesta correcta: **No usar JPA por inercia**; evaluar Spring Data JDBC o consulta SQL explícita según complejidad.

### Fase 3 · Arquitectura de microservicios y Floci (Semanas 7-10)

| Sem. | Tema | Dolor detonante | Construcción clave | Entregable verificable |
|---:|---|---|---|---|
| 7 | ¿Cuándo un monolito te empieza a doler? | Cambios pequeños requieren desplegar todo | Monolito modular, límites, modularidad | Módulos `catalogo` y `pedidos` aislados |
| 7 | ¿Dónde cortar el sistema? | Cortes malos crean acoplamiento distribuido | DDD ligero, Bounded Context, lenguaje ubicuo | Mapa de contexto de Tienda Aurora |
| 7 | ¿Quién es dueño de los datos? | Dos servicios escriben la misma tabla | Database-per-service, consistencia, duplicación pragmática | Dos esquemas/BDs separados |
| 8 | ¿Cómo separar catálogo y pedidos sin romper todo? | Extraer servicio genera fallos de integración | Extracción incremental, contratos, Spring Modulith | `catalog-service` y `order-service` |
| 8 | ¿Cómo se encuentran los servicios? | URLs hardcodeadas rompen al escalar | Service Discovery, Nacos, registro/salud | Servicios registrados en Nacos |
| 8 | ¿Cómo entra el tráfico sin exponer todo? | Clientes conocen demasiados endpoints | Spring Cloud Gateway, rutas, filtros | Gateway con rutas y filtro de request ID |
| 9 | ¿Cómo se comunican servicios en tiempo real? | Necesitas datos de otro servicio ya | HTTP Service Clients, gRPC, RSocket | Dos estilos comparados con trade-off |
| 9 | ¿Cómo probar servicios cloud sin pagar cloud? | S3/SQS locales cuestan o son complejos | Floci, endpoint `localhost:4566`, credenciales test | Floci emulando S3 local |
| 10 | ¿Cómo hacer tests de integración reproducibles? | “En CI falla” por entorno | Testcontainers + `io.floci:testcontainers-floci` | Test de integración verde en local/CI |

**Ejercicio [NO-USAR-X] #3 (Semana 7):** “El monolito modular funciona bien, con un equipo de 4 personas y bajo cambio. ¿Migras ya a microservicios?” Respuesta correcta: **No usar microservicios prematuramente**; mantener monolito modular hasta que el dolor de escala/organización lo justifique.

### Fase 4 · Resiliencia y consistencia de datos (Semanas 11-14)

| Sem. | Tema | Dolor detonante | Construcción clave | Entregable verificable |
|---:|---|---|---|---|
| 11 | ¿Qué pasa cuando el servicio de pago se pone lento? | Un servicio lento tumba la cadena | Timeouts, Resilience4j TimeLimiter, Bulkhead | Timeout y aislamiento verificados |
| 11 | ¿Cómo evitar golpear un servicio caído? | Reintentos agravan la caída | Circuit Breaker, Retry con backoff, fallback | Circuito abierto observable |
| 11 | ¿Cómo proteger tu servicio de demasiadas solicitudes? | Picos saturan recursos | RateLimiter, backpressure, colas | Límite de tasa probado |
| 12 | ¿Por qué tu base de datos se cae por leer lo mismo? | Miles de lecturas repetidas saturan BD | Caching con Redis: Cache-Aside, TTL, invalidación | Latencia baja y hit rate medible |
| 12 | ¿Qué pasa si dos procesos escriben la caché a la vez? | Datos stale o inconsistentes | Write-Behind, Read-Through, Redlock, trade-offs | Experimento de concurrencia |
| 12 | ¿Cómo manejar eventos sin perderlos? | El servicio cae después de guardar | Outbox Pattern, CDC, Debezium | Evento publicado tras commit |
| 13 | ¿Cómo procesar pedidos asincrónicamente? | HTTP síncrono no aguanta picos | Kafka, topics, particiones, consumer groups | Productor/consumidor funcionando |
| 13 | ¿Qué pasa si el consumidor recibe el mismo evento dos veces? | Duplicados generan doble cobro | Idempotencia, claves de deduplicación, exactly-once práctico | Consumidor idempotente probado |
| 14 | ¿Cómo coordinar un pedido entre varios servicios? | No hay transacción global | Saga orquestada vs coreografiada, compensaciones | Saga de pedido con compensación |
| 14 | ¿Cómo probar mensajería local sin infraestructura pesada? | Kafka/SQS local consume tiempo | Floci para SQS/SNS, Testcontainers, contratos async | Prueba async reproducible |

### Fase 5 · Rendimiento extremo, observabilidad y seguridad (Semanas 15-18)

| Sem. | Tema | Dolor detonante | Construcción clave | Entregable verificable |
|---:|---|---|---|---|
| 15 | ¿Por qué tu servicio tarda en arrancar y consume tanta RAM? | Escalado lento y caro | GraalVM Native Image, AOT, trade-offs | Comparativa JVM vs native |
| 15 | ¿Cómo atender miles de solicitudes bloqueantes? | Pool de hilos se agota | Virtual Threads en Spring Boot 4, límites | Carga con hilos virtuales |
| 15 | ¿Cómo volver casi instantáneo un servicio Java? | Cold start afecta autoscaling | CRaC, snapshots, restricciones | Demo CRaC o nota de laboratorio |
| 16 | ¿Cómo ajustar la JVM para contenedores? | OOMKilled y GC pausas | G1GC, `MaxRAMPercentage`, métricas JVM | Contenedor con límites ajustados |
| 16 | ¿Cómo saber qué falló en una cadena de servicios? | Logs aislados no cuentan la historia | OpenTelemetry, trazas, Zipkin/Tempo | Traza distribuida end-to-end |
| 16 | ¿Cómo leer logs cuando hay miles por minuto? | Texto plano es ruido | Logs estructurados, traceId, Scoped Values | Log JSON correlacionado |
| 17 | ¿Quién eres y qué puedes hacer? | Endpoints sensibles expuestos | OAuth2/OIDC, Keycloak, JWT | Login y token validado |
| 17 | ¿Cómo confiar entre servicios sin confiar en la red? | Red interna no es segura | mTLS, Zero-Trust, propagación de identidad | Llamada service-to-service segura |
| 18 | ¿Cómo evitar permisos excesivos y dependencias vulnerables? | Brechas por exceso de confianza | RBAC/ABAC, OWASP Dependency-Check, CI | Pipeline con gate de seguridad |

### Fase 6 · Arquitectura y decisiones (Semanas 19-22)

| Sem. | Tema | Dolor detonante | Construcción clave | Entregable verificable |
|---:|---|---|---|---|
| 19 | ¿Cuándo NO deberías usar microservicios? | Complejidad innecesaria mata al equipo | Monolito modular, criterios, costo cognitivo | Decisión justificada por escrito |
| 19 | ¿Cómo migrar sin reescribir todo? | Big bang falla | Strangler Fig, seams, rutas de migración | Plan de migración incremental |
| 19 | ¿Cómo documentar una decisión para tu yo del futuro? | Decisiones se pierden | ADRs, Modelo C4, ATAM ligero | ADR y diagrama C4 |
| 20 | ¿Cuánto cuesta tu arquitectura? | Cloud bill sorprende | FinOps, right-sizing, costo por servicio | Estimación de costo con trade-offs |
| 20 | ¿Tu equipo puede operar lo que diseñaste? | Arquitectura supera capacidad del equipo | Team Topologies, Ley de Conway, carga cognitiva | Mapa de equipos y ownership |
| 20 | ¿Cómo detectar anti-patrones antes de producción? | Monolito distribuido, chatty services | Anti-patrones, smells, revisión | Checklist de revisión arquitectónica |
| 21 | ¿Dónde encaja la IA sin romper tu arquitectura? | LLMs añadidos sin control | Spring AI/LangChain4j, RAG, pgvector, límites | Endpoint RAG con evaluación básica |
| 21 | ¿Cómo resistir un cambio de último minuto? | Requisito nuevo rompe el diseño | Restricción sobrevenida, renegociación de trade-offs | Rediseño con ADR de cambio |
| 22 | ¿Puedes defender tu arquitectura ante un comité? | Decisiones técnicas deben justificarse | Comité de Arquitectura, defensa, métricas | Presentación final y demo |

## Criterio de completitud del curso

| Artefacto | Criterio de aceptación |
|---|---|
| Repositorio | Un repo Git con laboratorios por módulo y `verify.sh` por tema. |
| Proyecto final | Cada microservicio construido desde cero por el estudiante. |
| Floci | Integrado en pruebas cloud locales (S3/SQS/SNS) y CI local. |
| Decisiones | Cada decisión técnica con al menos 2 alternativas y trade-off explícito. |
| Ejercicios NO-USAR-X | Al menos 3 en el curso; marcados y justificados. |
| Defensa final | ADR, diagrama C4, métricas, costo y respuesta a restricción sobrevenida. |

## Mapeo con el track actual de Academia Floci

El track `spring-microservices` actual cubre el dominio técnico del diseño, con una estructura de 16 módulos (M0-M15) orientada al catálogo de la plataforma. El diseño de 22 semanas funciona como ruta instruccional: puede implementarse como secuencia de estudio, y los módulos existentes se mapean así:

| Diseño 22 semanas | Track actual | Nota |
|---|---|---|
| Fase 1 Java 25 | `java` track + `spring-microservices` M0 | Base Java ya cubierta; reforzar narrativa de dolor. |
| Fase 2 Spring Boot | `spring-boot` M0-M9 | REST, datos, testing, Actuator. |
| Fase 3 Arquitectura/Floci | `spring-microservices` M2,M4,M5,M6 | Floci, DDD, comunicación, gateway/discovery. |
| Fase 4 Resiliencia/consistencia | `spring-microservices` M3,M7,M10,M11 | Redis, Resilience4j, EDA, outbox/sagas. |
| Fase 5 Rendimiento/observabilidad/seguridad | `spring-microservices` M8,M9,M12 | OTel, Zero-Trust, Native/CRaC/JVM. |
| Fase 6 Arquitectura/decisiones | `spring-microservices` M13,M14,M15 | ADRs/C4/FinOps, anti-patrones, capstone. |

## 2. Tema de ejemplo completo (5 pasos): Caching con Redis

El ejemplo completo y ejecutable está implementado en `web/public/content/spring-microservices/modulo-3.md`, Tema 1, siguiendo el patrón de 5 pasos y manteniendo la verificación honesta del entorno. La versión didáctica de referencia para redactores se incluye a continuación.

### Paso 1 · El dolor: ¿por qué tu base de datos se cae por leer lo mismo?

Abres Tienda Aurora un lunes de promoción. El endpoint `GET /productos/{id}` funciona con diez usuarios. Con mil usuarios, la base de datos recibe la misma consulta una y otra vez. El tiempo de respuesta sube, la CPU de PostgreSQL se satura y el catálogo empieza a fallar.

**Archivo:** `scripts/load-catalog.sh` → genera 200 solicitudes al mismo producto.

```bash
#!/usr/bin/env bash
set -euo pipefail
for i in $(seq 1 200); do
  curl -s -o /dev/null -w "%{http_code} %{time_total}\n" \
    http://localhost:8081/api/productos/1
done
```

**Comando:**

```bash
chmod +x scripts/load-catalog.sh
./scripts/load-catalog.sh | tail -n 3
```

**Salida esperada (aprox.):**

```text
200 0.118
200 0.121
200 0.124
```

**Qué observar:** el código responde 200, pero cada solicitud consulta la base de datos. El costo se repite aunque el producto no cambie.

### Paso 2 · La intuición: la ficha rápida del mostrador

Imagina el mostrador de Tienda Aurora. El almacén está al fondo: tiene todos los productos, pero ir hasta allá toma tiempo. En el mostrador tienes una ficha rápida con los productos más consultados. Si la ficha existe y está vigente, respondes de inmediato. Si no existe, vas al almacén, traes el producto y actualizas la ficha.

```text
Cliente
  → Catalog Service
    → ¿Existe ficha en Redis?
      → Sí: devuelve producto (cache hit)
      → No: consulta PostgreSQL
          → guarda ficha en Redis con TTL
          → devuelve producto (cache miss)
```

La analogía tiene un límite: una ficha rápida puede quedar desactualizada si alguien cambia el precio en el almacén. La caché es una decisión de velocidad contra frescura.

### Paso 3 · La construcción: Cache-Aside con Redis

El estudiante crea el proyecto, levanta Redis, configura TTL, implementa `@Cacheable/@CachePut/@CacheEvict`, expone endpoints y observa el primer `DB hit`.

**Archivo:** `src/main/java/com/aurora/catalogo/service/CatalogoService.java` → aplica caché, invalidación y actualización.

```java
@Cacheable(cacheNames = "productos", key = "#id")
@Transactional(readOnly = true)
public Producto buscarPorId(Long id) {
  log.info("DB hit para producto {}", id);
  return repo.findById(id)
      .orElseThrow(() -> new ProductoNoEncontradoException(id));
}
```

**Lectura del bloque:** `@Cacheable` busca la clave en Redis antes de ejecutar el método. Si existe, devuelve la ficha rápida y no entra al método. El log aparece solo cuando hubo cache miss.

### Paso 4 · El experimento: rompe la frescura a propósito

| Experimento | Cambio | Salida esperada | Qué observar |
|---|---|---|---|
| TTL corto | `producto-ttl: PT2S` | dos `DB hit` tras esperar 3s | Ganas frescura, pagas más lecturas a DB |
| Precio stale | update SQL directo | JSON con precio viejo | La caché puede quedar desactualizada |
| Invalidación | `@CachePut` al cambiar precio | JSON con precio nuevo | La escritura refresca la ficha |

### Paso 5 · El cierre: la ficha rápida no reemplaza al almacén

La caché resolvió el dolor de lectura repetida, pero introdujo un costo: la coherencia.

| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Cache-Aside | Lecturas frecuentes, control simple en la app, tolerancia a stale breve | Cuando necesitas consistencia fuerte inmediata |
| Read-Through | Quieres centralizar carga en el proveedor/cache layer | Cuando agrega complejidad innecesaria |
| Write-Behind | Escrituras intensas con tolerancia a pérdida controlada | Cuando perder una escritura es inaceptable |
| Sin caché | Datos cambian en cada lectura o bajo tráfico | Cuando la BD se satura por lecturas repetidas |

**Error común.**

| Síntoma | Causa | Arreglo |
|---|---|---|
| Devuelve datos viejos tras actualizar | TTL largo o falta de invalidación | Usa `@CachePut`/`@CacheEvict`, TTL según frescura y prueba actualizaciones |

**Pregunta de entrevista.** ¿Cuándo usarías Redis para cachear un endpoint y cuándo no lo usarías?  
**Respuesta modelo.** Lo usaría cuando el dato se lee con frecuencia, su consulta es costosa y el negocio tolera frescura eventual; aplicaría Cache-Aside con TTL e invalidación en escrituras. No lo usaría cuando el dato cambia en cada request, la consistencia fuerte es crítica o el tráfico es bajo y la complejidad operativa supera el beneficio.

**Transferencia.**

1. **[NO-USAR-X]** Saldo de gift card exacto en cada lectura: no usar caché con TTL ciego; priorizar consistencia fuerte o invalidación transaccional.
2. 1 millón de productos, 200 calientes: definir patrón, TTL inicial y métricas (`hit ratio`, latencia p95, carga DB).
3. Proceso externo actualiza precios en PostgreSQL: proponer invalidación por evento/CDC o TTL corto + reconciliación, con trade-offs.

## 3. Guía de 1 página para redactores

Ver `docs/EDITORIAL_GUIDE_5_STEPS.md`.
