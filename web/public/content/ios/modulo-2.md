# Módulo 2: Estado y data flow


## Aprende construyendo

### Tema 1: @State y @Binding

#### Paso 1 · Objetivo y preparación
Al finalizar vas a conectar `TarjetaEnvio` (Módulo 1) a un interruptor de estado "entregado/en ruta" que el padre posee y el hijo solo puede modificar, nunca copiar. Prerrequisitos: Módulo 1 completo.
#### Paso 2 · Contexto y caso real
Si la pantalla de detalle de un envío y la lista de envíos mostraran cada una su propia copia del estado "entregado", marcar la entrega en el detalle nunca actualizaría la lista — exactamente el bug que `@Binding` existe para evitar.
#### Paso 3 · Teoría, modelo mental y analogía
`@State` pertenece a la vista que lo declara; `@Binding` es una referencia hacia el estado de otra vista, nunca una copia — un apoderado con autorización para modificar la casa de otro, sin ser dueño de ella.

**Evidencia de aprendizaje:** entrega el `@Binding` compartido funcionando, el estado divergente provocado al reemplazarlo por un `@State` propio, y las tres vistas sincronizadas sin copia.
**Conceptos clave:** estado propio de una vista vs referencia mutable al estado de otra.

#### Cómo leer `@State`, `@Binding` y el prefijo `$`

En Swift, `@State` y `@Binding` son **property wrappers**, no decoradores genéricos. Un wrapper define cómo se almacena y se accede a una propiedad mediante `wrappedValue`; el compilador reescribe la declaración y sintetiza almacenamiento auxiliar. En `@State private var contador = 0`, leer o asignar `contador` opera sobre el valor envuelto. La expresión `$contador` accede al `projectedValue` que `State` expone: un `Binding<Int>` capaz de leer y escribir el mismo origen de verdad.

`@Binding var valor: Int` no crea almacenamiento ni copia el entero. Declara que la vista necesita recibir dos operaciones coordinadas —lectura y escritura— sobre un valor poseído en otro lugar. Por eso el inicializador espera `Binding<Int>` y se llama con `$contador`, no con `contador`. El error «Cannot convert value of type 'Int' to expected argument type 'Binding<Int>'» indica precisamente que se pasó el valor actual cuando el hijo necesitaba el vínculo proyectado.

**Decisión:** usa `@State` solo para estado transitorio que la vista posee; usa `@Binding` cuando el hijo debe modificar una fuente de verdad externa. No copies datos de dominio en otro `@State` para “sincronizarlos”: aparecerán dos fuentes de verdad que pueden divergir.

```swift
struct PantallaContador: View {
    @State private var contador = 0 // estado propio de esta vista
    var body: some View {
        BotonContador(valor: $contador) // $ crea un Binding hacia el estado del padre
    }
}

struct BotonContador: View {
    @Binding var valor: Int // referencia al estado del padre, no una copia
    var body: some View {
        Button("Sumar: \(valor)") { valor += 1 }
    }
}
```

`@State` declara una propiedad cuyo valor pertenece exclusivamente a esa vista específica, y cuyo cambio dispara automáticamente un redibujado de esa vista (y de cualquier sub-vista que dependa de ese valor); SwiftUI gestiona el almacenamiento persistente de ese valor entre redibujados por su cuenta, un mecanismo conceptualmente equivalente a `remember { mutableStateOf(...) }` en Jetpack Compose (Módulo 2 del track de Android), ambos resolviendo el mismo problema de "preservar estado local entre recomposiciones/redibujados sucesivos" en sus respectivos frameworks de UI declarativa.

`@Binding`, en contraste, no posee el valor sino que mantiene una referencia hacia el estado de otra vista (típicamente el padre, pasado con el prefijo `$` que crea el Binding a partir de un `@State`): modificar `valor` dentro de `BotonContador` efectivamente modifica el `@State` original en `PantallaContador`, exactamente el mismo principio de state hoisting estudiado en Jetpack Compose (Módulo 2 de Android) y en React (Módulo 2 de React), donde un componente hijo recibe el valor y una forma de notificar cambios, sin poseer el estado él mismo.

**Analogía:** `@State` es como el propietario de una casa que decide directamente sobre sus remodelaciones; `@Binding` es como un apoderado con autorización específica para tomar ciertas decisiones sobre esa misma casa en nombre del propietario, sin ser dueño de ella, pero con capacidad real de modificarla efectivamente.

**Código del ejemplo:**

```swift
struct PantallaContador: View {
    @State private var contador = 0
    var body: some View { BotonContador(valor: $contador) }
}
struct BotonContador: View {
    @Binding var valor: Int
}
```

* Código: `examples/rutaflow/ios/ContentView.swift`
* Proyecto: proyecto integrador RutaFlow
* Visualización: concepto mostrado en diagrama

**Límites y decisión de uso:** State conserva estado ligado a la identidad de la vista, no almacenamiento durable. Usa Binding para editar la fuente existente y persistencia para datos que deben sobrevivir al cierre; copiar valores en otra fuente puede desincronizarlos.

#### Paso 4 · Demostración guiada desde cero

Crea un proyecto SwiftUI desde cero. En macOS con Xcode instalado, créalo por línea de comandos y ábrelo:

```bash
mkdir EstadoDemo && cd EstadoDemo
# Genera un paquete Swift ejecutable (no requiere plantilla de Xcode)
swift package init --type executable --name EstadoDemo
swift --version   # confirma que tienes el toolchain de Swift
```

Para una app SwiftUI con interfaz, crea el proyecto en Xcode (`File ▸ New ▸ Project ▸ App`, interfaz SwiftUI) y reemplaza `ContentView.swift` con este contenido:

```swift
import SwiftUI

struct DetalleEnvio: View {
    @State private var entregado = false
    var body: some View {
        VStack {
            Text(entregado ? "Estado: Entregado" : "Estado: En ruta")
            ConfirmarEntregaBoton(entregado: $entregado)
        }
    }
}

struct ConfirmarEntregaBoton: View {
    @Binding var entregado: Bool
    var body: some View {
        Button(entregado ? "Entregado" : "Confirmar entrega") { entregado = true }
    }
}

#Preview {
    DetalleEnvio()
}
```

Ejecútalo y obsérvalo (en Xcode: ⌘R para el simulador, o ⌥⌘↵ para el canvas de Preview; por terminal, compila el esquema de la app):

```bash
xcodebuild -scheme EstadoDemo -destination 'platform=iOS Simulator,name=iPhone 15' build
```

**Resultado esperado:** al tocar "Confirmar entrega" dentro de `ConfirmarEntregaBoton`, el texto de `DetalleEnvio` cambia a "Estado: Entregado". Hay un solo valor `entregado` con dos puntos de acceso (el padre lo posee, el hijo lo modifica vía `$`), no dos copias sincronizándose. **Fallo deliberado:** mira el Paso 5 — al darle al hijo su propio `@State`, el texto del padre deja de cambiar.
#### Paso 5 · Práctica guiada
Pista: cambiá `ConfirmarEntregaBoton` para que declare su propio `@State private var entregado = false` en vez de recibir el `@Binding` — ese es el fallo deliberado: ahora tocar el botón cambia SU propia copia, pero `DetalleEnvio` nunca se entera, y las dos vistas muestran estados de entrega distintos para el mismo envío.
#### Paso 6 · Práctica independiente
Corregí el Paso 5 volviendo a `@Binding`, y agregá una tercera vista (`ResumenRuta`) que también reciba el mismo `$entregado` — confirmá que las tres vistas (detalle, botón, resumen) siempre muestran el mismo valor, sin que ninguna tenga que "sincronizarse" explícitamente con las otras.
#### Paso 7 · Cierre y evidencia
Entregá el `@Binding` compartido funcionando del Paso 4, el estado divergente del Paso 5, y las tres vistas sincronizadas del Paso 6; explicá por qué "copiar el valor a otro `@State` para tenerlo a mano" crea exactamente el bug que acabás de provocar. Siguiente paso: estudia async/await. Errores comunes: estado duplicado, Environment oculto, observar valor equivocado y referencias fuertes innecesarias. Fuentes oficiales: https://developer.apple.com/documentation/swiftui/state-and-data-flow y https://developer.apple.com/documentation/observation.
**¿Por qué es importante?** Porque copiar un valor compartido en un `@State` propio "para tenerlo a mano" crea dos fuentes de verdad que pueden divergir, exactamente el bug que `@Binding` existe para evitar al referenciar el estado del padre en vez de copiarlo.

### Tema 2: @Observable

#### Paso 1 · Objetivo y preparación
Al finalizar vas a crear un `EnviosViewModel` con `@Observable` y a confirmar que solo las vistas que leen la propiedad que cambió se redibujan. Prerrequisitos: Tema 1 de este módulo.
#### Paso 2 · Contexto y caso real
Si la pantalla de RutaFlow muestra tanto la lista de envíos como un contador de "envíos pendientes" separados, actualizar la lista no debería forzar un redibujado del contador si el contador no cambió.
#### Paso 3 · Teoría, modelo mental y analogía
`@Observable` redibuja solo las vistas que efectivamente leyeron la propiedad específica que cambió — un sistema de notificaciones que avisa solo a quien se suscribió a ese tema exacto, no a todo el canal.
#### Paso 4 · Demostración guiada desde cero

Continúa en el mismo proyecto SwiftUI del Tema 1 (o crea uno nuevo en Xcode: `File ▸ New ▸ Project ▸ App`, interfaz SwiftUI). Reemplaza `ContentView.swift`:

```swift
import SwiftUI
import Observation

@Observable
class EnviosViewModel {
    var envios: [String] = ["RF-4471", "RF-5002"]
    var conductorActivo: String = "c-891"
}

struct ListaEnvios: View {
    @State private var vm = EnviosViewModel()
    var body: some View {
        VStack {
            List(vm.envios, id: \.self) { Text($0) }
            Button("Cambiar conductor") { vm.conductorActivo = "c-999" }
        }
    }
}

#Preview {
    ListaEnvios()
}
```

Ejecútalo (en Xcode: ⌘R para el simulador, o ⌥⌘↵ para el canvas de Preview; por terminal, compila el esquema con `xcodebuild`):

```bash
xcodebuild -scheme EstadoDemo -destination 'platform=iOS Simulator,name=iPhone 15' build
```

**Resultado esperado:** `ListaEnvios` solo lee `vm.envios` en su `body`. Al tocar "Cambiar conductor" (que modifica `vm.conductorActivo`), la lista NO se redibuja, porque nunca leyó esa propiedad. Para comprobarlo, añade temporalmente `let _ = Self._printChanges()` al inicio del `body` y observa en la consola de Xcode que no se imprime un recálculo al cambiar el conductor. **Fallo deliberado:** mira el Paso 5 — al leer `conductorActivo` en el `body` "para tenerlo a mano", la lista empieza a redibujarse de más.
#### Paso 5 · Práctica guiada
Pista: agregá `Text(vm.conductorActivo)` dentro del `body` de `ListaEnvios` "solo para tenerlo a mano", sin usarlo realmente en la lógica visible — ese es el fallo deliberado: ahora `ListaEnvios` SÍ se redibuja cada vez que `conductorActivo` cambia, aunque la lista de envíos en sí no haya cambiado, porque `@Observable` rastrea exactamente qué leíste, no qué "parece que vas a necesitar".
#### Paso 6 · Práctica independiente
Quitá el `Text(vm.conductorActivo)` innecesario del Paso 5, y agregá una segunda vista `ContadorPendientes` que lea solo `vm.envios.count` — confirmá que ninguna de las dos vistas se redibuja de más cuando cambia una propiedad que la otra no lee.
#### Paso 7 · Cierre y evidencia
Entregá el redibujado granular confirmado del Paso 4, el redibujado de más provocado del Paso 5, y las dos vistas independientes del Paso 6; explicá por qué `@Observable` mejora sobre el viejo `ObservableObject`+`@Published`, que notificaba a cualquier observador del objeto completo. Siguiente paso: estudia async/await. Errores comunes: estado duplicado, Environment oculto, observar valor equivocado y referencias fuertes innecesarias. Fuentes oficiales: https://developer.apple.com/documentation/swiftui/state-and-data-flow y https://developer.apple.com/documentation/observation.
**¿Por qué es importante?** Porque `@Observable` redibuja únicamente las vistas que efectivamente leyeron la propiedad que cambió, evitando la sobre-notificación del viejo `ObservableObject`+`@Published`, que redibujaba a cualquier observador del objeto completo.
**Evidencia de aprendizaje:** entrega el redibujado granular confirmado, el redibujado de más provocado al leer una propiedad sin usarla, y las dos vistas independientes que no se redibujan entre sí.
**Conceptos clave:** redibujado granular basado en la propiedad específica leída, no en el objeto completo.

```swift
@Observable
class TareasViewModel {
    var tareas: [Tarea] = []
}

struct PantallaTareas: View {
    @State private var viewModel = TareasViewModel()
    var body: some View { List(viewModel.tareas) { Text($0.titulo) } }
}
```

`@Observable` (el framework de Observation moderno de Swift) reemplaza al patrón anterior `ObservableObject` + `@Published`, con una mejora de rendimiento significativa: SwiftUI, con `@Observable`, solo redibuja las vistas que efectivamente leen la propiedad específica que cambió, en vez de redibujar cualquier vista que simplemente observe el objeto completo (el comportamiento del modelo anterior basado en `@Published`, donde cambiar cualquier propiedad publicada notificaba a todos los observadores del objeto entero, sin distinguir si esa vista específica leía o no esa propiedad en particular).

Esta granularidad de redibujado bajo `@Observable` es análoga a la optimización de "skippability" en Jetpack Compose (Módulo 10 del track de Android), donde Compose evita recomponer un composable si sus parámetros efectivamente relevantes no cambiaron, aunque el mecanismo interno de detección sea distinto (Compose analiza parámetros de entrada, `@Observable` rastrea qué propiedades específicas de un objeto observable se leyeron durante el último `body`).

**Analogía:** `@Observable` es como un sistema de notificaciones que avisa únicamente a quienes se suscribieron específicamente a un tema exacto de interés (una propiedad concreta), en vez de notificar a todos los suscriptores de un canal general cada vez que cualquier tema dentro de ese canal cambia, sin importar si les interesa ese tema específico o no.

**Código del ejemplo:**

```swift
@Observable
class TareasViewModel {
    var tareas: [Tarea] = []   // solo las vistas que LEEN `tareas` específicamente se redibujan al cambiar
}
```

* Código: `examples/rutaflow/ios/ContentView.swift`
* Proyecto: proyecto integrador RutaFlow
* Visualización: concepto mostrado en diagrama

**Límites y decisión de uso:** Observar cambios no establece una política de persistencia ni de concurrencia. Define quién posee el modelo y dónde puede mutarlo; una propiedad observable compartida sin esas reglas puede seguir produciendo estados incoherentes.

### Tema 3: @Environment y identidad vs valor

#### Paso 1 · Objetivo y preparación
Al finalizar vas a inyectar un `ServicioAPI` de RutaFlow vía `@Environment`, llegando a una vista profunda sin pasarlo por cada inicializador intermedio. Prerrequisitos: Tema 2 de este módulo.
#### Paso 2 · Contexto y caso real
Si `DetalleEnvio` está anidada tres niveles dentro de `ListaEnvios`, que a su vez está dentro de la pantalla principal, pasar `ServicioAPI` manualmente por cada inicializador intermedio que no lo usa directamente sería puro acoplamiento sin beneficio.
#### Paso 3 · Teoría, modelo mental y analogía
`@Environment` es la electricidad disponible en cualquier toma del edificio: cualquier vista descendiente se "enchufa" sin que nadie tienda un cable manual desde la planta de generación hasta cada habitación.

**Evidencia de aprendizaje:** entrega la inyección funcionando a través de varios niveles, el crash reproducido por ambiente faltante, y la vista intermedia que no necesita conocer la dependencia.
**Conceptos clave:** inyección de dependencias sin pasar manualmente por cada inicializador.

```swift
struct MiApp: App {
    var body: some Scene {
        WindowGroup { ContentView().environment(ServicioAPI()) }
    }
}

struct ContentView: View {
    @Environment(ServicioAPI.self) var servicio // inyectado sin pasar por cada inicializador
}
```

`@Environment` inyecta una dependencia disponible para cualquier vista descendiente en el árbol, sin necesidad de pasarla explícitamente a través de cada inicializador intermedio de vistas que no la usan directamente pero que se encuentran en el camino jerárquico hacia una vista descendiente que sí la necesita (un problema conocido como "prop drilling" en otros ecosistemas de UI declarativa, como React, donde Context API resuelve exactamente el mismo problema, Módulo 5 del track de React); esto es especialmente valioso en apps con árboles de vistas profundos, donde pasar una dependencia manualmente por cada nivel intermedio sería tedioso y añadiría acoplamiento innecesario a vistas que no la consumen directamente.

La distinción entre identidad y valor en SwiftUI (relacionada con el `struct` vs `class` del Módulo 0) determina cómo SwiftUI decide si una vista es "la misma" entre dos renderizados sucesivos o una vista completamente nueva: esta decisión afecta directamente si el estado (`@State`) de esa vista se preserva o se reinicia, un mecanismo importante de entender al trabajar con listas donde el orden o la identidad de los elementos puede cambiar dinámicamente.

**Analogía:** `@Environment` es como la electricidad disponible en cualquier toma de corriente de un edificio entero, sin necesidad de tender un cable manual específico desde la planta de generación hasta cada dispositivo individual que la necesita: cualquier habitación puede simplemente "enchufarse" al servicio ya disponible en el ambiente general.

**¿Por qué es importante?** `@Environment` evita el "prop drilling" de pasar una dependencia manualmente por cada inicializador intermedio, un problema resuelto de forma análoga por Context API en React; la identidad de una vista determina si su estado se preserva o se reinicia entre renderizados sucesivos.

**Código del ejemplo:**

```swift
WindowGroup { ContentView().environment(ServicioAPI()) }
// Cualquier vista descendiente puede leer @Environment(ServicioAPI.self) sin pasar por cada nivel intermedio
```

**Diagrama: @Environment vs prop drilling**

```mermaid
flowchart TD
    A["WindowGroup\n.environment(ServicioAPI())"] -.->|disponible para cualquier descendiente| B["ListaEnvios\n(no lo usa)"]
    B -.->|sin reenviar manualmente| C["VistaIntermedia\n(no lo usa)"]
    C -.->|sin reenviar manualmente| D["DetalleEnvio\n@Environment(ServicioAPI.self)"]
```

En el proyecto integrador RutaFlow, `ServicioAPI` vive en `examples/rutaflow/ios/ContentView.swift`. Límite de la decisión: `@Environment` no conviene para una dependencia que solo necesita una única vista puntual y cercana a la raíz — ahí pasarla directamente por el inicializador es más simple y explícito; reservá `@Environment` específicamente cuando la dependencia debe atravesar varios niveles de vistas intermedias que no la usan.

---

#### Paso 4 · Demostración guiada desde cero

En el mismo proyecto SwiftUI, reemplaza el archivo de la app (`<NombreApp>App.swift`) y `ContentView.swift` con este contenido completo:

```swift
import SwiftUI
import Observation

@Observable
class ServicioAPI {
    var base = "https://api.rutaflow.dev"
}

@main
struct MiApp: App {
    var body: some Scene {
        WindowGroup { ListaEnvios().environment(ServicioAPI()) }
    }
}

struct ListaEnvios: View {           // no usa ServicioAPI, solo contiene al hijo
    var body: some View { DetalleEnvio() }
}

struct DetalleEnvio: View {
    @Environment(ServicioAPI.self) var servicio
    var body: some View { Text("Conectado a: \(servicio.base)") }
}
```

Ejecútalo (en Xcode: ⌘R para el simulador; por terminal, compila el esquema):

```bash
xcodebuild -scheme EstadoDemo -destination 'platform=iOS Simulator,name=iPhone 15' build
```

**Resultado esperado:** la pantalla muestra "Conectado a: https://api.rutaflow.dev". `DetalleEnvio` leyó `ServicioAPI` directamente del ambiente aunque `ListaEnvios` (la vista intermedia) nunca lo recibió ni lo reenvió. **Fallo deliberado:** mira el Paso 5 — al quitar `.environment(ServicioAPI())` del `WindowGroup`, la app compila pero crashea al arrancar, porque no hay ningún `ServicioAPI` en el ambiente que leer.
#### Paso 5 · Práctica guiada
Pista: quitá `.environment(ServicioAPI())` del `WindowGroup` pero dejá `@Environment(ServicioAPI.self) var servicio` en `DetalleEnvio` — ese es el fallo deliberado: en tiempo de ejecución, SwiftUI no encuentra ningún `ServicioAPI` inyectado en el ambiente y la app crashea al intentar leer `servicio`, un error silencioso en tiempo de compilación que solo aparece al correr.
#### Paso 6 · Práctica independiente
Corregí el Paso 5 restaurando la inyección, y agregá una segunda vista intermedia entre `ListaEnvios` y `DetalleEnvio` que NO lea `ServicioAPI` en absoluto — confirmá que esa vista intermedia no necesita saber nada sobre `ServicioAPI` para que `DetalleEnvio` siga funcionando.
#### Paso 7 · Cierre y evidencia
Entregá la inyección funcionando a través de varios niveles del Paso 4, el crash por ambiente faltante del Paso 5, y la vista intermedia ignorante de la dependencia del Paso 6; explicá por qué esto resuelve el mismo "prop drilling" que Context API resuelve en React. Siguiente paso: estudia async/await. Errores comunes: estado duplicado, Environment oculto, observar valor equivocado y referencias fuertes innecesarias. Fuentes oficiales: https://developer.apple.com/documentation/swiftui/state-and-data-flow y https://developer.apple.com/documentation/observation.
**¿Por qué es importante?** Porque `@Environment` evita el "prop drilling" de pasar una dependencia manualmente por cada inicializador intermedio que no la usa, resolviendo en SwiftUI el mismo problema que Context API resuelve en React.

## Laboratorio práctico

**Objetivo del laboratorio:** construir un formulario con estado compartido entre vistas padre/hijo usando `@Binding`.

**Requisitos previos:** Módulo 1 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Usar `@State` para un contador local | Ver Tema 1 | Verifica el redibujado al cambiarlo |
| 2 | Pasarlo a una vista hija con `@Binding` | Ver Tema 1 | Modificarlo desde el hijo |
| 3 | Crear una clase `@Observable` compartida | Ver Tema 2 | Entre varias vistas |
| 4 | Inyectar un servicio vía `@Environment` | Ver Tema 3 | En vez de pasarlo manualmente |

**Verificación:** el laboratorio se considera exitoso si modificar el valor desde la vista hija (vía `@Binding`) actualiza correctamente el estado en la vista padre, y si el servicio inyectado vía `@Environment` es accesible desde una vista descendiente sin pasar por inicializadores intermedios.

**Errores comunes y soluciones**

- **Usar `@State` en la vista hija en vez de `@Binding` cuando se necesita modificar el estado del padre.** `@State` crea una copia local independiente; usa `@Binding` para una referencia real.
- **Seguir usando `ObservableObject` + `@Published` en código nuevo.** Prefiere `@Observable` para mejor rendimiento de redibujado granular.
- **Pasar una dependencia manualmente por cada inicializador intermedio.** Usa `@Environment` para evitar el prop drilling.

---

* Código: `examples/rutaflow/ios/ContentView.swift`
* Proyecto: proyecto integrador RutaFlow
* Visualización: concepto mostrado en diagrama
