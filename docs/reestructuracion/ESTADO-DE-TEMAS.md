# Estado de todos los temas objetivo

Generado por `scripts/build_estado_temas.py` desde los temarios aprobados y
`docs/reestructuracion/temas-escritos.txt`. No lo edites a mano. El detalle tema por tema está en
`ESTADO-DE-TEMAS.csv`.

- **Origen**: qué había en el curso antiguo (`ya-esta`, `esta-pero-basico`, `falta`).
- **Escritos**: temas ya escritos en el formato único de 12 secciones.
- **Verificados**: su laboratorio se ejecutó y pasó.

| Curso | Temas | Módulos | Ya está | Básico | Falta | Escritos | Verificados | Por escribir |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| java | 279 | 44 | 46 | 92 | 141 | 32 | 0 | 247 |
| gradle | 166 | 28 | 0 | 31 | 135 | 0 | 0 | 166 |
| spring | 281 | 47 | 57 | 83 | 141 | 0 | 0 | 281 |
| microservicios | 395 | 62 | 173 | 72 | 150 | 173 | 110 | 222 |
| flutter | 345 | 52 | 40 | 101 | 204 | 0 | 0 | 345 |
| ios | 324 | 51 | 42 | 79 | 203 | 0 | 0 | 324 |
| angular | 297 | 49 | 65 | 52 | 180 | 0 | 0 | 297 |
| fundamentos | 298 | 46 | 65 | 130 | 103 | 0 | 0 | 298 |
| **Total** | **2385** | **379** | **488** | **640** | **1257** | **205** | **110** | **2180** |

## java

| Módulo | Título | Tramo | Temas | Escritos | Verificados |
|---|---|---|---:|---:|---:|
| M0 | Plataforma, herramientas y primer programa | Tramo 1 · Fundamentos | 7 | 7 | 0 |
| M1 | Datos: tipos, variables y operadores | Tramo 1 · Fundamentos | 7 | 7 | 0 |
| M2 | Texto y entrada/salida de consola | Tramo 1 · Fundamentos | 6 | 6 | 0 |
| M3 | Control de flujo y métodos | Tramo 1 · Fundamentos | 6 | 6 | 0 |
| M4 | Arreglos y primeras colecciones | Tramo 1 · Fundamentos | 6 | 6 | 0 |
| M5 | Objetos y clases | Tramo 1 · Fundamentos | 7 | 0 | 0 |
| M6 | Herencia, interfaces y polimorfismo | Tramo 1 · Fundamentos | 7 | 0 | 0 |
| M7 | Excepciones | Tramo 1 · Fundamentos | 6 | 0 | 0 |
| M8 | Fechas, dinero y documentación | Tramo 1 · Fundamentos | 5 | 0 | 0 |
| M9 | Diseño de clases a fondo | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M10 | Tipos sellados, patrones y programación orientada a datos | Tramo 2 · Aplicación | 6 | 0 | 0 |
| M11 | Genéricos | Tramo 2 · Aplicación | 6 | 0 | 0 |
| M12 | Colecciones: uso con criterio | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M13 | Lambdas e interfaces funcionales | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M14 | Streams | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M15 | Entrada/salida y archivos | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M16 | Empaquetar, configurar y ejecutar una aplicación | Tramo 2 · Aplicación | 5 | 0 | 0 |
| M17 | Pruebas en la JVM | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M18 | Concurrencia I: hilos, tareas y datos compartidos | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M19 | Patrones de diseño con Java moderno | Tramo 2 · Aplicación | 6 | 0 | 0 |
| M20 | Datos y red I: JDBC, HTTP y JSON | Tramo 2 · Aplicación | 5 | 0 | 0 |
| M21 | Colecciones por dentro | Tramo 3 · Integración | 7 | 0 | 0 |
| M22 | Streams y lambdas por dentro | Tramo 3 · Integración | 6 | 0 | 0 |
| M23 | Concurrencia II: clases seguras, locks y sincronizadores | Tramo 3 · Integración | 7 | 0 | 0 |
| M24 | Concurrencia III: ejecutores, asincronía e hilos virtuales | Tramo 3 · Integración | 7 | 0 | 0 |
| M25 | Módulos (JPMS) y distribución | Tramo 3 · Integración | 7 | 0 | 0 |
| M26 | Reflexión, anotaciones y metaprogramación | Tramo 3 · Integración | 7 | 0 | 0 |
| M27 | E/S avanzada: NIO, canales y serialización | Tramo 3 · Integración | 7 | 0 | 0 |
| M28 | Redes | Tramo 3 · Integración | 6 | 0 | 0 |
| M29 | JDBC a fondo y acceso a datos sin framework | Tramo 3 · Integración | 5 | 0 | 0 |
| M30 | Seguridad en la plataforma Java | Tramo 3 · Integración | 6 | 0 | 0 |
| M31 | APIs públicas, compatibilidad y librerías | Tramo 3 · Integración | 6 | 0 | 0 |
| M32 | Java funcional avanzado | Tramo 3 · Integración | 5 | 0 | 0 |
| M33 | Bytecode y formato de clase | Tramo 4 · Experto | 6 | 0 | 0 |
| M34 | Carga de clases, enlace, inicialización y arranque | Tramo 4 · Experto | 6 | 0 | 0 |
| M35 | Memoria: objetos, áreas y referencias | Tramo 4 · Experto | 7 | 0 | 0 |
| M36 | Recolección de basura | Tramo 4 · Experto | 7 | 0 | 0 |
| M37 | Compilación JIT y ejecución | Tramo 4 · Experto | 7 | 0 | 0 |
| M38 | Modelo de memoria de Java y concurrencia sin bloqueos | Tramo 4 · Experto | 7 | 0 | 0 |
| M39 | Rendimiento: método y medición | Tramo 4 · Experto | 7 | 0 | 0 |
| M40 | Diagnóstico en producción | Tramo 4 · Experto | 7 | 0 | 0 |
| M41 | Java en contenedores y operación del runtime | Tramo 4 · Experto | 5 | 0 | 0 |
| M42 | Interoperar con código nativo | Tramo 4 · Experto | 5 | 0 | 0 |
| M43 | Evolución de Java y criterio de experto | Tramo 4 · Experto | 5 | 0 | 0 |

## gradle

| Módulo | Título | Tramo | Temas | Escritos | Verificados |
|---|---|---|---:|---:|---:|
| M0 | El problema del build y el primer contacto | Tramo 1 · Fundamentos | 6 | 0 | 0 |
| M1 | Wrapper, daemon y entorno de ejecución | Tramo 1 · Fundamentos | 6 | 0 | 0 |
| M2 | Kotlin DSL para leer y escribir builds | Tramo 1 · Fundamentos | 5 | 0 | 0 |
| M3 | Un proyecto Java con Gradle | Tramo 1 · Fundamentos | 6 | 0 | 0 |
| M4 | Dependencias: lo esencial | Tramo 1 · Fundamentos | 6 | 0 | 0 |
| M5 | Pruebas con Gradle | Tramo 1 · Fundamentos | 5 | 0 | 0 |
| M6 | Ciclo de vida y modelo del build | Tramo 2 · Aplicación | 5 | 0 | 0 |
| M7 | Tareas | Tramo 2 · Aplicación | 6 | 0 | 0 |
| M8 | Builds multi-proyecto | Tramo 2 · Aplicación | 6 | 0 | 0 |
| M9 | Convention plugins y lógica de build compartida | Tramo 2 · Aplicación | 5 | 0 | 0 |
| M10 | Kotlin y calidad de código en el build | Tramo 2 · Aplicación | 5 | 0 | 0 |
| M11 | Gradle para Spring Boot | Tramo 2 · Aplicación | 6 | 0 | 0 |
| M12 | Configuración perezosa: providers y properties | Tramo 3 · Integración | 7 | 0 | 0 |
| M13 | Tareas propias, incrementales y paralelas | Tramo 3 · Integración | 7 | 0 | 0 |
| M14 | Build cache | Tramo 3 · Integración | 7 | 0 | 0 |
| M15 | Resolución de dependencias y conflictos | Tramo 3 · Integración | 7 | 0 | 0 |
| M16 | Repositorios y caché de dependencias | Tramo 3 · Integración | 4 | 0 | 0 |
| M17 | Seguridad de la cadena de suministro | Tramo 3 · Integración | 4 | 0 | 0 |
| M18 | Composite builds y estructura de builds grandes | Tramo 3 · Integración | 5 | 0 | 0 |
| M19 | Publicación de librerías | Tramo 3 · Integración | 7 | 0 | 0 |
| M20 | Gradle en integración continua | Tramo 3 · Integración | 7 | 0 | 0 |
| M21 | Plugins binarios | Tramo 4 · Experto | 7 | 0 | 0 |
| M22 | Probar y publicar plugins | Tramo 4 · Experto | 5 | 0 | 0 |
| M23 | Configuration cache e Isolated Projects | Tramo 4 · Experto | 7 | 0 | 0 |
| M24 | Rendimiento y diagnóstico de builds | Tramo 4 · Experto | 7 | 0 | 0 |
| M25 | Variantes, atributos y transformaciones de artefactos | Tramo 4 · Experto | 6 | 0 | 0 |
| M26 | Gradle para Android y Kotlin Multiplatform | Tramo 4 · Experto | 5 | 0 | 0 |
| M27 | Migración, actualización y gobierno del build | Tramo 4 · Experto | 7 | 0 | 0 |

## spring

| Módulo | Título | Tramo | Temas | Escritos | Verificados |
|---|---|---|---:|---:|---:|
| M0 | Spring en contexto y primer servicio | Tramo 1 · Fundamentos | 6 | 0 | 0 |
| M1 | El contenedor IoC: beans e inyección | Tramo 1 · Fundamentos | 7 | 0 | 0 |
| M2 | Configuración externa, perfiles y logging | Tramo 1 · Fundamentos | 7 | 0 | 0 |
| M3 | Web MVC esencial: una API REST | Tramo 1 · Fundamentos | 7 | 0 | 0 |
| M4 | Acceso a datos esencial | Tramo 1 · Fundamentos | 7 | 0 | 0 |
| M5 | Pruebas esenciales | Tramo 1 · Fundamentos | 5 | 0 | 0 |
| M6 | Web MVC completo | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M7 | Diseño y documentación de la API | Tramo 2 · Aplicación | 6 | 0 | 0 |
| M8 | Clientes HTTP | Tramo 2 · Aplicación | 6 | 0 | 0 |
| M9 | Vistas en el servidor con Thymeleaf | Tramo 2 · Aplicación | 3 | 0 | 0 |
| M10 | JPA e Hibernate con Spring: mapeo | Tramo 2 · Aplicación | 6 | 0 | 0 |
| M11 | Consultas con Spring Data JPA | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M12 | AOP y proxies | Tramo 2 · Aplicación | 5 | 0 | 0 |
| M13 | Transacciones | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M14 | Spring Security esencial | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M15 | Pruebas de aplicación | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M16 | Actuator y operación básica | Tramo 2 · Aplicación | 6 | 0 | 0 |
| M17 | Eventos, tareas, caché y correo | Tramo 2 · Aplicación | 6 | 0 | 0 |
| M18 | OAuth 2 y OpenID Connect | Tramo 3 · Integración | 7 | 0 | 0 |
| M19 | Autorización y autenticación avanzadas | Tramo 3 · Integración | 7 | 0 | 0 |
| M20 | Rendimiento de la persistencia | Tramo 3 · Integración | 7 | 0 | 0 |
| M21 | Otros almacenes con Spring Data | Tramo 3 · Integración | 7 | 0 | 0 |
| M22 | Programación reactiva: Reactor y WebFlux | Tramo 3 · Integración | 7 | 0 | 0 |
| M23 | Tiempo real: SSE, WebSocket y RSocket | Tramo 3 · Integración | 4 | 0 | 0 |
| M24 | Spring for GraphQL | Tramo 3 · Integración | 5 | 0 | 0 |
| M25 | gRPC con Spring gRPC | Tramo 3 · Integración | 3 | 0 | 0 |
| M26 | Mensajería con Apache Kafka | Tramo 3 · Integración | 7 | 0 | 0 |
| M27 | Kafka avanzado y outbox | Tramo 3 · Integración | 3 | 0 | 0 |
| M28 | RabbitMQ y JMS | Tramo 3 · Integración | 6 | 0 | 0 |
| M29 | Spring Cloud Stream y Spring Cloud Function | Tramo 3 · Integración | 5 | 0 | 0 |
| M30 | Spring Integration y servicios SOAP | Tramo 3 · Integración | 5 | 0 | 0 |
| M31 | Spring Batch 6 | Tramo 3 · Integración | 7 | 0 | 0 |
| M32 | Observabilidad | Tramo 3 · Integración | 7 | 0 | 0 |
| M33 | Empaquetado y despliegue | Tramo 3 · Integración | 7 | 0 | 0 |
| M34 | Arquitectura de la aplicación con Spring Modulith | Tramo 3 · Integración | 6 | 0 | 0 |
| M35 | El contenedor por dentro | Tramo 4 · Experto | 7 | 0 | 0 |
| M36 | AOP por dentro | Tramo 4 · Experto | 5 | 0 | 0 |
| M37 | Autoconfiguración por dentro y starter propio | Tramo 4 · Experto | 7 | 0 | 0 |
| M38 | La capa web por dentro | Tramo 4 · Experto | 5 | 0 | 0 |
| M39 | Concurrencia e hilos virtuales en Spring | Tramo 4 · Experto | 5 | 0 | 0 |
| M40 | Arranque y memoria: AOT, imagen nativa, AOT cache y CRaC | Tramo 4 · Experto | 7 | 0 | 0 |
| M41 | Rendimiento y diagnóstico en producción | Tramo 4 · Experto | 6 | 0 | 0 |
| M42 | Seguridad experta | Tramo 4 · Experto | 6 | 0 | 0 |
| M43 | Pruebas expertas | Tramo 4 · Experto | 5 | 0 | 0 |
| M44 | Spring AI en el servicio | Tramo 4 · Experto | 7 | 0 | 0 |
| M45 | Evolución y mantenimiento | Tramo 4 · Experto | 4 | 0 | 0 |
| M46 | Proyecto final: el servicio en producción | Tramo 4 · Experto | 5 | 0 | 0 |

## microservicios

| Módulo | Título | Tramo | Temas | Escritos | Verificados |
|---|---|---|---:|---:|---:|
| M0.1 | Qué es un programa, un servidor y una API | Fase 0 · Fundamentos absolutos | 3 | 3 | 3 |
| M0.2 | Lógica de programación y pensamiento computacional | Fase 0 · Fundamentos absolutos | 3 | 2 | 2 |
| M0.3 | Java y Node.js lado a lado | Fase 0 · Fundamentos absolutos | 3 | 2 | 2 |
| M0.4 | Git, terminal, HTTP, JSON, YAML y variables de entorno | Fase 0 · Fundamentos absolutos | 6 | 6 | 6 |
| M0.5 | Primer «Hola Mundo» en ambos stacks y Docker básico | Fase 0 · Fundamentos absolutos | 3 | 2 | 2 |
| M0.6 | Redes, datos y pruebas: lo mínimo antes de distribuir | Fase 0 · Fundamentos absolutos | 7 | 0 | 0 |
| M1 | Java moderno y Spring Boot esencial | Fase 1 · Spring Boot de cero a experto | 7 | 6 | 0 |
| M2 | APIs REST y persistencia | Fase 1 · Spring Boot de cero a experto | 7 | 7 | 0 |
| M2B | Diseño y evolución de APIs | Fase 1 · Spring Boot de cero a experto | 7 | 0 | 0 |
| M3 | Testing y calidad | Fase 1 · Spring Boot de cero a experto | 7 | 4 | 0 |
| M4 | Caching y rendimiento | Fase 1 · Spring Boot de cero a experto | 7 | 4 | 0 |
| M5 | Introducción a microservicios y DDD | Fase 1 · Spring Boot de cero a experto | 7 | 4 | 0 |
| M5B | Modelado de dominio para servicios | Fase 1 · Spring Boot de cero a experto | 6 | 0 | 0 |
| M6 | Comunicación entre servicios | Fase 1 · Spring Boot de cero a experto | 7 | 4 | 0 |
| M6B | gRPC, GraphQL federado y tiempo real | Fase 1 · Spring Boot de cero a experto | 7 | 0 | 0 |
| M7 | Spring Cloud e infraestructura | Fase 1 · Spring Boot de cero a experto | 7 | 4 | 0 |
| M8 | Resiliencia | Fase 1 · Spring Boot de cero a experto | 7 | 4 | 0 |
| M9 | Seguridad: identidad y tokens | Fase 1 · Spring Boot de cero a experto | 7 | 6 | 0 |
| M9B | Seguridad: red, secretos y cadena de suministro | Fase 1 · Spring Boot de cero a experto | 6 | 3 | 0 |
| M10 | Observabilidad | Fase 1 · Spring Boot de cero a experto | 7 | 3 | 0 |
| M11 | Mensajería avanzada | Fase 1 · Spring Boot de cero a experto | 7 | 5 | 0 |
| M12 | Contenedores y Kubernetes para servicios Spring | Fase 1 · Spring Boot de cero a experto | 7 | 5 | 0 |
| M12B | Entrega continua y progresiva (pista Spring) | Fase 1 · Spring Boot de cero a experto | 6 | 2 | 0 |
| M12C | Arranque, huella y costo de runtime | Fase 1 · Spring Boot de cero a experto | 5 | 2 | 0 |
| M13 | JavaScript/TypeScript moderno y Node.js esencial | Fase 2 · Node.js de cero a experto | 7 | 7 | 7 |
| M14 | APIs REST con Express y NestJS | Fase 2 · Node.js de cero a experto | 6 | 4 | 4 |
| M15 | Persistencia y caché | Fase 2 · Node.js de cero a experto | 6 | 3 | 3 |
| M16 | Testing y calidad | Fase 2 · Node.js de cero a experto | 7 | 4 | 4 |
| M17 | Introducción a microservicios en Node | Fase 2 · Node.js de cero a experto | 7 | 4 | 4 |
| M18 | Comunicación | Fase 2 · Node.js de cero a experto | 7 | 6 | 6 |
| M19 | Resiliencia | Fase 2 · Node.js de cero a experto | 7 | 5 | 5 |
| M20 | Seguridad | Fase 2 · Node.js de cero a experto | 7 | 5 | 5 |
| M20B | Secretos y seguridad entre servicios en Node | Fase 2 · Node.js de cero a experto | 3 | 1 | 1 |
| M21 | Observabilidad | Fase 2 · Node.js de cero a experto | 7 | 5 | 5 |
| M22 | Mensajería y patrones de datos | Fase 2 · Node.js de cero a experto | 7 | 7 | 7 |
| M22B | Kafka a fondo desde Node | Fase 2 · Node.js de cero a experto | 5 | 0 | 0 |
| M23 | Docker, Kubernetes y CI/CD | Fase 2 · Node.js de cero a experto | 7 | 6 | 6 |
| M24 | Gobernanza arquitectónica | Fase 3 · Nivel maestro | 7 | 4 | 4 |
| M24B | Teoría de sistemas distribuidos para arquitectos | Fase 3 · Nivel maestro | 7 | 0 | 0 |
| M24C | Replicación, particionado y transacciones a escala | Fase 3 · Nivel maestro | 7 | 0 | 0 |
| M25 | Consistencia distribuida | Fase 3 · Nivel maestro | 7 | 4 | 4 |
| M25B | Ejecución duradera con Temporal a fondo | Fase 3 · Nivel maestro | 7 | 0 | 0 |
| M25C | CDC, proyecciones y datos derivados | Fase 3 · Nivel maestro | 7 | 0 | 0 |
| M25D | Evolución de datos sin corte | Fase 3 · Nivel maestro | 6 | 0 | 0 |
| M26 | Mensajería avanzada y event-driven | Fase 3 · Nivel maestro | 7 | 3 | 3 |
| M26B | Kafka por dentro y en operación | Fase 3 · Nivel maestro | 7 | 0 | 0 |
| M26C | Procesamiento de streams | Fase 3 · Nivel maestro | 7 | 0 | 0 |
| M26D | RabbitMQ y NATS en producción | Fase 3 · Nivel maestro | 7 | 0 | 0 |
| M27 | Seguridad Zero-Trust | Fase 3 · Nivel maestro | 7 | 4 | 4 |
| M27B | Service mesh a fondo | Fase 3 · Nivel maestro | 7 | 0 | 0 |
| M27C | Seguridad avanzada de datos y multi-tenencia | Fase 3 · Nivel maestro | 6 | 0 | 0 |
| M28 | FinOps y costo de arquitectura | Fase 3 · Nivel maestro | 6 | 4 | 4 |
| M29 | Team Topologies y organización | Fase 3 · Nivel maestro | 5 | 4 | 4 |
| M29B | Plataforma interna de desarrollo | Fase 3 · Nivel maestro | 6 | 0 | 0 |
| M30 | Anti-patrones y cuándo NO usar microservicios | Fase 3 · Nivel maestro | 7 | 4 | 4 |
| M31 | Migración desde monolito real | Fase 3 · Nivel maestro | 7 | 4 | 4 |
| M31B | Confiabilidad: SLO, incidentes y caos | Fase 3 · Nivel maestro | 7 | 0 | 0 |
| M31C | Capacidad, sobrecarga y pruebas de carga | Fase 3 · Nivel maestro | 7 | 0 | 0 |
| M31D | Multi-región y recuperación ante desastres | Fase 3 · Nivel maestro | 7 | 0 | 0 |
| M31E | Pruebas de un sistema distribuido | Fase 3 · Nivel maestro | 6 | 0 | 0 |
| M31F | Estilos vecinos y frontera con el cliente | Fase 3 · Nivel maestro | 5 | 0 | 0 |
| M32 | Proyecto Final y Comité de Arquitectura | Fase 3 · Nivel maestro | 7 | 7 | 7 |

## flutter

| Módulo | Título | Tramo | Temas | Escritos | Verificados |
|---|---|---|---:|---:|---:|
| M0 | Plataforma, herramientas y primera app | Tramo 1 · Fundamentos | 6 | 0 | 0 |
| M1 | Dart I: valores, tipos y control de flujo | Tramo 1 · Fundamentos | 7 | 0 | 0 |
| M2 | Dart II: funciones y colecciones | Tramo 1 · Fundamentos | 6 | 0 | 0 |
| M3 | Dart III: clases y objetos | Tramo 1 · Fundamentos | 7 | 0 | 0 |
| M4 | Dart IV: asincronía esencial y paquetes | Tramo 1 · Fundamentos | 6 | 0 | 0 |
| M5 | Widgets: el modelo declarativo | Tramo 1 · Fundamentos | 7 | 0 | 0 |
| M6 | Layout I: restricciones, filas, columnas y listas | Tramo 1 · Fundamentos | 6 | 0 | 0 |
| M7 | Interacción, entrada y formularios | Tramo 1 · Fundamentos | 6 | 0 | 0 |
| M8 | Navegación básica y tema | Tramo 1 · Fundamentos | 6 | 0 | 0 |
| M9 | Primera app completa: estado local, datos y prueba | Tramo 1 · Fundamentos | 7 | 0 | 0 |
| M10 | Dart V: sistema de tipos, genéricos y patrones | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M11 | Dart VI: diseño de objetos | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M12 | Dart VII: asincronía a fondo | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M13 | Layout II: scroll, slivers y diseño adaptable | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M14 | Widgets por dentro I: ciclo de vida, contexto y keys | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M15 | Navegación declarativa | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M16 | Gestión de estado comparada I: Provider, Riverpod, Bloc y MVVM | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M17 | Red: HTTP, JSON y autenticación | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M18 | Persistencia local | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M19 | Animaciones I | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M20 | Pruebas I: unitarias, de widget y golden | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M21 | Accesibilidad, internacionalización y diseño | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M22 | Plataforma I: plugins, permisos y funciones del dispositivo | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M23 | Los tres árboles y el pipeline de un frame | Tramo 3 · Integración | 7 | 0 | 0 |
| M24 | Gestos, foco y entrada avanzada | Tramo 3 · Integración | 6 | 0 | 0 |
| M25 | Gráficos propios: Canvas, texto y shaders | Tramo 3 · Integración | 6 | 0 | 0 |
| M26 | Animaciones II: física, coreografía y rendimiento | Tramo 3 · Integración | 6 | 0 | 0 |
| M27 | Gestión de estado comparada II y flujo de datos | Tramo 3 · Integración | 7 | 0 | 0 |
| M28 | Arquitectura de aplicaciones | Tramo 3 · Integración | 7 | 0 | 0 |
| M29 | Datos avanzados: offline-first y tiempo real | Tramo 3 · Integración | 7 | 0 | 0 |
| M30 | Firebase y backend como servicio | Tramo 3 · Integración | 6 | 0 | 0 |
| M31 | Concurrencia: isolates a fondo | Tramo 3 · Integración | 6 | 0 | 0 |
| M32 | Platform channels, Pigeon y vistas nativas | Tramo 3 · Integración | 7 | 0 | 0 |
| M33 | Paquetes y plugins propios | Tramo 3 · Integración | 6 | 0 | 0 |
| M34 | Pruebas II: integración, golden a fondo y dispositivos | Tramo 3 · Integración | 7 | 0 | 0 |
| M35 | Rendimiento I: medir con DevTools | Tramo 3 · Integración | 7 | 0 | 0 |
| M36 | Web y escritorio | Tramo 3 · Integración | 7 | 0 | 0 |
| M37 | Entrega: builds, flavors y CI/CD | Tramo 3 · Integración | 7 | 0 | 0 |
| M38 | Publicación en tiendas | Tramo 3 · Integración | 6 | 0 | 0 |
| M39 | Monetización I: compras dentro de la app | Tramo 3 · Integración | 6 | 0 | 0 |
| M40 | Monetización II: anuncios | Tramo 3 · Integración | 6 | 0 | 0 |
| M41 | IA en apps Flutter | Tramo 3 · Integración | 5 | 0 | 0 |
| M42 | RenderObjects y slivers propios | Tramo 4 · Experto | 7 | 0 | 0 |
| M43 | El motor por dentro e Impeller | Tramo 4 · Experto | 7 | 0 | 0 |
| M44 | Dart por dentro: VM, compilación y memoria | Tramo 4 · Experto | 7 | 0 | 0 |
| M45 | Metaprogramación y herramientas del lenguaje | Tramo 4 · Experto | 7 | 0 | 0 |
| M46 | FFI y código nativo en C y Rust | Tramo 4 · Experto | 7 | 0 | 0 |
| M47 | Interop con Kotlin y Swift, add-to-app y embebido | Tramo 4 · Experto | 6 | 0 | 0 |
| M48 | Rendimiento II: tamaño, arranque y memoria | Tramo 4 · Experto | 7 | 0 | 0 |
| M49 | Seguridad | Tramo 4 · Experto | 7 | 0 | 0 |
| M50 | Observabilidad y operación | Tramo 4 · Experto | 6 | 0 | 0 |
| M51 | Escala, evolución y criterio de experto | Tramo 4 · Experto | 7 | 0 | 0 |

## ios

| Módulo | Título | Tramo | Temas | Escritos | Verificados |
|---|---|---|---:|---:|---:|
| M0 | Entorno: Mac, Xcode y primer programa | Tramo 1 · Fundamentos | 6 | 0 | 0 |
| M1 | Swift: valores, tipos y operadores | Tramo 1 · Fundamentos | 6 | 0 | 0 |
| M2 | Control de flujo, funciones y closures | Tramo 1 · Fundamentos | 6 | 0 | 0 |
| M3 | Colecciones y opcionales | Tramo 1 · Fundamentos | 6 | 0 | 0 |
| M4 | Tipos propios: struct, enum y class | Tramo 1 · Fundamentos | 7 | 0 | 0 |
| M5 | Protocolos y genéricos: primer contacto | Tramo 1 · Fundamentos | 5 | 0 | 0 |
| M6 | SwiftUI: vistas y composición | Tramo 1 · Fundamentos | 7 | 0 | 0 |
| M7 | SwiftUI: layout esencial | Tramo 1 · Fundamentos | 6 | 0 | 0 |
| M8 | SwiftUI: estado e interacción básica | Tramo 1 · Fundamentos | 6 | 0 | 0 |
| M9 | Navegación básica y primera app completa | Tramo 1 · Fundamentos | 7 | 0 | 0 |
| M10 | Swift intermedio: modelar con tipos | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M11 | Protocolos y genéricos en serio | Tramo 2 · Aplicación | 6 | 0 | 0 |
| M12 | Memoria y ARC | Tramo 2 · Aplicación | 6 | 0 | 0 |
| M13 | Concurrencia I: async/await y tareas | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M14 | Estado y flujo de datos en SwiftUI | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M15 | Layout y componentes reutilizables | Tramo 2 · Aplicación | 6 | 0 | 0 |
| M16 | Navegación a fondo | Tramo 2 · Aplicación | 6 | 0 | 0 |
| M17 | Red I: URLSession y JSON | Tramo 2 · Aplicación | 6 | 0 | 0 |
| M18 | Persistencia I: SwiftData y archivos | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M19 | Pruebas I: Swift Testing y XCTest | Tramo 2 · Aplicación | 6 | 0 | 0 |
| M20 | Arquitectura I: separar responsabilidades | Tramo 2 · Aplicación | 6 | 0 | 0 |
| M21 | Herramientas del día a día | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M22 | Concurrencia II: actores y aislamiento | Tramo 3 · Integración | 7 | 0 | 0 |
| M23 | Concurrencia III: secuencias asíncronas y coordinación | Tramo 3 · Integración | 5 | 0 | 0 |
| M24 | Asincronía heredada: GCD, Operation y Combine | Tramo 3 · Integración | 4 | 0 | 0 |
| M25 | SwiftUI avanzado: animación y gestos | Tramo 3 · Integración | 7 | 0 | 0 |
| M26 | SwiftUI avanzado: layout propio, datos visuales y rendimiento | Tramo 3 · Integración | 7 | 0 | 0 |
| M27 | UIKit desde cero | Tramo 3 · Integración | 7 | 0 | 0 |
| M28 | UIKit moderno e interoperabilidad con SwiftUI | Tramo 3 · Integración | 7 | 0 | 0 |
| M29 | Persistencia II: SwiftData a fondo y Core Data | Tramo 3 · Integración | 7 | 0 | 0 |
| M30 | Red II: robustez | Tramo 3 · Integración | 7 | 0 | 0 |
| M31 | Sincronización y trabajo en segundo plano | Tramo 3 · Integración | 5 | 0 | 0 |
| M32 | Pruebas II: interfaz, integración y concurrencia | Tramo 3 · Integración | 7 | 0 | 0 |
| M33 | Accesibilidad e internacionalización | Tramo 3 · Integración | 7 | 0 | 0 |
| M34 | Capacidades del sistema I: permisos, notificaciones y sensores | Tramo 3 · Integración | 7 | 0 | 0 |
| M35 | Capacidades del sistema II: extensiones, widgets y App Intents | Tramo 3 · Integración | 7 | 0 | 0 |
| M36 | Seguridad y datos del usuario | Tramo 3 · Integración | 7 | 0 | 0 |
| M37 | Swift Package Manager y modularización | Tramo 3 · Integración | 7 | 0 | 0 |
| M38 | Firma, TestFlight y App Store | Tramo 3 · Integración | 7 | 0 | 0 |
| M39 | Monetización y crecimiento | Tramo 3 · Integración | 4 | 0 | 0 |
| M40 | Swift por dentro: tipos, despacho y ABI | Tramo 4 · Experto | 6 | 0 | 0 |
| M41 | Ownership y programación de sistemas | Tramo 4 · Experto | 7 | 0 | 0 |
| M42 | Macros y metaprogramación | Tramo 4 · Experto | 5 | 0 | 0 |
| M43 | Concurrencia por dentro | Tramo 4 · Experto | 6 | 0 | 0 |
| M44 | Rendimiento I: medir con Instruments | Tramo 4 · Experto | 7 | 0 | 0 |
| M45 | Rendimiento II: la app en producción | Tramo 4 · Experto | 6 | 0 | 0 |
| M46 | Arquitectura II: apps a escala | Tramo 4 · Experto | 7 | 0 | 0 |
| M47 | Seguridad avanzada | Tramo 4 · Experto | 5 | 0 | 0 |
| M48 | CI/CD e ingeniería de lanzamientos | Tramo 4 · Experto | 7 | 0 | 0 |
| M49 | Inteligencia en el dispositivo | Tramo 4 · Experto | 6 | 0 | 0 |
| M50 | Más allá del iPhone y criterio de experto | Tramo 4 · Experto | 7 | 0 | 0 |

## angular

| Módulo | Título | Tramo | Temas | Escritos | Verificados |
|---|---|---|---:|---:|---:|
| M0 | Plataforma, CLI y primer proyecto | Tramo 1 · Fundamentos | 6 | 0 | 0 |
| M1 | Componentes | Tramo 1 · Fundamentos | 7 | 0 | 0 |
| M2 | Plantillas y enlace de datos | Tramo 1 · Fundamentos | 7 | 0 | 0 |
| M3 | Directivas y pipes propios | Tramo 1 · Fundamentos | 5 | 0 | 0 |
| M4 | Signals: primer contacto | Tramo 1 · Fundamentos | 6 | 0 | 0 |
| M5 | Servicios e inyección de dependencias | Tramo 1 · Fundamentos | 5 | 0 | 0 |
| M6 | Enrutamiento esencial | Tramo 1 · Fundamentos | 6 | 0 | 0 |
| M7 | Formularios I | Tramo 1 · Fundamentos | 6 | 0 | 0 |
| M8 | HTTP y datos remotos | Tramo 1 · Fundamentos | 6 | 0 | 0 |
| M9 | Componentes avanzados | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M10 | Signals en profundidad | Tramo 2 · Aplicación | 6 | 0 | 0 |
| M11 | RxJS para Angular | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M12 | Enrutamiento avanzado | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M13 | Formularios II | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M14 | Estilos, componentes de interfaz y accesibilidad | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M15 | Pruebas I | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M16 | Gestión de estado | Tramo 2 · Aplicación | 6 | 0 | 0 |
| M17 | Arquitectura de la aplicación | Tramo 2 · Aplicación | 6 | 0 | 0 |
| M18 | Internacionalización | Tramo 2 · Aplicación | 5 | 0 | 0 |
| M19 | Build, despliegue y actualización | Tramo 2 · Aplicación | 5 | 0 | 0 |
| M20 | Detección de cambios por dentro | Tramo 3 · Integración | 6 | 0 | 0 |
| M21 | Inyección de dependencias avanzada | Tramo 3 · Integración | 6 | 0 | 0 |
| M22 | Renderizado en servidor e híbrido | Tramo 3 · Integración | 7 | 0 | 0 |
| M23 | SSR en producción | Tramo 3 · Integración | 5 | 0 | 0 |
| M24 | Rendimiento de carga y de ejecución | Tramo 3 · Integración | 6 | 0 | 0 |
| M25 | Pruebas II | Tramo 3 · Integración | 7 | 0 | 0 |
| M26 | PWA, service workers y web workers | Tramo 3 · Integración | 5 | 0 | 0 |
| M27 | Librerías, monorepos y herramientas | Tramo 3 · Integración | 6 | 0 | 0 |
| M28 | Seguridad avanzada | Tramo 3 · Integración | 5 | 0 | 0 |
| M29 | Angular Native (alfa): primeros pasos | Tramo 3 · Integración | 6 | 0 | 0 |
| M30 | Angular Native (alfa): arquitectura | Tramo 3 · Integración | 6 | 0 | 0 |
| M31 | Angular Native (alfa): interfaz nativa | Tramo 3 · Integración | 7 | 0 | 0 |
| M32 | Angular Native (alfa): CSS de Fabric y Tailwind | Tramo 3 · Integración | 6 | 0 | 0 |
| M33 | Angular Native (alfa): navegación nativa | Tramo 3 · Integración | 7 | 0 | 0 |
| M34 | Angular Native (alfa): formularios, datos y listas | Tramo 3 · Integración | 6 | 0 | 0 |
| M35 | Angular Native (alfa): dispositivo y módulos de Expo como servicios | Tramo 3 · Integración | 7 | 0 | 0 |
| M36 | Angular Native (alfa): capacidades avanzadas y código nativo | Tramo 3 · Integración | 6 | 0 | 0 |
| M37 | Angular Native (alfa): animación, gestos e iconos | Tramo 3 · Integración | 5 | 0 | 0 |
| M38 | Angular Native (alfa): pruebas, inspección y asistentes de IA | Tramo 3 · Integración | 7 | 0 | 0 |
| M39 | Angular Native (alfa): web, islands, escritorio e idiomas | Tramo 3 · Integración | 6 | 0 | 0 |
| M40 | Angular Native (alfa): compilación y publicación en tiendas | Tramo 3 · Integración | 7 | 0 | 0 |
| M41 | Alternativas para móvil con Angular: NativeScript, Ionic con Capacitor y PWA | Tramo 3 · Integración | 6 | 0 | 0 |
| M42 | Compilador y runtime por dentro | Tramo 4 · Experto | 6 | 0 | 0 |
| M43 | Microfrontends y arquitectura a escala | Tramo 4 · Experto | 6 | 0 | 0 |
| M44 | Rendimiento experto | Tramo 4 · Experto | 5 | 0 | 0 |
| M45 | Migraciones y código heredado | Tramo 4 · Experto | 6 | 0 | 0 |
| M46 | Angular con IA | Tramo 4 · Experto | 4 | 0 | 0 |
| M47 | Operación en producción | Tramo 4 · Experto | 6 | 0 | 0 |
| M48 | Evolución de Angular y criterio de experto | Tramo 4 · Experto | 5 | 0 | 0 |

## fundamentos

| Módulo | Título | Tramo | Temas | Escritos | Verificados |
|---|---|---|---:|---:|---:|
| M0 | El computador y tu entorno de trabajo | Tramo 1 · Fundamentos | 7 | 0 | 0 |
| M1 | La terminal desde cero | Tramo 1 · Fundamentos | 7 | 0 | 0 |
| M2 | Pensamiento computacional | Tramo 1 · Fundamentos | 6 | 0 | 0 |
| M3 | Programar I: datos y control | Tramo 1 · Fundamentos | 7 | 0 | 0 |
| M4 | Programar II: programas completos | Tramo 1 · Fundamentos | 6 | 0 | 0 |
| M5 | Cómo representa el computador la información | Tramo 1 · Fundamentos | 6 | 0 | 0 |
| M6 | Git I: el historial local | Tramo 1 · Fundamentos | 7 | 0 | 0 |
| M7 | Git II: ramas, remotos y GitHub | Tramo 1 · Fundamentos | 7 | 0 | 0 |
| M8 | Internet y la web desde cero | Tramo 1 · Fundamentos | 7 | 0 | 0 |
| M9 | Datos con forma: texto plano, JSON y YAML | Tramo 1 · Fundamentos | 6 | 0 | 0 |
| M10 | El shell como lenguaje | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M11 | Herramientas del oficio | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M12 | Diseño de programas y código limpio | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M13 | Pruebas básicas | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M14 | Estructuras de datos I: lineales y por clave | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M15 | Algoritmos I: buscar y ordenar | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M16 | SQL I: modelo relacional y consultas | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M17 | SQL II: diseño y consultas avanzadas | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M18 | HTTP a fondo I: semántica y diseño de API | Tramo 2 · Aplicación | 7 | 0 | 0 |
| M19 | La web como plataforma: HTML, CSS y accesibilidad | Tramo 2 · Aplicación | 5 | 0 | 0 |
| M20 | Git III: colaboración profesional | Tramo 3 · Integración | 7 | 0 | 0 |
| M21 | Git IV: por dentro y a escala | Tramo 3 · Integración | 7 | 0 | 0 |
| M22 | Sistemas operativos I: procesos y memoria | Tramo 3 · Integración | 7 | 0 | 0 |
| M23 | Sistemas operativos II: archivos, E/S y Linux observable | Tramo 3 · Integración | 7 | 0 | 0 |
| M24 | Concurrencia | Tramo 3 · Integración | 7 | 0 | 0 |
| M25 | Redes I: de la aplicación al cable | Tramo 3 · Integración | 7 | 0 | 0 |
| M26 | Seguridad I: pensar como atacante y como defensor | Tramo 3 · Integración | 7 | 0 | 0 |
| M27 | Redes II: diagnóstico e infraestructura | Tramo 3 · Integración | 6 | 0 | 0 |
| M28 | HTTP a fondo II: caché, conexiones y seguridad del protocolo | Tramo 3 · Integración | 7 | 0 | 0 |
| M29 | SQL III: transacciones y PostgreSQL por dentro | Tramo 3 · Integración | 7 | 0 | 0 |
| M30 | Modelos y almacenamiento de datos más allá de lo relacional | Tramo 3 · Integración | 7 | 0 | 0 |
| M31 | Seguridad II: el OWASP Top 10:2025 como concepto | Tramo 3 · Integración | 7 | 0 | 0 |
| M32 | Pruebas y calidad avanzadas, e integración continua | Tramo 3 · Integración | 7 | 0 | 0 |
| M33 | Requisitos, diseño y arquitectura | Tramo 3 · Integración | 6 | 0 | 0 |
| M34 | Catálogo de patrones de diseño I | Tramo 3 · Integración | 5 | 0 | 0 |
| M35 | Catálogo de patrones de diseño II | Tramo 3 · Integración | 5 | 0 | 0 |
| M36 | Desarrollo con asistentes y agentes de IA | Tramo 3 · Integración | 5 | 0 | 0 |
| M37 | Estructuras de datos II: árboles y estructuras especializadas | Tramo 4 · Experto | 7 | 0 | 0 |
| M38 | Grafos | Tramo 4 · Experto | 6 | 0 | 0 |
| M39 | Técnicas de diseño de algoritmos | Tramo 4 · Experto | 7 | 0 | 0 |
| M40 | Matemáticas discretas y probabilidad para software | Tramo 4 · Experto | 7 | 0 | 0 |
| M41 | Sistemas distribuidos I: red, réplicas y particiones | Tramo 4 · Experto | 4 | 0 | 0 |
| M42 | Sistemas distribuidos II: mensajes, acuerdo y operación | Tramo 4 · Experto | 5 | 0 | 0 |
| M43 | Cómo funciona un lenguaje de programación | Tramo 4 · Experto | 5 | 0 | 0 |
| M44 | Rendimiento con evidencia | Tramo 4 · Experto | 5 | 0 | 0 |
| M45 | Mapa de las ciencias de la computación y siguientes pasos | Tramo 4 · Experto | 7 | 0 | 0 |
