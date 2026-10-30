# Módulo 12: KMP en producción — fronteras, compatibilidad y observabilidad

La app integradora demuestra que el código común compila y funciona. Un producto multiplataforma añade otra responsabilidad: una decisión en `commonMain` se convierte en API para equipos, compiladores y runtimes diferentes. Este módulo enseña a compartir solo lo estable, mantener la frontera consumible y actualizar Android/iOS sin obligarlos a desplegar simultáneamente.


## Aprende construyendo

### Tema 1: La mejor frontera compartida es deliberadamente pequeña

#### Paso 1 · Objetivo y preparación
Al finalizar vas a diseñar una facade `TaskClient` mínima en `commonMain` que exponga solo lo que Android e iOS necesitan consumir, sin filtrar tipos internos del dominio. Prerrequisitos: Módulo 11 completado.

#### Paso 2 · Contexto y caso real
El equipo expuso directamente desde `commonMain` todos los tipos internos del repositorio y del cliente HTTP "para no tener que escribir una capa extra" — meses después, cualquier refactor interno de esos tipos rompe la compilación de Swift en el proyecto iOS, aunque la lógica de negocio real no cambió.

#### Paso 3 · Teoría, modelo mental y analogía
`expect/actual` funciona bien para primitivas pequeñas (reloj, UUID); para servicios complejos, una interfaz en common con adaptación inyectada hace las dependencias visibles y testeables. Una facade exportada evita que tipos internos se conviertan accidentalmente en contrato Swift. La analogía es un tratado entre países: cuantas más reglas locales intenta imponer, más traductores y excepciones necesita.

**Evidencia de aprendizaje:** entrega facade mínima, superficie filtrada con tipos internos expuestos detectada, y corrección con internal verificada en el apiDump.
**Conceptos clave:** shared kernel, platform boundary, expect/actual, interface, DTO, domain model, Swift export, Objective-C interop, suspend, Flow, cancellation, error mapping, facade y semantic ownership.

KMP no exige compartir todo. Comparte reglas de negocio, protocolos y datos cuya semántica es común. Mantén navegación, permisos, lifecycle, UI y servicios profundamente nativos detrás de interfaces cuando sus modelos difieren. Si fuerzas una abstracción universal, cada plataforma termina simulando a la otra.

`expect/actual` funciona bien para primitivas pequeñas como reloj o UUID. Para servicios complejos, una interfaz en common y adaptación inyectada hace dependencias visibles y testeables. Una facade exportada evita que cientos de tipos internos se conviertan accidentalmente en contrato Swift.

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

Una API Kotlin elegante puede exportarse incómoda a Swift: sobrecargas, genéricos, default arguments, sealed hierarchies y nombres de paquetes se mapean con restricciones. Inspecciona la interfaz generada y escribe un wrapper Swift si mejora ergonomía. Swift export promete mapeo más directo, pero si la herramienta usada está en estado Alpha debe permanecer detrás de experimento y no ser requisito único de producción.

No exportes excepciones internas como contrato implícito. Modela resultados esperables y traduce defectos inesperados a una frontera documentada. Conserva causas en telemetría privada. En Swift, comprueba cómo se mapean errores y nullability; el consumidor no debe adivinar.

La cancelación debe cruzar la frontera. Una pantalla Swift que desaparece cancela su `Task`; el adaptador cancela el Job Kotlin. Un callback que ignora cancelación seguirá red, retendrá ViewModel y escribirá estado obsoleto. Para Flow, define lifecycle de colección, backpressure/conflation y hilo de callbacks.

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

**Analogía:** el módulo compartido es un tratado entre países. Cuantas más reglas locales intenta imponer, más traductores y excepciones necesita. Un tratado pequeño y estable facilita cooperación.

**¿Por qué es importante?** porque el coste de una API exportada se multiplica entre Kotlin, Swift, Gradle, Xcode, documentación, compatibilidad y soporte.

**Casos de uso reales:** facade de dominio, reloj nativo, permisos, Flow hacia Swift, error HTTP, cancelación de búsqueda, wrapper Swift y migración de interop.

**Diagrama:**

```text
Android UI -> adapter Kotlin --\
                              facade shared -> dominio/repositorios
iOS SwiftUI -> wrapper Swift --/        |
                          interfaces de plataforma (clock, secure store)
cancelación/lifecycle deben cruzar en ambas direcciones
```

`TaskClient` vive en `shared/src/commonMain/kotlin/com/academia/kmp/TaskClient.kt`, y es exactamente la frontera que el proyecto integrador RutaFlow aplica en `SyncEngine` (`examples/rutaflow/kotlin-multiplatform/SyncEngine.kt`): `Outbox` y `DeliveryApi` son interfaces mínimas, no las implementaciones completas de Ktor o SQLDelight.

```mermaid
flowchart LR
    Android[androidApp] --> Facade[TaskClient facade minima]
    IOS[iosApp Swift] --> Facade
    Facade --> Repo[TareaRepositoryImpl internal]
    Facade -.nunca expone.-> Ktor[HttpClient interno]
    Facade -.nunca expone.-> SQL[SQLDelight interno]
```

**Cuándo no conviene** una facade tan estricta: en un prototipo de un solo desarrollador sin consumidor Swift todavío, exponer directamente los tipos del repositorio ahorra una capa de traducción que nadie va a usar todavía; la frontera mínima paga su costo de diseño recién cuando existe un segundo consumidor real (otra plataforma, otro equipo) del que proteger ese cambio interno — es el mismo trade-off de "YAGNI" frente a diseñar para un futuro consumidor que todavía no existe.

#### Paso 4 · Demostración guiada desde cero
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

**Ejecuta el ejemplo** (en un proyecto KMP con Gradle, corre las pruebas del módulo común):

```bash
./gradlew commonTest
```
Para compilar todos los targets: `./gradlew build`.

Resultado esperado: Swift consume únicamente `TaskClient`, `TaskResult` y `TaskSummary` — ningún tipo interno del repositorio, del cliente Ktor ni de SQLDelight aparece en la superficie exportada, de modo que un refactor interno de esas capas no rompe la compilación de la app iOS.

#### Paso 5 · Práctica guiada
Pista: marcá como `public` (en vez de `internal`) la clase `TareaRepositoryImpl` completa del Módulo 11, para que el equipo iOS "pueda acceder directamente a los detalles si los necesita". Ese es el fallo deliberado: ahora `TareaRepositoryImpl`, `HttpClient` y los tipos de SQLDelight forman parte de la API pública exportada a Swift, y el día que el equipo reemplaza Ktor internamente por otra librería HTTP, ese cambio "interno" rompe la compilación del proyecto iOS.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 revirtiendo `TareaRepositoryImpl` a `internal`, exponiendo únicamente la interfaz `TaskClient` como facade pública, e inspeccionando la API exportada (`apiDump`, Tema 3 de este módulo) para confirmar que ningún tipo de infraestructura aparece en la superficie pública.

#### Paso 7 · Cierre y evidencia
Entregá la facade mínima del Paso 4, la superficie filtrada del Paso 5, y la corrección con `internal` del Paso 6; explicá por qué el costo de una API exportada se multiplica entre Kotlin, Swift, Gradle, Xcode, documentación y soporte, no solo en `commonMain`. Siguiente paso: estudia por qué el garbage collector no basta para liberar recursos que cruzan esta misma frontera. Errores comunes: exponer una implementación completa de infraestructura en vez de una interfaz mínima, forzar una abstracción universal cuando los modelos de cada plataforma genuinamente difieren, y no inspeccionar la superficie exportada antes de publicar una nueva versión. Fuentes oficiales: https://kotlinlang.org/docs/multiplatform-expect-actual.html y https://kotlinlang.org/docs/multiplatform-share-on-platforms.html.
**¿Por qué es importante?** El coste de una API exportada se multiplica entre Kotlin, Swift, Gradle, Xcode, documentación, compatibilidad y soporte; una frontera deliberadamente pequeña mantiene ese coste bajo control.

### Tema 2: Garbage collection no cierra sockets ni rompe ciclos externos

#### Paso 1 · Objetivo y preparación
Al finalizar vas a implementar un `TaskSubscription: AutoCloseable` que cancele explícitamente su `Job` al cerrarse, evitando que una pantalla de iOS retenida indefinidamente siga consumiendo un `Flow` compartido. Prerrequisitos: Tema 1 de este módulo.

#### Paso 2 · Contexto y caso real
Después de navegar repetidamente hacia y desde la pantalla de tareas en la app iOS, el equipo nota que el consumo de memoria crece de forma sostenida — cada pantalla cerrada debería liberar sus recursos, pero algo las retiene.

#### Paso 3 · Teoría, modelo mental y analogía
Swift usa ARC y Kotlin usa un GC trazador; un ciclo puede cruzar runtimes (el modelo Swift retiene el wrapper Kotlin, Kotlin conserva un callback, la closure captura fuertemente el modelo) y cada runtime ve referencias válidas por separado, así que ninguno libera nada. La analogía es dos administradores de edificios que eliminan habitaciones sin ocupantes, pero un pasillo entre ambos edificios puede mantenerlos ocupados sin que ninguno sepa que el ciclo ya no sirve.

**Evidencia de aprendizaje:** entrega TaskSubscription con cierre explícito, fuga de 100 navegaciones reproducida y medición de objetos activos confirmada.
**Conceptos clave:** shared heap, tracing GC, root, stable reference, callback, closure, ARC, retain cycle, resource ownership, Closeable, pinning, C pointer, dispatcher, thread confinement y leak test.

Kotlin/Native moderno usa heap compartido y GC trazador; objetos pueden accederse desde varios hilos. Esto elimina muchas restricciones del memory manager legacy, pero no vuelve seguro el estado mutable ni administra recursos externos. Coroutines aún ejecutan sobre threads y requieren sincronización para invariantes.

Swift/Objective-C usa ARC. Un ciclo puede cruzar runtimes: Swift model retiene wrapper Kotlin, Kotlin conserva callback, closure captura fuertemente model. Cada runtime ve referencias válidas. Diseña ownership: quién inicia, quién cancela, quién libera y cuándo. Captura débil donde corresponde y ofrece handle cancelable explícito.

Scopes globales y StateFlows de singleton pueden retener pantallas indefinidamente. No uses `GlobalScope`; recibe scope con lifecycle o crea scope propietario con `close/cancel`. Una función suspend termina/cancela con su caller; un producer compartido documenta su vida.

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

GC no cierra SQLDelight driver, file descriptor, socket, native handle o C allocation a tiempo. Usa `use`, `try/finally` y ownership explícito. Finalizers/cleaners son respaldo, no flujo normal.

Interop C puede exigir puntear memoria mientras llamada nativa conserva dirección. `usePinned` limita ventana; no guardes puntero después del bloque. Copiar puede ser más seguro que retener buffer Kotlin. Documenta thread affinity de APIs Apple; entrega actualizaciones UI en Main y no bloquees ese dispatcher.

Mide, no repitas mitos. Logs y métricas de GC Kotlin/Native, Instruments, allocations Android y pruebas repetidas revelan retención. Fuerza un escenario 100 veces y compara heap/objetos tras colección, manteniendo en cuenta caches legítimas.

**Analogía:** dos administradores de edificios eliminan habitaciones sin ocupantes, pero un pasillo entre edificios puede mantener ambos ocupados y ninguno sabe que el ciclo ya no sirve. Hace falta cerrar explícitamente el acceso.

**¿Por qué es importante?** porque fugas cross-runtime aparecen tras navegación repetida y son difíciles de atribuir; compilar para iOS no prueba ownership correcto.

**Casos de uso reales:** callback Swift, Flow observado, scope singleton, SQL driver, NSURLSession/Ktor engine, puntero C, listener nativo y ViewModel retenido.

**Diagrama:**

```text
Swift ViewModel -> Kotlin client -> callback closure -> Swift ViewModel
       ARC                GC                  captura fuerte
cancel handle + weak capture + lifecycle -> romper ciclo
GC Kotlin != close(driver/socket/native handle)
```

`TaskSubscription` vive en `shared/src/commonMain/kotlin/com/academia/kmp/TaskSubscription.kt`. El ciclo cruzado entre runtimes que ninguno de los dos recolectores detecta por sí solo:

```mermaid
flowchart LR
    SwiftVM[Swift ViewModel] -->|retiene| Wrapper[wrapper Kotlin]
    Wrapper -->|retiene callback| Closure[closure Swift]
    Closure -->|captura fuerte| SwiftVM
    Close[subscription.close en deinit] -.rompe el ciclo.-> Wrapper
```

Este mismo cuidado con el ciclo de vida de recursos es el que exige el proyecto integrador RutaFlow al consumir `SyncEngine.drain()`: si la pantalla que inició el `drain()` desaparece sin cancelar su `CoroutineScope`, el intento de sincronización sigue corriendo en segundo plano aunque ya nadie observe el resultado, el mismo tipo de fuga que `TaskSubscription.close()` evita explícitamente aquí.

#### Paso 4 · Demostración guiada desde cero
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

**Ejecuta el ejemplo** (en un proyecto KMP con Gradle, corre las pruebas del módulo común):

```bash
./gradlew commonTest
```
Para compilar todos los targets: `./gradlew build`.

Resultado esperado: llamar a `subscription.close()` desde el `deinit` de Swift cancela explícitamente el `Job` de Kotlin, deteniendo la colección del `Flow` y rompiendo el ciclo de referencias cruzado entre ambos runtimes, en vez de esperar a que algún recolector de basura lo resuelva por su cuenta.

#### Paso 5 · Práctica guiada
Pista: quitá la llamada a `observation?.cancel()` del `deinit` de `TaskScreenModel` en Swift "porque ARC debería limpiar todo solo al liberar el objeto". Ese es el fallo deliberado: al navegar repetidamente hacia y desde la pantalla 100 veces, cada `TaskSubscription` sigue activa indefinidamente porque la closure del callback sigue capturando fuertemente el modelo Swift, y el heap de la app crece de forma medible y sostenida con cada navegación.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 restaurando `observation?.cancel()` en el `deinit`, y repetí la navegación 100 veces midiendo el conteo de objetos activos antes y después del cambio (con Instruments o los logs del GC de Kotlin/Native) para confirmar que ya no crece de forma sostenida.

#### Paso 7 · Cierre y evidencia
Entregá el `TaskSubscription` con cierre explícito del Paso 4, la fuga reproducida 100 veces del Paso 5, y la medición de objetos activos del Paso 6; explicá por qué compilar exitosamente para iOS no prueba que el ownership de recursos cruzados entre runtimes sea correcto. Siguiente paso: asegurate de que un artefacto publicado con esta API sea binariamente compatible con versiones futuras. Errores comunes: confiar en que GC/ARC cierran sockets, drivers SQL o handles nativos sin una llamada explícita de cierre, usar `GlobalScope` para suscripciones que deberían vivir y morir con una pantalla, y no medir con una prueba repetida antes de descartar una fuga como "poco probable". Fuentes oficiales: https://kotlinlang.org/docs/native-memory-manager.html y https://developer.apple.com/documentation/swift/automaticreferencecounting.
**¿Por qué es importante?** Las fugas cross-runtime aparecen tras navegación repetida y son difíciles de atribuir; compilar para iOS no prueba ownership correcto.

### Tema 3: Un artefacto compatible necesita más que el mismo número de versión

#### Paso 1 · Objetivo y preparación
Al finalizar vas a activar la validación binaria del plugin de Kotlin (`abiValidation`) para que `check` falle ante cualquier cambio de API no aprobado explícitamente. Prerrequisitos: Tema 2 de este módulo.

#### Paso 2 · Contexto y caso real
El equipo publicó una nueva versión del módulo compartido con el mismo número de versión semántica "menor" esperado, pero cambió silenciosamente el orden de los parámetros de una función pública — el consumidor Android recompiló sin problema, pero el consumidor iOS, que todavía no había actualizado, empezó a fallar en producción con datos corruptos.

#### Paso 3 · Teoría, modelo mental y analogía
La compatibilidad de fuente significa que el consumidor recompila; la binaria, que un binario ya compilado enlaza; la conductual, que obtiene el significado esperado — podés conservar la firma y romper el comportamiento cambiando orden, threading o un valor default. La analogía es mantener el mismo conector físico sin garantizar el mismo voltaje ni protocolo.

**Evidencia de aprendizaje:** entrega abiValidation activado, cambio de API no detectado reproducido y apiCheck integrado al pipeline de CI.
**Conceptos clave:** source compatibility, binary compatibility, behavioral compatibility, API dump, KLib, ABI, semantic versioning, XCFramework, Maven publication, checksum, schema, migration, serialization y deprecation.

Compatibilidad source significa que el consumidor recompila; binary, que un binario ya compilado enlaza; behavioral, que obtiene significado esperado. Puedes conservar firma y romper comportamiento cambiando orden, threading, valor default o error. Versiona semánticamente, pero documenta también garantías.

La validación binaria del plugin Kotlin genera dumps API y hace fallar `check` ante cambio no aprobado. El soporte para KLib multiplataforma puede depender de versión/estado; úsalo junto a pruebas de compilación reales de consumidores Android y iOS, no como única evidencia.

```kotlin
kotlin {
    @OptIn(org.jetbrains.kotlin.gradle.dsl.abi.ExperimentalAbiValidation::class)
    abiValidation {
        enabled.set(true)
    }
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
API source -> apiDump/apiCheck -> ABI/KLib
                          `-> consumer compile Android + Swift
schemas N-2 -> migraciones -> datos actuales
tag inmutable -> Maven targets + XCFramework -> apps de prueba -> publicar
```

La configuración de `abiValidation` vive en `shared/build.gradle.kts`, y `./gradlew :shared:apiCheck` es el comando que la aplica en cada push:

```mermaid
flowchart TD
    Dump[apiDump aprobado] --> Check[gradlew shared:apiCheck]
    NuevaAPI[nueva firma publica] --> Check
    Check -->|coincide| Pasa[CI verde]
    Check -->|difiere sin aprobar| Falla[CI falla explicito]
```

El proyecto integrador RutaFlow ilustra el mismo riesgo sin `abiValidation`: si `SyncEngine` (`examples/rutaflow/kotlin-multiplatform/SyncEngine.kt`) cambiara el orden de los parámetros de `drain()` sin que ningún check lo detecte, un consumidor Android que todavía no recompiló contra la nueva versión podría enlazar en runtime contra una firma distinta a la que espera. **Cuándo no conviene** activar `abiValidation` desde el primer commit: en un módulo compartido que todavía no tiene ningún consumidor externo publicado (solo se consume por fuente, dentro del mismo build), el dump de API es puro overhead de mantenimiento sin ningún consumidor al que proteger — conviene activarlo recién cuando el artefacto se publica como dependencia binaria real, no antes.

#### Paso 4 · Demostración guiada desde cero
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir el archivo del ejemplo dentro.
```bash
gradle init --type kotlin-application
```

```kotlin
kotlin {
    @OptIn(org.jetbrains.kotlin.gradle.dsl.abi.ExperimentalAbiValidation::class)
    abiValidation {
        enabled.set(true)
    }
}
```

**Ejecuta el ejemplo** (añade el bloque a `shared/build.gradle.kts`, genera el dump de referencia y valida):

```bash
./gradlew :shared:updateLegacyAbi
./gradlew :shared:check
```

Resultado esperado: `./gradlew :shared:check` compara la API pública actual contra el dump aprobado previamente, y falla explícitamente si alguien modifica una firma pública sin actualizar ese dump de forma consciente.

#### Paso 5 · Práctica guiada
Pista: dejá `abiValidation { enabled.set(false) }` (o no lo actives) "porque todavía no tenemos tiempo de revisar el dump completo". Ese es el fallo deliberado: un cambio que agrega un parámetro sin valor default a una función pública pasa `check` sin ninguna advertencia, y recién se descubre que rompió la compatibilidad binaria cuando el consumidor iOS (que todavía no recompiló contra la nueva versión) falla en producción.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 activando `abiValidation`, generando el dump inicial aprobado del estado actual de la API, y agregando `./gradlew :shared:apiCheck` como paso obligatorio del pipeline de CI (Módulo 10) antes de publicar cualquier versión nueva.

#### Paso 7 · Cierre y evidencia
Entregá la validación binaria activada del Paso 4, el cambio de API no detectado del Paso 5, y el `apiCheck` integrado a CI del Paso 6; explicá por qué un `check` en verde sin validación de ABI no es evidencia de compatibilidad binaria real. Siguiente paso: preparate para diagnosticar un fallo compartido que se manifiesta distinto en cada plataforma. Errores comunes: confiar en el número de versión semántica sin validar ABI automáticamente, tratar un `check` verde como garantía de compatibilidad conductual (no solo binaria), y no ejecutar consumidores reales de Android e iOS contra el artefacto publicado antes de confirmar un release. Fuentes oficiales: https://kotlinlang.org/docs/jvm-api-guidelines-backward-compatibility.html y https://github.com/Kotlin/binary-compatibility-validator.
**¿Por qué es importante?** Android/iOS no actualizan juntos, y un SDK roto bloquea equipos distintos o falla solo después de instalar una migración antigua.

### Tema 4: Un fallo compartido necesita símbolos y contexto de ambas plataformas

#### Paso 1 · Objetivo y preparación
Al finalizar vas a inyectar una interfaz `Diagnostics` en `commonMain` y provocar el mismo fallo compartido en ambas apps para confirmar que puede simbolizarse con mapping/dSYM en cada plataforma. Prerrequisitos: Tema 3 de este módulo.

#### Paso 2 · Contexto y caso real
Un crash reportado desde la app iOS muestra un stack trace de frames de Kotlin/Native sin ningún nombre de función legible, mientras que el mismo defecto en Android sí muestra un stack claro con mapping de ProGuard — el equipo no puede confirmar si es el mismo bug sin símbolos de ambas plataformas.

#### Paso 3 · Teoría, modelo mental y analogía
Un defecto en `commonMain` puede aparecer como un stack Kotlin distinto en Android y frames Kotlin/Native en iOS; sin mapping de Android y dSYM/debug symbols del framework exacto por versión, la ofuscación vuelve los grupos de crashes inútiles. La analogía es una misma pieza defectuosa que viaja en dos vehículos y produce ruidos distintos — el número de lote y el manual de diagnóstico permiten encontrar la causa compartida sin confundir síntomas.

**Evidencia de aprendizaje:** entrega interfaz Diagnostics, crash no simbolizable reproducido y archivo completo de dSYM por build ID verificado.
**Conceptos clave:** crash, stack trace, symbolication, dSYM, mapping, source map, correlation ID, privacy, breadcrumb, metric, target matrix, canary, staged rollout, compatibility window y rollback.

Un defecto common puede aparecer como stack Kotlin distinto en Android y frames Kotlin/Native en iOS. Conserva mapping de Android y dSYM/debug symbols del framework exacto por versión. Sin símbolos, ofuscación/optimización vuelve grupos inútiles. Incluye versión SDK, app, target, OS y build ID.

La telemetría compartida define eventos semánticos y deja a adaptadores elegir proveedor nativo. No hagas que common dependa directamente de Firebase/Sentry si eso fuerza SDK y privacidad en todas las plataformas. Inyecta interfaz y limita campos.

```kotlin
public interface Diagnostics {
    public fun record(
        event: DiagnosticEvent,
        attributes: Map<String, String> = emptyMap(),
    )
}

public enum class DiagnosticEvent { SYNC_STARTED, SYNC_CONFLICT, SYNC_FAILED }
```

No uses entity/user ID como labels métricos; correlation ID aleatorio permite conectar cliente/backend sin PII. Redacta URL, token, payload y SQL. Consentimiento y retención pueden variar por plataforma/país.

La matriz CI prueba versiones Kotlin/Gradle/JDK/Xcode mínimas soportadas, simuladores y dispositivos representativos. No es viable toda combinación; prioriza límites y consumidores reales. Nightly puede ampliar. Un upgrade de Kotlin/Native requiere revisar tamaño, startup, GC y ABI, no solo tests common.

Publica SDK antes que apps consumidoras, manteniendo ventana compatible. Android staged rollout y TestFlight no son atómicos. El backend acepta versiones antiguas; los nuevos campos son aditivos. Rollback de una app no revierte DB local ni framework ya incorporado. Prepara forward fix y feature flag seguro para aislar funcionalidad compartida.

Un postmortem separa defecto common, manifestación por plataforma, detección, impacto y acciones. La métrica de “porcentaje compartido” no es objetivo; mide lead time, defectos duplicados, tamaño, crashes y satisfacción nativa.

**Analogía:** una misma pieza defectuosa viaja en dos vehículos y produce ruidos distintos. El número de lote y manual de diagnóstico permiten encontrar la causa compartida sin confundir síntomas.

**¿Por qué es importante?** porque optimización y bridges cambian stacks, y releases asíncronos dejan múltiples combinaciones en campo.

**Casos de uso reales:** crash solo iOS, mapping perdido, GC regression, SDK N con app N-2, backend nuevo, feature flag, staged rollout y privacidad de analytics.

**Diagrama:**

```text
common failure -> Android stack + mapping --\
               -> iOS stack + dSYM --------> build ID -> causa compartida
SDK release -> compatibility window -> Android/iOS rollouts independientes
metrics por sdk/app/OS -> promover | detener | forward fix
```

**Transferencia al proyecto integrador «Núcleo móvil compartido»:** Provoca una excepción controlada en una operación compartida llamada desde iOS. Conserva versión y símbolos de depuración que permitan ubicar la línea Kotlin sin registrar datos personales del envío.

#### Paso 4 · Demostración guiada desde cero
```kotlin
public interface Diagnostics {
    public fun record(
        event: DiagnosticEvent,
        attributes: Map<String, String> = emptyMap(),
    )
}

public enum class DiagnosticEvent { SYNC_STARTED, SYNC_CONFLICT, SYNC_FAILED }
```

**Ejecuta el ejemplo** (en un proyecto KMP con Gradle, corre las pruebas del módulo común):

```bash
./gradlew commonTest
```
Para compilar todos los targets: `./gradlew build`.

Resultado esperado: al provocar deliberadamente un `SYNC_FAILED` en ambas apps (forzando un conflicto de sincronización del Módulo 11), cada adaptador nativo registra el evento con su propio proveedor de telemetría, y ambos reportes pueden correlacionarse por `build ID` aunque los stacks nativos se vean completamente distintos entre sí.

#### Paso 5 · Práctica guiada
Pista: archivá los símbolos (dSYM) de la app iOS solo para los releases "importantes", no para cada build subida a TestFlight "para ahorrar espacio de almacenamiento". Ese es el fallo deliberado: un crash reportado desde una build intermedia (no marcada como "importante") llega sin su dSYM correspondiente, y el stack trace queda compuesto enteramente de direcciones de memoria sin nombres de función, sin ninguna forma de identificar qué parte del código compartido falló.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 archivando el dSYM de cada build subida a TestFlight (no solo las "importantes"), indexado por su build ID exacto, y verificá que el crash simulado del Paso 4 ahora se simboliza completamente al subir ese dSYM específico a la herramienta de diagnóstico.

#### Paso 7 · Cierre y evidencia
Entregá la interfaz `Diagnostics` del Paso 4, el crash no simbolizable del Paso 5, y el archivo completo de dSYM por build ID del Paso 6; explicá por qué "ahorrar espacio" archivando símbolos solo de releases importantes elimina la capacidad de diagnosticar exactamente los crashes intermedios que más necesitan contexto. Siguiente paso: cerrá el proyecto del módulo preparando un plan de release con ventana de compatibilidad y rollback. Errores comunes: no archivar dSYM/mapping de cada build distribuida, hacer que `commonMain` dependa directamente de un SDK de analytics específico de plataforma, y usar un ID de usuario como label de métrica en vez de un correlation ID anónimo. Fuentes oficiales: https://developer.apple.com/documentation/xcode/building-your-app-to-include-debugging-information y https://developer.android.com/studio/build/shrink-code.
**¿Por qué es importante?** La optimización y los bridges entre runtimes cambian los stacks, y los releases asíncronos entre plataformas dejan múltiples combinaciones de versiones en campo al mismo tiempo.

## Revisión oficial de plataforma — julio de 2026

### Kotlin 2.4 y estado real de cada target

La línea revisada es **Kotlin 2.4**. Compose Multiplatform se considera estable en Android, iOS y escritorio; web basado en **Wasm** continúa con un nivel de estabilidad diferente y debe aislarse. **Swift export** mejora la superficie consumida desde Swift, pero requiere revisar tipos compatibles, nombres, errores, concurrencia y evolución binaria. Actualiza Kotlin, Gradle, Android Gradle Plugin, Xcode y bibliotecas kotlinx como una matriz, no como números independientes.

**Aplicación al proyecto:** exporta una API mínima a Swift, prueba compatibilidad de fuente/binario y cancelación, compila todos los targets en CI y etiqueta cualquier uso Wasm con su nivel de estabilidad y fallback.

## Laboratorio práctico

### Proyecto: SDK compartido estable y operable

Evoluciona el módulo `shared` del proyecto 11 como si dos equipos distintos lo consumieran.

1. Lista API pública actual y consumidores. Marca qué debe ser common y mueve dos detalles nativos fuera.
2. Crea facade pequeña y wrappers Android/Swift. Inspecciona headers/API exportada y corrige nombres, nullability y errores.
3. Conecta cancelación de una búsqueda desde Swift Task/Android lifecycle hasta Job/Ktor; prueba respuesta tardía.
4. Introduce un ciclo Swift→Kotlin→callback→Swift y una suscripción no cancelada. Repite navegación, mide y corrige.
5. Audita drivers, clients y handles; añade ownership/close y tests de liberación.
6. Activa API dump/check. Rompe firma, data class e interfaz para comprobar gates.
7. Crea migraciones SQL/JSON desde N-2 con datos reales, enums desconocidos y rollback/forward fix.
8. Publica snapshot Maven y XCFramework/paquete Swift con checksums. Consume desde repositorio en apps mínimas limpias.
9. Configura matriz CI: common, Android, targets Apple, consumidor Swift, ABI y migraciones.
10. Inyecta Diagnostics, provoca el mismo fallo en ambas apps y simboliza con mapping/dSYM.
11. Diseña release SDK→backend→apps con ventana compatible, canary/TestFlight, staged rollout, flag y postmortem.

**Verificación:** entrega diagrama de frontera, superficie API, pruebas de cancelación/retención, dumps ABI, migraciones N-2, coordenadas/artefactos inmutables, builds consumidores y stacks simbolizados. Un cambio incompatible o símbolo ausente debe detener CI/release.

**Errores comunes y soluciones**

- Compartir UI/lifecycle por porcentaje: comparte semántica estable y mide coste total.
- Exportar modelo interno entero: facade y DTO mínimo reducen ABI y acoplamiento.
- Ignorar cancelación Swift: devuelve handle o integra Task y cancela Job/engine.
- Confiar en GC para drivers: ownership y close explícitos.
- Validar solo commonTest: compila/ejecuta consumers reales por target.
- Sobrescribir artefacto publicado: coordenadas inmutables y versión nueva.
- API check verde igual a compatibilidad: añade pruebas conductuales y schemas.
- Crash sin dSYM/mapping: archiva símbolos por build ID antes de distribuir.

<!-- OFFICIAL-TOPIC-ATLAS:START -->
## Atlas completo de temas oficiales

Derivado de la [documentación oficial](https://kotlinlang.org/docs/multiplatform/get-started.html), sus referencias, migraciones y guías de operación. Inventariar no equivale a dominar: cada selección se demuestra con código, prueba, medición y explicación. **Cobertura: 46 temas.**

| Área | Temas que deben poder explicarse y aplicarse | Evidencia práctica |
|---|---|---|
| Kotlin | `null safety` · `data classes` · `sealed types` · `genéricos` · `coroutines` · `Flow` · `serialization` · `time e IO` | sync |
| Estructura | `targets` · `source sets` · `commonMain y commonTest` · `expect/actual` · `Gradle` · `version catalogs` · `convention plugins` | sync |
| Datos | `HTTP client` · `almacenamiento` · `SQLDelight` · `repositorios` · `caché` · `offline-first` · `sincronización` · `errores tipados` | sync |
| UI | `Compose Multiplatform` · `estado` · `recursos` · `localización` · `navegación` · `deep links` · `accesibilidad` · `UI testing` | sync |
| Interop | `Swift export` · `Objective-C` · `UIKit y SwiftUI` · `Android` · `JVM` · `JS y Wasm` · `C interop` · `ownership` | sync |
| Entrega | `XCFramework` · `publicación` · `compatibilidad binaria` · `Hot Reload` · `benchmarks` · `CI multi-target` · `seguridad` | sync |

### Método de estudio y proyecto de ampliación

Para cada tema responde qué problema resuelve, cuál es su modelo mental, cómo falla, cómo se verifica y cuándo no conviene. Elige uno por área e intégralos en un proyecto propio de ampliación. Entrega diagrama, ADR, pruebas de éxito y fallo, una medición, una amenaza y el enlace oficial con versión y fecha. Una API preview se aísla en laboratorio y nunca se presenta como base estable.
<!-- OFFICIAL-TOPIC-ATLAS:END -->
