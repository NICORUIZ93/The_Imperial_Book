# Módulo 7: Combine y programación reactiva


## Aprende construyendo

### Tema 1: Publishers y Subscribers

#### Paso 1 · Objetivo y preparación
Al finalizar vas a conectar el campo de búsqueda de guía de RutaFlow a un `Publisher`, confirmando que cada letra tecleada emite un nuevo valor. Prerrequisitos: Módulo 6 completo.
#### Paso 2 · Contexto y caso real
El panel del operador de RutaFlow necesita filtrar la lista de envíos mientras alguien escribe una guía parcial ("RF-44") — eso es un flujo continuo de valores en el tiempo, no una única operación con un resultado final.
#### Paso 3 · Teoría, modelo mental y analogía
Un Publisher emite valores continuamente; un Subscriber reacciona a cada emisión — una emisora de radio que transmite mientras está encendida, distinta de una llamada puntual (`async`) que produce una única respuesta.
#### Paso 4 · Demostración guiada desde cero
```swift
class BuscadorEnviosViewModel: ObservableObject {
    @Published var textoBusqueda = ""
    private var cancelables = Set<AnyCancellable>()

    init() {
        $textoBusqueda
            .sink { valor in print("buscando: \(valor)") }
            .store(in: &cancelables)
    }
}
```

**Ejecuta el ejemplo** (crea el proyecto en Xcode: File ▸ New ▸ Project ▸ App, interfaz SwiftUI, nómbralo `RutaFlowApp`; pega el código y confirma que compila):

```bash
xcodebuild -scheme RutaFlowApp -destination 'platform=iOS Simulator,name=iPhone 15' build
```
Luego corre con ⌘R en el simulador, o abre el canvas de Preview con ⌥⌘↵.

Resultado esperado: cada letra que se escribe en `textoBusqueda` imprime una línea nueva — `$textoBusqueda` emite un valor por cada cambio, no una sola vez al final.
#### Paso 5 · Práctica guiada
Pista: quitá `.store(in: &cancelables)` de la suscripción — ese es el fallo deliberado: la suscripción se cancela inmediatamente al salir de ámbito del `init`, y el `sink` nunca vuelve a imprimir nada aunque `textoBusqueda` siga cambiando.
#### Paso 6 · Práctica independiente
Corregí el Paso 5 restaurando `.store(in:)`, y agregá un segundo `sink` sobre el mismo `$textoBusqueda` que cuente cuántas letras tiene el texto actual — confirmá que ambos `sink` reciben cada emisión de forma independiente.
#### Paso 7 · Cierre
Entregá el Publisher emitiendo por cada letra del Paso 4, la suscripción perdida del Paso 5, y los dos `sink` independientes del Paso 6; explicá por qué una búsqueda en tiempo de escritura necesita un flujo continuo, no una función `async` puntual. Siguiente paso: estudia testing. Errores comunes: AnyCancellable perdido, debounce mal ubicado, errores ignorados y mezclar paradigmas sin frontera. Fuentes oficiales: https://developer.apple.com/documentation/combine y https://developer.apple.com/documentation/swift/concurrency.
**¿Por qué es importante?** Porque un Publisher modela un flujo continuo de valores en el tiempo, no una única respuesta puntual, y sin `.store(in:)` la suscripción se cancela apenas sale de ámbito, dejando de reaccionar a cambios futuros.
**Conceptos clave:** flujo continuo de valores en el tiempo, no una única respuesta puntual.

```swift
class BuscadorViewModel: ObservableObject {
    @Published var texto = ""
    private var cancelables = Set<AnyCancellable>()

    init() {
        $texto
            .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
            .removeDuplicates()
            .sink { [weak self] valor in self?.buscar(valor) }
            .store(in: &cancelables)
    }
}
```

`$texto` (el prefijo `$` sobre una propiedad `@Published`) expone un `Publisher`: un flujo continuo de valores en el tiempo que emite cada vez que la propiedad subyacente cambia, a diferencia de una función `async` que representa una única operación con un resultado final puntual; un `Subscriber` (aquí, el closure dentro de `.sink { }`) se suscribe a ese Publisher para reaccionar a cada emisión, y `.store(in: &cancelables)` retiene esa suscripción activa mientras el `ViewModel` viva, cancelándola automáticamente cuando ese conjunto de cancelables se libera.

Este modelo de "flujo continuo de valores observables" es conceptualmente el mismo que `Flow` en Kotlin (Módulo 2 del track de Kotlin Multiplatform) o los Observables de RxJS/RxJava, todos resolviendo el mismo problema fundamental de modelar secuencias de eventos asíncronos a lo largo del tiempo, con distintas sintaxis y ecosistemas de operadores según el lenguaje.

**Analogía:** un Publisher es como una emisora de radio que transmite continuamente mientras está encendida, y un Subscriber es un receptor sintonizado que reacciona a cada nueva transmisión, en contraste con una llamada telefónica puntual (una función `async`) que produce una única respuesta y luego termina.

**¿Por qué es importante?** Combine modela flujos continuos de valores en el tiempo, un caso de uso distinto al de `async`/`await` (una única operación con resultado final), compartiendo el mismo principio fundamental que `Flow` en Kotlin o RxJS en JavaScript.

**Código del ejemplo:**

```swift
$texto
    .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
    .removeDuplicates()
    .sink { valor in buscar(valor) }
```

* Código: `examples/rutaflow/ios/ContentView.swift`
* Proyecto: proyecto integrador RutaFlow
* Visualización: concepto mostrado en diagrama

### Tema 2: Operadores: debounce y combineLatest

#### Paso 1 · Objetivo y preparación
Al finalizar vas a agregar `debounce` a la búsqueda de guía de RutaFlow (Tema 1) y a combinar texto + filtro de zona con `combineLatest`. Prerrequisitos: Tema 1 de este módulo.
#### Paso 2 · Contexto y caso real
El panel del operador dispara una consulta real a `ShipmentEvents` por cada letra escrita hoy — eso sobrecarga el backend sin necesidad; además, el operador también puede filtrar por zona, y ambos filtros (texto + zona) deben combinarse en una sola búsqueda.
#### Paso 3 · Teoría, modelo mental y analogía
`debounce` espera un silencio antes de emitir, como esperar a que alguien termine de hablar antes de responder; `combineLatest` reacciona a cualquiera de dos fuentes, siempre con el último valor conocido de la otra.
#### Paso 4 · Demostración guiada desde cero
```swift
$textoBusqueda
    .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
    .removeDuplicates()
    .sink { valor in print("buscando guía: \(valor)") }
    .store(in: &cancelables)

Publishers.CombineLatest($textoBusqueda, $zonaFiltro)
    .sink { texto, zona in print("filtrar: \(texto) en \(zona)") }
    .store(in: &cancelables)
```

**Ejecuta el ejemplo** (crea el proyecto en Xcode: File ▸ New ▸ Project ▸ App, interfaz SwiftUI, nómbralo `RutaFlowApp`; pega el código y confirma que compila):

```bash
xcodebuild -scheme RutaFlowApp -destination 'platform=iOS Simulator,name=iPhone 15' build
```
Luego corre con ⌘R en el simulador, o abre el canvas de Preview con ⌥⌘↵.

Resultado esperado: escribir "RF-4471" letra por letra solo dispara UN `print` de búsqueda, 300ms después de la última letra; cambiar `zonaFiltro` sin tocar el texto vuelve a imprimir el filtro combinado, reusando el último texto conocido.
#### Paso 5 · Práctica guiada
Pista: quitá `.debounce(...)` de la primera cadena — ese es el fallo deliberado: ahora "buscando guía:" se imprime una vez por cada letra tecleada, siete veces para "RF-4471" en vez de una sola vez tras terminar de escribir, exactamente la sobrecarga de backend que `debounce` existe para evitar.
#### Paso 6 · Práctica independiente
Corregí el Paso 5 restaurando `debounce`, y medí cuánto tiempo real pasa entre la última letra tecleada y la emisión del valor con `debounce` — confirmando que es consistente con los 300ms configurados.
#### Paso 7 · Cierre
Entregá el debounce funcionando del Paso 4, la sobrecarga sin debounce del Paso 5, y la medición de tiempo del Paso 6; explicá por qué `combineLatest` no necesita que ambas fuentes cambien al mismo tiempo para producir un valor combinado útil. Siguiente paso: estudia testing. Errores comunes: AnyCancellable perdido, debounce mal ubicado, errores ignorados y mezclar paradigmas sin frontera. Fuentes oficiales: https://developer.apple.com/documentation/combine y https://developer.apple.com/documentation/swift/concurrency.
**¿Por qué es importante?** Porque `debounce` evita disparar una búsqueda costosa en cada tecla individual, y `combineLatest` reacciona a cualquiera de dos fuentes de estado independientes sin tener que coordinar manualmente cuál cambió más recientemente.
**Conceptos clave:** transformación declarativa de un flujo, reacción a múltiples fuentes simultáneas.

`debounce(for:scheduler:)` espera un intervalo de silencio (aquí, 300 milisegundos sin nuevos cambios) antes de emitir el valor más reciente, un patrón extremadamente común para buscadores en tiempo real: evita disparar una búsqueda en cada tecla presionada individualmente, esperando en cambio a que el usuario deje de escribir por un breve instante antes de ejecutar la búsqueda real, el mismo operador `debounceTime` estudiado en RxJS dentro de Angular (Módulo 1 del track de Angular), reflejando que este patrón de "esperar silencio antes de reaccionar" es universal en programación reactiva independientemente del ecosistema.

```swift
Publishers.CombineLatest($filtro, $orden)
    .sink { filtro, orden in actualizarLista(filtro, orden) }
    .store(in: &cancelables)
```

`combineLatest` combina dos (o más) Publishers, re-emitiendo un valor combinado cada vez que **cualquiera** de los Publishers de origen emite un nuevo valor, usando siempre el último valor conocido del otro Publisher que no cambió en ese instante; esto es apropiado cuando una acción depende de múltiples fuentes de estado independientes que pueden cambiar en momentos distintos (un filtro de búsqueda y un criterio de ordenamiento, cada uno modificable independientemente por el usuario), sin necesidad de coordinar manualmente cuál cambió más recientemente.

**Analogía:** `debounce` es como esperar a que alguien termine completamente de hablar antes de responder, en vez de interrumpir después de cada palabra individual; `combineLatest` es como un tablero que se actualiza automáticamente cada vez que cualquiera de dos indicadores independientes cambia, mostrando siempre la combinación más reciente de ambos sin importar cuál se actualizó más recientemente.

**Código del ejemplo:**

```swift
Publishers.CombineLatest($filtro, $orden)
    .sink { filtro, orden in actualizarLista(filtro, orden) }
```

* Código: `examples/rutaflow/ios/ContentView.swift`
* Proyecto: proyecto integrador RutaFlow
* Visualización: concepto mostrado en diagrama

**Límites y decisión de uso:** Debounce retrasa emisiones y puede ser inapropiado para acciones que deben ejecutarse inmediatamente. combineLatest necesita valores de sus fuentes; define estados iniciales y prueba ausencia de datos para no dejar la pantalla esperando sin explicación.

### Tema 3: Combine vs async/await

#### Paso 1 · Objetivo y preparación
Al finalizar vas a decidir, para dos operaciones reales de RutaFlow, cuál necesita Combine y cuál debería ser simplemente `async`/`await`. Prerrequisitos: Tema 2 de este módulo, Módulo 4 completo.
#### Paso 2 · Contexto y caso real
Buscar envíos mientras el operador escribe (Temas 1-2) es un flujo continuo; confirmar una entrega (`confirmarEntrega`, Módulo 5) es una única operación con un resultado final — mezclar ambos modelos donde no corresponde complica el código sin necesidad.
#### Paso 3 · Teoría, modelo mental y analogía
`async`/`await` es un pedido puntual con una fecha de entrega esperada; Combine es un boletín periódico al que te suscribís — elegir mal entre los dos no rompe nada de inmediato, pero complica el código innecesariamente.
#### Paso 4 · Demostración guiada desde cero
```swift
// Flujo continuo: correcto con Combine (Temas 1-2)
$textoBusqueda.debounce(for: .milliseconds(300), scheduler: RunLoop.main).sink { ... }

// Operación puntual: correcto con async/await (Módulo 5), NO con Combine
let resultado = try await confirmarEntrega(guia: "RF-4471", pin: "837201")
```

**Ejecuta el ejemplo** (crea el proyecto en Xcode: File ▸ New ▸ Project ▸ App, interfaz SwiftUI, nómbralo `RutaFlowApp`; pega el código y confirma que compila):

```bash
xcodebuild -scheme RutaFlowApp -destination 'platform=iOS Simulator,name=iPhone 15' build
```
Luego corre con ⌘R en el simulador, o abre el canvas de Preview con ⌥⌘↵.

Resultado esperado: la búsqueda en vivo usa Combine porque nunca "termina" mientras la pantalla esté abierta; `confirmarEntrega` usa `async`/`await` porque es una sola llamada con un resultado final, sin necesidad de ningún `AnyCancellable`.
#### Paso 5 · Práctica guiada
Pista: reescribí `confirmarEntrega` como un `Publisher` con `Future` en vez de una función `async` — ese es el fallo deliberado de elegir la herramienta equivocada: ahora necesitás gestionar un `AnyCancellable` y un `.store(in:)` para una operación que de por sí termina una sola vez, agregando complejidad de gestión de vida que `async`/`await` nunca necesitó.
#### Paso 6 · Práctica independiente
Identificá, en la app de RutaFlow, una tercera operación real que SÍ necesitaría Combine por ser un flujo continuo (pista: las actualizaciones de ubicación GPS del conductor, que llegan repetidamente mientras la app está abierta) y justificá por qué no encajaría bien como una única función `async`.
#### Paso 7 · Cierre
Entregá la clasificación correcta del Paso 4, la complejidad innecesaria de forzar Combine del Paso 5, y la tercera operación identificada del Paso 6; explicá por qué algunas APIs de Apple (Core Location, NotificationCenter) siguen exponiendo Combine aunque tu propio código prefiera `async`/`await`. Siguiente paso: estudia testing. Errores comunes: AnyCancellable perdido, debounce mal ubicado, errores ignorados y mezclar paradigmas sin frontera. Fuentes oficiales: https://developer.apple.com/documentation/combine y https://developer.apple.com/documentation/swift/concurrency.
**¿Por qué es importante?** Porque forzar Combine sobre una operación puntual (como `confirmarEntrega`) agrega gestión de `AnyCancellable` que `async`/`await` nunca necesitó, mientras que un flujo continuo real sí requiere las herramientas de Combine.
**Conceptos clave:** una operación puntual frente a un flujo continuo, cada uno con su herramienta apropiada.

Para una secuencia única de pasos asíncronos dependientes entre sí (cargar datos, luego procesar ese resultado, luego mostrar), `async`/`await` (Módulo 4) es considerablemente más simple de leer, dado que se expresa como código lineal secuencial; para streams continuos de valores que ocurren repetidamente a lo largo del tiempo (el texto de un campo cambiando con cada tecla, la ubicación GPS actualizándose periódicamente, notificaciones del sistema), Combine sigue siendo el modelo más natural, dado que estos casos de uso no encajan bien en el modelo de "una única operación con un resultado final" que `async`/`await` representa.

Muchas APIs nativas de Apple (Core Location para actualizaciones de ubicación, `NotificationCenter` para eventos del sistema) todavía exponen Publishers de Combine de forma nativa, por lo que entender Combine sigue siendo necesario incluso en código nuevo que prefiere `async`/`await` para su propia lógica, simplemente para poder integrarse correctamente con esas APIs del sistema que exponen sus eventos de esa forma.

**Analogía:** elegir entre Combine y `async`/`await` es como elegir entre suscribirse a un boletín periódico (Combine, para actualizaciones recurrentes) o hacer un pedido puntual con una fecha de entrega esperada (`async`/`await`, para una operación única con un resultado final): ambos son mecanismos de comunicación asíncrona válidos, apropiados para necesidades distintas.

**¿Por qué es importante?** Muchos equipos prefieren `async`/`await` para código nuevo que representa operaciones puntuales, reservando Combine específicamente para flujos continuos de eventos, y manteniendo el conocimiento de Combine necesario para integrarse con APIs de Apple que todavía exponen Publishers nativamente.

**Diagrama:**

```
async/await  → una operación puntual con resultado final (cargar datos una vez)
Combine      → flujo continuo de valores en el tiempo (texto cambiando, ubicación actualizándose)
```

**Diagrama: decisión Combine vs async/await**

```mermaid
flowchart TD
    A["¿La operación es un flujo\ncontinuo o un resultado único?"] -->|Flujo continuo| B["Combine\n($texto.debounce, Core Location)"]
    A -->|Resultado único| C["async/await\n(confirmarEntrega)"]
```

En el proyecto integrador RutaFlow, `confirmarEntrega` vive en `examples/rutaflow/ios/DetalleEntregaView.swift` y la búsqueda con debounce en `examples/rutaflow/ios/ContentView.swift`.

---


## Laboratorio práctico

**Objetivo del laboratorio:** construir un buscador con debounce implementado con Combine.

**Requisitos previos:** Módulo 6 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Declarar `@Published var texto` y observar con `sink` | Ver Tema 1 | En un `ObservableObject` |
| 2 | Implementar `debounce` sobre los cambios de texto | Ver Tema 2 | Espera silencio antes de buscar |
| 3 | Combinar dos Publishers con `combineLatest` | Ver Tema 2 | Reacciona a cualquiera de los dos |
| 4 | Documentar cuándo seguir usando Combine | Ver Tema 3 | Frente a `async`/`await` |

**Verificación:** el laboratorio se considera exitoso si el buscador no dispara una búsqueda en cada tecla individual (solo tras un breve silencio), y si `combineLatest` reacciona correctamente cuando cualquiera de las dos fuentes combinadas cambia.

**Errores comunes y soluciones**

- **Disparar la búsqueda en cada cambio de texto sin debounce.** Sobrecarga innecesariamente el backend con peticiones excesivas; usa `debounce`.
- **Usar Combine para una secuencia única de pasos asíncronos dependientes.** Prefiere `async`/`await`, más simple de leer para ese caso.
- **Olvidar `.store(in:)` una suscripción de Combine.** La suscripción se cancela inmediatamente al salir de ámbito si no se retiene.

---

* Código: `examples/rutaflow/ios/ContentView.swift`
* Proyecto: proyecto integrador RutaFlow
* Visualización: concepto mostrado en diagrama
