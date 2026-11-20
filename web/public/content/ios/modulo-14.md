# Módulo 14: SwiftUI Master: pruebas, animación e interoperabilidad


**Proyecto del módulo:** para cada práctica, parte de una carpeta vacía y crea en Xcode (File ▸ New ▸ Project ▸ App, interfaz SwiftUI) un proyecto llamado `RutaFlowApp`; escribe manualmente todos los archivos indicados y compila, sin usar proyectos ya preparados.

## Aprende construyendo

### Tema 1: Animaciones y matchedGeometryEffect · Intermedio · 35 min

#### Paso 1 · Objetivo y preparación
Al finalizar vas a animar la transición de una `TarjetaEnvio` en `ListaEnvios` hacia `DetalleEnvio`, de forma que la tarjeta parezca expandirse en vez de cambiar de golpe. Prerrequisitos: Módulo 1 completo.
#### Paso 2 · Contexto y caso real
Hoy, tocar una `TarjetaEnvio` navega instantáneamente a `DetalleEnvio` sin ninguna continuidad visual; el usuario pierde de vista qué tarjeta tocó exactamente.
#### Paso 3 · Teoría, modelo mental y analogía
`matchedGeometryEffect` vincula dos vistas distintas (una en cada pantalla) con un mismo `id` dentro de un mismo `namespace`, y SwiftUI anima la transición de tamaño y posición entre ambas — como si fuera literalmente la misma vista moviéndose.

**¿Por qué es importante?** Porque una transición animada que conserva continuidad visual comunica relación espacial de una forma que un corte instantáneo no puede.
**Conceptos clave:** `Namespace` compartido, `id` idéntico entre ambos lados de la transición.

**Diagrama: matchedGeometryEffect con id compartido**

```mermaid
flowchart LR
    A["TarjetaEnvio\n.matchedGeometryEffect(id: envio.id)"] -.->|mismo id,\nmismo namespace| B["EncabezadoEnvio\n.matchedGeometryEffect(id: envio.id)"]
    A --> C["SwiftUI anima tamaño/posición\nentre ambas vistas"]
    B --> C
```

En tu propio proyecto RutaFlow, crea `TransicionEnvio.swift` con **File ▸ New ▸ File ▸ Swift File** dentro del target de la app; ahí viven la lista y el detalle que comparten el namespace. Límite de la decisión: `matchedGeometryEffect` no conviene para transiciones entre vistas sin relación visual real (dos pantallas completamente distintas) — ahí una transición estándar de `NavigationStack` es más clara; reservalo específicamente cuando dos vistas distintas representan visualmente el mismo elemento de datos, como esta tarjeta que se expande.

#### Paso 4 · Demostración guiada
```swift
import SwiftUI

struct EnvioResumen: Identifiable {
    let id: Int
    let guia: String
    let direccion: String
}

struct TransicionEnvio: View {
    @Namespace private var espacioAnimacion
    @State private var seleccionado: EnvioResumen?
    let envios = [EnvioResumen(id: 1, guia: "RF-4471", direccion: "Calle 10 #5-20")]

    var body: some View {
        if let envio = seleccionado {
            // En el detalle: mismo id y mismo namespace que la tarjeta de la lista.
            VStack(alignment: .leading) {
                Text(envio.guia).font(.largeTitle)
                Text(envio.direccion)
            }
            .matchedGeometryEffect(id: envio.id, in: espacioAnimacion)
            .onTapGesture { withAnimation { seleccionado = nil } }
        } else {
            // En la lista: cada tarjeta declara su geometría con el id del envío.
            VStack {
                ForEach(envios) { envio in
                    Text(envio.guia)
                        .padding()
                        .background(.blue.opacity(0.1), in: .rect(cornerRadius: 8))
                        .matchedGeometryEffect(id: envio.id, in: espacioAnimacion)
                        .onTapGesture { withAnimation { seleccionado = envio } }
                }
            }
        }
    }
}
```

**Ejecuta el ejemplo:**

```bash
xcodebuild -scheme RutaFlowApp -destination 'generic/platform=iOS Simulator' build
```
Luego corre con ⌘R en el simulador, o abre el canvas de Preview con ⌥⌘↵.

Resultado esperado: al tocar la tarjeta de la lista, el detalle se anima expandiéndose suavemente desde la posición y tamaño exactos de la tarjeta original, en vez de un corte instantáneo entre pantallas.
#### Paso 5 · Práctica guiada
Pista: usá un `id` distinto en cada lado (`envio.id` en la lista pero `envio.guia` en el detalle) — ese es el fallo deliberado: SwiftUI no reconoce ninguna relación entre ambas vistas, y la transición vuelve a ser un corte instantáneo sin ninguna animación, sin ningún error visible que explique por qué.
#### Paso 6 · Práctica independiente
Corregí el Paso 5 usando el mismo `id` (`envio.id`) en ambos lados, y agregá una segunda `matchedGeometryEffect` para animar también el ícono de estado del envío entre ambas pantallas, con su propio `id` distinto al de la tarjeta completa.

**Proyecto integrador:** en el proyecto vacío de este tema, crea `TransicionEnvioView.swift` con una lista de tres envíos, una selección `@State` y un detalle que use el mismo `Namespace` y `envio.id` para tarjeta e ícono. Añade un botón para volver y lee `accessibilityReduceMotion`: cuando esté activo, cambia de vista sin animación y sin efectos geométricos. Ejecuta la apertura y el regreso con movimiento normal y con Reducir movimiento; en ambos casos debe quedar claro qué envío está seleccionado y ningún control debe quedar bloqueado por la transición.

#### Paso 7 · Cierre
Entregá la transición animada del Paso 4, la transición rota por `id` inconsistente del Paso 5, y la segunda animación agregada del Paso 6; explicá por qué `matchedGeometryEffect` exige que el `id` sea idéntico en ambos lados y qué pasa silenciosamente (sin error) cuando no lo es. Siguiente paso: estudia cómo embeber vistas de UIKit dentro de SwiftUI. Errores comunes: usar un `namespace` distinto en cada pantalla, IDs inconsistentes entre los dos lados de la transición, y animar demasiados elementos simultáneamente sin medir el impacto en el frame rate. Fuentes oficiales: https://developer.apple.com/documentation/swiftui/view/matchedgeometryeffect(id:in:properties:anchor:issource:) y https://developer.apple.com/documentation/swiftui/animations.

### Tema 2: Gestos en SwiftUI: arrastrar, mantener presionado y combinar gestos · Intermedio · 40 min

**Prerrequisito:** tema «Animaciones y matchedGeometryEffect» de este módulo.

**Al finalizar podrás:** implementar un deslizamiento para marcar una entrega con `DragGesture`, una pulsación larga para ver detalles y combinarlos sin que uno bloquee al otro.

**¿Por qué es importante?** Los gestos hacen que las acciones frecuentes sean rápidas, pero mal hechos son invisibles o se disparan por accidente. Hay que saber cuándo un gesto termina, cómo animar el regreso y cómo ofrecer una alternativa accesible.

#### Paso 1 · Objetivo y preparación

Continúa `RutaFlowApp`. Crea `FilaEntrega.swift` en el grupo `RutaFlowApp`.

#### Paso 2 · Contexto y caso real

Los conductores de RutaFlow marcan decenas de entregas al día. Tocar la fila, abrir el detalle y pulsar un botón tomaba tres pasos. Con un deslizamiento hacia la derecha, se marca en uno, y VoiceOver ofrece la misma acción.

#### Paso 3 · Teoría, modelo mental y analogía

**Conceptos clave:** `DragGesture`, `onChanged`, `onEnded`, `translation`, `LongPressGesture`, `simultaneously`, `highPriorityGesture`, acción de accesibilidad.

Un gesto se adjunta con `.gesture(...)`. `DragGesture` informa la **traslación** mientras el dedo se mueve (`onChanged`) y al soltar (`onEnded`), donde decides si la acción se completa (por ejemplo, si se arrastró más de 120 puntos) o si la fila vuelve a su lugar con una animación.

Para combinar gestos:

| Combinación | Efecto |
|---|---|
| `.simultaneously(with:)` | los dos pueden reconocerse a la vez |
| `.sequenced(before:)` | el segundo empieza cuando termina el primero |
| `.highPriorityGesture(_:)` | el tuyo gana sobre los gestos de la vista hija |

Todo gesto necesita una **alternativa accesible**: `.accessibilityAction(named:)` expone la acción a VoiceOver.

**Analogía:** un gesto es una conversación: mientras mueves el dedo, la fila escucha; al soltar, decide si entendió la orden. La analogía falla en que dos gestos pueden «hablar» a la vez y hay que decidir cuál tiene la palabra.

**Límite de uso:** no pongas acciones destructivas solo detrás de un gesto: pide confirmación o permite deshacer. En listas (`List`), usa `swipeActions`, que ya resuelve el comportamiento estándar de iOS.

```mermaid
stateDiagram-v2
    [*] --> Reposo
    Reposo --> Arrastrando: onChanged
    Arrastrando --> Marcada: onEnded y desplazamiento > 120
    Arrastrando --> Reposo: onEnded y desplazamiento <= 120 (animado)
    Reposo --> Detalle: LongPress 0.5 s
```

#### Paso 4 · Demostración guiada desde cero

Archivo `academia-ios/RutaFlowApp/RutaFlowApp/FilaEntrega.swift`:

```swift
import SwiftUI

struct FilaEntrega: View {
    let codigo: String
    var alMarcar: () -> Void
    @State private var desplazamiento: CGFloat = 0
    @State private var mostrandoDetalle = false

    var body: some View {
        Text(codigo)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding()
            .background(.background, in: .rect(cornerRadius: 12))
            .offset(x: desplazamiento)
            .gesture(
                DragGesture(minimumDistance: 20)
                    .onChanged { valor in desplazamiento = max(0, valor.translation.width) }
                    .onEnded { valor in
                        if valor.translation.width > 120 { alMarcar() }
                        withAnimation(.spring) { desplazamiento = 0 } // vuelve a su lugar
                    }
                    .simultaneously(with: LongPressGesture(minimumDuration: 0.5)
                        .onEnded { _ in mostrandoDetalle = true })
            )
            .accessibilityAction(named: "Marcar como entregada", alMarcar) // alternativa para VoiceOver
            .sheet(isPresented: $mostrandoDetalle) { Text("Detalle de \(codigo)") }
    }
}

#Preview {
    FilaEntrega(codigo: "ENV-42") { print("ENV-42 entregada") }
        .padding()
}
```

Compila y abre la vista previa con ⌥⌘↵, o ejecuta la app con ⌘R:

```bash
xcodebuild -scheme RutaFlowApp -destination 'generic/platform=iOS Simulator' build
```

**Explicación por bloques:** `desplazamiento` guarda cuánto se movió la fila. `DragGesture` con distancia mínima de 20 puntos evita que un toque se confunda con un arrastre. En `onChanged` la fila sigue al dedo solo hacia la derecha; en `onEnded` se marca la entrega si se arrastró más de 120 puntos y la fila vuelve con una animación de resorte. `simultaneously` permite que la pulsación larga funcione en la misma vista. `accessibilityAction` ofrece la acción en el rotor de VoiceOver.

**Resultado esperado:**

```text
Arrastrar ENV-42 más de 120 puntos a la derecha imprime «ENV-42 entregada» en la consola y la fila vuelve a su lugar.
Arrastrar menos de 120 puntos no marca nada.
Mantener presionado medio segundo abre la hoja con «Detalle de ENV-42».
```

**Fallo deliberado:** quita `minimumDistance: 20` y pon la fila dentro de un `ScrollView` vertical. **Error esperado:** al intentar desplazar la lista, las filas se mueven de lado y el scroll se traba. **Diagnóstico:** el arrastre de la fila captura el movimiento antes que el scroll. Usa una distancia mínima y, en listas, prefiere `swipeActions`.

#### Paso 5 · Práctica guiada

1. **Reproducción:** prueba el arrastre en la vista previa y ajusta el umbral.
2. **Variación:** agrega una vibración con `.sensoryFeedback(.success, trigger:)` al marcar.
3. **Diagnóstico:** reproduce el fallo deliberado dentro de un `ScrollView`.
4. **Integración:** activa VoiceOver en el simulador (Accessibility Inspector) y ejecuta la acción desde el rotor.
5. **Diseño:** escribe qué gestos usarías en la app del conductor y cuál es la alternativa visible de cada uno.

**Pista:** si un gesto «no responde», revisa si otro gesto de un padre o hijo lo está capturando.

#### Paso 6 · Práctica independiente

Cambia la fila por un `List` con `.swipeActions` («Entregada» y «Problema») y compara con tu gesto propio: qué ganas y qué pierdes.

#### Paso 7 · Cierre

- [ ] Explicas `onChanged` y `onEnded`.
- [ ] El arrastre marca la entrega solo pasado el umbral.
- [ ] Reprodujiste el conflicto con el scroll.
- [ ] La acción está disponible para VoiceOver.

Si fallas dos o más, vuelve al Paso 3. **Errores comunes:** ocultar acciones solo en gestos, no animar el regreso y olvidar la distancia mínima dentro de listas. **Siguiente paso:** el tema «UIViewRepresentable» integra vistas de UIKit que tienen sus propios gestos.

**Transferencia al proyecto integrador «RutaFlow»:** en la lista de entregas de RutaFlow, marca entregas con deslizamiento y abre el detalle con pulsación larga, con acciones de accesibilidad equivalentes.

**Fuente oficial:** [Apple — Adding interactivity with gestures](https://developer.apple.com/documentation/swiftui/adding-interactivity-with-gestures) y [Apple — Composing SwiftUI gestures](https://developer.apple.com/documentation/swiftui/composing-swiftui-gestures).

### Tema 3: Swift Testing y pruebas asíncronas · Intermedio · 45 min

#### Paso 1 · Objetivo y preparación
Al finalizar vas a testear que cancelar la carga de `EnviosViewModel.cargar()` a mitad de camino detiene efectivamente la tarea, en vez de dejarla sobrescribir el estado más tarde. Prerrequisitos: Módulo 9 completo.
#### Paso 2 · Contexto y caso real
Si un conductor sale de `ListaEnvios` antes de que termine de cargar, la tarea de red debería cancelarse; nadie confirmó todavía que `cargar()` respeta esa cancelación en vez de seguir corriendo en segundo plano.
#### Paso 3 · Teoría, modelo mental y analogía
Testear cancelación exige provocarla explícitamente dentro del test y confirmar que el trabajo posterior al punto de cancelación nunca se ejecuta — no alcanza con que el test "no crashee".

**¿Por qué es importante?** Porque una tarea cancelada que sigue escribiendo estado puede sobrescribir datos más recientes con una respuesta obsoleta que ya no debería importar.
**Conceptos clave:** cancelación cooperativa de `Task`, verificación explícita en vez de inferida.

**Diagrama: test de cancelación cooperativa**

```mermaid
sequenceDiagram
    participant Test
    participant Tarea as Task { vm.cargar() }
    participant VM as EnviosViewModel
    Test->>VM: esperarInicio() confirma operación en curso
    Test->>Tarea: cancel()
    Test->>VM: liberar respuesta tardía
    Tarea->>VM: cargar() revisa Task.isCancelled
    VM-->>Tarea: guard !isCancelled else return
    Test->>Tarea: await tarea.value
    Test->>VM: #expect(vm.envios.isEmpty)
```

En tu propio proyecto RutaFlow, conserva `EnviosViewModel.cargar()` en el `EnviosViewModel.swift` que creaste manualmente en el Paso 4. Límite de la decisión: no conviene agregar un chequeo de cancelación a cada función `async` trivial sin efectos secundarios reales — ahí la cancelación no cambia nada observable; reservá el chequeo explícito específicamente para funciones que, como `cargar()`, escriben estado compartido que una respuesta obsoleta podría sobrescribir.

#### Paso 4 · Demostración guiada desde cero
Parte de una carpeta vacía. En Xcode elige **File ▸ New ▸ Project ▸ iOS ▸ App**, nombra el producto `RutaFlowApp`, usa interfaz SwiftUI y lenguaje Swift, y activa la inclusión de tests. Si el proyecto no tiene target de tests, agrégalo con **File ▸ New ▸ Target ▸ Unit Testing Bundle**.

En el grupo de la app crea **File ▸ New ▸ File ▸ Swift File**, nómbralo `EnviosViewModel.swift` y selecciona únicamente el target `RutaFlowApp`. Escribe manualmente el código de producción necesario:

```swift
import Foundation

// nonisolated: un proyecto nuevo de Xcode 26 aísla por defecto todo en MainActor, y el
// servicio de prueba es un actor, que no puede adoptar un protocolo aislado en MainActor.
nonisolated struct Envio: Equatable, Sendable {
    let id: String
}

nonisolated protocol ServicioEnvios: Sendable {
    func obtenerEnvios() async throws -> [Envio]
}

@MainActor
final class EnviosViewModel {
    var envios: [Envio] = []
    var error: Error?
    private let servicio: any ServicioEnvios

    init(servicio: any ServicioEnvios) {
        self.servicio = servicio
    }

    func cargar() async {
        do {
            let respuesta = try await servicio.obtenerEnvios()
            guard !Task.isCancelled else { return }
            envios = respuesta
        } catch is CancellationError {
            return
        } catch {
            guard !Task.isCancelled else { return }
            self.error = error
        }
    }
}
```

En el grupo `RutaFlowAppTests` crea `CancelacionTests.swift` con **File ▸ New ▸ File ▸ Swift File** y selecciona únicamente el target de tests. Escribe este contenido completo:

```swift
import Foundation
import Testing
@testable import RutaFlowApp

// Ignora cancelación intencionadamente para simular una respuesta tardía real.
actor ServicioControlado: ServicioEnvios {
    private var response: CheckedContinuation<[Envio], Never>?
    private var started = false
    private var waitingForStart: CheckedContinuation<Void, Never>?

    func obtenerEnvios() async throws -> [Envio] {
        await withCheckedContinuation { continuation in
            response = continuation
            started = true
            waitingForStart?.resume()
            waitingForStart = nil
        }
    }

    func esperarInicio() async {
        if started { return }
        await withCheckedContinuation { waitingForStart = $0 }
    }

    func responder(_ envios: [Envio]) {
        response?.resume(returning: envios)
        response = nil
    }
}

@Test @MainActor func cancelarDuranteCargaDescartaRespuestaTardia() async {
    let servicio = ServicioControlado()
    let vm = EnviosViewModel(servicio: servicio)
    let tarea = Task { await vm.cargar() }
    await servicio.esperarInicio() // La operación YA está esperando una respuesta.
    tarea.cancel()
    await servicio.responder([Envio(id: "RF-4471")])
    await tarea.value
    #expect(vm.envios.isEmpty)
    #expect(vm.error == nil)
}

@Test @MainActor func cargaSinCancelarPublicaRespuesta() async {
    let servicio = ServicioControlado()
    let vm = EnviosViewModel(servicio: servicio)
    let tarea = Task { await vm.cargar() }
    await servicio.esperarInicio()
    await servicio.responder([Envio(id: "RF-4471")])
    await tarea.value
    #expect(vm.envios.map(\.id) == ["RF-4471"])
}
```

Ejecuta ambas pruebas con **Product ▸ Test** (⌘U) o, desde la carpeta que contiene tu propio `.xcodeproj`:

```bash
xcodebuild test -scheme RutaFlowApp -destination 'platform=iOS Simulator,name=iPhone 17'
```

**Resultado esperado:** cancelar DESPUÉS de la señal de inicio y ANTES de liberar la respuesta conserva envios vacío; la prueba de control sin cancelación publica RF-4471. El fake ignora deliberadamente la cancelación para obligar al ViewModel a descartar una respuesta tardía. No se usan sleeps ni carreras dependientes de la máquina.

#### Paso 5 · Práctica guiada
Pista: quitá cualquier chequeo de cancelación dentro de `cargar()` — ese es el fallo deliberado: el test falla, porque `cargar()` asigna el resultado de todas formas aunque la tarea que lo contiene ya haya sido cancelada, pudiendo sobrescribir un estado más reciente con uno obsoleto.
#### Paso 6 · Práctica independiente
Corregí el Paso 5 agregando `guard !Task.isCancelled else { return }` antes de asignar `envios` dentro de `cargar()`, y agregá un segundo test que confirme que, sin cancelar, `cargar()` sí asigna el resultado normalmente.

**Proyecto integrador:** dentro del proyecto que iniciaste vacío en este tema, crea `BusquedaEnviosViewModel.swift` con una carga cancelable por guía y un servicio controlado propio, sin importar nada de otro tema. Añade `RutaFlowAppTests/BusquedaCancelacionTests.swift`: inicia la búsqueda de `RF-44`, cancela después de confirmar que comenzó, libera una respuesta tardía y comprueba que `resultados` permanece vacío; ejecuta el control sin cancelar y comprueba que sí publica `RF-44`. Así la aplicación demuestra en una segunda operación real que la cancelación evita estado obsoleto, no solo que el primer test pasa.

#### Paso 7 · Cierre
Entregá el test de cancelación del Paso 4, el fallo por falta de chequeo del Paso 5, y el test del camino sin cancelar del Paso 6; explicá por qué testear cancelación requiere provocarla explícitamente, no inferirla de que el test "pasó rápido". Siguiente paso: estudia ViewInspector para testear la vista misma, no solo el ViewModel. Errores comunes: no verificar `Task.isCancelled` antes de efectos secundarios, cancelar sin esperar `tarea.value` (dejando el assert corriendo antes de que la cancelación surta efecto), y asumir que cancelar una `Task` detiene instantáneamente código síncrono en ejecución. Fuentes oficiales: https://developer.apple.com/documentation/swift/task y https://developer.apple.com/documentation/testing.

### Tema 4: ViewInspector con criterio · Intermedio · 40 min

#### Paso 1 · Objetivo y preparación
Al finalizar vas a usar ViewInspector para confirmar que `ListaEnvios` muestra "Sin envíos" cuando `vm.envios` está vacío, decidiendo cuándo ese test vale más que uno de XCUITest. Prerrequisitos: Módulo 9 completo.
#### Paso 2 · Contexto y caso real
Un XCUITest que verifique el mensaje de lista vacía lanza la app completa solo para confirmar un `if` dentro del `body` de una vista; ViewInspector permite inspeccionar la estructura de la vista directamente, sin lanzar nada.
#### Paso 3 · Teoría, modelo mental y analogía
ViewInspector recorre el árbol de vistas SwiftUI en memoria y permite hacer asserts sobre su estructura — útil para lógica condicional de la vista misma, no un reemplazo de testear el ViewModel ni de un XCUITest end-to-end.

**¿Por qué es importante?** Porque ViewInspector verifica estructura de la vista sin lanzar la app completa, pero solo vale la pena para lógica condicional que realmente vive en el `body`, no como sustituto de testear el ViewModel.
**Conceptos clave:** inspección de estructura en memoria frente a XCUITest end-to-end, límite de cuándo cada uno vale su costo.

**Diagrama: ViewInspector vs XCUITest vs test de ViewModel**

```mermaid
flowchart TD
    A["¿Qué estás probando?"] -->|Lógica de negocio pura| B["Test de ViewModel\n(Swift Testing, Módulo 9)"]
    A -->|Lógica condicional dentro del body| C["ViewInspector\n(estructura en memoria)"]
    A -->|Flujo completo end-to-end| D["XCUITest\n(Módulo 9)"]
```

En tu propio proyecto RutaFlow, conserva `ListaEnvios` en el `ListaEnvios.swift` que creaste manualmente en el target de la app y sus pruebas en `RutaFlowAppTests/ListaEnviosTests.swift`.

#### Paso 4 · Demostración guiada desde cero
Parte de otra carpeta vacía. En Xcode elige **File ▸ New ▸ Project ▸ iOS ▸ App**, nombra el producto `RutaFlowApp`, usa interfaz SwiftUI y lenguaje Swift, y activa la inclusión de tests. Si no existe el target de tests, agrégalo con **File ▸ New ▸ Target ▸ Unit Testing Bundle**. No reutilices el proyecto del Tema 1.

En el grupo de la app crea `EnviosViewModel.swift` con **File ▸ New ▸ File ▸ Swift File**, selecciona únicamente el target `RutaFlowApp` y escribe manualmente los tipos mínimos que usarán la vista y su prueba:

```swift
import Foundation

// nonisolated: un proyecto nuevo de Xcode 26 aísla por defecto todo en MainActor, y el
// servicio de prueba es un actor, que no puede adoptar un protocolo aislado en MainActor.
nonisolated struct Envio: Equatable, Sendable {
    let id: String
}

nonisolated protocol ServicioEnvios: Sendable {
    func obtenerEnvios() async throws -> [Envio]
}

@MainActor
final class EnviosViewModel {
    var envios: [Envio]
    private let servicio: any ServicioEnvios

    init(servicio: any ServicioEnvios, envios: [Envio] = []) {
        self.servicio = servicio
        self.envios = envios
    }
}
```

Agrega ViewInspector como dependencia con **File ▸ Add Package Dependencies**, usando `https://github.com/nalexn/ViewInspector.git`, y vincula el paquete al target `RutaFlowAppTests`.

Crea `ListaEnvios.swift` dentro del grupo de la app con **File ▸ New ▸ File ▸ Swift File**, selecciona el target `RutaFlowApp` y escribe:

```swift
import SwiftUI

struct ListaEnvios: View {
    let vm: EnviosViewModel

    var body: some View {
        Group {
            if vm.envios.isEmpty {
                Text("Sin envíos")
            } else {
                List(vm.envios, id: \.id) { envio in Text(envio.id) }
            }
        }
    }
}
```

En `RutaFlowAppTests`, crea `ListaEnviosTests.swift` y selecciona únicamente el target de tests. Escribe el fake mínimo, la conformidad de inspección y la prueba:

```swift
import Testing
import ViewInspector
@testable import RutaFlowApp

private struct ServicioVacio: ServicioEnvios {
    func obtenerEnvios() async throws -> [Envio] { [] }
}

extension ListaEnvios: Inspectable {}

@Test @MainActor func muestraMensajeCuandoNoHayEnvios() throws {
    let vm = EnviosViewModel(servicio: ServicioVacio())
    let vista = ListaEnvios(vm: vm)
    let texto = try vista.inspect().find(text: "Sin envíos")
    #expect(try texto.string() == "Sin envíos")
}
```

Ejecuta con **Product ▸ Test** (⌘U) o, desde la carpeta que contiene tu propio `RutaFlowApp.xcodeproj`, ejecuta exactamente tus pruebas con:

```bash
xcodebuild test -scheme RutaFlowApp -destination 'platform=iOS Simulator,name=iPhone 17' -only-testing:RutaFlowAppTests
```

Resultado esperado: el test encuentra el texto "Sin envíos" dentro del árbol de `ListaEnvios` cuando `vm.envios` está vacío, sin lanzar el simulador ni renderizar nada en pantalla — una verificación de estructura, no de píxeles.
#### Paso 5 · Práctica guiada
Pista: cambiá el texto real de la vista de "Sin envíos" a "No hay envíos" sin actualizar el test — ese es el fallo deliberado: el test de ViewInspector falla con un mensaje claro, pero si en cambio hubieras usado una captura de pantalla para "verificar visualmente", un cambio de texto así podría pasar inadvertido en una revisión apurada.
#### Paso 6 · Práctica independiente
Corregí el Paso 5 unificando el texto a una sola versión, y agregá un segundo test que confirme lo contrario: que "Sin envíos" NO aparece cuando `vm.envios` tiene al menos un elemento.

**Proyecto integrador:** en el proyecto nuevo de este tema, crea `ResumenRutaView.swift`, que muestre «Ruta sin paradas» cuando no hay envíos y «N pendientes» cuando exista al menos uno. Añade ambos casos a `RutaFlowAppTests/ResumenRutaViewTests.swift` con ViewInspector y ejecuta de nuevo `xcodebuild test -scheme RutaFlowApp -destination 'platform=iOS Simulator,name=iPhone 17' -only-testing:RutaFlowAppTests`. Verifica el texto vacío, el contador con dos envíos y la ausencia del mensaje vacío en ese segundo caso; no lances la app para afirmar algo que estas pruebas estructurales ya comprueban.

#### Paso 7 · Cierre
Entregá el test de estructura del Paso 4, el fallo detectado en el Paso 5, y el test del caso contrario del Paso 6; explicá cuándo ViewInspector vale el esfuerzo (lógica condicional dentro del `body`) frente a cuándo un test de ViewModel ya cubre lo importante sin necesidad de inspeccionar la vista. Siguiente paso: estudia Combine avanzado. Errores comunes: usar ViewInspector para probar lógica que en realidad vive en el ViewModel, acoplar tests a detalles de implementación interna que cambian seguido, y reemplazar todos los XCUITest por ViewInspector perdiendo cobertura end-to-end real. Fuentes oficiales: https://github.com/nalexn/ViewInspector y https://developer.apple.com/documentation/swiftui.

### Tema 5: Combine avanzado · Avanzado · 35 min

#### Paso 1 · Objetivo y preparación
Al finalizar vas a corregir una condición de carrera en la búsqueda de guías de RutaFlow (Módulo 7), donde una respuesta vieja puede sobrescribir una más nueva, usando `switchToLatest()`. Prerrequisitos: Módulo 7 completo.
#### Paso 2 · Contexto y caso real
Si un operador escribe "RF-44" y de inmediato completa a "RF-4471", salen dos búsquedas de red casi simultáneas; si la primera (más lenta por alguna razón de red) responde después de la segunda, su resultado viejo sobrescribe el resultado correcto y más reciente.
#### Paso 3 · Teoría, modelo mental y analogía
`.map` seguido de `.switchToLatest()` cancela automáticamente el Publisher anterior cuando llega un nuevo valor de entrada — solo el resultado de la búsqueda más reciente puede llegar a completar.

**¿Por qué es importante?** Porque sin cancelar explícitamente búsquedas obsoletas, una respuesta de red fuera de orden puede mostrarle al usuario un resultado que no corresponde a lo que realmente escribió.
**Conceptos clave:** `.flatMap` frente a `.switchToLatest()`, cancelación automática de Publishers obsoletos.

**Diagrama: switchToLatest cancela lo anterior**

```mermaid
sequenceDiagram
    participant Input as $textoBusqueda
    participant SL as switchToLatest()
    participant API as servicio.buscarPublisher
    Input->>SL: "RF-44"
    SL->>API: Publisher A (lento)
    Input->>SL: "RF-4471"
    SL->>API: cancela Publisher A
    SL->>API: Publisher B (nuevo)
    API-->>SL: resultado de B
    SL-->>SL: sink recibe solo B
```

En tu propio proyecto RutaFlow, crea `BuscadorEnviosViewModel.swift` con **File ▸ New ▸ File ▸ Swift File**, selecciona el target de la app y escribe allí este ViewModel (si ya tienes uno del Módulo 7, reemplázalo):

#### Paso 4 · Demostración guiada
```swift
import Combine
import Foundation

struct ServicioBusqueda {
    // Simula la red: responde 200 ms después, como una petición real.
    func buscarPublisher(_ texto: String) -> AnyPublisher<[String], Never> {
        Just(["RF-4471", "RF-5002"].filter { $0.hasPrefix(texto) })
            .delay(for: .milliseconds(200), scheduler: RunLoop.main)
            .eraseToAnyPublisher()
    }
}

class BuscadorEnviosViewModel: ObservableObject {
    @Published var textoBusqueda = ""
    @Published private(set) var resultados: [String] = []
    private let servicio = ServicioBusqueda()
    private var cancelables = Set<AnyCancellable>()

    init() {
        $textoBusqueda
            .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
            .map { [servicio] texto in servicio.buscarPublisher(texto) } // cada búsqueda produce un nuevo Publisher
            .switchToLatest() // cancela el Publisher anterior si todavía no completó
            .sink { [weak self] resultados in self?.resultados = resultados }
            .store(in: &cancelables)
    }
}
```

**Ejecuta el ejemplo:**

```bash
xcodebuild -scheme RutaFlowApp -destination 'generic/platform=iOS Simulator' build
```
Luego corre con ⌘R en el simulador, o abre el canvas de Preview con ⌥⌘↵.

Resultado esperado: al escribir "RF-44" y de inmediato "RF-4471", `switchToLatest()` cancela la suscripción a la búsqueda de "RF-44" en el instante en que llega el nuevo Publisher de "RF-4471" — solo el resultado de "RF-4471" puede llegar al `sink`, sin importar cuál respuesta de red llegue primero.
#### Paso 5 · Práctica guiada
Pista: reemplazá `.switchToLatest()` por `.flatMap { $0 }` sin límite de concurrencia — ese es el fallo deliberado: ahora ambas búsquedas siguen corriendo en paralelo sin cancelarse, y si la respuesta de "RF-44" llega después, su resultado viejo sobrescribe el de "RF-4471" en el `sink`, mostrando resultados incorrectos para lo que el operador realmente escribió.
#### Paso 6 · Práctica independiente
Corregí el Paso 5 restaurando `.switchToLatest()`, y escribí (con un fake de `ServicioAPI` que controlás manualmente) un test que confirme explícitamente que la respuesta de la primera búsqueda, si llega tarde, nunca aparece en `resultados`.

**Proyecto integrador:** en el proyecto creado desde una carpeta vacía para este tema, termina `BuscadorEnviosViewModel.swift` y crea `ServicioBusquedaControlado.swift`, con un `PassthroughSubject` independiente por guía. En `RutaFlowAppTests/BuscadorEnviosViewModelTests.swift`, emite `RF-44` y después `RF-4471`, completa primero el segundo subject con `["RF-4471"]` y luego intenta emitir `["RF-44"]` desde el primero. El resultado final debe seguir siendo `["RF-4471"]`, y el estado de cancelación del primer subject debe demostrar que `switchToLatest` lo abandonó; conecta después el ViewModel a un buscador en `BuscadorEnviosView.swift`.

#### Paso 7 · Cierre
Entregá la cadena con `switchToLatest()` del Paso 4, la condición de carrera provocada en el Paso 5, y el test del Paso 6; explicá la diferencia entre `.flatMap` (deja correr todos los Publishers internos en paralelo) y `.switchToLatest()` (cancela el anterior ante cada nuevo valor). Siguiente paso: estudia animaciones con matchedGeometryEffect. Errores comunes: usar `.flatMap` sin límite cuando en realidad se necesita cancelar resultados obsoletos, no testear explícitamente el caso de respuesta fuera de orden, y confundir `switchToLatest` con "la búsqueda más rápida gana" (en realidad cancela, no compite). Fuentes oficiales: https://developer.apple.com/documentation/combine/publisher/switchtolatest() y https://developer.apple.com/documentation/combine.

### Tema 6: UIViewRepresentable · Avanzado · 35 min

#### Paso 1 · Objetivo y preparación
Al finalizar vas a envolver un `MKMapView` (UIKit) dentro de SwiftUI con `UIViewRepresentable`, mostrando la ubicación de los envíos de una ruta de RutaFlow. Prerrequisitos: Módulo 10 completo.
#### Paso 2 · Contexto y caso real
SwiftUI tiene `Map`, pero RutaFlow necesita una funcionalidad específica de `MKMapView` (anotaciones personalizadas con el estado de cada parada) que la versión SwiftUI no expone directamente.
#### Paso 3 · Teoría, modelo mental y analogía
`UIViewRepresentable` exige implementar `makeUIView` (crea la vista una sola vez) y `updateUIView` (sincroniza cambios de estado de SwiftUI hacia la vista de UIKit) — un traductor entre el mundo declarativo de SwiftUI y el mundo imperativo de UIKit.

**¿Por qué es importante?** Porque confundir `makeUIView` con `updateUIView` produce una vista de UIKit que nunca refleja cambios posteriores de estado, un bug silencioso sin ningún error visible.
**Conceptos clave:** `makeUIView` (una sola vez) frente a `updateUIView` (cada actualización), Coordinator como delegate de UIKit.

**Diagrama: ciclo de vida de UIViewRepresentable**

```mermaid
flowchart TD
    A["SwiftUI crea MapaRuta"] --> B["makeUIView(context:)\nSE EJECUTA UNA SOLA VEZ"]
    C["paradas cambia"] --> D["updateUIView(_:context:)\nse ejecuta en CADA cambio"]
    B --> E["MKMapView visible"]
    D --> E
```

En tu propio proyecto RutaFlow, crea `MapaRuta.swift` con **File ▸ New ▸ File ▸ Swift File**, selecciona el target de la app y escribe allí `MapaRuta` con sus imports y el modelo `Parada`:

#### Paso 4 · Demostración guiada
```swift
import MapKit
import SwiftUI

struct Parada {
    let direccion: String
    let coordenada: CLLocationCoordinate2D
}

struct MapaRuta: UIViewRepresentable {
    let paradas: [Parada]

    func makeUIView(context: Context) -> MKMapView { MKMapView() }

    func updateUIView(_ mapView: MKMapView, context: Context) {
        mapView.removeAnnotations(mapView.annotations)
        let anotaciones = paradas.map { parada in
            let punto = MKPointAnnotation()
            punto.coordinate = parada.coordenada
            punto.title = parada.direccion
            return punto
        }
        mapView.addAnnotations(anotaciones)
    }
}
```

**Ejecuta el ejemplo:**

```bash
xcodebuild -scheme RutaFlowApp -destination 'generic/platform=iOS Simulator' build
```
Luego corre con ⌘R en el simulador, o abre el canvas de Preview con ⌥⌘↵.

Resultado esperado: al cambiar `paradas` desde SwiftUI (por ejemplo, al completar una entrega y quitarla de la lista), `updateUIView` se llama automáticamente y el mapa refleja las anotaciones actualizadas, sin ningún código manual de sincronización.
#### Paso 5 · Práctica guiada
Pista: movés la creación de las anotaciones a `makeUIView` en vez de `updateUIView`, "para no repetir código en cada actualización" — ese es el fallo deliberado: ahora el mapa muestra siempre las paradas de la primera vez que se creó la vista, y completar una entrega nunca actualiza lo que se ve en el mapa, porque `makeUIView` solo se ejecuta una vez.
#### Paso 6 · Práctica independiente
Corregí el Paso 5 devolviendo la lógica de anotaciones a `updateUIView`, y agregá un `Coordinator` (con `makeCoordinator()`) que implemente `MKMapViewDelegate` para personalizar el color del pin según si la parada está pendiente o entregada.

**Proyecto integrador:** en el `RutaFlowApp` iniciado desde cero en este tema, completa `MapaRuta.swift` con dos paradas propias y crea `RutaView.swift` con una lista y un botón «Marcar entregada» para cada una. Al marcar una parada, `updateUIView` debe eliminar y reconstruir las anotaciones, el mapa debe conservar solo las paradas pendientes definidas por tu regla y el `Coordinator` debe pintar las restantes según su estado. Cambia dos veces entre pendiente y entregada y verifica que no se acumulan anotaciones duplicadas ni coordenadas de la primera renderización.

#### Paso 7 · Cierre
Entregá el `UIViewRepresentable` del Paso 4, el mapa congelado del Paso 5, y el `Coordinator` con delegate del Paso 6; explicá la diferencia entre qué código corre una sola vez (`makeUIView`) y qué código debe correr en cada actualización de estado (`updateUIView`). Siguiente paso: estudia `UIViewControllerRepresentable` para envolver controladores completos. Errores comunes: poner lógica dependiente del estado en `makeUIView` en vez de `updateUIView`, olvidar limpiar anotaciones viejas antes de agregar las nuevas, y no implementar un Coordinator cuando la vista de UIKit necesita un delegate. Fuentes oficiales: https://developer.apple.com/documentation/swiftui/uiviewrepresentable y https://developer.apple.com/documentation/mapkit/mkmapview.

### Tema 7: UIViewControllerRepresentable y Coordinator · Avanzado · 35 min

#### Paso 1 · Objetivo y preparación
Al finalizar vas a envolver `UIImagePickerController` (para fotografiar la prueba de entrega) con `UIViewControllerRepresentable`, usando un `Coordinator` para recibir la foto de vuelta en SwiftUI. Prerrequisitos: Tema 5 de este módulo.
#### Paso 2 · Contexto y caso real
SwiftUI no tiene un picker de cámara propio; `UIImagePickerController` es un `UIViewController` completo de UIKit con su propio delegate, que SwiftUI no puede recibir directamente sin un puente.
#### Paso 3 · Teoría, modelo mental y analogía
`UIViewControllerRepresentable` envuelve el controlador completo; como el delegate de UIKit necesita un objeto que lo implemente (no una closure), un `Coordinator` actúa como ese delegate y reenvía el resultado hacia una `Binding` de SwiftUI.

**¿Por qué es importante?** Porque sin un Coordinator correctamente asignado como delegate, un `UIViewControllerRepresentable` puede parecer funcionar mientras falla silenciosamente en devolver el resultado a SwiftUI.
**Conceptos clave:** Coordinator como puente de delegate entre UIKit y SwiftUI, fallos silenciosos sin error visible.

**Diagrama: Coordinator como puente de delegate**

```mermaid
flowchart TD
    A["UIImagePickerController"] -->|delegate = context.coordinator| B["Coordinator\n(NSObject, UIImagePickerControllerDelegate)"]
    B -->|didFinishPickingMediaWithInfo| C["foto = info[.originalImage]"]
    C -->|Binding| D["Vista SwiftUI se actualiza"]
```

En tu propio proyecto RutaFlow, crea `SelectorFotoEntrega.swift` con **File ▸ New ▸ File ▸ Swift File**, selecciona el target de la app y escribe allí el representable y su `Coordinator`. Límite de la decisión: `UIViewControllerRepresentable` con `Coordinator` no conviene cuando SwiftUI ya expone una API nativa equivalente (como `PhotosPicker` para seleccionar de la galería) — ahí usar la API nativa es más simple; reservá este puente específicamente para controladores de UIKit sin equivalente SwiftUI directo, como `UIImagePickerController` con cámara.

#### Paso 4 · Demostración guiada
```swift
import SwiftUI
import UIKit

struct SelectorFotoEntrega: UIViewControllerRepresentable {
    @Binding var foto: UIImage?

    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.sourceType = .camera
        picker.delegate = context.coordinator
        return picker
    }

    func updateUIViewController(_ picker: UIImagePickerController, context: Context) {}

    func makeCoordinator() -> Coordinator { Coordinator(foto: $foto) }

    class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        @Binding var foto: UIImage?
        init(foto: Binding<UIImage?>) { _foto = foto }
        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
            foto = info[.originalImage] as? UIImage
        }
    }
}
```

**Ejecuta el ejemplo:**

```bash
xcodebuild -scheme RutaFlowApp -destination 'generic/platform=iOS Simulator' build
```
Luego corre con ⌘R en el simulador, o abre el canvas de Preview con ⌥⌘↵.

Resultado esperado: al tomar una foto, `imagePickerController(_:didFinishPickingMediaWithInfo:)` se dispara en el `Coordinator`, que asigna la imagen a `foto`; como `foto` es una `Binding` compartida con la vista que presentó el picker, esa vista se actualiza automáticamente con la nueva foto.
#### Paso 5 · Práctica guiada
Pista: quitá `picker.delegate = context.coordinator` de `makeUIViewController` — ese es el fallo deliberado: la cámara sigue abriéndose y tomando fotos con normalidad, pero `foto` nunca se actualiza, porque nadie quedó escuchando el callback del delegate; el fallo es silencioso, sin ningún error ni crash.
#### Paso 6 · Práctica independiente
Corregí el Paso 5 restaurando la asignación del delegate, y agregá el método `imagePickerControllerDidCancel` para cerrar el picker cuando el conductor cancela sin tomar foto.
#### Paso 7 · Cierre
Entregá el picker funcional del Paso 4, el fallo silencioso por delegate faltante del Paso 5, y el manejo de cancelación del Paso 6; explicá por qué un `UIViewController` con delegate de UIKit necesita específicamente un `Coordinator` (una clase), y no alcanzaría con una closure como en integraciones más simples. Siguiente paso: cerrá el módulo integrando esta pantalla al flujo de confirmación de entrega del proyecto integrador. Errores comunes: olvidar asignar el delegate al Coordinator, no manejar el caso de cancelación del picker, y actualizar estado de SwiftUI directamente desde el Coordinator sin pasar por una `Binding` o callback explícito. Fuentes oficiales: https://developer.apple.com/documentation/swiftui/uiviewcontrollerrepresentable y https://developer.apple.com/documentation/uikit/uiimagepickercontroller.

### Tema 8: Core ML y Vision — inferencia en el dispositivo · Avanzado · 45 min

#### Paso 1 · Objetivo y preparación
Al finalizar vas a leer el texto de una etiqueta de envío fotografiada con la cámara del Tema 7, usando Vision para el reconocimiento de texto (OCR) que ya viene integrado en el sistema, sin enviar la imagen a ningún servidor. Prerrequisitos: Tema 7 de este módulo (ya tienes la `UIImage` de la foto). No necesitas descargar ningún modelo: `VNRecognizeTextRequest` usa un modelo de Vision incluido en iOS.

#### Paso 2 · Contexto y caso real
En RutaFlow, el conductor fotografía la etiqueta del paquete y la app debe extraer el número de guía para confirmarlo contra la entrega esperada. Enviar cada foto a un servidor de OCR gastaría datos del conductor, no funcionaría sin cobertura y expondría información del destinatario; hacer el reconocimiento en el propio teléfono resuelve los tres problemas a la vez.

#### Paso 3 · Teoría, modelo mental y analogía
La inferencia en el dispositivo ejecuta un modelo ya entrenado localmente: la foto entra, el resultado sale, y nada viaja por la red. **Core ML** es el motor que corre modelos (`.mlmodel`) sobre CPU, GPU o Neural Engine; **Vision** es la capa de alto nivel para imágenes que, para tareas comunes como detección de texto, caras o rectángulos, trae sus propios modelos del sistema y no te obliga a aportar uno. Reconocer texto con Vision es como tener un lector entrenado dentro del teléfono: le muestras la foto y te devuelve las cadenas que encontró con su nivel de confianza, sin preguntar a nadie afuera.

**Analogía:** un servicio de OCR en la nube es como mandar la etiqueta por correo a una oficina para que la transcriban y te devuelvan la respuesta; Vision en el dispositivo es tener a esa persona sentada a tu lado leyéndola al instante, aunque no haya señal.

**¿Por qué es importante?** Porque la inferencia en el dispositivo entrega resultados sin conexión y sin exponer los datos del usuario a un servidor, pero su salida sigue siendo una hipótesis que debe validarse antes de tratarla como un dato de confianza.
**Conceptos clave:** inferencia en el dispositivo, Core ML, Vision, `VNRecognizeTextRequest`, nivel de reconocimiento, confianza y validación de la salida.

**Diagrama: la foto se procesa dentro del teléfono**

```mermaid
flowchart LR
    A["UIImage de la etiqueta\n(cámara, Tema 7)"] -->|cgImage| B["VNImageRequestHandler"]
    B -->|perform| C["VNRecognizeTextRequest\n(modelo de Vision del sistema)"]
    C -->|mejor candidato por región| D["Líneas de texto + confianza"]
    D -->|validar patrón| E["Número de guía confirmado"]
```

En tu propio proyecto RutaFlow, crea `OCREntrega.swift` con **File ▸ New ▸ File ▸ Swift File**, selecciona el target de la app y escribe allí el enum y la función del Paso 4. Límite de la decisión: la inferencia en el dispositivo no conviene cuando la tarea requiere un modelo demasiado grande para el teléfono o que debe actualizarse a diario para todos los usuarios — ahí un servicio en servidor puede ser más práctico; reservá el procesamiento local específicamente para tareas sensibles a la privacidad, que deben funcionar sin conexión o que responden mejor en tiempo real, como leer una etiqueta recién fotografiada.

---

#### Paso 4 · Demostración guiada
```swift
import Vision
import UIKit

enum OCREntrega {
    /// Extrae las líneas de texto de la foto de una etiqueta, en el dispositivo.
    static func leerEtiqueta(_ imagen: UIImage) async throws -> [String] {
        guard let cgImage = imagen.cgImage else { return [] }

        let request = VNRecognizeTextRequest()
        request.recognitionLevel = .accurate        // precisión sobre velocidad
        request.recognitionLanguages = ["es-ES", "en-US"]
        request.usesLanguageCorrection = true

        let handler = VNImageRequestHandler(cgImage: cgImage, orientation: .up)
        try handler.perform([request])

        let observaciones = request.results ?? []
        // De cada región, nos quedamos con la mejor hipótesis (topCandidates(1)).
        return observaciones.compactMap { $0.topCandidates(1).first?.string }
    }
}
```

**Ejecuta el ejemplo:** parte de otra carpeta vacía y crea el proyecto en Xcode con **File ▸ New ▸ Project ▸ App**, interfaz SwiftUI y nombre `RutaFlowApp`. Escribe el código en tu propio `OCREntrega.swift`, toma tú mismo una fotografía de una etiqueta para esta práctica y llama a `leerEtiqueta` desde una vista con esa imagen; no necesitas reutilizar la foto ni el proyecto del Tema 7. Confirma que compila con:

```bash
xcodebuild -scheme RutaFlowApp -destination 'generic/platform=iOS Simulator' build
```
Luego corre con ⌘R en el simulador (arrastra una imagen de una etiqueta a la ventana del simulador para simular la foto), o abre el canvas de Preview con ⌥⌘↵.

Resultado esperado: `leerEtiqueta` devuelve un arreglo con las líneas de texto detectadas en la etiqueta (por ejemplo, `["GUIA 4471-889", "Destino: Bogota"]`); todo ocurre localmente, por lo que funciona en modo avión.

#### Paso 5 · Práctica guiada
Pista: cambiá `request.recognitionLevel` a `.fast` y fotografiá una etiqueta con letra pequeña o impresa en baja calidad — ese es el fallo deliberado: Vision devuelve el resultado mucho más rápido pero con cadenas incompletas o mal transcritas (por ejemplo `"GU1A 447I-B89"`), porque el nivel `.fast` sacrifica precisión. Diagnosticá por qué el número de guía ahora no coincide con el esperado y por qué `.accurate` es el nivel correcto para texto que se usará como identificador exacto.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 volviendo a `.accurate`, y agregá un filtro que, de todas las líneas devueltas, se quede solo con la que parece un número de guía (por ejemplo, la que cumple un patrón como `GUIA` seguido de dígitos). Explicá en un comentario por qué conviene tratar la salida del OCR como una hipótesis a validar, no como un dato confiable.

**Proyecto integrador:** en el proyecto creado desde una carpeta vacía para este tema, conserva `OCREntrega.swift` y extrae la validación a `ValidadorGuia.swift`, con una expresión regular para tu formato `GUIA` seguido de dígitos. Crea `RutaFlowAppTests/ValidadorGuiaTests.swift` para aceptar una línea válida y rechazar `GU1A 447I-B89`, texto ajeno y dos guías ambiguas. Después fotografía tu propia etiqueta impresa, procesa la imagen en modo avión y muestra en `LecturaEtiquetaView.swift` el texto reconocido junto a la guía validada o un mensaje de revisión manual; no confirmes una entrega cuando el validador falle.

#### Paso 7 · Cierre
Entregá el OCR funcional del Paso 4, la degradación de precisión con `.fast` del Paso 5, y el filtro de número de guía del Paso 6; explicá por qué hacer la inferencia en el dispositivo protege los datos del destinatario y funciona sin conexión, y por qué aun así el resultado del OCR debe validarse antes de usarlo como identificador. Siguiente paso: cuando una tarea no tenga un modelo de sistema en Vision (por ejemplo, clasificar el estado del paquete con un modelo propio), entrená un `.mlmodel` con Create ML e intégralo con Core ML siguiendo el mismo patrón de inferencia local. Errores comunes: usar `.fast` para texto que es un identificador exacto, asumir que el OCR nunca se equivoca y usar su salida sin validar, y bloquear el hilo principal con `handler.perform` en imágenes grandes en vez de ejecutarlo fuera de la UI. Fuentes oficiales: https://developer.apple.com/documentation/vision/recognizing-text-in-images y https://developer.apple.com/documentation/coreml.

### Tema 9: WidgetKit: un widget con las entregas pendientes del día · Avanzado · 45 min

**Prerrequisito:** temas «Animaciones y matchedGeometryEffect» de este módulo y «@Model y ModelContainer» (módulo 6).

**Al finalizar podrás:** crear una extensión de widget con un `TimelineProvider` que muestre las entregas pendientes, compartir datos con la app mediante un App Group y pedir al sistema que recargue el widget cuando cambian.

**¿Por qué es importante?** El conductor mira el teléfono decenas de veces al día. Un widget le muestra lo pendiente sin abrir la app. Pero un widget no corre todo el tiempo: muestra una línea de tiempo que la app y el sistema actualizan.

#### Paso 1 · Objetivo y preparación

En Xcode, **File > New > Target > Widget Extension** con el nombre `PendientesWidget`. Activa en la app y en la extensión la capacidad **App Groups** con `group.co.rutaflow.app`.

#### Paso 2 · Contexto y caso real

Los conductores de RutaFlow abrían la app solo para ver cuántas entregas les quedaban. Con el widget en la pantalla de inicio, lo ven de un vistazo, y la app solo se abre para trabajar.

#### Paso 3 · Teoría, modelo mental y analogía

**Conceptos clave:** extensión de widget, `TimelineProvider`, `TimelineEntry`, política de recarga, App Group, `WidgetCenter.reloadTimelines`, familias de tamaño.

Un widget no es una mini app en ejecución: el sistema guarda una **línea de tiempo** de vistas ya calculadas y las muestra en su momento.

- `TimelineProvider` da un `placeholder` (mientras carga), un `snapshot` (para la galería) y un `timeline` (las entradas reales y cuándo pedir más).
- La **política** `.after(fecha)` le dice al sistema cuándo volver a pedir la línea de tiempo; el sistema limita cuántas recargas da al día.
- La app y el widget son procesos distintos: comparten datos por un **App Group** (un contenedor común o `UserDefaults(suiteName:)`).
- Cuando la app cambia los datos, llama `WidgetCenter.shared.reloadTimelines(ofKind:)` para pedir una recarga.

**Analogía:** el widget es la pizarra de una tienda: alguien escribe los precios del día y la pizarra no se actualiza sola. La app es quien vuelve a escribir cuando algo cambia. La analogía falla en que el sistema también decide cuántas veces al día se puede reescribir.

**Límite de uso:** no esperes actualizaciones en tiempo real: para eso existen las Live Activities. El widget no puede hacer peticiones largas; usa los datos que la app dejó en el App Group.

```mermaid
flowchart LR
    A["App: entrega confirmada"] -->|"guarda en App Group"| G[("group.co.rutaflow.app")]
    A -->|"reloadTimelines"| W["WidgetCenter"]
    W --> P["TimelineProvider"]
    P -->|"lee"| G
    P --> V["Vista: 3 pendientes"]
```

#### Paso 4 · Demostración guiada desde cero

Archivo `academia-ios/RutaFlowApp/PendientesWidget/PendientesWidget.swift`:

```swift
import SwiftUI
import WidgetKit

struct EntradaPendientes: TimelineEntry {
    let date: Date
    let pendientes: Int
}

struct Proveedor: TimelineProvider {
    private let datos = UserDefaults(suiteName: "group.co.rutaflow.app")

    func placeholder(in context: Context) -> EntradaPendientes { .init(date: .now, pendientes: 0) }

    func getSnapshot(in context: Context, completion: @escaping (EntradaPendientes) -> Void) {
        completion(.init(date: .now, pendientes: 3))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<EntradaPendientes>) -> Void) {
        let entrada = EntradaPendientes(date: .now, pendientes: datos?.integer(forKey: "pendientes") ?? 0)
        // Pide la siguiente línea de tiempo en 30 minutos (el sistema puede tardar más).
        completion(Timeline(entries: [entrada], policy: .after(.now.addingTimeInterval(30 * 60))))
    }
}

struct VistaPendientes: View {
    let entrada: EntradaPendientes
    var body: some View {
        VStack(alignment: .leading) {
            Text("\(entrada.pendientes)").font(.largeTitle.bold())
            Text("entregas pendientes").font(.caption)
        }
        .containerBackground(.fill.tertiary, for: .widget)
    }
}

@main
struct PendientesWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "Pendientes", provider: Proveedor()) { VistaPendientes(entrada: $0) }
            .configurationDisplayName("Entregas pendientes")
            .supportedFamilies([.systemSmall, .accessoryCircular])
    }
}
```

Archivo `academia-ios/RutaFlowApp/RutaFlowApp/ActualizarWidget.swift`:

```swift
import WidgetKit

func publicarPendientes(_ cantidad: Int) {
    UserDefaults(suiteName: "group.co.rutaflow.app")?.set(cantidad, forKey: "pendientes")
    WidgetCenter.shared.reloadTimelines(ofKind: "Pendientes") // pide al sistema recargar
}
```

Compila y ejecuta el esquema del widget:

```bash
xcodebuild -scheme RutaFlowApp -destination 'generic/platform=iOS Simulator' build
# ejecuta el esquema PendientesWidget para verlo en el simulador, o agrégalo desde la pantalla de inicio
```

**Explicación por bloques:** `EntradaPendientes` es lo que el widget muestra en un momento. `Proveedor` lee la cantidad del `UserDefaults` del App Group y devuelve una línea de tiempo con una entrada y la política de pedir otra en 30 minutos. `VistaPendientes` dibuja el número con el fondo de widget que exige iOS 17. En la app, `publicarPendientes` guarda la cantidad en el mismo App Group y pide recargar el widget de tipo «Pendientes».

**Resultado esperado:**

```text
En la galería de widgets aparece «Entregas pendientes» con el ejemplo de 3.
Al confirmar una entrega en la app (de 3 a 2 pendientes), el widget de la pantalla de inicio cambia a 2 en pocos segundos.
```

**Fallo deliberado:** usa `UserDefaults.standard` en el widget en lugar del App Group. **Error esperado:** el widget siempre muestra 0, aunque la app guarde la cantidad. **Diagnóstico:** la app y el widget son procesos distintos con almacenamientos separados. Comparte con `UserDefaults(suiteName:)` del App Group configurado en los dos targets.

#### Paso 5 · Práctica guiada

1. **Reproducción:** agrega el widget a la pantalla de inicio del simulador.
2. **Variación:** confirma una entrega en la app y mide cuánto tarda en cambiar el widget.
3. **Diagnóstico:** reproduce el fallo deliberado con `UserDefaults.standard`.
4. **Integración:** agrega la familia `.accessoryCircular` a la pantalla de bloqueo y adapta la vista con `@Environment(\.widgetFamily)`.
5. **Diseño:** decide qué información de RutaFlow cabe en un widget pequeño y cuál no.

**Pista:** si el widget no cambia, revisa el App Group en los dos targets y el `kind` usado al recargar.

#### Paso 6 · Práctica independiente

Agrega una entrada futura a la línea de tiempo que, a las 18:00, cambie el texto a «Jornada terminada» sin que la app tenga que recargar.

#### Paso 7 · Cierre

- [ ] Explicas qué es una línea de tiempo.
- [ ] El widget refleja los cambios de la app.
- [ ] Reprodujiste el problema de almacenamiento separado.
- [ ] Sabes cuándo usar Live Activities en su lugar.

Si fallas dos o más, vuelve al Paso 3. **Errores comunes:** esperar actualizaciones en tiempo real, no usar App Group y hacer peticiones de red largas en el proveedor. **Siguiente paso:** el tema siguiente expone acciones de la app a Siri y Atajos con App Intents.

**Transferencia al proyecto integrador «RutaFlow»:** agrega a la app del conductor de RutaFlow un widget con las entregas pendientes, actualizado al confirmar cada entrega.

**Fuente oficial:** [Apple — WidgetKit](https://developer.apple.com/documentation/widgetkit) y [Apple — Keeping a widget up to date](https://developer.apple.com/documentation/widgetkit/keeping-a-widget-up-to-date).

### Tema 10: App Intents: acciones de la app en Siri, Atajos y Spotlight · Avanzado · 40 min

**Prerrequisito:** tema «WidgetKit: un widget con las entregas pendientes del día» de este módulo.

**Al finalizar podrás:** crear un `AppIntent` que diga cuántas entregas quedan, exponerlo como atajo de la app con frases para Siri y probarlo desde la app Atajos.

**¿Por qué es importante?** Un conductor manejando no debe tocar el teléfono. Con App Intents, «Oye Siri, ¿cuántas entregas me quedan en RutaFlow?» responde sin abrir la app, y la misma acción aparece en Atajos y Spotlight.

#### Paso 1 · Objetivo y preparación

Continúa `RutaFlowApp` (iOS 17+). No necesitas una extensión: los App Intents viven en el target de la app. Usa el App Group del tema del widget para leer la cantidad.

#### Paso 2 · Contexto y caso real

Los conductores de RutaFlow preguntaban por radio a la central cuántas entregas les quedaban. Con un atajo de Siri, lo saben al instante, con las manos en el volante.

#### Paso 3 · Teoría, modelo mental y analogía

**Conceptos clave:** `AppIntent`, `perform()`, `IntentResult`, diálogo, `AppShortcutsProvider`, frase con `\(.applicationName)`, Atajos, Spotlight.

Un **`AppIntent`** es una acción de tu app descrita para el sistema: un título, parámetros opcionales y un método `perform()` que devuelve un resultado (un diálogo para que Siri lo diga, un valor, o abrir la app).

Con un **`AppShortcutsProvider`**, declaras **App Shortcuts**: intents listos para usar desde el primer momento, con frases para Siri. Cada frase debe incluir el nombre de la app (`\(.applicationName)`).

El sistema descubre los intents al compilar; no hay que registrarlos en tiempo de ejecución. El mismo intent sirve en Siri, la app Atajos, Spotlight y el botón de acción.

**Analogía:** un App Intent es un botón de tu app que el sistema puede pulsar por ti cuando el usuario se lo pide con la voz. La analogía falla en que el botón no necesita la pantalla de la app: puede responder sin abrirla.

**Límite de uso:** `perform()` debe ser rápido: el sistema corta las acciones largas. No expongas acciones destructivas sin confirmación (`requestConfirmation`).

```mermaid
sequenceDiagram
    participant U as Conductor
    participant S as Siri
    participant I as EntregasPendientesIntent
    participant G as App Group
    U->>S: "¿Cuántas entregas me quedan en RutaFlow?"
    S->>I: perform()
    I->>G: lee pendientes
    I-->>S: diálogo "Te quedan 3 entregas"
    S-->>U: lo dice en voz alta
```

#### Paso 4 · Demostración guiada desde cero

Archivo `academia-ios/RutaFlowApp/RutaFlowApp/EntregasPendientesIntent.swift`:

```swift
import AppIntents

struct EntregasPendientesIntent: AppIntent {
    static let title: LocalizedStringResource = "Entregas pendientes"
    static let description = IntentDescription("Dice cuántas entregas te quedan hoy.")

    func perform() async throws -> some IntentResult & ProvidesDialog {
        let pendientes = UserDefaults(suiteName: "group.co.rutaflow.app")?.integer(forKey: "pendientes") ?? 0
        let texto: String = switch pendientes {
        case 0: "No te quedan entregas. ¡Buen trabajo!"
        case 1: "Te queda 1 entrega."
        default: "Te quedan \(pendientes) entregas."
        }
        return .result(dialog: IntentDialog(stringLiteral: texto))
    }
}

struct AtajosRutaFlow: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: EntregasPendientesIntent(),
            phrases: [
                "¿Cuántas entregas me quedan en \(.applicationName)?",
                "Entregas pendientes en \(.applicationName)",
            ],
            shortTitle: "Pendientes",
            systemImageName: "shippingbox")
    }
}
```

Compila, ejecuta la app una vez y prueba el atajo:

```bash
xcodebuild -scheme RutaFlowApp -destination 'generic/platform=iOS Simulator' build
# ejecuta la app una vez; luego abre la app Atajos > Atajos de app > RutaFlow > Pendientes
```

**Explicación por bloques:** `EntregasPendientesIntent` declara título y descripción para el sistema. `perform()` lee la cantidad del App Group y arma un diálogo con el plural correcto; Siri lo lee en voz alta y Atajos lo muestra. `AtajosRutaFlow` publica el intent como App Shortcut con dos frases que incluyen el nombre de la app, un título corto y un símbolo. No hace falta registrar nada al arrancar: Xcode extrae los intents al compilar.

**Resultado esperado:**

```text
En la app Atajos, sección de RutaFlow, aparece «Pendientes».
Al ejecutarlo con 3 pendientes guardados, se muestra «Te quedan 3 entregas.».
En un dispositivo, «Oye Siri, entregas pendientes en RutaFlow» responde lo mismo en voz alta.
```

**Fallo deliberado:** quita `\(.applicationName)` de las frases. **Error esperado:** Xcode marca un error de compilación: las frases de un App Shortcut deben incluir el nombre de la aplicación. **Diagnóstico:** Siri necesita el nombre de la app para saber a quién pedirle la acción. Vuelve a incluirlo.

#### Paso 5 · Práctica guiada

1. **Reproducción:** ejecuta el atajo desde la app Atajos con 0, 1 y 3 pendientes.
2. **Variación:** agrega un parámetro `@Parameter var ciudad: String?` y úsalo en la respuesta.
3. **Diagnóstico:** reproduce el fallo deliberado sin el nombre de la app.
4. **Integración:** crea un segundo intent «Abrir mi próxima parada» con `openAppWhenRun = true`.
5. **Diseño:** lista qué acciones de RutaFlow tienen sentido por voz y cuáles necesitan pantalla.

**Pista:** si el atajo no aparece, ejecuta la app al menos una vez después de instalarla.

#### Paso 6 · Práctica independiente

Haz que el widget del tema anterior sea interactivo con un `Button(intent:)` que marque la siguiente entrega como «en camino» usando un App Intent.

#### Paso 7 · Cierre

- [ ] Explicas qué hace `perform()`.
- [ ] El atajo responde con el número correcto.
- [ ] Reprodujiste el error de la frase sin el nombre de la app.
- [ ] Sabes qué acciones no exponer sin confirmación.

Si fallas dos o más, vuelve al Paso 3. **Errores comunes:** hacer trabajo lento en `perform()`, olvidar el nombre de la app en las frases y exponer acciones destructivas sin confirmación. **Siguiente paso:** el tema «Core ML y Vision» agrega inteligencia en el dispositivo a estas acciones.

**Transferencia al proyecto integrador «RutaFlow»:** expón en la app del conductor de RutaFlow el App Shortcut «Pendientes» para Siri y Atajos.

**Fuente oficial:** [Apple — App Intents](https://developer.apple.com/documentation/appintents) y [Apple — App Shortcuts](https://developer.apple.com/documentation/appintents/app-shortcuts).

## Laboratorio práctico

Cierra el proyecto integrador RutaFlow probando, animando e interoperando con UIKit donde SwiftUI todavía no alcanza.

1. Escribe un test de cancelación cooperativa para `EnviosViewModel.cargar()` con Swift Testing, confirmando que una tarea cancelada no sobrescribe estado con una respuesta obsoleta.
2. Usa ViewInspector para confirmar que `ListaEnvios` muestra el texto "Sin envíos" exactamente cuando la lista está vacía, sin lanzar la app completa.
3. Compón dos búsquedas de ruta con `.switchToLatest()` y confirma que una respuesta tardía nunca sobrescribe a una más reciente.
4. Anima la transición de `TarjetaEnvio` a `DetalleEnvio` con `matchedGeometryEffect` y un `id` consistente entre ambas vistas.
5. Envuelve `MKMapView` con `UIViewRepresentable`, confirmando que `updateUIView` (no solo `makeUIView`) refleja cambios posteriores de las paradas.
6. Envuelve `UIImagePickerController` con `UIViewControllerRepresentable` y un `Coordinator`, confirmando que el delegate conectado entrega la foto capturada a la vista SwiftUI.

La entrega contiene el código de los seis Temas, los tests en verde, y la reproducción de cada fallo deliberado (cancelación ignorada, estructura rota, condición de carrera, `id` inconsistente, mapa congelado, delegate faltante) junto con su corrección.
