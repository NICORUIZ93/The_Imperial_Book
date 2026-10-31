# Módulo 9: Observabilidad con Prometheus y Grafana


## Aprende construyendo

### Tema 1: Modelo de métricas de Prometheus — counter, gauge, histogram

#### Paso 1 · Objetivo y preparación

Al finalizar podrás instrumentar una aplicación con counters, gauges e histograms, eligiendo el tipo correcto según si un valor solo crece, sube y baja, o se distribuye en rangos.

**Conocimiento previo:** Docker y Docker Compose (Módulos 0-3) de este track.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Este es un caso real de instrumentación: elegir el tipo de métrica equivocado —típicamente un gauge para algo que debería ser counter, o viceversa— produce resultados sin sentido al aplicar las funciones de PromQL diseñadas para cada tipo.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** counter (monótono creciente), gauge (sube y baja), histogram (distribución en buckets), serie temporal.

Prometheus modela todo como series temporales identificadas por nombre y etiquetas. Un counter solo puede incrementarse (o reiniciarse a cero si el proceso reinicia): total de peticiones, total de errores. Un gauge sube y baja libremente: memoria en uso, conexiones activas. Un histogram agrupa observaciones en buckets (rangos), permitiendo calcular percentiles después con PromQL.

**Analogía:** un counter es como el odómetro de un vehículo: solo aumenta. Un gauge es como el velocímetro: sube y baja constantemente. Un histogram es un registro de cuántos viajes cayeron en cada rango de duración, permitiendo analizar la distribución completa, no solo el promedio.

**Diagrama:**

```
┌── Counter (http_requests_total) ──┐  ┌── Gauge (conexiones_activas) ──┐  ┌── Histogram (latencia) ──┐
│ solo sube, nunca baja                │  │ sube y baja libremente             │  │ buckets: ≤100ms:850  │
│ (salvo reinicio del proceso)          │  │                                      │  │ ≤500ms:980 ≤1s:995     │
└─────────────────────────┘  └─────────────────────────┘  └───────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo9/metricas` con una API que expone los tres tipos de métrica:

```bash
mkdir -p academia-devops/src/modulo9/metricas && cd academia-devops/src/modulo9/metricas
cat > package.json <<'EOF'
{"name":"metricas-demo","dependencies":{"prom-client":"15.1.0"}}
EOF
cat > app.js <<'EOF'
const http = require('node:http');
const client = require('prom-client');
const peticionesTotal = new client.Counter({ name: 'http_requests_total', help: 'total de peticiones', labelNames: ['status'] });
const conexionesActivas = new client.Gauge({ name: 'conexiones_activas', help: 'conexiones activas ahora' });
const latencia = new client.Histogram({ name: 'latencia_segundos', help: 'latencia de peticiones', buckets: [0.1, 0.5, 1] });

http.createServer(async (req, res) => {
  if (req.url === '/metrics') { res.end(await client.register.metrics()); return; }
  conexionesActivas.inc();
  const fin = latencia.startTimer();
  peticionesTotal.inc({ status: '200' });
  setTimeout(() => { fin(); conexionesActivas.dec(); res.end('ok'); }, Math.random() * 300);
}).listen(3000);
EOF
docker run -d --name metricas-app -p 3010:3000 -v "$(pwd)":/app -w /app node:22-alpine sh -c "npm install --silent && node app.js"
```

**Explicación línea por línea:** `--silent` es la bandera que le dice a `npm install` que no imprima el log detallado de la instalación, dejando solo la salida de la aplicación. `Counter` (`http_requests_total`) solo se incrementa con `.inc()`; `Gauge` (`conexiones_activas`) sube con `.inc()` y baja con `.dec()`, reflejando el valor actual; `Histogram` (`latencia_segundos`) registra cada observación en el bucket correspondiente automáticamente vía `startTimer()`.

Genera tráfico y consulta las tres métricas expuestas:

```bash
sleep 8
for i in $(seq 10); do curl -s http://localhost:3010/ >/dev/null & done; wait
curl -s http://localhost:3010/metrics | grep -E "^http_requests_total|^conexiones_activas|^latencia_segundos_bucket"
```

**Resultado esperado:** `http_requests_total{status="200"}` muestra un valor acumulado igual al número de peticiones atendidas; `conexiones_activas` fluctúa entre 0 y el número de peticiones concurrentes en curso; `latencia_segundos_bucket` muestra conteos acumulados por cada rango (`le="0.1"`, `le="0.5"`, `le="1"`).

**Fallo deliberado:** cambia `peticionesTotal.inc(...)` por una asignación directa que la haga bajar en algún punto (simulando un uso incorrecto de un counter como si fuera un gauge, por ejemplo restándole con `.inc(-1)`). Prometheus scrapeará un valor que retrocede — diagnostica revisando la métrica cruda con `curl .../metrics`, confirmando que un counter que retrocede sin reinicio del proceso es una señal de instrumentación incorrecta, no de comportamiento normal.

#### Paso 5 · Práctica guiada

Agrega una etiqueta `method` al counter `http_requests_total` (`labelNames: ['status', 'method']`) y confirma que `curl .../metrics` ahora muestra series separadas por combinación de `status` y `method`. **Pista:** cada combinación única de valores de etiquetas genera una serie temporal distinta, aunque compartan el mismo nombre de métrica.

#### Paso 6 · Práctica independiente

Agrega un segundo gauge que registre el tamaño de una cola simulada (`const colaSize = new client.Gauge(...)`, incrementado y decrementado según una lista en memoria), y confirma que su comportamiento en `/metrics` refleja subidas y bajadas, a diferencia del counter que solo crece.

#### Paso 7 · Cierre

Ya distingues cuándo usar cada tipo de métrica según su patrón de comportamiento real. El siguiente tema convierte estos valores crudos en información interpretable con PromQL. Fuente oficial: [Prometheus — Metric Types](https://prometheus.io/docs/concepts/metric_types/).

**Errores comunes:** usar un counter para un valor que legítimamente sube y baja (como conexiones activas); no definir etiquetas suficientemente ricas al instrumentar, limitando qué preguntas se pueden responder después sin reinstrumentar.

**Cuándo no usarlo:** para un valor que rara vez cambia y no necesita análisis de tendencia (como una versión de build estática), instrumentarlo como métrica de Prometheus añade overhead sin beneficio real; una etiqueta fija en otra métrica ya existente suele bastar.

**Transferencia al proyecto integrador «Plataforma de entrega continua»:** Instrumenta peticiones, operaciones en curso y duración con tipos de métrica adecuados. Envía una carga conocida y comprueba conteos y unidades, evitando etiquetas con identificadores de usuarios o guías.

### Tema 2: PromQL esencial

#### Paso 1 · Objetivo y preparación

Al finalizar podrás escribir consultas PromQL con `rate()`, agregación y filtrado por etiquetas para convertir contadores acumulados en tasas interpretables.

**Conocimiento previo:** Tema 1 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Este es un caso real: un counter acumulado sin `rate()` es un número absoluto poco interpretable por sí solo; PromQL es el lenguaje que convierte esos datos crudos en información accionable.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** `rate()`, agregación (`sum`, `avg`), filtrado por etiquetas, ventana de tiempo.

`rate(http_requests_total[5m])` calcula la tasa de incremento por segundo de un counter sobre una ventana de tiempo. Combinado con filtrado por etiquetas y agregación: `sum(rate(http_requests_total{status="500"}[5m])) / sum(rate(http_requests_total[5m]))` calcula la tasa de error como proporción. Las funciones de agregación combinan series de múltiples réplicas en un único valor.

**Analogía:** un counter sin `rate()` es como mirar el odómetro total y tratar de deducir la velocidad actual sin contexto de tiempo. `rate()` es calcular la velocidad real dividiendo distancia entre tiempo en una ventana reciente.

**Diagrama:**

```
http_requests_total (counter, acumulado, poco interpretable directamente)
   ▼
rate(...[5m])  ──▶  peticiones por segundo (interpretable directamente)
   ▼
sum(rate(...{status="500"}[5m])) / sum(rate(...[5m]))  ──▶  tasa de error (ej. 0.02 = 2%)
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo9/promql` levantando Prometheus apuntando a la API del Tema 1:

```bash
mkdir -p academia-devops/src/modulo9/promql && cd academia-devops/src/modulo9/promql
cat > prometheus.yml <<'EOF'
global: { scrape_interval: 5s }
scrape_configs:
  - job_name: 'metricas-app'
    static_configs:
      - targets: ['host.docker.internal:3010']
EOF
docker run -d --name prometheus-demo -p 9090:9090 -v "$(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml:ro" \
  --add-host=host.docker.internal:host-gateway prom/prometheus
sleep 5
curl -s 'http://localhost:9090/api/v1/query?query=up' | grep -o '"value":\[[^]]*\]'
```

**Explicación línea por línea:** `--add-host` es la bandera que agrega una entrada DNS manual dentro del contenedor (acá, para que Prometheus pueda resolver `host.docker.internal` y alcanzar la app corriendo en el host). `scrape_configs` le dice a Prometheus cada cuántos segundos (`scrape_interval`) consultar el endpoint `/metrics` de la aplicación; `up` es una métrica interna que Prometheus genera automáticamente por cada target, valiendo `1` si el scrape tuvo éxito.

Genera tráfico real y ejecuta `rate()` sobre el counter acumulado vía la API HTTP de Prometheus:

```bash
for i in $(seq 30); do curl -s http://localhost:3010/ >/dev/null & done; wait
sleep 10
curl -s 'http://localhost:9090/api/v1/query?query=rate(http_requests_total[1m])' | python3 -m json.tool
```

**Resultado esperado:** la consulta `up` devuelve `1` para el target `metricas-app`, confirmando el scrape exitoso; `rate(http_requests_total[1m])` devuelve un valor numérico positivo (peticiones por segundo), calculado a partir del incremento del counter durante el último minuto, no el valor acumulado absoluto.

**Fallo deliberado:** consulta `rate(conexiones_activas[1m])` (aplicando `rate()` sobre un gauge, no un counter). El resultado es numéricamente calculable pero conceptualmente sin sentido — diagnostica comparando contra la documentación de Prometheus, que advierte explícitamente que `rate()` está diseñada para counters monótonos, no para valores que suben y bajan libremente.

#### Paso 5 · Práctica guiada

Agrega una segunda instancia de la aplicación (otro contenedor en un puerto distinto) como un segundo target en `prometheus.yml`, y ejecuta `sum(rate(http_requests_total[1m]))` para confirmar que agrega el tráfico de ambas instancias en un único valor. **Pista:** sin `sum()`, la consulta devolvería dos series separadas, una por instancia.

#### Paso 6 · Práctica independiente

Provoca artificialmente algunas respuestas con `status="500"` (modificando `app.js` para fallar aleatoriamente una fracción de las veces) y calcula la tasa de error real con la consulta completa del Paso 2; compara el resultado contra la proporción real que configuraste en el código.

#### Paso 7 · Cierre

Ya conviertes contadores acumulados en tasas y proporciones interpretables directamente. El siguiente tema visualiza estas mismas consultas en dashboards. Fuente oficial: [Prometheus — Querying basics](https://prometheus.io/docs/prometheus/latest/querying/basics/).

**Errores comunes:** aplicar `rate()` sobre un gauge en vez de un counter; olvidar `sum()` al combinar métricas de múltiples réplicas, obteniendo series separadas en vez de un valor agregado.

**Cuándo no usarlo:** para un gauge (valor que ya representa el estado actual), aplicar `rate()` no tiene sentido; ahí simplemente se consulta el valor directo, opcionalmente con funciones de agregación si hay múltiples instancias.

**Transferencia al proyecto integrador «Plataforma de entrega continua»:** Construye consultas para tasa de errores y latencia del servicio. Valídalas con un periodo sin tráfico y con un fallo controlado para evitar divisiones inválidas o promedios engañosos.

### Tema 3: Dashboards en Grafana

#### Paso 1 · Objetivo y preparación

Al finalizar podrás conectar Grafana a Prometheus como fuente de datos y construir un panel que visualiza una consulta PromQL en tiempo real.

**Conocimiento previo:** Temas 1 y 2 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Este es un caso real de respuesta a incidentes: un buen dashboard reduce el tiempo que un equipo necesita para entender el estado real de un sistema, especialmente crítico cuando cada minuto de diagnóstico cuenta.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** panel, fuente de datos (data source), consulta visualizada, dashboard compartido.

Grafana visualiza datos de múltiples fuentes, comúnmente Prometheus. Un dashboard se compone de paneles, cada uno con una consulta y un tipo de visualización (líneas, valor destacado, tabla). Un buen dashboard se organiza en torno a preguntas operativas reales, no expone todas las métricas disponibles indiscriminadamente, evitando la sobrecarga que lo haría tan inútil como no tener dashboard.

**Analogía:** un dashboard de Grafana es el panel de instrumentos de la cabina de un piloto: una selección cuidadosa de los indicadores más críticos (altitud, velocidad, combustible), no cada sensor individual del avión.

**Diagrama:**

```
┌── Dashboard "Estado del servicio" ──────────────┐
│ Panel: tasa de peticiones/segundo (líneas)          │
│ Panel: tasa de error actual (valor, rojo si > 5%)     │
│ Panel: latencia p95 (líneas)                            │
└─────────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo9/grafana` y levanta Grafana apuntando al Prometheus del Tema 2:

```bash
mkdir -p academia-devops/src/modulo9/grafana/provisioning/datasources
cd academia-devops/src/modulo9/grafana
cat > provisioning/datasources/prometheus.yml <<'EOF'
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://host.docker.internal:9090
    isDefault: true
EOF
docker run -d --name grafana-demo -p 3300:3000 \
  --add-host=host.docker.internal:host-gateway \
  -v "$(pwd)/provisioning:/etc/grafana/provisioning" \
  -e GF_AUTH_ANONYMOUS_ENABLED=true -e GF_AUTH_ANONYMOUS_ORG_ROLE=Admin \
  grafana/grafana
sleep 6
curl -s -u admin:admin http://localhost:3300/api/datasources | python3 -m json.tool | grep -A2 '"name": "Prometheus"'
```

**Explicación línea por línea:** el archivo de `provisioning/datasources` configura la fuente de datos Prometheus automáticamente al arrancar Grafana, sin necesitar configurarla manualmente en la interfaz cada vez que se recrea el contenedor.

Crea un dashboard con un panel vía la API de Grafana, usando la misma consulta del Tema 2:

```bash
cat > dashboard.json <<'EOF'
{"dashboard":{"title":"Estado del servicio","panels":[{"type":"timeseries","title":"Peticiones por segundo","targets":[{"expr":"rate(http_requests_total[1m])"}],"gridPos":{"h":8,"w":12,"x":0,"y":0}}]},"overwrite":true}
EOF
curl -s -u admin:admin -X POST -H "Content-Type: application/json" -d @dashboard.json http://localhost:3300/api/dashboards/db | python3 -m json.tool
```

**Resultado esperado:** la API de datasources confirma que "Prometheus" quedó registrada como fuente por defecto; la creación del dashboard responde con `"status": "success"` y una URL del dashboard recién creado, confirmando que el panel con la consulta `rate(http_requests_total[1m])` quedó guardado.

**Fallo deliberado:** cambia la `url` del datasource a un puerto incorrecto (`http://host.docker.internal:9999`) y vuelve a aplicar el provisioning (recreando el contenedor). El panel del dashboard queda sin datos — diagnostica visitando `curl -u admin:admin http://localhost:3300/api/datasources/1/health` (o el ID correspondiente), que reportará el fallo de conexión hacia Prometheus.

#### Paso 5 · Práctica guiada

Agrega un segundo panel al `dashboard.json` con la consulta de tasa de error del Tema 2, y vuelve a aplicarlo con la misma llamada a la API. **Pista:** cada elemento del array `panels` necesita su propio `gridPos` para no superponerse visualmente con los demás.

#### Paso 6 · Práctica independiente

Investiga y documenta cómo agregarías una variable de plantilla (`templating`) al dashboard para poder elegir entre múltiples instancias de la aplicación desde un desplegable, sin duplicar el dashboard completo por instancia.

#### Paso 7 · Cierre

Ya visualizas consultas PromQL en tiempo real organizadas en torno a preguntas operativas reales. El siguiente tema convierte estas mismas consultas en alertas automáticas. Fuente oficial: [Grafana — Provisioning](https://grafana.com/docs/grafana/latest/administration/provisioning/).

**Errores comunes:** configurar la URL del datasource apuntando a `localhost` en vez de al nombre de red correcto cuando Grafana corre en un contenedor distinto de Prometheus; construir un dashboard con demasiados paneles sin priorizar las preguntas operativas realmente importantes.

**Cuándo no usarlo:** para una métrica que se consulta una única vez de forma puntual durante un diagnóstico específico, crear un panel permanente en un dashboard compartido es innecesario; una consulta directa en la interfaz de Prometheus basta para ese caso.

**Transferencia al proyecto integrador «Plataforma de entrega continua»:** Crea un panel que permita decidir si el despliegue funciona: tráfico, errores y latencia. Relaciona cada gráfico con una acción y comprueba que sus unidades y filtros corresponden al mismo servicio.

### Tema 4: Alertmanager y reglas de alerta

#### Paso 1 · Objetivo y preparación

Al finalizar podrás definir una regla de alerta con una condición sostenida en el tiempo (`for`), evitando que fluctuaciones momentáneas disparen notificaciones innecesarias.

**Conocimiento previo:** Temas 1 a 3 de este módulo; Módulo 5 (rollback automático por métricas).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Este es un caso real de fatiga de alertas: un sistema de alertas mal calibrado, ya sea por exceso o por defecto, es tan perjudicial para la fiabilidad operativa como no tener ningún sistema de alertas.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** regla de alerta, `expr`, `for` (duración sostenida), Alertmanager, enrutamiento de notificaciones.

Una regla de alerta define una condición PromQL (`expr`) que, sostenida durante `for`, dispara una alerta. Prometheus envía alertas disparadas a Alertmanager, que las agrupa, silencia si aplica, y enruta al canal correcto. Alertar sobre síntomas observables por el usuario (tasa de error, latencia) es preferible a alertar sobre causas internas específicas.

**Analogía:** una regla de alerta es un guardia instruido para avisar solo si una puerta permanece abierta más de 2 minutos continuos, no ante una apertura momentánea normal. Alertmanager es la central que agrupa avisos relacionados y dirige cada uno al equipo correcto.

**Diagrama:**

```
Prometheus evalúa continuamente: expr > umbral, sostenido durante "for"
   ¿condición cumplida durante todo el periodo "for"?
     Sí ──▶ envía alerta disparada a Alertmanager
              agrupa, silencia si aplica, enruta al canal/persona correcta
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo9/alertas` con una regla de alerta real evaluada por Prometheus:

```bash
mkdir -p academia-devops/src/modulo9/alertas && cd academia-devops/src/modulo9/alertas
docker network inspect bridge >/dev/null 2>&1 || true
cat > reglas.yml <<'EOF'
groups:
  - name: alertas-demo
    rules:
      - alert: TasaDeErrorAlta
        expr: sum(rate(http_requests_total{status="500"}[1m])) / sum(rate(http_requests_total[1m])) > 0.05
        for: 30s
        labels: { severity: critical }
        annotations: { summary: "tasa de error por encima del 5% sostenida" }
EOF
cat > prometheus.yml <<'EOF'
global: { scrape_interval: 5s, evaluation_interval: 5s }
rule_files: ["reglas.yml"]
scrape_configs:
  - job_name: 'metricas-app'
    static_configs: [{ targets: ['host.docker.internal:3010'] }]
EOF
docker run -d --name prometheus-alertas -p 9091:9090 \
  -v "$(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml:ro" \
  -v "$(pwd)/reglas.yml:/etc/prometheus/reglas.yml:ro" \
  --add-host=host.docker.internal:host-gateway prom/prometheus
sleep 5
curl -s http://localhost:9091/api/v1/rules | python3 -m json.tool | grep -E "name|state"
```

**Explicación línea por línea:** `for: 30s` exige que la condición se mantenga sostenida durante al menos 30 segundos antes de que la alerta pase de `pending` a `firing`; sin `for`, cualquier pico momentáneo de un solo scrape dispararía la alerta inmediatamente.

Fuerza la condición de error real y observa la transición de estado de la alerta:

```bash
sleep 35
curl -s http://localhost:9091/api/v1/alerts | python3 -m json.tool | grep -E "alertname|state" | head -6
```

**Resultado esperado:** si la tasa de error real de tu aplicación se mantiene por encima del 5% durante los 30 segundos de `for`, la alerta `TasaDeErrorAlta` transiciona de `pending` a `firing`; si la tasa de error nunca cruzó ese umbral, `curl .../api/v1/alerts` no muestra ninguna alerta activa.

**Fallo deliberado:** cambia `for: 30s` a `for: 0s` (disparo inmediato sin sostenimiento) y provoca un único pico momentáneo de errores de menos de un segundo. La alerta se dispara instantáneamente ante ese pico aislado — diagnostica revisando el historial de `curl .../api/v1/alerts` inmediatamente después del pico, confirmando que sin una duración sostenida, cualquier fluctuación momentánea genera una alerta, exactamente el problema de fatiga de alertas que `for` está diseñado para prevenir.

#### Paso 5 · Práctica guiada

Agrega una segunda regla de alerta sobre latencia p95 elevada, usando `histogram_quantile(0.95, rate(latencia_segundos_bucket[5m])) > 0.5`. **Pista:** `histogram_quantile` opera sobre las series `_bucket` generadas automáticamente por un Histogram de Prometheus.

#### Paso 6 · Práctica independiente

Reduce el umbral de la regla original a `> 0.01` (1%, muy sensible) y observa cuántas veces se dispara con tráfico normal; documenta en qué punto un umbral demasiado sensible produciría fatiga de alertas en un equipo real.

#### Paso 7 · Cierre

Ya diseñas reglas de alerta que solo notifican ante problemas sostenidos y reales, no ante ruido momentáneo. El siguiente tema formaliza qué nivel de estas métricas es aceptable con SLI/SLO/SLA. Fuente oficial: [Prometheus — Alerting rules](https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/).

**Errores comunes:** omitir `for`, disparando alertas ante cualquier fluctuación momentánea; alertar sobre causas internas específicas (CPU de un servidor) en vez de síntomas observables por el usuario.

**Cuándo no usarlo:** para una condición que, aunque cruce un umbral momentáneamente, no representa ningún riesgo real si se normaliza rápido (como un pico de tráfico legítimo de un segundo), una alerta sin `for` generaría ruido; el límite es diseñar siempre con una duración sostenida apropiada al contexto.

**Transferencia al proyecto integrador «Plataforma de entrega continua»:** Dispara una alerta con una degradación controlada y verifica recepción, agrupación y resolución. El aviso debe enlazar el runbook y señalar el servicio y entorno afectados.

### Tema 5: SLI, SLO, SLA

#### Paso 1 · Objetivo y preparación

Al finalizar podrás definir un SLI medible, fijar un SLO interno más estricto que cualquier SLA externo, y calcular el presupuesto de error resultante.

**Conocimiento previo:** Temas 1 a 4 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Este es un caso real: los SLI/SLO dan a los equipos un lenguaje objetivo y cuantificable para decidir cuándo priorizar estabilidad sobre velocidad, reemplazando percepciones subjetivas ("se siente lento hoy") por un criterio medible.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** Service Level Indicator, Service Level Objective, Service Level Agreement, presupuesto de error (error budget).

Un SLI es una métrica real medible ("porcentaje de peticiones que responden en menos de 200ms"), calculada directamente con PromQL. Un SLO es la meta interna del equipo sobre ese SLI ("99% en 30 días"). Un SLA es un compromiso formal externo con consecuencias contractuales, normalmente más laxo que el SLO interno. El presupuesto de error, derivado del SLO, formaliza cuánta falla es aceptable sin romper la meta.

**Analogía:** un SLI es el tiempo real que un restaurante tarda en servir un plato, medido con cronómetro. Un SLO es la meta interna ("95% en menos de 15 minutos"). Un SLA es el compromiso público a clientes ("garantizamos 20 minutos o el evento es gratis"), típicamente más laxo que la meta interna real.

**Diagrama:**

```
┌── SLI (medido):     99.4% de peticiones bajo 200ms este mes ──┐
│ SLO (objetivo):   99.5% de peticiones bajo 200ms  ← meta interna │
│ SLA (compromiso): 99% de peticiones bajo 200ms    ← promesa externa │
│ Presupuesto de error del SLO: 0.5% puede "fallar" sin romper la meta │
└──────────────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo9/slo` y calcula un SLI real con PromQL sobre el histogram de latencia del Tema 1, generando tráfico desde un contenedor Docker efímero:

```bash
mkdir -p academia-devops/src/modulo9/slo && cd academia-devops/src/modulo9/slo
docker run --rm curlimages/curl sh -c 'for i in $(seq 5); do curl -s http://host.docker.internal:3010/ >/dev/null; done' 2>/dev/null || true
for i in $(seq 40); do curl -s http://localhost:3010/ >/dev/null & done; wait
sleep 5
curl -s 'http://localhost:9090/api/v1/query?query=sum(rate(latencia_segundos_bucket{le="0.5"}[5m]))/sum(rate(latencia_segundos_count[5m]))' | python3 -m json.tool | grep -A1 '"value"'
```

**Explicación línea por línea:** dividir las observaciones que cayeron en el bucket `le="0.5"` (menos de 500ms) entre el total de observaciones (`_count`) produce directamente el SLI "porcentaje de peticiones bajo 500ms", el mismo tipo de cálculo que respalda cualquier SLO real.

Calcula el presupuesto de error restante para un SLO específico y documenta el resultado:

```bash
cat > slo.md <<'EOF'
# SLO de latencia — API demo
SLI: proporción de peticiones que responden en menos de 500ms (medido con PromQL).
SLO: 95% de peticiones bajo 500ms, medido sobre ventana móvil de 30 días.
SLA (si aplicara externamente): 90% bajo 500ms, con crédito de servicio si se incumple.
Presupuesto de error del SLO: 5% del tiempo puede exceder 500ms sin romper la meta interna.
EOF
cat slo.md
```

**Resultado esperado:** la consulta PromQL devuelve un valor entre 0 y 1 (por ejemplo, `0.97`), representando el SLI real medido en esta ventana corta de prueba; `slo.md` documenta explícitamente que el SLO interno (95%) es más estricto que un hipotético SLA externo (90%), dejando margen de seguridad.

**Fallo deliberado:** fija el SLO igual al SLA (ambos en 90%, sin margen interno) y simula que el SLI real cae a 91%. El equipo estaría técnicamente cumpliendo el SLO, pero peligrosamente cerca de incumplir el SLA externo con consecuencias contractuales — diagnostica revisando por qué la práctica recomendada es siempre dejar margen entre el SLO interno y el SLA externo, exactamente el error de no dejarlo.

#### Paso 5 · Práctica guiada

Cambia la ventana de la consulta de `[5m]` a `[30d]` (simulando la ventana real de un SLO mensual, aunque tu Prometheus de prueba no tenga 30 días de datos reales) y explica qué limitación práctica tendría este laboratorio corto para calcular un SLO mensual real. **Pista:** Prometheus solo puede calcular sobre datos que efectivamente recolectó; una ventana de 30 días requiere 30 días de retención de datos.

#### Paso 6 · Práctica independiente

Calcula cuántos minutos de presupuesto de error representan un SLO de 99.9% sobre un mes de 30 días, y documenta ese cálculo junto con una decisión razonada de cuándo el equipo podría "gastar" ese presupuesto en un despliegue de mayor riesgo.

#### Paso 7 · Cierre

Ya mides un SLI real, defines un SLO con margen interno, y calculas el presupuesto de error resultante. El siguiente tema estandariza cómo se instrumenta el código para no acoplarse a Prometheus específicamente. Fuente oficial: [Google SRE Book — Service Level Objectives](https://sre.google/sre-book/service-level-objectives/).

**Errores comunes:** fijar el SLO igual o más laxo que el SLA externo, sin margen de seguridad interno; definir un SLO sin una consulta PromQL concreta que lo mida, dejándolo como una aspiración no verificable.

**Cuándo no usarlo:** para un proyecto interno sin usuarios externos ni compromisos contractuales, un SLA formal no aplica; basta con un SLO interno como meta de calidad, sin la capa adicional de compromiso externo.

**Transferencia al proyecto integrador «Plataforma de entrega continua»:** Define un objetivo de disponibilidad con numerador, denominador y ventana explícitos. Calcula el presupuesto de error con datos de prueba y documenta qué despliegues se detendrían al agotarlo.

### Tema 6: OpenTelemetry como estándar de instrumentación

#### Paso 1 · Objetivo y preparación

Al finalizar podrás instrumentar código una única vez con la API de OpenTelemetry, exportando hacia Prometheus sin acoplar la instrumentación a ese backend específico.

**Conocimiento previo:** Temas 1 a 5 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Este es un caso real de portabilidad: instrumentar directamente contra bibliotecas específicas de un backend obliga a reescribir la instrumentación si la organización decide cambiar de herramienta de observabilidad más adelante.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** OpenTelemetry, instrumentación estándar, independencia de backend de observabilidad, trazas distribuidas.

OpenTelemetry proporciona una API estándar, independiente de backend, para instrumentar métricas, logs y trazas. Un Collector separado exporta esos datos hacia el backend elegido (Prometheus, cualquier sistema de trazas compatible), desacoplando la instrumentación de la elección de herramienta. Las trazas distribuidas permiten seguir una petición a través de múltiples servicios, viendo cuánto tiempo se consumió en cada uno.

**Analogía:** instrumentar directamente contra un backend específico es como escribir documentación interna en un formato propietario de un único proveedor. OpenTelemetry es escribirla en un formato estándar que cualquier proveedor puede leer sin conversión.

**Diagrama:**

```
Código de la aplicación
   │  instrumentado UNA VEZ con la API de OpenTelemetry
   ▼
OpenTelemetry Collector
   ├──▶ exporta métricas a Prometheus
   └──▶ (cambiar de backend no requiere reinstrumentar el código)
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo9/otel` con una aplicación instrumentada con OpenTelemetry en vez de directamente con `prom-client`:

```bash
mkdir -p academia-devops/src/modulo9/otel && cd academia-devops/src/modulo9/otel
cat > package.json <<'EOF'
{"name":"otel-demo","dependencies":{
  "@opentelemetry/api":"1.9.0",
  "@opentelemetry/sdk-metrics":"1.25.0",
  "@opentelemetry/exporter-prometheus":"0.52.0"
}}
EOF
cat > app.js <<'EOF'
const http = require('node:http');
const { MeterProvider } = require('@opentelemetry/sdk-metrics');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');

const exporter = new PrometheusExporter({ port: 9464 }, () => {
  console.log('exportador Prometheus de OpenTelemetry escuchando en :9464/metrics');
});
const meterProvider = new MeterProvider({ readers: [exporter] });
const meter = meterProvider.getMeter('mi-api');
const contador = meter.createCounter('otel_http_requests_total', { description: 'peticiones vía OpenTelemetry' });

http.createServer((req, res) => {
  contador.add(1, { status: '200' }); // instrumentado con la API neutral de OpenTelemetry, no directamente contra Prometheus
  res.end('ok desde app instrumentada con OpenTelemetry');
}).listen(3001);
EOF
docker run -d --name otel-app -p 3011:3001 -p 9465:9464 -v "$(pwd)":/app -w /app node:22-alpine sh -c "npm install --silent && node app.js"
sleep 8
curl -s http://localhost:3011/ >/dev/null
curl -s http://localhost:9465/metrics | grep otel_http_requests_total
```

**Explicación línea por línea:** el código de la aplicación usa exclusivamente la API neutral de OpenTelemetry (`meter.createCounter`, `.add()`), sin importar directamente ninguna biblioteca específica de Prometheus; el `PrometheusExporter` es el único punto que sabe traducir esos datos al formato que Prometheus espera, sin que el resto del código lo sepa.

**Resultado esperado:** `curl http://localhost:9465/metrics` muestra `otel_http_requests_total{status="200"} 1` (o el conteo acumulado real), en formato compatible con Prometheus, a pesar de que el código de la aplicación nunca importó ninguna biblioteca de Prometheus directamente.

**Fallo deliberado:** elimina el `PrometheusExporter` y su configuración, dejando solo el `MeterProvider` sin ningún exportador configurado. La aplicación sigue registrando métricas internamente (`contador.add(1, ...)` no falla), pero no hay ningún endpoint `/metrics` disponible para que Prometheus las consulte — diagnostica confirmando que la instrumentación (qué se mide) está completamente separada de la exportación (a dónde va), exactamente el punto central de OpenTelemetry.

#### Paso 5 · Práctica guiada

Agrega un segundo contador `otel_errores_total` y confirma que aparece igualmente en `http://localhost:9465/metrics` sin ninguna configuración adicional del exportador. **Pista:** el `PrometheusExporter` ya configurado expone automáticamente cualquier métrica nueva registrada en el mismo `MeterProvider`.

#### Paso 6 · Práctica independiente

Investiga (documentando, sin necesariamente instalarlo) cómo se vería la misma instrumentación exportando hacia un backend de trazas distribuidas en vez de Prometheus, y qué cambiaría exactamente en el código de la aplicación (la respuesta esperada: nada en el código de instrumentación, solo la configuración del exportador).

#### Paso 7 · Cierre

Ya instrumentas código de forma neutral al backend de observabilidad elegido. El siguiente tema conecta todas las prácticas de este track con métricas de madurez del equipo completo. Fuente oficial: [OpenTelemetry — Concepts](https://opentelemetry.io/docs/concepts/).

**Errores comunes:** seguir importando bibliotecas específicas de un backend directamente en el código de negocio, perdiendo la independencia que OpenTelemetry ofrece; asumir que OpenTelemetry reemplaza a Prometheus, cuando en realidad es una capa de instrumentación que se complementa con él como backend de destino.

**Cuándo no usarlo:** para un prototipo desechable de corta duración donde nunca se planea cambiar de herramienta de observabilidad, la capa adicional de abstracción de OpenTelemetry puede no justificarse frente a instrumentar directamente y de forma más simple contra Prometheus.

**Transferencia al proyecto integrador «Plataforma de entrega continua»:** Propaga contexto entre API y consumidor mediante instrumentación del laboratorio. Una petición de prueba debe producir una traza correlacionada sin incorporar credenciales ni direcciones personales como atributos.

### Tema 7: Métricas DORA — Lead Time, Deployment Frequency, MTTR, Change Failure Rate

#### Paso 1 · Objetivo y preparación

Al finalizar podrás calcular las cuatro métricas DORA de un proyecto real a partir de su historial de Git y sus incidentes registrados.

**Conocimiento previo:** Temas 1 a 6 de este módulo; Módulos 1, 4 y 5 (Git, CI, CD) de este track.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Este es un caso real, respaldado por investigación empírica: los equipos de más alto rendimiento mejoran las cuatro métricas DORA simultáneamente, sugiriendo que velocidad y estabilidad no están en tensión cuando se invierte en las prácticas correctas.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** DORA (DevOps Research and Assessment), las cuatro métricas clave, madurez del equipo de entrega de software.

Lead Time for Changes mide cuánto tiempo pasa entre un commit y su despliegue a producción. Deployment Frequency mide con qué frecuencia se despliega. MTTR mide cuánto tarda un equipo en restaurar el servicio tras un incidente. Change Failure Rate mide qué porcentaje de cambios desplegados requieren corrección de emergencia o rollback.

**Analogía:** las métricas DORA son como los cuatro indicadores clave de un equipo médico de emergencias: qué tan rápido moviliza un tratamiento aprobado (lead time), con qué frecuencia atiende exitosamente (deployment frequency), qué tan rápido estabiliza si algo sale mal (MTTR), y qué porcentaje de procedimientos requieren corrección adicional (change failure rate).

**Diagrama:**

```
┌── Las cuatro métricas DORA ──────────────────────┐
│ Lead Time for Changes  (commit ──▶ producción)          │
│ Deployment Frequency   (¿cuántas veces al día/semana?)    │
│ MTTR                   (incidente ──▶ servicio restaurado) │
│ Change Failure Rate    (% de cambios que requieren fix)     │
└─────────────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo9/dora` y calcula Lead Time y Deployment Frequency a partir de un historial de Git real con tags de despliegue:

```bash
mkdir -p academia-devops/src/modulo9/dora && cd academia-devops/src/modulo9/dora
docker run --rm -v "$(pwd)":/repo -w /repo alpine/git sh -c '
  git init -q && git config user.email demo@academia.dev && git config user.name demo
  echo v1 > app.txt && git add . && git commit -qm "feature: agrega validacion" --date="2026-01-01T10:00:00"
  GIT_COMMITTER_DATE="2026-01-01T14:00:00" git tag -a v1.0 -m "deploy" -m "" 2>/dev/null || git tag v1.0
  echo v2 > app.txt && git add . && git commit -qm "feature: agrega reintentos" --date="2026-01-02T09:00:00"
  GIT_COMMITTER_DATE="2026-01-03T09:00:00" git tag v1.1
  git log --format="%H %ad %s" --date=iso'
```

**Explicación línea por línea:** `--date` es la bandera de `git commit` que fija manualmente la fecha del commit (útil aquí para simular un historial con fechas controladas en vez de usar el momento real de ejecución); cada tag (`v1.0`, `v1.1`) representa un despliegue real a producción; comparar la fecha del commit contra la fecha del tag correspondiente permite calcular el Lead Time real de cada cambio específico. `python3` es el comando que ejecuta el intérprete de Python, usado abajo para el cálculo aritmético del Lead Time.

Calcula manualmente el Lead Time del segundo cambio (del commit del 2 de enero a las 09:00 al tag del 3 de enero a las 09:00):

```bash
python3 -c "
from datetime import datetime
commit = datetime.fromisoformat('2026-01-02T09:00:00')
deploy = datetime.fromisoformat('2026-01-03T09:00:00')
print(f'Lead Time: {(deploy - commit).total_seconds() / 3600} horas')
"
```

**Resultado esperado:** el script imprime "Lead Time: 24.0 horas", el tiempo real transcurrido entre el commit del cambio y su despliegue marcado por el tag, exactamente la métrica que un equipo real calcularía sobre su propio historial de Git y sus despliegues reales.

**Fallo deliberado:** calcula el Lead Time usando la fecha del PRIMER commit del proyecto en vez del commit específico que introdujo el cambio desplegado en `v1.1`. El resultado sería un Lead Time artificialmente inflado (o incorrecto) — diagnostica confirmando que el Lead Time se mide por cambio individual, no desde el inicio del proyecto completo, un error común al calcular esta métrica por primera vez.

#### Paso 5 · Práctica guiada

Calcula la Deployment Frequency del historial de ejemplo: cuenta cuántos tags de despliegue existen (`git tag | wc -l`) dividido entre el número de días que abarca el historial completo. **Pista:** usa las fechas del primer y último tag para calcular el periodo total en días.

#### Paso 6 · Práctica independiente

Diseña (documentando, sin necesariamente implementar completo) cómo calcularías MTTR usando el historial de alertas `firing`→resuelta de Alertmanager, y Change Failure Rate contando cuántos de los últimos 10 despliegues fueron seguidos por un `helm rollback` o `terraform apply` de reversión dentro de la hora siguiente.

#### Paso 7 · Cierre

Ya calculas Lead Time real a partir de tu propio historial de Git, y sabes qué datos necesitarías para las otras tres métricas DORA. Esto cierra el módulo de observabilidad; el siguiente módulo cubre logging estructurado y correlación de peticiones entre servicios. Fuente oficial: [DORA — DevOps Research and Assessment](https://dora.dev/).

**Errores comunes:** medir Lead Time desde el inicio del proyecto en vez de por cambio individual; ignorar que las cuatro métricas deben mejorar juntas, tratando velocidad y estabilidad como si estuvieran necesariamente en tensión.

**Cuándo no usarlo:** para un proyecto de aprendizaje personal sin ningún equipo ni cadencia real de despliegues a producción, calcular métricas DORA formales no aporta valor práctico inmediato; son más útiles cuando hay un equipo y un historial real de despliegues que analizar.

**Transferencia al proyecto integrador «Plataforma de entrega continua»:** Calcula el Lead Time real de los últimos cambios desplegados a la plataforma a partir de los tags de release del repositorio, y define junto a Deployment Frequency el panel DORA que acompañará al dashboard de métricas del módulo siguiente.

---


## Laboratorio práctico

**Objetivo del laboratorio:** exponer una métrica counter desde una API propia, consultarla con PromQL, visualizarla en un dashboard de Grafana, y configurar una alerta basada en un umbral sostenido.

**Requisitos previos:** una API propia simple, Prometheus y Grafana corriendo (pueden levantarse con Docker Compose, Módulo 3 de este track).

| Paso | Acción | Configuración | Explicación | Resultado esperado |
|---|---|---|---|---|
| 1 | Instrumentar un counter en tu API | Biblioteca cliente de Prometheus, counter `http_requests_total` | Expone la métrica en `/metrics` | El endpoint responde en formato Prometheus |
| 2 | Configurar Prometheus para scrapear tu API | `scrape_config` en `prometheus.yml` | Prometheus consulta periódicamente ese endpoint | El servicio aparece `UP` en targets |
| 3 | Consultar con PromQL | `rate(http_requests_total[5m])` | Calcula la tasa de peticiones por segundo | Se muestra la tasa calculada |
| 4 | Crear un dashboard en Grafana | Conecta Prometheus como fuente, crea un panel | Visualiza la métrica en tiempo real | El panel se actualiza con tráfico real |
| 5 | Generar tráfico con errores intencionales | Ruta que responde 500 en ciertas condiciones | Prepara datos para calcular tasa de error | La métrica incluye `status="500"` |
| 6 | Calcular la tasa de error con PromQL | Consulta del Tema 2 | Aplica sobre datos reales | Un valor entre 0 y 1 |
| 7 | Configurar una regla de alerta | Expresión, umbral, `for: 2m` | Aplica el patrón del Tema 4 | La regla aparece cargada correctamente |
| 8 | Definir un SLO propio | Documento con SLO y consulta PromQL | Aplica el razonamiento del Tema 5 | Un documento claro con el SLO definido |

**Verificación:** el laboratorio se considera exitoso si el dashboard refleja tráfico real, la tasa de error es coherente con los errores generados intencionalmente, y la regla de alerta está correctamente configurada.

**Errores comunes y soluciones**

- **Prometheus muestra tu servicio como `DOWN`.** Verifica el endpoint `/metrics` con `curl` directo, y que la dirección en `scrape_config` coincide con dónde corre tu app.
- **`rate()` devuelve valores extraños.** Confirma que la métrica es un counter, no un gauge.
- **El panel de Grafana no muestra datos.** Verifica la URL del datasource y el rango de tiempo seleccionado.
- **La alerta nunca se dispara.** Revisa que sostuviste la condición durante todo el `for`; si el problema fue breve, correctamente no se dispara.

---
