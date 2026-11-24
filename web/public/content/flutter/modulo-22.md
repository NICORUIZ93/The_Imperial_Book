# Módulo 22: anuncios y monetización en Flutter

## Aprende construyendo

Integra anuncios en RutaFlow con límites claros: primero configuración de plataforma y anuncios de prueba, luego formatos y mediación, consentimiento, privacidad y medición. Las reglas y requisitos del proveedor cambian; antes de publicar, vuelve a verificar las políticas oficiales y las versiones del SDK. Los ejemplos no usan IDs de producción.

---


### Tema 1: configurar AdMob y cargar el primer banner de prueba · Intermedio · 40 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar inicializarás Google Mobile Ads en Android/iOS y mostrarás un banner de prueba que se libera correctamente. Prerrequisitos: Flutter 3.38.1 o superior, widgets y ciclo initState/dispose. Crea flutter create admob_lab y agrega google_mobile_ads con flutter pub add goog…

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
flutter analyze
flutter run
```

</details>

### Tema 2: elegir mediación, bidding y waterfall · Intermedio · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar compararás demanda directa, bidding y waterfall, y escribirás una decisión de mediación que pueda revisarse. Prerrequisitos: Tema 1 y nociones de latencia/medición. Crea docs/ad-mediation-decision.md.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```markdown
| Opción | Ventaja a medir | Costo/riesgo | Evidencia necesaria |
|---|---|---|---|
| AdMob sin mediación | Menos SDKs y configuración | Una fuente principal | fill, eCPM, latencia por país |
| AdMob mediation | bidding/waterfall según fuentes | adapters y revisión de compatibilidad | mismos formatos y periodo |
| Unity LevelPlay | mediación y suite de integración | SDK, adapters, privacidad y soporte | pruebas de adapters + métricas |
```

```bash
flutter pub add unity_levelplay_mediation
flutter pub get
flutter analyze
```

</details>

### Tema 3: banners, interstitials y anuncios recompensados · Intermedio · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar implementarás reglas de ubicación y ciclo de vida para banner, interstitial y rewarded sin interrumpir acciones críticas. Prerrequisitos: Tema 1 y navegación Flutter. Crea lib/ads/ad_policy.dart.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
flutter test test/ads/ad_policy_test.dart
```

</details>

### Tema 4: pruebas de anuncios y diagnóstico de no-fill · Intermedio · 30 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar separarás prueba local, validación de adapter e inventario de producción. Prerrequisitos: temas 1 y 2. Crea docs/ad-test-matrix.md.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```markdown
| Capa | Entorno | Qué observa | Evidencia |
|---|---|---|---|
| Regla local | flutter test, sin red | ubicación/recompensa | salida de tests |
| SDK base | unidad oficial de prueba | carga, fallo, dispose | captura y log sin PII |
| Mediación | test suite del proveedor | adapter init y versión | estado de cada adapter |
| Cuenta controlada | dispositivo/cuenta autorizados | solicitud y política | fecha, país permitido, versión |
```

```bash
flutter test
flutter analyze
flutter run
```

</details>

### Tema 5: consentimiento, privacidad y audiencias · Avanzado · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar actualizarás el estado de consentimiento en cada inicio y pedirás anuncios solo si el SDK y las reglas aplicables lo permiten. Prerrequisitos: ciclo de vida Flutter, configuración nativa y nociones de datos personales. Crea lib/privacy/ads_consent.dart.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
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

```bash
flutter analyze
flutter test test/privacy/ads_startup_test.dart
```

</details>

### Tema 6: comparar AdMob, AppLovin MAX y Unity LevelPlay · Avanzado · 35 min

<details open>
<summary><strong>Capa 1 — Lectura</strong></summary>

#### ► DE QUÉ TRATA
Al finalizar documentarás una decisión de proveedor y un plan de salida que proteja el flujo del producto. Prerrequisitos: temas 2 y 4. Crea docs/ad-provider-review.md.

</details>

<details>
<summary><strong>Capa 2 — Construcción</strong></summary>

#### Código y verificación
```markdown
| Criterio | AdMob | AppLovin MAX | Unity LevelPlay |
|---|---|---|---|
| Rol en RutaFlow | fuente/mediación | mediación | mediación |
| Plataformas requeridas | Android/iOS | verificar guía vigente | verificar guía vigente |
| Tamaño y adapters | medir en build | medir en build | medir en build |
| Consentimiento y datos | documentar configuración | documentar configuración | documentar configuración |
| Fallback sin anuncio | conservar la UI | conservar la UI | conservar la UI |
```

```bash
flutter analyze
flutter test
```

</details>
