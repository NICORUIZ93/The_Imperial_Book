# Módulo 5: CD — estrategias de despliegue


## Aprende construyendo


### Tema 1: Blue-green deployment · Intermedio · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás implementar un corte de tráfico blue-green con NGINX, con rollback instantáneo hacia el entorno anterior sin reconstruir nada.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás implementar un corte de tráfico blue-green con NGINX, con rollback instantáneo hacia el entorno anterior sin reconstruir nada.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en blue-green deployment como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que blue-green deployment resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Blue-green deployment se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Blue-green deployment | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses blue-green deployment por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: blue-green deployment funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Blue-green deployment existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve blue-green deployment en tu contexto?
2. ¿Cómo sabrías que blue-green deployment no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar blue-green deployment?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌── Antes del corte ────────────┐   ┌── Después del corte ────────────┐
│ Balanceador ──▶ Blue (v1, 100%)   │   │ Balanceador ──▶ Green (v2, 100%)    │
│           ╲──▶ Green (v2, standby) │   │           ╲──▶ Blue (v1, standby,   │
└─────────────────────┘   │              listo para rollback)  │
                              └─────────────────────────┘
```

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
    image: nginx:1.30-alpine
    ports: ["8080:80"]
    volumes: ["./nginx/activo.conf:/etc/nginx/conf.d/default.conf:ro"]
    depends_on: [blue, green]
EOF
docker compose up -d
curl -s http://localhost:8080/
```

```bash
sed -i 's/server blue:3000;/server green:3000;/' nginx/activo.conf
docker compose exec edge nginx -s reload
curl -s http://localhost:8080/
```

</details>

### Tema 2: Canary releases · Intermedio · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás enrutar un porcentaje pequeño de tráfico real hacia una nueva versión con NGINX, e incrementarlo gradualmente según métricas observadas.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás enrutar un porcentaje pequeño de tráfico real hacia una nueva versión con NGINX, e incrementarlo gradualmente según métricas observadas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en canary releases como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que canary releases resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Canary releases se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Canary releases | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses canary releases por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: canary releases funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Canary releases existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve canary releases en tu contexto?
2. ¿Cómo sabrías que canary releases no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar canary releases?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌── 5% tráfico ──▶ v2 (nueva) ──┐  ┌── 95% tráfico ──▶ v1 (estable) ──┐
└───────────────────┘  └──────────────────────┘
¿métricas OK? Sí ──▶ incrementa a 25% ──▶ ... hasta 100%
              No ──▶ revierte a 0%, v1 sigue atendiendo todo
```

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
    image: nginx:1.30-alpine
    ports: ["8081:80"]
    volumes: ["./nginx/canary.conf:/etc/nginx/conf.d/default.conf:ro"]
    depends_on: [v1, v2]
EOF
docker compose up -d
```

```bash
for i in $(seq 100); do curl -s http://localhost:8081/; echo; done | sort | uniq -c
```

</details>

### Tema 3: Rolling updates · Intermedio · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás reemplazar instancias de una versión anterior por la nueva de forma incremental, controlando cuántas pueden estar simultáneamente no disponibles (maxUnavailable) o de más (maxSurge).

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás reemplazar instancias de una versión anterior por la nueva de forma incremental, controlando cuántas pueden estar simultáneamente no disponibles (maxUnavailable) o de más (maxSurge).**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en rolling updates como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que rolling updates resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Rolling updates se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Rolling updates | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses rolling updates por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: rolling updates funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Rolling updates existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve rolling updates en tu contexto?
2. ¿Cómo sabrías que rolling updates no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar rolling updates?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌── Instancias iniciales ──┐  [v1] [v1] [v1] [v1] [v1]
├── Paso 1 (maxUnavailable:1) ┤  [v2] [v1] [v1] [v1] [v1]  ← nunca menos de 4 disponibles
├── Paso 2 ────────────────┤  [v2] [v2] [v1] [v1] [v1]
└── Final ─────────────────┘  [v2] [v2] [v2] [v2] [v2]
```

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

```bash
CONTENEDOR=$(docker compose ps -q app | head -1)
docker compose stop "$CONTENEDOR"
docker compose rm -f "$CONTENEDOR"
sed -i.bak 's/VERSION: v1/VERSION: v2/' compose.yaml
docker compose up -d --scale app=3 --no-recreate
docker compose ps
```

</details>

### Tema 4: Feature flags vs branches por entorno · Intermedio · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás desacoplar el despliegue de código del lanzamiento de una funcionalidad usando un feature flag activable sin nuevo despliegue.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás desacoplar el despliegue de código del lanzamiento de una funcionalidad usando un feature flag activable sin nuevo despliegue.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en feature flags vs branches por entorno como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que feature flags vs branches por entorno resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Feature flags vs branches por entorno se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Feature flags vs branches por entorno | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses feature flags vs branches por entorno por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: feature flags vs branches por entorno funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Feature flags vs branches por entorno existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve feature flags vs branches por entorno en tu contexto?
2. ¿Cómo sabrías que feature flags vs branches por entorno no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar feature flags vs branches por entorno?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌── Sin feature flag (acoplado) ──┐   ┌── Con feature flag (desacoplado) ──┐
│ deploy = release                    │   │ deploy (código en producción, flag=false) │
│ código visible para TODOS               │   │ tiempo después: flag=true ──▶ visible      │
│ inmediatamente                            │   │ (para todos, o solo un subconjunto)         │
└─────────────────────┘   └──────────────────────────┘
```

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

```bash
docker rm -f app-flag
docker run -d --name app-flag -p 3002:3000 -v "$(pwd)":/app -w /app -e FLAG_NUEVA_FUNCION=true node:22-alpine node app.js
curl -s http://localhost:3002/
```

</details>

### Tema 5: Rollback automático por métricas · Intermedio · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás diseñar (y simular con un script simple) un rollback automático que revierte un despliegue sin intervención humana cuando una métrica supera un umbral.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás diseñar (y simular con un script simple) un rollback automático que revierte un despliegue sin intervención humana cuando una métrica supera un umbral.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en rollback automático por métricas como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que rollback automático por métricas resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Rollback automático por métricas se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Rollback automático por métricas | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses rollback automático por métricas por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: rollback automático por métricas funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Rollback automático por métricas existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve rollback automático por métricas en tu contexto?
2. ¿Cómo sabrías que rollback automático por métricas no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar rollback automático por métricas?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
Despliegue canario en curso (5% del tráfico en v2)
   Monitorea: tasa de error
   ¿tasa de error > umbral durante > X minutos?
     Sí ──▶ ROLLBACK AUTOMÁTICO (revierte a v1, sin intervención humana)
     No ──▶ continúa, incrementa gradualmente el porcentaje hacia v2
```

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

```bash
docker run --rm --network host -v "$(pwd)":/w -w /w alpine sh -c "apk add --no-cache curl bash >/dev/null 2>&1; bash vigilar.sh"
```

</details>

### Tema 6: Rollback ensayado y compatibilidad del artefacto anterior · Intermedio · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar ensayarás una promoción de versión con una comprobación automática y retorno a un artefacto conocido si falla. Prerrequisitos: procesos, códigos de salida, archivos y Python 3. Ejemplo independiente desde una carpeta vacía; no requiere Kubernetes.

#### ► LA IDEA EN UNA FRASE
**Al finalizar ensayarás una promoción de versión con una comprobación automática y retorno a un artefacto conocido si falla.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en rollback ensayado y compatibilidad del artefacto anterior como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que rollback ensayado y compatibilidad del artefacto anterior resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Rollback ensayado y compatibilidad del artefacto anterior se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Rollback ensayado y compatibilidad del artefacto anterior | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses rollback ensayado y compatibilidad del artefacto anterior por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: rollback ensayado y compatibilidad del artefacto anterior funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Rollback ensayado y compatibilidad del artefacto anterior existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve rollback ensayado y compatibilidad del artefacto anterior en tu contexto?
2. ¿Cómo sabrías que rollback ensayado y compatibilidad del artefacto anterior no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar rollback ensayado y compatibilidad del artefacto anterior?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
mkdir ensayo-release
cd ensayo-release
```

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

</details>

### Tema 7: A/B testing y shadow traffic: medir sin convertir usuarios en cobayas · Intermedio · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar distinguirás un experimento A/B de un canary y de un despliegue shadow, asignarás una variante de forma determinista y protegerás la respuesta real cuando una segunda versión solo observa tráfico. Prerrequisitos: los Temas 1–3 de este módulo, HTTP, una función y prue…

#### ► LA IDEA EN UNA FRASE
**Al finalizar distinguirás un experimento A/B de un canary y de un despliegue shadow, asignarás una variante de forma determinista y protegerás la respuesta real cuando una segunda versión solo observa tráfico.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en a/b testing y shadow traffic: medir sin convertir usuarios en cobayas como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart TD
    R["Tráfico real"] --> A["A/B: variante estable por usuario"]
    R --> C["Canary: porcentaje a la candidata"]
    R --> S["Shadow: copia de la petición"]
    A --> AM["Métrica de producto por grupo"]
    C --> CM["Decisión de continuar o revertir"]
    S --> SD["Respuesta espejo descartada"]
    SD --> SR["Se entrega solo la respuesta estable"]
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| A/B testing y shadow traffic: medir sin convertir usuarios en cobayas se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar A/B testing y shadow traffic: medir sin convertir usuarios en cobayas | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses a/b testing y shadow traffic: medir sin convertir usuarios en cobayas por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: a/b testing y shadow traffic: medir sin convertir usuarios en cobayas funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- A/B testing y shadow traffic: medir sin convertir usuarios en cobayas existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve a/b testing y shadow traffic: medir sin convertir usuarios en cobayas en tu contexto?
2. ¿Cómo sabrías que a/b testing y shadow traffic: medir sin convertir usuarios en cobayas no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar a/b testing y shadow traffic: medir sin convertir usuarios en cobayas?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart TD
    R["Tráfico real"] --> A["A/B: variante estable por usuario"]
    R --> C["Canary: porcentaje a la candidata"]
    R --> S["Shadow: copia de la petición"]
    A --> AM["Métrica de producto por grupo"]
    C --> CM["Decisión de continuar o revertir"]
    S --> SD["Respuesta espejo descartada"]
    SD --> SR["Se entrega solo la respuesta estable"]
```

```bash
mkdir ejemplo-deploy-strategies
cd ejemplo-deploy-strategies
```

```json
{
  "name": "rutaflow-deployment-strategies",
  "private": true,
  "type": "module",
  "scripts": { "test": "node deployment.test.mjs" }
}
```

```js
import { createHash } from 'node:crypto';

/**
 * Asigna siempre el mismo usuario a la misma variante dentro de este ejemplo.
 * No es un sistema de experimentación de producción: no persiste consentimiento,
 * métricas, exclusiones ni reglas de privacidad.
 */
export function abVariant(userId, split = 0.1) {
  if (!userId || !Number.isFinite(split) || split < 0 || split > 1) {
    throw new Error('userId y split válido (0..1) son obligatorios');
  }
  const digest = createHash('sha256').update(userId).digest();
  const bucket = digest.readUInt32BE(0) / 0x1_0000_0000;
  return bucket < split ? 'canary' : 'stable';
}

/**
 * Ejecuta el comportamiento estable y envía una copia a la variante shadow.
 * La respuesta shadow se descarta y el callback recibe solo la respuesta real.
 * El handler shadow debe ser de solo lectura o idempotente para no duplicar
 * efectos de negocio.
 */
export async function serveWithShadow({ request, stable, shadow, timeoutMs = 100 }) {
  if (typeof stable !== 'function' || typeof shadow !== 'function') {
    throw new Error('stable y shadow deben ser funciones');
  }
  const shadowWork = Promise.resolve()
    .then(() => shadow(request))
    .catch(() => undefined);
  const stableResult = await stable(request);
  await Promise.race([
    shadowWork,
    new Promise(resolve => setTimeout(resolve, timeoutMs)),
  ]);
  return stableResult;
}
```

```js
import assert from 'node:assert/strict';
import { abVariant, serveWithShadow } from './deployment.mjs';

assert.equal(abVariant('ENV-42', 0), 'stable');
assert.equal(abVariant('ENV-42', 1), 'canary');
assert.equal(abVariant('ENV-42'), abVariant('ENV-42'));

const calls = [];
const response = await serveWithShadow({
  request: { id: 'ENV-42' },
  stable: async request => {
    calls.push(`stable:${request.id}`);
    return { status: 200, source: 'stable' };
  },
  shadow: async request => {
    calls.push(`shadow:${request.id}`);
    return { status: 500, source: 'shadow' };
  },
});
assert.deepEqual(response, { status: 200, source: 'stable' });
assert.deepEqual(calls.sort(), ['shadow:ENV-42', 'stable:ENV-42']);
console.log('deployment strategies: ok');
```

```bash
npm test
```

</details>
