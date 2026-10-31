# Módulo 10: Performance, Material 3 y accesibilidad


## Aprende construyendo

### Tema 1: Detectar y corregir recomposición innecesaria

#### Paso 1 · Objetivo y preparación

Al finalizar podrás identificar por qué una lambda recreada en cada recomposición rompe la skippability de un composable y corregirlo con una referencia de método estable, y aplicar un `MaterialTheme` 3 completo (colores, tipografía, formas) que esos composables heredan automáticamente en vez de valores hardcodeados.

**Conocimiento previo:** Composables y recomposición (Módulo 2 de este track).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Identificar y corregir causas de recomposición innecesaria (como lambdas recreadas) mejora directamente el rendimiento percibido de la app, especialmente en pantallas con scroll o listas largas donde recomposiciones excesivas son más perceptibles.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** estabilidad de parámetros, skippability de un composable.

El Layout Inspector de Android Studio resalta visualmente qué composables se recomponen y con qué frecuencia. Una causa extremadamente común de recomposición innecesaria es pasar una lambda nueva en cada recomposición del padre (`onClick = { accion() }`), dado que Compose compara los parámetros para decidir si puede "saltarse" (skip) una recomposición, y una lambda recreada rompe esa comparación de igualdad. Anotar una clase con `@Stable`/`@Immutable` comunica al compilador garantías de estabilidad; `derivedStateOf` evita recalcular un valor derivado cuando no cambió realmente.

**Analogía:** una lambda recreada en cada recomposición es como entregar una llave físicamente distinta cada vez aunque abra exactamente la misma puerta: el sistema de seguridad (Compose) no puede confirmar que es "la misma llave de antes", así que repite la verificación completa innecesariamente.

**Diagrama:**

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

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía (o continuando en `academia-android` de módulos anteriores), crea `app/src/main/kotlin/com/academia/android/BotonesComparados.kt`, y modela en Python la comparación de identidad que Compose hace internamente, para confirmar en ejecución real por qué una lambda nueva rompe la igualdad:

```bash
# Crea el MaterialTheme 3 de la app y los dos botones comparados; el script python3 más abajo
# confirma en ejecución real la diferencia de identidad entre lambdas
mkdir -p academia-android/app/src/main/kotlin/com/academia/android
cd academia-android
cat > app/src/main/kotlin/com/academia/android/Theme.kt <<'EOF'
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
EOF
cat > app/src/main/kotlin/com/academia/android/BotonesComparados.kt <<'EOF'
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
EOF
./gradlew :app:compileDebugKotlin
```

**Explicación línea por línea:** `AcademiaAndroidTheme` envuelve el contenido con un `MaterialTheme` 3 completo (`lightColorScheme`, `Typography`, `Shapes` propios), una única fuente de verdad que cualquier `Button`/`Text` dentro del árbol hereda automáticamente (color primario, tipografía, formas de esquina) sin hardcodear esos valores en cada composable; `BotonInestable` crea una nueva expresión lambda (`{ viewModel.cargar() }`) cada vez que se recompone el padre; `BotonEstable` usa `viewModel::cargar`, una referencia de método que Kotlin resuelve a la misma identidad mientras `viewModel` no cambie, permitiendo que Compose confirme la igualdad y salte la recomposición si nada más cambió — ninguna de las dos decisiones (estabilidad de la lambda, o de dónde vienen los colores/tipografía) depende de la otra, pero ambas conviven en el mismo composable real de este módulo.

Confirma, con `is`/identidad de objetos en Python (el mismo concepto que la comparación de identidad de Compose), que dos lambdas creadas por separado nunca son "la misma", mientras que una referencia de método reutilizada sí lo es:

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

**Resultado esperado:** `lambda_1 is lambda_2` es `False`: aunque ambas lambdas ejecutan exactamente la misma lógica, son objetos distintos en memoria, exactamente el problema que rompe la skippability en Compose; `referencia_1 == referencia_2` es `True`, porque ambas representan el mismo método vinculado al mismo objeto, la razón por la que `viewModel::cargar` permite que Compose confirme la igualdad y salte la recomposición innecesaria.

**Fallo deliberado:** modifica el ejemplo para que `BotonEstable` reciba `onClick: () -> Unit` como parámetro desde un padre que, a su vez, le pasa `{ viewModel.cargar() }` en vez de `viewModel::cargar` en ese nivel superior. Aunque `BotonEstable` en sí mismo use una referencia, la inestabilidad ya ocurrió un nivel más arriba — diagnostica confirmando que la estabilidad debe mantenerse en TODA la cadena de composables que pasan la lambda hacia abajo, no solo en el composable final que la recibe; un único punto inestable en la cadena invalida la optimización completa.

#### Paso 5 · Práctica guiada

Agrega una tercera variante `BotonConLambdaMemorizada` que use `remember(viewModel) { { viewModel.cargar() } }` para memorizar la lambda entre recomposiciones mientras `viewModel` no cambie, y documenta en una frase si esto logra el mismo efecto que `viewModel::cargar`. **Pista:** compara si `remember` con una clave estable produce una referencia igualmente estable entre recomposiciones sucesivas.

#### Paso 6 · Práctica independiente

Documenta en una frase por qué una clase de datos anotada con `@Immutable` permite optimizaciones de recomposición más agresivas que una sin anotar, relacionándolo con qué garantía específica le comunica esa anotación al compilador de Compose sobre las propiedades de esa clase.

#### Paso 7 · Cierre

Ya identificas por qué una lambda recreada rompe la skippability de un composable, la corriges con una referencia de método estable, y aplicas un `MaterialTheme` 3 completo (colores, tipografía, formas) como única fuente de verdad en vez de valores hardcodeados por composable. El siguiente tema cubre cómo acelerar el arranque de la app y sincronizar Compose con sistemas externos mediante efectos. Fuente oficial: [Android Developers — Recomposition performance](https://developer.android.com/develop/ui/compose/performance/stability) y [Android Developers — Material Design 3 theming](https://developer.android.com/develop/ui/compose/designsystems/material3).

**Errores comunes:** pasar lambdas nuevas en cada recomposición sin necesidad, especialmente dentro de listas largas donde el impacto es más perceptible; asumir que una única corrección local basta sin revisar toda la cadena de composables que propagan el mismo callback; hardcodear colores o tamaños de fuente directamente en un composable en vez de leerlos de `MaterialTheme.colorScheme`/`MaterialTheme.typography`.

**Cuándo no usarlo:** para un composable que se recompone con tan poca frecuencia que el costo de la recomposición es imperceptible (una pantalla estática simple), optimizar agresivamente la estabilidad de sus lambdas es esfuerzo sin beneficio perceptible; resérvalo para composables dentro de listas largas o con recomposición frecuente medible.

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Mide las recomposiciones de la lista al actualizar una sola entrega. Conserva el registro antes y después del cambio y comprueba que el filtro sigue funcionando; reducir recomposiciones no debe ocultar datos nuevos.

### Tema 2: Baseline Profiles y ciclo de efectos

#### Paso 1 · Objetivo y preparación

Al finalizar podrás explicar cómo un Baseline Profile acelera el arranque de la app, y elegir el efecto correcto (`SideEffect`, `DisposableEffect`, `rememberUpdatedState`) según la necesidad de sincronización.

**Conocimiento previo:** Tema 1 de este módulo; ciclo de vida (Módulo 1).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Un Baseline Profile mejora directamente el tiempo de arranque percibido por el usuario; los efectos (`SideEffect`, `DisposableEffect`, `rememberUpdatedState`) son las herramientas correctas para sincronizar Compose con sistemas externos sin fugas de recursos ni closures obsoletos.

#### Paso 3 · Teoría con analogía

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

#### Paso 4 · Demostración guiada desde cero

Reutiliza `academia-android` (o créalo desde una carpeta vacía con `mkdir -p academia-android` si es tu primera vez) y crea `app/src/main/kotlin/com/academia/android/EfectosDeCiclo.kt`:

```bash
# Este script python3 simula la diferencia de tiempo entre interpretar código vs usar una versión precompilada
mkdir -p academia-android/app/src/main/kotlin/com/academia/android
cd academia-android
cat > app/src/main/kotlin/com/academia/android/EfectosDeCiclo.kt <<'EOF'
package com.academia.android

import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.SideEffect

@Composable
fun PantallaConSensor(alRecibirLectura: (Float) -> Unit) {
    SideEffect {
        // se ejecuta en CADA recomposición exitosa: sincroniza hacia un sistema externo
    }
    DisposableEffect(Unit) {
        val listenerId = "sensor-registrado"
        onDispose {
            // libera el listener del sensor al salir de composición
        }
    }
}
EOF
./gradlew :app:compileDebugKotlin
```

**Explicación línea por línea:** `SideEffect { }` ejecuta su bloque en cada recomposición exitosa, apropiado para sincronizar un valor de Compose hacia un sistema externo; `DisposableEffect(Unit) { onDispose { ... } }` registra un recurso al entrar en composición y garantiza su limpieza (`onDispose`) cuando el composable sale de composición, evitando fugas de recursos como un listener de sensor nunca liberado.

Mide, con tiempos reales de ejecución en Python, la diferencia entre "interpretar" repetidamente una operación y usar una versión "precompilada" (cacheada), como analogía directa de AOT frente a JIT:

```bash
python3 -c "
import time

def interpretar_cada_vez(n):
    # simula recalcular/interpretar desde cero en cada llamada (como JIT en el primer uso)
    resultado = 0
    for i in range(n):
        resultado += i ** 2
    return resultado

cache_precompilado = {}
def usar_version_precompilada(n):
    # simula un Baseline Profile: el resultado ya fue calculado de antemano
    if n not in cache_precompilado:
        cache_precompilado[n] = interpretar_cada_vez(n)
    return cache_precompilado[n]

usar_version_precompilada(2_000_000)  # 'precompila' de antemano, como el Baseline Profile

inicio = time.time()
interpretar_cada_vez(2_000_000)
duracion_interpretado = time.time() - inicio

inicio = time.time()
usar_version_precompilada(2_000_000)
duracion_precompilada = time.time() - inicio

print(f'interpretado cada vez: {duracion_interpretado:.4f}s')
print(f'usando versión precompilada (cacheada): {duracion_precompilada:.6f}s')
"
```

**Resultado esperado:** la versión "interpretada cada vez" tarda un tiempo medible (varios milisegundos o más, según el hardware); la versión que reutiliza el resultado ya calculado de antemano (análoga a un Baseline Profile) es órdenes de magnitud más rápida, ilustrando concretamente por qué precompilar rutas críticas de antemano reduce el tiempo percibido en el momento en que realmente importa (el arranque de la app).

**Fallo deliberado:** en `PantallaConSensor`, elimina el bloque `onDispose { ... }` dentro de `DisposableEffect`, dejando solo el registro del listener sin ninguna limpieza. Cada vez que el composable entra y sale de composición (por ejemplo, navegando hacia otra pantalla y regresando, Módulo 3), se registraría un nuevo listener sin liberar el anterior — diagnostica confirmando que esta es exactamente la fuga de recursos que `DisposableEffect`/`onDispose` existe para prevenir: sin la limpieza explícita, listeners y recursos se acumulan indefinidamente en cada ciclo de entrada/salida de composición.

#### Paso 5 · Práctica guiada

Agrega un `rememberUpdatedState` a `PantallaConSensor` para capturar la referencia más reciente de `alRecibirLectura` dentro de un `LaunchedEffect` de larga duración, sin que ese efecto se reinicie cada vez que `alRecibirLectura` cambie de identidad. **Pista:** envuelve el parámetro con `val alRecibirLecturaActualizado by rememberUpdatedState(alRecibirLectura)` y úsalo dentro del efecto en vez del parámetro directo.

#### Paso 6 · Práctica independiente

Documenta en una frase la diferencia entre usar `SideEffect` y `LaunchedEffect` para sincronizar un valor de Compose hacia un sistema externo, considerando que `SideEffect` se ejecuta en cada recomposición exitosa mientras que `LaunchedEffect` solo se relanza cuando cambian sus claves explícitas.

#### Paso 7 · Cierre

Ya explicas cómo un Baseline Profile acelera el arranque, y eliges el efecto correcto según la necesidad de sincronización, evitando fugas de recursos. El siguiente tema cubre accesibilidad y la interoperabilidad entre Compose y el sistema de Views clásico. Fuente oficial: [Android Developers — Baseline Profiles](https://developer.android.com/topic/performance/baselineprofiles/overview).

**Errores comunes:** registrar un listener en `DisposableEffect` sin su correspondiente `onDispose`, causando una fuga de recursos acumulativa; usar `LaunchedEffect` con una clave que cambia constantemente, reiniciando el efecto con más frecuencia de la necesaria.

**Cuándo no usarlo:** para una app pequeña sin ningún problema medible de tiempo de arranque, generar y mantener un Baseline Profile es esfuerzo adicional sin beneficio perceptible; resérvalo para apps donde el tiempo de arranque en frío es una métrica de negocio relevante.

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Incluye abrir la ruta y consultar una entrega en el recorrido del perfil de inicio. Compara tiempos con la misma compilación y dispositivo, y verifica que salir de la pantalla cancela sus efectos.

### Tema 3: Accesibilidad e interop con Views

#### Paso 1 · Objetivo y preparación

Al finalizar podrás agregar `contentDescription` a elementos interactivos sin texto visible, y decidir cuándo usar `AndroidView`/`ComposeView` para interoperabilidad.

**Conocimiento previo:** Temas 1 y 2 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** La accesibilidad no es "opcional" sino parte del estándar de una app profesional, dado que excluye a usuarios reales con discapacidades visuales u otras si se omite; `AndroidView`/`ComposeView` permiten una migración incremental entre los dos sistemas de UI sin reescribir la app completa de golpe.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** la app debe ser usable con tecnologías asistivas, no solo visualmente atractiva.

Un elemento interactivo sin texto visible (un ícono usado como botón) requiere `contentDescription` explícito para que TalkBack (el lector de pantalla de Android) pueda comunicar qué hace ese elemento. Probar la app activamente con TalkBack habilitado revela rápidamente qué elementos quedaron sin descripción accesible. `AndroidView` embebe una View clásica dentro de Compose, útil durante una migración incremental; `ComposeView` hace lo inverso, embebiendo Compose dentro de una jerarquía de Views clásica.

**Analogía:** la accesibilidad es como instalar rampas y señalización en braille en un edificio público: no es un adorno opcional sino un requisito para que el edificio sea genuinamente utilizable por todos sus visitantes potenciales.

**Diagrama:**

```
┌── AndroidView ─────────────────────────────┐
│ embebe una View CLÁSICA dentro de Compose        │
└─────────────────────────────────────────┘
┌── ComposeView ─────────────────────────────┐
│ embebe Compose dentro de una jerarquía de Views     │
│ clásica (típico en migraciones progresivas)              │
└─────────────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Reutiliza `academia-android` (o créalo desde una carpeta vacía con `mkdir -p academia-android` si es tu primera vez) y crea `app/src/main/kotlin/com/academia/android/IconoAccesible.kt`:

```bash
# Este script python3 audita programáticamente qué íconos carecen de contentDescription
mkdir -p academia-android/app/src/main/kotlin/com/academia/android
cd academia-android
cat > app/src/main/kotlin/com/academia/android/IconoAccesible.kt <<'EOF'
package com.academia.android

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable

@Composable
fun IconoEliminarTarea() {
    Icon(Icons.Default.Delete, contentDescription = "Eliminar tarea") // sin esto, TalkBack no puede describir el ícono
}
EOF
./gradlew :app:compileDebugKotlin
```

**Explicación línea por línea:** `Icon(Icons.Default.Delete, contentDescription = "Eliminar tarea")` provee el texto que TalkBack anuncia al usuario al enfocar ese ícono; sin `contentDescription` (o con `contentDescription = null`, apropiado solo para íconos puramente decorativos sin ninguna función interactiva), TalkBack no tiene ninguna forma de comunicar qué hace ese elemento.

Audita, ejecutando un script con python, una lista de íconos de una pantalla simulada, detectando cuáles carecen de descripción accesible:

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

**Resultado esperado:** la auditoría identifica `Edit` como el único ícono interactivo sin `contentDescription` que requiere corrección (`MoreVert`, marcado explícitamente como decorativo, no cuenta como un problema real), confirmando que la ausencia de descripción solo es un problema cuando el elemento tiene una función interactiva real que TalkBack necesita comunicar.

**Fallo deliberado:** modifica la auditoría para que trate cualquier `content_description` en `None` como un problema, sin distinguir íconos decorativos. La auditoría ahora reportaría también `MoreVert` como un "problema" — diagnostica confirmando que forzar `contentDescription` en TODO ícono, incluyendo los puramente decorativos, generaría ruido innecesario para el usuario de TalkBack (describiendo elementos sin ninguna acción real), la razón por la que Compose permite explícitamente `contentDescription = null` para ese caso específico.

#### Paso 5 · Práctica guiada

Extiende el script de auditoría para que también reporte íconos con `content_description` genérico y poco útil (por ejemplo, `"Icono"` o `"Botón"`, que no describen la acción específica), agregando un chequeo de longitud mínima o de palabras genéricas a evitar. **Pista:** una lista de palabras prohibidas genéricas (`icono`, `botón`, `imagen`) es un buen punto de partida simple.

#### Paso 6 · Práctica independiente

Documenta en una frase un caso real de tu propio proyecto donde usarías `AndroidView` (para embeber una View clásica sin equivalente Compose) y otro donde usarías `ComposeView` (para introducir Compose incrementalmente en una app basada en Views existente).

#### Paso 7 · Cierre

Ya agregas `contentDescription` apropiado a elementos interactivos, distinguiendo íconos decorativos de funcionales, y decides cuándo usar `AndroidView`/`ComposeView` para interoperabilidad. Esto cierra el módulo de performance, Material 3 y accesibilidad; el siguiente módulo del track aborda características avanzadas de la plataforma. Fuente oficial: [Android Developers — Accessibility in Compose](https://developer.android.com/develop/ui/compose/accessibility).

**Errores comunes:** omitir `contentDescription` en íconos interactivos, dejando a usuarios de TalkBack sin forma de saber qué hace ese elemento; forzar una descripción en íconos puramente decorativos, generando ruido innecesario para el lector de pantalla.

**Cuándo no usarlo:** para un ícono puramente decorativo sin ninguna función interactiva ni información adicional que aportar (un divisor visual, un fondo decorativo), `contentDescription = null` es la elección correcta, no un descuido; forzar una descripción ahí sería el error, no la ausencia de una.

---

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Integra la vista de mapa existente dentro de la pantalla Compose. Con TalkBack, entra al detalle y regresa a la lista; cada entrega debe conservar un nombre accesible y un destino de foco predecible.

## Laboratorio práctico

**Objetivo del laboratorio:** realizar una auditoría de performance de una pantalla con el Layout Inspector y aplicar al menos una mejora.

**Requisitos previos:** Módulo 9 completado.

| Paso | Acción | Código/Comando | Explicación |
|---|---|---|---|
| 1 | Aplicar un `MaterialTheme` 3 completo | Ver Tema 1 | Colores, tipografía, formas |
| 2 | Detectar recomposiciones innecesarias | Layout Inspector | En una pantalla con scroll |
| 3 | Corregir al menos una causa | Ver Tema 1 | Ej. lambda recreada en cada render |
| 4 | Agregar `contentDescription` a íconos interactivos | Ver Tema 3 | Soporte de TalkBack |
| 5 | Generar un Baseline Profile | Ver Tema 2 | Documenta qué optimiza |

**Verificación:** el laboratorio se considera exitoso si el Layout Inspector muestra una reducción medible en recomposiciones tras la corrección aplicada, y si TalkBack describe correctamente todos los elementos interactivos sin texto visible.

**Errores comunes y soluciones**

- **Pasar lambdas nuevas en cada recomposición sin necesidad.** Usa referencias de método estables cuando sea posible.
- **Omitir `contentDescription` en íconos interactivos.** Sin él, TalkBack no puede describir el elemento al usuario.
- **Asumir que la accesibilidad es un paso final opcional.** Intégrala desde el desarrollo inicial, no como una auditoría de último momento.

---
