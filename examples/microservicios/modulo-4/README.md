# Laboratorio · Módulo 0.5 · Primer «Hola Mundo» en ambos stacks + Docker básico

Lección: `web/public/content/microservices/modulo-4.md` (fichas F014–F016).

## Requisitos

- JDK 25 LTS (25.0.5) y Node.js 26.13.1 LTS.
- Docker Engine 29.10.0 con Docker Compose v5.6.1 o posterior (Docker Desktop en macOS y Windows).
- Conexión a Docker Hub la primera vez, para descargar `ubuntu:24.04`, `eclipse-temurin:25-jdk` y `node:26-alpine`.

## Contenido

| Ruta | Ficha | Qué hay |
|---|---|---|
| `java/HolaMundo.java`, `java/HolaCompacto.java` | Hola Mundo en Java | forma clásica y forma compacta de JDK 25 |
| `java/HolaServidor.java`, `java/HolaServidorTest.java` | Hola Mundo en Java | servidor HTTP del JDK en `:8080/hola` y su test |
| `node/hola.js`, `node/servidor.js`, `node/servidor.test.js` | Hola Mundo en Node.js | consola, servidor en `:3000/hola` con apagado ordenado y su test |
| `docker-basico/` | Docker básico | `Dockerfile` sobre `ubuntu:24.04` y `hola.sh` |
| `java/Dockerfile`, `node/Dockerfile`, `docker-compose.yml` | Docker básico | los dos «Hola Mundo» como contenedores, arrancados juntos |

## Ejecutar

```bash
(cd java && java HolaMundo.java && java HolaCompacto.java)
(cd node && node hola.js)
docker build -t hola-docker:1 docker-basico && docker run --rm hola-docker:1
docker compose up --build -d --wait && curl localhost:8080/hola && curl localhost:3000/hola && docker compose down
```

## Verificar

```bash
./verificar.sh            # Java, Node.js y Docker básico
./verificar.sh --compose  # además construye y prueba docker-compose.yml
```

Resultado esperado: Java 2 `✔`, Node 1 `✔`, Docker básico 3 `✔` (más 2 con `--compose`) y
`RESULTADO: OK · Módulo 0.5 (Hola Mundo en Java y Node.js + Docker básico) verificado`.
