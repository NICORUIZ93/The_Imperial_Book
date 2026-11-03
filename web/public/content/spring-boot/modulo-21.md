# Módulo 21: Eventos con Spring Kafka

## Aprende construyendo

Vas a conectar el servicio de envíos con ruteo y notificaciones. El laboratorio del módulo es [`examples/spring-kafka-rutaflow/`](../../../examples/spring-kafka-rutaflow/). Cada tema conserva el proyecto y añade una pieza; no empieza otra aplicación desde cero.

**Cómo estudiar:** completa los cuatro pasos de cada subtema. Cada tema toma 20–45 min; sus subtemas toman 5–15 min.

### Tema 1: Productor, tópico, key y consumidor

**Duración estimada:** 25 min.
**¿Por qué es importante?** La key y el grupo deciden qué servicio recibe el evento y qué orden puede conservar.

**Prerrequisitos:** Spring Boot M1 T1 (crear proyecto) y Spring Boot M2 T1 (DTOs). Usa JDK 25.

#### Subtema 1.1 · Publica el evento con la key del envío · 8 min

**1. Contexto**
Ruteo necesita enterarse cuando nace un envío. La key `envioId` mantiene juntos sus eventos en una partición.

**2. Hazlo tú**
Abre `src/main/java/academia/rutaflow/event/EnvioCreado.java` y `EnvioEventPublisher.java`. Ejecuta esta prueba desde el directorio del laboratorio:

```bash
./mvnw -Dtest=EnvioEventPublisherTest#publicaConKeyDelEnvioYElListenerLaRecibe test
```

**Salida esperada:** `Tests run: 1, Failures: 0, Errors: 0`; el registro tiene tópico, key, partición y offset.

**Fallo deliberado:** en `EnvioEventPublisher.java`, cambia la key de `evento.envioId()` a `evento.eventId()`. **Error esperado:** el listener rechaza la key con `La key no corresponde al envío`. **Diagnóstico:** elegiste la identidad del evento, pero el orden que necesitas conservar es el del envío. Vuelve a `envioId`.

**3. Entiende**
Kafka ordena dentro de una partición. La key decide la partición; no hay orden global entre particiones.

**4. Cierra**
Guarda el test y anota qué valor usaste como key y qué orden protege.

#### Subtema 1.2 · Recibe el evento en dos grupos · 8 min

**1. Contexto**
Ruteo y notificaciones necesitan cada uno una copia del flujo. Un grupo comparte trabajo entre sus instancias; dos grupos leen por separado.

**2. Hazlo tú**
Compara `RuteoListener.java` y `NotificacionListener.java`; observa sus `groupId`. Ejecuta:

```bash
./mvnw -Dtest=EnvioEventPublisherTest#publicaConKeyDelEnvioYElListenerLaRecibe test
```

**Salida esperada:** el mismo evento llega a `rutaflow-ruteo` y `rutaflow-notificaciones`, con la misma partición y offset.

**Fallo deliberado:** asigna `rutaflow-ruteo` a ambos listeners. **Error esperado:** la prueba no encuentra el evento en una de las dos colas. **Diagnóstico:** Kafka repartió el trabajo en un mismo grupo; devuelve a notificaciones su propio `groupId`.

**3. Entiende**
Cada servicio independiente usa su propio grupo. Las réplicas del mismo servicio comparten un grupo para repartirse particiones.

**4. Cierra**
Escribe los dos nombres de grupo y explica en una frase qué cambiaría si fueran iguales.

#### Subtema 1.3 · Comprueba partición y orden · 9 min

**1. Contexto**
Dos cambios del mismo envío deben viajar por la misma partición y conservar su orden.

**2. Hazlo tú**
Abre `EnvioEventPublisherTest.java` y ejecuta la comprobación de dos eventos:

```bash
./mvnw -Dtest=EnvioEventPublisherTest#conservaParticionYOrdenParaDosEventosDelMismoEnvio test
```

**Salida esperada:** `BUILD SUCCESS`; ambos eventos tienen la misma partición y el segundo offset es mayor.

**Fallo deliberado:** cambia el productor para usar `eventId` como key. **Resultado esperado:** la prueba deja de poder asegurar la partición común. **Diagnóstico:** cada evento aleatorio puede elegir otra partición; restaura `envioId`.

**3. Entiende**
Una partición es una secuencia ordenada. Más particiones permiten repartir carga, pero el orden solo se mantiene para la misma partición.

**4. Cierra**
Conserva la salida del test y señala qué pareja de valores demuestra el orden.

**Hito del tema — marca los cuatro solo después de ejecutar:**

- [ ] La key es `envioId`.
- [ ] Dos grupos reciben el evento.
- [ ] Dos eventos de un envío conservan partición y orden.
- [ ] Guardé la salida de las tres pruebas.

**Fuente:** [Spring Boot con Kafka](https://docs.spring.io/spring-boot/reference/messaging/kafka.html) y [Apache Kafka](https://kafka.apache.org/documentation/).

### Tema 2: Reintentos, DLT, entrega al menos una vez e idempotencia

**Duración estimada:** 30 min.
**¿Por qué es importante?** Reintentar con límite y deduplicar protege el servicio ante mensajes inválidos o repetidos.

**Prerrequisitos:** Spring Boot M21 T1 y Spring Boot M3 T1 (persistencia relacional).

#### Subtema 2.1 · Limita reintentos y guarda en DLT · 10 min

**1. Contexto**
Una key incorrecta no se arregla esperando. El consumidor prueba un número limitado de veces y después guarda el mensaje fallido en un tópico de errores.

**2. Hazlo tú**
Abre `KafkaLabConfiguration.java` y `RuteoListener.java`. La política del laboratorio tiene el intento inicial y dos reintentos. Ejecuta:

```bash
./mvnw -Dtest=EnvioEventPublisherTest#reintentaYPublicaEnDltCuandoLaKeyNoCoincide test
```

**Salida esperada:** `BUILD SUCCESS`; el test comprueba tres entregas y lee el evento de `rutaflow.envio.creado-dlt`.

**Fallo deliberado:** cambia `FixedBackOff(100L, 2)` a `FixedBackOff(100L, 0)`. **Resultado esperado:** la prueba de tres intentos falla. **Diagnóstico:** quitaste los dos reintentos; restáuralos.

**3. Entiende**
El recoverer usa `-dlt` por defecto y conserva la partición de origen. Por eso el tópico DLT necesita al menos tantas particiones como el original. DLT conserva el mensaje para que el equipo lo revise; no corrige su causa.

**4. Cierra**
Registra el nombre exacto de la DLT, los intentos y la key que provocó el rechazo.

#### Subtema 2.2 · Evita aplicar el mismo evento dos veces · 10 min

**1. Contexto**
Si el proceso cae después de guardar el efecto pero antes de confirmar el offset, Kafka puede entregar el mensaje otra vez.

**2. Hazlo tú**
Abre `src/main/java/academia/rutaflow/inbox/InboxProcessor.java`. Ejecuta el test que envía el mismo `eventId` dos veces:

```bash
./mvnw -Dtest=EnvioEventPublisherTest#inboxHaceIdempotenteElEfectoDeNegocio test
```

**Salida esperada:** el primer procesamiento devuelve `true`, el repetido `false`; queda una fila en `evento_procesado` y una proyección.

**Fallo deliberado:** elimina la comprobación de `event_id` existente. **Resultado esperado:** la clave primaria rechaza el segundo insert. **Diagnóstico:** cada consumidor necesita deduplicar por `eventId`, dentro de la misma transacción que actualiza su proyección.

**3. Entiende**
La inbox registra qué eventos ya afectaron los datos. `enable.idempotence` del productor no deduplica una escritura SQL del consumidor.

**4. Cierra**
Guarda la salida y distingue la idempotencia del productor de la deduplicación de la inbox.

#### Subtema 2.3 · Revierte inbox y proyección juntas · 10 min

**1. Contexto**
La marca inbox y el cambio de negocio deben confirmarse o revertirse juntos.

**2. Hazlo tú**
Abre `EnvioEventPublisherTest.java` y ejecuta el caso que provoca un error después de actualizar la proyección:

```bash
./mvnw -Dtest=EnvioEventPublisherTest#revierteInboxYProyeccionJuntasCuandoLaActualizacionFalla test
```

**Salida esperada:** la prueba confirma que no queda ni marca inbox ni proyección; al reintentar, el evento sí se procesa.

**Fallo deliberado:** quita `@Transactional` de `InboxProcessor.procesar`. **Resultado esperado:** tras el fallo puede quedar una de las dos escrituras. **Diagnóstico:** ambas modificaciones deben compartir la transacción SQL.

**3. Entiende**
La entrega puede repetirse; una transacción local hace que el reintento no deje el evento marcado sin su efecto de negocio.

**4. Cierra**
Anota qué filas desaparecieron en el rollback y cuáles se crean al reintentar.

**Hito del tema — marca los cuatro solo después de ejecutar:**

- [ ] Un mensaje agotado termina en `-dlt` tras dos reintentos.
- [ ] La inbox usa `eventId` como clave única.
- [ ] Repetir el evento deja una sola proyección.
- [ ] Un rollback elimina marca y proyección juntas.

**Fuente:** [Spring Kafka: manejo de errores](https://docs.spring.io/spring-kafka/reference/kafka/annotation-error-handling.html) y [Apache Kafka](https://kafka.apache.org/documentation/).

### Tema 3: Outbox transaccional y flujo de negocio

**Duración estimada:** 30 min.
**¿Por qué es importante?** Outbox permite recuperar el evento si la aplicación cae entre guardar el envío y publicarlo.

**Prerrequisitos:** Spring Boot M21 T2 y Spring Boot M3 T3 (transacciones y migraciones).

#### Subtema 3.1 · Guarda envío y evento en una transacción · 10 min

**1. Contexto**
PostgreSQL y Kafka confirman por separado. Si guardas el envío y el proceso cae antes de publicar, necesitas conservar el evento pendiente.

**2. Hazlo tú**
Abre `CrearEnvioService.java` y `V1__envio_outbox_inbox.sql`. Ejecuta la prueba de rollback:

```bash
./mvnw -Dtest=EnvioEventPublisherTest#guardaEnvioYOutboxEnLaMismaTransaccion test
```

**Salida esperada:** `BUILD SUCCESS`; al provocar rollback no queda ni envío ni fila outbox.

**Fallo deliberado:** mueve la inserción outbox fuera de `@Transactional`. **Resultado esperado:** la prueba detecta una fila fuera del rollback. **Diagnóstico:** envío y evento deben escribirse en la misma transacción de PostgreSQL.

**3. Entiende**
Outbox cierra la ventana entre guardar el negocio y publicar. No hace un commit atómico compartido entre Kafka y PostgreSQL.

**4. Cierra**
Guarda la prueba y localiza las dos inserciones que participan en la transacción.

#### Subtema 3.2 · Publica y marca después del ack · 10 min

**1. Contexto**
El dispatcher publica filas pendientes. Solo las marca publicadas después de que Kafka confirme el envío.

**2. Hazlo tú**
Abre `OutboxDispatcher.java` y ejecuta:

```bash
./mvnw -Dtest=EnvioEventPublisherTest#dispatcherPublicaYMarcaSoloDespuesDelAck test
```

**Salida esperada:** `BUILD SUCCESS`; `published_at` queda lleno para el evento confirmado.

**Fallo deliberado:** mueve el `UPDATE published_at` antes de `kafka.send(...).get(...)`. **Resultado esperado:** un fallo de envío deja la fila marcada aunque Kafka no la aceptó. **Diagnóstico:** espera el ack antes de guardar la marca.

**3. Entiende**
El dispatcher no mantiene una transacción SQL abierta mientras espera al broker. Si cae después del ack y antes de marcar, el evento se publicará otra vez.

**4. Cierra**
Explica qué estado observa el siguiente arranque si Kafka falla antes del ack.

#### Subtema 3.3 · Reproduce el envío y comprueba deduplicación · 10 min

**1. Contexto**
Después del ack, una caída antes de guardar `published_at` puede causar una publicación repetida. La inbox hace seguro ese replay.

**2. Hazlo tú**
Abre `src/test/java/academia/rutaflow/event/EnvioEventPublisherTest.java` y ejecuta la prueba que vuelve a dejar pendiente una fila ya publicada y la entrega de nuevo:

```bash
./mvnw -Dtest=EnvioEventPublisherTest#replayTrasAckConservaUnaSolaProyeccion test
```

**Salida esperada:** se reciben dos publicaciones del mismo `eventId`, pero queda una fila de inbox y una proyección.

**Fallo deliberado:** quita la deduplicación del consumidor y ejecuta la prueba. **Resultado esperado:** el test encuentra más de un efecto o la clave única falla. **Diagnóstico:** conservar el `eventId` permite reconocer la repetición.

**3. Entiende**
Outbox permite recuperar publicaciones; inbox protege el efecto del consumidor. En este laboratorio el dispatcher no reclama filas con lease, así que no ejecutes varias instancias a la vez.

**4. Cierra**
Guarda el resultado y explica por qué el replay puede duplicar mensajes, pero no la proyección.

**Hito del tema — marca los cuatro solo después de ejecutar:**

- [ ] Envío y outbox revierten juntos.
- [ ] El dispatcher marca después del ack.
- [ ] La prueba reproduce una publicación repetida.
- [ ] Inbox deja una sola proyección y anoté el límite de una instancia.

**Fuente:** [Spring Framework: transacciones declarativas](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative.html) y [Transactional Outbox](https://microservices.io/patterns/data/transactional-outbox.html).

## Capstone del módulo

Desde `examples/spring-kafka-rutaflow/`, ejecuta `./mvnw test`. Luego levanta Kafka y PostgreSQL con Compose y arranca la aplicación. Entrega la salida de pruebas, una fila outbox publicada, una fila inbox y una evidencia de DLT.

**Cuándo no usar Kafka:** si el servicio necesita una respuesta inmediata de una única llamada interna, empieza con HTTP. Kafka añade retención, grupos, offsets y operación.

**Fuentes oficiales:** [Spring Boot Kafka](https://docs.spring.io/spring-boot/reference/messaging/kafka.html), [Spring Kafka: errores y dead-letter](https://docs.spring.io/spring-kafka/reference/kafka/annotation-error-handling.html), [Apache Kafka](https://kafka.apache.org/documentation/).
