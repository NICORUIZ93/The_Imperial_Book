# Módulo 10: Logging centralizado


## Aprende construyendo


### Tema 1: Logging estructurado (JSON) · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás emitir logs como JSON con campos explícitos, filtrando por cualquier campo sin depender de coincidencias de texto frágiles.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás emitir logs como JSON con campos explícitos, filtrando por cualquier campo sin depender de coincidencias de texto frágiles.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en logging estructurado (json) como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que logging estructurado (json) resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Logging estructurado (JSON) se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Logging estructurado (JSON) | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses logging estructurado (json) por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: logging estructurado (json) funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Logging estructurado (JSON) existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve logging estructurado (json) en tu contexto?
2. ¿Cómo sabrías que logging estructurado (json) no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar logging estructurado (json)?

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
cat > app.js <<'EOF'
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
EOF
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

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás explicar las tres etapas de un pipeline de logging centralizado (recolección, indexación, visualización) y en cuál de ellas diagnosticar un problema específico.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en pipeline elk/efk como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que pipeline elk/efk resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Pipeline ELK/EFK se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Pipeline ELK/EFK | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses pipeline elk/efk por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: pipeline elk/efk funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Pipeline ELK/EFK existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve pipeline elk/efk en tu contexto?
2. ¿Cómo sabrías que pipeline elk/efk no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar pipeline elk/efk?

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

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás consultar logs con LogQL filtrando primero por labels (rápido) antes de aplicar un filtro de texto libre (más costoso), aprovechando la integración nativa de Loki con Grafana.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en loki + grafana como alternativa ligera como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que loki + grafana como alternativa ligera resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Loki + Grafana como alternativa ligera se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Loki + Grafana como alternativa ligera | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses loki + grafana como alternativa ligera por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: loki + grafana como alternativa ligera funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Loki + Grafana como alternativa ligera existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve loki + grafana como alternativa ligera en tu contexto?
2. ¿Cómo sabrías que loki + grafana como alternativa ligera no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar loki + grafana como alternativa ligera?

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

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás propagar un correlation ID entre dos servicios que se comunican entre sí, reconstruyendo el flujo completo de una petición con una única búsqueda.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en correlation id a través de servicios como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que correlation id a través de servicios resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Correlation ID a través de servicios se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Correlation ID a través de servicios | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses correlation id a través de servicios por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: correlation id a través de servicios funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Correlation ID a través de servicios existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve correlation id a través de servicios en tu contexto?
2. ¿Cómo sabrías que correlation id a través de servicios no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar correlation id a través de servicios?

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
cat > servicio-b.js <<'EOF'
const http = require('node:http');
http.createServer((req, res) => {
  const correlationId = req.headers['x-correlation-id'] ?? 'sin-id';
  console.log(JSON.stringify({ level: 'info', service: 'B', correlationId, msg: 'procesando en B' }));
  res.end('respuesta de B');
}).listen(3001);
EOF
cat > servicio-a.js <<'EOF'
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
EOF
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
