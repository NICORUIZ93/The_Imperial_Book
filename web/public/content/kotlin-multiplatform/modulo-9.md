# Módulo 9: Testing multiplataforma


## Aprende construyendo


### Tema 1: kotlin.test en commonTest · Avanzado · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a escribir un test en commonTest que verifique ObtenerTareasPendientesUseCase (Módulo 4) una sola vez y lo ejecutes contra el target Android y el target iOS sin duplicar código. Prerrequisitos: JDK 25 y el Gradle Wrapper del proyecto (módulo 0, «Antes de comenzar…

#### ► LA ANALOGÍA
`kotlin.test` ofrece aserciones (`assertEquals`, `assertTrue`) que se compilan contra la implementación de testing de cada target, permitiendo escribir un único test en `commonTest` que corre de forma nativa en ambas plataformas. La analogía es una única inspección de calidad aplicada automáticamente a dos fábricas que siguen el mismo plano.

**Conceptos clave:** un único test, ejecutado contra ambos targets.

```kotlin
class ObtenerTareasPendientesUseCaseTest {
    @Test
    fun filtraSoloPendientes() = runTest {
        val repoFake = TareaRepositoryFake(listOf(
            Tarea("1", "A", completada = false),
            Tarea("2", "B", completada = true),
        ))
        val resultado = ObtenerTareasPendientesUseCase(repoFake)()
        assertEquals(1, resultado.size)
    }
}
```

Este test, escrito una única vez en el source set `commonTest` (el equivalente de `commonMain` pero para código de pruebas), se compila y ejecuta contra el target Android y contra el target iOS de forma completamente independiente, confirmando que la lógica del caso de uso `ObtenerTareasPendientesUseCase` (Módulo 4) se comporta de forma idéntica en ambas plataformas sin necesidad de duplicar el esfuerzo de escribir y mantener dos suites de pruebas separadas y potencialmente divergentes, una directa consecuencia de que la lógica bajo prueba en sí vive completamente en `commonMain` sin ningún código específico de plataforma que pudiera comportarse de forma distinta entre ambos targets.

Esta capacidad de "escribir una vez, probar en ambas plataformas" es el complemento natural de "escribir una vez, ejecutar en ambas plataformas" (el principio central de KMP estudiado desde el Módulo 3): si la lógica de negocio vive completamente en código compartido, las pruebas de esa lógica también pueden y deben vivir completamente en código compartido, obteniendo automáticamente el mismo beneficio de verificación dual sin trabajo adicional específico por plataforma.

**Analogía:** un test en `commonTest` es como una única inspección de calidad que se aplica automáticamente al producto fabricado en cualquiera de dos fábricas idénticas que siguen exactamente el mismo plano de fabricación, confirmando que ambas fábricas producen resultados consistentes sin necesidad de un inspector distinto y un criterio de evaluación separado para cada fábrica.

**¿Por qué es importante?** Un test escrito una única vez en `commonTest` confirma que la lógica compartida se comporta de forma idéntica en ambas plataformas, sin duplicar el esfuerzo de escribir y mantener suites de pruebas separadas por plataforma.

**Casos de uso reales:**
- Verificar `ObtenerTareasPendientesUseCase` (Módulo 4) una sola vez y confiar en que el resultado es idéntico en Android e iOS.
- Detectar en CI (Módulo 10) si un cambio en `commonMain` rompe la lógica compartida antes de compilar ambas apps completas.
- Cubrir reglas de negocio críticas (cálculo de precios, validaciones) con un único test suite mantenido por un solo equipo.

**Transferencia al proyecto integrador «Núcleo móvil compartido»:** Prueba en commonTest las reglas de confirmación con datos válidos, duplicados e incompletos. Ejecuta los targets disponibles y documenta las pruebas nativas adicionales que commonTest no sustituye.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Objetivo observable
Al finalizar vas a escribir un test en `commonTest` que verifique `ObtenerTareasPendientesUseCase` (Módulo 4) una sola vez y lo ejecutes contra el target Android y el target iOS sin duplicar código. Prerrequisitos: JDK 25 y el Gradle Wrapper del proyecto (módulo 0, «Antes de comenzar»; comprueba con `./gradlew --version`).

</details>

### Tema 2: Fakes en vez de mocks · Avanzado · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a reemplazar un mock generado dinámicamente por un TareaRepositoryFake escrito a mano, compatible con cualquier target de Kotlin Multiplatform. Prerrequisitos: Tema 1 de este módulo.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    CT[commonTest] --> Fake[TareaRepositoryFake Kotlin puro]
    CT --> Mock[Mock dinamico via bytecode JVM]
    Fake --> AND[Target Android compila]
    Fake --> IOS[Target iOS Kotlin Native compila]
    Mock --> AND
    Mock --> FAIL[compileKotlinIosArm64 falla]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación

```kotlin
class TareaRepositoryFake(private val datos: List<Tarea>) : TareaRepository {
    override suspend fun obtenerTodas() = datos
}
```

```bash
./gradlew :shared:allTests
```

</details>

### Tema 3: runTest para coroutines · Avanzado · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a escribir un test con runTest que verifique una función suspend con delay() interno, corriendo instantáneamente en tiempo real. Prerrequisitos: Tema 2 de este módulo.

#### ► CÓMO FUNCIONA
```mermaid
sequenceDiagram
    participant Test as Test runTest
    participant VD as Dispatcher tiempo virtual
    Test->>VD: delay 5000 ms simulados
    VD-->>Test: avanza sin esperar reloj real
    Test->>Test: assertEquals esperado resultado
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```kotlin
@Test
fun pruebaConDelay() = runTest {
    val resultado = funcionConDelay() // el delay() interno se "salta" en tiempo virtual, el test corre instantáneo
    assertEquals(esperado, resultado)
}
```

```mermaid
sequenceDiagram
    participant Test as Test runTest
    participant VD as Dispatcher tiempo virtual
    Test->>VD: delay 5000 ms simulados
    VD-->>Test: avanza sin esperar reloj real
    Test->>Test: assertEquals esperado resultado
```

```kotlin
@Test
fun pruebaConDelay() = runTest {
    val resultado = funcionConDelay() // el delay() interno se "salta" en tiempo virtual
    assertEquals(esperado, resultado)
}
```

```bash
./gradlew :shared:allTests
```

</details>

### Tema 4: Benchmarks multiplataforma con kotlinx-benchmark: medir el mismo código en cada target · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Usa un proyecto KMP con el plugin org.jetbrains.kotlinx.benchmark y la librería kotlinx-benchmark-runtime. El plugin allopen es necesario para la JVM. Crea el source set de benchmarks en commonMain o en un módulo benchmarks.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    B["@Benchmark en commonMain"] --> J["jvmBenchmark (JMH)"]
    B --> N["macosArm64Benchmark (Native)"]
    J & N --> R["ops/s ± error"]
    R --> D["comparar implementaciones por target"]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    B["@Benchmark en commonMain"] --> J["jvmBenchmark (JMH)"]
    B --> N["macosArm64Benchmark (Native)"]
    J & N --> R["ops/s ± error"]
    R --> D["comparar implementaciones por target"]
```

```kotlin
plugins {
    id("rutaflow.kmp.library")
    id("org.jetbrains.kotlinx.benchmark") version "0.4.14"
    kotlin("plugin.allopen") version "2.4.21"
}

allOpen { annotation("org.openjdk.jmh.annotations.State") }

kotlin {
    macosArm64()
    sourceSets.commonMain.dependencies { implementation("org.jetbrains.kotlinx:kotlinx-benchmark-runtime:0.4.14") }
}

benchmark {
    targets { register("jvm"); register("macosArm64") }
    configurations.named("main") { warmups = 3; iterations = 5; iterationTime = 1; iterationTimeUnit = "s" }
}
```

```kotlin
package co.rutaflow.bench

import kotlinx.benchmark.*

@State(Scope.Benchmark)
class ParadasBenchmark {
    private lateinit var codigos: List<String>
    private lateinit var buscados: List<String>

    @Setup fun preparar() {
        codigos = List(5_000) { "ENV-$it" }
        buscados = List(500) { "ENV-${it * 7}" }
    }

    @Benchmark fun buscarEnLista(): Int = buscados.count { it in codigos }  // O(n) por búsqueda

    @Benchmark fun buscarEnSet(): Int {
        val conjunto = codigos.toHashSet()                                  // O(1) por búsqueda
        return buscados.count { it in conjunto }
    }
}
```

```bash
./gradlew :shared:jvmBenchmark
./gradlew :shared:macosArm64Benchmark   # en una Mac con chip Apple
```

```text
Benchmark                            Mode  Cnt      Score     Error  Units
ParadasBenchmark.buscarEnLista      thrpt    5     ~260   ±   10  ops/s
ParadasBenchmark.buscarEnSet        thrpt    5   ~3 900   ±  120  ops/s
(las cifras dependen de la máquina; buscarEnSet debe ganar por un orden de magnitud en los dos targets)
```

</details>
