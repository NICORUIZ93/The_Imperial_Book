# Spring Boot: revisión de los 111 temas, uno por uno

Fecha: 11 de noviembre de 2026. Este informe complementa `SPRING-BOOT-CIERRE.md`:
el 100 % anterior medía estructura editorial, no aseguraba claridad absoluta.
Esta revisión encontró y corrigió fallos que el conteo de marcadores no detectaba.

## Respuesta a las preguntas

- **¿Cada subtema existe y desarrolla algo?** Sí: los 393 tienen contenido después
  del encabezado. Se revisó el recorrido de los 111 temas: acción, explicación,
  resultado, error y cierre. Algunos incluyen código completo; otros trabajan
  sobre archivos existentes del laboratorio o proponen un ejercicio independiente.
  Una referencia a un archivo real no es un subtema vacío. El JSON adjunto enumera
  cada subtema, su ubicación y el volumen de prosa/código; ese volumen no califica
  la calidad pedagógica.
- **¿Es lineal?** M0–M7 evolucionan `academia-spring`. M1 genera otro proyecto solo
  para estudiar Initializr. Desde M8 hay laboratorios aislados y M12 reúne un
  corte integrador. M16–M21 refuerzan temas previos con otros casos; la numeración
  no significa que todas las carpetas se fusionen automáticamente. Se aclararon
  esas transiciones, reinicios, dependencias y estados de partida.
- **¿Está con Gradle?** No. La ruta comprobada utiliza Maven. No hay laboratorios
  Spring de este curso con `build.gradle(.kts)` y `gradlew` mantenidos/verificados.
  M22 usa Java directo/Node y el complemento SOAP de M20 usa Python. Una mención a
  Gradle en una explicación no constituye una implementación. Migrar todo requiere
  traducir BOM, procesadores, contratos, perfiles y plugins, y ejecutar sus builds.
- **¿Está actualizada?** La base usa Boot 4.1.2 y Java 25. Se contrastaron sus APIs
  y matrices de compatibilidad con fuentes primarias; se corrigieron tres enlaces
  404, una referencia snapshot y una regla antigua de Avro. Hay versiones fijadas
  deliberadamente: AI mantiene Boot 4.0.9 compatible; los labs espaciales usan
  MySQL 8.0.36, que no es la versión actual. No se declara que todas las imágenes
  de infraestructura estén actualizadas ni libres de vulnerabilidades por compilar.

## Cambios concretos de esta revisión

Se retiró JWT anticipado de M2; se corrigieron continuaciones de línea curl,
imports y dependencias de pruebas Boot 4; los archivos de M6 apuntan ahora al
caso que realmente se ejecuta. M15 T2 vuelve al laboratorio singleton correcto.
Las referencias genéricas al POM se sustituyeron por código o tests que explican
el comportamiento. M12 reconoce sus siete pruebas y la seguridad ya presente
en el laboratorio final. M20 conserva ocho temas con numeración consistente.

El wrapper de Modulith ahora funciona al copiar su carpeta. El script AOT conserva
el log fuera de `target` durante `clean`, para no depender de una compilación previa.
Se corrigieron la instalación de JDK 25, el paquete Java de Initializr, el socket
Podman, el rango inclusivo de páginas y la explicación del default de unión en Avro.

## Evidencia de ejecución

`spring-boot-topic-review-execution.json` registra las comprobaciones dirigidas:
M0–M1 (5 pruebas), referencia acumulativa M2–M7 (43), singleton PostgreSQL (2),
ArchUnit (3) y copia autónoma de Modulith (4): **57 pruebas JUnit**, sin fallos.
La referencia M2–M7 ahora incluye OpenAPI publicado, paginación con límites y orden,
Lombok/MapStruct con políticas explícitas, los tres casos N+1 y más casos negativos.
AOT se comprueba por separado como JVM con metadata, sin afirmar binario nativo.

Estas ejecuciones se suman al registro previo de 47 proyectos Maven, cuyo alcance
está en `spring-boot-lab-verification.json`. No equivalen a ejecutar por separado
cada uno de los 393 ejercicios ni todas sus mutaciones. No se repite aquí la
suite completa de navegador; el cierre anterior con Archify sigue incompleto.
El control de enlaces HTTP tampoco equivale a validar cada afirmación de una página.

## Fuentes primarias y vigencia

| Comprobación | Referencia y resultado |
|---|---|
| Base Boot | [Requisitos Boot](https://docs.spring.io/spring-boot/system-requirements.html): 4.1.2 admite Java 25 y Maven; los labs fijan sus versiones |
| Gradle y JVM | [Compatibilidad Gradle](https://docs.gradle.org/current/userguide/compatibility.html): Java 25 requiere Gradle 9.1+ para ejecutar Gradle; esto no migra el curso |
| Cloud | [Matriz Spring Cloud](https://spring.io/projects/spring-cloud/): 2025.1.2+ admite Boot 4.1; los labs usan 2025.1.4 |
| IA | [Spring AI](https://docs.spring.io/spring-ai/reference/getting-started.html): AI 2.0.x admite Boot 4.0.x y 4.1.x; el ejemplo conserva 4.0.9/2.0.2 |
| OpenAPI | [Springdoc](https://springdoc.org/): referencia y starter 3.2.0 de la línea Boot 4; endpoint probado en la referencia acumulativa |
| Avro | [Especificación 1.12](https://avro.apache.org/docs/1.12.0/specification/): default de unión compatible con un miembro, sin imponer universalmente la primera posición |
| Probes y JPA | [Actuator](https://docs.spring.io/spring-boot/reference/actuator/endpoints.html#actuator.endpoints.kubernetes-probes), [OneToMany](https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/OneToMany.html): enlaces corregidos |
| Streams | [Testing Kafka 4.2](https://kafka.apache.org/42/streams/developer-guide/testing/): enlace corregido |

El registro `spring-boot-source-links.json` conserva respuestas HTTP de las
referencias. MySQL respondió 403 al verificador automático; eso se registra como
acceso bloqueado, no como página inexistente. Una lectura técnica asistida no
sustituye observar a una persona principiante completar el curso.

## Matriz individual

Cada fila describe el desarrollo real y un límite concreto. Para reconstruirla:
`python3 scripts/build_spring_topic_review.py`; para comprobar vigencia frente al
Markdown y las notas: agrega `--check`. Las notas son juicios explícitos de esta
revisión; el script no las genera a partir de palabras clave.

| Módulo.tema | Tema real | Subtemas | Revisión de secuencia, ejemplo y límite |
|---|---|---:|---|
| 0.1 | [Tema 1: Inversión de control y el contenedor de Spring](../web/public/content/spring-boot/modulo-0.md#L37) | 3 | Contrato → repositorio → servicio → HTTP. Corregidos reinicio tras crear controller y restauración del ejercicio antes del test siguiente. |
| 0.2 | [Tema 2: Inyección por constructor vs por campo](../web/public/content/spring-boot/modulo-0.md#L206) | 3 | Contrasta new y repositorio falso con contexto e inyección por campo; ambos tests tienen contenido completo. |
| 0.3 | [Tema 3: Estereotipos, autoconfiguración y scopes](../web/public/content/spring-boot/modulo-0.md#L364) | 3 | Estereotipos → árbol de dependencias → prototype/ObjectProvider; no confunde prototype con scope request. |
| 1.1 | [Tema 1: Spring Initializr y starters](../web/public/content/spring-boot/modulo-1.md#L10) | 3 | Generación aislada con Boot y paquete fijados; vuelve explícitamente al proyecto acumulativo. Maven, sin build Gradle. |
| 1.2 | [Tema 2: application.yml vs application.properties](../web/public/content/spring-boot/modulo-1.md#L144) | 3 | YAML → Properties → sobrescritura CLI; clean evita recursos antiguos y las claves tienen salida comprobable. |
| 1.3 | [Tema 3: Perfiles y estructura por capas](../web/public/content/spring-boot/modulo-1.md#L280) | 3 | Base → perfil dev → capas. Corregido el resumen que pedía JPA/PostgreSQL antes de enseñarlos. |
| 2.1 | [Tema 1: Por qué DTOs en vez de entidades directamente](../web/public/content/spring-boot/modulo-2.md#L10) | 3 | Entidad → DTO → contrato estable. Quitada dependencia anticipada de JWT y detalladas dependencias al continuar M0–M1. |
| 2.2 | [Tema 2: Validación con Bean Validation y ResponseEntity](../web/public/content/spring-boot/modulo-2.md#L252) | 3 | Bean Validation → ResponseEntity → casos límite. Corregidas dos continuaciones de línea curl. |
| 2.3 | [Tema 3: Manejo centralizado de errores con @ControllerAdvice](../web/public/content/spring-boot/modulo-2.md#L408) | 3 | ApiError → excepción de ausencia → comparación HTTP; distingue error previsto de un fallo interno. |
| 2.4 | [Tema 4: Lombok y MapStruct sin exponer datos internos](../web/public/content/spring-boot/modulo-2.md#L612) | 3 | Lombok → MapStruct → políticas de campos. Procesadores explícitos, versiones fijadas; los fragmentos son cambios sobre clases previas. |
| 2.5 | [Tema 5: OpenAPI con springdoc: el contrato como prueba](../web/public/content/spring-boot/modulo-2.md#L847) | 3 | Springdoc 3.2.0 → anotaciones → prueba HTTP del documento. Se incorpora al laboratorio acumulativo que antes no lo ejecutaba. |
| 2.6 | [Tema 6: Paginación HTTP con validación y un límite de recursos explícito](../web/public/content/spring-boot/modulo-2.md#L1071) | 3 | PageRequest → límites → SQL y decisión Page/Slice. Añadido import RequestParam y corregido límite inclusivo 0..1000; referencia ejecutable ampliada. |
| 3.1 | [Tema 1: Entidades y repositorios derivados](../web/public/content/spring-boot/modulo-3.md#L9) | 3 | Guardar → derivación → JPQL. Añadida instrucción real para instalar starter-data-jpa-test, antes solo mencionado como prerrequisito. |
| 3.2 | [Tema 2: El problema N+1 y su corrección](../web/public/content/spring-boot/modulo-3.md#L192) | 3 | Conteo N+1 → JOIN FETCH → EntityGraph; consulta perezosa separada conserva el contraste. Referencia ampliada a los tres casos. |
| 3.3 | [Tema 3: Migraciones con Flyway](../web/public/content/spring-boot/modulo-3.md#L478) | 3 | V1 → V2 → duplicado/checksum; pruebas incluyen guardado y versiones aplicadas; SQL H2 no equivale a todos los motores. |
| 4.1 | [Tema 1: SecurityFilterChain moderno](../web/public/content/spring-boot/modulo-4.md#L10) | 3 | Cadena Basic → MockMvc → rutas públicas. Añadido starter-webmvc-test antes del primer import modular que lo necesita. |
| 4.2 | [Tema 2: Filtro JWT y autorización por rol](../web/public/content/spring-boot/modulo-4.md#L228) | 3 | Firma → filtro → permisos. JWT HS256 local, no proveedor OIDC ni rotación de claves. |
| 4.3 | [Tema 3: CORS y CSRF](../web/public/content/spring-boot/modulo-4.md#L532) | 3 | Preflight → DELETE autenticado → método no permitido. Separa CORS, autenticación y CSRF según transporte de credenciales. |
| 4.4 | [Tema 4: Reducir SSRF en clientes HTTP con InetAddressFilter](../web/public/content/spring-boot/modulo-4.md#L706) | 3 | Cliente restringido → servidor loopback → redirects; clasificar metadata IP no demuestra DNS rebinding. |
| 4.5 | [Tema 5: Flujo de login completo — de `/api/auth/login` a una ruta protegida](../web/public/content/spring-boot/modulo-4.md#L782) | 3 | Hash → login/token → credenciales rechazadas. Se conservaron las dos pruebas negativas en la referencia acumulativa. |
| 5.1 | [Tema 1: @ConfigurationProperties tipado](../web/public/content/spring-boot/modulo-5.md#L10) | 3 | Record validado → binding tests → JwtService; incluye actualización del constructor del test previo. |
| 5.2 | [Tema 2: Fallar rápido al arranque](../web/public/content/spring-boot/modulo-5.md#L195) | 3 | Configuración ausente/vacía → validación → fallo rápido; no afirma que @NotBlank valide fuerza o Base64 de la clave. |
| 5.3 | [Tema 3: Manejo global de excepciones consistente entre entornos](../web/public/content/spring-boot/modulo-5.md#L316) | 3 | Regla 20/21 → handler compartido → borde exacto. Referencia ampliada con controller, excepción y ambos tests. |
| 6.1 | [Tema 1: Probar un controller con `@WebMvcTest`](../web/public/content/spring-boot/modulo-6.md#L10) | 3 | Slice web → validación → mock ausente; addFilters=false limita lo que acredita sobre seguridad. |
| 6.2 | [Tema 2: Probar el repositorio contra PostgreSQL con `@DataJpaTest`](../web/public/content/spring-boot/modulo-6.md#L138) | 3 | Propiedades dinámicas → PostgreSQL real → caída accidental a H2. Corregida referencia que apuntaba al test de controller. |
| 6.3 | [Tema 3: Integrar el flujo con `@SpringBootTest`](../web/public/content/spring-boot/modulo-6.md#L297) | 3 | Creación/GET persistido → 401 → servicio sin guardar. Corregida referencia al archivo; añadido el caso anónimo a la referencia. |
| 7.1 | [Tema 1: Actuator y health checks personalizados](../web/public/content/spring-boot/modulo-7.md#L10) | 3 | Indicador → UP/DOWN/401 → falsa salud; la dependencia controlada no es una pasarela real. |
| 7.2 | [Tema 2: Contar operaciones de negocio con Micrometer](../web/public/content/spring-boot/modulo-7.md#L205) | 3 | Contador → endpoint/tag → incremento ausente; un contador después de save no es contabilidad transaccional durable. |
| 7.3 | [Tema 3: Liveness y readiness sin reinicios en cadena](../web/public/content/spring-boot/modulo-7.md#L381) | 3 | Activación → dependencia solo en readiness → estados; distingue estado de la app y acción del orquestador. |
| 8.1 | [Tema 1: Producers y consumers con Spring Kafka](../web/public/content/spring-boot/modulo-8.md#L8) | 3 | Key → dos grupos → partición/orden. Broker embebido real, sin afirmar un clúster de producción. |
| 8.2 | [Tema 2: Dead-letter queue](../web/public/content/spring-boot/modulo-8.md#L160) | 3 | Backoff → intentos/DLT → política y replay; tópico destino y particiones identificables. |
| 8.3 | [Tema 3: Transacciones Kafka y SQL: idempotencia y límites de exactly-once](../web/public/content/spring-boot/modulo-8.md#L269) | 4 | Idempotencia productor → outbox/inbox SQL → aislamiento Kafka; separa garantías y restricciones concurrentes. |
| 8.4 | [Tema 4: Rebalanceo de consumer groups y asignación de particiones](../web/public/content/spring-boot/modulo-8.md#L461) | 4 | Asignación → callbacks → rebalanceo → membresía estática. Referencias cambiadas del POM al test que demuestra asignación; reinicios estáticos pendientes. |
| 8.5 | [Tema 5: Kafka frente a RabbitMQ](../web/public/content/spring-boot/modulo-8.md#L618) | 4 | Distribución → retención → confirms/ack → selección. Usa Node como comparación explícita; no es una implementación Spring adicional. |
| 8.6 | [Tema 6: Spring Cloud Stream y binders de Kafka/RabbitMQ](../web/public/content/spring-boot/modulo-8.md#L756) | 4 | Función → binder → rechazo → broker. Test binder no acredita Kafka/Rabbit ni su DLQ. |
| 8.7 | [Tema 7: Kafka Streams con Spring para transformar eventos](../web/public/content/spring-boot/modulo-8.md#L936) | 4 | Filtro → ventana → TopologyTestDriver → aplicación. Actualizada referencia Boot 4.1 y enlace oficial de testing Kafka. |
| 8.8 | [Tema 8: Avro y Schema Registry para contratos de eventos](../web/public/content/spring-boot/modulo-8.md#L1084) | 4 | Schema → evolución → serde mock → Registry HTTP. Corregida regla antigua del default de unión para Avro 1.12; Registry desplegado requiere ejecución aparte. |
| 8.9 | [Tema 9: RabbitMQ con Spring AMQP: routing, ack y prefetch](../web/public/content/spring-boot/modulo-8.md#L1230) | 4 | Topología → confirm/return → ack/DLQ → prefetch; tests usan dobles y no acreditan medición real del broker. |
| 9.1 | [Tema 1: Mono y Flux](../web/public/content/spring-boot/modulo-9.md#L213) | 4 | Cero/uno/secuencia → error → defer → demanda. No confunde evaluación de just con defer. |
| 9.2 | [Tema 2: WebClient y composición no bloqueante](../web/public/content/spring-boot/modulo-9.md#L328) | 4 | Builder → flatMap → HTTP error → timeout. Servidor local y StepVerifier, con tiempos didácticos. |
| 9.3 | [Tema 3: Cuándo WebFlux vale la complejidad, y R2DBC](../web/public/content/spring-boot/modulo-9.md#L445) | 4 | Decisión MVC/WebFlux → bloqueo → R2DBC → boundedElastic. No presenta JDBC envuelto en Mono como no bloqueante. |
| 10.1 | [Tema 1: Config Server y service discovery](../web/public/content/spring-boot/modulo-10.md#L8) | 3 | Config por archivos → perfil → SimpleDiscoveryClient; resolución estática no equivale a operar Eureka/Consul. |
| 10.2 | [Tema 2: Spring Cloud Gateway](../web/public/content/spring-boot/modulo-10.md#L202) | 3 | Predicado Gateway → StripPrefix → 404 y log del backend. Backend Python es fixture HTTP explícito, no otro microservicio Spring. |
| 10.3 | [Tema 3: Circuit breaker con Resilience4j](../web/public/content/spring-boot/modulo-10.md#L338) | 3 | Ventana/fallos → petición bloqueada → HALF_OPEN. Transición forzada prueba recuperación, no temporizador real. |
| 10.4 | [Tema 4: OAuth2/OIDC, Keycloak y Token Relay sin perder la frontera de autorización](../web/public/content/spring-boot/modulo-10.md#L424) | 4 | Issuer → rol → propiedad → TokenRelay; decoder simulado y login OIDC real están separados. Recorrido navegador/Keycloak pendiente. |
| 10.5 | [Tema 5: HTTP Interfaces, deadlines y descubrimiento según el entorno](../web/public/content/spring-boot/modulo-10.md#L558) | 4 | HTTP interface → timeout → discovery → presupuesto; timeout local no constituye deadline extremo a extremo. |
| 10.6 | [Tema 6: Spring gRPC, contrato HTTP/2 y evolución segura](../web/public/content/spring-boot/modulo-10.md#L717) | 4 | Proto → servicio → TCP → evolución; no acredita compatibilidad entre todas las versiones ni TLS. |
| 10.7 | [Tema 7: DDD para decidir límites y propiedad de datos](../web/public/content/spring-boot/modulo-10.md#L868) | 4 | Agregado → regla → inmutabilidad → decisión de extracción; memoria y sin publicación durable. |
| 10.8 | [Tema 8: Orquestar pedidos con Temporal y Spring Boot](../web/public/content/spring-boot/modulo-10.md#L1007) | 4 | Workflow/Activity → worker → retry → compensación; entorno Temporal de prueba, efectos externos controlados. |
| 10.9 | [Tema 9: Comprueba módulos antes de separar servicios](../web/public/content/spring-boot/modulo-10.md#L1165) | 4 | Fronteras → verify → evento → receptor; se reutiliza el lab de M23. Documentación generada es un cuarto test adicional. |
| 10.10 | [Tema 10: Spring Cloud Bus para propagar cambios de configuración](../web/public/content/spring-boot/modulo-10.md#L1305) | 4 | Broker → dos instancias → busenv → reinicio; script específico necesario, Maven con cero tests no acredita propagación. |
| 10.11 | [Tema 11: Micrometer Tracing entre servicios](../web/public/content/spring-boot/modulo-10.md#L1438) | 4 | Jaeger → dos procesos → traza → sampling; referencia snapshot sustituida por versión estable. No mide carga. |
| 10.12 | [Tema 12: Contract testing entre productor y consumidor](../web/public/content/spring-boot/modulo-10.md#L1587) | 4 | Contrato → prueba generada → stub consumidor → rotura. Multi-módulo Maven y artefacto stubs explícitos, sin receta Gradle. |
| 11.1 | [Tema 1: Fat JAR vs capas de Docker](../web/public/content/spring-boot/modulo-11.md#L8) | 4 | Inspección JAR → tools/capas → Dockerfile → cambio; reutilización de imagen requiere build y runtime aparte. |
| 11.2 | [Tema 2: GraalVM native image](../web/public/content/spring-boot/modulo-11.md#L155) | 4 | AOT → hint → native compile → comparación. Corregido log del script para funcionar sin target; JVM AOT no es un binario nativo. |
| 11.3 | [Tema 3: Health checks para Kubernetes](../web/public/content/spring-boot/modulo-11.md#L298) | 4 | Probes → estado → Deployment → fallos; enlace oficial corregido. Kubernetes requiere clúster e imagen disponible. |
| 12.1 | [Tema 1: Arquitectura del microservicio integrador](../web/public/content/spring-boot/modulo-12.md#L8) | 4 | Capas → Flyway → validación → HTTP/PostgreSQL. Corregidos conteo 5→7 y afirmación de que el lab final aún carecía de JWT. |
| 12.2 | [Tema 2: Integra seguridad JWT y observabilidad](../web/public/content/spring-boot/modulo-12.md#L151) | 4 | Firma → rol → contador → Actuator. Se analiza configuración existente del laboratorio final, no una etapa inexistente sin seguridad. |
| 12.3 | [Tema 3: Cierra el servicio con evidencia y próximos pasos](../web/public/content/spring-boot/modulo-12.md#L285) | 4 | Guardia → suite → checklist → siguiente nivel. Corregido cierre prematuro del track; M13–M25 siguen después de este hito. |
| 13.1 | [Tema 1: `@Transactional` funciona en una frontera, no como encantamiento](../web/public/content/spring-boot/modulo-13.md#L10) | 4 | Proxy → this → otro bean → contraste; estado transaccional no demuestra por sí solo rollback de escrituras. |
| 13.2 | [Tema 2: Recuperación implica duplicación segura](../web/public/content/spring-boot/modulo-13.md#L145) | 4 | Unicidad → ON CONFLICT → carrera → inbox. No es API HTTP idempotente completa: faltan payload, principal y respuesta persistida. |
| 13.3 | [Tema 3: Contratos ejecutables protegen despliegues independientes](../web/public/content/spring-boot/modulo-13.md#L270) | 4 | Contrato público → nombre JSON → error → evolución; añadir campo al record requiere actualizar sus constructores. |
| 13.4 | [Tema 4: Observabilidad sirve a un objetivo y a una decisión](../web/public/content/spring-boot/modulo-13.md#L354) | 4 | Observation → traza → cardinalidad → objetivo operacional; un SLO necesita medición agregada, no solo una traza. |
| 14.1 | [Tema 1: CRUD API y contratos](../web/public/content/spring-boot/modulo-14.md#L8) | 4 | Estado → DTO → cancelación → repetición. DELETE conserva la fila; el endpoint no implementa borrado físico. |
| 14.2 | [Tema 2: MySQL y datos espaciales](../web/public/content/spring-boot/modulo-14.md#L101) | 4 | SRID → orden de ejes → EXPLAIN → distancia/ruta. Corregido esquema unix del socket Podman; MySQL del ejemplo está fijado a 8.0.36. |
| 14.3 | [Tema 3: JPA e Hibernate Spatial](../web/public/content/spring-boot/modulo-14.md#L231) | 4 | JTS/SRID → persistencia → versión → conflicto. Usa MySQL real; no migra automáticamente a la versión más reciente. |
| 14.4 | [Tema 4: JWT Bearer y autorización por roles](../web/public/content/spring-boot/modulo-14.md#L324) | 4 | Firma → rol → propiedad → acceso horizontal; dueños en memoria, sin Keycloak en este lab. |
| 14.5 | [Tema 5: Tiempo real con STOMP](../web/public/content/spring-boot/modulo-14.md#L414) | 4 | Conexión → posición → secuencia → destino erróneo; WebSocket real local, sin broker durable ni permisos por envío. |
| 14.6 | [Tema 6: Archivos y notificaciones push](../web/public/content/spring-boot/modulo-14.md#L519) | 4 | Límites → imagen decodificada → after-commit → almacenamiento. Push controlado, objetos en memoria y ventana de pérdida declarada. |
| 15.1 | [Tema 1: Backpressure real en WebFlux con reactor-test](../web/public/content/spring-boot/modulo-15.md#L8) | 4 | Demanda cero → 3+7 → ilimitada → limitRate; referencias apuntan al test real, no al POM. |
| 15.2 | [Tema 2: Contenedores Testcontainers reutilizados entre clases](../web/public/content/spring-boot/modulo-15.md#L134) | 4 | Singleton → dos clases → aislamiento → decisión. Corregidas referencias erróneas a idempotencia: el lab correcto es testcontainers-singleton-rutaflow. |
| 15.3 | [Tema 3: Arquitectura hexagonal verificada con ArchUnit](../web/public/content/spring-boot/modulo-15.md#L247) | 4 | Puerto → reglas bytecode → aplicación → alcance. ArchUnit requiere su propio lab; no es una prueba funcional. |
| 15.4 | [Tema 4: Bulkhead y RateLimiter de Resilience4j](../web/public/content/spring-boot/modulo-15.md#L355) | 4 | Concurrencia/ritmo → bulkhead → permisos → límites; no cuota global entre réplicas. |
| 15.5 | [Tema 5: Saga con compensación real](../web/public/content/spring-boot/modulo-15.md#L436) | 4 | Pasos → compensación inversa → éxito → recuperación. Participantes en memoria, no saga distribuida durable. |
| 15.6 | [Tema 6: Event Sourcing con replay real](../web/public/content/spring-boot/modulo-15.md#L528) | 4 | Hechos → replay → orden inválido → límites. Event store en memoria; no equivale a Kafka ni outbox. |
| 15.7 | [Tema 7: Compensación que falla: conservar trabajo pendiente y reintentar sin duplicar](../web/public/content/spring-boot/modulo-15.md#L625) | 4 | PENDING → transacción local → reapertura archivo → repetición; recuperación H2 local, no coordinación de bases remotas. |
| 15.8 | [Tema 8: Clean Architecture y DDD táctico: caso de uso antes que framework](../web/public/content/spring-boot/modulo-15.md#L797) | 4 | Agregado → puerto → HTTP → corte vertical; seis pruebas en memoria, sin seguridad ni JPA. |
| 16.1 | [Tema 1: Relaciones, lado propietario y ciclo de vida](../web/public/content/spring-boot/modulo-16.md#L14) | 4 | FK → ambos lados → cascade → flush/clear; corregido enlace a OneToMany, Hibernate/JPA de lab tienen su propio POM. |
| 16.2 | [Tema 2: LAZY, EAGER, N+1 y consultas de caso de uso](../web/public/content/spring-boot/modulo-16.md#L119) | 4 | N+1 → EntityGraph → contexto cerrado → decisión; medir SQL y no convertir todo a EAGER. |
| 17.1 | [Tema 1: DataSource, JdbcTemplate y DAO](../web/public/content/spring-boot/modulo-17.md#L14) | 4 | DataSource/DAO → parámetros → RowMapper → orden allowlist; valores y nombres de columna tienen tratamientos distintos. |
| 17.2 | [Tema 2: `@Transactional`, rollback y límites de transacción](../web/public/content/spring-boot/modulo-17.md#L108) | 4 | Unidad local → rollback runtime → checked/rollbackFor → frontera; no engloba HTTP o Kafka. |
| 18.1 | [Tema 1: SecurityFilterChain y autorización](../web/public/content/spring-boot/modulo-18.md#L14) | 4 | Filtro → roles → 401/403 → propiedad; repasa M4/M10 con lab OIDC, no añade un segundo sistema de login. |
| 18.2 | [Tema 2: DTO validation, CORS, JWT/OIDC y clientes HTTP](../web/public/content/spring-boot/modulo-18.md#L106) | 4 | DTO → CORS → issuer → SSRF; cambia de lab explícitamente; JWT mock no acredita firma real de Keycloak. |
| 19.1 | [Tema 1: Job, Step, Tasklet y chunk processing](../web/public/content/spring-boot/modulo-19.md#L14) | 4 | Job/Step → lectura/proceso → chunk → filas; H2 y tamaño de chunk didáctico. |
| 19.2 | [Tema 2: Reinicio, JobParameters, retry, skip y listeners](../web/public/content/spring-boot/modulo-19.md#L119) | 4 | Restart → parámetros → retry/skip → auditoría. Repositorio de job y parámetros estables determinan la instancia. |
| 20.1 | [Tema 1: Scheduling y tareas periódicas](../web/public/content/spring-boot/modulo-20.md#L14) | 4 | Intervalo → servicio → registro/manual → réplicas; no prueba reloj ni exclusión distribuida. |
| 20.2 | [Tema 2: Eventos locales, eventos transaccionales y mensajería](../web/public/content/spring-boot/modulo-20.md#L110) | 4 | Evento local → after-commit → outbox → inbox; no confunde listener local con entrega recuperable. |
| 20.3 | [Tema 3: Correo con Spring Mail y entrega recuperable](../web/public/content/spring-boot/modulo-20.md#L219) | 4 | Mensaje → SMTP config → outbox → agotamiento. Adaptador controlado; no correo realmente entregado. |
| 20.4 | [Tema 4: Caché con Spring Cache, Caffeine y Redis](../web/public/content/spring-boot/modulo-20.md#L342) | 5 | Lectura → invalidación/put → límites → métricas → Redis. Writer inmediato explícito para lectura entre gestores; costo de bloqueo explicado. |
| 20.5 | [Tema 5: @Async y ejecutores: trabajo en segundo plano con límites](../web/public/content/spring-boot/modulo-20.md#L515) | 4 | Proxy → self-call → Future excepcional → rechazo por capacidad. No acredita durabilidad ni propagación de seguridad. |
| 20.6 | [Tema 6: Integraciones empresariales, SOAP y fronteras de protocolo](../web/public/content/spring-boot/modulo-20.md#L639) | 4 | Sobre → namespace → validación/Fault → decisión de adaptador. Ejemplo complementario Python, no servidor SOAP Spring ni WSDL ejecutado. |
| 20.7 | [Tema 7: Spring AI: ChatClient y herramientas con autorización fuera del modelo](../web/public/content/spring-boot/modulo-20.md#L752) | 4 | ChatClient controlado → callback autorizado → sesiones → esquema. Boot 4.0.9 + AI 2.0.2 compatibles, sin calidad LLM real. |
| 20.8 | [Tema 8: RAG desde la frontera de datos: recuperar evidencia autorizada antes de generar](../web/public/content/spring-boot/modulo-20.md#L926) | 4 | Filtro tenant → vacío → límite/IDs → metadato ausente. Recuperación literal, no embeddings ni generación. Corregida numeración T6–T8. |
| 21.1 | [Tema 1: Productor, tópico, key y consumidor](../web/public/content/spring-boot/modulo-21.md#L9) | 3 | Publicación → grupos → orden; refuerzo de M8 sobre el mismo lab y sus pruebas. |
| 21.2 | [Tema 2: Reintentos, DLT, entrega al menos una vez e idempotencia](../web/public/content/spring-boot/modulo-21.md#L94) | 3 | Reintentos/DLT → inbox → rollback conjunto; mantiene diferencia entre entrega y efecto idempotente. |
| 21.3 | [Tema 3: Outbox transaccional y flujo de negocio](../web/public/content/spring-boot/modulo-21.md#L179) | 3 | Outbox SQL → ACK → replay; dispatcher didáctico sin lease, una sola instancia. |
| 22.1 | [Tema 1: Hexagonal: puertos que hablan el idioma del dominio](../web/public/content/spring-boot/modulo-22.md#L7) | 3 | Java completo → ampliar puerto → cancelación independiente; ejercicios sin solución cerrada no son títulos vacíos. |
| 22.2 | [Tema 2: C4: contexto, contenedores, componentes y código](../web/public/content/spring-boot/modulo-22.md#L183) | 3 | Validador → evidencia de relaciones → contenedor hipotético; valida forma C4, no infraestructura real. |
| 22.3 | [Tema 3: ADR: decisiones con contexto, alternativas y consecuencias](../web/public/content/spring-boot/modulo-22.md#L344) | 3 | Tres ADR → alternativas → decisión reemplazada; esquema documental no acredita decisión humana. |
| 23.1 | [Tema 1: módulos y límites entre paquetes](../web/public/content/spring-boot/modulo-23.md#L7) | 3 | Modelo modular → contrato público → refactor; wrapper reemplazado por uno autónomo para cumplir los comandos de copia. |
| 23.2 | [Tema 2: eventos entre módulos sin importar implementación](../web/public/content/spring-boot/modulo-23.md#L91) | 3 | Publicación → reacción → durabilidad; H2 y bandeja en memoria, sin recuperación tras reinicio. |
| 23.3 | [Tema 3: documentación generada y mapa de dependencias](../web/public/content/spring-boot/modulo-23.md#L175) | 3 | Generación → relación/import → guía; hay .puml/.adoc, no imágenes renderizadas. |
| 23.4 | [Tema 4: pruebas de integración por módulo](../web/public/content/spring-boot/modulo-23.md#L259) | 3 | Módulo aislado → flujo → suite; PublishedEvents/Awaitility ejecutables, Scenario explicado pero no implementado. |
| 24.1 | [Tema 1: schema-first con tipos y consultas](../web/public/content/spring-boot/modulo-24.md#L7) | 3 | Schema → campo inválido → ausencia; nullabilidad y errores GraphQL explícitos. |
| 24.2 | [Tema 2: data fetchers, relaciones y problema N+1](../web/public/content/spring-boot/modulo-24.md#L91) | 3 | Batch → padres → contador; dos padres en una invocación no prueba consultas SQL ni autorización. |
| 24.3 | [Tema 3: mutations y subscriptions](../web/public/content/spring-boot/modulo-24.md#L178) | 3 | Transición → suscripción previa → emisión local; no negocia WebSocket ni garantiza entrega durable. |
| 24.4 | [Tema 4: pruebas GraphQL con GraphQlTester](../web/public/content/spring-boot/modulo-24.md#L262) | 3 | Tester → HTTP curl → matriz; servicio y transporte se verifican por separado. |
| 25.1 | [Tema 1: bindings y destinations](../web/public/content/spring-boot/modulo-25.md#L11) | 3 | Función → binding/destino → entrada inválida; test binder en JVM, sin sockets de broker. |
| 25.2 | [Tema 2: binder Kafka y binder RabbitMQ](../web/public/content/spring-boot/modulo-25.md#L95) | 3 | Kafka → Rabbit → diferencias; requiere brokers y cliente/cola de observación, prueba manual separada. |
| 25.3 | [Tema 3: reintentos, error handler y dead-letter](../web/public/content/spring-boot/modulo-25.md#L191) | 3 | Retry Kafka → DLQ Rabbit → dato inválido; replay no repara el dato ni reemplaza idempotencia. |
| 25.4 | [Tema 4: test binder y límites de la prueba](../web/public/content/spring-boot/modulo-25.md#L274) | 3 | Mapping → error → alcance. Corregida cuenta de dos a tres pruebas del laboratorio; broker real sigue separado. |
