# Módulo 20: Flutter Master: pruebas, arquitectura y release

## Aprende construyendo

Este módulo convierte `rutaflow_driver` en una app que un equipo puede cambiar y entregar con confianza. Vas a probar lógica e interfaz, fijar una pantalla con golden, recorrer un flujo de integración, medir profile, separar reglas del dominio, localizar textos y generar artefactos por plataforma. Los firmados requieren certificados y cuentas del equipo; un build local no es una publicación.

---


### Tema 1: pruebas unitarias y de widget con Flutter Test · Intermedio · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar escribirás pruebas que protegen una regla de entrega y su resultado en pantalla. Prerrequisitos: Dart, widgets, callbacks y futures. Crea un proyecto nuevo con flutter create flutter_master_lab y ejecuta flutter test para confirmar la plantilla.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
  Input[Entrada de prueba] --> Rule[Regla de dominio]
  Rule --> Widget[Widget y gesto]
  Widget --> Expect[Resultado observable]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```dart
bool canComplete({required bool hasPhoto, required bool hasSignature}) =>
    hasPhoto && hasSignature;
```

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_master_lab/domain/delivery_policy.dart';

void main() {
  test('requires photo and signature', () {
    expect(canComplete(hasPhoto: true, hasSignature: true), isTrue);
    expect(canComplete(hasPhoto: true, hasSignature: false), isFalse);
  });
}
```

```bash
flutter test test/domain/delivery_policy_test.dart test/widgets/complete_button_test.dart
```

```mermaid
flowchart LR
  Input[Entrada de prueba] --> Rule[Regla de dominio]
  Rule --> Widget[Widget y gesto]
  Widget --> Expect[Resultado observable]
```

</details>

### Tema 2: internacionalización y formatos locales · Intermedio · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar mostrarás textos y números del flujo de entrega según el idioma configurado. Prerrequisitos: MaterialApp, locale y assets. Crea un proyecto nuevo con flutter create localized_delivery_lab; configura flutter_localizations e intl desde pubspec.yaml; crea lib/l10n/app_e…

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
  Locale[Idioma y región] --> ARB[Mensajes ARB]
  ARB --> Gen[API tipada generada]
  Gen --> UI[Texto accesible en pantalla]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```yaml
flutter:
  generate: true
```

```yaml
arb-dir: lib/l10n
template-arb-file: app_en.arb
output-localization-file: app_localizations.dart
```

```bash
flutter gen-l10n
flutter analyze
```

```mermaid
flowchart LR
  Locale[Idioma y región] --> ARB[Mensajes ARB]
  ARB --> Gen[API tipada generada]
  Gen --> UI[Texto accesible en pantalla]
```

</details>

### Tema 3: golden e integración de un flujo real · Avanzado · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar revisarás un cambio visual y simularás el recorrido de confirmar parada. Prerrequisitos: widget tests, themes y navegación. Crea un proyecto nuevo con flutter create delivery_integration_lab; crea test/goldens/stop_card_test.dart y integration_test/complete_delivery_…

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
  Golden[UI estable] --> Pixel[Compara referencia]
  Integration[App en dispositivo] --> Flow[Recorre jornada]
  Pixel --> Review[Revisión humana]
  Flow --> Reporte[Resultado de extremo a extremo]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
flutter test test/goldens/stop_card_test.dart
flutter test integration_test/complete_delivery_test.dart -d <device-id>
```

```mermaid
flowchart LR
  Golden[UI estable] --> Pixel[Compara referencia]
  Integration[App en dispositivo] --> Flow[Recorre jornada]
  Pixel --> Review[Revisión humana]
  Flow --> Reporte[Resultado de extremo a extremo]
```

</details>

### Tema 4: perfilado y presupuesto de rendimiento · Avanzado · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar medirás una interacción repetible en profile y decidirás qué corregir primero. Prerrequisitos: DevTools, ListView.builder y timing UI/raster. Crea un proyecto nuevo con flutter create performance_review_lab; agrega lib/performance/route_benchmark.dart y un recorrido…

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
  Gesture[Acción repetible] --> UI[UI thread]
  Gesture --> Raster[Raster thread]
  UI --> Metrics[p90 y peor frame]
  Raster --> Metrics
  Metrics --> Fix[Corrige cuello medido]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
flutter run --profile -d <device-id>
```

```mermaid
flowchart LR
  Gesture[Acción repetible] --> UI[UI thread]
  Gesture --> Raster[Raster thread]
  UI --> Metrics[p90 y peor frame]
  Raster --> Metrics
  Metrics --> Fix[Corrige cuello medido]
```

</details>

### Tema 5: Clean Architecture y sustitución de dependencias · Avanzado · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar separarás la regla de completar entrega del cliente HTTP y la pantalla. Prerrequisitos: clases, interfaces, tests y módulos Dart. Crea un proyecto nuevo con flutter create architecture_delivery_lab; en lib/features/delivery/, crea domain, data y presentation con un c…

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
  UI[Presentation] --> UseCase[Domain: caso de uso]
  UseCase --> Contract[Domain: interfaz repo]
  Adapter[Data: Dio/SQLite] --> Contract
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```dart
abstract interface class DeliveryRepository {
  Future<void> complete(String stopId);
}
```

```dart
import 'delivery_repository.dart';

class CompleteDelivery {
  CompleteDelivery(this._repository);
  final DeliveryRepository _repository;
  Future<void> call(String stopId) {
    if (stopId.trim().isEmpty) throw ArgumentError('stopId vacío');
    return _repository.complete(stopId);
  }
}
```

```bash
flutter test test/features/delivery/domain/complete_delivery_test.dart
flutter analyze
```

```mermaid
flowchart LR
  UI[Presentation] --> UseCase[Domain: caso de uso]
  UseCase --> Contract[Domain: interfaz repo]
  Adapter[Data: Dio/SQLite] --> Contract
```

</details>

#### Caso real: la app móvil de Immich

La app de [Immich](https://github.com/immich-app/immich) está hecha en Flutter y es un buen ejemplo de capas sustituibles en una app grande:

- **Estado:** Riverpod.
- **Base local:** Drift (SQLite) en el dispositivo, para trabajar sin conexión.
- **Red:** el cliente REST **se genera** desde la especificación OpenAPI del servidor, igual que los clientes web y CLI. Si cambia la API, se regenera el cliente en vez de editarlo a mano.

La propia documentación del proyecto reconoce que el código aún no sigue del todo la arquitectura objetivo: en una app real la arquitectura se migra por partes, no de golpe.

**Ejercicio.** Clona el repo, abre `mobile/` y localiza el cliente OpenAPI generado. Propón dónde pondrías una interfaz de repositorio para poder sustituir ese cliente en las pruebas.

Fuente: [arquitectura de Immich](https://docs.immich.app/developer/architecture).

### Tema 6: builds por plataforma, firma y entrega · Avanzado · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar generarás un artefacto de desarrollo y una release adecuada a un target disponible, identificando lo que falta para distribuir. Prerrequisitos: builds Flutter, flavors y secretos/configuración. Crea un proyecto nuevo con flutter create release_delivery_lab; crea docs…

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
  Source[Commit] --> Checks[Tests y análisis]
  Checks --> Build[Build por plataforma]
  Build --> Sign[Firma protegida]
  Sign --> Review[Revisión y distribución]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
flutter test
flutter analyze
flutter build appbundle --release --flavor production -t lib/main_production.dart
```

```mermaid
flowchart LR
  Source[Commit] --> Checks[Tests y análisis]
  Checks --> Build[Build por plataforma]
  Build --> Sign[Firma protegida]
  Sign --> Review[Revisión y distribución]
```

</details>
