# Módulo 17: Empaquetado y despliegue

Empaquetar un servicio Spring Boot para producción no es solo generar un JAR. Debes decidir formato de artefacto, estrategia de arranque, configuración por entorno, secretos, sondas de salud y compatibilidad operativa. Este módulo cubre las opciones reales con trade-offs medibles.

**Entorno de referencia verificado (2026-05-22):** JDK 27.0.1.0.2, Maven 3.10.0, Docker 29.9.3, Spring Boot 3.5.0.

## Aprende construyendo

### Tema 1: Fat JAR vs capas de Docker · Intermedio · 45 min

Caso guía: el mismo servicio se despliega 20 veces al día; cada build Docker tarda demasiado porque invalida capas por copiar un JAR monolítico.

#### Definición formal

Un **fat/uber JAR** de Spring Boot contiene la aplicación y sus dependencias en un solo artefacto ejecutable. El empaquetado por **capas** separa dependencias, loader, recursos y clases de aplicación para que un Dockerfile/Buildpack reutilice capas que cambian poco.

#### Contrato / internals

- `spring-boot-maven-plugin` genera el JAR ejecutable.
- `layertools` permite extraer capas: `dependencies`, `spring-boot-loader`, `snapshot-dependencies`, `application`.
- Contrato operativo: la capa de dependencias cambia menos que la de código; ponerla antes en Docker mejora cache.
- Límite: la ganancia depende de estabilidad de dependencias y orden de capas.

#### Cuándo usarlo / cuándo no

**Úsalo** cuando despliegas frecuentemente en contenedores. **No lo sobreoptimices** si el despliegue es esporádico o el tiempo dominante está en tests/CI externos.

#### Regla práctica

Ordena las capas del Dockerfile de la más estable a la menos estable: dependencias primero (cambian poco), código de aplicación al final (cambia en cada commit). Un `COPY target/app.jar` monolítico invalida toda la imagen con cualquier cambio de una línea; las capas solo ayudan si el Dockerfile realmente las copia por separado y en ese orden.

#### Ejemplo mínimo ejecutable

Crea el archivo `App.java`:

```java
public class App {
  public static void main(String[] args) {
    System.out.println("layers=dependencies,loader,app");
  }
}
```

Comandos:

```bash
javac App.java
java App
```

Salida esperada:

```text
layers=dependencies,loader,app
```

Para un proyecto Spring Boot real:

```bash
mvn -q -DskipTests package
java -Djarmode=tools -jar target/app.jar extract --layers --destination target/layers
ls target/layers
```

#### Caso real

En CI, copiar primero dependencias y luego código hace que un cambio en un controlador no invalide la capa de dependencias Maven.

#### Error común

**Síntoma.** Cada build Docker descarga/reconstruye todo. **Causa.** `COPY target/app.jar /app.jar` en una sola capa. **Corrección.** extraer capas y ordenarlas por estabilidad. **Señal observable.** logs de Docker muestran cache miss en capa de dependencias ante cambios mínimos.

#### Verificación

Ejecutado el ejemplo mínimo Java en JDK local (esperado: `layers=dependencies,loader,app`). **Nota de verificación:** la extracción `layertools` requiere un JAR Spring Boot empaquetado; se verificó la forma del comando, no se construyó un proyecto Boot completo en este paso.

### Tema 2: GraalVM native image · Avanzado · 60 min

Caso guía: una función o servicio en Kubernetes necesita arrancar en milisegundos y reducir RSS, pero usa reflexión y librerías que pueden no ser compatibles.

#### Definición formal

GraalVM Native Image compila una aplicación Java ahead-of-time a un ejecutable nativo específico de plataforma. Elimina la JVM tradicional en runtime, pero exige alcanzar un conjunto cerrado de clases/reflexión/recursos en build time.

#### Contrato / internals

- Entrada: bytecode + configuración de reachability (reflexión, recursos, proxies, JNI).
- Spring Boot soporta AOT processing para generar hints/metadatos.
- Contrato: más arranque rápido y menor memoria inicial suelen venir con build más lento, menor throughput pico en algunos casos y restricciones de dynamic features.
- Límite: librerías con reflexión dinámica no declarada pueden fallar en runtime nativo.

#### Cuándo usarlo / cuándo no

**Úsalo** cuando cold start/RSS son críticos y el stack es compatible. **No lo uses** por defecto si el servicio depende fuertemente de dynamic classloading/reflexión no controlada o si el costo de build/diagnóstico supera el beneficio.

#### Ejemplo mínimo ejecutable

Crea `HelloNative.java`:

```java
public class HelloNative {
  public static void main(String[] args) {
    System.out.println("native-ready-check=" + (args.length >= 0));
  }
}
```

Comandos:

```bash
javac HelloNative.java
java HelloNative
```

Salida esperada:

```text
native-ready-check=true
```

Comandos de referencia para Spring Boot (no ejecutados aquí):

```bash
mvn -Pnative -DskipTests native:compile
./target/app
```

#### Caso real

Un API de baja latencia en autoscaling escala de 0 a N réplicas; native reduce tiempo de readiness, pero el pipeline CI necesita cache y tiempo extra de build.

#### Error común

**Síntoma.** funciona en JVM y falla como native. **Causa.** metadata de reflexión/recursos faltante. **Corrección.** ejecutar con agent, agregar hints, mantener tests sobre binario nativo. **Señal observable.** `ClassNotFoundException`, `MissingReflectionRegistrationError` o recurso no encontrado solo en native.

#### Verificación

Smoke Java ejecutado localmente. **Nota de verificación:** compilación native no ejecutada (requiere GraalVM/toolchain nativa y configuración del proyecto). La verificación real debe comparar arranque, RSS, p95 y errores funcionales entre JVM y native.

### Tema 3: AOT, Leyden y CRaC: arranque rápido con trade-offs · Avanzado · 60 min

Caso guía: necesitas arranque rápido, pero native image es demasiado restrictivo para tu stack. Quieres evaluar AOT cache, Leyden o CRaC.

#### Definición formal

- **AOT en Spring**: procesa la aplicación en build time para generar código/configuración que reduce trabajo en runtime.
- **Project Leyden / AOT cache**: en JDK 25, JEP 514 mejora ergonomía de command-line AOT y JEP 515 agrega method profiling AOT; el objetivo es mejorar arranque/warmup con menos fricción.
- **CRaC (Coordinated Restore at Checkpoint)**: captura el estado de una JVM en checkpoint y lo restaura, reduciendo tiempo de arranque.

#### Contrato / internals

- AOT cache/JEP 514-515: optimiza arranque/warmup; no elimina la JVM.
- CRaC: requiere que recursos (sockets, archivos, conexiones, estado sensible) se cierren/restauren correctamente.
- Spring soporta hooks/contexto para CRaC en escenarios compatibles.
- Trade-off: menos restricciones que native en algunos casos, pero más sensibilidad operativa al estado/restauración.

#### Cuándo usarlo / cuándo no

**Usa AOT/Leyden** cuando quieres mejor arranque/warmup con JVM estándar. **Usa CRaC** cuando el entorno controla checkpoint/restore y puedes gestionar ciclo de vida de recursos. **No uses CRaC** si no controlas el runtime o hay recursos no restaurables.

#### Ejemplo mínimo ejecutable

Crea `StartupCheck.java`:

```java
public class StartupCheck {
  public static void main(String[] args) {
    long t0 = System.nanoTime();
    int sum = 0;
    for (int i = 0; i < 1000; i++) sum += i;
    long ms = (System.nanoTime() - t0) / 1_000_000;
    System.out.println("sum=" + sum);
    System.out.println("ms>=0=" + (ms >= 0));
  }
}
```

Comandos:

```bash
javac StartupCheck.java
java StartupCheck
```

Salida esperada (valor de ms puede variar):

```text
sum=499500
ms>=0=true
```

#### Caso real

Un servicio con autoscaling en Kubernetes puede usar AOT/native/CRaC según su perfil: native para binario pequeño, CRaC para arranque casi instantáneo donde el checkpoint es viable, JVM+AOT cache para compatibilidad.

#### Error común

**Síntoma.** checkpoint se restaura pero la app falla al atender tráfico. **Causa.** conexiones/sockets/estado no reabiertos o no aptos para restore. **Corrección.** implementar hooks de lifecycle, validar recursos externos tras restore. **Señal observable.** errores de conexión o estado stale justo después de restore.

#### Verificación

Smoke Java ejecutado localmente. **Nota de verificación (2026-05-22):** no se ejecutó CRaC ni AOT cache JDK 25 dedicado en esta sesión. JEP 514 y JEP 515 figuran como entregadas en JDK 25 (OpenJDK). Verificación real: medir tiempo de arranque, warmup, RSS y corrección funcional antes/después.

### Tema 4: Health checks para Kubernetes · Intermedio · 45 min

Caso guía: Kubernetes reinicia pods sanos porque la sonda apunta al endpoint equivocado, o mantiene pods vivos que no pueden atender tráfico.

#### Definición formal

Las sondas de Kubernetes verifican estado del contenedor: **liveness** (si debe reiniciarse), **readiness** (si puede recibir tráfico) y **startup** (si ya terminó de arrancar). Spring Boot Actuator expone health groups para mapear estos conceptos.

#### Contrato / internals

- Actuator: `/actuator/health/liveness`, `/actuator/health/readiness`.
- Readiness debe reflejar dependencias necesarias para servir tráfico.
- Liveness no debe depender de dependencias externas transitorias, o provocar reinicios en cascada.
- Contrato: devolver 200/UP solo cuando la condición correspondiente es verdadera.

#### Cuándo usarlo / cuándo no

**Úsalo** siempre en Kubernetes/servicios gestionados. **No uses** el mismo check para liveness y readiness sin criterio; evita acoplar liveness a DB remota salvo justificación.

#### Ejemplo mínimo ejecutable

Crea `Probe.java`:

```java
public class Probe {
  static String health(boolean dbUp, boolean appUp) {
    if (!appUp) return "LIVENESS_DOWN";
    if (!dbUp) return "READINESS_DOWN";
    return "UP";
  }
  public static void main(String[] args) {
    System.out.println(health(true, true));
    System.out.println(health(false, true));
    System.out.println(health(true, false));
  }
}
```

Comandos:

```bash
javac Probe.java
java Probe
```

Salida esperada:

```text
UP
READINESS_DOWN
LIVENESS_DOWN
```

Configuración Spring Boot típica:

```yaml
management:
  endpoint:
    health:
      probes:
        enabled: true
  endpoints:
    web:
      exposure:
        include: health,info,prometheus
```

#### Caso real

Si la DB cae temporalmente, readiness pasa a DOWN y Kubernetes deja de enviar tráfico; liveness sigue UP para no reiniciar pods innecesariamente.

#### Error común

**Síntoma.** reinicios en bucle. **Causa.** liveness depende de DB externa. **Corrección.** separar liveness/readiness y usar startup probe para arranques lentos. **Señal observable.** eventos `Liveness probe failed` durante caída de dependencia externa.

#### Verificación

Smoke Java ejecutado localmente. **Nota de verificación:** endpoints Actuator/Kubernetes no desplegados en esta sesión; validar en cluster con `kubectl describe pod` y eventos de probes.

### Tema 5: Imágenes OCI con Buildpacks: spring-boot:build-image sin Dockerfile · Intermedio · 45 min

Caso guía: quieres una imagen OCI reproducible sin mantener un Dockerfile complejo.

#### Definición formal

Cloud Native Buildpacks generan imágenes OCI desde el código fuente/artefacto usando builders y buildpacks. Spring Boot integra esto con `spring-boot:build-image` (Maven/Gradle), que produce una imagen con capas y metadata sensible para apps Java.

#### Contrato / internals

- Entrada: artefacto Spring Boot y configuración del plugin.
- Salida: imagen OCI con capas, JVM/runtime configurado por buildpack.
- Contrato: no requiere Dockerfile, pero sí requiere daemon/contenedor compatible para construir.
- Límites: personalización profunda puede requerir bindings, buildpacks custom o Dockerfile.

#### Cuándo usarlo / cuándo no

**Úsalo** para estandarizar imágenes y reducir mantenimiento de Dockerfiles. **No lo uses** si necesitas control total de cada capa/paquete del sistema que el buildpack no expone fácilmente.

#### Ejemplo mínimo ejecutable

Crea `BuildPlan.java`:

```java
public class BuildPlan {
  public static void main(String[] args) {
    String source = "jar";
    String output = "oci-image";
    System.out.println(source + "->" + output);
  }
}
```

Comandos:

```bash
javac BuildPlan.java
java BuildPlan
```

Salida esperada:

```text
jar->oci-image
```

Comando Spring Boot real:

```bash
mvn -DskipTests spring-boot:build-image
```

#### Caso real

Un equipo de plataforma define builders aprobados; los servicios generan imágenes consistentes con certificados y JVM settings sin Dockerfile por repo.

#### Error común

**Síntoma.** build falla en CI. **Causa.** no hay Docker daemon o builder inaccesible. **Corrección.** configurar entorno de build OCI o usar alternativa compatible con CI. **Señal observable.** error de conexión a Docker/buildpack builder.

#### Verificación

Smoke Java ejecutado localmente. **Nota de verificación:** no se ejecutó `spring-boot:build-image` porque requiere entorno de build de imágenes y tiempo adicional; verificar con Docker disponible y `docker images` mostrando la imagen generada.

## Cierre

Empaquetar y desplegar bien es reducir riesgo: artefactos reproducibles, arranque medido, probes correctas y trade-offs explícitos entre JVM, AOT, CRaC y native.

## Checklist

- Elijo fat JAR/capas/native/AOT por evidencia, no moda.
- Separo liveness/readiness/startup.
- Mido arranque, RSS, p95 y compatibilidad.
- Externalizo config y secretos.
- Documento notas de verificación cuando no hay infra.
