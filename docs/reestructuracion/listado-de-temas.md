# Listado de temas por curso (2026-11-20)

Generado desde las lecciones para la auditoría de specs/021. La misma tabla, con columnas para anotar, está en
`listado-de-temas.csv`.

| Curso | Módulos | Temas |
|---|---|---|
| android | 19 | 83 |
| angular | 17 | 78 |
| cloud | 35 | 168 |
| control-1 | 29 | 88 |
| devops | 23 | 139 |
| flutter | 23 | 119 |
| foundations | 16 | 105 |
| ios | 15 | 69 |
| java | 23 | 120 |
| javascript | 15 | 92 |
| kotlin-multiplatform | 14 | 66 |
| microservices | 37 | 187 |
| node | 14 | 78 |
| react | 15 | 64 |
| rutaflow | 8 | 29 |
| spring-boot | 21 | 123 |
| **Total** | 324 | 1608 |

## android

**Módulo 0 · Módulo 0: Kotlin aplicado a Android**
1. Estructura de un proyecto Android Studio
2. Recursos externalizados
3. AndroidManifest.xml y módulos Gradle
4. Kotlin esencial para Android — lo que usarás en cada pantalla
5. Lambdas y funciones de orden superior en Kotlin — contratos, captura y receptores — Intermedio
6. Coroutines — asincronía sin bloquear la UI

**Módulo 1 · Módulo 1: Ciclo de vida: Activities y ViewModel**
1. Ciclo de vida de una Activity
2. ViewModel sobrevive a la rotación
3. SavedStateHandle

**Módulo 2 · Módulo 2: Jetpack Compose: UI declarativa**
1. Composables y recomposición
2. State hoisting
3. remember, rememberSaveable y layout básico
4. Material 3 en Compose: tema, color dinámico y componentes — Intermedio

**Módulo 3 · Módulo 3: Navegación con Navigation Compose**
1. NavHost y NavController
2. Argumentos tipados y deep links
3. Navegación anidada con stacks independientes
4. Predictive Back — gesto del sistema con preview animado

**Módulo 4 · Módulo 4: Estado con StateFlow y Compose**
1. StateFlow en el ViewModel
2. collectAsStateWithLifecycle y UDF
3. SharedFlow para eventos de un solo uso
4. Restaurar un borrador tras recreación: remember no equivale a rememberSaveable

**Módulo 5 · Módulo 5: Networking con Retrofit/Ktor**
1. Retrofit con coroutines
2. Manejo de errores HTTP
3. Interceptores de OkHttp

**Módulo 6 · Módulo 6: Persistencia local con Room**
1. Entities, DAOs y Database
2. Room + Flow reactivo, y migraciones
3. Estrategia offline-first

**Módulo 7 · Módulo 7: Inyección de dependencias con Hilt**
1. Configuración básica de Hilt
2. @Provides y @Binds
3. Scopes y testing con Hilt

**Módulo 8 · Módulo 8: Trabajo en segundo plano**
1. CoroutineWorker y garantía de ejecución
2. Constraints y trabajo periódico
3. Notificaciones desde background work

**Módulo 9 · Módulo 9: Testing en Android**
1. Testing de ViewModels con fakes y runTest
2. Compose UI Testing
3. Testing end-to-end con Activity real, y fakes vs mocks

**Módulo 10 · Módulo 10: Performance, Material 3 y accesibilidad**
1. Detectar y corregir recomposición innecesaria
2. Baseline Profiles y ciclo de efectos
3. Accesibilidad e interop con Views

**Módulo 11 · Módulo 11: Publicación en Google Play**
1. Firma de la app
2. App Bundle vs APK
3. Versionado, tracks y políticas

**Módulo 12 · Módulo 12: Proyecto integrador: app Android completa**
1. Arquitectura MVVM completa con UDF
2. Inyección de dependencias en toda la app
3. Cierre del track y próximos pasos
4. Capa de dominio y casos de uso: reglas de negocio fuera del ViewModel — Avanzado

**Módulo 13 · Módulo 13: Android en producción — seguridad, sincronización y calidad**
1. El sistema operativo conecta tu app con entradas externas
2. Proteger datos exige conocer copias y ciclo de vida
3. Offline-first necesita un protocolo de cambios
4. La calidad se opera por dispositivo y versión
5. Del dispositivo al diagnóstico: SoC, memoria, límites térmicos y arranque verificado

**Módulo 14 · Módulo 14: Compose Master — pruebas, accesibilidad y animación**
1. ComposeTestRule ejecuta tu UI sin emulador visible
2. Finders, assertions y actions navegan el árbol semántico
3. Semantics y clearAndSetSemantics definen qué percibe la accesibilidad
4. AccessibilityService y TalkBack consumen el árbol semántico en producción
5. Animaciones de estado y visibilidad usan una especificación medible
6. AnimatedContent y AnimationSpec especifican transiciones completas

**Módulo 15 · Módulo 15: Android como plataforma — Intents, broadcasts, servicios y content providers**
1. Intents implícitos y Activity Result API
2. BroadcastReceiver: reaccionar a eventos del sistema
3. Foreground Service de ubicación con FusedLocationProvider
4. Compartir archivos con FileProvider y content://
5. Mapas con Maps Compose: marcadores, cámara y ruta — Intermedio
6. Sensores con SensorManager: detectar caídas del paquete y orientación — Intermedio
7. Geofencing: avisar al entrar en la zona de una parada — Avanzado
8. CameraX y ML Kit: foto de entrega y escaneo de códigos de barras — Avanzado
9. Bluetooth LE: buscar y leer una báscula del vehículo — Avanzado

**Módulo 16 · Módulo 16: Android profesional — privacidad, datos, escala e identidad**
1. Permisos en tiempo de ejecución y alternativas sin permiso
2. DataStore para preferencias consistentes y migrables
3. Paging 3, estados de carga y RemoteMediator
4. FCM, permiso de notificaciones y sincronización confiable
5. Interfaces adaptativas para teléfono, tablet y foldable
6. Credential Manager, passkeys y verificación en servidor
7. Play Integrity API: comprobar en el servidor que la petición viene de tu app real — Experto

**Módulo 17 · Módulo 17: Compose profesional — layouts, formularios, listas y efectos**
1. Constraints, Modifier y componentes con slots
2. LazyColumn, grids, claves estables y estado de scroll
3. Formularios, IME, foco y validación accesible
4. Side effects, lifecycle y APIs imperativas
5. Gestos, Canvas y componentes personalizados accesibles

**Módulo 18 · Módulo 18: Build profesional — variantes, módulos, optimización y CI**
1. Gradle, version catalogs y resolución de dependencias
2. Build types, product flavors y configuración segura
3. Modularización, convenciones y fronteras de arquitectura
4. R8, recursos, Baseline Profiles y pipeline reproducible
5. Macrobenchmark: medir el arranque y el scroll como lo vive el usuario — Avanzado


## angular

**Módulo 0 · Módulo 0: Fundamentos y Angular CLI**
1. El CLI ya no genera NgModules
2. Interpolación y property binding
3. TypeScript a fondo — unknown, any, never y utility types
4. Compilador AOT frente a JIT

**Módulo 1 · Módulo 1: Componentes, plantillas y data binding**
1. input()/output() basados en signals
2. Control de flujo nativo — @if, @for, @switch
3. Content projection con ng-content
4. Ciclo de vida completo de un componente
5. Consultas signal y trabajo posterior al render
6. Directivas y pipes personalizados
7. Pipes puros e impuros, AsyncPipe y signals

**Módulo 2 · Módulo 2: Signals — el nuevo modelo de reactividad**
1. signal(), computed() y effect()
2. Mutación frente a actualización inmutable
3. Signals frente a Observables
4. Hacia zoneless change detection
5. linkedSignal — estado derivado que el usuario puede sobrescribir
6. resource() y httpResource — datos asíncronos reactivos

**Módulo 3 · Módulo 3: Servicios e inyección de dependencias**
1. @Injectable y providedIn: root
2. inject() frente a inyección por constructor
3. Jerarquía de inyectores
4. Tokens de inyección y decoradores de resolución

**Módulo 4 · Módulo 4: Routing y navegación**
1. Router config con rutas standalone
2. Guards funcionales
3. Lazy loading con loadComponent
4. Parámetros de ruta, query params y capacidades avanzadas de routing
5. CanDeactivate: proteger un borrador sin confundir navegación con autorización
6. Resolvers funcionales: datos listos antes de mostrar la ruta — Intermedio

**Módulo 5 · Módulo 5: Formularios reactivos y template-driven**
1. Reactive Forms — FormGroup y FormControl
2. Validadores asíncronos
3. FormArray para campos dinámicos
4. Template-driven forms — cuándo siguen siendo válidos
5. Signal Forms: formularios basados en signals (Angular 22) — Intermedio

**Módulo 6 · Módulo 6: RxJS esencial para Angular**
1. Observable frente a Promise
2. Operadores clave — debounceTime, distinctUntilChanged, switchMap, combineLatest
3. Manejo de suscripciones sin fugas de memoria
4. Subjects y operadores de aplanamiento avanzados

**Módulo 7 · Módulo 7: HttpClient e interceptores**
1. HttpClient (fetch por defecto) y peticiones tipadas
2. Interceptores funcionales
3. Registro de interceptores y centralización del manejo de errores

**Módulo 8 · Módulo 8: Standalone components y arquitectura sin NgModules**
1. Bootstrap sin NgModules
2. Organización por feature
3. Migración desde NgModules
4. Librerías y monorepos con Angular CLI: un workspace, varias aplicaciones y código compartido — Avanzado
5. Microfrontends con criterio: Native Federation y cuándo no usarlos — Experto

**Módulo 9 · Módulo 9: Gestión de estado**
1. Store propio con signals
2. NgRx — actions, reducers y selectors
3. Cuándo NgRx justifica su complejidad

**Módulo 10 · Módulo 10: Testing en Angular**
1. TestBed y componentes standalone
2. Angular Testing Library
3. Mockear HttpClient y el builder predeterminado basado en Vitest
4. Angular Material y CDK: componentes accesibles probados con harnesses

**Módulo 11 · Módulo 11: Performance, SSR y zoneless**
1. Server-Side Rendering
2. Hidratación
3. `@defer` — estados reales, incluyendo error
4. Zoneless
5. OnPush por defecto (Angular 22): qué se revisa y cuándo usar `Eager` — Intermedio
6. Modos de render por ruta: SSR, prerender (SSG) y CSR con app.routes.server.ts — Avanzado
7. Hidratación incremental: @defer con hydrate on para despertar solo lo que se usa — Avanzado

**Módulo 12 · Módulo 12: Versiones, compatibilidad y migraciones de Angular**
1. Reconocer la versión y la arquitectura de un proyecto
2. Leer la guía de actualización antes de modificar archivos
3. Migrar una versión mayor a la vez y verificar cada salto

**Módulo 13 · Módulo 13: Proyecto integrador — aplicación standalone completa**
1. Estructura del proyecto integrador
2. Integrando routing, store y formularios
3. TareasStore — combinando signals, computed y HttpClient

**Módulo 14 · Módulo 14: Angular en producción — accesibilidad, seguridad e internacionalización**
1. Accesibilidad es comportamiento, no una puntuación
2. La seguridad automática tiene fronteras explícitas
3. Internacionalizar implica significado, no reemplazo de texto
4. Rendimiento y actualización son contratos de experiencia
5. Perfilar con Angular DevTools y el panel Performance de Chrome — Avanzado
6. CSP con nonce y Trusted Types en Angular — Experto

**Módulo 15 · Módulo 15: Pruebas de signals, E2E, animación y TransferState**
1. Pruebas de Signals
2. Cypress y Playwright
3. Animaciones accesibles
4. SSR y TransferState

**Módulo 16 · Módulo 16 (opcional): Angular Native — componentes Angular como vistas nativas reales**
1. Qué renderiza Angular Native y por qué no es un WebView
2. Signals, estilos nativos compilados y el preset de Tailwind
3. Router nativo y servicios de Expo inyectados como servicios Angular
4. Evaluar la madurez de una tecnología alpha con criterio


## cloud

**Módulo 0 · Módulo 0: Introducción y preparación**
1. Fundamentos absolutos — qué es una terminal, un comando y un sistema operativo
2. Fundamentos de redes — direcciones IP, puertos, HTTP y APIs
3. Qué vas a aprender y cómo está estructurado el curso
4. Qué es Floci — definición, propósito y comparativa con LocalStack
5. Servicios que emula Floci — AWS, Azure y GCP
6. Ventajas y limitaciones de practicar con un emulador local
7. Metodología de estudio — teoría, laboratorio y evaluación en cada módulo
8. Modelos de servicio (IaaS, PaaS, SaaS), regiones y zonas de disponibilidad — Básico

**Módulo 1 · Módulo 1: Fundamentos de Docker y contenedores**
1. Virtualización vs contenedores
2. Imágenes y capas
3. Registros de contenedores (Docker Hub)
4. Comandos esenciales de Docker
5. Docker Compose — servicios, redes y volúmenes

**Módulo 2 · Módulo 2: Almacenamiento en la nube con S3**
1. Objetos, buckets y su nomenclatura
2. Claves y metadatos
3. Versionado y ciclo de vida
4. Transición entre capas de almacenamiento
5. Políticas de bucket, ACL y URLs pre-firmadas

**Módulo 3 · Módulo 3: Mensajería asíncrona con SQS**
1. Colas, productores y consumidores
2. Ciclo de vida de un mensaje
3. Dead Letter Queues (DLQ)
4. Colas FIFO vs Standard

**Módulo 4 · Módulo 4: Bases de datos NoSQL con DynamoDB**
1. Qué es NoSQL y cuándo usarlo
2. Tablas, items y atributos
3. Tipos de datos — S, N, B, BOOL, NULL, L, M
4. Clave primaria simple (HASH) vs compuesta (HASH + RANGE)
5. Índices secundarios globales (GSI) y locales (LSI)
6. Query vs Scan

**Módulo 5 · Módulo 5: Serverless con Lambda**
1. Qué es serverless — ventajas y desventajas
2. Estructura de una función Lambda
3. Runtimes — Node.js, Python, Java, Go
4. Payload de entrada y respuesta
5. Versionado y alias
6. Integración con S3, DynamoDB Streams y API Gateway
7. Deprecaciones en la nube: encontrar a tiempo runtimes y versiones que dejan de tener soporte — Intermedio

**Módulo 6 · Módulo 6: APIs con API Gateway**
1. Qué es API Gateway y tipos de API — REST, HTTP, WebSocket
2. Recursos, métodos y stages
3. Integración con Lambda (proxy)
4. Mapeo de entrada/salida y validación con modelos
5. Despliegue y variables de stage

**Módulo 7 · Módulo 7: Identidad y acceso con IAM**
1. Principio de mínimo privilegio
2. Modelo de responsabilidad compartida
3. Usuarios, grupos y roles
4. Estructura de una política — acciones, recursos y condiciones
5. Buenas prácticas — roles sobre usuarios, políticas restrictivas, rotación de credenciales

**Módulo 8 · Módulo 8: Azure y GCP con Floci**
1. floci-az — Blob Storage, Queue Storage, Table Storage, Cosmos DB, Functions
2. floci-gcp — Cloud Storage, Pub/Sub, Firestore, Cloud Functions
3. Comparativa AWS vs Azure vs GCP por categoría de servicio

**Módulo 9 · Módulo 9: Proyecto final — Sistema de Gestión de Tareas**
1. Arquitectura de la aplicación — frontend, backend y base de datos
2. CRUD de tareas sobre DynamoDB expuesto por Lambda
3. Archivos adjuntos en S3 y procesamiento en segundo plano con SQS
4. API Gateway e IAM de mínimo privilegio para el proyecto
5. Documentación de la API y guía de despliegue

**Módulo 10 · Módulo 10: Secretos y configuración: Secrets Manager, Key Vault y Secret Manager**
1. Secrets Manager y por qué no usar variables de entorno hardcodeadas
2. KMS y envelope encryption
3. SSM Parameter Store vs Secrets Manager

**Módulo 11 · Módulo 11: Mensajería Pub/Sub: SNS, EventBridge y Azure Event Hubs**
1. El patrón fan-out con SNS
2. EventBridge: bus de eventos con filtrado declarativo
3. SNS + SQS juntos, y Azure Event Hubs

**Módulo 12 · Módulo 12: Observabilidad con CloudWatch: logs, métricas y alarmas**
1. Log groups, log streams y correlation ID
2. Metric filters y alarmas
3. Diagnóstico sistemático y X-Ray

**Módulo 13 · Módulo 13: Bases de datos relacionales con RDS (PostgreSQL real)**
1. RDS Instance y cuándo elegir SQL sobre NoSQL
2. Snapshots y restore
3. Migrations

**Módulo 14 · Módulo 14: Contenedores: ECR, ECS y comparación con Cloud Run**
1. ECR y por qué no basta con Docker Hub
2. Task Definition y ECS Cluster
3. Contenedores vs Lambda, y EKS
4. Cadena de suministro en la nube: escaneo, firma y verificación de imágenes en ECR — Avanzado

**Módulo 15 · Módulo 15: Infraestructura como código con CloudFormation**
1. Stack, Template y por qué no crear recursos manualmente con la CLI
2. Change sets
3. Drift detection, Terraform/CDK, y compatibilidad multi-herramienta

**Módulo 16 · Módulo 16: Orquestación de flujos con Step Functions**
1. State machine y Task states
2. Choice state, Retry y Catch
3. Express vs Standard, y cuándo EventBridge Pipes es suficiente
4. Procesamiento por lotes: trabajos independientes, reintentos e idempotencia — Avanzado

**Módulo 17 · Módulo 17: Streaming: Kinesis, MSK (Kafka) y Pub/Sub avanzado**
1. Streams vs colas
2. MSK (Kafka gestionado) y consumer groups
3. Kinesis Data Streams vs Firehose, y GCP Managed Kafka

**Módulo 18 · Módulo 18: Autenticación de usuarios con Cognito**
1. Por qué no construir tu propio sistema de autenticación
2. Access Token, ID Token y Refresh Token
3. OAuth 2.0 y PKCE

**Módulo 19 · Módulo 19: Analítica de datos con Athena y Glue**
1. Data lake y Glue Catalog
2. Glue Crawler y Athena
3. Parquet vs CSV, y partition pruning

**Módulo 20 · Módulo 20: IA y servicios especializados: Bedrock, Textract y Transcribe**
1. Bedrock Runtime y respuestas stub deterministas
2. Textract y Transcribe
3. Stub vs mock, y qué probar localmente
4. Gobierno de IA y ML: fichas de modelo, umbrales por grupo y una puerta antes de publicar — Avanzado

**Módulo 21 · Módulo 21: Cómputo elástico con EC2 y Auto Scaling**
1. El modelo de ejecución de EC2 — instancias que son contenedores Docker reales
2. AMIs, grupos de seguridad y claves SSH
3. UserData e IMDS — arranque automatizado y credenciales por instancia
4. Auto Scaling — configuraciones de lanzamiento y grupos
5. El reconciliador de capacidad y las políticas de escalado
6. VPC y redes — subredes, security groups y el flujo del tráfico

**Módulo 22 · Módulo 22: Balanceo de carga, CDN y DNS — ELB, CloudFront, Route53 y ACM**
1. ELB v2 — balanceadores, grupos objetivo y reglas
2. ACM — certificados TLS con criptografía real
3. CloudFront — distribución de contenido y control de acceso al origen
4. Route53 — zonas alojadas y registros de recursos
5. Cómo se integran los cuatro servicios en una arquitectura de borde real
6. WAF y protección DDoS: limitar peticiones y bloquear ataques comunes en el borde — Avanzado

**Módulo 23 · Módulo 23: Caché en memoria con ElastiCache**
1. Qué resuelve un caché en memoria — y cuándo no ayuda
2. Arquitectura de ElastiCache en Floci — contenedores reales, no simulación
3. Creación de clústeres y conexión con clientes estándar
4. Autenticación IAM para el plano de datos de ElastiCache

**Módulo 24 · Módulo 24: CI/CD nativo de AWS con CodeBuild y CodeDeploy**
1. CodeBuild — compilaciones reales dentro de contenedores Docker
2. buildspec.yml — fases y artefactos
3. CodeDeploy — aplicaciones, grupos y configuraciones predefinidas
4. Despliegue Blue/Green de Lambda — cambio de tráfico por alias
5. Despliegue Blue/Green de ECS — cambio de tráfico por listener ELB

**Módulo 25 · Módulo 25: Gobierno, configuración y continuidad — AWS Config, AppConfig y Backup**
1. AWS Config — rastrear reglas sobre tus recursos
2. AppConfig — desplegar configuración sin redeployar código
3. AppConfigData — el plano de datos que consume tu aplicación
4. AWS Backup — centralizar la política de respaldo de múltiples servicios
5. El ciclo de vida de un trabajo de respaldo
6. Simulacro de restauración: comprobar contenido, no solo la existencia del backup

**Módulo 26 · Módulo 26: Streaming e integración avanzada — Firehose y EventBridge Pipes**
1. Amazon Data Firehose — entrega gestionada sin consumidores propios
2. Firehose vs Kinesis Data Streams — quién consume los datos
3. EventBridge Pipes — conectar origen y destino sin código de pegamento
4. Cuándo usar Pipes frente a reglas EventBridge o Step Functions

**Módulo 27 · Módulo 27: APIs GraphQL con AppSync y correo transaccional con SES**
1. AppSync — APIs GraphQL gestionadas
2. Fuentes de datos y resolvers
3. SES — identidades, envío y plantillas
4. El simulador de buzones y el punto de inspección local

**Módulo 28 · Módulo 28: Bases de datos de grafos y búsqueda — Neptune y OpenSearch**
1. Bases de datos de grafos — cuando las relaciones son el dato
2. Neptune en Floci — un servidor Gremlin real, no una simulación
3. OpenSearch — modo simulado y modo real
4. Eligiendo entre Neptune, OpenSearch y DynamoDB
5. Datos de series temporales: escritura por tiempo, reducción de resolución y retención — Intermedio

**Módulo 29 · Módulo 29: FinOps y gobierno de cuenta — Cost Explorer, Pricing, BCM Data Exports, Resource Groups Tagging y STS**
1. Cost Explorer — costos sintetizados a partir de tu estado real
2. Pricing — catálogo de tarifas de referencia
3. BCM Data Exports — reportes de costo en formato estándar
4. Resource Groups Tagging API — descubrimiento centralizado por etiqueta
5. STS en profundidad — identidad temporal y aislamiento multi-cuenta

**Módulo 30 · Módulo 30: Transferencia de archivos gestionada con Transfer Family**
1. Qué resuelve Transfer Family
2. Ciclo de vida del servidor y modelo de usuarios
3. Claves públicas SSH y autenticación de usuarios
4. Los límites de la Fase 1 — plano de gestión completo, plano de datos pendiente

**Módulo 31 · Módulo 31: Proyecto integrador: API multi-nube con AWS, Azure y GCP**
1. Arquitectura multi-nube y portabilidad de conocimiento
2. Arquitectura interna de cloud local y su uso en CI/CD
3. Migración desde otros emuladores, y límites de un emulador
4. Testcontainers — pruebas de integración automatizadas
5. Migrar a la nube: las 7 R para decidir qué hacer con cada aplicación — Intermedio
6. Nube híbrida: conectar el centro de datos con la nube de forma segura y medible — Avanzado

**Módulo 32 · Módulo 32: Arquitectura cloud resiliente — redes, landing zones y recuperación**
1. Una red segura empieza por flujos, no por subredes
2. Una landing zone convierte gobierno en una base repetible
3. Disponibilidad y recuperación responden preguntas distintas
4. Un backup solo existe operativamente después de restaurarlo
5. Well-Architected: revisar una arquitectura con los seis pilares — Avanzado
6. Residencia y soberanía de datos: que los datos personales vivan donde la ley permite — Avanzado

**Módulo 33 · Módulo 33: Cloud Master: plataforma, seguridad, datos y FinOps**
1. Terraform avanzado y CI/CD cloud
2. Kubernetes administrado, ECS y Service Mesh
3. EC2, VPC, RDS, S3 y DynamoDB avanzados
4. Lambda, API Gateway y observabilidad avanzada
5. Seguridad, auditoría y FinOps
6. Microservicios, Big Data, AI/ML y multi-cloud
7. Detección de amenazas: leer registros de auditoría y alertar sobre comportamiento sospechoso — Avanzado

**Módulo 34 · Módulo 34: Floci oficial completo — plataforma, servicios y laboratorios**
1. Instalación en macOS, Linux y Windows
2. Modelo mental de la plataforma
3. AWS CLI y SDK, Azure CLI y SDK, GCP CLI y SDK
4. Configuración avanzada y ciclo de vida
5. Automatización, UI y agentes
6. Servicios AWS incorporados en la documentación actual
7. Servicios Azure que completan el recorrido
8. Servicios GCP que completan el recorrido
9. floci-ui — explorador visual multi-nube
10. Laboratorios oficiales reconstruidos en español
11. Límites y transferencia a producción


## control-1

**Módulo 0 · Módulo 0: Cómo estudiar Control 1**
1. Cómo está armado cada capítulo

**Módulo 1 · Módulo 1: Números complejos**
1. ¿Qué es un número complejo?
2. Operaciones con números complejos: suma, producto y división
3. Raíces de s²+bs+c
4. Forma polar, fórmula de Euler y evaluación de G(jω)

**Módulo 2 · Módulo 2: Transformada de Laplace**
1. La idea de la transformada de Laplace: del tiempo al dominio s
2. La tabla de transformadas de Laplace
3. Propiedades de la transformada de Laplace
4. Valor final y valor inicial

**Módulo 3 · Módulo 3: Transformada inversa**
1. Caso 1: polos reales distintos
2. Caso 2: polos repetidos
3. Caso 3: polos complejos (completar el cuadrado)
4. Resolver una ecuación diferencial completa

**Módulo 4 · Módulo 4: Ecuaciones diferenciales y función de transferencia**
1. Qué es la función de transferencia

**Módulo 5 · Módulo 5: Sistemas de control y diagramas de bloques**
1. ¿Qué es un sistema de control?
2. Los elementos de un lazo de control
3. Álgebra de bloques

**Módulo 6 · Módulo 6: Reducción de diagramas de bloques y regla de Mason**
1. Reglas para mover bloques en un diagrama
2. Grafos de flujo de señal
3. Regla de Mason
4. Referencia y perturbación juntas

**Módulo 7 · Módulo 7: Circuitos y amplificadores operacionales**
1. Impedancias de resistencia, bobina y condensador en s
2. Circuitos pasivos: divisor de voltaje
3. El op-amp inversor

**Módulo 8 · Módulo 8: Modelado de sistemas físicos**
1. Mecánico de traslación
2. Mecánico de rotación
3. Motor DC (electromecánico)
4. Sistemas térmicos e hidráulicos
5. Analogías entre sistemas eléctricos, mecánicos y térmicos

**Módulo 9 · Módulo 9: Linealización**
1. La idea de la linealización: aproximar con la recta tangente

**Módulo 10 · Módulo 10: Introducción al espacio de estados**
1. La forma de espacio de estados
2. De estados a función de transferencia

**Módulo 11 · Módulo 11: Sistemas de primer orden y retardo**
1. Forma estándar de primer orden: K y τ
2. Respuestas de primer orden al escalón, la rampa y el impulso
3. Retardo o tiempo muerto
4. Identificación desde una gráfica

**Módulo 12 · Módulo 12: Sistemas de segundo orden**
1. Forma estándar de segundo orden: K, ωn y ζ
2. Simulador: mueve ζ y ωn
3. Los cuatro casos según ζ
4. Fórmulas del caso subamortiguado
5. De las especificaciones a la función de transferencia

**Módulo 13 · Módulo 13: Polos dominantes, polos adicionales y ceros**
1. Polos dominantes
2. Efecto de un cero
3. Cero de fase no mínima

**Módulo 14 · Módulo 14: Error en estado estacionario**
1. Fórmula general del error en estado estacionario
2. Tipo de sistema y constantes

**Módulo 15 · Módulo 15: Estabilidad y criterio de Routh-Hurwitz**
1. Qué es estabilidad
2. El arreglo de Routh
3. Casos especiales del arreglo de Routh
4. Rango de K para estabilidad

**Módulo 16 · Módulo 16: Plano s, estabilidad y zona de diseño**
1. Geometría de un polo en el plano s
2. Estabilidad según la posición de los polos
3. La zona de diseño

**Módulo 17 · Módulo 17: Lugar geométrico de las raíces**
1. Las dos condiciones del lugar de las raíces
2. Reglas de construcción (con su porqué)
3. Elegir K desde el lugar de las raíces

**Módulo 18 · Módulo 18: Acciones básicas de control: P, I, D**
1. La idea de las acciones P, I y D: presente, pasado y tendencia
2. Error en estado estacionario
3. Cada acción, con números
4. Ventajas y desventajas (punto 4 del Parcial 1)
5. Sintonía de Ziegler-Nichols

**Módulo 19 · Módulo 19: Compensadores de adelanto y atraso**
1. Diseño de un adelanto
2. Diseño de un atraso
3. Implementación con op-amps

**Módulo 20 · Módulo 20: Respuesta en frecuencia y diagramas de Bode**
1. Qué es la respuesta en frecuencia
2. Decibeles y la escala logarítmica
3. Los bloques básicos del diagrama de Bode
4. Márgenes de estabilidad

**Módulo 21 · Módulo 21: Parciales resueltos**
1. Parcial 1 resuelto paso a paso

**Módulo 22 · Módulo 22: Simulacro y formulario**
1. Simulacro con solución

**Módulo 23 · Módulo 23: Criterio de Nyquist**
1. Del Bode al diagrama polar — Intermedio
2. El criterio Z = N + P — Intermedio
3. Polos en el origen y estabilidad relativa — Avanzado

**Módulo 24 · Módulo 24: Compensación en el dominio de la frecuencia**
1. Compensador de adelanto por margen de fase — Avanzado
2. Compensador de atraso por margen de fase — Avanzado
3. Atraso-adelanto y sensibilidad — Avanzado

**Módulo 25 · Módulo 25: Controlabilidad, observabilidad y ubicación de polos**
1. Controlabilidad — Intermedio
2. Observabilidad — Intermedio
3. Ubicación de polos por realimentación de estados — Avanzado

**Módulo 26 · Módulo 26: Observadores de estado**
1. El observador de orden completo — Avanzado
2. Elige la velocidad del observador — Avanzado
3. Controlador con observador — Avanzado

**Módulo 27 · Módulo 27: Método algebraico de diseño**
1. Igualación de modelos — Avanzado
2. Ubicación de polos con la ecuación diofántica — Avanzado
3. Compensador de dos parámetros — Avanzado

**Módulo 28 · Módulo 28: Simulacro de examen final**
1. Bloque A — frecuencia (puntos 1 a 3) — Avanzado
2. Bloque B — estado y método algebraico (puntos 4 a 6) — Avanzado
3. Corrige con python-control y planea el repaso — Intermedio


## devops

**Módulo 0 · Módulo 0: Linux y shell scripting para DevOps**
1. Sistema de archivos y permisos (chmod/chown)
2. Procesos, señales y jobs en segundo plano
3. Pipes, redirección y filtros (grep, awk, sed)
4. Variables de entorno y scripts bash robustos (set -euo pipefail)
5. Cron y tareas programadas
6. Hardening básico — SSH sin contraseña, firewalls, SELinux/AppArmor
7. Redes — modelo OSI, TCP/IP, DNS y balanceadores de carga
8. Cultura DevOps y el ciclo Plan→Code→Build→Test→Release→Deploy→Operate→Monitor
9. NGINX y proxies desde cero
10. Usuarios, grupos, permisos compartidos y sudo con mínimo privilegio
11. systemd: servicios, timers y logs con journalctl

**Módulo 1 · Módulo 1: Git avanzado y estrategias de branching**
1. Trunk-based development vs GitFlow
2. Rebase interactivo vs merge
3. Bisect para encontrar regresiones
4. Hooks de Git y commits firmados
5. Monorepos vs polyrepos
6. git cherry-pick, git stash, git reset vs git revert
7. git reflog, git worktree y git submodule

**Módulo 2 · Módulo 2: Docker — imágenes y buenas prácticas**
1. Dockerfile multi-stage
2. Capas e invalidación de caché
3. Imágenes base distroless/alpine
4. Volúmenes vs bind mounts
5. Redes en Docker
6. Registries — Docker Hub, AWS ECR, Azure Container Registry, Harbor
7. Operación diaria: inspect, stats, events y respaldo de volúmenes
8. Contenedores sin privilegios: usuario no root, sistema de archivos de solo lectura y capacidades mínimas — Avanzado
9. Elegir el motor de contenedores local: Docker Desktop, Podman, Colima y Rancher Desktop — Avanzado

**Módulo 3 · Módulo 3: Docker Compose y orquestación local**
1. Servicios, dependencias y healthchecks
2. Variables de entorno y .env
3. Redes y descubrimiento por nombre de servicio
4. Perfiles para distintos entornos

**Módulo 4 · Módulo 4: CI — pipelines automatizados**
1. Jobs, steps y matrices de build
2. Caché de dependencias en CI
3. Artifacts y reportes de cobertura
4. Pipelines como código (GitHub Actions/GitLab CI)
5. Promoción entre entornos con quality gates: el mismo artefacto de pruebas a producción — Avanzado

**Módulo 5 · Módulo 5: CD — estrategias de despliegue**
1. Blue-green deployment
2. Canary releases
3. Rolling updates
4. Feature flags vs branches por entorno
5. Rollback automático por métricas
6. Rollback ensayado y compatibilidad del artefacto anterior
7. A/B testing y shadow traffic: medir sin convertir usuarios en cobayas

**Módulo 6 · Módulo 6: Kubernetes — fundamentos**
1. Pod, ReplicaSet, Deployment
2. Service (ClusterIP, NodePort, LoadBalancer)
3. ConfigMaps y Secrets
4. kubectl esencial
5. Namespaces
6. StatefulSets, DaemonSets, Jobs y CronJobs
7. Persistent Volumes, PVCs y StorageClasses
8. Clúster local con Minikube: perfiles, addons e Ingress
9. Arquitectura de Kubernetes: plano de control, nodos y el ciclo de reconciliación — Intermedio
10. Scheduling en Kubernetes: requests, limits, afinidad, taints y tolerations — Avanzado

**Módulo 7 · Módulo 7: Kubernetes avanzado — Helm e Ingress**
1. Helm charts y values
2. Ingress Controllers y reglas de enrutamiento
3. HorizontalPodAutoscaler
4. Probes de liveness y readiness
5. RBAC en Kubernetes
6. Service Mesh — Istio, Linkerd, Envoy y mTLS
7. Estrategias de despliegue — Recreate vs RollingUpdate
8. Políticas en Kubernetes: NetworkPolicy y Pod Security Admission — Avanzado

**Módulo 8 · Módulo 8: Infraestructura como código con Terraform**
1. Providers, resources y data sources
2. State remoto y locking
3. Módulos reutilizables
4. terraform plan vs apply
5. Workspaces para múltiples entornos
6. Ansible — playbooks, roles, inventory y módulos
7. Pulumi como alternativa a HCL
8. OpenTofu, plan y estado sin recursos cloud
9. terraform import y policy as code: adoptar recursos existentes y revisar planes con reglas — Avanzado

**Módulo 9 · Módulo 9: Observabilidad con Prometheus y Grafana**
1. Modelo de métricas de Prometheus — counter, gauge, histogram
2. PromQL esencial
3. Dashboards en Grafana
4. Alertmanager y reglas de alerta
5. SLI, SLO, SLA
6. OpenTelemetry como estándar de instrumentación
7. Métricas DORA — Lead Time, Deployment Frequency, MTTR, Change Failure Rate
8. Chaos engineering: experimentos controlados para comprobar que el sistema resiste fallos — Experto

**Módulo 10 · Módulo 10: Logging centralizado**
1. Logging estructurado (JSON)
2. Pipeline ELK/EFK
3. Loki + Grafana como alternativa ligera
4. Correlation ID a través de servicios

**Módulo 11 · Módulo 11: Seguridad DevSecOps**
1. Escaneo de imágenes y dependencias (Trivy, Snyk)
2. Integración en el pipeline
3. Gestión de secretos (Vault, SOPS)
4. Menor privilegio en CI/CD
5. SBOM y supply chain security
6. SAST, DAST y SCA — diferencias y herramientas
7. Reconocimiento de tu propio laboratorio: escaneo de puertos y banners

**Módulo 12 · Módulo 12: DevOps y este curso — del laboratorio a la nube**
1. De cloud local a un proveedor cloud real
2. Gestión de secretos cloud-native
3. IaC multi-nube
4. Checklist de salida a producción
5. GitOps con ArgoCD y FluxCD
6. Platform Engineering — Internal Developer Platforms (IDPs)
7. FinOps: costos visibles por servicio, etiquetas obligatorias y presupuestos con alertas — Avanzado

**Módulo 13 · Módulo 13: Proyecto integrador — pipeline CI/CD completo**
1. El pipeline completo — de commit a producción verificada
2. Uniendo cada módulo del track en un solo flujo
3. Cierre del track — checklist final y reflexión

**Módulo 14 · Módulo 14: SRE y plataforma — confiabilidad, incidentes y supply chain**
1. Confiabilidad es una expectativa cuantificada
2. Una alerta debe conducir a una acción
3. Construir una imagen no demuestra de dónde proviene
4. Una plataforma interna es un producto con límites

**Módulo 15 · Módulo 15: DevOps Master: GitOps, Service Mesh y DevSecOps**
1. Docker y Compose avanzados
2. Kubernetes extensible y Helm avanzado
3. Service Mesh con Istio o Linkerd
4. GitOps con Argo CD y Flux
5. Ansible, inventarios, roles y Vault
6. DevSecOps y métricas DORA

**Módulo 16 · Módulo 16: QA Automation — Postman, Newman y Jenkins**
1. Postman y Newman — tu primera colección contra una API real
2. Scripts y assertions — pruebas automatizadas sobre datos reales
3. Newman en profundidad — reportes y el contrato del código de salida
4. Jenkins — instalación, jobs y el linter real de pipelines declarativos
5. Integración completa — Newman dentro de un pipeline Jenkins
6. Bruno y Postman, evaluar con el mismo contrato

**Módulo 17 · Módulo 17: Diseño de sistemas distribuidos: borde, datos y capacidad**
1. El borde: balanceo, proxy inverso, CDN y límites de tasa
2. Datos que crecen: índices, réplicas, sharding y la elección SQL/NoSQL
3. CAP, consistencia e idempotencia: lo que se paga en cada decisión
4. Capacidad y observabilidad: latencia, throughput, SLO y pruebas de carga

**Módulo 18 · Módulo 18: Servidor propio: VPS endurecido, TLS y recuperación**
1. Aprovisionar y endurecer: usuario, SSH, firewall y parches
2. Dominio, TLS y borde: DNS, Let's Encrypt y Cloudflare
3. Despliegue y rollback: systemd, nginx y artefactos versionados
4. Respaldos que se restauran: restic, RPO/RTO y simulacro

**Módulo 19 · Módulo 19: Arquitectura moderna y DDD: límites que sobreviven al cambio**
1. Límites, acoplamiento y monolito modular: cuándo un microservicio no es la respuesta
2. Lenguaje ubicuo y contextos delimitados: el mismo envío no significa lo mismo
3. Agregados, invariantes y eventos de dominio: dónde vive la regla que no se puede romper
4. ADR y fitness functions: decisiones que el código puede defender

**Módulo 20 · Módulo 20: Eventos de dominio y consistencia eventual**
1. Eventos de dominio e integración: hechos, no comandos
2. Outbox transaccional: guardar el hecho y el mensaje juntos
3. Idempotencia y orden: consumidores que sobreviven a reintentos
4. Sagas y compensaciones: procesos largos sin transacción distribuida

**Módulo 21 · Módulo 21: Microservicios: contratos, datos y operación**
1. Descomponer por capacidad de negocio: dos servicios, un contrato
2. Datos por servicio: propiedad, composición y réplicas
3. Resiliencia: timeouts, reintentos y cortacircuitos
4. Observabilidad distribuida: trazas, correlación y SLO

**Módulo 22 · Módulo 22: Laboratorio DevOps con Floci: ejercicios verificables**
1. Floci desde cero: instalar, aislar y verificar
2. S3 y diagnóstico de red: objetos, metadatos y errores
3. Contenedores y CI: una imagen que se prueba contra Floci
4. Terraform, SQS y operación: infraestructura reproducible y ejercicios


## flutter

**Módulo 0 · Módulo 0: Fundamentos de Dart**
1. Sound null safety
2. Clases y mixins
3. Futures, async/await y colecciones funcionales
4. Lints y estilo con analysis_options.yaml
5. Streams en Dart: secuencias de eventos asíncronos con await for y StreamController — Intermedio
6. Records y patterns en Dart: varios valores sin clases y switch exhaustivo — Intermedio
7. Extension methods y extension types: agregar comportamiento sin heredar — Intermedio

**Módulo 1 · Módulo 1: Widgets: stateless vs stateful**
1. StatelessWidget vs StatefulWidget
2. Layout con Row, Column y Stack, y ciclo de vida
3. Keys
4. Los tres árboles de Flutter: Widget, Element y RenderObject — Avanzado
5. Gestos en Flutter: GestureDetector, Dismissible y la arena de gestos — Avanzado

**Módulo 2 · Módulo 2: Layout y diseño responsive**
1. MediaQuery vs LayoutBuilder
2. Cómo Flutter calcula tamaños
3. Breakpoints propios y SafeArea

**Módulo 3 · Módulo 3: Navegación y rutas**
1. go_router: navegación como función de la URL
2. Guards y deep linking
3. Transiciones personalizadas

**Módulo 4 · Módulo 4: Gestión de estado**
1. setState y sus límites
2. Riverpod
3. Bloc/Cubit y otras alternativas
4. Formularios profesionales con Formz y Riverpod
5. Inyección de dependencias con Riverpod: reemplazar implementaciones

**Módulo 5 · Módulo 5: Networking**
1. http vs dio
2. json_serializable
3. Interceptores y estados explícitos
4. Flujo de autenticación con tokens: login, almacenamiento seguro, renovación y cierre de sesión

**Módulo 6 · Módulo 6: Persistencia local**
1. shared_preferences
2. sqflite vs Hive
3. Offline-first y Firebase
4. Restauración de formularios con RestorationMixin y una prueba de recreación
5. Archivos en Flutter: path_provider, carpetas correctas y escritura segura — Intermedio

**Módulo 7 · Módulo 7: Integración con plataformas nativas**
1. MethodChannel
2. Plugins federados
3. Permisos de plataforma y cuándo escribir un platform channel propio
4. Cámara, galería y carga multipart de una evidencia
5. Trabajo en segundo plano con workmanager: sincronizar aunque la app esté cerrada — Avanzado
6. Add-to-app: integrar una pantalla Flutter en una app Android o iOS existente — Experto

**Módulo 8 · Módulo 8: Animaciones y rendimiento**
1. Animaciones implícitas vs explícitas
2. Flutter DevTools y detección de jank
3. const widgets, RepaintBoundary y shouldRepaint
4. Isolates — trabajo pesado sin congelar la interfaz
5. CustomPainter: dibujar con Canvas sin repintar de más

**Módulo 9 · Módulo 9: Testing en Flutter**
1. Unit tests y widget tests
2. Mocking con mocktail
3. Integration tests

**Módulo 10 · Módulo 10: Theming, accesibilidad y Material/Cupertino**
1. ThemeData con Material 3
2. Adaptación Material vs Cupertino
3. Accesibilidad con Semantics y dark mode

**Módulo 11 · Módulo 11: Publicación en App Store y Google Play**
1. Builds de release para cada plataforma
2. Iconos y splash screens
3. CI/CD con Codemagic o Fastlane
4. Entornos y flavors con --dart-define-from-file
5. Flutter para web y escritorio: compilar, adaptar la interfaz y elegir el renderizador — Avanzado

**Módulo 12 · Módulo 12: Proyecto integrador: app Flutter completa**
1. Arquitectura por features y Clean Architecture
2. Uniendo los módulos del track
3. Retrospectiva del proyecto integrador
4. Arquitectura recomendada de Flutter: views, view models, repositories y services — Avanzado

**Módulo 13 · Módulo 13: Flutter en producción — seguridad, isolates y operación**
1. Una API Dart puede terminar en una frontera nativa
2. Los secretos no pertenecen al binario
3. Fluidez se mide contra el presupuesto de cada frame
4. Producción exige protocolo, telemetría y contención

**Módulo 14 · Módulo 14: Flutter para entregas: mapas, GPS y tiempo real**
1. Diseño de pantallas y Riverpod
2. Google Maps y localización en tiempo real
3. Socket.IO y actualización de rutas
4. Animaciones de localización
5. Almacenamiento local, imágenes y offline
6. Dio y notificaciones push

**Módulo 15 · Módulo 15: Flutter Master: calidad, arquitectura y despliegue**
1. flutter test y WidgetTester
2. pumpAndSettle, golden e integration tests
3. Rendimiento, RepaintBoundary y Keys
4. Clean Architecture
5. Internacionalización completa
6. Builds, firma y despliegue
7. Migrar una app a Flutter 3.50 y Dart 3.14 sin romper la entrega
8. Integrar IA generativa en una app Flutter con Firebase AI Logic

**Módulo 16 · Módulo 16: Flutter FFI: conectar Dart con código nativo**
1. reconocer cuándo usar FFI y crear el paquete
2. generar bindings C seguros para Dart
3. conectar una biblioteca Rust mediante una ABI C
4. compilar y empaquetar bibliotecas por plataforma
5. medir rendimiento y evitar bloquear la interfaz
6. propiedad de memoria, liberación y errores

**Módulo 17 · Módulo 17: Dart avanzado: generación, AST y paquetes**
1. macros de Dart y alternativas disponibles
2. generación avanzada con build_runner
3. reflexión limitada y registro tipado
4. recorrer el AST de Dart con analyzer
5. crear un builder pequeño para build_runner
6. diseñar y validar un paquete Dart

**Módulo 18 · Módulo 18: Flutter en producción: secretos, calidad y rendimiento**
1. la frontera entre Dart y el código nativo
2. secretos fuera del binario
3. fluidez y presupuesto de frames
4. protocolo, telemetría y contención
5. reportes de fallos con Crashlytics y Sentry
6. analítica con privacidad y consentimiento
7. monitoreo de rendimiento en una versión publicada

**Módulo 19 · Módulo 19: Flutter para entregas: mapa, conexión y trabajo offline**
1. estado de la jornada con Riverpod
2. mapa y permiso de ubicación
3. posiciones en tiempo real con Socket.IO
4. animar el marcador sin saltos
5. confirmaciones offline y sincronización
6. carga de evidencia con Dio y notificaciones

**Módulo 20 · Módulo 20: Flutter Master: pruebas, arquitectura y release**
1. pruebas unitarias y de widget con Flutter Test
2. golden e integración de un flujo real
3. perfilado y presupuesto de rendimiento
4. Clean Architecture y sustitución de dependencias
5. internacionalización y formatos locales
6. builds por plataforma, firma y entrega

**Módulo 21 · Módulo 21: compras dentro de Flutter (IAP)**
1. catálogo y flujo con `in_app_purchase`
2. suscripciones Android, planes base y cambios
3. suscripciones iOS con StoreKit
4. restauración de compras y entitlement
5. pruebas de IAP en sandbox
6. validación de transacciones en servidor

**Módulo 22 · Módulo 22: anuncios y monetización en Flutter**
1. configurar AdMob y cargar el primer banner de prueba
2. elegir mediación, bidding y waterfall
3. banners, interstitials y anuncios recompensados
4. consentimiento, privacidad y audiencias
5. pruebas de anuncios y diagnóstico de no-fill
6. comparar AdMob, AppLovin MAX y Unity LevelPlay


## foundations

**Módulo 0 · Módulo 0: Cómo funciona tu entorno de desarrollo**
1. Computador, sistema operativo, programa y proceso — Básico
2. Del archivo fuente al programa en ejecución
3. Archivos, carpetas y rutas sin perderse
4. Cómo leer un comando antes de ejecutarlo
5. Primer programa, primer error y primera evidencia
6. VS Code, comandos y atajos comprobables

**Módulo 1 · Módulo 1: Pensamiento computacional y programación**
1. Del problema al algoritmo y a los casos de prueba
2. Variables, tipos, expresiones y cambios de estado
3. Decisiones, repeticiones y trazado de ejecución
4. Funciones y descomposición de problemas
5. Cómo la computadora representa los datos — binario, texto y decimales
6. Clases y objetos: atributos, métodos e `__init__` — Básico
7. Herencia, composición y clases abstractas con `abc` — Intermedio

**Módulo 2 · Módulo 2: Estructuras de datos, algoritmos y complejidad**
1. Elegir estructuras según las operaciones
2. Pilas, colas y abstracciones de comportamiento
3. Búsqueda, precondiciones y demostración de corrección
4. Complejidad, medición, ordenamiento y recursión
5. Árboles y árboles binarios de búsqueda (BST)
6. Tablas hash — búsqueda en tiempo constante
7. Grafos y recorridos BFS/DFS
8. Programación dinámica — resolver una vez, recordar el resultado

**Módulo 3 · Módulo 3: Fundamentos de web, redes y accesibilidad**
1. De una URL al servidor: red, DNS, IP y puertos
2. HTTP como contrato observable
3. HTML semántico, formularios y el DOM
4. CSS, layout responsive y accesibilidad verificable
5. Proyecto integrador — sitio de seguimiento accesible

**Módulo 4 · Módulo 4: Modelado de datos, SQL y persistencia**
1. Del mundo real al modelo relacional
2. SQL para definir, escribir, consultar y relacionar
3. Índices, restricciones y planes de consulta
4. Transacciones, concurrencia y elección SQL/NoSQL
5. SQL avanzado: subconsultas, vistas, triggers y funciones de ventana
6. Procedimientos almacenados, funciones y cursores con PL/pgSQL
7. De SQL a Excel: reportes con tablas y fórmulas vivas

**Módulo 5 · Módulo 5: Testing, depuración, Git y CI**
1. Depurar con evidencia, no con cambios aleatorios
2. Pruebas con propósito y niveles adecuados
3. Git como historial de decisiones y colaboración
4. Calidad estática, revisión e integración continua

**Módulo 6 · Módulo 6: Seguridad, privacidad y modelado de amenazas**
1. Activos, amenazas, riesgos y límites de confianza
2. Identidad, contraseñas, sesiones y autorización
3. Criptografía aplicada, TLS, claves y secretos
4. Validación, vulnerabilidades web, privacidad y respuesta
5. Ingeniería social, phishing y respuesta: analizar el correo, no solo mirarlo

**Módulo 7 · Módulo 7: Requisitos, diseño, arquitectura y mantenimiento**
1. Requisitos, stakeholders y criterios verificables
2. Arquitectura guiada por atributos de calidad
3. Diseño modular, principios, patrones y refactoring
4. Decisiones, documentación, deuda y evolución
5. Records de C#: igualdad por valor no implica inmutabilidad profunda
6. Desarrollo guiado por especificación con agentes de IA
7. Evaluar una skill de agente antes de usarla: validar, deduplicar y medir — Intermedio

**Módulo 8 · Módulo 8: Sistemas operativos, concurrencia, Linux y contenedores**
1. El sistema operativo como administrador y frontera
2. Memoria y concurrencia sin magia
3. Linux como entorno observable
4. Contenedores: aislamiento reproducible
5. Problemas clásicos de concurrencia: filósofos y lectores-escritores

**Módulo 9 · Módulo 9: Matemáticas discretas, lógica y probabilidad para software**
1. Lógica para especificar antes de programar
2. Conjuntos, relaciones, funciones e inducción
3. Conteo, grafos y estructuras conectadas
4. Probabilidad y evidencia para decisiones técnicas

**Módulo 10 · Módulo 10: Sistemas distribuidos, resiliencia y observabilidad**
1. La red convierte el resultado en una incertidumbre
2. Replicación, consistencia y decisiones explícitas
3. Mensajes que se procesan con efectos exactamente una vez
4. Resiliencia y observabilidad orientadas a objetivos
5. Tiempo, coordinación y acuerdo: Lamport, elección de líder y commit en dos fases
6. Latencia y throughput: medir concurrencia sin confundirla con capacidad ilimitada
7. Diseño de sistemas: de requisitos a estimación de capacidad y cuello de botella

**Módulo 11 · Módulo 11: Ciencias de la Computación: mapa de especializaciones**
1. Sistemas, arquitectura y sistemas operativos
2. Algoritmos, autómatas, lenguajes y compiladores
3. Bases de datos, almacenes analíticos y minería de datos
4. Inteligencia artificial, aprendizaje automático y visión
5. Gráficos y cómputo científico
6. Redes, seguridad, web e ingeniería profesional

**Módulo 12 · Módulo 12: Electrónica, sensores y control para software e IoT**
1. Matemáticas aplicadas: derivada, integral y modelos
2. Circuitos DC y AC: Kirchhoff, Thévenin y Norton
3. Electrónica analógica: diodos, transistores y amplificadores
4. Electrónica digital: lógica y máquinas de estados
5. Microcontroladores: GPIO, ADC, PWM e interrupciones
6. Comunicaciones: modulación y detección de errores
7. Señales y sistemas: muestreo, Fourier y convolución
8. DSP: filtros digitales y compresión
9. Instrumentación: calibración, DAQ e incertidumbre
10. Control automático: realimentación, PID y estabilidad
11. Potencia: conversión, eficiencia y disipación
12. PCB: esquemático, ERC, DRC y fabricación
13. Sistemas embebidos: RTOS, buses y firmware
14. Programación de bajo nivel: C, memoria y depuración
15. Electromagnetismo: Faraday y líneas de transmisión
16. Gestión profesional: requisitos, riesgos y evidencia
17. PLC y control industrial: ciclo de scan e IEC 61131-3

**Módulo 13 · Módulo 13: Algoritmos clásicos**
1. Ordenamientos: insertion, merge y quick sort
2. Algoritmos codiciosos y árbol de expansión mínima
3. Caminos más cortos con Dijkstra
4. Búsqueda en cadenas: de la fuerza bruta a KMP
5. Problemas intratables: P, NP y heurísticas

**Módulo 14 · Módulo 14: Catálogo de patrones de diseño**
1. Decorator: agregar comportamiento sin heredar
2. State: un objeto que cambia de comportamiento según su estado
3. Template Method: un algoritmo fijo con pasos variables
4. Chain of Responsibility: una cadena de validadores
5. Mediator: coordinar objetos sin que se conozcan
6. Memento: guardar y restaurar estado para deshacer
7. Visitor: operaciones nuevas sin tocar las clases
8. Flyweight: compartir estado para ahorrar memoria

**Módulo 15 · Módulo 15: Código limpio**
1. Nombres que revelan intención y funciones pequeñas
2. Comentarios honestos y excepciones en lugar de códigos de error
3. Objetos frente a estructuras de datos y la ley de Demeter
4. Pruebas limpias: F.I.R.S.T. y un concepto por prueba


## ios

**Módulo 0 · Módulo 0: Fundamentos de Swift**
1. Optionals y unwrapping seguro
2. struct vs class
3. Protocolos y enums con valores asociados
4. Closures, colecciones y genéricos con propósito
5. Ownership en Swift: borrowing, consuming y tipos ~Copyable — Experto

**Módulo 1 · Módulo 1: SwiftUI: vistas y layout declarativo**
1. El protocolo View y composición
2. Orden de modificadores y layout con stacks
3. Previews, LazyVGrid/ScrollView y property wrappers

**Módulo 2 · Módulo 2: Estado y data flow**
1. @State y @Binding
2. @Observable
3. @Environment y identidad vs valor

**Módulo 3 · Módulo 3: Navegación**
1. NavigationStack y NavigationPath
2. Sheets, full screen covers y TabView
3. Deep linking y controles de formulario

**Módulo 4 · Módulo 4: Concurrencia moderna: async/await**
1. async/await y Task
2. Actors para estado mutable seguro
3. TaskGroup y MainActor
4. Cancelación cooperativa: distinguir una tarea cancelada de un fallo de red
5. AsyncSequence y AsyncStream: recibir valores en el tiempo con for await — Avanzado
6. Swift 6: aislamiento, Sendable y data races detectadas al compilar — Experto

**Módulo 5 · Módulo 5: Networking con URLSession**
1. URLSession con async/await y Codable
2. Errores tipados
3. Reintentos y cancelación

**Módulo 6 · Módulo 6: Persistencia con SwiftData**
1. @Model y ModelContainer
2. @Query y operaciones de escritura
3. Migraciones y SwiftData vs Core Data
4. Archivos en iOS: FileManager, carpetas de la app y fileImporter — Intermedio
5. CloudKit con SwiftData: sincronizar datos entre los dispositivos del usuario — Avanzado

**Módulo 7 · Módulo 7: Combine y programación reactiva**
1. Publishers y Subscribers
2. Operadores: debounce y combineLatest
3. Combine vs async/await

**Módulo 8 · Módulo 8: Arquitectura MVVM**
1. De una vista "gorda" a MVVM
2. Capas del proyecto e inyección por inicializador
3. Cuándo MVVM no alcanza

**Módulo 9 · Módulo 9: Testing en iOS**
1. XCTest clásico y Swift Testing
2. Testing de código async
3. UI Tests con XCUITest

**Módulo 10 · Módulo 10: Performance, accesibilidad y HIG**
1. Instruments
2. Accesibilidad con VoiceOver
3. Human Interface Guidelines, Dynamic Type e interop con UIKit
4. UIKit desde cero para mantener aplicaciones reales
5. Localización con String Catalogs: textos, plurales y formatos por idioma — Intermedio

**Módulo 11 · Módulo 11: Publicación en App Store**
1. Certificados y provisioning profiles
2. Archivar, subir y TestFlight
3. Metadata y versionado

**Módulo 12 · Módulo 12: Proyecto integrador: app SwiftUI completa**
1. Arquitectura del proyecto integrador
2. Sincronización entre red y persistencia local
3. Cierre del track
4. Swift Package Manager: separar la app en paquetes locales y declarar dependencias — Avanzado

**Módulo 13 · Módulo 13: iOS en producción — seguridad, sincronización y operación**
1. El sandbox reduce superficie, pero no valida intenciones
2. Proteger datos es controlar todas sus copias
3. Offline-first es un protocolo, no una caché
4. Operar significa detectar, limitar y aprender del fallo
5. Keychain — guardar secretos de forma segura
6. Permisos y privacidad — pedir acceso con criterio
7. Notificaciones push con APNs
8. Face ID y Touch ID con LocalAuthentication: confirmar acciones sensibles — Intermedio
9. Core Location moderno: CLLocationUpdate, permisos y precisión — Avanzado
10. BackgroundTasks: actualizar datos y sincronizar cuando el sistema lo permite — Avanzado

**Módulo 14 · Módulo 14: SwiftUI Master: pruebas, animación e interoperabilidad**
1. Swift Testing y pruebas asíncronas
2. ViewInspector con criterio
3. Combine avanzado
4. Animaciones y matchedGeometryEffect
5. UIViewRepresentable
6. UIViewControllerRepresentable y Coordinator
7. Core ML y Vision — inferencia en el dispositivo
8. Gestos en SwiftUI: arrastrar, mantener presionado y combinar gestos — Intermedio
9. WidgetKit: un widget con las entregas pendientes del día — Avanzado
10. App Intents: acciones de la app en Siri, Atajos y Spotlight — Avanzado


## java

**Módulo 0 · Módulo 0: Sintaxis, tipos y el modelo de la JVM**
1. Del código fuente a la JVM
2. public static void main — qué significa cada palabra
3. JDK, JRE y JVM
4. Tipos primitivos vs referencias
5. Variables, conversiones y `String`
6. Operadores, precedencia y control de flujo
7. Arreglos, wrappers y paso de argumentos
8. Entrada, `java.time` y por qué evitar las APIs obsoletas (`Date`/`Calendar`)
9. Java 25 para programas pequeños: `IO`, archivos compactos e `import module` — Básico

**Módulo 1 · Módulo 1: Programación orientada a objetos**
1. Clases, objetos, constructores y encapsulación
2. Herencia y sobreescritura
3. Interfaces, clases abstractas y cuándo usar cada una
4. Sobrecarga vs sobreescritura, y modificadores de acceso
5. record — modelos inmutables sin boilerplate
6. Constructores flexibles (Java 25): validar y preparar antes de `super(...)` — Intermedio

**Módulo 2 · Módulo 2: Colecciones y genéricos**
1. List, Set, Map y sus implementaciones
2. El contrato de equals y hashCode — Básico
3. Claves mutables y el mapa que pierde entradas — Intermedio
4. Genéricos, wildcards y type erasure
5. Comparable vs Comparator, e iteración
6. Colas y pilas: `Queue`, `Deque`, `ArrayDeque` y `PriorityQueue` — Básico

**Módulo 3 · Módulo 3: Excepciones y manejo de recursos**
1. Checked vs unchecked exceptions
2. try-with-resources
3. Excepciones personalizadas y no tragar excepciones

**Módulo 4 · Módulo 4: Streams y programación funcional**
1. Stream API — map, filter, reduce, collect
2. Optional — evitar null explícitamente
3. Streams paralelos y referencias a métodos
4. Stream Gatherers (Java 24)

**Módulo 5 · Módulo 5: Concurrencia — hilos y virtual threads**
1. ExecutorService y gestión de hilos
2. CompletableFuture
3. Virtual threads
4. Condiciones de carrera y sincronización
5. Structured Concurrency (StructuredTaskScope, Java 25)
6. Scoped Values frente a ThreadLocal (Java 25)
7. Timeouts y cancelación cooperativa sin abandonar recursos

**Módulo 6 · Módulo 6: I/O, NIO.2 y serialización**
1. NIO.2 — Path y Files
2. Serialización con Jackson
3. Archivos grandes y recursos del classpath

**Módulo 7 · Módulo 7: Sealed classes y pattern matching**
1. sealed — jerarquías cerradas y exhaustividad
2. Pattern matching exhaustivo y para instanceof
3. Unnamed variables y patterns (_, Java 22)

**Módulo 8 · Módulo 8: Build tools — Maven y Gradle**
1. pom.xml vs build.gradle.kts
2. Ciclo de vida de build y scopes
3. Proyectos multi-módulo
4. Maven y Gradle lado a lado — el mismo proyecto en dos herramientas

**Módulo 9 · Módulo 9: Testing con JUnit 6 (Jupiter) y Mockito**
1. JUnit 6 (Jupiter) — anotaciones y ciclo de vida
2. Mockito — aislar dependencias
3. Tests parametrizados y cobertura
4. Pruebas basadas en propiedades: reglas que se cumplen para cualquier entrada — Avanzado

**Módulo 10 · Módulo 10: Módulos (JPMS) y proyectos grandes**
1. module-info.java y encapsulación fuerte
2. Migración incremental y cuándo JPMS aporta valor
3. opens para acceso reflexivo controlado de frameworks

**Módulo 11 · Módulo 11: JVM interna — GC, profiling y JIT**
1. Generaciones de memoria y recolectores
2. Java Flight Recorder y JIT compilation
3. Referencias especiales y heap dumps
4. Foreign Function & Memory API (Java 22)

**Módulo 12 · Módulo 12: Buenas prácticas y patrones de diseño**
1. Builder — configuración paso a paso y validación
2. Factory Method y Strategy
3. Abstract Factory y familias de productos compatibles
4. SOLID y cuándo NO aplicar un patrón
5. Prototype: copiar un objeto sin compartir sus datos
6. Patrones estructurales para conectar piezas existentes

**Módulo 13 · Módulo 13: Proyecto integrador**
1. Arquitectura por capas del proyecto integrador
2. Integrando concurrencia, modelado y testing
3. Build reproducible y cierre del track

**Módulo 14 · Módulo 14: Java en producción — memoria, benchmarks y runtime seguro**
1. Compartir memoria requiere orden y visibilidad
2. La JVM optimiza y puede invalidar un cronómetro ingenuo
3. Deserializar es permitir construcción y comportamiento
4. El runtime es parte del artefacto y necesita ciclo de vida
5. Arranque más rápido: archivos CDS y la caché AOT — Avanzado
6. Migrar entre versiones LTS: de 17 a 21 y 25 con jdeprscan y jdeps — Avanzado

**Módulo 15 · Módulo 15: Java Master — builds, pruebas y observabilidad**
1. Maven avanzado
2. Gradle y builds reproducibles
3. Proyectos multi-módulo sin ciclos
4. JUnit 6, Mockito y assertions expresivas
5. Pruebas de integración reproducibles
6. SLF4J, Logback, MDC y logging estructurado

**Módulo 16 · Módulo 16: JPA, Hibernate y FetchType.LAZY vs EAGER**
1. Entidades y relaciones JPA
2. FetchType.LAZY, EAGER y el problema N+1
3. Relaciones uno a uno, muchos a muchos y herencia
4. Ciclo de vida, EntityManager y consultas tipadas
5. Búsquedas dinámicas con Criteria y Querydsl
6. EntityGraph y cachés de persistencia
7. Concurrencia, transacciones y propagación
8. Migraciones y pruebas JPA con Testcontainers

**Módulo 17 · Módulo 17: JDBC, DAO y transacciones**
1. JDBC, PreparedStatement y DAO
2. Transacciones, ACID y aislamiento

**Módulo 18 · Módulo 18: HTTP, seguridad y backend con Java**
1. HttpClient, REST, timeouts y fallos
2. Tokens, validación y límites de seguridad
3. Criptografía con la JCA: SHA-256, HMAC y AES-GCM sin inventar algoritmos — Avanzado

**Módulo 19 · Módulo 19: Java del día a día — reflexión, regex, dinero, contratos, plugins e i18n**
1. Reflexión y anotaciones en tiempo de ejecución
2. Expresiones regulares con Pattern y Matcher
3. Dinero exacto con BigDecimal
4. Assertions y diseño por contrato
5. ServiceLoader: plugins sin acoplar implementaciones
6. Proxies dinámicos: así funcionan @Transactional y los mocks
7. Internacionalización: números, monedas, fechas y orden de texto
8. Carga de clases: cargadores, delegación y plugins con URLClassLoader — Avanzado
9. MethodHandles y VarHandles: invocar métodos y cambiar campos con acceso tipado — Experto

**Módulo 20 · Módulo 20: Java funcional — interfaces que componen comportamiento**
1. Las cuatro formas: Predicate, Function, Consumer y Supplier
2. Componer sin anidar: andThen, compose, negate y reglas encadenadas
3. Streams como composición: pereza, orden y efectos que se esconden
4. Function y BiFunction: transformar uno o dos datos
5. UnaryOperator y BinaryOperator: la salida conserva el tipo
6. Referencias a métodos: escribir la operación sin repetirla
7. Optional: buscar un envío que puede no existir
8. Streams intermedios: filtrar, transformar, aplanar y ordenar
9. Streams terminales: encontrar, contar y combinar resultados
10. Collectors: formar listas, mapas, grupos y texto
11. Streams paralelos: comparar antes de acelerarlos
12. Pureza y efectos: calcular separado de guardar o imprimir
13. Flow API: publicar datos con demanda y cierre

**Módulo 21 · Módulo 21: APIs públicas, compatibilidad y evolución**
1. Qué es la superficie pública de una API — Básico
2. Compatibilidad binaria frente a compatibilidad de fuente — Intermedio
3. Evolucionar sin romper: default methods, deprecación y retirada — Intermedio
4. Genéricos, borrado y métodos puente en la superficie pública — Avanzado
5. Verificar la compatibilidad en el build — Avanzado

**Módulo 22 · Módulo 22: El objeto por dentro: copia, enums y tipos anidados**
1. Copia defensiva, copia superficial y clone — Intermedio
2. Enums de dominio: estado, código y comportamiento — Intermedio
3. Clases anidadas, this$0 y la referencia que retiene — Avanzado


## javascript

**Módulo 0 · Módulo 0: Fundamentos de JavaScript con ejemplos independientes**
1. Variables — `const`, `let` y `var` — Básico
2. Tipos primitivos y `typeof` — Básico
3. Conversión, coerción e igualdad — Básico
4. Template literals y mensajes seguros — Básico
5. JavaScript en navegador y Node.js — Intermedio

**Módulo 1 · Módulo 1: Operadores, control de flujo y funciones**
1. Control de flujo — if, switch y loops — Básico
2. Tres formas de escribir una función — Básico
3. Parámetros por defecto y rest/spread — Intermedio
4. Desestructuración, valores por defecto y rest — Intermedio
5. Funciones de orden superior — Intermedio
6. IIFE y el objeto arguments — Intermedio

**Módulo 2 · Módulo 2: Scope, closures y el modelo de ejecución**
1. Scope léxico y closures — Intermedio
2. Hoisting y Temporal Dead Zone — Intermedio
3. Call stack y contexto de ejecución — Intermedio
4. this según el modo de invocación — Intermedio
5. Module pattern y factory functions — Avanzado
6. Execution Context, Scope Chain y Lexical Environment — Avanzado

**Módulo 3 · Módulo 3: Objetos, prototipos y clases**
1. Prototype chain y Object.create — Intermedio
2. class, extends y super — Intermedio
3. Getters, setters y propiedades computadas — Intermedio
4. Encapsulación con campos privados (#campo) — Avanzado
5. Symbol y objetos iterables propios — Avanzado

**Módulo 4 · Módulo 4: Arrays y estructuras de datos funcionales**
1. map, filter, reduce, find, some/every — Intermedio
2. Set y Map frente a Array y Object — Intermedio
3. Inmutabilidad y actualización de estructuras anidadas — Intermedio
4. Métodos inmutables modernos — Intermedio
5. WeakMap y WeakSet — Avanzado

**Módulo 5 · Módulo 5: Asincronía I — Event Loop y Promesas**
1. El Event Loop — Intermedio
2. Promesas — Intermedio
3. Promise.all, allSettled, race y any — Avanzado
4. El motor V8 — JIT y AST — Avanzado
5. Stack, Heap y Garbage Collection — Avanzado

**Módulo 6 · Módulo 6: Asincronía II — async/await y fetch**
1. async/await sobre promesas — Intermedio
2. try/catch en flujos asíncronos — Intermedio
3. fetch API y AbortController — Intermedio
4. Reintentos y timeouts manuales — Avanzado
5. Generadores — function*, yield y yield* — Avanzado
6. Proxies y Reflect — Avanzado
7. Streams web: leer una respuesta de fetch por partes — Avanzado

**Módulo 7 · Módulo 7: Módulos modernos y herramientas de build**
1. ESM frente a CommonJS — Intermedio
2. Tree-shaking y code-splitting — Intermedio
3. Vite y esbuild — Intermedio
4. package.json — exports, type y scripts — Intermedio
5. import() dinámico e import.meta — Avanzado
6. Webpack, Rollup y Babel/SWC — Avanzado
7. Módulos ES a fondo: top-level await, ciclos de importación e import maps — Avanzado
8. Cadena de suministro npm: lockfile, integridad y paquetes alterados — Avanzado

**Módulo 8 · Módulo 8: El DOM y eventos del navegador**
1. Selección y manipulación del DOM — Intermedio
2. Delegación de eventos — Intermedio
3. Formularios y validación nativa — Intermedio
4. Formularios accesibles: validar, anunciar y conservar la entrada — Intermedio
5. Web APIs — localStorage e IntersectionObserver — Avanzado
6. ResizeObserver y MutationObserver — Avanzado
7. requestAnimationFrame y requestIdleCallback — Avanzado

**Módulo 9 · Módulo 9: Testing y calidad de código**
1. Unit testing con Vitest — Intermedio
2. ESLint, Prettier y cobertura de código — Intermedio
3. Mocks, spies y fakes — Avanzado
4. Mockear fetch — Avanzado

**Módulo 10 · Módulo 10: Patrones avanzados y rendimiento**
1. Debounce y throttle — Intermedio
2. Memoización — Intermedio
3. Web Workers para trabajo pesado — Avanzado
4. Profiling con DevTools — Avanzado
5. Core Web Vitals — Avanzado

**Módulo 11 · Módulo 11: TypeScript esencial para devs de JavaScript**
1. Tipos básicos, interfaces y type aliases — Intermedio
2. Narrowing y union types — Intermedio
3. tsconfig esencial y modo strict — Intermedio
4. Generics — Avanzado
5. Decoradores estándar de TypeScript 5 — Avanzado
6. TypeScript avanzado: sobrecargas, tipos mapeados, condicionales y satisfies — Experto

**Módulo 12 · Módulo 12: Proyecto integrador — SPA sin framework**
1. Routing manual con History API — Avanzado
2. Estado de aplicación con un store propio — Avanzado
3. Consumo de una API real con manejo de errores — Avanzado
4. Conectando todo — el patrón completo de una SPA — Experto

**Módulo 13 · Módulo 13: JavaScript en producción — seguridad, memoria y compatibilidad**
1. Datos no confiables y seguridad en el navegador — Avanzado
2. Memoria administrada no significa memoria infinita — Avanzado
3. Errores útiles sin convertir usuarios en sensores involuntarios — Avanzado
4. Compatibilidad, idioma y tiempo son requisitos de datos — Avanzado

**Módulo 14 · Módulo 14: JavaScript Master: TypeScript, WASM y cómputo emergente**
1. TypeScript avanzado — Avanzado
2. Workers y ejecución fuera del hilo principal — Avanzado
3. Bundlers y optimización — Avanzado
4. Accesibilidad web — Avanzado
5. Web3 y machine learning en navegador — Avanzado
6. Geolocalización, permisos y precisión GPS — Avanzado
7. sessionStorage, cookies e IndexedDB — Avanzado
8. Expresiones regulares avanzadas y Unicode — Avanzado
9. Patrones Factory, Strategy, Observer y Pub/Sub — Avanzado
10. WebSocket y comunicación en tiempo real — Avanzado
11. Typed Arrays, ArrayBuffer y DataView — Avanzado
12. ECMAScript moderno, Temporal e iterator helpers — Avanzado
13. Gestión explícita de recursos: using, await using y DisposableStack — Avanzado
14. WebAssembly con Rust o C — Experto
15. Service Workers, PWA y estrategias de caché — Experto


## kotlin-multiplatform

**Módulo 0 · Módulo 0: Fundamentos de Kotlin**
1. Null safety real
2. data class y funciones de extensión
3. when como expresión
4. Destructuring declarations y rangos

**Módulo 1 · Módulo 1: Programación funcional en Kotlin**
1. Funciones de orden superior
2. Scope functions
3. Sealed classes y colecciones funcionales
4. Lambdas con receptor y builders tipo DSL
5. Genéricos en Kotlin: varianza con in y out, restricciones y reified — Avanzado

**Módulo 2 · Módulo 2: Coroutines y Flow**
1. suspend functions y concurrencia estructurada
2. Flow, StateFlow y SharedFlow
3. Manejo de errores y exclusión mutua
4. Dispatchers y withContext: en qué hilo corre tu código

**Módulo 3 · Módulo 3: Arquitectura de un proyecto KMP**
1. Source sets
2. expect/actual
3. Gradle multiplataforma y targets disponibles
4. Jerarquía de source sets intermedios
5. Version catalogs y convention plugins: una sola fuente de versiones y configuración de Gradle — Avanzado
6. Más allá del móvil: targets JVM, JS y Wasm desde el mismo código común — Avanzado

**Módulo 4 · Módulo 4: Lógica de negocio compartida**
1. Modelos de dominio y casos de uso
2. Repositorios con interfaz común
3. Inyección de dependencias multiplataforma con Koin
4. Modelado de errores de dominio con un tipo Result explícito
5. Tiempo determinista: probar vencimientos sin dormir ni consultar el reloj global

**Módulo 5 · Módulo 5: Networking compartido con Ktor Client**
1. Ktor Client multiplataforma
2. Manejo de errores de red con un tipo explícito
3. Interceptores y autenticación
4. Reintentos con backoff exponencial
5. kotlinx.serialization — JSON compartido entre plataformas

**Módulo 6 · Módulo 6: Persistencia compartida con SQLDelight**
1. Esquemas SQLDelight y queries tipadas
2. Drivers por plataforma
3. Migraciones de esquema
4. Transacciones: atomicidad en operaciones multi-tabla
5. Seguridad multiplataforma: guardar secretos con Keystore y Keychain detrás de una interfaz común — Avanzado

**Módulo 7 · Módulo 7: Compose Multiplatform — UI compartida**
1. Compose Multiplatform vs Jetpack Compose
2. Estado y recomposición — mutableStateOf y por qué la UI se redibuja
3. Theming y navegación compartidos
4. Limitaciones en iOS y otros targets
5. Recursos y localización en Compose Multiplatform: textos, imágenes y plurales comunes — Intermedio
6. Accesibilidad en Compose Multiplatform: semántica que funciona con TalkBack y VoiceOver — Intermedio
7. Compose Hot Reload: ver cambios de la interfaz sin reiniciar la app — Intermedio
8. Deep links en Compose Multiplatform: abrir una pantalla desde un enlace — Avanzado

**Módulo 8 · Módulo 8: Interoperabilidad con iOS**
1. El framework generado para iOS
2. Mapeo de tipos Kotlin ↔ Swift
3. Coroutines desde Swift, y distribución del framework
4. Compose Multiplatform dentro de SwiftUI y vistas UIKit dentro de Compose — Avanzado

**Módulo 9 · Módulo 9: Testing multiplataforma**
1. kotlin.test en commonTest
2. Fakes en vez de mocks
3. runTest para coroutines
4. Benchmarks multiplataforma con kotlinx-benchmark: medir el mismo código en cada target — Avanzado

**Módulo 10 · Módulo 10: CI/CD para KMP**
1. Pipeline Gradle multiplataforma en CI
2. Fastlane
3. Versionado compartido

**Módulo 11 · Módulo 11: Proyecto integrador — app KMP completa**
1. Arquitectura del proyecto integrador
2. Sincronización de datos remotos con caché local
3. Cierre del track — la promesa realista de KMP

**Módulo 12 · Módulo 12: KMP en producción — fronteras, compatibilidad y observabilidad**
1. La mejor frontera compartida es deliberadamente pequeña
2. Garbage collection no cierra sockets ni rompe ciclos externos
3. Un artefacto compatible necesita más que el mismo número de versión
4. Un fallo compartido necesita símbolos y contexto de ambas plataformas

**Módulo 13 · Módulo 13: KMP Master: Native, Swift Export y publicación**
1. Kotlin/Native
2. Interop con C
3. Swift Export
4. XCFramework y API pública
5. Publicación en Maven Central
6. Compatibilidad binaria y CI multi-target


## microservices

**Módulo 0 · Módulo 0.1 · Qué es un programa, un servidor y una API (analogías visuales)**
1. Qué es un programa
2. Qué es un servidor
3. Qué es una API

**Módulo 1 · Módulo 0.2 · Lógica de programación y pensamiento computacional**
1. Lógica de programación
2. Pensamiento computacional

**Módulo 2 · Módulo 0.3 · Introducción a Java y Node.js lado a lado (comparativa visual)**
1. Java y Node.js lado a lado: sintaxis y ejecución
2. Java y Node.js lado a lado: tipos, errores y concurrencia

**Módulo 3 · Módulo 0.4 · Git, terminal, HTTP, JSON, YAML, variables de entorno**
1. Git
2. Terminal
3. HTTP
4. JSON
5. YAML
6. Variables de entorno

**Módulo 4 · Módulo 0.5 · Primer «Hola Mundo» en ambos stacks + Docker básico**
1. Primer «Hola Mundo» en Java
2. Primer «Hola Mundo» en Node.js
3. Docker básico

**Módulo 5 · Módulo 1 · Java moderno y Spring Boot esencial**
1. Java 21: Streams, Lambdas, Optional, Records, Pattern Matching
2. Virtual Threads (Project Loom)
3. Spring IoC, DI, Bean Lifecycle, ApplicationContext
4. Auto-configuración condicional, @Conditional, starters
5. Multi-module Spring Boot projects
6. Perfiles y configuración externalizada
7. CRaC (Coordinated Restore at Checkpoint)
8. GraalVM Native Image

**Módulo 6 · Módulo 2 · APIs REST y persistencia**
1. Spring MVC: DispatcherServlet, Controllers, Validación
2. DTOs, @JsonProperty, Jackson
3. Manejo global de excepciones (@ControllerAdvice)
4. Spring Data JPA, Hibernate, entidades, relaciones, transacciones
5. Criteria API y Specifications
6. Flyway/Liquibase
7. PostgreSQL y MySQL

**Módulo 7 · Módulo 3 · Testing y calidad**
1. JUnit 5, Mockito, MockMvc
2. Testcontainers
3. Contract Testing con Pact y Pact Broker
4. ArchUnit
5. SonarQube

**Módulo 8 · Módulo 4 · Caching y rendimiento**
1. Caching con Redis: @Cacheable, @CacheEvict, TTL
2. Patrones: Read-Through, Write-Behind, Write-Through
3. Distributed Locking con Redlock y Fencing Tokens
4. Cache stampede y solución con locks

**Módulo 9 · Módulo 5 · Introducción a microservicios y DDD**
1. Monolito vs Microservicios vs SOA
2. DDD: Bounded Contexts, Agregados, Eventos de Dominio
3. Spring Modulith
4. 12-Factor App
5. Strangler Fig Pattern
6. Database-per-service

**Módulo 10 · Módulo 6 · Comunicación entre servicios**
1. REST síncrono: RestTemplate, WebClient, OpenFeign
2. gRPC: Protocol Buffers, servicios, streaming
3. GraphQL con Spring for GraphQL
4. Mensajería asíncrona: RabbitMQ y Kafka (introducción)
5. Sync vs async: criterios de decisión

**Módulo 11 · Módulo 7 · Spring Cloud e infraestructura**
1. Service Discovery: Eureka, Consul
2. API Gateway: Spring Cloud Gateway
3. Config Server: configuración centralizada
4. Load Balancing: Spring Cloud LoadBalancer
5. BFF pattern

**Módulo 12 · Módulo 8 · Resiliencia**
1. Resilience4j: Circuit Breaker, Retry, RateLimiter, Bulkhead, TimeLimiter
2. Timeouts en cascada y presupuesto de latencia
3. Fallback strategies
4. Chaos Engineering con Toxiproxy

**Módulo 13 · Módulo 9 · Seguridad**
1. Spring Security: filter chain
2. JWT: firmas simétricas vs asimétricas
3. OAuth2 y OIDC
4. Keycloak
5. RBAC y Scopes
6. Token Exchange (RFC 8693)
7. mTLS con Service Mesh
8. HashiCorp Vault
9. Escaneo de vulnerabilidades: Trivy, Snyk

**Módulo 14 · Módulo 10 · Observabilidad**
1. Micrometer + Prometheus
2. OpenTelemetry + Zipkin/Jaeger
3. Logging estructurado
4. Grafana: dashboards
5. Alerting basado en p99

**Módulo 15 · Módulo 11 · Mensajería avanzada**
1. Kafka profundo: particionamiento, consumer groups
2. Exactly-Once Semantics (EOS)
3. Schema Registry y Avro
4. Dead Letter Topics
5. RabbitMQ: publisher confirms, DLQ
6. NATS

**Módulo 16 · Módulo 12 · Docker, Kubernetes y despliegue**
1. Dockerfile multi-stage, distroless
2. Docker Compose
3. Kubernetes: Deployments, Services, ConfigMaps, Secrets
4. Readiness/Liveness Probes
5. HPA
6. Helm
7. Blue-Green y Canary
8. GitOps con ArgoCD

**Módulo 17 · Módulo 13 · JavaScript/TypeScript moderno y Node.js esencial**
1. ES6+: async/await, Promises, destructuring, modules
2. TypeScript: tipos, interfaces, generics, strict mode
3. Event Loop: fases, microtasks, macrotasks
4. perf_hooks y clinic.js
5. Worker Threads vs Child Processes
6. Backpressure en Streams
7. Graceful shutdown

**Módulo 18 · Módulo 14 · APIs REST con Express y NestJS**
1. Express: routing, middleware, error handling
2. NestJS: módulos, controllers, providers, interceptors, guards
3. Validación con Zod o class-validator
4. DTOs
5. OpenAPI/Swagger

**Módulo 19 · Módulo 15 · Persistencia**
1. MongoDB + Mongoose
2. PostgreSQL + Prisma/Sequelize
3. Database-per-service
4. Connection pooling y transacciones

**Módulo 20 · Módulo 16 · Testing**
1. Jest
2. Supertest
3. Contract Testing con Pact
4. Testcontainers para Node

**Módulo 21 · Módulo 17 · Introducción a microservicios en Node**
1. Estructura de carpetas escalable
2. dotenv
3. Service Discovery con Consul
4. Configuración centralizada

**Módulo 22 · Módulo 18 · Comunicación**
1. REST con Axios/Fetch
2. gRPC con @grpc/grpc-js
3. GraphQL con Apollo Server
4. KafkaJS, amqplib
5. NATS
6. Sync vs async

**Módulo 23 · Módulo 19 · Resiliencia**
1. Circuit Breaker con opossum o cockatiel
2. Retry con jitter
3. Rate Limiting con Redis
4. Timeouts
5. Fallback strategies

**Módulo 24 · Módulo 20 · Seguridad**
1. JWT con jsonwebtoken
2. Passport.js
3. Helmet, CORS
4. Prevención de inyecciones NoSQL
5. OWASP Top 10
6. Secretos: AWS Secrets Manager, Vault, Azure Key Vault

**Módulo 25 · Módulo 21 · Observabilidad**
1. OpenTelemetry para Node
2. Propagación de traceparent en AMQP/Kafka
3. Pino/Winston
4. ELK o Grafana Loki
5. Prometheus client

**Módulo 26 · Módulo 22 · Mensajería y patrones de datos**
1. RabbitMQ: publisher confirms, consumer acknowledgments
2. Deduplicación con Redis
3. Sagas con NestJS CQRS
4. Compensaciones idempotentes
5. Event Sourcing con EventStoreDB o MongoDB
6. Proyecciones materializadas
7. CQRS

**Módulo 27 · Módulo 23 · Docker, Kubernetes y CI/CD**
1. Dockerfile multi-stage
2. Kubernetes
3. HPA
4. GitHub Actions
5. Blue-Green y Canary
6. GitOps con ArgoCD

**Módulo 28 · Módulo 24 · Gobernanza arquitectónica**
1. ADRs
2. Modelo C4
3. ATAM ligero
4. Fitness functions en producción

**Módulo 29 · Módulo 25 · Consistencia distribuida**
1. Outbox Pattern + CDC con Debezium
2. Sagas orquestadas con Temporal.io
3. Idempotencia real en consumidores Kafka
4. Exactly-once semantics en la práctica
5. Two-Phase Commit: por qué no usar

**Módulo 30 · Módulo 26 · Mensajería avanzada y event-driven**
1. Kafka profundo: transacciones, EOS, Schema Registry
2. RabbitMQ avanzado
3. NATS
4. Event Notification vs Event-Carried State Transfer

**Módulo 31 · Módulo 27 · Seguridad Zero-Trust**
1. mTLS con Istio/Linkerd
2. Token Exchange (RFC 8693)
3. Vault
4. Service Mesh

**Módulo 32 · Módulo 28 · FinOps y costo de arquitectura**
1. Modelo de costo cloud
2. Right-sizing
3. Break-even Serverless vs Contenedores
4. Observability tax

**Módulo 33 · Módulo 29 · Team Topologies y organización**
1. Ley de Conway
2. Stream-aligned, Platform, Enabling teams
3. Carga cognitiva
4. Dimensionamiento de equipos

**Módulo 34 · Módulo 30 · Anti-patrones y cuándo NO usar microservicios**
1. Monolito distribuido
2. Sobre-descomposición
3. Sagas innecesarias
4. Fitness functions

**Módulo 35 · Módulo 31 · Migración desde monolito real**
1. Strangler Fig
2. Coexistencia monolito + servicios
3. Métricas de éxito
4. Deuda técnica

**Módulo 36 · Módulo 32 · Proyecto Final y Comité de Arquitectura**
1. Sistema de reservas con pago externo
2. Saga orquestada con Temporal.io
3. API Gateway con rate limiting
4. Test de carga con Gatling
5. Restricción sobrevenida
6. Rediseño documentado en ADR
7. Defensa ante Architecture Review Board


## node

**Módulo 0 · Módulo 0: El runtime de Node — V8, libuv y el Event Loop**
1. Node no es "JavaScript en el servidor" sin más — Básico
2. process, global y módulos core — Básico
3. Fases del Event Loop de Node — Intermedio
4. Event-driven architecture y non-blocking I/O — Intermedio

**Módulo 1 · Módulo 1: Módulos, npm/pnpm y gestión de dependencias**
1. package.json y semver — Básico
2. Lockfiles e instalación reproducible — Básico
3. ESM y CommonJS en el mismo proyecto — Intermedio
4. Scripts de ciclo de vida — Intermedio
5. Workspaces — monorepos con npm/pnpm — Intermedio
6. Publicar y versionar un paquete npm (público o privado) — Intermedio

**Módulo 2 · Módulo 2: Sistema de archivos y streams**
1. fs/promises frente a callbacks — Intermedio
2. Buffer, Blob y las Web APIs de Node: bytes, codificaciones y código compartido con el navegador — Intermedio
3. Streams básicos: Readable, Writable y Transform — Intermedio
4. Compresión con zlib: gzip y Brotli por streams — Intermedio
5. Backpressure: write() y el evento drain — Avanzado
6. pipeline() para componer streams de forma segura — Avanzado

**Módulo 3 · Módulo 3: Servidores HTTP nativos**
1. El modelo request/response — Básico
2. Routing manual — Básico
3. Parsing de body y headers — Intermedio
4. Códigos de estado y content negotiation — Intermedio
5. Paginación por cursor y límites de entrada comprobables — Intermedio
6. Debajo de HTTP: TCP con net, UDP con dgram y resolución DNS — Intermedio
7. HTTPS y HTTP/2 con TLS: certificados, ALPN y varias peticiones por conexión — Avanzado

**Módulo 4 · Módulo 4: Express/Fastify — routing y middleware**
1. Middleware — orden de ejecución y next() — Básico
2. Routers anidados — Básico
3. Validación de entrada con Zod y manejo centralizado de errores — Intermedio
4. Express frente a Fastify — Intermedio
5. WebSocket — comunicación en tiempo real bidireccional — Intermedio
6. Subida de archivos — multipart y validación segura — Intermedio

**Módulo 5 · Módulo 5: Bases de datos — drivers y ORMs**
1. PostgreSQL desde Node con el driver puro — Básico
2. Prisma — schema, migraciones y queries tipadas — Intermedio
3. Pool de conexiones y transacciones — Intermedio
4. MongoDB con Mongoose y otras alternativas de ORM — Intermedio

**Módulo 6 · Módulo 6: Autenticación y autorización**
1. Hashing de contraseñas — Intermedio
2. JWT — access y refresh tokens — Intermedio
3. Middleware de autenticación y control de roles — Intermedio
4. OAuth 2.0 y Passport.js — Intermedio
5. Sesiones, cookies seguras y protección CSRF — Intermedio
6. Flujo de login completo — de `/api/auth/login` a una ruta protegida — Intermedio

**Módulo 7 · Módulo 7: Testing e integración continua**
1. node:test — test runner nativo sin dependencias — Intermedio
2. TDD práctico: rojo, verde y refactor con node:test — Intermedio
3. Cobertura de pruebas con node:test: líneas, ramas y umbrales — Intermedio
4. Vitest y Supertest — pruebas de integración HTTP reales — Intermedio
5. Testcontainers — bases de datos de prueba reales y efímeras — Intermedio
6. Mocks de servicios externos y CI — Intermedio
7. Alternativas de testing y debugging — Intermedio

**Módulo 8 · Módulo 8: Patrones asíncronos avanzados**
1. Worker Threads para trabajo CPU-bound — Intermedio
2. Cluster module y balanceo entre procesos — Intermedio
3. Redis para caché, idempotencia y Pub/Sub — Avanzado
4. Colas de trabajo con BullMQ — Avanzado
5. PM2, memory leaks y heap snapshots — Avanzado

**Módulo 9 · Módulo 9: Observabilidad y manejo de errores en producción**
1. Logging estructurado — Intermedio
2. Correlation ID por request — Intermedio
3. REST, GraphQL y gRPC — Intermedio
4. Excepciones no capturadas y graceful shutdown — Avanzado
5. Contexto por petición con AsyncLocalStorage y eventos con diagnostics_channel — Avanzado
6. Métricas Prometheus y trazas distribuidas con OpenTelemetry — Avanzado

**Módulo 10 · Módulo 10: Seguridad en Node**
1. Cabeceras seguras con helmet — Intermedio
2. Rate limiting — Intermedio
3. Inyección SQL y sanitización contra XSS — Intermedio
4. OWASP API Security Top 10 y auditoría de dependencias — Intermedio
5. CVE, CWE y npm audit en el pipeline — Avanzado
6. Modelo de permisos de Node: limitar archivos, procesos y workers — Avanzado

**Módulo 11 · Módulo 11: Despliegue y contenedores**
1. Dockerfile multi-stage para Node — Intermedio
2. Variables de entorno por ambiente y healthchecks — Intermedio
3. PM2, contenedores y zero-downtime deploys — Avanzado
4. Nginx como reverse proxy y serverless — Avanzado

**Módulo 12 · Módulo 12: Proyecto integrador — API productiva**
1. Arquitectura por capas — Intermedio
2. Posiciones espaciales y Socket.IO con orden recuperable — Avanzado
3. Archivos y notificaciones push sin convertirlos en autorización — Avanzado
4. Uniendo cada módulo del track — Avanzado
5. Qué le falta a esta API para producción real — Avanzado
6. Próximos pasos — microservicios, colas de mensajes y TypeScript — Avanzado

**Módulo 13 · Módulo 13: TypeScript, contratos e integraciones confiables**
1. Tipos estáticos dentro, datos desconocidos en la frontera — Intermedio
2. Un contrato HTTP es comportamiento, no solo documentación — Avanzado
3. OpenAPI como contrato ejecutable — Avanzado
4. Reintentar sin duplicar el efecto — Avanzado
5. Webhooks verificables y recuperación por reconciliación — Avanzado


## react

**Módulo 0 · Módulo 0: JSX, componentes y props**
1. JSX es azúcar sintáctica sobre createElement
2. Listas con key estable
3. Composición sobre herencia, y Fragments
4. Renderizado condicional y estilos

**Módulo 1 · Módulo 1: Estado local y el ciclo de render**
1. useState y actualizaciones funcionales
2. Render frente a commit
3. Batching de actualizaciones
4. Componentes controlados
5. Componentes puros y el estado como instantánea — Básico
6. Compartir estado: levantar el estado al padre común — Básico

**Módulo 2 · Módulo 2: Hooks esenciales**
1. useEffect — dependencias y limpieza
2. Cuándo NO usar un Effect: estado derivado, eventos y reinicio con `key` — Intermedio
3. useRef — valores mutables sin re-render
4. useMemo y useCallback con criterio
5. Reglas de los hooks, useReducer y useImperativeHandle
6. Error Boundaries — contener errores de render sin romper toda la app
7. Efectos cancelables: impedir que una respuesta antigua sobrescriba la selección actual
8. useLayoutEffect y useEffectEvent: medir antes de pintar y leer valores sin reconectar — Avanzado

**Módulo 3 · Módulo 3: Formularios y eventos**
1. React Hook Form y el problema del re-render por tecla
2. Validación con zod y formularios multi-paso
3. Eventos sintéticos
4. Formularios con Actions: useActionState y useOptimistic — Avanzado

**Módulo 4 · Módulo 4: Context API y composición**
1. createContext y useContext
2. Cuándo Context es suficiente y cuándo no
3. Componentes compuestos, render props y hooks personalizados

**Módulo 5 · Módulo 5: React Router — navegación**
1. Rutas anidadas y layouts compartidos
2. Loaders — datos antes de renderizar
3. Rutas protegidas

**Módulo 6 · Módulo 6: Data fetching moderno**
1. useQuery y el problema que resuelve
2. Mutations e invalidación
3. Optimistic updates

**Módulo 7 · Módulo 7: Gestión de estado global**
1. Zustand — stores mínimos sin boilerplate
2. Redux Toolkit — slices y ceremonia
3. Estado de servidor vs estado de cliente, y cuándo no necesitas nada de esto
4. Jotai y XState como alternativas

**Módulo 8 · Módulo 8: Testing en React**
1. Queries por rol, no por clase CSS
2. Mock Service Worker (MSW)
3. Testing de hooks personalizados

**Módulo 9 · Módulo 9: Performance en React**
1. Medir antes de optimizar
2. React.memo con criterio
3. Virtualización de listas largas
4. useTransition, useDeferredValue y Fiber
5. Suspense y React.lazy: carga diferida de componentes y rutas — Intermedio
6. El hook use: leer una promesa con Suspense y un contexto de forma condicional — Avanzado
7. React Compiler y las reglas de React: memoización automática — Avanzado

**Módulo 10 · Módulo 10: Server Components y Next.js**
1. Server Components por defecto
2. use client para interactividad
3. Streaming con Suspense en el servidor
4. Server Actions

**Módulo 11 · Módulo 11: TypeScript con React**
1. Tipado de props y children
2. Hooks genéricos
3. Eventos tipados y componentes polimórficos

**Módulo 12 · Módulo 12: Proyecto integrador — SPA con datos reales**
1. Estructura del proyecto integrador
2. Integrando rutas, TanStack Query y Zustand
3. useEnvios — hook dedicado con TanStack Query

**Módulo 13 · Módulo 13: React en producción — resiliencia, accesibilidad y seguridad**
1. Diseñar estados de carga, error y recuperación
2. La composición visual debe conservar semántica y foco
3. Cliente y servidor forman una sola frontera de seguridad
4. Hidratación determinista, idioma y releases medibles
5. Migrar a React 19: codemods, cambios que rompen y verificación — Avanzado

**Módulo 14 · Módulo 14: Next.js en producción: caché, Proxy, imágenes, React Aria e i18n**
1. Next.js ISR, Metadata y Proxy (antes Middleware)
2. Optimización de imágenes y fuentes
3. Accesibilidad y React Aria
4. i18n, pluralización y RTL


## rutaflow

**Módulo 0 · Módulo 0: RutaFlow desde cero: producto, entorno y dominio**
1. El proceso logístico como sistema
2. Entorno reproducible en Windows, macOS y Linux
3. Arquitectura, privacidad y amenazas

**Módulo 1 · Módulo 1: Datos, geografía y contabilidad de una entrega**
1. Modelo relacional e historial
2. Geografía con precisión útil
3. Ledger de doble partida

**Módulo 2 · Módulo 2: Backend: envíos, asignación e idempotencia**
1. Contratos HTTP y autorización
2. Casos de uso y transacciones
3. Outbox, colas y observabilidad
4. Evolución de contratos: aceptar una versión nueva sin romper clientes anteriores

**Módulo 3 · Módulo 3: Frontend web: cliente y centro de operaciones**
1. Estados explícitos y arquitectura de interfaz
2. Mapas operativos
3. Accesibilidad, seguridad y rendimiento

**Módulo 4 · Módulo 4: Aplicación Flutter del conductor: GPS, batería y offline**
1. Arquitectura Flutter por capacidades
2. GPS, permisos y batería
3. Offline-first y prueba de entrega

**Módulo 5 · Módulo 5: Rutas, mapas y seguimiento en tiempo real**
1. Grafos y problema de rutas
2. Geocoding y map matching
3. Streaming y ETA con incertidumbre
4. Socket.IO extremo a extremo: un gateway compatible con el cliente móvil
5. OSRM: del contrato de coordenadas a una respuesta de ruta verificable

**Módulo 6 · Módulo 6: Facturación, recaudo, liquidaciones y fraude**
1. Cotización y facturación reproducible
2. Recaudo, liquidación y conciliación
3. Fraude responsable
4. Tokenización de pagos: un identificador opaco no sustituye autorización ni confirmación

**Módulo 7 · Módulo 7: Producción: cloud, DevOps, seguridad y operación**
1. Infraestructura y entrega segura
2. SLO y respuesta a incidentes
3. Pruebas end-to-end del sistema completo (app ↔ backend)
4. Continuidad, costes y proyecto final


## spring-boot

**Módulo 0 · Módulo 0: Fundamentos de Spring: IoC, DI y AOP**
1. Inversión de control y el contenedor de Spring
2. Inyección por constructor vs por campo
3. Estereotipos, autoconfiguración y scopes
4. Ciclo de vida de los beans y apagado ordenado — Intermedio
5. Proxies y AOP: `@Aspect`, `@Around` y `BeanPostProcessor` — Intermedio
6. Varias implementaciones (`@Primary`, `@Qualifier`) y expresiones SpEL — Intermedio

**Módulo 1 · Módulo 1: Spring Boot CLI y estructura de proyecto**
1. Spring Initializr y starters
2. application.yml vs application.properties
3. Perfiles y estructura por capas

**Módulo 2 · Módulo 2: REST APIs con Spring Web**
1. Por qué DTOs en vez de entidades directamente
2. Validación con Bean Validation y ResponseEntity
3. Manejo centralizado de errores con @ControllerAdvice
4. Lombok y MapStruct sin exponer datos internos
5. OpenAPI con springdoc: el contrato como prueba
6. Paginación HTTP con validación y un límite de recursos explícito
7. JSON con Jackson 3: `JsonMapper`, fechas y valores por defecto nuevos — Intermedio
8. Versionado de API nativo de Spring Framework 7 — Intermedio

**Módulo 3 · Módulo 3: JDBC, JdbcClient y transacciones en Spring Boot**
1. DataSource, JdbcTemplate y DAO
2. `JdbcClient`: la API fluida de Spring para SQL explícito — Intermedio
3. `@Transactional`, rollback y límites de transacción

**Módulo 4 · Módulo 4: Persistencia con Spring Data JPA**
1. Entidades y repositorios derivados
2. El problema N+1 y su corrección
3. Más allá del N+1: el límite de LAZY y páginas DTO
4. Migraciones con Flyway
5. Spring Data MongoDB: documentos, consultas derivadas y cuándo elegir un modelo de documentos — Intermedio

**Módulo 5 · Módulo 5: Spring Security I: cadena, JWT con resource server, CORS y SSRF**
1. SecurityFilterChain moderno
2. JWT con el resource server de Spring Security y autorización por rol — Intermedio
3. CORS y CSRF
4. Reducir SSRF en clientes HTTP con InetAddressFilter
5. Flujo de login completo — de `/api/auth/login` a una ruta protegida

**Módulo 6 · Módulo 6: Testing en Spring Boot**
1. Probar un controller con `@WebMvcTest`
2. Probar el repositorio contra PostgreSQL con `@DataJpaTest`
3. Integrar el flujo con `@SpringBootTest`
4. `RestTestClient`: el cliente de pruebas HTTP de Spring Boot 4 — Intermedio
5. Contenedores Testcontainers reutilizados entre clases

**Módulo 7 · Módulo 7: Configuración, errores y observabilidad**
1. @ConfigurationProperties tipado
2. Fallar rápido al arranque
3. Manejo global de excepciones consistente entre entornos
4. FailureAnalyzer: errores de arranque que explican la causa y la solución — Avanzado
5. Actuator y health checks personalizados
6. Contar operaciones de negocio con Micrometer
7. Liveness y readiness sin reinicios en cadena
8. Logging en Spring Boot: niveles, grupos y logs estructurados en JSON — Intermedio

**Módulo 8 · Módulo 8: Integraciones Spring: scheduling, eventos, correo, caché e IA**
1. Scheduling y tareas periódicas
2. Eventos locales, eventos transaccionales y mensajería
3. Correo con Spring Mail y entrega recuperable
4. Caché con Spring Cache, Caffeine y Redis
5. Integraciones empresariales, SOAP y fronteras de protocolo
6. Spring AI: ChatClient y herramientas con autorización fuera del modelo
7. RAG desde la frontera de datos: recuperar evidencia autorizada antes de generar
8. Model Context Protocol (MCP) con Spring AI: exponer y consumir herramientas

**Módulo 9 · Módulo 9: Concurrencia, @Async y resiliencia en el núcleo de Spring**
1. @Async y ejecutores: trabajo en segundo plano con límites
2. CompletableFuture, @Async y el bug de la autoinvocación — Avanzado
3. Locks, deadlocks, semáforos y MDC en concurrencia — Experto
4. Resiliencia en el núcleo: `@Retryable` y `@ConcurrencyLimit` (Spring Framework 7) — Avanzado

**Módulo 10 · Módulo 10: Mensajería con Kafka: eventos, errores, outbox y contratos**
1. Producers y consumers con Spring Kafka
2. Dead-letter queue
3. Transacciones Kafka y SQL: idempotencia y límites de exactly-once
4. Outbox transaccional y flujo de negocio
5. Rebalanceo de consumer groups y asignación de particiones
6. Kafka Streams con Spring para transformar eventos
7. Avro y Schema Registry para contratos de eventos

**Módulo 11 · Módulo 11: RabbitMQ, JMS y Spring Cloud Stream**
1. Kafka frente a RabbitMQ
2. RabbitMQ con Spring AMQP: routing, ack y prefetch
3. JMS con Spring y ActiveMQ Artemis: colas punto a punto y transacciones — Avanzado
4. bindings y destinations
5. binder Kafka y binder RabbitMQ
6. reintentos, error handler y dead-letter
7. test binder y límites de la prueba

**Módulo 12 · Módulo 12: Spring Batch: jobs, chunks y procesamiento masivo**
1. Job, Step, Tasklet y chunk processing
2. Reinicio, JobParameters, retry, skip y listeners

**Módulo 13 · Módulo 13: Programación reactiva con WebFlux**
1. Mono y Flux
2. WebClient y composición no bloqueante
3. Cuándo WebFlux vale la complejidad, y R2DBC
4. Backpressure real en WebFlux con reactor-test

**Módulo 14 · Módulo 14: Spring GraphQL: contrato, datos anidados y cambios**
1. schema-first con tipos y consultas
2. data fetchers, relaciones y problema N+1
3. mutations y subscriptions
4. pruebas GraphQL con GraphQlTester

**Módulo 15 · Módulo 15: Arquitectura: hexagonal, Clean, C4, ADR y Spring Modulith**
1. Hexagonal: puertos que hablan el idioma del dominio
2. Arquitectura hexagonal verificada con ArchUnit
3. Clean Architecture y DDD táctico: caso de uso antes que framework
4. C4: contexto, contenedores, componentes y código
5. ADR: decisiones con contexto, alternativas y consecuencias
6. módulos y límites entre paquetes
7. eventos entre módulos sin importar implementación
8. documentación generada y mapa de dependencias
9. pruebas de integración por módulo

**Módulo 16 · Módulo 16: Microservicios con Spring Cloud**
1. Config Server y service discovery
2. Spring Cloud Gateway
3. Circuit breaker con Resilience4j
4. Bulkhead y RateLimiter de Resilience4j
5. OAuth2/OIDC, Keycloak y Token Relay sin perder la frontera de autorización
6. HTTP Interfaces, deadlines y descubrimiento según el entorno
7. Spring gRPC, contrato HTTP/2 y evolución segura
8. DDD para decidir límites y propiedad de datos
9. Orquestar pedidos con Temporal y Spring Boot
10. Spring Cloud Bus para propagar cambios de configuración
11. Micrometer Tracing entre servicios
12. Contract testing entre productor y consumidor

**Módulo 17 · Módulo 17: Consistencia, contratos y operación distribuida**
1. `@Transactional` funciona en una frontera, no como encantamiento
2. Recuperación implica duplicación segura
3. Contratos ejecutables protegen despliegues independientes
4. Observabilidad sirve a un objetivo y a una decisión
5. Saga con compensación real
6. Event Sourcing con replay real
7. Compensación que falla: conservar trabajo pendiente y reintentar sin duplicar

**Módulo 18 · Módulo 18: Spring Security II: OIDC, autorización por recurso y SAML**
1. SecurityFilterChain y autorización
2. DTO validation, CORS, JWT/OIDC y clientes HTTP
3. SAML 2.0 con Spring Security: iniciar sesión con el proveedor de identidad de una empresa — Experto

**Módulo 19 · Módulo 19: Empaquetado y despliegue**
1. Fat JAR vs capas de Docker
2. GraalVM native image
3. Health checks para Kubernetes
4. Imágenes OCI con Buildpacks: spring-boot:build-image sin Dockerfile — Avanzado

**Módulo 20 · Módulo 20: Proyecto integrador: backend de entregas productivo**
1. Arquitectura del microservicio integrador
2. Integra seguridad JWT y observabilidad
3. Cierra el servicio con evidencia y próximos pasos
4. CRUD API y contratos
5. MySQL y datos espaciales
6. JPA e Hibernate Spatial
7. JWT Bearer y autorización por roles
8. Tiempo real con STOMP
9. Archivos y notificaciones push

