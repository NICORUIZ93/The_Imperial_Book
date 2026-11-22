# Módulo 14: Flutter para entregas: mapas, GPS y tiempo real


## Antes de escribir código: vertical y estructura de carpetas

Construirás una vertical pequeña, no un clon completo de una marca: el conductor inicia una jornada, comparte posiciones aceptables, recibe una ruta y confirma una entrega aun si pierde conexión. Parte de un proyecto nuevo con `flutter create demo_driver`, agrega únicamente los paquetes del incremento que estés implementando y conserva las claves de mapas fuera del repositorio.

```text
lib/
  features/journey/
    domain/position_sample.dart
    domain/journey_repository.dart
    application/observe_driver_position.dart
    data/geolocator_position_source.dart
    data/socket_journey_gateway.dart
    presentation/journey_controller.dart
    presentation/journey_map_page.dart
  shared/
    network/dio_client.dart
    storage/local_database.dart
test/features/journey/
  position_sample_test.dart
  journey_controller_test.dart
```

La dirección de dependencias es `presentation → application → domain`; `data` implementa interfaces del dominio. Google Maps, Geolocator, Dio y Socket.IO son adaptadores reemplazables, no tipos que deban atravesar toda la aplicación. Ejecuta después de cada incremento con `flutter analyze` y `flutter test`; prueba permisos y ejecución en segundo plano en dispositivo real porque el simulador no reproduce todas las restricciones del sistema operativo.

## Aprende construyendo


### Tema 1: Diseño de pantallas y Riverpod · Intermedio · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a modelar el estado de una jornada de entrega como un sealed class JourneyState observado con Riverpod, evitando las combinaciones imposibles que producen varios booleanos sueltos. Prerrequisitos: Flutter estable, Dart y un dispositivo o emulador; confirma flutte…

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a modelar el estado de una jornada de entrega como un sealed class JourneyState observado con Riverpod, evitando las combinaciones imposibles que producen varios booleanos sueltos.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Riverpod es la central de despacho que distribuye un estado único y observable; un estado cerrado (`sealed class`) obliga a un `switch` exhaustivo en la vista, que nunca puede olvidar visualmente un caso como el offline.

**Conceptos clave:** contratos, estados explícitos, fallos, seguridad y verificación.

La jornada se diseña desde tareas reales: iniciar turno, aceptar ruta, navegar a una parada, escanear, capturar evidencia y confirmar. La pantalla no debería deducir reglas a partir de varios booleanos independientes (`isLoading`, `hasError`, `isOffline`), porque combinaciones imposibles terminan apareciendo. Modela un estado cerrado que indique exactamente qué puede mostrar y qué acción es válida.

```dart
sealed class JourneyState {
  const JourneyState();
}
final class JourneyIdle extends JourneyState { const JourneyIdle(); }
final class JourneyLoading extends JourneyState { const JourneyLoading(); }
final class JourneyReady extends JourneyState {
  const JourneyReady(this.viewModel);
  final JourneyViewModel viewModel;
}
final class JourneyOffline extends JourneyState {
  const JourneyOffline(this.pendingCommands);
  final int pendingCommands;
}
final class JourneyFailure extends JourneyState {
  const JourneyFailure(this.message, {required this.canRetry});
  final String message;
  final bool canRetry;
}
```

`JourneyController` coordina casos de uso y emite estos estados; no importa widgets, `BuildContext`, Dio ni SQLite. La vista usa un `switch` exhaustivo para renderizar progreso, mapa, cola pendiente o recuperación. Esto permite probar el flujo sin inicializar plugins móviles y hace imposible olvidar visualmente el estado offline.

**Analogía:** Es como un tablero de una sola aguja: en lugar de encender y apagar tres luces que pueden contradecirse, un indicador único dice «en ruta», «sin señal» o «fallo», y no admite dos a la vez.

**¿Por qué es importante?** Porque una aplicación logística funciona en movimiento, con mala red, concurrencia y datos sensibles. La corrección debe sobrevivir fuera de una demostración local.

**Casos de uso reales:** una jornada que pasa de «sin conexión» a «reintentando» sin mostrar a la vez error y carga; un operador que ve la cola pendiente y el botón de reintento solo cuando corresponde; una prueba del controlador sin emulador.

**Diagrama: cómo leer la dependencia:** la UI solicita una acción al controlador; el caso de uso aplica la regla; el repositorio decide entre adaptadores sin que el dominio conozca plugins.

```mermaid
flowchart LR
  UI[JourneyMapPage] --> C[JourneyController]
  C --> U[ObserveDriverPosition]
  U --> R[JourneyRepository]
  R -.implementado por.-> G[Geolocator adapter]
  R -.implementado por.-> S[Socket/HTTP adapter]
  C --> ST[JourneyState cerrado]
  ST --> UI
```

**Transferencia al proyecto integrador «Aplicación móvil del repartidor»:** Expón carga, error y ruta disponible desde el provider de entregas. Cambia de pantalla durante una consulta y verifica que el estado anterior no contamina la ruta recién seleccionada.

**Dónde se rompe la analogía:** el modelo simplifica la realidad; en producción influyen escala, fallos, costo y contexto.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
  UI[JourneyMapPage] --> C[JourneyController]
  C --> U[ObserveDriverPosition]
  U --> R[JourneyRepository]
  R -.implementado por.-> G[Geolocator adapter]
  R -.implementado por.-> S[Socket/HTTP adapter]
  C --> ST[JourneyState cerrado]
  ST --> UI
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Diseño de pantallas y Riverpod se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Diseño de pantallas y Riverpod | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses diseño de pantallas y riverpod por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: diseño de pantallas y riverpod funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Diseño de pantallas y Riverpod existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve diseño de pantallas y riverpod en tu contexto?
2. ¿Cómo sabrías que diseño de pantallas y riverpod no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar diseño de pantallas y riverpod?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```dart
sealed class JourneyState {
  const JourneyState();
}
final class JourneyIdle extends JourneyState { const JourneyIdle(); }
final class JourneyLoading extends JourneyState { const JourneyLoading(); }
final class JourneyReady extends JourneyState {
  const JourneyReady(this.viewModel);
  final JourneyViewModel viewModel;
}
final class JourneyOffline extends JourneyState {
  const JourneyOffline(this.pendingCommands);
  final int pendingCommands;
}
final class JourneyFailure extends JourneyState {
  const JourneyFailure(this.message, {required this.canRetry});
  final String message;
  final bool canRetry;
}
```

```mermaid
flowchart LR
  UI[JourneyMapPage] --> C[JourneyController]
  C --> U[ObserveDriverPosition]
  U --> R[JourneyRepository]
  R -.implementado por.-> G[Geolocator adapter]
  R -.implementado por.-> S[Socket/HTTP adapter]
  C --> ST[JourneyState cerrado]
  ST --> UI
```

```bash
flutter create ejemplo
```

```bash
flutter create ejemplo_riverpod
flutter analyze
```

</details>

### Tema 2: Google Maps y localización en tiempo real · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a convertir una Position cruda del plugin de geolocalización en un PositionSample de dominio que rechaza coordenadas imposibles, muestras viejas o imprecisas. Prerrequisitos: Flutter estable, Dart y un dispositivo o emulador; confirma flutter doctor.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a convertir una Position cruda del plugin de geolocalización en un PositionSample de dominio que rechaza coordenadas imposibles, muestras viejas o imprecisas.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en google maps y localización en tiempo real como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
  P[Position del plugin] --> V{coordenadas válidas?}
  V -->|no| X[descartar + métrica]
  V -->|sí| T{edad menor a 20 s?}
  T -->|no| X
  T -->|sí| A{precisión menor a 50 m?}
  A -->|no| AP[mostrar aproximación]
  A -->|sí| OK[aceptar, persistir y publicar]
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Google Maps y localización en tiempo real se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Google Maps y localización en tiempo real | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses google maps y localización en tiempo real por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: google maps y localización en tiempo real funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Google Maps y localización en tiempo real existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve google maps y localización en tiempo real en tu contexto?
2. ¿Cómo sabrías que google maps y localización en tiempo real no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar google maps y localización en tiempo real?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```dart
final class PositionSample {
  PositionSample({
    required this.latitude,
    required this.longitude,
    required this.accuracyMeters,
    required this.capturedAt,
  }) {
    if (latitude < -90 || latitude > 90) throw ArgumentError('latitude');
    if (longitude < -180 || longitude > 180) throw ArgumentError('longitude');
    if (accuracyMeters < 0) throw ArgumentError('accuracyMeters');
  }

  final double latitude;
  final double longitude;
  final double accuracyMeters;
  final DateTime capturedAt;

  bool isUsableAt(DateTime now) =>
      accuracyMeters <= 50 && now.difference(capturedAt) <= const Duration(seconds: 20);
}
```

```mermaid
flowchart LR
  P[Position del plugin] --> V{coordenadas válidas?}
  V -->|no| X[descartar + métrica]
  V -->|sí| T{edad menor a 20 s?}
  T -->|no| X
  T -->|sí| A{precisión menor a 50 m?}
  A -->|no| AP[mostrar aproximación]
  A -->|sí| OK[aceptar, persistir y publicar]
```

```bash
flutter create ejemplo
```

```bash
flutter create ejemplo_mapa
flutter analyze
```

</details>

### Tema 3: Animaciones de localización · Intermedio · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a interpolar la posición y el rumbo de un marcador entre dos muestras de GPS durante un intervalo limitado, en vez de saltar directamente a la nueva coordenada. Prerrequisitos: Flutter estable, Dart y un dispositivo o emulador; confirma flutter doctor.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a interpolar la posición y el rumbo de un marcador entre dos muestras de GPS durante un intervalo limitado, en vez de saltar directamente a la nueva coordenada.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en animaciones de localización como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart TD
  A["muestra GPS válida"] --> B["interpolar posición y rumbo"]
  B --> C["animación acotada"]
  C --> D["marcador en destino"]
  E["muestra nueva"] --> F["cancela la anterior"] --> B
  G["muestra vieja"] --> H["se descarta"]
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Animaciones de localización se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Animaciones de localización | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses animaciones de localización por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: animaciones de localización funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Animaciones de localización existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve animaciones de localización en tu contexto?
2. ¿Cómo sabrías que animaciones de localización no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar animaciones de localización?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart TD
  A["muestra GPS válida"] --> B["interpolar posición y rumbo"]
  B --> C["animación acotada"]
  C --> D["marcador en destino"]
  E["muestra nueva"] --> F["cancela la anterior"] --> B
  G["muestra vieja"] --> H["se descarta"]
```

```bash
flutter create ejemplo
```

```bash
flutter create ejemplo_animacion
flutter analyze
```

</details>

### Tema 4: Socket.IO y actualización de rutas · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a aplicar un JourneyEventReducer que descarta eventos de posición duplicados o fuera de secuencia recibidos por Socket.IO. Prerrequisitos: Flutter estable, Dart y un dispositivo o emulador; confirma flutter doctor.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a aplicar un JourneyEventReducer que descarta eventos de posición duplicados o fuera de secuencia recibidos por Socket.IO.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en socket.io y actualización de rutas como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
sequenceDiagram
  participant M as App Flutter
  participant S as Canal tiempo real
  participant A as API de jornadas
  M->>S: conectar(token, journeyId)
  S->>A: autorizar identidad + propiedad
  A-->>S: permitido
  S-->>M: position sequence=41
  Note over M,S: pérdida de red
  M->>S: reconectar(lastSequence=41)
  S->>A: obtener eventos desde 41
  A-->>M: snapshot actual + sequence=47
  M->>M: descartar cualquier sequence menor o igual a 47
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Socket.IO y actualización de rutas se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Socket.IO y actualización de rutas | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses socket.io y actualización de rutas por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: socket.io y actualización de rutas funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Socket.IO y actualización de rutas existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve socket.io y actualización de rutas en tu contexto?
2. ¿Cómo sabrías que socket.io y actualización de rutas no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar socket.io y actualización de rutas?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```dart
final class JourneyEventReducer {
  int _lastSequence = 0;

  PositionSample? apply(DriverPositionEvent event, DateTime now) {
    if (event.sequence <= _lastSequence) return null;
    if (!event.position.isUsableAt(now)) return null;
    _lastSequence = event.sequence;
    return event.position;
  }

  int get resumeAfter => _lastSequence;
}
```

```mermaid
sequenceDiagram
  participant M as App Flutter
  participant S as Canal tiempo real
  participant A as API de jornadas
  M->>S: conectar(token, journeyId)
  S->>A: autorizar identidad + propiedad
  A-->>S: permitido
  S-->>M: position sequence=41
  Note over M,S: pérdida de red
  M->>S: reconectar(lastSequence=41)
  S->>A: obtener eventos desde 41
  A-->>M: snapshot actual + sequence=47
  M->>M: descartar cualquier sequence menor o igual a 47
```

```bash
flutter create ejemplo
```

```bash
flutter create ejemplo_socket
flutter analyze
```

</details>

### Tema 5: Almacenamiento local, imágenes y offline · Avanzado · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a conservar una confirmación de entrega en una cola local (SQLite) con estado pending/syncing/synced/failed, que sobrevive aunque el conductor pierda conexión o reinicie la app. Prerrequisitos: Flutter estable, Dart y un dispositivo o emulador; confirma flutter d…

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a conservar una confirmación de entrega en una cola local (SQLite) con estado pending/syncing/synced/failed, que sobrevive aunque el conductor pierda conexión o reinicie la app.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en almacenamiento local, imágenes y offline como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart TD
  A["confirmación y foto cifrada<br/>con solo la ruta local"] --> B["fila local: pending"]
  B --> C["syncing"]
  C -->|"200"| D["synced: fila eliminada"]
  C -->|"error de red"| E["failed: reintento acotado"]
  E --> C
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Almacenamiento local, imágenes y offline se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Almacenamiento local, imágenes y offline | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses almacenamiento local, imágenes y offline por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: almacenamiento local, imágenes y offline funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Almacenamiento local, imágenes y offline existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve almacenamiento local, imágenes y offline en tu contexto?
2. ¿Cómo sabrías que almacenamiento local, imágenes y offline no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar almacenamiento local, imágenes y offline?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart TD
  A["confirmación y foto cifrada<br/>con solo la ruta local"] --> B["fila local: pending"]
  B --> C["syncing"]
  C -->|"200"| D["synced: fila eliminada"]
  C -->|"error de red"| E["failed: reintento acotado"]
  E --> C
```

```bash
flutter create ejemplo
```

```bash
flutter create ejemplo_offline
flutter analyze
```

</details>

### Tema 6: Dio y notificaciones push · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a configurar un cliente Dio con interceptores que serializan la renovación de token, y a tratar una notificación push como un aviso, no como una autorización. Prerrequisitos: Flutter estable, Dart y un dispositivo o emulador; confirma flutter doctor.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a configurar un cliente Dio con interceptores que serializan la renovación de token, y a tratar una notificación push como un aviso, no como una autorización.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en dio y notificaciones push como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
sequenceDiagram
  participant P as Petición
  participant D as Interceptor Dio
  participant S as Backend
  participant N as Push (FCM/APNs)
  P->>D: request con token vencido
  D->>S: refresh serializado, una sola vez
  S-->>D: token nuevo
  D->>S: reintento acotado
  S-->>P: respuesta
  N->>P: push recibido
  P->>S: consulta el recurso
  Note over P,S: el push avisa, no autoriza
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Dio y notificaciones push se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Dio y notificaciones push | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses dio y notificaciones push por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: dio y notificaciones push funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Dio y notificaciones push existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve dio y notificaciones push en tu contexto?
2. ¿Cómo sabrías que dio y notificaciones push no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar dio y notificaciones push?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
sequenceDiagram
  participant P as Petición
  participant D as Interceptor Dio
  participant S as Backend
  participant N as Push (FCM/APNs)
  P->>D: request con token vencido
  D->>S: refresh serializado, una sola vez
  S-->>D: token nuevo
  D->>S: reintento acotado
  S-->>P: respuesta
  N->>P: push recibido
  P->>S: consulta el recurso
  Note over P,S: el push avisa, no autoriza
```

```bash
flutter create ejemplo
```

```bash
flutter create ejemplo_http
flutter analyze
```

</details>
