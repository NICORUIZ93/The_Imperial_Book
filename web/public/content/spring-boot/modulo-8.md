# Módulo 8: Integraciones Spring: scheduling, eventos, correo, caché e IA

## Aprende construyendo

Este módulo completa el mapa de integraciones de Spring identificado en las capturas. Cada capacidad se introduce con una prueba observable y un límite importante: el scheduler local no coordina instancias, los eventos en memoria no son durables, SMTP puede fallar y las cachés necesitan invalidación.


### Dos ejemplos: primero visible, luego real

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por dos ejemplos: primero visible, luego real con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender dos ejemplos: primero visible, luego real te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en dos ejemplos: primero visible, luego real como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que dos ejemplos: primero visible, luego real resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Dos ejemplos: primero visible, luego real se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Dos ejemplos: primero visible, luego real | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses dos ejemplos: primero visible, luego real por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: dos ejemplos: primero visible, luego real funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Dos ejemplos: primero visible, luego real existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve dos ejemplos: primero visible, luego real en tu contexto?
2. ¿Cómo sabrías que dos ejemplos: primero visible, luego real no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar dos ejemplos: primero visible, luego real?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar dos ejemplos: primero visible, luego real.

</details>

### Tema 1: Scheduling y tareas periódicas · Intermedio · 35 min

**Caso guía**: ejecutar limpieza cada hora sin bloquear requests HTTP.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| `@Scheduled` | Ejecuta método por cron/fixedRate/fixedDelay. | Tareas periódicas. | Tareas idempotentes y observables. | Tarea larga bloqueando scheduler único. |
| `@EnableScheduling` | Habilita scheduling. | Activar feature. | Configurar pool si hay varias tareas. | Default single-thread para múltiples tareas. |
| `fixedRate` vs `fixedDelay` | Rate: desde inicio; delay: desde fin. | Semántica temporal. | Elegir según carga. | Usar rate para tarea que puede solaparse. |
| Idempotencia/reentrancia | Ejecutar dos veces no causa daño. | Robustez. | Locks/distribuidos si múltiples instancias. | Duplicar trabajo en cluster. |

**Implementación desde cero**
```java
@SpringBootApplication @EnableScheduling
public class DemoApplication {}
@Component
class LimpiezaJob {
  private static final Logger log = LoggerFactory.getLogger(LimpiezaJob.class);
  @Scheduled(fixedDelayString = "PT1H")
  public void limpiar(){ log.info("limpieza"); }
}
```
**Ejecución real**: `./mvnw spring-boot:run` y observar log en intervalo (o usar cron de prueba). **Verificación**: configurar `spring.task.scheduling.pool.size`.

### Tema 2: Eventos locales, eventos transaccionales y mensajería · Intermedio · 40 min

**Caso guía**: al crear tarea, enviar notificación solo si la transacción commit.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| `ApplicationEventPublisher` | Publicación de eventos dentro del contexto Spring. | Desacoplar componentes. | Eventos de dominio claros. | Usar eventos para todo, flujo difícil de seguir. |
| `@EventListener` | Escucha eventos sincrónica por defecto. | Reaccionar a eventos. | Saber que es sync por defecto. | Asumir async. |
| `@TransactionalEventListener` | Ejecuta tras commit/rollback según fase. | Consistencia con DB. | `AFTER_COMMIT` para efectos externos. | Enviar email antes de commit. |
| Mensajería vs evento local | Local: mismo proceso; mensajería: entre servicios. | Escala/integración. | No confundir garantías. | Creer que evento local sobrevive caída. |

**Implementación desde cero**
```java
public record TareaCreadaEvent(Long id) {}
@Service class TareaService { private final ApplicationEventPublisher pub; /*...*/ @Transactional public void crear(){ /*save*/ pub.publishEvent(new TareaCreadaEvent(1L)); } }
@Component class Notificador { @TransactionalEventListener(phase=TransactionPhase.AFTER_COMMIT) public void on(TareaCreadaEvent e){ log.info("notificar {}", e.id()); } }
```
**Ejecución real**: test con rollback verifica que no se notifica; commit sí. **Verificación**: log aparece solo tras commit.

### Tema 3: Correo con Spring Mail y entrega recuperable · Avanzado · 40 min

**Caso guía**: enviar email de confirmación; si falla SMTP, reintentar sin perder request.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Spring Mail / `JavaMailSender` | Abstracción para enviar emails. | Notificaciones. | Configurar host/credenciales por env. | Credenciales en repo. |
| Entrega recuperable | Reintento/cola ante falla temporal. | Robustez. | Outbox/cola/retry. | Enviar sync en request HTTP crítico. |
| Plantillas/contenido | HTML/texto, variables. | Comunicaciones claras. | Escapar contenido usuario. | Inyección HTML. |
| Observabilidad | Logs, métricas, dead letter. | Operar. | Correlation id. | Fallo silencioso. |

**Implementación desde cero**
```xml
<dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-mail</artifactId></dependency>
```
```java
@Service class MailService { private final JavaMailSender mail; MailService(JavaMailSender m){mail=m;} void enviar(String to,String subject,String body){ var msg=new SimpleMailMessage(); msg.setTo(to); msg.setSubject(subject); msg.setText(body); mail.send(msg); } }
```
**Ejecución real**: usar Mailpit/Mailhog local en Docker. **Verificación**: email recibido en inbox de prueba.

### Tema 4: Caché con Spring Cache, Caffeine y Redis · Avanzado · 45 min

**Caso guía**: catálogo leído muchas veces, cambia poco.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| Spring Cache (`@Cacheable`) | Abstracción de caché declarativa. | Reducir latencia/carga. | Claves y TTL definidos. | Cachear sin invalidación. |
| Caffeine | Caché en memoria local, alta performance. | Single instance/latencia mínima. | Tamaño/TTL. | Cache local en cluster sin coherencia. |
| Redis | Caché distribuida. | Compartir entre instancias. | Serialización, TTL, eviction. | Guardar objetos enormes o sensibles sin cifrar. |
| Invalidación | `@CacheEvict`, `@CachePut`. | Consistencia. | Evict en writes. | Datos stale. |

**Implementación desde cero**
```xml
<dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-cache</artifactId></dependency>
<dependency><groupId>com.github.ben-manes.caffeine</groupId><artifactId>caffeine</artifactId></dependency>
```
```java
@EnableCaching @Configuration
class CacheConfig { @Bean CacheManager cacheManager(){ var cm=new CaffeineCacheManager("tareas"); cm.setCaffeine(Caffeine.newBuilder().maximumSize(100).expireAfterWrite(Duration.ofMinutes(5))); return cm; } }
@Service class TareaQuery { @Cacheable("tareas") public TareaDTO porId(Long id){ ... } @CacheEvict(value="tareas", key="#id") public void invalidar(Long id){} }
```
**Ejecución real**: llamar dos veces y verificar que segundo no pega a DB (log/contador). **Verificación**: evict limpia entrada.

### Tema 5: Integraciones empresariales, SOAP y fronteras de protocolo · Avanzado · 30 min

**Caso guía**: integrar con sistema legacy SOAP sin contaminar dominio.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| SOAP | Protocolo XML con envelope/WSDL. | Integraciones enterprise/legacy. | Cliente generado o `WebServiceTemplate`. | Parsear XML a mano frágil. |
| Frontera de protocolo | Adaptador que traduce protocolo externo a modelo interno. | Aislar dominio. | Anticorruption layer/adapter. | Filtrar DTO SOAP al dominio. |
| Contrato/WSDL | Descripción formal del servicio. | Generar cliente. | Versionar y testear. | Asumir contrato estable. |
| Resiliencia/timeout | Fallas externas. | Estabilidad. | Timeout, retry, circuit breaker. | Esperar infinito. |

**Implementación desde cero** (conceptual/práctico con mock)
```java
interface TrackingPort { EstadoTracking consultar(String guia); } // dominio
@Component class SoapTrackingAdapter implements TrackingPort { /* usa WebServiceTemplate */ }
```
**Ejecución real**: test con servidor SOAP mock/WireMock SOAP o stub. **Verificación**: dominio no depende de clases SOAP.

### Tema 6: Spring AI: ChatClient y herramientas con autorización fuera del modelo · Avanzado · 35 min

**Caso guía**: asistente que puede consultar tareas, pero solo lo que el usuario puede ver.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| `ChatClient` | API fluida Spring AI para llamar LLM. | Integrar IA. | Prompts y contexto controlado. | Mandar datos sensibles sin necesidad. |
| Tool calling | Modelo solicita ejecutar herramienta definida. | Acciones/consultas estructuradas. | Herramientas con validación/autorización. | Confiar en que el modelo decide permisos. |
| Autorización fuera del modelo | Permisos se verifican en código, no en prompt. | Seguridad. | Verificar identity/roles en tool. | “El prompt dice que no lo haga”. |
| Límites/guardrails | Timeouts, presupuesto, filtros. | Control. | Limitar tokens/costo/herramientas. | Loop de tools sin límite. |

**Implementación desde cero** (requiere proveedor/modelo configurado)
```java
@Bean
ChatClient chatClient(ChatClient.Builder b){ return b.build(); }
@Component
class TareaTools {
  @Tool(description="Busca tarea por id") TareaDTO buscar(Long id, Authentication auth){ /* verificar auth */ return ...; }
}
```
**Ejecución real**: test con modelo mock/stub. **Verificación**: tool rechaza acceso no autorizado aunque el prompt lo pida.

### Tema 7: RAG desde la frontera de datos: recuperar evidencia autorizada antes de generar · Avanzado · 40 min

**Caso guía**: responder preguntas con docs internos, sin fugar docs no autorizados.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| RAG | Retrieval-Augmented Generation: recuperar contexto antes de generar. | Respuestas basadas en evidencia. | Recuperar solo docs autorizados. | Indexar todo sin ACL. |
| Embeddings/vector store | Representación vectorial para búsqueda semántica. | Recuperación relevante. | Evaluar calidad/latencia. | Meter basura en índice. |
| Frontera de datos | Capa que filtra por permisos antes de enviar a LLM. | Seguridad. | Aplicar ACL en retrieval. | Filtrar después de generar. |
| Citas/evidencia | Referenciar fuente. | Confianza. | Incluir fuente/ID. | Respuesta sin trazabilidad. |

**Implementación desde cero** (vector store + filtro por usuario/rol)
```java
List<Document> docs = vectorStore.similaritySearch(SearchRequest.query(pregunta).withTopK(4).withFilterExpression("owner == '"+user+"'"));
String contexto = docs.stream().map(Document::getContent).collect(joining("\n"));
```
**Ejecución real**: con dataset de prueba, pregunta responde usando docs permitidos. **Verificación**: doc no autorizado nunca aparece en contexto.

### Tema 8: Model Context Protocol (MCP) con Spring AI: exponer y consumir herramientas · Avanzado · 40 min

**Caso guía**: exponer herramientas internas a clientes MCP con control.

| Concepto | Definición | Para qué | Regla | Error |
|---|---|---|---|---|
| MCP | Protocolo para exponer herramientas/contexto a modelos/clientes. | Interoperabilidad de tools. | Autenticación/autorización por tool. | Exponer tools sensibles sin auth. |
| MCP server | Servicio que publica tools/resources/prompts. | Reutilización. | Contratos claros y versionados. | Tool con side effects no documentados. |
| MCP client | Consume tools MCP. | Integración. | Validar respuestas. | Confiar ciegamente. |
| Seguridad | AuthN/AuthZ, auditoría, límites. | Operación segura. | Least privilege por tool. | Token amplio para todo. |

**Implementación desde cero** (Spring AI MCP starter según versión)
```java
@Tool(description="Crea tarea") public TareaDTO crear(CrearTareaRequest req){ ... }
```
Configurar servidor MCP y exponer herramienta. **Ejecución real**: cliente MCP lista tools e invoca una con credenciales válidas. **Verificación**: llamada sin permiso falla; llamada válida auditada.

