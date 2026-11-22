# Módulo 23: Caché en memoria con ElastiCache


## Aprende construyendo


### Tema 1: Qué resuelve un caché en memoria — y cuándo no ayuda · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a decidir, con el caso real del panel de seguimiento de RutaFlow, cuándo cachear la posición de un repartidor ayuda y cuándo no. Prerrequisitos: Módulo 17 completo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a decidir, con el caso real del panel de seguimiento de RutaFlow, cuándo cachear la posición de un repartidor ayuda y cuándo no.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en qué resuelve un caché en memoria — y cuándo no ayuda como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que qué resuelve un caché en memoria — y cuándo no ayuda resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Qué resuelve un caché en memoria — y cuándo no ayuda se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Qué resuelve un caché en memoria — y cuándo no ayuda | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses qué resuelve un caché en memoria — y cuándo no ayuda por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: qué resuelve un caché en memoria — y cuándo no ayuda funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Qué resuelve un caché en memoria — y cuándo no ayuda existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve qué resuelve un caché en memoria — y cuándo no ayuda en tu contexto?
2. ¿Cómo sabrías que qué resuelve un caché en memoria — y cuándo no ayuda no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar qué resuelve un caché en memoria — y cuándo no ayuda?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
# archivo: src/labs/modulo-23/tema-1-cache-aside.sh — ejecutar con: bash tema-1-cache-aside.sh
PUERTO=$(aws elasticache describe-replication-groups --replication-group-id demo-cache \
  --query 'ReplicationGroups[0].NodeGroups[0].PrimaryEndpoint.Port' --output text)
redis-cli -h localhost -p "$PUERTO" get usuario:1 || \
  redis-cli -h localhost -p "$PUERTO" set usuario:1 '{"nombre":"Ana"}' EX 60
redis-cli -h localhost -p "$PUERTO" get usuario:1
```

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

</details>

### Tema 2: Arquitectura de ElastiCache en Floci — contenedores reales, no simulación · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a crear demo-cache y confirmar que es un servidor Valkey real, no una simulación del protocolo. Prerrequisitos: Tema 1 de este módulo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a crear demo-cache y confirmar que es un servidor Valkey real, no una simulación del protocolo.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
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

**Dónde se rompe la analogía:** el modelo simplifica la realidad; en producción influyen escala, fallos, costo y contexto.

#### ► CÓMO FUNCIONA
1. Identifica el problema que arquitectura de elasticache en floci — contenedores reales, no simulación resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Arquitectura de ElastiCache en Floci — contenedores reales, no simulación se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Arquitectura de ElastiCache en Floci — contenedores reales, no simulación | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses arquitectura de elasticache en floci — contenedores reales, no simulación por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: arquitectura de elasticache en floci — contenedores reales, no simulación funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Arquitectura de ElastiCache en Floci — contenedores reales, no simulación existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve arquitectura de elasticache en floci — contenedores reales, no simulación en tu contexto?
2. ¿Cómo sabrías que arquitectura de elasticache en floci — contenedores reales, no simulación no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar arquitectura de elasticache en floci — contenedores reales, no simulación?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
# archivo: src/labs/modulo-23/tema-2-contenedor-real.sh — ejecutar con: bash tema-2-contenedor-real.sh
aws elasticache create-replication-group \
  --replication-group-id demo-cache --replication-group-description "Cache del proyecto"
docker ps | grep valkey
```

```bash
aws elasticache create-replication-group --replication-group-id demo-cache --replication-group-description "Cache del proyecto"
docker ps | grep valkey
```

</details>

### Tema 3: Creación de clústeres y conexión con clientes estándar · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a resolver dinámicamente el puerto real de demo-cache (Tema 2), en vez de asumir el 6379 de siempre. Prerrequisitos: Tema 2 de este módulo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a resolver dinámicamente el puerto real de demo-cache (Tema 2), en vez de asumir el 6379 de siempre.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Crear el clúster instala la flota; `describe-replication-groups` es preguntarle a recepción "¿en qué habitación me hospedé?" en vez de asumir que siempre es la misma.

**Conceptos clave:** `CreateReplicationGroup`, `DescribeReplicationGroups`, puerto de conexión dinámico.

Crear un clúster es una sola llamada: `CreateReplicationGroup` con un identificador y una descripción arranca el contenedor Valkey correspondiente. El puerto real de conexión no lo eliges tú directamente: se lo pides a Floci con `DescribeReplicationGroups`, que devuelve el `PrimaryEndpoint.Port` asignado dentro del rango configurado — el mismo patrón de "no asumas el puerto, pregúntalo" que ya viste con otros servicios de Floci respaldados por contenedores reales, como Neptune o RDS. Una vez que tienes el puerto, te conectas con cualquier cliente Redis estándar apuntando a `localhost:<puerto>`.

Eliminar el clúster (`DeleteReplicationGroup`) detiene y elimina el contenedor Docker subyacente, liberando el puerto para futuros clústeres. Como con cualquier caché, recuerda que los datos en modo memoria desaparecen al eliminar el clúster — si necesitas persistencia entre reinicios, ese es un caso de uso distinto (bases de datos) más que de caché.

**Analogía:** pedir el puerto de conexión con `DescribeReplicationGroups` es como preguntar en recepción "¿en qué habitación me hospedé?" en vez de asumir que siempre es la misma: cada clúster nuevo puede terminar en un número de puerto distinto dentro del rango disponible.

**¿Por qué es importante?** Este patrón de "no hardcodees el puerto, consúltalo" es exactamente el que necesitas para escribir código de aplicación robusto que no se rompa si en algún momento cambia la configuración de rango de puertos de tu entorno de Floci.

**Cuándo no usarlo:** no hardcodees `6379` en tu aplicación pensando que siempre será ese puerto; en Floci, con varios clústeres activos, ya viste que no lo es.

**Dónde se rompe la analogía:** el modelo simplifica la realidad; en producción influyen escala, fallos, costo y contexto.

#### ► CÓMO FUNCIONA
1. Identifica el problema que creación de clústeres y conexión con clientes estándar resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Creación de clústeres y conexión con clientes estándar se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Creación de clústeres y conexión con clientes estándar | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses creación de clústeres y conexión con clientes estándar por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: creación de clústeres y conexión con clientes estándar funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Creación de clústeres y conexión con clientes estándar existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve creación de clústeres y conexión con clientes estándar en tu contexto?
2. ¿Cómo sabrías que creación de clústeres y conexión con clientes estándar no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar creación de clústeres y conexión con clientes estándar?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
mkdir ejemplo && cd ejemplo && floci start
```

```bash
PUERTO=$(aws elasticache describe-replication-groups --replication-group-id demo-cache \
  --query 'ReplicationGroups[0].NodeGroups[0].PrimaryEndpoint.Port' --output text)
redis-cli -h localhost -p "$PUERTO" ping
```

```bash
# archivo: src/labs/modulo-23/tema-3-puerto-dinamico.sh — ejecutar con: bash tema-3-puerto-dinamico.sh
PUERTO=$(aws elasticache describe-replication-groups --replication-group-id demo-cache \
  --query 'ReplicationGroups[0].NodeGroups[0].PrimaryEndpoint.Port' --output text)
redis-cli -h localhost -p "$PUERTO" ping
```

</details>

### Tema 4: Autenticación IAM para el plano de datos de ElastiCache · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a crear un usuario ElastiCache con permisos limitados solo a las claves de posición GPS, en vez de una contraseña fija compartida. Prerrequisitos: Tema 3 de este módulo, Módulo 7.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a crear un usuario ElastiCache con permisos limitados solo a las claves de posición GPS, en vez de una contraseña fija compartida.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
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

**Dónde se rompe la analogía:** el modelo simplifica la realidad; en producción influyen escala, fallos, costo y contexto.

#### ► CÓMO FUNCIONA
1. Identifica el problema que autenticación iam para el plano de datos de elasticache resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Autenticación IAM para el plano de datos de ElastiCache se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Autenticación IAM para el plano de datos de ElastiCache | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses autenticación iam para el plano de datos de elasticache por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: autenticación iam para el plano de datos de elasticache funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Autenticación IAM para el plano de datos de ElastiCache existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve autenticación iam para el plano de datos de elasticache en tu contexto?
2. ¿Cómo sabrías que autenticación iam para el plano de datos de elasticache no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar autenticación iam para el plano de datos de elasticache?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
# archivo: src/labs/modulo-23/tema-4-usuario-iam.sh — ejecutar con: bash tema-4-usuario-iam.sh
aws elasticache create-user --user-id alice --user-name alice --engine redis \
  --access-string "on ~* +@all" --no-no-password-required
aws elasticache describe-users --query "Users[?UserId=='alice']"
```

```bash
aws elasticache create-user --user-id lector-posiciones --user-name lector-posiciones --engine redis \
  --access-string "on ~posicion:* +get" --no-no-password-required
aws elasticache describe-users --query "Users[?UserId=='lector-posiciones']"
```

</details>

### Laboratorio 23.1 — Clúster ElastiCache con cache-aside

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por laboratorio 23.1 — clúster elasticache con cache-aside con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender laboratorio 23.1 — clúster elasticache con cache-aside te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en laboratorio 23.1 — clúster elasticache con cache-aside como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que laboratorio 23.1 — clúster elasticache con cache-aside resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Laboratorio 23.1 — Clúster ElastiCache con cache-aside se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Laboratorio 23.1 — Clúster ElastiCache con cache-aside | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses laboratorio 23.1 — clúster elasticache con cache-aside por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: laboratorio 23.1 — clúster elasticache con cache-aside funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Laboratorio 23.1 — Clúster ElastiCache con cache-aside existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve laboratorio 23.1 — clúster elasticache con cache-aside en tu contexto?
2. ¿Cómo sabrías que laboratorio 23.1 — clúster elasticache con cache-aside no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar laboratorio 23.1 — clúster elasticache con cache-aside?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar laboratorio 23.1 — clúster elasticache con cache-aside.

</details>

### Laboratorio 23.2 — Usuario con autenticación IAM

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Este tema te guía por laboratorio 23.2 — usuario con autenticación iam con foco en comprensión antes de implementación.

#### ► LA IDEA EN UNA FRASE
**Entender laboratorio 23.2 — usuario con autenticación iam te permite tomar mejores decisiones técnicas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en laboratorio 23.2 — usuario con autenticación iam como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que laboratorio 23.2 — usuario con autenticación iam resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Laboratorio 23.2 — Usuario con autenticación IAM se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Laboratorio 23.2 — Usuario con autenticación IAM | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses laboratorio 23.2 — usuario con autenticación iam por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: laboratorio 23.2 — usuario con autenticación iam funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Laboratorio 23.2 — Usuario con autenticación IAM existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve laboratorio 23.2 — usuario con autenticación iam en tu contexto?
2. ¿Cómo sabrías que laboratorio 23.2 — usuario con autenticación iam no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar laboratorio 23.2 — usuario con autenticación iam?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar laboratorio 23.2 — usuario con autenticación iam.

</details>
