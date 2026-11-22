# Módulo 12 · Contenedores, Kubernetes y entrega continua

Un microservicio Spring se entrega como artefacto desplegable y observable. Este módulo cubre Docker, Kubernetes, probes, HPA, Helm, despliegues progresivos y GitOps.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2, Docker 29.9.3. Se validan Dockerfile/manifiestos/workflow con checks ejecutables. K8s/ArgoCD reales requieren cluster; **Nota de verificación**.

## Aprende construyendo

### Tema 1: Dockerfile multi-stage y runtime Java · Intermedio · 120 min

Caso guía: empaquetar Spring Boot con JRE mínimo.

#### Docker multi-stage

**Definición formal.** Multi-stage separa build y runtime; la imagen final contiene solo lo necesario.

**Cuándo usarlo / cuándo no.** Siempre en servicios Java. No uses imagen con toolchain completo en runtime.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm12-docker
cd sm12-docker
```

Crea el archivo `Dockerfile`:

```dockerfile
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY . .
RUN ./mvnw -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/app.jar app.jar
USER 1000
ENTRYPOINT ["java","-jar","app.jar"]
```

```bash
node -e "const fs=require('fs');const d=fs.readFileSync('Dockerfile','utf8');console.log(d.includes('AS build'));console.log(d.includes('jre'))"
```

**Error común.** Ejecutar como root.

**Síntoma.** mayor superficie de ataque. **Causa.** imagen sin usuario no root. **Corrección.** `USER` no root, imagen mínima. **Señal observable.** scanner/policy falla.

**Verificación (Node 24.18.0 para check, 2026-05-22).** Salida: `true`, `true`. **Nota de verificación:** build Docker no ejecutado.

### Tema 2: Kubernetes Deployments, Services, ConfigMaps, Secrets, probes · Avanzado · 150 min

Caso guía: desplegar orders-api con readiness/liveness.

#### Objetos K8s

**Definición formal.** Deployment gestiona réplicas; Service red estable; ConfigMap/Secret config; probes salud.

**Cuándo usarlo / cuándo no.** Úsalo con orquestación. No omitas probes/resources.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm12-k8s
cd sm12-k8s
```

Crea el archivo `deploy.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata: {name: orders-api}
spec:
  replicas: 2
  selector: {matchLabels: {app: orders-api}}
  template:
    metadata: {labels: {app: orders-api}}
    spec:
      containers:
        - name: api
          image: ghcr.io/acme/orders-api:1.0.0
          readinessProbe: {httpGet: {path: /actuator/health/readiness, port: 8080}}
          livenessProbe: {httpGet: {path: /actuator/health/liveness, port: 8080}}
```

```bash
node -e "const fs=require('fs');const y=fs.readFileSync('deploy.yaml','utf8');console.log(y.includes('readinessProbe'));console.log(y.includes('livenessProbe'))"
```

**Error común.** Liveness depende de DB.

**Síntoma.** reinicios en cascada. **Causa.** probe mal diseñado. **Corrección.** liveness local, readiness por dependencias. **Señal observable.** restart count sube.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `true`, `true`.

### Tema 3: HPA, Helm y despliegues progresivos · Avanzado · 120 min

Caso guía: escalar y liberar canary.

#### HPA y rollout

**Definición formal.** HPA escala réplicas por métricas. Helm empaqueta manifests. Blue/green y canary reducen riesgo.

**Cuándo usarlo / cuándo no.** HPA para stateless; canary con métricas y rollback.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm12-hpa
cd sm12-hpa
```

Crea el archivo `hpa.yaml`:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: {name: orders-api}
spec:
  minReplicas: 2
  maxReplicas: 10
```

```bash
node -e "const fs=require('fs');const y=fs.readFileSync('hpa.yaml','utf8');console.log(y.includes('minReplicas: 2'));console.log(y.includes('maxReplicas: 10'))"
```

**Error común.** Canary sin métricas.

**Síntoma.** versión mala avanza. **Causa.** no hay gates. **Corrección.** SLO gates y rollback. **Señal observable.** 5xx sube en canary.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `true`, `true`.

### Tema 4: GitOps con ArgoCD · Avanzado · 120 min

Caso guía: Git como fuente de verdad.

#### GitOps

**Definición formal.** GitOps reconcilia estado deseado en Git con el cluster.

**Cuándo usarlo / cuándo no.** Úsalo con disciplina declarativa. No hagas hotfix manual sin reconciliar.

**Ejemplo mínimo enfocado (ejecutable).**

```bash
mkdir -p sm12-gitops
cd sm12-gitops
```

Crea el archivo `desired.json`:

```json
{"image":"orders:1.0.0","replicas":2}
```

Crea el archivo `check.mjs`:

```js
import fs from 'node:fs';
const desired=JSON.parse(fs.readFileSync('desired.json','utf8'));
const actual={image:'orders:0.9.0',replicas:2};
console.log(desired.image===actual.image);
```

```bash
node check.mjs
```

**Error común.** Drift manual.

**Síntoma.** Git no refleja cluster. **Causa.** kubectl ad hoc. **Corrección.** PR + reconciliación. **Señal observable.** OutOfSync.

**Verificación (Node 24.18.0, 2026-05-22).** Salida: `false`.

## Cierre

Entrega segura es parte del diseño: imagen reproducible, probes, escalado, rollout progresivo y GitOps.

## Checklist

- Dockerfile multi-stage, no root.
- Readiness/liveness correctas.
- HPA/rollout con métricas.
- Git sin drift.
