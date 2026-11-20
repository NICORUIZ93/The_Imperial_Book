# Temario propuesto · Docker

**Estado:** propuesta para aprobación del dueño. No hay lecciones escritas.
**Fecha de revisión de fuentes:** 2026-11-18.
**Identificador de ruta previsto:** `docker`.
**Reemplaza:** el temario del piloto `specs/010` (rama `archivo-docker-piloto`). Ese piloto se rechazó por datos
falsos y temas débiles. El apartado 10 explica qué cambia.

## 1. Público y prerrequisitos

Este curso es para quien ya programa y usa la terminal, y necesita empaquetar, ejecutar y entregar servicios
de forma reproducible. No presupone experiencia con contenedores.

| Prerrequisito | Módulos | Para qué |
|---|---|---|
| Fundamentos | M3 T1–T2 (red, DNS, IP, puertos y HTTP) | Publicar puertos y diagnosticar redes |
| Fundamentos | M8 T1–T3 (sistema operativo, memoria y Linux observable) | Entender procesos, señales y límites |
| Java | M0–M3 y M8 (Maven/Gradle) | Construir el JAR de RutaFlow |
| Spring Boot | M0–M2, M5 y M7 (REST, configuración y Actuator) | La API de RutaFlow que se empaqueta |

Recomendado, no obligatorio: Fundamentos M4 (SQL), por PostgreSQL en M5 y M7.

## 2. Resultado final medible

Al terminar, la persona entrega el repositorio de RutaFlow con estas evidencias:

1. La API Spring Boot de RutaFlow construida con un Dockerfile multi-stage. La imagen corre como usuario no
   root, con el sistema de archivos de solo lectura y sin capacidades extra. Su tamaño y sus capas quedan
   medidos y justificados.
2. Una imagen multiplataforma (`linux/amd64` y `linux/arm64`) publicada en un registro y referenciada por
   digest, con SBOM y provenance adjuntos y firma verificable con cosign.
3. Un `compose.yaml` con API, PostgreSQL y un worker. Lleva healthchecks, perfiles y Compose Watch, y
   arranca en limpio con un solo comando.
4. Un apagado ordenado demostrado: `docker stop` termina antes del plazo y con el código de salida esperado.
5. Un pipeline de CI que construye con caché, escanea, bloquea por vulnerabilidades críticas y promueve por
   digest.
6. Un despliegue en un servidor con Compose y un rollback a un digest anterior.
7. Un registro de diagnóstico de tres fallos provocados (red, permisos de volumen y OOM), cada uno con su
   causa y su corrección.

## 3. Versiones de referencia

| Herramienta | Versión | Fuente y fecha |
|---|---|---|
| Docker Engine | 29.x. En el Mac del dueño, 29.9.2. La última publicada es 29.10.0, del 2026-11-16 | `docs/VERSIONES.md`; [notas de versión de Engine 29](https://docs.docker.com/engine/release-notes/29/), consultadas el 2026-11-18 |
| Docker Compose | v5.x. La última es 5.7.2, del 2026-11-17 | [releases.sh: docker/compose](https://releases.sh/docker/docker-compose-releases.md), 2026-11-18. La página oficial de notas de versión no se pudo leer desde el entorno: se confirma en el Mac antes de escribir M7 |
| Java / Spring Boot | JDK 25 LTS · Spring Boot 4.1.x | `docs/VERSIONES.md` |
| Kubernetes, solo como criterio en M11 | 1.37 | `docs/VERSIONES.md` |

Datos de Engine 29 que el curso usa, todos con cita de las notas de versión:
- «containerd image store is now the default for **fresh installs**».
- «Experimental support for nftables can now be enabled by setting Docker daemon's `firewall-backend` option to `nftables`».
- «Deprecate cgroup v1».
- «daemon: raise minimum API version to v1.44».

## 4. Qué se incorpora desde otros cursos (reparto aprobado en specs/020)

| Origen | Contenido | Destino en este curso | Tratamiento |
|---|---|---|---|
| DevOps M2 T1 | Dockerfile multi-stage | M4 T1 | Se rehace sobre Spring Boot |
| DevOps M2 T2 | Capas e invalidación de caché | M3 T3 | Se conserva la práctica |
| DevOps M2 T3 | Imágenes base distroless/alpine | M4 T2 | Se amplía con Docker Hardened Images |
| DevOps M2 T4 | Volúmenes y bind mounts | M5 T2 | — |
| DevOps M2 T5 | Redes en Docker | M6 T1 | — |
| DevOps M2 T6 | Registros: Docker Hub, ECR, ACR, Harbor | M8 T1–T2 | ECR y ACR quedan como enlace al curso Cloud |
| DevOps M2 T7 | Operación diaria: inspect, stats, events y respaldo | M2 T2, M2 T5 y M5 T4 | Se reparte por tema |
| DevOps M2 T8 | Usuario no root, solo lectura y capacidades mínimas | M9 T1 | — |
| DevOps M2 T9 | Docker Desktop, Podman, Colima y Rancher Desktop | M1 T1 | — |
| DevOps M3 T1–T4 | Compose: dependencias y healthchecks, `.env`, redes y perfiles | M7 T1–T4 | — |
| DevOps M15 T1 | Docker y Compose avanzados | M4 T3–T5 y M7 T4–T5 | Se reparte. No queda un tema «avanzado» suelto |
| Cloud M1 T1–T5 | Virtualización frente a contenedores, imágenes, Docker Hub, comandos y Compose | M0 T1, M3 T3, M8 T1, M2 T1 y M7 T1 | Cloud pasa a exigir este curso como prerrequisito |
| Fundamentos M8 T4 | Contenedores: aislamiento reproducible | M0 T1–T3 | En Fundamentos queda un resumen con enlace |

**Nota sobre el origen «Fundamentos M12».** El reparto aprobado dice «Fundamentos M12: Electrónica, Web3 y
Docker». En el repositorio, `foundations/modulo-12.md` es solo Electrónica (17 temas). El tema de contenedores
de Fundamentos está en **M8 T4** (`foundations/modulo-8.md:324`), y es el que se cita aquí.

Estos temas no se mueven; se enlazan para no duplicarlos:
- Spring Boot M19 T1 (capas del JAR) y M11 T4 (Buildpacks), desde M4 T1.
- DevOps M11 T1 (escaneo), desde M8 T5.
- DevOps M14 T3 (procedencia), desde M8 T3.
- DevOps M18 (VPS), desde M12 T3.

## 5. Módulos

Duración de un tema: de 20 a 45 min, con práctica incluida. Cada tema introduce como máximo tres conceptos
nuevos, según `docs/METODOLOGIA-DE-APRENDIZAJE.md`.

### M0 · Qué es un contenedor: el Linux que hay debajo
**Objetivo:** aislar un proceso sin Docker y explicar qué añade Docker.
**Origen:** Fundamentos M8 T4 y Cloud M1 T1.
- T1 · Un contenedor es un proceso: namespaces PID, NET, MNT y UTS con `unshare` · 40 min
- T2 · Límites con cgroups v2: `memory.max` y `cpu.max` (Engine 29 depreca cgroup v1) · 40 min
- T3 · Root dentro y fuera: capacidades y namespace de usuario (Docker no lo activa si no se configura `userns-remap` o el modo rootless) · 40 min
- T4 · PID 1 y señales: un PID 1 sin manejador ignora SIGTERM, y por eso `docker stop` termina en 137 · 45 min

**Hito RutaFlow:** el JAR de RutaFlow corre aislado con `unshare` y límite de memoria, y se registra qué falta
para que sea un contenedor.
**Duración:** 2 h 45 min

### M1 · Instalación y arquitectura
**Objetivo:** instalar Docker y seguir una orden desde la CLI hasta `runc`.
**Origen:** DevOps M2 T9.
- T1 · Docker Engine, Docker Desktop y alternativas (Podman, Colima, Rancher Desktop): qué instala cada una · 35 min
- T2 · CLI, daemon, API, containerd y runc: quién hace qué · 40 min
- T3 · Almacén de imágenes de containerd, por defecto en instalaciones nuevas de Engine 29: qué cambia al migrar · 35 min
- T4 · Primer contenedor: qué ocurrió en cada capa (pull, create, start) · 35 min

**Hito RutaFlow:** queda documentado `docker version` y `docker info` del entorno de la persona.
**Duración:** 2 h 25 min

### M2 · Ciclo de vida y diagnóstico de contenedores
**Objetivo:** operar un contenedor de principio a fin y leer por qué terminó.
**Origen:** Cloud M1 T4 y DevOps M2 T7.
- T1 · `run`, `start`, `stop`, `kill` y `rm`; modos `-d` e `-it` · 40 min
- T2 · `exec`, `logs` e `inspect` con `--format` · 40 min
- T3 · Apagado ordenado: `STOPSIGNAL`, `--stop-timeout` e `--init` · 40 min
- T4 · Códigos de salida y políticas de reinicio · 35 min
- T5 · `docker events` y `docker stats` para observar sin entrar · 30 min

**Hito RutaFlow:** RutaFlow, en una imagen base de Java, se detiene en orden y deja evidencia del código de salida.
**Duración:** 3 h 05 min

### M3 · Imágenes y Dockerfile desde cero
**Objetivo:** escribir un Dockerfile correcto y explicar cada capa.
**Origen:** DevOps M2 T2 y Cloud M1 T2.
- T1 · Contexto de build y `.dockerignore`: qué se envía y qué se filtra (secretos) · 35 min
- T2 · `FROM`, `RUN`, `COPY` y `WORKDIR` · 40 min
- T3 · Capas y caché: orden de instrucciones e invalidación · 45 min
- T4 · `CMD` frente a `ENTRYPOINT`, forma exec frente a forma shell (enlaza con M0 T4) · 40 min
- T5 · `ARG`, `ENV`, etiquetas OCI, tag y digest · 40 min

**Hito RutaFlow:** primer Dockerfile de la API, con la caché medida antes y después de reordenar.
**Duración:** 3 h 20 min

### M4 · Builds profesionales con BuildKit
**Objetivo:** producir una imagen pequeña, reproducible y multiplataforma.
**Origen:** DevOps M2 T1, M2 T3 y M15 T1.
- T1 · Multi-stage para Spring Boot: etapa de build con Maven y runtime con JRE (enlaza Spring Boot M19 T1) · 45 min
- T2 · Elegir la imagen base: completa, slim, distroless y Docker Hardened Images · 40 min
- T3 · `RUN --mount=type=cache` y `--mount=type=secret` · 40 min
- T4 · `buildx` multiplataforma: amd64 y arm64 desde un Mac con Apple Silicon · 40 min
- T5 · Bake: builds declarados en HCL o desde Compose · 35 min

**Hito RutaFlow:** la imagen de producción de RutaFlow, con una tabla de tamaño, tiempo de build y número de
capas por cada decisión.
**Duración:** 3 h 20 min

### M5 · Datos y persistencia
**Objetivo:** decidir dónde viven los datos y recuperarlos.
**Origen:** DevOps M2 T4 y M2 T7.
- T1 · La capa escribible y por qué se pierde al borrar el contenedor · 30 min
- T2 · Volúmenes, bind mounts y tmpfs: cuándo usar cada uno · 40 min
- T3 · Permisos y UID en bind mounts: el error «permission denied» provocado y resuelto · 40 min
- T4 · PostgreSQL de RutaFlow en un volumen: respaldo y restauración comprobados · 45 min

**Hito RutaFlow:** queda una restauración de la base de RutaFlow verificada con una consulta.
**Duración:** 2 h 35 min

### M6 · Redes
**Objetivo:** conectar contenedores por nombre y diagnosticar fallos de red.
**Origen:** DevOps M2 T5.
- T1 · Red bridge por defecto frente a red definida por el usuario: DNS interno · 45 min
- T2 · Publicar puertos y elegir la interfaz (`-p 127.0.0.1:8080:8080`) · 40 min
- T3 · Redes `host` y `none`, y diferencias entre Docker Desktop y Linux · 35 min
- T4 · Diagnóstico: contenedor auxiliar en la red, conflictos de subred y firewall (iptables, nftables experimental) · 40 min

**Hito RutaFlow:** la API llega a PostgreSQL por nombre de servicio, y la base no queda publicada al host.
**Duración:** 2 h 40 min

### M7 · Compose para desarrollo
**Objetivo:** levantar el sistema completo con un comando y desarrollar sobre él.
**Origen:** DevOps M3 T1–T4, DevOps M15 T1 y Cloud M1 T5.
- T1 · Servicios, redes y volúmenes en `compose.yaml` · 40 min
- T2 · `healthcheck` y `depends_on` con `condition: service_healthy` · 40 min
- T3 · Variables, `.env` e interpolación; qué no debe ir en `.env` · 35 min
- T4 · Perfiles, archivos de override e `include` · 40 min
- T5 · Compose Watch (`sync`, `rebuild`, `sync+restart`; requiere Compose 2.22 o posterior) y `docker init` · 40 min
- T6 · Testcontainers en las pruebas de Spring Boot: la misma base que en Compose · 45 min

**Hito RutaFlow:** API, PostgreSQL y worker con `docker compose up`. Un cambio en el código se refleja sin
reconstruir a mano.
**Duración:** 4 h

### M8 · Registros y cadena de suministro
**Objetivo:** publicar una imagen y demostrar de dónde viene.
**Origen:** DevOps M2 T6 y Cloud M1 T3.
- T1 · Tag, manifiesto, índice multiplataforma y digest · 40 min
- T2 · Registro privado con TLS: `docker login`, push y pull · 45 min
- T3 · SBOM y provenance con las atestaciones de BuildKit · 40 min
- T4 · Firmar y verificar con cosign. Docker Content Trust se está retirando desde 2025 · 45 min
- T5 · Escaneo de vulnerabilidades y umbral de bloqueo (enlaza DevOps M11 T1) · 40 min

**Hito RutaFlow:** la imagen se publica por digest, con SBOM y firma que un tercero puede verificar.
**Duración:** 3 h 30 min

### M9 · Seguridad en ejecución
**Objetivo:** reducir lo que un contenedor comprometido puede hacer.
**Origen:** DevOps M2 T8.
- T1 · Usuario no root, `--read-only` y `--cap-drop ALL` · 45 min
- T2 · Perfiles por defecto de seccomp y AppArmor: qué bloquean · 35 min
- T3 · Modo rootless y `userns-remap`: qué protege cada uno y qué limita · 40 min
- T4 · Secretos: de build frente a ejecución, y por qué montar el socket de Docker equivale a dar root · 40 min
- T5 · Límites de memoria y CPU, OOM kill y `docker inspect` del estado · 40 min

**Hito RutaFlow:** se ejecuta RutaFlow con el perfil endurecido, y un intento de escritura bloqueado queda como evidencia.
**Duración:** 3 h 20 min

### M10 · Operación del daemon
**Objetivo:** configurar y mantener el motor en un servidor.
**Origen:** nuevo (dominio «Installation and Configuration» del DCA).
- T1 · `daemon.json`: drivers de logging y rotación · 35 min
- T2 · Acceso remoto seguro al daemon: TLS y contextos por SSH · 40 min
- T3 · Depurar imágenes mínimas: `docker debug` (si está disponible) o un contenedor auxiliar que comparte los namespaces · 40 min
- T4 · Espacio en disco: `system df`, `prune` y caché de build · 30 min

**Hito RutaFlow:** queda un servidor de práctica con logs rotados y acceso remoto por contexto SSH.
**Duración:** 2 h 25 min

### M11 · Orquestación con Swarm y criterio de orquestador
**Objetivo:** cubrir el dominio «Orchestration» del DCA (25 %) y decidir entre Compose, Swarm y Kubernetes.
**Origen:** nuevo. El piloto lo reducía a un solo tema.
- T1 · `swarm init` y `join`, managers, workers y quórum · 40 min
- T2 · Servicios replicados y globales; actualización rodante y rollback · 40 min
- T3 · Stacks: `docker stack deploy` con un archivo Compose · 40 min
- T4 · Redes overlay y routing mesh · 40 min
- T5 · Criterio: un nodo con Compose, Swarm o Kubernetes (enlaza el curso Kubernetes) · 30 min

**Hito RutaFlow:** RutaFlow corre como stack en un swarm de tres nodos locales, y se documenta la decisión de orquestador.
**Duración:** 3 h 10 min

### M12 · CI/CD y despliegue
**Objetivo:** construir, verificar y desplegar sin pasos manuales.
**Origen:** nuevo; enlaza DevOps M4–M5.
- T1 · GitHub Actions: build con caché y multiplataforma · 45 min
- T2 · Etiquetas semánticas y promoción del mismo digest entre entornos · 40 min
- T3 · Desplegar en un servidor con Compose (enlaza DevOps M18) · 45 min
- T4 · Smoke test y rollback a un digest anterior · 35 min

**Hito RutaFlow:** un push a `main` publica la imagen y la despliega; un fallo provocado dispara el rollback.
**Duración:** 2 h 45 min

### M13 · Proyecto integrador
**Objetivo:** reunir las siete evidencias del apartado 2 en el repositorio de RutaFlow.
- T1 · Hito 1: imagen endurecida y medida (M3, M4 y M9) · 45 min
- T2 · Hito 2: Compose de desarrollo con Watch y pruebas con Testcontainers (M7) · 45 min
- T3 · Hito 3: publicación firmada con SBOM y escaneo (M8) · 45 min
- T4 · Hito 4: despliegue, rollback y registro de tres fallos diagnosticados (M5, M6, M9 y M12) · 45 min

Trabajo autónomo del proyecto: 8 h.
**Duración:** 3 h de temas + 8 h de proyecto.

## 6. Proyecto integrador sobre RutaFlow

El backend de referencia es la API Spring Boot de RutaFlow (`specs/020`, R5), con PostgreSQL y un worker
de asignación. El curso no escribe lógica de negocio nueva: parte de un JAR de RutaFlow y lo hace avanzar
módulo a módulo, con un hito por módulo. Rúbrica: las siete evidencias del apartado 2. Cada una se demuestra con
un comando y su salida, y la solución de referencia va plegada.

## 7. Horas estimadas

Fórmula: suma de las duraciones de los temas más las horas de proyecto. Total: **42 h 20 min de temas + 8 h de proyecto = 50 h 20 min (≈ 50 h)**.

## 8. Cobertura frente a fuentes primarias

**Docker Certified Associate (Mirantis).** El examen se sigue ofreciendo: 55 preguntas, 90 min y USD 199.
Su guía de estudio vigente es la v1.5 de enero de 2025
([página del examen](https://training.mirantis.com/dca-certification-exam/),
[guía v1.5](https://a.storyblok.com/f/146871/x/2001ce939c/docker-study-guide_v1-5-jan-2025.pdf)).

| Dominio DCA | Peso | Dónde se cubre | Qué no se cubre y por qué |
|---|---:|---|---|
| Orchestration | 25 % | M11 completo. Objetivos de Kubernetes: curso Kubernetes M1, M2 y M4 | — |
| Image Creation, Management, and Registry | 20 % | M3, M4 y M8 | La firma con Docker Content Trust: Docker la está retirando ([blog, 2025-07-29](https://www.docker.com/blog/retiring-docker-content-trust/)). Se enseña cosign |
| Installation and Configuration | 15 % | M1, M10 y M0 (namespaces y cgroups) | UCP y DTR: productos empresariales de Mirantis, sin laboratorio gratuito |
| Networking | 15 % | M6 y M11 T4 | Balanceo L7 de Docker EE (UCP) |
| Security | 15 % | M8 y M9 | RBAC y LDAP de UCP |
| Storage and Volumes | 10 % | M5. Objetivos de Kubernetes: curso Kubernetes M6 | devicemapper: se retiró en Engine v25.0 ([deprecated features](https://docs.docker.com/engine/deprecated/)) |

Quien quiera presentar el DCA necesita repasar por su cuenta UCP, DTR y DCT con la guía de Mirantis. El curso lo
advierte en M0.

**Documentación oficial de Docker.** El curso sigue los manuales de docs.docker.com:
- Engine (instalación, almacenamiento, redes, seguridad, rootless y daemon): M1, M5, M6, M9 y M10.
- Build (BuildKit, multi-stage, caché, secretos, multiplataforma, Bake y atestaciones): M3, M4 y M8. Fuentes:
  [Bake](https://docs.docker.com/build/bake/) y las notas de Engine 29.
- Compose (Watch, perfiles e `include`): M7. Fuente: [Compose Watch](https://docs.docker.com/compose/how-tos/file-watch/).
- Docker Hardened Images: M4 T2. Son gratuitas con licencia Apache 2.0 desde el 2025-12-17
  ([blog de Docker](https://www.docker.com/blog/docker-hardened-images-for-every-developer/)).

## 9. Fuera de alcance, con motivo

- **Docker Model Runner:** se enseña en el curso IA aplicada al desarrollo (M9), donde se usa. Aquí no aporta
  un mecanismo nuevo de contenedores.
- **ECR, ECS y ACR:** se quedan en el curso Cloud, con enlace.
- **Kubernetes:** tiene su propio curso. Aquí solo entra como criterio de decisión (M11 T5).

## 10. Por qué este temario es más sólido que el piloto (specs/010)

| Problema del piloto | Cambio en esta propuesta |
|---|---|
| Datos falsos en M0: el bit 31 como `setpcap` (es `CAP_SETFCAP`), «todo contenedor usa namespace USER», omitir que un PID 1 sin manejador ignora SIGTERM (revisión `research/revisiones/docker-modulo-0.md`, rama `archivo-docker-piloto`) | M0 T3 y T4 se construyen sobre esos tres hechos corregidos. Ningún dato entra a una lección sin ejecución o cita (regla de `CLAUDE.md`) |
| Pesos del DCA tomados de guías secundarias, «confirmar en Mirantis» | Pesos y objetivos tomados de la guía oficial v1.5, con lo obsoleto señalado (apartado 8) |
| Swarm reducido a un tema, aunque es el 25 % del DCA | M11 completo |
| Sin reparto: duplicaba DevOps, Cloud, Node y Spring | Tabla de origen tema por tema (apartado 4). Lo que no se mueve se enlaza |
| Temas compuestos («Builds profesionales» con seis ideas en un tema) | Cada tema tiene como máximo tres conceptos nuevos y dura de 30 a 45 min |
| Proyecto genérico | Evidencias medibles sobre el backend Spring Boot de RutaFlow |
| Model Runner como cierre del curso | Pasa al curso de IA, donde tiene uso real |

## 11. Pendientes de verificar antes de escribir

- La versión de Compose en la fuente oficial y en el Mac del dueño (specs/019).
- En qué ediciones está disponible `docker debug`. La referencia oficial no lo dice; M10 T3 trae la alternativa
  con un contenedor auxiliar.
- Los perfiles por defecto de AppArmor en Docker Desktop para Mac (M9 T2), que se ejecutarán en Linux.

## Fuentes consultadas (2026-11-18)

- https://docs.docker.com/engine/release-notes/29/
- https://docs.docker.com/engine/deprecated/
- https://docs.docker.com/compose/how-tos/file-watch/
- https://docs.docker.com/build/bake/
- https://docs.docker.com/reference/cli/docker/debug/
- https://docs.docker.com/ai/model-runner/
- https://www.docker.com/blog/retiring-docker-content-trust/
- https://www.docker.com/blog/docker-hardened-images-for-every-developer/
- https://training.mirantis.com/dca-certification-exam/
- https://a.storyblok.com/f/146871/x/2001ce939c/docker-study-guide_v1-5-jan-2025.pdf
- https://releases.sh/docker/docker-compose-releases.md (fuente secundaria)
