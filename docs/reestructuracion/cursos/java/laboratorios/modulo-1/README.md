# Java · Laboratorio del módulo 1 · Datos: tipos, variables y operadores

Código de todos los ejemplos de [modulo-1.md](../../modulo-1.md) y la **calculadora de tarifas** de
`rutaflow-nucleo`: desbordamientos, redondeos y conversiones demostrados con pruebas. Al publicar el curso,
esta carpeta pasa a `examples/java/modulo-1/`.

## Qué cambia respecto al módulo 0

Parte del proyecto Gradle del módulo 0 (mismo wrapper, toolchain y catálogo). Cambia:

- `src/main/java/rutaflow/nucleo/CalculadoraIngenua.java`: la calculadora tal como se escribe la primera
  vez, con cuatro fallos silenciosos (desbordamiento, división entera, truncado, dinero en `double`).
- `src/main/java/rutaflow/nucleo/CalculadoraDeTarifas.java`: la misma, corregida con `long`,
  `Math.*Exact`, `Math.round`, `Math.ceilDiv`, centavos enteros y `BigDecimal`. Sustituye a `Tarifa`.
- `src/main/java/rutaflow/nucleo/Liquidador.java`: nuevo punto de entrada (sustituye a `Cotizador`).
- Pruebas: `CalculadoraIngenuaTest` (4 pruebas que **pasan** y dejan escrito el número equivocado que da
  cada fallo) y `CalculadoraDeTarifasTest` (7 pruebas con el resultado correcto).
- `build.gradle.kts`: versión 0.2.0 y clase principal `rutaflow.nucleo.Liquidador`.

Para ver una prueba fallar y luego pasar: en `CalculadoraDeTarifas.kilos`, cambia `1000.0` por `1000`,
ejecuta `./gradlew test` (falla `losKilosConservanLosDecimales`: `expected: <2.5> but was: <2.0>`) y
restaura.

## Versiones

JDK 25 (toolchain) · Gradle 9.8.2 (wrapper) · JUnit 6.0.3 (`gradle/libs.versions.toml`).

## Verificar

```bash
./verificar.sh                                # todo el módulo; termina en «RESULTADO: OK»
EXIGIR_GRADLE=1 ./verificar.sh                # falla si el wrapper no puede arrancar (úsalo en el Mac)
GRADLE="gradle --offline" ./verificar.sh      # con un Gradle ya instalado, sin red
GRADLE="./gradlew --offline -I .herramienta-local.init.gradle.kts" ./verificar.sh
```

El último mando es para una máquina **sin JDK 25 instalado**: `.herramienta-local.init.gradle.kts` no forma
parte del curso, es un script de inicialización de Gradle que presta el toolchain 27 para que `test` y `run`
se ejecuten aquí. Con JDK 25 en PATH no hace falta: basta `./gradlew test`.

## Qué hay

| Carpeta | Tema | Ejemplos | Errores reproducibles (`errores/`) | Por dentro (`por-dentro/`) |
|---|---|---|---|---|
| `tema-1/` | Primitivos | `Rangos`, `CargaDelDia`, `Literales` | `LiteralGrande`, `ByteFueraDeRango` | `Constantes` |
| `tema-2/` | Valores y referencias | `CopiaYAlias`, `EtiquetaDeEnvio` | `PrimitivoNull`, `DestinoNulo` | `Identidad` |
| `tema-3/` | Variables, `final`, `var` | `Ambito`, `ResumenDeRuta` | `SinInicializar`, `FinalReasignada`, `FueraDeAmbito`, `VarSinInicializador`, `VarNull`, `VarCompuesta`, `VarCambiaDeTipo` | `ConVar`, `SinVar`, `ConFinal` |
| `tema-4/` | Conversiones | `Conversiones`, `ConvertirPeso` | `Estrechar` | `Conv` |
| `tema-5/` | Operadores | `Operadores`, `ReglasDeDespacho` | `AsignarEnCondicion` | `Corto` |
| `tema-6/` | Punto flotante | `PuntoFlotante`, `SumaDeTarifas` | `DivisionEntera` | `Bits`, `Fp` |
| `tema-7/` | `Math`, aleatorios, `BigDecimal` | `UtilidadesMath`, `Aleatorios`, `LiquidacionDeFlete` | `DecimalSinFin`, `OperadoresEnBigDecimal` | `Escala` |
| raíz | Calculadora de tarifas | proyecto Gradle | — | — |

Cada ejemplo se ejecuta con `java -Dstdout.encoding=UTF-8 Archivo.java`. Los de `errores/` están hechos
para fallar: unos no compilan y otros lanzan una excepción; `verificar.sh` comprueba el mensaje exacto. Los
de `por-dentro/` se miran con `javac -d out Archivo.java && javap -c -cp out Clase`.

Algunos ejemplos terminan a propósito con una excepción (`EtiquetaDeEnvio`, `ConvertirPeso`,
`ReglasDeDespacho`): es el error que el tema enseña a leer.

## Estado de la verificación (2026-11-20, Temurin 27.0.1.0.2+1, macOS arm64, locale `es_CO`)

- **Ejecutado y comprobado aquí:** `GRADLE="./gradlew --offline -I .herramienta-local.init.gradle.kts"
  ./verificar.sh` termina en `RESULTADO: OK` con **70** comprobaciones, 0 fallidas y 0 omitidas. De esas 70,
  67 son los ejemplos, errores y bytecode de los temas 1 a 7, y 3 el proyecto Gradle: que el `build` esté
  escrito en Kotlin DSL con toolchain y catálogo, `gradlew test` con las 11 pruebas y `gradlew run
  --args="2500"` liquidando el envío (`Total con IVA: $13566.00`).
- **Qué se prestó:** la distribución Gradle 9.8.2 y JUnit 6.0.3 salen de la caché local (`--offline`), así
  que el wrapper sí arranca. Lo único que falta en esta máquina es el JDK 25: sin el script de inicialización
  las dos comprobaciones de Gradle fallan con `Cannot find a Java installation … matching
  {languageVersion=25}`, y con él se compila y se ejecuta con el 27 instalado. Sin ese script el total queda
  en **68 / 2 / 0**.
- **Corrección de una nota anterior (Ubuntu x86-64, OpenJDK 25.0.5, mismo día):** allí se escribió que el
  wrapper no podía descargar Gradle 9.8.2 ni JUnit 6.0.3 y que el build se había hecho con Gradle 8.14.3 y
  JUnit 5.10.1. En esta máquina esa limitación no se reproduce: el wrapper y el JUnit 6.0.3 funcionan. La
  cuenta cuadra: descontando aquí las dos comprobaciones que ejecutan Gradle quedan 68, las mismas 68
  (67 de ejemplos más la del `build` en Kotlin DSL).
- **Corrección del mismo día, sobre los flags de la sección 7 del tema 2:** el documento afirmaba
  `ThreadStackSize = 1024` («1 MB por hilo en esta plataforma»), `InitialHeapSize = 100663296`,
  `MaxHeapSize = 1610612736` y `UseCompactObjectHeaders = false` activado «no por defecto, como muestra la
  salida de abajo». Ejecutado hoy en esta máquina (macOS aarch64, `hw.memsize` = 17 179 869 184) con las **dos
  JVM instaladas** —OpenJDK 26.0.2+10-55 y Temurin 27.0.1.0.2+1—, ninguna de las tres primeras cifras sale:
  `ThreadStackSize` vale 2048 KB en las dos, `InitialHeapSize` 8388608 y `MaxHeapSize` 4294967296 (justo la
  cuarta parte de la RAM). Lo único que se parece a lo escrito es la cabecera compacta, y solo para la build
  vieja: `false {default}` en 26.0.2 y `true {default}` en 27.0.1, sin que nadie la active. De dónde salieron
  1024, 100663296 y 1610612736 no está en el repo: no hay ninguna corrida que los produzca.
- **Qué comprueban las 3 comprobaciones nuevas** (bloque del tema 2, `espera` sobre `java -XX:+PrintFlagsFinal`):
  que el `grep` de la sección 7 selecciona exactamente los cinco flags; que la línea de `ThreadStackSize` trae
  el origen `{default}` cuando nadie la toca —el número se sustituye por `<valor>` con `sed`, porque lo define
  la plataforma y no debe congelarse—, y que con `-Xss256k` el mismo flag devuelve `256` con origen
  `{command line}`. Lo que se fija es **cómo se lee y quién manda en cada valor**, no el valor de esta máquina;
  por eso pasan igual en cualquier macOS o Linux con cualquier build.
- **Pendiente en el Mac del dueño:** `./verificar.sh` con JDK 25 en PATH y sin el script de inicialización,
  más `EXIGIR_GRADLE=1 ./verificar.sh`. Al ejecutarlo conviene correr también las dos líneas de
  `PrintFlagsFinal` de la sección 7 del tema 2: si su JDK 25 dice `UseCompactObjectHeaders = false`, esa es la
  prueba directa de que el flag depende de la build, y vale la pena anotar el número aquí.
