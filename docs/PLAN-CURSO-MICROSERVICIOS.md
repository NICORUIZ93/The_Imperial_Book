# Plan curricular verificable: Microservicios

Estado: diseño curricular aprobado para implementación progresiva. **No es todavía
un track publicado ni acredita lecciones terminadas.** Cada módulo se publicará
cuando sus temas cumplan el contrato de profundidad, ejecución y revisión humana.

## Propósito y frontera

El curso enseña a decidir, diseñar, construir, probar y operar sistemas de
microservicios. No presenta «microservicio» como sinónimo de proyecto Spring Boot,
contenedor o API pequeña. Java y Spring Boot son una implementación principal,
pero los contratos, datos, fallos y operación se explican como propiedades del
sistema distribuido.

**Prerrequisitos del track:** Java hasta concurrencia, HTTP y bases de datos;
Spring Boot hasta REST, persistencia, seguridad y testing; Docker, Git y una
terminal funcional. Quien no cumpla estos prerrequisitos vuelve al tema exacto,
no recibe un resumen superficial dentro de este curso.

**Proyecto progresivo:** RutaFlow Distribuido, formado inicialmente por Contexto
de Envíos, Asignación, Facturación y Notificaciones. Empieza como monolito modular,
mide acoplamiento y extrae servicios sólo con evidencia.

## Secuencia completa

### Módulo 0 · Antes de distribuir: proceso, red y falacias

- proceso, host, puerto, socket, DNS, latencia y timeout;
- fallo parcial frente a fallo total;
- reloj, orden, concurrencia y ausencia de memoria compartida;
- serialización, compatibilidad y tamaño del mensaje;
- falacias de la computación distribuida;
- evidencia: dos procesos locales, latencia, timeout y fallo reproducido.

### Módulo 1 · Monolito modular antes de microservicios

- monolito, monolito modular, servicio y microservicio;
- cohesión, acoplamiento y costo de coordinación;
- dependencias entre módulos y arquitectura hexagonal;
- fitness functions con ArchUnit;
- criterios que justifican o rechazan una extracción;
- evidencia: modularizar RutaFlow y bloquear una dependencia prohibida.

### Módulo 2 · Dominio y límites de servicio

- dominio, subdominio y lenguaje ubicuo;
- bounded context, agregado e invariante;
- contexto de negocio frente a capa técnica;
- context map y relaciones upstream/downstream;
- duplicación aceptable frente a modelo compartido;
- evidencia: decidir propiedad de Envío, Ruta, Cobro y Notificación.

### Módulo 3 · Descomposición y contratos evolutivos

- descomposición por capacidad y por subdominio;
- API-first, OpenAPI y esquemas de eventos;
- compatibilidad hacia atrás y hacia adelante;
- versionado, deprecación y consumer-driven contracts;
- anti-corruption layer;
- evidencia: cambio compatible, ruptura detectada y migración del consumidor.

### Módulo 4 · Comunicación síncrona

- HTTP, REST, gRPC y criterios de elección;
- deadline, timeout de conexión y timeout de lectura;
- propagación de contexto y cancelación;
- retry sólo para operaciones seguras o idempotentes;
- fan-out, chatty APIs y composición;
- evidencia: cliente con deadline, cancelación y error tipado.

### Módulo 5 · Mensajería y arquitectura orientada a eventos

- comando, evento y notificación;
- broker, topic, partición, offset y consumer group;
- al-menos-una-vez, a-lo-sumo-una-vez y límites de exactamente-una-vez;
- orden por clave, duplicados y mensajes tardíos;
- Kafka frente a RabbitMQ según el problema;
- evidencia: productor/consumidor con duplicado y reordenamiento controlados.

### Módulo 6 · Propiedad de datos y consistencia

- database per service y prohibición de tablas compartidas;
- consistencia fuerte, eventual y lectura obsoleta;
- CAP usado con condiciones reales, no como eslogan;
- replicación de vistas, CQRS y materialized views;
- consultas que atraviesan servicios;
- evidencia: vista de seguimiento reconstruida desde eventos.

### Módulo 7 · Outbox, idempotencia y entrega confiable

- dual write y ventana de pérdida;
- transactional outbox y relay;
- polling publisher frente a CDC;
- clave idempotente, restricción única y deduplicación;
- inbox, reintentos y dead-letter queue;
- evidencia: crash entre DB y broker sin perder ni duplicar efecto de negocio.

### Módulo 8 · Transacciones distribuidas y sagas

- por qué `@Transactional` termina en la base local;
- 2PC, costo y disponibilidad;
- saga coreografiada frente a orquestada;
- compensación semántica, no rollback mágico;
- reintentos, pasos irreversibles y estado durable;
- evidencia: fallo intermedio, compensación inversa y recuperación tras reinicio.

### Módulo 9 · Descubrimiento, configuración y gateway

- nombres lógicos, DNS y service discovery;
- configuración externalizada, secretos y rotación;
- gateway, BFF y responsabilidades permitidas;
- autenticación en el borde frente a autorización en cada servicio;
- rate limiting y propagación de identidad;
- evidencia: ruta, configuración y autorización interna comprobadas.

### Módulo 10 · Resiliencia y control de sobrecarga

- timeout, retry con backoff y jitter;
- circuit breaker y sus estados;
- bulkhead, rate limiter y cola acotada;
- retry storm, thundering herd y presupuesto de latencia;
- degradación, fallback honesto y load shedding;
- evidencia: dependencia lenta sin colapsar el servicio llamador.

### Módulo 11 · Seguridad entre servicios

- identidad de usuario, workload identity y service account;
- OAuth 2.0/OIDC, JWT y token opaco;
- audience, issuer, expiración y rotación de claves;
- mTLS, autorización por servicio y mínimo privilegio;
- secretos, supply chain y SSRF;
- evidencia: token con audience incorrecta rechazado dentro del servicio.

### Módulo 12 · Observabilidad distribuida

- logs estructurados, correlation ID y datos sensibles;
- métricas RED/USE y cardinalidad;
- trazas, spans, baggage y propagación W3C;
- SLI, SLO, error budget y burn rate;
- diagnóstico de latencia entre servicios;
- evidencia: una traza HTTP→DB→broker→consumer y una alerta accionable.

### Módulo 13 · Pruebas de un sistema distribuido

- unitarias, integración y componente;
- Testcontainers e infraestructura efímera;
- contract testing de productor y consumidor;
- end-to-end selectivo y costo de pirámides invertidas;
- fault injection, latencia, pérdida y caos controlado;
- evidencia: contrato roto y recuperación ante broker/DB reiniciados.

### Módulo 14 · Entrega, Kubernetes y operación

- imagen reproducible, SBOM, firma y escaneo;
- readiness, liveness, startup probe y graceful shutdown;
- requests, limits, autoscaling y PodDisruptionBudget;
- rolling, blue/green, canary y rollback;
- service mesh: beneficio, costo y cuándo no usarlo;
- evidencia: despliegue gradual con tráfico, drenaje y reversión.

### Módulo 15 · Evolución, migración y gobierno

- strangler fig y extracción incremental;
- expand/contract para datos y contratos;
- ownership, plataforma interna y golden paths;
- costo por servicio, carga cognitiva y límites del equipo;
- ADR, catálogo y deuda distribuida;
- evidencia: extraer un contexto sin parada ni cambio coordinado obligatorio.

### Módulo 16 · Proyecto profesional RutaFlow Distribuido

- justificar fronteras y servicios que **no** se extraen;
- implementar HTTP y eventos con contratos versionados;
- outbox, consumidor idempotente y saga durable;
- seguridad de borde e interna;
- trazas, SLO, dashboards y runbooks;
- CI/CD, despliegue gradual, rollback e incidente reproducido;
- defensa final basada en evidencia de fallos, no en cantidad de servicios.

## Criterio de publicación

Cada tema debe tener su propio mapa exhaustivo, archivos, comandos, salida, fallo,
diagnóstico, práctica y transferencia. Los contenidos existentes de Spring Boot
y DevOps se reutilizan como evidencia de origen, pero no se copiarán ciegamente:
se reclasifican, se eliminan dependencias innecesarias del framework y se conserva
trazabilidad hacia el archivo original.
