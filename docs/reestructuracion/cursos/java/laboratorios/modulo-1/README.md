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
```

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

## Estado de la verificación (2026-11-20, OpenJDK 25.0.5, Ubuntu x86-64)

- **Ejecutado y comprobado:** todos los ejemplos, errores y bytecode de los temas 1 a 7 (65 comprobaciones
  de `verificar.sh`).
- **Proyecto Gradle, ejecutado con otra versión de la herramienta:** igual que en el módulo 0, el wrapper no
  pudo descargar Gradle 9.8.2 ni JUnit 6.0.3 (red bloqueada). El mismo build se ejecutó con Gradle 8.14.3
  local, sin conexión, con JUnit 5.10.1 y toolchain JDK 25: las 11 pruebas pasan y `run` liquida un envío.
- **Pendiente en el Mac del dueño:** `EXIGIR_GRADLE=1 ./verificar.sh` con el wrapper.
