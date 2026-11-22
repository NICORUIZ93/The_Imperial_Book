# Módulo 11 · Event-Driven Architecture

**Entorno de referencia (2026-05-22):** Node.js v24.18.0, Docker 29.9.3. Se verifican particionado, consumer groups, idempotencia, DLQ y semánticas con simulaciones. Kafka/RabbitMQ/NATS/Schema Registry requieren brokers/infra; **Nota de verificación** honesta.

## Aprende construyendo

### Tema 1: Kafka profundo: particionamiento, consumer groups · Avanzado · 180 min

Caso guía: escalar consumidores manteniendo orden por clave.

#### Partición

**Definición formal.** En Kafka, una partición es un log ordenado e inmutable dentro de un topic; la clave determina típicamente la partición.

**Para qué sirve.** Paralelismo y orden por clave.

**Cuándo usarlo y cuándo no.** Úsalo para throughput. No asumas orden global entre particiones.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
node -e "function part(key,n){ let h=0; for(const c of key) h=(h*31+c.charCodeAt(0))>>>0; return h%n; } console.log(part('order-1',3), part('order-1',3));"
```

**Caso de uso real.** Todos los eventos de un pedido van a la misma partición.

**Error común.** Cambiar número de particiones esperando misma key->partición. Corrección: cuidado con resharding.

**Verificación (Node 24.18.0, 2026-05-22).** Misma clave produce misma partición.

#### Consumer group

**Definición formal.** Grupo de consumidores que comparten la lectura de un topic, con cada partición asignada a un consumidor del grupo.

**Para qué sirve.** Escalado horizontal de consumo.

**Cuándo usarlo y cuándo no.** Úsalo para paralelizar. No más consumidores activos que particiones.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
node -e "const partitions=3, consumers=5; console.log(Math.min(partitions,consumers))"
```

**Caso de uso real.** 3 particiones, 3 consumidores activos.

**Error común.** Esperar más paralelismo agregando consumidores por encima de particiones. Corrección: aumentar particiones.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `3`.

### Tema 2: Exactly-Once Semantics (EOS) · Avanzado · 150 min

Caso guía: evitar doble cobro al reprocesar.

#### EOS / idempotencia

**Definición formal.** Exactly-once es la semántica donde el efecto observable ocurre una vez a pesar de reintentos; en la práctica depende de idempotencia, transacciones y soporte de plataforma.

**Para qué sirve.** Evita duplicados en efectos críticos.

**Cuándo usarlo y cuándo no.** Úsalo en pagos/inventario. No asumas EOS extremo a extremo sin diseño.

**Ejemplo mínimo enfocado (ejecutable, idempotencia).**

```bash
node -e "const seen=new Set(); function process(id){ if(seen.has(id)) return 'dup'; seen.add(id); return 'ok'; } console.log(process('e1'), process('e1'));"
```

**Caso de uso real.** Idempotency key o tabla de deduplicación.

**Error común.** Confiar solo en "exactly once" del broker. Corrección: idempotencia en consumidor/efecto.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `ok dup`.

### Tema 3: Schema Registry y Avro · Intermedio · 150 min

Caso guía: evolucionar esquema de evento sin romper consumidores.

#### Schema Registry / Avro

**Definición formal.** Avro es un formato de serialización con esquema; Schema Registry almacena versiones de esquemas y valida compatibilidad.

**Para qué sirve.** Contratos de eventos evolucionables.

**Cuándo usarlo y cuándo no.** Úsalo en plataformas de eventos con múltiples productores/consumidores. No cambies esquemas sin política de compatibilidad.

**Ejemplo mínimo enfocado (esquema conceptual).**

```json
{"type":"record","name":"OrderCreated","fields":[{"name":"id","type":"string"},{"name":"total","type":"int","default":0}]}
```

**Caso de uso real.** Campo nuevo con default mantiene compatibilidad backward.

**Error común.** Eliminar campo requerido sin compatibilidad. Corrección: reglas BACKWARD/FORWARD/FULL.

**Verificación.** **Nota de verificación:** requiere Schema Registry/Kafka/Avro libs.

### Tema 4: Dead Letter Topics · Intermedio · 120 min

Caso guía: mensajes fallidos no bloquean el flujo.

#### DLT

**Definición formal.** Dead Letter Topic/Queue es un destino para mensajes que no pudieron procesarse tras reintentos.

**Para qué sirve.** Aísla poison messages y permite análisis.

**Cuándo usarlo y cuándo no.** Úsalo siempre en consumidores productivos. No lo dejes sin monitoreo.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
node -e "const dlt=[]; function handle(msg){ if(msg.bad) dlt.push(msg); return msg.bad?'DLT':'OK'; } console.log(handle({id:1,bad:false}), handle({id:2,bad:true}), dlt.length)"
```

**Caso de uso real.** Kafka DLT o RabbitMQ DLQ.

**Error común.** Reintentar infinito. Corrección: límite + DLT + alerta.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `OK DLT 1`.

### Tema 5: RabbitMQ: publisher confirms, DLQ · Intermedio · 120 min

Caso guía: confirmar publicación y manejar fallos.

#### Publisher confirms / DLQ

**Definición formal.** Publisher confirms es confirmación del broker de que recibió/persistió el mensaje; DLQ es cola de mensajes muertos.

**Para qué sirve.** Confiabilidad de publicación y manejo de fallos.

**Cuándo usarlo y cuándo no.** Úsalo en mensajes importantes. No asumas publicado sin confirmación.

**Ejemplo mínimo enfocado (ejecutable, simulación).**

```bash
node -e "function publish(msg){ return !!msg; } console.log(publish({id:1})?'ack':'nack')"
```

**Caso de uso real.** Confirm antes de marcar evento como enviado.

**Error común.** No manejar nack. Corrección: retry/DLQ/alerta.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `ack`. **Nota:** RabbitMQ real requiere broker.

### Tema 6: NATS · Intermedio · 90 min

Caso guía: mensajería liviana pub/sub.

#### NATS

**Definición formal.** NATS es un sistema de mensajería ligero de alto rendimiento con pub/sub, request/reply y JetStream para persistencia.

**Para qué sirve.** Comunicación rápida y simple.

**Cuándo usarlo y cuándo no.** Úsalo para mensajería liviana; JetStream si necesitas persistencia. No lo elijas sin evaluar requisitos de durabilidad.

**Ejemplo mínimo enfocado (conceptual).**

```text
PUB orders.created "..."
SUB orders.created
```

**Caso de uso real.** Eventos internos de baja latencia.

**Error común.** Confundir NATS core (sin persistencia por defecto) con JetStream. Corrección: elegir modo adecuado.

**Verificación.** **Nota de verificación:** requiere servidor NATS.

## Cierre del módulo

EDA escala y desacopla, pero exige disciplina: particiones/claves, idempotencia, evolución de esquemas, DLQ y monitoreo. La semántica de entrega se diseña, no se asume.
