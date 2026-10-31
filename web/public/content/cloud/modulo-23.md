# Módulo 23: Caché en memoria con ElastiCache


## Aprende construyendo

### Tema 1: Qué resuelve un caché en memoria — y cuándo no ayuda

#### Paso 1 · Objetivo y preparación
Al finalizar vas a decidir, con el caso real del panel de seguimiento de RutaFlow, cuándo cachear la posición de un repartidor ayuda y cuándo no. Prerrequisitos: Módulo 17 completo.
#### Paso 2 · Contexto y caso real
El panel de seguimiento consulta la posición GPS más reciente de cada conductor cada pocos segundos para refrescar el mapa — repetir esa consulta contra `ShipmentEvents` (Módulo 4) en cada refresco de cada cliente conectado sobrecargaría la tabla sin necesidad.
#### Paso 3 · Teoría, modelo mental y analogía
Cache-aside es una estantería de consulta rápida con vencimiento: preguntás primero ahí, y solo vas al almacén completo (la base de datos) si no está.

**Conceptos clave:** latencia de lectura, cache-aside, cache hit / cache miss, TTL.

Una base de datos como RDS o DynamoDB, por bien indexada que esté, sigue siendo más lenta que leer un valor directamente desde memoria RAM: una consulta a RDS puede tardar varios milisegundos, mientras que una lectura en Redis/Valkey típicamente tarda menos de un milisegundo. Cuando una aplicación consulta el mismo dato con mucha frecuencia y ese dato no cambia todo el tiempo —el perfil de un usuario, el catálogo de productos, un conteo de "me gusta"—, guardarlo en un caché en memoria evita repetir la consulta costosa una y otra vez.

El patrón más común para usar un caché es cache-aside: la aplicación primero pregunta al caché (`GET`), y si el dato no está ahí (cache miss), lo busca en la base de datos, lo guarda en el caché con un tiempo de vida (TTL) y lo devuelve; la siguiente vez que alguien pida el mismo dato dentro de ese TTL, el caché lo devuelve directamente (cache hit) sin tocar la base de datos. Un caché no ayuda —y puede incluso complicar— cuando los datos cambian constantemente y necesitas leer siempre el valor más reciente sin ninguna tolerancia a datos ligeramente desactualizados: en ese caso, la complejidad de mantener el caché sincronizado no compensa la ganancia de velocidad.

**Analogía:** un caché en memoria es como tener las respuestas a las preguntas más frecuentes anotadas en una pizarra junto a tu escritorio: para esas preguntas no necesitas ir a la biblioteca (la base de datos) cada vez, pero si la respuesta cambia, tienes que acordarte de actualizar la pizarra o alguien recibirá una respuesta vieja.

**¿Por qué es importante?** Saber reconocer cuándo un problema es "de lectura repetida sobre datos que cambian poco" —el caso ideal para caché— frente a "de datos que cambian todo el tiempo" es la decisión de diseño más importante antes de añadir esta pieza a una arquitectura, más importante que cualquier detalle de configuración.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-23/tema-1-cache-aside.sh — ejecutar con: bash tema-1-cache-aside.sh
PUERTO=$(aws elasticache describe-replication-groups --replication-group-id demo-cache \
  --query 'ReplicationGroups[0].NodeGroups[0].PrimaryEndpoint.Port' --output text)
redis-cli -h localhost -p "$PUERTO" get usuario:1 || \
  redis-cli -h localhost -p "$PUERTO" set usuario:1 '{"nombre":"Ana"}' EX 60
redis-cli -h localhost -p "$PUERTO" get usuario:1
```

`--replication-group-id` identifica el grupo de caché del que querés el puerto; `redis-cli` es el cliente oficial de línea de comandos de Redis (y compatible con Valkey, su fork) — con `-h` y `-p` le decís a qué host y puerto conectarse, y después le pasás comandos de Redis normales (`get`, `set`).

**Resultado esperado:** la primera lectura falla (cache miss), así que el script guarda el valor con TTL de 60 s; la segunda `get` lo devuelve directamente (cache hit) sin volver a tocar ninguna base de datos.

**Modifica esto:** repite el `get` después de 60 segundos y confirma que el valor ya no está — reconstrúyelo consultando "la base de datos" (en este ejercicio, el mismo JSON) y guárdalo de nuevo con `SET ... EX`.

**Cuándo no usarlo:** no apliques cache-aside a datos que deban leerse siempre actualizados al instante (saldo de una cuenta antes de una transferencia, por ejemplo); ahí la inconsistencia temporal del caché es inaceptable.

**Cómo crece tu proyecto:** este patrón cachea la posición GPS más reciente de un repartidor para no golpear la base de datos en cada refresco del mapa.

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Cachea una consulta de seguimiento y mide aciertos, fallos y antigüedad. Actualiza la entrega y comprueba cómo se invalida la entrada; una respuesta rápida con estado obsoleto no cuenta como éxito.

#### Paso 4 · Demostración guiada
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir el archivo del ejemplo dentro.
```bash
mkdir ejemplo && cd ejemplo && floci start
```

```bash
PUERTO=$(aws elasticache describe-replication-groups --replication-group-id demo-cache \
  --query 'ReplicationGroups[0].NodeGroups[0].PrimaryEndpoint.Port' --output text)
redis-cli -h localhost -p "$PUERTO" get posicion:c-891 || \
  redis-cli -h localhost -p "$PUERTO" set posicion:c-891 '{"lat":4.6097,"lon":-74.0817}' EX 10
redis-cli -h localhost -p "$PUERTO" get posicion:c-891
```

**Ejecuta el ejemplo** (con Floci corriendo en local, ejecuta el comando contra el emulador):

```bash
floci up
aws --endpoint-url http://localhost:4566 sts get-caller-identity
```
Confirma la respuesta del servicio emulado.

Resultado esperado: la primera lectura falla (cache miss, nadie cacheó esa posición todavía), así que el script la guarda con TTL de 10 segundos; la segunda lectura la devuelve directamente (cache hit) sin volver a consultar `ShipmentEvents`.
#### Paso 5 · Práctica guiada
Pista: guardá la misma posición con `EX 0` (TTL cero) — ese es el fallo deliberado de rendimiento: la clave expira (o nunca llega a existir de forma útil) de inmediato, así que CADA lectura vuelve a ser un cache miss, forzando una consulta a la base de datos en cada refresco del mapa — exactamente lo que el caché debía evitar.
#### Paso 6 · Práctica independiente
Repetí la lectura después de que pasen los 10 segundos del Paso 4 y confirmá el cache miss; medí (con `time`) cuánto tarda un `GET` que sí encuentra la clave contra uno que no, para ver la diferencia real de latencia entre hit y miss.
#### Paso 7 · Cierre
Entregá el ciclo completo de miss→set→hit del Paso 4, el TTL cero roto del Paso 5, y la medición de latencia del Paso 6; explicá por qué la posición GPS de un conductor es un buen candidato para cache-aside y el saldo de una factura (Módulo 13) no lo sería. Siguiente paso: Valkey. Errores comunes: datos obsoletos y cachear errores. Fuente oficial: https://docs.aws.amazon.com/whitepapers/latest/database-caching-strategies-using-redis/database-caching-strategies-using-redis.html.

### Tema 2: Arquitectura de ElastiCache en Floci — contenedores reales, no simulación

#### Paso 1 · Objetivo y preparación
Al finalizar vas a crear `demo-cache` y confirmar que es un servidor Valkey real, no una simulación del protocolo. Prerrequisitos: Tema 1 de este módulo.
#### Paso 2 · Contexto y caso real
Varios nodos de reparto (Módulo 21) van a necesitar leer y escribir posiciones GPS en el mismo almacén compartido — no uno por instancia, sino uno centralizado al que todos se conectan.
#### Paso 3 · Teoría, modelo mental y analogía
Valkey es un almacén en memoria real; el proxy TCP de Floci conecta tu cliente Redis normal con ese mismo servidor, sin ninguna traducción intermedia.

**Conceptos clave:** contenedor Valkey/Redis real, proxy TCP, `CreateReplicationGroup`.

A diferencia de servicios donde Floci simula el comportamiento en proceso, ElastiCache gestiona contenedores Docker reales de Valkey (el fork open-source de Redis) y expone conexiones proxy TCP hacia ellos: cuando llamas a `CreateReplicationGroup`, Floci realmente lanza un contenedor `valkey/valkey:8` y lo conecta a un puerto del host dentro del rango configurado (por defecto 6379–6399, el mismo rango de puertos que usa Redis por convención). El resultado es que cualquier cliente Redis estándar —`redis-cli`, la librería de Redis en tu lenguaje favorito— funciona sin ninguna adaptación especial, porque estás hablando el protocolo RESP real contra un servidor Redis/Valkey real.

Esto tiene una implicación práctica directa: todo lo que sabes sobre comandos de Redis (`SET`, `GET`, `EXPIRE`, `INCR`, estructuras de datos como listas o hashes) funciona exactamente igual aquí que contra un ElastiCache real en AWS, porque el motor subyacente es el mismo software, solo que corriendo en tu máquina en vez de en la infraestructura de AWS.

**Analogía:** ElastiCache en Floci es como practicar con el mismo modelo de instrumento musical que usarás en el concierto real, solo que ensayando en tu casa en vez de en la sala de conciertos: la técnica que desarrollas se transfiere directamente.

**¿Por qué es importante?** Que el motor sea real —no una reimplementación aproximada del protocolo Redis— es lo que garantiza que comandos avanzados, estructuras de datos complejas y comportamientos de expiración se comporten exactamente igual que en producción, sin sorpresas al migrar.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-23/tema-2-contenedor-real.sh — ejecutar con: bash tema-2-contenedor-real.sh
aws elasticache create-replication-group \
  --replication-group-id demo-cache --replication-group-description "Cache del proyecto"
docker ps | grep valkey
```

`--replication-group-description` es la bandera que agrega solo una etiqueta legible para identificar el propósito de este grupo (no afecta su comportamiento).

**Resultado esperado:** `docker ps` muestra un contenedor real `valkey/valkey:8` corriendo — la prueba de que `CreateReplicationGroup` no es un registro simulado, sino un servidor Redis/Valkey real que puedes inspeccionar con las mismas herramientas de Docker que usaste en el Módulo 21.

**Modifica esto:** conéctate con `docker exec -it <container-id> valkey-cli info server` y busca el campo `redis_version` — confirma que es el motor real, no una reimplementación del protocolo.

**Cuándo no usarlo:** no asumas que el rendimiento medido aquí (un solo contenedor en tu laptop) predice la latencia de un ElastiCache real con réplicas distribuidas geográficamente; para eso necesitas medir contra AWS real.

**Cómo crece tu proyecto:** `demo-cache` es el clúster que usará el resto del track para cachear consultas repetidas del panel de seguimiento.

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Conecta el cliente de caché del proyecto al servicio local y verifica escritura, lectura y expiración. Reinicia el contenedor y registra qué persiste realmente en la configuración usada.

#### Paso 4 · Demostración guiada
```bash
aws elasticache create-replication-group --replication-group-id demo-cache --replication-group-description "Cache del proyecto"
docker ps | grep valkey
```
Resultado esperado: `docker ps` muestra un contenedor real `valkey/valkey:8` corriendo — la prueba de que `CreateReplicationGroup` lanzó un servidor Redis/Valkey de verdad, no un registro simulado en la base de datos interna de Floci.
#### Paso 5 · Práctica guiada
Pista: conectate con `redis-cli -h localhost -p 6379` sin consultar primero qué puerto real le tocó a `demo-cache` — ese es el fallo deliberado: si ese puerto fijo no es el que Floci asignó de verdad, la conexión falla o, peor, conecta accidentalmente a OTRO clúster que sí esté en el puerto 6379.
#### Paso 6 · Práctica independiente
Conectate con `docker exec -it <container-id> valkey-cli info server` y confirmá el campo `redis_version` real, y probá `SET`/`GET`/`EXPIRE` directamente para confirmar que el motor responde exactamente como un Redis real, no una reimplementación aproximada.
#### Paso 7 · Cierre
Entregá el contenedor real confirmado del Paso 4, el error de puerto fijo del Paso 5, y la verificación de versión del Paso 6; explicá por qué que el motor sea real (no simulado) importa para confiar en el comportamiento de comandos avanzados. Siguiente paso: descubrimiento. Errores comunes: tratar caché como fuente permanente y no limitar memoria. Fuente oficial: https://docs.aws.amazon.com/elasticache/latest/dg/WhatIs.html.

### Tema 3: Creación de clústeres y conexión con clientes estándar

#### Paso 1 · Objetivo y preparación
Al finalizar vas a resolver dinámicamente el puerto real de `demo-cache` (Tema 2), en vez de asumir el 6379 de siempre. Prerrequisitos: Tema 2 de este módulo.
#### Paso 2 · Contexto y caso real
Si el servicio de RutaFlow que lee posiciones GPS tuviera el puerto de `demo-cache` hardcodeado y alguien creara un segundo clúster de prueba, el puerto real podría no ser el que el código asume.
#### Paso 3 · Teoría, modelo mental y analogía
Crear el clúster instala la flota; `describe-replication-groups` es preguntarle a recepción "¿en qué habitación me hospedé?" en vez de asumir que siempre es la misma.
#### Paso 4 · Demostración guiada
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir el archivo del ejemplo dentro.
```bash
mkdir ejemplo && cd ejemplo && floci start
```

```bash
PUERTO=$(aws elasticache describe-replication-groups --replication-group-id demo-cache \
  --query 'ReplicationGroups[0].NodeGroups[0].PrimaryEndpoint.Port' --output text)
redis-cli -h localhost -p "$PUERTO" ping
```

**Ejecuta el ejemplo** (con Floci corriendo en local, ejecuta el comando contra el emulador):

```bash
floci up
aws --endpoint-url http://localhost:4566 sts get-caller-identity
```
Confirma la respuesta del servicio emulado.

Resultado esperado: el puerto devuelto cae dentro del rango 6379–6399, y `ping` contra ese puerto responde `PONG` — el código nunca tuvo que adivinar el número.
#### Paso 5 · Práctica guiada
Pista: probá `aws elasticache describe-replication-groups --replication-group-id demo-cache-que-no-existe` — ese es el fallo deliberado: `ReplicationGroupNotFoundFault`, dejando claro que consultar el endpoint de un grupo que nunca creaste no devuelve un puerto "por defecto", directamente falla.
#### Paso 6 · Práctica independiente
Creá un segundo clúster (`demo-cache-2`) y confirmá que `describe-replication-groups` le asigna un puerto distinto al de `demo-cache` — la prueba concreta de que el puerto no se puede asumir fijo en el código.
#### Paso 7 · Cierre
Entregá el puerto resuelto y el `PONG` del Paso 4, el error de grupo inexistente del Paso 5, y los dos puertos distintos del Paso 6; explicá por qué hardcodear `6379` en el servicio de RutaFlow sería un error incluso si "funciona hoy". Siguiente paso: autenticación. Errores comunes: fijar IP y no esperar estado available. Fuente oficial: https://docs.aws.amazon.com/cli/latest/reference/elasticache/describe-replication-groups.html.
**Conceptos clave:** `CreateReplicationGroup`, `DescribeReplicationGroups`, puerto de conexión dinámico.

Crear un clúster es una sola llamada: `CreateReplicationGroup` con un identificador y una descripción arranca el contenedor Valkey correspondiente. El puerto real de conexión no lo eliges tú directamente: se lo pides a Floci con `DescribeReplicationGroups`, que devuelve el `PrimaryEndpoint.Port` asignado dentro del rango configurado — el mismo patrón de "no asumas el puerto, pregúntalo" que ya viste con otros servicios de Floci respaldados por contenedores reales, como Neptune o RDS. Una vez que tienes el puerto, te conectas con cualquier cliente Redis estándar apuntando a `localhost:<puerto>`.

Eliminar el clúster (`DeleteReplicationGroup`) detiene y elimina el contenedor Docker subyacente, liberando el puerto para futuros clústeres. Como con cualquier caché, recuerda que los datos en modo memoria desaparecen al eliminar el clúster — si necesitas persistencia entre reinicios, ese es un caso de uso distinto (bases de datos) más que de caché.

**Analogía:** pedir el puerto de conexión con `DescribeReplicationGroups` es como preguntar en recepción "¿en qué habitación me hospedé?" en vez de asumir que siempre es la misma: cada clúster nuevo puede terminar en un número de puerto distinto dentro del rango disponible.

**¿Por qué es importante?** Este patrón de "no hardcodees el puerto, consúltalo" es exactamente el que necesitas para escribir código de aplicación robusto que no se rompa si en algún momento cambia la configuración de rango de puertos de tu entorno de Floci.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-23/tema-3-puerto-dinamico.sh — ejecutar con: bash tema-3-puerto-dinamico.sh
PUERTO=$(aws elasticache describe-replication-groups --replication-group-id demo-cache \
  --query 'ReplicationGroups[0].NodeGroups[0].PrimaryEndpoint.Port' --output text)
redis-cli -h localhost -p "$PUERTO" ping
```

**Resultado esperado:** `describe-replication-groups` devuelve un número de puerto dentro del rango 6379–6399; `redis-cli ping` contra ese puerto responde `PONG`.

**Modifica esto:** crea un segundo clúster (`demo-cache-2`) y confirma que `describe-replication-groups` le asigna un puerto distinto al primero — la prueba de que no puedes asumir un puerto fijo.

**Cuándo no usarlo:** no hardcodees `6379` en tu aplicación pensando que siempre será ese puerto; en Floci, con varios clústeres activos, ya viste que no lo es.

**Cómo crece tu proyecto:** el servicio lee este puerto dinámicamente desde `describe-replication-groups` al arrancar, en vez de asumirlo fijo en su configuración.

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Levanta un clúster de prueba y conecta el backend con su cliente estándar. Prueba reconexión después de un reinicio y conserva el error controlado que aparece mientras el servicio no está disponible.

### Tema 4: Autenticación IAM para el plano de datos de ElastiCache

#### Paso 1 · Objetivo y preparación
Al finalizar vas a crear un usuario ElastiCache con permisos limitados solo a las claves de posición GPS, en vez de una contraseña fija compartida. Prerrequisitos: Tema 3 de este módulo, Módulo 7.
#### Paso 2 · Contexto y caso real
El servicio que lee posiciones GPS de `demo-cache` no debería poder tocar ninguna otra clave que RutaFlow guarde ahí en el futuro — el mismo principio de mínimo privilegio del Módulo 7, aplicado al plano de datos de la caché.
#### Paso 3 · Teoría, modelo mental y analogía
La cadena de acceso (access string) es un pase firmado con permisos y vencimiento: dice exactamente qué claves y comandos puede usar quien lo porta, nada más.

**Conceptos clave:** usuario ElastiCache, cadena de acceso (access string), `ValidateIamAuthToken`.

`--user-id` es el identificador interno del usuario; `--user-name` es el nombre con el que se conecta (pueden diferir, pero acá coinciden); `--access-string` es esa cadena RBAC de Redis que define qué claves y comandos puede tocar; `--no-no-password-required` es la bandera que, con la doble negación de su propio nombre, hace que este usuario SÍ necesite autenticarse — la bandera contraria, `--no-password-required`, crearía un usuario sin ninguna verificación.

ElastiCache moderno soporta autenticación basada en IAM, no solo contraseñas estáticas: creas un usuario con `CreateUser`, especificando una cadena de acceso al estilo RBAC de Redis (por ejemplo, `"on ~* +@all"` para acceso total a todas las claves y comandos), y luego los clientes generan un token de autenticación IAM temporal en vez de usar una contraseña fija almacenada en configuración. Floci implementa `ValidateIamAuthToken` para verificar esos tokens exactamente con la misma lógica que el ElastiCache real, lo que te permite practicar este patrón de autenticación más seguro —sin secretos de larga duración— sin necesidad de una cuenta AWS real.

Este es el mismo principio de seguridad que ya viste con roles IAM para Lambda o EC2: preferir credenciales temporales derivadas de identidad sobre contraseñas estáticas que alguien podría filtrar accidentalmente en un repositorio de código.

**Analogía:** un usuario ElastiCache con auth IAM es como un guardia de seguridad que en vez de pedirte una llave física que podrías perder o prestar, verifica tu identificación institucional vigente en el momento — mucho más difícil de robar o reutilizar indebidamente.

**¿Por qué es importante?** Adoptar autenticación IAM en vez de contraseñas de Redis hardcodeadas es una de las mejoras de seguridad más directas que puedes aplicar a una arquitectura de caché en producción real.

**Practícalo tú:**

```bash
# archivo: src/labs/modulo-23/tema-4-usuario-iam.sh — ejecutar con: bash tema-4-usuario-iam.sh
aws elasticache create-user --user-id alice --user-name alice --engine redis \
  --access-string "on ~* +@all" --no-no-password-required
aws elasticache describe-users --query "Users[?UserId=='alice']"
```

**Resultado esperado:** `describe-users` muestra a `alice` con `AccessString: "on ~* +@all"` y autenticación IAM habilitada, sin ninguna contraseña estática almacenada.

**Modifica esto:** crea un segundo usuario con una cadena de acceso restringida (`"on ~pedidos:* +get +set"`) y compárala con la de `alice`: ese es el patrón RBAC de Redis limitando qué claves y comandos puede usar cada identidad.

**Cuándo no usarlo:** no mezcles usuarios con contraseña fija y usuarios IAM en el mismo clúster sin una razón clara; complica la auditoría de quién accedió con qué mecanismo.

**Cómo crece tu proyecto:** `alice` representa el servicio que lee y escribe posiciones en caché sin guardar ningún secreto de Redis en su configuración.

---

**Transferencia al proyecto integrador «Cloud local multi-nube»:** Documenta la obtención y renovación de credenciales del cliente de caché. Prueba expiración en un entorno compatible y evita confundir permisos para crear el clúster con autorización para leer sus datos.

#### Paso 4 · Demostración guiada
```bash
aws elasticache create-user --user-id lector-posiciones --user-name lector-posiciones --engine redis \
  --access-string "on ~posicion:* +get" --no-no-password-required
aws elasticache describe-users --query "Users[?UserId=='lector-posiciones']"
```
Resultado esperado: `describe-users` muestra a `lector-posiciones` con `AccessString: "on ~posicion:* +get"` — ese usuario puede leer claves `posicion:*`, pero no escribirlas ni tocar ninguna otra clave de `demo-cache`.
#### Paso 5 · Práctica guiada
Pista: generá un token IAM para este usuario y esperá a que expire (o simulá la expiración) antes de usarlo — ese es el fallo deliberado: `ValidateIamAuthToken` lo rechaza igual que un ElastiCache real rechazaría un token vencido, sin excepciones por "todavía está cerca de la hora de expiración".
#### Paso 6 · Práctica independiente
Probá con ese mismo usuario un comando `SET posicion:c-891 ...` (escritura, no solo lectura) y confirmá que se rechaza por la cadena de acceso (`+get` sin `+set`); documentá qué cadena de acceso le darías en cambio al servicio que SÍ escribe las posiciones.
#### Paso 7 · Cierre
Entregá el usuario de solo lectura creado, el token expirado rechazado del Paso 5, y la escritura denegada del Paso 6; explicá por qué un usuario con `+@all` sobre `~*` (como el de ejemplo genérico de la documentación) sería un error de mínimo privilegio para este caso específico. Siguiente paso: eventos. Errores comunes: tokens en logs y permisos amplios. Fuente oficial: https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/auth-iam.html.

## Laboratorio práctico

> Este laboratorio asume que ya ejecutaste `floci start` y `eval $(floci env)` (Módulo 1) en tu sesión de terminal, así que los comandos de `aws` no repiten `--endpoint-url`.

**Objetivo del laboratorio:** crear un clúster ElastiCache, conectarte con `redis-cli`, practicar el patrón cache-aside con `SET`/`GET`/`EXPIRE`, y crear un usuario con autenticación IAM.

**Requisitos previos:** Floci corriendo con el rango de puertos de ElastiCache expuesto (`"6379-6399:6379-6399"` en tu `docker-compose.yml`) y el socket Docker montado. Necesitas `redis-cli` instalado localmente (se incluye con la mayoría de instalaciones de Redis/Valkey, o vía `brew install redis` / `apt install redis-tools`).

### Laboratorio 23.1 — Clúster ElastiCache con cache-aside

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Crea el clúster | `aws elasticache create-replication-group --replication-group-id mi-cache --replication-group-description "Cache del curso"` | Lanza un contenedor Valkey real | Un `ReplicationGroupId` con estado `creating` |
| 2 | Obtén el puerto de conexión | `aws elasticache describe-replication-groups --replication-group-id mi-cache --query 'ReplicationGroups[0].NodeGroups[0].PrimaryEndpoint.Port' --output text` | El puerto real asignado dentro del rango configurado | Un número de puerto, ej. `6379` |
| 3 | Verifica la conexión | `redis-cli -h localhost -p <puerto> ping` | Confirma que el servidor Valkey responde | `PONG` |
| 4 | Simula un cache miss y guarda el resultado | `redis-cli -h localhost -p <puerto> set usuario:1 '{"nombre":"Ana"}' EX 60` | Guarda un valor con TTL de 60 segundos, como haría tu app tras consultar la base de datos | `OK` |
| 5 | Simula un cache hit | `redis-cli -h localhost -p <puerto> get usuario:1` | Lee el valor sin tocar ninguna base de datos | El JSON guardado en el paso anterior |
| 6 | Verifica la expiración | `redis-cli -h localhost -p <puerto> ttl usuario:1` | Confirma cuántos segundos quedan antes de que el valor expire | Un número menor o igual a 60 |

### Laboratorio 23.2 — Usuario con autenticación IAM

| Paso | Acción | Comando | Explicación | Salida esperada |
|---|---|---|---|---|
| 1 | Crea un usuario ElastiCache | `aws elasticache create-user --user-id alice --user-name alice --engine redis --access-string "on ~* +@all" --no-no-password-required` | Crea un usuario habilitado para autenticación IAM en vez de contraseña fija | Un `UserId` confirmado |
| 2 | Lista los usuarios | `aws elasticache describe-users` | Confirma la cadena de acceso configurada | El usuario `alice` con `AccessString: "on ~* +@all"` |

**Verificación:** el laboratorio se considera exitoso si `redis-cli ping` devuelve `PONG` contra el puerto real reportado por `describe-replication-groups`, el valor guardado con `SET ... EX 60` se recupera correctamente con `GET`, y `describe-users` confirma la creación del usuario `alice` con la cadena de acceso configurada.

**Errores comunes y soluciones**

- **`redis-cli` no puede conectar (`Connection refused`).** El rango de puertos `6379-6399` no está expuesto en tu `docker-compose.yml`, o estás usando el puerto por defecto 6379 en vez del que realmente devolvió `describe-replication-groups`.
- **`CreateReplicationGroup` se queda en estado `creating` indefinidamente.** El socket Docker no está montado (`-v /var/run/docker.sock:/var/run/docker.sock`); sin él, Floci no puede lanzar el contenedor Valkey real.
- **El valor desaparece antes de lo esperado.** Revisaste el TTL con `TTL` y confirmaste que expiró correctamente: eso es el comportamiento esperado de `EX`, no un error — ajusta el tiempo de vida si necesitas que dure más.

---
