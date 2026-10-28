# Módulo 3: Navegación con Navigation Compose


## Aprende construyendo

### Tema 1: NavHost y NavController

#### Paso 1 · Objetivo y preparación

Al finalizar podrás declarar un grafo de navegación con `NavHost` y explicar cómo `NavController` gestiona automáticamente el back stack.

**Conocimiento previo:** Jetpack Compose (Módulo 2 de este track).

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Declarar el grafo de navegación completo de antemano, en vez de gestionar transiciones imperativas dispersas por el código, centraliza la estructura de navegación de la app y permite que el sistema gestione automáticamente el historial (back stack) sin código adicional.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** grafo de navegación declarado una vez, historial gestionado automáticamente.

`NavHost` declara el grafo completo de navegación: qué rutas existen y qué composable se renderiza para cada una; `NavController` ejecuta transiciones (`navigate(...)`) y gestiona automáticamente el back stack, de modo que el botón "atrás" del sistema funciona sin código adicional. Este modelo es conceptualmente análogo a React Router (track React, Módulo 6): se declara un árbol de rutas y el router gestiona el historial automáticamente. Cada destino se identifica por una ruta con formato de string, lo que facilita deep links (Tema 3) que simplemente mapean una URI externa hacia una ruta ya declarada.

**Analogía:** un `NavHost` es como el mapa completo de un edificio con todas sus salas y puertas ya definidas; el `NavController` es como el sistema de señalización que guía a un visitante y recuerda automáticamente el camino recorrido para regresar sobre sus pasos.

**Diagrama:**

```
┌── NavHost (grafo declarado una vez) ──────────┐
│  "lista"        → ListaTareasScreen              │
│  "detalle/{id}" → DetalleTareaScreen                │
└──────────┬─────────────────────────────┘
           │ navController.navigate("detalle/42")
           ▼
┌── back stack gestionado automáticamente ──────┐
│  [lista, detalle/42]  ← "atrás" del sistema pop-ea  │
└───────────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Desde una carpeta vacía (o continuando en `academia-android` de módulos anteriores), crea `app/src/main/kotlin/com/academia/android/GrafoNavegacion.kt`:

```bash
# compila con Gradle el archivo Kotlin generado a continuación
mkdir -p academia-android/app/src/main/kotlin/com/academia/android
cd academia-android
cat > app/src/main/kotlin/com/academia/android/GrafoNavegacion.kt <<'EOF'
package com.academia.android

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController

@Composable
fun GrafoNavegacion(navController: NavHostController = rememberNavController()) {
    NavHost(navController, startDestination = "lista") {
        composable("lista") {
            ListaTareasScreen(onTareaClick = { id -> navController.navigate("detalle/$id") })
        }
        composable("detalle/{id}") { backStackEntry ->
            val id = backStackEntry.arguments?.getString("id")
            DetalleTareaScreen(id)
        }
    }
}
EOF
./gradlew :app:compileDebugKotlin
```

**Explicación línea por línea:** `NavHost` recibe `startDestination = "lista"`, la primera ruta mostrada; cada bloque `composable("ruta") { ... }` asocia una ruta con el composable que la renderiza; `navController.navigate("detalle/$id")` dentro del callback `onTareaClick` empuja una nueva entrada al back stack, y `backStackEntry.arguments?.getString("id")` extrae el argumento de esa ruta específica.

Simula el back stack como una estructura de datos real en Python, confirmando que "navegar" empuja y "atrás" saca (pop) exactamente como describe el diagrama del Paso 3:

```bash
python3 -c "
class BackStackSimulado:
    def __init__(self, inicio):
        self.pila = [inicio]
    def navigate(self, ruta):
        self.pila.append(ruta)
    def atras(self):
        if len(self.pila) > 1:
            return self.pila.pop()
        return None
    def pantalla_actual(self):
        return self.pila[-1]

nav = BackStackSimulado('lista')
nav.navigate('detalle/42')
print('pantalla actual tras navegar:', nav.pantalla_actual())
print('pila completa:', nav.pila)
nav.atras()
print('pantalla actual tras \"atrás\":', nav.pantalla_actual())
"
```

**Resultado esperado:** tras `navigate('detalle/42')`, la pantalla actual es `detalle/42` y la pila contiene `['lista', 'detalle/42']`; tras `atras()`, la pantalla actual vuelve a `lista`, confirmando el comportamiento de pila (LIFO) que `NavController` gestiona automáticamente sin código adicional del desarrollador.

**Fallo deliberado:** modifica el script para llamar `nav.atras()` cuando la pila solo tiene un elemento (`BackStackSimulado('lista').atras()`, sin ningún `navigate()` previo). El método retorna `None` sin sacar el único elemento — diagnostica confirmando que el destino inicial del `NavHost` nunca debe poder "sacarse" con atrás; en una app Android real, presionar atrás desde la pantalla inicial normalmente cierra la app o navega fuera de ella, exactamente el comportamiento de límite que la condición `len(self.pila) > 1` protege en la simulación.

#### Paso 5 · Práctica guiada

Agrega una tercera ruta `"crear"` al `NavHost` y al script de simulación (un tercer elemento posible en la pila), y confirma que navegar de `lista` a `crear` y luego "atrás" dos veces te devuelve a `lista` sin poder sacarla. **Pista:** extiende la condición de límite (`len(self.pila) > 1`) exactamente igual para la nueva ruta.

#### Paso 6 · Práctica independiente

Documenta en una frase por qué el back stack de Navigation Compose es conceptualmente el mismo tipo de estructura de datos (una pila) que ya usaste en otro contexto de este curso, y qué operación (`navigate`/`atrás`) corresponde a cada operación clásica de pila (`push`/`pop`).

#### Paso 7 · Cierre y evidencia

Ya declaras un grafo de navegación con `NavHost` y explicas cómo `NavController` gestiona automáticamente el back stack como una pila. El siguiente tema cubre cómo tipar los argumentos que viajan entre rutas y cómo mapear entradas externas hacia ellas. **Evidencia:** entrega el resultado de la simulación de pila mostrando el push al navegar y el pop al presionar atrás, y explica por qué el destino inicial nunca debe poder sacarse de la pila. Fuente oficial: [Android Developers — Navigate to a composable](https://developer.android.com/develop/ui/compose/navigation).

**Errores comunes:** gestionar la navegación imperativamente con banderas booleanas dispersas en vez de declarar un grafo centralizado con `NavHost`; olvidar que `backStackEntry.arguments` puede ser `null` y no manejar ese caso.

**Cuándo no usarlo:** para una app de una sola pantalla sin ninguna transición entre vistas distintas, introducir `NavHost`/`NavController` es una complejidad innecesaria; resérvalo para apps con más de una pantalla navegable.

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Conecta lista, detalle y confirmación mediante NavHost. Abre una guía, confirma y regresa; verifica que la pila no acumula pantallas de confirmación y que la lista refleja el estado nuevo.

### Tema 2: Argumentos tipados y deep links

#### Paso 1 · Objetivo y preparación

Al finalizar podrás declarar un argumento de navegación con su tipo explícito, y configurar un deep link que mapee una URI externa hacia una ruta interna.

**Conocimiento previo:** Tema 1 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Los argumentos tipados evitan errores de conversión manual y hacen explícito el contrato de cada ruta; los deep links permiten que entradas externas (notificaciones, links) lleven al usuario directamente a la pantalla relevante, mejorando significativamente la experiencia percibida.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** validación de tipo en tiempo de navegación, entrada externa mapeada a una ruta interna.

Declarar explícitamente el tipo de un argumento con `navArgument(...) { type = ... }` permite que Navigation Compose valide y extraiga el argumento con el tipo correcto automáticamente, evitando errores de conversión manual que serían responsabilidad del desarrollador con un mecanismo no tipado como el `Bundle` clásico. Un deep link mapea una URI externa (notificación push, link compartido, navegador web) directamente hacia una ruta ya declarada en el `NavHost`, con el argumento resuelto automáticamente a partir de esa URI, permitiendo que el usuario llegue directamente a la pantalla relevante en vez de aterrizar en la principal.

**Analogía:** un argumento tipado es como una casilla de un formulario que solo acepta un formato específico de dato, validado automáticamente al llegar. Un deep link es como una dirección postal específica que un cartero externo puede usar para entregar un paquete directamente en la puerta correcta de un edificio grande, en vez de dejarlo en la recepción general.

**Diagrama:**

```
┌── Sin tipo declarado ──────────────┐   ┌── Con navArgument tipado ────────────┐
│ "detalle/{id}" (string genérico)       │   │ navArgument("id") { type = StringType }   │
│ conversión manual, riesgo de error       │ ≠ │ validación y extracción automática          │
└─────────────────────────────┘   └───────────────────────────────────┘

┌── URI externa ────────────┐        ┌── Ruta interna ya declarada ────┐
│ miapp://tarea/42               │  ──▶  │ "detalle/{id}"  (id = "42")            │
└───────────────────────┘        └──────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Reutiliza `academia-android` (o créalo desde una carpeta vacía con `mkdir -p academia-android` si es tu primera vez) y actualiza `GrafoNavegacion.kt` con un argumento tipado y un deep link:

```bash
# compila con Gradle el archivo Kotlin generado a continuación
mkdir -p academia-android/app/src/main/kotlin/com/academia/android
cd academia-android
cat > app/src/main/kotlin/com/academia/android/RutaDetalleTarea.kt <<'EOF'
package com.academia.android

import androidx.navigation.NavType
import androidx.navigation.navArgument
import androidx.navigation.navDeepLink
import androidx.navigation.compose.composable

fun rutaDetalleConArgumentoYDeepLink() = composable(
    "detalle/{id}",
    arguments = listOf(navArgument("id") { type = NavType.StringType }),
    deepLinks = listOf(navDeepLink { uriPattern = "miapp://tarea/{id}" })
) { /* renderiza DetalleTareaScreen con el id ya resuelto */ }
EOF
./gradlew :app:compileDebugKotlin
```

**Explicación línea por línea:** `navArgument("id") { type = NavType.StringType }` declara que el argumento `id` debe ser un `String`, permitiendo validación automática; `navDeepLink { uriPattern = "miapp://tarea/{id}" }` registra que cualquier URI que coincida con ese patrón (por ejemplo, `miapp://tarea/42`) navega directamente a esta ruta, extrayendo `42` como el argumento `id` automáticamente.

Simula la resolución de un deep link real: dada una URI externa, extrae el argumento y confirma a qué ruta interna se mapea:

```bash
python3 -c "
import re

def resolver_deep_link(uri, patron_uri, ruta_interna):
    # convierte 'miapp://tarea/{id}' en una regex que captura 'id'
    patron_regex = '^' + re.escape(patron_uri).replace(r'\{id\}', '(?P<id>[^/]+)') + '$'
    match = re.match(patron_regex, uri)
    if not match:
        return None
    return ruta_interna.replace('{id}', match.group('id'))

resultado = resolver_deep_link('miapp://tarea/42', 'miapp://tarea/{id}', 'detalle/{id}')
print('URI externa: miapp://tarea/42  ->  ruta interna resuelta:', resultado)
"
```

**Resultado esperado:** el script resuelve `miapp://tarea/42` hacia la ruta interna `detalle/42`, confirmando que el argumento `id` (`42`) se extrajo correctamente de la URI externa y se aplicó a la ruta declarada en el `NavHost`, sin intervención manual del desarrollador.

**Fallo deliberado:** intenta resolver una URI que no coincide con el patrón del deep link (`resolver_deep_link('otraapp://cosa/42', 'miapp://tarea/{id}', 'detalle/{id}')`). La función retorna `None` — diagnostica confirmando que un deep link solo resuelve URIs que coinciden exactamente con su `uriPattern` declarado; una URI de un esquema o formato distinto simplemente no se enruta hacia esa ruta, ni hacia ninguna otra, a menos que coincida con otro patrón declarado.

#### Paso 5 · Práctica guiada

Agrega un segundo argumento tipado `NavType.BoolType` (por ejemplo, `soloLectura`) a la ruta de detalle, y extiende el script de resolución de deep link para que también extraiga ese segundo valor de una URI como `miapp://tarea/42?soloLectura=true`. **Pista:** puedes usar `urllib.parse.parse_qs` en Python para extraer parámetros de query string de la URI.

#### Paso 6 · Práctica independiente

Documenta en una frase qué pasaría si declararas el argumento `id` como `NavType.IntType` pero un deep link real entregara un valor no numérico (por ejemplo, `miapp://tarea/abc`), y por qué la validación de tipo automática es preferible a descubrir ese error solo en tiempo de ejecución sin ningún aviso temprano.

#### Paso 7 · Cierre y evidencia

Ya declaras argumentos tipados y configuras deep links que mapean URIs externas hacia rutas internas ya declaradas. El siguiente tema aborda cómo estructurar la navegación cuando la app tiene varias secciones principales con bottom navigation. **Evidencia:** entrega el resultado de la resolución exitosa del deep link `miapp://tarea/42` hacia `detalle/42`, y el resultado `None` al intentar resolver una URI que no coincide con el patrón. Fuente oficial: [Android Developers — Create deep links](https://developer.android.com/develop/ui/compose/navigation#deeplinks).

**Errores comunes:** declarar un deep link en el grafo de navegación sin también registrar el `intent-filter` correspondiente en el `AndroidManifest.xml`, dejando que el sistema operativo nunca enrute la URI hacia la app; asumir el tipo de un argumento sin declararlo explícitamente con `navArgument`.

**Cuándo no usarlo:** para una app completamente cerrada, sin ninguna necesidad de recibir notificaciones ni links externos que naveguen a una pantalla específica, configurar deep links es esfuerzo sin beneficio; los argumentos tipados, en cambio, son buena práctica incluso en una app sin ningún deep link.

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Navega pasando únicamente el identificador tipado de la guía. Abre un deep link con un identificador inválido y comprueba que muestra un error controlado sin consultar ni exponer otra entrega.

### Tema 3: Navegación anidada con stacks independientes

#### Paso 1 · Objetivo y preparación

Al finalizar podrás estructurar una app con bottom navigation donde cada sección mantiene su propio historial de navegación independiente.

**Conocimiento previo:** Temas 1 y 2 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** Cada sección de una bottom navigation suele necesitar su propio stack independiente para que cambiar entre secciones no pierda el contexto de navegación profundo dentro de cada una, cumpliendo con una expectativa de UX ya establecida en apps móviles.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** cada sección principal mantiene su propio historial de navegación.

En una app con bottom navigation de varias secciones (Inicio, Tareas, Perfil), cada sección típicamente necesita su propio historial independiente: si el usuario navega profundamente en "Tareas" (lista → detalle → edición) y cambia a "Perfil", al volver a "Tareas" debería encontrar exactamente el mismo punto profundo, no la raíz de esa sección. Esto requiere un `NavHost` anidado por sección, cada uno con su propio back stack, en vez de un único `NavHost` plano compartido. Este patrón es común también en la navegación por pestañas de iOS (track iOS).

**Analogía:** stacks de navegación independientes por sección son como tener un marcador de página distinto para cada uno de varios libros que se leen simultáneamente: cambiar de libro y volver preserva exactamente la página donde se quedó cada uno.

**Diagrama:**

```
┌── Bottom Nav ─────────────────────────────────┐
│ ├── Inicio  → stack propio: [Inicio]                │
│ ├── Tareas  → stack propio: [Lista → Detalle → Edición] │
│ └── Perfil  → stack propio: [Perfil]                    │
│                                                              │
│ Cambiar de pestaña NO resetea el stack de la anterior.        │
└───────────────────────────────────────────┘
```

#### Paso 4 · Demostración guiada desde cero

Reutiliza `academia-android` (o créalo desde una carpeta vacía con `mkdir -p academia-android` si es tu primera vez) y crea, dentro de `app/src/`, primero un modelo de los stacks independientes como estructura de datos, antes de implementar el Compose real:

```bash
# Verificación en python3 del modelo de stacks independientes antes de escribir el Compose real
mkdir -p academia-android/app/src/main/kotlin/com/academia/android
cd academia-android
python3 -c "
class NavegacionMultiSeccion:
    def __init__(self, secciones):
        self.stacks = {s: [s] for s in secciones}  # cada sección arranca con su propia raíz
        self.seccion_activa = secciones[0]

    def navigate_en_seccion_activa(self, ruta):
        self.stacks[self.seccion_activa].append(ruta)

    def cambiar_seccion(self, seccion):
        self.seccion_activa = seccion  # NO toca el stack de ninguna sección

    def pantalla_actual(self):
        return self.stacks[self.seccion_activa][-1]

nav = NavegacionMultiSeccion(['Inicio', 'Tareas', 'Perfil'])
nav.cambiar_seccion('Tareas')
nav.navigate_en_seccion_activa('Detalle')
nav.navigate_en_seccion_activa('Edicion')
print('stack de Tareas antes de cambiar:', nav.stacks['Tareas'])

nav.cambiar_seccion('Perfil')
print('pantalla actual en Perfil:', nav.pantalla_actual())

nav.cambiar_seccion('Tareas')
print('pantalla actual al volver a Tareas:', nav.pantalla_actual())
print('stack de Tareas preservado:', nav.stacks['Tareas'])
"
cat > app/src/main/kotlin/com/academia/android/NavegacionInferior.kt <<'EOF'
package com.academia.android

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController

data class SeccionPrincipal(val ruta: String)

@Composable
fun AppConNavegacionInferior(secciones: List<SeccionPrincipal>) {
    val navController = rememberNavController()
    Scaffold(bottomBar = {
        NavigationBar {
            secciones.forEach { seccion ->
                NavigationBarItem(
                    selected = false,
                    onClick = { navController.navigate(seccion.ruta) },
                    icon = { },
                )
            }
        }
    }) { padding ->
        NavHost(navController, startDestination = "inicio", androidx.compose.ui.Modifier.padding(padding)) {
            composable("inicio") { }
        }
    }
}
EOF
./gradlew :app:compileDebugKotlin
```

**Explicación línea por línea:** el modelo Python (`NavegacionMultiSeccion`) confirma la lógica antes de escribir Compose: cada sección tiene su propio `stacks[seccion]`, y `cambiar_seccion` solo cambia cuál está activa sin tocar ningún stack; el `NavegacionInferior.kt` real usa `Scaffold` con `bottomBar` y un `NavigationBar` con un ítem por sección, cada uno navegando a la ruta raíz de su propia sección.

**Resultado esperado:** el script muestra que el stack de `Tareas` (`['Tareas', 'Detalle', 'Edicion']`) permanece exactamente igual después de cambiar a `Perfil` y volver, y que la pantalla actual al regresar a `Tareas` es `Edicion` (el punto profundo donde se dejó), no `Tareas` (la raíz), confirmando el comportamiento esperado de stacks independientes por sección.

**Fallo deliberado:** modifica `cambiar_seccion` para que, además de cambiar `seccion_activa`, reinicie el stack de la sección a la que se cambia (`self.stacks[seccion] = [seccion]`). Repite la secuencia del Paso 4 — al volver a "Tareas" ahora la pantalla actual es `Tareas` (la raíz), no `Edicion` — diagnostica confirmando exactamente el bug de UX que un único `NavHost` plano compartido produciría: perder el contexto de navegación profundo de una sección simplemente por visitar otra.

#### Paso 5 · Práctica guiada

Extiende el script `NavegacionMultiSeccion` para registrar en qué orden se visitaron las secciones (`historial_de_secciones`), y confirma que cambiar entre tres secciones en una secuencia específica (`Inicio → Tareas → Perfil → Tareas`) preserva el stack profundo de `Tareas` a pesar de haber visitado `Perfil` en el medio. **Pista:** agrega una lista simple que registre cada llamada a `cambiar_seccion`.

#### Paso 6 · Práctica independiente

Documenta en una frase qué comportamiento esperarías si el usuario toca dos veces seguidas el mismo ítem de la bottom navigation ya activo (un patrón de UX común es volver a la raíz de esa sección en ese caso específico, a diferencia de simplemente cambiar de sección), y cómo lo implementarías en el modelo de este Tema.

#### Paso 7 · Cierre y evidencia

Ya estructuras una app con bottom navigation donde cada sección mantiene su propio historial independiente, evitando el bug de perder contexto de navegación al cambiar de sección. Esto cierra el módulo de navegación; el siguiente módulo del track aborda networking con Retrofit. **Evidencia:** entrega el resultado mostrando el stack de "Tareas" preservado tras visitar "Perfil" y volver, y el resultado del fallo al reiniciar el stack en cada cambio de sección. Fuente oficial: [Android Developers — Navigate with bottom navigation](https://developer.android.com/develop/ui/compose/navigation#bottom-nav).

**Errores comunes:** usar un único `NavHost` plano compartido entre todas las secciones de una bottom navigation, perdiendo el historial profundo de cada una al cambiar de sección; olvidar manejar el caso de tocar dos veces el mismo ítem ya activo de la bottom bar.

**Cuándo no usarlo:** para una app con una única sección principal sin bottom navigation, o donde las secciones son genuinamente independientes sin ninguna necesidad de preservar contexto profundo entre ellas, un único `NavHost` plano es más simple y suficiente.

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Separa las pilas de Ruta y Perfil. Abre una entrega, cambia de pestaña y vuelve: el detalle debe mantenerse; cerrar sesión debe eliminar los destinos que requieren autenticación.

### Tema 4: Predictive Back — gesto del sistema con preview animado

#### Paso 1 · Objetivo y preparación

Al finalizar podrás usar `PredictiveBackHandler` para que el gesto de retroceso del sistema (swipe predictivo) muestre una previsualización coherente con lo que realmente va a pasar, en vez de prometer una navegación que luego se interrumpe con un diálogo inesperado.

**Conocimiento previo:** Temas 1 y 3 de este módulo.

#### Paso 2 · Contexto y caso real

**¿Por qué es importante?** La pantalla de edición de un pedido usa un `BackHandler` simple para mostrar un diálogo "¿Descartar cambios?" al presionar atrás; con el gesto predictivo de Android 14+ (deslizar desde el borde), el usuario ve la animación del sistema mostrando que "va a volver" a la pantalla anterior, pero al completar el gesto aparece el diálogo en vez de navegar — una discrepancia confusa entre lo que la previsualización prometía y lo que realmente ocurrió.

#### Paso 3 · Teoría con analogía

**Conceptos clave:** Predictive Back, `PredictiveBackHandler`, `BackEventCompat`, `enableOnBackInvokedCallback`, previsualización progresiva del gesto.

`BackHandler` (el callback simple) se ejecuta solo al COMPLETAR el gesto de retroceso, sin participar de la fase de previsualización; `PredictiveBackHandler` expone un `Flow<BackEventCompat>` que permite observar el progreso del gesto mientras el dedo todavía se desliza, decidiendo en tiempo real si mostrar la preview normal del sistema o reaccionar distinto cuando el gesto se completa.

**Analogía:** un semáforo en cuenta regresiva que muestra cuánto falta para cruzar es como la previsualización predictiva: informa progresivamente lo que está por pasar, y esa información debe ser honesta con el resultado final — lo contrario de una luz que simplemente cambia a rojo sin ningún aviso.

**Diagrama:**

```mermaid
sequenceDiagram
  participant U as Usuario (gesto)
  participant S as Sistema Android
  participant A as App
  U->>S: desliza desde el borde
  S->>A: Flow BackEventCompat (progreso)
  A->>S: anima transición propia
  U->>S: completa el gesto
  S->>A: decide: diálogo o navegar
```

#### Paso 4 · Demostración guiada desde cero

Crea `app/src/main/kotlin/com/academia/android/EdicionPedidoScreen.kt`:

```kotlin
PredictiveBackHandler { progress: Flow<BackEventCompat> ->
    try {
        progress.collect { backEvent ->
            // el usuario todavía está deslizando: solo animamos, no decidimos todavía
        }
        // el gesto se completó: ahora decidimos qué hacer realmente
        if (hayCambiosSinGuardar) mostrarDialogoDescartar() else navController.popBackStack()
    } catch (e: CancellationException) {
        // el usuario canceló el gesto a mitad de camino (deslizó y volvió)
    }
}
```

**Ejecuta el ejemplo** (en un proyecto Android con Gradle, compila e instala en un emulador):

```bash
./gradlew assembleDebug
./gradlew test
```


**Resultado esperado:** mientras el usuario desliza desde el borde, la UI participa del progreso del gesto; solo al completarlo efectivamente se decide mostrar el diálogo o navegar, evitando que la previsualización del sistema prometa algo que no ocurre.

**Fallo deliberado:** reemplazá `PredictiveBackHandler` por un `BackHandler` simple que directamente llama a `mostrarDialogoDescartar()` sin participar del flujo de progreso. Compila el proyecto con Gradle (`./gradlew :app:compileDebugKotlin`) para confirmar que compila, y probá el gesto en un dispositivo o emulador con Android 14+: el sistema muestra su previsualización genérica de "volviendo atrás" durante todo el deslizamiento, y solo al completarlo aparece el diálogo en vez de la navegación que la preview sugería — diagnostica confirmando la discrepancia confusa que este Tema busca evitar.

#### Paso 5 · Práctica guiada

Verificá en `app/src/main/AndroidManifest.xml` que la etiqueta `<application>` declare `android:enableOnBackInvokedCallback="true"`. **Pista:** sin ese flag, ni `BackHandler` ni `PredictiveBackHandler` participan del sistema de retroceso predictivo en absoluto, y la app cae de vuelta al comportamiento heredado sin ninguna previsualización, aunque el código Kotlin sea correcto.

#### Paso 6 · Práctica independiente

Agregá el manejo explícito de `CancellationException` en el `catch` del Paso 4 (si todavía no lo tenías) y documentá en una frase qué le pasaría a `hayCambiosSinGuardar` si el usuario desliza el gesto hasta la mitad y luego vuelve a soltar sin completarlo: ¿se ejecuta algo del bloque posterior a `progress.collect`?

#### Paso 7 · Cierre y evidencia

Ya usás `PredictiveBackHandler` para que la previsualización del gesto coincida con el resultado real, confirmado al reproducir la discrepancia con un `BackHandler` simple y corregirla. Esto cierra el módulo de navegación; el siguiente módulo del track aborda networking con Retrofit. **Evidencia:** entrega el `PredictiveBackHandler` funcionando, la discrepancia de previsualización reproducida con `BackHandler` simple, y la verificación del flag del manifest. Fuentes oficiales: [Android Developers — Predictive back gesture](https://developer.android.com/guide/navigation/custom-back/predictive-back-gesture) y [Android Developers — Support predictive back](https://developer.android.com/guide/navigation/custom-back/predictive-back-gesture#support-predictive).

**Errores comunes:** usar `BackHandler` simple para interacciones donde el resultado del gesto no es simplemente "navegar atrás" (confirmaciones, diálogos); olvidar `android:enableOnBackInvokedCallback="true"` en el manifest, dejando la app sin gesto predictivo en absoluto; no manejar `CancellationException` para el caso de un gesto cancelado a mitad de camino.

**Cuándo no usarlo:** para una pantalla donde "volver atrás" siempre significa exactamente navegar a la pantalla anterior, sin ningún diálogo ni lógica condicional, el `BackHandler` simple es suficiente y `PredictiveBackHandler` agrega complejidad sin ningún beneficio real.

**Transferencia al proyecto integrador «Aplicación del repartidor Android»:** Aplica `PredictiveBackHandler` a la pantalla de confirmación de entrega: si el conductor desliza para volver con una foto de evidencia sin guardar, la previsualización del gesto debe coincidir con el diálogo real de "¿descartar evidencia?", nunca con una navegación silenciosa que pierda la captura.

---


## Laboratorio práctico

**Objetivo del laboratorio:** construir una app con al menos 4 pantallas, navegación con argumentos y un bottom navigation.

**Requisitos previos:** Módulo 2 completado.

| Paso | Acción | Código/Comando | Explicación |
|---|---|---|---|
| 1 | Definir un `NavHost` con al menos 4 destinos | Ver Tema 1 | Navega con `NavController` |
| 2 | Pasar un argumento tipado (ej. ID de tarea) | Ver Tema 2 | De lista a detalle |
| 3 | Configurar un deep link hacia la pantalla de detalle | Ver Tema 2 | Verifica desde un link externo |
| 4 | Implementar bottom navigation con 3 secciones | Ver Tema 3 | Cada una con su propio stack |
| 5 | Usar `PredictiveBackHandler` en una pantalla con cambios sin guardar | Ver Tema 4 | La preview del gesto coincide con el resultado real |

**Verificación:** el laboratorio se considera exitoso si navegar profundamente en una sección y cambiar a otra mediante la bottom bar preserva ese historial al regresar, si el deep link configurado abre directamente la pantalla de detalle correcta con el argumento ya resuelto, y si el gesto predictivo de retroceso en la pantalla de edición no produce una discrepancia entre la preview del sistema y el resultado real.

**Errores comunes y soluciones**

- **Interpolar argumentos sin declarar su tipo con `navArgument`.** Declara el tipo explícitamente para validación y extracción automática.
- **Usar un único `NavHost` plano para todas las secciones de una bottom navigation.** Anida un `NavHost` independiente por sección para preservar su historial por separado.
- **Olvidar registrar el `uriPattern` del deep link en el manifiesto (intent-filter) además del grafo de navegación.** Ambos son necesarios para que el sistema operativo enrute la URI hacia la app.
- **Usar `BackHandler` simple donde el resultado del gesto no es "navegar atrás" directamente.** Usa `PredictiveBackHandler` para que la previsualización del sistema coincida con el resultado real.

---
