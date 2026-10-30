# Módulo 3: Navegación y rutas


## Aprende construyendo

### Tema 1: go_router: navegación como función de la URL

#### Paso 1 · Objetivo y preparación
Al finalizar vas a reemplazar la navegación imperativa de RutaFlow (`Navigator.push`/`pop`) por go_router, donde `/envios/:id` sea la fuente de verdad de qué envío se muestra. Prerrequisitos: Módulo 2 completo.

#### Paso 2 · Contexto y caso real
Hoy, abrir el detalle de un envío usa `Navigator.push(context, MaterialPageRoute(builder: (_) => DetalleEnvio(id: id)))` — no hay ninguna URL que represente "estoy viendo el envío RF-4471", lo que hace imposible abrir esa pantalla directamente desde un link externo.

#### Paso 3 · Teoría, modelo mental y analogía
El Navigator 1.0 trata la navegación como operaciones sobre una pila; go_router la trata como función pura de la URL actual — una dirección postal de destino, no instrucciones paso a paso.

**Evidencia de aprendizaje:** entrega navegación declarativa, desincronización de URL detectada y segunda ruta anidada confirmada.
**Conceptos clave:** la URL es la fuente de verdad, no una pila de operaciones push/pop imperativas.

```dart
final router = GoRouter(routes: [
  GoRoute(path: '/', builder: (context, state) => ListaTareasScreen()),
  GoRoute(
    path: '/tareas/:id',
    builder: (context, state) => DetalleTareaScreen(id: state.pathParameters['id']!),
  ),
]);
```

```dart
context.go('/tareas/42'); // navegación declarativa, la URL es la fuente de verdad
```

El `Navigator` 1.0 (el modelo original de Flutter) gestiona la navegación de forma imperativa: `Navigator.push(context, MaterialPageRoute(builder: ...))` agrega una página al stack, y `Navigator.pop(context)` la retira, un modelo directo pero que trata la navegación como una secuencia de operaciones sobre una pila, sin ninguna representación explícita de "en qué URL/ruta se encuentra la app en este momento"; go_router (construido sobre el Navigator 2.0, la API declarativa introducida posteriormente) invierte este modelo, tratando la navegación como una función pura de la URL actual: `context.go('/tareas/42')` simplemente declara la ruta de destino deseada, y go_router determina automáticamente qué stack de páginas corresponde a esa URL, reconstruyéndolo según sea necesario.

Este modelo declarativo es considerablemente más natural para deep linking (Tema 2) y para Flutter Web (donde la URL del navegador debe reflejar fielmente el estado de navegación de la app, algo que el modelo imperativo de push/pop no maneja naturalmente sin sincronización manual adicional entre el stack interno y la barra de direcciones del navegador).

**Analogía:** el Navigator 1.0 imperativo es como dar instrucciones paso a paso de movimiento ("avanza dos pasos, gira a la derecha") sin ninguna referencia a una dirección absoluta; go_router declarativo es como simplemente indicar una dirección postal completa de destino ("Calle Principal 42") y dejar que el sistema de navegación determine automáticamente la ruta completa necesaria para llegar allí, sin importar desde dónde se partió.

**¿Por qué es importante?** go_router resuelve el problema de que el Navigator 1.0 imperativo no tiene ninguna representación explícita de "en qué ruta está la app", un problema crítico específicamente para deep linking y Flutter Web, donde la URL debe ser la fuente de verdad sincronizada del estado de navegación.

**Código del ejemplo:**

```dart
final router = GoRouter(routes: [
  GoRoute(path: '/', builder: (context, state) => ListaTareasScreen()),
  GoRoute(path: '/tareas/:id', builder: (context, state) => DetalleTareaScreen(id: state.pathParameters['id']!)),
]);
context.go('/tareas/42');
```

**Diagrama: URL como fuente de verdad**

```mermaid
stateDiagram-v2
    [*] --> ListaEnvios: "/envios"
    ListaEnvios --> DetalleEnvio: context.go('/envios/:id')
    DetalleEnvio --> ListaEnvios: context.go('/envios')
    note right of DetalleEnvio: la URL actual siempre\nrepresenta la pantalla visible
```

En el proyecto integrador RutaFlow, el router vive en `lib/core/router.dart` y las rutas de envíos en `lib/features/deliveries/presentation/delivery_list_screen.dart`. Límite de la decisión: go_router no conviene para flujos modales transitorios de un solo paso (un diálogo de confirmación, por ejemplo) donde nunca haría falta una URL propia — ahí un `showDialog` imperativo sigue siendo la opción correcta frente al costo de declarar una ruta completa.

#### Paso 4 · Demostración guiada desde cero
```dart
final router = GoRouter(routes: [
  GoRoute(path: '/envios', builder: (context, state) => ListaEnvios()),
  GoRoute(
    path: '/envios/:id',
    builder: (context, state) => DetalleEnvio(id: state.pathParameters['id']!),
  ),
]);
context.go('/envios/RF-4471'); // navegación declarativa, la URL es la fuente de verdad
```

**Ejecuta el ejemplo** (crea un proyecto Flutter desde cero, pega el widget en `lib/main.dart` y arráncalo en un emulador o dispositivo):

```bash
flutter create demo_flutter
cd demo_flutter
flutter run
```
Para las pruebas de widget: `flutter test`.

Resultado esperado: tocar un envío en la lista llama a `context.go('/envios/RF-4471')`, y `DetalleEnvio` lee el id directamente de `state.pathParameters['id']` — la URL `/envios/RF-4471` representa exactamente qué se está mostrando, sin ningún stack imperativo oculto.

#### Paso 5 · Práctica guiada
Pista: dejá la ruta `/envios/:id` definida, pero seguí navegando con `Navigator.push` directo desde `ListaEnvios` en vez de `context.go(...)` — ese es el fallo deliberado: la pantalla se abre igual, pero la URL de la app nunca cambia a `/envios/RF-4471`; sigue mostrando la ruta anterior, desincronizada de lo que realmente se ve en pantalla.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 devolviendo `context.go('/envios/$id')`, y agregá una segunda ruta `/envios/:id/historial` anidada, confirmando que la URL siempre refleja exactamente qué pantalla se está mostrando.

#### Paso 7 · Cierre y evidencia
Entregá la navegación declarativa del Paso 4, la desincronización de URL provocada en el Paso 5, y la segunda ruta del Paso 6; explicá por qué go_router resuelve el problema de que el Navigator 1.0 no tiene ninguna representación explícita de "en qué ruta está la app". Siguiente paso: estudia guards y deep linking. Errores comunes: mezclar `Navigator.push` imperativo con rutas de go_router ya definidas, usar `state.pathParameters['id']!` sin verificar que el parámetro realmente puede faltar, y definir rutas sin un `builder` que use efectivamente ese parámetro. Fuentes oficiales: https://pub.dev/packages/go_router y https://docs.flutter.dev/ui/navigation.
**¿Por qué es importante?** go_router resuelve el problema de que el Navigator 1.0 imperativo no tiene ninguna representación explícita de "en qué ruta está la app", crítico para deep linking y Flutter Web.

### Tema 2: Guards y deep linking

#### Paso 1 · Objetivo y preparación
Al finalizar vas a proteger `/admin` de RutaFlow con un `redirect` declarativo, y a confirmar que un deep link externo a `/envios/RF-4471` abre directamente ese envío sin pasos manuales. Prerrequisitos: Tema 1 de este módulo.

#### Paso 2 · Contexto y caso real
La pantalla de administración de conductores debería ser inaccesible para cualquier operador sin sesión de supervisor — y un link de WhatsApp compartido con un conductor debería abrir directamente ese envío sin navegación manual.

#### Paso 3 · Teoría, modelo mental y analogía
Un `redirect` en la definición de la ruta centraliza el guard; con go_router, un deep link usa exactamente el mismo mecanismo que la navegación interna, sin lógica paralela.

**Evidencia de aprendizaje:** entrega guard declarativo, ruta desprotegida detectada y ruta hija heredando protección confirmada.
**Conceptos clave:** protección declarativa de rutas, deep linking sin lógica especial adicional.

```dart
GoRoute(
  path: '/admin',
  redirect: (context, state) => estaAutenticado ? null : '/login',
  builder: (context, state) => AdminScreen(),
)
```

Un `redirect` declarado directamente en la definición de la ruta intercepta cualquier intento de navegar a esa ruta y decide, según una condición (típicamente el estado de autenticación), si permitir la navegación (devolviendo `null`) o redirigir hacia otra ruta en su lugar (devolviendo la ruta de destino alternativa, como `/login`); esta protección declarativa centraliza la lógica de guard directamente en la definición de la ruta, en vez de dispersar verificaciones manuales de autenticación repetidas en cada widget de pantalla protegida, un enfoque más mantenible y menos propenso a que se olvide proteger una ruta nueva agregada posteriormente.

Con go_router, un link externo (`miapp://tareas/42`) simplemente navega a la ruta correspondiente usando exactamente el mismo mecanismo que la navegación interna dentro de la app, sin ninguna lógica especial adicional de manejo de deep links por separado: dado que la navegación ya es una función de la URL (Tema 1), un deep link es simplemente otra forma de proveer esa URL de entrada al sistema de rutas ya existente, en vez de requerir un mecanismo paralelo de traducción de URLs externas hacia operaciones imperativas de push, como sería necesario con el Navigator 1.0.

**Analogía:** un guard con `redirect` es como un control de acceso automatizado en la entrada de un edificio que verifica credenciales antes de permitir el paso, redirigiendo automáticamente a quienes no las tienen hacia la recepción en vez de dejarlos entrar; el deep linking con go_router es como que cualquier dirección postal válida (interna o proveniente de una fuente externa) se procese exactamente por el mismo sistema de entrega, sin un canal de procesamiento separado según el origen de la dirección.

**¿Por qué es importante?** Los guards declarativos centralizan la protección de rutas directamente en su definición, evitando verificaciones dispersas y propensas a omisión; el deep linking es más directo de configurar con un router declarativo porque la navegación ya es una función de la URL, sin requerir un mecanismo paralelo separado.

**Código del ejemplo:**

```dart
GoRoute(
  path: '/admin',
  redirect: (context, state) => estaAutenticado ? null : '/login',
  builder: (context, state) => AdminScreen(),
)
```

**Diagrama: guard declarativo con redirect**

```mermaid
flowchart TD
    A["Navegar a /admin"] --> B{"redirect: ¿autenticado?"}
    B -->|Sí| C["builder: AdminScreen()"]
    B -->|No| D["redirect a /login"]
```

En el proyecto integrador RutaFlow, el guard vive en `lib/core/router.dart` junto a las rutas de administración. Límite de la decisión: un `redirect` por ruta no conviene cuando la condición de acceso depende de datos que todavía no cargaron (por ejemplo, el perfil del usuario en vuelo) — en ese caso conviene mostrar una pantalla de carga explícita antes de decidir el redirect, no bloquear la navegación con un valor indefinido.

#### Paso 4 · Demostración guiada desde cero
```dart
GoRoute(
  path: '/admin',
  redirect: (context, state) => estaAutenticadoComoSupervisor ? null : '/login',
  builder: (context, state) => AdminScreen(),
)
```

**Ejecuta el ejemplo** (crea un proyecto Flutter desde cero, pega el widget en `lib/main.dart` y arráncalo en un emulador o dispositivo):

```bash
flutter create demo_flutter
cd demo_flutter
flutter run
```
Para las pruebas de widget: `flutter test`.

Resultado esperado: un operador sin sesión de supervisor que navega a `/admin` es redirigido automáticamente a `/login`; un deep link externo a `/envios/RF-4471` abre `DetalleEnvio` directamente, porque esa URL ya coincide con una ruta existente del router, sin ningún código adicional de "manejo de deep links".

#### Paso 5 · Práctica guiada
Pista: quitá el `redirect` de `/admin` y en su lugar agregá una verificación manual dentro del `build()` de `AdminScreen` — ese es el fallo deliberado: funciona para esa pantalla específica, pero cuando alguien agrega una segunda ruta de administración (`/admin/reportes`) y se olvida de copiar esa misma verificación manual ahí, esa nueva ruta queda completamente desprotegida.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 devolviendo el `redirect` a la definición de la ruta `/admin`, y agregá `/admin/reportes` como ruta hija bajo el mismo padre protegido, confirmando que hereda la protección sin necesitar su propio `redirect` repetido.

#### Paso 7 · Cierre y evidencia
Entregá el guard declarativo del Paso 4, la ruta desprotegida por verificación dispersa del Paso 5, y la ruta hija heredando protección del Paso 6; explicá por qué centralizar el guard en la definición de la ruta evita que una ruta nueva quede desprotegida por descuido. Siguiente paso: estudia transiciones personalizadas. Errores comunes: verificar autenticación manualmente dentro de cada widget de pantalla protegida en vez de en un `redirect`, no confirmar que las rutas hijas heredan protección, y tratar el deep linking como un sistema separado en vez de la misma función de URL ya existente. Fuentes oficiales: https://pub.dev/packages/go_router y https://docs.flutter.dev/ui/navigation/deep-linking.
**¿Por qué es importante?** Los guards declarativos centralizan la protección de rutas directamente en su definición, evitando verificaciones dispersas y propensas a omisión.

### Tema 3: Transiciones personalizadas

#### Paso 1 · Objetivo y preparación
Al finalizar vas a aplicar un fundido (`FadeTransition`) específicamente a la transición hacia la pantalla de confirmación exitosa, comunicando "este flujo terminó" en vez del deslizamiento estándar. Prerrequisitos: Tema 2 de este módulo.

#### Paso 2 · Contexto y caso real
Tras confirmar una entrega, RutaFlow navega con la transición de deslizamiento por defecto — la misma animación que usa para "avanzar un paso más", que no comunica bien que ese flujo de confirmación ya concluyó.

#### Paso 3 · Teoría, modelo mental y analogía
`pageBuilder` con `CustomTransitionPage` permite especificar explícitamente la animación de una ruta — un fundido comunica "esto reemplaza el contexto anterior" mejor que un deslizamiento lateral.

#### Paso 4 · Demostración guiada desde cero
```dart
GoRoute(
  path: '/envios/:id/confirmado',
  pageBuilder: (context, state) => CustomTransitionPage(
    child: ConfirmacionExitosa(),
    transitionsBuilder: (context, animation, _, child) => FadeTransition(opacity: animation, child: child),
  ),
)
```

**Ejecuta el ejemplo** (crea un proyecto Flutter desde cero, pega el widget en `lib/main.dart` y arráncalo en un emulador o dispositivo):

```bash
flutter create demo_flutter
cd demo_flutter
flutter run
```
Para las pruebas de widget: `flutter test`.

Resultado esperado: al confirmar una entrega, la navegación hacia `ConfirmacionExitosa` usa un fundido de opacidad en vez del deslizamiento estándar, comunicando visualmente que ese flujo concluyó, distinto de navegar "un paso más adentro" en la jerarquía habitual.

#### Paso 5 · Práctica guiada
Pista: aplicá ese mismo `FadeTransition` a todas las rutas de la app, incluyendo la navegación normal entre `ListaEnvios` y `DetalleEnvio` — ese es el fallo deliberado: ahora toda la navegación se siente uniformemente "distinta" sin ningún significado diferenciado, perdiendo la señal visual que la transición personalizada debía comunicar solo en el punto donde aportaba valor.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 devolviendo la transición por defecto a la navegación normal entre `ListaEnvios` y `DetalleEnvio`, dejando el `FadeTransition` únicamente en la ruta de confirmación exitosa, y documentá por escrito el criterio de cuándo aplicar una transición distinta a la estándar.

#### Paso 7 · Cierre y evidencia
Entregá la transición personalizada en el punto correcto del Paso 4, la aplicación indiscriminada del Paso 5, y el criterio documentado del Paso 6; explicá por qué aplicar transiciones personalizadas en todas partes diluye exactamente la señal visual que debían comunicar en los puntos específicos donde sí aportaban valor. Siguiente paso: cerrá el módulo integrando rutas, guards y transiciones en el flujo completo de RutaFlow. Errores comunes: aplicar transiciones personalizadas de forma inconsistente en toda la app sin criterio, elegir una transición que no refleja la relación semántica real entre pantallas, y no probar la transición en ambas direcciones. Fuentes oficiales: https://pub.dev/documentation/go_router/latest/go_router/CustomTransitionPage-class.html y https://docs.flutter.dev/ui/animations.
**¿Por qué es importante?** Las transiciones personalizadas, aplicadas deliberadamente en puntos clave, comunican mejor la relación semántica entre pantallas que la transición por defecto genérica.
**Evidencia de aprendizaje:** entrega transición personalizada en el punto correcto, aplicación indiscriminada detectada y criterio documentado.
**Conceptos clave:** control explícito sobre la animación de transición entre pantallas.

```dart
GoRoute(
  path: '/detalle',
  pageBuilder: (context, state) => CustomTransitionPage(
    child: DetalleScreen(),
    transitionsBuilder: (context, animation, _, child) => FadeTransition(opacity: animation, child: child),
  ),
)
```

`pageBuilder` en vez del `builder` simple permite envolver la pantalla de destino en un `CustomTransitionPage`, especificando explícitamente cómo debe animarse la transición de entrada y salida de esa ruta (aquí, un fundido de opacidad en vez de la transición de deslizamiento estándar por defecto); esto es apropiado cuando la transición predeterminada de la plataforma no comunica correctamente la relación semántica entre dos pantallas (por ejemplo, un fundido puede comunicar mejor "esto reemplaza completamente el contexto anterior" que un deslizamiento lateral, que sugiere más bien "esto es un paso más profundo dentro del mismo flujo").

Personalizar transiciones de forma consistente en puntos clave de la app (no en absolutamente todas las rutas, lo que podría resultar en una experiencia inconsistente y confusa) refuerza la comunicación visual de la estructura de navegación percibida por el usuario, un detalle de pulido que distingue una app cuidadosamente diseñada de una que simplemente usa las transiciones por defecto sin ninguna consideración deliberada.

**Analogía:** una transición personalizada es como elegir deliberadamente el tipo de puerta apropiado para cada tipo de tránsito en un edificio (una puerta giratoria para tránsito continuo casual, una puerta de seguridad con verificación para un área restringida), comunicando visualmente la naturaleza de cada transición específica en vez de usar el mismo tipo de puerta genérica en todas partes sin ninguna distinción.

**¿Por qué es importante?** Las transiciones personalizadas, aplicadas deliberadamente en puntos clave, comunican mejor la relación semántica entre pantallas que la transición por defecto genérica, un detalle de pulido perceptible por el usuario aunque sutil.

**Código del ejemplo:**

```dart
CustomTransitionPage(
  child: DetalleScreen(),
  transitionsBuilder: (context, animation, _, child) => FadeTransition(opacity: animation, child: child),
)
```

**Diagrama: cuándo personalizar una transición**

```mermaid
flowchart TD
    A["Nueva ruta"] --> B{"¿Cierra un flujo o cambia de contexto?"}
    B -->|Sí| C["pageBuilder + CustomTransitionPage"]
    B -->|No, es un paso más| D["builder estándar (deslizamiento)"]
```

En el proyecto integrador RutaFlow, la transición de confirmación vive en `lib/features/deliveries/presentation/confirmacion_exitosa.dart`. Practicá este criterio como ejercicio: identificá en tu proyecto propio una sola pantalla donde la transición por defecto comunique mal la relación entre pantallas, y aplicá ahí `CustomTransitionPage`.

---


## Laboratorio práctico

**Objetivo del laboratorio:** construir una app con rutas declarativas (go_router), una ruta protegida y deep linking.

**Requisitos previos:** Módulo 2 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Navegar con `Navigator.push`/`pop` clásico | — | Estilo imperativo |
| 2 | Reescribir con go_router declarativo | Ver Tema 1 | Rutas definidas centralmente |
| 3 | Pasar un parámetro de ruta | Ver Tema 1 | Leerlo en la pantalla de destino |
| 4 | Configurar un guard (redirect) | Ver Tema 2 | Bloquea acceso sin sesión activa |
| 5 | Configurar un deep link | Ver Tema 2 | Abre directamente una pantalla específica |

**Verificación:** el laboratorio se considera exitoso si la ruta protegida redirige correctamente a un usuario sin sesión activa, y si el deep link configurado navega directamente a la pantalla correspondiente sin pasos manuales adicionales.

**Errores comunes y soluciones**

- **Mezclar Navigator 1.0 imperativo con go_router declarativo sin necesidad.** Prefiere consistencia con el modelo declarativo salvo casos muy puntuales.
- **Verificar autenticación manualmente dentro de cada widget de pantalla protegida.** Centraliza esa lógica en un `redirect` de la ruta.
- **Aplicar transiciones personalizadas inconsistentemente en toda la app sin criterio.** Resérvalas para puntos clave donde comunican mejor la relación semántica entre pantallas.

---
