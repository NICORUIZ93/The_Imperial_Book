# Calidad de temario: Java, Spring Boot, Microservicios y RutaFlow

Fecha: 2026-11-18. Auditor independiente. Este informe es el único archivo modificado. No edité lecciones, tracks
ni código. Los cambios de temario que propongo quedan **pendientes de aprobación del dueño** (regla de `CLAUDE.md`
y criterio P7 de `specs/013-programa-de-cursos-y-correcciones.md`).

**Qué no repito.** La rúbrica A1–F3 ya está aplicada en `docs/auditoria/java-ios.md` y
`docs/auditoria/spring-microservicios-rutaflow.md`, y la medición mecánica en `calidad-transversal.md`. Este
informe cubre otros seis aspectos: cobertura frente a fuentes primarias, coherencia entre `.track.ts` y lección,
solapamientos, progresión y carga, versiones vigentes y experiencia del primer contacto. Si un hallazgo ya figura en
esas auditorías, solo lo cito como «(ya señalado)» y añado lo nuevo.

## Método (reproducible)

- **Temario real:** `grep -n '^### Tema' web/public/content/<curso>/*.md` (Java 117 temas, Spring Boot 121,
  Microservicios 24, RutaFlow 29).
- **Promesas del track:** para cada concepto o práctica de `web/src/app/tracks/<curso>.track.ts`, conté
  apariciones del término clave en el módulo correspondiente (`grep -c`). Un 0 significa que el módulo no lo
  nombra ni una vez.
- **Carga:** sumé los minutos declarados en cada `#### Subtema … · N min` y los comparé con la duración del track.
  El script está en `/tmp/aud2/horas.py`; los totales de subtemas salen con `grep '^#### Subtema' | grep -oE '[0-9]+ min'`.
- **Laboratorios compartidos:** `grep -oE "examples/[a-z0-9-]+"` por módulo.
- **Versiones:** `grep -ohE` de patrones `JDK NN`, `Spring Boot N.N` y similares en las lecciones. En los
  laboratorios revisé `<java.version>` y el parent de los `pom.xml` de `examples/*`. Comparé todo con la
  publicación oficial vigente, abajo.

### Fuentes primarias consultadas (2026-11-18)

| Tema | Fuente | Dato usado |
|---|---|---|
| Ciclo Java SE | [Oracle Java SE Support Roadmap](https://www.oracle.com/java/technologies/java-se-support-roadmap.html) | LTS: 17, 21 y 25 (sep. 2025); 26 (mar. 2026) y 27 (sep. 2026) no son LTS; la próxima LTS es Java 29 (sep. 2027). |
| JDK 27 | [Oracle JDK 27 release notes](https://www.oracle.com/java/technologies/javase/27all-relnotes.html) | GA el 15 sep. 2026; 27.0.1 el 20 oct. 2026; 27.0.1.1 el 17 nov. 2026. |
| Certificación Java | [Temario 1Z0-830 (Java SE 21)](https://enthuware.com/oca-ocp-java-certification-resources/290-ocp-java-21-exam-syllabus) y [nota sobre 1Z0-831 (Java SE 25)](https://enthuware.com/oca-ocp-java-certification-resources/297-ocp-java-25-exam-syllabus) | Diez áreas oficiales. La página de Oracle (`education.oracle.com`) rechazó la conexión; uso la transcripción de Enthuware y lo marco como fuente secundaria. |
| Versión de Spring Boot | [spring.io/projects/spring-boot](https://spring.io/projects/spring-boot), [InfoQ: Spring Boot 4.1](https://infoq.com/news/2026/06/spring-boot-4-1), [InfoQ: roundup 19-oct-2026](https://infoq.com/news/2026/10/spring-news-roundup-oct19-2026) | GA vigente: 4.1.2. La 4.1 salió el 10 jun. 2026 sobre Framework 7.0.x y Cloud 2025.1. Ya están publicados 4.2.0-RC1, Framework 7.1.0-RC1 y Spring Cloud 2026.0.0-RC1. |
| Dependencias de Boot 4.1.2 | [`spring-boot-dependencies` v4.1.2](https://github.com/spring-projects/spring-boot/tree/v4.1.2/platform/spring-boot-dependencies) y `gradle.properties` del tag | Framework 7.0.10, Security 7.1.2, JUnit Jupiter 6.0.3, Mockito 5.23.0, Jackson 3.1.7 (Jackson 2 = 2.21.7), Hibernate 7.4.13, Flyway 12.4.0, Liquibase 5.0.4, Testcontainers 2.0.5, Spring Kafka 4.1.2, Spring Batch 6.0.6, Spring GraphQL 2.0.6. |
| Migración a Boot 4 | [Spring Boot 4.0 Migration Guide](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Migration-Guide), [4.0 Release Notes](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-4.0-Release-Notes) | `spring-boot-starter-web` pasa a `spring-boot-starter-webmvc` (el anterior queda deprecado); Jackson 3 es el preferido; se retiran `@MockBean` y `@SpyBean`; `TestRestTemplate` ya no se autoconfigura y se sugiere `RestTestClient`; versionado de API autoconfigurado (`spring.mvc.apiversion.*`); HTTP Service Clients; `spring-boot-starter-opentelemetry`. |
| Resiliencia en el núcleo | [Spring Framework: Resilience Features](https://docs.spring.io/spring-framework/reference/core/resilience.html) | Desde 7.0: `@Retryable`, `@ConcurrencyLimit`, `@EnableResilientMethods` y `RetryTemplate`. |
| Versionado de API | [Spring MVC API Versioning](https://docs.spring.io/spring-framework/reference/web/webmvc-versioning.html) | `ApiVersionStrategy` (header, query, media type, path) y cabeceras `Deprecation` (RFC 9745) y `Sunset` (RFC 8594). |
| `RestTemplate` | [The state of HTTP clients in Spring](https://spring.io/blog/2025/09/30/the-state-of-http-clients-in-spring) | Se deprecará formalmente en Framework 7.1 (provisional, nov. 2026) y se eliminará en 8.0. |
| Certificación Spring | [Spring Professional Develop 2V0-72.22, guía del examen](https://docs.broadcom.com/doc/vmw-spring-professional-develop-exam-guide) | Seis secciones: Core (incluye AOP, SpEL, BeanFactoryPostProcessor/BeanPostProcessor), Data (JdbcTemplate, propagación), MVC, Testing, Security (incluye seguridad de métodos) y Boot (incluye seguridad de Actuator). |
| Patrones de microservicios | [microservices.io](https://microservices.io/patterns/index.html), [Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/), [Fowler: Strangler Fig](https://martinfowler.com/bliki/StranglerFigApplication.html), [Newman: BFF](https://samnewman.io/patterns/architectural/bff/) | Catálogo de patrones: descomposición, refactorización, datos, mensajería transaccional, pruebas, despliegue, API externa, descubrimiento, fiabilidad, seguridad y observabilidad. |
| Node.js | [Node.js previous releases](https://nodejs.org/en/about/previous-releases) | v20 está en EOL; v22, v24 y v26 son LTS. |

Intenté leer los roadmaps de [roadmap.sh/java](https://roadmap.sh/java) y [roadmap.sh/spring-boot](https://roadmap.sh/spring-boot),
pero el HTML no incluye los nodos del diagrama, así que no los uso como evidencia.

---

## Resumen ejecutivo

1. **Las horas declaradas no corresponden al contenido.** El track de Java declara 100,5 h y los subtemas suman
   ≈ 60 h. Spring Boot declara 134,5 h y suma ≈ 67 h. La relación track/contenido va de ×0,5 (Java M0: declara 2 h 30,
   el contenido son 4 h 40) a ×5,6 (Java M18: 8 h frente a 85 min). RutaFlow declara 96 h y ninguno de sus 29 temas
   tiene duración.
2. **Spring Boot tiene siete pares de módulos o temas duplicados.** En cuatro casos los dos usan el **mismo laboratorio**
   (M8↔M21, M8 T6↔M25, M10 T9↔M23, y M16/M17 con el `java-jpa-lab` de Java M16/M17). Fusionarlos reduce el curso de
   27 a 21 módulos sin perder temas.
3. **Spring Boot no enseña lo nuevo de Boot 4 y Framework 7**, aunque está fijado a 4.1.2: versionado de API,
   `@Retryable`/`@ConcurrencyLimit`, Jackson 3, HTTP Service Clients con `@ImportHttpServices`, `JdbcClient`,
   `@ServiceConnection` y `RestTestClient`. Tampoco cubre AOP, SpEL ni BeanPostProcessor, que entran en la
   certificación. El track promete AOP, `@Qualifier`, BeanPostProcessor y Authorization Server y la lección no los
   menciona ni una vez.
4. **A Java le faltan objetivos del examen 1Z0-830/831**: `Deque`/`Queue` (0 apariciones en todo el curso),
   `java.lang.IO`, `import module`, constructores flexibles y *pinning* de virtual threads. El orden contradice las
   dependencias: `equals/hashCode` llega en M22 aunque M2 lo necesita, y `record` se enseña en M7 aunque M0 y M4 ya lo usan.
5. **Microservicios** tiene dos módulos sólidos, pero no cubre los patrones que el dueño pidió (Strangler Fig, BFF y
   CQRS: 0 apariciones). Esos patrones se enseñan dispersos dentro de Spring Boot (M10, M13, M15, M21 a M23). Abajo
   propongo un temario de 12 módulos que separa el patrón (Microservicios) de su implementación en Spring (Spring Boot).
6. **RutaFlow no integra lo que enseñan Java y Spring Boot.** Su backend es Node, y el propio M7 lo reconoce:
   `rutaflow/modulo-7.md:305` dice «RutaFlow no lo construye en módulos anteriores (su backend del Módulo 2 es Node)».
   El track anuncia Spring Boot en M2 y M6 (`rutaflow.track.ts:22`, `:49`), y la lección lo menciona 1 y 0 veces.
7. **Las versiones están desalineadas entre cursos.** Java usa 25 LTS en M0 y M14, pero «JDK 27» en las etiquetas de
   M19–M22. Microservicios fija JDK 27.0.1 (19 veces), que no es LTS y ya tiene un parche posterior. RutaFlow pide
   «Java 27» y luego dice «Java 11+». Spring Boot M22 pide Node.js 20, que está en EOL. Siete laboratorios Spring
   compilan para Java 21 o 27 en lugar de 25.

---

## 1. Java (23 módulos, 117 temas)

### 1.1 Hallazgos

| Aspecto | Hallazgo (cita o fuente) | Impacto | Propuesta |
|---|---|---|---|
| Cobertura | `Deque`, `Queue`, `ArrayDeque` y `PriorityQueue`: 0 apariciones en `java/*.md`. El examen 1Z0-830 incluye «Lists, Sets, Maps, and Deques» (fuente 1Z0-830). El track también lo promete: `java.track.ts:32` «Queue, Deque y ConcurrentHashMap». | Alto. Es un objetivo de certificación y una estructura de uso diario. | Añadir un tema a M2: «Colas y pilas: `Deque`, `ArrayDeque`, `PriorityQueue`». |
| Cobertura | De las novedades finales de Java 25 que el 1Z0-831 probablemente evaluará, faltan `import module` (JEP 511), constructores flexibles (JEP 513) y la clase `java.lang.IO` (0 apariciones de `IO.println` o `import module`). Solo JEP 512 aparece, en `modulo-0.md:382`. | Medio. El curso declara Java 25 como base (`modulo-14.md:622`) pero enseña su sintaxis nueva solo a medias. | Un subtema en M0 (JEP 511/512 e `IO`) y otro en M1 (JEP 513). |
| Cobertura | Virtual threads sin *pinning*: 0 apariciones de «pinning», «anclaje» o «JEP 491». M5 T3 enseña virtual threads sin explicar qué cambió en Java 24. | Medio. El modelo mental queda desactualizado (`synchronized` ya no ancla). | Añadir el subtema «`synchronized` y virtual threads antes y después de JDK 24» en M5 T3. |
| Cobertura | No hay herramientas del día a día: `jshell` (0), `System.Logger`/`java.util.logging` (0) y Javadoc (1 mención de paso en M22). El 1Z0 incluye «console I/O»; `Scanner` aparece solo en M0. | Bajo o medio. | Un tema breve en M0 (jshell) y uno en M15 (Javadoc y `System.Logger`, antes de SLF4J). |
| Sobra u obsoleto | M6 enseña Jackson 2 (`modulo-6.md:160` `com.fasterxml.jackson.core`, `:274` «la versión indicada es Jackson 2.x»), pero Spring Boot 4.1.2, el curso siguiente, usa Jackson 3.1.7 (`tools.jackson`) por defecto (Migration Guide). | Medio. Las dos rutas consecutivas enseñan APIs incompatibles. | Migrar M6 a Jackson 3 y explicar las diferencias de paquete en un subtema de «compatibilidad». |
| Sobra u obsoleto | El título y el track de M9 dicen «JUnit 5» (`java.track.ts:126`, `:128`, `:192`, `:217`), pero la lección usa JUnit Jupiter 6.0.2 (`modulo-9.md:10`) y `archunit-junit6` (`modulo-15.md:196`). Boot 4.1.2 gestiona JUnit 6.0.3. | Bajo. Confunde al buscar documentación. | Renombrar a «JUnit 6 (Jupiter)» en track y títulos. |
| Promesa/contenido | Conceptos del track con 0 apariciones en su módulo: M2 `@SafeVarargs`, `Deque`, `ConcurrentHashMap` (`:32`); M4 `peek`, `distinct`, `skip`, `groupingBy`, `partitioningBy`, `joining` y `@FunctionalInterface` (`:58`), que en realidad están en M20 o en ninguna parte; M5 `CyclicBarrier`, `ScheduledExecutorService` e `invokeAll` (`:73`); M6 Gson (`:88`); M9 AssertJ, Hamcrest, `@TestFactory` y `@MethodSource` (`:128`); M11 jconsole, jvisualvm, jstat y jmap (`:153`); M15 Log4j2 y Hamcrest (`:217`); M18 «Sockets TCP y UDP» y la práctica «Firma y cifra … con AES-GCM y ECDSA» (`:250`, `:256`): `ServerSocket`, `UDP` y `Signature` tienen 0 apariciones. | Alto. El estudiante ve en la ficha temas que no existen. Diecinueve promesas sin contenido. | Regenerar `concepts`/`challenges` desde los `### Tema` reales, o escribir lo que falta (prioridad: `Deque`, sockets, firma ECDSA). |
| Promesa/contenido | La ruta de 17 pasos de M0 (`modulo-0.md:40-58`) tiene mal tres enlaces. «La numeración salta del paso 9 al 11» (`:33`). El paso 11 «JPA / Hibernate» enlaza con el tema de pruebas `@DataJpaTest` de Spring Boot M6, no con JPA. El paso 12 «Microservicios» enlaza con el integrador de Spring Boot M12, no con el curso Microservicios. | Medio. Es la primera pantalla del curso. | Reenumerar del 1 al 16, enlazar JPA a Java M16 o Spring Boot M3 y Microservicios a `/curso/microservices/0`. |
| Solapamiento | (ya señalado: M4↔M20, M9↔M15 T4, M8 T3↔M15 T3.) Nuevo: **Java M16 y M17 comparten laboratorio con Spring Boot M16 y M17** (`examples/java-jpa-lab`). Java M16 tiene 8 temas de JPA/Hibernate (EntityManager, Criteria, Querydsl, EntityGraph, bloqueos, Testcontainers) que el curso Spring Boot vuelve a cubrir en M3 y M16. | Alto. Hay tres cursos de JPA para un mismo estudiante. | JPA solo en Spring Boot (M3 fusionado). Java M16 queda como «JPA sin Spring» reducido a 3 temas (estados del EntityManager, mapeo y JPQL) o se mueve a Spring Boot. |
| Solapamiento | Proxies y autoinvocación de `@Transactional` aparecen en Java M19 T6, Spring Boot M13 T1, M17 T2 y M26 T1. | Medio. | Java M19 T6 explica el proxy dinámico; Spring Boot enseña la consecuencia en un solo tema (M13 T1) y los demás remiten a él. |
| Progresión | `record` se usa en M0 (`modulo-0.md:568`, `:807`) y M4 (`modulo-4.md:33`) antes de enseñarse en M7. `equals/hashCode` se aplaza explícitamente de M2 a M22 (`modulo-2.md:12`, `:412`). Enums con estado y clases anidadas, que el 1Z0 incluye en «OO concepts», están en M22, el último módulo. | Alto. Es lo contrario de enseñar el prerrequisito antes de la API. | Mover M7 (records, sealed, patterns) después de M1 y M22 T1–T2 (igualdad) antes de M2. |
| Progresión | El integrador M13 llega antes que nueve módulos (M14–M22), así que no integra JPA, JDBC, HTTP, i18n, BigDecimal ni compatibilidad de APIs. Las etapas no siguen la numeración: M20 es «Aplicación» y va después de varios «Experto» (ya señalado). | Alto. | Renumerar: Fundamentos (0–3, 7, 22), Aplicación (4/20 fusionados, 5, 6, 19), Integración (8, 9/15, 17, 16, 18), Experto (10, 11, 12, 14, 21) y un integrador final. |
| Carga | Track = 100,5 h; subtemas ≈ 60 h (3 592 min). Casos extremos: M0 2 h 30 declaradas frente a 280 min de subtemas (×0,5); M13 6 h frente a 90 min (×4); M14 7 h frente a 120 min (×3,5); M18 8 h frente a 85 min (×5,6); M19 10 h frente a 210 min (×2,9); M17 3 h frente a 60 min (×3). Ver `/tmp/aud2/horas.py`. | Medio. La planificación del estudiante queda mal hecha. | Derivar `duration` del track de la suma de subtemas más el tiempo de laboratorio, con un tope de ×1,5. |
| Versiones | Base Java 25 LTS en M0 (`modulo-0.md:8`) y M14 (`:622`), pero `'JDK 27'` como herramienta en M19–M22 (`java.track.ts:267`, `:290`, `:304`, `:318`). La tagline dice «de Java 8 a Java 27» (`course-data.ts:880`). JDK 27 no es LTS (Oracle Roadmap). | Medio. El estudiante no sabe qué JDK instalar. | Usar «JDK 25 LTS» en todo el curso; «JDK 27» solo en subtemas marcados como «novedad no LTS». |
| Versiones | Un solo curso exige tres versiones de Gradle: «Gradle 9.1 o posterior» (`modulo-0.md:26`), Gradle 9.8.2 en los laboratorios de Spring (`spring-boot/modulo-0.md`) y el `gradle init` de M0. | Bajo. | Fijar una sola versión mínima de Gradle para todos los cursos JVM en un spec de versiones. |
| Experiencia | La primera pantalla de M0 lista Kafka, Kubernetes, AWS y diseño de sistemas (`modulo-0.md:54-58`) y remite a SQL de otro curso (paso 07). M0 tiene 8 temas y 28 subtemas (4 h 40): es el módulo de entrada más largo de los cuatro cursos. | Medio. Desanima en el primer contacto. | Dividir M0 en «M0a: entorno y primer programa» (T1–T3) y «M0b: tipos y control de flujo» (T4–T8). Mover la ruta de 17 pasos a una página aparte. |

### 1.2 Cambios de temario propuestos para Java (para aprobación, por prioridad)

1. **Reordenar por dependencias** (sin escribir temas nuevos): M7 (records/sealed/patterns) pasa a ser el módulo 2;
   M22 T1–T2 (equals/hashCode, claves mutables) entran antes de Colecciones; el integrador M13 pasa al final.
2. **Fusionar duplicados**: M4 + M20 → un módulo «Programación funcional y Streams» de unos 10 temas. Se quitan
   M4 T1–T3 porque los repiten M20 T3, T6–T11. M9 + M15 T4–T5 → «Pruebas». M8 + M15 T1–T3 → «Build».
3. **Retirar la triple cobertura de JPA**: Java M16 se reduce a 3 temas sin Spring, o se elimina y remite a Spring Boot.
4. **Temas nuevos para la certificación 1Z0-830/831**: `Deque`/`Queue`/`PriorityQueue`; Java 25 en el lenguaje
   (JEP 511/512/513 e `IO`); virtual threads sin *pinning*; sockets TCP/UDP y firmas (ya prometidos en M18).
5. **Actualizar**: Jackson 3 en M6; «JUnit 6» en títulos; «JDK 25 LTS» como única versión base.
6. **Recalcular la duración** de los 23 módulos a partir de los subtemas.

---

## 2. Spring Boot (27 módulos, 121 temas)

### 2.1 Hallazgos

| Aspecto | Hallazgo (cita o fuente) | Impacto | Propuesta |
|---|---|---|---|
| Cobertura (cert.) | La guía 2V0-72.22, sección 1, incluye AOP, SpEL y BeanFactoryPostProcessor/BeanPostProcessor. En `spring-boot/*.md` hay 0 apariciones de `@Aspect`, `@Around`, `BeanPostProcessor`, `SpEL` o `#{`. El track M0 sí los promete: `spring-boot.track.ts:6` «AOP con @Aspect y @Around», «BeanPostProcessor», «@Qualifier y @Primary» (también 0 apariciones). | Alto. Es la base para entender `@Transactional`, `@Async` y la seguridad de métodos, todos proxies. | M0 T5 «Proxies y AOP: @Aspect, @Around, BeanPostProcessor» y M0 T6 «Varias implementaciones: @Qualifier, @Primary y listas de beans». |
| Cobertura (Boot 4 / Framework 7) | Versionado de API, autoconfigurado desde Boot 4.0 (`spring.mvc.apiversion.*`, `ApiVersionStrategy`): 0 apariciones de `ApiVersion`/`apiversion`. Las 6 menciones de «versionado» son de otras cosas. El track M4 lo promete (`:59`, ya señalado). | Alto. Es la forma oficial actual y el track la anuncia. | Tema nuevo en M2: «Versionado de API con `ApiVersionConfigurer`: header, path y media type, más cabeceras `Deprecation`/`Sunset`». |
| Cobertura (Framework 7) | `@Retryable`, `@ConcurrencyLimit` y `@EnableResilientMethods` (Framework 7.0, docs Resilience): 0 apariciones. Toda la resiliencia se enseña con Resilience4j (M10 T3, M15 T4). | Medio. Falta enseñar la opción integrada y cuándo basta. | Subtema en M10 T3: «Reintento con `@Retryable` frente a Resilience4j: qué aporta cada uno». |
| Cobertura (Boot 4) | Jackson 3 (`tools.jackson`, `JsonMapper`): 0 apariciones. M4 usa `com.fasterxml.jackson.databind.ObjectMapper` en un test (`modulo-4.md:920`, `:937`), aunque el preferido de Boot 4 es Jackson 3 (Migration Guide). | Medio. Enseña la API que Boot marca como de transición. | Subtema de serialización en M2 con Jackson 3 y cambiar el test de M4. |
| Cobertura (Boot 4) | Faltan otras herramientas de desarrollo y prueba de Boot 3.1+ y 4: `@ServiceConnection` y `spring-boot-docker-compose` (0), `JdbcClient` (0), `RestTestClient` (0), `@ImportHttpServices` (0; `@HttpExchange` solo en M10) y `spring.threads.virtual.enabled` (0; el track M9 promete «Virtual threads como alternativa a WebFlux», `:129`). | Medio. | Un tema por herramienta en el módulo donde encaja: Docker Compose en M1, `JdbcClient` en M17, `RestTestClient` en M6 y virtual threads en M9. |
| Cobertura (seguridad) | El JWT se implementa con un filtro propio y JJWT 0.13.0 (`modulo-4.md:242-281`). `oauth2ResourceServer`/`JwtDecoder`, la vía estándar de Spring Security, tiene 0 apariciones. Spring Authorization Server también tiene 0, aunque el track M18 lo promete (`:248` «Tu propio OAuth2 Authorization Server»), igual que los «refresh tokens». | Alto. El estudiante aprende a escribir criptografía de tokens a mano en lugar de configurar el resource server. | M4 T2 pasa a `oauth2ResourceServer().jwt()` con una clave de prueba. El filtro propio queda como «por qué no». M18 cubre emisor OIDC, refresh y Authorization Server, o se quita la promesa. |
| Cobertura (datos) | Liquibase (0, prometido en M3), auditoría JPA (`@CreatedDate`/`@EnableJpaAuditing`: 0) y Specifications (1 mención de paso) (ya señalado). Spring Data JDBC: 0. | Bajo o medio. | Liquibase se puede quitar del track: Flyway basta. Auditoría y Specifications, un subtema cada uno en M3. |
| Sobra | Las 0 apariciones de `RestTemplate` son un acierto, porque Framework 7.1 lo depreca ([spring.io](https://spring.io/blog/2025/09/30/the-state-of-http-clients-in-spring)). La guía 2V0-72.22 (2024) todavía lo pide. | — | Mantenerlo fuera. Basta una nota de «lectura de código heredado». |
| Sobra | M20 mezcla scheduling, correo, SOAP, Spring AI, RAG y MCP (9 temas) (ya señalado). Spring AI/RAG/MCP no pertenece a «Integraciones Spring». | Medio. | Sacar T7–T9 a un módulo «Spring AI» opcional o al curso nuevo «IA aplicada al desarrollo» (`specs/013`). |
| Promesa/contenido | Además de M1–M4 y M16 (ya señalados): M6 promete `@MockitoSpyBean`, `TestRestTemplate`, `ArgumentCaptor`, `@JsonTest`, `@RestClientTest` y `@TestConfiguration` (`:85`), todos con 0 apariciones. `TestRestTemplate` ya no se autoconfigura en Boot 4 (Migration Guide). M7 promete «Tracing … @Observed, traceId/spanId» (`:98`): 0 en M7, aunque está en M10 T11. M18 promete refresh, Authorization Server, HttpClient y OWASP (`:248`): 0. M19 promete particionado, `FlatFileItemReader`, `JdbcPagingItemReader` y scheduling (`:262`): 0. M0 pide «Investiga qué hace spring-boot-starter-web» (`:12`) y M1 «starters web» (`:21`), pero en Boot 4 ese starter está deprecado a favor de `spring-boot-starter-webmvc`, como dice la propia lección (`modulo-1.md:163`). | Alto. Hay más de veinte promesas sin contenido. | Regenerar los arrays del track desde los temas reales. Cambiar `starter-web` por `starter-webmvc`. Quitar `TestRestTemplate` y prometer `RestTestClient`. |
| Solapamiento | Siete solapamientos, con detalle en 2.2. | Alto. | Fusión propuesta en 2.2. |
| Progresión | Los módulos del bloque «Experto» M7–M15 se intercalan con módulos «Integración» (M16, M17, M20) (ya señalado). Nuevo: JDBC (M17) va después de JPA (M3 y M16), y M17 T2 enseña `@Transactional` básico después de que M13 T1 enseñe la autoinvocación. El integrador M12 no puede integrar M13–M26 (mensajería avanzada, Modulith, GraphQL, Batch). | Alto. | Orden propuesto en 2.3. |
| Carga | Track = 134,5 h; subtemas ≈ 67 h (4 019 min). Casos extremos: M14 12 h frente a 208 min (×3,5); M15 12 h frente a 258 min (×2,8); M12 7 h frente a 114 min (×3,7); M13 8 h frente a 140 min (×3,4); M21 7 h frente a 85 min (×4,9); M22 8 h frente a 96 min (×5); M18 4 h 30 frente a 70 min (×3,9); M19 4 h frente a 70 min (×3,4). Al revés, M2 declara 3 h para 225 min. | Medio. | Igual que en Java: duración derivada y tope de ×1,5. |
| Versiones | El curso fija Boot 4.1.2 y JDK 25 (29 y 35 menciones), y 4.1.2 es la GA vigente (spring.io). Desvíos encontrados en los laboratorios: `spring-stream-rutaflow` usa Boot 4.0.9 y Java 21 (ya señalado). Cinco laboratorios más compilan para **Java 21**: `spring-eventsourcing`, `spring-resilience`, `spring-saga`, `spring-saga-recovery`, `spring-security-keycloak` y `spring-token-relay` (`<java.version>21`). `spring-ssrf` compila para **27**. M22 pide «Node.js 20 o superior» (`modulo-22.md:17`, `:187`, `:193`, `:348`, `:354`), y Node 20 está en EOL (nodejs.org). | Medio. Un laboratorio para Java 27 no compila con el JDK 25 que pide M0. | Unificar los 50 `pom.xml` y `build.gradle` en Java 25 y Boot 4.1.2, y pedir Node 24 LTS. Añadir a `validate.sh` una comprobación de versión en `examples/*/pom.xml`. |
| Versiones (a futuro) | Boot 4.2.0-RC1, Framework 7.1.0-RC1 y Spring Cloud 2026.0.0-RC1 ya están publicados (InfoQ, 19-oct-2026). Los labs de Cloud usan 2025.1.4 y el track cita «Spring Cloud 2025.1» (`:353`), que es correcto para Boot 4.1. | Bajo hoy. | Abrir un spec de migración a 4.2 cuando salga la GA, con una práctica de compatibilidad (`METODOLOGIA`, «Mantenimiento tecnológico»). |
| Experiencia | M0 es correcto en entorno (ya señalado), pero en la primera pantalla aparecen Gradle 9.8.2, `docs/spring-gradle-labs.json`, AOT, BOM y `annotationProcessor` (`modulo-1.md:44-45`, ya señalado). El mapa muestra 27 módulos, 20 de ellos «Experto». | Medio. | Con la fusión el curso baja a 21 módulos. Mover la nota de Gradle a un apéndice. |

### 2.2 Duplicados en Spring Boot: identificación y fusión propuesta

| # | Par duplicado | Evidencia | Fusión propuesta |
|---|---|---|---|
| D1 | **M8 T1–T3 ↔ M21 T1–T3** (Kafka) | Los dos usan `examples/spring-kafka-rutaflow`. M8 Subtema 1.1 «Publica el evento con la clave del envío» (`modulo-8.md:15`) y M21 Subtema 1.1 «Publica el evento con la key del envío» (`modulo-21.md:16`) abren los mismos archivos `EnvioCreado.java` y `EnvioEventPublisher.java`. M8 T2 «Dead-letter queue» repite M21 T2 «Reintentos, DLT…». | **Eliminar M21.** Su único aporte, «Outbox transaccional y flujo de negocio» (T3), pasa a M8 como T4. M8 se divide en «M8 Kafka» (T1–T4, T7 Streams, T8 Avro) y «M8b RabbitMQ, JMS y binders». |
| D2 | **M8 T6 ↔ M25** (Spring Cloud Stream) | Los dos usan `examples/spring-stream-rutaflow` y `RouteFunctions.java` (`modulo-8.md:774`, `modulo-25.md:22`). | **Quitar M8 T6** y conservar M25, con sus 4 temas, dentro de «M8b». |
| D3 | **M3 T2 ↔ M16 T2** (N+1) y M3 T1 ↔ M16 T1 (relaciones) | M3 T2 «El problema N+1 y su corrección» (`modulo-3.md:192`) y M16 T2 «LAZY, EAGER, N+1…» (`modulo-16.md:119`) cuentan las mismas consultas sobre Cliente/Pedido. M16 usa además `examples/java-jpa-lab`, el mismo laboratorio de Java M16. | **Fusionar M16 en M3** («Spring Data JPA I y II»). De M16 se conservan EntityGraph, `LazyInitializationException` y proyecciones de resumen. |
| D4 | **M4 ↔ M18** (Security) | M4 T1 «SecurityFilterChain moderno» frente a M18 T1 «SecurityFilterChain y autorización». M4 T2 «Filtro JWT» frente a M18 T2 «…JWT/OIDC». M4 T4 SSRF frente a M18 T2 «filtrar destinos de llamadas salientes» (`modulo-18.md:110`). Los dos usan `examples/spring-ssrf`. | **M4 = Seguridad I** (cadena, autenticación, roles, CORS/CSRF, resource server JWT). **M18 = Seguridad II** (OIDC con Keycloak, seguridad de métodos, SAML y Authorization Server). El SSRF queda solo en M4. |
| D5 | **M10 T9 ↔ M23** (Modulith) | Los dos usan `examples/spring-modulith-rutaflow`. M10 T9 «Comprueba módulos antes de separar servicios» frente a M23 T1 «módulos y límites entre paquetes». También se solapa con Microservicios M1 T9–T11 (ArchUnit). | **Quitar M10 T9.** M23 queda como el único tema de Modulith, con remisión a Microservicios M1. |
| D6 | **M15 T3 + M15 T8 ↔ M22 T1** (hexagonal/clean) | M15 T3 «Arquitectura hexagonal verificada con ArchUnit», M15 T8 «Clean Architecture y DDD táctico» y M22 T1 «Hexagonal: puertos…». Además, Microservicios M1 T5–T6 enseña puertos y adaptadores. | **Un solo módulo de Arquitectura** (M22) con hexagonal, verificación con ArchUnit, C4 y ADR. M15 deja de ser un módulo de mezcla. |
| D7 | **M7 T3 ↔ M11 T3** (liveness/readiness) y **M10 T12 ↔ M13 T3** (contract testing) | M7 T3 «Liveness y readiness sin reinicios en cadena» frente a M11 T3 «Health checks para Kubernetes»: las mismas sondas `/actuator/health/{liveness,readiness}`. M10 T12 «Contract testing entre productor y consumidor» frente a M13 T3 «Contratos ejecutables protegen despliegues independientes». | M11 T3 se reduce al manifiesto de Kubernetes y remite a M7 T3. M13 T3 se fusiona con M10 T12. |

Otros solapamientos menores: `@Transactional` y autoinvocación (M13 T1, M17 T2, M26 T1); Resilience4j (M10 T3, M15 T4);
sagas (M10 T8 Temporal, M15 T5, M15 T7); idempotencia (M8 T3, M13 T2, M21 T2). Para cada uno, un tema canónico
y remisiones desde los demás.

### 2.3 Cambios de temario propuestos para Spring Boot (para aprobación, por prioridad)

1. **Fusiones D1–D7**: el curso pasa de 27 a 21 módulos sin perder temas únicos.
2. **Orden por dependencias** (propuesto): 0 IoC/DI + AOP → 1 Proyecto, configuración y Docker Compose
   (fusiona M1 con M5 T1–T2) → 2 Web REST (+ versionado de API, Jackson 3) → 3 Datos JDBC (M17, con `JdbcClient`) →
   4 Spring Data JPA (M3 + M16) → 5 Errores y configuración (M5 T3–T4) → 6 Pruebas (+ `RestTestClient`,
   `@ServiceConnection`) → 7 Seguridad I → 8 Observabilidad → 9 Integraciones (M20 sin IA) →
   10 Concurrencia, `@Async` y virtual threads (M26 + M20 T5) → 11 Mensajería Kafka → 12 RabbitMQ/JMS/Stream →
   13 Batch → 14 WebFlux → 15 GraphQL → 16 Arquitectura y Modulith (M22 + M23 + M15 T3/T8) →
   17 Spring Cloud (M10 sin T9) → 18 Consistencia distribuida (M13 + M15 T5–T7) → 19 Seguridad II →
   20 Empaquetado y despliegue → **21 Integrador final** (M12 + M14, al final y construido, no prefabricado).
3. **Temas nuevos de Boot 4 / Framework 7**: versionado de API; `@Retryable`/`@ConcurrencyLimit`; Jackson 3;
   HTTP Service Clients con `@ImportHttpServices`; `JdbcClient`; `RestTestClient`; virtual threads en MVC.
4. **Temas de certificación**: AOP y proxies; `@Qualifier`/`@Primary`; SpEL en `@Value` y `@PreAuthorize`;
   propagación transaccional (`REQUIRES_NEW`, 1 sola mención hoy); seguridad de endpoints de Actuator (0 hoy).
5. **Resource server estándar** en lugar del filtro JWT propio.
6. **Sacar Spring AI, RAG y MCP** a un módulo opcional o al curso «IA aplicada al desarrollo».
7. **Unificar las versiones de los laboratorios** (Java 25, Boot 4.1.2, Node 24) y añadir la comprobación a `validate.sh`.

---

## 3. Microservicios (2 módulos, 24 temas)

### 3.1 Hallazgos

| Aspecto | Hallazgo (cita o fuente) | Impacto | Propuesta |
|---|---|---|---|
| Cobertura | Strangler, BFF, CQRS, API Gateway, Saga, outbox, circuit breaker y despliegue: 0 apariciones en `microservices/*.md`. Son categorías centrales de [microservices.io](https://microservices.io/patterns/index.html) y del [Azure Architecture Center](https://learn.microsoft.com/en-us/azure/architecture/patterns/). El dueño los pidió (`specs/013…md:11`, criterio P6 pendiente). | Alto. El curso termina antes de distribuir nada. | El temario completo de 3.2. |
| Cobertura | Lo que existe es sólido y está bien elegido como fundamento: falacias, deadlines, idempotencia, relojes, orden por versión, evolución de contratos, monolito modular y criterios de extracción. Coincide con «Monolithic architecture» y «Decompose by business capability» de microservices.io. | — | Conservar M0–M1 como base. |
| Promesa/contenido | Las herramientas del track M0 incluyen «OpenTelemetry» (`microservices.track.ts:17`), pero aparece 1 sola vez en `modulo-0.md`. El resto del track coincide con los temas, porque se registra «sólo… cuando su lección real supera la puerta editorial» (`:3`). | Bajo. | Quitar OpenTelemetry de M0 y dejarlo para el módulo de observabilidad. |
| Solapamiento | Los patrones distribuidos se enseñan hoy dentro de Spring Boot: gateway, discovery, config y contratos en M10; outbox, idempotencia y SLO en M13; saga, Event Sourcing y CQRS en M15 (track `:217-218`); hexagonal en M22; Modulith en M23. Microservicios M1 T5–T11 (puertos, ArchUnit, ciclos) repite Spring Boot M15 T3 y M22–M23, con el mismo laboratorio: `examples/archunit-hexagonal-rutaflow` en Microservicios M1 y Spring Boot M15. | Alto. Sin una frontera clara, el temario nuevo duplicaría más. | **Regla de reparto:** Microservicios enseña el patrón, sus decisiones y fallos con Java simple, HTTP y PostgreSQL. Spring Boot enseña cómo implementarlo con Spring y remite al tema del patrón. |
| Progresión | No hay prerrequisitos de curso declarados, pero M1 usa ArchUnit, Maven y un `rutaflow.jar` (`modulo-1.md:25`). | Medio. | Declarar como prerrequisito Java M0–M3 + M8 (build) + M9 (pruebas). |
| Carga | Declara 23 h y los temas suman 16,7 h. Los 6,3 h restantes corresponden a los dos proyectos de cierre de 3 h (`modulo-0.md:1421`). Es coherente. | — | Mantener. |
| Versiones | «JDK 27.0.1» aparece 19 veces y «Java 27» 6 veces (`modulo-0.md:37` y otras). JDK 27 no es LTS y su soporte termina con JDK 28 (marzo de 2027, Oracle Roadmap). Ya existe 27.0.1.1 (17-nov-2026). M1 T14 pide «JDK 21 o superior» (`modulo-1.md:1012`, ya señalado). | Medio. El curso caduca en 4 meses y contradice a Java y Spring Boot (25 LTS). | «JDK 25 LTS o posterior» sin fijar el parche. |
| Experiencia | El primer módulo no presupone frameworks (`modulo-0.md:3`) y crea `academia-labs/microservices` desde cero: es el mejor primer contacto de los cuatro cursos. «Release train» y «alta cardinalidad» siguen sin definirse (ya señalado). | Bajo. | Mini glosario al inicio de M0. |

### 3.2 Temario completo propuesto para Microservicios (para aprobación del dueño)

Principios: cada módulo extiende el mismo **RutaFlow modular** de M1. Primero se extrae un servicio y después se
añaden capacidades, con evidencia en cada tema. Los temas duran 20–45 min y tienen 3–6 subtemas (`METODOLOGIA`).
Columna «Spring»: el tema de Spring Boot que implementa el patrón, que debe remitir aquí y no repetir la teoría.

| Mód. | Título | Etapa · horas | Temas (propuestos) | Spring |
|---|---|---|---|---|
| 0 | Antes de distribuir: proceso, red y falacias | Fundamentos · 11 h | Existente (10 temas) | — |
| 1 | Monolito modular antes de extraer | Fundamentos · 12 h | Existente (14 temas). Mover T14 (DDD) a la posición 3 (ya señalado). | M23 |
| **2** | **Migrar sin reescribir: Strangler Fig y capa anticorrupción** | Aplicación · 9 h | T1 Elegir la primera costura con las señales de M1 T12 y la ley de Conway · T2 **Strangler Fig**: proxy de enrutamiento que manda `/cotizaciones` al servicio nuevo y el resto al monolito · T3 **Capa anticorrupción**: traducir el modelo heredado sin contaminar el nuevo · T4 Separar los datos: base por servicio, sin doble escritura · T5 Ejecución en paralelo y comparación de respuestas antes del corte · T6 Revertir el enrutamiento y retirar el código heredado. Fuentes: [Fowler](https://martinfowler.com/bliki/StranglerFigApplication.html), [Azure Strangler Fig](https://learn.microsoft.com/en-us/azure/architecture/patterns/). | — |
| **3** | **APIs hacia clientes: Gateway, BFF y composición** | Aplicación · 9 h | T1 Gateway: enrutamiento y descarga de responsabilidades (auth, límite de tasa) sin lógica de negocio · T2 **BFF**: un backend para la consola web y otro para la app del conductor, «one experience, one BFF» ([Newman](https://samnewman.io/patterns/architectural/bff/)) · T3 Composición de API con el presupuesto de deadline de M0 T3 · T4 Respuesta degradada ante un fallo parcial · T5 Versionado y deprecación de la API pública (RFC 9745/8594) · T6 Identidad en el borde: propagar o intercambiar el token. | M10 T2, T4 |
| **4** | **Mensajería fiable entre servicios** | Integración · 10 h | T1 Mensaje frente a llamada: acoplamiento temporal · T2 Outbox transaccional con *polling publisher* en PostgreSQL · T3 *Transaction log tailing* (CDC): qué cambia y qué cuesta · T4 Consumidor idempotente e inbox · T5 Orden por clave, reintentos y DLQ · T6 Evolución de esquemas de eventos (extiende M0 T8). | M8, M13 T2 |
| **5** | **Datos distribuidos: Saga, CQRS y Event Sourcing** | Integración · 12 h | T1 Base por servicio y consultas que cruzan servicios · T2 Saga coreografiada · T3 Saga orquestada y compensación que falla · T4 **CQRS**: modelo de escritura frente a vista materializada para el tracking público · T5 Consistencia eventual visible: leer lo propio escrito, versión en la respuesta · T6 Event Sourcing: cuándo sí y cuándo no, *replay* y *snapshots*. | M15 T5–T7, M10 T8 |
| **6** | **Resiliencia y control de carga** | Integración · 8 h | T1 Reintento con *backoff*, *jitter* y presupuesto de reintentos · T2 Circuit breaker · T3 Bulkhead y límite de concurrencia · T4 Limitación de tasa y descarte de carga · T5 Nivelación con cola (*queue-based load leveling*) · T6 Probar la resiliencia inyectando fallos. | M10 T3, M15 T4 |
| **7** | **Pruebas de un sistema distribuido** | Integración · 8 h | T1 Pirámide adaptada: unidad, componente y contrato · T2 *Service component test* con dependencias reales en contenedor · T3 Contratos guiados por el consumidor · T4 Pruebas del broker y de duplicados · T5 Entorno efímero y datos de prueba. | M10 T12, M13 T3 |
| **8** | **Observabilidad y operación** | Experto · 8 h | T1 Propagación de traza W3C `traceparent` con OpenTelemetry · T2 Métricas RED y cardinalidad · T3 Logs correlacionados y de auditoría · T4 *Health Check API* y dependencias · T5 SLI/SLO y *burn rate* · T6 Runbook y postmortem de un fallo parcial. | M7, M10 T11 |
| **9** | **Despliegue y plataforma** | Experto · 8 h | T1 Un servicio por contenedor y configuración externalizada · T2 Descubrimiento en el cliente frente al servidor · T3 Estrategias: *rolling/ramped*, *blue-green*, *canary* y *feature flags* (enlazar con el tema *ramped* de DevOps, `specs/013`) · T4 *Sidecar* y *service mesh*: cuándo compensan · T5 Despliegue independiente con contrato verificado. | M11 |
| **10** | **Seguridad entre servicios** | Experto · 6 h | T1 *Access token* y propagación de identidad · T2 Autorización por servicio (mínimo privilegio) · T3 mTLS y confianza cero · T4 Secretos y rotación. | M18 |
| **11** | **Proyecto integrador** | Experto · 10 h | Extraer Cotización de RutaFlow con Strangler Fig, crear el BFF de la app del conductor, publicar el tracking con CQRS y coordinar la asignación con una saga. Rúbrica con evidencias por criterio y solución de referencia plegada. | M21 nuevo (integrador) |

Total propuesto: ≈ 111 h (las 23 h actuales + 88 h nuevas, unos 55 temas). Para aplicar P6 de `specs/013` hacen falta
primero M2 T2 (Strangler), M3 T2 (BFF) y M5 T4 (CQRS). Se pueden escribir antes que el resto si el dueño los aprueba.

---

## 4. RutaFlow (8 módulos, 29 temas)

### 4.1 Hallazgos

| Aspecto | Hallazgo (cita o fuente) | Impacto | Propuesta |
|---|---|---|---|
| Coherencia con los otros cursos | El curso se presenta como «Proyecto de referencia full-stack» (`course-data.ts:872`), pero su backend es Node: M2 tiene 7 bloques `javascript` y 0 `java`. El propio texto lo admite en `modulo-7.md:305`: «RutaFlow no lo construye en módulos anteriores (su backend del Módulo 2 es Node)». En paralelo, Spring Boot M14 promete ser «el backend completo que consume la app móvil» (`spring-boot.track.ts:208`) y 46 laboratorios se llaman `examples/spring-*-rutaflow`. | Alto. Hay dos backends RutaFlow incompatibles y el integrador no integra Java ni Spring. | Decidir un único backend de referencia. Lo recomendado: **Spring Boot**, con la ruta Node como alternativa. M2 parte del integrador final de Spring Boot. |
| Promesa/contenido | M2 anuncia la herramienta «Spring Boot» (`rutaflow.track.ts:22`) y aparece 1 vez, en una frase sobre otra cosa (`modulo-2.md:219`). M6 anuncia «Java, Spring Boot» (`:49`) con 0 menciones de Spring Boot; usa `java Archivo.java` suelto. M1 promete «Auditoría y retención» (`:12`): 0. M5 promete MapLibre y «WebSocket/SSE» (`:39`, `:42`): MapLibre 0, SSE 0. M6 promete «Modela reverso y disputa» (`:47`): «disputa» 0. M2 y M5 anuncian OpenTelemetry (ya señalado para M2). | Alto. | Regenerar el track o escribir lo que falta. Se puede quitar de inmediato: SSE, MapLibre en M5 y «disputa». |
| Cobertura | Como integrador, no ejercita lo central de los cursos previos: mensajería real (M2 T3 usa un outbox en memoria, ya señalado), gateway/BFF, contratos verificados entre servicios ni pruebas de integración del backend Java. M7 T3 «Pruebas end-to-end… (app ↔ backend)» depende del integrador de Spring Boot (`modulo-7.md:305`). | Alto. | Cada módulo de RutaFlow debería declarar qué módulos de Java, Spring Boot y Microservicios integra, en una tabla «integra:». |
| Progresión | Cada módulo exige un stack distinto (SQL → Node → web → Dart → Python → Java → Terraform) bajo un mismo «Conocimiento previo» genérico (ya señalado). Tampoco hay prerrequisitos de curso: un estudiante que llega desde Java no sabe Node, Dart ni Terraform. | Alto. | Declarar como prerrequisitos de entrada Java M0–M9, Spring Boot hasta Seguridad I y Microservicios M0–M1. Los módulos de Flutter, web y Terraform remiten a sus cursos. |
| Carga | Declara 96 h para 29 temas (≈ 3,3 h por tema) y **ningún tema declara duración** (0 de 29). La metodología fija 20–45 min por tema. | Alto. El estudiante no puede estimar ni un módulo. | Declarar la duración de cada tema y de cada subtema. Si hacen falta 96 h, harán falta unos 150 temas, no 29. Lo realista es bajar las horas del track. |
| Versiones | `modulo-0.md:6` pide «Java 27» sin LTS. `modulo-6.md:220` y `:340` dicen «Java 11+ ejecuta un archivo fuente». M2 T4 y M5 T4 piden «Node 24» (`modulo-2.md:405`, `modulo-5.md:353`), mientras M0 dice «Node.js LTS» sin número. En noviembre de 2026 Node 24 sigue siendo LTS, pero 26 es la LTS más reciente (nodejs.org). «Flutter estable» va sin versión. | Medio. | Tabla de versiones en M0 (JDK 25 LTS, Node 24 LTS o posterior, Python 3.12+, Flutter con número) que coincida con los otros cursos. |
| Experiencia | El primer módulo pide instalar siete herramientas antes del primer resultado (`modulo-0.md:6`). Es comprensible para un integrador, pero no avisa de que el curso supone haber terminado otros. | Medio. | Añadir al inicio «Antes de RutaFlow: qué cursos necesitas» y una instalación por módulo («solo lo que este módulo usa»). |

### 4.2 Cambios de temario propuestos para RutaFlow (para aprobación, por prioridad)

1. **Decidir el backend de referencia**: Spring Boot, recomendado, o Node. Con esa decisión, M2 se reescribe
   sobre el integrador final de Spring Boot y M6 se reescribe como módulo Spring, que es lo que promete.
2. **Convertir el curso en integrador real**: cada módulo lleva una tabla «integra:» (curso → módulo → evidencia) y
   reutiliza los patrones de Microservicios M2–M5: Strangler para extraer Cotización, BFF para la app del conductor
   y CQRS para el tracking público.
3. **Ajustar promesas y horas**: quitar SSE, MapLibre en M5, «disputa» y «Auditoría y retención» si no se escriben.
   Declarar la duración de los 29 temas y recalcular el track.
4. **Versiones** alineadas con los demás cursos.

---

## 5. Transversal a los cuatro cursos

### 5.1 Horas declaradas frente a contenido

| Curso | Track | Suma de subtemas o temas | Relación | Temas sin duración |
|---|---|---|---|---|
| Java | 100,5 h | ≈ 59,9 h | ×1,7 | 88 de 117 temas sin duración propia (los subtemas de M0–M20 sí la tienen) |
| Spring Boot | 134,5 h | ≈ 67,0 h | ×2,0 | 73 de 121 temas sin duración propia (todos los subtemas salvo M26 la tienen) |
| Microservicios | 23 h | 16,7 h + 6 h de proyectos | ×1,0 | 0 de 24 |
| RutaFlow | 96 h | sin datos | — | 29 de 29 (y 0 subtemas) |

### 5.2 Matriz de versiones (estado a 2026-11-18)

| Tecnología | Vigente (fuente) | Java | Spring Boot | Microservicios | RutaFlow |
|---|---|---|---|---|---|
| JDK | 25 LTS; 27 sin LTS; próxima LTS 29 (Oracle) | 25 (M0, M14) y 27 (M19–M22) | 25 (6 labs en 21; `spring-ssrf` en 27) | 27.0.1 (y 21 en M1 T14) | 27 y «11+» |
| Spring Boot | 4.1.2 GA; 4.2 en RC (spring.io, InfoQ) | — | 4.1.2 (`spring-stream` 4.0.9) | — | 4.1.2 (M7) |
| JUnit | Jupiter 6.0.3 en Boot 4.1.2 | «JUnit 5» en títulos y 6.0.2 en el código | «JUnit 5» (track) | — | — |
| Jackson | 3.1.7 preferido, 2.21.7 de transición (Boot 4.1.2) | 2.x | 2.x en el test de M4 | — | — |
| Node.js | v20 EOL; 22, 24 y 26 LTS (nodejs.org) | — | «20 o superior» (M22) | — | 24 y «LTS» |

---

## 6. Lista consolidada de cambios para aprobación del dueño (orden de prioridad)

1. **Microservicios M2–M11** (3.2), empezando por los tres temas que pidió el dueño: Strangler Fig, BFF y CQRS.
2. **Backend único de RutaFlow** y reescritura de M2 y M6 sobre Spring Boot (4.2).
3. **Fusionar los duplicados de Spring Boot D1–D7** y reordenar a 21 módulos (2.2, 2.3).
4. **Retirar la triple cobertura de JPA** entre Java M16, Spring Boot M3 y Spring Boot M16, y la doble de JDBC entre Java M17 y Spring Boot M17.
5. **Reordenar Java por dependencias** (records e igualdad antes de colecciones; integrador al final) y fusionar M4/M20, M9/M15 y M8/M15.
6. **Temas nuevos de vigencia**: Spring Boot (versionado de API, `@Retryable`, Jackson 3, resource server, `RestTestClient`, `JdbcClient`, AOP) y Java (`Deque`, novedades de Java 25 en el lenguaje, *pinning*).
7. **Regenerar los arrays `concepts`/`challenges` de los cuatro `.track.ts`** desde los temas reales. Hoy hay más de 45 promesas con 0 apariciones.
8. **Versiones únicas** (JDK 25 LTS, Boot 4.1.2, JUnit 6, Jackson 3, Node 24 LTS o posterior) en las lecciones y en los 50 laboratorios, con una comprobación en `validate.sh`. Abrir un spec de migración a Boot 4.2 y Spring Cloud 2026.0 cuando salga la GA.
9. **Duraciones** derivadas de los subtemas en los cuatro tracks; RutaFlow declara la duración de sus 29 temas.
10. **Primer contacto**: dividir Java M0, corregir la ruta de 17 pasos, crear la página «Antes de RutaFlow» y un mini glosario en Microservicios M0.
