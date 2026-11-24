# Reestructuración de cursos y temas

Propuesta del 24-nov-2026. Parte de una revisión de los 16 cursos activos: 311 módulos y 1.530 temas (encabezados `### Tema`; RutaFlow queda fuera porque se retira).

## 1. Diagnóstico

### 1.1 El mismo concepto se explica en varios cursos

Hoy cada curso intenta ser autosuficiente y repite lo que necesita. El resultado son explicaciones paralelas del mismo concepto, con distinta profundidad y a veces con datos distintos.

| Concepto | Dónde se explica hoy | Nº de lugares |
|---|---|---|
| Microservicios, DDD, sagas, consistencia | spring-boot M15–M17 · spring-microservices M4, M10, M11, M13, M14 · node-microservices M9, M11, M15 · devops M19, M20, M21 · fundamentos M10 | 14 módulos |
| Diseño de sistemas (balanceo, CAP, capacidad) | devops M17 · fundamentos M10 · spring-microservices M4 T6 | 3 |
| Docker | devops M2, M3 · cloud M1, M14 · node-microservices M10 · spring-boot M19 · fundamentos M8 | 7 |
| Kubernetes | devops M6, M7, M15 · node-microservices M10 · spring-microservices M12 | 5 |
| CI/CD | devops M4, M5, M13, M16 · cloud M24 · node-microservices M10 · android M18 · KMP M10 | 8 |
| Observabilidad | devops M9, M10, M14 · spring-boot M7 · spring-microservices M9 · node M9 · node-microservices M8 · cloud M12 · fundamentos M10 | 9 |
| Seguridad (OWASP, OAuth2, JWT) | fundamentos M6 · devops M11 · spring-boot M5, M18 · spring-microservices M8 · node M6, M10 · node-microservices M7 · java M14, M18 | 10 |
| Mensajería (Kafka, RabbitMQ) | spring-boot M10, M11 · spring-microservices M10 · node-microservices M9 · devops M20 · cloud M3, M11, M17, M26 | 9 |
| Git | devops M1 · fundamentos M5 | 2 |
| Linux | devops M0, M18 · fundamentos M8 | 3 |
| TypeScript | javascript M11, M14 T1 · node M13 · react M11 | 4 |
| Kotlin (lenguaje) | android M0 · KMP M0, M1, M2 | 4 |
| Patrones de diseño | fundamentos M13 · java M12 · javascript M14 T9 | 3 |

### 1.2 Módulos duplicados dentro del mismo curso

| Curso | Duplicado | Qué pasó |
|---|---|---|
| Java | M4 *Streams y programación funcional* ↔ M20 *Java funcional* | M20 cubre lo mismo con 13 temas. **El Tema 5 de M4 que agregué hoy repite el Tema 1 de M20.** |
| Java | M8 *Build tools* + M9 *Pruebas* ↔ M15 *Build, testing y calidad* | Maven, Gradle y JUnit explicados dos veces |
| Java | M11 *JVM interna* ↔ M14 *JVM, rendimiento y seguridad* | Rendimiento y memoria de la JVM en dos módulos |
| Flutter | M14 ↔ M19 *Flutter para entregas* | Mismos temas: Riverpod, mapa, marcador, Socket.IO, offline, Dio |
| Flutter | M15 ↔ M20 *Flutter Master* | Pruebas, arquitectura y release |
| Flutter | M13 ↔ M18 *Flutter en producción* | Seguridad, secretos y rendimiento |
| Spring MS | M0 *Java moderno y Spring Boot* | Repite los cursos de Java y Spring Boot |
| Node MS | M0–M3 | Repite Node M0, M4, M5 y M7 (runtime, Express, persistencia, testing) |
| Microservicios | spring-microservices M4 T6 (agregado hoy) ↔ devops M17 | **Diseño de sistemas, explicado dos veces.** |

### 1.3 Temas que por su peso deberían ser cursos

Git, Linux, Docker, Kubernetes, CI/CD, Terraform, Observabilidad, Mensajería, Arquitectura, Seguridad, SQL, TypeScript y Kotlin hoy son módulos sueltos dentro de otros cursos. En el mercado son cursos completos y las certificaciones los tratan así (CKA/CKAD, Terraform Associate, Docker DCA). Como módulos, quedan cortos: Git tiene 8 temas, Mensajería 8 y Terraform 9.

---

## 2. Principio de la reestructuración

**Cada concepto tiene un solo curso dueño.** Los demás cursos no lo repiten: muestran un recuadro de **Requisitos** con enlace al curso y módulo dueños, y solo enseñan la **integración con su tecnología**.

Ejemplo: el circuit breaker se explica en *Arquitectura y diseño de sistemas*. *Microservicios con Spring* enseña Resilience4j, y *Microservicios con Node* enseña su librería equivalente. Ninguno de los dos repite qué es un circuit breaker.

---

## 3. Catálogo propuesto

### Capa 1 · Bases (independientes del lenguaje)

| Curso | Estado | Origen del contenido |
|---|---|---|
| Fundamentos de ingeniería de software | Se queda, más enfocado | Cede M4 (SQL), M6 (seguridad), M7 y M10 (arquitectura), M8 (Linux) y Git de M5 a sus nuevos cursos |
| **Git y control de versiones** | Nuevo | devops M1 + fundamentos M5 (parte Git) |
| **Linux y terminal** | Nuevo | devops M0, M18 + fundamentos M8 (parte Linux) |
| **Bases de datos y SQL** | Nuevo | fundamentos M4 + devops M17 T2; faltan PostgreSQL práctico, índices, planes de ejecución y transacciones |
| **Arquitectura y diseño de sistemas** | Nuevo | fundamentos M7, M10 · devops M17, M19, M21 · spring-boot M15 T1–T2 · conceptos de spring-microservices M4, M11, M13, M14 y node-microservices M11, M15 |
| **Seguridad de aplicaciones** | Nuevo | fundamentos M6 · devops M11 · conceptos de OAuth2, OIDC y JWT que hoy están en 6 cursos |

### Capa 2 · Lenguajes

| Curso | Estado | Cambio |
|---|---|---|
| Java | Se queda, sin duplicados | Fusiona M4+M20 (programación funcional), M8+M9+M15 (build y pruebas), M11+M14 (JVM) |
| JavaScript | Se queda | Cede M11 y M14 T1 a TypeScript |
| **TypeScript** | Nuevo | javascript M11, M14 T1 · node M13 · react M11 (la parte de lenguaje) |
| **Kotlin** | Nuevo | android M0 · KMP M0, M1, M2 |
| Dart | **Decisión pendiente** | Hoy es flutter M0 y M17. Solo se usa en Flutter, así que puede seguir dentro de ese curso. |

### Capa 3 · Plataformas y frameworks

| Curso | Estado | Cambio |
|---|---|---|
| Spring Boot | Se queda | Cede los conceptos de arquitectura, mensajería y microservicios; M16–M17 pasan a Microservicios con Spring |
| Microservicios con Spring | Se queda | Quita M0 (pasa a ser requisito); los conceptos se enlazan a Arquitectura; se queda con la implementación (Spring Cloud, Resilience4j, Tienda Aurora) |
| Node.js | Se queda | Cede M13 a TypeScript |
| Microservicios con Node | Se queda | Quita M0–M3 (pasan a ser requisito: Node); se queda con la implementación |
| Angular, React | Se quedan | React cede la parte de lenguaje de M11 a TypeScript |
| Flutter | Se queda, sin duplicados | Fusiona M14+M19, M15+M20, M13+M18 |
| Android | Se queda | Cede M0 a Kotlin |
| iOS | Se queda | Sin cambios de estructura |
| Kotlin Multiplatform | Se queda | Cede M0–M2 a Kotlin |

### Capa 4 · Infraestructura y operación

| Curso | Estado | Origen del contenido |
|---|---|---|
| **Docker y contenedores** | Nuevo | devops M2, M3 · cloud M1 · las partes de Docker de node-microservices M10 y spring-boot M19 |
| **Kubernetes** | Nuevo | devops M6, M7, M15 · las partes de Kubernetes de node-microservices M10 y spring-microservices M12 |
| **CI/CD y entrega continua** | Nuevo | devops M4, M5, M13, M16 |
| **Infraestructura como código** | Nuevo | devops M8 (Terraform/OpenTofu); CloudFormation se queda en Cloud |
| **Observabilidad y SRE** | Nuevo | devops M9, M10, M14; la instrumentación específica (Actuator, librerías de Node) se queda en cada framework |
| **Mensajería y arquitectura orientada a eventos** | Nuevo | devops M20 · spring-microservices M10 · conceptos de spring-boot M10–M11 y node-microservices M9 |
| Cloud (AWS, Azure, GCP con Floci) | Se queda | Absorbe devops M12 y M22 (laboratorios con Floci) |
| DevOps | **Pasa a ser una ruta** | Deja de ser curso: es el recorrido Linux → Git → Docker → Kubernetes → CI/CD → IaC → Observabilidad → Cloud |

### Aparte

Control 1 se queda tal cual: es material de la universidad.

**Resultado:** de 16 cursos se pasa a 28 cursos más una ruta (DevOps). Hay más cursos, pero más cortos y sin repetición; cada concepto queda en un solo lugar.

---

## 4. Tamaño de los cursos nuevos con el material que ya existe

| Curso nuevo | Temas que ya existen | Palabras | ¿Alcanza? |
|---|---|---|---|
| Arquitectura y diseño de sistemas | 26 | 43.492 | Sí; sobra material para consolidar |
| Seguridad de aplicaciones | 12 | 21.119 | Sí, más lo que se trae de los frameworks |
| Bases de datos y SQL | 7 | 19.765 | Base sólida; falta la parte práctica de PostgreSQL |
| Kubernetes | 24 | 6.217 | Temas suficientes; falta profundidad (v3) |
| CI/CD y entrega continua | 22 | 6.034 | Igual que Kubernetes |
| Docker y contenedores | 20 | 5.362 | Igual |
| Kotlin | 19 | 6.615 | Sí |
| Observabilidad y SRE | 16 | 3.970 | Hay que ampliar |
| Linux y terminal | 15 | 4.648 | Hay que ampliar |
| TypeScript | 11 | 5.036 | Hay que ampliar |
| Infraestructura como código | 9 | 1.979 | Corto; hay que ampliar |
| Git y control de versiones | 8 | 2.591 | Corto; hay que ampliar |
| Mensajería y eventos | 8 | 3.073 | Corto; hay que ampliar con Kafka y RabbitMQ |

---

## 5. Cómo se hace

1. **Fase 1 · Mover sin reescribir.** Crear los cursos nuevos con los módulos existentes, quitar los duplicados obvios (Flutter, Java y mis dos temas de hoy) y poner los recuadros de Requisitos. Cambia `course-data.ts`, los archivos `tracks/*.track.ts`, las rutas oficiales y el índice de temas.
2. **Fase 2 · Consolidar.** Donde dos módulos se fusionan, quedarse con la mejor explicación de cada tema y borrar la otra.
3. **Fase 3 · Completar.** Llevar los cursos cortos (Git, Terraform, Mensajería, Observabilidad, Linux) al estándar v3, con talleres probados como el de circuit breaker.

**Riesgos:**
- **Progreso y enlaces.** El progreso del alumno se guarda por curso y número de módulo (`localStorage`). Mover módulos rompe ese progreso y los enlaces a temas. Como el sitio aún no está publicado, este es el momento barato para hacerlo.
- **Pruebas de la app.** `app.spec.ts` y `learning-activities.spec.ts` cuentan los cursos; hay que actualizarlas, y de paso se corrigen las dos que hoy fallan por RutaFlow.
