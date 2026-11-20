# 6 · Cheat sheets por fase

> Entregable 6 del prompt del dueño. Cada hoja resume los **comandos y conceptos de las fichas escritas**; todo lo
> que aparece aquí sale de las fichas (`web/public/content/microservices/modulo-N.md`) y de sus laboratorios en
> `examples/microservicios/`, no de memoria. Cada fila cita su ficha como «Módulo · tema»: ahí están la explicación
> completa, la salida real y la versión exacta.
>
> **Para descargarla:** imprime esta página o expórtala a PDF desde el navegador. Cada fase empieza en su propio
> encabezado `##`, así que puedes imprimir solo la tuya.
>
> **Ojo con las carpetas:** el laboratorio del Módulo *N* no está en `modulo-N`, sino en la carpeta del archivo de
> la lección (por ejemplo, el Módulo 15 está en `examples/microservicios/modulo-19/`). La correspondencia está en
> [03-tabla-de-contenidos.md](03-tabla-de-contenidos.md); en esta hoja cada bloque de comandos la indica.

## Versiones de bolsillo

| Stack | Versión del curso |
|---|---|
| Java | JDK 25 LTS (25.0.5) |
| Spring Boot / Spring Cloud | 4.1.3 / 2025.1.4 |
| Node.js / TypeScript / NestJS | 26.13.1 LTS / 6.0.3 / 12.5.1 |
| Kafka / Kubernetes | 4.4.0 / 1.37 |

Detalle, motivos y fuentes en [08-herramientas-y-versiones.md](08-herramientas-y-versiones.md).

## Fase 0 · Fundamentos absolutos

### Conceptos clave

| Concepto | En una línea | Ficha |
|---|---|---|
| Programa | Datos + instrucciones → resultado. Cambia un dato y puedes predecir el nuevo resultado. | Módulo 0.1 · Qué es un programa |
| Código de salida | `0` = terminó bien; distinto de `0` = algo falló. Se lee con `echo $?`. | Módulo 0.1 · Qué es un programa |
| Servidor | Proceso que **no termina**: se queda escuchando en un puerto y responde pedidos. | Módulo 0.1 · Qué es un servidor |
| Puerto ocupado | Dos servidores no pueden escuchar el mismo puerto: error `EADDRINUSE`. | Módulo 0.1 · Qué es un servidor |
| API | Contrato: qué rutas existen, qué envías y qué recibes. | Módulo 0.1 · Qué es una API |
| Códigos HTTP | `200` OK · `201` creado · `400` pediste mal · `404` no existe. Los `4xx` son del cliente: repetir igual no sirve. | Módulo 0.1 · Qué es una API |
| Rutas | Distinguen mayúsculas: `/api/menu` ≠ `/api/Menu`. | Módulo 0.1 · Qué es una API |
| Lógica | Variables, decisiones (`if/else`), operadores (`&&`, `\|\|`), repeticiones (`for`) y funciones. | Módulo 0.2 · Lógica de programación |
| Casos de borde | Los errores viven en los límites (`>` frente a `>=`): pruébalos siempre, junto con sus vecinos. | Módulo 0.2 · Lógica de programación |
| Pensamiento computacional | Descomponer → reconocer patrones → abstraer en una función → evaluar cuándo falla. | Módulo 0.2 · Pensamiento computacional |
| Algoritmo voraz | Elegir siempre «lo más grande que cabe» es rápido, pero no siempre óptimo (monedas `[1, 3, 4]` para 6). | Módulo 0.2 · Pensamiento computacional |
| Java frente a Node.js: ejecución | Java compila a bytecode y lo ejecuta la JVM; Node.js ejecuta JavaScript con V8. | Módulo 0.3 · sintaxis y ejecución |
| Java frente a Node.js: tipos | Java: tipos estáticos, el error aparece **antes** de ejecutar. JavaScript: tipos dinámicos, el error aparece al ejecutar (o como `NaN`). | Módulo 0.3 · tipos, errores y concurrencia |
| Concurrencia | Java: hilos (virtuales desde Java 21). Node.js: event loop con `async/await`. Tres esperas de 1 s en paralelo tardan ~1 s en ambos. | Módulo 0.3 · tipos, errores y concurrencia |
| Git | Repositorio = carpeta vigilada (con `.git`); commit = foto guardada con un mensaje. Sin `git add`, el cambio no entra en el commit. | Módulo 0.4 · Git |
| Terminal | La shell (bash o zsh) interpreta órdenes de texto; los servidores no tienen pantalla, todo se hace aquí. | Módulo 0.4 · Terminal |
| HTTP | Petición (método, ruta, cabeceras, cuerpo) → respuesta (código, cabeceras, cuerpo). `GET` leer, `POST` crear, `PUT` reemplazar, `DELETE` borrar. | Módulo 0.4 · HTTP |
| JSON | Seis tipos de valor; texto siempre con comillas **dobles**; sin comas finales. | Módulo 0.4 · JSON |
| YAML | `clave: valor`; la **sangría con espacios** (nunca tabuladores) dice qué va dentro de qué. | Módulo 0.4 · YAML |
| Variable de entorno | `NOMBRE=valor` que el sistema entrega al programa al arrancar: mismo código, distinta configuración. Vive en ese proceso y sus hijos. | Módulo 0.4 · Variables de entorno |
| JDK y Node LTS | El curso usa JDK 25 (LTS) y Node.js 26 (LTS); comprueba con `java -version` y `node -v`. | Módulo 0.5 · «Hola Mundo» en Java / en Node.js |
| Docker | Imagen = paquete con el programa y todo lo que necesita; contenedor = imagen en ejecución, aislada. El `Dockerfile` es la receta. | Módulo 0.5 · Docker básico |

### Comandos

```bash
# Ejecutar programas — Módulos 0.1 y 0.3 (examples/microservicios/modulo-0 y modulo-2)
node programa/receta.js                 # ejecuta un archivo JavaScript
echo "Código de salida: $?"             # código de salida del último comando
java Tienda.java                        # Java: compila en memoria y ejecuta (un solo archivo)
javac Tienda.java && java Tienda        # Java: compila a Tienda.class y luego ejecuta

# Servidores y APIs — Módulo 0.1
node servidor/servidor.js               # arranca un servidor (no termina: Ctrl+C para pararlo)
curl -i http://localhost:3000/          # pide una página y muestra cabeceras (-i)
curl -s -X POST http://localhost:3001/api/pedidos \
  -H 'Content-Type: application/json' \
  -d '{"platoId":2,"cantidad":3}' -w ' [%{http_code}]\n'   # imprime también el código HTTP

# Tests — Módulos 0.1 y 0.2
node --test --test-reporter=spec logica/cine.test.js   # tests de Node sin dependencias
java TiendaTest.java                                   # test de Java de un solo archivo
node -e "import('./logica/cine.js').then(m => console.log(m.precioBoleto(60)))"   # probar una función suelta

# Git y terminal — Módulo 0.4 · Git / Terminal (examples/microservicios/modulo-3)
git log --oneline --graph --all         # historia del repositorio
pwd; ls datos; cat datos/app.log        # dónde estoy, qué hay, qué dice
grep -c INFO datos/app.log              # cuenta líneas que contienen INFO
grep ERROR datos/app.log | wc -l        # tubería: la salida de uno es la entrada del otro

# HTTP, JSON, YAML y entorno — Módulo 0.4
curl -i -X DELETE http://localhost:3002/saludo                     # método no permitido: mira el código
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3002/nada # solo el código HTTP
node -e "JSON.parse(require('fs').readFileSync('/tmp/pedido.json','utf8')); console.log('JSON válido')"
PUERTO=9000 MODO=produccion node config.js   # variables solo para este comando
node --env-file=.env.example config.js       # Node lee un archivo .env sin librerías
export PUERTO=7000; unset PUERTO             # definir y borrar en la terminal actual

# «Hola Mundo» y Docker — Módulo 0.5 (examples/microservicios/modulo-4)
java -version; node -v
java HolaServidor.java && curl -i http://localhost:8080/hola
docker build -t hola-docker:1 .                      # construye la imagen
docker run --rm -e MENSAJE="hola desde -e" hola-docker:1
docker ps; docker logs contador; docker stop -t 1 contador; docker rm contador
docker compose up --build -d --wait                  # levanta los dos servicios del laboratorio
```

### Errores frecuentes

| Ves | Significa | Arreglo | Ficha |
|---|---|---|---|
| `Error: Cannot find module '…/receta.js'` · `MODULE_NOT_FOUND` | Ejecutaste desde la carpeta equivocada. | `pwd`, luego `cd examples/microservicios/modulo-0`. | Módulo 0.1 · Qué es un programa |
| `EADDRINUSE` | Ya hay un proceso escuchando en ese puerto. | Para el otro servidor (Ctrl+C) o usa otro puerto. | Módulo 0.1 · Qué es un servidor |
| `✖` con `12000 !== 7000` en un test | Error de borde en una condición. | Imprime el valor en el borde y en sus vecinos. | Módulo 0.2 · Lógica de programación |
| Java muestra `L?piz` en lugar de `Lápiz` | La terminal no usa UTF-8. | Configura la terminal o la configuración regional en UTF-8. | Módulo 0.3 |
| `Permission denied` al ejecutar un guion | El archivo no tiene permiso de ejecución. | `chmod +x` al guion. | Módulo 0.4 · Terminal |
| La API responde 415 o 400 con un JSON correcto | `curl -d` envía `application/x-www-form-urlencoded` por defecto. | Añade `-H 'Content-Type: application/json'`; mira la petición real con `curl -v`. | Módulo 0.4 · HTTP |
| `SyntaxError: Unexpected token … position N` | JSON escrito a mano con comillas simples, coma final o similar. | Cuenta N caracteres desde 0: ahí está el problema. | Módulo 0.4 · JSON |
| Un valor de YAML «no se toma», sin error | Sangría equivocada: YAML válido con otra estructura. | Revisa la sangría con espacios (2 por nivel). | Módulo 0.4 · YAML |
| La variable no se ve en otra terminal | Las variables viven en el proceso de esa terminal y sus hijos. | `export` en la misma terminal o un archivo `.env`. | Módulo 0.4 · Variables de entorno |
| La imagen se construye pero el contenedor no arranca | Error dentro del contenedor, no de la construcción. | `docker logs <contenedor>`. | Módulo 0.5 · Docker básico |

## Fase 1 · Spring Boot

### Conceptos clave

| Concepto | En una línea | Ficha |
|---|---|---|
| Java moderno | Records (datos inmutables), lambdas, Streams, `Optional` y pattern matching: menos código, menos errores. | Módulo 1 · Java 21: Streams, Lambdas… |
| Hilos virtuales | Hilos livianos de la JVM: mientras esperan E/S no ocupan un hilo del sistema operativo. | Módulo 1 · Virtual Threads |
| IoC / DI | Tu clase **pide** sus dependencias en el constructor y Spring se las **entrega**. | Módulo 1 · Spring IoC, DI… |
| Auto-configuración | Clases con condiciones (`@Conditional…`): «si existe Tomcat y nadie configuró otro, crea uno». `--debug` muestra el informe. | Módulo 1 · Auto-configuración condicional |
| Perfiles y configuración externalizada | El mismo jar, distinta configuración: archivo < variable de entorno < argumento `--clave=valor`. | Módulo 1 · Perfiles y configuración externalizada |
| CRaC / GraalVM | CRaC congela la app arrancada y la restaura (solo Linux); Native Image compila a ejecutable y exige saber de antemano la reflexión. | Módulo 1 · CRaC / GraalVM Native Image |
| Spring MVC + validación | `@GetMapping("/productos/{id}")`; con `@Valid` los datos inválidos responden 400 antes del controlador. | Módulo 2 · Spring MVC |
| DTO | Objeto solo para llevar datos por la API: no expone campos internos y aísla a los clientes de los cambios. | Módulo 2 · DTOs, @JsonProperty, Jackson |
| Problem Details | `@ControllerAdvice` convierte todos los errores en una respuesta uniforme `application/problem+json`. | Módulo 2 · Manejo global de excepciones |
| JPA y migraciones | Entidades `@Entity` mapeadas por Hibernate; Flyway/Liquibase versionan el esquema y anotan qué se ejecutó. | Módulo 2 · Spring Data JPA / Flyway/Liquibase |
| Pirámide de tests | JUnit + Mockito (unidad), MockMvc (web), Testcontainers (base real en Docker), Pact (contrato entre equipos). | Módulo 3 · JUnit 5… / Testcontainers / Pact |
| ArchUnit y SonarQube | Reglas de arquitectura como tests; análisis de calidad y cobertura (JaCoCo) con *quality gate*. | Módulo 3 · ArchUnit / SonarQube |
| Caché | `@Cacheable` guarda, `@CacheEvict` invalida, TTL caduca. Read-Through, Write-Through y Write-Behind deciden quién va a la base y cuándo. | Módulo 4 · Caching con Redis / Patrones |
| Candado distribuido | `SET clave valor NX PX 30000` + **fencing token** para rechazar al dueño que despertó tarde. | Módulo 4 · Distributed Locking |
| Cache stampede | Cuando un dato muy pedido caduca, todos van a la base a la vez: un solo cargador con candado (TTL mayor que la carga). | Módulo 4 · Cache stampede |
| Monolito, microservicios, SOA | El monolito (mejor si es modular) es lo más simple de construir y operar; microservicios solo cuando lo justifica la independencia. | Módulo 5 · Monolito vs Microservicios vs SOA |
| DDD | Bounded Context (cada palabra significa una cosa), Agregado (protege sus reglas), Evento de dominio. | Módulo 5 · DDD |
| Strangler Fig y BD por servicio | Fachada delante del viejo y migrar ruta a ruta; cada servicio es el único dueño de sus tablas. | Módulo 5 · Strangler Fig / Database-per-service |
| Sync vs async | Si necesitas la respuesta para seguir, llama; si solo avisas que algo pasó, publica un mensaje. | Módulo 6 · Sync vs async |
| gRPC y GraphQL | gRPC: contrato `.proto` y Protocol Buffers binarios; GraphQL: el cliente elige los campos en `/graphql`. | Módulo 6 · gRPC / GraphQL |
| Spring Cloud | Eureka/Consul (registro), Gateway (entrada única), Config Server (configuración central, `/actuator/refresh`), LoadBalancer (`@LoadBalanced`). | Módulo 7 |
| BFF | Un backend por tipo de cliente; llama a los servicios **en paralelo**. | Módulo 7 · BFF pattern |
| Resilience4j | Circuit Breaker, Retry, RateLimiter, Bulkhead y TimeLimiter alrededor de cada llamada remota. | Módulo 8 · Resilience4j |
| Presupuesto de latencia | El deadline viaja (`X-Deadline`) y cada salto usa solo lo que queda. | Módulo 8 · Timeouts en cascada |
| Fallback y caos | El plan B dice la verdad y no se usa para lo crítico; Toxiproxy inyecta latencia y cortes para probarlo. | Módulo 8 · Fallback / Chaos Engineering |
| Seguridad | Filter chain; JWT (los datos se leen, la firma impide cambiarlos); OAuth2 + OIDC con Keycloak; RBAC y scopes; Token Exchange; mTLS; Vault; Trivy/Snyk. | Módulo 9 |
| Observabilidad | Micrometer + Prometheus (métricas), OpenTelemetry + Zipkin/Jaeger (trazas), logs JSON con `traceId`, Grafana, alertas sobre p99. | Módulo 10 |
| Kafka profundo | Misma clave → misma partición (orden); una partición → un consumidor del grupo; otro grupo recibe todo. | Módulo 11 · Kafka profundo |
| EOS, Schema Registry, DLT | Transacciones Kafka; esquemas Avro versionados con compatibilidad; lo permanente va al Dead Letter Topic. | Módulo 11 |
| RabbitMQ y NATS | Publisher confirms + DLQ; NATS core no guarda nada (JetStream sí). | Módulo 11 · RabbitMQ / NATS |
| Docker y Kubernetes | Multi-stage + distroless; Deployment, Service, ConfigMap, Secret; probes startup/liveness/readiness; HPA; Helm; Blue-Green y Canary; Argo CD. | Módulo 12 |

### Comandos

```bash
# Maven y arranque — Módulo 1 (examples/microservicios/modulo-5)
../mvnw -q package -DskipTests && java -jar target/f019-ioc-di-1.0.0.jar
java -jar target/f020-autoconfiguracion-1.0.0.jar --debug       # informe de auto-configuración
java -jar target/f022-perfiles-1.0.0.jar --spring.profiles.active=prod
TIENDA_DESCUENTOMAXIMO=7 java -jar target/f022-perfiles-1.0.0.jar   # variable de entorno sobrescribe el archivo
../mvnw -q -pl tienda-api -am test                               # solo un módulo y los que necesita

# API REST y persistencia — Módulo 2 (modulo-6)
../mvnw -q spring-boot:run
curl -s -o /dev/null -w "%{http_code} %header{location}\n" -X POST localhost:8080/productos \
  -H "Content-Type: application/json" -d '{"nombre":"Café de Huila","precio":32000}'
docker compose up -d --wait
docker compose exec postgres psql -U tienda -d f030_flyway -c "SELECT version, success FROM flyway_schema_history"

# Tests — Módulo 3 (modulo-7)
../mvnw test
./mvnw -pl f034-pact-consumidor test && ./mvnw -pl f034-pact-proveedor test
./mvnw -pl f034-pact-consumidor pact:can-i-deploy -Dpacticipant=tienda-web -DpacticipantVersion=1.0.0
../mvnw verify && ls target/site/jacoco/                         # cobertura para SonarQube

# Redis — Módulo 4 (modulo-8)
docker compose exec redis redis-cli --scan --pattern 'productos::*'
docker compose exec redis redis-cli TTL productos::1
docker compose exec redis-a redis-cli SET lock:demo yo NX PX 30000

# Comunicación y Spring Cloud — Módulos 6 y 7 (modulo-10, modulo-11)
curl -s localhost:8080/graphql -H 'Content-Type: application/json' \
  -d '{"query":"{ producto(sku: \"CAFE\") { nombre precio } }"}'
docker compose exec kafka /opt/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 \
  --topic pedidos --from-beginning --property print.key=true --timeout-ms 5000
curl -s 'localhost:8500/v1/health/service/catalogo?passing=true' | jq -r '.[].Service.Service'
curl -s localhost:8888/catalogo/prod | jq '.propertySources[] | {name, source}'
curl -s -X POST localhost:8081/actuator/refresh                  # el cliente relee la configuración

# Resiliencia — Módulo 8 (modulo-12)
./simular-fallo.sh caido | lento 2000 | cuelga | sano            # Toxiproxy (elige uno)
curl -s localhost:8080/actuator/health | jq '.components.circuitBreakers.details.inventario.details.state'

# Seguridad — Módulo 9 (modulo-13)
docker compose up -d --wait keycloak
curl -s localhost:8180/realms/tienda/.well-known/openid-configuration | jq '{issuer, token_endpoint, jwks_uri}'
TOKEN=$(curl -s localhost:8180/realms/tienda/protocol/openid-connect/token \
  -d grant_type=password -d client_id=tienda-cli -d username=ana -d password=clave-demo \
  -d scope="openid pedidos:leer" | jq -r .access_token)
curl -s -H "Authorization: Bearer $TOKEN" localhost:8081/pedidos
docker run --rm -v "$PWD":/src:ro aquasec/trivy:0.76.1 fs --scanners vuln --severity HIGH,CRITICAL --exit-code 1 /src/antes

# Observabilidad — Módulo 10 (modulo-14)
curl -s localhost:8080/actuator/prometheus | grep '^pedidos_creados_total'
curl -s 'localhost:9090/api/v1/query?query=up{job="f070-pedidos"}' | jq -r '.data.result[0].value[1]'
docker run --rm -v "$PWD/prometheus":/p -w /p --entrypoint promtool prom/prometheus:v3.15.1 test rules reglas_test.yml

# Mensajería avanzada — Módulo 11 (modulo-15)
docker compose exec kafka /opt/kafka/bin/kafka-consumer-groups.sh \
  --bootstrap-server localhost:9092 --describe --group inventario    # particiones, offsets y lag
curl -s http://localhost:8081/subjects                               # Schema Registry
docker compose exec rabbitmq rabbitmqctl -q list_queues name type messages

# Docker y Kubernetes — Módulo 12 (modulo-16)
kind create cluster --config kind/cluster.yaml
kind load docker-image academia/catalogo:1.0.0 --name academia-m12   # la imagen local entra al clúster
kubectl apply -f k8s/base/ && kubectl -n catalogo rollout status deployment/catalogo
kubectl -n catalogo get deploy,rs,pods,svc
kubectl -n catalogo get hpa catalogo -w
helm install demo charts/catalogo -n catalogo-helm --create-namespace --wait
helm upgrade demo charts/catalogo -n catalogo-helm --set image.tag=1.1.0 --wait
helm rollback demo 1 -n catalogo-helm --wait
kubectl -n argocd get application guestbook -w
```

### Errores frecuentes

| Ves | Significa | Arreglo | Ficha |
|---|---|---|---|
| La app deja de arrancar al añadir una segunda implementación | Dos beans candidatos para la misma interfaz. | `@Primary` en la implementación por defecto o `@Qualifier` en el constructor. | Módulo 1 · Spring IoC, DI… |
| `415 Unsupported Media Type` | El cliente no envió `Content-Type: application/json`. | Añade la cabecera. | Módulo 2 · Spring MVC |
| `LazyInitializationException` al leer una colección | Se accede a la relación perezosa fuera de la transacción. | `@EntityGraph` o `JOIN FETCH`, o trabaja dentro de `@Transactional(readOnly = true)` y devuelve un DTO. | Módulo 2 · Spring Data JPA |
| Error de *checksum* de Flyway tras un `git pull` | Alguien editó una migración ya aplicada. | Nunca edites una migración aplicada: crea una nueva. | Módulo 2 · Flyway/Liquibase |
| Los tests de Testcontainers fallan antes de empezar | Docker apagado o socket no encontrado. | Arranca Docker; revisa el socket (Colima, Rancher). | Módulo 3 · Testcontainers |
| `NoSuchBeanDefinitionException` con tu auto-configuración | No está registrada en `META-INF/spring/…AutoConfiguration.imports`. | Crea ese archivo con el nombre completo de la clase. | Módulo 1 · Auto-configuración |
| Pedidos se cuelga cuando inventario va lento | Llamada síncrona sin timeout: hilos bloqueados. | Timeouts + Resilience4j. | Módulo 6 · REST síncrono / Módulo 8 |
| Todo 404 a través del gateway | Falta `StripPrefix` en la ruta. | Añade el filtro con el número de segmentos correcto. | Módulo 7 · API Gateway |
| `403` con un token válido | Roles de Keycloak no convertidos a autoridades, o `hasRole` frente a `hasAuthority`. | Mapea los roles; usa `hasAuthority('SCOPE_…')`. | Módulo 9 · Keycloak / RBAC y Scopes |
| Objetivo `DOWN` en Prometheus | Prometheus (en Docker) no alcanza tu app. | Prueba desde el contenedor (`docker compose exec prometheus wget -qO- host.docker.internal:8080/actuator/prometheus`); si responde, revisa `prometheus.yml`. | Módulo 10 · Micrometer + Prometheus |
| Rebalanceos y mensajes repetidos en Kafka | El procesamiento por lote supera `max.poll.interval.ms`. | Baja `max-poll-records` o sube `max.poll.interval.ms`; consumidor idempotente. | Módulo 11 · Kafka profundo |
| `ErrImagePull` en kind | La imagen está en tu Docker, no en el nodo. | `kind load docker-image …`. | Módulo 12 · Kubernetes |
| `CrashLoopBackOff` sin excepciones | La liveness mata al contenedor antes de que arranque. | Añade una startup probe. | Módulo 12 · Readiness/Liveness Probes |
| HPA con `<unknown>` en `TARGETS` | No hay metrics-server o el contenedor no declara requests. | Instala metrics-server; declara `resources.requests`. | Módulo 12 · HPA |

## Fase 2 · Node.js

### Conceptos clave

| Concepto | En una línea | Ficha |
|---|---|---|
| Promesas y `await` | Una promesa está pendiente, cumplida o rechazada; sin `await` imprimes `Promise { <pending> }`. | Módulo 13 · ES6+ |
| TypeScript `strict` | `tsc` encuentra antes de ejecutar los `undefined` que devuelven `find`, `Map.get` o un índice. | Módulo 13 · TypeScript |
| Event Loop | Un solo hilo que no espera sentado; un cálculo largo bloquea a todos los clientes. | Módulo 13 · Event Loop |
| Medir antes de optimizar | `perf_hooks` (`performance.now()`, retraso del event loop), `node --cpu-prof`, clinic.js. | Módulo 13 · perf_hooks y clinic.js |
| Workers y backpressure | Worker Thread para CPU; respeta `write()` → `false` y `'drain'` (o usa `pipeline`). | Módulo 13 · Worker Threads / Backpressure |
| Graceful shutdown | Ante `SIGTERM`, deja de aceptar, termina lo que está en curso y sale antes del `SIGKILL`. | Módulo 13 · Graceful shutdown |
| Express | Rutas + middleware en orden; el manejador de errores tiene cuatro parámetros `(err, req, res, next)`. | Módulo 14 · Express |
| NestJS | Módulos, controllers, providers (servicios inyectados), guards (¿puede pasar?) e interceptors (antes y después). | Módulo 14 · NestJS |
| Validación y DTOs | No confíes en nada de fuera: Zod o class-validator → 400, nunca 500; `whitelist` descarta campos de más. | Módulo 14 · Validación / DTOs |
| OpenAPI | NestJS genera el documento desde el código (`/docs-json`, `/docs`). | Módulo 14 · OpenAPI/Swagger |
| MongoDB + Mongoose | Documentos tipo JSON en colecciones; sin conexión, Mongoose encola la consulta (*buffering*, 10 000 ms por defecto) antes de fallar. | Módulo 15 · MongoDB + Mongoose |
| Problema N+1 | Una consulta para la lista y otra por elemento: usa `include`/JOIN. | Módulo 15 · PostgreSQL + Prisma/Sequelize |
| Pool y transacciones | Las conexiones se piden prestadas y **se devuelven** (`release` en `finally`); la transacción es todo o nada. | Módulo 15 · Connection pooling y transacciones |
| Jest y Supertest | `expect(…).toBe(…)`; `await` en lo asíncrono; Supertest prueba la app sin abrir puerto. | Módulo 16 · Jest / Supertest |
| Pact y Testcontainers | El consumidor escribe el contrato y el proveedor lo verifica; Testcontainers da un PostgreSQL real por test. | Módulo 16 · Contract Testing / Testcontainers |
| Estructura y configuración | Capas por módulo (dominio sin infraestructura); `.env` nunca en Git; Consul para descubrir y para configuración central (con valor por defecto si cae). | Módulo 17 |
| Clientes HTTP | `fetch` **no lanza** con 404 o 503: comprueba `res.ok`; ponle `AbortSignal.timeout`. | Módulo 18 · REST con Axios/Fetch / Módulo 19 · Timeouts |
| gRPC, GraphQL, mensajería | gRPC con deadline; GraphQL devuelve errores con HTTP 200 en `errors`; RabbitMQ (colas) y Kafka (log por grupos); NATS core no guarda. | Módulo 18 |
| Resiliencia en Node | Circuit breaker (opossum/cockatiel) que no cuente los 404 de negocio; retry con backoff y jitter solo en lo idempotente; rate limit atómico en Redis con 429; fallback que avisa. | Módulo 19 |
| Seguridad | JWT firmado ≠ cifrado; Passport con `session: false`; CORS no es control de acceso; operadores `$` anidados en NoSQL; OWASP Top 10 2025 (A01 Broken Access Control); secretos en un gestor y releídos al rotar. | Módulo 20 |
| Observabilidad | OpenTelemetry con `--import`; `traceparent` también en cabeceras de mensajes; Pino/Winston en JSON; Loki sin ids como etiqueta; prom-client sin `req.url` como etiqueta. | Módulo 21 |
| Mensajería y datos | Publisher confirms + ack manual; dedup con `SET NX EX`; sagas con NestJS CQRS; compensaciones idempotentes; event sourcing con versión esperada; proyecciones con checkpoint en la misma transacción; CQRS con consistencia eventual. | Módulo 22 |
| Despliegue | Multi-stage sin `devDependencies` en la imagen final; selector del Service = etiquetas del pod; HPA con requests; GitHub Actions; canary pegajoso por usuario; Argo CD sin pelear con el HPA por `replicas`. | Módulo 23 |

### Comandos

```bash
# Node esencial — Módulo 13 (examples/microservicios/modulo-17)
npm ci
npx tsc -p f090-typescript && echo "tipos OK"
node --cpu-prof --cpu-prof-dir=perfiles f092-perf/servidor-lento.js
NO_INSIGHT=1 npx -y clinic@13.0.0 doctor --no-open -- node f092-perf/servidor-lento.js
kill -TERM $PID; wait $PID; echo "servidor salió con $?"        # prueba de apagado limpio

# APIs — Módulo 14 (modulo-18)
npm run build && node dist/f097-nestjs/src/main.js
curl -s localhost:3100/docs-json | jq -c '{openapi, paths: (.paths | keys)}'

# Persistencia — Módulo 15 (modulo-19)
docker compose up -d --wait
docker compose exec mongo mongosh tienda --quiet --eval "db.productos.find().toArray()"
npm run generate                                              # cliente de Prisma
docker compose exec postgres psql -U tienda -d f104 -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'f104'"

# Tests — Módulo 16 (modulo-20)
npx jest f105-jest --selectProjects unit --verbose
npm run test:pact:consumidor && npm run test:pact:proveedor
npx pact broker can-i-deploy --pacticipant pedidos --version 1.0.0 \
  --pacticipant inventario --version 1.0.0 --broker-base-url http://localhost:9220
npm run test:contenedores                                     # Testcontainers

# Configuración y descubrimiento — Módulo 17 (modulo-21)
node --env-file=f110-dotenv/.env -e 'console.log(process.env.PORT)'
curl -s 'localhost:8500/v1/health/service/catalogo?passing=true' | jq -c '.[] | {id: .Service.ID, puerto: .Service.Port}'

# Comunicación — Módulo 18 (modulo-22)
docker compose exec rabbitmq rabbitmqctl -q list_queues name messages
GRUPO=analitica node f116-kafka-rabbit/kafka-consumidor.js     # otro grupo de consumidores
curl -s localhost:8222/healthz                                 # NATS

# Resiliencia — Módulo 19 (modulo-23)
./simular-fallo.sh caido > /dev/null; curl -s 127.0.0.1:3119/circuito
curl -s -i -H "x-api-key: demo" 127.0.0.1:3121/api/ofertas | grep -i -E "^HTTP|ratelimit|retry-after"
docker compose exec redis redis-cli --scan --pattern 'rl:*'

# Seguridad — Módulo 20 (modulo-24)
node -p "process.argv[1].split('.').slice(0, 2).map((p) => Buffer.from(p, 'base64url').toString()).join('\n')" "$TOKEN"   # leer un JWT
curl -s localhost:3224/.well-known/jwks.json | jq -c '.keys[0] | {kty, crv, kid, alg}'
JWT_SECRETO=$(openssl rand -hex 32) node f125-passport/despues.js
npm ci --no-audit && npm audit --omit=dev

# Observabilidad — Módulo 21 (modulo-25)
OTEL_SERVICE_NAME=pedidos node --import ./f130-opentelemetry/telemetria.js f130-opentelemetry/pedidos.js
curl -s -G localhost:3100/loki/api/v1/query_range --data-urlencode 'query={servicio="pedidos"} | json | level="error"'
curl -s localhost:9464/metrics | grep -E '^http_'

# Mensajería y datos — Módulo 22 (modulo-26)
docker compose exec redis redis-cli TTL dedup:facturacion:P-1
ALMACEN=memoria node f139-event-sourcing/demo.js

# Despliegue — Módulo 23 (modulo-27)
docker image inspect pedidos:1.0.0 --format '{{.Config.User}}'  # la imagen no corre como root
kind create cluster --name curso && kind load docker-image pedidos:1.0.0 --name curso
kubectl apply -f k8s/ && kubectl -n tienda get pods,svc,endpointslices -o wide
kubectl -n tienda get hpa pedidos -w
kubectl apply -n argocd -f f147-gitops-argocd/application.yaml
```

### Errores frecuentes

| Ves | Significa | Arreglo | Ficha |
|---|---|---|---|
| `Promise { <pending> }` o `undefined` | Falta `await`. | `await` dentro de una función `async`. | Módulo 13 · ES6+ |
| CPU al 100 % en un núcleo y health checks caídos | Event loop bloqueado por un cálculo síncrono. | Trocea el trabajo o usa un Worker Thread. | Módulo 13 · Event Loop |
| `Exit Code: 137` y 502 en cada despliegue | El proceso no atiende `SIGTERM`. | Graceful shutdown. | Módulo 13 · Graceful shutdown |
| La API responde HTML con la pila del error | El manejador de errores no tiene cuatro parámetros o está antes de las rutas. | Firma `(err, req, res, next)` (los cuatro) y regístralo al final. | Módulo 14 · Express |
| 500 con `ZodError` | Se usó `parse` sin convertir el error en 400. | `safeParse` + 400, o traduce `ZodError` a 400 en el manejador de errores. | Módulo 14 · Validación |
| `buffering timed out after …ms` | Nadie llamó (o no se esperó) a `mongoose.connect()`: la consulta quedó en cola. | `await mongoose.connect(…)` antes de atender peticiones. | Módulo 15 · MongoDB + Mongoose |
| Todo se cuelga tras un rato | Fuga del pool: conexiones sin `release`. | `try/finally { client.release() }`. | Módulo 15 · Connection pooling |
| Un test asíncrono «pasa» siendo falso | Falta `await` o `return` en la aserción. | `await expect(…).resolves/rejects`. | Módulo 16 · Jest |
| `ECONNREFUSED 127.0.0.1:8500` | Consul no estaba listo o el servicio corre dentro de un contenedor. | `docker compose up -d --wait`; dentro de Compose, `CONSUL_HTTP_ADDR=consul:8500`; reintenta con espera creciente. | Módulo 17 · Service Discovery con Consul |
| Datos inventados tras un 404 | `fetch` no lanza en 4xx/5xx. | Comprueba `res.ok`. | Módulo 18 · REST con Axios/Fetch |
| `406 PRECONDITION_FAILED` | La cola o el exchange ya existe con otros atributos. | Declara la topología igual en todos los servicios. | Módulo 18 · KafkaJS, amqplib |
| 429 para siempre | `INCR` y `EXPIRE` en dos comandos: clave sin TTL. | Incremento y caducidad en un único script Lua (o `RateLimiterRedis`, que ya es atómico). | Módulo 19 · Rate Limiting con Redis |
| Reservas duplicadas tras timeouts | Se reintentó un `POST` no idempotente. | Clave de idempotencia; reintenta solo lo idempotente. | Módulo 19 · Retry con jitter |
| `Login sessions require session support` | Passport intenta usar sesiones en una API. | `{ session: false }`. | Módulo 20 · Passport.js |
| Jaeger vacío sin errores | Constructor del SDK 2.x usado con el 3.x. | `new SimpleSpanProcessor({ exporter })`; carga el SDK con `--import` y define `OTEL_SERVICE_NAME`. | Módulo 21 · OpenTelemetry para Node |
| El consumidor se queda quieto con la cola llena | Falta el `ack` con `prefetch`. | `ack` (o `nack`) en cada mensaje. | Módulo 22 · RabbitMQ |
| Contenedor en `Restarting` | Librería de ejecución en `devDependencies`. | Muévela a `dependencies`. | Módulo 23 · Dockerfile multi-stage |
| Service sin pods (`curl` colgado) | El selector no coincide con las etiquetas. | Compara selector y etiquetas; mira los EndpointSlices. | Módulo 23 · Kubernetes |

## Fase 3 · Nivel maestro

### Conceptos clave

| Concepto | En una línea | Ficha |
|---|---|---|
| ADR | Contexto, opciones consideradas, decisión, consecuencias y estado (Propuesto, Aceptado, Reemplazado…); nunca una sola línea. Plantilla en [07-plantillas.md](07-plantillas.md). | Módulo 24 · ADRs |
| Modelo C4 | Niveles de zoom: contexto → contenedores → componentes (solo donde haga falta) → código; cada caja dice qué es y cada flecha lleva texto. | Módulo 24 · Modelo C4 |
| ATAM ligero | Escenarios **con medida** («2000 pedidos/min → confirmación en menos de 0,8 s»), priorizados y comprobados contra el diseño. | Módulo 24 · ATAM ligero |
| Fitness function | Comprobación automática de una decisión de arquitectura; en producción, con p99 y no con la media. | Módulo 24 · Fitness functions en producción |
| Outbox + CDC | Guardar el dato y el evento en la **misma transacción**; Debezium lee el WAL y publica. Evita el *dual write*. | Módulo 25 · Outbox Pattern + CDC con Debezium |
| Saga orquestada (Temporal) | Workflow determinista (sin E/S) que llama a activities; el servidor guarda el historial y el replay lo retoma tras una caída. | Módulo 25 · Sagas orquestadas con Temporal.io |
| Idempotencia en consumidores | Clave = id único del evento (no `partición:offset`), anotada en la misma transacción que el efecto. | Módulo 25 · Idempotencia real en consumidores Kafka |
| Exactly-once en la práctica | El mensaje puede viajar varias veces; el **resultado** cuenta una vez. Efectos externos (correos) quedan fuera. | Módulo 25 · Exactly-once semantics en la práctica |
| 2PC | Bloquea entre «preparar» y «confirmar»; una transacción preparada sobrevive a la conexión (`pg_prepared_xacts`). | Módulo 25 · Two-Phase Commit: por qué no usar |
| Kafka transaccional | Varios topics «todo o nada»; *fencing* por epoch del `transactionalId`; lectores `read_committed`. | Módulo 26 · Kafka profundo |
| Schema Registry | Formato de cable: byte 0, id de esquema (4 bytes) y Avro; campos nuevos con valor por defecto. | Módulo 26 · Kafka profundo |
| RabbitMQ avanzado | Cola quorum; `x-delivery-limit` (20 por defecto desde 4.0) + DLX; reintento escalonado con colas de espera (TTL + DLX). | Módulo 26 · RabbitMQ avanzado |
| NATS JetStream | Guarda mensajes; deduplica con `msgID`; colas de trabajo. | Módulo 26 · NATS |
| Event Notification vs ECST | Aviso corto (hay que preguntar al dueño) frente a aviso completo (copia local, con versión para ordenar). | Módulo 26 · Event Notification vs Event-Carried State Transfer |
| mTLS | Los dos lados presentan certificado; identidad ≠ permiso: hace falta además una política de autorización. El SAN debe llevar el nombre. | Módulo 27 · mTLS con Istio/Linkerd |
| Token Exchange | Cambiar el token del usuario por uno para **un** destino, con menos permisos y poca vida (`aud` del destino). | Módulo 27 · Token Exchange (RFC 8693) |
| Vault dinámico | Credenciales por copia con lease (p. ej. 1 h) renovado a los 2/3; al revocar, dejan de servir. | Módulo 27 · Vault |
| Service mesh | Un proxy por servicio cifra y aplica reglas sin tocar el código; en Istio ambient, ztunnel hace L4 y el waypoint L7. | Módulo 27 · Service Mesh |
| Modelo de costo cloud | Cómputo + red + observabilidad: presupuestar solo el cómputo se queda corto. | Módulo 28 · Modelo de costo cloud |
| Right-sizing | Requests de CPU = p95 con margen (comprimible); memoria = máximo con margen (no comprimible: OOMKilled, 137). | Módulo 28 · Right-sizing |
| Break-even | `N = costoFijoFargate / costoLambdaPorPetición`; con 120 ms y 512 MB, ≈ 30 millones de peticiones/mes. Se paga el tiempo de **reloj**. | Módulo 28 · Break-even Serverless vs Contenedores |
| Observability tax | Costo de observar / costo de ejecutar. Logs: 0.50 USD/GB de ingesta en CloudWatch; un histograma con 10 límites = 13 series por combinación de etiquetas. | Módulo 28 · Observability tax |
| Ley de Conway | El software copia la estructura de comunicación de quien lo hace; la maniobra inversa diseña los equipos para obtener la arquitectura. | Módulo 29 · Ley de Conway |
| Tipos de equipo | Stream-aligned, Enabling, Complicated-subsystem, Platform; modos: Colaboración (con fecha de fin), X-as-a-Service, Facilitación. | Módulo 29 · Stream-aligned, Platform, Enabling teams |
| Carga cognitiva | Intrínseca, extrínseca y germana; no se mide por número de servicios. | Módulo 29 · Carga cognitiva |
| Tamaño de equipo | Canales = n·(n−1)/2 (7 personas → 21; 12 → 66); equipos de 5 a 9 personas. | Módulo 29 · Dimensionamiento de equipos |
| Monolito distribuido | Despliegues coordinados, caídas en cadena, base compartida o DTO compartido: lo malo de los dos mundos. | Módulo 30 · Monolito distribuido |
| Sobre-descomposición | Un servicio por entidad cuando forman un solo agregado: si cambian juntos, son uno. | Módulo 30 · Sobre-descomposición |
| Sagas innecesarias | Si los datos están en la misma base y el mismo servicio, una transacción basta. | Módulo 30 · Sagas innecesarias |
| Fitness functions de acoplamiento | Tests que fallan si un servicio toca lo de otro; deben detectar también `import()` y `require()`. | Módulo 30 · Fitness functions |

### Comandos

```bash
# Gobernanza — Módulo 24 (examples/microservicios/modulo-28)
node f148-adrs/adr.js f148-adrs/docs/adr lint
node f148-adrs/adr.js /tmp/adr-demo nuevo "Usamos PostgreSQL para pedidos"
node f148-adrs/adr.js /tmp/adr-demo aceptar 1
node f148-adrs/adr.js /tmp/adr-demo reemplazar 1 "Usamos PostgreSQL con réplicas de lectura"
node f149-c4/c4.js f149-c4/modelo.json validar
node f150-atam/atam.js f150-atam/atam.json
node f151-fitness/fitness.js --prometheus http://127.0.0.1:19090 --job pedidos-v1; echo "código: $?"

# Consistencia distribuida — Módulo 25 (modulo-29)
curl -s -X POST -H 'Content-Type: application/json' \
  --data @f152-outbox/debezium/conector-outbox.json http://localhost:8083/connectors   # conector de Debezium
docker compose exec kafka /opt/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 \
  --topic outbox.event.pedido --from-beginning --property print.key=true --property print.headers=true --max-messages 2
temporal server start-dev                              # servidor + UI en http://localhost:8233
node f153-temporal/worker.js
node f153-temporal/iniciar.js P-2 rechazada "Calle 1"  # rechazo no reintentable → compensa
docker compose exec postgres psql -U academia -c "SELECT gid, prepared, owner FROM pg_prepared_xacts"

# Mensajería avanzada — Módulo 26 (modulo-30)
docker compose up -d --wait kafka schema-registry
node f157-kafka-schema/transacciones.js
curl -s http://localhost:8081/subjects
docker compose exec rabbitmq rabbitmqctl -q list_queues name type messages
curl -s http://localhost:8222/jsz                       # estado de JetStream

# Zero-Trust — Módulo 27 (modulo-31)
openssl x509 -in pki/certs/pedidos.crt -noout -subject -text | grep -E 'subject=|Not After|URI:'
istioctl install --set profile=ambient --skip-confirmation
kubectl label namespace tienda istio.io/dataplane-mode=ambient
istioctl waypoint apply -n tienda --enroll-namespace   # L7 en ambient
docker compose exec vault vault lease revoke -prefix database/creds/pedidos   # con VAULT_TOKEN y VAULT_ADDR

# FinOps — Módulo 28 (modulo-32)
node f165-modelo-costo/modelo.js f165-modelo-costo/microservicios.json
node f166-right-sizing/rightsizing.js
node f167-break-even/breakeven.js
node f168-observability-tax/observabilidad.js

# Organización — Módulo 29 (modulo-33)
node f169-conway/demo.js
node f170-topologias/demo.js
node f171-carga-cognitiva/demo.js
node f172-dimensionamiento/demo.js

# Anti-patrones — Módulo 30 (modulo-34)
node f173-monolito-distribuido/demo.js
node f174-sobre-descomposicion/demo.js
node f176-fitness-functions/demo.js; echo "código de salida: $?"
```

### Errores frecuentes

| Ves | Significa | Arreglo | Ficha |
|---|---|---|---|
| El ADR no responde «¿por qué?» | Se escribió como registro de una línea, después de implementar. | Contexto, alternativas y consecuencias antes de decidir. | Módulo 24 · ADRs |
| Fitness de latencia en verde con usuarios quejándose | Usa la media (`_sum / _count`). | Mide el p99 con el histograma. | Módulo 24 · Fitness functions en producción |
| Pedidos que nadie recibió | *Dual write*: guardar y publicar por separado. | Outbox en la misma transacción. | Módulo 25 · Outbox Pattern |
| El worker de Temporal no arranca (error de webpack) | El workflow importa E/S (`node:fs`, `pg`, HTTP). | Mueve la E/S a activities. | Módulo 25 · Sagas orquestadas con Temporal.io |
| Puntos dobles a pesar de «deduplicar» | La clave era `partición:offset`; un reintento del productor crea otro offset. | Deduplica por id del evento. | Módulo 25 · Idempotencia real |
| Filas bloqueadas horas después de un error | Transacción preparada huérfana: `ROLLBACK` normal no la toca. | `COMMIT PREPARED` o `ROLLBACK PREPARED` según el coordinador; alerta sobre `pg_prepared_xacts`. | Módulo 25 · Two-Phase Commit |
| Consumidores nuevos fallan con mensajes viejos | Campo nuevo sin valor por defecto o compatibilidad `NONE`. | Default en el esquema; compatibilidad en el registry. | Módulo 26 · Kafka profundo |
| Un mensaje repetido miles de veces por minuto | Mensaje venenoso reencolado sin límite. | `x-delivery-limit` + cola de mensajes muertos. | Módulo 26 · RabbitMQ avanzado |
| Duplicados en el stream tras timeouts | `js.publish` sin `msgID`. | Pon `msgID` en cada publicación. | Módulo 26 · NATS |
| Réplica ECST con un precio viejo | Eventos aplicados en orden de llegada, sin versión. | Compara versiones antes de aplicar. | Módulo 26 · Event Notification vs ECST |
| `ERR_TLS_CERT_ALTNAME_INVALID` | El SAN del certificado no lleva el nombre usado. | Emite el certificado con el nombre o URI correctos. | Módulo 27 · mTLS con Istio/Linkerd |
| `password authentication failed for user "v-pedidos-…"` a la hora | Nadie renueva el lease de Vault. | Renueva a los 2/3 o pide credenciales nuevas. | Módulo 27 · Vault |
| `OOMKilled` (137) tras «optimizar costos» | Memoria dimensionada con la media o el p50. | Máximo observado con margen. | Módulo 28 · Right-sizing |
| Factura de Lambda ×3 | Se estimó con tiempo de CPU; se paga el de reloj. | Duración medida de extremo a extremo; timeouts cortos. | Módulo 28 · Break-even |
| Prometheus sin memoria tras «una etiqueta más» | Etiqueta con ids sin límite (cardinalidad). | Ids en logs o trazas, no en etiquetas. | Módulo 28 · Observability tax |
| Sumar 5 personas y entregar menos | De 21 a 66 canales de comunicación. | Equipos pequeños con interfaces explícitas. | Módulo 29 · Dimensionamiento de equipos |
| Total vacío tras desplegar un solo servicio | DTO compartido cambió (`precio` → `valor`). | Contratos versionados; no compartas DTOs. | Módulo 30 · Monolito distribuido |

### Módulos 31–32

**Pendiente.** El Módulo 31 (Migración desde monolito real, `modulo-35.md`) y el Módulo 32 (Proyecto Final y
Comité de Arquitectura, `modulo-36.md`) aún no tienen fichas escritas; sus filas se añaden aquí cuando
`python3 scripts/validate_fichas.py --resumen` los marque con ✔. Mientras tanto, para el Proyecto Final usa la
plantilla de ADR y la rúbrica del Comité de [07-plantillas.md](07-plantillas.md).
