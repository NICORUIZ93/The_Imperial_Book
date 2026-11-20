# Temario objetivo · Spring (Spring Boot 4, Spring Framework 7)

> **Aprobado por el dueño el 2026-11-20** (versión extendida). Decisiones: Spring Boot 4.1.x; JPA llega desde Java; Spring Cloud vive en Microservicios; Spring AI se queda (versión extendida).

**Estado:** propuesta para aprobación del dueño (specs/021, Fase 3, criterio Z2). No hay lecciones escritas ni
cambiadas: este documento solo fija qué temas tendrá el curso, en qué orden y de dónde sale cada uno.
**Fecha de revisión de fuentes:** 2026-11-20.
**Identificador de ruta:** `spring-boot` (el actual; el nombre visible pasa a «Spring»).
**Prerrequisitos de la academia:** Java (lenguaje, colecciones, concurrencia, JDBC, pruebas con JUnit) y Gradle
(Kotlin DSL, wrapper, catálogo de versiones). Fundamentos: HTTP, SQL y Git.

## 1. Resumen

### 1.1 El curso hoy

Medido sobre las filas `spring-boot` de `docs/reestructuracion/listado-de-temas.csv`:

| Medida | Valor |
|---|---:|
| Módulos | 21 (M0–M20) |
| Temas | 123 |
| Temas por nivel declarado | Básico 3 · Intermedio 44 · Avanzado 69 · Experto 6 · sin nivel 1 |
| Temas con menos de 700 palabras | 17 |
| Temas sin diagrama ni imagen | 76 |
| Módulos fuera del rango de 3 a 7 temas | 7 (M2, M7 y M8 con 8; M15 y M20 con 9; M16 con 12; M12 con 2) |

Problemas de fondo que este temario corrige:

1. **El contenedor se cuenta, no se abre.** No hay ningún tema sobre `refresh()`, `BeanDefinition`,
   `BeanFactoryPostProcessor`, el informe de condiciones, cómo se lee una autoconfiguración ni cómo se escribe un
   starter. Proxies, AOP y `BeanPostProcessor` caben hoy en un solo tema (M0 T5).
2. **Web MVC empieza por los DTO.** Faltan el ciclo de la petición, el `DispatcherServlet`, los filtros e
   interceptores, los conversores, los clientes HTTP (`RestClient`) y el servidor embebido.
3. **JPA está repartido en dos cursos.** Spring tiene 5 temas en M4 y Java tiene 8 en su M16. Entre los dos no
   cubren identificadores, proyecciones, bloqueo, batching, caché de segundo nivel con medición ni `open-in-view`.
4. **Security no tiene seguridad de métodos**, ni arquitectura de autenticación, ni contraseñas, ni OAuth2
   client, ni Authorization Server. Además M5 y M18 enseñan dos veces la cadena de filtros.
5. **Pruebas:** 5 temas. Faltan el TestContext framework, la caché de contextos, las pruebas de seguridad y un
   slice propio.
6. **No hay AOT, CDS/AOT cache, CRaC ni hilos virtuales** vistos desde Spring. Native image es un solo tema.
7. **14 temas son de otro curso** (Spring Cloud, sagas, DDD, C4, ADR, Temporal) y otros 10 repiten un tema
   del propio curso: ver el apartado 3.

### 1.2 El curso objetivo

| Tramo | Módulos | Temas | % | Ya está | Está pero básico | Falta |
|---|---:|---:|---:|---:|---:|---:|
| Fundamentos | 6 (M0–M5) | 39 | 13,9 % | 11 | 16 | 12 |
| Aplicación | 12 (M6–M17) | 73 | 26,0 % | 14 | 25 | 34 |
| Integración | 17 (M18–M34) | 100 | 35,6 % | 24 | 31 | 45 |
| Experto | 12 (M35–M46) | 69 | 24,6 % | 8 | 11 | 50 |
| **Total** | **47** | **281** | 100 % | **57** | **83** | **141** |

- **Integración + Experto: 169 de 281 temas (60,1 %)**. Cumple la regla 4 de specs/021 (al menos la mitad).
- Todos los módulos tienen de 3 a 7 temas.
- De los 123 temas actuales, 109 se quedan en Spring (10 de ellos fundidos con otro tema del curso) y 14 pasan
  a otro curso (apartado 3.3). Junto con los 8 temas de JPA que llegan de Java, alimentan los 140 temas «ya
  está» y «está pero básico»: varios se dividen. Ninguno se pierde.
- Duración estimada: 281 temas × 35 min de media ≈ **164 h** de temas, más 47 laboratorios y el proyecto
  final. Es una estimación: cada tema fija sus minutos al escribirse (regla 6).

Los números de las dos tablas salen de contar las filas de los apartados 2 y 3 con un script; no se escribieron a
mano.

### 1.3 Versiones de referencia y lo que está cambiando esta semana

`docs/VERSIONES.md` fija **Spring Boot 4.1.x / Spring Framework 7**. El 2026-11-20 la generación 4.2 está
saliendo y las fuentes oficiales no coinciden entre sí. Se deja constancia tal cual:

| Proyecto | Estable comprobada | Siguiente (estado visto el 2026-11-20) | Fuente |
|---|---|---|---|
| Spring Boot | 4.1.2 (22 oct 2026, marcada «Latest» en GitHub); también 4.0.9 y 3.5.16 | 4.2.0: la referencia de docs.spring.io ya la publica como «stable» y última; la página de releases de GitHub leída mostraba 4.2.0-RC1 y «This Week in Spring» del 17 nov anuncia 4.2.0-RC2; la wiki dice «Full release notes will be available when 4.2 has been released» | [releases](https://github.com/spring-projects/spring-boot/releases) · [requisitos 4.2](https://docs.spring.io/spring-boot/system-requirements.html) · [notas 4.2](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.2-Release-Notes) |
| Spring Framework | 7.0.10 (GitHub); la referencia lista 7.0.11 | 7.1.0: la referencia la publica como estable; GitHub mostraba 7.1.0-RC1; la wiki la anuncia «scheduled for November 2026» | [releases](https://github.com/spring-projects/spring-framework/releases) · [notas 7.1](https://github.com/spring-projects/spring-framework/wiki/Spring-Framework-7.1-Release-Notes) |
| Spring Security | 7.1.2 | 7.2.0 (la página «What's New» ya es la de 7.2.0; RC1 en octubre) | [referencia](https://docs.spring.io/spring-security/reference/index.html) |
| Spring Data | 2026.0.2 (JPA 4.1.2 · Relational 4.1.2 · MongoDB 5.1.1 · Redis 4.1.1) | 2026.1.0-RC1 | [proyecto](https://spring.io/projects/spring-data) |
| Spring Cloud | 2025.1.4 «Oakwood» (Boot 4.0.x y 4.1.x) | 2026.0.0-RC2 «Paddington» (sobre Boot 4.2.0-RC2) | [proyecto](https://spring.io/projects/spring-cloud) · [2026.0](https://docs.spring.io/spring-cloud-release/reference/2026.0/index.html) |
| Spring Batch | 6.0.6 (referencia) | 6.1 GA anunciada el 19 nov 2026 | [blog](https://spring.io/blog) |
| Spring Integration | 7.1.1 (referencia) | 7.2.0 anunciada el 19 nov 2026 | [blog](https://spring.io/blog) |
| Spring AMQP | 4.1.1 (referencia) | 4.2.0 anunciada el 19 nov 2026 | [blog](https://spring.io/blog) |
| Spring for Apache Kafka | 4.1.2 | 4.2.0 (exige `kafka-clients` 4.4.0) | [novedades](https://docs.spring.io/spring-kafka/reference/whats-new.html) |
| Spring for GraphQL | 2.1.0 (la referencia la marca estable) | — | [referencia](https://docs.spring.io/spring-graphql/reference/index.html) |
| Spring Modulith | 2.1.1 | 2.2.0-RC1 | [referencia](https://docs.spring.io/spring-modulith/reference/index.html) |
| Spring AI | 2.1.0 según la referencia; el blog solo anuncia 2.1.0-RC2 (9 nov). `docs/temarios/README.md` fija 2.0.x | — | [referencia](https://docs.spring.io/spring-ai/reference/index.html) |
| Spring gRPC | 1.1.1 | — | [referencia](https://docs.spring.io/spring-grpc/reference/index.html) |

Datos de plataforma que el temario usa:

| Dato | Valor | Fuente |
|---|---|---|
| Java | Boot 4.2.0: mínimo 17, compatible hasta 27. El curso usa JDK 25 | requisitos 4.2 |
| Build | Gradle 8.14 o posterior y 9.x; Maven 3.6.3 o posterior | requisitos 4.2 |
| Servidores embebidos | Tomcat 11.0.x y Jetty 12.1.x (Servlet 6.1). Undertow se retiró en Boot 4.0 | requisitos 4.2 · guía de migración 4.0 |
| Nativo | GraalVM Community 25 · Native Build Tools 1.1.18 | requisitos 4.2 |
| Base de Framework 7.0 | Jakarta EE 11, Servlet 6.1, JPA 3.2, Bean Validation 3.1, Kotlin 2.2, JUnit 6 | notas de Framework 7.0 |
| Boot 4.0 | Hibernate 7.2 · Jackson 3.0 · Testcontainers 2.0 · Micrometer 1.16 · Kafka 4.1 · Flyway 11.11 | notas de Boot 4.0 |
| Boot 4.1 | Framework 7.0.8 · Security 7.1.0 · Data 2026.0.0 · Micrometer 1.17 · Micrometer Tracing 1.7 · OpenTelemetry 1.62 · Spring gRPC 1.1 · Flyway 12.4 · Kotlin 2.3.21 | notas de Boot 4.1 |
| Framework 7.1 | sube la base a Jackson 3.1 e Hibernate 7.3; admite JPA 4.0/Hibernate 8.0; retira `HandlerMappingIntrospector`; `RestTemplate` deprecado con retiro previsto en 8.0 | notas de Framework 7.1 (página previa) |
| AOT cache | JEP 483: requiere Java 25 o posterior; CDS para versiones anteriores | [AOT cache](https://docs.spring.io/spring-boot/reference/packaging/aot-cache.html) |
| Spring Cloud Contract | sale de los próximos trenes de Spring Cloud y continúa como Stubborn.sh (anuncio del 6 jul 2026) | [blog](https://spring.io/blog/2026/07/06/spring-cloud-contract-transition-to-stubbornsh/) |
| Spring Cloud Bus | no aparece en la tabla del tren 2026.0; InfoQ informa que se integra en Spring Cloud Stream | [2026.0](https://docs.spring.io/spring-cloud-release/reference/2026.0/index.html) · [InfoQ](https://infoq.com/news/2026/10/spring-news-roundup-oct19-2026) |
| Certificación | 2V0-72.22 «Spring Professional Develop»: 60 preguntas, 130 min, 300 puntos (escala), USD 250. **Se basa en Framework 5.3, Data 2021.0 y Boot 2.5** | [guía del examen](https://docs.broadcom.com/doc/vmw-spring-professional-develop-exam-guide) |

Consecuencia: el temario se escribe contra **4.1.x**, que es lo aprobado y lo comprobado como GA en GitHub, y
marca con «(4.2)» o «(7.1)» lo que depende de la generación nueva. Ver la decisión D1.

## 2. Temario objetivo

**Cómo leer las tablas.** Una fila por tema. *Nivel* es el tramo: no baja a lo largo del curso. *Estado*:

- **ya está** — existe con el alcance pedido; se pasa a la plantilla de 12 secciones. Se indica el módulo y el
  tema actual.
- **está pero básico** — existe, y se dice qué le falta para el nivel maestro.
- **falta** — no existe en ningún curso (o existe solo como mención).

«Java M16 T3» y similares indican un tema que hoy vive en otro curso y que se trae (apartado 3.2). *Fuentes* usa
las claves del apartado «Fuentes consultadas».

### Tramo 1 · Fundamentos (M0–M5)

#### M0 · Spring en contexto y primer servicio

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Qué resuelven Spring Framework y Spring Boot: mapa de proyectos, generaciones de versiones y soporte | Fundamentos | falta | BOOT, L1, L3, R, E1 |
| T2 | Spring Initializr y la anatomía del proyecto con Gradle Kotlin DSL: plugin de Boot, BOM y catálogo de versiones | Fundamentos | está pero básico · M1 T1: falta Gradle KTS, cómo el BOM fija versiones y cómo sobrescribir una | BOOT, CERT, C1, C3 |
| T3 | Starters de Boot 4: un starter por tecnología, starters de prueba y starters «classic» | Fundamentos | está pero básico · M1 T1: falta la modularización de Boot 4 y leer el árbol de dependencias | BOOT, RN, R, E1 |
| T4 | `@SpringBootApplication` y `SpringApplication.run`: qué ocurre desde `main` hasta «Started» | Fundamentos | falta | BOOT, CERT, E1, E2 |
| T5 | El primer endpoint REST y su primera prueba | Fundamentos | falta | BOOT, L1, L3, C3, C4 |
| T6 | Ejecutar, depurar y recargar: `bootRun`, DevTools y servicios de desarrollo con Docker Compose | Fundamentos | falta | BOOT, C1, E1 |

#### M1 · El contenedor IoC: beans e inyección

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Inversión de control: `BeanFactory`, `ApplicationContext` y qué es un bean | Fundamentos | está pero básico · M0 T1: falta la jerarquía de interfaces y ver el contenedor con el depurador | FW, L2, CERT, R, E2 |
| T2 | Declarar beans: estereotipos, escaneo de componentes y `@Configuration` con `@Bean` | Fundamentos | está pero básico · M0 T3: falta `@Bean` frente a escaneo, filtros de escaneo y el criterio de elección | FW, L2, CERT, E2 |
| T3 | Inyección por constructor, setter y campo; dependencias opcionales con `ObjectProvider` y `@Nullable` de JSpecify | Fundamentos | está pero básico · M0 T2: falta `ObjectProvider`, opcionales y JSpecify | FW, CERT, E1, E2 |
| T4 | Varias implementaciones: `@Primary`, `@Fallback`, `@Qualifier`, genéricos e inyección de colecciones ordenadas | Fundamentos | está pero básico · M0 T6: falta `@Fallback`, genéricos como calificador y `List`/`Map` de beans | FW, CERT, E1, E2 |
| T5 | Scopes: singleton, prototype, request y session; proxies de scope y seguridad de hilos del singleton | Fundamentos | está pero básico · M0 T3: falta inyectar un prototype en un singleton y los scopes web | FW, CERT, R, E1, E2 |
| T6 | Ciclo de vida de un bean: callbacks, `SmartLifecycle`, orden de creación y de apagado | Fundamentos | ya está · M0 T4 | FW, CERT, E2 |
| T7 | Dependencias circulares, `@Lazy` y `@DependsOn`: el error real y cómo rediseñar | Fundamentos | falta | FW, CERT, E1 |

#### M2 · Configuración externa, perfiles y logging

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | `Environment` y `PropertySource`: de dónde sale cada valor y en qué orden gana | Fundamentos | falta | FW, BOOT, CERT, E1 |
| T2 | `application.yml`, `application.properties`, `@Value` y lo mínimo de SpEL | Fundamentos | está pero básico · M1 T2 y M0 T6: falta el enlace relajado de nombres y los límites de SpEL | BOOT, FW, CERT, L1 |
| T3 | `@ConfigurationProperties` con records: validación y metadatos para el IDE | Fundamentos | ya está · M7 T1 | BOOT, L1, U1, E1 |
| T4 | Perfiles, grupos de perfiles y documentos por perfil | Fundamentos | está pero básico · M1 T3: falta grupos, `spring.config.activate.on-profile` y perfiles en pruebas | BOOT, CERT, U1, E1, E2 |
| T5 | `spring.config.import`, árboles de configuración, variables de entorno y secretos | Fundamentos | falta | BOOT, L5, E1 |
| T6 | Fallar rápido al arrancar y explicar la causa con `FailureAnalyzer` | Fundamentos | ya está · M7 T2 y M7 T4 (se fusionan) | BOOT, RN |
| T7 | Logging: Logback y Log4j2, niveles, grupos y logs estructurados en JSON | Fundamentos | ya está · M7 T8 | BOOT, U1 |

#### M3 · Web MVC esencial: una API REST

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | El viaje de una petición: servidor embebido, filtros, `DispatcherServlet` y controlador | Fundamentos | falta en Spring (Microservicios M2 T1 lo resume) | FW, CERT, R, E1 |
| T2 | Controladores y mapeo: rutas, variables de ruta, parámetros y cabeceras | Fundamentos | falta | FW, CERT, L1, L3, C2, E1 |
| T3 | Cuerpos y respuestas: `@RequestBody`, `ResponseEntity`, códigos de estado y negociación de contenido | Fundamentos | está pero básico · M2 T2: falta la negociación de contenido y el criterio de códigos | FW, CERT, C4, E1 |
| T4 | DTO con records en vez de entidades | Fundamentos | ya está · M2 T1 | L1, C4, U1 |
| T5 | JSON con Jackson 3: `JsonMapper`, fechas y personalización | Fundamentos | ya está · M2 T7 | BOOT, RN, U1, E1 |
| T6 | Validar la entrada con Bean Validation: restricciones, grupos y validadores propios | Fundamentos | está pero básico · M2 T2: falta grupos, validación de métodos y restricciones propias | FW, BOOT, L2, U1, C2, E1 |
| T7 | Errores de la API con `@RestControllerAdvice` y Problem Details | Fundamentos | está pero básico · M2 T3 y M7 T3 (duplicados; se fusionan): falta `ProblemDetail` y `ErrorResponse` | FW, C4, E1 |

#### M4 · Acceso a datos esencial

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | `DataSource` y HikariCP: qué autoconfigura Boot y cómo verlo | Fundamentos | está pero básico · M3 T1: falta el pool, sus propiedades y `ConnectionDetails` | BOOT, FW, L7 |
| T2 | `JdbcClient` y `JdbcTemplate`: SQL explícito, mapeo de filas y traducción de excepciones | Fundamentos | ya está · M3 T2 | FW, CERT, L2, C3 |
| T3 | Migraciones de esquema con Flyway; Liquibase como alternativa | Fundamentos | ya está · M4 T4 | BOOT, RN, L5, C1, E1 |
| T4 | La primera entidad JPA y su repositorio de Spring Data | Fundamentos | ya está · M4 T1 | DATA, CERT, L1, L3, R |
| T5 | Consultas derivadas, `@Query`, paginación y ordenación | Fundamentos | está pero básico · M4 T1: falta `@Query`, `Pageable` y los tipos de retorno | DATA, CERT, E1 |
| T6 | `@Transactional` por primera vez: dónde empieza y dónde termina una transacción | Fundamentos | está pero básico · M3 T3 (722 palabras): falta la traza SQL que lo demuestre | FW, CERT, R |
| T7 | Base de datos de desarrollo reproducible: soporte de Docker Compose y Testcontainers en desarrollo | Fundamentos | falta | BOOT, C1 |

#### M5 · Pruebas esenciales

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Qué probar sin Spring: pruebas unitarias de servicios con JUnit y Mockito | Fundamentos | falta | FW, CERT, U1 |
| T2 | `@SpringBootTest`: cuándo levantar todo el contexto, `@MockitoBean` y los cambios de Boot 4 | Fundamentos | está pero básico · M6 T3: falta `@MockitoBean`, `@AutoConfigureMockMvc` y el coste del contexto | BOOT, RN, CERT, R |
| T3 | Probar la capa web con `@WebMvcTest`, `MockMvcTester` y `RestTestClient` | Fundamentos | ya está · M6 T1 y M6 T4 | FW, BOOT, CERT, R |
| T4 | Probar los datos con `@DataJpaTest` y `@JdbcTest` contra PostgreSQL real | Fundamentos | ya está · M6 T2 | BOOT, CERT, R, U1 |
| T5 | Propiedades y perfiles en pruebas: `@TestPropertySource`, `@ActiveProfiles` y `@DynamicPropertySource` | Fundamentos | falta | FW, CERT |

### Tramo 2 · Aplicación (M6–M17)

#### M6 · Web MVC completo

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Cómo se resuelven los argumentos y los valores de retorno: resolvers y `HttpMessageConverter` | Aplicación | falta | FW, RN |
| T2 | Conversión de tipos, formateadores, `@InitBinder` y enlace de datos | Aplicación | falta | FW, L2, C5 |
| T3 | Filtros, `OncePerRequestFilter` e interceptores: orden y para qué sirve cada uno | Aplicación | falta | FW, C5, E1 |
| T4 | Subir y descargar archivos: multipart, streaming y peticiones de rango | Aplicación | está pero básico · M20 T9: falta límites, streaming sin cargar en memoria y rangos | FW, C5 |
| T5 | CORS en Spring MVC: preflight y configuración global | Aplicación | está pero básico · M5 T3: falta la parte de MVC separada de Security | FW, L4, E1 |
| T6 | Paginación HTTP con validación y un límite explícito | Aplicación | ya está · M2 T6 | DATA, E1 |
| T7 | Versionado de API nativo de Framework 7 | Aplicación | ya está · M2 T8 | FW, RN |

#### M7 · Diseño y documentación de la API

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | OpenAPI con springdoc: el contrato como prueba | Aplicación | ya está · M2 T5 | U1, C4 |
| T2 | MapStruct y Lombok frente a records: mapear sin exponer datos internos | Aplicación | ya está · M2 T4 | C4 |
| T3 | Caché HTTP: `Cache-Control`, ETag y peticiones condicionales | Aplicación | falta | FW |
| T4 | Idempotencia, `PATCH` y concurrencia optimista en HTTP | Aplicación | falta | FW, E1 |
| T5 | Spring HATEOAS y Spring Data REST: cuándo sí y cuándo no | Aplicación | falta | BOOT, L6, C1, C2 |
| T6 | Internacionalización: `MessageSource`, `Locale` y mensajes de validación | Aplicación | falta | BOOT, FW |

#### M8 · Clientes HTTP

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | `RestClient`: peticiones, errores e interceptores; por qué `RestTemplate` está deprecado | Aplicación | falta | FW, BOOT, RN, C3, E1 |
| T2 | Clientes declarativos con `@HttpExchange` y `@ImportHttpServices` | Aplicación | está pero básico · M16 T6: falta la autoconfiguración de Boot 4 y los grupos de clientes | FW, BOOT, RN, C1 |
| T3 | Tiempos de espera, pool de conexiones y fábricas de peticiones (JDK, HttpComponents, Jetty, Reactor) | Aplicación | falta | BOOT, RN |
| T4 | Reintentos y límite de concurrencia del núcleo: `@Retryable` y `@ConcurrencyLimit` | Aplicación | ya está · M9 T4 | FW, RN |
| T5 | Reducir SSRF en clientes HTTP con `InetAddressFilter` | Aplicación | ya está · M5 T4 | RN |
| T6 | Probar clientes: `@RestClientTest`, `MockRestServiceServer` y WireMock | Aplicación | falta | FW, BOOT |

#### M9 · Vistas en el servidor con Thymeleaf

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Controladores con vista: modelo, plantillas Thymeleaf y recursos estáticos | Aplicación | falta | FW, BOOT, L1, L3, C1, C2, C5 |
| T2 | Formularios: enlace, validación, errores y patrón POST-redirect-GET | Aplicación | falta | FW, L1, C2, C5 |
| T3 | Fragmentos HTML y actualización parcial de la página | Aplicación | falta | FW |

#### M10 · JPA e Hibernate con Spring: mapeo

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Contexto de persistencia: estados de una entidad, dirty checking y cuándo se escribe el SQL | Aplicación | está pero básico · Java M16 T3: falta la traza SQL y el momento del flush | DATA, L6, L7, R, E1 |
| T2 | Identificadores: secuencias, optimizadores, UUID, y `equals`/`hashCode` correctos | Aplicación | falta | L6, L7 |
| T3 | Asociaciones: muchos-a-uno, uno-a-muchos bidireccional, uno-a-uno y muchos-a-muchos | Aplicación | está pero básico · Java M16 T1 y T2: falta el lado propietario, el SQL que genera cada mapeo y el coste | L6, L7, R, C1 |
| T4 | Embebibles, conversores, enumerados y columnas JSON | Aplicación | falta | L6, L7 |
| T5 | Herencia: tabla única, tablas unidas y `@MappedSuperclass` | Aplicación | está pero básico · Java M16 T2: falta medir cada estrategia | L6, L7 |
| T6 | Auditoría, borrado lógico e historial con Envers | Aplicación | falta | DATA, L6, E1 |

#### M11 · Consultas con Spring Data JPA

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Cómo Spring Data fabrica un repositorio: proxy, `SimpleJpaRepository` y fragmentos | Aplicación | falta | DATA, L6 |
| T2 | JPQL, consultas nativas y `@Modifying`: el contexto de persistencia desactualizado | Aplicación | falta | DATA, L6, C1 |
| T3 | Proyecciones: interfaz, record y dinámicas | Aplicación | está pero básico · M4 T3 (567 palabras): falta el SQL de cada tipo y la proyección dinámica | DATA, L7, E1 |
| T4 | Búsquedas dinámicas: Specifications, Criteria, Query by Example y Querydsl | Aplicación | ya está · Java M16 T4 (se trae) | DATA, L6 |
| T5 | `Page`, `Slice` y desplazamiento por clave (`Window`) | Aplicación | falta | DATA, E1 |
| T6 | Repositorios con código propio y eventos del agregado | Aplicación | falta | DATA |
| T7 | Procedimientos almacenados, `StatelessSession` y resultados en flujo | Aplicación | falta | DATA, RN, L7 |

#### M12 · AOP y proxies

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Qué problema resuelve AOP y su vocabulario: aspecto, advice, pointcut y join point | Aplicación | está pero básico · M0 T5: hoy va junto con proxies y post-procesadores | FW, L2, CERT, R, U1, E2 |
| T2 | Proxies JDK y CGLIB: cuál crea Spring, `proxyTargetClass` y `@Proxyable` | Aplicación | está pero básico · M0 T5: falta ver la clase del proxy y `@Proxyable` de Framework 7 | FW, RN, CERT, E2 |
| T3 | `@Aspect` y los cinco tipos de advice, con `@Around` a fondo | Aplicación | está pero básico · M0 T5: falta `@AfterReturning`, `@AfterThrowing` y el orden de ejecución | FW, CERT, L2, C2 |
| T4 | Expresiones de pointcut: `execution`, `within`, `@annotation` y `bean` | Aplicación | falta | FW, CERT, L2 |
| T5 | Límites del proxy: autoinvocación, métodos privados y finales, y orden entre aspectos | Aplicación | está pero básico · M9 T2: falta generalizarlo más allá de `@Async` | FW, CERT, E1, E2 |

#### M13 · Transacciones

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Cómo funciona `@Transactional`: `PlatformTransactionManager`, interceptor y sincronización de recursos | Aplicación | está pero básico · M3 T3 y M17 T1: falta seguir la llamada con el depurador | FW, CERT, L2, L6, E2 |
| T2 | Propagación: los siete modos con su traza | Aplicación | está pero básico · Java M16 T7: solo cubre `REQUIRED` y `REQUIRES_NEW` | FW, CERT, L6, E1 |
| T3 | Aislamiento: provocar cada anomalía contra PostgreSQL y fijar el nivel desde Spring | Aplicación | está pero básico · Java M17 T2 (JDBC puro): falta configurarlo y verlo desde Spring | FW, L6, L7 |
| T4 | Reglas de rollback, `readOnly` y tiempos de espera | Aplicación | falta | FW, CERT |
| T5 | Por qué una transacción no se abre: autoinvocación, visibilidad y excepciones tragadas | Aplicación | está pero básico · M17 T1 (695 palabras): falta el diagnóstico con logs de transacción | FW, E1, E2 |
| T6 | Transacciones programáticas con `TransactionTemplate` y eventos ligados a la transacción | Aplicación | está pero básico · M8 T2: falta `TransactionTemplate` y las fases de `@TransactionalEventListener` | FW |
| T7 | `open-in-view` y `LazyInitializationException`: qué hace el valor por defecto de Boot | Aplicación | falta | BOOT, L7, E1 |

#### M14 · Spring Security esencial

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Arquitectura: `DelegatingFilterProxy`, `FilterChainProxy` y `SecurityFilterChain` | Aplicación | está pero básico · M5 T1 y M18 T1 (duplicados; se fusionan): falta imprimir y leer la cadena real | SEC, L4, R, E1 |
| T2 | Autenticación por dentro: `AuthenticationManager`, proveedores, `UserDetailsService` y `SecurityContext` | Aplicación | falta | SEC, L4, CERT, U1 |
| T3 | Contraseñas: `PasswordEncoder`, codificador delegado y migración de algoritmos | Aplicación | falta | SEC, L4, C1 |
| T4 | Formulario de login, HTTP Basic, cierre de sesión y gestión de la sesión | Aplicación | falta | SEC, L1, L4, C2 |
| T5 | Autorizar peticiones: `authorizeHttpRequests`, roles, autoridades y jerarquía | Aplicación | está pero básico · M5 T2: falta `AuthorizationManager` y el orden de las reglas | SEC, L4, CERT, R, E1 |
| T6 | CSRF y CORS con Spring Security | Aplicación | ya está · M5 T3 | SEC, L4, E1 |
| T7 | Cabeceras de seguridad, `HttpFirewall` y HTTPS con SSL bundles | Aplicación | falta | SEC, BOOT, U1 |

#### M15 · Pruebas de aplicación

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | El TestContext framework: caché de contextos, pausa de contextos y `@DirtiesContext` | Aplicación | falta | FW, RN |
| T2 | Catálogo de slices y cómo elegir el más pequeño que sirve | Aplicación | está pero básico · M6 T1 y T2: solo dos slices, sin criterio | BOOT, CERT |
| T3 | Testcontainers con `@ServiceConnection`: ciclo de vida y contenedores compartidos | Aplicación | ya está · M6 T5 | BOOT, U1 |
| T4 | Probar la seguridad: `@WithMockUser`, `jwt()` y los post-procesadores de MockMvc | Aplicación | falta | SEC, L4 |
| T5 | Datos de prueba: `@Sql`, transacciones de prueba y limpieza | Aplicación | falta | FW, CERT, L6 |
| T6 | Arquitectura verificada con ArchUnit | Aplicación | ya está · M15 T2 | C1 |
| T7 | Utilidades de prueba: `OutputCaptureExtension`, AssertJ y `ApplicationContextRunner` | Aplicación | falta | BOOT |

#### M16 · Actuator y operación básica

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Endpoints de Actuator: exposición, puerto de gestión y seguridad | Aplicación | está pero básico · M7 T5: falta el puerto separado y asegurar los endpoints | BOOT, CERT, L1, R, C1 |
| T2 | Salud: indicadores propios, grupos, liveness y readiness | Aplicación | ya está · M7 T5, M7 T7 y M19 T3 (se fusionan) | BOOT, CERT, RN, E1 |
| T3 | Métricas con Micrometer: contador, temporizador, gauge, etiquetas y cardinalidad | Aplicación | está pero básico · M7 T6: solo contadores | BOOT, CERT, R |
| T4 | `info`, datos de build y de Git, SBOM y niveles de log en caliente | Aplicación | falta | BOOT, RN |
| T5 | Apagado ordenado del servidor y de las tareas | Aplicación | está pero básico · M0 T4: falta el plazo, el servidor web y las tareas en curso | BOOT, E1 |
| T6 | Endpoint propio con `@Endpoint`, auditoría y registro de intercambios HTTP | Aplicación | falta | BOOT |

#### M17 · Eventos, tareas, caché y correo

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Eventos de aplicación: publicar, escuchar y hacerlos asíncronos | Aplicación | está pero básico · M8 T2: falta el orden, los eventos genéricos y el fallo de un listener | FW, BOOT |
| T2 | Tareas periódicas con `@Scheduled`; una sola ejecución con varias instancias | Aplicación | está pero básico · M8 T1 (712 palabras): falta cron con zona, bloqueo distribuido y Quartz | FW, BOOT, L2 |
| T3 | `@Async`, ejecutores con límites, `TaskDecorator` y la autoinvocación | Aplicación | ya está · M9 T1 y M9 T2 | FW, BOOT, RN, E1 |
| T4 | Abstracción de caché: `@Cacheable`, claves, condiciones y Caffeine | Aplicación | ya está · M8 T4 (se divide en dos) | FW, BOOT |
| T5 | Caché compartida con Redis: TTL, serialización e invalidación | Aplicación | está pero básico · M8 T4: falta la serialización y qué pasa cuando Redis no responde | DATA, BOOT |
| T6 | Correo con Spring Mail y entrega recuperable | Aplicación | ya está · M8 T3 | FW, BOOT |

### Tramo 3 · Integración (M18–M34)

#### M18 · OAuth 2 y OpenID Connect

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | OAuth 2 y OIDC vistos desde Spring: qué papel cumple cada módulo | Integración | falta | SEC, L4, L5, R, E1 |
| T2 | Resource server con JWT: decodificador, validadores y conversión de autoridades | Integración | ya está · M5 T2 | SEC, RN, L4, L5, R |
| T3 | Tokens opacos, introspección y varios emisores | Integración | falta | SEC |
| T4 | OAuth2 client y login: authorization code con PKCE y cierre de sesión OIDC | Integración | está pero básico · M16 T5: falta el flujo paso a paso y el logout | SEC, L4, L5 |
| T5 | Llamadas salientes con token: clientes autorizados y `client_credentials` desde `RestClient` | Integración | falta | SEC |
| T6 | Un servidor de autorización propio con Spring Authorization Server | Integración | falta | SEC, RN, L4, C1 |
| T7 | Keycloak como proveedor de identidad en desarrollo y en pruebas | Integración | está pero básico · M16 T5: falta levantarlo con Testcontainers y probar contra él | L5, SEC |

#### M19 · Autorización y autenticación avanzadas

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Seguridad de métodos: `@PreAuthorize`, `@PostAuthorize` y meta-anotaciones | Integración | falta | SEC, L4, CERT, E1 |
| T2 | Filtrado en métodos y autorización por propiedad del recurso | Integración | falta | SEC, L4, L5 |
| T3 | Emitir y validar JWT propios: del login a una ruta protegida | Integración | ya está · M5 T5 | SEC, U1, R |
| T4 | Passkeys (WebAuthn), token de un solo uso y autenticación multifactor | Integración | falta | SEC, C1 |
| T5 | SAML 2.0 con el proveedor de identidad de una empresa | Integración | ya está · M18 T3 | SEC, BOOT |
| T6 | Sesiones a escala: Spring Session, sesiones concurrentes y remember-me | Integración | falta | SEC, BOOT |
| T7 | LDAP, X.509 y preautenticación: cuándo aparecen y cómo se configuran | Integración | falta | SEC |

#### M20 · Rendimiento de la persistencia

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | El problema N+1: detectarlo con una prueba y corregirlo | Integración | ya está · M4 T2 y Java M16 T5 (se fusionan) | L6, L7, E1, C1 |
| T2 | Planes de carga: `JOIN FETCH`, `@EntityGraph`, carga por lotes y el límite al paginar colecciones | Integración | está pero básico · M4 T3 y Java M16 T6: falta `MultipleBagFetchException` y la paginación en memoria | DATA, L6, L7 |
| T3 | Escritura por lotes: batching JDBC, orden de sentencias y operaciones masivas | Integración | falta | FW, L7 |
| T4 | Bloqueo optimista con `@Version` y pesimista; reintentar el conflicto | Integración | está pero básico · Java M16 T7: falta el bloqueo pesimista y el reintento | DATA, L6, L7, E1 |
| T5 | Caché de segundo nivel y caché de consultas: medir antes de activar | Integración | está pero básico · Java M16 T6: falta la configuración con JCache, las estrategias de concurrencia y la medición | L7, BOOT |
| T6 | Ver lo que hace Hibernate: estadísticas, log de SQL con parámetros y consultas lentas | Integración | falta | L7, BOOT |
| T7 | El pool de conexiones: tamaño, adquisición diferida y réplicas de lectura | Integración | falta | L7, RN, BOOT |

#### M21 · Otros almacenes con Spring Data

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Spring Data JDBC: agregados sin contexto de persistencia | Integración | falta | DATA, L6, R |
| T2 | jOOQ con Spring Boot: SQL con tipos | Integración | falta | BOOT, L7 |
| T3 | Spring Data MongoDB: documentos, `MongoTemplate`, agregaciones y transacciones | Integración | está pero básico · M4 T5: falta `MongoTemplate`, agregaciones, índices y transacciones | DATA, L1, L6, R, U1 |
| T4 | Spring Data Redis: `RedisTemplate`, estructuras, publicación/suscripción y streams | Integración | falta | DATA, RN |
| T5 | Búsqueda de texto con Elasticsearch | Integración | falta | BOOT |
| T6 | Varios `DataSource` y multitenencia | Integración | falta | BOOT, FW |
| T7 | Datos espaciales con Hibernate Spatial | Integración | ya está · M20 T5 y M20 T6 (se fusionan) | L6 |

#### M22 · Programación reactiva: Reactor y WebFlux

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Reactive Streams y Reactor: `Mono`, `Flux` y operadores | Integración | ya está · M13 T1 | FW, L1, L3, L2, E1 |
| T2 | Hilos en Reactor: schedulers, contexto y cómo depurar una cadena | Integración | falta | FW, L3 |
| T3 | Contrapresión real, medida con `reactor-test` | Integración | ya está · M13 T4 | FW, L1 |
| T4 | WebFlux: `DispatcherHandler`, controladores anotados y endpoints funcionales | Integración | falta | FW, BOOT, L1, L5 |
| T5 | `WebClient` y composición sin bloqueo | Integración | ya está · M13 T2 | FW, L1, E1 |
| T6 | R2DBC y repositorios reactivos; transacciones reactivas | Integración | está pero básico · M13 T3: R2DBC es medio tema, sin transacciones | FW, DATA, L1, L5 |
| T7 | Probar código reactivo: `StepVerifier` y `WebTestClient` | Integración | está pero básico · M13 T4: falta `WebTestClient` y el tiempo virtual | FW, L1, L3 |

#### M23 · Tiempo real: SSE, WebSocket y RSocket

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Server-Sent Events y respuestas en flujo desde MVC | Integración | falta | FW |
| T2 | WebSocket y STOMP: broker simple y broker externo | Integración | está pero básico · M20 T8: falta el broker externo y el flujo de mensajes | FW, BOOT, L2 |
| T3 | Seguridad, destinos por usuario y varias instancias en WebSocket | Integración | falta | FW, SEC |
| T4 | RSocket: los cuatro modelos de interacción | Integración | falta | FW, BOOT, L1 |

#### M24 · Spring for GraphQL

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Esquema primero: tipos y consultas | Integración | ya está · M14 T1 | GQL, BOOT, C1 |
| T2 | Controladores anotados, `@BatchMapping` y el N+1 | Integración | ya está · M14 T2 | GQL |
| T3 | Mutaciones y suscripciones | Integración | ya está · M14 T3 | GQL |
| T4 | Errores, validación, seguridad y paginación por cursor | Integración | falta | GQL |
| T5 | Probar con `GraphQlTester` y consumir con el cliente GraphQL | Integración | ya está · M14 T4 | GQL |

#### M25 · gRPC con Spring gRPC

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Servidor gRPC en Spring Boot: de `.proto` al servicio | Integración | está pero básico · M16 T7: falta la generación con Gradle y Netty frente a Servlet | GRPC, BOOT, RN, C1 |
| T2 | Cliente gRPC: stubs, plazos, interceptores y seguridad | Integración | falta | GRPC, BOOT |
| T3 | Evolución del contrato y pruebas de gRPC | Integración | está pero básico · M16 T7: falta la prueba en proceso | GRPC, BOOT |

#### M26 · Mensajería con Apache Kafka

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Productores y consumidores: `KafkaTemplate` y `@KafkaListener` | Integración | ya está · M10 T1 | KAFKA, BOOT, L1, C1 |
| T2 | Contenedores de listeners: concurrencia, confirmación de offsets y modos de `AckMode` | Integración | falta | KAFKA |
| T3 | Serialización y contratos: JSON, Avro y Schema Registry | Integración | ya está · M10 T7 | KAFKA, C1 |
| T4 | Errores: `DefaultErrorHandler`, dead-letter topic y reintentos no bloqueantes | Integración | está pero básico · M10 T2: falta `@RetryableTopic` y combinar reintentos | KAFKA |
| T5 | Rebalanceo de grupos y asignación de particiones | Integración | ya está · M10 T5 | KAFKA |
| T6 | Transacciones, idempotencia y límites de exactly-once | Integración | ya está · M10 T3 | KAFKA |
| T7 | Probar Kafka: broker embebido frente a Testcontainers | Integración | falta | KAFKA, BOOT |

#### M27 · Kafka avanzado y outbox

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Kafka Streams con Spring | Integración | está pero básico · M10 T6 (793 palabras): falta estado, ventanas y `TopologyTestDriver` | KAFKA |
| T2 | Colas en Kafka: share consumers | Integración | falta | KAFKA |
| T3 | Outbox transaccional implementado en Spring | Integración | está pero básico · M10 T4 (563 palabras): falta el relevo, el orden y la limpieza | MOD, KAFKA |

#### M28 · RabbitMQ y JMS

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | El modelo AMQP: exchanges, colas, bindings y `RabbitTemplate` | Integración | está pero básico · M11 T2: va junto con el consumidor | AMQP, BOOT, L1 |
| T2 | `@RabbitListener`: confirmación, prefetch y concurrencia | Integración | ya está · M11 T2 | AMQP |
| T3 | Fiabilidad: confirmaciones del publicador, reintentos y dead-letter exchange | Integración | falta | AMQP, RN |
| T4 | RabbitMQ Streams y AMQP 1.0 | Integración | falta | AMQP, RN |
| T5 | JMS con Artemis: `JmsClient`, colas y transacciones | Integración | está pero básico · M11 T3: falta `JmsClient` de Framework 7 | FW, BOOT, RN, L1 |
| T6 | Kafka frente a RabbitMQ: criterio de elección | Integración | ya está · M11 T1 | AMQP, KAFKA |

#### M29 · Spring Cloud Stream y Spring Cloud Function

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Funciones, bindings y destinos | Integración | está pero básico · M11 T4 (488 palabras) | CLOUD, L5 |
| T2 | Binder de Kafka y binder de RabbitMQ | Integración | está pero básico · M11 T5 (569 palabras) | CLOUD, L5 |
| T3 | Reintentos, manejo de errores y dead-letter en el binder | Integración | está pero básico · M11 T6 (540 palabras) | CLOUD |
| T4 | El test binder y sus límites | Integración | está pero básico · M11 T7 (548 palabras) | CLOUD, L5 |
| T5 | Spring Cloud Function: la misma función en HTTP, mensajería y serverless | Integración | falta | CLOUD, L5 |

#### M30 · Spring Integration y servicios SOAP

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Patrones de integración empresarial: mensaje, canal y endpoint | Integración | está pero básico · M8 T5: un solo tema para todo el módulo | INT, L1, C1 |
| T2 | El DSL de Java: `IntegrationFlow` | Integración | falta | INT, L1, C1 |
| T3 | Adaptadores: archivos, SFTP, JDBC y HTTP | Integración | falta | INT, L1 |
| T4 | Enrutar, dividir, agregar y manejar errores | Integración | falta | INT, C1 |
| T5 | Consumir y publicar SOAP con Spring Web Services | Integración | está pero básico · M8 T5: falta un servicio contract-first completo | BOOT, L2 |

#### M31 · Spring Batch 6

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | El lenguaje del dominio: Job, Step, `JobRepository` y `JobOperator` | Integración | está pero básico · M12 T1: falta la configuración de Batch 6 y el repositorio en memoria por defecto de Boot 4 | BATCH, RN, C1 |
| T2 | Procesamiento por chunks y tasklets | Integración | ya está · M12 T1 | BATCH |
| T3 | Lectores y escritores: archivos planos, JSON, JDBC paginado y JPA | Integración | falta | BATCH |
| T4 | Tolerancia a fallos: skip, retry y reinicio | Integración | ya está · M12 T2 | BATCH |
| T5 | Parámetros del job, enlace tardío y cómo lanzar y programar un job | Integración | está pero básico · M12 T2: falta `@JobScope`/`@StepScope` y el operador de línea de comandos | BATCH |
| T6 | Escalar: pasos en paralelo, particionado y chunking remoto | Integración | falta | BATCH |
| T7 | Probar y observar jobs: `@SpringBatchTest`, Micrometer y JFR | Integración | falta | BATCH |

#### M32 · Observabilidad

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | La API de Observation: una instrumentación, métricas y trazas | Integración | falta | FW, BOOT |
| T2 | Métricas a fondo: histogramas, percentiles, objetivos de servicio y exemplars | Integración | falta | BOOT, RN, L5 |
| T3 | Trazas distribuidas: Micrometer Tracing, propagación W3C y baggage | Integración | está pero básico · M16 T11: falta el baggage, el muestreo y leer una traza | BOOT, L5, R |
| T4 | El starter de OpenTelemetry: exportar métricas, trazas y logs por OTLP | Integración | falta | BOOT, RN |
| T5 | Logs correlacionados con la traza: MDC y JSON | Integración | está pero básico · M7 T8 y M9 T3: falta la correlación con el identificador de traza | BOOT |
| T6 | Observaciones propias con `@Observed`, convenciones y propagación de contexto | Integración | falta | BOOT, RN |
| T7 | Observar datos y mensajería, con un stack local reproducible | Integración | falta | BOOT, KAFKA, AMQP, DATA, L5 |

#### M33 · Empaquetado y despliegue

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | El JAR ejecutable por dentro: formato, JAR anidados y lanzadores | Integración | está pero básico · M19 T1: falta el formato y el lanzador | BOOT |
| T2 | Capas y extracción con `jarmode=tools` | Integración | ya está · M19 T1 | BOOT, RN, L5 |
| T3 | Imágenes OCI con Buildpacks desde Gradle | Integración | ya está · M19 T4 | BOOT, L5, C1 |
| T4 | Configurar el servicio para Kubernetes: sondas, árboles de configuración y apagado | Integración | ya está · M19 T3 | BOOT, L5 |
| T5 | SSL bundles: TLS del servidor y de los clientes, con recarga de certificados | Integración | falta | BOOT, RN |
| T6 | El plugin de Gradle de Spring Boot: `bootJar`, `bootRun`, `bootBuildImage`, datos de build y SBOM | Integración | falta | BOOT, RN |
| T7 | Despliegue tradicional en WAR y como servicio del sistema | Integración | falta | BOOT, L1, L3, CERT |

#### M34 · Arquitectura de la aplicación con Spring Modulith

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Organizar el código: paquetes por funcionalidad y puertos del dominio en Spring | Integración | ya está · M15 T1 y M15 T3 (la teoría pasa a Diseño de sistemas) | MOD, C1 |
| T2 | Módulos de aplicación y verificación de sus límites | Integración | está pero básico · M15 T6 (541 palabras) | MOD, C1 |
| T3 | Eventos entre módulos y el registro de publicaciones | Integración | está pero básico · M15 T7 (533 palabras): falta el registro y la reentrega | MOD, C1 |
| T4 | Pruebas de integración por módulo | Integración | está pero básico · M15 T9 (568 palabras): falta `Scenario` | MOD, C1 |
| T5 | Documentación generada y mapa de dependencias | Integración | está pero básico · M15 T8 (558 palabras) | MOD |
| T6 | Externalizar eventos a un broker y observar los módulos | Integración | falta | MOD |

### Tramo 4 · Experto (M35–M46)

#### M35 · El contenedor por dentro

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | `refresh()` paso a paso: qué hace el contexto al arrancar | Experto | falta | FW, L2 |
| T2 | `BeanDefinition`, el registro y `ConfigurationClassPostProcessor` | Experto | falta | FW, L2 |
| T3 | `BeanFactoryPostProcessor`: cambiar definiciones antes de crear beans | Experto | falta | FW, CERT |
| T4 | `BeanPostProcessor`: cómo se inyecta `@Autowired`, se llama a `@PostConstruct` y se crea un proxy | Experto | está pero básico · M0 T5: es un apartado; falta escribir uno y ver el orden real | FW, CERT, E1, E2 |
| T5 | Creación de singletons, referencias tempranas y dependencias circulares | Experto | falta | FW, E1 |
| T6 | `FactoryBean`, `ImportSelector`, `ImportBeanDefinitionRegistrar` y `BeanRegistrar` | Experto | falta | FW, RN |
| T7 | `@Configuration` por dentro: `proxyBeanMethods` y el modo ligero | Experto | falta | FW, BOOT |

#### M36 · AOP por dentro

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Del aspecto al proxy: auto-proxy creator, advisors y cadena de interceptores | Experto | falta | FW, L2 |
| T2 | `ProxyFactory`, `TargetSource` e introductions | Experto | falta | FW, L2 |
| T3 | Weaving de AspectJ en compilación y en carga: cuándo deja de bastar el proxy | Experto | falta | FW |
| T4 | Una anotación propia con su aspecto, de principio a fin | Experto | falta | FW, U1 |
| T5 | Coste y diagnóstico de los proxies | Experto | falta | FW, E1 |

#### M37 · Autoconfiguración por dentro y starter propio

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | El arranque de `SpringApplication`: fases, eventos, listeners y runners | Experto | falta | BOOT, E1 |
| T2 | `@EnableAutoConfiguration`, `AutoConfiguration.imports` y el orden | Experto | está pero básico · M0 T3: es un apartado sin el mecanismo | BOOT, CERT, R, E1, E2 |
| T3 | Condiciones `@ConditionalOn…` y el informe de condiciones | Experto | falta en Spring (Microservicios M1 T4 lo resume) | BOOT, CERT, E1 |
| T4 | Leer una autoconfiguración real con el depurador: `DataSource` y Jackson | Experto | falta | BOOT |
| T5 | `EnvironmentPostProcessor`, carga de `ConfigData` y el `Binder` | Experto | falta | BOOT, RN |
| T6 | Un starter propio: módulo de autoconfiguración, propiedades, metadatos y pruebas | Experto | falta | BOOT, E1 |
| T7 | La modularización de Boot 4 por dentro | Experto | falta | RN, BOOT |

#### M38 · La capa web por dentro

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | El servidor embebido: Tomcat y Jetty, conectores, hilos, HTTP/2 y compresión | Experto | falta | BOOT, RN, R |
| T2 | `HandlerMapping`, `HandlerAdapter` y resolución de excepciones | Experto | falta | FW |
| T3 | Peticiones asíncronas: `DeferredResult`, `Callable` y sus tiempos de espera | Experto | falta | FW, U1 |
| T4 | Endpoints funcionales en MVC con `RouterFunction` | Experto | falta | FW |
| T5 | Reactor Netty y el bucle de eventos: qué pasa cuando se bloquea | Experto | falta | FW, L3 |

#### M39 · Concurrencia e hilos virtuales en Spring

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | `spring.threads.virtual.enabled`: qué componentes cambian | Experto | falta | BOOT, RN, E1 |
| T2 | Límites reales con hilos virtuales: pool de conexiones, pinning y `@ConcurrencyLimit` | Experto | está pero básico · M9 T4: falta el caso con hilos virtuales | BOOT, FW |
| T3 | Bloqueos, interbloqueos y semáforos dentro de un servicio Spring | Experto | ya está · M9 T3 (la teoría de locks pasa a Java) | FW |
| T4 | Propagación de contexto: `ThreadLocal`, MDC, `SecurityContext` y Scoped Values | Experto | está pero básico · M9 T3: solo MDC | BOOT, RN, SEC |
| T5 | MVC con hilos virtuales frente a WebFlux: la decisión con medidas | Experto | está pero básico · M13 T3: falta la medición con hilos virtuales | BOOT, L5, E1 |

#### M40 · Arranque y memoria: AOT, imagen nativa, AOT cache y CRaC

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Spring AOT: qué genera `processAot` y qué queda fijado en compilación | Experto | falta | FW, BOOT, E1 |
| T2 | `RuntimeHints`: reflexión, recursos, proxies y serialización | Experto | falta | FW, BOOT |
| T3 | Imagen nativa con GraalVM desde Gradle | Experto | está pero básico · M19 T2: falta el plugin de Gradle, los metadatos de alcance y los límites | BOOT, L5, L2, C1 |
| T4 | Probar y depurar en nativo: `processTestAot` y los fallos típicos | Experto | falta | BOOT, FW |
| T5 | AOT en la JVM y repositorios AOT de Spring Data | Experto | falta | BOOT, DATA |
| T6 | CDS y AOT cache de la JVM: entrenar, empaquetar y medir | Experto | falta | BOOT, FW |
| T7 | Checkpoint y restauración con CRaC | Experto | falta en Spring (Microservicios M1 T7 lo resume) | BOOT, FW |

#### M41 · Rendimiento y diagnóstico en producción

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Medir el arranque: `ApplicationStartup`, el endpoint `startup` e inicialización perezosa | Experto | falta | FW, BOOT, E1 |
| T2 | Memoria de un servicio Spring en un contenedor | Experto | falta | BOOT, E1 |
| T3 | Diagnóstico en vivo: volcados de hilos y de memoria por Actuator, y JFR | Experto | falta | BOOT, BATCH |
| T4 | Ajustar Tomcat, HikariCP y Jackson con datos | Experto | falta | BOOT, L7 |
| T5 | Prueba de carga del servicio y lectura de sus resultados | Experto | falta | L5, L7 |
| T6 | Fugas típicas en Spring: contextos, `ThreadLocal` y cachés sin límite | Experto | falta | FW, E1 |

#### M42 · Seguridad experta

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Varias cadenas de filtros, orden de los filtros y un filtro propio | Experto | está pero básico · M18 T1 (708 palabras): falta `securityMatcher` y el filtro propio | SEC, L4, E1 |
| T2 | El `SecurityContext` entre hilos: estrategias y propagación | Experto | falta | SEC |
| T3 | Tokens ligados al emisor: DPoP y metadatos del recurso protegido | Experto | falta | SEC |
| T4 | Varios inquilinos y rotación de claves | Experto | falta | SEC |
| T5 | Seguridad en aplicaciones reactivas | Experto | falta | SEC, L4 |
| T6 | Endurecer el servicio: Actuator, secretos externos, eventos de seguridad y auditoría | Experto | falta | SEC, BOOT, L5 |

#### M43 · Pruebas expertas

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Contratos entre productor y consumidor: de Spring Cloud Contract a Stubborn.sh, y Pact | Experto | está pero básico · M16 T12 y M17 T3 (se fusionan): falta la migración a Stubborn.sh | CLOUD, RN |
| T2 | Documentar la API desde las pruebas con Spring REST Docs | Experto | falta | BOOT |
| T3 | Una suite rápida: reutilizar contextos y contenedores, y ejecutar en paralelo | Experto | está pero básico · M6 T5: falta medir la caché de contextos y el paralelismo | FW, BOOT |
| T4 | Probar la mensajería y los fallos de red | Experto | está pero básico · M11 T7: falta la inyección de fallos | KAFKA, AMQP, BOOT |
| T5 | Un slice de prueba propio | Experto | falta | BOOT |

#### M44 · Spring AI en el servicio

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | `ChatClient`, prompts y advisors | Experto | ya está · M8 T6 | AI, C1 |
| T2 | Salida estructurada y su validación | Experto | falta | AI |
| T3 | Herramientas con la autorización fuera del modelo | Experto | ya está · M8 T6 (se divide en dos) | AI, C1 |
| T4 | Embeddings y almacén vectorial con PGvector | Experto | falta | AI, DATA, C1 |
| T5 | RAG desde la frontera de datos | Experto | ya está · M8 T7 | AI |
| T6 | Model Context Protocol: servidor y cliente | Experto | ya está · M8 T8 | AI, C1 |
| T7 | Memoria de conversación, evaluación y observabilidad | Experto | falta | AI |

#### M45 · Evolución y mantenimiento

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Leer las notas de versión y la política de soporte: qué versión toca | Experto | falta | RN, BOOT |
| T2 | Migrar de Boot 3.5 a 4.x: starters classic, Jackson 3 y migrador de propiedades | Experto | falta | RN |
| T3 | Nulabilidad con JSpecify en un proyecto Spring | Experto | falta | FW, RN |
| T4 | Migraciones automáticas con OpenRewrite y deprecaciones vigentes | Experto | falta | RN |

#### M46 · Proyecto final: el servicio en producción

| # | Tema | Nivel | Estado | Fuentes |
|---|---|---|---|---|
| T1 | Arquitectura del servicio y sus decisiones | Experto | ya está · M20 T1 | L5, C1 |
| T2 | Seguridad y observabilidad integradas | Experto | ya está · M20 T2 y M20 T7 (se fusionan) | L5 |
| T3 | Datos, contratos, tiempo real y archivos funcionando juntos | Experto | está pero básico · M20 T4 (701 palabras) y M20 T9: son temas sueltos | L5 |
| T4 | Entrega: imagen, arranque medido y despliegue en kind | Experto | falta | L5, BOOT |
| T5 | Evidencia, rúbrica y siguientes pasos | Experto | ya está · M20 T3 | L5 |

## 3. Reparto con otros cursos («un concepto, un curso dueño»)

### 3.1 Lo que sale de Spring

| Tema o módulo actual de Spring | Curso dueño | Destino propuesto | Qué queda en Spring |
|---|---|---|---|
| M16 T1 Config Server y service discovery | Microservicios | Fase 1, Módulo 7 «Spring Cloud e infraestructura» (ya tiene Eureka/Consul y Config Server) | nada; M2 T5 enseña `spring.config.import` |
| M16 T2 Spring Cloud Gateway | Microservicios | Módulo 7 (ya tiene API Gateway) | nada |
| M16 T3 Circuit breaker y T4 Bulkhead/RateLimiter de Resilience4j | Microservicios | Módulo 8 «Resiliencia» (ya tiene Resilience4j completo) | M8 T4: `@Retryable` y `@ConcurrencyLimit` del núcleo |
| M16 T5 Token Relay | Microservicios | Módulo 9 «Seguridad» (ya tiene OAuth2/OIDC, Keycloak y Token Exchange) | M18: OAuth2/OIDC de un servicio |
| M16 T6, la parte de descubrimiento | Microservicios | Módulo 7 (LoadBalancer) | M8 T2: clientes declarativos |
| M16 T8 DDD para decidir límites | Microservicios | Módulo 5 (ya tiene DDD) | nada |
| M16 T9 Orquestar con Temporal | Microservicios | Módulo 25 «Consistencia distribuida» y Proyecto Final | nada |
| M16 T10 Spring Cloud Bus | Microservicios | Módulo 7. Revisar: Bus no figura en el tren 2026.0 | nada |
| M17 T2 Recuperación con duplicación segura | Microservicios | Módulo 25 | M26 T6: idempotencia del consumidor |
| M17 T4 Observabilidad al servicio de un objetivo | DevOps (SLO); Microservicios Módulo 10 la aplica | DevOps | M32: instrumentación |
| M17 T5 Saga, T6 Event Sourcing, T7 Compensación que falla | Microservicios | Módulos 25 y 26 | M27 T3: outbox en un servicio |
| M15 T4 C4 y M15 T5 ADR | Diseño de sistemas | ya previsto en `docs/temarios/diseno-de-sistemas.md` | M46 T1 los usa |
| M15 T1 y T3, la teoría de hexagonal, Clean y DDD táctico | Diseño de sistemas | Diseño de sistemas | M34 T1: cómo se organiza en Spring |
| M9 T2, la parte de `CompletableFuture` | Java | Java, concurrencia (ya tiene M5 T2) | M17 T3: `@Async` |
| M9 T3, la teoría de locks, interbloqueos y semáforos | Java | Java, concurrencia | M39 T3: el caso dentro de Spring |
| M19 T1, la parte del Dockerfile multi-stage | Docker | Docker M4 (ya previsto en `docs/temarios/docker.md`) | M33 T2: capas y extracción |
| M19 T3, la parte de manifiestos de Kubernetes | Kubernetes | Kubernetes (sondas) | M33 T4: lo que configura Boot |
| M18 T2 «DTO validation, CORS, JWT/OIDC y clientes HTTP» | Spring (repetido) | se fusiona en M3 T6, M14 T6, M18 T2 y M8 | — |

Lo que el temario objetivo **no incluye** porque ya tiene dueño:

| Concepto | Dueño | Qué enseña Spring a cambio |
|---|---|---|
| Config Server, Eureka/Consul, LoadBalancer, Gateway, BFF, OpenFeign | Microservicios (Módulo 7) | configuración externa (M2) y clientes HTTP (M8) de un solo servicio |
| Resilience4j, presupuestos de latencia, fallbacks y caos | Microservicios (Módulo 8) | reintentos del núcleo (M8 T4) |
| mTLS con malla, Vault, Token Exchange, Zero-Trust | Microservicios (Módulos 9 y 27) | Security de un servicio (M14, M18, M19, M42) |
| Sagas, 2PC, Event Sourcing, CQRS, Temporal | Microservicios (Módulos 25 y 26) | transacciones locales (M13) y outbox (M27 T3) |
| Patrones de caché, bloqueo distribuido y estampida | Microservicios (Módulo 4) | la abstracción de caché de Spring (M17 T4 y T5) |
| Pact y Pact Broker, SonarQube | Microservicios (Módulo 3) | M43 T1 enlaza y compara |
| Prometheus, Grafana, alertas, Zipkin/Jaeger como plataforma | Microservicios (Módulo 10) y DevOps | instrumentación con Micrometer y OTLP (M16, M32) |
| Dockerfile, capas, multi-stage, imágenes mínimas, escaneo | Docker | `bootBuildImage`, capas del JAR y extracción (M33) |
| Deployments, Services, ConfigMaps, Helm, HPA, GitOps | Kubernetes | sondas, árboles de configuración y apagado (M33 T4) |
| Servicios de AWS, Azure y GCP, Floci, Spring Cloud AWS/Azure/GCP | Cloud | el servicio lee su configuración por entorno; los laboratorios de nube viven en Cloud |
| Modelo de build, tareas, catálogos, convention plugins, build cache | Gradle | el plugin de Spring Boot (M0 T2 y M33 T6) |
| Lenguaje, colecciones, hilos virtuales, structured concurrency, JDBC puro, JVM, GC, JFR | Java | lo que Spring cambia al usarlos (M4, M39, M41) |
| HTTP, REST como estilo, SQL y Git | Fundamentos | — |
| LLM, prompts, RAG y agentes como disciplina | IA aplicada (propuesta en `docs/temarios/ia-aplicada.md`) | ver la decisión D6 |

### 3.2 Temas de Spring que hoy están en otros cursos

| Dónde está hoy | Tema | Destino en Spring | Qué queda en el curso de origen |
|---|---|---|---|
| Java M16 T1 y T2 | Entidades, relaciones y herencia JPA | M10 T3 y M10 T5 | nada: Java termina en JDBC (alcance de specs/021 §5) |
| Java M16 T3 | Ciclo de vida y `EntityManager` | M10 T1 | nada |
| Java M16 T4 | Criteria y Querydsl | M11 T4 | nada |
| Java M16 T5 y T6 | LAZY, EAGER, N+1, `EntityGraph` y cachés | M20 T1, T2 y T5 | nada |
| Java M16 T7 | Concurrencia, transacciones y propagación | M13 T2 y M20 T4 | nada |
| Java M16 T8 | Migraciones y pruebas JPA con Testcontainers | M4 T3 y M5 T4 (se fusiona) | nada |
| Java M17 T2 | Transacciones, ACID y aislamiento | se queda en Java (JDBC puro); M13 T3 lo aplica desde Spring | el tema completo |
| Microservicios M1 T3 a T6 | IoC, autoconfiguración condicional, multi-módulo, perfiles | M1, M37 y M2 son los dueños | la ficha queda como repaso y enlaza |
| Microservicios M1 T7 y T8 | CRaC y GraalVM Native Image | M40 T7 y M40 T3 | la ficha enlaza; conserva el criterio de costo |
| Microservicios M2 T1 a T6 | Spring MVC, Jackson, `@ControllerAdvice`, Spring Data JPA, Specifications, Flyway/Liquibase | M3, M4, M10 y M11 | la ficha enlaza |
| Microservicios M3 T1, T2 y T4 | JUnit/Mockito/MockMvc, Testcontainers, ArchUnit | M5 y M15 | la ficha enlaza |
| Microservicios M4 T1 | `@Cacheable`, `@CacheEvict` y TTL con Redis | M17 T4 y T5 | patrones de caché (T2 a T4) |
| Microservicios M5 T3 | Spring Modulith | M34 | la ficha enlaza y conserva el criterio «modulito antes que microservicios» |
| Microservicios M6 T2 y T3 | gRPC y Spring for GraphQL | M25 y M24 (la API de Spring) | el criterio de elección del protocolo |
| Microservicios M9 T1 | Spring Security: filter chain | M14 T1 | la ficha enlaza |
| Microservicios M10 T1 a T3 | Micrometer, OpenTelemetry y logging estructurado | M16, M32 y M2 T7 (la instrumentación) | el stack de plataforma |
| Microservicios M11 T1 a T5 | Kafka y RabbitMQ a fondo | M26 a M28 (la API de Spring) | los conceptos de broker y de arquitectura. Ver la decisión D4 |
| Cloud M31 T4 y Node M7 T5 | Testcontainers | M5 T4 y M15 T3 para Spring | cada curso conserva el suyo: es otro lenguaje |
| RutaFlow M2 T2 y T3 | Casos de uso, transacciones, outbox y colas | M13 y M27 T3 | RutaFlow los usa como integrador |

Microservicios es el caso delicado: su Fase 1 se llama «Spring Boot de cero a experto» y repasa en 72 fichas
buena parte de este curso. Este temario no le quita fichas. Propone que las fichas espejo enlacen al tema
dueño de Spring y no vuelvan a explicar el mecanismo (decisión D3).

### 3.3 Destino de los 123 temas actuales

Ningún tema se pierde. Entre paréntesis, el número de temas de cada módulo.

| Módulo actual | Destino tema por tema |
|---|---|
| M0 (6) | T1→M1 T1 · T2→M1 T3 · T3→M1 T2, M1 T5 y M37 T2 · T4→M1 T6 y M16 T5 · T5→M12 T1 a T3 y M35 T4 · T6→M1 T4 y M2 T2 |
| M1 (3) | T1→M0 T2 y M0 T3 · T2→M2 T2 · T3→M2 T4 |
| M2 (8) | T1→M3 T4 · T2→M3 T3 y M3 T6 · T3→M3 T7 · T4→M7 T2 · T5→M7 T1 · T6→M6 T6 · T7→M3 T5 · T8→M6 T7 |
| M3 (3) | T1→M4 T1 · T2→M4 T2 · T3→M4 T6 y M13 T1 |
| M4 (5) | T1→M4 T4 y M4 T5 · T2→M20 T1 · T3→M20 T2 y M11 T3 · T4→M4 T3 · T5→M21 T3 |
| M5 (5) | T1→M14 T1 · T2→M18 T2 y M14 T5 · T3→M14 T6 y M6 T5 · T4→M8 T5 · T5→M19 T3 |
| M6 (5) | T1→M5 T3 · T2→M5 T4 · T3→M5 T2 · T4→M5 T3 · T5→M15 T3 y M43 T3 |
| M7 (8) | T1→M2 T3 · T2→M2 T6 · T3→M3 T7 · T4→M2 T6 · T5→M16 T1 y M16 T2 · T6→M16 T3 · T7→M16 T2 · T8→M2 T7 y M32 T5 |
| M8 (8) | T1→M17 T2 · T2→M17 T1 y M13 T6 · T3→M17 T6 · T4→M17 T4 y M17 T5 · T5→M30 T1 y M30 T5 · T6→M44 T1 y M44 T3 · T7→M44 T5 · T8→M44 T6 |
| M9 (4) | T1→M17 T3 · T2→M17 T3 y M12 T5 (lo de `CompletableFuture` a Java) · T3→M39 T3 y M39 T4 (la teoría a Java) · T4→M8 T4 y M39 T2 |
| M10 (7) | T1→M26 T1 · T2→M26 T4 · T3→M26 T6 · T4→M27 T3 · T5→M26 T5 · T6→M27 T1 · T7→M26 T3 |
| M11 (7) | T1→M28 T6 · T2→M28 T1 y M28 T2 · T3→M28 T5 · T4→M29 T1 · T5→M29 T2 · T6→M29 T3 · T7→M29 T4 y M43 T4 |
| M12 (2) | T1→M31 T1 y M31 T2 · T2→M31 T4 y M31 T5 |
| M13 (4) | T1→M22 T1 · T2→M22 T5 · T3→M22 T6 y M39 T5 · T4→M22 T3 y M22 T7 |
| M14 (4) | T1→M24 T1 · T2→M24 T2 · T3→M24 T3 · T4→M24 T5 |
| M15 (9) | T1→M34 T1 · T2→M15 T6 · T3→M34 T1 · T4→**Diseño de sistemas** · T5→**Diseño de sistemas** · T6→M34 T2 · T7→M34 T3 · T8→M34 T5 · T9→M34 T4 |
| M16 (12) | T1, T2, T3, T4, T8, T9 y T10→**Microservicios** · T5→M18 T4 y M18 T7 (Token Relay a Microservicios) · T6→M8 T2 · T7→M25 T1 y M25 T3 · T11→M32 T3 · T12→M43 T1 |
| M17 (7) | T1→M13 T1 y M13 T5 · T2, T5, T6 y T7→**Microservicios** · T3→M43 T1 · T4→**DevOps** |
| M18 (3) | T1→M14 T1 y M42 T1 · T2→fusionado en M3 T6, M14 T6, M18 T2 y M8 T1 · T3→M19 T5 |
| M19 (4) | T1→M33 T1 y M33 T2 (el Dockerfile a Docker) · T2→M40 T3 · T3→M33 T4 y M16 T2 · T4→M33 T3 |
| M20 (9) | T1→M46 T1 · T2→M46 T2 · T3→M46 T5 · T4→M46 T3 · T5 y T6→M21 T7 · T7→M46 T2 · T8→M23 T2 · T9→M6 T4 y M46 T3 |

Recuento: 14 temas salen de Spring (11 a Microservicios: M16 T1, T2, T3, T4, T8, T9 y T10, y M17 T2, T5, T6 y
T7; 2 a Diseño de sistemas: M15 T4 y T5; 1 a DevOps: M17 T4). Los otros 109 se quedan; 10 de ellos se funden con
otro tema de Spring: M6 T4, M7 T3, M7 T4, M7 T7, M17 T3, M18 T1, M18 T2, M19 T3, M20 T6 y M20 T7.

## 4. Proyecto guía y laboratorio por módulo

### 4.1 Proyecto guía: `entregas`, el servicio de entregas de RutaFlow

Un único servicio que nace en M0 y llega a producción en M46. Es el backend de entregas que ya usa el M20
actual y sobre el que trabajan los integradores de Docker, Kubernetes y Microservicios (`docs/temarios/README.md`).
No hay ejemplos sueltos: cada tema añade o abre una parte del mismo servicio.

| Etapa | Módulos | Qué tiene el servicio al terminar |
|---|---|---|
| 1 · Nace | M0–M5 | API REST de pedidos y repartidores sobre PostgreSQL con Flyway, configuración por perfiles, errores con Problem Details y pruebas de web y de datos |
| 2 · Se completa | M6–M17 | subida de comprobantes, cliente HTTP hacia el servicio de rutas, dominio JPA completo, transacciones con traza, login y autorización, Actuator, tareas programadas, caché y correo |
| 3 · Se integra | M18–M34 | OAuth2/OIDC con Keycloak, persistencia medida, MongoDB y Redis, seguimiento en tiempo real, API GraphQL y gRPC, eventos por Kafka y RabbitMQ con outbox, job nocturno de liquidación con Batch, observabilidad por OTLP, imagen OCI y módulos verificados con Modulith |
| 4 · Se entiende y se endurece | M35–M46 | un starter propio de la empresa (`rutaflow-spring-boot-starter`), aspectos propios, hilos virtuales medidos, imagen nativa y AOT cache comparados, diagnóstico en vivo, seguridad endurecida, suite rápida, asistente con Spring AI y entrega final con rúbrica |

Reglas del proyecto:

- Un solo repositorio de laboratorio con un directorio por módulo: `examples/spring/modulo-N/`. Cada uno parte
  del estado final del anterior (regla «el mismo servicio que crece» de specs/021 §3).
- **Gradle con Kotlin DSL**, wrapper fijado y catálogo de versiones (`gradle/libs.versions.toml`). Las
  versiones de Spring las fija el BOM de Boot. Maven aparece solo como nota de equivalencia.
- **Testcontainers desde M4**: PostgreSQL, y luego Kafka, RabbitMQ, Redis, MongoDB, Keycloak y Artemis, con
  `@ServiceConnection`. M0–M3 no necesitan contenedores.
- Cada laboratorio trae `README.md`, versiones fijadas y `verificar.sh`, que termina en «RESULTADO: OK».
- Nada de nube: lo que necesite AWS, Azure o GCP vive en Cloud con Floci. El despliegue final usa kind.

### 4.2 Laboratorio por módulo

| Módulo | Laboratorio (`examples/spring/modulo-N/`) | Lo que comprueba `verificar.sh` |
|---|---|---|
| M0 | Crear `entregas` con Gradle KTS y un endpoint `GET /pedidos/{id}` | `./gradlew test bootRun` responde 200 y el árbol de dependencias muestra los starters |
| M1 | Dos estrategias de tarifa como beans; inyección por constructor y una dependencia circular provocada | el contexto arranca; la prueba del ciclo falla con el mensaje esperado |
| M2 | `@ConfigurationProperties` de tarifas, perfiles `local` y `prod`, y un arranque que falla con explicación | la precedencia de propiedades coincide con la tabla del tema |
| M3 | CRUD de pedidos con validación y Problem Details | pruebas de MockMvc para 200, 201, 400, 404 y 409 |
| M4 | PostgreSQL con Flyway, `JdbcClient` y un repositorio JPA | las migraciones se aplican en un contenedor limpio; la traza SQL coincide |
| M5 | Pruebas unitarias, `@WebMvcTest` y `@DataJpaTest` con Testcontainers | la suite pasa y se cuenta cuántos contextos levanta |
| M6 | Subida de comprobantes, un interceptor de correlación y la API en dos versiones | pruebas de multipart, de orden de filtros y de versión |
| M7 | Contrato OpenAPI generado, ETag y `PATCH` con control de versión | el contrato publicado coincide con el del repositorio; se obtienen 304 y 412 |
| M8 | Cliente `@HttpExchange` hacia un servicio de rutas simulado | tiempos de espera y reintentos verificados contra WireMock |
| M9 | Panel interno con Thymeleaf y un formulario validado | prueba de formulario con error y redirección |
| M10 | Dominio completo: pedido, paradas, repartidor y auditoría | el SQL generado por cada mapeo coincide con el esperado |
| M11 | Búsqueda de pedidos con Specifications, proyecciones y paginación por clave | número de consultas contado por prueba |
| M12 | Aspecto de auditoría con una anotación propia | la clase del proxy y el orden de los aspectos, impresos y comprobados |
| M13 | Asignar un pedido con cada modo de propagación y nivel de aislamiento | la traza de transacciones coincide; la anomalía se reproduce y se corrige |
| M14 | Usuarios en base de datos, formulario de login y reglas por rol | la cadena de filtros impresa; 401 y 403 en las rutas esperadas |
| M15 | Reorganizar la suite: slices, `@ServiceConnection` y pruebas de seguridad | tiempo de la suite y contextos levantados, antes y después |
| M16 | Indicador de salud del servicio de rutas, métricas de negocio y un endpoint propio | `/actuator/health` por grupos y `/actuator/prometheus` con las métricas |
| M17 | Evento de pedido entregado, cierre programado, caché de tarifas con Redis y correo | una sola ejecución con dos instancias; aciertos y fallos de caché contados |
| M18 | Resource server y cliente OAuth2 contra Keycloak en Testcontainers | flujo con PKCE y validación del token |
| M19 | `@PreAuthorize` por propiedad del pedido y login con passkey | la matriz de autorización completa en pruebas |
| M20 | Provocar N+1, bloqueo y lote lento, y corregirlos | consultas contadas antes y después; estadísticas de Hibernate |
| M21 | Historial en MongoDB, posiciones en Redis y un informe con Spring Data JDBC | pruebas con tres contenedores |
| M22 | Versión reactiva del seguimiento con WebFlux y R2DBC | `StepVerifier` y contrapresión medida |
| M23 | Seguimiento en vivo con SSE y con STOMP | cliente de prueba que recibe los eventos en orden |
| M24 | API GraphQL de pedidos con `@BatchMapping` | `GraphQlTester` y consultas SQL contadas |
| M25 | Servicio gRPC de cotización y su cliente | prueba en proceso y plazo vencido |
| M26 | Publicar y consumir `PedidoEntregado` con Kafka | reintentos, DLT y rebalanceo observados en Testcontainers |
| M27 | Outbox con relevo y un agregado de entregas por zona con Streams | ningún evento perdido ni duplicado al matar el proceso |
| M28 | Notificaciones por RabbitMQ con dead-letter y una cola JMS en Artemis | confirmaciones del publicador y reentrega verificadas |
| M29 | La misma función con el binder de Kafka y el de RabbitMQ | prueba con test binder y con broker real |
| M30 | Importar pedidos desde archivos con un `IntegrationFlow` | el flujo procesa, enruta y aparta los errores |
| M31 | Job nocturno de liquidación con reinicio | el job se reinicia donde falló; los metadatos coinciden |
| M32 | Trazas, métricas y logs por OTLP hacia un stack local | una traza cruza HTTP, JDBC y Kafka con el mismo identificador |
| M33 | JAR por capas, imagen con `bootBuildImage` y TLS con SSL bundle | tamaño y capas de la imagen medidos; arranque en contenedor |
| M34 | Partir `entregas` en módulos con Spring Modulith | `ApplicationModules.verify()` pasa y el diagrama se genera |
| M35 | Un `BeanFactoryPostProcessor` y un `BeanPostProcessor` propios | el orden de las llamadas, registrado y comprobado |
| M36 | Anotación `@Idempotente` con su aspecto | la prueba demuestra la cadena de interceptores |
| M37 | `rutaflow-spring-boot-starter` con su autoconfiguración | `ApplicationContextRunner` cubre cada condición |
| M38 | Ajustar Tomcat y un endpoint asíncrono | hilos y tiempos medidos bajo carga |
| M39 | El mismo endpoint con hilos de plataforma, hilos virtuales y WebFlux | tabla de latencia y consumo generada por el script |
| M40 | JVM, AOT cache, imagen nativa y CRaC del mismo servicio | tabla de arranque y memoria generada por el script |
| M41 | Diagnosticar tres fallos sembrados: fuga, pool agotado y arranque lento | cada causa identificada con su evidencia |
| M42 | Dos cadenas de filtros, DPoP y Actuator asegurado | pruebas de las rutas de cada cadena |
| M43 | Contrato con el consumidor y una suite paralela | el contrato roto hace fallar el build; tiempo de la suite |
| M44 | Asistente de operaciones con herramientas autorizadas y RAG | pruebas con modelo simulado y autorización verificada |
| M45 | Migrar una copia del servicio de Boot 3.5 a 4.x | el build pasa sin starters classic |
| M46 | Entrega final en kind con rúbrica | `verificar.sh` de extremo a extremo |

## 5. Decisiones para el dueño

| # | Decisión | Opciones | Recomendación |
|---|---|---|---|
| D1 | **Versión de referencia.** `docs/VERSIONES.md` dice Boot 4.1.x. La 4.2.0 (con Framework 7.1) aparece como estable en docs.spring.io, pero GitHub y el blog aún mostraban RC el 2026-11-20 | a) escribir sobre 4.1.x y anotar lo de 4.2 · b) esperar la GA de 4.2 y fijar 4.2.x | b) si la GA se confirma en el Mac antes de empezar la Fase 5; si no, a). El temario vale para las dos |
| D2 | **JPA: de Java a Spring.** Los 8 temas de Java M16 pasan a Spring M10, M11, M13 y M20 | a) mover · b) dejar JPA en Java | a): specs/021 §5 pone «Data y JPA a fondo» en Spring y termina Java en JDBC |
| D3 | **Fichas espejo de Microservicios.** Su Fase 1 repasa IoC, MVC, JPA, pruebas, Security y observabilidad de Spring | a) las fichas enlazan al tema dueño y no repiten el mecanismo · b) se dejan como están | a) |
| D4 | **Mensajería con Spring.** Kafka, RabbitMQ, JMS y Cloud Stream (M26 a M29, 21 temas) se quedan en Spring; Microservicios tiene 6 fichas en su Módulo 11 | a) Spring es dueño de la API de Spring y Microservicios de los conceptos de broker y arquitectura · b) todo a Microservicios | a) |
| D5 | **Spring Cloud sale por completo** del curso (Config Server, Eureka, Gateway, Resilience4j, Bus) hacia Microservicios | a) sale · b) queda un módulo resumen | a) |
| D6 | **Spring AI.** El M44 (7 temas) coincide con el curso propuesto de IA aplicada, que usa Spring AI en casi todos sus módulos | a) M44 se queda en Spring · b) pasa entero a IA aplicada y Spring queda en 46 módulos y 274 temas | b) si se aprueba IA aplicada; mientras tanto, a) |
| D7 | **Thymeleaf (M9, 3 temas).** Lo traen cinco de las fuentes; el curso actual no lo tiene | a) incluirlo · b) dejarlo fuera | a), corto: sin él no se entienden formularios, CSRF ni sesiones |
| D8 | **Módulos pequeños de integración:** RSocket (M23 T4), SOAP (M30 T5), Elasticsearch (M21 T5), jOOQ (M21 T2), LDAP/X.509 (M19 T7), WAR (M33 T7) | incluir o dejar como mención | incluir: son un tema cada uno y aparecen en la documentación oficial |
| D9 | **Certificación.** El examen 2V0-72.22 se basa en Framework 5.3 y Boot 2.5 | a) cubrir sus objetivos sin prepararlo · b) añadir un módulo de preparación | a): todos sus objetivos quedan cubiertos por M1, M2, M4, M5, M12 a M16 y M35 |
| D10 | **Contratos.** Spring Cloud Contract deja el tren de Spring Cloud y sigue como Stubborn.sh | a) M43 T1 enseña Stubborn.sh · b) solo Pact (que ya está en Microservicios) | decidir al escribir, cuando se compruebe la versión de Stubborn.sh compatible con Boot 4 |
| D11 | **Tamaño.** 281 temas (hoy 123), unas 164 h | aprobar, recortar o partir en dos cursos | aprobar. Si se parte: «Spring» (M0–M34) y «Spring por dentro» (M35–M46) |
| D12 | **Nombre e identificador.** El curso se llama hoy «Spring Boot» | a) nombre visible «Spring», identificador `spring-boot` sin cambios · b) cambiar también el identificador | a): no rompe el progreso guardado en `localStorage` |
| D13 | **Kotlin con Spring** (corrutinas, DSL de beans) | a) fuera · b) un módulo | a): el curso es Java; se enlaza la referencia |

## Pendientes de verificar antes de escribir

- La GA de Spring Boot 4.2.0 y de Framework 7.1.0, y el contenido de las notas de versión de 4.2 (la wiki
  estaba vacía el 2026-11-20).
- Las versiones de Spring Cloud (2025.1.x frente a 2026.0.0), Spring AI (2.0.x frente a 2.1.0) y la de
  Hibernate que trae el BOM elegido (7.2 con Boot 4.0; Framework 7.1 sube la base a 7.3).
- Si Spring Cloud Bus sigue existiendo como módulo en el tren 2026.0 (afecta al destino de M16 T10).
- La versión de Stubborn.sh compatible con Boot 4 (el anuncio no da versiones).
- Si Spring Boot 4.2 mantiene `spring.threads.virtual.enabled` con el mismo alcance (M39 T1).
- Todo dato técnico de cada tema se ejecuta en el Mac del dueño antes de publicarse (regla 9).

## Fuentes consultadas

Todas se abrieron el 2026-11-20. De cada una se tomó la **lista de temas**, no su texto.

### 1. Documentación oficial

| Clave | Fuente | Qué se tomó |
|---|---|---|
| FW | [Spring Framework Reference](https://docs.spring.io/spring-framework/reference/index.html) (la página servida es la de 7.1.0) | índice completo: Core, Testing, Data Access, Web Servlet, Web Reactive, Integration |
| BOOT | [Spring Boot Reference](https://docs.spring.io/spring-boot/index.html) (4.2.0) · [requisitos](https://docs.spring.io/spring-boot/system-requirements.html) · [Testcontainers](https://docs.spring.io/spring-boot/reference/testing/testcontainers.html) · [AOT cache](https://docs.spring.io/spring-boot/reference/packaging/aot-cache.html) | índice completo, guías «How-to», plugins de build, especificación del JAR y lista de módulos de autoconfiguración |
| SEC | [Spring Security Reference](https://docs.spring.io/spring-security/reference/index.html) (7.1.2) · [novedades](https://docs.spring.io/spring-security/reference/whats-new.html) | índice de Servlet, Reactive, OAuth2, SAML2 y Authorization Server |
| DATA | [Spring Data JPA](https://docs.spring.io/spring-data/jpa/reference/index.html) · [JDBC y R2DBC](https://docs.spring.io/spring-data/relational/reference/index.html) · [MongoDB](https://docs.spring.io/spring-data/mongodb/reference/index.html) · [Redis](https://docs.spring.io/spring-data/redis/reference/index.html) · [proyecto](https://spring.io/projects/spring-data) | índices de los cuatro módulos |
| CLOUD | [Spring Cloud](https://spring.io/projects/spring-cloud) · [tren 2025.1](https://docs.spring.io/spring-cloud-release/reference/index.html) · [tren 2026.0](https://docs.spring.io/spring-cloud-release/reference/2026.0/index.html) · [Gateway](https://docs.spring.io/spring-cloud-gateway/reference/index.html) | proyectos del tren, compatibilidad con Boot e índice de Gateway (para el reparto) |
| BATCH | [Spring Batch Reference](https://docs.spring.io/spring-batch/reference/index.html) · [novedades de Batch 6](https://docs.spring.io/spring-batch/reference/whatsnew.html) | índice y novedades |
| INT | [Spring Integration Reference](https://docs.spring.io/spring-integration/reference/index.html) | índice y lista de adaptadores |
| AMQP | [Spring AMQP Reference](https://docs.spring.io/spring-amqp/reference/index.html) | índice |
| KAFKA | [Spring for Apache Kafka Reference](https://docs.spring.io/spring-kafka/reference/index.html) · [novedades](https://docs.spring.io/spring-kafka/reference/whats-new.html) | índice y novedades de 4.2 |
| GQL | [Spring for GraphQL Reference](https://docs.spring.io/spring-graphql/reference/index.html) | índice |
| MOD | [Spring Modulith Reference](https://docs.spring.io/spring-modulith/reference/index.html) | índice |
| AI | [Spring AI Reference](https://docs.spring.io/spring-ai/reference/index.html) | índice |
| GRPC | [Spring gRPC Reference](https://docs.spring.io/spring-grpc/reference/index.html) | índice |
| RN | Notas de versión: [Boot 4.0](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Release-Notes) · [Boot 4.1](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.1-Release-Notes) · [Boot 4.2](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.2-Release-Notes) (vacía) · [guía de migración a 4.0](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Migration-Guide) · [Framework 7.0](https://github.com/spring-projects/spring-framework/wiki/Spring-Framework-7.0-Release-Notes) · [Framework 7.1](https://github.com/spring-projects/spring-framework/wiki/Spring-Framework-7.1-Release-Notes) · [versiones soportadas](https://github.com/spring-projects/spring-boot/wiki/Supported-Versions) · [releases de Boot](https://github.com/spring-projects/spring-boot/releases) · [releases de Framework](https://github.com/spring-projects/spring-framework/releases) · [blog de Spring](https://spring.io/blog) · [This Week in Spring, 17 nov 2026](https://spring.io/blog/2026/11/17/this-week-in-spring-november-17th-2026) · [Spring Cloud Contract pasa a Stubborn.sh](https://spring.io/blog/2026/07/06/spring-cloud-contract-transition-to-stubbornsh/) · [InfoQ, resumen del 19 oct 2026](https://infoq.com/news/2026/10/spring-news-roundup-oct19-2026) | novedades, retiros, deprecaciones y versiones |

### 2. Libros (índices)

| Clave | Libro | Índice leído en |
|---|---|---|
| L1 | *Spring in Action*, 6.ª ed. (Walls) | [O'Reilly](https://www.oreilly.com/library/view/spring-in-action/9781617297571/) |
| L2 | *Pro Spring 6* (Cosmina, Harrop, Schaefer y Ho, 2023) | [O'Reilly](https://www.oreilly.com/library/view/pro-spring-6/9781484286401/) |
| L3 | *Spring Boot: Up and Running* (Heckler) | [O'Reilly](https://www.oreilly.com/library/view/spring-boot-up/9781492076971/) |
| L4 | *Spring Security in Action*, 2.ª ed. (Spilcă) | [O'Reilly](https://www.oreilly.com/library/view/spring-security-in/9781633437975/) |
| L5 | *Cloud Native Spring in Action* (Vitale) | [O'Reilly](https://www.oreilly.com/library/view/cloud-native-spring/9781617298424/) |
| L6 | *Java Persistence with Spring Data and Hibernate* (Tudose) | [O'Reilly](https://www.oreilly.com/library/view/java-persistence-with/9781617299186/) |
| L7 | *High-Performance Java Persistence* (Mihalcea) | [vladmihalcea.com](https://vladmihalcea.com/books/high-performance-java-persistence/) |

Los libros son anteriores a Boot 4 (cubren Boot 2.x y 3.x). Se usan para la lista de temas, no para las
versiones ni las API.

### 3. Certificación

| Clave | Fuente | Nota |
|---|---|---|
| CERT | [Guía del examen 2V0-72.22, Spring Professional Develop](https://docs.broadcom.com/doc/vmw-spring-professional-develop-exam-guide) · [ficha de la certificación](https://docs.broadcom.com/doc/vmw-spring-certified-professional) | seis secciones: Spring Core, Data Management, Spring MVC, Testing, Security y Spring Boot. Basada en Framework 5.3 y Boot 2.5 |

### 4. Sílabos de universidades y bootcamps

| Clave | Fuente | Nota |
|---|---|---|
| U1 | [Johns Hopkins, 605.784 Enterprise Computing with Java](https://jcs.ep.jhu.edu/ejava-springboot/coursedocs/content/html_single/jhu784-syllabus.html) | 14 semanas; usa Spring Boot 3.x y Java 21 |

Aparecieron en la búsqueda y no se abrieron: [JHU, edición de otoño de 2026](https://apps.ep.jhu.edu/syllabus/fall-2026/605.784.8VL),
[Regis MSSE 674](https://regis.brightspace.com/d2l/lor/viewer/viewFile.d2lfile/6606/843/MSSE674_Syllabus.html) y
[UC San Diego Extended Studies](https://extendedstudies.ucsd.edu/courses-and-programs/java-spring-boot-programming).
Con un solo sílabo abierto, este punto queda cubierto de forma débil.

### 5. Cursos largos

| Clave | Fuente | Nota |
|---|---|---|
| C1 | [Enterprise Java with Spring Boot (Josh Long)](https://master.dev/courses/spring-boot/) | 7 h 7 min; inglés; llega a Modulith, Batch, Integration, gRPC, GraphQL, passkeys, Authorization Server y Spring AI |
| C2 | [Spring Boot 4, Spring 7 & Hibernate for Beginners (Udemy)](https://www.udemy.com/course/spring-hibernate-tutorial/) | 13 secciones; inglés |
| C3 | [freeCodeCamp: Spring Boot 3 (Dan Vega)](https://www.freecodecamp.org/news/learn-app-development-with-spring-boot-3) | curso de YouTube de unas 3,5 h; se leyó la lista de secciones en el artículo |
| C4 | [Platzi: Curso de Java Spring Boot](https://platzi.com/cursos/java-spring-boot/) | español; 23 clases |
| C5 | [Udemy: Spring Framework 5 y Spring Boot 2](https://www.udemy.com/course/spring-framework-5/) | español; 40 h; desactualizado (Boot 2) |

También se abrió el [índice de vídeos de developereducators.com](https://developereducators.com/roadmap/spring-boot/),
que lista cursos de YouTube (Amigoscode, Devtiro, Telusko, Programming Techie y otros) pero no sus temarios.

### 6. Rutas públicas y entrevistas

| Clave | Fuente | Nota |
|---|---|---|
| R | [roadmap.sh/spring-boot](https://roadmap.sh/spring-boot) | los nodos se leyeron en [spring-boot.json](https://roadmap.sh/spring-boot.json): Spring Core, Security, Starters, Autoconfiguration, Actuators, Embedded Server, Hibernate, Spring Data, Spring Cloud, Spring MVC y Testing |
| E1 | [roadmap.sh: preguntas de Spring Boot](https://roadmap.sh/questions/spring-boot) | 65 temas en tres niveles; el avanzado incluye AOT, dependencias circulares, hilos virtuales, `AutoConfiguration.imports`, N+1, el fallo del proxy de `@Transactional` y apagado ordenado |
| E2 | [Chernyshov: preguntas de Spring y Spring Boot](https://viacheslavchernyshov.github.io/java-interview-questions-and-answers/questions/05-spring-spring-boot/) | 29 preguntas: ciclo de vida, `BeanPostProcessor`, proxies, autoinvocación y autoconfiguración |

### Fuentes que no se pudieron abrir o que no dieron lo buscado

| Fuente | Qué pasó | Qué se hizo |
|---|---|---|
| [roadmap.sh/spring-boot](https://roadmap.sh/spring-boot) (página) | los nodos se dibujan con JavaScript y no llegaron | se leyó `spring-boot.json` |
| Contenido del roadmap en GitHub (`kamranahmedse/developer-roadmap`) | bloqueado por `robots.txt` y error en `raw.githubusercontent.com` | lo mismo |
| [spring.io/guides](https://spring.io/guides) | la lista llegó vacía («No result found») | las guías no se contrastaron; solo sus categorías |
| [spring.academy/courses](https://spring.academy/courses) | solo metadatos | sin datos del itinerario oficial de Broadcom |
| [spring.io/projects/generations](https://spring.io/projects/generations) | «No generations data available» | versiones tomadas proyecto a proyecto |
| `api.spring.io` | el proxy del entorno devolvió 403 | no se usó |
| Notas de Spring Boot 4.2 | la página existe y está vacía hasta la GA | pendiente |
| Entradas del blog «Spring Batch 6.1 is now GA» y otras del 19 nov 2026 | error al abrir la entrada | solo consta el titular en el listado del blog |
| Páginas de Manning de L1, L4, L5 y L6, y la de Springer de L2 | no muestran el índice | índices leídos en O'Reilly |
| *Spring Boot in Action* (Walls, 2015) | no se consultó: cubre Boot 1.x | sustituido por L3 |
| Cursos largos de YouTube en español | dos búsquedas no devolvieron ninguno con temario legible; YouTube no se abrió | el español queda cubierto solo por C4 y C5. Punto débil: conviene que el dueño indique los canales que sigue |
| Artículos de entrevistas de Medium y similares | detrás de muro de pago | se usaron E1 y E2 |
