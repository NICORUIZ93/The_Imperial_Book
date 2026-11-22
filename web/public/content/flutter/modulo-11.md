# Módulo 11: Publicación en App Store y Google Play


## Aprende construyendo


### Tema 1: Builds de release para cada plataforma · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a generar un .aab de release real con Flutter y a comprobar, con un script, que el artefacto y la versión cumplen los requisitos mínimos de publicación. Prerrequisitos: Flutter y Android SDK instalados; para el .ipa necesitás macOS con Xcode y certificados de fir…

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a generar un .aab de release real con Flutter y a comprobar, con un script, que el artefacto y la versión cumplen los requisitos mínimos de publicación.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en builds de release para cada plataforma como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    CODE["código Dart compartido"] --> AAB["flutter build appbundle --release"]
    CODE --> IPA["flutter build ipa --release"]
    AAB --> PLAY[".aab -> Google Play Console"]
    IPA --> STORE[".ipa -> App Store Connect"]
    IPA -. "requiere macOS, Xcode y firma" .-> STORE
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Builds de release para cada plataforma se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Builds de release para cada plataforma | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses builds de release para cada plataforma por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: builds de release para cada plataforma funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Builds de release para cada plataforma existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve builds de release para cada plataforma en tu contexto?
2. ¿Cómo sabrías que builds de release para cada plataforma no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar builds de release para cada plataforma?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    CODE["código Dart compartido"] --> AAB["flutter build appbundle --release"]
    CODE --> IPA["flutter build ipa --release"]
    AAB --> PLAY[".aab -> Google Play Console"]
    IPA --> STORE[".ipa -> App Store Connect"]
    IPA -. "requiere macOS, Xcode y firma" .-> STORE
```

```bash
flutter create flujo_release
cd flujo_release
flutter build appbundle --release
```

```python
import re
import zipfile
from pathlib import Path

aab = Path("build/app/outputs/bundle/release/app-release.aab")
pubspec = Path("pubspec.yaml").read_text(encoding="utf-8")
version = re.search(r"^version:\s*(\S+)", pubspec, re.MULTILINE).group(1)
if "+" not in version:
    raise SystemExit("fallo: pubspec.yaml sin build number (usa 1.0.0+1)")
if not aab.is_file():
    raise SystemExit(f"fallo: no existe {aab}; ejecuta flutter build appbundle --release")

with zipfile.ZipFile(aab) as paquete:
    nombres = paquete.namelist()
if "BundleConfig.pb" not in nombres or "base/manifest/AndroidManifest.xml" not in nombres:
    raise SystemExit("fallo: el .aab no tiene la estructura esperada")

ios = Path("ios/Flutter/Release.xcconfig").is_file()
print(f"aab: {aab} ({aab.stat().st_size} bytes)")
print(f"version: {version}")
print("estructura: BundleConfig.pb y manifest presentes")
print(f"ios: Release.xcconfig {'presente' if ios else 'ausente'}")
```

```bash
python3 verificar_release.py
```

```text
aab: build/app/outputs/bundle/release/app-release.aab (<tamaño> bytes)
version: 1.0.0+1
estructura: BundleConfig.pb y manifest presentes
ios: Release.xcconfig presente
```

</details>

### Tema 2: Iconos y splash screens · Intermedio · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a validar, antes de generar variantes, que la imagen fuente de RutaFlow tiene la resolución mínima y que la configuración de íconos apunta a ella. Prerrequisitos: Python 3 con PyYAML y el Tema 1 de este módulo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a validar, antes de generar variantes, que la imagen fuente de RutaFlow tiene la resolución mínima y que la configuración de íconos apunta a ella.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en iconos y splash screens como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    SRC["icon_1024.png"] --> CFG["flutter_launcher_icons.yaml"]
    CFG --> GEN["generador"]
    GEN --> AND["Android: mipmap-*"]
    GEN --> IOS["iOS: AppIcon.appiconset"]
    SRC -. "si mide menos de 1024, las variantes grandes se pixelan" .-> GEN
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Iconos y splash screens se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Iconos y splash screens | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses iconos y splash screens por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: iconos y splash screens funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Iconos y splash screens existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve iconos y splash screens en tu contexto?
2. ¿Cómo sabrías que iconos y splash screens no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar iconos y splash screens?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    SRC["icon_1024.png"] --> CFG["flutter_launcher_icons.yaml"]
    CFG --> GEN["generador"]
    GEN --> AND["Android: mipmap-*"]
    GEN --> IOS["iOS: AppIcon.appiconset"]
    SRC -. "si mide menos de 1024, las variantes grandes se pixelan" .-> GEN
```

```bash
mkdir ejemplo && cd ejemplo
```

```python
import struct
import zlib
from pathlib import Path


def png(path, tamano, color=(28, 110, 164)):
    def bloque(tipo, datos):
        return struct.pack(">I", len(datos)) + tipo + datos + struct.pack(">I", zlib.crc32(tipo + datos) & 0xFFFFFFFF)

    fila = b"\x00" + bytes(color) * tamano
    contenido = b"\x89PNG\r\n\x1a\n" + bloque(b"IHDR", struct.pack(">IIBBBBB", tamano, tamano, 8, 2, 0, 0, 0)) + bloque(b"IDAT", zlib.compress(fila * tamano)) + bloque(b"IEND", b"")
    Path(path).write_bytes(contenido)


Path("assets").mkdir(exist_ok=True)
png("assets/icon_1024.png", 1024)
png("assets/icon_48.png", 48)
```

```yaml
flutter_launcher_icons:
  image_path: "assets/icon_1024.png"
  android: true
  ios: true
```

```python
import struct
from pathlib import Path

import yaml


def dimensiones(path):
    datos = path.read_bytes()
    if datos[:8] != b"\x89PNG\r\n\x1a\n":
        raise SystemExit(f"fallo: {path} no es un PNG válido")
    ancho, alto = struct.unpack(">II", datos[16:24])
    return ancho, alto


config = yaml.safe_load(Path("flutter_launcher_icons.yaml").read_text(encoding="utf-8"))["flutter_launcher_icons"]
origen = Path(config["image_path"])
ancho, alto = dimensiones(origen)
if min(ancho, alto) < 1024:
    raise SystemExit(f"fallo: {origen} mide {ancho}x{alto}; la fuente debe ser al menos 1024x1024")

print(f"fuente: {origen} ({ancho}x{alto})")
print(f"android: {config['android']}")
print(f"ios: {config['ios']}")
print("destinos esperados: mipmap-* e ios/Runner/Assets.xcassets/AppIcon.appiconset")
```

```bash
python3 generar_png.py
python3 verificar_iconos.py
```

</details>

### Tema 3: CI/CD con Codemagic o Fastlane · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar vas a configurar un pipeline de Codemagic que automatice el build de release de RutaFlow para Android, con pasos separados específicos de esa plataforma. Prerrequisitos: Tema 2 de este módulo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar vas a configurar un pipeline de Codemagic que automatice el build de release de RutaFlow para Android, con pasos separados específicos de esa plataforma.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en ci/cd con codemagic o fastlane como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart TD
    A["Push a main"] --> B["android-release workflow"]
    A --> C["ios-release workflow"]
    B --> D["flutter build appbundle"]
    C --> E["flutter build ipa"]
    D --> F[".aab artifact"]
    E --> G[".ipa artifact"]
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| CI/CD con Codemagic o Fastlane se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar CI/CD con Codemagic o Fastlane | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses ci/cd con codemagic o fastlane por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: ci/cd con codemagic o fastlane funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- CI/CD con Codemagic o Fastlane existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve ci/cd con codemagic o fastlane en tu contexto?
2. ¿Cómo sabrías que ci/cd con codemagic o fastlane no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar ci/cd con codemagic o fastlane?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```yaml
# codemagic.yaml
workflows:
  android-release:
    scripts:
      - flutter build appbundle --release
    artifacts:
      - build/**/outputs/**/*.aab
```

```yaml
workflows:
  android-release:
    scripts: [flutter build appbundle --release]
    artifacts: [build/**/outputs/**/*.aab]
  ios-release:
    scripts: [flutter build ipa --release]
    artifacts: [build/ios/**/*.ipa]
```

```mermaid
flowchart TD
    A["Push a main"] --> B["android-release workflow"]
    A --> C["ios-release workflow"]
    B --> D["flutter build appbundle"]
    C --> E["flutter build ipa"]
    D --> F[".aab artifact"]
    E --> G[".ipa artifact"]
```

```yaml
# codemagic.yaml
workflows:
  android-release:
    scripts:
      - flutter build appbundle --release
    artifacts:
      - build/**/outputs/**/*.aab
```

```bash
flutter create demo_flutter
cd demo_flutter
flutter run
```

</details>

### Tema 4: Entornos y flavors con --dart-define-from-file · Avanzado · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar podrás compilar la misma app para desarrollo, QA y producción inyectando configuración con --dart-define-from-file, leerla con constantes de compilación y fallar rápido si falta un valor. Prerrequisitos: Temas 1 a 3 de este módulo.

#### ► LA IDEA EN UNA FRASE
**Al finalizar podrás compilar la misma app para desarrollo, QA y producción inyectando configuración con --dart-define-from-file, leerla con constantes de compilación y fallar rápido si falta un valor.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
Piensa en entornos y flavors con --dart-define-from-file como una herramienta de taller: útil cuando conoces su propósito y sus límites.
**Dónde se rompe la analogía:** en software, los efectos dependen del contexto, la escala y los trade-offs.

#### ► CÓMO FUNCIONA
```mermaid
flowchart LR
    D[config/dev.json] --> C[flutter build o test]
    PR[config/prod.json] --> C
    C --> B[binario con constantes]
    B --> E[Entorno.apiUrl]
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Entornos y flavors con --dart-define-from-file se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Entornos y flavors con --dart-define-from-file | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses entornos y flavors con --dart-define-from-file por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: entornos y flavors con --dart-define-from-file funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Entornos y flavors con --dart-define-from-file existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve entornos y flavors con --dart-define-from-file en tu contexto?
2. ¿Cómo sabrías que entornos y flavors con --dart-define-from-file no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar entornos y flavors con --dart-define-from-file?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart LR
    D[config/dev.json] --> C[flutter build o test]
    PR[config/prod.json] --> C
    C --> B[binario con constantes]
    B --> E[Entorno.apiUrl]
```

```bash
mkdir entornos && cd entornos
flutter create repartidor_entornos
cd repartidor_entornos
mkdir -p config
```

```json
{
  "ENTORNO": "dev",
  "API_URL": "https://api-dev.rutaflow.co",
  "LOGS_DETALLADOS": "true"
}
```

```json
{
  "ENTORNO": "prod",
  "API_URL": "https://api.rutaflow.co",
  "LOGS_DETALLADOS": "false"
}
```

```dart
// lib/entorno.dart — la configuración llega en tiempo de COMPILACIÓN con --dart-define
class Entorno {
  static const nombre = String.fromEnvironment('ENTORNO', defaultValue: 'desconocido');
  static const apiUrl = String.fromEnvironment('API_URL');
  static const logsDetallados = bool.fromEnvironment('LOGS_DETALLADOS');

  static void validar() {
    if (apiUrl.isEmpty) {
      throw StateError('API_URL no definido: ejecuta con --dart-define-from-file=config/<entorno>.json');
    }
  }
}
```

```dart
// test/entorno_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:repartidor_entornos/entorno.dart';

void main() {
  test('usa la configuración del entorno dev', () {
    expect(Entorno.nombre, 'dev');
    expect(Entorno.apiUrl, 'https://api-dev.rutaflow.co');
    expect(Entorno.logsDetallados, isTrue);
    expect(Entorno.validar, returnsNormally);
  });
}
```

</details>

### Tema 5: Flutter para web y escritorio: compilar, adaptar la interfaz y elegir el renderizador · Avanzado · 45 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Usa Flutter 3.24 o superior. Habilita las plataformas: flutter config --enable-web --enable-macos-desktop (o --enable-windows-desktop / --enable-linux-desktop) y agrega las carpetas al proyecto con flutter create --platforms=web,macos ..

#### ► LA IDEA EN UNA FRASE
**Usa Flutter 3.24 o superior.**

#### ► POR QUÉ EXISTE ESTO
Resuelve un problema real de diseño o implementación y evita decisiones a ciegas.

#### ► LA ANALOGÍA
**Conceptos clave:** `kIsWeb`, `defaultTargetPlatform`, WebAssembly (`--wasm`), renderizador, `LayoutBuilder`, hover, atajos (`Shortcuts`, `Actions`), plugin no disponible por plataforma.

- **Web:** `flutter build web` genera archivos estáticos. Con `--wasm` usa WebAssembly y el renderizador skwasm (más rápido) en navegadores que lo soportan, con respaldo automático a JavaScript.
- **Escritorio:** `flutter build macos`, `windows` o `linux` genera una app nativa. Debes compilar en ese sistema operativo.

Para adaptar la interfaz:

1. **Diseño:** `LayoutBuilder` elige una o varias columnas según el ancho, no según la plataforma.
2. **Entrada:** `MouseRegion` para hover, `Shortcuts` y `Actions` para atajos de teclado.
3. **Capacidades:** algunos plugins no existen en web (por ejemplo, `dart:io`, cámara nativa). Usa `kIsWeb` o importaciones condicionales para esas partes.

**Analogía:** la misma receta se sirve en un restaurante (escritorio), en un local de comida rápida (web) y para llevar (móvil): el plato es el mismo, pero cambian el empaque y los cubiertos. La analogía falla en que algunos ingredientes (plugins) solo existen en una de las cocinas.

**Límite de uso:** Flutter web no es la mejor opción para sitios de contenido que necesitan SEO; úsalo para aplicaciones. El primer arranque web descarga el motor: mide el tamaño y la carga.

```mermaid
flowchart TB
    C["Código Dart común"] --> M["Android / iOS"]
    C --> W["web: build web --wasm"]
    C --> D["escritorio: build macos / windows / linux"]
    L["LayoutBuilder: ancho"] --> U1["1 columna < 700 px"]
    L --> U2["lista + detalle >= 700 px"]
```

**Dónde se rompe la analogía:** el modelo simplifica la realidad; en producción influyen escala, fallos, costo y contexto.

#### ► CÓMO FUNCIONA
```mermaid
flowchart TB
    C["Código Dart común"] --> M["Android / iOS"]
    C --> W["web: build web --wasm"]
    C --> D["escritorio: build macos / windows / linux"]
    L["LayoutBuilder: ancho"] --> U1["1 columna < 700 px"]
    L --> U2["lista + detalle >= 700 px"]
```

#### ► LO QUE PUEDE SALIR MAL
| Síntoma | Causa probable | Arreglo |
|---|---|---|
| Flutter para web y escritorio: compilar, adaptar la interfaz y elegir el renderizador se aplica pero el resultado no mejora | Se usó sin medir el problema real | Mide antes y compara contra la alternativa simple |
| Aparece complejidad inesperada | Se adoptó la técnica sin comprender sus trade-offs | Vuelve a la sección de trade-offs y reduce el alcance |
| Falla en un caso límite | Se asumió un contexto que no se cumple | Prueba el caso límite y documenta cuándo NO usarlo |

#### ► TRADE-OFFS
| Opción | Cuándo usarla | Cuándo NO usarla |
|---|---|---|
| Usar Flutter para web y escritorio: compilar, adaptar la interfaz y elegir el renderizador | Cuando el problema coincide con su propósito y el beneficio es observable | Cuando agrega complejidad sin resolver un problema real |
| Alternativa más simple | Cuando el contexto es pequeño, estable o fácil de razonar | Cuando ya demostró no escalar o no cumplir el requisito |
| Postergar la decisión | Cuando falta evidencia del problema | Cuando el costo de esperar es mayor que el costo de probar |

#### ► CUÁNDO NO USAR ESTO
No uses flutter para web y escritorio: compilar, adaptar la interfaz y elegir el renderizador por defecto. Aplícalo cuando el problema lo justifique y puedas verificar el beneficio; si una alternativa más simple resuelve igual, prefiérela.

#### ► DE VUELTA A LA ANALOGÍA
Volviendo a la analogía: flutter para web y escritorio: compilar, adaptar la interfaz y elegir el renderizador funciona como el modelo inicial, pero recuerda dónde se rompe: en producción importan la evidencia, la escala y el costo de equivocarte.

#### ► LO QUE DEBES RECORDAR
- Flutter para web y escritorio: compilar, adaptar la interfaz y elegir el renderizador existe para resolver un problema específico.
- Mide antes de adoptar complejidad.
- Conoce el caso donde NO usarlo.
- Verifica con evidencia observable.

#### ► PREGUNTAS PARA PENSAR
1. ¿Qué problema concreto resuelve flutter para web y escritorio: compilar, adaptar la interfaz y elegir el renderizador en tu contexto?
2. ¿Cómo sabrías que flutter para web y escritorio: compilar, adaptar la interfaz y elegir el renderizador no está funcionando bien?
3. ¿Qué alternativa más simple considerarías antes de usar flutter para web y escritorio: compilar, adaptar la interfaz y elegir el renderizador?

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```mermaid
flowchart TB
    C["Código Dart común"] --> M["Android / iOS"]
    C --> W["web: build web --wasm"]
    C --> D["escritorio: build macos / windows / linux"]
    L["LayoutBuilder: ancho"] --> U1["1 columna < 700 px"]
    L --> U2["lista + detalle >= 700 px"]
```

```dart
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class RefrescarIntent extends Intent { const RefrescarIntent(); }

class Tablero extends StatelessWidget {
  const Tablero({super.key, required this.alRefrescar});
  final VoidCallback alRefrescar;

  @override
  Widget build(BuildContext context) {
    return Shortcuts( // Ctrl+R / Cmd+R refresca en escritorio y web
      shortcuts: {
        const SingleActivator(LogicalKeyboardKey.keyR, control: true): const RefrescarIntent(),
        const SingleActivator(LogicalKeyboardKey.keyR, meta: true): const RefrescarIntent(),
      },
      child: Actions(
        actions: {RefrescarIntent: CallbackAction<RefrescarIntent>(onInvoke: (_) { alRefrescar(); return null; })},
        child: Focus(
          autofocus: true,
          child: LayoutBuilder(builder: (context, limites) {
            final ancho = limites.maxWidth >= 700; // por ancho, no por plataforma
            return Scaffold(
              appBar: AppBar(title: Text(kIsWeb ? 'Panel (web)' : 'Panel')),
              body: ancho
                  ? const Row(children: [Expanded(child: _Lista()), VerticalDivider(), Expanded(flex: 2, child: _Detalle())])
                  : const _Lista(),
            );
          }),
        ),
      ),
    );
  }
}

class _Lista extends StatelessWidget {
  const _Lista();
  @override
  Widget build(BuildContext context) => ListView(children: [
        for (final c in ['ENV-41', 'ENV-42'])
          MouseRegion(cursor: SystemMouseCursors.click, child: ListTile(title: Text(c), onTap: () {})),
      ]);
}

class _Detalle extends StatelessWidget {
  const _Detalle();
  @override
  Widget build(BuildContext context) => const Center(child: Text('Selecciona un envío'));
}
```

```bash
flutter run -d chrome
flutter build web --wasm
flutter build macos   # en una Mac
```

```text
flutter build web --wasm termina con «✓ Built build/web».
En Chrome a pantalla completa: lista a la izquierda y detalle a la derecha; al estrechar la ventana por debajo de 700 px, una sola columna.
Ctrl+R (o Cmd+R en macOS) llama alRefrescar.
```

</details>
