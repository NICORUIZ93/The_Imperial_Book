# Módulo 2.7 · Event-Driven Architecture

EDA desacopla productores y consumidores mediante eventos. El beneficio es escalabilidad y extensibilidad; el costo es depurar flujos asíncronos, manejar duplicados y evolucionar esquemas.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2, Docker 29.9.3 para labs de Kafka/RabbitMQ/NATS.

## Aprende construyendo

### Tema 1: Kafka profundo: particionamiento, consumer groups · Avanzado · 180 min

Caso guía: escalar consumidores manteniendo orden por pedido.

#### Partición y consumer group

**Definición formal.** Una partición es un log ordenado; un consumer group reparte particiones entre consumidores para paralelismo.

**Regla.** Orden garantizado por partición, no global.

### Tema 2: Exactly-Once Semantics (EOS) · Avanzado · 150 min

Caso guía: evitar doble cobro por retry.

#### EOS

**Definición formal.** Propiedad donde el efecto observable equivale a procesar una vez, aunque haya retries. En Kafka depende de idempotent producer/transacciones y diseño end-to-end.

**Error común.** Creer que EOS del broker resuelve duplicados en DB externa. Corrección: idempotencia end-to-end.

### Tema 3: Schema Registry y Avro · Intermedio · 150 min

Caso guía: evolucionar evento sin romper consumidores viejos.

#### Schema Registry

**Definición formal.** Servicio que almacena versiones de esquemas y valida compatibilidad.

**Error común.** Cambios incompatibles sin versión. Corrección: reglas de compatibilidad y defaults.

### Tema 4: Dead Letter Topics · Intermedio · 120 min

Caso guía: mensaje inválido bloquea consumer.

#### DLT

**Definición formal.** Destino para mensajes que fallan tras política de retry. Permite aislar veneno y seguir procesando.

**Error común.** DLT sin monitoreo. Corrección: alertas y proceso de reprocesamiento.

### Tema 5: RabbitMQ: publisher confirms, DLQ · Intermedio · 120 min

Caso guía: garantizar que el broker recibió el mensaje.

#### Publisher confirms y DLQ

**Definición formal.** Publisher confirms: broker confirma recepción. DLQ: cola para mensajes rechazados/expirados/fallidos.

**Error común.** Publicar sin confirm. Corrección: confirms y manejo de nacks.

### Tema 6: NATS · Intermedio · 90 min

Caso guía: mensajería liviana de baja latencia.

#### NATS

**Definición formal.** Sistema de mensajería ligero; JetStream agrega persistencia/streaming. Útil para casos de baja latencia y simplicidad operativa.

**Error común.** Elegir NATS/Kafka por moda. Corrección: comparar garantías, operación y modelo de consumo.

## Cierre

EDA requiere pensar en entrega, duplicados, orden, esquema y observabilidad. El evento es un contrato público.

## Checklist

- Idempotencia end-to-end.
- Clave de partición consciente.
- DLT monitoreado.
- Esquemas con compatibilidad.
