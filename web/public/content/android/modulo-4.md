# Módulo 4: Estado con StateFlow y Compose


## Aprende construyendo

> **Antes de empezar este módulo.** Con el catálogo del Módulo 0 (Tema 3), añade en `app/build.gradle.kts`, dentro de `dependencies { }`, `implementation(libs.androidx.lifecycle.viewmodel.compose)` (si no lo hiciste en el Módulo 1) e `implementation(libs.androidx.lifecycle.runtime.compose)`; esta última trae `collectAsStateWithLifecycle`, que el Tema 2 importa. Pulsa **Sync Now**.
>
> **Los scripts `python3` de este módulo son modelos, no pruebas.** La evidencia real es la app en el emulador: rotar, enviar a segundo plano y observar qué se muestra.


### Tema 1: StateFlow en el ViewModel · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás exponer un estado de pantalla desde un ViewModel con StateFlow, garantizando que siempre haya un valor actual disponible.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
# compila con Gradle el archivo Kotlin generado a continuación
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
mkdir -p app/src/main/kotlin/com/academia/android
```

Crea el archivo `app/src/main/kotlin/com/academia/android/TareasViewModelConEstado.kt`:

```kotlin
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
```

```bash
./gradlew :app:compileDebugKotlin
```

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

</details>

### Tema 2: collectAsStateWithLifecycle y UDF · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás observar un StateFlow desde Compose de forma consciente del ciclo de vida, y explicar el principio UDF que rige la dirección del flujo de datos.

#### ► LA ANALOGÍA
**Conceptos clave:** recolección consciente del ciclo de vida, flujo de datos en una única dirección.

`collectAsStateWithLifecycle` pausa automáticamente la recolección cuando la Activity va a background (tras `onStop`, Módulo 1) y la reanuda al volver a foreground, ahorrando recursos que `collectAsState` (la versión simple, sin esa consciencia) desperdiciaría. UDF generaliza el state hoisting del Módulo 2 hacia la relación completa `ViewModel`↔UI: el estado fluye desde el `ViewModel` hacia la UI, y las intenciones del usuario fluyen en la dirección contraria, nunca al revés.

**Analogía:** `collectAsStateWithLifecycle` es como un asistente que deja de tomar notas cuando la sala de reuniones está vacía y retoma al volver alguien; UDF es como una cadena de mando donde las órdenes fluyen de arriba hacia abajo y los reportes de abajo hacia arriba, sin que un subordinado emita órdenes directamente a sus pares.

**Diagrama:**

```
┌── Usuario hace click ──▶ ViewModel.accion() ──▶ actualiza StateFlow ──▶ Compose recompone ─┐
│                                                                                                │
└──────────────── la UI NUNCA modifica el estado directamente ─────────────────────┘
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌── Usuario hace click ──▶ ViewModel.accion() ──▶ actualiza StateFlow ──▶ Compose recompone ─┐
│                                                                                                │
└──────────────── la UI NUNCA modifica el estado directamente ─────────────────────┘
```

```bash
# compila con Gradle el archivo Kotlin generado a continuación
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
mkdir -p app/src/main/kotlin/com/academia/android
```

Crea el archivo `app/src/main/kotlin/com/academia/android/PantallaTareasUDF.kt`:

```kotlin
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
```

```bash
./gradlew :app:compileDebugKotlin
```

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

</details>

### Tema 3: SharedFlow para eventos de un solo uso · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás explicar por qué un SharedFlow puede perder un evento de un solo uso (como mostrar un Snackbar) y modelarlo, como recomienda la guía oficial de eventos de UI, como estado que la UI consume y confirma, sin que se repita tras una rotación ni se pierda.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
# compila con Gradle el archivo Kotlin generado a continuación
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
mkdir -p app/src/main/kotlin/com/academia/android
```

Crea el archivo `app/src/main/kotlin/com/academia/android/EventosTareasViewModel.kt`:

```kotlin
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
```

```bash
./gradlew :app:compileDebugKotlin
```

```kotlin
val estado by viewModel.estado.collectAsStateWithLifecycle()
estado.mensajeUsuario?.let { mensaje ->
    LaunchedEffect(mensaje) {
        snackbarHostState.showSnackbar(mensaje)
        viewModel.mensajeMostrado()
    }
}
```

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

</details>

### Tema 4: Restaurar un borrador tras recreación: remember no equivale a rememberSaveable · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar distinguirás recomposición, recreación de Activity y restauración del estado de un campo. Prerrequisitos: Kotlin, estado Compose y ciclo de vida. Android Studio y emulador con rotación habilitada. El ejemplo independiente parte de un proyecto nuevo Empty Activity con…

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

</details>
