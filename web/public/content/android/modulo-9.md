# Módulo 9: Testing en Android


## Aprende construyendo

> **Antes de empezar este módulo.** Las pruebas tienen su propia carpeta y su propio tipo de dependencia: `app/src/test` (pruebas locales en la JVM, `testImplementation`, se ejecutan con `./gradlew :app:testDebugUnitTest`) y `app/src/androidTest` (pruebas instrumentadas en el emulador, `androidTestImplementation`, se ejecutan con `./gradlew :app:connectedDebugAndroidTest`). Nada de lo que está en `app/src/main` se ejecuta como prueba: allí `org.junit` ni siquiera está en el classpath. Comprueba que `app/build.gradle.kts` tiene, dentro de `dependencies { }`:
>
> ```kotlin
> testImplementation(libs.junit)                         // ya lo trae la plantilla
> testImplementation(libs.kotlinx.coroutines.test)       // catálogo del Módulo 0 (o la línea del Módulo 0, Tema 6)
> androidTestImplementation(platform(libs.androidx.compose.bom))   // ya lo trae la plantilla
> androidTestImplementation(libs.androidx.ui.test.junit4)          // ya lo trae la plantilla
> debugImplementation(libs.androidx.ui.test.manifest)              // ya lo trae la plantilla
> ```
>
> Los nombres de las líneas «de la plantilla» pueden variar ligeramente según tu versión de Android Studio; si falta alguna, añádela con el nombre que aparezca en tu `gradle/libs.versions.toml`.
>
> **Los scripts `python3` de este módulo son modelos, no pruebas de tu app.** La evidencia real son las pruebas Kotlin de cada tema ejecutadas con Gradle y su informe en `app/build/reports/tests/`.


### Tema 1: Testing de ViewModels con fakes y runTest · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás testear un ViewModel con un repositorio fake, explicando por qué es más rápido y confiable que probar contra la API real.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌── Test contra API real ────────────────────┐
│ lento, depende de red, puede fallar por razones  │
│ AJENAS a la lógica bajo prueba (servidor caído)     │
└─────────────────────────────────────────┘
┌── Test con TareaRepositoryFake ────────────┐
│ milisegundos, determinista, solo falla si la        │
│ LÓGICA del ViewModel tiene un bug real                 │
└─────────────────────────────────────────┘
```

```bash
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
mkdir -p app/src/test/kotlin/com/academia/android
```

Crea el archivo `app/src/test/kotlin/com/academia/android/TareasViewModelTest.kt`:

```kotlin
package com.academia.android

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test

// Fake del TareaRepository del Módulo 6; Tarea es la @Entity de Room de ese módulo
class TareaRepositoryFake(datosIniciales: List<Tarea>) : TareaRepository {
    override val tareas = MutableStateFlow(datosIniciales)
    override suspend fun sincronizar() {
        // fake en memoria: no hay ninguna API real que sincronizar
    }
}

@OptIn(ExperimentalCoroutinesApi::class)
class TareasViewModelTest {
    // viewModelScope usa Dispatchers.Main, que no existe en la JVM de las pruebas locales
    @Before fun usarMainDePrueba() = Dispatchers.setMain(UnconfinedTestDispatcher())
    @After fun restaurarMain() = Dispatchers.resetMain()

    @Test
    fun cargaTareasCorrectamente() = runTest {
        val repo = TareaRepositoryFake(listOf(Tarea(id = "1", titulo = "Comprar leche", completada = false)))
        // adapta el repositorio del Módulo 6 a la FuenteDeTareas que espera el ViewModel del Módulo 4
        val fuente = object : FuenteDeTareas {
            override suspend fun obtenerTareas() = repo.tareas.first().map { it.titulo }
        }
        val viewModel = TareasViewModelConEstado(fuente)
        viewModel.cargar()
        assertEquals(EstadoUI.Exito(listOf("Comprar leche")), viewModel.estado.value)
    }
}
```

```bash
./gradlew :app:testDebugUnitTest --tests "com.academia.android.TareasViewModelTest"
```

Crea el archivo `test_viewmodel_fake.py`:

```python
import time
import unittest

class TareaRepositorioFake:
    def __init__(self, datos):
        self.datos = datos
    def obtener_tareas(self):
        return self.datos  # instantáneo, sin latencia de red

class TareaRepositorioRealSimulado:
    def obtener_tareas(self):
        time.sleep(0.3)  # simula latencia de red real
        return ["Comprar leche"]

class ViewModel:
    def __init__(self, repo):
        self.repo = repo
        self.estado = None
    def cargar(self):
        self.estado = ("Exito", self.repo.obtener_tareas())

class TestViewModelConFake(unittest.TestCase):
    def test_carga_tareas_correctamente(self):
        inicio = time.time()
        vm = ViewModel(TareaRepositorioFake(["Comprar leche"]))
        vm.cargar()
        duracion = time.time() - inicio
        self.assertEqual(vm.estado, ("Exito", ["Comprar leche"]))
        self.assertLess(duracion, 0.05, "el test con fake debe ser prácticamente instantáneo")

if __name__ == "__main__":
    unittest.main()
```

```bash
python3 -m unittest test_viewmodel_fake.py -v
```

</details>

### Tema 2: Compose UI Testing · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás escribir un test de Compose UI que verifique lo que efectivamente se renderiza, no solo el estado interno de un ViewModel.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌── Test de ViewModel ──────────────────────┐
│ viewModel.estado.value == Exito(datos correctos) │
│ (verifica SOLO el estado interno)                    │
└─────────────────────────────────────────┘
┌── Test de Compose UI ─────────────────────┐
│ onNodeWithText("Comprar leche").assertIsDisplayed() │
│ (verifica lo que el USUARIO efectivamente ve)         │
└─────────────────────────────────────────┘
```

```bash
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
mkdir -p app/src/androidTest/kotlin/com/academia/android
```

Crea el archivo `app/src/androidTest/kotlin/com/academia/android/TarjetaTareaUiTest.kt`:

```kotlin
package com.academia.android

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import org.junit.Rule
import org.junit.Test

class TarjetaTareaUiTest {
    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun muestraElTituloDeLaTarea() {
        composeTestRule.setContent { TarjetaTarea(titulo = "Comprar leche", completada = false) }
        composeTestRule.onNodeWithText("Comprar leche").assertIsDisplayed()
    }
}
```

```bash
./gradlew :app:connectedDebugAndroidTest -Pandroid.testInstrumentationRunnerArguments.class="com.academia.android.TarjetaTareaUiTest"
```

```bash
python3 -c "
def renderizar_tarjeta_correcta(titulo, completada):
    return {'texto_mostrado': titulo, 'tachado': completada}

def renderizar_tarjeta_con_bug(titulo, completada):
    return {'texto_mostrado': titulo, 'tachado': not completada}  # bug: condición invertida

def estado_del_viewmodel_es_correcto(completada_real):
    return completada_real == True  # el ViewModel calculó bien 'completada = True'

def ui_muestra_correctamente(render, completada_real):
    return render['tachado'] == completada_real

completada_real = True

print('estado del ViewModel correcto:', estado_del_viewmodel_es_correcto(completada_real))

render_correcto = renderizar_tarjeta_correcta('Comprar leche', completada_real)
print('con render correcto, UI coincide con el estado:', ui_muestra_correctamente(render_correcto, completada_real))

render_con_bug = renderizar_tarjeta_con_bug('Comprar leche', completada_real)
print('con render CON BUG, UI coincide con el estado:', ui_muestra_correctamente(render_con_bug, completada_real))
"
```

</details>

### Tema 3: Testing end-to-end con Activity real, y fakes vs mocks · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás explicar qué cubre un test end-to-end que lanza la Activity real de la app (en vez de un único composable aislado) que ni un test de ViewModel ni uno de Compose UI del Tema 2 cubren, y decidir entre un fake y un mock.

#### ► LA ANALOGÍA
**Conceptos clave:** validación de flujos completos de usuario lanzando la Activity real, código Kotlin ordinario frente a proxies generados.

`createAndroidComposeRule<ComponentActivity>()` —a diferencia de `createComposeRule()` del Tema 2, que monta un único composable aislado con `setContent`— lanza la Activity real de la app con su `NavHost` y todas sus pantallas activas, permitiendo que un mismo test navegue de una pantalla a otra exactamente como lo haría un usuario real, usando los mismos finders de Compose (`onNodeWithTag`, `onNodeWithText`) ya vistos en el Tema 2, ahora contra la app completa en vez de un composable suelto. Esta app es 100% Jetpack Compose, sin ninguna View clásica ni layout XML, por lo que Espresso (diseñado para localizar Views por `R.id`) no tiene ningún nodo que encontrar aquí; `ComposeTestRule` es la única herramienta que puede recorrer el árbol semántico de Compose, tanto para un composable aislado (Tema 2) como para la app completa (este Tema). Preferir un fake (código Kotlin ordinario) sobre un mock (un proxy generado dinámicamente por Mockito) es apropiado cuando se quiere una implementación reutilizable con comportamiento consistente; un mock es más conveniente para verificar interacciones puntuales muy específicas.

**Analogía:** un test de Compose UI aislado (Tema 2) es como inspeccionar una única pieza recién fabricada; un test end-to-end con la Activity real es como un inspector de calidad que recorre el proceso completo de fabricación de principio a fin, verificando el producto final tal como llega al cliente. Un fake es como un modelo de práctica funcional reutilizable en múltiples ejercicios; un mock es una simulación puntual configurada para verificar un único gesto específico.

**Diagrama:**

```
┌── Test de ViewModel ──────────────────────────┐  verifica la lógica de estado aislada
├── Test de Compose UI, Tema 2 (setContent) ─────┤  verifica un único composable aislado
└── Test E2E, createAndroidComposeRule (Activity)─┘  verifica el flujo COMPLETO, múltiples pantallas

┌── Fake (código Kotlin ordinario) ──┐  reutilizable, comportamiento consistente
└── Mock (proxy generado, Mockito) ──┘  verificación puntual de interacciones específicas
```

#### ► REGLA PRÁCTICA
Prefiere un fake por defecto: es código Kotlin reutilizable con comportamiento consistente entre tests. Recurre a un mock solo cuando lo que quieres verificar es una interacción puntual muy específica (que se llamó un método exacto, con esos argumentos exactos, esa cantidad de veces) y no el comportamiento general del colaborador.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌── Test de ViewModel ──────────────────────────┐  verifica la lógica de estado aislada
├── Test de Compose UI, Tema 2 (setContent) ─────┤  verifica un único composable aislado
└── Test E2E, createAndroidComposeRule (Activity)─┘  verifica el flujo COMPLETO, múltiples pantallas

┌── Fake (código Kotlin ordinario) ──┐  reutilizable, comportamiento consistente
└── Mock (proxy generado, Mockito) ──┘  verificación puntual de interacciones específicas
```

```bash
# Este test instrumentado lanza la Activity real y navega la app completa con finders de Compose
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
mkdir -p app/src/androidTest/kotlin/com/academia/android
```

Crea el archivo `app/src/androidTest/kotlin/com/academia/android/FlujoCrearTareaTest.kt`:

```kotlin
package com.academia.android

import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performTextInput
import org.junit.Rule
import org.junit.Test

class FlujoCrearTareaTest {
    @get:Rule
    val compose = createAndroidComposeRule<MainActivity>() // lanza la MainActivity de la app, no un composable aislado

    @Test
    fun creaUnaTareaYLaVeEnLaLista() {
        compose.onNodeWithTag("boton_agregar").performClick()
        compose.onNodeWithTag("campo_titulo").performTextInput("Nueva tarea")
        compose.onNodeWithTag("boton_guardar").performClick()
        compose.onNodeWithText("Nueva tarea").assertExists()
    }
}
```

```bash
./gradlew :app:connectedDebugAndroidTest -Pandroid.testInstrumentationRunnerArguments.class="com.academia.android.FlujoCrearTareaTest"
```

```bash
python3 -c "
class TareaRepositoryFake:  # código ordinario, reutilizable entre tests
    def __init__(self):
        self.tareas_guardadas = []
    def guardar(self, titulo):
        self.tareas_guardadas.append(titulo)
        return True

class MockConVerificacionDeLlamadas:  # equivalente simplificado a un mock de Mockito
    def __init__(self):
        self.llamadas = []
    def guardar(self, titulo):
        self.llamadas.append(('guardar', titulo))
        return True
    def fue_llamado_exactamente_una_vez_con(self, metodo, argumento):
        return self.llamadas.count((metodo, argumento)) == 1

# uso típico de un FAKE: comportamiento reutilizable, se verifica el estado resultante
fake = TareaRepositoryFake()
fake.guardar('Nueva tarea')
print('fake, estado resultante reutilizable:', fake.tareas_guardadas)

# uso típico de un MOCK: verificación puntual de que una interacción específica ocurrió
mock = MockConVerificacionDeLlamadas()
mock.guardar('Nueva tarea')
print('mock, verificación puntual de la llamada:', mock.fue_llamado_exactamente_una_vez_con('guardar', 'Nueva tarea'))
"
```

</details>
