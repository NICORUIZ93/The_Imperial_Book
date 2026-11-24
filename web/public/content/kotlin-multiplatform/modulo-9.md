# Módulo 9: KMP en producción — fronteras, compatibilidad y observabilidad

La app integradora demuestra que el código común compila y funciona. Un producto multiplataforma añade otra responsabilidad: una decisión en `commonMain` se convierte en API para equipos, compiladores y runtimes diferentes. Este módulo enseña a compartir solo lo estable, mantener la frontera consumible y actualizar Android/iOS sin obligarlos a desplegar simultáneamente.


## Aprende construyendo


### Tema 1: La mejor frontera compartida es deliberadamente pequeña · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a diseñar una facade TaskClient mínima en commonMain que exponga solo lo que Android e iOS necesitan consumir, sin filtrar tipos internos del dominio. Prerrequisitos: Módulo 11 completado.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    Android[androidApp] --> Facade[TaskClient facade minima]
    IOS[iosApp Swift] --> Facade
    Facade --> Repo[TareaRepositoryImpl internal]
    Facade -.nunca expone.-> Ktor[HttpClient interno]
    Facade -.nunca expone.-> SQL[SQLDelight interno]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```swift
final class TaskScreenModel: ObservableObject {
    private var observation: Cancellable?

    func start(client: SharedTaskClient) {
        observation = client.observe { [weak self] value, error in
            guard let self else { return }
            self.apply(value, error)
        }
    }

    deinit { observation?.cancel() }
}
```

```text
Android UI -> adapter Kotlin --\
                              facade shared -> dominio/repositorios
iOS SwiftUI -> wrapper Swift --/        |
                          interfaces de plataforma (clock, secure store)
cancelación/lifecycle deben cruzar en ambas direcciones
```

```mermaid
flowchart LR
    Android[androidApp] --> Facade[TaskClient facade minima]
    IOS[iosApp Swift] --> Facade
    Facade --> Repo[TareaRepositoryImpl internal]
    Facade -.nunca expone.-> Ktor[HttpClient interno]
    Facade -.nunca expone.-> SQL[SQLDelight interno]
```

```kotlin
public interface TaskClient {
    public suspend fun task(id: TaskId): TaskResult
    public fun observeTasks(): Flow<List<TaskSummary>>
}

public sealed interface TaskResult {
    public data class Found(val task: Task) : TaskResult
    public data object NotFound : TaskResult
    public data object Unauthorized : TaskResult
    public data class Unavailable(val retryable: Boolean) : TaskResult
}
```

```bash
./gradlew :shared:allTests
```

</details>

### Tema 2: Garbage collection no cierra sockets ni rompe ciclos externos · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a implementar un TaskSubscription: AutoCloseable que cancele explícitamente su Job al cerrarse, evitando que una pantalla de iOS retenida indefinidamente siga consumiendo un Flow compartido. Prerrequisitos: Tema 1 de este módulo.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    SwiftVM[Swift ViewModel] -->|retiene| Wrapper[wrapper Kotlin]
    Wrapper -->|retiene callback| Closure[closure Swift]
    Closure -->|captura fuerte| SwiftVM
    Close[subscription.close en deinit] -.rompe el ciclo.-> Wrapper
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```text
Swift ViewModel -> Kotlin client -> callback closure -> Swift ViewModel
       ARC                GC                  captura fuerte
cancel handle + weak capture + lifecycle -> romper ciclo
GC Kotlin != close(driver/socket/native handle)
```

```mermaid
flowchart LR
    SwiftVM[Swift ViewModel] -->|retiene| Wrapper[wrapper Kotlin]
    Wrapper -->|retiene callback| Closure[closure Swift]
    Closure -->|captura fuerte| SwiftVM
    Close[subscription.close en deinit] -.rompe el ciclo.-> Wrapper
```

```kotlin
public class TaskSubscription internal constructor(
    private val job: Job,
) : AutoCloseable {
    override fun close() = job.cancel()
}

public fun TaskClient.subscribe(
    scope: CoroutineScope,
    listener: (List<TaskSummary>) -> Unit,
): TaskSubscription = TaskSubscription(
    scope.launch { observeTasks().collect(listener) },
)
```

```bash
./gradlew :shared:allTests
```

</details>

### Tema 3: Un artefacto compatible necesita más que el mismo número de versión · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a activar la validación binaria del plugin de Kotlin (abiValidation) para que check falle ante cualquier cambio de API no aprobado explícitamente. Prerrequisitos: Tema 2 de este módulo; JDK 25 y Gradle 9.7+ para el ejemplo.

#### ► LA ANALOGÍA
La compatibilidad de fuente significa que el consumidor recompila; la binaria, que un binario ya compilado enlaza; la conductual, que obtiene el significado esperado — podés conservar la firma y romper el comportamiento cambiando orden, threading o un valor default. La analogía es mantener el mismo conector físico sin garantizar el mismo voltaje ni protocolo.

**Conceptos clave:** source compatibility, binary compatibility, behavioral compatibility, API dump, KLib, ABI, semantic versioning, XCFramework, Maven publication, checksum, schema, migration, serialization y deprecation.

Compatibilidad source significa que el consumidor recompila; binary, que un binario ya compilado enlaza; behavioral, que obtiene significado esperado. Puedes conservar firma y romper comportamiento cambiando orden, threading, valor default o error. Versiona semánticamente, pero documenta también garantías.

La validación binaria del plugin Kotlin genera dumps ABI y hace fallar `check` ante un cambio no aprobado. El soporte para KLib multiplataforma puede depender de versión/estado; úsalo junto a pruebas de compilación reales de consumidores Android y iOS, no como única evidencia.

```kotlin
kotlin {
    @OptIn(org.jetbrains.kotlin.gradle.dsl.abi.ExperimentalAbiValidation::class)
    abiValidation()
}
```

Revisa el dump como código. Añadir método abstracto a interfaz implementada por apps puede romper; cambiar data class altera `copy/componentN`; exponer dependencia filtra sus tipos. Mantén `internal` por defecto y surface mínima.

Datos persisten más que binarios. SQLDelight migrations deben funcionar desde cada versión soportada en ambas plataformas. `kotlinx.serialization` requiere nombres estables (`@SerialName`), defaults para campos añadidos y política ante desconocidos. Quitar/renombrar enum o campo rompe datos cacheados y mensajes en vuelo.

Publicación Maven produce metadata raíz y artefactos por target; Apple suele consumir XCFramework por SwiftPM/CocoaPods/direct integration. Firma artefactos, publica sources/docs, checksums y coordenadas inmutables. Nunca sobrescribas `1.2.0`. Construir Apple exige runner macOS y Xcode compatible; fija matriz.

No exportes todos los transitive dependencies. Decide static/dynamic framework y export explícito: exportar aumenta superficie/tamaño y puede duplicar símbolos. Prueba una app consumidora desde artefacto remoto, no solo composite build local.

**Analogía:** mantener el mismo conector físico no garantiza voltaje ni protocolo. ABI conserva encaje; contrato conductual conserva que el dispositivo funcione.

**¿Por qué es importante?** porque Android/iOS no actualizan juntos y un SDK roto bloquea equipos distintos o falla solo después de instalar una migración antigua.

**Casos de uso reales:** nueva función abstracta, data class pública, enum serializado, XCFramework, KLib, Maven metadata, migración desde N-2 y dependencia exportada.

**Diagrama:**

```text
API source -> updateKotlinAbi/checkKotlinAbi -> ABI/KLib
                          `-> consumer compile Android + Swift
schemas N-2 -> migraciones -> datos actuales
tag inmutable -> Maven targets + XCFramework -> apps de prueba -> publicar
```

La configuración de `abiValidation` vive en `shared/build.gradle.kts`, y `./gradlew :shared:checkKotlinAbi` es el comando que la aplica en cada push:

```mermaid
flowchart TD
    Dump[dump ABI aprobado] --> Check[gradlew shared:checkKotlinAbi]
    NuevaAPI[nueva firma publica] --> Check
    Check -->|coincide| Pasa[CI verde]
    Check -->|difiere sin aprobar| Falla[CI falla explicito]
```

Tu proyecto RutaFlow ilustra el mismo riesgo sin `abiValidation`: si el `SyncEngine` que creas en `shared/src/commonMain/kotlin/com/academia/kmp/SyncEngine.kt` cambiara el orden de los parámetros de `drain()` sin que ningún check lo detecte, un consumidor Android que todavía no recompiló contra la nueva versión podría enlazar en runtime contra una firma distinta a la que espera. **Cuándo no conviene** activar `abiValidation` desde el primer commit: en un módulo compartido que todavía no tiene ningún consumidor externo publicado (solo se consume por fuente, dentro del mismo build), el dump de API es puro overhead de mantenimiento sin ningún consumidor al que proteger — conviene activarlo recién cuando el artefacto se publica como dependencia binaria real, no antes.

#### ► CÓMO FUNCIONA
```mermaid
flowchart TD
    Dump[dump ABI aprobado] --> Check[gradlew shared:checkKotlinAbi]
    NuevaAPI[nueva firma publica] --> Check
    Check -->|coincide| Pasa[CI verde]
    Check -->|difiere sin aprobar| Falla[CI falla explicito]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```kotlin
kotlin {
    @OptIn(org.jetbrains.kotlin.gradle.dsl.abi.ExperimentalAbiValidation::class)
    abiValidation()
}
```

```text
API source -> updateKotlinAbi/checkKotlinAbi -> ABI/KLib
                          `-> consumer compile Android + Swift
schemas N-2 -> migraciones -> datos actuales
tag inmutable -> Maven targets + XCFramework -> apps de prueba -> publicar
```

```mermaid
flowchart TD
    Dump[dump ABI aprobado] --> Check[gradlew shared:checkKotlinAbi]
    NuevaAPI[nueva firma publica] --> Check
    Check -->|coincide| Pasa[CI verde]
    Check -->|difiere sin aprobar| Falla[CI falla explicito]
```

```bash
mkdir -p ejemplo-abi/src/commonMain/kotlin/academia && cd ejemplo-abi
```

```kotlin
rootProject.name = "ejemplo-abi"
```

```kotlin
plugins {
    kotlin("multiplatform") version "2.4.21"
}

repositories {
    mavenCentral()
}

kotlin {
    jvm()
    @OptIn(org.jetbrains.kotlin.gradle.dsl.abi.ExperimentalAbiValidation::class)
    abiValidation()
}
```

</details>

### Tema 4: Un fallo compartido necesita símbolos y contexto de ambas plataformas · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a inyectar una interfaz Diagnostics en commonMain y provocar el mismo fallo compartido en ambas apps para confirmar que puede simbolizarse con mapping/dSYM en cada plataforma. Prerrequisitos: Tema 3 de este módulo.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```kotlin
public interface Diagnostics {
    public fun record(
        event: DiagnosticEvent,
        attributes: Map<String, String> = emptyMap(),
    )
}

public enum class DiagnosticEvent { SYNC_STARTED, SYNC_CONFLICT, SYNC_FAILED }
```

```text
common failure -> Android stack + mapping --\
               -> iOS stack + dSYM --------> build ID -> causa compartida
SDK release -> compatibility window -> Android/iOS rollouts independientes
metrics por sdk/app/OS -> promover | detener | forward fix
```

```kotlin
public interface Diagnostics {
    public fun record(
        event: DiagnosticEvent,
        attributes: Map<String, String> = emptyMap(),
    )
}

public enum class DiagnosticEvent { SYNC_STARTED, SYNC_CONFLICT, SYNC_FAILED }
```

```bash
./gradlew :shared:allTests
```

</details>

### Kotlin 2.4 y estado real de cada target

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar kotlin 2.4 y estado real de cada target.

</details>

### Proyecto: SDK compartido estable y operable

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar proyecto: sdk compartido estable y operable.

</details>

### Método de estudio y proyecto de ampliación

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Nota de construcción
Este tema es principalmente conceptual en esta versión. La verificación se realiza con las preguntas de comprensión y el criterio de cuándo NO usar método de estudio y proyecto de ampliación.

</details>
