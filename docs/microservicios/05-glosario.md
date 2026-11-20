# 5 · Glosario visual (120 términos)

> Entregable 5 del prompt del dueño. Cada término tiene una definición corta y un ícono de
> **[Lucide](https://lucide.dev)** (licencia ISC, gratuita y de código abierto). Los nombres de ícono se
> comprobaron uno por uno contra el paquete oficial `lucide-static` 1.76.0 del registro npm el 2026-11-19
> (2404 íconos). Para insertar uno: `<i data-lucide="nombre"></i>` con `lucide` en web, o
> `https://unpkg.com/lucide-static@1.76.0/icons/<nombre>.svg` como imagen.
>
> **Accesibilidad:** el ícono es decorativo; el término siempre va escrito al lado. Si lo usas solo, ponle
> `aria-label` con el término (ver [10-accesibilidad.md](10-accesibilidad.md)).

| Término | Definición corta | Ícono |
|---|---|---|
| 12-Factor App | Doce reglas para que una aplicación sea fácil de desplegar y escalar en la nube (configuración en el entorno, procesos sin estado, logs como flujo…). | `list-ordered` |
| ADR (Architecture Decision Record) | Documento corto que registra una decisión de arquitectura: contexto, opciones, decisión y consecuencias. | `file-text` |
| Agregado | Grupo de objetos de dominio que se guarda y se modifica como una sola unidad para proteger sus reglas. | `boxes` |
| API | Contrato que define cómo un programa pide datos o acciones a otro. | `plug` |
| API Gateway | Puerta de entrada única que enruta, autentica y limita las peticiones hacia los servicios internos. | `door-open` |
| ApplicationContext | Contenedor de Spring que crea, conecta y gestiona los beans de la aplicación. | `package` |
| ATAM | Método para evaluar una arquitectura contra sus atributos de calidad y descubrir riesgos y compromisos. | `scale` |
| Autenticación | Comprobar quién eres (por ejemplo, con usuario y contraseña o un token). | `key-round` |
| Auto-configuración | Mecanismo de Spring Boot que crea beans automáticamente según las clases y propiedades presentes. | `wand-sparkles` |
| Autorización | Decidir qué puedes hacer una vez que se sabe quién eres. | `shield-check` |
| Backpressure | Señal con la que un consumidor lento frena a un productor rápido para no desbordarse. | `gauge` |
| Bean | Objeto creado y gestionado por el contenedor de Spring. | `bean` |
| BFF (Backend for Frontend) | Backend dedicado a un tipo de cliente (web, móvil) que adapta y agrega las respuestas de otros servicios. | `layout-dashboard` |
| Blue-Green | Despliegue con dos entornos idénticos; el tráfico pasa de golpe del viejo (azul) al nuevo (verde). | `toggle-right` |
| Bounded Context | Límite dentro del cual un modelo de dominio y su lenguaje tienen un significado único. | `square-dashed` |
| Broker de mensajes | Servidor intermedio que recibe, guarda y entrega mensajes entre productores y consumidores. | `mail` |
| Bulkhead | Patrón que aísla recursos (hilos, conexiones) para que un fallo no hunda todo el sistema. | `ship` |
| Caché | Copia rápida de datos usados con frecuencia para no volver a calcularlos o pedirlos. | `zap` |
| Cache stampede | Avalancha de peticiones a la fuente cuando una entrada de caché muy usada expira a la vez para todos. | `users` |
| Canary | Despliegue que envía primero un porcentaje pequeño del tráfico a la versión nueva y lo amplía si va bien. | `bird` |
| Carga cognitiva | Cantidad de información que un equipo debe tener en la cabeza para trabajar con su software. | `brain` |
| CDC (Change Data Capture) | Técnica que lee los cambios del log de la base de datos y los publica como eventos. | `database-zap` |
| CI/CD | Integración y entrega continuas: cada cambio se compila, se prueba y se despliega de forma automática. | `infinity` |
| Circuit Breaker | Patrón que corta las llamadas a un servicio que falla y las reintenta tras un tiempo de espera. | `power` |
| Compensación | Acción que deshace el efecto de un paso ya confirmado en una saga. | `undo-2` |
| Config Server | Servicio que entrega la configuración centralizada a los demás servicios. | `settings` |
| ConfigMap | Objeto de Kubernetes que guarda configuración no secreta para los pods. | `file-cog` |
| Connection pool | Conjunto de conexiones a la base de datos abiertas y reutilizadas para no crearlas en cada petición. | `cable` |
| Consistencia eventual | Garantía de que, sin nuevas escrituras, todas las copias acabarán con el mismo valor. | `clock` |
| Consumer group | Conjunto de consumidores de Kafka que se reparten las particiones de un topic. | `users-round` |
| Contenedor | Proceso aislado que lleva su aplicación y dependencias empaquetadas en una imagen. | `container` |
| Contract testing | Pruebas que verifican que consumidor y proveedor respetan el mismo contrato de API. | `handshake` |
| Coreografía | Coordinación de una saga en la que cada servicio reacciona a eventos sin un director central. | `footprints` |
| CORS | Regla del navegador que decide qué orígenes pueden llamar a tu API desde JavaScript. | `globe` |
| CQRS | Separar el modelo que escribe (comandos) del modelo que lee (consultas). | `split` |
| CRaC | Técnica de la JVM que guarda una aplicación ya arrancada en un checkpoint y la restaura en milisegundos. | `snowflake` |
| Dead Letter Queue / Topic | Cola o topic donde van los mensajes que no se pudieron procesar tras varios intentos. | `inbox` |
| Deployment | Objeto de Kubernetes que mantiene un número de réplicas de un pod y gestiona sus actualizaciones. | `rocket` |
| Deuda técnica | Coste futuro de atajos tomados hoy en el código o la arquitectura. | `receipt` |
| Docker Compose | Herramienta que arranca varios contenedores juntos a partir de un archivo YAML. | `layers` |
| Dockerfile | Receta de texto con los pasos para construir una imagen de contenedor. | `file-box` |
| DTO | Objeto simple que transporta datos entre capas o por la red, sin lógica de negocio. | `clipboard-list` |
| Event Loop | Bucle de Node.js que ejecuta callbacks por fases cuando sus operaciones terminan. | `refresh-cw` |
| Event Notification | Evento que solo avisa de que algo pasó; quien lo recibe pide los detalles si los necesita. | `bell` |
| Event Sourcing | Guardar el estado como la secuencia de eventos que lo produjo, en lugar de solo el valor actual. | `history` |
| Event-Carried State Transfer | Evento que lleva dentro los datos necesarios para que el receptor no tenga que consultar al emisor. | `package-open` |
| Evento de dominio | Hecho relevante del negocio que ya ocurrió, nombrado en pasado (PedidoPagado). | `megaphone` |
| Exactly-once (EOS) | Garantía de que el efecto de un mensaje se aplica una sola vez aunque haya reintentos. | `circle-check` |
| Fallback | Respuesta alternativa que se devuelve cuando la operación principal falla. | `life-buoy` |
| FinOps | Práctica que une ingeniería y finanzas para medir y optimizar el coste de la nube. | `piggy-bank` |
| Fitness function | Prueba automática que mide si la arquitectura sigue cumpliendo una característica deseada. | `activity` |
| Git | Sistema de control de versiones que guarda el historial de cambios del código. | `git-commit-horizontal` |
| GitOps | Operar la infraestructura declarándola en Git y dejando que un agente la sincronice. | `git-pull-request` |
| GraalVM Native Image | Compilación anticipada de una aplicación Java a un ejecutable nativo que arranca en milisegundos. | `cpu` |
| GraphQL | Lenguaje de consultas en el que el cliente pide exactamente los campos que necesita. | `share-2` |
| gRPC | Framework de llamadas remotas sobre HTTP/2 con contratos en Protocol Buffers. | `radio` |
| HPA | Horizontal Pod Autoscaler: añade o quita pods según métricas como la CPU. | `trending-up` |
| HTTP | Protocolo de petición y respuesta con el que hablan navegadores, APIs y servicios. | `arrow-left-right` |
| Idempotencia | Propiedad de una operación que produce el mismo resultado aunque se ejecute varias veces. | `repeat` |
| Inversión de control (IoC) | Principio por el que el framework, no tu código, crea y conecta los objetos. | `arrow-down-up` |
| Inyección de dependencias | Entregar a un objeto lo que necesita desde fuera, en lugar de que lo cree él. | `syringe` |
| JSON | Formato de texto para datos estructurados con objetos, listas, cadenas, números y booleanos. | `braces` |
| JWT | Token firmado que lleva afirmaciones (claims) sobre un usuario o servicio. | `key-square` |
| Kafka | Plataforma de streaming que guarda eventos en logs particionados y replicados. | `logs` |
| Kubernetes | Orquestador que despliega, escala y recupera contenedores en un clúster. | `ship-wheel` |
| Ley de Conway | Observación de que los sistemas copian la estructura de comunicación de la organización que los crea. | `building-2` |
| Liveness probe | Comprobación con la que Kubernetes decide reiniciar un contenedor que se quedó colgado. | `heart-pulse` |
| Load balancing | Repartir las peticiones entre varias instancias de un servicio. | `waypoints` |
| Logging estructurado | Escribir los logs como datos (por ejemplo JSON con campos) en lugar de texto libre. | `scroll-text` |
| Microservicio | Servicio pequeño y desplegable por separado que se encarga de una capacidad de negocio. | `box` |
| Middleware | Función que se ejecuta en la cadena de una petición antes de llegar al manejador final. | `between-horizontal-start` |
| Monolito | Aplicación que se construye y despliega como una sola unidad. | `building` |
| Monolito distribuido | Servicios separados que deben desplegarse juntos porque están muy acoplados. | `link` |
| mTLS | TLS mutuo: cliente y servidor se autentican con certificados. | `lock` |
| NATS | Sistema de mensajería ligero; JetStream le añade persistencia. | `send-horizontal` |
| OAuth2 | Marco para delegar acceso limitado a recursos mediante tokens. | `ticket-check` |
| Observabilidad | Capacidad de entender el estado interno de un sistema a partir de métricas, logs y trazas. | `eye` |
| OIDC (OpenID Connect) | Capa de identidad sobre OAuth2 que añade el ID Token y datos del usuario. | `id-card` |
| OpenAPI | Especificación estándar para describir APIs REST en YAML o JSON. | `book-open` |
| OpenTelemetry | Estándar abierto y SDKs para generar y exportar trazas, métricas y logs. | `telescope` |
| Orquestación | Coordinación de una saga por un componente central que ordena cada paso. | `workflow` |
| Outbox Pattern | Guardar el evento en una tabla dentro de la misma transacción que el cambio y publicarlo después. | `archive` |
| p99 | Percentil 99: el 99 % de las peticiones tardó menos que este valor. | `chart-column` |
| Partición | Subdivisión ordenada de un topic de Kafka que permite paralelizar el consumo. | `columns-3` |
| Pod | Unidad mínima de Kubernetes: uno o más contenedores que comparten red y almacenamiento. | `package-2` |
| Promise | Objeto de JavaScript que representa un resultado que llegará en el futuro. | `hourglass` |
| Protocol Buffers | Lenguaje para definir mensajes y servicios que se serializan en binario compacto. | `binary` |
| Publisher confirms | Confirmación de RabbitMQ al productor de que el broker aceptó el mensaje. | `mail-check` |
| RabbitMQ | Broker de mensajes basado en colas y exchanges (AMQP). | `rabbit` |
| Rate limiting | Limitar cuántas peticiones acepta un servicio por cliente y por unidad de tiempo. | `traffic-cone` |
| RBAC | Control de acceso basado en roles: los permisos se asignan a roles y los roles a usuarios. | `user-cog` |
| Readiness probe | Comprobación con la que Kubernetes decide si un pod puede recibir tráfico. | `circle-check-big` |
| Redis | Almacén de datos en memoria usado como caché, cola, contador o lock. | `memory-stick` |
| REST | Estilo de API que expone recursos con URLs y usa los métodos HTTP para operar sobre ellos. | `earth` |
| Retry | Volver a intentar una operación fallida, normalmente con espera creciente. | `rotate-ccw` |
| Saga | Secuencia de transacciones locales con compensaciones para mantener la consistencia entre servicios. | `list-checks` |
| Schema Registry | Servicio que guarda y versiona los esquemas de los mensajes y comprueba su compatibilidad. | `library` |
| Serverless | Modelo en el que pagas por ejecución y el proveedor gestiona los servidores. | `cloud` |
| Service discovery | Mecanismo con el que un servicio encuentra la dirección actual de otro. | `compass` |
| Service mesh | Capa de proxies junto a cada servicio que gestiona tráfico, seguridad y telemetría. | `network` |
| Servidor | Programa (o máquina) que espera peticiones y devuelve respuestas. | `server` |
| SOA | Arquitectura orientada a servicios, a menudo con un bus central (ESB) y contratos compartidos. | `server-cog` |
| Span | Unidad de trabajo dentro de una traza, con inicio, duración y atributos. | `git-commit-vertical` |
| Spring Boot | Framework que arranca aplicaciones Spring con configuración por defecto y servidor embebido. | `leaf` |
| Strangler Fig | Migración gradual en la que servicios nuevos reemplazan partes del monolito hasta retirarlo. | `tree-deciduous` |
| Team Topologies | Modelo de organización con cuatro tipos de equipo y tres modos de interacción. | `group` |
| Terminal | Programa de texto donde escribes comandos para el sistema operativo. | `terminal` |
| Timeout | Tiempo máximo que esperas una respuesta antes de darla por fallida. | `alarm-clock` |
| Token Exchange (RFC 8693) | Intercambiar un token por otro con distinto destinatario o permisos en el servidor de autorización. | `arrow-right-left` |
| Traza | Recorrido completo de una petición a través de los servicios, formado por spans. | `route-off` |
| Two-Phase Commit (2PC) | Protocolo de transacción distribuida con fase de preparación y de confirmación; bloquea si el coordinador cae. | `git-compare` |
| TypeScript | JavaScript con tipos estáticos que se comprueban al compilar. | `file-type` |
| Variable de entorno | Valor con nombre que el sistema operativo entrega al proceso al arrancar. | `variable` |
| Vault | Gestor de secretos de HashiCorp con secretos dinámicos, cifrado y auditoría. | `vault` |
| Virtual Threads | Hilos ligeros de Java gestionados por la JVM que permiten miles de tareas bloqueantes a la vez. | `spool` |
| Worker Thread | Hilo de Node.js con su propio event loop para trabajo de CPU sin bloquear el principal. | `cog` |
| Write-Behind | Escribir primero en caché y persistir en la base de datos de forma asíncrona. | `save` |
| Write-Through | Escribir en caché y en la base de datos en la misma operación. | `save-all` |
| YAML | Formato de texto para configuración basado en indentación. | `list-tree` |
| Zero-Trust | Modelo de seguridad que no confía en nada por estar dentro de la red: todo se autentica y autoriza. | `shield-alert` |
