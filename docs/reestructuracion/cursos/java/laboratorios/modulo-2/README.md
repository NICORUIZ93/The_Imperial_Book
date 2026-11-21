# Java · Laboratorio del módulo 2 · Texto y entrada/salida de consola

Código de todos los ejemplos de [modulo-2.md](../../modulo-2.md) y el **lector de guías de envío** de
`rutaflow-nucleo`: comparaciones de `String`, limpieza, acumuladores, code points, formato de salida y
lectura por consola, demostrados con pruebas. Al publicar el curso, esta carpeta pasa a
`examples/java/modulo-2/`.

## Qué cambia respecto al módulo 1

Parte del proyecto Gradle de los módulos 0 y 1 (mismo wrapper, toolchain y catálogo). Cambia:

- `src/main/java/rutaflow/nucleo/GuiaDeEnvio.java`: nuevo `record` con el parseo y la validación de una
  línea `código;destino;peso`. El rechazo **no es una excepción** —`motivoDeRechazo` devuelve el motivo o
  `null`, el mismo contrato que `buscarMal` del tema 1— porque las excepciones se estudian más adelante.
- `src/main/java/rutaflow/nucleo/LectorDeGuias.java`: nuevo punto de entrada (sustituye a `Liquidador`).
  Lee con `IO.readln()` hasta el fin de la entrada y separa en dos salidas: las guías válidas se imprimen
  alineadas por pantalla, el informe de rechazos se acumula en un `StringBuilder` y se escribe al final.
- Pruebas: `GuiaDeEnvioTest`, 12 pruebas. Cada caso es una línea real de `tema-6/datos/guias.txt`, incluidos
  el emoji que ocupa dos unidades UTF-16, el peso escrito en letras y la línea con espacios al borde.
- `build.gradle.kts`: versión 0.3.0, clase principal `rutaflow.nucleo.LectorDeGuias` y
  `standardInput = System.in` en la tarea `run`, sin lo cual el lector vería una tubería cerrada.

Para ver una prueba fallar y luego pasar: en `GuiaDeEnvio` cambia `LARGO_GUIA` de 9 a 10 y ejecuta
`./gradlew test`: fallan 5 de las 12 pruebas (`unaLineaLimpiaSeConvierte`, porque `RF-000123` de 9 caracteres
ahora se rechaza; `deLasSieteLineasDelArchivoTresSirven`, porque no queda ni una válida; y los tres motivos
que se comparan palabra por palabra, que ahora dicen «se esperan 10»). Restaura y vuelve a verde. Es el
mejor ejercicio del módulo: un solo `static final` cambia cinco mensajes a la vez.

## Versiones

JDK 25 (toolchain) · Gradle 9.8.2 (wrapper) · JUnit 6.0.3 (`gradle/libs.versions.toml`).

## Verificar

```bash
./verificar.sh                                             # todo el módulo; termina en «RESULTADO: OK»
EXIGIR_GRADLE=1 ./verificar.sh                             # convierte en fallo la omisión de Gradle
EXIGIR_PTY=1 ./verificar.sh                                # convierte en fallo lo que necesita terminal
GRADLE="./gradlew --offline -I .herramienta-local.init.gradle.kts" ./verificar.sh
```

El último mando es para una máquina **sin JDK 25 instalado**: `.herramienta-local.init.gradle.kts` no forma
parte del curso, es un script de inicialización de Gradle que presta el toolchain 27 para que el `test` se
ejecute aquí. Con JDK 25 instalado no hace falta nada de eso: basta `./gradlew test`.

## Qué hay

| Carpeta | Tema | Ejemplos | Errores reproducibles (`errores/`) | Por dentro (`por-dentro/`) |
|---|---|---|---|---|
| `tema-1/` | `String`, inmutabilidad y pool | `PoolDeLiterales`, `Inmutables`, `CompararGuias` | `HeredaDeString` | — |
| `tema-2/` | API moderna de `String` | `ApiTexto`, `LimpiarYPartir`, `SaltosLinea`, `PlantillaEtiqueta`, `EscapesInvalidos` | `EscapeIlegal` | — |
| `tema-3/` | `StringBuilder` y el coste de concatenar | `Crecimiento`, `CosteReal`, `Precedencia` | `ConstructorReutilizado`, `ValueOfNull` | `SumaEncadenada` |
| `tema-4/` | Code points y charsets | `CodePoints`, `Charsets`, `Normalizacion` | `BytesTruncados` | — |
| `tema-5/` | `printf`, `String.format`, `Formatter` | `Formato`, `Ancho`, `Tabla`, `General`, `Fecha` | `ConversionYTipo`, `FaltanArgumentos`, `ConversionInventada` | — |
| `tema-6/` | `IO`, `Scanner`, `Console`, argumentos | `Argumentos`, `ConPrompt`, `ScannerArchivo`, `TrampaScanner`, `SinConsola`, `MezclaFlujos`, `LectorDeGuias`, `datos/guias.txt` | `CierreScanner`, `ScannerConComa` | — |
| `sonda/` | mediciones sueltas del módulo y del cierre | `Sonda2`, `SondaIO`, `SondaCierre`, `SondaTerminal` | `SondaSinCalificar`, `SondaCompacta` | — |
| raíz | lector de guías | proyecto Gradle con las 12 pruebas | — | — |

Cada ejemplo se ejecuta compilando con `javac --release 25 -encoding UTF-8 -d out tema-N/*.java` y luego
`java -Dstdout.encoding=UTF-8 -cp out Clase`. Los de `errores/` están hechos para fallar: unos no compilan
y otros lanzan una excepción; `verificar.sh` comprueba el mensaje exacto. `sonda/SondaIO.java` no compila a
propósito y se cuenta cuántos símbolos de `java.lang.IO` faltan (25).

## Estado de la verificación (2026-11-20, Temurin 27.0.1.0.2+1, macOS arm64, locale `es_CO`)

- **Ejecutado y comprobado:** `GRADLE="./gradlew --offline -I .herramienta-local.init.gradle.kts"
  ./verificar.sh` termina en `RESULTADO: OK` con **77** comprobaciones, 0 fallidas y 2 omitidas. De esas 77,
  74 son los ejemplos sueltos de los seis temas —todos compilados con `javac --release 25` y ejecutados con
  la JVM 27— y 3 el proyecto Gradle. Sin el script de inicialización, las 3 de Gradle fallan en esta máquina
  (`Cannot find a Java installation … matching {languageVersion=25}`), así que el mando de arriba es el que
  produce este resultado.
- **Proyecto Gradle, ejecutado con el wrapper y otra toolchain:** `./gradlew --offline -I
  .herramienta-local.init.gradle.kts test` — 12 pruebas en verde; `run` con `tema-6/datos/guias.txt` por
  tubería imprime las tres guías alineadas, `válidas : 3 · descartadas: 4` y `peso acumulado : 5301 g`. La
  distribución 9.8.2 y JUnit 6.0.3 salen de la caché local (`--offline`); lo único que falta aquí es el
  JDK 25, y por eso el toolchain se presta con el script de inicialización.
- **Medido con seudoterminal, no con Terminal.app:** lo que exige `System.console()` distinto de `null`
  (`readPassword` sin eco, `consola.flush()`, el tecleo junto al prompt de `ConPrompt`) se midió con
  `script -q /dev/null java -cp out …`. Son las dos comprobaciones que `verificar.sh` omite; con
  `EXIGIR_PTY=1` las exige y fallan hasta que se repitan en una terminal de verdad.
- **Pendiente en el Mac del dueño:** `./verificar.sh` con JDK 25 en PATH (sin el script de inicialización),
  `EXIGIR_GRADLE=1 ./verificar.sh` y las dos comprobaciones de terminal bajo `EXIGIR_PTY=1`.
