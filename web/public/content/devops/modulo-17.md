# Módulo 17: Diseño de sistemas distribuidos: borde, datos y capacidad

## Aprende construyendo

Cada Tema parte de una carpeta vacía y se verifica con comandos reales.


### Tema 1: El borde: balanceo, proxy inverso, CDN y límites de tasa · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a poner nginx delante de dos instancias de una API, a comprobar el reparto con la respuesta de cada instancia, y a imponer un límite de tasa por IP que devuelve 429 cuando se excede.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a poner nginx delante de dos instancias de una API, a comprobar el reparto con la respuesta de cada instancia, y a imponer un límite de tasa por IP que devuelve 429 cuando se excede.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en el borde: balanceo, proxy inverso, cdn y límites de tasa como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| El borde: balanceo, proxy inverso, CDN y límites de tasa se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar El borde: balanceo, proxy inverso, CDN y límites de tasa | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses el borde: balanceo, proxy inverso, cdn y límites de tasa por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: el borde: balanceo, proxy inverso, cdn y límites de tasa funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- El borde: balanceo, proxy inverso, CDN y límites de tasa existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve el borde: balanceo, proxy inverso, cdn y límites de tasa en tu contexto?
2. ¿Cómo sabrías que el borde: balanceo, proxy inverso, cdn y límites de tasa no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar el borde: balanceo, proxy inverso, cdn y límites de tasa?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
mkdir -p academia-devops/src/modulo17/borde/api
cd academia-devops/src/modulo17/borde
```

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

```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
{"servicio":"api-1","puerto":8081}
{"servicio":"api-2","puerto":8081}
{"servicio":"api-1","puerto":8081}
{"servicio":"api-2","puerto":8081}
```

</details>

### Tema 2: Datos que crecen: índices, réplicas, sharding y la elección SQL/NoSQL · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a medir un plan antes y después de un índice compuesto, configurar una réplica lógica, provocar una lectura obsoleta y decidir cuándo no conviene shardear.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a medir un plan antes y después de un índice compuesto, configurar una réplica lógica, provocar una lectura obsoleta y decidir cuándo no conviene shardear.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en datos que crecen: índices, réplicas, sharding y la elección sql/nosql como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Datos que crecen: índices, réplicas, sharding y la elección SQL/NoSQL se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Datos que crecen: índices, réplicas, sharding y la elección SQL/NoSQL | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses datos que crecen: índices, réplicas, sharding y la elección sql/nosql por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: datos que crecen: índices, réplicas, sharding y la elección sql/nosql funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Datos que crecen: índices, réplicas, sharding y la elección SQL/NoSQL existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve datos que crecen: índices, réplicas, sharding y la elección sql/nosql en tu contexto?
2. ¿Cómo sabrías que datos que crecen: índices, réplicas, sharding y la elección sql/nosql no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar datos que crecen: índices, réplicas, sharding y la elección sql/nosql?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
mkdir -p academia-devops/src/modulo17/datos
cd academia-devops/src/modulo17/datos
```

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

</details>

### Tema 3: CAP, consistencia e idempotencia: lo que se paga en cada decisión · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a proteger un cobro contra el doble envío con una clave de idempotencia en Redis y una restricción única en PostgreSQL, y vas a explicar qué garantiza cada pieza y qué no.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a proteger un cobro contra el doble envío con una clave de idempotencia en Redis y una restricción única en PostgreSQL, y vas a explicar qué garantiza cada pieza y qué no.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en cap, consistencia e idempotencia: lo que se paga en cada decisión como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
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

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| CAP, consistencia e idempotencia: lo que se paga en cada decisión se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar CAP, consistencia e idempotencia: lo que se paga en cada decisión | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses cap, consistencia e idempotencia: lo que se paga en cada decisión por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: cap, consistencia e idempotencia: lo que se paga en cada decisión funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- CAP, consistencia e idempotencia: lo que se paga en cada decisión existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve cap, consistencia e idempotencia: lo que se paga en cada decisión en tu contexto?
2. ¿Cómo sabrías que cap, consistencia e idempotencia: lo que se paga en cada decisión no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar cap, consistencia e idempotencia: lo que se paga en cada decisión?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
mkdir -p academia-devops/src/modulo17/idempotencia
cd academia-devops/src/modulo17/idempotencia
```

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

```sql
create table pago (
  id bigserial primary key,
  clave_idempotencia text not null unique,
  monto integer not null,
  creado_en timestamptz not null default now()
);
```

```sql
insert into pago (clave_idempotencia, monto)
values ('pago-77', 1500)
on conflict (clave_idempotencia) do nothing
returning id, monto;
```

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

</details>

### Tema 4: Capacidad y observabilidad: latencia, throughput, SLO y pruebas de carga · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a medir latencia por percentiles y throughput de una API con un generador propio, y a convertir esas medidas en una decisión sobre un SLO y su presupuesto de error.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a medir latencia por percentiles y throughput de una API con un generador propio, y a convertir esas medidas en una decisión sobre un SLO y su presupuesto de error.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en capacidad y observabilidad: latencia, throughput, slo y pruebas de carga como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    G["k6: carga"] --> A["API"]
    A --> M["Métricas p50, p95 y p99"]
    M --> S["SLO y error budget"]
    S --> Q{"¿Queda presupuesto?"}
    Q -->|sí| Y["Se despliega"]
    Q -->|no| N["Primero se corrige"]
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Capacidad y observabilidad: latencia, throughput, SLO y pruebas de carga se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Capacidad y observabilidad: latencia, throughput, SLO y pruebas de carga | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses capacidad y observabilidad: latencia, throughput, slo y pruebas de carga por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: capacidad y observabilidad: latencia, throughput, slo y pruebas de carga funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Capacidad y observabilidad: latencia, throughput, SLO y pruebas de carga existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve capacidad y observabilidad: latencia, throughput, slo y pruebas de carga en tu contexto?
2. ¿Cómo sabrías que capacidad y observabilidad: latencia, throughput, slo y pruebas de carga no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar capacidad y observabilidad: latencia, throughput, slo y pruebas de carga?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    G["k6: carga"] --> A["API"]
    A --> M["Métricas p50, p95 y p99"]
    M --> S["SLO y error budget"]
    S --> Q{"¿Queda presupuesto?"}
    Q -->|sí| Y["Se despliega"]
    Q -->|no| N["Primero se corrige"]
```

```bash
mkdir -p academia-devops/src/modulo17/capacidad/api
cd academia-devops/src/modulo17/capacidad
```

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

</details>
