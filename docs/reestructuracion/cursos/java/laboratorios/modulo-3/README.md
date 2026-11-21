# Java · Laboratorio del módulo 3 · Control de flujo y métodos

Código de todos los ejemplos de [modulo-3.md](../../modulo-3.md) y el **despachador de guías** de
`rutaflow-nucleo`: decisiones con `if` y ternario, `switch` de sentencia y de expresión, los cuatro lazos
con etiquetas, la forma de los métodos (firma, paso por valor, sobrecarga, varargs), la recursión contra la
pila real y la lectura de trazas. Al publicar el curso, esta carpeta pasa a `examples/java/modulo-3/`.

## Qué cambia respecto al módulo 2

Parte del proyecto Gradle de los módulos 0, 1 y 2 (mismo wrapper, toolchain y catálogo). Cambia:

- `src/main/java/rutaflow/nucleo/Zona.java`: nuevo `enum` de cinco zonas. Aquí se usa como constante; su
  forma con campos y métodos llega en M5.
- `src/main/java/rutaflow/nucleo/Despachador.java`: nuevo punto de entrada (sustituye a `LectorDeGuias`).
  Toda la lógica es control de flujo: `tarifaBase` es una **expresión switch** con un caso de bloque y
  `yield`; `tarifa` resuelve el descuento por volumen con ternarios anidados; `guiasAceptadas` lleva un
  `break` con etiqueta y un `continue`; `sumaGramos` es recursiva y tiene una sobrecarga `varargs`;
  `gramosDe` devuelve `-1` en vez de lanzar.
- Pruebas: `DespachadorTest`, 12 pruebas. Cada una comprueba una decisión, no un resultado acumulado: las
  fronteras de peso (1000/1001 y 5000/5001), los tres peldaños del descuento (9, 10 y 50 envíos), que el
  `break TANDA` corta la tanda y que el `continue` sobre una guía sin peso no la corta.
- `build.gradle.kts`: versión 0.4.0 y clase principal `rutaflow.nucleo.Despachador`. Se quita el
  `standardInput = System.in` del módulo 2: el despachador no lee la consola.

Para ver una prueba fallar y luego pasar: en `Despachador.tarifa` cambia `envios >= 10` a `envios > 10` y
ejecuta `./gradlew test`: falla `elVolumenMultiplicaALdiezAVeinteyOcho` (los 10 envíos pasan de nueve
décimas a precio completo). Cambia también `gramos <= 1000` a `gramos < 1000` y falla
`elPrimerCorteDePesoEsLosMilGramos`, porque 1000 g sube de peldaño. Restaura y vuelve a verde.

## Versiones

JDK 25 (toolchain) · Gradle 9.8.2 (wrapper) · JUnit 6.0.3 (`gradle/libs.versions.toml`).

## Verificar

```bash
./verificar.sh                                             # necesita JDK 25 en PATH
GRADLE="./gradlew --offline -I .herramienta-local.init.gradle.kts" ./verificar.sh
EXIGIR_GRADLE=1 ./verificar.sh                             # convierte en fallo la omisión de Gradle
```

El segundo mando es para una máquina **sin JDK 25 instalado**: `.herramienta-local.init.gradle.kts` no forma
parte del curso, es un script de inicialización de Gradle que presta el toolchain 27 para que el `test` se
ejecute aquí. Con JDK 25 instalado no hace falta nada de eso: basta `./verificar.sh`.

## Qué hay

| Carpeta | Tema | Ejemplos | Errores reproducibles (`errores/`) | Por dentro (`por-dentro/`) |
|---|---|---|---|---|
| `tema-1/` | `if`, ternario y condiciones legibles | `DecidirPrecedencia`, `CondicionesLegibles` | `TernarioDesempaqueta`, `ConversionConPerdida`, `AsignarEnIf`, `TernarioTipos` | `Ramas` |
| `tema-2/` | `switch`: sentencia, expresión, flecha, `yield`, exhaustividad | `ZonaClasica`, `ZonaConFlecha`, `CambiosYDias` | `SinRomper`, `NoExaustivo`, `SobreLong`, `LargoConCaseInt`, `CaseDuplicado`, `NuloSinCaseNull`, `FaltaReturn` | `SwitchInterno`, `UsaZonaExterna` + `ZonaExt`, `SwitchConNull` |
| `tema-3/` | `for`, `while`, `do`, for-each, `break`, `continue`, etiquetas | `RecorrerGuias`, `EtiquetasEnMatriz` | `IndiceFuera`, `AvanceTrasContinue`, `CambiaMientrasRecorres`, `BorraDetras` | `Bucles` |
| `tema-4/` | métodos: firma, retorno, paso por valor, sobrecarga, varargs | `Llamadas`, `PasoPorValor`, `Reparto`, `Sobrecargas` | `Ambigua`, `RepiteFirma`, `VarArgsNoLast`, `CampoSinObjeto` | `Slots` |
| `tema-5/` | recursión y la pila de llamadas | `CuentaAtras`, `ProfundidadPila`, `ColaSinOptimizacion`, `MarcoGrande` | `SinCasoBase` | `Recursividad` |
| `tema-6/` | leer una traza y depurar con método | `Trazas`, `CausaEncadenada` + `Tabla`, `DepuraConMetodo` | — | `TrazasSinLineas` |
| raíz | despachador | proyecto Gradle con las 12 pruebas | — | — |

Cada ejemplo se ejecuta compilando con `javac --release 25 -d out clase.java` y luego
`java -Dstdout.encoding=UTF-8 -cp out Clase`. Los de `errores/` están hechos para fallar: unos no compilan y
otros lanzan una excepción; `verificar.sh` comprueba el mensaje exacto.

## Estado de la verificación (2026-11-20, Temurin 27.0.1.0.2+1, macOS arm64, locale `es_CO`)

- **Ejecutado y comprobado:** `GRADLE="./gradlew --offline -I .herramienta-local.init.gradle.kts"
  ./verificar.sh` termina en `RESULTADO: OK` con **108** comprobaciones, 0 fallidas y 0 omitidas. De esas
  108, 105 son los ejemplos sueltos de los seis temas —todos compilados con `javac --release 25` y ejecutados
  con la JVM 27— y 3 el proyecto Gradle. Sin el script de inicialización fallan exactamente esas 2 de `test`
  y `run` (`Cannot find a Java installation … matching {languageVersion=25}`) y el total queda en
  106 / 2 / 0. Reparto por bloque: T1 11 · T2 29 · T3 16 · T4 22 · T5 16 · T6 11 · Gradle 3.
- **Proyecto Gradle, ejecutado con el wrapper y otra toolchain:** `./gradlew --offline -I
  .herramienta-local.init.gradle.kts test` — 12 pruebas en verde. `run` imprime las cinco tarifas por zona,
  `guias aceptadas con tope 2000 g: 1`, `gramos totales de la tanda: 5540`, `tarifa(3400 g, 12 envios):
  12150` y `tarifa(3400 g): 13500`. La distribución 9.8.2 y JUnit 6.0.3 salen de la caché local
  (`--offline`).
- **Mediciones de pila, que dependen del `-Xss`, del tamaño del marco y de la corrida.** Con `-Xss256k`,
  `ProfundidadPila` dio **1478** marcos en 12 de las 13 corridas de hoy y **1717** en una: con pila pequeña el
  número es *casi* fijo, no fijo. Con el tamaño por defecto (`ThreadStackSize = 2048` KB, leído con
  `HotSpotDiagnosticMXBean`) las ocho corridas de hoy dieron 42 336 / 44 248 / 44 900 / 45 527 / 45 639 /
  45 921 / 46 159 / 46 378, y en una sesión anterior 45 333 / 45 921 / 46 159 / 47 355; con `-Xss4m`, hoy
  95 022 / 97 871 / 98 628 / 116 917 / 135 231 y en aquella sesión 98 544 / 98 710 / 153 731 / 164 941. Es
  decir: **el número de marcos alcanzados no es reproducible entre corridas**, y por eso no se cifra ni se
  enseña como dato del lenguaje. Lo estable medido hoy es otra cosa: el tope de la traza siempre **1024**
  marcos (`MaxJavaStackTraceDepth`, un límite aparte del tamaño de la pila — medido también que con
  `-XX:MaxJavaStackTraceDepth=5` se imprimen 5 mientras se llamaron 37 796), `getMessage()` del
  `StackOverflowError` siempre `null`, y la **relación** entre marcos gordos y flacos con el mismo `-Xss`
  (`MarcoGrande`: 1479 contra 887, idéntico en tres corridas). `verificar.sh` comprueba el tope de la traza,
  que `-Xss256k` se lea como 256 KB, esa relación de `MarcoGrande`, los 1023 marcos repetidos de la línea de
  la llamada en `SinCasoBase` y los 3 marcos que deja `CuentaAtras` con tres envíos; nunca comprueba cuántos
  marcos aguanta la pila por defecto. Del tema 6 comprueba dos cosas que dependen del arranque y no del
  lenguaje: que la elipsis diga `... 1 more` sobre la versión **compilada** (en modo fuente el mismo programa
  da `... 6 more`, porque `main` ya no es el fondo de la torre) y que `Unknown Source` salga solo con
  `-g:none`, mientras que con `-g` los marcos propios conservan su número de línea.
- **Seis creencias habituales que la máquina desmintió mientras se escribía el módulo**, y que por eso
  tienen su comprobación en `verificar.sh`:
  1. «el `default` de un `switch` de enum atiende al `null`»: no. Sin `case null` escrito, `tarifaBase(null)`
     lanza `NullPointerException` antes de mirar el `default`; con `case null` sí entra.
  2. «`continue` en un `for` se salta el avance»: no. La expresión de avance del `for` vive fuera del cuerpo
     y sí se ejecuta; el bucle que no avanza es el `while` con `continue` por delante del `i++`.
  3. «javac siempre genera la clase sintética con `$SwitchMap$` para un `switch` de enum»: tiene dos
     excepciones medidas. Con el enum en la **misma unidad** sale `ordinal()` + `tableswitch`/`lookupswitch`
     y no se crea ninguna clase (`tema-2/por-dentro/SwitchInterno.java`). Y con el enum en otra unidad pero
     una rama **`case null`** escrita, javac emite `invokedynamic java/lang/runtime/SwitchBootstraps.enumSwitch`
     con las constantes nombradas como argumentos estáticos —medido: solo las 3 que el `switch` menciona, de
     las 5 del enum—, el `null` entra al `tableswitch` como `-1` y **tampoco** aparece la clase sintética
     (`tema-2/por-dentro/SwitchConNull.java`). El mapa solo hace falta cuando el enum es externo *y* no se
     escribe `case null` (`tema-2/por-dentro/UsaZonaExterna.java`).
  4. «un `if (n = 6)` es una errata que el compilador pasa por alto»: no compila
     (`int cannot be converted to boolean`).
  5. «`ConcurrentModificationException` es intermitente, según la suerte»: no es suerte, es posición. Medido
     con `BorraDetras` sobre el mismo código: con tres elementos, borrar el último **sí** lanza; con dos,
     termina en silencio y deja `[bogota]`, porque el cursor ya llegó al `size` y no llama a `next()`, que es
     donde `ArrayList` comprueba el `modCount`.
  6. «una recursión de cola no desborda porque la JVM la vuelve bucle»: desborda igual. Medido en
     `ColaSinOptimizacion` (`sumaDeCola desbordo`) y en el bytecode de `Recursividad.factorialDeCola`, que
     termina en `invokestatic` seguido de `lreturn`: la llamada sigue siendo una llamada.
- **Pendiente en el Mac del dueño:** `./verificar.sh` con JDK 25 en PATH (sin el script de inicialización) y
  `EXIGIR_GRADLE=1 ./verificar.sh`.
