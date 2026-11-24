# Módulo 16: Flutter FFI: conectar Dart con código nativo

## Aprende construyendo

Este módulo crea una pequeña biblioteca nativa para calcular el costo de una ruta y la llama desde Dart. Trabajarás primero con C porque Dart FFI enlaza directamente con interfaces C; luego revisarás Rust detrás de una ABI C. **FFI no está disponible en Flutter Web**: allí corresponde usar interoperabilidad con JavaScript/Wasm. Desde Flutter 3.38, el punto de partida recomendado para un paquete FFI nuevo es `flutter create --template=package_ffi` con build hooks. Usa la plantilla antigua `plugin_ffi` solo si necesitas Flutter Plugin API, enlazado estático u otro caso específico que documenta Flutter.

---


### Tema 1: reconocer cuándo usar FFI y crear el paquete · Avanzado · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar tendrás una biblioteca native_add que Dart puede importar y una primera función nativa comprobable. Prerrequisitos: Flutter, Dart (flutter doctor, dart --version) y un compilador C para tu plataforma. Ejemplo independiente en proyecto nuevo: crea el paquete desde una…

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```bash
flutter create --template=package_ffi native_add
cd native_add
flutter test
```

```dart
import 'package:test/test.dart';
import 'package:native_add/native_add.dart';

void main() {
  test('la suma nativa devuelve 42', () {
    expect(sum(24, 18), 42);
  });
}
```

```bash
dart pub get
dart test
```

</details>

### Tema 2: generar bindings C seguros para Dart · Avanzado · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar llamarás una función C con argumentos y retorno tipados mediante bindings generados. Prerrequisitos: Tema 1, Dart FFI y un header C. Ejemplo independiente: en una carpeta vacía ejecuta flutter create --template=package_ffi ffi_bindings_lab; trabaja en src/route_cost.…

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```c
// src/route_cost.h
#include <stdint.h>
int32_t route_zone(int32_t kilometers);
```

```c
#include "route_cost.h"

int32_t route_zone(int32_t kilometers) {
  return kilometers <= 10 ? 0 : 1;
}
```

```bash
dart run ffigen --config ffigen.yaml
dart format lib test
dart test
```

</details>

### Tema 3: conectar una biblioteca Rust mediante una ABI C · Avanzado · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar tendrás una función Rust exportada con ABI C y una nota de build para empaquetarla como código nativo. Prerrequisitos: Rust (rustc --version, cargo --version), Flutter y ABI C. Ejemplo independiente: crea ffi_rust_lab con flutter create --template=package_ffi ffi_rus…

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```rust
#[unsafe(no_mangle)]
pub extern "C" fn route_zone(kilometers: i32) -> i32 {
    if kilometers <= 10 { 0 } else { 1 }
}
```

```bash
cargo test
cargo build --release
```

</details>

#### Caso real: AppFlowy, Flutter con núcleo en Rust

[AppFlowy](https://github.com/appflowy-io/appflowy) es una alternativa open source a Notion. La interfaz está hecha en Flutter y toda la lógica de negocio vive en Rust: el mismo reparto que acabas de construir, llevado a una app completa.

**Cómo hablan los dos lados.** En vez de exponer muchas funciones sueltas, AppFlowy pasa mensajes asíncronos serializados con Protobuf:

- **Eventos (Flutter → Rust):** la interfaz emite un evento con un payload Protobuf; Rust tiene un handler por evento, deserializa el payload y puede descartar peticiones inválidas sin ejecutar nada.
- **Notificaciones (Rust → Flutter):** mensajes de una sola vía para avisar cambios de estado; la interfaz los escucha y deserializa.
- El backend define todos los eventos y **genera** la interfaz FFI, así que Dart nunca escribe bindings a mano.

```mermaid
flowchart LR
  UI[Flutter · widgets y BLoC] -->|evento + payload Protobuf| FFI[capa FFI generada]
  FFI --> CORE[Núcleo Rust · handlers por evento]
  CORE -->|notificación Protobuf| FFI
  FFI --> UI
```

**Por qué importa.** Con un solo punto de entrada (evento + bytes) la ABI C se mantiene mínima y estable, y la propiedad de memoria queda clara: cada lado libera lo que reservó (Tema 6).

**Ejercicio.** Compara este diseño con tu biblioteca del tema: ¿cuántas funciones `extern "C"` expones tú? ¿Cómo cambiaría si todo pasara por una sola función `dispatch(bytes)`?

Fuente: [comunicación entre procesos en AppFlowy](https://docs.appflowy.io/docs/documentation/software-contributions/architecture/frontend/inter-process-communication).

### Tema 4: compilar y empaquetar bibliotecas por plataforma · Avanzado · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás identificar qué target produce tu build y qué biblioteca se empaqueta en ella. Prerrequisitos: build hooks, un target Flutter y su toolchain nativo. Ejemplo independiente: crea ffi_target_lab con flutter create --template=package_ffi ffi_target_lab en una carp…

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```text
src/ + header -> build hook/toolchain -> biblioteca del target -> asset del paquete -> binding Dart
```

```bash
dart test
cd example
flutter build apk --debug
```

</details>

### Tema 5: medir rendimiento y evitar bloquear la interfaz · Avanzado · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar compararás una operación Dart con una nativa, medirás el tiempo y decidirás si FFI aporta valor. Prerrequisitos: Dart, una función FFI equivalente y Flutter DevTools. Ejemplo independiente: crea ffi_benchmark_lab con flutter create --template=package_ffi ffi_benchmar…

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
  D[Dart prepara entradas] --> C[Cruza FFI]
  C --> N[Algoritmo nativo]
  N --> R[Dart recibe resultado]
  D -->|medir con mismas entradas| B[Versión Dart de referencia]
  R --> V[Comparar resultado y tiempo]
  B --> V
  V -->|mejora real y dentro del frame| U[Conservar FFI]
  V -->|ganancia pequeña o bloqueo| S[Preferir Dart o isolate]
```

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación

```bash
flutter run --profile
```

</details>

### Tema 6: propiedad de memoria, liberación y errores · Experto · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar envolverás un buffer nativo con liberación explícita y comprobarás que cada asignación tiene un camino de cierre. Prerrequisitos: tipos de puntero de dart:ffi y el paquete ffi. Ejemplo independiente: crea ffi_memory_lab con flutter create --template=package_ffi ffi_m…

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```dart
import 'dart:ffi';
import 'package:ffi/ffi.dart';

final input = calloc<Int32>(3);
try {
  input[0] = 2;
  input[1] = 5;
  input[2] = 7;
  // Llama al binding con el puntero y cantidad 3.
} finally {
  calloc.free(input);
}
```

```bash
dart test
```

</details>
