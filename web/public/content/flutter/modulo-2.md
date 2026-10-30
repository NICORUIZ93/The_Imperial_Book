# Módulo 2: Layout y diseño responsive


## Aprende construyendo

### Tema 1: MediaQuery vs LayoutBuilder

#### Paso 1 · Objetivo y preparación
Al finalizar vas a decidir el layout de `PanelEnvios` usando `LayoutBuilder` en vez de `MediaQuery`, porque el panel vive dentro de un `Row` lateral que no ocupa el ancho completo de la pantalla. Prerrequisitos: Módulo 1 completo.

#### Paso 2 · Contexto y caso real
En la versión tablet de RutaFlow, `PanelEnvios` vive al lado de un mapa, ocupando solo una fracción del ancho de la pantalla — usar `MediaQuery.of(context).size.width` ahí mediría el ancho de la pantalla completa, no el espacio real disponible para el panel.

#### Paso 3 · Teoría, modelo mental y analogía
`MediaQuery` da el tamaño de la pantalla completa; `LayoutBuilder` da las constraints del espacio específicamente disponible para ese widget en su posición actual — preguntar por el edificio completo, no por la habitación en la que estás.

**Evidencia de aprendizaje:** entrega LayoutBuilder correctamente usado, overflow por MediaQuery detectado y tercera variante de layout confirmada.
**Conceptos clave:** tamaño de la pantalla completa frente a espacio disponible para un widget específico.

```dart
final ancho = MediaQuery.of(context).size.width;

LayoutBuilder(builder: (context, constraints) {
  return constraints.maxWidth > 600
      ? Row(children: [Expanded(child: ListaTareas()), Expanded(child: DetalleTarea())])
      : ListaTareas(); // una sola columna en pantallas angostas
});
```

`MediaQuery.of(context).size` da el tamaño de la pantalla física completa del dispositivo, independientemente de cuánto espacio ocupe efectivamente el widget que consulta esa información; `LayoutBuilder` en cambio da las constraints del espacio específicamente disponible para ese widget en particular dentro de su posición actual en el árbol, lo que resulta considerablemente más preciso cuando el widget bajo consideración no ocupa la pantalla completa (por ejemplo, un panel lateral dentro de un layout más amplio), dado que ese panel podría tener un espacio disponible completamente distinto al ancho total de la pantalla del dispositivo.

Elegir incorrectamente entre ambos mecanismos es una fuente común de bugs sutiles de responsive design: usar `MediaQuery` para decidir el layout de un widget anidado profundamente dentro de otros contenedores puede producir decisiones de layout incorrectas si ese widget específico no ocupa realmente el ancho completo de la pantalla, mientras que `LayoutBuilder` siempre refleja el espacio real y específico disponible para ese widget en su contexto actual.

**Analogía:** `MediaQuery` es como preguntar "¿cuál es el tamaño total del edificio completo?"; `LayoutBuilder` es como preguntar "¿cuál es el tamaño específico de esta habitación en la que me encuentro ahora?" — ambas preguntas son válidas, pero la segunda es la relevante para decidir cómo distribuir el mobiliario dentro de esa habitación específica, no del edificio entero.

**¿Por qué es importante?** `LayoutBuilder` es más preciso que `MediaQuery` cuando el widget que decide su layout no ocupa toda la pantalla, dado que refleja el espacio real y específico disponible para ese widget en su posición actual del árbol, no el tamaño total del dispositivo.

**Código del ejemplo:**

```dart
MediaQuery.of(context).size.width       // tamaño de la PANTALLA completa
LayoutBuilder(builder: (context, constraints) => ...)  // espacio disponible para ESTE widget específico
```

**Diagrama: decisión MediaQuery vs LayoutBuilder**

```mermaid
flowchart TD
    A["¿Este widget ocupa toda la pantalla?"] -->|Sí| B["MediaQuery.of(context).size"]
    A -->|No, es un panel/columna parcial| C["LayoutBuilder + constraints.maxWidth"]
    C --> D["Decide layout según espacio REAL del widget"]
    B --> E["Decide layout según pantalla completa"]
```

En el proyecto integrador RutaFlow, `PanelEnvios` vive en `lib/features/deliveries/presentation/panel_envios.dart`. Práctica: corré `flutter test test/panel_envios_test.dart` después de cada cambio de breakpoint para confirmar que el panel elige la variante compacta cuando comparte fila con el mapa.

#### Paso 4 · Demostración guiada desde cero
```dart
Row(children: [
  Expanded(
    flex: 1,
    child: LayoutBuilder(builder: (context, constraints) {
      return constraints.maxWidth > 400
          ? ListaEnviosExpandida()
          : ListaEnviosCompacta();
    }),
  ),
  Expanded(flex: 2, child: MapaRuta()),
])
```

**Ejecuta el ejemplo** (crea un proyecto Flutter desde cero, pega el widget en `lib/main.dart` y arráncalo en un emulador o dispositivo):

```bash
flutter create demo_flutter
cd demo_flutter
flutter run
```
Para las pruebas de widget: `flutter test`.

Resultado esperado: `LayoutBuilder` dentro del panel reporta correctamente que su espacio disponible es solo un tercio del ancho total de la pantalla (porque comparte la fila con `MapaRuta`), permitiendo elegir `ListaEnviosCompacta` incluso en una tablet ancha, donde `MediaQuery` hubiera reportado un ancho total mucho mayor y elegido incorrectamente la versión expandida.

#### Paso 5 · Práctica guiada
Pista: reemplazá el `LayoutBuilder` por `MediaQuery.of(context).size.width > 400` para decidir qué lista mostrar — ese es el fallo deliberado: en una tablet ancha, `MediaQuery` reporta el ancho total de la pantalla (por ejemplo 1024), eligiendo `ListaEnviosExpandida` aunque el panel en realidad solo tenga un tercio de ese espacio real disponible, produciendo overflow de texto dentro del panel angosto.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 devolviendo el `LayoutBuilder`, y agregá un tercer caso de layout (`ListaEnviosMuyCompacta`) para cuando `constraints.maxWidth` sea menor a 250, confirmando que cada variante responde al espacio real del panel, no al de la pantalla.

#### Paso 7 · Cierre y evidencia
Entregá el `LayoutBuilder` correctamente usado del Paso 4, el overflow provocado por `MediaQuery` del Paso 5, y la tercera variante del Paso 6; explicá cuándo el ancho total de la pantalla y el espacio disponible de un widget específico dejan de ser el mismo número. Siguiente paso: estudia cómo Flutter calcula tamaños con constraints. Errores comunes: usar `MediaQuery` para decidir el layout de un widget anidado que no ocupa toda la pantalla, anidar `LayoutBuilder` innecesariamente en widgets que sí ocupan la pantalla completa, y no probar el layout en al menos dos proporciones de pantalla distintas. Fuentes oficiales: https://api.flutter.dev/flutter/widgets/LayoutBuilder-class.html y https://docs.flutter.dev/ui/layout/constraints.
**¿Por qué es importante?** `LayoutBuilder` es más preciso que `MediaQuery` cuando el widget que decide su layout no ocupa toda la pantalla, dado que refleja el espacio real disponible para ese widget en su posición actual del árbol.

### Tema 2: Cómo Flutter calcula tamaños

#### Paso 1 · Objetivo y preparación
Al finalizar vas a diagnosticar un error de "unbounded height" en `ListaEnvios` causado por anidar una `Column` dentro de otra sin límites, entendiendo el protocolo "constraints go down, sizes go up". Prerrequisitos: Tema 1 de este módulo.

#### Paso 2 · Contexto y caso real
Anidar `ListView` (que intenta ocupar todo el alto disponible) dentro de una `Column` (que no impone un alto máximo a sus hijos) produce una excepción en tiempo de ejecución sobre constraints no acotadas, un error que confunde a quien no entiende cómo fluyen las constraints.

#### Paso 3 · Teoría, modelo mental y analogía
Un padre comunica a cada hijo un rango de tamaños permitido; el hijo decide su tamaño final dentro de ese rango y lo informa de vuelta — un `ListView` sin alto máximo recibido no sabe cuánto espacio ocupar.

**Evidencia de aprendizaje:** entrega layout corregido con Expanded, error de constraints no acotadas detectado y explicación escrita del protocolo.
**Conceptos clave:** constraints fluyen hacia abajo, tamaños fluyen hacia arriba.

Flutter resuelve el layout de todo el árbol de widgets siguiendo un protocolo estricto conocido como "constraints go down, sizes go up": un widget padre le comunica a cada hijo el rango de tamaños permitido (mínimo y máximo de ancho y alto, las "constraints"), y cada hijo, dentro de ese rango permitido, decide su propio tamaño final y se lo informa de vuelta a su padre; el padre nunca dicta directamente el tamaño exacto de un hijo (salvo que las constraints mínima y máxima coincidan exactamente), y un hijo nunca puede ignorar las constraints recibidas de su padre para elegir un tamaño fuera de ese rango permitido.

Este protocolo unidireccional y predecible (información de restricción fluyendo hacia abajo, información de tamaño resultante fluyendo hacia arriba) es lo que permite que Flutter calcule el layout completo de un árbol arbitrariamente complejo en una única pasada eficiente, sin necesidad de múltiples iteraciones de ajuste entre padres e hijos como podría requerir un sistema de layout menos estructurado; entender este protocolo explica comportamientos que de otra forma parecerían contraintuitivos, como por qué un `Container` sin restricciones explícitas de tamaño puede comportarse de forma distinta según el contexto exacto en el que se encuentre anidado.

**Analogía:** el protocolo de constraints de Flutter es como una cadena de encargos de fabricación donde cada nivel superior especifica un rango aceptable de dimensiones para la pieza que solicita (no exactamente una única medida fija), y cada fabricante en un nivel inferior decide la medida exacta final dentro de ese rango permitido, comunicando de vuelta esa decisión final hacia quien hizo el encargo original.

**¿Por qué es importante?** Entender el protocolo "constraints go down, sizes go up" explica de forma predecible por qué un widget termina con el tamaño final que tiene, permitiendo diagnosticar problemas de layout inesperados razonando sobre qué constraints recibió realmente cada widget de su padre.

**Diagrama:**

```
Padre → constraints (min/max ancho, min/max alto) → Hijo
Hijo → tamaño final elegido dentro de esas constraints → Padre
```

**Diagrama: flujo de constraints y tamaños**

```mermaid
sequenceDiagram
    participant Column
    participant Expanded
    participant ListView
    Column->>Expanded: constraints (alto máximo finito)
    Expanded->>ListView: constraints (alto máximo finito)
    ListView->>Expanded: tamaño final elegido
    Expanded->>Column: tamaño final elegido
```

En el proyecto integrador RutaFlow, este patrón vive en `lib/features/deliveries/presentation/lista_envios.dart`. Práctica: corré `flutter analyze lib/features/deliveries/presentation/lista_envios.dart` tras cada cambio de layout para detectar este tipo de error antes de ejecutar la app.

#### Paso 4 · Demostración guiada desde cero
```dart
Column(children: [
  Text('Envíos de hoy'),
  Expanded(          // da un alto máximo finito al ListView
    child: ListView(children: envios.map((e) => TarjetaEnvio(envio: e)).toList()),
  ),
])
```

**Ejecuta el ejemplo** (crea un proyecto Flutter desde cero, pega el widget en `lib/main.dart` y arráncalo en un emulador o dispositivo):

```bash
flutter create demo_flutter
cd demo_flutter
flutter run
```
Para las pruebas de widget: `flutter test`.

Resultado esperado: envolver el `ListView` en `Expanded` le comunica una constraint de alto máximo finito (el espacio restante de la `Column` después de `Text`), permitiendo que el `ListView` decida su tamaño dentro de ese límite y haga scroll internamente sin romper el layout.

#### Paso 5 · Práctica guiada
Pista: quitá `Expanded` y dejá el `ListView` directamente como hijo de `Column` — ese es el fallo deliberado: Flutter lanza una excepción en tiempo de ejecución porque `Column` no impone ningún límite de alto máximo a sus hijos por defecto, y `ListView` recibe una constraint de alto infinito que no puede satisfacer.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 restaurando `Expanded`, y explicá por escrito, en tus propias palabras, por qué el error específico menciona constraints no acotadas y de dónde debería haber venido el límite faltante.

#### Paso 7 · Cierre y evidencia
Entregá el layout corregido con `Expanded` del Paso 4, el error de constraints no acotadas del Paso 5, y tu explicación escrita del Paso 6; explicá por qué entender el protocolo "constraints go down, sizes go up" permite diagnosticar este tipo de error leyendo el mensaje de la excepción, en vez de probar soluciones al azar. Siguiente paso: estudia breakpoints propios y SafeArea. Errores comunes: anidar un widget que ocupa todo el espacio disponible dentro de un padre que no impone límites, usar `Expanded` fuera de un `Row`/`Column`/`Flex`, y asumir que un `Container` sin tamaño explícito siempre se comporta igual sin importar su padre. Fuentes oficiales: https://docs.flutter.dev/ui/layout/constraints y https://docs.flutter.dev/ui/layout/box-constraints.
**¿Por qué es importante?** Entender el protocolo "constraints go down, sizes go up" explica de forma predecible por qué un widget termina con el tamaño final que tiene, permitiendo diagnosticar errores de layout leyendo el mensaje real de la excepción.

### Tema 3: Breakpoints propios y SafeArea

#### Paso 1 · Objetivo y preparación
Al finalizar vas a centralizar la lógica de breakpoints de RutaFlow en una función `segunAncho()` reutilizable, y a envolver la pantalla principal con `SafeArea` para proteger el contenido del notch. Prerrequisitos: Tema 2 de este módulo.

#### Paso 2 · Contexto y caso real
Distintas pantallas de RutaFlow (lista de envíos, detalle, mapa) empezaron a comparar `ancho > 600` cada una por su cuenta con su propio número hardcodeado — cuando el diseño cambia el breakpoint real a 640, alguien tiene que recordar actualizarlo en cada lugar disperso.

#### Paso 3 · Teoría, modelo mental y analogía
Definir breakpoints como una función pura centraliza esa lógica en un único lugar reutilizable; `SafeArea` evita que el contenido quede oculto detrás de elementos físicos del dispositivo.

#### Paso 4 · Demostración guiada desde cero
```dart
enum TipoDispositivo { movil, tablet, escritorio }
TipoDispositivo segunAncho(double ancho) {
  if (ancho < 600) return TipoDispositivo.movil;
  if (ancho < 1024) return TipoDispositivo.tablet;
  return TipoDispositivo.escritorio;
}

Scaffold(body: SafeArea(child: PanelEnvios()))
```

**Ejecuta el ejemplo** (crea un proyecto Flutter desde cero, pega el widget en `lib/main.dart` y arráncalo en un emulador o dispositivo):

```bash
flutter create demo_flutter
cd demo_flutter
flutter run
```
Para las pruebas de widget: `flutter test`.

Resultado esperado: cada pantalla de RutaFlow llama a `segunAncho(constraints.maxWidth)` en vez de comparar números directamente; `SafeArea` evita que la primera fila de `PanelEnvios` quede oculta detrás del notch en dispositivos con cámara frontal pronunciada.

#### Paso 5 · Práctica guiada
Pista: en una pantalla nueva (`DetalleEnvio`), escribí directamente `if (ancho > 600)` con el número hardcodeado "para ir más rápido", en vez de llamar a `segunAncho()` — ese es el fallo deliberado: cuando el equipo de diseño cambia el breakpoint real de tablet a 640, alguien actualiza `segunAncho()` pero se olvida de esa comparación hardcodeada en `DetalleEnvio`, que queda con un comportamiento inconsistente respecto al resto de la app.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 devolviendo `DetalleEnvio` a usar `segunAncho()`, y quitá `SafeArea` deliberadamente de una pantalla para confirmar visualmente (en un dispositivo con notch) que el contenido queda oculto, antes de restaurarlo.

#### Paso 7 · Cierre y evidencia
Entregá la función centralizada del Paso 4, la inconsistencia por hardcodear del Paso 5, y la comprobación visual de `SafeArea` del Paso 6; explicá por qué centralizar breakpoints en una función reutilizable evita exactamente la clase de inconsistencia que ocurrió en el Paso 5. Siguiente paso: cerrá el módulo con la pantalla responsive completa. Errores comunes: dispersar comparaciones numéricas de breakpoints en cada widget, omitir `SafeArea` asumiendo que todos los dispositivos tienen los mismos insets, y definir breakpoints basados en orientación cuando el ancho real disponible es lo que importa. Fuentes oficiales: https://api.flutter.dev/flutter/widgets/SafeArea-class.html y https://docs.flutter.dev/ui/layout.
**¿Por qué es importante?** Centralizar los breakpoints en una función reutilizable evita inconsistencias de comparaciones numéricas dispersas; `SafeArea` importa de forma variable según el dispositivo específico.
**Evidencia de aprendizaje:** entrega función centralizada de breakpoints, inconsistencia por hardcodear detectada y comprobación visual de SafeArea.
**Conceptos clave:** categorización explícita de rangos de pantalla, protección contra elementos físicos del dispositivo.

```dart
enum TipoDispositivo { movil, tablet, escritorio }

TipoDispositivo segunAncho(double ancho) {
  if (ancho < 600) return TipoDispositivo.movil;
  if (ancho < 1024) return TipoDispositivo.tablet;
  return TipoDispositivo.escritorio;
}
```

Definir breakpoints propios como una función pura que mapea un ancho de pantalla a una categoría explícita (`móvil`, `tablet`, `escritorio`) centraliza esa lógica de categorización en un único lugar reutilizable en toda la app, en vez de dispersar comparaciones numéricas ad hoc (`if (ancho > 600)`) repetidas de forma inconsistente en cada widget que necesita tomar una decisión de layout responsive, un riesgo de inconsistencia que crece a medida que la app agrega más pantallas con lógica responsive propia.

```dart
Scaffold(body: SafeArea(child: ContenidoPrincipal()))
```

`SafeArea` evita que el contenido de la app quede oculto detrás de elementos físicos o del sistema operativo que ocupan espacio en los bordes de la pantalla: el notch de la cámara frontal, la barra de estado del sistema, o los controles de gestos de navegación en la parte inferior; `SafeArea` importa más en algunos dispositivos que en otros precisamente porque estos elementos varían considerablemente entre modelos (un dispositivo con notch pronunciado necesita más inset superior que uno sin notch, y dispositivos con controles de gestos en vez de botones físicos necesitan más inset inferior).

**Analogía:** los breakpoints propios son como categorías de talla de ropa estandarizadas (pequeña, mediana, grande) definidas una única vez y reutilizadas consistentemente en todo un catálogo, en vez de que cada prenda individual defina sus propios rangos de medida ad hoc de forma potencialmente inconsistente; `SafeArea` es como el margen de seguridad que respeta el marco de una ventana al colgar una cortina, evitando que la tela quede atrapada o cubierta por elementos estructurales del marco mismo.

**¿Por qué es importante?** Centralizar los breakpoints en una función reutilizable evita inconsistencias de comparaciones numéricas dispersas; `SafeArea` importa de forma variable según el dispositivo específico dado que los elementos físicos y del sistema que invaden los bordes de pantalla (notch, controles de gestos) difieren considerablemente entre modelos.

**Código del ejemplo:**

```dart
enum TipoDispositivo { movil, tablet, escritorio }
TipoDispositivo segunAncho(double ancho) {
  if (ancho < 600) return TipoDispositivo.movil;
  if (ancho < 1024) return TipoDispositivo.tablet;
  return TipoDispositivo.escritorio;
}
```

**Diagrama: categorización por breakpoint**

```mermaid
flowchart LR
    A["ancho de pantalla"] --> B{"< 600?"}
    B -->|Sí| M["TipoDispositivo.movil"]
    B -->|No| C{"< 1024?"}
    C -->|Sí| T["TipoDispositivo.tablet"]
    C -->|No| E["TipoDispositivo.escritorio"]
```

En el proyecto integrador RutaFlow, `segunAncho()` vive en `lib/core/responsive.dart`. Límite de la decisión: no conviene crear un breakpoint propio por cada pantalla nueva — frente a necesitar un cuarto rango real (por ejemplo, pantallas plegables), la decisión correcta es extender la función centralizada en `lib/core/responsive.dart`, nunca duplicar la comparación numérica en el widget.

---


## Laboratorio práctico

**Objetivo del laboratorio:** construir una pantalla que se adapta correctamente entre un teléfono y una tablet.

**Requisitos previos:** Módulo 1 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Adaptar el padding según el ancho con `MediaQuery` | Ver Tema 1 | Tamaño de pantalla completa |
| 2 | Mostrar layouts distintos con `LayoutBuilder` | Ver Tema 1 | Espacio específico del widget |
| 3 | Definir al menos 2 breakpoints propios | Ver Tema 3 | Función reutilizable |
| 4 | Envolver la pantalla con `SafeArea` | Ver Tema 3 | Verifica notch y barra de estado |

**Verificación:** el laboratorio se considera exitoso si la pantalla muestra correctamente una columna en teléfono y dos columnas lado a lado en tablet, y si el contenido no queda oculto detrás del notch o la barra de estado en ningún dispositivo probado.

**Errores comunes y soluciones**

- **Usar `MediaQuery` para decidir el layout de un widget anidado que no ocupa toda la pantalla.** Prefiere `LayoutBuilder` para el espacio real disponible de ese widget específico.
- **Dispersar comparaciones numéricas de breakpoints ad hoc en cada widget.** Centraliza la lógica en una función reutilizable.
- **Omitir `SafeArea` asumiendo que todos los dispositivos tienen los mismos insets.** Verifica en dispositivos con notch pronunciado y controles de gestos.

---
