# Laboratorio · Módulo 1 · Java moderno y Spring Boot esencial

Lección: [`web/public/content/microservices/modulo-5.md`](../../../web/public/content/microservices/modulo-5.md)
(Fase 1, specs/018). Cada carpeta `fNNN-*` es un proyecto Maven autónomo con el código y el test de una ficha.

| Carpeta | Ficha | Necesita |
|---|---|---|
| `f017-java-moderno` | Java 21: Streams, Lambdas, Optional, Records, Pattern Matching | JDK |
| `f018-virtual-threads` | Virtual Threads (Project Loom) | JDK |
| `f019-ioc-di` | Spring IoC, DI, Bean Lifecycle, ApplicationContext | JDK + Maven Central |
| `f020-autoconfiguracion` | Auto-configuración condicional, @Conditional, starters | JDK + Maven Central |
| `f021-multimodulo` | Multi-module Spring Boot projects (`tienda-dominio` + `tienda-api`) | JDK + Maven Central |
| `f022-perfiles` | Perfiles y configuración externalizada | JDK + Maven Central |
| `f023-crac` | CRaC (Coordinated Restore at Checkpoint) | JDK; checkpoint/restore en Docker (Linux) |
| `f024-graalvm-native` | GraalVM Native Image | JDK; binario nativo en Docker (GraalVM 25) |

## Versiones

JDK 25 LTS (25.0.5) · Spring Boot 4.1.3 (Spring Framework 7, JUnit Jupiter 6.0.3) · Maven 3.10.1 por el wrapper ·
imágenes `azul/zulu-openjdk:25-jdk-crac` y `ghcr.io/graalvm/native-image-community:25` · Docker Compose v5.

## Ejecutar

```bash
cd examples/microservicios/modulo-5
./verificar.sh              # tests de las 8 carpetas en la JVM
./verificar.sh --docker     # además: checkpoint/restore de CRaC y binario nativo con Docker
```

Una sola ficha: `cd f019-ioc-di && ../mvnw test`. Las primeras ejecuciones descargan Maven y las dependencias.

**Salida esperada de `./verificar.sh`:** la versión de Java, `OK · tests de F017–F024 en verde` y la última línea
`RESULTADO: OK · Módulo 1 (Java moderno y Spring Boot esencial) verificado`. Con `--docker`, además, el JSON de
`/hola` (CRaC, `"aperturas":1`) y el de `/impuesto` (nativo, `"impuesto":19000`).

## Infraestructura

`docker-compose.yml` no arranca nada por defecto; cada bloque se activa con su perfil:

- `--profile crac`: `crac-checkpoint` crea el checkpoint en `f023-crac/target/crac` y `crac-restore` lo restaura en el
  puerto 8080 (capacidades `CHECKPOINT_RESTORE` y `SYS_PTRACE`).
- `--profile native`: `native-build` compila `f024-graalvm-native` con GraalVM 25 y `native-run` ejecuta el binario en
  el puerto 8081. Asigna al menos 8 GB de memoria a Docker Desktop.
