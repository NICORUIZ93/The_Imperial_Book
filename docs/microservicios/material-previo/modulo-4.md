# Curso Microservicios · Mensajería fiable entre servicios

## Aprende construyendo

Cuando Envíos crea un envío, Facturación, Notificaciones y Tracking necesitan saberlo. Si Envíos los llama uno por uno, cada caída de un consumidor rompe la creación de envíos. Si publica un mensaje «después de guardar», un fallo en el momento justo pierde el mensaje o publica uno falso. En este módulo separas eventos de dominio y de integración, guardas el evento en la misma transacción que el cambio (outbox), lo publicas por sondeo o leyendo el log de PostgreSQL, y construyes consumidores que aguantan duplicados, desorden, mensajes venenosos y cambios de esquema.

**Hito RutaFlow:** `EnvioCreado` sale por outbox. Un duplicado inyectado no produce dos efectos.

Este módulo reescribe DevOps M20 T1 (eventos de dominio e integración), M20 T2 (outbox), M20 T3 (idempotencia y orden) y la parte de eventos de dominio de M19 T3. Amplía M0 T5 (clave idempotente en HTTP) y M0 T7 (orden por versión) sin repetirlos.

## Entorno del módulo

- **JDK 25** y **PostgreSQL 16** con el cliente `psql`. Los scripts usan funciones disponibles desde PostgreSQL 13 (`gen_random_uuid`) y se ejecutaron con PostgreSQL 16.15.
- Laboratorio: `examples/microservices-rutaflow/m4/` (programas Java en la raíz y SQL en `sql/`).

```bash
cp -R examples/microservices-rutaflow/m4 academia-labs/microservices/m4
cd academia-labs/microservices/m4
```

- PostgreSQL con Docker. `wal_level=logical` hace falta en T3:

```bash
docker run --name rutaflow-pg -e POSTGRES_PASSWORD=rutaflow -p 5432:5432 -d postgres:16 -c wal_level=logical
export PGHOST=127.0.0.1 PGPORT=5432 PGUSER=postgres PGPASSWORD=rutaflow
psql -d postgres -c 'CREATE DATABASE rutaflow'
export PGDATABASE=rutaflow
```

Si no tienes `psql` en tu equipo, en macOS lo instala `brew install libpq` (sigue las instrucciones para añadirlo al `PATH`). Con las variables `PG*` exportadas, todos los comandos `psql` del módulo funcionan sin más argumentos.

- Los programas Java usan solo el JDK y se ejecutan con el lanzador de un archivo: `java Archivo.java`. El publicador JDBC de T2 es un proyecto Maven aparte en `outbox-jdbc/`.

### Tema 1: Eventos de dominio y de integración; mensaje frente a llamada · Intermedio · 40 min

**Prerrequisito:** «Contextos delimitados y mapa de contextos» (referencia interna M2 T1).

**Objetivo observable:** registrar un evento de dominio dentro del agregado `Envio`, traducirlo a un evento de integración sin datos personales y decidir cuándo una colaboración debe ser un mensaje y cuándo una llamada.

**¿Por qué es importante?** Un evento de dominio dice que algo ocurrió dentro de un contexto. Un evento de integración es el contrato que ese contexto publica para los demás. Si publicas el objeto interno tal cual, cualquier campo nuevo, incluidos datos personales, sale de la frontera sin que nadie lo decida.

#### Subtema 4.1.1: Nombra hechos, no órdenes · 8 min

**Contexto:** `EnvioCreado` dice algo que ya pasó y nadie puede rechazarlo. `CrearFactura` es una orden, y el receptor sí puede rechazarla.

**Hazlo tú:** clasifica estos nombres en `evidencia/eventos.md` como **evento** (hecho en pasado) u **orden** (petición):

```text
EnvioCreado, AsignarConductor, CotizacionEmitida, NotificarCliente, EnvioDespachado, ReservarCupo
```

**Resultado esperado:** eventos: `EnvioCreado`, `CotizacionEmitida`, `EnvioDespachado`. Órdenes: `AsignarConductor`, `NotificarCliente`, `ReservarCupo`.

**Fallo deliberado:** publica `NotificarCliente` como evento de Envíos. **Diagnóstico:** Envíos estaría decidiendo qué hace Notificaciones. Si mañana el cliente prefiere SMS o no quiere avisos, cambias Envíos. Publica el hecho (`EnvioCreado`) y deja que cada consumidor decida qué hacer.

**Entiende:** un evento no tiene destinatario. El productor no sabe quién lo consume, y por eso agregar un consumidor no cambia al productor.

**Cierra:** guarda la clasificación.

#### Subtema 4.1.2: Registra el evento dentro del agregado · 10 min

**Contexto:** como en M2 T1, el agregado protege su invariante y registra el hecho en el mismo cambio de estado.

**Hazlo tú:**

```bash
java EventosRutaflow.java | head -1
```

**Resultado esperado:**

```text
DOMINIO EnvioCreado[envioId=E-100, clienteId=CL-9, pesoKg=2.5, zona=Z03, direccionCompleta=Cra 7 # 72-10 apto 301, telefonoReceptor=+57 300 000 0000, ocurridoEn=2026-11-18T15:00:00Z]
```

**Fallo deliberado:** en `main`, crea el envío con `new BigDecimal("0")`. **Diagnóstico:** `IllegalArgumentException: peso debe ser positivo: 0` y no se registra ningún evento. Ningún evento debe describir un estado que el agregado rechazó.

**Entiende:** el evento de dominio es rico porque vive dentro del contexto Envíos: lleva la dirección y el teléfono que Envíos necesita para su propio trabajo.

**Cierra:** anota qué campos del evento de dominio son internos.

#### Subtema 4.1.3: Traduce a un evento de integración sin fugas · 12 min

**Contexto:** el contrato público lleva `eventoId` (para deduplicar, T4), `tipo`, `version` (para evolucionar, T6) y solo los datos que otros contextos necesitan.

**Hazlo tú:**

```bash
java EventosRutaflow.java | sed -n 2,3p
```

**Resultado esperado:**

```text
PUBLICADO {eventoId=00000000-0000-0000-0000-000000000001, tipo=EnvioCreado, version=1, envioId=E-100, clienteId=CL-9, zona=Z03, pesoKg=2.5, ocurridoEn=2026-11-18T15:00:00Z}
SIN_FUGAS
```

**Fallo deliberado:**

```bash
java EventosRutaflow.java --publicar-dominio | sed -n 2,3p
```

```text
PUBLICADO EnvioCreado[envioId=E-100, clienteId=CL-9, pesoKg=2.5, zona=Z03, direccionCompleta=Cra 7 # 72-10 apto 301, telefonoReceptor=+57 300 000 0000, ocurridoEn=2026-11-18T15:00:00Z]
FUGA [telefonoReceptor, direccionCompleta]
```

**Diagnóstico:** el objeto interno salió completo con el teléfono y la dirección del receptor. Ahora cualquier consumidor los guarda, y borrarlos por una solicitud de privacidad exige rastrear todos los sistemas.

**Entiende:** la traducción `aIntegracion` es la capa anticorrupción del productor: decide qué sale y con qué nombres. Si Notificaciones necesita el teléfono, lo pide de forma explícita y queda escrito en el contrato.

**Cierra:** guarda el evento de integración como contrato `EnvioCreado v1`.

#### Subtema 4.1.4: Decide entre mensaje y llamada · 10 min

**Contexto:** ni todo debe ser asíncrono ni todo debe ser HTTP. La pregunta es si quien pide necesita la respuesta para continuar.

**Hazlo tú:**

```bash
java EventosRutaflow.java | tail -3
```

**Resultado esperado:**

```text
Cotizar antes de crear el envio -> LLAMADA
Avisar a Facturacion que se creo -> MENSAJE
Notificar al cliente por correo   -> MENSAJE
```

**Fallo deliberado:** convierte la cotización en mensaje. **Diagnóstico:** el cliente crea un envío sin conocer el precio y recibe el total «más tarde». La experiencia cambió de forma que nadie decidió. Si la respuesta es necesaria para continuar, la colaboración es una llamada, con los límites de M0 y M3.

**Entiende:** un mensaje desacopla en el tiempo: el productor no espera, y el consumidor puede estar caído y procesar después. El precio es la consistencia eventual y la necesidad de manejar duplicados y desorden. microservices.io trata *Messaging* y *Remote Procedure Invocation* como estilos de comunicación distintos, cada uno con sus costos.

**Cierra:** agrega tres colaboraciones de RutaFlow a la tabla con su estilo y su motivo.

#### Hito del tema

- [ ] Separé hechos de órdenes en seis nombres.
- [ ] Registré `EnvioCreado` dentro del agregado y vi que un envío inválido no produce evento.
- [ ] Reproduje la fuga de datos personales y la corregí con el evento de integración.
- [ ] Decidí mensaje o llamada según si hace falta la respuesta para continuar.

#### Ejercicio

Tracking necesita la ciudad de destino para mostrar «en camino a Medellín», pero no la dirección completa. Cambia el contrato sin romper a los consumidores actuales y comprueba que el detector sigue diciendo `SIN_FUGAS`.

<details>
<summary>Solución — ábrela después de intentarlo</summary>

Agrega `ciudadDestino` al evento de dominio (Envíos la conoce) y publícala en el de integración:

```java
mensaje.put("ciudadDestino", e.ciudadDestino());
```

Es un campo **nuevo y opcional para el consumidor**, así que sigue siendo `version=1`: los consumidores tolerantes lo ignoran (T6). La ciudad no identifica a nadie por sí sola, así que `camposSensibles` sigue sin encontrar nada. Si alguien propone publicar `direccionCompleta` «porque Tracking quizá la use», la respuesta es no: el contrato crece cuando un consumidor necesita un dato, no por si acaso.

</details>

**Fuentes primarias:** [microservices.io: Domain event](https://microservices.io/patterns/data/domain-event.html), [microservices.io: Messaging](https://microservices.io/patterns/communication-style/messaging.html) y [Azure: Publisher-Subscriber](https://learn.microsoft.com/en-us/azure/architecture/patterns/publisher-subscriber).

**Siguiente tema:** «Outbox transaccional con polling publisher» (referencia interna M4 T2).

### Tema 2: Outbox transaccional con polling publisher en PostgreSQL · Avanzado · 45 min

**Prerrequisito:** tema anterior y SQL básico (Fundamentos M4).

**Objetivo observable:** reproducir los dos fallos de la escritura doble, guardar envío y evento en una transacción, publicar con dos relays en paralelo sin que se bloqueen y explicar por qué el resultado es «al menos una vez».

**¿Por qué es importante?** microservices.io lo plantea así: ¿cómo actualizas la base de datos y envías un mensaje de forma atómica, sin transacción distribuida? La respuesta es el **outbox transaccional**: el mensaje se guarda en una tabla de la misma base, en la misma transacción que el cambio, y un proceso aparte lo envía al broker. Así el mensaje se envía si y solo si la transacción confirma.

```mermaid
sequenceDiagram
  participant S as Servicio Envíos
  participant DB as PostgreSQL
  participant R as Relay
  participant B as Broker
  S->>DB: BEGIN; INSERT envios; INSERT outbox; COMMIT
  loop cada 500 ms
    R->>DB: SELECT ... FOR UPDATE SKIP LOCKED
    R->>B: publicar
    R->>DB: UPDATE publicado_en; COMMIT
  end
```

#### Subtema 4.2.1: Reproduce la escritura doble · 10 min

**Contexto:** guardar en la base y publicar en el broker son dos sistemas sin una transacción común. Un proceso puede morir entre los dos.

**Hazlo tú:**

```bash
java EscrituraDoble.java guardar-y-publicar
java EscrituraDoble.java publicar-y-guardar
```

**Resultado esperado:**

```text
FALLO el proceso murio despues del COMMIT y antes de publicar
envios=[E-1] broker=[]
INCOHERENTE
FALLO COMMIT fallido: violacion de restriccion
envios=[] broker=[EnvioCreado E-1]
INCOHERENTE
```

**Diagnóstico:** en el primer orden se pierde el evento: Facturación nunca cobra el envío. En el segundo se publica un evento falso: Facturación cobra un envío que no existe. Cambiar el orden solo cambia qué error obtienes.

**Entiende:** ningún orden resuelve el problema porque no hay atomicidad entre los dos sistemas. microservices.io descarta la transacción distribuida (2PC) para este caso. El outbox hace que la única escritura atómica sea la de la base.

**Cierra:** guarda las dos salidas.

#### Subtema 4.2.2: Guarda envío y evento en la misma transacción · 10 min

**Contexto:** `sql/01-esquema.sql` crea `envios` y `outbox`. La columna `publicado_en` es `NULL` mientras el mensaje está pendiente, y un índice parcial cubre solo las filas pendientes.

**Hazlo tú:**

```bash
java EscrituraDoble.java outbox
psql -v ON_ERROR_STOP=1 -f sql/01-esquema.sql
psql -v ON_ERROR_STOP=1 -v envio=E-1 -v peso=2.5 -f sql/02-crear-envio.sql
psql -c "SELECT id, tipo, agregado_id, publicado_en IS NULL AS pendiente FROM outbox"
```

**Resultado esperado:**

```text
FALLO el proceso murio despues del COMMIT y antes del relay
REINICIO: el relay lee la tabla outbox
envios=[E-1] broker=[EnvioCreado E-1]
COHERENTE
...
 id |    tipo     | agregado_id | pendiente 
----+-------------+-------------+-----------
  1 | EnvioCreado | E-1         | t
(1 row)
```

**Fallo deliberado:** `sql/02b-falla-el-outbox.sql` inserta el envío `E-9` y luego un payload JSON inválido en el outbox, dentro de la misma transacción:

```bash
psql -f sql/02b-falla-el-outbox.sql
```

```text
BEGIN
INSERT 0 1
psql:sql/02b-falla-el-outbox.sql:5: ERROR:  invalid input syntax for type json
...
ROLLBACK
 envios_e9 
-----------
         0
```

**Diagnóstico:** el `COMMIT` terminó en `ROLLBACK` y el envío tampoco quedó. O se guardan los dos o ninguno: esa es la garantía que necesitas.

**Entiende:** el caso de la caída también queda cubierto: si el proceso muere después del `COMMIT`, el mensaje sigue en la tabla y el relay lo envía al reiniciar. Por eso el modo `outbox` termina `COHERENTE`.

**Cierra:** guarda las dos salidas de `psql`.

#### Subtema 4.2.3: Publica con dos relays sin bloquearlos · 13 min

**Contexto:** el *polling publisher* consulta la tabla cada cierto tiempo. Con varias instancias, cada una debe tomar filas distintas. `FOR UPDATE SKIP LOCKED` bloquea las filas elegidas y salta las que otro relay ya bloqueó.

**Hazlo tú:** carga cuatro eventos pendientes y lanza el relay A (tarda 3 s en «publicar») y, medio segundo después, el relay B:

```bash
psql -q -f sql/00-reiniciar-outbox.sql
psql -v relay=A -v espera=3 -f sql/03-reclamar-lote.sql &
sleep 0.5; psql -v relay=B -v espera=0 -f sql/03-reclamar-lote.sql; wait
```

**Resultado esperado (las horas cambian):**

```text
relay B reclamo ids=[3,4] a las 20:39:16
relay B confirmo ids=[3,4] a las 20:39:16
relay A reclamo ids=[1,2] a las 20:39:16
relay A confirmo ids=[1,2] a las 20:39:19
```

**Fallo deliberado:** repite sin `SKIP LOCKED` en el relay B:

```bash
psql -q -f sql/00-reiniciar-outbox.sql
psql -v relay=A -v espera=3 -f sql/03-reclamar-lote.sql &
sleep 0.5; psql -v relay=B -v espera=0 -v bloqueo= -f sql/03-reclamar-lote.sql; wait
```

```text
relay A reclamo ids=[1,2] a las 20:39:20
relay B reclamo ids=[3,4] a las 20:39:23
relay A confirmo ids=[1,2] a las 20:39:23
```

**Diagnóstico:** B quedó esperando casi 3 s a que A soltara las filas 1 y 2. Sin `SKIP LOCKED`, agregar relays no aumenta la capacidad: se forman en fila.

**Entiende:** observa el orden: B publicó 3 y 4 antes de que A confirmara 1 y 2. microservices.io advierte que con el polling publisher es difícil publicar en orden. Si el orden importa por envío, los eventos del mismo agregado deben ir al mismo relay o el consumidor debe ordenar por versión (T5).

**Cierra:** guarda las dos salidas con sus horas.

#### Subtema 4.2.4: Publica desde Java y acepta «al menos una vez» · 12 min

**Contexto:** `outbox-jdbc/` contiene el relay en Java: reclama un lote con `FOR UPDATE SKIP LOCKED`, lo entrega a un `Broker` (aquí imprime en consola) y marca `publicado_en` antes del `COMMIT`. Es un proyecto Maven con el driver `org.postgresql:postgresql:42.7.14`.

**Hazlo tú:**

```bash
psql -q -f sql/00-reiniciar-outbox.sql
cd outbox-jdbc
PGURL=jdbc:postgresql://127.0.0.1:5432/rutaflow mvn -q compile exec:java -Dexec.args=--una-vez
```

**Resultado esperado:** cuatro líneas `BROKER <- EnvioCreado evento=<uuid> {...}` y `LOTE publicados=4`. Una segunda ejecución imprime `LOTE publicados=0`. Esta salida se dedujo del código: el proyecto compila con el JDK, pero la ejecución con Maven y el driver está pendiente de verificación en el Mac (`verificacion/microservicios-pendiente.md`).

**Fallo deliberado:**

```bash
psql -q -f ../sql/00-reiniciar-outbox.sql
mvn -q compile exec:java -Dexec.args="--una-vez --caer-tras-publicar"
mvn -q compile exec:java -Dexec.args=--una-vez
```

**Diagnóstico:** la primera ejecución publica los cuatro mensajes y muere antes del `COMMIT` (`CAIDA tras publicar 4 mensaje(s) y antes del COMMIT`). La transacción no se confirmó, así que las filas siguen pendientes y la segunda ejecución vuelve a publicar los mismos cuatro `evento=<uuid>`. El broker los recibió dos veces.

**Entiende:** no existe un orden de pasos que evite esto: publicar y marcar siguen siendo dos sistemas. microservices.io lo dice de forma explícita: el relay puede publicar un mensaje más de una vez, y por eso el consumidor debe ser idempotente. El outbox cambia «perder o inventar» por «quizá repetir», y lo repetido se resuelve con `evento_id` en el consumidor (T4).

**Cierra:** anota los `evento_id` repetidos. Los usarás en T4.

#### Hito del tema

- [ ] Reproduje los dos fallos de la escritura doble.
- [ ] Demostré que un fallo en el outbox revierte también el envío.
- [ ] Ejecuté dos relays en paralelo y vi la espera sin `SKIP LOCKED`.
- [ ] Expliqué por qué el outbox entrega al menos una vez.

#### Ejercicio

La tabla `outbox` crece sin límite. Escribe la limpieza: borra los mensajes publicados hace más de 7 días, en lotes de 1000 filas para no bloquear al relay.

<details>
<summary>Solución — ábrela después de intentarlo</summary>

```sql
DELETE FROM outbox
WHERE id IN (
  SELECT id FROM outbox
  WHERE publicado_en < now() - interval '7 days'
  ORDER BY id
  LIMIT 1000
  FOR UPDATE SKIP LOCKED);
```

Se repite mientras devuelva `DELETE 1000`. El índice parcial `outbox_pendientes` no ayuda aquí porque solo cubre pendientes. Si la tabla es grande, conviene un índice sobre `publicado_en`. Los 7 días deben superar el tiempo que necesitas para investigar un incidente con el outbox como evidencia. Los lotes de 1000 filas mantienen cortas las transacciones de limpieza.

</details>

**Fuentes primarias:** [microservices.io: Transactional outbox](https://microservices.io/patterns/data/transactional-outbox.html), [microservices.io: Polling publisher](https://microservices.io/patterns/data/polling-publisher.html) y [PostgreSQL 16: cláusula de bloqueo `SKIP LOCKED`](https://www.postgresql.org/docs/16/sql-select.html#SQL-FOR-UPDATE-SHARE).

**Variante Spring:** la implementación con Spring Boot está en Spring Boot M8 y M13 T2.

**Siguiente tema:** «Transaction log tailing (CDC)» (referencia interna M4 T3).

### Tema 3: Transaction log tailing (CDC): qué cambia y qué cuesta · Avanzado · 40 min

**Prerrequisito:** tema anterior.

**Objetivo observable:** leer los `INSERT` del outbox desde el WAL de PostgreSQL con un slot de replicación lógica, distinguir mirar de consumir y medir el WAL que retiene un slot sin consumidor.

**¿Por qué es importante?** En lugar de consultar la tabla cada cierto tiempo, el relay puede leer el **log de transacciones** de la base y publicar cada fila que entra al outbox. microservices.io nombra el WAL de PostgreSQL y el binlog de MySQL como mecanismos y señala las desventajas: depende de cada base de datos y evitar publicaciones duplicadas es difícil.

#### Subtema 4.3.1: Activa la decodificación lógica · 10 min

**Contexto:** PostgreSQL solo escribe en el WAL la información necesaria para decodificar cambios fila por fila si `wal_level` vale `logical`. El valor por defecto es `replica`.

**Hazlo tú:**

```bash
psql -Atc "SHOW wal_level"
psql -q -f sql/00-reiniciar-outbox.sql
psql -f sql/04-cdc.sql
```

Si repites el tema y el slot ya existe, bórralo antes con `psql -f sql/08-borrar-slot.sql`.

**Resultado esperado** (con el contenedor del entorno, que ya arranca con `-c wal_level=logical`):

```text
logical
             paso             
------------------------------
 slot creado: rutaflow_outbox
```

**Fallo deliberado:** con un PostgreSQL que use el valor por defecto, el mismo script falla:

```text
replica
ERROR:  logical decoding requires wal_level >= logical
```

**Diagnóstico:** `wal_level` solo cambia al reiniciar el servidor. Con Docker, vuelve a crear el contenedor con `-c wal_level=logical`. En un servidor administrado es un parámetro del proveedor y a veces exige una ventana de mantenimiento.

**Entiende:** el **slot de replicación** recuerda hasta dónde leyó el consumidor. `test_decoding` es un plugin de ejemplo que trae PostgreSQL y escribe cada cambio como texto. En producción se usa `pgoutput` o una herramienta de CDC.

**Cierra:** guarda la salida y el valor de `wal_level`.

#### Subtema 4.3.2: Mira y consume cambios · 10 min

**Contexto:** `pg_logical_slot_peek_changes` muestra los cambios sin avanzar el slot. `pg_logical_slot_get_changes` los entrega y avanza.

**Hazlo tú:**

```bash
psql -q -v envio=E-5 -v peso=1 -f sql/02-crear-envio.sql
psql -At -f sql/05-leer-cambios.sql | cut -c1-140
psql -At -f sql/05-leer-cambios.sql | wc -l
psql -At -v consumir=1 -f sql/05-leer-cambios.sql | wc -l
psql -At -f sql/05-leer-cambios.sql | wc -l
```

**Resultado esperado:** la línea del cambio (el LSN, el `xid` y el UUID cambian):

```text
0/36CFA20|828|table public.outbox: INSERT: id[bigint]:5 evento_id[uuid]:'fb1e23f2-a55e-4047-b131-4a71fd45528d' agregado_id[text]:'E-5' tipo[
```

y los conteos `1`, `1` y `0`: mirar otra vez no consume, `get` entrega el cambio y avanza el slot, y la lectura siguiente ya no lo encuentra.

**Fallo deliberado:** consume con `get`, imagina que el relay muere antes de publicar y vuelve a leer. **Diagnóstico:** el cambio ya no está: se perdió el mensaje. Un relay correcto mira (`peek`), publica y solo después avanza el slot, en SQL con `pg_replication_slot_advance`. Si muere entre publicar y avanzar, vuelve a publicar, que es la misma garantía de «al menos una vez» que en T2.

**Entiende:** el CDC no elimina los duplicados. Cambia la consulta periódica por un flujo de cambios y te ata a una función específica de la base.

**Cierra:** guarda los cuatro conteos y explica cada uno.

#### Subtema 4.3.3: Mide el WAL que retiene un slot · 12 min

**Contexto:** mientras el consumidor no confirme, PostgreSQL conserva todo el WAL desde ese punto. Un slot abandonado puede llenar el disco.

**Hazlo tú:** genera 10 000 envíos sin consumir y mide:

```bash
psql -q -f sql/07-generar-carga.sql
psql -f sql/06-wal-retenido.sql
psql -At -v consumir=1 -f sql/05-leer-cambios.sql | wc -l
psql -f sql/06-wal-retenido.sql
psql -c CHECKPOINT
psql -At -v consumir=1 -f sql/05-leer-cambios.sql | wc -l
psql -f sql/06-wal-retenido.sql
```

**Resultado esperado** (los tamaños varían un poco; `sin_confirmar` puede quedar en unas decenas de bytes en vez de 0):

```text
    slot_name    | active | wal_retenido | sin_confirmar 
-----------------+--------+--------------+---------------
 rutaflow_outbox | f      | 5399 kB      | 5399 kB
10000
 rutaflow_outbox | f      | 5399 kB      | 0 bytes
CHECKPOINT
0
 rutaflow_outbox | f      | 176 bytes    | 0 bytes
```

**Diagnóstico:** al consumir, `sin_confirmar` baja a cero de inmediato, pero `wal_retenido` no. El punto desde el que se conserva WAL (`restart_lsn`) avanza después, cuando PostgreSQL registra un punto de reinicio. Aquí lo provocas con `CHECKPOINT` y una nueva lectura. Si nadie consume, `wal_retenido` crece sin límite.

**Entiende:** borra el slot cuando no lo uses:

```bash
psql -f sql/08-borrar-slot.sql
```

En producción se vigila `pg_replication_slots` con una alerta y se puede fijar `max_slot_wal_keep_size` para que PostgreSQL invalide el slot antes de llenar el disco. Ese límite cambia un disco lleno por un consumidor que debe recuperarse desde cero.

**Cierra:** guarda las tres mediciones y escribe la alerta que pondrías.

#### Subtema 4.3.4: Elige entre sondeo y log · 8 min

**Contexto:** las dos técnicas publican el mismo outbox. Lo que cambia es cómo se enteran de las filas nuevas.

**Hazlo tú:** completa la tabla en tu ADR:

| Criterio | Polling publisher (T2) | Transaction log tailing (T3) |
|---|---|---|
| Base de datos | Cualquiera con SQL | Una función específica de cada base |
| Latencia | Intervalo de sondeo | Poco después del `COMMIT` |
| Carga en la base | Consultas periódicas | Decodificación del WAL |
| Operación | Un proceso más | Slot, `wal_level` y vigilancia del WAL retenido |
| Duplicados | Al menos una vez | Al menos una vez |

**Resultado esperado:** una decisión con su motivo. Para RutaFlow con un relay y un intervalo de 500 ms, el sondeo basta. El CDC compensa cuando la latencia o la carga de las consultas lo justifican.

**Fallo deliberado:** elige CDC «porque es más moderno». **Diagnóstico:** sumas `wal_level`, slots y alertas de disco sin un problema medido que los justifique.

**Entiende:** las dos técnicas entregan al menos una vez. Lo que eliges es dónde pagar: en consultas periódicas o en operar el log.

**Cierra:** registra la decisión en el ADR.

#### Hito del tema

- [ ] Reproduje el error sin `wal_level=logical` y creé un slot.
- [ ] Distinguí `peek` de `get` con conteos.
- [ ] Medí WAL retenido antes y después de consumir, y borré el slot.
- [ ] Elegí entre sondeo y log con criterios escritos.

#### Ejercicio

Escribe la secuencia SQL de un relay que mira, «publica» y avanza el slot solo hasta el último cambio publicado, usando `pg_replication_slot_advance`.

<details>
<summary>Solución — ábrela después de intentarlo</summary>

```sql
-- 1. Mirar sin consumir y quedarse con el último LSN visto
SELECT max(lsn) AS hasta
FROM pg_logical_slot_peek_changes('rutaflow_outbox', NULL, 100)
\gset
-- 2. Publicar al broker cada cambio hasta :hasta (fuera de SQL)
-- 3. Avanzar el slot hasta lo publicado
SELECT * FROM pg_replication_slot_advance('rutaflow_outbox', :'hasta');
```

Si el relay muere entre 2 y 3, el slot no avanzó y la siguiente lectura repite los mismos cambios: al menos una vez, con duplicados que resuelve el consumidor. Si avanzas antes de publicar, cambias duplicados por pérdidas, que es el error de `get` del subtema 4.3.2. Si `peek` no devuelve filas, `:hasta` queda vacío y el paso 3 no debe ejecutarse.

</details>

**Fuentes primarias:** [microservices.io: Transaction log tailing](https://microservices.io/patterns/data/transaction-log-tailing.html), [PostgreSQL 16: decodificación lógica](https://www.postgresql.org/docs/16/logicaldecoding.html), [PostgreSQL 16: funciones de replicación](https://www.postgresql.org/docs/16/functions-admin.html#FUNCTIONS-REPLICATION) y [PostgreSQL 16: `wal_level` y `max_slot_wal_keep_size`](https://www.postgresql.org/docs/16/runtime-config-wal.html).

**Siguiente tema:** «Consumidor idempotente con tabla inbox» (referencia interna M4 T4).

### Tema 4: Consumidor idempotente con tabla inbox · Avanzado · 40 min

**Prerrequisito:** «Evitar efectos duplicados con una clave idempotente» (referencia interna M0 T5) y temas 2 y 3 de este módulo.

**Objetivo observable:** procesar dos veces el mismo evento y obtener un solo efecto, demostrar que registrar y aplicar en transacciones separadas duplica el efecto y fijar una ventana de purga que no reabra la puerta a los duplicados.

**¿Por qué es importante?** El outbox y el broker entregan al menos una vez. microservices.io define el consumidor idempotente: procesar el mismo mensaje varias veces debe dar el mismo resultado que procesarlo una vez. La técnica es guardar el identificador de cada mensaje procesado en una tabla con clave primaria `(consumidor, mensaje)`, en la misma transacción que el efecto. M0 T5 lo hizo con una cabecera HTTP. Aquí lo haces con eventos.

#### Subtema 4.4.1: Recibe un duplicado · 8 min

**Contexto:** en T2 el relay publicó dos veces los mismos `evento_id`. Notificaciones, sin protección, enviaría dos correos.

**Hazlo tú:** prepara las tablas del consumidor:

```bash
psql -q -f sql/10-inbox.sql
```

`sql/10-inbox.sql` crea `inbox` con `PRIMARY KEY (consumidor, evento_id)` y `notificaciones`, que representa el efecto.

**Resultado esperado:** dos tablas vacías.

**Fallo deliberado:** pon la clave primaria solo en `evento_id`. **Diagnóstico:** si Facturación y Notificaciones comparten la tabla, el primero que procesa el evento impide que el otro lo procese. Cada consumidor lleva su propio registro.

**Entiende:** el `eventoId` del contrato de T1 existe para esto. Sin un identificador estable por evento, el consumidor no puede distinguir un duplicado de un evento nuevo con el mismo contenido.

**Cierra:** guarda el esquema.

#### Subtema 4.4.2: Registra y aplica en una sola transacción · 12 min

**Contexto:** `sql/11-procesar.sql` inserta en `inbox` con `ON CONFLICT DO NOTHING` y solo crea la notificación si esa inserción devolvió una fila.

```sql
WITH nuevo AS (
  INSERT INTO inbox (consumidor, evento_id) VALUES ('notificaciones', :'evento')
  ON CONFLICT DO NOTHING
  RETURNING evento_id
)
INSERT INTO notificaciones (envio_id, texto)
SELECT :'envio', 'Tu envio ' || :'envio' || ' fue creado' FROM nuevo;
```

**Hazlo tú:**

```bash
EV=6f1c2d3e-0000-4000-8000-000000000001
psql -v evento=$EV -v envio=E-1 -f sql/11-procesar.sql
psql -v evento=$EV -v envio=E-1 -f sql/11-procesar.sql
psql -c "SELECT count(*) AS notificaciones FROM notificaciones"
```

**Resultado esperado:**

```text
BEGIN
INSERT 0 1
COMMIT
BEGIN
INSERT 0 0
COMMIT
 notificaciones 
----------------
              1
```

Este es el hito del módulo: el duplicado inyectado no produjo un segundo efecto.

**Fallo deliberado:** quita `ON CONFLICT DO NOTHING`. **Diagnóstico:** la segunda ejecución falla con `duplicate key value violates unique constraint "inbox_pkey"` y la transacción se revierte. No hay efecto doble, pero el consumidor trata un duplicado normal como un error y el broker lo reintentaría sin fin. Un duplicado es un caso esperado, no una excepción.

**Entiende:** la garantía viene de que la base confirma las dos filas juntas o ninguna. Si el efecto es externo (un correo de verdad), esta técnica no basta: el correo puede salir y la transacción fallar después. Para efectos externos se usa una clave idempotente en el proveedor (M0 T5) o un outbox del propio consumidor.

**Cierra:** guarda la salida como evidencia del hito.

#### Subtema 4.4.3: Fallo deliberado: registrar en otra transacción · 10 min

**Contexto:** una versión «más simple» comprueba el inbox, aplica el efecto y registra el inbox en pasos separados.

**Hazlo tú:**

```bash
psql -q -f sql/10-inbox.sql
psql -v evento=$EV -v envio=E-1 -v caer=1 -f sql/12-procesar-mal.sql
psql -v evento=$EV -v envio=E-1 -f sql/12-procesar-mal.sql
psql -v evento=$EV -v envio=E-1 -f sql/12-procesar-mal.sql
psql -c "SELECT count(*) AS notificaciones FROM notificaciones"
```

**Resultado esperado del fallo:**

```text
INSERT 0 1
el proceso murio despues del efecto y antes de registrar el inbox
INSERT 0 1
INSERT 0 1
evento 6f1c2d3e-0000-4000-8000-000000000001 ya procesado: se ignora
 notificaciones 
----------------
              2
```

**Diagnóstico:** la primera ejecución aplicó el efecto y murió antes de registrar. El broker reentregó y el consumidor no encontró el evento en el inbox, así que aplicó el efecto otra vez. La tercera ejecución sí lo ignora, pero ya hay dos notificaciones.

**Entiende:** la comprobación previa no protege nada si el registro no es atómico con el efecto. Es el mismo problema de la escritura doble de T2, ahora del lado del consumidor.

**Cierra:** guarda la salida y señala la línea donde el proceso murió.

#### Subtema 4.4.4: Purga el inbox sin reabrir los duplicados · 10 min

**Contexto:** la tabla `inbox` crece con cada evento. Purgarla es necesario, pero si borras un registro antes de que pase la última reentrega posible, ese duplicado vuelve a producir efecto.

**Hazlo tú:**

```bash
psql -q -f sql/10-inbox.sql
psql -q -v evento=$EV -v envio=E-1 -f sql/11-procesar.sql
psql -c "UPDATE inbox SET procesado_en = now() - interval '3 days'"
psql -v dias=1 -f sql/13-purgar-inbox.sql
psql -v evento=$EV -v envio=E-1 -f sql/11-procesar.sql
psql -Atc "SELECT count(*) FROM notificaciones"
```

**Resultado esperado del fallo:** `DELETE 1`, luego `INSERT 0 1` y un conteo de `2`.

**Diagnóstico:** el registro tenía 3 días y la purga borró todo lo mayor a 1 día. La reentrega llegó después y se procesó como nueva. La ventana de purga debe superar el tiempo máximo de reentrega: retención del broker, reintentos del relay y reprocesos manuales desde la DLQ (T5).

**Entiende:** la regla tiene dos lados: la retención del inbox es mayor que la reentrega más tardía posible, y el reproceso manual de eventos viejos se documenta y controla.

**Cierra:** escribe en el ADR la ventana de purga y de dónde sale.

#### Hito del tema

- [ ] Procesé dos veces el mismo evento y obtuve una sola notificación.
- [ ] Expliqué por qué `ON CONFLICT DO NOTHING` y no una excepción.
- [ ] Reproduje el efecto doble con transacciones separadas.
- [ ] Fijé una ventana de purga justificada por la reentrega máxima.

#### Ejercicio

Facturación no tiene tabla `inbox`: cada evento `EnvioCreado` crea una fila en `cargos`. Haz el consumidor idempotente sin agregar una tabla, como sugiere microservices.io con la alternativa de guardar el identificador en la propia entidad.

<details>
<summary>Solución — ábrela después de intentarlo</summary>

Guarda `evento_id` en la entidad que crea el efecto, con una restricción única:

```sql
CREATE TABLE cargos (
  id         bigserial PRIMARY KEY,
  envio_id   text NOT NULL,
  evento_id  uuid NOT NULL UNIQUE,
  total_cop  bigint NOT NULL
);

INSERT INTO cargos (envio_id, evento_id, total_cop)
VALUES (:'envio', :'evento', 8126)
ON CONFLICT (evento_id) DO NOTHING;
```

La segunda ejecución devuelve `INSERT 0 0`. Funciona porque el efecto es una sola fila. Si el evento produjera varias filas o actualizaciones en tablas distintas, la tabla `inbox` sigue siendo más clara. En este caso también serviría una restricción única sobre `envio_id`, porque hay un cargo por envío: la idempotencia por regla de negocio es más fuerte que la idempotencia por mensaje.

</details>

**Fuentes primarias:** [microservices.io: Idempotent Consumer](https://microservices.io/patterns/communication-style/idempotent-consumer.html), [Azure: Idempotent Consumer](https://learn.microsoft.com/en-us/azure/architecture/patterns/idempotent-consumer) y [PostgreSQL 16: `INSERT ... ON CONFLICT`](https://www.postgresql.org/docs/16/sql-insert.html#SQL-ON-CONFLICT).

**Siguiente tema:** «Orden por clave, reintentos y cola de mensajes muertos» (referencia interna M4 T5).

### Tema 5: Orden por clave, reintentos y cola de mensajes muertos · Avanzado · 40 min

**Prerrequisito:** «Preservar el orden de eventos por versión del agregado» (referencia interna M0 T7) y tema anterior.

**Objetivo observable:** comprobar que particionar por `envioId` mantiene el orden de cada envío, reproducir el desorden de un reparto sin clave, sacar un mensaje venenoso a una cola de mensajes muertos (DLQ) tras tres intentos y reprocesarlo después de la corrección.

**¿Por qué es importante?** Un broker con varias particiones solo garantiza orden dentro de cada partición. Si los eventos del mismo envío caen en particiones distintas, dos consumidores los procesan en paralelo y el orden se pierde. Un mensaje que nunca se puede procesar bloquea todo lo que viene detrás si se reintenta para siempre. Azure lo llama *poison message* y recomienda enviarlo a una DLQ.

#### Subtema 4.5.1: Particiona por la clave del agregado · 10 min

**Contexto:** `ColaParticionada.java` simula un broker con 2 particiones y un consumidor por partición. Los consumidores avanzan intercalados según una semilla fija (`new Random(7)`), así que la salida es reproducible. La proyección aplica la lógica de M0 T7: solo acepta la versión siguiente.

**Hazlo tú:**

```bash
java ColaParticionada.java
```

**Resultado esperado:**

```text
particion 0: [E-2 v1, E-2 v2, E-4 v1, E-2 v3, E-4 v2]
particion 1: [E-1 v1, E-3 v1, E-1 v2, E-3 v2]
p1 E-1 v1 APLICADO
...
p0 E-4 v2 APLICADO
versiones={E-1=2, E-2=3, E-3=2, E-4=2} huecos=0 dlq=[] estacionados=[]
```

**Fallo deliberado:** cambia `PARTICIONES` a 1. **Diagnóstico:** el orden se mantiene, pero todo pasa por un solo consumidor y desaparece el paralelismo. La clave permite paralelizar entre envíos y conservar el orden dentro de cada uno.

**Entiende:** `Math.floorMod(envioId.hashCode(), 2)` manda siempre el mismo envío a la misma partición. `String.hashCode` está definido en la especificación de Java, así que da lo mismo en cualquier JVM.

**Cierra:** guarda qué envíos quedaron en cada partición.

#### Subtema 4.5.2: Fallo deliberado: reparte sin clave · 10 min

**Contexto:** un productor que reparte en turno rotatorio balancea mejor la carga, pero separa los eventos de un mismo envío.

**Hazlo tú:**

```bash
java ColaParticionada.java --round-robin
```

**Resultado esperado del fallo:**

```text
particion 0: [E-1 v1, E-3 v1, E-2 v2, E-3 v2, E-4 v2]
particion 1: [E-2 v1, E-1 v2, E-4 v1, E-2 v3]
p1 E-2 v1 APLICADO
p1 E-1 v2 HUECO: falta v1, se estaciona
p1 E-4 v1 APLICADO
p0 E-1 v1 APLICADO
  estacionado E-1 v2 APLICADO
...
versiones={E-1=2, E-2=3, E-3=2, E-4=2} huecos=1 dlq=[] estacionados=[]
```

**Diagnóstico:** `E-1 v2` llegó antes que `E-1 v1` porque estaban en particiones distintas. La proyección lo detectó por la versión y lo estacionó hasta que llegó `v1`. Sin el control de versión de M0 T7, el estado de E-1 habría retrocedido.

**Entiende:** la versión del agregado es la red de seguridad, y la partición por clave es la que evita necesitarla en el caso normal. Hacen falta las dos: la versión también protege ante reentregas y reprocesos.

**Cierra:** compara `huecos=0` con `huecos=1` y explica la diferencia.

#### Subtema 4.5.3: Acota los reintentos y usa una DLQ · 12 min

**Contexto:** `E-2 v2` trae un payload que el consumidor no puede leer. Reintentar sirve para fallos transitorios, no para un mensaje que siempre falla.

**Hazlo tú:**

```bash
java ColaParticionada.java --veneno --sin-dlq | tail -4
java ColaParticionada.java --veneno
```

**Resultado esperado del fallo** (sin DLQ):

```text
p0 E-2 v2 ERROR intento 34: payload ilegible en E-2 v2
p0 E-2 v2 ERROR intento 35: payload ilegible en E-2 v2
PARTICION 0 BLOQUEADA; esperan detras: [E-2 v2, E-4 v1, E-2 v3, E-4 v2]
versiones={E-1=2, E-2=1, E-3=2} huecos=0 dlq=[] estacionados=[]
```

**Diagnóstico:** `E-4` no tiene ningún problema, pero no avanza porque comparte partición con el mensaje venenoso. Es un bloqueo en cabeza de fila: un mensaje malo detiene a todos los que esperan detrás.

**Resultado esperado** (con DLQ):

```text
p0 E-2 v2 ERROR intento 3: payload ilegible en E-2 v2
p0 E-2 v2 -> DLQ
p0 E-4 v1 APLICADO
p0 E-2 v3 HUECO: falta v2, se estaciona
p0 E-4 v2 APLICADO
versiones={E-1=2, E-2=1, E-3=2, E-4=2} huecos=1 dlq=[E-2 v2] estacionados=[E-2 v3]
```

**Entiende:** tras tres intentos, el mensaje sale a la DLQ y la partición sigue. Fíjate en `E-2 v3`: llegó sin su `v2`, que está en la DLQ, y la proyección lo estacionó. Mandar un mensaje a la DLQ rompe el orden de esa clave. Por eso los mensajes siguientes del mismo envío deben esperar, no aplicarse.

**Cierra:** guarda las dos salidas y explica qué protege cada mecanismo.

#### Subtema 4.5.4: Reprocesa la DLQ después de corregir · 8 min

**Contexto:** la DLQ no es un basurero: es una cola de trabajo con dueño, alerta y procedimiento de reproceso (*redrive*).

**Hazlo tú:**

```bash
java ColaParticionada.java --veneno --redrive | tail -4
```

**Resultado esperado:**

```text
REDRIVE de [E-2 v2] tras desplegar la correccion
dlq E-2 v2 APLICADO
  estacionado E-2 v3 APLICADO
versiones={E-1=2, E-2=3, E-3=2, E-4=2} huecos=1 dlq=[] estacionados=[]
```

**Fallo deliberado:** reprocesa la DLQ antes de desplegar la corrección (quita `payloadCorregido = true`). **Diagnóstico:** el mensaje vuelve a fallar con la misma excepción. Primero se corrige y después se reprocesa, y el reproceso es seguro porque el consumidor es idempotente (T4).

**Entiende:** cuando entra el `v2` corregido, la proyección aplica también el `v3` estacionado. El estado final es el mismo que sin veneno. El costo fue el tiempo que E-2 estuvo detenido en la versión 1, que la DLQ hace visible.

**Cierra:** escribe el procedimiento de reproceso: quién lo aprueba, cómo se verifica y cuándo se purga la DLQ.

#### Hito del tema

- [ ] Mantuve el orden por envío con particiones por clave.
- [ ] Reproduje el desorden del reparto sin clave y lo detecté por versión.
- [ ] Vi el bloqueo sin DLQ y lo resolví con tres intentos y DLQ.
- [ ] Reprocesé la DLQ y el estado final quedó completo.

#### Ejercicio

El equipo propone agregar una espera creciente entre reintentos (100, 200 y 400 ms) antes de enviar a la DLQ. ¿Qué tipo de fallo mejora esto y cuál no? Cambia el simulador para imprimir la espera de cada intento.

<details>
<summary>Solución — ábrela después de intentarlo</summary>

En el `catch` del bucle principal:

```java
long esperaMs = 100L << (intentos[p] - 1); // 100, 200, 400
System.out.println("p" + p + " " + m + " espera " + esperaMs + " ms antes del intento " + (intentos[p] + 1));
```

La espera ayuda con fallos **transitorios**, como una base saturada o un servicio que se reinicia: le da tiempo a recuperarse. No ayuda con un mensaje **venenoso**, que falla igual a los 100 ms que a los 400 ms, y además retrasa a todos los mensajes que esperan detrás en la partición. Por eso conviene clasificar el error: si es de formato o de validación, a la DLQ de inmediato. Si es transitorio, se reintenta con espera. M6 T1 profundiza en la espera exponencial con jitter.

</details>

**Fuentes primarias:** [Azure: Queue-Based Load Leveling, mensajes venenosos y orden](https://learn.microsoft.com/en-us/azure/architecture/patterns/queue-based-load-leveling), [Azure: Competing Consumers](https://learn.microsoft.com/en-us/azure/architecture/patterns/competing-consumers) y [`String.hashCode` en Java 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/lang/String.html#hashCode()).

**Siguiente tema:** «Evolución de esquemas de eventos» (referencia interna M4 T6).

### Tema 6: Evolución de esquemas de eventos (amplía M0 T8) · Intermedio · 35 min

**Prerrequisito:** «Evolucionar un contrato JSON sin romper consumidores» (referencia interna M0 T8) y T1 de este módulo.

**Objetivo observable:** leer eventos `EnvioCreado` de dos versiones con un lector tolerante y un *upcaster*, y reproducir los dos fallos típicos: el lector estricto y la versión ignorada.

**¿Por qué es importante?** M0 T8 evolucionó un contrato HTTP, donde el cliente y el servidor conviven en el mismo momento. Los eventos duran más: un consumidor puede leer hoy un evento publicado hace meses, desde el outbox, la DLQ o un reproceso. Azure, en *Event Sourcing*, describe tres estrategias para eventos que no se pueden reescribir: deserialización tolerante, versión en cada evento y *upcasting*, que transforma el esquema viejo al actual al leer, sin tocar el evento guardado.

#### Subtema 4.6.1: Acepta un campo nuevo con un lector tolerante · 10 min

**Contexto:** Envíos agrega `zona` a `EnvioCreado v1`. Es un cambio aditivo y los consumidores que no lo usan deben seguir funcionando.

**Hazlo tú:**

```bash
java EvolucionEsquema.java
```

**Resultado esperado:**

```text
OK      EnvioCreado[envioId=E-1, pesoKg=2.5, zona=null]
OK      EnvioCreado[envioId=E-2, pesoKg=1, zona=Z03]
OK      EnvioCreado[envioId=E-3, pesoKg=5, zona=Z01]
```

**Fallo deliberado:** pide `zona` como obligatoria en el modelo interno. **Diagnóstico:** `a1`, publicado antes del cambio, ya no se puede leer. Un campo nuevo es opcional para siempre en el consumidor, porque los eventos viejos siguen existiendo.

**Entiende:** el lector tolerante ignora lo que no conoce y aplica un valor por defecto a lo que falta. Por eso agregar campos no exige versión nueva.

**Cierra:** guarda la salida.

#### Subtema 4.6.2: Fallo deliberado: un lector estricto · 8 min

**Contexto:** algunos lectores JSON rechazan por defecto las propiedades desconocidas.

**Hazlo tú:**

```bash
java EvolucionEsquema.java --estricto
```

**Resultado esperado del fallo:**

```text
OK      EnvioCreado[envioId=E-1, pesoKg=2.5, zona=null]
RECHAZO a2: campo desconocido 'zona'
RECHAZO a3: campo desconocido 'pesoGr'
```

**Diagnóstico:** un cambio compatible del productor rompió al consumidor. Con un broker real, `a2` iría a la DLQ y cada evento nuevo después de él también. Con Jackson, el equivalente es dejar activa `DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES`. Revisa cómo la configura tu aplicación antes de suponerlo.

**Entiende:** la compatibilidad depende de los dos lados. El productor solo agrega campos, y el consumidor tolera lo que no conoce.

**Cierra:** anota la configuración de tu lector JSON real.

#### Subtema 4.6.3: Cambio incompatible: versión explícita y upcaster · 12 min

**Contexto:** Envíos decide publicar el peso en gramos enteros (`pesoGr`) y deja de enviar `pesoKg`. Ese cambio no es compatible y por eso el evento lleva `version: 2`.

**Hazlo tú:** revisa `upcast`, que convierte la v2 a la forma actual sin modificar el evento original:

```java
BigDecimal gramos = new BigDecimal(actual.remove("pesoGr"));
actual.put("pesoKg", gramos.movePointLeft(3).stripTrailingZeros().toPlainString());
```

y ejecuta sin él:

```bash
java EvolucionEsquema.java --sin-upcaster | tail -1
```

**Resultado esperado del fallo:**

```text
RECHAZO a3: falta pesoKg en version 2
```

**Diagnóstico:** sin upcaster, el consumidor leyó la v2 como si fuera v1. Al menos falló de forma explícita. Si el lector hubiera usado `pesoKg = 0` por defecto, Facturación habría cobrado envíos de peso cero.

**Entiende:** con el upcaster, el resto del consumidor solo conoce un modelo. Cada versión nueva añade una función de conversión en la frontera, como la ACL de M2 T4, y el evento guardado no cambia. Azure reserva reescribir los eventos almacenados para el último recurso, porque rompe la inmutabilidad.

**Cierra:** guarda las salidas con y sin upcaster.

#### Subtema 4.6.4: Escribe las reglas del contrato de eventos · 5 min

**Contexto:** las reglas deben estar escritas antes del próximo cambio, no descubrirse en un incidente.

**Hazlo tú:** agrega al contrato de `EnvioCreado`:

```text
1. Cada evento lleva tipo, version y eventoId.
2. Agregar un campo opcional no cambia la version. Quitar, renombrar o cambiar unidad o tipo, sí.
3. Los consumidores ignoran campos desconocidos y no exigen campos agregados después de la v1.
4. Al publicar una version nueva, el productor sigue publicando la anterior hasta que los consumidores
   registrados confirman que leen la nueva (M7 lo verifica con pruebas de contrato).
5. Los eventos guardados no se reescriben: se convierten al leer.
```

**Resultado esperado:** reglas que M7 T3 convertirá en pruebas de contrato.

**Fallo deliberado:** omite la regla 4. **Diagnóstico:** el productor publica solo v2 y los consumidores sin upcaster fallan todos a la vez. La coordinación vuelve a ser necesaria, justo lo que los eventos intentaban evitar.

**Entiende:** versionar es un acuerdo entre equipos con fechas, como la deprecación HTTP de M3 T5.

**Cierra:** con este tema, `EnvioCreado` sale por outbox, se consume sin duplicados y puede evolucionar. El hito del módulo queda completo.

#### Hito del tema

- [ ] Leí eventos con y sin `zona` con un lector tolerante.
- [ ] Reproduje el lector estricto que rompe ante un cambio compatible.
- [ ] Convertí la v2 con un upcaster y vi el fallo sin él.
- [ ] Escribí las cinco reglas del contrato de eventos.

#### Ejercicio

Envíos publica una v3 en la que `zona` pasa a ser un objeto con código y nombre (`"zona":{"codigo":"Z03","nombre":"Metropolitana"}`). Escribe el upcaster de v3 a la forma actual. El lector de este laboratorio solo maneja JSON plano, así que describe también qué cambiarías en él.

<details>
<summary>Solución — ábrela después de intentarlo</summary>

El modelo interno sigue con `zona` como texto (el código), así que el upcaster de v3 extrae el código:

```java
if (evento.get("version").equals("3")) {
  Map<String, String> actual = new LinkedHashMap<>(evento);
  actual.put("zona", actual.remove("zona.codigo")); // si el lector aplana objetos como "zona.codigo"
  actual.remove("zona.nombre");
  actual.put("version", "1");
  return actual;
}
```

El lector de `EvolucionEsquema` no entiende objetos anidados. Con un lector JSON real (Jackson, en Spring Boot M3), el upcaster recibiría un árbol (`JsonNode`) y leería `zona.codigo`. Los upcasters se encadenan: v3 a v2 y v2 a v1, o cada uno directo a la forma actual. Lo importante es que el resto del consumidor no cambie y que las tres versiones sigan siendo legibles mientras existan eventos guardados de cada una.

</details>

**Fuentes primarias:** [Azure: Event Sourcing, versionado de eventos](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing) y [Fowler, *TolerantReader*](https://martinfowler.com/bliki/TolerantReader.html).

**Siguiente módulo:** «Datos distribuidos: saga, CQRS y Event Sourcing» (referencia interna M5 T1).
