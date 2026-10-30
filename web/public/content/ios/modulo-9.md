# Módulo 9: Testing en iOS


## Aprende construyendo

### Tema 1: XCTest clásico y Swift Testing

#### Paso 1 · Objetivo y preparación
Al finalizar vas a escribir el mismo test para `EsEnvioAtrasado` (Módulo 8) dos veces: una con XCTest clásico y otra con Swift Testing, para comparar su sintaxis sobre el mismo caso real. Prerrequisitos: Módulo 8 completo.

#### Paso 2 · Contexto y caso real
El equipo de RutaFlow tiene tests viejos escritos con XCTest y quiere decidir si migrar los tests nuevos a Swift Testing vale la pena — necesitan ver ambas sintaxis resolviendo exactamente el mismo caso.

#### Paso 3 · Teoría, modelo mental y analogía
XCTest exige heredar de `XCTestCase` y elegir la aserción específica (`XCTAssertEqual`, `XCTAssertTrue`); Swift Testing usa `struct`s comunes con `@Test` y una única macro `#expect` para cualquier expresión booleana — un formulario con una casilla por tipo de verificación frente a una sola pregunta abierta.

#### Paso 4 · Demostración guiada desde cero
```swift
// XCTest clásico
import XCTest
final class EsEnvioAtrasadoTests: XCTestCase {
    func testEnvioVencidoEstaAtrasado() {
        let envio = Envio(fechaEstimada: Date().addingTimeInterval(-3600))
        XCTAssertTrue(EsEnvioAtrasado().ejecutar(envio))
    }
}

// Swift Testing
import Testing
struct EsEnvioAtrasadoTests {
    @Test func envioVencidoEstaAtrasado() {
        let envio = Envio(fechaEstimada: Date().addingTimeInterval(-3600))
        #expect(EsEnvioAtrasado().ejecutar(envio))
    }
}
```

**Ejecuta el ejemplo** (crea el proyecto en Xcode: File ▸ New ▸ Project ▸ App, interfaz SwiftUI, nómbralo `RutaFlowApp`; pega el código y confirma que compila):

```bash
xcodebuild -scheme RutaFlowApp -destination 'platform=iOS Simulator,name=iPhone 15' build
```
Luego corre con ⌘R en el simulador, o abre el canvas de Preview con ⌥⌘↵.

Resultado esperado: ambos tests verifican exactamente la misma regla de `EsEnvioAtrasado` (Módulo 8) sobre un envío con fecha estimada una hora en el pasado; el de Swift Testing es más corto porque `#expect` reemplaza la elección entre `XCTAssertTrue`, `XCTAssertEqual` y el resto de variantes.

#### Paso 5 · Práctica guiada
Pista: en el test de Swift Testing, cambiá `addingTimeInterval(-3600)` por `addingTimeInterval(3600)` (una hora en el futuro) sin cambiar el nombre del test — ese es el fallo deliberado: el test se sigue llamando "envioVencidoEstaAtrasado" pero ahora verifica justo lo contrario, y falla con un mensaje que no deja claro por qué.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 devolviendo `-3600`, y agregá un segundo test (en Swift Testing) que confirme que un envío con fecha estimada en el futuro NO está atrasado, usando `#expect(!EsEnvioAtrasado().ejecutar(envio))`.

#### Paso 7 · Cierre y evidencia
Entregá los dos tests equivalentes del Paso 4, el fallo por fecha invertida del Paso 5, y el test del caso contrario del Paso 6; explicá con tus propias palabras qué gana Swift Testing frente a XCTest clásico en este caso, y qué NO cambia entre ambos (la regla de negocio verificada es idéntica). Siguiente paso: estudia cómo testear código async. Errores comunes: nombre de test que no coincide con lo que realmente verifica, elegir el `XCTAssert` incorrecto, y mezclar XCTest y Swift Testing sin un criterio claro de cuándo usar cada uno. Fuentes oficiales: https://developer.apple.com/documentation/testing y https://developer.apple.com/documentation/xctest.
**¿Por qué es importante?** Porque Swift Testing simplifica la sintaxis de verificación sin cambiar qué se verifica, y elegir mal entre ambos frameworks es un error de ergonomía, no de lógica.
**Evidencia de aprendizaje:** entrega dos tests equivalentes, fallo detectado y test del caso contrario.
**Conceptos clave:** sintaxis más concisa de Swift Testing, misma capacidad fundamental de verificación que XCTest.

```swift
import XCTest

final class CalculadoraTests: XCTestCase {
    func testSuma() {
        XCTAssertEqual(Calculadora().sumar(2, 3), 5)
    }
}
```

```swift
import Testing

struct CalculadoraTests {
    @Test func suma() {
        #expect(Calculadora().sumar(2, 3) == 5)
    }
}
```

XCTest, el framework de pruebas clásico de Apple, requiere heredar de `XCTestCase` y usar variantes específicas de aserción (`XCTAssertEqual`, `XCTAssertTrue`, `XCTAssertNil`, cada una para un tipo distinto de comparación); Swift Testing, el framework moderno introducido más recientemente, reemplaza esa API con una sintaxis considerablemente más concisa: cualquier `struct` puede contener tests marcados con `@Test`, y una única macro `#expect` (que acepta cualquier expresión booleana) reemplaza todas las variantes específicas de `XCTAssert`, además de ofrecer mejor soporte nativo para tests parametrizados (ejecutar el mismo test con múltiples conjuntos de datos de entrada) y paralelización de ejecución por defecto, reduciendo el tiempo total de la suite de tests en proyectos grandes.

Esta evolución de framework de testing (de una API más verbosa basada en herencia de clase, hacia una sintaxis más ligera basada en macros) refleja una tendencia similar observada en otros lenguajes hacia frameworks de testing más expresivos y con menos boilerplate, aunque el objetivo fundamental (verificar que el código se comporta según lo esperado) permanece idéntico entre ambos frameworks.

**Analogía:** XCTest es como un formulario de evaluación estandarizado con casillas específicas para cada tipo de verificación (una casilla para "es igual a", otra para "es verdadero", otra para "es nulo"); Swift Testing es como una única pregunta abierta de verificación ("¿esto es cierto?") que se adapta a cualquier tipo de comparación sin necesitar una casilla distinta para cada caso.

**¿Por qué es importante?** Swift Testing ofrece una sintaxis considerablemente más concisa que XCTest clásico, además de mejor soporte para tests parametrizados y paralelización por defecto, aunque ambos frameworks cumplen la misma función fundamental de verificación de comportamiento.

**Código del ejemplo:**

```swift
// XCTest
XCTAssertEqual(Calculadora().sumar(2, 3), 5)

// Swift Testing
#expect(Calculadora().sumar(2, 3) == 5)
```

* Código: `examples/rutaflow/ios/ContentView.swift`
* Proyecto: proyecto integrador RutaFlow
* Visualización: concepto mostrado en diagrama

### Tema 2: Testing de código async

#### Paso 1 · Objetivo y preparación
Al finalizar vas a testear `confirmarEntrega` (Módulo 5) con Swift Testing, marcando el test mismo como `async` en vez de usar una `XCTestExpectation` manual. Prerrequisitos: Módulo 5 completo, Tema 1 de este módulo.

#### Paso 2 · Contexto y caso real
`confirmarEntrega` es una función `async throws`; testearla con el modelo antiguo de callbacks exigiría crear una `XCTestExpectation`, cumplirla dentro de un callback y esperarla con un timeout manual, solo para una operación que ya es una única llamada con resultado final.

#### Paso 3 · Teoría, modelo mental y analogía
Marcar el test mismo como `async` permite usar `await` directamente dentro del test, exactamente como en cualquier otro contexto asíncrono — poder simplemente esperar el resultado de un trámite, en vez de configurar una alarma de tiempo límite de antemano.

#### Paso 4 · Demostración guiada desde cero
```swift
@Test func confirmarEntregaDelConductorAsignado() async throws {
    let resultado = try await confirmarEntrega(guia: "RF-4471", pin: "837201")
    #expect(resultado.estado == .entregado)
}
```

**Ejecuta el ejemplo** (crea el proyecto en Xcode: File ▸ New ▸ Project ▸ App, interfaz SwiftUI, nómbralo `RutaFlowApp`; pega el código y confirma que compila):

```bash
xcodebuild -scheme RutaFlowApp -destination 'platform=iOS Simulator,name=iPhone 15' build
```
Luego corre con ⌘R en el simulador, o abre el canvas de Preview con ⌥⌘↵.

Resultado esperado: el test completa cuando `confirmarEntrega` efectivamente retorna, sin ningún `XCTestExpectation` ni timeout configurado a mano — `await` dentro de un test `async` espera exactamente como en código de producción.

#### Paso 5 · Práctica guiada
Pista: quitá `async` de la firma del test pero dejá el `await` adentro — ese es el fallo deliberado: el proyecto deja de compilar, porque `await` solo es válido dentro de un contexto asíncrono, y un test sin `async` no lo es.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 restaurando `async`, y agregá un segundo test que llame a `confirmarEntrega` con un PIN incorrecto y confirme (con `#expect(throws:)` o un `do/catch`) que lanza el error esperado, en vez de retornar un resultado "entregado" falso.

#### Paso 7 · Cierre y evidencia
Entregá el test async del Paso 4, el error de compilación del Paso 5, y el test del PIN incorrecto del Paso 6; explicá por qué testear una función `async throws` con `await` directo en el test es más simple que el modelo de callbacks + `XCTestExpectation`. Siguiente paso: estudia UI Tests con XCUITest. Errores comunes: olvidar `async` en la firma del test, testear solo el camino feliz sin el camino de error, y usar timeouts arbitrariamente largos "por si acaso". Fuentes oficiales: https://developer.apple.com/documentation/testing y https://developer.apple.com/documentation/swift/concurrency.
**¿Por qué es importante?** Porque marcar el test como `async` permite usar `await` directo, sin expectativas manuales, simplificando el testing de funciones `async throws` como `confirmarEntrega`.
**Evidencia de aprendizaje:** entrega test async del camino feliz, error de compilación detectado y test del camino de error.
**Conceptos clave:** el test mismo puede ser una función suspendible, sin expectativas manuales.

```swift
@Test func obtieneUsuario() async throws {
    let usuario = try await servicio.obtenerUsuario(id: "1")
    #expect(usuario.nombre == "Ana")
}
```

Testear una función `async` (Módulo 4) con Swift Testing simplemente requiere marcar la función de test misma como `async`, permitiendo usar `await` directamente dentro del cuerpo del test exactamente como en cualquier otro contexto asíncrono; esto contrasta con el modelo previo de testing de código asíncrono basado en callbacks, que requería crear manualmente una `XCTestExpectation`, cumplirla explícitamente dentro del callback de la operación asíncrona bajo prueba, y esperar esa expectativa con un timeout configurado manualmente, un mecanismo considerablemente más verboso y propenso a errores (olvidar cumplir la expectativa deja el test colgado hasta que expire el timeout) que simplemente escribir `await` de forma lineal.

Esta simplificación de testing async es directamente análoga a `runTest` en Kotlin (Módulo 9 del track de Kotlin Multiplatform) y a testear hooks async en React con `renderHook` (Módulo 8 del track de React): todos los ecosistemas modernos de testing han convergido hacia permitir que el propio test sea una función asíncrona nativa, en vez de requerir mecanismos indirectos de espera basados en callbacks o expectativas manuales.

**Analogía:** testear código async con `await` directo en el test es como poder simplemente esperar el resultado de un trámite y continuar cuando llega, en vez de tener que configurar de antemano una alarma de tiempo límite y un mecanismo de notificación manual para saber cuándo el trámite efectivamente concluyó.

**¿Por qué es importante?** Marcar el test mismo como `async` permite usar `await` directamente, sin necesidad de expectativas manuales (`XCTestExpectation`) como en el modelo basado en callbacks previo, simplificando considerablemente el testing de código asíncrono.

**Código del ejemplo:**

```swift
@Test func obtieneUsuario() async throws {
    let usuario = try await servicio.obtenerUsuario(id: "1")
    #expect(usuario.nombre == "Ana")
}
```

* Código: `examples/rutaflow/ios/ContentView.swift`
* Proyecto: proyecto integrador RutaFlow
* Visualización: concepto mostrado en diagrama

### Tema 3: UI Tests con XCUITest

#### Paso 1 · Objetivo y preparación
Al finalizar vas a escribir un XCUITest que lance la app de RutaFlow, complete guía y PIN en la pantalla de confirmación de entrega, y verifique que aparece "Entrega confirmada". Prerrequisitos: Tema 2 de este módulo.

#### Paso 2 · Contexto y caso real
Un test unitario de `confirmarEntrega` (Tema 2) prueba la lógica en memoria, pero nadie confirmó todavía que un conductor real, tocando la pantalla, efectivamente ve el resultado — eso exige lanzar la app real y simular la interacción.

#### Paso 3 · Teoría, modelo mental y analogía
XCUITest lanza la app compilada e instalada y simula interacciones reales (`tap`, `typeText`) contra la UI efectivamente renderizada — una inspección de calidad de punta a punta, mucho más lenta que verificar un componente aislado en un banco de pruebas.

**Evidencia de aprendizaje:** entrega test del flujo feliz, falla intermitente detectada y test del flujo de error.
**Conceptos clave:** simulación de interacciones reales contra la app compilada, más lento pero valida el recorrido end-to-end.

```swift
func testCrearTarea() {
    let app = XCUIApplication()
    app.launch()
    app.buttons["Agregar"].tap()
    app.textFields["titulo"].typeText("Nueva tarea")
    app.buttons["Guardar"].tap()
    XCTAssertTrue(app.staticTexts["Nueva tarea"].exists)
}
```

XCUITest lanza la app real (compilada e instalada, no solo componentes aislados en memoria) y simula interacciones reales de usuario (`tap`, `typeText`) contra la UI efectivamente renderizada, permitiendo validar un flujo completo end-to-end (crear una tarea y verificar que aparece correctamente en la lista) exactamente como lo experimentaría un usuario real; esto lo hace considerablemente más lento y frágil que un unit test de la capa de dominio (que ejecuta lógica pura en memoria sin necesidad de lanzar toda la app ni renderizar ninguna UI real), y más propenso a fallar por razones ajenas a la lógica bajo prueba, como cambios de layout, timing de animaciones, o inestabilidad del simulador.

Esta distinción de velocidad y fragilidad entre unit tests y UI tests refleja la misma "pirámide de tests" estudiada en el track de Spring Boot (Módulo 6 de ese track) y con Espresso en Android (Módulo 9 de ese track): se recomienda tener muchos unit tests rápidos cubriendo la lógica de negocio, y reservar los UI tests end-to-end, más costosos de ejecutar y mantener, para validar únicamente los flujos críticos de la app.

**Analogía:** un UI Test es como una inspección completa de calidad que recorre todo el proceso de fabricación de un producto de principio a fin, tal como lo experimentaría el cliente final; un unit test de la capa de dominio es como verificar un componente aislado en un banco de pruebas de laboratorio — ambos son necesarios, pero el primero es considerablemente más costoso de ejecutar repetidamente.

**¿Por qué es importante?** Un UI Test valida el flujo completo end-to-end tal como lo experimenta el usuario real, pero es más lento y frágil que un unit test de la capa de dominio, que ejecuta lógica pura sin necesidad de lanzar toda la app ni renderizar UI real.

**Diagrama:**

```
Unit tests de dominio (Swift Testing) → rápidos, muchos, base de la pirámide
UI Tests (XCUITest)                   → lentos, pocos, solo flujos críticos end-to-end
```

**Diagrama: XCUITest esperando la UI real**

```mermaid
sequenceDiagram
    participant Test as XCUITest
    participant App as App real
    participant API as Red
    Test->>App: tap(botonConfirmar)
    App->>API: confirmarEntrega() (red real)
    Note over Test,App: sin esperar: exists falla intermitente
    Test->>App: waitForExistence(timeout: 5)
    API-->>App: respuesta
    App-->>Test: "Entrega confirmada" visible
```

En el proyecto integrador RutaFlow, este test vive en `examples/rutaflow/ios/DetalleEntregaView.swift` (vista bajo prueba). Límite de la decisión: no conviene cubrir con XCUITest cada combinación posible de entrada — es demasiado lento y frágil para eso; reservalo específicamente para los flujos críticos end-to-end (como confirmar una entrega), y dejá la cobertura exhaustiva de casos a los unit tests de dominio del Tema 1.

---

#### Paso 4 · Demostración guiada desde cero
```swift
func testConfirmarEntregaDesdeLaUI() {
    let app = XCUIApplication()
    app.launch()
    app.textFields["campoGuia"].tap()
    app.textFields["campoGuia"].typeText("RF-4471")
    app.textFields["campoPin"].tap()
    app.textFields["campoPin"].typeText("837201")
    app.buttons["botonConfirmar"].tap()
    XCTAssertTrue(app.staticTexts["Entrega confirmada"].waitForExistence(timeout: 5))
}
```

**Ejecuta el ejemplo** (crea el proyecto en Xcode: File ▸ New ▸ Project ▸ App, interfaz SwiftUI, nómbralo `RutaFlowApp`; pega el código y confirma que compila):

```bash
xcodebuild -scheme RutaFlowApp -destination 'platform=iOS Simulator,name=iPhone 15' build
```
Luego corre con ⌘R en el simulador, o abre el canvas de Preview con ⌥⌘↵.

Resultado esperado: el test lanza la app real, escribe guía y PIN como lo haría un conductor, y confirma que "Entrega confirmada" aparece en pantalla dentro de 5 segundos — valida el flujo completo, no solo la función `confirmarEntrega` en memoria.

#### Paso 5 · Práctica guiada
Pista: cambiá `waitForExistence(timeout: 5)` por un simple `app.staticTexts["Entrega confirmada"].exists` inmediatamente después del `tap()`, sin esperar — ese es el fallo deliberado: el test falla intermitentemente, porque la confirmación tarda unos milisegundos en aparecer (hay una llamada de red real de por medio) y `exists` se evalúa antes de que la UI se actualice.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 restaurando `waitForExistence`, y agregá un segundo test que escriba un PIN incorrecto y confirme que aparece un mensaje de error en pantalla en vez de "Entrega confirmada" — identificando qué `accessibility identifiers` necesitás agregar a esa vista de error si todavía no existen.

#### Paso 7 · Cierre y evidencia
Entregá el test del flujo feliz del Paso 4, la falla intermitente del Paso 5, y el test del flujo de error del Paso 6; explicá por qué un XCUITest necesita esperar explícitamente (`waitForExistence`) en vez de asumir que la UI ya se actualizó apenas después de un `tap()`. Siguiente paso: estudia cómo correr esta suite en CI. Errores comunes: no esperar explícitamente a que la UI se actualice, depender de texto visible en vez de accessibility identifiers estables, y cubrir solo el camino feliz en los UI Tests. Fuentes oficiales: https://developer.apple.com/documentation/xctest/xcuiapplication y https://developer.apple.com/documentation/testing.
**¿Por qué es importante?** Porque un XCUITest valida el flujo completo end-to-end tal como lo experimenta un conductor real, pero exige esperar explícitamente a que la UI se actualice en vez de asumir que el `tap()` tiene efecto inmediato.

## Laboratorio práctico

**Objetivo del laboratorio:** construir una suite de tests sobre la capa de dominio usando Swift Testing.

**Requisitos previos:** Módulo 8 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Escribir un test con XCTest para una función pura | Ver Tema 1 | Capa de dominio |
| 2 | Reescribirlo con Swift Testing | Ver Tema 1 | `@Test`, `#expect` |
| 3 | Testear una función `async` con `await` en el test | Ver Tema 2 | Sin `XCTestExpectation` |
| 4 | Escribir un UI Test con XCUITest | Ver Tema 3 | Verifica que un botón existe y es tappable |

**Verificación:** el laboratorio se considera exitoso si la suite de Swift Testing pasa correctamente incluyendo al menos un test async, y si el UI Test valida el flujo completo de creación de una tarea de principio a fin.

**Errores comunes y soluciones**

- **Usar `XCTestExpectation` manual para testear código async en vez de marcar el test como `async`.** Simplifica el test con `await` directo.
- **Depender únicamente de UI Tests para verificar lógica de negocio.** Prefiere unit tests rápidos de la capa de dominio para eso; reserva UI Tests para flujos críticos completos.
- **No considerar la fragilidad inherente de los UI Tests al diseñar la suite.** Manténlos acotados a lo esencial, dado su mayor costo de mantenimiento.

---

* Código: `examples/rutaflow/ios/ContentView.swift`
* Proyecto: proyecto integrador RutaFlow
* Visualización: concepto mostrado en diagrama
