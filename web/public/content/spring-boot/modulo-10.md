# Módulo 10: Mensajería con Kafka: eventos, errores, outbox y contratos

Mensajería basada en eventos con Kafka: productores/consumidores, claves, idempotencia, DLT, outbox y evolución de esquemas. Requiere broker Kafka para verificación completa.

**Entorno (2026-05-22):** JDK 27, Maven 3.10.0, Docker 29.9.3. Ejecución Kafka real requiere contenedor/broker.

## Aprende construyendo

### Tema 1: Productor, consumidor y claves de partición · Intermedio · 40 min
#### Productor/Consumidor Kafka
**Definición formal.** Productor publica registros a topics; consumidor lee registros de particiones manteniendo offsets.
**Para qué sirve.** Integración asíncrona desacoplada.
**Cuándo usarlo.** Eventos, pipelines, integración entre servicios. No para request/response síncrono simple.
**Ejemplo mínimo enfocado (conceptual).**
```java
kafkaTemplate.send("envios", key, payload);
@KafkaListener(topics="envios") void on(String msg){ }
```
**Caso de uso real.** Publicar evento `EnvioCreado`.
**Error común.** No definir clave cuando importa orden por entidad. Corrección: key por aggregate id.
**Verificación.** **Nota:** requiere Kafka broker.

#### Clave de partición
**Definición formal.** Valor usado para decidir partición; registros con misma clave van a la misma partición.
**Para qué sirve.** Orden relativo por clave.
**Cuándo usarlo.** Cuando el orden por entidad importa.
**Ejemplo mínimo enfocado (ejecutable simulación).**
```bash
mkdir -p /tmp/sb10-key && cd /tmp/sb10-key
cat > DemoKey.java << 'JAVA'
public class DemoKey { static int part(String k,int n){ return Math.floorMod(k.hashCode(),n);} public static void main(String[] args){ System.out.println(part("A1",3)==part("A1",3)); } }
JAVA
javac DemoKey.java && java DemoKey
```
**Caso de uso real.** Todos los eventos de pedido `P1` en misma partición.
**Error común.** Clave nula aleatoriza partición. Corrección: elegir clave de negocio.
**Verificación (JDK 27, 2026-05-22).** Salida: `true`.

### Tema 2: Idempotencia, retries y DLT · Avanzado · 45 min
#### Idempotencia del consumidor
**Definición formal.** Propiedad de procesar el mismo mensaje más de una vez con el mismo efecto final.
**Para qué sirve.** Tolerar reentregas/at-least-once.
**Cuándo usarlo.** Siempre en consumidores.
**Ejemplo mínimo enfocado (ejecutable).**
```bash
mkdir -p /tmp/sb10-idem && cd /tmp/sb10-idem
cat > DemoIdem.java << 'JAVA'
import java.util.*; public class DemoIdem { public static void main(String[] args){ Set<String> seen=new HashSet<>(); System.out.println(seen.add("m1")); System.out.println(seen.add("m1")); } }
JAVA
javac DemoIdem.java && java DemoIdem
```
**Caso de uso real.** Ignorar evento duplicado por ID.
**Error común.** Asumir exactly-once extremo a extremo. Corrección: idempotencia + outbox/transacciones según caso.
**Verificación (JDK 27, 2026-05-22).** Salida: `true`, `false`.

#### DLT (Dead Letter Topic)
**Definición formal.** Topic donde se envían mensajes que no pudieron procesarse tras reintentos.
**Para qué sirve.** Aislar fallos y permitir análisis/reproceso.
**Cuándo usarlo.** Consumidores con retries limitados.
**Ejemplo mínimo enfocado (Spring Kafka).** `DefaultErrorHandler` + `DeadLetterPublishingRecoverer`.
**Caso de uso real.** Mensaje malformado.
**Error común.** Reintentar infinito. Corrección: límites, backoff, DLT.
**Verificación.** **Nota:** requiere Kafka.

### Tema 3: Outbox, inbox y duplicados reales · Avanzado · 45 min
#### Outbox
**Definición formal.** Patrón que guarda evento en tabla outbox en la misma transacción de negocio y lo publica luego asincrónicamente.
**Para qué sirve.** Evitar perder eventos o publicar sin commit.
**Cuándo usarlo.** Cuando BD y broker no comparten transacción distribuida simple.
**Ejemplo mínimo enfocado (conceptual SQL).**
```sql
BEGIN; INSERT INTO pedido(...); INSERT INTO outbox(evento, payload, publicado=false)...; COMMIT;
```
**Caso de uso real.** Publicar `PedidoCreado` confiablemente.
**Error común.** Publicar a Kafka antes del commit DB. Corrección: outbox.
**Verificación.** **Nota:** requiere DB+broker+poller/CDC.

#### Inbox/deduplicación
**Definición formal.** Registro de IDs de mensajes procesados para detectar duplicados.
**Para qué sirve.** Idempotencia persistente.
**Cuándo usarlo.** Consumidores críticos.
**Ejemplo mínimo enfocado.** tabla `processed_message(message_id primary key)`.
**Caso de uso real.** Evitar doble cobro.
**Error común.** Deduplicar solo en memoria. Corrección: almacenamiento persistente.
**Verificación.** **Nota:** requiere BD.

### Tema 4: Evolución de esquemas y Schema Registry · Avanzado · 45 min
#### Evolución de esquema
**Definición formal.** Cambiar estructura de eventos manteniendo compatibilidad con productores/consumidores.
**Para qué sirve.** Evolucionar contratos asíncronos.
**Cuándo usarlo.** Siempre que el evento cambie.
**Ejemplo mínimo enfocado (regla).** agregar campo opcional con default; no renombrar/eliminar sin versión.
**Caso de uso real.** Agregar `canal` a evento.
**Error común.** Cambio incompatible en mismo topic sin versión. Corrección: compatibilidad backward/forward y registry.
**Verificación.** **Nota:** requiere Schema Registry/pipeline.

## Cierre
Kafka requiere pensar en claves, orden, duplicados, DLT y contratos. El broker no garantiza semántica de negocio por sí solo.
