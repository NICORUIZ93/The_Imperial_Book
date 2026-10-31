# Módulo 9: Testing en Android


## Aprende construyendo

### Tema 1: Testing de ViewModels con fakes y runTest

#### Paso 1 · Objetivo y preparación

Al finalizar podrás testear un `ViewModel` con un repositorio fake, explicando por qué es más rápido y confiable que probar contra la API real.

**Conocimiento previo:** `ViewModel`/`StateFlow` (Módulos 1 y 4); Retrofit (Módulo 5).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Probar un ViewModel con un repositorio fake es más rápido y confiable que con la API real, dado que elimina la dependencia de factores externos (disponibilidad del servidor, latencia de red) que podrían hacer fallar el test por razones ajenas a la lógica bajo prueba.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** rapidez y determinismo frente a dependencias reales.

Un repositorio fake es una implementación real y simple de la interfaz `TareaRepository` que devuelve datos predefinidos en memoria en vez de consultar una API real. El test corre en milisegundos, sin latencia de red variable ni riesgo de fallar por una razón ajena a la lógica bajo prueba, el mismo principio que los fakes en `commonTest` de Kotlin Multiplatform (Módulo 9 de ese track). `runTest` permite que funciones `suspend` con `delay()` interno se ejecuten instantáneamente en el test, sin esperar el tiempo real completo.

**Analogía:** testear un ViewModel con un repositorio fake es como practicar un procedimiento médico en un maniquí de entrenamiento en vez de en un paciente real: se puede repetir tantas veces como sea necesario, rápido y sin riesgos externos.

**Diagrama:**

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

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía (o continuando en `academia-android` de módulos anteriores), crea `app/src/main/kotlin/com/academia/android/TareasViewModelTest.kt`, y modela el mismo principio con un fake real ejecutado en Python (usando `unittest`, verificable en este entorno) antes de confiar en el equivalente Kotlin:

```bash
# Este script python3 (unittest) ejecuta un test real contra un repositorio fake
mkdir -p academia-android/app/src/main/kotlin/com/academia/android
cd academia-android
cat > app/src/main/kotlin/com/academia/android/TareasViewModelTest.kt <<'EOF'
package com.academia.android

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Test

class TareaRepositoryFake(datosIniciales: List<Tarea>) : TareaRepository {
    override val tareas = MutableStateFlow(datosIniciales)
    override suspend fun sincronizar() {
        // fake en memoria: no hay ninguna API real que sincronizar
    }
}

class TareasViewModelTest {
    @Test
    fun cargaTareasCorrectamente() = runTest {
        val tareaDePrueba = Tarea(id = "1", titulo = "Comprar leche", completada = false)
        val viewModel = TareasViewModelConEstado(TareaRepositoryFake(listOf(tareaDePrueba)))
        viewModel.cargar()
        assertEquals(EstadoUI.Exito(listOf("Comprar leche")), viewModel.estado.value)
    }
}
EOF
./gradlew :app:compileDebugKotlin
```

**Explicación línea por línea:** `TareaRepositoryFake` es una clase Kotlin ordinaria que implementa la interfaz `TareaRepository` (Módulo 6) exponiendo un `MutableStateFlow` en memoria como `tareas` en vez de Room/Retrofit reales, con `sincronizar()` como no-operación porque el fake no tiene ninguna fuente remota que sincronizar, sin ninguna librería de mocking; `runTest` ejecuta el cuerpo del test en un dispatcher de tiempo virtual, permitiendo que cualquier `delay()` interno (por ejemplo, dentro de un backoff de reintento) transcurra instantáneamente.

Ejecuta con `pytest` un test Python real y equivalente conceptualmente, confirmando en ejecución real la velocidad y determinismo de un fake frente a una llamada de red real simulada con latencia:

```bash
cat > test_viewmodel_fake.py <<'EOF'
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
EOF
python3 -m unittest test_viewmodel_fake.py -v
```

**Resultado esperado:** el test pasa (`OK`) confirmando tanto que el estado final es correcto como que la duración fue menor a 50 milisegundos, demostrando en ejecución real la velocidad de un fake; si el mismo test usara `TareaRepositorioRealSimulado` (con su `time.sleep(0.3)`), tardaría al menos 300 milisegundos, y a escala de cientos de tests esa diferencia se vuelve significativa para la velocidad de la suite completa de CI (DevOps, Módulo 4).

**Fallo deliberado:** cambia `TareaRepositorioFake(["Comprar leche"])` por `TareaRepositorioRealSimulado()` en el test, y ejecuta de nuevo. El test sigue pasando (`OK`), pero la aserción `assertLess(duracion, 0.05, ...)` ahora falla porque la duración real es de al menos 300 milisegundos — diagnostica confirmando que aunque el resultado lógico siga siendo correcto, depender de una simulación de latencia real (equivalente a la API real) degrada directamente la velocidad de la suite de tests, la razón concreta por la que se prefiere un fake en este nivel de testing.

#### Paso 5 · Práctica guiada

Agrega un segundo test a `test_viewmodel_fake.py` que confirme el caso de error (`TareaRepositorioFake` que lance una excepción al llamar `obtener_tareas()`), y verifica que el `ViewModel` transiciona al estado esperado de error. **Pista:** puedes hacer que el fake reciba un flag `deberia_fallar` en su constructor.

#### Paso 6 · Práctica independiente

Documenta en una frase por qué un test de ViewModel con un fake que siempre devuelve los mismos datos predefinidos es determinista, mientras que un test contra la API real podría fallar de forma intermitente (flaky) sin ningún cambio en el código bajo prueba.

#### Paso 7 · Cierre

Ya testeas un `ViewModel` con un repositorio fake, y explicas por qué es más rápido y confiable que probar contra la API real. El siguiente tema cubre cómo verificar que el estado correcto efectivamente se traduce en la UI renderizada. Fuente oficial: [Android Developers — Test ViewModel with coroutines](https://developer.android.com/kotlin/coroutines/test).

**Errores comunes:** depender de la API real en un test de ViewModel, haciéndolo lento y frágil ante fallas externas; olvidar `runTest`, dejando que cualquier `delay()` real ralentice el test innecesariamente.

**Cuándo no usarlo:** para un test de integración deliberado que específicamente busca validar el contrato real con un backend (no la lógica del ViewModel en sí), un fake no es apropiado; ese caso requiere efectivamente una llamada real, aceptando su costo de velocidad como parte del propósito del test.

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Prueba el ViewModel de ruta con reloj y repositorio controlados. Simula dos búsquedas en orden inverso y comprueba que prevalece la última selección, sin depender de esperas reales.

### Tema 2: Compose UI Testing

#### Paso 1 · Objetivo y preparación

Al finalizar podrás escribir un test de Compose UI que verifique lo que efectivamente se renderiza, no solo el estado interno de un `ViewModel`.

**Conocimiento previo:** Tema 1 de este módulo; Jetpack Compose (Módulo 2).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Un test de Compose UI cubre la brecha entre "el estado interno es correcto" y "la UI efectivamente renderizada refleja ese estado correctamente para el usuario", algo que un test de ViewModel por sí solo no puede garantizar.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** verificar lo que efectivamente se renderiza, no solo el estado interno.

Un test de ViewModel verifica que la lógica de estado sea correcta, pero no que ese estado se traduzca en la UI renderizada correcta: un composable con un bug de renderizado podría pasar un test de ViewModel válido mientras la pantalla se ve incorrecta. `ComposeTestRule` renderiza el composable en un entorno de test controlado y permite aserciones sobre nodos específicos (`onNodeWithText(...).assertIsDisplayed()`), cerrando esa brecha. Esta distinción es análoga a testear un hook aislado frente al componente completo en React (track React, Módulo 8).

**Analogía:** un test de ViewModel es como verificar que los ingredientes correctos entraron a la cocina; un test de Compose UI es como verificar que el plato que efectivamente llega a la mesa del cliente se ve como se esperaba.

**Diagrama:**

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

#### Paso 4 · Demostración guiada desde cero

Reutiliza `academia-android` (o créalo desde una carpeta vacía con `mkdir -p academia-android` si es tu primera vez) y crea `app/src/main/kotlin/com/academia/android/TarjetaTareaUiTest.kt`:

```bash
# Este script python3 modela la brecha entre estado correcto y renderizado correcto
mkdir -p academia-android/app/src/main/kotlin/com/academia/android
cd academia-android
cat > app/src/main/kotlin/com/academia/android/TarjetaTareaUiTest.kt <<'EOF'
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
EOF
./gradlew :app:compileDebugKotlin
```

**Explicación línea por línea:** `composeTestRule.setContent { ... }` renderiza `TarjetaTarea` (Módulo 2) en un entorno de test aislado; `onNodeWithText("Comprar leche")` busca un nodo en el árbol de UI resultante con ese texto exacto, y `assertIsDisplayed()` confirma que efectivamente es visible, verificando el resultado visual real, no solo un valor de estado interno.

Simula, con un árbol de UI simplificado en Python, la diferencia entre un composable con estado correcto pero un bug de renderizado, y uno correcto en ambos aspectos:

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

**Resultado esperado:** el estado del `ViewModel` es correcto en ambos casos (`completada_real = True`); sin embargo, el render con bug produce una UI que NO coincide con ese estado (`tachado: False` cuando debería ser `True`), mientras el render correcto sí coincide, confirmando exactamente la brecha que un test de ViewModel (que solo vería `completada_real = True`, sin detectar el bug de renderizado) no puede detectar, pero un test de Compose UI sí.

**Fallo deliberado:** modifica `TarjetaTareaUiTest.kt` para buscar un texto que no está en el composable renderizado (`onNodeWithText("Texto que no existe").assertIsDisplayed()`). En un test Compose real, esto falla con una excepción indicando que no se encontró ningún nodo con ese texto — diagnostica confirmando que `ComposeTestRule` verifica el árbol de UI real resultante de la composición, no una lista arbitraria de textos esperados; solo pasa si el texto efectivamente aparece en lo que se renderizó.

#### Paso 5 · Práctica guiada

Agrega un segundo test que renderice `TarjetaTarea(titulo = "Pagar alquiler", completada = true)` y confirme, además de que el texto se muestra, que el nodo tiene la propiedad de texto tachado (`assertTextEquals` o inspeccionando el estilo, según lo que exponga la API de testing de Compose). **Pista:** revisa la documentación de `SemanticsNodeInteraction` para las aserciones disponibles sobre estilo de texto.

#### Paso 6 · Práctica independiente

Documenta en una frase un ejemplo real (no el de este Tema) de un bug que un test de ViewModel no detectaría pero un test de Compose UI sí, basándote en composables de tu propio proyecto.

#### Paso 7 · Cierre

Ya escribes un test de Compose UI que verifica lo efectivamente renderizado, cerrando la brecha que un test de ViewModel aislado no cubre. El siguiente tema cubre cómo validar flujos completos de usuario a través de múltiples pantallas, y cuándo preferir un fake sobre un mock. Fuente oficial: [Android Developers — Compose testing](https://developer.android.com/develop/ui/compose/testing).

**Errores comunes:** confiar únicamente en tests de ViewModel sin ningún test de Compose UI, dejando bugs de renderizado sin cobertura; buscar nodos por un identificador frágil (texto que cambia frecuentemente) en vez de un `testTag` estable cuando el texto no es relevante para la aserción.

**Cuándo no usarlo:** para un composable extremadamente simple sin ninguna lógica condicional de renderizado (un texto estático sin ninguna transformación), un test de Compose UI dedicado aporta poco valor; resérvalo para composables con lógica de renderizado condicional real.

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Escribe una prueba de usuario que busque una guía, abra el detalle y encuentre su estado. Cambiar el texto del estado o retirar su semántica debe producir un fallo comprensible.

### Tema 3: Testing end-to-end con Activity real, y fakes vs mocks

#### Paso 1 · Objetivo y preparación

Al finalizar podrás explicar qué cubre un test end-to-end que lanza la Activity real de la app (en vez de un único composable aislado) que ni un test de ViewModel ni uno de Compose UI del Tema 2 cubren, y decidir entre un fake y un mock.

**Conocimiento previo:** Temas 1 y 2 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Un test end-to-end que lanza la Activity real cubre flujos completos (navegación entre pantallas, estado compartido entre ellas) que ningún test unitario aislado puede cubrir por sí solo; elegir entre fake y mock depende de si se necesita una implementación reutilizable y consistente (fake) o una verificación puntual de interacciones específicas (mock).

#### Paso 3 · Teoría con analogía

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

#### Paso 4 · Demostración guiada desde cero

Reutiliza `academia-android` (o créalo desde una carpeta vacía con `mkdir -p academia-android` si es tu primera vez) y crea `app/src/main/kotlin/com/academia/android/FlujoCrearTareaTest.kt`:

```bash
# Este test instrumentado lanza la Activity real y navega la app completa con finders de Compose
mkdir -p academia-android/app/src/androidTest/kotlin/com/academia/android
cd academia-android
cat > app/src/androidTest/kotlin/com/academia/android/FlujoCrearTareaTest.kt <<'EOF'
package com.academia.android

import androidx.activity.ComponentActivity
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performTextInput
import org.junit.Rule
import org.junit.Test

class FlujoCrearTareaTest {
    @get:Rule
    val compose = createAndroidComposeRule<ComponentActivity>() // lanza la Activity real, no un composable aislado

    @Test
    fun creaUnaTareaYLaVeEnLaLista() {
        compose.onNodeWithTag("boton_agregar").performClick()
        compose.onNodeWithTag("campo_titulo").performTextInput("Nueva tarea")
        compose.onNodeWithTag("boton_guardar").performClick()
        compose.onNodeWithText("Nueva tarea").assertExists()
    }
}
EOF
./gradlew :app:connectedDebugAndroidTest -Pandroid.testInstrumentationRunnerArguments.class="com.academia.android.FlujoCrearTareaTest"
```

**Explicación línea por línea:** `createAndroidComposeRule<ComponentActivity>()` lanza la Activity real de la app (a diferencia de `createComposeRule()` del Tema 2, que solo monta un composable suelto con `setContent`), con su `NavHost` y pantallas reales activas; cada `onNodeWithTag(...).performClick()`/`performTextInput(...)` simula una interacción real de usuario en secuencia (tocar "agregar", escribir el título, tocar "guardar"); la aserción final (`onNodeWithText("Nueva tarea").assertExists()`) verifica que, tras todo ese flujo a través de múltiples pantallas y componentes, la tarea nueva efectivamente aparece en la lista — algo que ni un test de ViewModel aislado ni uno de Compose UI de un único composable (Tema 2) podrían verificar por sí solos.

Modela, en Python real, la diferencia entre usar un fake reutilizable y un mock de verificación puntual para el mismo repositorio, ejecutando ambos casos:

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

**Resultado esperado:** el fake expone un estado real y consultable (`tareas_guardadas`) que cualquier test puede inspeccionar libremente, apropiado para reutilizar en múltiples escenarios; el mock expone específicamente si una interacción puntual ocurrió exactamente como se esperaba, apropiado para verificar un comportamiento muy específico (como una llamada a analytics) sin necesitar mantener un estado completo simulado.

**Fallo deliberado:** intenta usar `MockConVerificacionDeLlamadas` como si fuera reutilizable entre múltiples tests distintos que necesitan estados iniciales diferentes (por ejemplo, un test que necesita que ya existan 3 tareas previas). El mock, diseñado solo para verificar llamadas puntuales, no tiene ningún mecanismo para precargar ese estado inicial — diagnostica confirmando que forzar un mock a servir como fake reutilizable con estado complejo generalmente requiere configurarlo extensamente en cada test individual, mientras que un fake bien diseñado (como `TareaRepositoryFake`, que sí podría aceptar tareas iniciales en su constructor) está pensado exactamente para ese caso de reutilización.

#### Paso 5 · Práctica guiada

Agrega un segundo flujo a `FlujoCrearTareaTest.kt` (con los mismos finders de `ComposeTestRule`) que verifique eliminar la tarea recién creada y confirmar que ya no aparece en la lista, encadenando esos pasos después de los ya existentes. **Pista:** sigue el mismo patrón de `onNodeWithTag(...).performClick()` para el nuevo flujo, terminando con `onNodeWithText("Nueva tarea").assertDoesNotExist()`.

#### Paso 6 · Práctica independiente

Documenta en una tabla de tres filas (Test de ViewModel, Test de Compose UI aislado, Test E2E con Activity real) qué porcentaje aproximado de tu propia suite de tests debería corresponder a cada categoría, y justifica esa proporción según la velocidad relativa y el alcance de cobertura de cada una.

#### Paso 7 · Cierre

Ya explicas qué cubre específicamente cada uno de los tres niveles de testing de este módulo, y decides con criterio entre un fake y un mock según la necesidad del test. Esto cierra el módulo de testing en Android; el siguiente módulo del track aborda performance y profiling. Fuente oficial: [Android Developers — Compose testing cheatsheet](https://developer.android.com/develop/ui/compose/testing/testing-cheatsheet).

**Errores comunes:** usar un test end-to-end con Activity real para verificar lógica unitaria aislada, siendo más lento y menos apropiado que un test de ViewModel para ese propósito; forzar un mock a servir como fake reutilizable con estado complejo, complicando innecesariamente cada test individual.

**Cuándo no usarlo:** para verificar un detalle de implementación muy específico y aislado (una función pura de formateo), un test end-to-end completo con Activity real es una sobrecarga desproporcionada; un test unitario simple es más apropiado y más rápido para ese caso.

---

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Ejecuta el recorrido de entrega en una Activity real con backend falso. Recrea la Activity durante el flujo y comprueba que la selección persiste y que confirmar no genera efectos duplicados.

## Laboratorio práctico

**Objetivo del laboratorio:** construir una suite de tests: ViewModel con coroutines test + al menos un test de Compose UI.

**Requisitos previos:** Módulo 8 completado.

| Paso | Acción | Código/Comando | Explicación |
|---|---|---|---|
| 1 | Test de ViewModel con repositorio fake | Ver Tema 1 | Verifica el `StateFlow` tras una acción |
| 2 | Usar `runTest` para lógica suspend | Ver Tema 1 | Sin esperas reales |
| 3 | Test de Compose UI con `ComposeTestRule` | Ver Tema 2 | Verifica texto en pantalla tras un click |
| 4 | Test end-to-end con `createAndroidComposeRule` (Activity real) | Ver Tema 3 | Flujo completo de la app |
| 5 | Documentar cuándo preferir fake sobre mock | Ver Tema 3 | Para un repositorio en tus tests |

**Verificación:** el laboratorio se considera exitoso si la suite incluye al menos un test de ViewModel (con `runTest` y fake), un test de Compose UI, y un test end-to-end con `createAndroidComposeRule` lanzando la Activity real, todos pasando consistentemente.

**Errores comunes y soluciones**

- **Depender de la API real en un test de ViewModel.** Hace el test lento y frágil ante fallas externas; usa un fake.
- **Confiar únicamente en tests de ViewModel sin ningún test de UI.** No cubre la brecha entre estado correcto y renderizado correcto.
- **Usar un test end-to-end con Activity real para verificar lógica unitaria aislada.** Es más lento y menos apropiado que un test de ViewModel para ese propósito; reserva los tests end-to-end para flujos completos.

---
