# Módulo 8: Integraciones Spring: scheduling, eventos, correo, caché e IA

Este módulo cubre integraciones comunes: tareas programadas, eventos, correo, caché y fronteras de IA/MCP. El foco es confiabilidad, idempotencia y límites claros.

**Entorno de referencia (2026-05-22):** JDK 27, Maven 3.10.0. Integraciones reales (SMTP, Redis, brokers, IA) requieren infraestructura/credenciales; se marcan notas honestas.

## Aprende construyendo

### Tema 1: Scheduling y tareas periódicas · Intermedio · 35 min

#### `@Scheduled`

**Definición formal.** Mecanismo Spring para ejecutar métodos según cron/fixedRate/fixedDelay.

**Para qué sirve.** Tareas periódicas simples dentro de la app.

**Cuándo usarlo.** Jobs livianos y single-instance o con lock distribuido. No para procesamiento masivo sin coordinación.

**Ejemplo mínimo enfocado (Spring).**

```java
@Scheduled(fixedDelay = 60_000)
void limpiar() { /* idempotente */ }
```

**Caso de uso real.** Expirar reservas.

**Error común.** Ejecutar en todas las réplicas sin lock. Corrección: ShedLock/lock distribuido o job externo.

**Verificación.** **Nota:** requiere app Boot con `@EnableScheduling`.

### Tema 2: Eventos locales, eventos transaccionales y mensajería · Intermedio · 40 min

#### Eventos Spring

**Definición formal.** Mecanismo publish/subscribe dentro del contexto Spring; transaccionales pueden ligarse a fase de transacción.

**Para qué sirve.** Desacoplar efectos secundarios dentro de la app.

**Cuándo usarlo.** Efectos locales post-commit. No sustituye bus de eventos distribuido.

**Ejemplo mínimo enfocado (Spring).**

```java
publisher.publishEvent(new PedidoCreado(id));
@TransactionalEventListener(phase = AFTER_COMMIT)
void on(PedidoCreado e) { ... }
```

**Caso de uso real.** Enviar email tras commit.

**Error común.** Procesar evento antes de commit y luego rollback. Corrección: `@TransactionalEventListener`.

**Verificación.** **Nota:** requiere contexto Spring/transacción.

### Tema 3: Correo con Spring Mail y entrega recuperable · Avanzado · 40 min

#### Spring Mail

**Definición formal.** Abstracción para enviar correos via JavaMail/Jakarta Mail.

**Para qué sirve.** Notificaciones por email.

**Cuándo usarlo.** Notificaciones no críticas en latencia; para crítico, usa outbox/cola y reintentos.

**Ejemplo mínimo enfocado (Spring).**

```java
mailSender.send(msg);
```

**Caso de uso real.** Confirmación de pedido.

**Error común.** Enviar email dentro de transacción sin tolerar fallo externo. Corrección: after-commit + reintentos/idempotencia.

**Verificación.** **Nota:** requiere SMTP/credenciales.

### Tema 4: Caché con Spring Cache, Caffeine y Redis · Avanzado · 45 min

#### Spring Cache

**Definición formal.** Abstracción de caché declarativa con anotaciones como `@Cacheable`, `@CacheEvict`.

**Para qué sirve.** Reducir latencia/costo de lecturas repetidas.

**Cuándo usarlo.** Datos leídos con frecuencia y tolerancia a staleness controlada. Invalida correctamente.

**Ejemplo mínimo enfocado (ejecutable, cache map simple).**

```bash
mkdir -p /tmp/sb8-cache && cd /tmp/sb8-cache
cat > DemoCache.java << 'JAVA'
import java.util.*; public class DemoCache { static Map<String,String> c=new HashMap<>(); static String get(String k){ return c.computeIfAbsent(k,x->{ System.out.println("load"); return "V"; }); }
  public static void main(String[] args){ System.out.println(get("a")); System.out.println(get("a")); } }
JAVA
javac DemoCache.java && java DemoCache
```

**Caso de uso real.** Catálogo de productos.

**Error común.** Cache sin TTL/invalidation. Corrección: definir expiración y evicción.

**Verificación (JDK 27, 2026-05-22).** Salida: `load`, `V`, `V`.

### Tema 5: Integraciones empresariales, SOAP y fronteras de protocolo · Avanzado · 30 min

#### Frontera de protocolo

**Definición formal.** Capa donde el sistema traduce entre protocolos/modelos (REST, SOAP, JMS, archivos).

**Para qué sirve.** Aislar detalles externos del dominio.

**Cuándo usarlo.** Integraciones legadas/terceros.

**Ejemplo mínimo enfocado (conceptual).**

```java
// adaptador SOAP -> DTO dominio
RespuestaDominio r = soapClient.consultar(req);
```

**Caso de uso real.** Integrar ERP SOAP.

**Error común.** Filtrar DTO SOAP por todo el dominio. Corrección: adaptador/anticorruption layer.

**Verificación.** **Nota:** requiere endpoint/protocolo externo.

### Tema 6: Spring AI: ChatClient y herramientas con autorización fuera del modelo · Avanzado · 35 min

#### `ChatClient` / herramientas

**Definición formal.** Abstracción para interactuar con modelos de IA y exponer herramientas (function calling) con control de aplicación.

**Para qué sirve.** Integrar IA con acciones controladas.

**Cuándo usarlo.** Cuando el modelo aporta valor y las acciones sensibles están autorizadas por backend.

**Ejemplo mínimo enfocado (conceptual).**

```java
chatClient.prompt("...").tools(new Tool()).call().content();
```

**Caso de uso real.** Asistente que consulta pedidos autorizados.

**Error común.** Confiar en el modelo para autorización. Corrección: autorización en backend/herramienta.

**Verificación.** **Nota:** requiere proveedor IA/credenciales.

### Tema 7: RAG desde la frontera de datos: recuperar evidencia autorizada antes de generar · Avanzado · 40 min

#### RAG

**Definición formal.** Retrieval-Augmented Generation: recuperar contexto/evidencia relevante antes de generar respuesta con un modelo.

**Para qué sirve.** Reducir alucinación y anclar respuestas en datos.

**Cuándo usarlo.** QA sobre base documental/datos. Filtrar por autorización antes de recuperar.

**Ejemplo mínimo enfocado (ejecutable, retrieval simple).**

```bash
mkdir -p /tmp/sb8-rag && cd /tmp/sb8-rag
cat > DemoRag.java << 'JAVA'
import java.util.*;
public class DemoRag { public static void main(String[] args){ var docs=List.of("politica: 30 dias","horario: 9-18"); var q="politica"; docs.stream().filter(d->d.contains(q)).forEach(System.out::println); } }
JAVA
javac DemoRag.java && java DemoRag
```

**Caso de uso real.** Responder con políticas internas.

**Error común.** Recuperar documentos sin controlar permisos. Corrección: filtro por ACL/tenant antes del prompt.

**Verificación (JDK 27, 2026-05-22).** Salida: `politica: 30 dias`.

### Tema 8: Model Context Protocol (MCP) con Spring AI: exponer y consumir herramientas · Avanzado · 40 min

#### MCP

**Definición formal.** Protocolo para exponer herramientas/contexto a clientes de IA de forma estandarizada.

**Para qué sirve.** Integración interoperable de herramientas.

**Cuándo usarlo.** Cuando varias apps/agentes consumen herramientas comunes.

**Ejemplo mínimo enfocado (conceptual).**

```java
// exponer herramienta MCP con schema y validación server-side
```

**Caso de uso real.** Herramienta de consulta de catálogo.

**Error común.** Exponer herramienta sin auth/validación. Corrección: tratar MCP tool como endpoint sensible.

**Verificación.** **Nota:** requiere servidor/cliente MCP y runtime compatible.

## Cierre del módulo

Las integraciones fallan por bordes: tiempo, idempotencia, permisos, retries y observabilidad. Diseña cada integración con límite claro y modo de falla conocido.
