# Módulo 8: Integraciones Spring: scheduling, eventos, correo, caché e IA

Una aplicación Spring Boot en producción integra más que HTTP y base de datos: ejecuta tareas periódicas, publica eventos, envía correos, cachea lecturas, habla con sistemas legacy, consume APIs HTTP declarativas y, cuando aplica, usa IA con límites de seguridad. Este módulo cubre esas integraciones con contratos claros y verificación honesta.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2, Maven 3.10.0, Spring Boot 3.5.0 como línea de referencia para ejemplos Spring; las APIs de HTTP Service Clients y Spring AI/MCP evolucionan rápido y se marcan con nota de versión cuando corresponde.

## Aprende construyendo

### Tema 1: Scheduling y tareas periódicas · Intermedio · 35 min

Caso guía: el servicio debe reintentar envíos pendientes cada minuto sin solapar ejecuciones ni duplicar trabajo en múltiples instancias.

#### Definición formal

`@Scheduled` es la abstracción de Spring para ejecutar métodos por intervalo (`fixedDelay`, `fixedRate`), tiempo inicial (`initialDelay`) o expresión cron. El scheduler dispara la ejecución; no garantiza exclusión distribuida ni idempotencia de negocio.

#### Contrato / internals

- Requiere `@EnableScheduling` o autoconfiguración equivalente.
- Por defecto, un scheduler simple puede usar un solo hilo; tareas largas bloquean otras tareas.
- `fixedDelay` espera a que termine la ejecución anterior; `fixedRate` intenta respetar la tasa.
- En múltiples réplicas, cada instancia ejecuta el schedule salvo que haya lock distribuido.

#### Cuándo usarlo / cuándo no

**Úsalo** para tareas periódicas simples dentro de una instancia o con lock distribuido explícito. **No lo uses** como cola de trabajos confiable, ni como reemplazo de mensajería/idempotencia.

#### Ejemplo mínimo ejecutable

Crea `SchedulePolicy.java`:

```java
public class SchedulePolicy {
  static boolean shouldRun(boolean leader, boolean pending) {
    return leader && pending;
  }
  public static void main(String[] args) {
    System.out.println(shouldRun(true, true));
    System.out.println(shouldRun(false, true));
  }
}
```

Comandos:

```bash
javac SchedulePolicy.java
java SchedulePolicy
```

Salida esperada:

```text
true
false
```

#### Caso real

Solo la instancia con lock de líder ejecuta el reintento; la tarea consulta pendientes idempotentes y marca resultado por ID de envío.

#### Error común

**Síntoma.** el mismo lote se procesa dos veces. **Causa.** dos réplicas ejecutan `@Scheduled` sin lock. **Corrección.** lock distribuido (ShedLock/DB/Redis) e idempotencia por clave de negocio. **Señal observable.** logs duplicados con mismo `envioId` en instancias distintas.

#### Verificación

Smoke Java ejecutado localmente. **Nota de verificación:** `@Scheduled` real requiere contexto Spring; el contrato de lock/idempotencia se verificó con el smoke de decisión.

### Tema 2: Eventos locales, eventos transaccionales y mensajería · Intermedio · 40 min

Caso guía: al confirmar un pedido, se debe enviar un email y publicar un evento; si la transacción hace rollback, no debe publicarse.

#### Definición formal

Un evento local de Spring (`ApplicationEvent`/payload + `ApplicationEventPublisher`) notifica dentro del mismo proceso. `@TransactionalEventListener` permite vincular el manejo al ciclo de la transacción, típicamente `AFTER_COMMIT`. La mensajería externa (Kafka/RabbitMQ) desacopla procesos y requiere contrato/outbox para consistencia.

#### Contrato / internals

- Evento local: entrega en memoria, mismo JVM, baja latencia.
- `AFTER_COMMIT`: evita publicar efectos secundarios si la BD rollbackea.
- Publicar a broker externo dentro de la transacción DB no garantiza atomicidad sin outbox.
- El consumidor externo debe ser idempotente: los mensajes pueden duplicarse.

#### Cuándo usarlo / cuándo no

**Usa evento local** para desacoplar componentes dentro del mismo servicio. **Usa `@TransactionalEventListener`** para efectos post-commit. **Usa mensajería externa** para integración entre servicios; **no** como sustituto de una transacción distribuida mágica.

#### Ejemplo mínimo ejecutable

Crea `TxEvent.java`:

```java
public class TxEvent {
  static String publish(boolean committed) {
    return committed ? "PUBLISH" : "SKIP";
  }
  public static void main(String[] args) {
    System.out.println(publish(true));
    System.out.println(publish(false));
  }
}
```

Comandos:

```bash
javac TxEvent.java
java TxEvent
```

Salida esperada:

```text
PUBLISH
SKIP
```

#### Caso real

`PedidoConfirmado` se guarda en BD y en outbox en la misma transacción; un relay publica a Kafka después del commit.

#### Error común

**Síntoma.** se envió email pero el pedido no existe. **Causa.** efecto secundario ejecutado antes del commit. **Corrección.** `@TransactionalEventListener(phase = AFTER_COMMIT)` u outbox. **Señal observable.** logs de email sin registro de pedido confirmado.

#### Verificación

Smoke Java ejecutado localmente. **Nota de verificación:** comportamiento transaccional real se verifica con Spring + BD/Testcontainers; aquí se valida la regla de decisión.

### Tema 3: Correo con Spring Mail y entrega recuperable · Avanzado · 40 min

Caso guía: al crear una guía, el sistema envía un correo. El SMTP puede fallar temporalmente y no debe romper la transacción principal.

#### Definición formal

Spring Mail abstrae el envío de correo mediante `JavaMailSender`/`MimeMessage`. El contrato de entrega confiable generalmente requiere desacoplar el envío del request transaccional: persistir intención/notificación y procesar con reintentos.

#### Contrato / internals

- SMTP es I/O externo: puede ser lento, fallar o aceptar sin garantía de entrega final.
- `SimpleMailMessage` sirve para texto plano; `MimeMessage` para HTML/adjuntos.
- Los reintentos deben ser idempotentes (clave de notificación) para evitar correos duplicados.

#### Cuándo usarlo / cuándo no

**Úsalo** para notificaciones por correo. **No lo uses** sincrónicamente dentro del commit crítico si el correo no es esencial para la consistencia del negocio.

#### Ejemplo mínimo ejecutable

Crea `MailPlan.java`:

```java
public class MailPlan {
  static String plan(boolean smtpUp) {
    return smtpUp ? "SEND_NOW" : "QUEUE_RETRY";
  }
  public static void main(String[] args) {
    System.out.println(plan(true));
    System.out.println(plan(false));
  }
}
```

Comandos:

```bash
javac MailPlan.java
java MailPlan
```

Salida esperada:

```text
SEND_NOW
QUEUE_RETRY
```

#### Caso real

Se guarda `notificacion_email` con estado `PENDING`; un job o consumidor reintenta con backoff y marca `SENT`.

#### Error común

**Síntoma.** el endpoint de negocio falla por caída SMTP. **Causa.** envío síncrono acoplado al request. **Corrección.** outbox/cola de notificaciones y reintentos. **Señal observable.** 500 en creación de pedido cuando el correo no sale.

#### Verificación

Smoke Java ejecutado localmente. **Nota de verificación:** envío SMTP real no ejecutado; verificar con servidor SMTP de prueba (Mailpit/GreenMail) y aserción de mensaje recibido.

### Tema 4: Caché con Spring Cache, Caffeine y Redis · Avanzado · 45 min

Caso guía: el catálogo se lee miles de veces y cambia poco; la DB se satura con lecturas repetidas.

#### Definición formal

Spring Cache provee una abstracción declarativa (`@Cacheable`, `@CacheEvict`, `@CachePut`) sobre proveedores como Caffeine (local) o Redis (distribuido). La caché almacena resultados para reducir latencia/costo de recomputación o I/O.

#### Contrato / internals

- Clave de caché: determina hit/miss; debe incluir parámetros relevantes.
- TTL/evicción: controlan frescura y memoria.
- Caffeine: in-process, rápida, no compartida entre instancias.
- Redis: compartida, con latencia de red y modos de fallo propios.
- Invalidation es más difícil que caching: definir fuente de verdad y estrategia.

#### Cuándo usarlo / cuándo no

**Úsalo** para lecturas frecuentes y tolerantes a cierto stale, o con invalidación clara. **No lo uses** para datos que requieren consistencia fuerte sin estrategia de invalidación.

#### Ejemplo mínimo ejecutable

Crea `CacheMini.java`:

```java
import java.util.*;
public class CacheMini {
  static final Map<String, String> cache = new HashMap<>();
  static String get(String id) {
    return cache.computeIfAbsent(id, k -> "DB:" + k);
  }
  public static void main(String[] args) {
    System.out.println(get("A"));
    System.out.println(get("A"));
  }
}
```

Comandos:

```bash
javac CacheMini.java
java CacheMini
```

Salida esperada:

```text
DB:A
DB:A
```

#### Caso real

`@Cacheable(value="producto", key="#id")` en lectura; `@CacheEvict` al actualizar precio. En múltiples instancias, Redis evita caches locales divergentes.

#### Error común

**Síntoma.** datos viejos después de actualizar. **Causa.** falta de invalidación o TTL inadecuado. **Corrección.** `@CacheEvict`/`@CachePut`, TTL, versionado de claves. **Señal observable.** UI muestra precio antiguo tras update exitoso.

#### Verificación

Smoke Java ejecutado localmente. **Nota de verificación:** integración Caffeine/Redis con Spring no ejecutada aquí; verificar con `@SpringBootTest` y Redis/Testcontainers.

### Tema 5: Integraciones empresariales, SOAP y fronteras de protocolo · Avanzado · 30 min

Caso guía: el core consume un proveedor legacy SOAP; el dominio interno no debe depender de WSDL ni tipos generados del proveedor.

#### Definición formal

Una frontera de protocolo es un adaptador que traduce entre el modelo externo (SOAP/EDI/FTP, etc.) y el modelo interno del dominio. El patrón Anti-Corruption Layer protege el dominio de contratos legados o inestables.

#### Contrato / internals

- Entrada/salida externa: XML/SOAP, envelopes, faults.
- Traducción: DTO/cliente SOAP <-> dominio.
- Errores de protocolo se mapean a errores de aplicación con contexto.
- Contrato: el dominio no importa tipos SOAP generados.

#### Cuándo usarlo / cuándo no

**Úsalo** siempre que el protocolo externo sea legacy, verbose o propenso a cambiar. **No lo uses** como excusa para duplicar modelos sin necesidad; mapea solo lo que el dominio necesita.

#### Ejemplo mínimo ejecutable

Crea `SoapBoundary.java`:

```java
public class SoapBoundary {
  record DomainOrder(String id) {}
  static DomainOrder fromSoapXml(String xml) {
    String id = xml.replaceAll(".*<id>(.*)</id>.*", "$1");
    return new DomainOrder(id);
  }
  public static void main(String[] args) {
    System.out.println(fromSoapXml("<order><id>A1</id></order>").id());
  }
}
```

Comandos:

```bash
javac SoapBoundary.java
java SoapBoundary
```

Salida esperada:

```text
A1
```

#### Caso real

Un adapter SOAP llama al proveedor, convierte fault SOAP a `ProveedorNoDisponibleException` y devuelve un objeto de dominio.

#### Error común

**Síntoma.** cambios en WSDL rompen todo el core. **Causa.** tipos SOAP filtrados al dominio. **Corrección.** adapter/ACL con mapeo explícito. **Señal observable.** imports de clases generadas SOAP en servicios de dominio.

#### Verificación

Smoke Java ejecutado localmente. **Nota de verificación:** cliente SOAP real no ejecutado; verificar con contrato WSDL de prueba y test de adapter.

### Tema 6: HTTP Service Clients declarativos con @HttpExchange/@ImportHttpServices · Intermedio · 35 min

Caso guía: consumir una API interna de usuarios sin repetir boilerplate de `WebClient` para cada endpoint.

#### Definición formal

HTTP Service Clients declarativos permiten declarar una interfaz Java con anotaciones HTTP (`@HttpExchange`, `@GetExchange`, `@PostExchange`, etc.) y dejar que Spring genere un proxy cliente. En Spring Framework 6/Boot 3+ existe el modelo; Spring Boot 4 mejora la configuración y el registro (`@ImportHttpServices`, grupos/configuración).

#### Contrato / internals

- Interfaz: define contrato HTTP tipado.
- Proxy: traduce invocación de método a request HTTP.
- Configuración: base URL, timeouts, codecs, auth, observabilidad.
- Errores: 4xx/5xx deben mapearse; no asumir que todo es 200.

#### Cuándo usarlo / cuándo no

**Úsalo** para clientes REST tipados y estables. **No lo uses** cuando necesitas control fino por request, streaming complejo, o protocolos no HTTP.

#### Ejemplo mínimo ejecutable

Crea `Hsc.java`:

```java
interface UsersClient { String byId(String id); }
class FakeUsersClient implements UsersClient {
  public String byId(String id) { return "user:" + id; }
}
public class Hsc {
  public static void main(String[] args) {
    UsersClient c = new FakeUsersClient();
    System.out.println(c.byId("7"));
  }
}
```

Comandos:

```bash
javac Hsc.java
java Hsc
```

Salida esperada:

```text
user:7
```

Ejemplo Spring Boot (referencia, no ejecutado aquí):

```java
@HttpExchange(url = "http://users:8080", accept = "application/json")
public interface UsersClient {
  @GetExchange("/users/{id}")
  UserDto byId(@PathVariable String id);
}
```

#### Caso real

El servicio de pedidos consulta usuarios por interfaz declarativa; la configuración central define timeout y cabecera de trazabilidad.

#### Error común

**Síntoma.** llamadas colgadas o errores opacos. **Causa.** sin timeout ni manejo de status. **Corrección.** configurar connect/read timeout y `statusHandler`. **Señal observable.** métricas HTTP client con latencia alta y sin error code clasificado.

#### Verificación

Smoke Java ejecutado localmente para el contrato de interfaz. **Nota de verificación:** no se ejecutó `@ImportHttpServices` en contexto Spring Boot 4 aquí; verificar con Boot 4 app, stub server (WireMock) y test de integración.

### Tema 7: Spring AI: ChatClient y herramientas con autorización fuera del modelo · Avanzado · 35 min

Caso guía: un asistente puede consultar envíos, pero solo los del usuario autenticado.

#### Definición formal

Spring AI ofrece abstracciones como `ChatClient` para interactuar con modelos. El modelo genera texto/herramientas sugeridas; la autorización y ejecución de herramientas son responsabilidad de la aplicación.

#### Contrato / internals

- Prompt/input del usuario es no confiable.
- Tool calling: el modelo propone llamada; la app valida permisos, parámetros y ejecuta.
- Contrato de seguridad: identidad/autorización provienen del backend, no del prompt.

#### Cuándo usarlo / cuándo no

**Úsalo** para asistencia con contexto controlado. **No lo uses** para delegar decisiones de autorización, borrados o pagos sin controles deterministas.

#### Ejemplo mínimo ejecutable

Crea `ToolAuth.java`:

```java
public class ToolAuth {
  static boolean canRead(String owner, String user) { return owner.equals(user); }
  public static void main(String[] args) {
    System.out.println(canRead("u1","u1"));
    System.out.println(canRead("u1","u2"));
  }
}
```

Comandos:

```bash
javac ToolAuth.java
java ToolAuth
```

Salida esperada:

```text
true
false
```

#### Caso real

La herramienta `buscarEnvio(id)` recibe el `userId` del `SecurityContext`, no del modelo. Si no es dueño, devuelve 403/denegado.

#### Error común

**Síntoma.** fuga de datos por prompt injection. **Causa.** confiar en instrucciones del modelo. **Corrección.** allowlist de herramientas, validación de input, autorización server-side. **Señal observable.** herramienta ejecutada para recurso de otro tenant.

#### Verificación

Smoke Java ejecutado localmente. **Nota de verificación:** integración Spring AI/modelo no ejecutada; verificar con proveedor/modelo configurado y tests de autorización de tools.

### Tema 8: RAG desde la frontera de datos: recuperar evidencia autorizada antes de generar · Avanzado · 40 min

Caso guía: el asistente responde sobre políticas internas; solo debe usar documentos que el usuario puede ver.

#### Definición formal

RAG (Retrieval-Augmented Generation) recupera evidencia desde una fuente de datos y la entrega al modelo como contexto para generar una respuesta. La frontera de datos debe aplicar autorización antes de que la evidencia llegue al prompt.

#### Contrato / internals

- Indexación: chunking, embeddings, metadatos (tenant, owner, ACL).
- Retrieval: top-k por similitud + filtros de autorización.
- Generación: el modelo responde usando evidencia proporcionada.
- Riesgo: prompt injection en documentos y fuga por retrieval sin filtro.

#### Cuándo usarlo / cuándo no

**Úsalo** cuando necesitas respuestas basadas en corpus privado/cambiante. **No lo uses** si una consulta determinista o búsqueda normal resuelve el caso con menor riesgo/costo.

#### Ejemplo mínimo ejecutable

Crea `RagAcl.java`:

```java
import java.util.*;
public class RagAcl {
  record Doc(String owner, String text) {}
  public static void main(String[] args) {
    var docs = List.of(new Doc("u1","política A"), new Doc("u2","política B"));
    docs.stream().filter(d -> d.owner().equals("u1")).forEach(d -> System.out.println(d.text()));
  }
}
```

Comandos:

```bash
javac RagAcl.java
java RagAcl
```

Salida esperada:

```text
política A
```

#### Caso real

Antes de consultar el vector store, el servicio añade filtro `tenantId=user.tenant`; el prompt solo incluye chunks autorizados.

#### Error común

**Síntoma.** el asistente revela documentos de otro cliente. **Causa.** retrieval sin ACL. **Corrección.** filtrar por identidad/tenant en index y query. **Señal observable.** chunks recuperados con `tenantId` distinto.

#### Verificación

Smoke Java ejecutado localmente. **Nota de verificación:** vector DB/embeddings no ejecutados; verificar con store de prueba, metadatos ACL y tests de retrieval.

### Tema 9: Model Context Protocol (MCP) con Spring AI: exponer y consumir herramientas · Avanzado · 40 min

Caso guía: quieres exponer herramientas internas a un cliente AI mediante un contrato estándar, sin acoplarlo a implementaciones ad hoc.

#### Definición formal

MCP (Model Context Protocol) es un protocolo para exponer capacidades (tools/resources/prompts) de forma estructurada a clientes de IA. Spring AI ofrece soporte para crear servidores y clientes MCP en el ecosistema Spring.

#### Contrato / internals

- Servidor MCP: publica herramientas con nombre, esquema de entrada y salida.
- Cliente MCP: descubre e invoca herramientas.
- Seguridad: autenticación/autorización, aislamiento de tenant, validación de argumentos.
- Límite: MCP estandariza la interfaz, no elimina el riesgo de tool misuse.

#### Cuándo usarlo / cuándo no

**Úsalo** cuando varios clientes/agentes necesitan consumir herramientas con contrato estándar. **No lo uses** para exponer operaciones sensibles sin controles de authz, auditoría y confirmación.

#### Ejemplo mínimo ejecutable

Crea `McpTool.java`:

```java
import java.util.*;
public class McpTool {
  static Map<String, Object> tool(String name) {
    return Map.of("name", name, "input", "id:string");
  }
  public static void main(String[] args) {
    System.out.println(tool("buscarEnvio").get("name"));
  }
}
```

Comandos:

```bash
javac McpTool.java
java McpTool
```

Salida esperada:

```text
buscarEnvio
```

#### Caso real

Un servidor MCP expone `buscarEnvio` de solo lectura; una herramienta destructiva exige confirmación humana y rol admin.

#### Error común

**Síntoma.** agente ejecuta acción destructiva no deseada. **Causa.** tool expuesta sin política de autorización/confirmación. **Corrección.** clasificar herramientas por riesgo, aplicar authz y auditoría. **Señal observable.** log de tool call destructiva sin aprobación.

#### Verificación

Smoke Java ejecutado localmente. **Nota de verificación:** servidor/cliente MCP Spring AI no ejecutado aquí por dependencia de versión/runtime; verificar con app Spring AI MCP, descubrimiento de tools y test de invocación autorizada.

## Cierre

Las integraciones Spring amplían capacidades, pero también superficie de fallo. Cada integración necesita contrato, límites, idempotencia/autorización donde aplique y una verificación proporcional al riesgo.

## Checklist

- Schedules con lock/idempotencia en multi-instancia.
- Eventos post-commit o outbox para consistencia.
- Correo y caché con estrategia de fallo/invalidación.
- Clientes HTTP declarativos con timeout y manejo de errores.
- AI/MCP con autorización fuera del modelo y evidencia autorizada.
