# Módulo 8: Animaciones y rendimiento


## Aprende construyendo

### Tema 1: Animaciones implícitas vs explícitas

#### Paso 1 · Objetivo y preparación
Al finalizar vas a animar la expansión de `TarjetaEnvio` al tocarla con `AnimatedContainer`, y a comparar con la misma animación implementada explícitamente con `AnimationController`. Prerrequisitos: Módulo 7 completo.

#### Paso 2 · Contexto y caso real
Al tocar una `TarjetaEnvio` en la lista, debería expandirse suavemente para mostrar la dirección completa y el historial reciente, en vez de cambiar de tamaño de golpe.

#### Paso 3 · Teoría, modelo mental y analogía
Una animación implícita interpola automáticamente entre el valor anterior y el nuevo; una explícita con `AnimationController`/`Tween` da control total sobre curvas, repetición y composición, a costa de más código.
**Conceptos clave:** interpolación automática frente a control total sobre curvas y composición.

```dart
AnimatedContainer(
  duration: Duration(milliseconds: 300),
  width: expandido ? 200 : 100,
  color: expandido ? Colors.blue : Colors.grey,
)
```

`AnimatedContainer` (una animación implícita) simplemente interpola automáticamente entre el valor anterior y el nuevo cada vez que una de sus propiedades cambia (aquí, `width` y `color`), sin que el desarrollador escriba ningún código explícito de control de la animación: cambiar el valor de entrada es suficiente para disparar una transición suave automática.

```dart
class _MiAnimacionState extends State<MiAnimacion> with SingleTickerProviderStateMixin {
  late final controller = AnimationController(duration: Duration(seconds: 1), vsync: this);
  late final animacion = Tween<double>(begin: 0, end: 1).animate(controller);

  Widget build(BuildContext context) => FadeTransition(opacity: animacion, child: Text("Hola"));
}
```

Una animación explícita con `AnimationController` y `Tween` da control total sobre curvas de interpolación no lineales, repetición (loop, reverse), y composición de múltiples animaciones sincronizadas entre sí, a cambio de considerablemente más código que una animación implícita; esta elección es apropiada cuando la animación implícita simple no puede expresar el comportamiento deseado (por ejemplo, una secuencia coreografiada de múltiples animaciones distintas disparándose en momentos relativos específicos entre sí, o una animación que debe pausarse y reanudarse programáticamente en respuesta a eventos externos).

**Analogía:** una animación implícita es como encender un regulador de luz que interpola automáticamente la intensidad entre el nivel anterior y el nuevo sin necesidad de programar manualmente esa transición; una animación explícita es como un sistema de iluminación teatral completamente programable, capaz de coreografiar secuencias complejas y sincronizadas de múltiples luces, a cambio de requerir mucho más trabajo de configuración inicial.

**¿Por qué es importante?** Una animación implícita es suficiente cuando basta con interpolar automáticamente entre dos valores; se necesita el control de una explícita para curvas no lineales, repetición controlada, o composición de múltiples animaciones coordinadas entre sí.

**Código del ejemplo:**

```dart
AnimatedContainer(duration: Duration(milliseconds: 300), width: expandido ? 200 : 100)  // implícita
AnimationController(duration: Duration(seconds: 1), vsync: this)                          // explícita
```

**Diagrama: decisión implícita vs explícita**

```mermaid
flowchart TD
    A["¿Necesitás una secuencia de etapas,\nrepetición o composición?"] -->|No| B["AnimatedContainer/AnimatedOpacity\n(implícita)"]
    A -->|Sí| C["AnimationController + Tween\n(explícita)"]
```

En el proyecto integrador RutaFlow, esta animación vive en `lib/features/deliveries/presentation/delivery_list_screen.dart`. Práctica: implementá ambas versiones (implícita y explícita) sobre un widget propio de tu proyecto propio y compará el código resultante.

#### Paso 4 · Demostración guiada desde cero
```dart
AnimatedContainer(
  duration: Duration(milliseconds: 300),
  height: expandida ? 160 : 72,
  child: expandida ? DetalleCompacto(envio: envio) : null,
)
```

**Ejecuta el ejemplo** (crea un proyecto Flutter desde cero, pega el widget en `lib/main.dart` y arráncalo en un emulador o dispositivo):

```bash
flutter create demo_flutter
cd demo_flutter
flutter run
```
Para las pruebas de widget: `flutter test`.

Resultado esperado: tocar `TarjetaEnvio` cambia `expandida` y la altura del contenedor se interpola suavemente de 72 a 160 píxeles en 300ms, sin ningún código explícito de animación.

#### Paso 5 · Práctica guiada
Pista: intentá lograr que la tarjeta se expanda, pause un instante a mitad de camino, y luego continúe expandiéndose usando únicamente `AnimatedContainer` — ese es el fallo deliberado: `AnimatedContainer` solo interpola linealmente entre el valor inicial y el final, sin ninguna forma de expresar una pausa intermedia o una secuencia de múltiples etapas dentro de esa misma animación implícita.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 reemplazando esa animación por un `AnimationController` con un `TweenSequence` que defina explícitamente las dos etapas, confirmando que esa secuencia coreografiada sí es posible con el control explícito.

**Evidencia de aprendizaje:** entrega animación implícita funcionando, limitación detectada y TweenSequence explícito implementado.

#### Paso 7 · Cierre y evidencia
Entregá la animación implícita del Paso 4, la limitación de `AnimatedContainer` del Paso 5, y el `TweenSequence` explícito del Paso 6; explicá cuándo una animación implícita deja de ser suficiente y se necesita el control explícito de un `AnimationController`. Siguiente paso: estudia Flutter DevTools para medir si estas animaciones son realmente fluidas. Errores comunes: usar `AnimationController` para una interpolación simple que `AnimatedContainer` ya resuelve con menos código, olvidar hacer `dispose()` de un `AnimationController`, y no considerar `TweenSequence` cuando se necesita una secuencia de múltiples etapas. Fuentes oficiales: https://docs.flutter.dev/ui/animations/implicit-animations y https://docs.flutter.dev/ui/animations/tutorial.
**¿Por qué es importante?** Una animación implícita es suficiente para interpolar automáticamente entre dos valores; se necesita el control de una explícita para secuencias coreografiadas o composición de múltiples animaciones coordinadas.

### Tema 2: Flutter DevTools y detección de jank

#### Paso 1 · Objetivo y preparación
Al finalizar vas a grabar con el panel de Performance de DevTools el scroll de `ListaEnvios` para identificar qué fase específica del renderizado causa frames perdidos. Prerrequisitos: Tema 1 de este módulo.

#### Paso 2 · Contexto y caso real
Varios conductores reportaron que la lista de envíos "se traba" al hacer scroll rápido en sus teléfonos — en el emulador de desarrollo se siente perfectamente fluida, lo cual no prueba nada sobre dispositivos reales de gama media.

#### Paso 3 · Teoría, modelo mental y analogía
El panel de Performance mide el tiempo real de cada frame; a 60fps cada frame tiene ~16ms de presupuesto, y DevTools señala exactamente qué fase (build, layout, paint) excedió ese presupuesto.
**Conceptos clave:** medición objetiva de tiempo de frame, no percepción subjetiva.

El panel de Performance de Flutter DevTools graba el tiempo real que toma renderizar cada frame individual de la app; a 60fps, cada frame dispone de aproximadamente 16 milisegundos para completarse (construcción, layout, pintura), y cualquier frame que exceda ese presupuesto de tiempo causa "jank" (un entrecorte visual perceptible por el usuario, una pausa o salto brusco en una animación o scroll que debería percibirse como fluido); DevTools resalta exactamente qué fase específica del renderizado (build, layout, o paint) consumió ese tiempo excesivo en el frame problemático, permitiendo diagnosticar con precisión dónde optimizar en vez de adivinar basándose en percepción visual subjetiva, el mismo principio de medición objetiva frente a percepción subjetiva estudiado con Instruments en iOS (Módulo 10 de ese track) y el Layout Inspector en Android (Módulo 10 de ese track).

Grabar una sesión real sobre una interacción específica de scroll o animación (en vez de simplemente confiar en la impresión general de que "se ve fluido" durante desarrollo) revela problemas concretos y medibles, especialmente relevante dado que el hardware de desarrollo suele ser considerablemente más potente que los dispositivos de gama media o baja donde efectivamente correrá la app en manos de usuarios reales.

**Analogía:** Flutter DevTools es como un cronómetro de precisión que mide el tiempo exacto de cada etapa de una línea de ensamblaje, revelando exactamente en qué estación específica se acumula un retraso que ralentiza toda la línea, en vez de simplemente observar que "el proceso general se siente algo lento" sin poder señalar la causa concreta.

**¿Por qué es importante?** DevTools mide objetivamente el tiempo real de cada frame y señala exactamente qué fase del renderizado causó un frame perdido, permitiendo diagnósticos precisos de rendimiento en vez de depender de percepción visual subjetiva durante desarrollo.

**Diagrama:**

```
Frame a 60fps  → presupuesto ~16ms
Frame que excede ese presupuesto → jank perceptible
DevTools señala: ¿build, layout, o paint consumió el tiempo excedido?
```

**Diagrama: flujo de diagnóstico con DevTools**

```mermaid
flowchart TD
    A["flutter run --profile"] --> B["DevTools > Performance"]
    B --> C["Grabar scroll real"]
    C --> D{"¿Frame excede 16ms?"}
    D -->|Sí| E["¿build, layout o paint?"]
    D -->|No| F["Fluido, sin jank"]
```

En el proyecto integrador RutaFlow, `TarjetaEnvio` que se graba en esta sesión vive en `lib/features/deliveries/presentation/delivery_list_screen.dart`.

#### Paso 4 · Demostración guiada desde cero
```text
1. flutter run --profile (nunca en modo debug para medir performance real)
2. Abrí DevTools > pestaña Performance
3. Grabá mientras hacés scroll rápido en ListaEnvios
4. Detené la grabación y revisá los frames marcados en rojo
```

**Ejecuta el ejemplo** (crea un proyecto Flutter desde cero, pega el widget en `lib/main.dart` y arráncalo en un emulador o dispositivo):

```bash
flutter create demo_flutter
cd demo_flutter
flutter run
```
Para las pruebas de widget: `flutter test`.

Resultado esperado: DevTools muestra que varios frames durante el scroll exceden los 16ms, y señala específicamente que la fase de "build" (no layout ni paint) consume más tiempo — apuntando a que algo dentro del método `build` de `TarjetaEnvio` es costoso.

#### Paso 5 · Práctica guiada
Pista: grabá la misma sesión pero en modo `debug` (`flutter run` sin `--profile`) y compará los tiempos de frame — ese es el fallo deliberado: en modo debug, Flutter agrega verificaciones adicionales que no existen en producción, haciendo que los tiempos medidos sean sistemáticamente peores que en un release real, llevando a conclusiones de rendimiento incorrectas.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 volviendo a medir en modo `--profile`, e identificá el cálculo costoso específico dentro del `build` de `TarjetaEnvio` usando la pestaña de CPU Profiler de DevTools.

**Evidencia de aprendizaje:** entrega grabación en modo profile, medición distorsionada en debug detectada y cálculo costoso identificado.

#### Paso 7 · Cierre y evidencia
Entregá la grabación en modo profile del Paso 4, la medición distorsionada en modo debug del Paso 5, y el cálculo costoso identificado en el Paso 6; explicá por qué medir rendimiento en modo debug produce conclusiones sistemáticamente equivocadas. Siguiente paso: estudia const widgets y RepaintBoundary para optimizar lo que encontraste. Errores comunes: medir rendimiento en modo debug en vez de profile/release, confiar en la percepción subjetiva de fluidez en el emulador de desarrollo, y no grabar una interacción específica real sino solo observar la app en reposo. Fuentes oficiales: https://docs.flutter.dev/tools/devtools/performance y https://docs.flutter.dev/perf/ui-performance.
**¿Por qué es importante?** DevTools mide objetivamente el tiempo real de cada frame y señala exactamente qué fase del renderizado causó un frame perdido, en vez de depender de percepción visual subjetiva.

### Tema 3: const widgets, RepaintBoundary y shouldRepaint

#### Paso 1 · Objetivo y preparación
Al finalizar vas a marcar los íconos estáticos de `TarjetaEnvio` como `const`, y a aislar con `RepaintBoundary` un indicador animado de "sincronizando" para que no fuerce repintar el resto de la tarjeta. Prerrequisitos: Tema 2 de este módulo.

#### Paso 2 · Contexto y caso real
El cálculo costoso identificado en el Tema 2 resultó ser el ícono de estado, que se reconstruye innecesariamente en cada frame aunque nunca cambia; además, un pequeño indicador animado de "sincronizando" dentro de la tarjeta fuerza repintar toda la tarjeta en cada frame de su propia animación.

#### Paso 3 · Teoría, modelo mental y analogía
Marcar un widget inmutable como `const` le permite a Flutter omitirlo por completo en reconstrucciones futuras; `RepaintBoundary` aísla una porción del árbol en su propia capa de pintura.
**Conceptos clave:** widgets que Flutter puede omitir por completo durante una reconstrucción.

```dart
const Text("Texto estático") // Flutter sabe que nunca cambia: lo salta en reconstrucciones futuras
```

Marcar un widget que no depende de ningún estado mutable como `const` (verificado por el compilador de Dart, que garantiza que ese widget es efectivamente inmutable en tiempo de compilación) le comunica a Flutter que ese widget específico nunca necesita reconstruirse en respuesta a cambios posteriores, permitiendo que Flutter lo omita por completo durante una reconstrucción del árbol que lo contiene, reduciendo trabajo innecesario de forma medible, especialmente en árboles de widgets grandes con muchos elementos estáticos repetidos (como iconos o textos fijos dentro de una lista larga que se reconstruye frecuentemente por otras razones).

`RepaintBoundary` aísla una porción del árbol de renderizado en su propia capa de pintura independiente, de modo que cambios visuales dentro de esa porción no fuerzan repintar el resto del árbol circundante que no cambió, útil específicamente para widgets que se animan o actualizan frecuentemente rodeados de contenido estático que no debería repintarse innecesariamente en cada frame de esa animación; `shouldRepaint` (un método que se implementa al crear un `CustomPainter` propio) permite controlar explícitamente si una repintura personalizada es realmente necesaria comparando el estado anterior contra el nuevo, evitando repinturas costosas cuando el resultado visual sería idéntico de todas formas.

**Analogía:** un widget `const` es como una pieza de decoración fija atornillada permanentemente a la pared que un equipo de mantenimiento sabe que nunca necesita revisar en cada inspección de rutina, ahorrando ese tiempo de verificación innecesario; `RepaintBoundary` es como una pared divisoria que aísla el ruido y la actividad de renovación de una habitación específica, evitando que esa actividad perturbe innecesariamente a las habitaciones adyacentes que no están siendo renovadas.

**¿Por qué es importante?** Marcar un widget como `const` permite a Flutter omitirlo por completo durante reconstrucciones futuras, reduciendo trabajo innecesario de forma medible; `RepaintBoundary` aísla repinturas frecuentes evitando que afecten innecesariamente al resto del árbol de renderizado circundante.

**Código del ejemplo:**

```dart
const Text("Texto estático")   // omitido por completo en reconstrucciones futuras
RepaintBoundary(child: WidgetQueAnimaFrecuentemente())  // aísla su repintura del resto del árbol
```

**Diagrama: aislamiento de repintura**

```mermaid
flowchart LR
    subgraph TarjetaEnvio
        A["const Icon (estático)"]
        B["Text(envio.guia)"]
        C["RepaintBoundary"] --> D["IndicadorSincronizando\n(se repinta solo)"]
    end
```

En el proyecto integrador RutaFlow, `TarjetaEnvio` vive en `lib/features/deliveries/presentation/delivery_list_screen.dart`. Límite de la decisión: no conviene envolver cada widget con `RepaintBoundary` "por si acaso" — cada capa de pintura adicional tiene su propio costo de memoria; usalo específicamente cuando DevTools confirma que un elemento se repinta frecuentemente dentro de contenido mayormente estático, no como optimización preventiva sin medir.

#### Paso 4 · Demostración guiada desde cero
```dart
Row(children: [
  const Icon(Icons.local_shipping), // estático: Flutter lo omite en reconstrucciones futuras
  Text(envio.guia),
  RepaintBoundary(child: IndicadorSincronizando()), // aísla su repintura del resto de la tarjeta
])
```

**Ejecuta el ejemplo** (crea un proyecto Flutter desde cero, pega el widget en `lib/main.dart` y arráncalo en un emulador o dispositivo):

```bash
flutter create demo_flutter
cd demo_flutter
flutter run
```
Para las pruebas de widget: `flutter test`.

Resultado esperado: grabando de nuevo con DevTools, el ícono `const` ya no aparece en la lista de widgets reconstruidos en cada frame; el `IndicadorSincronizando` sigue animándose normalmente, pero su repintura ya no obliga a repintar el resto de `TarjetaEnvio`.

#### Paso 5 · Práctica guiada
Pista: quitá `RepaintBoundary` del indicador animado y medí de nuevo con DevTools cuántos píxeles se repintan en cada frame mientras ese indicador anima — ese es el fallo deliberado: sin `RepaintBoundary`, cada frame de la animación fuerza repintar toda la `TarjetaEnvio` circundante, aunque ninguno de esos elementos cambió realmente.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 restaurando `RepaintBoundary`, y medí con DevTools (la opción "Highlight repaints") cuántas áreas de la pantalla se repintan en cada frame antes y después, confirmando la reducción.

**Evidencia de aprendizaje:** entrega widgets const y RepaintBoundary, repintado excesivo detectado y medición comparativa confirmada.

#### Paso 7 · Cierre y evidencia
Entregá los widgets `const` y el `RepaintBoundary` del Paso 4, el repintado excesivo detectado en el Paso 5, y la medición comparativa del Paso 6; explicá por qué un elemento animado dentro de un árbol más grande necesita aislarse explícitamente con `RepaintBoundary`. Siguiente paso: cerrá el módulo integrando estas optimizaciones medibles en el proyecto completo. Errores comunes: omitir `const` en widgets estáticos dentro de listas largas, no aislar con `RepaintBoundary` elementos que se animan frecuentemente dentro de contenido mayormente estático, y aplicar estas optimizaciones sin medir primero con DevTools si realmente hacían falta. Fuentes oficiales: https://api.flutter.dev/flutter/widgets/RepaintBoundary-class.html y https://docs.flutter.dev/perf/best-practices.
**¿Por qué es importante?** Marcar un widget como `const` permite a Flutter omitirlo por completo durante reconstrucciones futuras; `RepaintBoundary` aísla repinturas frecuentes evitando que afecten innecesariamente al resto del árbol circundante.

### Tema 4: Isolates — trabajo pesado sin congelar la interfaz

#### Paso 1 · Objetivo y preparación
Al finalizar podrás mover un cálculo pesado a un **isolate** con `compute()` para que no bloquee el hilo de UI, y explicar por qué `async/await` por sí solo no basta para trabajo intensivo de CPU. Prerrequisitos: Módulo 0 (Futures y async/await) y Tema 2 de este módulo (detección de jank).

#### Paso 2 · Contexto y caso real
En RutaFlow, procesar el historial completo de posiciones GPS de un repartidor para calcular estadísticas (distancia total, tiempo detenido) es un cálculo pesado. Si lo haces en el hilo principal, la UI se **congela** varios segundos: los botones no responden y la animación se traba. Un isolate hace ese trabajo en paralelo, y la interfaz sigue fluida.

#### Paso 3 · Teoría, modelo mental y analogía
Dart es de un solo hilo: todo tu código (incluido el render) corre en el **isolate principal**. `async/await` sirve para esperar operaciones de E/S (red, disco) sin bloquear, pero NO para trabajo de CPU: un bucle que tritura números durante 3 segundos bloquea el hilo aunque sea `async`. Un **isolate** es un hilo de ejecución independiente con su propia memoria; `compute(funcion, dato)` ejecuta `funcion` en un isolate aparte y devuelve el resultado sin tocar la UI.

**Analogía:** el isolate principal es un cocinero que también atiende a los clientes. Si se pone a pelar 10 kg de papas (trabajo de CPU), nadie es atendido. Un isolate es un segundo cocinero en otra cocina: pela las papas en paralelo mientras el primero sigue atendiendo. No comparten la misma tabla (memoria), se pasan los resultados por una ventanilla (mensajes).

#### Paso 4 · Demostración guiada desde cero

```dart
import 'package:flutter/foundation.dart'; // compute
import 'package:flutter/material.dart';

// Función pesada que debe correr FUERA del hilo de UI (debe ser top-level o static).
int sumaPesada(int n) {
  var total = 0;
  for (var i = 0; i < n; i++) {
    total += i % 7;
  }
  return total;
}

class PantallaEstadisticas extends StatefulWidget {
  const PantallaEstadisticas({super.key});
  @override
  State<PantallaEstadisticas> createState() => _PantallaEstadisticasState();
}

class _PantallaEstadisticasState extends State<PantallaEstadisticas> {
  String estado = 'Listo';

  Future<void> calcular() async {
    setState(() => estado = 'Calculando…');
    // compute() corre sumaPesada en un ISOLATE aparte: la UI NO se congela.
    final resultado = await compute(sumaPesada, 500000000);
    setState(() => estado = 'Resultado: $resultado');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Text(estado),
          ElevatedButton(onPressed: calcular, child: const Text('Calcular')),
        ]),
      ),
    );
  }
}

void main() => runApp(const MaterialApp(home: PantallaEstadisticas()));
```

**Ejecuta el ejemplo** (crea un proyecto Flutter, pega esto en `lib/main.dart` y arráncalo):

```bash
flutter create demo_flutter
cd demo_flutter
flutter run
```

**Resultado esperado:** al pulsar "Calcular", el texto cambia a "Calculando…" y, tras un momento, muestra el resultado — y durante todo ese tiempo la interfaz sigue respondiendo (puedes seguir interactuando, no hay jank). **Fallo deliberado:** reemplaza `await compute(sumaPesada, 500000000)` por una llamada directa `final resultado = sumaPesada(500000000);`. Ahora, al pulsar el botón, la UI se **congela** completamente durante el cálculo: el texto "Calculando…" ni siquiera llega a pintarse hasta que termina. Confirma con el DevTools (Tema 2) el frame gigante bloqueado, y diagnostica por qué `async` no salvó a la UI: el trabajo era de CPU, no de E/S.

#### Paso 5 · Práctica guiada
Añade un `CircularProgressIndicator` girando mientras `estado == 'Calculando…'`. Con `compute`, el spinner gira suavemente; con la versión directa (fallo deliberado), el spinner se congela. Pista: el spinner es la prueba visual más clara de si el hilo de UI está libre.

#### Paso 6 · Práctica independiente
Usa `compute` para parsear un JSON grande (simula el historial GPS como una lista de 100.000 puntos) y calcular la distancia total. Entrega la versión con isolate y mide la diferencia de fluidez frente a hacerlo en el hilo principal.

#### Paso 7 · Cierre y evidencia
Entrega el cálculo con `compute`, el congelamiento del fallo deliberado y el spinner que distingue ambos casos. **¿Por qué es importante?** La regla de oro de una app móvil fluida es "nunca bloquees el hilo de UI". `async/await` cubre la E/S, pero el trabajo de CPU (parseo masivo, imágenes, criptografía, cálculos geoespaciales) necesita isolates. Es la diferencia entre una app que se siente profesional y una que "se traba". Fuentes: [Flutter — Concurrency and isolates](https://docs.flutter.dev/perf/isolates) y [dart:isolate](https://api.dart.dev/stable/dart-isolate/dart-isolate-library.html).
**Conceptos clave:** hilo único de Dart, isolate principal, `compute()`, memoria no compartida y paso de mensajes, E/S vs CPU.
**Cuándo no usarlo:** para operaciones de red o disco, `async/await` normal basta y es más simple — crear un isolate tiene un costo de arranque y de copia de datos. Usa isolates solo para trabajo de CPU que dure lo suficiente para causar jank perceptible.

**Transferencia al proyecto integrador «RutaFlow»:** calcula las estadísticas del historial de entregas de un repartidor con `compute` y demuestra con DevTools que la lista de envíos sigue haciendo scroll fluido mientras el cálculo corre.

---
Como **siguiente** paso, lleva lo aprendido al próximo tema y conéctalo con el proyecto integrador del track.
**Errores comunes:** pasar a `compute()` un método de instancia o una función anidada en vez de una función top-level o `static` como `sumaPesada` — el isolate nuevo no puede copiar referencias como `this`, así que `compute` falla al intentar enviar la función en vez de simplemente ejecutarla.
**Fuente oficial:** [documentación de Flutter](https://docs.flutter.dev/).

### Tema 5: CustomPainter: dibujar con Canvas sin repintar de más

#### Paso 1 · Objetivo y preparación
Al finalizar podrás dibujar un componente propio con `CustomPainter` y `Canvas`, controlar cuándo se repinta con `shouldRepaint`, aislarlo con `RepaintBoundary` y hacerlo accesible con `Semantics`. Prerrequisitos: Temas 2 y 3 de este módulo.

#### Paso 2 · Contexto y caso real
La app del repartidor necesita una barra de avance de ruta con un círculo por parada. Ningún widget estándar la dibuja así. Gráficos, firmas, mapas simplificados e indicadores de progreso son casos reales que se resuelven con un `CustomPainter`.

#### Paso 3 · Teoría, modelo mental y analogía
Un `CustomPaint` delega el dibujo a un `CustomPainter`: su método `paint(canvas, size)` recibe un **Canvas** sobre el que dibujas líneas, círculos o rutas con objetos `Paint` (color, grosor, estilo). `shouldRepaint` decide si un nuevo painter debe volver a dibujar: compararlo con el anterior evita repintar en cada reconstrucción. `RepaintBoundary` aísla el dibujo en su propia capa, y como el Canvas no es accesible por sí solo, `Semantics` describe el resultado a los lectores de pantalla. Para efectos por píxel existen los *fragment shaders* (`FragmentProgram`), un paso más avanzado.

**Analogía:** el `Canvas` es una hoja en blanco y el `Paint` es el lápiz que eliges; `shouldRepaint` es preguntarte si el dibujo cambió antes de borrar y volver a pintar.

**Diagrama:**

```mermaid
flowchart LR
    W[ProgresoRuta] --> S[Semantics]
    S --> B[RepaintBoundary]
    B --> C[CustomPaint]
    C --> P[ProgresoRutaPainter.paint]
    P --> K[Canvas: líneas y círculos]
```

#### Paso 4 · Demostración guiada desde cero
**Ejemplo independiente (desde cero):** este tema se reproduce en una **carpeta vacía**, como **proyecto nuevo**, sin estado de otros temas.

```bash
mkdir custom-painter && cd custom-painter
flutter create repartidor_painter
cd repartidor_painter
```

Crea `test/progreso_ruta_test.dart`:

```dart
// test/progreso_ruta_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:repartidor_painter/progreso_ruta.dart';

void main() {
  test('solo repinta cuando cambia el avance', () {
    final antes = ProgresoRutaPainter(paradas: 5, completadas: 2, color: Colors.teal);
    final igual = ProgresoRutaPainter(paradas: 5, completadas: 2, color: Colors.teal);
    final despues = ProgresoRutaPainter(paradas: 5, completadas: 3, color: Colors.teal);
    expect(igual.shouldRepaint(antes), isFalse);
    expect(despues.shouldRepaint(antes), isTrue);
  });

  testWidgets('dibuja y anuncia el avance a lectores de pantalla', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: Scaffold(body: ProgresoRuta(paradas: 5, completadas: 3))));
    expect(find.byType(CustomPaint), findsWidgets);
    expect(find.bySemanticsLabel('3 de 5 paradas completadas'), findsOneWidget);
  });
}
```

Crea `lib/progreso_ruta.dart`:

```dart
// lib/progreso_ruta.dart — dibuja el avance de una ruta con un CustomPainter
import 'package:flutter/material.dart';

class ProgresoRutaPainter extends CustomPainter {
  ProgresoRutaPainter({required this.paradas, required this.completadas, required this.color});

  final int paradas;
  final int completadas;
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final y = size.height / 2;
    final paso = size.width / (paradas - 1);
    final linea = Paint()
      ..color = Colors.grey.shade300
      ..strokeWidth = 4;
    final avance = Paint()
      ..color = color
      ..strokeWidth = 4;

    canvas.drawLine(Offset(0, y), Offset(size.width, y), linea);
    canvas.drawLine(Offset(0, y), Offset(paso * (completadas - 1).clamp(0, paradas - 1), y), avance);
    for (var i = 0; i < paradas; i++) {
      final hecho = i < completadas;
      canvas.drawCircle(Offset(paso * i, y), hecho ? 9 : 7, hecho ? avance : linea);
    }
  }

  // Solo vuelve a pintar si cambió algo que afecta el dibujo
  @override
  bool shouldRepaint(ProgresoRutaPainter anterior) =>
      anterior.completadas != completadas || anterior.paradas != paradas || anterior.color != color;
}

class ProgresoRuta extends StatelessWidget {
  const ProgresoRuta({super.key, required this.paradas, required this.completadas});
  final int paradas;
  final int completadas;

  @override
  Widget build(BuildContext context) => Semantics(
        label: '$completadas de $paradas paradas completadas',
        child: RepaintBoundary(
          child: CustomPaint(
            size: const Size(double.infinity, 32),
            painter: ProgresoRutaPainter(
              paradas: paradas,
              completadas: completadas,
              color: Theme.of(context).colorScheme.primary,
            ),
          ),
        ),
      );
}
```

**Ejecuta el ejemplo:**

```bash
rm test/widget_test.dart
flutter test
```

**Resultado esperado:**

```text
00:03 +2: All tests passed!
```

El resultado visual lo ves con `flutter run` usando `ProgresoRuta(paradas: 5, completadas: 3)` en tu pantalla: tres círculos y el tramo recorrido en el color principal del tema.

**Fallo deliberado:** Cambia `shouldRepaint` para que devuelva siempre `false`. La primera prueba falla con `Expected: true` y `Actual: <false>`, y en la app la barra deja de avanzar aunque cambie `completadas`: Flutter reutiliza el dibujo viejo porque le dijiste que nada cambió.

#### Paso 5 · Práctica guiada
Agrega un parámetro `fallidas` y dibuja en rojo las paradas fallidas. Actualiza `shouldRepaint` y la etiqueta semántica. **Pista:** pinta primero las completadas y luego, con otro `Paint` rojo, las que estén en el conjunto de fallidas; sin el campo en `shouldRepaint` el cambio no se verá.

#### Paso 6 · Práctica independiente
Anima el avance con un `AnimationController` pasando `repaint: animacion` al `CustomPainter`, y mide con Flutter DevTools que solo se repinta la capa del `RepaintBoundary`.

#### Paso 7 · Cierre y evidencia
Entrega como evidencia la salida real del Paso 4 y la explicación del fallo deliberado. **¿Por qué es importante?** porque te permite construir componentes que no existen en la librería estándar sin sacrificar rendimiento ni accesibilidad.
**Fuente oficial:** [Flutter: CustomPaint](https://api.flutter.dev/flutter/widgets/CustomPaint-class.html), [Flutter: CustomPainter](https://api.flutter.dev/flutter/rendering/CustomPainter-class.html).
**Conceptos clave:** `CustomPaint`, `CustomPainter`, `Canvas`, `Paint`, `shouldRepaint`, `RepaintBoundary`, `Semantics`, fragment shaders.
**Cuándo no usarlo:** si se puede componer con widgets existentes (`Row`, `Container`, `LinearProgressIndicator`), hazlo: son accesibles por defecto y más fáciles de mantener.

**Transferencia al proyecto integrador «Aplicación móvil del repartidor»:** muestra el avance de la ruta del día en la pantalla principal con este componente y su etiqueta accesible.
Como **siguiente** paso, aplica lo aprendido en el proyecto integrador del track y compara el resultado con lo que esperabas.
**Errores comunes:** agregar un campo nuevo al painter (como `fallidas` en el Paso 5) y olvidar incluirlo en la comparación de `shouldRepaint` — Flutter sigue reutilizando el dibujo anterior porque, según esa comparación, "nada cambió", aunque el estado real sí haya cambiado.

## Laboratorio práctico

**Objetivo del laboratorio:** construir una animación fluida propia auditada con DevTools sin frames perdidos.

**Requisitos previos:** Módulo 7 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Implementar una animación implícita con `AnimatedContainer` | Ver Tema 1 | Interpolación automática |
| 2 | Implementar la misma animación explícita con `AnimationController` | Ver Tema 1 | Compara el control que da cada enfoque |
| 3 | Grabar el rendimiento con DevTools | Ver Tema 2 | Identifica frames perdidos en scroll |
| 4 | Marcar widgets estáticos como `const` | Ver Tema 3 | Mide la reducción de rebuilds con DevTools |

**Verificación:** el laboratorio se considera exitoso si la sesión grabada en DevTools tras las optimizaciones aplicadas no muestra frames que excedan el presupuesto de ~16ms durante la interacción auditada, y si marcar widgets como `const` reduce medible mente el número de rebuilds registrados.

**Errores comunes y soluciones**

- **Usar una animación explícita cuando una implícita simple sería suficiente.** Prefiere `AnimatedContainer` u otros widgets implícitos para casos simples de interpolación directa.
- **No grabar una sesión real con DevTools, confiando solo en percepción visual.** Mide objetivamente el tiempo de frame antes de asumir que el rendimiento es adecuado.
- **Omitir `const` en widgets estáticos dentro de listas largas.** Aumenta trabajo innecesario de reconstrucción; márcalos como `const` cuando sea posible.

---
