# Módulo 11: RabbitMQ, JMS y Spring Cloud Stream

Cubre colas/trabajo asíncrono, exchanges/routing, JMS y abstracción con Spring Cloud Stream.

**Entorno (2026-05-22):** Docker disponible; brokers reales requieren contenedores/servicios.

## Aprende construyendo

### Tema 1: Colas, trabajo asíncrono y consumidores · Intermedio · 40 min
#### Cola de mensajes
**Definición formal.** Estructura donde productores encolan mensajes y consumidores los procesan asincrónicamente.
**Para qué sirve.** Desacoplar y suavizar picos.
**Cuándo usarlo.** Trabajos background, integración.
**Ejemplo mínimo enfocado (ejecutable).**
```bash
mkdir -p /tmp/sb11-q && cd /tmp/sb11-q
cat > DemoQ.java << 'JAVA'
import java.util.concurrent.*; public class DemoQ { public static void main(String[] args) throws Exception { BlockingQueue<String> q=new ArrayBlockingQueue<>(10); q.put("job"); System.out.println(q.take()); } }
JAVA
javac DemoQ.java && java DemoQ
```
**Caso de uso real.** Cola de emails.
**Error común.** No manejar poison messages. Corrección: retry/DLQ.
**Verificación (JDK 27, 2026-05-22).** Salida: `job`.

### Tema 2: RabbitMQ: exchanges, routing, ACK y DLQ · Avanzado · 45 min
#### Exchange/routing
**Definición formal.** Exchange recibe mensajes y los enruta a colas por reglas (direct/topic/fanout).
**Para qué sirve.** Routing flexible.
**Cuándo usarlo.** Cuando un mensaje puede ir a múltiples colas/criterios.
**Ejemplo mínimo enfocado (conceptual).** `exchange=envios`, routing key `envio.creado`.
**Caso de uso real.** Notificar facturación y logística.
**Error común.** Auto-ack antes de procesar. Corrección: ACK manual tras éxito.
**Verificación.** **Nota:** requiere RabbitMQ.

#### DLQ
**Definición formal.** Cola de mensajes fallidos para inspección/reproceso.
**Para qué sirve.** Aislar errores.
**Cuándo usarlo.** Consumidores con reintentos.
**Ejemplo mínimo enfocado.** Configurar dead-letter-exchange.
**Caso de uso real.** Mensaje inválido.
**Error común.** Perder mensajes fallidos. Corrección: DLQ + alerta.
**Verificación.** **Nota:** requiere broker.

### Tema 3: JMS y mensajería empresarial · Avanzado · 40 min
#### JMS
**Definición formal.** API Java estándar para mensajería enterprise (colas/topics).
**Para qué sirve.** Integrar con brokers JMS/legacy.
**Cuándo usarlo.** Entornos enterprise/IBM MQ/ActiveMQ/Jakarta.
**Ejemplo mínimo enfocado (conceptual).** `JmsTemplate.convertAndSend(...)`.
**Caso de uso real.** Integración con sistema legado.
**Error común.** Tratar JMS como Kafka. Corrección: entender semántica del broker.
**Verificación.** **Nota:** requiere broker JMS.

### Tema 4: Spring Cloud Stream: binding de mensajería sin acoplarse al broker · Avanzado · 45 min
#### Binder/Binding
**Definición formal.** Abstracción de Spring Cloud Stream que conecta funciones de app con destinos de broker mediante binders.
**Para qué sirve.** Reducir acoplamiento al broker.
**Cuándo usarlo.** Cuando quieres portabilidad o modelo funcional.
**Ejemplo mínimo enfocado (conceptual).**
```java
@Bean Function<String,String> upper(){ return String::toUpperCase; }
```
**Caso de uso real.** Misma lógica con Kafka o Rabbit binder.
**Error común.** Abstraer tanto que pierdes capacidades del broker necesarias. Corrección: evaluar trade-off.
**Verificación.** **Nota:** requiere binder/broker.

## Cierre
Elige el broker por semántica operativa, no por moda. Diseña ACK, retries, DLQ e idempotencia desde el inicio.
