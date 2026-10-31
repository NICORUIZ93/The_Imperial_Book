# Módulo 17: Diseño de sistemas distribuidos: borde, datos y capacidad

## Aprende construyendo

Cada Tema parte de una carpeta vacía y se verifica con comandos reales.

### Tema 1: El borde: balanceo, proxy inverso, CDN y límites de tasa

#### Paso 1 · Objetivo y preparación

Al finalizar vas a poner nginx delante de dos instancias de una API, a comprobar el reparto con la respuesta de cada instancia, y a imponer un límite de tasa por IP que devuelve 429 cuando se excede.

**Conocimiento previo:** Módulo 2 de este track (Docker y Compose) y `curl` instalado.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** La app móvil de RutaFlow reintenta cada 200 ms cuando una petición tarda más de lo que su usuario tolera; con 300 dispositivos abiertos, ese reintento convierte una API que atiende 40 peticiones por segundo en una que recibe ráfagas de miles. El borde es el único punto donde puedes frenar eso sin tocar el código de la aplicación, y donde puedes añadir una instancia más sin que el cliente se entere. También es el punto donde un error de configuración deja todo el sistema inaccesible.

En el proyecto integrador, este borde separa una demostración local de un sistema que atiende a varios clientes sin degradarse.

#### Paso 3 · Teoría, modelo mental y analogía

**Conceptos clave:** proxy inverso, `upstream`, balanceo round robin y `least_conn`, `limit_req` (leaky bucket), CDN, `Cache-Control`, hit ratio.

El cliente habla con una sola dirección; nginx decide a cuál instancia del `upstream` reenvía y reescribe cabeceras (`Host`, `X-Real-IP`). Por defecto el reparto es round robin; `least_conn` elige la instancia con menos conexiones cuando las respuestas duran muy distinto. El límite de tasa usa una **zona** compartida por todos los workers: una clave (la IP, una cabecera) y una tasa con ráfaga. Una CDN es la misma caché en el borde, distribuida geográficamente y con TTL: solo acelera lo reutilizable entre usuarios.

Tres límites antes de configurar nada: el borde no acelera el origen, un limitador por IP castiga a quienes comparten una salida NAT, y una CDN no ayuda con respuestas personalizadas ni con hit ratio bajo. Además, cada nginx cuenta sus propias ráfagas: con tres instancias, el límite efectivo se triplica.

**Analogía:** el borde es la recepción de un edificio. Recibe a todo el mundo, comprueba si hay capacidad, puede pedirte que esperes en la fila o no dejarte entrar, y reparte a los visitantes entre las ventanillas disponibles. Lo que no puede es hacer que el trámite de adentro sea más rápido.

**Diagrama:**

```mermaid
flowchart LR
    U["Cliente"] --> CDN["CDN"]
    CDN --> LB["Balanceador nginx"]
    LB --> A1["App 1"]
    LB --> A2["App 2"]
    A1 --> R["Redis: límite de tasa"]
    A1 --> D[("PostgreSQL")]
    A2 --> R
    A2 --> D
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía, crea la estructura del borde:

```bash
mkdir -p academia-devops/src/modulo17/borde/api
cd academia-devops/src/modulo17/borde
```

Crea `docker-compose.yml` con dos instancias de la API y nginx delante:

```yaml
services:
  api-1:
    image: node:24-alpine
    working_dir: /app
    command: ["node", "server.mjs"]
    environment:
      NOMBRE: api-1
    volumes:
      - ./api:/app:ro
  api-2:
    image: node:24-alpine
    working_dir: /app
    command: ["node", "server.mjs"]
    environment:
      NOMBRE: api-2
    volumes:
      - ./api:/app:ro
  nginx:
    image: nginx:stable-alpine
    ports:
      - "8080:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - api-1
      - api-2
```

Crea `api/server.mjs`, que responde con su propio nombre para que puedas ver quién atendió:

```bash
cat > api/server.mjs <<'EOF'
import http from 'node:http';

const nombre = process.env.NOMBRE ?? 'api-local';

http.createServer((req, res) => {
  if (req.url === '/api/salud') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ servicio: nombre, puerto: 8081 }));
    return;
  }
  res.writeHead(404, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ error: 'ruta no encontrada' }));
}).listen(8081, () => console.log(`${nombre} escuchando en :8081`));
EOF
```

Crea `nginx.conf` con el `upstream`, el límite por IP y el estado 429:

```bash
cat > nginx.conf <<'EOF'
worker_processes auto;

events {
    worker_connections 1024;
}

http {
    log_format borde '$remote_addr "$request" $status upstream=$upstream_addr';
    access_log /var/log/nginx/access.log borde;

    limit_req_zone $binary_remote_addr zone=api_ip:10m rate=5r/s;

    upstream api_backend {
        server api-1:8081;
        server api-2:8081;
    }

    server {
        listen 80;
        limit_req_status 429;

        location /api/ {
            limit_req zone=api_ip burst=5 nodelay;
            proxy_pass http://api_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
EOF
docker compose up -d
docker compose exec nginx nginx -t
for i in 1 2 3 4; do curl -s http://localhost:8080/api/salud; echo; done
```

**Explicación línea por línea:** `upstream api_backend` declara los destinos y `proxy_pass` reenvía a ese grupo; dentro del contenedor, `api-1` y `api-2` los resuelve Docker, nunca `localhost`, que apuntaría al propio nginx. `limit_req_zone` se declara una sola vez en `http` porque define el estado compartido; `limit_req` vive en el `location` que proteges y referencia la zona por nombre. `limit_req_status 429` cambia el 503 por defecto por «demasiadas peticiones».

**Resultado esperado:**

```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
{"servicio":"api-1","puerto":8081}
{"servicio":"api-2","puerto":8081}
{"servicio":"api-1","puerto":8081}
{"servicio":"api-2","puerto":8081}
```

**Fallo deliberado:** cambia `zone=api_ip` por `zone=api` en la línea 23 de `nginx.conf` y ejecuta `docker compose exec nginx nginx -t`. nginx responde `nginx: [emerg] unknown limit_req_zone "api" in /etc/nginx/nginx.conf:23` y `nginx: configuration file /etc/nginx/nginx.conf test failed`. Diagnostica: el error no señala la declaración, sino el `limit_req` que la referencia. `-t` valida antes de recargar; sin esa prueba, el error llega con el tráfico ya entrando. Restaura `api_ip` y recarga con `docker compose exec nginx nginx -s reload`.

#### Paso 5 · Práctica guiada

Ejecuta veinte peticiones seguidas con `for i in $(seq 1 20); do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/api/salud; done` y localiza en `docker compose logs nginx` la línea `limiting requests, excess: ... by zone "api_ip"`. Después añade una segunda zona por cabecera (`limit_req_zone $http_x_api_key zone=api_key:10m rate=20r/s;`) y un `limit_req zone=api_key burst=10 nodelay;` en la misma `location`. **Pista:** el número exacto de peticiones que pasan antes del 429 depende de cuánto tardaron en llegar, porque la zona se rellena y se vacía con el tiempo; lo que no cambia es que el exceso se registra con `excess` y que una petición sin `X-API-Key` no se cuenta, porque una clave vacía no se contabiliza.

#### Paso 6 · Práctica independiente

Agrega a `server.mjs` una ruta `GET /api/catalogo` que cambie cada minuto, y ponle caché en el borde con `proxy_cache_path`, `proxy_cache`, `proxy_cache_valid 200 10s` y `add_header X-Cache-Status $upstream_cache_status always;`. Ejecuta la ruta tres veces y anota si ves `MISS` o `HIT`. Luego escribe una decisión de dos párrafos: qué cambia si ese catálogo se sirve desde una CDN, qué no cambia, y en qué caso concreto una CDN no ayudaría a RutaFlow (respuestas por usuario, `POST`, o un catálogo que cambia en cada petición).

#### Paso 7 · Cierre

Siguiente paso: el Tema 2 cambia de plano y ataca el crecimiento de los datos, donde el coste ya no está en el borde sino en cada consulta.

**Errores comunes:** declarar `limit_req_zone` dentro de `server` (la directiva solo existe en `http`); usar `localhost` dentro de un contenedor para hablar con otro servicio; creer que añadir una instancia arregla un origen lento, cuando solo reparte la espera.

**Límites y decisión de uso:** un límite por IP es barato para tráfico anónimo, pero detrás de una NAT compartida castiga a quien no hizo nada; para límites por usuario o por plan, la clave debe ser otra y el contador debe vivir fuera de nginx. El balanceo no aporta si la API guarda sesión en memoria. Y una CDN no se justifica con hit ratio bajo o un origen que ya responde en milisegundos: agregas invalidación, coste y una capa más donde fallar.

**Fuente oficial:** [nginx — ngx_http_limit_req_module](https://nginx.org/en/docs/http/ngx_http_limit_req_module.html) y [nginx — Load Balancing](https://nginx.org/en/docs/http/load_balancing.html).

### Tema 2: Datos que crecen: índices, réplicas, sharding y la elección SQL/NoSQL

#### Paso 1 · Objetivo y preparación

Al finalizar vas a medir un plan antes y después de un índice compuesto, configurar una réplica lógica, provocar una lectura obsoleta y decidir cuándo no conviene shardear.

**Conocimiento previo:** Docker Compose y SQL básico.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** El panel de RutaFlow lista los últimos envíos de un cliente. Con dos mil filas respondía al instante; con doscientas mil, la consulta pasó de recorrer un índice a recorrer la tabla entera y ordenar. En la medición de referencia de este tema tardó `20.607 ms` sin índice y `0.193 ms` con índice, con las mismas filas y hardware. La diferencia no fue más CPU: fue indexar el par de columnas que la consulta usa, en ese orden.

El proyecto integrador guarda envíos y lecturas de seguimiento; esta decisión define qué consulta se vuelve lenta cuando los datos crecen.

#### Paso 3 · Teoría, modelo mental y analogía

**Conceptos clave:** selectividad, índice compuesto y prefijo izquierdo, coste de escritura, réplica física y lógica, lag, lectura obsoleta, clave de sharding, transacciones.

Un índice B-tree localiza filas sin leer la tabla entera, pero solo si la consulta puede usarlo: en `(cliente_id, creado_en desc)` la igualdad por `cliente_id` entra y una consulta que filtra solo por `creado_en` no, porque esa columna no es la primera. La selectividad manda: indexar una columna con tres valores casi nunca compensa. Cada índice se paga en escritura y espacio. Una **réplica** copia los datos a otra instancia; en replicación lógica el suscriptor aplica cambios con retraso, así que una lectura inmediata puede devolver el estado anterior: es la lectura obsoleta que rompe la ilusión de una sola base. El **sharding** reparte filas entre bases por una clave; arregla el tamaño de una tabla y convierte toda consulta que no filtre por esa clave en una consulta a N bases.

La elección SQL/NoSQL se decide por el patrón de acceso: si necesitas transacciones multi-tabla, integridad referencial y consultas ad hoc, la relacional te da eso y los índices que mediste. Si el acceso es siempre por clave y la escritura es extrema, un almacén por clave evita coordinación, a cambio de mover uniones y consistencia a tu aplicación.

**Analogía:** un índice es el índice de un libro; una réplica es una fotocopia que puede estar una página atrás; el sharding es dividir la enciclopedia en tomos por región, de modo que buscar «todos los envíos de marzo» ya no es abrir un tomo, sino todos.

**Diagrama:**

```mermaid
flowchart LR
    W["Escritura"] --> P[("Primaria")]
    P -->|replicación| R1[("Réplica 1")]
    P -->|replicación| R2[("Réplica 2")]
    L["Lectura"] --> R1
    L --> R2
    S["Shard key"] --> S1[("Shard A")]
    S --> S2[("Shard B")]
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía, levanta un primario con replicación lógica habilitada y un suscriptor:

```bash
mkdir -p academia-devops/src/modulo17/datos
cd academia-devops/src/modulo17/datos
```

Crea `docker-compose.yml`; el primario necesita `wal_level=logical` o la replicación no arranca:

```yaml
services:
  primario:
    image: postgres:18-alpine
    command: ["postgres", "-c", "wal_level=logical"]
    environment:
      POSTGRES_PASSWORD: academia
      POSTGRES_DB: rutaflow
    ports:
      - "5433:5432"
  replica:
    image: postgres:18-alpine
    environment:
      POSTGRES_PASSWORD: academia
      POSTGRES_DB: rutaflow
    ports:
      - "5434:5432"
```

Crea `datos.sql` con doscientas mil filas:

```sql
create table envio (
  id bigserial primary key,
  cliente_id integer not null,
  estado text not null,
  creado_en timestamptz not null
);

insert into envio (cliente_id, estado, creado_en)
select (g % 5000) + 1,
       (array['creado', 'en_ruta', 'entregado'])[1 + (g % 3)],
       timestamptz '2026-01-01 00:00:00+00' - (g || ' minutes')::interval
from generate_series(1, 200000) g;

analyze envio;
```

Crea `consulta.sql` con el plan antes, el índice y el plan después:

```sql
explain (analyze, buffers)
select * from envio
where cliente_id = 4242
order by creado_en desc
limit 20;

create index idx_envio_cliente_creado on envio (cliente_id, creado_en desc);
analyze envio;

explain (analyze, buffers)
select * from envio
where cliente_id = 4242
order by creado_en desc
limit 20;

explain
select * from envio
where creado_en > now() - interval '2 hours'
order by creado_en desc
limit 20;
```

Ejecuta y configura la réplica:

```bash
docker compose up -d
until docker compose exec -T primario pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done
psql "postgresql://postgres:academia@127.0.0.1:5433/rutaflow" -f datos.sql
psql "postgresql://postgres:academia@127.0.0.1:5433/rutaflow" -f consulta.sql
docker compose exec -T primario pg_dump -U postgres -d rutaflow --schema-only \
  | docker compose exec -T replica psql -U postgres -d rutaflow
docker compose exec -T primario psql -U postgres -d rutaflow \
  -c "create publication pub_envio for table envio;"
docker compose exec -T replica psql -U postgres -d rutaflow \
  -c "create subscription sub_envio connection 'host=primario port=5432 user=postgres password=academia dbname=rutaflow' publication pub_envio;"
psql "postgresql://postgres:academia@127.0.0.1:5434/rutaflow" -c "select count(*) from envio;"
```

**Explicación línea por línea:** `pg_dump --schema-only` copia el esquema, no los datos, porque la replicación lógica no replica DDL; la publicación define las tablas y la suscripción crea el slot. La copia inicial la hace la suscripción y después llega el flujo continuo, con retraso.

**Resultado esperado:**

```
  estado   | count
-----------+-------
 creado    | 66666
 en_ruta   | 66667
 entregado | 66667
(3 rows)

 count
--------
 200000
(1 row)
```

Antes del índice el plan muestra `Parallel Seq Scan on envio` con `Sort Key: creado_en DESC`; después, `Index Scan using idx_envio_cliente_creado on envio` con `Index Cond: (cliente_id = 4242)`. El último `explain` sigue mostrando recorrido secuencial: filtrar solo por `creado_en` no usa un índice cuya primera columna es `cliente_id`.

**Fallo deliberado:** ejecuta el índice dentro de una transacción, como haría una migración que envuelve todo su contenido: `psql "postgresql://postgres:academia@127.0.0.1:5433/rutaflow" -c "begin; create index concurrently idx_prueba on envio (estado); commit;"`. PostgreSQL responde `ERROR:  CREATE INDEX CONCURRENTLY cannot run inside a transaction block`. Diagnostica: `CONCURRENTLY` necesita varias transacciones internas para no bloquear escrituras, y por eso una migración transaccional no puede usarlo; sepáralo en su propia migración sin transacción y verifica después que el índice quedó válido con `\d envio`.

#### Paso 5 · Práctica guiada

Crea un índice sobre `estado` y comprueba con `explain` una consulta `where estado = 'entregado'` sin `limit`. El planificador seguirá eligiendo `Seq Scan`. **Pista:** con tres valores, esa condición devuelve un tercio de la tabla; leer el índice y luego las filas cuesta más que recorrer la tabla, y el planificador decide por coste.

#### Paso 6 · Práctica independiente

Inserta en el primario y cuenta en la réplica en el mismo segundo; repite hasta capturar una lectura obsoleta y anota cuánto tardó en converger. Elige después una clave de sharding para `envio` entre `cliente_id`, `creado_en` y un hash de `id`, y escribe las tres consultas que se volverían caras. Cierra con la decisión: ¿shardearías hoy o lo dejarías como hipótesis a medir?

#### Paso 7 · Cierre

Siguiente paso: el Tema 3 trata lo que estas piezas cuestan cuando algo falla a mitad de camino: consistencia, reintentos y operaciones que no deben aplicarse dos veces.

**Errores comunes:** indexar columnas de baja cardinalidad y concluir que «el índice no funciona»; crear índices en migraciones transaccionales; asumir que la réplica es un respaldo (replica también el borrado); shardear antes de medir.

**Límites y decisión de uso:** un índice no salva una consulta que devuelve el 40 % de la tabla; una réplica no da alta disponibilidad ni corrige una escritura mal hecha; el sharding no da tolerancia a fallos y multiplica migraciones, respaldos y transacciones. NoSQL no elimina las uniones: las traslada a la aplicación.

**Fuente oficial:** [PostgreSQL — CREATE INDEX](https://www.postgresql.org/docs/current/sql-createindex.html) y [PostgreSQL — Logical Replication](https://www.postgresql.org/docs/current/logical-replication.html).

### Tema 3: CAP, consistencia e idempotencia: lo que se paga en cada decisión

#### Paso 1 · Objetivo y preparación

Al finalizar vas a proteger un cobro contra el doble envío con una clave de idempotencia en Redis y una restricción única en PostgreSQL, y vas a explicar qué garantiza cada pieza y qué no.

**Conocimiento previo:** el Tema 2 de este módulo y SQL básico.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Un cliente envía `POST /pagos` con un timeout de 3 segundos; el cobro se aplica en 4 y el cliente, que solo ve un error, reintenta dos veces. Sin ninguna protección, el mismo pedido se cobra tres veces y el problema aparece en el extracto del usuario, no en tus logs. La situación es tan común que la documentación de AWS recomienda que toda API reintentable acepte una clave de idempotencia; el reintento no es un caso raro, es el comportamiento esperado de un cliente bien escrito.

En el proyecto integrador se cobran y confirman envíos; un reintento del cliente no puede producir dos cobros.

#### Paso 3 · Teoría, modelo mental y analogía

**Conceptos clave:** partición de red, consistencia eventual, lectura de lo propio escrito, quórum, clave de idempotencia, ventana de retención, fencing token.

CAP describe qué ocurre **durante una partición**: si dos nodos no se ven, o rechazas escrituras para no divergir, o las aceptas y aceptas reconciliar después. Fuera de la partición la decisión sigue existiendo, entre latencia y consistencia (PACELC): esperar a que dos réplicas confirmen cuesta milisegundos que un panel no siempre puede pagar. La consistencia eventual no es «datos incorrectos»: es una promesa sobre cuándo convergen. La lectura de lo propio escrito se resuelve enrutando las lecturas del usuario que acaba de escribir a la réplica primaria durante una ventana corta, no bajando la consistencia de todo el sistema.

La idempotencia se construye con tres piezas: una clave que viaja con la petición, un almacén que recuerde la clave y su resultado, y una ventana durante la cual la clave se conserva. Sin la ventana, el reintento tardío vuelve a cobrar; sin el almacén durable, un reinicio borra la memoria. Redis sirve para el chequeo rápido, pero si se pierde la clave el respaldo es la restricción única en la base de datos. Un `SET NX PX` sirve para elegir líder si cada uno recibe un *fencing token* creciente: sin él, un líder pausado despierta y escribe después de que otro tomó el relevo.

**Analogía:** la clave de idempotencia es el sello ultravioleta que te ponen en la mano al entrar a un concierto: puedes volver a la fila, pero el segundo intento no te cobra otra entrada porque el sello ya está ahí. Si el sello se borra (se pierde la clave), el portero no tiene forma de saber que ya entraste.

**Diagrama:**

```mermaid
sequenceDiagram
    participant C as Cliente
    participant A as API
    participant R as Redis
    participant D as PostgreSQL
    C->>A: POST /pagos con Idempotency-Key k1
    A->>R: SET k1 NX PX 86400000
    R-->>A: OK (primera vez)
    A->>D: INSERT pago con clave única k1
    D-->>A: insertado
    A-->>C: 201
    C->>A: reintento con k1
    A->>R: SET k1 NX
    R-->>A: nil (ya existe)
    A-->>C: 200 con el mismo resultado
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía, levanta PostgreSQL y Redis:

```bash
mkdir -p academia-devops/src/modulo17/idempotencia
cd academia-devops/src/modulo17/idempotencia
```

Crea `docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:18-alpine
    environment:
      POSTGRES_PASSWORD: academia
      POSTGRES_DB: rutaflow
    ports:
      - "5435:5432"
  redis:
    image: redis:7-alpine
    ports:
      - "6380:6379"
```

Crea `esquema.sql` con la restricción que hace posible la idempotencia:

```sql
create table pago (
  id bigserial primary key,
  clave_idempotencia text not null unique,
  monto integer not null,
  creado_en timestamptz not null default now()
);
```

Crea `cobro.sql`, el mismo `insert` que ejecutaría un reintento:

```sql
insert into pago (clave_idempotencia, monto)
values ('pago-77', 1500)
on conflict (clave_idempotencia) do nothing
returning id, monto;
```

Ejecuta el flujo completo, con el `insert` dos veces y el chequeo en Redis antes de tocar la base:

```bash
docker compose up -d
until docker compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done
psql "postgresql://postgres:academia@127.0.0.1:5435/rutaflow" -f esquema.sql
psql "postgresql://postgres:academia@127.0.0.1:5435/rutaflow" -f cobro.sql
psql "postgresql://postgres:academia@127.0.0.1:5435/rutaflow" -f cobro.sql
docker compose exec -T redis redis-cli SET idem:pago-77 en-curso NX EX 30
docker compose exec -T redis redis-cli SET idem:pago-77 en-curso NX EX 30
docker compose exec -T redis redis-cli EXISTS idem:pago-77
```

**Explicación línea por línea:** `unique` sobre `clave_idempotencia` es lo que convierte el segundo `insert` en un no-op; `on conflict ... do nothing` evita el error y `returning` devuelve filas solo cuando de verdad insertó, de modo que la aplicación distingue «cobré» de «ya estaba cobrado». En Redis, `NX` hace que el `SET` solo escriba si la clave no existe, `EX 30` le pone una ventana de 30 segundos y la segunda llamada devuelve `nil`, que es la señal para no volver a cobrar.

**Resultado esperado:**

```
INSERT 0 1
INSERT 0 0
OK
(nil)
(integer) 1
```

**Fallo deliberado:** crea una tabla sin la restricción y repite el `insert`: `create table pago_suelto (id bigserial primary key, clave_idempotencia text not null, monto integer not null);` y luego `insert into pago_suelto (clave_idempotencia, monto) values ('pago-77', 1500) on conflict (clave_idempotencia) do nothing;`. PostgreSQL responde `ERROR:  there is no unique or exclusion constraint matching the ON CONFLICT specification`. Diagnostica: `on conflict` no crea la garantía, solo la aprovecha; sin restricción única la base no puede saber qué es un duplicado, y la idempotencia que creías tener no existe.

#### Paso 5 · Práctica guiada

Haz que el reintento devuelva la misma respuesta que el primer cobro, en vez de una fila vacía: `on conflict (clave_idempotencia) do update set clave_idempotencia = excluded.clave_idempotencia returning id, monto;`. **Pista:** el `do update` no cambia el monto, solo fuerza a que `returning` tenga una fila que devolver; si actualizaras el monto estarías dejando que un reintento modifique el cobro, que es exactamente lo que quieres evitar.

#### Paso 6 · Práctica independiente

Guarda junto a la clave un hash del cuerpo de la petición y, si llega la misma clave con otro cuerpo, responde con conflicto en vez de aceptar el cambio. Añade después un lease de líder en Redis (`SET lider:cierre <id> NX PX 10000`) y explica con un ejemplo concreto por qué hace falta un *fencing token* además del lease, y qué pasa si el proceso se detiene más tiempo del que dura el `PX`.

#### Paso 7 · Cierre

Siguiente paso: el Tema 4 mide lo que todo esto cuesta cuando el sistema está bajo carga, y lo traduce a un objetivo de servicio con presupuesto de error.

**Errores comunes:** confiar solo en Redis con `EX` corto y perder la clave antes de que llegue el reintento; usar `on conflict` sin restricción única; tratar CAP como un menú de dos opciones y elegir «AP» sin decir qué se reconcilia ni cuándo.

**Límites y decisión de uso:** la idempotencia protege tu efecto, no el de un tercero que ya cobró antes de que guardaras la clave; un TTL de 30 segundos no cubre un reintento de dos horas; y elegir líder sin cuórum ni fencing puede producir dos líderes escribiendo a la vez. Si el sistema no puede tolerar lecturas obsoletas en una pantalla concreta, enruta esa lectura al primario en vez de bajar la consistencia de todo el sistema.

**Fuente oficial:** [Redis — SET](https://redis.io/docs/latest/commands/set/) y [PostgreSQL — INSERT](https://www.postgresql.org/docs/current/sql-insert.html).

### Tema 4: Capacidad y observabilidad: latencia, throughput, SLO y pruebas de carga

#### Paso 1 · Objetivo y preparación

Al finalizar vas a medir latencia por percentiles y throughput de una API con un generador propio, y a convertir esas medidas en una decisión sobre un SLO y su presupuesto de error.

**Conocimiento previo:** Docker, Node.js 20 o superior y los Temas 1-3 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** En la medición de referencia de este tema, la misma API respondió con `p50: 3 ms` y `5208 req/s` con veinte peticiones concurrentes, y con `p50: 34 ms` y `5263 req/s` con doscientas. El throughput no mejoró y la latencia mediana se multiplicó por diez: el sistema ya estaba saturado. Sin percentiles, ese cambio es invisible en un panel de promedio y se descubre cuando los usuarios se quejan.

El proyecto integrador se mide con estas cifras: sin p95 y sin error budget, una regresión se descubre cuando la reporta un usuario.

#### Paso 3 · Teoría, modelo mental y analogía

**Conceptos clave:** latencia, throughput, percentiles, saturación, modelo abierto y cerrado, SLI, SLO, presupuesto de error.

La latencia no es un número, es una distribución: el promedio esconde la cola, y la cola es lo que el usuario recuerda. `p95` significa que el 95 % terminó por debajo de ese valor; con cien muestras, `p99` es una sola observación y no decide nada. La **ley de Little** las relaciona: peticiones en vuelo = throughput × latencia; con 20 concurrentes y 250 ms por petición, el techo son 80 peticiones por segundo, y medir 79 confirma que el límite es la latencia del trabajo.

Un generador con concurrencia fija es un modelo **cerrado**: si el servidor se ralentiza, el generador espera y la tasa de llegada baja justo cuando quieres medirla. Un modelo **abierto** mantiene la tasa y revela la degradación. Un **SLI** es la medida (porcentaje por debajo de 300 ms), un **SLO** el objetivo sobre una ventana (99 % en 30 días) y el **presupuesto de error** lo que queda por gastar: un 1 % de un millón son diez mil peticiones lentas o fallidas.

**Analogía:** medir latencia con el promedio es valorar una carretera por su velocidad media e ignorar el tramo donde todos se detienen; el percentil mira ese tramo, y la prueba de carga simula el día de tráfico alto antes de que llegue solo.

**Diagrama:**

```mermaid
flowchart LR
    G["k6: carga"] --> A["API"]
    A --> M["Métricas p50, p95 y p99"]
    M --> S["SLO y error budget"]
    S --> Q{"¿Queda presupuesto?"}
    Q -->|sí| Y["Se despliega"]
    Q -->|no| N["Primero se corrige"]
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía, crea una API con una ruta rápida y otra que simula trabajo lento, y un generador de carga:

```bash
mkdir -p academia-devops/src/modulo17/capacidad/api
cd academia-devops/src/modulo17/capacidad
```

Crea `docker-compose.yml`:

```yaml
services:
  api:
    image: node:24-alpine
    working_dir: /app
    command: ["node", "server.mjs"]
    ports:
      - "8081:8081"
    volumes:
      - ./api:/app:ro
```

Crea `api/server.mjs`; `/api/informe` simula 250 ms de trabajo, no una base lenta real:

```bash
cat > api/server.mjs <<'EOF'
import http from 'node:http';
import { setTimeout as dormir } from 'node:timers/promises';

http.createServer(async (req, res) => {
  if (req.url === '/api/pedidos') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ pedidos: 3 }));
    return;
  }
  if (req.url === '/api/informe') {
    await dormir(250);
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ filas: 1200 }));
    return;
  }
  res.writeHead(404).end();
}).listen(8081, () => console.log('api escuchando en :8081'));
EOF
```

Crea `carga.mjs`, que mide latencias por petición y las resume:

```bash
cat > carga.mjs <<'EOF'
import http from 'node:http';

const objetivo = new URL(process.argv[2] ?? 'http://127.0.0.1:8081/api/pedidos');
const total = Number(process.argv[3] ?? 1000);
const concurrencia = Number(process.argv[4] ?? 20);

const agente = new http.Agent({ keepAlive: true, maxSockets: concurrencia });
const latencias = [];
let errores = 0;
let pendientes = 0;

function peticion() {
  return new Promise((resolver) => {
    const inicio = process.hrtime.bigint();
    const req = http.get(objetivo, { agent: agente }, (res) => {
      res.resume();
      res.on('end', () => {
        latencias.push(Number(process.hrtime.bigint() - inicio) / 1e6);
        resolver();
      });
    });
    req.on('error', (error) => {
      if (errores === 0) console.error(`Error: ${error.message}`);
      errores += 1;
      resolver();
    });
  });
}

async function trabajador() {
  while (pendientes < total) {
    pendientes += 1;
    await peticion();
  }
}

const inicio = Date.now();
await Promise.all(Array.from({ length: concurrencia }, trabajador));
const segundos = (Date.now() - inicio) / 1000;

if (latencias.length === 0) {
  console.error(`sin respuestas correctas: ${errores} errores`);
  process.exit(1);
}

latencias.sort((a, b) => a - b);
const percentil = (p) =>
  latencias[Math.min(latencias.length - 1, Math.ceil(p * latencias.length) - 1)];

console.log(`peticiones: ${total}  errores: ${errores}`);
for (const p of [50, 95, 99]) console.log(`p${p}: ${percentil(p / 100).toFixed(0)} ms`);
console.log(`throughput: ${(total / segundos).toFixed(0)} req/s`);
process.exitCode = errores > 0 ? 1 : 0;
EOF
docker compose up -d
node --check carga.mjs
node carga.mjs http://127.0.0.1:8081/api/pedidos 1000 20
node carga.mjs http://127.0.0.1:8081/api/pedidos 1000 200
```

**Explicación línea por línea:** cada petición mide con `hrtime` en el cliente, así que el número incluye red y cola; `maxSockets` limita la concurrencia real y `keepAlive` evita medir la apertura de conexión. `latencias.sort` y el índice del percentil son la parte que casi nadie escribe bien: sin ordenar, el «p99» es un número al azar.

**Resultado esperado:**

```
peticiones: 1000  errores: 0
p50: 3 ms
p95: 7 ms
p99: 28 ms
throughput: 5208 req/s
peticiones: 1000  errores: 0
p50: 34 ms
p95: 72 ms
p99: 79 ms
throughput: 5263 req/s
```

Esas cifras se midieron en la máquina donde se escribió este tema; las tuyas cambiarán, pero la relación se mantiene: al multiplicar por diez la concurrencia, el throughput no sube y la latencia sí.

**Fallo deliberado:** apunta el generador a un puerto donde no escucha nada, `node carga.mjs http://127.0.0.1:8099/api/pedidos 50 5`. El resultado es `Error: connect ECONNREFUSED 127.0.0.1:8099`, seguido de `sin respuestas correctas: 50 errores` y código de salida `1`. Diagnostica: la prueba no midió nada, y si en un pipeline ignoras el código de salida con `|| true`, el informe dirá «sin errores» sobre una corrida vacía; comprueba siempre que el número de respuestas correctas coincide con el total pedido.

#### Paso 5 · Práctica guiada

Ejecuta `node carga.mjs http://127.0.0.1:8081/api/informe 200 20` y luego con `100` de concurrencia. **Pista:** divide concurrencia entre latencia y compara con el throughput; si coincide, el sistema no está saturado y la palanca es reducir el trabajo por petición, no añadir instancias.

#### Paso 6 · Práctica independiente

Añade a `carga.mjs` un modo de tasa fija (cien peticiones por segundo durante treinta segundos, sin esperar respuesta) y compara su `p99` con el del modo de concurrencia fija. Escribe el SLO de RutaFlow para `/api/pedidos` y calcula, con tus números, cuánto presupuesto consume una hora de la corrida más lenta.

#### Paso 7 · Cierre

Siguiente paso: el laboratorio integra las cuatro piezas en un solo sistema y un solo informe de capacidad.

**Errores comunes:** decidir con el promedio; mezclar el arranque en frío con el estado estable; usar pocas muestras para afirmar un `p99`; olvidar el código de salida y dar por buena una prueba que no midió nada.

**Límites y decisión de uso:** una prueba en un portátil no predice producción: cambian red, disco y vecinos ruidosos. Un SLO sin ventana ni definición de «petición correcta» no es un objetivo. Y la prueba no sustituye la observabilidad: sirve para decidir antes, no para vigilar después.

**Fuente oficial:** [Google SRE Book — Service Level Objectives](https://sre.google/sre-book/service-level-objectives/) y [AWS Builders' Library — Timeouts, retries, and backoff with jitter](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/).

---

## Laboratorio práctico

**Entregable:** un directorio `academia-devops/src/modulo17/laboratorio/` con el borde del Tema 1 y la base del Tema 3 conectados, más `informe-capacidad.md` y `verificar.sh`.

**Requisito verificable:** el informe declara, para cada una de las cinco comprobaciones, el comando ejecutado y su salida; `verificar.sh` las ejecuta y termina con código `0` solo si las cinco pasan.

| Comprobación | Comando | Criterio de aceptación |
|---|---|---|
| Reparto en el borde | `curl -s http://localhost:8080/api/salud` cuatro veces | Aparecen las dos instancias |
| Límite de tasa | veinte peticiones seguidas | Al menos un `429` y la línea `limiting requests` en el log |
| Índice en uso | `explain` de la consulta del Tema 2 | El plan contiene `Index Scan using idx_envio_cliente_creado` |
| Idempotencia | `psql -f cobro.sql` dos veces | La segunda salida es `INSERT 0 0` |
| Capacidad | `node carga.mjs .../api/pedidos 1000 20` | `errores: 0` y percentiles impresos |

`verificar.sh` debe fallar en voz alta: si un `curl` devuelve `000`, el script no puede contar eso como éxito. El informe se considera incompleto si alguna cifra de capacidad no viene de una corrida propia o si la decisión final no dice qué **no** harías con el presupuesto de error medido.
