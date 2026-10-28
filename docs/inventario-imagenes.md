# Inventario de imágenes de Descargas

Extracción de información de las imágenes en `~/Downloads`, organizada por tema
siguiendo el estilo del material de estudio de `merged.pdf`.

- **Estado:** en proceso (procesamiento por lotes de 3 para no saturar el contexto).
- **Fuente:** `~/Downloads` (24 imágenes únicas).
- **Material de referencia:** `merged.pdf` (69 páginas, prompts de estudio + cheatsheets) → texto en `docs/extraccion-pdf/merged-texto.txt`.

## Clasificación

Cada imagen se clasifica en:
- **Material técnico del proyecto** (RutaFlow / academia): temario, pantallas, código, arquitectura.
- **Material de estudio general**: prompts, cheatsheets, conceptos.
- **No relacionado**: memes, capturas personales, etc.

---

## Lote 1

### 1. `07DB3F7B-13F7-4453-9C79-B2992EC36A40.PNG` — Material técnico
**Tema:** Arquitectura de software — Modelo C4 y ADR (Architecture Decision Records).
Captura de un post de LinkedIn. Título: "C4 y ADR — del diagrama a la memoria de decisiones".

**Información extraída:**
- **Modelo C4** (4 niveles de abstracción para diagramar sistemas):
  1. **Context** — vista del sistema en su entorno (usuarios y sistema).
  2. **Containers** — aplicaciones y servicios principales (Aplicación Web, API, Worker, Base de Datos).
  3. **Components** — componentes dentro de un contenedor (Servicio de Pedidos → Controlador, Lógica de Negocio, Repositorio).
  4. **Code** — clases, módulos y detalles técnicos.
- **ADR (Architecture Decision Record)** — plantilla para documentar decisiones:
  - **Contexto:** ¿cuál es el problema o situación que motivó la decisión?
  - **Decisión:** ¿qué se decidió y por qué?
  - **Alternativas:** ¿qué otras opciones se consideraron?
  - **Consecuencias:** ¿qué implicaciones tiene esta decisión?
- **Idea central:** los diagramas documentan sistemas; las decisiones documentan el pensamiento arquitectónico. Flujo: Diagrama → Decisión → Memoria de arquitectura.
- **Regla práctica:** dibuja el sistema con C4; si en un año nadie entenderá por qué se tomó una decisión, necesitas un ADR.
- **Tags:** #SoftwareArchitecture #C4Model #ADR #SystemDesign.

**Relevancia RutaFlow:** alta. Aplicable al track de arquitectura/backend para documentar el diseño del sistema.

### 2. `095A28B9-D208-4942-B22A-AF562E2457FE.PNG` — Material de electrónica/circuitos
**Tema:** Ejercicio de circuitos eléctricos (sistemas y control).
Captura de Facebook (grupo "Ayuda Circuitos Eléctricos").

**Información extraída:**
- Enunciado: "Del sistema eléctrico mostrado en la figura, halle el modelo matemático y construya un diagrama de bloques del mismo."
- Circuito: fuente v1 (AC) → inductor L (corriente i_L) → nodo con resistencia R en paralelo → condensador C (tensión v_c, corriente i_c) → fuente v2 (AC).
- Es un circuito RLC con dos fuentes, típico de modelado matemático y teoría de control (función de transferencia + diagrama de bloques).

**Relevancia RutaFlow:** baja (es electrónica/control, no software). Relacionado con el contenido de electrónica de `merged.pdf`.

### 3. `131607D4-2F83-4CF8-BC54-CFB2CFF588A7.PNG` — Material técnico (seguridad/fintech)
**Tema:** Tokenización de pagos con tarjeta.
Infografía de LinkedIn (Félix Tena, pagos B2B / fintech).

**Información extraída:**
- **¿Qué es?** La tokenización reemplaza los datos reales de la tarjeta por un código único (token). Si alguien lo roba, no le sirve.
- **¿Cómo funciona?** Al pagar en línea viaja el token en lugar del número real. Si un comercio es hackeado, los datos quedan a salvo (el hacker obtiene datos inútiles).
- **¿Por qué es importante?**
  - Menos riesgo de fraude.
  - Pagos con un clic (como Apple Pay o Google Pay).
  - Más confianza y seguridad.
- Permite comprar sin exponer los datos y facilita pagos rápidos y seguros.

**Relevancia RutaFlow:** media. Aplicable si el backend maneja pagos; concepto clave de seguridad.


---

## Lote 2

### 4. `1832B290-561D-4287-A11B-A051A72603E2.PNG` — Material técnico (Java/Spring + IA)
**Tema:** Spring AI 2026 — puente entre Java e IA generativa.
Infografía de LinkedIn (Viron Technologies).

**Información extraída (mapa de capacidades):**
- **Spring Boot 4:** framework de nueva generación, arquitectura modular, mejor rendimiento, soporte Java 25.
- **Spring AI 2.0:** release GA con integración mejorada de LLM, agentes de IA y tool calling, capacidades enterprise.
- **AI Agents:** tool calling y ejecución de funciones, sistemas multi-agente, integración con herramientas enterprise, automatización de procesos de negocio.
- **RAG Improvements:** mejor búsqueda de documentos, respuestas con contexto, integración de datos enterprise, soporte de vector stores.
- **Vector Databases:** embeddings mejorados, mejor recuperación, grounding de datos; casos de uso en banca, salud, retail.
- **Microservices & Cloud Native:** soporte Kubernetes, despliegues en contenedores, arquitectura serverless/cloud-ready, escalabilidad y resiliencia.
- **Enterprise AI Integration:** integración fácil con OpenAI, Anthropic y otros LLMs; despliegues seguros.
- **API & Developer Experience:** mejores clientes HTTP, versionado de API, configuración simplificada, mejor tooling y SDKs.
- **Observability & Monitoring:** logging y tracing mejorados, monitoreo de cargas de IA, estabilidad de grado producción.
- **Security & Compliance:** autenticación mejorada (OAuth2, JWT), escaneo de vulnerabilidades de dependencias, integraciones de IA seguras.

**Relevancia RutaFlow:** muy alta. Material directo para el track Java/Spring Boot (y módulos de IA si existen).

### 5. `2C4EC0D1-E591-4891-BFCD-F6ECDF6116F5.PNG` — No relacionado
**Tema:** ROM hack de Pokémon "Recharged Yellow" (GBA), post de Facebook de RomsDex.
No tiene relación con el proyecto ni con material de estudio técnico. Descartable.

### 6. `2DEB0ECE-6AE1-4EFA-BF5F-7A9B7FD2126D.PNG` — Material de estudio general
**Tema:** Libro "Blockchain Práctico" de Joaquim de Dalmases (editorial Marcombo).
Post de Facebook (Zfly / dogramcode.com).

**Información extraída:**
- Guía de aprendizaje para llevar a programadores desde los fundamentos teóricos hasta el desarrollo real de aplicaciones descentralizadas (DApps).
- Referencia: https://dogramcode.com/libro/blockchain

**Relevancia RutaFlow:** baja/media. Recurso de referencia sobre blockchain, no central al proyecto.


---

## Lote 3

### 7. `4620C2A8-FA33-45CB-9111-CBAD4D508AAD.PNG` — Material técnico (arquitectura Java)
**Tema:** Arquitectura hexagonal + DDD — puertos del dominio vs. framework.
Post de LinkedIn (Sergi Rivero Galán, Senior Backend Engineer).

**Información extraída:**
- Principio: "Tu dominio no debería saber que existe Spring". Si lo sabe, no hay arquitectura hexagonal, solo carpetas con nombres bonitos.
- El síntoma está en los puertos:
  - ❌ Puerto atado al framework: `public interface ReservaRepository { Page<ReservaEntity> buscar(Pageable pageable); }` → el dominio depende de Spring Data y de una entidad JPA.
  - ✅ Puerto con tipos del dominio: `public interface ReservaRepository { List<Reserva> buscarDisponibles(Vehiculo vehiculo, Periodo periodo); }` → habla el idioma del negocio.
- El adaptador de infraestructura traduce: recibe la llamada, usa JPA/Pageable, y devuelve objetos del dominio.
- **Beneficios:** tests del dominio sin levantar Spring (milisegundos); cambiar BD o framework sin tocar reglas de negocio; código que se entiende leyendo el dominio, no el framework.
- **Tags:** #ArquitecturaHexagonal #DDD #SpringBoot #Java #CleanArchitecture.

**Relevancia RutaFlow:** muy alta. El ejemplo (Reserva, Vehiculo, Periodo) encaja con el dominio logístico. Directo para el track Java (arquitectura).

### 8. `796B5B34-84EC-4776-A94F-7CA78758F70B.PNG` — Material técnico (Java funcional)
**Tema:** Interfaces funcionales de Java y su relación con Streams.
Post de LinkedIn (David L., AI Solutions Architect).

**Información extraída (las 4 interfaces funcionales base):**
- **Predicate<T>** — *decide*: `filter()`, devuelve true/false, es una regla o condición.
- **Function<T,R>** — *transforma*: `map()`, convierte un valor en otro (entrada → salida).
- **Consumer<T>** — *actúa*: `forEach()`, recibe un valor y no devuelve resultado (ejecuta una acción).
- **Supplier<T>** — *provee*: `generate()`, produce/entrega un valor cuando se necesita.
- **Idea central:** los Streams no son el fundamento; son una API que **compone comportamiento**. Mapeo rápido: ¿Condición? → Predicate; ¿Transformación? → Function; ¿Acción? → Consumer; ¿Fuente de valores? → Supplier.

**Relevancia RutaFlow:** alta. Material directo para el track Java (programación funcional / Streams).

### 9. `7D30EBD9-94E2-478D-918C-D5269AB2F15E.PNG` — Material técnico (ruta backend Spring Boot)
**Tema:** "Spring Boot Completo Explicado" — 9 capas fundamentales del backend.
Post de LinkedIn (infografía tipo roadmap).

**Información extraída (las 9 capas):**
1. **Fundamentos y Configuración:** Spring Boot, Java, Spring Initializr, application.yml. Conceptos básicos, estructura del proyecto y configuración inicial.
2. **Desarrollo de APIs REST:** @RestController, @RequestMapping, @GetMapping, @PostMapping, @PutMapping. Creación de endpoints REST, manejo de peticiones/respuestas.
3. **Acceso a Datos:** Spring Data JPA, Hibernate, MySQL, PostgreSQL, MongoDB. Integración con BD, repositorios y CRUD.
4. **Seguridad:** Spring Security, JWT, OAuth 2.0, Roles y Permisos, CORS. Autenticación, autorización, control de roles y protección de endpoints.
5. **Arquitectura y Buenas Prácticas:** arquitectura en capas, DTOs, validaciones, manejo de excepciones, patrones.
6. **Servicios Avanzados:** Spring Scheduling, Spring Events, Spring Batch, Cache, envío de emails. Tareas programadas, procesamiento en segundo plano.
7. **Integración y APIs Externas:** RestTemplate, WebClient, APIs externas, Feign Client, microservicios.
8. **Despliegue y DevOps:** Docker, Docker Compose, Jenkins, GitHub Actions, AWS. Contenedores, CI/CD y despliegue en la nube.
9. **Monitoreo y Observabilidad:** Spring Actuator, Prometheus, Grafana, ELK Stack, Sentry. Métricas, logs, trazabilidad y monitoreo en producción.

**Relevancia RutaFlow:** muy alta. Es prácticamente un índice de ruta para el track backend Java/Spring. Útil para validar linealidad y cobertura de temas.


---

## Lote 4

### 10. `BDF66880-683C-4725-B4E5-B69406A606F8.PNG` — Material de referencia (DevOps)
**Tema:** Curso de administración de servidores VPS seguros.
Video de TikTok (Halltec) recomendando un curso de Udemy de JuanD MeGon.

**Información extraída:**
- Curso "VPS Seguro en Ubuntu 20.04 con Letsencrypt, Cloudflare y más" (4.8★, 389 valoraciones, 1611 estudiantes).
- Objetivo: preparar, asegurar y mantener un servidor VPS para publicar proyectos de forma segura (HTTPS con Letsencrypt, Cloudflare, manejo de sitios www/no-www).

**Relevancia RutaFlow:** media. Referencia para el track DevOps/despliegue (publicar el backend en un VPS seguro).

### 11. `DA1606C0-14B3-4679-868E-3109B9C323B0.PNG` — Material técnico (routing geoespacial) ⭐
**Tema:** Cálculo de rutas con OSRM en Docker.
Post de Facebook (Codex en Español) con hilo de comentarios técnicos.

**Información extraída:**
- Imagen de un mapa con rutas calculadas (original routes, sector routes, street distance, euclidean distance) sobre un mapa de Google (zona Ixelles/Bruselas).
- Discusión técnica: **OSRM (Open Source Routing Machine) en contenedor Docker**. Puedes bajar el archivo OSM de tu país; si solo necesitas tu estado/región, recórtalo usando los polígonos de tu zona y elimina los demás para que no sea tan pesado.
- Casos de uso confirmados en el hilo: calcular rutas de un punto A a un punto B (routing), y potencialmente geolocalización para mostrar puntos.

**Relevancia RutaFlow:** MUY ALTA. RutaFlow es logística/entregas con GPS y trazado de rutas. OSRM en Docker es exactamente la tecnología de routing que el proyecto necesitaría. Candidato directo a tema del track backend/cloud.

### 12. `DF30F937-9D94-4774-8F1A-9D4395561860.PNG` — Material de referencia (backend avanzado)
**Tema:** Curso "Kafka y Spring Boot: Arquitectura Event-Driven".
Anuncio de Facebook (DevTalles, por Gabriel Alejandro Chaldu).

**Información extraída:**
- Tema: arquitectura orientada a eventos (event-driven) con Apache Kafka + Spring Boot.
- Referencia: cursos.devtalles.com (cupón KAFKA26).

**Relevancia RutaFlow:** media/alta. La arquitectura event-driven con Kafka encaja con sistemas de logística en tiempo real (eventos de entregas, tracking). Tema avanzado para el track Java/backend.


---

## Lote 5

### 13. `E0931544-6A91-4E88-9F60-290FCB124816.PNG` — Material de referencia (móvil)
**Tema:** Libro "Programación Nativa de Dispositivos Móviles: Arquitectura, rendimiento, seguridad e identidad digital" (José Antonio Álvarez Bermejo).
Post de Facebook (Facialix).

**Información extraída:**
- No es una introducción a Kotlin ni un recetario de Android Studio. Parte del dispositivo real: el SoC, la jerarquía de memoria, la gestión térmica y la cadena de arranque.
- Enfoque de bajo nivel para programación móvil nativa.

**Relevancia RutaFlow:** baja/media. Referencia para el track móvil (app Flutter), aunque es más de nivel hardware/nativo que de Flutter.

### 14. `IMG_1030.PNG` — ⭐⭐ TEMARIO MAESTRO DE RUTAFLOW (documento central)
**Tema:** Índice completo del proyecto RutaFlow, dividido en APP (Flutter) y BACKEND (Spring Boot).
Captura de notas de la app.

**Información extraída — ÍNDICE OFICIAL DEL PROYECTO:**

**APP (Flutter):**
1. Diseño de pantallas
2. Riverpod (gestor de estado)
3. Mapas de Google
4. Localización en tiempo real
5. Socket.IO
6. Trazado y actualización de rutas
7. Animaciones de localización
8. Almacenamiento local
9. Manejo de imágenes
10. Peticiones HTTP (Dio)
11. Notificaciones Push

**BACKEND (Spring Boot / Java):**
1. Spring Boot (lenguaje Java)
2. MySQL (base de datos)
3. Datos espaciales con MySQL
4. JPA / Hibernate
5. Spring Security
6. Socket.IO (tiempo real)
7. Almacenamiento de archivos
8. CRUD API
9. (Create, Read, Update, Delete)
10. JWT (Bearer Token)
11. Protección de rutas por ROLES de usuario
12. Notificaciones Push

**Relevancia RutaFlow:** MÁXIMA. Este es el temario de referencia que define el alcance del proyecto. Es la base para el plan de estudio (fase final). Todas las demás imágenes técnicas se mapean contra este índice.

### 15. `IMG_1046.PNG` — Material de referencia (UX de plataforma de aprendizaje)
**Tema:** Plataforma Coddy.tech (onboarding de aprendizaje de programación).
Captura de TikTok.

**Información extraída:**
- Pantalla de onboarding "¿Qué deseas aprender?" con asistente/mascota y opción "Ayúdame a elegir".
- Lista de lenguajes con nº de estudiantes: Python (1.86M), HTML (281K), JavaScript (268K), Java (233K), C++ (236K)...
- Concepto: lecciones cortas donde se escribe código real.

**Relevancia RutaFlow:** media (como referencia de UX/producto). Inspiración para el diseño del onboarding y selección de ruta de la academia The Imperial Book.

---

## Lote 6 (imágenes 16-18)

### IMG_1099.PNG — No relacionado
Reel de Instagram reseñando una novela de ficción ("El Escultor", de Olivia Ortiz). Literatura, sin relación con el proyecto.

### IMG_1224.PNG — No relacionado
Captura de Facebook: escena de la película "Memorias de un caracol" (2024) con la frase "La vida solo puede ser comprendida hacia atrás, pero debe ser vivida hacia adelante", seguida de un anuncio de Google Gemini. Sin relación técnica.

### IMG_1233.PNG — No relacionado
Clip de TikTok de la película animada "American Pop" (1981, Ralph Bakshi). Sin relación con el proyecto.

---

## Lote 7 (imágenes 19-21)

### IMG_1292.PNG — No relacionado
Clip de TikTok ("Categoria Cine") sobre la película "Meet the Feebles" de Peter Jackson. Sin relación con el proyecto.

### IMG_1293.PNG — No relacionado
Clip de TikTok ("El Umbral 60") sobre una escena de cine de terror psicológico. Sin relación con el proyecto.

### IMG_1324.PNG — Material técnico del proyecto (ACTUALIZACIÓN DE VERSIONES)
Post de LinkedIn (Aitor M., Full Stack Java/React) con infografía oficial "Nuevos milestones en el ecosistema Spring" para 2026. Versiones milestone anunciadas:

| Componente | Versión milestone |
|---|---|
| Spring Boot | 4.2.0-M2 |
| Spring Framework | 7.1.0-M2 |
| Spring AI | 2.1.0-M1 |
| Spring Data | 2026.1.0-M2 |
| Spring Security | 7.2.0-M2 |
| Spring Integration | 7.2.0-M2 |
| Spring AMQP | 4.2.0-M2 |
| Spring Cloud | 2026.0.0-M1 (Paddington) |

**Relevancia:** altísima. Sirve para contrastar las versiones baseline del track Java/Spring Boot. Nota: son versiones **milestone (M1/M2)**, no estables (GA); el contenido del curso debe apoyarse en las versiones GA vigentes, usando estos milestones solo como señal de hacia dónde va el ecosistema. Contrastar siempre contra la documentación oficial de Spring antes de actualizar.

---

## Lote 8 (imágenes 22-26, final)

### IMG_1342.PNG — Material técnico del proyecto (referencia de temario)
Anuncio de Humble Bundle: "The Complete Java Developer Bundle". Lista temas de un paquete de cursos Java: pipelines CI/CD con Jenkins, fundamentos de Spring Framework, Selenium WebDriver (pruebas de UI), estructuras de datos y algoritmos. Es publicidad, pero el temario sirve como referencia de qué espera el mercado de un "Java developer completo". Relevancia media.

### IMG_1353.PNG — Material técnico del proyecto (herramienta)
Clip (midudev) sobre **Archify**: herramienta open source (licencia MIT) que convierte una descripción en texto plano, o una base de código, en diagramas de arquitectura interactivos; produce JSON IR y compila a HTML/SVG. Relevante: Archify ya está integrado como skill en este repo (`.claude/skills/archify`). Confirma que la herramienta usada para los diagramas del proyecto es real y vigente.

### IMG_1386.PNG — Material técnico del proyecto (herramienta IA)
Post de Instagram sobre **Flint**: IA de programación que se descarga y ejecuta localmente, sin suscripción ni conexión a internet; licencia Apache 2.0, corre en un portátil. Referencia de herramienta de IA local. Relevancia baja-media (herramienta de apoyo, no temario).

### image.png — Material técnico del proyecto (configuración backend RutaFlow)
Captura de un error de pipeline CI/CD: paso "Replace tokens · 2 errors" con las variables no encontradas:
- `KEYCLOAK_AUTH_API_URL`
- `PASSWORD_RECOVERY_SECRET`

**Relevancia:** confirma detalles reales del backend de RutaFlow: usa **Keycloak** para autenticación (coherente con el fichero `couriers-keycloak-dev.env` visto en Descargas) y tiene un flujo de **recuperación de contraseña** con secreto. Útil para los temas de seguridad/autenticación del backend.

### PHOTO-2026-10-20-10-29-12.jpg — No relacionado
Calendario escolar de noviembre de un liceo (evaluaciones, matrículas, clausura). Sin relación con el proyecto.

---

## Resumen del inventario

**Total de imágenes únicas procesadas: 24** (se excluyeron 10 duplicados con sufijos " 2"/" 3", verificados por hash MD5 idéntico).

### Material técnico del proyecto (12 imágenes)
| Imagen | Tema | Relevancia |
|---|---|---|
| IMG_1030 | **Temario maestro RutaFlow (APP Flutter + BACKEND Spring Boot)** | Máxima |
| IMG_1324 | Milestones ecosistema Spring 2026 (versiones) | Alta |
| 1832B290 | Spring AI 2026 (Java + IA) | Alta |
| 7D30EBD9 | Java funcional: interfaces funcionales + Streams | Alta |
| (7D30... duplicado conceptual) Spring Boot 9 capas | Mapa de ruta backend | Alta |
| 4620C2A8 | Arquitectura hexagonal / DDD en Java+Spring | Alta |
| DA1606C0 | OSRM en Docker (cálculo de rutas A→B) | Alta (logística RutaFlow) |
| 07DB3F7B | Modelo C4 + ADR (arquitectura) | Alta |
| 131607D4 | Tokenización de pagos (seguridad) | Media |
| image.png | Config backend: Keycloak + recuperación de contraseña | Media |
| DF30F937 | Curso Kafka + Spring Boot (event-driven) | Media |
| IMG_1353 | Archify (diagramas de arquitectura) | Media |
| IMG_1342 | Temario "Java Developer" (Jenkins, Spring, Selenium) | Media |
| IMG_1386 | Flint (IA local) | Baja-media |
| IMG_1046 | Coddy.tech (UX de plataforma de aprendizaje) | Baja-media (inspiración UX) |
| 2DEB0ECE | Libro "Blockchain Práctico" | Baja |
| E0931544 | Libro programación nativa móvil | Baja |
| BDF66880 | Curso VPS/Ubuntu seguro | Baja (DevOps) |

### No relacionado (memes, cine, literatura, otros) — 7 imágenes
IMG_1099 (novela), IMG_1224 (cine), IMG_1233 (cine), IMG_1292 (cine), IMG_1293 (cine), 2C4EC0D1 (Pokémon ROM hack), 095A28B9 (ejercicio circuito RLC), PHOTO-...(calendario escolar).

> Nota: el ejercicio de circuito RLC (095A28B9) es técnico pero de electrónica/control, no de software; encaja mejor con el material del merged.pdf (electrónica) que con la academia de programación.

---

## Temas adicionales encontrados en merged.pdf (69 páginas)

> El PDF es una recopilación de capturas: cheatsheets, cursos y referencias de programación.
> Estos temas NO estaban en el inventario de imágenes y se añaden aquí.

### Prompts de aprendizaje
- Prompt "explícame como si tuviera 10 años" (método de estudio en 7 pasos).

### Java (varios)
- **Master Java en 30 días** (ruta día a día):
  - Semana 1 — Básicos: JDK/IDE, variables y tipos, operadores, E/S (Scanner), condicionales, bucles.
  - Semana 2 — POO: clases y objetos, arquitectura JVM, constructores, métodos y sobrecarga, static, herencia, sobreescritura, final, modificadores de acceso.
  - Semana 3 — Avanzado + estructuras de datos: clases abstractas e interfaces, manejo de excepciones (try/catch/finally/throw/throws), arrays 1D/2D, String/StringBuilder/StringBuffer, Collections (ArrayList, LinkedList, HashMap, TreeMap, HashSet, TreeSet).
  - Semana 4 — Proyectos + algoritmos: Stack y Queue, Linked List, árboles y BST, algoritmos de búsqueda y ordenamiento (lineal, binaria, bubble, selection, insertion, merge, quick), preguntas de entrevista, proyecto CRUD con File Handling o JDBC, subir proyecto a GitHub.
- **La evolución de Java** (línea de tiempo): Java 1.0 (1995), Java 8 (lambdas, Streams API, java.time), Java 11 (LTS), Java 17 (record, sealed classes, switch mejorado, pattern matching para instanceof), Java 21+ (Virtual Threads / Project Loom, pattern matching avanzado).
- **Java Collections API** por dentro.

### Seguridad / autenticación
- **JWT en detalle**: estructura del token (Header, Payload/claims, Signature), flujo cliente→API→token, algoritmo (HS256), almacenamiento en sessionStorage/cookie, header `Authorization: Bearer <token>`, endpoints `/api/auth/login`, `/api/usuarios`.

### API testing / QA
- **QA Automation de APIs con Postman** (curso, 6 clases):
  - Qué es una API REST, métodos HTTP.
  - Requests, Collections, Variables.
  - Scripts, Assertions, validaciones automáticas.
  - Newman (ejecución desde consola, reportes HTML, automatización).
  - Jenkins (instalación, Jobs, Pipelines, Jenkinsfile).
  - Proyecto final: integración completa CI/CD, simulación de entorno laboral.

### Arquitectura
- **Arquitectura hexagonal** (en el PDF): entities, repositories, puertos (interfaces), lógica de dominio y modelos, capa `shared`, excepciones y manejo, validación en bordes (API). Stack: PostgreSQL, Docker, OpenAPI/Swagger. Mensaje: dominio aislado, dependencias controladas.

### Angular (moderno)
- **Angular 22 con Signals**: paso de Observables (RxJS) a Signals, `httpResource`, UI reactiva sin subscribes/async pipe/boilerplate, change detection (Default vs OnPush), REST APIs. Caso real: plataforma de empleo para restaurantes.

### Electrónica (del PDF, no es software)
- Matemáticas aplicadas, circuitos eléctricos, electrónica analógica, electrónica digital (índice de material de electrónica).

### CRUD / API REST (en el PDF)
- Endpoints REST de ejemplo: `GET/POST/PUT/DELETE /api/usuarios`, códigos de estado, convenciones de APIs modernas.
