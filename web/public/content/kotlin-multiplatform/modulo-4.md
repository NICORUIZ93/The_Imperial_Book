# Módulo 4: Lógica de negocio compartida

Cada tema se practica por separado con su propia repetición progresiva y su propio reto de memoria — modelos de dominio, repositorios con interfaz común, inyección de dependencias con Koin, y modelado explícito de errores son la base de cualquier capa de dominio compartida entre Android e iOS.


## Aprende construyendo


### Tema 1: Modelos de dominio y casos de uso · Avanzado · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás declarar un modelo de dominio en commonMain y un caso de uso que depende de una interfaz (no de una implementación concreta), y explicar por qué esa dependencia hacia la interfaz permite testear el caso de uso de forma aislada.

#### ► LA ANALOGÍA
**Conceptos clave:** `data class` compartida en `commonMain`, caso de uso dependiente de interfaz (no de implementación).

`data class Tarea(val id: String, val titulo: String, val completada: Boolean)` en `commonMain` representa una entidad central sin ninguna dependencia hacia persistencia, red o UI de ninguna plataforma específica. `class ObtenerTareasPendientesUseCase(private val repositorio: TareaRepository) { suspend operator fun invoke(): List<Tarea> = repositorio.obtenerTodas().filter { !it.completada } }` encapsula lógica de negocio dependiendo explícitamente de la INTERFAZ `TareaRepository`, no de ninguna implementación concreta — el mismo principio de inversión de dependencias visto para Spring (Módulo 0 del track Spring Boot), aquí manual, sin framework de IoC automático.

**Analogía:** un modelo de dominio compartido es una definición única y oficial que todos los departamentos usan exactamente igual, evitando interpretaciones divergentes; un caso de uso que depende de una interfaz es un procedimiento que especifica qué información necesita sin importarle de qué proveedor específico proviene, siempre que cumpla el formato acordado.

**Diagrama:**

```mermaid
flowchart LR
  A["ObtenerTareasPendientesUseCase"] --> B["TareaRepository (interfaz)"]
  B -.->|implementación real| C[TareaRepositoryImpl]
  B -.->|implementación fake| D[FakeTareaRepository]
```

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
  A["ObtenerTareasPendientesUseCase"] --> B["TareaRepository (interfaz)"]
  B -.->|implementación real| C[TareaRepositoryImpl]
  B -.->|implementación fake| D[FakeTareaRepository]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación

```kotlin
package com.academia.kmp

data class Tarea(val id: String, val titulo: String, val completada: Boolean)

interface TareaRepository {
    suspend fun obtenerTodas(): List<Tarea>
    suspend fun guardar(tarea: Tarea)
}

class ObtenerTareasPendientesUseCase(private val repositorio: TareaRepository) {
    suspend operator fun invoke(): List<Tarea> =
        repositorio.obtenerTodas().filter { !it.completada }
}
```

```bash
# compila el módulo compartido de Kotlin Multiplatform con Gradle
mkdir -p academia-kmp/shared/src/commonMain/kotlin/com/academia/kmp
cd academia-kmp
./gradlew :shared:compileKotlinMetadata
```

```kotlin
package com.academia.kmp

import kotlinx.coroutines.delay
import kotlinx.coroutines.test.runTest
import kotlin.test.Test
import kotlin.test.assertEquals

private val tareaPendiente = Tarea("1", "Comprar leche", completada = false)

class RepositorioEnMemoria : TareaRepository {
    override suspend fun obtenerTodas(): List<Tarea> = listOf(tareaPendiente)
    override suspend fun guardar(tarea: Tarea) = Unit
}

class RepositorioConLatencia : TareaRepository {
    override suspend fun obtenerTodas(): List<Tarea> {
        delay(300) // simula red/DB real
        return listOf(tareaPendiente)
    }
    override suspend fun guardar(tarea: Tarea) = Unit
}

class DominioTest {
    @Test
    fun elCasoDeUsoProduceElMismoResultadoConCualquierImplementacion() = runTest {
        val resultadoFake = ObtenerTareasPendientesUseCase(RepositorioEnMemoria())()
        val resultadoConLatencia = ObtenerTareasPendientesUseCase(RepositorioConLatencia())()
        assertEquals(resultadoFake, resultadoConLatencia)
        assertEquals(listOf(tareaPendiente), resultadoFake)
    }
}
```

```bash
# ejecuta el test Kotlin del módulo compartido
cd academia-kmp
./gradlew :shared:allTests
```

```kotlin
class GuardarTareaUseCase(private val repositorio: ____) {
    suspend operator fun invoke(tarea: Tarea) = repositorio.guardar(tarea)
}
```

</details>

### Tema 2: Repositorios con interfaz común · Avanzado · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás definir una interfaz de repositorio en commonMain con al menos dos implementaciones, y explicar por qué esto permite testear la lógica de negocio sin infraestructura real.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌── interface TareaRepository ─────────────────────────────┐
│  suspend fun obtenerTodas(): List<Tarea>                    │
│  suspend fun guardar(tarea: Tarea)                           │
└──────┬─────────────────────────────────┬──────────────┘
       │                                    │
┌──────▼──────────┐                ┌──────▼──────────┐
│ TareaRepositoryImpl │                │ FakeTareaRepository │
│ (api + db reales)    │                │ (en memoria, tests)   │
└─────────────────┘                └─────────────────┘
```

```kotlin
package com.academia.kmp

class TareaRepositoryImpl(private val api: Any, private val db: Any) : TareaRepository {
    override suspend fun obtenerTodas(): List<Tarea> = emptyList() // combinaría api y db reales
    override suspend fun guardar(tarea: Tarea) { /* persiste en db, sincroniza con api */ }
}

class FakeTareaRepository(private val datos: MutableList<Tarea> = mutableListOf()) : TareaRepository {
    override suspend fun obtenerTodas(): List<Tarea> = datos.toList()
    override suspend fun guardar(tarea: Tarea) { datos.add(tarea) }
}
```

```bash
# compila el módulo compartido de Kotlin Multiplatform con Gradle
mkdir -p academia-kmp/shared/src/commonMain/kotlin/com/academia/kmp
cd academia-kmp
./gradlew :shared:compileKotlinMetadata
```

```kotlin
package com.academia.kmp

import kotlinx.coroutines.test.runTest
import kotlin.test.Test
import kotlin.test.assertEquals

class RepositorioTest {
    @Test
    fun fakeGuardaYDevuelveLoGuardado() = runTest {
        val repo: TareaRepository = FakeTareaRepository()
        val tarea = Tarea("1", "Comprar leche", completada = false)
        repo.guardar(tarea)
        assertEquals(listOf(tarea), repo.obtenerTodas())
    }
}
```

```bash
# ejecuta el test Kotlin del módulo compartido
cd academia-kmp
./gradlew :shared:allTests
```

```kotlin
class FakeTareaRepository : ____ {
    private val datos = mutableListOf<Tarea>()
    override suspend fun obtenerTodas(): List<Tarea> = datos.toList()
    override suspend fun guardar(tarea: Tarea) { datos.add(tarea) }
}
```

</details>

### Tema 3: Inyección de dependencias multiplataforma con Koin · Avanzado · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás distinguir entre una dependencia single (una única instancia compartida) y una factory (nueva instancia cada vez), y configurar Koin para resolver la cadena completa de dependencias una sola vez para todas las plataformas.

#### ► LA ANALOGÍA
**Conceptos clave:** `single` (instancia única compartida), `factory` (nueva instancia por solicitud), módulo de Koin en `commonMain`.

`val sharedModule = module { single<TareaRepository> { TareaRepositoryImpl(get(), get()) }; factory { ObtenerTareasPendientesUseCase(get()) } }` configura Koin (un framework de DI ligero, sin generación de código en compilación) para resolver automáticamente la cadena de dependencias: `TareaRepository` se resuelve como una única instancia compartida (`single`), mientras `ObtenerTareasPendientesUseCase` se crea nueva cada vez que se solicita (`factory`). Koin funciona idénticamente en `commonMain` para todas las plataformas, sin un framework de DI distinto por plataforma.

**Analogía:** Koin es un directorio de contactos universal que funciona igual en cualquier oficina de la empresa, resolviendo automáticamente quién debe conectarse con quién según relaciones declaradas una única vez.

**Diagrama:**

```mermaid
flowchart LR
  A["single: TareaRepository"] -->|misma instancia siempre| B[primera solicitud]
  A -->|misma instancia siempre| C[segunda solicitud]
  D["factory: ObtenerTareasPendientesUseCase"] -->|instancia NUEVA| E[primera solicitud]
  D -->|instancia NUEVA| F[segunda solicitud]
```

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
  A["single: TareaRepository"] -->|misma instancia siempre| B[primera solicitud]
  A -->|misma instancia siempre| C[segunda solicitud]
  D["factory: ObtenerTareasPendientesUseCase"] -->|instancia NUEVA| E[primera solicitud]
  D -->|instancia NUEVA| F[segunda solicitud]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
  A["single: TareaRepository"] -->|misma instancia siempre| B[primera solicitud]
  A -->|misma instancia siempre| C[segunda solicitud]
  D["factory: ObtenerTareasPendientesUseCase"] -->|instancia NUEVA| E[primera solicitud]
  D -->|instancia NUEVA| F[segunda solicitud]
```

```kotlin
package com.academia.kmp

import org.koin.dsl.module

val sharedModule = module {
    single<TareaRepository> { FakeTareaRepository() }
    factory { ObtenerTareasPendientesUseCase(get()) }
}
```

```bash
# compila el módulo compartido de Kotlin Multiplatform con Gradle
mkdir -p academia-kmp/shared/src/commonMain/kotlin/com/academia/kmp
cd academia-kmp
./gradlew :shared:compileKotlinMetadata
```

```kotlin
package com.academia.kmp

import org.koin.core.context.startKoin
import org.koin.core.context.stopKoin
import org.koin.test.KoinTest
import org.koin.test.inject
import kotlin.test.AfterTest
import kotlin.test.BeforeTest
import kotlin.test.Test
import kotlin.test.assertNotSame
import kotlin.test.assertSame

class DiModuleTest : KoinTest {
    @BeforeTest
    fun iniciarKoin() { startKoin { modules(sharedModule) } }

    @AfterTest
    fun detenerKoin() { stopKoin() }

    @Test
    fun singleDevuelveSiempreLaMismaInstancia() {
        val repo1: TareaRepository by inject()
        val repo2: TareaRepository by inject()
        assertSame(repo1, repo2)
    }

    @Test
    fun factoryDevuelveUnaInstanciaNuevaEnCadaSolicitud() {
        val caso1: ObtenerTareasPendientesUseCase by inject()
        val caso2: ObtenerTareasPendientesUseCase by inject()
        assertNotSame(caso1, caso2)
    }
}
```

```bash
# ejecuta el test Kotlin del módulo compartido, arrancando Koin de verdad
cd academia-kmp
./gradlew :shared:allTests
```

```kotlin
val sharedModule = module {
    ____<TareaRepository> { TareaRepositoryImpl(get(), get()) }
}
```

</details>

### Tema 4: Modelado de errores de dominio con un tipo Result explícito · Avanzado · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás modelar el resultado de una operación que puede fallar con un tipo explícito (Exito/Error), y explicar por qué esto obliga al llamador a manejar el caso de error sin depender de excepciones no documentadas en la firma.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌── fun guardarTarea(): Resultado<Tarea> ──────────────┐
│  el tipo de retorno YA declara que puede fallar         │
└──────┬───────────────────────────────┬──────────┘
       │                                    │
┌──────▼──────┐                    ┌──────▼──────┐
│  Exito(tarea) │                    │ Error(mensaje) │
└─────────────┘                    └─────────────┘
   when exhaustivo obliga a manejar AMBOS casos
```

```kotlin
package com.academia.kmp

sealed class Resultado<out T> {
    data class Exito<T>(val datos: T) : Resultado<T>()
    data class Error(val mensaje: String) : Resultado<Nothing>()
}

fun guardarTareaSegura(tarea: Tarea, simularFalloRed: Boolean): Resultado<Tarea> {
    if (simularFalloRed) return Resultado.Error("sin conexión")
    return Resultado.Exito(tarea)
}

fun guardarTareaConExcepcion(tarea: Tarea, simularFalloRed: Boolean): Tarea {
    if (simularFalloRed) throw IllegalStateException("sin conexión")
    return tarea
}
```

```bash
# compila el módulo compartido de Kotlin Multiplatform con Gradle
mkdir -p academia-kmp/shared/src/commonMain/kotlin/com/academia/kmp
cd academia-kmp
./gradlew :shared:compileKotlinMetadata
```

```kotlin
package com.academia.kmp

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

private val tarea = Tarea("1", "Comprar leche", completada = false)

fun manejar(resultado: Resultado<Tarea>): String = when (resultado) {
    is Resultado.Exito -> "guardado: ${resultado.datos.titulo}"
    is Resultado.Error -> "error manejado explícitamente: ${resultado.mensaje}"
}

class ResultadoTest {
    @Test
    fun elCasoDeExitoSeManejaSinLanzarNada() {
        assertEquals("guardado: Comprar leche", manejar(guardarTareaSegura(tarea, simularFalloRed = false)))
    }

    @Test
    fun elCasoDeErrorSeManejaComoValorNormalNoComoExcepcion() {
        assertEquals("error manejado explícitamente: sin conexión", manejar(guardarTareaSegura(tarea, simularFalloRed = true)))
    }

    @Test
    fun laVersionConExcepcionesPropagaSiNadieLaCaptura() {
        assertFailsWith<IllegalStateException> {
            guardarTareaConExcepcion(tarea, simularFalloRed = true)
        }
    }
}
```

```bash
# ejecuta el test Kotlin del módulo compartido
cd academia-kmp
./gradlew :shared:allTests
```

```kotlin
fun eliminarTarea(id: String): ____<Unit> {
    if (!existe(id)) return Resultado.Error("tarea no encontrada")
    return Resultado.Exito(Unit)
}
```

</details>

### Tema 5: Tiempo determinista: probar vencimientos sin dormir ni consultar el reloj global · Avanzado · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar comprobarás el vencimiento de una oferta de entrega con un reloj sustituible. Prerrequisitos: interfaces, lambdas, Long y funciones de Kotlin. Kotlin/JVM y JDK para el ejemplo independiente; en KMP puedes colocar el contrato en commonMain y sus pruebas en commonTest.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
mkdir reloj-kotlin
cd reloj-kotlin
```

```kotlin
class Oferta(private val venceEnMs: Long, private val ahoraMs: () -> Long) {
    fun vencida(): Boolean = ahoraMs() >= venceEnMs
}

fun main() {
    var reloj = 1_000L
    val oferta = Oferta(31_000L) { reloj }
    check(!oferta.vencida())
    reloj = 30_999L
    check(!oferta.vencida())
    reloj = 31_000L
    check(oferta.vencida()) // El límite también pertenece al contrato.
    reloj = 31_001L
    check(oferta.vencida())
    println("Antes, límite y después: correctos")
}
```

```bash
kotlinc Vencimiento.kt -include-runtime -d vencimiento.jar
java -jar vencimiento.jar
```

</details>
