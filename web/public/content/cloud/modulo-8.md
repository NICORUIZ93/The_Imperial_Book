# Módulo 8: Azure y GCP con Floci


## Aprende construyendo

### Tema 1: floci-az — Blob Storage, Queue Storage, Table Storage, Cosmos DB, Functions

#### Paso 1 · Objetivo y preparación
Al finalizar vas a portar la foto de prueba de entrega del bucket `pruebas-entrega` (Módulo 2, S3) a un contenedor Blob Storage, para comparar el mismo caso real en otro proveedor. Prerrequisitos: Módulo 2, floci-az corriendo (Módulo 0).
#### Paso 2 · Contexto y caso real
Si RutaFlow tuviera que migrar a Azure, la foto que el conductor sube al cerrar un envío (Módulo 2) necesitaría vivir en Blob Storage en vez de S3 — mismo problema, otro proveedor.
#### Paso 3 · Teoría, modelo mental y analogía
Blob Storage es la misma herramienta que S3 con otro nombre: contenedor en vez de bucket, blob en vez de objeto.
#### Paso 4 · Demostración guiada
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir el archivo del ejemplo dentro.
```bash
mkdir ejemplo && cd ejemplo && floci start
```

```bash
az storage container create --name pruebas-entrega --connection-string "$AZURE_CONN_LOCAL"
az storage blob upload --container-name pruebas-entrega --file entrega-001.jpg --name envio-4471/entrega-001.jpg --connection-string "$AZURE_CONN_LOCAL"
az storage blob download --container-name pruebas-entrega --name envio-4471/entrega-001.jpg --file descargada-azure.jpg --connection-string "$AZURE_CONN_LOCAL"
diff entrega-001.jpg descargada-azure.jpg
```

**Ejecuta el ejemplo** (con Floci corriendo en local, ejecuta el comando contra el emulador):

```bash
floci up
aws --endpoint-url http://localhost:4566 sts get-caller-identity
```
Confirma la respuesta del servicio emulado.

Resultado esperado: `diff` no muestra ninguna diferencia — el mismo archivo que subiste a S3 en el Módulo 2 ahora hace el mismo ciclo completo (subir, descargar, verificar) en Blob Storage.
#### Paso 5 · Práctica guiada
Pista: reintentá el `upload` apuntando la cadena de conexión al puerto de Queue Storage (10001) en vez del puerto de Blob (10000) — ese es el fallo deliberado: la conexión falla o el servicio rechaza la operación, porque Queue Storage no entiende peticiones de blobs aunque esté en la misma cuenta de almacenamiento.
#### Paso 6 · Práctica independiente
Relacioná cada pieza de RutaFlow con su servicio Azure correcto: la foto de entrega (Blob Storage), el mensaje "confirmar entrega" (Queue Storage), el historial de eventos del envío (Cosmos DB) — y justificá por qué ninguno de los tres es intercambiable con otro.
#### Paso 7 · Cierre y evidencia
Entregá el ciclo completo de subida/descarga en Blob Storage, el error de puerto equivocado del Paso 5 y la relación de los tres servicios del Paso 6; explicá qué cambia y qué no cambia al portar `pruebas-entrega` de S3 a Blob Storage. Siguiente paso: GCP. Errores comunes: asumir nombres idénticos entre nubes. Fuente oficial: https://learn.microsoft.com/azure/.
**Conceptos clave:** cuenta de almacenamiento, contenedor Blob, Queue Storage, Table Storage, Cosmos DB, Azure Functions.

Azure organiza sus servicios de almacenamiento bajo el paraguas de una "cuenta de almacenamiento" (storage account), un contenedor de nivel superior que agrupa varios tipos de almacenamiento relacionados pero distintos: Blob Storage para objetos binarios (el equivalente directo a S3), Queue Storage para colas de mensajes simples (el equivalente más cercano a SQS Standard, aunque con menos funcionalidades avanzadas como las DLQ nativas que viste en el Módulo 3), y Table Storage para datos NoSQL simples de clave-valor con un modelo más limitado que Cosmos DB.

Blob Storage organiza sus datos en contenedores (containers), el equivalente conceptual a un bucket de S3, y dentro de cada contenedor los archivos se llaman blobs, el equivalente a un objeto de S3. La lógica de nomenclatura plana que viste en el Módulo 2 —sin carpetas reales, solo claves que simulan una jerarquía visualmente— aplica de la misma forma en Blob Storage. Existen tres tipos de blob (block blob para archivos generales, append blob para escritura incremental tipo log, y page blob para acceso aleatorio de lectura/escritura, usado típicamente por discos de máquinas virtuales), aunque para el propósito de este módulo trabajarás únicamente con block blobs, el tipo más común y el análogo directo a un objeto S3 estándar.

Cosmos DB es el servicio de base de datos NoSQL insignia de Azure, y es notablemente más versátil que DynamoDB en un aspecto concreto: soporta múltiples modelos de API sobre el mismo motor subyacente, incluyendo una API de documentos (similar en espíritu a MongoDB), una API de clave-valor (similar a DynamoDB), y una API de grafos, entre otras. Para mantener el paralelismo más directo con lo que aprendiste en el Módulo 4, este módulo trabaja con Cosmos DB usando su modelo de datos más cercano al de DynamoDB: contenedores con items identificados por una clave de partición.

Azure Functions es el servicio serverless equivalente a Lambda: funciones que se ejecutan en respuesta a eventos (un archivo subido a Blob Storage, un mensaje en Queue Storage, una petición HTTP) sin gestión manual de servidores, con un modelo de programación de handler y evento de entrada conceptualmente equivalente al que ya conoces de Lambda en el Módulo 5, aunque con diferencias de sintaxis y de configuración específicas de la plataforma Azure.

**Analogía:** si ya sabes usar S3, SQS, DynamoDB y Lambda, aprender Blob Storage, Queue Storage, Cosmos DB y Azure Functions es como aprender a conducir un coche de una marca distinta después de haber aprendido con otra: el volante, los pedales y las señales de tráfico (los conceptos: objeto, cola, base de datos NoSQL, función serverless) son los mismos; lo que cambia es la disposición exacta de algunos controles y el nombre que el fabricante le pone a cada pieza.

**¿Por qué es importante?** Practicar en Azure inmediatamente después de dominar los conceptos equivalentes en AWS es la forma más eficiente de confirmar que realmente entendiste los conceptos subyacentes (almacenamiento de objetos, colas, NoSQL, serverless) y no solo memorizaste comandos específicos de una CLI. Si te cuesta trabajo reconocer el mismo patrón en Azure, es una señal de que vale la pena repasar el concepto original en AWS antes de continuar.

**Diagrama:**

```
AWS                    Azure (floci-az)
┌──────────────┐      ┌──────────────────┐
│ S3             │ ──▶  │ Blob Storage        │
│ SQS            │ ──▶  │ Queue Storage       │
│ DynamoDB       │ ──▶  │ Cosmos DB           │
│ Lambda         │ ──▶  │ Azure Functions     │
└──────────────┘      └──────────────────┘
```

En el proyecto integrador RutaFlow, este mismo contenedor `pruebas-entrega` es la versión
Azure del bucket `PruebasEntrega` declarado en `examples/rutaflow/cloud/template.yaml`: migrar
ese recurso no conviene hacerlo "a ciegas" copiando el nombre — hay que decidir explícitamente
si Blob Storage necesita el mismo versionado y ciclo de vida que ya configuraste en S3 (Módulo
2), porque esa configuración no se porta sola entre proveedores.

### Tema 2: floci-gcp — Cloud Storage, Pub/Sub, Firestore, Cloud Functions

#### Paso 1 · Objetivo y preparación
Al finalizar vas a modelar el mismo "confirmar entrega" de `DeliveryCommands` (Módulo 3, SQS) como un topic Pub/Sub real en GCP. Prerrequisitos: Módulo 3, floci-gcp corriendo (Módulo 0).
#### Paso 2 · Contexto y caso real
Si RutaFlow corriera en GCP, el worker que confirma entregas no tendría una cola SQS: tendría un topic con una suscripción, un modelo de mensajería distinto, no solo un nombre distinto.
#### Paso 3 · Teoría, modelo mental y analogía
Un topic es un altavoz: cualquier suscripción sintonizada recibe su propia copia del mensaje, a diferencia de una cola SQS donde un mensaje se consume una sola vez.
#### Paso 4 · Demostración guiada
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir el archivo del ejemplo dentro.
```bash
mkdir ejemplo && cd ejemplo && floci start
```

```bash
gcloud pubsub topics create delivery-commands --project mi-proyecto-local
gcloud pubsub subscriptions create delivery-commands-sub --topic delivery-commands --project mi-proyecto-local
gcloud pubsub topics publish delivery-commands --message '{"shipmentId":"env-4471","recipientPin":"837201"}' --project mi-proyecto-local
gcloud pubsub subscriptions pull delivery-commands-sub --auto-ack --project mi-proyecto-local
```

**Ejecuta el ejemplo** (con Floci corriendo en local, ejecuta el comando contra el emulador):

```bash
floci up
aws --endpoint-url http://localhost:4566 sts get-caller-identity
```
Confirma la respuesta del servicio emulado.

Resultado esperado: el `pull` devuelve el mismo JSON que publicaste — el mismo comando "confirmar entrega" que en el Módulo 3 viajaba por `DeliveryCommands` (SQS), ahora viajando por un topic+suscripción de Pub/Sub.
#### Paso 5 · Práctica guiada
Pista: publicá un mensaje contra `delivery-commands-fallback` (un topic que nunca creaste) — ese es el fallo deliberado: `NOT_FOUND: Resource not found`, a diferencia de SQS donde al menos la URL de la cola identifica el recurso; en Pub/Sub el topic tiene que existir antes de poder publicar nada en él.
#### Paso 6 · Práctica independiente
Creá una segunda suscripción (`delivery-commands-sub-2`) sobre el mismo topic, publicá un mensaje nuevo, y confirmá que AMBAS suscripciones reciben su propia copia con `pull` — algo que SQS no haría con una sola cola y dos consumidores compitiendo por el mismo mensaje.
#### Paso 7 · Cierre y evidencia
Entregá la publicación y recepción exitosa, el error de topic inexistente del Paso 5, y la doble recepción del Paso 6; explicá por qué Pub/Sub no es un calco exacto de SQS aunque resuelva el mismo problema de negocio. Siguiente paso: comparación. Errores comunes: confundir documento con tabla y evento con cola. Fuente oficial: https://cloud.google.com/docs.
**Conceptos clave:** bucket de Cloud Storage, topic y suscripción de Pub/Sub, colección y documento de Firestore, Cloud Functions.

Google Cloud Storage es, de los tres equivalentes de almacenamiento de objetos que vas a ver en este módulo, el que más se parece conceptualmente a S3: organiza sus datos en buckets con nombre único, y dentro de cada bucket los archivos se identifican por una clave de objeto, siguiendo exactamente el mismo modelo plano sin carpetas reales que ya conoces. La terminología incluso coincide casi palabra por palabra con S3 en muchos comandos de su CLI (`gcloud storage`).

Pub/Sub es el servicio de mensajería de GCP, y su modelo es ligeramente distinto al de SQS: en vez de una cola de la que un consumidor extrae mensajes directamente, Pub/Sub se organiza alrededor de un topic (donde los productores publican mensajes) y una o varias suscripciones (subscriptions) sobre ese topic, cada una de las cuales recibe una copia independiente de cada mensaje publicado. Esto significa que Pub/Sub, de forma nativa, se parece más al patrón fan-out que vas a estudiar en detalle en un módulo avanzado con SNS y EventBridge, que a una cola SQS simple: un mismo mensaje publicado en un topic puede ser recibido por múltiples suscripciones independientes, cada una consumiéndolo a su propio ritmo, mientras que en SQS un mensaje es consumido una sola vez de la cola (a menos que uses el patrón SNS+SQS explícitamente para lograr ese mismo efecto de fan-out).

Firestore es la base de datos NoSQL de documentos de Google Cloud, organizada en colecciones (collections) que contienen documentos (documents), cada uno identificado por un ID único dentro de su colección. A diferencia de DynamoDB, donde defines explícitamente el esquema de la clave primaria al crear la tabla, Firestore no requiere definir de antemano ni siquiera esa estructura mínima: los documentos dentro de una colección pueden tener estructuras completamente distintas entre sí sin ninguna declaración previa, llevando la flexibilidad de esquema de NoSQL, que ya viste con DynamoDB, un paso más allá.

Cloud Functions completa el paralelo serverless: funciones que reaccionan a eventos de Cloud Storage, mensajes de Pub/Sub, o peticiones HTTP, con el mismo modelo conceptual de handler y evento de entrada que Lambda y Azure Functions, adaptado a las convenciones específicas de GCP.

**Analogía:** si Blob Storage de Azure es como aprender a conducir un coche de otra marca con los mismos controles, Pub/Sub de GCP introduce una variación real de comportamiento, no solo de nombre: es como pasar de un sistema de reparto de correo a un sistema de radiodifusión, donde un mismo mensaje transmitido llega simultáneamente a todos los receptores sintonizados (suscripciones), en vez de a un único destinatario que lo retira del buzón.

**¿Por qué es importante?** Notar que Pub/Sub no es un calco exacto de SQS —sino que se parece más a un patrón de fan-out nativo— es precisamente el tipo de matiz que separa una comparación superficial de nombres de una comprensión real de los patrones de mensajería en la nube. Vas a explorar este mismo patrón de fan-out con SNS y EventBridge en un módulo avanzado posterior a este track, y reconocerlo ya presente aquí, en Pub/Sub, refuerza esa idea de patrones que se repiten entre proveedores con implementaciones distintas.

**Diagrama:**

```
AWS                    GCP (floci-gcp)
┌──────────────┐      ┌──────────────────┐
│ S3             │ ──▶  │ Cloud Storage       │
│ SQS            │ ~~▶  │ Pub/Sub (más parecido│
│                │      │  a un patrón fan-out) │
│ DynamoDB       │ ──▶  │ Firestore           │
│ Lambda         │ ──▶  │ Cloud Functions     │
└──────────────┘      └──────────────────┘
```

En el proyecto integrador RutaFlow, este topic `delivery-commands` es el equivalente GCP de la
cola `DeliveryCommands` que `examples/rutaflow/cloud/template.yaml` declara con su propia
`DeliveryCommandsDLQ` — no conviene asumir que Pub/Sub resuelve mensajes envenenados igual: acá
necesitarías una suscripción separada con política de reintentos explícita, no una DLQ nativa
como la de SQS.

### Tema 3: Comparativa AWS vs Azure vs GCP por categoría de servicio

#### Paso 1 · Objetivo y preparación
Al finalizar vas a comprobar en vivo una diferencia real (no solo de nombre) entre SQS y Pub/Sub, usando el mismo comando de RutaFlow de los Temas 1-2. Prerrequisitos: Temas 1-2 de este módulo.
#### Paso 2 · Contexto y caso real
RutaFlow necesita que los eventos de un mismo envío se procesen en el orden en que ocurrieron (creado antes que entregado) — DynamoDB Streams y SQS FIFO (Módulo 3) dan esa garantía fácil; Pub/Sub no la da gratis.
#### Paso 3 · Teoría, modelo mental y analogía
La equivalencia funcional entre proveedores no implica la misma garantía de comportamiento: dos herramientas pueden resolver "lo mismo" con reglas distintas por debajo.
#### Paso 4 · Demostración guiada
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir el archivo del ejemplo dentro.
```bash
mkdir ejemplo && cd ejemplo && floci start
```

```bash
gcloud pubsub topics publish delivery-commands --message '{"shipmentId":"env-5002","sequence":1}' --ordering-key env-5002 --project mi-proyecto-local
```

**Ejecuta el ejemplo** (con Floci corriendo en local, ejecuta el comando contra el emulador):

```bash
floci up
aws --endpoint-url http://localhost:4566 sts get-caller-identity
```
Confirma la respuesta del servicio emulado.

Resultado esperado: ese es el fallo deliberado — `FAILED_PRECONDITION: The subscription delivery-commands-sub does not have message ordering enabled`, porque publicar con `--ordering-key` no alcanza: también hay que habilitar el ordenamiento en la suscripción.
#### Paso 5 · Práctica guiada
Pista: corregí el error del Paso 4 recreando la suscripción con `gcloud pubsub subscriptions create delivery-commands-sub --topic delivery-commands --enable-message-ordering --project mi-proyecto-local`, y repetí el `publish` con `--ordering-key` — ahora sí se acepta, porque tanto el productor como la suscripción acordaron explícitamente mantener el orden.
#### Paso 6 · Práctica independiente
Armá una tabla de tres columnas (AWS / Azure / GCP) solo para la fila "mensajería", anotando qué necesita cada uno para garantizar orden (SQS FIFO vs Pub/Sub con `--enable-message-ordering`), y decidí cuál requeriría menos cambios de configuración si RutaFlow migrara hoy.
#### Paso 7 · Cierre y evidencia
Entregá el error de ordenamiento no habilitado y su corrección, y la tabla comparativa del Paso 6; explicá por qué "SQS y Pub/Sub son equivalentes" es una simplificación que un caso real como este rompe. Siguiente paso: seguridad multi-cloud. Errores comunes: elegir por popularidad y omitir salida. Fuente oficial: https://cloud.google.com/architecture.
**Conceptos clave:** equivalencia funcional, diferencias de modelo, criterios de elección de proveedor.

Aunque los tres proveedores resuelven los mismos problemas fundamentales —almacenamiento de objetos, mensajería, bases de datos NoSQL, cómputo serverless—, las diferencias de modelo que viste en los dos temas anteriores importan a la hora de diseñar un sistema real. En almacenamiento de objetos, los tres (S3, Blob Storage, Cloud Storage) son suficientemente equivalentes en concepto y comportamiento como para que la elección dependa casi enteramente de en qué proveedor ya está el resto de tu infraestructura, más que de una diferencia funcional decisiva entre ellos.

En mensajería, la elección tiene más matices reales: SQS es la opción más simple para el patrón clásico de "una cola, un grupo de consumidores que compiten por los mensajes", con soporte nativo para DLQ y colas FIFO como viste en el Módulo 3. Pub/Sub de GCP, al estar diseñado nativamente alrededor de topics y múltiples suscripciones independientes, es una elección más directa cuando tu caso de uso ya es, desde el diseño, un patrón de fan-out (un evento que interesa a varios consumidores distintos de forma independiente). Queue Storage de Azure es funcionalmente más básico que ambos, careciendo de algunas de las funcionalidades avanzadas nativas que SQS sí ofrece, aunque Azure resuelve casos de uso más complejos de mensajería con un servicio adicional distinto (Service Bus), que no se cubre en este curso introductorio.

En bases de datos NoSQL, DynamoDB exige definir explícitamente el esquema de la clave primaria desde la creación de la tabla, mientras que Firestore no exige ninguna declaración de esquema previo incluso para su clave de documento, y Cosmos DB ofrece la flexibilidad adicional de soportar múltiples modelos de API sobre el mismo servicio subyacente, incluyendo un modelo de grafos que ni DynamoDB ni Firestore ofrecen de forma nativa. Elegir entre ellas depende de si necesitas esa flexibilidad de modelo (Cosmos DB), la máxima simplicidad de esquema (Firestore), o la integración más profunda con el resto del ecosistema AWS si ya trabajas ahí (DynamoDB).

En cómputo serverless, Lambda, Azure Functions y Cloud Functions son funcionalmente muy similares entre sí en su propuesta de valor central (ejecutar código sin gestionar servidores, pagar por invocación), y la elección entre ellos suele depender más de en qué proveedor viven ya los servicios con los que esa función necesita integrarse (el mismo almacenamiento, la misma base de datos, la misma mensajería) que de una diferencia funcional decisiva entre los tres servicios de cómputo en sí mismos.

**Analogía:** comparar estos tres proveedores es como comparar tres cadenas de supermercados distintas que venden, en esencia, los mismos productos básicos (pan, leche, verduras), pero cada una con su propia disposición de pasillos, sus propias marcas propias, y algunas especialidades exclusivas de cada cadena (una tiene mejor sección de productos importados, otra tiene mejor panadería propia). Para la compra básica del día a día, cualquiera de las tres sirve igual de bien; la elección real depende de qué necesitas específicamente y de cuál está más cerca de donde ya haces el resto de tus compras.

**¿Por qué es importante?** Ser capaz de razonar sobre estas diferencias de matiz —no solo memorizar qué servicio de un proveedor "equivale" a cuál de otro— es exactamente la habilidad que distingue a alguien que realmente entiende los patrones de la nube de alguien que solo conoce los comandos de un proveedor específico. Esta habilidad es la que te permite, en un trabajo real, adaptarte rápidamente si tu empleador usa un proveedor distinto al que aprendiste primero, o si un proyecto requiere trabajar con más de uno a la vez.

**Diagrama:**

```
Categoría          AWS              Azure               GCP
────────────────────────────────────────────────────────────────
Almacenamiento      S3               Blob Storage         Cloud Storage
                     (equivalencia funcional muy directa entre los tres)

Mensajería           SQS              Queue Storage        Pub/Sub
                     (cola simple)    (más básico)          (fan-out nativo,
                                                              distinto de SQS)

Base de datos        DynamoDB         Cosmos DB            Firestore
NoSQL                (esquema de      (multi-modelo,       (sin esquema de
                      clave explícito) más flexible)        clave, más simple)

Serverless           Lambda           Azure Functions      Cloud Functions
                     (muy similares entre los tres en propuesta de valor central)
```

**Tabla comparativa completa — servicio equivalente por categoría:**

| Categoría | AWS | Azure | GCP |
|---|---|---|---|
| Almacenamiento de objetos | S3 (puerto 4566) | Blob Storage (puerto 4577) | Cloud Storage (puerto 4588) |
| Colas de mensajes | SQS | Service Bus Queues (AMQP 5673) | Pub/Sub + Cloud Tasks |
| Base de datos NoSQL | DynamoDB | Cosmos DB | Firestore / Datastore |
| Secretos y credenciales | Secrets Manager + KMS | Key Vault (puerto 4577) | Secret Manager (puerto 4588) |
| Cómputo serverless | Lambda | Azure Functions (HTTP + Timer) | Cloud Functions / Cloud Run |
| API HTTP / REST | API Gateway v1 y v2 | API Management | Cloud Endpoints |
| Notificaciones push (fan-out) | SNS | Event Grid | Pub/Sub Topics |
| Bus de eventos de dominio | EventBridge | Event Hubs (AMQP 5672) | Eventarc |
| Streaming en tiempo real | Kinesis + MSK (Kafka real) | Event Hubs + Kafka | Pub/Sub + Managed Kafka |
| Observabilidad y logs | CloudWatch | Azure Monitor | Cloud Monitoring + Logging |
| Base de datos relacional | RDS (PostgreSQL real) | Azure SQL / PostgreSQL Flexible | Cloud SQL / AlloyDB |
| Contenedores gestionados | ECS / EKS (Docker real) | AKS / Container Apps | GKE Autopilot / Cloud Run |
| Infraestructura como código | CloudFormation | Bicep / ARM Templates | Deployment Manager / Terraform |
| Orquestación de flujos | Step Functions | Logic Apps / Durable Functions | Workflows |
| Autenticación de usuarios | Cognito (OAuth 2.0 real) | Entra ID B2C | Identity Platform |
| Consultas SQL analíticas | Athena (DuckDB local) | Synapse Serverless | BigQuery |
| ETL y catálogo de datos | Glue Catalog + Crawler | Data Factory | Dataflow / Data Catalog |
| IA generativa (LLMs) | Bedrock Runtime (stub local) | Azure OpenAI Service | Vertex AI / Gemini API |
| OCR / Extracción de documentos | Textract | Document Intelligence | Document AI |
| Registro de imágenes Docker | ECR | Container Registry | Artifact Registry |
| Caché en memoria | ElastiCache (Redis real) | Azure Cache for Redis | Memorystore |
| Configuración externalizada | SSM Parameter Store | App Configuration local | Runtime Configurator |
| Correo electrónico transaccional | SES | Communication Services | Gmail API (Workspace) |
| DNS gestionado | Route 53 | Azure DNS | Cloud DNS |

En el proyecto integrador RutaFlow, esta tabla es el mapa que usarías para decidir, fila por
fila, qué cambia realmente al portar `examples/rutaflow/cloud/template.yaml` de AWS a otro
proveedor: cuándo conviene migrar todo un servicio (almacenamiento, equivalencia casi directa) y
cuándo no conviene hacerlo sin rediseñar (mensajería, donde SQS FIFO y Pub/Sub con
`--enable-message-ordering` no son el mismo trade-off operativo).

---


## Laboratorio práctico

> Este laboratorio asume que ya ejecutaste `floci start` y `eval $(floci env)` (Módulo 1) en tu sesión de terminal, así que los comandos de `aws` no repiten `--endpoint-url`.

**Objetivo del laboratorio:** subir y descargar un archivo en Blob Storage (Azure) y en Cloud Storage (GCP), crear una cola en Azure y un topic con suscripción en GCP, y documentar el mismo caso de uso resuelto en los tres proveedores.

**Requisitos previos:** floci-az y floci-gcp corriendo (imágenes separadas de Floci, como viste en el Módulo 0), CLI de Azure (`az`) y de GCP (`gcloud`) instaladas y configuradas para apuntar a los endpoints locales de floci-az y floci-gcp respectivamente.

### Laboratorio 8.1 — Azure: Blob Storage y Queue Storage

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Levantar floci-az | `docker run -d -p 10000:10000 -p 10001:10001 -p 10002:10002 floci/floci-az:latest` | Expone los puertos estándar de emulación de almacenamiento Azure (Blob, Queue, Table) | El contenedor aparece corriendo con `docker ps` |
| 2 | Crear un contenedor Blob | `az storage container create --name mi-contenedor --connection-string "<cadena-de-conexion-local>"` | Crea el equivalente a un bucket de S3 dentro de Blob Storage | `{"created": true}` |
| 3 | Subir un blob | `az storage blob upload --container-name mi-contenedor --file hola.txt --name hola.txt --connection-string "<cadena-de-conexion-local>"` | Sube el mismo archivo `hola.txt` que usaste en el Módulo 2 con S3 | Confirmación de subida sin errores |
| 4 | Descargar el blob | `az storage blob download --container-name mi-contenedor --name hola.txt --file hola-descargado-azure.txt --connection-string "<cadena-de-conexion-local>"` | Confirma el ciclo completo de subida y descarga, igual que hiciste con S3 | El contenido descargado coincide con el original |
| 5 | Crear una cola Queue Storage | `az storage queue create --name mi-cola-azure --connection-string "<cadena-de-conexion-local>"` | Crea el equivalente más cercano a una cola SQS Standard | Confirmación de creación |

### Laboratorio 8.2 — GCP: Cloud Storage y Pub/Sub

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Levantar floci-gcp | `docker run -d -p 4443:4443 -p 8085:8085 -p 8080:8080 floci/floci-gcp:latest` | Expone los puertos estándar de emulación de Cloud Storage, Pub/Sub y Firestore | El contenedor aparece corriendo con `docker ps` |
| 2 | Crear un bucket | `gcloud storage buckets create gs://mi-bucket-gcp --project mi-proyecto-local` | Crea el equivalente directo a un bucket de S3 | Confirmación de creación del bucket |
| 3 | Subir un archivo | `gcloud storage cp hola.txt gs://mi-bucket-gcp/` | Sube el mismo archivo de prueba a Cloud Storage | Confirmación de la subida |
| 4 | Crear un topic Pub/Sub | `gcloud pubsub topics create mi-topic --project mi-proyecto-local` | Crea el canal de publicación al que se enviarán mensajes | Confirmación de creación del topic |
| 5 | Crear una suscripción sobre ese topic | `gcloud pubsub subscriptions create mi-suscripcion --topic mi-topic --project mi-proyecto-local` | Crea el punto de recepción independiente que va a recibir copia de cada mensaje publicado en el topic | Confirmación de creación de la suscripción |
| 6 | Publicar un mensaje | `gcloud pubsub topics publish mi-topic --message "Hola desde GCP" --project mi-proyecto-local` | Envía un mensaje al topic; cualquier suscripción activa recibirá una copia | Un JSON con el `messageIds` del mensaje publicado |
| 7 | Confirmar la recepción del mensaje | `gcloud pubsub subscriptions pull mi-suscripcion --auto-ack --project mi-proyecto-local` | Extrae el mensaje de la suscripción y lo confirma automáticamente (`--auto-ack`) | El texto `Hola desde GCP` aparece en la respuesta |

**Verificación:** el laboratorio se considera exitoso si tanto el archivo subido a Blob Storage como el subido a Cloud Storage se descargan correctamente con el contenido original intacto, y si el mensaje publicado en el topic de Pub/Sub se recibe correctamente en la suscripción creada.

**Errores comunes y soluciones**

- **`az` no reconoce la cadena de conexión local.** Verifica que la cadena de conexión apunta explícitamente a los puertos locales de floci-az (10000-10002), no a una cuenta de Azure real; una cadena de conexión de Azure real y una apuntando a un emulador local tienen un formato similar pero con el host y los puertos claramente distintos.
- **`gcloud` intenta autenticarse contra Google Cloud real en vez de contra floci-gcp.** Asegúrate de configurar la variable de entorno del emulador correspondiente a cada servicio (por ejemplo, `STORAGE_EMULATOR_HOST` para Cloud Storage, `PUBSUB_EMULATOR_HOST` para Pub/Sub) antes de ejecutar cualquier comando de `gcloud` contra floci-gcp.
- **La suscripción de Pub/Sub no recibe ningún mensaje.** Confirma que la suscripción se creó sobre el mismo topic exacto donde publicaste el mensaje, y recuerda que una suscripción creada después de publicar un mensaje no recibe retroactivamente mensajes publicados antes de su creación (a menos que el topic tenga retención de mensajes configurada, un detalle avanzado fuera del alcance de este módulo).
- **Confundir el orden de creación en Pub/Sub.** A diferencia de SQS, donde solo existe la cola, en Pub/Sub necesitas crear primero el topic y después, por separado, al menos una suscripción sobre ese topic antes de que cualquier mensaje publicado tenga a dónde llegar de forma recuperable.

---
