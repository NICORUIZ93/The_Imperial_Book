# Módulo 4: Aplicación Flutter del conductor: GPS, batería y offline


## Aprende construyendo


### Tema 1: Arquitectura Flutter por capacidades · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás construir y verificar Tema 1: Arquitectura Flutter por capacidades dentro de RutaFlow, empezando desde una carpeta vacía y explicando qué decisión técnica resuelve. Conocimiento previo: terminal, Git y Dart y Flutter (track Flutter).

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás construir y verificar Tema 1: Arquitectura Flutter por capacidades dentro de RutaFlow, empezando desde una carpeta vacía y explicando qué decisión técnica resuelve.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en arquitectura flutter por capacidades como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
  P["ListaEnvios (presentation)"] -->|usa contrato| R[["EnvioRepository (interfaz)"]]
  R --> DOM["Envio (dominio)"]
  R --> HTTP["EnvioRepositoryHttp (datos: dio)"]
  P -.->|acoplamiento indebido| DIO["Cliente HTTP creado dentro del widget"]
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Arquitectura Flutter por capacidades se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Arquitectura Flutter por capacidades | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses arquitectura flutter por capacidades por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: arquitectura flutter por capacidades funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Arquitectura Flutter por capacidades existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve arquitectura flutter por capacidades en tu contexto?
2. ¿Cómo sabrías que arquitectura flutter por capacidades no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar arquitectura flutter por capacidades?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
  P["ListaEnvios (presentation)"] -->|usa contrato| R[["EnvioRepository (interfaz)"]]
  R --> DOM["Envio (dominio)"]
  R --> HTTP["EnvioRepositoryHttp (datos: dio)"]
  P -.->|acoplamiento indebido| DIO["Cliente HTTP creado dentro del widget"]
```

```bash
mkdir -p rutaflow-labs && cd rutaflow-labs
flutter create --empty tema_1_arquitectura
cd tema_1_arquitectura
mkdir -p lib/features/entrega/domain lib/features/entrega/data lib/features/entrega/presentation
```

```dart
// lib/features/entrega/domain/envio.dart
class Envio {
  final String guia;
  final String estado;
  const Envio({required this.guia, required this.estado});
}

// lib/features/entrega/domain/envio_repository.dart
import 'envio.dart';

abstract class EnvioRepository {
  Future<List<Envio>> obtenerPendientes();
}
```

```dart
// lib/features/entrega/data/envio_repository_http.dart
import '../domain/envio.dart';
import '../domain/envio_repository.dart';

class EnvioRepositoryHttp implements EnvioRepository {
  final Future<List<Map<String, dynamic>>> Function() _get;
  EnvioRepositoryHttp(this._get);

  @override
  Future<List<Envio>> obtenerPendientes() async {
    final filas = await _get();
    return filas.map((f) => Envio(guia: f['guia'] as String, estado: f['estado'] as String)).toList();
  }
}

// lib/features/entrega/presentation/lista_envios.dart
import '../domain/envio_repository.dart';

class ListaEnvios {
  final EnvioRepository repositorio;
  ListaEnvios(this.repositorio);

  Future<int> contarPendientes() async {
    final envios = await repositorio.obtenerPendientes();
    return envios.length;
  }
}
```

Crea el archivo `verificar.dart`:

```dart
import 'lib/features/entrega/domain/envio_repository.dart';
import 'lib/features/entrega/data/envio_repository_http.dart';
import 'lib/features/entrega/presentation/lista_envios.dart';

Future<void> main() async {
  final EnvioRepository repo = EnvioRepositoryHttp(() async => [
        {'guia': 'RF-4471', 'estado': 'en_transito'},
        {'guia': 'RF-5002', 'estado': 'asignado'},
      ]);
  final pantalla = ListaEnvios(repo);
  final total = await pantalla.contarPendientes();
  print('OK pendientes=$total');
}
```

```bash
dart run verificar.dart
```

```dart
// lib/features/entrega/presentation/lista_envios.dart (versión acoplada)
import '../data/envio_repository_http.dart';

class ListaEnvios {
  Future<int> contarPendientes() async {
    // Salta el dominio y la interfaz: la pantalla ahora conoce HTTP directamente.
    final filas = await EnvioRepositoryHttp(() async => [
      {'guia': 'RF-4471', 'estado': 'en_transito'},
    ]).obtenerPendientes();
    return filas.length;
  }
}
```

</details>

### Tema 2: GPS, permisos y batería · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás construir y verificar Tema 2: GPS, permisos y batería dentro de RutaFlow, empezando desde una carpeta vacía y explicando qué decisión técnica resuelve. Conocimiento previo: terminal, Git y Dart y Flutter (track Flutter).

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás construir y verificar Tema 2: GPS, permisos y batería dentro de RutaFlow, empezando desde una carpeta vacía y explicando qué decisión técnica resuelve.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en gps, permisos y batería como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
  A["checkPermission()"] --> B{"¿Permiso?"}
  B -->|"whileInUse / always"| C["getPositionStream()"]
  B -->|"deniedForever"| D["openAppSettings() + aviso al conductor"]
  B -->|"denied"| E["requestPermission()"]
  C --> F{"¿Batería baja?"}
  F -->|"sí"| G["Intervalo largo: muestreo reducido"]
  F -->|"no"| H["Intervalo corto: ruta activa"]
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| GPS, permisos y batería se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar GPS, permisos y batería | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses gps, permisos y batería por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: gps, permisos y batería funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- GPS, permisos y batería existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve gps, permisos y batería en tu contexto?
2. ¿Cómo sabrías que gps, permisos y batería no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar gps, permisos y batería?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
  A["checkPermission()"] --> B{"¿Permiso?"}
  B -->|"whileInUse / always"| C["getPositionStream()"]
  B -->|"deniedForever"| D["openAppSettings() + aviso al conductor"]
  B -->|"denied"| E["requestPermission()"]
  C --> F{"¿Batería baja?"}
  F -->|"sí"| G["Intervalo largo: muestreo reducido"]
  F -->|"no"| H["Intervalo corto: ruta activa"]
```

```bash
mkdir -p rutaflow-labs && cd rutaflow-labs
flutter create tema_2_gps
cd tema_2_gps
mkdir -p lib/features/entrega/data
flutter pub add geolocator geolocator_android battery_plus
```

```dart
// lib/features/entrega/data/politica_ubicacion.dart
import 'package:geolocator/geolocator.dart';
import 'package:geolocator_android/geolocator_android.dart';
import 'package:battery_plus/battery_plus.dart';

class PermisoUbicacionDenegadoPermanente implements Exception {
  @override
  String toString() => 'Permiso de ubicación denegado permanentemente: abrí Ajustes para habilitarlo.';
}

class PoliticaUbicacion {
  final Battery _battery;
  PoliticaUbicacion(this._battery);

  /// Pide el permiso mínimo necesario y maneja explícitamente deniedForever.
  Future<LocationPermission> asegurarPermiso() async {
    var permiso = await Geolocator.checkPermission();
    if (permiso == LocationPermission.denied) {
      permiso = await Geolocator.requestPermission();
    }
    if (permiso == LocationPermission.deniedForever) {
      // No hay diálogo posible: el sistema ya decidió. Hay que guiar al conductor a Ajustes.
      throw PermisoUbicacionDenegadoPermanente();
    }
    return permiso;
  }

  /// Ajusta el intervalo de muestreo según la carga de batería.
  /// En Android el intervalo se pide con intervalDuration; timeLimit NO sirve:
  /// es un tiempo máximo de espera y lanza TimeoutException si no llega una posición.
  Future<AndroidSettings> configurarMuestreo() async {
    final nivel = await _battery.batteryLevel;
    final intervalo = nivel < 20 ? const Duration(seconds: 30) : const Duration(seconds: 5);
    return AndroidSettings(accuracy: LocationAccuracy.high, intervalDuration: intervalo);
  }
}
```

```dart
// lib/main.dart
import 'package:battery_plus/battery_plus.dart';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';

import 'features/entrega/data/politica_ubicacion.dart';

void main() => runApp(const MaterialApp(home: PantallaUbicacion()));

class PantallaUbicacion extends StatefulWidget {
  const PantallaUbicacion({super.key});

  @override
  State<PantallaUbicacion> createState() => _PantallaUbicacionState();
}

class _PantallaUbicacionState extends State<PantallaUbicacion> {
  final _politica = PoliticaUbicacion(Battery());
  String _estado = 'Toca el botón para iniciar la jornada';

  Future<void> _iniciar() async {
    try {
      final permiso = await _politica.asegurarPermiso();
      final ajustes = await _politica.configurarMuestreo();
      debugPrint('permiso=$permiso intervalo=${ajustes.intervalDuration}');
      Geolocator.getPositionStream(locationSettings: ajustes).listen((posicion) {
        setState(() => _estado = 'Posición ${posicion.latitude}, ${posicion.longitude}');
      });
    } on PermisoUbicacionDenegadoPermanente catch (error) {
      setState(() => _estado = error.toString());
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        body: Center(child: Text(_estado)),
        floatingActionButton: FloatingActionButton(onPressed: _iniciar, child: const Icon(Icons.play_arrow)),
      );
}
```

```bash
flutter run -d <tu-dispositivo-o-emulador>
```

```dart
Future<void> asegurarPermisoIngenuo() async {
  await Geolocator.requestPermission(); // nunca revisa qué devolvió
}
```

</details>

### Tema 3: Offline-first y prueba de entrega · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás construir y verificar Tema 3: Offline-first y prueba de entrega dentro de RutaFlow, empezando desde una carpeta vacía y explicando qué decisión técnica resuelve. Conocimiento previo: terminal, Git y Dart y Flutter (track Flutter).

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás construir y verificar Tema 3: Offline-first y prueba de entrega dentro de RutaFlow, empezando desde una carpeta vacía y explicando qué decisión técnica resuelve.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en offline-first y prueba de entrega como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
  A["confirmarEntrega(RF-4471)"] --> B[("sqflite: confirmaciones_pendientes<br/>sincronizado=0")]
  B --> C["sincronizar()"]
  C --> D{"¿sincronizado = 0?"}
  D -->|"sí"| E["POST /envios/RF-4471/confirmar"]
  E --> F["UPDATE sincronizado = 1"]
  D -->|"no"| G["Omitida: ya sincronizada"]
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Offline-first y prueba de entrega se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Offline-first y prueba de entrega | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses offline-first y prueba de entrega por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: offline-first y prueba de entrega funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Offline-first y prueba de entrega existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve offline-first y prueba de entrega en tu contexto?
2. ¿Cómo sabrías que offline-first y prueba de entrega no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar offline-first y prueba de entrega?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
  A["confirmarEntrega(RF-4471)"] --> B[("sqflite: confirmaciones_pendientes<br/>sincronizado=0")]
  B --> C["sincronizar()"]
  C --> D{"¿sincronizado = 0?"}
  D -->|"sí"| E["POST /envios/RF-4471/confirmar"]
  E --> F["UPDATE sincronizado = 1"]
  D -->|"no"| G["Omitida: ya sincronizada"]
```

```bash
mkdir -p rutaflow-labs && cd rutaflow-labs
flutter create --empty tema_3_offline
cd tema_3_offline
mkdir -p lib/features/entrega/data test
flutter pub add sqflite
flutter pub add sqflite_common_ffi --dev
```

```dart
// lib/features/entrega/data/outbox_entregas.dart
import 'package:sqflite/sqflite.dart';

class OutboxEntregas {
  final Database db;
  OutboxEntregas(this.db);

  static Future<void> crearTabla(Database db) async {
    await db.execute('''
      CREATE TABLE confirmaciones_pendientes (
        id TEXT PRIMARY KEY,
        guia TEXT NOT NULL,
        creado_en TEXT NOT NULL,
        sincronizado INTEGER NOT NULL DEFAULT 0
      )
    ''');
  }

  Future<void> confirmarEntrega(String idConfirmacion, String guia) async {
    await db.insert('confirmaciones_pendientes', {
      'id': idConfirmacion,
      'guia': guia,
      'creado_en': DateTime.now().toIso8601String(),
      'sincronizado': 0,
    });
  }

  /// Solo reenvía las filas que todavía no se confirmaron con el servidor.
  Future<void> sincronizar(Future<void> Function(String guia) enviarAlServidor) async {
    final pendientes = await db.query('confirmaciones_pendientes', where: 'sincronizado = 0');
    for (final fila in pendientes) {
      await enviarAlServidor(fila['guia'] as String);
      await db.update(
        'confirmaciones_pendientes',
        {'sincronizado': 1},
        where: 'id = ?',
        whereArgs: [fila['id']],
      );
    }
  }
}
```

```dart
// test/outbox_entregas_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';
import 'package:tema_3_offline/features/entrega/data/outbox_entregas.dart';

void main() {
  test('una reconexión no reenvía una confirmación ya sincronizada', () async {
    sqfliteFfiInit();
    final db = await databaseFactoryFfi.openDatabase(inMemoryDatabasePath);
    await OutboxEntregas.crearTabla(db);
    final outbox = OutboxEntregas(db);

    await outbox.confirmarEntrega('c-1', 'RF-4471');

    var llamadas = 0;
    Future<void> enviar(String guia) async {
      llamadas++;
      print('POST confirmar $guia');
    }

    await outbox.sincronizar(enviar);
    await outbox.sincronizar(enviar); // reconexión que dispara sincronizar() de nuevo

    print('OK llamadas=$llamadas');
    expect(llamadas, 1);
    await db.close();
  });
}
```

```bash
flutter test test/outbox_entregas_test.dart
```

```dart
Future<void> sincronizar(Future<void> Function(String guia) enviarAlServidor) async {
  final todas = await db.query('confirmaciones_pendientes'); // sin filtro: reenvía todo
  for (final fila in todas) {
    await enviarAlServidor(fila['guia'] as String);
    await db.update('confirmaciones_pendientes', {'sincronizado': 1}, where: 'id = ?', whereArgs: [fila['id']]);
  }
}
```

</details>
