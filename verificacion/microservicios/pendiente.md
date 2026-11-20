# Pendiente de verificar en el Mac del dueño (specs/018)

Una línea por bloque que no se pudo ejecutar en este entorno, con archivo:línea.

- docs/microservicios/08-herramientas-y-versiones.md:131 — `clinic` 13.0.0 (última publicación 2023-06-28): se instala y responde `clinic --version` → `v13.0.0` en Node 22.23.5 (comprobado aquí el 2026-11-19); falta probar `clinic doctor` con Node 26.13.1.

## Fase 0 · Módulos 0.1–0.5 (modulo-0 … modulo-4, fichas F001–F016)

Todo el código Java se ejecutó aquí con JDK 25.0.5 y todos los laboratorios pasaron (`verificar.sh` de modulo-0 a modulo-4) con **Node 22.23.5**: este entorno no permite instalar Node 26. Falta repetirlos con Node 26.13.1.

- examples/microservicios/modulo-0/verificar.sh:1 — repetir con Node 26.13.1 (8 tests pasaron con Node 22.23.5).
- examples/microservicios/modulo-1/verificar.sh:1 — repetir con Node 26.13.1 (11 tests pasaron con Node 22.23.5).
- examples/microservicios/modulo-2/verificar.sh:1 — repetir con Node 26.13.1 (Node 10 tests y Java 9 comprobaciones pasaron con Node 22.23.5 y JDK 25.0.5).
- examples/microservicios/modulo-3/verificar.sh:1 — repetir con Node 26.13.1 y Git del Mac (pasó con Node 22.23.5, Git 2.43.0, bash 5.2.21).
- examples/microservicios/modulo-4/verificar.sh:1 — ejecutar `./verificar.sh --compose`: aquí no hay acceso a Docker Hub, así que no se construyeron `java/Dockerfile` (eclipse-temurin:25-jdk) ni `node/Dockerfile` (node:26-alpine) ni se levantó `docker-compose.yml` (solo se validó con `docker compose config -q`). Las etiquetas existen en Docker Hub (API v2, consultada el 2026-11-19). La parte de Docker básico (ubuntu:24.04) sí pasó.
- web/public/content/microservices/modulo-4.md:697 — `FROM eclipse-temurin:25-jdk`: construir y comprobar `curl localhost:8080/hola` → `Hola Mundo desde Java`.
- web/public/content/microservices/modulo-4.md:711 — `FROM node:26-alpine`: construir y comprobar `curl localhost:3000/hola` → `Hola Mundo desde Node.js` (y que `docker compose down` detiene hola-node con código 0 gracias al manejador de SIGTERM).
- web/public/content/microservices/modulo-4.md:763 — salida de `docker compose ps` en el paso 3 del laboratorio de Docker básico (descrita, no pegada).
- web/public/content/microservices/modulo-4.md:774 — en el Mac `ubuntu:24.04` recién descargada mostrará el número de parche (p. ej. `Ubuntu 24.04.3 LTS`); la imagen local de este entorno dice `Ubuntu 24.04 LTS`. `verificar.sh` ya compara solo `Ubuntu 24.04`.
- web/public/content/microservices/modulo-4.md:473 — `node hola.js` debe imprimir `Hola Mundo desde Node.js 26` (aquí, con Node 22, imprime 22).
- web/public/content/microservices/modulo-4.md:86 — instalación del JDK: comprobar el instalador de Temurin 25 en adoptium.net, el identificador `25.0.x-tem` de `sdk list java` (línea 88) y que `apt install openjdk-25-jdk` existe en Ubuntu (línea 89; en Ubuntu 24.04 de este entorno está disponible).
- web/public/content/microservices/modulo-4.md:356 — instalación de Node: `nvm install 26` y `nvm use 26` en el Mac.
- web/public/content/microservices/modulo-3.md:926 — texto exacto del error de `JSON.parse` con Node 26 (aquí, V8 de Node 22: `Expected property name or '}' in JSON at position 1 (line 1 column 2)`).
- web/public/content/microservices/modulo-3.md:1471 — texto exacto de `node --env-file=.env` sin archivo en Node 26 (aquí: `node: .env: not found`, código 9).
- web/public/content/microservices/modulo-3.md:442 — mensaje de zsh en macOS para un guion sin permiso de ejecución (`zsh: permission denied: ./contar-errores.sh`); aquí no hay zsh, se pegó la salida de bash.
- web/public/content/microservices/modulo-0.md:456 — en macOS, `EADDRINUSE` puede mostrar `:::3000` en lugar de `0.0.0.0:3000`.
- web/public/content/microservices/modulo-0.md:494 — salida de `lsof -i :3000` en macOS (descrita, no pegada).
- web/public/content/microservices/modulo-0.md:786 — nota sobre Windows PowerShell 5.1 (`curl` como alias y comillas internas): no hay Windows en este entorno.
- web/public/content/microservices/modulo-2.md:357 — `chcp 65001` en Windows para ver tildes en la salida de Java: no hay Windows en este entorno (la reproducción con `LANG=POSIX` y el arreglo `-Dstdout.encoding=UTF-8` sí se ejecutaron).
- docs/microservicios/08-herramientas-y-versiones.md:49 — este entorno trae Docker Compose v5.7.1; la checklist dice v5.6.1. Los laboratorios piden «v5.6.1 o posterior».
