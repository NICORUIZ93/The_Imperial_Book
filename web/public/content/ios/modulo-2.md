# Módulo 2: Estado y data flow


## Aprende construyendo


### Tema 1: @State y @Binding · Básico · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a conectar TarjetaEnvio (Módulo 1) a un interruptor de estado "entregado/en ruta" que el padre posee y el hijo solo puede modificar, nunca copiar. Prerrequisitos: Módulo 1 completo.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
xcodebuild -scheme EstadoDemo -destination 'generic/platform=iOS Simulator' build
```

</details>

### Tema 2: @Observable · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a crear un EnviosViewModel con @Observable y a confirmar que solo las vistas que leen la propiedad que cambió se redibujan. Prerrequisitos: Tema 1 de este módulo.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```swift
@Observable
class TareasViewModel {
    var tareas: [Tarea] = []   // solo las vistas que LEEN `tareas` específicamente se redibujan al cambiar
}
```

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

```bash
xcodebuild -scheme EstadoDemo -destination 'generic/platform=iOS Simulator' build
```

</details>

### Tema 3: @Environment y identidad vs valor · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a inyectar un ServicioAPI de RutaFlow vía @Environment, llegando a una vista profunda sin pasarlo por cada inicializador intermedio. Prerrequisitos: Tema 2 de este módulo.

#### ► CÓMO FUNCIONA
```mermaid
flowchart TD
    A["WindowGroup\n.environment(ServicioAPI())"] -.->|disponible para cualquier descendiente| B["ListaEnvios\n(no lo usa)"]
    B -.->|sin reenviar manualmente| C["VistaIntermedia\n(no lo usa)"]
    C -.->|sin reenviar manualmente| D["DetalleEnvio\n@Environment(ServicioAPI.self)"]
```

#### ► REGLA PRÁCTICA
Usa `@Environment` para inyectar una dependencia que vistas intermedias no usan directamente y no deberían reenviar manualmente por cada inicializador; si solo una o dos vistas cercanas la necesitan, pasarla explícitamente por el inicializador sigue siendo más claro.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```swift
WindowGroup { ContentView().environment(ServicioAPI()) }
// Cualquier vista descendiente puede leer @Environment(ServicioAPI.self) sin pasar por cada nivel intermedio
```

```mermaid
flowchart TD
    A["WindowGroup\n.environment(ServicioAPI())"] -.->|disponible para cualquier descendiente| B["ListaEnvios\n(no lo usa)"]
    B -.->|sin reenviar manualmente| C["VistaIntermedia\n(no lo usa)"]
    C -.->|sin reenviar manualmente| D["DetalleEnvio\n@Environment(ServicioAPI.self)"]
```

```swift
import SwiftUI
import Observation

@Observable
class ServicioAPI {
    var base = "https://api.rutaflow.dev"
}

@main
struct EstadoDemoApp: App {
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

```bash
xcodebuild -scheme EstadoDemo -destination 'generic/platform=iOS Simulator' build
```

</details>
