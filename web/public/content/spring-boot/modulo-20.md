# Módulo 20: Integraciones Spring — scheduling, eventos, correo y caché

## Aprende construyendo

Este módulo completa el mapa de integraciones de Spring identificado en las capturas. Cada capacidad se introduce con una prueba observable y un límite importante: el scheduler local no coordina instancias, los eventos en memoria no son durables, SMTP puede fallar y las cachés necesitan invalidación.

### Dos ejemplos: primero visible, luego real

- **Ejemplo sencillo:** un `@Scheduled` revisa pedidos vencidos en H2; un evento Spring actualiza una métrica; Caffeine cachea una tarifa y el test observa la invalidación.
- **Caso RutaFlow:** al confirmar un envío, la API debe guardar el estado aunque el broker, SMTP o Redis no respondan. Usa el outbox para el evento que debe sobrevivir reinicios, procesa la notificación fuera de la transacción y mide el resultado de caché entre instancias.

Este módulo demuestra el comportamiento dentro de una aplicación Spring. El módulo 21 desarrolla Kafka entre procesos; `@TransactionalEventListener` no sustituye al outbox y un evento local no es mensajería durable.

### Tema 1: Scheduling y tareas periódicas

#### Paso 1 · Objetivo y preparación

Al finalizar podrás ejecutar una tarea periódica con Spring y probar su operación sin esperar al reloj real. Genera una app Spring Boot con `web` y `actuator`, JDK 25+ y Maven.

#### Paso 2 · Contexto y caso real

Una operación nocturna detecta pedidos que llevan demasiado tiempo pendientes y los marca para revisión. **¿Por qué es importante?** Un trabajo periódico evita depender de una persona que lo ejecute a mano y crea un punto verificable para automatización operativa.

#### Paso 3 · Teoría y modelo mental

`@EnableScheduling` activa las tareas; `@Scheduled` admite `fixedRate`, `fixedDelay` o una expresión cron. `fixedRate` mide desde el inicio del disparo anterior; `fixedDelay`, desde que termina. Configura explícitamente zona horaria en cron. Por defecto, el scheduler es local al proceso: con tres réplicas, la tarea puede ejecutarse tres veces.

Un scheduler no es una cola durable ni una exclusión distribuida. Si un trabajo puede durar más que el intervalo, define concurrencia limitada, idempotencia y un mecanismo de coordinación o utiliza Spring Batch y su repositorio cuando el trabajo deba reanudarse.

#### Paso 4 · Demostración guiada

En `src/main/java/academia/pedidos/PedidosScheduler.java`:

```java
@Component
public class PedidosScheduler {
    private final RevisionPedidos revision;

    public PedidosScheduler(RevisionPedidos revision) {
        this.revision = revision;
    }

    @Scheduled(cron = "${app.revision.cron}", zone = "UTC")
    public void revisarPendientes() {
        revision.marcarVencidos();
    }
}
```

**Ejecuta el ejemplo** (genera el proyecto con Spring Initializr, pega el código y corre las pruebas):

```bash
curl -fsSL https://start.spring.io/starter.zip -d dependencies=web -d javaVersion=25 -o app.zip && unzip -o app.zip
./mvnw test
```
Equivalencias Maven/Gradle en el Módulo 1.


Activa scheduling con `@EnableScheduling` en una configuración. En `src/main/resources/application.yml` configura `app.revision.cron: "0 */5 * * * *"` para el laboratorio. Inyecta `Clock` o una interfaz de servicio para probar lógica de vencimiento determinísticamente. Ejecuta `./mvnw test`.

**Resultado esperado:** la prueba invoca el servicio y comprueba el criterio de vencimiento; no depende de que el test duerma cinco minutos. **Fallo deliberado:** levanta dos instancias con el mismo cron y un contador compartido; observa dos ejecuciones. Diagnostica que un `@Scheduled` no es un lock distribuido.

#### Paso 5 · Práctica guiada

Agrega una tarea que registre inicio, duración y resultado con Micrometer. Fuerza una excepción del servicio y verifica que el scheduler no la oculte silenciosamente ni deja de producir señales operacionales. Define qué hacer si una ejecución supera el siguiente intervalo.

#### Paso 6 · Práctica independiente

Programa una revisión de envíos pendientes para el proyecto integrador de RutaFlow. Ejecuta dos instancias en tests o contenedores y prueba que una clave idempotente evita procesar dos veces el mismo envío. Si el negocio exige exactamente una ejecución coordinada, compara un lock distribuido o un job registrado con Spring Batch.

#### Paso 7 · Cierre y evidencia

Entrega configuración cron, test sin esperas reales, medición y prueba con dos instancias. **Cuándo no usarlo:** no uses `@Scheduled` como cola de tareas con payload o como garantía de ejecución única en cluster. **Evidencia:** test de vencimiento, log/Métrica y comportamiento duplicado documentado.

### Tema 2: Eventos locales, eventos transaccionales y mensajería

#### Paso 1 · Objetivo y preparación

Al finalizar podrás elegir entre un evento Spring en memoria, una publicación después del commit y mensajería duradera mediante Kafka/outbox. Necesitas el servicio transaccional de los módulos anteriores.

#### Paso 2 · Contexto y caso real

Al crear un envío, una auditoría local debe reaccionar al cambio. **¿Por qué es importante?** Separar responsabilidades ayuda a mantener el servicio de negocio legible, pero un evento solo en memoria puede perderse si el proceso cae.

#### Paso 3 · Teoría y modelo mental

`ApplicationEventPublisher` desacopla componentes dentro de una misma aplicación y proceso; por sí solo no persiste ni distribuye el evento. `@TransactionalEventListener(phase = AFTER_COMMIT)` espera a que la transacción local termine antes de notificar. Aun así, el proceso puede caer entre el commit y la publicación.

Kafka u otro broker ofrece entrega entre procesos, con garantías que dependen de configuración y límites transaccionales. El patrón outbox escribe el evento en la misma transacción que el dato de negocio; un dispatcher lo publica después. El modelo mental: el evento local es una nota entre equipos de la misma oficina; el outbox es un registro en el libro de despacho que sobrevive al cierre.

#### Paso 4 · Demostración guiada

En `src/main/java/academia/envios/EnvioCreado.java` declara un evento inmutable; en el servicio transaccional:

```java
publisher.publishEvent(new EnvioCreado(envioId));
```

**Ejecuta el ejemplo** (genera el proyecto con Spring Initializr, pega el código y corre las pruebas):

```bash
curl -fsSL https://start.spring.io/starter.zip -d dependencies=web -d javaVersion=25 -o app.zip && unzip -o app.zip
./mvnw test
```
Equivalencias Maven/Gradle en el Módulo 1.


El listener en `src/main/java/academia/envios/AuditoriaEnvio.java`:

```java
@Component
public class AuditoriaEnvio {
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void alCrear(EnvioCreado evento) {
        registrarAuditoria(evento.envioId());
    }
}
```

Escribe un test `@SpringBootTest` que publique el evento dentro de una transacción confirmada y otro que fuerce rollback. Ejecuta `./mvnw test -Dtest=AuditoriaEnvioTest`.

**Resultado esperado:** el listener actúa después del commit y no actúa cuando la transacción revierte. **Fallo deliberado:** reemplaza la anotación por `@EventListener`, fuerza rollback y observa la auditoría que quedó aunque el envío no se persistió.

#### Paso 5 · Práctica guiada

Agrega una tabla outbox con `event_id` único, tipo, payload y `published_at`; escribe el evento dentro de la transacción de negocio. Implementa un dispatcher que publique de forma repetible e idempotente y marque el resultado solo al confirmar la publicación.

#### Paso 6 · Práctica independiente

Para el proyecto integrador de RutaFlow, decide cuáles eventos son locales (actualizar una métrica dentro del proceso) y cuáles deben sobrevivir un reinicio (notificar a Kafka, enviar correo). Implementa la persistencia del evento en el outbox dentro de la transacción que crea el envío, y luego sigue el laboratorio completo de Kafka del módulo 21 para publicar y consumirlo. Dibuja el límite de transacción y prueba la caída entre commit y dispatcher.

#### Paso 7 · Cierre y evidencia

Entrega pruebas de commit/rollback, tabla outbox y duplicado controlado. **Cuándo no usarlo:** no uses eventos locales para integración entre microservicios ni asumas que `AFTER_COMMIT` es durable. **Evidencia:** test que muestra los límites de entrega y test de reintento sin efecto duplicado.

### Tema 3: Correo con Spring Mail y entrega recuperable

#### Paso 1 · Objetivo y preparación

Al finalizar podrás crear un mensaje de correo desde un servicio, sustituir SMTP en tests y definir una política de reintento sin bloquear una transacción de negocio.

#### Paso 2 · Contexto y caso real

Después de asignar un conductor, el cliente recibe confirmación por correo. **¿Por qué es importante?** El proveedor SMTP es una dependencia externa: puede tardar, rechazar el mensaje o aceptar el correo aunque la respuesta se pierda.

#### Paso 3 · Teoría y modelo mental

`JavaMailSender` crea y envía mensajes; la configuración de host/puerto/credenciales debe venir de entorno o secret manager. El envío no es transaccional con la base de datos. No mantengas una transacción SQL abierta durante la llamada SMTP ni registres credenciales o contenido sensible en logs.

La operación de negocio debe confirmar independientemente del canal de notificación; un outbox permite reintentar con estado observable. La deduplicación requiere un identificador estable del evento, porque SMTP no ofrece una garantía general de entrega exactamente una vez.

#### Paso 4 · Demostración guiada

Genera el proyecto con `mail` y configura `spring.mail.host`, puerto y credenciales por variables externas. En `src/main/java/academia/notificaciones/CorreoPedido.java`:

```java
@Service
public class CorreoPedido {
    private final JavaMailSender sender;

    public CorreoPedido(JavaMailSender sender) { this.sender = sender; }

    public void enviarConfirmacion(String destinatario, String referencia) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(destinatario);
        message.setSubject("Pedido confirmado");
        message.setText("Referencia: " + referencia);
        sender.send(message);
    }
}
```

**Ejecuta el ejemplo** (genera el proyecto con Spring Initializr, pega el código y corre las pruebas):

```bash
curl -fsSL https://start.spring.io/starter.zip -d dependencies=web -d javaVersion=25 -o app.zip && unzip -o app.zip
./mvnw test
```
Equivalencias Maven/Gradle en el Módulo 1.


En un test, reemplaza `JavaMailSender` con un mock y captura `SimpleMailMessage`; valida destinatario y asunto sin enviar correo. Ejecuta `./mvnw test -Dtest=CorreoPedidoTest`.

**Resultado esperado:** el mock recibe un mensaje con los campos esperados y ningún SMTP externo se contacta. **Fallo deliberado:** usa credenciales SMTP literales y falla la configuración en CI; mueve el secreto a variables externas y falla explícitamente si falta en el perfil de producción.

#### Paso 5 · Práctica guiada

Simula timeout SMTP y registra el intento fallido en outbox con siguiente fecha de reintento y número de intentos. Asegura que una segunda ejecución del dispatcher no envía dos notificaciones con el mismo `event_id` cuando el proveedor admite clave de idempotencia; documenta el riesgo residual cuando no la admite.

#### Paso 6 · Práctica independiente

Añade una plantilla de correo de confirmación para el proyecto integrador de RutaFlow. Prueba caracteres acentuados, destinatario inválido, fallo SMTP y redacción de logs. Separa contenido de correo del método que confirma el pedido.

#### Paso 7 · Cierre y evidencia

Entrega implementación, test del mock y flujo de outbox/retry. **Cuándo no usarlo:** no envíes correo síncrono en la transacción HTTP crítica ni guardes contraseña en `application.yml` versionado. **Evidencia:** prueba de mensaje, prueba de fallo y configuración sin secretos.

### Tema 4: Caché con Spring Cache, Caffeine y Redis

#### Paso 1 · Objetivo y preparación

Al finalizar podrás cachear una lectura con Caffeine, invalidarla después de una escritura y explicar cuándo hace falta Redis. Genera una app con `cache`; agrega Caffeine para el laboratorio.

#### Paso 2 · Contexto y caso real

La lista de tarifas cambia poco y se consulta miles de veces por minuto. **¿Por qué es importante?** Una caché puede reducir latencia y carga de base de datos, pero introduce copias que pueden quedar obsoletas.

#### Paso 3 · Teoría y modelo mental

`@EnableCaching` activa la abstracción; `@Cacheable` reutiliza una respuesta por clave; `@CacheEvict` invalida entradas; `@CachePut` actualiza una entrada explícitamente. El proveedor define almacenamiento y expiración. Caffeine vive dentro de cada proceso; Redis comparte datos entre réplicas, a costa de una dependencia de red y operación.

La clave debe incluir parámetros que cambian el resultado, incluyendo tenant/locale cuando corresponda. Define TTL, invalidación, límites de tamaño y estrategia ante cache miss. Un cache stampede ocurre cuando muchas solicitudes recalculan simultáneamente una clave expirada.

#### Paso 4 · Demostración guiada

En `src/main/java/academia/tarifas/TarifaService.java`:

```java
@Service
public class TarifaService {
    private final TarifaRepository repository;

    public TarifaService(TarifaRepository repository) { this.repository = repository; }

    @Cacheable(cacheNames = "tarifas", key = "#zona")
    public Tarifa buscar(String zona) {
        return repository.findByZona(zona)
            .orElseThrow(() -> new IllegalArgumentException("Zona desconocida"));
    }

    @CacheEvict(cacheNames = "tarifas", key = "#tarifa.zona")
    public Tarifa actualizar(Tarifa tarifa) {
        return repository.save(tarifa);
    }
}
```

**Ejecuta el ejemplo** (genera el proyecto con Spring Initializr, pega el código y corre las pruebas):

```bash
curl -fsSL https://start.spring.io/starter.zip -d dependencies=web -d javaVersion=25 -o app.zip && unzip -o app.zip
./mvnw test
```
Equivalencias Maven/Gradle en el Módulo 1.


Activa caching con `@EnableCaching` y configura Caffeine con máximo de entradas y TTL. Escribe un test que invoque dos veces `buscar("NORTE")` y verifique una llamada al repository, luego actualice y verifique que la siguiente búsqueda vuelve a leer. Ejecuta `./mvnw test -Dtest=TarifaServiceTest`.

**Resultado esperado:** la segunda lectura reutiliza la entrada y la escritura la invalida. **Fallo deliberado:** elimina `@CacheEvict`; actualiza tarifa y demuestra que el usuario recibe el valor viejo hasta expirar el TTL.

#### Paso 5 · Práctica guiada

Mide hits, misses y tamaño con Actuator/Micrometer. Añade un test para dos zonas y confirma que no colisionan claves. Evalúa qué sucede si se actualiza la tarifa en otra réplica cuando usas caché local.

#### Paso 6 · Práctica independiente

Propón para el proyecto integrador de RutaFlow una caché de lectura de catálogo y otra de autorización. Para cada una define TTL, clave, invalidación, privacidad multi-tenant y comportamiento si Redis no responde. Implementa solo la caché con consistencia aceptable; deja otras consultas sin cachear justificadamente.

#### Paso 7 · Cierre y evidencia

Entrega tests de hit/miss/invalidation, métrica y tabla de decisión Caffeine vs Redis. **Cuándo no usarlo:** no caches datos sensibles sin aislamiento de clave, datos que cambian constantemente sin invalidación ni resultados de consultas no deterministas. **Evidencia:** resultados medidos y test de valor obsoleto.

Referencia: [Spring Boot — Task Execution and Scheduling](https://docs.spring.io/spring-boot/reference/features/task-execution-and-scheduling.html), [Spring Framework — Cache Abstraction](https://docs.spring.io/spring-framework/reference/integration/cache.html), [Spring Framework — Email](https://docs.spring.io/spring-framework/reference/integration/email.html).


## Ampliación de la página 28 del PDF

### Tema complementario: Integraciones empresariales, SOAP y fronteras de protocolo

#### Paso 1 · Objetivo y preparación
Al finalizar podrás leer un contrato SOAP mínimo y separar transporte de lógica de negocio. **Prerrequisitos:** HTTP, XML y las capas del proyecto; Python para una demostración independiente de parsing. El siguiente ejemplo inspecciona XML confiable construido localmente; no es un servidor SOAP ni una sustitución de Spring Web Services.

#### Paso 2 · Contexto y caso real
**¿Por qué es importante?** Un socio de RutaFlow tiene SOAP y SFTP aunque la aplicación nueva use REST. REST describe una interfaz sobre recursos; SOAP define mensajes XML con Envelope, Header opcional, Body y Fault. SFTP transfiere archivos sobre SSH; no equivale a FTP ni a FTPS. SMTP transporta correo y no demuestra entrega al destinatario. Un adaptador traduce el contrato externo al dominio y conserva correlación, errores e idempotencia.

#### Paso 3 · Teoría, modelo mental y analogía
**Analogía:** varios formularios pueden solicitar el mismo despacho, pero cada formulario necesita un traductor que valide sus campos. El namespace identifica el vocabulario XML; el prefijo puede cambiar sin cambiar el significado. SOAP 1.1 y 1.2 usan namespaces y bindings diferentes. WSDL describe operaciones y tipos; no inventes un endpoint a partir del nombre de una operación.

#### Paso 4 · Demostración guiada desde cero
Crea `soap_contrato.py` en una carpeta vacía:

```python
import xml.etree.ElementTree as ET

mensaje = '''<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope"
 xmlns:r="urn:rutaflow:entregas"><s:Body><r:ConsultarEnvio>
 <r:id>ENV-42</r:id></r:ConsultarEnvio></s:Body></s:Envelope>'''
ns = {"s": "http://www.w3.org/2003/05/soap-envelope", "r": "urn:rutaflow:entregas"}
# Buscar por URI de namespace; el prefijo visible no es la identidad.
raiz = ET.fromstring(mensaje)
id_envio = raiz.findtext("s:Body/r:ConsultarEnvio/r:id", namespaces=ns)
if not id_envio:
    raise ValueError("Falta id del envío en el contrato SOAP 1.2")
print(f"Consultar envío: {id_envio}")
```

**Ejecuta el ejemplo** (genera el proyecto con Spring Initializr, pega el código y corre las pruebas):

```bash
curl -fsSL https://start.spring.io/starter.zip -d dependencies=web -d javaVersion=25 -o app.zip && unzip -o app.zip
./mvnw test
```
Equivalencias Maven/Gradle en el Módulo 1.


```bash
mkdir -p practica-integraciones
python3 soap_contrato.py
```

Ejecuta desde la carpeta donde guardaste el archivo. **Salida esperada:** `Consultar envío: ENV-42`. Explicación por bloques: el documento declara vocabularios, el mapa de namespaces permite encontrar el identificador y la validación impide traducir un mensaje sin id.

**Fallo deliberado:** cambia el URI SOAP al de 1.1 sin actualizar el contrato: la búsqueda no encuentra el nodo y lanza ValueError. Diagnostica versión y URI antes de cambiar etiquetas a ciegas.

#### Paso 5 · Práctica guiada
**Pista:** cambia `s` por `env` en la declaración y etiquetas conservando el URI; la búsqueda sigue funcionando. Cambia luego ENV-42 por un campo vacío y comprueba rechazo.

#### Paso 6 · Práctica independiente
Dibuja adaptador SOAP → caso de uso → repositorio del proyecto integrador Spring. Define límites de tamaño, timeouts, Fault, autenticación y correlación. Para SFTP verifica host key y finalización de archivo; para SMTP distingue aceptación del servidor y entrega. **Límites:** para XML externo emplea parser/configuración endurecidos, schema y límites; este parser de un literal local no valida WSDL, seguridad XML ni interoperabilidad real.

#### Paso 7 · Cierre y evidencia
Entrega archivo, salida, fallo y tabla REST/SOAP/SFTP/SMTP con contratos y garantías. **Errores comunes:** confundir prefijo con namespace, tratar HTTP 200 como éxito de negocio, presentar un archivo enviado como proceso completado. El siguiente paso es integrar un WSDL autorizado y verificar contrato real. **Fuente oficial:** [SOAP 1.2, W3C](https://www.w3.org/TR/soap12-part1/).
