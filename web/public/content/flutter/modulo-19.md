# Módulo 19: Flutter para entregas: mapa, conexión y trabajo offline

## Aprende construyendo

Construirás una app de conductor desde una lista vacía hasta una entrega sincronizada. El foco es operar con señal inestable y ubicaciones cambiantes, no repetir el mapa del módulo 14. Trabaja en el proyecto `rutaflow_driver`; no uses credenciales de producción.

---

### Tema 1: estado de la jornada con Riverpod

#### Paso 1 · Objetivo y preparación
Al finalizar modelarás la jornada del conductor sin mezclar datos, llamadas HTTP y widgets. **Prerrequisitos:** Dart, widgets y futures. Crea un proyecto nuevo: `flutter create rutaflow_driver`; agrega `flutter_riverpod` con `flutter pub add flutter_riverpod`.

#### Paso 2 · Contexto y caso real
La jornada tiene carga, paradas, confirmaciones y errores. Si cada widget guarda copias de esos datos, una pantalla puede mostrar “entregada” y otra “pendiente”. Usa una fuente de estado por feature y expón solo las acciones que la interfaz necesita.

#### ¿Por qué es importante?
La persona que reparte necesita una sola respuesta visible sobre la siguiente parada. El estado explícito también permite probar la lógica sin abrir el mapa o llamar al servidor.

#### Paso 3 · Teoría, modelo mental y analogía
Un provider es una toma accesible para varias pantallas; el notifier es el tablero que decide cuándo cambian los datos. Riverpod permite inyectar implementaciones de prueba con `ProviderScope`. No conviertas cada valor en un provider: separa lo que realmente tiene vida o dependientes.

#### Paso 4 · Demostración guiada
Crea `lib/features/shift/shift_provider.dart`:

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

class Stop {
  const Stop(this.id, this.address, {this.done = false});
  final String id;
  final String address;
  final bool done;
}

class ShiftNotifier extends Notifier<List<Stop>> {
  @override
  List<Stop> build() => const [];

  void load(List<Stop> stops) => state = List.unmodifiable(stops);

  void complete(String id) {
    state = [
      for (final stop in state)
        if (stop.id == id) Stop(stop.id, stop.address, done: true) else stop,
    ];
  }
}

final shiftProvider = NotifierProvider<ShiftNotifier, List<Stop>>(ShiftNotifier.new);
```

Envuelve `MaterialApp` con `ProviderScope`. En una pantalla usa `ref.watch(shiftProvider)` para dibujar y `ref.read(shiftProvider.notifier).complete(id)` para confirmar.

#### Paso 5 · Práctica guiada
Prueba el notifier con `ProviderContainer`: carga dos paradas, completa una y verifica que la otra siga abierta. **Pista:** comprueba por `id`, no por posición de lista.

#### Paso 6 · Práctica independiente
Agrega estados de carga y error sin guardar objetos de UI dentro del modelo. Diseña cómo reintentar una parada si el servidor responde `503`.

#### Paso 7 · Cierre y evidencia
Guarda `lib/features/shift/shift_provider.dart` y `test/features/shift/shift_provider_test.dart`. El siguiente tema usará esa jornada en un mapa.

**Prueba de diagnóstico.** Cambia deliberadamente el `id` que se marca; la prueba debe mostrar que ninguna parada cambió. **Resultado esperado:** al restaurar el id correcto, una sola parada pasa a `done: true`.

```bash
flutter test test/features/shift/shift_provider_test.dart
```

**Errores comunes:** mutar una lista compartida y leer el provider con `watch` dentro de un callback. Diagrama: `ProviderScope -> shiftProvider -> lista -> widgets`. Fuente oficial: [Riverpod](https://riverpod.dev/docs/introduction/getting_started).

**Proyecto propio:** `rutaflow_driver`. **Cuándo elegir un notifier:** cuando varias vistas observan el mismo estado y hay acciones con reglas. **Fallos a vigilar:** guardar `BuildContext` en el estado o modificar la lista en sitio. Si completas un id desconocido, provoca deliberadamente un fallo en el test y especifica la respuesta esperada. Evidencia de aprendizaje: entrega el test del Paso 5 y la lista antes/después.

**Resultado esperado:** cambia una parada sin alterar las demás.

```mermaid
flowchart LR
  UI[Widgets] --> Provider[shiftProvider]
  Provider --> State[Lista inmutable de paradas]
```

---

### Tema 2: mapa y permiso de ubicación

#### Paso 1 · Objetivo y preparación
Al finalizar mostrarás la posición del conductor con permiso gradual y un estado comprensible si se niega. **Prerrequisitos:** Flutter y geolocalización. En un proyecto nuevo `flutter create route_map_lab`, añade `google_maps_flutter` y `geolocator` con `flutter pub add google_maps_flutter geolocator`.

#### Paso 2 · Contexto y caso real
El mapa permite orientar al conductor, pero una ubicación precisa solo se solicita cuando la función la necesita. El usuario puede conceder ubicación aproximada, denegar o apagar servicios; la app debe conservar una alternativa para ver la parada en texto.

#### ¿Por qué es importante?
Pedir permisos al iniciar, sin explicar el uso, reduce confianza. Mostrar una pantalla vacía al recibir `denied` deja al conductor sin información necesaria para seguir.

#### Paso 3 · Teoría, modelo mental y analogía
El plugin obtiene una posición; Google Maps la dibuja. Son dos responsabilidades distintas. Una posición es `{latitud, longitud, precisión, hora}`: compara precisión y antigüedad antes de mover el marcador. La llave de Maps se restringe por plataforma y aplicación; no se reutiliza una llave maestra del servidor.

#### Paso 4 · Demostración guiada
Crea `lib/features/map/location_reader.dart`:

```dart
import 'package:geolocator/geolocator.dart';

Future<Position> readPosition() async {
  if (!await Geolocator.isLocationServiceEnabled()) {
    throw StateError('Activa los servicios de ubicación');
  }
  var permission = await Geolocator.checkPermission();
  if (permission == LocationPermission.denied) {
    permission = await Geolocator.requestPermission();
  }
  if (permission == LocationPermission.denied ||
      permission == LocationPermission.deniedForever) {
    throw StateError('No hay permiso de ubicación');
  }
  return Geolocator.getCurrentPosition();
}
```

Agrega permisos de Android/iOS siguiendo la guía del plugin. Crea `lib/features/map/route_map.dart` con `GoogleMap`, `initialCameraPosition` y un `Marker` solo después de recibir la posición. En consola observa el prompt; con permiso negado muestra dirección escrita.

#### Paso 5 · Práctica guiada
Prueba `readPosition` con el permiso concedido, denegado y con el servicio apagado. Simula las tres condiciones en emulador. **Pista:** no repitas el prompt si el sistema indica `deniedForever`; ofrece un botón hacia ajustes.

#### Paso 6 · Práctica independiente
Registra la llave de Maps con restricciones Android/iOS, límites de cuota y alertas de facturación. Añade atribución de Google Maps en la sección “Acerca de” o avisos legales.

#### Paso 7 · Cierre y evidencia
Entrega ambos archivos y una captura de cada estado (posición, permiso denegado). El siguiente tema recibe posiciones del gateway en vivo.

**Prueba de diagnóstico.** Provoca deliberadamente `deniedForever`; el flujo debe conservar la dirección de la parada y ofrecer ajustes, no quedar bloqueado. **Resultado esperado:** el mapa se muestra solo cuando hay una posición válida.

```bash
flutter run
```

**Errores comunes:** pedir permiso preciso sin justificarlo, olvidar declarar permiso nativo y exponer la API key sin restricciones. Diagrama: `solicitud -> permiso -> lectura -> validación -> marcador`. Fuentes: [Google Maps para Flutter](https://developers.google.com/maps/flutter-package/overview), [Geolocator](https://pub.dev/packages/geolocator).

**Proyecto propio:** `route_map_lab`. **Cuándo pedir precisión:** cuando la tarea depende de pocos metros y la persona recibió una explicación. **Fallos a vigilar:** tratar `deniedForever` como permiso temporal. Evidencia de aprendizaje: entrega el flujo de permiso y captura de fallback textual.

**Resultado esperado:** el mapa tiene marcador con posición; sin permiso muestra la dirección y ayuda contextual.

```mermaid
flowchart LR
  Permission[Permiso gradual] --> Location[Geolocator]
  Location --> Check[Valida edad y precisión]
  Check --> Marker[Marcador o fallback]
```

Fuente oficial: guía de [configuración Google Maps Flutter](https://developers.google.com/maps/flutter-package/config).

---

### Tema 3: posiciones en tiempo real con Socket.IO

#### Paso 1 · Objetivo y preparación
Al finalizar conectarás una app Flutter a eventos de posición y distinguirás reconexión de una nueva sesión. **Prerrequisitos:** streams y HTTP. Crea `live_route_lab` con `flutter create live_route_lab` y añade `socket_io_client`.

#### Paso 2 · Contexto y caso real
El gateway puede publicar varias veces la misma posición si el teléfono recupera señal. Un evento antiguo que llega después de uno nuevo no debe hacer retroceder al marcador. La clave de parada y la marca de tiempo ayudan a descartar mensajes repetidos o atrasados.

#### ¿Por qué es importante?
El mapa representa hechos en el tiempo. Sin orden e idempotencia, una demora de red puede mostrar al conductor en el punto equivocado.

#### Paso 3 · Teoría, modelo mental y analogía
Socket.IO reintenta la conexión, no garantiza que tu lógica de negocio haya aplicado cada evento una sola vez. Comprueba `eventId`/`sequence`, valida coordenadas y conserva la hora del servidor. Una reconexión debe volver a escuchar el canal autorizado y limpiar listeners anteriores.

#### Paso 4 · Demostración guiada
Crea `lib/features/live/route_socket.dart`:

```dart
import 'package:socket_io_client/socket_io_client.dart' as socket_io;

class RouteSocket {
  RouteSocket(String baseUrl, String token)
      : socket = socket_io.io(baseUrl, socket_io.OptionBuilder()
            .setTransports(['websocket'])
            .disableAutoConnect()
            .setAuth({'token': token})
            .build());

  final socket_io.Socket socket;
  void connect(void Function(Map<String, dynamic>) onPosition) {
    socket.on('route:position', (data) {
      if (data is Map) onPosition(Map<String, dynamic>.from(data));
    });
    socket.connect();
  }
  void close() => socket..off('route:position')..disconnect();
}
```

Conecta a un servidor Socket.IO de desarrollo accesible desde el emulador. Ejecuta la app y emite un fixture `{eventId, sequence, lat, lng, sentAt}`; observa el evento en el callback.

#### Paso 5 · Práctica guiada
En `lib/features/live/position_order.dart`, acepta solo `sequence > lastSequence` y coordenadas dentro de latitud/longitud válidas. Simula mensaje repetido y atrasado; ninguno debe reemplazar la posición actual. **Pista:** compara enteros monotónicos, no timestamps del reloj del teléfono.

#### Paso 6 · Práctica independiente
Desconecta el servidor durante el recorrido, reconecta y confirma que no se registró dos veces el listener. Añade cierre de sesión que desconecte el socket y borre el token de memoria.

#### Paso 7 · Cierre y evidencia
Guarda el cliente, filtro de orden y log con secuencia aceptada/descartada. El siguiente tema anima solo las posiciones aceptadas.

**Prueba de diagnóstico.** Provoca deliberadamente dos eventos con el mismo `sequence`; el segundo se debe descartar. **Resultado esperado:** el marcador conserva la ubicación más reciente y el log cuenta un duplicado.

```bash
flutter test test/features/live/position_order_test.dart
```

**Errores comunes:** llamar `connect()` varias veces o asumir entrega exactly-once. Diagrama: `socket -> validar forma -> deduplicar -> actualizar estado`. Fuente: [socket_io_client](https://pub.dev/packages/socket_io_client).

**Proyecto propio:** `live_route_lab`, con gateway de desarrollo configurado.
**Ejemplo independiente:** crea `live_route_lab` con `flutter create live_route_lab` y configura un gateway Socket.IO local. **Cuándo aceptar posición:** si formato, secuencia, timestamp y coordenadas son válidos. **Fallos a vigilar:** callback doble tras reconexión y recibir un payload que no sea Map. Evidencia de aprendizaje: entrega el test con el duplicado descartado.

**Resultado esperado:** secuencia mayor actualiza; duplicada o menor no cambia el estado.

```mermaid
sequenceDiagram
  Gateway->>Flutter: route:position(sequence)
  Flutter->>Validator: forma y rango
  Validator->>State: solo secuencia nueva
```

Fuente oficial del paquete: [Socket.IO client Dart](https://pub.dev/packages/socket_io_client).

---

### Tema 4: animar el marcador sin saltos

#### Paso 1 · Objetivo y preparación
Al finalizar moverás un marcador entre puntos de manera legible y sin dibujar datos obsoletos. **Prerrequisitos:** `AnimationController`, `Tween` y coordenadas. En `live_route_lab`, crea `lib/features/map/position_tween.dart`.

#### Paso 2 · Contexto y caso real
El GPS emite a intervalos irregulares. Cambiar directamente de A a B puede saltar; animar cada evento sin cancelar el anterior puede dejar un marcador retrasado varios segundos.

#### ¿Por qué es importante?
Una animación debe ayudar a anticipar movimiento. Si acumula retraso o hace que el vehículo atraviese edificios, la suavidad engaña sobre la ubicación real.

#### Paso 3 · Teoría, modelo mental y analogía
Interpolar es dibujar puntos intermedios entre dos mediciones recientes. Limita duración, cancela la animación anterior al recibir un punto más nuevo y conserva el dato real separado del punto visual. No inventes una ruta curva si solo tienes dos coordenadas.

#### Paso 4 · Demostración guiada
Crea `lib/features/map/position_tween.dart`:

```dart
import 'package:flutter/animation.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class PositionTween extends Tween<LatLng> {
  PositionTween({required LatLng begin, required LatLng end})
      : super(begin: begin, end: end);

  @override
  LatLng lerp(double t) => LatLng(
        begin!.latitude + (end!.latitude - begin!.latitude) * t,
        begin!.longitude + (end!.longitude - begin!.longitude) * t,
      );
}
```

Al recibir una posición nueva, crea un controller corto, actualiza el marker en `AnimatedBuilder` y llama `dispose` al retirar el widget. Como ejemplo independiente, crea el proyecto nuevo `position_tween_lab` con `flutter create position_tween_lab`; ejecuta el mismo fixture de dos puntos en emulador.

#### Paso 5 · Práctica guiada
Comprueba que una posición más reciente cancela el controller activo. **Pista:** `CurvedAnimation` cambia la sensación, pero no debe ocultar datos viejos; compara el marker con el punto real.

#### Paso 6 · Práctica independiente
Prueba un punto idéntico, un salto mayor al umbral y una pausa de señal. Para una pausa larga, mueve al punto nuevo sin animación prolongada y muestra la hora de actualización.

#### Paso 7 · Cierre y evidencia
Entrega el tween y un video/captura del mismo recorrido. El siguiente tema guardará las confirmaciones mientras no haya conexión.

**Prueba de diagnóstico.** Provoca deliberadamente una duración de cinco segundos; la animación debe verse retrasada. Reduce el intervalo y comprueba que el marker alcanza el último dato.

```bash
flutter test test/features/map/position_tween_test.dart
```

**Errores comunes:** iniciar un controller por evento sin cancelar el anterior y tratar ubicación interpolada como GPS real. Diagrama: `punto real A -> interpolación visual -> punto real B`. Fuente: [Flutter animations](https://docs.flutter.dev/ui/animations).

**Proyecto propio:** `position_tween_lab`. **Cuándo animar:** si la nueva posición llega pronto y no se está mostrando una ubicación obsoleta. **Fallos a vigilar:** no liberar el `AnimationController` o seguir animando tras una actualización nueva. Evidencia de aprendizaje: entrega una prueba con fixture de dos puntos.

**Resultado esperado:** el marcador termina en el último dato aceptado; la animación solo cambia el dibujo intermedio.

```mermaid
flowchart LR
  FixA[Posición A: GPS] --> Visual[Interpolación temporal]
  FixB[Posición B: GPS] --> Visual
  Visual --> Marker[Marcador actual]
```

Fuente oficial: [animaciones Flutter](https://docs.flutter.dev/ui/animations).

---

### Tema 5: confirmaciones offline y sincronización

#### Paso 1 · Objetivo y preparación
Al finalizar registrarás una confirmación sin red y la sincronizarás sin duplicarla. **Prerrequisitos:** Future, JSON e idempotencia. Crea `lib/features/sync/outbox.dart` y un test con almacenamiento temporal.

#### Paso 2 · Contexto y caso real
El conductor confirma una entrega en un sótano y pierde señal. La app debe conservar la evidencia, avisar “pendiente de enviar” y volver a intentar al recuperar conectividad. Un reintento puede llegar al servidor más de una vez.

#### ¿Por qué es importante?
Si el botón borra la confirmación local al fallar el servidor, se pierde trabajo. Si reenvía sin una clave estable, una entrega puede contarse dos veces.

#### Paso 3 · Teoría, modelo mental y analogía
La outbox local es una bandeja de salida: guarda un comando con `operationId`, contenido mínimo y estado. El servidor usa ese mismo id para idempotencia. En conflicto de estado, no sobrescribas en silencio; conserva respuesta y permite resolver según regla del dominio.

#### Paso 4 · Demostración guiada
Crea `lib/features/sync/delivery_command.dart`:

```dart
class DeliveryCommand {
  const DeliveryCommand({required this.operationId, required this.stopId});
  final String operationId;
  final String stopId;
  Map<String, Object?> toJson() => {
        'operationId': operationId,
        'stopId': stopId,
        'type': 'delivery.confirmed',
      };
}
```

Para practicar en una copia independiente crea `offline_delivery_lab` con `flutter create offline_delivery_lab`; implementa el repositorio local con SQLite/Drift o la base ya usada en la app: inserta la operación antes de llamar a red, marca `sent` solo en respuesta confirmada y elimina únicamente según la política de retención. Ejecuta `flutter test test/features/sync/outbox_test.dart`.

#### Paso 5 · Práctica guiada
Simula timeout, reinicio de app y dos intentos con el mismo `operationId`. **Pista:** la identidad del comando nace una vez al presionar confirmar y se reutiliza durante todos los reintentos.

#### Paso 6 · Práctica independiente
Diseña un conflicto cuando el servidor ya canceló la parada. Muestra “requiere revisión” y conserva la respuesta del servidor sin marcar la entrega como completada.

#### Paso 7 · Cierre y evidencia
Entrega la tabla outbox antes/después, con id estable y resultado de los reintentos. El siguiente tema enviará evidencia y avisará sobre nuevas tareas.

**Prueba de diagnóstico.** Provoca deliberadamente dos envíos con el mismo `operationId`; el backend de prueba debe responder el mismo resultado lógico y solo guardar una confirmación. **Resultado esperado:** offline conserva una operación pendiente.

```bash
flutter test test/features/sync/outbox_test.dart
```

**Errores comunes:** generar un nuevo id en cada reintento y descartar un registro al recibir timeout ambiguo. Diagrama: `guardar -> intentar -> confirmado / pendiente / conflicto`. Fuente: [Flutter persistence cookbook](https://docs.flutter.dev/cookbook/persistence).

**Proyecto propio:** `offline_delivery_lab`. **Cuándo borrar la outbox:** cuando el servidor confirmó la acción y la política de retención permite limpiarla. **Fallos a vigilar:** tratar timeout como rechazo y crear otra operación con un id distinto. Evidencia de aprendizaje: entrega la fila antes y después de dos intentos.

**Resultado esperado:** tras timeout conserva `pending`; tras respuesta confirmada cambia a `sent`.

```mermaid
stateDiagram-v2
  [*] --> Pending: guarda primero
  Pending --> Sent: recibo server
  Pending --> Conflict: estado incompatible
```

Fuente oficial: [persistencia Flutter](https://docs.flutter.dev/cookbook/persistence).

---

### Tema 6: carga de evidencia con Dio y notificaciones

#### Paso 1 · Objetivo y preparación
Al finalizar subirás una evidencia con progreso y recibirás una asignación sin mezclar los dos flujos. **Prerrequisitos:** HTTP, permisos de archivo y push. Crea un proyecto nuevo de práctica con `flutter create evidence_delivery_lab`; añade `dio`, `image_picker` y `firebase_messaging` según las plataformas que vas a compilar.

#### Paso 2 · Contexto y caso real
Una foto de entrega puede ser grande y la red puede cortarse. El conductor necesita saber si se envía, se reintenta o requiere volver a elegir el archivo. Una notificación push puede avisar una asignación; el backend sigue siendo quien autoriza y guarda su estado.

#### ¿Por qué es importante?
La evidencia respalda la operación y puede incluir datos sensibles. Controlar tamaño, progreso, cancelación y acceso evita subir más información de la necesaria.

#### Paso 3 · Teoría, modelo mental y analogía
Dio transporta la petición; el servidor valida la sesión, extensión, MIME, tamaño y permisos antes de almacenar. FCM entrega una señal, no una fuente confiable del estado de la entrega. Al abrir una notificación, consulta el backend.

#### Paso 4 · Demostración guiada
Crea `lib/features/evidence/evidence_uploader.dart`:

```dart
import 'package:dio/dio.dart';

class EvidenceUploader {
  EvidenceUploader(this._dio);
  final Dio _dio;

  Future<void> upload({required String path, required String token,
      required void Function(double progress) onProgress}) async {
    await _dio.post<void>(
      '/api/deliveries/evidence',
      data: FormData.fromMap({'file': await MultipartFile.fromFile(path)}),
      options: Options(headers: {'Authorization': 'Bearer $token'}),
      onSendProgress: (sent, total) {
        if (total > 0) onProgress(sent / total);
      },
    );
  }
}
```

Usa un fixture local y backend de desarrollo. Ejecuta `flutter test test/features/evidence/evidence_uploader_test.dart` con Dio adapter fake. Para FCM inicializa Firebase, registra handler de foreground y tap; al abrir consulta `/api/deliveries/{id}` antes de navegar.

#### Paso 5 · Práctica guiada
Prueba archivo cancelado, `413` por tamaño, `401` por sesión vencida y pérdida de red. **Pista:** reintenta el upload solo si el backend usa una clave idempotente y no duplica archivos.

#### Paso 6 · Práctica independiente
Añade una política de retención local para fotos fallidas y documenta cómo borrar una evidencia enviada. En push muestra una notificación con datos mínimos, nunca dirección completa o token de acceso.

#### Paso 7 · Cierre y evidencia
Entrega `evidence_uploader.dart`, el test fake, progreso visible y flujo de notificación probado en dispositivo de desarrollo. Reporta por separado si el proyecto FCM o la credencial no estuvo disponible. El siguiente módulo practica testing e integración del curso completo.

**Prueba de diagnóstico.** Provoca deliberadamente una respuesta `401`; la app debe pedir iniciar sesión y no reintentar automáticamente con el mismo token. **Resultado esperado:** se observa progreso y el backend de prueba recibe una sola evidencia.

```bash
flutter test test/features/evidence/evidence_uploader_test.dart
```

**Errores comunes:** subir la foto completa sin límite y confiar en payload push para actualizar el dominio. Diagrama: `archivo -> validación local -> API autenticada -> recibo`. Fuentes: [Dio](https://pub.dev/packages/dio), [Firebase Messaging Flutter](https://firebase.google.com/docs/cloud-messaging/flutter/client).

**Proyecto propio:** `evidence_delivery_lab`. **Cuándo reintentar:** si la API define una operación idempotente; un `401` requiere renovar sesión y `413` requiere reducir el archivo. Evidencia de aprendizaje: entrega el test fake, progreso y estado de respuesta.

**Resultado esperado:** una carga produce un recibo; la notificación solo abre una consulta autenticada para obtener el estado vigente. Fuente oficial Firebase: [cliente FCM Flutter](https://firebase.google.com/docs/cloud-messaging/flutter/client).

```mermaid
flowchart LR
  Picker[Selecciona evidencia] --> Dio[Dio: progreso]
  Dio --> API[API: auth y límites]
  FCM[Push: aviso mínimo] --> API
```

---

## Referencias oficiales consultadas

- [Riverpod](https://riverpod.dev/docs/introduction/getting_started)
- [Google Maps for Flutter](https://developers.google.com/maps/flutter-package/overview) y [Geolocator](https://pub.dev/packages/geolocator)
- [socket_io_client](https://pub.dev/packages/socket_io_client)
- [Flutter animations](https://docs.flutter.dev/ui/animations)
- [Flutter persistence cookbook](https://docs.flutter.dev/cookbook/persistence)
- [Dio](https://pub.dev/packages/dio) y [Firebase Messaging Flutter](https://firebase.google.com/docs/cloud-messaging/flutter/client)
