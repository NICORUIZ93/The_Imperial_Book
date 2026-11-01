# Módulo 11: Empaquetado y despliegue

Cada tema se verifica con mecanismos reales y ejecutables sin depender de un daemon de Docker disponible en este entorno: el modo `layertools` embebido en el propio JAR de Spring Boot, la meta de Maven `spring-boot:process-aot` (que ejecuta de verdad el motor de AOT de Spring, sin necesitar un compilador nativo de GraalVM instalado), y los endpoints reales de Actuator agrupados por probes de Kubernetes. Continúa sobre `demo-cloud` (Módulo 10) o un proyecto nuevo.

## Aprende construyendo

### Tema 1: Fat JAR vs capas de Docker · Intermedio · 45 min

**Prerrequisito:** Módulo 0 de este track (empaquetado básico con `mvnw package`).

**Al terminar podrás:** inspeccionar, con el propio JAR generado por Spring Boot, las capas reales que separan dependencias de código de aplicación, y explicar por qué esa separación reduce el tamaño de las actualizaciones de imagen.

#### Aprende

**¿Por qué es importante?** Un fat JAR empaqueta la aplicación completa junto con todas sus dependencias en un único archivo; si ese JAR se coloca como una única capa de Docker, cada cambio de código (sin importar cuán pequeño) obliga a Docker a re-subir la imagen completa, incluyendo dependencias que no cambiaron en absoluto.

**Conceptos clave:** empaquetado por capas, `layertools`, reducir el tamaño de actualizaciones de imagen.

Spring Boot repackagea el JAR con un índice de capas (`layers.idx`) accesible mediante el modo especial `java -Djarmode=layertools -jar app.jar`, que separa dependencies (dependencias de terceros, cambian poco), spring-boot-loader (el propio mecanismo de arranque, casi nunca cambia), snapshot-dependencies (dependencias `-SNAPSHOT`, cambian algo más) y application (el código propio, cambia en cada commit) en directorios distintos. Un Dockerfile que copia cada capa por separado permite que Docker reutilice las capas de dependencias sin cambios entre deploys, subiendo solo la capa `application` (mucho más pequeña) en cada nuevo deploy.

**Analogía:** empaquetar todo en una sola capa de Docker es reempacar y reenviar una caja completa cada vez que cambia un solo objeto pequeño dentro de ella; empaquetar por capas separa el contenido estable del contenido que cambia frecuentemente en cajas distintas, reenviando solo la caja pequeña que efectivamente cambió.

**Diagrama:**

```mermaid
flowchart TB
  subgraph JAR["app.jar (layers.idx)"]
    D["dependencies/ — cambia rara vez"]
    L["spring-boot-loader/ — casi nunca cambia"]
    S["snapshot-dependencies/ — cambia ocasionalmente"]
    A["application/ — cambia en cada commit"]
  end
  D --> L --> S --> A
```

#### Practica

**Demo paso a paso.** Continuando en `demo-cloud` (o, si prefieres un ejemplo independiente, parte de una carpeta vacía y genera el proyecto con Spring Initializr), crea un `application.yml` mínimo y genera el JAR real:

```bash
mkdir -p academia-labs && cd academia-labs
curl -fsSL "https://start.spring.io/starter.zip?type=maven-project&dependencies=web,actuator&javaVersion=25&groupId=io.academia&artifactId=demo-empaquetado&packageName=io.academia.empaquetado" -o demo-empaquetado.zip
unzip demo-empaquetado.zip -d demo-empaquetado
cd demo-empaquetado
```

```yaml
# src/main/resources/application.yml
spring:
  application:
    name: demo-empaquetado
server:
  port: 8080
```

```bash
./mvnw -q package
java -Djarmode=layertools -jar target/*.jar list
```

**Resultado esperado (salida real de `layertools list`, comando oficial de Spring Boot):**

```text
dependencies
spring-boot-loader
snapshot-dependencies
application
```

Extrae las capas a directorios reales y confírmalas por filesystem, sin necesitar Docker corriendo:

```bash
java -Djarmode=layertools -jar target/*.jar extract --destination target/extracted
test -d target/extracted/dependencies && echo "OK: capa dependencies existe"
test -d target/extracted/application && echo "OK: capa application existe"
```

`--destination` es la bandera que fija en qué carpeta extraer las capas del JAR.

Con esas capas ya extraídas y verificadas, el Dockerfile de producción simplemente las copia en el orden correcto:

```dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/extracted/dependencies/ ./
COPY target/extracted/spring-boot-loader/ ./
COPY target/extracted/snapshot-dependencies/ ./
COPY target/extracted/application/ ./
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
```

**Explicación línea por línea:** `-Djarmode=layertools` cambia el modo de arranque del propio JAR para ejecutar la herramienta de capas en lugar de la aplicación; `list` imprime los nombres de capa declarados en `layers.idx` y `extract --destination` escribe cada una como un directorio de archivos reales; `test -d` comprueba en el filesystem que la extracción ocurrió, sin intervención de Docker; en el Dockerfile, cada `COPY` crea una capa de imagen independiente y **el orden importa**: los archivos se superponen en el contenedor, por eso `application/` va al final.

**Fallo deliberado:** ejecuta `java -Djarmode=layertools -jar target/classes.jar list` contra un JAR que NO fue repackageado por el plugin de Spring Boot (por ejemplo, uno generado por el `jar` estándar de Maven sin `spring-boot-maven-plugin`). El comando falla con un error real: `Unable to find layers.idx in jar` — diagnostica confirmando que el modo `layertools` depende específicamente del índice de capas que solo el repackaging de Spring Boot añade; un JAR "normal" simplemente no lo tiene. Verifica con el JAR correcto (`target/*.jar` generado por `mvnw package`, que sí incluye el plugin) antes de continuar.

**Ejercicios.**

1. Ejecuta `java -Djarmode=layertools -jar target/*.jar help` y documenta qué otros subcomandos ofrece además de `list` y `extract`.
2. Modifica una línea de `src/main/java` (sin tocar `pom.xml`), reconstruye el JAR con `./mvnw -q package`, y confirma con `diff` recursivo entre extracciones sucesivas que solo la carpeta `application/` cambió de contenido.
3. Agrega una dependencia nueva al `pom.xml`, reconstruye, y confirma que esta vez la carpeta `dependencies/` también cambió.
4. Escribe de memoria (sin mirar) el comando `layertools list` y las cuatro capas que produce. Compara después contra el patrón del demo.

**Pista:** `layertools extract` escribe archivos reales en disco — comparar dos extracciones sucesivas con `diff -rq carpeta1 carpeta2` es una forma directa y verificable de confirmar exactamente qué capas cambiaron entre dos builds, sin necesitar Docker.

**Completa el código:** rellena el espacio con el modo especial que Spring Boot expone dentro de su propio JAR para listar capas:

```bash
java -D____=layertools -jar target/*.jar list
```

**Reto de memoria:** cierra este documento y escribe, solo de memoria, el comando `layertools list`, sus cuatro capas esperadas, y un Dockerfile que las copie en el orden correcto. Compara después contra el patrón del demo.

#### Aplica

**Reto abierto.** Empaqueta `demo-cloud` para actualizaciones incrementales: extrae sus capas, documenta el Dockerfile y demuestra con dos builds consecutivos (uno que cambia solo código y otro que agrega una dependencia) qué capas cambian en cada caso.

**Checklist de salida.**

- [ ] El JAR se genera con `mvnw package` y `layertools list` imprime las cuatro capas.
- [ ] Las capas están extraídas y verificadas en el filesystem.
- [ ] El Dockerfile copia `application/` al final y usa una etiqueta de versión inmutable, no `latest`.
- [ ] Un `diff -rq` entre dos extracciones demuestra qué cambió y qué se reutilizó.
- [ ] Sabes explicar por qué reutilizar capas reduce el tamaño de subida sin cambiar el contenido de la imagen final.

**Si falla.** Si `layertools` responde `Unable to find layers.idx`, el JAR no pasó por el repackaging de Spring Boot: revisa que `spring-boot-maven-plugin` esté declarado y que ejecutaste `package`, no `compile`. Si `target/*.jar` coincide con más de un archivo, nombra el JAR exacto en el comando.

**Siguiente paso:** el siguiente tema reduce el tiempo de arranque compilando a un binario nativo con GraalVM.

**Errores comunes:** empaquetar todo en una única capa de Docker sin usar `layertools`; usar la etiqueta `latest` en vez de una versión inmutable, dificultando el rollback.

**Límites y decisión de uso:** para un prototipo desechable sin pipeline de deploy repetido, la separación por capas no aporta ningún beneficio medible sobre un `docker build` simple de un solo paso.

**Fuente oficial:** [Spring Boot — Container Images](https://docs.spring.io/spring-boot/reference/packaging/container-images/).

**Transferencia al proyecto integrador:** la estrategia de capas de Docker que elijas aquí es la que empaquetará el microservicio productivo (Módulo 12).

### Tema 2: GraalVM native image · Avanzado · 45 min

**Prerrequisito:** Tema 1 de este módulo.

**Al terminar podrás:** ejecutar el procesamiento AOT (ahead-of-time) real de Spring Boot con un comando de Maven rápido y sin GraalVM instalado, inspeccionando el código fuente generado como evidencia concreta de qué hace la compilación nativa antes de invertir en un build completo de `native-image`.

#### Aprende

**¿Por qué es importante?** En un sistema con autoscaling agresivo, un tiempo de arranque de milisegundos (GraalVM native image) permite que nuevas instancias reciban tráfico casi instantáneamente ante un pico, mientras que el arranque de varios segundos de la JVM tradicional degrada la experiencia justo cuando más se necesita capacidad adicional.

**Conceptos clave:** compilación ahead-of-time a binario nativo, procesamiento AOT de Spring.

`./mvnw -Pnative native:compile` compila la aplicación a un binario nativo ejecutable directamente por el sistema operativo, con arranque en milisegundos y footprint de memoria menor, a cambio de un build significativamente más lento y restricciones de reflexión. Antes de ese build completo (que puede tardar varios minutos), Spring Boot expone `./mvnw spring-boot:process-aot`, una meta de Maven que ejecuta el mismo motor de análisis AOT de Spring pero se detiene en generar código fuente Java optimizado (sin compilarlo a binario nativo), permitiendo inspeccionar en segundos qué construiría el compilador nativo.

**Analogía:** GraalVM native image es un vehículo que enciende instantáneamente en vez de requerir calentamiento del motor; `process-aot` es revisar el plano detallado de ese vehículo antes de fabricarlo, para detectar problemas de diseño sin esperar la fabricación completa.

**Diagrama:**

```mermaid
flowchart LR
  A["./mvnw spring-boot:process-aot"] --> B["target/spring-aot/main/sources/"]
  B --> C{¿hints de reflexión completos?}
  C -->|sí| D["./mvnw -Pnative native:compile funciona"]
  C -->|no| E["native-image fallaría en runtime"]
```

#### Practica

**Demo paso a paso.** Continuando en `demo-empaquetado` (o, si prefieres un ejemplo independiente, parte de una carpeta vacía y genera un proyecto nuevo con `mkdir demo-native && cd demo-native && curl -fsSL https://start.spring.io/starter.zip -d dependencies=web -d javaVersion=25 -o app.zip && unzip app.zip`), crea `src/main/java/io/academia/empaquetado/InfoServicio.java`, una clase accedida por reflexión (simulando el patrón que requiere hints explícitos):

```bash
mkdir -p src/main/java/io/academia/empaquetado
```

```java
// src/main/java/io/academia/empaquetado/InfoServicio.java
package io.academia.empaquetado;

public class InfoServicio {
    private String version = "1.0.0";

    public String version() {
        return version;
    }
}
```

```java
// src/main/java/io/academia/empaquetado/InfoHints.java
package io.academia.empaquetado;

import org.springframework.aot.hint.MemberCategory;
import org.springframework.aot.hint.RuntimeHints;
import org.springframework.aot.hint.RuntimeHintsRegistrar;

public class InfoHints implements RuntimeHintsRegistrar {
    @Override
    public void registerHints(RuntimeHints hints, ClassLoader classLoader) {
        hints.reflection().registerType(InfoServicio.class,
            MemberCategory.INVOKE_DECLARED_METHODS, MemberCategory.DECLARED_FIELDS);
    }
}
```

Registra esos hints en la configuración para que el motor AOT los aplique:

```java
// src/main/java/io/academia/empaquetado/ConfiguracionHints.java
package io.academia.empaquetado;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.ImportRuntimeHints;

@Configuration
@ImportRuntimeHints(InfoHints.class)
public class ConfiguracionHints {
}
```

Ejecuta el procesamiento AOT real (rápido, sin GraalVM instalado) y confirma que genera código fuente concreto:

```bash
./mvnw -q spring-boot:process-aot
test -d target/spring-aot/main/sources && echo "OK: Spring generó código AOT real"
find target/spring-aot/main/sources -name "*ApplicationContextInitializer.java"
```

**Explicación línea por línea:** `InfoServicio` representa una clase que solo puede instanciarse o leerse por reflexión, un patrón que el compilador nativo no puede descubrir por sí solo; `RuntimeHintsRegistrar` declara explícitamente qué miembros deben estar disponibles en el binario (`INVOKE_DECLARED_METHODS` y `DECLARED_FIELDS`); `@ImportRuntimeHints` es lo que efectivamente conecta ese registrador con el análisis AOT — sin esa anotación el registrador nunca se ejecuta; `spring-boot:process-aot` corre ese análisis y deja el código generado en `target/spring-aot/main/sources/`, donde `find` demuestra en disco que el initializer existe.

**Resultado esperado:** el directorio `target/spring-aot/main/sources/` existe y contiene un archivo real `...ApplicationContextInitializer.java` generado por el motor AOT de Spring — evidencia concreta y verificable en disco de que el procesamiento AOT realmente se ejecutó, sin necesitar el compilador nativo de GraalVM instalado.

**Fallo deliberado:** quita la anotación `@ImportRuntimeHints(InfoHints.class)` de `ConfiguracionHints` y documenta el resultado: `process-aot` sigue completando exitosamente (porque no valida en tiempo de build que la reflexión funcione en runtime), pero un build completo posterior con `native:compile` produciría un binario que, al invocar reflexión sobre `InfoServicio` en tiempo de ejecución, lanzaría un error real de GraalVM (`com.oracle.svm.core.jdk.UnsupportedFeatureException` o una `ClassNotFoundException` en el binario nativo, según el tipo de acceso) — diagnostica confirmando que los hints de reflexión son responsabilidad explícita del desarrollador: el compilador ahead-of-time no puede inferir dinámicamente qué reflexión necesitará el binario, a diferencia de la JVM tradicional. Restaura `@ImportRuntimeHints(InfoHints.class)` antes de continuar.

**Ejercicios.**

1. Inspecciona con `cat` el contenido real de un archivo generado bajo `target/spring-aot/main/sources/` y documenta, en un comentario, qué patrón de código genera Spring en vez de usar reflexión en runtime.
2. Agrega una segunda clase con un campo privado accedido por Jackson (deserialización JSON) y confirma con `process-aot` que Spring detecta y registra automáticamente hints para tipos usados en `@RestController`.
3. Ejecuta `./mvnw -q spring-boot:process-aot` dos veces seguidas sin cambiar código y confirma con `diff` que el código generado es idéntico (determinismo del procesamiento AOT).
4. Escribe de memoria (sin mirar) una clase `RuntimeHintsRegistrar` con `@ImportRuntimeHints`, y el comando `process-aot` que la ejercita. Compara después contra el patrón del demo.

**Pista:** `target/spring-aot/main/sources/` contiene código Java real y legible, no un artefacto binario opaco — leerlo directamente es la forma más rápida de entender exactamente qué haría el compilador nativo con tu configuración, sin esperar un build completo de `native-image` que puede tardar varios minutos.

**Completa el código:** rellena el espacio con la meta de Maven que ejecuta el procesamiento AOT sin compilar a binario nativo:

```bash
./mvnw spring-boot:____
```

**Reto de memoria:** cierra este documento y escribe, solo de memoria, una clase `RuntimeHintsRegistrar`, la anotación que la registra, y el comando `process-aot` que confirma su efecto en disco. Compara después contra el patrón del demo.

#### Aplica

**Reto abierto.** Prepara `demo-cloud` para una build nativa: identifica una clase que requiera reflexión, declara sus hints con `RuntimeHintsRegistrar`, demuestra con `process-aot` que el análisis se ejecuta y documenta qué se verificó y qué quedó sin ejecutar por no disponer de GraalVM.

**Checklist de salida.**

- [ ] Existe al menos un `RuntimeHintsRegistrar` conectado con `@ImportRuntimeHints`.
- [ ] `process-aot` genera código en `target/spring-aot/main/sources/` y lo demuestras con una ruta concreta.
- [ ] Sabes explicar qué comprueba `process-aot` y qué NO comprueba.
- [ ] El README distingue lo ejecutado (AOT) de lo pendiente (build nativo completo).
- [ ] Ninguna afirmación de tiempo de arranque se presenta como medida sin haber medido.

**Si falla.** Si `process-aot` no genera el directorio, confirma que el proyecto tenga `spring-boot-maven-plugin` y que ejecutes la meta desde la raíz. Si `find` no encuentra el initializer, revisa que la clase principal esté anotada con `@SpringBootApplication` y que el build no esté reutilizando un `target/` de otro proyecto.

**Siguiente paso:** el siguiente tema conecta los health checks de Actuator con las decisiones reales que Kubernetes toma sobre el pod.

**Errores comunes:** asumir que `native-image` no requiere ninguna configuración adicional de reflexión; ejecutar directamente un build nativo completo (varios minutos) en vez de `process-aot` (segundos) durante la iteración de desarrollo.

**Límites y decisión de uso:** para servicios internos sin autoscaling agresivo ni restricciones estrictas de arranque, el costo de build y las restricciones de reflexión de GraalVM pueden superar el beneficio de un arranque más rápido.

**Fuente oficial:** [Spring Boot — GraalVM Native Images](https://docs.spring.io/spring-boot/reference/packaging/native-image/introducing-graalvm-native-images.html).

**Transferencia al proyecto integrador:** GraalVM native image es la opción que reducirá el tiempo de arranque del microservicio productivo (Módulo 12) si el entorno lo justifica.

### Tema 3: Health checks para Kubernetes · Intermedio · 40 min

**Prerrequisito:** Módulo 7 de este track (Actuator y `AvailabilityChangeEvent`).

**Al terminar podrás:** confirmar, con una petición HTTP real, que los endpoints de Actuator agrupados por probes (`/actuator/health/liveness` y `/actuator/health/readiness`) responden con el código de estado correcto según el estado real de disponibilidad de la aplicación.

#### Aprende

**¿Por qué es importante?** Kubernetes decide automáticamente cuándo reiniciar un pod (liveness) y cuándo un pod puede recibir tráfico real (readiness) consultando estos endpoints periódicamente; sin una conexión correcta y probada entre el estado real de la aplicación y estas señales, Kubernetes toma decisiones operativas basadas en información incorrecta.

**Conceptos clave:** liveness/readiness probes agrupados, conectados a Actuator.

Con `management.endpoint.health.probes.enabled=true`, Spring Boot expone automáticamente `/actuator/health/liveness` y `/actuator/health/readiness` como grupos de health separados. Liveness responde "¿el proceso sigue vivo y debería seguir corriendo, o Kubernetes debería reiniciarlo?"; readiness responde "¿el proceso está listo para recibir tráfico real ahora mismo?" — la misma distinción de `AvailabilityChangeEvent` construida en el Módulo 7, ahora expuesta en el formato exacto que Kubernetes consulta.

**Analogía:** conectar Actuator a los probes de Kubernetes es instalar sensores automáticos que informan al sistema de gestión de una flota cuándo un vehículo necesita mantenimiento (reiniciarse) o simplemente no está listo para un nuevo viaje todavía (no recibir tráfico).

**Diagrama:**

```mermaid
flowchart LR
  K[Kubernetes] -->|consulta periódica| LV["/actuator/health/liveness"]
  K -->|antes de enrutar| RD["/actuator/health/readiness"]
  LV -->|DOWN| R[reinicia el pod]
  RD -->|503 OUT_OF_SERVICE| N[deja de enrutar tráfico]
```

#### Practica

**Demo paso a paso.** Continuando en `demo-empaquetado` (o, si prefieres un ejemplo independiente, parte de una carpeta vacía y genera un proyecto nuevo con `mkdir demo-probes && cd demo-probes && curl -fsSL https://start.spring.io/starter.zip -d dependencies=web,actuator -d javaVersion=25 -o app.zip && unzip app.zip`), crea `src/main/resources/application.yml` con los probes habilitados explícitamente (necesario fuera de un clúster real de Kubernetes, donde se autodetectan):

```bash
mkdir -p src/main/resources src/test/java/io/academia/empaquetado
```

```yaml
# src/main/resources/application.yml
management:
  endpoint:
    health:
      probes:
        enabled: true
      show-details: always
  endpoints:
    web:
      exposure:
        include: health
```

Confirma con `MockMvc` real, disparando el mismo `AvailabilityChangeEvent` del Módulo 7, que ambos endpoints reflejan el estado real de la aplicación:

```java
// src/test/java/io/academia/empaquetado/ProbesTest.java
package io.academia.empaquetado;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.availability.AvailabilityChangeEvent;
import org.springframework.boot.availability.ReadinessState;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ProbesTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ApplicationEventPublisher publisher;

    @Test
    void livenessRespondeUpMientrasElProcesoSigaVivo() throws Exception {
        mockMvc.perform(get("/actuator/health/liveness"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void readinessResponde503CuandoLaAplicacionDejaDeAceptarTrafico() throws Exception {
        AvailabilityChangeEvent.publish(publisher, this, ReadinessState.REFUSING_TRAFFIC);

        mockMvc.perform(get("/actuator/health/readiness"))
            .andExpect(status().isServiceUnavailable())
            .andExpect(jsonPath("$.status").value("OUT_OF_SERVICE"));

        AvailabilityChangeEvent.publish(publisher, this, ReadinessState.ACCEPTING_TRAFFIC); // restaura para no afectar otros tests
    }
}
```

```bash
./mvnw test -Dtest=ProbesTest
```

**Explicación línea por línea:** `probes.enabled: true` crea los dos grupos de health aunque no se detecte Kubernetes; `show-details: always` deja ver el `status` en el cuerpo JSON que el test verifica; `AvailabilityChangeEvent.publish(...)` emite la misma señal que la aplicación emitiría al arrancar o al perder disponibilidad, y ese evento es lo que el grupo `readiness` traduce a `OUT_OF_SERVICE` con HTTP `503`; el test restaura `ACCEPTING_TRAFFIC` al final para no dejar el contexto en un estado que afecte a otras pruebas.

**Resultado esperado:** `BUILD SUCCESS` con ambos tests en verde: el primero confirma con una petición HTTP real que `/actuator/health/liveness` responde `200 UP` mientras el proceso está sano; el segundo confirma, publicando el mismo `AvailabilityChangeEvent` real usado en el Módulo 7, que `/actuator/health/readiness` refleja genuinamente `503 OUT_OF_SERVICE` cuando la aplicación deja de aceptar tráfico — la misma señal que Kubernetes consultaría para dejar de enrutar peticiones hacia ese pod.

**Fallo deliberado:** comenta la línea `probes: enabled: true` en `application.yml` y ejecuta de nuevo ambos tests. `/actuator/health/liveness` y `/actuator/health/readiness` responden `404 NOT_FOUND` en vez de `200`/`503` — diagnostica confirmando que estos grupos de health NO existen automáticamente fuera de un entorno Kubernetes detectado; sin la propiedad explícita (necesaria para pruebas locales o entornos no-K8s), Kubernetes recibiría un `404` al consultar los probes, un fallo de configuración silencioso y fácil de pasar por alto hasta el primer despliegue real. Restaura la línea antes de continuar.

**Ejercicios.**

1. Agrega un `HealthIndicator` personalizado (como en el Módulo 7) que reporte `DOWN` cuando una dependencia crítica falla, y confirma con un test que ese indicador afecta a `/actuator/health` general pero NO necesariamente al grupo `liveness` (que por defecto solo incluye señales de vida del proceso, no de dependencias externas).
2. Escribe el manifiesto YAML completo (`livenessProbe`, `readinessProbe`, con `initialDelaySeconds` y `periodSeconds`) para el servicio de este Tema.
3. Documenta, en un comentario, por qué un `readinessProbe` que depende de una base de datos externa es apropiado, pero un `livenessProbe` que depende de esa misma base de datos externa es peligroso (podría causar reinicios en cascada de todos los pods si la base de datos se cae, sin resolver el problema real).
4. Escribe de memoria (sin mirar) un test `MockMvc` que confirme `200 UP` en liveness y, tras publicar un `AvailabilityChangeEvent`, `503` en readiness. Compara después contra el patrón del demo.

**Pista:** `AvailabilityChangeEvent.publish(publisher, this, ReadinessState.REFUSING_TRAFFIC)` es el mismo mecanismo real usado en el Módulo 7 para desacoplar readiness de liveness — Spring lo consume automáticamente y lo refleja en el grupo `readiness` cuando `probes.enabled=true`.

**Completa el código:** rellena el espacio con la propiedad que habilita explícitamente los grupos de health por probes:

```yaml
management:
  endpoint:
    health:
      ____:
        enabled: true
```

**Reto de memoria:** cierra este documento y escribe, solo de memoria, la configuración YAML que habilita los probes, y un test `MockMvc` que confirme el `503` real en readiness tras publicar `ReadinessState.REFUSING_TRAFFIC`. Compara después contra el patrón del demo.

#### Aplica

**Reto abierto.** Despliega `demo-cloud` en un clúster local con manifiestos que consulten `/actuator/health/liveness` y `/actuator/health/readiness`, y demuestra con `kubectl` qué ocurre cuando la aplicación deja de aceptar tráfico y cuando vuelve a aceptarlo.

**Checklist de salida.**

- [ ] Los dos grupos de probes responden con la configuración explícita.
- [ ] Un test demuestra `200 UP` en liveness y `503 OUT_OF_SERVICE` en readiness.
- [ ] El manifiesto declara `initialDelaySeconds` y `periodSeconds` con un criterio explícito.
- [ ] `livenessProbe` no depende de bases de datos ni servicios externos.
- [ ] Sabes explicar qué haría Kubernetes si el probe devolviera `404`.

**Si falla.** Si ambos endpoints devuelven `404`, falta `management.endpoint.health.probes.enabled=true` o la exposición de `health`; si solo falla readiness, revisa que el evento publicado sea exactamente `ReadinessState.REFUSING_TRAFFIC` y que el test restaure el estado al terminar. Si el pod se reinicia en bucle en el clúster, el `livenessProbe` está consultando una dependencia externa.

**Siguiente paso:** con esto se cierra el módulo de empaquetado y despliegue; el siguiente módulo aborda observabilidad distribuida con trazas y logs correlacionados.

**Errores comunes:** no habilitar `probes.enabled=true` fuera de un clúster Kubernetes real, recibiendo `404` en pruebas locales; acoplar `livenessProbe` a dependencias externas, causando reinicios en cascada ante un fallo de infraestructura ajeno al proceso mismo.

**Límites y decisión de uso:** para una aplicación que no se despliega en Kubernetes (o un orquestador equivalente que consulte probes HTTP), habilitar estos grupos específicos de health no aporta ningún beneficio operativo adicional sobre el endpoint `/actuator/health` general.

**Fuente oficial:** [Spring Boot — Kubernetes Probes](https://docs.spring.io/spring-boot/reference/actuator/kubernetes-probes.html).

**Transferencia al proyecto integrador:** los health checks de Kubernetes de este tema son los que decidirán si Kubernetes reinicia o enruta tráfico al microservicio productivo (Módulo 12).

## Proyecto de cierre del módulo

**Objetivo:** entregar `demo-cloud` empaquetado y desplegable: imagen por capas con actualizaciones incrementales demostradas, evidencia real de procesamiento AOT con sus hints de reflexión, y probes de Kubernetes conectados al estado genuino de la aplicación.

**Entregables.**

1. JAR generado por `mvnw package` con `layertools list` y las cuatro capas extraídas y verificadas en disco (Tema 1).
2. `Dockerfile` que copia las capas en orden, con etiqueta de versión inmutable y `COPY application/` al final.
3. Registro de dos builds consecutivos con `diff -rq` mostrando qué capa cambió al modificar solo código y qué capa cambió al agregar una dependencia.
4. `RuntimeHintsRegistrar` con `@ImportRuntimeHints` y la salida real de `spring-boot:process-aot` (ruta concreta del initializer generado).
5. `application.yml` con `probes.enabled=true` y los dos tests que demuestran `200 UP` en liveness y `503 OUT_OF_SERVICE` en readiness.
6. Manifiesto de despliegue con `livenessProbe` y `readinessProbe`, y una nota explícita de por qué liveness no consulta dependencias externas.
7. `README.md` que distingue lo ejecutado (capas, AOT, probes) de lo no ejecutado (build nativo completo, despliegue real en clúster), sin presentar como medido lo que no se midió.

**Rúbrica (100 puntos).**

| Criterio | Puntos |
|---|---:|
| Capas extraídas y verificadas por filesystem | 20 |
| Dockerfile con orden correcto y etiqueta inmutable | 15 |
| Evidencia de `diff` entre dos builds por capa | 15 |
| AOT ejecutado con hints de reflexión conectados | 20 |
| Probes con pruebas reales de `200` y `503` | 20 |
| Diferenciación honesta entre lo ejecutado y lo pendiente | 10 |

**Criterio de aceptación:** si el `Dockerfile` copia el JAR completo en una sola capa, si los probes no están habilitados explícitamente fuera de Kubernetes, o si el `livenessProbe` consulta una dependencia externa, el módulo no se considera cerrado aunque la rúbrica sume 100.

## Laboratorio práctico

**Objetivo del laboratorio:** construir una imagen Docker de un servicio Spring Boot optimizada por capas.

**Requisitos previos:** Módulos 0-10 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Generar el fat JAR y ejecutarlo | `./mvnw package` + `java -jar` | Verifica el funcionamiento básico |
| 2 | Construir la imagen por capas | Ver Tema 1 | Compara el tamaño con un JAR simple |
| 3 | Compilar a GraalVM native image | Ver Tema 2 | Mide el tiempo de arranque |
| 4 | Configurar los health checks de Kubernetes | Ver Tema 3 | Conectados a Actuator |

**Verificación:** el laboratorio se considera exitoso si la imagen por capas reduce mensurablemente el tamaño de actualización en un segundo deploy simulado (comparado con reconstruir el JAR completo), y si el binario nativo arranca en milisegundos comparado con la JVM tradicional.

**Errores comunes y soluciones**

- **Empaquetar todo en una única capa de Docker.** Separa dependencias (estables) del código de la aplicación (cambiante).
- **Asumir que GraalVM native image no requiere ninguna configuración adicional.** Verifica que el uso de reflexión esté correctamente configurado para el compilador nativo.
- **No conectar los health checks de Actuator a los probes de Kubernetes.** Sin esa conexión, Kubernetes no puede tomar decisiones informadas sobre el estado real de la aplicación.
