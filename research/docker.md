# Investigación: curso Docker de cero a experto (specs/010)

Consulta: 2026-11-18. Protocolo: MASTER-PROMPT v3, sección 3. Los temarios de cursos se leyeron en
sus páginas públicas para detectar temas y orden; aquí solo se resumen con palabras propias.

## 1. Fuentes oficiales

| Fuente | Qué aporta | Verificado |
|---|---|---|
| [Docker Engine 29, notas de versión](https://docs.docker.com/engine/release-notes/29/) | Versión vigente del motor (rama 29, parche 29.9.1 del 2026-10-14) y cambios de seguridad | sí |
| [versionlog: Docker Engine 29](https://versionlog.com/docker-engine/29/) | La rama 29 salió el 2025-11-10 y cambia a containerd como almacén de imágenes por defecto en instalaciones nuevas | sí, contrastar con la doc oficial al escribir el módulo 1 |
| Docker Hardened Images (anuncio de Docker, 2026-01) | Imágenes base endurecidas, firmadas y gratuitas para todo desarrollador | sí |
| Docker Model Runner (anuncio de Docker, 2025-10) | Ejecutar modelos de IA locales como artefactos OCI con API compatible con OpenAI | sí |
| Temario DCA (Mirantis; guías de estudio) | Dominios: orquestación 25 %, imágenes y registro 20 %, instalación 15 %, redes 15 %, seguridad 15 %, almacenamiento 10 % | sí, pesos de guías secundarias; confirmar en Mirantis |
| `docs/PLAN-CURSO-DOCKER-KUBERNETES.md` | Plan interno: módulos 0–8 de Docker con evidencias por módulo | sí |

## 2. Temarios de referencia (resumen propio)

| Curso | Duración | Qué cubre | Qué le falta frente a este curso |
|---|---|---|---|
| Docker Mastery (Bret Fisher, Udemy) | 29 secciones, 225 clases, unas 23 h | Instalación por sistema, contenedores, redes y DNS, imágenes y capas, volúmenes, ENTRYPOINT y CMD, Compose, Swarm completo, registros, introducción a Kubernetes, CI con GitHub Actions (caché, multiplataforma, etiquetas, escaneo de CVE con bloqueo, pruebas, smoke test en Kubernetes), seguridad (cgroups, namespaces, USER, rootless, seccomp, distroless) y revisiones de Dockerfiles reales | Base de Linux (namespaces y cgroups antes de Docker), señales y PID 1, BuildKit avanzado, firma y SBOM, novedades 2025-2026 |
| Docker & Kubernetes: The Practical Guide (Maximilian Schwarzmüller, Udemy) | 16 secciones, 263 clases, unas 24 h | Imágenes y contenedores, datos y volúmenes, `.dockerignore`, variables y ARG, tres casos de red, app multicontenedor, Compose, contenedores utilitarios, proyecto Laravel y PHP, despliegue a EC2 y ECS, multi-stage, Kubernetes básico | Seguridad, registros privados, CI, diagnóstico y operación |
| Docker - Guía práctica (Fernando Herrera, DevTalles, Udemy, en español) | 11 secciones, 132 clases, unas 14 h | Bases, volúmenes y redes, Compose multicontenedor, Dockerfile, pruebas en el build, buildx multiarquitectura, multi-stage con targets, despliegue en registro privado, GitHub Actions con versionado semántico, nginx para SPA, introducción a Kubernetes con Minikube | Teoría de capas y caché, seguridad, observabilidad |

## 3. Comunidad (consejos que entran solo si la doc oficial los confirma)

- Fijar la versión de la imagen base en lugar de `latest`, ordenar capas para aprovechar la caché, usar
  `.dockerignore` (reduce el contexto y evita meter secretos), no correr como root y separar desarrollo y
  producción (override de Compose en vez de condicionales en el Dockerfile). Fuentes: artículos de
  dev.to, Medium, Atlassian y How-To Geek de 2025-2026. Todos coinciden con la guía oficial de buenas
  prácticas de Docker.
- No actualizar contenedores «por dentro» como si fueran máquinas virtuales: se reconstruye la imagen y
  se promueve la misma imagen entre entornos (How-To Geek).
- Errores reales recurrentes: permisos de archivos con bind mounts, `depends_on` sin healthcheck,
  conflictos de subred de Docker con la red de la empresa, PID 1 que no reenvía señales.

## 4. Huecos que el curso cubre y los cursos de referencia no

1. Linux necesario (namespaces, cgroups v2, capacidades) antes del primer `docker run`.
2. Señales, PID 1, `init` y apagado ordenado.
3. BuildKit profesional: cache mounts, secretos de build, Bake, SBOM y provenance.
4. Cadena de suministro: firma con cosign, verificación, Docker Scout y Hardened Images.
5. Desarrollo moderno: `docker init`, Compose Watch, perfiles, `include`, Dev Containers y Testcontainers.
6. Diagnóstico: `inspect`, `events`, `stats`, OOM, `docker debug` y redes con netshoot.
7. Docker y la IA: Model Runner como ejemplo de artefacto OCI no tradicional.

## 5. Decisiones

- Docker Swarm: un solo tema de criterio (cuándo basta un nodo con Compose y cuándo saltar a
  Kubernetes), no un módulo; el curso de Kubernetes cubre la orquestación.
- Proyecto integrador: RutaFlow (API, worker y base de datos), del proceso local a una imagen firmada y
  desplegada.
- Versiones fijadas al escribir cada tema y revisadas cada 120 días.
