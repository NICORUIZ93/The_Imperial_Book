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

### Tema 1: Diseño de pantallas y Riverpod

#### Paso 1 · Objetivo y preparación
Al finalizar vas a modelar el estado de una jornada de entrega como un `sealed class JourneyState` observado con Riverpod, evitando las combinaciones imposibles que producen varios booleanos sueltos. Prerrequisitos: Flutter estable, Dart y un dispositivo o emulador; confirma `flutter doctor`.

#### Paso 2 · Contexto y caso real
Una app de entregas debe mostrar estados de red y ubicación sin perder acciones del conductor; modelar el estado con banderas booleanas independientes (`isLoading`, `hasError`, `isOffline`) permite combinaciones imposibles que la pantalla termina mostrando.

#### Paso 3 · Teoría, modelo mental y analogía
Riverpod es la central de despacho que distribuye un estado único y observable; un estado cerrado (`sealed class`) obliga a un `switch` exhaustivo en la vista, que nunca puede olvidar visualmente un caso como el offline.

#### Paso 4 · Demostración guiada
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir `lib/features/journey/presentation/journey_controller.dart` dentro.
```bash
flutter create ejemplo
```

Ejecuta `flutter create ejemplo_riverpod`, crea `lib/features/journey/presentation/journey_controller.dart` y separa dominio, aplicación y presentación; comenta cada bloque.
```bash
flutter create ejemplo_riverpod
flutter analyze
```
**Ejecución y resultado:** corre `flutter analyze` y `flutter test`; la salida debe terminar sin errores y la pantalla debe mostrar cada estado.
**Fallo deliberado:** elimina el provider para observar el diagnóstico, registra el error y restáuralo.
**Resultado esperado:** la ejecución termina sin errores y produce la salida descrita arriba.
#### Paso 5 · Práctica guiada
Pista: observa el diagnóstico antes de corregirlo, y añade un estado offline siguiendo la pista del modelo `JourneyState`.

#### Paso 6 · Práctica independiente
Agrega un caso límite al `switch` exhaustivo y una prueba que confirme que la vista lo maneja.

#### Paso 7 · Cierre
Entrega árbol, código, salida, el fallo corregido y explica el resultado. Como siguiente paso, integra la siguiente capacidad. Errores comunes: estado duplicado, secretos en código y probar solo online. Fuentes oficiales: https://riverpod.dev/ y https://docs.flutter.dev/.

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

### Tema 2: Google Maps y localización en tiempo real

#### Paso 1 · Objetivo y preparación
Al finalizar vas a convertir una `Position` cruda del plugin de geolocalización en un `PositionSample` de dominio que rechaza coordenadas imposibles, muestras viejas o imprecisas. Prerrequisitos: Flutter estable, Dart y un dispositivo o emulador; confirma `flutter doctor`.

#### Paso 2 · Contexto y caso real
Una app de entregas debe mostrar estados de red y ubicación sin perder acciones del conductor; enviar directamente cada `Position` del plugin al mapa o al servidor puede propagar una coordenada imposible o una muestra con precisión inaceptable.

#### Paso 3 · Teoría, modelo mental y analogía
El mapa es un tablero y el GPS una fuente de eventos que debe filtrarse antes de confiar en ella; una muestra GPS es una medición con margen de error, como una balanza que informa peso y tolerancia.

#### Paso 4 · Demostración guiada
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir `lib/features/location/location_service.dart` dentro.
```bash
flutter create ejemplo
```

Ejecuta `flutter create ejemplo_mapa`, crea `lib/features/location/location_service.dart` y documenta permisos y claves.
```bash
flutter create ejemplo_mapa
flutter analyze
```
**Ejecución y resultado:** corre `flutter analyze` y `flutter test`; la salida debe terminar sin errores y la posición debe actualizarse.
**Fallo deliberado:** deniega permisos para observar el diagnóstico, registra el error y restáuralo.
**Resultado esperado:** la ejecución termina sin errores y produce la salida descrita arriba.
#### Paso 5 · Práctica guiada
Pista: observa el diagnóstico antes de corregirlo, y añade un estado explícito para "sin señal" cuando el servicio de ubicación está desactivado.

#### Paso 6 · Práctica independiente
Prueba una posición inválida (latitud fuera de rango) y documenta la decisión de rechazarla en el constructor de `PositionSample` en vez de dejarla llegar al mapa.

#### Paso 7 · Cierre
Entrega árbol, código, salida, el fallo corregido y explica el resultado. Como siguiente paso, integra la siguiente capacidad. Errores comunes: claves públicas, permisos ignorados y posiciones sin timestamp. Fuentes oficiales: https://pub.dev/packages/geolocator y https://docs.flutter.dev/.

**Conceptos clave:** contratos, estados explícitos, fallos, seguridad y verificación.

`google_maps_flutter` presenta marcadores, polylines y cámara; `geolocator` obtiene posiciones con precisión, instante y velocidad. No envíes directamente cada `Position` del plugin. Conviértela primero a un tipo de dominio que pueda rechazar coordenadas imposibles, muestras antiguas o una precisión incompatible con el caso de uso.

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

En `geolocator_position_source.dart`, solicita permiso cuando el conductor activa «Iniciar jornada», explica antes para qué se usa y diferencia `denied`, `deniedForever` y servicio de ubicación desactivado. Configura una distancia mínima antes de una frecuencia fija agresiva; una jornada detenida no necesita el mismo muestreo que un vehículo en movimiento. En Android e iOS, la ubicación en segundo plano requiere configuración, justificación y pruebas separadas: conceder permiso «mientras se usa» no garantiza actualizaciones cuando la app queda suspendida.

En el mapa conserva dos conceptos: la última muestra **recibida** y la última muestra **aceptada**. Una muestra imprecisa puede mostrarse como un círculo de incertidumbre sin reemplazar la posición operacional. La polyline representa la geometría sugerida por el proveedor de rutas; no demuestra que el conductor haya recorrido ese trayecto.

**Analogía:** una muestra GPS es una medición con margen de error, como una balanza que informa peso y tolerancia; dibujar más decimales no vuelve más preciso el instrumento.

**¿Por qué es importante?** Separar la medición cruda de la posición aceptada evita que datos antiguos o imprecisos hagan retroceder el vehículo, disparen una llegada falsa o recalculen rutas innecesariamente.

**Casos de uso reales:** permiso negado permanentemente, servicio GPS apagado, muestra con 200 metros de precisión, salto a una vía paralela y suspensión de la app por ahorro de batería.

**Diagrama: filtro de una muestra antes de actualizar mapa o servidor:**

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

**Transferencia al proyecto integrador «Aplicación móvil del repartidor»:** Muestra la última posición con precisión y antigüedad en el mapa del repartidor. Prueba permiso denegado y dato obsoleto; la ruta debe seguir consultable sin inventar una ubicación reciente.

### Tema 3: Socket.IO y actualización de rutas

Este cliente requiere un servidor **Socket.IO compatible**. No se conecta al endpoint STOMP del laboratorio Spring Boot 14: ese es un protocolo diferente. Prepara primero el gateway y la prueba de compatibilidad de [RutaFlow: seguimiento en tiempo real](/curso/rutaflow/5). `socket_io_client` 3.x corresponde a servidores Socket.IO 4.7 o superiores de la rama 4.x. El gateway local de ese laboratorio solo acepta ENV-42 con credencial ficticia; la autorización de producción requiere identidad y propiedad verificadas por el servidor.

#### Paso 1 · Objetivo y preparación
Al finalizar vas a aplicar un `JourneyEventReducer` que descarta eventos de posición duplicados o fuera de secuencia recibidos por Socket.IO. Prerrequisitos: Flutter estable, Dart y un dispositivo o emulador; confirma `flutter doctor`.

#### Paso 2 · Contexto y caso real
Una app de entregas recibe cambios de ruta en tiempo real; sin un orden explícito, un evento que llega tarde o duplicado puede hacer retroceder el vehículo en el mapa o reflejarlo dos veces.

#### Paso 3 · Teoría, modelo mental y analogía
El socket es un teléfono persistente; cada evento necesita contrato, orden e idempotencia. Reconectar restablece la llamada, pero no reproduce lo dicho mientras estaba desconectado — hace falta reanudar desde la última secuencia confirmada.

**Conceptos clave:** contratos, estados explícitos, fallos, seguridad y verificación.

`socket_io_client` conecta con un servidor Socket.IO compatible, autentica el *handshake*, entra en un canal autorizado de la jornada y procesa eventos versionados. Socket.IO aporta negociación, eventos con nombre y reconexión sobre su propio protocolo; no es intercambiable automáticamente con un endpoint WebSocket o STOMP de Spring. El backend debe usar un servidor Socket.IO compatible o debe elegirse deliberadamente STOMP/WebSocket en ambos extremos.

Cada evento de posición necesita `journeyId`, `driverId`, `sequence`, `capturedAt` y coordenadas. El cliente conserva la última secuencia aplicada y descarta duplicados o eventos anteriores. Después de reconectar solicita un *snapshot* o eventos desde esa secuencia; “conectado otra vez” no significa que recibió lo ocurrido durante la desconexión.

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

Configura el token en `auth` durante la conexión y valida identidad y propiedad de la jornada en el servidor antes de unir el socket a una sala. No uses el `journeyId` enviado por el cliente como autorización. Al renovar el token, crea una estrategia explícita de reconexión; registrar tokens completos en eventos de diagnóstico expone credenciales.

La ruta no se recalcula ante cada punto. Define una política con distancia a la polyline, tiempo desde el último cálculo y cambio operacional. Por ejemplo: recalcular si el vehículo permanece a más de 80 metros del corredor durante tres muestras aceptadas, o si se agrega/cancela una parada. Esta histéresis evita oscilación y gasto de API por ruido GPS.

**Analogía:** reconectar un teléfono después de perder cobertura restablece la llamada, pero no reproduce las frases dichas mientras estaba desconectado; hace falta un resumen o historial desde el último mensaje confirmado.

**¿Por qué es importante?** Sin secuencia, reanudación y autorización por recurso, el mapa puede retroceder, omitir posiciones o permitir que una identidad válida observe una jornada ajena.

**Casos de uso reales:** reconexión después de un túnel, evento duplicado, dos dispositivos para el mismo conductor, token vencido durante la jornada y desviación causada por precisión deficiente.

**Diagrama: reanudación después de perder conectividad:**

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

**Transferencia al proyecto integrador «Aplicación móvil del repartidor»:** Reconecta el canal de rutas y recupera una instantánea autorizada. Simula eventos repetidos y atrasados y comprueba que la entrega conserva la versión más reciente, no el último paquete recibido.

#### Paso 4 · Demostración guiada
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir `lib/features/realtime/route_gateway.dart` dentro.
```bash
flutter create ejemplo
```

Ejecuta `flutter create ejemplo_socket`, crea `lib/features/realtime/route_gateway.dart` y documenta conexión y reconexión.
```bash
flutter create ejemplo_socket
flutter analyze
```
**Ejecución y resultado:** corre `flutter analyze` y `flutter test`; la salida debe terminar sin errores y el evento debe reflejarse una sola vez.
**Fallo deliberado:** corta la red para observar el diagnóstico, registra el error y restáuralo.
**Resultado esperado:** la ejecución termina sin errores y produce la salida descrita arriba.
#### Paso 5 · Práctica guiada
Pista: observa el diagnóstico antes de corregirlo, y añade backoff antes de reconectar tras una caída de red.

#### Paso 6 · Práctica independiente
Ignora eventos duplicados o con `sequence` menor a la última aplicada, y prueba el límite enviando el mismo evento dos veces seguidas.

#### Paso 7 · Cierre
Entrega árbol, código, salida, el fallo corregido y explica el resultado. Como siguiente paso, integra la siguiente capacidad. Errores comunes: listeners duplicados y mensajes sin versión. Fuentes oficiales: https://socket.io/docs/ y https://docs.flutter.dev/.

### Tema 4: Animaciones de localización

#### Paso 1 · Objetivo y preparación
Al finalizar vas a interpolar la posición y el rumbo de un marcador entre dos muestras de GPS durante un intervalo limitado, en vez de saltar directamente a la nueva coordenada. Prerrequisitos: Flutter estable, Dart y un dispositivo o emulador; confirma `flutter doctor`.

#### Paso 2 · Contexto y caso real
Un marcador debe moverse sin saltos en el mapa; actualizar la posición directamente cada vez que llega una muestra nueva produce un salto brusco en vez de un movimiento continuo y creíble.

#### Paso 3 · Teoría, modelo mental y analogía
La interpolación es un puente entre dos muestras; no inventa una ruta válida que el vehículo no haya recorrido, solo suaviza visualmente la transición entre dos posiciones ya confirmadas.

#### Paso 4 · Demostración guiada
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir `lib/features/map/presentation/marker_motion.dart` dentro.
```bash
flutter create ejemplo
```

Ejecuta `flutter create ejemplo_animacion`, crea `lib/features/map/presentation/marker_motion.dart` y comenta duración y curva.
```bash
flutter create ejemplo_animacion
flutter analyze
```
**Ejecución y resultado:** corre `flutter analyze` y `flutter test`; la salida debe terminar sin errores y el marcador debe llegar al destino.
**Fallo deliberado:** usa una duración extrema para observar el diagnóstico, registra el error y corrígelo.
**Resultado esperado:** la ejecución termina sin errores y produce la salida descrita arriba.
#### Paso 5 · Práctica guiada
Pista: observa el diagnóstico antes de corregirlo, y añade cancelación del `AnimationController` si llega una muestra nueva antes de que termine la animación anterior.

#### Paso 6 · Práctica independiente
Prueba muestras que llegan fuera de orden y confirma que el marcador nunca retrocede visualmente por una muestra vieja llegada tarde.

#### Paso 7 · Cierre
Entrega árbol, código, salida, el fallo corregido y explica el resultado. Como siguiente paso, integra la siguiente capacidad. Errores comunes: animar cada evento sin límite y bloquear el hilo UI. Fuentes oficiales: https://docs.flutter.dev/ui/animations.

**Conceptos clave:** contratos, estados explícitos, fallos, seguridad y verificación.

El marcador no salta entre puntos: interpola posición y rumbo durante un intervalo limitado. Los eventos fuera de orden no retroceden el vehículo. AnimationController se libera en dispose y el frame budget se mide con DevTools. La animación comunica movimiento estimado; no fabrica precisión que el GPS no posee. La implementación se conecta al resto de la app y se prueba con camino feliz, entrada inválida, repetición y dependencia no disponible.

**Analogía:** Es como un tren que se desliza entre dos estaciones: suaviza el trayecto visible, pero no puede pasar por una vía que no existe.

**¿Por qué es importante?** Porque interpolar entre dos muestras válidas evita saltos visuales sin inventar una ruta que el vehículo no recorrió realmente; una animación que haga parecer actual una posición obsoleta engaña al operador que la observa.

**Casos de uso reales:** dos muestras GPS separadas por 30 m y un segundo; una muestra vieja que llega después de la nueva y no debe mover el marcador hacia atrás; una animación interrumpida por una posición más reciente.

**Diagrama:**

```mermaid
flowchart TD
  A["muestra GPS válida"] --> B["interpolar posición y rumbo"]
  B --> C["animación acotada"]
  C --> D["marcador en destino"]
  E["muestra nueva"] --> F["cancela la anterior"] --> B
  G["muestra vieja"] --> H["se descarta"]
```

**Transferencia al proyecto integrador «Aplicación móvil del repartidor»:** Interpola visualmente entre dos posiciones válidas sin modificar sus datos originales. Prueba una pausa larga y evita que la animación haga parecer actual una ubicación que ya está obsoleta.

### Tema 5: Almacenamiento local, imágenes y offline

#### Paso 1 · Objetivo y preparación
Al finalizar vas a conservar una confirmación de entrega en una cola local (SQLite) con estado `pending`/`syncing`/`synced`/`failed`, que sobrevive aunque el conductor pierda conexión o reinicie la app. Prerrequisitos: Flutter estable, Dart y un dispositivo o emulador; confirma `flutter doctor`.

#### Paso 2 · Contexto y caso real
El conductor debe conservar una entrega aunque pierda conexión; si la confirmación solo vive en memoria, perderla al cerrar la app significaría repetir el trabajo o, peor, perder la evidencia de una entrega ya realizada.

#### Paso 3 · Teoría, modelo mental y analogía
La cola local es un cuaderno con orden, estado y reintento seguro: cada comando tiene un UUID idempotente, y una imagen capturada se guarda comprimida y cifrada con solo una referencia local, nunca los bytes completos en una fila.

#### Paso 4 · Demostración guiada
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir `lib/features/offline/pending_delivery.dart` dentro.
```bash
flutter create ejemplo
```

Ejecuta `flutter create ejemplo_offline`, crea `lib/features/offline/pending_delivery.dart` y documenta tamaño y cifrado.
```bash
flutter create ejemplo_offline
flutter analyze
```
**Ejecución y resultado:** corre `flutter analyze` y `flutter test`; la salida debe terminar sin errores y la cola debe sobrevivir un reinicio.
**Fallo deliberado:** llena el almacenamiento para observar el diagnóstico, registra el error y restáuralo.
**Resultado esperado:** la ejecución termina sin errores y produce la salida descrita arriba.
#### Paso 5 · Práctica guiada
Pista: observa el diagnóstico antes de corregirlo, y añade un checksum a cada evidencia guardada para detectar corrupción antes de sincronizar.

#### Paso 6 · Práctica independiente
Resuelve el conflicto entre un registro local marcado `pending` y uno que el servidor ya reporta como `synced`, decidiendo explícitamente cuál prevalece.

#### Paso 7 · Cierre
Entrega árbol, código, salida, el fallo corregido y explica el resultado. Como siguiente paso, integra la siguiente capacidad. Errores comunes: imágenes sin compresión, duplicados y secretos en texto plano. Fuentes oficiales: https://docs.flutter.dev/cookbook/persistence.

**Conceptos clave:** contratos, estados explícitos, fallos, seguridad y verificación.

SQLite conserva jornada, paradas y un outbox de comandos. Capturar foto genera un archivo comprimido y cifrado con referencia local; no guarda bytes grandes en una fila. Cada confirmación usa UUID idempotente y estados pending/syncing/synced/failed. image_picker/camera manejan cancelación, metadatos y permisos. La implementación se conecta al resto de la app y se prueba con camino feliz, entrada inválida, repetición y dependencia no disponible.

**Analogía:** Es como un libro de recibos que viaja en la guantera: el conductor anota la entrega aunque no haya cobertura, y cada recibo tiene un número que impide contarla dos veces.

**¿Por qué es importante?** Porque una cola local con estado explícito y UUID idempotente evita perder una confirmación de entrega al reiniciar sin conexión, y evita duplicar el cobro o la entrega cuando la sincronización se reintenta.

**Casos de uso reales:** confirmar una entrega en un sótano sin señal; reiniciar la app con tres comandos pendientes; reintentar una foto pesada sin duplicar la evidencia.

**Diagrama:**

```mermaid
flowchart TD
  A["confirmación y foto cifrada<br/>con solo la ruta local"] --> B["fila local: pending"]
  B --> C["syncing"]
  C -->|"200"| D["synced: fila eliminada"]
  C -->|"error de red"| E["failed: reintento acotado"]
  E --> C
```

**Transferencia al proyecto integrador «Aplicación móvil del repartidor»:** Guarda la referencia local de una evidencia junto a su operación pendiente. Reinicia sin conexión y confirma que sigue disponible para subirla, distinguiendo archivo ausente de envío aún no sincronizado.

**Límites y decisión de uso:** Una imagen cacheada puede desaparecer y no debe ser la única copia de una evidencia pendiente. Conserva archivos necesarios para sincronización con una política explícita y comprueba espacio disponible, antigüedad y limpieza tras confirmar recepción.

### Tema 6: Dio y notificaciones push

#### Paso 1 · Objetivo y preparación
Al finalizar vas a configurar un cliente Dio con interceptores que serializan la renovación de token, y a tratar una notificación push como un aviso, no como una autorización. Prerrequisitos: Flutter estable, Dart y un dispositivo o emulador; confirma `flutter doctor`.

#### Paso 2 · Contexto y caso real
Una entrega necesita HTTP autenticado y avisos accionables; si varias peticiones disparan simultáneamente la renovación del token vencido, el backend recibe una tormenta de solicitudes de refresh en vez de una sola.

#### Paso 3 · Teoría, modelo mental y analogía
Dio es la ventanilla con interceptores; push es un telegrama que no sustituye al servidor. FCM/APNs despierta o informa, pero la app siempre debe consultar el backend como fuente de verdad antes de actuar sobre el contenido del mensaje.

#### Paso 4 · Demostración guiada
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir `lib/shared/network/dio_client.dart` dentro.
```bash
flutter create ejemplo
```

Ejecuta `flutter create ejemplo_http`, crea `lib/shared/network/dio_client.dart` y `lib/features/notifications/push_service.dart`.
```bash
flutter create ejemplo_http
flutter analyze
```
**Ejecución y resultado:** corre `flutter analyze` y `flutter test`; la salida debe terminar sin errores y un token vencido debe producir estado recuperable.
**Fallo deliberado:** usa un endpoint 401 para observar el diagnóstico, registra el error y restáuralo.
**Resultado esperado:** la ejecución termina sin errores y produce la salida descrita arriba.
#### Paso 5 · Práctica guiada
Pista: observa el diagnóstico antes de corregirlo, y añade un reintento acotado (no infinito) tras renovar el token.

#### Paso 6 · Práctica independiente
Protege el deep link recibido desde una notificación push: valida su formato antes de navegar, y confirma con el backend que el usuario tiene permiso sobre el recurso antes de mostrarlo.

#### Paso 7 · Cierre
Entrega árbol, código, salida, el fallo corregido y explica el resultado. Como siguiente paso, integra la siguiente capacidad. Errores comunes: reintentos infinitos, tokens en logs y confiar en payload push. Fuentes oficiales: https://pub.dev/packages/dio y https://firebase.google.com/docs/cloud-messaging.

**Conceptos clave:** contratos, estados explícitos, fallos, seguridad y verificación.

Dio configura timeouts, cancelación, interceptores seguros y subida multipart con progreso. El refresh de token se serializa para evitar una tormenta de solicitudes. FCM/APNs despierta o informa, pero la app consulta el backend como fuente de verdad. El token push rota, se asocia a instalación y nunca autoriza operaciones. La implementación se conecta al resto de la app y se prueba con camino feliz, entrada inválida, repetición y dependencia no disponible.

**Analogía:** Es como una ventanilla con un solo turno para renovar el pase: si diez personas llegan a la vez, comparten la misma renovación en lugar de pedir diez pases nuevos.

**¿Por qué es importante?** Porque serializar la renovación del token evita una tormenta de solicitudes de refresh, y tratar el push únicamente como aviso (no como autorización) evita que un mensaje falso o repetido conceda acceso a un recurso ajeno.

**Casos de uso reales:** cinco peticiones que reciben 401 al mismo tiempo y esperan un único refresh; una push que anuncia una entrega nueva y la app consulta el backend antes de abrirla; una notificación con datos incompletos que no debe habilitar una acción.

**Diagrama:**

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

**Transferencia al proyecto integrador «Aplicación móvil del repartidor»:** Relaciona cada push con una consulta autorizada de la guía. Prueba notificación duplicada y sesión vencida: recibir un mensaje no debe conceder acceso ni confirmar una entrega por sí solo.

**Límites y decisión de uso:** Las notificaciones pueden retrasarse o no llegar; no son una base durable del estado de entrega. Al abrir la app consulta el estado autorizado y trata el push como aviso, sin confiar en sus datos para conceder permisos.
