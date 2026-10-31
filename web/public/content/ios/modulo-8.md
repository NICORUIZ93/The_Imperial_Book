# Módulo 8: Arquitectura MVVM


**Proyecto del módulo:** crea una vez en Xcode (File ▸ New ▸ Project ▸ App, interfaz SwiftUI) un proyecto llamado `RutaFlowApp`; cada tema reutiliza ese proyecto, pega su código y compila.

## Aprende construyendo

### Tema 1: De una vista "gorda" a MVVM

#### Paso 1 · Objetivo y preparación
Al finalizar vas a extraer la lógica de carga de `ListaEnvios` (que hoy llama a `ServicioAPI` y decide qué hacer con la respuesta directamente en su `body`) hacia un `EnviosViewModel` dedicado. Prerrequisitos: Módulo 2 completo (`@Observable`, `@Environment`).

#### Paso 2 · Contexto y caso real
`ListaEnvios` ya funciona, pero nadie puede escribir una prueba para "si `ServicioAPI` falla, la lista queda vacía sin crashear" sin renderizar la vista completa — esa decisión vive mezclada con la descripción de la UI.

#### Paso 3 · Teoría, modelo mental y analogía
MVVM separa la vista (cómo se ve) del ViewModel (cómo se comporta); la vista solo lee propiedades del ViewModel e invoca sus funciones, nunca decide qué hacer con una respuesta de red — un mostrador de atención al público no fija la política de reembolsos, solo la aplica.

#### Paso 4 · Demostración guiada desde cero
```swift
// Antes: ListaEnvios hace fetching y decide qué hacer con el resultado en su body
struct ListaEnvios: View {
    @State private var envios: [String] = []
    @Environment(ServicioAPI.self) var servicio
    var body: some View {
        List(envios, id: \.self) { Text($0) }
            .task { envios = (try? await servicio.obtenerEnvios()) ?? [] }
    }
}

// Después: la vista solo describe, el ViewModel orquesta
@Observable
class EnviosViewModel {
    var envios: [String] = []
    private let servicio: ServicioAPI
    init(servicio: ServicioAPI) { self.servicio = servicio }
    func cargar() async {
        envios = (try? await servicio.obtenerEnvios()) ?? []
    }
}

struct ListaEnvios: View {
    @State var vm: EnviosViewModel
    var body: some View {
        List(vm.envios, id: \.self) { Text($0) }
            .task { await vm.cargar() }
    }
}
```

**Ejecuta el ejemplo:**

```bash
xcodebuild -scheme RutaFlowApp -destination 'platform=iOS Simulator,name=iPhone 15' build
```
Luego corre con ⌘R en el simulador, o abre el canvas de Preview con ⌥⌘↵.

Resultado esperado: `ListaEnvios` ya no referencia `ServicioAPI` ni decide qué hacer si falla — esa decisión vive en `EnviosViewModel.cargar()`, que ahora se puede invocar y probar sin renderizar ninguna vista.

#### Paso 5 · Práctica guiada
Pista: agregale a `cargar()` un `print` de depuración que inspeccione `UIApplication.shared` "para loguear el estado de la app" — ese es el fallo deliberado: ahora el ViewModel depende de un tipo de UIKit que no existe en un entorno de test puro de lógica de negocio, y cualquier prueba de `cargar()` sin un runtime de UI completo deja de compilar.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 quitando la referencia a `UIApplication`, y escribí una prueba de `EnviosViewModel` que lo construya con un `ServicioAPI` falso (que devuelve una lista fija de guías) y confirme que `envios` queda poblado después de `cargar()`, sin ningún `import SwiftUI` en el archivo de test.

#### Paso 7 · Cierre
Entregá el ViewModel extraído del Paso 4, el acoplamiento a UIKit detectado en el Paso 5, y la prueba sin SwiftUI del Paso 6; explicá por qué una vista que decide qué hacer con el resultado de una llamada de red es tan difícil de testear como un ViewModel que importa UIKit en su lógica de negocio. Siguiente paso: estudia cómo organizar las carpetas del proyecto por capa. Errores comunes: ViewModel que importa SwiftUI, lógica de negocio en el `body`, y pruebas que necesitan renderizar la vista completa. Fuentes oficiales: https://developer.apple.com/tutorials/swiftui y https://developer.apple.com/documentation/observation.
**¿Por qué es importante?** Porque separar qué se ve de cómo se comporta permite probar la lógica de negocio sin renderizar ninguna vista.
**Conceptos clave:** la vista describe, el ViewModel orquesta y decide.

Una vista que mezcla fetching de red, decisiones sobre errores y formateo de datos directamente en su `body` se vuelve progresivamente difícil de mantener y, más grave aún, imposible de testear sin renderizar la vista completa; extraer esa lógica a un `@Observable` ViewModel deja a la vista con la única responsabilidad de describir cómo se ve el estado actual (`vm.envios`), mientras el ViewModel decide qué hacer con cada resultado de `ServicioAPI` — el mismo problema y la misma solución arquitectónica estudiada de forma independiente en Android con `ViewModel` (Módulo 4 de ese track) y en React con hooks personalizados (Módulo 3 del track de React).

**Analogía:** una vista que hace fetching, decide sobre errores y formatea datos es como un mostrador de atención al público que además fija la política de reembolsos y audita el inventario: funciona si el local es pequeño, pero se vuelve insostenible cuando el negocio crece; separar esas responsabilidades entre el mostrador (vista) y la oficina que define la política (ViewModel) es lo que MVVM logra.

**Código del ejemplo:**

```swift
struct ListaEnvios: View {
    @State var vm: EnviosViewModel  // la vista solo describe, no decide
    var body: some View { List(vm.envios, id: \.self) { Text($0) } }
}
```

* Código: `examples/rutaflow/ios/ContentView.swift`
* Proyecto: en el proyecto integrador RutaFlow, separa la vista de detalle en vista, modelo y servicio.

**Límites y decisión de uso:** MVVM no exige que cada vista tenga una clase nueva ni que toda transformación pase por un ViewModel. Extrae reglas y efectos que necesiten pruebas; conserva presentación simple en la vista cuando no introduce dependencias ocultas.

### Tema 2: Capas del proyecto e inyección por inicializador

#### Paso 1 · Objetivo y preparación
Al finalizar vas a organizar `EnviosViewModel` y `ServicioAPI` en carpetas por capa, e inyectar `ServicioAPI` por el inicializador del ViewModel en vez de crearlo adentro. Prerrequisitos: Tema 1 de este módulo.

#### Paso 2 · Contexto y caso real
Si `EnviosViewModel` creara su propio `ServicioAPI()` internamente (`private let servicio = ServicioAPI()`), ningún test podría sustituirlo por una versión falsa — el ViewModel solo podría probarse contra la red real.

#### Paso 3 · Teoría, modelo mental y analogía
Separar el proyecto en carpetas por capa (Vistas/ViewModels/Servicios/Dominio) hace visible la arquitectura en la estructura de archivos; inyectar por inicializador permite construir el mismo ViewModel con dependencias distintas según el contexto (producción vs. test).

#### Paso 4 · Demostración guiada desde cero
```swift
// Vistas/ListaEnvios.swift      — SwiftUI puro
// ViewModels/EnviosViewModel.swift
// Servicios/ServicioAPI.swift   — networking real
// Dominio/Envio.swift           — modelo puro

@Observable
class EnviosViewModel {
    var envios: [String] = []
    private let servicio: ServicioAPI
    init(servicio: ServicioAPI = ServicioAPI()) {
        self.servicio = servicio
    }
    func cargar() async {
        envios = (try? await servicio.obtenerEnvios()) ?? []
    }
}
```

**Ejecuta el ejemplo:**

```bash
xcodebuild -scheme RutaFlowApp -destination 'platform=iOS Simulator,name=iPhone 15' build
```
Luego corre con ⌘R en el simulador, o abre el canvas de Preview con ⌥⌘↵.

Resultado esperado: en producción, `EnviosViewModel()` usa el valor por defecto `ServicioAPI()` sin que nadie lo especifique; en un test, `EnviosViewModel(servicio: ServicioAPIFalso())` construye el mismo ViewModel con una implementación falsa, sin tocar una línea de `EnviosViewModel`.

#### Paso 5 · Práctica guiada
Pista: cambiá el inicializador a `init() { self.servicio = ServicioAPI() }`, sin parámetro — ese es el fallo deliberado: ahora ningún test puede sustituir `ServicioAPI` por una versión falsa, porque la dependencia se crea internamente y queda fija dentro del ViewModel.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 devolviendo el parámetro al inicializador, y movés `ServicioAPI` a su propia carpeta `Servicios/` y `Envio` (el modelo de datos) a `Dominio/` — confirmá que `ViewModels/` no importa nada de `Vistas/`, y que `Dominio/` no importa nada de `Servicios/`.

#### Paso 7 · Cierre
Entregá el inicializador con valor por defecto del Paso 4, la dependencia fija detectada en el Paso 5, y la estructura de carpetas del Paso 6; explicá por qué un valor por defecto en el inicializador (`servicio: ServicioAPI = ServicioAPI()`) no es lo mismo que un singleton global, aunque en producción ambos acaben usando "la misma" implementación real. Siguiente paso: estudia cuándo esta arquitectura simple no alcanza. Errores comunes: servicio creado dentro del ViewModel sin parámetro, carpetas organizadas por pantalla en vez de por capa, y Dominio que importa Servicios. Fuentes oficiales: https://developer.apple.com/documentation/swift y https://developer.apple.com/tutorials/swiftui.
**¿Por qué es importante?** Porque la inyección por inicializador permite sustituir dependencias en tests sin singletons globales difíciles de aislar.
**Conceptos clave:** inyección por inicializador, límites explícitos entre capas.

Organizar el proyecto en carpetas que reflejan estas responsabilidades (en vez de agrupar archivos solo por pantalla) hace visible la arquitectura directamente en la estructura del proyecto, y ayuda a que cualquier persona nueva en el equipo sepa dónde debería vivir código nuevo según su responsabilidad. Pasar `ServicioAPI` por el inicializador del ViewModel (con un valor por defecto que apunta a la implementación real) en vez de acceder a un singleton global (`ServicioAPI.shared`) permite sustituir esa dependencia por una falsa en tests sin ninguna configuración adicional — el mismo principio de inyección por constructor estudiado en Spring Boot (Módulo 0 de ese track) y en Hilt para Android (Módulo 7 de ese track).

**Analogía:** organizar el proyecto en carpetas por capa es como un edificio con señalización clara de qué sucede en cada piso, en vez de un espacio abierto sin ninguna distinción de función; inyectar por inicializador es como entregarle a cada empleado sus propias herramientas al contratarlo, en vez de que todos compartan un único almacén común sin control sobre qué toma cada uno.

**Implicación práctica:** La organización en capas hace visible la arquitectura en la estructura del proyecto; la inyección por inicializador permite sustituir `ServicioAPI` por una versión falsa en tests sin singletons globales.

**Código del ejemplo:**

```swift
init(servicio: ServicioAPI = ServicioAPI()) { self.servicio = servicio }
// Producción: EnviosViewModel()
// Test: EnviosViewModel(servicio: ServicioAPIFalso())
```

**Transferencia al proyecto integrador «Aplicación del repartidor iOS»:** Inyecta el repositorio de ruta por inicializador en el modelo de vista. Prueba con un fake que falla y verifica que la pantalla ofrece recuperación sin construir clientes de red dentro de body.

### Tema 3: Cuándo MVVM no alcanza

#### Paso 1 · Objetivo y preparación
Al finalizar vas a identificar en qué momento `EnviosViewModel` empieza a necesitar algo más que MVVM simple, usando como ejemplo una regla de negocio que se repite entre varios ViewModels de RutaFlow. Prerrequisitos: Temas 1 y 2 de este módulo.

#### Paso 2 · Contexto y caso real
Si `EnviosViewModel` y un futuro `DetalleEnvioViewModel` necesitan ambos calcular si un envío está "atrasado" (comparando su fecha estimada contra la fecha actual), esa regla de negocio se duplicaría en los dos ViewModels si no se extrae a ningún lado.

#### Paso 3 · Teoría, modelo mental y analogía
Cuando una regla de negocio se repite entre varios ViewModels, equipos suelen agregar una capa de "casos de uso" entre el ViewModel y el Servicio — cada caso de uso encapsula una sola operación de negocio reutilizable.

#### Paso 4 · Demostración guiada desde cero
```swift
// Antes: la regla "está atrasado" duplicada en dos ViewModels
class EnviosViewModel {
    func estaAtrasado(_ envio: Envio) -> Bool { envio.fechaEstimada < Date() }
}
class DetalleEnvioViewModel {
    func estaAtrasado(_ envio: Envio) -> Bool { envio.fechaEstimada < Date() } // copiada
}

// Después: un caso de uso reutilizable
struct EsEnvioAtrasado {
    func ejecutar(_ envio: Envio) -> Bool { envio.fechaEstimada < Date() }
}
class EnviosViewModel { private let esAtrasado = EsEnvioAtrasado() }
class DetalleEnvioViewModel { private let esAtrasado = EsEnvioAtrasado() }
```

**Ejecuta el ejemplo:**

```bash
xcodebuild -scheme RutaFlowApp -destination 'platform=iOS Simulator,name=iPhone 15' build
```
Luego corre con ⌘R en el simulador, o abre el canvas de Preview con ⌥⌘↵.

Resultado esperado: la regla de negocio vive en un solo lugar (`EsEnvioAtrasado`); si RutaFlow cambia la definición de "atrasado" (agregando, por ejemplo, un margen de tolerancia de 15 minutos), se corrige en un único archivo en vez de buscar cada copia dispersa entre ViewModels.

#### Paso 5 · Práctica guiada
Pista: agregá un tercer ViewModel (`ResumenRutaViewModel`) que vuelva a copiar `envio.fechaEstimada < Date()` directamente, "porque es solo una línea" — ese es el fallo deliberado: ahora hay tres copias de la misma regla, y agregar el margen de tolerancia exige recordar actualizar las tres, no una.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 haciendo que `ResumenRutaViewModel` también use `EsEnvioAtrasado`, y agregá el margen de tolerancia de 15 minutos solo dentro de `EsEnvioAtrasado.ejecutar` — confirmá que los tres ViewModels reflejan el nuevo comportamiento sin que ninguno haya cambiado su propio código.

#### Paso 7 · Cierre
Entregá la duplicación provocada en el Paso 5, la corrección centralizada del Paso 6, y una frase explicando en qué punto decidiste que la regla merecía su propio caso de uso en vez de quedarse copiada; mencioná también cuándo NO conviene: una regla usada en un solo ViewModel no necesita todavía esta capa. Siguiente paso: estudia testing con XCTest. Errores comunes: extraer un caso de uso para lógica usada en un solo lugar, duplicar reglas "porque es solo una línea", y adoptar arquitecturas complejas (como TCA) antes de que la app lo necesite genuinamente. Fuentes oficiales: https://developer.apple.com/documentation/swift y https://developer.apple.com/tutorials/swiftui.
**¿Por qué es importante?** Porque reconocer cuándo una regla se duplica evita tanto la sub-arquitectura (lógica copiada entre ViewModels) como la sobre-arquitectura (casos de uso para reglas usadas una sola vez).
**Conceptos clave:** caso de uso como regla de negocio reutilizable; límite entre MVVM simple y capas adicionales.

Para apps con varios ViewModels que comparten lógica de negocio sustancial, o con flujos de navegación complejos coordinados entre pantallas, algunos equipos adoptan además TCA (The Composable Architecture), una arquitectura de terceros que estructura estado y acciones de forma más explícita y testeable a gran escala, a costa de una curva de aprendizaje y un boilerplate inicial mayor que el MVVM simple de este módulo. Reconocer cuándo MVVM simple empieza a quedarse corto es una habilidad tan importante como saber implementarlo bien desde el principio: introducir complejidad arquitectónica antes de necesitarla también tiene un costo de mantenimiento.

**Analogía:** MVVM simple es la organización adecuada para un restaurante de tamaño mediano con roles claros; a medida que el negocio crece hasta ser una cadena con varias sucursales, se vuelve necesario agregar una oficina central de operaciones — algo que sería puro exceso de burocracia para el restaurante original pequeño.

**Implicación práctica:** Un caso de uso evita duplicar reglas de negocio entre ViewModels; adoptar TCA o capas adicionales antes de necesitarlas agrega complejidad sin beneficio real todavía.

**Diagrama:**

```
MVVM simple:        Vista ↔ ViewModel ↔ Servicio
MVVM + casos de uso: Vista ↔ ViewModel ↔ Caso de Uso ↔ Servicio (lógica de negocio reutilizable entre ViewModels)
```

**Diagrama: regla duplicada vs caso de uso compartido**

```mermaid
flowchart TD
    subgraph Antes["Antes: regla duplicada"]
        A1["EnviosViewModel.estaAtrasado()"]
        A2["DetalleEnvioViewModel.estaAtrasado()"]
    end
    subgraph Despues["Después: caso de uso único"]
        B1["EsEnvioAtrasado.ejecutar()"]
        B2["EnviosViewModel"] --> B1
        B3["DetalleEnvioViewModel"] --> B1
        B4["ResumenRutaViewModel"] --> B1
    end
```

En el proyecto integrador RutaFlow, `EsEnvioAtrasado` vive en `examples/ios-lab/Sources/RutaFlowLab/EnviosViewModel.swift`.

---


## Laboratorio práctico

**Objetivo del laboratorio:** reestructurar una app en capas (vista/viewmodel/datos) con dependencias inyectadas.

**Requisitos previos:** Módulo 7 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Extraer lógica de una vista gorda a un ViewModel | Ver Tema 1 | `@Observable`, sin lógica en la vista |
| 2 | Separar el proyecto en carpetas por capa | Ver Tema 2 | Vistas, ViewModels, Servicios, Dominio |
| 3 | Inyectar un servicio por inicializador | Ver Tema 2 | No un singleton global |
| 4 | Documentar un caso donde MVVM no alcanza | Ver Tema 3 | Ej. casos de uso o TCA |

**Verificación:** el laboratorio se considera exitoso si ninguna vista contiene lógica de fetching, validación o formateo directamente en su `body`, y si el ViewModel puede construirse en un test con un servicio fake sin ninguna configuración global adicional.

**Errores comunes y soluciones**

- **Dejar lógica de fetching o validación directamente en el `body` de una vista.** Extráela a un ViewModel dedicado.
- **Acceder a un servicio mediante un singleton global (`ServicioAPI.shared`) en vez de inyectarlo.** Dificulta sustituirlo en tests; inyéctalo por inicializador.
- **Adoptar TCA u otra arquitectura compleja antes de que la app la necesite genuinamente.** Introduce complejidad y boilerplate innecesario prematuramente.

---

* Código: `examples/rutaflow/ios/ContentView.swift`
* Proyecto: en el proyecto integrador RutaFlow, documenta un caso donde MVVM no basta y justifica la alternativa.
