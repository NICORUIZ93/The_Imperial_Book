# Módulo 14: Compose Master — pruebas, accesibilidad y animación

Una pantalla Compose que "se ve bien" en el emulador puede seguir rota para quien usa TalkBack, o para un cambio futuro que nadie prueba automáticamente. Este módulo cierra el track cubriendo tres disciplinas que no aparecen en el resultado visual: verificar UI con pruebas reales, exponer la interfaz a servicios de accesibilidad, y animar transiciones con una especificación medible en vez de "una animación que se ve fluida".


## Aprende construyendo

### Tema 1: ComposeTestRule ejecuta tu UI sin emulador visible

#### Paso 1 · Objetivo y preparación

Al finalizar podrás escribir una prueba de Compose que monta un composable real y verifica su estado sin depender de captura visual manual, y explicar qué garantiza `ComposeTestRule` que una revisión manual no garantiza.

**Conocimiento previo:** testing con `runTest` y fakes (Módulo 9 de este track); estado y recomposición (Módulo 2).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Una revisión manual en el emulador confirma que la pantalla "se ve bien" hoy, con los datos de hoy; no confirma que seguirá correcta cuando otra persona cambie el composable el mes próximo. `ComposeTestRule` monta el árbol de Compose real y permite verificarlo con aserciones repetibles en CI.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** `ComposeTestRule`, host de prueba, sincronización de recomposición, árbol semántico.

`ComposeTestRule` (o `createComposeRule()`) monta un composable en un host de prueba sin actividad completa, ejecuta recomposiciones hasta estabilizar el árbol antes de cada aserción, y expone ese árbol mediante un modelo semántico navegable por finders. La sincronización automática espera a que Compose termine de recomponer antes de dejar continuar la prueba, evitando falsos negativos por leer el árbol a mitad de una actualización.

**Analogía:** revisar manualmente una pantalla es como inspeccionar un producto una vez en la línea de ensamblaje. `ComposeTestRule` es la estación de control que repite la misma inspección automáticamente en cada unidad que pasa, con el mismo criterio cada vez.

**Diagrama:**

```mermaid
flowchart LR
  A[composable real] --> B[ComposeTestRule.setContent]
  B --> C[espera recomposición estable]
  C --> D[árbol semántico navegable]
  D --> E[finder + assertion]
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía (o continuando en `academia-android` de módulos anteriores, o créala desde una carpeta vacía con `mkdir -p academia-android` si es tu primera vez), crea `app/src/androidTest/kotlin/com/academia/android/ContadorTest.kt`:

```bash
mkdir -p academia-android/app/src/androidTest/kotlin/com/academia/android
cd academia-android
```

Crea `app/src/main/kotlin/com/academia/android/ContadorDePrueba.kt`; este componente es distinto de la comparación remember/rememberSaveable del Módulo 2:

```kotlin
package com.academia.android

import androidx.compose.foundation.layout.Column
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.*

@Composable
fun ContadorDePrueba() {
    var cantidad by remember { mutableStateOf(0) }
    Column {
        Text("Contador: $cantidad")
        Button(onClick = { cantidad++ }) { Text("Incrementar") }
    }
}
```

Ahora crea la prueba instrumentada:

```kotlin
// app/src/androidTest/kotlin/com/academia/android/ContadorTest.kt
package com.academia.android

import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.assertTextEquals
import org.junit.Rule
import org.junit.Test

class ContadorTest {
    @get:Rule
    val compose = createComposeRule()

    @Test
    fun alHacerClicIncrementaElContador() {
        compose.setContent { ContadorDePrueba() }
        compose.onNodeWithText("Contador: 0").assertExists()
        compose.onNodeWithText("Incrementar").performClick()
        compose.onNodeWithText("Contador: 1").assertExists()
    }
}
```

**Explicación línea por línea:** `createComposeRule()` crea el host de prueba sin necesidad de una Activity completa; `compose.setContent { ContadorDePrueba() }` monta el composable real, igual que ocurriría en producción; `onNodeWithText(...)` busca en el árbol semántico ya estabilizado (la regla espera automáticamente la recomposición); `performClick()` dispara el evento real y `assertTextEquals`/`assertExists` verifican el nuevo estado tras la recomposición resultante.

El archivo anterior pertenece a `src/androidTest`: ejecútalo en el dispositivo o emulador conectado. En `app/build.gradle.kts`, conserva el BOM Compose de tu proyecto y añade si faltan:

```kotlin
android { defaultConfig { testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner" } }
dependencies {
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}
```
`libs.androidx.compose.bom` es el alias de la plantilla Empty Activity; usa el alias equivalente de tu catálogo si tiene otro nombre.

```bash
./gradlew :app:connectedDebugAndroidTest -Pandroid.testInstrumentationRunnerArguments.class="com.academia.android.ContadorTest"
```

Para la alternativa JVM, COPIA el test a `app/src/test/kotlin/com/academia/android/ContadorTest.kt` y agrega a esa copia `@RunWith(AndroidJUnit4::class)` con imports `org.junit.runner.RunWith` y `androidx.test.ext.junit.runners.AndroidJUnit4`. Declara `testImplementation` del BOM, `androidx.compose.ui:ui-test-junit4`, `androidx.test.ext:junit:1.3.0` y `org.robolectric:robolectric:4.16.1`; activa `android { testOptions { unitTests.isIncludeAndroidResources = true } }` y conserva `debugImplementation("androidx.compose.ui:ui-test-manifest")`.

```bash
./gradlew :app:testDebugUnitTest --tests "com.academia.android.ContadorTest"
```
`--tests` filtra tareas unitarias JVM; las pruebas instrumentadas se filtran mediante argumentos de AndroidJUnitRunner. No basta con agregar Robolectric a un archivo que sigue únicamente en androidTest.

**Resultado esperado:** ambas aserciones (`Contador: 0` antes del clic y `Contador: 1` después) pasan porque `ComposeTestRule` espera automáticamente a que Compose termine de recomponer antes de dejar continuar cada aserción — el mismo mecanismo de sincronización tanto en el emulador como bajo Robolectric.

**Fallo deliberado:** cambia `compose.onNodeWithText("Contador: 1").assertExists()` por `compose.onNodeWithText("Contador: 2").assertExists()` (un valor que la app nunca alcanza tras un solo click) y vuelve a ejecutar. La prueba FALLA con un error real de `ComposeTestRule`: `Failed to assert the following: (exists) Reason: Expected exactly '1' node but could not find any node that satisfies: (Text = 'Contador: 2')` — diagnostica confirmando que `ComposeTestRule` ya espera automáticamente la estabilidad del árbol antes de fallar: el error no es un falso negativo por sincronización, sino la aserción reportando fielmente que ese estado nunca ocurrió. Revierte el cambio antes de continuar.

#### Paso 5 · Práctica guiada

Agrega una segunda acción encadenada al test real (dos `performClick()` seguidos sin leer el árbol entre ellos) y confirma que la aserción final sigue produciendo el valor correcto acumulado (`Contador: 2`) porque `ComposeTestRule` sincroniza automáticamente antes de la aserción, sin importar cuántas recomposiciones pendientes haya acumulado. **Pista:** no necesitas ningún `waitForIdle()` manual entre los dos `performClick()`; la sincronización ocurre antes de la siguiente aserción.

#### Paso 6 · Práctica independiente

Documenta en una frase qué diferencia hay entre una prueba que usa `Thread.sleep()` para "esperar a que la UI se actualice" y una que usa la sincronización automática de `ComposeTestRule`, relacionándolo con qué pasa si la máquina de CI es más lenta de lo esperado.

#### Paso 7 · Cierre

Ya montas un composable real en un host de prueba, disparas una acción y verificas el árbol semántico solo después de que la sincronización automática garantiza estabilidad. El siguiente tema profundiza en los finders, assertions y actions específicos que navegan y modifican ese árbol. Fuente oficial: [Android Developers — Test your Compose layout](https://developer.android.com/develop/ui/compose/testing).

**Errores comunes:** usar `Thread.sleep()` en vez de la sincronización automática de `ComposeTestRule`, produciendo pruebas lentas y aun así intermitentes; escribir la prueba contra una captura de pantalla en vez del árbol semántico, haciendo la prueba fräil ante cambios de diseño que no afectan el comportamiento.

**Cuándo no usarlo:** para verificar únicamente lógica de negocio sin ninguna interacción de UI (por ejemplo, una función pura de formateo de fecha), una prueba unitaria de JVM sin `ComposeTestRule` es más rápida y suficiente; resérvalo para composables con estado e interacción real.

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Monta la pantalla de ruta con entregas falsas y prueba sus estados vacío, cargando y con datos. El test debe fallar si desaparece la acción para abrir una guía, aunque los datos del ViewModel sigan correctos.

### Tema 2: Finders, assertions y actions navegan el árbol semántico

#### Paso 1 · Objetivo y preparación

Al finalizar podrás elegir el finder correcto para un nodo (por texto, por tag, por rol) y encadenar assertions y actions sin ambigüedad cuando existan varios nodos similares.

**Conocimiento previo:** Tema 1 de este módulo (ComposeTestRule); Semantics básicos (Módulo 10, Tema 3 de este track).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Una pantalla con dos botones de texto similar ("Guardar" en dos formularios distintos) rompe un finder ambiguo con una excepción en tiempo de prueba, no en tiempo de compilación; elegir el finder correcto (por tag único en vez de por texto duplicado) evita ese fallo.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** finder (`onNodeWithText`, `onNodeWithTag`), assertion (`assertExists`, `assertIsDisplayed`), action (`performClick`, `performTextInput`), ambigüedad de nodos.

Un finder localiza cero, uno o varios nodos que cumplen un criterio; si localiza más de uno y se espera exactamente uno, la prueba falla explícitamente en vez de elegir arbitrariamente. `onNodeWithTag` usa un identificador estable puesto por el desarrollador (`Modifier.testTag(...)`), inmune a cambios de texto visible o idioma; `onNodeWithText` es frágil ante localización o copy cambiante. Las assertions verifican estado del nodo encontrado; las actions simulan interacción real del usuario y disparan la recomposición correspondiente.

**Analogía:** buscar un nodo por texto visible es como ubicar una persona por su camiseta del día; buscarlo por `testTag` es ubicarlo por su credencial de identificación, estable sin importar qué ropa lleve.

**Diagrama:**

```mermaid
flowchart LR
  A[finder] -->|cero nodos| B[falla: no encontrado]
  A -->|un nodo| C[assertion/action sobre ESE nodo]
  A -->|varios nodos| D[falla: ambiguo, usa onAllNodes o testTag]
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía (o continuando en `academia-android`, o créala desde una carpeta vacía con `mkdir -p academia-android` si es tu primera vez), crea `app/src/androidTest/kotlin/com/academia/android/FormularioDobleTest.kt` mostrando el finder correcto ante ambigüedad:

```bash
mkdir -p academia-android/app/src/androidTest/kotlin/com/academia/android
cd academia-android
```

```kotlin
// app/src/androidTest/kotlin/com/academia/android/FormularioDobleTest.kt
package com.academia.android

import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.onAllNodesWithText
import androidx.compose.ui.test.performTextInput
import androidx.compose.ui.test.assertTextEquals
import androidx.compose.ui.test.assertCountEquals
import org.junit.Rule
import org.junit.Test

class FormularioDobleTest {
    @get:Rule
    val compose = createComposeRule()

    @Test
    fun `dos campos comparten placeholder, buscar por texto es ambiguo`() {
        compose.setContent { PantallaFormularioDoble() }
        // ambos campos muestran el placeholder "Guardar": onAllNodesWithText confirma la ambigüedad
        compose.onAllNodesWithText("Guardar").assertCountEquals(2)
    }

    @Test
    fun escribeEnElCampoDeTituloDeLaTareaNoEnElDeNota() {
        compose.setContent { PantallaFormularioDoble() }
        // dos campos comparten el placeholder "Guardar"; testTag es la única forma no ambigua
        compose.onNodeWithTag("campo_titulo_tarea").performTextInput("Comprar leche")
        compose.onNodeWithTag("campo_titulo_tarea").assertTextEquals("Comprar leche")
    }
}
```

```bash
# Gradle ejecuta el test instrumentado de Compose que usa testTag
./gradlew :app:connectedDebugAndroidTest -Pandroid.testInstrumentationRunnerArguments.class="com.academia.android.FormularioDobleTest"
```

**Explicación línea por línea:** `onAllNodesWithText("Guardar").assertCountEquals(2)` confirma explícitamente que el criterio de texto es ambiguo, en vez de asumirlo; `onNodeWithTag("campo_titulo_tarea")` localiza exactamente un nodo por su identificador estable, sin depender del texto visible que dos campos similares comparten; `performTextInput(...)` simula la escritura real del usuario, y `assertTextEquals(...)` confirma que ese nodo específico —no otro parecido— refleja el nuevo valor.

**Resultado esperado:** ambos tests pasan: `onAllNodesWithText("Guardar")` confirma que existen exactamente 2 nodos con ese texto (la ambigüedad real), y `onNodeWithTag("campo_titulo_tarea")` localiza y modifica exactamente el nodo correcto, sin riesgo de escribir en el campo equivocado.

**Fallo deliberado:** cambia `compose.onNodeWithTag("campo_titulo_tarea")` por `compose.onNodeWithText("Guardar")` en el segundo test, intentando localizar el campo por su placeholder compartido en vez de por su tag único. La prueba FALLA con el error real de Compose: `Failed to assert the following: (1 matching node) Reason: Expected exactly '1' node but found '2' nodes that satisfy: (Text = 'Guardar')` — diagnostica confirmando por qué Compose real prefiere fallar explícitamente ante ambigüedad en vez de adivinar cuál de los dos nodos usar: una prueba que "adivinara" silenciosamente el nodo equivocado sería peor que una que falla con un mensaje claro. Revierte el cambio antes de continuar.

#### Paso 5 · Práctica guiada

Agrega un tercer campo a `PantallaFormularioDoble` con el mismo placeholder "Guardar" y actualiza `assertCountEquals(2)` a `assertCountEquals(3)` en el primer test, confirmando que `onAllNodesWithText` refleja el conteo real de coincidencias mientras `onNodeWithTag` (con un tag propio para el tercer campo) sigue localizando exactamente uno. **Pista:** el conteo esperado en `assertCountEquals` debe reflejar el número real de nodos con ese texto.

#### Paso 6 · Práctica independiente

Documenta en una frase por qué `onAllNodesWithTag(...)` (que retorna una lista, no un único nodo) es la elección correcta cuando se espera intencionalmente más de un nodo, en vez de forzar `onNodeWithTag` a tolerar ambigüedad.

#### Paso 7 · Cierre

Ya distingues cuándo un finder por texto es frágil ante ambigüedad y cuándo un `testTag` único la elimina, y compruebas que Compose prefiere fallar explícitamente antes que adivinar. El siguiente tema aborda cómo el árbol semántico que estos finders navegan también es la base de la accesibilidad. Fuente oficial: [Android Developers — Finders, assertions, and actions](https://developer.android.com/develop/ui/compose/testing/apis).

**Errores comunes:** depender de texto visible traducible como criterio de búsqueda en pruebas, rompiéndolas al cambiar idioma; usar `onNodeWithTag` cuando en realidad se espera más de un nodo, forzando ambigüedad en vez de usar `onAllNodesWithTag`.

**Cuándo no usarlo:** para un nodo verdaderamente único en toda la pantalla sin riesgo de colisión futura (un único botón de "Enviar" en un formulario simple), `onNodeWithText` es aceptable y más legible; reserva `testTag` para nodos con riesgo real de ambigüedad.

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Localiza una entrega por su etiqueta semántica, abre el detalle y pulsa confirmar. Comprueba el resultado visible y evita identificar nodos por su posición, que cambia al ordenar la ruta.

### Tema 3: Semantics y clearAndSetSemantics definen qué percibe la accesibilidad

#### Paso 1 · Objetivo y preparación

Al finalizar podrás explicar cómo Compose fusiona (`mergeDescendants`) la semántica de un grupo de nodos hijos, y cuándo `clearAndSetSemantics` debe reemplazar esa fusión con una descripción manual coherente.

**Conocimiento previo:** `contentDescription` (Módulo 10, Tema 3 de este track); Tema 2 de este módulo (árbol semántico).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Un servicio de accesibilidad como TalkBack no ve píxeles: navega el árbol semántico. Si una tarjeta compuesta de ícono, título y fecha no fusiona su semántica correctamente, TalkBack anuncia tres elementos sueltos ("ícono", "Comprar leche", "hoy") en vez de un enunciado coherente ("Tarea: Comprar leche, vence hoy").

#### Paso 3 · Teoría con analogía

**Conceptos clave:** nodo semántico, `mergeDescendants`, `clearAndSetSemantics`, enunciado coherente.

Cada composable puede aportar propiedades semánticas (texto, rol, estado) a un nodo; un contenedor con `mergeDescendants = true` combina las de sus hijos en un solo nodo navegable, útil para una tarjeta que debe anunciarse como una unidad. `clearAndSetSemantics` descarta la fusión automática y define manualmente la descripción completa, necesario cuando la fusión automática produce un orden o redundancia que no tiene sentido leído en voz alta.

**Analogía:** la fusión automática es como leer en voz alta cada etiqueta de una caja por separado; `clearAndSetSemantics` es escribir una sola frase que resume el contenido de la caja de forma que tenga sentido escuchada de corrido.

**Diagrama:**

```mermaid
flowchart LR
  A[ícono + título + fecha] -->|mergeDescendants automático| B["ícono, Comprar leche, hoy" -- 3 anuncios sueltos]
  A -->|clearAndSetSemantics manual| C["Tarea: Comprar leche, vence hoy" -- 1 anuncio coherente]
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía (o continuando en `academia-android`, o créala desde una carpeta vacía con `mkdir -p academia-android` si es tu primera vez), crea `app/src/main/kotlin/com/academia/android/TarjetaTareaAccesible.kt` comparando ambos enfoques:

```bash
mkdir -p academia-android/app/src/main/kotlin/com/academia/android
cd academia-android
```

```kotlin
// app/src/main/kotlin/com/academia/android/TarjetaTareaAccesible.kt
package com.academia.android

import androidx.compose.foundation.layout.Row
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics

// SIN fusión manual: cada hijo anuncia su propio contentDescription por separado
@Composable
fun TarjetaTareaSinFusion(titulo: String, fecha: String) {
    Row(modifier = Modifier.testTag("tarjeta_tarea_sin_fusion")) {
        Icon(imageVector = IconoTarea, contentDescription = "ícono de tarea")
        Text(titulo, modifier = Modifier.semantics { contentDescription = titulo })
        Text(fecha, modifier = Modifier.semantics { contentDescription = fecha })
    }
}

// CON clearAndSetSemantics: un único enunciado coherente para todo el grupo
@Composable
fun TarjetaTareaAccesible(titulo: String, fecha: String) {
    Row(
        modifier = Modifier
            .testTag("tarjeta_tarea")
            .clearAndSetSemantics {
                contentDescription = "Tarea: $titulo, vence $fecha"
            }
    ) {
        Icon(imageVector = IconoTarea, contentDescription = null) // ya cubierto por el padre
        Text(titulo)
        Text(fecha)
    }
}
```

```bash
./gradlew :app:compileDebugKotlin
```

**Explicación línea por línea:** `TarjetaTareaSinFusion` deja que cada hijo (`Icon`, dos `Text`) anuncie su propio `contentDescription` por separado, sin fusión manual; `TarjetaTareaAccesible` usa `Modifier.clearAndSetSemantics { contentDescription = ... }` en el `Row` para descartar la semántica de los hijos y establecer un único enunciado completo — el `Icon` interno recibe `contentDescription = null` porque su información ya está incluida en el enunciado del padre.

Confirma con un test real, usando `ComposeTestRule`, que ambas variantes exponen árboles semánticos distintos:

```kotlin
// app/src/androidTest/kotlin/com/academia/android/TarjetaTareaAccesibleTest.kt
package com.academia.android

import androidx.compose.ui.test.assertContentDescriptionEquals
import androidx.compose.ui.test.assertCountEquals
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onAllNodesWithContentDescription
import androidx.compose.ui.test.onNodeWithContentDescription
import androidx.compose.ui.test.onNodeWithTag
import org.junit.Rule
import org.junit.Test

class TarjetaTareaAccesibleTest {
    @get:Rule
    val compose = createComposeRule()

    @Test
    fun `sin fusion cada hijo anuncia su propio fragmento por separado`() {
        compose.setContent { TarjetaTareaSinFusion(titulo = "Comprar leche", fecha = "hoy") }

        compose.onNodeWithContentDescription("Comprar leche").assertExists()
        compose.onNodeWithContentDescription("hoy").assertExists()
        // el enunciado coherente combinado NO existe como un único nodo
        compose.onAllNodesWithContentDescription("Tarea: Comprar leche, vence hoy").assertCountEquals(0)
    }

    @Test
    fun `con clearAndSetSemantics expone un unico enunciado coherente`() {
        compose.setContent { TarjetaTareaAccesible(titulo = "Comprar leche", fecha = "hoy") }

        compose.onNodeWithTag("tarjeta_tarea").assertContentDescriptionEquals("Tarea: Comprar leche, vence hoy")
    }
}
```

```bash
# Gradle ejecuta ambos tests reales contra el árbol semántico de Compose
./gradlew :app:connectedDebugAndroidTest -Pandroid.testInstrumentationRunnerArguments.class="com.academia.android.TarjetaTareaAccesibleTest"
```

**Resultado esperado:** ambos tests pasan. `TarjetaTareaSinFusion` expone fragmentos sueltos navegables por separado (`"Comprar leche"`, `"hoy"`) sin que exista un nodo único con el enunciado combinado; `TarjetaTareaAccesible` expone exactamente un nodo (`tarjeta_tarea`) cuyo `contentDescription` es el enunciado completo `"Tarea: Comprar leche, vence hoy"` — la comparación explícita confirma por qué `clearAndSetSemantics` es necesario para que TalkBack anuncie la tarjeta como una unidad.

**Fallo deliberado:** en `TarjetaTareaAccesible`, elimina `contentDescription = null` del `Icon` interno pero conserva el `clearAndSetSemantics` en el `Row` padre, y ejecuta de nuevo `TarjetaTareaAccesibleTest`. El test sigue pasando exactamente igual (el `assertContentDescriptionEquals` no cambia) — diagnostica confirmando por la propia documentación oficial que `clearAndSetSemantics` descarta TODA la semántica de los descendientes, no solo la fusiona: cualquier `contentDescription` que el `Icon` interno pudiera tener queda completamente ignorado, por lo que un ícono con información adicional real (no decorativo) perdería esa información silenciosamente si no se incluye manualmente en la descripción combinada del padre. Revierte el cambio antes de continuar.

#### Paso 5 · Práctica guiada

Agrega un cuarto hijo a `TarjetaTareaSinFusion` con `Modifier.semantics { contentDescription = "" }` (cadena vacía) y confirma con `onNodeWithContentDescription("")` si Compose lo trata como un nodo navegable real o lo ignora. **Pista:** una cadena vacía sigue siendo un `contentDescription` técnicamente presente; compáralo con el caso de `contentDescription = null` del Tema 4.

#### Paso 6 · Práctica independiente

Documenta en una frase por qué usar `clearAndSetSemantics` en un contenedor que NO necesita anunciarse como unidad (por ejemplo, una lista completa de 50 tareas) sería un error, relacionándolo con qué perdería un usuario de TalkBack si toda la lista se anunciara como un solo bloque de texto.

#### Paso 7 · Cierre

Ya distingues cuándo la fusión automática de semántica es suficiente y cuándo `clearAndSetSemantics` debe reemplazarla con un enunciado manual coherente, confirmando la diferencia con un modelo ejecutado del árbol semántico. El siguiente tema aborda cómo `AccessibilityService` y TalkBack consumen exactamente este árbol en un dispositivo real. Fuente oficial: [Android Developers — Merge semantics in Compose](https://developer.android.com/develop/ui/compose/accessibility/semantics).

**Errores comunes:** usar `clearAndSetSemantics` en un contenedor grande donde la fusión automática ya era coherente, perdiendo granularidad de navegación para el usuario de TalkBack; olvidar `contentDescription = null` en un ícono verdaderamente decorativo dentro de un grupo ya descrito, duplicando información en el anuncio.

**Cuándo no usarlo:** para un contenedor cuyos hijos ya tienen sentido navegados individualmente (una lista donde cada tarea debe explorarse por separado), fusionar o limpiar la semántica del contenedor completo eliminaría esa navegabilidad granular; resérvalo para grupos que representan una sola unidad de sentido.

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Agrupa la tarjeta de entrega en una descripción útil con guía y estado. Verifica que su acción sigue accesible después de usar clearAndSetSemantics; no ocultes el botón de confirmación al simplificar el árbol.

### Tema 4: AccessibilityService y TalkBack consumen el árbol semántico en producción

#### Paso 1 · Objetivo y preparación

Al finalizar podrás auditar una pantalla completa detectando qué nodos carecen de descripción accesible, y explicar qué anunciaría TalkBack recorriendo esa pantalla en el orden real del árbol.

**Conocimiento previo:** Tema 3 de este módulo (Semantics); auditoría de `contentDescription` (Módulo 10, Tema 3 de este track).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Una pantalla puede pasar todas las pruebas funcionales y seguir siendo inutilizable para una persona que depende de TalkBack, si un ícono interactivo carece de descripción o el orden de navegación no sigue el flujo visual lógico.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** `AccessibilityService`, TalkBack, orden de navegación, foco de accesibilidad.

`AccessibilityService` es la API que TalkBack usa para recibir eventos del árbol semántico y anunciarlos mediante voz; no interpreta píxeles, solo la información semántica expuesta. El orden en que TalkBack navega sigue por defecto el orden del árbol de composición, que puede no coincidir con el orden visual si el layout usa superposición o reordenamiento visual sin ajustar la semántica. Un nodo interactivo (botón, ícono clicable) sin `contentDescription` se anuncia como "botón sin etiqueta", inutilizable para quien depende de voz.

**Analogía:** TalkBack es un guía que solo puede describir lo que está etiquetado; un ícono sin descripción es una puerta sin cartel — el guía sabe que existe pero no puede decir para qué sirve.

**Diagrama:**

```
┌── árbol semántico completo ──┐
│  nodo 1: "Volver" (botón)      │
│  nodo 2: sin contentDescription│ ◀── TalkBack anuncia "botón sin etiqueta"
│  nodo 3: "Comprar leche"        │
└─────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía (o continuando en `academia-android`, o créala desde una carpeta vacía con `mkdir -p academia-android` si es tu primera vez), crea `app/src/main/kotlin/com/academia/android/AuditoriaAccesibilidad.kt` que recorre una representación del árbol y detecta nodos interactivos sin descripción:

```bash
mkdir -p academia-android/app/src/main/kotlin/com/academia/android
cd academia-android
```

```kotlin
// app/src/main/kotlin/com/academia/android/AuditoriaAccesibilidad.kt
package com.academia.android

data class NodoAuditado(val id: String, val esInteractivo: Boolean, val contentDescription: String?)

/** Detecta nodos interactivos sin contentDescription, tal como los anunciaría TalkBack. */
fun auditarArbol(nodos: List<NodoAuditado>): List<String> =
    nodos.filter { it.esInteractivo && it.contentDescription.isNullOrEmpty() }.map { it.id }
```

```bash
./gradlew :app:compileDebugKotlin
```

**Explicación línea por línea:** `auditarArbol` recorre cada nodo de la representación de la pantalla y marca como problema solo los nodos donde `esInteractivo` es verdadero pero `contentDescription` está ausente o vacío (`isNullOrEmpty()`); un nodo no interactivo sin descripción no se marca, porque TalkBack simplemente lee su texto visible y no necesita descripción adicional.

Confirma con un test real de kotlin.test (JVM puro, sin Compose ni emulador — es lógica pura sobre datos) que la auditoría detecta exactamente los nodos esperados:

```kotlin
// app/src/test/kotlin/com/academia/android/AuditoriaAccesibilidadTest.kt
package com.academia.android

import kotlin.test.Test
import kotlin.test.assertEquals

class AuditoriaAccesibilidadTest {

    private val pantallaResumen = listOf(
        NodoAuditado(id = "boton_volver", esInteractivo = true, contentDescription = "Volver"),
        NodoAuditado(id = "icono_editar", esInteractivo = true, contentDescription = null),
        NodoAuditado(id = "texto_tarea", esInteractivo = false, contentDescription = null),
        NodoAuditado(id = "icono_mas", esInteractivo = true, contentDescription = null),
    )

    @Test
    fun `detecta solo nodos interactivos sin descripcion`() {
        val problemas = auditarArbol(pantallaResumen)

        assertEquals(listOf("icono_editar", "icono_mas"), problemas)
    }
}
```

```bash
# Gradle ejecuta el test unitario real sobre la JVM
./gradlew :app:testDebugUnitTest --tests "com.academia.android.AuditoriaAccesibilidadTest"
```

**Resultado esperado:** el test pasa: `auditarArbol` devuelve exactamente `["icono_editar", "icono_mas"]`, confirmando que detecta los dos íconos clicables sin etiqueta, y excluye correctamente tanto el botón ya descrito (`boton_volver`) como el texto no interactivo (`texto_tarea`) que no necesita descripción.

**Fallo deliberado:** cambia la condición de `auditarArbol` a `nodos.filter { it.contentDescription.isNullOrEmpty() }.map { it.id }` (sin el filtro `it.esInteractivo`), y vuelve a ejecutar el test. El `assertEquals` FALLA porque ahora la lista incluye también `"texto_tarea"`, aunque un texto no interactivo sin `contentDescription` no representa ningún defecto real para TalkBack (TalkBack lee directamente el texto visible de un nodo no interactivo) — diagnostica confirmando que auditar accesibilidad sin distinguir interactividad genera falsos positivos que entierran los problemas reales bajo ruido, exactamente el motivo por el que el filtro `esInteractivo` es necesario. Revierte el cambio antes de continuar.

#### Paso 5 · Práctica guiada

Agrega un quinto `NodoAuditado` con `esInteractivo = true` y `contentDescription = ""` (cadena vacía, no `null`) al test, y confirma si `auditarArbol` lo detecta como problema. **Pista:** revisa qué hace `isNullOrEmpty()` con una cadena vacía, y decide si debería tratarse igual que ausencia de descripción.

#### Paso 6 · Práctica independiente

Documenta en una frase por qué el orden en que TalkBack navega una pantalla puede no coincidir con el orden visual si el layout usa superposición (por ejemplo, un elemento posicionado absolutamente sobre otros), relacionándolo con qué necesitarías ajustar en la semántica para corregirlo.

#### Paso 7 · Cierre

Ya auditas una pantalla completa detectando nodos interactivos sin descripción accesible, distinguiéndolos de nodos no interactivos que no la necesitan, y confirmas el resultado con una ejecución real del script. El siguiente tema aborda cómo animar transiciones de estado sin comprometer lo que TalkBack necesita anunciar. Fuente oficial: [Android Developers — Test your app's accessibility](https://developer.android.com/develop/ui/compose/accessibility/testing).

**Errores comunes:** auditar accesibilidad sin distinguir interactividad, generando falsos positivos sobre texto decorativo; asumir que un ícono con un `contentDescription` técnicamente presente pero genérico ("botón", "ícono") es suficiente, cuando no describe la acción real.

**Cuándo no usarlo:** para un prototipo interno de un solo desarrollador sin usuarios reales todavía, una auditoría exhaustiva de accesibilidad es prematura; sigue siendo buena práctica declarar `contentDescription` desde el principio, pero la auditoría automatizada formal se justifica antes de exponer la app a usuarios reales.

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Recorre con TalkBack la entrega completa, incluyendo un error de conexión. Registra qué anuncia al actualizar el estado y corrige controles sin nombre o cambios que solo se distingan por color.

### Tema 5: Animaciones de estado y visibilidad usan una especificación medible

#### Paso 1 · Objetivo y preparación

Al finalizar podrás calcular el valor interpolado de una animación en un instante dado usando una especificación de easing explícita, en vez de describir la animación como "algo que se ve fluida".

**Conocimiento previo:** estado y recomposición (Módulo 2 de este track); Flow (Módulo 4).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** "Se ve fluida" no es verificable ni reproducible; una especificación de animación (duración, curva de easing) sí lo es — permite calcular exactamente qué valor debería tener la animación en cualquier instante, y por lo tanto probarla.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** `animateFloatAsState`, `AnimatedVisibility`, easing, interpolación.

`animateFloatAsState` anima un valor de estado entre un valor inicial y uno final a lo largo de una duración, aplicando una función de easing que determina la velocidad relativa en cada instante (lineal, acelerando, desacelerando). `AnimatedVisibility` anima la aparición/desaparición de un composable completo combinando una animación de tamaño/posición con una de opacidad. La curva de easing convierte una fracción de tiempo transcurrido (0 a 1) en una fracción de progreso (0 a 1) que no necesariamente es la misma —un easing "ease-out" progresa más rápido al inicio y se desacelera al final.

**Analogía:** una animación sin especificación es una promesa de "llegará suave"; una especificación de easing es la fórmula exacta de velocidad en cada instante, verificable calculando el valor esperado en cualquier punto del recorrido.

**Diagrama:**

```mermaid
flowchart LR
  A[valor inicial] --> B[easing: fraccion_tiempo -> fraccion_progreso]
  B --> C[valor interpolado en instante t]
  C --> D[valor final al completarse duracion]
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía (o continuando en `academia-android`, o créala desde una carpeta vacía con `mkdir -p academia-android` si es tu primera vez), crea `app/src/main/kotlin/com/academia/android/AnimacionTareaCompletada.kt`:

```bash
mkdir -p academia-android/app/src/main/kotlin/com/academia/android
cd academia-android
```

```kotlin
// app/src/main/kotlin/com/academia/android/AnimacionTareaCompletada.kt
package com.academia.android

import androidx.compose.animation.core.LinearOutSlowInEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.runtime.Composable

@Composable
fun opacidadTareaCompletada(completada: Boolean): Float {
    val opacidad by animateFloatAsState(
        targetValue = if (completada) 0.4f else 1.0f,
        animationSpec = tween(durationMillis = 300, easing = LinearOutSlowInEasing),
        label = "opacidadTarea",
    )
    return opacidad
}
```

```bash
./gradlew :app:compileDebugKotlin
```

**Explicación línea por línea:** `animateFloatAsState` observa el cambio de `completada` y anima automáticamente `opacidad` desde su valor actual hacia `targetValue`; `tween(durationMillis = 300, easing = LinearOutSlowInEasing)` especifica exactamente cuánto dura la transición y qué curva de velocidad sigue, información suficiente para calcular el valor esperado en cualquier instante intermedio.

`LinearOutSlowInEasing` es una implementación REAL de `Easing` (interfaz con una única función `transform(fraction: Float): Float`) que vive en `androidx.compose.animation:animation-core`, una dependencia JVM pura sin necesidad de Android ni emulador. Confirma con un test real, llamando directamente a esa función real (no una aproximación propia), el mismo cálculo de interpolación en instantes específicos:

```kotlin
// app/src/test/kotlin/com/academia/android/AnimacionTareaCompletadaTest.kt
package com.academia.android

import androidx.compose.animation.core.LinearOutSlowInEasing
import kotlin.test.Test
import kotlin.test.assertTrue

class AnimacionTareaCompletadaTest {

    private fun valorInterpolado(inicial: Float, final: Float, duracionMs: Int, tiempoTranscurridoMs: Int): Float {
        val fraccionTiempo = (tiempoTranscurridoMs.toFloat() / duracionMs).coerceAtMost(1f)
        val fraccionProgreso = LinearOutSlowInEasing.transform(fraccionTiempo)
        return inicial + (final - inicial) * fraccionProgreso
    }

    @Test
    fun `LinearOutSlowInEasing progresa mas de la mitad antes de la mitad del tiempo`() {
        val progresoAMitadTiempo = LinearOutSlowInEasing.transform(0.5f)

        assertTrue(progresoAMitadTiempo > 0.5f, "ease-out debe progresar más de la mitad antes de la mitad del tiempo")
    }

    @Test
    fun `a mitad de tiempo la opacidad esta mas cerca del final que con interpolacion lineal`() {
        val valorConEasingReal = valorInterpolado(inicial = 1.0f, final = 0.4f, duracionMs = 300, tiempoTranscurridoMs = 150)
        val valorLineal = 1.0f + (0.4f - 1.0f) * 0.5f // 0.7, el punto medio lineal sin easing

        assertTrue(valorConEasingReal < valorLineal, "con LinearOutSlowInEasing, a mitad de tiempo ya debería estar más cerca de 0.4 que la interpolación lineal")
    }
}
```

```bash
# Gradle ejecuta el test unitario real usando la función Easing real de Compose (sin emulador)
./gradlew :app:testDebugUnitTest --tests "com.academia.android.AnimacionTareaCompletadaTest"
```

**Resultado esperado:** ambos tests pasan, usando la función `transform` REAL de `LinearOutSlowInEasing` (la misma que Compose ejecuta internamente en producción, no una aproximación): el progreso a mitad de tiempo es mayor a `0.5`, y el valor de opacidad interpolado en `t=150ms` (`~0.61`) ya está más cerca del valor final `0.4` que el punto medio lineal `0.7` — confirmando numéricamente que la curva avanza más rápido al principio, exactamente la especificación declarada en `LinearOutSlowInEasing`.

**Fallo deliberado:** en `valorInterpolado`, reemplaza `LinearOutSlowInEasing.transform(fraccionTiempo)` por `fraccionTiempo` directamente (interpolación lineal simple, sin easing), y vuelve a ejecutar el segundo test. El `assertTrue` FALLA porque una interpolación lineal da exactamente `0.7` en la mitad del tiempo, igual al punto de comparación, no menor — diagnostica confirmando que "animar un valor" y "animar un valor con una curva de easing específica" son comportamientos numéricamente distintos y verificables contra la implementación real de Compose, no una cuestión de percepción subjetiva. Revierte el cambio antes de continuar.

#### Paso 5 · Práctica guiada

Agrega un tercer test que use `FastOutLinearInEasing` (la curva ease-in real de Compose: progresa lento al inicio, rápido al final) en vez de `LinearOutSlowInEasing`, y confirma que `FastOutLinearInEasing.transform(0.5f)` es MENOR a `0.5f`, lo opuesto al resultado de ease-out. **Pista:** cambia solo qué `Easing` le pasas a `valorInterpolado`; la función no necesita modificarse.

#### Paso 6 · Práctica independiente

Documenta en una frase por qué animar la opacidad de una tarea completada con una duración de 3000ms (3 segundos) sería una mala elección de UX en una lista donde el usuario completa tareas rápidamente en sucesión, relacionándolo con qué percibiría el usuario si la animación anterior no ha terminado cuando empieza la siguiente.

#### Paso 7 · Cierre

Ya calculas el valor esperado de una animación en cualquier instante usando la función `Easing` real de Compose, y confirmas numéricamente la diferencia entre una curva ease-out y una interpolación lineal. El siguiente tema extiende esto a transiciones de contenido completo con `AnimatedContent` y especificaciones de resorte. Fuente oficial: [Android Developers — Animate value changes](https://developer.android.com/develop/ui/compose/animation/value-based).

**Errores comunes:** describir una animación como "que se vea fluida" sin especificar duración ni easing, haciendo imposible verificarla o reproducirla; encadenar animaciones de larga duración sin considerar que el usuario puede disparar el siguiente cambio de estado antes de que la anterior termine.

**Cuándo no usarlo:** para un cambio de estado que debe reflejarse instantáneamente por razones de accesibilidad o claridad crítica (por ejemplo, una alerta de error urgente), animar la transición introduce una demora perceptible que puede ser contraproducente; resérvalo para cambios donde la continuidad visual ayuda a la comprensión.

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Anima el cambio de pendiente a entregado sin bloquear el botón de regreso. Prueba con animaciones reducidas o desactivadas y confirma que el estado final sigue siendo comprensible sin movimiento.

### Tema 6: AnimatedContent y AnimationSpec especifican transiciones completas

#### Paso 1 · Objetivo y preparación

Al finalizar podrás elegir entre un `tween` (duración fija) y un `spring` (basado en física) según el comportamiento deseado, y simular numéricamente cómo converge un resorte hacia su valor final.

**Conocimiento previo:** Tema 5 de este módulo (animaciones de valor); navegación (Módulo 3 de este track).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Cambiar de una pantalla de lista vacía a una con contenido, o de un estado "cargando" a "cargado", requiere animar la salida de un contenido y la entrada de otro coordinadamente; `AnimatedContent` gestiona esa transición, pero la especificación (`tween` vs `spring`) determina si se siente mecánica o natural.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** `AnimatedContent`, `AnimationSpec`, `tween`, `spring`, amortiguación (damping).

`AnimatedContent` anima la transición entre dos versiones de contenido (por ejemplo, "0 tareas" y "3 tareas") especificando cómo entra el nuevo contenido y cómo sale el anterior. Un `tween` interpola linealmente (o con easing) durante una duración fija, predecible y determinista. Un `spring` simula un sistema físico masa-resorte-amortiguador: no tiene duración fija, converge según su rigidez (`stiffness`) y amortiguación (`dampingRatio`) — un `dampingRatio` bajo produce rebote visible antes de asentarse; uno alto converge sin rebote.

**Analogía:** `tween` es un tren que llega en un horario fijo sin importar la distancia; `spring` es una pelota lanzada que rebota según su elasticidad hasta detenerse, sin un tiempo de llegada predeterminado.

**Diagrama:**

```mermaid
flowchart LR
  A[tween: duracion fija] --> B[llega exactamente a los N ms]
  C[spring: fisica simulada] --> D[converge segun stiffness y damping, sin duracion fija]
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía (o continuando en `academia-android`, o créala desde una carpeta vacía con `mkdir -p academia-android` si es tu primera vez), crea `app/src/main/kotlin/com/academia/android/TransicionListaTareas.kt`:

```bash
mkdir -p academia-android/app/src/main/kotlin/com/academia/android
cd academia-android
```

```kotlin
// app/src/main/kotlin/com/academia/android/TransicionListaTareas.kt
package com.academia.android

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.runtime.Composable

@Composable
fun TransicionContadorTareas(cantidad: Int) {
    AnimatedContent(
        targetState = cantidad,
        transitionSpec = {
            fadeIn() togetherWith fadeOut()
        },
        label = "contadorTareas",
    ) { valorObjetivo ->
        // el tamaño del texto anima con un spring, no con duracion fija
        TextoConSpring(valorObjetivo, spring(dampingRatio = Spring.DampingRatioMediumBouncy))
    }
}
```

```bash
./gradlew :app:compileDebugKotlin
```

**Explicación línea por línea:** `AnimatedContent(targetState = cantidad, ...)` reconstruye su contenido cada vez que `cantidad` cambia, animando la salida del valor anterior y la entrada del nuevo según `transitionSpec`; `spring(dampingRatio = Spring.DampingRatioMediumBouncy)` especifica que la animación de tamaño del texto se comporte como un resorte con rebote moderado, en vez de una duración fija.

`spring(dampingRatio, stiffness)` de Compose integra internamente la MISMA ecuación de movimiento de un oscilador armónico amortiguado que rige cualquier resorte físico real. Escríbela en Kotlin puro (sin ninguna dependencia de Compose ni Android, solo la fórmula física) y confírmala con un test real:

```kotlin
// app/src/main/kotlin/com/academia/android/SimulacionSpring.kt
package com.academia.android

import kotlin.math.sqrt

/** Integra la ecuación de movimiento de un oscilador armónico amortiguado (método de Euler). */
fun simularSpring(
    valorInicial: Double,
    valorFinal: Double,
    stiffness: Double,
    dampingRatio: Double,
    pasos: Int = 20,
    dt: Double = 0.016,
): List<Double> {
    var posicion = valorInicial
    var velocidad = 0.0
    val masa = 1.0
    val dampingCoef = dampingRatio * 2 * sqrt(stiffness * masa)
    val trayectoria = mutableListOf(posicion)
    repeat(pasos) {
        val desplazamiento = posicion - valorFinal
        val fuerza = -stiffness * desplazamiento - dampingCoef * velocidad
        val aceleracion = fuerza / masa
        velocidad += aceleracion * dt
        posicion += velocidad * dt
        trayectoria.add(posicion)
    }
    return trayectoria
}
```

```kotlin
// app/src/test/kotlin/com/academia/android/SimulacionSpringTest.kt
package com.academia.android

import kotlin.test.Test
import kotlin.test.assertTrue

class SimulacionSpringTest {

    @Test
    fun `damping bajo rebota mas alla del objetivo antes de asentarse`() {
        val trayectoria = simularSpring(valorInicial = 0.0, valorFinal = 10.0, stiffness = 200.0, dampingRatio = 0.3)

        assertTrue(trayectoria.max() > 10.0, "con damping bajo el resorte debe sobrepasar el objetivo (rebote)")
    }

    @Test
    fun `damping alto converge sin sobrepasar significativamente el objetivo`() {
        val trayectoria = simularSpring(valorInicial = 0.0, valorFinal = 10.0, stiffness = 200.0, dampingRatio = 1.2)

        assertTrue(trayectoria.max() <= 10.05, "con damping alto el resorte no debe sobrepasar significativamente el objetivo")
    }
}
```

```bash
# Gradle ejecuta la simulación física real como un test unitario JVM, sin emulador
./gradlew :app:testDebugUnitTest --tests "com.academia.android.SimulacionSpringTest"
```

**Resultado esperado:** ambos tests pasan: con `dampingRatio=0.3` el valor máximo alcanzado supera `10.0` (el resorte "se pasa" del objetivo y regresa, un rebote real), mientras que con `dampingRatio=1.2` el valor máximo se mantiene igual o por debajo de `10.0`, confirmando numéricamente la diferencia de comportamiento entre un spring subamortiguado y uno sobreamortiguado — la misma ecuación que `spring(dampingRatio = ...)` de Compose integra internamente.

**Fallo deliberado:** agrega un tercer test que llame `simularSpring(0.0, 10.0, stiffness = 200.0, dampingRatio = 0.0)` (sin amortiguación alguna) y confirma con `assertTrue` que el valor en el ÚLTIMO paso de la trayectoria sigue alejado del objetivo por más de `1.0` (`kotlin.math.abs(trayectoria.last() - 10.0) > 1.0`). El test pasa, pero por la razón contraria: la trayectoria oscila indefinidamente sin converger al valor final dentro de los pasos simulados — diagnostica confirmando por qué `Spring.DampingRatioNoBouncy` (valor típicamente cercano a 1) es la elección segura por defecto en Compose: un resorte sin amortiguación real nunca se asienta, produciendo una animación de UI que oscilaría visiblemente para siempre en vez de estabilizarse.

#### Paso 5 · Práctica guiada

Agrega una función Kotlin que calcule con cuántos pasos la trayectoria de `simularSpring(dampingRatio = 1.2)` queda dentro de un margen de `0.1` del valor objetivo (`10.0`) de forma sostenida, aproximando el "tiempo de asentamiento" del resorte, y verifica el resultado con un test real. **Pista:** recorre la trayectoria con `indexOfFirst` e identifica el primer índice a partir del cual todos los valores restantes están dentro del margen.

#### Paso 6 · Práctica independiente

Documenta en una frase por qué un `tween` de duración fija sería preferible sobre un `spring` para una animación de progreso de una barra de carga con un tiempo total conocido (por ejemplo, un contador regresivo de 5 segundos exactos), relacionándolo con qué garantía de tiempo pierde un `spring` que un `tween` sí ofrece.

#### Paso 7 · Cierre

Ya distingues cuándo usar un `tween` de duración fija frente a un `spring` físico, y confirmas numéricamente cómo la amortiguación determina si un resorte rebota o converge suavemente. Esto cierra el módulo de Compose Master y el track completo de Android: pruebas verificables, accesibilidad auditada y animaciones especificadas en vez de descritas subjetivamente. El siguiente track del programa, Kotlin Multiplatform, aplica estos mismos fundamentos de estado y pruebas fuera de la capa exclusivamente Android. Fuente oficial: [Android Developers — AnimatedContent](https://developer.android.com/develop/ui/compose/animation/composables-modifiers).

**Errores comunes:** usar `spring` cuando se necesita una duración exacta y predecible (por ejemplo, sincronizada con un evento externo), sin considerar que un spring no garantiza tiempo de llegada; dejar el `dampingRatio` por defecto sin entender que valores bajos producen rebote, sorprendiendo en contextos donde el rebote visual no es deseado.

**Cuándo no usarlo:** para una transición que debe completarse en un tiempo exacto y predecible por razones de sincronización con otro evento (una animación coordinada con un sonido de duración fija), `spring` es inadecuado por no tener duración determinista; usa `tween` en ese caso.

---

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Modela carga, éxito y error del detalle como destinos de AnimatedContent. Provoca respuestas sucesivas y verifica que ninguna transición deja visible el botón de una entrega anterior.

## Laboratorio práctico

**Objetivo del laboratorio:** construir una suite de pruebas de Compose (un composable aislado y un flujo end-to-end), auditar la accesibilidad de una pantalla, y especificar al menos una animación con una curva medible en vez de descrita subjetivamente.

**Requisitos previos:** Módulos 9 y 10 completados.

| Paso | Acción | Código/Comando | Explicación |
|---|---|---|---|
| 1 | Montar un composable real en un host de prueba sin emulador visible | Ver Tema 1 | `createComposeRule()` + sincronización automática de recomposición |
| 2 | Elegir el finder correcto ante nodos ambiguos | Ver Tema 2 | `onNodeWithTag` en vez de texto visible duplicado |
| 3 | Fusionar o reemplazar la semántica de un grupo de nodos | Ver Tema 3 | `clearAndSetSemantics` para un enunciado coherente |
| 4 | Auditar nodos interactivos sin descripción accesible | Ver Tema 4 | Detecta íconos clicables sin `contentDescription` |
| 5 | Animar un valor de estado con una especificación medible | Ver Tema 5 | `animateFloatAsState` + `tween` con easing explícito |
| 6 | Elegir entre `tween` y `spring` para una transición completa | Ver Tema 6 | `AnimatedContent` + `AnimationSpec`, verificado por simulación |

**Verificación:** el laboratorio se considera exitoso si al menos un test con `ComposeTestRule` pasa verificando un composable real tras una interacción (Temas 1-2), la auditoría de accesibilidad detecta exactamente los nodos interactivos sin `contentDescription` de una pantalla de ejemplo sin falsos positivos sobre nodos decorativos (Temas 3-4), y al menos una animación tiene su valor interpolado o su trayectoria verificado numéricamente en un instante específico, no solo descrita como "se ve fluida" (Temas 5-6).

**Errores comunes y soluciones**

- **Buscar nodos por texto visible traducible en vez de un `testTag` estable.** Rompe las pruebas ante un cambio de idioma o de copy; reserva `testTag` para nodos con riesgo real de ambigüedad.
- **Usar `clearAndSetSemantics` en un contenedor que no necesita anunciarse como una sola unidad.** Pierde granularidad de navegación para un usuario de TalkBack; resérvalo para grupos que representan un único enunciado con sentido.
- **Describir una animación como "que se vea fluida" sin especificar duración, easing o `dampingRatio`.** La hace imposible de verificar o reproducir; especifica siempre un `tween` o `spring` concreto.

---

## Trazabilidad de la auditoría original

- **Pruebas en Compose**: cubierto mediante fundamento, laboratorio y evidencia del capítulo (Temas 1-2).
- **Accesibilidad en Compose**: cubierto mediante fundamento, laboratorio y evidencia del capítulo (Temas 3-4).
- **Animaciones en Compose**: cubierto mediante fundamento, laboratorio y evidencia del capítulo (Temas 5-6).
