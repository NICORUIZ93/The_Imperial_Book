# Laboratorio · Módulo 12 · Docker, Kubernetes y despliegue

Lección: [`web/public/content/microservices/modulo-16.md`](../../../web/public/content/microservices/modulo-16.md)
(Fase 1, specs/018). Una sola aplicación (`app/`, el servicio «catalogo») recorre las 8 fichas; cada ficha tiene su
prueba en `pruebas/fNNN-*.sh`.

| Ficha | Archivos | Prueba |
|---|---|---|
| F081 Dockerfile multi-stage, distroless | `app/Dockerfile`, `app/Dockerfile.ingenuo`, `app/.dockerignore` | `pruebas/f081-imagen.sh` |
| F082 Docker Compose | `docker-compose.yml`, `compose/` | `pruebas/f082-compose.sh` |
| F083 Kubernetes: Deployments, Services, ConfigMaps, Secrets | `kind/cluster.yaml`, `k8s/base/` | `pruebas/f083-objetos.sh` |
| F084 Readiness/Liveness Probes | `k8s/base/deployment.yaml`, `app/.../DisponibilidadController.java` | `pruebas/f084-probes.sh` |
| F085 HPA | `k8s/hpa/` (+ metrics-server v0.9.0) | `pruebas/f085-hpa.sh` |
| F086 Helm | `charts/catalogo/` | `pruebas/f086-helm.sh` |
| F087 Blue-Green y Canary | `k8s/despliegues/` | `pruebas/f087-despliegues.sh` |
| F088 GitOps con Argo CD | `argocd/` (Argo CD v3.5.6) | `pruebas/f088-argocd.sh` |

Tests de la aplicación sin Docker ni clúster: `(cd app && ./gradlew test)` (5 tests en `CatalogoTest`; el build de Gradle vive en `app/`, que es el
contexto de `docker build`).

## Versiones

JDK 25 LTS · Spring Boot 4.1.3 · `eclipse-temurin:25-jdk` con el wrapper de Gradle 9.9.2 (compilación) ·
`gcr.io/distroless/java25-debian13:nonroot` (ejecución) · `nginx:1.30.6-alpine` · kind v0.33.0 con
`kindest/node:v1.37.0@sha256:a1ed56cf…` · kubectl 1.37 · metrics-server v0.9.0 · Helm 4.3.1 · Argo CD v3.5.6 ·
`busybox:1.37.0`.

## Requisitos

Docker Desktop con 6 GB de RAM o más y, en macOS, `brew install kind kubectl helm`.

## Ejecutar

```bash
cd examples/microservicios/modulo-16
./verificar.sh              # todo (15–25 min la primera vez) y al final borra el clúster
./verificar.sh --conservar  # deja el clúster academia-m12 para ejecutar las pruebas una a una
```

Termina con `RESULTADO: OK · Módulo 12 (Docker, Kubernetes y despliegue) verificado`. Si un paso falla, el guion
sigue y al final lista los pasos con ✘. Toda la salida queda en `logs/verificar-<fecha>.log`. Si falta kind, kubectl
o helm, las fichas que los necesitan se marcan como fallidas al instante (sin esperar timeouts).

Borrar el clúster a mano: `kind delete cluster --name academia-m12`.

## Estado de verificación

Ver [`verificacion/microservicios/pendiente.md`](../../../verificacion/microservicios/pendiente.md). Aquí se
validaron los manifiestos de `k8s/` contra Kubernetes 1.37 (`kubernetes-validate --strict`), `docker compose config`,
los guiones con `shellcheck` y `SondaSalud` con JDK 25.0.5; faltan Maven Central, Docker Hub, kind, Helm y Argo CD.

## Build: Gradle (equivalencia con Maven)

Este laboratorio se construye con Gradle 9.9.2 (Kotlin DSL) por el wrapper (`app/gradlew`); las versiones están en el
catálogo `gradle/libs.versions.toml`. Hasta el 2026-11-20 usaba Maven: `./mvnw test` → `./gradlew test` ·
`./mvnw -pl <carpeta> test` → `./gradlew :<carpeta>:test` · `./mvnw package -DskipTests` → `./gradlew bootJar` ·
`./mvnw spring-boot:run` → `./gradlew bootRun` · `target/` → `build/` · `pom.xml` → `build.gradle.kts`.
