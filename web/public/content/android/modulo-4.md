# Módulo 4: Estado con StateFlow y Compose


## Aprende construyendo

> **Antes de empezar este módulo.** Con el catálogo del Módulo 0 (Tema 3), añade en `app/build.gradle.kts`, dentro de `dependencies { }`, `implementation(libs.androidx.lifecycle.viewmodel.compose)` (si no lo hiciste en el Módulo 1) e `implementation(libs.androidx.lifecycle.runtime.compose)`; esta última trae `collectAsStateWithLifecycle`, que el Tema 2 importa. Pulsa **Sync Now**.
>
> **Los scripts `python3` de este módulo son modelos, no pruebas.** La evidencia real es la app en el emulador: rotar, enviar a segundo plano y observar qué se muestra.

### Tema 1: StateFlow en el ViewModel · Intermedio · 40 min

#### Paso 1 · Objetivo y preparación

Al finalizar podrás exponer un estado de pantalla desde un `ViewModel` con `StateFlow`, garantizando que siempre haya un valor actual disponible.

**Conocimiento previo:** `ViewModel` (Módulo 1 de este track).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** `StateFlow` garantiza un valor actual siempre disponible, apropiado para representar el estado de una pantalla completa; la convención de exponerlo como mutable privado y de solo lectura público refuerza la dirección única del flujo de datos (UDF, Tema 2).

#### Paso 3 · Teoría con analogía

**Conceptos clave:** estado observable, siempre con un valor actual disponible.

`StateFlow` es un tipo especial de `Flow` (Kotlin Multiplatform, Módulo 2) que garantiza tener siempre un valor actual disponible de inmediato para cualquier nuevo observador, a diferencia de un `Flow` genérico. Esta garantía lo hace apto para representar "el estado actual de la pantalla" (`Cargando`, `Exito`, `Error`), un valor que siempre debe existir. El patrón `_estado` privado mutable expuesto como `estado` de solo lectura es una convención de encapsulación: el `ViewModel` controla exclusivamente cuándo cambia el estado; la UI solo puede leerlo.

**Analogía:** `StateFlow` es como un tablero de anuncios público que siempre muestra algún mensaje actual visible para cualquiera que lo mire (nunca está vacío), en contraste con un sistema de mensajería que solo entrega mensajes nuevos a partir del momento en que alguien se suscribe.

**Diagrama:**

```
┌── ViewModel ──────────────────────────────┐
│ private val _estado = MutableStateFlow(Cargando)  │
│ val estado: StateFlow<EstadoUI> = _estado.asStateFlow() │
└──────────┬─────────────────────────────┘
           │ solo lectura hacia afuera
           ▼
┌── Cualquier observador nuevo ──────────────┐
│ recibe INMEDIATAMENTE el valor actual         │
│ (nunca espera a un evento futuro)                │
└───────────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Continuando en `academia-android` (el proyecto creado en el Módulo 0; si no lo tienes, créalo primero con su Tema 1), crea `app/src/main/kotlin/com/academia/android/TareasViewModelConEstado.kt`:

```bash
# compila con Gradle el archivo Kotlin generado a continuación
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
mkdir -p app/src/main/kotlin/com/academia/android
cat > app/src/main/kotlin/com/academia/android/TareasViewModelConEstado.kt <<'EOF'
package com.academia.android

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

// Contrato mínimo de este módulo. El repositorio completo (Room + Retrofit) llega en el Módulo 6
// con otro nombre, TareaRepository; mantenerlos separados evita que un módulo rompa al otro.
interface FuenteDeTareas {
    suspend fun obtenerTareas(): List<String>
}

sealed class EstadoUI {
    object Cargando : EstadoUI()
    data class Exito(val datos: List<String>) : EstadoUI()
    data class Error(val mensaje: String?) : EstadoUI()
}

class TareasViewModelConEstado(private val repo: FuenteDeTareas) : ViewModel() {
    private val _estado = MutableStateFlow<EstadoUI>(EstadoUI.Cargando)
    val estado: StateFlow<EstadoUI> = _estado.asStateFlow()

    fun cargar() = viewModelScope.launch {
        _estado.value = try {
            EstadoUI.Exito(repo.obtenerTareas())
        } catch (e: Exception) {
            EstadoUI.Error(e.message)
        }
    }
}
EOF
./gradlew :app:compileDebugKotlin
```

**Explicación línea por línea:** `_estado` es `MutableStateFlow`, mutable solo dentro de la clase; `estado` se expone como `StateFlow` (interfaz de solo lectura) vía `asStateFlow()`; `cargar()` actualiza `_estado.value` dentro de `viewModelScope.launch`, garantizando que siempre exista un valor (`Cargando` inicialmente, luego `Exito` o `Error`) disponible para cualquier observador, en cualquier momento.

Simula, en Python, que un nuevo observador que se suscribe tarde igual recibe el valor actual de inmediato, a diferencia de un evento que ya pasó:

```bash
python3 -c "
class StateFlowSimulado:
    def __init__(self, valor_inicial):
        self.valor_actual = valor_inicial  # SIEMPRE hay un valor

    def actualizar(self, nuevo_valor):
        self.valor_actual = nuevo_valor

    def nuevo_observador_recibe(self):
        return self.valor_actual  # inmediato, sin importar cuándo se suscribe

estado = StateFlowSimulado('Cargando')
estado.actualizar('Exito: [tarea1, tarea2]')
print('observador que llega tarde recibe de inmediato:', estado.nuevo_observador_recibe())
"
```

**Resultado esperado:** aunque el "observador" se suscribe después de que el estado ya cambió de `Cargando` a `Exito`, recibe inmediatamente el valor actual (`Exito: [tarea1, tarea2]`), confirmando la garantía central de `StateFlow`: nunca hay ausencia de valor para un nuevo observador.

**Fallo deliberado:** intenta mutar `estado` (la propiedad pública de solo lectura) directamente desde fuera de la clase, como haría un composable si `TareasViewModelConEstado` expusiera `_estado` en vez de `estado` (`viewModel._estado.value = EstadoUI.Cargando`, simulando el error). En Kotlin real esto ni siquiera compila, porque `_estado` es `private` — diagnostica confirmando que la visibilidad `private` en el tipo mutable es lo que impide, a nivel de compilador, que cualquier consumidor externo rompa la dirección única del flujo de datos (UDF, Tema 2), no una simple convención de nombres sin efecto real.

#### Paso 5 · Práctica guiada

Agrega un cuarto caso a `EstadoUI` (`object Vacio`, para cuando `repo.obtenerTareas()` devuelve una lista vacía) y actualiza `cargar()` para emitirlo cuando corresponda. **Pista:** revisa el tamaño de la lista dentro del bloque `try` antes de decidir entre `Exito` y `Vacio`.

#### Paso 6 · Práctica independiente

Documenta en una frase por qué `EstadoUI` se modela como `sealed class` en vez de, por ejemplo, tres variables booleanas independientes (`cargando`, `error`, `exito`), y qué estados inválidos (por ejemplo, `cargando = true` y `exito = true` simultáneamente) esa segunda alternativa permitiría por error que `sealed class` evita estructuralmente.

#### Paso 7 · Cierre

Ya expones un estado de pantalla con `StateFlow`, garantizando un valor actual siempre disponible y protegido de mutación externa. El siguiente tema cubre cómo observar ese `StateFlow` desde Compose de forma consciente del ciclo de vida. Fuente oficial: [Android Developers — StateFlow and SharedFlow](https://developer.android.com/kotlin/flow/stateflow-and-sharedflow).

**Errores comunes:** exponer `MutableStateFlow` directamente en vez de su versión de solo lectura, permitiendo que la UI mute el estado sin pasar por el `ViewModel`; olvidar el valor inicial de `MutableStateFlow`, lo cual ni siquiera compila porque `StateFlow` exige un valor desde su creación.

**Cuándo no usarlo:** un mensaje puntual en el `StateFlow` necesita además una confirmación de la UI (`mensajeMostrado()`), o se mostraría tras cada rotación; el Tema 3 enseña ese patrón.

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Expón un estado inmutable de la ruta desde StateFlow. Simula carga y fallo de red y verifica que la pantalla no combina un indicador de éxito con datos de una consulta anterior.

### Tema 2: collectAsStateWithLifecycle y UDF · Intermedio · 40 min

#### Paso 1 · Objetivo y preparación

Al finalizar podrás observar un `StateFlow` desde Compose de forma consciente del ciclo de vida, y explicar el principio UDF que rige la dirección del flujo de datos.

**Conocimiento previo:** Tema 1 de este módulo; ciclo de vida (Módulo 1); state hoisting (Módulo 2).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** `collectAsStateWithLifecycle` evita desperdiciar recursos recolectando actualizaciones mientras la UI no es visible; UDF hace que el flujo de datos de toda la pantalla sea predecible, con una única fuente de verdad (el `ViewModel`) controlando todos los cambios de estado.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** recolección consciente del ciclo de vida, flujo de datos en una única dirección.

`collectAsStateWithLifecycle` pausa automáticamente la recolección cuando la Activity va a background (tras `onStop`, Módulo 1) y la reanuda al volver a foreground, ahorrando recursos que `collectAsState` (la versión simple, sin esa consciencia) desperdiciaría. UDF generaliza el state hoisting del Módulo 2 hacia la relación completa `ViewModel`↔UI: el estado fluye desde el `ViewModel` hacia la UI, y las intenciones del usuario fluyen en la dirección contraria, nunca al revés.

**Analogía:** `collectAsStateWithLifecycle` es como un asistente que deja de tomar notas cuando la sala de reuniones está vacía y retoma al volver alguien; UDF es como una cadena de mando donde las órdenes fluyen de arriba hacia abajo y los reportes de abajo hacia arriba, sin que un subordinado emita órdenes directamente a sus pares.

**Diagrama:**

```
┌── Usuario hace click ──▶ ViewModel.accion() ──▶ actualiza StateFlow ──▶ Compose recompone ─┐
│                                                                                                │
└──────────────── la UI NUNCA modifica el estado directamente ─────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Reutiliza `academia-android` (el proyecto del Módulo 0) y crea `app/src/main/kotlin/com/academia/android/PantallaTareasUDF.kt`:

```bash
# compila con Gradle el archivo Kotlin generado a continuación
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
mkdir -p app/src/main/kotlin/com/academia/android
cat > app/src/main/kotlin/com/academia/android/PantallaTareasUDF.kt <<'EOF'
package com.academia.android

import androidx.compose.runtime.Composable
import androidx.lifecycle.compose.collectAsStateWithLifecycle

@Composable
fun PantallaTareasUDF(viewModel: TareasViewModelConEstado) {
    val estado by viewModel.estado.collectAsStateWithLifecycle()
    when (estado) {
        is EstadoUI.Cargando -> Spinner()
        is EstadoUI.Exito -> ListaTareas((estado as EstadoUI.Exito).datos)
        is EstadoUI.Error -> MensajeError()
    }
}
EOF
./gradlew :app:compileDebugKotlin
```

**Explicación línea por línea:** `viewModel.estado.collectAsStateWithLifecycle()` observa el `StateFlow` pausando la recolección cuando la Activity no está en foreground; el `when (estado)` renderiza un composable distinto según el caso de `EstadoUI`, sin que ningún branch modifique `estado` directamente — la UI solo lee, nunca escribe.

Simula la diferencia de consumo de recursos entre `collectAsState` (siempre activo) y `collectAsStateWithLifecycle` (pausado en background) a lo largo de una sesión de uso típica:

```bash
python3 -c "
eventos = ['foreground', 'foreground', 'background', 'background', 'background', 'foreground']

recolecciones_simple = sum(1 for e in eventos)  # collectAsState: recolecta siempre, sin importar el estado
recolecciones_consciente = sum(1 for e in eventos if e == 'foreground')  # pausa en background

print('eventos totales:', len(eventos))
print('recolecciones con collectAsState (simple):', recolecciones_simple)
print('recolecciones con collectAsStateWithLifecycle:', recolecciones_consciente)
print('ahorro:', recolecciones_simple - recolecciones_consciente, 'recolecciones evitadas en background')
"
```

**Resultado esperado:** de 6 eventos totales, solo 3 ocurren en `foreground`; `collectAsState` simple recolectaría en los 6, mientras que `collectAsStateWithLifecycle` solo recolecta en los 3 de `foreground`, ahorrando exactamente las 3 recolecciones que ocurrirían inútilmente mientras la UI no es visible.

**Fallo deliberado:** modifica `PantallaTareasUDF.kt` para que, dentro del `when`, alguna rama asigne directamente `viewModel.estado.value = EstadoUI.Cargando` (rompiendo UDF deliberadamente). En Kotlin real esto no compila, porque `estado` es `StateFlow` (interfaz de solo lectura, sin propiedad `value` mutable) — diagnostica confirmando que UDF no es solo una convención de diseño sino que, gracias al patrón del Tema 1, el propio sistema de tipos de Kotlin impide que la UI mute el estado directamente.

#### Paso 5 · Práctica guiada

Agrega una función `onReintentar: () -> Unit` como parámetro de `PantallaTareasUDF`, invocada desde `MensajeError()`, que llame a `viewModel.cargar()` (Tema 1) — confirma que esta es la única forma correcta de que la UI "reaccione" ante un error: notificando una intención, no mutando el estado. **Pista:** sigue exactamente el mismo patrón de callback de state hoisting del Módulo 2, Tema 2.

#### Paso 6 · Práctica independiente

Documenta en una frase qué diferencia de comportamiento observarías en los logs si cambiaras `collectAsStateWithLifecycle` por `collectAsState` simple en una pantalla real, dejando la app en background varios minutos y luego revisando cuántas veces se recolectó el `StateFlow` durante ese período.

#### Paso 7 · Cierre

Ya observas un `StateFlow` de forma consciente del ciclo de vida, y explicas por qué UDF hace que el flujo de datos sea predecible y protegido por el propio sistema de tipos. El siguiente tema cubre el caso de eventos de un solo uso, donde `StateFlow` no es la herramienta correcta. Fuente oficial: [Android Developers — collectAsStateWithLifecycle](https://developer.android.com/topic/libraries/architecture/lifecycle#lifecycle-aware-flow-collection).

**Errores comunes:** usar `collectAsState` simple en pantallas de producción, desperdiciando recursos en background; que la UI intente modificar el estado directamente en vez de notificar una intención al `ViewModel`.

**Cuándo no usarlo:** para un `Flow` de una fuente que no representa "estado de pantalla" sino un flujo de datos puramente transitorio sin necesidad de valor actual, `StateFlow` y `collectAsStateWithLifecycle` no son la herramienta adecuada; considera un `SharedFlow` (Tema 3) para esos casos.

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Recoge el estado de ruta solo mientras la pantalla esté activa. Envía la aplicación al fondo y vuelve; verifica que muestra el valor reciente y no crea colecciones adicionales en cada regreso.

### Tema 3: SharedFlow para eventos de un solo uso · Intermedio · 40 min

#### Paso 1 · Objetivo y preparación

Al finalizar podrás explicar por qué un `SharedFlow` puede perder un evento de un solo uso (como mostrar un Snackbar) y modelarlo, como recomienda la guía oficial de eventos de UI, como **estado** que la UI consume y confirma, sin que se repita tras una rotación ni se pierda.

**Conocimiento previo:** Temas 1 y 2 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Un mensaje como «Tarea guardada» o una navegación tras un pago son resultados que el usuario no debe perder. La guía oficial de Android sobre eventos de UI establece que los eventos que nacen en el `ViewModel` deben producir siempre una actualización del estado de UI, y advierte que exponerlos con `Channel` u otros streams reactivos no garantiza su entrega cuando el `ViewModel` vive más que la UI que los recolecta (por ejemplo, durante una rotación o con la app en segundo plano).

#### Paso 3 · Teoría con analogía

**Conceptos clave:** eventos que no deben repetirse en una recomposición, a diferencia del estado persistente.

Un `MutableSharedFlow()` sin `replay` entrega cada emisión solo a los recolectores activos en ese instante y no la retiene. Eso parece ideal para «mostrar un Snackbar», pero es justo el problema: si el evento se emite mientras la Activity se está recreando o la UI está detenida, nadie lo recolecta y se pierde. Un `StateFlow` con un campo `mensaje = "Tarea guardada"` tampoco basta por sí solo, porque tras rotar el nuevo observador lo vería otra vez. La solución de la guía oficial combina ambas ideas: el mensaje forma parte del estado (`mensajeUsuario: String?`), así que sobrevive a la rotación y nunca se pierde, y la UI llama a `mensajeMostrado()` cuando ya lo enseñó, lo que lo pone a `null` y evita repetirlo. Un cambio de configuración no es una recomposición: la recomposición vuelve a ejecutar composables con el mismo estado; la rotación destruye y recrea la Activity.

**Analogía:** un `SharedFlow` para eventos es una campana que suena una sola vez: si el destinatario estaba fuera de la sala, el aviso se pierde. El estado con confirmación es una nota en el tablón: sigue ahí hasta que alguien la lee y la retira (`mensajeMostrado()`). La analogía termina aquí: la nota solo sobrevive a la muerte del proceso si además la guardas con `SavedStateHandle`.

**Diagrama:**

```
┌── StateFlow (estado persistente) ─────────────┐
│ nuevo observador SIEMPRE recibe el valor actual     │
│ (correcto para "lista de tareas actual")               │
└─────────────────────────────────────────┘
┌── SharedFlow sin replay (evento) ─────────────┐
│ se entrega solo a quien escucha EN ESE INSTANTE      │
│ (riesgo: se pierde durante rotación o background)       │
└─────────────────────────────────────────┘
┌── Estado + confirmación (recomendado) ────────┐
│ mensajeUsuario = "Tarea guardada" hasta que la UI    │
│ llama mensajeMostrado() → null (ni se pierde ni repite) │
└─────────────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Reutiliza `academia-android` (el proyecto del Módulo 0) y crea `app/src/main/kotlin/com/academia/android/EventosTareasViewModel.kt`:

```bash
# compila con Gradle el archivo Kotlin generado a continuación
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
mkdir -p app/src/main/kotlin/com/academia/android
cat > app/src/main/kotlin/com/academia/android/EventosTareasViewModel.kt <<'EOF'
package com.academia.android

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class EdicionTareaUiState(
    val guardando: Boolean = false,
    val mensajeUsuario: String? = null,
)

class EventosTareasViewModel : ViewModel() {
    private val _estado = MutableStateFlow(EdicionTareaUiState())
    val estado = _estado.asStateFlow()

    fun guardarTarea() = viewModelScope.launch {
        _estado.update { it.copy(guardando = true) }
        // ... lógica de guardado real ...
        _estado.update { it.copy(guardando = false, mensajeUsuario = "Tarea guardada") }
    }

    // La UI lo llama cuando ya mostró el mensaje: así no se repite tras rotar
    fun mensajeMostrado() {
        _estado.update { it.copy(mensajeUsuario = null) }
    }
}
EOF
./gradlew :app:compileDebugKotlin
```

**Explicación línea por línea:** el resultado del guardado no se «emite»: se escribe en el estado (`mensajeUsuario = "Tarea guardada"`), así que cualquier observador, también el que llega tras una rotación, lo ve mientras no se haya mostrado. `mensajeMostrado()` es la confirmación de la UI: pone el mensaje a `null`. En la pantalla lo consumes así (patrón de la guía oficial):

```kotlin
val estado by viewModel.estado.collectAsStateWithLifecycle()
estado.mensajeUsuario?.let { mensaje ->
    LaunchedEffect(mensaje) {
        snackbarHostState.showSnackbar(mensaje)
        viewModel.mensajeMostrado()
    }
}
```

Este script es un **modelo** (no ejecuta Android) de por qué no conviene un `SharedFlow` para el mensaje: un observador que se suscribe DESPUÉS de la emisión, como la Activity recreada tras rotar, no recibe nada:

```bash
python3 -c "
class StateFlowSimulado:
    def __init__(self, valor_inicial):
        self.valor_actual = valor_inicial
    def actualizar(self, valor):
        self.valor_actual = valor
    def nuevo_observador_recibe(self):
        return self.valor_actual  # SIEMPRE recibe el último valor

class SharedFlowSimulado:
    def __init__(self):
        self.observadores_activos_en_el_momento_de_emitir = []
    def emitir(self, evento):
        for callback in self.observadores_activos_en_el_momento_de_emitir:
            callback(evento)
        # el evento NO queda retenido para nadie que se suscriba después

estado = StateFlowSimulado('lista_vacia')
estado.actualizar('lista_cargada')
# un observador que llega DESPUÉS de la actualización de StateFlow:
print('StateFlow -> observador tardío recibe:', estado.nuevo_observador_recibe())

eventos = SharedFlowSimulado()
eventos.emitir('TareaGuardada')  # nadie estaba escuchando todavía
# un observador que llega DESPUÉS de la emisión de SharedFlow:
observador_tardio_vio_algo = len(eventos.observadores_activos_en_el_momento_de_emitir) > 0
print('SharedFlow -> observador tardío vio el evento:', observador_tardio_vio_algo)
"
```

**Resultado esperado:** el observador tardío de `StateFlow` recibe `lista_cargada` (el valor actual, siempre disponible); el observador tardío de `SharedFlow` NO ve ningún evento (`False`): si «Tarea guardada» se hubiera emitido así mientras la Activity se recreaba, el usuario nunca vería el aviso. Por eso el `ViewModel` del Paso 4 guarda el mensaje en el estado y lo retira solo cuando la UI confirma que lo mostró.

**Verificación real en Android:** muestra la pantalla con un botón que llama a `guardarTarea()` y el `SnackbarHost` del bloque anterior. Pulsa el botón: aparece «Tarea guardada» una vez. Rota el emulador cuando el Snackbar ya se cerró: no vuelve a aparecer, porque `mensajeMostrado()` lo puso a `null`. Pulsa de nuevo el botón y rota **mientras** el Snackbar está visible: tras la recreación se muestra otra vez, porque aún no se había confirmado; no se pierde.

**Fallo deliberado:** comenta la llamada `viewModel.mensajeMostrado()` en la pantalla, instala y repite: tras cada rotación el Snackbar reaparece aunque no hayas guardado nada. **Diagnóstico:** el mensaje sigue en el estado porque nadie lo confirmó; la corrección no es volver a un `SharedFlow` (que lo perdería), sino confirmar el consumo. Restaura la llamada.

#### Paso 5 · Práctica guiada

Agrega una función `eliminarTarea(id: String)` que, al terminar, deje en el estado `mensajeUsuario = "Tarea $id eliminada"`, y comprueba en el emulador que el Snackbar se muestra una vez y no se repite al rotar. **Pista:** sigue el mismo patrón de `update { it.copy(...) }` y reutiliza `mensajeMostrado()`.

#### Paso 6 · Práctica independiente

Documenta en una tabla de dos columnas, para tres señales reales de tu propio proyecto (por ejemplo: lista de resultados, mensaje de error puntual, navegación tras pago exitoso), cómo la modelarías como estado de UI (por ejemplo, `pagoConfirmado: Boolean` que la UI observa para navegar, como el `isUserLoggedIn` de la guía oficial), justificando qué pasaría con cada una si se perdiera durante una rotación.

#### Paso 7 · Cierre

Ya sabes por qué un `SharedFlow` puede perder un evento de un solo uso y lo modelas como estado con confirmación, de modo que ni se pierde ni se repite tras una rotación. Esto cierra el módulo de estado con StateFlow y Compose; el siguiente módulo del track aborda networking con Retrofit para conectar este estado con datos reales de red. Fuentes oficiales: [Android Developers — UI events](https://developer.android.com/topic/architecture/ui-layer/events) y [StateFlow y SharedFlow](https://developer.android.com/kotlin/flow/stateflow-and-sharedflow#sharedflow).

**Errores comunes:** exponer el aviso con un `SharedFlow` o `Channel` y perderlo cuando la UI no está recolectando (rotación, segundo plano); guardar el mensaje en el estado pero olvidar `mensajeMostrado()`, con lo que reaparece tras cada rotación.

**Cuándo no usarlo:** `SharedFlow` sigue siendo útil para difundir datos a varios recolectores cuando perder una emisión no importa (por ejemplo, actualizaciones de progreso que se reemplazan); no lo uses para resultados que el usuario debe ver o para navegar.

---

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Modela la confirmación como estado durable y usa eventos para avisos transitorios. Rota después de entregar: no debe repetirse la navegación ni depender de un aviso perdido para saber si el envío fue confirmado.

## Laboratorio práctico

**Objetivo del laboratorio:** construir una pantalla con UDF completo: eventos de usuario → `ViewModel` → `StateFlow` → UI.

**Requisitos previos:** Módulos 0-3 completados.

| Paso | Acción | Código/Comando | Explicación |
|---|---|---|---|
| 1 | Exponer un `StateFlow<EstadoUI>` desde un `ViewModel` | Ver Tema 1 | `_estado` privado, `estado` público |
| 2 | Observarlo con `collectAsStateWithLifecycle` | Ver Tema 2 | En vez de `collectAsState` simple |
| 3 | Implementar el flujo UDF completo | Ver Tema 2 | Click → ViewModel → StateFlow → recomposición |
| 4 | Mostrar un aviso de un solo uso como estado con confirmación | Ver Tema 3 | `mensajeUsuario` + `mensajeMostrado()` |
| 5 | Verificar la pausa automática de recolección en background | Ver Tema 2 | Con `collectAsStateWithLifecycle` |

**Verificación:** el laboratorio se considera exitoso si el aviso se muestra exactamente una vez (no se repite tras rotar la pantalla ni se pierde si rotas mientras está visible), y si toda actualización de estado sigue el flujo UDF completo sin que la UI modifique el `StateFlow` directamente.

**Errores comunes y soluciones**

- **Usar un `SharedFlow` o `Channel` para un aviso de un solo uso como un Snackbar.** Se pierde si la UI no está recolectando; guárdalo en el estado y confírmalo con `mensajeMostrado()`.
- **Usar `collectAsState` simple en vez de `collectAsStateWithLifecycle`.** Desperdicia recursos recolectando mientras la app está en background.
- **Modificar el estado directamente desde la UI en vez de notificar una intención al `ViewModel`.** Rompe UDF; toda mutación de estado debe pasar por el `ViewModel`.

---


## Laboratorio de transferencia

### Tema 4: Restaurar un borrador tras recreación: remember no equivale a rememberSaveable · Intermedio · 40 min

#### Paso 1 · Objetivo y preparación
Al finalizar distinguirás recomposición, recreación de Activity y restauración del estado de un campo. **Prerrequisitos:** Kotlin, estado Compose y ciclo de vida. Android Studio y emulador con rotación habilitada. El ejemplo independiente parte de un proyecto nuevo Empty Activity con Compose y Material 3.

#### Paso 2 · Contexto y caso real
En el proyecto integrador, una persona redacta una observación de entrega antes de enviarla. **¿Por qué es importante?** Mantener un dato durante recomposición no demuestra que vuelva al recrear la pantalla ni al recuperar un proceso eliminado por el sistema.

#### Paso 3 · Teoría, modelo mental y analogía
`remember` conserva un valor mientras permanece su composición. `rememberSaveable` añade guardado/restauración para valores compatibles con el mecanismo de estado guardado. Un ViewModel sobrevive a cambios de configuración, pero no a cualquier muerte de proceso. Para datos duraderos necesitas persistencia apropiada, por ejemplo una base de datos.

**Analogía:** remember es una nota sobre la mesa; saveable es una ficha breve para reconstruir el contexto. El límite es el tamaño y la naturaleza del estado guardado: no guardes listas enormes, fotos ni secretos en él. Este campo es estado transitorio, no una entrega enviada al servidor.

#### Paso 4 · Demostración guiada desde cero
En Android Studio, crea **New Project → Empty Activity**, nombre `Restauracion`, paquete `com.example.restauracion`, Kotlin. Usa las dependencias de Compose/Material 3 que genera la plantilla y conserva sus versiones. Abre la terminal en la raíz del proyecto. Crea o reemplaza `app/src/main/java/com/example/restauracion/MainActivity.kt`:
```kotlin
package com.example.restauracion

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                var nota by rememberSaveable { mutableStateOf("") }
                Column(Modifier.padding(24.dp)) {
                    Text("Borrador de entrega")
                    OutlinedTextField(value = nota, onValueChange = { nota = it },
                        label = { Text("Observación") })
                    Text("Texto transitorio; aún no enviado")
                }
            }
        }
    }
}
```
```bash
./gradlew assembleDebug
```
En Windows usa `gradlew.bat assembleDebug`. Instala y ejecuta con Run de Android Studio. **Resultado esperado:** escribe `Puerta azul`, rota el emulador y verifica que el texto sigue. Explica cada bloque: Activity instala la composición, el estado guardable recibe los cambios y el campo representa ese estado.

#### Paso 5 · Práctica guiada
**Fallo deliberado:** sustituye `rememberSaveable` por `remember` y ajusta su import. Rota tras escribir: si la Activity se recrea, el texto se pierde. **Pista:** deshabilitar la recreación para esconder el fallo no enseña restauración; repón el estado guardable. Verifica la configuración del emulador si no se produce recreación.

#### Paso 6 · Práctica independiente
Ensaya muerte de proceso del sistema: con la app en segundo plano y un dispositivo ADB seleccionado ejecuta `adb shell am kill com.example.restauracion`, y vuelve desde recientes. Registra si se restaura el texto y las condiciones del dispositivo. No uses force-stop ni borres datos para afirmar que probaste el mismo escenario. Diseña además dónde guardarías una observación que debe sobrevivir al cierre explícito del usuario.

#### Paso 7 · Cierre
El siguiente paso es SavedStateHandle y persistencia de borradores. **Errores comunes:** confundir recomposición con recreación, guardar objetos grandes y esperar que ViewModel sobreviva a cualquier terminación. **Límites y decisión de uso:** este ejemplo no promete conservación tras force-stop, desinstalación o borrado de datos.

**Fuente oficial:** [Android: guardar estado Compose](https://developer.android.com/develop/ui/compose/state-saving).
