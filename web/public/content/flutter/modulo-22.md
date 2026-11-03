# Módulo 22: anuncios y monetización en Flutter

## Aprende construyendo

Integra anuncios en RutaFlow con límites claros: primero configuración de plataforma y anuncios de prueba, luego formatos y mediación, consentimiento, privacidad y medición. Las reglas y requisitos del proveedor cambian; antes de publicar, vuelve a verificar las políticas oficiales y las versiones del SDK. Los ejemplos no usan IDs de producción.

---

### Tema 1: configurar AdMob y cargar el primer banner de prueba

#### Paso 1 · Objetivo y preparación
Al finalizar inicializarás Google Mobile Ads en Android/iOS y mostrarás un banner de prueba que se libera correctamente. **Prerrequisitos:** Flutter 3.38.1 o superior, widgets y ciclo `initState`/`dispose`. Crea `flutter create admob_lab` y agrega `google_mobile_ads` con `flutter pub add google_mobile_ads`.

**Ejemplo independiente:** parte de una carpeta vacía con `flutter create flutter_ads_1` y aplica solo los archivos de este tema; ejecuta después `cd flutter_ads_1` y `flutter analyze`.

#### Paso 2 · Contexto y caso real
RutaFlow muestra un banner al final de la pantalla de resumen, lejos de los controles de aceptar entrega. Un anuncio no debe cubrir botones ni provocar clics accidentales. El SDK de Flutter para anuncios móviles documenta Android e iOS; no asumas soporte web o desktop.

#### ¿Por qué es importante?
Sin los App ID nativos, el SDK puede fallar antes de construir el widget. Sin `dispose`, un banner puede conservar recursos tras salir de la pantalla. Durante el desarrollo, usa unidades de prueba oficiales.

#### Paso 3 · Teoría, modelo mental y analogía
Piensa en el SDK como un mostrador: la app inicializa la conexión, pide un anuncio y espera el resultado. `AdWidget` solo presenta el anuncio ya cargado; no garantiza que haya inventario. Un espacio vacío o `onAdFailedToLoad` son resultados que la interfaz debe tolerar.

#### Paso 4 · Demostración guiada
Configura el App ID de prueba de Android (`ca-app-pub-3940256099942544~3347511713`) en `android/app/src/main/AndroidManifest.xml` dentro de `<application>`. Para iOS, usa el App ID de prueba (`ca-app-pub-3940256099942544~1458002511`) como `GADApplicationIdentifier` en `ios/Runner/Info.plist`. Conserva estos IDs en el laboratorio; para producción usa los IDs registrados en la cuenta y revisa la guía actual. Crea `lib/test_banner.dart`:

```xml
<!-- AndroidManifest.xml, hijo de <application> -->
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-3940256099942544~3347511713" />
```

```xml
<!-- Info.plist -->
<key>GADApplicationIdentifier</key>
<string>ca-app-pub-3940256099942544~1458002511</string>
```

```dart
import 'package:flutter/material.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await MobileAds.instance.initialize();
  runApp(const MaterialApp(home: TestBannerPage()));
}

class TestBannerPage extends StatefulWidget {
  const TestBannerPage({super.key});
  @override
  State<TestBannerPage> createState() => _TestBannerPageState();
}

class _TestBannerPageState extends State<TestBannerPage> {
  BannerAd? _banner;
  bool _ready = false;

  @override
  void initState() {
    super.initState();
    final ad = BannerAd(
      // ID oficial de prueba para Android; usa el ID iOS en iOS.
      adUnitId: 'ca-app-pub-3940256099942544/9214589741',
      request: const AdRequest(),
      size: AdSize.banner,
      listener: BannerAdListener(
        onAdLoaded: (_) {
          if (!mounted) return;
          setState(() => _ready = true);
        },
        onAdFailedToLoad: (ad, error) {
          debugPrint('Banner no cargado: ${error.code}');
          ad.dispose();
        },
      ),
    );
    _banner = ad;
    ad.load();
  }

  @override
  void dispose() {
    _banner?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        body: const Center(child: Text('Resumen de la entrega')),
        bottomNavigationBar: _ready
            ? SizedBox(height: 50, child: AdWidget(ad: _banner!))
            : const SizedBox(height: 50),
      );
}
```

Usa el ID de prueba iOS `ca-app-pub-3940256099942544/2435281174` en un target iOS. Ejecuta `flutter run` en simulador/dispositivo compatible; el SDK requiere App IDs nativos aunque la unidad sea de prueba.

#### Paso 5 · Práctica guiada

**Pista:** comprueba primero que el App ID está en el archivo nativo correcto; la unidad banner no reemplaza ese identificador.
Agrega estados `cargando`, `listo` y `fallido`, y un botón “reintentar” que cree una nueva instancia después de liberar la anterior. Evita llamar `setState` si la pantalla ya se desmontó.

#### Paso 6 · Práctica independiente
Adapta el ancho con `AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize` y `LayoutBuilder`. Escribe una nota explicando qué ocurre al rotar el teléfono y cómo vuelves a cargar el tamaño correcto.


**Fallo deliberado:** Configura un ID/App ID de prueba incorrecto y lee el error de carga o inicialización. Diagnostica el mensaje y corrige la causa antes de continuar.
#### Paso 7 · Cierre y evidencia

**Evidencia de aprendizaje:** entrega el archivo y el resultado observado de las variantes correcta y fallida. El siguiente tema amplía esta habilidad hacia el siguiente punto del flujo.
Entrega los cambios nativos, el widget y una captura del anuncio de prueba. No marques integración de producción si no usaste los App IDs, consentimientos y revisión de políticas del proyecto real.

**Prueba de diagnóstico.** Quita temporalmente el App ID del Manifest: identifica el error de inicialización y restáuralo antes de seguir.

```bash
flutter analyze
flutter run
```

**Resultado esperado:** el banner de prueba aparece en Android y/o iOS compatibles; salir de la pantalla libera el recurso. **Errores comunes:** usar ID de unidad como App ID, mostrar el anuncio encima de una acción y no disponer el anuncio. Diagrama: `App ID nativo -> initialize -> load -> AdWidget -> dispose`. Fuentes oficiales: [inicio rápido AdMob Flutter](https://developers.google.com/admob/flutter/quick-start), [banners](https://developers.google.com/admob/flutter/banner).

**Proyecto propio:** `lib/ads/test_banner.dart`. **Cuándo mostrarlo:** en un espacio estable y separado de controles importantes. Evidencia de aprendizaje: entrega la captura y una nota con plataforma, estado cargado y liberación.

---

### Tema 2: elegir mediación, bidding y waterfall

#### Paso 1 · Objetivo y preparación
Al finalizar compararás demanda directa, bidding y waterfall, y escribirás una decisión de mediación que pueda revisarse. **Prerrequisitos:** Tema 1 y nociones de latencia/medición. Crea `docs/ad-mediation-decision.md`.

**Ejemplo independiente:** parte de una carpeta vacía con `flutter create flutter_ads_2` y aplica solo los archivos de este tema; ejecuta después `cd flutter_ads_2` y `flutter analyze`.

#### Paso 2 · Contexto y caso real
El equipo evalúa una sola red contra mediación de AdMob o LevelPlay. Un banner de prueba puede confirmar integración básica, pero no revela fill rate, eCPM neto, latencia ni calidad de demanda en usuarios reales.

#### ¿Por qué es importante?
Añadir redes aumenta adapters, SDKs, tamaño de app, configuración de privacidad y puntos de falla. “Más redes” por sí solo no demuestra más ingresos ni mejor experiencia.

#### Paso 3 · Teoría, modelo mental y analogía
En waterfall el servidor intenta fuentes según orden/umbrales configurados; en bidding, fuentes elegibles compiten con ofertas. Un esquema híbrido puede combinar ambas. LevelPlay y AdMob gestionan adapters e inicialización según sus guías. La decisión debe medir resultados comparables por país, formato y versión.

#### Paso 4 · Demostración guiada
Crea `docs/ad-mediation-decision.md` con esta tabla inicial:

```markdown
| Opción | Ventaja a medir | Costo/riesgo | Evidencia necesaria |
|---|---|---|---|
| AdMob sin mediación | Menos SDKs y configuración | Una fuente principal | fill, eCPM, latencia por país |
| AdMob mediation | bidding/waterfall según fuentes | adapters y revisión de compatibilidad | mismos formatos y periodo |
| Unity LevelPlay | mediación y suite de integración | SDK, adapters, privacidad y soporte | pruebas de adapters + métricas |
```

Al agregar LevelPlay al laboratorio sigue la guía vigente de `unity_levelplay_mediation`, inicializa antes de solicitar anuncios y ejecuta su Integration Test Suite. En AdMob espera a `MobileAds.instance.initialize()` y revisa el estado de cada adapter antes de sacar conclusiones. No actives dos mediadores sobre el mismo espacio publicitario.

#### Paso 5 · Práctica guiada

**Pista:** define primero una métrica y un periodo; no mezcles fill rate de una fuente con eCPM de otra.
Escribe un experimento A/B que compare versión base y mediación: misma ubicación, formato, país/segmento permitido y periodo; define cómo excluir tráfico de prueba y cómo documentar cambios de versión.

#### Paso 6 · Práctica independiente
Agrega al documento condiciones para no lanzar: adapter no inicializado, crash, aumento de latencia o caída de retención. Decide quién revisa cada proveedor y sus versiones antes de actualizar Flutter.


**Fallo deliberado:** Fuerza una fuente sin respuesta y comprueba que no se registra un falso éxito. Diagnostica el mensaje y corrige la causa antes de continuar.
#### Paso 7 · Cierre y evidencia

**Evidencia de aprendizaje:** entrega el archivo y el resultado observado de las variantes correcta y fallida. El siguiente tema amplía esta habilidad hacia el siguiente punto del flujo.
Entrega la matriz con recomendación provisional y datos faltantes. No inventes eCPM ni declares una red ganadora sin medición real de una cuenta autorizada.

**Prueba de diagnóstico.** Simula una fila sin datos de fill: explica por qué no equivale a eCPM cero ni prueba que el SDK esté roto.

```bash
flutter pub add unity_levelplay_mediation
flutter pub get
flutter analyze
```

**Resultado esperado:** documento distingue waterfall, bidding y los costos de adapters; el laboratorio compila solo en targets soportados y autorizados. **Errores comunes:** mezclar datos de prueba con producción, comparar países distintos y actualizar un adapter sin revisar requisitos. Diagrama: `solicitud -> mediador -> fuentes elegibles -> anuncio o no-fill`. Fuentes oficiales: [mediación AdMob](https://support.google.com/admob/answer/13420272?hl=en), [integración Flutter de LevelPlay](https://docs.unity.com/en-us/grow/levelplay/sdk/flutter/plugin-integration), [test suite LevelPlay](https://docs.unity.com/en-us/grow/levelplay/sdk/flutter/integration-test-suite).

**Proyecto propio:** `docs/ad-mediation-decision.md`. **Cuándo sumar mediación:** cuando el volumen permita probarla y el equipo pueda mantener SDKs/políticas. Evidencia: entrega la matriz y protocolo de medición revisable.

---

### Tema 3: banners, interstitials y anuncios recompensados

#### Paso 1 · Objetivo y preparación
Al finalizar implementarás reglas de ubicación y ciclo de vida para banner, interstitial y rewarded sin interrumpir acciones críticas. **Prerrequisitos:** Tema 1 y navegación Flutter. Crea `lib/ads/ad_policy.dart`.

**Ejemplo independiente:** parte de una carpeta vacía con `flutter create flutter_ads_3` y aplica solo los archivos de este tema; ejecuta después `cd flutter_ads_3` y `flutter analyze`.

#### Paso 2 · Contexto y caso real
RutaFlow puede mostrar banner en resumen, interstitial al terminar una sesión voluntaria y rewarded para duplicar un consejo opcional. No debe interrumpir aceptar una entrega, llamar a emergencias o seguir una ruta activa.

#### ¿Por qué es importante?
Un interstitial inesperado castiga la tarea principal. Conceder recompensa al tocar “ver video” en vez de recibir callback de recompensa permite obtener ventajas sin completar el anuncio.

#### Paso 3 · Teoría, modelo mental y analogía
Banner ocupa un espacio persistente. Interstitial ocupa la pantalla y necesita un punto natural de transición; cárgalo antes y libéralo al cerrar o fallar. Rewarded concede el beneficio solo desde `onUserEarnedReward`. Para cada formato documenta frecuencia, condición de no mostrar y respuesta si no hay anuncio.

#### Paso 4 · Demostración guiada
Escribe una política pura para poder probarla sin SDK en `lib/ads/ad_policy.dart`:

```dart
enum AdPlacement { summaryBanner, sessionEnd, routeInProgress, emergency }
enum AdFormat { banner, interstitial, rewarded }

bool canShowAd(AdPlacement placement, AdFormat format) {
  if (placement == AdPlacement.routeInProgress ||
      placement == AdPlacement.emergency) {
    return false;
  }
  if (format == AdFormat.interstitial) {
    return placement == AdPlacement.sessionEnd;
  }
  if (format == AdFormat.rewarded) {
    return placement == AdPlacement.summaryBanner;
  }
  return placement == AdPlacement.summaryBanner;
}

bool grantReward({required bool callbackReceived}) => callbackReceived;
```

Para conectar la regla con AdMob, usa `RewardedAd.load` con el ID oficial de prueba Android `ca-app-pub-3940256099942544/5224354917` (iOS: `ca-app-pub-3940256099942544/1712485313`). Al llamar `show`, delega la concesión al callback que entrega el SDK:

```dart
import 'package:google_mobile_ads/google_mobile_ads.dart';

void showRewarded(RewardedAd ad, void Function(RewardItem) onDone) {
  ad.fullScreenContentCallback = FullScreenContentCallback(
    onAdDismissedFullScreenContent: (closedAd) => closedAd.dispose(),
    onAdFailedToShowFullScreenContent: (failedAd, error) => failedAd.dispose(),
  );
  ad.show(onUserEarnedReward: (adWithoutView, reward) {
    onDone(reward); // Solo aquí se solicita otorgar la recompensa.
  });
}
```

El adapter de SDK debe llamar `grantReward` solo desde el callback de recompensa, y registrar en backend el beneficio con un ID idempotente si tiene valor compartido. Interstitial y rewarded se precargan, muestran una vez y se disponen al cerrar/fallar. Nunca bloquees la navegación si el inventario no está listo.

#### Paso 5 · Práctica guiada

**Pista:** prueba por separado el callback de cierre y el callback de recompensa; solo el segundo acredita el beneficio.
Agrega un `AdPlacement.routeInProgress` en tres pantallas distintas y demuestra que todas lo rechazan. En el cierre de sesión muestra un botón opcional y conserva la acción principal cuando el anuncio falla.

#### Paso 6 · Práctica independiente
Escribe tests de tabla para todas las combinaciones de placement/formato y callback de recompensa. Añade un límite de frecuencia local explícito y explica por qué el servidor debe ser fuente de verdad si el beneficio tiene valor real.


**Fallo deliberado:** Omite el callback de recompensa y confirma que el beneficio no se concede. Diagnostica el mensaje y corrige la causa antes de continuar.
#### Paso 7 · Cierre y evidencia

**Evidencia de aprendizaje:** entrega el archivo y el resultado observado de las variantes correcta y fallida. Como cierre del módulo, redacta el checklist de salida que usarías antes de publicar anuncios reales.
Entrega la política, adapter y tests. Registra el comportamiento de anuncio no cargado, cerrado antes de tiempo y recompensa ganada; no uses unidades live para probar.

**Prueba de diagnóstico.** Haz que el botón de rewarded llame recompensa antes de abrir el anuncio; el test debe fallar.

```bash
flutter test test/ads/ad_policy_test.dart
```

**Resultado esperado:** todos los casos sensibles deniegan anuncios y la recompensa solo se concede tras callback. **Errores comunes:** mostrar interstitial al abrir app, no liberar el objeto y depender de un callback de cierre para inferir recompensa. Diagrama: `ubicación -> política -> carga -> callback -> recompensa`. Fuentes oficiales: [banners y ciclo de vida](https://developers.google.com/admob/flutter/banner), [rewarded ads](https://developers.google.com/admob/flutter/rewarded), [políticas AdMob](https://support.google.com/admob/answer/6128543?hl=en-topic).

**Proyecto propio:** `lib/ads/ad_policy.dart` y `test/ads/ad_policy_test.dart`. **Cuándo no mostrar:** una tarea está en curso, el usuario está en riesgo o el anuncio altera una acción esencial. Evidencia: entrega los tests y un recorrido grabado con IDs de prueba.

---

### Tema 4: consentimiento, privacidad y audiencias

#### Paso 1 · Objetivo y preparación
Al finalizar actualizarás el estado de consentimiento en cada inicio y pedirás anuncios solo si el SDK y las reglas aplicables lo permiten. **Prerrequisitos:** ciclo de vida Flutter, configuración nativa y nociones de datos personales. Crea `lib/privacy/ads_consent.dart`.

**Ejemplo independiente:** parte de una carpeta vacía con `flutter create flutter_ads_4` y aplica solo los archivos de este tema; ejecuta después `cd flutter_ads_4` y `flutter analyze`.

#### Paso 2 · Contexto y caso real
Una persona puede cambiar de región o revocar consentimiento entre sesiones. RutaFlow no debe asumir que un diálogo mostrado equivale a permiso concedido ni usar identificadores de publicidad para rastrear entregas.

#### ¿Por qué es importante?
El consentimiento y las opciones dependen de jurisdicción, configuración de proveedores y audiencia. Algunas pantallas o prácticas requieren revisiones especiales para menores o contenido sensible.

#### Paso 3 · Teoría, modelo mental y analogía
El flujo UMP de Google actualiza información de consentimiento, muestra el formulario requerido y permite comprobar `canRequestAds()`. Ejecuta el chequeo en cada arranque y evita enviar solicitudes duplicadas. La app debe ofrecer un acceso para cambiar privacidad cuando corresponda; la elegibilidad técnica del SDK no reemplaza el análisis legal/político de la app.

#### Paso 4 · Demostración guiada
UMP forma parte de la API Flutter de `google_mobile_ads`; no agregues un paquete UMP separado. Implementa un coordinador de arranque y adapta el callback oficial a `Future` con `Completer`:

```dart
abstract interface class ConsentGateway {
  Future<void> refreshAtLaunch();
  Future<bool> canRequestAds();
}

class AdsStartup {
  AdsStartup(this.consent, this.initializeAds);
  final ConsentGateway consent;
  final Future<void> Function() initializeAds;
  bool _started = false;

  Future<bool> start() async {
    await consent.refreshAtLaunch();
    final allowed = await consent.canRequestAds();
    if (allowed && !_started) {
      await initializeAds();
      _started = true;
    }
    return allowed;
  }
}
```

La implementación concreta debe llamar `ConsentInformation.instance.requestConsentInfoUpdate`, luego `ConsentForm.loadAndShowConsentFormIfRequired` y consultar `canRequestAds()` antes de pedir inventario. Revisa también `getPrivacyOptionsRequirementStatus()` para ofrecer entrada visible a opciones de privacidad cuando sea requerida. No registres datos sensibles en analytics.

#### Paso 5 · Práctica guiada

**Pista:** trata fallo de consentimiento como estado desconocido; consulta `canRequestAds()` después de completar el flujo UMP.
Inyecta un fake de `ConsentGateway` con estados permitido, denegado y error. Verifica que la inicialización ocurre cero veces si está denegado y una vez si está permitido, incluso tras llamar `start()` dos veces.

#### Paso 6 · Práctica independiente
Escribe una lista de revisión de audiencia: clasificación de edad, anuncios apropiados, consentimiento parental cuando aplique, señales de solicitud y contenido sensible. Define el mecanismo de revocación y vuelve a comprobar el estado antes de futuras solicitudes.


**Fallo deliberado:** Simula error de actualización de consentimiento y comprueba que no se asume permiso. Diagnostica el mensaje y corrige la causa antes de continuar.
#### Paso 7 · Cierre y evidencia

**Evidencia de aprendizaje:** entrega el archivo y el resultado observado de las variantes correcta y fallida. El siguiente tema amplía esta habilidad hacia el siguiente punto del flujo.
Entrega la secuencia y pruebas fake; documenta países/configuración cubiertos y las decisiones que requieren revisión de privacidad. No declares cumplimiento global por haber integrado UMP.

**Prueba de diagnóstico.** Simula error al actualizar consentimiento; comprueba que la app no interpreta el error como permiso explícito.

```bash
flutter analyze
flutter test test/privacy/ads_startup_test.dart
```

**Resultado esperado:** no se inicia una solicitud sin elegibilidad; múltiples llamadas no duplican inicialización. **Errores comunes:** tratar `canRequestAds` como sustituto de política, consultar solo en la primera instalación y registrar identificadores sensibles. Fuentes oficiales: [UMP para Flutter](https://developers.google.com/admob/flutter/privacy), [políticas AdMob](https://support.google.com/admob/answer/6128543?hl=en-topic), [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/).

**Proyecto propio:** `lib/privacy/ads_consent.dart`. **Cuándo solicitar:** después de actualizar estado y mostrar formularios necesarios, respetando resultado y región. Evidencia: entrega tests de permitido, denegado, error y repetición.

---

### Tema 5: pruebas de anuncios y diagnóstico de no-fill

#### Paso 1 · Objetivo y preparación
Al finalizar separarás prueba local, validación de adapter e inventario de producción. **Prerrequisitos:** temas 1 y 2. Crea `docs/ad-test-matrix.md`.

**Ejemplo independiente:** parte de una carpeta vacía con `flutter create flutter_ads_5` y aplica solo los archivos de este tema; ejecuta después `cd flutter_ads_5` y `flutter analyze`.

#### Paso 2 · Contexto y caso real
Durante desarrollo el equipo debe revisar layouts y callbacks sin generar actividad publicitaria real. Un anuncio live pulsado por desarrolladores puede generar tráfico inválido; utiliza unidades de prueba oficiales o dispositivos de prueba configurados.

#### ¿Por qué es importante?
Una captura prueba que un anuncio se dibujó, pero no verifica límites de frecuencia, consentimiento, rotación, adapter de cada red ni política de producción.

#### Paso 3 · Teoría, modelo mental y analogía
Prueba por capas: política pura con `flutter test`; integración visual con unidades de prueba; adapters con su suite; y luego revisión controlada en entorno de cuenta. `no fill` es un resultado válido: la app debe mantener su flujo y no esperar indefinidamente.

#### Paso 4 · Demostración guiada
Crea `docs/ad-test-matrix.md`:

```markdown
| Capa | Entorno | Qué observa | Evidencia |
|---|---|---|---|
| Regla local | flutter test, sin red | ubicación/recompensa | salida de tests |
| SDK base | unidad oficial de prueba | carga, fallo, dispose | captura y log sin PII |
| Mediación | test suite del proveedor | adapter init y versión | estado de cada adapter |
| Cuenta controlada | dispositivo/cuenta autorizados | solicitud y política | fecha, país permitido, versión |
```

Al probar AdMob registra Android/iOS por separado. Para mediación revisa el estado de inicialización de cada adapter y ejecuta la suite de integración del proveedor; no confundas una unidad de prueba de AdMob con prueba de la demanda de una red externa.

#### Paso 5 · Práctica guiada

**Pista:** separa la política del SDK; fuerza no-fill en un fake antes de diagnosticar una respuesta de red real.
Fuerza `onAdFailedToLoad` en un fake y comprueba que el resumen de entrega sigue usable. Añade timeout visual que no bloquee la pantalla y un log de código de error sin correo, ruta, cliente ni coordenadas.

#### Paso 6 · Práctica independiente
Rota el dispositivo, navega fuera durante la carga, desactiva red y prueba consentimiento denegado. Registra plataforma/versión SDK y resultado observado. No publiques claves ni IDs de cuenta en capturas públicas.


**Fallo deliberado:** Fuerza no-fill o pérdida de red y confirma que el flujo de usuario sigue disponible. Diagnostica el mensaje y corrige la causa antes de continuar.
#### Paso 7 · Cierre y evidencia

**Evidencia de aprendizaje:** entrega el archivo y el resultado observado de las variantes correcta y fallida. El siguiente tema amplía esta habilidad hacia el siguiente punto del flujo.
Entrega matriz rellenada con “pasó”, “falló” o “no ejecutado” y la evidencia correspondiente. Si no hay dispositivo/cuenta/adapter, marca ese caso no ejecutado.

**Prueba de diagnóstico.** Provoca no-fill o desconexión: la acción principal debe seguir funcionando y no debe conceder recompensa.

```bash
flutter test
flutter analyze
flutter run
```

**Resultado esperado:** tests locales reproducibles y casos de SDK con plataforma/ID de prueba declarados. **Errores comunes:** usar anuncio de producción en desarrollo, concluir mediación con una captura y clasificar todo fallo como no-fill sin leer el error. Diagrama: `test local -> SDK test -> adapter suite -> cuenta controlada`. Fuentes oficiales: [anuncios de prueba](https://developers.google.com/admob/flutter/test-ads), [test suite LevelPlay](https://docs.unity.com/en-us/grow/levelplay/sdk/flutter/integration-test-suite), [política de tráfico inválido](https://support.google.com/admob/answer/3342054?hl=en).

**Proyecto propio:** `docs/ad-test-matrix.md`. **Cuándo marcar integración probada:** solo cuando la capa y plataforma se ejecutaron realmente. Evidencia: entrega matriz, logs reducidos y capturas de unidades de prueba.

---

### Tema 6: comparar AdMob, AppLovin MAX y Unity LevelPlay

#### Paso 1 · Objetivo y preparación
Al finalizar documentarás una decisión de proveedor y un plan de salida que proteja el flujo del producto. **Prerrequisitos:** temas 2 y 5. Crea `docs/ad-provider-review.md`.

**Ejemplo independiente:** parte de una carpeta vacía con `flutter create flutter_ads_6` y aplica solo los archivos de este tema; ejecuta después `cd flutter_ads_6` y `flutter analyze`.

#### Paso 2 · Contexto y caso real
RutaFlow puede comenzar sin anuncios, probar AdMob, o evaluar mediación mediante LevelPlay o AppLovin MAX. Las plataformas y adapters cambian compatibilidad, requisitos de cuenta, versiones mínimas y políticas; los SDK no son intercambiables solo porque muestren banners.

#### ¿Por qué es importante?
Un proveedor puede aumentar cobertura y también tamaño, consumo, latencia, permisos y superficie de privacidad. Si no hay fallback, una caída del proveedor puede bloquear una pantalla necesaria.

#### Paso 3 · Teoría, modelo mental y analogía
Separa tres decisiones: quién vende la demanda, quién media fuentes y qué formato/ubicación usa el producto. Una capa propia pequeña puede ocultar llamadas de carga/limpieza, pero no esconder detalles de consentimiento, adapters y callbacks que necesitan control explícito.

#### Paso 4 · Demostración guiada
Crea `docs/ad-provider-review.md` y registra fuente, rol y condición de evaluación. Para AppLovin MAX, consulta su guía oficial Flutter y verifica versión de plugin, targets y adapters antes de agregarla; para Unity, revisa `unity_levelplay_mediation` y sus redes; para AdMob, confirma SDK y unidades de prueba. No instales los tres SDK en la app de usuario como ejercicio.

```markdown
| Criterio | AdMob | AppLovin MAX | Unity LevelPlay |
|---|---|---|---|
| Rol en RutaFlow | fuente/mediación | mediación | mediación |
| Plataformas requeridas | Android/iOS | verificar guía vigente | verificar guía vigente |
| Tamaño y adapters | medir en build | medir en build | medir en build |
| Consentimiento y datos | documentar configuración | documentar configuración | documentar configuración |
| Fallback sin anuncio | conservar la UI | conservar la UI | conservar la UI |
```

Define una interfaz de dominio `AdRequestResult` con estados `loaded`, `unavailable` y `failed`; cada adapter traduce sus callbacks a esos estados y siempre libera el objeto nativo. No incluyas credenciales/IDs de cuenta en repositorio público.

#### Paso 5 · Práctica guiada

**Pista:** primero valida targets y adapters requeridos; conserva una ruta sin anuncios antes de comparar ingresos.
Simula un adapter `UnavailableAdapter` y conecta una pantalla: si no hay inventario, mantiene contenido y controles. Registra versión del SDK y adapter en un informe, sin datos del usuario.

#### Paso 6 · Práctica independiente
Completa una evaluación con criterios de política, targets, tamaño, crash rate, latencia, soporte, consentimiento y salida. Escribe cómo desactivar un proveedor en la próxima versión si cambia un requisito.


**Fallo deliberado:** Fuerza la inicialización del adapter elegido a fallar y verifica el fallback. Diagnostica el mensaje y corrige la causa antes de continuar.
#### Paso 7 · Cierre y evidencia

**Evidencia de aprendizaje:** entrega el archivo y el resultado observado de las variantes correcta y fallida. El siguiente tema amplía esta habilidad hacia el siguiente punto del flujo.
Entrega revisión comparativa con fuentes fechadas y recomendación condicionada a medición. La app no se declara monetizada ni lista para tienda hasta probar cuentas, revisión de políticas y flujo real de cada target.

**Prueba de diagnóstico.** Simula inicialización fallida del adapter elegido y demuestra que la pantalla de entrega funciona sin SDK.

```bash
flutter analyze
flutter test
```

**Resultado esperado:** un proveedor puede fallar sin impedir tarea principal; la decisión refleja costos y verificaciones pendientes. **Errores comunes:** elegir solo por eCPM promocional, ignorar límites de audiencia y no fijar/registrar versiones. Diagrama: `producto -> interfaz ads -> adapter elegido -> proveedor -> fallback`. Fuentes oficiales: [AppLovin MAX Flutter](https://developers.applovin.com/en/max/flutter/overview/integration/), [Unity LevelPlay Flutter](https://docs.unity.com/en-us/grow/levelplay/sdk/flutter/plugin-integration), [AdMob Flutter](https://developers.google.com/admob/flutter/quick-start).

**Proyecto propio:** `docs/ad-provider-review.md`. **Cuándo cambiar proveedor:** con evidencia de operación y revisión de políticas/privacidad, no solo una promesa comercial. Evidencia: entrega la matriz, prueba de fallback y lista de configuración por plataforma.

---

## Referencias oficiales consultadas

- Google [inicio rápido](https://developers.google.com/admob/flutter/quick-start), [banners](https://developers.google.com/admob/flutter/banner), [anuncios de prueba](https://developers.google.com/admob/flutter/test-ads), [consentimiento UMP](https://developers.google.com/admob/flutter/privacy), [mediación](https://developers.google.com/admob/flutter/mediation).
- Google Play [políticas de tráfico inválido](https://support.google.com/admob/answer/3342054?hl=en) y [políticas de AdMob](https://support.google.com/admob/answer/6128543?hl=en-topic).
- Unity [plugin LevelPlay Flutter](https://docs.unity.com/en-us/grow/levelplay/sdk/flutter/plugin-integration), [redes de mediación](https://docs.unity.com/en-us/grow/levelplay/sdk/flutter/mediation-networks) y [suite de integración](https://docs.unity.com/en-us/grow/levelplay/sdk/flutter/integration-test-suite).
- AppLovin [MAX para Flutter](https://developers.applovin.com/en/max/flutter/overview/integration/).
- Apple [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/).
