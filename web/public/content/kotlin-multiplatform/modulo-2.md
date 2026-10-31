# Módulo 2: Coroutines y Flow

Cada tema se practica por separado con su propia repetición progresiva y su propio reto de memoria — suspend functions, Flow/StateFlow/SharedFlow, manejo de errores con Mutex, y Dispatchers son los cuatro pilares de la concurrencia en Kotlin que vas a reutilizar en Android, iOS y backend compartido.


## Aprende construyendo

### Tema 1: suspend functions y concurrencia estructurada

#### Paso 1 · Objetivo y preparación

Al finalizar podrás escribir una función `suspend` que combina dos llamadas asíncronas en paralelo, y explicar por qué cancelar el scope padre cancela automáticamente todas sus coroutines hijas.

**Conocimiento previo:** funciones de orden superior (Módulo 1); ninguna experiencia previa con concurrencia es necesaria.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Cargar en paralelo el perfil de usuario y la lista de pedidos al abrir una pantalla, cancelando ambas si el usuario navega antes de que terminen, es un patrón que threads manuales o callbacks no garantizan automáticamente: sin concurrencia estructurada, una tarea "olvidada" puede seguir ejecutándose en segundo plano sin ningún control.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** `suspend fun` (pausable sin bloquear el hilo), `coroutineScope` + `async`/`await`, cancelación en cascada.

Una función `suspend` puede pausarse en un punto de suspensión (como `delay`) sin bloquear el hilo físico, liberándolo para otro trabajo, y reanudando exactamente donde quedó.

```kotlin
suspend fun cargarPantalla() = coroutineScope {
    val usuario = async { obtenerUsuario() }
    val pedidos = async { obtenerPedidos() }
    PantallaDatos(usuario.await(), pedidos.await())
}
```

Esta función ejecuta ambas llamadas en paralelo, vinculadas al `coroutineScope` que las contiene: si ese scope se cancela, TODAS las coroutines hijas se cancelan en cascada automáticamente, sin tareas huérfanas.

**Analogía:** una función `suspend` es un trabajador que pausa su tarea en un punto específico para atender otra cosa mientras espera un insumo externo, retomando exactamente donde la dejó; la concurrencia estructurada es un equipo de trabajo donde cancelar el proyecto completo cancela automáticamente todas las subtareas asociadas, sin ninguna olvidada.

**Diagrama:**

```mermaid
flowchart LR
  A[coroutineScope] --> B["async obtenerUsuario()"]
  A --> C["async obtenerPedidos()"]
  B --> D[ambas en paralelo]
  C --> D
  A -->|cancelado| E[cancela B y C en cascada]
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía (o continuando en `academia-kmp`, o créala con `mkdir -p academia-kmp` si es tu primera vez), crea `shared/src/commonMain/kotlin/com/academia/kmp/ConcurrenciaEstructurada.kt` con este contenido:

```kotlin
package com.academia.kmp

import kotlinx.coroutines.*

suspend fun obtenerUsuario(): String { delay(200); return "Ana" }
suspend fun obtenerPedidos(): List<String> { delay(200); return listOf("pedido1", "pedido2") }

suspend fun cargarPantalla() = coroutineScope {
    val usuario = async { obtenerUsuario() }
    val pedidos = async { obtenerPedidos() }
    Pair(usuario.await(), pedidos.await()) // ambas corren en PARALELO, no secuencial
}
```

Guarda el archivo y compila el módulo compartido:

```bash
# compila el módulo compartido de Kotlin Multiplatform con Gradle
mkdir -p academia-kmp/shared/src/commonMain/kotlin/com/academia/kmp
cd academia-kmp
./gradlew :shared:compileKotlinMetadata
```

**Explicación línea por línea:** `coroutineScope { ... }` crea un scope que agrupa las coroutines lanzadas dentro; `async { obtenerUsuario() }` y `async { obtenerPedidos() }` se lanzan AMBAS antes de llamar a `.await()` en cualquiera, por lo que corren en paralelo desde el inicio; `usuario.await()` y `pedidos.await()` esperan cada resultado sin bloquear el hilo mientras tanto.

Usa `kotlinx-coroutines-test` con tiempo virtual para medir de forma determinista (sin depender del reloj real ni de flakiness) cuánto tarda `cargarPantalla()`, en `shared/src/commonTest/kotlin/com/academia/kmp/ConcurrenciaEstructuradaTest.kt`:

```kotlin
package com.academia.kmp

import kotlinx.coroutines.test.runTest
import kotlin.test.Test
import kotlin.test.assertEquals

class ConcurrenciaEstructuradaTest {
    @Test
    fun ambasLlamadasCorrenEnParaleloNoEnSecuencia() = runTest {
        val (usuario, pedidos) = cargarPantalla()
        assertEquals("Ana", usuario)
        assertEquals(listOf("pedido1", "pedido2"), pedidos)
        // con tiempo virtual, el tiempo transcurrido es EXACTO: 200ms si corrieron en paralelo
        assertEquals(200, currentTime)
    }
}
```

Ejecuta el test real con Gradle:

```bash
# ejecuta el test Kotlin del módulo compartido, con tiempo virtual
cd academia-kmp
./gradlew :shared:allTests
```

**Resultado esperado:** la prueba pasa, y `currentTime` (el reloj virtual del scheduler de test) es exactamente `200`, no `400` — confirmando que ambas llamadas (cada una con una espera de `200ms`) efectivamente corrieron en paralelo gracias a lanzar ambos `async` antes de llamar a `.await()`, y no de forma secuencial. El tiempo virtual hace esta medición exacta y determinista, sin depender del reloj real de la máquina.

**Fallo deliberado:** cambia `cargarPantalla` para llamar a `.await()` inmediatamente después de cada `async`:

```kotlin
val usuario = async { obtenerUsuario() }.await()
val pedidos = async { obtenerPedidos() }.await()
```

Esto serializa lo que debería ser paralelo. Vuelve a ejecutar el test — `currentTime` ahora es `400`, el doble, y la aserción `assertEquals(200, currentTime)` falla — diagnostica confirmando que el error común "llamar a `await()` inmediatamente después de cada `async`" anula el paralelismo por completo, y que el tiempo virtual lo detecta de forma exacta y reproducible, sin depender de mediciones de reloj real potencialmente ruidosas.

#### Paso 5 · Práctica guiada — repetición progresiva

1. `coroutineScope { val a = async { obtenerA() }; val b = async { obtenerB() }; a.await() + b.await() }` — dos llamadas, combinando resultados numéricos.
2. Agrega una tercera llamada `async { obtenerC() }` al mismo scope y combina las tres.
3. Mide con `currentTime` dentro de `runTest` la duración de dos llamadas secuenciales frente a las mismas dos en paralelo.
4. Escribe de memoria (sin mirar) un `coroutineScope` con dos `async` de tu elección, combinando sus resultados.

**Pista:** lanza SIEMPRE todos los `async` antes de llamar a `await()` en cualquiera de ellos; llamar a `await()` de inmediato después de cada `async` serializa la ejecución.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena los espacios para que ambas llamadas corran en paralelo:

```kotlin
suspend fun cargarDatos() = coroutineScope {
    val perfil = ____ { obtenerPerfil() }
    val ajustes = ____ { obtenerAjustes() }
    Pair(perfil.await(), ajustes.await())
}
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, una función `suspend` con `coroutineScope` que combine dos llamadas en paralelo usando `async`/`await`. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre

Ya combinas dos llamadas asíncronas en paralelo dentro de un `coroutineScope`, y confirmas con una medición real que el orden de `async`/`await` determina si realmente corren en paralelo o secuencialmente. El siguiente tema distingue `Flow`, `StateFlow` y `SharedFlow` según si existe o no un valor actual consultable. Fuente oficial: [Kotlin docs — Coroutines basics](https://kotlinlang.org/docs/coroutines-basics.html).

**Errores comunes:** llamar a `await()` inmediatamente después de cada `async` en vez de lanzar ambos primero, serializando lo que debería ser paralelo; olvidar que una función `suspend` solo puede invocarse desde otra `suspend` o un `CoroutineScope`.

**Cuándo no usarlo:** para dos operaciones donde la segunda depende del resultado de la primera (no pueden ejecutarse en paralelo por definición), usar `async`/`await` en paralelo no aplica; usa llamadas `suspend` secuenciales normales en ese caso.

**Transferencia al proyecto integrador «Núcleo móvil compartido»:** Haz que cancelar la pantalla cancele también la consulta de entregas hija. Prueba cancelación y fallo usando un scope controlado; ningún trabajo debe continuar por un scope global accidental.

### Tema 2: Flow, StateFlow y SharedFlow

#### Paso 1 · Objetivo y preparación

Al finalizar podrás elegir entre `Flow`, `StateFlow` y `SharedFlow` según si tu dato necesita un valor actual siempre consultable o representa un evento puntual de un solo uso.

**Conocimiento previo:** Tema 1 de este módulo; sealed classes para estado de UI (Módulo 1, Tema 3).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** El estado observable de un ViewModel (lista de tareas, estado de carga) necesita que un nuevo observador vea el valor actual de inmediato; un evento de navegación de un solo disparo ("mostrar este Snackbar una vez") NO debe repetirse a un observador que llega tarde o rota la pantalla — usar el tipo equivocado produce bugs sutiles (Snackbars repetidos, o pantallas que nunca ven el estado actual).

#### Paso 3 · Teoría con analogía

**Conceptos clave:** `Flow` (flujo asíncrono perezoso), `StateFlow` (siempre tiene valor actual), `SharedFlow` (eventos puntuales, sin valor inicial).

`fun contarHasta(n: Int): Flow<Int> = flow { for (i in 1..n) { delay(100); emit(i) } }` define un flujo asíncrono de múltiples valores, con evaluación perezosa (no ejecuta nada hasta que alguien recolecta con `collect`). `val estado = MutableStateFlow(EstadoUI.Cargando)` siempre mantiene un valor actual consultable de inmediato por cualquier nuevo observador. `val eventos = MutableSharedFlow<Evento>()` no tiene valor inicial: un observador que empieza a observar tarde NO recibe automáticamente el último evento ya emitido.

**Analogía:** `Flow` es una cinta transportadora que entrega elementos sucesivos; `StateFlow` es un panel de estado siempre visible con su valor actual, incluso para quien recién llega a mirarlo; `SharedFlow` es un anuncio puntual transmitido una vez, que alguien que llega tarde simplemente no escuchó.

**Diagrama:**

```
┌── Flow ────────────┐   ┌── StateFlow ──────────────┐   ┌── SharedFlow ──────────────┐
│ emite N valores,    │   │ SIEMPRE tiene un valor      │   │ SIN valor inicial,           │
│ evaluación perezosa  │   │ actual consultable          │   │ eventos de un solo uso       │
└─────────────────┘   └────────────────────────┘   └────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía (o continuando en `academia-kmp`, o créala con `mkdir -p academia-kmp` si es tu primera vez), crea `shared/src/commonMain/kotlin/com/academia/kmp/FlowTipos.kt` con este contenido:

```kotlin
package com.academia.kmp

import kotlinx.coroutines.flow.*
import kotlinx.coroutines.delay

fun contarHasta(n: Int): Flow<Int> = flow {
    for (i in 1..n) { delay(10); emit(i) }
}

sealed class EstadoPantalla { object Cargando : EstadoPantalla(); object Exito : EstadoPantalla() }

class ObservadorDeEstado {
    val estado = MutableStateFlow<EstadoPantalla>(EstadoPantalla.Cargando)   // siempre tiene valor actual
    val eventos = MutableSharedFlow<String>()                                // sin valor inicial, un solo uso
}
```

Guarda el archivo y compila el módulo compartido:

```bash
# compila el módulo compartido de Kotlin Multiplatform con Gradle
mkdir -p academia-kmp/shared/src/commonMain/kotlin/com/academia/kmp
cd academia-kmp
./gradlew :shared:compileKotlinMetadata
```

**Explicación línea por línea:** `flow { for (i in 1..n) { delay(10); emit(i) } }` define un flujo perezoso que emite valores solo cuando algo lo recolecta; `MutableStateFlow<EstadoPantalla>(EstadoPantalla.Cargando)` EXIGE un valor inicial en el constructor porque siempre debe haber un "valor actual"; `MutableSharedFlow<String>()` no recibe (ni acepta) un valor inicial, porque conceptualmente representa eventos, no un estado persistente.

Escribe un test que confirme el comportamiento de los tres tipos, incluyendo un observador que llega tarde, en `shared/src/commonTest/kotlin/com/academia/kmp/FlowTiposTest.kt`:

```kotlin
package com.academia.kmp

import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.test.runTest
import kotlin.test.Test
import kotlin.test.assertEquals

class FlowTiposTest {
    @Test
    fun flowEmiteTodosLosValoresEnOrden() = runTest {
        assertEquals(listOf(1, 2, 3, 4, 5), contarHasta(5).toList())
    }

    @Test
    fun observadorTardioDeStateFlowVeElValorActual() = runTest {
        val observador = ObservadorDeEstado()
        observador.estado.value = EstadoPantalla.Exito
        // un nuevo observador que recién ahora empieza a leer, ve el valor actual de inmediato
        assertEquals(EstadoPantalla.Exito, observador.estado.first())
    }
}
```

Ejecuta el test real con Gradle:

```bash
# ejecuta el test Kotlin del módulo compartido
cd academia-kmp
./gradlew :shared:allTests
```

**Resultado esperado:** las dos pruebas pasan en verde: `contarHasta(5).toList()` recolecta `[1, 2, 3, 4, 5]` en orden (el `Flow` perezoso, recolectado con `.toList()`); un observador de `StateFlow` que empieza a leer DESPUÉS de que el estado cambió a `Exito` ve `Exito` de inmediato, porque `StateFlow` siempre expone su valor actual a cualquier nuevo observador.

**Fallo deliberado:** intenta escribir la prueba equivalente con `MutableSharedFlow` en vez de `MutableStateFlow`: emite `"MostrarSnackbar"` en `observador.eventos` ANTES de empezar a recolectar, y luego intenta leer con `observador.eventos.first()`. La prueba se queda esperando indefinidamente (timeout), porque `SharedFlow` no tiene valor inicial ni recuerda emisiones pasadas para un observador que empieza a escuchar después — diagnostica confirmando por qué el error común "usar `SharedFlow` para representar estado de UI persistente" produce pantallas que se quedan "congeladas": un componente que empieza a observar tarde simplemente no ve nada de lo ya emitido.

#### Paso 5 · Práctica guiada — repetición progresiva

1. `flow { emit(1); emit(2); emit(3) }` recolectado con `async for`/`collect` — confirma el orden de los valores emitidos.
2. Crea un `StateFlowSimulado` con un valor inicial distinto y emite dos cambios; confirma que un observador tardío siempre ve el último.
3. Crea un `SharedFlowSimulado` y confirma que, sin importar cuántos eventos emitas antes, un observador tardío no ve ninguno.
4. Escribe de memoria (sin mirar) un `Flow` que emita 3 valores con una pausa entre cada uno.

**Pista:** para decidir entre `StateFlow` y `SharedFlow`, pregúntate: ¿tiene sentido conceptual que este dato tenga un "valor actual" en cualquier momento, o representa algo que ocurre una vez y ya?

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio para declarar un `StateFlow` con valor inicial obligatorio:

```kotlin
val contadorTareas = MutableStateFlow____Int>(0)
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, un `MutableStateFlow` con un valor inicial y un `MutableSharedFlow` sin valor inicial, explicando en una frase cuándo usarías cada uno. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre

Ya distingues `Flow`, `StateFlow` y `SharedFlow` según si existe un valor actual consultable, y confirmas con pruebas reales que un observador tardío de `SharedFlow` nunca recibe eventos pasados, a diferencia de `StateFlow`. El siguiente tema maneja errores dentro de coroutines y protege estado compartido con `Mutex`. Fuente oficial: [Kotlin docs — StateFlow and SharedFlow](https://kotlinlang.org/docs/flow.html#stateflow-and-sharedflow).

**Errores comunes:** usar `SharedFlow` para representar estado de UI persistente, perdiendo el valor para observadores tardíos; usar `StateFlow` para eventos de un solo uso, provocando que un Snackbar se repita indebidamente al rotar la pantalla (porque el "último valor" sigue disponible para el nuevo observador).

**Cuándo no usarlo:** para un valor que se calcula una sola vez y nunca cambia durante la vida de la app (una constante de configuración leída al inicio), ni `Flow` ni `StateFlow` aportan valor sobre una simple propiedad `val`; resérvalos para datos que cambian a lo largo del tiempo y necesitan observadores reactivos.

**Transferencia al proyecto integrador «Núcleo móvil compartido»:** Expón el estado durable de sincronización como StateFlow y separa avisos transitorios. Suscribe un nuevo consumidor y verifica que puede reconstruir la pantalla sin haber recibido eventos anteriores.

### Tema 3: Manejo de errores y exclusión mutua

#### Paso 1 · Objetivo y preparación

Al finalizar podrás capturar errores de una llamada `suspend` transformándolos en un estado explícito, y usar `Mutex` para proteger una variable compartida de una condición de carrera real entre coroutines concurrentes.

**Conocimiento previo:** Tema 1 de este módulo (coroutines); sealed classes para estado de error (Módulo 1, Tema 3).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Capturar errores de red (timeout, sin conexión) y convertirlos en un estado manejable es necesario para no propagar excepciones sin control hacia la UI; proteger una caché en memoria leída y escrita concurrentemente por varias coroutines sin `Mutex` produce una condición de carrera real que pierde actualizaciones silenciosamente, sin ningún error visible.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** `try`/`catch` alrededor de una llamada suspend, `Mutex` para exclusión mutua compatible con suspensión, condición de carrera.

`try { obtenerUsuario(id) } catch (e: Exception) { EstadoUI.Error(e.message ?: "Error desconocido") }` captura cualquier excepción de la operación asíncrona, transformándola en un estado explícito manejable en vez de propagarla sin control. `Mutex` (de `kotlinx.coroutines.sync`) proporciona exclusión mutua diseñada para coroutines: a diferencia de `synchronized`, que bloquearía el hilo físico completo, `Mutex` es compatible con el modelo de suspensión, sin desperdiciar la eficiencia que las coroutines ofrecen.

**Analogía:** manejar errores con `try`/`catch` es tener un plan de contingencia para cuando un mensajero no completa su encargo, convirtiendo el fallo en una respuesta manejable; `Mutex` es un único pase de acceso que solo una persona sostiene a la vez para entrar a una sala, garantizando que nunca dos personas modifiquen simultáneamente el mismo recurso.

**Diagrama:**

```
┌── SIN Mutex: 100 coroutines leen→esperan→escriben ──┐
│  todas leen 0 antes de que cualquiera escriba → resultado final: 1 (perdido) │
└───────────────────────────────────────────────────┘
┌── CON Mutex: cada coroutine espera su turno ──────┐
│  lee→escribe de forma exclusiva → resultado final: 100 (correcto)          │
└───────────────────────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía (o continuando en `academia-kmp`, o créala con `mkdir -p academia-kmp` si es tu primera vez), crea `shared/src/commonMain/kotlin/com/academia/kmp/ErroresYMutex.kt` con este contenido:

```kotlin
package com.academia.kmp

import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.yield

sealed class EstadoUI {
    object Cargando : EstadoUI()
    data class Exito(val datos: List<String>) : EstadoUI()
    data class Error(val mensaje: String) : EstadoUI()
}

suspend fun cargarUsuarioSeguro(id: String, obtenerUsuario: suspend (String) -> String): EstadoUI {
    return try {
        EstadoUI.Exito(listOf(obtenerUsuario(id)))
    } catch (e: Exception) {
        EstadoUI.Error(e.message ?: "Error desconocido")
    }
}

class ContadorSinProteger {
    var valor = 0
        private set
    suspend fun incrementar() {
        val leido = valor
        yield() // cede el control: otra coroutine puede intercalarse justo aquí
        valor = leido + 1
    }
}

class ContadorProtegido {
    private val mutex = Mutex()
    var valor = 0
        private set
    suspend fun incrementar() {
        mutex.withLock { // exclusión mutua compatible con suspensión
            val leido = valor
            yield()
            valor = leido + 1
        }
    }
}
```

Guarda el archivo y compila el módulo compartido:

```bash
# compila el módulo compartido de Kotlin Multiplatform con Gradle
mkdir -p academia-kmp/shared/src/commonMain/kotlin/com/academia/kmp
cd academia-kmp
./gradlew :shared:compileKotlinMetadata
```

**Explicación línea por línea:** `sealed class EstadoUI` reutiliza exactamente el mismo conjunto de tres casos declarado en el Módulo 0, Tema 3 (`Cargando`/`Exito`/`Error`), no una versión parcial con un solo caso; `try { EstadoUI.Exito(listOf(obtenerUsuario(id))) } catch (e: Exception) { EstadoUI.Error(...) }` convierte el resultado feliz en `Exito` y cualquier excepción en un `Error` explícito manejable por la UI; `yield()` cede el control cooperativamente, dando oportunidad a que otra coroutine se intercale exactamente entre la lectura y la escritura; `mutex.withLock { ... }` garantiza que solo UNA coroutine a la vez ejecuta el bloque completo de lectura-escritura, sin importar cuántas veces ceda el control con `yield()` en el medio.

Escribe un test que lance muchas coroutines concurrentes incrementando el mismo contador, sin y con `Mutex`, en `shared/src/commonTest/kotlin/com/academia/kmp/ErroresYMutexTest.kt`:

```kotlin
package com.academia.kmp

import kotlinx.coroutines.launch
import kotlinx.coroutines.test.runTest
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class ErroresYMutexTest {
    @Test
    fun sinProteccionSePierdenIncrementos() = runTest {
        val contador = ContadorSinProteger()
        repeat(100) { launch { contador.incrementar() } }
        // deja que todas las coroutines lanzadas terminen antes de leer el resultado
        advanceUntilIdle()
        assertTrue(contador.valor < 100, "esperaba incrementos perdidos, pero valor fue ${contador.valor}")
    }

    @Test
    fun conMutexNingunIncrementoSePierde() = runTest {
        val contador = ContadorProtegido()
        repeat(100) { launch { contador.incrementar() } }
        advanceUntilIdle()
        assertEquals(100, contador.valor)
    }
}
```

Ejecuta el test real con Gradle:

```bash
# ejecuta el test Kotlin del módulo compartido, verificando la condición de carrera
cd academia-kmp
./gradlew :shared:allTests
```

**Resultado esperado:** las dos pruebas pasan en verde: SIN protección, el contador final es exactamente `1` (todas las 100 coroutines leen `0` antes de que cualquiera escriba su resultado, perdiendo 99 incrementos de forma determinista bajo el scheduler de test); CON `Mutex`, el contador final es exactamente `100`, porque cada coroutine completa su lectura-escritura de forma exclusiva antes de que la siguiente pueda empezar.

**Fallo deliberado:** en `ContadorProtegido`, mueve el `yield()` para que quede FUERA del `mutex.withLock { ... }` (protegiendo solo `val leido = valor`, dejando `valor = leido + 1` en una sección separada sin lock). Vuelve a ejecutar `conMutexNingunIncrementoSePierde` — el resultado vuelve a ser menor a `100` — diagnostica confirmando que `Mutex` debe envolver la operación completa de "leer, ceder el control, escribir" como una unidad atómica; proteger solo una parte de la sección crítica no elimina la condición de carrera.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Repite el experimento sin `Mutex` con 10 corrutinas en vez de 100 y observa si el resultado sigue siendo incorrecto.
2. Repite el experimento con `Mutex` con 500 corrutinas y confirma que sigue dando el resultado exacto esperado.
3. Envuelve un `try`/`catch` alrededor de una función `suspend` que lanza una excepción a propósito, transformándola en `EstadoUI.Error`.
4. Escribe de memoria (sin mirar) una clase con `Mutex` protegiendo un contador compartido, incrementado por múltiples coroutines lanzadas con `launch`.

**Pista:** una condición de carrera no siempre se manifiesta con pocos incrementos; aumentar el número de tareas concurrentes hace el problema más evidente y reproducible.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio para proteger el incremento con `Mutex`:

```kotlin
class Contador {
    private val mutex = Mutex()
    private var valor = 0
    suspend fun incrementar() {
        mutex.____ { valor += 1 }
    }
}
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, un `try`/`catch` que transforme una excepción en un estado de error, y una clase con `Mutex` protegiendo un contador compartido. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre

Ya transformas errores de llamadas `suspend` en estados explícitos, y confirmas con una condición de carrera real (100 incrementos concurrentes perdiéndose hasta `1` sin protección, y preservándose en `100` con `Mutex`) por qué la exclusión mutua compatible con suspensión es necesaria. El siguiente y último tema del módulo distingue en qué hilo corre realmente tu código con Dispatchers. Fuente oficial: [Kotlin docs — Shared mutable state and concurrency](https://kotlinlang.org/docs/shared-mutable-state-and-concurrency.html).

**Errores comunes:** usar `synchronized` dentro de una coroutine, bloqueando el hilo físico completo en vez de usar `Mutex`, compatible con suspensión; proteger solo una parte de la sección crítica (lectura o escritura, no ambas), dejando la condición de carrera sin resolver.

**Cuándo no usarlo:** para estado que solo una coroutine modifica, sin ningún acceso concurrente de otras, `Mutex` agrega overhead innecesario; resérvalo específicamente para estado compartido entre múltiples coroutines concurrentes.

**Transferencia al proyecto integrador «Núcleo móvil compartido»:** Protege la actualización concurrente de la outbox y modela errores recuperables. Lanza dos confirmaciones de la misma guía en pruebas compartidas y comprueba que no duplica la operación pendiente.

### Tema 4: Dispatchers y withContext: en qué hilo corre tu código

#### Paso 1 · Objetivo y preparación

Al finalizar podrás elegir el `Dispatcher` apropiado para una operación (bloqueante de I/O, intensiva en CPU, o de UI), y usar `withContext` para cambiar de contexto sin bloquear el hilo principal.

**Conocimiento previo:** Tema 1 de este módulo (suspend functions); el mismo problema de bloqueo del hilo principal visto en Android (Módulo 13, Tema 4 del track Android).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Una función `suspend` no garantiza por sí sola que su trabajo ocurre fuera del hilo principal: si dentro de ella se ejecuta una operación bloqueante (leer un archivo grande, una consulta de base de datos síncrona) sin cambiar de `Dispatcher` explícitamente, esa operación bloquea el mismo hilo que debería seguir respondiendo a la UI.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** `Dispatchers.Main` (hilo de UI), `Dispatchers.IO` (operaciones bloqueantes de E/S), `Dispatchers.Default` (cómputo intensivo de CPU), `withContext` (cambio de contexto).

`Dispatchers.Main` ejecuta código en el hilo de UI; `Dispatchers.IO` está optimizado para operaciones bloqueantes de entrada/salida (red, disco); `Dispatchers.Default` está optimizado para cómputo intensivo de CPU. `withContext(Dispatchers.IO) { leerArchivoGrande() }` mueve explícitamente ese trabajo bloqueante a un dispatcher apropiado, y devuelve el control a `Dispatchers.Main` automáticamente al terminar el bloque, sin que el desarrollador tenga que gestionar el cambio de vuelta manualmente.

**Analogía:** el hilo principal es un mostrador de atención al cliente que debe seguir respondiendo mientras alguien busca algo en la bodega; `withContext(Dispatchers.IO)` es enviar a alguien más a la bodega mientras el mostrador sigue atendiendo, en vez de que la persona del mostrador abandone su puesto para ir a buscarlo en persona.

**Diagrama:**

```mermaid
flowchart LR
  A[trabajo bloqueante ejecutado directo] --> B[hilo principal congelado durante el trabajo]
  C["withContext(Dispatchers.IO)"] --> D[hilo principal libre durante el trabajo]
  D --> E[withContext devuelve el control a Main al terminar]
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía (o continuando en `academia-kmp`, o créala con `mkdir -p academia-kmp` si es tu primera vez), crea `shared/src/commonMain/kotlin/com/academia/kmp/Dispatchers.kt` con este contenido:

```kotlin
package com.academia.kmp

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlin.time.Duration.Companion.milliseconds
import kotlin.time.TimeSource

fun leerArchivoGrandeBloqueante(): String {
    // busy-wait multiplataforma (Thread.sleep no existe en commonMain): bloquea el hilo real de verdad
    val inicio = TimeSource.Monotonic.markNow()
    while (inicio.elapsedNow() < 300.milliseconds) { /* ocupa el hilo activamente */ }
    return "contenido leído"
}

suspend fun leerArchivoSeguro(): String = withContext(Dispatchers.IO) {
    leerArchivoGrandeBloqueante() // movido explícitamente fuera del hilo principal
}
```

Guarda el archivo y compila el módulo compartido:

```bash
# compila el módulo compartido de Kotlin Multiplatform con Gradle
mkdir -p academia-kmp/shared/src/commonMain/kotlin/com/academia/kmp
cd academia-kmp
./gradlew :shared:compileKotlinMetadata
```

**Explicación línea por línea:** `leerArchivoGrandeBloqueante()` bloquea el hilo real con un busy-wait multiplataforma (análogo a leer un archivo grande de forma síncrona; `Thread.sleep` no está disponible en código `commonMain`, solo en JVM); `withContext(Dispatchers.IO) { leerArchivoGrandeBloqueante() }` mueve esa llamada a un dispatcher optimizado para I/O, devolviendo el control automáticamente al dispatcher original cuando el bloque termina.

Escribe un test con tiempo REAL (no virtual, porque el busy-wait ocupa el hilo de verdad) que compare ejecutar el trabajo bloqueante directamente frente a envolverlo en `withContext(Dispatchers.IO)`, midiendo si un `ticker` concurrente sigue avanzando mientras tanto, en `shared/src/commonTest/kotlin/com/academia/kmp/DispatchersTest.kt`:

```kotlin
package com.academia.kmp

import kotlinx.coroutines.async
import kotlinx.coroutines.delay
import kotlinx.coroutines.runBlocking
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class DispatchersTest {
    @Test
    fun bloquearElHiloPrincipalCongelaElTicker() = runBlocking {
        var marcas = 0
        val ticker = async { repeat(6) { delay(50); marcas++ } }
        leerArchivoGrandeBloqueante() // ejecutado DIRECTO en este hilo, sin withContext
        ticker.await()
        // el busy-wait de 300ms bloqueó este hilo, así que el ticker (que también lo necesita) avanzó poco o nada mientras tanto
        assertTrue(marcas <= 6)
    }

    @Test
    fun withContextIoNoBloqueaElLlamador() = runBlocking {
        var marcas = 0
        val ticker = async { repeat(6) { delay(50); marcas++ } }
        val resultado = leerArchivoSeguro() // corre en Dispatchers.IO, en otro hilo
        ticker.await()
        assertEquals("contenido leído", resultado)
        assertEquals(6, marcas) // el ticker completó sus 6 incrementos sin ser bloqueado
    }
}
```

Ejecuta el test real con Gradle:

```bash
# ejecuta el test Kotlin del módulo compartido, midiendo el bloqueo real del hilo
cd academia-kmp
./gradlew :shared:allTests
```

**Resultado esperado:** `withContextIoNoBloqueaElLlamador` pasa con `marcas == 6`: como `leerArchivoGrandeBloqueante()` corre en `Dispatchers.IO` (un hilo distinto), el `ticker` en el hilo de `runBlocking` completa sus 6 incrementos de `delay(50)` sin ser bloqueado. En cambio, en un entorno real de un solo hilo de UI, ejecutar el mismo trabajo bloqueante directamente (sin `withContext`) congelaría ese hilo durante los 300ms completos, impidiendo que cualquier otra coroutine en ese mismo hilo progrese mientras tanto.

**Fallo deliberado:** en `leerArchivoSeguro`, cambia `withContext(Dispatchers.IO)` por `withContext(Dispatchers.Main)` (o simplemente elimina el `withContext`, dejando la llamada directa). El código sigue compilando (`suspend` no exige ningún `withContext` específico) — diagnostica confirmando la advertencia central de este tema: marcar una función como `suspend` no garantiza que su trabajo interno se ejecute fuera del hilo principal; sin un `withContext` explícito hacia un dispatcher apropiado, una función suspend puede bloquear el hilo principal exactamente igual que una función síncrona ordinaria, la misma trampa vista con Android en el Módulo 13 del track Android.

#### Paso 5 · Práctica guiada — repetición progresiva

1. Cambia la duración del busy-wait de `leerArchivoGrandeBloqueante` a `100.milliseconds` y confirma que el `ticker` completa más incrementos en el mismo tiempo.
2. Agrega una segunda llamada a `leerArchivoGrandeBloqueante()` concurrente (con `async { withContext(Dispatchers.IO) { ... } }`) y confirma que el `ticker` sigue avanzando sin bloquearse.
3. Declara `withContext(Dispatchers.Default) { calculoIntensivo() }` (conceptualmente, sin ejecutarlo) para una operación de CPU en vez de I/O, y explica en una frase por qué usarías `Default` en vez de `IO` en ese caso.
4. Escribe de memoria (sin mirar) una función `suspend` que use `withContext(Dispatchers.IO)` para envolver una operación bloqueante de tu elección.

**Pista:** `Dispatchers.IO` está optimizado para operaciones que esperan (red, disco); `Dispatchers.Default` está optimizado para operaciones que calculan (CPU); elige según cuál es el cuello de botella real de tu operación.

#### Paso 6 · Práctica independiente

**Completa el código:** rellena el espacio para mover la consulta de base de datos fuera del hilo principal:

```kotlin
suspend fun obtenerTareasGuardadas(): List<Tarea> = withContext(Dispatchers.____) {
    consultaBloqueanteDeBaseDeDatos()
}
```

**Reto de memoria sin mirar:** cierra este documento y escribe, solo de memoria, una función `suspend` que use `withContext(Dispatchers.IO)` para una operación de red, y explica en una frase por qué `suspend` por sí solo no garantiza esa protección. Compara después contra el patrón del Paso 4.

#### Paso 7 · Cierre

Ya eliges el `Dispatcher` apropiado según el tipo de operación (I/O bloqueante frente a cómputo intensivo), y confirmas con un test real que `withContext(Dispatchers.IO)` marca la diferencia entre una función que bloquea el hilo llamador y una que no. Esto cierra el módulo de coroutines y Flow; el siguiente módulo aplica estos fundamentos a la arquitectura completa de un proyecto KMP con source sets y `expect`/`actual`. Fuente oficial: [Kotlin docs — Coroutine context and dispatchers](https://kotlinlang.org/docs/coroutine-context-and-dispatchers.html).

**Errores comunes:** asumir que marcar una función como `suspend` es suficiente para que no bloquee el hilo principal, sin verificar el dispatcher efectivo usado dentro; usar `Dispatchers.IO` para cómputo intensivo de CPU (o viceversa), desaprovechando el pool de hilos optimizado para cada caso.

**Cuándo no usarlo:** para una operación genuinamente instantánea sin I/O ni cómputo pesado (una simple transformación en memoria), envolverla en `withContext(Dispatchers.IO)` agrega overhead de cambio de contexto sin ningún beneficio; resérvalo para operaciones que realmente bloquearían o tardarían de forma perceptible.

---

**Transferencia al proyecto integrador «Núcleo móvil compartido»:** Inyecta dispatchers en el repositorio donde necesites control de ejecución. Una prueba debe simular I/O lento sin dormir realmente y verificar que el consumidor recibe el resultado en el contexto previsto.

## Laboratorio práctico

**Objetivo del laboratorio:** construir una función suspendida que combina dos fuentes de datos con manejo de errores estructurado, protegiendo estado compartido y usando el dispatcher apropiado.

**Requisitos previos:** Módulos 0-1 completados.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Escribir una función suspend con `delay()` | Ver Tema 1 | Simula una llamada de red |
| 2 | Lanzar dos coroutines en paralelo con `async`/`await` | Ver Tema 1 | Combina sus resultados |
| 3 | Crear un `Flow` que emita valores periódicamente | Ver Tema 2 | Recolecta con `collect` |
| 4 | Implementar un `StateFlow` para el estado de una pantalla | Ver Tema 2 | Observado desde un componente de UI |
| 5 | Capturar un error con `try`/`catch` alrededor de una llamada suspend | Ver Tema 3 | Transforma el error en un estado explícito |
| 6 | Proteger un contador compartido con `Mutex` | Ver Tema 3 | Confirma el resultado correcto bajo concurrencia |
| 7 | Envolver una operación bloqueante con `withContext(Dispatchers.IO)` | Ver Tema 4 | Mide que el hilo principal permanece libre |

**Verificación:** el laboratorio se considera exitoso si ambas fuentes de datos se cargan en paralelo (no secuencialmente, verificado con una medición real de tiempo), si un error simulado se transforma correctamente en un estado `EstadoUI.Error` manejable, y si un contador compartido protegido con `Mutex` da el resultado exacto esperado bajo concurrencia.

**Errores comunes y soluciones**

- **Llamar a `await()` inmediatamente después de cada `async` en vez de lanzar ambos primero.** Lanza ambos `async` antes de llamar a `await()` en cualquiera, para que efectivamente corran en paralelo.
- **Usar `SharedFlow` para representar estado de UI persistente.** Usa `StateFlow`, que siempre mantiene un valor actual consultable.
- **Usar `synchronized` dentro de una coroutine para exclusión mutua.** Usa `Mutex`, compatible con el modelo de suspensión de coroutines.
- **Asumir que `suspend` por sí solo garantiza no bloquear el hilo principal.** Usa `withContext(Dispatchers.IO)` explícitamente para operaciones bloqueantes.

---
