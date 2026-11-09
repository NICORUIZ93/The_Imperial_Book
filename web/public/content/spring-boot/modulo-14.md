# Módulo 14: Backend de entregas: MySQL espacial, archivos y tiempo real


## Aprende construyendo

Cada tema construye una pieza real del backend de un sistema de entregas (`gestion-entregas`) y la verifica sin sustituir infraestructura por descripciones: MySQL real vía Testcontainers para datos espaciales, Hibernate Spatial con tipos JTS reales, JWT real con ownership verificado, STOMP real (el protocolo que Spring efectivamente implementa de forma nativa) y detección real de MIME para archivos subidos.

### Tema 1: CRUD API y contratos

¿Por qué es importante? Cancelar sin borrar conserva evidencia útil para auditoría y evita que un reintento de red destruya información o cree un resultado distinto. En este laboratorio, `DELETE` marca el envío como cancelado; no borra la fila. Las claves para reintentar una creación se estudian en M13 T2.

#### Subtema 14.1.1: Modela estados que sí existen · 8 min

**Contexto.** Una cadena libre como `"cancelado"` puede terminar con errores de escritura y estados inventados.

**Hazlo tú.** Abre `examples/spring-boot-cancel-rutaflow/src/main/java/academia/rutaflow/cancel/entrega/EstadoEnvio.java` y `Envio.java`. Sigue el valor inicial y el método `cancelar()`.

```java
public enum EstadoEnvio { CREADO, CANCELADO }

public void cancelar() {
    this.estado = EstadoEnvio.CANCELADO;
}
```

Ejecuta el test que crea y lee un envío desde `examples/spring-boot-cancel-rutaflow/`:

```bash
./mvnw -q test -Dtest=CancelacionContratoTest#crearPublicaLocationYGetRecuperaElDto
```

**Resultado esperado.** Maven termina con `BUILD SUCCESS`; la respuesta contiene estado `CREADO` y el GET recupera el mismo ID.

**Fallo deliberado.** Cambia `CREADO` por `CREARDO` en `crear()`; el test detecta que la respuesta no coincide. Restaura `CREADO`.

**Entiende.** El enum limita los estados que Java puede guardar. No define por sí solo qué transiciones permite el negocio.

**Cierra.** Anota qué estado crea el envío y cuál escribe cancelar.

#### Subtema 14.1.2: Devuelve un contrato público pequeño · 8 min

**Contexto.** La entidad contiene datos de almacenamiento; el contrato HTTP debe mostrar solo los campos que el cliente necesita.

**Hazlo tú.** Revisa `EnvioResponse.java` y `EnvioController.java`. Ejecuta el test anterior y compara el JSON con el record `EnvioResponse(id, estado)`.

```bash
./mvnw -q test -Dtest=CancelacionContratoTest#crearPublicaLocationYGetRecuperaElDto
```

**Resultado esperado.** POST devuelve `201`, un encabezado `Location` y un DTO; GET devuelve `200` y el mismo ID. El JSON no serializa campos internos de JPA.

**Fallo deliberado.** Cambia el `201` de `ResponseEntity.created(ubicacion)` por `ResponseEntity.ok().location(ubicacion)`. El test esperaba `201` y debe fallar con `200`. Restaura `created`.

**Entiende.** Un DTO separa la forma que usa la API de cómo se guarda el objeto. Un cambio interno de persistencia no obliga a renombrar la respuesta pública.

**Cierra.** Identifica el status, `Location` y los dos campos de la respuesta de creación.

#### Subtema 14.1.3: Cancela sin destruir el historial · 10 min

**Contexto.** Un envío cancelado puede ser necesario para explicar una devolución o una disputa; borrar su fila elimina esa evidencia.

**Hazlo tú.** En `EnvioService.java`, sigue `cancelar(id)` hasta `Envio.cancelar()`. Ejecuta la prueba que hace el DELETE y consulta después el repositorio:

```bash
./mvnw -q test -Dtest=CancelacionContratoTest#deleteMarcaCanceladoYConservaLaFila
```

**Resultado esperado.** DELETE devuelve `200` con `CANCELADO`; `findById(id)` todavía encuentra la fila.

**Fallo deliberado.** Sustituye el cambio de estado por `envios.delete(envio)` en `EnvioService.cancelar()`. El test falla porque la fila ya no existe. Restaura la transición de estado.

**Entiende.** El verbo HTTP sugiere borrar el recurso, pero el dominio decide qué significa. En este sistema el registro histórico se conserva.

**Cierra.** Conserva la salida del test verde y describe qué aserción descubre la eliminación física.

#### Subtema 14.1.4: Repite DELETE sin cambiar el resultado · 8 min

**Contexto.** Redes y clientes pueden repetir una solicitud. La misma cancelación debe poder recibirse más de una vez.

**Hazlo tú.** Ejecuta `repetirDeleteConservaLaMismaCancelacion` en `CancelacionContratoTest`.

```bash
./mvnw -q test -Dtest=CancelacionContratoTest#repetirDeleteConservaLaMismaCancelacion
```

**Resultado esperado.** Las dos solicitudes responden `200` y `CANCELADO`. El endpoint no requiere `Idempotency-Key`: repetir esta transición no produce un efecto adicional.

**Fallo deliberado.** Añade temporalmente una excepción `409` si el estado ya es `CANCELADO`. El segundo DELETE falla; quita esa condición y repite la prueba.

**Entiende.** La idempotencia describe el efecto repetido, no una cabecera obligatoria. Para operaciones de creación que puedan duplicar un recurso, reutiliza el patrón con clave única de M13 T2.

**Cierra.** Entrega la salida de las tres pruebas. H2 verifica este laboratorio local; antes de producción hay que elegir y validar la base de datos real.

**Fuentes:** [Spring MVC](https://docs.spring.io/spring-framework/reference/web/webmvc.html), [Spring Data JPA](https://docs.spring.io/spring-data/jpa/reference/) y [Spring Boot Reference](https://docs.spring.io/spring-boot/reference/).

---

### Tema 2: MySQL y datos espaciales

¿Por qué es importante? Una búsqueda de repartidores cercanos necesita distinguir coordenadas bien interpretadas de un filtro espacial rápido. El laboratorio ejecuta las consultas contra MySQL 8.0.36 real con Testcontainers, no contra H2.

#### Subtema 14.2.1: Guarda puntos con un SRID fijo · 8 min

**Contexto.** El SRID indica a la base cómo interpretar las coordenadas. El índice espacial requiere que la columna sea `NOT NULL` y tenga SRID explícito.

**Hazlo tú.** Abre `examples/spring-boot-mysql-spatial-rutaflow/src/test/java/academia/rutaflow/spatial/ConsultaEspacialMySqlTest.java`. Lee `crearTabla()` y localiza `POINT NOT NULL SRID 4326` e `idx_ubicacion`.

```sql
CREATE TABLE punto (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  ubicacion POINT NOT NULL SRID 4326,
  SPATIAL INDEX idx_ubicacion (ubicacion)
);
```

Desde `examples/spring-boot-mysql-spatial-rutaflow/`, ejecuta:

```bash
DOCKER_HOST="$(podman machine inspect --format '{{.ConnectionInfo.PodmanSocket.Path}}')" \
TESTCONTAINERS_RYUK_DISABLED=true ./mvnw -q test
```

Con Docker puedes ejecutar `./mvnw -q test` directamente. Testcontainers descarga MySQL 8.0.36 si aún no está en caché.

**Resultado esperado.** Tres pruebas usan MySQL real. La tabla limita los puntos a SRID 4326 y declara el índice sobre `ubicacion`.

**Fallo deliberado.** Quita `NOT NULL` y el índice deja de cumplir las condiciones de creación espacial; restaura la definición antes de ejecutar los tests.

**Entiende.** SRID evita mezclar coordenadas incompatibles. H2 no reemplaza MySQL cuando la lección depende de funciones e índices espaciales.

**Cierra.** Anota el nombre de la columna, su SRID y el índice que guarda sus puntos.

#### Subtema 14.2.2: Especifica cómo leer latitud y longitud · 10 min

**Contexto.** MySQL interpreta por defecto los ejes de SRID 4326 como latitud-longitud. Si tus datos vienen como longitud-latitud, dilo al convertirlos.

**Hazlo tú.** En `distanciaEntreBogotaYMedellinSeMideEnMetros`, sigue las dos conversiones `ST_GeomFromText(..., 'axis-order=long-lat')` y la consulta `ST_Distance_Sphere`.

```sql
ST_GeomFromText('POINT(-74.08 4.61)', 4326, 'axis-order=long-lat')
```

Ejecuta solo esa prueba:

```bash
DOCKER_HOST="$(podman machine inspect --format '{{.ConnectionInfo.PodmanSocket.Path}}')" \
TESTCONTAINERS_RYUK_DISABLED=true ./mvnw -q test -Dtest=ConsultaEspacialMySqlTest#distanciaEntreBogotaYMedellinSeMideEnMetros
```

**Resultado esperado.** MySQL devuelve una distancia en metros entre 230 000 y 250 000 para Bogotá y Medellín en línea recta.

**Fallo deliberado.** Quita el tercer argumento `'axis-order=long-lat'`. El test de distancia debe fallar porque MySQL interpreta el primer eje como latitud. Restaura la opción explícita.

**Entiende.** `POINT(x y)` no basta para adivinar el orden del dato: el SRID y la opción de conversión deciden qué significa cada valor.

**Cierra.** Escribe qué coordenadas usa el test y por qué especifica el orden de ejes.

#### Subtema 14.2.3: Comprueba el índice con EXPLAIN · 8 min

**Contexto.** Una consulta puede ser correcta y aun así revisar demasiadas filas. `EXPLAIN` muestra el plan elegido o solicitado por la consulta.

**Hazlo tú.** Ejecuta `explainUsaIndiceEspacialParaReducirElAreaDeBusqueda` en `ConsultaEspacialMySqlTest`:

```bash
DOCKER_HOST="$(podman machine inspect --format '{{.ConnectionInfo.PodmanSocket.Path}}')" \
TESTCONTAINERS_RYUK_DISABLED=true ./mvnw -q test -Dtest=ConsultaEspacialMySqlTest#explainUsaIndiceEspacialParaReducirElAreaDeBusqueda
```

**Resultado esperado.** El test lee `key=idx_ubicacion`. Usa `FORCE INDEX` para hacer determinista esta demostración; no afirma que el optimizador elegiría el índice con cualquier volumen o distribución.

**Fallo deliberado.** Cambia `idx_ubicacion` por `idx_inexistente` en `FORCE INDEX`. MySQL rechaza la consulta y el test falla; restaura el nombre verdadero.

**Entiende.** `MBRContains` usa un rectángulo para encontrar candidatos; el índice espacial no calcula la ruta ni decide por sí solo la distancia exacta.

**Cierra.** Guarda qué valor de `key` observaste y qué límite tiene `FORCE INDEX` como evidencia de rendimiento.

#### Subtema 14.2.4: Separa candidatos cercanos de una ruta · 8 min

**Contexto.** Una distancia en línea recta no sabe si hay ríos, calles cerradas o tráfico entre dos puntos.

**Hazlo tú.** Ejecuta `srid4326PorDefectoInterpretaElPrimerEjeComoLatitud`. Compara el resultado predeterminado de MySQL con la opción `axis-order=long-lat` que usa el test anterior.

```bash
DOCKER_HOST="$(podman machine inspect --format '{{.ConnectionInfo.PodmanSocket.Path}}')" \
TESTCONTAINERS_RYUK_DISABLED=true ./mvnw -q test -Dtest=ConsultaEspacialMySqlTest#srid4326PorDefectoInterpretaElPrimerEjeComoLatitud
```

**Resultado esperado.** Sin opción, `ST_Latitude` devuelve `-74.08` y `ST_Longitude` devuelve `4.61`; con `long-lat`, la entrada representa longitud `-74.08` y latitud `4.61`.

**Fallo deliberado.** Usa el cálculo esférico como si diera minutos de viaje por carretera. Explica qué datos faltan y reemplaza esa conclusión por “distancia aproximada en línea recta”.

**Entiende.** Un cuadro espacial puede reducir candidatos; después se mide distancia. Para elegir una ruta vial hace falta un servicio o grafo de calles.

**Cierra.** Conserva la salida de las pruebas y la explicación del orden de ejes. El siguiente tema convierte estos puntos a tipos Java con Hibernate Spatial.

**Fuentes:** [MySQL 8.0: WKT y orden de ejes](https://dev.mysql.com/doc/refman/8.0/en/gis-wkt-functions.html), [MySQL: `ST_Distance_Sphere`](https://dev.mysql.com/doc/refman/8.0/en/spatial-convenience-functions.html), [MySQL: índices espaciales](https://dev.mysql.com/doc/refman/8.4/en/spatial-index-optimization.html) y [Testcontainers MySQL](https://java.testcontainers.org/modules/databases/mysql/).

---

### Tema 3: JPA e Hibernate Spatial

¿Por qué es importante? La aplicación necesita trabajar con puntos GPS como datos tipados y conservar los cambios cuando dos conductores actualizan una posición casi al mismo tiempo. El laboratorio conecta JTS, Hibernate Spatial y MySQL real.

#### Subtema 14.3.1: Crea un punto Java con el SRID correcto · 8 min

**Contexto.** JTS representa geometría con objetos Java. El SRID del objeto debe coincidir con el de la columna MySQL.

**Hazlo tú.** Abre `examples/spring-boot-hibernate-spatial-rutaflow/src/test/java/academia/rutaflow/hibernate/posicion/PosicionConductorTest.java` y encuentra `GeometryFactory` con SRID `4326` y la creación de `Coordinate(-74.08, 4.61)`.

```java
var geometria = new GeometryFactory(new PrecisionModel(), 4326);
var punto = geometria.createPoint(new Coordinate(-74.08, 4.61));
```

Desde `examples/spring-boot-hibernate-spatial-rutaflow/`, ejecuta la suite. Con Docker usa `./mvnw -q test`; con Podman Machine en macOS consulta los comandos de `README.md`.

**Resultado esperado.** El proyecto levanta MySQL 8.0.36 y la prueba recupera coordenadas `X=-74.08`, `Y=4.61` y `SRID=4326`.

**Fallo deliberado.** Crea el `GeometryFactory` sin el SRID `4326`. La aserción del SRID falla; restáuralo.

**Entiende.** X guarda longitud y Y latitud en este punto. La prueba hace explícito el SRID en vez de confiar en valores por defecto.

**Cierra.** Anota X, Y y el SRID observados tras leer el punto de MySQL.

#### Subtema 14.3.2: Mapea Point al campo de la entidad · 8 min

**Contexto.** Hibernate Spatial agrega el mapeo para que el repositorio guarde un `Point` JTS como columna geométrica de MySQL.

**Hazlo tú.** Abre `src/main/java/academia/rutaflow/hibernate/posicion/PosicionConductor.java`. Revisa el tipo `Point`, `@Column(columnDefinition = "POINT SRID 4326")` y el test `puntoJtsPersisteYSeLeeConSusCoordenadasYSrid`.

```bash
./mvnw -q test -Dtest=PosicionConductorTest#puntoJtsPersisteYSeLeeConSusCoordenadasYSrid
```

**Resultado esperado.** La prueba guarda y vuelve a leer la entidad desde MySQL; las dos coordenadas y el SRID coinciden con los valores creados.

**Fallo deliberado.** Cambia el tipo Java de `Point` por `String`. El mapeo deja de representar la columna espacial y la compilación o persistencia falla; restaura `Point`.

**Entiende.** La columna espacial se declara en el esquema SQL y `hibernate-spatial` proporciona el puente hacia JTS. La anotación `columnDefinition` no administra una migración de producción.

**Cierra.** Señala qué dependencia aporta el tipo geométrico y qué prueba confirma el ida y vuelta.

#### Subtema 14.3.3: Detecta dos escrituras sobre versiones distintas · 10 min

**Contexto.** Dos peticiones pueden leer la misma versión antes de intentar guardar cambios diferentes.

**Hazlo tú.** En `PosicionConductorTest`, sigue `versionDetectaLaSegundaEscrituraBasadaEnUnaLecturaVieja`. Ejecuta solo esa prueba:

```bash
./mvnw -q test -Dtest=PosicionConductorTest#versionDetectaLaSegundaEscrituraBasadaEnUnaLecturaVieja
```

**Resultado esperado.** La primera copia se guarda; Hibernate rechaza la segunda con `ObjectOptimisticLockingFailureException` porque lleva una versión obsoleta.

**Fallo deliberado.** Invierte las dos llamadas `actualizarUbicacion`. El conflicto sigue apareciendo: quien intenta guardar en segundo lugar detecta que la versión cambió. Restáuralas para conservar el ejemplo.

**Entiende.** `@Version` agrega un número a la fila. Hibernate incluye ese número en la actualización; si otra escritura ya lo cambió, la fila no coincide y la operación falla.

**Cierra.** Identifica cuál escritura se conserva y cuál debe volver a leer antes de reintentar.

#### Subtema 14.3.4: Observa la pérdida si quitas @Version · 8 min

**Contexto.** Sin comprobación de versión, la segunda copia puede sobrescribir el cambio reciente sin avisar.

**Hazlo tú.** Quita temporalmente `@Version` en `PosicionConductor.java` y repite el test del subtema anterior.

```bash
./mvnw -q test -Dtest=PosicionConductorTest#versionDetectaLaSegundaEscrituraBasadaEnUnaLecturaVieja
```

**Resultado esperado.** El test queda rojo: esperaba una excepción y Hibernate permitió la actualización. Restaura `@Version` y ejecuta de nuevo la prueba; vuelve a verde.

**Fallo deliberado.** Conserva solo la mutación sin `@Version` durante la prueba. Compara cuál coordenada termina guardada y explica cómo se perdió la actualización más nueva.

**Entiende.** El bloqueo optimista no bloquea la fila mientras lees; detecta el conflicto al guardar. Si ocurre, el caso de uso decide si debe volver a leer y pedir una decisión al usuario.

**Cierra.** Guarda la ejecución verde y el error real de la mutación. El siguiente tema agrega autenticación y comprueba propiedad del recurso.

**Fuentes:** [Hibernate Spatial y mapeo JTS](https://docs.jboss.org/hibernate/orm/current/userguide/html_single/Hibernate_User_Guide.html#spatial), [Hibernate: bloqueo optimista con `@Version`](https://docs.jboss.org/hibernate/orm/current/userguide/html_single/Hibernate_User_Guide.html#locking-optimistic) y [MySQL: tipos espaciales](https://dev.mysql.com/doc/refman/8.0/en/spatial-type-overview.html).

---

### Tema 4: JWT Bearer y autorización por roles

¿Por qué es importante? Un rol autoriza una clase de acción; no demuestra que el recurso solicitado sea de esa persona. El laboratorio firma JWT con HS256, valida su firma y revisa el dueño de la jornada por separado.

#### Subtema 14.4.1: Verifica el Bearer firmado · 8 min

**Contexto.** Leer un nombre de un token no demuestra que el token sea auténtico. El servidor comprueba su firma y vencimiento antes de aceptar la identidad.

**Hazlo tú.** Abre `examples/spring-boot-jwt-ownership-rutaflow/src/main/java/academia/rutaflow/ownership/security/JwtSecurityConfig.java`. Sigue el `JwtEncoder`, el `JwtDecoder` HS256 y la conversión de la claim `roles`.

```bash
cd examples/spring-boot-jwt-ownership-rutaflow
./mvnw -q test -Dtest=OwnershipJwtTest#conductorPropietarioConTokenFirmadoPuedeActualizar
```

**Resultado esperado.** MockMvc envía un JWT que el propio servidor firma y luego valida; la jornada del subject autorizado responde `200`.

**Fallo deliberado.** Cambia `HS256` a `HS384` solo en el decoder. El token de prueba deja de ser aceptado; restaura el mismo algoritmo en emisor y validador.

**Entiende.** El token lleva subject y roles. El decoder verifica criptográficamente lo que el cliente envía; no tomes la identidad de un parámetro del request.

**Cierra.** Identifica quién firma el token y qué componente verifica la firma.

#### Subtema 14.4.2: Distingue autenticación de rol · 8 min

**Contexto.** Un token válido dice quién inició sesión. El rol decide si esa identidad puede intentar esta acción.

**Hazlo tú.** Ejecuta `sinBearerTokenRecibe401` y `propietarioSinRolDriverRecibe403` en `OwnershipJwtTest`.

```bash
./mvnw -q test -Dtest=OwnershipJwtTest#sinBearerTokenRecibe401+propietarioSinRolDriverRecibe403
```

**Resultado esperado.** Sin token, el endpoint devuelve `401`; un token firmado con rol `ROLE_CUSTOMER` devuelve `403` ante `@PreAuthorize("hasRole('DRIVER')")`.

**Fallo deliberado.** Cambia el rol del token del segundo caso a `ROLE_DRIVER`. El test deja de recibir `403`; restaura `ROLE_CUSTOMER`.

**Entiende.** `401` señala que falta una identidad aceptada; `403` que la identidad autenticada no tiene permiso para la acción.

**Cierra.** Explica por qué el dueño sin rol puede autenticarse y aun así recibir `403`.

#### Subtema 14.4.3: Comprueba que el recurso pertenece al subject · 10 min

**Contexto.** Dos personas pueden tener el mismo rol y aun así no tener acceso a las jornadas de la otra.

**Hazlo tú.** Abre `JornadaController.java` y `JornadaOwnership.java`. Ejecuta los dos casos:

```bash
./mvnw -q test -Dtest=OwnershipJwtTest#conductorPropietarioConTokenFirmadoPuedeActualizar+mismoRolPeroOtroPropietarioRecibe403
```

**Resultado esperado.** `conductor-A`, dueño de `jornada-1`, recibe `200`; `conductor-B` tiene el mismo rol y recibe `403`.

**Fallo deliberado.** Cambia el subject de `conductor-B` a `conductor-A`. Ahora el segundo test recibe `200`; restaura `conductor-B`.

**Entiende.** `hasRole` comprueba la capacidad. `perteneceA` compara el subject firmado con el dueño del recurso. En producción ese dueño debe salir de la base de datos.

**Cierra.** Explica qué condición produciría `403` aunque la firma y el rol fueran correctos.

#### Subtema 14.4.4: Reproduce y corrige acceso horizontal · 8 min

**Contexto.** Si el servidor omite la comprobación del dueño, cualquier conductor con el rol puede cambiar otra jornada.

**Hazlo tú.** En `JornadaController.actualizarPosicion`, comenta temporalmente el bloque que llama a `ownership.perteneceA(...)` y corre `mismoRolPeroOtroPropietarioRecibe403`.

```bash
./mvnw -q test -Dtest=OwnershipJwtTest#mismoRolPeroOtroPropietarioRecibe403
```

**Resultado esperado.** El test falla: el usuario ajeno recibió `200`, no `403`. Restaura el bloque y vuelve a ejecutar `./mvnw -q test`; deben pasar las cuatro pruebas.

**Fallo deliberado.** Conserva el cambio sin propiedad solo durante esa prueba; la comparación de status muestra la vulnerabilidad. No publiques esa variante.

**Entiende.** Esta muestra usa un mapa fijo y una clave local para hacer visible cada decisión. No integra Keycloak ni obtiene dueños de una base de datos. **Límite:** HMAC usa una clave compartida; en un sistema real, elige un proveedor de identidad y gestiona sus claves y rotación.

**Cierra.** Guarda el resultado completo restaurado y anota que firma y rol no reemplazan la autorización por recurso.

**Transferencia al proyecto integrador:** aplica el filtro de rol y la comprobación de dueño a las rutas que modifican posiciones; consulta el propietario en persistencia y devuelve el status HTTP que el cliente pueda manejar.

**Fuentes:** [Spring Security: JWT Resource Server](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html), [Spring Security: Method Security](https://docs.spring.io/spring-security/reference/servlet/authorization/method-security.html) y [Spring Security Test](https://docs.spring.io/spring-security/reference/servlet/test/index.html).

---

### Tema 5: Tiempo real con STOMP

**Objetivo observable:** conectar un cliente STOMP por WebSocket, recibir una posición publicada a un topic y demostrar que una secuencia repetida se descarta.

**¿Por qué es importante?** Una posición atrasada o repetida puede confundir a quien sigue una entrega. El topic identifica a qué envío pertenece el aviso y la secuencia permite reconocer actualizaciones repetidas o antiguas.

**Antes de empezar:** saber iniciar un proyecto Maven del módulo 0. STOMP es el formato de mensajes y destinos que usa este ejemplo sobre una conexión WebSocket; Socket.IO es otro protocolo. Para Flutter/Socket.IO, continúa en [RutaFlow 5](/curso/rutaflow/5). Para identidad y permisos de la conexión, relaciona este tema con [Spring Boot 10](/curso/spring-boot/10).

**Recorrido del mensaje:** la app se conecta a `/ws-entregas`; el servidor publica en `/topic/entregas/SHP-1`; el cliente suscrito a ese destino recibe el JSON. Piensa en el topic como un canal de radio: escuchar el canal de otro envío no recibe esta posición.

El laboratorio autocontenido está en `examples/spring-boot-stomp-rutaflow/`. Abre terminal en esa carpeta y ejecuta `./mvnw -q test`. Usa servidor embebido, puerto aleatorio, un cliente `WebSocketStompClient` real y un broker simple local.

```bash
cd examples/spring-boot-stomp-rutaflow
./mvnw -q test
```

#### Subtema 14.5.1: Abre la conexión y define destinos · 8 min

**Contexto.** El endpoint es la puerta de entrada WebSocket. `/app` señala mensajes que el servidor procesa y `/topic` señala canales de publicación.

**Hazlo tú.** Abre `examples/spring-boot-stomp-rutaflow/src/main/java/academia/rutaflow/stomp/StompConfig.java`. Lee las tres líneas que definen los destinos:

```java
registry.enableSimpleBroker("/topic");
registry.setApplicationDestinationPrefixes("/app");
registry.addEndpoint("/ws-entregas");
```

En `StompEndToEndTest.java`, localiza la conexión `ws://localhost:` y compárala con `/ws-entregas`. Ejecuta desde la raíz del laboratorio: `./mvnw -q test`.

**Resultado esperado.** El test abre conexión WebSocket local al endpoint y finaliza en verde. El puerto lo asigna el sistema para evitar chocar con otro servicio.

**Fallo deliberado.** Cambia solo `/ws-entregas` del test por `/ws-equivocado`; ejecuta `./mvnw -q test`. La conexión falla porque no hay un endpoint registrado con ese nombre. Restaura la ruta.

**Entiende.** Un nombre de destino funciona como dirección postal: el mensaje debe llegar a la ruta que el servidor configuró. `/app` y `/topic` cumplen funciones diferentes.

**Cierra.** Anota qué ruta abre la conexión y qué prefijo leerías para ubicar un mensaje enviado al servidor.

#### Subtema 14.5.2: Suscríbete y recibe una posición · 10 min

**Contexto.** La conexión sola no recibe posiciones; el cliente se suscribe al envío que quiere observar.

**Hazlo tú.** Abre `src/test/java/academia/rutaflow/stomp/StompEndToEndTest.java`. Sigue `session.subscribe(...)`, el evento `PositionEvent` y `PositionPublisher.publish(...)`. El test confirma que el objeto publicado llega de vuelta por el WebSocket.

```java
session.subscribe("/topic/entregas/SHP-1", handler(PositionEvent.class, events));
PositionEvent first = new PositionEvent("SHP-1", 1, "2026-11-09T10:00:00Z", 1);
assertThat(publisher.publish(first)).isTrue();
assertThat(events.poll(3, TimeUnit.SECONDS)).isEqualTo(first);
```

Ejecuta `./mvnw -q test` desde `examples/spring-boot-stomp-rutaflow/`.

**Resultado esperado.** La prueba recibe `SHP-1` con secuencia `1`; no es una llamada directa al método del cliente, sino servidor, broker y cliente STOMP conectados.

**Fallo deliberado.** Cambia la suscripción a `/topic/entregas/SHP-2`. El test falla porque escucha el canal equivocado. El timeout limitado termina la espera y señala la falta de mensaje; no se cuelga indefinidamente. Restaura `SHP-1`.

**Entiende.** Publicador y suscriptor deben acordar el mismo destino. `PositionEvent` lleva ID, secuencia, hora y versión de esquema para que el receptor pueda interpretar y ordenar cambios.

**Cierra.** Copia del reporte de JUnit la línea que dice cuántas pruebas pasaron y nombra el destino exacto usado.

#### Subtema 14.5.3: Evita procesar dos veces la misma secuencia · 8 min

**Contexto.** Una conexión o productor puede repetir una actualización. Si ambos eventos se aplican, la app puede mostrar dos veces el mismo cambio.

**Hazlo tú.** Abre `src/main/java/academia/rutaflow/stomp/PositionSequenceTracker.java`. Identifica el último número guardado por envío. En `StompEndToEndTest.java`, localiza la segunda publicación del mismo `first`.

```java
assertThat(publisher.publish(first)).isTrue();
assertThat(publisher.publish(first)).isFalse();
assertThat(events.poll(3, TimeUnit.SECONDS)).isEqualTo(first);
assertThat(events.poll(250, TimeUnit.MILLISECONDS)).isNull();
```

Ejecuta `./mvnw -q test` y registra por qué la segunda llamada devuelve `false`.

**Resultado esperado.** Solo se recibe un evento. Para el mismo envío, una secuencia debe ser mayor que la última aceptada.

**Fallo deliberado.** En `PositionPublisher.publish`, quita temporalmente la condición que consulta `sequences.accept(event)` y publica siempre. Vuelve a ejecutar el test: la última comprobación falla porque llegó el duplicado. Restaura la condición y confirma el test verde.

**Entiende.** El tracker es una regla de orden, no una cola durable. Su mapa vive en memoria y una instancia; al reiniciar se borra y no coordina réplicas.

**Cierra.** Guarda reporte verde restaurado y el fallo que observaste al permitir publicar duplicados.

#### Subtema 14.5.4: Diagnostica destinos y límites de producción · 10 min

**Contexto.** El broker simple ayuda a aprender y probar el flujo, pero guarda sus suscripciones en memoria. La aplicación no valida aquí quién puede seguir un envío.

**Hazlo tú.** Ejecuta la prueba con el topic incorrecto y luego restáuralo. Abre `examples/spring-boot-stomp-rutaflow/README.md`; marca los límites sobre varias instancias, reinicios, autenticación y autorización por envío.

**Resultado esperado.** Puedes explicar por qué el suscriptor incorrecto no ve el mensaje, por qué el mapa de secuencias no basta en varias réplicas y qué permiso falta antes de exponer un envío real.

**Fallo deliberado.** Retira el timeout del `events.poll(...)` y observa que una prueba puede esperar para siempre cuando el destino no coincide. Restáuralo: las pruebas asíncronas necesitan un límite de espera.

**Entiende.** Para requisitos de confirmación STOMP, persistencia o múltiples instancias, evalúa un broker externo y su relay. Para clientes Socket.IO, hace falta un servidor compatible o gateway: compartir WebSocket como transporte no vuelve iguales los protocolos.

**Cierra.** Evidencia del tema: test verde restaurado, fallo diagnosticado del topic cambiado y respuesta breve sobre cómo proteger `/topic/entregas/{id}`.

**Transferencia al proyecto integrador:** aplica el flujo a una actualización de ruta: fija un contrato de evento, acuerda el destino con Flutter, y decide dónde guardar deduplicación y permisos. El ejemplo no implementa producción, ni integra Flutter o Keycloak.

**Cuándo no usarlo:** si basta con actualizar cada varios minutos, considera una consulta HTTP periódica sencilla. No mantengas conexiones persistentes sin una necesidad de tiempo real.

**Fuentes oficiales:** [Spring WebSocket y STOMP](https://docs.spring.io/spring-framework/reference/web/websocket/stomp.html), [broker simple: límites y alternativas](https://docs.spring.io/spring-framework/reference/web/websocket/stomp/handle-broker-relay.html).

### Tema 6: Archivos y notificaciones push

#### Paso 1 · Objetivo y preparación

Al finalizar podrás rechazar, con detección REAL del tipo de contenido (no la extensión declarada por el cliente), un archivo cuyo contenido no coincide con el tipo MIME que afirma ser.

**Conocimiento previo:** Módulo 13 de este track (transactional outbox).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** La base almacena metadatos y hash; las fotografías viven en almacenamiento de objetos con claves no predecibles y URLs firmadas. Confiar en la extensión del archivo (`.jpg`) o en el `Content-Type` declarado por el cliente para decidir si un archivo es realmente una imagen es una vulnerabilidad conocida: un atacante puede subir cualquier contenido con una extensión falsa.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** detección real de MIME, outbox para notificaciones tras commit.

Se valida el MIME real inspeccionando los primeros bytes del archivo (los "magic numbers" que identifican el formato real, independientemente del nombre declarado), no la extensión ni el header `Content-Type` proporcionado por el cliente. Un outbox (Módulo 13) dispara la notificación push DESPUÉS del commit de la transacción, usando el mecanismo real de `TransactionSynchronizationManager.registerSynchronization(...)` de Spring para garantizar que la notificación solo se envía si la transacción efectivamente se comprometió.

**Analogía:** confiar en la extensión declarada de un archivo es como aceptar la palabra de alguien sobre el contenido de un paquete sellado sin abrirlo; inspeccionar los bytes reales es como pesar y escanear el paquete para confirmar que su contenido real coincide con lo declarado.

**Diagrama:**

```
┌── Extensión .jpg declarada ──────┐   confiar ciegamente = VULNERABLE
└──────────────────────────┘
┌── Bytes reales inspeccionados ───┐   magic number FFD8FF = JPEG real
└──────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Continuando en `gestion-entregas` (o, si prefieres un ejemplo independiente, parte de una carpeta vacía y genera un proyecto nuevo con `mkdir gestion-archivos && cd gestion-archivos && curl -fsSL https://start.spring.io/starter.zip -d dependencies=web -d javaVersion=25 -o app.zip && unzip app.zip`), crea `src/main/java/io/academia/entregas/archivos/ValidadorMime.java`:

```bash
mkdir -p src/main/java/io/academia/entregas/archivos
```

```java
// src/main/java/io/academia/entregas/archivos/ValidadorMime.java
package io.academia.entregas.archivos;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

public class ValidadorMime {

    // detecta el tipo REAL inspeccionando los primeros bytes (magic numbers), no la extensión declarada
    public static boolean esJpegReal(byte[] contenido) throws IOException {
        try (InputStream in = new ByteArrayInputStream(contenido)) {
            String tipoDetectado = java.net.URLConnection.guessContentTypeFromStream(in);
            return "image/jpeg".equals(tipoDetectado);
        }
    }
}
```

Confirma con contenido real (un JPEG mínimo válido frente a texto plano disfrazado de `.jpg`) que la detección funciona por bytes, no por nombre:

```java
// src/test/java/io/academia/entregas/archivos/ValidadorMimeTest.java
package io.academia.entregas.archivos;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ValidadorMimeTest {

    // los primeros bytes reales (magic number) de un archivo JPEG válido
    private static final byte[] JPEG_REAL = new byte[] {
        (byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46
    };

    @Test
    void unContenidoConMagicNumberJpegSeDetectaComoJpegReal() throws Exception {
        assertThat(ValidadorMime.esJpegReal(JPEG_REAL)).isTrue();
    }

    @Test
    void textoPlanoDisfrazadoDeJpgSeRechazaPorSuContenidoReal() throws Exception {
        byte[] textoDisfrazado = "esto es solo texto plano, no una imagen real".getBytes();
        assertThat(ValidadorMime.esJpegReal(textoDisfrazado)).isFalse(); // el NOMBRE podría decir "foto.jpg", el CONTENIDO no miente
    }
}
```

```bash
./mvnw test -Dtest=ValidadorMimeTest
```

**Resultado esperado:** `BUILD SUCCESS` con ambos tests en verde: el contenido con el magic number real de JPEG (`FF D8 FF E0...`) se detecta correctamente como `image/jpeg`; el texto plano (que un atacante podría renombrar a `foto.jpg` para intentar pasar la validación de extensión) se rechaza porque su contenido REAL no coincide con ningún formato de imagen, sin importar cómo se llame el archivo.

**Fallo deliberado:** reemplaza la validación por `nombreArchivo.endsWith(".jpg")` (confiando solo en la extensión del nombre, el patrón inseguro común) y documenta el resultado: un archivo de texto plano renombrado a `malware.jpg` pasaría esta validación exitosamente, porque el nombre "miente" de forma consistente con lo que la validación insegura verifica — diagnostica confirmando por qué la teoría insiste en inspeccionar bytes reales: la extensión del archivo es un dato controlado enteramente por quien lo sube, no una propiedad verificable del contenido. Restaura la validación por magic number antes de continuar.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Agrega una validación de tamaño máximo (por ejemplo, 5MB) y un test que confirme el rechazo de un archivo que excede ese límite, independientemente de si el contenido es un JPEG válido.
2. Agrega un segundo formato válido (PNG, con magic number `89 50 4E 47`) y confirma con un test que ambos formatos válidos son aceptados mientras un tercero no reconocido es rechazado.
3. Documenta en un comentario, usando `TransactionSynchronizationManager.registerSynchronization`, la diferencia entre publicar una notificación push DENTRO de la transacción (arriesgado: podría anunciar algo que luego se revierte) y DESPUÉS del commit (seguro).
4. Escribe de memoria (sin mirar) un validador que inspeccione el magic number real de un archivo, y un test que confirme el rechazo de contenido disfrazado. Compara después contra el patrón del Paso 4.

**Pista:** `java.net.URLConnection.guessContentTypeFromStream(...)` es una utilidad real del propio JDK que inspecciona los primeros bytes del stream para adivinar el tipo de contenido — no requiere ninguna librería externa para esta validación básica, aunque para validación más robusta en producción conviene usar Apache Tika.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio con el método real del JDK que detecta el tipo de contenido inspeccionando los bytes del stream:

```java
String tipoDetectado = java.net.URLConnection.____(in);
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, un validador de MIME real por magic number, y un test que confirme el rechazo de contenido disfrazado con una extensión falsa. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre y evidencia

Ya validas archivos por su contenido real, no por la extensión declarada, y conectas notificaciones push al commit real de una transacción mediante `TransactionSynchronizationManager`. Este era el último tema del módulo; el siguiente módulo del track continúa con garantías de consistencia distribuida sobre este mismo backend. **Evidencia:** entrega el resultado de `ValidadorMimeTest` en verde, y la vulnerabilidad real que documenta el fallo deliberado al validar solo por extensión. Fuentes oficiales: [Spring — Transaction Synchronization](https://docs.spring.io/spring-framework/reference/data-access/transaction/programmatic.html) y [OWASP — Unrestricted File Upload](https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload).

**Errores comunes:** validar únicamente por extensión de archivo o `Content-Type` declarado, ambos controlados por quien sube el archivo; publicar una notificación push antes del commit, arriesgando anunciar un cambio que luego se revierte.

**Cuándo no usarlo:** para archivos generados internamente por el propio sistema (nunca subidos directamente por un usuario externo no confiable), la validación exhaustiva de magic number puede ser una precaución innecesaria frente al riesgo real.

El manejo de archivos y notificaciones push de este tema son extensiones que podrías incorporar al proyecto integrador de este track (microservicio productivo, Módulo 12).

