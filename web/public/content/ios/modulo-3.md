# Módulo 3: Navegación


**Proyecto del módulo:** crea una vez en Xcode (File ▸ New ▸ Project ▸ App, interfaz SwiftUI) un proyecto llamado `RutaFlowApp`; cada tema reutiliza ese proyecto, pega su código y compila.

## Aprende construyendo

### Tema 1: NavigationStack y NavigationPath

#### Paso 1 · Objetivo y preparación
Al finalizar vas a navegar programáticamente de la lista de envíos al `DetalleEnvio` (Módulo 2) usando `NavigationPath`, sin depender de que el usuario toque una fila. Prerrequisitos: Módulo 2 completo.
#### Paso 2 · Contexto y caso real
Cuando llega una notificación push de "nueva entrega asignada", RutaFlow necesita abrir `DetalleEnvio` directamente desde código, no esperar a que el conductor navegue manualmente hasta ahí.
#### Paso 3 · Teoría, modelo mental y analogía
`NavigationStack` con `.navigationDestination(for:)` declara qué vista corresponde a cada tipo; `NavigationPath` deja manipular ese stack desde código, como un GPS que salta directamente a un punto de la ruta en vez de seguir letrero por letrero.
#### Paso 4 · Demostración guiada desde cero
```swift
struct Envio: Hashable { let guia: String }

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

**Ejecuta el ejemplo:**

```bash
xcodebuild -scheme RutaFlowApp -destination 'platform=iOS Simulator,name=iPhone 15' build
```
Luego corre con ⌘R en el simulador, o abre el canvas de Preview con ⌥⌘↵.

Resultado esperado: llamar `path.append(Envio(guia: "RF-4471"))` desde cualquier parte del código navega directamente a `DetalleEnvio`, sin que el usuario haya tocado nada en la lista.
#### Paso 5 · Práctica guiada
Pista: agregá un segundo tipo `EnvioUrgente` sin declarar su `.navigationDestination(for:)` correspondiente, y hacé `path.append(EnvioUrgente(guia: "RF-9999"))` — ese es el fallo deliberado: SwiftUI no tiene ninguna vista registrada para ese tipo, y la navegación se queda en un estado indefinido en vez de mostrar `DetalleEnvio`.
#### Paso 6 · Práctica independiente
Corregí el Paso 5 agregando el `.navigationDestination(for: EnvioUrgente.self)` correspondiente, y agregá un botón "volver al inicio" que resetee `path` a un `NavigationPath()` vacío desde cualquier profundidad del stack.
#### Paso 7 · Cierre
Entregá la navegación programática funcionando del Paso 4, el destino sin registrar del Paso 5, y el reseteo completo del stack del Paso 6; explicá por qué esto sería difícil de lograr con `NavigationLink` anidados puros, sin `NavigationPath`. Siguiente paso: estudia persistencia. Errores comunes: rutas sin tipo, sheets anidadas, deep links no validados y estado de navegación duplicado. Fuentes oficiales: https://developer.apple.com/documentation/swiftui/navigationstack y https://developer.apple.com/documentation/swiftui.
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

* Código: `examples/rutaflow/ios/ContentView.swift`
* Proyecto: en el proyecto integrador RutaFlow, navega del listado al detalle de envío con NavigationStack.

**Límites y decisión de uso:** La pila de navegación representa destinos, no autorización sobre sus datos. Guarda identidades estables en lugar de objetos vivos y valida una ruta restaurada: el recurso pudo eliminarse o dejar de pertenecer al usuario.

### Tema 2: Sheets, full screen covers y TabView

#### Paso 1 · Objetivo y preparación
Al finalizar vas a decidir, para dos flujos reales de RutaFlow, si necesitan un `.sheet()` o un `.fullScreenCover()`, y a darle a cada pestaña su propio historial con `TabView`. Prerrequisitos: Tema 1 de este módulo.
#### Paso 2 · Contexto y caso real
Confirmar una entrega es una acción rápida y descartable; completar el onboarding de un conductor nuevo (aceptar términos, verificar identidad) es un flujo obligatorio que no debería poder cerrarse deslizando por accidente.
#### Paso 3 · Teoría, modelo mental y analogía
Un sheet es abrir un cajón parcialmente sin perder de vista el resto de la habitación; un full screen cover es entrar a una sala separada donde la puerta se cierra completamente — la intensidad de la interrupción debe coincidir con la importancia real de la acción.
#### Paso 4 · Demostración guiada desde cero
```swift
.sheet(isPresented: $mostrarConfirmarEntrega) { ConfirmarEntregaBoton(entregado: $entregado) }
.fullScreenCover(isPresented: $mostrarOnboarding) { OnboardingConductorView() }

TabView {
    NavigationStack { ListaEnvios() }.tabItem { Label("Envíos", systemImage: "shippingbox") }
    NavigationStack { HistorialEnvios() }.tabItem { Label("Historial", systemImage: "clock") }
}
```

**Ejecuta el ejemplo:**

```bash
xcodebuild -scheme RutaFlowApp -destination 'platform=iOS Simulator,name=iPhone 15' build
```
Luego corre con ⌘R en el simulador, o abre el canvas de Preview con ⌥⌘↵.

Resultado esperado: la confirmación de entrega aparece como un sheet descartable; el onboarding cubre toda la pantalla sin gesto de descarte trivial; cada pestaña mantiene su propio `NavigationStack`, así que cambiar de "Envíos" a "Historial" y volver preserva el punto exacto donde quedó cada una.
#### Paso 5 · Práctica guiada
Pista: cambiá el onboarding obligatorio de `.fullScreenCover` a `.sheet` — ese es el fallo deliberado: ahora el conductor puede deslizar hacia abajo y descartar el onboarding sin completarlo, exactamente la interrupción "liviana" que este flujo NO debería permitir.
#### Paso 6 · Práctica independiente
Corregí el Paso 5 volviendo a `.fullScreenCover`, y navegá a `DetalleEnvio` dentro de la pestaña "Envíos", cambiá a "Historial", y volvé a "Envíos" — confirmá que seguís viendo `DetalleEnvio`, no la lista desde el principio.
#### Paso 7 · Cierre
Entregá la elección correcta de sheet/fullScreenCover del Paso 4, el onboarding descartable por error del Paso 5, y el historial de navegación preservado por pestaña del Paso 6; explicá qué comunica cada nivel de presentación modal sobre qué tan obligatoria es la acción. Siguiente paso: estudia persistencia. Errores comunes: rutas sin tipo, sheets anidadas, deep links no validados y estado de navegación duplicado. Fuentes oficiales: https://developer.apple.com/documentation/swiftui/navigationstack y https://developer.apple.com/documentation/swiftui.
**¿Por qué es importante?** Porque elegir sheet o full screen cover comunica al usuario qué tan obligatoria es la acción, y un onboarding crítico presentado como sheet puede descartarse por error sin completarse.
**Conceptos clave:** dos niveles de intensidad de presentación modal, cada uno apropiado para un tipo distinto de interrupción.

```swift
.sheet(isPresented: $mostrarFormulario) { FormularioTareaView() }       // modal parcial, dismissible deslizando
.fullScreenCover(isPresented: $mostrarOnboarding) { OnboardingView() } // cubre toda la pantalla, ideal para flujos obligatorios
```

Un `.sheet()` presenta contenido modal parcial (típicamente deslizable hacia abajo para descartar, dejando visible parte del contexto anterior), apropiado para acciones complementarias o formularios que el usuario puede abandonar fácilmente sin perder su contexto de navegación previo; un `.fullScreenCover()` cubre la pantalla completa sin ningún gesto de descarte trivial disponible por defecto, apropiado para flujos que el desarrollador considera deliberadamente obligatorios o que requieren la atención completa del usuario sin distracción del contexto anterior (un onboarding inicial, un flujo de autenticación crítico).

```swift
TabView {
    NavigationStack { InicioView() }.tabItem { Label("Inicio", systemImage: "house") }
    NavigationStack { TareasView() }.tabItem { Label("Tareas", systemImage: "checklist") }
}
```

Anidar un `NavigationStack` independiente dentro de cada pestaña de una `TabView` establece exactamente el mismo patrón de stacks de navegación independientes por sección estudiado en Android (Módulo 3 del track de Android): cada pestaña mantiene su propio historial de navegación, de modo que cambiar de pestaña y regresar preserva el punto exacto donde el usuario quedó en cada una, cumpliendo con la misma expectativa de UX consolidada en apps móviles de ambas plataformas.

**Analogía:** un sheet es como abrir un cajón parcialmente para consultar algo rápido sin perder de vista el resto de la habitación; un full screen cover es como entrar a una sala separada donde la puerta se cierra completamente, apropiada cuando la actividad requiere concentración total sin ninguna distracción del contexto anterior.

**Diagrama:**

```
TabView
├── Inicio  → NavigationStack propio
└── Tareas  → NavigationStack propio (independiente del de Inicio)
```

* Código: `examples/rutaflow/ios/ContentView.swift`
* Proyecto: en el proyecto integrador RutaFlow, presenta la confirmación como sheet y conserva el estado al cerrar.

**Límites y decisión de uso:** Una presentación modal no debe ocultar una tarea incompleta sin posibilidad de recuperación. Define qué se guarda al cerrar y prueba cancelación; evita abrir varios modales simultáneos como respuesta a eventos repetidos.

### Tema 3: Deep linking y controles de formulario

#### Paso 1 · Objetivo y preparación
Al finalizar vas a abrir `DetalleEnvio` directamente desde un deep link real (`rutaflow://envio/RF-4471`), validando el formato antes de navegar. Prerrequisitos: Tema 1 de este módulo.
#### Paso 2 · Contexto y caso real
Cuando el conductor toca una notificación push "nueva entrega asignada: RF-4471", esa URL tiene que aterrizar directamente en `DetalleEnvio` de ese envío específico, no en la pantalla principal esperando navegación manual.
#### Paso 3 · Teoría, modelo mental y analogía
`.onOpenURL` es un sistema de recepción que lee la dirección exacta del sobre entrante y lo entrega directamente en la oficina correspondiente, sin dejarlo en recepción general para que alguien lo redirija después.
**Conceptos clave:** entrada externa mapeada directamente a un punto específico de navegación.

```swift
.onOpenURL { url in
    if let id = extraerID(de: url) { path.append(Tarea(id: id)) }
}
```

`.onOpenURL` captura una URL entrante (desde una notificación, un link compartido, o un esquema de URL personalizado registrado por la app) y permite reaccionar programáticamente extrayendo la información relevante y navegando directamente al punto correspondiente del `NavigationPath`, el mismo principio de deep linking estudiado en Android (Módulo 3 de ese track) aplicado aquí con las APIs nativas de SwiftUI: una entrada externa lleva al usuario directamente al contenido relevante, en vez de aterrizar en la pantalla principal de la app requiriendo navegación manual adicional.

`Form`, `Picker`, `DatePicker`, `Toggle` y `Slider` son los controles de entrada estándar de SwiftUI para construir formularios completos de forma declarativa, cada uno vinculado a una propiedad de estado mediante un `Binding` (con el prefijo `$`); `.swipeActions()` agrega acciones reveladas mediante gesto de deslizamiento sobre una fila de una lista (eliminar, marcar como completada), y `.onDelete()` habilita el gesto estándar de eliminación por deslizamiento en modo edición de una `List`, ambos patrones de interacción esperados por convención en apps iOS nativas.

**Analogía:** `.onOpenURL` es como un sistema de recepción de correspondencia que lee automáticamente la dirección exacta escrita en cada sobre entrante y lo entrega directamente en la oficina correspondiente del edificio, en vez de dejarlo en la recepción general para que alguien lo redirija manualmente después.

**¿Por qué es importante?** El deep linking mediante `.onOpenURL` lleva al usuario directamente al contenido relevante desde una entrada externa; los controles estándar de formulario y los gestos de swipe/delete cumplen con las convenciones de interacción esperadas en apps iOS nativas.

**Diagrama: deep link validado antes de navegar**

```mermaid
flowchart TD
    A["rutaflow://envio/RF-4471"] --> B{"scheme/host válidos?"}
    B -->|No| C["Ignorar (return)"]
    B -->|Sí| D{"guia.hasPrefix('RF-')?"}
    D -->|No| C
    D -->|Sí| E["path.append(Envio(guia:))"]
```

En el proyecto integrador RutaFlow, este handler vive en `examples/rutaflow/ios/ContentView.swift`, junto al `Form` de motivo de no entrega. Límite de la decisión: no conviene validar el formato de la URL en más de un lugar disperso de la app — centralizá esa validación en el único punto de entrada `.onOpenURL`, antes de que el valor llegue a `NavigationPath`; validar tarde, después de ya haber navegado, no conviene porque la vista de destino ya habría recibido un valor no confiable.

---

#### Paso 4 · Demostración guiada desde cero
```swift
.onOpenURL { url in
    guard url.scheme == "rutaflow", url.host == "envio",
          let guia = url.pathComponents.last, guia.hasPrefix("RF-") else { return }
    path.append(Envio(guia: guia))
}
```

**Ejecuta el ejemplo:**

```bash
xcodebuild -scheme RutaFlowApp -destination 'platform=iOS Simulator,name=iPhone 15' build
```
Luego corre con ⌘R en el simulador, o abre el canvas de Preview con ⌥⌘↵.

Resultado esperado: abrir `rutaflow://envio/RF-4471` navega directamente a `DetalleEnvio(guia: "RF-4471")`, usando el mismo `NavigationPath` del Tema 1.
#### Paso 5 · Práctica guiada
Pista: quitá la validación `guia.hasPrefix("RF-")` y probá abrir `rutaflow://envio/<script>` — ese es el fallo deliberado: sin validar el formato de la guía antes de usarla, cualquier contenido arbitrario de una URL maliciosa terminaría navegando a `DetalleEnvio` con un valor que nunca debería tratarse como una guía real.
#### Paso 6 · Práctica independiente
Corregí el Paso 5 restaurando la validación, y agregá un `Form` con un `Picker` para que el conductor reporte el motivo si no pudo entregar (por ejemplo "destinatario ausente", "dirección incorrecta"), usando `.swipeActions()` en la lista para marcar un envío como "reintentar" sin entrar al detalle.

#### Paso 7 · Cierre
Entregá el deep link validado del Paso 4, el formato no validado y su riesgo del Paso 5, y el formulario con swipe actions del Paso 6; explicá por qué una URL entrante nunca debería tratarse como un dato de confianza sin antes validar su forma. Siguiente paso: estudia persistencia. Errores comunes: rutas sin tipo, sheets anidadas, deep links no validados y estado de navegación duplicado. Fuentes oficiales: https://developer.apple.com/documentation/swiftui/navigationstack y https://developer.apple.com/documentation/swiftui.
**Implicación práctica:** Una URL entrante (deep link) nunca debería tratarse como un dato de confianza; validar su formato antes de navegar evita que contenido arbitrario termine tratado como una guía real.

## Laboratorio práctico

**Objetivo del laboratorio:** construir una app con navegación tipo stack, una tab bar y al menos un sheet modal.

**Requisitos previos:** Módulo 2 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Construir un `NavigationStack` de al menos 3 niveles | Ver Tema 1 | Lista → detalle → sub-detalle |
| 2 | Usar `NavigationPath` para navegar programáticamente | Ver Tema 1 | Sin depender solo de `NavigationLink` |
| 3 | Presentar un `.sheet()` y un `.fullScreenCover()` | Ver Tema 2 | Explica cuándo usar cada uno |
| 4 | Construir una `TabView` con 3 pestañas | Ver Tema 2 | Cada una con su propio `NavigationStack` |
| 5 | Configurar `.onOpenURL` para deep linking | Ver Tema 3 | Navega directamente a la pantalla relevante |

**Verificación:** el laboratorio se considera exitoso si navegar profundamente en una pestaña y cambiar a otra mediante la tab bar preserva ese historial al regresar, y si abrir una URL configurada navega directamente a la pantalla correspondiente sin pasos manuales adicionales.

**Errores comunes y soluciones**

- **Usar un full screen cover para una acción complementaria que el usuario debería poder descartar fácilmente.** Prefiere un sheet para ese caso.
- **Compartir un único `NavigationStack` entre todas las pestañas de una `TabView`.** Anida uno independiente por pestaña para preservar el historial de cada una.
- **Olvidar registrar el esquema de URL en el proyecto para que `.onOpenURL` reciba las llamadas.** Configúralo en la configuración del target antes de probar el deep link.

---

* Código: `examples/rutaflow/ios/ContentView.swift`
* Proyecto: en el proyecto integrador RutaFlow, abre el detalle de un envío por deep link y valida el formulario.
