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

### Tema 5: GraalVM Native Image, CRaC y JVM tuning para contenedores · Avanzado · 120 min

Caso guía: un servicio Spring Boot en Kubernetes escala de 1 a 30 réplicas ante picos. El cold start de 8s causa timeouts de readiness. Debes elegir entre JVM optimizada, Native Image o CRaC, con evidencia.

#### Definición formal

- **GraalVM Native Image:** compilación ahead-of-time a binario nativo para una plataforma. Reduce arranque y, a menudo, RSS inicial; impone restricciones de reflexión, recursos, proxies, JNI y carga dinámica.
- **CRaC (Coordinated Restore at Checkpoint):** checkpoint del estado de un proceso JVM y restore posterior. Reduce arranque al restaurar estado ya calentado; requiere coordinación de recursos (sockets, archivos, DB connections, threads).
- **JVM tuning en contenedores:** configuración de memoria y GC acorde a límites cgroup: `-XX:MaxRAMPercentage`, selección G1GC/ZGC según objetivo, sizing de metaspace, threads y pools.

#### Contrato / internals

- **Native:** build cierra el universo de clases alcanzables; Spring AOT genera hints. El binario resultante no es “JVM igual más rápido”; es otro artefacto con perfil operativo distinto.
- **CRaC:** checkpoint solo es seguro si la app libera/reabre recursos externos correctamente. Restore antes de aceptar tráfico debe validar conexiones/estado.
- **JVM tuning:** el contenedor puede tener límite de 512MiB; la JVM debe respetarlo. `MaxRAMPercentage` evita defaults inadecuados. GC tuning impacta latencia y throughput.
- **Métrica mínima:** medir arranque, RSS, p95/p99, throughput, tasa de error y costo de build/operación.

#### Cuándo usarlo / cuándo no

**Native Image:** úsalo cuando cold start/RSS dominan y el stack es compatible. **No** si hay reflexión dinámica crítica no controlada o el costo de mantenimiento de hints supera el beneficio.

**CRaC:** úsalo cuando controlas el entorno de checkpoint/restore y puedes gestionar ciclo de vida de recursos. **No** en entornos donde no puedes garantizar restore seguro.

**JVM tuning:** úsalo siempre en contenedores. **No** copies flags sin medir; un tuning para throughput puede empeorar p99.

#### Ejemplo mínimo ejecutable

Smoke de decisión de estrategia por objetivo medible:

Crea el archivo `RuntimeChoice.java`:

```java
public class RuntimeChoice {
  static String choose(int coldStartMs, boolean dynamicReflection, boolean canCheckpoint) {
    if (coldStartMs <= 500) return "JVM_TUNED";
    if (!dynamicReflection) return "NATIVE_IMAGE";
    if (canCheckpoint) return "CRAC";
    return "JVM_TUNED_AOT";
  }

  public static void main(String[] args) {
    System.out.println(choose(200, true, false));
    System.out.println(choose(8000, false, false));
    System.out.println(choose(8000, true, true));
  }
}
```

```bash
javac RuntimeChoice.java
java RuntimeChoice
```

Salida esperada:

```text
JVM_TUNED
NATIVE_IMAGE
CRAC
```

Smoke de configuración de memoria para contenedor (cálculo simple):

Crea el archivo `HeapBudget.java`:

```java
public class HeapBudget {
  static int heapMb(int containerMb, int percent) {
    return containerMb * percent / 100;
  }
  public static void main(String[] args) {
    System.out.println(heapMb(512, 75));
  }
}
```

```bash
javac HeapBudget.java
java HeapBudget
```

Salida esperada:

```text
384
```

#### Caso real

Antes de pasar a native, el equipo ajusta `MaxRAMPercentage=75`, G1GC y warmup, reduciendo cold start a 3s. Para un servicio con autoscaling extremo y dependencias compatibles, native baja a sub-segundo. CRaC se evalúa en entorno controlado con hooks para cerrar/reabrir conexiones.

#### Error común

**Síntoma.** binario native arranca rápido pero falla en endpoint específico. **Causa.** reflexión/recurso no incluido en metadata. **Corrección.** ejecutar tests sobre native, usar tracing agent/hints y CI que compile native. **Señal observable.** `MissingReflectionRegistrationError` o 500 solo en native.

**Síntoma.** pod OOMKilled en Kubernetes. **Causa.** JVM sin límite relativo al contenedor o percent alto. **Corrección.** `MaxRAMPercentage`, límites de memoria y profiling. **Señal observable.** `OOMKilled`, restart count creciente.

#### Verificación

Smokes Java ejecutados localmente (2026-05-22, JDK 27.0.1.0.2): `JVM_TUNED`, `NATIVE_IMAGE`, `CRAC`, `384`.

**Nota de verificación:** no se ejecutó build native, CRaC checkpoint/restore ni despliegue Kubernetes en esta sesión. Verificación real propuesta:

```bash
# Native
./mvnw -Pnative -DskipTests native:compile
./target/app

# JVM en contenedor
java -XX:MaxRAMPercentage=75.0 -jar app.jar
```

Resultado esperado: comparar arranque, RSS, p95/p99 y tasa de error entre JVM y native; validar que CRaC restaura conexiones correctamente antes de recibir tráfico.

## Cierre

Entrega segura es parte del diseño: imagen reproducible, probes, escalado, rollout progresivo y GitOps. La estrategia de runtime se elige por medición, no por moda.

## Checklist

- Dockerfile multi-stage, no root.
- Readiness/liveness correctas.
- HPA/rollout con métricas.
- Git sin drift.
- Runtime elegido con métricas de arranque, RSS, p95 y compatibilidad.
