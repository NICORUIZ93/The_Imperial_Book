# Módulo 11: Publicación en App Store y Google Play


## Aprende construyendo

### Tema 1: Builds de release para cada plataforma

#### Paso 1 · Objetivo y preparación
Al finalizar vas a generar el build de release de RutaFlow para Google Play (`.aab`) y para App Store (`.ipa`) desde la misma base de código Dart. Prerrequisitos: Módulo 10 completo.

#### Paso 2 · Contexto y caso real
RutaFlow está lista para subir a ambas tiendas — nadie generó todavía los artefactos específicos que cada tienda exige, y cada una tiene su propio formato y requisitos de firma.

#### Paso 3 · Teoría, modelo mental y analogía
`flutter build appbundle --release` genera el `.aab` requerido por Google Play; `flutter build ipa --release` genera el `.ipa` para App Store, requiriendo específicamente macOS con Xcode.

#### Paso 4 · Demostración guiada desde cero
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir `src/ejemplo.dart` dentro.
```bash
flutter create ejemplo
```

**Crea** el archivo `src/ejemplo.dart` y pega en él el código mostrado a continuación; guárdalo antes de ejecutarlo.

```bash
flutter build appbundle --release   # → .aab para Google Play Console
flutter build ipa --release          # → .ipa para App Store Connect (requiere macOS/Xcode)
```
Resultado esperado: el primer comando genera un `.aab` optimizado y sin herramientas de depuración, listo para Play Console; el segundo, corrido en macOS, genera un `.ipa` firmado con los certificados del Módulo 11 del track de iOS, listo para App Store Connect.

#### Paso 5 · Práctica guiada
Pista: intentá correr `flutter build ipa --release` desde una máquina Linux o Windows — ese es el fallo deliberado: el comando falla inmediatamente, porque el toolchain de compilación para binarios iOS solo existe en macOS, sin importar que el resto del código Dart sea completamente compartido.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 moviendo ese paso a un runner de macOS, y confirmá que el mismo código Dart compartido produce ambos artefactos sin ninguna modificación, solo cambiando el entorno de ejecución del build.

#### Paso 7 · Cierre y evidencia
Entregá ambos builds generados del Paso 4, el fallo por entorno incorrecto del Paso 5, y la corrección con el entorno apropiado del Paso 6; explicá por qué "una sola base de código" en Flutter no elimina la necesidad de un entorno específico para el empaquetado final de cada plataforma. Siguiente paso: estudia cómo generar íconos y splash screens para ambas tiendas. Errores comunes: intentar generar el build de iOS sin macOS/Xcode disponible, publicar accidentalmente un build en modo debug en vez de `--release`, y no verificar que la versión/build number cumple los requisitos de cada tienda. Fuentes oficiales: https://docs.flutter.dev/deployment/android y https://docs.flutter.dev/deployment/ios.
**¿Por qué es importante?** Aunque el código Dart es compartido, cada tienda requiere un artefacto de build específico y un entorno de compilación distinto.
**Evidencia de aprendizaje:** entrega ambos builds generados, fallo por entorno incorrecto detectado y corrección con el entorno apropiado.
**Conceptos clave:** una sola base de código, pero artefactos de build específicos y separados por tienda.

```bash
flutter build appbundle --release
```

`flutter build appbundle` genera el mismo formato `.aab` (App Bundle) requerido por Google Play Console, exactamente el mismo artefacto y las mismas ventajas ya estudiadas en el track de Android nativo (Módulo 11 de ese track): Play genera automáticamente APKs optimizados por dispositivo a partir de ese único bundle. `--release` es la bandera que compila en modo optimizado y sin herramientas de depuración, el modo requerido para publicar en las tiendas (a diferencia del modo debug, usado solo durante el desarrollo).

```bash
flutter build ipa --release
```

`flutter build ipa` requiere específicamente un entorno macOS con Xcode instalado (dado que, igual que en el desarrollo nativo de iOS, el toolchain de compilación para producir binarios iOS solo está disponible en macOS), y genera un archivo `.ipa` firmado con los certificados y provisioning profiles configurados (Módulo 11 del track de iOS), listo para subir a App Store Connect exactamente por el mismo proceso que una app iOS nativa.

Esta necesidad de generar dos artefactos de build completamente distintos y específicos de cada plataforma, a pesar de compartir una única base de código Dart, ilustra un matiz importante sobre el alcance real de "una sola base de código" en Flutter: la unificación ocurre a nivel del código fuente de la app (Dart, widgets, lógica de negocio), pero el proceso final de empaquetado, firma y distribución sigue requiriendo pasos específicos e inevitablemente distintos para cada tienda de aplicaciones, dado que Google Play y App Store tienen requisitos de formato, firma y proceso de revisión completamente independientes entre sí.

**Analogía:** generar builds separados para Android e iOS desde una única base de código Dart es como imprimir el mismo documento maestro en dos formatos de papel completamente distintos requeridos por dos oficinas de archivo diferentes, cada una con sus propias especificaciones de encuadernado y presentación, aunque el contenido intelectual del documento en sí sea exactamente el mismo en ambos casos.

**¿Por qué es importante?** Aunque el código Dart es compartido, cada tienda requiere un artefacto de build específico y un proceso de firma completamente distinto, reflejando que la unificación de Flutter ocurre a nivel de código fuente, no a nivel del proceso de publicación en sí.

**Prueba en terminal:**

```bash
flutter build appbundle --release   # → .aab para Google Play Console
flutter build ipa --release          # → .ipa para App Store Connect (requiere macOS/Xcode)
```

**Diagrama: una base, dos artefactos**

```mermaid
flowchart TD
    A["Código Dart compartido"] --> B["flutter build appbundle --release"]
    A --> C["flutter build ipa --release\n(requiere macOS/Xcode)"]
    B --> D[".aab → Google Play Console"]
    C --> E[".ipa → App Store Connect"]
```

En el proyecto integrador RutaFlow, estos builds se configuran a partir de `pubspec.yaml` en la raíz del proyecto Flutter. Práctica: generá ambos artefactos para tu proyecto propio y confirmá que cada uno abre correctamente en la consola de su tienda correspondiente.

### Tema 2: Iconos y splash screens

#### Paso 1 · Objetivo y preparación
Al finalizar vas a generar automáticamente todas las variantes de ícono y splash screen de RutaFlow para Android e iOS a partir de una única imagen fuente. Prerrequisitos: Tema 1 de este módulo.

#### Paso 2 · Contexto y caso real
Android necesita el ícono de RutaFlow en múltiples resoluciones para distintas densidades de pantalla, e iOS necesita sus propios formatos específicos — producir manualmente cada variante sería tedioso y propenso a inconsistencias.

#### Paso 3 · Teoría, modelo mental y analogía
`flutter_launcher_icons` y `flutter_native_splash` toman una única imagen fuente declarada en `pubspec.yaml` y generan automáticamente todas las variantes requeridas por cada plataforma.

#### Paso 4 · Demostración guiada desde cero
**Ejemplo independiente (desde cero):** este tema también se puede reproducir en una **carpeta vacía**, como **proyecto nuevo**, sin arrastrar estado de otros temas: crea el andamiaje y vuelve a escribir `src/ejemplo.dart` dentro.
```bash
flutter create ejemplo
```

**Crea** el archivo `src/ejemplo.dart` y pega en él el código mostrado a continuación; guárdalo antes de ejecutarlo.

```yaml
# pubspec.yaml
flutter_launcher_icons:
  image_path: "assets/icon_rutaflow.png"
flutter_native_splash:
  image: "assets/splash_rutaflow.png"
```
```bash
dart run flutter_launcher_icons
dart run flutter_native_splash:create
```
Resultado esperado: a partir de una única imagen `icon_rutaflow.png`, el primer comando genera automáticamente todas las resoluciones de ícono para Android e iOS, visibles correctamente en ambos sistemas sin ningún trabajo manual de redimensionado.

#### Paso 5 · Práctica guiada
Pista: reemplazá `icon_rutaflow.png` por una imagen de baja resolución (48x48 píxeles) "porque total se genera automáticamente" — ese es el fallo deliberado: las variantes generadas para pantallas de alta densidad se ven pixeladas y borrosas, porque la herramienta solo puede reducir una imagen de alta resolución, nunca mejorar una que ya partía siendo demasiado pequeña.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 reemplazando la imagen fuente por una de al menos 1024x1024 píxeles, y volví a correr `flutter_launcher_icons`, confirmando que ahora las variantes de alta densidad se ven nítidas.

#### Paso 7 · Cierre y evidencia
Entregá la generación automática del Paso 4, el ícono pixelado por baja resolución fuente del Paso 5, y la corrección con una imagen de alta resolución del Paso 6; explicá por qué la calidad de todas las variantes generadas depende de la calidad de la única imagen fuente, nunca puede mejorarse después del hecho. Siguiente paso: estudia CI/CD para automatizar todo este proceso. Errores comunes: usar una imagen fuente de baja resolución asumiendo que la generación automática "arregla" eso, producir manualmente cada variante por plataforma, y olvidar regenerar íconos/splash tras cambiar el diseño de marca. Fuentes oficiales: https://pub.dev/packages/flutter_launcher_icons y https://pub.dev/packages/flutter_native_splash.
**¿Por qué es importante?** Generar automáticamente las variantes de ícono y splash screen a partir de una única imagen fuente evita el trabajo manual tedioso de producir cada variante por separado.
**Evidencia de aprendizaje:** entrega generación automática funcionando, ícono pixelado detectado y corrección con imagen de alta resolución.
**Conceptos clave:** configuración declarativa que genera automáticamente los múltiples formatos requeridos por cada plataforma.

```yaml
# pubspec.yaml
flutter_launcher_icons:
  image_path: "assets/icon.png"
flutter_native_splash:
  image: "assets/splash.png"
```

```bash
dart run flutter_launcher_icons
dart run flutter_native_splash:create
```

`dart` es el comando que ejecuta el SDK de Dart; `dart run <paquete>` busca ese paquete en las dependencias del proyecto y corre su ejecutable (aquí, el generador de íconos o de splash screen).

Los paquetes `flutter_launcher_icons` y `flutter_native_splash` toman una única imagen fuente declarada en `pubspec.yaml` y generan automáticamente todas las variantes de tamaño y formato específicas que cada plataforma requiere (múltiples resoluciones de ícono para distintas densidades de pantalla en Android, los formatos específicos de Apple para iOS), evitando que el desarrollador tenga que producir y mantener manualmente cada una de esas variantes por separado, un proceso considerablemente más tedioso y propenso a inconsistencias si se hiciera manualmente para cada plataforma y cada resolución requerida.

**Analogía:** estos paquetes son como un servicio de impresión que recibe un único diseño maestro y produce automáticamente todas las variantes de tamaño y formato requeridas por distintos tipos de soporte (tarjetas, carteles, pancartas), sin que el diseñador original tenga que adaptar manualmente el diseño a cada formato de salida específico.

**¿Por qué es importante?** Generar automáticamente las variantes de ícono y splash screen requeridas por cada plataforma a partir de una única imagen fuente evita el trabajo manual tedioso y propenso a inconsistencias de producir cada variante por separado.

**Prueba en terminal:**

```bash
dart run flutter_launcher_icons        # genera todas las variantes de ícono por plataforma
dart run flutter_native_splash:create  # genera el splash screen nativo por plataforma
```

**Diagrama: una imagen fuente, N variantes**

```mermaid
flowchart LR
    A["icon_rutaflow.png\n(1024x1024)"] --> B["flutter_launcher_icons"]
    B --> C["Android: mdpi, hdpi, xhdpi..."]
    B --> D["iOS: AppIcon.appiconset"]
```

En el proyecto integrador RutaFlow, la configuración vive en `pubspec.yaml`. Antes de generar, confirmá las dependencias con:

```bash
flutter pub get
```

Límite de la decisión: no conviene regenerar íconos y splash en cada build de CI si la imagen fuente no cambió — ese paso es costoso y determinístico; conviene ejecutarlo una vez localmente y commitear los artefactos generados, no como paso repetido del pipeline.

### Tema 3: CI/CD con Codemagic o Fastlane

#### Paso 1 · Objetivo y preparación
Al finalizar vas a configurar un pipeline de Codemagic que automatice el build de release de RutaFlow para Android, con pasos separados específicos de esa plataforma. Prerrequisitos: Tema 2 de este módulo.

#### Paso 2 · Contexto y caso real
Cada vez que el equipo de RutaFlow quiere publicar una nueva versión, alguien corre manualmente los comandos de build, firma y subida — un proceso repetitivo y propenso a que alguien olvide un paso.

#### Paso 3 · Teoría, modelo mental y analogía
Codemagic/Fastlane automatizan la secuencia completa de build, firma y distribución; una sola base de código no elimina la necesidad de pasos separados por plataforma dentro de ese mismo pipeline.

#### Paso 4 · Demostración guiada desde cero
```yaml
# codemagic.yaml
workflows:
  android-release:
    scripts:
      - flutter build appbundle --release
    artifacts:
      - build/**/outputs/**/*.aab
```

**Ejecuta el ejemplo** (crea un proyecto Flutter desde cero, pega el widget en `lib/main.dart` y arráncalo en un emulador o dispositivo):

```bash
flutter create demo_flutter
cd demo_flutter
flutter run
```
Para las pruebas de widget: `flutter test`.

Resultado esperado: cada vez que se dispara este workflow, Codemagic ejecuta automáticamente el build de Android y produce el `.aab` como artefacto descargable, sin que nadie corra el comando manualmente.

#### Paso 5 · Práctica guiada
Pista: agregá un segundo workflow `ios-release` que reutilice literalmente el mismo script `flutter build appbundle --release` del workflow de Android — ese es el fallo deliberado: ese comando genera un `.aab` (formato de Android), completamente inútil para App Store Connect, que necesita específicamente un `.ipa` generado en un entorno macOS.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 definiendo el workflow `ios-release` con su propio script correcto (`flutter build ipa --release`) y su propio artefacto `.ipa`, confirmando que cada workflow produce el artefacto específico que su tienda realmente necesita.

#### Paso 7 · Cierre y evidencia
Entregá el workflow de Android del Paso 4, el workflow de iOS incorrecto por copiar el de Android en el Paso 5, y la corrección con el script apropiado del Paso 6; explicá por qué "compartir código" en Flutter no significa que los pasos de publicación también puedan compartirse sin modificación entre plataformas. Siguiente paso: cerrá el módulo integrando build, assets y CI/CD en un release real de RutaFlow. Errores comunes: copiar el mismo script de build entre workflows de plataformas distintas, no verificar que cada workflow produce el artefacto correcto para su tienda, y asumir que un solo pipeline elimina toda la especificidad de plataforma. Fuentes oficiales: https://docs.codemagic.io/flutter-configuration/flutter-projects/ y https://docs.flutter.dev/deployment/cd.
**¿Por qué es importante?** Automatizar ambos builds con un solo pipeline ahorra esfuerzo manual repetido, pero no elimina la necesidad de pasos específicos y separados por plataforma.
**Evidencia de aprendizaje:** entrega workflow de Android, error por script copiado entre plataformas detectado y corrección con script apropiado.
**Conceptos clave:** pipeline automatizado con pasos específicos por plataforma, a pesar del código compartido.

```yaml
# codemagic.yaml
workflows:
  android-release:
    scripts:
      - flutter build appbundle --release
    artifacts:
      - build/**/outputs/**/*.aab
```

Codemagic (un servicio de CI/CD especializado específicamente en apps Flutter) o Fastlane (la misma herramienta de automatización de release estudiada en Kotlin Multiplatform, Módulo 10 de ese track) automatizan la secuencia completa de build, firma y distribución para ambas plataformas, reduciendo el proceso manual de publicación a un pipeline configurado una única vez y ejecutado consistentemente en cada release; sin embargo, una sola base de código Flutter no elimina la necesidad de pasos **separados** dentro de ese mismo pipeline para Android e iOS (firma con credenciales distintas, builds con herramientas distintas, subida a portales de distribución distintos), dado que la unificación de Flutter opera exclusivamente a nivel del código fuente de la app, no a nivel de las herramientas y procesos de publicación de cada tienda, que permanecen inevitablemente específicos de cada plataforma.

Este matiz es importante para calibrar expectativas realistas sobre "una sola base de código": Flutter reduce drásticamente el esfuerzo de desarrollo de la lógica y UI de la app compartida entre plataformas, pero no elimina por completo el trabajo de configuración específico de publicación que cada tienda de aplicaciones exige de forma independiente entre sí.

**Analogía:** un pipeline de CI/CD para Flutter es como una línea de producción centralizada que fabrica el mismo producto base para dos mercados distintos, pero que igual necesita estaciones de empaquetado y etiquetado separadas y específicas para cada mercado de destino, dado que cada uno exige su propio formato de presentación final e inevitablemente distinto.

**¿Por qué es importante?** Automatizar ambos builds con un solo pipeline ahorra el esfuerzo manual repetido de cada release, pero no elimina la necesidad de pasos específicos y separados por plataforma dentro de ese pipeline, dado que cada tienda exige su propio proceso de firma y distribución independiente.

**Configuración del ejemplo:**

```yaml
workflows:
  android-release:
    scripts: [flutter build appbundle --release]
    artifacts: [build/**/outputs/**/*.aab]
  ios-release:
    scripts: [flutter build ipa --release]
    artifacts: [build/ios/**/*.ipa]
```

**Diagrama: pipeline con pasos separados por plataforma**

```mermaid
flowchart TD
    A["Push a main"] --> B["android-release workflow"]
    A --> C["ios-release workflow"]
    B --> D["flutter build appbundle"]
    C --> E["flutter build ipa"]
    D --> F[".aab artifact"]
    E --> G[".ipa artifact"]
```

En el proyecto integrador RutaFlow, el pipeline vive en `codemagic.yaml` en la raíz del repositorio. Límite de la decisión: no conviene automatizar con CI/CD un proyecto que todavía no publicó ninguna versión manual exitosa al menos una vez — primero conviene validar el proceso completo manualmente, y recién automatizarlo cuando el flujo manual ya es confiable y repetible.

---


## Laboratorio práctico

**Objetivo del laboratorio:** generar builds de release para Android e iOS listos para subir a sus tiendas.

**Requisitos previos:** Módulo 10 completado, macOS con Xcode para el build de iOS.

| Paso | Acción | Comando | Explicación |
|---|---|---|---|
| 1 | Generar el build de release para Android | `flutter build appbundle --release` | `.aab` para Play Console |
| 2 | Generar el build de release para iOS | `flutter build ipa --release` | Requiere macOS/Xcode |
| 3 | Configurar ícono y splash screen | Ver Tema 2 | `flutter_launcher_icons`/`flutter_native_splash` |
| 4 | Configurar un pipeline básico | Ver Tema 3 | Codemagic o Fastlane |

**Verificación:** el laboratorio se considera exitoso si ambos builds (`.aab` e `.ipa`) se generan correctamente sin errores, y si el ícono y splash screen se aplican consistentemente en ambas plataformas.

**Errores comunes y soluciones**

- **Intentar generar el build de iOS sin macOS/Xcode disponible.** Requiere específicamente ese entorno; usa una máquina macOS o un runner de CI con macOS.
- **Producir manualmente cada variante de ícono por plataforma y resolución.** Usa `flutter_launcher_icons` para generarlas automáticamente.
- **Asumir que un solo pipeline elimina toda la especificidad de plataforma.** El pipeline igual necesita pasos separados de firma y distribución por tienda.

---
