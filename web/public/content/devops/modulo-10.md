# Módulo 10: Logging centralizado


## Aprende construyendo

### Tema 1: Logging estructurado (JSON)

#### Paso 1 · Objetivo y preparación

Al finalizar podrás emitir logs como JSON con campos explícitos, filtrando por cualquier campo sin depender de coincidencias de texto frágiles.

**Conocimiento previo:** Node.js básico (track JavaScript/Node); Docker (Módulo 2) de este track.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Este es un caso real a cualquier escala más allá de un sistema trivial: el logging de texto libre se vuelve rápidamente inviable de consultar eficientemente durante un incidente real, precisamente cuando la velocidad de diagnóstico más importa.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** log de texto libre, log estructurado, campo indexable, nivel de log.

Un log de texto libre es fácil de leer para una persona pero limitado para búsqueda automatizada: solo se puede buscar por coincidencia de subcadena. Un log estructurado se emite como objeto JSON con campos explícitos (`level`, `service`, `correlationId`, `msg`), cada uno independientemente consultable. El nivel de log (`debug`, `info`, `warn`, `error`) permite filtrar por severidad sin inspeccionar el contenido textual.

**Analogía:** un log de texto libre es una nota escrita a mano en un cuaderno: legible, pero imposible de buscar eficientemente entre miles sin leerlas todas. Un log estructurado es un formulario con campos etiquetados: cualquier sistema puede filtrar miles instantáneamente por cualquier campo específico.

**Diagrama:**

```
┌── Texto libre ──────────────────┐   ┌── Estructurado (JSON) ────────────────┐
│ "Error conectando a la BD a las 14:32" │   │ {"level":"error","service":"api",         │
│ Solo buscable por coincidencia de texto │   │  "timestamp":"14:32","msg":"timeout db"}    │
└─────────────────────────┘   │ Filtrable por CADA campo independientemente  │
                                 └───────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo10/logging-estructurado` con una API que emite ambos formatos para comparar:

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

**Explicación línea por línea:** `logTextoLibre` interpola el mensaje directamente en una cadena de texto; `logEstructurado` emite un objeto JSON con campos explícitos (`level`, `service`, `msg`) que un sistema de agregación puede consultar independientemente sin analizar texto libre.

Genera tráfico y compara qué tan fácil es filtrar cada formato:

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

**Resultado esperado:** `grep` encuentra la línea JSON con `level":"error"` pero solo por coincidencia de texto; el script Python parsea el JSON real y extrae específicamente el campo `componente` (`conexion-db`), algo imposible de hacer de forma confiable sobre la línea de texto libre equivalente sin asumir un formato de posición fijo.

**Fallo deliberado:** intenta extraer el mismo campo `componente` de la línea de texto libre (`Error conectando a la base de datos`) con una expresión regular genérica. No existe ningún campo `componente` en ese texto — diagnostica confirmando que el texto libre nunca tuvo esa información estructurada en primer lugar, solo un mensaje humano-legible sin campos consultables independientemente.

#### Paso 5 · Práctica guiada

Agrega un cuarto nivel de log `warn` para una situación específica (por ejemplo, una petición que tarda más de lo esperado) y confirma con `docker logs | grep` que puedes filtrar exclusivamente ese nivel. **Pista:** define de antemano qué situaciones justifican cada nivel, para no loguear todo como `error` por costumbre.

#### Paso 6 · Práctica independiente

Agrega un campo `duracionMs` calculado con `Date.now()` al inicio y fin de cada petición, y confirma que puedes calcular con Python la duración promedio de las peticiones registradas en los logs, algo que sería mucho más frágil de extraer de logs de texto libre.

#### Paso 7 · Cierre

Ya emites logs estructurados con campos consultables independientemente, sentando la base para cualquier sistema de logging centralizado. El siguiente tema construye el pipeline completo que recolecta, almacena e indexa estos logs. Fuente oficial: [The Twelve-Factor App — Logs](https://12factor.net/logs).

**Errores comunes:** loguear la mayoría de eventos normales como `error`, generando ruido que dificulta identificar problemas reales; mezclar logs de texto libre y estructurados dentro del mismo servicio sin una convención consistente.

**Cuándo no usarlo:** para un script de un solo uso, ejecutado manualmente y leído directamente por una persona en el momento, un log de texto libre simple es suficiente; el logging estructurado aporta valor cuando hay volumen y necesidad de búsqueda automatizada posterior.

**Transferencia al proyecto integrador «Plataforma de entrega continua»:** Emite logs estructurados para una petición exitosa y una fallida. Parsealos automáticamente y comprueba campos estables y ausencia de secretos, sin depender de expresiones regulares sobre mensajes libres.

### Tema 2: Pipeline ELK/EFK

#### Paso 1 · Objetivo y preparación

Al finalizar podrás explicar las tres etapas de un pipeline de logging centralizado (recolección, indexación, visualización) y en cuál de ellas diagnosticar un problema específico.

**Conocimiento previo:** Tema 1 de este módulo; Docker Compose (Módulo 3).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Este es un caso real de diagnóstico: entender la arquitectura en tres etapas permite razonar sobre dónde reside un cuello de botella específico (¿el agente no envía logs? ¿el almacenamiento no indexa a tiempo? ¿la visualización no refleja lo almacenado?).

#### Paso 3 · Teoría con analogía

**Conceptos clave:** recolección (Filebeat/Fluentd), almacenamiento e indexación (Elasticsearch), visualización (Kibana), pipeline en tres etapas.

Un agente ligero (Filebeat/Fluentd) recolecta logs en cada máquina o contenedor y los envía sin transformación pesada. Elasticsearch indexa el contenido completo, permitiendo búsquedas de texto completo rápidas a costa de recursos proporcionales al volumen. Kibana visualiza y permite construir búsquedas sobre esos datos, de forma conceptualmente similar a cómo Grafana visualiza Prometheus.

**Analogía:** el pipeline ELK/EFK es como una biblioteca moderna: bibliotecarios auxiliares recolectan y catalogan libros nuevos (recolección), un sistema central indexa cada libro por título, autor y contenido completo (Elasticsearch), y un mostrador de consulta permite buscar visualmente (Kibana).

**Diagrama:**

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

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo10/elk` y levanta Elasticsearch como la etapa de almacenamiento/indexación, enviando logs directamente vía su API HTTP (simulando en un paso lo que Filebeat automatizaría):

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

**Explicación línea por línea:** `discovery.type=single-node` evita que Elasticsearch espere formar un clúster de múltiples nodos, apropiado solo para este laboratorio local; el `POST` a `/logs-app/_doc` simula lo que Filebeat haría automáticamente en producción: enviar cada log estructurado hacia Elasticsearch para su indexación.

Busca el log recién indexado por contenido de texto completo:

```bash
sleep 2
curl -s -X GET "http://localhost:9200/logs-app/_search?q=timeout" | python3 -m json.tool | grep -A2 '"_source"'
```

**Resultado esperado:** `_cluster/health` reporta `"status": "green"` o `"yellow"` (saludable para un nodo único); la búsqueda por la palabra `timeout` encuentra el documento indexado y devuelve su contenido completo, demostrando la indexación de texto completo que caracteriza a Elasticsearch.

**Fallo deliberado:** busca una palabra que nunca fue indexada (`_search?q=palabraquenoexiste`). La respuesta reporta `"total": {"value": 0}` — diagnostica confirmando que Elasticsearch solo encuentra lo que efectivamente fue indexado; si Filebeat nunca hubiera enviado el log en primer lugar, ninguna búsqueda posterior lo encontraría, sin importar cuán específica sea la consulta.

#### Paso 5 · Práctica guiada

Indexa un segundo documento con `level: info` y ejecuta `curl ".../logs-app/_search?q=level:error"` para confirmar que el filtro estructurado por campo (no solo texto libre) también funciona en Elasticsearch. **Pista:** Elasticsearch soporta tanto búsqueda de texto completo como consultas estructuradas sobre campos específicos.

#### Paso 6 · Práctica independiente

Detén el contenedor de Elasticsearch (`docker stop elasticsearch-demo`) e intenta el mismo `POST` de indexación; documenta en qué etapa del pipeline (recolección, indexación o visualización) fallaría un sistema real si Elasticsearch estuviera caído, y qué comportamiento esperarías de Filebeat en ese escenario (normalmente reintentos con buffer).

#### Paso 7 · Cierre

Ya distingues las tres etapas de un pipeline de logging centralizado y dónde diagnosticar un problema en cada una. El siguiente tema compara este enfoque con una alternativa de menor coste operativo. Fuente oficial: [Elastic — What is the ELK Stack](https://www.elastic.co/what-is/elk-stack).

**Errores comunes:** asumir que un log existe en el sistema de búsqueda antes de confirmar que la etapa de recolección efectivamente lo envió; subestimar el coste de infraestructura de Elasticsearch a medida que crece el volumen de logs indexados.

**Cuándo no usarlo:** para un volumen de logs pequeño donde el coste operativo de mantener Elasticsearch no se justifica, un pipeline más ligero (Tema 3) suele ser preferible; el beneficio de la indexación completa de Elasticsearch aparece con volúmenes grandes y necesidad real de búsqueda de texto sofisticada.

**Transferencia al proyecto integrador «Plataforma de entrega continua»:** Envía logs del contenedor al colector y búscalos por correlación. Interrumpe temporalmente el destino y documenta qué buffering o pérdida observas antes de declarar fiable la entrega.

### Tema 3: Loki + Grafana como alternativa ligera

#### Paso 1 · Objetivo y preparación

Al finalizar podrás consultar logs con LogQL filtrando primero por labels (rápido) antes de aplicar un filtro de texto libre (más costoso), aprovechando la integración nativa de Loki con Grafana.

**Conocimiento previo:** Temas 1 y 2 de este módulo; Grafana (Módulo 9).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Este es un caso real de coste operativo: si el equipo ya usa Grafana para métricas y valora la simplicidad, Loki es frecuentemente la elección preferida para volúmenes moderados de logs, evitando el coste de indexar contenido completo.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** indexación solo de metadata (labels), coste operativo reducido, integración nativa con Grafana.

Loki solo indexa labels (`service`, `nivel`, `entorno`), almacenando el contenido comprimido sin indexación de texto completo. Las búsquedas por label son muy rápidas; las de texto libre requieren escanear el contenido de los logs ya filtrados por label. Loki se integra nativamente con Grafana usando LogQL, permitiendo correlacionar métricas y logs en el mismo dashboard.

**Analogía:** Elasticsearch cataloga meticulosamente cada palabra de cada libro para buscar cualquier frase exacta instantáneamente. Loki solo cataloga título, autor y tema, permitiendo encontrar rápido la sección correcta, pero requiriendo hojear manualmente dentro de ella para una frase textual concreta.

**Diagrama:**

```
┌── Elasticsearch ──────────────┐   ┌── Loki ────────────────────────┐
│ Indexa TODO el contenido completo │   │ Indexa SOLO labels (service, nivel)  │
│ Búsqueda de texto libre: RÁPIDA    │   │ Búsqueda de texto: requiere filtrar     │
│ Coste operativo: ALTO                │   │ por labels primero; coste: BAJO           │
└─────────────────────────┘   └───────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo10/loki` y envía logs directamente a la API de Loki (simulando lo que Promtail automatizaría):

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

**Explicación línea por línea:** `stream` define los labels indexados (`service`, `level`); `values` contiene el timestamp en nanosegundos y el contenido de texto completo, almacenado comprimido pero sin indexación de texto completo, la diferencia de diseño central frente a Elasticsearch.

Consulta primero filtrando por label (rápido), y luego agregando un filtro de texto dentro de ese subconjunto:

```bash
sleep 2
curl -s -G "http://localhost:3100/loki/api/v1/query" --data-urlencode 'query={service="api",level="error"}' | python3 -m json.tool | grep -A1 '"values"'
curl -s -G "http://localhost:3100/loki/api/v1/query" --data-urlencode 'query={service="api"} |= "timeout"' | python3 -m json.tool | grep result
```

**Resultado esperado:** la primera consulta (`{service="api",level="error"}`) devuelve el log indexado por labels rápidamente; la segunda (`{service="api"} |= "timeout"`) agrega un filtro de texto libre DENTRO del subconjunto ya acotado por el label `service`, la práctica recomendada de LogQL: filtrar primero por labels, luego por texto.

**Fallo deliberado:** ejecuta una consulta de solo texto libre sin ningún filtro de labels (`curl -G ... --data-urlencode 'query={} |= "timeout"'` — Loki en realidad exige al menos un selector de label no vacío). La consulta es rechazada — diagnostica revisando el mensaje de error, que confirma que LogQL requiere obligatoriamente al menos un filtro de label antes de cualquier búsqueda de texto, exactamente el diseño que evita escaneos costosos sin acotar.

#### Paso 5 · Práctica guiada

Envía un segundo log con `level: info` al mismo stream `service=api`, y ejecuta una consulta que filtre solo por `{service="api", level="error"}` para confirmar que el log `info` no aparece. **Pista:** cada combinación única de labels define un stream distinto dentro de Loki.

#### Paso 6 · Práctica independiente

Mide cuántos labels distintos tendría sentido usar para tus propios servicios (demasiados labels con alta cardinalidad, como un ID de usuario único por línea, degradan el rendimiento de Loki); documenta qué labels usarías y cuáles evitarías, y por qué.

#### Paso 7 · Cierre

Ya consultas logs de forma eficiente filtrando primero por labels, entendiendo el compromiso de diseño frente a Elasticsearch. El siguiente tema conecta logs de múltiples servicios de una misma petición. Fuente oficial: [Grafana Loki — LogQL](https://grafana.com/docs/loki/latest/query/).

**Errores comunes:** usar labels de alta cardinalidad (como un ID único por petición) degradando el índice de Loki; intentar una búsqueda de texto libre sin acotar primero por labels, esperando el mismo rendimiento que Elasticsearch.

**Cuándo no usarlo:** si el caso de uso requiere búsquedas de texto completo muy sofisticadas y frecuentes sobre volúmenes masivos sin labels claros que acoten la búsqueda, Loki no es el límite adecuado; ahí Elasticsearch con su indexación completa es más apropiado a pesar del mayor coste.

**Transferencia al proyecto integrador «Plataforma de entrega continua»:** Consulta los logs de la candidata por servicio y versión en Loki. Verifica que las etiquetas tienen cardinalidad controlada y usa el cuerpo del log para identificadores de petición.

### Tema 4: Correlation ID a través de servicios

#### Paso 1 · Objetivo y preparación

Al finalizar podrás propagar un correlation ID entre dos servicios que se comunican entre sí, reconstruyendo el flujo completo de una petición con una única búsqueda.

**Conocimiento previo:** Temas 1 a 3 de este módulo; NGINX proxy (Módulo 0).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Este es un caso real de diagnóstico distribuido: sin correlation ID, correlacionar logs de múltiples servicios que procesaron una misma petición requiere alinear eventos por proximidad de marca de tiempo, un proceso lento y propenso a error bajo tráfico concurrente real.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** correlation ID, propagación entre servicios, cabecera HTTP, reconstrucción de flujo distribuido.

Un correlation ID se genera al inicio del procesamiento de una petición (o se reutiliza si ya viene de un llamador anterior), se incluye en cada log relacionado, y se propaga a cualquier servicio adicional invocado. Con este mecanismo, reconstruir el flujo completo de una petición se convierte en una simple búsqueda de ese identificador en el sistema de logging centralizado.

**Analogía:** un correlation ID es como el número de seguimiento único de un paquete que atraviesa múltiples centros de distribución: cada centro registra ese mismo número, y buscarlo reconstruye instantáneamente el recorrido completo.

**Diagrama:**

```
Petición del usuario ──▶ Servicio A (correlationId: abc-123, genera nuevo)
                              │  propaga la cabecera x-correlation-id
                              ▼
                         Servicio B (correlationId: abc-123, mismo ID)

Buscar "abc-123" en el sistema centralizado
   ──▶ reconstruye el flujo completo: A ──▶ B, con tiempos de cada etapa
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo10/correlation-id` con dos servicios que se llaman entre sí:

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

**Explicación línea por línea:** el Servicio A genera un `correlationId` nuevo si la petición entrante no trae uno, y lo propaga explícitamente como cabecera `x-correlation-id` en su llamada saliente hacia el Servicio B; el Servicio B lee esa misma cabecera en vez de generar su propio ID independiente.

Genera una petición y confirma que ambos servicios registran el mismo correlation ID:

```bash
sleep 2
curl -s http://localhost:3030/
echo
docker logs servicio-a 2>&1 | tail -1
docker logs servicio-b 2>&1 | tail -1
```

**Resultado esperado:** ambas líneas de log (de `servicio-a` y `servicio-b`) muestran exactamente el mismo valor de `correlationId`, confirmando que se propagó correctamente de un servicio a otro a través de la cabecera HTTP, permitiendo reconstruir que ambos logs pertenecen a la misma petición original.

**Fallo deliberado:** modifica `servicio-b.js` para que genere su propio `correlationId` con `crypto.randomUUID()` en vez de leer la cabecera entrante. Repite la petición y compara los logs de A y B — tendrán IDs distintos, rompiendo la capacidad de correlacionarlos como la misma petición — diagnostica confirmando que la propagación debe implementarse explícitamente en cada servicio; no ocurre automáticamente solo por estar en la misma red.

#### Paso 5 · Práctica guiada

Envía una segunda petición pasando tú mismo un `x-correlation-id` explícito (`curl -H "x-correlation-id: mi-id-de-prueba" http://localhost:3030/`) y confirma en los logs que ambos servicios usaron exactamente ese valor en vez de generar uno nuevo. **Pista:** esto simula que el Servicio A no es realmente el primer punto de entrada, sino que recibió la petición de otro servicio anterior que ya había generado el ID.

#### Paso 6 · Práctica independiente

Agrega un tercer servicio C, invocado por B de la misma forma que A invoca a B, y confirma que el mismo correlation ID se propaga correctamente a través de los tres servicios en cadena.

#### Paso 7 · Cierre

Ya reconstruyes el flujo completo de una petición distribuida con una única búsqueda, gracias a la propagación consistente del correlation ID. Esto cierra el módulo de logging centralizado; el siguiente módulo cubre seguridad DevSecOps. Fuente oficial: [Distributed Tracing — Correlation IDs](https://microservices.io/patterns/observability/distributed-tracing.html).

**Errores comunes:** generar un correlation ID nuevo en cada servicio en vez de propagar el recibido, rompiendo la correlación; olvidar propagar la cabecera en alguna llamada saliente específica, dejando un "salto" sin trazabilidad en la cadena.

**Cuándo no usarlo:** para un servicio verdaderamente aislado que nunca invoca a ningún otro servicio ni es invocado como parte de un flujo distribuido, un correlation ID propagado no aporta valor adicional sobre un identificador de petición local simple.

---

**Transferencia al proyecto integrador «Plataforma de entrega continua»:** Transporta el identificador de correlación entre petición, trabajo y respuesta. Ejecuta dos solicitudes simultáneas y demuestra que puedes reconstruir cada una sin mezclar sus eventos.

## Laboratorio práctico

**Objetivo del laboratorio:** configurar logging estructurado en dos servicios propios que se comunican entre sí, levantar Loki + Grafana con Docker Compose, y propagar un correlation ID entre ambos servicios para reconstruir el flujo completo de una petición.

**Requisitos previos:** dos servicios propios simples, Docker Compose (Módulo 3 de este track).

| Paso | Acción | Configuración | Explicación | Resultado esperado |
|---|---|---|---|---|
| 1 | Configurar logging JSON estructurado | Ambos servicios con `level`, `service`, `msg`, `correlationId` | Aplica el Tema 1 | Los logs aparecen como JSON válido |
| 2 | Levantar Loki y Grafana | Servicios `loki`, `grafana`, `promtail` en `docker-compose.yml` | Prepara la infraestructura de logging centralizado | Los tres servicios se levantan correctamente |
| 3 | Conectar Grafana a Loki | Fuente de datos Loki apuntando a la URL interna del servicio | Habilita consultar logs desde Grafana | Grafana confirma la conexión |
| 4 | Implementar la propagación del correlation ID | Servicio A genera/propaga, servicio B lee la cabecera | Aplica el Tema 4 | Ambos servicios incluyen el mismo `correlationId` |
| 5 | Generar una petición de prueba | Invoca A de forma que dispare una llamada a B | Genera datos reales para correlacionar | Ambos servicios generan logs relacionados |
| 6 | Buscar por correlation ID en Grafana | LogQL filtrando por ese `correlationId` | Reconstruye el flujo completo | Logs de A seguidos de B en orden cronológico |
| 7 | Filtrar por nivel de log | LogQL con `level="error"` | Verifica el filtrado eficiente por label | Solo aparecen los logs de nivel error |

**Verificación:** el laboratorio se considera exitoso si la búsqueda por correlation ID muestra correctamente los logs de ambos servicios en el orden cronológico correcto.

**Errores comunes y soluciones**

- **Promtail no envía ningún log a Loki.** Verifica sus rutas configuradas y que apunta a la URL interna correcta del servicio `loki`.
- **Los logs aparecen sin los labels esperados.** Promtail necesita configuración explícita para promover campos del JSON a labels.
- **El correlation ID no coincide entre A y B.** Verifica que A propaga la cabecera saliente y que B la lee en vez de generar la suya.
- **Las consultas LogQL de texto libre son muy lentas.** Filtra primero por labels específicos antes de añadir un filtro de texto.

---
