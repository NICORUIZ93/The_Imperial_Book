# Java · Laboratorio del módulo 0 · Plataforma, herramientas y primer programa

Código de todos los ejemplos de [modulo-0.md](../../modulo-0.md) y el nacimiento del proyecto guía
`rutaflow-nucleo` como proyecto Gradle. Al publicar el curso, esta carpeta pasa a `examples/java/modulo-0/`.

## Versiones

| Herramienta | Versión | Dónde se fija |
|---|---|---|
| Java | JDK 25 | toolchain en `build.gradle.kts` (lee `java` de `gradle/libs.versions.toml`) |
| Gradle | 9.8.2 | `gradle/wrapper/gradle-wrapper.properties` (con suma SHA-256) |
| JUnit | 6.0.3 | `gradle/libs.versions.toml` |

## Verificar

```bash
./verificar.sh                                # todo el módulo; termina en «RESULTADO: OK»
EXIGIR_GRADLE=1 ./verificar.sh                # falla si el wrapper no puede arrancar (úsalo en el Mac)
GRADLE="gradle --offline" ./verificar.sh      # con un Gradle ya instalado, sin red
```

`verificar.sh` (bash 3.2) ejecuta cada ejemplo, comprueba su salida, provoca cada error del módulo y
comprueba su mensaje. Sigue ante fallos y cuenta correctas, fallidas y omitidas.

## Qué hay

| Carpeta | Tema | Archivos | Cómo se ejecuta |
|---|---|---|---|
| `tema-1/` | Qué es Java hoy | `VersionDeJava.java`, `InformeDeEntorno.java` | `java Archivo.java` |
| `tema-2/` | Instalar JDK 25 | `DondeEstaJava.java`, `ComprobarEntorno.java` | `java Archivo.java` |
| `tema-3/` | Del fuente al bytecode | `src/Arranque.java`, `src/Despacho.java`, `src/Tarifa.java` | `javac -d out src/*.java && java -cp out Despacho` |
| `tema-4/` | Anatomía de `main` | `Etiqueta.java`, `MainClasico.java`, `CotizarEnvio.java`, `DosMain.java`, `SoloInstancia.java`, `ImportImplicito.java`; errores: `SinMain.java`, `MainPrivado.java` | `java Archivo.java [argumentos]` |
| `tema-5/` | JShell y lanzador | `tarifa.jsh`, `exploracion.jsh`, `errores.jsh`, `Saludo.java`, `rastreo/` (3 archivos), `etiquetar` (script) | `jshell archivo.jsh` · `java Rastreo.java RF-000123` · `./etiquetar RF-000123` |
| `tema-6/` | IDE y depurador | `Contador.java`, `PesoVolumetrico.java` (con el fallo), `PesoVolumetricoCorregido.java`, `sesion.jdb`, `sin-g.jdb`, `remoto.jdb` | `javac -g -d out PesoVolumetrico.java && jdb -classpath out PesoVolumetrico` |
| raíz | Primer build con Gradle (tema 7) | `settings.gradle.kts`, `build.gradle.kts`, `gradle/libs.versions.toml`, `src/main`, `src/test` | `./gradlew test` · `./gradlew run --args="Bogotá Medellín 2500"` · `./gradlew build` |

Los temas 1 a 6 se ejecutan directamente con `java` porque el estudiante aún no conoce Gradle; el build
llega en el tema 7.

## Estado de la verificación (2026-11-20, OpenJDK 25.0.5, Ubuntu x86-64)

- **Ejecutado y comprobado:** todos los ejemplos de los temas 1 a 6, incluidas las sesiones de JShell, de
  `jdb` y de depuración remota por JDWP (43 comprobaciones de `verificar.sh`).
- **Tema 7, ejecutado con otra versión de la herramienta:** la red de la máquina de verificación bloquea
  `services.gradle.org` y Maven Central, así que el wrapper no pudo descargar Gradle 9.8.2 ni JUnit 6.0.3.
  El mismo `build.gradle.kts` se ejecutó con un Gradle 8.14.3 ya instalado, sin conexión, con JUnit 5.10.1
  de un repositorio local y JDK 25 como toolchain: `test`, `run`, `build` y `java -jar` funcionaron y esas
  son las salidas pegadas en la lección.
- **Pendiente en el Mac del dueño:** `EXIGIR_GRADLE=1 ./verificar.sh` con el wrapper (Gradle 9.8.2 y JUnit
  6.0.3 reales); los comandos de instalación del tema 2 (Homebrew, SDKMAN) y los pasos del IDE del tema 6.
- El `gradle-wrapper.jar` y los scripts `gradlew` se copiaron de otro laboratorio del repositorio que ya
  usa Gradle 9.8.2; no se regeneraron aquí.
