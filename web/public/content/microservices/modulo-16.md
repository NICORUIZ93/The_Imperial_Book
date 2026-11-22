# Módulo 12 · Contenedores y orquestación

**Entorno de referencia (2026-05-22):** Docker 29.9.3, Node.js v24.18.0. Se verifican Dockerfile/Compose localmente. Kubernetes, Helm, ArgoCD, Blue-Green/Canary en cluster requieren cluster/infra; **Nota de verificación** honesta.

## Aprende construyendo

### Tema 1: Dockerfile multi-stage, distroless · Intermedio · 120 min

#### Multi-stage build

**Definición formal.** Dockerfile con múltiples etapas donde artefactos se copian desde etapas de build a una imagen final más pequeña.

**Para qué sirve.** Reduce tamaño y superficie de ataque.

**Cuándo usarlo y cuándo no.** Úsalo en builds compilados. No copies toolchains al runtime.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms16-ms && cd /tmp/ms16-ms
cat > Dockerfile << 'DOCKER'
FROM node:24-alpine AS build
WORKDIR /app
COPY app.mjs .
FROM node:24-alpine
WORKDIR /app
COPY --from=build /app/app.mjs .
CMD ["node","app.mjs"]
DOCKER
cat > app.mjs << 'JS'
console.log('ok')
JS
docker build -t ms16-ms:1 . >/dev/null && docker run --rm ms16-ms:1
```

**Caso de uso real.** Build Maven luego runtime JRE.

**Error común.** Copiar todo el contexto. Corrección: `.dockerignore`.

**Verificación (Docker 29.9.3, 2026-05-22).** Salida: `ok`.

#### Distroless

**Definición formal.** Imágenes que contienen la app y runtime, sin shell/package manager habitual.

**Para qué sirve.** Menor superficie de ataque.

**Cuándo usarlo y cuándo no.** Úsalo en producción madura. No si necesitas depurar con shell dentro (usa debug variant).

**Ejemplo mínimo enfocado (conceptual).**

```dockerfile
FROM gcr.io/distroless/java21-debian12
COPY app.jar /app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

**Caso de uso real.** Runtime Java mínimo.

**Error común.** Esperar `sh` en distroless. Corrección: imagen debug o ephemeral debug container.

**Verificación.** **Nota de verificación:** requiere imagen base y app; conceptual.

### Tema 2: Docker Compose · Básico · 90 min

#### Compose

**Definición formal.** Herramienta para definir y ejecutar apps multi-contenedor con YAML.

**Para qué sirve.** Entorno local reproducible.

**Cuándo usarlo y cuándo no.** Dev/test local. No orquestación de producción a gran escala.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p /tmp/ms16-compose && cd /tmp/ms16-compose
cat > compose.yml << 'Y'
services:
  app:
    image: node:24-alpine
    command: ["node","-e","console.log('up')"]
Y
docker compose -f compose.yml run --rm app
```

**Caso de uso real.** App + DB + Redis.

**Error común.** Depender de orden sin healthcheck. Corrección: healthchecks.

**Verificación (Docker 29.9.3, 2026-05-22).** Salida: `up`.

### Tema 3: Kubernetes: Deployments, Services, ConfigMaps, Secrets · Avanzado · 180 min

#### Deployment y Service

**Definición formal.** Deployment gestiona ReplicaSets/Pods declarativamente; Service expone Pods con una IP/DNS estable.

**Para qué sirve.** Despliegue y descubrimiento interno.

**Cuándo usarlo y cuándo no.** Úsalo en cluster K8s. No edites Pods manualmente como práctica habitual.

**Ejemplo mínimo enfocado (manifiesto).**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata: {name: app}
spec:
  replicas: 2
  selector: {matchLabels: {app: app}}
  template:
    metadata: {labels: {app: app}}
    spec:
      containers: [{name: app, image: app:1.0.0}]
```

**Caso de uso real.** 2 réplicas detrás de Service.

**Error común.** Sin requests/limits. Corrección: definir recursos.

**Verificación.** **Nota de verificación:** requiere cluster Kubernetes (`kubectl apply --dry-run=client` validable).

#### ConfigMap y Secret

**Definición formal.** ConfigMap almacena config no sensible; Secret almacena datos sensibles codificados/base64 en el objeto K8s.

**Para qué sirve.** Separar config de imagen.

**Cuándo usarlo y cuándo no.** Úsalo siempre. No metas secretos en ConfigMap ni en imagen.

**Ejemplo mínimo enfocado (ejecutable, simulación base64).**

```bash
node -e "console.log(Buffer.from('s3cr3t').toString('base64'))"
```

**Caso de uso real.** `DATABASE_URL` en Secret.

**Error común.** Creer que base64 es cifrado. Corrección: cifrado en reposo, RBAC, secret manager.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `czNjcjN0`.

### Tema 4: Readiness/Liveness Probes · Intermedio · 90 min

#### Probes

**Definición formal.** Liveness indica si el proceso debe reiniciarse; readiness indica si puede recibir tráfico.

**Para qué sirve.** Auto-recuperación y despliegues seguros.

**Cuándo usarlo y cuándo no.** Siempre en K8s. No uses liveness que dependa de dependencias externas frágiles.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
node -e "const ready=true, live=true; console.log(ready?200:503, live?200:500)"
```

**Caso de uso real.** `/healthz` y `/readyz`.

**Error común.** Liveness falla por DB down y causa restart loop. Corrección: separar liveness de readiness.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `200 200`.

### Tema 5: HPA · Intermedio · 90 min

#### Horizontal Pod Autoscaler

**Definición formal.** HPA escala el número de réplicas según métricas (CPU, custom metrics).

**Para qué sirve.** Ajustar capacidad a carga.

**Cuándo usarlo y cuándo no.** Úsalo con métricas representativas. No sin requests de CPU/métricas configuradas.

**Ejemplo mínimo enfocado (regla simulada).**

```bash
node -e "const cpu=80,target=60,replicas=2; console.log(Math.ceil(replicas*(cpu/target)))"
```

**Caso de uso real.** Escala de 2 a 3 pods.

**Error común.** Escalar por CPU cuando el cuello es DB. Corrección: métricas adecuadas.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `3`.

### Tema 6: Helm · Intermedio · 90 min

#### Helm chart

**Definición formal.** Helm es un gestor de paquetes para Kubernetes que templatiza manifiestos en charts.

**Para qué sirve.** Reutilización y parametrización.

**Cuándo usarlo y cuándo no.** Úsalo para despliegues repetibles. No abuses de templates complejos.

**Ejemplo mínimo enfocado (snippet).**

```yaml
# values.yaml
replicaCount: 2
image:
  repository: app
  tag: "1.0.0"
```

**Caso de uso real.** `helm upgrade --install`.

**Error común.** Lógica compleja en templates. Corrección: mantener charts simples.

**Verificación.** **Nota de verificación:** requiere Helm y cluster.

### Tema 7: Blue-Green y Canary · Avanzado · 120 min

#### Estrategias de despliegue

**Definición formal.** Blue-Green mantiene dos entornos y conmuta tráfico; Canary libera gradualmente a un subconjunto.

**Para qué sirve.** Reduce riesgo de release.

**Cuándo usarlo y cuándo no.** Úsalo cuando puedes observar y revertir. No sin métricas/rollback.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
node -e "function route(canaryPct,user){ return (user%100)<canaryPct?'canary':'stable'} console.log(route(10,5), route(10,15));"
```

**Caso de uso real.** 10% tráfico a v2.

**Error común.** No tener rollback automático. Corrección: métricas de error/latencia + rollback.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `canary stable`.

### Tema 8: GitOps con ArgoCD · Avanzado · 90 min

#### GitOps

**Definición formal.** Práctica donde el estado deseado se declara en Git y un controlador lo reconcilia en el cluster.

**Para qué sirve.** Auditoría, reproducibilidad y rollback por Git.

**Cuándo usarlo y cuándo no.** Úsalo con madurez K8s. No edites cluster manualmente fuera del flujo.

**Ejemplo mínimo enfocado (conceptual).**

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
spec:
  source: {repoURL: 'https://git/app', path: k8s}
  destination: {server: 'https://kubernetes.default.svc', namespace: app}
```

**Caso de uso real.** ArgoCD sincroniza manifiestos.

**Error común.** Drift manual no detectado. Corrección: sync automático/prune controlado.

**Verificación.** **Nota de verificación:** requiere ArgoCD y cluster.

## Cierre del módulo

Contenedores empaquetan, Kubernetes orquesta, y GitOps/estrategias de release controlan el cambio. La automatización sin observabilidad y límites de recursos solo acelera fallos.
