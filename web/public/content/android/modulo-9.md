# Módulo 9: Performance, Material 3 y accesibilidad


## Aprende construyendo

> **Antes de empezar este módulo.** El Tema 3 importa `androidx.compose.material.icons`; añade `implementation(libs.androidx.compose.material.icons.core)` (catálogo del Módulo 0, versión fijada por el BOM de Compose) dentro de `dependencies { }` y pulsa **Sync Now**.
>
> **Los scripts `python3` de este módulo son modelos, no pruebas de Android.** Ilustran el razonamiento, pero no ejecutan tu app. La evidencia real es la indicada en cada tema como **Verificación real en Android**. En particular, la «medición» de Baseline Profiles con Python es solo un modelo del concepto: la generación real de un perfil con el plugin `androidx.baselineprofile` y su medición con Macrobenchmark están en el Módulo 18; hasta entonces no presentes la cifra del script como resultado de tu app.


### Tema 1: Detectar y corregir recomposición innecesaria · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás identificar por qué una lambda recreada en cada recomposición rompe la skippability de un composable y corregirlo con una referencia de método estable, y aplicar un MaterialTheme 3 completo (colores, tipografía, formas) que esos composables heredan automáticam…

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás identificar por qué una lambda recreada en cada recomposición rompe la skippability de un composable y corregirlo con una referencia de método estable, y aplicar un MaterialTheme 3 completo (colores, tipografía, formas) que esos composables heredan automáticamente en vez de valores hardcodeados.**

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌── Boton(onClick = { viewModel.accion() }) ──┐
│ NUEVA lambda en cada recomposición del padre     │
│ Compose NO puede confirmar igualdad → recompone     │
└─────────────────────────────────────────┘
┌── Boton(onClick = viewModel::accion) ───────┐
│ referencia de método ESTABLE                      │
│ Compose confirma igualdad → PUEDE saltarse (skip)   │
└─────────────────────────────────────────┘
```

```bash
# Crea el MaterialTheme 3 de la app y los dos botones comparados; el script python3 más abajo
# confirma en ejecución real la diferencia de identidad entre lambdas
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
mkdir -p app/src/main/kotlin/com/academia/android
```

Crea el archivo `app/src/main/kotlin/com/academia/android/Theme.kt`:

```kotlin
package com.academia.android

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.Typography
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// MaterialTheme 3 completo: una única fuente de verdad para colores, tipografía y formas
private val EsquemaDeColorAcademia = lightColorScheme(
    primary = Color(0xFF3DDC84),
    onPrimary = Color.White,
    secondary = Color(0xFF00695C),
)

private val TipografiaAcademia = Typography(
    bodyLarge = TextStyle(fontWeight = FontWeight.Normal, fontSize = 16.sp),
    titleLarge = TextStyle(fontWeight = FontWeight.Bold, fontSize = 22.sp),
)

private val FormasAcademia = Shapes(
    small = RoundedCornerShape(4.dp),
    medium = RoundedCornerShape(12.dp),
)

@Composable
fun AcademiaAndroidTheme(contenido: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = EsquemaDeColorAcademia,
        typography = TipografiaAcademia,
        shapes = FormasAcademia,
        content = contenido,
    )
}
```

Crea el archivo `app/src/main/kotlin/com/academia/android/BotonesComparados.kt`:

```kotlin
package com.academia.android

import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable

@Composable
fun BotonInestable(viewModel: TareasViewModelConEstado) {
    AcademiaAndroidTheme {
        Button(onClick = { viewModel.cargar() }) { Text("Cargar") } // nueva lambda cada recomposición
    }
}

@Composable
fun BotonEstable(viewModel: TareasViewModelConEstado) {
    AcademiaAndroidTheme {
        Button(onClick = viewModel::cargar) { Text("Cargar") } // referencia estable
    }
}
```

```bash
./gradlew :app:compileDebugKotlin
```

```bash
python3 -c "
class ViewModel:
    def cargar(self):
        return 'cargando'

vm = ViewModel()

lambda_1 = lambda: vm.cargar()
lambda_2 = lambda: vm.cargar()
print('dos lambdas nuevas, misma lógica, ¿son la MISMA referencia?:', lambda_1 is lambda_2)

referencia_1 = vm.cargar
referencia_2 = vm.cargar
print('dos referencias al mismo método bound, ¿son iguales por valor?:', referencia_1 == referencia_2)
"
```

</details>

### Tema 2: Baseline Profiles y ciclo de efectos · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás explicar cómo un Baseline Profile acelera el arranque de la app, y elegir el efecto correcto (SideEffect, DisposableEffect, rememberUpdatedState) según la necesidad de sincronización.

#### ► LA ANALOGÍA
**Conceptos clave:** precompilación de rutas críticas, sincronización entre el mundo de Compose y el imperativo.

Un Baseline Profile precompila ahead-of-time (AOT) las rutas de código más usadas al inicio de la app, en vez de interpretarlas o compilarlas just-in-time (JIT) en el primer uso real, reduciendo el arranque percibido y el "jank" inicial. `SideEffect` ejecuta un bloque en cada recomposición exitosa, para sincronizar estado hacia un sistema externo no consciente de Compose; `DisposableEffect` ejecuta limpieza cuando el composable sale de composición; `rememberUpdatedState` captura la referencia más reciente de un valor dentro de un efecto de larga duración sin reiniciarlo, resolviendo closures obsoletos.

**Analogía:** un Baseline Profile es como precalentar un horno antes de que lleguen los primeros clientes, en vez de esperar a que el primer pedido dispare el calentamiento desde frío; `DisposableEffect` es como apagar las luces y cerrar la puerta al final del turno, ejecutado automáticamente sin que el empleado deba recordarlo.

**Diagrama:**

```
┌── Sin Baseline Profile ────────────────────┐
│ interpretación/JIT en el PRIMER uso → arranque LENTO │
└─────────────────────────────────────────┘
┌── Con Baseline Profile ────────────────────┐
│ rutas críticas precompiladas AOT → arranque RÁPIDO   │
└─────────────────────────────────────────┘
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Objetivo observable
Al finalizar podrás explicar cómo un Baseline Profile acelera el arranque de la app, y elegir el efecto correcto (`SideEffect`, `DisposableEffect`, `rememberUpdatedState`) según la necesidad de sincronización.

**Conocimiento previo:** Tema 1 de este módulo; ciclo de vida (Módulo 1).

</details>

### Tema 3: Accesibilidad e interop con Views · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás agregar contentDescription a elementos interactivos sin texto visible, y decidir cuándo usar AndroidView/ComposeView para interoperabilidad.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```
┌── AndroidView ─────────────────────────────┐
│ embebe una View CLÁSICA dentro de Compose        │
└─────────────────────────────────────────┘
┌── ComposeView ─────────────────────────────┐
│ embebe Compose dentro de una jerarquía de Views     │
│ clásica (típico en migraciones progresivas)              │
└─────────────────────────────────────────┘
```

```bash
# Este script python3 audita programáticamente qué íconos carecen de contentDescription
test -f settings.gradle.kts || cd academia-android   # sitúate en la raíz del proyecto del Módulo 0
mkdir -p app/src/main/kotlin/com/academia/android
```

Crea el archivo `app/src/main/kotlin/com/academia/android/IconoAccesible.kt`:

```kotlin
package com.academia.android

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable

@Composable
fun IconoEliminarTarea() {
    Icon(Icons.Default.Delete, contentDescription = "Eliminar tarea") // sin esto, TalkBack no puede describir el ícono
}
```

```bash
./gradlew :app:compileDebugKotlin
```

```bash
python3 -c "
iconos_de_la_pantalla = [
    {'nombre': 'Delete', 'accion': 'eliminar tarea', 'content_description': 'Eliminar tarea'},
    {'nombre': 'Edit', 'accion': 'editar tarea', 'content_description': None},  # falta
    {'nombre': 'Share', 'accion': 'compartir tarea', 'content_description': 'Compartir tarea'},
    {'nombre': 'MoreVert', 'accion': 'decorativo, sin acción propia', 'content_description': None},  # OK: decorativo
]

def auditar_accesibilidad(iconos):
    problemas = []
    for icono in iconos:
        es_decorativo = 'decorativo' in icono['accion']
        if icono['content_description'] is None and not es_decorativo:
            problemas.append(icono['nombre'])
    return problemas

problemas = auditar_accesibilidad(iconos_de_la_pantalla)
print('íconos interactivos SIN contentDescription (requieren corrección):', problemas)
"
```

</details>
