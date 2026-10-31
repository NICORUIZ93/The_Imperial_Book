# Módulo 11: Despliegue y contenedores


## Aprende construyendo

### Tema 1: Dockerfile multi-stage para Node

#### Paso 1 · Objetivo y preparación

Al finalizar podrás construir una imagen Node pequeña separando dependencias de desarrollo. **Prerrequisitos:** Node LTS, Docker y terminal; ejemplo independiente desde una carpeta vacía.

#### Paso 2 · Contexto y caso real

Una imagen de producción no debe contener tests, caches ni herramientas innecesarias. Reducir superficie acelera despliegues y limita vulnerabilidades.

#### Paso 3 · Teoría y analogía aplicada

Multi-stage usa una etapa para compilar y otra para ejecutar. Es como construir un mueble en un taller y llevar solo el resultado, no todas las herramientas.

Ya construyes una imagen reproducible. El siguiente tema separará configuración y healthchecks.

**Errores comunes:** copiar secretos; usar `latest`; ejecutar como root; incluir `node_modules` local; no fijar lockfile.

**Fuentes oficiales:** [Docker multi-stage](https://docs.docker.com/build/building/multi-stage/), [Node Docker](https://github.com/nodejs/docker-node) y [Dockerfile reference](https://docs.docker.com/reference/dockerfile/).

**Conceptos clave:** etapa de build frente a etapa final, exclusión de devDependencies.

Un Dockerfile multi-stage (concepto introducido en profundidad en el Módulo 2 del track DevOps) separa el proceso de construcción de una imagen en etapas distintas, cada una con su propio propósito: una etapa de "build" instala todas las dependencias (incluyendo `devDependencies` necesarias para compilar TypeScript o ejecutar un bundler), copia el código fuente completo, y ejecuta el proceso de compilación; una etapa final, considerablemente más ligera, copia únicamente el resultado ya compilado de la etapa de build (`COPY --from=build /app/dist ./dist`) e instala solo las dependencias de producción (`npm ci --omit=dev`, aprovechando la distinción entre `dependencies` y `devDependencies` estudiada en el Módulo 1), sin incluir nunca en la imagen final el código fuente sin compilar, las herramientas de build, ni ninguna dependencia exclusiva de desarrollo.

Esta separación produce una imagen final considerablemente más pequeña y con una superficie de ataque reducida (menos paquetes instalados significa menos vulnerabilidades potenciales de terceros presentes en la imagen final), además de un tiempo de despliegue más rápido (una imagen más pequeña se transfiere y arranca más rápido) comparado con una imagen de una sola etapa que incluyera indiscriminadamente todo lo necesario para desarrollo y construcción además de lo necesario para ejecutar en producción. Comparar el tamaño final de ambas versiones (multi-stage optimizada frente a una versión ingenua de una sola etapa) hace tangible el beneficio concreto de esta técnica, frecuentemente revelando una diferencia de varias veces en el tamaño final de la imagen.

Usar una imagen base ligera como `node:24-alpine` (basada en Alpine Linux, una distribución minimalista, en vez de una distribución completa como Debian o Ubuntu) para ambas etapas reduce aún más el tamaño base de la imagen, aunque requiere verificar que todas las dependencias del proyecto (incluyendo cualquier dependencia nativa que requiera compilación específica del sistema operativo) sean compatibles con el entorno de Alpine, que usa una biblioteca C distinta (musl en vez de glibc) que ocasionalmente causa incompatibilidades sutiles con paquetes que dependen de binarios nativos precompilados específicamente para glibc.

**Analogía:** un Dockerfile multi-stage es como un taller de manufactura con dos zonas separadas: una zona de fabricación completa con todas las herramientas pesadas necesarias para construir el producto (la etapa de build), y una zona de empaquetado final que solo recibe el producto ya terminado, sin ninguna de las herramientas de fabricación pesadas presentes en el empaque final que se envía al cliente.

**¿Por qué es importante?** Un Dockerfile multi-stage produce imágenes de producción considerablemente más pequeñas y con menor superficie de ataque, excluyendo herramientas de build y dependencias de desarrollo que no tienen ninguna razón de estar presentes en el entorno de ejecución final.

**Código del ejemplo:**

```dockerfile
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
CMD ["node", "dist/index.js"]
```

**Transferencia al proyecto integrador «API operativa de entregas»:** Construye y arranca la API desde una imagen final mínima. Ejecuta pruebas de humo contra esa imagen y verifica que no necesita archivos del workspace ni dependencias exclusivas de desarrollo.

#### Paso 4 · Demostración guiada desde cero

```bash
mkdir ejemplo-docker-node
cd ejemplo-docker-node
npm init -y
mkdir src
```

Crea `src/server.js` y `Dockerfile`:

```js
import http from "node:http";
http.createServer((_req, res) => res.end("ok")).listen(3000, "0.0.0.0");
```

```dockerfile
FROM node:24-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
FROM node:24-alpine
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY src ./src
USER node
EXPOSE 3000
CMD ["node", "src/server.js"]
```

Ejecuta `npm install`, `docker build -t ejemplo-node .` y `docker run --rm -p 3000:3000 ejemplo-node`. **Resultado esperado:** `curl http://127.0.0.1:3000` devuelve `ok`. **Fallo deliberado y diagnóstico:** elimina `COPY src ./src`; el contenedor termina con módulo inexistente, señalando un artefacto ausente.

#### Paso 5 · Práctica guiada

Añade `.dockerignore` para excluir `node_modules` y `.git`. **Pista:** compara el contexto enviado con y sin el archivo.

#### Paso 6 · Práctica independiente

Ejecuta como usuario no root y entrega `docker inspect` con puerto y usuario.

#### Paso 7 · Cierre y conexión

Ya construís una imagen multi-stage que responde `ok` y falla de forma explícita si falta el código. El siguiente tema separa configuración por ambiente y declara salud con liveness y readiness.

### Tema 2: Variables de entorno por ambiente y healthchecks

#### Paso 1 · Objetivo y preparación

Al finalizar podrás validar configuración y exponer un endpoint de salud útil para un orquestador. **Prerrequisitos:** Node LTS, Docker y terminal; ejemplo desde una carpeta vacía.

#### Paso 2 · Contexto y caso real

Desarrollo, staging y producción usan puertos y dependencias distintas. Un healthcheck debe indicar si el proceso vive y, opcionalmente, si sus dependencias están listas.

#### Paso 3 · Teoría y analogía aplicada

Variables configuran sin recompilar; readiness decide si recibir tráfico. Es un hospital: estar vivo no significa estar listo para atender.

Ya separas liveness, readiness y configuración. El siguiente tema tratará procesos y despliegue sin interrupción.

**Errores comunes:** hornear secretos en imagen; usar readiness como liveness; devolver siempre 200; no validar tipos; imprimir todo `process.env`.

**Fuentes oficiales:** [Docker HEALTHCHECK](https://docs.docker.com/reference/dockerfile/#healthcheck), [Kubernetes probes](https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/) y [Node process.env](https://nodejs.org/api/process.html#processenv).

**Conceptos clave:** configuración externalizada, misma imagen en todos los entornos, `HEALTHCHECK`.

Un principio fundamental de despliegue reproducible (conectado directamente con la práctica de configuración externalizada estudiada en el Módulo 12 del track DevOps) es que la imagen de contenedor debe ser idéntica en todos los entornos (desarrollo, staging, producción); lo único que debería cambiar entre entornos son las variables de entorno inyectadas al arrancar el contenedor (`DATABASE_URL`, `LOG_LEVEL`, entre otras), nunca el código o la configuración hardcodeada dentro de la imagen misma. Mantener archivos `.env` separados por ambiente (`.env.production`, `.env.development`) como referencia de qué variables se necesitan, sin que ninguno de esos archivos con valores sensibles reales se incluya dentro de la imagen de Docker construida, es la práctica correcta.

Un `HEALTHCHECK` declarado directamente en el Dockerfile (`HEALTHCHECK CMD node -e "..."`) permite que Docker (y, por extensión, un orquestador como Kubernetes) verifique periódicamente si el contenedor está genuinamente saludable, no solo si el proceso sigue técnicamente en ejecución: un proceso Node puede seguir corriendo técnicamente mientras está en un estado interno defectuoso (por ejemplo, incapaz de conectarse a su base de datos), y un healthcheck a nivel de aplicación (invocando el endpoint `/health` construido en el Módulo 9, que verifica activamente la conexión a la base de datos antes de responder) detecta esta categoría de fallo que un simple "¿el proceso sigue vivo?" no capturaría.

Este healthcheck es lo que permite a un orquestador tomar decisiones automatizadas informadas: rechazar dirigir tráfico hacia un contenedor que aún no pasó su healthcheck inicial (durante el arranque), o reiniciar automáticamente un contenedor que pasó de saludable a no saludable durante su operación normal, sin depender de que un humano detecte y responda manualmente a ese estado degradado, cerrando el círculo con el Tema 4 (zero-downtime deploys), donde el healthcheck es precisamente el mecanismo que determina cuándo una nueva instancia está lista para recibir tráfico real durante un despliegue rolling.

**Analogía:** externalizar la configuración por variables de entorno es como construir un mismo producto estandarizado que se adapta a distintos mercados simplemente cambiando su empaque de etiquetado externo, sin modificar nunca el producto interno mismo. Un healthcheck es como un chequeo médico rutinario periódico que verifica la salud real del paciente (no solo que "sigue respirando"), permitiendo intervenir proactivamente ante señales tempranas de un problema antes de que se convierta en una falla completa y visible.

**¿Por qué es importante?** Externalizar la configuración garantiza que la misma imagen probada se despliega idénticamente en todos los entornos; un healthcheck a nivel de aplicación permite que el orquestador detecte y responda automáticamente a fallos internos que un simple chequeo de "el proceso sigue vivo" no capturaría.

**Código del ejemplo:**

```dockerfile
HEALTHCHECK CMD node -e "fetch('http://localhost:3000/health').then(r=>process.exit(r.ok?0:1))"
```
```bash
# .env.production          # .env.development
DATABASE_URL=prod-host      DATABASE_URL=localhost
LOG_LEVEL=info               LOG_LEVEL=debug
```

**Transferencia al proyecto integrador «API operativa de entregas»:** Valida variables de base, almacenamiento e identidad al arrancar. Prueba una configuración ausente y una dependencia caída, distinguiendo fallo de configuración de indisponibilidad temporal.

#### Paso 4 · Demostración guiada desde cero

```bash
mkdir ejemplo-env-health
cd ejemplo-env-health
npm init -y
mkdir src
```

Crea `src/server.js`:

```js
import http from "node:http";
const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port)) throw new Error("PORT inválido");
http.createServer((req, res) => {
  if (req.url === "/live") return res.end("live");
  if (req.url === "/ready") return res.end(process.env.READY === "true" ? "ready" : "not-ready");
  res.statusCode = 404; res.end("not-found");
}).listen(port, () => console.log(`puerto ${port}`));
```

Ejecuta `PORT=3100 READY=true node src/server.js` (en PowerShell usa `$env:PORT=3100; $env:READY="true"; node src/server.js`) y consulta `/live` y `/ready`. **Resultado esperado:** `live` y `ready`. **Fallo deliberado y diagnóstico:** usa `PORT=texto`; el proceso falla antes de escuchar, evitando un despliegue mal configurado.

#### Paso 5 · Práctica guiada

Añade timeout para una dependencia lenta. **Pista:** readiness debe fallar rápido y no bloquear el endpoint de vida.

#### Paso 6 · Práctica independiente

Escribe un `HEALTHCHECK` Docker que consulte `/live` y documenta por qué no debe incluir secretos.

#### Paso 7 · Cierre y conexión

Ya distinguís `/live` de `/ready` y comprobás que un `PORT` no numérico detiene el arranque. El siguiente tema reemplaza procesos supervisados por contenedores y evita cortar el servicio al actualizar.

### Tema 3: PM2, contenedores y zero-downtime deploys

#### Paso 1 · Objetivo y preparación

Al finalizar podrás explicar un reemplazo gradual de procesos y sus límites. **Prerrequisitos:** Node LTS, Docker y PM2 opcional; ejemplo independiente desde una carpeta vacía.

#### Paso 2 · Contexto y caso real

Una API de entregas no puede detenerse para cada versión. Un supervisor inicia la nueva instancia, comprueba salud y retira la anterior.

#### Paso 3 · Teoría y analogía aplicada

Zero-downtime depende de readiness, conexiones drenadas y rollback; PM2 solo supervisa procesos. Es cambiar una ventanilla cuando la siguiente ya está abierta.

Ya entiendes que zero-downtime es un protocolo completo, no un comando aislado. El siguiente tema introducirá reverse proxy.

**Errores comunes:** recargar sin healthcheck; olvidar migraciones compatibles; asumir estado local; no drenar sockets; no conservar versión anterior.

**Fuentes oficiales:** [PM2 reload](https://pm2.keymetrics.io/docs/usage/cluster-mode/), [Docker restart](https://docs.docker.com/engine/containers/start-containers-automatically/) y [12-factor disposability](https://12factor.net/disposability).

**Conceptos clave:** responsabilidades desplazadas al orquestador, rolling update.

Como se discutió brevemente en el Módulo 8, PM2 gestionaba tradicionalmente responsabilidades como reinicio automático ante fallos, logs centralizados y clustering directamente sobre un servidor sin contenedores; en un mundo con Docker y Kubernetes, estas responsabilidades se desplazan naturalmente hacia el orquestador: `restart: always` (o la política de reinicio equivalente en Kubernetes) reemplaza el reinicio automático de PM2; la recolección de logs de contenedores mediante el pipeline de logging del propio orquestador (Módulo 10 del track DevOps) reemplaza la gestión de logs de PM2; y el escalado horizontal mediante múltiples réplicas de Kubernetes reemplaza el clustering integrado de PM2 dentro de un único servidor.

Un despliegue sin downtime (zero-downtime deploy) requiere, como mínimo, dos condiciones: al menos dos instancias de la aplicación ejecutándose detrás de un balanceador de carga (para que retirar temporalmente una instancia durante su actualización no deje al servicio completamente sin capacidad de atender tráfico), y un healthcheck confiable (Tema 2) que el balanceador o el orquestador consulte antes de dirigir tráfico real hacia una instancia recién actualizada, garantizando que solo reciba tráfico una vez que genuinamente está lista para procesarlo correctamente, no simplemente porque el proceso ya arrancó técnicamente.

El patrón de rolling update (ya estudiado en profundidad en el Módulo 5 del track DevOps) actualiza las instancias de una en una (o en pequeños lotes), esperando a que cada nueva instancia pase su healthcheck antes de retirar tráfico de la instancia anterior correspondiente y proceder con la siguiente, de modo que en todo momento durante el despliegue completo existe al menos una instancia sana atendiendo tráfico real, sin que los usuarios experimenten ninguna interrupción perceptible del servicio durante lo que, de otro modo, sería una operación potencialmente disruptiva.

**Analogía:** un rolling update es como renovar el personal de un mostrador de atención al cliente que nunca cierra completamente: se reemplaza a un empleado a la vez, asegurándose de que el reemplazo ya está capacitado y listo (pasó el healthcheck) antes de que el empleado anterior se retire, de modo que el mostrador nunca queda completamente sin nadie atendiendo durante toda la transición.

**¿Por qué es importante?** Entender qué responsabilidades de PM2 asume ahora un orquestador de contenedores, y qué condiciones mínimas (múltiples instancias, healthcheck confiable) hacen posible un despliegue sin downtime real, son conocimientos operativos esenciales para desplegar aplicaciones Node de forma profesional en producción moderna.

**Diagrama:**

```
Rolling update con 2+ instancias detrás de un balanceador:
Instancia A (v1) ── activa ──┐
Instancia B (v1) ── activa ──┼── balanceador dirige tráfico
       │
   actualizar A → v2, esperar healthcheck OK → A recibe tráfico de nuevo
   actualizar B → v2, esperar healthcheck OK → B recibe tráfico de nuevo
   (en TODO momento, al menos una instancia sana atendiendo)
```

**Transferencia al proyecto integrador «API operativa de entregas»:** Envía SIGTERM durante una confirmación y deja de aceptar trabajo nuevo antes de cerrar conexiones. Conserva una prueba de terminación ordenada y documenta el límite del plazo de apagado.

#### Paso 4 · Demostración guiada desde cero

```bash
mkdir ejemplo-zero-downtime
cd ejemplo-zero-downtime
npm init -y
npm install pm2
mkdir src
```

Crea `src/server.js`:

```js
import http from "node:http";
const version = process.env.VERSION ?? "v1";
http.createServer((_req, res) => res.end(version)).listen(3000, "0.0.0.0");
```

Ejecuta `VERSION=v1 npx pm2 start src/server.js --name demo` y consulta; cambia a `VERSION=v2 npx pm2 reload demo --update-env`. **Resultado esperado:** el proceso termina sirviendo `v2` sin que PM2 pierda supervisión. **Fallo deliberado y diagnóstico:** cambia el puerto ocupado; el reload falla y conserva la versión anterior, mostrando por qué se necesita rollback.

#### Paso 5 · Práctica guiada

Añade `ecosystem.config.cjs` con `instances: 2` y `exec_mode: "cluster"`. **Pista:** no compartas memoria entre instancias.

#### Paso 6 · Práctica independiente

Simula una versión que responde 500 y documenta el procedimiento de rollback.

#### Paso 7 · Cierre y conexión

Ya servís `v2` sin perder supervisión y comprobás que un puerto ocupado conserva la versión anterior. El siguiente tema pone Nginx delante del proceso y compara esa operación con serverless.

### Tema 4: Nginx como reverse proxy y serverless

#### Paso 1 · Objetivo y preparación

Al finalizar podrás explicar qué termina TLS, qué enruta Nginx y qué ejecuta una función serverless. **Prerrequisitos:** Docker, HTTP y Node LTS; ejemplo independiente desde una carpeta vacía.

#### Paso 2 · Contexto y caso real

El proxy oculta puertos internos, centraliza TLS y balancea; una función serverless delega escalado al proveedor. Son despliegues con costos y límites distintos.

#### Paso 3 · Teoría y analogía aplicada

Nginx es la recepción que dirige visitantes; la función es un trabajador convocado por evento. El proxy mantiene conexión; serverless puede arrancar en frío.

Ya distingues proxy, backend y función bajo demanda. El siguiente módulo cerrará Node con un proyecto de producción independiente.

**Errores comunes:** exponer backend directamente; confiar en headers sin proxy confiable; olvidar timeouts; usar serverless para procesos largos; no medir cold starts.

**Fuentes oficiales:** [Nginx reverse proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/), [AWS Lambda handler](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-handler.html) y [Docker networking](https://docs.docker.com/engine/network/).

**Conceptos clave:** reverse proxy, balanceo de carga con Nginx, funciones serverless.

Nginx, frecuentemente posicionado delante de una o más instancias de una aplicación Node, actúa como reverse proxy: recibe todo el tráfico entrante del exterior y lo reenvía hacia la instancia (o instancias) apropiadas de la aplicación, permitiendo centralizar responsabilidades como terminación TLS/HTTPS (Nginx maneja los certificados y la comunicación cifrada con el cliente externo, comunicándose con las instancias internas de Node mediante HTTP simple dentro de una red interna confiable), balanceo de carga entre múltiples instancias, y servir contenido estático directamente sin involucrar en absoluto al proceso Node para esos casos, liberando a la aplicación Node para concentrarse exclusivamente en su lógica de negocio dinámica.

Las plataformas serverless (AWS Lambda, Vercel, Azure Functions) representan un modelo de despliegue alternativo donde no se gestiona ningún servidor ni contenedor de larga duración en absoluto: el código Node se empaqueta como una función que la plataforma ejecuta bajo demanda ante cada petición entrante, escalando automáticamente el número de instancias concurrentes según la demanda real (incluyendo escalar hasta cero cuando no hay tráfico, sin costo alguno durante esos períodos de inactividad), a cambio de ciertas limitaciones como un tiempo máximo de ejecución por invocación y "cold starts" (latencia adicional en la primera invocación tras un período de inactividad, mientras la plataforma inicializa una nueva instancia de la función).

Elegir entre contenedores gestionados manualmente (o mediante Kubernetes), y una plataforma serverless, depende de las características de la carga de trabajo: aplicaciones con tráfico sostenido y predecible frecuentemente se benefician del control y el coste más predecible de instancias de contenedores de larga duración; aplicaciones con tráfico esporádico o altamente variable (con picos ocasionales y períodos largos de inactividad) frecuentemente se benefician del modelo de pago exclusivamente por uso real y el escalado automático a cero de las plataformas serverless, sin necesidad de aprovisionar ni pagar por capacidad de servidor que permanece ociosa la mayor parte del tiempo.

**Analogía:** Nginx como reverse proxy es como un recepcionista único en la entrada de un edificio con múltiples oficinas internas, dirigiendo cada visitante hacia la oficina correcta y gestionando la seguridad de acceso centralizadamente en la entrada, sin que cada oficina interna necesite gestionar su propia seguridad de entrada por separado. Serverless es como alquilar espacio de oficina exactamente por hora de uso real, sin ningún compromiso de alquiler fijo, escalando automáticamente el espacio alquilado según cuántas personas necesitan usarlo en cada momento específico, sin pagar nada durante los períodos en que nadie lo necesita.

**¿Por qué es importante?** Nginx centraliza responsabilidades transversales (TLS, balanceo, contenido estático) delante de instancias de aplicación; serverless ofrece un modelo alternativo de escalado automático y pago por uso real, apropiado específicamente para cargas de trabajo esporádicas o altamente variables, distinto del modelo de contenedores de larga duración.

**Diagrama:**

```
Cliente ──HTTPS──▶ Nginx (TLS, balanceo) ──HTTP interno──▶ Instancia Node A
                                          └──HTTP interno──▶ Instancia Node B

Serverless: código empaquetado → la plataforma lo ejecuta bajo demanda,
            escala automáticamente (incluso a cero), pago solo por uso real
```

---

**Transferencia al proyecto integrador «API operativa de entregas»:** Prueba la API detrás del proxy con tamaño máximo de cuerpo y tiempos definidos. Verifica interpretación de cabeceras de origen y cliente sin confiar en valores enviados desde conexiones no autorizadas.

#### Paso 4 · Demostración guiada desde cero

```bash
mkdir ejemplo-nginx
cd ejemplo-nginx
mkdir app
```

**Ejecuta el ejemplo** (monta el proyecto Node y córrelo):

```bash
npm init -y && npm install
node index.js
```
Para las pruebas: `npm test`.

Crea `app/server.js` y `nginx.conf`:

```js
import http from "node:http";
http.createServer((_req, res) => res.end("backend")).listen(3000, "0.0.0.0");
```

```nginx
events {}
http { server { listen 8080; location / { proxy_pass http://host.docker.internal:3000; } } }
```

Ejecuta `node app/server.js` y `docker run --rm --add-host=host.docker.internal:host-gateway -p 8080:8080 -v "$PWD/nginx.conf:/etc/nginx/nginx.conf:ro" nginx:alpine`; consulta `curl http://127.0.0.1:8080`. **Resultado esperado:** `backend`. **Fallo deliberado y diagnóstico:** cambia el puerto upstream; Nginx devuelve 502 porque el backend no está disponible.

#### Paso 5 · Práctica guiada

Añade un header `X-Request-ID` en proxy y backend. **Pista:** preserva el valor recibido.

#### Paso 6 · Práctica independiente

Escribe una función serverless que reciba `{ name }` y devuelva 400 si falta; entrega el contrato y una comparación de cold start.

#### Paso 7 · Cierre y conexión

Ya ves `backend` a través del proxy y un 502 cuando el upstream apunta a un puerto equivocado. El laboratorio empaqueta la API completa con la imagen multi-stage de este módulo.

## Laboratorio práctico

**Objetivo del laboratorio:** construir una imagen Docker de producción multi-stage optimizada de la API completa, con healthcheck y configuración externalizada por ambiente.

**Requisitos previos:** Docker instalado, Módulos 0-10 completados.

| Paso | Acción | Comando | Explicación |
|---|---|---|---|
| 1 | Escribir el Dockerfile multi-stage | Ver Tema 1 | Etapa de build + etapa final solo con producción |
| 2 | Comparar tamaños de imagen | Multi-stage vs una sola etapa sin optimizar | Documenta la diferencia real observada |
| 3 | Configurar variables de entorno por ambiente | `.env.production` / `.env.development` | Verifica que la misma imagen se comporta distinto según las variables inyectadas |
| 4 | Levantar el contenedor y verificar logs | `docker run`, `docker logs` | Confirma arranque correcto |
| 5 | Configurar el HEALTHCHECK | Ver Tema 2 | Verifica con `docker inspect` que Docker reporta el estado de salud |
| 6 | Documentar un despliegue sin downtime | Al menos 2 instancias tras un balanceador | Describe el proceso de rolling update completo |

**Verificación:** el laboratorio se considera exitoso si la imagen multi-stage es sustancialmente más pequeña que la versión de una sola etapa, y si `docker inspect` reporta correctamente el estado de salud del contenedor según el healthcheck configurado.

**Errores comunes y soluciones**

- **Incluir el código fuente sin compilar y las devDependencies en la imagen final.** Usa multi-stage, copiando solo el resultado ya compilado y las dependencias de producción a la etapa final.
- **Hardcodear configuración específica de un ambiente dentro de la imagen.** Externaliza toda la configuración que varía entre ambientes mediante variables de entorno inyectadas al arrancar el contenedor.
- **Desplegar una actualización sin verificar el healthcheck antes de retirar tráfico de la instancia anterior.** Esto puede causar downtime real si la nueva instancia no está genuinamente lista; siempre espera el healthcheck confirmado antes de continuar el rolling update.

---
