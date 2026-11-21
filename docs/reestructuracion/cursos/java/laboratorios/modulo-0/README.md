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
GRADLE="./gradlew --offline -I .herramienta-local.init.gradle.kts" ./verificar.sh
```

El último mando es para una máquina **sin JDK 25 instalado**: `.herramienta-local.init.gradle.kts` no forma
parte del curso, es un script de inicialización de Gradle que presta el toolchain 27 para que `test`, `run` y
`build` se ejecuten aquí. Con JDK 25 en PATH no hace falta: basta `./gradlew test`.

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

## Estado de la verificación (2026-11-20, Temurin 27.0.1.0.2+1, macOS arm64, locale `es_CO`)

- **Ejecutado y comprobado aquí:** `GRADLE="./gradlew --offline -I .herramienta-local.init.gradle.kts"
  ./verificar.sh` termina en `RESULTADO: OK` con **47** comprobaciones, 0 fallidas y 1 omitida. Son los
  ejemplos, errores, bytecode, sesiones de JShell y sesiones de `jdb` de los temas 1 a 6, más el proyecto
  Gradle del tema 7: las 3 pruebas con `test`, el `run` que cotiza el envío, el `build` que deja el JAR,
  `java -jar` sobre ese JAR y `javap -v` sobre las clases del build (`major version: 69`).
- **La única omitida:** `java es la entrega 25`. El número lo imprime el **runtime**, no el compilador, y en
  esta máquina el runtime es el 27. No se aflojó la comprobación (no se aceptó «cualquier número»): se declaró
  pendiente. Con JDK 25 en PATH pasa sola, y `EXIGIR_JDK25=1 ./verificar.sh` convierte esa omisión en fallo.
- **Lo que sí se volvió determinista:** el formato de clase. `javac --release 25` y `options.release` en los
  tres `build.gradle.kts` hacen que el `.class` salga en formato 69 **aunque** se compile con el JDK 27
  instalado, así que esas dos comprobaciones están en verde y no dependen de la máquina.
- **Qué se prestó:** la distribución Gradle 9.8.2 y JUnit 6.0.3 salen de la caché local (`--offline`), y el
  único JDK 25 se suplió con el 27 vía el script de inicialización. Nada más.
- **Dos comprobaciones reescritas porque estaban mal formuladas.** Antes `verificar.sh` aceptaba frases del
  lanzador en español (`Error: no se ha encontrado o cargado la clase principal …`, `Error: el método
  principal no es SinMain …`) que nadie había reproducido. Medido aquí: con sistema y JVM en `es_CO`, el
  lanzador imprime **en inglés** (`Error: Could not find or load main class Despacho`, `Error: Main method
  not found in class SinMain, …`), y añadir `-Duser.language=es -Duser.country=CO` no cambia un carácter. Esas
  dos cadenas se eliminaron del script y se sustituyeron por lo que sí es estable —el nombre de la excepción,
  la firma `public static void main(String[] args)` y código de salida distinto de cero—. La puerta quedó más
  estricta, no más floja.
- **Corrección de una nota anterior (Ubuntu x86-64, OpenJDK 25.0.5, mismo día):** allí se escribió que la red
  bloqueaba `services.gradle.org` y Maven Central y que el build se había hecho con Gradle 8.14.3 y JUnit
  5.10.1. En esta máquina esa limitación no se reproduce: el wrapper 9.8.2 y JUnit 6.0.3 funcionan desde caché.
- **Pendiente en el Mac del dueño:** `./verificar.sh` con JDK 25 en PATH y sin el script de inicialización, más
  `EXIGIR_GRADLE=1 ./verificar.sh` y `EXIGIR_JDK25=1 ./verificar.sh`; los comandos de instalación del tema 2
  (Homebrew, SDKMAN) y los pasos del IDE del tema 6.
- El `gradle-wrapper.jar` y los scripts `gradlew` se copiaron de otro laboratorio del repositorio que ya
  usa Gradle 9.8.2; no se regeneraron aquí.
