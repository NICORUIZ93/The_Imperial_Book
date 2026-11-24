# Módulo 2: Docker — imágenes y buenas prácticas


## Aprende construyendo


### Tema 1: Dockerfile multi-stage · Básico · 20 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás escribir un Dockerfile multi-stage que separa la compilación de la ejecución, reduciendo drásticamente el tamaño y la superficie de ataque de la imagen final.

#### ► CÓMO FUNCIONA
```mermaid
flowchart TD
    B["FROM node:22-alpine AS build<br/>RUN npm ci && npm run build<br/>(etapa &quot;build&quot;: compiladores y deps de desarrollo)"]
    F["FROM node:22-alpine<br/>CMD [&quot;node&quot;, &quot;dist/index.js&quot;]<br/>(etapa final: imagen limpia)"]
    B -->|COPY --from=build solo el artefacto| F
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart TD
    B["FROM node:22-alpine AS build<br/>RUN npm ci && npm run build<br/>(etapa &quot;build&quot;: compiladores y deps de desarrollo)"]
    F["FROM node:22-alpine<br/>CMD [&quot;node&quot;, &quot;dist/index.js&quot;]<br/>(etapa final: imagen limpia)"]
    B -->|COPY --from=build solo el artefacto| F
```

```bash
mkdir -p academia-devops/src/modulo2/multistage
cd academia-devops/src/modulo2/multistage
```

Crea el archivo `package.json`:

```json
{"name":"api-demo","version":"1.0.0","scripts":{"build":"echo 'compilado' > dist-marker.txt"},"main":"index.js"}
```

```bash
docker run --rm -v "$(pwd)":/app -w /app node:22-alpine npm install --package-lock-only
mkdir dist && echo "console.log('API corriendo')" > index.js
```

Crea el archivo `Dockerfile.sinoptimizar`:

```dockerfile
FROM node:22
WORKDIR /app
COPY . .
RUN npm ci --omit=dev
CMD ["node", "index.js"]
```

```bash
docker build -f Dockerfile.sinoptimizar -t api-demo:sin-optimizar .
```

Crea el archivo `Dockerfile`:

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/dist-marker.txt ./
COPY --from=build /app/index.js ./
CMD ["node", "index.js"]
```

```bash
docker build -t api-demo:multistage .
docker images | grep api-demo
```

</details>

### Tema 2: Capas e invalidación de caché · Básico · 20 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás ordenar las instrucciones de un Dockerfile para maximizar la reutilización de caché entre builds sucesivos.

#### ► CÓMO FUNCIONA
```mermaid
flowchart TD
    subgraph Correcto["Orden CORRECTO (maximiza caché)"]
        direction TD
        C1["COPY package*.json ./ (cambia poco)"] --> C2["RUN npm ci (se cachea)"] --> C3["COPY . . (cambia)"]
    end
    subgraph Incorrecto["Orden INCORRECTO"]
        direction TD
        I1["COPY . . (cambia siempre)"] --> I2["RUN npm ci (se reinstala siempre)"]
    end
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart TD
    subgraph Correcto["Orden CORRECTO (maximiza caché)"]
        direction TD
        C1["COPY package*.json ./ (cambia poco)"] --> C2["RUN npm ci (se cachea)"] --> C3["COPY . . (cambia)"]
    end
    subgraph Incorrecto["Orden INCORRECTO"]
        direction TD
        I1["COPY . . (cambia siempre)"] --> I2["RUN npm ci (se reinstala siempre)"]
    end
```

```bash
mkdir -p academia-devops/src/modulo2/cache-test && cd academia-devops/src/modulo2/cache-test
```

Crea el archivo `package.json`:

```json
{"name":"api-demo","version":"1.0.0","scripts":{"build":"echo compilado > dist-marker.txt"}}
```

```bash
docker run --rm -v "$(pwd)":/app -w /app node:22-alpine npm install --package-lock-only
echo "console.log('v1')" > index.js
```

Crea el archivo `Dockerfile`:

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/dist-marker.txt ./
CMD ["cat", "dist-marker.txt"]
```

```bash
docker build -t api-demo:cache-test .
echo "console.log('cambio de código, sin tocar package.json')" >> index.js
docker build -t api-demo:cache-test . 2>&1 | grep -E "CACHED|npm ci"
```

</details>

### Tema 3: Imágenes base distroless/alpine · Básico · 20 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás elegir entre una imagen base completa, Alpine o distroless según si priorizas comodidad de depuración o mínima superficie de ataque.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    U["Imagen base completa (Ubuntu)<br/>Shell, gestor de cientos de utilidades<br/>~100-300 MB"]
    A["Alpine<br/>Shell mínimo<br/>~5 MB"]
    D["Distroless<br/>Solo el runtime<br/>SIN shell<br/>SIN paquetes"]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    U["Imagen base completa (Ubuntu)<br/>Shell, gestor de cientos de utilidades<br/>~100-300 MB"]
    A["Alpine<br/>Shell mínimo<br/>~5 MB"]
    D["Distroless<br/>Solo el runtime<br/>SIN shell<br/>SIN paquetes"]
```

```bash
mkdir -p academia-devops/src/modulo2/imagenes-base
cd academia-devops/src/modulo2/imagenes-base
echo 'console.log("hola")' > app.js
for base in "node:22" "node:22-alpine" "gcr.io/distroless/nodejs22-debian12"; do
  echo "--- $base ---"
  docker run --rm -v "$(pwd)":/app -w /app "$base" node app.js 2>&1 || echo "(sin shell disponible para depurar interactivamente)"
done
docker images node:22 node:22-alpine --format "{{.Repository}}:{{.Tag}} {{.Size}}"
```

</details>

### Tema 4: Volúmenes vs bind mounts · Básico · 20 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás elegir entre un volumen gestionado por Docker y un bind mount según si necesitas persistencia portable o reflejo instantáneo de código local.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    subgraph Bind["Bind mount (desarrollo)"]
        direction TD
        B1["Tu carpeta local ./src"] <-->|reflejo instantáneo| B2["/app/src dentro del contenedor"]
    end
    subgraph Vol["Volumen gestionado (producción)"]
        direction TD
        V1["Docker decide dónde vive"] --> V2["/data dentro del contenedor (portable, sobrevive a docker rm)"]
    end
```

#### ► REGLA PRÁCTICA
Usa bind mount cuando quieres ver reflejado al instante el código que editas en tu máquina (desarrollo local); usa un volumen gestionado cuando necesitas que los datos sobrevivan a `docker rm` y sean portables entre hosts, sin depender de una ruta específica de tu filesystem (bases de datos, uploads en producción).

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    subgraph Bind["Bind mount (desarrollo)"]
        direction TD
        B1["Tu carpeta local ./src"] <-->|reflejo instantáneo| B2["/app/src dentro del contenedor"]
    end
    subgraph Vol["Volumen gestionado (producción)"]
        direction TD
        V1["Docker decide dónde vive"] --> V2["/data dentro del contenedor (portable, sobrevive a docker rm)"]
    end
```

```bash
mkdir -p academia-devops/src/modulo2/volumenes
cd academia-devops/src/modulo2/volumenes
echo "console.log('version 1')" > app.js
docker run --rm -v "$(pwd)":/app -w /app node:22-alpine node app.js
echo "console.log('version 2, editado localmente')" > app.js
docker run --rm -v "$(pwd)":/app -w /app node:22-alpine node app.js
```

```bash
docker volume create datos-prueba
docker run --rm -v datos-prueba:/data alpine sh -c "echo 'dato persistente' > /data/registro.txt"
docker run --rm -v datos-prueba:/data alpine cat /data/registro.txt
```

</details>

### Tema 5: Redes en Docker · Básico · 20 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás crear una red Docker definida por el usuario y conectar contenedores entre sí usando resolución de nombres, en vez de direcciones IP frágiles.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    subgraph Bridge["Red bridge por defecto"]
        A1["contenedor A (solo por IP, sin nombres)"]
    end
    subgraph UserNet["Red definida por el usuario"]
        A2["contenedor A (puede llamar a &quot;b&quot; por NOMBRE)"]
    end
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    subgraph Bridge["Red bridge por defecto"]
        A1["contenedor A (solo por IP, sin nombres)"]
    end
    subgraph UserNet["Red definida por el usuario"]
        A2["contenedor A (puede llamar a &quot;b&quot; por NOMBRE)"]
    end
```

```bash
mkdir -p academia-devops/src/modulo2/redes && cd academia-devops/src/modulo2/redes
docker network create demo-red
docker run -d --name servicio-a --network demo-red alpine sleep 300
docker run --rm --network demo-red alpine ping -c 2 servicio-a
```

</details>

### Tema 6: Registries — Docker Hub, AWS ECR, Azure Container Registry, Harbor · Básico · 20 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás elegir entre Docker Hub, un registry gestionado por proveedor cloud y un registry autoalojado (Harbor) según tus requisitos de integración e independencia.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    DH["Docker Hub (público, o privado)"]
    ECR["AWS ECR (integrado con IAM AWS)"]
    ACR["Azure Container Registry"]
    HAR["Harbor (autoalojado, control total)"]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    DH["Docker Hub (público, o privado)"]
    ECR["AWS ECR (integrado con IAM AWS)"]
    ACR["Azure Container Registry"]
    HAR["Harbor (autoalojado, control total)"]
```

```bash
mkdir -p academia-devops/src/modulo2/registry && cd academia-devops/src/modulo2/registry
docker run -d -p 5000:5000 --name registro-local registry:2
echo "console.log('imagen de prueba')" > app.js
printf 'FROM node:22-alpine\nCOPY app.js .\nCMD ["node","app.js"]\n' > Dockerfile
docker build -t localhost:5000/app-demo:v1 .
docker push localhost:5000/app-demo:v1
```

```bash
curl -s http://localhost:5000/v2/app-demo/tags/list
docker rmi localhost:5000/app-demo:v1
docker pull localhost:5000/app-demo:v1
```

</details>

### Tema 7: Operación diaria: inspect, stats, events y respaldo de volúmenes · Básico · 20 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás inspeccionar un contenedor y sus montajes, medir su consumo, revisar los eventos del motor de Docker y respaldar y restaurar un volumen con un contenedor auxiliar. Prerrequisito: Tema 4 de este módulo (volúmenes).

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    V[(volumen datos-rutaflow)] --> A[alpine tar czf]
    A --> T[datos-rutaflow.tgz en el host]
    T --> B[alpine tar xzf]
    B --> N[(volumen nuevo)]
    N --> P[postgres:17 restaurado]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    V[(volumen datos-rutaflow)] --> A[alpine tar czf]
    A --> T[datos-rutaflow.tgz en el host]
    T --> B[alpine tar xzf]
    B --> N[(volumen nuevo)]
    N --> P[postgres:17 restaurado]
```

```bash
mkdir respaldo-volumenes && cd respaldo-volumenes
```

```bash
#!/usr/bin/env bash
# Operación diaria de un contenedor con volumen: inspeccionar, medir, respaldar y restaurar
set -euo pipefail

docker volume create datos-rutaflow >/dev/null
docker run -d --name bd-rutaflow -e POSTGRES_PASSWORD=dev -v datos-rutaflow:/var/lib/postgresql/data postgres:17 >/dev/null
until docker exec bd-rutaflow pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done
docker exec bd-rutaflow psql -U postgres -qc "CREATE TABLE entrega(guia text); INSERT INTO entrega VALUES ('BO-1'),('BO-2');"

echo "--- inspección: dónde vive el volumen y con qué imagen corre"
docker inspect bd-rutaflow --format '{{.Config.Image}} {{range .Mounts}}{{.Name}} -> {{.Destination}}{{end}}'
echo "--- consumo instantáneo"
docker stats --no-stream --format '{{.Name}} CPU={{.CPUPerc}} MEM={{.MemUsage}}' bd-rutaflow

echo "--- respaldo del volumen con un contenedor auxiliar (la BD se detiene para un respaldo consistente)"
docker stop bd-rutaflow >/dev/null
docker run --rm -v datos-rutaflow:/origen:ro -v "$(pwd)":/respaldo alpine tar czf /respaldo/datos-rutaflow.tgz -C /origen .
ls -lh datos-rutaflow.tgz | awk '{print $5, $9}'

echo "--- desastre: se borran el contenedor y el volumen"
docker rm bd-rutaflow >/dev/null && docker volume rm datos-rutaflow >/dev/null

echo "--- restauración en un volumen nuevo"
docker volume create datos-rutaflow >/dev/null
docker run --rm -v datos-rutaflow:/destino -v "$(pwd)":/respaldo alpine tar xzf /respaldo/datos-rutaflow.tgz -C /destino
docker run -d --name bd-rutaflow -e POSTGRES_PASSWORD=dev -v datos-rutaflow:/var/lib/postgresql/data postgres:17 >/dev/null
until docker exec bd-rutaflow pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done
docker exec bd-rutaflow psql -U postgres -Atc "SELECT count(*) || ' entregas restauradas' FROM entrega;"

docker rm -f bd-rutaflow >/dev/null && docker volume rm datos-rutaflow >/dev/null
```

```bash
bash respaldo.sh
docker events --since 10m --filter type=container --format '{{.Action}} {{.Actor.Attributes.name}}' --until "$(date +%s)"
```

```text
--- inspección: dónde vive el volumen y con qué imagen corre
postgres:17 datos-rutaflow -> /var/lib/postgresql/data
--- consumo instantáneo
bd-rutaflow CPU=0.05% MEM=38.2MiB / 7.6GiB
--- respaldo del volumen con un contenedor auxiliar (la BD se detiene para un respaldo consistente)
6.5M datos-rutaflow.tgz
--- desastre: se borran el contenedor y el volumen
--- restauración en un volumen nuevo
2 entregas restauradas
```

</details>

### Tema 8: Contenedores sin privilegios: usuario no root, sistema de archivos de solo lectura y capacidades mínimas · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Necesitas Docker 24 o superior. Crea la carpeta academia-labs/devops/sin-privilegios con un servidor Node mínimo (server.js) y su Dockerfile.

#### ► CÓMO FUNCIONA
```mermaid
flowchart TB
    I["Dockerfile: USER 10001"] --> C["docker run"]
    C --> R["--read-only + tmpfs /tmp"]
    C --> K["--cap-drop ALL"]
    C --> N["no-new-privileges"]
    R & K & N --> P["proceso con mínimo poder"]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart TB
    I["Dockerfile: USER 10001"] --> C["docker run"]
    C --> R["--read-only + tmpfs /tmp"]
    C --> K["--cap-drop ALL"]
    C --> N["no-new-privileges"]
    R & K & N --> P["proceso con mínimo poder"]
```

```js
const http = require('node:http');
const fs = require('node:fs');

http.createServer((req, res) => {
  let escritura;
  try { fs.writeFileSync('/app/prueba.txt', 'x'); escritura = 'pude escribir en /app'; }
  catch (e) { escritura = `no puedo escribir en /app (${e.code})`; }
  fs.writeFileSync('/tmp/cache.txt', 'ok'); // /tmp es un tmpfs permitido
  res.end(`uid=${process.getuid()} · ${escritura} · /tmp ok\n`);
}).listen(8080);
```

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY server.js .
# Usuario sin privilegios con UID fijo (las políticas de Kubernetes revisan el número).
RUN addgroup -S -g 10001 app && adduser -S -u 10001 -G app app
USER 10001:10001
EXPOSE 8080
CMD ["node", "server.js"]
```

```bash
cd academia-labs/devops/sin-privilegios
docker build -t rutaflow/api-segura .
docker run -d --name api --read-only --tmpfs /tmp \
  --cap-drop ALL --security-opt no-new-privileges -p 8080:8080 rutaflow/api-segura
curl -s localhost:8080
docker exec api id
docker exec api sh -c 'touch /etc/hackeado' ; echo "código de salida: $?"
```

```text
uid=10001 · no puedo escribir en /app (EROFS) · /tmp ok
uid=10001(app) gid=10001(app) groups=10001(app)
touch: /etc/hackeado: Read-only file system
código de salida: 1
```

</details>

### Tema 9: Elegir el motor de contenedores local: Docker Desktop, Podman, Colima y Rancher Desktop · Avanzado · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Usa Python 3.10 o superior para el script. Para probar un motor alternativo instala uno: brew install podman o brew install colima docker en macOS, o Rancher Desktop desde su página. Crea la carpeta academia-labs/devops/motor-local.

#### ► CÓMO FUNCIONA
```mermaid
flowchart TB
    A["¿Empresa con 250+ empleados<br/>o 10 M USD+ al año?"] -->|sí| B["Docker Desktop con suscripción<br/>o un motor libre"]
    A -->|no| C["Docker Desktop gratis<br/>o un motor libre"]
    B --> D{"¿Sistema?"}
    C --> D
    D -->|"macOS"| E["Podman, Colima o Rancher Desktop"]
    D -->|"Windows"| F["Podman o Rancher Desktop"]
    D -->|"Linux"| G["Docker Engine o Podman nativo"]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart TB
    A["¿Empresa con 250+ empleados<br/>o 10 M USD+ al año?"] -->|sí| B["Docker Desktop con suscripción<br/>o un motor libre"]
    A -->|no| C["Docker Desktop gratis<br/>o un motor libre"]
    B --> D{"¿Sistema?"}
    C --> D
    D -->|"macOS"| E["Podman, Colima o Rancher Desktop"]
    D -->|"Windows"| F["Podman o Rancher Desktop"]
    D -->|"Linux"| G["Docker Engine o Podman nativo"]
```

```python
"""Recomienda un motor de contenedores local según el equipo y la empresa.

Los datos de licencia vienen de las páginas oficiales (revisadas el 2026-11-18).
"""
from dataclasses import dataclass

# Docker Desktop es gratis para empresas con menos de 250 empleados Y menos de 10 M USD al año.
LIMITE_EMPLEADOS = 250
LIMITE_INGRESOS_MUSD = 10

# Sistemas donde corre cada motor.
MOTORES = {
    "Docker Desktop": {"macos", "windows", "linux"},
    "Podman": {"macos", "windows", "linux"},
    "Colima": {"macos", "linux"},
    "Rancher Desktop": {"macos", "windows", "linux"},
}


@dataclass
class Equipo:
    nombre: str
    so: str
    empleados: int
    ingresos_musd: float


def docker_desktop_gratis(equipo: Equipo) -> bool:
    return equipo.empleados < LIMITE_EMPLEADOS and equipo.ingresos_musd < LIMITE_INGRESOS_MUSD


def opciones(equipo: Equipo) -> list[str]:
    elegibles = []
    for nombre, sistemas in MOTORES.items():
        if equipo.so not in sistemas:
            continue
        if nombre == "Docker Desktop" and not docker_desktop_gratis(equipo):
            continue  # se puede usar, pero exige pagar una suscripción
        elegibles.append(nombre)
    return elegibles


EQUIPOS = [
    Equipo("estudiante", "macos", 1, 0),
    Equipo("RutaFlow (40 personas)", "windows", 40, 3),
    Equipo("empresa de 900 personas", "macos", 900, 120),
]

for equipo in EQUIPOS:
    lista = ", ".join(opciones(equipo))
    pago = "" if docker_desktop_gratis(equipo) else "  (Docker Desktop exige suscripción)"
    print(f"{equipo.nombre:<26} {equipo.so:<8} -> {lista}{pago}")
```

```bash
cd academia-labs/devops/motor-local
python3 elegir_runtime.py
# con el motor elegido instalado, comprueba que tu Compose funciona igual:
docker compose up -d && docker compose ps
```

```text
estudiante                 macos    -> Docker Desktop, Podman, Colima, Rancher Desktop
RutaFlow (40 personas)     windows  -> Docker Desktop, Podman, Rancher Desktop
empresa de 900 personas    macos    -> Podman, Colima, Rancher Desktop  (Docker Desktop exige suscripción)
```

</details>
