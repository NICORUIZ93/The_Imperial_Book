# Módulo 25: La misma función con Kafka y RabbitMQ

## Aprende construyendo

El laboratorio [`examples/spring-stream-rutaflow/`](../../../examples/spring-stream-rutaflow/) convierte un envío en una solicitud de ruta. La función se mantiene; el perfil selecciona el broker.

**Prerrequisitos del módulo:** Spring Boot M8 T6 (Spring Cloud Stream y binders), Spring Boot M8 T9 (RabbitMQ con Spring AMQP) y Spring Boot M21 T1 (tópicos, keys y grupos). Usa JDK 21.

Cada tema toma 20–45 min. Completa sus tres subtemas y el hito antes de avanzar.

### Tema 1: bindings y destinations

**Duración estimada:** 25 min.
**¿Por qué es importante?** Separar función y binding permite cambiar el broker sin duplicar la regla de negocio.

#### Subtema 1.1: Transforma un envío en una ruta · 8 min

**1. Contexto**
El servicio recibe `ShipmentCreated` y deriva una región para el planificador.

**2. Hazlo tú**
Desde la raíz del repositorio, abre `examples/spring-stream-rutaflow/src/main/java/academia/rutaflow/stream/RouteFunctions.java` y corre el test:

```bash
cd examples/spring-stream-rutaflow
./mvnw -Dtest=RouteFunctionsTest#transformaEnvioEnSolicitudDeRuta test
```

**Salida esperada:** `Tests run: 1, Failures: 0, Errors: 0`; la entrada `sh-42 / 10ABC` sale como JSON con `sh-42 / 10`.

**Fallo deliberado:** cambia `substring(0, 2)` por `substring(0, 3)`. **Resultado esperado:** la salida ya no contiene región `10`. **Diagnóstico:** alteraste el recorte; vuelve a tomar los dos caracteres del código postal.

**3. Entiende**
`Function<I,O>` recibe un tipo y devuelve otro. En esta práctica transforma los datos; no decide cómo se transportan.

**4. Cierra**
Conserva la salida del test y escribe qué campo de entrada produce `region`.

#### Subtema 1.2: Conecta la función a destinos · 8 min

**1. Contexto**
El binding es el nombre lógico de entrada/salida. `destination` nombra el tópico o exchange que usa el broker.

**2. Hazlo tú**
Abre `examples/spring-stream-rutaflow/src/main/resources/application.yml`; compara `planRoute-in-0` y `planRoute-out-0`. Ejecuta desde `examples/spring-stream-rutaflow/`:

```bash
./mvnw -Dtest=RouteFunctionsTest#transformaEnvioEnSolicitudDeRuta test
```

**Salida esperada:** la configuración conecta entrada `shipments.created` y salida `routes.requested`.

**Fallo deliberado:** renombra el bean `planRoute` sin cambiar los bindings. **Error esperado:** los canales `planRoute-in-0` y `planRoute-out-0` dejan de conectarse. **Diagnóstico:** los nombres de binding salen del nombre y posición de la función; actualiza ambos juntos.

**3. Entiende**
Separar nombre lógico y destino permite cambiar el recurso externo sin reescribir la transformación.

**4. Cierra**
Anota los dos nombres de binding y sus destinos. No llames “broker probado” a esta prueba en memoria.

#### Subtema 1.3: Rechaza una entrada incompleta · 9 min

**1. Contexto**
Un código postal demasiado corto no permite derivar región y debe fallar antes de publicar salida.

**2. Hazlo tú**
Ejecuta el test de validación de `src/test/java/academia/rutaflow/stream/RouteFunctionsTest.java`:

```bash
./mvnw -Dtest=RouteFunctionsTest#codigoPostalCortoFallaEnLaFuncion test
```

**Salida esperada:** `BUILD SUCCESS`; la función lanza `IllegalArgumentException: El código postal debe tener dos caracteres`.

**Fallo deliberado:** quita la validación de longitud. **Resultado esperado:** el test no recibe la excepción y falla. **Diagnóstico:** valida el dato en la frontera antes de derivar la ruta.

**3. Entiende**
El test binder hace circular mensajes dentro de la aplicación sin conectarse a Kafka ni RabbitMQ.

**4. Cierra**
Guarda la salida y el mensaje exacto que indica por qué se rechaza el dato.

**Hito del tema:**

- [ ] La función convierte el envío en una ruta.
- [ ] Binding y destination están identificados.
- [ ] La entrada corta falla con un mensaje legible.
- [ ] Los dos tests pasan con `./mvnw test`.

**Fuente:** [abstracción de binders](https://docs.spring.io/spring-cloud-stream/reference/spring-cloud-stream/overview-binder-abstraction.html).

### Tema 2: binder Kafka y binder RabbitMQ

**Duración estimada:** 30 min.
**¿Por qué es importante?** Probar ambos perfiles muestra qué comportamiento depende del broker elegido.

#### Subtema 2.1: Publica y consume con Kafka · 10 min

**1. Contexto**
Kafka guarda el flujo en un tópico; el grupo conserva su avance mediante offsets.

**2. Hazlo tú**
Abre `examples/spring-stream-rutaflow/compose.yaml` y `examples/spring-stream-rutaflow/src/main/resources/application-kafka.yml`. Desde `examples/spring-stream-rutaflow/`, levanta los brokers y la app con perfil Kafka:

```bash
docker compose up -d
./mvnw spring-boot:run -Dspring-boot.run.profiles=kafka
```

En otra terminal, consume el resultado y publica un envío de prueba:

```bash
docker compose exec kafka /opt/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic routes.requested --from-beginning
docker compose exec -T kafka /opt/kafka/bin/kafka-console-producer.sh --bootstrap-server localhost:9092 --topic shipments.created
```

Escribe `{"shipmentId":"sh-42","postalCode":"10ABC"}` en el productor y ciérralo con Ctrl-D.

**Salida esperada:** el consumer del tópico `routes.requested` recibe JSON con `shipmentId=sh-42` y `region=10`.

**Fallo deliberado:** cambia `KAFKA_BOOTSTRAP_SERVERS` a un puerto cerrado. **Error esperado:** el cliente no puede conectar. **Diagnóstico:** revisa que Kafka esté arriba y que el puerto sea `19092` desde el host; la aplicación usa localhost.

**3. Entiende**
El test binder anterior no usa socket ni broker. Este paso sí comprueba la conexión Kafka y sus destinos.

**4. Cierra**
Guarda la salida del consumer y escribe qué tópico publicó el resultado.

#### Subtema 2.2: Publica y consume con RabbitMQ · 10 min

**1. Contexto**
RabbitMQ enruta mensajes de un exchange a colas. Cada grupo tiene su cola.

**2. Hazlo tú**
Abre `examples/spring-stream-rutaflow/src/main/resources/application-rabbit.yml`. Desde `examples/spring-stream-rutaflow/`, arranca el perfil Rabbit:

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=rabbit
```

Abre `http://localhost:15672`, entra con `guest`/`guest` en local, crea la cola `rutas-observadas` y enlázala al exchange `routes.requested` con routing key `#`. Publica el JSON de envío en el exchange `shipments.created` con routing key `#`.

**Salida esperada:** la cola `rutas-observadas` muestra la solicitud con región `10`.

**Fallo deliberado:** cambia `RABBITMQ_PORT` a un puerto cerrado. **Error esperado:** Rabbit rechaza la conexión. **Diagnóstico:** verifica el contenedor y el puerto `5672`; no cambies la función.

**3. Entiende**
El binder declara exchange y cola de entrada; la cola de observación de salida se crea para que puedas inspeccionar el mensaje.

**4. Cierra**
Guarda una captura de la cola y registra exchange, cola y routing key que usaste.

#### Subtema 2.3: Compara lo que realmente cambia · 10 min

**1. Contexto**
La transformación puede ser idéntica y las garantías de entrega no.

**2. Hazlo tú**
Abre `examples/spring-stream-rutaflow/src/main/resources/application-kafka.yml` y `examples/spring-stream-rutaflow/src/main/resources/application-rabbit.yml`; consulta luego cada broker desde `examples/spring-stream-rutaflow/`:

```bash
docker compose ps
docker compose logs --tail=30 kafka rabbitmq
```

**Salida esperada:** Kafka muestra tópico/partición; RabbitMQ muestra exchange/cola y mensajes pendientes.

**Fallo deliberado:** activa un perfil sin levantar su broker. **Resultado esperado:** la app no enlaza con el servicio. **Diagnóstico:** selecciona el perfil que coincide con el broker arriba.

**3. Entiende**
Kafka ofrece retención y lectura por offset. RabbitMQ centra el flujo en routing, colas y acknowledgements. No traduzcas una garantía como si fuera equivalente.

**4. Cierra**
Entrega una comparación con una evidencia observada en cada broker.

**Hito del tema:**

- [ ] El perfil Kafka publica y consume un mensaje.
- [ ] El perfil Rabbit publica y consume un mensaje.
- [ ] Registré destino físico y grupo/cola.
- [ ] Distinguí evidencia del test binder y del broker real.

**Fuentes:** [binder Kafka](https://docs.spring.io/spring-cloud-stream/reference/kafka/kafka-binder/), [binder RabbitMQ](https://docs.spring.io/spring-cloud-stream/reference/rabbit/rabbit_overview.html).

### Tema 3: reintentos, error handler y dead-letter

**Duración estimada:** 30 min.
**¿Por qué es importante?** Una política de reintentos evita ciclos infinitos y conserva los mensajes que requieren reparación.

#### Subtema 3.1: Limita los reintentos en Kafka · 10 min

**1. Contexto**
El grupo `route-planner` debe evitar ciclos infinitos si el mensaje siempre es inválido.

**2. Hazlo tú**
Abre `examples/spring-stream-rutaflow/src/main/resources/application-kafka.yml`; revisa `max-attempts: 3` y `enable-dlq: true`. Desde `examples/spring-stream-rutaflow/`, reinicia con perfil Kafka y publica `{"shipmentId":"sh-50","postalCode":"XX123"}`.

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=kafka
```

**Salida esperada:** tras tres ejecuciones fallidas, el mensaje queda en el tópico DLQ del grupo Kafka. La configuración necesita el `group` explícito ya definido en `application.yml`.

**Fallo deliberado:** quita `enable-dlq`. **Resultado esperado:** el tópico DLQ deja de recibir el mensaje. **Diagnóstico:** el binder Kafka no activa DLQ por defecto; vuelve a habilitarlo.

**3. Entiende**
En este binder `max-attempts` y el grupo participan en la política DLQ. La retención del mensaje fallido no arregla el dato inválido.

**4. Cierra**
Guarda el mensaje observado en el tópico principal y la evidencia del destino de error.

#### Subtema 3.2: Declara DLQ en RabbitMQ · 10 min

**1. Contexto**
Una cola con mensajes que fallan requiere un destino para inspección y corrección.

**2. Hazlo tú**
Abre `examples/spring-stream-rutaflow/src/main/resources/application-rabbit.yml`; comprueba `max-attempts: 3` y `auto-bind-dlq: true`. Desde `examples/spring-stream-rutaflow/`, arranca el perfil Rabbit y publica el mismo JSON con región `XX`.

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=rabbit
```

**Salida esperada:** RabbitMQ crea una DLQ enlazada al destino y recibe el mensaje cuando se agotan los intentos.

**Fallo deliberado:** quita `auto-bind-dlq`. **Resultado esperado:** no aparece la cola de dead-letter configurada. **Diagnóstico:** el binder Rabbit no crea DLQ si no se solicita.

**3. Entiende**
RabbitMQ enruta fallos a un dead-letter exchange/queue; Kafka conserva el mensaje en un tópico. Los nombres y propiedades cambian por binder.

**4. Cierra**
Anota el nombre de la DLQ y el número de intentos de cada broker.

#### Subtema 3.3: Distingue fallo transitorio de dato inválido · 10 min

**1. Contexto**
Una caída del servicio puede recuperarse; una región inválida necesita corrección, no más reintentos.

**2. Hazlo tú**
Abre `examples/spring-stream-rutaflow/src/main/java/academia/rutaflow/stream/RouteFunctions.java` y `examples/spring-stream-rutaflow/src/main/resources/application-kafka.yml`. Envía primero el evento válido `10ABC` y luego `XX123` por el broker activo. Compara el destino normal y el de error en la consola.

```bash
./mvnw -Dtest=RouteFunctionsTest test
```

**Salida esperada:** el válido llega a `routes.requested`; el `XX123` se conserva en el destino DLQ del perfil activo.

**Fallo deliberado:** reenvía el payload inválido repetidamente como si fuera transitorio. **Resultado esperado:** consume intentos y vuelve a la DLQ. **Diagnóstico:** corrige o aparta el dato antes de hacer replay.

**3. Entiende**
Una DLQ es una bandeja de revisión, no una reparación automática. El replay debe conservar identidad y evitar duplicar el efecto.

**4. Cierra**
Escribe qué persona o proceso revisaría el mensaje antes de reenviarlo.

**Hito del tema:**

- [ ] Kafka agota tres intentos y conserva el error.
- [ ] RabbitMQ agota tres intentos y conserva el error.
- [ ] El evento válido sigue el flujo normal.
- [ ] Documenté cómo revisar antes de replay.

**Fuentes:** [DLQ para Kafka](https://docs.spring.io/spring-cloud-stream/reference/kafka/kafka-binder/dlq.html), [dead-letter en RabbitMQ](https://docs.spring.io/spring-cloud-stream/reference/rabbit/rabbit_overview.html).

### Tema 4: test binder y límites de la prueba

**Duración estimada:** 25 min.
**¿Por qué es importante?** Un test en memoria no detecta problemas de red o topología; declarar su límite evita falsa confianza.

#### Subtema 4.1: Verifica mapping en memoria · 8 min

**1. Contexto**
La lógica de transformación debe probarse sin tener Kafka o Rabbit instalados.

**2. Hazlo tú**
Abre `examples/spring-stream-rutaflow/src/test/java/academia/rutaflow/stream/RouteFunctionsTest.java` y ejecuta el test binder desde `examples/spring-stream-rutaflow/`:

```bash
cd examples/spring-stream-rutaflow
./mvnw -Dtest=RouteFunctionsTest#transformaEnvioEnSolicitudDeRuta test
```

**Salida esperada:** `Tests run: 1, Failures: 0, Errors: 0`.

**Fallo deliberado:** espera región `11` en lugar de `10`. **Resultado esperado:** el test falla. **Diagnóstico:** la salida usa los dos primeros caracteres de `10ABC`.

**3. Entiende**
El test binder conecta entrada y salida dentro de la JVM. No abre conexiones al broker.

**4. Cierra**
Guarda la salida y la predicción que escribiste antes de ejecutar.

#### Subtema 4.2: Comprueba una entrada inválida · 8 min

**1. Contexto**
Una prueba local también debe mostrar qué ocurre antes de enviar datos externos.

**2. Hazlo tú**
Abre `examples/spring-stream-rutaflow/src/test/java/academia/rutaflow/stream/RouteFunctionsTest.java` y ejecuta el test de código postal corto desde `examples/spring-stream-rutaflow/`:

```bash
./mvnw -Dtest=RouteFunctionsTest#codigoPostalCortoFallaEnLaFuncion test
```

**Salida esperada:** `BUILD SUCCESS`; el test observa `El código postal debe tener dos caracteres`.

**Fallo deliberado:** cambia el mensaje esperado en el test. **Resultado esperado:** la aserción falla. **Diagnóstico:** el test documenta el contrato de error; restaura el texto de la función.

**3. Entiende**
Un test unitario verifica la regla. El test binder verifica la transformación conectada a los bindings.

**4. Cierra**
Guarda el nombre del test y la condición que protege.

#### Subtema 4.3: Separa prueba local y broker real · 9 min

**1. Contexto**
Ningún test en memoria confirma que un servicio externo esté disponible o cree la topología correcta.

**2. Hazlo tú**
Abre `examples/spring-stream-rutaflow/pom.xml` y `examples/spring-stream-rutaflow/compose.yaml`. Ejecuta toda la suite y luego consulta los brokers por separado desde `examples/spring-stream-rutaflow/`:

```bash
./mvnw test
docker compose ps
```

**Salida esperada:** dos tests locales verdes; `docker compose ps` muestra si cada broker está arriba. Son evidencias distintas.

**Fallo deliberado:** detén RabbitMQ y ejecuta el perfil Rabbit. **Resultado esperado:** la suite test binder sigue pasando, pero la conexión real falla. **Diagnóstico:** el test binder sustituye el broker en memoria; no valida red ni topología real.

**3. Entiende**
Mantén separadas la prueba de mapping, la prueba del binder real y la revisión humana de la explicación.

**4. Cierra**
Marca cada capa como ejecutada o pendiente y enlaza su evidencia.

**Hito del tema:**

- [ ] Pasan los tests de transformación y validación.
- [ ] Identifiqué lo que prueba el binder en memoria.
- [ ] Observé la conexión a cada broker por separado.
- [ ] No presenté una prueba local como certificación de integración.

**Fuente:** [test binder de Spring Cloud Stream](https://docs.spring.io/spring-cloud-stream/reference/spring-cloud-stream/spring_integration_test_binder.html).

## Capstone del módulo

Desde una copia limpia de `examples/spring-stream-rutaflow/`, ejecuta `./mvnw test`, levanta Kafka y RabbitMQ, procesa un envío con ambos perfiles y conserva evidencias de salida normal y DLQ. No guardes credenciales reales; los valores `guest` son solo para el contenedor local.

**Fuentes oficiales:** [compatibilidad Spring Cloud y Spring Boot](https://docs.spring.io/spring-cloud-release/reference/index.html), [abstracción binder y pruebas](https://docs.spring.io/spring-cloud-stream/reference/spring-cloud-stream/overview-binder-abstraction.html), [DLQ Kafka](https://docs.spring.io/spring-cloud-stream/reference/kafka/kafka-binder/dlq.html), [binder RabbitMQ](https://docs.spring.io/spring-cloud-stream/reference/rabbit/rabbit_overview.html).
