# Módulo 5: CD — estrategias de despliegue


## Aprende construyendo

### Tema 1: Blue-green deployment

#### Paso 1 · Objetivo y preparación

Al finalizar podrás implementar un corte de tráfico blue-green con NGINX, con rollback instantáneo hacia el entorno anterior sin reconstruir nada.

**Conocimiento previo:** NGINX como proxy inverso (Módulo 0, Tema 9); Docker Compose (Módulo 3).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Este es un caso real de cambios de alto riesgo: blue-green da la garantía de reversión más rápida de las tres estrategias de este módulo, a costa del mayor consumo de infraestructura duplicada.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** entorno blue, entorno green, corte de tráfico instantáneo, rollback inmediato.

Blue-green mantiene dos entornos idénticos: "blue" (recibe todo el tráfico actual) y "green" (la nueva versión, sin tráfico todavía). Cuando "green" pasa sus verificaciones, el balanceador cambia de golpe todo el tráfico hacia "green". Si algo sale mal, revertir consiste en volver a apuntar el balanceador hacia "blue", que sigue existiendo intacto — rollback en segundos, sin reconstruir nada. El coste es mantener el doble de infraestructura durante la transición.

**Analogía:** blue-green es como tener dos escenarios idénticos para una obra de teatro: mientras el público ve la función en "blue", el equipo prepara "green" completo. Cuando está listo, se apagan las luces de "blue" y se encienden las de "green" de golpe.

**Diagrama:**

```
┌── Antes del corte ────────────┐   ┌── Después del corte ────────────┐
│ Balanceador ──▶ Blue (v1, 100%)   │   │ Balanceador ──▶ Green (v2, 100%)    │
│           ╲──▶ Green (v2, standby) │   │           ╲──▶ Blue (v1, standby,   │
└─────────────────────┘   │              listo para rollback)  │
                              └─────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo5/blue-green` con dos versiones de backend y un NGINX que enruta:

```bash
mkdir -p academia-devops/src/modulo5/blue-green/nginx
cd academia-devops/src/modulo5/blue-green
cat > nginx/activo.conf <<'EOF'
upstream activo {
    server blue:3000;
}
server {
    listen 80;
    location / { proxy_pass http://activo; }
}
EOF
cat > compose.yaml <<'EOF'
services:
  blue:
    image: node:22-alpine
    command: ["node", "-e", "require('http').createServer((q,r)=>r.end('version BLUE (v1)')).listen(3000)"]
  green:
    image: node:22-alpine
    command: ["node", "-e", "require('http').createServer((q,r)=>r.end('version GREEN (v2)')).listen(3000)"]
  edge:
    image: nginx:1.27-alpine
    ports: ["8080:80"]
    volumes: ["./nginx/activo.conf:/etc/nginx/conf.d/default.conf:ro"]
    depends_on: [blue, green]
EOF
docker compose up -d
curl -s http://localhost:8080/
```

**Explicación línea por línea:** `nginx/activo.conf` define un único upstream apuntando a `blue`; cambiar ese único `server` es exactamente el "corte de tráfico" que hace la estrategia.

Corta el tráfico hacia "green" cambiando solo la configuración de NGINX, sin tocar ningún contenedor de aplicación:

```bash
sed -i 's/server blue:3000;/server green:3000;/' nginx/activo.conf
docker compose exec edge nginx -s reload
curl -s http://localhost:8080/
```

**Resultado esperado:** antes del corte, `curl` responde "version BLUE (v1)"; después de reemplazar el upstream y recargar NGINX, responde "version GREEN (v2)", sin ningún downtime ni reinicio de los contenedores backend.

**Fallo deliberado:** simula que "green" tiene un problema (`docker compose stop green`) justo después del corte, y repite `curl`. Verás un error de gateway — diagnostica el problema, y ejecuta el rollback instantáneo: `sed -i 's/server green:3000;/server blue:3000;/' nginx/activo.conf && docker compose exec edge nginx -s reload`. Confirma que `curl` vuelve a responder "version BLUE (v1)" en segundos, sin reconstruir nada.

#### Paso 5 · Práctica guiada

Automatiza el corte con un pequeño script `cambiar-a.sh green` que reciba el nombre del entorno destino como argumento y haga el `sed` + `nginx -s reload` en un solo comando. **Pista:** usa `$1` para el argumento posicional del script.

#### Paso 6 · Práctica independiente

Mide con `time` cuánto tarda el corte completo (cambio de configuración + reload) frente a cuánto tardaría reconstruir y volver a desplegar un contenedor desde cero, y documenta la diferencia como justificación cuantitativa del beneficio de blue-green.

#### Paso 7 · Cierre y evidencia

Ya cortas tráfico de golpe entre dos entornos idénticos, con rollback casi instantáneo. El siguiente tema expone la nueva versión gradualmente en vez de de golpe. **Evidencia:** entrega como resultado las tres respuestas de `curl` (blue, green, rollback a blue) y explica el corte y la reversión observados. Fuente oficial: [Martin Fowler — BlueGreenDeployment](https://martinfowler.com/bliki/BlueGreenDeployment.html).

**Errores comunes:** olvidar recargar NGINX (`nginx -s reload`) después de cambiar la configuración, dejando el corte sin efecto; destruir el entorno "blue" inmediatamente después del corte, perdiendo la posibilidad de rollback instantáneo.

**Cuándo no usarlo:** para cambios de bajo riesgo y alta frecuencia, mantener el doble de infraestructura solo para un rollback instantáneo no conviene frente al coste; ahí un rolling update (Tema 3) es más eficiente.

**Transferencia al proyecto integrador «Plataforma de entrega continua»:** Mantén dos versiones del servicio y cambia el destino del tráfico en laboratorio. Verifica salud antes del cambio y practica el retorno conservando compatibilidad con la base compartida.

### Tema 2: Canary releases

#### Paso 1 · Objetivo y preparación

Al finalizar podrás enrutar un porcentaje pequeño de tráfico real hacia una nueva versión con NGINX, e incrementarlo gradualmente según métricas observadas.

**Conocimiento previo:** Tema 1 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Este es un caso real: canary limita el radio de impacto de un problema no detectado en pruebas —si la nueva versión falla bajo tráfico real, solo afecta a la pequeña fracción que cayó en el canary, no al 100% como en blue-green.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** porcentaje de tráfico incremental, monitorización de métricas durante el despliegue, incremento gradual.

Un despliegue canary expone la nueva versión a una fracción pequeña del tráfico (5%), monitoreando métricas clave. Si se mantienen aceptables, el porcentaje se incrementa gradualmente (10%, 25%, 50%, 100%). El nombre viene de los canarios que los mineros usaban como alerta temprana de gases tóxicos.

**Analogía:** un despliegue canary es como probar una receta nueva sirviéndola primero solo a un pequeño grupo de mesas, observando su reacción, antes de ponerla en el menú completo.

**Diagrama:**

```
┌── 5% tráfico ──▶ v2 (nueva) ──┐  ┌── 95% tráfico ──▶ v1 (estable) ──┐
└───────────────────┘  └──────────────────────┘
¿métricas OK? Sí ──▶ incrementa a 25% ──▶ ... hasta 100%
              No ──▶ revierte a 0%, v1 sigue atendiendo todo
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo5/canary` con dos versiones y pesos de tráfico en NGINX:

```bash
mkdir -p academia-devops/src/modulo5/canary/nginx
cd academia-devops/src/modulo5/canary
cat > nginx/canary.conf <<'EOF'
split_clients "${remote_addr}${request_id}" $version {
    5%     canary;
    *      estable;
}
upstream estable { server v1:3000; }
upstream canary  { server v2:3000; }
server {
    listen 80;
    location / { proxy_pass http://$version; }
}
EOF
cat > compose.yaml <<'EOF'
services:
  v1:
    image: node:22-alpine
    command: ["node", "-e", "require('http').createServer((q,r)=>r.end('v1 estable')).listen(3000)"]
  v2:
    image: node:22-alpine
    command: ["node", "-e", "require('http').createServer((q,r)=>r.end('v2 canary')).listen(3000)"]
  edge:
    image: nginx:1.27-alpine
    ports: ["8081:80"]
    volumes: ["./nginx/canary.conf:/etc/nginx/conf.d/default.conf:ro"]
    depends_on: [v1, v2]
EOF
docker compose up -d
```

**Explicación línea por línea:** `split_clients` distribuye pseudoaleatoriamente el tráfico entre `canary` (5%) y `estable` (el resto), usando `$remote_addr` y `$request_id` como semilla, aproximando el porcentaje configurado sobre un volumen suficiente de peticiones.

Ejecuta 100 peticiones y cuenta cuántas cayeron en cada versión:

```bash
for i in $(seq 100); do curl -s http://localhost:8081/; echo; done | sort | uniq -c
```

**Resultado esperado:** aproximadamente 5 respuestas de "v2 canary" y 95 de "v1 estable" (el porcentaje exacto varía por ser una distribución probabilística, no determinista sobre una muestra pequeña).

**Fallo deliberado:** cambia `5% canary;` por `50% canary;` sin avisar, simulando un error de configuración que expone de más el canary, y repite las 100 peticiones. Verás aproximadamente 50/50 en vez del 5% esperado — diagnostica revisando `nginx/canary.conf` línea por línea antes de asumir que el problema está en la aplicación y no en el enrutamiento.

#### Paso 5 · Práctica guiada

Cambia el porcentaje a `25%` y repite las 100 peticiones, confirmando que la proporción observada se acerca más a ese nuevo valor. **Pista:** con muestras pequeñas, la proporción observada rara vez es exacta; repite el conteo con 500 peticiones si quieres mayor precisión.

#### Paso 6 · Práctica independiente

Agrega una tercera versión `v3` con 1% de tráfico simultáneamente con el 5% de `v2`, ajustando `split_clients` para tres categorías, y confirma que las tres proporciones son observables en una muestra de 1000 peticiones.

#### Paso 7 · Cierre y evidencia

Ya limitas el radio de impacto exponiendo gradualmente una nueva versión. El siguiente tema reemplaza instancias de forma incremental sin enrutamiento explícito por porcentaje. **Evidencia:** entrega el conteo de las 100 peticiones mostrando la proporción real observada, y el resultado del fallo con 50% en vez de 5%. Fuente oficial: [NGINX — split_clients](https://nginx.org/en/docs/http/ngx_http_split_clients_module.html).

**Errores comunes:** confundir un cambio de configuración de enrutamiento con un problema de la aplicación misma; asumir que una muestra pequeña reproduce exactamente el porcentaje configurado.

**Cuándo no usarlo:** para un cambio de esquema de base de datos incompatible hacia atrás, canary no es apropiado (no puedes tener tráfico parcial en dos esquemas incompatibles simultáneamente); ahí blue-green (Tema 1) es la estrategia correcta.

**Transferencia al proyecto integrador «Plataforma de entrega continua»:** Dirige una fracción controlada de peticiones a la versión candidata. Compara tasa de errores y latencia por versión; una degradación deliberada debe detener el avance del despliegue.

### Tema 3: Rolling updates

#### Paso 1 · Objetivo y preparación

Al finalizar podrás reemplazar instancias de una versión anterior por la nueva de forma incremental, controlando cuántas pueden estar simultáneamente no disponibles (`maxUnavailable`) o de más (`maxSurge`).

**Conocimiento previo:** Temas 1 y 2 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Este es un caso real: rolling update es la estrategia por defecto en Kubernetes porque no requiere infraestructura duplicada como blue-green, ni enrutamiento explícito por porcentaje como canary.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** reemplazo incremental de instancias, `maxUnavailable`, `maxSurge`, disponibilidad continua durante el despliegue.

Un rolling update reemplaza instancias antiguas por nuevas de forma incremental, manteniendo suficientes disponibles en todo momento. `maxUnavailable` limita cuántas pueden estar fuera de servicio a la vez; `maxSurge` permite crear instancias adicionales temporalmente por encima de la cantidad normal antes de retirar las antiguas.

**Analogía:** un rolling update es como renovar progresivamente la flota de vehículos de una empresa, reemplazando uno a la vez y manteniendo siempre suficientes en la carretera, en vez de detener toda la flota de golpe.

**Diagrama:**

```
┌── Instancias iniciales ──┐  [v1] [v1] [v1] [v1] [v1]
├── Paso 1 (maxUnavailable:1) ┤  [v2] [v1] [v1] [v1] [v1]  ← nunca menos de 4 disponibles
├── Paso 2 ────────────────┤  [v2] [v2] [v1] [v1] [v1]
└── Final ─────────────────┘  [v2] [v2] [v2] [v2] [v2]
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo5/rolling` con 3 réplicas escaladas manualmente con Docker Compose:

```bash
mkdir -p academia-devops/src/modulo5/rolling && cd academia-devops/src/modulo5/rolling
cat > compose.yaml <<'EOF'
services:
  app:
    image: node:22-alpine
    command: ["node", "-e", "require('http').createServer((q,r)=>r.end('version: '+process.env.VERSION)).listen(3000)"]
    environment:
      VERSION: v1
EOF
docker compose up -d --scale app=3
docker compose ps
```

**Explicación línea por línea:** `--scale` es la bandera que fija cuántas réplicas levantar de un mismo servicio (acá, `app=3`, con `VERSION=v1`); simula el estado inicial de 3 instancias antes de un rolling update. Más abajo, `--no-recreate` es la bandera que evita recrear los contenedores que ya están corriendo y sin cambios, tocando solo el que reemplazás.

Reemplaza las instancias una por una, manteniendo siempre al menos 2 disponibles (equivalente a `maxUnavailable: 1` sobre 3 réplicas). `docker compose up` no acepta `-e`/`--env` (esa bandera solo existe en `run`/`exec`): la forma correcta de cambiar la variable es editar el `compose.yaml` y dejar que `--no-recreate` proteja a las instancias que no tocaste:

```bash
CONTENEDOR=$(docker compose ps -q app | head -1)
docker compose stop "$CONTENEDOR"
docker compose rm -f "$CONTENEDOR"
sed -i.bak 's/VERSION: v1/VERSION: v2/' compose.yaml
docker compose up -d --scale app=3 --no-recreate
docker compose ps
```

**Resultado esperado:** en cualquier momento del reemplazo, `docker compose ps` muestra al menos 2 instancias corriendo (nunca las 3 caídas a la vez); `--no-recreate` deja intactas a las dos instancias `v1` que no quitaste, mientras la tercera se recrea desde el `compose.yaml` ya actualizado a `v2`. Repite la secuencia dos veces más (una por cada instancia `v1` restante) hasta que las tres reporten `VERSION=v2` con `docker inspect`.

**Fallo deliberado:** detén las 3 instancias simultáneamente antes de levantar ninguna nueva (`docker compose stop $(docker compose ps -q app)`). Durante esa ventana no hay ninguna instancia disponible para atender tráfico — diagnostica que esto es exactamente lo que `maxUnavailable` está diseñado para prevenir, y que reemplazar de a una es lo que garantiza continuidad.

#### Paso 5 · Práctica guiada

Repite el reemplazo completo de las 3 instancias, contando en cada paso cuántas están disponibles con `docker compose ps --filter status=running`. **Pista:** nunca debería bajar de 2 instancias `running` simultáneamente si respetas el equivalente de `maxUnavailable: 1`.

#### Paso 6 · Práctica independiente

Simula `maxSurge: 1` levantando una cuarta instancia nueva ANTES de detener ninguna de las tres antiguas, y luego retirando las antiguas de a una; compara este enfoque con el anterior en términos de capacidad disponible durante la transición.

#### Paso 7 · Cierre y evidencia

Ya reemplazas instancias sin interrupción de servicio, controlando el margen de disponibilidad. El siguiente tema desacopla activar una funcionalidad de desplegar su código. **Evidencia:** entrega como resultado el conteo de instancias disponibles en cada paso del reemplazo, y explica por qué nunca bajó del mínimo esperado. Fuente oficial: [Kubernetes — Rolling Update Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#rolling-update-deployment).

**Errores comunes:** detener todas las instancias antiguas antes de tener listas las nuevas, causando una ventana sin disponibilidad; no monitorear cuántas instancias están realmente disponibles durante el reemplazo.

**Cuándo no usarlo:** para un cambio que necesita observación explícita por porcentaje de tráfico antes de generalizarse, un rolling update simple no tiene esa fase de decisión; ahí canary (Tema 2) es más apropiado.

**Transferencia al proyecto integrador «Plataforma de entrega continua»:** Actualiza réplicas progresivamente mientras envías peticiones de prueba. Registra disponibilidad y versiones observadas, y comprueba que el servicio soporta la coexistencia temporal de ambas versiones.

### Tema 4: Feature flags vs branches por entorno

#### Paso 1 · Objetivo y preparación

Al finalizar podrás desacoplar el despliegue de código del lanzamiento de una funcionalidad usando un feature flag activable sin nuevo despliegue.

**Conocimiento previo:** Temas 1 a 3 de este módulo; Módulo 1 (trunk-based development).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Este es un caso real de trunk-based development: con feature flags puedes desplegar código con mucha frecuencia sin que eso implique liberar cada funcionalidad inmediatamente al público.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** feature flag, desacoplar deploy de release, activación selectiva, branches por entorno.

Un feature flag es un interruptor de configuración que activa o desactiva una funcionalidad en tiempo de ejecución, sin desplegar una versión distinta. Esto desacopla deploy (código en producción) de release (funcionalidad visible). La alternativa, branches por entorno, acopla ambos al proceso de fusión de ramas, reintroduciendo ramas de larga duración que trunk-based development busca evitar.

**Analogía:** un feature flag es como instalar una luz nueva en una habitación pero dejar el interruptor apagado hasta el día de la inauguración, sin volver a hacer ninguna obra ese día.

**Diagrama:**

```
┌── Sin feature flag (acoplado) ──┐   ┌── Con feature flag (desacoplado) ──┐
│ deploy = release                    │   │ deploy (código en producción, flag=false) │
│ código visible para TODOS               │   │ tiempo después: flag=true ──▶ visible      │
│ inmediatamente                            │   │ (para todos, o solo un subconjunto)         │
└─────────────────────┘   └──────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo5/feature-flag`:

```bash
mkdir -p academia-devops/src/modulo5/feature-flag && cd academia-devops/src/modulo5/feature-flag
cat > app.js <<'EOF'
const http = require('node:http');
http.createServer((req, res) => {
  const flagNuevaFuncion = process.env.FLAG_NUEVA_FUNCION === 'true';
  const respuesta = flagNuevaFuncion
    ? 'funcion nueva ACTIVA'
    : 'funcion nueva desactivada (comportamiento anterior)';
  res.end(respuesta);
}).listen(3000);
EOF
docker run -d --name app-flag -p 3002:3000 -v "$(pwd)":/app -w /app -e FLAG_NUEVA_FUNCION=false node:22-alpine node app.js
curl -s http://localhost:3002/
```

**Explicación línea por línea:** `process.env.FLAG_NUEVA_FUNCION === 'true'` lee el flag como una variable de entorno; el mismo código desplegado responde distinto según ese único valor externo, sin recompilar ni redeployar nada.

Activa la funcionalidad sin ningún nuevo despliegue de código, solo cambiando la variable y reiniciando el proceso con la nueva configuración:

```bash
docker rm -f app-flag
docker run -d --name app-flag -p 3002:3000 -v "$(pwd)":/app -w /app -e FLAG_NUEVA_FUNCION=true node:22-alpine node app.js
curl -s http://localhost:3002/
```

**Resultado esperado:** la primera petición responde "funcion nueva desactivada"; tras cambiar solo la variable de entorno (sin tocar `app.js`), la segunda responde "funcion nueva ACTIVA", demostrando que el mismo código binario/fuente se comporta distinto según el flag.

**Fallo deliberado:** cambia `FLAG_NUEVA_FUNCION` a `"verdadero"` (un valor no reconocido) en vez de `"true"`. La comparación estricta `=== 'true'` falla silenciosamente y el flag queda desactivado sin ningún error visible — diagnostica que un flag mal escrito no lanza excepción, simplemente se comporta como si estuviera apagado, un riesgo real de esta técnica si no se valida el valor esperado.

#### Paso 5 · Práctica guiada

Agrega un segundo flag `FLAG_DESCUENTO_ESPECIAL` independiente del primero, y confirma que ambos pueden activarse o desactivarse de forma completamente independiente entre sí. **Pista:** cada flag debe leerse y evaluarse de forma aislada, sin que uno afecte la lógica del otro.

#### Paso 6 · Práctica independiente

Implementa una activación parcial simple: usa una tercera variable `PORCENTAJE_ACTIVACION` y una condición pseudoaleatoria (`Math.random() * 100 < porcentaje`) para activar el flag solo para una fracción de las peticiones, acercándote al patrón de canary del Tema 2 pero a nivel de funcionalidad de negocio.

#### Paso 7 · Cierre y evidencia

Ya despliegas código con frecuencia sin exponer funcionalidad incompleta, activándola después sin redeploy. El siguiente tema cierra el ciclo revirtiendo automáticamente ante métricas anómalas. **Evidencia:** entrega ambas respuestas de `curl` (flag desactivado y activado) sin ningún cambio de código entre ambas, y explica el fallo silencioso del valor mal escrito. Fuente oficial: [Martin Fowler — FeatureToggle](https://martinfowler.com/articles/feature-toggles.html).

**Errores comunes:** comparar el valor del flag de forma frágil (sensible a mayúsculas o variantes del texto) sin validar explícitamente el valor esperado; dejar flags obsoletos en el código mucho después de que la funcionalidad ya se generalizó al 100%, acumulando deuda técnica de ramas condicionales innecesarias.

**Cuándo no usarlo:** para cambios de infraestructura que no son "código de aplicación" (como una migración de base de datos irreversible), un feature flag no aplica de la misma forma; ahí blue-green (Tema 1) es el mecanismo correcto de control de riesgo.

**Transferencia al proyecto integrador «Plataforma de entrega continua»:** Activa una función para un grupo de usuarios de prueba sin recompilar. Desactívala al provocar un error y verifica que el estado persistido sigue siendo compatible con la función apagada.

### Tema 5: Rollback automático por métricas

#### Paso 1 · Objetivo y preparación

Al finalizar podrás diseñar (y simular con un script simple) un rollback automático que revierte un despliegue sin intervención humana cuando una métrica supera un umbral.

**Conocimiento previo:** Temas 1 a 4 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Este es un caso real de horarios sin supervisión activa (noches, fines de semana): un rollback automático reduce drásticamente el tiempo entre que un despliegue problemático empieza a afectar usuarios reales y el momento en que se revierte.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** umbral de error, ventana de observación, reversión automática sin intervención humana.

Un rollback automático por métricas observa continuamente indicadores clave (tasa de error, latencia) durante una ventana de tiempo tras el despliegue, y revierte automáticamente si superan un umbral configurado. Diseñarlo bien requiere calibrar tanto el umbral (ni muy sensible ni muy laxo) como la ventana de observación. Depende directamente de tener métricas confiables y consultables programáticamente (Módulo 9, Prometheus/Grafana).

**Analogía:** un rollback automático por métricas es como el frenado automático de emergencia de un vehículo moderno: en vez de depender solo del conductor, el propio vehículo monitorea sensores y frena si se cruza un umbral de riesgo, más rápido de lo que reaccionaría un humano.

**Diagrama:**

```
Despliegue canario en curso (5% del tráfico en v2)
   Monitorea: tasa de error
   ¿tasa de error > umbral durante > X minutos?
     Sí ──▶ ROLLBACK AUTOMÁTICO (revierte a v1, sin intervención humana)
     No ──▶ continúa, incrementa gradualmente el porcentaje hacia v2
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía crea `academia-devops/src/modulo5/rollback-auto` con un backend que falla a propósito una fracción de las veces, y un script que monitorea y revierte:

```bash
mkdir -p academia-devops/src/modulo5/rollback-auto && cd academia-devops/src/modulo5/rollback-auto
cat > app-fallido.js <<'EOF'
const http = require('node:http');
let total = 0, errores = 0;
http.createServer((req, res) => {
  total++;
  if (Math.random() < 0.4) { errores++; res.writeHead(500).end('error'); return; }
  res.end('ok');
  if (req.url === '/metricas') res.end(JSON.stringify({total, errores}));
}).listen(3000);
EOF
docker run -d --name backend-canario -p 3003:3000 -v "$(pwd)":/app -w /app node:22-alpine node app-fallido.js
cat > vigilar.sh <<'EOF'
#!/bin/bash
set -euo pipefail
UMBRAL=20
ERRORES=0
TOTAL=0
for i in $(seq 20); do
  CODIGO=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3003/)
  TOTAL=$((TOTAL+1))
  [ "$CODIGO" = "500" ] && ERRORES=$((ERRORES+1))
done
PORCENTAJE=$((ERRORES * 100 / TOTAL))
echo "tasa de error observada: ${PORCENTAJE}% (umbral: ${UMBRAL}%)"
if [ "$PORCENTAJE" -gt "$UMBRAL" ]; then
  echo "ROLLBACK AUTOMATICO: tasa de error supera el umbral"
  docker rm -f backend-canario
  exit 1
fi
echo "metricas OK, continua el despliegue"
EOF
chmod +x vigilar.sh
```

**Explicación línea por línea:** `app-fallido.js` simula una versión con un ~40% de tasa de error real; `vigilar.sh` hace 20 peticiones, calcula el porcentaje de errores, y si supera el `UMBRAL` del 20%, revierte automáticamente eliminando el contenedor problemático.

Ejecuta el vigilante dentro de un contenedor con las herramientas necesarias:

```bash
docker run --rm --network host -v "$(pwd)":/w -w /w alpine sh -c "apk add --no-cache curl bash >/dev/null 2>&1; bash vigilar.sh"
```

**Resultado esperado:** el script imprime una tasa de error cercana al 40%, muy por encima del umbral del 20%, y ejecuta el rollback automático eliminando `backend-canario` sin intervención humana.

**Fallo deliberado:** cambia `UMBRAL=20` a `UMBRAL=90` (demasiado laxo) y repite con un backend nuevo (recrea `backend-canario`). El script reporta "métricas OK" a pesar de una tasa de error real del 40%, muy dañina en producción — diagnostica que un umbral mal calibrado deja pasar problemas reales sin revertir, exactamente el riesgo de un umbral demasiado permisivo descrito en la teoría.

#### Paso 5 · Práctica guiada

Reduce la ventana de observación a 5 peticiones en vez de 20 y repite el experimento varias veces; explica por qué una ventana tan corta puede dar resultados inconsistentes entre ejecuciones distintas. **Pista:** con pocas muestras, la proporción observada varía mucho más de una ejecución a otra.

#### Paso 6 · Práctica independiente

Modifica `app-fallido.js` para que la tasa de error real sea configurable por variable de entorno, y encuentra experimentalmente el umbral de tasa de error real a partir del cual tu `vigilar.sh` con `UMBRAL=20` empieza a disparar el rollback de forma consistente en al menos 8 de 10 ejecuciones.

#### Paso 7 · Cierre y evidencia

Ya diseñas y simulas un rollback que actúa más rápido que cualquier supervisión humana, calibrando el compromiso entre sensibilidad y falsos positivos. Esto cierra el módulo de estrategias de despliegue; el siguiente módulo introduce Kubernetes, donde estos mismos patrones se implementan de forma nativa a mayor escala. **Evidencia:** entrega la salida de `vigilar.sh` con el umbral correcto (revierte) y con el umbral demasiado laxo (no revierte a pesar del problema real), explicando la diferencia. Fuente oficial: [Google SRE Book — Release Engineering](https://sre.google/sre-book/release-engineering/).

**Errores comunes:** definir un umbral basado en intuición sin datos históricos reales del sistema; usar una ventana de observación tan corta que el resultado depende más del azar que de la señal real.

**Cuándo no usarlo:** sin métricas confiables y consultables programáticamente, intentar un rollback automático es contraproducente (decide con datos incompletos o inexistentes); ahí primero se necesita observabilidad real (Módulo 9) antes de automatizar la reversión.

---

**Transferencia al proyecto integrador «Plataforma de entrega continua»:** Configura una condición medible de reversión y genera errores controlados en la candidata. Verifica que vuelve al artefacto anterior y conserva la evidencia necesaria para investigar el fallo.

## Laboratorio práctico

**Objetivo del laboratorio:** configurar un pipeline de CD que despliegue automáticamente a un entorno de staging tras pasar CI, simular un despliegue canary manual, implementar un feature flag simple, y diseñar un rollback automático por métricas.

**Requisitos previos:** el pipeline de CI del Módulo 4 de este track ya configurado, acceso a un entorno de staging (puede simularse con Docker Compose local).

| Paso | Acción | Configuración | Explicación | Resultado esperado |
|---|---|---|---|---|
| 1 | Documentar las tres estrategias con un diagrama propio | Distingue blue-green, canary y rolling update en tus propias palabras | Consolida la comprensión conceptual | Un documento propio que distingue las tres estrategias |
| 2 | Configurar el job de CD hacia staging | Job `deploy-staging` con dependencia explícita del éxito de CI | El despliegue solo ocurre si CI valida el cambio | El job solo se ejecuta tras el éxito de tests |
| 3 | Simular un despliegue canary manual | Dos réplicas con NGINX enrutando un porcentaje pequeño | Practica canary manualmente | El balanceador distribuye tráfico desigual según lo configurado |
| 4 | Implementar un feature flag simple | Variable de entorno que activa/desactiva una funcionalidad | Aplica el Tema 4 de forma mínima | Cambiar la variable activa/desactiva sin nuevo despliegue |
| 5 | Diseñar un rollback automático | Métrica, umbral, ventana de observación y acción de reversión | Aplica el razonamiento del Tema 5 | Un documento que especifica métrica, umbral, ventana y acción |

**Verificación:** el laboratorio se considera exitoso si el job de CD depende del éxito de CI, el balanceador de canary distribuye tráfico verificablemente, y el feature flag activa/desactiva sin nuevo despliegue.

**Errores comunes y soluciones**

- **`deploy-staging` se ejecuta aunque CI falle.** Revisa la dependencia explícita entre jobs (`needs` en GitHub Actions).
- **El canary simulado envía todo el tráfico a una sola instancia.** Revisa la configuración de pesos del balanceador.
- **El feature flag requiere reiniciar la aplicación completa.** Si lees la variable solo al arrancar, necesitas recarga en caliente o aceptar el reinicio.
- **No sabes qué métrica usar para el rollback automático.** Empieza con la tasa de error HTTP 5xx como señal de partida razonable.

---


## Laboratorio de transferencia

### Tema 6: Rollback ensayado y compatibilidad del artefacto anterior

#### Paso 1 · Objetivo y preparación
Al finalizar ensayarás una promoción de versión con una comprobación automática y retorno a un artefacto conocido si falla. **Prerrequisitos:** procesos, códigos de salida, archivos y Python 3. Ejemplo independiente desde una carpeta vacía; no requiere Kubernetes.

#### Paso 2 · Contexto y caso real
Un pipeline del proyecto integrador no termina al copiar archivos: necesita saber si la versión candidata funciona y qué hacer si no. **¿Por qué es importante?** La recuperación que nunca se ensayó puede fallar durante el incidente.

#### Paso 3 · Teoría, modelo mental y analogía
Una promoción cambia qué artefacto se considera activo. El criterio de salud debe evaluar una capacidad útil, no solo que el proceso existe. El rollback devuelve una versión anterior compatible; si una migración destruyó datos, revertir el binario puede ser insuficiente.

**Analogía:** antes de cambiar de puente, comprueba que el nuevo soporta el paso y conserva una vía de regreso. El límite es que este simulacro usa archivos locales: no representa despliegue atómico entre nodos ni tráfico real.

#### Paso 4 · Demostración guiada desde cero
```bash
mkdir ensayo-release
cd ensayo-release
```
Crea `release.py`:
```python
from pathlib import Path
import subprocess
import sys

Path('v1.py').write_text('print("ENV-42 listo")\n', encoding='utf-8')
Path('v2.py').write_text('raise RuntimeError("configuración inválida")\n', encoding='utf-8')
active = Path('active.txt')
active.write_text('v1.py', encoding='utf-8')
previous = active.read_text(encoding='utf-8')
candidate = 'v2.py'
# La verificación observa salida, código y tiempo límite.
probe = subprocess.run([sys.executable, candidate], capture_output=True,
                       text=True, timeout=5)
healthy = probe.returncode == 0 and 'ENV-42 listo' in probe.stdout
active.write_text(candidate if healthy else previous, encoding='utf-8')
result = subprocess.run([sys.executable, active.read_text(encoding='utf-8')],
                        capture_output=True, text=True, timeout=5, check=True)
assert result.stdout.strip() == 'ENV-42 listo'
print('Candidato rechazado; activa:', active.read_text(encoding='utf-8'))
```
```bash
python3 release.py
```
**Resultado esperado:** `Candidato rechazado; activa: v1.py`. Windows puede usar `py`. Explica cada bloque: preparar artefactos, recordar versión, evaluar candidato y volver a comprobar la capacidad activa. La versión rota no se considera válida solo por existir.

#### Paso 5 · Práctica guiada
**Fallo deliberado:** sustituye el contenido de `v2.py` generado por `print("pantalla vacía")`. El proceso termina con cero, pero el criterio de capacidad sigue rechazándolo. **Pista:** no reduzcas salud a `returncode == 0`.

#### Paso 6 · Práctica independiente
Haz una candidata válida que conserve la salida requerida y registre una versión. Comprueba promoción y rechazo en dos ejecuciones. Añade un manejo explícito del timeout que conserve la versión anterior y registre el motivo.

#### Paso 7 · Cierre y evidencia
**Evidencia de aprendizaje:** salida de promoción y rechazo, versión activa y tiempo observado. El siguiente paso es repetir el procedimiento con el orquestador y una migración expand/contract. **Errores comunes:** sobrescribir el artefacto anterior, no comprobar la recuperación y suponer que rollback restaura datos. **Límites y decisión de uso:** `active.txt` no es un mecanismo de producción; sirve para comprender la decisión antes de automatizarla en CI/CD.

**Fuente oficial:** [Google SRE: canarying releases](https://sre.google/workbook/canarying-releases/).
