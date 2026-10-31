# Módulo 15: Flutter Master: calidad, arquitectura y despliegue

## Aprende construyendo

### Tema 1: flutter test y WidgetTester

#### Paso 1 · Objetivo y preparación
Al finalizar vas a escribir un widget test con `WidgetTester` que confirme que `ListaEnvios` muestra "Sin envíos" cuando la lista está vacía, sin levantar un emulador. **Prerrequisitos:** Flutter estable y Dart; confirma `flutter doctor`.

#### Paso 2 · Contexto y caso real
Un cambio de UI en la pantalla de lista de envíos rompió silenciosamente el estado vacío (el texto "Sin envíos" dejó de mostrarse), y nadie lo notó hasta que un usuario reportó una pantalla en blanco — nada en el pipeline de CI lo habría detectado sin un test que monte el widget real.

#### Paso 3 · Teoría, modelo mental y analogía
`WidgetTester` simula un usuario interactuando con el árbol de widgets en memoria, sin necesitar un dispositivo o emulador real; `pump()` avanza un frame, permitiendo verificar el estado exacto del árbol en cualquier punto. La analogía: un maniquí de pruebas que reacciona exactamente como un usuario real, pero en un entorno de laboratorio controlado y repetible.

#### Paso 4 · Demostración guiada
**Desde cero:** parte de una carpeta vacía, ejecuta el comando que aparece debajo y escribe `test/lista_envios_test.dart` con el contenido de este tema.
```bash
flutter create ejemplo
```


Guarda la prueba en `test/lista_envios_test.dart` del proyecto Flutter que contiene `ListaEnvios` (implementación disponible en `examples/flutter-testing/lib/buscador_envios.dart`). Importa `package:flutter/material.dart`, `package:flutter_test/flutter_test.dart` y el archivo de tu widget; coloca `testWidgets` dentro de `void main()`. Ejecuta `flutter test test/lista_envios_test.dart` desde la carpeta que contiene `pubspec.yaml`.

```dart
testWidgets('muestra "Sin envíos" cuando la lista está vacía', (tester) async {
  await tester.pumpWidget(const MaterialApp(home: ListaEnvios(envios: [])));
  expect(find.text('Sin envíos'), findsOneWidget);
});
```
```bash
flutter test
```
Resultado esperado: el test pasa en verde, confirmando que el texto "Sin envíos" aparece exactamente cuando la lista está vacía, sin necesidad de ningún emulador corriendo.

**Fallo deliberado:** cambia la aserción a `expect(find.text('Sin envíos'), findsNothing)` sin tocar el widget real. El test ahora falla porque SÍ encuentra el texto, confirmando que el test original estaba verificando correctamente lo que el widget realmente hace; restaura la aserción original antes de continuar.

#### Paso 5 · Práctica guiada
Pista: antes de corregir, lee el mensaje de fallo completo (`Expected: no matching nodes... Actual: ...`) — confirma que el framework te dice exactamente qué encontró, no solo que algo falló.

#### Paso 6 · Práctica independiente
Agrega un segundo test que confirme que, con al menos un envío en la lista, el texto "Sin envíos" NO aparece (`findsNothing`), cubriendo ambos estados del mismo widget.

#### Paso 7 · Cierre
Entrega el test del estado vacío del Paso 4, la aserción invertida del Paso 5, y el segundo test del estado con datos del Paso 6; explica por qué `WidgetTester` permite verificar el árbol de widgets sin el costo de un emulador real. Como siguiente paso, usa `pumpAndSettle` para probar interacciones asíncronas e integration tests de extremo a extremo. Errores comunes: usar `tester.pump()` una sola vez para un widget con animaciones o datos asíncronos que necesitan varios frames; probar implementación interna (variables privadas) en vez del resultado visible para el usuario. Fuentes oficiales: https://docs.flutter.dev/testing/overview y https://api.flutter.dev/flutter/flutter_test/WidgetTester-class.html.

**¿Por qué es importante?** Un widget test confirma el comportamiento visible real del árbol de widgets sin el costo de un emulador, detectando regresiones de UI antes de que lleguen a producción.

**Conceptos clave:** WidgetTester, pump(), árbol de widgets en memoria, testWidgets.

**Transferencia al proyecto integrador «Aplicación móvil del repartidor»:** Añade pruebas del estado vacío y con entregas de la lista real. Cambia temporalmente el texto o la condición de vacío y verifica que el test detecta la regresión visible.

**Límites y decisión de uso:** Un widget test verifica comportamiento en el entorno de prueba, pero no la cámara, permisos ni integración completa del dispositivo. Combínalo con pruebas de integración para esas fronteras, como distingue la [documentación de Flutter](https://docs.flutter.dev/testing/overview).

### Tema 2: pumpAndSettle, golden e integration tests

#### Paso 1 · Objetivo y preparación
Al finalizar vas a usar `pumpAndSettle()` para esperar a que una animación de carga termine antes de verificar el resultado, y vas a reproducir el fallo clásico de un test que verifica demasiado pronto. **Prerrequisitos:** Tema 1 de este módulo.

#### Paso 2 · Contexto y caso real
Un test que verifica el resultado de una búsqueda de envíos justo después de disparar la búsqueda (sin esperar a que la animación de carga termine) falla intermitentemente: a veces el spinner todavía está en pantalla cuando el test ya está verificando el resultado final.

#### Paso 3 · Teoría, modelo mental y analogía
`pumpAndSettle()` avanza frames repetidamente hasta que no quede ninguna animación o frame pendiente, aproximando lo que un usuario real experimentaría esperando a que la pantalla "se asiente"; si algo mantiene la UI en animación perpetua, `pumpAndSettle()` nunca termina y el test falla por timeout. La analogía: esperar a que una escena termine de moverse antes de tomar la fotografía, en vez de disparar el obturador a mitad del movimiento.

#### Paso 4 · Demostración guiada
Copia el ejemplo independiente con Widget, fake inyectable y pruebas completos:
```bash
cp -R examples/flutter-testing ejemplo-flutter-testing
cd ejemplo-flutter-testing
flutter pub get
flutter gen-l10n
flutter test test/buscador_envios_test.dart
```
Crea o inspecciona `test/buscador_envios_test.dart`:
```dart
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:academia_flutter_testing/buscador_envios.dart';
void main() {
  testWidgets('respuesta controlada después de mostrar carga', (tester) async {
    final respuesta = Completer<String>();
    await tester.pumpWidget(MaterialApp(home: BuscadorEnvios(buscar: (_) => respuesta.future)));
    await tester.enterText(find.byType(TextField), 'RF-4471');
    await tester.tap(find.byIcon(Icons.search));
    await tester.pump();
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
    expect(find.text('Envío RF-4471'), findsNothing);
    respuesta.complete('Envío RF-4471');
    await tester.pump(); // Procesa el Future completado y el cambio de estado.
    await tester.pumpAndSettle(); // Ahora solo esperamos frames/animaciones pendientes.
    expect(find.byType(CircularProgressIndicator), findsNothing);
    expect(find.text('Envío RF-4471'), findsOneWidget);
  });
  testWidgets('error de consulta se muestra y permite reintentar', (tester) async {
    await tester.pumpWidget(MaterialApp(home: BuscadorEnvios(buscar: (_) async => throw StateError('sin red'))));
    await tester.tap(find.byIcon(Icons.search));
    await tester.pumpAndSettle();
    expect(find.text('No se pudo cargar'), findsOneWidget);
    expect(tester.widget<IconButton>(find.byType(IconButton)).onPressed, isNotNull);
  });
  testWidgets('lista vacía tiene texto visible', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: ListaEnvios(envios: [])));
    expect(find.text('Sin envíos'), findsOneWidget);
  });
}
```
**Resultado esperado:** primero hay un spinner y no hay resultado; después de completar explícitamente el Future, aparece RF-4471. `pumpAndSettle` solo espera frames programados; no es una espera universal de red. Si se invoca mientras sigue el spinner indeterminado y el Future nunca responde, falla por timeout. La API y la UI se controlan por separado.

**Fallo deliberado:** omite `respuesta.complete(...)`: la aserción del resultado falla (o pumpAndSettle agota su timeout). Restaura la respuesta y verifica el test verde. No dependemos de que una carrera falle de manera intermitente.

#### Paso 5 · Práctica guiada
Pista: coloca la aserción del resultado ANTES de `respuesta.complete`. El fallo deliberado debe ser determinista porque aún no hay respuesta. Luego completa, bombea y verifica éxito. Compara esto con una animación finita de duración conocida, donde `pump(Duration(...))` controla el tiempo virtual sin simular red.

#### Paso 6 · Práctica independiente
Agrega un test que complete el Future con error y otro que desmonte el widget antes de responder. Verifica mensaje recuperable y ausencia de setState después de dispose. Conserva golden e integration tests como capas distintas: los primeros comparan píxeles con entorno fijado y los segundos recorren la app en un dispositivo.

#### Paso 7 · Cierre
Entrega el test con `pumpAndSettle()` del Paso 4, la falla intermitente con `pump()` único del Paso 5, y el caso de animación infinita del Paso 6; explica por qué una falla intermitente en un test (no un fallo consistente) suele señalar una sincronización asíncrona faltante, no un bug aleatorio real. Como siguiente paso, mide el rendimiento de una lista con `RepaintBoundary` y Keys correctas. Errores comunes: usar un único `pump()` para estados asíncronos que necesitan varios frames; aplicar `pumpAndSettle()` a una pantalla con una animación intencionalmente infinita, sin un timeout explícito. Fuentes oficiales: https://docs.flutter.dev/cookbook/testing/widget/introduction y https://docs.flutter.dev/testing/integration-tests.

**¿Por qué es importante?** `pumpAndSettle()` evita fallas intermitentes esperando explícitamente a que la UI se estabilice, pero falla por timeout ante animaciones genuinamente infinitas — una limitación que hay que conocer, no un bug.

**Conceptos clave:** pumpAndSettle(), estabilización de frames, falla intermitente como señal de sincronización faltante.

**Transferencia al proyecto integrador «Aplicación móvil del repartidor»:** Controla la respuesta del repositorio durante la búsqueda de una guía. Avanza el reloj del test y verifica carga, resultado y error sin depender de una petición real o de esperas indefinidas.

### Tema 3: Rendimiento, RepaintBoundary y Keys

#### Paso 1 · Objetivo y preparación
Al finalizar vas a medir con DevTools cuántos widgets se repintan al actualizar un ítem de una lista de envíos, y vas a reducirlo con `RepaintBoundary` y una `Key` correcta. **Prerrequisitos:** Tema 2 de este módulo.

#### Paso 2 · Contexto y caso real
Una lista de 100 envíos pierde frames notablemente al marcar uno solo como "entregado" — el ítem actualizado se repinta correctamente, pero el profiler muestra que TODA la lista se repintó también, sin ninguna razón visible para el usuario.

#### Paso 3 · Teoría, modelo mental y analogía
Sin `RepaintBoundary`, una región que cambia puede forzar el repintado de widgets vecinos que comparten la misma capa de pintura; sin una `Key` estable por ítem, Flutter puede confundir la identidad de los widgets al reordenar una lista, reconstruyendo más de lo necesario. La analogía: pintar una sola ventana de un edificio sin afectar a las demás (RepaintBoundary), frente a repintar todo el edificio porque no quedó claro cuál ventana específica cambió.

#### Paso 4 · Demostración guiada

Aplica el siguiente bloque en el método `build` de `lib/presentation/lista_envios.dart`, donde ya existen `envios` y `TarjetaEnvio`. Desde la raíz del proyecto ejecuta `flutter run --profile` en un dispositivo físico; abre DevTools y compara los repintados antes y después de actualizar un envío.

```dart
ListView.builder(
  itemCount: envios.length,
  itemBuilder: (context, i) => RepaintBoundary(
    key: ValueKey(envios[i].id),
    child: TarjetaEnvio(envio: envios[i]),
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

Resultado esperado: el DevTools Performance overlay muestra, al marcar un envío como entregado, que solo el `RepaintBoundary` de ESE ítem se repinta (resaltado en el overlay de "repaint rainbow"), no la lista completa.

**Fallo deliberado:** quita `RepaintBoundary` y cambia `ValueKey(envios[i].id)` por `ValueKey(i)` (el índice, no el id real). Al marcar un envío como entregado (lo que puede reordenar la lista, moviendo los entregados al final), Flutter asocia el estado visual al ÍNDICE, no al envío real, y el checkbox de "entregado" aparece marcado en la fila equivocada tras el reordenamiento.

#### Paso 5 · Práctica guiada
Pista: medí con el profiler ANTES de aplicar cualquier corrección — sin una medición base, no podés confirmar después que la corrección realmente redujo el trabajo de repintado.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 restaurando `RepaintBoundary` y `ValueKey(envios[i].id)` (el id real, estable entre reordenamientos), y medí con el profiler de DevTools el conteo de widgets repintados antes y después, documentando la diferencia numérica.

#### Paso 7 · Cierre
Entrega la lista con `RepaintBoundary`/`Key` correcta del Paso 4, el checkbox en la fila equivocada del Paso 5, y la medición comparada del Paso 6; explica por qué medir con el profiler antes de optimizar evita invertir esfuerzo en un problema que no es el cuello de botella real. Como siguiente paso, aislá el dominio de negocio con Clean Architecture. Errores comunes: usar el índice de una lista como Key en vez de un identificador estable del dato real; optimizar con RepaintBoundary sin medir primero cuál widget realmente se repinta de más. Fuentes oficiales: https://docs.flutter.dev/perf/best-practices y https://api.flutter.dev/flutter/widgets/RepaintBoundary-class.html.

**¿Por qué es importante?** Medir con el profiler antes de optimizar evita invertir esfuerzo en un problema que no es el cuello de botella real; una Key basada en índice en vez de identidad real produce bugs de estado visual asociado a la fila equivocada.

**Conceptos clave:** RepaintBoundary, Key por identidad real vs índice, profiler antes de optimizar.

**Transferencia al proyecto integrador «Aplicación móvil del repartidor»:** Mide repintado y estado de filas al completar y reordenar entregas. Una fila debe conservar su identidad por guía; compara la medición antes y después de introducir límites de repintado.

### Tema 4: Clean Architecture

#### Paso 1 · Objetivo y preparación
Al finalizar vas a estructurar el dominio de envíos en capas (`domain`, `application`, `data`) con dependencias que solo apuntan hacia adentro, y vas a reproducir el error de que `domain` dependa de un detalle de infraestructura. **Prerrequisitos:** Tema 3 de este módulo.

#### Paso 2 · Contexto y caso real
El equipo necesita cambiar el cliente HTTP (`Dio` por otro) sin tocar ninguna regla de negocio sobre cuándo un envío puede marcarse como entregado — si esa regla está mezclada con código de `Dio`, cambiar el cliente HTTP obliga a tocar y volver a probar la lógica de negocio también.

#### Paso 3 · Teoría, modelo mental y analogía
Clean Architecture organiza el código en capas concéntricas donde las dependencias solo pueden apuntar hacia el centro (`domain`): la capa de dominio no conoce ningún detalle de infraestructura (HTTP, base de datos, UI), mientras que las capas externas sí pueden depender del dominio. La analogía: cada capa es un puesto de aduana con un contrato — el centro nunca necesita saber cómo llegó la mercadería desde afuera.

#### Paso 4 · Demostración guiada
**Desde cero:** parte de una carpeta vacía, ejecuta el comando que aparece debajo y escribe `lib/domain/envio.dart` con el contenido de este tema.
```bash
flutter create ejemplo
```

**Crea** el archivo `lib/domain/envio.dart` y pega en él el código mostrado a continuación; guárdalo antes de ejecutarlo.

```dart
// lib/domain/envio.dart — SIN ningún import de Dio, http, ni UI
class Envio { final String id; final String estado; Envio(this.id, this.estado); }
abstract class EnvioRepository { Future<Envio> obtener(String id); }

// lib/application/marcar_entregado.dart
class MarcarEntregadoUseCase {
  final EnvioRepository repo;
  MarcarEntregadoUseCase(this.repo);
}
```
```bash
flutter test
```
Resultado esperado: `flutter test` pasa sin que el paquete `dio` (ni ningún plugin de plataforma) aparezca como dependencia de `lib/domain/`, confirmando que la regla de negocio es independiente de cómo se obtienen los datos.

**Fallo deliberado:** importa `package:dio/dio.dart` directamente dentro de `lib/domain/envio.dart` "para simplificar y hacer la petición ahí mismo". Ahora el dominio depende de un detalle de infraestructura específico, y cambiar `Dio` por otro cliente HTTP en el futuro obligaría a modificar y volver a probar la clase `Envio` también, exactamente el acoplamiento que Clean Architecture existe para evitar.

#### Paso 5 · Práctica guiada
Pista: ejecutá `flutter analyze` o buscá manualmente `import 'package:dio` dentro de `lib/domain/` — esa búsqueda por sí sola es una forma simple de verificar la regla de dependencias sin herramientas adicionales.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 quitando el import de `dio` del dominio, implementando `EnvioRepository` con `Dio` en una clase de la capa `data` (no `domain`), y agrega un test que instancie `MarcarEntregadoUseCase` con un repositorio falso (sin ningún HTTP real), confirmando que la lógica de negocio se prueba completamente aislada de la infraestructura.

#### Paso 7 · Cierre
Entrega las capas separadas del Paso 4, la dependencia de `Dio` filtrada al dominio del Paso 5, y el test aislado con repositorio falso del Paso 6; explica por qué la dirección de las dependencias (siempre hacia el centro) es lo que realmente define Clean Architecture, no solo tener carpetas con esos nombres. Como siguiente paso, hacé que esos textos sean traducibles con internacionalización completa. Errores comunes: crear carpetas `domain`/`application`/`data` sin hacer cumplir realmente la dirección de dependencias; agregar capas ceremoniales a un proyecto tan simple que no las necesita. Fuentes oficiales: https://docs.flutter.dev/app-architecture/guide y https://docs.flutter.dev/app-architecture/case-study.

**¿Por qué es importante?** La dirección de las dependencias (siempre hacia el dominio, nunca al revés) es lo que permite cambiar infraestructura sin tocar ni volver a probar la lógica de negocio.

**Conceptos clave:** domain/application/data, dirección de dependencias, repositorio abstracto, aislamiento de infraestructura.

**Transferencia al proyecto integrador «Aplicación móvil del repartidor»:** Extrae confirmar entrega como caso de uso independiente de widgets. Prueba reglas con un repositorio falso y conserva una prueba de interfaz que demuestre que la pantalla presenta el fallo de dominio.

### Tema 5: Internacionalización completa

#### Paso 1 · Objetivo y preparación
Al finalizar vas a traducir la pantalla de estado de un envío al español y al inglés con archivos `.arb`, y vas a reproducir el error de una clave de traducción faltante en un idioma. **Prerrequisitos:** Tema 4 de este módulo.

#### Paso 2 · Contexto y caso real
RutaFlow planea operar en una región con usuarios que hablan español e inglés; el texto del estado de un envío ("En ruta", "Entregado") está hardcodeado directamente en los widgets, haciendo imposible mostrarlo en otro idioma sin tocar el código de cada pantalla.

#### Paso 3 · Teoría, modelo mental y analogía
Flutter genera clases de localización tipadas a partir de archivos `.arb` (uno por idioma), reemplazando strings hardcodeados por llamadas a `AppLocalizations.of(context)`; el formato de fechas, números y plurales también depende de la configuración regional (`Locale`), no solo de traducir palabra por palabra. La analogía: traducir un contrato no es reemplazar palabras una por una, sino adaptar el formato completo (fechas, moneda, pluralización) a las convenciones de cada idioma.

#### Paso 4 · Demostración guiada
**Desde cero:** parte de una carpeta vacía, ejecuta el comando que aparece debajo y escribe `l10n.yaml` con el contenido de este tema.
```bash
flutter create ejemplo
```

**Crea** el archivo `l10n.yaml` y pega en él el código mostrado a continuación; guárdalo antes de ejecutarlo.

Usa `examples/flutter-testing` como proyecto independiente. Incluye `l10n.yaml`, `flutter.generate: true`, dependencia flutter_localizations del SDK, intl y `lib/main.dart` con delegates/supportedLocales. Ejecuta desde esa carpeta `flutter pub get`, `flutter gen-l10n` y `flutter test test/l10n_test.dart`: debe comprobar español e inglés.

Archivo `lib/l10n/app_es.arb`:

```json
{ "estadoEnRuta": "En ruta" }
```
Archivo `lib/l10n/app_en.arb`:

```json
{ "estadoEnRuta": "In transit" }
```
```dart
Text(AppLocalizations.of(context)!.estadoEnRuta)
```
```bash
flutter gen-l10n
```
Resultado esperado: `flutter gen-l10n` genera la clase `AppLocalizations`, y la app muestra "En ruta" o "In transit" automáticamente según el `Locale` del dispositivo, sin ningún `if` manual de idioma en el widget.

**Fallo deliberado:** agrega la clave `estadoEntregado` solo a `app_es.arb`, sin agregarla a `app_en.arb`. Al correr la app con el locale en inglés, Flutter no encuentra la clave `estadoEntregado` para ese idioma; según la configuración del proyecto, esto produce un error en tiempo de compilación de `flutter gen-l10n` o un texto de respaldo en tiempo de ejecución, nunca una traducción silenciosamente correcta.

#### Paso 5 · Práctica guiada
Pista: corré `flutter gen-l10n` inmediatamente después de agregar la clave a un solo archivo — el error (o la advertencia) aparece ahí mismo, antes de siquiera correr la app.

#### Paso 6 · Práctica independiente
Corregí el Paso 5 agregando `estadoEntregado` también a `app_en.arb`, y agrega un test que recorra todas las claves de `app_es.arb` confirmando que cada una tiene su equivalente en `app_en.arb`, para detectar claves faltantes automáticamente en CI en vez de descubrirlas manualmente.

#### Paso 7 · Cierre
Entrega las traducciones funcionando del Paso 4, la clave faltante en un idioma del Paso 5, y el test de paridad de claves del Paso 6; explica por qué verificar automáticamente que ambos archivos `.arb` tengan las mismas claves evita descubrir una traducción faltante recién en producción. Como siguiente paso, generá y firmá el artefacto de build final. Errores comunes: agregar una clave de traducción a un solo idioma sin verificar los demás; formatear fechas o números manualmente en vez de usar las utilidades de `intl` sensibles al `Locale`. Fuentes oficiales: https://docs.flutter.dev/ui/accessibility-and-internationalization/internationalization y https://pub.dev/packages/intl.

**¿Por qué es importante?** Una clave de traducción faltante en un idioma produce un error detectable (en build o en runtime), nunca una traducción silenciosamente incorrecta — pero solo si algo (un test de paridad) la busca activamente.

**Conceptos clave:** archivos .arb, AppLocalizations, Locale, paridad de claves entre idiomas.

**Transferencia al proyecto integrador «Aplicación móvil del repartidor»:** Localiza conteos, fechas y mensajes de error de la ruta. Prueba idioma alternativo y texto ampliado, verificando que ninguna traducción modifica el código de estado enviado al backend.

**Límites y decisión de uso:** Traducir cadenas no resuelve formato de fechas, pluralización, lectura RTL ni espacio disponible. Prueba datos reales de cada locale y mantén fechas e identificadores de transporte independientes de su presentación traducida.

### Tema 6: Builds, firma y despliegue

#### Paso 1 · Objetivo y preparación
Al finalizar generarás y verificarás un APK de laboratorio firmado explícitamente. **Prerrequisitos:** proyecto Flutter Android, JDK con `keytool` y Android SDK Build Tools con `apksigner` en PATH; confirma `flutter doctor` y `apksigner version`. No necesitas publicar nada en una tienda para esta práctica.

#### Paso 2 · Contexto y caso real
**¿Por qué es importante?** Crear un keystore no cambia la firma del build: Gradle debe seleccionarlo. Un equipo puede producir un APK release que todavía usa la configuración debug si no revisa esa asociación. La comprobación útil es inspeccionar el certificado del artefacto, no confiar en su nombre.

#### Paso 3 · Teoría, modelo mental y analogía
La firma identifica al emisor del artefacto. **Analogía:** fabricar un sello no implica haberlo usado sobre el paquete. Distingue clave de subida y clave de firma de la aplicación cuando utilices Play App Signing: no son necesariamente la misma. Las claves debug no son adecuadas para publicación. La recuperación de una clave de subida y la pérdida de una clave de firma autogestionada tienen consecuencias distintas; no afirmes que cualquier pérdida es irreversible. Fuente oficial: [firma de aplicaciones Android](https://developer.android.com/studio/publish/app-signing).

#### Paso 4 · Demostración guiada
**Desde cero:** parte de una carpeta vacía, ejecuta el comando que aparece debajo y escribe `src/ejemplo.dart` con el contenido de este tema.
```bash
flutter create ejemplo
```

En una copia de laboratorio, crea una clave fuera del repositorio; `keytool` solicita contraseña y datos de certificado interactivamente:

```bash
keytool -genkeypair -keystore "$HOME/rutaflow-upload-lab.jks" \
  -storetype JKS -alias rutaflow-lab -keyalg RSA -keysize 2048 -validity 10000
```

Guarda la configuración local en `android/key.properties`, con tu ruta absoluta y los valores elegidos:

```properties
storeFile=/ruta/absoluta/rutaflow-upload-lab.jks
storePassword=REEMPLAZAR_LOCALMENTE
keyAlias=rutaflow-lab
keyPassword=REEMPLAZAR_LOCALMENTE
```

Excluye `android/key.properties`, `*.jks` y `*.keystore` en `.gitignore`. En `android/app/build.gradle.kts`, conserva el bloque plugins y la configuración existente. Añade el import al principio y carga las propiedades después de plugins:

```kotlin
import java.util.Properties

// Después del bloque plugins existente:
val signingProperties = Properties().apply {
    rootProject.file("key.properties").inputStream().use { load(it) }
}
```

Dentro del bloque `android`, configura la firma y reemplaza la asignación debug del release; no dupliques el bloque release existente:

```kotlin
signingConfigs {
    create("release") {
        storeFile = file(requireNotNull(signingProperties.getProperty("storeFile")))
        storePassword = requireNotNull(signingProperties.getProperty("storePassword"))
        keyAlias = requireNotNull(signingProperties.getProperty("keyAlias"))
        keyPassword = requireNotNull(signingProperties.getProperty("keyPassword"))
    }
}
buildTypes {
    release {
        signingConfig = signingConfigs.getByName("release")
    }
}
```

El archivo ausente o una propiedad omitida deben fallar explícitamente. No añadas una recuperación que firme silenciosamente con debug. Consulta las variantes Kotlin/Groovy de la [guía Flutter de despliegue Android](https://docs.flutter.dev/deployment/android).

```bash
flutter build apk --release
apksigner verify --verbose --print-certs build/app/outputs/flutter-apk/app-release.apk
keytool -list -v -keystore "$HOME/rutaflow-upload-lab.jks" -alias rutaflow-lab
```

**Resultado esperado:** verificación exitosa y la misma huella SHA-256 en el certificado del APK y en el alias del keystore. `apksigner` comprueba esquemas de firma de APK; no sustituyas esta comprobación por verificar únicamente el contenedor JAR. Fuente oficial: [apksigner](https://developer.android.com/tools/apksigner).

**Fallo deliberado:** cambia temporalmente `keyAlias` por un alias inexistente. El build debe fallar; restaura el valor y vuelve a verificar el certificado. Este error local demuestra que Gradle usa la configuración sin publicar un artefacto incorrecto.

#### Paso 5 · Práctica guiada
Pista: compara huellas completas, no solo el nombre del certificado. Registra el mensaje del alias inexistente y explica qué propiedad identifica la entrada dentro del keystore.

#### Paso 6 · Práctica independiente
Incrementa la versión del laboratorio y prueba actualizar una instalación firmada con la misma clave. Comprueba que conserva sus datos. Documenta custodia y recuperación sin incluir contraseñas ni claves privadas en la evidencia.

#### Paso 7 · Cierre
Entrega las salidas de verificación, el fallo y su corrección. Como siguiente paso, prepara una distribución interna siguiendo los requisitos de la tienda elegida. **Errores comunes:** generar una clave sin conectarla a Gradle, confundir claves de subida y distribución, subir secretos al repositorio y asumir que un build release ya implica una firma correcta.

**Transferencia al proyecto integrador «Aplicación móvil del repartidor»:** Genera una versión firmada para distribución interna y registra su certificado y número de build. Prueba actualización sobre una instalación con cambios offline pendientes sin publicar claves ni contraseñas.

**Límites y decisión de uso:** Esta prueba acredita configuración y firma del APK local. No sustituye los requisitos de publicación, custodia, recuperación y pruebas en dispositivos de una distribución real.

## Trazabilidad de la auditoría original

- **Pruebas en Flutter**: cubierto en los Temas 1 (WidgetTester) y 2 (pumpAndSettle, golden e integration tests) de este módulo.
- **Rendimiento en Flutter**: cubierto en el Tema 3 (RepaintBoundary y Keys) de este módulo.
- **Clean Architecture**: cubierto en el Tema 4 de este módulo.
- **Internacionalización**: cubierto en el Tema 5 de este módulo.
- **Despliegue**: cubierto en el Tema 6 (builds, firma y despliegue) de este módulo.
