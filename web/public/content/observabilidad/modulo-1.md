# Módulo 1: Logging centralizado


## Aprende construyendo


### Tema 1: Logging estructurado (JSON) · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás emitir logs como JSON con campos explícitos, filtrando por cualquier campo sin depender de coincidencias de texto frágiles.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌── Texto libre ──────────────────┐   ┌── Estructurado (JSON) ────────────────┐
│ "Error conectando a la BD a las 14:32" │   │ {"level":"error","service":"api",         │
│ Solo buscable por coincidencia de texto │   │  "timestamp":"14:32","msg":"timeout db"}    │
└─────────────────────────┘   │ Filtrable por CADA campo independientemente  │
                                 └───────────────────────────────┘
```

```bash
mkdir -p academia-devops/src/modulo10/logging-estructurado
cd academia-devops/src/modulo10/logging-estructurado
```

Crea el archivo `app.js`:

```js
const http = require('node:http');
function logTextoLibre(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }
function logEstructurado(nivel, campos) {
  console.log(JSON.stringify({ level: nivel, service: 'api', timestamp: new Date().toISOString(), ...campos }));
}
http.createServer((req, res) => {
  logTextoLibre(`peticion recibida en ${req.url}`);
  logEstructurado('info', { msg: 'peticion recibida', ruta: req.url });
  if (req.url === '/error') {
    logTextoLibre('Error conectando a la base de datos');
    logEstructurado('error', { msg: 'timeout conectando a db', componente: 'conexion-db' });
  }
  res.end('ok');
}).listen(3000);
```

```bash
docker run -d --name logging-app -p 3020:3000 -v "$(pwd)":/app -w /app node:22-alpine node app.js
```

```bash
curl -s http://localhost:3020/ >/dev/null
curl -s http://localhost:3020/error >/dev/null
docker logs logging-app 2>&1 | grep "level.*error"
docker logs logging-app 2>&1 | python3 -c "
import sys, json
for line in sys.stdin:
    try:
        data = json.loads(line)
        if data.get('level') == 'error':
            print(data['componente'], '->', data['msg'])
    except (json.JSONDecodeError, KeyError): pass
"
```

</details>

### Tema 2: Pipeline ELK/EFK · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás explicar las tres etapas de un pipeline de logging centralizado (recolección, indexación, visualización) y en cuál de ellas diagnosticar un problema específico.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌──────────────────────────┐
│ App (genera logs JSON)      │
└──────────┬───────────────┘
           │
┌──────────▼───────────────┐
│ Filebeat/Fluentd (recolecta) │
└──────────┬───────────────┘
           │
┌──────────▼───────────────┐
│ Elasticsearch (indexa todo)  │
└──────────┬───────────────┘
           │
┌──────────▼───────────────┐
│ Kibana (búsqueda y visual.)  │
└──────────────────────────┘
```

```bash
mkdir -p academia-devops/src/modulo10/elk && cd academia-devops/src/modulo10/elk
docker run -d --name elasticsearch-demo -p 9200:9200 \
  -e "discovery.type=single-node" -e "xpack.security.enabled=false" \
  elasticsearch:8.15.0
sleep 25
curl -s http://localhost:9200/_cluster/health | python3 -m json.tool | grep status
curl -s -X POST http://localhost:9200/logs-app/_doc -H "Content-Type: application/json" \
  -d '{"level":"error","service":"api","msg":"timeout conectando a db","timestamp":"2026-01-01T14:32:00Z"}'
```

```bash
sleep 2
curl -s -X GET "http://localhost:9200/logs-app/_search?q=timeout" | python3 -m json.tool | grep -A2 '"_source"'
```

</details>

### Tema 3: Loki + Grafana como alternativa ligera · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás consultar logs con LogQL filtrando primero por labels (rápido) antes de aplicar un filtro de texto libre (más costoso), aprovechando la integración nativa de Loki con Grafana.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌── Elasticsearch ──────────────┐   ┌── Loki ────────────────────────┐
│ Indexa TODO el contenido completo │   │ Indexa SOLO labels (service, nivel)  │
│ Búsqueda de texto libre: RÁPIDA    │   │ Búsqueda de texto: requiere filtrar     │
│ Coste operativo: ALTO                │   │ por labels primero; coste: BAJO           │
└─────────────────────────┘   └───────────────────────────┘
```

```bash
mkdir -p academia-devops/src/modulo10/loki && cd academia-devops/src/modulo10/loki
docker run -d --name loki-demo -p 3100:3100 grafana/loki:3.1.0
sleep 8
TS=$(date +%s%N)
curl -s -X POST http://localhost:3100/loki/api/v1/push -H "Content-Type: application/json" -d "{
  \"streams\": [{
    \"stream\": {\"service\":\"api\",\"level\":\"error\"},
    \"values\": [[\"$TS\", \"timeout conectando a db, componente conexion-db\"]]
  }]
}"
```

```bash
sleep 2
curl -s -G "http://localhost:3100/loki/api/v1/query" --data-urlencode 'query={service="api",level="error"}' | python3 -m json.tool | grep -A1 '"values"'
curl -s -G "http://localhost:3100/loki/api/v1/query" --data-urlencode 'query={service="api"} |= "timeout"' | python3 -m json.tool | grep result
```

</details>

### Tema 4: Correlation ID a través de servicios · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás propagar un correlation ID entre dos servicios que se comunican entre sí, reconstruyendo el flujo completo de una petición con una única búsqueda.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
Petición del usuario ──▶ Servicio A (correlationId: abc-123, genera nuevo)
                              │  propaga la cabecera x-correlation-id
                              ▼
                         Servicio B (correlationId: abc-123, mismo ID)

Buscar "abc-123" en el sistema centralizado
   ──▶ reconstruye el flujo completo: A ──▶ B, con tiempos de cada etapa
```

```bash
mkdir -p academia-devops/src/modulo10/correlation-id && cd academia-devops/src/modulo10/correlation-id
```

Crea el archivo `servicio-b.js`:

```js
const http = require('node:http');
http.createServer((req, res) => {
  const correlationId = req.headers['x-correlation-id'] ?? 'sin-id';
  console.log(JSON.stringify({ level: 'info', service: 'B', correlationId, msg: 'procesando en B' }));
  res.end('respuesta de B');
}).listen(3001);
```

Crea el archivo `servicio-a.js`:

```js
const http = require('node:http');
http.createServer((req, res) => {
  const correlationId = req.headers['x-correlation-id'] ?? crypto.randomUUID();
  console.log(JSON.stringify({ level: 'info', service: 'A', correlationId, msg: 'recibida, llamando a B' }));
  http.get({ host: 'localhost', port: 3001, path: '/', headers: { 'x-correlation-id': correlationId } }, (respB) => {
    let datos = '';
    respB.on('data', (c) => datos += c);
    respB.on('end', () => res.end(`A dice: ${datos}, correlationId: ${correlationId}`));
  });
}).listen(3000);
const crypto = require('node:crypto');
```

```bash
docker network create correlacion-red 2>/dev/null || true
docker run -d --name servicio-b --network correlacion-red -v "$(pwd)":/app -w /app -p 3031:3001 node:22-alpine node servicio-b.js
docker run -d --name servicio-a --network correlacion-red -v "$(pwd)":/app -w /app -p 3030:3000 node:22-alpine node servicio-a.js
```

```bash
sleep 2
curl -s http://localhost:3030/
echo
docker logs servicio-a 2>&1 | tail -1
docker logs servicio-b 2>&1 | tail -1
```

</details>
