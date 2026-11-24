# Módulo 23 · Entrega continua de Tienda Aurora

Un microservicio no termina cuando compila: termina cuando se despliega, escala, se observa y se revierte sin drama. Este módulo cubre Docker, Kubernetes, HPA/Helm/despliegues progresivos, GitOps y decisiones de runtime Java para contenedores, usando Tienda Aurora como proyecto integrador.

**Entorno de referencia verificado (2026-11-22):** JDK 27.0.1.0.2, Gradle 9.8.2, Docker 29.9.3. Los smokes validan Dockerfiles/manifiestos/decisiones con Java y Node. Kubernetes, ArgoCD, Native Image y CRaC reales requieren cluster/toolchain; se incluyen notas de verificación honestas.

## Proyecto desde cero: tienda-aurora-deploy

### Prerrequisitos

```bash
java -version    # JDK 25+
gradle --version # Gradle 9.x
docker --version  # Docker 24+
```

### Estructura del proyecto

```text
tienda-aurora-deploy/
├── build.gradle.kts
├── settings.gradle.kts
├── Dockerfile
├── .dockerignore
├── docker-compose.yml
├── k8s/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── hpa.yaml
├── catalog-service/
│   ├── build.gradle.kts
│   └── src/main/java/com/aurora/catalog/
│       └── CatalogApplication.java
└── orders-service/
    ├── build.gradle.kts
    └── src/main/java/com/aurora/orders/
        └── OrdersApplication.java
```

### build.gradle.kts (raíz)

```kotlin
plugins {
    java
    id("org.springframework.boot") version "3.5.0" apply false
    id("io.spring.dependency-management") version "1.1.7" apply false
}

subprojects {
    apply(plugin = "java")
    java { toolchain { languageVersion = JavaLanguageVersion.of(25) } }
    repositories { mavenCentral() }
    dependencies {
        implementation("org.springframework.boot:spring-boot-starter-web")
        implementation("org.springframework.boot:spring-boot-starter-actuator")
        testImplementation("org.springframework.boot:spring-boot-starter-test")
    }
}

tasks.test {
    useJUnitPlatform()
}
```

### settings.gradle.kts

```kotlin
rootProject.name = "tienda-aurora-deploy"
include("catalog-service", "orders-service")
```

### Dockerfile

```dockerfile
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app
COPY . .
RUN ./gradlew bootJar -x test

FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
RUN useradd -r -u 1000 appuser
USER 1000
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

### .dockerignore

```text
build/
.git/
.idea/
*.log
```

### docker-compose.yml

```yaml
services:
  catalog-service:
    build: .
    ports:
      - "8081:8080"
    environment:
      SPRING_PROFILES_ACTIVE: prod
  orders-service:
    build: .
    ports:
      - "8082:8080"
    environment:
      SPRING_PROFILES_ACTIVE: prod
```

### Tema 1: Dockerfile multi-stage y runtime Java · Intermedio · 120 min

## Docker multi-stage: de imagen de 1.2GB a 220MB

El equipo empaqueta `catalog-service` con una imagen que contiene JDK, Maven, código fuente, cache y la app. La imagen pesa 1.2 GB, tarda minutos en subir y además corre como root. Un scanner de seguridad reporta vulnerabilidades que no tienen nada que ver con la app, sino con herramientas de build que nunca debieron llegar a producción.

El multi-stage build es como cocinar en la cocina y servir en el comedor. En la cocina necesitas ollas, cuchillos y harina por todos lados; en el comedor solo llega el plato. El JDK y Gradle son la cocina; el JRE y el JAR son el plato.

El error más común es correr como root. El síntoma es mayor superficie de ataque. La causa es imagen sin `USER`. La corrección es usuario no root, imagen mínima. La señal observable es scanner/policy falla.

### Tema 2: Kubernetes Deployments, Services, ConfigMaps, Secrets, probes · Avanzado · 150 min

## Kubernetes: probes y recursos

`orders-service` se despliega en Kubernetes. Arranca, pero tarda 30 segundos en cargar caches. Kubernetes manda tráfico a los 5 segundos porque no hay readiness probe. Los primeros usuarios reciben 500. Otro día, la base de datos se cae y la liveness probe depende de DB: Kubernetes reinicia todos los pods, empeorando la caída.

Kubernetes es el gerente de turno: necesita saber si el empleado llegó (started), si puede atender clientes (ready) y si está colapsado (live). Si confundes estas señales, le das instrucciones equivocadas al gerente.

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: orders-api }
spec:
  replicas: 2
  selector: { matchLabels: { app: orders-api } }
  template:
    metadata: { labels: { app: orders-api } }
    spec:
      containers:
        - name: api
          image: ghcr.io/acme/orders-api:1.0.0
          ports: [{ containerPort: 8080 }]
          readinessProbe:
            httpGet: { path: /actuator/health/readiness, port: 8080 }
          livenessProbe:
            httpGet: { path: /actuator/health/liveness, port: 8080 }
          resources:
            requests: { cpu: "100m", memory: "256Mi" }
            limits: { cpu: "500m", memory: "512Mi" }
```

```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata: { name: orders-api }
spec:
  selector: { app: orders-api }
  ports: [{ port: 80, targetPort: 8080 }]
```

El error más común es liveness depende de DB. El síntoma son reinicios en cascada. La causa es probe mal diseñado. La corrección es liveness local, readiness por dependencias, startup para arranque lento.

### Tema 3: HPA, Helm y despliegues progresivos · Avanzado · 120 min

## HPA, Helm y despliegues progresivos

En Black Friday, `catalog-service` recibe 10x tráfico. Tiene 2 réplicas fijas y se satura. Otro día, un deploy nuevo tiene un bug y el rollout 100% tumba el catálogo. Escalar manualmente y desplegar "big bang" es operar a ciegas.

HPA es el termostato: mide carga y ajusta. Helm es el paquete parametrizable. Canary es abrir la puerta nueva solo al 10% antes de dejar pasar a todos.

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: { name: orders-api }
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: orders-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target: { type: Utilization, averageUtilization: 70 }
```

El error más común es canary sin métricas. El síntoma es versión mala avanza. La causa es no hay gates. La corrección es definir SLO, comparar canary vs baseline, rollback automático.

### Tema 4: GitOps con ArgoCD · Avanzado · 120 min

## GitOps con ArgoCD

Alguien arregla un incidente con `kubectl edit` en producción. Funciona. Dos semanas después, otro deploy pisa el cambio y el incidente vuelve. Nadie sabe qué estaba diferente porque Git no refleja la realidad.

GitOps es tratar la infraestructura como código con reconciliación continua. Git es la fuente de verdad; el cluster es una copia que debe converger. Si alguien cambia el cluster a mano, el reconciliador lo marca como drift.

```java
public class GitOpsExample {
    public static void main(String[] args) {
        Map<String, Object> desired = Map.of("image", "orders:1.0.0", "replicas", 2);
        Map<String, Object> actual = Map.of("image", "orders:0.9.0", "replicas", 2);
        System.out.println("drift=" + !desired.get("image").equals(actual.get("image")));
    }
}
```

```bash
javac GitOpsExample.java
java GitOpsExample
```

Salida esperada:

```text
drift=true
```

El error más común es drift manual. El síntoma es Git no refleja cluster. La causa es `kubectl apply/edit` ad hoc. La corrección es PR, review, reconciliación, auditoría.

### Tema 5: GraalVM Native Image, CRaC y JVM tuning para contenedores · Avanzado · 120 min

## Runtime Java: Native Image, CRaC y JVM tuning

`catalog-service` escala a 30 réplicas en picos. Cada pod tarda 8 segundos en estar listo. El equipo lee "usa Native Image" y lo aplica sin medir: el arranque mejora, pero un endpoint falla por reflexión no registrada y el throughput baja en carga sostenida.

Elegir runtime es elegir vehículo. Un auto deportivo arranca rápido (native), pero no lleva la misma carga ni se repara igual que un camión. La JVM caliente puede rendir mejor en viajes largos. CRaC es como dejar el motor precalentado y guardado para arrancar más rápido, pero solo si el taller controla el procedimiento.

```java
public class RuntimeChoiceExample {
    static String choose(int coldStartMs, boolean dynamicReflection, boolean canCheckpoint) {
        if (coldStartMs <= 500) return "JVM_TUNED";
        if (!dynamicReflection) return "NATIVE_IMAGE";
        if (canCheckpoint) return "CRAC";
        return "JVM_TUNED_AOT";
    }

    public static void main(String[] args) {
        System.out.println("measured-compatible=" + choose(200, true, false));
        System.out.println("heavy-reflection=" + choose(8000, false, false));
        System.out.println("checkpoint-possible=" + choose(8000, true, true));
    }
}
```

```bash
javac RuntimeChoiceExample.java
java RuntimeChoiceExample
```

Salida esperada:

```text
measured-compatible=JVM_TUNED
heavy-reflection=NATIVE_IMAGE
checkpoint-possible=CRAC
```

El error más común es ir a native sin medir. El síntoma es endpoint falla o p99 empeora. La causa es reflexión/metadata o perfil de ejecución distinto. La corrección es pruebas sobre native, tracing agent/hints, benchmark comparativo.

**Nota de verificación:** no se ejecutó build native, CRaC ni Kubernetes real. Verificación propuesta: `./gradlew nativeCompile`, benchmark de arranque/RSS/p99 y prueba de restore CRaC.

## Cierre

Entregar software en microservicios es ingeniería de producción: imágenes pequeñas, despliegues declarativos, probes correctos, escalado con métricas, reconciliación GitOps y runtime elegido por evidencia. Una buena entrega hace que el cambio sea aburrido. Tienda Aurora se despliega con Gradle, imagen multi-stage, K8s con probes y GitOps con ArgoCD.

## Checklist

- Imagen multi-stage, no root, sin secretos.
- Probes y requests/limits definidos.
- HPA/canary con métricas y rollback.
- Git como fuente de verdad; drift visible.
- Runtime elegido por medición, con nota honesta si no se ejecutó.
