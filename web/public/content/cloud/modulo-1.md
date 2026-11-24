# Módulo 1: Fundamentos de Docker y contenedores


## Aprende construyendo


### Tema 1: Virtualización vs contenedores · Básico · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás comparar virtualización y contenedores desde cero. Prerrequisitos: Docker; verifica docker --version.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    subgraph VM["VIRTUALIZACIÓN TRADICIONAL — 3 SO completos, más pesado"]
        direction TB
        VA["App A — SO A"]
        VB["App B — SO B"]
        VC["App C — SO C"]
        VH["Hipervisor"]
        VHW["Hardware físico"]
        VA --> VH
        VB --> VH
        VC --> VH
        VH --> VHW
    end
    subgraph CT["CONTENEDORES — 1 kernel compartido, más ligero"]
        direction TB
        CA["App A"]
        CB["App B"]
        CC["App C"]
        CE["Docker Engine"]
        CK["Kernel del host (Linux)"]
        CHW["Hardware físico"]
        CA --> CE
        CB --> CE
        CC --> CE
        CE --> CK
        CK --> CHW
    end
```

#### ► REGLA PRÁCTICA
Usa contenedores cuando varias apps pueden compartir el mismo kernel Linux del host; usa una VM completa cuando necesitas aislar sistemas operativos distintos entre sí o del host, no solo procesos.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación

```bash
mkdir ejemplo-contenedores && cd ejemplo-contenedores
uname -r
docker run --rm ubuntu:24.04 uname -r
docker run --rm ubuntu:24.04 sh -c '. /etc/os-release; echo "$PRETTY_NAME"'
docker run --rm ubuntu:24.04 ps -e
```

</details>

### Tema 2: Imágenes y capas · Básico · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás construir una imagen desde cero. Prerrequisitos: Docker; verifica docker --version.

#### ► CÓMO FUNCIONA
```mermaid
flowchart TD
    D1["FROM node:20"] --> L1["Capa 1: node:20 base"]
    D2["RUN npm install"] --> L2["Capa 2: dependencias"]
    D3["COPY . ."] --> L3["Capa 3: código app"]
    D4["CMD node app.js"]
    L1 --> L2 --> L3 --> IMG["Imagen (capas apiladas)"]
    IMG -->|"docker run"| CNT["Contenedor (instancia en ejecución,\ncon su propio estado)"]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart TD
    D1["FROM node:20"] --> L1["Capa 1: node:20 base"]
    D2["RUN npm install"] --> L2["Capa 2: dependencias"]
    D3["COPY . ."] --> L3["Capa 3: código app"]
    D4["CMD node app.js"]
    L1 --> L2 --> L3 --> IMG["Imagen (capas apiladas)"]
    IMG -->|"docker run"| CNT["Contenedor (instancia en ejecución,\ncon su propio estado)"]
```

```bash
mkdir -p ejemplo-imagen/src && cd ejemplo-imagen
printf '#!/bin/sh\necho "Hola desde la imagen ejemplo-imagen:1.0"\n' > src/saludo.sh
```

Crea el archivo `Dockerfile`:

```dockerfile
FROM ubuntu:24.04
WORKDIR /app
COPY src/saludo.sh .
CMD ["sh", "saludo.sh"]
```

```bash
docker build -t ejemplo-imagen:1.0 .
docker run --rm ejemplo-imagen:1.0
docker history ejemplo-imagen:1.0
```

</details>

### Tema 3: Registros de contenedores (Docker Hub) · Básico · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás publicar una imagen de forma segura. Prerrequisitos: Docker; verifica docker --version.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    A["Tu máquina\n(construyes)"] -->|"docker push"| B["Docker Hub\nfloci/floci:latest"]
    B -->|"docker pull"| C["Tu máquina\n(descargas)"]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    A["Tu máquina\n(construyes)"] -->|"docker push"| B["Docker Hub\nfloci/floci:latest"]
    B -->|"docker pull"| C["Tu máquina\n(descargas)"]
```

```bash
mkdir ejemplo-registry && cd ejemplo-registry
docker pull ubuntu:24.04
docker image inspect ubuntu:24.04 --format '{{index .RepoDigests 0}}'
docker tag ubuntu:24.04 miusuario/base-rutaflow:1.0
docker images miusuario/base-rutaflow
```

</details>

### Tema 4: Comandos esenciales de Docker · Básico · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás operar contenedores desde cero. Prerrequisitos: Docker; verifica docker --version.

#### ► CÓMO FUNCIONA
```mermaid
flowchart TD
    P["docker pull"] --> IMG["imagen en disco"]
    IMG --> R["docker run"]
    R --> C["contenedor corriendo"]
    C --> PS["docker ps\n(ver si corre)"]
    C --> LOGS["docker logs\n(ver su salida)"]
    C --> EXEC["docker exec\n(entrar dentro)"]
    C --> STOP["docker stop\n(apagarlo)"]
    STOP --> RM["docker rm\n(eliminarlo)"]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart TD
    P["docker pull"] --> IMG["imagen en disco"]
    IMG --> R["docker run"]
    R --> C["contenedor corriendo"]
    C --> PS["docker ps\n(ver si corre)"]
    C --> LOGS["docker logs\n(ver su salida)"]
    C --> EXEC["docker exec\n(entrar dentro)"]
    C --> STOP["docker stop\n(apagarlo)"]
    STOP --> RM["docker rm\n(eliminarlo)"]
```

```bash
mkdir ejemplo-comandos && cd ejemplo-comandos
docker run -d --name rutaflow-demo ubuntu:24.04 sh -c 'echo "servicio iniciado"; sleep 300'
docker ps --filter name=rutaflow-demo
docker logs rutaflow-demo
docker exec rutaflow-demo cat /etc/os-release
docker stop rutaflow-demo
docker ps -a --filter name=rutaflow-demo
docker rm rutaflow-demo
```

</details>

### Tema 5: Docker Compose — servicios, redes y volúmenes · Básico · 25 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás coordinar servicios desde cero. Prerrequisitos: Docker Compose; verifica docker compose version.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    subgraph YML["docker-compose.yml"]
        Y1["services:"]
        Y2["floci:"]
        Y3["image: floci/floci:latest"]
        Y4["ports: 4566 to 4566"]
        Y5["persistent volume: ./data to /state"]
    end
    YML -->|"docker compose up"| NET["Red compartida compose_default"]
    NET --> CNT["Contenedor: floci\nPuerto 4566 expuesto\nVolumen ./data ↔ /state"]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    subgraph YML["docker-compose.yml"]
        Y1["services:"]
        Y2["floci:"]
        Y3["image: floci/floci:latest"]
        Y4["ports: 4566 to 4566"]
        Y5["persistent volume: ./data to /state"]
    end
    YML -->|"docker compose up"| NET["Red compartida compose_default"]
    NET --> CNT["Contenedor: floci\nPuerto 4566 expuesto\nVolumen ./data ↔ /state"]
```

```yaml
services:
  escritor:
    image: ubuntu:24.04
    command: sh -c 'date -u +%FT%TZ >> /datos/registro.txt && echo "escribí una línea"'
    volumes:
      - datos-entregas:/datos
  lector:
    image: ubuntu:24.04
    command: sh -c 'wc -l < /datos/registro.txt'
    volumes:
      - datos-entregas:/datos
    depends_on:
      escritor:
        condition: service_completed_successfully

volumes:
  datos-entregas:
```

```bash
docker compose run --rm lector
docker compose run --rm lector
docker compose down
docker compose run --rm lector
docker compose down -v
docker compose run --rm lector
```

</details>

### Laboratorio 1.1 — Comandos esenciales con una imagen de prueba

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar laboratorio 1.1 — comandos esenciales con una imagen de prueba.

</details>

### Laboratorio 1.2 — Instalar floci-cli y levantar Floci

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar laboratorio 1.2 — instalar floci-cli y levantar floci.

</details>

### Laboratorio 1.3 — Probar la AWS CLI contra Floci

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```yaml
services:
  aws-local:
    image: floci/floci:2.2.0@sha256:e97cd0c1dc2aa14e7697fb5ef5018404c4d6345169dbd276315f0bed2c7b0520
    container_name: floci-aws
    ports:
      - "${AWS_LOCAL_PORT:-4566}:4566"
```

```bash
docker compose up -d aws-local
# equivalente manual a `eval $(floci env)`:
export AWS_ENDPOINT_URL=http://localhost:4566
export AWS_ACCESS_KEY_ID=test AWS_SECRET_ACCESS_KEY=test AWS_DEFAULT_REGION=us-east-1
```

</details>

### Laboratorio 1.4 — Usar StackPort y Floci UI

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
docker compose up -d aws-local stackport
```

```bash
git clone https://github.com/floci-io/floci-ui.git
cd floci-ui
docker compose up -d
docker compose ps
```

```bash
aws --endpoint-url=http://localhost:4566 s3 mb s3://mi-primer-bucket-visual
```

</details>
