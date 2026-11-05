# GraalVM Native Image para RutaFlow

Spring Boot 4.1.2 y Java 25. La app expone `GET /estado` y lee un recurso de
classpath de forma configurable en `GET /mensaje`. `MensajeHints` registra ese
recurso para que Native Image lo incluya.

## Ejecutar AOT sobre la JVM

Desde esta carpeta:

```bash
./scripts/verify-aot.sh
```

El script corre `./mvnw -Pnative package`, inspecciona las clases y metadata que
Spring genera, y arranca el JAR en modo AOT. **Esto sigue siendo Java sobre una
JVM; no compila un ejecutable nativo.**

## Compilar un ejecutable nativo

Necesitas GraalVM con `native-image` y las herramientas C/C++ que requiere tu
sistema. Compruébalo con `native-image --version` y ejecuta:

```bash
./mvnw -Pnative native:compile
./target/spring-boot-native-rutaflow
```

Para compilar dentro de un contenedor GraalVM Linux/ARM64:

```bash
podman run --rm -v "$PWD:/workspace:Z" -w /workspace ghcr.io/graalvm/native-image-community:25 ./mvnw -Pnative native:compile
podman run --rm -p 18081:8080 -v "$PWD/target:/workspace:Z" -w /workspace ghcr.io/graalvm/native-image-community:25 ./spring-boot-native-rutaflow
```

En otra terminal consulta `http://localhost:18081/estado` y
`http://localhost:18081/mensaje`. El binario compilado dentro del contenedor es
para Linux/ARM64 y se ejecuta en ese contenedor; no lo ejecutes directamente en
macOS.

## Diagnosticar un hint que falta

Quita `@ImportRuntimeHints(MensajeHints.class)` de `NativeRutaApplication.java` y
corre `./mvnw -q clean package -Pnative`. El proceso puede completar, pero el
patrón `mensajes/*.txt` deja de aparecer en
`target/spring-aot/main/resources/META-INF/native-image/academia.rutaflow/spring-boot-native-rutaflow/reachability-metadata.json`.
Restaura la anotación antes de compilar el binario. En la imagen nativa, llama
`/mensaje` para comprobar que el recurso se incluyó.

Una imagen nativa depende de sistema operativo y arquitectura; registra la
plataforma junto al artefacto. Compara tiempos y memoria en el mismo entorno, no
asumas que un binario nativo siempre gana.
