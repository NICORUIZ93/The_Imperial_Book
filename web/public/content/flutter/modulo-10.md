# Módulo 10: Theming, accesibilidad y Material/Cupertino


## Aprende construyendo

### Tema 1: ThemeData con Material 3

#### Paso 1 · Objetivo y preparación
Al finalizar vas a centralizar el `ThemeData` de RutaFlow con Material 3 y `colorSchemeSeed`, confirmando que un solo color base deriva un esquema completo coherente en toda la app. Prerrequisitos: Módulo 9 completo.

#### Paso 2 · Contexto y caso real
Distintas pantallas de RutaFlow definieron sus propios colores hardcodeados por separado — un botón "Confirmar" se ve de un azul distinto en cada pantalla, sin ninguna coherencia visual real.

#### Paso 3 · Teoría, modelo mental y analogía
Un `ThemeData` centralizado garantiza coherencia visual sin repetir configuración en cada widget; `colorSchemeSeed` deriva automáticamente un esquema completo a partir de un único color base.

**Evidencia de aprendizaje:** entrega ThemeData centralizado, desincronización por color hardcodeado detectada y corrección confirmada.
**Conceptos clave:** un único esquema de diseño centralizado, coherencia visual en toda la app.

```dart
MaterialApp(
  theme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.blue),
  darkTheme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.blue, brightness: Brightness.dark),
  themeMode: ThemeMode.system, // sigue la preferencia del sistema operativo
)
```

Definir un `ThemeData` centralizado en el punto de entrada de la app (colores, tipografía, formas de componentes) garantiza coherencia visual exacta en toda la aplicación, sin necesidad de especificar manualmente esos mismos valores repetidamente en cada widget individual; `colorSchemeSeed` genera automáticamente un esquema de colores Material 3 completo y armónico a partir de un único color base, aplicando las reglas de diseño de Material Design 3 para derivar variantes apropiadas de ese color para distintos contextos (superficies, contenedores, texto sobre cada superficie) sin que el desarrollador tenga que definir manualmente cada variante individual.

`ThemeMode.system` hace que la app siga automáticamente la preferencia de modo claro/oscuro configurada a nivel del sistema operativo del dispositivo, en vez de requerir que el usuario configure ese ajuste por separado dentro de cada app individual, una expectativa de UX cada vez más establecida en apps móviles modernas.

**Analogía:** un `ThemeData` centralizado es como un manual de identidad visual corporativa único aplicado consistentemente en toda una organización, en vez de que cada departamento defina sus propios colores y tipografías de forma independiente y potencialmente inconsistente entre sí.

**¿Por qué es importante?** Centralizar el `ThemeData` con Material 3 garantiza coherencia visual en toda la app sin repetir configuración en cada widget, y `ThemeMode.system` respeta automáticamente la preferencia de modo oscuro/claro del sistema operativo del usuario.

**Código del ejemplo:**

```dart
MaterialApp(
  theme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.blue),
  darkTheme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.blue, brightness: Brightness.dark),
  themeMode: ThemeMode.system,
)
```

**Diagrama: un color base deriva todo el esquema**

```mermaid
flowchart LR
    A["colorSchemeSeed: Colors.indigo"] --> B["ColorScheme completo\n(primary, secondary, surface...)"]
    B --> C["Cada widget de la app\nlee del Theme central"]
```

En el proyecto integrador RutaFlow, el `ThemeData` vive en `lib/core/app_theme.dart`, aplicado desde `lib/main.dart`. Límite de la decisión: no conviene centralizar en `ThemeData` un color que es intencionalmente distinto en un único lugar puntual (como un color de marca de un socio externo en una sola pantalla) — ahí definirlo localmente es correcto; `ThemeData` centraliza específicamente lo que debe ser consistente en toda la app.

#### Paso 4 · Demostración guiada desde cero
```dart
MaterialApp(
  theme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.indigo),
  darkTheme: ThemeData(useMaterial3: true, colorSchemeSeed: Colors.indigo, brightness: Brightness.dark),
  themeMode: ThemeMode.system,
)
```

**Ejecuta el ejemplo** (crea un proyecto Flutter desde cero, pega el widget en `lib/main.dart` y arráncalo en un emulador o dispositivo):

```bash
flutter create demo_flutter
cd demo_flutter
flutter run
```
Para las pruebas de widget: `flutter test`.

Resultado esperado: cada botón "Confirmar" en toda la app usa automáticamente el mismo tono derivado de `Colors.indigo`, sin que ningún widget individual especifique su propio color hardcodeado — cambiar `colorSchemeSeed` en un solo lugar actualiza el color en toda la app.

#### Paso 5 · Práctica guiada
Pista: en `DetalleEnvio`, usá `Container(color: Color(0xFF3F51B5))` con un valor hexadecimal hardcodeado para el botón de confirmar, en vez de dejar que el `Theme` central lo defina — ese es el fallo deliberado: cambiá `colorSchemeSeed` a `Colors.teal` en el `ThemeData` central, y confirmá que todos los botones de la app cambian de color excepto ese específico, que queda visualmente desincronizado del resto.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 quitando el color hardcodeado y usando `Theme.of(context).colorScheme.primary` (o el estilo por defecto de `ElevatedButton`), confirmando que ahora ese botón también sigue los cambios del `ThemeData` central.

#### Paso 7 · Cierre y evidencia
Entregá el `ThemeData` centralizado del Paso 4, la desincronización por color hardcodeado del Paso 5, y la corrección del Paso 6; explicá por qué hardcodear un color en un widget individual rompe la garantía de coherencia que `ThemeData` centralizado existe para dar. Siguiente paso: estudia cómo adaptar widgets entre Material y Cupertino. Errores comunes: hardcodear colores en widgets individuales en vez de leerlos del tema central, no definir `darkTheme` dejando la app sin un modo oscuro coherente, y no probar que `ThemeMode.system` efectivamente responde al cambio de preferencia del sistema. Fuentes oficiales: https://docs.flutter.dev/ui/design/material y https://api.flutter.dev/flutter/material/ThemeData-class.html.
**¿Por qué es importante?** Centralizar el `ThemeData` con Material 3 garantiza coherencia visual en toda la app sin repetir configuración en cada widget.

### Tema 2: Adaptación Material vs Cupertino

#### Paso 1 · Objetivo y preparación
Al finalizar vas a adaptar el botón "Confirmar entrega" para mostrar `CupertinoButton` en iOS y `ElevatedButton` en Android, detectando la plataforma en tiempo de ejecución. Prerrequisitos: Tema 1 de este módulo.

#### Paso 2 · Contexto y caso real
Un conductor que usa RutaFlow en un iPhone espera que los controles se comporten y se vean como los del resto de sus apps de iOS; mostrar siempre el mismo botón Material en ambas plataformas hace que la app se sienta genérica en iOS.

#### Paso 3 · Teoría, modelo mental y analogía
Detectar la plataforma en tiempo de ejecución y mostrar el widget correspondiente para un mismo componente lógico hace que la app se sienta nativa en cada sistema.

**Evidencia de aprendizaje:** entrega botón adaptativo, camino sin cobertura en CI detectado y override de plataforma en test confirmado.
**Conceptos clave:** detectar la plataforma y mostrar el widget nativo correspondiente.

```dart
import 'dart:io';

Widget botonAdaptativo() => Platform.isIOS
    ? CupertinoButton(child: Text('Continuar'), onPressed: () {})
    : ElevatedButton(child: Text('Continuar'), onPressed: () {});
```

Detectar la plataforma en tiempo de ejecución (`Platform.isIOS`) y mostrar el widget de diseño correspondiente (Cupertino para iOS, el conjunto de widgets que imita las convenciones visuales de Apple; Material para Android, siguiendo las convenciones de Google) para un mismo componente lógico hace que la app se sienta considerablemente menos "genérica" y más integrada en cada sistema operativo, dado que los usuarios de cada plataforma tienen expectativas visuales y de interacción específicas formadas por el uso constante de otras apps nativas de esa misma plataforma (Material en Android, Cupertino en iOS), que una app que ignora completamente esta distinción y muestra siempre el mismo estilo en ambas plataformas no cumple.

Esta decisión de "una sola base de código Dart, pero apariencia adaptada según la plataforma detectada" es exactamente la promesa central de Flutter en su forma más cuidadosamente implementada: compartir la lógica y estructura general de la app en Dart, mientras se adapta selectivamente la presentación visual de componentes específicos según las convenciones nativas esperadas de cada plataforma de destino.

**Analogía:** adaptar Material/Cupertino según la plataforma es como un guía turístico bilingüe que no solo traduce el idioma sino que también adapta sutilmente su comportamiento y protocolo según las costumbres culturales específicas de cada audiencia, resultando en una experiencia que se percibe genuinamente adaptada en vez de una traducción literal aplicada indiscriminadamente sin ninguna consideración cultural.

**¿Por qué es importante?** Adaptar Material/Cupertino según la plataforma hace que una app Flutter se sienta más nativa en cada sistema operativo, cumpliendo con las expectativas visuales y de interacción específicas que los usuarios de cada plataforma ya tienen formadas por el uso de otras apps nativas.

**Código del ejemplo:**

```dart
Platform.isIOS
    ? CupertinoButton(child: Text('Continuar'), onPressed: () {})
    : ElevatedButton(child: Text('Continuar'), onPressed: () {})
```

**Diagrama: adaptación por plataforma**

```mermaid
flowchart TD
    A["botonConfirmar()"] --> B{"Platform.isIOS?"}
    B -->|true| C["CupertinoButton.filled"]
    B -->|false| D["ElevatedButton"]
```

En el proyecto integrador RutaFlow, `botonConfirmar()` vive en `lib/features/deliveries/presentation/delivery_list_screen.dart`. Límite de la decisión: no conviene adaptar Material/Cupertino en cada widget individual de la app — eso multiplica el costo de mantenimiento; reservá la adaptación explícita para componentes de alto tránsito donde la diferencia visual realmente importa (botones primarios, navegación), y dejá que el resto use el estilo Material consistente definido en `ThemeData`.

#### Paso 4 · Demostración guiada desde cero
```dart
import 'dart:io';

Widget botonConfirmar() => Platform.isIOS
    ? CupertinoButton.filled(child: Text('Confirmar entrega'), onPressed: confirmar)
    : ElevatedButton(child: Text('Confirmar entrega'), onPressed: confirmar);
```

**Ejecuta el ejemplo** (crea un proyecto Flutter desde cero, pega el widget en `lib/main.dart` y arráncalo en un emulador o dispositivo):

```bash
flutter create demo_flutter
cd demo_flutter
flutter run
```
Para las pruebas de widget: `flutter test`.

Resultado esperado: corriendo la app en un simulador de iOS, el botón se ve como un `CupertinoButton` nativo; corriendo exactamente el mismo código Dart en un emulador de Android, el mismo botón lógico se renderiza como `ElevatedButton` con las convenciones de Material.

#### Paso 5 · Práctica guiada
Pista: envolvé ese widget condicional dentro de un widget test y corré la suite completa en CI (que corre en Linux, donde `Platform.isIOS` siempre es `false`) — ese es el fallo deliberado: el test que verifica específicamente el camino `CupertinoButton` nunca se ejecuta realmente en CI, porque `Platform.isIOS` depende del sistema operativo donde corre el test, dejando ese camino sin cobertura real.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 usando `debugDefaultTargetPlatformOverride` dentro del widget test para forzar `TargetPlatform.iOS`, confirmando que ahora el camino `CupertinoButton` sí se ejecuta y se verifica en CI sin importar el sistema operativo real.

#### Paso 7 · Cierre y evidencia
Entregá el botón adaptativo del Paso 4, el camino sin cobertura real en CI del Paso 5, y el override de plataforma en test del Paso 6; explicá por qué `Platform.isIOS` depende del sistema operativo real de ejecución, y por qué eso exige un mecanismo distinto para testear el camino Cupertino desde una máquina de CI que no es Apple. Siguiente paso: estudia Semantics y dark mode. Errores comunes: no testear ambos caminos de un widget adaptativo, asumir que el mismo estilo visual funciona igual de bien en ambas plataformas, y usar `Platform.isIOS` en código que corre en la web. Fuentes oficiales: https://docs.flutter.dev/platform-integration/ios/platform-adaptations y https://api.flutter.dev/flutter/cupertino/CupertinoButton-class.html.
**¿Por qué es importante?** Adaptar Material/Cupertino según la plataforma hace que una app Flutter se sienta más nativa en cada sistema operativo, cumpliendo las expectativas visuales que los usuarios ya tienen formadas.

### Tema 3: Accesibilidad con Semantics y dark mode

#### Paso 1 · Objetivo y preparación
Al finalizar vas a agregar `Semantics` al ícono de "eliminar envío" de RutaFlow, y a probar la pantalla explícitamente en modo oscuro para detectar contrastes insuficientes. Prerrequisitos: Tema 2 de este módulo.

#### Paso 2 · Contexto y caso real
El botón de eliminar un envío usa solo un ícono de tacho de basura sin texto visible — nadie confirmó todavía qué anuncia TalkBack o VoiceOver al llegar a ese botón, ni si el color de ese ícono sigue siendo visible en modo oscuro.

#### Paso 3 · Teoría, modelo mental y analogía
Sin `Semantics` con un `label` explícito, un lector de pantalla lee un ícono sin texto como "botón" genérico; probar ambos modos de color explícitamente revela contrastes insuficientes que no se notarían probando solo uno.

**Evidencia de aprendizaje:** entrega Semantics agregado, ícono invisible en modo oscuro detectado y corrección con color adaptativo.
**Conceptos clave:** verificación activa con el lector de pantalla real, no asunción por inspección visual.

```dart
Semantics(
  label: 'Eliminar tarea',
  button: true,
  child: IconButton(icon: Icon(Icons.delete), onPressed: eliminar),
)
```

Sin `Semantics` con un `label` explícito, TalkBack (Android) o VoiceOver (iOS) leen un ícono interactivo sin texto visible simplemente como "botón" genérico, sin ninguna indicación de qué acción específica realiza ese botón concreto; activar un lector de pantalla en la propia app y navegarla exclusivamente con gestos de accesibilidad (sin mirar directamente la pantalla) revela rápidamente estos huecos de accesibilidad de una forma que ninguna inspección puramente visual del diseño, por cuidadosa que sea, puede detectar, exactamente el mismo principio de verificación activa estudiado con TalkBack en Android (Módulo 10 de ese track) y VoiceOver en iOS (Módulo 10 de ese track), aplicado aquí de forma unificada mediante el widget `Semantics` de Flutter, que internamente se traduce hacia el mecanismo de accesibilidad nativo apropiado de cada plataforma.

```dart
final esOscuro = Theme.of(context).brightness == Brightness.dark;
```

Probar la app explícitamente en ambos modos (claro y oscuro) en un dispositivo real, en vez de asumir que "se ve bien" en un modo implica automáticamente que también se ve bien en el otro, revela problemas concretos como contrastes de color insuficientes (texto oscuro sobre fondo oscuro por un color hardcodeado que ignora el tema activo) o iconografía que se vuelve invisible o difícil de distinguir en el modo no probado explícitamente.

**Analogía:** navegar la propia app solo con un lector de pantalla activado es como intentar usar el propio producto con los ojos vendados, revelando qué tan bien funciona genuinamente para alguien que depende completamente del tacto y del sonido; probar ambos modos de color explícitamente es como revisar un documento impreso tanto en tinta clara como oscura antes de asumir que es legible en cualquiera de las dos condiciones.

**¿Por qué es importante?** Activar un lector de pantalla en la propia app revela huecos de accesibilidad que una inspección visual no puede detectar; probar ambos modos de color explícitamente revela contrastes insuficientes o iconografía invisible que no se notarían probando solo uno de los dos modos.

**Código del ejemplo:**

```dart
Semantics(label: 'Eliminar tarea', button: true, child: IconButton(icon: Icon(Icons.delete), onPressed: eliminar))
// Sin esto, TalkBack/VoiceOver leen simplemente "botón" genérico
```

**Diagrama: verificación en ambos ejes**

```mermaid
flowchart TD
    A["Botón eliminar envío"] --> B["Semantics(label: 'Eliminar envío')"]
    B --> C["TalkBack/VoiceOver anuncia la acción"]
    A --> D["Theme.of(context).colorScheme.onSurface"]
    D --> E["Visible en modo claro Y oscuro"]
```

En el proyecto integrador RutaFlow, este botón vive en `lib/features/deliveries/presentation/delivery_list_screen.dart`. Límite de la decisión: no conviene agregar un `label` de `Semantics` a un ícono puramente decorativo sin ninguna acción asociada — ahí `excludeSemantics: true` es la opción correcta, para no confundir al lector de pantalla con un elemento que no hace nada; reservá `Semantics` con `label` para elementos interactivos sin texto visible.

---

#### Paso 4 · Demostración guiada desde cero
```dart
Semantics(
  label: 'Eliminar envío',
  button: true,
  child: IconButton(icon: Icon(Icons.delete), onPressed: eliminarEnvio),
)
```

**Ejecuta el ejemplo** (crea un proyecto Flutter desde cero, pega el widget en `lib/main.dart` y arráncalo en un emulador o dispositivo):

```bash
flutter create demo_flutter
cd demo_flutter
flutter run
```
Para las pruebas de widget: `flutter test`.

Resultado esperado: activando TalkBack o VoiceOver y navegando hasta ese botón, el lector anuncia "Eliminar envío, botón" — no "botón" genérico sin ninguna indicación de qué acción realiza.

#### Paso 5 · Práctica guiada
Pista: quitá el `Semantics` y fijá el color del ícono como `Colors.grey.shade800` sin verificar el tema activo — ese es el fallo deliberado: con VoiceOver activado, el botón se anuncia genéricamente sin indicación de qué hace; y en modo oscuro, ese gris oscuro hardcodeado se vuelve casi invisible contra el fondo oscuro, aunque se veía bien en modo claro.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 restaurando el `Semantics` con su label, y reemplazando el color hardcodeado por `Theme.of(context).colorScheme.onSurface`, confirmando visualmente en un dispositivo real que el ícono es visible en ambos modos.

#### Paso 7 · Cierre y evidencia
Entregá el `Semantics` agregado del Paso 4, el ícono invisible en modo oscuro detectado en el Paso 5, y la corrección con color adaptativo del Paso 6; explicá por qué un color hardcodeado puede verse perfecto en el modo que probaste, pero fallar silenciosamente en el modo que no probaste. Siguiente paso: cerrá el módulo integrando theming, adaptación de plataforma y accesibilidad en el proyecto completo. Errores comunes: dejar íconos interactivos sin `Semantics`, hardcodear colores que ignoran el tema activo, y probar la app solo en el modo de color que coincide con la preferencia personal de quien la desarrolla. Fuentes oficiales: https://docs.flutter.dev/ui/accessibility-and-internationalization/accessibility y https://api.flutter.dev/flutter/widgets/Semantics-class.html.
**¿Por qué es importante?** Activar un lector de pantalla revela huecos de accesibilidad que una inspección visual no puede detectar; probar ambos modos de color revela contrastes insuficientes que no se notarían probando solo uno.

## Laboratorio práctico

**Objetivo del laboratorio:** construir una app con theming consistente, dark mode y accesibilidad auditada.

**Requisitos previos:** Módulo 9 completado.

| Paso | Acción | Código | Explicación |
|---|---|---|---|
| 1 | Definir un `ThemeData` con Material 3 | Ver Tema 1 | Colores y tipografía consistentes |
| 2 | Adaptar un widget según la plataforma | Ver Tema 2 | Cupertino en iOS, Material en Android |
| 3 | Agregar `Semantics` a elementos sin texto | Ver Tema 3 | Soporte de TalkBack/VoiceOver |
| 4 | Implementar dark mode completo | Ver Tema 3 | Probado en ambos modos en dispositivo real |

**Verificación:** el laboratorio se considera exitoso si el lector de pantalla describe correctamente todos los elementos interactivos sin texto visible, y si la app se ve correctamente sin contrastes insuficientes en ambos modos de color.

**Errores comunes y soluciones**

- **Repetir configuración de colores/tipografía en cada widget individual en vez de centralizarla en `ThemeData`.** Centraliza para coherencia y mantenibilidad.
- **Ignorar la distinción Material/Cupertino asumiendo que el mismo estilo funciona igual de bien en ambas plataformas.** Adapta componentes clave según la plataforma detectada.
- **Probar solo un modo de color (claro u oscuro) y asumir que el otro funciona igual.** Prueba explícitamente ambos en dispositivo real.

---
