# Módulo 3: Navegación


**Proyecto del módulo:** para cada práctica, parte de una carpeta vacía y crea en Xcode (File ▸ New ▸ Project ▸ App, interfaz SwiftUI) un proyecto llamado `RutaFlowApp`; escribe manualmente todos los archivos indicados y compila, sin usar proyectos ya preparados.

## Aprende construyendo


### Tema 1: NavigationStack y NavigationPath · Básico · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a navegar programáticamente de la lista de envíos al DetalleEnvio (Módulo 2) usando NavigationPath, sin depender de que el usuario toque una fila. Prerrequisitos: Módulo 2 completo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a navegar programáticamente de la lista de envíos al DetalleEnvio (Módulo 2) usando NavigationPath, sin depender de que el usuario toque una fila.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
`NavigationStack` con `.navigationDestination(for:)` declara qué vista corresponde a cada tipo; `NavigationPath` deja manipular ese stack desde código, como un GPS que salta directamente a un punto de la ruta en vez de seguir letrero por letrero.

**¿Por qué es importante?** Porque `NavigationPath` permite manipular el stack de navegación completo desde código (agregar, resetear), habilitando deep links y flujos complejos que serían difíciles de expresar solo con `NavigationLink` anidados.
**Conceptos clave:** navegación declarada por tipo de dato, manipulable programáticamente.

```swift
NavigationStack(path: $path) {
    ListaTareasView()
        .navigationDestination(for: Tarea.self) { tarea in DetalleTareaView(tarea: tarea) }
}
```

`NavigationStack` gestiona un stack de navegación completo, con `.navigationDestination(for:)` declarando qué vista corresponde a cada tipo de dato que se agregue al stack (aquí, `Tarea`); esto reemplaza el modelo más antiguo de `NavigationView` con `NavigationLink` anidados directamente en cada vista, que requería estructurar la jerarquía de navegación de forma implícita a través de la composición de vistas, dificultando la navegación programática o los flujos complejos que no siguen simplemente el camino natural de taps del usuario.

```swift
path.append(tarea) // navega programáticamente, sin depender de NavigationLink anidados
```

`NavigationPath` (o un array tipado equivalente) permite manipular el stack de navegación completo desde código imperativo: agregar (`append`), quitar (`removeLast`), o resetear completamente el stack (asignando un array vacío), habilitando casos de uso que serían difíciles de expresar con `NavigationLink` puro, como responder a un deep link entrante navegando directamente varios niveles de profundidad de una sola vez, o implementar un flujo de "volver al inicio" desde cualquier punto profundo del stack.

**Analogía:** `NavigationStack` con `NavigationPath` es como un sistema de coordenadas GPS que permite saltar directamente a cualquier punto de una ruta con instrucciones programáticas explícitas, en vez de depender únicamente de seguir letrero por letrero (`NavigationLink`) el camino predefinido de una sola dirección posible.

**Código del ejemplo:**

```swift
NavigationStack(path: $path) {
    ListaTareasView()
        .navigationDestination(for: Tarea.self) { tarea in DetalleTareaView(tarea: tarea) }
}
path.append(tarea) // push programático
```

* Código: escribe la práctica en `ContentView.swift` de tu propio proyecto `RutaFlowApp`.
* Proyecto: en el proyecto integrador RutaFlow, navega del listado al detalle de envío con NavigationStack.

**Límites y decisión de uso:** La pila de navegación representa destinos, no autorización sobre sus datos. Guarda identidades estables en lugar de objetos vivos y valida una ruta restaurada: el recurso pudo eliminarse o dejar de pertenecer al usuario.

**Dónde se rompe la analogía:** el modelo simplifica la realidad; en producción influyen escala, fallos, costo y contexto.

#### ► CÓMO FUNCIONA
1. Identifica el problema que navigationstack y navigationpath resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| NavigationStack y NavigationPath se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar NavigationStack y NavigationPath | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses navigationstack y navigationpath por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: navigationstack y navigationpath funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- NavigationStack y NavigationPath existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve navigationstack y navigationpath en tu contexto?
2. ¿Cómo sabrías que navigationstack y navigationpath no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar navigationstack y navigationpath?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```swift
NavigationStack(path: $path) {
    ListaTareasView()
        .navigationDestination(for: Tarea.self) { tarea in DetalleTareaView(tarea: tarea) }
}
```

```swift
path.append(tarea) // navega programáticamente, sin depender de NavigationLink anidados
```

```swift
NavigationStack(path: $path) {
    ListaTareasView()
        .navigationDestination(for: Tarea.self) { tarea in DetalleTareaView(tarea: tarea) }
}
path.append(tarea) // push programático
```

```swift
import SwiftUI

struct Envio: Hashable { let guia: String }

struct ListaEnvios: View {
    let guias = ["RF-4471", "RF-5002"]
    var body: some View {
        List(guias, id: \.self) { guia in
            NavigationLink(guia, value: Envio(guia: guia)) // empuja un valor, no una vista
        }
        .navigationTitle("Envíos")
    }
}

struct DetalleEnvio: View {
    let guia: String
    var body: some View { Text("Detalle de \(guia)") }
}

struct AppRutaFlow: View {
    @State private var path = NavigationPath()
    var body: some View {
        NavigationStack(path: $path) {
            ListaEnvios()
                .navigationDestination(for: Envio.self) { envio in DetalleEnvio(guia: envio.guia) }
        }
    }
}
// Simula abrir una notificación push:
// path.append(Envio(guia: "RF-4471"))
```

```bash
xcodebuild -scheme RutaFlowApp -destination 'generic/platform=iOS Simulator' build
```

</details>

### Tema 2: Sheets, full screen covers y TabView · Básico · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a decidir, para dos flujos reales de RutaFlow, si necesitan un .sheet() o un .fullScreenCover(), y a darle a cada pestaña su propio historial con TabView. Prerrequisitos: Tema 1 de este módulo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a decidir, para dos flujos reales de RutaFlow, si necesitan un .sheet() o un .fullScreenCover(), y a darle a cada pestaña su propio historial con TabView.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en sheets, full screen covers y tabview como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
1. Identifica el problema que sheets, full screen covers y tabview resuelve.
2. Observa sus componentes y relaciones.
3. Aplica la opción más simple que funcione.
4. Verifica el resultado y los límites.

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Sheets, full screen covers y TabView se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Sheets, full screen covers y TabView | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses sheets, full screen covers y tabview por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: sheets, full screen covers y tabview funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Sheets, full screen covers y TabView existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve sheets, full screen covers y tabview en tu contexto?
2. ¿Cómo sabrías que sheets, full screen covers y tabview no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar sheets, full screen covers y tabview?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```swift
.sheet(isPresented: $mostrarFormulario) { FormularioTareaView() }       // modal parcial, dismissible deslizando
.fullScreenCover(isPresented: $mostrarOnboarding) { OnboardingView() } // cubre toda la pantalla, ideal para flujos obligatorios
```

```swift
TabView {
    NavigationStack { InicioView() }.tabItem { Label("Inicio", systemImage: "house") }
    NavigationStack { TareasView() }.tabItem { Label("Tareas", systemImage: "checklist") }
}
```

```
TabView
├── Inicio  → NavigationStack propio
└── Tareas  → NavigationStack propio (independiente del de Inicio)
```

```swift
import SwiftUI

struct ContentView: View {
    @State private var mostrarConfirmarEntrega = false
    @State private var mostrarOnboarding = true
    @State private var entregado = false

    var body: some View {
        TabView {
            NavigationStack {
                ListaEnvios()
                    .toolbar { Button("Confirmar") { mostrarConfirmarEntrega = true } }
            }
            .tabItem { Label("Envíos", systemImage: "shippingbox") }
            NavigationStack { HistorialEnvios(entregado: entregado) }
                .tabItem { Label("Historial", systemImage: "clock") }
        }
        .sheet(isPresented: $mostrarConfirmarEntrega) { ConfirmarEntregaBoton(entregado: $entregado) }
        .fullScreenCover(isPresented: $mostrarOnboarding) { OnboardingConductorView(visible: $mostrarOnboarding) }
    }
}

struct ConfirmarEntregaBoton: View {
    @Binding var entregado: Bool
    @Environment(\.dismiss) private var cerrar
    var body: some View {
        Button("Confirmar entrega de RF-4471") { entregado = true; cerrar() }
    }
}

struct OnboardingConductorView: View {
    @Binding var visible: Bool
    var body: some View {
        VStack(spacing: 16) {
            Text("Bienvenido a RutaFlow")
            Button("Empezar ruta") { visible = false } // única salida: el flujo es obligatorio
        }
    }
}

struct HistorialEnvios: View {
    let entregado: Bool
    var body: some View {
        Text(entregado ? "RF-4471 entregado" : "Sin entregas hoy")
            .navigationTitle("Historial")
    }
}
```

```bash
xcodebuild -scheme RutaFlowApp -destination 'generic/platform=iOS Simulator' build
```

</details>

### Tema 3: Deep linking y controles de formulario · Intermedio · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a abrir DetalleEnvio directamente desde un deep link real (rutaflow://envio/RF-4471), validando el formato antes de navegar. Prerrequisitos: Tema 1 de este módulo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a abrir DetalleEnvio directamente desde un deep link real (rutaflow://envio/RF-4471), validando el formato antes de navegar.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en deep linking y controles de formulario como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart TD
    A["rutaflow://envio/RF-4471"] --> B{"scheme/host válidos?"}
    B -->|No| C["Ignorar (return)"]
    B -->|Sí| D{"guia.hasPrefix('RF-')?"}
    D -->|No| C
    D -->|Sí| E["path.append(Envio(guia:))"]
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Deep linking y controles de formulario se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Deep linking y controles de formulario | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses deep linking y controles de formulario por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: deep linking y controles de formulario funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Deep linking y controles de formulario existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve deep linking y controles de formulario en tu contexto?
2. ¿Cómo sabrías que deep linking y controles de formulario no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar deep linking y controles de formulario?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```swift
.onOpenURL { url in
    if let id = extraerID(de: url) { path.append(Tarea(id: id)) }
}
```

```mermaid
flowchart TD
    A["rutaflow://envio/RF-4471"] --> B{"scheme/host válidos?"}
    B -->|No| C["Ignorar (return)"]
    B -->|Sí| D{"guia.hasPrefix('RF-')?"}
    D -->|No| C
    D -->|Sí| E["path.append(Envio(guia:))"]
```

```swift
struct AppRutaFlow: View {
    @State private var path = NavigationPath()
    var body: some View {
        NavigationStack(path: $path) {
            ListaEnvios()
                .navigationDestination(for: Envio.self) { envio in DetalleEnvio(guia: envio.guia) }
        }
        .onOpenURL { url in
            guard url.scheme == "rutaflow", url.host == "envio",
                  let guia = url.pathComponents.last, guia.hasPrefix("RF-") else { return }
            path.append(Envio(guia: guia))
        }
    }
}
```

```bash
xcodebuild -scheme RutaFlowApp -destination 'generic/platform=iOS Simulator' build
```

</details>
